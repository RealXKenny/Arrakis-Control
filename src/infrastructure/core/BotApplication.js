const {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  REST,
  Routes,
} = require("discord.js");
const { DuneApi } = require("../api/DuneApi");
const { DiscordAdapterClient } = require("../api/DiscordAdapterClient");
const { ConvoyClient } = require("../api/ConvoyClient");
const {
  DiscordAuditLogger,
} = require("../../modules/audit/DiscordAuditLogger");
const { loadCommands } = require("../loaders/commandLoader");
const { loadComponentHandlers } = require("../loaders/componentLoader");
const { loadEvents } = require("../loaders/eventLoader");
const { createLogger } = require("./logger");

function createBotApplication(config) {
  process.stdout.write("\x1Bc");
  const logger = createLogger("BOT", config.logLevel);
  logger.header("ARRAKIS CONTROL", "Dune: Awakening Discord control bot");
  const client = createClient(config);
  configureIntegrations(client, config);
  registerClientEvents(client, logger);

  const commands = loadCommands(client);
  const components = loadComponentHandlers(client);
  const events = loadEvents(client);
  logger.info(
    `Application initialized with ${commands.loaded} commands, ${components.loaded} component handlers, and ${events.loaded} event handlers.`,
  );
  logger.info(
    client.discordAdapter
      ? "Discord Adapter integration enabled."
      : "Discord Adapter integration disabled: ADAPTER_TOKEN is not configured.",
  );

  let isShuttingDown = false;

  async function start() {
    await client.duneApi.login(config.duneConsolePassword);
    logger.info(
      `Logged in to the Dune Console; ${client.duneApi.endpoints.length} API endpoints are available.`,
    );

    await deployCommands();
    await client.login(config.discordToken);
    logger.info("Discord login request completed.");
  }

  async function deployCommands() {
    const shardId = process.env.DISCORD_SHARD_ID ?? "0";

    if (shardId !== "0") {
      logger.debug(`Skipping command deployment on shard ${shardId}.`);
      return;
    }

    if (!config.clientId) {
      logger.warn("Skipping command deployment because CLIENT_ID is not configured.");
      return;
    }

    const route = config.guildId
      ? Routes.applicationGuildCommands(config.clientId, config.guildId)
      : Routes.applicationCommands(config.clientId);
    const payload = [...client.commands.values()].map((command) =>
      command.data.toJSON(),
    );
    const rest = new REST({ version: "10" }).setToken(config.discordToken);

    logger.info(`Deploying ${payload.length} application command(s).`);
    await rest.put(route, { body: payload });
    logger.info("Application commands deployed.");
  }

  async function shutdown(signal, exitCode = 0) {
    if (isShuttingDown) return;
    isShuttingDown = true;
    logger.debug(`Received ${signal}; signing out of the Dune Console.`);

    try {
      if (client.auditLogInterval) clearInterval(client.auditLogInterval);
      if (client.versionAnnouncementInterval) clearInterval(client.versionAnnouncementInterval);
      await client.duneApi.logout();
      logger.debug("Logged out of the Dune Console.");
    } catch (error) {
      logger.error("Unable to log out of the Dune Console.", error);
    } finally {
      try {
        // An unsharded client may not have a gateway shard yet if startup failed early.
        if (client.readyAt) client.destroy();
      } catch (error) {
        logger.warn(
          "Discord client cleanup was skipped because no active gateway connection existed.",
          error,
        );
      }
      logger.debug("Discord client closed.");
      process.exit(exitCode);
    }
  }

  return { start, shutdown };
}

function createClient() {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
  });
  client.commands = new Collection();
  client.buttons = new Collection();
  client.selectMenus = new Collection();
  client.modals = new Collection();
  return client;
}

function configureIntegrations(client, config) {
  client.duneApi = new DuneApi(config.duneConsoleUrl);
  client.convoyApi = config.advinApiKey
    ? new ConvoyClient(config.advinApiUrl, config.advinApiKey)
    : null;
  client.discordAdapter = config.duneDiscordAdapterToken
    ? new DiscordAdapterClient(config.duneConsoleUrl, config.duneDiscordAdapterToken)
    : null;
  client.discordAdapterLinkPanelChannelId = config.duneDiscordLinkPanelChannelId;
  client.discordAdapterBlueprintPanelChannelId = config.duneDiscordBlueprintPanelChannelId;
  client.discordRolePanelChannelId = config.discordRolePanelChannelId;
  client.discordVerifyChannelId = config.discordVerifyChannelId;
  client.discordRulesChannelId = config.discordRulesChannelId;
  client.discordServerInfoChannelId = config.discordServerInfoChannelId;
  client.discordAnnouncementChannelId = config.discordAnnouncementChannelId;
  client.versionAnnouncementIntervalMinutes = config.versionAnnouncementIntervalMinutes;
  client.auditLogger = new DiscordAuditLogger(
    client,
    config.duneDiscordAuditChannelId,
    config.duneDiscordActivityLogChannelId,
  );
}

function registerClientEvents(client, logger) {
  client.on("error", (error) => logger.error("Discord client error.", error));
  client.on("warn", (message) => logger.warn(`Discord client warning: ${message}`));
  client.on("shardError", (error) => logger.error("Discord gateway shard error.", error));
  client.on(Events.ShardDisconnect, (event, shardId) =>
    logger.warn(`Discord shard ${shardId} disconnected (code ${event.code}). Discord.js will reconnect automatically.`),
  );
  client.on(Events.ShardReconnecting, (shardId) =>
    logger.warn(`Discord shard ${shardId ?? "unknown"} is reconnecting.`),
  );
  client.on(Events.ShardResume, (shardId, replayedEvents) =>
    logger.info(`Discord shard ${shardId ?? "unknown"} resumed after a connection hiccup (${replayedEvents ?? 0} events replayed).`),
  );
  client.on(Events.Invalidated, () =>
    logger.error("Discord invalidated the session; a restart may be required."),
  );
}

module.exports = { createBotApplication };
