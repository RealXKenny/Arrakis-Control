import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDuneClient } from '../dune/route';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function extractRows(data) {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== 'object') return [];

  const candidates = [
    data.markers,
    data.rows,
    data.data?.markers,
    data.data?.rows,
    data.data,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  return [];
}

function extractBaseRows(data) {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== 'object') return [];

  const candidates = [
    data.rows,
    data.bases,
    data.data?.rows,
    data.data?.bases,
    data.data,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  return [];
}

function extractMapConfig(data) {
  if (!data || typeof data !== 'object') return null;

  if (data.map) return data.map;

  if (data.maps && data.defaultMap) {
    const defaultMap = data.maps[data.defaultMap];
    if (defaultMap) return defaultMap;
  }

  if (data.maps && typeof data.maps === 'object') {
    const firstMap = Object.values(data.maps)[0];
    if (firstMap) return firstMap;
  }

  if (data.config) return data.config;
  if (data.data?.map) return data.data.map;
  if (data.data?.config) return data.data.config;

  return null;
}

function isBaseMarker(marker) {
  return (
    typeof marker?.type === 'string' &&
    marker.type.trim().toLowerCase() === 'base'
  );
}

function normalizeBase(base, index) {
  const x =
    base?.x ??
    base?.pos_x ??
    base?.longitude ??
    base?.position?.x ??
    base?.coordinates?.x ??
    null;

  const y =
    base?.y ??
    base?.pos_y ??
    base?.latitude ??
    base?.position?.y ??
    base?.coordinates?.y ??
    null;

  return {
    ...base,
    id: base?.id ?? base?.base_id ?? `base-${index}`,
    name:
      base?.name ??
      base?.base_name ??
      base?.character_name ??
      `Base ${index + 1}`,
    x,
    y,
    icon: base?.icon ?? 'Base',
  };
}

function getBaseId(base) {
  const value =
    base?.base_id ??
    base?.baseId ??
    base?.id ??
    base?.uuid;

  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {
    return null;
  }

  return String(value);
}

function extractPlayerId(data) {
  return (
    data?.pawnId ??
    data?.controllerId ??
    data?.playerId ??
    data?.player_id ??
    null
  );
}

function getMarkerBaseId(marker) {
  return getBaseId(marker);
}

function getErrorMessage(error) {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Unable to load map data.';
}

export async function GET(request) {
  const started = Date.now();

  try {
    const cookieStore = await cookies();
    const sessionId =
      cookieStore.get('dashboard_session')?.value;

    if (!sessionId) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        {
          status: 401,
          headers: {
            'Cache-Control': 'no-store',
          },
        }
      );
    }

    const session =
      global.dashboardSessions?.get(sessionId);

    if (
      !session ||
      !session.expiresAt ||
      session.expiresAt < Date.now()
    ) {
      return NextResponse.json(
        { ok: false, error: 'Session expired or invalid' },
        {
          status: 401,
          headers: {
            'Cache-Control': 'no-store',
          },
        }
      );
    }

    if (!process.env.CONSOLE_URL) {
      throw new Error(
        'CONSOLE_URL is not configured'
      );
    }

    if (!process.env.ADAPTER_TOKEN) {
      throw new Error(
        'ADAPTER_TOKEN is not configured'
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
      interactionId: `map-${Date.now()}`,
      commandName: 'portal',
    };

    const playerResponse = await fetch(
      `${process.env.CONSOLE_URL}/api/integrations/discord/players/me`,
      {
        method: 'POST',
        body: JSON.stringify({ actor }),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization:
            `Bearer ${process.env.ADAPTER_TOKEN}`,
        },
        cache: 'no-store',
      }
    );

    if (!playerResponse.ok) {
      throw new Error(
        `Discord Adapter request failed with status: ${playerResponse.status}`
      );
    }

    const playerData = await playerResponse.json();

    if (playerData?.linked !== true) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Your Discord account is not linked to a Dune player.',
          markers: [],
          bases: [],
          map: null,
          count: 0,
        },
        {
          status: 403,
          headers: {
            'Cache-Control': 'no-store',
          },
        }
      );
    }

    const playerId = extractPlayerId(playerData);

    if (!playerId) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Unable to determine your Dune player ID.',
          markers: [],
          bases: [],
          map: null,
          count: 0,
        },
        {
          status: 403,
          headers: {
            'Cache-Control': 'no-store',
          },
        }
      );
    }

    const duneClient = getDuneClient();
    const url = new URL(request.url);
    const mapName = url.searchParams.get('map')?.trim();

    const markerEndpoint = mapName
      ? `/api/map/markers?map=${encodeURIComponent(mapName)}`
      : '/api/map/markers';

    const [basesData, mapData] = await Promise.all([
      duneClient.request(
        'GET',
        `/api/players/${encodeURIComponent(playerId)}/bases`
      ),
      duneClient.request('GET', markerEndpoint),
    ]);

    const baseRows = extractBaseRows(basesData);
    const bases = baseRows.map(normalizeBase);

    const playerBaseIds = new Set(
      bases
        .map(getBaseId)
        .filter(Boolean)
    );

    const allMarkers = extractRows(mapData);

    const markers = allMarkers
      .filter(isBaseMarker)
      .filter((marker) => {
        const markerBaseId =
          getMarkerBaseId(marker);

        return (
          markerBaseId &&
          playerBaseIds.has(markerBaseId)
        );
      })
      .map((marker) => {
        const baseId = getMarkerBaseId(marker);
        const base = bases.find(
          (item) => getBaseId(item) === baseId
        );

        return {
          ...marker,
          base_id: base?.base_id ?? marker?.base_id,
          name: base?.name ?? marker?.name,
          owner_name:
            base?.owner_name ??
            marker?.owner_name,
          relationship:
            base?.relationship ??
            marker?.relationship,
        };
      });

    const map = extractMapConfig(mapData);

    if (!map) {
      console.warn('[MAP API] No map configuration returned', {
        mapName: mapName || null,
      });
    }

    const durationMs = Date.now() - started;

    console.log('[MAP API] Loaded player map data', {
      map: mapName || 'default',
      userId: session.user.id,
      playerId,
      bases: bases.length,
      markers: markers.length,
      durationMs,
    });

    return NextResponse.json(
      {
        ok: true,
        bases,
        markers,
        map,
        count: markers.length,
        timestamp: new Date().toISOString(),
        durationMs,
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

    console.error('[MAP API] Failed to load map data:', error);

    return NextResponse.json(
      {
        ok: false,
        error: getErrorMessage(error),
        bases: [],
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
