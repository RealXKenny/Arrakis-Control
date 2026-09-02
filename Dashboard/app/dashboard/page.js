'use client';

import React, { useState, useEffect } from 'react';
import { requestJson } from '../utils/requestCache';

const STATS_CACHE_TTL = 60_000;

export default function OwnerDashboard() {
  const [stats, setStats] = useState({ uptime: '...', memoryMb: '...', shards: [], guilds: [] });
  const [loading, setLoading] = useState(true);

  async function refreshStats() {
    try {
      const data = await requestJson('/api/stats', {
        ttl: STATS_CACHE_TTL,
      });
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch telemetry data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function restartBot() {
    if (!confirm('Are you sure you want to request a bot restart?')) return;
    try {
      const res = await fetch('/api/control/restart', { method: 'POST' });
      if (res.ok) {
        alert('Restart request submitted successfully.');
      } else {
        alert('Failed to submit restart request.');
      }
    } catch (err) {
      console.error('Error submitting bot control command:', err);
    }
  }

  useEffect(() => {
    refreshStats();
    const interval = setInterval(() => {
      if (!document.hidden) refreshStats();
    }, STATS_CACHE_TTL);
    const handleVisibilityChange = () => {
      if (!document.hidden) refreshStats();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <main style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <span style={{ backgroundColor: '#ff4a4a', color: '#fff', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
          OWNER ACCESS
        </span>
        <a href="/api/auth/logout" style={{ color: '#cda26b', textDecoration: 'none', fontSize: '0.9rem' }}>
          Sign out
        </a>
      </div>

      <p style={{ textTransform: 'uppercase', letterSpacing: '2px', color: '#cda26b', fontSize: '0.85rem', margin: '0 0 5px 0' }}>
        Arrakis Control Center
      </p>
      <h1 style={{ fontSize: '2.2rem', margin: '0 0 25px 0' }}>System Administration</h1>

      <section style={{ display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: '#1d120c', border: '1px solid #3c2415', padding: '20px', borderRadius: '6px', marginBottom: '30px' }}>
        <span style={{ height: '12px', width: '12px', backgroundColor: '#52fa7c', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 8px #52fa7c' }}></span>
        <div>
          <b style={{ display: 'block', color: '#f3d39b' }}>Systems Live</b>
          <small style={{ color: '#a08568' }}>Telemetry maps refreshing automatically every 15s</small>
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '40px' }}>
        <div style={{ backgroundColor: '#1d120c', border: '1px solid #2a1a0f', padding: '15px', borderRadius: '4px', textAlign: 'center' }}>
          <b style={{ display: 'block', color: '#a08568', fontSize: '0.85rem', marginBottom: '5px' }}>Uptime</b>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f3d39b' }}>{stats.uptime}</span>
        </div>
        <div style={{ backgroundColor: '#1d120c', border: '1px solid #2a1a0f', padding: '15px', borderRadius: '4px', textAlign: 'center' }}>
          <b style={{ display: 'block', color: '#a08568', fontSize: '0.85rem', marginBottom: '5px' }}>Memory</b>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f3d39b' }}>{stats.memoryMb} MB</span>
        </div>
        <div style={{ backgroundColor: '#1d120c', border: '1px solid #2a1a0f', padding: '15px', borderRadius: '4px', textAlign: 'center' }}>
          <b style={{ display: 'block', color: '#a08568', fontSize: '0.85rem', marginBottom: '5px' }}>Active Shards</b>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f3d39b' }}>{stats.shards.length}</span>
        </div>
      </section>

      <h2 style={{ fontSize: '1.3rem', color: '#cda26b', borderBottom: '1px solid #23150d', paddingBottom: '8px', marginBottom: '15px' }}>
        Connected Guilds
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '40px' }}>
        {loading ? (
          <p style={{ color: '#a08568', fontStyle: 'italic' }}>Querying discord guild registry...</p>
        ) : stats.guilds.length === 0 ? (
          <p style={{ color: '#a08568' }}>No connected guilds found.</p>
        ) : (
          stats.guilds.map((g) => (
            <div key={g.id} style={{ backgroundColor: '#160d08', border: '1px solid #23150d', padding: '15px', borderRadius: '4px' }}>
              <b style={{ display: 'block', color: '#f3d39b', marginBottom: '4px' }}>{g.name}</b>
              <small style={{ color: '#a08568' }}>{g.memberCount} members</small>
            </div>
          ))
        )}
      </div>

      <h2 style={{ fontSize: '1.3rem', color: '#cda26b', borderBottom: '1px solid #23150d', paddingBottom: '8px', marginBottom: '15px' }}>
        Subsystem Actions
      </h2>
      <div style={{ display: 'flex', gap: '15px' }}>
        <a href="/portal" style={{ display: 'inline-block', border: '1px solid #cda26b', color: '#cda26b', padding: '10px 20px', borderRadius: '4px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 'bold' }}>
          Open My Player Portal →
        </a>
        <button onClick={restartBot} style={{ backgroundColor: '#ff4a4a', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer' }}>
          Restart Core Bot Process
        </button>
      </div>
    </main>
  );
}