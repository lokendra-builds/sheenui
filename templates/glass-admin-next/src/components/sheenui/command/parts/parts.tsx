"use client";

import { Fragment, type ReactNode } from "react";
import { motion, useIsPresent } from "motion/react";

import { cn } from "../../lib/cn";
import { segmentByGroup } from "../../lib/group-segments";
import { duration, spring } from "../../motion/tokens";
import { KbdShortcut } from "../../kbd/kbd";
import { toAriaKeyShortcuts, type KbdLabels, type ShortcutPlatform } from "../../kbd/shortcut";
import { type CommandPaletteLabels, highlightMatch, type Row, type Section } from "./model";

/* ---------- parts ---------- */

/** The props of one page of results. @internal */
export type ResultsPageProps = {
  sections: Section[];
  active: Row | undefined;
  optionId: (row: Row) => string;
  headingId: (index: number) => string;
  layoutId: string | undefined;
  reserveIcon: boolean;
  labels: CommandPaletteLabels;
  platform: ShortcutPlatform;
  shortcutLabels: Partial<KbdLabels> | undefined;
  onHover: (row: Row) => void;
  onChoose: (row: Row) => void;
  empty: ReactNode;
  /** A windowed list: the flat rows (headings included), which of them to render and how tall each is. */
  windowed?: WindowedPage;
};

/** One line of a windowed result list: a group heading or a result. @internal */
export type VirtualRow =
  { kind: "heading"; key: string; label: string } | { kind: "option"; row: Row; position: number; group?: string };

/** The windowed layout of a results page. @internal */
export type WindowedPage = {
  rows: VirtualRow[];
  /** Indexes into `rows` to render. */
  visible: number[];
  /** Height of every row in px. */
  size: number;
  /** Tailwind height class that matches `size`. */
  heightClass: string;
  /** Number of results (headings do not count). */
  total: number;
};

/**
 * One page of results. While a page slides out it keeps its last content, but it is inert,
 * hidden from screen readers and drops its ids, so nothing points at it any more.
 */
export function ResultsPage({
  sections,
  active,
  optionId,
  headingId,
  layoutId,
  reserveIcon,
  labels,
  platform,
  shortcutLabels,
  onHover,
  onChoose,
  empty,
  windowed,
}: ResultsPageProps) {
  const present = useIsPresent();
  if (sections.length === 0) {
    return (
      <div role="presentation" inert={!present} aria-hidden={!present || undefined}>
        {empty}
      </div>
    );
  }
  if (windowed) {
    return (
      <div role="presentation" inert={!present} aria-hidden={!present || undefined} className="p-2">
        <div role="presentation" className="relative w-full" style={{ height: windowed.rows.length * windowed.size }}>
          {segmentByGroup(
            windowed.visible.flatMap((at) => {
              const entry = windowed.rows[at];
              return entry ? [{ at, entry }] : [];
            }),
            ({ entry }) => (entry.kind === "heading" ? entry.label : entry.group),
          ).map((segment) => {
            const body = segment.entries.map(({ at, entry }) => {
              const top = at * windowed.size;
              if (entry.kind === "heading") {
                return (
                  <div
                    key={entry.key}
                    role="presentation"
                    aria-hidden
                    data-vrow=""
                    style={{ top, height: windowed.size }}
                    className={cn(
                      "absolute inset-x-0 flex items-end truncate px-2.5 pb-1.5 text-2xs font-semibold tracking-[0.12em] text-sheen-fg-muted uppercase select-none",
                      windowed.heightClass,
                    )}
                  >
                    {entry.label}
                  </div>
                );
              }
              const { row } = entry;
              return (
                <Option
                  key={row.key}
                  id={present ? optionId(row) : undefined}
                  row={row}
                  active={row === active}
                  layoutId={layoutId}
                  showPath={row.key.startsWith("recent:") && row.path.length > 0}
                  reserveIcon={reserveIcon}
                  labels={labels}
                  shortcutAria={row.item.shortcut ? toAriaKeyShortcuts(row.item.shortcut, platform) : undefined}
                  shortcutLabels={shortcutLabels}
                  onHover={() => onHover(row)}
                  onChoose={() => onChoose(row)}
                  window={{
                    top,
                    size: windowed.size,
                    heightClass: windowed.heightClass,
                    setSize: windowed.total,
                    position: entry.position,
                  }}
                />
              );
            });
            // A named group per run of rows: the heading is not a node once it has scrolled out of the window.
            return segment.label ? (
              <div key={segment.key} role="group" aria-label={segment.label}>
                {body}
              </div>
            ) : (
              <Fragment key={segment.key}>{body}</Fragment>
            );
          })}
        </div>
      </div>
    );
  }
  return (
    <div role="presentation" inert={!present} aria-hidden={!present || undefined} className="p-2">
      {sections.map((section, sectionIndex) => {
        const body = section.rows.map((row) => (
          <Option
            key={row.key}
            id={present ? optionId(row) : undefined}
            row={row}
            active={row === active}
            layoutId={layoutId}
            // Search results are already grouped under their page; recents need the context.
            showPath={section.key === "recent" && row.path.length > 0}
            reserveIcon={reserveIcon}
            labels={labels}
            shortcutAria={row.item.shortcut ? toAriaKeyShortcuts(row.item.shortcut, platform) : undefined}
            shortcutLabels={shortcutLabels}
            onHover={() => onHover(row)}
            onChoose={() => onChoose(row)}
          />
        ));
        const hid = present ? headingId(sectionIndex) : undefined;
        return section.heading ? (
          <div key={section.key} role="group" aria-labelledby={hid} className="pb-1.5 last:pb-0">
            <div
              id={hid}
              aria-hidden
              className="px-2.5 pt-2.5 pb-1.5 text-2xs font-semibold tracking-[0.12em] text-sheen-fg-muted uppercase select-none"
            >
              {section.heading}
            </div>
            {body}
          </div>
        ) : (
          <div key={section.key} role="presentation" className="pb-1.5 last:pb-0">
            {body}
          </div>
        );
      })}
    </div>
  );
}

/** The props of one result option. @internal */
export type OptionProps = {
  id: string | undefined;
  row: Row;
  active: boolean;
  layoutId: string | undefined;
  showPath: boolean;
  /** Keep an empty icon tile so labels line up with rows that have icons. */
  reserveIcon: boolean;
  labels: CommandPaletteLabels;
  shortcutAria: string | undefined;
  shortcutLabels: Partial<KbdLabels> | undefined;
  onHover: () => void;
  onChoose: () => void;
  /** Placement and set position of a row in a windowed list. */
  window?: { top: number; size: number; heightClass: string; setSize: number; position: number };
};

/** One result option row. @internal */
export function Option({
  id,
  row,
  active,
  layoutId,
  showPath,
  reserveIcon,
  labels,
  shortcutAria,
  shortcutLabels,
  onHover,
  onChoose,
  window: placed,
}: OptionProps) {
  const { item, match, path } = row;
  const label = match ? highlightMatch(item.label, match.indices) : item.label;
  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus -- listbox option driven by aria-activedescendant: focus stays in the search field (mousedown is prevented), the keyboard works there
    <div
      id={id}
      role="option"
      aria-selected={active}
      aria-disabled={item.disabled ? true : undefined}
      aria-keyshortcuts={shortcutAria}
      aria-setsize={placed?.setSize}
      aria-posinset={placed?.position}
      data-vrow={placed ? "" : undefined}
      style={placed ? { position: "absolute", insetInline: 0, top: placed.top, height: placed.size } : undefined}
      data-highlighted={active ? "" : undefined}
      onPointerMove={onHover}
      // Keep focus in the search field when a result is clicked.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onChoose}
      className={cn(
        placed ? placed.heightClass : "min-h-11",
        !placed && "relative",
        "isolate flex cursor-pointer items-center gap-3 rounded-sheen-md px-2.5 py-1.5 text-sm text-sheen-fg select-none",
        "touch-manipulation [-webkit-tap-highlight-color:transparent]",
        "aria-disabled:cursor-not-allowed aria-disabled:opacity-45",
        // High contrast: the active row turns Highlight / HighlightText (and drops the text backplate).
        active && "sheen-fill",
      )}
    >
      {active && (
        <motion.span
          aria-hidden
          layoutId={layoutId}
          transition={spring.snappy}
          className="pointer-events-none absolute inset-0 -z-10 rounded-sheen-md bg-sheen-accent-soft shadow-[inset_0_0_0_1px_var(--sheen-accent-border)] forced-colors:hidden"
        />
      )}
      {item.icon != null ? (
        <span
          aria-hidden
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-sheen-sm border border-sheen-border bg-sheen-surface/60 text-sheen-fg-muted [&_svg]:size-4",
            "transition-colors duration-(--sheen-duration-fast) in-data-highlighted:text-sheen-accent",
          )}
        >
          {item.icon}
        </span>
      ) : (
        reserveIcon && <span aria-hidden className="size-8 shrink-0" />
      )}
      <span className="flex min-w-0 flex-1 flex-col">
        {item.items ? (
          // A page: screen readers hear "<label>, opens more options" (translatable as one string).
          <span className="truncate font-medium">
            <span aria-hidden>{label}</span>
            <span className="sr-only">{labels.opensPage(item.label)}</span>
          </span>
        ) : (
          <span className="truncate font-medium">{label}</span>
        )}
        {item.description && <span className="truncate text-xs text-sheen-fg-muted">{item.description}</span>}
      </span>
      {(showPath || Boolean(item.hint) || Boolean(item.shortcut) || Boolean(item.items)) && (
        <span className="ms-auto flex shrink-0 items-center gap-2 ps-2 text-xs text-sheen-fg-muted">
          {showPath && <span className="max-w-24 truncate sm:max-w-40">{path.map((p) => p.label).join(" › ")}</span>}
          {item.hint && <span className="inline-flex shrink-0 items-center">{item.hint}</span>}
          {/* Shortcuts are for keyboards: hidden on phones. */}
          {item.shortcut && (
            <KbdShortcut
              keys={item.shortcut}
              announce={false}
              labels={shortcutLabels}
              aria-hidden
              className="hidden sm:inline-flex"
            />
          )}
          {item.items && (
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="size-4 rtl:rotate-180"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 6 6 6-6 6" />
            </svg>
          )}
        </span>
      )}
    </div>
  );
}

/** The search icon of the input. @internal */
export function SearchIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-5 shrink-0 text-sheen-fg-muted"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

/** The empty state shown when nothing matches. @internal */
export function EmptyState({ title, hint, reduced }: { title: string; hint?: ReactNode; reduced: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: reduced ? 0 : 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduced ? { duration: duration.fast } : spring.gentle}
      className="flex flex-col items-center gap-3 px-6 py-10 text-center"
    >
      <span
        aria-hidden
        className="flex size-11 items-center justify-center rounded-sheen-md border border-sheen-border bg-sheen-surface/60 text-sheen-fg-muted"
      >
        <svg
          viewBox="0 0 24 24"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5M8.5 8.5l5 5M13.5 8.5l-5 5" />
        </svg>
      </span>
      <div className="flex max-w-full flex-col gap-1">
        <p className="text-sm font-medium [overflow-wrap:anywhere] text-sheen-fg">{title}</p>
        {hint && <p className="text-xs text-sheen-fg-muted">{hint}</p>}
      </div>
    </motion.div>
  );
}
