'use client';

import React, { useState, useEffect } from 'react';

export default function HaggaBasinMap() {
  const [mapData, setMapData] = useState({ ok: true, markers: [] });
  const [zoom, setZoom] = useState(100);

  async function fetchCoordinates() {
    try {
      const res = await fetch('/api/map');
      if (!res.ok) return;
      const data = await res.json();
      setMapData(data);
    } catch (err) {
      console.error('Failed to sync map vectors:', err);
    }
  }

  useEffect(() => {
    fetchCoordinates();
    const interval = setInterval(fetchCoordinates, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#120a06', fontFamily: 'system-ui, sans-serif', padding: '20px', color: '#f3d39b' }}>
      {/* Top Header Panel */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #3c2415', paddingBottom: '15px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', margin: '0 0 4px 0' }}>Hagga Basin Tactical Vector Map</h1>
          <p style={{ margin: '0', color: '#a08568', fontSize: '0.85rem' }}>Dune: Awakening Infrastructure Grid Synchronization</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setZoom(prev => Math.max(prev - 10, 50))} style={{ backgroundColor: '#1d120c', border: '1px solid #3c2415', color: '#f3d39b', padding: '6px 12px', cursor: 'pointer', borderRadius: '4px' }}>Zoom Out</button>
          <button onClick={() => setZoom(prev => Math.min(prev + 10, 200))} style={{ backgroundColor: '#1d120c', border: '1px solid #3c2415', color: '#f3d39b', padding: '6px 12px', cursor: 'pointer', borderRadius: '4px' }}>Zoom In</button>
          <a href="/portal" style={{ display: 'inline-block', backgroundColor: '#cda26b', color: '#120a06', padding: '6px 16px', borderRadius: '4px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 'bold' }}>Exit To Portal</a>
        </div>
      </header>

      {/* Map Content Box */}
      <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 120px)', border: '1px solid #3c2415', borderRadius: '6px', backgroundColor: '#0d0704', overflow: 'auto', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)' }}>
        <div style={{ position: 'absolute', width: '2048px', height: '2048px', transform: `scale(${zoom / 100})`, transformOrigin: 'top left', backgroundImage: 'url("/hagga-basin.png")', backgroundSize: 'cover', transition: 'transform 0.1s ease-out' }}>
          
          {/* Dynamic Map Coordinate Marker Flags */}
          {mapData.markers?.map((marker, i) => (
            <div 
              key={i} 
              style={{ position: 'absolute', left: `${marker.x}px`, top: `${marker.y}px`, transform: 'translate(-50%, -50%)', cursor: 'pointer' }}
              title={`${marker.name} (${marker.x}, ${marker.y})`}
            >
              <img src={`/map-icons/${marker.icon || 'Base'}.webp`} alt={marker.name} style={{ width: '32px', height: '32px', display: 'block' }} />
              <span style={{ display: 'block', backgroundColor: 'rgba(18, 10, 6, 0.85)', color: '#f3d39b', fontSize: '0.75rem', padding: '2px 6px', borderRadius: '3px', marginTop: '2px', whiteSpace: 'nowrap', border: '1px solid #3c2415' }}>
                {marker.name}
              </span>
            </div>
          ))}

        </div>
      </div>
    </main>
  );
}