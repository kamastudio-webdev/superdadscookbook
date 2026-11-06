import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { CATEGORIES } from './lib/categories';

// Every recipe is a Markdown file in src/content/recipes/.
// The fields below are checked when the site builds, so a typo shows up
// as a clear error instead of a broken page.
const ingredientGroup = z.object({
  section: z.string(),
  items: z.array(z.string()).min(1),
});

const recipes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/recipes' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(CATEGORIES),
    prepMinutes: z.number().int().nonnegative(),
    cookMinutes: z.number().int().nonnegative(),
    /** Hands-off waiting time (rising, chilling). Counts toward the total. */
    restMinutes: z.number().int().nonnegative().default(0),
    restLabel: z.string().default('Rest'),
    servings: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    ingredients: z.array(z.union([z.string(), ingredientGroup])).min(1),
    steps: z.array(z.string()).min(1),
    tips: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    // A photo in public/images/ (like /images/pancakes.jpg) or an Unsplash photo address.
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    // Who took the photo, shown under it. Leave out for your own photos.
    photoCredit: z.string().optional(),
    photoCreditUrl: z.string().url().optional(),
    // For recipes based on someone else's: shown as "Adapted from <name>" with a link.
    adaptedFrom: z.object({ name: z.string(), url: z.string().url() }).optional(),
    // Optional: number of servings for Google, if "servings" doesn't start with a number.
    servingsCount: z.number().int().positive().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { recipes };
