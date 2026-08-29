const path = require('node:path');
const { ShardingManager } = require('discord.js');
const { loadEnvironment } = require('./infrastructure/config/environment');
const { createLogger } = require('./infrastructure/core/logger');
const config = loadEnvironment(['DISCORD_TOKEN', 'DUNE_CONSOLE_URL', 'DUNE_CONSOLE_PASSWORD']);
const logger = createLogger('SHARD MANAGER', config.logLevel);
const manager = new ShardingManager(path.join(__dirname, 'shard.js'), {
  token: config.discordToken,
  totalShards: process.env.DISCORD_TOTAL_SHARDS ? Number(process.env.DISCORD_TOTAL_SHARDS) : 'auto',
});
manager.on('shardCreate', (shard) => {
  logger.info(`Launched Discord shard ${shard.id}.`);
  shard.on('ready', () => logger.info(`Discord shard ${shard.id} is ready.`));
  shard.on('reconnecting', () => logger.warn(`Discord shard ${shard.id} is reconnecting.`));
  shard.on('death', () => logger.error(`Discord shard ${shard.id} process exited.`));
});
manager.spawn().catch((error) => {
  logger.error('Unable to spawn Discord shards.', error);
  process.exitCode = 1;
});
