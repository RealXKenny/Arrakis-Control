'use client';

import React from 'react';

export default function LandingPage() {
  return (
    <main style={{ maxWidth: '800px', margin: '60px auto', padding: '0 20px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <p style={{ textTransform: 'uppercase', letterSpacing: '2px', color: '#cda26b', fontSize: '0.9rem', margin: '0 0 10px 0' }}>
          Arrakis Control Subsystem
        </p>
        <h1 style={{ fontSize: '2.5rem', margin: '0 0 20px 0', fontWeight: 'bold' }}>
          Dune: Awakening Console Interface
        </h1>
        <p style={{ color: '#d2b48c', fontSize: '1.1rem', lineHeight: '1.6' }}>
          Secure local access gateway for monitoring character telemetry, managing automated Discord shards, and inspecting server instance status.
        </p>
      </div>

      <section style={{ backgroundColor: '#1d120c', border: '1px solid #3c2415', padding: '30px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
        <h2 style={{ fontSize: '1.4rem', margin: '0 0 15px 0', color: '#f3d39b' }}>
          Authentication Required
        </h2>
        <p style={{ color: '#a08568', margin: '0 0 25px 0' }}>
          Please sign in using your Discord account. Access levels will be parsed dynamically from your server role permissions.
        </p>
        <a 
          href="/api/auth/login" 
          style={{ display: 'inline-block', backgroundColor: '#cda26b', color: '#120a06', padding: '12px 30px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1rem', transition: 'background-color 0.2s' }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e1b984'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#cda26b'}
        >
          Sign in to player portal →
        </a>
      </section>

      <footer style={{ marginTop: '60px', textAlign: 'center', color: '#5c4331', fontSize: '0.85rem', borderTop: '1px solid #23150d', paddingTop: '20px' }}>
        Arrakis Control • Modular Shard Architecture
      </footer>
    </main>
  );
}