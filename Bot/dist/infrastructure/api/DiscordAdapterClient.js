"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscordAdapterError = exports.DiscordAdapterClient = void 0;
const node_url_1 = require("node:url");
const logger_1 = require("../core/logger");
const logger = (0, logger_1.createLogger)("DISCORD ADAPTER");
class DiscordAdapterClient {
    baseUrl;
    token;
    constructor(baseUrl, token) {
        if (!baseUrl) {
            throw new Error("CONSOLE_URL is required for the Discord Adapter.");
        }
        if (!token) {
            throw new Error("ADAPTER_TOKEN is required for the Discord Adapter.");
        }
        this.baseUrl = new node_url_1.URL(baseUrl).toString();
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
    async request(route, body = {}) {
        const startedAt = Date.now();
        logger.debug(`POST ${route} requested.`, {
            bodyFields: Object.keys(body),
            hasActor: Boolean(body.actor),
            userId: body.actor?.userId ?? null,
            commandName: body.actor?.commandName ?? null,
        });
        let response;
        try {
            response = await fetch(new node_url_1.URL(route, this.baseUrl), {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.token}`,
                },
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(30_000),
            });
        }
        catch (error) {
            logger.error(`POST ${route} network request failed after ${Date.now() - startedAt}ms.`, error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorCause = error instanceof Error ? error.name : "unknown";
            throw new DiscordAdapterError(`Discord Adapter network request failed: ${errorMessage}`, 0, {
                cause: errorCause,
            });
        }
        const data = await readResponse(response);
        if (!response.ok) {
            logger.warn(`POST ${route} failed with HTTP ${response.status} after ${Date.now() - startedAt}ms.`);
            throw new DiscordAdapterError(getErrorMessage(data, response.status), response.status, data);
        }
        logger.debug(`POST ${route} completed with HTTP ${response.status} in ${Date.now() - startedAt}ms.`);
        return data;
    }
}
exports.DiscordAdapterClient = DiscordAdapterClient;
async function readResponse(response) {
    if (response.status === 204) {
        return null;
    }
    const contentType = response.headers.get("content-type") ?? "";
    return contentType.includes("application/json") ? response.json() : response.text();
}
function getErrorMessage(data, status) {
    if (typeof data === "object" && data !== null) {
        const record = data;
        if (typeof record.error === "string") {
            return record.error;
        }
        if (typeof record.reason === "string") {
            return record.reason;
        }
    }
    return `Adapter request failed with HTTP ${status}.`;
}
class DiscordAdapterError extends Error {
    status;
    details;
    constructor(message, status, details) {
        super(message);
        this.name = "DiscordAdapterError";
        this.status = status;
        this.details = details;
        Object.setPrototypeOf(this, DiscordAdapterError.prototype);
    }
}
exports.DiscordAdapterError = DiscordAdapterError;
