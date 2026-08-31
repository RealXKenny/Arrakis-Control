"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const environment_1 = require("../config/environment");
const BotApplication_1 = require("./BotApplication");
const logger_1 = require("./logger");
const REQUIRED_ENVIRONMENT = ["TOKEN", "CONSOLE_URL", "CONSOLE_PASSWORD"];
const config = (0, environment_1.loadEnvironment)([...REQUIRED_ENVIRONMENT]);
const shardId = process.env.DISCORD_SHARD_ID ?? "0";
const logger = (0, logger_1.createLogger)(`SHARD ${shardId}`, config.logLevel);
const application = (0, BotApplication_1.createBotApplication)(config);
registerProcessHandlers(application, logger);
startApplication(application, logger);
function registerProcessHandlers(app, appLogger) {
    process.once("SIGINT", () => {
        void app.shutdown("SIGINT");
    });
    process.once("SIGTERM", () => {
        void app.shutdown("SIGTERM");
    });
    process.once("SIGBREAK", () => {
        void app.shutdown("SIGBREAK");
    });
    process.on("unhandledRejection", (error) => {
        appLogger.error("Unhandled promise rejection.", error);
    });
    process.on("uncaughtException", (error) => {
        appLogger.error("Uncaught exception; shutting down safely.", error);
        void app.shutdown("uncaught exception", 1);
    });
}
function startApplication(app, appLogger) {
    app.start().catch((error) => {
        appLogger.error("Unable to start the shard.", error);
        void app.shutdown("startup failure", 1);
    });
}
