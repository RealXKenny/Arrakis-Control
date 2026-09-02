import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDuneClient } from '../dune/route';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function getVehicleOwner(vehicle) {
  return String(
    vehicle?.owner_name ??
    vehicle?.ownerName ??
    vehicle?.owner ??
    vehicle?.owner_character_name ??
    vehicle?.ownerCharacterName ??
    ''
  )
    .trim()
    .toLowerCase();
}

function extractOnlinePlayers(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (!data || typeof data !== 'object') {
    return [];
  }

  const candidates = [
    data.rows,
    data.players,
    data.data?.rows,
    data.data?.players,
    data.data,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
}

function getOnlinePlayerId(player) {
  return String(
    player?.pawnId ??
    player?.pawn_id ??
    player?.playerPawnId ??
    player?.player_pawn_id ??
    player?.playerId ??
    player?.player_id ??
    player?.id ??
    ''
  ).trim();
}

function getVehicleOwnerId(vehicle) {
  const value =
    vehicle?.owner_id ??
    vehicle?.ownerId ??
    vehicle?.owner_player_id ??
    vehicle?.ownerPlayerId ??
    vehicle?.player_id ??
    vehicle?.playerId ??
    null;

  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {
    return '';
  }

  return String(value).trim();
}

function normalizePlayerName(playerData, session) {
  return String(
    playerData?.character_name ??
    playerData?.characterName ??
    playerData?.player_name ??
    playerData?.playerName ??
    playerData?.username ??
    playerData?.name ??
    playerData?.player?.character_name ??
    playerData?.player?.characterName ??
    playerData?.player?.player_name ??
    playerData?.player?.playerName ??
    playerData?.player?.username ??
    playerData?.player?.name ??
    session?.user?.username ??
    ''
  )
    .trim()
    .toLowerCase();
}

function isVehicleAccessible(
  vehicle,
  playerName,
  playerId
) {
  const normalizedPlayerName =
    String(playerName ?? '')
      .trim()
      .toLowerCase();

  const normalizedPlayerId =
    String(playerId ?? '').trim();

  const owner = getVehicleOwner(vehicle);
  const ownerId = getVehicleOwnerId(vehicle);

  // Current player owns it by player ID.
  if (
    normalizedPlayerId &&
    ownerId &&
    ownerId === normalizedPlayerId
  ) {
    return true;
  }

  // Current player owns it by character/player name.
  if (
    normalizedPlayerName &&
    owner &&
    owner === normalizedPlayerName
  ) {
    return true;
  }

  const relationship = String(
    vehicle?.relationship ??
    vehicle?.relation ??
    vehicle?.access ??
    vehicle?.access_type ??
    vehicle?.accessType ??
    ''
  )
    .trim()
    .toLowerCase();

  // Shared/access relationship.
  if (
    relationship === 'shared' ||
    relationship === 'member' ||
    relationship === 'visitor' ||
    relationship === 'guest'
  ) {
    return true;
  }

  const sharedWith =
    Array.isArray(vehicle?.shared_with)
      ? vehicle.shared_with
      : Array.isArray(vehicle?.sharedWith)
        ? vehicle.sharedWith
        : Array.isArray(vehicle?.shared_players)
          ? vehicle.shared_players
          : Array.isArray(vehicle?.sharedPlayers)
            ? vehicle.sharedPlayers
            : [];

  return sharedWith.some((person) => {
    if (
      person === null ||
      person === undefined
    ) {
      return false;
    }

    if (
      typeof person === 'string' ||
      typeof person === 'number'
    ) {
      const value = String(person)
        .trim()
        .toLowerCase();

      return (
        (normalizedPlayerName &&
          value === normalizedPlayerName) ||
        (normalizedPlayerId &&
          value === normalizedPlayerId)
      );
    }

    const sharedName = String(
      person?.name ??
      person?.username ??
      person?.character_name ??
      person?.characterName ??
      person?.player_name ??
      person?.playerName ??
      ''
    )
      .trim()
      .toLowerCase();

    const sharedId = String(
      person?.id ??
      person?.player_id ??
      person?.playerId ??
      ''
    ).trim();

    return (
      (normalizedPlayerName &&
        sharedName === normalizedPlayerName) ||
      (normalizedPlayerId &&
        sharedId === normalizedPlayerId)
    );
  });
}

function extractRows(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (!data || typeof data !== 'object') {
    return [];
  }

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

function extractBaseRows(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (!data || typeof data !== 'object') {
    return [];
  }

  const candidates = [
    data.rows,
    data.bases,
    data.data?.rows,
    data.data?.bases,
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

  if (
    data.maps &&
    data.defaultMap
  ) {
    const defaultMap =
      data.maps[data.defaultMap];

    if (defaultMap) {
      return defaultMap;
    }
  }

  if (
    data.maps &&
    typeof data.maps === 'object'
  ) {
    const firstMap =
      Object.values(data.maps)[0];

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
    marker.type
      .trim()
      .toLowerCase() === 'base'
  );
}

function normalizeBase(
  base,
  index
) {
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
    id:
      base?.id ??
      base?.base_id ??
      `base-${index}`,
    name:
      base?.name ??
      base?.base_name ??
      base?.character_name ??
      `Base ${index + 1}`,
    x,
    y,
    icon:
      base?.icon ??
      'Base',
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

function extractVehicleRows(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (!data || typeof data !== 'object') {
    return [];
  }

  const queue = [data];
  const seen = new Set();

  while (queue.length > 0) {
    const current = queue.shift();

    if (
      !current ||
      typeof current !== 'object'
    ) {
      continue;
    }

    if (seen.has(current)) {
      continue;
    }

    seen.add(current);

    if (Array.isArray(current)) {
      return current;
    }

    for (const key of [
      'rows',
      'vehicles',
      'data',
      'results',
      'items',
    ]) {
      const value = current[key];

      if (Array.isArray(value)) {
        return value;
      }

      if (
        value &&
        typeof value === 'object'
      ) {
        queue.push(value);
      }
    }
  }

  return [];
}

function getPlayerName(
  playerData,
  session
) {
  return (
    playerData?.character_name ??
    playerData?.characterName ??
    playerData?.player_name ??
    playerData?.playerName ??
    playerData?.username ??
    playerData?.name ??
    playerData?.player?.character_name ??
    playerData?.player?.characterName ??
    playerData?.player?.player_name ??
    playerData?.player?.playerName ??
    playerData?.player?.username ??
    playerData?.player?.name ??
    session?.user?.username ??
    ''
  );
}

function normalizeVehicle(
  vehicle,
  index
) {
  return {
    ...vehicle,
    id:
      vehicle?.id ??
      vehicle?.vehicle_id ??
      vehicle?.vehicleId ??
      vehicle?.uuid ??
      `vehicle-${index}`,
    type: 'vehicle',
    x:
      vehicle?.x ??
      vehicle?.pos_x ??
      vehicle?.position?.x ??
      vehicle?.coordinates?.x ??
      null,
    y:
      vehicle?.y ??
      vehicle?.pos_y ??
      vehicle?.position?.y ??
      vehicle?.coordinates?.y ??
      null,
  };
}

function getMarkerBaseId(marker) {
  return getBaseId(marker);
}

function isCurrentPlayerMarker(
  marker,
  playerId,
  playerData,
  session
) {
  const markerId = String(
    marker?.id ??
    marker?.player_id ??
    marker?.playerId ??
    marker?.pawn_id ??
    marker?.pawnId ??
    ''
  ).trim();

  const markerAccountId = String(
    marker?.account_id ??
    marker?.accountId ??
    ''
  ).trim();

  const markerName = String(
    marker?.name ??
    marker?.character_name ??
    marker?.characterName ??
    marker?.player_name ??
    marker?.playerName ??
    ''
  )
    .trim()
    .toLowerCase();

  const currentPlayerId = String(
    playerId ?? ''
  ).trim();

  const currentAccountId = String(
    playerData?.account_id ??
    playerData?.accountId ??
    playerData?.account?.id ??
    ''
  ).trim();

  const currentPlayerName = String(
    getPlayerName(playerData, session)
  )
    .trim()
    .toLowerCase();

  if (
    currentPlayerId &&
    markerId &&
    markerId === currentPlayerId
  ) {
    return true;
  }

  if (
    currentAccountId &&
    markerAccountId &&
    markerAccountId === currentAccountId
  ) {
    return true;
  }

  if (
    currentPlayerName &&
    markerName &&
    markerName === currentPlayerName
  ) {
    return true;
  }

  return false;
}

function getErrorMessage(error) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Unable to load map data.';
}

export async function GET(request) {
  const started = Date.now();

  try {
    const cookieStore =
      await cookies();

    const sessionId =
      cookieStore.get(
        'dashboard_session'
      )?.value;

    if (!sessionId) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Unauthorized',
        },
        {
          status: 401,
          headers: {
            'Cache-Control':
              'no-store',
          },
        }
      );
    }

    const session =
      global.dashboardSessions?.get(
        sessionId
      );

    if (
      !session ||
      !session.expiresAt ||
      session.expiresAt <
      Date.now()
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Session expired or invalid',
        },
        {
          status: 401,
          headers: {
            'Cache-Control':
              'no-store',
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
      guildId:
        session.guildId,
      channelId:
        'dashboard',
      userId:
        session.user.id,
      username:
        session.user.username,
      roleIds: [
        ...(session.roleIds ||
          []),
        process.env
          .VERIFIED_MEMBER_ROLE_ID,
      ].filter(Boolean),
      interactionId:
        `map-${Date.now()}`,
      commandName:
        'portal',
    };

    const playerResponse =
      await fetch(
        `${process.env.CONSOLE_URL}/api/integrations/discord/players/me`,
        {
          method:
            'POST',
          body:
            JSON.stringify({
              actor,
            }),
          headers: {
            Accept:
              'application/json',
            'Content-Type':
              'application/json',
            Authorization:
              `Bearer ${process.env.ADAPTER_TOKEN}`,
          },
          cache:
            'no-store',
        }
      );

    if (
      !playerResponse.ok
    ) {
      throw new Error(
        `Discord Adapter request failed with status: ${playerResponse.status}`
      );
    }

    const playerData =
      await playerResponse.json();

    if (
      playerData?.linked !==
      true
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Your Discord account is not linked to a Dune player.',
          markers: [],
          bases: [],
          map: null,
          count: 0,
        },
        {
          status: 403,
          headers: {
            'Cache-Control':
              'no-store',
          },
        }
      );
    }

    const playerId =
      extractPlayerId(
        playerData
      );

    if (!playerId) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Unable to determine your Dune player ID.',
          markers: [],
          bases: [],
          map: null,
          count: 0,
        },
        {
          status: 403,
          headers: {
            'Cache-Control':
              'no-store',
          },
        }
      );
    }

    const duneClient =
      getDuneClient();

    const url =
      new URL(request.url);

    const mapName =
      url.searchParams
        .get('map')
        ?.trim();

    const markerEndpoint =
      mapName
        ? `/api/map/markers?map=${encodeURIComponent(
          mapName
        )}`
        : '/api/map/markers';

    const [
      basesData,
      mapData,
      vehiclesData,
      onlinePlayersData,
    ] = await Promise.all([
      duneClient.request(
        'GET',
        `/api/players/${encodeURIComponent(
          playerId
        )}/bases`
      ),
      duneClient.request(
        'GET',
        markerEndpoint
      ),

      // Vehicles come from the global vehicles
      // endpoint. We filter them below.
      duneClient.request(
        'GET',
        '/api/vehicles'
      ),
      duneClient.request(
        'GET',
        '/api/players/online'
      ),
    ]);

    const baseRows =
      extractBaseRows(
        basesData
      );

    const bases =
      baseRows.map(
        normalizeBase
      );

    const playerBaseIds =
      new Set(
        bases
          .map(getBaseId)
          .filter(Boolean)
      );

    const allMarkers =
      extractRows(mapData);

    const onlinePlayers =
      extractOnlinePlayers(
        onlinePlayersData
      );

    const onlinePlayerIds =
      new Set(
        onlinePlayers
          .map(getOnlinePlayerId)
          .filter(Boolean)
      );

    const playerName =
      getPlayerName(
        playerData,
        session
      );

    const vehicleRows =
      extractVehicleRows(
        vehiclesData
      );

    const accessibleVehicles =
      vehicleRows.filter(
        (vehicle) =>
          isVehicleAccessible(
            vehicle,
            playerName,
            playerId
          )
      );

    const playerVehicleMarkers =
      accessibleVehicles.map(
        normalizeVehicle
      );

    const supportedMarkerTypes =
      new Set([
        'player',
        'base',
        'spice',
        'spice_active',
        'flour_sand',
        'poi',
        'house_representative',
        'trainer',
      ]);

    const markers = allMarkers.filter((marker) => {
      const type = String(
        marker?.type || ''
      )
        .trim()
        .toLowerCase();

      if (!supportedMarkerTypes.has(type)) {
        return false;
      }

      // Only show the currently linked player's player marker.
      if (type === 'player') {
        return isCurrentPlayerMarker(
          marker,
          playerId,
          playerData,
          session
        );
      }

      // Global vehicle markers are removed.
      // Vehicles are added back below after access filtering.
      if (type === 'vehicle') {
        return false;
      }

      // Only show bases belonging to the current player.
      if (type === 'base') {
        const markerBaseId =
          getMarkerBaseId(marker);

        return (
          markerBaseId &&
          playerBaseIds.has(markerBaseId)
        );
      }

      if (type === 'player') {
        const markerPlayerId =
          String(
            marker?.pawn_id ??
            marker?.pawnId ??
            marker?.player_pawn_id ??
            marker?.playerPawnId ??
            marker?.player_id ??
            marker?.playerId ??
            marker?.id ??
            ''
          ).trim();

        return true;
      }

      return true;
    });

    const finalMarkers = [
      ...markers.map((marker) => {
        const type = String(
          marker?.type || ''
        )
          .trim()
          .toLowerCase();

        if (type !== 'player') {
          return marker;
        }

        const markerPlayerId = String(
          marker?.pawn_id ??
          marker?.pawnId ??
          marker?.player_pawn_id ??
          marker?.playerPawnId ??
          marker?.player_id ??
          marker?.playerId ??
          marker?.id ??
          ''
        ).trim();

        return {
          ...marker,
          online:
            markerPlayerId
              ? onlinePlayerIds.has(
                markerPlayerId
              )
              : false,
        };
      }),
      ...playerVehicleMarkers,
    ];

    const map =
      extractMapConfig(
        mapData
      );

    if (!map) {
      console.warn(
        '[MAP API] No map configuration returned',
        {
          mapName:
            mapName || null,
        }
      );
    }

    const durationMs =
      Date.now() -
      started;

    return NextResponse.json(
      {
        ok: true,
        bases,
        markers:
          finalMarkers,
        map,
        count:
          finalMarkers.length,
        timestamp:
          new Date().toISOString(),
        durationMs,
      },
      {
        status: 200,
        headers: {
          'Cache-Control':
            'no-store',
        },
      }
    );
  } catch (error) {
    const durationMs =
      Date.now() -
      started;

    console.error(
      '[MAP API] Failed to load map data:',
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          getErrorMessage(
            error
          ),
        bases: [],
        markers: [],
        map: null,
        count: 0,
        timestamp:
          new Date().toISOString(),
        durationMs,
      },
      {
        status: 500,
        headers: {
          'Cache-Control':
            'no-store',
        },
      }
    );
  }
}