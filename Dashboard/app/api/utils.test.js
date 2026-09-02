import { describe, expect, it } from 'vitest';

import { extractBuybackPercent, createMarketPayload } from './market/utils/market';
import { getShardCount, createStatsPayload } from './stats/utils/stats';
import { extractPlayerCount, createStatusPayload } from './server/utils/status';
import { sanitizeBaseFilename, createBlueprintDownload } from './bases/utils/export';
import { createDiscordAuthorizationUrl, getDiscordOAuthConfig } from './auth/utils/oauth';
import { findGuildMember, createGuildSummary } from './player/utils/guilds';
import { requestJson, resetRequestCache } from '../utils/requestCache';
import { clearApiCache, getOrSetCachedValue } from './_utils/cache';

describe('API utility modules', () => {
  it('deduplicates server cache loaders and reuses values within the TTL', async () => {
    clearApiCache();
    let calls = 0;
    const loader = async () => {
      calls += 1;
      return { value: calls };
    };

    const [first, second] = await Promise.all([
      getOrSetCachedValue('test', 1000, loader),
      getOrSetCachedValue('test', 1000, loader),
    ]);

    expect(calls).toBe(1);
    expect(first).toBe(second);
    expect(await getOrSetCachedValue('test', 1000, loader)).toBe(first);
  });

  it('deduplicates concurrent requests and honors the cache TTL', async () => {
    resetRequestCache();
    let calls = 0;
    globalThis.fetch = async () => {
      calls += 1;
      return { ok: true, json: async () => ({ ok: true, value: calls }) };
    };

    const [first, second] = await Promise.all([
      requestJson('/api/test', { ttl: 1000 }),
      requestJson('/api/test', { ttl: 1000 }),
    ]);

    expect(calls).toBe(1);
    expect(first).toBe(second);
    expect(await requestJson('/api/test', { ttl: 1000 })).toBe(first);
  });

  it('bypasses cached data for explicit refreshes', async () => {
    resetRequestCache();
    let calls = 0;
    globalThis.fetch = async () => {
      calls += 1;
      return { ok: true, json: async () => ({ value: calls }) };
    };

    await requestJson('/api/test', { ttl: 1000 });
    const refreshed = await requestJson('/api/test', { ttl: 1000, force: true });

    expect(calls).toBe(2);
    expect(refreshed.value).toBe(2);
  });

  it('extracts market buyback values from supported response shapes', () => {
    expect(extractBuybackPercent({ schedule: { buybackPercent: 12.5 } })).toBe(12.5);
    expect(extractBuybackPercent({})).toBeNull();
  });

  it('keeps market payload fields explicit', () => {
    const payload = createMarketPayload({ stats: 1, items: 2, config: 3, marketConfig: 4 });
    expect(payload).toEqual({ stats: 1, items: 2, config: 3, marketConfig: 4 });
  });

  it('normalizes shard counts and player totals defensively', () => {
    expect(getShardCount('auto')).toBe(1);
    expect(getShardCount('invalid')).toBe(1);
    expect(extractPlayerCount({ pagination: { totalCount: 7 } })).toBe(7);
    expect(extractPlayerCount(null)).toBe(0);
  });

  it('builds stats and status response contracts', () => {
    expect(createStatsPayload({
      guilds: [{ id: 'g1', name: 'Guild', approximate_member_count: 4 }],
      shardCount: 1,
      uptimeSeconds: 3661,
      memoryMb: 32,
    })).toMatchObject({ uptime: '1h 1m', uptimeSeconds: 3661, memoryMb: 32 });
    expect(createStatusPayload({ count: 2 }, { count: 10 })).toEqual({
      ok: true,
      activePlayers: 2,
      totalPlayers: 10,
    });
  });

  it('sanitizes export filenames without changing the download contract', () => {
    expect(sanitizeBaseFilename('base/one')).toBe('base_one');
    expect(createBlueprintDownload({ blueprint: true }, 'base-1').headers['Content-Type'])
      .toBe('application/json; charset=utf-8');
  });

  it('builds OAuth configuration and authorization URLs', () => {
    expect(getDiscordOAuthConfig({ CLIENT_ID: 'client', DISCORD_REDIRECT_URI: 'https://app/callback' }))
      .toMatchObject({ clientId: 'client', redirectUri: 'https://app/callback' });
    expect(createDiscordAuthorizationUrl('client', 'https://app/callback'))
      .toContain('scope=identify+guilds.members.read');
  });

  it('matches player guild members by ID or normalized name', () => {
    const member = findGuildMember([
      { characterName: '  Paul Atreides ', role: 'leader' },
    ], 'player-1', 'paul atreides');

    expect(createGuildSummary({ id: 'guild-1', name: 'Fremen' }, member, 'guild-1'))
      .toEqual({ id: 'guild-1', name: 'Fremen', tag: null, rank: 'leader' });
  });
});