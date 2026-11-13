// Checks the batch-size scaling on known lines and prints every recipe's ingredients at 2× and ½×.
// Run: node scripts/test-scale.mjs [--all]
import { readFileSync, readdirSync } from 'node:fs';
import { scaleLine, scaleMakes } from '../src/lib/scale-amounts.mjs';

const cases = [
  ['1½ cups heavy whipping cream, cold', 2, '3 cups heavy whipping cream, cold'],
  ['¾ cup semisweet chocolate chips', 3, '2¼ cups semisweet chocolate chips'],
  ['¾ cup sugar', 0.5, '6 tablespoons sugar'],
  ['1¾ cups diced celery', 0.5, '¾ cup plus 2 tablespoons diced celery'],
  ['1¼ cups flour', 0.5, '½ cup plus 2 tablespoons flour'],
  ['2 egg whites', 0.5, '1 egg white'],
  ['1 bay leaf', 2, '2 bay leaves'],
  ['3 lb fresh tomatoes, or 2 cans (No. 2½ size, about 28 oz each) tomatoes', 0.5, '1½ lb fresh tomatoes, or 1 can (No. 2½ size, about 28 oz each) tomatoes'],
  ['1 (9 or 10-inch) pie crust', 2, '2 (9 or 10-inch) pie crust'],
  ['⅓ cup honey', 0.5, '2 tablespoons plus 2 teaspoons honey'],
  ['2 teaspoons salt', 3, '2 tablespoons salt'],
  ['17 g sugar (about 4 teaspoons)', 3, '51 g sugar (about ¼ cup)'],
  ['Grated zest of 1 large lemon', 2, 'Grated zest of 2 large lemons'],
  ['Juice of ½ lime', 2, 'Juice of 1 lime'],
  ['1-inch piece fresh ginger, peeled', 2, '2-inch piece fresh ginger, peeled'],
  ['Kosher salt (1 tablespoon for the pasta water and 1½ teaspoons for the shrimp)', 2, 'Kosher salt (2 tablespoons for the pasta water and 1 tablespoon for the shrimp)'],
  ['1 teaspoon cinnamon', 4, '4 teaspoons cinnamon'],
  ['3 tablespoons butter', 3, '½ cup plus 1 tablespoon butter'],
  ['2 tablespoons sugar', 3, '6 tablespoons sugar'],
  ['1 tablespoon olive oil', 4, '¼ cup olive oil'],
  ['1 teaspoon vanilla extract', 3, '1 tablespoon vanilla extract'],
  ['2 teaspoons baking powder', 2, '4 teaspoons baking powder'],
  ['1 tablespoon sugar', 0.5, '1½ teaspoons sugar'],
  ['⅛ teaspoon sea salt', 0.5, '1 pinch sea salt'],
  ['1 package (8 ounces) cream cheese, softened', 2, '2 packages (8 ounces) cream cheese, softened'],
  ['2 cans (15 ounces each) black beans', 2, '4 cans (15 ounces each) black beans'],
  ['1 (15-ounce) can tomato sauce', 3, '3 (15-ounce) can tomato sauce'],
  ['529 g cold water, about 40°F (about 2¼ cups)', 2, '1,058 g cold water, about 40°F (about 4½ cups)'],
  ['3.4 g active dry yeast (about 1 teaspoon)', 0.5, '1.7 g active dry yeast (about ½ teaspoon)'],
  ['2–4 tablespoons water', 2, '4–8 tablespoons water'],
  ['1 large egg', 3, '3 large eggs'],
  ['2 eggs', 0.5, '1 egg'],
  ['1 cup (2 sticks) butter, softened', 2, '2 cups (4 sticks) butter, softened'],
  ['4 boneless chicken breasts (about 2 pounds)', 2, '8 boneless chicken breasts (about 4 pounds)'],
  ['2 cups sliced ripe banana, about 300 g (4 small or 2 medium-large bananas)', 2, '4 cups sliced ripe banana, about 600 g (8 small or 4 medium-large bananas)'],
  ['1 cup plus 2 tablespoons flour', 2, '2 cups plus 4 tablespoons flour'],
  ['1 9-inch pie crust', 2, '2 9-inch pie crust'],
  ['Salt and pepper, to taste', 3, 'Salt and pepper, to taste'],
  ['853 g bread flour (about 6¾ cups), plus more for the counter', 3, '2,559 g bread flour (about 20½ cups), plus more for the counter'],
  ['4 Tablespoons salted butter, melted', 2, '½ cup salted butter, melted'],
];
let fail = 0;
for (const [line, f, want] of cases) {
  const got = scaleLine(line, f);
  if (got !== want) {
    fail++;
    console.log(`FAIL ×${f}: ${line}\n   got:  ${got}\n   want: ${want}`);
  }
}
const makes = [
  ['8 servings (one 9-inch pie)', 2, '16 servings'],
  ['1 loaf (9 × 5 inches)', 2, '2 loaves'],
  ['About 30 pancakes, depending on size', 0.5, 'About 15 pancakes'],
  ['6 to 8 servings (24 tacos)', 3, '18 to 24 servings'],
  ['1 large pan of bars', 2, '2 large pans of bars'],
  ['3 large 16-inch pizzas', 2, '6 large 16-inch pizzas'],
  ['1 cookie sheet', 2, '2 cookie sheets'],
  ['1 (12-inch) skillet', 2, '2 (12-inch) skillets'],
];
for (const [t, f, want] of makes) {
  const got = scaleMakes(t, f);
  if (got !== want) {
    fail++;
    console.log(`FAIL makes ×${f}: ${t}\n   got:  ${got}\n   want: ${want}`);
  }
}
console.log(fail ? `${fail} failed` : 'all checks passed');

if (process.argv.includes('--all')) {
  const dir = 'src/content/recipes/';
  for (const f of readdirSync(dir)) {
    const text = readFileSync(dir + f, 'utf8');
    if (/^draft: true/m.test(text)) continue;
    const lines = [...text.matchAll(/^\s+- (?!section:)(.+)$/gm)].map((m) => m[1]);
    const ing = text.split(/^ingredients:/m)[1]?.split(/^steps:/m)[0] ?? '';
    for (const m of ing.matchAll(/^\s+- (?!section:)(.+)$/gm)) {
      const line = m[1].replace(/^"|"$/g, '');
      const two = scaleLine(line, 2);
      const half = scaleLine(line, 0.5);
      console.log(`${f.replace('.md', '')}\t${line}\n\t2×  ${two}\n\t½×  ${half}`);
    }
    void lines;
  }
}
