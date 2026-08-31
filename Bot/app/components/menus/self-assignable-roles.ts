import {
  GuildMember,
  MessageFlags,
  StringSelectMenuInteraction,
} from "discord.js";

import {
  getConfiguredRoleIds,
} from "../../../shared/constants/selfAssignableRoles";

module.exports = {
  customId: "self-assignable-roles",

  async execute(
    interaction: StringSelectMenuInteraction,
  ): Promise<void> {
    const allowedIds = getConfiguredRoleIds();

    const selectedIds = interaction.values.filter((id) =>
      allowedIds.has(id),
    );

    if (!interaction.guild) {
      throw new Error(
        "Self-assignable roles can only be used inside a guild.",
      );
    }

    const member = await interaction.guild.members.fetch(
      interaction.user.id,
    );

    if (!(member instanceof GuildMember)) {
      throw new Error(
        "Unable to resolve the interacting guild member.",
      );
    }

    const removableIds = [...allowedIds].filter((id) =>
      member.roles.cache.has(id),
    );

    if (removableIds.length > 0) {
      await member.roles.remove(
        removableIds,
        "Self-assignable role update",
      );
    }

    if (selectedIds.length > 0) {
      await member.roles.add(
        selectedIds,
        "Self-assignable role selection",
      );
    }

    await interaction.reply({
      content: selectedIds.length
        ? `Your roles were updated. Selected ${
            selectedIds.length
          } role${
            selectedIds.length === 1 ? "" : "s"
          }.`
        : "Your self-assignable roles were cleared.",
      flags: MessageFlags.Ephemeral,
    });
  },
};