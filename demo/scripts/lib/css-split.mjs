// Splits the built stylesheet into per-area sheets for the prerender (scripts/prerender.mjs).
//
// The build produces ONE stylesheet (Tailwind's utilities for every page, the theme's CSS and src/index.css). Every route
// used to load all of it. This module reads that stylesheet rule by rule and decides, for each route, which rules the
// route can use; rules are then grouped into sheets by the set of route classes that need them, so a route links only
// the sheets it needs (a guide never downloads the chart, dashboard or home-hero rules).
//
// What "can use" means (a superset of what the page ever matches, so a sheet is never missing a rule):
//   - the same test the critical CSS uses (lib/critical-css.mjs): every class, id and attribute a selector requires must
//     occur in the route's HTML or in the route's JavaScript (the strings of every chunk the route can load: the entry and
//     shell, the route's chunk, its static imports and its lazy blocks). Tailwind found a utility's class the same way,
//     as a literal in a source file, so the chunk text carries it;
//   - the hand-written (unlayered) rules also match on the family of a class: `.hub-mini--avatars` is built from a
//     `hub-mini--${kind}` template, so any `hub-mini--` prefix in the chunks keeps the whole family;
//   - rules whose selectors match nothing but tags, pseudo-classes or `:root` (the reset, the tokens) are needed by all.
// A rule nothing needs is dropped. `@font-face`, `@property`, the layer order statement and the base layer go to the
// shared sheet; each `@keyframes` follows the sheets that reference it.

import postcss from "postcss";

import { requirements } from "./critical-css.mjs";

/** Attributes index.html puts on <html> before first paint: present on every page, whatever the HTML says. */
const PRE_PAINT = new Set([
  "data-js",
  "data-theme",
  "data-motion",
  "data-transparency",
  "data-glass",
  "data-sheen-style",
]);
const ALWAYS = new Set(["font-face", "property", "import", "charset", "namespace", "counter-style", "page"]);
const KEYFRAMES = new Set(["keyframes", "-webkit-keyframes"]);

/**
 * What a chunk's text offers to class, id and attribute selectors.
 * @param {string} text a JavaScript chunk
 */
export function jsTokens(text) {
  const words = new Set();
  const dynamic = new Set();
  const families = new Set();
  for (const raw of text.split(/[\s"'`\\]+/)) {
    if (!raw) continue;
    words.add(raw);
    // `a-${x}`, "a-" + x: the part before the hole is a prefix of the class that is built.
    const hole = raw.indexOf("${");
    if (hole > 1) dynamic.add(raw.slice(0, hole));
    else if (/[-_:]$/.test(raw)) dynamic.add(raw);
    const bem = raw.match(/^[A-Za-z][\w-]*?(?:--|__)/);
    if (bem) families.add(bem[0]);
    // Class strings that hold several tokens inside one quoted word, e.g. `{a:"x",b:"y"}` minified without spaces.
    if (/[,;(){}[\]]/.test(raw) && raw.length < 400)
      for (const part of raw.split(/[,;(){}]+/)) if (part) words.add(part);
  }
  return { words, dynamic, families };
}

/** The union of several chunks' tokens plus the HTML's classes, ids and attributes: one route's vocabulary. */
export function routeVocabulary(htmlTokens, chunkTokens) {
  const words = new Set(htmlTokens.classes);
  const ids = new Set(htmlTokens.ids);
  const dynamic = new Set();
  const families = new Set();
  for (const t of chunkTokens) {
    for (const w of t.words) words.add(w);
    for (const d of t.dynamic) dynamic.add(d);
    for (const f of t.families) families.add(f);
  }
  for (const w of words) ids.add(w);
  const attrNames = new Set(PRE_PAINT);
  for (const name of htmlTokens.attrs.keys()) attrNames.add(name);
  return { words, ids, dynamic, families, attrNames, htmlAttrs: htmlTokens.attrs };
}

/** Does the vocabulary offer this class to a hand-written rule? Exact token, or a `family--` / dynamic prefix of it. */
function offersClass(vocab, name, custom) {
  if (vocab.words.has(name)) return true;
  if (!custom) return false;
  const bem = name.match(/^[A-Za-z][\w-]*?(?:--|__)/);
  if (bem && vocab.families.has(bem[0])) return true;
  for (let i = 3; i < name.length; i++) if (vocab.dynamic.has(name.slice(0, i))) return true;
  return false;
}

/** `[data-state=open]`: data-* and aria-* need their name in the route; every other attribute is always satisfiable. */
function offersAttribute(vocab, name) {
  if (!name.startsWith("data-") && !name.startsWith("aria-")) return true;
  return vocab.attrNames.has(name) || vocab.words.has(name) || vocab.words.has(`"${name}"`);
}

/**
 * Parses the stylesheet once and indexes its rules.
 * @param {string} css the built stylesheet
 */
export function createSplitter(css) {
  const root = postcss.parse(css);
  /** @type {{ index: number; rule: import("postcss").Rule; chain: import("postcss").Container[]; custom: boolean; reqs: object[] }[]} */
  const units = [];
  /** Nodes that always go to the shared sheet: font-face, property, layer statements, the `properties` layer. */
  const shared = [];
  const keyframes = new Map();

  const visit = (node, chain, custom) => {
    if (node.type === "rule") {
      units.push({
        index: units.length,
        rule: node,
        chain,
        custom,
        reqs: node.selectors.map((selector) => requirements(selector)),
      });
      return;
    }
    if (node.type !== "atrule") return;
    const name = node.name.toLowerCase();
    if (KEYFRAMES.has(name)) {
      keyframes.set(node.params.trim(), { node, chain });
      return;
    }
    if (ALWAYS.has(name)) {
      shared.push({ node, chain });
      return;
    }
    if (name === "layer") {
      if (!node.nodes) {
        shared.push({ node, chain });
        return;
      }
      if (node.params === "properties" || node.params === "theme" || node.params === "base") {
        shared.push({ node, chain });
        return;
      }
      // utilities (Tailwind's, found in the JS as literals) and components are matched exactly; named layers of
      // hand-written CSS keep the family fallback.
      const isCustom = node.params !== "utilities" && node.params !== "components";
      node.each((child) => visit(child, [...chain, node], isCustom));
      return;
    }
    if (!node.nodes) {
      shared.push({ node, chain });
      return;
    }
    node.each((child) => visit(child, [...chain, node], custom));
  };
  root.each((node) => visit(node, [], true));

  /** The units one route needs: indices into `units`. */
  function needed(vocab) {
    const out = new Set();
    for (const u of units) {
      const ok = u.reqs.some(
        ({ classes, ids, attributes }) =>
          classes.every((c) => offersClass(vocab, c, u.custom)) &&
          ids.every((i) => vocab.ids.has(i)) &&
          attributes.every((a) => offersAttribute(vocab, a.name)),
      );
      if (ok) out.add(u.index);
    }
    return out;
  }

  /** Serialises the given unit indices (any order) back into one stylesheet, in the source's order, wrappers merged. */
  function emit(indices, { includeShared = false } = {}) {
    const sorted = [...indices].sort((a, b) => a - b);
    const out = postcss.root();
    /** @type {Map<object, object>} original container → its clone in `out` (valid while the open path matches) */
    let open = [];
    const place = (leaf, chain) => {
      // Reuse the longest open prefix of the chain.
      let k = 0;
      while (k < open.length && k < chain.length && open[k].src === chain[k]) k++;
      open = open.slice(0, k);
      let parent = k ? open[k - 1].copy : out;
      for (let i = k; i < chain.length; i++) {
        const copy = chain[i].clone({ nodes: [] });
        copy.raws = { ...chain[i].raws };
        parent.append(copy);
        open.push({ src: chain[i], copy });
        parent = copy;
      }
      parent.append(leaf.clone());
    };
    if (includeShared) {
      for (const { node, chain } of shared) {
        // Shared nodes are emitted in order, each at its own place.
        place(node, chain);
      }
      open = [];
    }
    for (const i of sorted) place(units[i].rule, units[i].chain);
    open = [];
    // @keyframes the emitted rules name.
    const text = out.toString();
    const used = [];
    for (const [name, { node, chain }] of keyframes) {
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (new RegExp(`(^|[^\\w-])${escaped}(?![\\w-])`).test(text)) used.push({ node, chain });
    }
    for (const { node, chain } of used) place(node, chain);
    return out.toString();
  }

  return { units, shared, needed, emit };
}

/**
 * One complete sheet per route class: the union of what its routes need, in the source's order, plus the font faces,
 * `@property` and layer statements. A route links its class's sheet only. The sheets are deliberately not split into a
 * shared base and a per-class remainder: two rules of equal specificity are ordered by their position, so a rule in a
 * sheet that loads later than the one holding its competitor would change which one wins (a `sm:p-8` in the base against a
 * `min-[400px]:p-6` in the remainder did exactly that). A complete sheet keeps the whole source order; the client swaps
 * sheets on navigation instead of stacking them (src/route-css.ts).
 * @param {ReturnType<typeof createSplitter>} splitter
 * @param {Map<string, Set<number>>} routeNeeds route path -> unit indices
 * @param {(path: string) => string} classOf route path -> class name
 * @returns {{ sheets: Map<string, number[]>, classes: Map<string, string[]> }} class -> unit indices; class -> its route paths
 */
export function planSheets(splitter, routeNeeds, classOf) {
  const classes = new Map();
  for (const path of routeNeeds.keys()) {
    const c = classOf(path);
    if (!classes.has(c)) classes.set(c, []);
    classes.get(c).push(path);
  }
  const sheets = new Map();
  for (const [c, paths] of classes) {
    const set = new Set();
    for (const p of paths) for (const i of routeNeeds.get(p)) set.add(i);
    sheets.set(c, [...set]);
  }
  return { sheets, classes };
}
