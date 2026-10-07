import { readFileSync } from 'node:fs';
import { C, SERIF, SANS, MONO, r1, esc, rng, doc, forestPath, pinePath, lantern, fireflies, heading, panel } from './lib.mjs';

// stats.svg: five paper lanterns hung from a rope (one stat each) and, in the
// whole right column, the top languages as glowing bars. Every number is read
// from stats.json (written by the stats refresher), nothing is typed in here.
// No moon in this panel (it lives in hero, about, experience, publications and
// contact). The rope of lanterns stays here, it is not used anywhere else.

const W = 1280;
const H = 432;
const S = JSON.parse(readFileSync(new URL('./stats.json', import.meta.url), 'utf8'));
const fmt = (n) => Number(n).toLocaleString('en-US');

// label lines are set by hand so both "in the last year" labels break the same way
const STATS = [
  [S.contributions, ['contributions', 'in the last year']],
  [S.commits, ['commits', 'in the last year']],
  [S.repos, ['public', 'repositories']],
  [S.stars, ['stars earned']],
  [S.followers, ['followers']],
];

const DIV = 852; // dotted divider between the lanterns and the right column
const LX0 = 148; // first lantern centre
const LP = 156; // lantern pitch
const X0 = 884; // right column left edge
const X1 = 1216; // right column right edge
const GY = 398; // ground line
const TRACK_W = X1 - X0;
const LABEL = '#b7c1d8'; // label colour, lighter than the #9fb0d6 floor
const CAPTION = '#9fb0d6';

// ---- text measuring ------------------------------------------------------------
// SVG cannot measure text. Helvetica/Arial advance widths (per 1000 em) for the
// printable ASCII range, used to size fixed labels and to check the slack.
const AW = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278,
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556,
  1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778,
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556,
  333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556,
  556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584,
];
const aw = (s, size) => ([...String(s)].reduce((a, ch) => a + (AW[ch.charCodeAt(0) - 32] ?? 556), 0) * size) / 1000;
// A label whose box is fixed: textLength pins it to 1.05x the Arial width, so a
// wider or narrower fallback face is squeezed or stretched a little (never past
// the box). The check below keeps at least 13 percent slack inside the pitch.
function fixedText(str, { x, y, size, fill, anchor = 'middle', family = SANS, box }) {
  const len = aw(str, size) * 1.05;
  if (box && len * 1.13 > box) throw new Error(`stats: "${str}" needs ${r1(len * 1.13)} but the box is ${box}`);
  return `<text x="${r1(x)}" y="${r1(y)}" font-family="${family}" font-size="${size}" fill="${fill}" text-anchor="${anchor}" textLength="${r1(len)}" lengthAdjust="spacingAndGlyphs">${esc(str)}</text>`;
}

// ---- the rope --------------------------------------------------------------------
// One quadratic curve, tied high at the divider and sagging toward the left edge.
const P0 = [-6, 168];
const PC = [390, 200];
const P2 = [DIV, 92];
const bez = (t) => [
  (1 - t) ** 2 * P0[0] + 2 * t * (1 - t) * PC[0] + t * t * P2[0],
  (1 - t) ** 2 * P0[1] + 2 * t * (1 - t) * PC[1] + t * t * P2[1],
];
function ropeY(x) {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (bez(mid)[0] < x) lo = mid;
    else hi = mid;
  }
  return bez((lo + hi) / 2)[1];
}

// ---- language rows ---------------------------------------------------------------
const rowY = (i) => 142 + i * 54; // name baseline
const barY = (i) => rowY(i) + 17; // bar centre line
const fillW = (c, max) => Math.max(12, (TRACK_W * c) / max);

// Stars that keep out of the text blocks, so no dot ever lands on a letter.
const KEEP_OUT = [
  [52, 28, 500, 134], // heading
  [56, 288, 846, 394], // numbers and labels
  [868, 30, 1240, 392], // languages
  [56, 404, 430, 428], // caption
];
function nightStars(count, seed) {
  const rand = rng(seed);
  const groups = [[], [], [], [], []];
  let placed = 0;
  let guard = 0;
  while (placed < count && guard++ < 6000) {
    const x = rand() * W;
    const y = rand() * (GY - 8) * (0.4 + 0.6 * rand());
    const mag = Math.pow(rand(), 3);
    const r = 0.5 + mag * 1.5;
    const m = r + 5;
    if (KEEP_OUT.some(([a, b, c, d]) => x > a - m && x < c + m && y > b - m && y < d + m)) continue;
    const tint = rand() < 0.2 ? '#ffe9c8' : rand() < 0.4 ? '#cfe0ff' : '#ffffff';
    groups[placed % 5].push(`<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(r)}" fill="${tint}"/>`);
    placed++;
  }
  return groups
    .map((g, i) => `<g class="tw" style="animation-duration:${(3 + i * 1.3).toFixed(1)}s;animation-delay:-${(i * 1.7).toFixed(1)}s">${g.join('')}</g>`)
    .join('');
}

export default function build() {
  const maxRepos = Math.max(...S.langs.map((l) => l[1]));
  const p = panel({ w: W, h: H, id: 'st', seed: 9, starCount: 0 });

  const defs = `${p.defs}
<linearGradient id="barg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff8f35"/><stop offset=".7" stop-color="#ffb860"/><stop offset="1" stop-color="#ffe0a0"/></linearGradient>
<linearGradient id="sheen" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff6e0" stop-opacity="0"/><stop offset=".5" stop-color="#fff6e0" stop-opacity=".55"/><stop offset="1" stop-color="#fff6e0" stop-opacity="0"/></linearGradient>
<radialGradient id="mg" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#9db4ee" stop-opacity=".30"/><stop offset="1" stop-color="#9db4ee" stop-opacity="0"/></radialGradient>
<linearGradient id="ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a1330"/><stop offset="1" stop-color="#050a1a"/></linearGradient>
${S.langs.map((l, i) => `<clipPath id="bc${i}"><rect x="${X0}" y="${barY(i) - 5}" width="${r1(fillW(l[1], maxRepos))}" height="10" rx="5"/></clipPath>`).join('')}`;

  // fireflies live in the open gaps: between lanterns, over the rope, at the edges
  const FF = [
    { n: 3, box: [70, 140, 840, 262], seed: 33, prefix: 'sa' },
    { n: 2, box: [470, 34, 780, 96], seed: 41, prefix: 'sb' },
    { n: 1, box: [60, 382, 840, 394], seed: 47, prefix: 'sc' },
    { n: 1, box: [1226, 150, 1262, 330], seed: 59, prefix: 'se' },
  ].map((o) => fireflies({ ...o, scale: 0.9 }));
  const ff = { css: FF.map((f) => f.css).join(''), body: FF.map((f) => f.body).join('') };

  // the sheen rests off the left end of every bar (clipped away), then crosses it
  const css = `
@keyframes bsw{0%,18%{transform:translateX(0)}82%,100%{transform:translateX(${TRACK_W + 70}px)}}
.bsw{animation:bsw 7s ease-in-out infinite}
${ff.css}`;

  let body = p.open + nightStars(Math.round((W * H) / 9000), 9);

  // ---- low ground with a few dark trees along the bottom edge
  body += `<path d="${forestPath({ x0: -20, x1: 1300, by: GY + 4, hMin: 9, hMax: 20, gap: 13, seed: 17, oakShare: 0.25 })}" fill="#060c1e"/>`;
  body += `<rect y="${GY}" width="${W}" height="${H - GY}" fill="url(#ground)"/>`;
  body += `<path d="M0 ${GY}H${W}" stroke="#1a2b57" stroke-opacity=".6" stroke-width="1"/>`;

  // lantern light pooling on the ground, and two slow bands of mist
  for (let i = 0; i < STATS.length; i++) {
    body += `<ellipse cx="${LX0 + i * LP}" cy="${GY}" rx="64" ry="9" fill="url(#lg)" opacity=".5" class="o flick" style="animation-duration:${(3.4 + i * 0.5).toFixed(1)}s;animation-delay:-${(i * 0.8).toFixed(1)}s"/>`;
  }
  body += `<ellipse cx="380" cy="${GY - 8}" rx="320" ry="13" fill="url(#mg)" class="o mist" style="animation-duration:23s"/>`;
  body += `<ellipse cx="960" cy="${GY - 6}" rx="280" ry="12" fill="url(#mg)" class="o mist" style="animation-duration:29s;animation-delay:-11s"/>`;

  // two tall pines frame the bottom corners
  const prand = rng(5);
  body += `<path d="${pinePath(18, H + 4, 112, 28, prand)}${pinePath(1262, H + 4, 100, 25, prand)}" fill="#050b1c"/>`;

  // ---- heading (lib defaults, so the title sits where it does in every panel)
  body += heading({ eyebrow: 'ON GITHUB', title: 'The path so far' });

  // ---- divider
  body += `<path d="M${DIV} 40V${GY - 14}" stroke="${C.line}" stroke-opacity=".8" stroke-width="1.6" stroke-dasharray="2 7" stroke-linecap="round"/>`;

  // ---- the rope the lanterns hang from
  const rope = `M${P0[0]} ${P0[1]}Q${PC[0]} ${PC[1]} ${P2[0]} ${P2[1]}`;
  body += `<path d="${rope}" fill="none" stroke="#7a5638" stroke-width="2.6" stroke-linecap="round"/>`;
  body += `<path d="${rope}" fill="none" stroke="#b58a58" stroke-opacity=".55" stroke-width="1" stroke-dasharray="5 4"/>`;
  body += `<circle cx="${P2[0]}" cy="${P2[1]}" r="5" fill="#7a5638"/><circle cx="${P2[0]}" cy="${P2[1]}" r="2" fill="#b58a58"/>`;

  // ---- fireflies sit behind the text
  body += ff.body;

  // ---- five lanterns, each with its number and label
  const dropLine = (i) => 224 - (ropeY(LX0) - ropeY(LX0 + i * LP)) * 0.3; // lantern centres follow the rope a little
  STATS.forEach(([n, lines], i) => {
    const cx = LX0 + i * LP;
    const ay = ropeY(cx);
    const cord = Math.round(dropLine(i) - ay - 38);
    body += `<circle cx="${cx}" cy="${r1(ay)}" r="3.2" fill="#b58a58"/>`;
    body += `<g transform="translate(${cx} ${r1(ay)})"><g class="hang" style="transform-box:view-box;transform-origin:0px 0px;animation-duration:${(5 + i * 0.7).toFixed(1)}s;animation-delay:-${(i * 1.3).toFixed(1)}s"><path d="M0 -1V${cord + 4}" stroke="#a07448" stroke-width="1.8"/><g transform="translate(0 ${cord + 38}) scale(1.4)">${lantern({ seed: i + 2 })}</g></g></g>`;
    // the number, big serif, with the same soft shadow the headings use
    body += `<text x="${cx + 2}" y="328" font-family="${SERIF}" font-size="52" fill="#02040b" opacity=".6" text-anchor="middle" style="font-variant-numeric:lining-nums">${fmt(n)}</text>`;
    body += `<text x="${cx}" y="326" font-family="${SERIF}" font-size="52" fill="${C.cream}" text-anchor="middle" style="font-variant-numeric:lining-nums">${fmt(n)}</text>`;
    lines.forEach((l, k) => {
      body += fixedText(l, { x: cx, y: 357 + k * 22, size: 17, fill: LABEL, box: LP - 10 });
    });
  });

  // ---- languages: the whole right column
  body += `<text x="${X0}" y="54" font-family="${SANS}" font-size="15" letter-spacing="5" fill="${C.amber}" opacity=".95">TOP LANGUAGES</text>`;
  body += `<text x="${X0}" y="86" font-family="${SANS}" font-size="17" font-style="italic" fill="${LABEL}">by repositories</text>`;
  S.langs.forEach(([name, count], i) => {
    const y = rowY(i);
    const by = barY(i);
    const fw = fillW(count, maxRepos);
    body += `<text x="${X0}" y="${y}" font-family="${SANS}" font-size="18" fill="${C.cream}">${esc(name)}</text>`;
    body += `<text x="${X1}" y="${y}" font-family="${MONO}" font-size="18" fill="${LABEL}" text-anchor="end">${count}</text>`;
    body += `<rect x="${X0}" y="${by - 5}" width="${TRACK_W}" height="10" rx="5" fill="#101c44" stroke="${C.line}" stroke-opacity=".7"/>`;
    body += `<rect x="${X0 - 3}" y="${by - 8}" width="${r1(fw + 6)}" height="16" rx="8" fill="${C.amber2}" opacity=".16"/>`;
    body += `<rect x="${X0}" y="${by - 5}" width="${r1(fw)}" height="10" rx="5" fill="url(#barg)"/>`;
    body += `<g clip-path="url(#bc${i})"><rect class="bsw" x="${X0 - 60}" y="${by - 5}" width="60" height="10" fill="url(#sheen)" style="animation-delay:-${(i * 1.3).toFixed(1)}s"/></g>`;
    body += `<circle cx="${r1(X0 + fw)}" cy="${by}" r="16" fill="url(#lg)" class="o pulse" style="animation-duration:${(4.5 + i * 0.6).toFixed(1)}s;animation-delay:-${(i * 0.9).toFixed(1)}s"/>`;
  });

  // ---- caption
  body += `<text x="64" y="420" font-family="${SANS}" font-size="15" letter-spacing=".8" fill="${CAPTION}">GitHub since ${esc(S.since)}<tspan dx="12" fill="#8294c4">|</tspan><tspan dx="12">as of ${esc(S.asOf)}</tspan></text>`;

  body += p.close;

  const langDesc = S.langs.map(([n, c]) => `${n} ${c}`).join(', ');
  const desc =
    `The path so far, on GitHub. ${fmt(S.contributions)} contributions in the last year, ${fmt(S.commits)} commits in the last year, ${fmt(S.repos)} public repositories, ${fmt(S.stars)} stars earned, ${fmt(S.followers)} followers. ` +
    `Top languages by repositories: ${langDesc}. GitHub since ${S.since}, as of ${S.asOf}.`;

  return { 'stats.svg': doc({ w: W, h: H, title: 'GitHub stats for Sathish Lella', desc, defs, css, body }) };
}
