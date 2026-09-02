export function extractPlayerCount(data) {
  return Number(
    data?.totalCount
      ?? data?.totalPlayers
      ?? data?.count
      ?? data?.pagination?.total
      ?? data?.pagination?.totalCount
      ?? data?.meta?.total
      ?? data?.meta?.totalCount
      ?? 0
  );
}

export function createStatusPayload(onlinePlayers, totalPlayers) {
  return {
    ok: true,
    activePlayers: extractPlayerCount(onlinePlayers),
    totalPlayers: extractPlayerCount(totalPlayers),
  };
}