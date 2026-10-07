import { C, SERIF, SANS, MONO, rng, r1, esc, doc, moon, forestPath, pinePath, lantern, fireflies, fern, panel, heading } from './lib.mjs';
import { PUBS } from './content.mjs';

// Section 05: three dark slate river boulders on the shore of a moonlit lagoon,
// a small waterfall far behind them. Each boulder carries one publication on an
// engraved plaque set into its face. The moon (upper right) rims every boulder
// on its top right edge; a glass lamp at each foot lights the lower left.

const W = 1280;
const H = 740;
const HZ = 385; // far shore / horizon
const BASE = 676; // waterline the boulders stand in
const PW = 300; // plaque width
const PAD = 13; // plaque inner padding
const SLACK = 1.12; // titles are wrapped to inner width / SLACK
const ID_SLACK = 1.15; // mono ids likewise, a little looser so every id breaks the same way
const PLQ_BOT = 40; // plaque bottom above the waterline

// Boulder outlines, built from the plaque top so the carved panel always has rock around it.
// x from the centre, y up from the waterline, clockwise from the left foot.
const BOULDERS = [
  {
    // Wiley: a low rock leaning right, a second stone rising behind its left shoulder
    cx: 216,
    seed: 41,
    pts: (t) => [[-168, 0], [-186, 26], [-198, 66], [-178, 110], [-194, 152], [-184, 198], [-176, t - 6], [-170, t + 20], [-154, t + 40], [-124, t + 50], [-96, t + 66], [-58, t + 76], [-12, t + 74], [34, t + 66], [78, t + 56], [120, t + 50], [160, t + 40], [184, t + 18], [190, t - 30], [192, 120], [184, 56], [174, 12], [158, 0]],
    rear: (t) => [[-196, t - 40], [-194, t + 22], [-180, t + 70], [-152, t + 104], [-114, t + 118], [-78, t + 104], [-52, t + 76], [-30, t + 40], [-20, t - 40]],
    stones: [[[150, 0], [158, 20], [182, 34], [204, 30], [220, 14], [224, 0]]],
  },
  {
    // Springer: leans left, a taller stone rising behind the right shoulder
    cx: 640,
    seed: 57,
    pts: (t) => [[-170, 0], [-190, 40], [-198, 110], [-190, 200], [-180, t - 6], [-176, t + 22], [-158, t + 46], [-126, t + 64], [-88, t + 78], [-44, t + 88], [0, t + 82], [40, t + 70], [84, t + 62], [124, t + 54], [156, t + 40], [178, t + 18], [186, t - 30], [190, 176], [174, 132], [190, 96], [184, 46], [176, 18], [164, 0]],
    rear: (t) => [[34, t + 20], [58, t + 74], [96, t + 114], [140, t + 124], [176, t + 98], [196, t + 50], [198, t - 30]],
    stones: [[[-224, 0], [-218, 16], [-196, 30], [-172, 26], [-152, 10], [-146, 0]], [[152, 0], [160, 14], [182, 22], [204, 10], [208, 0]]],
  },
  {
    // Zenodo: the tall one; the stone behind its right shoulder points to the moon
    cx: 1064,
    seed: 73,
    pts: (t) => [[-174, 0], [-190, 44], [-194, 88], [-174, 130], [-194, 174], [-188, 220], [-182, t - 10], [-176, t + 20], [-158, t + 52], [-128, t + 72], [-90, t + 82], [-48, t + 84], [-6, t + 72], [34, t + 60], [76, t + 50], [118, t + 42], [152, t + 34], [176, t + 14], [186, t - 30], [192, 160], [186, 76], [178, 24], [168, 0]],
    rear: (t) => [[30, t + 16], [54, t + 72], [88, t + 112], [128, t + 128], [166, t + 108], [190, t + 66], [198, t + 10], [200, t - 40]],
    stones: [[[-224, 0], [-216, 18], [-194, 32], [-170, 28], [-150, 12], [-146, 0]]],
  },
];

// the butte behind the centre boulder (x, y)
const CLIFF = [[430, HZ + 4], [490, HZ - 32], [540, HZ - 92], [580, HZ - 146], [604, HZ - 190], [620, 132], [660, 132], [676, HZ - 190], [700, HZ - 146], [740, HZ - 92], [790, HZ - 32], [850, HZ + 4]];
const cliffTop = (x) => {
  for (let i = 0; i < CLIFF.length - 1; i++) {
    const [ax, ay] = CLIFF[i];
    const [bx, by] = CLIFF[i + 1];
    if (x >= ax && x <= bx) return ay + ((by - ay) * (x - ax)) / (bx - ax);
  }
  return HZ;
};

// ---- text measuring ------------------------------------------------------------
// Advance widths (thousandths of an em, ASCII 32..126) of Georgia, the common
// fallback serif: every title line gets an explicit textLength built from these,
// so a narrower or wider serif is nudged to the same width instead of overflowing.
const GEORGIA = [241, 331, 412, 643, 610, 817, 710, 215, 375, 375, 472, 643, 270, 374, 270, 469, 614, 430, 559, 552, 565, 528, 566, 502, 596, 566, 313, 313, 643, 643, 643, 479, 929, 671, 654, 642, 749, 653, 599, 725, 815, 390, 518, 694, 604, 927, 767, 744, 610, 744, 702, 561, 619, 756, 667, 976, 710, 615, 602, 375, 469, 375, 643, 643, 500, 504, 560, 454, 574, 483, 325, 509, 582, 293, 292, 536, 286, 881, 591, 539, 571, 560, 410, 432, 345, 575, 497, 737, 505, 492, 444, 430, 375, 430, 643];
const serifW = (s, size) => ([...s].reduce((a, c) => a + (GEORGIA[c.charCodeAt(0) - 32] ?? 600), 0) / 1000) * size;
const CAPS = { A: 0.667, B: 0.667, C: 0.722, D: 0.722, E: 0.667, F: 0.611, G: 0.778, H: 0.722, I: 0.278, J: 0.5, K: 0.667, L: 0.556, M: 0.833, N: 0.722, O: 0.778, P: 0.667, Q: 0.778, R: 0.722, S: 0.667, T: 0.611, U: 0.722, V: 0.667, W: 0.944, X: 0.667, Y: 0.667, Z: 0.611, ' ': 0.278 };
const capsW = (s, size, spacing) => [...s].reduce((a, c) => a + (CAPS[c] ?? 0.7) * size * 1.05 + spacing, 0) - spacing;
const MONO_W = 0.6; // em per mono glyph (Menlo, SF Mono, DejaVu Sans Mono, Courier)

function wrapSerif(text, maxW, size) {
  const lines = [];
  let cur = '';
  for (const w of String(text).split(/\s+/)) {
    const next = cur ? cur + ' ' + w : w;
    if (cur && serifW(next, size) > maxW) {
      lines.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
}
// same number of lines as the greedy wrap, but as even as possible
function balancedWrap(text, maxW, size) {
  const n = wrapSerif(text, maxW, size).length;
  let w = maxW;
  while (w > 60 && wrapSerif(text, w - 2, size).length === n) w -= 2;
  return wrapSerif(text, w, size);
}
function wrapMono(text, maxW, size) {
  const maxChars = Math.floor(maxW / (size * MONO_W));
  const lines = [];
  let cur = '';
  for (const w of String(text).split(/\s+/)) {
    const next = cur ? cur + ' ' + w : w;
    if (cur && next.length > maxChars) {
      lines.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
}

// ---- geometry --------------------------------------------------------------------
const abs = (s, [x, y]) => [s.cx + x, BASE - y];

// polygon with softly rounded corners
function roundedPoly(P, r) {
  const n = P.length;
  let d = '';
  for (let i = 0; i < n; i++) {
    const prev = P[(i - 1 + n) % n];
    const cur = P[i];
    const next = P[(i + 1) % n];
    const l1 = Math.hypot(prev[0] - cur[0], prev[1] - cur[1]);
    const l2 = Math.hypot(next[0] - cur[0], next[1] - cur[1]);
    const rr = Math.min(r, l1 / 2.2, l2 / 2.2);
    const a = [cur[0] + ((prev[0] - cur[0]) / l1) * rr, cur[1] + ((prev[1] - cur[1]) / l1) * rr];
    const b = [cur[0] + ((next[0] - cur[0]) / l2) * rr, cur[1] + ((next[1] - cur[1]) / l2) * rr];
    d += `${i ? 'L' : 'M'}${r1(a[0])} ${r1(a[1])}Q${r1(cur[0])} ${r1(cur[1])} ${r1(b[0])} ${r1(b[1])}`;
  }
  return d + 'Z';
}
// the same corners as roundedPoly, sampled into a plain polygon (for hit tests)
function roundedPts(P, r) {
  const n = P.length;
  const out = [];
  for (let i = 0; i < n; i++) {
    const prev = P[(i - 1 + n) % n];
    const cur = P[i];
    const next = P[(i + 1) % n];
    const l1 = Math.hypot(prev[0] - cur[0], prev[1] - cur[1]);
    const l2 = Math.hypot(next[0] - cur[0], next[1] - cur[1]);
    const rr = Math.min(r, l1 / 2.2, l2 / 2.2);
    const a = [cur[0] + ((prev[0] - cur[0]) / l1) * rr, cur[1] + ((prev[1] - cur[1]) / l1) * rr];
    const b = [cur[0] + ((next[0] - cur[0]) / l2) * rr, cur[1] + ((next[1] - cur[1]) / l2) * rr];
    for (const t of [0, 0.25, 0.5, 0.75, 1]) {
      const u = 1 - t;
      out.push([u * u * a[0] + 2 * u * t * cur[0] + t * t * b[0], u * u * a[1] + 2 * u * t * cur[1] + t * t * b[1]]);
    }
  }
  return out;
}
function inside(poly, [x, y]) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

// ---- the plaque: content and size -------------------------------------------------
function plaqueLayout(p) {
  const size = 20;
  const lh = size * 1.27;
  const inner = PW - PAD * 2;
  const lines = balancedWrap(p.title, inner / SLACK, size);
  const ids = wrapMono(p.id, inner / ID_SLACK, 15);
  const eyeY = 34;
  const rule1 = eyeY + 15;
  const t0 = rule1 + 31;
  const tN = t0 + (lines.length - 1) * lh;
  const rule2 = tN + 23;
  const i0 = rule2 + 25;
  const iN = i0 + (ids.length - 1) * 20;
  return { size, lh, lines, ids, eyeY, rule1, t0, rule2, i0, ph: iN + 22 };
}

// ---- one boulder -------------------------------------------------------------------
function boulder(s, i, p) {
  const lay = plaqueLayout(p);
  const plaqueBot = PLQ_BOT;
  const plaqueTop = plaqueBot + lay.ph;
  const rand = rng(s.seed);
  const clampX = ([x, y]) => [Math.max(-192, Math.min(192, x)), y];
  const poly = s.pts(plaqueTop).map(clampX);
  const top = Math.max(...poly.map((q) => q[1]));
  // the plaque must sit inside the rock (rounded corners included) with a margin on every
  // side; fail loudly if a redraw breaks that
  {
    const hit = roundedPts(poly, 22);
    const mx = 16;
    const my = 22;
    const xs = [-PW / 2 - mx, -PW / 4, 0, PW / 4, PW / 2 + mx];
    const probes = [];
    for (const x of xs) probes.push([x, plaqueTop + my], [x, plaqueBot - 6]);
    for (let y = plaqueBot; y <= plaqueTop; y += 20) probes.push([-PW / 2 - mx, y], [PW / 2 + mx, y]);
    for (const [x, y] of probes) {
      if (!inside(hit, [x, y])) throw new Error(`plaque ${i} leaves the boulder at ${r1(x)},${r1(y)}`);
    }
  }
  const P = poly.map((q) => abs(s, q));
  const d = roundedPoly(P, 22);
  const cx = s.cx;
  const topY = BASE - top;
  const lampX = cx - 130;
  const L = [0.58, 0.81];

  // low-poly facets lit from the moon (upper right); the plaque covers the middle
  const ctr = [cx + 6, BASE - top * 0.5];
  let facets = '';
  for (let k = 0; k < poly.length; k++) {
    const a = poly[k];
    const b = poly[(k + 1) % poly.length];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    const lit = (-dy / len) * L[0] + (dx / len) * L[1];
    const A = abs(s, a);
    const B = abs(s, b);
    const fill = lit > 0 ? '#9db6ff' : '#02040e';
    const op = lit > 0 ? 0.02 + lit * 0.1 : 0.08 + -lit * 0.4;
    facets += `<path d="M${r1(A[0])} ${r1(A[1])}L${r1(B[0])} ${r1(B[1])}L${r1(ctr[0])} ${r1(ctr[1])}Z" fill="${fill}" opacity="${r1(op * 100) / 100}"/>`;
  }

  // speckle and lichen
  let sp = '';
  for (let k = 0; k < 16; k++) {
    const x = cx - 180 + rand() * 360;
    const y = topY + rand() * top;
    sp += `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(0.6 + rand() * 1)}" fill="${rand() < 0.5 ? '#02040e' : '#aebfee'}" opacity="${r1(0.14 + rand() * 0.2)}"/>`;
  }
  let lichen = '';
  for (let k = 0; k < 4; k++) {
    const x = cx + (rand() - 0.5) * 340;
    const y = topY + 10 + rand() * top * 0.8;
    lichen += `<ellipse cx="${r1(x)}" cy="${r1(y)}" rx="${r1(5 + rand() * 9)}" ry="${r1(2.6 + rand() * 3)}" fill="#7d9684" opacity="${r1(0.12 + rand() * 0.1)}"/>`;
  }
  // cracks on the flanks, clear of the plaque
  let cracks = '';
  for (const side of [-1, 1]) {
    let x = cx + side * (161 + rand() * 10);
    let y = BASE - (50 + rand() * 90);
    let dd = `M${r1(x)} ${r1(y)}`;
    for (let k = 0; k < 5; k++) {
      x += (rand() - 0.5) * 10 - side * 1.5;
      y -= 12 + rand() * 12;
      dd += `l${r1((rand() - 0.5) * 8)} ${r1(-12 - rand() * 12)}`;
    }
    cracks += `<path d="${dd}" fill="none" stroke="#02040e" stroke-opacity=".55" stroke-width="1.3" stroke-linejoin="round"/><path d="${dd}" transform="translate(1.4 .6)" fill="none" stroke="#a9bdf0" stroke-opacity=".14" stroke-width="1"/>`;
  }
  // a crack across the crown, above the plaque
  {
    let x = cx + (rand() - 0.5) * 60;
    let y = BASE - top + 20;
    let dd = `M${r1(x)} ${r1(y)}`;
    for (let k = 0; k < 3; k++) dd += `l${r1((rand() - 0.5) * 16)} ${r1(8 + rand() * 7)}`;
    cracks += `<path d="${dd}" fill="none" stroke="#02040e" stroke-opacity=".5" stroke-width="1.3" stroke-linejoin="round"/>`;
  }

  // moss: small, desaturated caps on the upward faces of the crown, with short drips
  let moss = '';
  const capEdges = [];
  for (let k = 0; k < poly.length; k++) {
    const a = poly[k];
    const b = poly[(k + 1) % poly.length];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    if (dx > 0 && dy / len > -0.2 && a[1] > top - 70 && b[1] > top - 70 && Math.abs(dx) > 12) capEdges.push([a, b]);
  }
  let capD = '';
  for (const [a, b] of capEdges) {
    const A = abs(s, [a[0], a[1] - 5]);
    const B = abs(s, [b[0], b[1] - 5]);
    capD += `M${r1(A[0])} ${r1(A[1])}L${r1(B[0])} ${r1(B[1])}`;
  }
  moss += `<path d="${capD}" fill="none" stroke="#4d6853" stroke-opacity=".7" stroke-width="13" stroke-linecap="round" stroke-dasharray="${i % 2 ? '38 14 22 18 56 12' : '26 16 48 12 30 20'}"/>`;
  moss += `<path d="${capD}" transform="translate(0 -3)" fill="none" stroke="#7d9b82" stroke-opacity=".34" stroke-width="5" stroke-linecap="round" stroke-dasharray="${i % 2 ? '16 30 24 28' : '22 26 14 34'}"/>`;
  for (let k = 0; k < 7; k++) {
    const e = capEdges[Math.floor(rand() * capEdges.length)];
    if (!e) break;
    const t = 0.15 + rand() * 0.7;
    const x = e[0][0] + (e[1][0] - e[0][0]) * t;
    const y = e[0][1] + (e[1][1] - e[0][1]) * t - 5;
    const room = y - (plaqueTop + 16);
    if (room < 10) continue;
    const A = abs(s, [x, y]);
    moss += `<path d="M${r1(A[0])} ${r1(A[1])}q${r1((rand() - 0.5) * 4)} ${r1(5 + rand() * 5)} ${r1((rand() - 0.5) * 3)} ${r1(Math.min(room, 10 + rand() * 18))}" fill="none" stroke="#4d6853" stroke-opacity="${r1(0.5 + rand() * 0.2)}" stroke-width="${r1(2.6 + rand() * 1.8)}" stroke-linecap="round"/>`;
  }
  // a little moss at the waterline
  for (let k = 0; k < 3; k++) {
    moss += `<ellipse cx="${r1(cx - 150 + rand() * 300)}" cy="${r1(BASE - 5 - rand() * 12)}" rx="${r1(16 + rand() * 20)}" ry="${r1(4 + rand() * 4)}" fill="#33503f" opacity="${r1(0.3 + rand() * 0.15)}"/>`;
  }

  // grass tufts on the crown, sage not bright green
  let tufts = '';
  const crownV = poly.map((q, k) => k).filter((k) => poly[k][1] > top - 30);
  const picks = [crownV[0], crownV[crownV.length - 1]];
  picks.forEach((idx, n) => {
    const [px, py] = abs(s, poly[idx]);
    let blades = '';
    for (let k = 0; k < 5; k++) {
      const a = (k - 2) * 0.42 + (rand() - 0.5) * 0.2;
      const len = 11 + rand() * 9;
      blades += `M${r1(px + (k - 2) * 1.8)} ${r1(py + 4)}Q${r1(px + (k - 2) * 1.8 + Math.sin(a) * len * 0.35)} ${r1(py - len * 0.6)} ${r1(px + Math.sin(a) * len)} ${r1(py - Math.cos(a) * len)}`;
    }
    tufts += `<path class="ob sway" style="animation-duration:${r1(6 + rand() * 4)}s;animation-delay:-${r1(rand() * 5)}s" d="${blades}" fill="none" stroke="${n % 2 ? '#6d8a72' : '#587363'}" stroke-width="1.8" stroke-linecap="round"/>`;
  });

  const warmDur = r1(3.2 + i * 0.5);
  const bx = cx - 200;
  const bw = 400;
  // bedding lines of the slate, on the crown and the shoulders (the plaque covers the middle)
  let strata = '';
  for (let k = 0; k < 4; k++) {
    const y = BASE - plaqueTop - 18 - k * (top - plaqueTop) / 4.5;
    const x0 = cx - 200 + rand() * 40;
    strata += `<path d="M${r1(x0)} ${r1(y)}q${r1(120 + rand() * 40)} ${r1(-9 - rand() * 8)} ${r1(220 + rand() * 120)} ${r1(rand() * 10 - 5)}" fill="none" stroke="#02040e" stroke-opacity=".42" stroke-width="1.4"/><path d="M${r1(x0)} ${r1(y + 2)}q${r1(120 + rand() * 40)} ${r1(-9 - rand() * 8)} ${r1(220 + rand() * 120)} ${r1(rand() * 10 - 5)}" fill="none" stroke="#9db6ff" stroke-opacity=".09" stroke-width="1"/>`;
  }
  const face = `<clipPath id="bc${i}"><path d="${d}"/></clipPath>
<linearGradient id="bf${i}" gradientUnits="userSpaceOnUse" x1="${cx + 170}" y1="${topY}" x2="${cx - 150}" y2="${BASE}"><stop offset="0" stop-color="#202f62"/><stop offset=".45" stop-color="#1b2850"/><stop offset="1" stop-color="#0f1936"/></linearGradient>
<linearGradient id="br${i}" gradientUnits="userSpaceOnUse" x1="${cx + 200}" y1="${topY - 10}" x2="${cx - 40}" y2="${topY + 190}"><stop offset="0" stop-color="#eef4ff" stop-opacity=".95"/><stop offset=".3" stop-color="#bcd0ff" stop-opacity=".55"/><stop offset=".75" stop-color="#9db6ff" stop-opacity="0"/></linearGradient>
<linearGradient id="bw${i}" gradientUnits="userSpaceOnUse" x1="${cx - 200}" y1="${BASE}" x2="${cx - 90}" y2="${BASE - 190}"><stop offset="0" stop-color="#ffc27a" stop-opacity=".6"/><stop offset=".5" stop-color="#ff9a3d" stop-opacity=".2"/><stop offset="1" stop-color="#ff9a3d" stop-opacity="0"/></linearGradient>
<radialGradient id="bm${i}" gradientUnits="userSpaceOnUse" cx="${cx + 150}" cy="${topY + 24}" r="230"><stop offset="0" stop-color="#9db6ff" stop-opacity=".1"/><stop offset="1" stop-color="#9db6ff" stop-opacity="0"/></radialGradient>
<g clip-path="url(#bc${i})">
<rect x="${bx}" y="${topY - 14}" width="${bw}" height="${top + 30}" fill="url(#bf${i})"/>
${facets}
<rect x="${bx}" y="${topY - 14}" width="${bw}" height="${top + 30}" fill="url(#bm${i})"/>
${strata}${sp}${lichen}${cracks}${moss}
<ellipse cx="${lampX + 6}" cy="${BASE - 10}" rx="190" ry="150" fill="url(#wl)" opacity=".85" class="flick" style="animation-duration:${warmDur}s;animation-delay:-${i}s"/>
<rect x="${bx}" y="${BASE - 34}" width="${bw}" height="40" fill="url(#wetG)"/>
<path d="${d}" fill="none" stroke="url(#br${i})" stroke-opacity=".18" stroke-width="22"/>
<path d="${d}" fill="none" stroke="url(#br${i})" stroke-width="6"/>
<path d="${d}" fill="none" stroke="url(#bw${i})" stroke-width="7"/>
</g>`;

  // the stone behind: hazier and bluer, shaded where the front rock stands against it
  let rearSvg = '';
  if (s.rear) {
    const rp = s.rear(plaqueTop).map(clampX).map((q) => abs(s, q));
    const rd = roundedPoly(rp, 20);
    const rTop = Math.min(...rp.map((q) => q[1]));
    const rRight = Math.max(...rp.map((q) => q[0]));
    let rf = '';
    for (let k = 0; k < rp.length; k++) {
      const a = rp[k];
      const b = rp[(k + 1) % rp.length];
      const lit = ((b[1] - a[1]) / (Math.hypot(b[0] - a[0], b[1] - a[1]) || 1)) * L[0] + ((b[0] - a[0]) / (Math.hypot(b[0] - a[0], b[1] - a[1]) || 1)) * L[1];
      rf += `<path d="M${r1(a[0])} ${r1(a[1])}L${r1(b[0])} ${r1(b[1])}L${r1(cx + 60)} ${r1(rTop + 130)}Z" fill="${lit > 0 ? '#9db6ff' : '#02040e'}" opacity="${r1(lit > 0 ? 0.04 + lit * 0.2 : 0.08 + -lit * 0.3)}"/>`;
    }
    rearSvg = `<linearGradient id="rrg${i}" x1="1" y1="0" x2=".15" y2=".9"><stop offset="0" stop-color="#eef4ff" stop-opacity=".85"/><stop offset=".35" stop-color="#9db6ff" stop-opacity=".3"/><stop offset=".7" stop-color="#9db6ff" stop-opacity="0"/></linearGradient><clipPath id="rc${i}"><path d="${rd}"/></clipPath><g clip-path="url(#rc${i})"><rect x="${cx - 210}" y="${r1(rTop - 10)}" width="420" height="${r1(BASE - rTop)}" fill="#18234b"/>${rf}<path d="${d}" fill="none" stroke="#02040e" stroke-opacity=".34" stroke-width="30"/><path d="${rd}" fill="none" stroke="url(#rrg${i})" stroke-width="6"/></g>`;
  }

  // low stones at the foot, drawn behind the boulder
  let stones = '';
  (s.stones || []).forEach((st, k) => {
    const sp0 = st.map((q) => abs(s, q));
    const sd = roundedPoly(sp0, 14);
    const sx = sp0.reduce((a, q) => a + q[0], 0) / sp0.length;
    const sTop = Math.min(...sp0.map((q) => q[1]));
    stones += `<clipPath id="sc${i}${k}"><path d="${sd}"/></clipPath><g clip-path="url(#sc${i}${k})"><path d="${sd}" fill="#16224a"/><path d="M${r1(sx - 80)} ${r1(sTop)}H${r1(sx + 80)}V${BASE + 4}H${r1(sx - 80)}Z" fill="url(#bm${i})" opacity=".7"/><rect x="${r1(sx - 80)}" y="${BASE - 14}" width="160" height="20" fill="url(#wetG)"/><path d="${sd}" fill="none" stroke="#c4d6ff" stroke-opacity=".5" stroke-width="3"/><ellipse cx="${r1(sx - 6)}" cy="${r1(sTop + 4)}" rx="14" ry="3" fill="#587363" opacity=".6"/></g>`;
  });

  // the plaque, set into the face
  const px0 = cx - PW / 2;
  const py0 = BASE - plaqueTop;
  const pw = PW;
  const ph = lay.ph;
  // a recess cut into the slate: dark lip all round, lit lower edge, then the dark face
  let pq = `<rect x="${px0 - 6}" y="${r1(py0 - 6)}" width="${pw + 12}" height="${r1(ph + 12)}" rx="17" fill="#050a1c" opacity=".8"/>`;
  pq += `<path d="M${px0 + 14} ${r1(py0 + ph + 6.6)}H${px0 + pw - 14}" stroke="#a9c0ff" stroke-opacity=".34" stroke-width="1.6" stroke-linecap="round"/>`;
  pq += `<path d="M${px0 - 3} ${r1(py0 + 22)}V${r1(py0 + 16)}Q${px0 - 3} ${r1(py0 - 3)} ${px0 + 16} ${r1(py0 - 3)}H${px0 + pw - 16}" fill="none" stroke="#000" stroke-opacity=".6" stroke-width="3"/>`;
  pq += `<rect x="${px0}" y="${r1(py0)}" width="${pw}" height="${r1(ph)}" rx="12" fill="url(#plq)" stroke="#34457f" stroke-opacity=".85" stroke-width="1.4"/>`;
  pq += `<rect x="${px0 + 6}" y="${r1(py0 + 6)}" width="${pw - 12}" height="${r1(ph - 12)}" rx="11" fill="none" stroke="#2c3d74" stroke-opacity=".7" stroke-width="1"/>`;
  pq += `<rect x="${px0 + 1.5}" y="${r1(py0 + 1.5)}" width="${pw - 3}" height="18" rx="14" fill="url(#plqTop)"/>`;
  // faint grain so the plaque reads as cut stone, not glass
  for (let k = 0; k < 26; k++) pq += `<circle cx="${r1(px0 + 14 + rand() * (pw - 28))}" cy="${r1(py0 + 12 + rand() * (ph - 24))}" r="${r1(0.5 + rand() * 0.8)}" fill="#9db6ff" opacity="${r1(0.05 + rand() * 0.07)}"/>`;
  const tx = cx;
  // venue: amber-light eyebrow
  const venue = p.venue.toUpperCase();
  const vw = capsW(venue, 15, 2.4);
  pq += `<text x="${tx}" y="${r1(py0 + lay.eyeY)}" font-family="${SANS}" font-size="15" font-weight="600" letter-spacing="2.4" fill="#ffd9a3" text-anchor="middle" textLength="${r1(vw)}" lengthAdjust="spacingAndGlyphs">${esc(venue)}</text>`;
  const orn = (y, col, o) => `<path d="M${tx - 62} ${r1(y)}H${tx - 10}M${tx + 10} ${r1(y)}H${tx + 62}" stroke="${col}" stroke-opacity="${o}" stroke-width="1" fill="none"/><path d="M${tx} ${r1(y - 3.6)}l3.6 3.6l-3.6 3.6l-3.6 -3.6Z" fill="${col}" fill-opacity="${Math.min(1, o + 0.25)}"/>`;
  pq += orn(py0 + lay.rule1, '#ffd9a3', 0.5);
  // title: cream serif, each line pinned to its measured width
  lay.lines.forEach((ln, k) => {
    const y = r1(py0 + lay.t0 + k * lay.lh);
    const w = r1(serifW(ln, lay.size));
    pq += `<text x="${tx}" y="${r1(+y + 1.3)}" font-family="${SERIF}" font-size="${lay.size}" font-weight="500" fill="#02040e" opacity=".6" text-anchor="middle" textLength="${w}" lengthAdjust="spacingAndGlyphs">${esc(ln)}</text>`;
    pq += `<text x="${tx}" y="${y}" font-family="${SERIF}" font-size="${lay.size}" font-weight="500" fill="${C.cream}" text-anchor="middle" textLength="${w}" lengthAdjust="spacingAndGlyphs">${esc(ln)}</text>`;
  });
  pq += orn(py0 + lay.rule2, '#b7c9f2', 0.4);
  // id: mono 15 in a pale blue-white
  lay.ids.forEach((ln, k) => {
    const y = r1(py0 + lay.i0 + k * 20);
    pq += `<text x="${tx}" y="${y}" font-family="${MONO}" font-size="15" fill="#cdd8f4" text-anchor="middle" textLength="${r1(ln.length * 15 * MONO_W)}" lengthAdjust="spacingAndGlyphs">${esc(ln)}</text>`;
  });

  return { d, face, rear: rearSvg, stones, tufts, lampX, pq, lay, topY, top, plaqueTop };
}

// ---- iron and glass lamp on a slate stepping stone ----------------------------------
function lamp(x, y, k) {
  const dur = r1(3 + k * 0.6);
  return `<g transform="translate(${x} ${y})">
<ellipse cx="0" cy="16" rx="34" ry="9" fill="url(#lg)" opacity=".8" class="o flick" style="animation-duration:${dur}s;animation-delay:-${k}s"/>
<ellipse cx="0" cy="24" rx="9" ry="22" fill="url(#refl)" class="o shim" style="animation-duration:${r1(2.6 + k * 0.5)}s;animation-delay:-${k * 0.7}s"/>
<ellipse cx="0" cy="3" rx="27" ry="7" fill="#040815"/>
<ellipse cx="0" cy="1.2" rx="25" ry="5.8" fill="#1c2850"/>
<ellipse cx="0" cy="0" rx="21" ry="4.1" fill="#3d528c" opacity=".7"/>
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
  const p = panel({ w: W, h: H, id: 'pn', seed: 105 });
  let defs = p.defs;
  defs += `
<linearGradient id="fallsG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3f8ff" stop-opacity=".92"/><stop offset="1" stop-color="#bcd2ff" stop-opacity=".55"/></linearGradient>
<linearGradient id="glowcol" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b8ccff" stop-opacity=".5"/><stop offset="1" stop-color="#b8ccff" stop-opacity="0"/></linearGradient>
<radialGradient id="mistg" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#cfe0ff" stop-opacity=".55"/><stop offset="1" stop-color="#cfe0ff" stop-opacity="0"/></radialGradient>
<linearGradient id="butteG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0d1838"/><stop offset=".55" stop-color="#15245a"/><stop offset="1" stop-color="#243a78"/></linearGradient>
<linearGradient id="wetG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#03070f" stop-opacity="0"/><stop offset="1" stop-color="#03070f" stop-opacity=".72"/></linearGradient>
<linearGradient id="haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5f74a8" stop-opacity="0"/><stop offset="1" stop-color="#5f74a8" stop-opacity=".4"/></linearGradient>
<linearGradient id="watg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a4d7d"/><stop offset=".2" stop-color="#1c2f5a"/><stop offset="1" stop-color="#08132b"/></linearGradient>
<linearGradient id="reflS" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#4a64a8" stop-opacity=".42"/><stop offset=".2" stop-color="#2a3d78" stop-opacity=".14"/><stop offset=".36" stop-color="#2a3d78" stop-opacity="0"/></linearGradient>
<radialGradient id="wl" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffb060" stop-opacity=".46"/><stop offset=".45" stop-color="#ff8a30" stop-opacity=".16"/><stop offset="1" stop-color="#ff8a30" stop-opacity="0"/></radialGradient>
<linearGradient id="plq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1331"/><stop offset="1" stop-color="#0e183a"/></linearGradient>
<linearGradient id="plqTop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#02040e" stop-opacity=".6"/><stop offset="1" stop-color="#02040e" stop-opacity="0"/></linearGradient>
<linearGradient id="lip" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c1b3c" stop-opacity=".92"/><stop offset=".6" stop-color="#0a1731" stop-opacity=".7"/><stop offset="1" stop-color="#0a1731" stop-opacity="0"/></linearGradient>
<linearGradient id="lampg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe6b0" stop-opacity=".9"/><stop offset="1" stop-color="#ff9a3d" stop-opacity=".75"/></linearGradient>
`;

  let body = '';
  // ---- sky glow, moon (upper right)
  body += `<ellipse cx="640" cy="${HZ}" rx="580" ry="170" fill="#4d5f8f" opacity=".16"/>`;
  body += moon(1118, 96, 30);

  // ---- far ridge and far forest
  body += `<path d="M0 ${HZ + 4}V${HZ - 42}Q90 ${HZ - 68} 180 ${HZ - 50}T360 ${HZ - 60}T560 ${HZ - 44}T760 ${HZ - 64}T960 ${HZ - 46}T1160 ${HZ - 68}T1280 ${HZ - 52}V${HZ + 4}Z" fill="#101d42"/>`;
  body += `<g class="dS"><path d="${forestPath({ x0: -40, x1: 1320, by: HZ - 1, hMin: 34, hMax: 84, gap: 30, seed: 3, oakShare: 0.25 })}" fill="#0e1a3c"/></g>`;
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
  body += `<ellipse cx="640" cy="${HZ - 130}" rx="76" ry="128" fill="url(#mistg)" opacity=".34"/>`;
  body += `<path d="M622 132L658 132L684 ${HZ}L596 ${HZ}Z" fill="url(#fallsG)"/>`;
  body += `<rect x="620" y="130" width="40" height="3.4" rx="1.7" fill="#ffffff" opacity=".7"/>`;
  for (let i = 0; i < 11; i++) {
    const x = 624.5 + i * 3.1 + (rand() - 0.5) * 1.2;
    const wdt = 1.4 + rand() * 2.2;
    body += `<path class="fall" d="M${r1(x)} 133L${r1(x + (x - 640) * 1.1)} ${HZ - 1}" stroke="#ffffff" stroke-opacity="${r1(0.4 + rand() * 0.4)}" stroke-width="${r1(wdt)}" stroke-dasharray="${i % 2 ? '14 22' : '16 56'}" style="animation-duration:${r1(0.9 + rand() * 0.8)}s;animation-delay:-${r1(rand() * 2)}s" fill="none"/>`;
  }
  // mist: a low band along the far shore, a veil that rises behind the centre boulder
  body += `<ellipse cx="640" cy="${HZ - 3}" rx="280" ry="18" fill="url(#mistg)" opacity=".55" class="mist" style="animation-duration:15s"/>`;
  body += `<ellipse cx="640" cy="${HZ - 90}" rx="120" ry="24" fill="url(#mistg)" opacity=".7" class="mist" style="animation-duration:19s"/>`;
  for (let i = 0; i < 4; i++) {
    body += `<ellipse cx="${r1(596 + i * 25 + rand() * 8)}" cy="${r1(HZ - 96 + rand() * 8)}" rx="${r1(30 + rand() * 22)}" ry="${r1(8 + rand() * 5)}" fill="url(#mistg)" class="o rise" style="animation-duration:${r1(4.5 + rand() * 3)}s;animation-delay:-${r1(rand() * 6)}s"/>`;
  }

  // ---- mid forest, either side of the butte
  const midL = forestPath({ x0: -60, x1: 600, by: HZ + 4, hMin: 60, hMax: 126, gap: 42, seed: 8, oakShare: 0.35 });
  const midR = forestPath({ x0: 740, x1: 1340, by: HZ + 4, hMin: 80, hMax: 214, gap: 40, seed: 9, oakShare: 0.12 });
  body += `<g class="dM"><path d="${midL}" fill="#070f26"/><path d="${midR}" fill="#070f26"/></g>`;

  // ---- the lagoon
  body += `<rect y="${HZ + 4}" width="${W}" height="${H - HZ - 4}" fill="url(#watg)"/>`;
  body += `<path d="M0 ${HZ + 4}H${W}" stroke="#6f86c4" stroke-opacity=".3" stroke-width="1.2"/>`;
  // moon glints where the water shows (between the boulders and in front of them)
  const glints = [[428, HZ + 40], [430, HZ + 130], [852, HZ + 36], [856, HZ + 150], [1130, BASE + 30], [1000, BASE + 50], [330, BASE + 52], [760, BASE + 54], [900, BASE + 34]];
  glints.forEach(([x, y], k) => {
    body += `<ellipse cx="${x}" cy="${y}" rx="${r1(11 + (k % 4) * 4)}" ry="2" fill="#d6e4ff" opacity="${r1(0.5 - (k % 4) * 0.06)}" class="o shim" style="animation-duration:${r1(2.4 + rand() * 2.4)}s;animation-delay:-${r1(rand() * 3)}s"/>`;
  });
  body += `<path d="M618 ${HZ + 6}L662 ${HZ + 6}L700 ${H}H580Z" fill="url(#glowcol)" opacity=".34" class="o shim" style="animation-duration:6s"/>`;
  for (let k = 0; k < 18; k++) {
    const x = 20 + rand() * 1240;
    const y = HZ + 22 + rand() * 290;
    body += `<path d="M${r1(x)} ${r1(y)}h${r1(10 + rand() * 24)}" stroke="#8aa5e8" stroke-opacity="${r1(0.14 + rand() * 0.14)}" stroke-width="1.2" stroke-linecap="round"/>`;
  }
  body += `<ellipse cx="300" cy="${HZ + 60}" rx="360" ry="20" fill="url(#mistg)" opacity=".3" class="mist" style="animation-duration:21s"/>`;
  body += `<ellipse cx="980" cy="${HZ + 110}" rx="380" ry="22" fill="url(#mistg)" opacity=".26" class="mist" style="animation-duration:25s;animation-delay:-9s"/>`;

  // ---- two floating paper lanterns on the water in the gaps between the boulders
  [[428, BASE - 120, 3], [852, BASE - 110, 6]].forEach(([x, y, sd], gi) => {
    body += `<g transform="translate(${x} ${y}) scale(.5)"><g class="bob" style="animation-duration:${r1(4 + gi)}s">${lantern({ glow: 1.2, refl: true, seed: sd })}</g></g>`;
    body += `<ellipse cx="${x}" cy="${y + 15}" rx="22" ry="3.4" fill="none" stroke="#c7d6ff" stroke-opacity=".5" stroke-width="1.2" class="o ripple" style="animation-duration:${r1(3.6 + gi * 0.7)}s;animation-delay:-${gi}s"/>`;
  });

  // ---- far fireflies (behind the boulders)
  const ffA = [[60, 262, 0.8], [330, 236, 0.8], [540, 330, 0.9], [770, 250, 0.8], [1190, 240, 0.8], [428, 470, 1.0], [852, 450, 1.0]];
  ffA.forEach(([x, y, sc], i) => {
    const f = fireflies({ n: 1, box: [x, y, x, y], seed: 31 + i * 7, scale: sc, prefix: `fa${i}_` });
    css += f.css;
    body += f.body;
  });

  // ---- tall pines framing the edges, banks
  const tall = (x, by, h, w, sd) => pinePath(x, by, h, w, rng(sd));
  body += `<path d="${tall(10, 580, 400, 128, 5)}${tall(1268, 580, 430, 136, 6)}${tall(1188, 560, 320, 108, 7)}" fill="#040918"/>`;
  body += `<path d="M0 ${H - 200}Q30 ${H - 170} 46 ${H - 120}Q58 ${H - 80} 36 ${H}H0ZM${W} ${H - 206}Q${W - 30} ${H - 174} ${W - 44} ${H - 124}Q${W - 58} ${H - 80} ${W - 34} ${H}H${W}Z" fill="#03060f"/>`;

  // ---- the three boulders
  const arts = BOULDERS.map((s, i) => boulder(s, i, PUBS[i]));
  BOULDERS.forEach((s, i) => {
    const a = arts[i];
    // shadow on the water, mirrored boulder fading downward, wobbling water lines
    body += `<ellipse cx="${s.cx}" cy="${BASE + 5}" rx="${186}" ry="10" fill="#02050e" opacity=".55"/>`;
    body += `<path d="${a.d}" transform="translate(0 ${2 * BASE}) scale(1 -1)" fill="url(#reflS)"/>`;
    for (let k = 0; k < 4; k++) {
      body += `<path d="M${s.cx - 180} ${BASE + 9 + k * 11}h360" stroke="#0b1a38" stroke-opacity=".55" stroke-width="${r1(1.6 + k * 0.5)}" stroke-dasharray="${40 + k * 14} 16"/>`;
    }
    body += a.rear;
    body += a.stones;
    body += a.face;
    body += a.tufts;
    body += a.pq;
    // the lagoon laps over the foot of the rock
    {
      const x0 = s.cx - 232;
      const wv = (k) => r1(BASE + 1 + Math.sin(k * 1.7 + i) * 2);
      let lipd = `M${x0} ${BASE + 3}`;
      for (let k = 0; k < 9; k++) lipd += `Q${r1(x0 + k * 58 + 29)} ${wv(k) - 4} ${x0 + (k + 1) * 58} ${wv(k + 1)}`;
      body += `<path d="${lipd}V${BASE + 18}H${x0}Z" fill="url(#lip)"/><path d="${lipd}" fill="none" stroke="#a9c0ff" stroke-opacity=".3" stroke-width="1.2"/>`;
    }
    // pebbles at the foot, then rings spreading from it
    const r2 = rng(s.seed + 9);
    for (let k = 0; k < 6; k++) {
      const side = k % 2 ? 1 : -1;
      const x = s.cx + side * (150 + r2() * 56);
      const y = BASE + 6 + r2() * 12;
      const rx = 7 + r2() * 11;
      body += `<ellipse cx="${r1(x)}" cy="${r1(y)}" rx="${r1(rx)}" ry="${r1(rx * 0.5)}" fill="#0f1a3c"/><path d="M${r1(x - rx * 0.6)} ${r1(y - rx * 0.3)}Q${r1(x)} ${r1(y - rx * 0.62)} ${r1(x + rx * 0.7)} ${r1(y - rx * 0.2)}" fill="none" stroke="#a9c0ff" stroke-opacity=".28" stroke-width="1.2" stroke-linecap="round"/>`;
    }
    for (let k = 0; k < 2; k++) {
      body += `<ellipse cx="${s.cx}" cy="${BASE + 3}" rx="170" ry="8" fill="none" stroke="#9db8ff" stroke-opacity=".34" stroke-width="1.2" class="o ripple" style="animation-duration:${r1(4.4 + i * 0.4)}s;animation-delay:-${r1(k * 2.2 + i * 0.9 + 0.7)}s"/>`;
    }
    body += lamp(a.lampX, BASE + 30, i);
  });

  // ---- near fireflies, ferns
  const ffB = [[336, 708, 1.5], [560, 700, 1.4], [980, 706, 1.4]];
  ffB.forEach(([x, y, sc], i) => {
    const f = fireflies({ n: 1, box: [x, y, x, y], seed: 91 + i * 5, scale: sc, prefix: `fb${i}_` });
    css += f.css;
    body += f.body;
  });
  body += fern(-8, H + 12, 100, 12, '#03060f', 1);
  body += fern(1290, H + 14, 108, -12, '#03060f', 3);

  // ---- heading
  const head = heading({ eyebrow: '05 / PUBLICATIONS', title: 'Published work', sub: 'Research that rests like river stones.' });

  const descText = PUBS.map((q) => `${q.venue}: ${q.title}. ${q.id}.`).join(' ');
  return doc({
    w: W,
    h: H,
    title: 'Published work, 05 Publications',
    desc: `05 / PUBLICATIONS. Published work. Research that rests like river stones beside the falls. A moonlit lagoon below a small waterfall and three dark slate river boulders, each with an engraved plaque naming one publication, rimmed by moonlight on the top right and lit by a small glass lamp at the lower left. ${descText}`,
    defs,
    css,
    body: p.open + body + p.close + head,
  });
}

export default function build() {
  return { 'publications.svg': publications() };
}
