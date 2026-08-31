"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const staffAccess_1 = require("../../../shared/utils/staffAccess");
const componentFactory_1 = require("../../../shared/factories/componentFactory");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("timeout")
        .setDescription("Timeout a member.")
        .addUserOption((option) => option
        .setName("user")
        .setDescription("Member to timeout.")
        .setRequired(true))
        .addIntegerOption((option) => option
        .setName("minutes")
        .setDescription("Timeout duration in minutes.")
        .setMinValue(1)
        .setMaxValue(40320)
        .setRequired(true))
        .addStringOption((option) => option
        .setName("reason")
        .setDescription("Reason for the timeout.")),
    async execute(interaction) {
        if (!interaction.guild) {
            await denyServerOnly(interaction);
            return;
        }
        const guild = interaction.guild;
        const member = await guild.members
            .fetch(interaction.user.id)
            .catch(() => null);
        if (!member) {
            await deny(interaction);
            return;
        }
        if (!(0, staffAccess_1.hasStaffRole)(member)) {
            await deny(interaction);
            return;
        }
        const user = interaction.options.getUser("user", true);
        const targetMember = await guild.members
            .fetch(user.id)
            .catch(() => null);
        if (!targetMember?.moderatable) {
            const card = new discord_js_1.ContainerBuilder()
                .setAccentColor(0x8f3025)
                .addTextDisplayComponents((text) => text.setContent("## ❌ Unable to Timeout"))
                .addSeparatorComponents((separator) => separator.setSpacing(discord_js_1.SeparatorSpacingSize.Small))
                .addTextDisplayComponents((text) => text.setContent(`I can't timeout **${user.tag}**. They may have a higher role than the bot or cannot be moderated.`));
            await interaction.reply({
                ...(0, componentFactory_1.createV2Response)([card]),
                flags: discord_js_1.MessageFlags.IsComponentsV2,
                allowedMentions: {
                    parse: [],
                },
            });
            return;
        }
        const minutes = interaction.options.getInteger("minutes", true);
        const reason = interaction.options.getString("reason") ??
            `Timed out by ${interaction.user.tag}`;
        await targetMember.timeout(minutes * 60_000, reason);
        const card = new discord_js_1.ContainerBuilder()
            .setAccentColor(0xc58b45)
            .addTextDisplayComponents((text) => text.setContent("## 🔇 Member Timed Out"))
            .addSeparatorComponents((separator) => separator.setSpacing(discord_js_1.SeparatorSpacingSize.Small))
            .addTextDisplayComponents((text) => text.setContent([
            "### 📋 Timeout Summary",
            `**User:** ${user.tag}`,
            `**Duration:** ${minutes} minute${minutes === 1 ? "" : "s"}`,
            `**Reason:** ${reason}`,
        ].join("\n")))
            .addSeparatorComponents((separator) => separator.setSpacing(discord_js_1.SeparatorSpacingSize.Small))
            .addTextDisplayComponents((text) => text.setContent(`-# Timed out by ${interaction.user.tag}`));
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
async function denyServerOnly(interaction) {
    const card = new discord_js_1.ContainerBuilder()
        .setAccentColor(0x8f3025)
        .addTextDisplayComponents((text) => text.setContent("## ⚠️ Server Only"))
        .addSeparatorComponents((separator) => separator.setSpacing(discord_js_1.SeparatorSpacingSize.Small))
        .addTextDisplayComponents((text) => text.setContent("This command can only be used inside a server."));
    await interaction.reply({
        ...(0, componentFactory_1.createV2Response)([card]),
        flags: discord_js_1.MessageFlags.IsComponentsV2,
    });
}
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("timeout")
        .setDescription("Timeout a member.")
        .addUserOption((option) => option
        .setName("user")
        .setDescription("Member to timeout.")
        .setRequired(true))
        .addIntegerOption((option) => option
        .setName("minutes")
        .setDescription("Timeout duration in minutes.")
        .setMinValue(1)
        .setMaxValue(40320)
        .setRequired(true))
        .addStringOption((option) => option
        .setName("reason")
        .setDescription("Reason for the timeout.")),
    execute: async (interaction) => {
        if (!interaction.guild) {
            await denyServerOnly(interaction);
            return;
        }
        const guild = interaction.guild;
        const member = await guild.members
            .fetch(interaction.user.id)
            .catch(() => null);
        if (!member || !(0, staffAccess_1.hasStaffRole)(member)) {
            await deny(interaction);
            return;
        }
        const user = interaction.options.getUser("user", true);
        const targetMember = await guild.members
            .fetch(user.id)
            .catch(() => null);
        if (!targetMember?.moderatable) {
            const card = new discord_js_1.ContainerBuilder()
                .setAccentColor(0x8f3025)
                .addTextDisplayComponents((text) => text.setContent("## ❌ Unable to Timeout"))
                .addSeparatorComponents((separator) => separator.setSpacing(discord_js_1.SeparatorSpacingSize.Small))
                .addTextDisplayComponents((text) => text.setContent(`I can't timeout **${user.tag}**. They may have a higher role than the bot or cannot be moderated.`));
            await interaction.reply({
                ...(0, componentFactory_1.createV2Response)([card]),
                flags: discord_js_1.MessageFlags.IsComponentsV2,
                allowedMentions: {
                    parse: [],
                },
            });
            return;
        }
        const minutes = interaction.options.getInteger("minutes", true);
        const reason = interaction.options.getString("reason") ??
            `Timed out by ${interaction.user.tag}`;
        await targetMember.timeout(minutes * 60_000, reason);
        const card = new discord_js_1.ContainerBuilder()
            .setAccentColor(0xc58b45)
            .addTextDisplayComponents((text) => text.setContent("## 🔇 Member Timed Out"))
            .addSeparatorComponents((separator) => separator.setSpacing(discord_js_1.SeparatorSpacingSize.Small))
            .addTextDisplayComponents((text) => text.setContent([
            "### 📋 Timeout Summary",
            `**User:** ${user.tag}`,
            `**Duration:** ${minutes} minute${minutes === 1 ? "" : "s"}`,
            `**Reason:** ${reason}`,
        ].join("\n")))
            .addSeparatorComponents((separator) => separator.setSpacing(discord_js_1.SeparatorSpacingSize.Small))
            .addTextDisplayComponents((text) => text.setContent(`-# Timed out by ${interaction.user.tag}`));
        await interaction.reply({
            ...(0, componentFactory_1.createV2Response)([card]),
            flags: discord_js_1.MessageFlags.IsComponentsV2,
            allowedMentions: {
                parse: [],
            },
        });
    },
};
