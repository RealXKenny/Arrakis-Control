'use client';

import React, { useEffect, useState } from 'react';
import PortalTabs from '../components/tabs/PortalTabs';

export default function PlayerPortal() {
  const [player, setPlayer] = useState(null);
  const [bases, setBases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [basesLoading, setBasesLoading] = useState(false);

  async function loadPlayerData() {
    try {
      const res = await fetch('/api/player', {
        cache: 'no-store',
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('Player API error:', data);
        setPlayer({
          linked: false,
          error: data?.error || 'Unable to load player profile.',
        });
        return;
      }

      setPlayer(data);

      // Only load bases after we know the player is linked.
      if (data?.linked === true) {
        loadBases();
      } else {
        setBases([]);
        setBasesLoading(false);
      }
    } catch (err) {
      console.error('Failed to fetch player attributes:', err);

      setPlayer({
        linked: false,
        error: 'Unable to load your Dune player profile right now.',
      });
    } finally {
      setLoading(false);
    }
  }

  async function loadBases() {
    try {
      setBasesLoading(true);

      const res = await fetch('/api/bases?page=1&pageSize=100', {
        cache: 'no-store',
      });

      if (!res.ok) {
        console.error('Bases API request failed:', res.status);
        setBases([]);
        return;
      }

      const data = await res.json();

      // Supports:
      // { rows: [...] }
      // { data: [...] }
      // or simply [...]
      const rows = Array.isArray(data)
        ? data
        : Array.isArray(data?.rows)
          ? data.rows
          : Array.isArray(data?.data)
            ? data.data
            : [];

      setBases(rows);
    } catch (err) {
      console.error('Failed to fetch player bases:', err);
      setBases([]);
    } finally {
      setBasesLoading(false);
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
        <p>Synchronizing with Dune Awakening Console telemetry...</p>
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
              {player?.error ||
                'Please link your character in-game or via the Discord server integrations panel first.'}
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

  const c = Array.isArray(x.currency?.rows)
    ? x.currency.rows
    : [];

  const solarisCoin = x['solaris-coin'] || {};

  const char = {
    name: player.characterName || 'Unknown Character',
    status: player.onlineStatus || 'Offline',
    level: p.level ?? '—',
    xp: p.xp ?? '—',
    intel: i.intel ?? 0,
    maxIntel: i.maxIntel ?? 0,
    solaris: solarisCoin.total ?? 0,
    health: Math.round(Number(v.currentHealth ?? 100)),
    maxHealth: Math.round(Number(v.maxHealth ?? 100)),
    hydration: Math.round(Number(v.hydration ?? 100)),
  };

  const pct = (current, max) => {
    const currentNumber = Number(current);
    const maxNumber = Number(max);

    if (!Number.isFinite(currentNumber) || !Number.isFinite(maxNumber) || maxNumber <= 0) {
      return 0;
    }

    return Math.max(
      0,
      Math.min(100, (currentNumber / maxNumber) * 100)
    );
  };

  const isOnline = String(char.status).toLowerCase().includes('online');

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
          {/* Online / Offline Status */}
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
                backgroundColor: isOnline ? '#52fa7c' : '#ff4a4a',
                borderRadius: '50%',
                display: 'inline-block',
                boxShadow: isOnline
                  ? '0 0 8px #52fa7c'
                  : '0 0 8px rgba(255, 74, 74, 0.45)',
              }}
            />

            <span
              style={{
                color: isOnline ? '#8fffa9' : '#e58b8b',
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

          {/* Sign Out */}
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
                  width: `${pct(char.health, char.maxHealth)}%`,
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
                  width: `${pct(char.hydration, 100)}%`,
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
            {/* Solaris Coin */}
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
              <span style={{ color: '#dbc19a' }}>
                Solaris Coin
              </span>

              <strong style={{ color: '#d2a85a' }}>
                {Number(char.solaris).toLocaleString()}
              </strong>
            </div>

            {/* Intel Bank */}
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
              <span style={{ color: '#dbc19a' }}>
                Intel Bank
              </span>

              <strong style={{ color: '#dbc19a' }}>
                {char.intel} / {char.maxIntel}
              </strong>
            </div>
          </div>

          {/* Other Currencies */}
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
                    key={row?.id ?? row?.key ?? idx}
                    style={{
                      backgroundColor: '#ffffff04',
                      border: '1px solid #ffffff10',
                      padding: '6px 12px',
                      borderRadius: 6,
                      fontSize: '0.85rem',
                      color: '#dbc19a',
                    }}
                  >
                    {row?.label ?? row?.name ?? 'Currency'}:{' '}
                    <strong>
                      {row?.balance ?? row?.amount ?? 0}
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
            Bases
          </h2>

          {basesLoading ? (
            <p
              style={{
                margin: 0,
                color: '#a08568',
                fontSize: '0.9rem',
              }}
            >
              Loading base telemetry...
            </p>
          ) : bases.length === 0 ? (
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
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 15,
              }}
            >
              {bases.map((base, index) => {
                const baseName =
                  base?.name ||
                  base?.baseName ||
                  base?.title ||
                  `Base ${index + 1}`;

                const baseLocation =
                  base?.location ||
                  base?.coordinates ||
                  base?.position;

                const baseRegion =
                  base?.region ||
                  base?.zone ||
                  base?.area;

                const baseLevel =
                  base?.level ??
                  base?.baseLevel;

                const baseKey =
                  base?.id ??
                  base?.baseId ??
                  base?.uuid ??
                  index;

                return (
                  <div
                    key={baseKey}
                    style={{
                      padding: 16,
                      backgroundColor: '#ffffff04',
                      border: '1px solid #ffffff08',
                      borderRadius: 8,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: 10,
                        marginBottom: 12,
                      }}
                    >
                      <strong
                        style={{
                          color: '#ffe2a9',
                          fontSize: '1rem',
                        }}
                      >
                        {baseName}
                      </strong>

                      {base?.status && (
                        <span
                          style={{
                            color: '#8fffa9',
                            fontSize: '0.7rem',
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                          }}
                        >
                          {base.status}
                        </span>
                      )}
                    </div>

                    {baseLocation && (
                      <div
                        style={{
                          marginBottom: 10,
                          color: '#a08568',
                          fontSize: '0.8rem',
                        }}
                      >
                        Location

                        <div
                          style={{
                            color: '#dbc19a',
                            marginTop: 3,
                            wordBreak: 'break-word',
                          }}
                        >
                          {typeof baseLocation === 'object'
                            ? JSON.stringify(baseLocation)
                            : String(baseLocation)}
                        </div>
                      </div>
                    )}

                    {baseRegion && (
                      <div
                        style={{
                          marginBottom: 10,
                          color: '#a08568',
                          fontSize: '0.8rem',
                        }}
                      >
                        Region

                        <div
                          style={{
                            color: '#dbc19a',
                            marginTop: 3,
                          }}
                        >
                          {String(baseRegion)}
                        </div>
                      </div>
                    )}

                    {baseLevel != null && (
                      <div
                        style={{
                          color: '#a08568',
                          fontSize: '0.8rem',
                        }}
                      >
                        Level

                        <strong
                          style={{
                            display: 'block',
                            marginTop: 3,
                            color: '#d2a85a',
                          }}
                        >
                          {String(baseLevel)}
                        </strong>
                      </div>
                    )}
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