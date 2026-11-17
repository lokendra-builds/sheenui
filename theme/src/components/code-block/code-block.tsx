"use client";

import { useLayoutEffect, useMemo, useRef, useState, type ComponentProps, type ReactNode } from "react";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { motion } from "motion/react";

import { cn } from "../../lib/cn";
import { useControllable } from "../../hooks/use-controllable";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { spring } from "../../motion/tokens";
import { resolveLanguage, type CodeLanguage } from "./tokenize";
import { isRtlAt } from "../../hooks/use-direction";

import {
  type CodeBlockLabels,
  defaultCodeBlockLabels,
  type LineSpec,
  parseLineSpec,
  type CodeBlockProps,
  languageDot,
  trimCode,
  type CopyState,
  useCopy,
  FileIcon,
  TerminalIcon,
  CopyButton,
  WrapToggle,
  CodeBody,
  type SharedProps,
  useWrap,
} from "./parts/pieces";

export {
  type CodeBlockLabels,
  defaultCodeBlockLabels,
  type LineSpec,
  parseLineSpec,
  type CodeBlockProps,
} from "./parts/pieces";
/**
 * Syntax-highlighted code on glass, with no highlighting dependency (a small built-in tokenizer
 * for ts, tsx, js, jsx, json, css, bash, python and html). Use it for snippets, install commands
 * and diffs; use {@link CodeBlockTabs} for several files or package managers.
 *
 * Props: see {@link CodeBlockProps} (`code` required, `language` "text", `filename`, `icon`,
 * `header` true, `showLineNumbers`, `startLineNumber` 1, `highlightLines`, `addedLines`,
 * `removedLines`, `wrap` / `defaultWrap` / `onWrapChange`, `showWrapToggle` true, `copyable` true,
 * `onCopy`, `maxHeight` "32rem", `level` 2, `labels`, `className`).
 *
 * Keyboard: Tab reaches the wrap toggle and the copy button (Enter or Space presses them). The code area becomes focusable only when it actually scrolls, so arrow keys can scroll it.
 * Accessibility: The code area is a named, keyboard-focusable group ("Code: button.tsx") while it scrolls; line numbers and diff markers are excluded from copy and from screen readers, and diff lines also carry +/- text so colour is never the only signal. Copy announces "Code copied" politely; if copying fails the code is selected for manual copy. Code is always left to right and marked `translate="no"`. Syntax colours are tokens that keep 4.5:1 on glass in light and dark; forced colors get a Highlight bar for marked lines.
 * Glass: One glass surface (`level` 1 to 3), no nested blur.
 * Motion: The "Copied" feedback swaps with a short fade; reduced motion removes the animation.
 *
 * @example
 * ```tsx
 * import { CodeBlock } from "@sheenui/theme";
 *
 * export const Snippet = () => (
 *   <CodeBlock
 *     filename="button.tsx"
 *     language="tsx"
 *     highlightLines="2"
 *     code={`import { Button } from "@sheenui/theme";
<Button>Save</Button>`}
 *   />
 * );
 * ```
 *
 * @see /components/code-block
 */
export function CodeBlock({
  code: rawCode,
  language: rawLanguage = "text",
  filename,
  icon,
  header = true,
  showLineNumbers,
  startLineNumber = 1,
  highlightLines,
  addedLines,
  removedLines,
  wrap: wrapProp,
  defaultWrap = false,
  onWrapChange,
  showWrapToggle = true,
  copyable = true,
  onCopy,
  maxHeight = "32rem",
  level = 2,
  labels: labelsProp,
  className,
  style,
  ...props
}: CodeBlockProps) {
  const labels = {
    ...defaultCodeBlockLabels,
    ...labelsProp,
    languages: { ...defaultCodeBlockLabels.languages, ...labelsProp?.languages },
  };
  const language = resolveLanguage(rawLanguage);
  const code = useMemo(() => trimCode(rawCode), [rawCode]);
  const lineCount = useMemo(() => code.split("\n").length, [code]);
  const [wrap, toggleWrap] = useWrap(wrapProp, defaultWrap, onWrapChange);
  const [copyState, copy] = useCopy(onCopy);
  const codeEl = useRef<HTMLElement | null>(null);
  const languageName = labels.languages[language] ?? language;
  const regionLabel = `${labels.region}: ${typeof filename === "string" ? filename : languageName}`;

  const highlight = useMemo(() => parseLineSpec(highlightLines), [highlightLines]);
  const added = useMemo(() => parseLineSpec(addedLines), [addedLines]);
  const removed = useMemo(() => parseLineSpec(removedLines), [removedLines]);

  return (
    <div
      data-slot="code-block"
      data-language={language}
      style={style}
      className={cn(`glass-${level}`, "relative flex min-w-0 flex-col rounded-sheen-lg text-sheen-fg", className)}
      {...props}
    >
      {header ? (
        <div className="@container flex h-11 shrink-0 items-center gap-1 border-b border-sheen-border ps-2 pe-1.5">
          {filename ? (
            <FileTab icon={icon ?? (language === "bash" ? <TerminalIcon /> : <FileIcon />)}>{filename}</FileTab>
          ) : (
            language !== "text" && (
              <span className="flex min-w-0 items-center gap-2 ps-2 text-xs font-medium text-sheen-fg-muted">
                <span
                  aria-hidden
                  className="size-2 shrink-0 rounded-full forced-colors:hidden"
                  style={{ background: languageDot[language] }}
                />
                {languageName}
              </span>
            )
          )}
          <span className="flex-1" />
          {filename && language !== "text" && (
            <span className="hidden items-center gap-1.5 pe-1.5 text-2xs font-medium tracking-wide text-sheen-fg-subtle uppercase @min-[32rem]:flex">
              <span
                aria-hidden
                className="size-1.5 rounded-full forced-colors:hidden"
                style={{ background: languageDot[language] }}
              />
              {languageName}
            </span>
          )}
          <HeaderActions>
            {showWrapToggle && <WrapToggle wrap={wrap} onToggle={toggleWrap} label={labels.wrap} />}
            {copyable && <CopyButton state={copyState} onClick={() => copy(code, codeEl.current)} labels={labels} />}
          </HeaderActions>
        </div>
      ) : (
        copyable && (
          // Top-right of the code (which always reads left to right), clear of its first line.
          <div className="absolute top-2 right-2 z-10">
            <CopyButton state={copyState} onClick={() => copy(code, codeEl.current)} labels={labels} compact />
          </div>
        )
      )}
      <CodeBody
        code={code}
        language={language}
        wrap={wrap}
        showLineNumbers={showLineNumbers ?? lineCount > 1}
        startLineNumber={startLineNumber}
        highlight={highlight}
        added={added}
        removed={removed}
        maxHeight={maxHeight}
        regionLabel={regionLabel}
        codeRef={(el) => {
          codeEl.current = el;
        }}
        className={cn(!header && copyable && "[&_pre]:pr-12", !header && "rounded-t-[inherit]")}
      />
      <CopyAnnouncer state={copyState} labels={labels} />
    </div>
  );
}

/** The file tab: an editor-style tab with a gradient underline on the header's border. */
function FileTab({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span
      className={cn(
        "relative flex h-8 min-w-0 items-center gap-2 rounded-sheen-sm bg-sheen-hover px-3 font-sheen-mono text-xs text-sheen-fg",
        "after:absolute after:inset-x-2 after:-bottom-[7px] after:h-0.5 after:rounded-full after:bg-(image:--sheen-accent-gradient)",
        "forced-colors:after:bg-[Highlight]",
      )}
    >
      <span className="text-sheen-fg-subtle">{icon}</span>
      <span translate="no" className="truncate">
        {children}
      </span>
    </span>
  );
}

/** Wrap and copy. On touch screens the gap keeps their 44px hit areas from overlapping. */
function HeaderActions({ children }: { children: ReactNode }) {
  return <div className="flex shrink-0 items-center gap-1 any-pointer-coarse:gap-3">{children}</div>;
}

function CopyAnnouncer({ state, labels }: { state: CopyState; labels: CodeBlockLabels }) {
  return (
    <span role="status" className="sr-only">
      {state === "copied" ? labels.copiedAnnouncement : state === "failed" ? labels.copyFailedAnnouncement : ""}
    </span>
  );
}

/* ---------- CodeBlockTabs ---------- */

/** One tab of {@link CodeBlockTabs}. */
export type CodeBlockFile = {
  /** Tab label, e.g. "pnpm" or "button.tsx". Must be unique within the block. */
  label: string;
  /** The source shown in this tab. */
  code: string;
  /** Language of this tab (see {@link CodeBlockProps} `language`). */
  language?: CodeLanguage | (string & {});
  /** Optional icon before the label. */
  icon?: ReactNode;
  /** Lines to highlight in this tab: [3, 4] or "3-4, 9". */
  highlightLines?: LineSpec;
  /** Diff: added lines in this tab. */
  addedLines?: LineSpec;
  /** Diff: removed lines in this tab. */
  removedLines?: LineSpec;
};

/** Props of {@link CodeBlockTabs}. The attributes of a `div` and the shared {@link CodeBlockProps} options (wrap, copy, line numbers, `level`, `labels`). */
export type CodeBlockTabsProps = Omit<ComponentProps<"div">, "children" | "defaultValue"> &
  Omit<SharedProps, "highlightLines" | "addedLines" | "removedLines"> & {
    /** The tabs to show, in order. */
    files: CodeBlockFile[];
    /** Controlled active tab (a file label). */
    value?: string;
    /** Initially active tab when uncontrolled (defaults to the first). */
    defaultValue?: string;
    /** Called with the label of the tab that was just selected. */
    onValueChange?: (label: string) => void;
  };

/**
 * Several files (or one command for several package managers) in one block. Tabs are
 * Base UI Tabs (arrow keys move between them); copy and wrap act on the active file.
 *
 * Props: see {@link CodeBlockTabsProps} (`files` required, `value` / `defaultValue` /
 * `onValueChange`, `labels.tabs` "Files" (the tab list's accessible name), plus the shared wrap, copy, line-number and `level` options).
 *
 * Keyboard: Tab enters the tab list; Left / Right move between tabs, Home / End jump to the first / last. Copy and wrap buttons follow the tabs in the tab order.
 * Accessibility: A `tablist` named by `labels.tabs` with one `tabpanel` per file; the code area has the same group name and copy announcements as {@link CodeBlock}. A fade marks tabs hidden off the edge of the list.
 * Glass: One glass surface, same as {@link CodeBlock}.
 * Motion: The active-tab underline glides between tabs; reduced motion jumps it.
 *
 * @example
 * ```tsx
 * import { CodeBlockTabs } from "@sheenui/theme";
 *
 * export const Install = () => (
 *   <CodeBlockTabs
 *     labels={{ tabs: "Package manager" }}
 *     files={[
 *       { label: "pnpm", language: "bash", code: "pnpm add @sheenui/theme" },
 *       { label: "npm", language: "bash", code: "npm install @sheenui/theme" },
 *     ]}
 *   />
 * );
 * ```
 *
 * @see /components/code-block
 */
export function CodeBlockTabs({
  files,
  value: valueProp,
  defaultValue,
  onValueChange,
  showLineNumbers,
  startLineNumber = 1,
  wrap: wrapProp,
  defaultWrap = false,
  onWrapChange,
  showWrapToggle = true,
  copyable = true,
  onCopy,
  maxHeight = "32rem",
  level = 2,
  labels: labelsProp,
  className,
  style,
  ...props
}: CodeBlockTabsProps) {
  const labels = {
    ...defaultCodeBlockLabels,
    ...labelsProp,
    languages: { ...defaultCodeBlockLabels.languages, ...labelsProp?.languages },
  };
  const [value, setValue] = useControllable(valueProp, defaultValue ?? files[0]?.label ?? "", onValueChange);
  const active = files.find((f) => f.label === value) ?? files[0];
  const [wrap, toggleWrap] = useWrap(wrapProp, defaultWrap, onWrapChange);
  const [copyState, copy] = useCopy(onCopy);
  const codeEl = useRef<HTMLElement | null>(null);
  const reduced = useSheenReducedMotion();

  /* The underline under the active tab, and which edges of the tab list hide more tabs. */
  const listRef = useRef<HTMLDivElement>(null);
  const [bar, setBar] = useState<{ left: number; width: number } | null>(null);
  const [hidden, setHidden] = useState({ left: false, right: false });
  const activeLabel = active?.label;

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const tab = list.querySelector<HTMLElement>("[role=tab][data-active]");
      setBar((old) =>
        tab && (old?.left !== tab.offsetLeft || old.width !== tab.offsetWidth)
          ? { left: tab.offsetLeft, width: tab.offsetWidth }
          : old,
      );
      // scrollLeft runs negative in right-to-left pages.
      const max = list.scrollWidth - list.clientWidth;
      const rtl = isRtlAt(list);
      const fromStart = Math.abs(list.scrollLeft);
      const left = max > 1 && (rtl ? max - fromStart > 1 : fromStart > 1);
      const right = max > 1 && (rtl ? fromStart > 1 : max - fromStart > 1);
      setHidden((old) => (old.left === left && old.right === right ? old : { left, right }));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    list.addEventListener("scroll", measure, { passive: true });
    return () => {
      observer.disconnect();
      list.removeEventListener("scroll", measure);
    };
  }, [activeLabel, files.length]);

  if (!active) return null;

  // Fade the edge(s) of the tab list that hide more tabs (a mask on the list itself: no glass inside).
  const fade = "1.75rem";
  const mask =
    hidden.left && hidden.right
      ? `linear-gradient(to right, transparent, black ${fade}, black calc(100% - ${fade}), transparent)`
      : hidden.left
        ? `linear-gradient(to right, transparent, black ${fade})`
        : hidden.right
          ? `linear-gradient(to left, transparent, black ${fade})`
          : undefined;

  return (
    <div
      data-slot="code-block"
      style={style}
      className={cn(`glass-${level}`, "relative flex min-w-0 flex-col rounded-sheen-lg text-sheen-fg", className)}
      {...props}
    >
      <BaseTabs.Root
        value={active.label}
        onValueChange={(next) => {
          if (typeof next !== "string") return;
          setValue(next);
        }}
        className="flex min-w-0 flex-col rounded-[inherit]"
      >
        {/* 45 px on coarse pointers: the bottom border takes 1 px of the box, and the scrolling tab list clips its tabs'
            44 px hit areas to the content height, so the header grows by that pixel on touch. */}
        <div className="@container flex h-11 shrink-0 items-center gap-1 border-b border-sheen-border ps-1.5 pe-1.5 any-pointer-coarse:h-[2.8125rem]">
          <BaseTabs.List
            ref={listRef}
            aria-label={labels.tabs}
            data-overflow={hidden.left || hidden.right || undefined}
            style={{ maskImage: mask, WebkitMaskImage: mask }}
            className={cn(
              "relative flex h-full min-w-0 items-center gap-0.5 overflow-x-auto overscroll-x-contain",
              "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
              // A tab focused by keyboard scrolls fully clear of the fades.
              "scroll-px-8",
            )}
          >
            {files.map((file) => (
              <BaseTabs.Tab
                key={file.label}
                value={file.label}
                translate="no"
                className={cn(
                  "relative inline-flex h-8 shrink-0 items-center gap-2 rounded-sheen-sm px-3 font-sheen-mono text-xs whitespace-nowrap",
                  "text-sheen-fg-muted select-none hover:text-sheen-fg data-active:text-sheen-fg",
                  "motion-ok:transition-colors motion-ok:duration-(--sheen-duration-fast)",
                  "hover:bg-sheen-hover data-active:bg-sheen-hover",
                  "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sheen-focus",
                  "touch-manipulation any-pointer-coarse:after:absolute any-pointer-coarse:after:inset-x-0 any-pointer-coarse:after:top-1/2 any-pointer-coarse:after:h-11 any-pointer-coarse:after:-translate-y-1/2",
                  "forced-colors:data-active:underline forced-colors:data-active:decoration-2",
                )}
              >
                {file.icon && <span className="text-sheen-fg-subtle">{file.icon}</span>}
                {file.label}
              </BaseTabs.Tab>
            ))}
            {/*
              The gradient underline slides between tabs on the header border. A fixed 100px bar,
              moved with x and sized with scaleX: transform only, never width.
            */}
            {bar && (
              <motion.span
                aria-hidden
                initial={false}
                animate={{ x: bar.left, scaleX: bar.width / 100 }}
                transition={reduced ? { duration: 0 } : spring.snappy}
                className="pointer-events-none absolute bottom-[-1px] left-0 h-0.5 w-[100px] origin-left rounded-full bg-(image:--sheen-accent-gradient) forced-colors:bg-[Highlight]"
              />
            )}
          </BaseTabs.List>
          <span className="flex-1" />
          <HeaderActions>
            {showWrapToggle && <WrapToggle wrap={wrap} onToggle={toggleWrap} label={labels.wrap} />}
            {copyable && (
              <CopyButton
                state={copyState}
                onClick={() => copy(trimCode(active.code), codeEl.current)}
                labels={labels}
              />
            )}
          </HeaderActions>
        </div>
        {files.map((file) => {
          const language = resolveLanguage(file.language);
          const code = trimCode(file.code);
          return (
            <BaseTabs.Panel
              key={file.label}
              value={file.label}
              className="min-w-0 rounded-b-[inherit] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sheen-focus"
            >
              <CodeBody
                code={code}
                language={language}
                wrap={wrap}
                showLineNumbers={showLineNumbers ?? code.split("\n").length > 1}
                startLineNumber={startLineNumber}
                highlight={parseLineSpec(file.highlightLines)}
                added={parseLineSpec(file.addedLines)}
                removed={parseLineSpec(file.removedLines)}
                maxHeight={maxHeight}
                regionLabel={`${labels.region}: ${file.label}`}
                codeRef={(el) => {
                  if (file.label === active.label) codeEl.current = el;
                }}
              />
            </BaseTabs.Panel>
          );
        })}
      </BaseTabs.Root>
      <CopyAnnouncer state={copyState} labels={labels} />
    </div>
  );
}
