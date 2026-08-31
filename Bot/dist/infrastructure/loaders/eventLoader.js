"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadEvents = loadEvents;
const node_path_1 = __importDefault(require("node:path"));
const fileLoader_1 = require("./fileLoader");
const logger_1 = require("../core/logger");
const logger = (0, logger_1.createLogger)("EVENTS");
function loadEvents(client) {
    const eventsPath = node_path_1.default.join(__dirname, "..", "..", "app", "events");
    let loaded = 0;
    for (const filePath of (0, fileLoader_1.findJavaScriptFiles)(eventsPath)) {
        try {
            const event = require(filePath);
            if (typeof event.name !== "string" ||
                typeof event.execute !== "function") {
                logger.warn(`Skipped invalid event module: ${filePath}`);
                continue;
            }
            const execute = event.execute;
            if (event.once) {
                client.once(event.name, (...args) => {
                    void execute(...args);
                });
            }
            else {
                client.on(event.name, (...args) => {
                    void execute(...args);
                });
            }
            loaded += 1;
        }
        catch (error) {
            logger.error(`Failed to load event module ${filePath}:`, error);
        }
    }
    logger.info(`Loaded ${loaded} event handler${loaded === 1 ? "" : "s"}.`);
    return { loaded };
}
