const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { getBotVersion } = require('../infrastructure/config/version');

function createDashboardServer({
  client,
  port = 8787,
  host = '0.0.0.0',
  publicUrl,
  discordClientId,
  discordClientSecret,
}) {
  const publicDir = path.join(__dirname, 'public');
  const sessions = new Map();
  const server = http.createServer(async (request, response) => {
    if (request.url === '/auth/discord') {
      const redirect = `${publicUrl ?? `http://localhost:${port}`}/auth/callback`;
      response.writeHead(302, {
        Location: `https://discord.com/oauth2/authorize?client_id=${discordClientId}&response_type=code&redirect_uri=${encodeURIComponent(redirect)}&scope=identify`,
      });
      return response.end();
    }
    if (request.url.startsWith('/auth/callback')) {
      const code = new URL(request.url, `http://${request.headers.host}`).searchParams.get('code');
      if (!code || !discordClientSecret)
        return json(response, 400, { error: 'OAuth is not configured.' });
      const redirect = `${publicUrl ?? `http://localhost:${port}`}/auth/callback`;
      const token = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: discordClientId,
          client_secret: discordClientSecret,
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirect,
        }),
      }).then((r) => r.json());
      const user = await fetch('https://discord.com/api/users/@me', {
        headers: { Authorization: `Bearer ${token.access_token}` },
      }).then((r) => r.json());
      const session = `${user.id}.${Date.now()}`;
      sessions.set(session, user);
      response.writeHead(302, {
        'Set-Cookie': `arrakis_session=${session}; HttpOnly; SameSite=Lax; Path=/`,
        Location: '/',
      });
      return response.end();
    }
    if (request.url === '/api/health')
      return json(response, 200, {
        ok: true,
        bot: client.user?.tag ?? null,
        version: getBotVersion(),
      });
    if (request.url === '/api/me') {
      const user = sessionUser(request, sessions);
      return user
        ? json(response, 200, { ok: true, user })
        : json(response, 401, { ok: false, error: 'Discord login required.' });
    }
    if (request.url === '/api/dune/status') {
      try {
        return json(response, 200, await client.duneApi.call('GET', '/api/server/status'));
      } catch (error) {
        return json(response, 502, { ok: false, error: error.message });
      }
    }
    const file = request.url === '/' ? 'index.html' : request.url.slice(1);
    if (!['index.html', 'dashboard.css', 'dashboard.js'].includes(file))
      return json(response, 404, { error: 'Not found' });
    response.writeHead(200, {
      'Content-Type': file.endsWith('.html')
        ? 'text/html; charset=utf-8'
        : file.endsWith('.css')
          ? 'text/css'
          : 'application/javascript',
    });
    response.end(fs.readFileSync(path.join(publicDir, file)));
  });
  return {
    listen: () => new Promise((resolve) => server.listen(port, host, resolve)),
    close: () => new Promise((resolve) => server.close(resolve)),
    port,
  };
}
function sessionUser(request, sessions) {
  const value = request.headers.cookie?.match(/arrakis_session=([^;]+)/)?.[1];
  return value ? sessions.get(value) : null;
}
function json(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(body));
}
module.exports = { createDashboardServer };
