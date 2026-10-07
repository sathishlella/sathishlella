// skills.svg: the technical-skills panel. Three columns of glass pill chips (each
// with an ember dot on its own beat), a pale light sweep that visits each column in
// turn, a long wooden workbench ledge resting on two stone cairns with three small
// glass lamps (one per column) and a few tools, then the education signpost.
import { C, SERIF, SANS, rng, r1, esc, doc, pinePath, fireflies, fern, heading, panel } from './lib.mjs';
import { SKILLS, EDU } from './content.mjs';

const W = 1280;
const COL_X = [64, 460, 856];
const COL_W = 360;
const CHIP_H = 40;
const CHIP_GAP = 10;
const ROW_PITCH = CHIP_H + CHIP_GAP;
const CHIP_FS = 17;
const GROUP_FS = 16;

// ---- text measurement ------------------------------------------------------------
// SVG cannot measure text, so widths come from real advance tables (per 1000 em):
// Arial / Helvetica for sans, a Georgia-like serif for titles. Every label that must
// not overflow also carries textLength with lengthAdjust="spacingAndGlyphs", so a
// wider fallback font is squeezed instead of spilling out of its chip or board.
const ADV_SANS = {
  ' ': 278, ' ': 278, '!': 278, '"': 355, '#': 556, $: 556, '%': 889, '&': 667, "'": 191, '(': 333, ')': 333, '*': 389, '+': 584, ',': 278, '-': 333, '.': 278, '/': 278, ':': 278, ';': 278, '?': 556, '·': 333,
  A: 667, B: 667, C: 722, D: 722, E: 667, F: 611, G: 778, H: 722, I: 278, J: 500, K: 667, L: 556, M: 833, N: 722, O: 778, P: 667, Q: 778, R: 722, S: 667, T: 611, U: 722, V: 667, W: 944, X: 667, Y: 667, Z: 611,
  a: 556, b: 556, c: 500, d: 556, e: 556, f: 278, g: 556, h: 556, i: 222, j: 222, k: 500, l: 222, m: 833, n: 556, o: 556, p: 556, q: 556, r: 333, s: 500, t: 278, u: 556, v: 500, w: 722, x: 500, y: 500, z: 500,
};
const ADV_SERIF = {
  ' ': 241, ' ': 241, '!': 331, "'": 252, '(': 383, ')': 383, ',': 267, '-': 374, '.': 267, '/': 435, ':': 267, ';': 267, '&': 757,
  0: 613, 1: 431, 2: 546, 3: 553, 4: 590, 5: 539, 6: 565, 7: 508, 8: 603, 9: 565,
  A: 670, B: 653, C: 642, D: 745, E: 634, F: 573, G: 733, H: 818, I: 389, J: 484, K: 691, L: 595, M: 934, N: 779, O: 765, P: 600, Q: 765, R: 683, S: 561, T: 618, U: 757, V: 664, W: 1007, X: 678, Y: 623, Z: 568,
  a: 501, b: 557, c: 459, d: 576, e: 484, f: 336, g: 520, h: 592, i: 304, j: 296, k: 551, l: 292, m: 880, n: 592, o: 553, p: 566, q: 561, r: 427, s: 429, t: 336, u: 584, v: 492, w: 764, x: 507, y: 484, z: 441,
};
const sansW = (s, size) => ([...s].reduce((a, ch) => a + (ADV_SANS[ch] ?? 556), 0) * size) / 1000;
const serifW = (s, size) => ([...s].reduce((a, ch) => a + (ADV_SERIF[ch] ?? 540), 0) * size * 0.97) / 1000;

// chip: ember zone 30, text zone = measured text + 12 percent slack (text centred in it), end cap 6
const chipTL = (label) => sansW(label, CHIP_FS) * 1.04;
const chipWidth = (label) => Math.ceil(chipTL(label) * 1.12 + 36);

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

// ---- wrapping with real widths --------------------------------------------------
// Parentheses stay in one piece; commas and semicolons are preferred break points.
const glue = (s) => s.replace(/\([^)]*\)/g, (m) => m.replace(/ /g, ' '));
function packLines(units, maxW, meas, sep = ' ') {
  const lines = [];
  let cur = '';
  const add = (u) => {
    if (!cur) cur = u;
    else if (meas(cur + sep + u) <= maxW) cur += sep + u;
    else {
      lines.push(cur);
      cur = u;
    }
  };
  for (const u of units) {
    if (meas(u) <= maxW || !u.includes(' ')) add(u);
    else for (const w of glue(u).split(' ')) add(w);
  }
  if (cur) lines.push(cur);
  return lines;
}
// narrowest width that keeps the same number of lines, so no line is a lone orphan
function balanced(units, maxW, meas, sep = ' ') {
  const n = packLines(units, maxW, meas, sep).length;
  let lo = maxW * 0.35;
  let hi = maxW;
  for (let k = 0; k < 18; k++) {
    const mid = (lo + hi) / 2;
    if (packLines(units, mid, meas, sep).length <= n) hi = mid;
    else lo = mid;
  }
  return packLines(units, hi, meas, sep);
}
const DOT = '  ·  ';
// meta: "a | b | c" keeps each part whole; a long list breaks at ';' then at ','
function metaLines(meta, maxW, size) {
  const meas = (s) => sansW(s, size);
  const parts = meta.split(/\s*\|\s*/);
  if (parts.length > 1) return balanced(parts, maxW, (s) => sansW(s.split(DOT).join(' '.repeat(0) + DOT), size), DOT).map((l) => l.split(DOT));
  return meta
    .split(/;\s*/)
    .map((t, i, a) => (i < a.length - 1 ? t + ';' : t))
    .flatMap((seg) => {
      const units = seg.split(/,\s*/).map((u, i, a) => (i < a.length - 1 ? u + ',' : u));
      return balanced(units, maxW, meas);
    })
    .map((l) => [l.replace(/ /g, ' ')]);
}

// ---- drawing helpers ------------------------------------------------------------
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

// A small glass jar lamp standing on a surface (round-bellied jar, cork, one flame):
// origin at the centre of its foot.
function glassLamp({ s = 1, seed = 1 }) {
  const dur = (3.2 + (seed % 4) * 0.5).toFixed(1);
  const del = ((seed * 0.7) % 3).toFixed(1);
  const jar = 'M-13 -3Q-25 -3-25 -22Q-25 -39-12 -44V-50H12V-44Q25 -39 25 -22Q25 -3 13 -3Z';
  return `<g transform="scale(${s})">
<circle cy="-26" r="96" fill="url(#lg)" opacity=".85" class="o flick" style="animation-duration:${dur}s;animation-delay:-${del}s"/>
<path d="${jar}" fill="url(#lampin)"/>
<path d="${jar}" fill="none" stroke="#d7e4ff" stroke-opacity=".62" stroke-width="1.5" stroke-linejoin="round"/>
<path d="M-17 -34Q-19.5 -24-15 -13" fill="none" stroke="#ffffff" stroke-opacity=".5" stroke-width="2.2" stroke-linecap="round"/>
<ellipse cy="-21" rx="11" ry="16" fill="#ffb060" opacity=".42" class="o flick" style="animation-duration:${(+dur + 0.9).toFixed(1)}s;animation-delay:-${del}s"/>
<path d="M0 -3V-12" stroke="#3a2418" stroke-width="1.7" stroke-linecap="round"/>
<ellipse cy="-20" rx="4.2" ry="9.5" fill="#fff6dc" opacity=".95" class="o flick" style="animation-duration:1.7s;animation-delay:-${del}s"/>
<rect x="-10.5" y="-57" width="21" height="8" rx="2.5" fill="#7a5532" stroke="#2a1a0e" stroke-width="1"/>
<path d="M-7 -54H7" stroke="#d4a56a" stroke-opacity=".45" stroke-width="1.2"/>
<path d="M-27 0Q-27 -3-22 -3H22Q27 -3 27 0Z" fill="#46321f" stroke="#a9825a" stroke-opacity=".7" stroke-width="1"/>
</g>`;
}

// A stack of flat stones that the ledge rests on. Origin: centre of the base.
function cairn(x, baseY, topY, wBase, seed) {
  const r = rng(seed);
  const n = 6;
  const h = (baseY - topY) / n;
  let out = '';
  const fills = ['#2b3a70', '#243262', '#30407a', '#222f5c', '#2a3868', '#34447f'];
  for (let i = 0; i < n; i++) {
    const w = wBase * (1 - i * 0.045) * (0.92 + r() * 0.14);
    const cy = baseY - h * (i + 0.5) + 2;
    const cx = x + (r() - 0.5) * 7;
    const hh = h * 1.12;
    out += `<rect x="${r1(cx - w / 2)}" y="${r1(cy - hh / 2)}" width="${r1(w)}" height="${r1(hh)}" rx="${r1(hh * 0.46)}" fill="${fills[(i + seed) % fills.length]}" stroke="#0b1433" stroke-width="1.2"/>`;
    out += `<path d="M${r1(cx - w / 2 + hh * 0.5)} ${r1(cy - hh / 2 + 1.6)}H${r1(cx + w / 2 - hh * 0.5)}" stroke="#a6b9f0" stroke-opacity=".3" stroke-width="1.3" stroke-linecap="round"/>`;
  }
  return out;
}

// tools lying on the ledge's top surface (seen from slightly above)
const hammer = (x, y) => `<g transform="translate(${x} ${y})"><rect x="-34" y="-2.5" width="52" height="5" rx="2.5" fill="#9a6e44"/><rect x="14" y="-6.5" width="14" height="13" rx="2" fill="#8b97b6"/><rect x="26" y="-4.5" width="7" height="9" rx="2" fill="#a9b4cf"/><path d="M-30 -1H10M16 -4H27" stroke="#fff" stroke-opacity=".28" stroke-width="1"/></g>`;
const level = (x, y) => `<g transform="translate(${x} ${y})"><rect x="-54" y="-5" width="108" height="10" rx="2.4" fill="#c4923f"/><rect x="-9" y="-3" width="18" height="6" rx="3" fill="#eef5d4" opacity=".9"/><circle cx="1.5" cy="0" r="1.9" fill="#8bd16a"/><circle cx="-36" r="2" fill="#4a3216"/><circle cx="36" r="2" fill="#4a3216"/><path d="M-50 -3.6H50" stroke="#fff" stroke-opacity=".3" stroke-width="1"/></g>`;
const wrench = (x, y) => `<g transform="translate(${x} ${y})"><rect x="-34" y="-2.6" width="50" height="5.2" rx="2.6" fill="#9aa6c4"/><circle cx="24" cy="0" r="8" fill="#9aa6c4"/><rect x="25" y="-3.4" width="12" height="6.8" fill="#3b2a1b"/><circle cx="-33" cy="0" r="4.6" fill="#9aa6c4"/><circle cx="-33" r="1.6" fill="#3b2a1b"/><path d="M-26 -1.2H12" stroke="#fff" stroke-opacity=".3" stroke-width="1"/></g>`;
const nut = (x, y) => `<g transform="translate(${x} ${y})"><path d="M-6.5 0L-3.2 -3.8H3.2L6.5 0L3.2 3.8H-3.2Z" fill="#a9b4cf"/><ellipse rx="2.3" ry="1.5" fill="#3b2a1b"/></g>`;

export function skills() {
  const rand = rng(77);

  // ---- layout numbers --------------------------------------------------------
  const packed = SKILLS.map((g) => packRows(g.items));
  const maxRows = Math.max(...packed.map((r) => r.length));
  const HEAD_Y = 238;
  const chipsTop = 274;
  const chipsBottom = chipsTop + maxRows * ROW_PITCH - CHIP_GAP;

  // the workbench band
  const B = chipsBottom + 136; // top of the ledge's top surface
  const SURF = 18; // depth of the top surface
  const FACE = 24; // front face height
  const G = B + SURF + FACE + 76; // ridge line the cairns stand on
  const LAMP_X = COL_X.map((x) => x + COL_W / 2);

  // education
  const eduTitleSize = 40;
  const eduBase = G + 96;
  const eduHeadY = eduBase - eduTitleSize - 4;

  // signpost: text sits centred in the free area of each board
  const POLE = 640;
  const POLE_HALF = 8;
  const TIP = 30;
  const CLEAR = 40; // text keeps at least this far from the pole
  const EDGE = 18; // and from the pointed end
  const boardX = { L: [64, POLE], R: [POLE, W - 64] };
  const freeBox = { L: [64 + TIP + EDGE, POLE - POLE_HALF - CLEAR], R: [POLE + POLE_HALF + CLEAR, W - 64 - TIP - EDGE] };
  const freeW = freeBox.L[1] - freeBox.L[0];
  const maxLine = freeW / 1.13; // 13 percent slack
  const TS = 24;
  const MS = 17;
  const TITLE_LH = 31;
  const META_LH = 25;
  const TM_GAP = 8;
  const boards = EDU.map((e, i) => {
    const side = i % 2 === 0 ? 'L' : 'R';
    const row = Math.floor(i / 2);
    const tl = balanced(glue(e.title).split(' '), maxLine, (s) => serifW(s, TS)).map((l) => l.replace(/ /g, ' '));
    const ml = metaLines(e.meta, maxLine, MS);
    const block = tl.length * TITLE_LH + TM_GAP + ml.length * META_LH;
    return { e, side, row, tl, ml, block, cx: (freeBox[side][0] + freeBox[side][1]) / 2 };
  });
  const PAD = 26;
  const rowH = [0, 1].map((r) => Math.max(104, ...boards.filter((b) => b.row === r).map((b) => b.block + 2 * PAD)));
  const ROW_GAP = 22;
  const row0 = eduBase + 40;
  const rowTop = [row0, row0 + rowH[0] + ROW_GAP];
  const boardsBottom = rowTop[1] + rowH[1];
  const H = Math.round(boardsBottom + 100);

  // ---- defs and css ----------------------------------------------------------
  const pn = panel({ w: W, h: H, id: 'sk', seed: 6, tint: 0.07 });
  let defs = pn.defs;
  defs += `
<linearGradient id="chipf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#27397a" stop-opacity=".92"/><stop offset="1" stop-color="#15244f" stop-opacity=".92"/></linearGradient>
<linearGradient id="chips" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9ccff" stop-opacity=".6"/><stop offset="1" stop-color="#6f86c8" stop-opacity=".26"/></linearGradient>
<linearGradient id="swg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e6eeff" stop-opacity="0"/><stop offset=".5" stop-color="#e6eeff" stop-opacity=".34"/><stop offset="1" stop-color="#e6eeff" stop-opacity="0"/></linearGradient>
<linearGradient id="hairG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.amber}" stop-opacity=".85"/><stop offset=".55" stop-color="${C.amber}" stop-opacity=".22"/><stop offset="1" stop-color="${C.amber}" stop-opacity="0"/></linearGradient>
<linearGradient id="woodG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a3522"/><stop offset=".5" stop-color="#37271b"/><stop offset="1" stop-color="#26190f"/></linearGradient>
<linearGradient id="topG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6a4d31"/><stop offset="1" stop-color="#4f3822"/></linearGradient>
<linearGradient id="poleG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#241810"/><stop offset=".4" stop-color="#4b3422"/><stop offset="1" stop-color="#1c120b"/></linearGradient>
<linearGradient id="ridgeG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050b1f"/><stop offset=".45" stop-color="#060d24" stop-opacity=".9"/><stop offset="1" stop-color="#060d24" stop-opacity="0"/></linearGradient>
<linearGradient id="shadG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".5"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
<radialGradient id="lampin" cx="50%" cy="58%" r="60%"><stop offset="0" stop-color="#ffc57a" stop-opacity=".78"/><stop offset=".6" stop-color="#ff9a3d" stop-opacity=".32"/><stop offset="1" stop-color="#9fbfff" stop-opacity=".14"/></radialGradient>
<radialGradient id="mistg" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#9fb4e8" stop-opacity=".22"/><stop offset="1" stop-color="#9fb4e8" stop-opacity="0"/></radialGradient>`;

  let css = `
@keyframes em{0%{opacity:.4}10%{opacity:1}22%{opacity:.55}36%{opacity:.95}52%{opacity:.35}68%{opacity:1}82%{opacity:.6}100%{opacity:.4}}
.em{animation:em 3.4s ease-in-out infinite}
@keyframes swp{0%{transform:translateX(-140px);opacity:0}4%{opacity:1}21%{opacity:1}25%{transform:translateX(540px);opacity:0}100%{transform:translateX(540px);opacity:0}}
.sw{animation:swp 12s linear infinite;opacity:0}
`;

  let body = '';

  // ---- sky and ground details --------------------------------------------------
  body += `<ellipse cx="1060" cy="${H - 30}" rx="560" ry="120" fill="url(#mistg)" class="mist" style="animation-duration:26s"/>`;

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

  // a dark treeline behind the workbench: crowns rise behind the lamps
  body += `<path d="${pineRow({ x0: -40, x1: 1320, by: G + 10, hMin: 80, hMax: 160, gap: 30, seed: 51 })}" fill="#0a1535"/>`;
  body += `<path d="${pineRow({ x0: -40, x1: 1320, by: G + 24, hMin: 50, hMax: 104, gap: 24, seed: 52 })}" fill="#060e27"/>`;

  // fireflies behind the glass
  const ffA = fireflies({ n: 4, box: [60, 150, 1220, 560], seed: 41, scale: 1, prefix: 'fa' });
  css += ffA.css;
  body += ffA.body;

  // ---- heading ---------------------------------------------------------------
  body += heading({ eyebrow: '03 / SKILLS', title: 'Technical skills', sub: 'The everyday toolbox, grouped the way I work.' });

  // ---- the three columns -----------------------------------------------------
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
        bodies += `<rect x="${x}" y="${y}" width="${c.w}" height="${CHIP_H}" rx="${CHIP_H / 2}" fill="url(#chipf)" stroke="url(#chips)" stroke-width="1.1"/><path d="M${x + 17} ${y + 1.4}H${x + c.w - 17}" stroke="#ffffff" stroke-opacity=".2" stroke-width="1" stroke-linecap="round"/>`;
        clip += `<rect x="${x}" y="${y}" width="${c.w}" height="${CHIP_H}" rx="${CHIP_H / 2}"/>`;
        const dur = 2.6 + rand() * 3;
        const del = rand() * 5;
        const tl = chipTL(c.label);
        const tx = x + 30 + tl * 0.06;
        texts += `<g class="em" style="animation-duration:${dur.toFixed(1)}s;animation-delay:-${del.toFixed(1)}s"><circle cx="${x + 18}" cy="${y + CHIP_H / 2}" r="9.5" fill="url(#lg)"/><circle cx="${x + 18}" cy="${y + CHIP_H / 2}" r="2.8" fill="${C.amber}"/></g>`;
        texts += `<text x="${r1(tx)}" y="${y + 26}" font-family="${SANS}" font-size="${CHIP_FS}" font-weight="500" fill="${C.cream}" textLength="${r1(tl)}" lengthAdjust="spacingAndGlyphs">${esc(c.label)}</text>`;
      });
    });
    defs += `<clipPath id="skc${gi}">${clip}</clipPath>`;

    // header: a small amber hex nut, spaced name, hairline
    const nx = x0 + 11;
    const ny = HEAD_Y - 6;
    body += `<g transform="translate(${nx} ${ny})"><circle r="15" fill="url(#lg)" opacity=".7"/><path d="M-8.5 0L-4.25 -7.4H4.25L8.5 0L4.25 7.4H-4.25Z" fill="${C.amber}" fill-opacity=".16" stroke="${C.amber}" stroke-width="1.6" stroke-linejoin="round"/><circle r="2.8" fill="${C.amber}"/></g>`;
    const gname = g.name.toUpperCase();
    const gtl = sansW(gname, GROUP_FS) * 1.04 + gname.length * 1.6;
    body += `<text x="${x0 + 30}" y="${HEAD_Y}" font-family="${SANS}" font-size="${GROUP_FS}" font-weight="600" letter-spacing="1.6" fill="${C.amber}" textLength="${r1(gtl)}" lengthAdjust="spacingAndGlyphs">${esc(gname)}</text>`;
    body += `<rect x="${x0}" y="${HEAD_Y + 14}" width="${COL_W}" height="1.6" rx=".8" fill="url(#hairG)"/>`;

    body += bodies;
    // pale light sweep across this group's chips, in turn: 0s, 4s, 8s of a 12s cycle
    const bx = x0 - 70;
    const y0 = chipsTop - 8;
    const y1 = chipsBottom + 8;
    body += `<g clip-path="url(#skc${gi})"><g class="sw" style="animation-delay:-${(12 - gi * 4) % 12}s"><path d="M${bx + 54} ${y0}H${bx + 144}L${bx + 90} ${y1}H${bx} Z" fill="url(#swg)"/></g></g>`;
    body += texts;
  });

  // ---- the workbench ledge -----------------------------------------------------
  const PX0 = 36;
  const PX1 = 1244;
  const PL = PX1 - PX0;
  // the cairns it rests on (drawn first; the ridge hides their feet)
  body += cairn(150, G + 30, B + SURF + FACE - 2, 76, 3);
  body += cairn(1130, G + 30, B + SURF + FACE - 2, 76, 5);
  // cast shadow under the ledge
  body += `<rect x="${PX0 + 14}" y="${B + SURF + FACE}" width="${PL - 28}" height="30" fill="url(#shadG)"/>`;
  // top surface, front face, end grain
  body += `<rect x="${PX0}" y="${B}" width="${PL}" height="${SURF}" rx="3" fill="url(#topG)" stroke="#8a6642" stroke-opacity=".8" stroke-width="1"/>`;
  body += `<rect x="${PX0}" y="${B + SURF - 1}" width="${PL}" height="${FACE + 1}" rx="3" fill="url(#woodG)" stroke="#6b4a2e" stroke-opacity=".85" stroke-width="1.3"/>`;
  body += `<path d="M${PX0 + 3} ${B + 1}H${PX1 - 3}" stroke="${C.amber}" stroke-opacity=".55" stroke-width="1.2"/>`;
  let grain = '';
  for (let k = 0; k < 9; k++) {
    const gx = PX0 + 40 + k * 135 + rand() * 40;
    const gy = B + SURF + 6 + rand() * (FACE - 12);
    const gl = 90 + rand() * 120;
    grain += `<path d="M${r1(gx)} ${r1(gy)}q${r1(gl / 2)} ${r1((rand() - 0.5) * 5)} ${r1(gl)} ${r1((rand() - 0.5) * 2)}" fill="none" stroke="${k % 2 ? '#a07848' : '#000'}" stroke-opacity="${k % 2 ? 0.12 : 0.24}" stroke-width="1.2"/>`;
  }
  body += grain;
  [PX0 + 16, PX1 - 16].forEach((nx) => {
    body += `<circle cx="${nx}" cy="${B + SURF + FACE / 2}" r="3" fill="#8f6c44" stroke="#1b110a" stroke-width=".9"/>`;
  });
  // a post under the middle of the ledge
  body += `<rect x="${POLE - 22}" y="${B + SURF + FACE - 1}" width="44" height="8" rx="2" fill="#2a1d14"/>`;

  // tools on the top surface
  const ty = B + SURF / 2 + 1;
  body += hammer(142, ty) + level(430, ty) + wrench(858, ty) + nut(930, ty - 1) + nut(946, ty + 2) + nut(1118, ty);
  // warm pools of light on the ledge, then the lamps
  LAMP_X.forEach((lx, i) => {
    body += `<ellipse cx="${lx}" cy="${B + 8}" rx="${i === 1 ? 150 : 128}" ry="13" fill="url(#lg)" opacity=".7" class="o flick" style="animation-duration:${(4.4 + i * 0.7).toFixed(1)}s"/>`;
  });
  LAMP_X.forEach((lx, i) => {
    body += `<g transform="translate(${lx} ${B + 12})">${glassLamp({ s: i === 1 ? 1.5 : 1.3, seed: i + 3 })}</g>`;
  });

  // the ridge: hides the cairns' feet, fades into the night below
  body += `<path d="M-10 ${G + 34}C160 ${G + 6} 330 ${G + 24} 520 ${G + 14}S900 ${G - 4} 1100 ${G + 16}S1250 ${G + 18} 1290 ${G + 8}V${G + 170}H-10Z" fill="url(#ridgeG)"/>`;
  body += `<path d="M-10 ${G + 34}C160 ${G + 6} 330 ${G + 24} 520 ${G + 14}S900 ${G - 4} 1100 ${G + 16}S1250 ${G + 18} 1290 ${G + 8}" fill="none" stroke="#3a5090" stroke-opacity=".4" stroke-width="1.4"/>`;
  body += `<ellipse cx="640" cy="${G + 8}" rx="700" ry="34" fill="url(#mistg)" class="mist" style="animation-duration:20s"/>`;

  const ffB = fireflies({ n: 4, box: [180, B - 130, 1100, B + 10], seed: 42, scale: 1.15, prefix: 'fb' });
  css += ffB.css;
  body += ffB.body;

  // a nearer treeline behind the signboards
  const lineBase = row0 + 34;
  body += `<path d="${pineRow({ x0: -40, x1: 1320, by: lineBase, hMin: 56, hMax: 118, gap: 28, seed: 53 })}" fill="#0a1535"/>`;
  body += `<path d="${pineRow({ x0: -40, x1: 1320, by: lineBase + 24, hMin: 40, hMax: 84, gap: 22, seed: 54 })}" fill="#060e27"/>`;

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
    let g2 = '';
    for (let k = 0; k < 3; k++) {
      const gy = top + h * (0.2 + 0.3 * k) + rand() * 6;
      const gx0 = edgeA + 20 + rand() * 60;
      const gx1 = edgeB - 20 - rand() * 60;
      g2 += `<path d="M${r1(gx0)} ${r1(gy)}Q${r1((gx0 + gx1) / 2)} ${r1(gy + (rand() - 0.5) * 7)} ${r1(gx1)} ${r1(gy + (rand() - 0.5) * 3)}" fill="none" stroke="${k % 2 ? '#a07848' : '#000'}" stroke-opacity="${k % 2 ? 0.1 : 0.2}" stroke-width="1.2"/>`;
    }
    const nailX = b.side === 'L' ? bx0 + TIP + 9 : bx1 - TIP - 9;
    shapes += `<g transform="${rot}"><path d="${poly}" fill="#02040b" opacity=".5" transform="translate(3 6)"/><path d="${poly}" fill="url(#woodG)" stroke="#6b4a2e" stroke-opacity=".85" stroke-width="1.4" stroke-linejoin="round"/>${g2}<path d="M${edgeA} ${top + 1}H${edgeB}" stroke="${C.amber}" stroke-opacity=".45" stroke-width="1.4"/><path d="M${edgeA} ${top + h - 1}H${edgeB}" stroke="#000" stroke-opacity=".35" stroke-width="1.4"/><circle cx="${nailX}" cy="${r1(midY)}" r="3" fill="#8f6c44" stroke="#1b110a" stroke-width=".9"/></g>`;

    // text block centred vertically in the board, each line centred on the free area
    const y0t = midY - b.block / 2;
    let t = '';
    b.tl.forEach((l, k) => {
      const tw = serifW(l, TS);
      t += `<text x="${r1(b.cx - tw / 2)}" y="${r1(y0t + k * TITLE_LH + TS * 0.86)}" font-family="${SERIF}" font-size="${TS}" fill="${C.cream}" textLength="${r1(tw)}" lengthAdjust="spacingAndGlyphs">${esc(l)}</text>`;
    });
    const my0 = y0t + b.tl.length * TITLE_LH + TM_GAP;
    const SEP = sansW(DOT, MS);
    b.ml.forEach((parts, k) => {
      const ws = parts.map((p) => sansW(p, MS));
      const total = ws.reduce((a, v) => a + v, 0) + SEP * (parts.length - 1);
      const yy = my0 + k * META_LH + MS * 0.9;
      let x = b.cx - total / 2;
      parts.forEach((p, pi) => {
        if (pi) t += `<circle cx="${r1(x - SEP / 2)}" cy="${r1(yy - MS * 0.32)}" r="2.3" fill="${C.amber}"/>`;
        t += `<text x="${r1(x)}" y="${r1(yy)}" font-family="${SANS}" font-size="${MS}" fill="#d3dbee" textLength="${r1(ws[pi])}" lengthAdjust="spacingAndGlyphs">${esc(p)}</text>`;
        x += ws[pi] + SEP;
      });
    });
    words += `<g transform="${rot}">${t}</g>`;
  });
  body += shapes;
  // a faint warm wash from the lamps above
  body += `<ellipse cx="${POLE}" cy="${row0 + 40}" rx="520" ry="150" fill="url(#lg)" opacity=".22" class="o flick" style="animation-duration:5.2s"/>`;

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
  const ffC = fireflies({ n: 2, box: [14, H - 270, 44, H - 70], seed: 43, scale: 1.3, prefix: 'fc' });
  const ffD = fireflies({ n: 2, box: [1236, H - 270, 1266, H - 70], seed: 44, scale: 1.3, prefix: 'fd' });
  css += ffC.css + ffD.css;
  body += ffC.body + ffD.body;

  // ---- accessible description --------------------------------------------------
  const descSkills = SKILLS.map((g) => `${g.name}: ${g.items.join(', ')}.`).join(' ');
  const descEdu = EDU.map((e) => `${e.title}, ${e.meta.replace(/\s*\|\s*/g, ', ')}.`).join(' ');
  const desc = `Technical skills. The everyday toolbox, grouped the way I work. ${descSkills} Education and certifications. ${descEdu} An animated night scene of glass chips with flickering embers, a wooden workbench ledge on two stone cairns with three glass jar lamps and a few tools, fireflies, and a wooden signpost.`;

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
