export function extractBuybackPercent(market) {
  return market?.buyback?.buybackPercent
    ?? market?.buybackSchedule?.buybackPercent
    ?? market?.schedule?.buybackPercent
    ?? market?.buybackPercent
    ?? null;
}

export function createMarketPayload({ stats, items, config, marketConfig }) {
  return { stats, items, config, marketConfig };
}