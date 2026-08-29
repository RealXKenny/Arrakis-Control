const path = require("node:path");
const { ShardingManager } = require("discord.js");
const { loadEnvironment } = require("./infrastructure/config/environment");
const { createLogger } = require("./infrastructure/core/logger");

const REQUIRED_ENVIRONMENT = [
  "TOKEN",
  "CONSOLE_URL",
  "CONSOLE_PASSWORD",
];

const environment = loadEnvironment(REQUIRED_ENVIRONMENT);
const logger = createLogger("SHARD MANAGER", environment.logLevel);

const manager = createShardManager(environment);

registerShardEvents(manager, logger);
startShardManager(manager, logger);

function createShardManager(config) {
  const totalShards = process.env.TOTAL_SHARDS
    ? Number(process.env.TOTAL_SHARDS)
    : "auto";

  return new ShardingManager(
    path.join(__dirname, "infrastructure", "core", "shard.js"),
    {
      token: config.discordToken,
      totalShards,
    },
  );
}

function registerShardEvents(shardManager, shardLogger) {
  shardManager.on("shardCreate", (shard) => {
    shard.on("ready", () => {
      shardLogger.info(`Launched Discord shard ${shard.id}; shard is ready.`);
    });

    shard.on("reconnecting", () => {
      shardLogger.warn(`Discord shard ${shard.id} is reconnecting.`);
    });

    shard.on("death", () => {
      shardLogger.error(`Discord shard ${shard.id} process exited.`);
    });
  });
}

function startShardManager(shardManager, shardLogger) {
  shardManager.spawn().catch((error) => {
    shardLogger.error("Unable to spawn Discord shards.", error);
    process.exitCode = 1;
  });
}
