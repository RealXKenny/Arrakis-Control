"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBotApplication = createBotApplication;
const discord_js_1 = require("discord.js");
const DuneApi_1 = require("../api/DuneApi");
const DiscordAdapterClient_1 = require("../api/DiscordAdapterClient");
const ConvoyClient_1 = require("../api/ConvoyClient");
const DiscordAuditLogger_1 = require("../../modules/audit/DiscordAuditLogger");
const commandLoader_1 = require("../loaders/commandLoader");
const componentLoader_1 = require("../loaders/componentLoader");
const eventLoader_1 = require("../loaders/eventLoader");
const logger_1 = require("./logger");
function clearConsole() {
    if (process.stdout.isTTY) {
        process.stdout.write("\x1b[2J\x1b[0f");
    }
    else {
        console.clear();
    }
}
function createBotApplication(config) {
    clearConsole();
    const logger = (0, logger_1.createLogger)("BOT", config.logLevel);
    logger.header("ARRAKIS CONTROL", "Dune: Awakening Discord control bot");
    const client = createClient();
    configureIntegrations(client, config);
    registerClientEvents(client, logger);
    const commands = (0, commandLoader_1.loadCommands)(client);
    const components = (0, componentLoader_1.loadComponentHandlers)(client);
    const events = (0, eventLoader_1.loadEvents)(client);
    logger.info(`Application initialized with ${commands.loaded} commands, ${components.loaded} component handlers, and ${events.loaded} event handlers.`);
    logger.info(client.discordAdapter
        ? "Discord Adapter integration enabled."
        : "Discord Adapter integration disabled: ADAPTER_TOKEN is not configured.");
    let isShuttingDown = false;
    async function start() {
        await client.duneApi.login(config.duneConsolePassword);
        logger.info(`Logged in to the Dune Console; ${client.duneApi.endpoints.length} API endpoints are available.`);
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
        const route = discord_js_1.Routes.applicationCommands(config.clientId);
        const payload = [...client.commands.values()].map((command) => command.data.toJSON());
        const rest = new discord_js_1.REST({
            version: "10",
        }).setToken(config.discordToken);
        logger.info(`Deploying ${payload.length} application command(s).`);
        await rest.put(route, {
            body: payload,
        });
        logger.info("Application commands deployed.");
    }
    async function shutdown(signal, exitCode = 0) {
        if (isShuttingDown) {
            return;
        }
        isShuttingDown = true;
        logger.debug(`Received ${signal}; signing out of the Dune Console.`);
        try {
            if (client.auditLogInterval) {
                clearInterval(client.auditLogInterval);
            }
            if (client.versionAnnouncementInterval) {
                clearInterval(client.versionAnnouncementInterval);
            }
            await client.duneApi.logout();
            logger.debug("Logged out of the Dune Console.");
        }
        catch (error) {
            logger.error("Unable to log out of the Dune Console.", error);
        }
        finally {
            try {
                /**
                 * An unsharded client may not have a gateway
                 * shard yet if startup failed early.
                 */
                if (client.readyAt) {
                    client.destroy();
                }
            }
            catch (error) {
                logger.warn("Discord client cleanup was skipped because no active gateway connection existed.", error);
            }
            logger.debug("Discord client closed.");
            process.exit(exitCode);
        }
    }
    return {
        client,
        start,
        shutdown,
    };
}
function createClient() {
    const client = new discord_js_1.Client({
        intents: [discord_js_1.GatewayIntentBits.Guilds, discord_js_1.GatewayIntentBits.GuildMembers],
    });
    client.commands = new discord_js_1.Collection();
    client.buttons = new discord_js_1.Collection();
    client.selectMenus = new discord_js_1.Collection();
    client.modals = new discord_js_1.Collection();
    return client;
}
function configureIntegrations(client, config) {
    client.duneApi = new DuneApi_1.DuneApi(config.duneConsoleUrl);
    client.convoyApi = config.advinApiKey ? new ConvoyClient_1.ConvoyClient(config.advinApiUrl, config.advinApiKey) : null;
    client.discordAdapter = config.duneDiscordAdapterToken
        ? new DiscordAdapterClient_1.DiscordAdapterClient(config.duneConsoleUrl, config.duneDiscordAdapterToken)
        : null;
    /*
     * Configuration values may be null.
     * Discord.js Client properties use string | undefined.
     * Normalize null -> undefined.
     */
    client.discordAdapterLinkPanelChannelId = config.duneDiscordLinkPanelChannelId ?? undefined;
    client.discordAdapterBlueprintPanelChannelId = config.duneDiscordBlueprintPanelChannelId ?? undefined;
    client.discordRolePanelChannelId = config.discordRolePanelChannelId ?? undefined;
    client.discordVerifyChannelId = config.discordVerifyChannelId ?? undefined;
    client.discordRulesChannelId = config.discordRulesChannelId ?? undefined;
    client.discordServerInfoChannelId = config.discordServerInfoChannelId ?? undefined;
    client.discordAnnouncementChannelId = config.discordAnnouncementChannelId ?? undefined;
    client.versionAnnouncementIntervalMinutes = config.versionAnnouncementIntervalMinutes;
    /*
     * DiscordAuditLogger expects string | undefined,
     * while BotConfig allows null.
     *
     * Normalize null -> undefined here as well.
     */
    client.auditLogger = new DiscordAuditLogger_1.DiscordAuditLogger(client, config.duneDiscordAuditChannelId ?? undefined, config.duneDiscordActivityLogChannelId ?? undefined);
}
function registerClientEvents(client, logger) {
    client.on(discord_js_1.Events.Error, (error) => logger.error("Discord client error.", error));
    client.on(discord_js_1.Events.Warn, (message) => logger.warn(`Discord client warning: ${message}`));
    client.on(discord_js_1.Events.ShardError, (error) => logger.error("Discord gateway shard error.", error));
    client.on(discord_js_1.Events.ShardDisconnect, (event, shardId) => logger.warn(`Discord shard ${shardId} disconnected (code ${event.code}). Discord.js will reconnect automatically.`));
    client.on(discord_js_1.Events.ShardReconnecting, (shardId) => logger.warn(`Discord shard ${shardId ?? "unknown"} is reconnecting.`));
    client.on(discord_js_1.Events.ShardResume, (shardId, replayedEvents) => logger.info(`Discord shard ${shardId ?? "unknown"} resumed after a connection hiccup (${replayedEvents ?? 0} events replayed).`));
    client.on(discord_js_1.Events.Invalidated, () => logger.error("Discord invalidated the session; a restart may be required."));
}
