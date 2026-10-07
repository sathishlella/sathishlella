import { C, SERIF, SANS, MONO, GRADS, rng, r1, esc, doc, stars, moon, forestPath, pinePath, oakPath, lantern, fireflies, fern, guide, vignette, wrap, textLines, heading } from './lib.mjs';
import { JOBS } from './content.mjs';

// Experience: a dirt trail winds down the middle of a night forest. Four
// signposts stand beside it (newest job first), each with a swaying lantern and
// a glass card, alternating right and left. A small guide strolls down the trail.

const W = 1280;
const HZ = 206; // horizon, where the trail starts
const TOP = 230; // top of the first card
const PITCH = 152; // vertical step between cards
const CW = 470; // card width
const CX = { 1: 780, '-1': 30 }; // card x by side (1 = right of the trail)
const AMP = 30; // sideways swing of the trail

// ---- trail geometry ----------------------------------------------------------
const YS0 = TOP + 118; // ground y of the first signpost
const cx = (y) => 640 - AMP * Math.cos((Math.PI * (y - YS0)) / PITCH);
const hw = (y) => 17 + Math.max(0, y - HZ) * 0.058; // half width, wider toward the viewer

// ---- text helpers --------------------------------------------------------------
// wrap(), then if it came out as two lines, pick a nicer break: after a comma
// if possible, never after a dangling article, otherwise the most even split
const DANGLE = new Set(['a', 'an', 'the', 'and', 'of', 'to', 'by', 'for']);
function lines(text, width, size) {
  const l = wrap(text, width, size);
  if (l.length !== 2) return l;
  const maxChars = Math.floor(width / (size * 0.53));
  const words = text.split(/\s+/);
  let best = l;
  let bestScore = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(' ');
    const b = words.slice(i).join(' ');
    if (a.length > maxChars || b.length > maxChars) continue;
    let sc = Math.max(a.length, b.length) + Math.abs(a.length - b.length) * 0.15;
    if (/[,:;]$/.test(a)) sc -= 12;
    if (DANGLE.has(words[i - 1].toLowerCase())) sc += 14;
    if (sc < bestScore) {
      bestScore = sc;
      best = [a, b];
    }
  }
  return best;
}

const LH = 19; // line height inside a point
const GAP = 24; // baseline step between points

function layoutCard(job, i) {
  const side = i % 2 === 0 ? 1 : -1;
  const role = lines(job.role, CW - 46, 16);
  const pts = job.points.map((p) => lines(p, CW - 46 - 24, 15));
  let dy = 36; // org baseline
  const roleY = dy + 24;
  const metaY = roleY + (role.length - 1) * 19 + 22;
  const ruleY = metaY + 12;
  let cur = ruleY + 24;
  const placed = pts.map((ls) => {
    const at = cur;
    cur += (ls.length - 1) * LH + GAP;
    return { ls, at };
  });
  const lastBase = cur - GAP;
  const h = Math.round(lastBase + 24);
  return { job, i, side, x: CX[side], y: TOP + i * PITCH, w: CW, h, role, roleY, metaY, ruleY, placed };
}

const CARDS = JOBS.map(layoutCard);
const BOTTOM = Math.max(...CARDS.map((c) => c.y + c.h));
const H = Math.round(BOTTOM + 46);

// ---- trees ---------------------------------------------------------------------
function edgeColumn(side, seed) {
  const rand = rng(seed);
  let d = '';
  for (let by = 250; by < H + 60; by += 48 + rand() * 30) {
    const h = 150 + (by - 200) * 0.15 + rand() * 40;
    const x = side < 0 ? -8 + rand() * 30 : W + 8 - rand() * 30;
    d += pinePath(x, by, h, h * 0.31, rand);
  }
  return d;
}
function cluster({ xs, ys, n, hMin, hMax, seed, oak = 0.3 }) {
  const rand = rng(seed);
  const items = [];
  for (let i = 0; i < n; i++) {
    const by = ys[0] + rand() * (ys[1] - ys[0]);
    const h = hMin + rand() * (hMax - hMin);
    const x = xs[0] + rand() * (xs[1] - xs[0]);
    items.push({ x, by, h, o: rand() < oak });
  }
  items.sort((a, b) => a.by - b.by);
  return items.map((t) => (t.o ? oakPath(t.x, t.by, t.h * 0.8, t.h * 0.86, rand) : pinePath(t.x, t.by, t.h, t.h * 0.34, rand))).join('');
}
// small tufts of grass along the trail edges
function tufts(rand) {
  let d = '';
  for (const s of [-1, 1]) {
    for (let y = HZ + 22; y < H - 6; y += 22 + rand() * 30) {
      const x = cx(y) + s * (hw(y) + 3 + rand() * 7);
      const k = 0.7 + (y - HZ) / 700;
      d += `M${r1(x - 4 * k)} ${r1(y)}Q${r1(x - 6 * k)} ${r1(y - 9 * k)} ${r1(x - 8 * k)} ${r1(y - 13 * k)}Q${r1(x - 2 * k)} ${r1(y - 8 * k)} ${r1(x)} ${r1(y - 1)}Q${r1(x + 1 * k)} ${r1(y - 11 * k)} ${r1(x + 4 * k)} ${r1(y - 16 * k)}Q${r1(x + 4 * k)} ${r1(y - 8 * k)} ${r1(x + 6 * k)} ${r1(y)}Z`;
    }
  }
  return d;
}

// ---- the signposts -------------------------------------------------------------
const SIGNS = CARDS.map((c) => {
  const yG = c.y + 118; // where the post meets the ground
  const bc = c.y + 40; // board centre
  const d = c.side;
  const edge = cx(yG) + d * hw(yG);
  const px = edge + d * 10;
  const year = (c.job.when.match(/\d{4}/) || [''])[0];
  return { c, d, yG, bc, px, year, tip: px + d * 74, lx: px + d * 54 };
});

function signpost(s, k) {
  const { d, yG, bc, px, year } = s;
  const x0 = px - d * 8;
  const x1 = px + d * 60;
  const tip = px + d * 74;
  const yb = bc + 12;
  const lcy = yb + 12 + 15;
  const dur = (4.2 + (k % 3) * 0.7).toFixed(1);
  const grass = `M${r1(px - 12)} ${yG + 1}Q${r1(px - 14)} ${yG - 10} ${r1(px - 17)} ${yG - 15}Q${r1(px - 9)} ${yG - 8} ${r1(px - 6)} ${yG}ZM${r1(px + 5)} ${yG}Q${r1(px + 8)} ${yG - 12} ${r1(px + 13)} ${yG - 17}Q${r1(px + 12)} ${yG - 8} ${r1(px + 15)} ${yG + 1}Z`;
  return `<g>
<ellipse cx="${r1(px)}" cy="${yG + 1}" rx="17" ry="4.2" fill="#02050e" opacity=".55"/>
<rect x="${r1(px - 4.5)}" y="${bc - 20}" width="9" height="${yG - bc + 20}" rx="2" fill="#35231a"/>
<rect x="${r1(px - 4.5)}" y="${bc - 20}" width="3" height="${yG - bc + 20}" rx="1.5" fill="#5a3b26" opacity=".8"/>
<path d="M${r1(px - 6.5)} ${bc - 18}L${r1(px)} ${bc - 26}L${r1(px + 6.5)} ${bc - 18}Z" fill="#4a3022"/>
<path d="M${r1(x0)} ${bc - 12}L${r1(x1)} ${bc - 12}L${r1(tip)} ${bc}L${r1(x1)} ${bc + 12}L${r1(x0)} ${bc + 12}Z" fill="#8a5a34" stroke="#26170e" stroke-width="1"/>
<path d="M${r1(x0)} ${bc - 11}L${r1(x1)} ${bc - 11}" stroke="#c4925a" stroke-opacity=".7" stroke-width="1.2"/>
<path d="M${r1(x0 + d * 4)} ${bc + 7}L${r1(x1 - d * 2)} ${bc + 7}M${r1(x0 + d * 10)} ${bc - 6}L${r1(x1 - d * 12)} ${bc - 6}" stroke="#5a3a20" stroke-opacity=".5" stroke-width=".8"/>
<circle cx="${r1(x0 + d * 5)}" cy="${bc}" r="1.5" fill="#e0b680"/>
<text x="${r1(px + d * 31 + 0.8)}" y="${bc + 5.8}" font-family="${SERIF}" font-size="14.5" fill="#1d1109" text-anchor="middle" opacity=".7">${year}</text>
<text x="${r1(px + d * 31)}" y="${bc + 5}" font-family="${SERIF}" font-size="14.5" fill="#fff0d0" text-anchor="middle">${year}</text>
<path d="${grass}" fill="#050c20"/>
<g class="hang" style="transform-box:view-box;transform-origin:${r1(s.lx)}px ${yb}px;animation-duration:${dur}s;animation-delay:-${(k * 1.3).toFixed(1)}s">
<path d="M${r1(s.lx)} ${yb}V${yb + 9}" stroke="#2a1d14" stroke-width="1.6"/>
<g transform="translate(${r1(s.lx)} ${lcy}) scale(.55)">${lantern({ glow: 1.6, seed: k * 2 + 3, flame: true })}</g>
</g>
</g>`;
}

function connector(s, k) {
  const edge = s.c.side > 0 ? s.c.x : s.c.x + s.c.w;
  const a = s.tip + s.d * 6;
  return `<path d="M${r1(a)} ${s.bc}H${r1(edge)}" stroke="${C.amber}" stroke-opacity=".8" stroke-width="1.7" stroke-linecap="round" stroke-dasharray="0.1 6.4" fill="none" class="march" style="animation-delay:-${k * 0.5}s"/>
<circle cx="${r1(edge)}" cy="${s.bc}" r="9" fill="url(#lg)" opacity=".8"/><circle cx="${r1(edge)}" cy="${s.bc}" r="3.4" fill="${C.amber2}"/><circle cx="${r1(edge)}" cy="${s.bc}" r="1.3" fill="#fff0cc"/>`;
}

// ---- cards -----------------------------------------------------------------------
function cardSvg(c, k) {
  const { x, y, w, h, job } = c;
  const tx = x + 26;
  const sweepDelay = (-k * 2.3).toFixed(1);
  let s = `<g>
<rect x="${x}" y="${y + 9}" width="${w}" height="${h}" rx="16" fill="#01030a" opacity=".38"/>
<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="url(#cardfill)" stroke="#3d5290" stroke-opacity=".55" stroke-width="1.2"/>
<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="url(#cardsheen)"/>
<path d="M${x} ${y + 16}A16 16 0 0 1 ${x + 16} ${y}H${x + w - 16}A16 16 0 0 1 ${x + w} ${y + 16}" fill="none" stroke="url(#cardtop)" stroke-width="2"/>
<g clip-path="url(#cc${k})"><rect x="${x - 70}" y="${y}" width="70" height="2.4" fill="url(#sweepg)" class="csw" style="animation-delay:${sweepDelay}s"/></g>`;
  s += `<text x="${tx}" y="${y + 36}" font-family="${SERIF}" font-size="26" fill="${C.cream}">${esc(job.org)}</text>`;
  s += textLines(c.role, { x: tx, y: y + c.roleY, size: 16, lh: 1.2, fill: C.amber, weight: 500 });
  s += `<text x="${tx}" y="${y + c.metaY}" font-family="${SANS}" font-size="14" fill="${C.muted}">${esc(job.when)}<tspan dx="10" fill="${C.dim}">|</tspan><tspan dx="10">${esc(job.where)}</tspan></text>`;
  s += `<path d="M${tx} ${y + c.ruleY}H${x + w - 26}" stroke="#2c3d70" stroke-opacity=".9" stroke-width="1"/>`;
  for (const p of c.placed) {
    const by = y + p.at;
    s += `<circle cx="${x + 33}" cy="${r1(by - 4.8)}" r="9" fill="url(#lg)" opacity=".55"/><circle cx="${x + 33}" cy="${r1(by - 4.8)}" r="3.2" fill="${C.amber2}"/>`;
    s += textLines(p.ls, { x: x + 48, y: by, size: 15, lh: LH / 15, fill: '#d3dbee' });
  }
  return s + '</g>';
}

// ---- the stroll ---------------------------------------------------------------
function stroll() {
  const stops = SIGNS.map((s) => s.yG + 22);
  const start = HZ + 20;
  const end = H - 30;
  const route = [start, ...stops, end];
  const speed = 30; // px per second, before easing
  const hold = 3.4;
  const fade = 1.6;
  const tl = [];
  let t = 0;
  tl.push({ t0: t, t1: t + fade, y0: route[0], y1: route[0], fadeIn: true });
  t += fade;
  let holdMid = 0;
  for (let k = 1; k < route.length; k++) {
    const dur = (route[k] - route[k - 1]) / speed;
    tl.push({ t0: t, t1: t + dur, y0: route[k - 1], y1: route[k], move: true });
    t += dur;
    if (k < route.length - 1) {
      tl.push({ t0: t, t1: t + hold, y0: route[k], y1: route[k] });
      if (k === 2) holdMid = t + hold * 0.55;
      t += hold;
    }
  }
  tl.push({ t0: t, t1: t + fade, y0: route[route.length - 1], y1: route[route.length - 1], fadeOut: true });
  t += fade;
  const T = t;
  const scaleAt = (y) => 0.46 + ((y - start) / (end - start)) * 0.14;
  let kf = '';
  const N = 110;
  for (let i = 0; i <= N; i++) {
    const tt = (i / N) * T;
    const seg = tl.find((s) => tt >= s.t0 && tt <= s.t1) || tl[tl.length - 1];
    const u = seg.t1 > seg.t0 ? (tt - seg.t0) / (seg.t1 - seg.t0) : 0;
    const e = seg.move ? u * u * (3 - 2 * u) : 0;
    const y = seg.y0 + (seg.y1 - seg.y0) * e;
    let o = 1;
    if (seg.fadeIn) o = u;
    if (seg.fadeOut) o = 1 - u;
    kf += `${r1((i / N) * 100)}%{transform:translate(${r1(cx(y))}px,${r1(y)}px) scale(${scaleAt(y).toFixed(3)});opacity:${r1(o * 100) / 100}}`;
  }
  const yStatic = route[2];
  return {
    T,
    css: `@keyframes stroll{${kf}}.stroll{transform-box:view-box;transform-origin:0 0;animation:stroll ${T.toFixed(1)}s linear infinite;animation-delay:-${holdMid.toFixed(1)}s}`,
    staticAttr: `translate(${r1(cx(yStatic))} ${r1(yStatic)}) scale(${scaleAt(yStatic).toFixed(3)})`,
  };
}

// ---- the build ------------------------------------------------------------------
export function experience() {
  const rand = rng(77);
  let css = `
.march{animation:march 2.6s linear infinite}
@keyframes march{to{stroke-dashoffset:-13}}
.csw{animation:csw 8.5s ease-in-out infinite}
@keyframes csw{0%,14%{transform:translateX(0)}86%,100%{transform:translateX(${CW + 70}px)}}
@keyframes dgl{0%{transform:translateX(-5px)}100%{transform:translateX(5px)}}
.dgl{animation:dgl 18s ease-in-out infinite alternate}
@keyframes mst{0%{transform:translateX(-60px);opacity:.35}100%{transform:translateX(60px);opacity:.8}}
.mst{animation:mst 20s ease-in-out infinite alternate}
`;
  let defs = GRADS;
  defs += `
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.zenith}"/><stop offset=".6" stop-color="#14224f"/><stop offset="1" stop-color="#34487f"/></linearGradient>
<linearGradient id="landg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e3266"/><stop offset=".1" stop-color="#132450"/><stop offset=".45" stop-color="#0b1738"/><stop offset="1" stop-color="#050a1c"/></linearGradient>
<linearGradient id="trailg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34406c"/><stop offset=".45" stop-color="#3a3249"/><stop offset="1" stop-color="#3f2d2f"/></linearGradient>
<linearGradient id="sheeng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9db4ee" stop-opacity=".0"/><stop offset=".25" stop-color="#9db4ee" stop-opacity=".11"/><stop offset="1" stop-color="#9db4ee" stop-opacity=".03"/></linearGradient>
<radialGradient id="mistg" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#cfe0ff" stop-opacity=".34"/><stop offset="1" stop-color="#cfe0ff" stop-opacity="0"/></radialGradient>
<linearGradient id="haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6a80b8" stop-opacity="0"/><stop offset="1" stop-color="#6a80b8" stop-opacity=".34"/></linearGradient>
<linearGradient id="cardfill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#15245a" stop-opacity=".9"/><stop offset="1" stop-color="#0a1433" stop-opacity=".92"/></linearGradient>
<linearGradient id="cardsheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#cfe0ff" stop-opacity=".09"/><stop offset=".45" stop-color="#cfe0ff" stop-opacity="0"/></linearGradient>
<linearGradient id="cardtop" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.amber}" stop-opacity=".15"/><stop offset=".5" stop-color="${C.amber}" stop-opacity=".85"/><stop offset="1" stop-color="${C.amber}" stop-opacity=".15"/></linearGradient>
<linearGradient id="sweepg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffe2b0" stop-opacity="0"/><stop offset=".6" stop-color="#ffe2b0" stop-opacity=".9"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
<clipPath id="pclip"><rect width="${W}" height="${H}" rx="22"/></clipPath>
${CARDS.map((c, k) => `<clipPath id="cc${k}"><rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" rx="16"/></clipPath>`).join('')}
`;
  const vg = vignette(W, H, 'vig', 0.55);
  defs += vg.def;

  // trail polygon
  const ys = [];
  for (let y = HZ - 2; y <= H + 6; y += 6) ys.push(y);
  const leftPts = ys.map((y) => `${r1(cx(y) - hw(y))} ${y}`);
  const rightPts = ys.map((y) => `${r1(cx(y) + hw(y))} ${y}`).reverse();
  const trailD = `M${leftPts.join('L')}L${rightPts.join('L')}Z`;
  const sheenPts = ys.map((y) => `${r1(cx(y) - hw(y) * 0.5)} ${y}`);
  const sheenR = ys.map((y) => `${r1(cx(y) + hw(y) * 0.5)} ${y}`).reverse();
  const sheenD = `M${sheenPts.join('L')}L${sheenR.join('L')}Z`;
  const rutL = `M${ys.map((y) => `${r1(cx(y) - hw(y) * 0.4)} ${y}`).join('L')}`;
  const rutR = `M${ys.map((y) => `${r1(cx(y) + hw(y) * 0.4)} ${y}`).join('L')}`;
  const edgeL = `M${ys.map((y) => `${r1(cx(y) - hw(y))} ${y}`).join('L')}`;
  const edgeR = `M${ys.map((y) => `${r1(cx(y) + hw(y))} ${y}`).join('L')}`;
  let pebLight = '';
  let pebDark = '';
  for (let i = 0; i < 90; i++) {
    const y = HZ + 6 + rand() * (H - HZ - 10);
    const x = cx(y) + (rand() - 0.5) * 2 * hw(y) * 0.88;
    const k = 0.5 + (y - HZ) / 520;
    const rx = (1 + rand() * 2.2) * k;
    const ry = rx * 0.55;
    const p = `M${r1(x - rx)} ${r1(y)}a${r1(rx)} ${r1(ry)} 0 1 0 ${r1(rx * 2)} 0a${r1(rx)} ${r1(ry)} 0 1 0 ${r1(-rx * 2)} 0Z`;
    if (rand() < 0.5) pebLight += p;
    else pebDark += p;
  }

  // trees are defined once and drawn twice: a pale moonlit rim, then the dark body on top
  let treeDefs = '';
  const rimmed = (id, d, fill, rim = '#3d5cae', op = 0.5) => {
    treeDefs += `<path id="${id}" d="${d}"/>`;
    return `<use href="#${id}" fill="${rim}" opacity="${op}" transform="translate(1.7 -1.5)"/><use href="#${id}" fill="${fill}"/>`;
  };

  let body = '';
  // ---- sky
  body += `<g clip-path="url(#pclip)">`;
  body += `<rect width="${W}" height="${HZ + 8}" fill="url(#sky)"/>`;
  body += stars({ w: W, yMax: 196, count: 96, seed: 7 });
  body += moon(1160, 92, 25);
  body += `<path d="M0 ${HZ + 6}V188Q110 170 250 186T520 180T800 188T1040 174T1280 188V${HZ + 6}Z" fill="#101d42"/>`;
  body += `<g class="dgl"><path d="${forestPath({ x0: -40, x1: 1320, by: HZ + 8, hMin: 16, hMax: 40, gap: 22, seed: 3, oakShare: 0.25 })}" fill="#0b1737"/></g>`;
  body += `<g class="dgl" style="animation-duration:23s"><path d="${forestPath({ x0: -40, x1: 1320, by: HZ + 40, hMin: 44, hMax: 76, gap: 30, seed: 9, oakShare: 0.3 })}" fill="#091330"/></g>`;
  body += `<rect y="${HZ - 40}" width="${W}" height="46" fill="url(#haze)"/>`;

  // ---- ground
  body += `<rect y="${HZ}" width="${W}" height="${H - HZ}" fill="url(#landg)"/>`;
  body += `<ellipse cx="900" cy="${HZ + 24}" rx="480" ry="46" fill="url(#moong)" opacity=".55"/>`;
  {
    let fl = '';
    for (let i = 0; i < 170; i++) {
      const y = HZ + 12 + rand() * (H - HZ - 18);
      const x = rand() * W;
      if (Math.abs(x - cx(y)) < hw(y) + 16) continue;
      const k = 0.5 + (y - HZ) / 560;
      fl += `M${r1(x)} ${r1(y)}l${r1((rand() - 0.5) * 3 * k)} ${r1(-(3 + rand() * 5) * k)}`;
    }
    body += `<path d="${fl}" fill="none" stroke="#2f4a8e" stroke-opacity=".45" stroke-width="1.2" stroke-linecap="round"/>`;
  }

  // ---- forest framing the edges and filling the gaps (behind the cards)
  body += rimmed('eL', edgeColumn(-1, 41), '#040918');
  body += rimmed('eR', edgeColumn(1, 43), '#040918');
  {
    const fr = rng(5);
    [[-26, 392, 350, 118], [W + 30, 540, 330, 112], [W + 8, H + 14, 300, 104], [26, 300, 190, 62]].forEach(([x, by, h, w], i) => {
      body += `<g class="ob sway" style="animation-duration:${10 + i * 1.7}s;animation-delay:-${i * 2.6}s">${rimmed('fp' + i, pinePath(x, by, h, w, fr), '#030714', '#3d5cae', 0.45)}</g>`;
    });
  }
  body += rimmed('z1', cluster({ xs: [60, 480], ys: [262, 300], n: 6, hMin: 56, hMax: 90, seed: 11, oak: 0.12 }), '#071029', '#2c4688', 0.4);
  body += rimmed('z2', cluster({ xs: [80, 480], ys: [318, 380], n: 6, hMin: 96, hMax: 150, seed: 12, oak: 0.0 }), '#040918');
  body += rimmed('z3', cluster({ xs: [60, 470], ys: [640, 686], n: 4, hMin: 58, hMax: 94, seed: 13 }), '#040918');
  body += rimmed('z4', cluster({ xs: [820, 1230], ys: [450, 530], n: 5, hMin: 62, hMax: 100, seed: 14, oak: 0.1 }), '#040918');
  body += rimmed('z5', cluster({ xs: [820, 1230], ys: [770, H - 20], n: 8, hMin: 100, hMax: 150, seed: 15, oak: 0.1 }), '#040918');

  // ---- the trail
  body += `<path d="${trailD}" fill="url(#trailg)"/>`;
  body += `<path d="${sheenD}" fill="url(#sheeng)"/>`;
  body += `<path d="${rutL}${''}" fill="none" stroke="#0a1024" stroke-opacity=".4" stroke-width="2.2" stroke-dasharray="26 9 8 14"/><path d="${rutR}" fill="none" stroke="#0a1024" stroke-opacity=".4" stroke-width="2.2" stroke-dasharray="20 12 12 8"/>`;
  body += `<path d="${edgeL}" fill="none" stroke="#7388c4" stroke-opacity=".3" stroke-width="1.4"/><path d="${edgeR}" fill="none" stroke="#7388c4" stroke-opacity=".3" stroke-width="1.4"/>`;
  body += `<path d="${pebLight}" fill="#7f86a8" fill-opacity=".32"/><path d="${pebDark}" fill="#0a1024" fill-opacity=".5"/>`;
  body += `<path d="${tufts(rand)}" fill="#050c20"/>`;
  // a far lantern where the trail meets the horizon
  body += `<g transform="translate(${r1(cx(HZ + 4) + 2)} ${HZ - 10}) scale(.26)"><g class="bob" style="animation-duration:6s">${lantern({ glow: 1.4, seed: 5 })}</g></g>`;

  // ---- lantern pools of light on the trail
  for (const [k, s] of SIGNS.entries()) {
    const gx = cx(s.yG) + s.d * hw(s.yG) * 0.2;
    body += `<ellipse cx="${r1(gx)}" cy="${s.yG + 2}" rx="${r1(98 + hw(s.yG))}" ry="${r1(34 + hw(s.yG) * 0.2)}" fill="url(#lg)" opacity=".85" class="o pulse" style="animation-duration:${4 + k}s"/>`;
  }

  // ---- mist behind the cards, over the lower trail
  [[700, 640, 260, 30, 17], [760, 700, 220, 26, 23], [840, 620, 280, 34, 19], [900, 670, 240, 28, 26], [560, 650, 220, 24, 21]].forEach(([yy, xx, rx, ry, d], i) => {
    body += `<g class="mst" style="animation-duration:${d}s;animation-delay:-${i * 3.7}s"><ellipse cx="${xx}" cy="${Math.min(yy, H - 40)}" rx="${rx}" ry="${ry}" fill="url(#mistg)"/></g>`;
  });

  // ---- signposts (lantern, board, post), dotted connectors
  body += SIGNS.map(signpost).join('');

  // ---- the guide strolling down the trail
  const st = stroll();
  css += st.css;
  body += `<g class="stroll" transform="${st.staticAttr}"><ellipse cx="2" cy="7" rx="25" ry="6" fill="#02050e" opacity=".45"/><g class="walk">${guide({ pose: 'wave' })}</g></g>`;

  // ---- the cards
  body += vg.body;
  body += CARDS.map(cardSvg).join('');
  body += SIGNS.map(connector).join('');

  // ---- fireflies, front mist, ferns
  const f1 = fireflies({ n: 5, box: [560, 250, 740, 880], seed: 61, scale: 1.1, prefix: 'fa' });
  const f2 = fireflies({ n: 3, box: [80, 250, 470, 380], seed: 62, scale: 1.0, prefix: 'fb' });
  const f3 = fireflies({ n: 4, box: [820, 790, 1220, 900], seed: 63, scale: 1.2, prefix: 'fc' });
  css += f1.css + f2.css + f3.css;
  body += f1.body + f2.body + f3.body;
  body += `<g class="mst" style="animation-duration:24s;animation-delay:-6s"><ellipse cx="640" cy="${H - 18}" rx="330" ry="26" fill="url(#mistg)"/></g>`;
  body += fern(-4, H + 10, 84, 10, '#03060f', 1);
  body += fern(52, H + 20, 62, -8, '#050a17', 2);
  body += fern(W + 4, H + 8, 170, -14, '#03060f', 3);
  body += fern(W - 84, H + 18, 118, 8, '#050a17', 4);
  body += fern(W - 170, H + 22, 86, -4, '#04080f', 5);
  body += `</g><rect x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}" rx="21.5" fill="none" stroke="${C.line}" stroke-opacity=".7" stroke-width="1.5"/>`;

  // ---- heading on top
  body += heading({ eyebrow: '02 / EXPERIENCE', title: 'Where I have worked', sub: 'From research labs to client projects, across three countries.', y: 54 });

  const descJobs = JOBS.map((j) => `${j.org}, ${j.role}, ${j.when} | ${j.where}: ${j.points.join('; ')}.`).join(' ');
  return doc({
    w: W,
    h: H,
    title: 'Experience, where Sathish Lella has worked',
    desc: `An animated night scene: a dirt trail winds through a moonlit forest past four lantern-lit signposts while a small guide walks down it. 02 / EXPERIENCE. Where I have worked. From research labs to client projects, across three countries. ${descJobs}`,
    defs: defs + treeDefs,
    css,
    body,
  });
}

export default function build() {
  return { 'experience.svg': experience() };
}
