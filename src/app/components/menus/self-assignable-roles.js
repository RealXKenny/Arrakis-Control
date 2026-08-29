const { MessageFlags } = require("discord.js");

module.exports = {
  customId: "self-assignable-roles",

  async execute(interaction) {
    const allowedIds = parseRoleIds();
    const selectedIds = interaction.values.filter((id) => allowedIds.has(id));
    const member = interaction.member;
    const removableIds = [...allowedIds].filter((id) =>
      member.roles.cache.has(id),
    );

    if (removableIds.length > 0) {
      await member.roles.remove(removableIds, "Self-assignable role update");
    }
    if (selectedIds.length > 0) {
      await member.roles.add(selectedIds, "Self-assignable role selection");
    }

    await interaction.reply({
      content: selectedIds.length
        ? `Your roles were updated. Selected ${selectedIds.length} role${selectedIds.length === 1 ? "" : "s"}.`
        : "Your self-assignable roles were cleared.",
      flags: MessageFlags.Ephemeral,
    });
  },
};

function parseRoleIds() {
  return new Set(
    [
      "ROLE_PVP_ID",
      "ROLE_PVE_ID",
      "ROLE_BUILDER_ID",
      "ROLE_CRAFTER_ID",
      "ROLE_TRADER_ID",
      "ROLE_EXPLORER_ID",
      "ROLE_ENDGAME_ID",
      "ROLE_ATREIDES_ID",
      "ROLE_HARKONNEN_ID",
      "ROLE_FREMEN_ID",
      "ROLE_NEUTRAL_ID",
      "ROLE_ANNOUNCEMENTS_ID",
      "ROLE_EVENTS_ID",
      "ROLE_PVP_ALERTS_ID",
      "ROLE_MARKET_ALERTS_ID",
      "ROLE_LFG_ALERTS_ID",
    ]
      .map((name) => process.env[name])
      .filter((value) => value && !value.startsWith("replace_with_")),
  );
}
