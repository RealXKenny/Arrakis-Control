"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadEndpointCatalog = loadEndpointCatalog;
exports.resolveRoute = resolveRoute;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const referencePath = node_path_1.default.resolve(process.cwd(), "docs", "dune-awakening-console-api-reference.md");
const endpointPattern = /^\|\s*(GET|POST|PUT|PATCH|DELETE)\s*\|\s*`([^`]+)`\s*\|\s*([^|]+)/;
function loadEndpointCatalog() {
    return node_fs_1.default
        .readFileSync(referencePath, "utf8")
        .split(/\r?\n/)
        .flatMap((line) => {
        const match = line.match(endpointPattern);
        if (!match) {
            return [];
        }
        return [
            {
                method: match[1],
                route: match[2],
                description: match[3].trim(),
            },
        ];
    });
}
function resolveRoute(route, parameters = {}) {
    return route.replace(/\{([^}]+)\}/g, (_, parameterName) => {
        const value = parameters[parameterName];
        if (value === undefined || value === null) {
            throw new Error(`Missing route parameter: ${parameterName}`);
        }
        return encodeURIComponent(String(value));
    });
}
