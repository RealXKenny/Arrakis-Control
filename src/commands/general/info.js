const { AttachmentBuilder, ContainerBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder, MessageFlags, SeparatorSpacingSize, SlashCommandBuilder, version: discordJsVersion } = require("discord.js");
const { createCanvas, loadImage } = require("canvas");
const { getBotVersion } = require("../../config/version");

module.exports = {
  data: new SlashCommandBuilder().setName("info").setDescription("View information about this bot."),

  async execute(interaction) {
    const client = interaction.client;

    const serverName = process.env.SERVER_NAME || "Dune: Awakening Community Server";

    const uptimeSeconds = Math.floor(client.uptime / 1000);
    const memoryUsage = process.memoryUsage();

    /*
     * Dune: Awakening inspired palette
     */
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

    /*
     * Generate banner with Canvas
     */
    const canvas = createCanvas(1200, 400);
    const ctx = canvas.getContext("2d");

    /*
     * Background gradient
     */
    const background = ctx.createLinearGradient(0, 0, 0, canvas.height);

    background.addColorStop(0, "#24160f");
    background.addColorStop(0.35, "#6f3d22");
    background.addColorStop(0.7, "#b46d35");
    background.addColorStop(1, "#d2a85a");

    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    /*
     * Atmospheric glow
     */
    const glow = ctx.createRadialGradient(canvas.width * 0.75, canvas.height * 0.2, 20, canvas.width * 0.75, canvas.height * 0.2, 500);

    glow.addColorStop(0, "rgba(255, 190, 90, 0.45)");
    glow.addColorStop(0.5, "rgba(180, 90, 35, 0.15)");
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    /*
     * Desert dunes
     */
    const drawDune = (y, height, color, offset = 0) => {
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);

      ctx.lineTo(0, y);

      for (let x = 0; x <= canvas.width; x += 20) {
        const wave = Math.sin((x + offset) / 130) * height * 0.25 + Math.sin((x + offset) / 270) * height * 0.2;

        ctx.lineTo(x, y + wave);
      }

      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();

      ctx.fillStyle = color;
      ctx.fill();
    };

    drawDune(290, 65, "#9a592e", 0);
    drawDune(315, 55, "#b87333", 150);
    drawDune(340, 45, "#c58b45", 300);
    drawDune(365, 35, "#d2a85a", 500);

    /*
     * Sand particles
     */
    ctx.fillStyle = "rgba(255, 220, 150, 0.35)";

    for (let i = 0; i < 180; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;

      const size = Math.random() * 2 + 0.5;

      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    /*
     * Dark overlay for text readability
     */
    const overlay = ctx.createLinearGradient(0, 0, canvas.width, 0);

    overlay.addColorStop(0, "rgba(15, 10, 7, 0.75)");
    overlay.addColorStop(0.55, "rgba(15, 10, 7, 0.35)");
    overlay.addColorStop(1, "rgba(15, 10, 7, 0.05)");

    ctx.fillStyle = overlay;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    /*
     * Banner title
     */
    ctx.font = "bold 52px sans-serif";
    ctx.fillStyle = "#f2d39b";
    ctx.fillText("CRIMSON SKIES", 60, 105);

    /*
     * Subtitle
     */
    ctx.font = "24px sans-serif";
    ctx.fillStyle = "#e6bd79";
    ctx.fillText("DUNE: AWAKENING COMMUNITY SERVER", 64, 145);

    /*
     * Decorative line
     */
    ctx.strokeStyle = "#c58b45";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(64, 170);
    ctx.lineTo(520, 170);
    ctx.stroke();

    /*
     * Spice symbol / decorative diamond
     */
    ctx.fillStyle = "#d2a85a";

    ctx.beginPath();
    ctx.moveTo(1050, 105);
    ctx.lineTo(1090, 145);
    ctx.lineTo(1050, 185);
    ctx.lineTo(1010, 145);
    ctx.closePath();
    ctx.fill();

    /*
     * Footer text
     */
    ctx.font = "18px sans-serif";
    ctx.fillStyle = "#ead5ad";
    ctx.fillText(`${client.user.username} • Spice flows through Arrakis`, 64, 350);

    /*
     * Convert Canvas to Discord attachment
     */
    const banner = new AttachmentBuilder(canvas.toBuffer("image/png"), {
      name: "crimson-skies-info.png",
    });

    /*
     * Components V2
     */
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

    /*
     * Media component containing the Canvas image
     */
    const media = new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL("attachment://crimson-skies-info.png"));

    await interaction.reply({
      components: [media, infoCard],
      files: [banner],
      flags: MessageFlags.IsComponentsV2,
    });
  },
};
