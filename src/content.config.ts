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
    servings: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    ingredients: z.array(z.union([z.string(), ingredientGroup])).min(1),
    steps: z.array(z.string()).min(1),
    tips: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { recipes };
