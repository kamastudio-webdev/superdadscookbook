// The meals a recipe can be filed under. Add a new one here if you need it.
export const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Sides', 'Breads', 'Snacks', 'Dessert', 'Drinks', 'Basics'] as const;

export type Category = (typeof CATEGORIES)[number];

// Each meal gets its own color, used for the dots on the meal links.
export const CATEGORY_COLORS: Record<Category, string> = {
  Breakfast: 'var(--yellow)',
  Lunch: 'var(--herb)',
  Dinner: 'var(--blue)',
  Sides: 'var(--herb)',
  Breads: 'var(--wheat)',
  Snacks: 'var(--yellow)',
  Dessert: 'var(--red)',
  Drinks: 'var(--blue)',
  Basics: 'var(--wheat)',
};
