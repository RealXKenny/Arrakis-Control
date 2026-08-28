const { AttachmentBuilder, ContainerBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder, MessageFlags, SeparatorSpacingSize, SlashCommandBuilder } = require("discord.js");
const { createCanvas } = require("canvas");
const { formatServerStatus } = require("../../formatters/serverStatus");
const { createLogger } = require("../../core/logger");

const logger = createLogger("SERVER STATUS");

const DUNE_COLORS = [0xc58b45, 0xd2a85a, 0xa96832, 0x8f542c, 0x70452c, 0xb87333, 0x9c6b3c];

const DEFAULT_SERVER_NAME = "Dune: Awakening Community Server";

module.exports = {
  data: new SlashCommandBuilder().setName("status").setDescription("Show the current Dune server status."),

  async execute(interaction) {
    await interaction.deferReply();

    const client = interaction.client;
    const serverName = process.env.SERVER_NAME || DEFAULT_SERVER_NAME;

    try {
      const [status, performance] = await Promise.all([client.duneApi.call("GET", "/api/server/status"), client.duneApi.call("GET", "/api/server/performance")]);

      const formatted = formatServerStatus(status);
      const healthy = Boolean(formatted.healthy);

      const accentColor = healthy ? DUNE_COLORS[Math.floor(Math.random() * DUNE_COLORS.length)] : 0x8f3025;

      const performanceInfo = formatPerformance(performance);

      const banner = createStatusBanner({
        serverName,
        healthy,
        overview: formatted.overview,
        performance: performanceInfo,
        username: client.user.username,
      });

      const statusCard = new ContainerBuilder()
        .setAccentColor(accentColor)
        .addMediaGalleryComponents(new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL("attachment://crimson-skies-status.png")))
        .addTextDisplayComponents((text) => text.setContent("## 🏜️ Dune Server Status"))
        .addTextDisplayComponents((text) => text.setContent(`-# ${serverName}`))
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents((text) => text.setContent([`### ${healthy ? "🟢" : "🔴"} ${healthy ? "Server Operational" : "Server Attention Required"}`, formatted.overview || "No overview data reported."].join("\n")))
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents((text) => text.setContent(["### 🎮 Game Servers", formatted.gameServers || "No game server data reported."].join("\n")))
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents((text) => text.setContent(["### 📦 Containers", formatted.containers || "No container data reported."].join("\n")))
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents((text) => text.setContent(["### 🛰️ Listeners", formatted.listeners || "No listener data reported."].join("\n")))
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents((text) => text.setContent(["### 📊 Performance", `**CPU:** ${performanceInfo.cpu}`, `**Memory:** ${performanceInfo.memory}`, `**Disk:** ${performanceInfo.disk}`].join("\n")))
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents((text) => text.setContent(["### ⚙️ Automation", formatted.automation || "Not configured."].join("\n")))
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents((text) => text.setContent(`-# Spice flows through Arrakis • Requested by ${interaction.user.tag}`));

      await interaction.editReply({
        content: null,
        embeds: null,
        components: [statusCard],
        files: [banner],
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: {
          parse: [],
        },
      });
    } catch (error) {
      const errorCard = new ContainerBuilder()
        .setAccentColor(0x8f3025)
        .addTextDisplayComponents((text) => text.setContent("## 🏜️ Dune Server Status"))
        .addTextDisplayComponents((text) => text.setContent(`-# ${serverName}`))
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents((text) => text.setContent(["### 🔴 Server Status Unavailable", "The Arrakis server status could not be retrieved.", "Please try again later."].join("\n")))
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents((text) => text.setContent(`-# Spice flows through Arrakis • Requested by ${interaction.user.tag}`));

      await interaction.editReply({
        content: null,
        embeds: null,
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2,
      });

      logger.error("Unable to retrieve the Dune server status.", error);
    }
  },
};

function formatPerformance(data) {
  const cpu = data?.cpu ?? data?.cpuUsage ?? data?.cpuPercent ?? data?.cpu?.usage ?? data?.cpu?.percent;

  const memory = data?.memory ?? data?.memoryUsage ?? data?.memoryPercent ?? data?.memory?.usage ?? data?.memory?.percent;

  const disk = data?.disk ?? data?.diskUsage ?? data?.diskPercent ?? data?.disk?.usage ?? data?.disk?.percent;

  return {
    cpu: formatMetric(cpu, "%"),
    memory: formatMetric(memory, "%"),
    disk: formatMetric(disk, "%"),
  };
}

function formatMetric(value, suffix = "") {
  if (value === undefined || value === null) {
    return "Unavailable";
  }

  if (typeof value === "object") {
    if (typeof value.percent === "number") {
      return `${value.percent.toFixed(1)}${suffix}`;
    }

    if (typeof value.percentage === "number") {
      return `${value.percentage.toFixed(1)}${suffix}`;
    }

    if (typeof value.used === "number" && typeof value.total === "number") {
      const percent = (value.used / value.total) * 100;
      return `${percent.toFixed(1)}%`;
    }
  }

  if (typeof value === "number") {
    return `${value.toFixed(1)}${suffix}`;
  }

  if (typeof value === "string") {
    return value;
  }

  return "Unavailable";
}

function createStatusBanner({ serverName, healthy, overview, performance, username }) {
  const canvas = createCanvas(1200, 400);
  const ctx = canvas.getContext("2d");

  const background = ctx.createLinearGradient(0, 0, 0, canvas.height);

  background.addColorStop(0, "#21140d");
  background.addColorStop(0.35, "#5c321e");
  background.addColorStop(0.7, "#a35f30");
  background.addColorStop(1, "#d2a85a");

  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const glow = ctx.createRadialGradient(920, 100, 20, 920, 100, 450);

  glow.addColorStop(0, healthy ? "rgba(255, 190, 90, 0.5)" : "rgba(180, 55, 35, 0.55)");

  glow.addColorStop(0.45, healthy ? "rgba(190, 100, 40, 0.2)" : "rgba(130, 35, 25, 0.25)");

  glow.addColorStop(1, "rgba(0, 0, 0, 0)");

  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawDunes(ctx, canvas);

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

  overlay.addColorStop(0, "rgba(10, 7, 5, 0.88)");
  overlay.addColorStop(0.55, "rgba(10, 7, 5, 0.45)");
  overlay.addColorStop(1, "rgba(10, 7, 5, 0.05)");

  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = "bold 52px sans-serif";
  ctx.fillStyle = "#f2d39b";
  ctx.fillText("CRIMSON SKIES", 60, 105);

  ctx.font = "24px sans-serif";
  ctx.fillStyle = "#e6bd79";

  drawFittedText(ctx, serverName.toUpperCase(), 64, 145, 650, "24px sans-serif");

  ctx.strokeStyle = healthy ? "#c58b45" : "#a64b3d";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(64, 170);
  ctx.lineTo(620, 170);
  ctx.stroke();

  ctx.font = "bold 72px sans-serif";
  ctx.fillStyle = healthy ? "#70b85a" : "#c65345";
  ctx.fillText(healthy ? "✓" : "!", 70, 265);

  ctx.font = "bold 30px sans-serif";
  ctx.fillStyle = "#ead5ad";

  ctx.fillText(healthy ? "SERVER OPERATIONAL" : "SERVER ATTENTION", 165, 225);

  ctx.font = "20px sans-serif";
  ctx.fillStyle = "#d8bb83";

  drawFittedText(ctx, overview || "No overview data reported.", 165, 265, 600, "20px sans-serif");

  ctx.font = "18px sans-serif";
  ctx.fillStyle = "#ead5ad";

  ctx.fillText(`CPU ${performance.cpu} • RAM ${performance.memory} • DISK ${performance.disk}`, 64, 320);

  ctx.font = "17px sans-serif";
  ctx.fillStyle = "#ead5ad";

  ctx.fillText(`${username} • Spice flows through Arrakis`, 64, 350);

  const accent = ctx.createLinearGradient(0, 0, canvas.width, 0);

  accent.addColorStop(0, healthy ? "#8f3025" : "#6e241c");

  accent.addColorStop(0.5, healthy ? "#d2a85a" : "#a64b3d");

  accent.addColorStop(1, healthy ? "#c58b45" : "#8f3025");

  ctx.fillStyle = accent;
  ctx.fillRect(0, canvas.height - 5, canvas.width, 5);

  return new AttachmentBuilder(canvas.toBuffer("image/png"), {
    name: "crimson-skies-status.png",
  });
}

function drawDunes(ctx, canvas) {
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

  drawDune(280, 70, "#82451f");
  drawDune(315, 60, "#9a592e", 150);
  drawDune(345, 50, "#b87333", 300);
  drawDune(370, 35, "#d2a85a", 500);
}

function drawFittedText(ctx, text, x, y, maxWidth, font) {
  ctx.font = font;

  let output = String(text);

  while (ctx.measureText(output).width > maxWidth && output.length > 3) {
    output = `${output.slice(0, -4)}...`;
  }

  ctx.fillText(output, x, y);
}
