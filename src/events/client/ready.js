const { Events } = require('discord.js');
const { createLogger } = require('../../core/logger');

const logger = createLogger('DISCORD');

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    logger.info(`Ready! Logged in as ${client.user.tag}.`);
  },
};
