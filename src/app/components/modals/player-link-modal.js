const {
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  MessageFlags,
  SeparatorSpacingSize,
} = require('discord.js');
const { createActorContext } = require('../../../shared/utils/createActorContext');

module.exports = {
  customId: 'player-link-modal',
  async execute(interaction) {
    if (!interaction.client.discordAdapter)
      throw new Error('Discord Adapter integration is not configured.');
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const characterName = interaction.fields.getTextInputValue('character-name').trim();
    const result = await interaction.client.discordAdapter.linkPlayer(
      createActorContext(interaction, 'player-link'),
      characterName,
    );
    if (!result?.ok) {
      await interaction.editReply(result?.error ?? 'Unable to start character linking.');
      return;
    }

    await interaction.client.auditLogger.playerLinkRequested(interaction, result);

    const verificationCard = new ContainerBuilder()
      .setAccentColor(0x57f287)
      .addTextDisplayComponents((text) => text.setContent('## Verification code sent'))
      .addTextDisplayComponents((text) =>
        text.setContent(
          result.message ?? 'A private verification code was sent to your character in-game.',
        ),
      )
      .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
      .addActionRowComponents((row) =>
        row.setComponents(
          new ButtonBuilder()
            .setCustomId('player-verify')
            .setLabel('Verify Code')
            .setStyle(ButtonStyle.Success),
        ),
      );

    await interaction.editReply({
      content: null,
      embeds: null,
      components: [verificationCard],
      flags: MessageFlags.IsComponentsV2,
    });
  },
};
