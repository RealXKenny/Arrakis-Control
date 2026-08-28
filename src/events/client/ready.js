const { ActivityType, Events } = require("discord.js");
const { createLogger } = require("../../core/logger");

const logger = createLogger("DISCORD");

module.exports = {
  name: Events.ClientReady,
  once: true,

  execute(client) {
    const serverName = process.env.SERVER_NAME || "Dune: Awakening Community Server";

    const statuses = [
      {
        name: "the sands of Arrakis",
        type: ActivityType.Watching,
      },
      {
        name: serverName,
        type: ActivityType.Playing,
      },
      {
        name: "the spice flow",
        type: ActivityType.Watching,
      },
      {
        name: "over Arrakis",
        type: ActivityType.Watching,
      },
      {
        name: "Dune: Awakening",
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
  },
};
