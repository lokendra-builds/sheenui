// Extracts every public component's props (name, type, default, JSDoc) from the TypeScript source with the
// TypeScript compiler API. The docs' <PropsTable of="Name"> renders from this, so a props table cannot drift
// from the code: a new prop shows up on its page by itself, a changed default or type follows the code.
//
// Defaults come from the destructuring default in the component's parameter list (`{ delay = 300 }`) or an
// explicit `@default` tag on the prop's JSDoc. A prop with neither shows no default.
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { DEFAULT_APPLIED_ELSEWHERE } from "./default-applied-elsewhere.mjs";
import { readSplitSource } from "./split-source.mjs";

/** The longest stated default the Default cell takes from the prose; a longer one needs an `@default` tag at the source. */
const MAX_PROSE_DEFAULT = 60;

const here = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = resolve(here, "../../..");
// The root workspace pins the TypeScript 6 compiler API; the demo itself type-checks with the native TS 7 (no JS API).
const ts = createRequire(join(REPO_ROOT, "package.json"))("typescript");

/** Props every component takes: a row only when the component documents them itself (own JSDoc). */
const COMMON = new Set(["children", "className", "style"]);
const IGNORED = new Set(["ref", "key"]);

function tagText(symbol, name) {
  const tag = symbol.getJsDocTags().find((t) => t.name === name);
  return tag ? ts.displayPartsToString(tag.text).trim() : undefined;
}

/**
 * The labels type a prop's type text names: `Partial<XLabels>`, `Partial<Pick<XLabels, "a" | "b">>`, `Pick<XLabels, ...>` or a bare
 * `XLabels` / `XLabelsInput`. Returns { type, partial, only } (only: the picked keys), or undefined when the type is no labels type.
 */
export function parseLabelsType(text) {
  const pick = /^(Partial<)?Pick<(\w+Labels(?:Input)?),\s*([^>]+)>>?$/.exec(text);
  if (pick)
    return {
      type: pick[2],
      partial: Boolean(pick[1]),
      only: new Set([...pick[3].matchAll(/"([^"]+)"/g)].map((x) => x[1])),
    };
  const partial = /^Partial<(\w+Labels(?:Input)?)(?:<.*>)?>$/.exec(text);
  if (partial) return { type: partial[1], partial: true };
  const bare = /^(\w+Labels(?:Input)?)$/.exec(text);
  return bare ? { type: bare[1], partial: /Input$/.test(bare[1]) } : undefined;
}

/** Defaults written in a function's destructured first parameter. */
function destructuredDefaults(fn) {
  const out = new Map();
  const param = fn.parameters?.[0];
  const take = (pattern) => {
    for (const el of pattern.elements) {
      if (!el.initializer || el.dotDotDotToken) continue;
      const key = el.propertyName ?? el.name;
      if (ts.isIdentifier(key) || ts.isStringLiteral(key))
        out.set(key.text, { text: el.initializer.getText().replace(/\s+/g, " "), node: el.initializer });
    }
  };
  if (param && ts.isObjectBindingPattern(param.name)) take(param.name);
  // Defaults destructured in the body: `const { a = 1 } = props;`
  if (param && ts.isIdentifier(param.name) && fn.body && ts.isBlock(fn.body)) {
    for (const stmt of fn.body.statements) {
      if (!ts.isVariableStatement(stmt)) continue;
      for (const d of stmt.declarationList.declarations) {
        if (
          ts.isObjectBindingPattern(d.name) &&
          d.initializer &&
          ts.isIdentifier(d.initializer) &&
          d.initializer.text === param.name.text
        )
          take(d.name);
      }
    }
  }
  return out;
}

/** The function node behind `function X`, `const X = (props) => …`, `forwardRef((props, ref) => …)`, `memo(…)`. */
function functionNode(decl) {
  if (ts.isFunctionDeclaration(decl)) return decl;
  if (ts.isVariableDeclaration(decl) && decl.initializer) {
    let node = decl.initializer;
    for (let i = 0; i < 4; i++) {
      if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) return node;
      if (ts.isCallExpression(node) && node.arguments.length) node = node.arguments[0];
      else if (ts.isParenthesizedExpression(node) || ts.isAsExpression(node)) node = node.expression;
      else break;
    }
  }
  return undefined;
}

// ---- BEGIN delegated, fallback and constant defaults (R6-N5) ----

const stripWrappers = (node) => {
  while (node && (ts.isParenthesizedExpression(node) || ts.isAsExpression(node) || ts.isSatisfiesExpression?.(node)))
    node = node.expression;
  return node;
};

/** Source text of a simple literal initializer (string, number, boolean, null, or an array/object of those), else undefined. */
export function literalText(init, max = 80) {
  const lit = (raw) => {
    const node = stripWrappers(raw);
    if (!node) return undefined;
    if (
      ts.isStringLiteral(node) ||
      ts.isNoSubstitutionTemplateLiteral(node) ||
      ts.isNumericLiteral(node) ||
      node.kind === ts.SyntaxKind.TrueKeyword ||
      node.kind === ts.SyntaxKind.FalseKeyword ||
      node.kind === ts.SyntaxKind.NullKeyword
    )
      return node.getText();
    if (ts.isPrefixUnaryExpression(node) && ts.isNumericLiteral(node.operand)) return node.getText();
    if (ts.isArrayLiteralExpression(node)) {
      const parts = node.elements.map(lit);
      return parts.every((p) => p !== undefined) ? `[${parts.join(", ")}]` : undefined;
    }
    if (ts.isObjectLiteralExpression(node)) {
      const parts = node.properties.map((p) => {
        if (!ts.isPropertyAssignment(p) || !(ts.isIdentifier(p.name) || ts.isStringLiteral(p.name))) return undefined;
        const v = lit(p.initializer);
        return v === undefined ? undefined : `${p.name.getText()}: ${v}`;
      });
      return parts.every((p) => p !== undefined) ? (parts.length ? `{ ${parts.join(", ")} }` : "{}") : undefined;
    }
    return undefined;
  };
  const text = lit(init);
  return text !== undefined && text.length <= max ? text : undefined;
}

/**
 * Defaults a component gets from the component it delegates to: `<Inner {...props} />` or `Inner(props)` (also
 * `Inner({ ...props, x })`), where Inner is a function in the program. Inner's own destructuring defaults apply to the props
 * the wrapper forwards, except those the wrapper sets explicitly or destructures out of the forwarded object itself.
 * @returns {Map<string, {text: string, node: import("typescript").Node}>}
 */
function delegatedDefaults(fn, checker, seen = new Set(), depth = 0) {
  const out = new Map();
  const param = fn.parameters?.[0];
  if (!param || !fn.body || depth > 3) return out;
  const forwarded = new Set();
  const destructured = new Set();
  if (ts.isIdentifier(param.name)) forwarded.add(param.name.text);
  else if (ts.isObjectBindingPattern(param.name))
    for (const el of param.name.elements) {
      if (el.dotDotDotToken && ts.isIdentifier(el.name)) forwarded.add(el.name.text);
      else {
        const key = el.propertyName ?? el.name;
        if (ts.isIdentifier(key) || ts.isStringLiteral(key)) destructured.add(key.text);
      }
    }
  if (!forwarded.size) return out;
  const isForwarded = (n) => n && ts.isIdentifier(n) && forwarded.has(n.text);
  const resolveFn = (nameNode) => {
    let symbol = checker.getSymbolAtLocation(nameNode);
    if (symbol && symbol.flags & ts.SymbolFlags.Alias) symbol = checker.getAliasedSymbol(symbol);
    const d = symbol?.valueDeclaration ?? symbol?.declarations?.[0];
    return d ? functionNode(d) : undefined;
  };
  const absorb = (nameNode, explicit) => {
    if (!ts.isIdentifier(nameNode) || !/^[A-Z]/.test(nameNode.text)) return;
    const inner = resolveFn(nameNode);
    if (!inner || inner === fn || seen.has(inner)) return;
    const next = new Set(seen).add(fn);
    const innerDefaults = new Map(destructuredDefaults(inner));
    for (const [k, v] of delegatedDefaults(inner, checker, next, depth + 1))
      if (!innerDefaults.has(k)) innerDefaults.set(k, v);
    for (const [k, v] of innerDefaults) if (!explicit.has(k) && !destructured.has(k) && !out.has(k)) out.set(k, v);
  };
  const visit = (node) => {
    if (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) {
      const attrs = node.attributes.properties;
      if (attrs.some((a) => ts.isJsxSpreadAttribute(a) && isForwarded(a.expression))) {
        const explicit = new Set(attrs.filter(ts.isJsxAttribute).map((a) => a.name.getText()));
        absorb(node.tagName, explicit);
      }
    } else if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.arguments.length === 1) {
      const arg = stripWrappers(node.arguments[0]);
      if (isForwarded(arg)) absorb(node.expression, new Set());
      else if (
        arg &&
        ts.isObjectLiteralExpression(arg) &&
        arg.properties.some((p) => ts.isSpreadAssignment(p) && isForwarded(p.expression))
      ) {
        const explicit = new Set(arg.properties.filter((p) => p.name).map((p) => p.name.getText()));
        absorb(node.expression, explicit);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(fn.body);
  return out;
}

/**
 * `x ?? "md"` / `size ?? group?.size ?? "md"` in a function body: the literal at the end of a nullish chain whose first
 * operand is a prop (destructured without a default, or `props.x`) is that prop's fallback.
 * @returns {Map<string, string>}
 */
function nullishFallbacks(fn) {
  const out = new Map();
  const param = fn.parameters?.[0];
  if (!param || !fn.body) return out;
  const local = new Map(); // local identifier -> prop key
  if (ts.isObjectBindingPattern(param.name))
    for (const el of param.name.elements) {
      if (el.initializer || el.dotDotDotToken || !ts.isIdentifier(el.name)) continue;
      const key = el.propertyName ?? el.name;
      if (ts.isIdentifier(key) || ts.isStringLiteral(key)) local.set(el.name.text, key.text);
    }
  const propsName = ts.isIdentifier(param.name) ? param.name.text : undefined;
  const isNullish = (n) => ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken;
  const visit = (node, parentIsChain) => {
    if (isNullish(node) && !parentIsChain) {
      let first = node.left;
      while (isNullish(first)) first = first.left;
      first = stripWrappers(first);
      let key;
      if (ts.isIdentifier(first)) key = local.get(first.text);
      else if (
        propsName &&
        ts.isPropertyAccessExpression(first) &&
        ts.isIdentifier(first.expression) &&
        first.expression.text === propsName
      )
        key = first.name.text;
      const last = stripWrappers(node.right);
      const value = last && !isNullish(last) ? literalText(last, 40) : undefined;
      if (key && value !== undefined && value !== '""' && value !== "null" && !out.has(key)) out.set(key, value);
    }
    ts.forEachChild(node, (c) => visit(c, isNullish(node) && isNullish(c) && node.left === c));
  };
  visit(fn.body, false);
  return out;
}

/**
 * A prop forwarded to a helper whose parameter has a default (`defaultCompact(locale)` -> `chartNumberFormat(locale = "en")`):
 * that default is the prop's. Follows the forwarding through helpers up to three calls deep.
 * @returns {Map<string, string>}
 */
function helperDefaults(fn, checker) {
  const out = new Map();
  const param = fn.parameters?.[0];
  if (!param || !fn.body || !ts.isObjectBindingPattern(param.name)) return out;
  const local = new Map();
  for (const el of param.name.elements) {
    if (el.initializer || el.dotDotDotToken || !ts.isIdentifier(el.name)) continue;
    const key = el.propertyName ?? el.name;
    if (ts.isIdentifier(key) || ts.isStringLiteral(key)) local.set(el.name.text, key.text);
  }
  const calleeFn = (callee) => {
    if (!ts.isIdentifier(callee)) return undefined;
    let symbol = checker.getSymbolAtLocation(callee);
    if (symbol && symbol.flags & ts.SymbolFlags.Alias) symbol = checker.getAliasedSymbol(symbol);
    const d = symbol?.valueDeclaration ?? symbol?.declarations?.[0];
    return d ? functionNode(d) : undefined;
  };
  const paramDefault = (target, index, depth) => {
    const p = target.parameters[index];
    if (!p || depth > 3) return undefined;
    if (p.initializer) return literalText(p.initializer, 40);
    if (!ts.isIdentifier(p.name) || !target.body) return undefined;
    let found;
    const walk = (node) => {
      if (found !== undefined) return;
      if (ts.isCallExpression(node)) {
        const next = calleeFn(node.expression);
        const at = node.arguments.findIndex((a) => ts.isIdentifier(a) && a.text === p.name.text);
        if (next && next !== target && at >= 0) found = paramDefault(next, at, depth + 1);
      }
      ts.forEachChild(node, walk);
    };
    walk(target.body);
    return found;
  };
  const visit = (node) => {
    if (ts.isCallExpression(node)) {
      const target = calleeFn(node.expression);
      if (target && target !== fn)
        node.arguments.forEach((arg, i) => {
          const key = ts.isIdentifier(arg) ? local.get(arg.text) : undefined;
          if (key && !out.has(key)) {
            const value = paramDefault(target, i, 0);
            if (value !== undefined && value !== '""' && value !== "null") out.set(key, value);
          }
        });
    }
    ts.forEachChild(node, visit);
  };
  visit(fn.body);
  return out;
}

/** The first sentence of the JSDoc on a symbol, without its closing period, as a short note ("" when none or too long). */
function shortNote(symbol, checker) {
  const doc = ts.displayPartsToString(symbol?.getDocumentationComment(checker) ?? []);
  const note = firstSentence(doc).replace(/[.!?]$/, "");
  return note && note.length <= 60 ? note : "";
}

/**
 * The literal default a description states in any of its phrasings ("Default 300.", "Default: x", "defaults to x",
 * "(default x)", ", default `x`"), for the docs:check rule "a stated default must not leave the Default cell empty".
 * Only plain literals (a number, true/false, a quoted string or a backticked one of those) count.
 */
export function statesLiteralDefault(text) {
  const literal = '(?:`([^`]+)`|("[^"]*")|(-?\\d+(?:\\.\\d+)?|true|false))(?=\\s*(?:[.;:)]|,\\s|$))';
  // The literal must END the statement: "Default 260 for columns" or "Defaults to true when ..." is a computed rule, not a literal.
  const m =
    new RegExp(`\\bdefaults?\\s*(?:to\\s+|is\\s+|:\\s*)?${literal}`, "i").exec(text) ??
    new RegExp(`\\(default\\s+${literal}`, "i").exec(text);
  const value = m && (m[1] ?? m[2] ?? m[3]);
  return value !== undefined && /^(?:-?\d+(?:\.\d+)?|true|false|"[^"]*")$/.test(value) ? value : undefined;
}

/**
 * The default a description states in words, as the clause that follows the marker ("Default: formatCompact in `locale`." ->
 * "formatCompact in locale"; "(`string`, default the runtime's)" -> "the runtime's"; `"glass" (default)` -> "\"glass\"", `auto` (default) -> auto). Markers:
 * a sentence opening "Default[s] [to|:]", "defaults to", "(default ...)" and `x (default)`. Lower-case "default" as a noun ("the
 * default format") is no marker. Undefined when the prose states none.
 */
export function statedDefaultClause(text) {
  const t = text.replace(/\s+/g, " ");
  const tidy = (s) =>
    s
      .trim()
      .replace(/[.:]$/, "")
      .replace(/`/g, "")
      .replace(/\s{2,}/g, " ");
  const after = (start) => {
    let depth = 0;
    let quote = "";
    for (let i = start; i < t.length; i++) {
      const c = t[i];
      if (quote) {
        if (c === quote) quote = "";
        continue;
      }
      if (c === "`" || c === '"') quote = c;
      else if (c === "(") depth++;
      else if (c === ")") {
        if (depth === 0) return tidy(t.slice(start, i));
        depth--;
      } else if (depth === 0 && (c === ";" || (c === "." && (i + 1 === t.length || t[i + 1] === " "))))
        return tidy(t.slice(start, i));
    }
    return tidy(t.slice(start));
  };
  const quoted = /(`[^`]+`|"[^"]*")\s*\(default\)/.exec(t);
  // One format for literals: a "quoted" string stays quoted ("glass"); a `keyword` is shown bare.
  if (quoted) return tidy(quoted[1]);
  const markers = [
    /(?:^|[.!?]\s+)Defaults?(?:\s+to\b|:)?\s+(?=\S)/,
    /\bdefaults?\s+to\s+(?=\S)/,
    /\(\s*(?:`[^`]*`,\s*)?default:?\s+(?=\S)/i,
  ];
  for (const re of markers) {
    const m = re.exec(t);
    if (!m) continue;
    const clause = after(m.index + m[0].length);
    if (clause) return clause;
  }
  return undefined;
}

// ---- END delegated, fallback and constant defaults ----

function compilerOptions(themeRoot) {
  return {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.ReactJSX,
    strict: true,
    skipLibCheck: true,
    noEmit: true,
    lib: ["lib.es2022.d.ts", "lib.dom.d.ts", "lib.dom.iterable.d.ts"],
    types: [],
    typeRoots: [join(themeRoot, "node_modules/@types")],
  };
}

/**
 * Where each name of a barrel lives: `{ Button: "components/button/button" }` (theme/src-relative, no extension), for the
 * package entry and for the `@sheenui/theme/demo-data` entry. The docs' Code panel uses it to rewrite imports to the
 * paths the shadcn CLI installs (`@/components/sheenui/<installRel>`).
 * @returns {{ barrel: Record<string, string>, demoData: Record<string, string> }}
 */
export function extractInstallPaths(themeRoot = join(REPO_ROOT, "theme")) {
  const srcDir = join(themeRoot, "src") + "/";
  const entries = [join(srcDir, "index.ts"), join(srcDir, "demo-data.ts")];
  const program = ts.createProgram(entries, compilerOptions(themeRoot));
  const checker = program.getTypeChecker();
  const result = [];
  for (const entry of entries) {
    const map = {};
    const moduleSymbol = checker.getSymbolAtLocation(program.getSourceFile(entry));
    for (const exported of checker.getExportsOfModule(moduleSymbol)) {
      let symbol = exported;
      if (symbol.flags & ts.SymbolFlags.Alias) symbol = checker.getAliasedSymbol(symbol);
      const file = symbol.declarations?.[0]?.getSourceFile().fileName;
      if (!file || !file.startsWith(srcDir)) continue;
      map[exported.getName()] = file.slice(srcDir.length).replace(/\.tsx?$/, "");
    }
    result.push(Object.fromEntries(Object.entries(map).sort(([a], [b]) => a.localeCompare(b))));
  }
  return { barrel: result[0], demoData: result[1] };
}

/**
 * The value exports (components, hooks, helpers; no types) of the package entry, grouped by the theme/src file that
 * declares them: `{ "components/input/input": ["Input"] }`. A docs page uses it to find which registry item a sample's
 * `import { Input } from "@sheenui/theme"` needs, so "Files to copy" also lists what the examples use.
 * @returns {Record<string, string[]>}
 */
export function extractExportFiles(themeRoot = join(REPO_ROOT, "theme")) {
  const srcDir = join(themeRoot, "src") + "/";
  const entry = join(srcDir, "index.ts");
  const program = ts.createProgram([entry], compilerOptions(themeRoot));
  const checker = program.getTypeChecker();
  const byFile = {};
  for (const exported of checker.getExportsOfModule(checker.getSymbolAtLocation(program.getSourceFile(entry)))) {
    let symbol = exported;
    if (symbol.flags & ts.SymbolFlags.Alias) symbol = checker.getAliasedSymbol(symbol);
    if (!(symbol.flags & ts.SymbolFlags.Value)) continue;
    const file = symbol.declarations?.[0]?.getSourceFile().fileName;
    if (!file || !file.startsWith(srcDir)) continue;
    (byFile[file.slice(srcDir.length).replace(/\.tsx?$/, "")] ??= []).push(exported.getName());
  }
  return Object.fromEntries(
    Object.entries(byFile)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([f, names]) => [f, names.sort()]),
  );
}

/** Drops a sentence that repeats an earlier one of the same text (ignoring case and a trailing period). */
function dedupeSentences(text) {
  const seen = new Set();
  return text
    .split(/(?<=[.!?])[^\S\n]+/) // spaces only: a "\n- item" bullet break (see flattenDoc) stays
    .filter((sentence) => {
      const key = sentence
        .toLowerCase()
        .replace(/[.!?]+$/, "")
        .trim();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .join(" ");
}

/**
 * The description for the table: the prop's JSDoc, minus a closing sentence that only repeats the Default column
 * ("Default 300." / "Defaults to true."). Only a whole last sentence that STARTS with a capital "Default" is dropped, never
 * text that merely mentions the word ("(`ReactNode`, default `x`)", "the default tone").
 * @param {string} text @param {string | undefined} defaultValue
 */
export function cleanDescription(text, defaultValue) {
  if (defaultValue === undefined) return text;
  // A middle sentence that only restates the cell ("Default 0." between two other sentences) goes too.
  const bare = (v) => v.replace(/[`"'\s.]/g, "").toLowerCase();
  text = text
    .split(/(?<=[.!?])\s+/)
    .filter((sentence, i, all) => {
      const m = /^Defaults?\s*(?:to\s+|is\s+|:\s*)?(.+?)\.?$/.exec(sentence);
      return !(m && i < all.length - 1 && bare(m[1]) === bare(defaultValue));
    })
    .join(" ");
  const at = text.search(/(?:^|(?<=[.!?])\s+)Defaults?\b/);
  if (at < 0) return text;
  const tail = text.slice(at).trim();
  // Only when that sentence is the last one (no further sentence follows it).
  if (/[.!?]\s+[A-Z]/.test(tail.replace(/\d\.\d/g, "0"))) return text;
  return text.slice(0, at).trim();
}

/**
 * Removes the sentence that states the default in words ("Default: formatCompact in `locale`.", "Defaults to the browser's
 * locale.") from a description whose Default cell was filled from that very clause, so the page does not show it twice.
 * @param {string} text
 */
export function stripProseDefault(text) {
  const re = /(?:^|(?<=[.!?])\s+)Defaults?(?:\s+to\b|:)?\s+(?:`[^`]*`|"[^"]*"|[^.`"]|\.(?=\S))*\.?/;
  const m = re.exec(text);
  if (!m) return text;
  const out = (text.slice(0, m.index) + " " + text.slice(m.index + m[0].length)).replace(/\s+/g, " ").trim();
  return out || text;
}

/**
 * One line of prose, except that a markdown bullet list ("- item" lines, as in Base UI's `modal` JSDoc) keeps one "\n- item"
 * per bullet, so the docs' RichText can render a real list instead of a run-on paragraph.
 */
export function flattenDoc(text) {
  const lines = text.split(/\r?\n/).map((l) => l.trim());
  let out = "";
  for (const l of lines) {
    if (!l) continue;
    const item = /^[-*]\s+(.*)$/.exec(l);
    if (item) out += `\n- ${item[1].replace(/\s+/g, " ")}`;
    else out += `${out ? " " : ""}${l.replace(/\s+/g, " ")}`;
  }
  return out.trim();
}

/**
 * The literal `Default x` a description states ("Default 300.", "Defaults to true", "(`T`, default `"x"`)"), or undefined
 * when it states none or something that is not a plain literal (a number, true/false or a quoted string).
 */
export function statedDefault(text) {
  const m =
    /(?:^|[.!?]\s+)Defaults?\s*(?:to\s+|is\s+|:\s*)?(?:`([^`]+)`|("[^"]*")|(-?\d+(?:\.\d+)?|true|false))(?=[\s.,;:)]|$)/.exec(
      text,
    ) ?? /\((?:`[^`]*`,\s*)?default\s+`([^`]+)`\)/i.exec(text);
  const value = m && (m[1] ?? m[2] ?? m[3]);
  return value !== undefined && /^(?:-?\d+(?:\.\d+)?|true|false|"[^"]*")$/.test(value) ? value : undefined;
}

/** Words a clause cannot end on: cutting there leaves the sentence hanging ("... in the tone's"). */
const DANGLING =
  /\b(?:a|an|the|and|or|but|of|in|on|at|to|for|with|without|by|from|as|that|which|so|than|its|their|is|are|its|it's|tone's)$/i;

/**
 * A doc sentence of at most about 150 characters, cut at a clause boundary (", ", "; ", ": ", " - ") and closed with a full stop;
 * never mid-clause and never with "...". A sentence with no usable boundary is kept whole (the summaries are plain text).
 * @param {string} sentence one sentence on one line
 */
export function shortenSentence(sentence) {
  const text = sentence.trim();
  if (text.length <= 150) return text;
  const body = text.replace(/[.!?]$/, "");
  const cuts = [...body.matchAll(/[,;:]\s|\s[\u2013\u2014-]\s/g)]
    .map((m) => m.index)
    // 40+ characters kept, 150 at most, parentheses and quotes balanced, no hanging connective at the end.
    .filter((at) => {
      const head = body.slice(0, at).trimEnd();
      const balanced = (head.match(/\(/g) ?? []).length === (head.match(/\)/g) ?? []).length;
      return at >= 40 && at <= 150 && balanced && !DANGLING.test(head) && (head.match(/"/g) ?? []).length % 2 === 0;
    });
  const at = cuts.at(-1);
  return at === undefined ? text : `${body.slice(0, at).trimEnd()}.`;
}

/** The first sentence of a doc comment, on one line, at most 150 characters where a clause boundary allows it. */
function firstSentence(text) {
  const one = text.replace(/\s+/g, " ").trim();
  const m = /^(.*?[.!?])(?:\s|$)/.exec(one);
  return shortenSentence((m ? m[1] : one).trim());
}

/**
 * Which public components and hooks each docs page covers, from their JSDoc `@see /route`: `{ "/forms/segmented-control":
 * ["SegmentedControl", "SegmentedControlItem"] }`. The docs show them as chips under the page title and the site
 * search matches them, so a developer can find a page by the symbol they import.
 * @returns {Record<string, string[]>}
 */
export function extractRouteExports(themeRoot = join(REPO_ROOT, "theme"), withSummaries = false) {
  const entry = join(themeRoot, "src/index.ts");
  const program = ts.createProgram([entry], compilerOptions(themeRoot));
  const checker = program.getTypeChecker();
  const srcDir = join(themeRoot, "src") + "/";
  const out = {};
  const everyName = new Set();
  const summaries = new Map();
  const routeOf = new Map(); // name -> route (from @see)
  const unmapped = [];
  const fileOf = new Map();
  for (const exported of checker.getExportsOfModule(checker.getSymbolAtLocation(program.getSourceFile(entry)))) {
    const name = exported.getName();
    let symbol = exported;
    if (symbol.flags & ts.SymbolFlags.Alias) symbol = checker.getAliasedSymbol(symbol);
    if (!(symbol.flags & ts.SymbolFlags.Value)) continue; // runtime exports only (types are not searchable names)
    const decl = symbol.declarations?.[0];
    if (!decl || !decl.getSourceFile().fileName.startsWith(srcDir)) continue;
    everyName.add(name);
    fileOf.set(name, decl.getSourceFile().fileName);
    summaries.set(name, firstSentence(ts.displayPartsToString(symbol.getDocumentationComment(checker))));
    const see = tagText(symbol, "see");
    if (see && see.startsWith("/")) {
      const route = see.split(/[#\s]/)[0];
      (out[route] ??= []).push(name);
      routeOf.set(name, route);
    } else unmapped.push(name);
  }
  // A page whose slug names an export ("/charts/line-chart" -> LineChart) lists it even when that export's @see points at a gallery.
  const routesSource = readSplitSource(join(REPO_ROOT, "demo/src/routes.ts"));
  for (const [, path] of routesSource.matchAll(/path: "([^"]+)"/g)) {
    const main = path
      .split("/")
      .pop()
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join("");
    if (everyName.has(main) && !(out[path] ?? []).includes(main)) (out[path] ??= []).push(main);
  }
  // Exports without an @see (label objects, constants, small helpers) go to the page of the component they belong to
  // (`defaultTooltipLabels` -> Tooltip's page), else to /foundations, the page of the shared helpers and tokens.
  for (const name of unmapped) {
    const stem = name.replace(/^default/, "").replace(/Labels?$/, "");
    const owner = [...routeOf.keys()]
      .filter(
        (c) =>
          /^[A-Z]/.test(c) &&
          (stem === c || stem.startsWith(c) || c.startsWith(stem) || (c.length >= 8 && stem.includes(c))) &&
          stem.length >= 4,
      )
      .sort((x, y) => y.length - x.length)[0];
    // else the page most of the exports of the same source file belong to (seriesLegend sits with the chart parts), else /foundations
    const sameFile = [...routeOf].filter(([other]) => fileOf.get(other) === fileOf.get(name)).map(([, route]) => route);
    const byFile = [...new Set(sameFile)].sort(
      (x, y) => sameFile.filter((r) => r === y).length - sameFile.filter((r) => r === x).length,
    )[0];
    (out[routeOf.get(owner) ?? byFile ?? "/foundations"] ??= []).push(name);
  }
  for (const names of Object.values(out)) names.sort();
  const sorted = Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));
  return withSummaries ? { routes: sorted, summaries: Object.fromEntries(summaries) } : sorted;
}

/** How many runtime (value) exports the package barrel has: what the docs search must cover. */
export function runtimeExportCount(themeRoot = join(REPO_ROOT, "theme")) {
  const entry = join(themeRoot, "src/index.ts");
  const program = ts.createProgram([entry], compilerOptions(themeRoot));
  const checker = program.getTypeChecker();
  return checker.getExportsOfModule(checker.getSymbolAtLocation(program.getSourceFile(entry))).filter((e) => {
    const target = e.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(e) : e;
    return (target.flags & ts.SymbolFlags.Value) !== 0;
  }).length;
}

/** @returns {Record<string, {file: string, route?: string, props: Array<{name:string,type:string,required:boolean,default?:string,description:string}>}>} */
export function extractProps(themeRoot = join(REPO_ROOT, "theme")) {
  const entry = join(themeRoot, "src/index.ts");
  const options = compilerOptions(themeRoot);
  const program = ts.createProgram([entry], options);
  const checker = program.getTypeChecker();
  const sourceFile = program.getSourceFile(entry);
  const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
  const srcDir = join(themeRoot, "src") + "/";
  const out = {};
  const barrelNames = new Set(checker.getExportsOfModule(moduleSymbol).map((e) => e.getName()));
  /** key -> English default of an exported `defaultXLabels` constant, read from its object literal (spreads and references resolved). */
  const labelTables = new Map();
  const labelTable = (constName) => {
    if (labelTables.has(constName)) return labelTables.get(constName);
    let result;
    let sym = checker.getExportsOfModule(moduleSymbol).find((e) => e.getName() === constName);
    if (sym && sym.flags & ts.SymbolFlags.Alias) sym = checker.getAliasedSymbol(sym);
    const vd = sym?.valueDeclaration;
    if (vd && ts.isVariableDeclaration(vd)) {
      const one = (text) => text.replace(/\s+/g, " ").trim();
      /** The initializer node of each key of an object literal, following `...spread` of other constants. */
      const collect = (obj, into, depth = 0) => {
        for (const m of obj.properties) {
          if (ts.isSpreadAssignment(m) && depth < 4) {
            let target = checker.getSymbolAtLocation(m.expression);
            if (target && target.flags & ts.SymbolFlags.Alias) target = checker.getAliasedSymbol(target);
            const inner =
              target?.valueDeclaration && ts.isVariableDeclaration(target.valueDeclaration)
                ? stripWrappers(target.valueDeclaration.initializer)
                : undefined;
            if (inner && ts.isObjectLiteralExpression(inner)) collect(inner, into, depth + 1);
          } else if (m.name) into.set(m.name.getText().replace(/^["']|["']$/g, ""), m);
        }
        return into;
      };
      const literal = vd.initializer && stripWrappers(vd.initializer);
      const nodes = literal && ts.isObjectLiteralExpression(literal) ? collect(literal, new Map()) : new Map();
      const valueOf = (d, depth = 0) => {
        if (!d) return "";
        let init = ts.isPropertyAssignment(d) || ts.isVariableDeclaration(d) ? stripWrappers(d.initializer) : undefined;
        if (!init) return one(d.getText());
        if (ts.isStringLiteralLike(init)) return init.text;
        if ((ts.isPropertyAccessExpression(init) || ts.isIdentifier(init)) && depth < 4) {
          let target = checker.getSymbolAtLocation(init);
          if (target && target.flags & ts.SymbolFlags.Alias) target = checker.getAliasedSymbol(target);
          if (target?.valueDeclaration) return valueOf(target.valueDeclaration, depth + 1);
        }
        const text = one(init.getText());
        return text.length > 110 ? `${text.slice(0, 107)}...` : text;
      };
      const keys = checker
        .getTypeOfSymbolAtLocation(sym, vd)
        .getProperties()
        .map((prop) => {
          const value = valueOf(nodes.get(prop.getName()) ?? prop.valueDeclaration);
          if (value !== "{}") return [prop.getName(), value];
          // An empty nested group (DataTable's `pagination: {}`): say what it takes instead of showing a bare "{}".
          const typeName = checker
            .typeToString(checker.getTypeOfSymbolAtLocation(prop, vd))
            .replace(/^Partial<(.*)>$/, "$1");
          return [
            prop.getName(),
            `nested object: takes the keys of ${typeName}; empty here, so its own English defaults apply`,
          ];
        });
      if (keys.length) result = { name: constName, keys };
    }
    labelTables.set(constName, result);
    return result;
  };
  /**
   * The exported default constant of a labels type, by an explicit rule and never by "nearest name": the `@defaultLabels <name>`
   * JSDoc tag on the type, else `default<Type>` (`DatePickerLabels` -> `defaultDatePickerLabels`).
   */
  const defaultLabelsConstant = (typeName) => {
    let sym = checker.getExportsOfModule(moduleSymbol).find((e) => e.getName() === typeName);
    if (sym && sym.flags & ts.SymbolFlags.Alias) sym = checker.getAliasedSymbol(sym);
    return (sym && tagText(sym, "defaultLabels")) || `default${typeName}`;
  };
  for (const exported of checker.getExportsOfModule(moduleSymbol)) {
    const name = exported.getName();
    if (!/^[A-Z]/.test(name)) continue;
    let symbol = exported;
    if (symbol.flags & ts.SymbolFlags.Alias) symbol = checker.getAliasedSymbol(symbol);
    if (!(symbol.flags & (ts.SymbolFlags.Function | ts.SymbolFlags.Variable))) continue;
    const decl = symbol.declarations?.[0];
    if (!decl || !decl.getSourceFile().fileName.startsWith(srcDir)) continue;
    const signature = checker.getTypeOfSymbolAtLocation(symbol, decl).getCallSignatures()[0];
    const param = signature?.getParameters()[0];
    if (!param) continue;
    const propsType = checker.getTypeOfSymbolAtLocation(param, decl);
    const defaults = functionNode(decl) ? destructuredDefaults(functionNode(decl)) : new Map();
    // R6-N5: defaults the public component gets from the component it delegates to, and `x ?? "md"` body fallbacks.
    const delegated = functionNode(decl) ? delegatedDefaults(functionNode(decl), checker) : new Map();
    const fallbacks = functionNode(decl)
      ? new Map([...helperDefaults(functionNode(decl), checker), ...nullishFallbacks(functionNode(decl))])
      : new Map();
    /** A default as the table shows it: a literal as written; an identifier the barrel does not export as the value it stands for. */
    const defaultText = (entry) => {
      if (!entry) return undefined;
      if (
        !/^[A-Za-z_$][\w$]*$/.test(entry.text) ||
        ["true", "false", "null", "undefined"].includes(entry.text) ||
        barrelNames.has(entry.text)
      )
        return entry.text;
      // A same-file or imported constant: its literal value when the initializer is a simple literal; otherwise the identifier
      // itself, with a short note from its own JSDoc when it has one (never an invented phrase).
      let symbol = checker.getSymbolAtLocation(entry.node);
      if (symbol && symbol.flags & ts.SymbolFlags.Alias) symbol = checker.getAliasedSymbol(symbol);
      const vd = symbol?.valueDeclaration;
      const init = vd && ts.isVariableDeclaration(vd) ? vd.initializer : undefined;
      const value = init ? literalText(init) : undefined;
      if (value !== undefined) return value;
      const note = shortNote(symbol, checker);
      return note ? `${entry.text} (${note})` : entry.text;
    };
    const props = [];
    const componentFile = decl.getSourceFile().fileName;
    const own = (d) => d.getSourceFile().fileName.startsWith(srcDir);
    /** The JSDoc text of ONE declaration (a symbol's merged comment would join a shared type's and an override's). */
    const docOf = (d) => flattenDoc((d.jsDoc ?? []).map((j) => ts.getTextOfJSDocComment(j.comment) ?? "").join(" "));
    const tagOf = (d, tagName) => {
      const tag = ts.getJSDocTags(d).find((t) => t.tagName.text === tagName);
      return tag ? (ts.getTextOfJSDocComment(tag.comment) ?? "").trim() : undefined;
    };
    /** A member of a union branch (`{ multiple?: false; value?: string } | { multiple: true; value?: string[] }`). */
    const unionBranch = (d) =>
      ts.isTypeLiteralNode(d.parent) &&
      (ts.isUnionTypeNode(d.parent.parent) ||
        (ts.isParenthesizedTypeNode(d.parent.parent) && ts.isUnionTypeNode(d.parent.parent.parent)) ||
        ts.isUnionTypeNode(d.parent.parent.parent ?? d.parent.parent));
    /** "multiple = true": the literal-typed member that tells the branches apart. */
    const branchLabel = (d) => {
      for (const member of d.parent.members) {
        if (!ts.isPropertySignature(member) || !member.type || member === d) continue;
        if (ts.isLiteralTypeNode(member.type)) return `${member.name.getText()} = ${member.type.literal.getText()}`;
      }
      return "";
    };
    for (const prop of propsType.getProperties()) {
      const pname = prop.getName();
      if (IGNORED.has(pname)) continue;
      const ownDecls = (prop.declarations ?? []).filter(own); // own props: any declaration in theme/src, not React/DOM ones...
      // ...unless the component sets its own default for an inherited prop (Base UI's `delay`, `modal`): then SheenUI's default is documented.
      const decls = ownDecls.length ? ownDecls : defaults.has(pname) ? (prop.declarations ?? []) : [];
      if (
        !ownDecls.length &&
        decls.length &&
        !docOf(decls[0]) &&
        !ts.displayPartsToString(prop.getDocumentationComment(checker)).trim()
      )
        continue; // an inherited prop nobody documents: nothing to show
      if (!decls.length) continue;
      const optional = (prop.flags & ts.SymbolFlags.Optional) !== 0;
      // Branches of a discriminated union: two or more declarations of the prop in one file, each in a type literal that has a
      // literal-typed member (the discriminant) or is one itself. A shared type plus a component override are in different files.
      const labelOf = (d) =>
        ts.isTypeLiteralNode(d.parent)
          ? branchLabel(d) || (d.type && ts.isLiteralTypeNode(d.type) ? `= ${d.type.getText()}` : "")
          : "";
      const sameFile = new Map();
      for (const d of decls)
        sameFile.set(d.getSourceFile().fileName, [...(sameFile.get(d.getSourceFile().fileName) ?? []), d]);
      const group = [...sameFile.values()].find((g) => g.length >= 2 && g.every((d) => labelOf(d)));
      const branches = group ?? decls.filter(unionBranch);
      if (branches.length >= 2) {
        // A prop whose shape depends on a discriminant: one row per branch, each with its own type and description.
        for (const d of branches) {
          if (d.type && d.type.getText() === "never") continue; // the prop is not allowed in this branch
          const description = docOf(d);
          if (!description && COMMON.has(pname)) continue;
          const label = labelOf(d);
          props.push({
            name: label ? `${pname} (${label})` : pname,
            type: d.type
              ? checker.getTypeFromTypeNode(d.type) &&
                checker.typeToString(
                  checker.getTypeFromTypeNode(d.type),
                  d,
                  ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope,
                )
              : "unknown",
            required: !d.questionToken,
            default: tagOf(d, "default"),
            description,
          });
        }
        continue;
      }
      // Shared type plus a component override: the component's own declaration (else the last one) documents the prop.
      const pd = decls.find((d) => d.getSourceFile().fileName === componentFile) ?? decls[decls.length - 1];
      const description = docOf(pd) || flattenDoc(ts.displayPartsToString(prop.getDocumentationComment(checker)));
      if (COMMON.has(pname) && !description) continue;
      let type = checker.typeToString(
        checker.getTypeOfSymbolAtLocation(prop, pd),
        pd,
        ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope,
      );
      if (optional) type = type.replace(/ \| undefined$/, "");
      props.push({
        name: pname,
        type,
        required: !optional,
        // The component's own destructuring default wins over an `@default` inherited from a shared prop type.
        default:
          defaultText(defaults.get(pname) ?? delegated.get(pname)) ??
          tagOf(pd, "default") ??
          tagText(prop, "default") ??
          fallbacks.get(pname),
        description: dedupeSentences(description).replace(/([A-Za-z0-9])$/, "$1."),
      });
    }
    // R7: a `labels?: Partial<XLabels>` prop whose component package exports `defaultXLabels`: the Default cell names that
    // constant and the row carries its key -> English default table (the page renders it under the props table).
    for (const p of props) {
      const parsed = parseLabelsType(p.type);
      if (!parsed) continue;
      const table = labelTable(defaultLabelsConstant(parsed.type));
      if (!table) {
        throw new Error(
          `${name}.${p.name}: labels type ${parsed.type} has no default constant. Export default${parsed.type} or tag the type with \`@defaultLabels <constantName>\`.`,
        );
      }
      const keys = parsed.only ? table.keys.filter(([k]) => parsed.only.has(k)) : table.keys;
      p.default = table.name;
      p.labels = { type: parsed.type, const: table.name, keys, ...(parsed.partial ? {} : { full: true }) };
    }
    // A default the code cannot express as one literal but the docs state (a computed rule, "the browser's locale"): the cell
    // shows the stated clause (or the reviewed reason of DEFAULT_APPLIED_ELSEWHERE) instead of "None". Longer prose than
    // MAX_PROSE_DEFAULT needs an `@default` tag at the source; docs:check fails on a "None" cell that states a default.
    for (const p of props) {
      if (p.default) continue;
      const applied = DEFAULT_APPLIED_ELSEWHERE.get(`${name}.${p.name}`);
      if (applied) {
        p.default = applied;
        p.defaultSource = "applied";
        continue;
      }
      const clause = statedDefaultClause(p.description);
      if (clause && clause.length <= MAX_PROSE_DEFAULT) {
        p.default = clause;
        p.defaultSource = "prose";
      }
    }
    if (!props.length) continue;
    const see = tagText(symbol, "see");
    const route = see && see.startsWith("/") ? see.split(/[#\s]/)[0] : undefined;
    out[name] = { file: decl.getSourceFile().fileName.slice(srcDir.length), route, props };
  }
  return out;
}
