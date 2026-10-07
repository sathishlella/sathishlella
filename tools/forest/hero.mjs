import { C, SERIF, SANS, MONO, GRADS, rng, r1, doc, stars, moon, forestPath, pinePath, lantern, fireflies, fern, guide, paddleShaft, vignette, esc } from './lib.mjs';
import { TYPED } from './content.mjs';

const W = 1280;
const H = 560;
const VP = [700, 312];

// cliff outline behind the falls (x, y)
const CLIFF = [[300, 314], [338, 262], [396, 222], [470, 190], [560, 172], [650, 164], [750, 166], [840, 176], [930, 196], [1012, 230], [1070, 272], [1120, 314]];
const cliffTop = (x) => {
  for (let i = 0; i < CLIFF.length - 1; i++) {
    const [ax, ay] = CLIFF[i];
    const [bx, by] = CLIFF[i + 1];
    if (x >= ax && x <= bx) return ay + ((by - ay) * (x - ax)) / (bx - ax);
  }
  return 314;
};

export function hero() {
  const rand = rng(21);
  let css = `
@keyframes driftS{0%{transform:translateX(-6px)}100%{transform:translateX(6px)}}
@keyframes driftM{0%{transform:translateX(-16px)}100%{transform:translateX(16px)}}
.dS{animation:driftS 16s ease-in-out infinite alternate}
.dM{animation:driftM 16s ease-in-out infinite alternate}
@keyframes rad{0%{transform:scale(1);opacity:0}18%{opacity:.4}100%{transform:scale(11);opacity:0}}
.rad{transform-box:view-box;transform-origin:${VP[0]}px ${VP[1]}px;animation:rad 7s cubic-bezier(.55,0,.95,.5) infinite}
@keyframes ty{0%{opacity:0}.5%{opacity:1}14%{opacity:1}14.5%{opacity:0}100%{opacity:0}}
.ty{animation:ty 18.4s linear infinite}
@media (prefers-reduced-motion:reduce){.ty0{opacity:1!important}.bk{display:none}}
`;
  let defs = GRADS;
  defs += `
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.zenith}"/><stop offset=".55" stop-color="${C.skyA}"/><stop offset="1" stop-color="${C.skyB}"/></linearGradient>
<radialGradient id="after" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${C.glow}" stop-opacity=".42"/><stop offset=".55" stop-color="#c0561e" stop-opacity=".14"/><stop offset="1" stop-color="#c0561e" stop-opacity="0"/></radialGradient>
<linearGradient id="riv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a4d7d"/><stop offset=".18" stop-color="#1c2f5a"/><stop offset="1" stop-color="#08132b"/></linearGradient>
<linearGradient id="fallsG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3f8ff" stop-opacity=".9"/><stop offset="1" stop-color="#bcd2ff" stop-opacity=".55"/></linearGradient>
<linearGradient id="glowcol" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b8ccff" stop-opacity=".5"/><stop offset="1" stop-color="#b8ccff" stop-opacity="0"/></linearGradient>
<radialGradient id="fade" cx="26%" cy="42%" r="40%" gradientTransform="translate(0 0)"><stop offset="0" stop-color="#050a17" stop-opacity=".5"/><stop offset="1" stop-color="#050a17" stop-opacity="0"/></radialGradient>
<linearGradient id="landg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#101e44"/><stop offset=".35" stop-color="#0a1432"/><stop offset="1" stop-color="#040815"/></linearGradient>
<radialGradient id="mistg" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#cfe0ff" stop-opacity=".55"/><stop offset="1" stop-color="#cfe0ff" stop-opacity="0"/></radialGradient>
<linearGradient id="haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5f74a8" stop-opacity="0"/><stop offset="1" stop-color="#5f74a8" stop-opacity=".38"/></linearGradient>
`;
  const vg = vignette(W, H, 'vig', 0.62);
  defs += vg.def + `<clipPath id="hclip"><rect width="${W}" height="${H}" rx="22"/></clipPath>`;

  let body = '';
  // ---- sky
  body += `<rect width="${W}" height="${VP[1] + 30}" fill="url(#sky)"/>`;
  body += `<ellipse cx="150" cy="322" rx="480" ry="150" fill="url(#after)" class="o pulse" style="animation-duration:9s"/>`;
  body += stars({ w: W, yMax: 250, count: 130, seed: 5 });
  body += moon(1050, 92, 32);

  // ---- far ridge and far forest
  body += `<path d="M0 ${VP[1] + 4}V262Q90 232 180 252T360 240T560 262T760 236T960 258T1160 232T1280 250V${VP[1] + 4}Z" fill="#101d42"/>`;
  body += `<g class="dS"><path d="${forestPath({ x0: -40, x1: 1320, by: 318, hMin: 44, hMax: 96, gap: 15, seed: 3, oakShare: 0.3 })}" fill="#0e1a3c"/></g>`;
  body += `<rect y="${VP[1] - 50}" width="${W}" height="70" fill="url(#haze)"/>`;

  // ---- cliff and falls
  const cliffD = `M${CLIFF.map((p) => p.join(' ')).join('L')}V${VP[1] + 10}H${CLIFF[0][0]}Z`;
  body += `<path d="${cliffD}" fill="#0a1531"/>`;
  body += `<path d="M${CLIFF.map((p) => p.join(' ')).join('L')}" fill="none" stroke="#5d78c0" stroke-opacity=".38" stroke-width="1.6"/>`;
  for (let i = 0; i < 16; i++) {
    const x = 330 + rand() * 780;
    const t = cliffTop(x);
    body += `<path d="M${r1(x)} ${r1(t + 6)}v${r1(40 + rand() * 90)}" stroke="#1a2b57" stroke-opacity=".55" stroke-width="${r1(2 + rand() * 4)}" stroke-linecap="round"/>`;
  }
  let topTrees = '';
  for (let x = 340; x < 1100; x += 16 + rand() * 20) {
    if (x > 670 && x < 730) continue;
    topTrees += pinePath(x, cliffTop(x) + 3, 20 + rand() * 30, 8 + rand() * 6, rand);
  }
  body += `<path d="${topTrees}" fill="#08112a"/>`;
  body += `<path d="M676 164L724 164L732 ${VP[1] - 1}L668 ${VP[1] - 1}Z" fill="url(#fallsG)"/>`;
  for (let i = 0; i < 9; i++) {
    const x = 682 + i * 4.6 + (rand() - 0.5) * 2;
    const w = 1.6 + rand() * 2.4;
    body += `<path class="fall" d="M${r1(x)} 164L${r1(x + (x - 700) * 0.09)} ${VP[1] - 1}" stroke="#ffffff" stroke-opacity="${r1(0.4 + rand() * 0.4)}" stroke-width="${r1(w)}" stroke-dasharray="14 ${r1(22 + rand() * 20)}" style="animation-duration:${r1(0.8 + rand() * 0.9)}s;animation-delay:-${r1(rand() * 2)}s" fill="none"/>`;
  }
  body += `<rect x="640" y="180" width="120" height="140" fill="url(#glowcol)" opacity=".28"/>`;
  for (let i = 0; i < 5; i++) {
    body += `<ellipse cx="${r1(676 + i * 12 + rand() * 10)}" cy="${VP[1] - 2}" rx="${r1(34 + rand() * 24)}" ry="${r1(9 + rand() * 6)}" fill="url(#mistg)" class="o rise" style="animation-duration:${r1(4 + rand() * 3)}s;animation-delay:-${r1(rand() * 5)}s"/>`;
  }
  body += `<ellipse cx="700" cy="${VP[1] - 4}" rx="130" ry="18" fill="url(#mistg)" opacity=".55" class="mist" style="animation-duration:15s"/>`;

  // ---- mid forest (both banks; the falls stay clear)
  const midL = forestPath({ x0: -60, x1: 610, by: 328, hMin: 90, hMax: 190, gap: 34, seed: 8, oakShare: 0.35 });
  const midR = forestPath({ x0: 790, x1: 1340, by: 328, hMin: 90, hMax: 190, gap: 34, seed: 9, oakShare: 0.35 });
  body += `<g class="dM"><path d="${midL}" fill="#070f26"/><path d="${midR}" fill="#070f26"/></g>`;

  // ---- ground and river
  body += `<rect y="${VP[1] + 6}" width="${W}" height="${H - VP[1] - 6}" fill="url(#landg)"/>`;
  body += `<path d="M666 ${VP[1]}L734 ${VP[1]}L1200 ${H}H200Z" fill="url(#riv)"/>`;
  body += `<path d="M689 ${VP[1] + 2}L711 ${VP[1] + 2}L800 ${H}H600Z" fill="url(#glowcol)" opacity=".55" class="o shim" style="animation-duration:5s"/>`;
  body += `<path d="M666 ${VP[1]}L200 ${H}" stroke="#4a63a8" stroke-opacity=".28" stroke-width="1.4"/><path d="M734 ${VP[1]}L1200 ${H}" stroke="#4a63a8" stroke-opacity=".28" stroke-width="1.4"/>`;
  // flow streaks toward the viewer
  for (let i = 0; i < 20; i++) {
    const ex = 230 + rand() * 950;
    const t0 = 0.03;
    const t1 = 0.05 + rand() * 0.02;
    const x0 = VP[0] + (ex - VP[0]) * t0;
    const y0 = VP[1] + (H - VP[1]) * t0;
    const x1 = VP[0] + (ex - VP[0]) * t1;
    const y1 = VP[1] + (H - VP[1]) * t1;
    body += `<path class="rad" d="M${r1(x0)} ${r1(y0)}L${r1(x1)} ${r1(y1)}" stroke="#a9c2ff" stroke-width="1.1" stroke-linecap="round" vector-effect="non-scaling-stroke" style="animation-duration:${r1(5 + rand() * 5)}s;animation-delay:-${r1(rand() * 9)}s"/>`;
  }

  // ---- trees along the banks, rushing past
  const bank = [];
  for (let i = 0; i < 14; i++) {
    const left = i % 2 === 0;
    const ex = left ? -70 + rand() * 200 : 1150 + rand() * 210;
    const ey = 560 + rand() * 50;
    const sx = VP[0] + (left ? -1 : 1) * (40 + rand() * 40);
    const sy = VP[1] + 2;
    const S = 2.2 + rand() * 1.1;
    const dur = 22 + rand() * 8;
    const name = `bk${i}`;
    css += `@keyframes ${name}{0%{transform:translate(${r1(sx)}px,${r1(sy)}px) scale(.03);opacity:0}8%{opacity:1}80%{opacity:1}100%{transform:translate(${r1(ex)}px,${r1(ey)}px) scale(${r1(S)});opacity:0}}`;
    const tree = rand() < 0.6 ? pinePath(0, 0, 150, 46, rand) : pinePath(0, 0, 190, 52, rand);
    bank.push({ dur, name, tree, delay: (i / 14) * dur });
  }
  body += bank.map((b) => `<path class="bk" d="${b.tree}" fill="#040919" stroke="#2b4386" stroke-opacity=".55" stroke-width="1.2" vector-effect="non-scaling-stroke" style="animation:${b.name} ${r1(b.dur)}s cubic-bezier(.62,.04,.94,.5) infinite -${r1(b.delay)}s"/>`).join('');

  // ---- lanterns drifting down the river
  const lam = [];
  const LN = 10;
  for (let i = 0; i < LN; i++) {
    const ex = 260 + rand() * 860;
    const ey = 520 + rand() * 70;
    const sx = VP[0] + (rand() - 0.5) * 30;
    const sy = VP[1] + 6;
    const S = 1.5 + rand() * 0.7;
    const dur = 26;
    const name = `ln${i}`;
    css += `@keyframes ${name}{0%{transform:translate(${r1(sx)}px,${r1(sy)}px) scale(.05);opacity:0}7%{opacity:1}86%{opacity:1}100%{transform:translate(${r1(ex)}px,${r1(ey)}px) scale(${r1(S)});opacity:0}}`;
    const f = 0.3 + 0.62 * (i / LN);
    lam.push({ dur, name, delay: (i / LN) * dur, rest: `translate(${r1(sx + (ex - sx) * f)} ${r1(sy + (ey - sy) * f)}) scale(${r1(0.12 + (S - 0.12) * f * f)})` });
  }
  body += lam.map((l, i) => `<g transform="${l.rest}" style="animation:${l.name} ${l.dur}s cubic-bezier(.6,.03,.94,.55) infinite -${r1(l.delay)}s"><g class="bob" style="animation-duration:${r1(3 + (i % 4))}s">${lantern({ glow: 1.1, refl: true, seed: i + 2 })}</g></g>`).join('');

  // ---- the canoe with the guide
  body += `<g transform="translate(440 498) scale(1.22)">
<ellipse cx="4" cy="20" rx="150" ry="12" fill="#02050e" opacity=".45"/>
<ellipse cx="4" cy="16" rx="128" ry="9" fill="none" stroke="#9db8ff" stroke-opacity=".5" stroke-width="1.4" class="o ripple" style="animation-duration:3.8s"/>
<ellipse cx="4" cy="16" rx="128" ry="9" fill="none" stroke="#9db8ff" stroke-opacity=".5" stroke-width="1.4" class="o ripple" style="animation-duration:3.8s;animation-delay:-1.9s"/>
<g class="bob2" style="animation-duration:6s">
<path d="M-108 -14Q0 -2 122 -22L122 -18Q0 4 -108 -8Z" fill="#1b0d0a"/>
<g transform="translate(-6 -2)">${guide({ pose: 'paddle' })}</g>
<path d="M-112 -14Q-104 20 -56 24L58 24Q106 22 122 -22Q70 -6 0 -6Q-70 -6 -112 -14Z" fill="#5a281b"/>
<path d="M-112 -14Q-70 -6 0 -6Q70 -6 122 -22" fill="none" stroke="#d29a68" stroke-width="3" stroke-linecap="round"/>
<path d="M-90 8Q0 16 96 6" fill="none" stroke="#8b4a2d" stroke-opacity=".6" stroke-width="2"/>
<g transform="translate(-6 -2)">${paddleShaft()}</g>
<ellipse cx="86" cy="22" rx="20" ry="4.5" fill="none" stroke="#c7d6ff" stroke-opacity=".7" stroke-width="1.4" class="o ripple" style="animation-duration:2.4s"/>
<g transform="translate(30 -116)">
<circle r="46" fill="url(#lg)" class="o pulse" style="animation-duration:3.6s"/>
<circle r="5.4" fill="#fff4cf"/>
<g class="orbit o" style="animation-duration:4.4s"><circle cx="13" cy="0" r="1.8" fill="#ffe2a0"/></g>
<g class="orbit o" style="animation-duration:6.6s;animation-direction:reverse"><circle cx="-18" cy="3" r="1.5" fill="#ffd28a"/></g>
<g class="orbit o" style="animation-duration:8.8s"><circle cx="0" cy="-23" r="1.3" fill="#fff0c0"/></g>
</g>
</g>
</g>`;

  // ---- fireflies (small and far, larger and near)
  const ffFar = fireflies({ n: 16, box: [80, 250, 1240, 420], seed: 31, scale: 0.85, prefix: 'fa' });
  const ffNear = fireflies({ n: 10, box: [40, 380, 1240, 545], seed: 32, scale: 1.7, prefix: 'fb' });
  css += ffFar.css + ffNear.css;
  body += ffFar.body + ffNear.body;

  // ---- foreground leaves
  body += fern(-6, 575, 190, 12, '#03060f', 1);
  body += fern(70, 590, 150, -8, '#050a17', 2);
  body += fern(1290, 578, 200, -14, '#03060f', 3);
  body += fern(1200, 596, 150, 8, '#050a17', 4);
  body += fern(1120, 600, 110, -3, '#04080f', 5);
  body += vg.body;

  // ---- title block
  const x0 = 64;
  const pitch = 13.4;
  let typed = '';
  TYPED.forEach((ph, k) => {
    [...ph].forEach((ch, i) => {
      if (ch === ' ') return;
      const delay = k * 4.6 + i * 0.065;
      typed += `<text x="${r1(x0 + 24 + i * pitch)}" y="292" class="ty${k === 0 ? ' ty0' : ''}" opacity="0" style="animation-delay:${r1(delay)}s" fill="${C.amber}" font-family="${MONO}" font-size="22">${esc(ch)}</text>`;
    });
  });
  body += `<g>
<ellipse cx="330" cy="215" rx="470" ry="170" fill="url(#fade)"/>
<text x="${x0}" y="118" font-family="${SANS}" font-size="13" letter-spacing="6" fill="${C.amber}" opacity=".9">A WALK THROUGH THE FOREST</text>
<g class="bob" style="animation-duration:8s">
<text x="${x0 + 3}" y="203" font-family="${SERIF}" font-size="84" fill="#02040b" opacity=".65">Sathish Lella</text>
<text x="${x0 + 2}" y="202" font-family="${SERIF}" font-size="84" fill="#1a2650">Sathish Lella</text>
<text x="${x0 + 1}" y="201" font-family="${SERIF}" font-size="84" fill="#2a3970">Sathish Lella</text>
<text x="${x0}" y="200" font-family="${SERIF}" font-size="84" fill="${C.cream}">Sathish Lella</text>
</g>
<text x="${x0 + 2}" y="242" font-family="${SANS}" font-size="20" letter-spacing="7" fill="${C.muted}">AI ENGINEER</text>
<text x="${x0 + 2}" y="292" font-family="${MONO}" font-size="22" fill="${C.dim}">&gt;</text>
${typed}
</g>`;

  body = `<g clip-path="url(#hclip)">${body}</g><rect x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}" rx="21.5" fill="none" stroke="${C.line}" stroke-opacity=".7" stroke-width="1.5"/>`;

  return doc({
    w: W,
    h: H,
    title: 'Sathish Lella, AI Engineer',
    desc: 'An animated night scene: a guide in a canoe drifts down a moonlit river toward a waterfall while paper lanterns and fireflies glow. The words read A walk through the forest, Sathish Lella, AI Engineer, followed by LLM applications, RAG and GraphRAG retrieval, agents that plan and act, and secure multi-tenant SaaS.',
    defs,
    css,
    body,
  });
}

export default function build() {
  return { 'hero.svg': hero() };
}
