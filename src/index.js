const path = require("node:path");

const { ShardingManager } = require("discord.js");

const { loadEnvironment } = require("./infrastructure/config/environment");

const { createLogger } = require("./infrastructure/core/logger");

const REQUIRED_ENVIRONMENT = ["TOKEN"];

const environment = loadEnvironment(REQUIRED_ENVIRONMENT);

const logger = createLogger("SHARD MANAGER", environment.logLevel);

const manager = createShardManager(environment);

let isStopping = false;

for (const signal of ["SIGINT", "SIGTERM", "SIGBREAK"]) {
  process.once(signal, () => stopAll(signal));
}

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
      shardLogger.info(
        `Launched Discord shard ${shard.id}; shard is ready.`,
      );
    });

    shard.on("death", () => {
      if (!isStopping) {
        shardLogger.error(
          `Discord shard ${shard.id} process exited unexpectedly.`,
        );
      }
    });

    shard.on("reconnecting", () => {
      shardLogger.warn(
        `Discord shard ${shard.id} is reconnecting.`,
      );
    });
  });
}

function stopAll(signal) {
  if (isStopping) return;

  isStopping = true;

  logger.info(`Received ${signal}; stopping Discord shards.`);

  for (const shard of manager.shards.values()) {
    shard.kill();
  }

  setTimeout(() => process.exit(0), 1_000).unref();
}

function startShardManager(shardManager, shardLogger) {
  shardManager.spawn().catch((error) => {
    shardLogger.error("Unable to spawn Discord shards.", error);
    process.exitCode = 1;
  });
}