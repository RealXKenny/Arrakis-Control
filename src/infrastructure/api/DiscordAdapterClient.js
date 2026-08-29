const { URL } = require("node:url");
const { createLogger } = require("../core/logger");

const logger = createLogger("DISCORD ADAPTER");

class DiscordAdapterClient {
  constructor(baseUrl, token) {
    if (!baseUrl)
      throw new Error("CONSOLE_URL is required for the Discord Adapter.");
    if (!token)
      throw new Error(
        "ADAPTER_TOKEN is required for the Discord Adapter.",
      );

    this.baseUrl = new URL(baseUrl).toString();
    this.token = token;
  }

  async linkPlayer(actor, characterName) {
    return this.request("/api/integrations/discord/players/link", {
      actor,
      characterName,
    });
  }

  async verifyPlayerLink(actor, code) {
    return this.request("/api/integrations/discord/players/link/verify", {
      actor,
      code,
    });
  }

  async unlinkPlayer(actor) {
    return this.request("/api/integrations/discord/players/unlink", { actor });
  }

  async getCurrentPlayer(actor) {
    return this.request("/api/integrations/discord/players/me", { actor });
  }

  async request(route, body) {
    const startedAt = Date.now();
    logger.debug(`POST ${route} requested.`, {
      bodyFields: Object.keys(body ?? {}),
      hasActor: Boolean(body?.actor),
      userId: body?.actor?.userId ?? null,
      commandName: body?.actor?.commandName ?? null,
    });
    let response;
    try {
      response = await fetch(new URL(route, this.baseUrl), {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30_000),
      });
    } catch (error) {
      logger.error(
        `POST ${route} network request failed after ${Date.now() - startedAt}ms.`,
        error,
      );
      throw new DiscordAdapterError(
        `Discord Adapter network request failed: ${error.message}`,
        0,
        {
          cause: error.code ?? error.name,
        },
      );
    }
    const data = await readResponse(response);

    if (!response.ok) {
      logger.warn(
        `POST ${route} failed with HTTP ${response.status} after ${Date.now() - startedAt}ms.`,
      );
      throw new DiscordAdapterError(
        data?.error ??
          data?.reason ??
          `Adapter request failed with HTTP ${response.status}.`,
        response.status,
        data,
      );
    }

    logger.debug(
      `POST ${route} completed with HTTP ${response.status} in ${Date.now() - startedAt}ms.`,
    );
    return data;
  }
}

async function readResponse(response) {
  if (response.status === 204) return null;
  const contentType = response.headers.get("content-type") ?? "";
  return contentType.includes("application/json")
    ? response.json()
    : response.text();
}

class DiscordAdapterError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = "DiscordAdapterError";
    this.status = status;
    this.details = details;
  }
}

module.exports = { DiscordAdapterClient, DiscordAdapterError };
