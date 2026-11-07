import { getCollection, type CollectionEntry } from 'astro:content';
import { CATEGORIES, type Category } from './categories';
// @ts-ignore plain JS module shared with scripts/photos.mjs
import { PHOTO_SIZES, LOCAL_PREFIX, sizedPath } from './photo-sizes.mjs';

export type Recipe = CollectionEntry<'recipes'>;
type IngredientList = Recipe['data']['ingredients'];

/** All published recipes, newest first, then A to Z. Drafts show only while previewing locally. */
export async function getRecipes(): Promise<Recipe[]> {
  const all = await getCollection('recipes', ({ data }) => (import.meta.env.PROD ? !data.draft : true));
  return all.sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf() || a.data.title.localeCompare(b.data.title),
  );
}

export function totalMinutes(r: Recipe): number {
  return r.data.prepMinutes + r.data.cookMinutes + r.data.restMinutes;
}

/** 45 -> "45 min", 380 -> "6 hr 20 min" */
export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} hr ${m} min` : `${h} hr`;
}

/** Time in the format Google expects for recipes, e.g. PT1H30M */
export function isoDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `PT${h ? `${h}H` : ''}${m || !h ? `${m}M` : ''}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function recipePath(r: Recipe): string {
  return `/recipes/${r.id}/`;
}

export function categoryPath(category: string): string {
  return `/recipes/category/${slugify(category)}/`;
}

/** Meals that have at least one recipe, in menu order, with counts. */
export function categoriesInUse(recipes: Recipe[]): { name: Category; count: number }[] {
  return CATEGORIES.map((name) => ({
    name,
    count: recipes.filter((r) => r.data.category === name).length,
  })).filter((c) => c.count > 0);
}

/** Plain lines stay together in one list; named sections ("For the topping") get their own list. */
export function groupIngredients(list: IngredientList): { section?: string; items: string[] }[] {
  const groups: { section?: string; items: string[] }[] = [];
  for (const item of list) {
    if (typeof item === 'string') {
      const last = groups[groups.length - 1];
      if (last && !last.section) last.items.push(item);
      else groups.push({ items: [item] });
    } else {
      groups.push({ section: item.section, items: item.items });
    }
  }
  return groups;
}

export function flatIngredients(list: IngredientList): string[] {
  return list.flatMap((item) => (typeof item === 'string' ? [item] : item.items));
}

const UNSPLASH = 'https://images.unsplash.com/';

/**
 * A sized copy of a recipe photo. Unsplash photos are resized and cropped by Unsplash's own
 * image service (and must be loaded from there under their rules); local photos are used as-is.
 */
export function photo(src: string, width: number, height: number): string {
  if (src.startsWith(LOCAL_PREFIX)) return localPhoto(src, width, height);
  if (!src.startsWith(UNSPLASH)) return src;
  const base = src.split('?')[0];
  return `${base}?ixlib=rb-4.1.0&auto=format&fit=crop&crop=entropy&w=${width}&h=${height}&q=75`;
}

/** Our own photo (public/images/...) at a size made by scripts/photos.mjs. */
function localPhoto(src: string, width: number, height: number): string {
  if (!(PHOTO_SIZES as number[][]).some(([w, h]) => w === width && h === height)) {
    throw new Error(`Photo size ${width}x${height} isn't in src/lib/photo-sizes.mjs. Add it there.`);
  }
  return sizedPath(src, width, height);
}

/** srcset for a photo at a fixed aspect ratio, e.g. 4/3 */
export function photoSrcset(src: string, ratio: number, widths: number[]): string | undefined {
  if (src.startsWith(LOCAL_PREFIX)) {
    return widths.map((w) => `${localPhoto(src, w, Math.round(w / ratio))} ${w}w`).join(', ');
  }
  if (!src.startsWith(UNSPLASH)) return undefined;
  return widths.map((w) => `${photo(src, w, Math.round(w / ratio))} ${w}w`).join(', ');
}

/** Absolute photo address for Google and link previews. */
export function absolutePhoto(src: string, site: URL | undefined, width: number, height: number): string {
  return new URL(photo(src, width, height), site).href;
}

const UTM = 'utm_source=superdadscookbook&utm_medium=referral';

/** Photographer link with the referral tag Unsplash asks for. */
export function creditLink(url: string): string {
  if (!url.includes('unsplash.com')) return url;
  return `${url}${url.includes('?') ? '&' : '?'}${UTM}`;
}

export const UNSPLASH_HOME = `https://unsplash.com/?${UTM}`;

/** Servings as a plain number for Google: "4 servings" -> 4, "about 4 dozen cookies" -> 48. */
export function servingsNumber(r: Recipe): number | undefined {
  if (r.data.servingsCount) return r.data.servingsCount;
  const match = r.data.servings.match(/\d+/);
  if (!match) return undefined;
  const n = Number(match[0]);
  return /dozen/i.test(r.data.servings) ? n * 12 : n;
}

/** Text the recipe search box matches against. */
export function searchText(r: Recipe): string {
  const d = r.data;
  return [d.title, d.description, d.category, ...d.tags, ...flatIngredients(d.ingredients)]
    .join(' ')
    .toLowerCase();
}
