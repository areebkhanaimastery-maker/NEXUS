import React from 'react';

interface EntityDetails {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  info: string;
  source: string;
  confidence?: string;
  freshnessSec?: number;
  licenseNote?: string;
}

interface IntelligencePanelProps {
  entity: EntityDetails | null;
  onClose: () => void;
}

const IconGlobe = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const IconShield = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9,12 11,14 15,10"/>
  </svg>
);

const IconCheck = () => (
  <svg viewBox="0 0 24 24" width="10" height="10" strokeWidth="2.5">
    <polyline points="20,6 9,17 4,12"/>
  </svg>
);

const IconClock = () => (
  <svg viewBox="0 0 24 24" width="10" height="10" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
  </svg>
);

export const IntelligencePanel: React.FC<IntelligencePanelProps> = ({ entity, onClose }) => {
  if (!entity) {
    return (
      <>
        <div className="panel-header">
          <div className="panel-title">
            <span className="panel-title-dot" />
            Entity Intelligence
          </div>
        </div>
        <div className="panel-content">
          <div className="panel-empty fade-in">
            <div className="panel-empty-icon">
              <IconGlobe />
            </div>
            <h3>No Entity Selected</h3>
            <p>Click any entity on the 3D globe to view its intelligence profile, telemetry data, and provenance attribution.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="panel-header">
        <div className="panel-title">
          <span className="panel-title-dot" />
          Entity Intelligence
        </div>
        <button className="btn-close" onClick={onClose}>✕</button>
      </div>

      <div className="panel-content fade-in">
        {/* Type badge + name */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 6 }}>
            <span className={`entity-type-badge ${entity.type}`}>
              {entity.type.toUpperCase()}
            </span>
          </div>
          <div className="entity-title">{entity.name}</div>
        </div>

        {/* Spatial data */}
        <div className="data-grid">
          <div className="data-cell">
            <div className="data-cell-label">Latitude</div>
            <div className="data-cell-value">{entity.lat.toFixed(4)}°</div>
          </div>
          <div className="data-cell">
            <div className="data-cell-label">Longitude</div>
            <div className="data-cell-value">{entity.lng.toFixed(4)}°</div>
          </div>
          <div className="data-cell" style={{ gridColumn: '1/-1' }}>
            <div className="data-cell-label">Entity ID</div>
            <div className="data-cell-value" style={{ fontSize: 11 }}>{entity.id}</div>
          </div>
        </div>

        {/* Operational summary */}
        <div style={{ marginBottom: 4, fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Operational Summary
        </div>
        <div className="info-box">{entity.info}</div>

        {/* Provenance */}
        <div className="provenance-card">
          <div className="provenance-header">
            <IconShield /> Data Provenance & Attribution
          </div>

          <div className="provenance-row">
            <span className="provenance-key">Provider:</span>
            <span className="provenance-val cyan" style={{ fontSize: 9, maxWidth: 180, textAlign: 'right' }}>{entity.source}</span>
          </div>

          <div className="provenance-row">
            <span className="provenance-key">Confidence:</span>
            <span className="provenance-val high">
              <span className="badge-confidence">
                <IconCheck /> {entity.confidence || 'HIGH'}
              </span>
            </span>
          </div>

          <div className="provenance-row">
            <span className="provenance-key">Freshness:</span>
            <span className="provenance-val amber" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <IconClock /> {entity.freshnessSec ?? 5}s ago
            </span>
          </div>

          {entity.licenseNote && (
            <div className="license-note">License: {entity.licenseNote}</div>
          )}
        </div>
      </div>

      <div className="panel-actions">
        <button className="btn-primary cyan">Track Entity</button>
        <button className="btn-primary ghost">Add to Case</button>
      </div>
    </>
  );
};
