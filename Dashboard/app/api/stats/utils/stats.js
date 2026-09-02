export function getShardCount(value) {
  if (value === 'auto') return 1;

  const count = Number(value || 1);
  return Number.isFinite(count) && count > 0 ? count : 1;
}

export function formatGuild(guild) {
  return {
    id: guild.id,
    name: guild.name,
    memberCount: guild.approximate_member_count ?? 'Unknown',
  };
}

export function createStatsPayload({ guilds, shardCount, uptimeSeconds, memoryMb }) {
  return {
    uptime: `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m`,
    uptimeSeconds,
    memoryMb,
    shards: Array.from(
      { length: shardCount },
      (_, id) => ({ id, status: 'online' })
    ),
    guilds: guilds.map(formatGuild),
  };
}