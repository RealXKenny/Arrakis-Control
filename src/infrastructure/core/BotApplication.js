const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { DuneApi } = require('../api/DuneApi');
const { DiscordAdapterClient } = require('../api/DiscordAdapterClient');
const { ConvoyClient } = require('../api/ConvoyClient');
const { DiscordAuditLogger } = require('../../modules/audit/DiscordAuditLogger');
const { loadCommands } = require('../loaders/commandLoader');
const { loadComponentHandlers } = require('../loaders/componentLoader');
const { loadEvents } = require('../loaders/eventLoader');
const { createLogger } = require('./logger');

function createBotApplication(config) {
  const logger = createLogger('BOT', config.logLevel);
  logger.header('ARRAKIS CONTROL', 'Dune: Awakening Discord control bot');
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });
  client.commands = new Collection();
  client.buttons = new Collection();
  client.selectMenus = new Collection();
  client.modals = new Collection();
  client.duneApi = new DuneApi(config.duneConsoleUrl);
  client.convoyApi = config.advinApiKey
    ? new ConvoyClient(config.advinApiUrl, config.advinApiKey)
    : null;
  client.discordAdapter = config.duneDiscordAdapterToken
    ? new DiscordAdapterClient(config.duneConsoleUrl, config.duneDiscordAdapterToken)
    : null;
  client.discordAdapterLinkPanelChannelId = config.duneDiscordLinkPanelChannelId;
  client.discordAdapterBlueprintPanelChannelId = config.duneDiscordBlueprintPanelChannelId;
  client.auditLogger = new DiscordAuditLogger(client, config.duneDiscordAuditChannelId);

  const commands = loadCommands(client);
  const components = loadComponentHandlers(client);
  const events = loadEvents(client);
  logger.info(
    `Application initialized with ${commands.loaded} commands, ${components.loaded} component handlers, and ${events.loaded} event handlers.`,
  );
  logger.info(
    client.discordAdapter
      ? 'Discord Adapter integration enabled.'
      : 'Discord Adapter integration disabled: DUNE_DISCORD_ADAPTER_TOKEN is not configured.',
  );

  client.on('error', (error) => logger.error('Discord client error.', error));
  client.on('warn', (message) => logger.warn(`Discord client warning: ${message}`));
  client.on('shardError', (error) => logger.error('Discord gateway shard error.', error));
  client.on(Events.ShardDisconnect, (event, shardId) =>
    logger.warn(
      `Discord shard ${shardId} disconnected (code ${event.code}). Discord.js will reconnect automatically.`,
    ),
  );
  client.on(Events.ShardReconnecting, (shardId) =>
    logger.warn(`Discord shard ${shardId} is reconnecting.`),
  );
  client.on(Events.ShardResume, (shardId, replayedEvents) =>
    logger.info(
      `Discord shard ${shardId} resumed after a connection hiccup (${replayedEvents} events replayed).`,
    ),
  );
  client.on(Events.Invalidated, () =>
    logger.error('Discord invalidated the session; a restart may be required.'),
  );

  let isShuttingDown = false;

  async function start() {
    await client.duneApi.login(config.duneConsolePassword);
    logger.info(
      `Logged in to the Dune Console; ${client.duneApi.endpoints.length} API endpoints are available.`,
    );
    await client.login(config.discordToken);
    logger.info('Discord login request completed.');
  }

  async function shutdown(signal, exitCode = 0) {
    if (isShuttingDown) return;
    isShuttingDown = true;
    logger.debug(`Received ${signal}; signing out of the Dune Console.`);

    try {
      await client.duneApi.logout();
      logger.debug('Logged out of the Dune Console.');
    } catch (error) {
      logger.error('Unable to log out of the Dune Console.', error);
    } finally {
      client.destroy();
      logger.debug('Discord client closed.');
      process.exit(exitCode);
    }
  }

  return { start, shutdown };
}

module.exports = { createBotApplication };
