const { SlashCommandBuilder } = require('discord.js');
const { reloadCommands } = require('../../../infrastructure/loaders/commandLoader');
const { reloadComponentHandlers } = require('../../../infrastructure/loaders/componentLoader');

const RELOAD_ROLE_ID = '1539721769244565566';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reload')
    .setDescription('Reload bot modules without restarting the process.')
    .addStringOption((option) =>
      option
        .setName('area')
        .setDescription('Area to reload')
        .setRequired(true)
        .addChoices(
          { name: 'Commands', value: 'commands' },
          { name: 'Components', value: 'components' },
          { name: 'All', value: 'all' },
        ),
    ),
  async execute(interaction) {
    if (!interaction.member?.roles?.cache?.has(RELOAD_ROLE_ID))
      return interaction.reply({
        content: 'You are not authorized to reload bot modules.',
        ephemeral: true,
      });
    const area = interaction.options.getString('area', true);
    const results = {};
    if (area === 'commands' || area === 'all')
      results.commands = reloadCommands(interaction.client).loaded;
    if (area === 'components' || area === 'all')
      results.components = reloadComponentHandlers(interaction.client).loaded;
    await interaction.reply(
      `Reloaded ${results.commands ?? 0} commands and ${results.components ?? 0} component handlers.`,
    );
  },
};
