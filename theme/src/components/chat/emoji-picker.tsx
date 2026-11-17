"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";

import { cn } from "../../lib/cn";
import { defaultEmojiCategories, type ChatEmoji, type ChatEmojiCategory } from "./emoji";
import { resolveChatLabels, type ChatLabels } from "./labels";
import { SearchIcon, XIcon } from "./icons";
import { isRtlAt } from "../../hooks/use-direction";
import { useSheenReducedMotion } from "../../hooks/use-preferences";

/** Props of {@link EmojiPicker}. Only `onSelect` is required. */
export type EmojiPickerProps = {
  /** Called with the emoji character. */
  onSelect: (emoji: string) => void;
  /** The emoji to offer, by category (defaults to a curated ~170). */
  categories?: ChatEmojiCategory[];
  /** Emoji shown first under "Frequently used" (e.g. the quick reactions). */
  frequent?: readonly string[];
  /** Emoji to mark as chosen (your current reactions): aria-pressed + a tint. */
  selected?: readonly string[];
  /** Focus the search field when it mounts (off on touch screens, where it would raise the keyboard). */
  autoFocusSearch?: boolean;
  /** Any UI string (i18n); see {@link ChatLabels}. */
  labels?: Partial<ChatLabels>;
  /** Adds extra classes to the picker. */
  className?: string;
};

type Section = { id: string; title: string; icon: string; emojis: ChatEmoji[] };

const FREQUENT_ID = "frequent";

/** Lowercased text an emoji is matched on. */
const haystack = (e: ChatEmoji) => `${e.name} ${e.keywords ?? ""}`.toLowerCase();

/**
 * A compact emoji picker: search, category shortcuts and a grid. The grid is one tab stop:
 * arrow keys move between emoji (up and down keep the column), Home / End jump to the ends,
 * Enter or Space picks one. Typing in the search field narrows the grid; Enter there picks the
 * first match and ↓ moves into the results.
 *
 * Props: see {@link EmojiPickerProps} (`onSelect` required; `categories` a curated set by default,
 * `frequent`, `selected`, `autoFocusSearch` false, `labels`, `className`).
 *
 * Keyboard: The grid is one tab stop: arrows move between emoji (up and down keep the column), Home / End jump to the ends, Enter or Space picks. In the search field Enter picks the first match and Down moves into the results.
 * Accessibility: Every emoji is a button named by its spoken name ("red heart"); chosen emoji use `aria-pressed` plus a tint; the search field and category shortcuts have names; the result count is announced politely.
 * Glass: A flat panel meant to sit inside a popover or sheet (which provide the glass), so it adds no blur of its own.
 *
 * @example
 * ```tsx
 * import { EmojiPicker } from "@sheenui/theme";
 *
 * export const Reactions = () => <EmojiPicker onSelect={(emoji) => console.log(emoji)} frequent={["👍", "❤️", "😂"]} selected={["👍"]} />;
 * ```
 *
 * @see /chat/thread
 */
export function EmojiPicker({
  onSelect,
  categories = defaultEmojiCategories,
  frequent,
  selected,
  autoFocusSearch = false,
  labels: labelsProp,
  className,
}: EmojiPickerProps) {
  const L = useMemo(() => resolveChatLabels(labelsProp), [labelsProp]);
  const id = useId();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [current, setCurrent] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const chosen = useMemo(() => new Set(selected ?? []), [selected]);

  const sections = useMemo<Section[]>(() => {
    const all = new Map<string, ChatEmoji>();
    for (const c of categories) for (const e of c.emojis) all.set(e.char, e);
    const list: Section[] = [];
    if (frequent?.length) {
      list.push({
        id: FREQUENT_ID,
        title: L.reactions,
        icon: frequent[0] ?? "⭐",
        emojis: frequent.map((char) => all.get(char) ?? { char, name: char }),
      });
    }
    for (const c of categories) {
      const title = (L.emojiCategories as Record<string, string>)[c.id] ?? c.id;
      list.push({ id: c.id, title, icon: c.icon, emojis: c.emojis });
    }
    return list;
  }, [categories, frequent, L]);

  const q = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!q) return null;
    const seen = new Set<string>();
    const out: ChatEmoji[] = [];
    for (const s of sections) {
      if (s.id === FREQUENT_ID) continue;
      for (const e of s.emojis) {
        if (seen.has(e.char) || !haystack(e).includes(q)) continue;
        seen.add(e.char);
        out.push(e);
      }
    }
    return out;
  }, [q, sections]);

  // The flat order of every emoji button, for roving focus.
  const flat = useMemo(() => results ?? sections.flatMap((s) => s.emojis), [results, sections]);
  const activeIndex = Math.min(active, Math.max(0, flat.length - 1));

  useEffect(() => {
    if (autoFocusSearch) searchRef.current?.focus({ preventScroll: true });
  }, [autoFocusSearch]);

  // A new search starts at the first result (adjusted in the same render, before it paints).
  const [seenQuery, setSeenQuery] = useState(q);
  if (seenQuery !== q) {
    setSeenQuery(q);
    setActive(0);
  }

  /* Which category is in view (for the tab highlight). */
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || results) return;
    const onScroll = () => {
      const top = grid.getBoundingClientRect().top;
      let found: string | null = null;
      for (const el of grid.querySelectorAll<HTMLElement>("[data-emoji-section]")) {
        if (el.getBoundingClientRect().top - top <= 24) found = el.dataset.emojiSection ?? null;
      }
      setCurrent(found ?? sections[0]?.id ?? null);
    };
    onScroll();
    grid.addEventListener("scroll", onScroll, { passive: true });
    return () => grid.removeEventListener("scroll", onScroll);
  }, [results, sections]);

  function buttons() {
    return Array.from(gridRef.current?.querySelectorAll<HTMLButtonElement>("button[data-emoji-index]") ?? []);
  }

  function focusIndex(index: number) {
    const list = buttons();
    const target = list[Math.max(0, Math.min(list.length - 1, index))];
    if (!target) return;
    setActive(Number(target.dataset.emojiIndex));
    target.focus();
    target.scrollIntoView({ block: "nearest" });
  }

  /** The button in the row above / below whose centre is closest to this one's (sections break rows). */
  function vertical(from: HTMLElement, direction: 1 | -1) {
    const list = buttons();
    const rect = from.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const rows = list
      .map((b) => ({ b, r: b.getBoundingClientRect() }))
      .filter(({ r }) => (direction === 1 ? r.top > rect.top + 2 : r.top < rect.top - 2));
    if (rows.length === 0) return null;
    const rowTop = direction === 1 ? Math.min(...rows.map(({ r }) => r.top)) : Math.max(...rows.map(({ r }) => r.top));
    const row = rows.filter(({ r }) => Math.abs(r.top - rowTop) < 2);
    row.sort((a, b) => Math.abs(a.r.left + a.r.width / 2 - cx) - Math.abs(b.r.left + b.r.width / 2 - cx));
    return row[0]?.b ?? null;
  }

  function onGridKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    const index = Number(target.dataset.emojiIndex);
    if (Number.isNaN(index)) return;
    const rtl = isRtlAt(target);
    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        focusIndex(index + (rtl ? -1 : 1));
        break;
      case "ArrowLeft":
        event.preventDefault();
        focusIndex(index + (rtl ? 1 : -1));
        break;
      case "ArrowDown":
      case "ArrowUp": {
        event.preventDefault();
        const next = vertical(target, event.key === "ArrowDown" ? 1 : -1);
        if (next) focusIndex(Number(next.dataset.emojiIndex));
        else if (event.key === "ArrowUp") searchRef.current?.focus();
        break;
      }
      case "Home":
        event.preventDefault();
        focusIndex(0);
        break;
      case "End":
        event.preventDefault();
        focusIndex(flat.length - 1);
        break;
    }
  }

  // Script-requested smooth scrolling ignores the reduced-motion CSS, so it is chosen here (WCAG 2.3.3).
  const reducedMotion = useSheenReducedMotion();
  function jumpTo(sectionId: string) {
    setQuery("");
    requestAnimationFrame(() => {
      const grid = gridRef.current;
      const el = grid?.querySelector<HTMLElement>(`[data-emoji-section="${CSS.escape(sectionId)}"]`);
      if (!grid || !el) return;
      // The grid is `relative`, so it is the section's offsetParent: `offsetTop` is already the distance
      // inside the scroller (the grid's own offset in its popover must not be subtracted).
      grid.scrollTo({ top: el.offsetTop, behavior: reducedMotion ? "auto" : "smooth" });
      setCurrent(sectionId);
    });
  }

  let counter = 0;
  const renderButton = (e: ChatEmoji) => {
    const index = counter++;
    const pressed = chosen.has(e.char);
    return (
      <button
        key={`${e.char}-${index}`}
        type="button"
        data-emoji-index={index}
        tabIndex={index === activeIndex ? 0 : -1}
        aria-label={e.name}
        aria-pressed={selected ? pressed : undefined}
        title={e.name}
        onClick={() => onSelect(e.char)}
        onFocus={() => setActive(index)}
        className={cn(
          "relative flex aspect-square w-full cursor-pointer items-center justify-center rounded-sheen-sm text-[1.375rem] leading-none select-none",
          "transition-[background-color,scale] duration-(--sheen-duration-fast) ease-sheen-out",
          "hover:bg-sheen-hover motion-ok:hover:scale-110 motion-ok:active:scale-95",
          "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sheen-focus",
          "touch-manipulation [-webkit-tap-highlight-color:transparent]",
          pressed && "bg-sheen-accent-soft ring-1 ring-sheen-accent-border ring-inset forced-colors:ring-[Highlight]",
        )}
      >
        <span
          aria-hidden
          className="font-[system-ui,'Apple_Color_Emoji','Segoe_UI_Emoji','Noto_Color_Emoji',sans-serif]"
        >
          {e.char}
        </span>
      </button>
    );
  };

  const gridClass =
    "grid grid-cols-[repeat(auto-fill,minmax(2.25rem,1fr))] gap-0.5 any-pointer-coarse:grid-cols-[repeat(auto-fill,minmax(2.75rem,1fr))]";

  return (
    <div
      data-slot="emoji-picker"
      className={cn("flex w-[min(20rem,calc(100vw-2.5rem))] max-w-full min-w-0 flex-col gap-2", className)}
    >
      {/* Search */}
      <div className="glass-1 flex h-9 items-center gap-2 rounded-sheen-full border-sheen-control-border px-3 [-webkit-backdrop-filter:none] [backdrop-filter:none] has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-sheen-focus any-pointer-coarse:h-11">
        <SearchIcon className="size-4 text-sheen-fg-muted" />
        <input
          ref={searchRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              focusIndex(0);
            } else if (e.key === "Enter" && results?.[0]) {
              e.preventDefault();
              onSelect(results[0].char);
            }
          }}
          aria-label={L.searchEmoji}
          aria-controls={`${id}-grid`}
          placeholder={L.searchEmoji}
          enterKeyHint="search"
          className="h-full w-full min-w-0 bg-transparent text-sm text-sheen-fg outline-none placeholder:text-sheen-fg-subtle forced-colors:focus-visible:outline-none! any-pointer-coarse:text-base [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              searchRef.current?.focus();
            }}
            aria-label={L.clearSearch}
            className="relative -me-1.5 flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-sheen-fg-muted hover:bg-sheen-hover hover:text-sheen-fg focus-visible:outline-2 focus-visible:outline-sheen-focus any-pointer-coarse:after:absolute any-pointer-coarse:after:size-11"
          >
            <XIcon className="size-3.5" />
          </button>
        )}
      </div>

      {/* Category shortcuts */}
      {!results && (
        <div className="flex items-center justify-between gap-0.5" role="group" aria-label={L.emoji}>
          {sections.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => jumpTo(s.id)}
              aria-label={s.title}
              title={s.title}
              aria-current={current === s.id ? "true" : undefined}
              className={cn(
                "relative flex size-8 cursor-pointer items-center justify-center rounded-sheen-sm text-base leading-none grayscale-[0.6] transition-[background-color,filter] duration-(--sheen-duration-fast)",
                "hover:bg-sheen-hover hover:grayscale-0 focus-visible:outline-2 focus-visible:outline-sheen-focus",
                "aria-[current=true]:bg-sheen-accent-soft aria-[current=true]:grayscale-0",
                "after:absolute after:inset-x-2 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-sheen-accent after:opacity-0 aria-[current=true]:after:opacity-100 forced-colors:aria-[current=true]:after:bg-[Highlight]",
                "any-pointer-coarse:size-9",
              )}
            >
              <span aria-hidden>{s.icon}</span>
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- roving-focus grid: the handler moves focus between the emoji buttons with the arrow keys */}
      <div
        ref={gridRef}
        id={`${id}-grid`}
        role="group"
        aria-label={results ? L.resultsCount(results.length) : L.emoji}
        onKeyDown={onGridKeyDown}
        className="relative h-56 overflow-y-auto overscroll-contain [scrollbar-width:thin] -mx-1 px-1"
      >
        {results ? (
          results.length === 0 ? (
            <p role="status" className="flex h-full items-center justify-center text-sm text-sheen-fg-muted">
              {L.noEmoji}
            </p>
          ) : (
            <div className={gridClass}>{results.map(renderButton)}</div>
          )
        ) : (
          sections.map((s) => (
            <div key={s.id} data-emoji-section={s.id} role="group" aria-labelledby={`${id}-${s.id}`} className="pb-2">
              <p
                id={`${id}-${s.id}`}
                className="px-1 pt-1 pb-1.5 text-2xs font-semibold tracking-wide text-sheen-fg-muted uppercase"
              >
                {s.title}
              </p>
              <div className={gridClass}>{s.emojis.map(renderButton)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
