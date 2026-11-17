#!/usr/bin/env node
// Motion-token gate: fails on new hard-coded easings or millisecond durations outside the token files.
//   node scripts/check-motion-literals.mjs          check theme/src and demo/src
//   node scripts/check-motion-literals.mjs --list   print the allow-list
//
// Flagged:  <n>s / .<n>s               a literal duration in seconds (CSS, class strings) -> var(--sheen-duration-*) / duration.*
//           ease: "easeOut" and friends, CSS/Tailwind `ease-out`, `ease` / `ease-in-out` in a transition or animation value
//                                       -> ease.* / var(--sheen-ease-*)   (`linear` is the one keyword that stays: constant speed has no curve to tokenise)
//           cubic-bezier(<number>...)   a literal curve      -> var(--sheen-ease-*) / ease.* from motion/tokens
//           <number>ms                  a literal duration   -> var(--sheen-duration-*) / duration.*
//           ease: [<number>, ...]       a literal curve array -> ease.out / ease.inOut / ease.exit
//           duration: 0.x / delay: 0.x  a literal seconds value in a Motion option object (.tsx) -> duration.* / spring.*
//                                       (`duration: 0` = instant is fine; theme/src/motion presets and the home
//                                       storyboard are exempt; the files in ALLOW_SECONDS are listed with reasons)
// Not flagged: `calc(... * 70ms)` stagger steps (a per-index delay, not a duration), comments, tests, generated
// files, prose strings (anything that is not code or CSS), and the entries of ALLOW below (each with its reason).
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { withoutAppleDouble } from "./lib/fs-filter.mjs";

const root = join(fileURLToPath(import.meta.url), "..", "..");
const DIRS = ["theme/src", "demo/src"];
const SKIP_DIR = /(^|\/)(generated|seo|node_modules)(\/|$)/;
const SKIP_FILE = /(\.test\.tsx?|\.d\.ts)$|(^|\/)theme\/src\/styles\/(tokens|motion)\.css$/;

/** path (relative to the repo root) -> reason. Keep this list short; every entry needs a real reason. */
const ALLOW = {
  "theme/src/components/carousel/carousel.tsx":
    "ease-out whose opening slope (2) matches the release speed of a throw (duration = 2 x distance / speed); not a token curve by design",
  "demo/src/pages/OverlayKitPages.tsx": "demo copy: a sample `ease` option shown to the reader as the exit curve",
};

/** Seconds literals (`duration: 0.4`, `delay: 0.1 + i * 0.05`) in .tsx: path -> reason. Same rule: a real reason each. */
const ALLOW_SECONDS = {
  "demo/src/pages/HomeHero.tsx": "home storyboard: scene timings are authored as a timeline, not interaction durations",
  "demo/src/pages/DisplayKitPages.tsx": "demo copy: a table showing the spring presets' parameters to the reader",
  "demo/src/pages/OverlayKitPages.tsx": "demo copy: sample exit transition shown to the reader",
  "demo/src/pages/ChartsFlowPages.tsx": "demo-only count-up of a sample figure (one-shot, not a theme interaction)",
  "theme/src/components/text-effects/typewriter.tsx":
    "typing-speed and caret blink period are content timings (linear on purpose), not UI transitions",
  "theme/src/components/tags-input/tags-input.tsx":
    "0.4 s validation shake keyframes with ease.out; no shake token yet",
  "theme/src/components/otp-input/otp-input.tsx": "one-shot success ring; per-index stagger step of the digit cells",
  "theme/src/components/empty-state/empty-state.tsx":
    "entrance stagger: 0.06 s offset + 0.08 s per child (stagger offsets are not tokens)",
  "theme/src/components/alert-dialog/parts/icons-content.tsx":
    "icon draw-in choreography: fixed offsets after the dialog opens",
  "theme/src/blocks/ai-chat/parts.tsx": "chat bubble fade after the spring settles (0.16 s, ease.out)",
  "theme/src/blocks/analytics-finance/cards.tsx": "one-shot data fill (0.9 s) on a demo card",
  "theme/src/blocks/auth-split/brand.tsx": "brand panel entrance choreography (fixed offsets)",
  "theme/src/blocks/notification-center/row.tsx": "decorative one-shot sweep, delayed behind the row's entrance",
  "theme/src/blocks/pricing/parts.tsx": "decorative conic border rotation (continuous, gated by reduced motion)",
  // Chart entrance choreography: per-mark delays derived from data position / row index (0.05 + i * step). Offsets
  // are computed from the data, so they cannot be single tokens; the base duration of every chart comes from duration.*.
  "theme/src/components/charts/beeswarm.tsx": "chart entrance: per-mark delay derived from the data position",
  "theme/src/components/charts/bullet-chart.tsx": "chart entrance: per-row delay offsets",
  "theme/src/components/charts/category-bar.tsx": "chart entrance: per-row delay offsets",
  "theme/src/components/charts/chord-diagram.tsx": "chart entrance: per-ribbon delay offsets",
  "theme/src/components/charts/diverging-bar-chart.tsx": "chart entrance: per-row delay offsets",
  "theme/src/components/charts/dumbbell-chart.tsx":
    "chart entrance: per-row delay offsets (stem, dots, labels in sequence)",
  "theme/src/components/charts/gantt-chart.tsx": "chart entrance: per-row delay offsets",
  "theme/src/components/charts/gauge-chart/parts.tsx": "chart entrance: needle delay offset",
  "theme/src/components/charts/histogram.tsx": "chart entrance: per-bin delay offsets",
  "theme/src/components/charts/lollipop-chart.tsx": "chart entrance: per-row delay offsets",
  "theme/src/components/charts/radar-chart.tsx": "chart entrance: per-series delay offsets",
  "theme/src/components/charts/sunburst-chart.tsx": "chart entrance: duration scaled by the arc's start angle",
};
/** Files whose CSS authors loop periods and choreography in seconds / keyword easings (the two newer checks only): path -> reason. */
const ALLOW_CSS_TIMING = {
  "demo/src/index.css":
    "docs-site home, hub and stage storyboards: scene timings and loop periods authored in seconds on a timeline (never shipped in the library)",
};
const SECONDS_RE = /\b(?:duration|delay):\s*(?:0?\.\d+|[1-9]\d?\.\d+)\b/;

const PATTERNS = [
  { name: "cubic-bezier literal", re: /cubic-bezier\(\s*-?\.?\d/ },
  { name: "literal ms duration", re: /(?<![\d.])\d+(?:\.\d+)?ms(?![a-z])/ },
  { name: "literal ease array", re: /\bease:\s*\[\s*-?\.?\d/ },
  // Seconds in CSS / class strings: `2.4s`, `.5s`, `animate-[x_1.1s_linear]`. A word char before the digits (`h2s`, `v1.2s`) is not a duration.
  {
    timing: true,
    name: "literal seconds duration",
    re: /(?<![A-Za-z0-9.])(?:\d+\.\d+|\.\d+|[1-9]\d*)s(?![A-Za-z0-9-])/,
  },
  // Keyword easings: Motion strings (`ease: "easeOut"`), CSS keywords in a transition / animation value, Tailwind `ease-out`.
  {
    timing: true,
    name: "keyword easing (Motion string)",
    re: /\bease:\s*["'`](?:ease|easeIn|easeOut|easeInOut|circIn|circOut|circInOut|backIn|backOut|backInOut|anticipate)["'`]/,
  },
  {
    timing: true,
    name: "keyword easing (array of strings)",
    re: /\bease:\s*\[\s*["'`](?:ease|easeIn|easeOut|easeInOut)["'`]/,
  },
  {
    timing: true,
    name: "keyword easing (Motion string list)",
    re: /["'`](?:easeIn|easeOut|easeInOut|circIn|circOut|circInOut|backIn|backOut|backInOut|anticipate)["'`]/,
  },
  { timing: true, name: "keyword easing (Tailwind ease-out)", re: /(?<![\w-])ease-(?:in|out|in-out)(?![\w-])/ },
  {
    timing: true,
    name: "keyword easing (CSS value)",
    // `transition: opacity 1s linear` / `animation: x 2s ease-in-out` / an arbitrary `[transition:a_1s_linear]` or `animate-[x_1s_linear]`.
    re: /(?:(?<![\w-])(?:transition|animation)(?:-timing-function)?\s*:(?!\s*\{)[^;]*|\[transition:[^\]]*|animate-\[[^\]]*)(?<![\w.-])(?:ease|ease-in|ease-out|ease-in-out)(?![\w.(:-])/,
  },
];

/** An entry covers its file, or the folder a page file was split into (`Foo.tsx` -> `Foo/*.tsx`). */
const allowed = (list, rel) =>
  Boolean(list[rel]) || Object.keys(list).some((k) => rel.startsWith(k.replace(/\.tsx$/, "/")));

function* files(dir) {
  for (const name of withoutAppleDouble(readdirSync(dir))) {
    const p = join(dir, name);
    const rel = relative(root, p);
    if (statSync(p).isDirectory()) {
      if (!SKIP_DIR.test(rel)) yield* files(p);
    } else if (/\.(tsx?|css)$/.test(name) && !SKIP_FILE.test(rel)) yield p;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1] && process.argv.includes("--list")) {
  for (const [f, why] of [
    ...Object.entries(ALLOW),
    ...Object.entries(ALLOW_SECONDS),
    ...Object.entries(ALLOW_CSS_TIMING),
  ])
    console.log(`${f}\n  ${why}`);
  process.exit(0);
}

/** Context a seconds value must sit in to count as a duration (keeps data labels such as "4.2s" out). */
const TIMING_CONTEXT = /animat|transition|duration|delay|calc\(/;

/**
 * The problems in one file: `rel` is its path relative to the repo root, `text` its source. Pure, so scripts/test can drive it.
 * Returns strings like `path:line  rule: source line`.
 */
export function findLiterals(rel, text) {
  const found = [];
  if (allowed(ALLOW, rel)) return found;
  const secondsOk = !rel.endsWith(".tsx") || allowed(ALLOW_SECONDS, rel) || /(^|\/)theme\/src\/motion\//.test(rel);
  const timingOk = allowed(ALLOW_CSS_TIMING, rel);
  const isStyles = /^theme\/src\/styles\//.test(rel);
  let inBlock = false;
  text.split("\n").forEach((line, i) => {
    const t = line.trim();
    if (inBlock) {
      if (t.includes("*/")) inBlock = false;
      return;
    }
    if ((t.startsWith("/*") || t.startsWith("{/*")) && !t.includes("*/")) return void (inBlock = true);
    if (t.startsWith("//") || t.startsWith("*") || t.startsWith("/*") || t.startsWith("{/*")) return;
    if (/\bdescription=/.test(line)) return; // prose props
    // A token definition in the styles folder (`--sheen-duration-loop-calm: 2.2s`) is where literals belong.
    if (isStyles && /^--sheen-(?:duration|ease|loop)[\w-]*\s*:/.test(t)) return;
    const code = line.replace(/\/\*.*?\*\//g, "").replace(/(^|\s)\/\/.*$/, "");
    // A stagger step inside calc(): `calc(var(--i) * 70ms)`; and a Tailwind `delay-[40ms]` is a delay, not a duration, so it passes too.
    const noStagger = code
      .replace(/\*\s*\d+(?:\.\d+)?ms(?![a-z])/g, "* STEP")
      .replace(/delay-\[\d+ms\]/g, "delay-STEP");
    if (!secondsOk && SECONDS_RE.test(noStagger))
      found.push(`${rel}:${i + 1}  literal seconds duration/delay: ${t.slice(0, 110)}`);
    for (const { name, re, timing } of PATTERNS) {
      if (timing && timingOk) continue;
      if (name === "literal seconds duration" && !TIMING_CONTEXT.test(noStagger)) continue;
      if (re.test(noStagger)) {
        found.push(`${rel}:${i + 1}  ${name}: ${t.slice(0, 110)}`);
        break; // one report per line is enough to find it
      }
    }
  });
  return found;
}

function main() {
  const found = [];
  for (const d of DIRS)
    for (const file of files(join(root, d)))
      found.push(...findLiterals(relative(root, file), readFileSync(file, "utf8")));
  if (found.length) {
    console.error(`motion literals: ${found.length} hard-coded value(s) outside the token set:\n`);
    for (const f of found) console.error("  " + f);
    console.error(
      "\nUse var(--sheen-duration-*) / var(--sheen-ease-*) in CSS, duration.* / ease.* / spring.* from motion/tokens in TS,",
    );
    console.error("or add the file to ALLOW in scripts/check-motion-literals.mjs with a reason.");
    process.exit(1);
  }
  console.log(
    "motion literals: ok (no hard-coded cubic-bezier / ms or seconds duration / ease array / keyword easing outside the token files)",
  );
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
