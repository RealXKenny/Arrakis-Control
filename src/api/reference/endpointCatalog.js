const fs = require("node:fs");
const path = require("node:path");

const referencePath = path.join(__dirname, "..", "..", "..", "docs", "dune-awakening-console-api-reference.md");
const endpointPattern = /^\|\s*(GET|POST|PUT|PATCH|DELETE)\s*\|\s*`([^`]+)`\s*\|\s*([^|]+)/;

function loadEndpointCatalog() {
  return fs
    .readFileSync(referencePath, "utf8")
    .split(/\r?\n/)
    .map((line) => line.match(endpointPattern))
    .filter(Boolean)
    .map((match) => ({ method: match[1], route: match[2], description: match[3].trim() }));
}

function resolveRoute(route, parameters = {}) {
  return route.replace(/\{([^}]+)\}/g, (_, parameterName) => {
    if (parameters[parameterName] === undefined || parameters[parameterName] === null) {
      throw new Error(`Missing route parameter: ${parameterName}`);
    }

    return encodeURIComponent(parameters[parameterName]);
  });
}

module.exports = { loadEndpointCatalog, resolveRoute };
