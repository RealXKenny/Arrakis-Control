const status = document.querySelector('#server-status');
const details = document.querySelector('#details');
async function load() {
  try {
    const response = await fetch('/api/dune/status');
    const data = await response.json();
    const text = data?.stdout ?? data?.output ?? '';
    const overall = text.match(/Overall:\s*([^\n]+)/i)?.[1]?.trim() ?? data?.overall;
    const title = text.match(/Title:\s*([^\n]+)/i)?.[1]?.trim();
    const region = text.match(/Region:\s*([^\n]+)/i)?.[1]?.trim();
    status.textContent = [overall ? `Status: ${overall}` : 'Status received', title, region]
      .filter(Boolean)
      .join(' · ');
    status.className = String(data?.overall ?? '')
      .toLowerCase()
      .includes('ready')
      ? 'online'
      : 'offline';
    document.querySelector('#server-title').textContent = title || 'Dune: Awakening';
    document.querySelector('#population').textContent =
      text.match(/Population:\s*([^\n]+)/i)?.[1]?.trim() ?? '—';
    document.querySelector('#region').textContent = region || '—';
    renderRows('containers', text, /^(dune-\S+)\s+(Up\s+.+)$/gm);
    renderRows('listeners', text, /^(.+?)\s{2,}(\S+\/\w+)\s+(OK|FAIL)$/gm);
    renderRows('game-servers', text, /^(\S+)\s+(READY|STOPPED|\S+)\s+(Up\s+.+)$/gm);
  } catch (error) {
    status.textContent = `Unable to load status: ${error.message}`;
    status.className = 'offline';
  }
}
fetch('/api/health')
  .then((r) => r.json())
  .then((data) => {
    document.querySelector('#bot').textContent =
      `Bot: ${data.bot ?? 'starting'} · Version ${data.version}`;
  });
fetch('/api/me')
  .then((r) => (r.ok ? r.json() : null))
  .then((data) => {
    if (data?.user && document.querySelector('.login'))
      document.querySelector('.login').textContent =
        `Signed in as ${data.user.global_name ?? data.user.username}`;
  });
document.querySelector('#refresh').addEventListener('click', load);
load();

function renderRows(id, text, pattern) {
  const rows = [];
  let match;
  while ((match = pattern.exec(text)) && rows.length < 20)
    rows.push(
      `<div class="row"><span>${match[1].trim()}</span><b>${match[3] ?? match[2]}</b></div>`,
    );
  document.querySelector(`#${id}`).innerHTML = rows.length
    ? rows.join('')
    : '<span class="muted">No data available</span>';
}
