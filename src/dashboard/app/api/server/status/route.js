import { NextResponse } from 'next/server';

import fs from 'node:fs';
import path from 'node:path';

import dotenv from 'dotenv';

import { duneClient } from '../../../duneClient';

// Find the .env file in the project tree
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

export async function GET() {
  try {
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
      }
    );
  }
}