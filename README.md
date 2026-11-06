# Super Dad's Cookbook

The recipe website at superdadscookbook.com, built with [Astro](https://astro.build) and hosted on Netlify. Every time a change is saved to this GitHub repository, Netlify rebuilds the site and puts the new version live within a minute or two.

## Add a new recipe

1. Open the `src/content/recipes/` folder.
2. Copy one of the existing recipe files and give it a new name. Use lowercase words joined by dashes, like `grilled-cheese.md`. The file name becomes the web address: `superdadscookbook.com/recipes/grilled-cheese/`.
3. Change the details at the top of the file, between the two `---` lines:

| Field | What to put |
| --- | --- |
| `title` | Recipe name |
| `description` | One or two sentences shown on recipe cards and in Google |
| `category` | One of: Breakfast, Lunch, Dinner, Sides, Snacks, Dessert |
| `prepMinutes` / `cookMinutes` | Numbers only, like `15` |
| `servings` | Shown after "Makes", like `4 servings` or `12 muffins` |
| `date` | The day you added it, like `2026-11-06` |
| `tags` | Optional words in brackets, like `[kid-friendly, weeknight]` |
| `ingredients` | One line per ingredient, each starting with `- ` |
| `steps` | One line per step, each starting with `- `, in order |
| `tips` | Optional extra tips, same format |
| `featured` | Optional. `true` puts it in the "Try this one tonight" box on the home page |
| `draft` | Optional. `true` hides it from the live site |

If a line contains a colon (`:`), wrap the whole line in double quotes.

To split ingredients into sections, use this format:

```yaml
ingredients:
  - section: For the cake
    items:
      - 2 cups flour
      - 1 cup sugar
  - section: For the frosting
    items:
      - 1 cup powdered sugar
```

Anything you write below the second `---` line shows up above the ingredients, which is a good place for a short story about the recipe.

## Add a photo

Put the photo in the `public/images/` folder (create it the first time), then add these two lines to the recipe:

```yaml
image: /images/grilled-cheese.jpg
imageAlt: Golden grilled cheese sandwich cut in half
```

Landscape photos around 1600 pixels wide or bigger work best. Google needs a photo before it will show a recipe with a picture in search results.

The starter recipes use free Unsplash photos. Those show a credit line under the photo, set with:

```yaml
photoCredit: Thomas Park
photoCreditUrl: https://unsplash.com/@thomascpark
```

When you swap in your own photo, delete those two lines.

## Work on the site on your own computer (optional)

You need [Node.js](https://nodejs.org) version 22 or newer.

```sh
npm install
npm run dev      # preview at http://localhost:4321
npm run build    # build the finished site into the dist/ folder
```

## Hosting

- Netlify builds the site with `npm run build` and publishes the `dist/` folder (see `netlify.toml`).
- `superdadcookbook.com` (without the "s") redirects to `superdadscookbook.com`.
- HTTPS certificates are issued and renewed by Netlify automatically.
