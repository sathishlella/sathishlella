// Section 04: the projects header (a dark river with six paper lanterns drifting
// past) and one 640 x 376 night card per project. Every card is the same family:
// a paper lantern floating on a small strip of water at the top left, serif title,
// amber meta line and (where it adds something) a mono tech line, three ember-
// bulleted points, a dark river bank along the bottom with the call to action and
// the destination host, an amber light sweeping the top edge, and a small
// medallion at the top right that moves in a way that suits the project. The
// 'walk' card is the one with a moon: the guide waves from in front of it.
import { C, SERIF, SANS, MONO, rng, r1, doc, moon, forestPath, lantern, fireflies, heading, textLines, panel, esc } from './lib.mjs';
import { PROJECTS } from './content.mjs';

const BODY = '#d3daec';
const ST = '#e4eaf8';
const LABEL = '#9fb0d6'; // mono captions on the night navy (about 7:1)
const ARROW = '→';

// ---- text widths -----------------------------------------------------------------
// SVG cannot measure text, so this estimates it from a few character classes. It was
// checked against the real renders of the fallback faces (within a few percent) and is
// used to wrap bullets, to place the arrow after a call to action, and to pin the
// width of fixed labels with textLength so a different font cannot make them overflow.
const NAR1 = new Set("iIjl.,:;!|'");
const NAR2 = new Set('ftr()-/[]` ');
function tw(text, size, kind = 'sans', bold = false) {
  const serif = kind === 'serif';
  let em = 0;
  for (const ch of String(text)) {
    if (NAR1.has(ch)) em += serif ? 0.28 : 0.26;
    else if (NAR2.has(ch)) em += serif ? 0.34 : 0.31;
    else if ('mM'.includes(ch)) em += serif ? 0.86 : 0.83;
    else if ('wW'.includes(ch)) em += serif ? 0.8 : 0.78;
    else if (/[A-Z]/.test(ch)) em += 0.68;
    else if (/[0-9]/.test(ch)) em += serif ? 0.6 : 0.556;
    else if (/[a-z]/.test(ch)) em += serif ? 0.49 : 0.54;
    else em += 0.6;
  }
  return em * size * (bold ? 1.06 : 1);
}
const monoW = (text, size) => text.length * size * 0.602;

// greedy wrap by estimated width; two-line results are rebalanced so no line is left with a single word
function wrapW(text, maxW, size) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? cur + ' ' + w : w;
    if (cur && tw(next, size) > maxW) {
      lines.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  if (lines.length === 2) {
    let best = null;
    for (let i = 1; i < words.length; i++) {
      const a = words.slice(0, i).join(' ');
      const b = words.slice(i).join(' ');
      const m = Math.max(tw(a, size), tw(b, size));
      const score = m - (a.endsWith(',') ? 70 : 0);
      if (m <= maxW && (!best || score < best.score)) best = { a, b, score };
    }
    if (best) return [best.a, best.b];
  }
  return lines;
}

// ---- shared bits ---------------------------------------------------------------

// A little stand of reeds with one cattail, swaying from the root.
function reed(x, y, h, lean, seed, color) {
  const rand = rng(seed);
  let blades = '';
  for (let i = 0; i < 4; i++) {
    const hh = h * (0.55 + rand() * 0.4);
    const l = lean * (0.5 + rand() * 0.7) + (i - 1.5) * 7;
    const b = (i - 1.5) * 2.2;
    blades += `M${r1(b)} 0Q${r1(l * 0.4 + b)} ${r1(-hh * 0.55)} ${r1(l)} ${r1(-hh)}Q${r1(l * 0.4 + b + 3)} ${r1(-hh * 0.5)} ${r1(b + 3)} 0Z`;
  }
  const sx = lean * 0.9;
  const sy = -h * 0.86;
  const stalk = `<path d="M0 0Q${r1(lean * 0.3)} ${r1(sy * 0.5)} ${r1(sx)} ${r1(sy)}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round"/><ellipse cx="${r1(sx)}" cy="${r1(sy - 7)}" rx="2.8" ry="8.5" fill="${color}"/>`;
  return `<g transform="translate(${x} ${y})"><g class="ob swayf" style="animation-duration:${(5 + rand() * 3).toFixed(1)}s;animation-delay:-${(rand() * 4).toFixed(1)}s"><path d="${blades}" fill="${color}"/>${stalk}</g></g>`;
}

// 'github.com/sathishlella/<repo>' for repo links, the bare host for everything else
function hostLabel(href) {
  try {
    const u = new URL(href);
    const host = u.host.replace(/^www\./, '');
    const parts = u.pathname.split('/').filter(Boolean);
    return host === 'github.com' ? [host, ...parts].join('/') : host;
  } catch {
    return '';
  }
}

// Stars scattered over a panel, kept clear of the rectangles where text sits.
function sky({ w, yMax, count, seed, avoid = [] }) {
  const rand = rng(seed);
  const groups = [[], [], [], [], []];
  let n = 0;
  for (let tries = 0; n < count && tries < count * 60; tries++) {
    const x = 6 + rand() * (w - 12);
    const y = 4 + rand() * yMax * (0.3 + 0.7 * rand());
    if (avoid.some(([x0, y0, x1, y1]) => x > x0 - 6 && x < x1 + 6 && y > y0 - 6 && y < y1 + 6)) continue;
    const mag = Math.pow(rand(), 3);
    const tint = rand() < 0.2 ? '#ffe9c8' : rand() < 0.4 ? '#cfe0ff' : '#ffffff';
    groups[n % 5].push(`<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(0.6 + mag * 1.5)}" fill="${tint}"/>`);
    n++;
  }
  return groups.map((g, i) => `<g class="tw" style="animation-duration:${(3 + i * 1.3).toFixed(1)}s;animation-delay:-${(i * 1.7).toFixed(1)}s">${g.join('')}</g>`).join('');
}

// ---- projects-head ---------------------------------------------------------------
function head() {
  const W = 1280;
  const H = 250;
  const WL = 204; // waterline
  const pn = panel({ w: W, h: H, id: 'ph', seed: 7 });
  const defs = `${pn.defs}
<linearGradient id="rvh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a4f86"/><stop offset=".22" stop-color="#1b2d5c"/><stop offset="1" stop-color="#050b1c"/></linearGradient>
<linearGradient id="hzh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5f74a8" stop-opacity="0"/><stop offset="1" stop-color="#5f74a8" stop-opacity=".34"/></linearGradient>`;

  let css = `
@keyframes rock{0%{transform:rotate(-3.2deg)}100%{transform:rotate(3.2deg)}}
.rock{animation:rock 5.4s ease-in-out infinite alternate}
`;
  let b = pn.open;

  // a low warm haze where the far bank meets the sky
  b += `<ellipse cx="300" cy="${WL}" rx="520" ry="70" fill="${C.glow}" opacity=".06"/>`;

  // far banks
  b += `<path d="M0 ${WL + 2}V${WL - 18}Q120 ${WL - 32} 240 ${WL - 22}T480 ${WL - 26}T720 ${WL - 30}T960 ${WL - 40}T1280 ${WL - 32}V${WL + 2}Z" fill="#101d42"/>`;
  b += `<path d="${forestPath({ x0: -20, x1: 760, by: WL + 2, hMin: 12, hMax: 26, gap: 12, seed: 4, oakShare: 0.3 })}" fill="#0d1a3d"/>`;
  b += `<path d="${forestPath({ x0: 740, x1: 1300, by: WL + 2, hMin: 34, hMax: 98, gap: 15, seed: 5, oakShare: 0.3 })}" fill="#0c1838"/>`;
  b += `<path d="${forestPath({ x0: 880, x1: 1300, by: WL + 4, hMin: 52, hMax: 120, gap: 26, seed: 6, oakShare: 0.25 })}" fill="#070f26"/>`;
  b += `<rect y="${WL - 46}" width="${W}" height="50" fill="url(#hzh)"/>`;

  // the river
  b += `<rect y="${WL}" width="${W}" height="${H - WL}" fill="url(#rvh)"/><path d="M0 ${WL + 0.5}H${W}" stroke="#7f96d4" stroke-opacity=".3" stroke-width="1.2"/>`;
  const rr = rng(12);
  for (let i = 0; i < 12; i++) {
    const x = 60 + rr() * 1160;
    const y = WL + 6 + rr() * (H - WL - 10);
    b += `<path d="M${r1(x)} ${r1(y)}h${r1(16 + rr() * 34)}" stroke="#9db8ff" stroke-opacity="${r1(0.14 + rr() * 0.16)}" stroke-width="1.3" stroke-linecap="round" class="o shim" style="animation-duration:${r1(3 + rr() * 4)}s;animation-delay:-${r1(rr() * 5)}s"/>`;
  }

  // six lanterns, each drifting left to right on its own keyframes, wrapping around
  const LANT = [
    { x0: 150, wy: 214, s: 0.74, v: 13 },
    { x0: 610, wy: 216, s: 0.78, v: 13.5 },
    { x0: 1035, wy: 220, s: 0.86, v: 16 },
    { x0: 830, wy: 226, s: 0.94, v: 19 },
    { x0: 385, wy: 230, s: 1.0, v: 22 },
    { x0: 1215, wy: 234, s: 1.06, v: 25 },
  ];
  LANT.forEach((l, i) => {
    const span = W + 200; // from -100 to W+100
    const T = span / l.v;
    const f = ((W + 100 - l.x0) / span) * 100;
    const f1 = f.toFixed(3);
    const f2 = (f + 0.01).toFixed(3);
    css += `@keyframes dl${i}{0%{transform:translateX(0)}${f1}%{transform:translateX(${W + 100 - l.x0}px)}${f2}%{transform:translateX(${-100 - l.x0}px)}100%{transform:translateX(0)}}`;
    const cy = l.wy - 26 * l.s;
    b += `<g transform="translate(${l.x0} ${r1(cy)})"><g style="animation:dl${i} ${r1(T)}s linear infinite"><g transform="scale(${l.s})">`;
    // the lantern's light on the water, its broken reflection, and a ripple at the waterline
    b += `<ellipse cx="0" cy="30" rx="54" ry="9" fill="url(#lg)" opacity=".55" class="o pulse" style="animation-duration:${r1(5 + i * 0.4)}s"/>`;
    b += `<ellipse cx="0" cy="44" rx="11" ry="17" fill="url(#refl)" class="o shim" style="animation-duration:${r1(2.8 + i * 0.35)}s"/>`;
    b += `<path d="M-9 35h18M-13 43h26M-8 51h16" stroke="#ffc274" stroke-width="2.4" stroke-linecap="round" stroke-opacity=".42" class="o shim" style="animation-duration:${r1(3.2 + i * 0.3)}s;animation-delay:-${r1(i * 0.8)}s"/>`;
    b += `<ellipse cx="0" cy="29" rx="24" ry="3.8" fill="none" stroke="#ffd9a0" stroke-opacity=".5" stroke-width="1.4" class="o ripple" style="animation-duration:${r1(3.4 + i * 0.3)}s;animation-delay:-${r1(i * 0.9)}s"/>`;
    b += `<g class="bob" style="animation-duration:${r1(3.6 + i * 0.55)}s;animation-delay:-${r1(i * 0.7)}s"><g class="ob rock" style="animation-duration:${r1(4.6 + i * 0.6)}s;animation-delay:-${r1(i * 1.3)}s">${lantern({ glow: 1.05, seed: i + 3 })}</g></g>`;
    b += `</g></g></g>`;
  });

  // a pair of low mist wisps over the water
  b += `<ellipse cx="420" cy="${WL + 4}" rx="190" ry="9" fill="#cfe0ff" opacity=".07" class="mist" style="animation-duration:19s"/><ellipse cx="900" cy="${WL + 6}" rx="220" ry="10" fill="#cfe0ff" opacity=".06" class="mist" style="animation-duration:24s;animation-delay:-9s"/>`;

  // reeds on both banks, near the viewer
  b += reed(26, H + 2, 54, 10, 1, '#04070f') + reed(48, H + 4, 42, -8, 2, '#060a14') + reed(78, H + 2, 60, 14, 3, '#04070f');
  b += reed(1190, H + 3, 68, -12, 4, '#04070f') + reed(1222, H + 2, 50, 9, 5, '#060a14') + reed(1252, H + 4, 72, -14, 6, '#04070f');

  // fireflies
  const ff = fireflies({ n: 9, box: [60, 90, 1240, 225], seed: 41, scale: 0.9, prefix: 'hf' });
  css += ff.css;
  b += ff.body;

  // title block, over everything, at the same place as in every other panel
  b += heading({ eyebrow: '04 / PROJECTS', title: 'Things I have built', sub: 'AI platforms and agents, drifting past like lanterns on the river.' });
  b += pn.close;

  return doc({
    w: W,
    h: H,
    title: 'Projects: things I have built',
    desc: '04 / PROJECTS. Things I have built. AI platforms and agents, drifting past like lanterns on the river. A night river with six paper lanterns drifting slowly past reeds and fireflies.',
    defs,
    css,
    body: b,
  });
}

// ---- medallions: one tiny moving emblem per project --------------------------------
const MOTIF_CSS = `
@keyframes rock{0%{transform:rotate(-3.2deg)}100%{transform:rotate(3.2deg)}}
.rock{animation:rock 5.4s ease-in-out infinite alternate}
@keyframes lbob{0%{transform:translateY(0)}100%{transform:translateY(-2px)}}
.lbob{animation:lbob 4.6s ease-in-out infinite alternate}
@keyframes wob{0%{transform:translateX(calc(var(--a,2px)*-1))}100%{transform:translateX(var(--a,2px))}}
.wob{animation:wob 3.4s ease-in-out infinite alternate}
@keyframes draw{0%,50%{stroke-dashoffset:0;opacity:1}62%{stroke-dashoffset:0;opacity:0}63%{stroke-dashoffset:100;opacity:1}100%{stroke-dashoffset:0;opacity:1}}
.draw{stroke-dasharray:100;animation:draw 7s ease-in-out infinite}
@keyframes scan{0%{transform:translateY(-12px);opacity:0}12%{opacity:1}88%{opacity:1}100%{transform:translateY(17px);opacity:0}}
.scan{animation:scan 4.6s ease-in-out infinite}
@keyframes nudge{0%{transform:translateX(0)}100%{transform:translateX(6px)}}
.nudge{animation:nudge 2.2s ease-in-out infinite alternate}
@keyframes topsweep{0%,12%{transform:translateX(-260px)}88%,100%{transform:translateX(700px)}}
.topsweep{animation:topsweep 11s ease-in-out infinite}
@keyframes pillring{0%{transform:scale(1);opacity:.7}100%{transform:scale(1.16,1.5);opacity:0}}
.pillring{animation:pillring 3.2s ease-out infinite}
`;

const MOTIFS = {
  legal: () => `
<path d="M0 -17V16M-10 16H10" stroke="${ST}" stroke-width="1.8" stroke-linecap="round" fill="none"/>
<circle cy="-18" r="2.4" fill="${C.amber}"/>
<g class="ot hang" style="animation-duration:6s">
<path d="M-18 -14H18" stroke="${ST}" stroke-width="1.8" stroke-linecap="round" fill="none"/>
<path d="M-18 -14L-24 -2M-18 -14L-12 -2M18 -14L12 -2M18 -14L24 -2" stroke="${ST}" stroke-opacity=".7" stroke-width="1.1" fill="none"/>
<path d="M-26 -2Q-18 7 -10 -2ZM10 -2Q18 7 26 -2Z" fill="${C.amber}" fill-opacity=".9" stroke="${C.amber}" stroke-width="1.2" stroke-linejoin="round"/>
</g>`,
  watermelon: () => `
<g class="o orbit" style="animation-duration:18s"><circle r="23" fill="none" stroke="${C.amber}" stroke-opacity=".45" stroke-width="1.2" stroke-dasharray="3 5"/><circle cx="23" r="3" fill="${C.amber}"/><circle cx="-23" r="3" fill="${C.amber}" opacity=".7"/></g>
<path d="M-13 -5H13A13 13 0 0 1 -13 -5Z" fill="#f0556a"/>
<path d="M13 -5A13 13 0 0 1 -13 -5" fill="none" stroke="#7bd66a" stroke-width="3" stroke-linecap="round"/>
<path d="M-13 -5H13" stroke="#f4efe4" stroke-width="1.4" stroke-linecap="round"/>
<g fill="#2a0d14"><ellipse cx="-6" cy="1" rx="1.2" ry="2" transform="rotate(-18 -6 1)"/><ellipse cx="0" cy="4" rx="1.2" ry="2"/><ellipse cx="6" cy="1" rx="1.2" ry="2" transform="rotate(18 6 1)"/><ellipse cx="-2" cy="-1.5" rx="1" ry="1.7"/></g>`,
  geni: () => `
<path d="M-20 -18V17H21" stroke="${ST}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
<path d="M-15 10L-8 3L-1 7L8 -5L15 -10" pathLength="100" class="draw" stroke="${C.amber}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
<path d="M15 -10L21 -15" stroke="${C.amber}" stroke-opacity=".7" stroke-width="1.6" stroke-linecap="round" stroke-dasharray="2 3" fill="none"/>
<circle cx="21" cy="-15" r="3.2" fill="${C.amber}" class="o pulse" style="animation-duration:2.6s"/>`,
  contractscan: () => `
<path d="M-13 -19H5L14 -10V19H-13Z" fill="#0a1330" stroke="${ST}" stroke-width="1.6" stroke-linejoin="round"/>
<path d="M5 -19V-10H14" fill="none" stroke="${ST}" stroke-width="1.4" stroke-linejoin="round"/>
<path d="M-8 -5H9M-8 1H9M-8 7H2M-8 13H8" stroke="${ST}" stroke-opacity=".6" stroke-width="1.5" stroke-linecap="round"/>
<rect x="-9.5" y="-2.5" width="20" height="7" rx="2" fill="${C.amber}" fill-opacity=".38" class="blink" style="animation-duration:4.2s"/>
<rect x="-16" y="-3" width="33" height="2.2" rx="1.1" fill="${C.amber}" class="scan"/>`,
  mexa: () => `
<g class="bob" style="animation-duration:5s"><g transform="rotate(-10)">
<rect x="-17" y="-17" width="34" height="34" rx="8" fill="#0a1330" stroke="${ST}" stroke-width="1.7"/>
<circle r="2.7" fill="${ST}"/>
<g class="tw" style="animation-duration:3.2s" fill="${C.amber}"><circle cx="-8" cy="-8" r="2.7"/><circle cx="8" cy="8" r="2.7"/></g>
<g class="tw" style="animation-duration:3.2s;animation-delay:-3.2s" fill="${C.amber}"><circle cx="8" cy="-8" r="2.7"/><circle cx="-8" cy="8" r="2.7"/></g>
</g></g>`,
  selfheal: () => `
<circle r="25" fill="none" stroke="${C.amber}" stroke-opacity=".28" stroke-width="1.2"/>
<path d="M-21 4H-12L-8 -5L-2 12L3 -8L7 4H21" pathLength="100" class="draw" stroke="${C.amber}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
<path d="M0 -21v9M-4.5 -16.5h9" stroke="${ST}" stroke-width="2" stroke-linecap="round" class="o pulse" style="animation-duration:3.4s"/>`,
  more: () => {
    let t = '';
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const k = r * 3 + c;
        t += `<rect x="${-17 + c * 13}" y="${-17 + r * 13}" width="9" height="9" rx="2.4" fill="${k % 2 ? ST : C.amber}" class="tw" style="animation-duration:${r1(3 + (k % 4) * 0.6)}s;animation-delay:-${r1(k * 0.7)}s"/>`;
      }
    }
    return t;
  },
};

// ---- the guide as a dark silhouette with a warm rim ----------------------------------
// Drawn twice: first every shape in the rim colour with a stroke around it, then the same
// shapes in night-navy on top, so only the outer edge of the whole figure glows. The
// same shapes as lib.guide() (wave pose, facing right; `flip` turns him to face left).
function guideSilhouette({ flip = false } = {}) {
  const shapes = (fill, stroke, add, arm) => `<g fill="${fill}" stroke="${stroke}" stroke-width="${add}" stroke-linejoin="round" stroke-linecap="round">
<rect x="-30" y="-70" width="17" height="36" rx="6"/>
<path d="M-16 -70Q-20 -50 -14 -30L16 -30Q22 -50 14 -70Q0 -76 -16 -70Z"/>
<rect x="-14" y="-33" width="30" height="5" rx="2"/>
<rect x="-11" y="-30" width="9" height="34" rx="3"/><rect x="2" y="-30" width="9" height="34" rx="3"/>
<path d="M-14 4h11l4 5h-15Z M3 4h12l5 5h-17Z"/>
<path d="M-2 -58Q6 -42 4 -30" fill="none" stroke-width="${9 + add}"/><circle cx="4" cy="-27" r="4.6"/>
<path d="M-19 -70Q-26 -86 -15 -99Q-6 -90 6 -97Q-1 -80 8 -69Z"/>
<rect x="-5" y="-78" width="10" height="11" rx="4"/>
<circle cx="0" cy="-86" r="15"/>
<path d="M-15 -90Q-14 -108 2 -108Q16 -107 15 -90Q4 -96 -15 -90Z"/>
<path d="M8 -92Q26 -93 27 -88Q18 -86 8 -87Z"/>
<g class="wave" style="transform-box:view-box;transform-origin:2px -60px">
<path d="M2 -60Q30 -62 44 -88" fill="none" stroke-width="${9 + add}"/>
<circle cx="45" cy="-95" r="5.6"/>
<path d="M41 -100l-1 -6M45 -101l0 -7M49 -100l1 -6" fill="none" stroke-width="${2.4 + add}"/>
</g>
</g>`;
  return `<g${flip ? ' transform="scale(-1 1)"' : ''}>${shapes('#ffb45e', '#ffb45e', 3.2)}${shapes('#0a1330', '#0a1330', 0.5)}</g>`;
}

// ---- a card ---------------------------------------------------------------------------
const CW = 640;
const CH = 376;
const BANK = 306; // where the dark river bank starts

function card(p, idx) {
  const W = CW;
  const H = CH;
  const special = !!p.special;
  const id = 'c' + p.id;
  const pn = panel({ w: W, h: H, id, seed: 40 + idx * 7, starCount: 0 });

  // geometry of the lantern pool at the top left
  const LX = 72; // lantern centre x
  const POOL_WL = 100; // waterline of the strip
  const LS = 1.15; // lantern scale
  const KR = 0.8; // how much the reflection is squashed
  const LY = POOL_WL + 3 - 27 * LS; // lantern centre y, its base just touching the water
  const RC = POOL_WL + KR * LS * 27; // reflection origin (flipped lantern)
  const NB = 6; // slices of the reflection that wobble separately
  const SH = 8.5;

  const clips = Array.from({ length: NB }, (_, k) => `<clipPath id="rb${k}"><rect x="0" y="${r1(POOL_WL + k * SH)}" width="150" height="${SH + 0.4}"/></clipPath>`).join('');
  const defs = `${pn.defs}
<linearGradient id="wb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a2b58"/><stop offset=".4" stop-color="#0b1633"/><stop offset="1" stop-color="#050a1a"/></linearGradient>
<linearGradient id="swg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffb45e" stop-opacity="0"/><stop offset=".5" stop-color="#ffe2b0"/><stop offset="1" stop-color="#ffb45e" stop-opacity="0"/></linearGradient>
<radialGradient id="swl" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffb45e" stop-opacity=".34"/><stop offset="1" stop-color="#ffb45e" stop-opacity="0"/></radialGradient>
<linearGradient id="pill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd08a"/><stop offset="1" stop-color="#ff9a3d"/></linearGradient>
<radialGradient id="corona" cx="50%" cy="50%" r="50%"><stop offset=".5" stop-color="#ffb45e" stop-opacity="0"/><stop offset=".6" stop-color="#ffb45e" stop-opacity=".42"/><stop offset=".78" stop-color="#ff8a30" stop-opacity=".14"/><stop offset="1" stop-color="#ff8a30" stop-opacity="0"/></radialGradient>
<linearGradient id="poolg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34508f" stop-opacity=".95"/><stop offset=".45" stop-color="#14224b" stop-opacity=".8"/><stop offset="1" stop-color="#0b1633" stop-opacity="0"/></linearGradient>
<linearGradient id="poolfade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".3" stop-color="#fff"/><stop offset=".7" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<mask id="poolm" maskUnits="userSpaceOnUse" x="6" y="${POOL_WL - 6}" width="132" height="64"><rect x="6" y="${POOL_WL - 6}" width="132" height="64" fill="url(#poolfade)"/></mask>
<g id="lrefl"><path d="M-15 -21Q-21 0-15 21L15 21Q21 0 15 -21Z" fill="url(#paper)"/><rect x="-11" y="-27" width="22" height="7" rx="2" fill="#8a5a34"/><ellipse cx="0" cy="23" rx="19" ry="4" fill="#8a5a34"/><ellipse cy="2" rx="4.2" ry="9" fill="#fff8e0" opacity=".9"/></g>
${clips}`;

  let css = MOTIF_CSS;
  let b = pn.open;
  const rand = rng(300 + idx);

  // ---- text measurements, used to lay out and to keep stars off the words
  const TITLE_X = 142;
  const titleW = Math.round(tw(p.title, 38, 'serif'));
  const metaW = tw(p.meta, 20);
  const tech = p.tech && !p.points.includes(p.tech) ? p.tech : '';
  const techW = monoW(tech, 15);
  const host = hostLabel(p.href);
  const hostW = monoW(host, 15);
  const ctaW = Math.round(tw(p.cta, 20, 'sans', true));

  const BX = 45; // bullet dot
  const TX = 64; // bullet text
  const right = special ? 424 : 600;
  const maxW = (right - TX) * 0.87; // keeps 13 percent of slack in the line
  const items = p.points.map((pt) => wrapW(pt, maxW, 21));

  // ---- sky: stars only where no text sits
  const avoid = [
    [TITLE_X - 18, 36, 546, 134], // the whole title block
    [30, 150, right + 4, BANK], // the points
    [20, 36, 124, 154], // the lantern pool
  ];
  const nStars = Math.round((W * H) / 9000);
  b += sky({ w: W, yMax: BANK - 40, count: nStars, seed: 11 + idx * 3, avoid });
  b += `<ellipse cx="90" cy="${BANK - 20}" rx="330" ry="130" fill="url(#lg)" opacity=".13"/>`;

  // ---- the moon portal of the walk card sits behind the trees
  const MX = 508;
  const MY = 208;
  const MR = 66;
  if (special) {
    b += `<g>
<circle cx="${MX}" cy="${MY}" r="116" fill="url(#corona)" class="o pulse" style="animation-duration:6s"/>
<circle cx="${MX}" cy="${MY}" r="${MR + 14}" fill="none" stroke="#cfe0ff" stroke-opacity=".5" stroke-width="1.4" class="o ripple" style="animation-duration:5s"/>
<circle cx="${MX}" cy="${MY}" r="${MR + 14}" fill="none" stroke="#cfe0ff" stroke-opacity=".5" stroke-width="1.4" class="o ripple" style="animation-duration:5s;animation-delay:-2.5s"/>
</g>`;
    b += moon(MX, MY, MR);
  }

  // ---- forest banks and the dark river along the bottom
  b += `<path d="${forestPath({ x0: -20, x1: 660, by: BANK, hMin: 14, hMax: 34, gap: 13, seed: 60 + idx, oakShare: 0.3 })}" fill="#0c1838"/>`;
  b += `<path d="${forestPath({ x0: -20, x1: 660, by: BANK + 2, hMin: 8, hMax: 20, gap: 17, seed: 80 + idx, oakShare: 0.2 })}" fill="#060d22"/>`;
  b += `<rect y="${BANK}" width="${W}" height="${H - BANK}" fill="url(#wb)"/>`;
  b += `<path d="M0 ${BANK + 0.5}H${W}" stroke="#4a63a8" stroke-opacity=".32" stroke-width="1.2"/>`;
  // ripples on the water, kept clear of the words (the call to action and the host sit at the left)
  for (const [dy, x0, x1] of [[9, 300, 580], [22, 360, 590], [39, 330, 590]]) {
    const x = x0 + rand() * (x1 - x0 - 80);
    b += `<path d="M${r1(x)} ${BANK + dy}h${r1(30 + rand() * 46)}" stroke="#9db8ff" stroke-opacity="${r1(0.16 + rand() * 0.14)}" stroke-width="1.4" stroke-linecap="round" class="o shim" style="animation-duration:${r1(3 + rand() * 3)}s;animation-delay:-${r1(rand() * 4)}s"/>`;
  }
  if (special) {
    // the moon's glitter on the river, running down from where it rises
    for (let k = 0; k < 5; k++) {
      const wlen = 78 - k * 11;
      b += `<path d="M${r1(MX - wlen / 2)} ${BANK + 10 + k * 13}h${wlen}" stroke="#cfe0ff" stroke-opacity="${r1(0.42 - k * 0.06)}" stroke-width="2" stroke-linecap="round" class="o shim" style="animation-duration:${r1(3.2 + k * 0.5)}s;animation-delay:-${r1(k * 0.8)}s"/>`;
    }
  }
  // the call to action's warm light on the water
  b += `<ellipse cx="${special ? 130 : 128}" cy="${BANK + (special ? 34 : 30)}" rx="150" ry="${special ? 30 : 26}" fill="url(#lg)" opacity=".5" class="o pulse" style="animation-duration:5.5s"/>`;

  // ---- top left: a lantern floating on a small strip of water
  b += `<g mask="url(#poolm)">
<rect x="6" y="${POOL_WL}" width="132" height="58" fill="url(#poolg)"/>
<path d="M6 ${POOL_WL + 0.5}H138" stroke="#9db8ff" stroke-opacity=".4" stroke-width="1.3"/>
<ellipse cx="${LX}" cy="${POOL_WL + 7}" rx="56" ry="10" fill="url(#lg)" opacity=".85" class="o pulse" style="animation-duration:4s"/>
<path d="M22 ${POOL_WL + 14}q6 -3.2 12 0t12 0M104 ${POOL_WL + 30}q6 -3.2 12 0t12 0" fill="none" stroke="#9db8ff" stroke-opacity=".34" stroke-width="1.3" stroke-linecap="round" class="o shim" style="animation-duration:4.1s"/>
<path d="M14 ${POOL_WL + 42}q6 -3.2 12 0t12 0M92 ${POOL_WL + 16}q6 -3.2 12 0t12 0" fill="none" stroke="#9db8ff" stroke-opacity=".28" stroke-width="1.3" stroke-linecap="round" class="o shim" style="animation-duration:3.3s;animation-delay:-1.4s"/>
</g>`;
  // the reflection: the lantern upside down, cut into slices that wobble sideways out of step
  for (let k = 0; k < NB; k++) {
    b += `<g clip-path="url(#rb${k})" opacity="${r1(0.62 - k * 0.095)}"><g class="wob" style="--a:${r1(1 + k * 0.55)}px;animation-duration:${r1(2.6 + k * 0.45)}s;animation-delay:-${r1(k * 0.7)}s"><use href="#lrefl" transform="translate(${LX} ${r1(RC)}) scale(${LS} ${r1(-KR * LS)})"/></g></g>`;
  }
  // two ripples spreading from the hull
  b += `<ellipse cx="${LX}" cy="${POOL_WL + 1.5}" rx="30" ry="4.6" fill="none" stroke="#ffd9a0" stroke-opacity=".6" stroke-width="1.4" class="o ripple" style="animation-duration:3.8s"/>`;
  b += `<ellipse cx="${LX}" cy="${POOL_WL + 1.5}" rx="30" ry="4.6" fill="none" stroke="#ffd9a0" stroke-opacity=".6" stroke-width="1.4" class="o ripple" style="animation-duration:3.8s;animation-delay:-1.9s"/>`;
  // the lantern itself, bobbing a little on the surface
  b += `<circle cx="${LX}" cy="${r1(LY)}" r="${r1(60 * LS)}" fill="url(#lg)" class="o flick" style="animation-duration:${r1(3 + (idx % 4) * 0.4)}s"/>`;
  const lan = lantern({ glow: 0, seed: idx + 2 }).replace(/<circle r="0"[^>]*\/>/, '');
  b += `<g transform="translate(${LX} ${r1(LY)}) scale(${LS})"><g class="lbob" style="animation-duration:${r1(4.2 + (idx % 3) * 0.6)}s"><g class="ob rock" style="animation-duration:${r1(5.2 + (idx % 4) * 0.5)}s">${lan}</g></g></g>`;

  // ---- title, meta, tech
  const TL = `textLength="${titleW}" lengthAdjust="spacingAndGlyphs"`;
  b += `<text x="${TITLE_X + 2}" y="72" font-family="${SERIF}" font-size="38" fill="#02040b" opacity=".6" ${TL}>${esc(p.title)}</text>`;
  b += `<text x="${TITLE_X}" y="70" font-family="${SERIF}" font-size="38" fill="${C.cream}" ${TL}>${esc(p.title)}</text>`;
  b += `<text x="${TITLE_X + 1}" y="99" font-family="${SANS}" font-size="20" letter-spacing=".3" fill="${C.amber}">${esc(p.meta)}</text>`;
  if (tech) b += `<text x="${TITLE_X + 1}" y="127" font-family="${MONO}" font-size="15" fill="${LABEL}" textLength="${r1(techW)}" lengthAdjust="spacingAndGlyphs">${esc(tech)}</text>`;

  // ---- medallion, top right (the walk card has the moon instead)
  if (!special) {
    b += `<g transform="translate(594 68)">
<circle r="31" fill="#0a1330" fill-opacity=".78" stroke="#4a63a8" stroke-opacity=".75" stroke-width="1.3"/>
<g class="o orbit" style="animation-duration:70s"><circle r="36" fill="none" stroke="${C.amber}" stroke-opacity=".42" stroke-width="1.4" stroke-dasharray="2 7" stroke-linecap="round"/></g>
<g transform="scale(1.1)">${MOTIFS[p.id]()}</g>
</g>`;
  }

  // ---- fireflies (behind the words)
  const boxes = special ? [[372, 110, 440, 190], [560, 100, 620, 170], [572, 200, 620, 280]] : [[440, 150, 520, 230], [530, 190, 610, 270], [450, 250, 540, 296]];
  boxes.forEach((box, k) => {
    const ff = fireflies({ n: 1, box, seed: 70 + idx * 5 + k, scale: 0.8, prefix: `f${k}` });
    css += ff.css;
    b += ff.body;
  });

  // ---- points with ember bullets, centred in the space between header and bank
  const LH = 27;
  const itemH = (n) => (n - 1) * LH + 20;
  const sum = items.reduce((a, l) => a + itemH(l.length), 0);
  const regionTop = 160;
  const regionBot = BANK - 10;
  const gap = Math.min(30, (regionBot - regionTop - sum) / 2);
  if (gap < 12) throw new Error(`${p.id}: points run into the footer`);
  let t = regionTop + (regionBot - regionTop - (sum + 2 * gap)) / 2;
  items.forEach((lines, i) => {
    const y = t + 16;
    b += `<circle cx="${BX}" cy="${r1(y - 7)}" r="13" fill="url(#lg)" class="o flick" style="animation-duration:${r1(3 + i * 0.7)}s;animation-delay:-${r1(i * 1.1)}s"/><circle cx="${BX}" cy="${r1(y - 7)}" r="4" fill="${C.amber2}"/><circle cx="${BX}" cy="${r1(y - 7)}" r="1.7" fill="#fff0cc"/>`;
    b += textLines(lines, { x: TX, y, size: 21, lh: LH / 21, fill: BODY });
    t += itemH(lines.length) + gap;
  });

  // ---- footer: the call to action, then where it goes
  if (special) {
    // an invitation: the guide waves from in front of the moon, and a glowing amber pill
    b += `<ellipse cx="${MX}" cy="${BANK + 1}" rx="46" ry="6" fill="#050a1a" opacity=".8"/>`;
    b += `<g transform="translate(${MX} ${BANK - 3}) scale(1.28)">${guideSilhouette({ flip: true })}</g>`;
    const ph = 42;
    const pw = ctaW + 86;
    const px = 40;
    const py = BANK + 20;
    b += `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="${ph / 2}" fill="none" stroke="${C.amber}" stroke-width="1.6" class="o pillring"/>`;
    b += `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="${ph / 2}" fill="url(#pill)"/>`;
    b += `<rect x="${px + 3}" y="${py + 2.5}" width="${pw - 6}" height="${ph / 2 - 3}" rx="${ph / 4}" fill="#fff4d8" opacity=".28"/>`;
    b += `<text x="${px + 28}" y="${py + 28}" font-family="${SANS}" font-size="20" font-weight="700" letter-spacing=".3" fill="#2b1507" textLength="${ctaW}" lengthAdjust="spacingAndGlyphs">${esc(p.cta)}</text>`;
    b += `<text x="${px + 28 + ctaW + 14}" y="${py + 29}" font-family="${SANS}" font-size="22" font-weight="700" fill="#2b1507" class="nudge">${ARROW}</text>`;
  } else {
    b += `<text x="40" y="${BANK + 31}" font-family="${SANS}" font-size="20" font-weight="700" letter-spacing=".3" fill="${C.amber}" textLength="${ctaW}" lengthAdjust="spacingAndGlyphs">${esc(p.cta)}</text>`;
    b += `<text x="${40 + ctaW + 12}" y="${BANK + 32}" font-family="${SANS}" font-size="22" font-weight="700" fill="${C.amber}" class="nudge">${ARROW}</text>`;
    b += `<text x="40" y="${BANK + 55}" font-family="${MONO}" font-size="15" fill="${LABEL}" textLength="${r1(hostW)}" lengthAdjust="spacingAndGlyphs">${esc(host)}</text>`;
  }

  // ---- the amber light sweeping along the top edge
  b += `<g class="topsweep" style="animation-delay:-${r1(idx * 1.3)}s"><ellipse cx="110" cy="0" rx="130" ry="22" fill="url(#swl)"/><rect x="0" y="0" width="220" height="3" fill="url(#swg)"/></g>`;
  b += pn.close;

  const desc = `${p.title}. ${p.meta}. ${p.points.join('. ')}.${p.tech ? ' ' + p.tech + '.' : ''} ${p.cta}, ${host}.`;
  return doc({ w: W, h: H, title: `${p.title}, ${p.meta}`, desc, defs, css, body: b });
}

export default function build() {
  const out = { 'projects-head.svg': head() };
  PROJECTS.forEach((p, i) => {
    out[`project-${p.id}.svg`] = card(p, i);
  });
  return out;
}
