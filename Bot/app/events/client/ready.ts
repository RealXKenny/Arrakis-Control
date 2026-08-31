import {
  ActivityType,
  Events,
} from "discord.js";

import type { BotClient } from "../../../infrastructure/core/BotApplication";

import { createLogger } from "../../../infrastructure/core/logger";

import {
  ensurePlayerLinkPanel,
} from "../../../modules/panels/playerLinkPanel";

import {
  ensureBlueprintUploadPanel,
} from "../../../modules/panels/blueprintUploadPanel";

import {
  ensureRolePanel,
} from "../../../modules/panels/rolePanel";

import {
  ensureVerificationPanel,
} from "../../../modules/panels/verificationPanel";

import {
  ensureRulesPanel,
} from "../../../modules/panels/rulesPanel";

import {
  ensureServerInfoPanel,
} from "../../../modules/panels/serverInfoPanel";

import {
  announceCurrentVersion,
} from "../../../modules/panels/versionAnnouncement";

import {
  startAuditLogForwarder,
} from "../../../modules/audit/DiscordAuditLogForwarder";

const logger = createLogger("DISCORD");

module.exports = {
  name: Events.ClientReady,
  once: true,

  async execute(client: BotClient): Promise<void> {
    const serverName =
      process.env.SERVER_NAME ||
      "Dune: Awakening Community Server";

    const statuses: Array<{
      name: string;
      type: ActivityType;
    }> = [
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


    if (!client.user) {
      logger.error(
        "Client reported ready, but no Discord user is available.",
      );
      return;
    }

    const botUser = client.user;

    let index = 0;

    const updatePresence = (): void => {
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

    client.presenceInterval = setInterval(
      updatePresence,
      30_000,
    );

    logger.info(
      `Ready! Logged in as ${botUser.tag}.`,
    );

    client.auditLogInterval =
      startAuditLogForwarder(client);

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

      await ensureRolePanel(
        client,
        client.discordRolePanelChannelId,
      );

      await ensureVerificationPanel(
        client,
        client.discordVerifyChannelId,
      );

      await ensureRulesPanel(
        client,
        client.discordRulesChannelId,
      );

      await ensureServerInfoPanel(
        client,
        client.discordServerInfoChannelId,
      );

      await announceCurrentVersion(
        client,
        client.discordAnnouncementChannelId,
      );

      if (client.discordAnnouncementChannelId) {
        const intervalMinutes = Math.max(
          Number(
            client.versionAnnouncementIntervalMinutes,
          ) || 5,
          1,
        );

        client.versionAnnouncementInterval =
          setInterval(
            () =>
              announceCurrentVersion(
                client,
                client.discordAnnouncementChannelId,
              ).catch((error: unknown) => {
                logger.error(
                  "Unable to check for new version announcements.",
                  error,
                );
              }),
            intervalMinutes * 60_000,
          );
      }
    } catch (error: unknown) {
      logger.error(
        "Unable to publish Discord panels.",
        error,
      );
    }
  },
};