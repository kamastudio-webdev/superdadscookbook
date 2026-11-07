// Every size the site shows a photo at. Our own photos (in public/images/)
// are cut to these sizes before each build by scripts/photos.mjs, and
// photo() in recipes.ts points at the matching file.
// When a page starts using a new size, add it here.
export const PHOTO_SIZES = [
  // recipe cards (4:3)
  [400, 300], [640, 480], [960, 720],
  // recipe page banner (2:1)
  [800, 400], [1200, 600], [1600, 800], [2200, 1100],
  // home page "Try this one tonight" (16:9)
  [480, 270], [720, 405], [1080, 608],
  // Google recipe images (1:1, 4:3, 16:9) and link previews
  [1200, 1200], [1200, 900], [1200, 675], [1200, 630],
];

export const LOCAL_PREFIX = '/images/';
export const SIZED_DIR = 'sized';

/** "/images/pizza.jpg" + 640x480 -> "/images/sized/pizza-640x480.jpg" */
export function sizedPath(src, width, height) {
  const file = src.slice(LOCAL_PREFIX.length).replace(/\.[a-z0-9]+$/i, '');
  return `${LOCAL_PREFIX}${SIZED_DIR}/${file}-${width}x${height}.jpg`;
}
