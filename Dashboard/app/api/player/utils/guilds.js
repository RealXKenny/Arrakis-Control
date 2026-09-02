export function extractGuildRows(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.rows)) return response.rows;
  if (Array.isArray(response?.data)) return response.data;
  return [];
}

export function findGuildMember(members, playerId, playerName) {
  const normalizedName = String(playerName ?? '').trim().toLowerCase();

  return members.find((entry) => {
    const memberId = entry?.player_id
      ?? entry?.playerId
      ?? entry?.pawnId
      ?? entry?.pawn_id
      ?? entry?.controllerId
      ?? entry?.controller_id;
    const memberName = String(
      entry?.character_name
        ?? entry?.characterName
        ?? entry?.name
        ?? ''
    ).trim().toLowerCase();

    return String(memberId ?? '') === String(playerId)
      || (memberName && memberName === normalizedName);
  });
}

export function createGuildSummary(guild, member, guildId) {
  return {
    id: guildId,
    name: guild?.name ?? guild?.guildName ?? guild?.guild_name ?? 'Unknown Guild',
    tag: guild?.tag ?? guild?.abbreviation ?? null,
    rank: member?.rank ?? member?.role ?? member?.memberRole ?? null,
  };
}