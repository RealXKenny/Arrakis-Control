import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(_request) {
  try {
    const cookieStore = await cookies();
    if (!cookieStore.get('dashboard_session')?.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ported from our legacy loadStats implementation
    const count = process.env.TOTAL_SHARDS === "auto" ? 1 : Number(process.env.TOTAL_SHARDS || 1);
    
    // We fetch our bot guilds dynamically from the Discord API gateway
    const resGuilds = await fetch("https://discord.com/api/users/@me/guilds", {
      headers: { Authorization: `Bot ${process.env.TOKEN}` }
    });
    const guildsData = resGuilds.ok ? await resGuilds.json() : [];

    const statsPayload = {
      uptime: `${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m`,
      uptimeSeconds: Math.floor(process.uptime()),
      memoryMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
      shards: Array.from({ length: Number.isFinite(count) && count > 0 ? count : 1 }, (_, id) => ({ id, status: "online" })),
      guilds: guildsData.map((guild) => ({
        id: guild.id,
        name: guild.name,
        memberCount: guild.approximate_member_count ?? "Unknown"
      }))
    };

    return NextResponse.json(statsPayload, { status: 200 });
  } catch (error) {
    console.error("Error in stats route handler:", error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}