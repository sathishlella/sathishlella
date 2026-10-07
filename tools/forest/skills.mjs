// skills.svg: the technical-skills panel. Three columns of glass pill chips (each
// with an ember dot on its own beat), a moonlight sweep that visits each column
// in turn, a garland of hanging lanterns, then the education signpost.
import { C, SERIF, SANS, GLYPH, rng, r1, esc, doc, moon, pinePath, lantern, fireflies, fern, heading, wrap, panel } from './lib.mjs';
import { SKILLS, EDU } from './content.mjs';

const W = 1280;
const COL_X = [64, 456, 848];
const COL_W = 368;
const CHIP_H = 34;
const CHIP_GAP = 10;
const ROW_PITCH = CHIP_H + CHIP_GAP;
// Chip width from real glyph metrics (Arial / Helvetica advance widths per 1000 em)
// instead of a flat per-character guess, so capital-heavy labels such as MCP or
// GraphRAG get the room they need. Padding is 10 percent over Arial to cover SF Pro,
// Segoe UI and the like; left 26 holds the ember dot, right 12 is the end cap.
const ADV = {
  ' ': 278, '!': 278, '"': 355, '#': 556, $: 556, '%': 889, '&': 667, "'": 191, '(': 333, ')': 333, '*': 389, '+': 584, ',': 278, '-': 333, '.': 278, '/': 278, ':': 278, ';': 278, '?': 556,
  A: 667, B: 667, C: 722, D: 722, E: 667, F: 611, G: 778, H: 722, I: 278, J: 500, K: 667, L: 556, M: 833, N: 722, O: 778, P: 667, Q: 778, R: 722, S: 667, T: 611, U: 722, V: 667, W: 944, X: 667, Y: 667, Z: 611,
  a: 556, b: 556, c: 500, d: 556, e: 556, f: 278, g: 556, h: 556, i: 222, j: 222, k: 500, l: 222, m: 833, n: 556, o: 556, p: 556, q: 556, r: 333, s: 500, t: 278, u: 556, v: 500, w: 722, x: 500, y: 500, z: 500,
};
const textWidth = (s, size = 14) => ([...s].reduce((a, ch) => a + (ADV[ch] ?? 556), 0) * size) / 1000;
const chipWidth = (label) => Math.ceil(textWidth(label) * 1.1 + 8 + 38);

// Pack chips into rows. Reading order is kept except that a chip may hop ahead
// of up to three others when it fits the gap, so rows stay full.
function packRows(items) {
  const widths = items.map(chipWidth);
  const pending = items.map((_, i) => i);
  const rows = [];
  while (pending.length) {
    const row = [];
    let used = 0;
    let i = 0;
    while (i < pending.length && i < 4) {
      const idx = pending[i];
      const need = row.length ? widths[idx] + CHIP_GAP : widths[idx];
      if (used + need <= COL_W) {
        used += need;
        row.push(idx);
        pending.splice(i, 1);
      } else i++;
    }
    rows.push(row);
  }
  return rows.map((row) => {
    let x = 0;
    return row.map((idx) => {
      const c = { label: items[idx], w: widths[idx], x };
      x += widths[idx] + CHIP_GAP;
      return c;
    });
  });
}

// Wrap, then find the narrowest width that still gives the same number of lines,
// so the last line is never a lone orphan word.
function balanced(text, maxW, size, kind) {
  const n = wrap(text, maxW, size, kind).length;
  let lo = maxW * 0.4;
  let hi = maxW;
  for (let k = 0; k < 16; k++) {
    const mid = (lo + hi) / 2;
    if (wrap(text, mid, size, kind).length <= n) hi = mid;
    else lo = mid;
  }
  return wrap(text, hi, size, kind);
}

// Same idea for a list of unbreakable units (comma-separated items).
function packUnits(units, maxChars) {
  const lines = [];
  let cur = '';
  for (const u of units) {
    if (cur && (cur + ' ' + u).length > maxChars) {
      lines.push(cur);
      cur = u;
    } else cur = cur ? cur + ' ' + u : u;
  }
  if (cur) lines.push(cur);
  return lines;
}
function balancedUnits(units, maxChars) {
  const n = packUnits(units, maxChars).length;
  let lo = 1;
  let hi = maxChars;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (packUnits(units, mid).length <= n) hi = mid;
    else lo = mid + 1;
  }
  return packUnits(units, hi);
}

// Meta lines: split on the "|" separators, keep each part whole, break only between parts
// (a single long part is wrapped by words).
function wrapMeta(meta, maxW, size = 14) {
  const per = size * GLYPH.sans;
  const maxChars = Math.floor(maxW / per);
  const parts = meta.split(/\s*\|\s*/);
  if (parts.length === 1) {
    // a long list: break at its semicolons first; inside a piece break only after
    // commas (so "Data Science" never splits) and balance the lines
    const segs = meta.split(/;\s*/).map((t, i, a) => (i < a.length - 1 ? t + ';' : t));
    return segs
      .flatMap((t) => {
        if (!t.includes(',')) return balanced(t, maxW, size, 'sans');
        const units = t.split(/,\s*/).map((u, i, a) => (i < a.length - 1 ? u + ',' : u));
        return balancedUnits(units, maxChars);
      })
      .map((l) => [l]);
  }
  const lines = [];
  let cur = [];
  const len = (p) => p.join(' · ').length;
  for (const p of parts) {
    if (cur.length && len([...cur, p]) > maxChars) {
      lines.push(cur);
      cur = [p];
    } else cur.push(p);
  }
  if (cur.length) lines.push(cur);
  return lines;
}
const metaTspans = (parts) => parts.map((p, i) => (i ? `<tspan fill="${C.amber}" dx="7">·</tspan><tspan dx="7">${esc(p)}</tspan>` : esc(p))).join('');

// A light three-tier pine (11 points), for the long treeline layers.
function slimPine(x, by, h, w) {
  const t = by - h;
  const p = (dx, f) => `${r1(x + dx)} ${r1(t + h * f)}`;
  return `M${p(0, 0)}L${p(w * 0.34, 0.42)}L${p(w * 0.16, 0.42)}L${p(w * 0.58, 0.72)}L${p(w * 0.28, 0.72)}L${p(w, 1)}L${p(-w, 1)}L${p(-w * 0.28, 0.72)}L${p(-w * 0.58, 0.72)}L${p(-w * 0.16, 0.42)}L${p(-w * 0.34, 0.42)}Z`;
}
function pineRow({ x0, x1, by, hMin, hMax, gap, seed }) {
  const r = rng(seed);
  let d = '';
  for (let x = x0; x < x1; x += gap * (0.55 + r() * 0.9)) {
    const h = hMin + r() * (hMax - hMin);
    d += slimPine(x, by + r() * 6, h, h * (0.22 + r() * 0.08));
  }
  return d;
}

export function skills() {
  const rand = rng(77);

  // ---- layout numbers --------------------------------------------------------
  const packed = SKILLS.map((g) => packRows(g.items));
  const maxRows = Math.max(...packed.map((r) => r.length));
  const HEAD_Y = 238;
  const chipsTop = 274;
  const chipsBottom = chipsTop + maxRows * ROW_PITCH - CHIP_GAP;

  const ropeY0 = chipsBottom + 44;
  const sag = 24;
  const ropeY = (x) => {
    const t = (x + 20) / (W + 40);
    return ropeY0 + 4 * sag * t * (1 - t);
  };
  const lanternTail = 86; // lowest lantern bottom below its rope point

  const eduTitleSize = 36;
  const eduHeadY = Math.round(ropeY0 + sag + lanternTail + 18 - eduTitleSize - 4 + 30);
  const eduBase = eduHeadY + eduTitleSize + 4;

  // signpost boards
  const POLE = 640;
  const TIP = 30;
  const boardX = { L: [64, POLE], R: [POLE, W - 64] };
  const textBox = { L: [64 + TIP + 24, POLE - 8 - 24], R: [POLE + 8 + 24, W - 64 - TIP - 24] };
  const boards = EDU.map((e, i) => {
    const side = i % 2 === 0 ? 'L' : 'R';
    const row = Math.floor(i / 2);
    const tw = textBox[side][1] - textBox[side][0];
    const tl = balanced(e.title, tw * 0.92, 22, 'serif');
    const ml = wrapMeta(e.meta, tw * 0.94);
    return { e, side, row, tl, ml, tw };
  });
  const TITLE_LH = 28;
  const META_LH = 21;
  const rowH = [0, 1].map((r) =>
    Math.max(...boards.filter((b) => b.row === r).map((b) => 22 + b.tl.length * TITLE_LH + 8 + b.ml.length * META_LH + 18)),
  );
  const ROW_GAP = 24;
  const row0 = eduBase + 40;
  const rowTop = [row0, row0 + rowH[0] + ROW_GAP];
  const boardsBottom = rowTop[1] + rowH[1];
  const H = Math.round(boardsBottom + 96);

  // ---- defs and css ----------------------------------------------------------
  const pn = panel({ w: W, h: H, id: 'sk', seed: 6, starCount: 150, tint: 0.07 });
  let defs = pn.defs;
  defs += `
<linearGradient id="chipf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#27397a" stop-opacity=".9"/><stop offset="1" stop-color="#15244f" stop-opacity=".9"/></linearGradient>
<linearGradient id="chips" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9ccff" stop-opacity=".55"/><stop offset="1" stop-color="#6f86c8" stop-opacity=".22"/></linearGradient>
<linearGradient id="swg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e6eeff" stop-opacity="0"/><stop offset=".5" stop-color="#e6eeff" stop-opacity=".34"/><stop offset="1" stop-color="#e6eeff" stop-opacity="0"/></linearGradient>
<linearGradient id="hairG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.amber}" stop-opacity=".85"/><stop offset=".55" stop-color="${C.amber}" stop-opacity=".22"/><stop offset="1" stop-color="${C.amber}" stop-opacity="0"/></linearGradient>
<linearGradient id="woodG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#43301f"/><stop offset=".5" stop-color="#34251a"/><stop offset="1" stop-color="#26190f"/></linearGradient>
<linearGradient id="poleG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#241810"/><stop offset=".4" stop-color="#4b3422"/><stop offset="1" stop-color="#1c120b"/></linearGradient>
<radialGradient id="mistg" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#9fb4e8" stop-opacity=".22"/><stop offset="1" stop-color="#9fb4e8" stop-opacity="0"/></radialGradient>`;

  let css = `
@keyframes em{0%{opacity:.4}10%{opacity:1}22%{opacity:.55}36%{opacity:.95}52%{opacity:.35}68%{opacity:1}82%{opacity:.6}100%{opacity:.4}}
.em{animation:em 3.4s ease-in-out infinite}
@keyframes swp{0%{transform:translateX(-140px);opacity:0}4%{opacity:1}21%{opacity:1}25%{transform:translateX(540px);opacity:0}100%{transform:translateX(540px);opacity:0}}
.sw{animation:swp 12s linear infinite;opacity:0}
`;

  let body = '';

  // ---- sky details -----------------------------------------------------------
  body += moon(1138, 100, 30);
  body += `<ellipse cx="1138" cy="${H - 30}" rx="560" ry="120" fill="url(#mistg)" class="mist" style="animation-duration:26s"/>`;

  // tall pines at both gutters, two depths
  const sideTrees = (xMin, xMax, seed, hMin, hMax, wk) => {
    const r = rng(seed);
    let d = '';
    for (let i = 0; i < 6; i++) {
      const h = hMin + r() * (hMax - hMin);
      d += pinePath(xMin + r() * (xMax - xMin), H + 8, h, h * (wk + r() * 0.04), r);
    }
    return d;
  };
  body += `<path d="${sideTrees(-30, 90, 31, 200, 430, 0.15)}" fill="#0b1738"/><path d="${sideTrees(1190, 1310, 32, 200, 430, 0.15)}" fill="#0b1738"/>`;
  body += `<path d="${sideTrees(-20, 60, 33, 260, 560, 0.16)}" fill="#071029"/><path d="${sideTrees(1220, 1300, 34, 260, 560, 0.16)}" fill="#071029"/>`;

  // a treeline behind the signboards: crowns show above them, trunks are hidden
  const lineBase = row0 + 34;
  body += `<path d="${pineRow({ x0: -40, x1: 1320, by: lineBase, hMin: 70, hMax: 140, gap: 28, seed: 51 })}" fill="#0a1535"/>`;
  body += `<path d="${pineRow({ x0: -40, x1: 1320, by: lineBase + 24, hMin: 46, hMax: 96, gap: 22, seed: 52 })}" fill="#060e27"/>`;
  body += `<ellipse cx="520" cy="${lineBase - 6}" rx="560" ry="34" fill="url(#mistg)" class="mist" style="animation-duration:20s"/>`;

  // fireflies behind the glass
  const ffA = fireflies({ n: 5, box: [60, 150, 1220, 540], seed: 41, scale: 1, prefix: 'fa' });
  css += ffA.css;
  body += ffA.body;

  // ---- heading ---------------------------------------------------------------
  body += heading({ eyebrow: '02 / SKILLS', title: 'Technical skills', sub: 'The everyday toolbox, grouped the way I work.' });

  // ---- the three columns -----------------------------------------------------
  let emberN = 0;
  SKILLS.forEach((g, gi) => {
    const x0 = COL_X[gi];
    const rows = packed[gi];
    let bodies = '';
    let texts = '';
    let clip = '';
    rows.forEach((row, ri) => {
      row.forEach((c) => {
        const x = x0 + c.x;
        const y = chipsTop + ri * ROW_PITCH;
        bodies += `<rect x="${x}" y="${y}" width="${c.w}" height="${CHIP_H}" rx="17" fill="url(#chipf)" stroke="url(#chips)" stroke-width="1"/><path d="M${x + 15} ${y + 1.3}H${x + c.w - 15}" stroke="#ffffff" stroke-opacity=".18" stroke-width="1" stroke-linecap="round"/>`;
        clip += `<rect x="${x}" y="${y}" width="${c.w}" height="${CHIP_H}" rx="17"/>`;
        const dur = 2.6 + rand() * 3;
        const del = rand() * 5;
        texts += `<g class="em" style="animation-duration:${dur.toFixed(1)}s;animation-delay:-${del.toFixed(1)}s"><circle cx="${x + 16}" cy="${y + 17}" r="8.5" fill="url(#lg)"/><circle cx="${x + 16}" cy="${y + 17}" r="2.5" fill="${C.amber}"/></g>`;
        texts += `<text x="${r1(x + 7 + c.w / 2)}" y="${y + 22}" text-anchor="middle" font-family="${SANS}" font-size="14" font-weight="500" fill="${C.cream}">${esc(c.label)}</text>`;
        emberN++;
      });
    });
    defs += `<clipPath id="skc${gi}">${clip}</clipPath>`;

    // header: tiny lantern, spaced amber name, hairline
    body += `<g transform="translate(${x0 + 12} ${HEAD_Y - 5}) scale(.42)">${lantern({ glow: 0.9, seed: 3 + gi * 2, flame: true })}</g>`;
    body += `<text x="${x0 + 34}" y="${HEAD_Y}" font-family="${SANS}" font-size="13" font-weight="600" letter-spacing="2.6" fill="${C.amber}">${esc(g.name.toUpperCase())}</text>`;
    body += `<rect x="${x0}" y="${HEAD_Y + 14}" width="${COL_W}" height="1.6" rx=".8" fill="url(#hairG)"/>`;

    body += bodies;
    // moonlight sweep across this group's chips, in turn: 0s, 4s, 8s of a 12s cycle
    const bx = x0 - 70;
    const y0 = chipsTop - 8;
    const y1 = chipsBottom + 8;
    body += `<g clip-path="url(#skc${gi})"><g class="sw" style="animation-delay:-${(12 - gi * 4) % 12}s"><path d="M${bx + 54} ${y0}H${bx + 144}L${bx + 90} ${y1}H${bx} Z" fill="url(#swg)"/></g></g>`;
    body += texts;
  });

  // ---- garland of hanging lanterns -------------------------------------------
  body += `<path d="M-20 ${ropeY0}Q640 ${ropeY0 + 2 * sag} 1300 ${ropeY0}" fill="none" stroke="#02040b" stroke-opacity=".5" stroke-width="3.4" transform="translate(0 2)"/>`;
  body += `<path d="M-20 ${ropeY0}Q640 ${ropeY0 + 2 * sag} 1300 ${ropeY0}" fill="none" stroke="#6a4c30" stroke-width="2.2"/>`;
  const lens = [30, 18, 38, 22, 36, 22, 38, 18, 30];
  for (let i = 0; i < 9; i++) {
    const x = 80 + i * 140;
    const s = i === 4 ? 0.94 : 0.8;
    const len = lens[i];
    const y = ropeY(x);
    const dur = 4 + ((i * 7) % 5) * 0.55;
    // swing about the rope point: the group's box is the lantern glow circle (centre
    // at len + 27s, radius 86.4s), so the pivot sits at a known percentage of it
    const cyL = len + 27 * s;
    const RL = 86.4 * s;
    const pivotY = ((RL - cyL) / (2 * RL)) * 100;
    body += `<g transform="translate(${x} ${r1(y)})"><g class="hang" style="transform-box:fill-box;transform-origin:50% ${pivotY.toFixed(2)}%;animation-duration:${dur.toFixed(1)}s;animation-delay:-${(i * 0.9).toFixed(1)}s"><path d="M0 0V${len}" stroke="#a98259" stroke-opacity=".8" stroke-width="1.3"/><g transform="translate(0 ${r1(len + 27 * s)}) scale(${s})">${lantern({ glow: 1.35, seed: i + 5, flame: true })}</g></g><circle r="2.6" fill="#8a6a46" stroke="#241810" stroke-width=".8"/></g>`;
  }
  const ffB = fireflies({ n: 3, box: [600, ropeY0 + 40, 1200, ropeY0 + 150], seed: 42, scale: 1.2, prefix: 'fb' });
  css += ffB.css;
  body += ffB.body;

  // ---- education heading -----------------------------------------------------
  body += heading({ eyebrow: '', title: 'Education and certifications', size: eduTitleSize, y: eduHeadY }).replace(/<text[^>]*><\/text>/, '');

  // ---- signpost: boards (shapes), warm light, pole, then text ----------------
  const tilts = [-0.45, 0.5, 0.4, -0.5];
  let shapes = '';
  let words = '';
  boards.forEach((b, i) => {
    const [bx0, bx1] = boardX[b.side];
    const top = rowTop[b.row];
    const h = rowH[b.row];
    const midY = top + h / 2;
    const rot = `rotate(${tilts[i]} ${POLE} ${r1(midY)})`;
    const poly =
      b.side === 'L'
        ? `M${bx0} ${r1(midY)}L${bx0 + TIP} ${top}L${bx1} ${top}L${bx1} ${top + h}L${bx0 + TIP} ${top + h}Z`
        : `M${bx0} ${top}L${bx1 - TIP} ${top}L${bx1} ${r1(midY)}L${bx1 - TIP} ${top + h}L${bx0} ${top + h}Z`;
    const edgeA = b.side === 'L' ? bx0 + TIP : bx0;
    const edgeB = b.side === 'L' ? bx1 : bx1 - TIP;
    let grain = '';
    for (let k = 0; k < 3; k++) {
      const gy = top + h * (0.24 + 0.26 * k) + rand() * 6;
      const gx0 = edgeA + 20 + rand() * 60;
      const gx1 = edgeB - 20 - rand() * 60;
      grain += `<path d="M${r1(gx0)} ${r1(gy)}Q${r1((gx0 + gx1) / 2)} ${r1(gy + (rand() - 0.5) * 7)} ${r1(gx1)} ${r1(gy + (rand() - 0.5) * 3)}" fill="none" stroke="${k % 2 ? '#a07848' : '#000'}" stroke-opacity="${k % 2 ? 0.1 : 0.2}" stroke-width="1.2"/>`;
    }
    const nailX = b.side === 'L' ? bx0 + TIP + 9 : bx1 - TIP - 9;
    shapes += `<g transform="${rot}"><path d="${poly}" fill="#02040b" opacity=".5" transform="translate(3 6)"/><path d="${poly}" fill="url(#woodG)" stroke="#6b4a2e" stroke-opacity=".85" stroke-width="1.4" stroke-linejoin="round"/>${grain}<path d="M${edgeA} ${top + 1}H${edgeB}" stroke="${C.amber}" stroke-opacity=".45" stroke-width="1.4"/><path d="M${edgeA} ${top + h - 1}H${edgeB}" stroke="#000" stroke-opacity=".35" stroke-width="1.4"/><circle cx="${nailX}" cy="${r1(midY)}" r="3" fill="#8f6c44" stroke="#1b110a" stroke-width=".9"/></g>`;

    const tx = textBox[b.side][0];
    let ty = top + 22 + 22 * 0.82;
    let t = '';
    b.tl.forEach((l, k) => {
      t += `<text x="${tx}" y="${r1(ty + k * TITLE_LH)}" font-family="${SERIF}" font-size="22" fill="${C.cream}">${esc(l)}</text>`;
    });
    const my = ty + (b.tl.length - 1) * TITLE_LH + 8 + 14 * 0.95 + 4;
    b.ml.forEach((parts, k) => {
      t += `<text x="${tx}" y="${r1(my + k * META_LH)}" font-family="${SANS}" font-size="14" fill="${C.muted}">${metaTspans(parts)}</text>`;
    });
    words += `<g transform="${rot}">${t}</g>`;
  });
  body += shapes;
  // lantern light falling on the boards
  body += `<ellipse cx="${POLE}" cy="${row0 + 30}" rx="520" ry="170" fill="url(#lg)" opacity=".34" class="o flick" style="animation-duration:5.2s"/>`;

  // the pole, in front of the board ends
  const poleTop = row0 - 22;
  body += `<g><rect x="${POLE - 8}" y="${poleTop}" width="16" height="${H - poleTop}" fill="url(#poleG)"/><path d="M${POLE - 6.5} ${poleTop + 6}V${H}" stroke="#9db8ff" stroke-opacity=".22" stroke-width="1.2"/><rect x="${POLE - 13}" y="${poleTop - 7}" width="26" height="8" rx="2.5" fill="#3a2a1c" stroke="#6b4a2e" stroke-opacity=".8"/><path d="M${POLE - 8} ${poleTop - 7}L${POLE} ${poleTop - 22}L${POLE + 8} ${poleTop - 7}Z" fill="#4a3322"/>`;
  let bolts = '';
  [0, 1].forEach((r) => {
    [18, rowH[r] - 18].forEach((dy) => {
      bolts += `<circle cx="${POLE}" cy="${rowTop[r] + dy}" r="3.4" fill="#a37d4e" stroke="#1b110a" stroke-width="1"/><path d="M${POLE - 2} ${rowTop[r] + dy + 0.5}H${POLE + 2}" stroke="#1b110a" stroke-width=".9"/>`;
    });
  });
  body += bolts + `</g>`;
  body += words;

  // ---- ground, ferns, fireflies at the margins -------------------------------
  body += `<path d="M0 ${H - 34}Q320 ${H - 64} ${POLE} ${H - 46}T${W} ${H - 40}V${H}H0Z" fill="#050a17"/><path d="M0 ${H - 34}Q320 ${H - 64} ${POLE} ${H - 46}T${W} ${H - 40}" fill="none" stroke="#2a3f7a" stroke-opacity=".35" stroke-width="1.4"/>`;
  body += fern(36, H + 6, 132, 8, '#03060f', 1);
  body += fern(1246, H + 6, 140, -10, '#03060f', 2);
  body += fern(168, H + 12, 92, -6, '#050a17', 3);
  body += fern(1118, H + 12, 96, 6, '#050a17', 4);
  body += fern(470, H + 14, 70, -4, '#04080f', 5);
  body += fern(820, H + 14, 70, 5, '#04080f', 6);
  body += `<g transform="translate(776 ${H - 58}) scale(.62)">${lantern({ glow: 1.7, seed: 9, flame: true })}</g>`;
  const ffC = fireflies({ n: 2, box: [14, H - 270, 44, H - 70], seed: 43, scale: 1.3, prefix: 'fc' });
  const ffD = fireflies({ n: 2, box: [1236, H - 270, 1266, H - 70], seed: 44, scale: 1.3, prefix: 'fd' });
  css += ffC.css + ffD.css;
  body += ffC.body + ffD.body;

  // ---- accessible description --------------------------------------------------
  const descSkills = SKILLS.map((g) => `${g.name}: ${g.items.join(', ')}.`).join(' ');
  const descEdu = EDU.map((e) => `${e.title}, ${e.meta.replace(/\s*\|\s*/g, ', ')}.`).join(' ');
  const desc = `Technical skills. The everyday toolbox, grouped the way I work. ${descSkills} Education and certifications. ${descEdu} An animated night scene of glass chips with flickering embers, hanging paper lanterns, fireflies and a wooden signpost.`;

  return doc({
    w: W,
    h: H,
    title: 'Technical skills, education and certifications',
    desc,
    defs,
    css,
    body: pn.open + body + pn.close,
  });
}

export default function build() {
  return { 'skills.svg': skills() };
}
