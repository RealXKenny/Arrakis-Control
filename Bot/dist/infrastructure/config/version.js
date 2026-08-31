"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBotVersion = getBotVersion;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const versionPaths = [
    node_path_1.default.join(__dirname, "..", "..", "VERSION"),
    node_path_1.default.join(process.cwd(), "VERSION"),
    node_path_1.default.join(__dirname, "..", "..", "VERSION"),
];
function getBotVersion() {
    const environmentVersion = process.env.BOT_VERSION?.trim();
    if (environmentVersion) {
        return environmentVersion;
    }
    const versionPath = versionPaths.find((candidate) => node_fs_1.default.existsSync(candidate));
    if (versionPath) {
        const version = node_fs_1.default.readFileSync(versionPath, "utf8").trim();
        if (version) {
            return version;
        }
    }
    const packageJsonPath = node_path_1.default.join(__dirname, "..", "..", "..", "package.json");
    const packageJson = JSON.parse(node_fs_1.default.readFileSync(packageJsonPath, "utf8"));
    if (!packageJson.version) {
        throw new Error("Unable to determine the bot version: package.json does not contain a version.");
    }
    return packageJson.version;
}
