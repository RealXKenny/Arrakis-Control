import { getDuneClient } from '../dune/client';
import { NextResponse } from 'next/server';
import { normalizeCurrency, extractVehicleRows, getBaseId, normalizeBaseStorage, normalizeBaseWater } from './utils/helpers';
import { extractGuildRows, findGuildMember, createGuildSummary } from './utils/guilds';
import { getDashboardSession, getSessionId } from '../_utils/session';

async function loadBaseTelemetry(base, duneClient) {
  const baseId = getBaseId(base);

  if (!baseId) {
    console.warn(
      '[BASE] Cannot load water/inventory: no base ID found',
      base
    );

    return {
      ...base,
      water: null,
      inventory: null,
      storage: {
        available: false,
        used: null,
        max: null,
        percent: null,
      },
      waterDataAvailable: false,
      inventoryDataAvailable: false,
    };
  }

  const encodedBaseId = encodeURIComponent(
    String(baseId)
  );

  const waterEndpoint =
    `/api/bases/${encodedBaseId}/water`;

  const inventoryEndpoint =
    `/api/bases/${encodedBaseId}/inventory`;

  const [
    waterResult,
    inventoryResult,
  ] = await Promise.allSettled([
    duneClient.request(
      'GET',
      waterEndpoint
    ),
    duneClient.request(
      'GET',
      inventoryEndpoint
    ),
  ]);

  let water = null;
  let inventory = null;

  if (waterResult.status === 'fulfilled') {
    water = waterResult.value;
  } else {
    console.error(
      `[BASE ${baseId}] Failed to load water:`,
      waterResult.reason
    );
  }

  if (inventoryResult.status === 'fulfilled') {
    inventory = inventoryResult.value;
  } else {
    console.error(
      `[BASE ${baseId}] Failed to load inventory:`,
      inventoryResult.reason
    );
  }

  const storage = normalizeBaseStorage(
    inventory
  );

  const normalizedWater = normalizeBaseWater(
    water
  );

  return {
    ...base,
    water,
    inventory,
    storage,
    waterSummary: normalizedWater,
    waterDataAvailable:
      normalizedWater.available,
    inventoryDataAvailable:
      storage.available,
  };
}

async function loadPlayerGuild(playerId, playerName, duneClient) {
  try {
    const guildResponse = await duneClient.request(
      'GET',
      '/api/guilds?page=0&pageSize=100'
    );

    const guilds = extractGuildRows(guildResponse);

    for (const guild of guilds) {
      const guildId = guild?.id ?? guild?.guildId ?? guild?.guild_id;

      if (!guildId) continue;

      const memberResponse = await duneClient.request(
        'GET',
        `/api/guilds/${encodeURIComponent(guildId)}/members`
      );

      const member = findGuildMember(
        extractGuildRows(memberResponse),
        playerId,
        playerName
      );

      if (member) {
        return createGuildSummary(guild, member, guildId);
      }
    }
  } catch (error) {
    console.error('Failed to load player guild:', error);
  }

  return null;
}

/**
 * GET /api/player
 */
export async function GET(request) {
  try {
    // Create/get the Dune client only when the request runs.
    const duneClient = getDuneClient();

    const sessionId = await getSessionId();
    const dashboardSession = await getDashboardSession();

    if (!dashboardSession) {
      const error = sessionId
        ? 'Session expired or invalid'
        : 'Unauthorized';

      return NextResponse.json(
        {
          error,
        },
        {
          status: 401,
        }
      );
    }

    const { session } = dashboardSession;

    const actor = {
      guildId: session.guildId,
      channelId: 'dashboard',
      userId: session.user.id,
      username: session.user.username,
      roleIds: [
        ...(session.roleIds || []),
        process.env.VERIFIED_MEMBER_ROLE_ID,
      ].filter(Boolean),
      interactionId:
        `dashboard-${Date.now()}`,
      commandName: 'portal',
    };

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

    const endpoint =
      `${process.env.CONSOLE_URL}/api/integrations/discord/players/me`;

    const resAdapter = await fetch(
      endpoint,
      {
        method: 'POST',
        body: JSON.stringify({
          actor,
        }),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization:
            `Bearer ${process.env.ADAPTER_TOKEN}`,
        },
        cache: 'no-store',
      }
    );

    if (!resAdapter.ok) {
      throw new Error(
        `Discord Adapter request failed with status: ${resAdapter.status}`
      );
    }

    const data = await resAdapter.json();

    if (data?.linked !== true) {
      return NextResponse.json(
        data,
        {
          status: 200,
        }
      );
    }

    const playerId =
      data.pawnId ??
      data.controllerId;

    if (!playerId) {
      return NextResponse.json(
        {
          ...data,
          linked: false,
          error:
            'Unable to determine your Dune player ID.',
        },
        {
          status: 200,
        }
      );
    }

    /**
     * Core player endpoints.
     */
      const coreEndpoints = [
        'currency',
        'solaris-coin',
        'factions',
        'intel',
        'specs',
        'progression',
        'vitals',
        'bases',
        'vehicles',
      ];

    const details = await Promise.all(
      coreEndpoints.map(
        async (name) => {
          try {
            const playerEndpoint =
              name === 'vehicles'
                ? '/api/vehicles'
                : `/api/players/${encodeURIComponent(
                  playerId
                )}/${name}`;

            const resData =
              await duneClient.request(
                'GET',
                playerEndpoint
              );

            if (name === 'vehicles') {
              const allVehicles = Array.isArray(
                resData?.rows
              )
                ? resData.rows
                : [];

              return [
                name,
                {
                  ...resData,
                  rows: allVehicles,
                  totalCount: allVehicles.length,
                },
              ];
            }

            /**
             * Bases
             */
            if (name === 'bases') {
              const bases = Array.isArray(
                resData
              )
                ? resData
                : Array.isArray(
                    resData?.rows
                  )
                  ? resData.rows
                  : Array.isArray(
                      resData?.data
                    )
                    ? resData.data
                    : Array.isArray(
                        resData?.bases
                      )
                      ? resData.bases
                      : [];

              const enrichedBases =
                await Promise.all(
                  bases.map(
                    async (base) =>
                      loadBaseTelemetry(
                        base,
                        duneClient
                      )
                  )
                );

              let result;

              if (Array.isArray(resData)) {
                result = enrichedBases;
              } else if (
                resData &&
                typeof resData === 'object'
              ) {
                result = {
                  ...resData,
                  rows: enrichedBases,
                };

                if (
                  Array.isArray(
                    resData.data
                  )
                ) {
                  result.data =
                    enrichedBases;
                }

                if (
                  Array.isArray(
                    resData.bases
                  )
                ) {
                  result.bases =
                    enrichedBases;
                }
              } else {
                result = {
                  rows: enrichedBases,
                };
              }

              return [
                name,
                result,
              ];
            }
            
            return [
              name,
              resData,
            ];
          } catch (error) {
            console.error(
              `Failed to load player ${name} telemetry:`,
              error
            );

            return [
              name,
              null,
            ];
          }
        }
      )
    );

    const guild = await loadPlayerGuild(
      playerId,
      data.characterName,
      duneClient
    );

    /**
     * Final response.
     */
    const responseData = {
      ...data,
      details:
        {
          ...Object.fromEntries(details),
          guild,
        },
    };

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
