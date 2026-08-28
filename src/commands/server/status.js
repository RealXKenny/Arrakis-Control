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
      const [status, performance, readiness, ports, services] = await Promise.all([
        client.duneApi.call("GET", "/api/server/status"),
        client.duneApi.call("GET", "/api/server/performance"),
        client.duneApi.call("GET", "/api/server/readiness"),
        client.duneApi.call("GET", "/api/server/ports"),
        client.duneApi.call("GET", "/api/server/services"),
      ]);

      const formatted = formatServerStatus(status);
      const healthy = Boolean(formatted.healthy);

      const performanceData = normalizePerformance(performance);
      const readinessData = normalizeReadiness(readiness);
      const portsData = normalizeCollection(ports);
      const servicesData = normalizeCollection(services);

      const accentColor = healthy ? DUNE_COLORS[Math.floor(Math.random() * DUNE_COLORS.length)] : 0x8f3025;

      const banner = createStatusBanner({
        serverName,
        healthy,
        overview: formatted.overview,
        performance: performanceData,
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

        .addTextDisplayComponents((text) => text.setContent(["### 📊 Performance", formatPerformance(performanceData)].join("\n")))

        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))

        .addTextDisplayComponents((text) => text.setContent(["### 🧭 Readiness", formatReadiness(readinessData)].join("\n")))

        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))

        .addTextDisplayComponents((text) => text.setContent(["### 🔌 Service Ports", formatPorts(portsData)].join("\n")))

        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))

        .addTextDisplayComponents((text) => text.setContent(["### ⚙️ Services", formatServices(servicesData)].join("\n")))

        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))

        .addTextDisplayComponents((text) => text.setContent(["### 🤖 Automation", formatted.automation || "Not configured."].join("\n")))

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

function normalizePerformance(data) {
  const source = data?.data ?? data ?? {};

  return {
    cpu: findValue(source, ["cpu", "cpuUsage", "cpuPercent", "cpu_percentage", "processor"]),
    memory: findValue(source, ["memory", "memoryUsage", "memoryPercent", "memory_percentage", "ram"]),
    disk: findValue(source, ["disk", "diskUsage", "diskPercent", "disk_percentage", "storage"]),
  };
}

function normalizeReadiness(data) {
  const source = data?.data ?? data ?? {};

  if (Array.isArray(source)) {
    return {
      items: source,
      ready: null,
      total: source.length,
    };
  }

  const items = source.services || source.checks || source.results || source.readiness || source.items || [];

  return {
    items: Array.isArray(items) ? items : [],
    ready: findValue(source, ["ready", "healthy", "isReady", "allReady"]),
    total: Array.isArray(items) ? items.length : 0,
  };
}

function normalizeCollection(data) {
  const source = data?.data ?? data ?? {};

  if (Array.isArray(source)) {
    return source;
  }

  const collection = source.items || source.services || source.ports || source.results || source.data;

  return Array.isArray(collection) ? collection : [source];
}

function formatPerformance(performance) {
  const cpu = formatMetric(performance.cpu, "%");
  const memory = formatMetric(performance.memory, "%");
  const disk = formatMetric(performance.disk, "%");

  if (cpu === "N/A" && memory === "N/A" && disk === "N/A") {
    return "No performance data reported.";
  }

  return [`**CPU:** ${cpu}`, `**Memory:** ${memory}`, `**Disk:** ${disk}`].join(" • ");
}

function formatReadiness(readiness) {
  if (readiness.ready !== null && readiness.total === 0) {
    return `**Status:** ${formatStatusValue(readiness.ready)}`;
  }

  if (!readiness.items.length) {
    if (readiness.ready !== null) {
      return `**Status:** ${formatStatusValue(readiness.ready)}`;
    }

    return "No readiness data reported.";
  }

  const readyCount = readiness.items.filter((item) => {
    const value = findValue(item, ["ready", "healthy", "status", "state"]);

    return isPositiveStatus(value);
  }).length;

  const total = readiness.items.length;

  return `**Ready:** ${readyCount}/${total} services`;
}

function formatPorts(ports) {
  if (!ports.length || isEmptyObject(ports[0])) {
    return "No port data reported.";
  }

  const lines = ports.slice(0, 20).map((port) => {
    const name = findValue(port, ["name", "service", "label", "description"]) ?? "Unknown";

    const host = findValue(port, ["host", "hostname", "address"]) ?? "localhost";

    const value = findValue(port, ["port", "ports", "value", "externalPort"]) ?? "N/A";

    const protocol = findValue(port, ["protocol", "transport", "type"]) ?? "";

    const status = findValue(port, ["status", "state", "healthy"]);

    return `\`${name}\` • \`${host}:${value}${protocol ? `/${protocol}` : ""}\` • ${formatStatusValue(status)}`;
  });

  return lines.join("\n");
}

function formatServices(services) {
  if (!services.length || isEmptyObject(services[0])) {
    return "No service data reported.";
  }

  const lines = services.slice(0, 20).map((service) => {
    const name = findValue(service, ["name", "service", "id", "container"]) ?? "Unknown";

    const status = findValue(service, ["status", "state", "health", "healthy"]) ?? "Unknown";

    return `${formatStatusEmoji(status)} \`${name}\` — ${formatStatusValue(status)}`;
  });

  return lines.join("\n");
}

function formatMetric(value, suffix = "") {
  if (value === null || value === undefined) {
    return "N/A";
  }

  if (typeof value === "object") {
    const numeric = value.percent ?? value.percentage ?? value.value ?? value.used;

    if (numeric !== undefined) {
      return `${numeric}${suffix}`;
    }

    return "Available";
  }

  if (typeof value === "number") {
    return `${Number(value.toFixed(1))}${suffix}`;
  }

  return String(value);
}

function formatStatusValue(value) {
  if (value === true) {
    return "READY";
  }

  if (value === false) {
    return "NOT READY";
  }

  if (value === null || value === undefined) {
    return "UNKNOWN";
  }

  return String(value).toUpperCase();
}

function formatStatusEmoji(value) {
  if (isPositiveStatus(value)) {
    return "🟢";
  }

  if (value === false || ["offline", "down", "failed", "error", "unhealthy"].includes(String(value).toLowerCase())) {
    return "🔴";
  }

  return "🟡";
}

function isPositiveStatus(value) {
  if (value === true) {
    return true;
  }

  if (typeof value !== "string") {
    return false;
  }

  return ["ready", "healthy", "ok", "online", "running", "up", "available", "true"].includes(value.toLowerCase());
}

function findValue(object, keys) {
  if (!object || typeof object !== "object") {
    return null;
  }

  for (const key of keys) {
    if (object[key] !== undefined && object[key] !== null) {
      return object[key];
    }
  }

  return null;
}

function isEmptyObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === 0;
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
  ctx.fillText("CRIMSON SKIES", 60, 95);

  ctx.font = "24px sans-serif";
  ctx.fillStyle = "#e6bd79";

  drawFittedText(ctx, serverName.toUpperCase(), 64, 135, 650, "24px sans-serif");

  ctx.strokeStyle = healthy ? "#c58b45" : "#a64b3d";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(64, 160);
  ctx.lineTo(620, 160);
  ctx.stroke();

  ctx.font = "bold 68px sans-serif";
  ctx.fillStyle = healthy ? "#70b85a" : "#c65345";
  ctx.fillText(healthy ? "✓" : "!", 70, 255);

  ctx.font = "bold 30px sans-serif";
  ctx.fillStyle = "#ead5ad";

  ctx.fillText(healthy ? "SERVER OPERATIONAL" : "SERVER ATTENTION", 165, 215);

  ctx.font = "20px sans-serif";
  ctx.fillStyle = "#d8bb83";

  drawFittedText(ctx, overview || "No overview data reported.", 165, 255, 600, "20px sans-serif");

  drawPerformance(ctx, performance);

  ctx.font = "18px sans-serif";
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

function drawPerformance(ctx, performance) {
  const metrics = [
    ["CPU", performance.cpu],
    ["MEM", performance.memory],
    ["DISK", performance.disk],
  ];

  const startX = 790;
  const startY = 205;

  ctx.font = "bold 18px sans-serif";
  ctx.fillStyle = "#ead5ad";
  ctx.fillText("SYSTEM PERFORMANCE", startX, 165);

  metrics.forEach(([label, value], index) => {
    const x = startX + index * 115;

    ctx.font = "bold 16px sans-serif";
    ctx.fillStyle = "#d8bb83";
    ctx.fillText(label, x, startY);

    ctx.font = "bold 28px sans-serif";
    ctx.fillStyle = "#f2d39b";
    ctx.fillText(formatMetric(value, "%"), x, startY + 35);
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
