// Shared pieces for the forest-night SVGs: palette, type stacks, seeded random,
// a document wrapper, and the drawn things that repeat (stars, moon, trees,
// lanterns, fireflies, the guide). Everything here is plain SVG plus CSS
// keyframes, because GitHub shows README images through <img>, which allows
// styles and animation but no scripts and no outside files or fonts.

export const C = {
  zenith: '#080f2a',
  skyA: '#101d4a',
  skyB: '#24366a',
  horizon: '#4d5f8f',
  glow: '#ff8a3a',
  cream: '#f4efe4',
  muted: '#b7c1d8',
  dim: '#7f8bab',
  amber: '#ffb45e',
  amber2: '#ff9a3d',
  paper: '#ffe2b0',
  moon: '#e8efff',
  fire: '#c8ff6a',
  cap: '#f2542d',
  hoodie: '#9aa1ad',
  hoodieDark: '#6f7581',
  pack: '#2f5fae',
  skin: '#e3a97b',
  pants: '#1a2030',
  ink: '#050a17',
  water: '#0b1a38',
  land: '#060c1c',
  panel: '#0a1330',
  line: '#2a3a6a',
};

export const SERIF = "Fraunces, 'Iowan Old Style', 'Palatino Linotype', Georgia, serif";
export const SANS = "'Instrument Sans', -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";
export const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const r1 = (n) => Math.round(n * 10) / 10;
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Keyframes shared by every file. Elements pick a class and tune it with
// inline animation-duration / animation-delay.
export const BASE_CSS = `
svg{font-family:${SANS}}
.o{transform-box:fill-box;transform-origin:center}
.ob{transform-box:fill-box;transform-origin:50% 100%}
.ol{transform-box:fill-box;transform-origin:0% 50%}
.ot{transform-box:fill-box;transform-origin:50% 0%}
.tw{animation:tw 4s ease-in-out infinite alternate}
.flick{animation:flick 3.4s linear infinite}
.bob{animation:bob 5s ease-in-out infinite alternate}
.bob2{animation:bob2 6.5s ease-in-out infinite alternate}
.sway{animation:sway 9s ease-in-out infinite alternate}
.swayf{animation:swayf 6s ease-in-out infinite alternate}
.hang{animation:hang 4.5s ease-in-out infinite alternate}
.pulse{animation:pulse 5s ease-in-out infinite alternate}
.drift{animation:drift 16s ease-in-out infinite alternate}
.mist{animation:mist 22s ease-in-out infinite alternate}
.rise{animation:rise 6s ease-out infinite}
.ripple{animation:ripple 3.6s ease-out infinite}
.orbit{animation:orbit 5s linear infinite}
.blink{animation:blink 3s ease-in-out infinite}
.fall{animation:fall 1.4s linear infinite}
.shim{animation:shim 3.2s ease-in-out infinite alternate}
.sweep{animation:sweep 6s ease-in-out infinite}
.paddle{animation:paddle 2.4s ease-in-out infinite alternate}
.wave{animation:wave 1.1s ease-in-out infinite alternate}
.walk{animation:walkbob .42s ease-in-out infinite alternate}
@keyframes tw{0%{opacity:calc(var(--o,1)*.18)}100%{opacity:var(--o,1)}}
@keyframes flick{0%{opacity:calc(var(--o,1)*.86)}9%{opacity:var(--o,1)}17%{opacity:calc(var(--o,1)*.8)}31%{opacity:calc(var(--o,1)*.97)}44%{opacity:calc(var(--o,1)*.84)}58%{opacity:var(--o,1)}71%{opacity:calc(var(--o,1)*.88)}86%{opacity:calc(var(--o,1)*.98)}100%{opacity:calc(var(--o,1)*.86)}}
@keyframes bob{0%{transform:translateY(0)}100%{transform:translateY(-5px)}}
@keyframes bob2{0%{transform:translateY(0) rotate(-.6deg)}100%{transform:translateY(-3px) rotate(.7deg)}}
@keyframes sway{0%{transform:rotate(-.9deg)}100%{transform:rotate(1.2deg)}}
@keyframes swayf{0%{transform:rotate(-3deg)}100%{transform:rotate(3.4deg)}}
@keyframes hang{0%{transform:rotate(-4deg)}100%{transform:rotate(4.5deg)}}
@keyframes pulse{0%{transform:scale(.94);opacity:calc(var(--o,1)*.75)}100%{transform:scale(1.08);opacity:var(--o,1)}}
@keyframes drift{0%{transform:translateX(-14px)}100%{transform:translateX(14px)}}
@keyframes mist{0%{transform:translateX(-46px);opacity:calc(var(--o,1)*.6)}100%{transform:translateX(46px);opacity:var(--o,1)}}
@keyframes rise{0%{transform:translateY(0) scale(.7);opacity:0}25%{opacity:calc(var(--o,1)*.4)}100%{transform:translateY(-34px) scale(1.5);opacity:0}}
@keyframes ripple{0%{transform:scale(.15);opacity:calc(var(--o,1)*.75)}100%{transform:scale(1.7);opacity:0}}
@keyframes orbit{to{transform:rotate(360deg)}}
@keyframes blink{0%,100%{opacity:calc(var(--o,1)*.1)}45%,60%{opacity:var(--o,1)}}
@keyframes fall{to{stroke-dashoffset:-72}}
@keyframes shim{0%{opacity:calc(var(--o,1)*.3);transform:scaleX(.7)}100%{opacity:var(--o,1);transform:scaleX(1.1)}}
@keyframes sweep{0%,25%{transform:translateX(-120%)}75%,100%{transform:translateX(220%)}}
@keyframes paddle{0%{transform:rotate(-7deg)}100%{transform:rotate(9deg)}}
@keyframes wave{0%{transform:rotate(-14deg)}100%{transform:rotate(16deg)}}
@keyframes walkbob{0%{transform:translateY(0) rotate(-1.4deg)}100%{transform:translateY(-3px) rotate(1.4deg)}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
`;

export function doc({ w, h, title, desc, defs = '', css = '', body }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-labelledby="t d">
<title id="t">${esc(title)}</title><desc id="d">${esc(desc)}</desc>
<defs>${defs}</defs>
<style>${BASE_CSS}${css}</style>
${body}
</svg>
`;
}

// ---- shared gradients -------------------------------------------------------
export const GRADS = `
<radialGradient id="lg" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffb060" stop-opacity=".62"/><stop offset=".45" stop-color="#ff8a30" stop-opacity=".22"/><stop offset="1" stop-color="#ff8a30" stop-opacity="0"/></radialGradient>
<radialGradient id="ffg" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#c8ff6a" stop-opacity=".9"/><stop offset=".4" stop-color="#c8ff6a" stop-opacity=".25"/><stop offset="1" stop-color="#c8ff6a" stop-opacity="0"/></radialGradient>
<radialGradient id="moong" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#b8ccff" stop-opacity=".5"/><stop offset=".35" stop-color="#8fa8ff" stop-opacity=".16"/><stop offset="1" stop-color="#8fa8ff" stop-opacity="0"/></radialGradient>
<linearGradient id="paper" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff9a3d"/><stop offset=".5" stop-color="#fff0cc"/><stop offset="1" stop-color="#ff9a3d"/></linearGradient>
<linearGradient id="refl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb060" stop-opacity=".5"/><stop offset="1" stop-color="#ffb060" stop-opacity="0"/></linearGradient>
`;

// ---- stars ------------------------------------------------------------------
// Five groups, each twinkling on its own beat, so the sky never pulses as one.
export function stars({ w, yMax, count = 110, seed = 5, x0 = 0 }) {
  const rand = rng(seed);
  const groups = [[], [], [], [], []];
  for (let i = 0; i < count; i++) {
    const g = i % 5;
    const x = x0 + rand() * w;
    const y = rand() * yMax * (0.35 + 0.65 * rand());
    const mag = Math.pow(rand(), 3);
    const r = 0.5 + mag * 1.5;
    const tint = rand() < 0.2 ? '#ffe9c8' : rand() < 0.4 ? '#cfe0ff' : '#ffffff';
    groups[g].push(`<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(r)}" fill="${tint}"/>`);
  }
  return groups
    .map((g, i) => `<g class="tw" style="animation-duration:${(3 + i * 1.3).toFixed(1)}s;animation-delay:-${(i * 1.7).toFixed(1)}s">${g.join('')}</g>`)
    .join('');
}

// ---- moon -------------------------------------------------------------------
export function moon(cx, cy, r = 34) {
  return `<g>
<circle cx="${cx}" cy="${cy}" r="${r * 4.2}" fill="url(#moong)" class="o pulse" style="animation-duration:7s"/>
<circle cx="${cx}" cy="${cy}" r="${r}" fill="${C.moon}"/>
<circle cx="${cx - r * 0.3}" cy="${cy - r * 0.2}" r="${r * 0.22}" fill="#c3cff0" opacity=".7"/>
<circle cx="${cx + r * 0.32}" cy="${cy + r * 0.28}" r="${r * 0.3}" fill="#c3cff0" opacity=".55"/>
<circle cx="${cx + r * 0.1}" cy="${cy - r * 0.5}" r="${r * 0.14}" fill="#c3cff0" opacity=".6"/>
<circle cx="${cx - r * 0.42}" cy="${cy + r * 0.38}" r="${r * 0.12}" fill="#c3cff0" opacity=".5"/>
</g>`;
}

// ---- trees ------------------------------------------------------------------
// Returns path data (one closed subpath per tree) so a whole layer is one <path>.
export function pinePath(x, by, h, w, rand) {
  const n = 5 + Math.floor(rand() * 3);
  const top = by - h;
  const step = (h * 0.9) / n;
  const R = [`M${r1(x)} ${r1(top)}`];
  const L = [];
  for (let i = 1; i <= n; i++) {
    const y = top + step * i * 0.98;
    const hw = w * (0.22 + 0.78 * (i / n)) * (0.92 + rand() * 0.16);
    R.push(`L${r1(x + hw)} ${r1(y)}`, `L${r1(x + hw * 0.42)} ${r1(y - step * 0.05)}`);
    L.unshift(`L${r1(x - hw * 0.42)} ${r1(y - step * 0.05)}`, `L${r1(x - hw)} ${r1(y)}`);
  }
  const tw = w * 0.07 + 1.5;
  return [...R, `L${r1(x + tw)} ${r1(by)}`, `L${r1(x - tw)} ${r1(by)}`, ...L, 'Z'].join('');
}
export function oakPath(x, by, h, w, rand) {
  const tw = Math.max(1.6, w * 0.06);
  const trunkTop = by - h * 0.5;
  const parts = [`M${r1(x - tw)} ${r1(by)}L${r1(x - tw * 0.7)} ${r1(trunkTop)}L${r1(x + tw * 0.7)} ${r1(trunkTop)}L${r1(x + tw)} ${r1(by)}Z`];
  const blobs = 6 + Math.floor(rand() * 3);
  for (let i = 0; i < blobs; i++) {
    const a = (i / blobs) * Math.PI * 2;
    const bx = x + Math.cos(a) * w * 0.34 * (0.6 + rand() * 0.6);
    const byy = by - h * 0.72 + Math.sin(a) * h * 0.2 * (0.6 + rand() * 0.6);
    const rr = w * (0.24 + rand() * 0.14);
    parts.push(`M${r1(bx - rr)} ${r1(byy)}a${r1(rr)} ${r1(rr)} 0 1 0 ${r1(rr * 2)} 0a${r1(rr)} ${r1(rr)} 0 1 0 ${r1(-rr * 2)} 0Z`);
  }
  return parts.join('');
}
// A row of mixed trees between x0 and x1, small ones behind big ones.
export function forestPath({ x0, x1, by, hMin, hMax, gap, seed, oakShare = 0.4 }) {
  const rand = rng(seed);
  const out = [];
  for (let x = x0; x < x1; x += gap * (0.55 + rand() * 0.9)) {
    const h = hMin + rand() * (hMax - hMin);
    const w = h * (0.32 + rand() * 0.12);
    out.push(rand() < oakShare ? oakPath(x, by + rand() * 6, h, w * 1.5, rand) : pinePath(x, by + rand() * 6, h, w, rand));
  }
  return out.join('');
}

// ---- lantern ----------------------------------------------------------------
// Origin at the centre of the paper body; about 54 tall. `refl` adds the
// wobbling reflection on water below it.
export function lantern({ glow = 1, refl = false, seed = 1, flame = true } = {}) {
  const d = (seed * 0.37) % 3;
  return `<g>
<circle r="${r1(64 * glow)}" fill="url(#lg)" class="o flick" style="animation-duration:${(3 + (seed % 5) * 0.4).toFixed(1)}s;animation-delay:-${d.toFixed(1)}s"/>
${refl ? `<ellipse cx="0" cy="58" rx="9" ry="26" fill="url(#refl)" class="o shim" style="animation-duration:${(2.6 + (seed % 4) * 0.5).toFixed(1)}s"/>` : ''}
<path d="M-15 -21Q-21 0-15 21L15 21Q21 0 15 -21Z" fill="url(#paper)"/>
<path d="M-17 -8Q0 -2 17 -8M-19.5 4Q0 10 19.5 4M-16 -19Q0 -14 16 -19" fill="none" stroke="#7a3a12" stroke-opacity=".38" stroke-width="1"/>
<path d="M0 -21V21M-8 -20Q-11 0-8 20M8 -20Q11 0 8 20" fill="none" stroke="#7a3a12" stroke-opacity=".22" stroke-width=".8"/>
<rect x="-11" y="-27" width="22" height="7" rx="2" fill="#5a3a22"/>
<ellipse cx="0" cy="23" rx="19" ry="4" fill="#5a3a22"/>
${flame ? `<ellipse cy="2" rx="4.2" ry="9" fill="#fff8e0" opacity=".95" class="o flick" style="animation-duration:1.7s"/>` : ''}
</g>`;
}

// ---- fireflies --------------------------------------------------------------
// Each one wanders on its own keyframes (returned in `css`) and blinks on its own beat.
export function fireflies({ n, box, seed = 11, scale = 1, prefix = 'ff' }) {
  const rand = rng(seed);
  let css = '';
  let body = '';
  for (let i = 0; i < n; i++) {
    const x = box[0] + rand() * (box[2] - box[0]);
    const y = box[1] + rand() * (box[3] - box[1]);
    const pts = [];
    for (let k = 0; k < 5; k++) pts.push([r1((rand() - 0.5) * 90), r1((rand() - 0.5) * 60)]);
    const name = `${prefix}${i}`;
    css += `@keyframes ${name}{0%{transform:translate(0,0)}20%{transform:translate(${pts[0][0]}px,${pts[0][1]}px)}40%{transform:translate(${pts[1][0]}px,${pts[1][1]}px)}60%{transform:translate(${pts[2][0]}px,${pts[2][1]}px)}80%{transform:translate(${pts[3][0]}px,${pts[3][1]}px)}100%{transform:translate(0,0)}}`;
    const dur = 16 + rand() * 18;
    const s = (0.7 + rand() * 0.7) * scale;
    body += `<g transform="translate(${r1(x)} ${r1(y)}) scale(${r1(s)})"><g style="animation:${name} ${dur.toFixed(1)}s ease-in-out infinite -${(rand() * dur).toFixed(1)}s"><circle r="10" fill="url(#ffg)" class="blink" style="animation-duration:${(2.4 + rand() * 3.4).toFixed(1)}s;animation-delay:-${(rand() * 5).toFixed(1)}s"/><circle r="1.7" fill="#eaffb8" class="blink" style="animation-duration:${(2.4 + rand() * 3.4).toFixed(1)}s;animation-delay:-${(rand() * 5).toFixed(1)}s"/></g></g>`;
  }
  return { css, body };
}

// ---- foreground ferns and leaves ---------------------------------------------
export function fern(x, y, size, rot, color, seed = 1) {
  const rand = rng(seed);
  const leaves = [];
  const n = 9;
  for (let i = 0; i < n; i++) {
    const a = -90 + (i - (n - 1) / 2) * 17 + (rand() - 0.5) * 6;
    const len = size * (0.65 + rand() * 0.45);
    const rad = (a * Math.PI) / 180;
    const ex = Math.cos(rad) * len;
    const ey = Math.sin(rad) * len;
    const nx = -Math.sin(rad) * len * 0.09;
    const ny = Math.cos(rad) * len * 0.09;
    leaves.push(`M0 0Q${r1(ex * 0.5 + nx)} ${r1(ey * 0.5 + ny)} ${r1(ex)} ${r1(ey)}Q${r1(ex * 0.5 - nx)} ${r1(ey * 0.5 - ny)} 0 0Z`);
  }
  return `<g transform="translate(${x} ${y}) rotate(${rot})"><path class="ob swayf" style="animation-duration:${(5 + rand() * 3).toFixed(1)}s;animation-delay:-${(rand() * 4).toFixed(1)}s" d="${leaves.join('')}" fill="${color}"/></g>`;
}

// ---- the guide --------------------------------------------------------------
// A small side-on figure in the portfolio's colours: red cap, glasses, grey
// hoodie, blue pack. Origin at his feet (hips at y=-30). `pose`: 'paddle'
// (seated in a canoe, hand on the paddle) or 'wave' (standing, right arm waving).
export function guide({ pose = 'wave', flip = false } = {}) {
  const head = `
<circle cx="0" cy="-86" r="15" fill="${C.skin}"/>
<path d="M-15 -90Q-14 -108 2 -108Q16 -107 15 -90Q4 -96 -15 -90Z" fill="${C.cap}"/>
<path d="M8 -92Q26 -93 27 -88Q18 -86 8 -87Z" fill="#d6431f"/>
<path d="M-15 -90Q-15 -97 -11 -100" stroke="#231a17" stroke-width="3.2" fill="none" stroke-linecap="round"/>
<circle cx="9" cy="-84" r="5.4" fill="none" stroke="#1b1f2a" stroke-width="1.5"/>
<circle cx="9.6" cy="-84" r="1.4" fill="#1b1f2a"/>
<path d="M4 -73Q10 -70 15 -73" stroke="#7a3a2a" stroke-width="1.4" fill="none" stroke-linecap="round"/>`;
  const body = `
<rect x="-30" y="-70" width="17" height="36" rx="6" fill="${C.pack}"/>
<rect x="-24" y="-64" width="6" height="8" rx="2" fill="#1d3f7a"/>
<path d="M-16 -70Q-20 -50 -14 -30L16 -30Q22 -50 14 -70Q0 -76 -16 -70Z" fill="${C.hoodie}"/>
<path d="M-14 -70Q0 -60 14 -70" fill="none" stroke="${C.hoodieDark}" stroke-width="2"/>
<rect x="-14" y="-33" width="30" height="5" rx="2" fill="#cf3a2a"/>`;
  const farArm = `<g class="paddle" style="transform-box:view-box;transform-origin:2px -58px"><path d="M0 -60Q18 -78 34 -94" stroke="${C.hoodieDark}" stroke-width="8" stroke-linecap="round" fill="none"/></g>`;
  const nearArm = `<g class="paddle" style="transform-box:view-box;transform-origin:2px -58px"><path d="M4 -60Q28 -50 51 -58" stroke="${C.hoodie}" stroke-width="9" stroke-linecap="round" fill="none"/><circle cx="52" cy="-58" r="4.8" fill="${C.skin}"/></g>`;
  const armWave = `
<g class="wave" style="transform-box:view-box;transform-origin:2px -60px">
<path d="M2 -60Q22 -68 30 -92" stroke="${C.hoodie}" stroke-width="9" stroke-linecap="round" fill="none"/>
<circle cx="31" cy="-98" r="5.4" fill="${C.skin}"/>
<path d="M27 -103l0 -6M31 -104l0 -7M35 -103l0 -6" stroke="${C.skin}" stroke-width="2.4" stroke-linecap="round"/>
</g>`;
  const armDown = `<path d="M-2 -58Q6 -42 4 -30" stroke="${C.hoodie}" stroke-width="9" stroke-linecap="round" fill="none"/><circle cx="4" cy="-27" r="4.6" fill="${C.skin}"/>`;
  const legs = `<rect x="-11" y="-30" width="9" height="34" rx="3" fill="${C.pants}"/><rect x="2" y="-30" width="9" height="34" rx="3" fill="${C.pants}"/><path d="M-13 4h13l4 5h-17Z M1 4h13l5 5h-18Z" fill="#c9ccd6"/>`;
  const walking = pose === 'wave';
  return `<g${flip ? ' transform="scale(-1 1)"' : ''}>${walking ? '' : farArm}${body}${walking ? legs + armDown : nearArm}${head}${walking ? armWave : ''}</g>`;
}

// the paddle itself: drawn over the hull so the blade dips into the water in front of the boat
export function paddleShaft() {
  return `<g class="paddle" style="transform-box:view-box;transform-origin:2px -58px">
<path d="M34 -98L90 30" stroke="#a9744a" stroke-width="4.6" stroke-linecap="round"/>
<rect x="24" y="-100" width="17" height="4.6" rx="2.3" fill="#a9744a" transform="rotate(-8 33 -98)"/>
<ellipse cx="93" cy="38" rx="8" ry="19" fill="#b9814f" transform="rotate(-13 93 38)"/>
<circle cx="34" cy="-93" r="4.6" fill="${C.skin}"/>
</g>`;
}

// an iron lamp on a wooden post with a paper lantern hanging from its arm
export function lampPost({ h = 130, seed = 1 }) {
  return `<g>
<rect x="-3" y="${-h}" width="6" height="${h}" rx="2" fill="#2a1d14"/>
<path d="M0 ${-h + 6}Q22 ${-h - 4} 34 ${-h + 8}" stroke="#2a1d14" stroke-width="4" fill="none" stroke-linecap="round"/>
<g transform="translate(34 ${-h + 30}) scale(.62)"><g class="ot hang" style="animation-duration:${(4 + (seed % 3)).toFixed(1)}s">${lantern({ seed, glow: 1.3, flame: true })}</g></g>
</g>`;
}

export function vignette(w, h, id = 'vig', strength = 0.6) {
  return {
    def: `<radialGradient id="${id}" cx="50%" cy="46%" r="75%"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="${strength}"/></radialGradient>`,
    body: `<rect width="${w}" height="${h}" fill="url(#${id})"/>`,
  };
}

// ---- text helpers -----------------------------------------------------------
// SVG cannot measure text, so wrapping uses an average glyph width (em fraction).
export const GLYPH = { sans: 0.53, serif: 0.5, mono: 0.6 };
export function wrap(text, maxWidth, size, kind = 'sans') {
  const per = size * GLYPH[kind];
  const maxChars = Math.max(8, Math.floor(maxWidth / per));
  const words = String(text).split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > maxChars && cur) {
      lines.push(cur);
      cur = w;
    } else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(cur);
  return lines;
}
export function textLines(lines, { x, y, size = 18, lh = 1.45, fill = C.muted, family = SANS, weight = 400, anchor = 'start', spacing = 0, extra = '' }) {
  return lines
    .map((l, i) => `<text x="${r1(x)}" y="${r1(y + i * size * lh)}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${spacing ? ` letter-spacing="${spacing}"` : ''}${extra ? ' ' + extra : ''}>${esc(l)}</text>`)
    .join('');
}

// Section heading in the portfolio's style: small spaced amber eyebrow, big serif title, optional sub.
export function heading({ eyebrow, title, sub, x = 64, y = 80, size = 54, w = 760 }) {
  let out = `<text x="${x}" y="${y}" font-family="${SANS}" font-size="13" letter-spacing="5.5" fill="${C.amber}" opacity=".95">${esc(eyebrow)}</text>`;
  out += `<g class="bob" style="animation-duration:9s"><text x="${x + 2}" y="${y + size + 6}" font-family="${SERIF}" font-size="${size}" fill="#02040b" opacity=".6">${esc(title)}</text><text x="${x}" y="${y + size + 4}" font-family="${SERIF}" font-size="${size}" fill="${C.cream}">${esc(title)}</text></g>`;
  if (sub) out += textLines(wrap(sub, w, 19), { x, y: y + size + 40, size: 19, fill: C.muted });
  return out;
}

// A night panel: rounded dark gradient with stars, used behind every section.
// Returns { defs, open, close } so a module can sandwich its drawing between them.
export function panel({ w, h, id = 'pn', seed = 3, starCount, ground = 0, tint = 0 }) {
  const defs = `${GRADS}
<linearGradient id="${id}bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.zenith}"/><stop offset=".6" stop-color="#0d1840"/><stop offset="1" stop-color="#16265a"/></linearGradient>
<clipPath id="${id}clip"><rect width="${w}" height="${h}" rx="22"/></clipPath>
<radialGradient id="${id}vig" cx="50%" cy="46%" r="78%"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></radialGradient>`;
  const n = starCount ?? Math.round((w * h) / 9000);
  const open = `<g clip-path="url(#${id}clip)"><rect width="${w}" height="${h}" fill="url(#${id}bg)"/>${tint ? `<ellipse cx="${w * 0.12}" cy="${h}" rx="${w * 0.5}" ry="${h * 0.5}" fill="${C.glow}" opacity="${tint}"/>` : ''}${stars({ w, yMax: h * 0.8, count: n, seed })}`;
  const close = `<rect width="${w}" height="${h}" fill="url(#${id}vig)"/></g><rect x=".75" y=".75" width="${w - 1.5}" height="${h - 1.5}" rx="21.5" fill="none" stroke="${C.line}" stroke-opacity=".7" stroke-width="1.5"/>`;
  return { defs, open, close };
}
