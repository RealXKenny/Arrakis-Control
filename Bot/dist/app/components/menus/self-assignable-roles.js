"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const selfAssignableRoles_1 = require("../../../shared/constants/selfAssignableRoles");
module.exports = {
    customId: "self-assignable-roles",
    async execute(interaction) {
        const allowedIds = (0, selfAssignableRoles_1.getConfiguredRoleIds)();
        const selectedIds = interaction.values.filter((id) => allowedIds.has(id));
        if (!interaction.guild) {
            throw new Error("Self-assignable roles can only be used inside a guild.");
        }
        const member = await interaction.guild.members.fetch(interaction.user.id);
        if (!(member instanceof discord_js_1.GuildMember)) {
            throw new Error("Unable to resolve the interacting guild member.");
        }
        const removableIds = [...allowedIds].filter((id) => member.roles.cache.has(id));
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
            flags: discord_js_1.MessageFlags.Ephemeral,
        });
    },
};
