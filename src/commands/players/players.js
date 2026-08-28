const {
  ContainerBuilder,
  MessageFlags,
  SeparatorSpacingSize,
  SlashCommandBuilder,
} = require('discord.js');
const { createLogger } = require('../../core/logger');
const { formatPlayers } = require('../../formatters/players');

const logger = createLogger('PLAYERS');
const PAGE_SIZE = 20;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('players')
    .setDescription('Show online and offline Dune players.'),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const [onlineResponse, offlineResponse] = await Promise.all([
        interaction.client.duneApi.call('GET', '/api/players', {
          query: { status: 'online', page: 0, pageSize: PAGE_SIZE },
        }),
        interaction.client.duneApi.call('GET', '/api/players', {
          query: { status: 'offline', page: 0, pageSize: PAGE_SIZE },
        }),
      ]);
      const online = formatPlayers(onlineResponse, 'online');
      const offline = formatPlayers(offlineResponse, 'offline');
      const playersCard = new ContainerBuilder()
        .setAccentColor(0x5865F2)
        .addTextDisplayComponents((text) => text.setContent('## Dune players'))
        .addTextDisplayComponents((text) => text.setContent(`### ${online.heading}\n${online.content}${online.truncated ? `\n_${online.truncated}_` : ''}`))
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents((text) => text.setContent(`### ${offline.heading}\n${offline.content}${offline.truncated ? `\n_${offline.truncated}_` : ''}`));

      await interaction.editReply({
        content: null,
        embeds: null,
        components: [playersCard],
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { parse: [] },
      });
    } catch (error) {
      const errorCard = new ContainerBuilder()
        .setAccentColor(0xED4245)
        .addTextDisplayComponents((text) => text.setContent('## Dune players'))
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents((text) => text.setContent('Unable to retrieve the player lists. Please try again later.'));

      await interaction.editReply({
        content: null,
        embeds: null,
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2,
      });
      logger.error('Unable to retrieve Dune player lists.', error);
    }
  },
};
