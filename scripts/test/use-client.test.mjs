// node:test: "use client" in theme/src must follow client-only use.
//   - a module that calls a hook (use*), wires a JSX event handler, touches window/document/localStorage/navigator,
//     imports Base UI, renders a motion element or AnimatePresence or creates a context needs the directive;
//   - a module with the directive and none of those is pure and must drop it, unless it is a component's public
//     entry (<name>/<name>.tsx), which keeps it so a Server Component can pass it function props.
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { test } from "node:test";
import { isAppleDouble } from "../lib/fs-filter.mjs";

const SRC = join(import.meta.dirname, "..", "..", "theme", "src");
/**
 * Pure helpers that read a browser global only inside a function a client module calls: no directive needed. Each
 * entry says why; a module that stops touching the DOM must leave this list (the last test fails on stale entries).
 */
const DOM_HELPERS = new Map([
  ["blocks/ai-chat/utils.ts", "copy-to-clipboard helper called from click handlers"],
  ["blocks/analytics/demo.ts", "demo data timers started by the dashboards' effects"],
  ["components/backdrop/grain.ts", "paints the grain canvas when the backdrop effect asks"],
  ["components/calendar/date-utils.ts", "reads navigator.language for the default locale at call time"],
  ["components/charts/chart-export.ts", "builds a download link inside the export handler"],
  ["components/liquid-glass/lens-map.ts", "renders the displacement map on a canvas when the lens mounts"],
  ["lib/csv.ts", "triggers the CSV download inside an event handler"],
  ["lib/modal-flag.ts", "toggles a document flag from dialog effects"],
  ["hooks/use-intersection.ts", "creates observers inside the effects of the hooks that call it"],
  ["motion/light-follower.ts", "attaches pointer listeners and rAF loops from effects"],
  ["motion/tokens.ts", "reads matchMedia for reduced motion inside functions, never at import"],
]);

const walk = (dir) =>
  readdirSync(dir)
    .filter((name) => !isAppleDouble(name))
    .flatMap((name) => {
      const path = join(dir, name);
      return statSync(path).isDirectory() ? walk(path) : [path];
    });

/**
 * Source without comments, so a word in prose is not read as code: block comments, then line comments anywhere on a
 * line (trailing ones too). Strings and template literals are matched first and kept, so `"https://…"` survives.
 */
const code = (text) =>
  text
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(
      /("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`)|\/\/[^\n]*/g,
      (match, literal) => literal ?? "",
    );

/** Local names bound to the React namespace (`import * as React from "react"`, `import React from "react"`). */
const reactAliases = (text) => {
  const names = new Set(["React"]);
  for (const m of text.matchAll(/import\s+(?:\*\s+as\s+)?(\w+)\s*(?:,\s*\{[^}]*\})?\s*from\s*["']react["']/g))
    names.add(m[1]);
  return [...names];
};

/** Browser-only APIs: a bare global, a global read or an observer construction. */
const DOM_API =
  /\b(window|document|localStorage|sessionStorage|navigator)\.|\btypeof\s+(window|document)\b|(?<![.\w])(matchMedia|requestAnimationFrame|cancelAnimationFrame|requestIdleCallback)\s*\(|\bnew\s+(IntersectionObserver|ResizeObserver|MutationObserver)\b/;

/** A line at module top level (no indentation) that reads window/document without a typeof guard: it crashes SSR. */
const topLevelDom = (text) =>
  text
    .split("\n")
    .map((line) => line.replace(/`[^`]*`|"[^"\n]*"|'[^'\n]*'/g, '""'))
    .some(
      (line) =>
        /^(?:export\s+)?(?:const|let|var)\s/.test(line) &&
        !line.includes("=>") &&
        /\b(window|document)\b/.test(line) &&
        !/\btypeof\s+(window|document)\b/.test(line),
    );

/** Classifies one module's source. Exported shape is what the tests below assert on. */
export const classify = (source) => {
  const text = code(source);
  // Plain string literals emptied for the code-shape checks, so a URL or a sentence in a string is not read as code
  // (template literals stay: their ${…} parts are code). Imports and the directive are read from `text`.
  const bare = text.replace(/"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/g, '""');
  const ns = reactAliases(text).join("|");
  return {
    directive: /^\s*["']use client["']/.test(text),
    hook: /(?<![.\w])use[A-Z]\w*\s*[(<]/.test(bare) || new RegExp(`\\b(?:${ns})\\.use[A-Z]\\w*\\s*[(<]`).test(bare),
    handler: /\bon[A-Z]\w*=\{/.test(bare),
    dom: DOM_API.test(bare),
    topLevelDom: topLevelDom(text),
    client:
      /from\s*["']@base-ui/.test(text) ||
      /\b(createContext|Context\.Provider)\b|\bmotion\.\w+|<AnimatePresence/.test(text),
  };
};

const files = walk(SRC)
  .filter((f) => /\.tsx?$/.test(f) && !/\.(test|d)\.tsx?$/.test(f))
  .map((file) => ({
    rel: file.slice(SRC.length + 1),
    ...classify(readFileSync(file, "utf8")),
    entry: basename(file).replace(/\.tsx?$/, "") === basename(dirname(file)),
  }));

test("the detector flags each client-only signal and spares pure code", () => {
  const positive = {
    "bare hook": `const [a] = useState(0);`,
    "namespace hook": `import * as React from "react";\nconst a = React.useMemo(() => 1, []);`,
    "default-import namespace hook": `import R from "react";\nconst a = R.useRef(null);`,
    "generic hook call": `const a = useRef<HTMLDivElement>(null);`,
    "JSX handler": `<button onClick={go} />`,
    "Base UI import": `import { Dialog } from "@base-ui/react/dialog";`,
    context: `const Ctx = createContext(null);`,
    "motion element": `<motion.div />`,
  };
  for (const [name, src] of Object.entries(positive)) {
    const c = classify(src);
    assert.ok(c.hook || c.handler || c.client, `should need the directive: ${name}`);
  }
  const dom = {
    "window read": `const w = window.innerWidth;`,
    "document read": `document.body.classList.add("x");`,
    "typeof window": `const ok = typeof window !== "undefined";`,
    localStorage: `localStorage.getItem("k");`,
    matchMedia: `const m = matchMedia("(min-width: 1px)");`,
    IntersectionObserver: `const o = new IntersectionObserver(cb);`,
    ResizeObserver: `const o = new ResizeObserver(cb);`,
    MutationObserver: `const o = new MutationObserver(cb);`,
    requestAnimationFrame: `requestAnimationFrame(tick);`,
  };
  for (const [name, src] of Object.entries(dom)) assert.ok(classify(src).dom, `should read a browser API: ${name}`);
  assert.ok(classify(`const w = window.innerWidth;`).topLevelDom, "top-level window read");
  assert.ok(classify(`export const d = document.title;`).topLevelDom, "top-level exported document read");

  const negative = {
    "plain function": `export function add(a: number, b: number) { return a + b; }`,
    "member named use-like": `const x = obj.user(1);`,
    "word in a comment": `// calls useState and window.foo\n/* requestAnimationFrame( */\nexport const n = 1;`,
    "word in a trailing comment": `export const n = 1; // not window.foo or useState()`,
    "URL in a string": `export const u = "https://example.com/window.open";`,
    "prop type only": `type P = { onClick?: () => void };`,
    "member rAF": `const f = this.requestAnimationFrame;`,
  };
  for (const [name, src] of Object.entries(negative)) {
    const c = classify(src);
    assert.ok(!c.hook && !c.handler && !c.client && !c.dom && !c.topLevelDom, `should be pure: ${name}`);
  }
  assert.ok(!classify(`const ok = typeof window !== "undefined";`).topLevelDom, "a typeof guard is not a crash");
  assert.ok(
    !classify(`export function f() {\n  return window.innerWidth;\n}`).topLevelDom,
    "access inside a function is fine",
  );
  assert.ok(classify(`"use client";\nconst a = 1;`).directive && !classify(`const a = 1;`).directive, "directive");
});

test("the scan sees the library", () => assert.ok(files.length > 300));

test("a module that uses a hook has the directive", () => {
  const bad = files.filter((f) => f.hook && !f.directive).map((f) => f.rel);
  assert.deepEqual(bad, [], `add "use client" to: ${bad.join(", ")}`);
});

test("a module with a handler, Base UI import or context has the directive", () => {
  const bad = files.filter((f) => (f.handler || f.client) && !f.directive).map((f) => f.rel);
  assert.deepEqual(bad, [], `add "use client" to: ${bad.join(", ")}`);
});

test("a module that reads a browser global has the directive, or is a listed pure helper", () => {
  const bad = files.filter((f) => f.dom && !f.directive && !DOM_HELPERS.has(f.rel)).map((f) => f.rel);
  assert.deepEqual(bad, [], `add "use client" (or list as a DOM helper): ${bad.join(", ")}`);
});

test("every listed DOM helper still reads a browser API and has a reason (no stale entries)", () => {
  for (const [rel, reason] of DOM_HELPERS) {
    const f = files.find((x) => x.rel === rel);
    assert.ok(f, `listed DOM helper not found: ${rel}`);
    assert.ok(f.dom, `listed DOM helper no longer reads a browser API, drop it from DOM_HELPERS: ${rel}`);
    assert.ok(reason.length > 10, `give ${rel} a reason`);
  }
});

test("no module reads window/document at top level without a typeof guard", () => {
  const bad = files.filter((f) => f.topLevelDom).map((f) => f.rel);
  assert.deepEqual(bad, [], `guard with typeof window or move into a function: ${bad.join(", ")}`);
});

test("a pure module does not carry the directive", () => {
  const bad = files
    .filter((f) => f.directive && !f.entry && !f.hook && !f.handler && !f.dom && !f.client)
    .map((f) => f.rel);
  assert.deepEqual(bad, [], `drop "use client" from: ${bad.join(", ")}`);
});
