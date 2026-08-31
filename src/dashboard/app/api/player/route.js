
import { NextResponse } from 'next/server';

import { cookies } from 'next/headers';

import fs from 'node:fs';

import path from 'node:path';

import dotenv from 'dotenv';

import { duneClient } from '../dune/route';

let currentDir = process.cwd();

let envPath = null;

while (
  currentDir &&
  currentDir !== path.parse(currentDir).root
) {
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
    console.log('');
    console.log('==========================================');
    console.log('PLAYER API REQUEST');
    console.log('==========================================');

    const cookieStore = await cookies();

    const sessionId =
      cookieStore.get('dashboard_session')?.value;

    console.log('[PLAYER] Session exists:', !!sessionId);

    if (!sessionId) {
      console.log('[PLAYER] No session');

      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const session =
      global.dashboardSessions?.get(sessionId);

    console.log('[PLAYER] Session found:', !!session);

    if (!session || session.expiresAt < Date.now()) {
      console.log('[PLAYER] Session expired or invalid');

      return NextResponse.json(
        { error: 'Session expired or invalid' },
        { status: 401 }
      );
    }

    const actor = {
      guildId: session.guildId,
      channelId: 'dashboard',
      userId: session.user.id,
      username: session.user.username,
      roleIds: [
        ...(session.roleIds || []),
        process.env.VERIFIED_MEMBER_ROLE_ID,
      ].filter(Boolean),
      interactionId: `dashboard-${Date.now()}`,
      commandName: 'portal',
    };

    const endpoint =
      `${process.env.CONSOLE_URL}/api/integrations/discord/players/me`;

    console.log('[PLAYER] Requesting Discord player link...');

    const resAdapter = await fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify({ actor }),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization:
          `Bearer ${process.env.ADAPTER_TOKEN}`,
      },
      cache: 'no-store',
    });

    console.log(
      '[PLAYER] Discord adapter status:',
      resAdapter.status
    );

    if (!resAdapter.ok) {
      throw new Error(
        `Discord Adapter request failed with status: ${resAdapter.status}`
      );
    }

    const data = await resAdapter.json();

    console.log('[PLAYER] Adapter response:');
    console.dir(data, { depth: null });

    if (data?.linked !== true) {
      console.log('[PLAYER] Player is NOT linked');

      return NextResponse.json(data, {
        status: 200,
      });
    }

    const playerId =
      data.pawnId ?? data.controllerId;

    console.log('[PLAYER] Player ID:', playerId);

    if (!playerId) {
      console.log('[PLAYER] No player ID found');

      return NextResponse.json(
        {
          ...data,
          linked: false,
          error:
            'Unable to determine your Dune player ID.',
        },
        { status: 200 }
      );
    }

    const coreEndpoints = [
      'currency',
      'solaris-coin',
      'factions',
      'intel',
      'specs',
      'progression',
      'vitals',
      'bases',
    ];

    const details = await Promise.all(
      coreEndpoints.map(async (name) => {
        try {
          const playerEndpoint =
            `/api/players/${encodeURIComponent(playerId)}/${name}`;

          console.log(
            `[PLAYER] Fetching ${name}: ${playerEndpoint}`
          );

          const resData = await duneClient.request(
            'GET',
            playerEndpoint
          );

          /*
           * ==========================================
           * BASES DEBUG OUTPUT
           * ==========================================
           */

          if (name === 'bases') {
            console.log('');
            console.log('==========================================');
            console.log('BASES TELEMETRY DEBUG');
            console.log('==========================================');

            console.log('[BASES] Player ID:', playerId);

            console.log(
              '[BASES] Endpoint:',
              playerEndpoint
            );

            console.log(
              '[BASES] Response type:',
              typeof resData
            );

            console.log(
              '[BASES] Is array:',
              Array.isArray(resData)
            );

            if (
              resData !== null &&
              typeof resData === 'object'
            ) {
              console.log(
                '[BASES] Object keys:',
                Object.keys(resData)
              );
            }

            console.log('[BASES] RAW RESPONSE:');

            console.dir(resData, {
              depth: null,
              colors: true,
            });

            console.log('==========================================');
            console.log('END BASES DEBUG');
            console.log('==========================================');
            console.log('');
          }

          return [name, resData];
        } catch (error) {
          console.error(
            `Failed to load player ${name} telemetry:`,
            error
          );

          if (name === 'bases') {
            console.error(
              '[BASES] ERROR:',
              error?.message
            );

            console.error(
              '[BASES] STACK:',
              error?.stack
            );
          }

          return [name, null];
        }
      })
    );

    const responseData = {
      ...data,
      details: Object.fromEntries(details),
    };

    /*
     * Print exactly what is being returned for bases.
     */

    console.log('');
    console.log('==========================================');
    console.log('BASES RESPONSE BEING SENT TO CLIENT');
    console.log('==========================================');

    console.dir(
      responseData.details?.bases,
      {
        depth: null,
        colors: true,
      }
    );

    console.log('==========================================');
    console.log('');

    return NextResponse.json(
      responseData,
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      'Error inside player route telemetry processor:',
      error
    );

    return NextResponse.json(
      {
        ok: false,
        linked: false,
        error:
          'Unable to load your Dune player profile right now.',
        status: error?.message,
      },
      {
        status: 500,
      }
    );
  }
}