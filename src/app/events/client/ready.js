const { ActivityType, Events } = require('discord.js');
const { createLogger } = require('../../../infrastructure/core/logger');
const { ensurePlayerLinkPanel } = require('../../../modules/panels/playerLinkPanel');
const { ensureBlueprintUploadPanel } = require('../../../modules/panels/blueprintUploadPanel');

const logger = createLogger('DISCORD');

module.exports = {
  name: Events.ClientReady,
  once: true,

  async execute(client) {
    const serverName = process.env.SERVER_NAME || 'Dune: Awakening Community Server';

    const statuses = [
      {
        name: 'Watching the sands of Arrakis',
        type: ActivityType.Watching,
      },
      {
        name: `Playing ${serverName}`,
        type: ActivityType.Playing,
      },
      {
        name: 'Watching the spice flow',
        type: ActivityType.Watching,
      },
      {
        name: 'Watching over Arrakis',
        type: ActivityType.Watching,
      },
      {
        name: 'Playing Dune: Awakening',
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
        status: 'online',
      });

      index = (index + 1) % statuses.length;
    };

    updatePresence();
    setInterval(updatePresence, 30_000);

    logger.info(`Ready! Logged in as ${client.user.tag}.`);

    if (!client.discordAdapter) return;

    try {
      await ensurePlayerLinkPanel(client, client.discordAdapterLinkPanelChannelId);
      await ensureBlueprintUploadPanel(client, client.discordAdapterBlueprintPanelChannelId);
    } catch (error) {
      logger.error('Unable to publish Discord Adapter panels.', error);
    }
  },
};
