"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const createActorContext_1 = require("../../../shared/utils/createActorContext");
const logger_1 = require("../../../infrastructure/core/logger");
const logger = (0, logger_1.createLogger)("PLAYER LINK");
module.exports = {
    customId: "player-link-modal",
    async execute(interaction) {
        if (!interaction.client.discordAdapter) {
            throw new Error("Discord Adapter integration is not configured.");
        }
        await interaction.deferReply({
            flags: discord_js_1.MessageFlags.Ephemeral,
        });
        const characterName = interaction.fields
            .getTextInputValue("character-name")
            .trim();
        const result = (await interaction.client.discordAdapter.linkPlayer((0, createActorContext_1.createActorContext)(interaction, "player-link"), characterName));
        logger.debug("Link request response received.", {
            ok: result?.ok ?? false,
            message: result?.message ?? null,
            characterName: result?.characterName ??
                result?.character_name ??
                characterName,
            onlineStatus: result?.onlineStatus ??
                result?.online_status ??
                null,
            responseFields: Object.keys(result ?? {}),
        });
        if (!result?.ok) {
            await interaction.editReply(result?.error ??
                "Unable to start character linking.");
            return;
        }
        await interaction.client.auditLogger?.playerLinkRequested(interaction, result);
        const verificationCard = new discord_js_1.ContainerBuilder()
            .setAccentColor(0x57f287)
            .addTextDisplayComponents((text) => text.setContent("## Verification code sent"))
            .addTextDisplayComponents((text) => text.setContent(result.message ??
            "A private verification code was sent to your character in-game."))
            .addSeparatorComponents((separator) => separator.setSpacing(discord_js_1.SeparatorSpacingSize.Small))
            .addActionRowComponents((row) => row.setComponents(new discord_js_1.ButtonBuilder()
            .setCustomId("player-verify")
            .setLabel("Verify Code")
            .setStyle(discord_js_1.ButtonStyle.Success)));
        await interaction.editReply({
            content: null,
            components: [verificationCard],
            flags: discord_js_1.MessageFlags.IsComponentsV2,
        });
    },
};
