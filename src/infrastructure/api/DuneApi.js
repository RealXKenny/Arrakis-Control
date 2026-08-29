const { DuneConsoleClient } = require('./core/DuneConsoleClient');
const { loadEndpointCatalog, resolveRoute } = require('./reference/endpointCatalog');

class DuneApi extends DuneConsoleClient {
  constructor(baseUrl) {
    super(baseUrl);
    this.endpoints = loadEndpointCatalog();
  }

  findEndpoints(search = '') {
    const term = search.toLowerCase();
    return this.endpoints.filter(({ method, route, description }) =>
      `${method} ${route} ${description}`.toLowerCase().includes(term),
    );
  }

  async call(method, route, options = {}) {
    return this.request(method, resolveRoute(route, options.params), options);
  }

  async importBlueprint(playerId, attachment) {
    return this.uploadBlueprint(playerId, attachment);
  }
}

module.exports = { DuneApi };
