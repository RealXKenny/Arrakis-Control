const { loadEnvironment } = require("./infrastructure/config/environment");
const {
  createBotApplication,
} = require("./infrastructure/core/BotApplication");
const { createLogger } = require("./infrastructure/core/logger");

const REQUIRED_ENVIRONMENT = [
  "DISCORD_TOKEN",
  "DUNE_CONSOLE_URL",
  "DUNE_CONSOLE_PASSWORD",
];

const config = loadEnvironment(REQUIRED_ENVIRONMENT);
const shardId = process.env.DISCORD_SHARD_ID ?? "0";
const logger = createLogger(`SHARD ${shardId}`, config.logLevel);
const application = createBotApplication(config);

registerProcessHandlers(application, logger);
startApplication(application, logger);

function registerProcessHandlers(app, appLogger) {
  process.once("SIGINT", () => app.shutdown("SIGINT"));
  process.once("SIGTERM", () => app.shutdown("SIGTERM"));
  process.once("SIGBREAK", () => app.shutdown("SIGBREAK"));

  process.on("unhandledRejection", (error) => {
    appLogger.error("Unhandled promise rejection.", error);
  });

  process.on("uncaughtException", (error) => {
    appLogger.error("Uncaught exception; shutting down safely.", error);
    app.shutdown("uncaught exception", 1);
  });
}

function startApplication(app, appLogger) {
  app.start().catch((error) => {
    appLogger.error("Unable to start the shard.", error);
    app.shutdown("startup failure", 1);
  });
}
