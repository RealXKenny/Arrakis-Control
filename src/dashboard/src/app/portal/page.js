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
  }, []);

  if (loading) {
    return (
      <main style={{ maxWidth: '800px', margin: '60px auto', padding: '0 20px', fontFamily: 'system-ui, sans-serif', textAlign: 'center', color: '#a08568' }}>
        <p>Synchronizing with Dune Awakening Console telemetry...</p>
      </main>
    );
  }

  const char = player?.character || {
    status: "Offline",
    level: 0,
    progress: "0%",
    intel: 0,
    solaris: 0,
    credits: 0,
    scrip: 0,
    health: 0,
    hydration: 0,
    spiceAddiction: 0
  };

  return (
    <main style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ height: '10px', width: '10px', backgroundColor: char.status === 'Online' ? '#52fa7c' : '#ff4a4a', borderRadius: '50%', display: 'inline-block' }}></span>
          <span style={{ color: '#f3d39b', fontWeight: 'bold', fontSize: '0.9rem' }}>CHARACTER PORTAL</span>
        </div>
        <a href="/api/auth/logout" style={{ color: '#cda26b', textDecoration: 'none', fontSize: '0.9rem' }}>Sign out</a>
      </div>

      <h1 style={{ fontSize: '2.2rem', margin: '0 0 5px 0' }}>Arrakis Survivor Log</h1>
      <p style={{ color: '#a08568', margin: '0 0 30px 0' }}>Live character vitals and infrastructure metrics</p>

      {/* Vitals Grid */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '30px' }}>
        <div style={{ backgroundColor: '#1d120c', border: '1px solid #3c2415', padding: '20px', borderRadius: '6px' }}>
          <b style={{ display: 'block', color: '#a08568', fontSize: '0.85rem', marginBottom: '5px' }}>Health</b>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff4a4a' }}>{char.health}/100</div>
        </div>
        <div style={{ backgroundColor: '#1d120c', border: '1px solid #3c2415', padding: '20px', borderRadius: '6px' }}>
          <b style={{ display: 'block', color: '#a08568', fontSize: '0.85rem', marginBottom: '5px' }}>Hydration</b>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4a90e2' }}>{char.hydration}/100</div>
        </div>
        <div style={{ backgroundColor: '#1d120c', border: '1px solid #3c2415', padding: '20px', borderRadius: '6px' }}>
          <b style={{ display: 'block', color: '#a08568', fontSize: '0.85rem', marginBottom: '5px' }}>Spice Addiction</b>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#deeppink' }}>{char.spiceAddiction}%</div>
        </div>
      </section>

      {/* Progression & Currencies */}
      <section style={{ backgroundColor: '#1d120c', border: '1px solid #2a1a0f', padding: '25px', borderRadius: '6px', marginBottom: '30px' }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#cda26b' }}>Progression & Economy</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <span style={{ color: '#a08568' }}>Character Level</span>
          <span style={{ color: '#f3d39b', fontWeight: 'bold' }}>Lv {char.level} ({char.progress})</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingTop: '10px', borderTop: '1px solid #23150d' }}>
          <div style={{ color: '#a08568' }}>Solaris Coins: <span style={{ color: '#f3d39b', fontWeight: 'bold' }}>{char.solaris}</span></div>
          <div style={{ color: '#a08568' }}>Scrip: <span style={{ color: '#f3d39b', fontWeight: 'bold' }}>{char.scrip}</span></div>
          <div style={{ color: '#a08568' }}>Intel: <span style={{ color: '#f3d39b', fontWeight: 'bold' }}>{char.intel}</span></div>
          <div style={{ color: '#a08568' }}>Credits: <span style={{ color: '#f3d39b', fontWeight: 'bold' }}>{char.credits}</span></div>
        </div>
      </section>

      <div style={{ display: 'flex', gap: '15px' }}>
        <a href="/map" style={{ display: 'inline-block', backgroundColor: '#cda26b', color: '#120a06', padding: '10px 20px', borderRadius: '4px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 'bold' }}>
          Open Hagga Basin Map
        </a>
        <a href="/dashboard" style={{ display: 'inline-block', border: '1px solid #3c2415', color: '#a08568', padding: '10px 20px', borderRadius: '4px', textDecoration: 'none', fontSize: '0.9rem' }}>
          System Administration Center
        </a>
      </div>
    </main>
  );
}