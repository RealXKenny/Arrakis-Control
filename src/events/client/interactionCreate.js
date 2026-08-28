const { Events } = require('discord.js');
const { createLogger } = require('../../core/logger');

const logger = createLogger('INTERACTIONS');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) {
      logger.warn(`No command registered for /${interaction.commandName}.`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      logger.error(`Error executing /${interaction.commandName}.`, error);
      const response = { content: 'There was an error while running this command.', ephemeral: true };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(response);
      } else {
        await interaction.reply(response);
      }
    }
  },
};
