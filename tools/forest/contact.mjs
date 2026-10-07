// The last scene and its small parts: contact.svg (a moonlit meadow with the
// guide waving goodbye), five buttons, a lantern rope divider and a footer panel.
import { C, SERIF, SANS, GRADS, rng, r1, esc, doc, stars, moon, forestPath, lantern, fireflies, guide, lampPost, vignette, wrap, textLines, heading } from './lib.mjs';
import { CONTACT } from './content.mjs';

// ---- shared bits -------------------------------------------------------------
const GRASS_CSS = `
.gs{transform-box:fill-box;transform-origin:50% 100%;animation:gsw 7s ease-in-out infinite alternate}
@keyframes gsw{0%{transform:rotate(-2.4deg)}100%{transform:rotate(2.8deg)}}
`;

// one tapered blade: base centred on x at yb, tip leaning by `lean`
function blade(x, yb, h, w, lean) {
  return `M${r1(x - w / 2)} ${r1(yb)}Q${r1(x + lean * 0.15 - w * 0.2)} ${r1(yb - h * 0.55)} ${r1(x + lean)} ${r1(yb - h)}Q${r1(x + lean * 0.38 + w * 0.3)} ${r1(yb - h * 0.5)} ${r1(x + w / 2)} ${r1(yb)}Z`;
}

// cheaper blade (one curve) for the many small static ones
function blade1(x, yb, h, w, lean) {
  return `M${r1(x - w / 2)} ${r1(yb)}Q${r1(x + lean * 0.2)} ${r1(yb - h * 0.6)} ${r1(x + lean)} ${r1(yb - h)}L${r1(x + w / 2)} ${r1(yb)}Z`;
}

// A row of grass cut into chunks; each chunk is one path that sways on its own
// from its base, with the phase running along x so a breath of wind passes through.
function grassRow({ ranges, yb, hMin, hMax, seed, fill, chunkW = 56, wMin = 2.6, wMax = 5.6, lean = 14, hFn, x0Phase = 0, still = false, dens = 9, cheap = false }) {
  const rand = rng(seed);
  let out = '';
  for (const [a, b] of ranges) {
    for (let cx = a; cx < b; cx += chunkW) {
      let d = '';
      const n = dens - 1 + Math.floor(rand() * 3);
      for (let i = 0; i < n; i++) {
        const x = cx + rand() * chunkW;
        const k = hFn ? hFn(x) : 1;
        d += (cheap ? blade1 : blade)(x, yb, (hMin + rand() * (hMax - hMin)) * k, wMin + rand() * (wMax - wMin), (rand() - 0.5) * 2 * lean);
      }
      const anim = still ? '' : ` class="gs" style="animation-duration:${(6.4 + rand() * 2.2).toFixed(1)}s;animation-delay:-${(((cx - x0Phase) / 1280) * 5 + rand() * 0.6 + 8).toFixed(1)}s"`;
      out += `<path${anim} d="${d}" fill="${fill}"/>`;
    }
  }
  return out;
}

// ---- contact.svg -------------------------------------------------------------
const W = 1280;
const H = 560;
const HZ = 372; // horizon

// the path: two quadratic edges from a point on the horizon down to the bottom
const EL = [[842, HZ], [805, 458], [470, 560]];
const ER = [[858, HZ], [862, 458], [800, 560]];
function sample(P, n = 80) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const m = (1 - t) * (1 - t);
    const k = 2 * t * (1 - t);
    const q = t * t;
    out.push([m * P[0][0] + k * P[1][0] + q * P[2][0], m * P[0][1] + k * P[1][1] + q * P[2][1]]);
  }
  return out;
}
const SL = sample(EL);
const SR = sample(ER);
function atY(pts, y) {
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, ay] = pts[i];
    const [bx, by] = pts[i + 1];
    if (y >= ay && y <= by) return ax + ((bx - ax) * (y - ay)) / (by - ay || 1);
  }
  return pts[pts.length - 1][0];
}
const pathL = (y) => atY(SL, y);
const pathR = (y) => atY(SR, y);

function contact() {
  const rand = rng(77);
  let css = GRASS_CSS + `
@keyframes breath{0%{transform:scale(1,1)}100%{transform:scale(1.005,1.013)}}
.breath{transform-box:fill-box;transform-origin:50% 100%;animation:breath 4.6s ease-in-out infinite alternate}
@keyframes dS{0%{transform:translateX(-7px)}100%{transform:translateX(7px)}}
.dS{animation:dS 18s ease-in-out infinite alternate}
.wave{animation-duration:1.7s}
`;
  let defs = GRADS;
  defs += `
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.zenith}"/><stop offset=".55" stop-color="${C.skyA}"/><stop offset="1" stop-color="${C.skyB}"/></linearGradient>
<linearGradient id="meadow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#173055"/><stop offset=".22" stop-color="#0f2142"/><stop offset=".6" stop-color="#08122b"/><stop offset="1" stop-color="#040815"/></linearGradient>
<linearGradient id="trail" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a6d9e"/><stop offset=".12" stop-color="#3b4d80"/><stop offset=".55" stop-color="#1f2e5c"/><stop offset="1" stop-color="#111b3e"/></linearGradient>
<radialGradient id="trailsheen" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#b8ccff" stop-opacity=".34"/><stop offset="1" stop-color="#b8ccff" stop-opacity="0"/></radialGradient>
<linearGradient id="haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6e82b8" stop-opacity="0"/><stop offset="1" stop-color="#6e82b8" stop-opacity=".22"/></linearGradient>
<linearGradient id="haze2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6e82b8" stop-opacity=".2"/><stop offset="1" stop-color="#6e82b8" stop-opacity="0"/></linearGradient>
<radialGradient id="mistg" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#cfe0ff" stop-opacity=".3"/><stop offset="1" stop-color="#cfe0ff" stop-opacity="0"/></radialGradient>
<radialGradient id="scrim" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#050a17" stop-opacity=".55"/><stop offset=".6" stop-color="#050a17" stop-opacity=".28"/><stop offset="1" stop-color="#050a17" stop-opacity="0"/></radialGradient>
<clipPath id="cclip"><rect width="${W}" height="${H}" rx="22"/></clipPath>
<radialGradient id="after" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${C.glow}" stop-opacity=".36"/><stop offset=".55" stop-color="#c0561e" stop-opacity=".12"/><stop offset="1" stop-color="#c0561e" stop-opacity="0"/></radialGradient>
`;
  const vg = vignette(W, H, 'vig', 0.6);
  defs += vg.def;

  let body = '';

  // ---- sky
  body += `<rect width="${W}" height="${HZ + 30}" fill="url(#sky)"/>`;
  body += `<ellipse cx="850" cy="${HZ - 6}" rx="330" ry="70" fill="url(#after)" class="o pulse" style="animation-duration:9s"/>`;
  body += stars({ w: W, yMax: 320, count: Math.round((W * H) / 9000), seed: 7 });
  body += moon(924, 124, 38);
  // two thin clouds lit from the moon
  body += `<ellipse cx="1000" cy="168" rx="200" ry="13" fill="url(#mistg)" class="o mist" style="animation-duration:26s"/>`;
  body += `<ellipse cx="1110" cy="206" rx="140" ry="10" fill="url(#mistg)" class="o mist" style="animation-duration:31s;animation-delay:-12s"/>`;

  // ---- two soft ridges, then far trees (a gap where the path meets the horizon)
  const ridgeA = `M-10 330Q120 296 270 322T560 312T850 328T1100 306T1290 322`;
  const ridgeB = `M-10 352Q160 328 330 348T640 340T930 352T1290 336`;
  body += `<path d="${ridgeA}V${HZ + 2}H-10Z" fill="#1b2d63"/>`;
  body += `<path d="${ridgeA}" fill="none" stroke="#9db4f0" stroke-opacity=".36" stroke-width="1.4"/>`;
  body += `<path d="${ridgeB}V${HZ + 2}H-10Z" fill="#142251"/>`;
  body += `<path d="${ridgeB}" fill="none" stroke="#7d98d8" stroke-opacity=".28" stroke-width="1.3"/>`;
  const farL = forestPath({ x0: -30, x1: 826, by: HZ + 1, hMin: 26, hMax: 66, gap: 13, seed: 41, oakShare: 0.22 });
  const farR = forestPath({ x0: 880, x1: 1320, by: HZ + 1, hMin: 30, hMax: 72, gap: 13, seed: 42, oakShare: 0.22 });
  body += `<g class="dS"><path d="${farL}${farR}" fill="#0b1638"/></g>`;
  body += `<rect y="${HZ - 50}" width="${W}" height="54" fill="url(#haze)"/>`;
  // a distant lantern where the path ends
  body += `<circle cx="850" cy="${HZ - 3}" r="26" fill="url(#lg)" class="o flick" style="animation-duration:4.4s"/><circle cx="850" cy="${HZ - 3}" r="1.9" fill="#fff4cf"/>`;

  // ---- meadow
  body += `<rect y="${HZ}" width="${W}" height="${H - HZ + 12}" fill="url(#meadow)"/>`;
  body += `<rect y="${HZ}" width="${W}" height="46" fill="url(#haze2)"/>`;
  body += `<ellipse cx="300" cy="470" rx="320" ry="52" fill="#5d86c4" fill-opacity=".06"/><ellipse cx="1060" cy="450" rx="260" ry="40" fill="#5d86c4" fill-opacity=".07"/>`;

  // ---- the path
  const pathD = `M${EL[0][0]} ${HZ}Q${EL[1][0]} ${EL[1][1]} ${EL[2][0]} ${EL[2][1]}L${ER[2][0]} ${ER[2][1]}Q${ER[1][0]} ${ER[1][1]} ${ER[0][0]} ${HZ}Z`;
  body += `<path d="${pathD}" fill="url(#trail)"/>`;
  body += `<ellipse cx="740" cy="498" rx="150" ry="62" fill="url(#trailsheen)" class="o shim" style="animation-duration:7s"/>`;
  body += `<path d="M${EL[0][0]} ${HZ}Q${EL[1][0]} ${EL[1][1]} ${EL[2][0]} ${EL[2][1]}M${ER[0][0]} ${HZ}Q${ER[1][0]} ${ER[1][1]} ${ER[2][0]} ${ER[2][1]}" fill="none" stroke="#9db8ff" stroke-opacity=".22" stroke-width="1.3"/>`;
  // worn ruts and pebbles on the path
  for (let i = 0; i < 26; i++) {
    const y = HZ + 14 + Math.pow(rand(), 1.4) * 170;
    const xl = pathL(y);
    const xr = pathR(y);
    const s = (y - HZ) / 188;
    const x = xl + (xr - xl) * (0.1 + rand() * 0.8);
    body += `<ellipse cx="${r1(x)}" cy="${r1(y)}" rx="${r1(1.5 + s * 5.5 * (0.6 + rand() * 0.8))}" ry="${r1(0.6 + s * 2 * (0.6 + rand() * 0.6))}" fill="${rand() < 0.5 ? '#0b1634' : '#7f95c8'}" fill-opacity="${r1(0.25 + rand() * 0.3)}"/>`;
  }

  // ---- near trees framing both sides, then low mist
  const nearL = forestPath({ x0: -40, x1: 56, by: HZ + 22, hMin: 100, hMax: 175, gap: 40, seed: 51, oakShare: 0.3 });
  const nearR = forestPath({ x0: 905, x1: 1330, by: HZ + 22, hMin: 90, hMax: 175, gap: 40, seed: 52, oakShare: 0.25 });
  body += `<path d="${nearL}${nearR}" fill="#070f27"/>`;
  body += `<ellipse cx="380" cy="${HZ + 14}" rx="340" ry="13" fill="url(#mistg)" class="o mist" style="animation-duration:19s"/>`;
  body += `<ellipse cx="1000" cy="${HZ + 24}" rx="300" ry="12" fill="url(#mistg)" class="o mist" style="animation-duration:23s;animation-delay:-9s"/>`;

  // ---- tufts scattered across the meadow, bigger as they come near
  let tD = '';
  let tL = '';
  for (let i = 0; i < 150; i++) {
    const y = HZ + 6 + Math.pow(rand(), 1.25) * 180;
    const s = (y - HZ) / 188;
    const x = rand() * (W + 40) - 20;
    if (x > pathL(y) - 3 && x < pathR(y) + 3) continue;
    const n = 3 + Math.floor(rand() * 3);
    let d = '';
    for (let k = 0; k < n; k++) {
      d += blade1(x + (k - n / 2) * (1.2 + s * 2.4), y, (4 + s * 26) * (0.55 + rand() * 0.8), 1.1 + s * 2.2, (rand() - 0.5) * (4 + s * 14));
    }
    if (rand() < 0.38) tL += d;
    else tD += d;
  }
  body += `<path d="${tD}" fill="#050b1d" fill-opacity=".85"/><path d="${tL}" fill="#5f88c6" fill-opacity=".3"/>`;
  // a few pale wildflowers catching the moon
  let fl = '';
  for (let i = 0; i < 46; i++) {
    const y = HZ + 20 + Math.pow(rand(), 1.1) * 165;
    const x = rand() * W;
    if (x > pathL(y) - 6 && x < pathR(y) + 6) continue;
    const s = (y - HZ) / 188;
    fl += `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(0.8 + s * 1.7)}"/>`;
  }
  body += `<g fill="#f4efe4" fill-opacity=".5">${fl}</g>`;

  // ---- lamp posts flanking the path, with their pools of warm light
  const yL = 507;
  const yR = 453;
  const xlPost = pathL(yL) - 28;
  const xrPost = pathR(yR) + 26;
  body += `<ellipse cx="${r1(pathL(yL) + 12)}" cy="${yL + 3}" rx="130" ry="24" fill="url(#lg)" class="o flick" style="animation-duration:4.2s"/>`;
  body += `<ellipse cx="${r1(pathR(yR) - 4)}" cy="${yR + 3}" rx="88" ry="16" fill="url(#lg)" class="o flick" style="animation-duration:3.7s;animation-delay:-1.4s"/>`;
  body += `<g transform="translate(${r1(xrPost)} ${yR}) scale(-.82 .82)">${lampPost({ h: 120, seed: 5 })}</g>`;
  body += `<g transform="translate(${r1(xlPost)} ${yL}) scale(1.15)">${lampPost({ h: 120, seed: 3 })}</g>`;

  // ---- the guide, large, waving goodbye
  const GX = 1040;
  const GY = 503;
  body += `<ellipse cx="${GX}" cy="${GY + 18}" rx="68" ry="9" fill="#02050e" fill-opacity=".55"/>`;
  body += `<g transform="translate(${GX} ${GY}) scale(2)"><g class="breath">${guide({ pose: 'wave', flip: true })}</g></g>`;

  // ---- fireflies: far ones behind the grass, near ones in front
  const ffA = fireflies({ n: 7, box: [90, 330, 1230, 470], seed: 61, scale: 1.1, prefix: 'fa' });
  const ffB = fireflies({ n: 5, box: [50, 430, 1240, 540], seed: 62, scale: 2, prefix: 'fb' });
  css += ffA.css + ffB.css;
  body += ffA.body;

  // ---- foreground grass
  const nearGuide = (x) => (x > 985 && x < 1100 ? 0.5 : 1);
  body += grassRow({ ranges: [[-30, W + 30]], yb: 574, hMin: 16, hMax: 46, seed: 71, fill: '#02050e', chunkW: 64, wMin: 2.4, wMax: 4.6, lean: 8, still: true, dens: 16, cheap: true });
  body += grassRow({ ranges: [[-30, 480], [828, 1312]], yb: 572, hMin: 52, hMax: 128, seed: 72, fill: '#071230', hFn: nearGuide, chunkW: 46, dens: 10 });
  body += grassRow({ ranges: [[-30, 440], [862, 1312]], yb: 576, hMin: 64, hMax: 158, seed: 73, fill: '#03060f', hFn: nearGuide, chunkW: 50, x0Phase: -40, dens: 10 });
  body += ffB.body;
  body += vg.body;

  // ---- words
  body += `<ellipse cx="370" cy="150" rx="500" ry="170" fill="url(#scrim)"/>`;
  body += heading({ eyebrow: '06 / CONTACT', title: CONTACT.title });
  body += `<text x="64" y="168" font-family="${SERIF}" font-style="italic" font-size="26" fill="#c9d2e8">${esc(CONTACT.thanks)}</text>`;
  body += `<rect x="64" y="190" width="44" height="2.4" rx="1.2" fill="${C.amber}" opacity=".85"/>`;
  body += textLines(wrap(CONTACT.line, 640, 20), { x: 64, y: 230, size: 20, lh: 1.55, fill: C.muted });

  // same rounded clip and hairline border as every panel
  body = `<g clip-path="url(#cclip)">${body}</g><rect x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}" rx="21.5" fill="none" stroke="${C.line}" stroke-opacity=".7" stroke-width="1.5"/>`;

  return doc({
    w: W,
    h: H,
    title: 'Contact, Sathish Lella',
    desc: `A moonlit meadow at night with a dirt path, two lamp posts, swaying grass and fireflies. The full moon hangs over the right with thin clouds, and the guide in a red cap and grey hoodie stands on the right and waves goodbye. The words read 06 / CONTACT, ${CONTACT.title}, ${CONTACT.thanks} ${CONTACT.line}`,
    defs,
    css,
    body,
  });
}

// ---- buttons -----------------------------------------------------------------
// Arial Bold advance widths (per 1000 em). Fonts never load inside an <img> SVG,
// so the label is given a textLength from these metrics; whichever bold sans the
// reader's system falls back to is then fitted to the same width.
const AB = { a: 556, b: 611, c: 556, d: 611, e: 556, f: 333, g: 611, h: 611, i: 278, j: 278, k: 556, l: 278, m: 889, n: 611, o: 611, p: 611, q: 611, r: 389, s: 556, t: 333, u: 611, v: 556, w: 778, x: 556, y: 556, z: 500, ' ': 278,
  A: 722, B: 722, C: 722, D: 722, E: 667, F: 611, G: 778, H: 722, I: 278, J: 556, K: 722, L: 611, M: 833, N: 722, O: 778, P: 667, Q: 778, R: 722, S: 667, T: 611, U: 722, V: 667, W: 944, X: 667, Y: 667, Z: 611 };
const boldWidth = (t, size) => r1([...t].reduce((a, ch) => a + (AB[ch] ?? 560), 0) * size / 1000);

// a lantern that is lit: warm paper, bright flame and a glow
function litLantern(seed, glow) {
  return lantern({ glow, seed, flame: true });
}

function button({ label, primary = false, phase = 0, seed = 1 }) {
  const BW = 240; // every button is exactly this size
  const BH = 60;
  const IX = 34; // lantern icon: same x in every button
  const LX = 66; // label: left aligned at the same x in every button
  const FS = 18;
  const rx = BH / 2 - 0.75;
  const defs = `${GRADS}
<linearGradient id="glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16265a"/><stop offset="1" stop-color="#0a1330"/></linearGradient>
<linearGradient id="amb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffdca8"/><stop offset=".55" stop-color="#ffb45e"/><stop offset="1" stop-color="#ff9a3d"/></linearGradient>
<linearGradient id="shine" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity="${primary ? 0.3 : 0.1}"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
<linearGradient id="sheen" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".6"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<clipPath id="pill"><rect width="${BW}" height="${BH}" rx="${BH / 2}"/></clipPath>`;
  const css = `
@keyframes sw{0%,32%{transform:translateX(0)}72%,100%{transform:translateX(420px)}}
.sw{animation:sw 6.4s ease-in-out infinite}
`;
  const ph = `animation-delay:-${phase}s`;
  // the primary button keeps its amber fill, so its lit lantern sits in a dark well
  const icon = primary
    ? `<circle cx="${IX}" cy="30" r="20.5" fill="#1a0f06"/><circle cx="${IX}" cy="30" r="20.5" fill="none" stroke="#7a3a12" stroke-opacity=".6" stroke-width="1"/><g transform="translate(${IX} 30) scale(.56)">${litLantern(seed, 0.5)}</g>`
    : `<g transform="translate(${IX} 30) scale(.56)">${litLantern(seed, 0.8)}</g>`;
  const textLen = boldWidth(label, FS);
  const bodyEls = `
<rect x=".75" y=".75" width="${BW - 1.5}" height="${BH - 1.5}" rx="${rx}" fill="url(#${primary ? 'amb' : 'glass'})"/>
<rect width="${BW}" height="${BH / 2}" fill="url(#shine)" clip-path="url(#pill)"/>
${icon}
<text x="${LX}" y="${30 + FS * 0.35}" font-family="${SANS}" font-size="${FS}" font-weight="600" fill="${primary ? '#1a0f06' : C.cream}" textLength="${textLen}" lengthAdjust="spacingAndGlyphs">${esc(label)}</text>
${primary ? `<g clip-path="url(#pill)"><g transform="skewX(-20)"><rect class="sw" x="-110" y="0" width="64" height="${BH}" fill="url(#sheen)" style="${ph}"/></g></g>` : ''}
<rect x=".75" y=".75" width="${BW - 1.5}" height="${BH - 1.5}" rx="${rx}" fill="none" stroke="${primary ? '#e0831f' : C.amber}" stroke-width="1.5"/>`;
  return doc({
    w: BW,
    h: BH,
    title: label,
    desc: `Button: ${label}`,
    defs,
    css,
    body: bodyEls,
  });
}

// ---- divider: a sagging rope of paper lanterns --------------------------------
// Transparent, so it works on white and on dark pages.
function divider() {
  const DW = 1280;
  const DH = 64;
  const rand = rng(19);
  const ropeY = (x) => {
    const t = (x + 10) / 1300;
    return 8 + 72 * t * (1 - t);
  };
  let css = `
@keyframes dsw{0%{transform:rotate(-6deg)}100%{transform:rotate(6deg)}}
.dsw{animation:dsw 4.6s ease-in-out infinite alternate}
`;
  const defs = GRADS;
  let body = `<path d="M-10 8Q640 44 1290 8" fill="none" stroke="#8a6a44" stroke-width="2.4" stroke-linecap="round" opacity=".9"/>`;
  body += `<path d="M-10 8Q640 44 1290 8" fill="none" stroke="#e0c08e" stroke-width="1" stroke-dasharray="3 4" opacity=".75"/>`;
  const N = 7;
  for (let i = 0; i < N; i++) {
    const x = 110 + i * ((DW - 220) / (N - 1)) + (rand() - 0.5) * 24;
    const yr = ropeY(x);
    const s = 0.44 + rand() * 0.08;
    const str = 5 + rand() * 4;
    const yc = yr + str + 27 * s;
    const dur = 4 + rand() * 2.4;
    body += `<g class="dsw" style="transform-box:view-box;transform-origin:${r1(x)}px ${r1(yr)}px;animation-duration:${dur.toFixed(1)}s;animation-delay:-${(rand() * dur).toFixed(1)}s">
<path d="M${r1(x)} ${r1(yr)}V${r1(yc - 27 * s)}" stroke="#8a6a44" stroke-width="1.1"/>
<g transform="translate(${r1(x)} ${r1(yc)}) scale(${r1(s)})">${lantern({ glow: 0.55, seed: i + 2 })}</g>
</g>`;
  }
  const ff = fireflies({ n: 3, box: [140, 12, 1140, 56], seed: 23, scale: 0.6, prefix: 'dv' });
  css += ff.css;
  body += ff.body;
  return doc({
    w: DW,
    h: DH,
    title: 'Divider of paper lanterns',
    desc: 'A rope sagging across the page with seven small paper lanterns hanging from it and swaying, with three fireflies.',
    defs,
    css,
    body,
  });
}

// ---- footer: a small dark night panel ------------------------------------------
function footer() {
  const FW = 1280;
  const FH = 170;
  let css = GRASS_CSS;
  const defs = `${GRADS}
<linearGradient id="fsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.zenith}"/><stop offset=".55" stop-color="#0d1840"/><stop offset="1" stop-color="#1c2e66"/></linearGradient>
<linearGradient id="ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1633"/><stop offset=".45" stop-color="#060c1c"/><stop offset="1" stop-color="#03060f"/></linearGradient>
<radialGradient id="fvig" cx="50%" cy="50%" r="78%"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></radialGradient>
<linearGradient id="fhaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6e82b8" stop-opacity="0"/><stop offset="1" stop-color="#6e82b8" stop-opacity=".2"/></linearGradient>
<clipPath id="fclip"><rect width="${FW}" height="${FH}" rx="22"/></clipPath>`;
  let body = `<g clip-path="url(#fclip)"><rect width="${FW}" height="${FH}" fill="url(#fsky)"/>`;
  body += stars({ w: FW, yMax: 104, count: Math.round((FW * FH) / 9000), seed: 33 });
  const top = `M-10 126Q150 116 320 123T660 120T980 124T1290 118`;
  // far trees fade into the sky; the warm pool under the lamp sits behind the grass
  const LX = 1010;
  body += `<path d="${forestPath({ x0: -20, x1: 1300, by: 128, hMin: 14, hMax: 38, gap: 24, seed: 105, oakShare: 0.2 })}" fill="#122252"/>`;
  body += `<rect y="84" width="${FW}" height="48" fill="url(#fhaze)"/>`;
  body += `<ellipse cx="${LX + 24}" cy="128" rx="160" ry="20" fill="url(#lg)" class="o flick" style="animation-duration:4.3s"/>`;
  body += grassRow({ ranges: [[-20, FW + 20]], yb: 132, hMin: 14, hMax: 40, seed: 101, fill: '#16275a', chunkW: 56, wMin: 2.2, wMax: 4.4, lean: 10, dens: 9 });
  body += `<g transform="translate(${LX} 132)">${lampPost({ h: 108, seed: 4 })}</g>`;
  body += `<path d="${top}V${FH}H-10Z" fill="url(#ground)"/>`;
  body += `<path d="${top}" fill="none" stroke="#3a4f8f" stroke-opacity=".55" stroke-width="1.3"/>`;
  body += grassRow({ ranges: [[-20, FW + 20]], yb: 134, hMin: 9, hMax: 30, seed: 102, fill: '#03060f', chunkW: 52, wMin: 2.2, wMax: 4.8, lean: 9, x0Phase: 30, dens: 9 });
  const ff = fireflies({ n: 4, box: [80, 60, 1200, 126], seed: 103, scale: 1.05, prefix: 'fo' });
  css += ff.css;
  body += ff.body;
  body += `<text x="640" y="156" text-anchor="middle" font-family="${SANS}" font-size="16" letter-spacing="1.6" fill="${C.muted}">Built as a walk through the forest</text>`;
  body += `<rect width="${FW}" height="${FH}" fill="url(#fvig)"/></g>`;
  body += `<rect x=".75" y=".75" width="${FW - 1.5}" height="${FH - 1.5}" rx="21.5" fill="none" stroke="${C.line}" stroke-opacity=".7" stroke-width="1.5"/>`;
  return doc({
    w: FW,
    h: FH,
    title: 'Built as a walk through the forest',
    desc: 'A small dark night panel with a few stars, a line of far trees, swaying grass, a single lamp post with a glowing lantern and fireflies. The words read Built as a walk through the forest.',
    defs,
    css,
    body,
  });
}

export default function build() {
  return {
    'contact.svg': contact(),
    'btn-site.svg': button({ label: 'Walk the portfolio', primary: true, phase: 0, seed: 1 }),
    'btn-linkedin.svg': button({ label: 'LinkedIn', phase: 0.8, seed: 2 }),
    'btn-email.svg': button({ label: 'Email me', phase: 1.6, seed: 3 }),
    'btn-scholar.svg': button({ label: 'Google Scholar', phase: 2.4, seed: 4 }),
    'btn-cv.svg': button({ label: 'Download CV', phase: 3.2, seed: 5 }),
    'divider.svg': divider(),
    'footer.svg': footer(),
  };
}
