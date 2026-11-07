// Cuts every photo in public/images/ to the sizes the site uses.
// Runs automatically before `npm run build` and `npm run dev`.
// Output goes to public/images/sized/ (not saved in git; rebuilt each time).
import { readdir, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { PHOTO_SIZES, LOCAL_PREFIX, SIZED_DIR, sizedPath } from '../src/lib/photo-sizes.mjs';

const root = path.resolve(import.meta.dirname, '..', 'public');
const imagesDir = path.join(root, 'images');
const outDir = path.join(imagesDir, SIZED_DIR);

const files = (await readdir(imagesDir, { withFileTypes: true }).catch(() => []))
  .filter((f) => f.isFile() && /\.(jpe?g|png|webp)$/i.test(f.name))
  .map((f) => f.name);

await mkdir(outDir, { recursive: true });

let made = 0;
for (const name of files) {
  const src = path.join(imagesDir, name);
  const srcTime = (await stat(src)).mtimeMs;
  for (const [w, h] of PHOTO_SIZES) {
    const out = path.join(root, sizedPath(LOCAL_PREFIX + name, w, h));
    const done = await stat(out).then((s) => s.mtimeMs >= srcTime).catch(() => false);
    if (done) continue;
    await sharp(src)
      .rotate() // respect the phone's orientation flag
      .resize(w, h, { fit: 'cover', position: sharp.strategy.attention })
      .jpeg({ quality: 78, mozjpeg: true }) // metadata (like GPS) is dropped
      .toFile(out);
    made++;
  }
}
console.log(`photos: ${files.length} photo(s), ${made} new size(s) made`);
