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
  // The command sits in a focusable `<span>` inside its scrolling `<code>` (see CommandField).
  const alsoCommand = /<code[^>]*>(?:<span[^>]*>)?(npx shadcn@latest add[^<]*)/.exec(alsoDd)?.[1] ?? "";
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

/** True when the page shows the "The examples also use" group in its Files to copy panel. */
export const hasAlsoGroup = (html) => /<dt[^>]*>The examples also use<\/dt>/.test(html);

/** True when a Markdown twin carries the line "These examples also use ..." that mirrors that group. */
export const hasAlsoLine = (twin) => /^These examples also use /m.test(twin);

/**
 * The registry items a page's shown command installs when the page has no install item of its own (a hub, the foundations page):
 * every item of the panel's "shadcn CLI" line, or only the first when the list is longer than `many` (the panel says to swap the name).
 * @param {string[]} own the panel's own items
 * @param {number} many the panel's MANY_ITEMS
 */
export const commandedItems = (own, many) => (own.length > many ? own.slice(0, 1) : own);
