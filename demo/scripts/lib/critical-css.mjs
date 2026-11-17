// Per-page critical CSS for the prerender (scripts/prerender.mjs).
//
// The site builds one stylesheet (Tailwind's utilities for every page plus the theme's CSS, ~100 KB gzip), which the prerender
// splits into one complete sheet per route class (lib/css-split.mjs); `createCriticalCss` is given that route class's sheet. As a
// render-blocking <link> it decided every page's first paint: on a slow 4G phone the HTML was on the device
// about 2 s before anything was drawn. The prerender now inlines, per page, the subset of that stylesheet whose
// rules can apply to the page's prerendered HTML, and loads the full stylesheet without blocking (it carries the
// rules for everything that appears later: popups, the toast viewport, hover and open states, client-only islands).
//
// What "can apply" means here (a rule is kept when any of its selectors passes):
//   - every class (`.x`), id (`#x`) and attribute (`[data-slot=card]`) written at the top level of the selector
//     must occur in the HTML; tokens inside `:not()`, `:is()`, `:where()`, `:has()` are not required, and tag and
//     pseudo selectors are always satisfiable. The attributes index.html sets on <html> before first paint
//     (data-js, and the saved theme / style / motion / transparency / glass preferences) count as present, so
//     `[data-theme=dark]` rules stay in whatever the HTML says;
//   - `@media`, `@supports`, `@container` and `@layer` blocks are kept when something inside them is kept;
//     `@font-face`, `@property` and `@layer` order statements are always kept;
//   - a `@keyframes` is kept when its name is referenced by the kept CSS.
// That is how Tailwind itself decides what to emit (class tokens in the source), applied to one page's HTML. The
// result keeps the stylesheet's order and cascade layers, so when the full stylesheet arrives it changes nothing.
//
// Layout-safety rules are kept whatever the HTML says: a single-class rule (`.min-w-0`, `.max-w-full`,
// `.overflow-x-auto`, `.md\:min-w-0`) whose declarations only set overflow-x, max-width, min-width, contain or
// content-visibility stays in every page's critical CSS. Such a rule can only narrow a box or clip it, never move
// content around by itself, and a class that reaches the DOM after the prerender (a client-only island, a state
// change) must not widen the layout viewport (a `<table>` or `<pre>` without its scroller on a phone) in the frames
// before the full stylesheet lands.
//
// It errs on the side of keeping: a rule that cannot match costs bytes, a missing one would cost a repaint.

import postcss from "postcss";

const ENTITIES = { "&amp;": "&", "&quot;": '"', "&#x27;": "'", "&#39;": "'", "&lt;": "<", "&gt;": ">" };
const decodeEntities = (s) => s.replace(/&(?:amp|quot|#x27|#39|lt|gt);/g, (m) => ENTITIES[m]);

/** Attributes index.html puts on <html> before first paint (data-js, the saved preferences): never in the prerendered HTML. */
const PRE_PAINT = new Set([
  "data-js",
  "data-theme",
  "data-motion",
  "data-transparency",
  "data-glass",
  "data-sheen-style",
]);

/** The class tokens, ids and attributes (name → values) a page's HTML carries. */
export function htmlTokens(html) {
  const classes = new Set();
  const ids = new Set();
  /** @type {Map<string, Set<string>>} */
  const attrs = new Map();
  for (const [tag] of html.matchAll(/<[a-zA-Z][^>]*>/g)) {
    for (const [, name, value] of tag.matchAll(/\s([^\s=/>"']+)(?:="([^"]*)")?/g)) {
      const decoded = value === undefined ? "" : decodeEntities(value);
      let values = attrs.get(name);
      if (!values) attrs.set(name, (values = new Set()));
      values.add(decoded);
      if (name === "class") {
        for (const token of decoded.split(/\s+/)) if (token) classes.add(token);
      } else if (name === "id") ids.add(decoded);
    }
  }
  return { classes, ids, attrs };
}

/** `[name]`, `[name=value]`, `[name~=value]`… against the page's attributes. */
function attributeMatches(attrs, name, op, value) {
  // The Aurora style is a saved preference (about 3 KB gzip of rules on every page for a style most visitors never chose):
  // its rules stay out of the inline CSS. The prerender gives an Aurora visitor the full stylesheet as a blocking link
  // (see assetTags), so their first paint is complete.
  if (name === "data-sheen-style" && op === "=" && value === "aurora") return false;
  if (PRE_PAINT.has(name)) return true;
  const values = attrs.get(name);
  if (!values) return false;
  if (!op) return true;
  for (const v of values) {
    if (op === "=" && v === value) return true;
    if (op === "~=" && v.split(/\s+/).includes(value)) return true;
    if (op === "|=" && (v === value || v.startsWith(`${value}-`))) return true;
    if (op === "^=" && v.startsWith(value)) return true;
    if (op === "$=" && v.endsWith(value)) return true;
    if (op === "*=" && v.includes(value)) return true;
  }
  return false;
}

/** CSS identifier escapes → the identifier: `\:` → `:`, `\31 ` → `1`. */
function unescapeIdent(s) {
  return s.replace(/\\([0-9a-fA-F]{1,6}) ?|\\(.)/g, (_, hex, ch) =>
    hex ? String.fromCodePoint(parseInt(hex, 16)) : ch,
  );
}

const IDENT = /(?:\\[0-9a-fA-F]{1,6} ?|\\.|[A-Za-z0-9_-])+/y;

const ATTRIBUTE = /^\s*([^\s=~|^$*\]]+)\s*(?:([~|^$*]?=)\s*(?:"([^"]*)"|'([^']*)'|([^\s\]]*))\s*([is])?)?\s*$/;

/**
 * `:is(x y)` and `:where(x y)` with one selector inside (no top-level comma) match exactly what `x y` matches:
 * Tailwind writes every group / peer variant that way (`:is(:where(.group\/tl):last-child .group-last\/tl\:hidden)`),
 * so their classes are requirements like any others. `:is(a, b)`, `:not()` and `:has()` stay conservative.
 */
function unwrapSingle(selector) {
  for (;;) {
    const m = /:(?:is|where)\(/.exec(selector);
    if (!m) return selector;
    const open = m.index + m[0].length - 1;
    let depth = 0;
    let comma = false;
    let close = -1;
    for (let i = open; i < selector.length; i++) {
      const c = selector[i];
      if (c === "\\") i++;
      else if (c === "(" || c === "[") depth++;
      else if (c === ")" || c === "]") {
        depth--;
        if (depth === 0) {
          close = i;
          break;
        }
      } else if (c === "," && depth === 1) comma = true;
    }
    if (close < 0) return selector;
    const inner = selector.slice(open + 1, close);
    // A conservative group stays as it is: hide it from this loop by renaming it for the scan below.
    selector = `${selector.slice(0, m.index)}${comma ? `:\u0000is(${inner})` : inner}${selector.slice(close + 1)}`;
  }
}

/**
 * The classes, ids and attributes one complex selector requires: those written outside parentheses.
 * `&` (nesting) and everything else is ignored.
 */
export function requirements(rawSelector) {
  const selector = unwrapSingle(rawSelector).replaceAll(":\u0000is(", ":is(");
  const classes = [];
  const ids = [];
  const attributes = [];
  let depth = 0;
  for (let i = 0; i < selector.length;) {
    const c = selector[i];
    if (c === "\\") {
      i += 2;
      continue;
    }
    if (c === "(") depth++;
    else if (c === ")") depth--;
    else if (c === "[") {
      // Attribute selector: find its closing bracket, minding quotes.
      const start = i + 1;
      let quote = "";
      for (i++; i < selector.length; i++) {
        const d = selector[i];
        if (d === "\\") i++;
        else if (quote) {
          if (d === quote) quote = "";
        } else if (d === '"' || d === "'") quote = d;
        else if (d === "]") break;
      }
      if (depth === 0) {
        const m = ATTRIBUTE.exec(selector.slice(start, i));
        // A case-insensitive flag (`i`) or an unreadable selector: treat as satisfiable.
        if (m && !m[6])
          attributes.push({
            name: unescapeIdent(m[1]),
            op: m[2] ?? "",
            value: unescapeIdent(m[3] ?? m[4] ?? m[5] ?? ""),
          });
      }
      i++;
      continue;
    } else if ((c === "." || c === "#") && depth === 0) {
      IDENT.lastIndex = i + 1;
      const m = IDENT.exec(selector);
      if (m) {
        (c === "." ? classes : ids).push(unescapeIdent(m[0]));
        i = IDENT.lastIndex;
        continue;
      }
    }
    i++;
  }
  return { classes, ids, attributes };
}

const ALWAYS = new Set([
  "font-face",
  "property",
  "import",
  "charset",
  "namespace",
  "counter-style",
  "page",
  "font-feature-values",
]);
/** Rules with a `url(data:…)` bigger than this are left out of the critical CSS. */
const DEFER_DATA_URI = 4000;
/** Declarations a layout-safety rule may carry (see the header). */
const LAYOUT_SAFE_PROPS = new Set([
  "overflow-x",
  "max-width",
  "min-width",
  "contain",
  "content-visibility",
  "contain-intrinsic-size",
]);
/** A selector that is one class and nothing else (escaped characters in the class name allowed). */
const SINGLE_CLASS = /^\.(?:[A-Za-z0-9_-]|\\.)+$/;
/**
 * Rules that only apply while a pointer is over an element, a key or press is on it, or in Windows forced-colors mode.
 * They change colors and outlines, never layout, and nothing is hovered, focused or pressed before the first paint, so
 * they come with the full stylesheet (which lands right after it) instead of weighing down every page's HTML.
 */
const INTERACTION_ONLY = /:(?:hover|active|focus|focus-visible|focus-within)(?![\w-])/;
const FORCED_COLORS = /forced-colors/;
/** A utility that only sets transition timing (`.transition-colors`, `.duration-300`): nothing transitions before the full stylesheet. */
const TRANSITION_PROPS = /^(?:transition(?:-[\w-]+)?|--tw-(?:duration|ease|delay))$/;
const KEYFRAMES = new Set(["keyframes", "-webkit-keyframes"]);

/**
 * Drops the `@font-face` rules of families nothing in the kept CSS names (the Aurora style's Geist and the serif the
 * page does not use): a face nothing refers to is never fetched at first paint, and the full stylesheet still has it.
 * @param {string} css minified critical CSS
 */
function dropUnusedFonts(css) {
  const FACE = /@font-face\{[^}]*\}/g;
  const rest = css.replace(FACE, "");
  return css.replace(FACE, (face) => {
    const family = /font-family:("[^"]+"|'[^']+'|[^;}]+)/.exec(face)?.[1]?.replace(/["']/g, "").trim();
    return !family || rest.includes(family) ? face : "";
  });
}

/** Tailwind's own custom properties (its theme scale and `--tw-*` internals): nothing but its utilities reads them. */
const TAILWIND_TOKEN =
  /^--(?:color|text|font-weight|font|tw|tracking|leading|radius|shadow|ease|animate|blur|breakpoint|container|spacing)(?:-|$)/;

/**
 * Drops the Tailwind theme variables and `--tw-*` internals (declarations and their `@property` registrations) that
 * nothing in the kept CSS or the page's HTML reads with `var()`: of the ~450 variables the site declares, a page uses
 * about half. The `--sheen-*` tokens stay (scripts read them). The full stylesheet has them all, a frame later.
 * @param {string} css minified critical CSS
 * @param {string} html the page
 */
function dropUnusedTokens(css, html) {
  const read = new Set();
  for (const [, name] of `${css}${html}`.matchAll(/var\((--[\w-]+)/g)) read.add(name);
  const unused = (name) => TAILWIND_TOKEN.test(name) && !read.has(name);
  const root = postcss.parse(css);
  root.walkDecls((decl) => {
    if (decl.prop.startsWith("--") && unused(decl.prop)) decl.remove();
  });
  root.walkAtRules("property", (rule) => {
    if (unused(rule.params.trim())) rule.remove();
  });
  // Rules and at-rules the removal emptied (the `@layer properties` fallback, a theme block).
  root.walkRules((rule) => {
    if (!rule.nodes?.length) rule.remove();
  });
  root.walkAtRules((rule) => {
    if (rule.nodes && !rule.nodes.length && rule.name !== "layer") rule.remove();
  });
  return root.toString();
}

/**
 * Parses the stylesheet once; `extract(html)` returns the page's critical CSS (minified, same order as the source).
 * @param {string} css the built stylesheet
 */
export function createCriticalCss(css) {
  const root = postcss.parse(css);
  // Per rule, the requirements of each of its selectors, computed once.
  const analysed = new Map();
  root.walkRules((rule) => {
    analysed.set(
      rule,
      rule.selectors.map((selector) => ({ selector, ...requirements(selector) })),
    );
  });

  /**
   * @param {{ classes: Set<string>; ids: Set<string> }} tokens
   * @param {Set<string> | null} keyframes names to keep (null: emit none, collect instead)
   */
  function emit(node, tokens, keyframes, referenced) {
    if (node.type === "comment") return "";
    if (node.type === "decl") return node.toString();
    if (node.type === "rule") {
      const kept = analysed
        .get(node)
        .filter(
          ({ classes, ids, attributes }) =>
            classes.every((c) => tokens.classes.has(c)) &&
            ids.every((i) => tokens.ids.has(i)) &&
            attributes.every((a) => attributeMatches(tokens.attrs, a.name, a.op, a.value)),
        )
        .map(({ selector }) => selector)
        .filter((selector) => !INTERACTION_ONLY.test(selector.replace(/:not\([^)]*\)/g, "")));
      if (!kept.length) {
        // Not for this page: still a layout-safety rule?
        const safe = node.selectors.filter((sel) => SINGLE_CLASS.test(sel.trim()));
        if (!safe.length || !node.nodes.length) return "";
        if (!node.nodes.every((d) => d.type === "decl" && LAYOUT_SAFE_PROPS.has(d.prop))) return "";
        return `${safe.join(",")}{${children(node, tokens, keyframes, referenced)}}`;
      }
      // `.transition-colors`, `.duration-300`…: no style changes before the full stylesheet lands, so there is nothing to
      // transition, and a change that stylesheet itself causes then happens at once instead of as a one-frame fade.
      if (node.nodes.length && node.nodes.every((d) => d.type === "decl" && TRANSITION_PROPS.test(d.prop))) return "";
      const body = children(node, tokens, keyframes, referenced);
      if (!body) return "";
      // A big inline image (the film grain, 14 KB of base64 noise, ~11 KB gzip) is decoration: it comes with the
      // full stylesheet, one frame after the first paint, instead of weighing down every page's HTML.
      if (body.length > DEFER_DATA_URI && body.includes("url(data:")) return "";
      return `${kept.join(",")}{${body}}`;
    }
    if (node.type === "atrule") {
      const name = node.name.toLowerCase();
      if (KEYFRAMES.has(name)) {
        if (!keyframes) {
          referenced.set(node.params.trim(), node);
          return "";
        }
        return keyframes.has(node.params.trim()) ? node.toString() : "";
      }
      if (ALWAYS.has(name)) return node.toString();
      if (name === "media" && FORCED_COLORS.test(node.params)) return "";
      if (!node.nodes) return node.toString();
      const body = children(node, tokens, keyframes, referenced);
      if (!body) return "";
      return `@${node.name}${node.params ? ` ${node.params}` : ""}{${body}}`;
    }
    return "";
  }

  function children(node, tokens, keyframes, referenced) {
    const parts = [];
    for (const child of node.nodes) {
      const s = emit(child, tokens, keyframes, referenced);
      if (s) parts.push(s);
    }
    // Declarations are separated by `;`; rules and at-rules carry their own braces.
    return parts.map((p, i) => (p.endsWith("}") || i === parts.length - 1 ? p : `${p};`)).join("");
  }

  return {
    /** @param {string} html the page's prerendered HTML (body or whole document) */
    extract(html) {
      const tokens = htmlTokens(html);
      const keyframesByName = new Map();
      const first = children(root, tokens, null, keyframesByName);
      const used = new Set();
      for (const name of keyframesByName.keys()) {
        const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        if (new RegExp(`(^|[^\\w-])${escaped}(?![\\w-])`).test(first)) used.add(name);
      }
      return dropUnusedTokens(dropUnusedFonts(used.size ? children(root, tokens, used, new Map()) : first), html);
    },
  };
}
