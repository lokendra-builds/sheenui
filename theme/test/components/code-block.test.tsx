import { expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { CodeBlock, CodeBlockTabs, parseLineSpec } from "../../src/components/code-block/code-block";
import { resolveLanguage, splitLines, tokenize } from "../../src/components/code-block/tokenize";
import { describeVariants, renderUi, runAxe } from "../render";

const tsx = `import { Button } from "sheenui";

export function App() {
  // say hi
  return <Button onClick={() => alert("hi " + 42)}>Hello</Button>;
}`;

function mockClipboard(impl: (t: string) => Promise<void> = () => Promise.resolve()) {
  const writeText = vi.fn(impl);
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
  return writeText;
}

describeVariants((variant) => {
  it("shows the file name, the language, numbered lines and the code", () => {
    renderUi(<CodeBlock code={tsx} language="tsx" filename="app.tsx" />, variant);
    expect(screen.getByText("app.tsx")).toBeInTheDocument();
    expect(screen.getByText("TSX")).toBeInTheDocument();
    expect(document.body.textContent).toContain("export function App() {");
    expect(
      document.querySelectorAll("[data-line], [data-slot=code-line]").length +
        document.querySelectorAll("code *").length,
    ).toBeGreaterThan(5);
  });

  it("copy writes the code to the clipboard, announces it, shows 'Copied', then resets", async () => {
    const writeText = mockClipboard();
    const onCopy = vi.fn();
    renderUi(<CodeBlock code="npm i sheenui" language="bash" onCopy={onCopy} />, variant);
    await userEvent.click(screen.getByRole("button", { name: "Copy code" }));
    expect(writeText).toHaveBeenCalledWith("npm i sheenui");
    await expect.poll(() => screen.queryAllByText("Copied").length).toBeGreaterThan(0);
    await expect.poll(() => screen.getByRole("status").textContent).toBe("Code copied to clipboard");
    expect(onCopy).toHaveBeenCalledWith("npm i sheenui");
  });

  it("a failed copy says so, and announces how to copy by hand", async () => {
    mockClipboard(() => Promise.reject(new Error("denied")));
    const exec = vi.spyOn(document, "execCommand").mockReturnValue(false);
    renderUi(<CodeBlock code="secret" language="text" />, variant);
    await userEvent.click(screen.getByRole("button", { name: "Copy code" }));
    await expect.poll(() => screen.queryAllByText("Copy failed").length).toBeGreaterThan(0);
    await expect.poll(() => screen.getByRole("status").textContent).toMatch(/press Control C or Command C/);
    exec.mockRestore();
  });

  it("the copy button is keyboard operable (Enter and Space)", async () => {
    const writeText = mockClipboard();
    renderUi(<CodeBlock code="a" language="text" />, variant);
    screen.getByRole("button", { name: "Copy code" }).focus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    expect(writeText).toHaveBeenCalledTimes(2);
  });

  it("copyable={false} removes the button; header={false} keeps a floating copy button", () => {
    const { rerender } = renderUi(<CodeBlock code="x" language="text" copyable={false} />, variant);
    expect(screen.queryByRole("button", { name: "Copy code" })).toBeNull();
    rerender(<CodeBlock code="x" language="text" header={false} />);
    expect(screen.getByRole("button", { name: "Copy code" })).toBeInTheDocument();
  });

  it("the wrap toggle is a pressed/unpressed button; `wrap` and `onWrapChange` control it", async () => {
    const onWrapChange = vi.fn();
    renderUi(
      <CodeBlock code={"x".repeat(300)} language="text" filename="long.txt" onWrapChange={onWrapChange} />,
      variant,
    );
    const toggle = screen.getByRole("button", { name: "Wrap long lines" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(onWrapChange).toHaveBeenCalledWith(true);
  });

  it("a long block scrolls inside a focusable named group (keyboard users can scroll it)", () => {
    const lines = Array.from({ length: 80 }, (_, i) => `const v${i} = ${i};`).join("\n");
    renderUi(<CodeBlock code={lines} language="ts" filename="big.ts" maxHeight={160} />, variant);
    const region = screen.getByRole("group", { name: /Code: big\.ts|Code/ });
    expect(region).toHaveAttribute("tabindex", "0");
    expect(region.scrollHeight).toBeGreaterThan(region.clientHeight);
  });

  it("highlight, added and removed lines are marked up with <mark>, <ins> and <del>", () => {
    renderUi(
      <CodeBlock code={"a\nb\nc\nd"} language="text" highlightLines="1" addedLines={[2]} removedLines="3-4" />,
      variant,
    );
    expect(document.querySelectorAll("mark").length).toBeGreaterThan(0);
    expect(document.querySelectorAll("ins").length).toBeGreaterThan(0);
    expect(document.querySelectorAll("del").length).toBeGreaterThan(0);
  });

  it("labels translate the buttons and language names (i18n)", () => {
    renderUi(
      <CodeBlock
        code="x"
        language="ts"
        filename="a.ts"
        labels={{ copyCode: "Code kopieren", wrap: "Zeilen umbrechen", languages: { ts: "TypScript (de)" } }}
      />,
      variant,
    );
    expect(screen.getByRole("button", { name: "Code kopieren" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Zeilen umbrechen" })).toBeInTheDocument();
    expect(screen.getByText("TypScript (de)")).toBeInTheDocument();
  });

  it("CodeBlockTabs: arrow keys switch files, the active file is copied and the panel follows", async () => {
    const writeText = mockClipboard();
    const onValueChange = vi.fn();
    renderUi(
      <CodeBlockTabs
        labels={{ tabs: "Package manager" }}
        onValueChange={onValueChange}
        files={[
          { label: "pnpm", code: "pnpm add sheenui", language: "bash" },
          { label: "npm", code: "npm i sheenui", language: "bash" },
          { label: "yarn", code: "yarn add sheenui", language: "bash" },
        ]}
      />,
      variant,
    );
    expect(screen.getByRole("tablist", { name: "Package manager" })).toBeInTheDocument();
    const pnpm = screen.getByRole("tab", { name: "pnpm" });
    expect(pnpm).toHaveAttribute("aria-selected", "true");
    pnpm.focus();
    await userEvent.keyboard("{ArrowRight}{Enter}");
    await expect.poll(() => screen.getByRole("tab", { name: "npm" }).getAttribute("aria-selected")).toBe("true");
    expect(onValueChange).toHaveBeenLastCalledWith("npm");
    // The panel swaps after the selected state: poll its text, never read it once.
    await expect.poll(() => screen.getByRole("tabpanel").textContent).toContain("npm i sheenui");
    await userEvent.click(screen.getByRole("button", { name: "Copy code" }));
    expect(writeText).toHaveBeenLastCalledWith("npm i sheenui");
    await userEvent.click(screen.getByRole("tab", { name: "yarn" }));
    await expect.poll(() => screen.getByRole("tabpanel").textContent).toContain("yarn add sheenui");
  });

  it("has no axe violations (single, diff + highlights, tabs)", async () => {
    renderUi(
      <div className="grid gap-6">
        <CodeBlock code={tsx} language="tsx" filename="app.tsx" highlightLines="4" />
        <CodeBlock code={"a\nb\nc"} language="text" addedLines="2" removedLines="3" filename="diff.txt" />
        <CodeBlockTabs
          labels={{ tabs: "Install" }}
          files={[
            { label: "pnpm", code: "pnpm add x" },
            { label: "npm", code: "npm i x" },
          ]}
        />
        <CodeBlock
          code={Array.from({ length: 60 }, (_, i) => `line ${i}`).join("\n")}
          language="text"
          maxHeight={120}
          filename="scroll.txt"
        />
      </div>,
      variant,
    );
    expect(await runAxe()).toHaveNoViolations();
  });
});

it("tokenize: classifies keywords, strings, numbers and comments per language", () => {
  const kinds = (code: string, lang: string) =>
    tokenize(code, lang)
      .filter((t) => t.kind !== "plain" && t.text.trim())
      .map((t) => `${t.kind}:${t.text}`);
  const ts = kinds('const x = "hi"; // note\nlet n = 42;', "ts");
  expect(ts.some((k) => k.startsWith("keyword:const"))).toBe(true);
  expect(ts.some((k) => k.startsWith("string:"))).toBe(true);
  expect(ts.some((k) => k.startsWith("comment:"))).toBe(true);
  expect(ts.some((k) => k.startsWith("number:42"))).toBe(true);
  expect(
    tokenize("x", "no-such-language")
      .map((t) => t.text)
      .join(""),
  ).toBe("x");
  expect(kinds("echo $HOME # c", "bash").length).toBeGreaterThan(0);
  expect(kinds('{"a": 1, "b": true}', "json").length).toBeGreaterThan(0);
  // Tokens always reassemble to the source.
  for (const [code, lang] of [
    [tsx, "tsx"],
    ["def f(x):\n  return x # y", "python"],
    ['<a href="/x">hi</a>', "html"],
    ["a { color: red; }", "css"],
  ] as const) {
    expect(
      tokenize(code, lang)
        .map((t) => t.text)
        .join(""),
    ).toBe(code);
  }
});

it("splitLines, parseLineSpec and resolveLanguage", () => {
  expect(splitLines(tokenize("a\nb\n\nc", "text"))).toHaveLength(4);
  expect([...parseLineSpec("1, 4-6")]).toEqual([1, 4, 5, 6]);
  expect([...parseLineSpec("6-4")]).toEqual([4, 5, 6]);
  expect([...parseLineSpec([2, 3])]).toEqual([2, 3]);
  expect(parseLineSpec(undefined).size).toBe(0);
  expect(parseLineSpec("x, 2").size).toBe(1);
  expect(resolveLanguage("typescript")).toBe("ts");
  expect(resolveLanguage("sh")).toBe("bash");
  expect(resolveLanguage("klingon")).toBe("text");
  expect(resolveLanguage(undefined)).toBe("text");
});

const samples: Record<string, { code: string; expect: string[] }> = {
  ts: {
    code: 'import type { A } from "./a";\nexport async function f<T extends A>(x: T, n = 0x1f): Promise<T | null> {\n  /* block */ const s = `tpl ${x}`; // line\n  return n > 1 ? x : null;\n}\ninterface B { id: number }',
    expect: ["keyword", "string", "comment", "number", "type", "function", "punctuation"],
  },
  jsx: {
    code: 'const App = () => <div className="a" onClick={() => go(1)}>Hello {name}</div>;\nexport default App;',
    expect: ["keyword", "string", "tag", "attr"],
  },
  js: {
    code: "let a = true; const b = null; while (a) { a = !a; } // done\nfunction g() { return /re+/.test('x'); }",
    expect: ["keyword", "literal", "comment", "string"],
  },
  json: {
    code: '{\n  "name": "sheen",\n  "n": 1.5e3,\n  "ok": true,\n  "none": null,\n  "list": [1, 2]\n}',
    expect: ["property", "string", "number", "literal"],
  },
  css: {
    code: '@media (min-width: 40rem) {\n  .card > a:hover, #id[data-x="1"] { color: #fff; margin: 0 1.5rem !important; background: var(--x); }\n}\n/* note */',
    expect: ["comment", "number", "property", "keyword"],
  },
  bash: {
    code: '#!/bin/bash\n# install\nexport FOO="bar baz"\nif [ -f "$FILE" ]; then\n  pnpm add sheenui --save-dev && echo $HOME\nfi',
    expect: ["comment", "keyword", "string", "variable"],
  },
  python: {
    code: 'import os\n\n@decorator\nclass A(Base):\n    """doc"""\n    def run(self, n: int = 3) -> None:\n        # hi\n        return f"{n}" if n else None',
    expect: ["keyword", "string", "comment", "number", "function", "literal"],
  },
  html: {
    code: '<!DOCTYPE html>\n<!-- c -->\n<a href="/x" class=\'y\' disabled>Hi &amp; bye</a>\n<img src="a.png" />',
    expect: ["comment", "tag", "attr", "string"],
  },
  text: { code: "plain text 123", expect: ["plain"] },
};

it.each(Object.keys(samples))("tokenize(%s): recognises its syntax and always reassembles to the source", (lang) => {
  const { code, expect: wanted } = samples[lang]!;
  const tokens = tokenize(code, lang);
  expect(tokens.map((t) => t.text).join("")).toBe(code);
  const kinds = new Set(tokens.map((t) => t.kind));
  for (const kind of wanted) expect(kinds, `${lang} should produce a "${kind}" token`).toContain(kind);
  expect(splitLines(tokens)).toHaveLength(code.split("\n").length);
});

it("tokenize: unterminated strings, comments and empty input do not throw or lose text", () => {
  for (const [code, lang] of [
    ["", "ts"],
    ['const s = "open', "ts"],
    ["/* never closed", "css"],
    ["<div", "html"],
    ["echo 'x", "bash"],
    ['"""x', "python"],
  ] as const) {
    expect(
      tokenize(code, lang)
        .map((t) => t.text)
        .join(""),
    ).toBe(code);
  }
});
