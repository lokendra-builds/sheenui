// Finds a body that was emitted twice in one Markdown twin or llms page section (the guides once held the article flattened,
// then again as Markdown). A 200-character run, sampled every 100 characters, must not occur a second time in the same text.

/**
 * @param {string} text one page's text
 * @returns {string | null} the first duplicated run, or null
 */
export function findDuplicatedRun(text) {
  const flat = text.replace(/\s+/g, " ");
  for (let i = 0; i + 200 < flat.length; i += 100) {
    const run = flat.slice(i, i + 200);
    if (!/[a-z]{4}/i.test(run) || /^[\s|\-:]+$/.test(run)) continue;
    if (flat.indexOf(run, i + 1) !== -1) return run;
  }
  return null;
}

/**
 * A formatted number written twice back to back ("12,48012,480"): the text of a component that renders its value as a visible
 * copy, a width spacer and a screen-reader copy, all as text nodes (the NumberTicker once did). Looks for a number with a
 * thousands separator directly followed by itself, or a decimal or four-digit number three times in a row.
 * @param {string} text the text content of a page (tags removed, no separators inserted between elements)
 * @returns {string | null} the repeated number, or null
 */
export function findRepeatedNumber(text) {
  // A thousands-separated number twice, or any decimal or long number three times: two copies of "4.1" are a version ("4.14.1").
  const m = /(?<![\d,.])(?:(\d{1,3}(?:,\d{3})+(?:\.\d+)?)\1|(\d+\.\d+|\d{4,})\2\2)/.exec(text);
  return m ? (m[1] ?? m[2]) : null;
}

const INLINE = /^(?:span|a|b|i|em|strong|code|small|time|abbr|sup|sub|mark|kbd|bdi|bdo|s|u)$/i;

/** The text content of an HTML page as a crawler's `textContent` reads it: inline tags add nothing between their text, block tags a space. */
export function htmlTextContent(html) {
  return html
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<\/?([a-z][\w-]*)\b[^>]*>/gi, (_m, tag) => (INLINE.test(tag) ? "" : " "))
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ");
}
