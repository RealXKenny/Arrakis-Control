const {
  ActionRowBuilder,
  ContainerBuilder,
  MessageFlags,
  StringSelectMenuBuilder,
  SlashCommandBuilder,
} = require("discord.js");
const { getConfiguredRoleOptions } = require("../../../shared/constants/selfAssignableRoles");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("roles")
    .setDescription("Choose your playstyle, faction, and notification roles."),

  async execute(interaction) {
    if (!interaction.inGuild()) {
      await interaction.reply({
        content: "This command can only be used inside a server.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const container = new ContainerBuilder()
      .setAccentColor(0xc58b45)
      .addTextDisplayComponents((text) =>
        text.setContent("## Choose Your Arrakis Roles"),
      )
      .addTextDisplayComponents((text) =>
        text.setContent(
          "Select the roles that match your playstyle, faction, and notification preferences.\n\n**Playstyle:** PvP • PvE • Builder • Crafter • Trader • Explorer • Endgame\n**Factions:** House Atreides • House Harkonnen • Fremen • Neutral\n**Notifications:** Announcements • Events • PvP Alerts • Market Alerts • LFG Alerts",
        ),
      );
    const menu = new StringSelectMenuBuilder()
      .setCustomId("self-assignable-roles")
      .setPlaceholder("Choose your roles")
      .setMinValues(0)
      .setMaxValues(10)
      .addOptions(getConfiguredRoleOptions());

    await interaction.reply({
      components: [
        container,
        new ActionRowBuilder().addComponents(menu),
      ],
      flags: MessageFlags.IsComponentsV2,
    });
  },
};
