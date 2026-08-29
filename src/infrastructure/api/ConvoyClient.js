const { URL } = require("node:url");
const { createLogger } = require("../core/logger");

const logger = createLogger("CONVOY API");

// Thin authenticated transport for Advin's Convoy customer API. Feature commands
// intentionally call request() so permission and safety decisions stay at the command layer.
class ConvoyClient {
  constructor(baseUrl = "https://vps.advinservers.com", apiKey) {
    if (!apiKey)
      throw new Error("API_KEY is required for the Convoy API.");
    this.baseUrl = new URL(baseUrl).toString();
    this.apiKey = apiKey;
  }

  request(method, route, { query, body, binary = false } = {}) {
    const url = new URL(route, this.baseUrl);
    for (const [key, value] of Object.entries(query ?? {}))
      if (value !== undefined && value !== null)
        url.searchParams.set(key, String(value));
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
      if (!response.ok)
        throw new ConvoyApiError(
          `Convoy request failed with HTTP ${response.status}`,
          response.status,
          await response.text(),
        );
      return Buffer.from(await response.arrayBuffer());
    }
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      logger.warn(
        `${method} ${url.pathname} failed with HTTP ${response.status}.`,
      );
      const message =
        response.status === 401
          ? "Advin API authentication failed. Check API_KEY."
          : response.status === 403
            ? "Advin API access denied. Ensure the key has servers.read and its IP group allows this VPS."
            : (data?.message ??
              data?.error ??
              `Convoy request failed with HTTP ${response.status}`);
      throw new ConvoyApiError(message, response.status, data);
    }
    return data;
  }
}

class ConvoyApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = "ConvoyApiError";
    this.status = status;
    this.details = details;
  }
}

module.exports = { ConvoyClient, ConvoyApiError };
