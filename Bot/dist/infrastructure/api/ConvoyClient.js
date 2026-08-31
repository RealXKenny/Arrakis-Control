"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConvoyApiError = exports.ConvoyClient = void 0;
const node_url_1 = require("node:url");
const logger_1 = require("../core/logger");
const logger = (0, logger_1.createLogger)("CONVOY API");
class ConvoyClient {
    baseUrl;
    apiKey;
    constructor(baseUrl = "https://vps.advinservers.com", apiKey) {
        if (!apiKey) {
            throw new Error("API_KEY is required for the Convoy API.");
        }
        this.baseUrl = new node_url_1.URL(baseUrl).toString();
        this.apiKey = apiKey;
    }
    request(method, route, options = {}) {
        const { query, body, binary = false } = options;
        const url = new node_url_1.URL(route, this.baseUrl);
        for (const [key, value] of Object.entries(query ?? {})) {
            if (value !== undefined && value !== null) {
                url.searchParams.set(key, String(value));
            }
        }
        return this.#request(method, url, body, binary);
    }
    async #request(method, url, body, binary) {
        const response = await fetch(url, {
            method,
            headers: {
                Accept: binary ? "image/png" : "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.apiKey}`,
            },
            body: body === undefined ? undefined : JSON.stringify(body),
            signal: AbortSignal.timeout(30_000),
        });
        if (binary) {
            if (!response.ok) {
                throw new ConvoyApiError(`Convoy request failed with HTTP ${response.status}`, response.status, await response.text());
            }
            return Buffer.from(await response.arrayBuffer());
        }
        const data = await response.json().catch(() => null);
        if (!response.ok) {
            logger.warn(`${method} ${url.pathname} failed with HTTP ${response.status}.`);
            const responseData = isRecord(data) ? data : {};
            const message = response.status === 401
                ? "Advin API authentication failed. Check API_KEY."
                : response.status === 403
                    ? "Advin API access denied. Ensure the key has servers.read and its IP group allows this VPS."
                    : (getErrorMessage(responseData) ?? `Convoy request failed with HTTP ${response.status}`);
            throw new ConvoyApiError(message, response.status, data);
        }
        return data;
    }
}
exports.ConvoyClient = ConvoyClient;
class ConvoyApiError extends Error {
    status;
    details;
    constructor(message, status, details) {
        super(message);
        this.name = "ConvoyApiError";
        this.status = status;
        this.details = details;
    }
}
exports.ConvoyApiError = ConvoyApiError;
function isRecord(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}
function getErrorMessage(data) {
    if (typeof data.message === "string") {
        return data.message;
    }
    if (typeof data.error === "string") {
        return data.error;
    }
    return undefined;
}
