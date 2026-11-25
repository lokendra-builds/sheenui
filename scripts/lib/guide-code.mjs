// Fenced code samples of the guides (docs/guides/*.md), for scripts/check-guide-code.mjs.
//
// Convention (the first word of a fence's info string is the language, as the docs site reads it; the rest are markers):
//   ```tsx            a complete module: compiled as written against the library
//   ```tsx fragment   a few lines with no imports: compiled inside a function body, with every SheenUI export the lines
//                     name imported from "@sheenui/theme" automatically
//   ```tsx external   shows another library's API (Radix, Framer Motion, another glass kit): cannot compile here; counted
//                     and listed by the check so the exception stays visible
// Only ts, tsx, jsx and js fences are samples; css, bash, html, text and the like are out of scope.

/** Languages whose fences are samples. */
export const SAMPLE_LANGS = new Set(["ts", "tsx", "jsx", "js"]);

/**
 * @typedef {{ file: string; line: number; lang: string; kind: "module" | "fragment" | "external"; code: string; name: string }} GuideSample
 */

/**
 * The samples of one guide, in document order. `line` is the line of the opening fence; `name` is the module name a
 * sample is compiled under: the file named by its first comment (`// file: x.ts` or `// src/app/x.tsx`), otherwise
 * sample-<n>, so a later sample can import "./x" from it.
 * @param {string} markdown
 * @param {string} file
 * @returns {GuideSample[]}
 */
export function extractGuideSamples(markdown, file) {
  const lines = markdown.split("\n");
  const out = [];
  for (let i = 0; i < lines.length; i += 1) {
    const open = /^(\s*)(`{3,})\s*(\S*)\s*(.*)$/.exec(lines[i]);
    if (!open || !open[3]) {
      if (open) i = skipFence(lines, i, open[2]);
      continue;
    }
    const [, , ticks, lang, markers] = open;
    let end = i + 1;
    while (end < lines.length && !new RegExp(`^\\s*${ticks}\\s*$`).test(lines[end])) end += 1;
    if (SAMPLE_LANGS.has(lang)) {
      const words = markers.trim().split(/\s+/).filter(Boolean);
      const kind = words.includes("external") ? "external" : words.includes("fragment") ? "fragment" : "module";
      const code = lines.slice(i + 1, end).join("\n");
      const header = /^\/\/\s*(?:file:\s*)?([\w./@-]+\.(?:tsx?|jsx?|mjs))\b/.exec(code);
      const ext = lang === "ts" ? "ts" : lang === "js" ? "mjs" : lang;
      out.push({
        file,
        line: i + 1,
        lang,
        kind,
        code,
        name: header ? header[1].split("/").pop() : `sample-${out.length + 1}.${ext}`,
      });
    }
    i = end;
  }
  return out;
}

/** Index of the closing fence of an unlabelled fence that opens at `i`. */
function skipFence(lines, i, ticks) {
  let end = i + 1;
  while (end < lines.length && !new RegExp(`^\\s*${ticks}\\s*$`).test(lines[end])) end += 1;
  return end;
}
