// Finds the "N components / charts / blocks / dashboards / guides" claims in a page's text, for seo-check's count gate.
// Only real count phrases match: the number stands alone (not the tail of "19.2+" or "v4"), optionally one adjective, then
// the noun ("48 chart components" is a charts claim, "86 accessible components" a components claim).

const MODIFIER = "(?:accessible|free|glass|live|animated|ready-made|copy-paste|interactive)";
const CLAIM = new RegExp(
  `(?<![\\w.])(\\d+)(\\+?)\\s+(?:${MODIFIER}\\s+)?(chart\\s+)?(chart|component|block|dashboard|guide)s?\\b`,
  "gi",
);

/** Page text with a space wherever an element boundary was, so adjacent elements never fuse ("12" + "charts"). */
export function textWithSeparators(html) {
  return html
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&quot;/g, "'")
    .replace(/\s+/g, " ");
}

/**
 * @param {string} text
 * @returns {{ text: string, number: number, plus: boolean, kind: "component"|"chart"|"block"|"dashboard"|"guide" }[]}
 */
export function findCountClaims(text) {
  const out = [];
  for (const m of text.matchAll(CLAIM)) {
    // "48 chart components" counts charts: the leading "chart" is the claim, the trailing "components" only a noun.
    const noun = m[3] && /^component/i.test(m[4]) ? "chart" : m[4].toLowerCase();
    out.push({ text: m[0], number: Number(m[1]), plus: m[2] === "+", kind: noun });
  }
  return out;
}
