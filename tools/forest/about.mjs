import { C, SERIF, rng, r1, esc, doc, stars, moon, forestPath, lantern, fireflies, fern, guide, lampPost, wrap, textLines, heading, panel } from './lib.mjs';
import { ABOUT, PERSON } from './content.mjs';

const W = 1280;
const H = 460;

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

// a wooden signpost with one arrow board; origin at the foot of the post
function signpost(x, y, text) {
  return `<g transform="translate(${x} ${y})">
<ellipse cx="0" cy="2" rx="30" ry="5" fill="#02050e" opacity=".55"/>
<path d="M-4.5 0V-108L0 -114L4.5 -108V0Z" fill="#3b2616"/>
<path d="M1 0V-108L4.5 -108V0Z" fill="#2a1a0e" opacity=".7"/>
<path d="M-92 -99H82L103 -81L82 -63H-92Z" fill="#6c4627" stroke="#2a190d" stroke-width="1.6" stroke-linejoin="round"/>
<path d="M-92 -99H82L86 -95H-92Z" fill="#9a6a3c" opacity=".55"/>
<path d="M-88 -90H78M-88 -72H80" stroke="#3d2614" stroke-opacity=".55" stroke-width="1" fill="none"/>
<circle cx="-84" cy="-81" r="1.7" fill="#d9b27a"/><circle cx="76" cy="-81" r="1.7" fill="#d9b27a" opacity=".0"/>
<text x="-6" y="-75.5" text-anchor="middle" font-family="${SERIF}" font-size="16" fill="#2a190d" opacity=".55" transform="translate(.8 1)">${esc(text)}</text>
<text x="-6" y="-75.5" text-anchor="middle" font-family="${SERIF}" font-size="16" fill="#ffe3b0">${esc(text)}</text>
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

// ---- the picture ----------------------------------------------------------------
export function about() {
  const rand = rng(77);
  const pn = panel({ w: W, h: H, id: 'ab', seed: 9, starCount: 0 });

  let css = `
@keyframes breathe{0%{transform:translateY(0) rotate(-.5deg)}100%{transform:translateY(-1.4px) rotate(.5deg)}}
.brt{animation:breathe 3.6s ease-in-out infinite alternate}
.gd .wave{animation-duration:1.6s}
@keyframes pop{0%{opacity:0;transform:scale(.4)}9%{opacity:1;transform:scale(1.07)}14%{opacity:1;transform:scale(1)}72%{opacity:1;transform:scale(1)}83%{opacity:0;transform:scale(.82)}100%{opacity:0;transform:scale(.4)}}
.pop{animation:pop 9s ease-in-out infinite;animation-delay:-3.4s}
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
<radialGradient id="abhaze" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#5d78bc" stop-opacity=".55"/><stop offset=".6" stop-color="#3c5494" stop-opacity=".2"/><stop offset="1" stop-color="#3c5494" stop-opacity="0"/></radialGradient>
<radialGradient id="abmist" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#a9bfee" stop-opacity=".30"/><stop offset="1" stop-color="#a9bfee" stop-opacity="0"/></radialGradient>
<radialGradient id="abpool" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffb060" stop-opacity=".55"/><stop offset=".5" stop-color="#ff8a30" stop-opacity=".16"/><stop offset="1" stop-color="#ff8a30" stop-opacity="0"/></radialGradient>
`;

  let body = pn.open;

  // ---- sky: our own stars (none behind the text), moon, horizon haze, far ridge and forest ----
  body += stars({ w: 690, yMax: 34, count: 7, seed: 12 });
  body += stars({ w: 590, x0: 690, yMax: 330, count: 64, seed: 9 });
  body += moon(1168, 76, 25);
  body += `<ellipse cx="1010" cy="366" rx="400" ry="92" fill="url(#abhaze)"/>`;
  body += `<path d="M560 450V324Q650 300 760 320T960 304T1160 318T1280 306V450Z" fill="url(#abrf)"/>`;
  body += `<g class="dS"><path d="${forestPath({ x0: 590, x1: 1330, by: 382, hMin: 44, hMax: 104, gap: 15, seed: 41, oakShare: 0.28 })}" fill="url(#abtf)"/></g>`;
  body += `<g class="ob sway" style="animation-duration:13s"><path d="${forestPath({ x0: 1000, x1: 1330, by: 390, hMin: 104, hMax: 176, gap: 30, seed: 43, oakShare: 0.08 })}" fill="url(#abmf)"/></g>`;

  // ---- ground ---------------------------------------------------------------------
  const groundTop = 'M0 432C240 429 520 432 700 420C820 410 900 374 1040 370C1130 368 1210 374 1280 376';
  body += `<path d="${groundTop}V${H}H0Z" fill="url(#abgr)"/>`;
  body += `<path d="${groundTop}" fill="none" stroke="#6a86cc" stroke-opacity=".3" stroke-width="1.3"/>`;
  body += `<ellipse cx="930" cy="380" rx="300" ry="15" fill="url(#abmist)" class="mist" style="animation-duration:19s"/>`;
  body += `<ellipse cx="1130" cy="388" rx="200" ry="11" fill="url(#abmist)" class="mist" style="animation-duration:25s;animation-delay:-9s"/>`;

  // ---- the winding dirt path -------------------------------------------------------
  const centre = [[736, 512, 96], [800, 482, 84], [866, 454, 70], [938, 436, 56], [1008, 426, 44], [1070, 419, 36], [1120, 406, 28], [1166, 392, 19], [1214, 381, 11]];
  body += `<path d="${strip(centre)}" fill="url(#abpath)" stroke="#5a74b8" stroke-opacity=".45" stroke-width="1.2" stroke-linejoin="round"/>`;
  body += `<path d="${strip(centre.map((p) => [p[0], p[1], p[2] * 0.5]))}" fill="#4a63a8" opacity=".26"/>`;
  [[880, 452, 3, 1.5], [948, 442, 2.6, 1.3], [1022, 430, 2.2, 1.1], [840, 458, 3.4, 1.6], [1090, 416, 1.8, .9], [916, 454, 2, 1], [1002, 440, 2.4, 1.2], [790, 470, 2.6, 1.3]].forEach(([px, py, rx, ry]) => {
    body += `<ellipse cx="${px}" cy="${py}" rx="${rx}" ry="${ry}" fill="#6c86c8" opacity=".5"/>`;
  });

  // ---- the lamp post, its glow and the pool of light it throws -----------------------
  const LAMP = [770, 410];
  const LS = 1.2;
  const LH = 178;
  const lx = LAMP[0] + 34 * LS;
  const ly = LAMP[1] - (LH - 30) * LS;
  body += `<ellipse cx="${r1(lx + 4)}" cy="${LAMP[1] + 2}" rx="150" ry="22" fill="url(#abpool)" class="o flick" style="animation-duration:4.1s"/>`;
  body += `<circle cx="${r1(lx)}" cy="${r1(ly)}" r="156" fill="url(#lg)" opacity=".5" class="o pulse" style="animation-duration:6s"/>`;
  body += `<ellipse cx="${LAMP[0]}" cy="${LAMP[1] + 1}" rx="14" ry="4" fill="#02050e" opacity=".6"/>`;
  body += `<g transform="translate(${LAMP[0]} ${LAMP[1]}) scale(${LS})">${lampPost({ h: LH, seed: 3 })}</g>`;

  // ---- far right pines, in front of the ground --------------------------------------
  const rim = 'stroke="#2f4a8e" stroke-opacity=".5" stroke-width="1" vector-effect="non-scaling-stroke"';
  body += `<g class="ob sway" style="animation-duration:11s;animation-delay:-4s"><path d="${forestPath({ x0: 1236, x1: 1330, by: 436, hMin: 214, hMax: 276, gap: 56, seed: 47, oakShare: 0 })}" fill="#03060f" ${rim}/></g>`;
  body += `<g class="ob sway" style="animation-duration:14s;animation-delay:-8s"><path d="${forestPath({ x0: 1196, x1: 1252, by: 408, hMin: 140, hMax: 190, gap: 50, seed: 49, oakShare: 0 })}" fill="#050b1e" ${rim}/></g>`;

  // ---- rocks and tufts behind the figure --------------------------------------------
  body += rock(1012, 430, 20, 12, 5);
  body += rock(1186, 418, 28, 16, 6);
  body += rock(836, 432, 13, 8, 8);
  [[742, 436, 14], [812, 440, 11], [1056, 432, 12], [1150, 424, 15], [1244, 440, 13], [888, 418, 10], [1040, 424, 9]].forEach(([x, y, s], i) => {
    body += tuft(x, y, s, 90 + i, i % 2 ? '#0a1530' : '#122248');
  });

  // ---- the guide, standing and waving ------------------------------------------------
  const G = [958, 414];
  body += `<ellipse cx="${G[0]}" cy="${G[1] + 3}" rx="58" ry="9" fill="#02050e" opacity=".55"/>`;
  body += `<g transform="translate(${G[0]} ${G[1]}) scale(1.7)"><g class="gd ob brt">${guide({ pose: 'wave', flip: true })}</g></g>`;

  // ---- the sign ----------------------------------------------------------------------
  body += signpost(1112, 428, PERSON.location);
  body += tuft(1030, 438, 11, 120, '#050a1c');
  body += tuft(1128, 438, 13, 121, '#050a1c');
  body += tuft(1204, 440, 16, 122, '#03060f');

  // ---- speech bubble -----------------------------------------------------------------
  {
    const bx = 984;
    const by = 160;
    const bw = 134;
    const bh = 46;
    const r = 16;
    const tipX = 968;
    const tipY = 230;
    const d = `M${bx + r} ${by}H${bx + bw - r}Q${bx + bw} ${by} ${bx + bw} ${by + r}V${by + bh - r}Q${bx + bw} ${by + bh} ${bx + bw - r} ${by + bh}H${bx + 40}L${tipX} ${tipY}L${bx + 18} ${by + bh}H${bx + r}Q${bx} ${by + bh} ${bx} ${by + bh - r}V${by + r}Q${bx} ${by} ${bx + r} ${by}Z`;
    body += `<g class="pop" style="transform-box:view-box;transform-origin:${tipX}px ${tipY}px">
<path d="${d}" fill="#02050e" opacity=".4" transform="translate(2.5 3.5)"/>
<path d="${d}" fill="${C.cream}" stroke="${C.amber}" stroke-opacity=".7" stroke-width="1.4" stroke-linejoin="round"/>
<text x="${bx + bw / 2}" y="${by + 30.5}" text-anchor="middle" font-family="${SERIF}" font-size="23" fill="#1a2144">Hi there!</text>
</g>`;
  }

  // ---- low foreground: grass along the left, ferns framing the corners -----------------
  [[130, 452, 11], [236, 456, 13], [352, 450, 10], [478, 454, 12], [596, 448, 11], [676, 440, 12]].forEach(([x, y, s], i) => {
    body += tuft(x, y, s, 140 + i, i % 2 ? '#13244f' : '#0d1a3e');
  });
  body += fern(-8, 476, 62, 8, '#03060f', 1);
  body += fern(38, 484, 40, -6, '#050a17', 2);
  body += fern(1276, 480, 104, -12, '#03060f', 3);
  body += fern(1206, 490, 62, 8, '#050a17', 4);

  // ---- fireflies (kept out of the text column) ----------------------------------------
  const ff = fireflies({ n: 10, box: [740, 200, 1240, 430], seed: 61, scale: 1.1, prefix: 'fa' });
  css += ff.css;
  body += ff.body;

  // ---- text column ---------------------------------------------------------------------
  const X = 64;
  const hy = 56;
  body += heading({ eyebrow: ABOUT.eyebrow, title: ABOUT.title, x: X, y: hy });
  let y = hy + 58 + 42;
  const leadLines = balanced(ABOUT.lead, 668, 19);
  body += textLines(leadLines, { x: X, y, size: 19, lh: 1.55, fill: C.muted });
  y += (leadLines.length - 1) * 19 * 1.55 + 40;
  const bulletLines = [];
  ABOUT.bullets.forEach((b, i) => {
    const lines = balanced(b, 590, 17);
    bulletLines.push(lines);
    body += `<g transform="translate(${X + 12} ${r1(y - 6)}) scale(.36)">${lantern({ glow: 0.7, seed: i + 2 })}</g>`;
    body += textLines(lines, { x: X + 36, y, size: 17, lh: 1.5, fill: C.muted });
    y += (lines.length - 1) * 17 * 1.5 + 17 * 1.5 + 13;
  });
  const bottom = y - 13 - 17 * 1.5 + 5;
  if (bottom > H - 30) throw new Error(`about: text column runs to y=${r1(bottom)} (panel is ${H})`);
  console.log(`about: lead ${leadLines.length} lines, bullets ${bulletLines.map((l) => l.length).join('+')} lines, text ends at y=${r1(bottom)}`);

  body += pn.close;

  const desc = `An animated night scene beside the text. ${ABOUT.eyebrow}. ${ABOUT.title}. ${ABOUT.lead} ${ABOUT.bullets.join(' ')} In a moonlit clearing a guide in a red cap and grey hoodie waves and says Hi there!, next to a wooden signpost reading ${PERSON.location}, a lamp post with a swinging paper lantern, a winding dirt path, pine trees and fireflies.`;
  return doc({ w: W, h: H, title: 'About Sathish Lella', desc, defs, css, body });
}

export default function build() {
  return { 'about.svg': about() };
}
