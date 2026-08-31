"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadComponentHandlers = loadComponentHandlers;
exports.reloadComponentHandlers = reloadComponentHandlers;
const node_path_1 = __importDefault(require("node:path"));
const logger_1 = require("../core/logger");
const fileLoader_1 = require("./fileLoader");
const logger = (0, logger_1.createLogger)("COMPONENTS");
const handlerTypes = Object.freeze([
    ["buttons", "buttons"],
    ["menus", "selectMenus"],
    ["modals", "modals"],
]);
function loadComponentHandlers(client) {
    let loaded = 0;
    let skipped = 0;
    for (const [directory, collectionName] of handlerTypes) {
        const handlersPath = node_path_1.default.join(__dirname, "..", "..", "app", "components", directory);
        for (const filePath of (0, fileLoader_1.findJavaScriptFiles)(handlersPath)) {
            try {
                const handler = require(filePath);
                if (typeof handler.customId !== "string" || typeof handler.execute !== "function") {
                    logger.warn(`Skipped invalid ${directory} handler: ${filePath}`);
                    skipped += 1;
                    continue;
                }
                client[collectionName].set(handler.customId, handler);
                loaded += 1;
            }
            catch (error) {
                logger.error(`Failed to load ${directory} handler ${filePath}:`, error);
                skipped += 1;
            }
        }
    }
    logger.info(`Loaded ${loaded} component handler${loaded === 1 ? "" : "s"}${skipped ? `; skipped ${skipped}` : ""}.`);
    return { loaded, skipped };
}
function reloadComponentHandlers(client) {
    for (const [directory, collectionName] of handlerTypes) {
        const handlersPath = node_path_1.default.join(__dirname, "..", "..", "app", "components", directory);
        for (const filePath of (0, fileLoader_1.findJavaScriptFiles)(handlersPath)) {
            try {
                delete require.cache[require.resolve(filePath)];
            }
            catch (error) {
                logger.warn(`Failed to clear component handler cache for ${filePath}:`, error);
            }
        }
        client[collectionName].clear();
    }
    return loadComponentHandlers(client);
}
