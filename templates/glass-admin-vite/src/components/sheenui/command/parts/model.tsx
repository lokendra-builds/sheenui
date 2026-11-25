"use client";

import { useEffect, useState, type ReactElement, type ReactNode } from "react";

import type { DialogContentProps } from "../../dialog/dialog";
import { type KbdLabels } from "../../kbd/shortcut";
import { matchCommand, prepareText, type FuzzyMatch, type PreparedText } from "../fuzzy";

/**
 * Command palette (⌘K): a glass dialog with a search field over grouped commands.
 *
 *   <CommandPalette items={commands} trigger={<Button variant="glass">Search…</Button>} />
 *
 * - Fuzzy search with the matched letters highlighted; results are ranked, best group first.
 * - ↑ ↓ (or Ctrl+N / Ctrl+P) move, Enter runs, Escape closes. PageUp / PageDown jump.
 * - Commands with `items` open a nested page; Escape or Backspace (empty field) goes back.
 *   From the top level, search also finds commands inside pages (`deepSearch`).
 * - Recently used commands are listed first (kept in memory, in localStorage with
 *   `recentStorageKey`, or controlled with `recent` / `onRecentChange`).
 * - ⌘K / Ctrl+K toggles it from anywhere (`shortcut`).
 *
 * Accessibility: the field is a combobox that owns a listbox (aria-activedescendant), so
 * focus never leaves the field; the result count is announced politely. Motion: the
 * highlight glides between results and pages slide sideways; reduced motion: fades only.
 */

/** One command (or a group of sub-commands) in a {@link CommandPalette}. */
export type CommandItem = {
  /** Unique across the whole tree (used for recents and keys). */
  id: string;
  /** The command's name. Searched, and highlighted where it matches. */
  label: string;
  /** Shows the second line under the label. Also searched. */
  description?: string;
  /** Extra words that find this command but aren't shown, e.g. ["preferences", "config"]. */
  keywords?: readonly string[];
  /** Heading the command is listed under. */
  group?: string;
  /** Icon before the label. */
  icon?: ReactNode;
  /** Shortcut to show, e.g. "mod+shift+l". Displayed only: bind it yourself. Hidden on phones. */
  shortcut?: string | readonly string[];
  /** Short text or a badge at the end of the row, e.g. "Jump to" or "3 new". Shown on every screen size. */
  hint?: ReactNode;
  /** Show the command but make it unselectable. */
  disabled?: boolean;
  /** Runs when the command is chosen. */
  onSelect?: (item: CommandItem) => void;
  /** Keep the palette open after running (e.g. toggles). */
  keepOpen?: boolean;
  /** Sub-commands: choosing this command opens them as a nested page. */
  items?: readonly CommandItem[];
  /** Search placeholder on this command's nested page. */
  placeholder?: string;
  /**
   * List it under "Recent" after use.
   * @default true
   */
  recordRecent?: boolean;
};

/** Every UI string of {@link CommandPalette}; pass a partial through its `labels` prop to translate it. */
export type CommandPaletteLabels = {
  /** Name of the dialog (read by screen readers, not shown). */
  title: string;
  /** Name of the search field. */
  inputLabel: string;
  /** Name of the search field on a nested page. Gets the page's label and `inputLabel`. */
  pageInputLabel: (page: string, inputLabel: string) => string;
  /** Placeholder of the search field. */
  placeholder: string;
  /** Heading of the recently used group. */
  recent: string;
  /** Heading of the empty state, and what is announced. */
  noResults: (query: string) => string;
  /** Hint under the empty-state heading. */
  noResultsHint: ReactNode;
  /** Shown when there are no commands at all. */
  emptyList: string;
  /** Shown while `loading` is true and there are no results yet. */
  loading: string;
  /** Announced as the results change. */
  results: (count: number) => string;
  /** Footer hint for Escape on a nested page. */
  back: string;
  /** Name of the back button on a nested page. Gets the page's label and `back`. */
  backButton: (page: string, back: string) => string;
  /** Name of the close button. */
  close: string;
  /** Footer hint for the arrow keys. */
  navigate: string;
  /** Footer hint for Enter. */
  select: string;
  /** Spoken name of a command that opens a nested page. Gets the command's label. */
  opensPage: (label: string) => string;
  /** Read to screen readers on open: how to use the palette. */
  instructions: string;
};

/** The English strings of {@link CommandPalette}. Spread it to build your own set. */
export const defaultCommandPaletteLabels: CommandPaletteLabels = {
  title: "Command palette",
  inputLabel: "Search commands",
  pageInputLabel: (page, inputLabel) => `${inputLabel}: ${page}`,
  placeholder: "Search or jump to…",
  recent: "Recent",
  noResults: (query) => `No results for “${query}”`,
  noResultsHint: "Try a shorter word or check the spelling.",
  emptyList: "No commands yet.",
  loading: "Searching…",
  results: (count) => (count === 1 ? "1 result" : `${count} results`),
  back: "Back",
  backButton: (page, back) => `${back}: ${page}`,
  close: "Close",
  navigate: "Navigate",
  select: "Select",
  opensPage: (label) => `${label}, opens more options`,
  instructions:
    "Type to search. Use the up and down arrow keys to move through results, Enter to run one, Escape to go back or close.",
};

/** A custom matcher for {@link CommandPalette}'s `filter`: return a match (with the highlighted ranges) or `null` to hide the command. */
export type CommandFilter = (item: CommandItem, query: string) => FuzzyMatch | null;

/** Props of {@link CommandPalette}. */
export type CommandPaletteProps = {
  /** The commands. Order is kept when the search field is empty. */
  items: readonly CommandItem[];
  /** Whether the palette is open (controlled). */
  open?: boolean;
  /**
   * Whether it starts open (uncontrolled).
   * @default false
   */
  defaultOpen?: boolean;
  /** Called with the new state when the palette opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Whether the rest of the page is blocked while it is open (Base UI dialog semantics). `false` leaves the page
   * interactive, drops the scrim and does not trap focus: for previews and demos that open on their own.
   * @default true
   */
  modal?: boolean;
  /**
   * Where focus lands when it opens: an element, a ref, or a function (Base UI's `initialFocus`). `false` moves
   * focus nowhere, so a palette that opens by itself never steals it.
   * @default the search field
   */
  initialFocus?: DialogContentProps["initialFocus"];
  /**
   * Where the palette is portalled. Pass an element to keep it inside a region instead of the end of the body.
   * @default the end of document.body
   */
  container?: DialogContentProps["container"];
  /** Rendered as the button that opens the palette (focus returns to it on close). */
  trigger?: ReactElement;
  /**
   * Global shortcut that toggles the palette. `false` to register none.
   * @default "mod+k"
   */
  shortcut?: string | false;
  /** Called after any command runs (besides its own onSelect). */
  onSelect?: (item: CommandItem) => void;
  /** Sets the search text when controlled. */
  query?: string;
  /** The search text on mount (uncontrolled). */
  defaultQuery?: string;
  /** Called with the search text as it changes (fetch your own results here). */
  onQueryChange?: (query: string) => void;
  /**
   * How results are matched. Default: fuzzy match on label, description and keywords.
   * Pass a function to match your way, or `false` to show `items` as given (e.g. results
   * you fetched yourself in onQueryChange); matches are still highlighted.
   */
  filter?: CommandFilter | false;
  /**
   * From the top level, also search commands inside nested pages.
   * @default true
   */
  deepSearch?: boolean;
  /**
   * Most results listed while searching (the best ones). Keeps typing quick with thousands of commands.
   * @default 100
   */
  maxResults?: number;
  /**
   * Windows the result list so only the rows near the viewport are in the DOM: `true` always, `false` never, `"auto"`
   * only above 200 results (a long list with no query, or a large `maxResults`). The active command, the keyboard keys
   * (`aria-activedescendant` stays on the search field), `aria-setsize` / `aria-posinset` and the scroll height work
   * across every result. Windowed rows are a fixed height (a `description` is cut to fit) and the group headings are
   * visual only.
   *
   * @default "auto"
   */
  virtualized?: boolean | "auto";
  /** Lists the ids of recent commands, newest first, when controlled. */
  recent?: readonly string[];
  /** Called with the new list of recent ids after a command runs. */
  onRecentChange?: (ids: string[]) => void;
  /** Remember recents in localStorage under this key (uncontrolled). */
  recentStorageKey?: string;
  /**
   * How many recents to keep. 0 turns the Recent group off.
   * @default 5
   */
  maxRecent?: number;
  /**
   * Shows a spinner in the field (and "Searching…" while there are no results yet).
   * @default false
   */
  loading?: boolean;
  /** Replaces the empty state. Gets the query. */
  emptyState?: ReactNode | ((query: string) => ReactNode);
  /** Extra content at the end of the key-hint footer, or `false` to hide the footer. Hidden on touch screens. */
  footer?: ReactNode;
  /** Every string, for translation. */
  labels?: Partial<CommandPaletteLabels>;
  /** Key names in the shortcut hints (i18n). */
  shortcutLabels?: Partial<KbdLabels>;
  /** Adds extra classes to the dialog panel. */
  className?: string;
};

/** One result row: a command with the pages leading to it and its fuzzy match. @internal */
export type Row = {
  key: string;
  item: CommandItem;
  /** Pages leading to this command (from the top level). */
  path: CommandItem[];
  match: FuzzyMatch | null;
};

/** One result section with its heading and rows. @internal */
export type Section = { key: string; heading: string; rows: Row[] };

/** A searchable item with its ancestor path. @internal */
export type IndexEntry = { item: CommandItem; path: CommandItem[] };

/* ---------- matching ---------- */

/* Each command's searchable texts, analysed once per command object (not per keystroke). */
/** A command's searchable texts, analysed once per command object. @internal */
export type PreparedItem = {
  label: PreparedText;
  extra: PreparedText[];
  description?: string;
  keywords?: readonly string[];
};
/** A cache of prepared search text per item. @internal */
export const preparedItems = new WeakMap<CommandItem, PreparedItem>();

/** Normalises an item's searchable text once and caches it. @internal */
export function prepareItem(item: CommandItem): PreparedItem {
  const hit = preparedItems.get(item);
  if (hit?.label.text === item.label && hit.description === item.description && hit.keywords === item.keywords)
    return hit;
  const extra = [item.description, ...(item.keywords ?? [])].filter((t): t is string => Boolean(t)).map(prepareText);
  const next = { label: prepareText(item.label), extra, description: item.description, keywords: item.keywords };
  preparedItems.set(item, next);
  return next;
}

/** The default filter: a fuzzy match of the query against an item's label and extra search terms. @internal */
export const defaultFilter: CommandFilter = (item, query) => {
  const { label, extra } = prepareItem(item);
  return matchCommand(query, label, extra);
};

/** Every command in the tree with the pages above it. */
export function indexItems(
  items: readonly CommandItem[],
  path: CommandItem[] = [],
  into = new Map<string, IndexEntry>(),
) {
  for (const item of items) {
    into.set(item.id, { item, path });
    if (item.items) indexItems(item.items, [...path, item], into);
  }
  return into;
}

/** Rows in order → sections in order of their first row. */
export function groupRows(rows: Row[], heading: (row: Row) => string, prefix: string): Section[] {
  const sections = new Map<string, Section>();
  for (const row of rows) {
    const h = heading(row);
    let section = sections.get(h);
    if (!section) {
      section = { key: `${prefix}${h}`, heading: h, rows: [] };
      sections.set(h, section);
    }
    section.rows.push(row);
  }
  return [...sections.values()];
}

/** The options of `buildSections`. @internal */
export type BuildOptions = {
  /** Trimmed search text. */
  query: string;
  items: readonly CommandItem[];
  pages: CommandItem[];
  recent: readonly string[];
  index: Map<string, IndexEntry>;
  maxRecent: number;
  recentLabel: string;
  filter: CommandFilter | false;
  deepSearch: boolean;
  maxResults: number;
};

/** Builds the grouped, filtered, ordered result sections for a query. @internal */
export function buildSections({
  query,
  items,
  pages,
  recent,
  index,
  maxRecent,
  recentLabel,
  filter,
  deepSearch,
  maxResults,
}: BuildOptions): Section[] {
  const page = pages.at(-1);
  const pageItems = page?.items ?? items;

  if (!query) {
    const out: Section[] = [];
    if (!page && maxRecent > 0) {
      const recentRows = recent
        .map((rid) => index.get(rid))
        .filter((hit): hit is IndexEntry => Boolean(hit && !hit.item.disabled))
        .slice(0, maxRecent)
        .map(({ item, path }) => ({ key: `recent:${item.id}`, item, path, match: null }));
      if (recentRows.length) out.push({ key: "recent", heading: recentLabel, rows: recentRows });
    }
    const rows = pageItems.map((item) => ({ key: item.id, item, path: pages, match: null }));
    return [...out, ...groupRows(rows, (r) => r.item.group ?? "", "g:")];
  }

  // Candidates: this page, plus (at the top level) everything nested below it.
  const candidates: Row[] = [];
  const collect = (list: readonly CommandItem[], path: CommandItem[]) => {
    for (const item of list) {
      candidates.push({
        key: path.length > pages.length ? `${path.map((p) => p.id).join("/")}/${item.id}` : item.id,
        item,
        path,
        match: null,
      });
      if (item.items && !page && deepSearch) collect(item.items, [...path, item]);
    }
  };
  collect(pageItems, pages);

  if (filter === false) {
    const rows = candidates
      .filter((r) => r.path.length === pages.length)
      .map((r) => ({ ...r, match: defaultFilter(r.item, query) }));
    return groupRows(rows, (r) => r.item.group ?? "", "g:");
  }

  // Best first (a stable sort keeps the given order for ties), then grouped: each group
  // lands where its best result ranks. Nested results are listed under their page's name.
  const scored = candidates
    .map((r) => ({ ...r, match: filter(r.item, query) }))
    .filter((r): r is Row & { match: FuzzyMatch } => r.match !== null)
    .sort((a, b) => b.match.score - a.match.score)
    .slice(0, Math.max(1, maxResults));
  const heading = (r: Row) =>
    r.path.length > pages.length
      ? r.path
          .slice(pages.length)
          .map((p) => p.label)
          .join(" › ")
      : (r.item.group ?? "");
  return groupRows(scored, heading, "s:");
}

/* ---------- helpers ---------- */

/** Reads a string list from localStorage, returning an empty list when it is missing or invalid. @internal */
export function readStored(key: string | undefined): string[] {
  if (!key || typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

/** Command ids can hold any text; DOM ids built from them must not (spaces split ID lists). */
export function idSafe(key: string) {
  return key.replace(/[^A-Za-z0-9-]/g, (ch) => `_${(ch.codePointAt(0) ?? 0).toString(16)}_`);
}

/**
 * Height of the visible area while the palette is open. On phones the on-screen keyboard
 * covers the bottom of the page without changing 100dvh; the visual viewport shrinks.
 */
export function useVisualViewportHeight(active: boolean) {
  const [height, setHeight] = useState<number | null>(null);
  useEffect(() => {
    const vv = typeof window === "undefined" ? undefined : window.visualViewport;
    if (!active || !vv) return;
    // Pinch zoom also shrinks the visual viewport: only follow it at normal scale.
    const update = () => setHeight(vv.scale <= 1.01 ? vv.height : null);
    update();
    vv.addEventListener("resize", update);
    return () => vv.removeEventListener("resize", update);
  }, [active]);
  return active ? height : null;
}

/** Wrap the matched characters in <mark>.
 *
 * @see /overlays/command-palette
 */
export function highlightMatch(text: string, indices: readonly number[]): ReactNode {
  if (indices.length === 0) return text;
  const hits = new Set(indices);
  const parts: ReactNode[] = [];
  let run = "";
  let runIsHit = false;
  let offset = 0;
  const flush = () => {
    if (!run) return;
    parts.push(
      runIsHit ? (
        <mark
          key={parts.length}
          className="bg-transparent font-[inherit] text-sheen-accent forced-colors:text-[CanvasText] forced-colors:underline"
        >
          {run}
        </mark>
      ) : (
        run
      ),
    );
    run = "";
  };
  for (const ch of text) {
    const hit = hits.has(offset);
    if (hit !== runIsHit) {
      flush();
      runIsHit = hit;
    }
    run += ch;
    offset += ch.length;
  }
  flush();
  return parts;
}

/* ---------- component ---------- */
