const {
  ContainerBuilder,
  MessageFlags,
  SlashCommandBuilder,
} = require("discord.js");
const {
  reloadCommands,
} = require("../../../infrastructure/loaders/commandLoader");
const {
  reloadComponentHandlers,
} = require("../../../infrastructure/loaders/componentLoader");
const {
  createV2Response,
} = require("../../../shared/factories/componentFactory");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reload")
    .setDescription("Reload bot modules without restarting the process.")
    .addStringOption((option) =>
      option
        .setName("area")
        .setDescription("Area to reload")
        .setRequired(true)
        .addChoices(
          { name: "Commands", value: "commands" },
          { name: "Components", value: "components" },
          { name: "All", value: "all" },
        ),
    ),
  
  async execute(interaction) {
    const ownerRoleId = process.env.OWNER_ROLE_ID;
    if (!ownerRoleId || !interaction.member?.roles?.cache?.has(ownerRoleId)) {
      await interaction.reply({
        content: "Only the configured owner role can reload bot modules.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const area = interaction.options.getString("area", true);
    const duneColors = [
      0xc58b45, 0xd2a85a, 0xa96832, 0x8f542c, 0x70452c, 0xb87333, 0x9c6b3c,
    ];
    const accentColor =
      duneColors[Math.floor(Math.random() * duneColors.length)];

    let results = {};

    if (area === "commands" || area === "all") {
      results.commands = reloadCommands(interaction.client).loaded;
    }
    if (area === "components" || area === "all") {
      results.components = reloadComponentHandlers(interaction.client).loaded;
    }

    const infoCard = new ContainerBuilder()
      .setAccentColor(accentColor)
      .addTextDisplayComponents((text) =>
        text.setContent(
          `Reloaded ${results.commands ?? 0} commands and ${results.components ?? 0} component handlers.`
        ),
      );

    await interaction.reply(createV2Response([infoCard]));
  },
};