"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const staffAccess_1 = require("../../../shared/utils/staffAccess");
const componentFactory_1 = require("../../../shared/factories/componentFactory");
const logger_1 = require("../../../infrastructure/core/logger");
const logger = (0, logger_1.createLogger)("PURGE");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("purge")
        .setDescription("Delete recent messages from this channel.")
        .addIntegerOption((option) => option
        .setName("amount")
        .setDescription("Number of messages to delete (1–100).")
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true)),
    async execute(interaction) {
        if (!interaction.inGuild()) {
            const card = new discord_js_1.ContainerBuilder()
                .setAccentColor(0x8f3025)
                .addTextDisplayComponents((text) => text.setContent("## ⚠️ Server Only"))
                .addSeparatorComponents((separator) => separator.setSpacing(discord_js_1.SeparatorSpacingSize.Small))
                .addTextDisplayComponents((text) => text.setContent("This command can only be used inside a server."));
            await interaction.reply({
                ...(0, componentFactory_1.createV2Response)([card]),
                flags: discord_js_1.MessageFlags.IsComponentsV2,
            });
            return;
        }
        const guild = interaction.guild;
        if (!guild) {
            throw new Error("Guild could not be resolved.");
        }
        const member = await guild.members.fetch(interaction.user.id);
        if (!(0, staffAccess_1.hasStaffRole)(member)) {
            const card = new discord_js_1.ContainerBuilder()
                .setAccentColor(0x8f3025)
                .addTextDisplayComponents((text) => text.setContent("## 🔒 Permission Denied"))
                .addSeparatorComponents((separator) => separator.setSpacing(discord_js_1.SeparatorSpacingSize.Small))
                .addTextDisplayComponents((text) => text.setContent("You need a configured staff role to use this command."));
            await interaction.reply({
                ...(0, componentFactory_1.createV2Response)([card]),
                flags: discord_js_1.MessageFlags.IsComponentsV2,
            });
            return;
        }
        const amount = interaction.options.getInteger("amount", true);
        try {
            if (!interaction.channel?.isTextBased()) {
                throw new Error("This command can only be used in a text channel.");
            }
            // Purge first so the response itself cannot be deleted.
            const deleted = await interaction.channel.bulkDelete(amount, true);
            const card = new discord_js_1.ContainerBuilder()
                .setAccentColor(0xc58b45)
                .addTextDisplayComponents((text) => text.setContent("## 🧹 Messages Purged"))
                .addSeparatorComponents((separator) => separator.setSpacing(discord_js_1.SeparatorSpacingSize.Small))
                .addTextDisplayComponents((text) => text.setContent([
                "### 📋 Purge Summary",
                `**Requested:** ${amount}`,
                `**Deleted:** ${deleted.size}`,
            ].join("\n")))
                .addSeparatorComponents((separator) => separator.setSpacing(discord_js_1.SeparatorSpacingSize.Small))
                .addTextDisplayComponents((text) => text.setContent(`-# Purged by ${interaction.user.tag}`));
            await interaction.reply({
                ...(0, componentFactory_1.createV2Response)([card]),
                flags: discord_js_1.MessageFlags.IsComponentsV2,
                allowedMentions: {
                    parse: [],
                },
            });
        }
        catch (error) {
            logger.error("Failed to purge messages", {
                error,
                guildId: interaction.guildId,
                channelId: interaction.channelId,
                userId: interaction.user.id,
                amount,
            });
            const card = new discord_js_1.ContainerBuilder()
                .setAccentColor(0x8f3025)
                .addTextDisplayComponents((text) => text.setContent("## ❌ Purge Failed"))
                .addSeparatorComponents((separator) => separator.setSpacing(discord_js_1.SeparatorSpacingSize.Small))
                .addTextDisplayComponents((text) => text.setContent("I couldn't delete the requested messages. Make sure I have the required permissions and that this is a supported text channel."));
            await interaction.reply({
                ...(0, componentFactory_1.createV2Response)([card]),
                flags: discord_js_1.MessageFlags.IsComponentsV2,
                allowedMentions: {
                    parse: [],
                },
            });
        }
    },
};
