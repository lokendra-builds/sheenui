"use client";

import { AlertIcon, CheckIcon, CopyIcon } from "../../status-icons/icons";
import { useCallback, useEffect, useMemo, useRef, useState, type ComponentProps, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "../../../lib/cn";
import { useControllable } from "../../../hooks/use-controllable";
import { useSheenReducedMotion } from "../../../hooks/use-preferences";
import { duration, spring } from "../../../motion/tokens";
import { exitTransition } from "../../../motion/presets";
import { Button } from "../../button/button";
import { splitLines, tokenize, type CodeLanguage, type Token, type TokenKind } from "../tokenize";

/**
 * CodeBlock: syntax-highlighted code on glass, with no highlighting dependency.
 *
 *   <CodeBlock filename="button.tsx" language="tsx" code={source} highlightLines="3-5" />
 *
 * - Highlighting: a small built-in tokenizer (./tokenize.ts) for ts, tsx, js, jsx, json,
 *   css, bash, python and html. Colours are the theme's --sheen-code-* tokens (keyword,
 *   string, number, literal, function, type, tag, attr, property, variable, comment,
 *   punctuation), each >= 4.5:1 on glass in light and dark; override any of them on the
 *   block or an ancestor.
 * - Line numbers, highlighted lines (<mark>), added / removed lines (<ins> / <del>, with
 *   +/− markers so colour is never the only signal). Numbers and markers are excluded from
 *   copy and from screen readers.
 * - Copy button with "Copied" feedback (and a polite announcement); falls back to
 *   execCommand, then to selecting the code so the user can copy it themselves.
 * - Wrap toggle. Unwrapped, long lines scroll inside the block (never the page); the scroll
 *   area becomes keyboard-focusable only when it actually scrolls. Line numbers stay put
 *   while it scrolls sideways, and a fade at the end edge says there is more.
 * - Code is always laid out left to right (dir="ltr", also inside right-to-left pages) and
 *   marked translate="no"; the header follows the page direction.
 * - CodeBlockTabs: several files or commands (pnpm / npm / yarn) in one block.
 *
 * Forced colors: highlighted lines get a Highlight bar; diff markers stay as text.
 */

/* ---------- Labels ---------- */

/** Every UI string of {@link CodeBlock}; pass a partial through its `labels` prop to translate it. */
export type CodeBlockLabels = {
  /** Visible copy button text. */
  copy: string;
  /** Sets the accessible name of the copy button. */
  copyCode: string;
  /** Visible text after a successful copy. */
  copied: string;
  /** Announced after a successful copy. */
  copiedAnnouncement: string;
  /** Visible text when copying failed (the code is then selected for manual copy). */
  copyFailed: string;
  /** Announced when copying failed. */
  copyFailedAnnouncement: string;
  /** Accessible name of the wrap toggle. */
  wrap: string;
  /** Accessible name prefix of the scrollable code area, e.g. "Code" → "Code: app.tsx". */
  region: string;
  /** Accessible name of the tab list of {@link CodeBlockTabs}, e.g. "Package manager". */
  tabs: string;
  /** Language names shown in the header, by language. */
  languages: Partial<Record<CodeLanguage, string>>;
};

/** The English strings of {@link CodeBlock} and {@link CodeBlockTabs}. Spread it to build your own set. */
export const defaultCodeBlockLabels: CodeBlockLabels = {
  copy: "Copy",
  copyCode: "Copy code",
  copied: "Copied",
  copiedAnnouncement: "Code copied to clipboard",
  copyFailed: "Copy failed",
  copyFailedAnnouncement: "Couldn't copy automatically. The code is selected: press Control C or Command C to copy it.",
  wrap: "Wrap long lines",
  region: "Code",
  tabs: "Files",
  languages: {
    ts: "TypeScript",
    tsx: "TSX",
    js: "JavaScript",
    jsx: "JSX",
    json: "JSON",
    css: "CSS",
    bash: "Shell",
    python: "Python",
    html: "HTML",
    text: "Text",
  },
};

/* ---------- Colours ---------- */

/*
 * Token colours come straight from the theme's --sheen-code-* tokens (tokens.css): each keeps
 * >= 4.5:1 on the block's glass and on highlighted / added / removed lines, light and dark.
 * Override any of them on the block (style / className) or on an ancestor.
 */
/** The colour class of each syntax token kind. @internal */
export const tokenClass: Record<TokenKind, string | undefined> = {
  plain: undefined,
  comment: "text-(--sheen-code-comment) italic",
  keyword: "text-(--sheen-code-keyword)",
  string: "text-(--sheen-code-string)",
  number: "text-(--sheen-code-number)",
  literal: "text-(--sheen-code-literal)",
  function: "text-(--sheen-code-function)",
  type: "text-(--sheen-code-type)",
  tag: "text-(--sheen-code-tag)",
  attr: "text-(--sheen-code-attr) italic",
  property: "text-(--sheen-code-property)",
  variable: "text-(--sheen-code-variable)",
  punctuation: "text-(--sheen-code-punctuation)",
};

/** Decorative language dot in the header (not text, so a chart slot colour is fine). */
export const languageDot: Record<CodeLanguage, string> = {
  ts: "var(--sheen-chart-7)",
  tsx: "var(--sheen-chart-7)",
  js: "var(--sheen-chart-4)",
  jsx: "var(--sheen-chart-4)",
  json: "var(--sheen-chart-2)",
  css: "var(--sheen-chart-1)",
  bash: "var(--sheen-chart-6)",
  python: "var(--sheen-chart-3)",
  html: "var(--sheen-chart-8)",
  text: "var(--sheen-fg-subtle)",
};

/* ---------- Line specs ---------- */

/** Line numbers as an array, or a string like "1, 4-6". Numbers are 1-based in the snippet. */
export type LineSpec = number[] | string;

/**
 * Turn a {@link LineSpec} ("1, 4-6" or `[1, 4, 5, 6]`) into a set of 1-based line numbers. Not a
 * component: pure function with no DOM, keyboard or screen-reader behaviour.
 *
 * @see /components/code-block
 */
export function parseLineSpec(spec: LineSpec | undefined): Set<number> {
  const lines = new Set<number>();
  if (!spec) return lines;
  if (Array.isArray(spec)) {
    spec.forEach((n) => lines.add(n));
    return lines;
  }
  for (const part of spec.split(",")) {
    const [a, b] = part.split("-").map((n) => Number.parseInt(n.trim(), 10));
    if (a === undefined || Number.isNaN(a)) continue;
    const end = b === undefined || Number.isNaN(b) ? a : b;
    for (let n = Math.min(a, end); n <= Math.max(a, end); n++) lines.add(n);
  }
  return lines;
}

/** Drop blank lines at the start and whitespace at the end (template literals in JSX). */
export function trimCode(code: string) {
  return code.replace(/^(?:[ \t]*\r?\n)+/, "").replace(/\s+$/, "");
}

/* ---------- Copy ---------- */

/** The state of the copy button: idle, copied or failed. @internal */
export type CopyState = "idle" | "copied" | "failed";

/** Writes text to the clipboard, falling back to a hidden textarea. @internal */
export async function writeClipboard(text: string) {
  try {
    // Missing on insecure origins, although the DOM types say it always exists.
    const clipboard = (navigator as Partial<Navigator>).clipboard;
    if (clipboard && window.isSecureContext) {
      await clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the legacy path */
  }
  // Legacy fallback (insecure origins, some embedded webviews).
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  area.style.pointerEvents = "none";
  document.body.appendChild(area);
  area.select();
  let ok: boolean;
  try {
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- the only way to copy in an insecure context (no async Clipboard API there)
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  area.remove();
  return ok;
}

/** Select the code's text so the user can copy it by hand. */
export function selectContents(el: HTMLElement | null) {
  if (!el) return;
  const selection = window.getSelection();
  if (!selection) return;
  const range = document.createRange();
  range.selectNodeContents(el);
  selection.removeAllRanges();
  selection.addRange(range);
}

/** Copy state and a `copy` callback that resets the state after a moment. @internal */
export function useCopy(onCopy?: (code: string) => void) {
  const [state, setState] = useState<CopyState>("idle");
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = useCallback(
    async (text: string, codeEl: HTMLElement | null) => {
      const ok = await writeClipboard(text);
      window.clearTimeout(timer.current);
      setState(ok ? "copied" : "failed");
      if (ok) onCopy?.(text);
      else selectContents(codeEl);
      timer.current = window.setTimeout(() => setState("idle"), ok ? 2000 : 4000);
    },
    [onCopy],
  );
  return [state, copy] as const;
}

/* ---------- Icons ---------- */

/** The shared stroke SVG frame of the code block icons. @internal */
export function Icon({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-4 shrink-0", className)}
    >
      {children}
    </svg>
  );
}

/** The icon of the wrap-lines toggle. @internal */
export const WrapIcon = () => (
  <Icon>
    <path d="M4 6h16M4 12h13a3 3 0 0 1 0 6h-4" />
    <path d="m15 16-2 2 2 2M4 18h5" />
  </Icon>
);

/** The file icon of a titled block. @internal */
export const FileIcon = () => (
  <Icon className="size-3.5">
    <path d="M14 3.5H7A2.5 2.5 0 0 0 4.5 6v12A2.5 2.5 0 0 0 7 20.5h10a2.5 2.5 0 0 0 2.5-2.5V9L14 3.5Z" />
    <path d="M14 3.5V9h5.5" />
  </Icon>
);

/** The terminal icon of a shell block. @internal */
export const TerminalIcon = () => (
  <Icon className="size-3.5">
    <path d="m5 8 4 4-4 4M12 17h7" />
  </Icon>
);

/* ---------- Pieces ---------- */

/** The copy-to-clipboard button. @internal */
export function CopyButton({
  state,
  onClick,
  labels,
  compact,
}: {
  state: CopyState;
  onClick: () => void;
  labels: CodeBlockLabels;
  compact?: boolean;
}) {
  const reduced = useSheenReducedMotion();
  const icon =
    state === "copied" ? (
      <CheckIcon strokeWidth={1.8} className="size-4 shrink-0" />
    ) : state === "failed" ? (
      <AlertIcon strokeWidth={1.8} className="size-4 shrink-0" />
    ) : (
      <CopyIcon strokeWidth={1.8} className="size-4 shrink-0" />
    );
  // The accessible name follows the visible word (WCAG 2.5.3): "Copy code" → "Copied" → "Copy failed".
  const name = state === "copied" ? labels.copied : state === "failed" ? labels.copyFailed : labels.copyCode;
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      aria-label={name}
      data-state={state}
      className={cn(
        "h-8 min-w-8 gap-1.5 px-2 text-sheen-fg-muted hover:text-sheen-fg @min-[22rem]:px-2.5",
        state === "copied" && "text-sheen-success-text hover:text-sheen-success-text",
        state === "failed" && "text-sheen-warning-text hover:text-sheen-warning-text",
        compact && "w-8 px-0",
      )}
    >
      <span className="relative grid size-4 place-items-center">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={state}
            className="absolute inset-0 grid place-items-center"
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.4, rotate: -45 }}
            animate={{
              opacity: 1,
              scale: 1,
              rotate: 0,
              transition: reduced ? { duration: duration.fast } : spring.bouncy,
            }}
            exit={
              reduced
                ? { opacity: 0, transition: exitTransition }
                : { opacity: 0, scale: 0.4, transition: exitTransition }
            }
          >
            {icon}
          </motion.span>
        </AnimatePresence>
      </span>
      {/*
        The word goes when the block is narrow (container query on the header); the name stays.
        "Copy" and "Copied" share one grid cell, so the button keeps the wider one's width and
        nothing beside it shifts when the word changes.
      */}
      {!compact && (
        <span
          aria-hidden
          className="hidden font-sans tabular-nums @min-[22rem]:grid [&>*]:col-start-1 [&>*]:row-start-1"
        >
          <span className={cn(state !== "idle" && "invisible")}>{labels.copy}</span>
          <span className={cn(state !== "copied" && "invisible")}>{labels.copied}</span>
          {state === "failed" && <span>{labels.copyFailed}</span>}
        </span>
      )}
    </Button>
  );
}

/** The toggle that wraps long lines. @internal */
export function WrapToggle({ wrap, onToggle, label }: { wrap: boolean; onToggle: () => void; label: string }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      aria-pressed={wrap}
      aria-label={label}
      title={label}
      onClick={onToggle}
      className={cn(
        "h-8 w-8 px-0 text-sheen-fg-muted hover:text-sheen-fg",
        "aria-pressed:bg-sheen-accent-soft aria-pressed:text-sheen-accent",
        "forced-colors:aria-pressed:border-[Highlight] forced-colors:aria-pressed:border-2",
      )}
    >
      <WrapIcon />
    </Button>
  );
}

/** The props of the code body. @internal */
export type BodyProps = {
  code: string;
  language: CodeLanguage;
  wrap: boolean;
  showLineNumbers: boolean;
  startLineNumber: number;
  highlight: Set<number>;
  added: Set<number>;
  removed: Set<number>;
  maxHeight: number | string;
  regionLabel: string;
  codeRef: (el: HTMLElement | null) => void;
  className?: string;
};

/** The scrollable code: lines with gutters, highlights and diff marks. */
export function CodeBody({
  code,
  language,
  wrap,
  showLineNumbers,
  startLineNumber,
  highlight,
  added,
  removed,
  maxHeight,
  regionLabel,
  codeRef,
  className,
}: BodyProps) {
  const lines = useMemo(() => splitLines(tokenize(code, language)), [code, language]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollable, setScrollable] = useState(false);
  const diff = added.size > 0 || removed.size > 0;
  const lastNumber = startLineNumber + lines.length - 1;
  // Room for the widest number plus 1rem either side (border-box), then the diff marker.
  const numberWidth = `calc(${String(lastNumber).length}ch + 2rem)`;
  const hasGutter = showLineNumbers || diff;
  const gutter = showLineNumbers
    ? diff
      ? `calc(${numberWidth} + 1.25rem)`
      : numberWidth
    : diff
      ? "1.75rem"
      : "1.25rem";

  // Focusable (and announced as a named group) only when there is something to scroll. While it is
  // scrolled sideways the gutter gets a backing (data-scrolled), and while more code hides past
  // the end edge a fade says so (data-more). Attributes are set directly: no re-render per scroll.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // Written only on change: the gutter's backing is a `group-has-[[data-scrolled]]` rule, and any attribute or
    // inline-style mutation inside the block makes the browser re-check that :has() and restyle the block. A modal
    // popup's scroll lock resizes every code block on the page by a scrollbar's width, which used to cost one
    // restyle per block on every menu or dialog open although nothing had scrolled.
    const last = { scrolled: false, more: false, sbw: "", sbh: "" };
    const edges = () => {
      const max = el.scrollWidth - el.clientWidth;
      const scrolled = el.scrollLeft > 0.5;
      const more = max - el.scrollLeft > 1;
      if (scrolled !== last.scrolled) el.toggleAttribute("data-scrolled", (last.scrolled = scrolled));
      if (more !== last.more) el.toggleAttribute("data-more", (last.more = more));
      // Keep the fade clear of a classic (space-taking) scrollbar.
      const sbw = `${el.offsetWidth - el.clientWidth}px`;
      const sbh = `${el.offsetHeight - el.clientHeight}px`;
      if (sbw !== last.sbw) el.style.setProperty("--cb-sbw", (last.sbw = sbw));
      if (sbh !== last.sbh) el.style.setProperty("--cb-sbh", (last.sbh = sbh));
    };
    const measure = () => {
      setScrollable(el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1);
      edges();
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);
    el.addEventListener("scroll", edges, { passive: true });
    return () => {
      observer.disconnect();
      el.removeEventListener("scroll", edges);
    };
  }, [wrap, lines]);

  return (
    // Code reads left to right in any page direction, and must never be machine-translated.
    <div dir="ltr" translate="no" className={cn("group/code relative min-h-0 rounded-b-[inherit]", className)}>
      <div
        ref={scrollRef}
        // A named group, not a region: a page with many code blocks would otherwise list every one as a landmark
        // (and axe's landmark-unique fails when two share language and name). Still named and keyboard-focusable.
        role={scrollable ? "group" : undefined}
        aria-label={scrollable ? regionLabel : undefined}
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrollable region must be keyboard focusable (WCAG 2.1.1); set only while it scrolls
        tabIndex={scrollable ? 0 : undefined}
        style={{
          maxHeight: maxHeight === "none" ? undefined : typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight,
        }}
        className={cn(
          "relative overflow-auto overscroll-x-contain rounded-[inherit] [scrollbar-width:thin]",
          "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sheen-focus",
        )}
      >
        <pre
          dir="ltr"
          translate="no"
          className={cn(
            "py-3.5 font-sheen-mono text-[0.8125rem] leading-6 [tab-size:2]",
            wrap ? "w-full whitespace-pre-wrap" : "w-max min-w-full whitespace-pre",
          )}
        >
          <code ref={codeRef} data-language={language}>
            {lines.map((line, i) => {
              const n = startLineNumber + i;
              const isAdded = added.has(n);
              const isRemoved = removed.has(n);
              const isMarked = highlight.has(n);
              const content = <LineContent tokens={line} />;
              const tint = isAdded
                ? "--sheen-success"
                : isRemoved
                  ? "--sheen-danger"
                  : isMarked
                    ? "--sheen-accent"
                    : null;
              return (
                <span key={i}>
                  {/*
                    Lines are inline-blocks separated by real "\n" text, so a hand-made selection
                    copies exactly the source (flex lines would add blank lines). The gutter sits in
                    the line's start padding, out of the text flow, so wrapped lines hang under the code.
                  */}
                  <span
                    data-line={n}
                    data-highlighted={isMarked || undefined}
                    data-diff={isAdded ? "added" : isRemoved ? "removed" : undefined}
                    style={{
                      paddingInlineStart: gutter,
                      // Tint and bar colours, reused by the gutter's backing while scrolled.
                      ...(tint && { "--cb-tint": `var(${tint}-soft)`, "--cb-bar": `var(${tint})` }),
                    }}
                    className={cn(
                      // min-h: an empty line keeps its height without a placeholder character.
                      "relative inline-block min-h-6 w-full pe-5 align-top",
                      wrap && "[overflow-wrap:anywhere]",
                      tint && "bg-(--cb-tint) shadow-[inset_2px_0_0_var(--cb-bar)]",
                      isMarked && "forced-colors:border-l-4 forced-colors:border-[Highlight]",
                    )}
                  >
                    {hasGutter && (
                      /*
                        A zero-size sticky anchor at the start of the code: the gutter hangs off it
                        (absolutely, to its left), so numbers and diff markers stay put while long
                        lines scroll sideways underneath. Excluded from copy and screen readers.
                      */
                      <span
                        aria-hidden
                        className="sticky inline-block size-0 align-top select-none"
                        style={{ left: gutter }}
                      >
                        <span
                          style={{ left: `calc(-1 * ${gutter})`, width: gutter }}
                          className={cn(
                            "absolute top-0 h-6",
                            // Scrolled sideways: a backing hides the code passing underneath, with the line's tint and bar.
                            "group-has-[[data-scrolled]]/code:bg-sheen-surface/97 group-has-[[data-scrolled]]/code:shadow-[inset_2px_0_0_var(--cb-bar,transparent),1px_0_0_var(--sheen-border)]",
                            tint &&
                              "group-has-[[data-scrolled]]/code:[background-image:linear-gradient(var(--cb-tint),var(--cb-tint))]",
                            "forced-colors:bg-[Canvas]",
                          )}
                        >
                          {showLineNumbers && (
                            <span
                              style={{ width: numberWidth }}
                              // On a tinted line the tint lifts the background toward fg-subtle (~4:1), so tinted
                              // lines step up to fg-muted; marked lines use the accent, matching their bar.
                              className={cn(
                                "absolute start-0 top-0 px-4 text-right tabular-nums",
                                isMarked ? "text-sheen-accent" : tint ? "text-sheen-fg-muted" : "text-sheen-fg-subtle",
                              )}
                            >
                              {n}
                            </span>
                          )}
                          {diff && (
                            <span
                              style={{ insetInlineStart: showLineNumbers ? numberWidth : "0.5rem" }}
                              className={cn(
                                "absolute top-0 w-4 text-center",
                                isAdded && "text-sheen-success-text",
                                isRemoved && "text-sheen-danger-text",
                              )}
                            >
                              {isAdded ? "+" : isRemoved ? "−" : ""}
                            </span>
                          )}
                        </span>
                      </span>
                    )}
                    {isAdded ? (
                      <ins className="no-underline">{content}</ins>
                    ) : isRemoved ? (
                      <del className="no-underline">{content}</del>
                    ) : isMarked ? (
                      // Forced colors map <mark> to the system Mark / MarkText pair: use it for the
                      // whole line's text (tokens inherit), so highlighted code stays legible.
                      <mark className="bg-transparent text-inherit forced-colors:bg-[Mark] forced-colors:text-[MarkText] forced-colors:forced-color-adjust-none forced-colors:**:text-inherit">
                        {content}
                      </mark>
                    ) : (
                      content
                    )}
                  </span>
                  {i < lines.length - 1 && "\n"}
                </span>
              );
            })}
          </code>
        </pre>
      </div>
      {/* More code past the end edge: a fade to the surface (outside the scroller, so it never scrolls or hides a scrollbar). */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-0 right-[var(--cb-sbw,0px)] bottom-[var(--cb-sbh,0px)] w-10 rounded-br-[inherit] opacity-0",
          "bg-linear-to-l from-sheen-surface/85 to-transparent",
          "motion-ok:transition-opacity motion-ok:duration-(--sheen-duration-fast)",
          "group-has-[[data-more]]/code:opacity-100 forced-colors:hidden",
        )}
      />
    </div>
  );
}

/** One line of highlighted tokens. @internal */
export function LineContent({ tokens }: { tokens: Token[] }) {
  return (
    <>
      {tokens.map((token, i) => {
        const cls = tokenClass[token.kind];
        return cls ? (
          <span key={i} className={cls}>
            {token.text}
          </span>
        ) : (
          token.text
        );
      })}
    </>
  );
}

/* ---------- CodeBlock ---------- */

/** The props the code block parts share. @internal */
export type SharedProps = {
  /** Show line numbers. Defaults to true when there is more than one line. */
  showLineNumbers?: boolean;
  /**
   * Number of the first line (for excerpts of a longer file).
   * @default 1
   */
  startLineNumber?: number;
  /** Lines to highlight: [3, 4] or "3-4, 9". Rendered as <mark>. */
  highlightLines?: LineSpec;
  /** Marks added lines in a diff (green, "+", `<ins>`). */
  addedLines?: LineSpec;
  /** Marks removed lines in a diff (red, "−", `<del>`). */
  removedLines?: LineSpec;
  /** Controlled wrapping of long lines. */
  wrap?: boolean;
  /**
   * Sets the starting wrap state when uncontrolled.
   * @default false
   */
  defaultWrap?: boolean;
  /** Called with the new value when the wrap toggle is pressed. */
  onWrapChange?: (wrap: boolean) => void;
  /**
   * Show the wrap toggle in the header.
   * @default true
   */
  showWrapToggle?: boolean;
  /**
   * Show the copy button.
   * @default true
   */
  copyable?: boolean;
  /** Called after a successful copy, with the copied text. */
  onCopy?: (code: string) => void;
  /**
   * Taller code scrolls inside. A number is px; "none" never limits it.
   * @default "32rem"
   */
  maxHeight?: number | string;
  /**
   * Glass level of the block (1 lightest, 3 most opaque).
   * @default 2
   */
  level?: 1 | 2 | 3;
  /** Override any UI string (i18n). */
  labels?: Partial<CodeBlockLabels>;
};

/** Props of {@link CodeBlock}. The attributes of a `div` (minus `children`) and the ones below. */
export type CodeBlockProps = Omit<ComponentProps<"div">, "children"> &
  SharedProps & {
    /** The source. Leading blank lines and trailing whitespace are trimmed. */
    code: string;
    /**
     * ts, tsx, js, jsx, json, css, bash, python, html, text (or an alias like "typescript", "sh").
     * @default "text"
     */
    language?: CodeLanguage | (string & {});
    /** File name shown as a tab in the header (e.g. "app/page.tsx"). */
    filename?: ReactNode;
    /** Icon before the file name (defaults to a file, or a terminal for shell). */
    icon?: ReactNode;
    /**
     * Show the header bar (file name, language, wrap, copy). Without it, copy floats top-right.
     * @default true
     */
    header?: boolean;
  };

/** Controllable line-wrap state. @internal */
export function useWrap(wrap: boolean | undefined, defaultWrap: boolean, onWrapChange?: (w: boolean) => void) {
  const [value, setValue] = useControllable(wrap, defaultWrap, onWrapChange);
  return [value, () => setValue(!value)] as const;
}
