// The last scene and its small parts: contact.svg (a moonlit meadow with the
// guide waving goodbye), five buttons, a lantern rope divider and a footer.
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
<radialGradient id="after" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${C.glow}" stop-opacity=".36"/><stop offset=".55" stop-color="#c0561e" stop-opacity=".12"/><stop offset="1" stop-color="#c0561e" stop-opacity="0"/></radialGradient>
`;
  const vg = vignette(W, H, 'vig', 0.6);
  defs += vg.def;

  let body = '';

  // ---- sky
  body += `<rect width="${W}" height="${HZ + 30}" fill="url(#sky)"/>`;
  body += `<ellipse cx="850" cy="${HZ - 6}" rx="330" ry="70" fill="url(#after)" class="o pulse" style="animation-duration:9s"/>`;
  body += stars({ w: W, yMax: 320, count: 130, seed: 7 });
  body += moon(1176, 92, 30);
  // two thin clouds lit from the moon
  body += `<ellipse cx="1090" cy="150" rx="190" ry="13" fill="url(#mistg)" class="o mist" style="animation-duration:26s"/>`;
  body += `<ellipse cx="1190" cy="184" rx="130" ry="10" fill="url(#mistg)" class="o mist" style="animation-duration:31s;animation-delay:-12s"/>`;

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
  const GX = 1032;
  const GY = 503;
  body += `<ellipse cx="${GX}" cy="${GY + 20}" rx="74" ry="10" fill="#02050e" fill-opacity=".55"/>`;
  body += `<g transform="translate(${GX} ${GY}) scale(2.2)"><g class="breath">${guide({ pose: 'wave', flip: true })}</g></g>`;

  // ---- fireflies: far ones behind the grass, near ones in front
  const ffA = fireflies({ n: 7, box: [90, 330, 1230, 470], seed: 61, scale: 1.1, prefix: 'fa' });
  const ffB = fireflies({ n: 5, box: [50, 430, 1240, 540], seed: 62, scale: 2, prefix: 'fb' });
  css += ffA.css + ffB.css;
  body += ffA.body;

  // ---- foreground grass
  const nearGuide = (x) => (x > 975 && x < 1095 ? 0.5 : 1);
  body += grassRow({ ranges: [[-30, W + 30]], yb: 574, hMin: 16, hMax: 46, seed: 71, fill: '#02050e', chunkW: 64, wMin: 2.4, wMax: 4.6, lean: 8, still: true, dens: 16, cheap: true });
  body += grassRow({ ranges: [[-30, 480], [828, 1312]], yb: 572, hMin: 52, hMax: 128, seed: 72, fill: '#071230', hFn: nearGuide, chunkW: 46, dens: 10 });
  body += grassRow({ ranges: [[-30, 440], [862, 1312]], yb: 576, hMin: 64, hMax: 158, seed: 73, fill: '#03060f', hFn: nearGuide, chunkW: 50, x0Phase: -40, dens: 10 });
  body += ffB.body;
  body += vg.body;

  // ---- words
  body += `<ellipse cx="340" cy="196" rx="470" ry="190" fill="url(#scrim)"/>`;
  body += heading({ eyebrow: '05 / CONTACT', title: CONTACT.title, x: 64, y: 84, size: 64 });
  body += `<text x="66" y="204" font-family="${SERIF}" font-style="italic" font-size="24" fill="${C.muted}">${esc(CONTACT.thanks)}</text>`;
  body += `<rect x="66" y="226" width="44" height="2.4" rx="1.2" fill="${C.amber}" opacity=".85"/>`;
  body += textLines(wrap(CONTACT.line, 600, 18), { x: 66, y: 262, size: 18, lh: 1.55, fill: C.muted });

  return doc({
    w: W,
    h: H,
    title: 'Contact, Sathish Lella',
    desc: `A moonlit meadow at night with a dirt path, two lamp posts, swaying grass and fireflies. The guide in a red cap and grey hoodie stands large on the right and waves goodbye. The words read 05 / CONTACT, ${CONTACT.title}, ${CONTACT.thanks} ${CONTACT.line}`,
    defs,
    css,
    body,
  });
}

// ---- buttons -----------------------------------------------------------------
function darkLantern() {
  return `<g>
<path d="M-15 -21Q-21 0-15 21L15 21Q21 0 15 -21Z" fill="#4a230b"/>
<path d="M0 -21V21M-8 -20Q-11 0-8 20M8 -20Q11 0 8 20" fill="none" stroke="#ffd9a0" stroke-opacity=".38" stroke-width="1.5"/>
<rect x="-11" y="-27" width="22" height="7" rx="2" fill="#3b1d0a"/>
<ellipse cx="0" cy="23" rx="19" ry="4" fill="#3b1d0a"/>
<ellipse cy="2" rx="4.6" ry="9.5" fill="#ffeab8" class="o flick" style="animation-duration:1.7s"/>
</g>`;
}

function button({ label, primary = false, phase = 0, seed = 1 }) {
  const BW = 240;
  const BH = 60;
  const x = 4;
  const y = 4;
  const w = BW - 8;
  const h = BH - 8;
  const rx = h / 2;
  const defs = `${GRADS}
<linearGradient id="glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16265a"/><stop offset="1" stop-color="#0a1330"/></linearGradient>
<linearGradient id="amb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffdca8"/><stop offset=".55" stop-color="#ffb45e"/><stop offset="1" stop-color="#ff9a3d"/></linearGradient>
<linearGradient id="shine" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity="${primary ? 0.34 : 0.12}"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
<linearGradient id="sheen" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".62"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<clipPath id="pill"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/></clipPath>`;
  const css = `
@keyframes gl{0%{opacity:.1}100%{opacity:.42}}
@keyframes gl2{0%{opacity:.6}100%{opacity:1}}
.gl{animation:gl 3.8s ease-in-out infinite alternate}
.gl2{animation:gl2 3.8s ease-in-out infinite alternate}
@keyframes sw{0%,32%{transform:translateX(0)}72%,100%{transform:translateX(420px)}}
.sw{animation:sw 6.4s ease-in-out infinite}
`;
  const ph = `animation-delay:-${phase}s`;
  const stroke = primary ? '#ffe3b4' : C.amber;
  // icon and label are laid out as one unit centred in the pill; the label starts
  // right after the icon, so a wider fallback font can only grow to the right
  const unit = 24 + 10 + label.length * 17 * 0.49;
  const ux = BW / 2 - unit / 2;
  const icon = primary
    ? `<g transform="translate(${r1(ux + 12)} 30) scale(.5)">${darkLantern()}</g>`
    : `<g transform="translate(${r1(ux + 12)} 30) scale(.47)">${lantern({ glow: 0.8, seed })}</g>`;
  const bodyEls = `
<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="none" stroke="${C.amber}" stroke-width="6" opacity=".26" class="gl" style="${ph}"/>
<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="url(#${primary ? 'amb' : 'glass'})"/>
<rect x="${x}" y="${y}" width="${w}" height="${h / 2}" rx="${rx}" fill="url(#shine)" clip-path="url(#pill)"/>
<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="none" stroke="${stroke}" stroke-width="1.6" opacity=".9" class="gl2" style="${ph}"/>
${icon}
<text x="${r1(ux + 34)}" y="36" font-family="${SANS}" font-size="17" font-weight="600" fill="${primary ? '#1a0f06' : C.cream}">${esc(label)}</text>
${primary ? `<g clip-path="url(#pill)"><g transform="skewX(-20)"><rect class="sw" x="-110" y="0" width="64" height="${BH}" fill="url(#sheen)"/></g></g>` : ''}`;
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
  let defs = GRADS;
  let body = `<path d="M-10 8Q640 44 1290 8" fill="none" stroke="#8a6a44" stroke-width="2.4" stroke-linecap="round" opacity=".9"/>`;
  body += `<path d="M-10 8Q640 44 1290 8" fill="none" stroke="#e0c08e" stroke-width="1" stroke-dasharray="3 4" opacity=".75"/>`;
  const N = 9;
  for (let i = 0; i < N; i++) {
    const x = 90 + i * ((DW - 180) / (N - 1)) + (rand() - 0.5) * 22;
    const yr = ropeY(x);
    const s = 0.42 + rand() * 0.08;
    const str = 5 + rand() * 4;
    const yc = yr + str + 27 * s;
    const dur = 4 + rand() * 2.4;
    body += `<g class="dsw" style="transform-box:view-box;transform-origin:${r1(x)}px ${r1(yr)}px;animation-duration:${dur.toFixed(1)}s;animation-delay:-${(rand() * dur).toFixed(1)}s">
<path d="M${r1(x)} ${r1(yr)}V${r1(yc - 27 * s)}" stroke="#8a6a44" stroke-width="1.1"/>
<g transform="translate(${r1(x)} ${r1(yc)}) scale(${r1(s)})">${lantern({ glow: 0.55, seed: i + 2 })}</g>
</g>`;
  }
  const ff = fireflies({ n: 4, box: [70, 12, 1210, 56], seed: 23, scale: 0.55, prefix: 'dv' });
  css += ff.css;
  body += ff.body;
  return doc({
    w: DW,
    h: DH,
    title: 'Divider of paper lanterns',
    desc: 'A rope sagging across the page with nine small paper lanterns hanging from it and swaying, with a few fireflies.',
    defs,
    css,
    body,
  });
}

// ---- footer ------------------------------------------------------------------
function footer() {
  const FW = 1280;
  const FH = 150;
  let css = GRASS_CSS;
  const defs = `${GRADS}
<linearGradient id="ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1633"/><stop offset=".4" stop-color="#060c1c"/><stop offset="1" stop-color="#03060f"/></linearGradient>`;
  let body = '';
  const top = `M-10 112Q150 102 320 109T660 106T980 110T1290 104`;
  // warm pool under the lamp, drawn first so grass and ground sit over its lower edge
  const LX = 1010;
  body += `<ellipse cx="${LX + 22}" cy="112" rx="150" ry="20" fill="url(#lg)" class="o flick" style="animation-duration:4.3s"/>`;
  // far grass, lighter so it shows against both dark and bright pages
  body += grassRow({ ranges: [[-20, FW + 20]], yb: 120, hMin: 14, hMax: 40, seed: 101, fill: '#16275a', chunkW: 56, wMin: 2.2, wMax: 4.4, lean: 10, dens: 9 });
  body += `<g transform="translate(${LX} 118)">${lampPost({ h: 92, seed: 4 })}</g>`;
  body += `<path d="${top}V${FH}H-10Z" fill="url(#ground)"/>`;
  body += `<path d="${top}" fill="none" stroke="#3a4f8f" stroke-opacity=".55" stroke-width="1.3"/>`;
  body += grassRow({ ranges: [[-20, FW + 20]], yb: 122, hMin: 9, hMax: 30, seed: 102, fill: '#03060f', chunkW: 52, wMin: 2.2, wMax: 4.8, lean: 9, x0Phase: 30, dens: 9 });
  const ff = fireflies({ n: 6, box: [60, 64, 1220, 128], seed: 103, scale: 1.05, prefix: 'fo' });
  css += ff.css;
  body += ff.body;
  body += `<text x="640" y="138" text-anchor="middle" font-family="${SANS}" font-size="14" letter-spacing="2.4" fill="#9fb0d6">Built as a walk through the forest</text>`;
  return doc({
    w: FW,
    h: FH,
    title: 'Built as a walk through the forest',
    desc: 'Low grass and a single lamp post at night with fireflies above a dark ground. The words read Built as a walk through the forest.',
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
