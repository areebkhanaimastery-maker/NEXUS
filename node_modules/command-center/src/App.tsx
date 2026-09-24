import { useState, useEffect, useRef, useCallback } from 'react';
import { GlobeView } from './components/GlobeView';
import { IntelligencePanel } from './components/IntelligencePanel';
import { SecurityLabPanel } from './components/SecurityLabPanel';
import { KnowledgeCenter } from './components/KnowledgeCenter';

const API = 'http://localhost:3001';
type Tab = 'globe' | 'knowledge' | 'webcheck' | 'security' | 'terminal' | 'system';

// ── Inline SVG Icons ─────────────────────────────────────────────────
const I = {
  shield:    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  globe:     <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" fill="none" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  search:    <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" fill="none" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  radar:     <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" fill="none" strokeWidth="1.5"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49"/></svg>,
  terminal:  <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" fill="none" strokeWidth="1.5"><polyline points="4,17 10,11 4,5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>,
  activity:  <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" fill="none" strokeWidth="1.5"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>,
  refresh:   <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" fill="none" strokeWidth="2"><polyline points="23,4 23,10 17,10"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"/></svg>,
  satellite: <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" fill="none" strokeWidth="1.5"><path d="M13 7L9 3 5 7l4 4"/><path d="M17 11l4 4-4 4-4-4"/><line x1="8" y1="11" x2="13" y2="16"/><path d="M7 18a4 4 0 0 1-4-4"/></svg>,
  cpu:       <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" fill="none" strokeWidth="1.5"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>,
};

export default function App() {
  const [entities, setEntities] = useState<any[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<any|null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('globe');
  const [gatewayOnline, setGatewayOnline] = useState(false);
  const [dataMode, setDataMode] = useState('UNKNOWN');
  const [now, setNow] = useState(new Date());
  const [entityCounts, setEntityCounts] = useState({ aircraft: 0, vessels: 0, sats: 0, intel: 0 });

  // Web Intelligence
  const [webDomain, setWebDomain] = useState('');
  const [webResult, setWebResult] = useState<any>(null);
  const [webLoading, setWebLoading] = useState(false);
  const [webError, setWebError] = useState('');

  // Terminal
  const [termHistory, setTermHistory] = useState<{cmd:string,out:string,ok:boolean}[]>([{ cmd: '', out: 'ULTIMATE INTELLIGENCE COMMAND CENTER v2.1.0\nType "help" for available commands.\n', ok: true }]);
  const [termInput, setTermInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const termRef = useRef<HTMLDivElement>(null);
  const termInputRef = useRef<HTMLInputElement>(null);

  // System log (from SSE)
  const [sysLog, setSysLog] = useState<any[]>([]);

  // Services
  const [services, setServices] = useState<Record<string,any>>({});

  // Live clock
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);

  // SSE event stream
  useEffect(() => {
    let es: EventSource;
    try {
      es = new EventSource(`${API}/api/v1/stream`);
      es.onmessage = (e) => {
        try {
          const d = JSON.parse(e.data);
          if (d.type !== 'connected') {
            setSysLog(prev => [d, ...prev].slice(0, 100));
          }
        } catch {}
      };
    } catch {}
    return () => { try { es?.close(); } catch {} };
  }, []);

  // Fetch all telemetry
  const fetchAll = useCallback(async () => {
    try {
      const [aR, vR, sR, nR, gsR] = await Promise.all([
        fetch(`${API}/api/v1/telemetry/aircraft`).then(r=>r.json()),
        fetch(`${API}/api/v1/telemetry/vessels`).then(r=>r.json()),
        fetch(`${API}/api/v1/satellites?limit=500`).then(r=>r.json()),
        fetch(`${API}/api/v1/intel/news`).then(r=>r.json()),
        fetch(`${API}/api/v1/ground-stations`).then(r=>r.json()),
      ]);
      setGatewayOnline(true);
      setDataMode(aR.dataMode || 'UNKNOWN');

      const aircraft = (aR.data||[]).map((x:any) => ({ ...x, _type:'aircraft', id:x.id, name:x.callsign, type:'aircraft', lat:x.latitude, lng:x.longitude, info:`${x.aircraftType} · Alt:${x.altitudeFeet?.toLocaleString()}ft · ${x.velocityKnots}kts · Sq:${x.squawk}`, source:x.provenance?.source, confidence:x.provenance?.confidence, freshnessSec:x.provenance?.freshnessSec, isSimulated:x.provenance?.isSimulated }));
      const vessels = (vR.data||[]).map((x:any) => ({ ...x, _type:'vessel', id:x.id, name:x.vesselName, type:'vessel', lat:x.latitude, lng:x.longitude, info:`${x.vesselType} · MMSI:${x.mmsi} · ${x.speedKnots}kts → ${x.destination}`, source:x.provenance?.source, confidence:x.provenance?.confidence, freshnessSec:x.provenance?.freshnessSec, isSimulated:x.provenance?.isSimulated }));
      const sats = (sR.data||[]).map((x:any) => ({ ...x, _type:'satellite', id:String(x.noradId), name:x.name, type:'satellite', lat:x.latitude, lng:x.longitude, info:`${x.category} · Alt:${x.altitudeKm}km · ${x.velocityKms}km/s`, source:x.provenance?.source, confidence:x.provenance?.confidence, freshnessSec:x.provenance?.freshnessSec, isSimulated:x.provenance?.isSimulated }));
      const intel = (nR.data||[]).map((x:any) => ({ ...x, _type:'intel', id:x.id, name:x.title, type:'intel', lat:x.latitude, lng:x.longitude, info:`[${x.category}] ${x.summary}`, source:x.provenance?.source, confidence:x.provenance?.confidence, freshnessSec:x.provenance?.freshnessSec, isSimulated:x.provenance?.isSimulated }));
      const gs = (gsR.data||[]).map((x:any) => ({ ...x, _type:'groundstation', id:x.id, name:x.name, type:'groundstation', lat:x.latitude, lng:x.longitude, info:`${x.antennaType} · ${x.status} · Link:${x.telemetryLinkState}`, source:'Ground Station Telemetry', confidence:'HIGH', freshnessSec:0, isSimulated:false }));

      setEntities([...aircraft, ...vessels, ...sats, ...intel, ...gs]);
      setEntityCounts({ aircraft: aircraft.length, vessels: vessels.length, sats: sats.length, intel: intel.length });
    } catch {
      setGatewayOnline(false);
      setDataMode('OFFLINE');
    }
  }, []);

  useEffect(() => { fetchAll(); const iv = setInterval(fetchAll, 8000); return () => clearInterval(iv); }, [fetchAll]);

  // Fetch services
  useEffect(() => {
    fetch(`${API}/api/v1/system/services`).then(r=>r.json()).then(setServices).catch(()=>{});
    const iv = setInterval(() => { fetch(`${API}/api/v1/system/services`).then(r=>r.json()).then(setServices).catch(()=>{}); }, 15000);
    return () => clearInterval(iv);
  }, []);

  // Web check
  const handleWebCheck = async () => {
    if (!webDomain.trim()) return;
    setWebLoading(true); setWebError(''); setWebResult(null);
    try {
      const r = await fetch(`${API}/api/v1/web-intel/scan?domain=${encodeURIComponent(webDomain)}`);
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      setWebResult(d.data);
    } catch (e:any) { setWebError(e.message); }
    finally { setWebLoading(false); }
  };

  // Terminal Commands & Handlers
  const KNOWN_COMMANDS = [
    'system.status', 'system.health', 'services.list', 'agents.list',
    'satellites.live', 'satellites.search', 'web.scan', 'security.assess',
    'search', 'research', 'log.recent', 'clear', 'help'
  ];

  const handleTermSubmit = async () => {
    if (!termInput.trim()) return;
    const cmd = termInput.trim();
    setTermInput('');
    setCmdHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);

    if (cmd.toLowerCase() === 'clear' || cmd.toLowerCase() === 'cls') {
      setTermHistory([]);
      return;
    }

    try {
      const r = await fetch(`${API}/api/v1/terminal`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({command:cmd}) });
      const d = await r.json();
      setTermHistory(prev => [...prev, { cmd, out: typeof d.result === 'string' ? d.result : JSON.stringify(d.result, null, 2), ok: d.ok }]);
    } catch (e:any) {
      setTermHistory(prev => [...prev, { cmd, out: `Error: ${e.message}`, ok: false }]);
    }
    setTimeout(() => termRef.current?.scrollTo(0, termRef.current.scrollHeight), 50);
  };

  const handleTermKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTermSubmit();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const nextIdx = historyIndex < 0 ? cmdHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIdx);
      setTermInput(cmdHistory[nextIdx] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex < 0) return;
      const nextIdx = historyIndex + 1;
      if (nextIdx < cmdHistory.length) {
        setHistoryIndex(nextIdx);
        setTermInput(cmdHistory[nextIdx] || '');
      } else {
        setHistoryIndex(-1);
        setTermInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (!termInput.trim()) return;
      const match = KNOWN_COMMANDS.find(c => c.startsWith(termInput.toLowerCase()));
      if (match) setTermInput(match);
    }
  };

  const modeColor = dataMode === 'LIVE' ? 'var(--green)' : dataMode === 'DEMO' ? 'var(--amber)' : 'var(--red)';
  const timeStr = now.toISOString().replace('T',' ').slice(0,19) + ' UTC';

  const sidebarItems: {key:Tab, icon:React.ReactNode, label:string}[] = [
    { key:'globe', icon:I.globe, label:'Globe' },
    { key:'knowledge', icon:I.satellite, label:'Knowledge Center' },
    { key:'webcheck', icon:I.search, label:'Web Intel' },
    { key:'security', icon:I.radar, label:'Sec Lab' },
    { key:'terminal', icon:I.terminal, label:'Terminal' },
    { key:'system', icon:I.cpu, label:'System' },
  ];

  return (
    <div className="app-shell">
      {/* ─── HEADER ─── */}
      <header className="app-header">
        <div className="header-brand">
          <div className="brand-icon">{I.shield}</div>
          <div className="brand-text">
            <h1>Ultimate Intelligence Command Center</h1>
            <p>Web Intelligence · Continuous Knowledge Engine · 100+ Satellites v2.1</p>
          </div>
        </div>

        <nav className="header-nav">
          {(['globe','knowledge','webcheck','security','terminal','system'] as Tab[]).map(tab => (
            <button key={tab} className={`nav-tab ${activeTab===tab ? (tab==='security'?'active-security':'active-globe') : ''}`} onClick={()=>setActiveTab(tab)}>
              {tab==='globe'?'Globe':tab==='knowledge'?'Knowledge Center':tab==='webcheck'?'Web Intel':tab==='security'?'Sec Lab':tab==='terminal'?'Terminal':'System'}
            </button>
          ))}
        </nav>

        <div className="header-status">
          <div className="status-pill" style={{ borderColor: modeColor+'40', color: modeColor }}>
            <span className="status-dot" style={{ background: modeColor, boxShadow: `0 0 6px ${modeColor}` }}/>
            {dataMode}
          </div>
          <div className="status-pill">
            <span className={`status-dot ${gatewayOnline?'':'offline'}`}/>
            {gatewayOnline ? 'Online' : 'Offline'}
          </div>
          <button className="btn-icon" onClick={fetchAll} title="Refresh">{I.refresh}</button>
        </div>
      </header>

      {/* ─── SIDEBAR ─── */}
      <aside className="app-sidebar">
        {sidebarItems.map(({key,icon,label}) => (
          <button key={key} className={`sidebar-btn ${activeTab===key?'active':''}`} onClick={()=>setActiveTab(key)} title={label}>{icon}</button>
        ))}
        <div className="sidebar-divider"/>
        <button className="sidebar-btn" onClick={()=>setActiveTab('knowledge')} title="Satellites">{I.satellite}</button>
      </aside>

      {/* ─── MAIN WORKSPACE ─── */}
      <main className="app-main">
        {activeTab==='globe' && <GlobeView entities={entities} onSelectEntity={setSelectedEntity} selectedEntityId={selectedEntity?.id}/>}
        {activeTab==='knowledge' && <KnowledgeCenter />}

        {activeTab==='webcheck' && (
          <div className="workspace-scroll">
            <div className="workspace-title">{I.search} Web Intelligence — Real DNS / HTTPS Scanner</div>
            <div className="card">
              <div className="card-title">Target Domain Analysis (LIVE — real DNS lookups)</div>
              <div className="search-row">
                <input type="text" value={webDomain} onChange={e=>setWebDomain(e.target.value)} className="search-input" placeholder="Enter a real domain (e.g. google.com)" onKeyDown={e=>e.key==='Enter'&&handleWebCheck()}/>
                <button className="btn-scan" onClick={handleWebCheck} disabled={webLoading}>{webLoading?'Scanning…':'Scan Domain'}</button>
              </div>
            </div>
            {webError && <div className="card" style={{borderColor:'var(--border-red)'}}><div style={{color:'var(--red)',fontFamily:'var(--font-mono)',fontSize:12}}>⚠ {webError}</div></div>}
            {webResult && (
              <div className="card fade-in">
                <div className="card-title" style={{color:'var(--green)'}}>✓ Scan Complete — {webResult.domain} ({webResult.scanDurationMs}ms)</div>
                <div className="results-grid">
                  <div className="result-cell"><div className="result-cell-label">IP Addresses</div><div className="result-cell-value">{webResult.ipAddresses?.join(', ') || 'None resolved'}</div></div>
                  <div className="result-cell"><div className="result-cell-label">Server</div><div className="result-cell-value" style={{color:'var(--text-secondary)'}}>{webResult.serverHeader || 'Not disclosed'}</div></div>
                  <div className="result-cell"><div className="result-cell-label">SSL/TLS</div><div className="result-cell-value" style={{color:webResult.sslValid?'var(--green)':'var(--red)'}}>{webResult.sslValid===true?'✓ Valid':webResult.sslValid===false?'✗ Failed':'Unknown'}</div></div>
                  <div className="result-cell"><div className="result-cell-label">Scan Duration</div><div className="result-cell-value">{webResult.scanDurationMs}ms</div></div>
                </div>
                {Object.keys(webResult.dnsRecords||{}).length > 0 && (
                  <div style={{marginTop:12}}>
                    <div className="result-cell-label" style={{marginBottom:6}}>DNS Records</div>
                    {Object.entries(webResult.dnsRecords).map(([type, records]:any) => (
                      <div key={type} style={{display:'flex',gap:8,marginBottom:4,fontFamily:'var(--font-mono)',fontSize:11}}>
                        <span style={{color:'var(--cyan)',minWidth:50,fontWeight:700}}>{type}</span>
                        <span style={{color:'var(--text-secondary)'}}>{Array.isArray(records)?records.join(', '):records}</span>
                      </div>
                    ))}
                  </div>
                )}
                {webResult.technologies?.length > 0 && (
                  <div style={{marginTop:12}}><div className="result-cell-label" style={{marginBottom:6}}>Detected Technologies</div>
                    <div className="tech-tags">{webResult.technologies.map((t:string)=>(<span key={t} className="tech-tag">{t}</span>))}</div>
                  </div>
                )}
                {webResult.errors?.length > 0 && (
                  <div style={{marginTop:12,color:'var(--amber)',fontFamily:'var(--font-mono)',fontSize:10}}>
                    Scan notes: {webResult.errors.join(' · ')}
                  </div>
                )}
                <div style={{marginTop:12,fontFamily:'var(--font-mono)',fontSize:9,color:'var(--text-muted)',borderTop:'1px solid var(--border)',paddingTop:8}}>
                  Source: {webResult.provenance?.source} · Data Mode: LIVE · {webResult.scannedAt}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab==='security' && <SecurityLabPanel/>}

        {/* ─── TERMINAL ─── */}
        {activeTab==='terminal' && (
          <div style={{display:'flex',flexDirection:'column',height:'100%',background:'#020408'}} onClick={()=>termInputRef.current?.focus()}>
            <div style={{padding:'10px 16px',borderBottom:'1px solid var(--border)',fontFamily:'var(--font-mono)',fontSize:10,fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',color:'var(--green)',display:'flex',alignItems:'center',justifyContent:'space-between',gap:6,flexWrap:'wrap'}}>
              <div style={{display:'flex',alignItems:'center',gap:6}}>
                {I.terminal} Command Terminal — Interactive CLI Shell
              </div>
              <div style={{display:'flex',gap:6,alignItems:'center'}}>
                <span style={{fontSize:9,color:'var(--text-muted)'}}>Quick:</span>
                {['system.status','satellites.live','log.recent','help','clear'].map(q => (
                  <button key={q} onClick={(e)=>{e.stopPropagation();setTermInput(q);termInputRef.current?.focus();}} style={{background:'rgba(255,255,255,0.04)',border:'1px solid var(--border)',color:'var(--cyan)',borderRadius:3,padding:'2px 6px',fontSize:9,fontFamily:'var(--font-mono)',cursor:'pointer'}}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
            <div ref={termRef} style={{flex:1,overflowY:'auto',padding:16,fontFamily:'var(--font-mono)',fontSize:12,lineHeight:1.7}}>
              {termHistory.map((h,i) => (
                <div key={i} style={{marginBottom:10}}>
                  {h.cmd && <div style={{color:'var(--cyan)',fontWeight:600}}>{'>'} {h.cmd}</div>}
                  <pre style={{margin:0,color:h.ok?'var(--text-secondary)':'var(--red)',whiteSpace:'pre-wrap',wordBreak:'break-all',fontFamily:'var(--font-mono)'}}>{h.out}</pre>
                </div>
              ))}
            </div>
            <div style={{padding:'8px 16px',borderTop:'1px solid var(--border)',display:'flex',gap:8,alignItems:'center',background:'rgba(0,0,0,0.5)'}}>
              <span style={{color:'var(--green)',fontFamily:'var(--font-mono)',fontSize:13,fontWeight:700}}>{'>'}</span>
              <input ref={termInputRef} type="text" value={termInput} onChange={e=>setTermInput(e.target.value)} onKeyDown={handleTermKeyDown}
                style={{flex:1,background:'transparent',border:'none',outline:'none',color:'var(--text-primary)',fontFamily:'var(--font-mono)',fontSize:13}}
                placeholder="Type command or press TAB for autocomplete (e.g. system.status)" autoFocus={activeTab==='terminal'}/>
              <span style={{fontSize:9,fontFamily:'var(--font-mono)',color:'var(--text-muted)'}}>↑/↓ history · TAB autocomplete</span>
            </div>
          </div>
        )}

        {/* ─── SYSTEM MONITOR ─── */}
        {activeTab==='system' && (
          <div className="workspace-scroll">
            <div className="workspace-title">{I.cpu} System Health Matrix</div>
            <div className="card">
              <div className="card-title">Service Registry</div>
              <div style={{fontFamily:'var(--font-mono)',fontSize:11}}>
                {Object.entries(services).map(([name, svc]:any) => (
                  <div key={name} style={{display:'flex',alignItems:'center',gap:10,padding:'6px 0',borderBottom:'1px solid var(--border)'}}>
                    <span style={{width:8,height:8,borderRadius:'50%',flexShrink:0,
                      background:svc.status==='ONLINE'?'var(--green)':svc.status==='DEMO'?'var(--amber)':'var(--red)',
                      boxShadow:`0 0 6px ${svc.status==='ONLINE'?'var(--green)':svc.status==='DEMO'?'var(--amber)':'var(--red)'}`
                    }}/>
                    <span style={{minWidth:140,fontWeight:600,color:'var(--text-primary)'}}>{name}</span>
                    <span style={{minWidth:100,color:svc.status==='ONLINE'?'var(--green)':svc.status==='DEMO'?'var(--amber)':'var(--red)',fontWeight:700}}>{svc.status}</span>
                    <span style={{flex:1,color:'var(--text-muted)',fontSize:10}}>{svc.note||''}</span>
                    {svc.latencyMs > 0 && <span style={{color:'var(--text-secondary)'}}>{svc.latencyMs}ms</span>}
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="card-title">Live System Events</div>
              <div style={{maxHeight:300,overflowY:'auto',fontFamily:'var(--font-mono)',fontSize:10}}>
                {sysLog.length===0 && <div style={{color:'var(--text-muted)',padding:8}}>Waiting for events… (connect to SSE stream)</div>}
                {sysLog.slice(0,30).map((e,i) => (
                  <div key={i} style={{display:'flex',gap:8,padding:'3px 0',borderBottom:'1px solid rgba(255,255,255,0.03)'}}>
                    <span style={{color:'var(--text-muted)',minWidth:60}}>{e.ts?.slice(11,19)}</span>
                    <span style={{minWidth:45,fontWeight:700,color:e.level==='ERROR'?'var(--red)':e.level==='WARN'?'var(--amber)':'var(--text-muted)'}}>{e.level}</span>
                    <span style={{minWidth:80,color:'var(--cyan)'}}>{e.source}</span>
                    <span style={{color:'var(--text-secondary)'}}>{e.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ─── RIGHT PANEL ─── */}
      <aside className="app-panel">
        <IntelligencePanel entity={selectedEntity} onClose={()=>setSelectedEntity(null)}/>
      </aside>

      {/* ─── FOOTER ─── */}
      <footer className="app-footer">
        <div className="footer-label">
          <span style={{width:6,height:6,borderRadius:'50%',background:modeColor,boxShadow:`0 0 6px ${modeColor}`,display:'inline-block'}}/>
          {dataMode}
        </div>
        <div className="footer-ticker-wrap">
          <div className="footer-ticker">
            {['Aircraft:'+entityCounts.aircraft,'Vessels:'+entityCounts.vessels,'Satellites:'+entityCounts.sats,'Intel:'+entityCounts.intel,
              'Web-Check:LIVE','Security Lab:GATED','Gateway:'+( gatewayOnline?'ONLINE':'OFFLINE'),
              'Aircraft:'+entityCounts.aircraft,'Vessels:'+entityCounts.vessels,'Satellites:'+entityCounts.sats,'Intel:'+entityCounts.intel,
              'Web-Check:LIVE','Security Lab:GATED','Gateway:'+(gatewayOnline?'ONLINE':'OFFLINE')]
              .map((item,i) => <span key={i} className="ticker-item">{item}<span className="ticker-sep" style={{margin:'0 12px'}}>·</span></span>)}
          </div>
        </div>
        <div className="footer-time">{timeStr}</div>
      </footer>
    </div>
  );
}
