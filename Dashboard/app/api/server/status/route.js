import { NextResponse } from 'next/server';

import { getDuneClient } from '../../dune/route';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const duneClient = await getDuneClient();

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