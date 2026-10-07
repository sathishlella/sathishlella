// Static preview: rasterizes an SVG to a PNG (librsvg ignores animation, so this
// shows the resting frame; use it to check layout, wrapping and overlap).
//   node tools/forest/png.mjs assets/forest/about.svg /tmp/about.png [width]
import sharp from '/Users/sathishlella/Documents/Portfolio/forest-portfolio/node_modules/sharp/dist/index.mjs';
import { readFileSync } from 'node:fs';
const [, , src, out, width = '1280'] = process.argv;
await sharp(readFileSync(src), { density: 96 }).resize({ width: Number(width) }).png().toFile(out);
console.log('wrote', out);
