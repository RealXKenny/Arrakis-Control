"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DuneApi = void 0;
const DuneConsoleClient_1 = require("./core/DuneConsoleClient");
const endpointCatalog_1 = require("./reference/endpointCatalog");
class DuneApi extends DuneConsoleClient_1.DuneConsoleClient {
    endpoints;
    constructor(baseUrl) {
        super(baseUrl);
        this.endpoints = (0, endpointCatalog_1.loadEndpointCatalog)();
    }
    findEndpoints(search = "") {
        const term = search.toLowerCase();
        return this.endpoints.filter(({ method, route, description }) => `${method} ${route} ${description}`.toLowerCase().includes(term));
    }
    async call(method, route, options = {}) {
        return this.request(method, (0, endpointCatalog_1.resolveRoute)(route), options);
    }
    async importBlueprint(playerId, attachment) {
        return this.uploadBlueprint(playerId, attachment);
    }
}
exports.DuneApi = DuneApi;
