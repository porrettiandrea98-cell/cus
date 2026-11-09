/* NIENTE MI DIVIDE DA CUS — Roma ➜ Milano, 480 km */
(() => {
'use strict';

/* ================== CONFIG ================== */
const GOAL_KM = 480;
// Tappe simboliche, in proporzione al percorso Roma–Milano lungo l'A1
const MILESTONES = [
  { km: 97,  name: 'ORVIETO' },
  { km: 174, name: 'AREZZO' },
  { km: 222, name: 'FIRENZE' },
  { km: 307, name: 'BOLOGNA' },
  { km: 339, name: 'MODENA' },
  { km: 383, name: 'PARMA' },
  { km: 432, name: 'PIACENZA' },
  { km: 480, name: 'MILANO' },
];
const HEART_EVERY_KM = 20;
const LS_KEY = 'nmddc-github';

/* ================== SPRITES ================== */
const HERO_TOP = [
  '....HHHH....',
  '...HHHHHH...',
  '..HRRRRRRH..',
  '..HSSSSSSH..',
  '..SSESSESS..',
  '..SSSSSSSS..',
  '...SSMMSS...',
  '....SSSS....',
];
const HERO_A = HERO_TOP.concat([
  '..BBBBBBBB..',
  '.SBBBBBBBBS.',
  '.S.BBBBBB.S.',
  '...KKKKKK...',
  '...KK..KK...',
  '...SS..SS...',
  '..rWW..WWr..',
  '..rrr..rrr..',
]);
const HERO_B = HERO_TOP.concat([
  '..BBBBBBBB..',
  'SBBBBBBBBBBS',
  'S..BBBBBB..S',
  '...KKKKKK...',
  '..KK....KK..',
  '.SS......SS.',
  'rWW......WWr',
  'rr........rr',
]);
const HERO_PAL = { H:'#3b2416', R:'#e83b3b', S:'#f1c27d', E:'#1a1a1a', M:'#b5523b', B:'#2e7bff', K:'#222831', W:'#ffffff', r:'#e83b3b' };

const PRINCESS = [
  '...C.CC.C...',
  '...CCCCCC...',
  '...DDDDDD...',
  '..DDDDDDDD..',
  '..DSSSSSSD..',
  '..DSESSESD..',
  '..DSSSSSSD..',
  '..DDSLLSDD..',
  '..DD.SS.DD..',
  '..DPPPPPPD..',
  '.SDPpPPpPDS.',
  '.S.PPPPPP.S.',
  '...PPPPPP...',
  '..PPPPPPPP..',
  '..PpPPPPpP..',
  '.PPPPPPPPPP.',
  '.PPPPPPPPPP.',
  '..pp....pp..',
];
const PRINCESS_PAL = { C:'#ffd54a', D:'#1a1110', S:'#f3c9a0', E:'#1a1a1a', L:'#d94f6b', P:'#8e44ad', p:'#c58ae6' };

const HEART = [
  '.RR.RR.',
  'RwRRRRR',
  'RRRRRRR',
  '.RRRRR.',
  '..RRR..',
  '...R...',
];
const HEART_PAL = { R:'#e83b3b', w:'#ffc2d1' };

const CLOUD = [
  '.....WWWW.......',
  '...WWWWWWWW.....',
  '..WWWWWWWWWWW...',
  '.WWWWWWWWWWWWWW.',
  'WWWWWWWWWWWWWWWW',
  'WWWWWWWWWWWWWWWW',
  '.WWWWWWWWWWWWWW.',
  '..llllllllllll..',
];
const CLOUD_PAL = { W:'#ffffff', l:'#cfe6ff' };

function makeSprite(rows, pal) {
  const c = document.createElement('canvas');
  c.width = rows[0].length; c.height = rows.length;
  const x = c.getContext('2d');
  rows.forEach((r, j) => [...r].forEach((ch, i) => {
    if (pal[ch]) { x.fillStyle = pal[ch]; x.fillRect(i, j, 1, 1); }
  }));
  return c;
}
const SPR = {
  heroA: makeSprite(HERO_A, HERO_PAL),
  heroB: makeSprite(HERO_B, HERO_PAL),
  princess: makeSprite(PRINCESS, PRINCESS_PAL),
  heart: makeSprite(HEART, HEART_PAL),
  cloud: makeSprite(CLOUD, CLOUD_PAL),
};

/* ================== WORLD ================== */
const H = 150, GY = 124, WORLD_W = 2400;
const DUOMO_X = WORLD_W - 70;
const PRINCESS_X = DUOMO_X - 8;      // sprite left
const STARTX = 68;                   // hero center at 0 km
const ENDX = PRINCESS_X - 8;         // hero center at 480 km
const kmToX = km => STARTX + Math.min(Math.max(km, 0), GOAL_KM) / GOAL_KM * (ENDX - STARTX);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

const cvs = document.getElementById('stage');
const ctx = cvs.getContext('2d');
let VW = 400, SCALE = 3;

function resize() {
  const w = cvs.parentElement.clientWidth;
  SCALE = w < 640 ? 2 : 3;
  VW = Math.ceil(w / SCALE);
  cvs.width = VW; cvs.height = H;
  cvs.style.width = (VW * SCALE) + 'px';
  cvs.style.height = (H * SCALE) + 'px';
  ctx.imageSmoothingEnabled = false;
}
window.addEventListener('resize', resize);
resize();

/* ================== STATE ================== */
let runs = [];
let total = 0;
let shownKm = 0;
let anim = { from: 0, to: 0, start: 0, dur: 1 };
let cam = 0, dragging = false, lastInteract = -1e9, dragX = 0, camAtDrag = 0;
const particles = [];
let lastSpawn = 0;

function startAnim(from, to) {
  anim = { from, to, start: performance.now(), dur: clamp(1200 + Math.abs(to - from) * 7, 1200, 4500) };
  lastInteract = -1e9;
}
const easeInOut = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

/* ================== DRAW HELPERS ================== */
const FONT = '8px "Press Start 2P", monospace';
function text(str, x, y, color = '#fff', align = 'left', shadow = '#0b0818') {
  ctx.font = FONT; ctx.textBaseline = 'top'; ctx.textAlign = align;
  if (shadow) { ctx.fillStyle = shadow; ctx.fillText(str, x + 1, y + 1); }
  ctx.fillStyle = color; ctx.fillText(str, x, y);
}
function rect(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); }

function drawColosseo(x) {
  const w = 58, h = 46, top = GY - h;
  for (let i = 0; i < w; i++) {
    const broken = i > 36 ? Math.min(16, Math.floor((i - 36) * 0.9)) + (i % 3 === 0 ? 1 : 0) : 0;
    const ct = top + broken;
    rect(x + i, ct - 1, 1, GY - ct + 1, '#9c7148');
    rect(x + i, ct, 1, GY - ct, i % 2 ? '#e3bd8d' : '#dcb483');
  }
  rect(x - 1, top - 1, 1, h + 1, '#9c7148');
  const colTop = i => top + (i > 36 ? Math.min(16, Math.floor((i - 36) * 0.9)) + (i % 3 === 0 ? 1 : 0) : 0);
  // tier lines
  [10, 22, 34].forEach(dy => { for (let i = 0; i < w; i++) if (colTop(i) < top + dy) rect(x + i, top + dy, 1, 2, '#b88c5c'); });
  // attic windows
  for (let ax = x + 4; ax < x + w - 3; ax += 8) if (colTop(ax - x) < top + 3) rect(ax, top + 4, 2, 3, '#7a5534');
  // arches
  [12, 24, 36].forEach(ty => {
    for (let ax = x + 2; ax < x + w - 3; ax += 6) {
      if (colTop(ax - x) > ty + top + 2) continue;
      rect(ax + 1, top + ty + 2, 2, 1, '#5e3f24');
      rect(ax, top + ty + 3, 4, ty === 36 ? 7 : 7, '#5e3f24');
    }
  });
}

function drawDuomo(x) {
  const w = 64, bodyH = 28, pale = '#f4eee2', shade = '#d6ccb6', dark = '#6e604b';
  const mid = w / 2;
  for (let i = 0; i < w; i++) {
    const gable = Math.max(0, Math.round(12 - Math.abs(i - mid) * 0.42));
    const t = GY - bodyH - gable;
    rect(x + i, t - 1, 1, GY - t + 1, '#a99c84');
    rect(x + i, t, 1, GY - t, i % 8 === 0 ? shade : pale);
  }
  // spires
  const spires = [[1, 14], [9, 10], [17, 12], [25, 15], [mid - 1, 30], [37, 15], [45, 12], [53, 10], [61, 14]];
  spires.forEach(([sx, sh]) => {
    const gable = Math.max(0, Math.round(12 - Math.abs(sx - mid) * 0.42));
    const base = GY - bodyH - gable;
    rect(x + sx, base - sh, 2, sh, pale);
    rect(x + sx + 1, base - sh, 1, sh, shade);
    rect(x + sx, base - sh - 2, 1, 2, pale);
  });
  // Madonnina
  const mTop = GY - bodyH - 12 - 30 - 2;
  rect(x + mid - 1, mTop - 3, 1, 3, '#ffd54a');
  rect(x + mid - 2, mTop - 2, 3, 1, '#ffcc00');
  // windows & doors
  [10, 22, 42, 54].forEach(wx => rect(x + wx, GY - 22, 2, 9, shade));
  rect(x + mid - 3, GY - 34, 6, 6, '#c9a85a'); rect(x + mid - 2, GY - 33, 4, 4, '#e7d08a'); // rosone
  [[6, 8], [18, 9], [mid - 5, 13], [42, 9], [54, 8]].forEach(([dx, dh]) => {
    const dw = dh > 10 ? 10 : 6;
    rect(x + dx + 1, GY - dh - 1, dw - 2, 1, dark);
    rect(x + dx, GY - dh, dw, dh, dark);
  });
}

function drawSign(m, reached) {
  const x = Math.round(kmToX(m.km));
  ctx.font = FONT;
  const label = m.name, sub = m.km + 'KM';
  const tw = Math.ceil(Math.max(ctx.measureText(label).width, ctx.measureText(sub).width)) + 8;
  const bx = x - Math.floor(tw / 2), by = GY - 58;
  rect(x - 1, by + 20, 3, GY - by - 20, '#6b4423');
  rect(x, by + 20, 1, GY - by - 20, '#8a5a30');
  rect(bx - 1, by - 1, tw + 2, 23, '#3a2a1a');
  rect(bx, by, tw, 21, reached ? '#ffd54a' : '#fff3d6');
  rect(bx, by + 19, tw, 2, reached ? '#e0a800' : '#e3d3ad');
  text(label, x, by + 3, '#3a2a1a', 'center', null);
  text(sub, x, by + 12, reached ? '#a0522d' : '#8a7a60', 'center', null);
  if (reached) { // flag
    rect(bx + tw - 1, by - 9, 1, 9, '#3a2a1a');
    rect(bx + tw, by - 9, 5, 4, '#e83b3b');
  }
}

/* ================== MAIN DRAW ================== */
function draw(now) {
  // animate km
  const t = clamp((now - anim.start) / anim.dur, 0, 1);
  shownKm = anim.from + (anim.to - anim.from) * easeInOut(t);
  const moving = t < 1 && anim.to !== anim.from;
  const done = total >= GOAL_KM && !moving;

  // camera
  const heroX = kmToX(shownKm);
  let target = heroX - VW * 0.42;
  if (done) target = (heroX + PRINCESS_X + 12) / 2 - VW / 2;
  target = clamp(target, 0, Math.max(0, WORLD_W - VW));
  if (!dragging && now - lastInteract > 3500) cam += (target - cam) * (moving ? 0.25 : 0.08);
  cam = clamp(cam, 0, Math.max(0, WORLD_W - VW));
  const c = Math.round(cam);

  // sky
  const bands = ['#4f9de8', '#5ea9ee', '#6fb7f3', '#82c5f7', '#97d3fa', '#acdffc'];
  const bh = Math.ceil(GY / bands.length);
  bands.forEach((col, i) => rect(0, i * bh, VW, bh, col));

  // sun
  const sunX = Math.round(VW * 0.62), sunY = 22;
  rect(sunX + 2, sunY, 8, 12, '#fff3a0'); rect(sunX, sunY + 2, 12, 8, '#fff3a0'); rect(sunX + 3, sunY + 3, 6, 6, '#ffe066');

  // clouds
  const pc = c * 0.15;
  for (let k = Math.floor(pc / 130) - 1; k < (pc + VW) / 130 + 1; k++) {
    const sx = Math.round(k * 130 + hash(k) * 60 - pc), sy = 10 + Math.floor(hash(k * 7) * 36);
    ctx.drawImage(SPR.cloud, sx, sy);
    if (hash(k * 3) > 0.5) ctx.drawImage(SPR.cloud, sx + 14, sy + 4);
  }

  // mountains (Appennini)
  for (let sx = 0; sx < VW; sx++) {
    const wx = sx + c * 0.3;
    const h = Math.round(34 + 14 * Math.sin(wx * 0.011) + 9 * Math.sin(wx * 0.031 + 1));
    rect(sx, GY - h, 1, h, (Math.floor(wx) % 2) ? '#7b8fbf' : '#7489ba');
    if (h > 47) rect(sx, GY - h, 1, h - 46, '#eef3ff');
  }
  // hills
  for (let sx = 0; sx < VW; sx++) {
    const wx = sx + c * 0.6;
    const h = Math.round(16 + 7 * Math.sin(wx * 0.017 + 2) + 5 * Math.sin(wx * 0.045));
    rect(sx, GY - h, 1, h, '#3f9b4b');
    rect(sx, GY - h, 1, 2, '#58b85f');
  }
  // distant cypresses
  for (let k = Math.floor((c * 0.6) / 37); k < (c * 0.6 + VW) / 37 + 1; k++) {
    if (hash(k * 11) < 0.55) continue;
    const sx = Math.round(k * 37 - c * 0.6), hh = 10 + Math.floor(hash(k) * 8);
    rect(sx + 1, GY - hh - 2, 1, 2, '#1f5e2b');
    rect(sx, GY - hh, 3, hh - 2, '#256b31');
    rect(sx + 1, GY - 2, 1, 2, '#5a3a1a');
  }

  // ground
  rect(0, GY, VW, H - GY, '#a0612b');
  rect(0, GY, VW, 3, '#4cc24a');
  rect(0, GY + 3, VW, 1, '#2e8b3a');
  for (let wx = Math.floor(c / 8) * 8; wx < c + VW + 8; wx += 8) {
    const sx = wx - c, hh = hash(wx);
    rect(sx + Math.floor(hh * 6), GY + 14 + Math.floor(hash(wx + 1) * 10), 2, 2, '#7a4520');
    if (hh > 0.7) rect(sx + 3, GY - 2, 1, 2, '#4cc24a');
  }
  // path strip (progress)
  const px0 = STARTX - c, px1 = Math.round(heroX) - c, pxEnd = ENDX - c;
  rect(px0, GY + 6, pxEnd - px0, 4, '#d9b98a');
  for (let x = px0; x < pxEnd; x += 6) rect(x, GY + 7, 3, 2, '#c4a272');
  rect(px0, GY + 6, Math.max(0, px1 - px0), 4, '#ffd54a');
  rect(px0, GY + 9, Math.max(0, px1 - px0), 1, '#e0a800');

  // world objects
  ctx.save(); ctx.translate(-c, 0);
  drawColosseo(4);
  text('ROMA', 33, GY - 64, '#fff', 'center');
  MILESTONES.slice(0, -1).forEach(m => drawSign(m, total >= m.km));
  drawDuomo(DUOMO_X);
  text('MILANO', DUOMO_X + 32, GY - 84, '#fff', 'center');

  // collectible hearts
  for (let km = HEART_EVERY_KM; km < GOAL_KM; km += HEART_EVERY_KM) {
    if (km <= shownKm) continue;
    const x = Math.round(kmToX(km)) - 3;
    const y = GY - 30 + (Math.floor(now / 350 + km) % 2);
    ctx.drawImage(SPR.heart, x, y);
  }

  // princess
  const pBob = Math.floor(now / 600) % 2;
  ctx.drawImage(SPR.princess, PRINCESS_X, GY - 18 - pBob);
  if (!done) ctx.drawImage(SPR.heart, PRINCESS_X + 3, GY - 30 - (Math.floor(now / 400) % 2));

  // hero
  const frame = moving ? (Math.floor(now / 110) % 2 ? SPR.heroB : SPR.heroA) : SPR.heroA;
  const hBob = moving ? (Math.floor(now / 110) % 2) : (Math.floor(now / 700) % 2);
  const hx = Math.round(heroX) - 6;
  ctx.drawImage(frame, hx, GY - 16 - hBob);
  if (!done) {
    const lbl = shownKm.toFixed(1) + ' KM';
    ctx.font = FONT;
    const lw = Math.ceil(ctx.measureText(lbl).width) + 6;
    rect(hx + 6 - Math.ceil(lw / 2), GY - 32, lw, 12, '#0b0818');
    rect(hx + 5, GY - 20, 3, 2, '#0b0818');
    text(lbl, hx + 6, GY - 30, '#ffd54a', 'center', null);
  }

  // particles (hearts rising from Chiara)
  const spawnEvery = done ? 140 : 1600;
  if (now - lastSpawn > spawnEvery) {
    lastSpawn = now;
    const bx = done ? (hx + PRINCESS_X) / 2 + 6 : PRINCESS_X + 6;
    particles.push({ x: bx + (Math.random() - .5) * (done ? 40 : 8), y: GY - 26, vy: -(0.25 + Math.random() * 0.35), life: 1 });
  }
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.y += p.vy; p.life -= 0.006;
    if (p.life <= 0) { particles.splice(i, 1); continue; }
    ctx.globalAlpha = Math.min(1, p.life * 1.5);
    ctx.drawImage(SPR.heart, Math.round(p.x + Math.sin(p.y / 6) * 2), Math.round(p.y));
    ctx.globalAlpha = 1;
  }
  ctx.restore();

  // HUD
  const hearts = Math.floor(Math.min(total, GOAL_KM - 0.001) / HEART_EVERY_KM) + (total >= GOAL_KM ? 1 : 0);
  ctx.drawImage(SPR.heart, 6, 6);
  text('x' + String(hearts).padStart(2, '0'), 16, 6, '#fff');
  text('CHIARA ' + Math.max(0, GOAL_KM - total).toFixed(1) + 'KM', VW - 6, 6, '#fff', 'right');
  if (done) {
    const blink = Math.floor(now / 500) % 2;
    if (blink) text("CE L'HAI FATTA!", Math.round(VW / 2), 44, '#ffd54a', 'center');
  }

  requestAnimationFrame(draw);
}

/* drag to explore */
cvs.addEventListener('pointerdown', e => {
  dragging = true; dragX = e.clientX; camAtDrag = cam; cvs.setPointerCapture(e.pointerId);
});
cvs.addEventListener('pointermove', e => {
  if (!dragging) return;
  cam = clamp(camAtDrag - (e.clientX - dragX) / SCALE, 0, Math.max(0, WORLD_W - VW));
});
const endDrag = () => { if (dragging) { dragging = false; lastInteract = performance.now(); } };
cvs.addEventListener('pointerup', endDrag);
cvs.addEventListener('pointercancel', endDrag);

/* ================== DATA ================== */
function normalize(arr) {
  if (!Array.isArray(arr)) arr = (arr && Array.isArray(arr.runs)) ? arr.runs : [];
  return arr
    .filter(r => r && /^\d{4}-\d{2}-\d{2}$/.test(r.date) && Number(r.km) > 0)
    .map(r => ({ date: r.date, km: Math.round(Number(r.km) * 100) / 100, ...(r.note ? { note: String(r.note) } : {}) }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
const sumKm = list => Math.round(list.reduce((s, r) => s + r.km, 0) * 100) / 100;

/* GitHub (solo per chi ha il token salvato in questo browser) */
const getCfg = () => { try { return JSON.parse(localStorage.getItem(LS_KEY)) || null; } catch { return null; } };
const b64enc = s => btoa(unescape(encodeURIComponent(s)));
const b64dec = s => decodeURIComponent(escape(atob(s.replace(/\n/g, ''))));
const apiUrl = cfg => `https://api.github.com/repos/${encodeURIComponent(cfg.owner)}/${encodeURIComponent(cfg.repo)}/contents/runs.json`;
const ghHeaders = cfg => ({ Authorization: `Bearer ${cfg.token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' });

async function ghGet(cfg) {
  const r = await fetch(apiUrl(cfg) + '?ref=' + encodeURIComponent(cfg.branch) + '&t=' + Date.now(), { headers: ghHeaders(cfg), cache: 'no-store' });
  if (r.status === 404) return { runs: [], sha: null };
  if (!r.ok) throw new Error(r.status === 401 ? 'Token non valido' : 'GitHub ha risposto ' + r.status);
  const j = await r.json();
  return { runs: normalize(JSON.parse(b64dec(j.content) || '[]')), sha: j.sha };
}
async function ghPut(cfg, list, sha, message) {
  const body = { message, content: b64enc(JSON.stringify(list, null, 2) + '\n'), branch: cfg.branch };
  if (sha) body.sha = sha;
  const r = await fetch(apiUrl(cfg), { method: 'PUT', headers: { ...ghHeaders(cfg), 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(r.status === 409 ? 'Conflitto, riprova' : r.status === 403 ? 'Il token non ha il permesso di scrittura' : 'GitHub ha risposto ' + r.status);
}

async function loadRuns() {
  const cfg = getCfg();
  if (cfg) {
    try { return (await ghGet(cfg)).runs; } catch (e) { console.warn(e); }
  }
  try {
    const r = await fetch('runs.json?t=' + Date.now(), { cache: 'no-store' });
    if (!r.ok) throw new Error(r.status);
    return normalize(await r.json());
  } catch (e) {
    console.warn('runs.json non trovato', e);
    return [];
  }
}

/* ================== UI ================== */
const $ = id => document.getElementById(id);
const fmt = n => n.toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const fmtDate = d => new Date(d + 'T12:00:00').toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
const esc = s => String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

$('bar-runner').src = (() => { const c = document.createElement('canvas'); c.width = 12; c.height = 16; c.getContext('2d').drawImage(SPR.heroA, 0, 0); return c.toDataURL(); })();

function message(pct) {
  if (pct >= 100) return 'PRINCIPESSA RAGGIUNTA! Niente ci divide più ♥';
  if (pct >= 90) return 'Vedo la Madonnina! Chiara è lì che aspetta…';
  if (pct >= 75) return 'La pianura padana scorre sotto le scarpe!';
  if (pct >= 50) return 'Oltre metà strada: l\'amore non si stanca.';
  if (pct >= 25) return 'Le colline toscane mi fanno il tifo!';
  if (pct >= 10) return 'Il Colosseo è già alle spalle…';
  if (pct > 0) return 'I primi passi sono i più belli. Si va!';
  return 'Scarpe allacciate. Pronto a partire da Roma!';
}

function renderUI() {
  total = sumKm(runs);
  const pct = Math.min(100, total / GOAL_KM * 100);
  $('s-done').textContent = fmt(total);
  $('s-left').textContent = fmt(Math.max(0, GOAL_KM - total));
  $('s-runs').textContent = runs.length;
  $('s-avg').textContent = runs.length ? fmt(total / runs.length) : '0';
  $('pct').textContent = pct.toFixed(1).replace('.', ',') + '%';
  $('bar-fill').style.width = pct + '%';
  $('bar-runner').style.left = pct + '%';
  $('msg').textContent = message(pct);
  const next = MILESTONES.find(m => m.km > total);
  $('next').textContent = next
    ? `Prossima tappa: ${next.name[0] + next.name.slice(1).toLowerCase()} tra ${fmt(next.km - total)} km`
    : `Obiettivo completato con ${runs.length} corse ♥`;

  const cfg = getCfg();
  $('btn-add').classList.toggle('hidden', !cfg);
  let cum = 0;
  const rows = runs.map((r, i) => { cum += r.km; return { ...r, i, cum }; }).reverse();
  $('log-list').innerHTML = rows.map(r => `
    <li>
      <span class="d">${fmtDate(r.date)}</span>
      <span class="k">+${fmt(r.km)} km</span>
      <span class="c">tot ${fmt(r.cum)} km${r.note ? ` <em>· ${esc(r.note)}</em>` : ''}</span>
      ${cfg ? `<button class="del" data-i="${r.i}" title="Elimina">✕</button>` : '<span></span>'}
    </li>`).join('');
  $('log-empty').classList.toggle('hidden', runs.length > 0);
  renderSummary();
}


/* ---- riepilogo ---- */
const DAY = 864e5;
const toDate = d => new Date(d + 'T12:00:00');
function renderSummary() {
  const set = (id, v) => { $(id).textContent = v; };
  const now = new Date(); now.setHours(12, 0, 0, 0);
  if (!runs.length) {
    ['r-best', 'r-last', 'r-pace', 'r-eta'].forEach(id => set(id, '–'));
    ['r-best-d', 'r-last-d', 'r-week-n', 'r-month-n'].forEach(id => set(id, ''));
    set('r-week', '0 km'); set('r-month', '0 km');
    $('months').innerHTML = '<p class="empty">Il grafico si riempie con le prime corse!</p>';
    return;
  }
  const best = runs.reduce((a, b) => b.km > a.km ? b : a);
  set('r-best', fmt(best.km) + ' km'); set('r-best-d', fmtDate(best.date).toLowerCase());

  const monday = new Date(now); monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const wk = runs.filter(r => toDate(r.date) >= monday && toDate(r.date) <= now);
  set('r-week', fmt(sumKm(wk)) + ' km'); set('r-week-n', wk.length + (wk.length === 1 ? ' corsa' : ' corse'));
  const ym = now.toISOString().slice(0, 7);
  const mo = runs.filter(r => r.date.startsWith(ym));
  set('r-month', fmt(sumKm(mo)) + ' km'); set('r-month-n', mo.length + (mo.length === 1 ? ' corsa' : ' corse'));

  const last = runs[runs.length - 1];
  const ago = Math.round((now - toDate(last.date)) / DAY);
  set('r-last', fmt(last.km) + ' km');
  set('r-last-d', ago <= 0 ? 'oggi' : ago === 1 ? 'ieri' : ago + ' giorni fa');

  const first = toDate(runs[0].date);
  const weeks = Math.max(1, (now - first) / DAY / 7);
  const pace = total / weeks;
  set('r-pace', fmt(pace));
  if (total >= GOAL_KM) { set('r-eta', 'ARRIVATO!'); set('r-eta-d', 'il ' + fmtDate(last.date).toLowerCase()); }
  else if (pace > 0 && runs.length >= 2) {
    const eta = new Date(now.getTime() + (GOAL_KM - total) / pace * 7 * DAY);
    set('r-eta', eta.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: '2-digit' }).toUpperCase());
    set('r-eta-d', 'al ritmo attuale');
  } else { set('r-eta', '…'); set('r-eta-d', 'servono almeno 2 corse'); }

  // km per mese, dal primo mese a oggi
  const months = [];
  const d = new Date(first.getFullYear(), first.getMonth(), 1);
  const end = new Date(Math.max(now, toDate(last.date)));
  while (d <= end) { months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`); d.setMonth(d.getMonth() + 1); }
  const vals = months.map(m => sumKm(runs.filter(r => r.date.startsWith(m))));
  const max = Math.max(...vals, 1);
  $('months').innerHTML = months.map((m, i) => {
    const lbl = new Date(m + '-15T12:00:00').toLocaleDateString('it-IT', { month: 'short', year: '2-digit' }).toUpperCase();
    return `<div class="month"><span class="mv">${fmt(vals[i])}</span><div class="mb" style="height:${Math.round(vals[i] / max * 110)}px"></div><span class="ml">${lbl}</span></div>`;
  }).join('');
  $('months').scrollLeft = 1e6;
}

let toastT;
function toast(msg) {
  const t = $('toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 3200);
}

/* ---- dialogs ---- */
document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => b.closest('dialog').close()));

$('btn-add').addEventListener('click', () => {
  const f = $('form-add');
  f.reset();
  const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  f.date.value = d.toISOString().slice(0, 10);
  $('dlg-add').showModal();
});

$('form-add').addEventListener('submit', async e => {
  e.preventDefault();
  const f = e.target, cfg = getCfg();
  if (!cfg) { $('dlg-add').close(); $('dlg-settings').showModal(); return; }
  const run = { date: f.date.value, km: Math.round(parseFloat(String(f.km.value).replace(',', '.')) * 100) / 100 };
  if (f.note.value.trim()) run.note = f.note.value.trim();
  if (!(run.km > 0)) return toast('Inserisci i km');
  const btn = f.querySelector('[type=submit]'); btn.disabled = true; btn.textContent = '...';
  try {
    const { runs: remote, sha } = await ghGet(cfg);
    const updated = normalize(remote.concat([run]));
    await ghPut(cfg, updated, sha, `Corsa ${run.date}: +${run.km} km`);
    const prev = total;
    runs = updated; renderUI();
    startAnim(prev, total);
    $('dlg-add').close();
    toast(`+${fmt(run.km)} KM! Chiara è più vicina ♥`);
  } catch (err) {
    toast('Errore: ' + err.message);
  } finally { btn.disabled = false; btn.textContent = 'SALVA'; }
});

$('log-list').addEventListener('click', async e => {
  const b = e.target.closest('.del'); if (!b) return;
  const r = runs[Number(b.dataset.i)]; const cfg = getCfg();
  if (!r || !cfg) return;
  if (!confirm(`Eliminare la corsa del ${fmtDate(r.date)} (${fmt(r.km)} km)?`)) return;
  try {
    const { runs: remote, sha } = await ghGet(cfg);
    const idx = remote.findIndex(x => x.date === r.date && x.km === r.km && (x.note || '') === (r.note || ''));
    if (idx < 0) throw new Error('Corsa non trovata');
    remote.splice(idx, 1);
    await ghPut(cfg, remote, sha, `Rimossa corsa ${r.date}`);
    const prev = total; runs = remote; renderUI(); startAnim(prev, total);
    toast('Corsa eliminata');
  } catch (err) { toast('Errore: ' + err.message); }
});

$('btn-settings').addEventListener('click', () => {
  const f = $('form-settings'), cfg = getCfg() || {};
  f.owner.value = cfg.owner || ''; f.repo.value = cfg.repo || ''; f.branch.value = cfg.branch || 'main'; f.token.value = cfg.token || '';
  $('dlg-settings').showModal();
});
$('form-settings').addEventListener('submit', async e => {
  e.preventDefault();
  const f = e.target;
  const cfg = { owner: f.owner.value.trim(), repo: f.repo.value.trim(), branch: f.branch.value.trim() || 'main', token: f.token.value.trim() };
  try {
    const { runs: remote } = await ghGet(cfg);
    localStorage.setItem(LS_KEY, JSON.stringify(cfg));
    runs = remote; renderUI();
    $('dlg-settings').close();
    toast('Collegato! Ora puoi aggiungere le corse');
  } catch (err) { toast('Errore: ' + err.message); }
});
$('btn-logout').addEventListener('click', () => {
  localStorage.removeItem(LS_KEY);
  $('dlg-settings').close(); renderUI(); toast('Scollegato da questo browser');
});

/* ================== START ================== */
(async () => {
  runs = await loadRuns();
  renderUI();
  try { await document.fonts.load(FONT); } catch {}
  startAnim(0, total);
  requestAnimationFrame(draw);
})();

})();
