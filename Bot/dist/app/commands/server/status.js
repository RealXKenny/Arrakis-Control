"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.data = void 0;
exports.execute = execute;
const discord_js_1 = require("discord.js");
const logger_1 = require("../../../infrastructure/core/logger");
const componentFactory_1 = require("../../../shared/factories/componentFactory");
const imageFactory_1 = require("../../../shared/factories/imageFactory");
const logger = (0, logger_1.createLogger)("SERVER STATUS");
const DUNE_COLORS = [
    0xc58b45,
    0xd2a85a,
    0xa96832,
    0x8f542c,
    0x70452c,
    0xb87333,
    0x9c6b3c,
];
const DEFAULT_SERVER_NAME = "Dune: Awakening Community Server";
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName("status")
    .setDescription("Show the current Dune server status.");
async function execute(interaction) {
    await interaction.deferReply();
    const client = interaction.client;
    const serverName = process.env.SERVER_NAME || DEFAULT_SERVER_NAME;
    if (!client.duneApi) {
        await interaction.editReply("The Dune server integration is not configured.");
        return;
    }
    try {
        const [status, performance, readiness, ports, services,] = await Promise.all([
            client.duneApi.call("GET", "/api/server/status"),
            client.duneApi.call("GET", "/api/server/performance"),
            client.duneApi.call("GET", "/api/server/readiness"),
            client.duneApi.call("GET", "/api/server/ports"),
            client.duneApi.call("GET", "/api/server/services"),
        ]);
        const statusResponse = status;
        const performanceResponse = performance;
        const readinessResponse = readiness;
        const portsResponse = ports;
        const servicesResponse = services;
        const statusData = parseServerStatus(toStringValue(statusResponse.stdout));
        const readinessData = parseReadiness(toStringValue(readinessResponse.stdout));
        const portsData = parsePorts(toStringValue(portsResponse.stdout));
        const servicesData = parseServices(toStringValue(servicesResponse.stdout));
        const performanceData = parsePerformance(performanceResponse);
        const healthy = statusData.overall === "READY" &&
            readinessData.failed === 0;
        const randomColor = DUNE_COLORS[Math.floor(Math.random() * DUNE_COLORS.length)];
        const accentColor = healthy
            ? (randomColor ?? DUNE_COLORS[0])
            : 0x8f3025;
        const banner = createStatusBanner({
            serverName,
            healthy,
            overall: statusData.overall,
            population: statusData.population,
            region: statusData.region,
        });
        const statusCard = new discord_js_1.ContainerBuilder()
            .setAccentColor(accentColor)
            .addMediaGalleryComponents(new discord_js_1.MediaGalleryBuilder().addItems(new discord_js_1.MediaGalleryItemBuilder().setURL("attachment://dune-server-status.png")))
            .addTextDisplayComponents((text) => text.setContent("## 🏜️ Dune Server Status"))
            .addTextDisplayComponents((text) => text.setContent(`-# ${serverName}`))
            .addSeparatorComponents((separator) => separator.setSpacing(discord_js_1.SeparatorSpacingSize.Small))
            .addTextDisplayComponents((text) => text.setContent([
            `### ${healthy ? "🟢" : "🔴"} ${healthy
                ? "Server Operational"
                : "Server Attention Required"}`,
            `**Overall:** ${statusData.overall || "UNKNOWN"}`,
            `**Region:** ${statusData.region || "Unknown"}`,
            `**Population:** ${statusData.population || "Unknown"}`,
        ].join("\n")))
            .addSeparatorComponents((separator) => separator.setSpacing(discord_js_1.SeparatorSpacingSize.Small))
            .addTextDisplayComponents((text) => text.setContent([
            "### 📊 Performance",
            `**CPU:** ${formatPercent(performanceData.cpuPercent)}`,
            `**Memory:** ${formatBytes(performanceData.memory?.usedBytes)} / ${formatBytes(performanceData.memory?.totalBytes)} (${formatPercent(performanceData.memory?.percent)})`,
            `**Disk:** ${formatBytes(performanceData.disk?.usedBytes)} / ${formatBytes(performanceData.disk?.totalBytes)} (${formatPercent(performanceData.disk?.percent)})`,
            `**Server Uptime:** ${performanceData.uptime ||
                "Unknown"}`,
        ].join("\n")))
            .addSeparatorComponents((separator) => separator.setSpacing(discord_js_1.SeparatorSpacingSize.Small))
            .addTextDisplayComponents((text) => text.setContent([
            "### 🎮 Game Servers",
            statusData.gameServers.length
                ? statusData.gameServers
                    .map((server) => `${server.state === "READY"
                    ? "🟢"
                    : "🔴"} **${server.map}** — \`${server.state}\` — ${server.uptime}`)
                    .join("\n")
                : "No game server data reported.",
            statusData.gameServerNote
                ? `\n-# ${statusData.gameServerNote}`
                : "",
        ].join("\n")))
            .addSeparatorComponents((separator) => separator.setSpacing(discord_js_1.SeparatorSpacingSize.Small))
            .addTextDisplayComponents((text) => text.setContent([
            "### 📦 Containers",
            servicesData.containers.length
                ? servicesData.containers
                    .map((service) => `${service.status
                    .toLowerCase()
                    .includes("healthy")
                    ? "🟢"
                    : "🟡"} \`${service.name}\` — ${service.status}`)
                    .join("\n")
                : statusData.containers ||
                    "No container data reported.",
        ].join("\n")))
            .addSeparatorComponents((separator) => separator.setSpacing(discord_js_1.SeparatorSpacingSize.Small))
            .addTextDisplayComponents((text) => text.setContent([
            "### 🛰️ Listeners",
            `**${readinessData.listenersPassed}/${readinessData.listenersTotal} listeners responding**`,
            "",
            readinessData.listeners.length
                ? readinessData.listeners
                    .map((listener) => `${listener.ok ? "🟢" : "🔴"} **${listener.name}** — \`${listener.port}\` — ${listener.status}`)
                    .join("\n")
                : statusData.listeners ||
                    "No listener data reported.",
        ].join("\n")))
            .addSeparatorComponents((separator) => separator.setSpacing(discord_js_1.SeparatorSpacingSize.Small))
            .addTextDisplayComponents((text) => text.setContent([
            "### 🧭 Readiness",
            readinessData.summary
                ? `**${readinessData.summary}**`
                : "No readiness summary reported.",
            `**Checks:** ${readinessData.passed} passed • ${readinessData.failed} failed`,
            "",
            readinessData.checks.length
                ? readinessData.checks
                    .slice(0, 20)
                    .map((check) => `${check.ok ? "🟢" : "🔴"} ${check.label}`)
                    .join("\n")
                : "No readiness checks reported.",
        ].join("\n")))
            .addSeparatorComponents((separator) => separator.setSpacing(discord_js_1.SeparatorSpacingSize.Small))
            .addTextDisplayComponents((text) => text.setContent([
            "### 🔌 Service Ports",
            portsData.length
                ? portsData
                    .map((port) => `${port.ok ? "🟢" : "🔴"} **${port.name}** — \`${port.address}\` — ${port.status}`)
                    .join("\n")
                : "No service port data reported.",
        ].join("\n")))
            .addSeparatorComponents((separator) => separator.setSpacing(discord_js_1.SeparatorSpacingSize.Small))
            .addTextDisplayComponents((text) => text.setContent([
            "### ⚙️ Services",
            servicesData.services.length
                ? servicesData.services
                    .map((service) => `${getServiceIndicator(service.status)} \`${service.name}\` — ${service.status}`)
                    .join("\n")
                : "No service data reported.",
        ].join("\n")))
            .addSeparatorComponents((separator) => separator.setSpacing(discord_js_1.SeparatorSpacingSize.Small))
            .addTextDisplayComponents((text) => text.setContent([
            "### 🗄️ Database",
            `**World partitions:** ${statusData.worldPartitions ??
                "Unknown"}`,
        ].join("\n")))
            .addSeparatorComponents((separator) => separator.setSpacing(discord_js_1.SeparatorSpacingSize.Small))
            .addTextDisplayComponents((text) => text.setContent([
            "### 🤖 Automation",
            `**Autoscaler:** ${statusData.autoscaler ||
                "UNKNOWN"}`,
            `**Auto updates:** ${statusData.autoUpdates ||
                "UNKNOWN"}`,
        ].join("\n")))
            .addSeparatorComponents((separator) => separator.setSpacing(discord_js_1.SeparatorSpacingSize.Small))
            .addTextDisplayComponents((text) => text.setContent([
            "### 🛡️ Funcom / FLS",
            `**Director heartbeat:** ${statusData.funcom
                .directorHeartbeat ||
                "UNKNOWN"}`,
            `**Population declaration:** ${statusData.funcom
                .populationDeclaration ||
                "UNKNOWN"}`,
            `**Max capacity declaration:** ${statusData.funcom.maxCapacity ||
                "UNKNOWN"}`,
            `**Gateway DB monitoring:** ${statusData.funcom.gatewayDb ||
                "UNKNOWN"}`,
        ].join("\n")))
            .addSeparatorComponents((separator) => separator.setSpacing(discord_js_1.SeparatorSpacingSize.Small))
            .addTextDisplayComponents((text) => text.setContent(`-# Spice flows through Arrakis • Requested by ${interaction.user.tag}`));
        await interaction.editReply({
            ...(0, componentFactory_1.createV2Response)([statusCard], [banner]),
            allowedMentions: {
                parse: [],
            },
        });
    }
    catch (error) {
        const errorMessage = getErrorMessage(error);
        const errorCard = new discord_js_1.ContainerBuilder()
            .setAccentColor(0x8f3025)
            .addTextDisplayComponents((text) => text.setContent("## 🏜️ Dune Server Status"))
            .addTextDisplayComponents((text) => text.setContent(`-# ${serverName}`))
            .addSeparatorComponents((separator) => separator.setSpacing(discord_js_1.SeparatorSpacingSize.Small))
            .addTextDisplayComponents((text) => text.setContent([
            "### 🔴 Server Status Unavailable",
            "The Arrakis server status could not be retrieved.",
            "Please try again later.",
        ].join("\n")))
            .addSeparatorComponents((separator) => separator.setSpacing(discord_js_1.SeparatorSpacingSize.Small))
            .addTextDisplayComponents((text) => text.setContent(`-# Spice flows through Arrakis • Requested by ${interaction.user.tag}`));
        await interaction.editReply({
            content: null,
            components: [errorCard],
            flags: discord_js_1.MessageFlags.IsComponentsV2,
        });
        logger.error(`Unable to retrieve the Dune server status: ${errorMessage}`, error);
    }
}
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
    if (overall?.[1]) {
        result.overall = overall[1].trim();
    }
    if (region?.[1]) {
        result.region = region[1].trim();
    }
    if (population?.[1]) {
        result.population =
            population[1].trim();
    }
    if (partitions?.[1]) {
        result.worldPartitions =
            Number(partitions[1]);
    }
    if (autoscaler?.[1]) {
        result.autoscaler =
            autoscaler[1].trim();
    }
    if (autoUpdates?.[1]) {
        result.autoUpdates =
            autoUpdates[1].trim();
    }
    const gameSection = stdout.match(/=== Game servers ===([\s\S]*?)(?:\n=== Automation ===|$)/);
    if (gameSection?.[1]) {
        const lines = gameSection[1]
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);
        for (const line of lines) {
            const match = line.match(/^(\S+)\s+(READY|NOT_READY|STOPPED|UNKNOWN)\s+(.+)$/);
            if (match?.[1] &&
                match[2] &&
                match[3]) {
                result.gameServers.push({
                    map: match[1],
                    state: match[2],
                    uptime: match[3],
                });
            }
            if (line.startsWith("Note:")) {
                result.gameServerNote =
                    line.replace(/^Note:\s*/, "");
            }
        }
    }
    const containerSection = stdout.match(/=== Containers ===([\s\S]*?)(?:\n=== Listeners ===|$)/);
    if (containerSection?.[1]) {
        result.containers =
            containerSection[1]
                .split("\n")
                .filter((line) => line.trim() &&
                !line
                    .trim()
                    .startsWith("SERVICE") &&
                !line.includes("==="))
                .map((line) => line.trim())
                .join("\n");
    }
    const listenerSection = stdout.match(/=== Listeners ===([\s\S]*?)(?:\n=== Database ===|$)/);
    if (listenerSection?.[1]) {
        result.listeners =
            listenerSection[1]
                .split("\n")
                .filter((line) => line.trim() &&
                !line
                    .trim()
                    .startsWith("CHECK") &&
                !line.includes("==="))
                .map((line) => line.trim())
                .join("\n");
    }
    const funcomSection = stdout.match(/=== Funcom\/FLS summary ===([\s\S]*?)(?:\nTip:|$)/);
    if (funcomSection?.[1]) {
        const section = funcomSection[1];
        const director = section.match(/Director heartbeat:\s+(.+)/);
        const populationDeclaration = section.match(/Population declaration:\s+(.+)/);
        const maxCapacity = section.match(/Max capacity declaration:\s+(.+)/);
        const gatewayDb = section.match(/Gateway DB monitoring:\s+(.+)/);
        if (director?.[1]) {
            result.funcom.directorHeartbeat =
                director[1].trim();
        }
        if (populationDeclaration?.[1]) {
            result.funcom.populationDeclaration =
                populationDeclaration[1].trim();
        }
        if (maxCapacity?.[1]) {
            result.funcom.maxCapacity =
                maxCapacity[1].trim();
        }
        if (gatewayDb?.[1]) {
            result.funcom.gatewayDb =
                gatewayDb[1].trim();
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
    if (summary?.[1]) {
        result.summary =
            summary[1].trim();
    }
    const lines = stdout
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
    for (const line of lines) {
        const match = line.match(/^(OK|FAIL)\s+(.+)$/);
        if (!match?.[1] ||
            !match[2]) {
            continue;
        }
        const ok = match[1] === "OK";
        if (ok) {
            result.passed++;
        }
        else {
            result.failed++;
        }
        result.checks.push({
            ok,
            label: match[2],
        });
    }
    const listenerSection = stdout.match(/=== Listener checks ===([\s\S]*?)(?:\n=== Database world partition checks ===|$)/);
    if (listenerSection?.[1]) {
        const listenerLines = listenerSection[1]
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);
        for (const line of listenerLines) {
            const match = line.match(/^(OK|FAIL)\s+(TCP|UDP)\s+(\d+)\s+(.+)$/);
            if (!match?.[1] ||
                !match[2] ||
                !match[3] ||
                !match[4]) {
                continue;
            }
            const ok = match[1] === "OK";
            const protocol = match[2];
            const portNumber = match[3];
            const name = match[4];
            result.listeners.push({
                ok,
                protocol,
                port: `${portNumber}/${protocol.toLowerCase()}`,
                name,
                status: ok ? "OK" : "FAIL",
            });
            result.listenersTotal++;
            if (ok) {
                result.listenersPassed++;
            }
        }
    }
    return result;
}
function parsePorts(stdout) {
    const ports = [];
    const section = stdout.match(/=== Local listeners ===([\s\S]*?)(?:\n=== Generated INI values ===|$)/);
    if (!section?.[1]) {
        return ports;
    }
    for (const line of section[1].split("\n")) {
        const match = line
            .trim()
            .match(/^(\w+)\s+(.+?)\s+(TCP|UDP)\s+(\d+)(?:\s+at\s+(.+))?$/);
        if (!match?.[2] ||
            !match[3] ||
            !match[4]) {
            continue;
        }
        ports.push({
            ok: true,
            name: match[2],
            address: `${match[5] || "localhost"}:${match[4]}/${match[3].toLowerCase()}`,
            status: "OK",
        });
    }
    const fallbackLines = section[1]
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.startsWith("OK"));
    if (!ports.length) {
        for (const line of fallbackLines) {
            const match = line.match(/^OK\s+(.+?)\s+listening on (TCP|UDP)\s+(\d+)(?:\s+at\s+(.+))?$/);
            if (!match?.[1] ||
                !match[2] ||
                !match[3]) {
                continue;
            }
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
    if (startIndex === -1) {
        return result;
    }
    for (const line of lines.slice(startIndex + 1)) {
        const match = line.match(/^(\S+)\s{2,}(.+?)(?:\s{2,}(.*))?$/);
        if (!match?.[1] ||
            !match[2]) {
            continue;
        }
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
function parsePerformance(response) {
    return {
        cpuPercent: toNumber(response.cpuPercent),
        memory: {
            usedBytes: toNumber(response.memory?.usedBytes),
            totalBytes: toNumber(response.memory?.totalBytes),
            percent: toNumber(response.memory?.percent),
        },
        disk: {
            usedBytes: toNumber(response.disk?.usedBytes),
            totalBytes: toNumber(response.disk?.totalBytes),
            percent: toNumber(response.disk?.percent),
        },
        uptime: toStringValue(response.uptime),
    };
}
function getServiceIndicator(status) {
    const value = status.toLowerCase();
    if (value.includes("healthy")) {
        return "🟢";
    }
    if (value.startsWith("up")) {
        return "🟢";
    }
    if (value.includes("starting")) {
        return "🟡";
    }
    if (value.includes("restarting")) {
        return "🟠";
    }
    if (value.includes("exited")) {
        return "🔴";
    }
    if (value.includes("dead")) {
        return "🔴";
    }
    return "🟡";
}
function formatPercent(value) {
    if (typeof value !== "number" ||
        !Number.isFinite(value)) {
        return "Unknown";
    }
    return `${value.toFixed(1)}%`;
}
function formatBytes(bytes) {
    if (typeof bytes !== "number" ||
        !Number.isFinite(bytes)) {
        return "Unknown";
    }
    const units = [
        "B",
        "KB",
        "MB",
        "GB",
        "TB",
    ];
    let value = bytes;
    let index = 0;
    while (value >= 1024 &&
        index < units.length - 1) {
        value /= 1024;
        index++;
    }
    return `${value.toFixed(index >= 2 ? 1 : 0)} ${units[index]}`;
}
function createStatusBanner({ serverName, healthy, overall, population, region, }) {
    return (0, imageFactory_1.createDuneBanner)({
        filename: "dune-server-status.png",
        title: healthy
            ? "Server Ready"
            : "Server Alert",
        subtitle: `${overall || "UNKNOWN"} • ${population || "0/0"}`,
        detail: `${serverName} • ${region || "ARRAKIS"}`,
    });
}
function toStringValue(value) {
    if (typeof value === "string") {
        return value;
    }
    if (value === null ||
        value === undefined) {
        return "";
    }
    return String(value);
}
function toNumber(value) {
    if (typeof value === "number" &&
        Number.isFinite(value)) {
        return value;
    }
    if (typeof value === "string" &&
        value.trim() !== "") {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) {
            return parsed;
        }
    }
    return undefined;
}
function getErrorMessage(error) {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === "string") {
        return error;
    }
    try {
        return JSON.stringify(error);
    }
    catch {
        return "Unknown error";
    }
}
exports.default = {
    data: exports.data,
    execute,
};
