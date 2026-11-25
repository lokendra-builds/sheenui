// Reads the registry items a docs page's "Files to copy" panel names, from the page's prerendered HTML.
// The panel has two commands: "shadcn CLI" (the page's own source: its install item) and, when the examples
// import components the page does not document, "The examples also use" (the "also needs" group).

const items = (command) => [...command.matchAll(/\/r\/([\w-]+)\.json/g)].map((m) => m[1]);

/**
 * @param {string} html a prerendered page
 * @returns {{ own: string[]; also: string[] }} registry item names of each command (empty when the group is absent)
 */
export function panelItems(html) {
  const own = /<dt[^>]*>shadcn CLI[^<]*<\/dt><dd[^>]*><code[^>]*>([^<]*)<\/code>/.exec(html)?.[1] ?? "";
  const alsoDd = /<dt[^>]*>The examples also use<\/dt><dd[^>]*>([\s\S]*?)<\/dd>/.exec(html)?.[1] ?? "";
  const alsoCommand = /<code[^>]*>(npx shadcn@latest add[^<]*)<\/code>/.exec(alsoDd)?.[1] ?? "";
  return { own: items(own), also: items(alsoCommand) };
}

/**
 * The components the examples import that neither the page's install item nor the panel's "also uses" group installs.
 * @param {string[]} imported registry items the examples' imports belong to
 * @param {Set<string>} closure the install item and the also-uses items, each with its registry dependencies
 * @param {string[]} also items of the panel's second group
 */
export function uncoveredItems(imported, closure, also) {
  return [...new Set(imported)].filter((n) => !closure.has(n) && !also.includes(n));
}
