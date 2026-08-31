"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startAuditLogForwarder = startAuditLogForwarder;
const discord_js_1 = require("discord.js");
const logger_1 = require("../../infrastructure/core/logger");
const logger = (0, logger_1.createLogger)("DISCORD AUDIT LOG");
const POLL_INTERVAL_MS = 30_000;
function startAuditLogForwarder(client) {
    const seenEntries = new Set();
    let initialized = false;
    const poll = async () => {
        const channelId = client.auditLogger?.activityChannelId;
        if (!channelId)
            return;
        for (const guild of client.guilds.cache.values()) {
            try {
                const auditLogs = await guild.fetchAuditLogs({
                    limit: 20,
                });
                const entries = [...auditLogs.entries.values()];
                if (!initialized) {
                    entries.forEach((entry) => {
                        seenEntries.add(entry.id);
                    });
                    continue;
                }
                for (const entry of entries.reverse()) {
                    if (seenEntries.has(entry.id))
                        continue;
                    seenEntries.add(entry.id);
                    await client.auditLogger?.sendTo(channelId, "Discord audit log", [
                        `**Action:** ${formatAction(entry.action)}`,
                        `**User:** ${formatUser(entry.executor)}`,
                        `**Target:** ${formatTarget(entry.target)}`,
                        `**Reason:** ${entry.reason ?? "Not provided"}`,
                        `**Guild:** ${guild.name}`,
                    ]);
                }
                while (seenEntries.size > 500) {
                    const oldestEntry = seenEntries.values().next().value;
                    if (oldestEntry) {
                        seenEntries.delete(oldestEntry);
                    }
                }
            }
            catch (error) {
                logger.warn(`Unable to read audit logs for ${guild.name}.`, error);
            }
        }
        initialized = true;
    };
    void poll();
    return setInterval(poll, POLL_INTERVAL_MS);
}
function formatUser(user) {
    if (!user || typeof user !== "object") {
        return "Unknown";
    }
    const value = user;
    if (typeof value.tag === "string") {
        return value.tag;
    }
    if (typeof value.id === "string") {
        return value.id;
    }
    return "Unknown";
}
function formatTarget(target) {
    if (!target || typeof target !== "object") {
        return "Unknown";
    }
    const value = target;
    if (typeof value.tag === "string") {
        return value.tag;
    }
    if (typeof value.name === "string") {
        return value.name;
    }
    if (typeof value.id === "string") {
        return value.id;
    }
    return "Unknown";
}
function formatAction(action) {
    const name = Object.entries(discord_js_1.AuditLogEvent).find(([, value]) => value === action)?.[0];
    return name ?? `Event ${action}`;
}
