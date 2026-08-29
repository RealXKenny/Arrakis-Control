const {
  ActionRowBuilder,
  ContainerBuilder,
  MessageFlags,
  StringSelectMenuBuilder,
  SlashCommandBuilder,
} = require("discord.js");

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
      .addOptions(getRoleOptions());

    await interaction.reply({
      components: [
        container,
        new ActionRowBuilder().addComponents(menu),
      ],
      flags: MessageFlags.IsComponentsV2,
    });
  },
};

function getRoleOptions() {
  return [
    ["⚔️ PvP", "Find warriors and join the fight.", "ROLE_PVP_ID"],
    ["🏹 PvE", "Hunt bosses, explore and conquer the desert.", "ROLE_PVE_ID"],
    ["🏗️ Builder", "Turn sand into strongholds.", "ROLE_BUILDER_ID"],
    ["⛏️ Crafter", "Gathering, crafting and production.", "ROLE_CRAFTER_ID"],
    ["💰 Trader", "Trade resources and dominate the Spice Market.", "ROLE_TRADER_ID"],
    ["🧭 Explorer", "Explore Arrakis and uncover its secrets.", "ROLE_EXPLORER_ID"],
    ["🔥 Endgame", "Take on the hardest content.", "ROLE_ENDGAME_ID"],
    ["🦅 House Atreides", "Honor, discipline and duty.", "ROLE_ATREIDES_ID"],
    ["🐍 House Harkonnen", "Power, ambition and domination.", "ROLE_HARKONNEN_ID"],
    ["🌵 Fremen", "Adapt to the desert. Become part of Arrakis.", "ROLE_FREMEN_ID"],
    ["⚖️ Neutral", "Walk your own path.", "ROLE_NEUTRAL_ID"],
    ["📢 Announcements", "Important server updates.", "ROLE_ANNOUNCEMENTS_ID"],
    ["🎉 Events", "Community events and activities.", "ROLE_EVENTS_ID"],
    ["☠️ PvP Alerts", "PvP-related announcements.", "ROLE_PVP_ALERTS_ID"],
    ["🏦 Market Alerts", "Trading and marketplace updates.", "ROLE_MARKET_ALERTS_ID"],
    ["👥 LFG Alerts", "Looking-for-group notifications.", "ROLE_LFG_ALERTS_ID"],
  ]
    .map(([name, description, envName]) => ({
      label: name,
      description,
      value: process.env[envName],
    }))
    .filter((option) => option.value && !option.value.startsWith("replace_with_"));
}
