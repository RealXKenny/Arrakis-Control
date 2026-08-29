const { MessageFlags } = require("discord.js");
const { getConfiguredRoleIds } = require("../../../shared/constants/selfAssignableRoles");

module.exports = {
  customId: "self-assignable-roles",

  async execute(interaction) {
    const allowedIds = getConfiguredRoleIds();
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
