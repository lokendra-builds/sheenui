/**
 * A small, dependency-free syntax tokenizer for CodeBlock.
 *
 * Languages: ts, tsx, js, jsx, json, css, bash, python, html (+ "text": no highlighting).
 * Aliases: typescript, javascript, mjs, cjs, jsonc, sh, shell, zsh, console, py, xml, svg,
 * txt, plaintext.
 *
 * It is a scanner, not a parser: one pass, sticky regexes, plus just enough state to get
 * the hard parts right in real snippets: JSX (tags, attributes, text children, `{…}`
 * expressions, nested to any depth), template literals with `${…}`, regex literals vs
 * division, CSS selectors vs declarations, bash command position, Python triple-quoted and
 * prefixed strings. Tokens can span lines (block comments, template strings); splitLines()
 * cuts them at newlines so every line renders on its own.
 *
 * No hooks, no DOM: safe anywhere (server, worker, tests).
 */

export type TokenKind =
  | "plain"
  | "comment"
  | "keyword"
  | "string"
  | "number"
  | "literal"
  | "function"
  | "type"
  | "tag"
  | "attr"
  | "property"
  | "variable"
  | "punctuation";

/** One highlighted piece of source text: its token `kind` and the exact `text`. */
export type Token = { kind: TokenKind; text: string };

/** Languages the built-in tokenizer highlights; any other name falls back to plain `text`. */
export type CodeLanguage = "ts" | "tsx" | "js" | "jsx" | "json" | "css" | "bash" | "python" | "html" | "text";

const ALIASES: Record<string, CodeLanguage> = {
  ts: "ts",
  typescript: "ts",
  mts: "ts",
  cts: "ts",
  tsx: "tsx",
  js: "js",
  javascript: "js",
  mjs: "js",
  cjs: "js",
  jsx: "jsx",
  json: "json",
  jsonc: "json",
  json5: "json",
  css: "css",
  bash: "bash",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  console: "bash",
  terminal: "bash",
  python: "python",
  py: "python",
  html: "html",
  xml: "html",
  svg: "html",
  text: "text",
  txt: "text",
  plaintext: "text",
  plain: "text",
};

/** Normalise a language name or alias ("typescript", "sh", "py"…). Unknown names become "text". */
export function resolveLanguage(language: string | undefined): CodeLanguage {
  return ALIASES[(language ?? "text").toLowerCase()] ?? "text";
}

/** Tokenize `code` for `language` (any alias). */
export function tokenize(code: string, language = "text"): Token[] {
  const lang = resolveLanguage(language);
  const out = new TokenList();
  switch (lang) {
    case "ts":
    case "tsx":
    case "js":
    case "jsx":
    case "html":
      scanScript(code, lang, out);
      break;
    case "json":
      scanJson(code, out);
      break;
    case "css":
      scanCss(code, out);
      break;
    case "bash":
      scanBash(code, out);
      break;
    case "python":
      scanPython(code, out);
      break;
    default:
      out.push("plain", code);
  }
  return out.tokens;
}

/** Split tokens into lines (tokens that contain newlines are cut). Always returns at least one line. */
export function splitLines(tokens: Token[]): Token[][] {
  const lines: Token[][] = [[]];
  for (const token of tokens) {
    const parts = token.text.split("\n");
    parts.forEach((part, i) => {
      if (i > 0) lines.push([]);
      const current = lines[lines.length - 1];
      if (part && current) current.push({ kind: token.kind, text: part });
    });
  }
  return lines;
}

/* ====================================================================== */

/** Collects tokens, merging neighbours of the same kind, and remembers the last significant one. */
class TokenList {
  tokens: Token[] = [];
  /** Last token that wasn't whitespace (drives regex / JSX / command-position decisions). */
  last: Token | null = null;

  push(kind: TokenKind, text: string) {
    if (!text) return;
    const prev = this.tokens[this.tokens.length - 1];
    if (prev?.kind === kind && kind !== "punctuation") prev.text += text;
    else this.tokens.push({ kind, text });
    if (/\S/.test(text)) this.last = { kind, text };
  }
}

/** Match `re` (must be sticky) at `pos`. */
function at(re: RegExp, src: string, pos: number): string | null {
  re.lastIndex = pos;
  const m = re.exec(src);
  return m ? m[0] : null;
}

const set = (words: string) => new Set(words.split(" "));

/* ---------- JavaScript / TypeScript / JSX / HTML ---------- */

const JS_KEYWORDS = set(
  "as async await break case catch class const continue debugger default delete do else enum export extends finally for from function get if implements import in instanceof interface let new of package private protected public readonly return satisfies set static switch throw try type typeof var void while with yield keyof declare namespace module abstract override infer is asserts accessor using",
);
const JS_LITERALS = set("true false null undefined NaN Infinity this super");
const TS_TYPES = set("string number boolean any unknown never void object symbol bigint");
/** After these keywords the next identifier names a type. */
const TYPE_INTRO = set("class extends implements interface type new enum namespace");

const RE = {
  space: /\s+/y,
  lineComment: /\/\/[^\n]*/y,
  blockComment: /\/\*[\s\S]*?(?:\*\/|$)/y,
  htmlComment: /<!--[\s\S]*?(?:-->|$)/y,
  doctype: /<![^>]*>?/y,
  string: /"(?:[^"\\\n]|\\.)*"?|'(?:[^'\\\n]|\\.)*'?/y,
  number: /(?:0[xX][\da-fA-F_]+|0[bB][01_]+|0[oO][0-7_]+|(?:\d[\d_]*)?\.?\d[\d_]*(?:[eE][+-]?\d+)?)n?/y,
  ident: /[A-Za-z_$][\w$]*/y,
  regex: /\/(?![*/])(?:\\.|\[(?:\\.|[^\]\\\n])*\]|[^/\\\n[])+\/[dgimsuyv]*/y,
  operator: /=>|\.\.\.|\?\?=?|\?\.|\*\*=?|&&=?|\|\|=?|[=!]==?|[<>]=?|<<=?|>>>?=?|[-+*/%&|^~!?:=<>]=?/y,
  punct: /[{}()[\];,.@#]/y,
  templateText: /(?:[^`\\$]|\\[\s\S]|\$(?!\{))+/y,
  tagName: /[A-Za-z][\w.:-]*/y,
  attrName: /[A-Za-z_:@][\w:.-]*/y,
  attrString: /"[^"]*"?|'[^']*'?/y,
  attrBare: /[^\s"'=<>`/]+/y,
  jsxText: /[^<{]+/y,
  htmlText: /[^<]+/y,
  /** A call follows: `(`, `?.(`, or generic arguments then `(`. */
  call: /\s*(?:\?\.)?(?:\(|<[\w\s,[\]|.]*>\s*\()/y,
  /** An object key or a parameter name: `name:` / `name?:` (not `::`). */
  key: /\s*\??:(?!:)/y,
  /** Type parameters that can't be JSX: `<T,>` or `<T extends …>` (generic arrows in .tsx). */
  typeParams: /<\s*[A-Za-z_$][\w$]*\s*(?:,|extends\s)/y,
};

/**
 * End of a type parameter list that opens at `start` (src[start] === "<"): the index of its
 * closing ">", skipping nested <>, (), [], {}, strings and "=>". -1 when there is none nearby.
 */
function typeParamsEnd(src: string, start: number) {
  let depth = 0;
  const limit = Math.min(src.length, start + 400);
  for (let i = start + 1; i < limit; i++) {
    const c = src.charAt(i);
    if (c === '"' || c === "'" || c === "`") {
      const close = src.indexOf(c, i + 1);
      if (close === -1) return -1;
      i = close;
    } else if (c === "=" && src[i + 1] === ">") i++;
    else if (c === "<" || c === "(" || c === "[" || c === "{") depth++;
    else if (c === ")" || c === "]" || c === "}") depth--;
    else if (c === ">") {
      if (depth === 0) return i;
      depth--;
    } else if (c === ";") return -1;
  }
  return -1;
}

type Frame =
  { mode: "code"; depth: number } | { mode: "template" } | { mode: "tag"; closing: boolean } | { mode: "children" };

/** Whether `<` here starts a JSX tag, judged by what came before (not a comparison or a generic). */
function tagCanStart(last: Token | null) {
  if (!last) return true;
  if (last.kind === "keyword") return /^(return|default|yield|await|case|in|of|else|do)$/.test(last.text);
  if (last.kind === "punctuation" || last.kind === "plain") return /[({[,;:?!&|=>}]$/.test(last.text);
  return false;
}

/** Whether `/` here starts a regex literal rather than a division. */
function regexCanStart(last: Token | null) {
  if (!last) return true;
  if (last.kind === "keyword") return !/^(this|super)$/.test(last.text);
  if (last.kind === "punctuation" || last.kind === "plain") return /[({[,;:?!&|=+\-*%^~<>}]$/.test(last.text);
  return false;
}

function scanScript(src: string, lang: CodeLanguage, out: TokenList) {
  const jsx = lang === "tsx" || lang === "jsx";
  const html = lang === "html";
  const ts = lang === "ts" || lang === "tsx";
  const stack: Frame[] = [html ? { mode: "children" } : { mode: "code", depth: 0 }];
  let pos = 0;
  let m: string | null;

  /** Open a tag at `pos` (src[pos] === "<"): `<`, `</`, `<>` or `</>`. */
  const openTag = () => {
    if (src.startsWith("</>", pos)) {
      out.push("punctuation", "</>");
      pos += 3;
      if (stack[stack.length - 1]?.mode === "children" && stack.length > 1) stack.pop();
      return;
    }
    if (src.startsWith("<>", pos)) {
      out.push("punctuation", "<>");
      pos += 2;
      stack.push({ mode: "children" });
      return;
    }
    const closing = src[pos + 1] === "/";
    out.push("punctuation", closing ? "</" : "<");
    pos += closing ? 2 : 1;
    const name = at(RE.tagName, src, pos);
    if (name) {
      // Components (Capitalised, or member expressions like motion.div) read as types.
      out.push(/^[A-Z]/.test(name) || (!html && name.includes(".")) ? "type" : "tag", name);
      pos += name.length;
    }
    stack.push({ mode: "tag", closing });
  };

  while (pos < src.length) {
    const frame = stack[stack.length - 1];
    if (!frame) break;
    const ch = src.charAt(pos);

    if (frame.mode === "template") {
      if (ch === "`") {
        out.push("string", "`");
        pos++;
        stack.pop();
      } else if (src.startsWith("${", pos)) {
        out.push("punctuation", "${");
        pos += 2;
        stack.push({ mode: "code", depth: 0 });
      } else if ((m = at(RE.templateText, src, pos))) {
        out.push("string", m);
        pos += m.length;
      } else {
        out.push("string", ch);
        pos++;
      }
      continue;
    }

    if (frame.mode === "tag") {
      if ((m = at(RE.space, src, pos))) {
        out.push("plain", m);
        pos += m.length;
      } else if (src.startsWith("/>", pos)) {
        out.push("punctuation", "/>");
        pos += 2;
        stack.pop();
      } else if (ch === ">") {
        out.push("punctuation", ">");
        pos++;
        stack.pop();
        if (html) continue; // HTML is flat: children are just the document.
        if (frame.closing) {
          if (stack[stack.length - 1]?.mode === "children" && stack.length > 1) stack.pop();
        } else stack.push({ mode: "children" });
      } else if (ch === "{" && !html) {
        out.push("punctuation", "{");
        pos++;
        stack.push({ mode: "code", depth: 0 });
      } else if (ch === "=") {
        out.push("punctuation", "=");
        pos++;
        if (html && (m = at(RE.attrBare, src, pos))) {
          out.push("string", m);
          pos += m.length;
        }
      } else if ((m = at(RE.attrString, src, pos))) {
        out.push("string", m);
        pos += m.length;
      } else if ((m = at(RE.attrName, src, pos))) {
        out.push("attr", m);
        pos += m.length;
      } else {
        out.push("plain", ch);
        pos++;
      }
      continue;
    }

    if (frame.mode === "children") {
      if (html && (m = at(RE.htmlComment, src, pos))) {
        out.push("comment", m);
        pos += m.length;
      } else if (html && src.startsWith("<!", pos) && (m = at(RE.doctype, src, pos))) {
        out.push("keyword", m);
        pos += m.length;
      } else if (ch === "<" && /[A-Za-z/>]/.test(src[pos + 1] ?? "")) {
        openTag();
      } else if (ch === "{" && !html) {
        out.push("punctuation", "{");
        pos++;
        stack.push({ mode: "code", depth: 0 });
      } else if ((m = at(html ? RE.htmlText : RE.jsxText, src, pos))) {
        out.push("plain", m);
        pos += m.length;
      } else {
        out.push("plain", ch);
        pos++;
      }
      continue;
    }

    // ----- code -----
    if ((m = at(RE.space, src, pos))) {
      out.push("plain", m);
      pos += m.length;
      continue;
    }
    if ((m = at(RE.lineComment, src, pos)) || (m = at(RE.blockComment, src, pos))) {
      out.push("comment", m);
      pos += m.length;
      continue;
    }
    if (ch === "`") {
      out.push("string", "`");
      pos++;
      stack.push({ mode: "template" });
      continue;
    }
    if ((ch === '"' || ch === "'") && (m = at(RE.string, src, pos))) {
      out.push("string", m);
      pos += m.length;
      continue;
    }
    if (ts && ch === "<" && at(RE.typeParams, src, pos) !== null) {
      // `<T,>(x: T) => x` / `<T extends object>(…)`: type parameters, not a JSX tag. Names
      // inside read as types, keywords (extends, keyof …) as keywords; then back to code.
      const end = typeParamsEnd(src, pos);
      if (end !== -1) {
        out.push("punctuation", "<");
        scanTypeList(src.slice(pos + 1, end), out);
        out.push("punctuation", ">");
        pos = end + 1;
        continue;
      }
    }
    if (jsx && ch === "<" && /[A-Za-z>]/.test(src[pos + 1] ?? "") && tagCanStart(out.last)) {
      openTag();
      continue;
    }
    if (ch === "/" && regexCanStart(out.last) && (m = at(RE.regex, src, pos))) {
      out.push("string", m);
      pos += m.length;
      continue;
    }
    if (/[\d.]/.test(ch) && (m = at(RE.number, src, pos)) && /\d/.test(m)) {
      out.push("number", m);
      pos += m.length;
      continue;
    }
    if ((m = at(RE.ident, src, pos))) {
      const prev = out.last;
      const afterDot = prev?.kind === "punctuation" && (prev.text === "." || prev.text === "?.");
      const next = at(RE.call, src, pos + m.length) !== null;
      // `{ type: "spring" }`, `(set?: boolean)`: a key, even when it is spelled like a keyword.
      const isKey =
        prev?.kind === "punctuation" && /^[{,(]$/.test(prev.text) && at(RE.key, src, pos + m.length) !== null;
      let kind: TokenKind = "plain";
      if (isKey) kind = "plain";
      else if (!afterDot && JS_KEYWORDS.has(m)) kind = "keyword";
      else if (!afterDot && JS_LITERALS.has(m)) kind = "literal";
      else if (prev?.kind === "keyword" && prev.text === "function") kind = "function";
      else if (prev?.kind === "keyword" && TYPE_INTRO.has(prev.text)) kind = "type";
      else if (next) kind = "function";
      else if (ts && !afterDot && TS_TYPES.has(m)) kind = "type";
      else if (/^[A-Z]/.test(m) && /[a-z]/.test(m)) kind = "type";
      out.push(kind, m);
      pos += m.length;
      continue;
    }
    if (ch === "{") {
      frame.depth++;
      out.push("punctuation", "{");
      pos++;
      continue;
    }
    if (ch === "}") {
      out.push("punctuation", "}");
      pos++;
      if (frame.depth > 0) frame.depth--;
      else if (stack.length > 1) stack.pop();
      continue;
    }
    if (src.startsWith("?.", pos) && !/\d/.test(src[pos + 2] ?? "")) {
      out.push("punctuation", "?.");
      pos += 2;
      continue;
    }
    if ((m = at(RE.punct, src, pos))) {
      out.push("punctuation", m);
      pos += m.length;
      continue;
    }
    if ((m = at(RE.operator, src, pos))) {
      out.push("punctuation", m);
      pos += m.length;
      continue;
    }
    out.push("plain", ch);
    pos++;
  }
}

/** The inside of a type parameter list: names are types, keywords stay keywords. */
function scanTypeList(src: string, out: TokenList) {
  let pos = 0;
  let m: string | null;
  while (pos < src.length) {
    const ch = src.charAt(pos);
    if ((m = at(RE.space, src, pos))) out.push("plain", m);
    else if ((ch === '"' || ch === "'") && (m = at(RE.string, src, pos))) out.push("string", m);
    else if (/\d/.test(ch) && (m = at(RE.number, src, pos))) out.push("number", m);
    else if ((m = at(RE.ident, src, pos)))
      out.push(JS_KEYWORDS.has(m) ? "keyword" : JS_LITERALS.has(m) ? "literal" : "type", m);
    else if ((m = at(RE.punct, src, pos)) || (m = at(RE.operator, src, pos))) out.push("punctuation", m);
    else {
      m = ch;
      out.push("plain", m);
    }
    pos += m.length;
  }
}

/* ---------- JSON (and JSONC) ---------- */

function scanJson(src: string, out: TokenList) {
  const re = {
    space: /\s+/y,
    comment: /\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$)/y,
    string: /"(?:[^"\\\n]|\\.)*"?/y,
    key: /\s*:/y,
    number: /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/y,
    word: /[A-Za-z_]\w*/y,
  };
  let pos = 0;
  let m: string | null;
  while (pos < src.length) {
    if ((m = at(re.space, src, pos))) out.push("plain", m);
    else if ((m = at(re.comment, src, pos))) out.push("comment", m);
    else if ((m = at(re.string, src, pos)))
      out.push(at(re.key, src, pos + m.length) !== null ? "property" : "string", m);
    else if ((m = at(re.number, src, pos))) out.push("number", m);
    else if ((m = at(re.word, src, pos))) out.push(/^(true|false|null)$/.test(m) ? "literal" : "plain", m);
    else {
      m = src.charAt(pos);
      out.push("punctuation", m);
    }
    pos += m.length;
  }
}

/* ---------- CSS ---------- */

function scanCss(src: string, out: TokenList) {
  const re = {
    space: /\s+/y,
    comment: /\/\*[\s\S]*?(?:\*\/|$)/y,
    string: /"(?:[^"\\\n]|\\.)*"?|'(?:[^'\\\n]|\\.)*'?/y,
    atRule: /@[\w-]+/y,
    custom: /--[\w-]+/y,
    important: /!\s*important/y,
    fn: /[-\w]+(?=\()/y,
    url: /url\((?!\s*["'])[^)\n]*/iy,
    number: /[-+]?(?:\d*\.\d+|\d+)(?:%|[a-zA-Z]+)?/y,
    hex: /#[\da-fA-F]{3,8}\b/y,
    ident: /-?[A-Za-z_][\w-]*/y,
    /** A declaration (not a nested selector): `name:` with no `{` before the next `;` or `}`. */
    property: /-?[A-Za-z_][\w-]*(?=\s*:(?![^;{}]*\{))/y,
    customProperty: /--[\w-]+(?=\s*:(?![^;{}]*\{))/y,
    selector: /[.#][-\w]+|::?[-\w]+|\[[^\]\n]*\]?|&|\*/y,
  };
  let pos = 0;
  let depth = 0;
  let inValue = false;
  /** Inside an at-rule prelude (`@media (…)`): words are plain, not selectors. */
  let inPrelude = false;
  /** Open parentheses in a value: a `;` inside `url(…)` or another function doesn't end it. */
  let parens = 0;
  let m: string | null;

  while (pos < src.length) {
    const ch = src.charAt(pos);
    if ((m = at(re.space, src, pos))) out.push("plain", m);
    else if ((m = at(re.comment, src, pos))) out.push("comment", m);
    else if ((m = at(re.string, src, pos)) && (ch === '"' || ch === "'")) out.push("string", m);
    else if ((m = at(re.atRule, src, pos))) {
      out.push("keyword", m);
      inPrelude = true;
    } else if (ch === "{" || ch === "}" || (ch === ";" && parens === 0)) {
      m = ch;
      out.push("punctuation", m);
      if (ch === "{") depth++;
      if (ch === "}") depth = Math.max(0, depth - 1);
      inValue = false;
      inPrelude = false;
      parens = 0;
    } else if (inValue || inPrelude) {
      // A value (or an at-rule prelude): functions, numbers, colours, custom properties.
      if ((m = at(re.important, src, pos))) out.push("keyword", m);
      else if ((m = at(re.custom, src, pos))) out.push("variable", m);
      else if ((m = at(re.url, src, pos))) {
        // url(unquoted…): everything up to ")" is the address (it may contain ";" or ":").
        const open = m.indexOf("(");
        out.push("function", m.slice(0, open));
        out.push("punctuation", "(");
        out.push("string", m.slice(open + 1));
        parens++;
      } else if ((m = at(re.fn, src, pos))) out.push("function", m);
      else if (ch === "(" || ch === ")") {
        m = ch;
        out.push("punctuation", m);
        parens = ch === "(" ? parens + 1 : Math.max(0, parens - 1);
      } else if ((m = at(re.hex, src, pos))) out.push("number", m);
      else if (/[\d.+-]/.test(ch) && (m = at(re.number, src, pos)) && /\d/.test(m)) out.push("number", m);
      else if ((m = at(re.ident, src, pos))) out.push("plain", m);
      else {
        m = ch;
        out.push("punctuation", m);
      }
    } else if (depth > 0 && (m = at(re.customProperty, src, pos))) {
      out.push("variable", m);
      const colon = src.indexOf(":", pos + m.length);
      out.push("plain", src.slice(pos + m.length, colon));
      out.push("punctuation", ":");
      pos = colon + 1;
      inValue = true;
      continue;
    } else if (depth > 0 && (m = at(re.property, src, pos))) {
      out.push("property", m);
      const colon = src.indexOf(":", pos + m.length);
      out.push("plain", src.slice(pos + m.length, colon));
      out.push("punctuation", ":");
      pos = colon + 1;
      inValue = true;
      continue;
    } else if ((m = at(re.selector, src, pos))) {
      // .class / #id read as types, :pseudo as functions, [attr] as attributes, & and * as punctuation.
      out.push(
        m.startsWith("[") ? "attr" : m.startsWith(":") ? "function" : m === "&" || m === "*" ? "punctuation" : "type",
        m,
      );
    } else if ((m = at(re.ident, src, pos))) out.push("tag", m);
    else {
      m = ch;
      out.push("punctuation", m);
    }
    pos += m.length;
  }
}

/* ---------- Bash / shell ---------- */

const BASH_KEYWORDS = set(
  "if then else elif fi for while until do done case esac in function select return exit export local readonly declare unset source alias time",
);
/** After these, the next word is a command. */
const BASH_COMMAND_INTRO = set("then else elif do sudo exec time xargs if while until !");

function scanBash(src: string, out: TokenList) {
  const re = {
    space: /[ \t]+/y,
    newline: /\n/y,
    continuation: /\\\n/y,
    comment: /#[^\n]*/y,
    prompt: /[$>%](?= )/y,
    single: /'[^']*'?/y,
    double: /"(?:[^"\\]|\\[\s\S])*"?/y,
    variable: /\$\{[^}\n]*\}?|\$[A-Za-z_]\w*|\$[@#?$!*0-9-]/y,
    subshell: /\$\(|`/y,
    assign: /[A-Za-z_]\w*(?==)/y,
    /** The value of an assignment: quoted parts and bare characters up to the next space. */
    assignValue: /(?:'[^']*'?|"(?:[^"\\]|\\[\s\S])*"?|[^\s;|&<>()])*/y,
    flag: /--?[A-Za-z0-9][\w-]*/y,
    number: /\d+(?:\.\d+)?(?![\w.-])/y,
    operator: /&&|\|\||;;|<<<|[|&;]|>>?|<<?|[()]/y,
    /** A here-document: `<<EOF`, `<<-EOF`, `<<'EOF'` or `<<"EOF"`. */
    heredoc: /<<(-?)[ \t]*(?:'([^'\n]+)'|"([^"\n]+)"|\\?([A-Za-z_][\w-]*))/y,
    word: /(?:[^\s|&;<>()$'"`\\#]|\\.|#(?<=\S#))+/y,
  };
  let pos = 0;
  let command = true;
  let lineStart = true;
  let m: string | null;
  /** Here-documents opened on the current line; their bodies start after its newline. */
  const heredocs: { delimiter: string; tabs: boolean; quoted: boolean }[] = [];

  /** A here-document body (a string; $variables still expand unless the delimiter was quoted) and its closing line. */
  const readHeredoc = ({ delimiter, tabs, quoted }: (typeof heredocs)[number]) => {
    const bodyStart = pos;
    let cursor = pos;
    while (cursor < src.length) {
      const nl = src.indexOf("\n", cursor);
      const line = src.slice(cursor, nl === -1 ? src.length : nl);
      if ((tabs ? line.replace(/^\t+/, "") : line) === delimiter) {
        pushHeredocBody(src.slice(bodyStart, cursor), quoted, re.variable, out);
        const indent = line.length - delimiter.length;
        out.push("plain", line.slice(0, indent));
        out.push("string", delimiter);
        pos = cursor + line.length;
        return;
      }
      if (nl === -1) break;
      cursor = nl + 1;
    }
    // Unterminated: the rest of the snippet is the body.
    pushHeredocBody(src.slice(bodyStart), quoted, re.variable, out);
    pos = src.length;
  };

  while (pos < src.length) {
    const prevChar = src[pos - 1];
    if ((m = at(re.continuation, src, pos))) {
      out.push("punctuation", "\\");
      out.push("plain", "\n");
    } else if ((m = at(re.newline, src, pos))) {
      out.push("plain", m);
      command = true;
      lineStart = true;
      pos += m.length;
      while (heredocs.length > 0 && pos < src.length) {
        const doc = heredocs.shift();
        if (doc !== undefined) readHeredoc(doc);
      }
      continue;
    } else if (src.startsWith("<<", pos) && !src.startsWith("<<<", pos) && (m = at(re.heredoc, src, pos))) {
      const dash = src[pos + 2] === "-";
      const opLength = dash ? 3 : 2;
      out.push("punctuation", src.slice(pos, pos + opLength));
      const rest = m.slice(opLength);
      const word = rest.trimStart();
      out.push("plain", rest.slice(0, rest.length - word.length));
      out.push("string", word);
      const quoted = /^['"\\]/.test(word);
      heredocs.push({ delimiter: word.replace(/^['"\\]|['"]$/g, ""), tabs: dash, quoted });
      command = false;
      lineStart = false;
      pos += m.length;
      continue;
    } else if ((m = at(re.space, src, pos))) out.push("plain", m);
    else if (lineStart && (m = at(re.prompt, src, pos))) {
      // A copied prompt ("$ pnpm add …"): muted, and the next word is the command.
      out.push("punctuation", m);
      command = true;
      lineStart = false;
      pos += m.length;
      continue;
    } else if ((prevChar === undefined || /\s/.test(prevChar)) && (m = at(re.comment, src, pos)))
      out.push("comment", m);
    else if ((m = at(re.single, src, pos)) && src[pos] === "'") {
      out.push("string", m);
      command = false;
    } else if ((m = at(re.double, src, pos)) && src[pos] === '"') {
      out.push("string", m);
      command = false;
    } else if ((m = at(re.subshell, src, pos))) {
      out.push("punctuation", m);
      command = true;
    } else if ((m = at(re.variable, src, pos))) {
      out.push("variable", m);
      command = false;
    } else if ((m = at(re.operator, src, pos))) {
      out.push("punctuation", m);
      command = m !== ">" && m !== ">>" && m !== "<" && m !== "<<" && m !== ")";
    } else if (command && (m = at(re.assign, src, pos))) {
      out.push("variable", m);
      out.push("punctuation", "=");
      pos += m.length + 1;
      const value = at(re.assignValue, src, pos) ?? "";
      out.push(/^["']/.test(value) ? "string" : "plain", value);
      pos += value.length;
      lineStart = false;
      continue; // still in command position: FOO=1 cmd
    } else if ((m = at(re.flag, src, pos)) && !command && /\s/.test(prevChar ?? " ")) out.push("attr", m);
    else if (!command && (m = at(re.number, src, pos)) && /\s|=/.test(prevChar ?? " ")) out.push("number", m);
    else if ((m = at(re.word, src, pos))) {
      if (BASH_KEYWORDS.has(m)) {
        out.push("keyword", m);
        command = BASH_COMMAND_INTRO.has(m);
      } else if (command) {
        out.push("function", m);
        command = BASH_COMMAND_INTRO.has(m);
      } else out.push("plain", m);
    } else {
      m = src.charAt(pos);
      out.push("plain", m);
    }
    lineStart = false;
    pos += m.length;
  }
}

function pushHeredocBody(body: string, quoted: boolean, variable: RegExp, out: TokenList) {
  if (quoted) {
    out.push("string", body);
    return;
  }
  let pos = 0;
  while (pos < body.length) {
    const next = body.indexOf("$", pos);
    if (next === -1) {
      out.push("string", body.slice(pos));
      break;
    }
    out.push("string", body.slice(pos, next));
    const v = at(variable, body, next);
    if (v) {
      out.push("variable", v);
      pos = next + v.length;
    } else {
      out.push("string", "$");
      pos = next + 1;
    }
  }
}

/* ---------- Python ---------- */

/** Only whitespace between the previous newline (or the start) and `pos`. */
function atLineStart(src: string, pos: number) {
  for (let i = pos - 1; i >= 0; i--) {
    const c = src[i];
    if (c === "\n") return true;
    if (c !== " " && c !== "\t") return false;
  }
  return true;
}

const PY_KEYWORDS = set(
  "and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield match case",
);
const PY_LITERALS = set("True False None self cls");
const PY_BUILTINS = set(
  "print len range open str int float list dict set tuple bool type isinstance issubclass enumerate zip map filter sorted reversed sum min max abs any all super object iter next repr round hash id input format vars getattr setattr hasattr callable property staticmethod classmethod Exception ValueError TypeError KeyError IndexError RuntimeError StopIteration",
);

function scanPython(src: string, out: TokenList) {
  const re = {
    space: /\s+/y,
    comment: /#[^\n]*/y,
    triple: /(?:[rRbBuUfF]{1,2})?(?:"""[\s\S]*?(?:"""|$)|'''[\s\S]*?(?:'''|$))/y,
    string: /(?:[rRbBuUfF]{1,2})?(?:"(?:[^"\\\n]|\\.)*"?|'(?:[^'\\\n]|\\.)*'?)/y,
    decorator: /@[A-Za-z_][\w.]*/y,
    number: /(?:0[xX][\da-fA-F_]+|0[bB][01_]+|0[oO][0-7_]+|(?:\d[\d_]*)?\.?\d[\d_]*(?:[eE][+-]?\d+)?)[jJ]?/y,
    ident: /[A-Za-z_]\w*/y,
    operator: /->|\*\*=?|\/\/=?|<<=?|>>=?|[<>!=]=|:=|[-+*/%&|^~<>=@]=?/y,
    punct: /[()[\]{},.:;]/y,
    call: /\s*\(/y,
  };
  let pos = 0;
  let m: string | null;
  while (pos < src.length) {
    const ch = src.charAt(pos);
    if ((m = at(re.space, src, pos))) out.push("plain", m);
    else if ((m = at(re.comment, src, pos))) out.push("comment", m);
    else if ((m = at(re.triple, src, pos)) || (m = at(re.string, src, pos))) out.push("string", m);
    else if (ch === "@" && atLineStart(src, pos) && (m = at(re.decorator, src, pos))) out.push("function", m);
    else if (/[\d.]/.test(ch) && (m = at(re.number, src, pos)) && /\d/.test(m)) out.push("number", m);
    else if ((m = at(re.ident, src, pos))) {
      const prev = out.last;
      const afterDot = prev?.kind === "punctuation" && prev.text === ".";
      let kind: TokenKind = "plain";
      if (!afterDot && PY_KEYWORDS.has(m)) kind = "keyword";
      else if (!afterDot && PY_LITERALS.has(m)) kind = "literal";
      else if (prev?.kind === "keyword" && prev.text === "def") kind = "function";
      else if (prev?.kind === "keyword" && prev.text === "class") kind = "type";
      else if (at(re.call, src, pos + m.length) !== null) kind = !afterDot && PY_BUILTINS.has(m) ? "type" : "function";
      else if (!afterDot && PY_BUILTINS.has(m)) kind = "type";
      else if (/^[A-Z]/.test(m) && /[a-z]/.test(m)) kind = "type";
      out.push(kind, m);
    } else if ((m = at(re.operator, src, pos)) || (m = at(re.punct, src, pos))) out.push("punctuation", m);
    else {
      m = ch;
      out.push("plain", m);
    }
    pos += m.length;
  }
}
