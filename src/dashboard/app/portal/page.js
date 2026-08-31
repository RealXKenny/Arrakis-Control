'use client';

import React, { useEffect, useState } from 'react';
import PortalTabs from '../components/tabs/PortalTabs';

const MAX_POWER_SECONDS = 42 * 24 * 60 * 60;

function clampPercent(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.max(0, Math.min(100, number));
}

function getBaseId(base) {
  return (
    base?.base_id ??
    base?.baseId ??
    base?.id ??
    base?.uuid ??
    null
  );
}

function getNumber(...values) {
  for (const value of values) {
    const number = Number(value);

    if (Number.isFinite(number)) {
      return number;
    }
  }

  return null;
}

function formatVolume(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return '—';
  }

  return number.toLocaleString(undefined, {
    maximumFractionDigits: 1,
  });
}

function formatStorage(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return '—';
  }

  return number.toLocaleString(undefined, {
    maximumFractionDigits: 1,
  });
}

function getFillPercent(current, max, explicitPercent) {
  if (
    explicitPercent !== undefined &&
    explicitPercent !== null &&
    Number.isFinite(Number(explicitPercent))
  ) {
    return clampPercent(explicitPercent);
  }

  const currentNumber = Number(current);
  const maxNumber = Number(max);

  if (
    Number.isFinite(currentNumber) &&
    Number.isFinite(maxNumber) &&
    maxNumber > 0
  ) {
    return clampPercent((currentNumber / maxNumber) * 100);
  }

  return 0;
}

function getPowerColor(percent) {
  if (percent <= 10) {
    return '#ff4a4a';
  }

  if (percent <= 25) {
    return '#e5b85c';
  }

  return '#d2a85a';
}

function getCapacityFromInventory(data) {
  const root = data?.data ?? data ?? {};

  const candidates = [
    root.maxStorage,
    root.max_storage,
    root.storageCapacity,
    root.storage_capacity,
    root.totalCapacity,
    root.total_capacity,
    root.capacity,
    root.storage?.max,
    root.storage?.maxCapacity,
    root.storage?.max_capacity,
    root.storage?.capacity,
    root.summary?.maxStorage,
    root.summary?.max_storage,
    root.summary?.storageCapacity,
    root.summary?.storage_capacity,
    root.summary?.capacity,
    root.totals?.maxStorage,
    root.totals?.max_storage,
    root.totals?.capacity,
  ];

  return getNumber(...candidates);
}

function getUsedStorageFromInventory(data) {
  const root = data?.data ?? data ?? {};

  const candidates = [
    root.usedStorage,
    root.used_storage,
    root.storageUsed,
    root.storage_used,
    root.totalStored,
    root.total_stored,
    root.used,
    root.storage?.used,
    root.storage?.usedCapacity,
    root.storage?.used_capacity,
    root.summary?.usedStorage,
    root.summary?.used_storage,
    root.summary?.storageUsed,
    root.summary?.storage_used,
    root.summary?.used,
    root.totals?.usedStorage,
    root.totals?.used_storage,
    root.totals?.storageUsed,
    root.totals?.storage_used,
    root.totals?.used,
  ];

  const directValue = getNumber(...candidates);

  if (directValue !== null) {
    return directValue;
  }

  /*
   * Some inventory APIs return containers with their own
   * used/current quantities. If no total is supplied, add them.
   */
  const containers =
    root.containers ??
    root.storage ??
    root.storageContainers ??
    root.storage_containers ??
    [];

  if (Array.isArray(containers)) {
    let total = 0;
    let found = false;

    for (const container of containers) {
      const value = getNumber(
        container?.used,
        container?.usedStorage,
        container?.used_storage,
        container?.current,
        container?.currentAmount,
        container?.current_amount,
        container?.quantity,
        container?.items
      );

      if (value !== null) {
        total += value;
        found = true;
      }
    }

    if (found) {
      return total;
    }
  }

  return null;
}

function getWaterData(data) {
  const root = data?.data ?? data ?? {};

  const containers =
    root.containers ??
    root.waterContainers ??
    root.water_containers ??
    root.rows ??
    [];

  let current = getNumber(
    root.volume,
    root.currentVolume,
    root.current_volume,
    root.totalVolume,
    root.total_volume,
    root.waterVolume,
    root.water_volume,
    root.stored,
    root.current
  );

  let max = getNumber(
    root.maxVolume,
    root.max_volume,
    root.capacity,
    root.maxCapacity,
    root.max_capacity,
    root.totalCapacity,
    root.total_capacity
  );

  let percent = getNumber(
    root.fillPercent,
    root.fill_percentage,
    root.fillPercentage,
    root.percent,
    root.percentage
  );

  let containerCount = getNumber(
    root.count,
    root.containerCount,
    root.container_count
  );

  if (Array.isArray(containers)) {
    if (containerCount === null) {
      containerCount = containers.length;
    }

    if (current === null) {
      const totalCurrent = containers.reduce((sum, container) => {
        const value = getNumber(
          container?.volume,
          container?.currentVolume,
          container?.current_volume,
          container?.stored,
          container?.current,
          container?.amount
        );

        return sum + (value ?? 0);
      }, 0);

      if (containers.length > 0) {
        current = totalCurrent;
      }
    }

    if (max === null) {
      const totalMax = containers.reduce((sum, container) => {
        const value = getNumber(
          container?.maxVolume,
          container?.max_volume,
          container?.capacity,
          container?.maxCapacity,
          container?.max_capacity
        );

        return sum + (value ?? 0);
      }, 0);

      if (totalMax > 0) {
        max = totalMax;
      }
    }

    if (percent === null && current !== null && max !== null && max > 0) {
      percent = (current / max) * 100;
    }
  }

  return {
    current,
    max,
    percent: percent === null ? 0 : clampPercent(percent),
    containerCount: containerCount ?? 0,
  };
}

function getBloodData(data) {
  const root = data?.data ?? data ?? {};

  const bloodCurrent = getNumber(
    root.bloodVolume,
    root.blood_volume,
    root.bloodCurrentVolume,
    root.blood_current_volume,
    root.bloodStored,
    root.blood_stored
  );

  const bloodMax = getNumber(
    root.bloodMaxVolume,
    root.blood_max_volume,
    root.bloodCapacity,
    root.blood_capacity,
    root.maxBloodVolume,
    root.max_blood_volume
  );

  let bloodPercent = getNumber(
    root.bloodFillPercent,
    root.blood_fill_percent,
    root.bloodFillPercentage,
    root.blood_fill_percentage,
    root.bloodPercent,
    root.blood_percent
  );

  if (
    bloodPercent === null &&
    bloodCurrent !== null &&
    bloodMax !== null &&
    bloodMax > 0
  ) {
    bloodPercent = (bloodCurrent / bloodMax) * 100;
  }

  return {
    current: bloodCurrent,
    max: bloodMax,
    percent: bloodPercent === null ? null : clampPercent(bloodPercent),
  };
}

function getSharedWith(base) {
  const shared =
    base?.shared_with ??
    base?.sharedWith ??
    [];

  return Array.isArray(shared) ? shared : [];
}

function getGeneratorSeconds(base) {
  return Math.max(
    0,
    getNumber(
      base?.generatorRuntimeSeconds,
      base?.generator_runtime_seconds,
      base?.generatorRuntime,
      base?.generator_runtime,
      base?.powerSeconds,
      base?.power_seconds
    ) ?? 0
  );
}

function getStoragePercent(used, max) {
  if (
    used === null ||
    max === null ||
    max <= 0
  ) {
    return null;
  }

  return clampPercent((used / max) * 100);
}

function getStorageColor(percent) {
  if (percent === null) {
    return '#a08568';
  }

  if (percent >= 90) {
    return '#ff4a4a';
  }

  if (percent >= 75) {
    return '#e5b85c';
  }

  return '#d2a85a';
}

export default function PlayerPortal() {
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [basesTelemetry, setBasesTelemetry] = useState({});
  const [basesLoading, setBasesLoading] = useState(false);

  async function loadBaseTelemetry(bases) {
    if (!Array.isArray(bases) || bases.length === 0) {
      setBasesTelemetry({});
      setBasesLoading(false);
      return;
    }

    setBasesLoading(true);

    const results = await Promise.all(
      bases.map(async (base) => {
        const baseId = getBaseId(base);

        if (!baseId) {
          return {
            id: null,
            water: null,
            inventory: null,
            waterError: 'Missing base ID',
            inventoryError: 'Missing base ID',
          };
        }

        const waterUrl = `/api/bases/${encodeURIComponent(
          baseId
        )}/water`;

        const inventoryUrl = `/api/bases/${encodeURIComponent(
          baseId
        )}/inventory`;

        const [waterResult, inventoryResult] =
          await Promise.allSettled([
            fetch(waterUrl, {
              cache: 'no-store',
            }),
            fetch(inventoryUrl, {
              cache: 'no-store',
            }),
          ]);

        let water = null;
        let inventory = null;
        let waterError = null;
        let inventoryError = null;

        try {
          if (waterResult.status === 'fulfilled') {
            if (waterResult.value.ok) {
              water = await waterResult.value.json();
            } else {
              waterError = `Water API returned ${waterResult.value.status}`;
            }
          } else {
            waterError = waterResult.reason?.message || 'Water request failed';
          }
        } catch (error) {
          waterError = error?.message || 'Invalid water response';
        }

        try {
          if (inventoryResult.status === 'fulfilled') {
            if (inventoryResult.value.ok) {
              inventory = await inventoryResult.value.json();
            } else {
              inventoryError = `Inventory API returned ${inventoryResult.value.status}`;
            }
          } else {
            inventoryError =
              inventoryResult.reason?.message ||
              'Inventory request failed';
          }
        } catch (error) {
          inventoryError =
            error?.message || 'Invalid inventory response';
        }

        return {
          id: baseId,
          water,
          inventory,
          waterError,
          inventoryError,
        };
      })
    );

    const nextTelemetry = {};

    for (const result of results) {
      if (result.id) {
        nextTelemetry[result.id] = result;
      }
    }

    setBasesTelemetry(nextTelemetry);
    setBasesLoading(false);
  }

  async function loadPlayerData() {
    try {
      const res = await fetch('/api/player', {
        cache: 'no-store',
      });

      if (!res.ok) {
        console.error(
          'Player API returned:',
          res.status
        );
        return;
      }

      const data = await res.json();

      console.log(
        'PLAYER API RESPONSE:',
        data
      );

      console.log(
        'PLAYER BASES:',
        data?.details?.bases
      );

      setPlayer(data);

      const baseResponse =
        data?.details?.bases || {};

      const bases = Array.isArray(baseResponse)
        ? baseResponse
        : Array.isArray(baseResponse.rows)
          ? baseResponse.rows
          : Array.isArray(baseResponse.data)
            ? baseResponse.data
            : [];

      console.log(
        'BASES USED BY PLAYER PORTAL:',
        bases
      );

      await loadBaseTelemetry(bases);
    } catch (err) {
      console.error(
        'Failed to fetch player attributes:',
        err
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlayerData();

    const interval = setInterval(() => {
      loadPlayerData();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <main
        style={{
          minHeight: '100vh',
          width: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          background:
            'radial-gradient(circle at top, #24170d 0%, #0f0905 55%, #080604 100%)',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
          color: '#a08568',
        }}
      >
        <p>
          Synchronizing with Dune Awakening Console
          telemetry...
        </p>
      </main>
    );
  }

  if (!player?.linked) {
    return (
      <main
        style={{
          minHeight: '100vh',
          width: '100%',
          boxSizing: 'border-box',
          padding: '40px 20px',
          background:
            'radial-gradient(circle at top, #24170d 0%, #0f0905 55%, #080604 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <PortalTabs activeTab="Character" />

        <div
          style={{
            width: '100%',
            maxWidth: 800,
            margin: '0 auto',
          }}
        >
          <div
            style={{
              backgroundColor: '#1d120c',
              border: '1px solid #3c2415',
              padding: 30,
              borderRadius: 10,
              textAlign: 'center',
              boxSizing: 'border-box',
            }}
          >
            <b
              style={{
                color: '#ff4a4a',
                fontSize: '1.2rem',
                display: 'block',
                marginBottom: 10,
              }}
            >
              No Linked Dune Character Found
            </b>

            <p
              style={{
                color: '#a08568',
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              Please link your character in-game or via
              the Discord server integrations panel first.
            </p>

            <a
              href="/dashboard"
              style={{
                display: 'inline-block',
                marginTop: 20,
                color: '#cda26b',
                textDecoration: 'none',
              }}
            >
              ← Return to Admin Panel
            </a>
          </div>
        </div>
      </main>
    );
  }

  const x = player.details || {};
  const p = x.progression || {};
  const i = x.intel || {};
  const v = x.vitals || {};
  const c = x.currency?.rows || [];
  const solarisCoin = x['solaris-coin'] || {};

  const basesResponse = x.bases || {};

  const bases = Array.isArray(basesResponse)
    ? basesResponse
    : Array.isArray(basesResponse.rows)
      ? basesResponse.rows
      : Array.isArray(basesResponse.data)
        ? basesResponse.data
        : [];

  const char = {
    name:
      player.characterName ||
      'Unknown Character',

    status:
      player.onlineStatus ||
      'Offline',

    level:
      p.level ?? '—',

    xp:
      p.xp ?? '—',

    intel:
      i.intel ?? 0,

    maxIntel:
      i.maxIntel ?? 0,

    solaris:
      solarisCoin.total ?? 0,

    health:
      Math.round(v.currentHealth ?? 100),

    maxHealth:
      Math.round(v.maxHealth ?? 100),

    hydration:
      Math.round(v.hydration ?? 100),
  };

  const pct = (current, max) =>
    max
      ? Math.max(
          0,
          Math.min(
            100,
            (Number(current) /
              Number(max)) *
              100
          )
        )
      : 0;

  const isOnline = char.status
    .toLowerCase()
    .includes('online');

  return (
    <main
      style={{
        minHeight: '100vh',
        width: '100%',
        boxSizing: 'border-box',
        padding: '40px 20px 60px',
        background:
          'radial-gradient(circle at top, #24170d 0%, #0f0905 55%, #080604 100%)',
        color: '#ffe2a9',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <PortalTabs activeTab="Character" />

      <div
        style={{
          width: '100%',
          maxWidth: 800,
          margin: '0 auto',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 15,
            marginBottom: 30,
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '7px 12px',
              borderRadius: 999,
              background: isOnline
                ? 'rgba(82, 250, 124, 0.08)'
                : 'rgba(255, 74, 74, 0.08)',
              border: isOnline
                ? '1px solid rgba(82, 250, 124, 0.25)'
                : '1px solid rgba(255, 74, 74, 0.25)',
              boxSizing: 'border-box',
            }}
          >
            <span
              style={{
                height: 9,
                width: 9,
                flexShrink: 0,
                backgroundColor:
                  isOnline
                    ? '#52fa7c'
                    : '#ff4a4a',
                borderRadius: '50%',
                display: 'inline-block',
                boxShadow: isOnline
                  ? '0 0 8px #52fa7c'
                  : '0 0 8px rgba(255, 74, 74, 0.45)',
              }}
            />

            <span
              style={{
                color: isOnline
                  ? '#8fffa9'
                  : '#e58b8b',
                fontWeight: 'bold',
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                lineHeight: 1,
              }}
            >
              {char.status}
            </span>
          </div>

          <a
            href="/api/auth/logout"
            style={{
              backgroundColor: '#1d120c',
              color: '#cda26b',
              border: '1px solid #3c2415',
              padding: '8px 16px',
              borderRadius: 4,
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontWeight: 'bold',
            }}
          >
            Sign out
          </a>
        </div>

        {/* Character Heading */}
        <p
          style={{
            textTransform: 'uppercase',
            letterSpacing: 2,
            color: '#cda26b',
            fontSize: '0.85rem',
            margin: '0 0 5px',
          }}
        >
          Arrakis Survivor Log
        </p>

        <h1
          style={{
            fontSize: 'clamp(2rem, 7vw, 2.5rem)',
            margin: '0 0 30px',
            fontFamily: 'Georgia, serif',
            color: '#ffe2a9',
            lineHeight: 1.1,
            wordBreak: 'break-word',
          }}
        >
          {char.name}
        </h1>

        {/* Vitals */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(190px, 1fr))',
            gap: 15,
            marginBottom: 30,
          }}
        >
          {/* Health */}
          <div
            style={{
              backgroundColor: '#1d120c',
              border: '1px solid #3c2415',
              padding: 20,
              borderRadius: 12,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <b
              style={{
                display: 'block',
                color: '#a08568',
                fontSize: '0.85rem',
                marginBottom: 8,
              }}
            >
              Health
            </b>

            <div
              style={{
                fontSize: '1.4rem',
                fontWeight: 'bold',
                color: '#ffe2a9',
                marginBottom: 8,
              }}
            >
              {char.health} / {char.maxHealth}
            </div>

            <div
              style={{
                height: 4,
                backgroundColor: '#ffffff10',
                borderRadius: 2,
              }}
            >
              <i
                style={{
                  display: 'block',
                  height: '100%',
                  backgroundColor: '#ff4a4a',
                  width: `${pct(
                    char.health,
                    char.maxHealth
                  )}%`,
                  borderRadius: 2,
                }}
              />
            </div>
          </div>

          {/* Hydration */}
          <div
            style={{
              backgroundColor: '#1d120c',
              border: '1px solid #3c2415',
              padding: 20,
              borderRadius: 12,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <b
              style={{
                display: 'block',
                color: '#a08568',
                fontSize: '0.85rem',
                marginBottom: 8,
              }}
            >
              Hydration
            </b>

            <div
              style={{
                fontSize: '1.4rem',
                fontWeight: 'bold',
                color: '#ffe2a9',
                marginBottom: 8,
              }}
            >
              {char.hydration} / 100
            </div>

            <div
              style={{
                height: 4,
                backgroundColor: '#ffffff10',
                borderRadius: 2,
              }}
            >
              <i
                style={{
                  display: 'block',
                  height: '100%',
                  backgroundColor: '#4a90e2',
                  width: `${char.hydration}%`,
                  borderRadius: 2,
                }}
              />
            </div>
          </div>

          {/* Rank */}
          <div
            style={{
              backgroundColor: '#1d120c',
              border: '1px solid #3c2415',
              padding: 20,
              borderRadius: 12,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <b
              style={{
                display: 'block',
                color: '#a08568',
                fontSize: '0.85rem',
                marginBottom: 8,
              }}
            >
              Rank & XP
            </b>

            <div
              style={{
                fontSize: '1.2rem',
                fontWeight: 'bold',
                color: '#f3d39b',
                marginBottom: 8,
              }}
            >
              Level {char.level}
            </div>

            <small
              style={{
                color: '#a08568',
                fontSize: '0.75rem',
              }}
            >
              XP: {char.xp}
            </small>
          </div>
        </section>

        {/* Inventory */}
        <section
          style={{
            backgroundColor: '#1d120c',
            border: '1px solid #3c2415',
            padding: 25,
            borderRadius: 12,
            marginBottom: 30,
          }}
        >
          <h2
            style={{
              fontSize: '1.2rem',
              margin: '0 0 20px',
              fontFamily: 'Georgia, serif',
              color: '#ffe2a9',
              borderBottom: '1px solid #ffffff10',
              paddingBottom: 10,
            }}
          >
            Inventory & Assets
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 15,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 10,
                padding: 12,
                backgroundColor: '#ffffff04',
                borderRadius: 6,
                border: '1px solid #ffffff08',
              }}
            >
              <span
                style={{
                  color: '#dbc19a',
                }}
              >
                Solaris Coin
              </span>

              <strong
                style={{
                  color: '#d2a85a',
                }}
              >
                {Number(
                  char.solaris
                ).toLocaleString()}
              </strong>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 10,
                padding: 12,
                backgroundColor: '#ffffff04',
                borderRadius: 6,
                border: '1px solid #ffffff08',
              }}
            >
              <span
                style={{
                  color: '#dbc19a',
                }}
              >
                Intel Bank
              </span>

              <strong
                style={{
                  color: '#dbc19a',
                }}
              >
                {char.intel} / {char.maxIntel}
              </strong>
            </div>
          </div>

          {c.length > 0 && (
            <div
              style={{
                marginTop: 20,
                paddingTop: 15,
                borderTop: '1px solid #ffffff10',
              }}
            >
              <b
                style={{
                  color: '#a08568',
                  display: 'block',
                  fontSize: '0.85rem',
                  marginBottom: 10,
                }}
              >
                Other Currencies
              </b>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 10,
                }}
              >
                {c.map((row, idx) => (
                  <span
                    key={idx}
                    style={{
                      backgroundColor: '#ffffff04',
                      border: '1px solid #ffffff10',
                      padding: '6px 12px',
                      borderRadius: 6,
                      fontSize: '0.85rem',
                      color: '#dbc19a',
                    }}
                  >
                    {row?.label}:{' '}
                    <strong>
                      {row?.balance}
                    </strong>
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Bases */}
        <section
          style={{
            backgroundColor: '#1d120c',
            border: '1px solid #3c2415',
            padding: 25,
            borderRadius: 12,
            marginBottom: 30,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 15,
              marginBottom: 20,
            }}
          >
            <h2
              style={{
                fontSize: '1.2rem',
                margin: 0,
                fontFamily: 'Georgia, serif',
                color: '#ffe2a9',
                borderBottom:
                  '1px solid #ffffff10',
                paddingBottom: 10,
                flex: 1,
              }}
            >
              Bases
            </h2>

            {basesLoading && (
              <span
                style={{
                  color: '#7f6953',
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Updating...
              </span>
            )}
          </div>

          {bases.length === 0 ? (
            <div
              style={{
                padding: 20,
                borderRadius: 8,
                backgroundColor: '#ffffff04',
                border: '1px solid #ffffff08',
                textAlign: 'center',
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: '#a08568',
                }}
              >
                No registered bases found.
              </p>
            </div>
          ) : (
            /*
             * One base per row.
             * These are intentionally full-width slot cards.
             */
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 15,
              }}
            >
              {bases.map((base, index) => {
                const baseId =
                  getBaseId(base);

                const baseName =
                  base?.name ||
                  base?.baseName ||
                  base?.title ||
                  `Base ${index + 1}`;

                const baseType =
                  base?.base_type ||
                  base?.baseType ||
                  'Unknown Base';

                const owner =
                  base?.owner_name ||
                  base?.ownerName ||
                  base?.owner ||
                  'Unknown';

                const relationship =
                  base?.relationship ||
                  'Owner';

                const sharedWith =
                  getSharedWith(base);

                const runtimeSeconds =
                  getGeneratorSeconds(base);

                const powerPercent =
                  clampPercent(
                    (runtimeSeconds /
                      MAX_POWER_SECONDS) *
                      100
                  );

                const daysRemaining =
                  runtimeSeconds /
                  (24 * 60 * 60);

                const fullDays =
                  Math.floor(daysRemaining);

                const remainingHours =
                  Math.floor(
                    (daysRemaining -
                      fullDays) *
                      24
                  );

                const telemetry =
                  baseId
                    ? basesTelemetry[baseId]
                    : null;

                const water =
                  telemetry?.water
                    ? getWaterData(
                        telemetry.water
                      )
                    : null;

                const blood =
                  telemetry?.water
                    ? getBloodData(
                        telemetry.water
                      )
                    : null;

                const inventoryRoot =
                  telemetry?.inventory?.data ??
                  telemetry?.inventory ??
                  null;

                const storageUsed =
                  inventoryRoot
                    ? getUsedStorageFromInventory(
                        telemetry.inventory
                      )
                    : null;

                const storageMax =
                  inventoryRoot
                    ? getCapacityFromInventory(
                        telemetry.inventory
                      )
                    : null;

                const storagePercent =
                  getStoragePercent(
                    storageUsed,
                    storageMax
                  );

                const powerColor =
                  getPowerColor(
                    powerPercent
                  );

                const waterColor =
                  water &&
                  water.percent <= 10
                    ? '#ff4a4a'
                    : water &&
                        water.percent <= 25
                      ? '#e5b85c'
                      : '#4a90e2';

                const storageColor =
                  getStorageColor(
                    storagePercent
                  );

                const key =
                  baseId || index;

                return (
                  <div
                    key={key}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: 20,
                      backgroundColor:
                        '#ffffff04',
                      border:
                        '1px solid #ffffff08',
                      borderRadius: 10,
                    }}
                  >
                    {/* Base Header */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent:
                          'space-between',
                        alignItems:
                          'flex-start',
                        gap: 15,
                        flexWrap: 'wrap',
                        marginBottom: 18,
                      }}
                    >
                      <div
                        style={{
                          minWidth: 0,
                        }}
                      >
                        <strong
                          style={{
                            display: 'block',
                            color: '#ffe2a9',
                            fontSize:
                              '1.15rem',
                            marginBottom: 5,
                            wordBreak:
                              'break-word',
                          }}
                        >
                          {baseName}
                        </strong>

                        <span
                          style={{
                            color: '#a08568',
                            fontSize:
                              '0.8rem',
                          }}
                        >
                          {baseType}
                        </span>
                      </div>

                      <span
                        style={{
                          padding:
                            '5px 9px',
                          borderRadius: 5,
                          backgroundColor:
                            relationship
                              .toLowerCase()
                              .includes(
                                'owner'
                              )
                              ? 'rgba(82, 250, 124, 0.08)'
                              : 'rgba(205, 162, 107, 0.08)',
                          border:
                            relationship
                              .toLowerCase()
                              .includes(
                                'owner'
                              )
                              ? '1px solid rgba(82, 250, 124, 0.2)'
                              : '1px solid rgba(205, 162, 107, 0.2)',
                          color:
                            relationship
                              .toLowerCase()
                              .includes(
                                'owner'
                              )
                              ? '#8fffa9'
                              : '#cda26b',
                          fontSize:
                            '0.7rem',
                          fontWeight:
                            'bold',
                          textTransform:
                            'uppercase',
                          letterSpacing:
                            '0.5px',
                        }}
                      >
                        {relationship}
                      </span>
                    </div>

                    {/* Owner */}
                    <div
                      style={{
                        padding: 12,
                        backgroundColor:
                          '#ffffff04',
                        borderRadius: 6,
                        marginBottom: 10,
                      }}
                    >
                      <div
                        style={{
                          color: '#7f6953',
                          fontSize:
                            '0.7rem',
                          textTransform:
                            'uppercase',
                          marginBottom: 4,
                        }}
                      >
                        Owner
                      </div>

                      <div
                        style={{
                          color: '#dbc19a',
                          fontSize:
                            '0.9rem',
                        }}
                      >
                        {owner}
                      </div>
                    </div>

                    {/* Shared With */}
                    <div
                      style={{
                        padding: 12,
                        backgroundColor:
                          '#ffffff04',
                        borderRadius: 6,
                        marginBottom: 18,
                      }}
                    >
                      <div
                        style={{
                          color: '#7f6953',
                          fontSize:
                            '0.7rem',
                          textTransform:
                            'uppercase',
                          marginBottom: 8,
                        }}
                      >
                        Shared With
                      </div>

                      {sharedWith.length ===
                      0 ? (
                        <span
                          style={{
                            color:
                              '#7f6953',
                            fontSize:
                              '0.8rem',
                          }}
                        >
                          No shared members
                        </span>
                      ) : (
                        <div
                          style={{
                            display: 'flex',
                            flexDirection:
                              'column',
                            gap: 7,
                          }}
                        >
                          {sharedWith.map(
                            (
                              member,
                              memberIndex
                            ) => (
                              <div
                                key={
                                  `${member?.name || 'member'}-${memberIndex}`
                                }
                                style={{
                                  display:
                                    'flex',
                                  justifyContent:
                                    'space-between',
                                  alignItems:
                                    'center',
                                  gap: 10,
                                  flexWrap:
                                    'wrap',
                                }}
                              >
                                <span
                                  style={{
                                    color:
                                      '#dbc19a',
                                    fontSize:
                                      '0.85rem',
                                  }}
                                >
                                  {member?.name ||
                                    'Unknown'}
                                </span>

                                <span
                                  style={{
                                    color:
                                      '#cda26b',
                                    fontSize:
                                      '0.72rem',
                                  }}
                                >
                                  {member
                                    ?.label ||
                                    'Member'}
                                  {member
                                    ?.rank !==
                                    undefined
                                    ? ` · Rank ${member.rank}`
                                    : ''}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>

                    {/* Generator Power */}
                    <div
                      style={{
                        paddingTop: 15,
                        borderTop:
                          '1px solid #ffffff10',
                        marginBottom: 20,
                      }}
                    >
                      <div
                        style={{
                          display:
                            'flex',
                          justifyContent:
                            'space-between',
                          alignItems:
                            'center',
                          gap: 10,
                          marginBottom: 8,
                        }}
                      >
                        <span
                          style={{
                            color:
                              '#a08568',
                            fontSize:
                              '0.8rem',
                            textTransform:
                              'uppercase',
                            letterSpacing:
                              '0.5px',
                          }}
                        >
                          Generator Power
                        </span>

                        <strong
                          style={{
                            color:
                              powerColor,
                            fontSize:
                              '0.85rem',
                          }}
                        >
                          {powerPercent.toFixed(
                            1
                          )}
                          %
                        </strong>
                      </div>

                      <div
                        style={{
                          width: '100%',
                          height: 10,
                          backgroundColor:
                            '#ffffff0a',
                          borderRadius:
                            999,
                          overflow:
                            'hidden',
                          border:
                            '1px solid #ffffff08',
                        }}
                      >
                        <div
                          style={{
                            width: `${powerPercent}%`,
                            height: '100%',
                            borderRadius:
                              999,
                            backgroundColor:
                              powerColor,
                            boxShadow:
                              powerPercent >
                              0
                                ? `0 0 8px ${powerColor}55`
                                : 'none',
                            transition:
                              'width 0.5s ease',
                          }}
                        />
                      </div>

                      <div
                        style={{
                          display:
                            'flex',
                          justifyContent:
                            'space-between',
                          alignItems:
                            'center',
                          marginTop: 7,
                        }}
                      >
                        <span
                          style={{
                            color:
                              '#7f6953',
                            fontSize:
                              '0.7rem',
                          }}
                        >
                          0 days
                        </span>

                        <span
                          style={{
                            color:
                              powerPercent <=
                              10
                                ? '#ff8b8b'
                                : '#dbc19a',
                            fontSize:
                              '0.75rem',
                            fontWeight:
                              'bold',
                          }}
                        >
                          {fullDays}d{' '}
                          {remainingHours}h
                          {' remaining'}
                        </span>

                        <span
                          style={{
                            color:
                              '#7f6953',
                            fontSize:
                              '0.7rem',
                          }}
                        >
                          42 days
                        </span>
                      </div>
                    </div>

                    {/* Storage */}
                    <div
                      style={{
                        paddingTop: 15,
                        borderTop:
                          '1px solid #ffffff10',
                        marginBottom: 20,
                      }}
                    >
                      <div
                        style={{
                          display:
                            'flex',
                          justifyContent:
                            'space-between',
                          alignItems:
                            'center',
                          gap: 10,
                          marginBottom: 8,
                        }}
                      >
                        <span
                          style={{
                            color:
                              '#a08568',
                            fontSize:
                              '0.8rem',
                            textTransform:
                              'uppercase',
                            letterSpacing:
                              '0.5px',
                          }}
                        >
                          Base Storage
                        </span>

                        <strong
                          style={{
                            color:
                              storageColor,
                            fontSize:
                              '0.85rem',
                          }}
                        >
                          {storagePercent !==
                          null
                            ? `${storagePercent.toFixed(
                                1
                              )}%`
                            : 'N/A'}
                        </strong>
                      </div>

                      <div
                        style={{
                          width: '100%',
                          height: 10,
                          backgroundColor:
                            '#ffffff0a',
                          borderRadius:
                            999,
                          overflow:
                            'hidden',
                          border:
                            '1px solid #ffffff08',
                        }}
                      >
                        <div
                          style={{
                            width:
                              storagePercent !==
                              null
                                ? `${storagePercent}%`
                                : '0%',
                            height: '100%',
                            borderRadius:
                              999,
                            backgroundColor:
                              storageColor,
                            boxShadow:
                              storagePercent !==
                                null &&
                              storagePercent >
                                0
                                ? `0 0 8px ${storageColor}55`
                                : 'none',
                            transition:
                              'width 0.5s ease',
                          }}
                        />
                      </div>

                      <div
                        style={{
                          display:
                            'flex',
                          justifyContent:
                            'space-between',
                          alignItems:
                            'center',
                          gap: 10,
                          marginTop: 7,
                          flexWrap:
                            'wrap',
                        }}
                      >
                        <span
                          style={{
                            color:
                              '#7f6953',
                            fontSize:
                              '0.7rem',
                          }}
                        >
                          Stored
                        </span>

                        <span
                          style={{
                            color:
                              '#dbc19a',
                            fontSize:
                              '0.75rem',
                            fontWeight:
                              'bold',
                          }}
                        >
                          {storageUsed !==
                          null
                            ? storageMax !==
                              null
                              ? `${formatStorage(
                                  storageUsed
                                )} / ${formatStorage(
                                  storageMax
                                )}`
                              : `${formatStorage(
                                  storageUsed
                                )} stored`
                            : 'Storage data unavailable'}
                        </span>
                      </div>
                    </div>

                    {/* Water */}
                    <div
                      style={{
                        paddingTop: 15,
                        borderTop:
                          '1px solid #ffffff10',
                      }}
                    >
                      <div
                        style={{
                          display:
                            'flex',
                          justifyContent:
                            'space-between',
                          alignItems:
                            'center',
                          gap: 10,
                          marginBottom: 8,
                        }}
                      >
                        <span
                          style={{
                            color:
                              '#a08568',
                            fontSize:
                              '0.8rem',
                            textTransform:
                              'uppercase',
                            letterSpacing:
                              '0.5px',
                          }}
                        >
                          Water Storage
                        </span>

                        <strong
                          style={{
                            color:
                              water
                                ? waterColor
                                : '#a08568',
                            fontSize:
                              '0.85rem',
                          }}
                        >
                          {water
                            ? `${water.percent.toFixed(
                                1
                              )}%`
                            : 'N/A'}
                        </strong>
                      </div>

                      <div
                        style={{
                          width: '100%',
                          height: 10,
                          backgroundColor:
                            '#ffffff0a',
                          borderRadius:
                            999,
                          overflow:
                            'hidden',
                          border:
                            '1px solid #ffffff08',
                        }}
                      >
                        <div
                          style={{
                            width:
                              water
                                ? `${water.percent}%`
                                : '0%',
                            height: '100%',
                            borderRadius:
                              999,
                            backgroundColor:
                              waterColor,
                            boxShadow:
                              water &&
                              water.percent >
                                0
                                ? `0 0 8px ${waterColor}55`
                                : 'none',
                            transition:
                              'width 0.5s ease',
                          }}
                        />
                      </div>

                      <div
                        style={{
                          display:
                            'flex',
                          justifyContent:
                            'space-between',
                          alignItems:
                            'center',
                          gap: 10,
                          marginTop: 7,
                          flexWrap:
                            'wrap',
                        }}
                      >
                        <span
                          style={{
                            color:
                              '#7f6953',
                            fontSize:
                              '0.7rem',
                          }}
                        >
                          {water
                            ? `${water.containerCount} container${
                                water.containerCount ===
                                1
                                  ? ''
                                  : 's'
                              }`
                            : 'Water data unavailable'}
                        </span>

                        <span
                          style={{
                            color:
                              '#dbc19a',
                            fontSize:
                              '0.75rem',
                            fontWeight:
                              'bold',
                          }}
                        >
                          {water &&
                          water.current !==
                            null
                            ? water.max !==
                              null
                              ? `${formatVolume(
                                  water.current
                                )} / ${formatVolume(
                                  water.max
                                )}`
                              : `${formatVolume(
                                  water.current
                                )} stored`
                            : '—'}
                        </span>
                      </div>

                      {/* Blood Purifier Data */}
                      {blood &&
                        blood.current !==
                          null && (
                          <div
                            style={{
                              marginTop: 12,
                              paddingTop: 12,
                              borderTop:
                                '1px solid #ffffff08',
                            }}
                          >
                            <div
                              style={{
                                display:
                                  'flex',
                                justifyContent:
                                  'space-between',
                                alignItems:
                                  'center',
                                gap: 10,
                              }}
                            >
                              <span
                                style={{
                                  color:
                                    '#7f6953',
                                  fontSize:
                                    '0.7rem',
                                  textTransform:
                                    'uppercase',
                                }}
                              >
                                Blood Purifier
                              </span>

                              <strong
                                style={{
                                  color:
                                    '#c98787',
                                  fontSize:
                                    '0.75rem',
                                }}
                              >
                                {blood.percent !==
                                null
                                  ? `${blood.percent.toFixed(
                                      1
                                    )}%`
                                  : 'N/A'}
                              </strong>
                            </div>

                            <div
                              style={{
                                marginTop: 5,
                                color:
                                  '#a08568',
                                fontSize:
                                  '0.72rem',
                              }}
                            >
                              {blood.max !==
                              null
                                ? `${formatVolume(
                                    blood.current
                                  )} / ${formatVolume(
                                    blood.max
                                  )}`
                                : `${formatVolume(
                                    blood.current
                                  )} stored`}
                            </div>
                          </div>
                        )}

                      {telemetry?.waterError && (
                        <div
                          style={{
                            marginTop: 8,
                            color: '#7f6953',
                            fontSize: '0.65rem',
                          }}
                        >
                          Water telemetry unavailable
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}