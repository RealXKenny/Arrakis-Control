const { MessageFlags } = require('discord.js');
const { createActorContext } = require('../../../shared/utils/createActorContext');

module.exports = {
  customId: 'player-verify-modal',
  async execute(interaction) {
    if (!interaction.client.discordAdapter) throw new Error('Discord Adapter integration is not configured.');
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const code = interaction.fields.getTextInputValue('verification-code').trim().toUpperCase();
    const result = await interaction.client.discordAdapter.verifyPlayerLink(
      createActorContext(interaction, 'player-verify'),
      code,
    );
    await interaction.editReply(result?.message ?? 'Your Dune character has been linked.');
    if (result?.ok) await interaction.client.auditLogger.playerLinked(interaction, result);
  },
};
