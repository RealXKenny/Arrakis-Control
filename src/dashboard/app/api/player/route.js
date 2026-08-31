import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { duneClient } from '../dune/route';

let currentDir = process.cwd();
let envPath = null;

while (currentDir && currentDir !== path.parse(currentDir).root) {
  const checkPath = path.join(currentDir, '.env');
  if (fs.existsSync(checkPath)) {
    envPath = checkPath;
    break;
  }
  currentDir = path.dirname(currentDir);
}

if (envPath) {
  dotenv.config({ path: envPath });
}

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('dashboard_session')?.value;

    if (!sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = global.dashboardSessions?.get(sessionId);
    if (!session || session.expiresAt < Date.now()) {
      return NextResponse.json({ error: 'Session expired or invalid' }, { status: 401 });
    }

    // Initialize the target actor configuration exactly matching our legacy engine architecture
    const actor = {
      guildId: session.guildId,
      channelId: "dashboard",
      userId: session.user.id,
      username: session.user.username,
      roleIds: [...(session.roleIds || []), process.env.VERIFIED_MEMBER_ROLE_ID].filter(Boolean),
      interactionId: `dashboard-${Date.now()}`,
      commandName: "portal",
    };

    const endpoint = `${process.env.CONSOLE_URL}/api/integrations/discord/players/me`;
    
    // Resolve Discord profile link data via our target Adapter token handshake
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
      throw new Error(`Discord Adapter request failed with status: ${resAdapter.status}`);
    }

    const data = await resAdapter.json();
    if (data?.linked !== true) {
      return NextResponse.json(data);
    }

    const playerId = data.pawnId ?? data.controllerId;
    const coreEndpoints = ["currency", "solaris-coin", "factions", "intel", "specs", "progression", "vitals"];
    
    // Concurrently fetch player traits from our global duneClient session singleton instance
    const details = await Promise.all(coreEndpoints.map(async (name) => {
      try {
        const resData = await duneClient.request("GET", `/api/players/${encodeURIComponent(playerId)}/${name}`);
        return [name, resData];
      } catch (error) {
        return [name, null];
      }
    }));

    return NextResponse.json({ 
      ...data, 
      details: Object.fromEntries(details) 
    }, { status: 200 });

  } catch (error) {
    console.error("Error inside player route telemetry processor:", error);
    return NextResponse.json({
      ok: false,
      linked: false,
      error: "Unable to load your Dune player profile right now.",
      status: error.message,
    }, { status: 500 });
  }
}