const { ContainerBuilder, MessageFlags, SeparatorSpacingSize, SlashCommandBuilder, version: discordJsVersion } = require("discord.js");
const { getBotVersion } = require("../../config/version");

module.exports = {
  data: new SlashCommandBuilder().setName("info").setDescription("View information about this bot."),

  async execute(interaction) {
    const client = interaction.client;

    const serverName = process.env.SERVER_NAME || "Dune: Awakening Community Server";

    const uptimeSeconds = Math.floor(client.uptime / 1000);
    const memoryUsage = process.memoryUsage();

    const duneColors = [
      0xc58b45, // Spice Gold
      0xd2a85a, // Arrakis Sand
      0xa96832, // Desert Orange
      0x8f542c, // Spice Brown
      0x70452c, // Deep Desert
      0xb87333, // Copper Spice
      0x9c6b3c, // Sandstone
    ];

    const accentColor = duneColors[Math.floor(Math.random() * duneColors.length)];

    const formatUptime = (seconds) => {
      const days = Math.floor(seconds / 86400);
      seconds %= 86400;

      const hours = Math.floor(seconds / 3600);
      seconds %= 3600;

      const minutes = Math.floor(seconds / 60);
      seconds %= 60;

      const parts = [];

      if (days) parts.push(`${days}d`);
      if (hours) parts.push(`${hours}h`);
      if (minutes) parts.push(`${minutes}m`);
      if (seconds || parts.length === 0) parts.push(`${seconds}s`);

      return parts.join(" ");
    };

    const formatMemory = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

    const websocketPing = client.ws.ping >= 0 ? `${client.ws.ping}ms` : "Measuring...";

    const infoCard = new ContainerBuilder()
      .setAccentColor(accentColor)

      // Header
      .addTextDisplayComponents((text) => text.setContent(`## 🏜️ ${client.user.username}`))
      .addTextDisplayComponents((text) => text.setContent(`-# ${serverName}`))

      .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))

      // Bot
      .addTextDisplayComponents((text) => text.setContent(["### 🏜️ Bot", `**Version:** v${getBotVersion()}`, `**User ID:** \`${client.user.id}\``, `**Created:** <t:${Math.floor(client.user.createdTimestamp / 1000)}:D>`].join("\n")))

      .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))

      // Statistics
      .addTextDisplayComponents((text) =>
        text.setContent(
          [
            "### 🦂 Statistics",
            `**Servers:** ${client.guilds.cache.size.toLocaleString()}`,
            `**Cached users:** ${client.users.cache.size.toLocaleString()}`,
            `**Cached channels:** ${client.channels.cache.size.toLocaleString()}`,
            `**Registered commands:** ${client.commands?.size ?? 0}`,
          ].join("\n"),
        ),
      )

      .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))

      // Connection
      .addTextDisplayComponents((text) =>
        text.setContent(["### 🛰️ Connection", `**WebSocket:** ${websocketPing}`, `**Uptime:** ${formatUptime(uptimeSeconds)}`, `**Online since:** <t:${Math.floor((Date.now() - client.uptime) / 1000)}:R>`].join("\n")),
      )

      .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))

      // Runtime
      .addTextDisplayComponents((text) =>
        text.setContent(
          [
            "### ⚙️ Runtime",
            `**discord.js:** v${discordJsVersion}`,
            `**Node.js:** ${process.version}`,
            `**Platform:** ${process.platform}`,
            `**Architecture:** ${process.arch}`,
            `**Memory:** ${formatMemory(memoryUsage.rss)}`,
            `**Heap:** ${formatMemory(memoryUsage.heapUsed)} / ${formatMemory(memoryUsage.heapTotal)}`,
          ].join("\n"),
        ),
      )

      .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))

      // Footer
      .addTextDisplayComponents((text) => text.setContent(`-# Spice flows through Arrakis • Requested by ${interaction.user.tag}`));

    await interaction.reply({
      components: [infoCard],
      flags: MessageFlags.IsComponentsV2,
    });
  },
};
