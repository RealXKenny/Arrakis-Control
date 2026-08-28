const { AttachmentBuilder, ContainerBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder, MessageFlags, SeparatorSpacingSize, SlashCommandBuilder } = require("discord.js");
const { createCanvas } = require("canvas");
const { createLogger } = require("../../core/logger");

const logger = createLogger("BACKUPS");

const DEFAULT_SERVER_NAME = "Dune: Awakening Community Server";

const ACCENT_COLORS = [0xc58b45, 0xd2a85a, 0xa96832, 0x8f542c, 0x70452c, 0xb87333, 0x9c6b3c];

module.exports = {
  data: new SlashCommandBuilder().setName("backups").setDescription("Show available Dune server backups and auto-backup status."),

  async execute(interaction) {
    await interaction.deferReply();

    const client = interaction.client;
    const serverName = process.env.SERVER_NAME || DEFAULT_SERVER_NAME;

    try {
      const [backupResponse, autoBackupResponse] = await Promise.all([client.duneApi.call("GET", "/api/backups"), client.duneApi.call("GET", "/api/backups/auto")]);

      const backups = parseBackups(backupResponse);
      const autoBackup = parseAutoBackup(autoBackupResponse);

      const accentColor = ACCENT_COLORS[Math.floor(Math.random() * ACCENT_COLORS.length)];

      const banner = createBackupBanner({
        serverName,
        username: client.user.username,
        count: backups.count,
        autoBackup: autoBackup.enabled,
      });

      const backupsCard = new ContainerBuilder()
        .setAccentColor(accentColor)

        .addMediaGalleryComponents(new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL("attachment://crimson-skies-backups.png")))

        .addTextDisplayComponents((text) => text.setContent("## 💾 Dune Server Backups"))

        .addTextDisplayComponents((text) => text.setContent(`-# ${serverName}`))

        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))

        .addTextDisplayComponents((text) => text.setContent(["### 📦 Database Backups", backups.content].join("\n")))

        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))

        .addTextDisplayComponents((text) => text.setContent([`### ${autoBackup.enabled ? "🟢" : "🔴"} Auto-Backups`, autoBackup.summary].join("\n")))

        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))

        .addTextDisplayComponents((text) => text.setContent(["### 🕒 Schedule", autoBackup.schedule].join("\n")))

        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))

        .addTextDisplayComponents((text) => text.setContent(["### 🗄️ Storage", autoBackup.storage].join("\n")))

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

        .addTextDisplayComponents((text) => text.setContent(["### 🔴 Backup Information Unavailable", "The server backup information could not be retrieved.", "Please try again later."].join("\n")))

        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))

        .addTextDisplayComponents((text) => text.setContent(`-# Spice flows through Arrakis • Requested by ${interaction.user.tag}`));

      await interaction.editReply({
        content: null,
        embeds: null,
        components: [errorCard],
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: {
          parse: [],
        },
      });

      logger.error("Unable to retrieve Dune server backup information.", error);
    }
  },
};

/* -------------------------------------------------------------------------- */
/* BACKUPS                                                                    */
/* -------------------------------------------------------------------------- */

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

  if (typeof response === "string") {
    return parseBackupOutput(response);
  }

  if (response && typeof response === "object") {
    const entries = Object.entries(response).filter(([, value]) => value !== null && value !== undefined);

    if (entries.length) {
      return {
        count: entries.length,
        content: entries.map(([key, value]) => `**${formatLabel(key)}:** ${formatValue(value)}`).join("\n"),
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

  const backups = [];

  for (const line of lines) {
    const match = line.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})\s+(.+)$/);

    if (!match) {
      continue;
    }

    backups.push({
      timestamp: `${match[1]}T${match[2]}`,
      path: match[3].trim(),
    });
  }

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
      details.push(String(timestamp));
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

/* -------------------------------------------------------------------------- */
/* AUTO BACKUPS                                                               */
/* -------------------------------------------------------------------------- */

function parseAutoBackup(response) {
  if (!response) {
    return emptyAutoBackup();
  }

  if (typeof response?.stdout === "string") {
    return parseAutoBackupOutput(response.stdout);
  }

  if (typeof response === "string") {
    return parseAutoBackupOutput(response);
  }

  if (typeof response === "object") {
    return parseAutoBackupObject(response);
  }

  return emptyAutoBackup();
}

function parseAutoBackupOutput(stdout) {
  const text = String(stdout);

  const enabled = detectEnabled(text);

  const backupTime = findValue(text, /Backup time:\s*([^\n]+)/i) || "Unknown";

  const interval = findValue(text, /Interval hours:\s*([^\n]+)/i) || "Unknown";

  const retention = findValue(text, /Retention:\s*([^\n]+)/i) || "Unknown";

  const directory = findValue(text, /Backup directory:\s*([^\n]+)/i) || "Unknown";

  const systemdTimer = findValue(text, /Systemd timer:\s*([^\n]+)/i) || "Unknown";

  const next = findValue(text, /NEXT\s+LEFT\s+LAST/i) ? parseTimerNext(text) : null;

  const last = parseTimerLast(text);

  const backups = parseBackupEntriesFromAutoOutput(text);

  const nextLine = next ? `**Next backup:** <t:${Math.floor(next.getTime() / 1000)}:F> • <t:${Math.floor(next.getTime() / 1000)}:R>` : "**Next backup:** Unknown";

  const lastLine = last ? `**Last backup:** <t:${Math.floor(last.getTime() / 1000)}:F> • <t:${Math.floor(last.getTime() / 1000)}:R>` : "**Last backup:** Unknown";

  return {
    enabled,

    summary: [`**Status:** ${enabled ? "ENABLED" : "DISABLED"}`, `**Systemd timer:** ${formatStatus(systemdTimer)}`].join("\n"),

    schedule: [`**Backup time:** \`${backupTime}\``, `**Interval:** \`${interval} hours\``, `**Retention:** \`${retention} days\``, nextLine, lastLine].join("\n"),

    storage: [`**Directory:** \`${directory}\``, backups.length ? `**Recent backups:** ${backups.length}` : "**Recent backups:** None reported"].join("\n"),
  };
}

function parseAutoBackupObject(response) {
  const enabled = getBoolean(response.enabled ?? response.active ?? response.running ?? response.autoBackup ?? response.auto_backup);

  const backupTime = response.backupTime ?? response.backup_time ?? response.time ?? "Unknown";

  const interval = response.intervalHours ?? response.interval_hours ?? response.interval ?? "Unknown";

  const retention = response.retentionDays ?? response.retention_days ?? response.retention ?? "Unknown";

  const directory = response.backupDirectory ?? response.backup_directory ?? response.directory ?? "Unknown";

  const systemdTimer = response.systemdTimer ?? response.systemd_timer ?? response.timer ?? "Unknown";

  const nextBackup = response.next ?? response.nextBackup ?? response.next_backup;

  const lastBackup = response.last ?? response.lastBackup ?? response.last_backup;

  return {
    enabled,

    summary: [`**Status:** ${enabled ? "ENABLED" : "DISABLED"}`, `**Systemd timer:** ${formatStatus(systemdTimer)}`].join("\n"),

    schedule: [`**Backup time:** \`${backupTime}\``, `**Interval:** \`${interval}\``, `**Retention:** \`${retention}\``, formatTimestampLine("Next backup", nextBackup), formatTimestampLine("Last backup", lastBackup)].join("\n"),

    storage: [`**Directory:** \`${directory}\``, "**Recent backups:** API response available"].join("\n"),
  };
}

function emptyAutoBackup() {
  return {
    enabled: false,

    summary: ["**Status:** UNKNOWN", "**Systemd timer:** UNKNOWN"].join("\n"),

    schedule: ["**Backup time:** `Unknown`", "**Interval:** `Unknown`", "**Retention:** `Unknown`", "**Next backup:** Unknown", "**Last backup:** Unknown"].join("\n"),

    storage: ["**Directory:** `Unknown`", "**Recent backups:** None reported"].join("\n"),
  };
}

/* -------------------------------------------------------------------------- */
/* AUTO BACKUP PARSING HELPERS                                                */
/* -------------------------------------------------------------------------- */

function parseTimerNext(text) {
  const match = text.match(/NEXT\s+LEFT\s+LAST\s+PASSED\s+UNIT\s+ACTIVATES\s*\n?([\s\S]*?)(?:\n\n|\n\d{4}-\d{2}-\d{2})/i);

  if (!match) {
    return null;
  }

  const line = match[1]
    .split("\n")
    .map((value) => value.trim())
    .find(Boolean);

  if (!line) {
    return null;
  }

  const dateMatch = line.match(/\b(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})\s+UTC/i);

  if (!dateMatch) {
    return null;
  }

  return parseUtcDate(dateMatch[1], dateMatch[2]);
}

function parseTimerLast(text) {
  const match = text.match(/\b(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})\s+UTC\s+[\s\S]*?\b(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})\s+UTC/i);

  if (!match) {
    return null;
  }

  return parseUtcDate(match[3], match[4]);
}

function parseBackupEntriesFromAutoOutput(text) {
  const entries = [];

  const regex = /(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})\s+(runtime\/backups\/db\/\S+)/g;

  let match;

  while ((match = regex.exec(text)) !== null) {
    entries.push({
      timestamp: `${match[1]}T${match[2]}:00`,
      path: match[3],
    });
  }

  return entries;
}

function parseUtcDate(date, time) {
  const value = new Date(`${date}T${time}Z`);

  return Number.isNaN(value.getTime()) ? null : value;
}

function findValue(text, regex) {
  const match = text.match(regex);

  return match?.[1]?.trim() || null;
}

function formatStatus(value) {
  const text = String(value).trim();

  if (/enabled|running|active|healthy|ok/i.test(text)) {
    return "🟢 ENABLED";
  }

  if (/disabled|inactive|stopped|failed|error/i.test(text)) {
    return "🔴 DISABLED";
  }

  return `🟡 ${text.toUpperCase()}`;
}

function formatTimestampLine(label, value) {
  if (!value) {
    return `**${label}:** Unknown`;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return `**${label}:** \`${value}\``;
  }

  const timestamp = Math.floor(date.getTime() / 1000);

  return `**${label}:** <t:${timestamp}:F> • <t:${timestamp}:R>`;
}

function detectEnabled(value) {
  const text = String(value).toLowerCase();

  if (text.includes("disabled") || text.includes("inactive") || text.includes("stopped") || text.includes("off")) {
    return false;
  }

  return text.includes("enabled") || text.includes("active") || text.includes("running") || text.includes("on");
}

function getBoolean(value) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  if (typeof value === "string") {
    return detectEnabled(value);
  }

  return false;
}

/* -------------------------------------------------------------------------- */
/* GENERAL HELPERS                                                            */
/* -------------------------------------------------------------------------- */

function formatLabel(value) {
  return String(value)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getFilename(path) {
  const normalized = String(path).replaceAll("\\", "/");

  return normalized.split("/").pop() || normalized;
}

function formatValue(value) {
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (typeof value === "object" && value !== null) {
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

/* -------------------------------------------------------------------------- */
/* CANVAS                                                                     */
/* -------------------------------------------------------------------------- */

function createBackupBanner({ serverName, username, count, autoBackup }) {
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

  glow.addColorStop(0, autoBackup ? "rgba(255, 190, 90, 0.5)" : "rgba(180, 55, 35, 0.55)");

  glow.addColorStop(0.45, autoBackup ? "rgba(190, 100, 40, 0.2)" : "rgba(130, 35, 25, 0.25)");

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

  ctx.strokeStyle = autoBackup ? "#c58b45" : "#a64b3d";

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

  ctx.font = "bold 20px sans-serif";
  ctx.fillStyle = autoBackup ? "#70b85a" : "#c65345";

  ctx.fillText(autoBackup ? "AUTO-BACKUPS ENABLED" : "AUTO-BACKUPS DISABLED", 600, 298);

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

  let output = String(text);

  while (ctx.measureText(output).width > maxWidth && output.length > 3) {
    output = `${output.slice(0, -4)}...`;
  }

  ctx.fillText(output, x, y);
}
