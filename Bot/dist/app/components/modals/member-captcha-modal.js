"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const captchaStore_1 = require("../../../shared/utils/captchaStore");
module.exports = {
    customId: "member-captcha-modal",
    async execute(interaction) {
        const answer = interaction.fields.getTextInputValue("captcha-answer");
        if (!(0, captchaStore_1.verifyCaptcha)(interaction.user.id, answer)) {
            await interaction.reply({
                content: "Captcha incorrect or expired. Try again.",
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        const roleId = process.env.VERIFIED_MEMBER_ROLE_ID;
        if (roleId) {
            if (!interaction.guild) {
                throw new Error("Membership verification can only be completed inside a guild.");
            }
            const member = await interaction.guild.members.fetch(interaction.user.id);
            await member.roles.add(roleId, "Completed membership captcha");
        }
        await interaction.reply({
            content: "Verification complete. Welcome to Arrakis!",
            flags: discord_js_1.MessageFlags.Ephemeral,
        });
    },
};
