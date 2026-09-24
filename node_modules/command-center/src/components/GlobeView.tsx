import React, { useState, useEffect, useRef } from 'react';

interface GlobeEntity {
  id: string;
  name: string;
  type: 'aircraft' | 'vessel' | 'satellite' | 'groundstation' | 'intel';
  lat: number;
  lng: number;
  info: string;
  source: string;
  confidence?: string;
  freshnessSec?: number;
}

interface GlobeViewProps {
  entities: GlobeEntity[];
  onSelectEntity: (entity: GlobeEntity) => void;
  selectedEntityId?: string;
}

const TYPE_COLORS: Record<string, string> = {
  aircraft: '#00d4ff',
  vessel: '#3b82f6',
  satellite: '#f59e0b',
  intel: '#f43f5e',
  groundstation: '#10b981',
};

export const GlobeView: React.FC<GlobeViewProps> = ({ entities, onSelectEntity, selectedEntityId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotRef = useRef(0);
  const pitchRef = useRef(0);
  const rafRef = useRef<number>(0);

  // Interactivity state
  const [autoRotate, setAutoRotate] = useState(true);
  const [zoomScale, setZoomScale] = useState(1.0);
  const [searchFilter, setSearchFilter] = useState('');
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    aircraft: true,
    vessel: true,
    satellite: true,
    groundstation: true,
    intel: true,
  });

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number; rot: number; pitch: number }>({ x: 0, y: 0, rot: 0, pitch: 0 });

  const toggleLayer = (type: string) => {
    setActiveLayers(prev => ({ ...prev, [type]: !prev[type] }));
  };

  // Filter entities based on layer toggle & search query
  const filteredEntities = entities.filter(e => {
    if (!activeLayers[e.type]) return false;
    if (searchFilter.trim() && !e.name.toLowerCase().includes(searchFilter.toLowerCase()) && !e.info.toLowerCase().includes(searchFilter.toLowerCase())) {
      return false;
    }
    return true;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const W = canvas.width;
      const H = canvas.height;
      const cx = W / 2;
      const cy = H / 2;
      const R = Math.min(W, H) * 0.38 * zoomScale;

      ctx.clearRect(0, 0, W, H);

      // ─── Outer atmosphere halo ─────────────────────────────
      const halo = ctx.createRadialGradient(cx, cy, R * 0.85, cx, cy, R * 1.25);
      halo.addColorStop(0, 'rgba(0,212,255,0.14)');
      halo.addColorStop(0.5, 'rgba(0,80,180,0.05)');
      halo.addColorStop(1, 'transparent');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.25, 0, Math.PI * 2);
      ctx.fill();

      // ─── Atmosphere rim ─────────────────────────────────────
      const rim = ctx.createRadialGradient(cx, cy, R * 0.92, cx, cy, R * 1.06);
      rim.addColorStop(0, 'rgba(0,212,255,0.22)');
      rim.addColorStop(1, 'transparent');
      ctx.fillStyle = rim;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.06, 0, Math.PI * 2);
      ctx.fill();

      // ─── Globe body ─────────────────────────────────────────
      const globe = ctx.createRadialGradient(cx - R * 0.25, cy - R * 0.25, R * 0.05, cx, cy, R);
      globe.addColorStop(0, '#1c3354');
      globe.addColorStop(0.4, '#0e2038');
      globe.addColorStop(0.8, '#081424');
      globe.addColorStop(1, '#040a12');
      ctx.fillStyle = globe;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      // ─── Globe border glow ──────────────────────────────────
      ctx.save();
      ctx.strokeStyle = 'rgba(0,212,255,0.45)';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = 'rgba(0,212,255,0.6)';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // ─── Grid & Continents ─────────────────────────────────────
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.clip();

      if (autoRotate && !isDraggingRef.current) {
        rotRef.current += 0.0025;
      }

      const rot = rotRef.current;
      const pitch = pitchRef.current;

      // Latitude rings
      ctx.strokeStyle = 'rgba(0,212,255,0.09)';
      ctx.lineWidth = 0.8;
      for (let lat = -75; lat <= 75; lat += 25) {
        const radLat = ((lat + pitch) * Math.PI) / 180;
        const ry = R * Math.cos(radLat);
        const py = cy + R * Math.sin(radLat);
        if (ry > 0) {
          ctx.beginPath();
          ctx.ellipse(cx, py, ry, ry * 0.28, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Longitude meridians
      ctx.strokeStyle = 'rgba(0,212,255,0.07)';
      for (let i = 0; i < 18; i++) {
        const a = (i * Math.PI) / 9 + rot;
        const rx = Math.abs(Math.sin(a)) * R;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, R, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();

      // ─── Entity dots ─────────────────────────────────────────
      filteredEntities.forEach((entity) => {
        const radLat = ((entity.lat + pitch) * Math.PI) / 180;
        const lngRad = (entity.lng * Math.PI) / 180 + rot;
        const cosLng = Math.cos(lngRad);
        if (cosLng < -0.15) return; // backface cull

        const x = cx + R * Math.cos(radLat) * Math.sin(lngRad);
        const y = cy - R * Math.sin(radLat);

        const color = TYPE_COLORS[entity.type] || '#ffffff';
        const isSelected = entity.id === selectedEntityId;
        const dotR = isSelected ? 7.5 : 4.5;

        ctx.save();

        // Pulse ring for selected entity
        if (isSelected) {
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.shadowColor = color;
          ctx.shadowBlur = 18;
          ctx.beginPath();
          ctx.arc(x, y, 14, 0, Math.PI * 2);
          ctx.stroke();

          // Reticle crosshair lines
          ctx.strokeStyle = 'rgba(255,255,255,0.4)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x - 20, y); ctx.lineTo(x - 8, y);
          ctx.moveTo(x + 8, y); ctx.lineTo(x + 20, y);
          ctx.moveTo(x, y - 20); ctx.lineTo(x, y - 8);
          ctx.moveTo(x, y + 8); ctx.lineTo(x, y + 20);
          ctx.stroke();
        }

        // Glow dot
        ctx.shadowColor = color;
        ctx.shadowBlur = isSelected ? 12 : 6;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, dotR, 0, Math.PI * 2);
        ctx.fill();

        // Entity label
        ctx.shadowBlur = 0;
        ctx.font = `600 ${isSelected ? 11 : 9.5}px 'JetBrains Mono', monospace`;
        ctx.fillStyle = isSelected ? '#ffffff' : 'rgba(255,255,255,0.85)';
        const labelText = entity.name.length > 14 ? entity.name.slice(0, 14) + '…' : entity.name;
        ctx.fillText(labelText, x + dotR + 5, y + 3.5);

        ctx.restore();
      });

      rafRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(rafRef.current);
  }, [filteredEntities, selectedEntityId, autoRotate, zoomScale]);

  // Handle Drag to Rotate
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      rot: rotRef.current,
      pitch: pitchRef.current
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    rotRef.current = dragStartRef.current.rot + dx * 0.005;
    pitchRef.current = Math.max(-60, Math.min(60, dragStartRef.current.pitch - dy * 0.2));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setZoomScale(prev => Math.max(0.6, Math.min(2.2, prev - e.deltaY * 0.001)));
  };

  // Handle Click Selection
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const R = Math.min(W, H) * 0.38 * zoomScale;

    let closest: GlobeEntity | null = null;
    let minDist = 24;

    filteredEntities.forEach((entity) => {
      const radLat = ((entity.lat + pitchRef.current) * Math.PI) / 180;
      const lngRad = (entity.lng * Math.PI) / 180 + rotRef.current;
      if (Math.cos(lngRad) < -0.15) return;
      const x = cx + R * Math.cos(radLat) * Math.sin(lngRad);
      const y = cy - R * Math.sin(radLat);
      const dist = Math.hypot(mx - x, my - y);
      if (dist < minDist) {
        minDist = dist;
        closest = entity;
      }
    });

    if (closest) onSelectEntity(closest);
  };

  return (
    <div className="globe-workspace" style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        width={1100}
        height={750}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="globe-canvas"
        style={{ width: '100%', height: '100%', objectFit: 'contain', cursor: isDraggingRef.current ? 'grabbing' : 'grab' }}
      />

      {/* Top Search Overlay */}
      <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 10, display: 'flex', gap: 8, alignItems: 'center', background: 'rgba(5,12,24,0.85)', backdropFilter: 'blur(8px)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '6px 12px' }}>
        <input
          type="text"
          value={searchFilter}
          onChange={e => setSearchFilter(e.target.value)}
          placeholder="Filter entities on globe…"
          style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 11, width: 200 }}
        />
        {searchFilter && (
          <button onClick={() => setSearchFilter('')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>✕</button>
        )}
      </div>

      {/* Interactive Controls Bar */}
      <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, display: 'flex', gap: 6, background: 'rgba(5,12,24,0.85)', backdropFilter: 'blur(8px)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: 4 }}>
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          style={{ background: autoRotate ? 'rgba(0,212,255,0.2)' : 'transparent', border: `1px solid ${autoRotate ? 'var(--cyan)' : 'transparent'}`, color: autoRotate ? 'var(--cyan)' : 'var(--text-secondary)', borderRadius: 4, padding: '4px 8px', fontSize: 10, fontFamily: 'var(--font-mono)', cursor: 'pointer' }}
          title="Toggle Auto Rotation"
        >
          {autoRotate ? '⏸ Pause' : '▶ Rotate'}
        </button>
        <button
          onClick={() => setZoomScale(prev => Math.min(2.2, prev + 0.2))}
          style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: 4, padding: '4px 8px', fontSize: 11, fontFamily: 'var(--font-mono)', cursor: 'pointer' }}
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={() => setZoomScale(prev => Math.max(0.6, prev - 0.2))}
          style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: 4, padding: '4px 8px', fontSize: 11, fontFamily: 'var(--font-mono)', cursor: 'pointer' }}
          title="Zoom Out"
        >
          -
        </button>
        <button
          onClick={() => { rotRef.current = 0; pitchRef.current = 0; setZoomScale(1.0); }}
          style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: 4, padding: '4px 8px', fontSize: 10, fontFamily: 'var(--font-mono)', cursor: 'pointer' }}
          title="Reset Camera"
        >
          Reset
        </button>
      </div>

      {/* Interactive Legend with Layer Toggles */}
      <div className="globe-overlay-legend" style={{ position: 'absolute', bottom: 16, left: 16, zIndex: 10, background: 'rgba(5,12,24,0.85)', backdropFilter: 'blur(8px)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
        <div className="legend-title" style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
          Entity Layers (Click to Toggle)
        </div>
        {[
          { type: 'aircraft', cls: 'cyan', label: 'Aircraft (ADS-B)' },
          { type: 'vessel', cls: 'blue', label: 'Maritime (AIS)' },
          { type: 'satellite', cls: 'amber', label: 'Satellites (TLE)' },
          { type: 'groundstation', cls: 'green', label: 'Ground Stations' },
          { type: 'intel', cls: 'red', label: 'Intel Alerts' },
        ].map(({ type, cls, label }) => {
          const isActive = activeLayers[type];
          return (
            <div
              key={type}
              onClick={() => toggleLayer(type)}
              className="legend-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '4px 6px',
                borderRadius: 4,
                cursor: 'pointer',
                opacity: isActive ? 1 : 0.4,
                background: isActive ? 'rgba(255,255,255,0.03)' : 'transparent',
                transition: 'all 0.15s ease'
              }}
            >
              <span className={`legend-dot ${cls}`} style={{ width: 8, height: 8, borderRadius: '50%', background: TYPE_COLORS[type] }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}>{label}</span>
              <span style={{ marginLeft: 'auto', fontSize: 9, fontFamily: 'var(--font-mono)', color: isActive ? 'var(--green)' : 'var(--text-muted)' }}>
                {isActive ? 'ON' : 'OFF'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Live stats overlay */}
      <div className="globe-overlay-stats" style={{ position: 'absolute', bottom: 16, right: 16, zIndex: 10, display: 'flex', gap: 8 }}>
        {[
          { val: filteredEntities.filter(e => e.type === 'aircraft').length, label: 'AIRCRAFT', cls: 'cyan' },
          { val: filteredEntities.filter(e => e.type === 'vessel').length, label: 'VESSELS', cls: 'blue' },
          { val: filteredEntities.filter(e => e.type === 'satellite').length, label: 'SATS', cls: 'amber' },
          { val: filteredEntities.filter(e => e.type === 'intel').length, label: 'INTEL', cls: 'red' },
        ].map(({ val, label, cls }) => (
          <div key={label} className="stat-chip">
            <span className={`stat-chip-value ${cls}`}>{val}</span>
            <span className="stat-chip-label">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
