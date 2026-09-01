import { loadEnvironment } from "../config/environment";
import { createBotApplication } from "./BotApplication";
import { createLogger, type Logger } from "./logger";

const REQUIRED_ENVIRONMENT = ["TOKEN", "CONSOLE_URL", "CONSOLE_PASSWORD"] as const;
const config = loadEnvironment([...REQUIRED_ENVIRONMENT]);
const shardId = process.env.DISCORD_SHARD_ID ?? "0";
const logger = createLogger(`SHARD ${shardId}`, config.logLevel);
const application = createBotApplication(config);

registerProcessHandlers(application, logger);
startApplication(application, logger);

function registerProcessHandlers(app: ReturnType<typeof createBotApplication>, appLogger: Logger): void {
  process.once("SIGINT", () => {
    void app.shutdown("SIGINT");
  });

  process.once("SIGTERM", () => {
    void app.shutdown("SIGTERM");
  });

  process.once("SIGBREAK", () => {
    void app.shutdown("SIGBREAK");
  });

  process.on("unhandledRejection", (error: unknown) => {
    appLogger.error("Unhandled promise rejection.", error);
  });

  process.on("uncaughtException", (error: Error) => {
    appLogger.error("Uncaught exception; shutting down safely.", error);

    void app.shutdown("uncaught exception", 1);
  });
}

function startApplication(app: ReturnType<typeof createBotApplication>, appLogger: Logger): void {
  app.start().catch((error: unknown) => {
    appLogger.error("Unable to start the shard.", error);

    void app.shutdown("startup failure", 1);
  });
}
