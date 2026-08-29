const { ActivityType, Events } = require("discord.js");
const { createLogger } = require("../../../infrastructure/core/logger");
const {
  ensurePlayerLinkPanel,
} = require("../../../modules/panels/playerLinkPanel");
const {
  ensureBlueprintUploadPanel,
} = require("../../../modules/panels/blueprintUploadPanel");
const { ensureRolePanel } = require("../../../modules/panels/rolePanel");
const { ensureVerificationPanel } = require("../../../modules/panels/verificationPanel");
const { ensureRulesPanel } = require("../../../modules/panels/rulesPanel");
const { ensureServerInfoPanel } = require("../../../modules/panels/serverInfoPanel");
const { announceCurrentVersion } = require("../../../modules/panels/versionAnnouncement");
const { startAuditLogForwarder } = require("../../../modules/audit/DiscordAuditLogForwarder");

const logger = createLogger("DISCORD");

module.exports = {
  name: Events.ClientReady,
  once: true,

  async execute(client) {
    const serverName =
      process.env.SERVER_NAME || "Dune: Awakening Community Server";

    const statuses = [
      {
        name: "Watching the sands of Arrakis",
        type: ActivityType.Watching,
      },
      {
        name: `Playing ${serverName}`,
        type: ActivityType.Playing,
      },
      {
        name: "Watching the spice flow",
        type: ActivityType.Watching,
      },
      {
        name: "Watching over Arrakis",
        type: ActivityType.Watching,
      },
      {
        name: "Playing Dune: Awakening",
        type: ActivityType.Playing,
      },
    ];

    let index = 0;

    const updatePresence = () => {
      const status = statuses[index];

      client.user.setPresence({
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
    setInterval(updatePresence, 30_000);

    logger.info(`Ready! Logged in as ${client.user.tag}.`);
    client.auditLogInterval = startAuditLogForwarder(client);

    try {
      if (client.discordAdapter) {
        await ensurePlayerLinkPanel(
          client,
          client.discordAdapterLinkPanelChannelId,
        );
        await ensureBlueprintUploadPanel(
          client,
          client.discordAdapterBlueprintPanelChannelId,
        );
      }
      await ensureRolePanel(client, client.discordRolePanelChannelId);
      await ensureVerificationPanel(client, client.discordVerifyChannelId);
      await ensureRulesPanel(client, client.discordRulesChannelId);
      await ensureServerInfoPanel(client, client.discordServerInfoChannelId);
      await announceCurrentVersion(client, client.discordAnnouncementChannelId);
      if (client.discordAnnouncementChannelId) {
        const interval = Math.max(client.versionAnnouncementIntervalMinutes, 1) * 60_000;
        client.versionAnnouncementInterval = setInterval(
          () => announceCurrentVersion(client, client.discordAnnouncementChannelId),
          interval,
        );
      }
    } catch (error) {
      logger.error("Unable to publish Discord Adapter panels.", error);
    }
  },
};
