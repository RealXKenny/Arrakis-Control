import { duneClient } from '../../dune/route';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function extractRows(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (!data || typeof data !== 'object') {
    return [];
  }

  // Handle all known response shapes.
  const candidates = [
    data.markers,
    data.rows,
    data.data?.markers,
    data.data?.rows,
    data.data,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
}

function extractMapConfig(data) {
  if (!data || typeof data !== 'object') {
    return null;
  }

  if (data.map) {
    return data.map;
  }

  if (data.maps && data.defaultMap) {
    const defaultMap = data.maps[data.defaultMap];

    if (defaultMap) {
      return defaultMap;
    }
  }

  if (data.maps && typeof data.maps === 'object') {
    const firstMap = Object.values(data.maps)[0];

    if (firstMap) {
      return firstMap;
    }
  }

  if (data.config) {
    return data.config;
  }

  if (data.data?.map) {
    return data.data.map;
  }

  if (data.data?.config) {
    return data.data.config;
  }

  return null;
}

function isBaseMarker(marker) {
  return (
    typeof marker?.type === 'string' &&
    marker.type.trim().toLowerCase() === 'base'
  );
}

function getErrorMessage(error) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Unable to load map markers.';
}

export async function GET(request) {
  const started = Date.now();

  try {
    const url = new URL(request.url);
    const mapName = url.searchParams.get('map')?.trim();

    const endpoint = mapName
      ? `/api/map/markers?map=${encodeURIComponent(mapName)}`
      : '/api/map/markers';

    const data = await duneClient.request('GET', endpoint);

    const allMarkers = extractRows(data);
    const map = extractMapConfig(data);

    // Only return base markers to the frontend.
    const markers = allMarkers.filter(isBaseMarker);

    if (!map) {
      console.warn('[MAP API] No map configuration returned', {
        mapName: mapName || null,
      });
    }

    return Response.json(
      {
        ok: true,
        markers,
        map,
        count: markers.length,
        timestamp: new Date().toISOString(),
        durationMs: Date.now() - started,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error) {
    const durationMs = Date.now() - started;

    console.error('[MAP API] Failed to load map markers', {
      error:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : error,
      durationMs,
    });

    return Response.json(
      {
        ok: false,
        error: getErrorMessage(error),
        markers: [],
        map: null,
        count: 0,
        timestamp: new Date().toISOString(),
        durationMs,
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