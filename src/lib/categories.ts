// The meals a recipe can be filed under. Add a new one here if you need it.
export const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Sides', 'Snacks', 'Dessert'] as const;

export type Category = (typeof CATEGORIES)[number];

// Each meal gets its own color, used for the card shadow and the meal links.
export const CATEGORY_COLORS: Record<Category, string> = {
  Breakfast: 'var(--mustard)',
  Lunch: 'var(--herb)',
  Dinner: 'var(--cobalt)',
  Sides: 'var(--herb)',
  Snacks: 'var(--mustard)',
  Dessert: 'var(--tomato)',
};
