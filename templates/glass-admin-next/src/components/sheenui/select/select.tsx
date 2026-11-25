"use client";

import {
  Fragment,
  useCallback,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type FocusEventHandler,
  type ReactNode,
  type Ref,
} from "react";
import { Select as BaseSelect } from "@base-ui/react/select";

import { cn } from "../lib/cn";
import { segmentByGroup } from "../lib/group-segments";
import { SpinnerIcon } from "../spinner/spinner";
import { fieldHeight, type FieldSize } from "../lib/field-size";
import { useControllable } from "../hooks/use-controllable";
import { useLatest } from "../hooks/use-latest";
import { useMergedRef } from "../lib/form";
import { GlideHighlightScope, MenuHighlight } from "../lib/glide-highlight";
import { popupMotion } from "../lib/popup-motion";
import { popupA11yProps } from "../lib/popup-a11y";
import { pageSize } from "../lib/page-size";
import { shouldVirtualize, useVirtualWindow } from "../hooks/use-virtual-window";
import {
  SheetHandle,
  useSheetActionsRef,
  sheetBackdropClass,
  sheetPopupClass,
  sheetPositionerClass,
  useSheetMode,
  type MobilePresentation,
} from "../drawer/parts/sheet";

/** One option of a `Select`: the stored value and what it shows. */
export type SelectItem = {
  /** The value that is stored and submitted. */
  value: string;
  /** What the option shows. Pass a string, or a node when `label` is not needed for type-ahead. */
  label: ReactNode;
  /** Shows the second line under the label. */
  description?: string;
  /** Icon, flag or avatar before the label. */
  icon?: ReactNode;
  /** Items with the same group are listed under one heading. */
  group?: string;
  /** Not selectable. */
  disabled?: boolean;
};

/** Translatable text of {@link Select}. */
export type SelectLabels = {
  /** Shown in the trigger while nothing is selected (the `placeholder` prop overrides it). */
  placeholder: string;
  /** Heading for items without a `group` when other items have one. */
  otherGroup: string;
  /** Accessible name of the sheet's handle, which closes the sheet (`mobile="sheet"`). */
  close: string;
};

/** The English {@link SelectLabels} used when `labels` is omitted; a partial `labels` prop is merged over it. */
export const defaultSelectLabels: SelectLabels = { placeholder: "Select…", otherGroup: "Other", close: "Close" };

/** Props of `Select`; each option is documented on its field. */
export type SelectProps = {
  /** Takes the options, in display order. */
  items: SelectItem[];
  /** The selected value (controlled). `null` means nothing selected. */
  value?: string | null;
  /** Sets the starting value when uncontrolled. */
  defaultValue?: string | null;
  /** Called with the new value when the person picks an option. */
  onValueChange?: (value: string | null) => void;
  /** Whether the list is open (controlled). Pair with `onOpenChange`. Leave it out to let the trigger decide. */
  open?: boolean;
  /** Whether the list starts open when uncontrolled. Default false. */
  defaultOpen?: boolean;
  /** Called when the list opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Text above the trigger, linked to it as its accessible name. */
  label?: ReactNode;
  /** Muted helper text under the trigger. */
  description?: ReactNode;
  /** Error message under the trigger. Marks the select invalid and is announced. */
  error?: ReactNode;
  /** Shown in the trigger while nothing is selected, as a node. Default `labels.placeholder` ("Select…"). */
  placeholder?: ReactNode;
  /** Every string, for translation: the placeholder and the heading of ungrouped items. */
  labels?: Partial<SelectLabels>;
  /**
   * Id of the trigger button; a generated one is used when omitted.
   *
   * @default generated
   */
  id?: string;
  /** Submits the value with a form. */
  name?: string;
  /** Marks the field as required for form validation. */
  required?: boolean;
  /** Disables the select and its popup. */
  disabled?: boolean;
  /** Height, consistent across every form control: "sm" 32px, "md" 40px, "lg" 48px (sm and md are 44px on touch screens), the same scale as Button. Default "md". */
  size?: FieldSize;
  /** The options are on their way: the trigger shows a spinner and is marked busy (`aria-busy`). Keep passing the items you have. Default false. */
  loading?: boolean;
  /** Show the value but do not allow changes. */
  readOnly?: boolean;
  /** Accessible name when there is no visible `label`. */
  "aria-label"?: string;
  /** Id of an element that names the select. */
  "aria-labelledby"?: string;
  /** Id of extra help text; joined with the description and error ids. */
  "aria-describedby"?: string;
  /** Marks the select invalid without an `error` message. */
  "aria-invalid"?: boolean | "true" | "false";
  /** Ref to the trigger button (focus target). Form libraries use it to focus the field after a failed validation. */
  ref?: Ref<HTMLButtonElement>;
  /** Called when the trigger loses focus (react-hook-form: marks the field touched). */
  onBlur?: FocusEventHandler<HTMLButtonElement>;
  /** Class for the outer wrapper (label + trigger + helper text), same as Input and Combobox. */
  className?: string;
  /** Class for the trigger button. */
  triggerClassName?: string;
  /**
   * Windows the list so only the options near the viewport are in the DOM: `true` always, `false` never, `"auto"`
   * only above 200 options (`VIRTUALIZE_THRESHOLD`). Arrow keys, Home / End, PageUp / PageDown and type-ahead still
   * reach every option, `aria-setsize` / `aria-posinset` keep the count for screen readers, and the scroll height
   * does not change. Windowed rows are a fixed height (one line; a `description` is cut to fit) and group headings
   * are visual only.
   *
   * @default "auto"
   */
  virtualized?: boolean | "auto";
  /**
   * How the list opens on a phone-width screen (`max-width: 640px`): `"popup"` is the usual floating list;
   * `"sheet"` is a bottom sheet with a drag handle, swipe-down to dismiss, a scrollable body capped at 85 dvh,
   * home-indicator padding and a dimmed scrim. Focus is trapped and returned and Escape closes in both.
   *
   * @default "popup"
   */
  mobile?: MobilePresentation;
};

/** One line of a windowed list: an option or the heading of a group. */
type Row =
  | { kind: "heading"; key: string; label: string }
  | { kind: "item"; key: string; item: SelectItem; option: number; group?: string };

const GAP = 6;

/**
 * A glass select: opens below the trigger, supports groups, icons and descriptions,
 * and you can type to jump to an option. For search or multi-select, use Combobox.
 *
 * `className` styles the outer wrapper (label + trigger + helper text); `triggerClassName` the button.
 * Pass the options as `items`; controlled with `value` + `onValueChange` or uncontrolled with `defaultValue`;
 * Open it from code with `open` + `onOpenChange` (or `defaultOpen`); `error` marks it invalid and is announced; `name` submits the value with a form. For form libraries it forwards
 * `ref` (the trigger), `onBlur`, `name`, `required`, `disabled`, `aria-invalid` and `aria-describedby`.
 *
 * Long lists are windowed (`virtualized`, on by default above 200 options): 5,000 options open and scroll as fast as five.
 * On phones `mobile="sheet"` opens the list as a bottom sheet.
 *
 * Keyboard: Enter, Space or ↓ opens the list; ↑ ↓ move, Home and End jump, typing jumps to a matching option;
 * Enter or Space selects, Escape closes and returns focus to the trigger. A windowed list keeps all of this across every option.
 * Accessibility: Base UI's select pattern (`role="combobox"` trigger and `listbox` popup, `aria-selected` options); the label,
 * description and error are linked with `aria-labelledby`, `aria-describedby` and `aria-invalid`; items are 44px tall on
 * touch; the trigger border is 3:1 (WCAG 1.4.11).
 * Glass and motion: `glass-1` trigger and a `glass-3` popup (one backdrop surface open at a time). The popup springs out of
 * the trigger and options drift in one after another (at most 18ms apart); reduced motion fades only. As a sheet it slides up
 * from the bottom edge and follows the finger when dragged; reduced motion fades it in place.
 *
 * @example
 * ```tsx
 * import { Select } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <Select
 *       label="Country"
 *       placeholder="Choose a country"
 *       items={[
 *         { value: "in", label: "India" },
 *         { value: "us", label: "United States" },
 *       ]}
 *       onValueChange={(code) => console.log(code)}
 *     />
 *   );
 * }
 * ```
 *
 * @see /components/select
 */
export function Select({
  items,
  value,
  defaultValue,
  onValueChange,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  label,
  description,
  error,
  placeholder: placeholderProp,
  labels: labelsProp,
  id,
  name,
  required,
  disabled,
  size = "md",
  loading = false,
  readOnly,
  className,
  triggerClassName,
  virtualized,
  mobile = "popup",
  ref,
  onBlur,
  ...aria
}: SelectProps) {
  const labels = { ...defaultSelectLabels, ...labelsProp };
  const placeholder = placeholderProp ?? labels.placeholder;
  const autoId = useId();
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange);
  const descriptionId = `${autoId}-description`;
  const errorId = `${autoId}-error`;
  const [labelId, setLabelId] = useState<string | undefined>();
  const readLabelId = useCallback((el: HTMLElement | null) => setLabelId(el?.id), []);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const mergedTriggerRef = useMergedRef(triggerRef, ref);

  const byValue = useMemo(() => new Map(items.map((i) => [i.value, i])), [items]);
  const otherGroup = labels.otherGroup;
  const groups = useMemo(
    () =>
      items.some((i) => i.group)
        ? Object.entries(
            items.reduce<Record<string, SelectItem[]>>((acc, item) => {
              (acc[item.group ?? otherGroup] ??= []).push(item);
              return acc;
            }, {}),
          )
        : null,
    [items, otherGroup],
  );

  // Keep the translucent popup clear of the label (when it flips above) and the helper text (below).
  const sideOffset = useCallback(({ side }: { side: string }) => {
    const wrap = rootRef.current?.getBoundingClientRect();
    const trigger = triggerRef.current?.getBoundingClientRect();
    if (!wrap || !trigger) return GAP;
    if (side === "bottom") return GAP + Math.max(0, wrap.bottom - trigger.bottom);
    if (side === "top") return GAP + Math.max(0, trigger.top - wrap.top);
    return GAP;
  }, []);

  /* ----- windowing (long lists) ----- */
  const virtual = shouldVirtualize(virtualized, items.length);
  const sheet = useSheetMode(mobile);
  const actionsRef = useSheetActionsRef();
  const popupRef = useRef<HTMLDivElement>(null);
  const [innerValue, setInnerValue] = useState<string | null>(defaultValue ?? null);
  const selected = value !== undefined ? value : innerValue;
  const rowClass = items.some((i) => i.description) ? "h-14" : "h-10 any-pointer-coarse:h-11";
  const rows = useMemo<Row[]>(() => {
    if (!virtual) return [];
    const out: Row[] = [];
    let option = 0;
    const push = (list: SelectItem[], group?: string) => {
      for (const item of list) out.push({ kind: "item", key: item.value, item, option: option++, group });
    };
    if (groups) {
      for (const [group, groupItems] of groups) {
        out.push({ kind: "heading", key: `\u0000${group}`, label: group });
        push(groupItems, group);
      }
    } else push(items);
    return out;
  }, [virtual, items, groups]);
  const optionRows = useMemo(() => rows.flatMap((r, at) => (r.kind === "item" ? [{ at, item: r.item }] : [])), [rows]);
  const {
    ref: listRef,
    element: listElement,
    scrollToIndex,
    start,
    end,
    size: rowSize,
    totalSize,
  } = useVirtualWindow({ count: rows.length, enabled: virtual, estimateSize: 40, overscan: 8 });
  // The row that holds focus stays rendered even when it is scrolled out of the window.
  const [activeRow, setActiveRow] = useState<number | null>(null);
  const [focusTick, setFocusTick] = useState(0);
  const activeRowRef = useLatest(activeRow);
  const typed = useRef({ text: "", at: 0 });

  // Opening: bring the selected option to the middle of the list (and so into the DOM) before Base UI looks for it.
  useLayoutEffect(() => {
    if (!virtual || !open || !listElement) return;
    const at = optionRows.find((o) => o.item.value === selected)?.at;
    if (at !== undefined) scrollToIndex(at, "center");
  }, [virtual, open, listElement, optionRows, selected, scrollToIndex]);

  // After a keyboard move the target row exists: give it focus (Base UI highlights the focused option).
  useLayoutEffect(() => {
    if (!virtual || focusTick === 0 || activeRowRef.current === null) return;
    const el = listElement?.querySelector<HTMLElement>(`[data-row="${activeRowRef.current}"]`);
    if (el && document.activeElement !== el) el.focus({ preventScroll: true });
  }, [virtual, focusTick, listElement, activeRowRef]);

  const goToRow = (target: number) => {
    const above = rows[target - 1]?.kind === "heading" ? target - 1 : target;
    scrollToIndex(above, "nearest");
    scrollToIndex(target, "nearest");
    setActiveRow(target);
    setFocusTick((n) => n + 1);
  };

  /** Arrow keys, Home / End, PageUp / PageDown and type-ahead over the whole list, not just the rendered rows. */
  const handleWindowKey = (event: KeyboardEvent<HTMLElement>) => {
    if (!virtual || event.ctrlKey || event.metaKey || event.altKey) return;
    const enabledOptions = optionRows.filter((o) => !o.item.disabled);
    const enabled = enabledOptions.map((o) => o.at);
    if (enabled.length === 0) return;
    const current = activeRowRef.current;
    const position = current === null ? -1 : lastAtOrBefore(enabled, current);
    const exact = current !== null && enabled[position] === current;
    const page = pageSize(listElement, rowSize);
    let next: number | undefined;
    switch (event.key) {
      case "ArrowDown":
        next = enabled[position + 1];
        break;
      case "ArrowUp":
        next = enabled[exact ? position - 1 : Math.max(0, position)];
        break;
      case "PageDown":
        next = enabled[Math.min(enabled.length - 1, Math.max(0, position) + page)];
        break;
      case "PageUp":
        next = enabled[Math.max(0, position - page)];
        break;
      case "Home":
        next = enabled[0];
        break;
      case "End":
        next = enabled.at(-1);
        break;
      default: {
        const char = event.key;
        const now = Date.now();
        const typing = now - typed.current.at < 700 && typed.current.text !== "";
        if (char.length !== 1 || (char === " " && !typing)) return;
        typed.current = { text: (typing ? typed.current.text : "") + char.toLowerCase(), at: now };
        const text = typed.current.text;
        const from = text.length === 1 ? position + 1 : Math.max(0, position);
        const matches = ({ item }: { item: SelectItem }) =>
          (typeof item.label === "string" ? item.label : item.value).toLowerCase().startsWith(text);
        next = [...enabledOptions.slice(from), ...enabledOptions.slice(0, from)].find(matches)?.at;
        event.preventDefault();
        event.stopPropagation();
        if (next !== undefined) goToRow(next);
        return;
      }
    }
    event.preventDefault();
    event.stopPropagation();
    // At either end the key does nothing, like the unwindowed list.
    if (next !== undefined) goToRow(next);
  };

  const renderItem = (item: SelectItem, i: number, at?: number) => {
    const windowed = at !== undefined;
    return (
      <BaseSelect.Item
        data-slot="select-item"
        key={item.value}
        value={item.value}
        disabled={item.disabled}
        label={typeof item.label === "string" ? item.label : undefined}
        style={
          windowed
            ? {
                position: "absolute",
                insetInline: 0,
                top: at * rowSize,
                height: rowSize,
              }
            : ({ "--i": i } as CSSProperties)
        }
        {...(windowed
          ? {
              "data-row": at,
              "data-vrow": "",
              "aria-setsize": optionRows.length,
              "aria-posinset": i + 1,
            }
          : {})}
        className={cn(
          "relative isolate grid cursor-pointer grid-cols-[1rem_auto_1fr] items-center gap-2.5 rounded-sheen-sm py-2 pe-4 ps-2.5 text-sm outline-none select-none",
          "min-h-10 any-pointer-coarse:min-h-11",
          "data-disabled:cursor-not-allowed data-disabled:opacity-45",
          // Items drift in one after another as the menu opens (≤ 20ms apart). Windowed rows mount while scrolling: no entrance.
          windowed
            ? rowClass
            : "motion-ok:animate-[sheen-item-in_var(--sheen-duration-base)_var(--sheen-ease-out)_both] motion-ok:[animation-delay:calc(var(--i)*18ms)]",
        )}
        render={(itemProps, state) => (
          <div {...itemProps} className={cn(itemProps.className, state.highlighted && "sheen-fill")}>
            {/* The pill glides between options, like the Menu's. */}
            <MenuHighlight active={state.highlighted} />
            {itemProps.children}
          </div>
        )}
      >
        <BaseSelect.ItemIndicator className="col-start-1 flex text-sheen-accent">
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="size-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </BaseSelect.ItemIndicator>
        {/* Decorative: the label beside it is the accessible name. */}
        <span aria-hidden className="col-start-2 flex items-center">
          {item.icon}
        </span>
        <span className="col-start-3 flex min-w-0 flex-col">
          <BaseSelect.ItemText className="truncate font-medium">{item.label}</BaseSelect.ItemText>
          {item.description && <span className="truncate text-xs text-sheen-fg-muted">{item.description}</span>}
        </span>
      </BaseSelect.Item>
    );
  };

  // One stable list for Base UI: 5,000 options must not be re-mapped on every render.
  const baseItems = useMemo(() => items.map((i) => ({ value: i.value, label: i.label })), [items]);
  let optionCount = 0;
  const renderPlain = (item: SelectItem) => renderItem(item, optionCount++);

  const invalid = Boolean(error) || aria["aria-invalid"] === true || aria["aria-invalid"] === "true";
  const describedBy =
    [aria["aria-describedby"], error ? errorId : undefined, description ? descriptionId : undefined]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <BaseSelect.Root
      id={id}
      actionsRef={actionsRef}
      items={baseItems}
      value={value}
      defaultValue={defaultValue}
      onValueChange={(v) => {
        setInnerValue(v);
        onValueChange?.(v);
      }}
      open={open}
      onOpenChange={setOpen}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      name={name}
    >
      <div ref={rootRef} data-slot="select" className={cn("flex w-full flex-col gap-1.5", className)}>
        {label && (
          <BaseSelect.Label
            data-slot="select-label"
            // Base UI derives the label's id and ignores an `id` prop, so the list reads it back from the element.
            ref={readLabelId}
            className="cursor-default text-sm font-medium text-sheen-fg"
          >
            {label}
          </BaseSelect.Label>
        )}
        <BaseSelect.Trigger
          data-slot="select-trigger"
          ref={mergedTriggerRef}
          onBlur={onBlur}
          {...withoutUndefined({
            // Only defined keys: an explicit `undefined` would wipe Base UI's label wiring.
            "aria-label": aria["aria-label"],
            "aria-labelledby": aria["aria-labelledby"],
            "aria-describedby": describedBy,
            "aria-invalid": invalid || undefined,
            "aria-busy": loading || undefined,
          })}
          className={cn(
            // The field's edge is its only outline: the >= 3:1 control boundary (WCAG 1.4.11).
            fieldHeight[size],
            "group glass-1 relative flex w-full min-w-44 cursor-pointer items-center justify-between gap-3 rounded-sheen-md border-sheen-control-border px-3.5 text-sm select-none any-pointer-coarse:text-base",
            "transition-[box-shadow,border-color] duration-(--sheen-duration-fast) ease-sheen-out",
            "focus-visible:border-sheen-accent focus-visible:shadow-[0_0_0_4px_var(--sheen-ring)]",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-sheen-focus",
            "data-popup-open:border-sheen-accent data-disabled:cursor-not-allowed data-disabled:opacity-55",
            invalid && "border-sheen-danger-border data-popup-open:border-sheen-danger-border",
            triggerClassName,
          )}
        >
          {/* Invisible hit area: at least 44 px tall on touch screens, without changing the look (a real element,
              not ::after, which the glass surface owns for its rim). */}
          <span
            aria-hidden
            className="absolute top-1/2 left-1/2 hidden size-full min-h-11 -translate-1/2 any-pointer-coarse:block"
          />
          {/* Rendered from the current value, so the icon is right in controlled and uncontrolled use. */}
          <BaseSelect.Value className="flex min-w-0 items-center gap-2 data-placeholder:text-sheen-fg-subtle">
            {(current: string | null) => {
              if (current == null) return placeholder;
              const item = byValue.get(current);
              return (
                <>
                  {item?.icon && (
                    <span aria-hidden className="flex shrink-0">
                      {item.icon}
                    </span>
                  )}
                  <span className="truncate">{item ? item.label : current}</span>
                </>
              );
            }}
          </BaseSelect.Value>
          <BaseSelect.Icon className="flex text-sheen-fg-muted">
            {loading ? (
              <SpinnerIcon className="size-4" />
            ) : (
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="size-4 group-data-popup-open:rotate-180 motion-ok:transition-transform motion-ok:duration-(--sheen-duration-base) motion-ok:ease-sheen-out"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            )}
          </BaseSelect.Icon>
        </BaseSelect.Trigger>
        {error && (
          <p data-slot="select-error" id={errorId} role="alert" className="text-xs font-medium text-sheen-danger-text">
            {error}
          </p>
        )}
        {description && (
          <p data-slot="select-description" id={descriptionId} className="text-xs text-sheen-fg-muted">
            {description}
          </p>
        )}
      </div>

      <BaseSelect.Portal>
        {sheet && <BaseSelect.Backdrop className={sheetBackdropClass} />}
        {/* Open below the trigger. Base UI's default "align item with trigger" mode overlays the
            trigger, and a translucent glass menu would show the trigger through it. */}
        <BaseSelect.Positioner
          {...popupA11yProps}
          className={cn("z-50 outline-none select-none", sheet && sheetPositionerClass)}
          sideOffset={sideOffset}
          alignItemWithTrigger={false}
        >
          <BaseSelect.Popup
            ref={popupRef}
            data-slot="select-popup"
            data-sheet={sheet ? "" : undefined}
            onFocusCapture={
              virtual
                ? (event) => {
                    const row = (event.target as HTMLElement).closest<HTMLElement>("[data-row]")?.dataset.row;
                    if (row !== undefined) setActiveRow(Number(row));
                  }
                : undefined
            }
            onKeyDownCapture={virtual ? handleWindowKey : undefined}
            className={cn(
              sheet
                ? cn("glass-3 pt-1 [--sheen-sheet-pb:0.25rem] [--sheen-sheet-px:0.25rem]", sheetPopupClass)
                : cn(
                    "glass-3 min-w-(--anchor-width) max-w-(--available-width) origin-(--transform-origin) rounded-sheen-md p-1 outline-none",
                    popupMotion,
                  ),
            )}
          >
            {sheet && <SheetHandle popupRef={popupRef} actionsRef={actionsRef} label={labels.close} />}
            <GlideHighlightScope>
              <BaseSelect.List
                ref={listRef}
                // The listbox is named like the field: its own `aria-labelledby`, else the visible label, else `aria-label`.
                aria-labelledby={aria["aria-labelledby"] ?? (label ? labelId : undefined)}
                aria-label={aria["aria-labelledby"] || label ? undefined : (aria["aria-label"] ?? labels.placeholder)}
                className={cn(
                  "scroll-py-1 overflow-y-auto overscroll-contain",
                  sheet ? "max-h-[min(70dvh,32rem)]" : "max-h-(--available-height)",
                )}
              >
                {virtual ? (
                  <div role="presentation" className="relative w-full" style={{ height: totalSize }}>
                    {segmentByGroup(
                      windowRows(rows.length, start, end, activeRow).flatMap((at) => {
                        const row = rows[at];
                        return row ? [{ at, row }] : [];
                      }),
                      ({ row }) => (row.kind === "heading" ? row.label : row.group),
                    ).map((segment) => {
                      const body = segment.entries.map(({ at, row }) =>
                        row.kind === "heading" ? (
                          <div
                            key={row.key}
                            role="presentation"
                            aria-hidden
                            data-vrow=""
                            className={cn(
                              "absolute inset-x-0 flex items-end truncate px-2.5 pb-1 text-2xs font-semibold tracking-[0.12em] text-sheen-fg-muted uppercase",
                              rowClass,
                            )}
                            style={{ top: at * rowSize, height: rowSize }}
                          >
                            {row.label}
                          </div>
                        ) : (
                          renderItem(row.item, row.option, at)
                        ),
                      );
                      // A named group per run of rows: the heading is not a node when it has scrolled out of the window.
                      return segment.label ? (
                        <div key={segment.key} role="group" aria-label={segment.label}>
                          {body}
                        </div>
                      ) : (
                        <Fragment key={segment.key}>{body}</Fragment>
                      );
                    })}
                  </div>
                ) : groups ? (
                  groups.map(([group, groupItems]) => (
                    <BaseSelect.Group key={group} className="pb-1 last:pb-0">
                      <BaseSelect.GroupLabel className="px-2.5 pt-2 pb-1 text-2xs font-semibold tracking-[0.12em] text-sheen-fg-muted uppercase">
                        {group}
                      </BaseSelect.GroupLabel>
                      {groupItems.map(renderPlain)}
                    </BaseSelect.Group>
                  ))
                ) : (
                  items.map(renderPlain)
                )}
              </BaseSelect.List>
            </GlideHighlightScope>
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
}

function withoutUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>;
}

/** Index of the last entry that is `<= limit` in an ascending list, or -1. */
function lastAtOrBefore(sorted: number[], limit: number) {
  let found = -1;
  for (let i = 0; i < sorted.length && (sorted[i] ?? Infinity) <= limit; i++) found = i;
  return found;
}

/** The rows to render: the visible window, plus the row that holds focus when it was scrolled away. */
function windowRows(count: number, start: number, end: number, pinned: number | null) {
  const out: number[] = [];
  const pin = pinned !== null && (pinned < start || pinned >= end) && pinned < count ? pinned : null;
  if (pin !== null && pin < start) out.push(pin);
  for (let at = start; at < end; at++) out.push(at);
  if (pin !== null && pin > start) out.push(pin);
  return out;
}
