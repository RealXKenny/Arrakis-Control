"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadCommands = loadCommands;
exports.reloadCommands = reloadCommands;
const node_path_1 = __importDefault(require("node:path"));
const logger_1 = require("../core/logger");
const fileLoader_1 = require("./fileLoader");
const logger = (0, logger_1.createLogger)("COMMANDS");
function loadCommands(client) {
    const commandsPath = node_path_1.default.join(__dirname, "..", "..", "app", "commands");
    let loaded = 0;
    let skipped = 0;
    for (const filePath of (0, fileLoader_1.findJavaScriptFiles)(commandsPath)) {
        try {
            const command = require(filePath);
            if (!command?.data || typeof command.execute !== "function") {
                logger.warn(`Skipped invalid command module: ${filePath}`);
                skipped += 1;
                continue;
            }
            const commandName = command.data.name;
            if (!commandName || typeof commandName !== "string") {
                logger.warn(`Skipped command with invalid name: ${filePath}`);
                skipped += 1;
                continue;
            }
            if (client.commands.has(commandName)) {
                logger.warn(`Skipped duplicate command: /${commandName}.`);
                skipped += 1;
                continue;
            }
            client.commands.set(commandName, command);
            loaded += 1;
        }
        catch (error) {
            logger.error(`Failed to load command module ${filePath}:`, error);
            skipped += 1;
        }
    }
    logger.info(`Loaded ${loaded} command${loaded === 1 ? "" : "s"}${skipped ? `; skipped ${skipped}` : ""}.`);
    return { loaded, skipped };
}
function reloadCommands(client) {
    const commandsPath = node_path_1.default.join(__dirname, "..", "..", "app", "commands");
    for (const filePath of (0, fileLoader_1.findJavaScriptFiles)(commandsPath)) {
        try {
            delete require.cache[require.resolve(filePath)];
        }
        catch (error) {
            logger.warn(`Failed to clear command cache for ${filePath}:`, error);
        }
    }
    client.commands.clear();
    return loadCommands(client);
}
