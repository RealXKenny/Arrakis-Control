const http = require("node:http");
const crypto = require("node:crypto");
const { URL } = require("node:url");

require("dotenv").config({ quiet: true });
const { createLogger } = require("../infrastructure/core/logger");
const { DuneConsoleClient } = require("../infrastructure/api/core/DuneConsoleClient");
const logger = createLogger("DASHBOARD");

const port = Number(process.env.DASHBOARD_PORT ?? 8787);
const clientId = process.env.DISCORD_CLIENT_ID ?? process.env.CLIENT_ID;
const clientSecret = process.env.DISCORD_CLIENT_SECRET;
const redirectUri = process.env.DISCORD_REDIRECT_URI ?? `http://localhost:${port}/auth/callback`;
const guildId = process.env.GUILD_ID;
const ownerRoleId = process.env.OWNER_ROLE_ID;
const sessionSecret = process.env.SESSION_SECRET;
const sessions = new Map();
const duneClient = new DuneConsoleClient(process.env.CONSOLE_URL);
const sessionCleanup = setInterval(() => {
  for (const [id, session] of sessions) {
    if (session.expiresAt < Date.now()) sessions.delete(id);
  }
}, 15 * 60_000);

if (!clientId || !clientSecret || !guildId || !ownerRoleId || !sessionSecret) {
  throw new Error("Dashboard requires DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, GUILD_ID, OWNER_ROLE_ID, and SESSION_SECRET.");
}

const server = http.createServer(async (request, response) => {
  try {
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("X-Frame-Options", "DENY");
    response.setHeader("Referrer-Policy", "same-origin");
    const url = new URL(request.url, `http://${request.headers.host}`);
    if (url.pathname === "/") return sendHtml(response, landingPage());
    if (url.pathname === "/styles.css") return sendStylesheet(response);
    if (url.pathname === "/hagga-basin.png") return sendMapImage(response);
    if (url.pathname.startsWith("/map-icons/")) return sendMapIcon(response, url.pathname.slice("/map-icons/".length));
    if (url.pathname === "/auth/login") return redirect(response, discordLoginUrl());
    if (url.pathname === "/auth/callback") return handleCallback(url, response);
    if (url.pathname === "/auth/logout") return logout(request, response);
    if (url.pathname === "/dashboard") return requireOwner(request, response, dashboardPage);
    if (url.pathname === "/portal") return requireLogin(request, response, portalPage);
    if (url.pathname === "/api/session") return requireOwner(request, response, (res, user) => sendJson(res, { user }));
    if (url.pathname === "/api/player") return requireLogin(request, response, loadPlayer);
    if (url.pathname === "/map") return requireLogin(request, response, mapPage);
    if (url.pathname === "/map-view") return requireLogin(request, response, mapPageExternal);
    if (url.pathname === "/api/map") return requireLogin(request, response, loadMap);
    if (url.pathname === "/api/stats") return requireOwner(request, response, (res) => loadStats(res));
    if (url.pathname === "/api/control/restart" && request.method === "POST") return requireOwner(request, response, restartBot);
    response.writeHead(404).end("Not found");
  } catch (error) {
    response.writeHead(500).end("Dashboard error");
    console.error(error);
  }
});

server.listen(port, async () => { await duneClient.login(process.env.CONSOLE_PASSWORD); logger.info(`Owner dashboard listening on http://localhost:${port}`); });

for (const signal of ["SIGINT", "SIGTERM", "SIGBREAK"]) {
  process.once(signal, async () => {
    clearInterval(sessionCleanup);
    await duneClient.logout().catch(() => {});
    server.close(() => process.exit(0));
  });
}

process.on("unhandledRejection", (error) => logger.error("Dashboard unhandled rejection.", error));
process.on("uncaughtException", (error) => logger.error("Dashboard uncaught exception.", error));

function discordLoginUrl() {
  const params = new URLSearchParams({ client_id: clientId, redirect_uri: redirectUri, response_type: "code", scope: "identify guilds.members.read" });
  return `https://discord.com/oauth2/authorize?${params}`;
}

async function handleCallback(url, response) {
  if (!url.searchParams.get("code")) return redirect(response, "/");
  const token = await discordRequest("https://discord.com/api/oauth2/token", { method: "POST", body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, grant_type: "authorization_code", code: url.searchParams.get("code"), redirect_uri: redirectUri }), form: true });
  const user = await discordRequest("https://discord.com/api/users/@me", { headers: { Authorization: `Bearer ${token.access_token}` } });
  const member = await discordRequest(`https://discord.com/api/users/@me/guilds/${guildId}/member`, { headers: { Authorization: `Bearer ${token.access_token}` } });
  const isOwner = member.roles?.includes(ownerRoleId);
  const sessionId = crypto.randomBytes(32).toString("hex");
  sessions.set(sessionId, { user, guildId, roleIds: member.roles ?? [], isOwner, expiresAt: Date.now() + 86_400_000 });
  response.writeHead(302, { Location: isOwner ? "/dashboard" : "/portal", "Set-Cookie": `dashboard_session=${sessionId}; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400` }).end();
}

function requireOwner(request, response, handler) {
  const sessionId = request.headers.cookie?.match(/dashboard_session=([^;]+)/)?.[1];
  const session = sessions.get(sessionId);
  if (!session || session.expiresAt < Date.now()) return redirect(response, "/auth/login");
  if (!session.isOwner) return sendHtml(response, "<h1>Access denied</h1><p>Owner role required.</p>", 403);
  return handler(response, session.user);
}

function requireLogin(request, response, handler) {
  const sessionId = request.headers.cookie?.match(/dashboard_session=([^;]+)/)?.[1];
  const session = sessions.get(sessionId);
  if (!session || session.expiresAt < Date.now()) return redirect(response, "/auth/login");
  return handler(response, session);
}

function logout(request, response) {
  const sessionId = request.headers.cookie?.match(/dashboard_session=([^;]+)/)?.[1];
  sessions.delete(sessionId);
  response.writeHead(302, { Location: "/", "Set-Cookie": "dashboard_session=; HttpOnly; Path=/; Max-Age=0" }).end();
}

function landingPage() {
  const html = require("node:fs").readFileSync(require("node:path").join(__dirname, "frontend", "site.html"), "utf8");
  return html.replace("Owner sign in →", "Sign in to player portal →");
}

function dashboardPage(response, user) {
  return sendHtml(response, page(`<main><div class='topline'><span class='badge'>OWNER ACCESS</span><a class='logout' href='/auth/logout'>Sign out</a></div><p class='eyebrow'>ARRAKIS CONTROL</p><h1>Welcome, ${escapeHtml(user.username)}.</h1><p class='subtitle'>Your owner access has been verified. The control center is ready.</p><section class='status'><span class='dot'></span><div><b>Systems online</b><small>Live data refreshes automatically</small></div></section><section class='stats' id='stats'><div><b>Loading</b><span>...</span></div></section><h2>Connected guilds</h2><div id='guilds' class='guilds'><p class='muted'>Loading guilds...</p></div><h2>Player portal</h2><a class='button' href='/portal'>Open my player portal →</a><h2>Bot controls</h2><button class='danger' onclick='restartBot()'>Restart bot</button><a class='logout' href='/auth/logout'>Sign out</a><script>async function refresh(){const r=await fetch('/api/stats');if(!r.ok)return;const d=await r.json();document.getElementById('stats').innerHTML='<div><b>Uptime</b><span>'+d.uptime+'</span></div><div><b>Memory</b><span>'+d.memoryMb+' MB</span></div><div><b>Shards</b><span>'+d.shards.length+'</span></div>';document.getElementById('guilds').innerHTML=d.guilds.map(g=>'<div class="guild"><b>'+g.name+'</b><small>'+g.memberCount+' members</small></div>').join('')||'<p class="muted">No guilds found.</p>'}async function restartBot(){if(!confirm('Restart the bot?'))return;await fetch('/api/control/restart',{method:'POST'});alert('Restart requested.')}refresh();setInterval(refresh,15000);</script></main>`));
}

function portalPage(response, session) {
  logger.debug("Rendering player portal.", { userId: session.user.id, username: session.user.username });
  return sendHtml(response, page(`<main class='portal-page'><div class='topline'><span class='badge'>PLAYER PORTAL</span><a class='logout' href='/auth/logout'>Sign out</a></div><p class='eyebrow'>DUNE: AWAKENING</p><h1>Welcome, ${escapeHtml(session.user.username)}.</h1><p class='subtitle'>Your character profile and personal Hagga Basin base map, together in one place.</p><div id='player' class='server-card'>Loading player profile...</div><h2>Your Hagga Basin bases</h2><iframe class='portal-map' src='/map-view' title='Your private Hagga Basin map'></iframe><script>fetch('/api/player').then(r=>r.json()).then(d=>{if(!d.linked){document.getElementById('player').innerHTML='<b>No linked Dune character found.</b><p>'+((d.error)||'Link your character through Discord first.')+'</p>';return}const x=d.details||{};document.getElementById('player').innerHTML='<b>'+d.characterName+'</b><p>Status: '+d.onlineStatus+'</p><p>Progression: Level '+(x.progression?.level??'Unavailable')+' • XP '+(x.progression?.xp??'Unavailable')+'</p><p>Intel: '+(x.intel?.intel??'Unavailable')+' / '+(x.intel?.maxIntel??'Unavailable')+'</p><p>Health: '+Math.round(x.vitals?.currentHealth??0)+' / '+Math.round(x.vitals?.maxHealth??0)+' • Hydration: '+Math.round(x.vitals?.hydration??0)+'</p>'}).catch(()=>document.getElementById('player').textContent='Unable to load player profile.');</script></main>`));
}

function mapPage(response) {
  return sendHtml(response, page(`<main class='map-page'><div class='topline'><span class='badge'>LIVE CARTOGRAPHY</span><a class='logout' href='/auth/logout'>Sign out</a></div><p class='eyebrow'>HAGGA BASIN • LIVE MAP</p><h1>Read the desert.</h1><p class='subtitle'>Explore live players, bases, services, storage, and world markers across Hagga Basin.</p><div class='map-toolbar'><div id='layers' class='map-layers'></div><button class='button map-refresh' onclick='refresh()'>Refresh</button></div><div class='map-viewport' id='viewport'><div class='map-canvas' id='canvas'><img src='/hagga-basin.png' alt='Hagga Basin map'><div id='markers'></div></div></div><div id='map' class='server-card'>Loading map data...</div><script>
  const state={scale:.65, x:0, y:0, dragging:false, sx:0, sy:0, ox:0, oy:0, layers:{player:true,base:true,storage:true,service:true,marker:true}};
  const viewport=document.getElementById('viewport'), canvas=document.getElementById('canvas');
  function apply(){canvas.style.transform='translate('+state.x+'px,'+state.y+'px) scale('+state.scale+')'}
  viewport.addEventListener('wheel',e=>{e.preventDefault();state.scale=Math.max(.65,Math.min(3,state.scale*(e.deltaY<0?1.12:.89)));apply()},{passive:false});
  viewport.addEventListener('pointerdown',e=>{state.dragging=true;state.sx=e.clientX;state.sy=e.clientY;state.ox=state.x;state.oy=state.y;viewport.setPointerCapture(e.pointerId)});
  viewport.addEventListener('pointermove',e=>{if(state.dragging){state.x=state.ox+e.clientX-state.sx;state.y=state.oy+e.clientY-state.sy;apply()}});
  viewport.addEventListener('pointerup',()=>{state.dragging=false});
  function rows(value){return value?.rows||value?.markers||value?.players||value?.bases||value?.storage||value?.services||[]}
  function allPoints(payload){const found=[];const seen=new Set();function walk(value,hint='marker'){if(!value||typeof value!=='object')return;if(Array.isArray(value)){value.forEach(item=>walk(item,hint));return}const x=value.x??value.pos_x??value.longitude??value.position?.x??value.coordinates?.x;const y=value.y??value.pos_y??value.latitude??value.position?.y??value.coordinates?.y;if(Number.isFinite(Number(x))&&Number.isFinite(Number(y))){const id=String((value.id??value.marker_id??value.player_id??value.actor_id) || (hint+':'+x+':'+y));if(!seen.has(id)){seen.add(id);found.push({...value,x,y,_hint:hint})}}for(const [key,child] of Object.entries(value)){if(key==='partitions'||key==='capabilities'||key==='map')continue;walk(child,key.replace(/s$/,''))}}walk(payload);return found}
  function esc(value){return String(value??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]))}
  function point(p){const x=Number(p.x??p.pos_x??p.longitude),y=Number(p.y??p.pos_y??p.latitude);const world=300000;return {x:Number.isFinite(x)?(Math.abs(x)<=1?x*100:((x+world)/(world*2))*100):50,y:Number.isFinite(y)?(Math.abs(y)<=1?y*100:(1-((y+world)/(world*2)))*100):50}}
  function renderLayers(){document.getElementById('layers').innerHTML=Object.keys(state.layers).map(k=>'<label class="layer-toggle"><input type="checkbox" '+(state.layers[k]?'checked':'')+' data-layer="'+k+'"> <span class="legend-dot '+k+'"></span>'+k+'</label>').join('');document.querySelectorAll('[data-layer]').forEach(i=>i.onchange=()=>{state.layers[i.dataset.layer]=i.checked;refresh()})}
  async function refresh(){try{const d=await fetch('/api/map').then(r=>r.json());const points=rows(d.bases);let count=0;document.getElementById('markers').innerHTML=points.map(p=>{count++;const q=point(p);return '<span class="map-marker base" style="left:'+Math.max(0,Math.min(100,q.x))+'%;top:'+Math.max(0,Math.min(100,q.y))+'%" title="'+esc(p.name||p.base_name||p.id||'Base')+'"><img src="/map-icons/Base.webp" alt="Base"></span>'}).join('');document.getElementById('map').innerHTML='<b>Hagga Basin bases</b><p>'+count+' bases visible · '+(d.partitions?.length||0)+' partitions</p><small>Updated '+new Date().toLocaleTimeString()+'</small>'}catch(e){document.getElementById('map').textContent='Map data temporarily unavailable.'}}
  renderLayers();apply();refresh();setInterval(refresh,30000);
  </script></main>`));
}

function mapPageExternal(response) {
  const html = require("node:fs").readFileSync(require("node:path").join(__dirname, "frontend", "map.html"), "utf8");
  return sendHtml(response, html);
}

function page(content) {
  content = content.replace("b.water_supply??b.waterSupply??'Unavailable'", "b.water_supply??b.waterSupply??b.waterData?.containers?.[0]?.stored??'Unavailable'");
  content = content.replace("b.fuel_supply??b.fuelSupply??'Unavailable'", "b.fuel_supply??b.fuelSupply??b.fuelCells??'Unavailable'");
  content = content.replace("b.storage_volume??b.storageVolume??'Unavailable'", "b.storage_volume??b.storageVolume??'0'");
  content = content.replace("b.water_supply??b.waterSupply??b.waterData?.containers?.[0]?.stored??'Unavailable'", "b.displayValues?.waterStored??b.waterData?.containers?.[0]?.stored??'Unavailable'");
  content = content.replace("b.fuel_supply??b.fuelSupply??b.fuelCells??'Unavailable'", "b.displayValues?.fuelCells??b.fuelCells??'Unavailable'");
  content = content.replace("b.storage_volume??b.storageVolume??'0'", "b.displayValues?.storageVolume??0");
  if (content.includes("portal-page")) content = content.replace("</main>", "<script>fetch('/api/map').then(r=>r.json()).then(d=>{const rows=d.bases?.rows||[];const el=document.getElementById('base-stats');if(!el)return;el.innerHTML='<h2>Your bases</h2>'+rows.map(b=>{const containers=(b.waterData?.containers||[]).filter(c=>!String(c.type||'').toLowerCase().includes('blood'));const water=containers.reduce((n,c)=>n+Number(c.stored||0),0),waterMax=containers.reduce((n,c)=>n+Number(c.capacity||0),0)||1;const fuel=Number(b.fuelCells||0),runtime=(b.generators||[]).filter(g=>g.type==='fuel').reduce((n,g)=>n+Number(g.runtimeSeconds||0),0),maxRuntime=42*86400;return '<article class=\"base-card\"><b>'+String(b.name||'Unnamed base')+'</b><span>'+String(b.base_type||'Base')+'</span><div>Water supply<strong>'+water.toLocaleString()+' / '+waterMax.toLocaleString()+'</strong><i style=\"width:'+Math.min(100,water/waterMax*100)+'%\"></i></div><div>Fuel supply<strong>'+fuel.toLocaleString()+' · '+Math.round(Math.min(100,runtime/maxRuntime*100))+'%</strong><i style=\"width:'+Math.min(100,runtime/maxRuntime*100)+'%\"></i></div><div>Storage volume<strong>0</strong><i style=\"width:0%\"></i></div></article>'}).join('')}).catch(()=>{});</script></main>");
  if (content.includes("portal-page")) {
    content = content.replace("<span class='badge'>PRIVATE PLAYER PORTAL</span>", "<span class='badge'>PRIVATE PLAYER PORTAL</span><span id='portal-status-top' class='portal-status-pill'>Checking status…</span>");
    content = content.replace("</main>", "<script>const baseReadyObserver=new MutationObserver(()=>{if(document.querySelector('#base-stats .base-card'))document.getElementById('base-stats')?.classList.add('loaded');const s=document.querySelector('.profile-status'),t=document.getElementById('portal-status-top');if(s&&t){t.textContent=s.textContent;t.className='portal-status-pill '+(s.textContent.toLowerCase().includes('offline')?'offline':'online')}});baseReadyObserver.observe(document.body,{subtree:true,childList:true});</script></main>");
    content = content.replace(/<h2>Your Hagga Basin bases<\/h2>[\s\S]*?<\/script>/, "");
    content = content.replace("<span id='portal-status-top' class='portal-status-pill'>Checking status…</span>", "<span id='portal-status-top' class='portal-status-pill'>Checking status…</span><a class='button portal-map-button' href='/map-view'>Open map</a>");
    content = content.replace("</main>", "<script>const profileObserver=new MutationObserver(()=>{profileObserver.disconnect();document.querySelectorAll('.profile-stats span').forEach(el=>{el.textContent=el.textContent.replace(/\\d+/g,n=>Number(n).toLocaleString())});if(document.querySelector('.profile-stats'))document.getElementById('player')?.classList.add('profile-loaded');profileObserver.observe(document.body,{subtree:true,childList:true})});profileObserver.observe(document.body,{subtree:true,childList:true});</script></main>");
    content = content.replace(/<a class='logout' href='\/auth\/logout'>Sign out<\/a>/g, "<a class='button portal-signout' href='/auth/logout'>Sign out</a>");
    content = content.replace("b.fuel_supply??b.fuelSupply??'Unavailable'", "b.fuel_supply??b.fuelSupply??b.fuelCells??'Unavailable'");
    content = content.replace("b.fuel_supply??b.fuelSupply??b.fuelCells??'Unavailable'", "b.fuel_supply??b.fuelSupply??b.fuelCells??(b.generatorRuntimeSeconds?Math.round(b.generatorRuntimeSeconds/86400)+' days runtime':'Unavailable')");
    content = content.replace("b.water_supply??b.waterSupply??'Unavailable'", "b.water_supply??b.waterSupply??b.water??'Unavailable'");
    content = content.replace("b.storage_volume??b.storageVolume??'Unavailable'", "b.storage_volume??b.storageVolume??b.storageCapacity??'Unavailable'");
    content = content.replace("b.water_supply??b.waterSupply??b.water??'Unavailable'", "b.water_supply??b.waterSupply??b.water??b.waterData?.volume??b.waterData?.totalVolume??'Unavailable'");
    content = content.replace("b.storage_volume??b.storageVolume??b.storageCapacity??'Unavailable'", "b.storage_volume??b.storageVolume??b.storageCapacity??b.inventoryData?.totalVolume??b.inventoryData?.storageVolume??'Unavailable'");
    content = content.replace("b.fuel_supply??b.fuelSupply??'Unavailable'", "b.fuel_supply??b.fuelSupply??b.fuelCells??'Unavailable'");
    content = content.replace("</main>", "<section id='base-stats' class='base-stats'><h2>Your bases</h2><p>Loading base infrastructure...</p></section><script>fetch('/api/map').then(r=>r.json()).then(d=>{const rows=d.bases?.rows||[];const el=document.getElementById('base-stats');if(!rows.length){el.innerHTML='<h2>Your bases</h2><p>No bases found.</p>';return}el.innerHTML='<h2>Your bases</h2>'+rows.map(b=>'<article class=\"base-card\"><b>'+String(b.name||'Unnamed base')+'</b><span>'+String(b.base_type||'Base')+'</span><div>Water supply: <strong>'+String(b.water_supply??b.waterSupply??'Unavailable')+'</strong></div><div>Fuel supply: <strong>'+String(b.fuel_supply??b.fuelSupply??'Unavailable')+'</strong></div><div>Storage volume: <strong>'+String(b.storage_volume??b.storageVolume??'Unavailable')+'</strong></div></article>').join('')}).catch(()=>{});</script></main>");
    if (!content.includes("fetch('/api/player')")) content = content.replace("</main>", "<script>fetch('/api/player').then(r=>r.json()).then(d=>{const el=document.getElementById('player');if(!el)return;if(!d.linked){el.innerHTML='<b>No linked Dune character found.</b>';return}const x=d.details||{};el.innerHTML='<b>'+d.characterName+'</b><p>Status: '+d.onlineStatus+'</p><p>Level '+(x.progression?.level??'Unavailable')+' · XP '+(x.progression?.xp??'Unavailable')+'</p><p>Intel: '+(x.intel?.intel??'Unavailable')+' / '+(x.intel?.maxIntel??'Unavailable')+'</p>'}).catch(e=>{const el=document.getElementById('player');if(el)el.textContent='Unable to load player profile.'});</script></main>");
    content = content.replace("</main>", "<script>fetch('/api/player').then(r=>r.json()).then(d=>{if(!d.linked)return;const x=d.details||{},p=x.progression||{},i=x.intel||{},v=x.vitals||{},c=x.currency?.rows||[];const pct=(a,b)=>b?Math.max(0,Math.min(100,Number(a)/Number(b)*100)):0;document.getElementById('player').innerHTML='<div class=\"profile-head\"><div><b>'+d.characterName+'</b><span class=\"profile-status\">'+d.onlineStatus+'</span></div><span>Level '+(p.level??'—')+' / 200</span></div><div class=\"level-bar\"><i style=\"width:'+pct(p.level,200)+'%\"></i></div><div class=\"vital-grid\"><div><b>Health</b><strong>'+Math.round(v.currentHealth??0)+' / '+Math.round(v.maxHealth??0)+'</strong><i style=\"width:'+pct(v.currentHealth,v.maxHealth)+'%\"></i></div><div><b>Hydration</b><strong>'+Math.round(v.hydration??0)+' / '+Math.round(v.maxHydration??100)+'</strong><i style=\"width:'+pct(v.hydration,v.maxHydration??100)+'%\"></i></div><div><b>Spice addiction</b><strong>'+Math.round(v.spiceAddictionLevel??0)+' / '+Math.round(v.maxSpiceAddictionLevel??10)+'</strong><i style=\"width:'+pct(v.spiceAddictionLevel,v.maxSpiceAddictionLevel??10)+'%\"></i></div></div><div class=\"profile-stats\"><div><b>Intel</b><span>'+(i.intel??0)+' / '+(i.maxIntel??0)+'</span></div><div><b>Solaris Coin</b><span>'+(x['solaris-coin']?.total??0)+'</span></div><div><b>Currency</b><span>'+c.map(r=>r.label+': '+r.balance).join(' · ')+'</span></div></div>'}).catch(()=>{});</script></main>");
  }
  if (content.includes("map-page")) content = content.replace("<button class='button map-refresh' onclick='refresh()'>Refresh</button>", "<div class='map-actions'><button class='button' onclick=\"state.scale=Math.min(3,state.scale*1.2);apply()\">Zoom in</button><button class='button' onclick=\"state.scale=Math.max(.35,state.scale*.8);apply()\">Zoom out</button><button class='button' onclick=\"state.scale=.65;state.x=0;state.y=0;apply()\">Fit map</button><button class='button map-refresh' onclick='refresh()'>Refresh</button></div>");
  content = content.replace("<iframe class='portal-map' src='/map-view' title='Your private Hagga Basin map'></iframe>", "<div class='portal-inline-map'><img src='/hagga-basin.png' alt='Hagga Basin map'><div id='portal-base-markers'></div></div><script>fetch('/api/map').then(r=>r.json()).then(d=>{const rows=d.bases?.rows||d.bases?.bases||[];const world=300000;document.getElementById('portal-base-markers').innerHTML=rows.map(b=>{const x=((Number(b.x)+world)/(world*2))*100;const y=(1-((Number(b.y)+world)/(world*2)))*100;return '<span class=\"portal-base-marker\" style=\"left:'+Math.max(0,Math.min(100,x))+'%;top:'+Math.max(0,Math.min(100,y))+'%\" title=\"'+String(b.name||'Base').replace(/\"/g,'&quot;')+'\"><img src=\"/map-icons/Base.webp\" alt=\"Base\"></span>'}).join('')}).catch(()=>{})</script>");
  content = content.replace("<h2>Your Hagga Basin bases</h2>", "<h2>Your Hagga Basin bases</h2><button class='button map-open' onclick=\"document.querySelector('.portal-inline-map').classList.add('map-fullscreen')\">Open live map</button>");
  content = content.replace("<div class='portal-inline-map'>", "<div class='portal-inline-map' onclick=\"if(this.classList.contains('map-fullscreen')) this.classList.remove('map-fullscreen')\">");
  content = content.replace("src='/map-view'", `src='http://localhost:${port}/map-view'`);
  return `<!doctype html><html><head><meta name='viewport' content='width=device-width,initial-scale=1'><title>Arrakis Control</title><link rel='stylesheet' href='/styles.css'><style>:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;background:#160d08 radial-gradient(circle at 50% -10%,#70401f 0,#29160c 38%,#100805 75%);color:#f3d39b;font:16px Inter,system-ui,sans-serif;min-height:100vh;display:grid;place-items:center;padding:24px}body:before{content:'';position:fixed;inset:0;opacity:.08;pointer-events:none;background-image:radial-gradient(#f3d39b 1px,transparent 1px);background-size:24px 24px}main{position:relative;width:min(680px,100%);padding:clamp(32px,7vw,72px);text-align:center;background:linear-gradient(145deg,#211109e8,#120a06e8);border:1px solid #a86f38;border-radius:24px;box-shadow:0 30px 100px #000b}h1{font:700 clamp(34px,7vw,58px)/1.05 Georgia,serif;color:#ffe2a9;margin:12px 0}.eyebrow{letter-spacing:.28em;color:#d2a85a;font-size:12px;font-weight:800}.subtitle{color:#dbc19a;line-height:1.6;margin:18px auto 30px;max-width:460px}.button{display:inline-flex;gap:12px;align-items:center;background:#c58b45;color:#1b0e07;padding:14px 24px;border-radius:999px;text-decoration:none;font-weight:800;box-shadow:0 8px 24px #c58b4533}.button:hover{background:#e1b66d;transform:translateY(-1px)}.feature-grid,.dashboard-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:28px 0}.feature-grid div{display:grid;gap:8px;padding:16px 8px;background:#ffffff08;border:1px solid #ffffff12;border-radius:14px;color:#dbc19a;font-size:13px}.feature-grid b{color:#d2a85a}.topline{display:flex;justify-content:space-between;align-items:center;margin-bottom:26px}.badge{font-size:11px;letter-spacing:.12em;color:#1b0e07;background:#d2a85a;padding:6px 10px;border-radius:999px;font-weight:800}.logout{color:#d2a85a;text-decoration:none;font-size:13px}.status{display:flex;align-items:center;gap:14px;text-align:left;padding:16px 18px;margin:28px 0;background:#4caf5014;border:1px solid #4caf5044;border-radius:14px}.dot{width:10px;height:10px;border-radius:50%;background:#72d572;box-shadow:0 0 14px #72d572}.status b,.status small{display:block}.status small{color:#b9a185;margin-top:3px}.dashboard-grid{grid-template-columns:repeat(2,1fr);margin-bottom:0}.dashboard-grid a{display:flex;justify-content:space-between;padding:15px;background:#ffffff08;border:1px solid #ffffff12;border-radius:12px;color:#e9c98e;text-decoration:none}.dashboard-grid a:hover{border-color:#c58b45}@media(max-width:520px){.feature-grid{grid-template-columns:1fr}.dashboard-grid{grid-template-columns:1fr}}</style></head><body>${content}</body></html>`;
}

function dashboardStyles() {
  return `<style>:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;background:#160d08 radial-gradient(circle at 50% -10%,#70401f,#100805 75%);color:#f3d39b;font:16px system-ui,sans-serif;min-height:100vh;display:grid;place-items:center;padding:24px}main{width:min(680px,100%);padding:clamp(32px,7vw,72px);text-align:center;background:#211109e8;border:1px solid #a86f38;border-radius:24px;box-shadow:0 30px 100px #000b}.eyebrow{letter-spacing:.28em;color:#d2a85a;font-size:12px;font-weight:800}h1{font:700 clamp(38px,8vw,64px)/1.05 Georgia,serif;color:#ffe2a9;margin:12px 0}h2{font:700 22px Georgia,serif;color:#ffe2a9;text-align:left;margin-top:28px}.subtitle{color:#dbc19a;line-height:1.6;margin:18px auto 30px}.muted{color:#b9a185;text-align:left;font-size:14px}.status{display:flex;align-items:center;gap:14px;text-align:left;padding:16px 18px;margin:28px 0;background:#4caf5014;border:1px solid #4caf5044;border-radius:14px}.dot{width:10px;height:10px;border-radius:50%;background:#72d572;box-shadow:0 0 14px #72d572}.status b,.status small{display:block}.status small{color:#b9a185;margin-top:4px}.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.stats div{padding:14px 8px;background:#ffffff08;border:1px solid #ffffff12;border-radius:12px}.stats b,.stats span{display:block}.stats span{color:#e8c58b;margin-top:6px}.feature-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:28px 0}.feature-grid div{display:grid;gap:8px;padding:16px 8px;background:#ffffff08;border:1px solid #ffffff12;border-radius:14px;color:#dbc19a;font-size:13px}.feature-grid b{color:#d2a85a}.button{display:inline-block;background:#c58b45;color:#1b0e07;padding:14px 24px;border-radius:999px;text-decoration:none;font-weight:800}.button:hover{background:#e1b66d}@media(max-width:520px){.feature-grid,.stats{grid-template-columns:1fr}}</style>`;
}
function redirect(response, location) { response.writeHead(302, { Location: location }).end(); }
function sendHtml(response, html, status = 200) { response.writeHead(status, { "Content-Type": "text/html; charset=utf-8" }).end(html); }
function sendStylesheet(response) { const css = require("node:fs").readFileSync(require("node:path").join(__dirname, "frontend", "site.css"), "utf8"); response.writeHead(200, { "Content-Type": "text/css; charset=utf-8", "Cache-Control": "no-cache" }).end(css); }
function sendMapImage(response) { const image = require("node:fs").readFileSync(require("node:path").join(__dirname, "frontend/public/hagga-basin.png")); response.writeHead(200, { "Content-Type": "image/png", "Cache-Control": "public, max-age=3600" }).end(image); }
function sendMapIcon(response, name) { const safe = require("node:path").basename(name); const file = require("node:path").join(__dirname, "frontend/public/map-icons", safe); if (!require("node:fs").existsSync(file)) return response.writeHead(404).end("Not found"); const type = safe.toLowerCase().endsWith(".png") ? "image/png" : "image/webp"; response.writeHead(200, { "Content-Type": type, "Cache-Control": "public, max-age=86400" }).end(require("node:fs").readFileSync(file)); }
function sendJson(response, data) { response.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify(data)); }
async function loadStats(response) { const guilds = await discordRequest("https://discord.com/api/users/@me/guilds", { headers: { Authorization: `Bot ${process.env.TOKEN}` } }).catch(() => []); const count = process.env.TOTAL_SHARDS === "auto" ? 1 : Number(process.env.TOTAL_SHARDS); sendJson(response, { uptime: formatUptime(process.uptime()), uptimeSeconds: Math.floor(process.uptime()), memoryMb: Math.round(process.memoryUsage().rss / 1024 / 1024), shards: Array.from({ length: Number.isFinite(count) && count > 0 ? count : 1 }, (_, id) => ({ id, status: "online" })), guilds: guilds.map((guild) => ({ id: guild.id, name: guild.name, memberCount: guild.approximate_member_count ?? "Unknown" })) }); }
async function loadPlayer(response, session) {
  const actor = {
    guildId: session.guildId,
    channelId: "dashboard",
    userId: session.user.id,
    username: session.user.username,
    roleIds: [
      ...session.roleIds,
      process.env.VERIFIED_MEMBER_ROLE_ID,
    ].filter(Boolean),
    interactionId: `dashboard-${Date.now()}`,
    commandName: "portal",
  };

  try {
    logger.debug("Requesting player profile from Discord Adapter.", { actor, endpoint: process.env.CONSOLE_URL });
    const endpoint = `${process.env.CONSOLE_URL}/api/integrations/discord/players/me`;
    const data = await discordRequest(endpoint, {
      method: "POST",
      body: JSON.stringify({ actor }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.ADAPTER_TOKEN}`,
      },
    });
    logger.debug("Player profile response received.", data);
    if (data?.linked !== true) return sendJson(response, data);
    const playerId = data.pawnId ?? data.controllerId;
    const endpoints = ["currency", "solaris-coin", "factions", "intel", "specs", "progression", "vitals"];
    const details = await Promise.all(endpoints.map(async (name) => {
      try {
        return [name, await duneClient.request("GET", `/api/players/${encodeURIComponent(playerId)}/${name}`)];
      } catch (error) {
        logger.debug(`Player endpoint ${name} unavailable.`, error.message);
        return [name, null];
      }
    }));
    sendJson(response, { ...data, details: Object.fromEntries(details) });
  } catch (error) {
    logger.error("Unable to load player profile from the Discord Adapter.", error);
    sendJson(response, {
      ok: false,
      linked: false,
      error: "Unable to load your Dune player profile right now.",
      status: error.message,
    });
  }
}

async function loadMap(response, session) {
  const get = (route) => duneClient.request("GET", route).catch((error) => ({ ok: false, error: error.message }));
  const [partitions, markers, players, bases, storage, services] = await Promise.all([
    get("/api/map/partitions"),
    get("/api/map/markers?map=HaggaBasin&static=0"),
    get("/api/map/players?map=HaggaBasin"),
    get("/api/bases"),
    get("/api/map/storage?map=HaggaBasin"),
    get("/api/map/services?map=HaggaBasin"),
  ]);
  logger.debug(`Live map bases API response: ${JSON.stringify(bases, null, 2)}`);
  let linked = null;
  try {
    linked = await discordRequest(`${process.env.CONSOLE_URL}/api/integrations/discord/players/me`, { method: "POST", body: JSON.stringify({ actor: { guildId: session.guildId, channelId: "dashboard", userId: session.user.id, username: session.user.username, roleIds: [...session.roleIds, process.env.VERIFIED_MEMBER_ROLE_ID].filter(Boolean), interactionId: `map-${Date.now()}`, commandName: "map" } }), headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${process.env.ADAPTER_TOKEN}` } });
  } catch (error) { logger.warn("Unable to resolve linked player for map.", error.message); }
  const baseRows = bases.rows ?? bases.bases ?? [];
  const identity = [linked?.characterName, linked?.pawnId, linked?.controllerId].filter(Boolean).map(String);
  const ownedBases = identity.length ? baseRows.filter((base) => [base.owner_name, base.character_name, base.player_id, base.owner_id, base.pawn_id].some((value) => value != null && identity.includes(String(value)))) : [];
  const enrichedBases = await Promise.all(ownedBases.map(async (base) => {
    const id = base.base_id ?? base.id;
    const water = await get(`/api/bases/${id}/water`);
    const inventory = { totalVolume: 0, storageVolume: 0 };
    logger.debug(`Base ${id} water response: ${JSON.stringify(water, null, 2)}`);
    logger.debug(`Base ${id} inventory disabled; defaulting storage volume to 0.`);
    const debugValues = { name: base.name, waterStored: water?.containers?.[0]?.stored, waterPayload: water, fuelCells: base.fuelCells, storageVolume: 0 };
    logger.debug(`Base ${id} display values: ${JSON.stringify(debugValues, null, 2)}`);
    return { ...base, waterData: water, inventoryData: inventory, displayValues: debugValues };
  }));
  logger.debug(`Enriched player base records: ${JSON.stringify(enrichedBases, null, 2)}`);
  const storageRows = storage.rows ?? storage.storage ?? [];
  const ownedStorage = identity.length ? storageRows.filter((row) => identity.includes(String(row.base_id ?? row.owner_id ?? row.player_id))) : [];
  sendJson(response, { partitions: partitions.rows ?? partitions.partitions ?? [], markers: [], players: [], bases: { ...bases, rows: enrichedBases }, storage: { ...storage, rows: ownedStorage }, services: {} });
}
function restartBot(response) { sendJson(response, { ok: true, message: "Restart requested" }); setTimeout(() => process.kill(process.ppid, "SIGTERM"), 250); }
function formatUptime(seconds) { const days = Math.floor(seconds / 86400); const hours = Math.floor((seconds % 86400) / 3600); const minutes = Math.floor((seconds % 3600) / 60); return `${days}d ${hours}h ${minutes}m`; }
function escapeHtml(value) { return String(value).replace(/[&<>\"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]); }

async function discordRequest(url, options = {}) {
  const response = await fetch(url, options.form ? { ...options, headers: { ...options.headers, "Content-Type": "application/x-www-form-urlencoded" } } : options);
  const body = await response.text();
  if (!response.ok) throw new Error(`Discord request failed with HTTP ${response.status}: ${body.slice(0, 500)}`);
  return body ? JSON.parse(body) : {};
}