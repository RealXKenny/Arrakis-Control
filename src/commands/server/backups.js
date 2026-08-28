const { AttachmentBuilder, ContainerBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder, MessageFlags, SeparatorSpacingSize, SlashCommandBuilder } = require("discord.js");
const { createCanvas } = require("canvas");
const { createLogger } = require("../../core/logger");

const logger = createLogger("BACKUPS");

const DEFAULT_SERVER_NAME = "Dune: Awakening Community Server";
const ACCENT_COLORS = [0xc58b45, 0xd2a85a, 0xa96832, 0x8f542c, 0x70452c, 0xb87333, 0x9c6b3c];

module.exports = {
  data: new SlashCommandBuilder().setName("backups").setDescription("Show available Dune server backups."),

  async execute(interaction) {
    await interaction.deferReply();

    const client = interaction.client;
    const serverName = process.env.SERVER_NAME || DEFAULT_SERVER_NAME;

    try {
      const response = await client.duneApi.call("GET", "/api/backups");
      const backups = parseBackups(response);
      const accentColor = ACCENT_COLORS[Math.floor(Math.random() * ACCENT_COLORS.length)];

      const banner = createBackupBanner({
        serverName,
        username: client.user.username,
        count: backups.count,
      });

      const backupsCard = new ContainerBuilder()
        .setAccentColor(accentColor)
        .addMediaGalleryComponents(new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL("attachment://crimson-skies-backups.png")))
        .addTextDisplayComponents((text) => text.setContent("## 💾 Dune Server Backups"))
        .addTextDisplayComponents((text) => text.setContent(`-# ${serverName}`))
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents((text) => text.setContent(["### 📦 Database Backups", backups.content].join("\n")))
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents((text) => text.setContent(`-# ${backups.count} backup${backups.count === 1 ? "" : "s"} available • Spice flows through Arrakis • Requested by ${interaction.user.tag}`));

      await interaction.editReply({
        content: null,
        embeds: null,
        components: [backupsCard],
        files: [banner],
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: {
          parse: [],
        },
      });
    } catch (error) {
      const errorCard = new ContainerBuilder()
        .setAccentColor(0x8f3025)
        .addTextDisplayComponents((text) => text.setContent("## 💾 Dune Server Backups"))
        .addTextDisplayComponents((text) => text.setContent(`-# ${serverName}`))
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents((text) => text.setContent(["### 🔴 Backups Unavailable", "The server backup list could not be retrieved.", "Please try again later."].join("\n")))
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents((text) => text.setContent(`-# Spice flows through Arrakis • Requested by ${interaction.user.tag}`));

      await interaction.editReply({
        content: null,
        embeds: null,
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2,
      });

      logger.error("Unable to retrieve Dune server backups.", error);
    }
  },
};

function parseBackups(response) {
  if (Array.isArray(response)) {
    return formatBackupList(response);
  }

  if (Array.isArray(response?.backups)) {
    return formatBackupList(response.backups);
  }

  if (Array.isArray(response?.data)) {
    return formatBackupList(response.data);
  }

  if (typeof response?.stdout === "string") {
    return parseBackupOutput(response.stdout);
  }

  if (response && typeof response === "object") {
    const entries = Object.entries(response).filter(([, value]) => value !== null && value !== undefined);

    if (entries.length) {
      return {
        count: entries.length,
        content: entries.map(([key, value]) => `**${key}:** ${formatValue(value)}`).join("\n"),
      };
    }
  }

  return {
    count: 0,
    content: "No backups available.",
  };
}

function parseBackupOutput(stdout) {
  const lines = stdout
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith("==="));

  if (!lines.length) {
    return {
      count: 0,
      content: "No backups available.",
    };
  }

  const backups = lines
    .map((line) => {
      const match = line.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})\s+(.+)$/);

      if (!match) {
        return {
          timestamp: null,
          path: line,
        };
      }

      return {
        timestamp: `${match[1]}T${match[2]}`,
        path: match[3],
      };
    })
    .filter((backup) => backup.path);

  return formatBackupList(backups);
}

function formatBackupList(backups) {
  if (!backups.length) {
    return {
      count: 0,
      content: "No backups available.",
    };
  }

  return {
    count: backups.length,
    content: backups.map((backup, index) => formatBackup(backup, index)).join("\n\n"),
  };
}

function formatBackup(backup, index) {
  if (typeof backup === "string" || typeof backup === "number") {
    return `**${index + 1}.** 💾 \`${backup}\``;
  }

  if (!backup || typeof backup !== "object") {
    return `**${index + 1}.** 💾 \`${String(backup)}\``;
  }

  const path = backup.path ?? backup.name ?? backup.filename ?? backup.fileName ?? backup.id ?? `Backup ${index + 1}`;
  const timestamp = backup.timestamp ?? backup.createdAt ?? backup.created_at ?? backup.date;
  const size = backup.size ?? backup.sizeBytes ?? backup.bytes;
  const status = backup.status ?? backup.state;

  const filename = getFilename(path);
  const details = [];

  if (timestamp) {
    const date = new Date(timestamp);

    if (!Number.isNaN(date.getTime())) {
      details.push(`<t:${Math.floor(date.getTime() / 1000)}:f>`);
    } else {
      details.push(timestamp);
    }
  }

  if (size !== undefined && size !== null) {
    details.push(formatBytes(size));
  }

  if (status) {
    details.push(String(status).toUpperCase());
  }

  return [`**${index + 1}.** 💾 \`${filename}\``, details.length ? `└ ${details.join(" • ")}` : null].filter(Boolean).join("\n");
}

function getFilename(path) {
  const normalized = String(path).replaceAll("\\", "/");
  return normalized.split("/").pop() || normalized;
}

function formatValue(value) {
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (typeof value === "object") {
    return `\`${JSON.stringify(value)}\``;
  }

  return `\`${String(value)}\``;
}

function formatBytes(bytes) {
  const value = Number(bytes);

  if (!Number.isFinite(value) || value < 0) {
    return "Unknown size";
  }

  if (value < 1024) {
    return `${value} B`;
  }

  if (value < 1024 ** 2) {
    return `${(value / 1024).toFixed(1)} KB`;
  }

  if (value < 1024 ** 3) {
    return `${(value / 1024 ** 2).toFixed(1)} MB`;
  }

  return `${(value / 1024 ** 3).toFixed(1)} GB`;
}

function createBackupBanner({ serverName, username, count }) {
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

  glow.addColorStop(0, "rgba(255, 190, 90, 0.5)");
  glow.addColorStop(0.45, "rgba(190, 100, 40, 0.2)");
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

  ctx.strokeStyle = "#c58b45";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(64, 170);
  ctx.lineTo(620, 170);
  ctx.stroke();

  ctx.font = "bold 30px sans-serif";
  ctx.fillStyle = "#ead5ad";
  ctx.fillText("DATABASE BACKUPS", 64, 230);

  ctx.font = "bold 62px sans-serif";
  ctx.fillStyle = "#f2d39b";
  ctx.fillText(String(count), 64, 300);

  ctx.font = "22px sans-serif";
  ctx.fillStyle = "#d8bb83";
  ctx.fillText(`BACKUP${count === 1 ? "" : "S"} AVAILABLE`, 145, 298);

  ctx.font = "18px sans-serif";
  ctx.fillStyle = "#ead5ad";
  ctx.fillText(`${username} • Spice flows through Arrakis`, 64, 350);

  ctx.save();
  ctx.translate(1050, 145);
  ctx.rotate(Math.PI / 4);

  ctx.strokeStyle = "#d2a85a";
  ctx.lineWidth = 5;
  ctx.strokeRect(-45, -45, 90, 90);

  ctx.fillStyle = "rgba(197, 139, 69, 0.15)";
  ctx.fillRect(-45, -45, 90, 90);

  ctx.restore();

  const accent = ctx.createLinearGradient(0, 0, canvas.width, 0);

  accent.addColorStop(0, "#8f3025");
  accent.addColorStop(0.5, "#d2a85a");
  accent.addColorStop(1, "#c58b45");

  ctx.fillStyle = accent;
  ctx.fillRect(0, canvas.height - 5, canvas.width, 5);

  return new AttachmentBuilder(canvas.toBuffer("image/png"), {
    name: "crimson-skies-backups.png",
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

  let output = text;

  while (ctx.measureText(output).width > maxWidth && output.length > 3) {
    output = `${output.slice(0, -4)}...`;
  }

  ctx.fillText(output, x, y);
}
