"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const captchaStore_1 = require("../../../shared/utils/captchaStore");
module.exports = {
    customId: "member-captcha",
    async execute(interaction) {
        const code = (0, captchaStore_1.createCaptcha)(interaction.user.id);
        const modal = new discord_js_1.ModalBuilder()
            .setCustomId("member-captcha-modal")
            .setTitle("Membership Verification")
            .addLabelComponents((label) => label
            .setLabel(`Enter this code: ${code}`)
            .setTextInputComponent(new discord_js_1.TextInputBuilder()
            .setCustomId("captcha-answer")
            .setStyle(discord_js_1.TextInputStyle.Short)
            .setRequired(true)));
        await interaction.showModal(modal);
    },
};
