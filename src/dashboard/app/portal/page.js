'use client';

import React, { useState, useEffect } from 'react';
import PortalTabs from '../components/tabs/PortalTabs';

export default function PlayerPortal() {
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadPlayerData() {
    try {
      const res = await fetch('/api/player', {
        cache: 'no-store',
      });

      if (!res.ok) return;

      const data = await res.json();
      setPlayer(data);
    } catch (err) {
      console.error('Failed to fetch player attributes:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlayerData();

    const interval = setInterval(loadPlayerData, 15000);

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
          Synchronizing with Dune Awakening Console telemetry...
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
              padding: '30px',
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
              Please link your character in-game or via the
              Discord server integrations panel first.
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

  const char = {
    name: player.characterName || 'Unknown Character',
    status: player.onlineStatus || 'Offline',
    level: p.level ?? '—',
    xp: p.xp ?? '—',
    intel: i.intel ?? 0,
    maxIntel: i.maxIntel ?? 0,
    solaris: solarisCoin.total ?? 0,
    health: Math.round(v.currentHealth ?? 100),
    maxHealth: Math.round(v.maxHealth ?? 100),
    hydration: Math.round(v.hydration ?? 100),
  };

  const pct = (current, max) =>
    max
      ? Math.max(
          0,
          Math.min(
            100,
            (Number(current) / Number(max)) * 100
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
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span
              style={{
                height: 10,
                width: 10,
                flexShrink: 0,
                backgroundColor: isOnline
                  ? '#52fa7c'
                  : '#ff4a4a',
                borderRadius: '50%',
                display: 'inline-block',
                boxShadow: isOnline
                  ? '0 0 8px #52fa7c'
                  : 'none',
              }}
            />

            <span
              style={{
                color: '#f3d39b',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
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

        {/* Character heading */}

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
              <span style={{ color: '#dbc19a' }}>
                Solaris Coin
              </span>

              <strong style={{ color: '#d2a85a' }}>
                {Number(char.solaris).toLocaleString()}
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
              <span style={{ color: '#dbc19a' }}>
                Intel Bank
              </span>

              <strong style={{ color: '#dbc19a' }}>
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
                    {row.label}:{' '}
                    <strong>{row.balance}</strong>
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Admin */}

        <div
          style={{
            display: 'flex',
            gap: 15,
            flexWrap: 'wrap',
          }}
        >
          <a
            href="/dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #c58b45',
              color: '#e9c98e',
              padding: '12px 24px',
              borderRadius: 999,
              textDecoration: 'none',
              fontSize: '0.9rem',
            }}
          >
            Admin Control Center
          </a>
        </div>
      </div>
    </main>
  );
}