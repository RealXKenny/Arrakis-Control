const { AttachmentBuilder, ContainerBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder, MessageFlags, SeparatorSpacingSize, SlashCommandBuilder } = require("discord.js");
const { createCanvas } = require("canvas");
const { createLogger } = require("../../../infrastructure/core/logger");
const { createV2Response } = require("../../../shared/utils/componentFactory");
const { createDuneBanner } = require("../../../shared/utils/imageFactory");

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

      const statusData = parseServerStatus(status?.stdout || "");
      const readinessData = parseReadiness(readiness?.stdout || "");
      const portsData = parsePorts(ports?.stdout || "");
      const servicesData = parseServices(services?.stdout || "");

      const healthy = statusData.overall === "READY" && readinessData.failed === 0;

      const accentColor = healthy ? DUNE_COLORS[Math.floor(Math.random() * DUNE_COLORS.length)] : 0x8f3025;

      const banner = createStatusBanner({
        serverName,
        healthy,
        overall: statusData.overall,
        population: statusData.population,
        region: statusData.region,
        cpuPercent: performance?.cpuPercent,
        memoryPercent: performance?.memory?.percent,
        diskPercent: performance?.disk?.percent,
        uptime: performance?.uptime,
      });

      const statusCard = new ContainerBuilder()
        .setAccentColor(accentColor)
        .addMediaGalleryComponents(new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL("attachment://dune-server-status.png")))
        .addTextDisplayComponents((text) => text.setContent("## 🏜️ Dune Server Status"))
        .addTextDisplayComponents((text) => text.setContent(`-# ${serverName}`))
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents((text) =>
          text.setContent(
            [
              `### ${healthy ? "🟢" : "🔴"} ${healthy ? "Server Operational" : "Server Attention Required"}`,
              `**Overall:** ${statusData.overall || "UNKNOWN"}`,
              `**Region:** ${statusData.region || "Unknown"}`,
              `**Population:** ${statusData.population || "Unknown"}`,
            ].join("\n"),
          ),
        )
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents((text) =>
          text.setContent(
            [
              "### 📊 Performance",
              `**CPU:** ${formatPercent(performance?.cpuPercent)}`,
              `**Memory:** ${formatBytes(performance?.memory?.usedBytes)} / ${formatBytes(performance?.memory?.totalBytes)} (${formatPercent(performance?.memory?.percent)})`,
              `**Disk:** ${formatBytes(performance?.disk?.usedBytes)} / ${formatBytes(performance?.disk?.totalBytes)} (${formatPercent(performance?.disk?.percent)})`,
              `**Server Uptime:** ${performance?.uptime || "Unknown"}`,
            ].join("\n"),
          ),
        )
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents((text) =>
          text.setContent(
            [
              "### 🎮 Game Servers",
              statusData.gameServers.length ? statusData.gameServers.map((server) => `${server.state === "READY" ? "🟢" : "🔴"} **${server.map}** — \`${server.state}\` — ${server.uptime}`).join("\n") : "No game server data reported.",
              statusData.gameServerNote ? `\n-# ${statusData.gameServerNote}` : "",
            ].join("\n"),
          ),
        )
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents((text) =>
          text.setContent(
            [
              "### 📦 Containers",
              servicesData.containers.length
                ? servicesData.containers.map((service) => `${service.status.includes("healthy") ? "🟢" : "🟡"} \`${service.name}\` — ${service.status}`).join("\n")
                : statusData.containers || "No container data reported.",
            ].join("\n"),
          ),
        )
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents((text) =>
          text.setContent(
            [
              `### 🛰️ Listeners`,
              `**${readinessData.listenersPassed}/${readinessData.listenersTotal} listeners responding**`,
              "",
              readinessData.listeners.length
                ? readinessData.listeners.map((listener) => `${listener.ok ? "🟢" : "🔴"} **${listener.name}** — \`${listener.port}\` — ${listener.status}`).join("\n")
                : statusData.listeners || "No listener data reported.",
            ].join("\n"),
          ),
        )
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents((text) =>
          text.setContent(
            [
              "### 🧭 Readiness",
              readinessData.summary ? `**${readinessData.summary}**` : "No readiness summary reported.",
              `**Checks:** ${readinessData.passed} passed • ${readinessData.failed} failed`,
              "",
              readinessData.checks.length
                ? readinessData.checks
                    .slice(0, 20)
                    .map((check) => `${check.ok ? "🟢" : "🔴"} ${check.label}`)
                    .join("\n")
                : "No readiness checks reported.",
            ].join("\n"),
          ),
        )
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents((text) =>
          text.setContent(["### 🔌 Service Ports", portsData.length ? portsData.map((port) => `${port.ok ? "🟢" : "🔴"} **${port.name}** — \`${port.address}\` — ${port.status}`).join("\n") : "No service port data reported."].join("\n")),
        )
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents((text) =>
          text.setContent(
            ["### ⚙️ Services", servicesData.services.length ? servicesData.services.map((service) => `${getServiceIndicator(service.status)} \`${service.name}\` — ${service.status}`).join("\n") : "No service data reported."].join("\n"),
          ),
        )
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents((text) => text.setContent(["### 🗄️ Database", `**World partitions:** ${statusData.worldPartitions ?? "Unknown"}`].join("\n")))
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents((text) => text.setContent(["### 🤖 Automation", `**Autoscaler:** ${statusData.autoscaler || "UNKNOWN"}`, `**Auto updates:** ${statusData.autoUpdates || "UNKNOWN"}`].join("\n")))
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents((text) =>
          text.setContent(
            [
              "### 🛡️ Funcom / FLS",
              `**Director heartbeat:** ${statusData.funcom.directorHeartbeat || "UNKNOWN"}`,
              `**Population declaration:** ${statusData.funcom.populationDeclaration || "UNKNOWN"}`,
              `**Max capacity declaration:** ${statusData.funcom.maxCapacity || "UNKNOWN"}`,
              `**Gateway DB monitoring:** ${statusData.funcom.gatewayDb || "UNKNOWN"}`,
            ].join("\n"),
          ),
        )
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents((text) => text.setContent(`-# Spice flows through Arrakis • Requested by ${interaction.user.tag}`));

      await interaction.editReply({ ...createV2Response([statusCard], [banner]), allowedMentions: { parse: [] } });
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

function parseServerStatus(stdout) {
  const result = {
    overall: "UNKNOWN",
    region: "Unknown",
    population: "Unknown",
    gameServers: [],
    gameServerNote: "",
    containers: "",
    listeners: "",
    worldPartitions: null,
    autoscaler: "UNKNOWN",
    autoUpdates: "UNKNOWN",
    funcom: {
      directorHeartbeat: "UNKNOWN",
      populationDeclaration: "UNKNOWN",
      maxCapacity: "UNKNOWN",
      gatewayDb: "UNKNOWN",
    },
  };

  const overall = stdout.match(/Overall:\s+(.+)/);
  const region = stdout.match(/Region:\s+(.+)/);
  const population = stdout.match(/Population:\s+(.+)/);
  const partitions = stdout.match(/World partitions:\s+(\d+)/);
  const autoscaler = stdout.match(/Autoscaler:\s+(.+)/);
  const autoUpdates = stdout.match(/Auto updates:\s+(.+)/);

  if (overall) result.overall = overall[1].trim();
  if (region) result.region = region[1].trim();
  if (population) result.population = population[1].trim();
  if (partitions) result.worldPartitions = Number(partitions[1]);
  if (autoscaler) result.autoscaler = autoscaler[1].trim();
  if (autoUpdates) result.autoUpdates = autoUpdates[1].trim();

  const gameSection = stdout.match(/=== Game servers ===([\s\S]*?)(?:\n=== Automation ===|$)/);

  if (gameSection) {
    const lines = gameSection[1]
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    for (const line of lines) {
      const match = line.match(/^(\S+)\s+(READY|NOT_READY|STOPPED|UNKNOWN)\s+(.+)$/);

      if (match) {
        result.gameServers.push({
          map: match[1],
          state: match[2],
          uptime: match[3],
        });
      }

      if (line.startsWith("Note:")) {
        result.gameServerNote = line.replace(/^Note:\s*/, "");
      }
    }
  }

  const containerSection = stdout.match(/=== Containers ===([\s\S]*?)(?:\n=== Listeners ===|$)/);

  if (containerSection) {
    result.containers = containerSection[1]
      .split("\n")
      .filter((line) => line.trim() && !line.trim().startsWith("SERVICE") && !line.includes("==="))
      .map((line) => line.trim())
      .join("\n");
  }

  const listenerSection = stdout.match(/=== Listeners ===([\s\S]*?)(?:\n=== Database ===|$)/);

  if (listenerSection) {
    result.listeners = listenerSection[1]
      .split("\n")
      .filter((line) => line.trim() && !line.trim().startsWith("CHECK") && !line.includes("==="))
      .map((line) => line.trim())
      .join("\n");
  }

  const funcomSection = stdout.match(/=== Funcom\/FLS summary ===([\s\S]*?)(?:\nTip:|$)/);

  if (funcomSection) {
    const section = funcomSection[1];

    const director = section.match(/Director heartbeat:\s+(.+)/);
    const populationDeclaration = section.match(/Population declaration:\s+(.+)/);
    const maxCapacity = section.match(/Max capacity declaration:\s+(.+)/);
    const gatewayDb = section.match(/Gateway DB monitoring:\s+(.+)/);

    if (director) {
      result.funcom.directorHeartbeat = director[1].trim();
    }

    if (populationDeclaration) {
      result.funcom.populationDeclaration = populationDeclaration[1].trim();
    }

    if (maxCapacity) {
      result.funcom.maxCapacity = maxCapacity[1].trim();
    }

    if (gatewayDb) {
      result.funcom.gatewayDb = gatewayDb[1].trim();
    }
  }

  return result;
}

function parseReadiness(stdout) {
  const result = {
    summary: "",
    passed: 0,
    failed: 0,
    listenersPassed: 0,
    listenersTotal: 0,
    checks: [],
    listeners: [],
  };

  const summary = stdout.match(/READY:\s+(.+)/);

  if (summary) {
    result.summary = summary[1].trim();
  }

  const lines = stdout
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    const match = line.match(/^(OK|FAIL)\s+(.+)$/);

    if (!match) continue;

    const ok = match[1] === "OK";

    if (ok) {
      result.passed++;
    } else {
      result.failed++;
    }

    result.checks.push({
      ok,
      label: match[2],
    });
  }

  const listenerSection = stdout.match(/=== Listener checks ===([\s\S]*?)(?:\n=== Database world partition checks ===|$)/);

  if (listenerSection) {
    const listenerLines = listenerSection[1]
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    for (const line of listenerLines) {
      const match = line.match(/^(OK|FAIL)\s+(TCP|UDP)\s+(\d+)\s+(.+)$/);

      if (!match) continue;

      const ok = match[1] === "OK";

      result.listeners.push({
        ok,
        protocol: match[2],
        port: `${match[3]}/${match[2].toLowerCase()}`,
        name: match[4],
        status: ok ? "OK" : "FAIL",
      });

      result.listenersTotal++;
      if (ok) result.listenersPassed++;
    }
  }

  return result;
}

function parsePorts(stdout) {
  const ports = [];

  const section = stdout.match(/=== Local listeners ===([\s\S]*?)(?:\n=== Generated INI values ===|$)/);

  if (!section) return ports;

  for (const line of section[1].split("\n")) {
    const match = line.trim().match(/^(\w+)\s+(.+?)\s+(TCP|UDP)\s+(\d+)(?:\s+at\s+(.+))?$/);

    if (match) {
      ports.push({
        ok: true,
        name: match[2],
        address: `${match[5] || "localhost"}:${match[4]}/${match[3].toLowerCase()}`,
        status: "OK",
      });
    }
  }

  const fallbackLines = section[1]
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("OK"));

  if (!ports.length) {
    for (const line of fallbackLines) {
      const match = line.match(/^OK\s+(.+?)\s+listening on (TCP|UDP)\s+(\d+)(?:\s+at\s+(.+))?$/);

      if (!match) continue;

      ports.push({
        ok: true,
        name: match[1],
        address: `${match[4] || "localhost"}:${match[3]}/${match[2].toLowerCase()}`,
        status: "OK",
      });
    }
  }

  return ports;
}

function parseServices(stdout) {
  const result = {
    services: [],
    containers: [],
  };

  const lines = stdout
    .split("\n")
    .map((line) => line.trimEnd())
    .filter(Boolean);

  const startIndex = lines.findIndex((line) => line.startsWith("NAMES"));

  if (startIndex === -1) return result;

  for (const line of lines.slice(startIndex + 1)) {
    const match = line.match(/^(\S+)\s{2,}(.+?)(?:\s{2,}(.*))?$/);

    if (!match) continue;

    const name = match[1];
    const status = match[2].trim();

    result.services.push({
      name,
      status,
      ports: match[3]?.trim() || "",
    });

    result.containers.push({
      name,
      status,
    });
  }

  return result;
}

function getServiceIndicator(status) {
  const value = status.toLowerCase();

  if (value.includes("healthy")) return "🟢";
  if (value.startsWith("up")) return "🟢";
  if (value.includes("starting")) return "🟡";
  if (value.includes("restarting")) return "🟠";
  if (value.includes("exited")) return "🔴";
  if (value.includes("dead")) return "🔴";

  return "🟡";
}

function formatPercent(value) {
  if (typeof value !== "number") return "Unknown";
  return `${value.toFixed(1)}%`;
}

function formatBytes(bytes) {
  if (typeof bytes !== "number") return "Unknown";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let index = 0;

  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index++;
  }

  return `${value.toFixed(index >= 2 ? 1 : 0)} ${units[index]}`;
}

function createStatusBanner({ serverName, healthy, overall, population, region, cpuPercent, memoryPercent, diskPercent, uptime }) {
  return createDuneBanner({ filename: "dune-server-status.png", title: healthy ? "Server Ready" : "Server Alert", subtitle: `${overall ?? "UNKNOWN"} • ${population ?? "0/0"}`, detail: `${serverName} • ${region ?? "ARRAKIS"}` });
  const canvas = createCanvas(1200, 400);
  const ctx = canvas.getContext("2d");

  const background = ctx.createLinearGradient(0, 0, 0, canvas.height);

  background.addColorStop(0, "#21140d");
  background.addColorStop(0.35, "#5c321e");
  background.addColorStop(0.7, "#a35f30");
  background.addColorStop(1, "#d2a85a");

  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const glow = ctx.createRadialGradient(930, 80, 20, 930, 80, 450);

  glow.addColorStop(0, healthy ? "rgba(255, 190, 90, 0.55)" : "rgba(180, 55, 35, 0.55)");

  glow.addColorStop(0.45, healthy ? "rgba(190, 100, 40, 0.22)" : "rgba(130, 35, 25, 0.25)");

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

  overlay.addColorStop(0, "rgba(10, 7, 5, 0.9)");
  overlay.addColorStop(0.55, "rgba(10, 7, 5, 0.45)");
  overlay.addColorStop(1, "rgba(10, 7, 5, 0.05)");

  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = "bold 52px sans-serif";
  ctx.fillStyle = "#f2d39b";
  ctx.fillText("DUNE SERVER", 60, 85);

  ctx.font = "24px sans-serif";
  ctx.fillStyle = "#e6bd79";

  drawFittedText(ctx, serverName.toUpperCase(), 64, 125, 650, "24px sans-serif");

  ctx.strokeStyle = healthy ? "#c58b45" : "#a64b3d";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(64, 150);
  ctx.lineTo(620, 150);
  ctx.stroke();

  ctx.font = "bold 30px sans-serif";
  ctx.fillStyle = healthy ? "#70b85a" : "#c65345";

  ctx.fillText(healthy ? "● SERVER OPERATIONAL" : "● SERVER ATTENTION", 64, 205);

  ctx.font = "20px sans-serif";
  ctx.fillStyle = "#ead5ad";

  ctx.fillText(`Status: ${overall}`, 64, 245);
  ctx.fillText(`Region: ${region}`, 64, 275);
  ctx.fillText(`Population: ${population}`, 64, 305);

  ctx.font = "18px sans-serif";
  ctx.fillStyle = "#d8bb83";

  ctx.fillText(`CPU ${formatPercent(cpuPercent)}  •  Memory ${formatPercent(memoryPercent)}  •  Disk ${formatPercent(diskPercent)}`, 64, 345);

  ctx.font = "17px sans-serif";
  ctx.fillStyle = "#ead5ad";

  drawFittedText(ctx, `Uptime ${uptime || "Unknown"} • Spice flows through Arrakis`, 64, 375, 850, "17px sans-serif");

  const accent = ctx.createLinearGradient(0, 0, canvas.width, 0);

  accent.addColorStop(0, healthy ? "#8f3025" : "#6e241c");
  accent.addColorStop(0.5, healthy ? "#d2a85a" : "#a64b3d");
  accent.addColorStop(1, healthy ? "#c58b45" : "#8f3025");

  ctx.fillStyle = accent;
  ctx.fillRect(0, canvas.height - 5, canvas.width, 5);

  return new AttachmentBuilder(canvas.toBuffer("image/png"), {
    name: "dune-server-status.png",
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
