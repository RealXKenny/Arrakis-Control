import { ChatInputCommandInteraction, ContainerBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder, SeparatorSpacingSize, SlashCommandBuilder, version as discordJsVersion } from "discord.js";
import { createCanvas } from "canvas";
import { getBotVersion } from "../../../infrastructure/config/version";
import { createDuneBanner } from "../../../shared/factories/imageFactory";
import { createV2Response } from "../../../shared/factories/componentFactory";

module.exports = {
  data: new SlashCommandBuilder().setName("info").setDescription("View information about this bot."),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const client = interaction.client;
    const serverName = process.env.SERVER_NAME ?? "Dune: Awakening Community Server";
    const uptimeSeconds = Math.floor(client.uptime / 1000);
    const memoryUsage = process.memoryUsage();
    const duneColors: number[] = [0xc58b45, 0xd2a85a, 0xa96832, 0x8f542c, 0x70452c, 0xb87333, 0x9c6b3c];
    const accentColor = duneColors[Math.floor(Math.random() * duneColors.length)];

    const formatUptime = (inputSeconds: number): string => {
      let seconds = inputSeconds;

      const days = Math.floor(seconds / 86400);
      seconds %= 86400;

      const hours = Math.floor(seconds / 3600);
      seconds %= 3600;

      const minutes = Math.floor(seconds / 60);
      seconds %= 60;

      const parts: string[] = [];

      if (days) {
        parts.push(`${days}d`);
      }

      if (hours) {
        parts.push(`${hours}h`);
      }

      if (minutes) {
        parts.push(`${minutes}m`);
      }

      if (seconds || parts.length === 0) {
        parts.push(`${seconds}s`);
      }

      return parts.join(" ");
    };

    const formatMemory = (bytes: number): string => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

    const websocketPing = client.ws.ping >= 0 ? `${client.ws.ping}ms` : "Measuring...";

    const canvas = createCanvas(1200, 400);

    const ctx = canvas.getContext("2d");

    const background = ctx.createLinearGradient(0, 0, 0, canvas.height);

    background.addColorStop(0, "#21140d");
    background.addColorStop(0.35, "#5c321e");
    background.addColorStop(0.7, "#a35f30");
    background.addColorStop(1, "#d2a85a");

    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const glow = ctx.createRadialGradient(900, 100, 20, 900, 100, 450);

    glow.addColorStop(0, "rgba(255, 190, 90, 0.5)");
    glow.addColorStop(0.45, "rgba(190, 100, 40, 0.2)");
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const drawDune = (y: number, height: number, color: string, offset = 0): void => {
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

    drawDune(280, 70, "#82451f");

    drawDune(315, 60, "#9a592e", 150);

    drawDune(345, 50, "#b87333", 300);

    drawDune(370, 35, "#d2a85a", 500);

    ctx.fillStyle = "rgba(255, 220, 150, 0.3)";

    for (let i = 0; i < 180; i++) {
      const x = Math.random() * canvas.width;

      const y = Math.random() * canvas.height;

      const size = Math.random() * 2 + 0.5;

      ctx.beginPath();

      ctx.arc(x, y, size, 0, Math.PI * 2);

      ctx.fill();
    }

    const overlay = ctx.createLinearGradient(0, 0, canvas.width, 0);

    overlay.addColorStop(0, "rgba(10, 7, 5, 0.8)");

    overlay.addColorStop(0.55, "rgba(10, 7, 5, 0.35)");

    overlay.addColorStop(1, "rgba(10, 7, 5, 0.05)");

    ctx.fillStyle = overlay;

    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = "bold 52px sans-serif";

    ctx.fillStyle = "#f2d39b";

    ctx.fillText("DUNE SERVER", 60, 105);

    ctx.font = "24px sans-serif";

    ctx.fillStyle = "#e6bd79";

    let displayServerName = serverName;

    const maxServerNameWidth = 650;

    while (ctx.measureText(displayServerName).width > maxServerNameWidth && displayServerName.length > 3) {
      displayServerName = displayServerName.slice(0, -4) + "...";
    }

    ctx.fillText(displayServerName.toUpperCase(), 64, 145);

    ctx.strokeStyle = "#c58b45";

    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.moveTo(64, 170);
    ctx.lineTo(620, 170);

    ctx.stroke();

    ctx.fillStyle = "#d2a85a";

    ctx.beginPath();

    ctx.moveTo(1050, 105);
    ctx.lineTo(1090, 145);
    ctx.lineTo(1050, 185);
    ctx.lineTo(1010, 145);

    ctx.closePath();
    ctx.fill();

    ctx.font = "18px sans-serif";

    ctx.fillStyle = "#ead5ad";

    ctx.fillText(`${client.user.username} • Spice flows through Arrakis`, 64, 350);

    const banner = createDuneBanner({
      filename: "dune-server-info.png",
      title: "Arrakis Control",
      subtitle: "BOT INFORMATION",
      detail: serverName,
    });

    const infoCard = new ContainerBuilder()
      .setAccentColor(accentColor)
      .addMediaGalleryComponents(new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL("attachment://dune-server-info.png")))
      .addTextDisplayComponents((text) => text.setContent(`## 🏜️ ${client.user.username}`))
      .addTextDisplayComponents((text) => text.setContent(`-# ${serverName}`))
      .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
      .addTextDisplayComponents((text) =>
        text.setContent(["### 🏜️ Bot", `**Version:** v${getBotVersion()}`, `**User ID:** \`${client.user.id}\``, `**Created:** <t:${Math.floor(client.user.createdTimestamp / 1000)}:D>`].join("\n")),
      )
      .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
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
      .addTextDisplayComponents((text) =>
        text.setContent(
          ["### 🛰️ Connection", `**WebSocket:** ${websocketPing}`, `**Uptime:** ${formatUptime(uptimeSeconds)}`, `**Online since:** <t:${Math.floor((Date.now() - client.uptime) / 1000)}:R>`].join(
            "\n",
          ),
        ),
      )
      .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
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
      .addTextDisplayComponents((text) => text.setContent(`-# Spice flows through Arrakis • Requested by ${interaction.user.tag}`));

    await interaction.reply(createV2Response([infoCard], [banner]));
  },
};
