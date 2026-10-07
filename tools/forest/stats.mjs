import { readFileSync } from 'node:fs';
import { C, SERIF, SANS, MONO, r1, esc, rng, doc, moon, forestPath, pinePath, lantern, fireflies, heading, panel, wrap, textLines } from './lib.mjs';

// stats.svg: five paper lanterns hung on a rope (one stat each), the streak as
// stepping stones, and the top languages as glowing bars. Every number is read
// from stats.json (written by the stats refresher), nothing is typed in here.

const W = 1280;
const H = 360;
const S = JSON.parse(readFileSync(new URL('./stats.json', import.meta.url), 'utf8'));
const fmt = (n) => Number(n).toLocaleString('en-US');
const dayWord = (n) => (Number(n) === 1 ? 'day' : 'days');

const STATS = [
  [S.contributions, 'contributions in the last year'],
  [S.commits, 'commits'],
  [S.repos, 'public repositories'],
  [S.stars, 'stars earned'],
  [S.followers, 'followers'],
];

const DIV = 852; // dotted divider between the lanterns and the right column
const LX0 = 140; // first lantern centre
const LP = 154; // lantern pitch
const X0 = 884; // right column left edge
const X1 = 1216; // right column right edge

// Stars that keep out of the text blocks, so no dot ever lands on a letter.
const KEEP_OUT = [
  [52, 26, 420, 112], // heading
  [56, 226, 836, 312], // numbers and labels
  [868, 30, 1236, 318], // streak and languages
];
function nightStars(count, seed) {
  const rand = rng(seed);
  const groups = [[], [], [], [], []];
  let placed = 0;
  let guard = 0;
  while (placed < count && guard++ < 4000) {
    const x = rand() * W;
    const y = rand() * 326;
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
<linearGradient id="sheen" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff6e0" stop-opacity="0"/><stop offset=".5" stop-color="#fff6e0" stop-opacity=".5"/><stop offset="1" stop-color="#fff6e0" stop-opacity="0"/></linearGradient>
<radialGradient id="mg" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#9db4ee" stop-opacity=".30"/><stop offset="1" stop-color="#9db4ee" stop-opacity="0"/></radialGradient>
<linearGradient id="ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a1330"/><stop offset="1" stop-color="#050a1a"/></linearGradient>
${S.langs.map((l, i) => {
    const fw = fillW(l[1], maxRepos);
    return `<clipPath id="bc${i}"><rect x="${TRACK_X}" y="${rowY(i) - 4}" width="${r1(fw)}" height="8" rx="4"/></clipPath>`;
  }).join('')}`;

  // fireflies live in the open gaps: between lanterns, over the moon, and at the edges
  const FF = [
    { n: 4, box: [60, 128, 830, 214], seed: 33, prefix: 'sa' },
    { n: 2, box: [440, 34, 830, 96], seed: 41, prefix: 'sb' },
    { n: 1, box: [60, 308, 840, 328], seed: 47, prefix: 'sc' },
    { n: 1, box: [1100, 36, 1236, 110], seed: 53, prefix: 'sd' },
    { n: 1, box: [1226, 160, 1262, 300], seed: 59, prefix: 'se' },
  ].map((o) => fireflies({ ...o, scale: 0.9 }));
  const ff = { css: FF.map((f) => f.css).join(''), body: FF.map((f) => f.body).join('') };

  const css = `
@keyframes bsw{0%,18%{transform:translateX(-70px)}82%,100%{transform:translateX(270px)}}
.bsw{animation:bsw 6.5s ease-in-out infinite}
${ff.css}`;

  let body = p.open + nightStars(78, 9);

  // ---- sky details: a small moon between the heading and the divider
  body += moon(672, 62, 16);

  // ---- low ground with a few dark trees along the bottom edge
  body += `<path d="${forestPath({ x0: -20, x1: 1300, by: 338, hMin: 10, hMax: 26, gap: 13, seed: 17, oakShare: 0.25 })}" fill="#060c1e"/>`;
  body += `<rect y="334" width="${W}" height="${H - 334}" fill="url(#ground)"/>`;
  body += `<path d="M0 334H${W}" stroke="#1a2b57" stroke-opacity=".6" stroke-width="1"/>`;

  // lantern light pooling on the ground, and two slow bands of mist
  for (let i = 0; i < STATS.length; i++) {
    body += `<ellipse cx="${LX0 + i * LP}" cy="334" rx="62" ry="9" fill="url(#lg)" opacity=".5" class="o flick" style="animation-duration:${(3.4 + i * 0.5).toFixed(1)}s;animation-delay:-${(i * 0.8).toFixed(1)}s"/>`;
  }
  body += `<ellipse cx="380" cy="326" rx="320" ry="13" fill="url(#mg)" class="o mist" style="animation-duration:23s"/>`;
  body += `<ellipse cx="930" cy="328" rx="280" ry="12" fill="url(#mg)" class="o mist" style="animation-duration:29s;animation-delay:-11s"/>`;

  // two tall pines frame the bottom corners
  const prand = rng(5);
  body += `<path d="${pinePath(24, 340, 124, 34, prand)}${pinePath(1260, 340, 104, 28, prand)}" fill="#050b1c"/>`;

  // ---- heading
  body += heading({ eyebrow: 'ON GITHUB', title: 'The path so far', x: 64, y: 44, size: 44 });

  // ---- divider
  body += `<path d="M${DIV} 40V322" stroke="${C.line}" stroke-opacity=".7" stroke-width="1.6" stroke-dasharray="2 7" stroke-linecap="round"/>`;

  // ---- rope the lanterns hang from
  body += `<path d="M-6 112Q${DIV / 2} 140 ${DIV} 112" fill="none" stroke="#7a5638" stroke-width="2.2" stroke-linecap="round"/>`;
  body += `<circle cx="${DIV}" cy="112" r="3.4" fill="#7a5638"/>`;

  // ---- fireflies sit behind the text
  body += ff.body;

  // ---- five lanterns
  STATS.forEach(([n, label], i) => {
    const cx = LX0 + i * LP;
    const t = cx / DIV;
    const ay = 112 + 56 * t * (1 - t); // the rope sags between its ends
    const cord = 12;
    body += `<g transform="translate(${cx} ${r1(ay)})"><g class="hang" style="transform-box:view-box;transform-origin:0px 0px;animation-duration:${(5 + i * 0.7).toFixed(1)}s;animation-delay:-${(i * 1.3).toFixed(1)}s"><path d="M0 -1V${cord + 3}" stroke="#a07448" stroke-width="1.6"/><g transform="translate(0 ${cord + 36}) scale(1.3)">${lantern({ seed: i + 2 })}</g></g></g>`;
    // the number, big serif, with the same soft shadow the headings use
    body += `<text x="${cx + 2}" y="264" font-family="${SERIF}" font-size="42" fill="#02040b" opacity=".6" text-anchor="middle" style="font-variant-numeric:lining-nums">${fmt(n)}</text>`;
    body += `<text x="${cx}" y="262" font-family="${SERIF}" font-size="42" fill="${C.cream}" text-anchor="middle" style="font-variant-numeric:lining-nums">${fmt(n)}</text>`;
    body += textLines(wrap(label, 132, 13), { x: cx, y: 287, size: 13, lh: 1.25, fill: C.muted, anchor: 'middle' });
  });

  // ---- streak: two numbers and a row of stepping stones
  body += `<text x="${X0}" y="44" font-family="${SANS}" font-size="13" letter-spacing="5.5" fill="${C.amber}" opacity=".95">STREAK</text>`;
  const streakCol = (x, n, label) =>
    `<text x="${x}" y="88" font-family="${SERIF}" font-size="36" fill="${C.cream}">${n}<tspan font-family="${SANS}" font-size="15" fill="${C.muted}" dx="7">${dayWord(n)}</tspan></text>` +
    `<text x="${x}" y="108" font-family="${SANS}" font-size="13" fill="${C.dim}">${esc(label)}</text>`;
  body += streakCol(X0, S.currentStreak, 'current streak');
  body += streakCol(X0 + 172, S.longestStreak, 'longest streak');
  for (let i = 0; i < S.longestStreak; i++) {
    const x = X0 + 5 + i * 17;
    const lit = i < S.currentStreak;
    if (lit) {
      body += `<circle cx="${x}" cy="132" r="12" fill="url(#lg)" class="o pulse" style="animation-duration:${(4 + i).toFixed(0)}s"/>`;
      body += `<circle cx="${x}" cy="132" r="4.4" fill="${C.amber}"/>`;
    } else {
      body += `<circle cx="${x}" cy="132" r="3.6" fill="#101c44" stroke="#3a4d85" stroke-width="1.2"/>`;
    }
  }

  // ---- languages
  body += `<text x="${X0}" y="170" font-family="${SANS}" font-size="13" letter-spacing="5.5" fill="${C.amber}" opacity=".95">TOP LANGUAGES</text>`;
  body += `<text x="${X1}" y="170" font-family="${SANS}" font-size="13" font-style="italic" fill="${C.muted}" text-anchor="end">by repositories</text>`;
  S.langs.forEach(([name, count], i) => {
    const y = rowY(i);
    const fw = fillW(count, maxRepos);
    body += `<text x="${X0}" y="${y + 5}" font-family="${SANS}" font-size="14" fill="${C.cream}">${esc(name)}</text>`;
    body += `<rect x="${TRACK_X}" y="${y - 4}" width="${TRACK_W}" height="8" rx="4" fill="#101c44" stroke="${C.line}" stroke-opacity=".55"/>`;
    body += `<rect x="${TRACK_X - 3}" y="${y - 7}" width="${r1(fw + 6)}" height="14" rx="7" fill="${C.amber2}" opacity=".16"/>`;
    body += `<rect x="${TRACK_X}" y="${y - 4}" width="${r1(fw)}" height="8" rx="4" fill="url(#barg)"/>`;
    body += `<g clip-path="url(#bc${i})"><rect class="bsw" x="${TRACK_X}" y="${y - 4}" width="60" height="8" fill="url(#sheen)" style="animation-delay:-${(i * 1.1).toFixed(1)}s"/></g>`;
    body += `<circle cx="${r1(TRACK_X + fw)}" cy="${y}" r="13" fill="url(#lg)" class="o pulse" style="animation-duration:${(4.5 + i * 0.6).toFixed(1)}s;animation-delay:-${(i * 0.9).toFixed(1)}s"/>`;
    body += `<text x="${X1}" y="${y + 5}" font-family="${MONO}" font-size="13" fill="${C.muted}" text-anchor="end">${count}</text>`;
  });

  // ---- caption
  body += `<text x="64" y="351" font-family="${SANS}" font-size="12" letter-spacing=".8" fill="${C.dim}">GitHub since ${esc(S.since)}<tspan dx="12" fill="${C.line}">|</tspan><tspan dx="12">baked ${esc(S.asOf)}</tspan></text>`;

  body += p.close;

  const langDesc = S.langs.map(([n, c]) => `${n} ${c}`).join(', ');
  const desc =
    `The path so far, on GitHub. ${fmt(S.contributions)} contributions in the last year, ${fmt(S.commits)} commits, ${fmt(S.repos)} public repositories, ${fmt(S.stars)} stars earned, ${fmt(S.followers)} followers. ` +
    `Current streak ${S.currentStreak} ${dayWord(S.currentStreak)}, longest streak ${S.longestStreak} ${dayWord(S.longestStreak)}. ` +
    `Top languages by repositories: ${langDesc}. GitHub since ${S.since}, baked ${S.asOf}.`;

  return { 'stats.svg': doc({ w: W, h: H, title: 'GitHub stats for Sathish Lella', desc, defs, css, body }) };
}

// bar geometry
const TRACK_X = X0 + 96;
const TRACK_W = 206;
const rowY = (i) => 195 + i * 27;
const fillW = (c, max) => Math.max(10, (TRACK_W * c) / max);
