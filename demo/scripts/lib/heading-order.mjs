// Heading outline of a prerendered page: exactly one h1, and no level skipped on the way down (h1 -> h3 is a skip; h3 -> h2 is
// fine). Headings inside aria-hidden or hidden subtrees are not part of the outline a reader or a crawler gets.

const LEVEL = /^h([1-6])$/i;

/**
 * @param {import("node-html-parser").HTMLElement} root parsed page
 * @returns {string[]} problems, empty when the outline is sound
 */
export function headingOrderErrors(root) {
  const body = root.querySelector("body") ?? root;
  const found = [];
  for (const node of body.querySelectorAll("h1, h2, h3, h4, h5, h6")) {
    if (node.closest("[aria-hidden='true'], [hidden]")) continue;
    found.push({
      level: Number(LEVEL.exec(node.rawTagName)[1]),
      text: node.textContent.replace(/\s+/g, " ").trim().slice(0, 50),
    });
  }
  const errors = [];
  const h1s = found.filter((h) => h.level === 1).length;
  if (h1s !== 1) errors.push(`${h1s} visible <h1> elements`);
  if (found.length && found[0].level !== 1)
    errors.push(`the first heading is an h${found[0].level} ("${found[0].text}"), not the h1`);
  for (let i = 1; i < found.length; i++) {
    const prev = found[i - 1];
    const cur = found[i];
    if (cur.level > prev.level + 1)
      errors.push(`heading level skips from h${prev.level} ("${prev.text}") to h${cur.level} ("${cur.text}")`);
  }
  return errors;
}
