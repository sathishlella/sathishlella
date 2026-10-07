// Section 03: the projects header (a dark river with six paper lanterns drifting
// past) and one 640 x 340 night card per project. Every card is the same family:
// a floating lantern over a strip of water at the top left, serif title, three
// ember-bulleted points, a dark river bank along the bottom with the tech line
// and the call to action, an amber light sweeping the top edge, and a small
// medallion at the top right that moves in a way that suits the project.
import { C, SERIF, SANS, MONO, rng, r1, doc, moon, stars, forestPath, lantern, fireflies, heading, wrap, textLines, panel, guide, esc } from './lib.mjs';
import { PROJECTS } from './content.mjs';

const BODY = '#d3daec';
const ST = '#e4eaf8';
const ARROW = '→';

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

function hostLabel(href) {
  try {
    const u = new URL(href);
    const host = u.host.replace(/^www\./, '');
    if (host === 'github.com') return host + '/' + u.pathname.split('/').filter(Boolean)[0];
    return host;
  } catch {
    return '';
  }
}

// ---- projects-head ---------------------------------------------------------------
function head() {
  const W = 1280;
  const H = 230;
  const WL = 186; // waterline
  const pn = panel({ w: W, h: H, id: 'ph', seed: 7, starCount: 90 });
  const defs = `${pn.defs}
<linearGradient id="rvh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a4f86"/><stop offset=".22" stop-color="#1b2d5c"/><stop offset="1" stop-color="#050b1c"/></linearGradient>
<linearGradient id="hzh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5f74a8" stop-opacity="0"/><stop offset="1" stop-color="#5f74a8" stop-opacity=".34"/></linearGradient>
<linearGradient id="strk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b8ccff" stop-opacity=".5"/><stop offset="1" stop-color="#b8ccff" stop-opacity="0"/></linearGradient>`;

  let css = `
@keyframes rock{0%{transform:rotate(-3.2deg)}100%{transform:rotate(3.2deg)}}
.rock{animation:rock 5.4s ease-in-out infinite alternate}
`;
  let b = pn.open;

  // sky: a low warm haze where the far bank meets the sky, then the moon
  b += `<ellipse cx="300" cy="${WL}" rx="520" ry="70" fill="${C.glow}" opacity=".06"/>`;
  b += moon(1130, 58, 24);

  // far banks
  b += `<path d="M0 ${WL + 2}V168Q120 154 240 164T480 160T720 156T960 146T1280 154V${WL + 2}Z" fill="#101d42"/>`;
  b += `<path d="${forestPath({ x0: -20, x1: 760, by: WL + 2, hMin: 12, hMax: 26, gap: 12, seed: 4, oakShare: 0.3 })}" fill="#0d1a3d"/>`;
  b += `<path d="${forestPath({ x0: 740, x1: 1300, by: WL + 2, hMin: 34, hMax: 98, gap: 15, seed: 5, oakShare: 0.3 })}" fill="#0c1838"/>`;
  b += `<path d="${forestPath({ x0: 880, x1: 1300, by: WL + 4, hMin: 52, hMax: 120, gap: 26, seed: 6, oakShare: 0.25 })}" fill="#070f26"/>`;
  b += `<rect y="${WL - 46}" width="${W}" height="50" fill="url(#hzh)"/>`;

  // the river, with a moon glitter streak
  b += `<rect y="${WL}" width="${W}" height="${H - WL}" fill="url(#rvh)"/><path d="M0 ${WL + 0.5}H${W}" stroke="#7f96d4" stroke-opacity=".3" stroke-width="1.2"/>`;
  b += `<path d="M1100 ${WL}L1160 ${WL}L1196 ${H}H1064Z" fill="url(#strk)" opacity=".7" class="o shim" style="animation-duration:6s"/>`;
  const rr = rng(12);
  for (let i = 0; i < 12; i++) {
    const x = 60 + rr() * 1160;
    const y = WL + 6 + rr() * (H - WL - 10);
    b += `<path d="M${r1(x)} ${r1(y)}h${r1(16 + rr() * 34)}" stroke="#9db8ff" stroke-opacity="${r1(0.14 + rr() * 0.16)}" stroke-width="1.3" stroke-linecap="round" class="o shim" style="animation-duration:${r1(3 + rr() * 4)}s;animation-delay:-${r1(rr() * 5)}s"/>`;
  }

  // six lanterns, each drifting left to right on its own keyframes, wrapping around
  const LANT = [
    { x0: 150, wy: 196, s: 0.74, v: 13 },
    { x0: 610, wy: 197, s: 0.78, v: 13.5 },
    { x0: 1035, wy: 200, s: 0.86, v: 16 },
    { x0: 830, wy: 204, s: 0.94, v: 19 },
    { x0: 385, wy: 207, s: 1.0, v: 22 },
    { x0: 1215, wy: 210, s: 1.06, v: 25 },
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
  b += reed(26, H + 2, 50, 10, 1, '#04070f') + reed(48, H + 4, 40, -8, 2, '#060a14') + reed(78, H + 2, 56, 14, 3, '#04070f');
  b += reed(1190, H + 3, 64, -12, 4, '#04070f') + reed(1222, H + 2, 48, 9, 5, '#060a14') + reed(1252, H + 4, 68, -14, 6, '#04070f');

  // fireflies
  const ff = fireflies({ n: 9, box: [60, 90, 1240, 205], seed: 41, scale: 0.9, prefix: 'hf' });
  css += ff.css;
  b += ff.body;

  // title block, over everything
  b += heading({ eyebrow: '03 / PROJECTS', title: 'Things I have built', sub: 'AI platforms and agents, drifting past like lanterns on the river.', x: 64, y: 52 });
  b += pn.close;

  return doc({
    w: W,
    h: H,
    title: 'Projects: things I have built',
    desc: '03 / PROJECTS. Things I have built. AI platforms and agents, drifting past like lanterns on the river. A night river with six paper lanterns drifting slowly past reeds and fireflies.',
    defs,
    css,
    body: b,
  });
}

// ---- medallions: one tiny moving emblem per project --------------------------------
const MOTIF_CSS = `
@keyframes rock{0%{transform:rotate(-3.2deg)}100%{transform:rotate(3.2deg)}}
.rock{animation:rock 5.4s ease-in-out infinite alternate}
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

// ---- a card ---------------------------------------------------------------------------
function card(p, idx) {
  const W = 640;
  const H = 340;
  const BANK = 268;
  const id = 'c' + p.id;
  const special = !!p.special;
  const pn = panel({ w: W, h: H, id, seed: 40 + idx * 7, starCount: 0 });
  const defs = `${pn.defs}
<linearGradient id="wb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a2b58"/><stop offset=".4" stop-color="#0b1633"/><stop offset="1" stop-color="#050a1a"/></linearGradient>
<linearGradient id="swg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffb45e" stop-opacity="0"/><stop offset=".5" stop-color="#ffe2b0"/><stop offset="1" stop-color="#ffb45e" stop-opacity="0"/></linearGradient>
<radialGradient id="swl" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffb45e" stop-opacity=".34"/><stop offset="1" stop-color="#ffb45e" stop-opacity="0"/></radialGradient>
<linearGradient id="pill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd08a"/><stop offset="1" stop-color="#ff9a3d"/></linearGradient>
<linearGradient id="strip" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c2f5f"/><stop offset="1" stop-color="#07102a"/></linearGradient>
<radialGradient id="corona" cx="50%" cy="50%" r="50%"><stop offset=".5" stop-color="#ffb45e" stop-opacity="0"/><stop offset=".6" stop-color="#ffb45e" stop-opacity=".42"/><stop offset=".78" stop-color="#ff8a30" stop-opacity=".14"/><stop offset="1" stop-color="#ff8a30" stop-opacity="0"/></radialGradient>
<clipPath id="stripclip"><rect x="30" y="106" width="88" height="20" rx="10"/></clipPath>`;
  let css = MOTIF_CSS;
  let b = pn.open;
  const rand = rng(300 + idx);

  // stars only where no text sits: the top band and the right-hand side
  b += stars({ w: W, yMax: 30, count: 14, seed: 11 + idx });
  b += special ? stars({ w: 160, x0: 480, yMax: 62, count: 8, seed: 21 + idx }) : stars({ w: 40, x0: 600, yMax: 250, count: 7, seed: 21 + idx });
  b += `<ellipse cx="90" cy="300" rx="330" ry="130" fill="url(#lg)" opacity=".13"/>`;

  // a soft moon glow behind the medallion (the walk card has its own big moon)
  if (!special) b += `<ellipse cx="584" cy="72" rx="92" ry="92" fill="url(#moong)" class="o pulse" style="animation-duration:8s"/>`;

  // forest banks and the dark river along the bottom
  b += `<path d="${forestPath({ x0: -20, x1: 660, by: BANK, hMin: 16, hMax: 48, gap: 13, seed: 60 + idx, oakShare: 0.3 })}" fill="#0c1838"/>`;
  b += `<path d="${forestPath({ x0: -20, x1: 660, by: BANK + 2, hMin: 10, hMax: 26, gap: 17, seed: 80 + idx, oakShare: 0.2 })}" fill="#060d22"/>`;
  b += `<rect y="${BANK}" width="${W}" height="${H - BANK}" fill="url(#wb)"/>`;
  b += `<path d="M0 ${BANK + 0.5}H${W}" stroke="#4a63a8" stroke-opacity=".32" stroke-width="1.2"/>`;
  for (const y of [278, 286, 314, 324, 332]) {
    const x = 30 + rand() * 540;
    b += `<path d="M${r1(x)} ${y}h${r1(30 + rand() * 46)}" stroke="#9db8ff" stroke-opacity="${r1(0.14 + rand() * 0.14)}" stroke-width="1.4" stroke-linecap="round" class="o shim" style="animation-duration:${r1(3 + rand() * 3)}s;animation-delay:-${r1(rand() * 4)}s"/>`;
  }
  // the cta's warm light on the water
  b += `<ellipse cx="${special ? 500 : 496}" cy="${special ? 300 : 298}" rx="${special ? 160 : 132}" ry="${special ? 36 : 26}" fill="url(#lg)" opacity=".55" class="o pulse" style="animation-duration:5.5s"/>`;

  // ---- top left: the floating lantern over its strip of water
  b += `<rect x="30" y="106" width="88" height="20" rx="10" fill="url(#strip)"/>`;
  b += `<g clip-path="url(#stripclip)">
<ellipse cx="74" cy="116" rx="26" ry="7" fill="url(#lg)" opacity=".8" class="o pulse" style="animation-duration:4s"/>
<path d="M66 111h16" stroke="#ffc274" stroke-opacity=".75" stroke-width="2.4" stroke-linecap="round" class="o shim" style="animation-duration:2.6s"/>
<path d="M60 116h28" stroke="#ffc274" stroke-opacity=".6" stroke-width="2.4" stroke-linecap="round" class="o shim" style="animation-duration:3.1s;animation-delay:-1s"/>
<path d="M65 121h18" stroke="#ffc274" stroke-opacity=".45" stroke-width="2.4" stroke-linecap="round" class="o shim" style="animation-duration:3.7s;animation-delay:-2s"/>
<ellipse cx="74" cy="116" rx="22" ry="5" fill="none" stroke="#ffd9a0" stroke-opacity=".55" stroke-width="1.3" class="o ripple" style="animation-duration:3.6s"/>
<ellipse cx="74" cy="116" rx="22" ry="5" fill="none" stroke="#ffd9a0" stroke-opacity=".55" stroke-width="1.3" class="o ripple" style="animation-duration:3.6s;animation-delay:-1.8s"/>
<path d="M44 112h14M92 120h14" stroke="#9db8ff" stroke-opacity=".3" stroke-width="1.2" stroke-linecap="round" class="o shim" style="animation-duration:4s"/>
</g>`;
  b += `<g transform="translate(74 62) scale(1.1)"><g class="bob" style="animation-duration:${r1(4.4 + (idx % 3) * 0.7)}s"><g class="ob rock" style="animation-duration:${r1(5.2 + (idx % 4) * 0.5)}s">${lantern({ glow: 1, seed: idx + 2 })}</g></g></g>`;

  // ---- title and meta
  b += `<text x="142" y="72" font-family="${SERIF}" font-size="32" fill="#02040b" opacity=".6">${esc(p.title)}</text>`;
  b += `<text x="140" y="70" font-family="${SERIF}" font-size="32" fill="${C.cream}">${esc(p.title)}</text>`;
  b += `<text x="141" y="97" font-family="${SANS}" font-size="16" letter-spacing=".4" fill="${C.amber}">${esc(p.meta)}</text>`;

  // ---- medallion (not on the walk card)
  if (!special) {
    b += `<g transform="translate(584 72)">
<circle r="28" fill="#0a1330" fill-opacity=".72" stroke="#4a63a8" stroke-opacity=".7" stroke-width="1.2"/>
<g class="o orbit" style="animation-duration:70s"><circle r="32.5" fill="none" stroke="${C.amber}" stroke-opacity=".38" stroke-width="1.3" stroke-dasharray="2 7" stroke-linecap="round"/></g>
${MOTIFS[p.id]()}
</g>`;
  }

  // ---- points with ember bullets
  let y = 166;
  p.points.forEach((pt, i) => {
    const lines = wrap(pt, 536, 18);
    b += `<circle cx="45" cy="${y - 6}" r="12" fill="url(#lg)" class="o flick" style="animation-duration:${r1(3 + i * 0.7)}s;animation-delay:-${r1(i * 1.1)}s"/><circle cx="45" cy="${y - 6}" r="3.6" fill="${C.amber2}"/><circle cx="45" cy="${y - 6}" r="1.5" fill="#fff0cc"/>`;
    b += textLines(lines, { x: 62, y, size: 18, lh: 1.3, fill: BODY });
    y += (lines.length - 1) * 18 * 1.3 + 36;
  });
  if (y - 36 > 242) throw new Error(`${p.id}: points run into the footer`);

  // ---- fireflies
  const ff = fireflies({ n: special ? 6 : 4, box: special ? [380, 100, 620, 250] : [400, 110, 620, 250], seed: 70 + idx, scale: 0.8, prefix: 'f' });
  css += ff.css;
  b += ff.body;

  // ---- footer: tech (or the link's host) on the left, cta on the right
  const tech = p.tech && !p.points.includes(p.tech) ? p.tech : special ? '' : hostLabel(p.href);
  if (tech) b += `<text x="40" y="300" font-family="${MONO}" font-size="13" fill="#97a3c2">${esc(tech)}</text>`;
  if (special) {
    // an invitation: the big moon, the guide waving, a glowing pill
    b += `<g>
<circle cx="492" cy="152" r="118" fill="url(#corona)" class="o pulse" style="animation-duration:6s"/>
<circle cx="492" cy="152" r="80" fill="none" stroke="#cfe0ff" stroke-opacity=".5" stroke-width="1.4" class="o ripple" style="animation-duration:5s"/>
<circle cx="492" cy="152" r="80" fill="none" stroke="#cfe0ff" stroke-opacity=".5" stroke-width="1.4" class="o ripple" style="animation-duration:5s;animation-delay:-2.5s"/>
</g>`;
    b += moon(492, 152, 68);
    b += `<ellipse cx="492" cy="271" rx="58" ry="8" fill="#13224d"/><ellipse cx="492" cy="270" rx="58" ry="7" fill="none" stroke="#5f78bf" stroke-opacity=".5" stroke-width="1.1"/>`;
    b += `<g transform="translate(492 263) scale(1.15)">${guide({ pose: 'wave', flip: true })}</g>`;
    const pw = 206;
    const px = 600 - pw;
    b += `<rect x="${px}" y="282" width="${pw}" height="40" rx="20" fill="none" stroke="${C.amber}" stroke-width="1.6" class="o pillring"/>`;
    b += `<rect x="${px}" y="282" width="${pw}" height="40" rx="20" fill="url(#pill)"/>`;
    b += `<rect x="${px + 2}" y="284" width="${pw - 4}" height="16" rx="8" fill="#fff4d8" opacity=".28"/>`;
    b += `<text x="${px + 26}" y="308" font-family="${SANS}" font-size="18" font-weight="700" letter-spacing=".3" fill="#2b1507">${esc(p.cta)}</text>`;
    b += `<text x="${px + pw - 36}" y="309" font-family="${SANS}" font-size="21" font-weight="700" fill="#2b1507" class="nudge">${ARROW}</text>`;
  } else {
    b += `<text x="570" y="300" font-family="${SANS}" font-size="17" font-weight="600" letter-spacing=".3" text-anchor="end" fill="${C.amber}">${esc(p.cta)}</text>`;
    b += `<text x="594" y="301" font-family="${SANS}" font-size="20" font-weight="600" text-anchor="end" fill="${C.amber}" class="nudge">${ARROW}</text>`;
  }

  // ---- the amber light sweeping along the top edge
  b += `<g class="topsweep" style="animation-delay:-${r1(idx * 1.3)}s"><ellipse cx="110" cy="0" rx="130" ry="22" fill="url(#swl)"/><rect x="0" y="0" width="220" height="3" fill="url(#swg)"/></g>`;
  b += pn.close;

  const desc = `${p.title}. ${p.meta}. ${p.points.join('. ')}.${p.tech ? ' ' + p.tech + '.' : ''} ${p.cta}.`;
  return doc({ w: W, h: H, title: `${p.title}, ${p.meta}`, desc, defs, css, body: b });
}

export default function build() {
  const out = { 'projects-head.svg': head() };
  PROJECTS.forEach((p, i) => {
    out[`project-${p.id}.svg`] = card(p, i);
  });
  return out;
}
