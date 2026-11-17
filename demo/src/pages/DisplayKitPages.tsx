import { useEffect, useRef, useState, type ComponentProps } from "react";
import { Avatar, Badge, Button, GlassCard } from "@sheenui/theme";
import { Page, PropsTable } from "../layout/Page";
import { Example } from "../layout/Example";
import type { SkeletonScene as SkeletonSceneData } from "../layout/ShowcaseStage.skeleton";
import { SkeletonScene } from "../layout/ShowcaseStage.skeleton.scene";
import type { EmptyStateScene as EmptyStateSceneData } from "../layout/ShowcaseStage.empty-state";
import { EmptyStateScene } from "../layout/ShowcaseStage.empty-state.scene";
import { ShowcaseStage } from "../layout/ShowcaseStage";
import type { CodeBlockScene as CodeBlockSceneData } from "../layout/ShowcaseStage.code-block";
import { CodeBlockScene } from "../layout/ShowcaseStage.code-block.scene";
import { A11yNotes, KeyboardTable } from "./DocSections";
import {
  Skeleton,
  SkeletonCard,
  SkeletonCircle,
  SkeletonGroup,
  SkeletonList,
  SkeletonRect,
  SkeletonText,
} from "@sheenui/theme";
import { EmptyState } from "@sheenui/theme";
import { CodeBlock, CodeBlockTabs } from "@sheenui/theme";
import * as PROPS from "../generated/component-props";

/* ====================================================================== */
/* Shared demo bits                                                        */
/* ====================================================================== */

function Glyph({ children, ...props }: ComponentProps<"svg">) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-6"
      {...props}
    >
      {children}
    </svg>
  );
}

const FolderIcon = () => (
  <Glyph>
    <path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h3.6l2 2.2H18a2.5 2.5 0 0 1 2.5 2.5v7.8A2.5 2.5 0 0 1 18 20H6a2.5 2.5 0 0 1-2.5-2.5Z" />
    <path d="M12 11v5M9.5 13.5h5" />
  </Glyph>
);

const SearchIcon = () => (
  <Glyph>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.2-4.2M8.8 9l4.4 4.4M13.2 9l-4.4 4.4" />
  </Glyph>
);

const InboxIcon = () => (
  <Glyph>
    <path d="M3.5 13.5 6 5.8A2 2 0 0 1 7.9 4.5h8.2A2 2 0 0 1 18 5.8l2.5 7.7V18a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2Z" />
    <path d="M3.5 13.5h4.8l1.4 2.4h4.6l1.4-2.4h4.8" />
  </Glyph>
);

const CloudOffIcon = () => (
  <Glyph>
    <path d="M7 18.5h10.2a4 4 0 0 0 1-7.9 6 6 0 0 0-10.9-2.2A4.8 4.8 0 0 0 7 18.5Z" />
    <path d="m4 4 16 16" />
  </Glyph>
);

const PlusIcon = () => (
  <Glyph className="size-4">
    <path d="M12 5v14M5 12h14" />
  </Glyph>
);

/* ====================================================================== */
/* Skeleton                                                                */
/* ====================================================================== */

function LoadedCard() {
  return (
    <GlassCard className="flex w-full flex-col gap-5 p-5">
      <div
        aria-hidden
        className="aspect-video rounded-sheen-md [background:radial-gradient(60%_80%_at_20%_20%,var(--sheen-blob-1),transparent_70%),radial-gradient(60%_80%_at_80%_80%,var(--sheen-blob-2),transparent_70%),var(--sheen-accent-soft)]"
      />
      <div className="flex items-center gap-3">
        <Avatar name="Meera Iyer" />
        <div className="flex flex-col">
          <span className="text-sm font-semibold">Meera Iyer</span>
          <span className="text-xs text-sheen-fg-muted">Design lead · 4 min read</span>
        </div>
      </div>
      {/* Clamped to 3 lines, like its skeleton, at every width. */}
      <p className="line-clamp-3 text-sm text-sheen-fg-muted">
        Glass works when something colorful sits behind it and something crisp shows through. Here is how we tuned the
        blur, the lit rim, the grain and the shadow so cards stay legible over any backdrop, in light and dark, on
        phones and on wide screens.
      </p>
      <div className="flex gap-2.5">
        <Button size="sm">Read article</Button>
        <Button size="sm" variant="glass">
          Save
        </Button>
      </div>
    </GlassCard>
  );
}

const people = [
  ["Ravi Kumar", "Merged #482 · Fix focus ring on tabs", "Merged"],
  ["Asha Verma", "Opened #487 · Carousel loop mode", "Open"],
  ["Kabir Shah", "Reviewed #479 · Meter thresholds", "Review"],
  ["Sara Khan", "Closed #470 · Old tooltip API", "Closed"],
] as const;

function LoadedList() {
  return (
    <GlassCard className="flex w-full flex-col px-5 py-1">
      {people.map(([name, text, status]) => (
        <div key={name} className="flex items-center gap-3 border-b border-sheen-border py-4 last:border-0">
          <Avatar name={name} />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-semibold">{name}</span>
            <span className="truncate text-xs text-sheen-fg-muted">{text}</span>
          </div>
          <Badge
            tone={
              status === "Merged"
                ? "success"
                : status === "Open"
                  ? "accent"
                  : status === "Review"
                    ? "warning"
                    : "neutral"
            }
          >
            {status}
          </Badge>
        </div>
      ))}
    </GlassCard>
  );
}

/** The "Skeleton" docs page (/components/skeleton): live examples, props and notes. */
export function SkeletonPage() {
  const [loading, setLoading] = useState(true);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => {
    timer.current = window.setTimeout(() => setLoading(false), 2400);
    return () => window.clearTimeout(timer.current);
  }, []);
  const reload = () => {
    setLoading(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setLoading(false), 2400);
  };

  return (
    <Page
      eyebrow="Data display"
      title="Skeleton"
      description="Placeholders that hold the exact layout while content loads, so nothing jumps when it arrives. A band of light sweeps across each group in one beam (transform only); under reduced motion the shapes are simply still."
      source="theme/src/components/skeleton/skeleton.tsx"
    >
      <ShowcaseStage<SkeletonSceneData>
        label="Skeleton demo"
        story={() => import("../layout/ShowcaseStage.skeleton")}
        initial={{ loaded: false }}
        minHeight="24rem"
      >
        {(scene, ctx) => <SkeletonScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Presets"
        description="SkeletonCard and SkeletonList match a real card and list line for line: text skeletons use the same line boxes as the text (20px for 14px text), so nothing jumps when the content arrives. Each preset is one named loading region, never one label per line."
        controls={
          <Button size="sm" variant="glass" onClick={reload} loading={loading}>
            {loading ? "Loading" : "Reload"}
          </Button>
        }
        stageClassName="grid grid-cols-1 items-start gap-5 md:grid-cols-2"
        code={`
import { SkeletonCard, SkeletonList } from "@sheenui/theme";

export function Example({ loading }: { loading: boolean }) {
  return (
    <>
      {loading ? <SkeletonCard labels={{ loading: "Loading article" }} /> : <article>Your article card</article>}
      {loading ? <SkeletonList rows={4} labels={{ loading: "Loading activity" }} /> : <ul>Your activity list</ul>}
    </>
  );
}`}
      >
        <div className="w-full">
          {loading ? <SkeletonCard role="none" labels={{ loading: "Loading article" }} /> : <LoadedCard />}
        </div>
        <div className="w-full">
          {loading ? <SkeletonList role="none" rows={4} labels={{ loading: "Loading activity" }} /> : <LoadedList />}
        </div>
      </Example>

      <Example
        title="Building blocks"
        description="Compose your own from Skeleton (rect, text, pill, circle), SkeletonText, SkeletonCircle and SkeletonRect. Wrap them in SkeletonGroup: it names the loading region once, and one beam of light crosses the whole group, every shape in step wherever it sits."
        stageClassName="block"
        code={`
import { Skeleton, SkeletonCircle, SkeletonGroup, SkeletonRect, SkeletonText } from "@sheenui/theme";

export function Example() {
  return (
    <SkeletonGroup labels={{ loading: "Loading profile" }} className="glass-2 rounded-sheen-lg p-6">
      <div className="flex items-center gap-4">
        <SkeletonCircle size="xl" />
        <div className="flex flex-1 flex-col gap-3">
          <SkeletonText size="heading" lines={1} />
          <Skeleton shape="text" width="40%" />
        </div>
        <Skeleton shape="pill" width={96} />
      </div>
      <SkeletonRect height={140} className="mt-6" />
      <SkeletonText lines={2} size="sm" className="mt-5" />
    </SkeletonGroup>
  );
}`}
      >
        <SkeletonGroup
          role="none"
          labels={{ loading: "Loading profile" }}
          className="glass-2 mx-auto w-full max-w-2xl rounded-sheen-lg p-5 sm:p-6"
        >
          <div className="flex items-center gap-4">
            <SkeletonCircle size="xl" />
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <SkeletonText size="heading" lines={1} />
              <Skeleton shape="text" width="40%" />
            </div>
            <Skeleton shape="pill" width={96} className="hidden sm:block" />
          </div>
          <SkeletonRect height={140} className="mt-6" />
          <SkeletonText lines={2} size="sm" className="mt-5" />
        </SkeletonGroup>
      </Example>

      <PropsTable title="Skeleton" as="h3" of={PROPS.Skeleton} />
      <PropsTable title="SkeletonText" as="h3" of={PROPS.SkeletonText} />
      <PropsTable title="SkeletonCard / SkeletonList" as="h3" of={[PROPS.SkeletonCard, PROPS.SkeletonList]} />
      <PropsTable title="SkeletonGroup" as="h3" of={PROPS.SkeletonGroup} />
      <PropsTable of={PROPS.SkeletonCircle} title="SkeletonCircle props" as="h3" />
      <PropsTable of={PROPS.SkeletonRect} title="SkeletonRect props" as="h3" />
      <KeyboardTable rows={[["Tab", "Not focusable: skeletons are not focusable."]]} />
      <A11yNotes
        items={[
          'Shapes are aria-hidden. Wrap a loading region in SkeletonGroup, or give a preset its own label, so screen readers hear one polite "Loading…" instead of nothing.',
          "Remove the skeleton (and the status) as soon as content arrives so the real content is announced in its place.",
          'The live demos on this page pass role="none": a skeleton that is already on screen when the page loads should not be announced. Keep the status role for a skeleton that appears after a user action.',
          "One shared shimmer beam; it does not run under reduced motion.",
        ]}
      />
    </Page>
  );
}

/* ====================================================================== */
/* Empty state                                                             */
/* ====================================================================== */

export function EmptyStatePage() {
  const [query, setQuery] = useState("glassmorphism tokens");
  return (
    <Page
      eyebrow="Data display"
      title="Empty state"
      description="What a page, list or search shows when there is nothing in it yet, with one clear next step. A glass orb springs in over soft rings and a fading dot grid; a compact row variant fits tables and side panels."
      source="theme/src/components/empty-state/empty-state.tsx"
    >
      <ShowcaseStage<EmptyStateSceneData>
        label="Empty state demo"
        story={() => import("../layout/ShowcaseStage.empty-state")}
        initial={{ pressed: false, added: false }}
        minHeight="17rem"
      >
        {(scene, ctx) => <EmptyStateScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="First run"
        description="Full variant on a dashed outline: icon, title, description, a primary and a secondary action."
        code={`
import { Button, EmptyState } from "@sheenui/theme";
import { Folder as FolderIcon, Plus as PlusIcon } from "lucide-react";

export function Example() {
  return (
    <EmptyState
      surface="dashed"
      icon={<FolderIcon />}
      title="Create your first project"
      description="Projects keep your screens, tokens and assets together. Start from scratch or import a design file."
      action={<Button leading={<PlusIcon />}>New project</Button>}
      secondaryAction={<Button variant="glass">Import a file</Button>}
    />
  );
}`}
      >
        <EmptyState
          surface="dashed"
          className="w-full max-w-2xl"
          icon={<FolderIcon />}
          title="Create your first project"
          description="Projects keep your screens, tokens and assets together. Start from scratch or import a design file."
          action={<Button leading={<PlusIcon />}>New project</Button>}
          secondaryAction={<Button variant="glass">Import a file</Button>}
        />
      </Example>

      <Example
        title="No results"
        description="Neutral tone on a glass card. announce reads it out when a search comes back empty, through one status region that stays mounted (a region that mounts with its text is often skipped by screen readers)."
        code={`
import { useState } from "react";
import { Button, EmptyState } from "@sheenui/theme";
import { Search as SearchIcon } from "lucide-react";

export function Example() {
  const [query, setQuery] = useState("flrbl");

  return (
    <EmptyState
      announce
      surface="glass"
      tone="neutral"
      icon={<SearchIcon />}
      title={\`No results for “\${query}”\`}
      description="Check the spelling or try fewer words."
      action={<Button variant="glass" onClick={() => setQuery("")}>Clear search</Button>}
    />
  );
}`}
      >
        <EmptyState
          key={query}
          announce
          surface="glass"
          tone="neutral"
          className="w-full max-w-xl"
          icon={<SearchIcon />}
          title={query ? `No results for “${query}”` : "Search cleared"}
          description={query ? "Check the spelling or try fewer words." : "Type to search the docs again."}
          action={
            <Button variant="glass" onClick={() => setQuery(query ? "" : "glassmorphism tokens")}>
              {query ? "Clear search" : "Restore the search"}
            </Button>
          }
        />
      </Example>

      <Example
        title="Compact and error"
        description="Compact: one row for tables, inboxes and sidebars (it wraps on phones). Tones color the icon only; the words carry the meaning."
        stageClassName="flex-col items-stretch"
        code={`
import { Button, EmptyState } from "@sheenui/theme";
import { CloudOff as CloudOffIcon, Inbox as InboxIcon } from "lucide-react";

export function Example() {
  return (
    <>
      <EmptyState
        variant="compact"
        surface="glass"
        icon={<InboxIcon />}
        title="Inbox zero"
        description="New messages from your team show up here."
        action={<Button size="sm" variant="glass">Compose</Button>}
      />
      <EmptyState
        variant="compact"
        surface="glass"
        tone="danger"
        icon={<CloudOffIcon />}
        title="Couldn't load invoices"
        description="The server took too long to answer."
        action={<Button size="sm">Try again</Button>}
      />
    </>
  );
}`}
      >
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
          <EmptyState
            variant="compact"
            surface="glass"
            icon={<InboxIcon />}
            title="Inbox zero"
            description="New messages from your team show up here."
            action={
              <Button size="sm" variant="glass">
                Compose
              </Button>
            }
          />
          <EmptyState
            variant="compact"
            surface="glass"
            tone="danger"
            icon={<CloudOffIcon />}
            title="Couldn't load invoices"
            description="The server took too long to answer."
            action={<Button size="sm">Try again</Button>}
          />
        </div>
      </Example>

      <PropsTable of={PROPS.EmptyState} />
      <KeyboardTable
        rows={[
          [
            "Tab",
            "Not focusable: the block is not focusable. The buttons in action and secondaryAction are normal tab stops.",
          ],
        ]}
      />
      <A11yNotes
        items={[
          "Plain markup with a heading; the icon is decorative. Pass announce to tell screen readers when the state appears after a search or filter.",
          "Always offer a way forward (clear the filter, create the first item); do not leave an empty state without an action when one exists.",
        ]}
      />
    </Page>
  );
}

/* ====================================================================== */
/* Code block                                                              */
/* ====================================================================== */

const tsxSample = `import { useState } from "react";
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
}`;

const diffSample = `export const spring = {
  snappy: { type: "spring", duration: 0.35, bounce: 0.15 },
  gentle: { type: "spring", duration: 0.5, bounce: 0.2 },
  bouncy: { type: "spring", duration: 0.5, bounce: 0.25 },
  bouncy: { type: "spring", duration: 0.5, bounce: 0.4 },
} as const;`;

const cssSample = `/* Glass that keeps its blur: animate the glass itself. */
.toast {
  --lift: -4px;
  background: var(--sheen-glass-2-bg);
  backdrop-filter: blur(20px) saturate(180%);
  border-radius: 1.25rem;
  &:hover { translate: 0 var(--lift); }
}

@media (prefers-reduced-motion: reduce) {
  .toast:hover { translate: none !important; }
}`;

const jsonSample = `{
  "name": "@sheenui/theme",
  "version": "0.1.0",
  "private": true,
  "sideEffects": ["*.css"],
  "peerDependencies": { "react": ">=19.2" }
}`;

const bashSample = `# install and run the docs
$ pnpm install --frozen-lockfile
$ PORT=5180 pnpm --filter demo dev | tee dev.log

cat <<EOF > .env.local
VITE_THEME=sheen
VITE_USER=$USER
EOF`;

const pythonSample = `from dataclasses import dataclass

@dataclass
class Swatch:
    """An OKLCH color with a WCAG check."""
    name: str
    lightness: float = 0.62

    def passes(self, ratio: float = 4.5) -> bool:
        return contrast(self, BACKGROUND) >= ratio  # AA body text`;

const htmlSample = `<!doctype html>
<html lang="en">
  <!-- glass needs something to blur -->
  <body class="sheen-backdrop">
    <div id="root"></div>
  </body>
</html>`;

/** The "Code block" docs page (/components/code-block): live examples, props and notes. */
export function CodeBlockPage() {
  return (
    <Page
      eyebrow="Data display"
      title="Code block"
      description="Syntax-highlighted code on glass with no highlighting dependency: a small built-in tokenizer for TS/TSX/JS, JSON, CSS, shell, Python and HTML. Line numbers, highlighted and diff lines, a file tab, copy with feedback and a wrap toggle. Long lines scroll inside the block, never the page, with the line numbers pinned. Code always reads left to right, even in right-to-left pages, and is never machine-translated."
      source={["theme/src/components/code-block/code-block.tsx", "theme/src/components/code-block/tokenize.ts"]}
    >
      <ShowcaseStage<CodeBlockSceneData>
        label="Code block demo"
        story={() => import("../layout/ShowcaseStage.code-block")}
        initial={{ phase: 0 }}
        minHeight="18rem"
      >
        {(scene, ctx) => <CodeBlockScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="A file with highlighted lines"
        description='highlightLines takes "10-11, 16" or an array. Highlighted lines are <mark>; numbers are left out of copy and of screen readers.'
        variant="bare"
        code={`
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
}`}
      >
        <CodeBlock filename="components/counter.tsx" language="tsx" highlightLines="10-11, 16" code={tsxSample} />
      </Example>

      <Example
        title="Diff"
        description="addedLines and removedLines render as <ins> / <del> with + and − markers, so color is never the only signal."
        variant="bare"
        code={`
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
}`}
      >
        <CodeBlock
          filename="motion/tokens.ts"
          language="ts"
          startLineNumber={28}
          removedLines={[31]}
          addedLines={[32]}
          code={diffSample}
        />
      </Example>

      <Example
        title="Tabs: commands and languages"
        description="CodeBlockTabs keeps several snippets in one block. The underline slides between tabs (transform only); copy and wrap act on the active one. When the tabs don't fit, the hidden edge fades and the list scrolls sideways."
        variant="bare"
        code={`
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
}`}
      >
        <div className="flex flex-col gap-5">
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
              { label: "toast.css", language: "css", code: cssSample, highlightLines: "7" },
              { label: "package.json", language: "json", code: jsonSample },
              { label: "dev.sh", language: "bash", code: bashSample },
              { label: "swatch.py", language: "python", code: pythonSample },
              { label: "index.html", language: "html", code: htmlSample },
            ]}
          />
        </div>
      </Example>

      <Example
        title="Long lines and no header"
        description="Unwrapped, a long line scrolls inside the block (it becomes keyboard-focusable only when it actually scrolls): the line numbers stay pinned and a fade at the end edge shows there is more. Toggle wrap in the header, or start wrapped with defaultWrap. Without a header, copy floats in the corner."
        variant="bare"
        code={`
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
}`}
      >
        <div className="flex flex-col gap-5">
          <CodeBlock
            language="tsx"
            filename="hero.tsx"
            code={`<Button size="lg" className="motion-ok:hover:-translate-y-0.5 shadow-[0_8px_24px_-10px_var(--sheen-shadow-far)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus" onClick={() => track("hero_cta", { variant: "primary", placement: "above-the-fold" })}>Get started</Button>`}
          />
          <CodeBlock
            header={false}
            language="bash"
            code="npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/carousel.json"
          />
        </div>
      </Example>

      <PropsTable title="CodeBlock" as="h3" of={PROPS.CodeBlock} />
      <PropsTable title="CodeBlockTabs" as="h3" of={PROPS.CodeBlockTabs} />
      <PropsTable
        title="Theming tokens"
        as="h3"
        rows={[
          [
            "--sheen-code-keyword",
            "color",
            "tokens.css",
            "Also: string, number, literal, function, type, tag, attr, property, variable, comment, punctuation.",
          ],
          [
            "Defaults",
            "",
            "",
            "Each >= 4.5:1 on the block's glass and on highlighted, added and removed lines, in light and dark. Override on the block or any ancestor.",
          ],
        ]}
      />
      <KeyboardTable
        rows={[
          ["Tab", "Reach the wrap toggle and the copy button."],
          ["Enter / Space", "Press the focused button."],
          ["Arrow keys", "Scroll the code once it is focused; it is focusable only when it actually scrolls."],
          ["Arrow Left / Arrow Right, Home / End", "CodeBlockTabs: move between file tabs."],
        ]}
      />
      <A11yNotes
        items={[
          'The code area is a named region ("Code: button.tsx"). Line numbers and diff markers are not read or copied; diff lines also carry +/- text.',
          'Copy announces "Code copied" politely; if copying fails, the code is selected for manual copy.',
          'Code is always left to right and translate="no". Syntax colors keep 4.5:1 on glass in light and dark.',
        ]}
      />
    </Page>
  );
}
