// Multiplies the amounts in a recipe's ingredient lines for the batch-size buttons
// (½×, 1×, 2×, 3×, 4×) on each recipe page. Plain JavaScript so it runs in the
// browser and can be tested with Node: `node scripts/test-scale.mjs`.

const FRACTIONS = { '½': 1 / 2, '⅓': 1 / 3, '⅔': 2 / 3, '¼': 1 / 4, '¾': 3 / 4, '⅛': 1 / 8, '⅜': 3 / 8, '⅝': 5 / 8, '⅞': 7 / 8 };
const FRACTION_CHARS = Object.keys(FRACTIONS).join('');

// One amount: 2 · 1,057 · 21.5 · 1½ · 1 ½ · 1 1/2 · 3/4 · ¾
const NUM = `(?:\\d+(?:,\\d{3})*(?:\\.\\d+)?(?:\\s?[${FRACTION_CHARS}]|\\s\\d+\\/\\d+)?|\\d+\\/\\d+|[${FRACTION_CHARS}])`;
// An amount or a range: 2–4 · 2 to 3 · 1-2
const AMOUNT = new RegExp(`^(${NUM})(?:(\\s*(?:–|-|to)\\s*)(${NUM}))?`);

// Numbers that describe a size, temperature or ratio, not an amount: 9-inch, 40°F, 85%, 9 × 13
const NOT_AN_AMOUNT = /^(?:\s?-\s?[a-z]|\s?[°%"]|\s?(?:x|×)\s?\d|\s?inch|\s?in\.|\s?percent)/i;

const METRIC = /^(?:g|kg|ml|l|grams?|kilograms?|milliliters?|liters?)$/i;
const CONTAINERS = /^(?:packages?|pkgs?|cans?|jars?|box(?:es)?|bags?|bottles?|envelopes?|packets?|containers?|tubs?|cartons?)$/i;
const SIZE_WORDS = /^(?:large|medium|small|big|whole|heaping|level|scant|extra-large|jumbo)$/i;

// Words that change between 1 and 2+ (singular → plural)
const PLURALS = {
  cup: 'cups', tablespoon: 'tablespoons', teaspoon: 'teaspoons', pound: 'pounds', ounce: 'ounces',
  quart: 'quarts', pint: 'pints', gallon: 'gallons', stick: 'sticks', clove: 'cloves', egg: 'eggs',
  can: 'cans', package: 'packages', jar: 'jars', box: 'boxes', bag: 'bags', bottle: 'bottles',
  envelope: 'envelopes', packet: 'packets', container: 'containers', tub: 'tubs', slice: 'slices',
  pinch: 'pinches', dash: 'dashes', head: 'heads', bunch: 'bunches', sprig: 'sprigs', loaf: 'loaves',
  breast: 'breasts', thigh: 'thighs', link: 'links', sheet: 'sheets', tortilla: 'tortillas', bun: 'buns',
  banana: 'bananas', lemon: 'lemons', lime: 'limes', orange: 'oranges', onion: 'onions', potato: 'potatoes',
  carrot: 'carrots', tomato: 'tomatoes', apple: 'apples', strip: 'strips', yolk: 'yolks',
  serving: 'servings', cookie: 'cookies', muffin: 'muffins', pancake: 'pancakes', pizza: 'pizzas',
  pie: 'pies', cake: 'cakes', batch: 'batches', pan: 'pans', pot: 'pots', skillet: 'skillets', mug: 'mugs',
  bar: 'bars', biscuit: 'biscuits', bagel: 'bagels', roll: 'rolls', burrito: 'burritos', sandwich: 'sandwiches',
  leaf: 'leaves', white: 'whites', cupcake: 'cupcakes', shortcake: 'shortcakes', house: 'houses', rack: 'racks', fillet: 'fillets',
  chop: 'chops', steak: 'steaks', piece: 'pieces', stalk: 'stalks', square: 'squares', donut: 'donuts', taco: 'tacos',
};
const SINGULARS = Object.fromEntries(Object.entries(PLURALS).map(([s, p]) => [p, s]));

const TSP = { test: (u) => u === 't' || /^(?:teaspoons?|tsps?\.?)$/i.test(u) };
const TBSP = { test: (u) => u === 'T' || /^(?:tablespoons?|tbsps?\.?|tbs\.?)$/i.test(u) };
const CUP = /^(?:cups?)$/i;

export function parseNumber(text) {
  const t = text.replace(/,/g, '').trim();
  let m = t.match(new RegExp(`^(\\d+)\\s?([${FRACTION_CHARS}])$`));
  if (m) return Number(m[1]) + FRACTIONS[m[2]];
  m = t.match(/^(\d+)\s(\d+)\/(\d+)$/);
  if (m) return Number(m[1]) + Number(m[2]) / Number(m[3]);
  m = t.match(/^(\d+)\/(\d+)$/);
  if (m) return Number(m[1]) / Number(m[2]);
  if (FRACTIONS[t] !== undefined) return FRACTIONS[t];
  return Number(t);
}

const NICE = [[0, ''], [1 / 8, '⅛'], [1 / 4, '¼'], [1 / 3, '⅓'], [3 / 8, '⅜'], [1 / 2, '½'], [5 / 8, '⅝'], [2 / 3, '⅔'], [3 / 4, '¾'], [7 / 8, '⅞'], [1, '']];

/** Formats a number the way the recipes write it: 1½, ¾, 2⅓ (or 264.5 for metric/decimal amounts). */
export function formatNumber(value, decimal = false) {
  if (decimal) {
    const places = value >= 100 ? 0 : value >= 10 ? 1 : 2;
    return String(Number(value.toFixed(places))).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  if (value >= 20) return String(Math.round(value * 2) / 2).replace('.5', '½');
  let whole = Math.floor(value);
  let best = NICE[0];
  for (const n of NICE) if (Math.abs(value - whole - n[0]) < Math.abs(value - whole - best[0])) best = n;
  if (best[0] === 1) {
    whole += 1;
    best = NICE[0];
  }
  if (whole === 0 && best[1] === '') return '⅛';
  return (whole > 0 ? String(whole) : '') + best[1];
}

function matchCase(word, like) {
  const first = like[0];
  return first === first.toUpperCase() && first !== first.toLowerCase() ? word[0].toUpperCase() + word.slice(1) : word;
}

/** Makes the word agree with the amount: 1 cup / 2 cups, 1 egg / 3 eggs. */
function agree(word, value) {
  const lower = word.toLowerCase();
  if (value > 1 && PLURALS[lower] && PLURALS[lower] !== lower) return matchCase(PLURALS[lower], word);
  if (value <= 1 && SINGULARS[lower] && SINGULARS[lower] !== lower) return matchCase(SINGULARS[lower], word);
  return word;
}

const FRIENDLY_CUP_FRACTIONS = [0, 1 / 4, 1 / 3, 1 / 2, 2 / 3, 3 / 4];
const near = (x, step) => Math.abs(x / step - Math.round(x / step)) < 0.02;
const friendlyCups = (cups) => FRIENDLY_CUP_FRACTIONS.some((f) => Math.abs(cups - Math.floor(cups) - f) < 0.02 || Math.abs(cups - Math.floor(cups) - 1) < 0.02);
const plural = (n, word) => (n > 1 ? PLURALS[word] : word);

/**
 * Writes an amount of teaspoons with the fewest, most familiar cups and spoons:
 * 18 tsp → "6 tablespoons", 42 tsp → "¾ cup plus 2 tablespoons", 8 tsp → "2 tablespoons plus 2 teaspoons".
 */
function spoons(tsp) {
  const cupOptions = [0];
  for (let whole = 0; whole * 48 <= tsp + 0.05; whole++) {
    for (const f of FRIENDLY_CUP_FRACTIONS) if ((whole + f) * 48 <= tsp + 0.05 && whole + f > 0) cupOptions.push(whole + f);
  }
  let best = null;
  for (const cups of cupOptions) {
    const rest = Math.max(0, tsp - cups * 48);
    const tb = Math.floor((rest + 0.02) / 3);
    const ts = rest - tb * 3;
    const parts = (cups > 0) + (tb > 0) + (ts > 0.06);
    const score = parts * 2 + (tb > 8 ? 5 : 0) + (cups > 0 && tb > 3 ? 4 : 0) + (ts > 0.06 ? 1 : 0);
    if (!best || score < best.score || (score === best.score && cups > best.cups)) best = { score, cups, tb, ts };
  }
  const out = [];
  if (best.cups > 0) out.push(`${formatNumber(best.cups)} ${plural(best.cups, 'cup')}`);
  if (best.tb > 0) out.push(`${best.tb} ${plural(best.tb, 'tablespoon')}`);
  if (best.ts > 0.06) out.push(`${formatNumber(best.ts)} ${plural(best.ts, 'teaspoon')}`);
  return out.join(' plus ');
}

/**
 * Picks familiar kitchen measures for a scaled spoon or cup amount, or returns null to keep
 * the recipe's own unit. 3 teaspoons → 1 tablespoon, 4 tablespoons → ¼ cup,
 * ⅞ cup → ¾ cup plus 2 tablespoons, ½ tablespoon → 1½ teaspoons, a tiny amount → 1 pinch.
 */
function tidyMeasure(value, unit) {
  if (TSP.test(unit)) {
    if (value < 1 / 8 - 0.01) return '1 pinch';
    if (value < 3 - 0.02 || (value <= 6 && !near(value, 1.5))) return null;
    if (value >= 12 - 0.02 && friendlyCups(value / 48)) return `${formatNumber(value / 48)} ${plural(value / 48, 'cup')}`;
    if (near(value, 1.5) && value <= 12) return `${formatNumber(value / 3)} ${plural(value / 3, 'tablespoon')}`;
    return spoons(value);
  }
  if (TBSP.test(unit)) {
    if (value < 1 - 0.02) return spoons(value * 3);
    if (value < 4 - 0.02) return null;
    if (friendlyCups(value / 16)) return `${formatNumber(value / 16)} ${plural(value / 16, 'cup')}`;
    if (value <= 8) return null;
    return spoons(value * 3);
  }
  if (CUP.test(unit)) {
    if (friendlyCups(value) && value >= 1 / 4 - 0.02) return null;
    return spoons(value * 48);
  }
  return null;
}

/**
 * Reads the amount (or range) at the start of `text`, plus the word that goes with it.
 * Returns the original length of that part, its scaled replacement and the unit word,
 * or null if `text` doesn't start with an amount.
 */
function scaleHead(text, factor, tidy) {
  const m = text.match(AMOUNT);
  if (!m) return null;
  const after = text.slice(m[0].length);
  if (NOT_AN_AMOUNT.test(after)) return null;

  // The word after the amount ("cups", "eggs"), skipping a size word ("2 large eggs")
  let length = m[0].length;
  let gap = '';
  let size = '';
  let unit = '';
  let second = '';
  const w = after.match(/^(\s+)([A-Za-z-]+\.?)(?:(\s+)([A-Za-z]+\.?))?/);
  if (w) {
    gap = w[1];
    if (SIZE_WORDS.test(w[2]) && w[4] && !/^(?:or|and|to|of|plus|about|for|in|with)$/i.test(w[4])) {
      size = w[2] + w[3];
      unit = w[4];
    } else {
      unit = w[2];
      // Two-word names where the second word changes: bay leaf → bay leaves, egg white → egg whites
      const known = PLURALS[unit.toLowerCase()] || SINGULARS[unit.toLowerCase()];
      const changing = w[4] && /^(?:leaf|leaves|white|whites|yolk|yolks)$/i.test(w[4]);
      if (changing && (!known || unit.toLowerCase() === 'egg')) {
        second = w[3] + w[4];
      }
    }
    length += gap.length + size.length + unit.length + second.length;
  }
  const agreeAll = (value) => (second ? unit + second.replace(/\S+$/, (word) => agree(word, value)) : agree(unit, value));

  const decimal = /\./.test(m[1]) || METRIC.test(unit);
  const low = parseNumber(m[1]) * factor;

  if (m[3]) {
    const high = parseNumber(m[3]) * factor;
    const amount = formatNumber(low, decimal) + m[2] + formatNumber(high, decimal);
    return { length, unit, text: amount + gap + size + (unit ? agreeAll(high) : '') };
  }

  if (tidy && !size && unit) {
    const better = tidyMeasure(low, unit);
    if (better && (tidy === 'full' || !better.includes(' plus '))) return { length, unit, text: better };
  }
  return { length, unit, text: formatNumber(low, decimal) + gap + size + (unit ? agreeAll(low) : '') };
}

/**
 * Multiplies the amounts in one ingredient line.
 * Scales the amount at the start, amounts at the start of brackets "(about 2¼ cups)",
 * amounts after "about" or "plus", and "or" amounts inside brackets.
 * Leaves alone sizes and temperatures (9-inch, 40°F), "each"/"per" notes, and container
 * sizes such as "1 package (8 ounces)".
 */
export function scaleLine(line, factor) {
  if (factor === 1) return line;
  // A length of something, like "1-inch piece fresh ginger": the length grows with the batch
  const piece = line.match(new RegExp(`^(${NUM})(-inch piece)`));
  if (piece) return formatNumber(parseNumber(piece[1]) * factor) + line.slice(piece[1].length);
  let out = '';
  let i = 0;
  let depth = 0;
  let skipBrackets = false;

  const lead = line.match(/^(?:about|About)\s+/);
  if (lead) {
    out += lead[0];
    i = lead[0].length;
  }
  const first = scaleHead(line.slice(i), factor, 'full');
  if (first) {
    out += first.text;
    i += first.length;
    skipBrackets = CONTAINERS.test(first.unit);
  }

  while (i < line.length) {
    const ch = line[i];
    if (ch === '(') {
      depth += 1;
      out += ch;
      i += 1;
      const close = line.indexOf(')', i);
      const inside = line.slice(i, close === -1 ? undefined : close);
      if (skipBrackets || /\b(?:each|per)\b|inch|°/i.test(inside)) {
        // A container or "each" size: copy the bracket as written
        out += inside;
        i += inside.length;
        continue;
      }
      const pre = inside.match(/^(?:about|approximately|or)\s+/i);
      const at = i + (pre ? pre[0].length : 0);
      const head = scaleHead(line.slice(at), factor, 'simple');
      if (head) {
        out += line.slice(i, at) + head.text;
        i = at + head.length;
      }
      continue;
    }
    if (ch === ')') depth = Math.max(0, depth - 1);

    const boundary = i === 0 || /[\s(,;]/.test(line[i - 1]);
    const keyword = boundary && line.slice(i).match(/^(?:about|plus|or|and|of)\s+/i);
    if (keyword && !(skipBrackets && depth > 0) && (depth > 0 || !/^and/i.test(keyword[0]))) {
      const at = i + keyword[0].length;
      const head = scaleHead(line.slice(at), factor, /^plus/i.test(keyword[0]) ? false : 'simple');
      if (head) {
        out += keyword[0] + head.text;
        i = at + head.length;
        continue;
      }
    }
    out += ch;
    i += 1;
  }
  return out;
}

/**
 * Scales the "Makes" text: "8 servings (one 9-inch pie)" at 2× → "16 servings".
 * Only the part before any bracket or comma is kept, because notes like "one 9-inch pie"
 * or "130 g each" don't always multiply. The page shows "2× recipe" underneath.
 * Returns null when the text doesn't start with an amount.
 */
export function scaleMakes(text, factor) {
  if (factor === 1) return text;
  let first = text.split(/\s\(|,\s/)[0];
  // "1 (12-inch) skillet": the bracket comes before the noun, so keep the whole text
  if (/^\S+$/.test(first.trim())) first = text;
  const lead = first.match(/^(?:about|About)\s+/)?.[0] ?? '';
  const body = first.slice(lead.length);
  const m = body.match(AMOUNT);
  if (!m || NOT_AN_AMOUNT.test(body.slice(m[0].length))) return null;
  const top = parseNumber(m[3] || m[1]) * factor;
  let out = formatNumber(parseNumber(m[1]) * factor) + (m[3] ? m[2] + formatNumber(top) : '');
  // Make the first countable word in the next few agree: "1 large pan" → "2 large pans"
  let done = false;
  const known = (word) => /^[A-Za-z]+$/.test(word || '') && Boolean(PLURALS[word.toLowerCase()] || SINGULARS[word.toLowerCase()]);
  const pieces = body.slice(m[0].length).split(/(\s+)/);
  out += pieces
    .map((word, n) => {
      if (done || n > 8 || !known(word)) return word;
      // "cookie sheet": the second word is the one that changes
      if (known(pieces[n + 2])) return word;
      done = true;
      return agree(word, top);
    })
    .join('');
  return lead + out;
}
