const {
  ContainerBuilder,
  MessageFlags,
  SeparatorSpacingSize,
  SlashCommandBuilder,
} = require('discord.js');
const { formatServerStatus } = require('../../formatters/serverStatus');
const { createLogger } = require('../../core/logger');

const logger = createLogger('SERVER STATUS');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Show the current Dune server status.'),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const status = await interaction.client.duneApi.call('GET', '/api/server/status');
      const formatted = formatServerStatus(status);
      const statusCard = new ContainerBuilder()
        .setAccentColor(formatted.healthy ? 0x57F287 : 0xFEE75C)
        .addTextDisplayComponents((text) => text.setContent('## Dune server status'))
        .addTextDisplayComponents((text) => text.setContent(formatted.overview || 'No overview data reported.'))
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents((text) => text.setContent(`### Game servers\n${formatted.gameServers}`))
        .addTextDisplayComponents((text) => text.setContent(`### Containers\n${formatted.containers}`))
        .addTextDisplayComponents((text) => text.setContent(`### Listeners\n${formatted.listeners}`))
        .addTextDisplayComponents((text) => text.setContent(`### Automation\n${formatted.automation || 'Not configured.'}`));

      await interaction.editReply({
        content: null,
        embeds: null,
        components: [statusCard],
        flags: MessageFlags.IsComponentsV2,
      });
    } catch (error) {
      const errorCard = new ContainerBuilder()
        .setAccentColor(0xED4245)
        .addTextDisplayComponents((text) => text.setContent('## Dune server status'))
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents((text) => text.setContent('Unable to retrieve the server status. Please try again later.'));

      await interaction.editReply({
        content: null,
        embeds: null,
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2,
      });
      logger.error('Unable to retrieve the Dune server status.', error);
    }
  },
};
