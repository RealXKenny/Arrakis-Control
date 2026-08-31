"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const componentFactory_1 = require("../../../shared/factories/componentFactory");
const imageFactory_1 = require("../../../shared/factories/imageFactory");
const logger_1 = require("../../../infrastructure/core/logger");
const logger = (0, logger_1.createLogger)("BACKUPS");
const DEFAULT_SERVER_NAME = "Dune: Awakening Community Server";
const DUNE_COLORS = [
    0xc58b45,
    0xd2a85a,
    0xa96832,
    0x8f542c,
    0x70452c,
    0xb87333,
    0x9c6b3c,
];
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("backups")
        .setDescription("Show available Dune server backups and auto-backup status."),
    async execute(interaction) {
        await interaction.deferReply();
        const client = interaction.client;
        const serverName = process.env.SERVER_NAME || DEFAULT_SERVER_NAME;
        try {
            const [backupResponse, autoBackupResponse] = await Promise.all([
                client.duneApi.call("GET", "/api/backups"),
                client.duneApi.call("GET", "/api/backups/auto"),
            ]);
            const backups = parseBackups(backupResponse);
            const autoBackup = parseAutoBackup(autoBackupResponse);
            const accentColor = DUNE_COLORS[Math.floor(Math.random() * DUNE_COLORS.length)];
            const banner = createBackupBanner({
                serverName,
                count: backups.count,
                autoBackup: autoBackup.enabled,
            });
            const card = new discord_js_1.ContainerBuilder()
                .setAccentColor(accentColor)
                .addMediaGalleryComponents(new discord_js_1.MediaGalleryBuilder().addItems(new discord_js_1.MediaGalleryItemBuilder().setURL("attachment://dune-server-backups.png")))
                .addTextDisplayComponents((text) => text.setContent("## 🏜️ Dune Server Backups"))
                .addTextDisplayComponents((text) => text.setContent(`-# ${serverName}`))
                .addSeparatorComponents((separator) => separator.setSpacing(discord_js_1.SeparatorSpacingSize.Small))
                .addTextDisplayComponents((text) => text.setContent(["### 📦 Database Backups", backups.content].join("\n")))
                .addSeparatorComponents((separator) => separator.setSpacing(discord_js_1.SeparatorSpacingSize.Small))
                .addTextDisplayComponents((text) => text.setContent([
                `### ${autoBackup.enabled ? "🟢" : "🔴"} Auto-Backups`,
                `**Status:** ${autoBackup.enabled
                    ? "🟢 ENABLED"
                    : "🔴 DISABLED"}`,
                `**Directory:** \`${autoBackup.directory || "Unknown"}\``,
            ].join("\n")))
                .addSeparatorComponents((separator) => separator.setSpacing(discord_js_1.SeparatorSpacingSize.Small))
                .addTextDisplayComponents((text) => text.setContent([
                "### 🕒 Schedule",
                `**Backup time:** \`${autoBackup.backupTime || "Unknown"} UTC\``,
                `**Interval:** \`${autoBackup.intervalHours ?? "Unknown"} hours\``,
                `**Retention:** \`${autoBackup.retentionDays ?? "Unknown"} days\``,
                `**Next backup:** ${autoBackup.nextBackup}`,
                `**Last backup:** ${autoBackup.lastBackup}`,
            ].join("\n")))
                .addSeparatorComponents((separator) => separator.setSpacing(discord_js_1.SeparatorSpacingSize.Small))
                .addTextDisplayComponents((text) => text.setContent([
                "### ⚙️ Systemd Timer",
                `**Status:** \`${autoBackup.timerStatus || "Unknown"}\``,
                `**Unit:** \`${autoBackup.timerUnit || "Unknown"}\``,
                `**Activates:** \`${autoBackup.serviceUnit || "Unknown"}\``,
            ].join("\n")))
                .addSeparatorComponents((separator) => separator.setSpacing(discord_js_1.SeparatorSpacingSize.Small))
                .addTextDisplayComponents((text) => text.setContent(`-# ${backups.count} backup${backups.count === 1 ? "" : "s"} available • Spice flows through Arrakis • Requested by ${interaction.user.tag}`));
            await interaction.editReply({
                ...(0, componentFactory_1.createV2Response)([card], [banner]),
                allowedMentions: { parse: [] },
            });
        }
        catch (error) {
            const errorDetails = getErrorDetails(error);
            const errorCard = new discord_js_1.ContainerBuilder()
                .setAccentColor(0x8f3025)
                .addTextDisplayComponents((text) => text.setContent("## 🏜️ Dune Server Backups"))
                .addTextDisplayComponents((text) => text.setContent(`-# ${serverName}`))
                .addSeparatorComponents((separator) => separator.setSpacing(discord_js_1.SeparatorSpacingSize.Small))
                .addTextDisplayComponents((text) => text.setContent([
                "### 🔴 Backups Unavailable",
                "The server backup information could not be retrieved.",
                "",
                `**Error:** \`${errorDetails.message}\``,
                errorDetails.status !== null
                    ? `**HTTP Status:** \`${errorDetails.status}\``
                    : null,
            ]
                .filter(Boolean)
                .join("\n")))
                .addSeparatorComponents((separator) => separator.setSpacing(discord_js_1.SeparatorSpacingSize.Small))
                .addTextDisplayComponents((text) => text.setContent(`-# Spice flows through Arrakis • Requested by ${interaction.user.tag}`));
            await interaction.editReply({
                components: [errorCard],
                flags: discord_js_1.MessageFlags.IsComponentsV2,
            });
            logger.error(`Unable to retrieve Dune server backup information. ${errorDetails.message}`, error);
        }
    },
};
function isObject(value) {
    return typeof value === "object" && value !== null;
}
function asObject(value) {
    return isObject(value) ? value : null;
}
function asArray(value) {
    return Array.isArray(value) ? value : null;
}
function getProperty(value, key) {
    if (!isObject(value)) {
        return undefined;
    }
    return value[key];
}
function getString(value, fallback = null) {
    return typeof value === "string"
        ? value
        : fallback;
}
function getNumber(value, fallback = null) {
    const number = Number(value);
    return Number.isFinite(number)
        ? number
        : fallback;
}
function parseBackups(response) {
    const arrayResponse = asArray(response);
    if (arrayResponse) {
        return formatBackupList(arrayResponse);
    }
    const objectResponse = asObject(response);
    if (!objectResponse) {
        return {
            count: 0,
            content: "No backups available.",
        };
    }
    const backups = asArray(objectResponse["backups"]);
    if (backups) {
        return formatBackupList(backups);
    }
    const data = asArray(objectResponse["data"]);
    if (data) {
        return formatBackupList(data);
    }
    const stdout = objectResponse["stdout"];
    if (typeof stdout === "string") {
        return parseBackupOutput(stdout);
    }
    const entries = Object.entries(objectResponse).filter(([, value]) => value !== null &&
        value !== undefined);
    if (entries.length) {
        return {
            count: entries.length,
            content: entries
                .map(([key, value]) => `**${formatLabel(key)}:** ${formatValue(value)}`)
                .join("\n"),
        };
    }
    return {
        count: 0,
        content: "No backups available.",
    };
}
function parseBackupOutput(stdout) {
    const lines = stdout
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .filter((line) => !line.startsWith("==="));
    const backups = [];
    for (const line of lines) {
        const match = line.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})\s+(.+)$/);
        if (!match) {
            continue;
        }
        backups.push({
            timestamp: `${match[1]}T${match[2]}Z`,
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
    const sorted = [...backups].sort((a, b) => {
        const aTime = getTimestampFromUnknown(a);
        const bTime = getTimestampFromUnknown(b);
        return bTime - aTime;
    });
    return {
        count: sorted.length,
        content: sorted
            .map((backup, index) => formatBackup(backup, index))
            .join("\n\n"),
    };
}
function formatBackup(backup, index) {
    if (typeof backup === "string" ||
        typeof backup === "number") {
        return `**${index + 1}.** 💾 \`${backup}\``;
    }
    const object = asObject(backup);
    if (!object) {
        return `**${index + 1}.** 💾 \`${String(backup)}\``;
    }
    const path = getFirstDefined(object, [
        "path",
        "name",
        "filename",
        "fileName",
        "id",
    ]) ??
        `Backup ${index + 1}`;
    const timestamp = getFirstDefined(object, [
        "timestamp",
        "createdAt",
        "created_at",
        "date",
    ]);
    const size = getFirstDefined(object, [
        "size",
        "sizeBytes",
        "bytes",
    ]);
    const status = getFirstDefined(object, [
        "status",
        "state",
    ]);
    const filename = getFilename(path);
    const details = [];
    const timestampText = discordTimestampUnknown(timestamp);
    if (timestampText) {
        details.push(timestampText);
    }
    if (size !== undefined &&
        size !== null) {
        details.push(formatBytes(size));
    }
    if (typeof status === "string" &&
        status) {
        details.push(status.toUpperCase());
    }
    return [
        `**${index + 1}.** 💾 \`${filename}\``,
        details.length
            ? `└ ${details.join(" • ")}`
            : null,
    ]
        .filter(Boolean)
        .join("\n");
}
function parseAutoBackup(response) {
    if (!response) {
        return emptyAutoBackup();
    }
    if (typeof response === "string") {
        return parseAutoBackupOutput(response);
    }
    const object = asObject(response);
    if (!object) {
        return emptyAutoBackup();
    }
    const stdout = object["stdout"];
    if (typeof stdout === "string") {
        return parseAutoBackupOutput(stdout);
    }
    return parseAutoBackupObject(object);
}
function parseAutoBackupOutput(stdout) {
    const text = String(stdout).replace(/\r/g, "");
    const enabled = extractBoolean(text, /Enabled:\s*(true|false)/i);
    const backupTime = extractValue(text, /Backup time:\s*([^\s]+)/i) ??
        extractValue(text, /backup[_\s-]?time:\s*([^\s]+)/i);
    const intervalMatch = text.match(/Interval hours:\s*(\d+(?:\.\d+)?)/i);
    const retentionMatch = text.match(/Retention:\s*(\d+)\s*days?/i);
    const directory = extractValue(text, /Backup directory:\s*(.+?)(?=\s+Systemd timer:|\n|$)/i);
    const timerStatus = extractValue(text, /Systemd timer:\s*([^\s]+)/i) ??
        detectTimerStatus(text);
    const timerSection = extractTimerSection(text);
    const timer = parseSystemdTimer(timerSection);
    const lastBackup = findLastBackup(text);
    const nextBackup = timer.nextBackup ??
        calculateNextBackup({
            backupTime,
            intervalHours: intervalMatch
                ? Number(intervalMatch[1])
                : null,
            lastBackupTimestamp: lastBackup?.timestamp ?? null,
        });
    return {
        enabled,
        backupTime,
        intervalHours: intervalMatch
            ? Number(intervalMatch[1])
            : null,
        retentionDays: retentionMatch
            ? Number(retentionMatch[1])
            : null,
        directory,
        timerStatus,
        timerUnit: timer.timerUnit,
        serviceUnit: timer.serviceUnit,
        nextBackup: nextBackup
            ? discordTimestampUnknown(nextBackup) ??
                "Unknown"
            : "Unknown",
        lastBackup: lastBackup
            ? formatLastBackup(lastBackup.timestamp)
            : "Unknown",
    };
}
function parseAutoBackupObject(response) {
    const enabled = getBoolean(getFirstDefined(response, [
        "enabled",
        "active",
        "running",
        "autoBackup",
        "auto_backup",
    ]));
    const backupTime = toStringOrNull(getFirstDefined(response, [
        "backupTime",
        "backup_time",
        "time",
    ]));
    const intervalHours = toNumberOrNull(getFirstDefined(response, [
        "intervalHours",
        "interval_hours",
        "interval",
    ]));
    const retentionDays = toNumberOrNull(getFirstDefined(response, [
        "retentionDays",
        "retention_days",
        "retention",
    ]));
    const directory = toStringOrNull(getFirstDefined(response, [
        "directory",
        "backupDirectory",
        "backup_directory",
    ]));
    const timerObject = asObject(response["timer"]) ?? {};
    const nextRaw = getFirstDefined(response, [
        "nextBackup",
        "next_backup",
        "next",
    ]) ??
        getFirstDefined(timerObject, [
            "next",
            "nextBackup",
        ]);
    const lastRaw = getFirstDefined(response, [
        "lastBackup",
        "last_backup",
        "last",
    ]);
    const calculatedNext = nextRaw ??
        calculateNextBackup({
            backupTime,
            intervalHours,
            lastBackupTimestamp: getTimestampFromUnknown(lastRaw),
        });
    return {
        enabled,
        backupTime,
        intervalHours,
        retentionDays,
        directory,
        timerStatus: toStringOrNull(getFirstDefined(response, [
            "timerStatus",
            "timer_status",
        ])) ??
            toStringOrNull(timerObject["status"]),
        timerUnit: toStringOrNull(getFirstDefined(response, [
            "timerUnit",
            "timer_unit",
        ])) ??
            toStringOrNull(timerObject["unit"]),
        serviceUnit: toStringOrNull(getFirstDefined(response, [
            "serviceUnit",
            "service_unit",
        ])) ??
            toStringOrNull(timerObject["service"]),
        nextBackup: calculatedNext
            ? discordTimestampUnknown(calculatedNext) ??
                "Unknown"
            : "Unknown",
        lastBackup: lastRaw
            ? formatLastBackupUnknown(lastRaw)
            : "Unknown",
    };
}
function parseSystemdTimer(text) {
    if (!text) {
        return {
            nextBackup: null,
            timerUnit: null,
            serviceUnit: null,
        };
    }
    const lines = text
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
    const timerLine = lines.find((line) => /^(Sat|Sun|Mon|Tue|Wed|Thu|Fri)\s/i.test(line));
    let nextBackup = null;
    let timerUnit = null;
    let serviceUnit = null;
    if (timerLine) {
        const match = timerLine.match(/^(?:Sat|Sun|Mon|Tue|Wed|Thu|Fri)\s+(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})\s+UTC\s+.*?\s+(dune-[^\s]+\.timer)\s+(dune-[^\s]+\.service)/i);
        if (match) {
            nextBackup =
                `${match[1]}T${match[2]}Z`;
            timerUnit = match[3];
            serviceUnit = match[4];
        }
    }
    if (!timerUnit) {
        const unitMatch = text.match(/(dune-[a-z0-9-]+\.timer)/i);
        timerUnit =
            unitMatch?.[1] ?? null;
    }
    if (!serviceUnit) {
        const serviceMatch = text.match(/(dune-[a-z0-9-]+\.service)/i);
        serviceUnit =
            serviceMatch?.[1] ?? null;
    }
    return {
        nextBackup,
        timerUnit,
        serviceUnit,
    };
}
function extractTimerSection(text) {
    const index = text.search(/NEXT\s+LEFT\s+LAST\s+PASSED/i);
    if (index === -1) {
        return "";
    }
    return text.slice(index);
}
function findLastBackup(text) {
    const matches = [
        ...text.matchAll(/(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}(?::\d{2})?)\s+(runtime\/backups\/db\/\S+\.backup)/gi),
    ];
    if (!matches.length) {
        return null;
    }
    const backups = matches.map((match) => ({
        timestamp: `${match[1]}T${match[2]}${match[2].length === 5
            ? ":00"
            : ""}Z`,
        path: match[3],
    }));
    backups.sort((a, b) => getTimestamp(a.timestamp) -
        getTimestamp(b.timestamp));
    return backups[backups.length - 1] ?? null;
}
function calculateNextBackup({ backupTime, intervalHours, lastBackupTimestamp, }) {
    const now = Date.now();
    if (lastBackupTimestamp) {
        const last = getTimestamp(lastBackupTimestamp);
        if (Number.isFinite(last)) {
            const interval = Number(intervalHours) > 0
                ? Number(intervalHours) *
                    60 *
                    60 *
                    1000
                : null;
            if (interval) {
                let next = last + interval;
                while (next <= now) {
                    next += interval;
                }
                return new Date(next).toISOString();
            }
        }
    }
    if (!backupTime) {
        return null;
    }
    const match = String(backupTime).match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (!match) {
        return null;
    }
    const hour = Number(match[1]);
    const minute = Number(match[2]);
    const second = Number(match[3] || 0);
    if (hour < 0 ||
        hour > 23 ||
        minute < 0 ||
        minute > 59 ||
        second < 0 ||
        second > 59) {
        return null;
    }
    const date = new Date();
    date.setUTCHours(hour, minute, second, 0);
    if (date.getTime() <= now) {
        date.setUTCDate(date.getUTCDate() + 1);
    }
    return date.toISOString();
}
function formatLastBackup(timestamp) {
    return formatLastBackupUnknown(timestamp);
}
function formatLastBackupUnknown(timestamp) {
    const discord = discordTimestampUnknown(timestamp);
    if (!discord) {
        return "Unknown";
    }
    return `${discord} • ${relativeTimestampUnknown(timestamp)}`;
}
function discordTimestampUnknown(value) {
    const timestamp = getTimestampFromUnknown(value);
    if (!Number.isFinite(timestamp)) {
        return null;
    }
    return `<t:${Math.floor(timestamp / 1000)}:F>`;
}
function relativeTimestampUnknown(value) {
    const timestamp = getTimestampFromUnknown(value);
    if (!Number.isFinite(timestamp)) {
        return "Unknown";
    }
    return `<t:${Math.floor(timestamp / 1000)}:R>`;
}
function getTimestampFromUnknown(value) {
    if (typeof value === "string" ||
        typeof value === "number" ||
        value instanceof Date ||
        value === null ||
        value === undefined) {
        return getTimestamp(value);
    }
    if (isObject(value)) {
        const timestamp = getFirstDefined(value, [
            "timestamp",
            "createdAt",
            "created_at",
            "date",
        ]);
        if (typeof timestamp === "string" ||
            typeof timestamp === "number" ||
            timestamp instanceof Date ||
            timestamp === null ||
            timestamp === undefined) {
            return getTimestamp(timestamp);
        }
    }
    return NaN;
}
function getTimestamp(value) {
    if (value instanceof Date) {
        return value.getTime();
    }
    if (typeof value === "number") {
        return value < 1e12
            ? value * 1000
            : value;
    }
    if (!value) {
        return NaN;
    }
    const text = String(value).trim();
    if (/^\d+$/.test(text)) {
        const numeric = Number(text);
        return numeric < 1e12
            ? numeric * 1000
            : numeric;
    }
    const normalized = text.endsWith("Z")
        ? text
        : text.replace(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})$/, "$1Z");
    const timestamp = Date.parse(normalized);
    return Number.isFinite(timestamp)
        ? timestamp
        : NaN;
}
function extractValue(text, regex) {
    const match = text.match(regex);
    return match?.[1]?.trim() || null;
}
function extractBoolean(text, regex) {
    const match = text.match(regex);
    if (!match) {
        return false;
    }
    return getBoolean(match[1]);
}
function detectTimerStatus(text) {
    const match = text.match(/Systemd timer:\s*(enabled|disabled|active|inactive)/i);
    return (match?.[1]?.toLowerCase() ??
        "Unknown");
}
function getBoolean(value) {
    if (typeof value === "boolean") {
        return value;
    }
    if (typeof value === "number") {
        return value !== 0;
    }
    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        if ([
            "true",
            "yes",
            "enabled",
            "active",
            "running",
            "on",
        ].includes(normalized)) {
            return true;
        }
        if ([
            "false",
            "no",
            "disabled",
            "inactive",
            "stopped",
            "off",
        ].includes(normalized)) {
            return false;
        }
    }
    return false;
}
function toNumberOrNull(value) {
    if (value === null ||
        value === undefined ||
        value === "") {
        return null;
    }
    const number = Number(value);
    return Number.isFinite(number)
        ? number
        : null;
}
function toStringOrNull(value) {
    return typeof value === "string"
        ? value
        : null;
}
function emptyAutoBackup() {
    return {
        enabled: false,
        backupTime: null,
        intervalHours: null,
        retentionDays: null,
        directory: null,
        timerStatus: null,
        timerUnit: null,
        serviceUnit: null,
        nextBackup: "Unknown",
        lastBackup: "Unknown",
    };
}
function formatLabel(value) {
    return String(value)
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
}
function getFilename(path) {
    const normalized = String(path).replaceAll("\\", "/");
    return (normalized.split("/").pop() ||
        normalized);
}
function formatValue(value) {
    if (Array.isArray(value)) {
        return value.join(", ");
    }
    if (typeof value === "object" &&
        value !== null) {
        return `\`${JSON.stringify(value)}\``;
    }
    return `\`${String(value)}\``;
}
function formatBytes(bytes) {
    const value = Number(bytes);
    if (!Number.isFinite(value) ||
        value < 0) {
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
function getErrorDetails(error) {
    if (!isObject(error)) {
        return {
            message: String(error),
            status: null,
        };
    }
    const details = asObject(error["details"]);
    const message = typeof error["message"] === "string"
        ? error["message"]
        : typeof details?.["error"] ===
            "string"
            ? details["error"]
            : "Unknown error";
    const statusValue = error["status"] ??
        details?.["status"];
    const status = typeof statusValue === "number" ||
        typeof statusValue === "string"
        ? statusValue
        : null;
    return {
        message,
        status,
    };
}
function getFirstDefined(object, keys) {
    for (const key of keys) {
        const value = object[key];
        if (value !== undefined &&
            value !== null) {
            return value;
        }
    }
    return undefined;
}
function createBackupBanner({ serverName, count, autoBackup, }) {
    return (0, imageFactory_1.createDuneBanner)({
        filename: "dune-server-backups.png",
        title: "Backups",
        subtitle: `${count ?? 0} AVAILABLE`,
        detail: serverName,
    });
}
