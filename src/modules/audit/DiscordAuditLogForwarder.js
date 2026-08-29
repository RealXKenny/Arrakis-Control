const { AuditLogEvent } = require("discord.js");
const { createLogger } = require("../../infrastructure/core/logger");

const logger = createLogger("DISCORD AUDIT LOG");
const POLL_INTERVAL_MS = 30_000;

function startAuditLogForwarder(client) {
  const seenEntries = new Set();
  let initialized = false;

  const poll = async () => {
    const channelId = client.auditLogger?.activityChannelId;
    if (!channelId) return;

    for (const guild of client.guilds.cache.values()) {
      try {
        const auditLogs = await guild.fetchAuditLogs({ limit: 20 });
        const entries = [...auditLogs.entries.values()];

        if (!initialized) {
          entries.forEach((entry) => seenEntries.add(entry.id));
          continue;
        }

        for (const entry of entries.reverse()) {
          if (seenEntries.has(entry.id)) continue;
          seenEntries.add(entry.id);
          await client.auditLogger.sendTo(channelId, "Discord audit log", [
            `**Action:** ${formatAction(entry.action)}`,
            `**User:** ${entry.executor?.tag ?? entry.executor?.id ?? "Unknown"}`,
            `**Target:** ${entry.target?.tag ?? entry.target?.name ?? entry.target?.id ?? "Unknown"}`,
            `**Reason:** ${entry.reason ?? "Not provided"}`,
            `**Guild:** ${guild.name}`,
          ]);
        }

        while (seenEntries.size > 500) seenEntries.delete(seenEntries.values().next().value);
      } catch (error) {
        logger.warn(`Unable to read audit logs for ${guild.name}.`, error);
      }
    }

    initialized = true;
  };

  void poll();
  return setInterval(poll, POLL_INTERVAL_MS);
}

function formatAction(action) {
  const name = Object.entries(AuditLogEvent).find(([, value]) => value === action)?.[0];
  return name ?? `Event ${action}`;
}

module.exports = { startAuditLogForwarder };
