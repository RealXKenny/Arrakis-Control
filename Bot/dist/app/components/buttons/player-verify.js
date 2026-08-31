"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
module.exports = {
    customId: "player-verify",
    async execute(interaction) {
        const verificationCodeInput = new discord_js_1.TextInputBuilder()
            .setCustomId("verification-code")
            .setStyle(discord_js_1.TextInputStyle.Short)
            .setPlaceholder("ACP-XXXXXX")
            .setRequired(true)
            .setMinLength(10)
            .setMaxLength(10);
        const verificationCodeLabel = new discord_js_1.LabelBuilder()
            .setLabel("Verification code")
            .setTextInputComponent(verificationCodeInput);
        const modal = new discord_js_1.ModalBuilder()
            .setCustomId("player-verify-modal")
            .setTitle("Verify Dune Character")
            .addLabelComponents(verificationCodeLabel);
        await interaction.showModal(modal);
    },
};
