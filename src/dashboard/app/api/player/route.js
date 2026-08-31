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

/**
 * Helpers
 */
function firstNumber(...values) {
  for (const value of values) {
    const number = Number(value);

    if (Number.isFinite(number)) {
      return number;
    }
  }

  return null;
}

function firstValue(...values) {
  for (const value of values) {
    if (
      value !== undefined &&
      value !== null &&
      value !== ''
    ) {
      return value;
    }
  }

  return null;
}

function clampPercent(value) {
  if (!Number.isFinite(value)) {
    return null;
  }

  return Math.max(0, Math.min(100, value));
}

/**
 * Normalize currency.
 *
 * API response:
 *
 * {
 *   capabilities: { currency: true },
 *   rows: [
 *     {
 *       currency_id: 0,
 *       balance: '12537085',
 *       label: 'Solari Credit'
 *     },
 *     {
 *       currency_id: 1,
 *       balance: 0,
 *       label: 'Scrip'
 *     }
 *   ]
 * }
 */
function normalizeCurrency(currency) {
  if (!currency) {
    return {
      available: false,
      rows: [],
      solariCredit: null,
      scrip: null,
    };
  }

  const rows = Array.isArray(currency)
    ? currency
    : Array.isArray(currency.rows)
      ? currency.rows
      : Array.isArray(currency.data)
        ? currency.data
        : [];

  const normalizedRows = rows.map((row) => ({
    ...row,
    currency_id: firstNumber(
      row?.currency_id,
      row?.currencyId,
      row?.id
    ),
    balance: firstNumber(row?.balance) ?? 0,
    label: row?.label ?? null,
  }));

  const solariRow = normalizedRows.find((row) => {
    const label = String(row.label ?? '').toLowerCase();

    return (
      label.includes('solari') ||
      label.includes('solar')
    );
  });

  const scripRow = normalizedRows.find((row) => {
    const label = String(row.label ?? '').toLowerCase();

    return label.includes('scrip');
  });

  return {
    ...currency,

    available:
      currency?.capabilities?.currency === true ||
      normalizedRows.length > 0,

    rows: normalizedRows,

    // Convenient values for the frontend.
    solariCredit: solariRow?.balance ?? null,
    scrip: scripRow?.balance ?? null,

    // Keep the original API naming available too.
    solarisCoin: solariRow?.balance ?? null,
  };
}

/**
 * Extract base ID
 */
function getBaseId(base) {
  return firstValue(
    base?.base_id,
    base?.baseId,
    base?.id,
    base?.uuid
  );
}

/**
 * Normalize base inventory storage
 */
function normalizeBaseStorage(inventory) {
  if (!inventory) {
    return {
      available: false,
      used: null,
      max: null,
      percent: null,
    };
  }

  const directUsed = firstNumber(
    inventory.used,
    inventory.usedStorage,
    inventory.storageUsed,
    inventory.totalUsed,
    inventory.usedSlots,
    inventory.occupied,
    inventory.current
  );

  const directMax = firstNumber(
    inventory.max,
    inventory.maxStorage,
    inventory.storageMax,
    inventory.storageCapacity,
    inventory.capacity,
    inventory.maxCapacity,
    inventory.totalCapacity,
    inventory.slots,
    inventory.maxSlots
  );

  const storage = inventory.storage || {};

  const storageUsed = firstNumber(
    directUsed,
    storage.used,
    storage.usedStorage,
    storage.storageUsed,
    storage.current,
    storage.occupied
  );

  const storageMax = firstNumber(
    directMax,
    storage.max,
    storage.maxStorage,
    storage.storageMax,
    storage.capacity,
    storage.maxCapacity,
    storage.totalCapacity,
    storage.slots,
    storage.maxSlots
  );

  const containers =
    Array.isArray(inventory.containers)
      ? inventory.containers
      : Array.isArray(inventory.rows)
        ? inventory.rows
        : Array.isArray(inventory.data)
          ? inventory.data
          : [];

  let containerUsed = null;
  let containerMax = null;

  for (const container of containers) {
    const type = String(
      container?.type ||
      container?.containerType ||
      container?.category ||
      ''
    ).toLowerCase();

    const isStorage =
      type.includes('storage') ||
      type.includes('inventory');

    if (!isStorage) {
      continue;
    }

    const used = firstNumber(
      container?.used,
      container?.usedSlots,
      container?.occupied,
      container?.current,
      container?.itemCount
    );

    const max = firstNumber(
      container?.max,
      container?.maxSlots,
      container?.capacity,
      container?.slots,
      container?.maxCapacity
    );

    if (used !== null) {
      containerUsed = (containerUsed ?? 0) + used;
    }

    if (max !== null) {
      containerMax = (containerMax ?? 0) + max;
    }
  }

  const used =
    storageUsed !== null
      ? storageUsed
      : containerUsed;

  const max =
    storageMax !== null
      ? storageMax
      : containerMax;

  let percent = null;

  if (
    used !== null &&
    max !== null &&
    max > 0
  ) {
    percent = clampPercent((used / max) * 100);
  }

  if (percent === null) {
    const suppliedPercent = firstNumber(
      inventory.percent,
      inventory.fillPercent,
      inventory.storagePercent,
      inventory.usedPercent,
      storage.percent,
      storage.fillPercent,
      storage.usedPercent
    );

    if (suppliedPercent !== null) {
      percent = clampPercent(
        suppliedPercent > 1
          ? suppliedPercent
          : suppliedPercent * 100
      );
    }
  }

  return {
    available:
      used !== null ||
      max !== null ||
      percent !== null,
    used,
    max,
    percent,
  };
}

/**
 * Normalize water
 */
function normalizeBaseWater(water) {
  if (!water) {
    return {
      available: false,
      containers: 0,
      volume: null,
      maxVolume: null,
      percent: null,
      bloodVolume: null,
      bloodMaxVolume: null,
      bloodPercent: null,
    };
  }

  const containers =
    Array.isArray(water)
      ? water
      : Array.isArray(water?.containers)
        ? water.containers
        : Array.isArray(water?.rows)
          ? water.rows
          : Array.isArray(water?.data)
            ? water.data
            : [];

  const directVolume = firstNumber(
    water.volume,
    water.currentVolume,
    water.totalVolume,
    water.waterVolume
  );

  const directMaxVolume = firstNumber(
    water.maxVolume,
    water.capacity,
    water.maxCapacity,
    water.totalCapacity
  );

  let volume = directVolume;
  let maxVolume = directMaxVolume;

  let bloodVolume = firstNumber(
    water.bloodVolume,
    water.currentBloodVolume
  );

  let bloodMaxVolume = firstNumber(
    water.bloodMaxVolume,
    water.bloodCapacity,
    water.maxBloodVolume
  );

  if (containers.length > 0) {
    let summedVolume = 0;
    let summedMaxVolume = 0;
    let summedBloodVolume = 0;
    let summedBloodMaxVolume = 0;

    let foundVolume = false;
    let foundMaxVolume = false;
    let foundBloodVolume = false;
    let foundBloodMaxVolume = false;

    for (const container of containers) {
      const current = firstNumber(
        container?.volume,
        container?.currentVolume,
        container?.waterVolume,
        container?.currentWaterVolume
      );

      const max = firstNumber(
        container?.maxVolume,
        container?.capacity,
        container?.maxCapacity,
        container?.waterCapacity
      );

      const blood = firstNumber(
        container?.bloodVolume,
        container?.currentBloodVolume
      );

      const bloodMax = firstNumber(
        container?.bloodMaxVolume,
        container?.bloodCapacity,
        container?.maxBloodVolume
      );

      if (current !== null) {
        summedVolume += current;
        foundVolume = true;
      }

      if (max !== null) {
        summedMaxVolume += max;
        foundMaxVolume = true;
      }

      if (blood !== null) {
        summedBloodVolume += blood;
        foundBloodVolume = true;
      }

      if (bloodMax !== null) {
        summedBloodMaxVolume += bloodMax;
        foundBloodMaxVolume = true;
      }
    }

    if (volume === null && foundVolume) {
      volume = summedVolume;
    }

    if (maxVolume === null && foundMaxVolume) {
      maxVolume = summedMaxVolume;
    }

    if (bloodVolume === null && foundBloodVolume) {
      bloodVolume = summedBloodVolume;
    }

    if (
      bloodMaxVolume === null &&
      foundBloodMaxVolume
    ) {
      bloodMaxVolume = summedBloodMaxVolume;
    }
  }

  let percent = null;

  if (
    volume !== null &&
    maxVolume !== null &&
    maxVolume > 0
  ) {
    percent = clampPercent(
      (volume / maxVolume) * 100
    );
  }

  let bloodPercent = null;

  if (
    bloodVolume !== null &&
    bloodMaxVolume !== null &&
    bloodMaxVolume > 0
  ) {
    bloodPercent = clampPercent(
      (bloodVolume / bloodMaxVolume) * 100
    );
  }

  if (percent === null) {
    const suppliedPercent = firstNumber(
      water.percent,
      water.fillPercent,
      water.waterPercent
    );

    if (suppliedPercent !== null) {
      percent = clampPercent(
        suppliedPercent > 1
          ? suppliedPercent
          : suppliedPercent * 100
      );
    }
  }

  if (bloodPercent === null) {
    const suppliedBloodPercent = firstNumber(
      water.bloodPercent,
      water.bloodFillPercent
    );

    if (suppliedBloodPercent !== null) {
      bloodPercent = clampPercent(
        suppliedBloodPercent > 1
          ? suppliedBloodPercent
          : suppliedBloodPercent * 100
      );
    }
  }

  return {
    available:
      containers.length > 0 ||
      volume !== null ||
      maxVolume !== null,

    containers: containers.length,
    volume,
    maxVolume,
    percent,
    bloodVolume,
    bloodMaxVolume,
    bloodPercent,
  };
}

/**
 * Load one base's additional telemetry
 */
async function loadBaseTelemetry(base) {
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

  const encodedBaseId =
    encodeURIComponent(String(baseId));

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

  const storage =
    normalizeBaseStorage(inventory);

  const normalizedWater =
    normalizeBaseWater(water);

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

/**
 * GET /api/player
 */
export async function GET(request) {
  try {
    const cookieStore = await cookies();

    const sessionId =
      cookieStore.get('dashboard_session')?.value;

    if (!sessionId) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
        },
        {
          status: 401,
        }
      );
    }

    const session =
      global.dashboardSessions?.get(sessionId);

    if (
      !session ||
      session.expiresAt < Date.now()
    ) {
      return NextResponse.json(
        {
          error: 'Session expired or invalid',
        },
        {
          status: 401,
        }
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
      interactionId:
        `dashboard-${Date.now()}`,
      commandName: 'portal',
    };

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
     * Core player endpoints
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
    ];

    const details = await Promise.all(
      coreEndpoints.map(
        async (name) => {
          try {
            const playerEndpoint =
              `/api/players/${encodeURIComponent(
                playerId
              )}/${name}`;

            const resData =
              await duneClient.request(
                'GET',
                playerEndpoint
              );

            /**
             * Bases
             */
            if (name === 'bases') {
              const bases =
                Array.isArray(resData)
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
                      loadBaseTelemetry(base)
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

    /**
     * Final response
     */
    const responseData = {
      ...data,
      details:
        Object.fromEntries(details),
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