const { Events, MessageFlags } = require('discord.js');
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
      const response = {
        content: 'There was an error while running this command.',
        flags: MessageFlags.Ephemeral,
      };

      try {
        if (interaction.deferred) {
          await interaction.editReply(response);
        } else if (interaction.replied) {
          await interaction.followUp(response);
        } else {
          await interaction.reply(response);
        }
      } catch (responseError) {
        logger.error('Unable to send the command error response.', responseError);
      }
    }
  },
};
