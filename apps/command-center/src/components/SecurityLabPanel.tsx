import React, { useState } from 'react';

const IconShieldAlert = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" strokeWidth="2" stroke="currentColor" fill="none">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const IconLock = () => (
  <svg viewBox="0 0 24 24" width="10" height="10" strokeWidth="2" stroke="currentColor" fill="none">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const IconPlay = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" strokeWidth="2" stroke="currentColor" fill="none">
    <polygon points="5,3 19,12 5,21"/>
  </svg>
);

const IconAlert = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" strokeWidth="2" stroke="currentColor" fill="none">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const IconCheckSq = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" strokeWidth="2.5" stroke="currentColor" fill="none">
    <polyline points="9,11 12,14 22,4"/>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
);

export const SecurityLabPanel: React.FC = () => {
  const [target, setTarget] = useState('internal-app.local');
  const [authorizedBy, setAuthorizedBy] = useState('Lead Security Auditor');
  const [isRunning, setIsRunning] = useState(false);
  const [findings, setFindings] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const presets = [
    'internal-app.local',
    'staging-gateway.net',
    'prod-api.corp.internal',
    'sandbox-target.org'
  ];

  const handleRun = async () => {
    if (!target.trim()) {
      setError('Please specify a target host or domain.');
      return;
    }
    if (!authorizedBy.trim()) {
      setError('An auditor signature is required for authorized scans.');
      return;
    }

    setIsRunning(true);
    setError(null);
    setFindings(null);

    try {
      const apiBase = window.location.origin.includes('3000') || window.location.origin.includes('5173') ? 'http://localhost:3001' : '';
      const res = await fetch(`${apiBase}/api/v1/security/assess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: target.trim(),
          authorizationContext: {
            authorizedBy: authorizedBy.trim(),
            scope: 'Sandboxed Authorized Target',
            expiresAt: new Date(Date.now() + 3600000).toISOString()
          }
        })
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.error || 'Assessment failed');
      }

      // Safely unwrap array response
      const list = Array.isArray(payload) ? payload : Array.isArray(payload.data) ? payload.data : [];
      setFindings(list);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsRunning(false);
    }
  };

  const handleExportJson = () => {
    if (!findings) return;
    const blob = new Blob([JSON.stringify(findings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-findings-${target.replace(/[^a-z0-9]/gi, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="security-workspace">
      <div style={{ marginBottom: 20 }}>
        <div className="workspace-title" style={{ color: 'var(--red)' }}>
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          Security Lab & Isolated Harness
        </div>
      </div>

      <div className="security-card">
        <div className="security-header">
          <div className="security-title">
            <IconShieldAlert />
            Authorized Assessment Console
          </div>
          <div className="gated-badge">
            <IconLock />
            Strictly Gated
          </div>
        </div>

        {/* Target Presets */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>Target Presets:</span>
          {presets.map(p => (
            <button
              key={p}
              onClick={() => setTarget(p)}
              style={{
                background: target === p ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${target === p ? 'var(--cyan)' : 'var(--border)'}`,
                color: target === p ? 'var(--cyan)' : 'var(--text-secondary)',
                borderRadius: 4,
                padding: '2px 8px',
                fontSize: 10,
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer'
              }}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="security-fields">
          <div className="field-group">
            <label>Target FQDN / IP (Authorized Only)</label>
            <input
              type="text"
              value={target}
              onChange={e => setTarget(e.target.value)}
              className="field-input"
              placeholder="internal-app.local"
            />
          </div>
          <div className="field-group">
            <label>Authorization Auditor Signature</label>
            <input
              type="text"
              value={authorizedBy}
              onChange={e => setAuthorizedBy(e.target.value)}
              className="field-input"
              placeholder="Lead Security Auditor"
            />
          </div>
        </div>

        <div className="warning-row">
          <div className="warning-text">
            <IconAlert />
            Docker-isolated sandbox · Egress filtered · Authorized targets only
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {findings && (
              <button
                onClick={() => setFindings(null)}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '6px 12px',
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer'
                }}
              >
                Clear
              </button>
            )}
            <button
              className="btn-run"
              onClick={handleRun}
              disabled={isRunning}
            >
              <IconPlay />
              {isRunning ? 'Running Harness…' : 'Execute Scan'}
            </button>
          </div>
        </div>

        {error && (
          <div className="error-box fade-in" style={{ marginTop: 12, padding: 10, background: 'rgba(244,63,94,0.1)', border: '1px solid var(--red)', borderRadius: 'var(--radius-sm)', color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
            ⚠ {error}
          </div>
        )}

        {findings && (
          <div className="findings-section fade-in" style={{ marginTop: 16 }}>
            <div className="findings-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--green)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                <IconCheckSq /> Assessment Findings ({findings.length})
              </div>
              <button
                onClick={handleExportJson}
                style={{
                  background: 'rgba(16,185,129,0.1)',
                  border: '1px solid var(--green)',
                  color: 'var(--green)',
                  borderRadius: 4,
                  padding: '3px 10px',
                  fontSize: 10,
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer'
                }}
              >
                Export JSON
              </button>
            </div>
            {findings.length === 0 ? (
              <div style={{ padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 6, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11, textAlign: 'center' }}>
                No vulnerabilities detected during isolated assessment.
              </div>
            ) : (
              findings.map((f, i) => (
                <div key={i} className="finding-card" style={{ marginBottom: 10, padding: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 6 }}>
                  <div className="finding-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div className="finding-title" style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 12 }}>{f.title}</div>
                    <span className={`severity-badge ${(f.severity || 'low').toLowerCase()}`} style={{
                      padding: '2px 8px', borderRadius: 4, fontSize: 9, fontWeight: 800, fontFamily: 'var(--font-mono)', textTransform: 'uppercase',
                      background: f.severity === 'CRITICAL' ? 'rgba(244,63,94,0.2)' : f.severity === 'HIGH' ? 'rgba(245,158,11,0.2)' : 'rgba(59,130,246,0.2)',
                      color: f.severity === 'CRITICAL' ? 'var(--red)' : f.severity === 'HIGH' ? 'var(--amber)' : 'var(--blue)'
                    }}>
                      {f.severity}
                    </span>
                  </div>
                  <div className="finding-evidence" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6 }}>{f.evidence}</div>
                  <div className="finding-remediation" style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--cyan)' }}>↳ {f.remediation}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Sandbox status panel */}
      <div style={{
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 16px',
        marginTop: 16
      }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>
          Sandbox Status
        </div>
        {[
          { label: 'Execution Mode', value: 'OBSERVE ONLY', color: 'var(--green)' },
          { label: 'PentAGI Engine', value: 'Active (Sandboxed)', color: 'var(--cyan)' },
          { label: 'CyberStrike Engine', value: 'Standby', color: 'var(--text-secondary)' },
          { label: 'Network Egress', value: 'Filtered / Authorized', color: 'var(--amber)' },
          { label: 'Kill Switch', value: 'Armed & Ready', color: 'var(--green)' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>{label}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
