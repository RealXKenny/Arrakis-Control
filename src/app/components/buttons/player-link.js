const { ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
  customId: 'player-link',
  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId('player-link-modal')
      .setTitle('Link Dune Character')
      .addLabelComponents((label) => label
        .setLabel('Character name')
        .setTextInputComponent(new TextInputBuilder()
          .setCustomId('character-name')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('Enter your exact in-game character name')
          .setRequired(true)
          .setMaxLength(80)));

    await interaction.showModal(modal);
  },
};
