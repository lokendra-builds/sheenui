// Two rules on names, shared by seo-check and its script test (scripts/test/hub-cards.test.mjs).
//  1. A hub or home card names the page it links to: every word of the card's title appears (plural-insensitive) in the
//     target's sidebar name, <title>, H1 or meta description ("Slope chart" -> "Dumbbell & slope chart"; "OHLC bars" -> the candlestick page, whose description names OHLC). A card pointing at the wrong page fails.
//  2. A "When to use ..." heading is not "the" plus one bare lowercase word ("When to use the select"): a single-word
//     component name stands alone and capitalised ("When to use Select"), see src/seo/when-heading.ts.

const norm = (s) =>
  s
    .toLowerCase()
    .replace(/&#x27;|’/g, "'")
    .replace(/[^a-z0-9%]+/g, " ")
    .trim();
const stem = (t) => t.replace(/s$/, "");
const tokens = (s) => norm(s).split(" ").filter(Boolean).map(stem);

/**
 * The reason a card title does not match the page it links to, or "" when it does.
 * @param {string} cardName the card's visible title
 * @param {string[]} targetTexts the target page's sidebar name, <title>, H1 and meta description
 */
export function cardMismatch(cardName, targetTexts) {
  const want = tokens(cardName);
  if (!want.length) return "the card has no title";
  const have = new Set(targetTexts.flatMap(tokens));
  const missing = want.filter((t) => !have.has(t));
  return missing.length ? `the target page's name does not contain "${missing.join(" ")}"` : "";
}

/** True when a "When to use" heading is "the" plus one bare lowercase word: "When to use the select". */
export function articleFragment(heading) {
  return /^When to use the [a-z][a-z-]*$/.test(heading.trim());
}
