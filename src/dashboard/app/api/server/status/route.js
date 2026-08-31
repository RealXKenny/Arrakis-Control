import { NextResponse } from 'next/server';

import { getDuneClient } from '../../dune/route';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Initialize the Dune client only when the request runs.
    const duneClient = getDuneClient();

    // Fetch both Dune endpoints through duneClient.
    const [serverStatus, playersData] = await Promise.all([
      duneClient.request(
        'GET',
        '/api/server/status'
      ),

      duneClient.request(
        'GET',
        '/api/players?page=1&pageSize=1'
      ),
    ]);

    // Extract active player count.
    const activePlayers =
      serverStatus?.activePlayers ??
      serverStatus?.activePlayerCount ??
      serverStatus?.players ??
      serverStatus?.playerCount ??
      0;

    // Extract total player count from pagination.
    const totalPlayers =
      playersData?.total ??
      playersData?.totalPlayers ??
      playersData?.count ??
      playersData?.pagination?.total ??
      playersData?.pagination?.totalCount ??
      playersData?.meta?.total ??
      playersData?.meta?.totalCount ??
      0;

    return NextResponse.json(
      {
        ok: true,
        activePlayers: Number(activePlayers),
        totalPlayers: Number(totalPlayers),
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