const { ContainerBuilder, MessageFlags, SeparatorSpacingSize, SlashCommandBuilder } = require("discord.js");
const { createActorContext } = require("../../../shared/utils/createActorContext");

module.exports = {
  data: new SlashCommandBuilder().setName("profile").setDescription("Show your linked Dune player profile."),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    if (!interaction.client.discordAdapter) {
      await interaction.editReply("The Discord Adapter integration is not configured.");
      return;
    }

    const player = await interaction.client.discordAdapter.getCurrentPlayer(createActorContext(interaction, "/profile"));
    const linked = player?.linked === true;
    const card = new ContainerBuilder()
      .setAccentColor(linked ? 0x57F287 : 0xC58B45)
      .addTextDisplayComponents((text) => text.setContent("## Your Dune Player"))
      .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
      .addTextDisplayComponents((text) => text.setContent(linked
        ? [`**Character:** ${player.characterName ?? "Unknown"}`, `**Status:** ${player.onlineStatus ?? "Unknown"}`, `**Controller ID:** ${player.controllerId ?? "Unknown"}`, `**Pawn ID:** ${player.pawnId ?? "Unknown"}`].join("\n")
        : (player?.message ?? "You do not have a linked Dune character yet.")));

    await interaction.editReply({ content: null, embeds: null, components: [card], flags: MessageFlags.IsComponentsV2 });
  },
};
