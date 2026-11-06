import { getCollection, type CollectionEntry } from 'astro:content';
import { CATEGORIES, type Category } from './categories';

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
  return r.data.prepMinutes + r.data.cookMinutes;
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

/** Text the recipe search box matches against. */
export function searchText(r: Recipe): string {
  const d = r.data;
  return [d.title, d.description, d.category, ...d.tags, ...flatIngredients(d.ingredients)]
    .join(' ')
    .toLowerCase();
}
