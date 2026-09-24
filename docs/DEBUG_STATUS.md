# DEBUG STATUS — System Failure Map

## Discovered Issues & Resolution Status

| ID | Component | Symptom | Root Cause | Severity | Fix | Status |
|:---|:----------|:--------|:-----------|:---------|:----|:-------|
| BUG-001 | FRONTEND | All layout broken, unstyled HTML | Tailwind CSS utility classes used but Tailwind not installed | CRITICAL | Rewrote entire CSS with vanilla design system (index.css) | ✅ FIXED |
| BUG-002 | API-GATEWAY | EADDRINUSE crash on startup | Previous server process still holding port 3001 | HIGH | Added port cleanup; documented proper stop/start | ✅ FIXED |
| BUG-003 | API-GATEWAY | All data marked `isSimulated: false` | Hardcoded provenance lied about data source | CRITICAL | All demo data now labeled `SIMULATED` with honest provenance | ✅ FIXED |
| BUG-004 | WEB-CHECK | Returned fake hardcoded scan results | No actual DNS/HTTPS probing — pure mock | CRITICAL | Rebuilt with real `dns.resolve*` + HTTPS probe | ✅ FIXED |
| BUG-005 | FRONTEND | App.tsx missing default export | Named export `App` vs default expected by main.tsx | HIGH | Changed to `export default function App()` | ✅ FIXED |
| BUG-006 | API-GATEWAY | No health/ready/diagnostics endpoints | Only `/health` with minimal response | MEDIUM | Added `/health`, `/ready`, `/version`, `/diagnostics` | ✅ FIXED |
| BUG-007 | FRONTEND | No real-time event streaming | Only polling every 10s with no SSE/WebSocket | MEDIUM | Added SSE `/api/v1/stream` + EventSource client | ✅ FIXED |
| BUG-008 | FRONTEND | No command terminal | No way to query system programmatically | HIGH | Added full terminal UI + backend `/api/v1/terminal` | ✅ FIXED |
| BUG-009 | FRONTEND | No system health dashboard | No visibility into service states | HIGH | Added System tab showing service registry + live events | ✅ FIXED |
| BUG-010 | ALL | No data mode indicator | User cannot tell if data is LIVE, DEMO, or OFFLINE | CRITICAL | Added DATA_MODE header in API responses + UI badge | ✅ FIXED |
| BUG-011 | FRONTEND | `App.css` contains Vite boilerplate | Leftover scaffolding CSS from create-vite | LOW | Superseded by `index.css` — not imported | ✅ FIXED |
| BUG-012 | SECURITY-LAB | No expiration check on authorization | Could run assessments with expired tokens | MEDIUM | Added expiration validation in `securityAssess()` | ✅ FIXED |
| BUG-013 | API-GATEWAY | No request logging or audit trail | Zero observability of API calls | HIGH | Added `systemLog[]` with event logging across all endpoints | ✅ FIXED |
| BUG-015 | DATABASE | PostgreSQL/PostGIS not provisioned | No database configured or connected | HIGH | N/A — requires infrastructure setup | ⚠️ NOT_CONFIGURED |
| BUG-016 | EVENT-BUS | NATS not provisioned | No event bus running | MEDIUM | N/A — requires infrastructure setup | ⚠️ NOT_CONFIGURED |
| BUG-017 | REDIS | Redis not provisioned | No cache/queue layer | MEDIUM | N/A — requires infrastructure setup | ⚠️ NOT_CONFIGURED |
| BUG-018 | GODS-EYE | No live upstream connection | Upstream repo not cloned/running as service | MEDIUM | Serving DEMO data with honest labeling | ⚠️ DEMO MODE |
| BUG-019 | WORLD-MONITOR | No live upstream connection | AGPL-3.0 service requires separate deployment | MEDIUM | Serving DEMO data with honest labeling | ⚠️ DEMO MODE |
| BUG-020 | MISSION-CONTROL | No live upstream connection | Apache-2.0 service not deployed | MEDIUM | Serving DEMO satellite data | ⚠️ DEMO MODE |
| BUG-021 | OVERWATCH | No integration at all | Service not deployed or configured | LOW | Marked NOT_CONFIGURED in service registry | ⚠️ NOT_CONFIGURED |
| BUG-022 | PENTAGI | No integration at all | MIT-licensed engine requires Docker isolation setup | LOW | Marked NOT_CONFIGURED; security lab returns mock findings | ⚠️ NOT_CONFIGURED |
| BUG-023 | CYBERSTRIKE | No integration at all | Requires sandboxed deployment | LOW | Marked NOT_CONFIGURED | ⚠️ NOT_CONFIGURED |

## Services Currently Working (LIVE)
- **API Gateway** — Full REST API with health/ready/diagnostics/SSE/terminal
- **Web-Check** — Real DNS resolution + HTTPS probing (no mocking)
- **Security Lab** — Authorization gate with expiration validation
- **Command Terminal** — Real system command execution
- **System Monitor** — Real service health tracking + SSE event log

## Services in DEMO Mode (Honest Labeling)
- **God's Eye / Aircraft** — Simulated ADS-B tracks, clearly labeled SIMULATED
- **God's Eye / Vessels** — Simulated AIS tracks, clearly labeled SIMULATED
- **Satellite / Mission Control** — Simulated TLE propagation, clearly labeled SIMULATED
- **World Monitor / Intel** — Synthetic intelligence items, clearly labeled SIMULATED

## Services NOT CONFIGURED (Require Infrastructure)
- PostgreSQL + PostGIS database
- Redis cache
- NATS event bus
- World Monitor upstream (AGPL-3.0)
- Overwatch upstream (AGPL-3.0)
- PentAGI engine (MIT, requires Docker sandbox)
- CyberStrike engine (requires Docker sandbox)
