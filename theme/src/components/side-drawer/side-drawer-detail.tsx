"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";

import { cn } from "../../lib/cn";
import { useControllable } from "../../hooks/use-controllable";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { spring } from "../../motion/tokens";
import { Badge } from "../badge/badge";
import { Button } from "../button/button";
import { CopyChip, type CopyLabels } from "../description-list/copy-button";
import { EmptyState } from "../empty-state/empty-state";
import { Kbd } from "../kbd/kbd";
import { Menu, MenuContent, MenuTrigger } from "../menu/menu";
import { Skeleton, SkeletonCircle, SkeletonGroup } from "../skeleton/skeleton";
import { Tabs, TabsList, TabsPanel, TabsTab } from "../tabs/tabs";
import { Tooltip } from "../tooltip/tooltip";
import { AlertIcon } from "../status-icons/icons";
import { ChevronDownIcon, ChevronUpIcon, InboxIcon, MoreIcon, PencilIcon } from "./icons";
import {
  SideDrawerBody,
  SideDrawerFooter,
  SideDrawerHeader,
  sideDrawerIconButtonClass,
  useSideDrawer,
} from "./side-drawer";
import { SideDrawerEditContext, type SideDrawerEditContextValue } from "./side-drawer-form";

/* ---------- Record navigation ---------- */

/**
 * Every user-facing string of `SideDrawerRecordNav` (accessible names, announcements, placeholders);
 * pass a partial `labels` prop to translate or reword them. Entries that need a count or a name are
 * functions.
 */
export type SideDrawerRecordNavLabels = {
  /** Name and tooltip of the "previous record" button. */
  previous: string;
  /** Name and tooltip of the "next record" button. */
  next: string;
  /** Key caps in the tooltips. The shortcuts themselves are always K (previous) and J (next). */
  previousKey: string;
  /** Key cap shown for J in the "next" tooltip. */
  nextKey: string;
  /** "3 of 312" (1-based position). */
  position: (position: number, count: number) => string;
};

/**
 * Default English strings of `SideDrawerRecordNavLabels`; spread it and override single keys to
 * reword. Plain data with no DOM access: safe to read while prerendering. The module is `"use
 * client"`, so a React Server Component receives a client reference instead of the object: read it
 * from a client component.
 */
export const defaultSideDrawerRecordNavLabels: SideDrawerRecordNavLabels = {
  previous: "Previous",
  next: "Next",
  previousKey: "K",
  nextKey: "J",
  position: (position, count) => `${position.toLocaleString()} of ${count.toLocaleString()}`,
};

/** Props of `SideDrawerRecordNav`; each option is documented on its field. */
export type SideDrawerRecordNavProps = {
  /** 0-based index of the record shown. */
  index: number;
  /** How many records there are to walk through. */
  count: number;
  /** Called with the new 0-based index when the person moves to another record. */
  onIndexChange: (index: number) => void;
  /** J (next) / K (previous) while focus is in the drawer and not in a text field. Default true. */
  keyboardShortcuts?: boolean;
  /** Override the strings (i18n). */
  labels?: Partial<SideDrawerRecordNavLabels>;
  /** Adds extra classes to the navigation. */
  className?: string;
};

/** Focus is somewhere typing (or arrow keys) must keep working. */
function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  if (target.closest("input, textarea, select")) return true;
  const role = target.getAttribute("role");
  return role === "textbox" || role === "combobox" || role === "spinbutton" || role === "slider" || role === "listbox";
}

/**
 * Previous / next record controls for a `SideDrawerFooter`: ↑ / ↓ buttons, "3 of 312", and J (next) / K (previous) keys. The buttons stay focusable at the ends (`aria-disabled`), so keyboard users can discover them.
 * `SideDrawerDetail` renders it from its `navigation` prop; use it yourself in a custom footer. `index` is 0-based; `count` is the number of records.
 *
 * Keyboard: Tab to the buttons, Enter or Space moves; J / K move while focus is in the drawer and not in a text field (`keyboardShortcuts={false}` turns them off). Accessibility: labelled buttons with tooltips showing the key;
 * the position is plain text. Glass and motion: colour transitions only.
 *
 * @example
 * ```tsx
 * import { useState } from "react";
 * import { SideDrawerFooter, SideDrawerRecordNav } from "@sheenui/theme";
 *
 * // Placeholders for your own code:
 * declare const rows: unknown[];
 *
 * export function Example() {
 *   const [index, setIndex] = useState(0);
 *
 *   return (
 *     <SideDrawerFooter start={<SideDrawerRecordNav index={index} count={rows.length} onIndexChange={setIndex} />} />
 *   );
 * }
 * ```
 *
 * @see /overlays/side-drawer
 */
export function SideDrawerRecordNav({
  index,
  count,
  onIndexChange,
  keyboardShortcuts = true,
  labels: labelsProp,
  className,
}: SideDrawerRecordNavProps) {
  const labels = { ...defaultSideDrawerRecordNavLabels, ...labelsProp };
  const rootRef = useRef<HTMLDivElement>(null);
  const atStart = index <= 0;
  const atEnd = index >= count - 1;

  const go = useCallback(
    (step: number) => {
      const next = index + step;
      if (next < 0 || next >= count) return;
      onIndexChange(next);
    },
    [index, count, onIndexChange],
  );

  useEffect(() => {
    if (!keyboardShortcuts) return;
    const panel = rootRef.current?.closest<HTMLElement>("[data-slot='side-drawer']");
    if (!panel) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey || event.isComposing) return;
      if (isEditableTarget(event.target)) return;
      const key = event.key.toLowerCase();
      if (key !== "j" && key !== "k") return;
      event.preventDefault();
      go(key === "j" ? 1 : -1);
    };
    panel.addEventListener("keydown", onKeyDown);
    return () => panel.removeEventListener("keydown", onKeyDown);
  }, [keyboardShortcuts, go]);

  const button = (step: -1 | 1) => {
    const disabled = step === -1 ? atStart : atEnd;
    const label = step === -1 ? labels.previous : labels.next;
    const key = step === -1 ? "K" : "J";
    return (
      <Tooltip
        content={
          <span className="flex items-center gap-2">
            {label}
            {keyboardShortcuts && <Kbd>{step === -1 ? labels.previousKey : labels.nextKey}</Kbd>}
          </span>
        }
      >
        <button
          type="button"
          aria-label={label}
          aria-disabled={disabled || undefined}
          aria-keyshortcuts={keyboardShortcuts ? key : undefined}
          onClick={() => go(step)}
          // 32px buttons, 44px hit area on touch screens.
          className={cn(sideDrawerIconButtonClass, "size-8 any-pointer-coarse:after:-inset-1.5")}
        >
          {step === -1 ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </button>
      </Tooltip>
    );
  };

  return (
    <div ref={rootRef} data-slot="side-drawer-record-nav" className={cn("flex items-center gap-1", className)}>
      {button(-1)}
      {button(1)}
      <span className="ms-1.5 text-xs font-medium whitespace-nowrap text-sheen-fg-muted tabular-nums">
        {labels.position(index + 1, count)}
      </span>
    </div>
  );
}

/* ---------- Detail ---------- */

/** A tab of `SideDrawerDetail`: its value, label, content and an optional count. */
export type SideDrawerDetailTab = {
  value: string;
  label: ReactNode;
  content: ReactNode;
  /** A small count after the label ("Activity 12"). */
  count?: number;
};

/** Whether `SideDrawerDetail` shows the record (`view`) or its form (`edit`). */
export type SideDrawerDetailMode = "view" | "edit";

/**
 * Every user-facing string of `SideDrawerDetail` (accessible names, announcements, placeholders); pass
 * a partial `labels` prop to translate or reword them. Entries that need a count or a name are
 * functions.
 */
export type SideDrawerDetailLabels = {
  /** The Edit button. */
  edit: string;
  /** Accessible name of the ⋯ menu button. */
  moreActions: string;
  /** Badge shown in place of the status while editing. */
  editing: string;
  /** Title while the record's title is not known yet, and the skeleton's spoken label. */
  loading: string;
  /** Name of the tab list. */
  sections: string;
  /** Heading of the load-error state. */
  errorTitle: string;
  /** The Retry button of the load-error state. */
  retry: string;
  /** Heading of the empty state. */
  emptyTitle: string;
  /** Text of the empty state. */
  emptyDescription: string;
  /** Announced after moving to another record. */
  moved: (title: string, position: string) => string;
  /** Copy chip strings. */
  copy: Partial<CopyLabels>;
};

/**
 * Default English strings of `SideDrawerDetailLabels`; spread it and override single keys to reword.
 * Plain data with no DOM access: safe to read while prerendering. The module is `"use client"`, so a
 * React Server Component receives a client reference instead of the object: read it from a client
 * component.
 */
export const defaultSideDrawerDetailLabels: SideDrawerDetailLabels = {
  edit: "Edit",
  moreActions: "More actions",
  editing: "Editing",
  loading: "Loading…",
  sections: "Sections",
  errorTitle: "Couldn’t load this record",
  retry: "Try again",
  emptyTitle: "Nothing selected",
  emptyDescription: "Pick a record to see its details here.",
  moved: (title, position) => `${title}, ${position}`,
  copy: {},
};

/** Props of `SideDrawerDetail`; each option is documented on its field. */
export type SideDrawerDetailProps = {
  /** Shows the record's name in the header. */
  title?: ReactNode;
  /** Plain-text title for announcements when `title` is not a string. */
  titleText?: string;
  /** Shows text under the title, such as an email or a date. */
  subtitle?: ReactNode;
  /** Shows an Avatar or icon before the title. */
  avatar?: ReactNode;
  /** Shows content next to the title, usually a Badge. */
  status?: ReactNode;
  /** An id shown as a copyable chip under the title. */
  recordId?: string;
  /** What the id is, for its accessible name ("Order ID"). */
  recordIdLabel?: string;
  /** Adds extra header buttons, before Edit. */
  actions?: ReactNode;
  /** MenuItem elements for the ⋯ menu (Duplicate, Archive, Delete…). */
  menu?: ReactNode;
  /** Show the Edit button. Defaults to on when there is an `editor` or `onEdit`. */
  editable?: boolean;
  /** Called when Edit is pressed (before switching to the editor, if any). */
  onEdit?: () => void;
  /** Shown in place of the details while editing: a SideDrawerForm. */
  editor?: ReactNode;
  /** Sets the current mode, "view" or "edit", when controlled. */
  mode?: SideDrawerDetailMode;
  /** Sets the starting mode when uncontrolled. Default "view". */
  defaultMode?: SideDrawerDetailMode;
  /** Called when the mode changes (Edit pressed, Cancel, a successful save). */
  onModeChange?: (mode: SideDrawerDetailMode) => void;
  /** Sections as tabs (list in the header, panels in the body). */
  tabs?: SideDrawerDetailTab[];
  /** Sets the active tab's value when controlled. */
  tab?: string;
  /** Sets the starting tab when uncontrolled. Defaults to the first. */
  defaultTab?: string;
  /** Called when another tab is chosen. */
  onTabChange?: (tab: string) => void;
  /** Body content when there are no tabs. */
  children?: ReactNode;
  /** Extra footer content on the end side (view mode). */
  footer?: ReactNode;
  /** Controls for moving to the previous or next record. */
  navigation?: SideDrawerRecordNavProps;
  /** Identity of the record: changing it slides the content and announces the move. */
  recordKey?: string | number;
  /** The record is loading: the body shows a skeleton. Default false. */
  loading?: boolean;
  /** Loading failed: a message (or true), with Retry when `onRetry` is set. */
  error?: ReactNode;
  /** Called when Retry is pressed (the button shows only when this is set). */
  onRetry?: () => void;
  /** No record to show. Default false. */
  empty?: boolean;
  /** Override the strings (i18n). */
  labels?: Partial<SideDrawerDetailLabels>;
  /** Adds extra classes to the scrolling body. */
  bodyClassName?: string;
};

/** Placeholder for a description list while a record loads. */
function DetailSkeleton({ label }: { label: string }) {
  return (
    <SkeletonGroup labels={{ loading: label }} className="flex flex-col gap-6">
      <div className="flex flex-col divide-y divide-sheen-border">
        {[38, 62, 46, 70, 52, 34].map((width, i) => (
          <div key={i} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-6 py-3.5">
            <Skeleton shape="text" width={`${[60, 48, 70, 55, 64, 50][i]}%`} className="h-3" />
            <Skeleton shape="text" width={`${width + 20}%`} className="h-3" />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <SkeletonCircle size="sm" />
        <Skeleton shape="text" width="45%" className="h-3" />
      </div>
    </SkeletonGroup>
  );
}

/**
 * SideDrawerDetail: the "record details" pattern for a `SideDrawerContent`. Use it when people click a row and want to see (and maybe edit) that record without leaving the list.
 *
 * - Header: avatar, name, status, subtitle and a copyable id chip; Edit and a ... menu (`menu` takes `MenuItem`s, `actions` adds buttons).
 * - Tabs in the sticky header (`tabs`: `{ value, label, content }`), their panels in the scrolling body; or pass `children` when there are no tabs.
 * - Footer: previous / next record (buttons with tooltips, J / K keys) and "3 of 312" (`navigation`); `footer` adds extra content.
 * - States: `loading` (a skeleton in the body; the header keeps what it knows), `error` (with Retry when `onRetry` is set) and `empty`.
 * - View and edit: Edit swaps the body for `editor` (a `SideDrawerForm`) in place. Cancel / Save come back to the view; focus goes to the first field on the way in and back to Edit on the way out.
 *   Moving between records (`recordKey`) slides the content up / down and announces the move.
 * - Controlled or not: `mode` / `defaultMode` / `onModeChange` and `tab` / `defaultTab` / `onTabChange`; `labels` translates every string.
 *
 * Keyboard: Tab through the header buttons, tabs (arrow keys), body and footer; J / K move between records. Accessibility: the title is the drawer's accessible name; tabs follow the Tabs pattern; moving records is announced politely.
 * Glass and motion: transform only on anything that may hold glass (the body, the form); only plain text (the title) also fades. Reduced motion: content swaps without moving.
 *
 * @example
 * ```tsx
 * import { useState } from "react";
 * import { DescriptionList, Input, SideDrawerContent, SideDrawerDetail, SideDrawerForm } from "@sheenui/theme";
 *
 * // Placeholders for your own code:
 * declare const customer: { id: string; name: string; email: string };
 * declare const rows: unknown[];
 * declare const items: { label: string; value: string }[];
 * declare function save(values: typeof customer): void;
 *
 * export function Example() {
 *   const [current, setCurrent] = useState(0);
 *
 *   return (
 *     <SideDrawerContent size="lg">
 *       <SideDrawerDetail
 *         title={customer.name}
 *         subtitle={customer.email}
 *         recordId={customer.id}
 *         tabs={[{ value: "overview", label: "Overview", content: <DescriptionList items={items} /> }]}
 *         navigation={{ index: current, count: rows.length, onIndexChange: setCurrent }}
 *         editor={<SideDrawerForm key={customer.id} initialValues={customer} onSubmit={save}>{(form) => <Input label="Name" {...form.field("name")} />}</SideDrawerForm>}
 *       />
 *     </SideDrawerContent>
 *   );
 * }
 * ```
 *
 * @see /overlays/side-drawer
 */
export function SideDrawerDetail({
  title,
  titleText,
  subtitle,
  avatar,
  status,
  recordId,
  recordIdLabel,
  actions,
  menu,
  editable,
  onEdit,
  editor,
  mode: modeProp,
  defaultMode = "view",
  onModeChange,
  tabs,
  tab: tabProp,
  defaultTab,
  onTabChange,
  children,
  footer,
  navigation,
  recordKey,
  loading = false,
  error,
  onRetry,
  empty = false,
  labels: labelsProp,
  bodyClassName,
}: SideDrawerDetailProps) {
  const labels = { ...defaultSideDrawerDetailLabels, ...labelsProp };
  const reduced = useSheenReducedMotion();
  const drawer = useSideDrawer();
  /** Edit comes in from the inline end: the right, or the left in right-to-left pages. */
  const inlineEnd = drawer?.dir === "rtl" ? -1 : 1;
  const notify = drawer?.notify;

  /* Mode (view / edit), controlled or not. */
  const [mode, setModeValue] = useControllable<SideDrawerDetailMode>(modeProp, defaultMode);
  const editing = mode === "edit" && editor != null;
  const setMode = useCallback(
    (next: SideDrawerDetailMode) => {
      setModeValue(next);
      onModeChange?.(next);
    },
    [setModeValue, onModeChange],
  );

  /* Tab, controlled or not. */
  const [tab, changeTab] = useControllable(tabProp, defaultTab ?? tabs?.[0]?.value ?? "", onTabChange);

  /* Focus: back to Edit after leaving the editor (if focus was in the drawer). */
  const editRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef(false);
  const editContext = useMemo<SideDrawerEditContextValue>(
    () => ({
      exit: () => {
        returnFocus.current = true;
        setMode("view");
      },
    }),
    [setMode],
  );
  // In the commit, before Base UI moves focus that was lost (the editor's buttons are gone) to the panel.
  useLayoutEffect(() => {
    if (mode !== "view" || !returnFocus.current) return;
    returnFocus.current = false;
    editRef.current?.focus({ preventScroll: true });
  }, [mode]);

  /* Which way content slides: into edit from the inline end, back from the start; records up / down. */
  const position = navigation?.index;
  const [previous, setPrevious] = useState({ mode, recordKey, position });
  const [motionState, setMotionState] = useState({ x: 0, y: 0 });
  const [announcement, setAnnouncement] = useState("");
  const plainTitle = titleText ?? (typeof title === "string" ? title : "");
  if (previous.mode !== mode || previous.recordKey !== recordKey) {
    // Derived from the previous render's props (React's "storing information from previous renders").
    const was = previous;
    setPrevious({ mode, recordKey, position });
    const x = was.mode !== mode ? (mode === "edit" ? 1 : -1) : 0;
    const y = x === 0 && was.recordKey !== recordKey ? ((position ?? 0) >= (was.position ?? 0) ? 1 : -1) : 0;
    setMotionState({ x, y });
    if (y !== 0 && navigation) {
      setAnnouncement(
        labels.moved(
          plainTitle,
          (navigation.labels?.position ?? defaultSideDrawerRecordNavLabels.position)(
            navigation.index + 1,
            navigation.count,
          ),
        ),
      );
    }
  }

  const showEdit = editable ?? (Boolean(editor) || Boolean(onEdit));
  function startEdit() {
    onEdit?.();
    if (editor != null) setMode("edit");
  }

  const headerTitle = title ?? (loading ? <span className="text-sheen-fg-muted">{labels.loading}</span> : null);

  const headerActions = editing ? null : (
    <>
      {actions}
      {showEdit && (
        <Button
          ref={editRef}
          variant="glass"
          size="sm"
          onClick={startEdit}
          leading={<PencilIcon className="size-3.5" />}
          className="me-1 @max-md/side-drawer:w-8 @max-md/side-drawer:px-0"
        >
          <span className="@max-md/side-drawer:sr-only">{labels.edit}</span>
        </Button>
      )}
      {menu && (
        <Menu>
          <Tooltip content={labels.moreActions}>
            <MenuTrigger aria-label={labels.moreActions} className={sideDrawerIconButtonClass}>
              <MoreIcon />
            </MenuTrigger>
          </Tooltip>
          <MenuContent align="end">{menu}</MenuContent>
        </Menu>
      )}
    </>
  );

  const description =
    subtitle || recordId ? (
      <span className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1.5">
        {subtitle && <span className="min-w-0 [overflow-wrap:anywhere]">{subtitle}</span>}
        {recordId && <CopyChip value={recordId} label={recordIdLabel} labels={labels.copy} />}
      </span>
    ) : undefined;

  /** The body for a tab (or the whole body without tabs), after the loading / error / empty states. */
  function stateOr(content: ReactNode) {
    if (loading) return <DetailSkeleton label={labels.loading} />;
    if (error)
      return (
        <EmptyState
          role="alert"
          tone="danger"
          icon={<AlertIcon />}
          title={labels.errorTitle}
          description={error === true ? undefined : error}
          action={
            onRetry ? (
              <Button variant="glass" onClick={onRetry}>
                {labels.retry}
              </Button>
            ) : undefined
          }
        />
      );
    if (empty)
      return (
        <EmptyState
          tone="neutral"
          icon={<InboxIcon />}
          title={labels.emptyTitle}
          description={labels.emptyDescription}
        />
      );
    return content;
  }

  // Another record starts at the top of the body, without the previous record's "Saved" notice.
  const bodyRef = useRef<HTMLDivElement>(null);
  const shownRecord = useRef(recordKey);
  useLayoutEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
    if (shownRecord.current === recordKey) return;
    shownRecord.current = recordKey;
    notify?.(null);
  }, [recordKey, notify]);

  // View ⇄ edit: body and footer slide sideways together. Another record: only the body content
  // slides up / down, the sticky footer (with the navigation you are using) stays put.
  const modeSlide = reduced
    ? { initial: false as const }
    : { initial: { x: `${motionState.x * inlineEnd * 1.5}rem` }, animate: { x: 0 }, transition: spring.gentle };
  const recordSlide = reduced
    ? { initial: false as const }
    : { initial: { y: `${motionState.y * 0.75}rem` }, animate: { y: 0 }, transition: spring.gentle };

  const view = (
    <>
      <SideDrawerBody scrollRef={bodyRef} className={bodyClassName} aria-busy={loading || undefined}>
        <motion.div key={String(recordKey ?? "")} {...recordSlide} data-slot="side-drawer-detail-record">
          {tabs && tabs.length > 0
            ? tabs.map((item) => (
                <TabsPanel key={item.value} value={item.value} className="outline-offset-4">
                  {stateOr(item.content)}
                </TabsPanel>
              ))
            : stateOr(children)}
        </motion.div>
      </SideDrawerBody>
      {(Boolean(navigation) || Boolean(footer)) && (
        <SideDrawerFooter start={navigation ? <SideDrawerRecordNav {...navigation} /> : undefined}>
          {footer}
        </SideDrawerFooter>
      )}
    </>
  );

  const content = (
    <>
      <SideDrawerHeader
        leading={avatar ?? (loading && title === undefined ? <SkeletonCircle size="md" /> : undefined)}
        title={
          headerTitle && (
            <motion.span
              key={String(recordKey ?? "")}
              // Plain text: it may fade. Nothing glass lives in here.
              initial={reduced || motionState.y === 0 ? false : { opacity: 0, y: motionState.y * 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={spring.gentle}
              className="inline-block"
            >
              {headerTitle}
            </motion.span>
          )
        }
        status={editing ? <Badge tone="accent">{labels.editing}</Badge> : status}
        description={description}
        actions={headerActions}
      >
        {tabs && tabs.length > 0 && !editing && (
          <TabsList aria-label={labels.sections} className="self-start">
            {tabs.map((item) => (
              <TabsTab key={item.value} value={item.value}>
                {item.label}
                {item.count !== undefined && (
                  <span className="text-xs text-sheen-fg-muted tabular-nums">{item.count}</span>
                )}
              </TabsTab>
            ))}
          </TabsList>
        )}
      </SideDrawerHeader>

      {/* Clips the slide, so content never shows outside the panel while it moves. */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <motion.div
          key={mode}
          {...modeSlide}
          data-slot="side-drawer-detail-content"
          className="flex min-h-0 flex-1 flex-col"
        >
          {editing ? <SideDrawerEditContext value={editContext}>{editor}</SideDrawerEditContext> : view}
        </motion.div>
      </div>

      <span aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </>
  );

  return tabs && tabs.length > 0 ? (
    <Tabs
      value={tab}
      onValueChange={(value) => changeTab(String(value))}
      className="flex min-h-0 flex-1 flex-col gap-0"
    >
      {content}
    </Tabs>
  ) : (
    content
  );
}
