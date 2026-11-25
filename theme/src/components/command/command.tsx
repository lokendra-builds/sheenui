"use client";

import {
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";

import { cn } from "../../lib/cn";
import { SpinnerIcon } from "../spinner/spinner";
import { useControllable } from "../../hooks/use-controllable";
import { isImeComposing } from "../../lib/ime";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { duration, spring } from "../../motion/tokens";
import { exitTransition } from "../../motion/presets";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "../dialog/dialog";
import { Kbd, KbdShortcut, useShortcutPlatform } from "../kbd/kbd";
import { useCommandShortcut } from "./use-command-shortcut";
import { pageSize } from "../../lib/page-size";
import { shouldVirtualize, useVirtualWindow } from "../../hooks/use-virtual-window";

import {
  type CommandItem,
  defaultCommandPaletteLabels,
  type CommandPaletteProps,
  type Row,
  defaultFilter,
  indexItems,
  buildSections,
  readStored,
  idSafe,
  useVisualViewportHeight,
} from "./parts/model";
import { ResultsPage, SearchIcon, EmptyState, type VirtualRow } from "./parts/parts";

export {
  type CommandItem,
  type CommandPaletteLabels,
  defaultCommandPaletteLabels,
  type CommandFilter,
  type CommandPaletteProps,
  highlightMatch,
} from "./parts/model";

/**
 * Command palette (Cmd/Ctrl+K): a glass dialog with a fuzzy search field over grouped commands.
 * Use it for "jump to anything" navigation and app-wide actions. Commands with `items` open a
 * nested page; recently used commands are listed first.
 *
 * Props: see {@link CommandPaletteProps} (`items` required, `open` / `defaultOpen` /
 * `onOpenChange`, `modal` true, `initialFocus` (the field), `container`, `trigger`, `shortcut` "mod+k", `onSelect`, `query` / `defaultQuery` /
 * `onQueryChange`, `filter`, `deepSearch` true, `maxResults` 100, `recent` / `onRecentChange` /
 * `recentStorageKey`, `maxRecent` 5, `loading`, `emptyState`, `footer`, `labels`, `shortcutLabels`,
 * `className`). Each {@link CommandItem} has `id`, `label`, `description`, `keywords`, `group`,
 * `icon`, `shortcut`, `hint`, `disabled`, `onSelect`, `keepOpen`, `items`.
 *
 * Long lists are windowed (`virtualized`, automatic above 200 results), so thousands of commands stay fast.
 *
 * Keyboard: Cmd/Ctrl+K toggles it from anywhere (`shortcut`). Up / Down (or Ctrl+N / Ctrl+P) move through results, Page Up / Down jump, Enter runs, Escape (or Backspace in an empty field) goes back a page and then closes.
 * Accessibility: With `modal={false}` the page stays interactive and focus is not trapped; use it for previews, never for a real palette. The field is an ARIA combobox that owns a listbox (`aria-activedescendant`), so focus never leaves the field; the result count is announced politely, usage instructions are read on open, and the dialog is named by `labels.title`. Shortcut hints expose `aria-keyshortcuts`.
 * Glass: One glass dialog (the standard overlay surface); rows are flat.
 * Motion: The active highlight glides between results and pages slide sideways; reduced motion uses fades only.
 *
 * @example
 * ```tsx
 * import { Button, CommandPalette, type CommandItem } from "@sheenui/theme";
 *
 * const commands: CommandItem[] = [
 *   { id: "home", label: "Go to dashboard", group: "Navigate", shortcut: "g d", onSelect: () => console.log("home") },
 *   { id: "theme", label: "Toggle theme", group: "Settings", keywords: ["dark", "light"] },
 * ];
 *
 * export const Palette = () => <CommandPalette items={commands} trigger={<Button variant="glass">Search…</Button>} />;
 * ```
 *
 * @see /overlays/command-palette
 */
export function CommandPalette({
  items,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  modal = true,
  initialFocus,
  container,
  trigger,
  shortcut = "mod+k",
  onSelect,
  query: queryProp,
  defaultQuery = "",
  onQueryChange,
  filter = defaultFilter,
  deepSearch = true,
  maxResults = 100,
  virtualized,
  recent: recentProp,
  onRecentChange,
  recentStorageKey,
  maxRecent = 5,
  loading = false,
  emptyState,
  footer,
  labels: labelsProp,
  shortcutLabels,
  className,
}: CommandPaletteProps) {
  const labels = { ...defaultCommandPaletteLabels, ...labelsProp };
  const reduced = useSheenReducedMotion();
  const platform = useShortcutPlatform();
  const id = useId();
  const listId = `${id}-list`;
  const instructionsId = `${id}-instructions`;
  const inputRef = useRef<HTMLInputElement>(null);

  /* ----- state (each part controlled or not) ----- */
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange);
  const [innerQuery, setInnerQuery] = useState(defaultQuery);
  const query = queryProp ?? innerQuery;
  const [innerRecent, setInnerRecent] = useState<string[]>(() => readStored(recentStorageKey));
  const recent = recentProp ?? innerRecent;
  const [pages, setPages] = useState<CommandItem[]>([]);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const activeSource = useRef<"keyboard" | "pointer">("keyboard");

  function setQuery(next: string) {
    if (queryProp === undefined) setInnerQuery(next);
    onQueryChange?.(next);
    setActiveKey(null);
    activeSource.current = "keyboard";
  }

  // Each opening starts fresh at the top level (adjusting state during render, not in an effect,
  // so the first painted frame is already right).
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setPages([]);
      setActiveKey(null);
      if (queryProp === undefined) setInnerQuery(defaultQuery);
    }
  }

  useCommandShortcut(() => setOpen(!open), { keys: shortcut || undefined, enabled: shortcut !== false });
  const viewportHeight = useVisualViewportHeight(open);

  /* ----- results ----- */
  const index = useMemo(() => indexItems(items), [items]);
  const page = pages.at(-1);
  const trimmed = query.trim();
  // Searching big lists runs at a lower priority, so typing never waits for results. An
  // emptied field (open, page change, cleared) shows its list straight away.
  const deferredQuery = useDeferredValue(query);
  const searchQuery = trimmed ? deferredQuery.trim() : "";
  const buildOptions = {
    items,
    pages,
    recent,
    index,
    maxRecent,
    recentLabel: labels.recent,
    filter,
    deepSearch,
    maxResults,
  };

  const recentLabel = labels.recent;
  const sections = useMemo(
    () =>
      buildSections({
        items,
        pages,
        recent,
        index,
        maxRecent,
        recentLabel,
        filter,
        deepSearch,
        maxResults,
        query: searchQuery,
      }),
    [searchQuery, items, pages, recent, index, maxRecent, recentLabel, filter, deepSearch, maxResults],
  );

  const rows = useMemo(() => sections.flatMap((s) => s.rows), [sections]);
  const enabledRows = rows.filter((r) => !r.item.disabled);
  const active = rows.find((r) => r.key === activeKey && !r.item.disabled) ?? enabledRows[0];
  // Ids follow the command, not its position: when the top result changes, so does the
  // active descendant, and screen readers announce the new one.
  const optionId = (row: Row) => `${id}-o-${idSafe(row.key)}`;
  const activeId = active ? optionId(active) : undefined;
  const reserveIcon = rows.some((r) => r.item.icon != null);

  /* ----- windowing: a long list renders only the rows near the viewport ----- */
  const virtual = shouldVirtualize(virtualized, rows.length);
  const hasDescriptions = virtual && rows.some((r) => r.item.description);
  const virtualRows = useMemo<VirtualRow[]>(() => {
    if (!virtual) return [];
    const out: VirtualRow[] = [];
    let position = 0;
    for (const section of sections) {
      if (section.heading) out.push({ kind: "heading", key: `h:${section.key}`, label: section.heading });
      for (const row of section.rows) out.push({ kind: "option", row, position: ++position, group: section.heading });
    }
    return out;
  }, [virtual, sections]);
  const {
    ref: listRef,
    element: listElement,
    scrollToIndex,
    start,
    end,
    size: rowSize,
  } = useVirtualWindow({
    count: virtualRows.length,
    enabled: virtual,
    estimateSize: hasDescriptions ? 56 : 44,
    overscan: 8,
    fallbackViewport: 360,
  });
  const activeAt = active ? virtualRows.findIndex((v) => v.kind === "option" && v.row === active) : -1;

  // Keep the highlighted result in view when it moved by keyboard.
  useLayoutEffect(() => {
    if (!activeId || activeSource.current !== "keyboard") return;
    if (virtual) {
      // The row may not exist yet: place the scroll position first, the window renders it with the next frame.
      if (activeAt >= 0) {
        if (virtualRows[activeAt - 1]?.kind === "heading") scrollToIndex(activeAt - 1, "nearest");
        scrollToIndex(activeAt, "nearest");
      }
      return;
    }
    document.getElementById(activeId)?.scrollIntoView({ block: "nearest" });
  }, [activeId, virtual, activeAt, virtualRows, scrollToIndex]);

  const windowedPage = virtual
    ? (() => {
        const visible: number[] = [];
        const pinned = activeAt >= 0 && (activeAt < start || activeAt >= end) ? activeAt : -1;
        if (pinned >= 0 && pinned < start) visible.push(pinned);
        for (let at = start; at < end; at++) visible.push(at);
        if (pinned > start) visible.push(pinned);
        return {
          rows: virtualRows,
          visible,
          size: rowSize,
          heightClass: hasDescriptions ? "h-14" : "h-11",
          total: rows.length,
        };
      })()
    : undefined;

  /* ----- announcements (debounced, so typing isn't drowned in chatter) ----- */
  const [announcement, setAnnouncement] = useState("");
  // Re-announce only when the results change: the wording (labels) is read when the timer fires.
  const announceResults = useEffectEvent(() => {
    if (!searchQuery) setAnnouncement("");
    else if (loading && rows.length === 0) setAnnouncement(labels.loading);
    else setAnnouncement(rows.length ? labels.results(enabledRows.length) : labels.noResults(searchQuery));
  });
  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(announceResults, 450);
    return () => window.clearTimeout(timer);
  }, [open, searchQuery, rows.length, enabledRows.length, loading]);

  /* ----- actions ----- */
  function recordRecent(itemId: string) {
    if (maxRecent <= 0) return;
    const next = [itemId, ...recent.filter((r) => r !== itemId)].slice(0, maxRecent);
    if (recentProp === undefined) setInnerRecent(next);
    onRecentChange?.(next);
    if (recentStorageKey && recentProp === undefined) {
      try {
        window.localStorage.setItem(recentStorageKey, JSON.stringify(next));
      } catch {
        /* storage blocked: recents still work for this visit */
      }
    }
  }

  function goTo(stack: CommandItem[], dir: 1 | -1) {
    // Focus first: the Back button that may have been pressed is about to unmount.
    inputRef.current?.focus();
    setDirection(dir);
    setPages(stack);
    setQuery("");
  }

  function choose(row: Row) {
    const { item, path } = row;
    if (item.disabled) return;
    if (item.items) {
      goTo([...path, item], 1);
      return;
    }
    if (item.recordRecent !== false) recordRecent(item.id);
    item.onSelect?.(item);
    onSelect?.(item);
    if (!item.keepOpen) setOpen(false);
  }

  function move(step: number, wrap = true) {
    if (enabledRows.length === 0) return;
    const current = active ? enabledRows.indexOf(active) : -1;
    let next = current + step;
    if (wrap) next = (next + enabledRows.length) % enabledRows.length;
    else next = Math.max(0, Math.min(enabledRows.length - 1, next));
    activeSource.current = "keyboard";
    const target = enabledRows[next];
    if (target) setActiveKey(target.key);
  }

  /** Enter right after typing: if the results haven't caught up yet, rank the latest text now. */
  function chooseActive() {
    if (searchQuery === trimmed) {
      if (active) choose(active);
      return;
    }
    const fresh = buildSections({ ...buildOptions, query: trimmed }).flatMap((s) => s.rows);
    const target = fresh.find((r) => r.key === activeKey && !r.item.disabled) ?? fresh.find((r) => !r.item.disabled);
    if (target) choose(target);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    // keyCode 229: Safari sends the Enter that confirms an IME composition after compositionend.
    if (isImeComposing(event.nativeEvent)) return;
    const ctrlOnly = event.ctrlKey && !event.metaKey && !event.altKey;
    if (event.key === "ArrowDown" || (ctrlOnly && event.key === "n")) move(1);
    else if (event.key === "ArrowUp" || (ctrlOnly && event.key === "p")) move(-1);
    else if (event.key === "PageDown") move(pageSize(listElement, rowSize), false);
    else if (event.key === "PageUp") move(-pageSize(listElement, rowSize), false);
    else if (event.key === "Enter") chooseActive();
    else if (event.key === "Backspace" && query === "" && pages.length > 0) {
      goTo(pages.slice(0, -1), -1);
    } else return;
    event.preventDefault();
  }

  /* ----- motion ----- */
  const pageVariants: Variants = {
    enter: (dir: number) => ({ opacity: 0, x: reduced ? 0 : dir * 24 }),
    center: { opacity: 1, x: 0, transition: reduced ? { duration: duration.fast } : spring.snappy },
    exit: (dir: number) => ({ opacity: 0, x: reduced ? 0 : dir * -24, transition: exitTransition }),
  };
  const pageKey = pages.map((p) => p.id).join("/") || "root";
  const showFooter = footer !== false;
  const hasRows = rows.length > 0;

  const emptyContent =
    loading && rows.length === 0 ? (
      <p className="px-4 py-10 text-center text-sm text-sheen-fg-muted">{labels.loading}</p>
    ) : typeof emptyState === "function" ? (
      emptyState(searchQuery)
    ) : emptyState !== undefined ? (
      emptyState
    ) : (
      <EmptyState
        title={searchQuery ? labels.noResults(searchQuery) : labels.emptyList}
        hint={searchQuery ? labels.noResultsHint : undefined}
        reduced={reduced}
      />
    );

  const panelStyle = viewportHeight ? ({ "--sheen-command-vvh": `${viewportHeight}px` } as CSSProperties) : undefined;

  return (
    <Dialog
      open={open}
      modal={modal}
      onOpenChange={(next, details) => {
        // Escape on a nested page goes back a level instead of closing.
        if (!next && details.reason === "escape-key" && pages.length > 0) {
          details.cancel();
          goTo(pages.slice(0, -1), -1);
          return;
        }
        setOpen(next);
      }}
    >
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent
        showClose={false}
        initialFocus={initialFocus ?? inputRef}
        container={container}
        backdrop={modal}
        data-slot="command-palette"
        style={panelStyle}
        className={cn(
          // Anchored near the top (not centred) so the field stays put while results change. The
          // height follows the visible area, so the on-screen keyboard never covers results.
          "top-[max(1rem,10dvh)] w-[min(40rem,calc(100vw-2rem))] -translate-y-0",
          "max-h-[min(36rem,calc(min(100dvh,var(--sheen-command-vvh,100dvh))_-_max(1rem,10dvh)_-_1rem))]",
          "origin-[50%_0] gap-0 overflow-hidden p-0",
          className,
        )}
      >
        <DialogTitle className="sr-only">{labels.title}</DialogTitle>
        <p id={instructionsId} className="sr-only">
          {labels.instructions}
        </p>

        {/* ----- search row ----- */}
        <div className="group/search relative flex shrink-0 items-center gap-2 border-b border-sheen-border px-3 sm:px-4">
          {page ? (
            <button
              type="button"
              aria-label={labels.backButton(page.label, labels.back)}
              onClick={() => goTo(pages.slice(0, -1), -1)}
              className={cn(
                // Phones: an arrow only (the page name sits above the field). Wider: a chip with the name.
                "inline-flex h-8 min-w-8 shrink-0 items-center justify-center gap-1 rounded-sheen-full bg-sheen-accent-soft text-sm font-medium text-sheen-accent",
                "sm:max-w-[45%] sm:py-1 sm:pe-3 sm:ps-2",
                "shadow-[inset_0_0_0_1px_var(--sheen-accent-border)] transition-colors duration-(--sheen-duration-fast) hover:bg-sheen-hover",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
                "any-pointer-coarse:h-11 any-pointer-coarse:min-w-11 forced-colors:border forced-colors:border-[ButtonText]",
              )}
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="size-4 shrink-0 rtl:rotate-180"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 6-6 6 6 6" />
              </svg>
              <span className="hidden truncate sm:inline">{page.label}</span>
            </button>
          ) : (
            <SearchIcon />
          )}
          <label className="flex min-w-0 flex-1 flex-col justify-center">
            {page && (
              <span
                aria-hidden
                className="truncate pt-1.5 text-2xs font-semibold tracking-[0.08em] text-sheen-fg-muted uppercase sm:hidden"
              >
                {page.label}
              </span>
            )}
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-label={page ? labels.pageInputLabel(page.label, labels.inputLabel) : labels.inputLabel}
              aria-describedby={instructionsId}
              aria-expanded={hasRows}
              aria-controls={hasRows ? listId : undefined}
              aria-activedescendant={activeId}
              aria-autocomplete="list"
              aria-busy={loading || undefined}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              enterKeyHint="go"
              value={query}
              placeholder={page?.placeholder ?? labels.placeholder}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className={cn(
                "h-14 min-w-0 bg-transparent text-base text-sheen-fg outline-none placeholder:text-sheen-fg-subtle [&::-webkit-search-cancel-button]:hidden",
                page && "max-sm:h-8.5",
                // High contrast: the underline below is the focus indicator (a box would be clipped by the panel).
                "forced-colors:outline-none!",
                // The field's own indicator is the underline below; Aurora's double-ring box-shadow on inputs would draw a hard square inside the rounded panel.
                "focus-visible:shadow-none!",
              )}
            />
          </label>
          {/* Solid focus indicator under the field: grows from the centre when it gains focus. */}
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-x-0 -bottom-px h-0.5 origin-center scale-x-0 bg-sheen-focus opacity-0",
              "transition-[opacity,scale] duration-(--sheen-duration-slow) ease-sheen-out",
              "group-has-[input:focus-visible]/search:scale-x-100 group-has-[input:focus-visible]/search:opacity-100",
              "forced-colors:bg-[Highlight] forced-colors:forced-color-adjust-none",
            )}
          />
          {loading && <SpinnerIcon className="size-4 shrink-0 text-sheen-fg-muted" />}
          <DialogClose
            className={cn(
              "inline-flex shrink-0 items-center justify-center rounded-sheen-sm text-sheen-fg-muted transition-colors duration-(--sheen-duration-fast) hover:bg-sheen-hover hover:text-sheen-fg",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
              "h-8 px-1 any-pointer-coarse:h-11 any-pointer-coarse:min-w-11",
            )}
          >
            {/* Fine pointers see the Esc key cap; touch screens get a × (there's no Escape key). */}
            <Kbd aria-hidden className="pointer-coarse:hidden">
              Esc
            </Kbd>
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="hidden size-5 pointer-coarse:block"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
            <span className="sr-only">{labels.close}</span>
          </DialogClose>
        </div>

        {/* ----- results: the scroll container is the listbox itself ----- */}
        <motion.div
          layoutScroll
          ref={listRef}
          id={hasRows ? listId : undefined}
          role={hasRows ? "listbox" : undefined}
          aria-label={hasRows ? (page ? page.label : labels.title) : undefined}
          // Keys stay in the search field (aria-activedescendant), so the list is no Tab stop; a
          // click on its padding hands focus straight back to the field.
          tabIndex={-1}
          onFocus={(e) => {
            if (e.target === e.currentTarget) inputRef.current?.focus();
          }}
          className="relative min-h-0 flex-1 scroll-py-2 overflow-y-auto overscroll-contain outline-none [scrollbar-width:thin]"
        >
          {/* popLayout: the next page is on screen (and its options exist) the moment it is chosen. */}
          <AnimatePresence mode="popLayout" initial={false} custom={direction}>
            <motion.div
              key={pageKey}
              role="presentation"
              custom={direction}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <ResultsPage
                sections={sections}
                active={active}
                optionId={optionId}
                headingId={(i) => `${id}-h-${i}`}
                layoutId={reduced ? undefined : `${id}-active-${pageKey}`}
                reserveIcon={reserveIcon}
                labels={labels}
                platform={platform}
                shortcutLabels={shortcutLabels}
                onHover={(row) => {
                  if (row === active || row.item.disabled) return;
                  activeSource.current = "pointer";
                  setActiveKey(row.key);
                }}
                onChoose={choose}
                empty={emptyContent}
                windowed={windowedPage}
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* ----- footer: key hints for keyboard users (hidden on touch screens) ----- */}
        {showFooter && (
          <div
            aria-hidden
            className="hidden shrink-0 items-center gap-4 border-t border-sheen-border px-4 py-2.5 text-xs text-sheen-fg-muted sm:flex pointer-coarse:hidden"
          >
            <span className="inline-flex items-center gap-1.5">
              <KbdShortcut keys="arrowup" announce={false} labels={shortcutLabels} />
              <KbdShortcut keys="arrowdown" announce={false} labels={shortcutLabels} />
              {labels.navigate}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Kbd>↵</Kbd>
              {labels.select}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Kbd>Esc</Kbd>
              {page ? labels.back : labels.close}
            </span>
            {footer != null && <span className="ms-auto inline-flex min-w-0 items-center gap-2">{footer}</span>}
          </div>
        )}

        <div role="status" aria-live="polite" aria-atomic className="sr-only">
          {announcement}
        </div>
      </DialogContent>
    </Dialog>
  );
}
