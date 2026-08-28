const { loadEnvironment } = require("./infrastructure/config/environment");
const { createBotApplication } = require("./infrastructure/core/BotApplication");
const { createLogger } = require("./infrastructure/core/logger");

const config = loadEnvironment(["DISCORD_TOKEN", "DUNE_CONSOLE_URL", "DUNE_CONSOLE_PASSWORD"]);
const logger = createLogger("STARTUP", config.logLevel);
const app = createBotApplication(config);

process.once("SIGINT", () => app.shutdown("SIGINT"));
process.once("SIGTERM", () => app.shutdown("SIGTERM"));
process.once("SIGBREAK", () => app.shutdown("SIGBREAK"));

app.start().catch((error) => {
  logger.error("Unable to start the bot.", error);
  app.shutdown("startup failure", 1);
});
