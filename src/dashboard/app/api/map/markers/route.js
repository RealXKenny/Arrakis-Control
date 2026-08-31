import { DuneConsoleClient } from '../../../../../infrastructure/api/core/DuneConsoleClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

let duneClient = null;
let initialized = false;

async function getDuneClient() {
  if (!duneClient) {

    duneClient = new DuneConsoleClient(
      process.env.CONSOLE_URL
    );
  }

  if (!initialized) {

    await duneClient.login(
      process.env.CONSOLE_PASSWORD
    );

    initialized = true;
  }

  return duneClient;
}

function extractRows(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.markers)) {
    return data.markers;
  }

  if (Array.isArray(data?.rows)) {
    return data.rows;
  }

  if (Array.isArray(data?.data?.markers)) {
    return data.data.markers;
  }

  if (Array.isArray(data?.data?.rows)) {
    return data.data.rows;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

function extractMapConfig(data) {
  if (data?.map) {
    return data.map;
  }

  if (
    data?.maps &&
    data?.defaultMap &&
    data.maps[data.defaultMap]
  ) {
    return data.maps[data.defaultMap];
  }

  if (data?.maps) {
    const firstMap = Object.values(data.maps)[0];

    if (firstMap) {
      return firstMap;
    }
  }

  if (data?.config) {
    return data.config;
  }

  if (data?.data?.map) {
    return data.data.map;
  }

  if (data?.data?.config) {
    return data.data.config;
  }

  return null;
}

export async function GET(request) {
  const started = Date.now();

  try {
    const client = await getDuneClient();

    const url = new URL(request.url);

    const mapName =
      url.searchParams.get('map');

    const endpoint = mapName
      ? `/api/map/markers?map=${encodeURIComponent(mapName)}`
      : '/api/map/markers';

    const data = await client.request(
      'GET',
      endpoint
    );

    const allMarkers = extractRows(data);

    const map = extractMapConfig(data);

    // ============================================================
    // ONLY RETURN BASE MARKERS
    // ============================================================

    const markers = allMarkers.filter(
      (marker) =>
        String(marker?.type || '')
          .trim()
          .toLowerCase() === 'base'
    );

    if (!map) {
      console.warn(
        '[MAP API] WARNING: No map configuration returned.'
      );
    }

    const responseData = {
      ok: true,

      // Only base markers are sent to the frontend.
      markers,

      map,

      count: markers.length,

      timestamp:
        new Date().toISOString(),

      durationMs:
        Date.now() - started,
    };

    return Response.json(
      responseData,
      {
        status: 200,
        headers: {
          'Cache-Control':
            'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('');

    console.error(
      '============================================================'
    );

    console.error('[MAP API] ERROR');

    console.error(
      '============================================================'
    );

    console.error(
      '[MAP API] Message:',
      error?.message
    );

    console.error(
      '[MAP API] Stack:',
      error?.stack
    );

    console.error(
      '============================================================'
    );

    return Response.json(
      {
        ok: false,

        error:
          error?.message ||
          'Unable to load map markers.',

        map: null,

        markers: [],

        count: 0,

        timestamp:
          new Date().toISOString(),

        durationMs:
          Date.now() - started,
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