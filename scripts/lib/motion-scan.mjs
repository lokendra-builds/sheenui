// Static scan for animated properties: every CSS transition, @keyframes, Tailwind `transition-*` utility and Motion prop in a
// source file, reduced to the CSS/Motion properties it animates. Used by scripts/check-motion-properties.mjs.
// Compositor properties (transform, opacity) and colours are fine; everything else needs an entry in theme/motion-exceptions.json.

/** Animating these never needs an exception. */
const COMPOSITOR = new Set(["transform", "translate", "scale", "rotate", "opacity"]);
/** Layout / paint-heavy keys that must never appear in an animated object (SVG `d` and `pathLength` are blessed by MOTION 6.1(c)). */
const MOTION_BAD =
  /^(width|height|top|left|right|bottom|inset\w*|margin\w*|padding\w*|gap|rowGap|columnGap|maxHeight|minHeight|maxWidth|minWidth|flex\w*|grid\w*|fontSize|fontWeight|lineHeight|letterSpacing|borderRadius|borderWidth|border\w*Width|boxShadow|filter|backdropFilter|clipPath|mask\w*|background\w*Position|backgroundSize|strokeDashoffset|strokeDasharray|strokeWidth|r|rx|ry|cx|cy|x1|x2|y1|y2|points|textShadow)$/;

const kebab = (s) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

/** Blank out comments, keeping offsets and newlines, so line numbers stay right. */
export function stripComments(text, css) {
  let out = text.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
  if (!css) out = out.replace(/(^|[^:"'`\\])\/\/[^\n]*/g, (m, p) => p + " ".repeat(m.length - p.length));
  return out;
}

const normalise = (p) => p.trim().replace(/^border-(top|right|bottom|left)-color$/, "border-color");
const isColour = (p) =>
  /(^|-)color$/.test(p) || p === "fill" || p === "stroke" || p === "caret-color" || p === "stop-color";
const isOk = (p) =>
  COMPOSITOR.has(p) || isColour(p) || p === "none" || p === "visibility" || p === "display" || p.startsWith("--tw-");

/** Split a comma list at depth 0 (a `var(--a, b)` or `linear(0, 1)` keeps its commas). */
function splitTop(text) {
  const parts = [];
  let depth = 0;
  let cur = "";
  for (const ch of text) {
    if (ch === "(" || ch === "[") depth++;
    if (ch === ")" || ch === "]") depth--;
    if (ch === "," && depth === 0) {
      parts.push(cur);
      cur = "";
    } else cur += ch;
  }
  if (cur.trim()) parts.push(cur);
  return parts;
}

/** Balanced `{...}` / `(...)` region starting at `open` (index of the opening bracket); returns the inside text and its end. */
function balanced(text, open) {
  const pairs = { "{": "}", "(": ")", "[": "]" };
  const stack = [];
  for (let i = open; i < text.length; i++) {
    const ch = text[i];
    if (pairs[ch]) stack.push(pairs[ch]);
    else if (ch === stack[stack.length - 1]) {
      stack.pop();
      if (!stack.length) return { inner: text.slice(open + 1, i), end: i };
    }
  }
  return { inner: text.slice(open + 1), end: text.length };
}

/** Keys at depth 1 of an object-literal body. */
function topKeys(body) {
  const keys = [];
  let depth = 0;
  let i = 0;
  while (i < body.length) {
    const ch = body[i];
    if (ch === "{" || ch === "(" || ch === "[") depth++;
    else if (ch === "}" || ch === ")" || ch === "]") depth--;
    else if (depth === 0) {
      const m = /^["']?([A-Za-z_$][\w$-]*)["']?\s*:(?!:)/.exec(body.slice(i));
      if (m && !/[\w$]/.test(body[i - 1] ?? " ")) {
        keys.push(m[1]);
        i += m[0].length;
        continue;
      }
    }
    i++;
  }
  return keys;
}

const lineOf = (text, index) => text.slice(0, index).split("\n").length;

/** Properties animated by one `transition` declaration value (`transform 1s, width 2s` or Tailwind's `translate,width`). */
function transitionProps(value) {
  return splitTop(value)
    .map((item) => item.trim().split(/[\s_]+/)[0] ?? "")
    .filter(
      (p) =>
        p && !/^[\d.]/.test(p) && !p.startsWith("var(") && !p.startsWith("(") && p !== "initial" && p !== "inherit",
    )
    .map(normalise);
}

/**
 * Every animated property in `text` (a .css, .ts or .tsx file): [{ line, property, via }].
 * `via` names the mechanism (tailwind transition, css transition, keyframes <name>, motion prop, animate()).
 */
export function scanSource(file, text) {
  const css = file.endsWith(".css");
  const src = stripComments(text, css);
  const hits = [];
  const add = (index, property, via) => hits.push({ line: lineOf(src, index), property: normalise(property), via });

  // Tailwind utilities (class strings): transition-[a,b], transition-shadow, transition-all, bare `transition`.
  for (const m of src.matchAll(/(?<![\w-])((?:[\w-]+:)*)transition-\[([^\]]+)\]/g))
    for (const p of transitionProps(m[2].replace(/_/g, " "))) add(m.index, p, "tailwind transition");
  const named = { all: "all", shadow: "box-shadow", colors: "color", opacity: "opacity", transform: "transform" };
  for (const m of src.matchAll(/(?<![\w-])((?:[\w-]+:)*)transition-(all|shadow|colors|opacity|transform)(?![\w-])/g))
    add(m.index, named[m[2]], "tailwind transition");
  if (!css)
    for (const m of src.matchAll(/(?<=["'`\s])((?:[\w-]+:)*)transition(?=["'`\s])(?![\s]*[=:])/g)) {
      const lineStart = src.lastIndexOf("\n", m.index) + 1;
      const line = src.slice(lineStart, src.indexOf("\n", m.index) < 0 ? undefined : src.indexOf("\n", m.index));
      // A class sits in a string next to other utilities; a lone quoted word, an import or prose is not one.
      if (
        !/(?:^|[\s"'`:])(?:duration|ease|delay|rounded|px|py|flex|inline|absolute|relative|text|bg|size|h|w)-/.test(
          line,
        )
      )
        continue;
      const around = src.slice(m.index - 1, m.index + m[0].length + 1);
      if (/^["'`].*["'`]$/.test(around) && !m[1]) continue;
      add(m.index, "all", "tailwind transition (bare: animates box-shadow, filter and more)");
    }

  // CSS declarations: `transition:` / `transition-property:` in CSS and in inline style strings.
  for (const m of src.matchAll(/(?<![\w-])transition(?:-property|Property)?\s*:\s*(["'`]?)([^;}"'`\n]+)/g)) {
    if (!css && !m[1] && !/transition(-property|Property)/.test(m[0])) continue; // a Motion `transition: {` object
    for (const p of transitionProps(m[2])) add(m.index, p, "css transition");
  }

  // @keyframes <name> { ... }
  for (const m of src.matchAll(/@keyframes\s+([\w-]+)\s*\{/g)) {
    const { inner } = balanced(src, m.index + m[0].length - 1);
    const seen = new Set();
    for (const d of inner.matchAll(/(?:^|[;{\s])((?:--)?[a-z][\w-]*)\s*:(?!:)/g)) seen.add(d[1]);
    for (const p of seen) add(m.index, p, `keyframes ${m[1]}`);
  }

  if (!css) {
    // Motion props whose value is an object literal: layout / paint keys are flagged (a state label such as `{ open }` is not).
    for (const m of src.matchAll(
      /\b(animate|initial|exit|whileHover|whileTap|whileInView|whileFocus|whileDrag)=\{\{/g,
    )) {
      // Only on a Motion element (`<motion.rect`, `<m.div`): other components have props with these names too.
      if (!/^<(?:motion|m)\./.test(src.slice(src.lastIndexOf("<", m.index)))) continue;
      const { inner } = balanced(src, m.index + m[0].length - 1);
      for (const key of topKeys(inner)) if (MOTION_BAD.test(key)) add(m.index, kebab(key), `motion ${m[1]} prop`);
    }
    // Variants objects and imperative animate() calls: layout keys anywhere inside.
    const regions = [];
    for (const m of src.matchAll(
      /\bvariants=\{\{|(?:const|let)\s+\w+\s*:\s*Variants\s*=\s*\{|\banimate\(|\.animate\(/g,
    )) {
      const open = m.index + m[0].length - 1;
      regions.push({ index: m.index, ...balanced(src, open) });
    }
    for (const r of regions)
      for (const key of new Set(topKeysDeep(r.inner)))
        if (MOTION_BAD.test(key)) add(r.index, kebab(key), "motion variants / animate()");
  }

  // A variant object defined away from the element (`hidden: { opacity: 0, filter: "blur(8px)" }`).
  if (!css)
    for (const m of src.matchAll(/(?<![\w$.])filter\s*:\s*[`"'][^`"']*blur\(/g))
      add(m.index, "filter", "motion variant (blur)");

  return hits.filter((h) => !isOk(h.property));
}

/** Every `key:` token at any depth (variants nest one level deeper than a prop object). */
function topKeysDeep(body) {
  return [...body.matchAll(/(?<![\w$.])["']?([A-Za-z_$][\w$]*)["']?\s*:(?!:)/g)].map((m) => m[1]);
}
