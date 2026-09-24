import http from 'node:http';
import { GodsEyeAdapter, WorldMonitorAdapter, MissionControlAdapter, WebCheckAdapter, SecurityLabAdapter } from '@command-center/adapters';

const PORT = process.env.PORT || 3001;

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url || '/', `http://${req.headers.host}`);

  if (url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'HEALTHY', timestamp: new Date().toISOString(), services: ['godseye', 'worldmonitor', 'missioncontrol', 'webcheck', 'securitylab'] }));
    return;
  }

  if (url.pathname === '/api/v1/telemetry/aircraft') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(GodsEyeAdapter.getLiveAircraft()));
    return;
  }

  if (url.pathname === '/api/v1/telemetry/vessels') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(GodsEyeAdapter.getLiveVessels()));
    return;
  }

  if (url.pathname === '/api/v1/intel/news') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(WorldMonitorAdapter.getGlobalIntelligence()));
    return;
  }

  if (url.pathname === '/api/v1/satellites') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(MissionControlAdapter.getSatellites()));
    return;
  }

  if (url.pathname === '/api/v1/ground-stations') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(MissionControlAdapter.getGroundStations()));
    return;
  }

  if (url.pathname === '/api/v1/web-intel/scan') {
    const domain = url.searchParams.get('domain') || 'example.com';
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(WebCheckAdapter.scanDomain(domain)));
    return;
  }

  if (url.pathname === '/api/v1/security/assess' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const findings = SecurityLabAdapter.runAssessment(payload.target || 'target.local', payload.authorizationContext || {
          authorizedBy: 'OperatorAdmin',
          scope: 'Internal-Simulated',
          expiresAt: new Date(Date.now() + 3600000).toISOString()
        });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(findings));
      } catch (err: any) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

server.listen(PORT, () => {
  console.log(`[API GATEWAY] Ultimate Command Center Server running on http://localhost:${PORT}`);
});
