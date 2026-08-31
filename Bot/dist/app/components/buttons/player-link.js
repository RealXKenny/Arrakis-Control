"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const createActorContext_1 = require("../../../shared/utils/createActorContext");
const componentFactory_1 = require("../../../shared/factories/componentFactory");
module.exports = {
    customId: "player-link",
    async execute(interaction) {
        if (!interaction.client.discordAdapter) {
            throw new Error("Discord Adapter integration is not configured.");
        }
        const linked = await interaction.client.discordAdapter.getCurrentPlayer((0, createActorContext_1.createActorContext)(interaction, "player-link"));
        if (linked?.linked === true) {
            const name = linked.characterName ?? "your Dune character";
            const card = new discord_js_1.ContainerBuilder()
                .setAccentColor(0xd2a85a)
                .addTextDisplayComponents((text) => text.setContent("## Account already linked"))
                .addTextDisplayComponents((text) => text.setContent(`Your Discord account is already linked to **${name}**. Unlink it below if you want to connect a different character.`))
                .addActionRowComponents((row) => row.setComponents(new discord_js_1.ButtonBuilder()
                .setCustomId("player-unlink")
                .setLabel("Unlink Account")
                .setStyle(discord_js_1.ButtonStyle.Danger)));
            await interaction.reply({
                ...(0, componentFactory_1.createV2Response)([card]),
                flags: discord_js_1.MessageFlags.IsComponentsV2 |
                    discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        const characterNameInput = new discord_js_1.TextInputBuilder()
            .setCustomId("character-name")
            .setStyle(discord_js_1.TextInputStyle.Short)
            .setPlaceholder("Enter your exact in-game character name")
            .setRequired(true)
            .setMaxLength(80);
        const characterNameLabel = new discord_js_1.LabelBuilder()
            .setLabel("Character name")
            .setTextInputComponent(characterNameInput);
        const modal = new discord_js_1.ModalBuilder()
            .setCustomId("player-link-modal")
            .setTitle("Link Dune Character")
            .addLabelComponents(characterNameLabel);
        await interaction.showModal(modal);
    },
};
