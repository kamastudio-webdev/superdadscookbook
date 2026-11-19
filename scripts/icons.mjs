// Makes the browser-tab and phone icons in /public from the Super Dad emblem
// (a flying spatula wearing a red cape). Run it again only if the emblem changes:
//   node scripts/icons.mjs
// The drawing matches src/components/Emblem.astro, with thicker lines so it still reads when tiny.
import { writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const INK = '#141833';
const BLUE = '#1E3FBF';

// Two weights: "tiny" for 16–48 px browser tabs, "small" for phone home screens.
const weights = {
  tiny: { ring: 10, cape: 0, blade: 8, handle: 0, handleFill: INK },
  small: { ring: 8, cape: 5, blade: 6, handle: 5, handleFill: BLUE },
};

function emblem(w) {
  const capeStroke = w.cape ? ` stroke="${INK}" stroke-width="${w.cape}" stroke-linejoin="round"` : '';
  const handleStroke = w.handle ? ` stroke="${INK}" stroke-width="${w.handle}"` : '';
  return `<circle cx="60" cy="60" r="54" fill="#FFC928" stroke="${INK}" stroke-width="${w.ring}"/>
  <g transform="rotate(35 60 60)">
    <path d="M54 52 C 40 58, 30 70, 26 92 C 38 86, 46 88, 56 80 C 52 72, 52 62, 54 52 Z" fill="#E43A2F"${capeStroke}/>
    <rect x="44" y="18" width="32" height="34" rx="6" fill="#FFFFFF" stroke="${INK}" stroke-width="${w.blade}"/>
    <rect x="56" y="50" width="8" height="52" rx="4" fill="${w.handleFill}"${handleStroke}/>
  </g>`;
}

// Browser tab: the badge on its own, no background
const tabSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  ${emblem(weights.tiny)}
</svg>
`;

// Phone home screen: the badge on a Hero Blue square (phones round the corners themselves)
const appSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
  <rect width="160" height="160" fill="${BLUE}"/>
  <g transform="translate(20 20)">${emblem(weights.small)}</g>
</svg>`;

const png = (svg, size) => sharp(Buffer.from(svg), { density: 1200 }).resize(size, size).png().toBuffer();

// A .ico file is a small header followed by PNG pictures at each size
function ico(images) {
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, data }, i) => {
    const at = 6 + 16 * i;
    header.writeUInt8(size >= 256 ? 0 : size, at);
    header.writeUInt8(size >= 256 ? 0 : size, at + 1);
    header.writeUInt16LE(1, at + 4);
    header.writeUInt16LE(32, at + 6);
    header.writeUInt32LE(data.length, at + 8);
    header.writeUInt32LE(offset, at + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...images.map((im) => im.data)]);
}

await writeFile('public/favicon.svg', tabSvg);
const tabSizes = [16, 32, 48];
await writeFile('public/favicon.ico', ico(await Promise.all(tabSizes.map(async (size) => ({ size, data: await png(tabSvg, size) })))));
await writeFile('public/apple-touch-icon.png', await png(appSvg, 180));
await writeFile('public/icon-192.png', await png(appSvg, 192));
await writeFile('public/icon-512.png', await png(appSvg, 512));
console.log('Icons written to public/');
