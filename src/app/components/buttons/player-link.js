const {
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  MessageFlags,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');
const { createActorContext } = require('../../../shared/utils/createActorContext');
const { createV2Response } = require('../../../shared/utils/componentFactory');

module.exports = {
  customId: 'player-link',
  async execute(interaction) {
    if (!interaction.client.discordAdapter)
      throw new Error('Discord Adapter integration is not configured.');
    const linked = await interaction.client.discordAdapter.getCurrentPlayer(
      createActorContext(interaction, 'player-link'),
    );
    if (linked?.linked === true) {
      const name = linked.characterName ?? 'your Dune character';
      const card = new ContainerBuilder()
        .setAccentColor(0xd2a85a)
        .addTextDisplayComponents((text) => text.setContent('## Account already linked'))
        .addTextDisplayComponents((text) =>
          text.setContent(
            `Your Discord account is already linked to **${name}**. Unlink it below if you want to connect a different character.`,
          ),
        )
        .addActionRowComponents((row) =>
          row.setComponents(
            new ButtonBuilder()
              .setCustomId('player-unlink')
              .setLabel('Unlink Account')
              .setStyle(ButtonStyle.Danger),
          ),
        );
      await interaction.reply({
        ...createV2Response([card]),
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      });
      return;
    }
    const modal = new ModalBuilder()
      .setCustomId('player-link-modal')
      .setTitle('Link Dune Character')
      .addLabelComponents((label) =>
        label
          .setLabel('Character name')
          .setTextInputComponent(
            new TextInputBuilder()
              .setCustomId('character-name')
              .setStyle(TextInputStyle.Short)
              .setPlaceholder('Enter your exact in-game character name')
              .setRequired(true)
              .setMaxLength(80),
          ),
      );

    await interaction.showModal(modal);
  },
};
