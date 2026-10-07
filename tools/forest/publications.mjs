import { C, SERIF, SANS, MONO, rng, r1, esc, doc, moon, forestPath, pinePath, lantern, fireflies, fern, panel, heading, textLines } from './lib.mjs';
import { PUBS } from './content.mjs';

// Section 04: three moss-green standing stones on the shore of a moonlit
// lagoon, a small waterfall far behind them. Each stone carries one publication.

const W = 1280;
const H = 580;
const HZ = 330; // far shore / horizon
const BASE = 530; // waterline the stones stand on
const SW = 330; // stone width

const STONES = [
  { cx: 229, h: 304, seed: 41, lean: -0.03, shape: 'A' },
  { cx: 640, h: 296, seed: 57, lean: 0.015, shape: 'B' },
  { cx: 1051, h: 314, seed: 73, lean: 0.03, shape: 'C' },
];
// outline templates (x as a fraction of the width from the centre, y as a fraction of the height above the waterline)
const SHAPES = {
  A: [[-0.45, 0], [-0.48, -0.15], [-0.465, -0.4], [-0.43, -0.62], [-0.39, -0.78], [-0.33, -0.9], [-0.2, -0.975], [-0.06, -1.0], [0.1, -0.96], [0.24, -0.9], [0.35, -0.8], [0.42, -0.64], [0.465, -0.4], [0.485, -0.17], [0.46, 0]],
  B: [[-0.46, 0], [-0.49, -0.16], [-0.475, -0.42], [-0.45, -0.66], [-0.42, -0.82], [-0.34, -0.935], [-0.18, -0.985], [0.05, -1.0], [0.22, -0.985], [0.34, -0.93], [0.41, -0.82], [0.44, -0.62], [0.47, -0.4], [0.49, -0.17], [0.455, 0]],
  C: [[-0.45, 0], [-0.485, -0.18], [-0.46, -0.42], [-0.42, -0.64], [-0.37, -0.8], [-0.27, -0.92], [-0.1, -0.985], [0.08, -1.0], [0.22, -0.955], [0.32, -0.87], [0.4, -0.72], [0.45, -0.52], [0.48, -0.3], [0.485, -0.12], [0.46, 0]],
};

// the butte behind the centre stone (x, y)
const CLIFF = [[430, HZ + 4], [490, 300], [540, 240], [580, 186], [604, 142], [620, 114], [660, 114], [676, 142], [700, 186], [740, 240], [790, 300], [850, HZ + 4]];
const cliffTop = (x) => {
  for (let i = 0; i < CLIFF.length - 1; i++) {
    const [ax, ay] = CLIFF[i];
    const [bx, by] = CLIFF[i + 1];
    if (x >= ax && x <= bx) return ay + ((by - ay) * (x - ax)) / (bx - ax);
  }
  return HZ;
};

// Catmull-Rom through the points, as cubic beziers (open curve)
function spline(pts) {
  let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${r1(c1[0])} ${r1(c1[1])} ${r1(c2[0])} ${r1(c2[1])} ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return d;
}

// Conservative wrapping: SVG cannot measure text, so use generous glyph widths.
function wrapW(text, maxW, size, k) {
  const maxChars = Math.max(6, Math.floor(maxW / (size * k)));
  const words = String(text).split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > maxChars && cur) {
      lines.push(cur);
      cur = w;
    } else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(cur);
  return lines;
}

// ---- one standing stone -------------------------------------------------------
function outline(s) {
  const rand = rng(s.seed);
  const j = (a) => (rand() - 0.5) * a;
  const rel = SHAPES[s.shape];
  const pts = rel.map(([x, y], i) => {
    const edge = i === 0 || i === rel.length - 1;
    const f = -y;
    return [s.cx + (x + (edge ? 0 : j(0.03)) + s.lean * f) * SW, BASE + (y + (edge ? 0 : j(0.02))) * s.h];
  });
  return { pts, rel, d: spline(pts) + 'Z', rand };
}

function stoneArt(s, i) {
  const { pts, rel, d, rand } = outline(s);
  const top = BASE - s.h;
  const cx = s.cx;
  const lampX = cx - 124;
  let tex = '';
  // strata
  for (let k = 0; k < 4; k++) {
    const y = top + s.h * (0.2 + k * 0.2 + rand() * 0.06);
    const a = cx - SW / 2 - 6;
    const b = cx + SW / 2 + 6;
    const q = (rand() - 0.5) * 18;
    tex += `<path d="M${r1(a)} ${r1(y)}Q${r1(cx)} ${r1(y + q)} ${r1(b)} ${r1(y + 6 + rand() * 8)}" fill="none" stroke="#06140d" stroke-opacity=".2" stroke-width="1.4"/><path d="M${r1(a)} ${r1(y + 2)}Q${r1(cx)} ${r1(y + q + 2)} ${r1(b)} ${r1(y + 8 + rand() * 6)}" fill="none" stroke="#cfe8d6" stroke-opacity=".06" stroke-width="1"/>`;
  }
  // speckle
  let sp = '';
  for (let k = 0; k < 46; k++) {
    const x = cx - SW / 2 + rand() * SW;
    const y = top + rand() * s.h;
    sp += `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(0.6 + rand() * 0.9)}" fill="${rand() < 0.55 ? '#06140d' : '#d6efe0'}" opacity="${r1(0.12 + rand() * 0.2)}"/>`;
  }
  // moss: light on the shoulders, dark at the foot, a little down the left flank
  let moss = '';
  // a mossy cap that hugs the crown, with drapes hanging off it
  const cap = pts.filter((q, k) => rel[k][1] <= -0.74);
  moss += `<path d="${spline(cap)}" fill="none" stroke="#5f8f4e" stroke-opacity=".42" stroke-width="20" stroke-linejoin="round" stroke-linecap="round" stroke-dasharray="46 9 28 12 70 10 34 14 58 8"/>`;
  moss += `<path d="${spline(cap.map(([x, y]) => [x, y + 7]))}" fill="none" stroke="#8fc06c" stroke-opacity=".3" stroke-width="9" stroke-linejoin="round" stroke-linecap="round" stroke-dasharray="30 18 52 12 24 20 64 10"/>`;
  const yAt = (x) => {
    for (let k = 0; k < cap.length - 1; k++) {
      const [ax, ay] = cap[k];
      const [bx, by] = cap[k + 1];
      if (x >= Math.min(ax, bx) && x <= Math.max(ax, bx)) return ay + ((by - ay) * (x - ax)) / (bx - ax || 1);
    }
    return top + 20;
  };
  const xmin = Math.min(...cap.map((q) => q[0])) + 6;
  const xmax = Math.max(...cap.map((q) => q[0])) - 6;
  for (let k = 0; k < 11; k++) {
    const x = xmin + rand() * (xmax - xmin);
    const y = yAt(x) + 8;
    moss += `<path d="M${r1(x)} ${r1(y)}q${r1((rand() - 0.5) * 4)} ${r1(6 + rand() * 8)} ${r1((rand() - 0.5) * 3)} ${r1(14 + rand() * 20)}" fill="none" stroke="#7fb062" stroke-opacity="${r1(0.3 + rand() * 0.2)}" stroke-width="${r1(2.4 + rand() * 2.4)}" stroke-linecap="round"/>`;
  }
  for (let k = 0; k < 3; k++) {
    moss += `<ellipse cx="${r1(cx - 0.3 * SW + rand() * 0.6 * SW)}" cy="${r1(top + 22 + rand() * 24)}" rx="${r1(22 + rand() * 24)}" ry="${r1(6 + rand() * 6)}" fill="#86b765" opacity="${r1(0.1 + rand() * 0.08)}"/>`;
  }
  for (let k = 0; k < 6; k++) {
    moss += `<ellipse cx="${r1(cx - 0.48 * SW + rand() * 0.96 * SW)}" cy="${r1(BASE - 4 - rand() * 18)}" rx="${r1(26 + rand() * 30)}" ry="${r1(7 + rand() * 8)}" fill="#15301f" opacity="${r1(0.4 + rand() * 0.25)}"/>`;
  }
  for (let k = 0; k < 4; k++) {
    moss += `<ellipse cx="${r1(cx - 0.47 * SW + rand() * 14)}" cy="${r1(top + s.h * (0.25 + rand() * 0.55))}" rx="${r1(8 + rand() * 8)}" ry="${r1(20 + rand() * 18)}" fill="#6b9a58" opacity="${r1(0.16 + rand() * 0.1)}"/>`;
  }
  // cracks on the flanks, clear of the text
  let cracks = '';
  for (const side of [-1, 1]) {
    let x = cx + side * (0.405 + rand() * 0.03) * SW;
    let y = BASE - s.h * (0.3 + rand() * 0.25);
    let dd = `M${r1(x)} ${r1(y)}`;
    let dd2 = `M${r1(x + 1.4)} ${r1(y + 0.4)}`;
    for (let k = 0; k < 4; k++) {
      const dx = (rand() - 0.5) * 12;
      const dy = 12 + rand() * 10;
      x += dx;
      y += dy;
      dd += `l${r1(dx)} ${r1(dy)}`;
      dd2 += `l${r1(dx)} ${r1(dy)}`;
    }
    cracks += `<path d="${dd}" fill="none" stroke="#04100a" stroke-opacity=".5" stroke-width="1.2" stroke-linejoin="round"/><path d="${dd2}" fill="none" stroke="#d6efe0" stroke-opacity=".14" stroke-width="1"/>`;
  }
  // grass tufts on the crown (outside the clip, so they break the silhouette)
  let tufts = '';
  const crown = rel.map((q, k) => k).filter((k) => rel[k][1] <= -0.9);
  const picks = [crown[0], crown[Math.floor(crown.length / 2)], crown[crown.length - 1]];
  for (const idx of picks) {
    const [px, py] = pts[idx];
    const n = 5;
    let blades = '';
    for (let k = 0; k < n; k++) {
      const a = (k - (n - 1) / 2) * 0.42 + (rand() - 0.5) * 0.2;
      const len = 9 + rand() * 9;
      blades += `M${r1(px + (k - 2) * 1.6)} ${r1(py + 3)}Q${r1(px + (k - 2) * 1.6 + Math.sin(a) * len * 0.35)} ${r1(py - len * 0.6)} ${r1(px + Math.sin(a) * len)} ${r1(py - Math.cos(a) * len)}`;
    }
    tufts += `<path class="ob sway" style="animation-duration:${r1(6 + rand() * 4)}s;animation-delay:-${r1(rand() * 5)}s" d="${blades}" fill="none" stroke="${rel[idx][0] > 0 ? '#6fa56b' : '#4f8559'}" stroke-width="1.7" stroke-linecap="round"/>`;
  }

  const warmDur = r1(3.2 + i * 0.5);
  const face = `<clipPath id="sc${i}"><path d="${d}"/></clipPath>
<g clip-path="url(#sc${i})">
<rect x="${r1(cx - SW / 2 - 14)}" y="${r1(top - 20)}" width="${SW + 28}" height="${s.h + 30}" fill="url(#rimG)"/>
<g transform="translate(-5 4)"><path d="${d}" fill="url(#stoneFace)"/></g>
<path d="M${r1(cx + 0.1 * SW)} ${r1(top - 12)}L${r1(cx + 0.6 * SW)} ${r1(top + 0.16 * s.h)}V${BASE}H${r1(cx + 0.3 * SW)}Z" fill="#dff3e6" opacity=".055"/>
<path d="M${r1(cx - 0.6 * SW)} ${r1(top + 0.1 * s.h)}L${r1(cx - 0.3 * SW)} ${r1(top + 0.3 * s.h)}L${r1(cx - 0.36 * SW)} ${BASE}H${r1(cx - 0.6 * SW)}Z" fill="#020d08" opacity=".14"/>
${tex}${sp}${moss}${cracks}
<rect x="${r1(cx - SW / 2 - 14)}" y="${r1(top - 20)}" width="${SW + 28}" height="${s.h + 30}" fill="url(#stoneShade)"/>
<ellipse cx="${lampX + 10}" cy="${BASE - 4}" rx="150" ry="120" fill="url(#lg)" opacity=".75" class="flick" style="animation-duration:${warmDur}s;animation-delay:-${i}s"/>
<rect x="${r1(cx - SW / 2 - 14)}" y="${BASE - 30}" width="${SW + 28}" height="34" fill="url(#wetG)"/>
</g>`;

  return { d, face, tufts, lampX };
}

// ---- the inscription ----------------------------------------------------------
function inscription(s, p) {
  const cx = s.cx;
  const top = BASE - s.h;
  const innerW = 250;
  const idLines = wrapW(p.id, innerW, 13, 0.62);
  const idLast = BASE - 36;
  const idFirst = idLast - (idLines.length - 1) * 17;
  const ruleY = idFirst - 25;
  const venueY = top + 64;
  const zoneTop = venueY + 26;
  const zoneBot = ruleY - 13;
  const zoneH = zoneBot - zoneTop;
  let size = 0;
  let lines = [];
  for (let sz = 22; sz >= 17; sz--) {
    const ls = wrapW(p.title, innerW, sz, 0.54);
    if (ls.length * sz * 1.3 <= zoneH * 0.94) {
      size = sz;
      lines = ls;
      break;
    }
  }
  if (!size) throw new Error('title does not fit: ' + p.title);
  const lh = 1.3;
  const blockH = lines.length * size * lh;
  const first = zoneTop + (zoneH - blockH) / 2 + size * 0.95;
  // carved look: a dark lip above each letter, a pale catch-light below, then the letter itself
  const carve = (arr, o, fill) =>
    textLines(arr, { ...o, y: o.y + 1.1, fill: '#dff3e6', extra: 'opacity=".2"' }) +
    textLines(arr, { ...o, y: o.y - 0.9, fill: '#02100a', extra: 'opacity=".6"' }) +
    textLines(arr, { ...o, fill });
  let out = '';
  // venue, amber small caps
  out += `<text x="${r1(cx + 1.5)}" y="${venueY + 1.4}" font-family="${SANS}" font-size="13" font-weight="600" letter-spacing="2.6" fill="#03100a" opacity=".6" text-anchor="middle">${esc(p.venue.toUpperCase())}</text>`;
  out += `<text x="${r1(cx + 1.5)}" y="${venueY}" font-family="${SANS}" font-size="13" font-weight="600" letter-spacing="2.6" fill="${C.amber}" text-anchor="middle">${esc(p.venue.toUpperCase())}</text>`;
  const orn = (y, col, o) => `<path d="M${cx - 56} ${y}H${cx - 9}M${cx + 9} ${y}H${cx + 56}" stroke="${col}" stroke-opacity="${o}" stroke-width="1" fill="none"/><path d="M${cx} ${y - 3.4}l3.4 3.4l-3.4 3.4l-3.4 -3.4Z" fill="${col}" fill-opacity="${o + 0.2}"/>`;
  out += orn(venueY + 15, C.amber, 0.45);
  // title, cream serif
  const to = { x: cx, size, lh, family: SERIF, weight: 500, anchor: 'middle' };
  out += carve(lines, { ...to, y: first }, C.cream);
  // id, muted mono
  out += orn(ruleY, '#b7c1d8', 0.3);
  const io = { x: cx, size: 13, lh: 17 / 13, family: MONO, anchor: 'middle' };
  out += carve(idLines, { ...io, y: idFirst }, C.muted);
  return { out, size, nLines: lines.length };
}

// ---- iron and glass lamp on a stepping stone -------------------------------------
function lamp(x, y, k) {
  const dur = r1(3 + k * 0.6);
  return `<g transform="translate(${x} ${y})">
<ellipse cx="0" cy="16" rx="34" ry="9" fill="url(#lg)" opacity=".8" class="o flick" style="animation-duration:${dur}s;animation-delay:-${k}s"/>
<ellipse cx="0" cy="24" rx="9" ry="22" fill="url(#refl)" class="o shim" style="animation-duration:${r1(2.6 + k * 0.5)}s;animation-delay:-${k * 0.7}s"/>
<ellipse cx="0" cy="3" rx="27" ry="7" fill="#050c0a"/>
<ellipse cx="0" cy="1.2" rx="25" ry="5.8" fill="#2a4538"/>
<ellipse cx="0" cy="0" rx="21" ry="4.1" fill="#4d7a63" opacity=".75"/>
<circle cx="0" cy="-22" r="54" fill="url(#lg)" class="o flick" style="animation-duration:${dur}s;animation-delay:-${k * 1.1}s"/>
<rect x="-10" y="-6" width="20" height="5" rx="1.4" fill="#17110d"/>
<path d="M-8.5 -6L-9.5 -31H9.5L8.5 -6Z" fill="url(#lampg)"/>
<ellipse cy="-18" rx="3.6" ry="9" fill="#fff6d8" class="o flick" style="animation-duration:${r1(1.5 + k * 0.2)}s"/>
<path d="M-8.5 -6L-9.5 -31M8.5 -6L9.5 -31M-9.2 -18.5H9.2" stroke="#17110d" stroke-width="1.9" stroke-linecap="round" fill="none"/>
<path d="M-6 -27V-11" stroke="#fff" stroke-opacity=".28" stroke-width="1.4" stroke-linecap="round"/>
<path d="M-13 -31L-6 -39H6L13 -31Z" fill="#17110d"/>
<rect x="-14" y="-32.4" width="28" height="2.6" rx="1.2" fill="#2a1f18"/>
<circle cx="0" cy="-42" r="2.6" fill="none" stroke="#17110d" stroke-width="1.6"/>
</g>`;
}

export function publications() {
  const rand = rng(404);
  let css = `
@keyframes driftS{0%{transform:translateX(-6px)}100%{transform:translateX(6px)}}
@keyframes driftM{0%{transform:translateX(-14px)}100%{transform:translateX(14px)}}
.dS{animation:driftS 17s ease-in-out infinite alternate}
.dM{animation:driftM 14s ease-in-out infinite alternate}
`;
  const p = panel({ w: W, h: H, id: 'pn', seed: 17, starCount: 150 });
  let defs = p.defs;
  defs += `
<linearGradient id="fallsG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3f8ff" stop-opacity=".92"/><stop offset="1" stop-color="#bcd2ff" stop-opacity=".55"/></linearGradient>
<linearGradient id="glowcol" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b8ccff" stop-opacity=".5"/><stop offset="1" stop-color="#b8ccff" stop-opacity="0"/></linearGradient>
<radialGradient id="mistg" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#cfe0ff" stop-opacity=".55"/><stop offset="1" stop-color="#cfe0ff" stop-opacity="0"/></radialGradient>
<linearGradient id="butteG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0d1838"/><stop offset=".55" stop-color="#15245a"/><stop offset="1" stop-color="#243a78"/></linearGradient>
<linearGradient id="wetG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#03070f" stop-opacity="0"/><stop offset="1" stop-color="#03070f" stop-opacity=".7"/></linearGradient>
<linearGradient id="haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5f74a8" stop-opacity="0"/><stop offset="1" stop-color="#5f74a8" stop-opacity=".4"/></linearGradient>
<linearGradient id="watg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a4d7d"/><stop offset=".22" stop-color="#1c2f5a"/><stop offset="1" stop-color="#08132b"/></linearGradient>
<linearGradient id="stoneFace" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1d3529"/><stop offset=".5" stop-color="#34574a"/><stop offset="1" stop-color="#46705b"/></linearGradient>
<linearGradient id="stoneShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9c2ff" stop-opacity=".2"/><stop offset=".32" stop-color="#a9c2ff" stop-opacity="0"/><stop offset=".7" stop-color="#050a17" stop-opacity=".1"/><stop offset="1" stop-color="#050a17" stop-opacity=".55"/></linearGradient>
<linearGradient id="rimG" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#4d7a64"/><stop offset="1" stop-color="#d9f1e3"/></linearGradient>
<linearGradient id="reflS" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#4a7560" stop-opacity=".5"/><stop offset=".22" stop-color="#2c4d3c" stop-opacity=".16"/><stop offset=".4" stop-color="#2c4d3c" stop-opacity="0"/></linearGradient>
<linearGradient id="lampg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe6b0" stop-opacity=".9"/><stop offset="1" stop-color="#ff9a3d" stop-opacity=".75"/></linearGradient>
<linearGradient id="fade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#050a17" stop-opacity=".5"/><stop offset=".7" stop-color="#050a17" stop-opacity="0"/></linearGradient>
`;

  let body = '';
  // ---- sky glow, moon
  body += `<ellipse cx="640" cy="${HZ}" rx="560" ry="150" fill="#4d5f8f" opacity=".16"/>`;
  body += moon(1110, 94, 30);

  // ---- far ridge and far forest
  body += `<path d="M0 ${HZ + 4}V288Q90 262 180 280T360 270T560 286T760 266T960 284T1160 262T1280 278V${HZ + 4}Z" fill="#101d42"/>`;
  body += `<g class="dS"><path d="${forestPath({ x0: -40, x1: 1320, by: HZ - 1, hMin: 34, hMax: 80, gap: 24, seed: 3, oakShare: 0.25 })}" fill="#0e1a3c"/></g>`;
  body += `<rect y="${HZ - 50}" width="${W}" height="56" fill="url(#haze)"/>`;

  // ---- butte, waterfall
  const cliffLine = CLIFF.map((q) => q.join(' ')).join('L');
  body += `<path d="M${cliffLine}V${HZ + 6}H${CLIFF[0][0]}Z" fill="url(#butteG)"/>`;
  body += `<path d="M${cliffLine}" fill="none" stroke="#7f9be0" stroke-opacity=".34" stroke-width="1.6" stroke-linejoin="round"/>`;
  for (let i = 0; i < 12; i++) {
    const x = 480 + rand() * 320;
    if (x > 612 && x < 668) continue;
    const t = cliffTop(x);
    body += `<path d="M${r1(x)} ${r1(t + 6)}v${r1(24 + rand() * 60)}" stroke="#1a2b57" stroke-opacity=".55" stroke-width="${r1(2 + rand() * 3)}" stroke-linecap="round"/>`;
  }
  let crown = '';
  for (let x = 520; x < 770; x += 11 + rand() * 12) {
    if (x > 612 && x < 668) continue;
    crown += pinePath(x, cliffTop(x) + 3, 16 + rand() * 24, 7 + rand() * 5, rand);
  }
  body += `<path d="${crown}" fill="#08112a"/>`;
  body += `<ellipse cx="640" cy="196" rx="74" ry="118" fill="url(#mistg)" opacity=".34"/>`;
  body += `<path d="M622 114L658 114L684 ${HZ}L596 ${HZ}Z" fill="url(#fallsG)"/>`;
  body += `<rect x="620" y="112" width="40" height="3.4" rx="1.7" fill="#ffffff" opacity=".7"/>`;
  for (let i = 0; i < 11; i++) {
    const x = 624.5 + i * 3.1 + (rand() - 0.5) * 1.2;
    const wdt = 1.4 + rand() * 2.2;
    body += `<path class="fall" d="M${r1(x)} 115L${r1(x + (x - 640) * 1.1)} ${HZ - 1}" stroke="#ffffff" stroke-opacity="${r1(0.4 + rand() * 0.4)}" stroke-width="${r1(wdt)}" stroke-dasharray="${i % 2 ? '14 22' : '16 56'}" style="animation-duration:${r1(0.9 + rand() * 0.8)}s;animation-delay:-${r1(rand() * 2)}s" fill="none"/>`;
  }
  // mist: a low band along the far shore, a veil that rises behind the centre stone
  body += `<ellipse cx="640" cy="${HZ - 3}" rx="270" ry="17" fill="url(#mistg)" opacity=".55" class="mist" style="animation-duration:15s"/>`;
  body += `<ellipse cx="640" cy="238" rx="120" ry="24" fill="url(#mistg)" opacity=".75" class="mist" style="animation-duration:19s"/>`;
  for (let i = 0; i < 6; i++) {
    body += `<ellipse cx="${r1(596 + i * 17 + rand() * 8)}" cy="${r1(232 + rand() * 8)}" rx="${r1(30 + rand() * 22)}" ry="${r1(8 + rand() * 5)}" fill="url(#mistg)" class="o rise" style="animation-duration:${r1(4.5 + rand() * 3)}s;animation-delay:-${r1(rand() * 6)}s"/>`;
  }

  // ---- mid forest, either side of the butte
  const midL = forestPath({ x0: -60, x1: 600, by: HZ + 4, hMin: 60, hMax: 122, gap: 42, seed: 8, oakShare: 0.35 });
  const midR = forestPath({ x0: 740, x1: 1340, by: HZ + 4, hMin: 80, hMax: 214, gap: 40, seed: 9, oakShare: 0.12 });
  body += `<g class="dM"><path d="${midL}" fill="#070f26"/><path d="${midR}" fill="#070f26"/></g>`;

  // ---- the lagoon
  body += `<rect y="${HZ + 4}" width="${W}" height="${H - HZ - 4}" fill="url(#watg)"/>`;
  body += `<path d="M0 ${HZ + 4}H${W}" stroke="#6f86c4" stroke-opacity=".3" stroke-width="1.2"/>`;
  // moon path and falls light on the water
  for (let k = 0; k < 9; k++) {
    body += `<ellipse cx="${r1(1110 + (rand() - 0.5) * 8)}" cy="${HZ + 16 + k * 26}" rx="${r1(12 + k * 5.5)}" ry="2" fill="#d6e4ff" opacity="${r1(0.5 - k * 0.04)}" class="o shim" style="animation-duration:${r1(2.4 + rand() * 2.4)}s;animation-delay:-${r1(rand() * 3)}s"/>`;
  }
  body += `<path d="M618 ${HZ + 6}L662 ${HZ + 6}L700 ${H}H580Z" fill="url(#glowcol)" opacity=".4" class="o shim" style="animation-duration:6s"/>`;
  for (let k = 0; k < 16; k++) {
    const x = 20 + rand() * 1240;
    const y = HZ + 22 + rand() * 210;
    body += `<path d="M${r1(x)} ${r1(y)}h${r1(10 + rand() * 24)}" stroke="#8aa5e8" stroke-opacity="${r1(0.14 + rand() * 0.14)}" stroke-width="1.2" stroke-linecap="round"/>`;
  }

  body += `<ellipse cx="300" cy="${HZ + 52}" rx="360" ry="20" fill="url(#mistg)" opacity=".3" class="mist" style="animation-duration:21s"/>`;
  body += `<ellipse cx="980" cy="${HZ + 96}" rx="380" ry="22" fill="url(#mistg)" opacity=".26" class="mist" style="animation-duration:25s;animation-delay:-9s"/>`;

  // ---- floating paper lanterns in the gaps between the stones
  const gaps = [[435, 466, 3], [846, 474, 6]];
  gaps.forEach(([x, y, sd], gi) => {
    body += `<g transform="translate(${x} ${y}) scale(.62)"><g class="bob" style="animation-duration:${r1(4 + gi)}s">${lantern({ glow: 1.2, refl: true, seed: sd })}</g></g>`;
    body += `<ellipse cx="${x}" cy="${y + 20}" rx="30" ry="4" fill="none" stroke="#c7d6ff" stroke-opacity=".5" stroke-width="1.2" class="o ripple" style="animation-duration:${r1(3.6 + gi * 0.7)}s;animation-delay:-${gi}s"/>`;
  });

  // ---- far fireflies (behind the stones)
  const ffA = [[60, 238, 0.8], [300, 206, 0.8], [520, 300, 0.9], [760, 214, 0.8], [1010, 292, 0.9], [1180, 206, 0.8], [418, 392, 1.0], [866, 392, 1.0]];
  ffA.forEach(([x, y, sc], i) => {
    const f = fireflies({ n: 1, box: [x, y, x, y], seed: 31 + i * 7, scale: sc, prefix: `fa${i}_` });
    css += f.css;
    body += f.body;
  });

  // ---- tall pines framing the edges, banks
  const tall = (x, by, h, w, sd) => pinePath(x, by, h, w, rng(sd));
  body += `<path d="${tall(10, 484, 300, 118, 5)}${tall(1268, 484, 344, 128, 6)}${tall(1188, 470, 262, 104, 7)}" fill="#040918"/>`;
  body += `<path d="M0 446Q30 474 46 520Q58 552 36 580H0ZM${W} 440Q${W - 30} 470 ${W - 44} 516Q${W - 58} 552 ${W - 34} 580H${W}Z" fill="#03060f"/>`;

  // ---- the three stones
  const arts = STONES.map((s, i) => stoneArt(s, i));
  const texts = STONES.map((s, i) => inscription(s, PUBS[i]));
  STONES.forEach((s, i) => {
    const a = arts[i];
    // shadow on the water, mirrored stone fading downward, wobbling water lines
    body += `<ellipse cx="${s.cx}" cy="${BASE + 5}" rx="${SW / 2 + 14}" ry="9" fill="#02050e" opacity=".55"/>`;
    body += `<path d="${a.d}" transform="translate(0 ${2 * BASE}) scale(1 -1)" fill="url(#reflS)"/>`;
    for (let k = 0; k < 4; k++) {
      body += `<path d="M${s.cx - SW / 2} ${BASE + 9 + k * 11}h${SW}" stroke="#0b1a38" stroke-opacity=".55" stroke-width="${r1(1.6 + k * 0.5)}" stroke-dasharray="${40 + k * 14} 16"/>`;
    }
    body += a.face;
    body += a.tufts;
    body += texts[i].out;
    // rings spreading from the foot
    for (let k = 0; k < 2; k++) {
      body += `<ellipse cx="${s.cx}" cy="${BASE + 2}" rx="${SW / 2 - 8}" ry="8" fill="none" stroke="#9db8ff" stroke-opacity=".34" stroke-width="1.2" class="o ripple" style="animation-duration:${r1(4.4 + i * 0.4)}s;animation-delay:-${r1(k * 2.2 + i * 0.9 + 0.7)}s"/>`;
    }
    body += lamp(a.lampX, BASE + 26, i);
  });

  // ---- near fireflies, ferns, vignette
  const ffB = [[330, 552, 1.5], [560, 560, 1.4], [760, 548, 1.5], [980, 562, 1.4]];
  ffB.forEach(([x, y, sc], i) => {
    const f = fireflies({ n: 1, box: [x, y, x, y], seed: 91 + i * 5, scale: sc, prefix: `fb${i}_` });
    css += f.css;
    body += f.body;
  });
  body += fern(-8, 592, 96, 12, '#03060f', 1);
  body += fern(1290, 594, 104, -12, '#03060f', 3);

  // ---- heading
  const head = heading({ eyebrow: '04 / PUBLICATIONS', title: 'Published work', sub: 'Research that stands like stones beside the falls.' });

  const descText = PUBS.map((q) => `${q.venue}: ${q.title}. ${q.id}.`).join(' ');
  return doc({
    w: W,
    h: H,
    title: 'Published work, 04 Publications',
    desc: `04 / PUBLICATIONS. Published work. Research that stands like stones beside the falls. A moonlit lagoon below a small waterfall, three moss-green standing stones, each engraved with one publication and lit by a small glass lamp at its foot. ${descText}`,
    defs,
    css,
    body: p.open + body + p.close + head,
  });
}

export default function build() {
  return { 'publications.svg': publications() };
}
