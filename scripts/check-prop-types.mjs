// `pnpm types:check`: every type name that a generated props table shows is exported from the package entry, so the
// reader can `import { type FieldSize } from "@sheenui/theme"`. Names are read from demo/src/generated/component-props.ts
// (the rows' Type column); the exports come from the TypeScript checker on theme/src/index.ts (values and types alike).
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ENTRY = join(ROOT, "theme", "src", "index.ts");

const config = ts.readConfigFile(join(ROOT, "theme", "tsconfig.json"), ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, join(ROOT, "theme"));
const program = ts.createProgram({ rootNames: [ENTRY], options: parsed.options });
const checker = program.getTypeChecker();
const entry = program.getSourceFile(ENTRY);
const exported = new Set(checker.getExportsOfModule(checker.getSymbolAtLocation(entry)).map((s) => s.getName()));

// Names that are not ours to export: TypeScript and DOM globals, React, Intl, Base UI namespaces and generic parameters.
const GLOBAL = new Set(
  "Array Record Partial Omit Pick Required Readonly ReadonlyArray ReadonlySet ReadonlyMap Set Map Promise Date Intl Element HTMLElement HTMLDivElement HTMLInputElement HTMLButtonElement HTMLAnchorElement HTMLSpanElement HTMLTextAreaElement HTMLFormElement HTMLTableElement SVGSVGElement SVGElement SVGGElement File Blob AbortSignal MouseEvent PointerEvent KeyboardEvent FocusEvent ChangeEvent Event Node RegExp Error Function Object String Number Boolean Symbol ReactNode ReactElement ReactNode JSX Ref RefObject RefCallback CSSProperties ComponentProps ComponentType LazyExoticComponent Dispatch SetStateAction FocusEventHandler MouseEventHandler KeyboardEventHandler ChangeEventHandler AriaRole HTMLAttributes ClipboardEventHandler HTMLHeadingElement JSXElementConstructor ShadowRoot VirtualElement InteractionType".split(
    " ",
  ),
);
const ours = (name) => !GLOBAL.has(name) && !/^[A-Z]$/.test(name) && !/^T[A-Z]/.test(name);

const source = readFileSync(join(ROOT, "demo", "src", "generated", "component-props.ts"), "utf8");
const used = new Map();
for (const m of source.matchAll(/export const (\w+): GeneratedProps = (\[\[[\s\S]*?\]\]);\n/g)) {
  let rows;
  try {
    rows = JSON.parse(m[2].replace(/,\]/g, "]"));
  } catch {
    rows = [];
  }
  for (const row of rows) {
    const type = String(row[1] ?? "");
    // Words that look like type names; skip string-literal unions and members after a dot (Intl.NumberFormatOptions).
    const bare = type.replace(/"(?:[^"\\]|\\.)*"/g, "").replace(/\b[A-Za-z]+\.[A-Za-z.]+/g, "");
    for (const w of bare.matchAll(/\b([A-Z][A-Za-z0-9]+)\b/g)) {
      if (ours(w[1]) && !exported.has(w[1]))
        (used.get(w[1]) ?? used.set(w[1], new Set()).get(w[1])).add(`${m[1]}.${row[0]}`);
    }
  }
}

if (used.size === 0) {
  console.log(`types:check ok: every type named in a props table is exported (${exported.size} exports)`);
} else {
  console.error(
    `types:check FAILED: ${used.size} type names appear in props tables but are not exported from theme/src/index.ts:`,
  );
  for (const [name, where] of [...used].sort())
    console.error(`  ${name}  (${[...where].slice(0, 3).join(", ")}${where.size > 3 ? ", ..." : ""})`);
  process.exit(1);
}
