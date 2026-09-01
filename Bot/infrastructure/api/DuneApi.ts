import { DuneConsoleClient, type HttpMethod, type RequestOptions } from "./core/DuneConsoleClient";
import { loadEndpointCatalog, resolveRoute, type EndpointDefinition } from "./reference/endpointCatalog";

class DuneApi extends DuneConsoleClient {
  public readonly endpoints: EndpointDefinition[];

  constructor(baseUrl: string) {
    super(baseUrl);

    this.endpoints = loadEndpointCatalog();
  }

  findEndpoints(search = ""): EndpointDefinition[] {
    const term = search.toLowerCase();

    return this.endpoints.filter(({ method, route, description }) => `${method} ${route} ${description}`.toLowerCase().includes(term));
  }

  async call(method: HttpMethod, route: string, options: RequestOptions = {}): Promise<unknown> {
    const { routeParams, ...requestOptions } = options;

    const resolvedRoute = resolveRoute(route, routeParams);

    return this.request(method, resolvedRoute, requestOptions);
  }

  async importBlueprint(playerId: string, attachment: Parameters<DuneConsoleClient["uploadBlueprint"]>[1]): Promise<unknown> {
    return this.uploadBlueprint(playerId, attachment);
  }
}

export { DuneApi };
