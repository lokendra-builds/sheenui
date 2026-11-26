import"./rolldown-runtime-WkwZ5CU-.js";import{i as e,t}from"./vendor-react-D30i__oY.js";import{n,t as r}from"./code-block-qWWZT6tc.js";import{i,n as a,o,r as s}from"./Page-ClekXXh-.js";import{t as c}from"./Example-jva669kg.js";import{t as l}from"./ShowcaseStage-qzIATPiV.js";import{t as u}from"./preload-helper-BrmCrVM7.js";var d=[[`onCopy`,`(ClipboardEventHandler<HTMLDivElement> & ((code: string) => void))`,``,`Called after a successful copy, with the copied text.`,!1],[`showLineNumbers`,`boolean`,`true when there is more than one line`,`Show line numbers.`,!1],[`startLineNumber`,`number`,`1`,`Number of the first line (for excerpts of a longer file).`,!1],[`highlightLines`,`LineSpec`,``,`Lines to highlight: [3, 4] or "3-4, 9". Rendered as <mark>.`,!1],[`addedLines`,`LineSpec`,``,'Marks added lines in a diff (green, "+", `<ins>`).',!1],[`removedLines`,`LineSpec`,``,'Marks removed lines in a diff (red, "−", `<del>`).',!1],[`wrap`,`boolean`,``,`Controlled wrapping of long lines.`,!1],[`defaultWrap`,`boolean`,`false`,`Sets the starting wrap state when uncontrolled.`,!1],[`onWrapChange`,`((wrap: boolean) => void)`,``,`Called with the new value when the wrap toggle is pressed.`,!1],[`showWrapToggle`,`boolean`,`true`,`Show the wrap toggle in the header.`,!1],[`copyable`,`boolean`,`true`,`Show the copy button.`,!1],[`maxHeight`,`string | number`,`"32rem"`,`Taller code scrolls inside. A number is px; "none" never limits it.`,!1],[`level`,`2 | 1 | 3`,`2`,`Glass level of the block (1 lightest, 3 most opaque).`,!1],[`labels`,`Partial<CodeBlockLabels>`,`defaultCodeBlockLabels`,'Every other string, for translation: `labels={{ copy: "…" }}`; omitted keys keep the English of `defaultCodeBlockLabels`. All 10 keys of `CodeBlockLabels` are listed in the key table under the props table.',!1,{type:`CodeBlockLabels`,const:`defaultCodeBlockLabels`,keys:[[`copy`,`Copy`],[`copyCode`,`Copy code`],[`copied`,`Copied`],[`copiedAnnouncement`,`Code copied to clipboard`],[`copyFailed`,`Copy failed`],[`copyFailedAnnouncement`,`Couldn't copy automatically. The code is selected: press Control C or Command C to copy it.`],[`wrap`,`Wrap long lines`],[`region`,`Code`],[`tabs`,`Files`],[`languages`,`{ ts: "TypeScript", tsx: "TSX", js: "JavaScript", jsx: "JSX", json: "JSON", css: "CSS", bash: "Shell", pyth...`]]}],[`code`,`string`,``,`The source. Leading blank lines and trailing whitespace are trimmed.`,!0],[`language`,`(string & {}) | CodeLanguage`,`"text"`,`ts, tsx, js, jsx, json, css, bash, python, html, text (or an alias like "typescript", "sh").`,!1],[`filename`,`ReactNode`,``,`File name shown as a tab in the header (e.g. "app/page.tsx").`,!1],[`icon`,`ReactNode`,`a file, or a terminal for shell`,`Icon before the file name (defaults to a file, or a terminal for shell).`,!1],[`header`,`boolean`,`true`,`Show the header bar (file name, language, wrap, copy). Without it, copy floats top-right.`,!1]],f=[[`onCopy`,`(ClipboardEventHandler<HTMLDivElement> & ((code: string) => void))`,``,`Called after a successful copy, with the copied text.`,!1],[`labels`,`Partial<CodeBlockLabels>`,`defaultCodeBlockLabels`,'Every other string, for translation: `labels={{ copy: "…" }}`; omitted keys keep the English of `defaultCodeBlockLabels`. All 10 keys of `CodeBlockLabels` are listed in the key table under the props table.',!1,{type:`CodeBlockLabels`,const:`defaultCodeBlockLabels`,keys:[[`copy`,`Copy`],[`copyCode`,`Copy code`],[`copied`,`Copied`],[`copiedAnnouncement`,`Code copied to clipboard`],[`copyFailed`,`Copy failed`],[`copyFailedAnnouncement`,`Couldn't copy automatically. The code is selected: press Control C or Command C to copy it.`],[`wrap`,`Wrap long lines`],[`region`,`Code`],[`tabs`,`Files`],[`languages`,`{ ts: "TypeScript", tsx: "TSX", js: "JavaScript", jsx: "JSX", json: "JSON", css: "CSS", bash: "Shell", pyth...`]]}],[`wrap`,`boolean`,``,`Controlled wrapping of long lines.`,!1],[`showLineNumbers`,`boolean`,`true when there is more than one line`,`Show line numbers.`,!1],[`startLineNumber`,`number`,`1`,`Number of the first line (for excerpts of a longer file).`,!1],[`defaultWrap`,`boolean`,`false`,`Sets the starting wrap state when uncontrolled.`,!1],[`onWrapChange`,`((wrap: boolean) => void)`,``,`Called with the new value when the wrap toggle is pressed.`,!1],[`showWrapToggle`,`boolean`,`true`,`Show the wrap toggle in the header.`,!1],[`copyable`,`boolean`,`true`,`Show the copy button.`,!1],[`maxHeight`,`string | number`,`"32rem"`,`Taller code scrolls inside. A number is px; "none" never limits it.`,!1],[`level`,`2 | 1 | 3`,`2`,`Glass level of the block (1 lightest, 3 most opaque).`,!1],[`files`,`CodeBlockFile[]`,``,`The tabs to show, in order.`,!0],[`value`,`string`,``,`Controlled active tab (a file label).`,!1],[`defaultValue`,`string`,`the first`,`Initially active tab when uncontrolled (defaults to the first).`,!1],[`onValueChange`,`((label: string) => void)`,``,`Called with the label of the tab that was just selected.`,!1]];e();var p=t(),m=`function total(items: Item[]) {
  return items.reduce((sum, i) => sum + i.price, 0);
}`,h=`function total(items: Item[]) {
  return items.reduce((sum, i) => sum + i.price, 0);
  return items.reduce((sum, i) => sum + i.price * i.qty, 0);
}`;function g({scene:e}){let t=e.phase===2;return(0,p.jsx)(`div`,{className:`sheen-stage-col sheen-stage-wide`,children:(0,p.jsx)(r,{className:`w-full text-start`,filename:`total.ts`,language:`ts`,code:t?h:m,highlightLines:e.phase===1?`2`:void 0,removedLines:t?`2`:void 0,addedLines:t?`3`:void 0},t?`after`:`before`)})}var _=`import { useState } from "react";
import { Button, GlassCard } from "@sheenui/theme";

type CounterProps = { start?: number; step?: number };

const clamp = <T extends number>(v: T, max: T) => Math.min(v, max); // local: the sample stays self-contained

/** A glass counter: the number springs on every click. */
export function Counter({ start = 0, step = 1 }: CounterProps) {
  const [count, setCount] = useState<number>(start);
  const label = \`Clicked \${count} times\`;

  return (
    <GlassCard className="flex items-center gap-4 p-6">
      <span aria-live="polite">{label}</span>
      <Button onClick={() => setCount((c) => c + step)}>Add {step}</Button>
    </GlassCard>
  );
}`,v=`export const spring = {
  snappy: { type: "spring", duration: 0.35, bounce: 0.15 },
  gentle: { type: "spring", duration: 0.5, bounce: 0.2 },
  bouncy: { type: "spring", duration: 0.5, bounce: 0.25 },
  bouncy: { type: "spring", duration: 0.5, bounce: 0.4 },
} as const;`,y=`/* Glass that keeps its blur: animate the glass itself. */
.toast {
  --lift: -4px;
  background: var(--sheen-glass-2-bg);
  backdrop-filter: blur(20px) saturate(180%);
  border-radius: 1.25rem;
  &:hover { translate: 0 var(--lift); }
}

@media (prefers-reduced-motion: reduce) {
  .toast:hover { translate: none !important; }
}`,b=`{
  "name": "@sheenui/theme",
  "version": "0.1.0",
  "private": true,
  "sideEffects": ["*.css"],
  "peerDependencies": { "react": ">=19.2" }
}`,x=`# install and run the docs
$ pnpm install --frozen-lockfile
$ PORT=5180 pnpm --filter demo dev | tee dev.log

cat <<EOF > .env.local
VITE_THEME=sheen
VITE_USER=$USER
EOF`,S=`from dataclasses import dataclass

@dataclass
class Swatch:
    """An OKLCH color with a WCAG check."""
    name: str
    lightness: float = 0.62

    def passes(self, ratio: float = 4.5) -> bool:
        return contrast(self, BACKGROUND) >= ratio  # AA body text`,C=`<!doctype html>
<html lang="en">
  <!-- glass needs something to blur -->
  <body class="sheen-backdrop">
    <div id="root"></div>
  </body>
</html>`;function w(){return(0,p.jsxs)(a,{eyebrow:`Data display`,title:`Code block`,description:`Syntax-highlighted code on glass with no highlighting dependency: a small built-in tokenizer for TS/TSX/JS, JSON, CSS, shell, Python and HTML. Line numbers, highlighted and diff lines, a file tab, copy with feedback and a wrap toggle. Long lines scroll inside the block, never the page, with the line numbers pinned. Code always reads left to right, even in right-to-left pages, and is never machine-translated.`,source:[`theme/src/components/code-block/code-block.tsx`,`theme/src/components/code-block/tokenize.ts`],children:[(0,p.jsx)(l,{label:`Code block demo`,story:()=>u(()=>import(`./ShowcaseStage.code-block-Bvnf0GWV.js`),[]),initial:{phase:0},minHeight:`18rem`,children:(e,t)=>(0,p.jsx)(g,{scene:e,ctx:t})}),(0,p.jsx)(c,{title:`A file with highlighted lines`,description:`highlightLines takes "10-11, 16" or an array. Highlighted lines are <mark>; numbers are left out of copy and of screen readers.`,variant:`bare`,code:`
import { CodeBlock } from "@sheenui/theme";

// The file's text: fetched, or imported with Vite's ?raw suffix.
declare const source: string;

export function Example() {
  return (
    <CodeBlock
      filename="components/counter.tsx"
      language="tsx"
      highlightLines="10-11, 16"
      code={source}
    />
  );
}`,children:(0,p.jsx)(r,{filename:`components/counter.tsx`,language:`tsx`,highlightLines:`10-11, 16`,code:_})}),(0,p.jsx)(c,{title:`Diff`,description:`addedLines and removedLines render as <ins> / <del> with + and − markers, so color is never the only signal.`,variant:`bare`,code:`
import { CodeBlock } from "@sheenui/theme";

// The file's text: fetched, or imported with Vite's ?raw suffix.
declare const source: string;

export function Example() {
  return (
    <CodeBlock
      filename="motion/tokens.ts"
      language="ts"
      startLineNumber={28}
      removedLines={[31]}
      addedLines={[32]}
      code={source}
    />
  );
}`,children:(0,p.jsx)(r,{filename:`motion/tokens.ts`,language:`ts`,startLineNumber:28,removedLines:[31],addedLines:[32],code:v})}),(0,p.jsx)(c,{title:`Tabs: commands and languages`,description:`CodeBlockTabs keeps several snippets in one block. The underline slides between tabs (transform only); copy and wrap act on the active one. When the tabs don't fit, the hidden edge fades and the list scrolls sideways.`,variant:`bare`,code:`
import { CodeBlockTabs } from "@sheenui/theme";

// File contents for the second group of tabs.
declare const css: string, json: string, bash: string, python: string, html: string;

export function Example() {
  return (
    <>
      <CodeBlockTabs
        labels={{ tabs: "Package manager" }}
        files={[
          { label: "pnpm", language: "bash", code: "pnpm add motion @base-ui/react" },
          { label: "npm", language: "bash", code: "npm install motion @base-ui/react" },
          { label: "yarn", language: "bash", code: "yarn add motion @base-ui/react" },
          { label: "bun", language: "bash", code: "bun add motion @base-ui/react" },
        ]}
      />

      <CodeBlockTabs
        files={[
          { label: "toast.css", language: "css", code: css, highlightLines: "7" },
          { label: "package.json", language: "json", code: json },
          { label: "dev.sh", language: "bash", code: bash },
          { label: "swatch.py", language: "python", code: python },
          { label: "index.html", language: "html", code: html },
        ]}
      />
    </>
  );
}`,children:(0,p.jsxs)(`div`,{className:`flex flex-col gap-5`,children:[(0,p.jsx)(n,{labels:{tabs:`Package manager`},files:[{label:`pnpm`,language:`bash`,code:`pnpm add motion @base-ui/react`},{label:`npm`,language:`bash`,code:`npm install motion @base-ui/react`},{label:`yarn`,language:`bash`,code:`yarn add motion @base-ui/react`},{label:`bun`,language:`bash`,code:`bun add motion @base-ui/react`}]}),(0,p.jsx)(n,{files:[{label:`toast.css`,language:`css`,code:y,highlightLines:`7`},{label:`package.json`,language:`json`,code:b},{label:`dev.sh`,language:`bash`,code:x},{label:`swatch.py`,language:`python`,code:S},{label:`index.html`,language:`html`,code:C}]})]})}),(0,p.jsx)(c,{title:`Long lines and no header`,description:`Unwrapped, a long line scrolls inside the block (it becomes keyboard-focusable only when it actually scrolls): the line numbers stay pinned and a fade at the end edge shows there is more. Toggle wrap in the header, or start wrapped with defaultWrap. Without a header, copy floats in the corner.`,variant:`bare`,code:`
import { CodeBlock } from "@sheenui/theme";

export function Example() {
  return (
    <>
      <CodeBlock
        language="tsx"
        filename="hero.tsx"
        code={\`<Button className="…a very long class list…">Get started</Button>\`}
      />
      <CodeBlock header={false} language="bash" code="npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/carousel.json" />
    </>
  );
}`,children:(0,p.jsxs)(`div`,{className:`flex flex-col gap-5`,children:[(0,p.jsx)(r,{language:`tsx`,filename:`hero.tsx`,code:`<Button size="lg" className="motion-ok:hover:-translate-y-0.5 shadow-[0_8px_24px_-10px_var(--sheen-shadow-far)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus" onClick={() => track("hero_cta", { variant: "primary", placement: "above-the-fold" })}>Get started</Button>`}),(0,p.jsx)(r,{header:!1,language:`bash`,code:`npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/carousel.json`})]})}),(0,p.jsx)(s,{title:`CodeBlock`,as:`h3`,of:d}),(0,p.jsx)(s,{title:`CodeBlockTabs`,as:`h3`,of:f}),(0,p.jsx)(s,{title:`Theming tokens`,as:`h3`,rows:[[`--sheen-code-keyword`,`color`,`tokens.css`,`Also: string, number, literal, function, type, tag, attr, property, variable, comment, punctuation.`],[`Defaults`,``,``,`Each >= 4.5:1 on the block's glass and on highlighted, added and removed lines, in light and dark. Override on the block or any ancestor.`]]}),(0,p.jsx)(o,{rows:[[`Tab`,`Reach the wrap toggle and the copy button.`],[`Enter / Space`,`Press the focused button.`],[`Arrow keys`,`Scroll the code once it is focused; it is focusable only when it actually scrolls.`],[`Arrow Left / Arrow Right, Home / End`,`CodeBlockTabs: move between file tabs.`]]}),(0,p.jsx)(i,{items:[`The code area is a named region ("Code: button.tsx"). Line numbers and diff markers are not read or copied; diff lines also carry +/- text.`,`Copy announces "Code copied" politely; if copying fails, the code is selected for manual copy.`,`Code is always left to right and translate="no". Syntax colors keep 4.5:1 on glass in light and dark.`]})]})}export{w as default};