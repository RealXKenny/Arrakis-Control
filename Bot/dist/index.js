"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = __importDefault(require("node:path"));
const discord_js_1 = require("discord.js");
const environment_1 = require("./infrastructure/config/environment");
const logger_1 = require("./infrastructure/core/logger");
const REQUIRED_ENVIRONMENT = ["TOKEN"];
const environment = (0, environment_1.loadEnvironment)(REQUIRED_ENVIRONMENT);
const logger = (0, logger_1.createLogger)("SHARD MANAGER", environment.logLevel);
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
    return new discord_js_1.ShardingManager(node_path_1.default.join(__dirname, "infrastructure", "core", "shard.js"), {
        token: config.discordToken,
        totalShards,
    });
}
function registerShardEvents(shardManager, shardLogger) {
    shardManager.on("shardCreate", (shard) => {
        shard.on("ready", () => {
            shardLogger.info(`Launched Discord shard ${shard.id}; shard is ready.`);
        });
        shard.on("death", () => {
            if (!isStopping) {
                shardLogger.error(`Discord shard ${shard.id} process exited unexpectedly.`);
            }
        });
        shard.on("reconnecting", () => {
            shardLogger.warn(`Discord shard ${shard.id} is reconnecting.`);
        });
    });
}
function stopAll(signal) {
    if (isStopping)
        return;
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
