"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const commandLoader_1 = require("../../../infrastructure/loaders/commandLoader");
const componentLoader_1 = require("../../../infrastructure/loaders/componentLoader");
const componentFactory_1 = require("../../../shared/factories/componentFactory");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("reload")
        .setDescription("Reload bot modules without restarting the process.")
        .addStringOption((option) => option
        .setName("area")
        .setDescription("Area to reload")
        .setRequired(true)
        .addChoices({
        name: "Commands",
        value: "commands",
    }, {
        name: "Components",
        value: "components",
    }, {
        name: "All",
        value: "all",
    })),
    async execute(interaction) {
        const ownerRoleId = process.env.OWNER_ROLE_ID;
        if (!ownerRoleId || !interaction.guild) {
            await interaction.reply({
                content: "Only the configured owner role can reload bot modules.",
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        const member = await interaction.guild.members.fetch(interaction.user.id);
        if (!member.roles.cache.has(ownerRoleId)) {
            await interaction.reply({
                content: "Only the configured owner role can reload bot modules.",
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        const area = interaction.options.getString("area", true);
        const duneColors = [
            0xc58b45,
            0xd2a85a,
            0xa96832,
            0x8f542c,
            0x70452c,
            0xb87333,
            0x9c6b3c,
        ];
        const accentColor = duneColors[Math.floor(Math.random() * duneColors.length)];
        const results = {};
        if (area === "commands" ||
            area === "all") {
            results.commands =
                (0, commandLoader_1.reloadCommands)(interaction.client).loaded;
        }
        if (area === "components" ||
            area === "all") {
            results.components =
                (0, componentLoader_1.reloadComponentHandlers)(interaction.client).loaded;
        }
        const infoCard = new discord_js_1.ContainerBuilder()
            .setAccentColor(accentColor)
            .addTextDisplayComponents((text) => text.setContent(`Reloaded ${results.commands ?? 0} commands and ${results.components ?? 0} component handlers.`));
        await interaction.reply((0, componentFactory_1.createV2Response)([infoCard]));
    },
};
