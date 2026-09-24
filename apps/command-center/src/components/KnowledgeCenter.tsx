import { useState, useEffect } from 'react';

const API = window.location.origin.includes('3000') || window.location.origin.includes('5173') ? 'http://localhost:3001' : '';

type SubTab = 'search' | 'deepscan' | 'satellites' | 'graph' | 'claims' | 'watchlists' | 'news' | 'admin';

export function KnowledgeCenter() {
  const [subTab, setSubTab] = useState<SubTab>('search');

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [aiSynthesis, setAiSynthesis] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Deep Scan State
  const [scanQuery, setScanQuery] = useState('');
  const [scanPipeline, setScanPipeline] = useState<any>(null);
  const [scanLoading, setScanLoading] = useState(false);

  // Satellites State
  const [satellites, setSatellites] = useState<any[]>([]);
  const [satFilterCategory, setSatFilterCategory] = useState('ALL');
  const [satSearchTerm, setSatSearchTerm] = useState('');
  const [satLoading, setSatLoading] = useState(false);
  const [selectedSat, setSelectedSat] = useState<any>(null);
  const [satDetail, setSatDetail] = useState<any>(null);
  const [compareList, setCompareList] = useState<number[]>([]);
  const [compareData, setCompareData] = useState<any[]>([]);

  // Knowledge Graph State
  const [graphData, setGraphData] = useState<{nodes:any[], edges:any[]}>({ nodes: [], edges: [] });
  const [selectedNode, setSelectedNode] = useState<any>(null);

  // Claims & Conflicts State
  const [claimsData, setClaimsData] = useState<any>(null);

  // Watchlists State
  const [watchlists, setWatchlists] = useState<any[]>([]);
  const [newWlTarget, setNewWlTarget] = useState('');
  const [newWlType, setNewWlType] = useState('KEYWORD');

  // Admin Data Sources State
  const [adminSources, setAdminSources] = useState<any[]>([]);

  // Fetch initial satellites
  const fetchSatellites = async () => {
    setSatLoading(true);
    try {
      const res = await fetch(`${API}/api/v1/satellites?category=${encodeURIComponent(satFilterCategory)}&search=${encodeURIComponent(satSearchTerm)}&limit=300`);
      const data = await res.json();
      setSatellites(data.data || []);
    } catch {}
    finally { setSatLoading(false); }
  };

  useEffect(() => {
    if (subTab === 'satellites') fetchSatellites();
  }, [subTab, satFilterCategory]);

  // Fetch Graph
  useEffect(() => {
    if (subTab === 'graph') {
      fetch(`${API}/api/v1/knowledge/graph`).then(r => r.json()).then(d => setGraphData(d.data || { nodes: [], edges: [] })).catch(()=>{});
    }
  }, [subTab]);

  // Fetch Claims
  useEffect(() => {
    if (subTab === 'claims') {
      fetch(`${API}/api/v1/knowledge/claims`).then(r => r.json()).then(d => setClaimsData(d.data || null)).catch(()=>{});
    }
  }, [subTab]);

  // Fetch Watchlists
  useEffect(() => {
    if (subTab === 'watchlists') {
      fetch(`${API}/api/v1/knowledge/watchlists`).then(r => r.json()).then(d => setWatchlists(d.data || [])).catch(()=>{});
    }
  }, [subTab]);

  // Fetch Admin Sources
  useEffect(() => {
    if (subTab === 'admin') {
      fetch(`${API}/api/v1/admin/sources`).then(r => r.json()).then(d => setAdminSources(d.data || [])).catch(()=>{});
    }
  }, [subTab]);

  // Global Search Handler
  const handleSearch = async (queryText?: string) => {
    const q = queryText || searchQuery;
    if (!q.trim()) return;
    setSearchLoading(true);
    setSearchResults(null);
    setAiSynthesis(null);

    try {
      const res = await fetch(`${API}/api/v1/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSearchResults(data.data);
    } catch {}
    finally { setSearchLoading(false); }
  };

  // Ask AI Handler
  const handleAskAi = async () => {
    if (!searchResults || !searchResults.results) return;
    setAiLoading(true);
    try {
      const res = await fetch(`${API}/api/v1/search/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchResults.query, results: searchResults.results })
      });
      const data = await res.json();
      setAiSynthesis(data.data);
    } catch {}
    finally { setAiLoading(false); }
  };

  // Deep Scan Handler
  const handleDeepScan = async () => {
    if (!scanQuery.trim()) return;
    setScanLoading(true);
    setScanPipeline(null);
    try {
      const res = await fetch(`${API}/api/v1/crawler/deep-scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: scanQuery })
      });
      const data = await res.json();
      setScanPipeline(data.data);
    } catch {}
    finally { setScanLoading(false); }
  };

  // Satellite Detail Handler
  const handleSatDetail = async (noradId: number) => {
    try {
      const res = await fetch(`${API}/api/v1/satellites/detail?noradId=${noradId}`);
      const data = await res.json();
      setSatDetail(data.data);
    } catch {}
  };

  // Compare Satellites
  const handleCompare = async () => {
    if (compareList.length === 0) return;
    try {
      const res = await fetch(`${API}/api/v1/satellites/compare?noradIds=${compareList.join(',')}`);
      const data = await res.json();
      setCompareData(data.data || []);
    } catch {}
  };

  // Curate Claim
  const handleCurateClaim = async (claimId: string, action: string) => {
    try {
      await fetch(`${API}/api/v1/knowledge/curate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId, action })
      });
      // Refresh claims
      const r = await fetch(`${API}/api/v1/knowledge/claims`);
      const d = await r.json();
      setClaimsData(d.data);
    } catch {}
  };

  // Add Watchlist
  const handleAddWatchlist = async () => {
    if (!newWlTarget.trim()) return;
    try {
      await fetch(`${API}/api/v1/knowledge/watchlists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: newWlTarget, type: newWlType, frequencyHours: 6 })
      });
      setNewWlTarget('');
      const r = await fetch(`${API}/api/v1/knowledge/watchlists`);
      const d = await r.json();
      setWatchlists(d.data);
    } catch {}
  };

  return (
    <div className="knowledge-center-container">
      {/* Sub-navigation Header */}
      <div className="kc-subnav">
        <button className={`kc-nav-btn ${subTab === 'search' ? 'active' : ''}`} onClick={() => setSubTab('search')}>
          🔍 Global Search
        </button>
        <button className={`kc-nav-btn ${subTab === 'deepscan' ? 'active' : ''}`} onClick={() => setSubTab('deepscan')}>
          ⚡ Deep Scan & Crawler
        </button>
        <button className={`kc-nav-btn ${subTab === 'satellites' ? 'active' : ''}`} onClick={() => setSubTab('satellites')}>
          📡 100+ Satellites (SGP4)
        </button>
        <button className={`kc-nav-btn ${subTab === 'graph' ? 'active' : ''}`} onClick={() => setSubTab('graph')}>
          🧠 Knowledge Graph
        </button>
        <button className={`kc-nav-btn ${subTab === 'claims' ? 'active' : ''}`} onClick={() => setSubTab('claims')}>
          ⚔ Claims & Conflicts
        </button>
        <button className={`kc-nav-btn ${subTab === 'watchlists' ? 'active' : ''}`} onClick={() => setSubTab('watchlists')}>
          ⏱ Watchlists & Jobs
        </button>
        <button className={`kc-nav-btn ${subTab === 'admin' ? 'active' : ''}`} onClick={() => setSubTab('admin')}>
          ⚙ Sources & Admin
        </button>
      </div>

      <div className="kc-body">
        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* TAB 1: GLOBAL SEARCH ENGINE                                      */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        {subTab === 'search' && (
          <div className="kc-section">
            <div className="card">
              <div className="card-title">GLOBAL INTELLIGENCE SEARCH ENGINE (Multi-Provider Abstraction)</div>
              <p className="kc-hint">
                Supports operators: <code>site:nasa.gov</code>, <code>satellite:25544</code>, <code>entity:ISS</code>, <code>location:Pakistan</code>, <code>before:2026-01-01</code>
              </p>

              <div className="search-row" style={{ marginTop: 12 }}>
                <input
                  type="text"
                  className="search-input"
                  placeholder='Search query (e.g. "satellites over Pakistan", "site:celestrak.org", "entity:ISS")'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button className="btn-scan" onClick={() => handleSearch()} disabled={searchLoading}>
                  {searchLoading ? 'Searching…' : 'SEARCH'}
                </button>
              </div>

              {/* Sample Operator Presets */}
              <div className="kc-preset-row">
                <span className="kc-label">Quick Presets:</span>
                {['satellites over Pakistan', 'entity:ISS', 'satellite:25544', 'site:celestrak.org', 'Starlink constellation', 'AI cybersecurity companies'].map(p => (
                  <button key={p} className="kc-preset-tag" onClick={() => { setSearchQuery(p); handleSearch(p); }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Results Display */}
            {searchResults && (
              <div className="kc-search-results-wrapper">
                <div className="kc-results-header">
                  <div>
                    <span className="kc-badge-green">{searchResults.totalCount} RESULTS FOUND</span>
                    <span className="kc-badge-amber" style={{ marginLeft: 8 }}>PROVIDER: {searchResults.providerUsed}</span>
                    <span className="kc-time" style={{ marginLeft: 8 }}>Time: {searchResults.executionTimeMs}ms</span>
                  </div>

                  <button className="btn-scan" onClick={handleAskAi} disabled={aiLoading}>
                    {aiLoading ? 'Synthesizing…' : '🤖 ASK AI ABOUT RESULTS'}
                  </button>
                </div>

                {/* AI Synthesis Modal / Box */}
                {aiSynthesis && (
                  <div className="card kc-ai-box">
                    <div className="card-title" style={{ color: 'var(--cyan)' }}>🤖 AI MULTI-SOURCE SYNTHESIS & FACT VERIFICATION</div>
                    <p style={{ marginTop: 6, fontSize: 13, lineHeight: '1.5' }}>{aiSynthesis.answer}</p>
                    
                    <div className="kc-grid-2" style={{ marginTop: 12 }}>
                      <div>
                        <div className="kc-subtitle">COMMON CLAIMS ACROSS SOURCES</div>
                        <ul>
                          {aiSynthesis.commonClaims?.map((c: string, i: number) => (
                            <li key={i} style={{ fontSize: 12, margin: '4px 0', color: 'var(--text-bright)' }}>✓ {c}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <div className="kc-subtitle">SOURCE CITATIONS</div>
                        {aiSynthesis.citations?.map((cit: any) => (
                          <div key={cit.id} className="kc-citation-item">
                            <strong>{cit.id}</strong> {cit.title} — <em>{cit.domain}</em>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Search Result Cards */}
                <div className="kc-results-list">
                  {searchResults.results.map((r: any, idx: number) => (
                    <div key={idx} className="card kc-result-card">
                      <div className="kc-res-title-row">
                        <a href={r.url} target="_blank" rel="noreferrer" className="kc-res-title">
                          [{idx + 1}] {r.title}
                        </a>
                        <span className="kc-res-tag">{r.category}</span>
                      </div>
                      <div className="kc-res-url">{r.url}</div>
                      <div className="kc-res-snippet">{r.snippet}</div>

                      <div className="kc-res-footer">
                        <span className="kc-res-meta">Source: <strong>{r.source}</strong> · Date: {r.date} · Provenance: <span style={{ color: 'var(--cyan)' }}>{r.provenance?.confidence || 'HIGH'}</span></span>
                        
                        <div className="kc-res-actions">
                          <button className="kc-btn-xs" onClick={() => window.open(r.url, '_blank')}>OPEN</button>
                          <button className="kc-btn-xs" onClick={() => { setSubTab('deepscan'); setScanQuery(r.url); }}>SCAN PAGE</button>
                          <button className="kc-btn-xs" onClick={() => { setSubTab('watchlists'); setNewWlTarget(r.domain); }}>WATCH</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* TAB 2: DEEP SCAN & SAFE INTELLIGENCE CRAWLER                    */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        {subTab === 'deepscan' && (
          <div className="kc-section">
            <div className="card">
              <div className="card-title">SAFE INTELLIGENCE CRAWLER & DEEP SCAN PIPELINE</div>
              <p className="kc-hint">Executes 9-stage pipeline: SEARCH → DISCOVER → DEDUPLICATE → CRAWL → WEB-CHECK → ENTITY EXTRACT → KNOWLEDGE GRAPH → SUMMARY</p>
              
              <div className="search-row" style={{ marginTop: 12 }}>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Enter target mission, company or domain for Deep Scan..."
                  value={scanQuery}
                  onChange={(e) => setScanQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleDeepScan()}
                />
                <button className="btn-scan" onClick={handleDeepScan} disabled={scanLoading}>
                  {scanLoading ? 'Executing Deep Scan…' : 'DEEP SCAN'}
                </button>
              </div>
            </div>

            {scanPipeline && (
              <div className="card" style={{ marginTop: 16 }}>
                <div className="card-title">DEEP SCAN EXECUTION PIPELINE PROGRESS</div>
                <div className="kc-pipeline-tracker">
                  {scanPipeline.pipelineSteps.map((step: any) => (
                    <div key={step.step} className="kc-pipeline-step">
                      <div className="kc-step-num">STEP 0{step.step}</div>
                      <div className="kc-step-title">{step.title}</div>
                      <div className="kc-step-details">{step.details}</div>
                    </div>
                  ))}
                </div>

                <div className="kc-summary-box" style={{ marginTop: 16 }}>
                  <div className="kc-subtitle" style={{ color: 'var(--green)' }}>SUMMARY GENERATED</div>
                  <p>{scanPipeline.summary}</p>

                  <div style={{ marginTop: 10 }}>
                    <strong>Extracted Claims:</strong>
                    {scanPipeline.claimsExtracted?.map((cl: any, idx: number) => (
                      <div key={idx} className="kc-claim-badge">
                        <code>{cl.subject}</code> — [{cl.predicate}] → <code>{cl.object}</code> (Confidence: {cl.confidence})
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* TAB 3: 100+ REAL SATELLITES INTELLIGENCE LAYER                   */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        {subTab === 'satellites' && (
          <div className="kc-section">
            <div className="card">
              <div className="card-title">100+ REAL SATELLITE CATALOG & SGP4 ORBIT PROPAGATION</div>
              <p className="kc-hint">Real CelesTrak GP/OMM data + SatNOGS telemetry. Orbit positions propagated dynamically in real time via SGP4 mathematical model.</p>

              <div className="kc-sat-filters">
                <select className="search-input" style={{ width: 180 }} value={satFilterCategory} onChange={(e) => setSatFilterCategory(e.target.value)}>
                  <option value="ALL">All Categories</option>
                  <option value="ISS">Space Stations</option>
                  <option value="COMMUNICATIONS">Communications (Starlink)</option>
                  <option value="NAVIGATION">Navigation (GPS/Galileo/GLONASS)</option>
                  <option value="WEATHER">Weather Satellites</option>
                  <option value="EARTH OBSERVATION">Earth Observation</option>
                  <option value="SCIENTIFIC">Space Science</option>
                  <option value="LEO">LEO Orbit</option>
                  <option value="GEO">GEO Orbit</option>
                </select>

                <input
                  type="text"
                  className="search-input"
                  placeholder="Search NORAD ID, Satellite Name, or Operator..."
                  style={{ flex: 1, marginLeft: 12 }}
                  value={satSearchTerm}
                  onChange={(e) => setSatSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchSatellites()}
                />

                <button className="btn-scan" style={{ marginLeft: 12 }} onClick={fetchSatellites}>
                  REFRESH CATALOG
                </button>
              </div>
            </div>

            {/* Satellites Grid */}
            <div className="kc-sat-grid">
              <div className="card kc-sat-list-card">
                <div className="card-title">LIVE SATELLITES ({satellites.length} RECORDS LOADED)</div>
                {satLoading ? (
                  <div className="kc-loading">Propagating SGP4 Orbital Coordinates...</div>
                ) : (
                  <div className="kc-sat-table-wrapper">
                    <table className="kc-table">
                      <thead>
                        <tr>
                          <th>NORAD ID</th>
                          <th>NAME</th>
                          <th>CATEGORY / ORBIT</th>
                          <th>LATITUDE</th>
                          <th>LONGITUDE</th>
                          <th>ALTITUDE</th>
                          <th>VELOCITY</th>
                          <th>ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {satellites.map((sat) => (
                          <tr key={sat.noradId} className={selectedSat?.noradId === sat.noradId ? 'selected-row' : ''} onClick={() => { setSelectedSat(sat); handleSatDetail(sat.noradId); }}>
                            <td><code>{sat.noradId}</code></td>
                            <td><strong>{sat.name}</strong></td>
                            <td><span className="kc-badge-cyan">{sat.orbitalElements?.orbitClass} ({sat.category})</span></td>
                            <td style={{ color: 'var(--green)' }}>{sat.latitude}°</td>
                            <td style={{ color: 'var(--green)' }}>{sat.longitude}°</td>
                            <td>{sat.altitudeKm} km</td>
                            <td>{sat.velocityKms} km/s</td>
                            <td>
                              <button className="kc-btn-xs" onClick={(e) => {
                                e.stopPropagation();
                                if (!compareList.includes(sat.noradId)) setCompareList([...compareList, sat.noradId]);
                              }}>+ COMPARE</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Satellite Detail Panel */}
              {satDetail && (
                <div className="card kc-sat-detail-card">
                  <div className="card-title" style={{ color: 'var(--green)' }}>
                    📡 SATELLITE INTELLIGENCE PROFILE: {satDetail.name}
                  </div>
                  <div className="kc-sat-meta-list">
                    <div><strong>NORAD ID:</strong> {satDetail.noradId}</div>
                    <div><strong>COSPAR ID:</strong> {satDetail.internationalDesignator}</div>
                    <div><strong>Operator:</strong> {satDetail.operator}</div>
                    <div><strong>Country:</strong> {satDetail.country}</div>
                    <div><strong>Mission:</strong> {satDetail.mission}</div>
                    <div><strong>Orbit Class:</strong> {satDetail.orbitalElements?.orbitClass}</div>
                    <div><strong>Apogee / Perigee:</strong> {satDetail.orbitalElements?.apogeeKm}km / {satDetail.orbitalElements?.perigeeKm}km</div>
                    <div><strong>Inclination:</strong> {satDetail.orbitalElements?.inclinationDeg}°</div>
                    <div><strong>Period:</strong> {satDetail.orbitalElements?.periodMin} mins</div>
                    <div><strong>Data Quality:</strong> <span className="kc-badge-green">{satDetail.dataQuality?.position}</span></div>
                  </div>

                  <div className="kc-disclaimer-box" style={{ marginTop: 12 }}>
                    <strong>DATA PROVENANCE & DISCLAIMER:</strong> {satDetail.provenance?.disclaimer}
                  </div>

                  {/* Ground Track Preview */}
                  <div style={{ marginTop: 14 }}>
                    <div className="kc-subtitle">GROUND TRACK PREDICTION (NEXT 90 MINS)</div>
                    <div className="kc-ground-track-list">
                      {satDetail.groundTrack?.slice(0, 5).map((gt: any) => (
                        <div key={gt.minuteOffset} className="kc-gt-item">
                          + {gt.minuteOffset}m → {gt.lat}°N, {gt.lng}°E ({gt.altKm}km)
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Compare Bar */}
            {compareList.length > 0 && (
              <div className="card" style={{ marginTop: 16 }}>
                <div className="kc-results-header">
                  <div className="card-title">SATELLITE COMPARISON BAR ({compareList.length} SELECTED)</div>
                  <div>
                    <button className="btn-scan" onClick={handleCompare}>COMPARE SATELLITES</button>
                    <button className="kc-btn-xs" style={{ marginLeft: 8 }} onClick={() => { setCompareList([]); setCompareData([]); }}>CLEAR</button>
                  </div>
                </div>

                {compareData.length > 0 && (
                  <div className="kc-compare-table-wrapper" style={{ marginTop: 12 }}>
                    <table className="kc-table">
                      <thead>
                        <tr>
                          <th>ATTRIBUTE</th>
                          {compareData.map(s => <th key={s.noradId}>{s.name}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><strong>NORAD ID</strong></td>
                          {compareData.map(s => <td key={s.noradId}><code>{s.noradId}</code></td>)}
                        </tr>
                        <tr>
                          <td><strong>OPERATOR</strong></td>
                          {compareData.map(s => <td key={s.noradId}>{s.operator}</td>)}
                        </tr>
                        <tr>
                          <td><strong>ALTITUDE (KM)</strong></td>
                          {compareData.map(s => <td key={s.noradId}>{s.currentPosition?.altitudeKm} km</td>)}
                        </tr>
                        <tr>
                          <td><strong>INCLINATION</strong></td>
                          {compareData.map(s => <td key={s.noradId}>{s.orbitalElements?.inclinationDeg}°</td>)}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* TAB 4: KNOWLEDGE GRAPH EXPLORER                                  */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        {subTab === 'graph' && (
          <div className="kc-section">
            <div className="card">
              <div className="card-title">CONTINUOUS KNOWLEDGE GRAPH EXPLORER</div>
              <p className="kc-hint">Interactive entity & relationship graph displaying source citations for every edge connection.</p>
            </div>

            <div className="kc-graph-wrapper">
              <div className="card kc-graph-canvas">
                <div className="kc-subtitle">INTERACTIVE KNOWLEDGE NETWORK (NODES & EDGES)</div>
                <div className="kc-graph-nodes-visual">
                  {graphData.nodes.map(n => (
                    <div
                      key={n.id}
                      className={`kc-node-chip ${n.type}`}
                      onClick={() => setSelectedNode(n)}
                    >
                      <span className="kc-node-type">{n.type}</span>
                      <strong>{n.label}</strong>
                    </div>
                  ))}
                </div>

                <div className="kc-edges-list" style={{ marginTop: 16 }}>
                  <div className="kc-subtitle">VERIFIED RELATIONSHIPS & CITATIONS</div>
                  {graphData.edges.map(e => (
                    <div key={e.id} className="kc-edge-item">
                      <code>{e.source}</code> ── [ <strong>{e.relation}</strong> · Confidence: {e.confidence} ] ──► <code>{e.target}</code>
                      <span className="kc-edge-source">Citation Source: {e.provenance}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedNode && (
                <div className="card kc-graph-inspector">
                  <div className="card-title" style={{ color: 'var(--cyan)' }}>NODE INSPECTOR: {selectedNode.label}</div>
                  <div><strong>ID:</strong> {selectedNode.id}</div>
                  <div><strong>Type:</strong> {selectedNode.type}</div>
                  <div><strong>Information:</strong> {selectedNode.info}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* TAB 5: CLAIMS & SOURCE CONFLICT RESOLUTION                       */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        {subTab === 'claims' && (
          <div className="kc-section">
            <div className="card">
              <div className="card-title">CLAIM SYSTEM & CONFLICT RESOLUTION CENTER</div>
              <p className="kc-hint">Knowledge stored as structured claims with source provenance. Conflicting claims are flagged for human curation.</p>
            </div>

            {claimsData && (
              <div className="kc-claims-wrapper" style={{ marginTop: 16 }}>
                {/* Conflict Warnings */}
                {claimsData.conflicts && claimsData.conflicts.length > 0 && (
                  <div className="card" style={{ borderColor: 'var(--border-red)' }}>
                    <div className="card-title" style={{ color: 'var(--red)' }}>⚠ CONFLICT DETECTED ACROSS SOURCES</div>
                    {claimsData.conflicts.map((conf: any) => (
                      <div key={conf.id} className="kc-conflict-box">
                        <div><strong>Subject:</strong> {conf.subject} | <strong>Predicate:</strong> {conf.predicate}</div>
                        <div className="kc-grid-2" style={{ marginTop: 8 }}>
                          <div className="kc-conf-source">
                            <span className="kc-label">SOURCE A: {conf.sourceA.publisher}</span>
                            <div>Claims: <strong>{conf.sourceA.claim}</strong></div>
                            <div>Date: {conf.sourceA.date} · Confidence: {conf.sourceA.confidence}</div>
                          </div>
                          <div className="kc-conf-source">
                            <span className="kc-label">SOURCE B: {conf.sourceB.publisher}</span>
                            <div>Claims: <strong>{conf.sourceB.claim}</strong></div>
                            <div>Date: {conf.sourceB.date} · Confidence: {conf.sourceB.confidence}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Claims Table */}
                <div className="card" style={{ marginTop: 16 }}>
                  <div className="card-title">VERIFIED KNOWLEDGE CLAIMS ({claimsData.claims?.length})</div>
                  <table className="kc-table" style={{ marginTop: 10 }}>
                    <thead>
                      <tr>
                        <th>SUBJECT</th>
                        <th>PREDICATE</th>
                        <th>OBJECT</th>
                        <th>SOURCE / PUBLISHER</th>
                        <th>CONFIDENCE</th>
                        <th>STATUS</th>
                        <th>CURATE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {claimsData.claims?.map((cl: any) => (
                        <tr key={cl.id}>
                          <td><strong>{cl.subject}</strong></td>
                          <td><code>{cl.predicate}</code></td>
                          <td>{cl.object}</td>
                          <td>{cl.publisher}</td>
                          <td>{cl.confidence}</td>
                          <td><span className="kc-badge-green">{cl.status}</span></td>
                          <td>
                            <button className="kc-btn-xs" onClick={() => handleCurateClaim(cl.id, 'APPROVE')}>APPROVE</button>
                            <button className="kc-btn-xs" style={{ marginLeft: 4 }} onClick={() => handleCurateClaim(cl.id, 'REJECT')}>REJECT</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* TAB 6: WATCHLISTS & RESEARCH JOBS                                */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        {subTab === 'watchlists' && (
          <div className="kc-section">
            <div className="card">
              <div className="card-title">AUTOMATED WATCHLISTS & RESEARCH SCHEDULER</div>
              <div className="search-row" style={{ marginTop: 12 }}>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Target domain, satellite, location or keyword to watch..."
                  value={newWlTarget}
                  onChange={(e) => setNewWlTarget(e.target.value)}
                />
                <select className="search-input" style={{ width: 140, marginLeft: 8 }} value={newWlType} onChange={(e) => setNewWlType(e.target.value)}>
                  <option value="KEYWORD">KEYWORD</option>
                  <option value="DOMAIN">DOMAIN</option>
                  <option value="SATELLITE">SATELLITE</option>
                  <option value="LOCATION">LOCATION</option>
                </select>
                <button className="btn-scan" style={{ marginLeft: 8 }} onClick={handleAddWatchlist}>+ CREATE WATCHLIST</button>
              </div>
            </div>

            <div className="card" style={{ marginTop: 16 }}>
              <div className="card-title">ACTIVE WATCHLISTS</div>
              <div className="kc-wl-list">
                {watchlists.map(wl => (
                  <div key={wl.id} className="kc-wl-item">
                    <div>
                      <strong>{wl.target}</strong> <span className="kc-badge-cyan">{wl.type}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                      Frequency: Every {wl.frequencyHours}h · Last Run: {wl.lastRun}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* TAB 7: SOURCES & ADMIN CONTROL                                   */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        {subTab === 'admin' && (
          <div className="kc-section">
            <div className="card">
              <div className="card-title">DATA SOURCES & ADMIN CONTROL CENTER</div>
              <table className="kc-table" style={{ marginTop: 12 }}>
                <thead>
                  <tr>
                    <th>SOURCE NAME</th>
                    <th>TYPE</th>
                    <th>STATUS</th>
                    <th>RECORDS INGESTED</th>
                    <th>LAST SYNC</th>
                  </tr>
                </thead>
                <tbody>
                  {adminSources.map((src, idx) => (
                    <tr key={idx}>
                      <td><strong>{src.name}</strong></td>
                      <td><code>{src.type}</code></td>
                      <td><span className="kc-badge-green">{src.status}</span></td>
                      <td>{src.records}</td>
                      <td>{src.lastSync}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
