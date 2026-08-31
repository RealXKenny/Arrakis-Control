"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const staffAccess_1 = require("../../../shared/utils/staffAccess");
const componentFactory_1 = require("../../../shared/factories/componentFactory");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("kick")
        .setDescription("Kick a member from the server.")
        .addUserOption((option) => option
        .setName("user")
        .setDescription("Member to kick.")
        .setRequired(true))
        .addStringOption((option) => option
        .setName("reason")
        .setDescription("Reason for the kick.")),
    async execute(interaction) {
        // Make sure the command is being used inside a server.
        if (!interaction.guild) {
            await deny(interaction);
            return;
        }
        const user = interaction.options.getUser("user", true);
        // Fetch the actual GuildMember so we can safely use
        // GuildMember-specific properties and methods.
        const member = await interaction.guild.members
            .fetch(user.id)
            .catch(() => null);
        // Check staff permissions using the fetched GuildMember.
        if (!(0, staffAccess_1.hasStaffRole)(member)) {
            await deny(interaction);
            return;
        }
        // Make sure the target can actually be kicked.
        if (!member?.kickable) {
            const card = new discord_js_1.ContainerBuilder()
                .setAccentColor(0x8f3025)
                .addTextDisplayComponents((text) => text.setContent("## ❌ Unable to Kick"))
                .addSeparatorComponents((separator) => separator.setSpacing(discord_js_1.SeparatorSpacingSize.Small))
                .addTextDisplayComponents((text) => text.setContent(`I can't kick **${user.tag}**. They may have a higher role than the bot or cannot be kicked.`));
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
            `Kicked by ${interaction.user.tag}`;
        await member.kick(reason);
        const card = new discord_js_1.ContainerBuilder()
            .setAccentColor(0xc58b45)
            .addTextDisplayComponents((text) => text.setContent("## 👢 Member Kicked"))
            .addSeparatorComponents((separator) => separator.setSpacing(discord_js_1.SeparatorSpacingSize.Small))
            .addTextDisplayComponents((text) => text.setContent([
            "### 📋 Kick Summary",
            `**User:** ${user.tag}`,
            `**Reason:** ${reason}`,
        ].join("\n")))
            .addSeparatorComponents((separator) => separator.setSpacing(discord_js_1.SeparatorSpacingSize.Small))
            .addTextDisplayComponents((text) => text.setContent(`-# Kicked by ${interaction.user.tag}`));
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
