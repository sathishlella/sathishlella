// Builds every animated SVG used by the profile README into assets/forest/.
//   node tools/forest/build.mjs            all modules
//   node tools/forest/build.mjs hero       only the module hero.mjs
// Each module (any *.mjs here except lib, content, build, png) default-exports
// a function returning { 'file.svg': '<svg...>' }. The pictures are generated:
// edit a module or content.mjs and rebuild.
import { mkdirSync, writeFileSync, readdirSync } from 'node:fs';

const OUT = new URL('../../assets/forest/', import.meta.url);
mkdirSync(OUT, { recursive: true });

// Shared opacity keyframes scale an element's own opacity (calc(var(--o,1) * ...)),
// so every element that has both an opacity attribute and one of those classes
// gets that opacity copied into the --o variable.
const OPA = /\b(tw|flick|pulse|shim|rise|ripple|blink|mist)\b/;
function carryOpacity(svg) {
  return svg.replace(/<(?:ellipse|circle|rect|path|g|text|use|line|polygon)\b[^>]*>/g, (tag) => {
    const c = tag.match(/\sclass="([^"]*)"/);
    const o = tag.match(/\sopacity="([^"]*)"/);
    if (!c || !o || !OPA.test(c[1])) return tag;
    const v = o[1];
    if (/\sstyle="/.test(tag)) return tag.replace(/\sstyle="/, ` style="--o:${v};`);
    return tag.replace(/\sclass=/, ` style="--o:${v}" class=`);
  });
}

const skip = new Set(['lib.mjs', 'content.mjs', 'build.mjs', 'png.mjs']);
const only = process.argv[2];
let total = 0;
for (const f of readdirSync(new URL('./', import.meta.url)).filter((n) => n.endsWith('.mjs') && !skip.has(n)).sort()) {
  const stem = f.replace(/\.mjs$/, '');
  if (only && only !== stem) continue;
  const mod = await import(new URL(f, import.meta.url));
  const files = mod.default();
  for (const [name, svg0] of Object.entries(files)) {
    const svg = carryOpacity(svg0);
    if (/[\u2013\u2014]/.test(svg)) throw new Error(`${name}: contains an em or en dash`);
    writeFileSync(new URL(name, OUT), svg);
    total += svg.length;
    console.log(`${name.padEnd(28)} ${(svg.length / 1024).toFixed(1).padStart(6)} KB`);
  }
}
console.log(`total ${(total / 1024).toFixed(0)} KB`);
