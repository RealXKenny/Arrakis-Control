const { URL } = require('node:url');
const { createLogger } = require('../core/logger');

const logger = createLogger('DISCORD ADAPTER');

class DiscordAdapterClient {
  constructor(baseUrl, token) {
    if (!baseUrl) throw new Error('DUNE_CONSOLE_URL is required for the Discord Adapter.');
    if (!token) throw new Error('DUNE_DISCORD_ADAPTER_TOKEN is required for the Discord Adapter.');

    this.baseUrl = new URL(baseUrl).toString();
    this.token = token;
  }

  async linkPlayer(actor, characterName) {
    return this.request('/api/integrations/discord/players/link', { actor, characterName });
  }

  async verifyPlayerLink(actor, code) {
    return this.request('/api/integrations/discord/players/link/verify', { actor, code });
  }

  async unlinkPlayer(actor) {
    return this.request('/api/integrations/discord/players/unlink', { actor });
  }

  async getCurrentPlayer(actor) {
    return this.request('/api/integrations/discord/players/me', { actor });
  }

  async request(route, body) {
    const startedAt = Date.now();
    const response = await fetch(new URL(route, this.baseUrl), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify(body),
    });
    const data = await readResponse(response);

    if (!response.ok) {
      logger.warn(`POST ${route} failed with HTTP ${response.status} after ${Date.now() - startedAt}ms.`);
      throw new DiscordAdapterError(data?.error ?? data?.reason ?? `Adapter request failed with HTTP ${response.status}.`, response.status, data);
    }

    return data;
  }

}

async function readResponse(response) {
  if (response.status === 204) return null;
  const contentType = response.headers.get('content-type') ?? '';
  return contentType.includes('application/json') ? response.json() : response.text();
}

class DiscordAdapterError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'DiscordAdapterError';
    this.status = status;
    this.details = details;
  }
}

module.exports = { DiscordAdapterClient, DiscordAdapterError };
