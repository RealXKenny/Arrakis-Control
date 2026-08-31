"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const logger_1 = require("../../../infrastructure/core/logger");
const playerLinkPanel_1 = require("../../../modules/panels/playerLinkPanel");
const blueprintUploadPanel_1 = require("../../../modules/panels/blueprintUploadPanel");
const rolePanel_1 = require("../../../modules/panels/rolePanel");
const verificationPanel_1 = require("../../../modules/panels/verificationPanel");
const rulesPanel_1 = require("../../../modules/panels/rulesPanel");
const serverInfoPanel_1 = require("../../../modules/panels/serverInfoPanel");
const versionAnnouncement_1 = require("../../../modules/panels/versionAnnouncement");
const DiscordAuditLogForwarder_1 = require("../../../modules/audit/DiscordAuditLogForwarder");
const logger = (0, logger_1.createLogger)("DISCORD");
module.exports = {
    name: discord_js_1.Events.ClientReady,
    once: true,
    async execute(client) {
        const serverName = process.env.SERVER_NAME ||
            "Dune: Awakening Community Server";
        const statuses = [
            {
                name: "Watching the sands of Arrakis",
                type: discord_js_1.ActivityType.Watching,
            },
            {
                name: `Playing ${serverName}`,
                type: discord_js_1.ActivityType.Playing,
            },
            {
                name: "Watching the spice flow",
                type: discord_js_1.ActivityType.Watching,
            },
            {
                name: "Watching over Arrakis",
                type: discord_js_1.ActivityType.Watching,
            },
            {
                name: "Playing Dune: Awakening",
                type: discord_js_1.ActivityType.Playing,
            },
        ];
        if (!client.user) {
            logger.error("Client reported ready, but no Discord user is available.");
            return;
        }
        const botUser = client.user;
        let index = 0;
        const updatePresence = () => {
            const status = statuses[index];
            botUser.setPresence({
                activities: [
                    {
                        name: status.name,
                        type: status.type,
                    },
                ],
                status: "online",
            });
            index = (index + 1) % statuses.length;
        };
        updatePresence();
        client.presenceInterval = setInterval(updatePresence, 30_000);
        logger.info(`Ready! Logged in as ${botUser.tag}.`);
        client.auditLogInterval =
            (0, DiscordAuditLogForwarder_1.startAuditLogForwarder)(client);
        try {
            if (client.discordAdapter) {
                await (0, playerLinkPanel_1.ensurePlayerLinkPanel)(client, client.discordAdapterLinkPanelChannelId);
                await (0, blueprintUploadPanel_1.ensureBlueprintUploadPanel)(client, client.discordAdapterBlueprintPanelChannelId);
            }
            await (0, rolePanel_1.ensureRolePanel)(client, client.discordRolePanelChannelId);
            await (0, verificationPanel_1.ensureVerificationPanel)(client, client.discordVerifyChannelId);
            await (0, rulesPanel_1.ensureRulesPanel)(client, client.discordRulesChannelId);
            await (0, serverInfoPanel_1.ensureServerInfoPanel)(client, client.discordServerInfoChannelId);
            await (0, versionAnnouncement_1.announceCurrentVersion)(client, client.discordAnnouncementChannelId);
            if (client.discordAnnouncementChannelId) {
                const intervalMinutes = Math.max(Number(client.versionAnnouncementIntervalMinutes) || 5, 1);
                client.versionAnnouncementInterval =
                    setInterval(() => (0, versionAnnouncement_1.announceCurrentVersion)(client, client.discordAnnouncementChannelId).catch((error) => {
                        logger.error("Unable to check for new version announcements.", error);
                    }), intervalMinutes * 60_000);
            }
        }
        catch (error) {
            logger.error("Unable to publish Discord panels.", error);
        }
    },
};
