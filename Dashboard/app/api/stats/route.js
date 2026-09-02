import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getShardCount, createStatsPayload } from './utils/stats';

export async function GET(_request) {
  try {
    const cookieStore = await cookies();
    if (!cookieStore.get('dashboard_session')?.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ported from our legacy loadStats implementation
    const shardCount = getShardCount(process.env.TOTAL_SHARDS);
    
    // We fetch our bot guilds dynamically from the Discord API gateway
    const resGuilds = await fetch("https://discord.com/api/users/@me/guilds", {
      headers: { Authorization: `Bot ${process.env.TOKEN}` }
    });
    const guildsData = resGuilds.ok ? await resGuilds.json() : [];

    const uptimeSeconds = Math.floor(process.uptime());
    const statsPayload = createStatsPayload({
      guilds: guildsData,
      shardCount,
      uptimeSeconds,
      memoryMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
    });

    return NextResponse.json(statsPayload, { status: 200 });
  } catch (error) {
    console.error("Error in stats route handler:", error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}