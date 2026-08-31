"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
module.exports = {
    customId: "blueprint-upload",
    async execute(interaction) {
        const modal = new discord_js_1.ModalBuilder()
            .setCustomId("blueprint-upload-modal")
            .setTitle("Upload Dune Blueprint")
            .addLabelComponents((label) => label
            .setLabel("Blueprint JSON file")
            .setDescription("Upload exactly one .json blueprint file (maximum 32 MB).")
            .setFileUploadComponent(new discord_js_1.FileUploadBuilder()
            .setCustomId("blueprint-file")
            .setMinValues(1)
            .setMaxValues(1)
            .setRequired(true)));
        await interaction.showModal(modal);
    },
};
