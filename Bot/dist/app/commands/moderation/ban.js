"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const staffAccess_1 = require("../../../shared/utils/staffAccess");
const componentFactory_1 = require("../../../shared/factories/componentFactory");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("ban")
        .setDescription("Ban a member from the server.")
        .addUserOption((option) => option
        .setName("user")
        .setDescription("Member to ban.")
        .setRequired(true))
        .addStringOption((option) => option
        .setName("reason")
        .setDescription("Reason for the ban.")),
    async execute(interaction) {
        if (!interaction.inGuild()) {
            await deny(interaction);
            return;
        }
        const guild = interaction.guild;
        if (!guild) {
            throw new Error("Guild could not be resolved.");
        }
        const staffMember = await guild.members
            .fetch(interaction.user.id)
            .catch(() => null);
        if (!(0, staffAccess_1.hasStaffRole)(staffMember)) {
            await deny(interaction);
            return;
        }
        const user = interaction.options.getUser("user", true);
        const member = await guild.members
            .fetch(user.id)
            .catch(() => null);
        if (!member?.bannable) {
            const card = new discord_js_1.ContainerBuilder()
                .setAccentColor(0x8f3025)
                .addTextDisplayComponents((text) => text.setContent("## ❌ Unable to Ban"))
                .addSeparatorComponents((separator) => separator.setSpacing(discord_js_1.SeparatorSpacingSize.Small))
                .addTextDisplayComponents((text) => text.setContent(`I can't ban **${user.tag}**. They may have a higher role than the bot or cannot be banned.`));
            await interaction.reply({
                ...(0, componentFactory_1.createV2Response)([card]),
                flags: discord_js_1.MessageFlags.IsComponentsV2,
                allowedMentions: {
                    parse: [],
                },
            });
            return;
        }
        const reason = interaction.options.getString("reason") ??
            `Banned by ${interaction.user.tag}`;
        await member.ban({ reason });
        const card = new discord_js_1.ContainerBuilder()
            .setAccentColor(0x8f3025)
            .addTextDisplayComponents((text) => text.setContent("## 🔨 Member Banned"))
            .addSeparatorComponents((separator) => separator.setSpacing(discord_js_1.SeparatorSpacingSize.Small))
            .addTextDisplayComponents((text) => text.setContent([
            "### 📋 Ban Summary",
            `**User:** ${user.tag}`,
            `**Reason:** ${reason}`,
        ].join("\n")))
            .addSeparatorComponents((separator) => separator.setSpacing(discord_js_1.SeparatorSpacingSize.Small))
            .addTextDisplayComponents((text) => text.setContent(`-# Banned by ${interaction.user.tag}`));
        await interaction.reply({
            ...(0, componentFactory_1.createV2Response)([card]),
            flags: discord_js_1.MessageFlags.IsComponentsV2,
            allowedMentions: {
                parse: [],
            },
        });
    },
};
async function deny(interaction) {
    const card = new discord_js_1.ContainerBuilder()
        .setAccentColor(0x8f3025)
        .addTextDisplayComponents((text) => text.setContent("## 🔒 Permission Denied"))
        .addSeparatorComponents((separator) => separator.setSpacing(discord_js_1.SeparatorSpacingSize.Small))
        .addTextDisplayComponents((text) => text.setContent("You need a configured staff role to use this command."));
    await interaction.reply({
        ...(0, componentFactory_1.createV2Response)([card]),
        flags: discord_js_1.MessageFlags.IsComponentsV2,
    });
}
