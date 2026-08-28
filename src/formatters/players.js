function formatPlayers(response, status) {
  const rows = Array.isArray(response) ? response : response?.rows ?? response?.players ?? [];
  const total = response?.totalCount ?? response?.totalPlayers ?? rows.length;
  const listedPlayers = rows.slice(0, 20).map(formatPlayer).join('\n');
  const remaining = Math.max(0, total - rows.length);

  return {
    heading: `${status === 'online' ? 'Online' : 'Offline'} players (${total})`,
    content: listedPlayers || 'No players found.',
    truncated: remaining > 0 ? `Showing the first ${rows.length} of ${total}.` : null,
  };
}

function formatPlayer(player, index) {
  const name = player.character_name
    ?? player.characterName
    ?? player.name
    ?? player.playerName
    ?? player.display_name
    ?? 'Unknown player';
  const id = player.player_id ?? player.playerId ?? player.id ?? player.player_controller_id;
  const playtime = player.total_playtime_seconds ?? player.totalPlaytimeSeconds;
  const details = [id ? `ID: \`${id}\`` : null, playtime === undefined ? null : formatPlaytime(playtime)]
    .filter(Boolean)
    .join(' · ');

  return `${index + 1}. **${name}**${details ? ` — ${details}` : ''}`;
}

function formatPlaytime(seconds) {
  const totalMinutes = Math.floor(Number(seconds) / 60);
  if (!Number.isFinite(totalMinutes)) return null;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m played`;
}

module.exports = { formatPlayers };
