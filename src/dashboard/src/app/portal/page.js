'use client';

import React, { useState, useEffect } from 'react';

export default function PlayerPortal() {
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadPlayerData() {
    try {
      const res = await fetch('/api/player');
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
      <main style={{ maxWidth: '800px', margin: '60px auto', padding: '0 20px', fontFamily: 'system-ui, sans-serif', textAlign: 'center', color: '#a08568' }}>
        <p>Synchronizing with Dune Awakening Console telemetry...</p>
      </main>
    );
  }

  if (!player?.linked) {
    return (
      <main style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ backgroundColor: '#1d120c', border: '1px solid #3c2415', padding: '30px', borderRadius: '8px', textAlign: 'center' }}>
          <b style={{ color: '#ff4a4a', fontSize: '1.2rem', display: 'block', marginBottom: '10px' }}>No Linked Dune Character Found</b>
          <p style={{ color: '#a08568', margin: '0' }}>Please link your character in-game or via the Discord server integrations panel first.</p>
          <a href="/dashboard" style={{ display: 'inline-block', marginTop: '20px', color: '#cda26b', textDecoration: 'none' }}>← Return to Admin Panel</a>
        </div>
      </main>
    );
  }

  // De-structure your exact working console client data trees
  const x = player.details || {};
  const p = x.progression || {};
  const i = x.intel || {};
  const v = x.vitals || {};
  const c = x.currency?.rows || [];
  const solarisCoin = x['solaris-coin'] || {};

  const char = {
    name: player.characterName || "Unknown Character",
    status: player.onlineStatus || "Offline",
    level: p.level ?? "—",
    xp: p.xp ?? "—",
    intel: i.intel ?? 0,
    maxIntel: i.maxIntel ?? 0,
    solaris: solarisCoin.total ?? 0,
    health: Math.round(v.currentHealth ?? 100),
    maxHealth: Math.round(v.maxHealth ?? 100),
    hydration: Math.round(v.hydration ?? 100)
  };

  const pct = (current, max) => max ? Math.max(0, Math.min(100, (Number(current) / Number(max)) * 100)) : 0;

  return (
    <main style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ height: '10px', width: '10px', backgroundColor: char.status.toLowerCase().includes('online') ? '#52fa7c' : '#ff4a4a', borderRadius: '50%', display: 'inline-block', boxShadow: char.status.toLowerCase().includes('online') ? '0 0 8px #52fa7c' : 'none' }}></span>
          <span style={{ color: '#f3d39b', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase' }}>{char.status}</span>
        </div>
        <a href="/api/auth/logout" style={{ backgroundColor: '#1d120c', color: '#cda26b', border: '1px solid #3c2415', padding: '8px 16px', borderRadius: '4px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 'bold' }}>Sign out</a>
      </div>

      <p style={{ textTransform: 'uppercase', letterSpacing: '2px', color: '#cda26b', fontSize: '0.85rem', margin: '0 0 5px 0' }}>Arrakis Survivor Log</p>
      <h1 style={{ fontSize: '2.5rem', margin: '0 0 30px 0', fontFamily: 'Georgia, serif', color: '#ffe2a9' }}>{char.name}</h1>

      {/* Vitals Section */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '30px' }}>
        <div style={{ backgroundColor: '#1d120c', border: '1px solid #3c2415', padding: '20px', borderRadius: '12px', position: 'relative', overflow: 'hidden' }}>
          <b style={{ display: 'block', color: '#a08568', fontSize: '0.85rem', marginBottom: '8px' }}>Health</b>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#ffe2a9', marginBottom: '8px' }}>{char.health} / {char.maxHealth}</div>
          <div style={{ height: '4px', backgroundColor: '#ffffff10', borderRadius: '2px' }}><i style={{ display: 'block', height: '100%', backgroundColor: '#ff4a4a', width: `${pct(char.health, char.maxHealth)}%`, borderRadius: '2px' }}></i></div>
        </div>
        <div style={{ backgroundColor: '#1d120c', border: '1px solid #3c2415', padding: '20px', borderRadius: '12px', position: 'relative', overflow: 'hidden' }}>
          <b style={{ display: 'block', color: '#a08568', fontSize: '0.85rem', marginBottom: '8px' }}>Hydration</b>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#ffe2a9', marginBottom: '8px' }}>{char.hydration} / 100</div>
          <div style={{ height: '4px', backgroundColor: '#ffffff10', borderRadius: '2px' }}><i style={{ display: 'block', height: '100%', backgroundColor: '#4a90e2', width: `${char.hydration}%`, borderRadius: '2px' }}></i></div>
        </div>
        <div style={{ backgroundColor: '#1d120c', border: '1px solid #3c2415', padding: '20px', borderRadius: '12px', position: 'relative', overflow: 'hidden' }}>
          <b style={{ display: 'block', color: '#a08568', fontSize: '0.85rem', marginBottom: '8px' }}>Rank & XP</b>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f3d39b', marginBottom: '8px' }}>Level {char.level}</div>
          <small style={{ color: '#a08568', fontSize: '0.75rem' }}>XP: {char.xp}</small>
        </div>
      </section>

      {/* Progression & Economy */}
      <section style={{ backgroundColor: '#1d120c', border: '1px solid #3c2415', padding: '25px', borderRadius: '12px', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.2rem', margin: '0 0 20px 0', fontFamily: 'Georgia, serif', color: '#ffe2a9', borderBottom: '1px solid #ffffff10', paddingBottom: '10px' }}>Inventory & Assets</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#ffffff04', borderRadius: '6px', border: '1px solid #ffffff08' }}>
            <span style={{ color: '#dbc19a' }}>Solaris Coin</span>
            <strong style={{ color: '#d2a85a' }}>{char.solaris.toLocaleString()}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#ffffff04', borderRadius: '6px', border: '1px solid #ffffff08' }}>
            <span style={{ color: '#dbc19a' }}>Intel Bank</span>
            <strong style={{ color: '#dbc19a' }}>{char.intel} / {char.maxIntel}</strong>
          </div>
        </div>

        {c.length > 0 && (
          <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #ffffff10' }}>
            <b style={{ color: '#a08568', display: 'block', fontSize: '0.85rem', marginBottom: '10px' }}>Other Currencies</b>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {c.map((row, idx) => (
                <span key={idx} style={{ backgroundColor: '#ffffff04', border: '1px solid #ffffff10', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', color: '#dbc19a' }}>
                  {row.label}: <strong>{row.balance}</strong>
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      <div style={{ display: 'flex', gap: '15px' }}>
        <a href="/map" style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#c58b45', color: '#1b0e07', padding: '12px 24px', borderRadius: '999px', textDecoration: 'none', fontWeight: '800', fontSize: '0.9rem' }}>Open Live Map</a>
        <a href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #c58b45', color: '#e9c98e', padding: '12px 24px', borderRadius: '999px', textDecoration: 'none', fontSize: '0.9rem' }}>Admin Control Center</a>
      </div>
    </main>
  );
}