import { NextResponse } from 'next/server';

import { getDuneClient } from '../../dune/route';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Initialize the Dune client only when the request runs.
    const duneClient = getDuneClient();

    // Fetch online players and total players through duneClient.
    const [onlinePlayers, playersData] = await Promise.all([
      duneClient.request(
        'GET',
        '/api/players/online?page=0&pageSize=100'
      ),

      duneClient.request(
        'GET',
        '/api/players?page=1&pageSize=1'
      ),
    ]);

    console.log(
      '[TELEMETRY API] RAW ONLINE PLAYERS RESPONSE:',
      onlinePlayers
    );

    console.log(
      '[TELEMETRY API] RAW TOTAL PLAYERS RESPONSE:',
      playersData
    );

    // Extract active player count.
    const activePlayers = Number(
      onlinePlayers?.totalCount ??
      onlinePlayers?.totalPlayers ??
      onlinePlayers?.count ??
      onlinePlayers?.pagination?.total ??
      onlinePlayers?.pagination?.totalCount ??
      onlinePlayers?.meta?.total ??
      onlinePlayers?.meta?.totalCount ??
      0
    );

    // Extract total player count.
    const totalPlayers = Number(
      playersData?.totalCount ??
      playersData?.totalPlayers ??
      playersData?.count ??
      playersData?.pagination?.total ??
      playersData?.pagination?.totalCount ??
      playersData?.meta?.total ??
      playersData?.meta?.totalCount ??
      0
    );

    console.log('[PLAYER TELEMETRY] Counts:', {
      activePlayers,
      totalPlayers,
    });

    return NextResponse.json(
      {
        ok: true,
        activePlayers,
        totalPlayers,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error) {
    console.error(
      'Error fetching Dune server telemetry:',
      error
    );

    return NextResponse.json(
      {
        ok: false,
        activePlayers: null,
        totalPlayers: null,
        error: 'Unable to load Dune server telemetry.',
        status: error?.message || 'Unknown error',
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  }
}