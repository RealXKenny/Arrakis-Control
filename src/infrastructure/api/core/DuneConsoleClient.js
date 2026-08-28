const { URL } = require("node:url");
const { createLogger } = require("../../core/logger");
const { MAX_BLUEPRINT_BYTES, validateBlueprintUpload } = require("../../../modules/validators/blueprintValidator");

const logger = createLogger("DUNE API");

class DuneConsoleClient {
  constructor(baseUrl) {
    if (!baseUrl) throw new Error("DUNE_CONSOLE_URL is required to create a Dune console client.");

    this.baseUrl = new URL(baseUrl).toString();
    this.sessionCookie = null;
    this.csrfToken = null;
  }

  async getAuthState() {
    const response = await this.request("GET", "/api/auth/state");
    this.csrfToken = response.csrfToken ?? response.csrf ?? response.token ?? this.csrfToken;
    return response;
  }

  async login(password) {
    if (!password) throw new Error("A Dune console password is required to log in.");

    const response = await this.request("POST", "/api/auth/login", {
      authenticate: false,
      body: { password },
      includeCsrf: false,
      captureSession: true,
    });

    if (!this.sessionCookie) {
      throw new Error("Login succeeded without returning an asc_session cookie.");
    }

    await this.getAuthState();
    if (!this.csrfToken) throw new Error("The console did not provide a CSRF token after login.");

    return response;
  }

  async logout() {
    return this.request("POST", "/api/auth/logout", { body: {} });
  }

  async uploadBlueprint(playerId, attachment) {
    if (!attachment?.url || !attachment?.name) throw new Error("A valid blueprint attachment is required.");
    if (!Number.isFinite(Number(playerId)) || Number(playerId) <= 0) throw new Error("A valid linked player ID is required.");

    if (attachment.size > MAX_BLUEPRINT_BYTES) throw new Error("Blueprint files must be 32 MB or smaller.");

    const fileResponse = await fetch(attachment.url);
    if (!fileResponse.ok) throw new Error(`Unable to download the uploaded blueprint (HTTP ${fileResponse.status}).`);
    const fileBuffer = Buffer.from(await fileResponse.arrayBuffer());
    validateBlueprintUpload(attachment, fileBuffer);

    const form = new FormData();
    form.set("player_id", String(playerId));
    form.set("file", new Blob([fileBuffer], { type: "application/json" }), attachment.name);
    return this.requestMultipart("POST", "/api/blueprints/import", form);
  }

  async request(method, route, options = {}) {
    const { authenticate = true, includeCsrf = method !== "GET" && method !== "HEAD", query, body, captureSession = false } = options;
    const url = new URL(route, this.baseUrl);

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
      }
    }

    const headers = { Accept: "application/json" };
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (authenticate && this.sessionCookie) headers.Cookie = this.sessionCookie;
    if (includeCsrf && this.csrfToken) headers["x-csrf-token"] = this.csrfToken;

    const startedAt = Date.now();
    logger.debug(`${method} ${route}`);
    const response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (captureSession) this.captureSessionCookie(response);
    const data = await this.readResponse(response);

    if (!response.ok) {
      const message = data?.error ?? data?.reason ?? `Request failed with HTTP ${response.status}.`;
      logger.warn(`${method} ${route} failed with HTTP ${response.status} after ${Date.now() - startedAt}ms.`);
      throw new DuneConsoleApiError(message, response.status, data);
    }

    logger.debug(`${method} ${route} completed with HTTP ${response.status} in ${Date.now() - startedAt}ms.`);
    return data;
  }

  async requestMultipart(method, route, form) {
    const url = new URL(route, this.baseUrl);
    const headers = { Accept: "application/json" };
    if (this.sessionCookie) headers.Cookie = this.sessionCookie;
    if (this.csrfToken) headers["x-csrf-token"] = this.csrfToken;

    const startedAt = Date.now();
    logger.debug(`${method} ${route}`);
    const response = await fetch(url, { method, headers, body: form });
    const data = await this.readResponse(response);

    if (!response.ok || data?.ok === false) {
      const message = data?.error ?? data?.reason ?? `Request failed with HTTP ${response.status}.`;
      logger.warn(`${method} ${route} failed with HTTP ${response.status} after ${Date.now() - startedAt}ms.`);
      throw new DuneConsoleApiError(message, response.status, data);
    }

    logger.debug(`${method} ${route} completed with HTTP ${response.status} in ${Date.now() - startedAt}ms.`);
    return data;
  }

  captureSessionCookie(response) {
    const cookies = typeof response.headers.getSetCookie === "function" ? response.headers.getSetCookie() : [response.headers.get("set-cookie")].filter(Boolean);
    const session = cookies.find((cookie) => cookie.startsWith("asc_session="));

    if (session) this.sessionCookie = session.split(";", 1)[0];
  }

  async readResponse(response) {
    if (response.status === 204) return null;
    const contentType = response.headers.get("content-type") ?? "";
    return contentType.includes("application/json") ? response.json() : response.text();
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
