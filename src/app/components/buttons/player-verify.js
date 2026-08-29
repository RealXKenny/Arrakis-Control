const { ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
  customId: 'player-verify',
  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId('player-verify-modal')
      .setTitle('Verify Dune Character')
      .addLabelComponents((label) =>
        label
          .setLabel('Verification code')
          .setTextInputComponent(
            new TextInputBuilder()
              .setCustomId('verification-code')
              .setStyle(TextInputStyle.Short)
              .setPlaceholder('ACP-XXXXXX')
              .setRequired(true)
              .setMinLength(10)
              .setMaxLength(10),
          ),
      );

    await interaction.showModal(modal);
  },
};
