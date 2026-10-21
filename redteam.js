/* ══════════════════════════════════════════════════════
   NEXORA SYSTEMS — AD RED TEAM SIMULATION LAB
   app.js — Complete Interactive Logic
══════════════════════════════════════════════════════ */

'use strict';

// ── Global State ──────────────────────────────────────
const state = {
  activeTab: 'dashboard',
  termPaused: false,
  termInterval: null,
  stats: { hosts: 2, creds: 7, objects: 847, privesc: 4 },
  statsTargets: { hosts: 14, creds: 14, objects: 1247, privesc: 12 },
  gaugeValue: 42,
  gaugeTarget: 42,
  alertsOpen: false,
  topoView: 'graph',
  animFrame: null,
  topoNodes: [],
  topoEdges: [],
  hoveredNode: null,
};

// ── Clock ─────────────────────────────────────────────
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  const el = document.getElementById('clock');
  if (el) el.textContent = `${h}:${m}:${s}`;
}
setInterval(updateClock, 1000);
updateClock();

// ── Tab Switching ─────────────────────────────────────
function switchTab(tab) {
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  const tabEl = document.getElementById(`tab-${tab}`);
  const panelEl = document.getElementById(`panel-${tab}`);
  if (tabEl) tabEl.classList.add('active');
  if (panelEl) panelEl.classList.add('active');
  state.activeTab = tab;
  if (tab === 'topology') setTimeout(initTopology, 50);
}

// ── Stats Counter Animation ───────────────────────────
function animateCounter(id, from, to, duration = 1800) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = performance.now();
  function update(ts) {
    const progress = Math.min((ts - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(from + (to - from) * ease).toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function initStats() {
  setTimeout(() => {
    animateCounter('stat-hosts', 0, state.stats.hosts, 1200);
    animateCounter('stat-creds', 0, state.stats.creds, 1400);
    animateCounter('stat-objects', 0, state.stats.objects, 1800);
    animateCounter('stat-privesc', 0, state.stats.privesc, 1600);
  }, 400);
}

// ── Matrix Canvas Background ──────────────────────────
function initMatrix() {
  const canvas = document.getElementById('matrixCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const chars = '01アイウエオカキクケコサシスセソタチツテト';
  const cols = Math.floor(canvas.width / 16);
  const drops = Array(cols).fill(1);

  function draw() {
    ctx.fillStyle = 'rgba(6,11,20,0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00aaff';
    ctx.font = '12px JetBrains Mono';
    drops.forEach((y, i) => {
      const char = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(char, i * 16, y * 16);
      if (y * 16 > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    });
  }
  setInterval(draw, 50);

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

// ── Terminal ──────────────────────────────────────────
const liveTermLines = [
  { type: 'info', msg: '[*] Scanning for unconstrained delegation targets...' },
  { type: 'ok',   msg: '[+] Found: SQL01.nexcorp.local — TrustedForDelegation=TRUE' },
  { type: 'warn', msg: '[!] Event ID 4624 — Logon type 3 from attacker IP' },
  { type: 'info', msg: '[*] Executing Invoke-Mimikatz — sekurlsa::logonpasswords' },
  { type: 'ok',   msg: '[+] Plaintext: SVC_WEB — Webserver@2023' },
  { type: 'info', msg: '[*] Enumerating DA group membership...' },
  { type: 'ok',   msg: '[+] j.admin is Domain Admin — pivoting' },
  { type: 'warn', msg: '[!] Windows Defender triggered on AMSI bypass attempt' },
  { type: 'ok',   msg: '[+] AMSI patched in-memory — bypass successful' },
  { type: 'info', msg: '[*] Loading Rubeus — ticket request in progress' },
  { type: 'ok',   msg: '[+] TGS obtained for SPN: MSSQLSvc/SQL01.nexcorp.local' },
  { type: 'warn', msg: '[!] Honeypot account access detected — adjusting TTPs' },
  { type: 'ok',   msg: '[+] ACL path found: jsmith → WriteDACL → finance-admins' },
  { type: 'info', msg: '[*] Performing DCSync — extracting all domain hashes' },
  { type: 'ok',   msg: '[+] Domain hashes extracted: 847 accounts' },
  { type: 'warn', msg: '[!] SIEM alert generated — investigating DRSUAPI calls' },
  { type: 'ok',   msg: '[+] Lateral movement to DC02 — PTH success' },
  { type: 'info', msg: '[*] Persistence set: Scheduled task on DC02 — every 15min' },
];

let termLineIndex = 0;
function addTermLine() {
  if (state.termPaused) return;
  const body = document.getElementById('terminalBody');
  if (!body) return;
  const data = liveTermLines[termLineIndex % liveTermLines.length];
  termLineIndex++;
  const now = new Date();
  const ts = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
  const cls = { ok: 'term-ok', info: 'term-info', warn: 'term-warn', err: 'term-err' }[data.type];
  const div = document.createElement('div');
  div.className = 'term-line';
  div.innerHTML = `<span class="term-ts">[${ts}]</span> <span class="${cls}">${data.msg}</span>`;
  body.appendChild(div);
  body.scrollTop = body.scrollHeight;
  // Limit lines
  while (body.children.length > 60) body.removeChild(body.firstChild);
}

function clearTerminal() {
  const body = document.getElementById('terminalBody');
  if (body) body.innerHTML = '<div class="term-line"><span class="term-ts">[SYS]</span> <span class="term-info">[*] Terminal cleared by operator</span></div>';
}

function toggleTermPause() {
  state.termPaused = !state.termPaused;
  const btn = document.getElementById('pauseBtn');
  if (btn) {
    btn.textContent = state.termPaused ? '▶ RESUME' : '⏸ PAUSE';
    btn.classList.toggle('active', !state.termPaused);
  }
}

function handleTermInput(e) {
  if (e.key !== 'Enter') return;
  const input = document.getElementById('termInput');
  const val = input.value.trim();
  if (!val) return;
  input.value = '';
  const body = document.getElementById('terminalBody');
  if (!body) return;
  const ts = new Date();
  const timeStr = `${String(ts.getHours()).padStart(2,'0')}:${String(ts.getMinutes()).padStart(2,'0')}:${String(ts.getSeconds()).padStart(2,'0')}`;
  const cmd = document.createElement('div');
  cmd.className = 'term-line';
  cmd.innerHTML = `<span class="term-ts">[${timeStr}]</span> <span style="color:#00ff88">root@nexora-c2 ~ # </span><span style="color:#e2e8f0">${escapeHtml(val)}</span>`;
  body.appendChild(cmd);
  setTimeout(() => {
    const resp = document.createElement('div');
    resp.className = 'term-line';
    const responses = {
      'help': '<span class="term-info">[*] Available: help, whoami, hosts, loot, clear, bloodhound, mimikatz, rubeus</span>',
      'whoami': '<span class="term-ok">[+] Current context: NEXCORP\\SVC_MSSQL (Server Admins)</span>',
      'hosts': '<span class="term-ok">[+] Owned: DC01, SQL01 | Active: WEB02 | Queued: FS01, DC02</span>',
      'loot': '<span class="term-ok">[+] Vault: 14 credentials, 5 Kerberos tickets, 2 domain hashes</span>',
      'clear': '',
      'bloodhound': '<span class="term-info">[*] Launching BloodHound collector... SharpHound initialized</span>',
      'mimikatz': '<span class="term-warn">[!] Mimikatz loaded in-memory (AMSI bypassed)</span>',
      'rubeus': '<span class="term-info">[*] Rubeus v2.3.2 — Kerberos interaction toolkit loaded</span>',
    };
    const reply = responses[val.toLowerCase()] || `<span class="term-err">[!] Command not found: ${escapeHtml(val)}. Try 'help'</span>`;
    if (val.toLowerCase() === 'clear') { clearTerminal(); return; }
    const nowTs = new Date();
    const nowStr = `${String(nowTs.getHours()).padStart(2,'0')}:${String(nowTs.getMinutes()).padStart(2,'0')}:${String(nowTs.getSeconds()).padStart(2,'0')}`;
    resp.innerHTML = `<span class="term-ts">[${nowStr}]</span> ${reply}`;
    body.appendChild(resp);
    body.scrollTop = body.scrollHeight;
  }, 200);
  body.scrollTop = body.scrollHeight;
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── Gauge Animation ───────────────────────────────────
function animateGauge(target) {
  const gaugeFill = document.getElementById('gaugeFill');
  const gaugeText = document.getElementById('gaugeText');
  if (!gaugeFill || !gaugeText) return;
  let current = state.gaugeValue;
  const step = (target - current) / 40;
  const id = setInterval(() => {
    current += step;
    if (Math.abs(current - target) < 0.5) { current = target; clearInterval(id); }
    state.gaugeValue = Math.round(current);
    // dashoffset: 251.2 = full arc; map 0-100% to dashoffset 251.2 → 0
    const offset = 251.2 - (current / 100) * 251.2;
    gaugeFill.style.strokeDashoffset = offset;
    gaugeText.textContent = `${Math.round(current)}%`;
    const riskLabel = document.getElementById('gaugeRiskLabel');
    if (riskLabel) {
      if (current < 33) riskLabel.textContent = 'LOW RISK';
      else if (current < 66) riskLabel.textContent = 'MEDIUM RISK';
      else riskLabel.textContent = 'HIGH RISK';
    }
  }, 25);
}

// ── Alert Toggle ──────────────────────────────────────
function toggleAlerts() {
  const dd = document.getElementById('alertDropdown');
  if (!dd) return;
  state.alertsOpen = !state.alertsOpen;
  dd.classList.toggle('open', state.alertsOpen);
}
document.addEventListener('click', (e) => {
  if (!e.target.closest('#alertBtn') && !e.target.closest('#alertDropdown')) {
    const dd = document.getElementById('alertDropdown');
    if (dd) dd.classList.remove('open');
    state.alertsOpen = false;
  }
});

// ── Attack Module Filtering ───────────────────────────
function filterAttacks(category) {
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  const activeBtn = document.getElementById(`cat-${category}`);
  if (activeBtn) activeBtn.classList.add('active');

  document.querySelectorAll('.attack-module').forEach(m => {
    const cat = m.getAttribute('data-category');
    if (category === 'all' || cat === category) {
      m.classList.remove('hidden');
    } else {
      m.classList.add('hidden');
    }
  });
}

// ── Module Execution Modal ────────────────────────────
const moduleOutputs = {
  'BloodHound AD Enum': [
    '[*] Initializing SharpHound v1.1.1...',
    '[*] Collection methods: ACL, ObjectProps, LocalAdmin, Trusts',
    '[+] Connecting to domain: nexcorp.local',
    '[+] Enumerating users: 847 found',
    '[+] Enumerating computers: 243 found',
    '[+] Mapping ACLs... 14,230 ACE entries processed',
    '[+] Identifying shortest paths to Domain Admin...',
    '[+] Found 3 paths to DA via ACL abuse',
    '[+] High-value targets: jsmith → WriteDACL → finance-admins → DA',
    '[+] Collecting sessions and logged-on users...',
    '[+] Local admin rights: 18 paths found',
    '[+] Export complete: nexcorp_20261018.zip (2.4 MB)',
    '[+] BloodHound data ready for import',
  ],
  'Kerberoasting': [
    '[*] Loading Rubeus v2.3.2...',
    '[*] Requesting TGS for all SPN accounts in NEXCORP.LOCAL',
    '[+] Found 12 accounts with SPNs',
    '[*] Requesting TGS — SVC_MSSQL (MSSQLSvc/SQL01.nexcorp.local)',
    '[+] TGS obtained — encryption: RC4-HMAC (weak!)',
    '[+] Hash: $krb5tgs$23$*SVC_MSSQL*NEXCORP.LOCAL*...',
    '[*] Requesting TGS — SVC_WEB (HTTP/WEB02.nexcorp.local)',
    '[+] TGS obtained — encryption: AES256 (strong)',
    '[*] Requesting TGS — SVC_BACKUP (backup/FS01.nexcorp.local)',
    '[+] TGS obtained — encryption: RC4-HMAC (weak!)',
    '[*] Cracking RC4 hashes with Hashcat ruleset...',
    '[+] CRACKED: SVC_MSSQL → P@ssw0rd2023! (4m 12s)',
    '[+] CRACKED: SVC_BACKUP → Backup@2022 (8m 37s)',
    '[+] Kerberoasting complete — 2/12 RC4 hashes cracked',
  ],
  'DCSync Attack': [
    '[*] Loading Mimikatz 2.2.0 (obfuscated)...',
    '[*] Verifying DS-Replication-Get-Changes-All privilege...',
    '[+] Privilege confirmed on Administrator account',
    '[*] Executing lsadump::dcsync /domain:nexcorp.local /all',
    '[+] Simulating DC replication partner...',
    '[*] Extracting: Administrator',
    '[+] Administrator: aad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0',
    '[*] Extracting: krbtgt',
    '[+] krbtgt: aad3b435b51404ee:58a478135a93ac3bf058a5ea0e8fdb71',
    '[*] Extracting all 847 domain accounts...',
    '[+] NTDS.dit snapshot complete — 847 hashes extracted',
    '[!] SIEM Event 4662 generated — DS-Replication-Get-Changes',
    '[+] DCSync complete — full domain compromise achieved',
  ],
  'Golden Ticket Forge': [
    '[*] Loading Mimikatz — kerberos::golden',
    '[*] Parameters: /user:Administrator /domain:nexcorp.local',
    '[*] Using krbtgt hash: 58a478135a93ac3bf058a5ea0e8fdb71',
    '[*] Domain SID: S-1-5-21-3623811015-3361044348-30300820',
    '[+] Forging Ticket Granting Ticket (TGT)...',
    '[+] PAC injected: Domain Admins, Enterprise Admins, Schema Admins',
    '[+] Ticket validity: 10 years (01/01/2036)',
    '[+] Golden Ticket forged successfully',
    '[*] Injecting ticket into current LSASS session...',
    '[+] kerberos::ptt — ticket loaded',
    '[+] Testing access: dir \\\\DC01\\C$',
    '[+] SUCCESS — Full DA access confirmed via Golden Ticket',
    '[!] No DC authentication required — offline attack',
    '[+] Golden Ticket saved: administrator@nexcorp.local.kirbi',
  ],
  'LSASS Memory Dump': [
    '[*] Target: SQL01.nexcorp.local (SYSTEM access)',
    '[*] Method: comsvcs.dll MiniDump (AMSI bypass active)',
    '[*] PID: 712 (lsass.exe)',
    '[+] MiniDump executing: rundll32 comsvcs.dll, MiniDump 712',
    '[+] lsass.dmp written to C:\\Windows\\Temp\\.tmp (42 MB)',
    '[*] Exfiltrating dump via SMB share...',
    '[+] Transfer complete — parsing with Mimikatz',
    '[*] sekurlsa::logonpasswords...',
    '[+] SVC_MSSQL: P@ssw0rd2023! (WDigest cleartext)',
    '[+] Administrator: aad3b435b51404ee:31d6cfe0...',
    '[+] j.admin: aad3b435b51404ee:c5a237b7e9d8e708...',
    '[+] SVC_WEB: Webserver@2023 (WDigest cleartext)',
    '[+] Credential extraction complete — 9 accounts harvested',
    '[*] Cleaning up lsass.dmp from remote host...',
    '[+] Cleanup complete — forensic artifacts minimized',
  ],
};

const defaultOutput = [
  '[*] Initializing attack module...',
  '[*] Loading required tooling...',
  '[*] Establishing connection to target...',
  '[+] Target reachable — executing payload',
  '[*] Processing output...',
  '[+] Operation completed successfully',
  '[+] Results logged to operator console',
];

function runModule(btn, moduleName) {
  const modal = document.getElementById('moduleModal');
  const title = document.getElementById('modalTitle');
  const terminal = document.getElementById('modalTerminal');
  const progressBar = document.getElementById('modalProgressBar');
  const status = document.getElementById('modalStatus');

  modal.classList.add('open');
  title.textContent = `EXECUTING: ${moduleName.toUpperCase()}`;
  terminal.innerHTML = '';
  progressBar.style.width = '0%';
  status.textContent = 'Initializing...';

  const lines = moduleOutputs[moduleName] || defaultOutput;
  let lineIdx = 0;
  let progress = 0;
  const progressStep = 100 / lines.length;

  const interval = setInterval(() => {
    if (lineIdx >= lines.length) {
      clearInterval(interval);
      status.textContent = 'Module execution complete';
      progressBar.style.width = '100%';
      progressBar.style.background = 'linear-gradient(90deg, var(--green), var(--blue))';
      // Update button state
      if (btn) {
        btn.textContent = 'RE-RUN';
        btn.className = 'module-btn btn-rerun';
        const badge = btn.closest('.attack-module')?.querySelector('.module-status-badge');
        if (badge) { badge.textContent = 'EXECUTED'; badge.className = 'module-status-badge msb-done'; }
        const mod = btn.closest('.attack-module');
        if (mod) mod.setAttribute('data-status', 'done');
      }
      // Update stats
      state.stats.creds = Math.min(state.stats.creds + 1, state.statsTargets.creds);
      animateCounter('stat-creds', state.stats.creds - 1, state.stats.creds, 600);
      showToast(`✓ ${moduleName} — Execution complete`);
      setTimeout(() => {
        if (modal.classList.contains('open')) closeModal();
      }, 1500);
      return;
    }

    const line = lines[lineIdx++];
    progress = Math.min(progress + progressStep, 100);
    progressBar.style.width = `${progress}%`;

    const type = line.startsWith('[+]') ? 'term-ok' : line.startsWith('[!]') ? 'term-warn' : 'term-info';
    const div = document.createElement('div');
    div.className = 'term-line';
    const ts = new Date();
    const timeStr = `${String(ts.getHours()).padStart(2,'0')}:${String(ts.getMinutes()).padStart(2,'0')}:${String(ts.getSeconds()).padStart(2,'0')}`;
    div.innerHTML = `<span class="term-ts">[${timeStr}]</span> <span class="${type}">${line}</span>`;
    terminal.appendChild(div);
    terminal.scrollTop = terminal.scrollHeight;
    status.textContent = line.replace(/^\[\S+\]\s*/, '').substring(0, 60) + '...';
  }, 350);
}

function closeModal() {
  const modal = document.getElementById('moduleModal');
  if (modal) modal.classList.remove('open');
}

// ── Toast ─────────────────────────────────────────────
function showToast(msg, duration = 3500) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// ── Loot Actions ──────────────────────────────────────
function copyHash(cell) {
  const hash = cell.textContent;
  navigator.clipboard.writeText(hash).catch(() => {});
  showToast(`📋 Copied to clipboard: ${hash.substring(0, 40)}...`);
}

function exportLoot() {
  showToast('📄 Generating operation report (PDF)... Download ready in 3s');
  setTimeout(() => showToast('✓ Report exported: NEXORA_PHANTOM_CROWN_20261018.pdf'), 3000);
}

const TOPO_NODES = [
  { id: 'kali',  label: 'Nexora-Kali',    sublabel: 'Attacker (Kali)', type: 'external',    owned: true,  x: 0.15, y: 0.20, info: 'Attacker Workstation\nIP: 192.168.23.131/24\nTools: Impacket, BloodHound, Hashcat' },
  { id: 'dc01',  label: 'NEXORA-DC',      sublabel: 'Domain Controller', type: 'dc',       owned: true,  x: 0.50, y: 0.15, info: 'Windows Server 2022 DC\nDomain: nexora.local\nIP: 192.168.23.129/24\nRole: Kerberos KDC, DNS' },
  { id: 'ws01',  label: 'Windows 10 Client', sublabel: 'DESKTOP-M8PCMPL', type: 'workstation', owned: true,  x: 0.40, y: 0.65, info: 'Windows 10 Client\nHostname: DESKTOP-M8PCMPL\nIP: 192.168.23.130/24\nInitial access & testing' },
  { id: 'srv01', label: 'Nexora-SRV-APP01', sublabel: 'App/File Host', type: 'server',  owned: true,  x: 0.80, y: 0.25, info: 'Windows Server 2022\nIP: 192.168.23.129/24\nShare: \\\\NEXORA-DC\\NexoraApp\nSPN: MSSQLSvc' },
];

const TOPO_EDGES = [
  { from: 'kali',  to: 'ws01',  type: 'attack', label: 'Initial Access (jsmith)' },
  { from: 'ws01',  to: 'srv01', type: 'attack', label: 'Path A: Credential Exposure (app.ini)' },
  { from: 'kali',  to: 'dc01',  type: 'attack', label: 'Path B: Kerberoasting (svc-sql TGS)' },
  { from: 'ws02',  to: 'dc01',  type: 'attack', label: 'Path C: ACL Abuse (GenericAll -> Server Operators)' },
  { from: 'dc01',  to: 'srv01', type: 'normal', label: 'Kerberos/LDAP Domain Replication' },
];

let topoAnimOffset = 0;
let topoAnimFrame = null;

function initTopology() {
  const canvas = document.getElementById('topoCanvas');
  if (!canvas) return;
  const wrap = canvas.parentElement;
  canvas.width = wrap.clientWidth;
  canvas.height = wrap.clientHeight;

  state.topoNodes = TOPO_NODES.map(n => ({
    ...n,
    px: n.x * canvas.width,
    py: n.y * canvas.height,
  }));

  if (topoAnimFrame) cancelAnimationFrame(topoAnimFrame);
  drawTopo(canvas);

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    let hit = null;
    for (const n of state.topoNodes) {
      const r = getNodeRadius(n.type);
      const dx = mx - n.px;
      const dy = my - n.py;
      if (dx * dx + dy * dy < r * r) { hit = n; break; }
    }
    state.hoveredNode = hit;
    const tt = document.getElementById('topoTooltip');
    if (tt) {
      if (hit) {
        tt.style.display = 'block';
        tt.style.left = (mx + 14) + 'px';
        tt.style.top = (my - 10) + 'px';
        tt.innerHTML = `<strong style="color:#00aaff">${hit.label}</strong><br>${hit.sublabel}<br><small style="color:#4a6080">${hit.info.replace(/\n/g,'<br>')}</small>`;
      } else {
        tt.style.display = 'none';
      }
    }
  });

  canvas.addEventListener('mouseleave', () => {
    state.hoveredNode = null;
    const tt = document.getElementById('topoTooltip');
    if (tt) tt.style.display = 'none';
  });
}

function getNodeRadius(type) {
  return type === 'dc' ? 28 : type === 'server' ? 22 : type === 'external' ? 18 : 16;
}

function getNodeColor(node) {
  if (node.owned) return { fill: 'rgba(255,60,60,0.15)', stroke: '#ff3c3c', glow: 'rgba(255,60,60,0.5)', text: '#ff3c3c' };
  switch(node.type) {
    case 'dc':          return { fill: 'rgba(255,215,0,0.1)', stroke: '#ffd700', glow: 'rgba(255,215,0,0.4)', text: '#ffd700' };
    case 'server':      return { fill: 'rgba(0,170,255,0.1)', stroke: '#00aaff', glow: 'rgba(0,170,255,0.4)', text: '#00aaff' };
    case 'workstation': return { fill: 'rgba(168,85,247,0.1)', stroke: '#a855f7', glow: 'rgba(168,85,247,0.3)', text: '#a855f7' };
    case 'external':    return { fill: 'rgba(255,140,0,0.1)', stroke: '#ff8c00', glow: 'rgba(255,140,0,0.3)', text: '#ff8c00' };
    default:            return { fill: 'rgba(74,96,128,0.1)', stroke: '#4a6080', glow: 'transparent', text: '#4a6080' };
  }
}

function drawTopo(canvas) {
  const ctx = canvas.getContext('2d');
  topoAnimOffset++;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw edges
  for (const edge of TOPO_EDGES) {
    const from = state.topoNodes.find(n => n.id === edge.from);
    const to   = state.topoNodes.find(n => n.id === edge.to);
    if (!from || !to) continue;

    ctx.beginPath();
    ctx.moveTo(from.px, from.py);
    ctx.lineTo(to.px, to.py);

    if (edge.type === 'attack') {
      ctx.strokeStyle = 'rgba(255,60,60,0.4)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 6]);
      ctx.lineDashOffset = -topoAnimOffset * 0.5;
    } else if (edge.type === 'trust') {
      ctx.strokeStyle = 'rgba(255,140,0,0.35)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.lineDashOffset = 0;
    } else {
      ctx.strokeStyle = 'rgba(26,53,85,0.8)';
      ctx.lineWidth = 1;
      ctx.setLineDash([]);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Draw nodes
  for (const node of state.topoNodes) {
    const r = getNodeRadius(node.type);
    const col = getNodeColor(node);
    const isHovered = state.hoveredNode && state.hoveredNode.id === node.id;

    // Glow
    if (node.owned || node.type === 'dc') {
      const grd = ctx.createRadialGradient(node.px, node.py, r * 0.5, node.px, node.py, r * 2.2);
      grd.addColorStop(0, col.glow.replace(')', `, 0.25)`).replace('rgba', 'rgba'));
      grd.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(node.px, node.py, r * 2.2, 0, Math.PI * 2);
      ctx.fillStyle = col.glow;
      ctx.globalAlpha = 0.15 + (isHovered ? 0.1 : 0);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Node shape
    ctx.beginPath();
    if (node.type === 'dc') {
      // Hexagon for DC
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3 - Math.PI / 6;
        const px = node.px + r * Math.cos(angle);
        const py = node.py + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
    } else {
      ctx.arc(node.px, node.py, r + (isHovered ? 2 : 0), 0, Math.PI * 2);
    }
    ctx.fillStyle = col.fill;
    ctx.fill();
    ctx.strokeStyle = col.stroke;
    ctx.lineWidth = isHovered ? 2 : 1.5;
    ctx.stroke();

    // Icon / label
    ctx.fillStyle = col.text;
    ctx.font = `bold ${r * 0.45}px JetBrains Mono, monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const icon = { dc: 'DC', server: 'SRV', workstation: 'WS', external: 'EXT' }[node.type] || '?';
    ctx.fillText(icon, node.px, node.py);

    // Label below
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.fillStyle = col.text;
    ctx.fillText(node.label, node.px, node.py + r + 13);
    ctx.font = '9px JetBrains Mono, monospace';
    ctx.fillStyle = '#4a6080';
    ctx.fillText(node.sublabel, node.px, node.py + r + 24);

    // Owned badge
    if (node.owned) {
      ctx.font = 'bold 8px JetBrains Mono, monospace';
      ctx.fillStyle = '#ff3c3c';
      ctx.fillText('OWNED', node.px, node.py + r + 35);
    }
  }

  // Animated attack particles
  drawAttackParticles(ctx);

  topoAnimFrame = requestAnimationFrame(() => drawTopo(canvas));
}

const particles = [];
function initParticles() {
  const attackEdges = TOPO_EDGES.filter(e => e.type === 'attack');
  attackEdges.forEach(edge => {
    for (let i = 0; i < 3; i++) {
      particles.push({ edge, t: Math.random(), speed: 0.003 + Math.random() * 0.003 });
    }
  });
}

function drawAttackParticles(ctx) {
  for (const p of particles) {
    const from = state.topoNodes.find(n => n.id === p.edge.from);
    const to   = state.topoNodes.find(n => n.id === p.edge.to);
    if (!from || !to) continue;
    p.t += p.speed;
    if (p.t > 1) p.t = 0;
    const x = from.px + (to.px - from.px) * p.t;
    const y = from.py + (to.py - from.py) * p.t;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 60, 60, ${0.8 - p.t * 0.4})`;
    ctx.fill();
  }
}

function setTopoView(view) {
  state.topoView = view;
  document.querySelectorAll('.topo-btn').forEach(b => b.classList.remove('active-topo'));
  const btn = document.getElementById(`topo-view-${view}`);
  if (btn) btn.classList.add('active-topo');
  const canvas = document.getElementById('topoCanvas');
  if (!canvas) return;
  if (view === 'tree') {
    // Rearrange nodes in tree layout
    state.topoNodes.forEach((n, i) => {
      const treeX = { dc01: 0.5, dc02: 0.7, sql01: 0.2, web01: 0.35, web02: 0.5, fs01: 0.65, ws01: 0.12, ws02: 0.22, ws03: 0.35, ws04: 0.48, ws05: 0.62, ws06: 0.76, ext1: 0.88 };
      const treeY = { dc01: 0.1, dc02: 0.1, sql01: 0.35, web01: 0.35, web02: 0.35, fs01: 0.35, ws01: 0.65, ws02: 0.65, ws03: 0.65, ws04: 0.65, ws05: 0.65, ws06: 0.65, ext1: 0.22 };
      n.px = (treeX[n.id] || n.x) * canvas.width;
      n.py = (treeY[n.id] || n.y) * canvas.height;
    });
  } else {
    state.topoNodes.forEach(n => {
      n.px = n.x * canvas.width;
      n.py = n.y * canvas.height;
    });
  }
  showToast(`View switched to: ${view === 'graph' ? 'Force Graph' : 'Tree Hierarchy'}`);
}

// ── Periodic Simulation Updates ───────────────────────
function simulationTick() {
  // Slowly increase gauge
  if (Math.random() < 0.3) {
    state.gaugeTarget = Math.min(85, state.gaugeTarget + Math.floor(Math.random() * 3));
    animateGauge(state.gaugeTarget);
  }
}

// ── Scan line animation in panels ─────────────────────
function addScanlineEffect() {
  const panels = document.querySelectorAll('.panel-card');
  panels.forEach(panel => {
    panel.addEventListener('mouseenter', () => {
      panel.style.boxShadow = '0 0 20px rgba(0,170,255,0.08), inset 0 0 40px rgba(0,170,255,0.02)';
    });
    panel.addEventListener('mouseleave', () => {
      panel.style.boxShadow = '';
    });
  });
}

// ── Initialization ────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initMatrix();
  initStats();
  initParticles();
  addScanlineEffect();

  // Start live terminal feed
  state.termInterval = setInterval(addTermLine, 3500);

  // Animate gauge
  setTimeout(() => animateGauge(42), 500);

  // Simulation ticks
  setInterval(simulationTick, 8000);

  // Close modal on overlay click
  document.getElementById('moduleModal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
});
