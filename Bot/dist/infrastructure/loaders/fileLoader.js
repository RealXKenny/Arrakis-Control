"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findJavaScriptFiles = findJavaScriptFiles;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
function findJavaScriptFiles(directory) {
    if (!node_fs_1.default.existsSync(directory)) {
        return [];
    }
    return node_fs_1.default
        .readdirSync(directory, {
        withFileTypes: true,
    })
        .flatMap((entry) => {
        const itemPath = node_path_1.default.join(directory, entry.name);
        if (entry.isDirectory()) {
            return findJavaScriptFiles(itemPath);
        }
        return itemPath.endsWith(".js") ? [itemPath] : [];
    });
}
