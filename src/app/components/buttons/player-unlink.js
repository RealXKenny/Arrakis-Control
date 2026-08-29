const { MessageFlags } = require('discord.js');
const { createActorContext } = require('../../../shared/utils/createActorContext');

module.exports = {
  customId: 'player-unlink',
  async execute(interaction) {
    if (!interaction.client.discordAdapter)
      throw new Error('Discord Adapter integration is not configured.');
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const result = await interaction.client.discordAdapter.unlinkPlayer(
      createActorContext(interaction, 'player-unlink'),
    );
    await interaction.editReply(result?.message ?? 'Your Dune character has been unlinked.');
    if (result?.ok) await interaction.client.auditLogger.playerUnlinked(interaction);
  },
};
