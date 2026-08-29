const { URL } = require("node:url");
const { createLogger } = require("../../core/logger");
const {
  MAX_BLUEPRINT_BYTES,
  validateBlueprintUpload,
} = require("../../../modules/validators/blueprintValidator");

const logger = createLogger("DUNE API");
const RETRYABLE_STATUS_CODES = new Set([408, 425, 429, 500, 502, 503, 504]);

class DuneConsoleClient {
  constructor(baseUrl) {
    if (!baseUrl)
      throw new Error(
        "CONSOLE_URL is required to create a Dune console client.",
      );

    this.baseUrl = new URL(baseUrl).toString();
    this.sessionCookie = null;
    this.csrfToken = null;
    this.password = null;
    this.reauthPromise = null;
  }

  async getAuthState() {
    const response = await this.request("GET", "/api/auth/state");
    this.csrfToken =
      response.csrfToken ?? response.csrf ?? response.token ?? this.csrfToken;
    return response;
  }

  async login(password) {
    if (!password)
      throw new Error("A Dune console password is required to log in.");
    this.password = password;

    const response = await this.request("POST", "/api/auth/login", {
      authenticate: false,
      body: { password },
      includeCsrf: false,
      captureSession: true,
      retryAuth: false,
    });

    if (!this.sessionCookie) {
      throw new Error(
        "Login succeeded without returning an asc_session cookie.",
      );
    }

    await this.getAuthState();
    if (!this.csrfToken)
      throw new Error("The console did not provide a CSRF token after login.");

    return response;
  }

  async logout() {
    try {
      return await this.request("POST", "/api/auth/logout", {
        body: {},
        retryAuth: false,
      });
    } finally {
      this.sessionCookie = null;
      this.csrfToken = null;
    }
  }

  async uploadBlueprint(playerId, attachment) {
    if (!attachment?.url || !attachment?.name)
      throw new Error("A valid blueprint attachment is required.");
    if (!Number.isFinite(Number(playerId)) || Number(playerId) <= 0)
      throw new Error("A valid linked player ID is required.");

    if (attachment.size > MAX_BLUEPRINT_BYTES)
      throw new Error("Blueprint files must be 32 MB or smaller.");

    const fileResponse = await fetch(attachment.url);
    if (!fileResponse.ok)
      throw new Error(
        `Unable to download the uploaded blueprint (HTTP ${fileResponse.status}).`,
      );
    const fileBuffer = Buffer.from(await fileResponse.arrayBuffer());
    validateBlueprintUpload(attachment, fileBuffer);

    const form = new FormData();
    form.set("player_id", String(playerId));
    form.set(
      "file",
      new Blob([fileBuffer], { type: "application/json" }),
      attachment.name,
    );
    return this.requestMultipart("POST", "/api/blueprints/import", form);
  }

  async request(method, route, options = {}) {
    const {
      authenticate = true,
      includeCsrf = method !== "GET" && method !== "HEAD",
      query,
      body,
      captureSession = false,
      retryAuth = true,
    } = options;
    const url = new URL(route, this.baseUrl);

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== null)
          url.searchParams.set(key, String(value));
      }
    }

    const headers = { Accept: "application/json" };
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (authenticate && this.sessionCookie) headers.Cookie = this.sessionCookie;
    if (includeCsrf && this.csrfToken) headers["x-csrf-token"] = this.csrfToken;

    const startedAt = Date.now();
    logger.debug(`${method} ${route} requested.`, {
      query: query ? Object.keys(query) : [],
      hasBody: body !== undefined,
      authenticated: authenticate,
    });
    let response;
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        response = await fetch(url, {
          method,
          headers,
          body: body === undefined ? undefined : JSON.stringify(body),
          signal: AbortSignal.timeout(30_000),
        });
        if (!RETRYABLE_STATUS_CODES.has(response.status) || attempt === 3)
          break;
        logger.warn(
          `${method} ${route} returned temporary HTTP ${response.status}; retrying (${attempt}/3).`,
        );
      } catch (error) {
        if (attempt === 3) {
          logger.error(
            `${method} ${route} network request failed after ${Date.now() - startedAt}ms.`,
            error,
          );
          throw new DuneConsoleApiError(
            `Console API network request failed: ${error.message}`,
            0,
            {
              cause: error.code ?? error.name,
            },
          );
        }
        logger.warn(
          `${method} ${route} network hiccup; retrying (${attempt}/3).`,
        );
      }
      await new Promise((resolve) => setTimeout(resolve, attempt * 1_000));
    }

    if (captureSession) this.captureSessionCookie(response);
    const data = await this.readResponse(response);

    if (
      (response.status === 401 || response.status === 403) &&
      authenticate &&
      retryAuth &&
      this.password
    ) {
      logger.warn(
        `${method} ${route} lost its Console session; re-authenticating and retrying once.`,
      );
      await this.reauthenticate();
      return this.request(method, route, { ...options, retryAuth: false });
    }

    if (!response.ok) {
      const message =
        data?.error ??
        data?.reason ??
        `Request failed with HTTP ${response.status}.`;
      logger.warn(
        `${method} ${route} failed with HTTP ${response.status} after ${Date.now() - startedAt}ms.`,
      );
      throw new DuneConsoleApiError(message, response.status, data);
    }

    logger.debug(
      `${method} ${route} completed with HTTP ${response.status} in ${Date.now() - startedAt}ms.`,
    );
    return data;
  }

  async reauthenticate() {
    if (!this.password)
      throw new Error(
        "Cannot re-authenticate without the configured console password.",
      );
    if (!this.reauthPromise) {
      this.reauthPromise = this.login(this.password).finally(() => {
        this.reauthPromise = null;
      });
    }
    return this.reauthPromise;
  }

  async requestMultipart(method, route, form, retryAuth = true) {
    const url = new URL(route, this.baseUrl);
    const headers = { Accept: "application/json" };
    if (this.sessionCookie) headers.Cookie = this.sessionCookie;
    if (this.csrfToken) headers["x-csrf-token"] = this.csrfToken;

    const startedAt = Date.now();
    logger.debug(`${method} ${route}`);
    let response;
    try {
      response = await fetch(url, {
        method,
        headers,
        body: form,
        signal: AbortSignal.timeout(60_000),
      });
    } catch (error) {
      logger.error(
        `${method} ${route} multipart request failed after ${Date.now() - startedAt}ms.`,
        error,
      );
      throw new DuneConsoleApiError(
        `Console API upload failed: ${error.message}`,
        0,
        {
          cause: error.code ?? error.name,
        },
      );
    }
    const data = await this.readResponse(response);

    if (
      (response.status === 401 || response.status === 403) &&
      retryAuth &&
      this.password
    ) {
      logger.warn(
        `${method} ${route} lost its Console session during multipart upload; re-authenticating and retrying once.`,
      );
      await this.reauthenticate();
      return this.requestMultipart(method, route, form, false);
    }

    if (!response.ok || data?.ok === false) {
      const message =
        data?.error ??
        data?.reason ??
        `Request failed with HTTP ${response.status}.`;
      logger.warn(
        `${method} ${route} failed with HTTP ${response.status} after ${Date.now() - startedAt}ms.`,
      );
      throw new DuneConsoleApiError(message, response.status, data);
    }

    logger.debug(
      `${method} ${route} completed with HTTP ${response.status} in ${Date.now() - startedAt}ms.`,
    );
    return data;
  }

  captureSessionCookie(response) {
    const cookies =
      typeof response.headers.getSetCookie === "function"
        ? response.headers.getSetCookie()
        : [response.headers.get("set-cookie")].filter(Boolean);
    const session = cookies.find((cookie) => cookie.startsWith("asc_session="));

    if (session) this.sessionCookie = session.split(";", 1)[0];
  }

  async readResponse(response) {
    if (response.status === 204) return null;
    const contentType = response.headers.get("content-type") ?? "";
    return contentType.includes("application/json")
      ? response.json()
      : response.text();
  }
}

class DuneConsoleApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = "DuneConsoleApiError";
    this.status = status;
    this.details = details;
  }
}

module.exports = { DuneConsoleClient, DuneConsoleApiError };
