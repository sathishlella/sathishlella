import { C, SERIF, rng, r1, esc, doc, moon, forestPath, lantern, fireflies, fern, guide, lampPost, wrap, textLines, heading, panel } from './lib.mjs';
import { ABOUT, PERSON } from './content.mjs';

const W = 1280;
const H = 540;

// ---- small local helpers ------------------------------------------------------

// A ground strip following a centre line of [x, y, halfWidth] points, smoothed
// with Catmull-Rom. Half widths are foreshortened vertically so a path that runs
// sideways across the picture reads as lying flat on the ground.
function strip(pts, steps = 9, squash = 0.5) {
  const cr = (a, b, c, d, t) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
  const s = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 0; k < steps; k++) s.push([0, 1, 2].map((j) => cr(p0[j], p1[j], p2[j], p3[j], k / steps)));
  }
  s.push(pts[pts.length - 1]);
  const L = [];
  const R = [];
  s.forEach((p, i) => {
    const a = s[Math.max(0, i - 1)];
    const b = s[Math.min(s.length - 1, i + 1)];
    const dx = b[0] - a[0];
    const dy = (b[1] - a[1]) / squash;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    L.push([p[0] + nx * p[2], p[1] + ny * p[2] * squash]);
    R.push([p[0] - nx * p[2], p[1] - ny * p[2] * squash]);
  });
  const all = [...L, ...R.reverse()];
  return 'M' + all.map((p) => `${r1(p[0])} ${r1(p[1])}`).join('L') + 'Z';
}

// a small clump of grass blades, base at the origin
function tuft(x, y, s, seed, color) {
  const rand = rng(seed);
  const n = 5 + Math.floor(rand() * 3);
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = -90 + (i - (n - 1) / 2) * 20 + (rand() - 0.5) * 10;
    const len = s * (0.65 + rand() * 0.55);
    const rad = (a * Math.PI) / 180;
    const ex = Math.cos(rad) * len;
    const ey = Math.sin(rad) * len;
    const nx = -Math.sin(rad) * 1.9;
    const ny = Math.cos(rad) * 1.9;
    d += `M${r1(-nx)} ${r1(-ny)}Q${r1(ex * 0.5 - nx)} ${r1(ey * 0.5 - ny)} ${r1(ex)} ${r1(ey)}Q${r1(ex * 0.5 + nx * 1.2)} ${r1(ey * 0.5 + ny * 1.2)} ${r1(nx)} ${r1(ny)}Z`;
  }
  return `<g transform="translate(${x} ${y})"><path class="ob swayf" style="animation-duration:${(4.5 + rand() * 3).toFixed(1)}s;animation-delay:-${(rand() * 4).toFixed(1)}s" d="${d}" fill="${color}"/></g>`;
}

// a rock with a moonlit top edge, flat base at the origin
function rock(x, y, w, h, seed) {
  const rand = rng(seed);
  const j = () => 0.88 + rand() * 0.24;
  const p1 = [-w * 0.98, -h * 0.55 * j()];
  const p2 = [-w * 0.4, -h * 1.0 * j()];
  const p3 = [w * 0.28, -h * 1.12 * j()];
  const p4 = [w * 0.82, -h * 0.55 * j()];
  const top = `M${r1(-w)} 0Q${r1(p1[0])} ${r1(p1[1])} ${r1(p2[0])} ${r1(p2[1])}Q${r1(p3[0])} ${r1(p3[1])} ${r1(p4[0])} ${r1(p4[1])}Q${r1(w * 1.05)} ${r1(-h * 0.2)} ${r1(w)} 0Z`;
  return `<g transform="translate(${x} ${y})"><ellipse cx="0" cy="2" rx="${r1(w * 1.15)}" ry="${r1(h * 0.28)}" fill="#02050e" opacity=".5"/><path d="${top}" fill="#0c1735"/><path d="M${r1(-w * 0.9)} ${r1(-h * 0.5)}Q${r1(p2[0])} ${r1(p2[1] - 1)} ${r1(p3[0])} ${r1(p3[1] - 1)}Q${r1(p4[0])} ${r1(p4[1] - 1)} ${r1(w * 0.9)} ${r1(-h * 0.4)}" fill="none" stroke="#5d78c0" stroke-opacity=".42" stroke-width="1.3" stroke-linecap="round"/><path d="M${r1(w * 0.1)} ${r1(-h * 0.3)}Q${r1(w * 0.5)} ${r1(-h * 0.2)} ${r1(w * 0.95)} ${r1(-h * 0.1)}" fill="none" stroke="#050a1c" stroke-opacity=".7" stroke-width="2"/></g>`;
}

// a wooden signpost with one arrow board; origin at the foot of the post. The
// board text has a fixed textLength so a wider fallback face cannot run off it.
function signpost(x, y, text, s = 1.2) {
  const size = 15.4;
  const tl = 132;
  return `<g transform="translate(${x} ${y}) scale(${s})">
<ellipse cx="0" cy="2" rx="30" ry="5" fill="#02050e" opacity=".55"/>
<path d="M-4.5 0V-108L0 -114L4.5 -108V0Z" fill="#3b2616"/>
<path d="M1 0V-108L4.5 -108V0Z" fill="#2a1a0e" opacity=".7"/>
<path d="M-90 -100H78L99 -81L78 -62H-90Z" fill="#6c4627" stroke="#2a190d" stroke-width="1.6" stroke-linejoin="round"/>
<path d="M-90 -100H78L82 -96H-90Z" fill="#9a6a3c" opacity=".55"/>
<path d="M-85 -91H74M-85 -71H76" stroke="#3d2614" stroke-opacity=".55" stroke-width="1" fill="none"/>
<circle cx="-81" cy="-81" r="1.7" fill="#d9b27a"/>
<text x="-8" y="-76" text-anchor="middle" font-family="${SERIF}" font-size="${size}" textLength="${tl}" lengthAdjust="spacingAndGlyphs" fill="#2a190d" opacity=".55" transform="translate(.8 1)">${esc(text)}</text>
<text x="-8" y="-76" text-anchor="middle" font-family="${SERIF}" font-size="${size}" textLength="${tl}" lengthAdjust="spacingAndGlyphs" fill="#ffe3b0">${esc(text)}</text>
</g>`;
}

// wrap to the fewest lines that fit maxW, then tighten the width so the lines come out even (no orphans)
function balanced(text, maxW, size) {
  const n = wrap(text, maxW, size).length;
  let lo = maxW * 0.4;
  let hi = maxW;
  for (let i = 0; i < 16; i++) {
    const mid = (lo + hi) / 2;
    if (wrap(text, mid, size).length <= n) hi = mid;
    else lo = mid;
  }
  return wrap(text, hi, size);
}

// Stars for a sky that has text in it: the same look as lib stars(), but each
// one is drawn only where ok(x, y) says the sky is free, so none lands on a word.
function skyStars({ count, seed, ok }) {
  const rand = rng(seed);
  const groups = [[], [], [], [], []];
  let n = 0;
  for (let guard = 0; n < count && guard < 40000; guard++) {
    const x = 8 + rand() * (W - 16);
    const y = 8 + rand() * 470;
    if (!ok(x, y)) continue;
    const mag = Math.pow(rand(), 3);
    const r = 0.55 + mag * 1.5;
    const tint = rand() < 0.2 ? '#ffe9c8' : rand() < 0.4 ? '#cfe0ff' : '#ffffff';
    groups[n % 5].push(`<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(r)}" fill="${tint}"/>`);
    n++;
  }
  return groups
    .map((g, i) => `<g class="tw" style="animation-duration:${(3 + i * 1.3).toFixed(1)}s;animation-delay:-${(i * 1.7).toFixed(1)}s">${g.join('')}</g>`)
    .join('');
}

// ---- the picture ----------------------------------------------------------------
export function about() {
  const pn = panel({ w: W, h: H, id: 'ab', seed: 9, starCount: 0 });
  const D = H - 460; // the scene was drawn for a 460 tall panel; D moves it down to the ground line

  // ---- text column: laid out first so the sky can keep clear of it ----------------
  const X = 64;
  const SLACK = 1.13; // spare width in every container, for fallback faces that run wide
  const boxes = []; // [x0, y0, x1, y1] of every line, for the star mask
  const box = (lines, x, y, size, lh) => lines.forEach((l, i) => boxes.push([x, y + i * size * lh - size, x + l.length * size * 0.56, y + i * size * lh + size * 0.35]));
  let text = heading({ eyebrow: ABOUT.eyebrow, title: ABOUT.title });
  boxes.push([X, 36, X + 240, 62], [X, 56, X + 290, 124]);
  let y = 158;
  const LEAD = 21;
  const BUL = 20;
  const leadLines = balanced(ABOUT.lead, 640 / SLACK, LEAD);
  text += textLines(leadLines, { x: X, y, size: LEAD, lh: 1.55, fill: '#cfd8ee' });
  box(leadLines, X, y, LEAD, 1.55);
  y += (leadLines.length - 1) * LEAD * 1.55 + 44;
  const bulletLines = [];
  ABOUT.bullets.forEach((b, i) => {
    const lines = balanced(b, 600 / SLACK, BUL);
    bulletLines.push(lines);
    text += `<g transform="translate(${X + 13} ${r1(y - 7)}) scale(.42)">${lantern({ glow: 0.7, seed: i + 2 })}</g>`;
    text += textLines(lines, { x: X + 38, y, size: BUL, lh: 1.5, fill: C.muted });
    box(lines, X + 38, y, BUL, 1.5);
    boxes.push([X, y - 16, X + 30, y + 10]);
    y += (lines.length - 1) * BUL * 1.5 + BUL * 1.5 + 14;
  });
  const bottom = y - 14 - BUL * 1.5 + 6;
  if (bottom > H - 40) throw new Error(`about: text column runs to y=${r1(bottom)} (panel is ${H})`);
  const textRight = Math.max(...boxes.map((b) => b[2]));
  console.log(`about: lead ${leadLines.length} lines, bullets ${bulletLines.map((l) => l.length).join('+')} lines, text ends at y=${r1(bottom)}, right edge about x=${r1(textRight)}`);

  const MOON = [1168, 76, 25];
  const starOk = (x, py) => {
    if (Math.hypot(x - MOON[0], py - MOON[1]) < MOON[2] + 14) return false;
    if (boxes.some((b) => x > b[0] - 14 && x < b[2] + 14 && py > b[1] - 9 && py < b[3] + 9)) return false;
    return x < 600 ? py < H - 52 : py < 242 + D;
  };

  let css = `
@keyframes breathe{0%{transform:translateY(0) rotate(-.5deg)}100%{transform:translateY(-1.4px) rotate(.5deg)}}
.brt{animation:breathe 3.6s ease-in-out infinite alternate}
.gd .wave{animation-duration:1.8s}
@keyframes hi{0%{opacity:0;transform:translateY(7px)}10%{opacity:1;transform:translateY(0)}78%{opacity:1;transform:translateY(0)}92%{opacity:0;transform:translateY(-4px)}100%{opacity:0;transform:translateY(7px)}}
.hi{animation:hi 13s ease-in-out infinite;animation-delay:-4s}
@keyframes driftS{0%{transform:translateX(-5px)}100%{transform:translateX(5px)}}
.dS{animation:driftS 17s ease-in-out infinite alternate}
`;

  let defs = pn.defs;
  defs += `
<linearGradient id="abtf" gradientUnits="userSpaceOnUse" x1="610" y1="0" x2="840" y2="0"><stop offset="0" stop-color="#08112b" stop-opacity="0"/><stop offset="1" stop-color="#08112b" stop-opacity="1"/></linearGradient>
<linearGradient id="abrf" gradientUnits="userSpaceOnUse" x1="610" y1="0" x2="820" y2="0"><stop offset="0" stop-color="#0b1633" stop-opacity="0"/><stop offset="1" stop-color="#0b1633" stop-opacity="1"/></linearGradient>
<linearGradient id="abmf" gradientUnits="userSpaceOnUse" x1="980" y1="0" x2="1110" y2="0"><stop offset="0" stop-color="#080f28" stop-opacity="0"/><stop offset="1" stop-color="#080f28" stop-opacity="1"/></linearGradient>
<linearGradient id="abgr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b2f68"/><stop offset=".3" stop-color="#0d1a3b"/><stop offset="1" stop-color="#040815"/></linearGradient>
<linearGradient id="abpath" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34487f"/><stop offset="1" stop-color="#26376e"/></linearGradient>
<linearGradient id="abpaper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6e2"/><stop offset="1" stop-color="#f1dfb8"/></linearGradient>
<linearGradient id="abwarm" gradientUnits="objectBoundingBox" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff9a3d" stop-opacity=".26"/><stop offset=".65" stop-color="#ff9a3d" stop-opacity="0"/></linearGradient>
<radialGradient id="abhaze" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#5d78bc" stop-opacity=".55"/><stop offset=".6" stop-color="#3c5494" stop-opacity=".2"/><stop offset="1" stop-color="#3c5494" stop-opacity="0"/></radialGradient>
<radialGradient id="abmist" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#a9bfee" stop-opacity=".30"/><stop offset="1" stop-color="#a9bfee" stop-opacity="0"/></radialGradient>
<radialGradient id="abpool" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffb060" stop-opacity=".55"/><stop offset=".5" stop-color="#ff8a30" stop-opacity=".16"/><stop offset="1" stop-color="#ff8a30" stop-opacity="0"/></radialGradient>
`;

  let body = pn.open;

  // ---- sky: stars kept clear of the words, one moon, horizon haze, far ridge and forest ----
  body += skyStars({ count: Math.round((W * H) / 9000), seed: 9, ok: starOk });
  body += moon(MOON[0], MOON[1], MOON[2]);
  body += `<ellipse cx="1010" cy="${366 + D}" rx="420" ry="96" fill="url(#abhaze)"/>`;
  body += `<path d="M560 ${450 + D}V${324 + D}Q650 ${300 + D} 760 ${320 + D}T960 ${304 + D}T1160 ${318 + D}T1280 ${306 + D}V${450 + D}Z" fill="url(#abrf)"/>`;
  body += `<g class="dS"><path d="${forestPath({ x0: 590, x1: 1330, by: 382 + D, hMin: 56, hMax: 124, gap: 15, seed: 41, oakShare: 0.28 })}" fill="url(#abtf)"/></g>`;
  body += `<g class="ob sway" style="animation-duration:13s"><path d="${forestPath({ x0: 990, x1: 1330, by: 390 + D, hMin: 118, hMax: 196, gap: 30, seed: 43, oakShare: 0.08 })}" fill="url(#abmf)"/></g>`;

  // ---- ground ---------------------------------------------------------------------
  const groundTop = `M0 ${432 + D}C240 ${429 + D} 520 ${432 + D} 700 ${420 + D}C820 ${410 + D} 900 ${374 + D} 1040 ${370 + D}C1130 ${368 + D} 1210 ${374 + D} 1280 ${376 + D}`;
  body += `<path d="${groundTop}V${H}H0Z" fill="url(#abgr)"/>`;
  body += `<path d="${groundTop}" fill="none" stroke="#6a86cc" stroke-opacity=".3" stroke-width="1.3"/>`;
  body += `<ellipse cx="930" cy="${380 + D}" rx="300" ry="16" fill="url(#abmist)" class="mist" style="animation-duration:19s"/>`;
  body += `<ellipse cx="1130" cy="${388 + D}" rx="200" ry="12" fill="url(#abmist)" class="mist" style="animation-duration:25s;animation-delay:-9s"/>`;

  // ---- the winding dirt path -------------------------------------------------------
  const centre = [[736, 512, 112], [800, 482, 98], [866, 454, 82], [938, 436, 66], [1008, 426, 52], [1070, 419, 42], [1120, 406, 31], [1166, 392, 21], [1214, 381, 12]].map((p) => [p[0], p[1] + D, p[2]]);
  body += `<path d="${strip(centre)}" fill="url(#abpath)" stroke="#5a74b8" stroke-opacity=".45" stroke-width="1.2" stroke-linejoin="round"/>`;
  body += `<path d="${strip(centre.map((p) => [p[0], p[1], p[2] * 0.5]))}" fill="#4a63a8" opacity=".26"/>`;
  [[880, 452, 3.4, 1.7], [948, 442, 3, 1.5], [1022, 430, 2.4, 1.2], [840, 458, 3.8, 1.8], [1090, 416, 2, 1], [916, 454, 2.2, 1.1], [1002, 440, 2.6, 1.3], [790, 470, 3, 1.5]].forEach(([px, py, rx, ry]) => {
    body += `<ellipse cx="${px}" cy="${py + D}" rx="${rx}" ry="${ry}" fill="#6c86c8" opacity=".5"/>`;
  });

  // ---- the lamp post, its glow and the pool of light it throws -----------------------
  const LAMP = [762, 410 + D];
  const LS = 1.45;
  const LH = 178;
  const lx = LAMP[0] + 34 * LS;
  const ly = LAMP[1] - (LH - 30) * LS;
  body += `<ellipse cx="${r1(lx + 6)}" cy="${LAMP[1] + 4}" rx="176" ry="26" fill="url(#abpool)" class="o flick" style="animation-duration:4.1s"/>`;
  body += `<circle cx="${r1(lx)}" cy="${r1(ly)}" r="150" fill="url(#lg)" opacity=".5" class="o pulse" style="animation-duration:6s"/>`;
  body += `<ellipse cx="${LAMP[0]}" cy="${LAMP[1] + 1}" rx="17" ry="5" fill="#02050e" opacity=".6"/>`;
  body += `<g transform="translate(${LAMP[0]} ${LAMP[1]}) scale(${LS})">${lampPost({ h: LH, seed: 3 })}</g>`;

  // ---- far right pines, in front of the ground --------------------------------------
  const rim = 'stroke="#2f4a8e" stroke-opacity=".5" stroke-width="1" vector-effect="non-scaling-stroke"';
  body += `<g class="ob sway" style="animation-duration:11s;animation-delay:-4s"><path d="${forestPath({ x0: 1236, x1: 1330, by: 436 + D, hMin: 232, hMax: 300, gap: 56, seed: 47, oakShare: 0 })}" fill="#03060f" ${rim}/></g>`;
  body += `<g class="ob sway" style="animation-duration:14s;animation-delay:-8s"><path d="${forestPath({ x0: 1196, x1: 1252, by: 408 + D, hMin: 150, hMax: 206, gap: 50, seed: 49, oakShare: 0 })}" fill="#050b1e" ${rim}/></g>`;

  // ---- rocks and tufts behind the figure --------------------------------------------
  body += rock(1034, 430 + D, 24, 14, 5);
  body += rock(1204, 418 + D, 34, 19, 6);
  body += rock(846, 432 + D, 15, 9, 8);
  [[742, 436, 16], [818, 440, 13], [1064, 432, 14], [1160, 424, 17], [1250, 440, 15], [890, 418, 12], [1046, 424, 11]].forEach(([x, py, s], i) => {
    body += tuft(x, py + D, s, 90 + i, i % 2 ? '#0a1530' : '#122248');
  });

  // ---- the guide, standing and waving (scale 2.0, as in the contact scene) -----------
  const G = [944, 418 + D];
  body += `<ellipse cx="${G[0]}" cy="${G[1] + 4}" rx="66" ry="10" fill="#02050e" opacity=".55"/>`;
  body += `<g transform="translate(${G[0]} ${G[1]}) scale(2)"><g class="gd ob brt">${guide({ pose: 'wave', flip: true })}</g></g>`;

  // ---- the sign ----------------------------------------------------------------------
  body += signpost(1146, 432 + D, PERSON.location, 1.15);
  body += tuft(1040, 440 + D, 13, 120, '#050a17');
  body += tuft(1150, 441 + D, 15, 121, '#050a1c');
  body += tuft(1226, 444 + D, 18, 122, '#03060f');

  // ---- greeting: a small cream paper bubble, warmed on its left edge by the lamp ---------
  {
    const bw = 138;
    const bh = 46;
    const bx = G[0] + 32;
    const by = G[1] - 300;
    const r = 15;
    const tipX = G[0] + 18;
    const tipY = G[1] - 226;
    const d = `M${bx + r} ${by}H${bx + bw - r}Q${bx + bw} ${by} ${bx + bw} ${by + r}V${by + bh - r}Q${bx + bw} ${by + bh} ${bx + bw - r} ${by + bh}H${bx + 36}L${tipX} ${tipY}L${bx + 15} ${by + bh}H${bx + r}Q${bx} ${by + bh} ${bx} ${by + bh - r}V${by + r}Q${bx} ${by} ${bx + r} ${by}Z`;
    body += `<g class="hi">
<ellipse cx="${bx + bw / 2}" cy="${by + bh / 2 + 6}" rx="${bw * 0.82}" ry="${bh * 1.15}" fill="url(#lg)" opacity=".3" class="o flick" style="animation-duration:5.3s"/>
<path d="${d}" fill="#02050e" opacity=".32" transform="translate(2 3)"/>
<path d="${d}" fill="url(#abpaper)" stroke="${C.amber}" stroke-opacity=".6" stroke-width="1.2" stroke-linejoin="round"/>
<path d="${d}" fill="url(#abwarm)"/>
<text x="${bx + bw / 2}" y="${by + 31}" text-anchor="middle" font-family="${SERIF}" font-size="22" font-style="italic" textLength="96" lengthAdjust="spacingAndGlyphs" fill="#3a2a1c">Hi there!</text>
</g>`;
  }

  // ---- low foreground: grass along the left, ferns framing the corners -----------------
  [[130, 456, 12], [236, 460, 14], [352, 455, 11], [478, 458, 13], [596, 452, 12], [676, 446, 13]].forEach(([x, py, s], i) => {
    body += tuft(x, py + D, s, 140 + i, i % 2 ? '#13244f' : '#0d1a3e');
  });
  body += fern(-8, 476 + D, 62, 8, '#03060f', 1);
  body += fern(38, 484 + D, 40, -6, '#050a17', 2);
  body += fern(1276, 480 + D, 108, -12, '#03060f', 3);
  body += fern(1206, 490 + D, 62, 8, '#050a17', 4);

  // ---- fireflies (kept out of the text column) ----------------------------------------
  const ff = fireflies({ n: 10, box: [760, 190 + D, 1240, 470 + D], seed: 61, scale: 1.2, prefix: 'fa' });
  css += ff.css;
  body += ff.body;

  body += text;
  body += pn.close;

  const desc = `An animated night scene beside the text. ${ABOUT.eyebrow}. ${ABOUT.title}. ${ABOUT.lead} ${ABOUT.bullets.join(' ')} In a moonlit clearing a guide in a red cap and grey hoodie waves and says Hi there! from a small cream paper speech bubble, next to a wooden signpost reading ${PERSON.location}, a lamp post with a swinging paper lantern, a winding dirt path, pine trees and fireflies.`;
  return doc({ w: W, h: H, title: 'About Sathish Lella', desc, defs, css, body });
}

export default function build() {
  return { 'about.svg': about() };
}
