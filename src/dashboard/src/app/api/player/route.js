import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Mocking session memory map lookup mirror matching legacy core memory array.
// Note: In a fully scaled multi-instance layout, this maps via shared Redis/Database stores.
const sessions = new Map(); 

export async function GET(_request) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('dashboard_session')?.value;

    if (!sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Pulling the memory session context block matching our original authentication mapping
    const session = sessions.get(sessionId);
    if (!session || session.expiresAt < Date.now()) {
      return NextResponse.json({ error: 'Session expired or invalid' }, { status: 401 });
    }

    const actor = {
      guildId: session.guildId,
      channelId: "dashboard",
      userId: session.user.id,
      username: session.user.username,
      roleIds: [
        ...(session.roleIds || []),
        process.env.VERIFIED_MEMBER_ROLE_ID,
      ].filter(Boolean),
      interactionId: `dashboard-${Date.now()}`,
      commandName: "portal",
    };

    const endpoint = `${process.env.CONSOLE_URL}/api/integrations/discord/players/me`;
    const resAdapter = await fetch(endpoint, {
      method: "POST",
      body: JSON.stringify({ actor }),
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.ADAPTER_TOKEN}`,
      },
    });

    if (!resAdapter.ok) {
      throw new Error(`Adapter HTTP Error: ${resAdapter.status}`);
    }

    const data = await resAdapter.json();
    if (data?.linked !== true) {
      return NextResponse.json(data);
    }

    const playerId = data.pawnId ?? data.controllerId;
    const endpoints = ["currency", "solaris-coin", "factions", "intel", "specs", "progression", "vitals"];
    
    const details = await Promise.all(endpoints.map(async (name) => {
      try {
        // Fetching individual telemetry variables directly from Dune Console Client
        const resConsole = await fetch(`${process.env.CONSOLE_URL}/api/players/${encodeURIComponent(playerId)}/${name}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${process.env.ADAPTER_TOKEN}` // Update with duneClient auth scheme if needed
          }
        });
        return [name, resConsole.ok ? await resConsole.json() : null];
      } catch (error) {
        return [name, null];
      }
    }));

    const finalResult = { 
      ...data, 
      details: Object.fromEntries(details) 
    };

    return NextResponse.json(finalResult, { status: 200 });

  } catch (error) {
    console.error("Unable to load player profile from the Discord Adapter:", error);
    return NextResponse.json({
      ok: false,
      linked: false,
      error: "Unable to load your Dune player profile right now.",
      status: error.message,
    }, { status: 500 });
  }
}