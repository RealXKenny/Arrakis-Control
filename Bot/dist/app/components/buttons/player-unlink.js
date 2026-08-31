"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const createActorContext_1 = require("../../../shared/utils/createActorContext");
module.exports = {
    customId: "player-unlink",
    async execute(interaction) {
        if (!interaction.client.discordAdapter) {
            throw new Error("Discord Adapter integration is not configured.");
        }
        await interaction.deferReply({
            flags: discord_js_1.MessageFlags.Ephemeral,
        });
        const result = await interaction.client.discordAdapter.unlinkPlayer((0, createActorContext_1.createActorContext)(interaction, "player-unlink"));
        await interaction.editReply(result?.message ??
            "Your Dune character has been unlinked.");
        if (result?.ok) {
            await interaction.client.auditLogger?.playerUnlinked(interaction);
        }
    },
};
