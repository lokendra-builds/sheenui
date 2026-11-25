// The CodeBlock tokenizer: every token list must add back up to the exact source (nothing lost,
// nothing doubled), and the interesting constructs of each language get the right kind.

import { describe, expect, it } from "vitest";

import {
  resolveLanguage,
  splitLines,
  tokenize,
  type Token,
  type TokenKind,
} from "../../src/components/code-block/tokenize";

const join = (tokens: Token[]) => tokens.map((t) => t.text).join("");
const kindsOf = (tokens: Token[], text: string) => tokens.filter((t) => t.text.includes(text)).map((t) => t.kind);
const has = (tokens: Token[], kind: TokenKind, text: string) =>
  tokens.some((t) => t.kind === kind && t.text.includes(text));

describe("resolveLanguage + splitLines", () => {
  it("normalises aliases and falls back to text", () => {
    for (const [alias, lang] of [
      ["TypeScript", "ts"],
      ["mts", "ts"],
      ["tsx", "tsx"],
      ["JavaScript", "js"],
      ["cjs", "js"],
      ["jsx", "jsx"],
      ["jsonc", "json"],
      ["css", "css"],
      ["zsh", "bash"],
      ["console", "bash"],
      ["py", "python"],
      ["svg", "html"],
      ["xml", "html"],
      ["plaintext", "text"],
      ["klingon", "text"],
    ] as const)
      expect(resolveLanguage(alias)).toBe(lang);
    expect(resolveLanguage(undefined)).toBe("text");
  });

  it("splitLines cuts multi-line tokens, keeps kinds, and always returns one line at least", () => {
    expect(splitLines([])).toEqual([[]]);
    const lines = splitLines([
      { kind: "comment", text: "/* a\nb */" },
      { kind: "plain", text: "\nx" },
    ]);
    expect(lines).toEqual([
      [{ kind: "comment", text: "/* a" }],
      [{ kind: "comment", text: "b */" }],
      [{ kind: "plain", text: "x" }],
    ]);
  });

  it("plain text and unknown languages are one plain token", () => {
    expect(tokenize("hello\nworld", "text")).toEqual([{ kind: "plain", text: "hello\nworld" }]);
    expect(tokenize("x", "nope")).toEqual([{ kind: "plain", text: "x" }]);
    expect(tokenize("", "ts")).toEqual([]);
  });
});

const samples: Record<string, string[]> = {
  ts: [
    `import type { A, B } from "./mod";\nexport const x: Record<string, Array<number>> = { a: 1, b: [2, 3] };`,
    `// line comment\n/* block\n   comment */ /** doc */\nlet n = 0xFF + 1_000 + 3.14e-2 + 10n + .5;`,
    `enum Color { Red = "RED", Green = 2 }\ninterface Shape<T extends object = {}> { readonly id: number; name?: string; area(): T }`,
    `class Foo<T> extends Bar implements Baz { private static count = 0; constructor(public readonly name: string) { super(); } get value(): T | undefined { return this.#v; } }`,
    `const re = /ab+c/gi.test(s) ? a / b / c : /[/]\\//.exec(t);\nconst t = \`hello \${user.name} and \${\`nested \${deep}\`} end\`;`,
    `function* gen<T>(items: T[]): Generator<T> { for (const i of items) yield i; }\nconst f = async <T,>(x: T): Promise<T> => await x;`,
    `type Fn = (a: number, ...rest: string[]) => void;\ntype Cond<T> = T extends string ? "s" : T extends number ? "n" : never;\nlet v = obj as unknown as Map<string, Set<number>>;`,
    `@Component({ selector: "x" })\nclass A { @Input() a!: string; }\nabstract class B { abstract m(): void }`,
    `const a = b < c && d > e; const g = foo<string>("x"); if (a<b) {}`,
    `label: for (;;) { break label; } switch (x) { case 1: default: break }\ntry { throw new Error("x") } catch { } finally { }`,
    `const s = 'it\\'s' + "say \\"hi\\"" + \`multi\nline\`;\nconst u = undefined ?? null; const t = true || false;`,
    `export default function () {}\nexport * as ns from "x";\nexport { a as b };\nnamespace N { export declare const c: number }`,
    `"unterminated string\nlet x = \`unterminated template`,
    `/* unterminated block`,
    `a = b /* c */ / d; const r = x.replace(/\\d+/g, "$&");`,
  ],
  tsx: [
    `export function App({ items }: { items: string[] }) {\n  return (\n    <div className="a" data-x={1} {...rest}>\n      {items.map((i) => <li key={i}>{i} &amp; more</li>)}\n      <Foo.Bar<string> prop />\n      <></>\n    </div>\n  );\n}`,
    `const el = cond ? <a href='x'>text</a> : <img src={s} alt="" />;\nconst n = a < b;\nconst g = <T,>(x: T) => x;`,
    `return <>\n  <p>{/* comment */}{\`tpl \${x}\`}</p>\n  text with "quotes" and 'apostrophes'\n</>;`,
    `<div\n  onClick={() => { setOpen(!open); }}\n  style={{ color: "red" }}\n/>`,
  ],
  js: [
    `const fs = require("fs");\nmodule.exports = { run() { return 1 } };\nfor await (const x of y) {}\nconsole.log(typeof x === 'undefined', new.target, void 0);`,
    `var a = 1, b = 2;\nlet c = a ** b % 3 >>> 1 | 2 & 3 ^ 4;\nthis.x?.y?.[0]?.(1);\ndelete o.p; x ||= 1; y &&= 2; z ??= 3;`,
    `class A { static #p = 1; static { init(); } get x() {} set x(v) {} async *m() {} }`,
  ],
  jsx: [`const A = () => <section aria-label="x"><h1>{title}</h1>{list.length > 0 && <ul />}</section>;`],
  json: [
    `{ "a": 1, "b": [true, false, null], "c": { "d": "e\\n", "f": -1.5e+10 } }`,
    `// comment\n{\n  /* block */ "key": "value", // trailing\n  "arr": [1, 2, 3,],\n}`,
    `[1, "two", {"three": 3}]`,
    `{ "unterminated": "abc`,
    `not json at all`,
    ``,
  ],
  css: [
    `@import url("a.css");\n@media (min-width: 640px) and (prefers-color-scheme: dark) { .a > .b:hover::after, #id[data-x="1"] { color: #fff; margin: -4px 0 1.5rem 10%; } }`,
    `:root { --brand: oklch(70% 0.2 250); --x: calc(100% - var(--gap, 8px)); }\n.card { background: linear-gradient(to right, rgb(0 0 0 / 50%), transparent) !important; font: 12px/1.4 "Inter", sans-serif; }`,
    `/* comment */ a:not(.b):nth-child(2n+1) { content: "\\201C"; transition: opacity .2s ease-in-out; }\n@font-face { src: url(data:font/woff2;base64,AAAA) format("woff2"); }`,
    `@keyframes spin { from { transform: rotate(0deg) } 50.5% { opacity: .5 } to { transform: rotate(360deg) } }\n.parent { &:hover { color: red; } .child & { margin: 0 } }`,
    `@layer base, components;\n@supports (display: grid) { .g { display: grid } }\n@container card (min-width: 400px) { .x { y: z } }\n.unclosed { color: red;`,
    `/* unterminated`,
    `.a{b:c}.d{e:f}`,
  ],
  bash: [
    `#!/usr/bin/env bash\n# comment\nset -euo pipefail\nname="World"\necho "Hello, $name! \${name:-x} $(date +%F) \\$escaped" 'single $quoted'\n`,
    `if [ -f "$FILE" ] && [[ $x == y* ]]; then\n  cat "$FILE" | grep -n "foo" | sort -u > out.txt 2>&1\nelif (( n > 3 )); then exit 1\nelse\n  echo done >> log\nfi`,
    `for f in *.ts; do\n  npx tsc --noEmit -p "$f" || exit $?\ndone\nwhile read -r line; do echo "$line"; done < input.txt`,
    `function greet() { local who=\${1:-me}; printf '%s\\n' "$who"; }\ngreet "$@"\narr=(a b c); echo \${arr[@]} \${#arr[@]}`,
    `cat <<EOF\nHello $USER\nEOF\ncat <<'RAW'\nNo $expansion here\nRAW\ncat <<-INDENT\n\tindented\n\tINDENT`,
    `$ npm install --save-dev vitest\n$ pnpm test -- --coverage\n> output line\nexport PATH="$HOME/bin:$PATH"\nalias ll='ls -la'\ncase "$1" in a) echo A;; *) echo other;; esac`,
    `echo "unterminated $(date\necho 'also unterminated`,
    `x=$((1 + 2)); y=\`uname\`; [ -n "$z" ] && echo yes || echo no; cmd1 & cmd2; (cd dir && make)`,
    `docker run --rm -v "$PWD":/app -p 8080:80 image:tag sh -c 'echo hi' # trailing comment`,
  ],
  python: [
    `import os\nfrom typing import List, Optional\n\n@dataclass\nclass User(Base):\n    name: str\n    age: int = 0\n\n    def greet(self, other: "User") -> str:\n        return f"Hi {other.name!r:>10} {self.age + 1}"\n`,
    `# comment\nx = [i ** 2 for i in range(10) if i % 2 == 0]\ny = {"a": 1, 'b': 2.5e3, "c": 0x1F, "d": 0b101, "e": 1_000}\nz = lambda a, *args, **kw: a if args else None\n`,
    `"""Module docstring\nspanning lines"""\nasync def main() -> None:\n    async with a as b, c as d:\n        await asyncio.sleep(1)\n    try:\n        raise ValueError("x") from None\n    except (A, B) as e:\n        pass\n    finally:\n        del x\n`,
    `s = r'raw\\n' + b"bytes" + rb'x' + u'uni' + '''triple\nsingle''' + f'{a}{{literal}}{b:{width}}'\nwhile True: break\nprint(not x, x is None, x in y, True and False or None)\nglobal g; nonlocal h`,
    `class Meta(type):\n    def __new__(mcs, name, bases, ns, **kw): return super().__new__(mcs, name, bases, ns)\nif __name__ == "__main__":\n    main()\n`,
    `x = "unterminated\ny = '''unterminated triple`,
    `def f(a, b=2, /, c=3, *, d): yield from g(); return a @ b`,
  ],
  html: [
    `<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="utf-8" /><title>Hi &amp; bye</title><style>body { margin: 0 }</style></head>\n<body class='a b' data-x=1 hidden>\n  <!-- a comment -->\n  <script type="module">const a = 1; console.log(a);</script>\n  <p>Text &copy; 2026 <b>bold</b></p>\n  <input disabled value="v">\n</body>\n</html>`,
    `<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg"><path d="M0 0L10 10"/><g fill="none"></g></svg>`,
    `<div><span>unclosed\n<a href="x`,
    `<!-- unterminated comment`,
    `<?xml version="1.0"?><root><item id="1"/></root>`,
    `text only, no tags & ampersand < not a tag`,
  ],
};

describe.each(Object.entries(samples))("%s", (lang, list) => {
  it.each(list.map((code, i) => [i, code] as const))(
    "sample %i round-trips (the tokens add back up to the source)",
    (_i, code) => {
      const tokens = tokenize(code, lang);
      expect(join(tokens)).toBe(code);
      for (const t of tokens) expect(t.text.length).toBeGreaterThan(0);
      // Neighbours of one kind are merged (except punctuation, which stays separate).
      tokens.slice(1).forEach((t, i) => {
        if (t.kind !== "punctuation") expect(tokens[i]!.kind === t.kind).toBe(false);
      });
    },
  );
});

describe("token kinds", () => {
  it("TypeScript: keywords, types, strings, numbers, comments, functions, literals, templates", () => {
    const t = tokenize(
      `// note\nconst total: number = compute(0xff, "s", \`t\${x}\`) ?? null;\ninterface Box<T> { v: T }`,
      "ts",
    );
    expect(has(t, "comment", "// note")).toBe(true);
    expect(has(t, "keyword", "const")).toBe(true);
    expect(has(t, "type", "number")).toBe(true);
    expect(has(t, "function", "compute")).toBe(true);
    expect(has(t, "number", "0xff")).toBe(true);
    expect(has(t, "string", '"s"')).toBe(true);
    expect(has(t, "string", "`t")).toBe(true);
    expect(has(t, "literal", "null")).toBe(true);
    expect(has(t, "keyword", "interface")).toBe(true);
    expect(has(t, "type", "Box")).toBe(true);
  });

  it("TSX: tags, attributes, JSX text and expressions", () => {
    const t = tokenize(`const a = <Button variant="primary" onClick={go}>Save</Button>;`, "tsx");
    expect(has(t, "type", "Button")).toBe(true); // components read as types, lowercase elements as tags
    expect(has(tokenize(`const a = <main id="x" />;`, "tsx"), "tag", "main")).toBe(true);
    expect(has(t, "attr", "variant")).toBe(true);
    expect(has(t, "string", '"primary"')).toBe(true);
    expect(kindsOf(t, "Save")).toContain("plain");
  });

  it("a less-than that compares (not a tag) stays code", () => {
    const t = tokenize("const c = a < b && b > c;", "tsx");
    expect(t.some((x) => x.kind === "tag")).toBe(false);
  });

  it("JSON: keys are properties, values strings / numbers / literals", () => {
    const t = tokenize(`{"name": "x", "n": -1.5, "ok": true, "none": null}`, "json");
    expect(has(t, "property", '"name"')).toBe(true);
    expect(has(t, "string", '"x"')).toBe(true);
    expect(has(t, "number", "-1.5")).toBe(true);
    expect(has(t, "literal", "true")).toBe(true);
    expect(has(t, "literal", "null")).toBe(true);
  });

  it("CSS: selectors, properties, values, at-rules, variables, comments, numbers with units", () => {
    const t = tokenize(
      `@media (min-width: 640px) { .a { --gap: 8px; color: #fff; margin: 0 1.5rem; } } /* c */`,
      "css",
    );
    expect(has(t, "keyword", "@media")).toBe(true);
    expect(has(t, "property", "color")).toBe(true);
    expect(has(t, "variable", "--gap")).toBe(true);
    expect(has(t, "number", "8px")).toBe(true);
    expect(has(t, "comment", "/* c */")).toBe(true);
  });

  it("Bash: comments, strings, variables, commands and flags", () => {
    const t = tokenize(`# hi\nnpm install --save "$HOME/x" $VAR`, "bash");
    expect(has(t, "comment", "# hi")).toBe(true);
    expect(has(t, "function", "npm")).toBe(true);
    expect(has(t, "string", "$HOME")).toBe(true);
    expect(has(t, "variable", "$VAR")).toBe(true);
  });

  it("Python: keywords, decorators, strings, numbers, comments, built-ins", () => {
    const t = tokenize(`@cache\ndef f(x: int) -> bool:  # why\n    return x is not None and len("s") > 0`, "python");
    expect(has(t, "keyword", "def")).toBe(true);
    expect(has(t, "keyword", "return")).toBe(true);
    expect(has(t, "comment", "# why")).toBe(true);
    expect(has(t, "string", '"s"')).toBe(true);
    expect(has(t, "literal", "None")).toBe(true);
  });

  it("HTML: tags, attributes, comments, text", () => {
    const t = tokenize(`<a href="/x" class='y'>go</a><!-- c -->`, "html");
    expect(has(t, "tag", "a")).toBe(true);
    expect(has(t, "attr", "href")).toBe(true);
    expect(has(t, "string", '"/x"')).toBe(true);
    expect(has(t, "comment", "<!-- c -->")).toBe(true);
  });

  it("stays fast on long input (no catastrophic backtracking)", () => {
    const code =
      "const x = [" + Array.from({ length: 4000 }, (_, i) => `{ id: ${i}, name: "item ${i}" }`).join(", ") + "];";
    const start = performance.now();
    const tokens = tokenize(code, "ts");
    expect(join(tokens)).toBe(code);
    expect(performance.now() - start).toBeLessThan(1500);
  });
});
