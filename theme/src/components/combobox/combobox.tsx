"use client";

import { AlertIcon, CheckIcon, CloseIcon } from "../status-icons/icons";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FocusEventHandler,
  type ReactNode,
  type Ref,
} from "react";
import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { useResolvedDirection } from "../../hooks/use-direction";
import { shouldVirtualize } from "../../hooks/use-virtual-window";
import { usePageKeys } from "./page-keys";
import { Chip } from "./chip";
import { PlusIcon, RetryIcon } from "./icons";
import { WindowedOptions, WindowedResultCount, type WindowedScrollApi } from "./windowed-options";
import { useLatest } from "../../hooks/use-latest";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";

import { cn } from "../../lib/cn";
import { SpinnerIcon } from "../spinner/spinner";
import { fieldMinHeight, type FieldSize } from "../../lib/field-size";
import { GlideHighlightScope, MenuHighlight } from "../../lib/glide-highlight";
import { popupMotion } from "../../lib/popup-motion";
import { typeablePopupA11yProps } from "../../lib/popup-a11y";
import { duration, ease, spring } from "../../motion/tokens";
import { useSheenReducedMotion } from "../../hooks/use-preferences";

/** One choice in a {@link Combobox}. */
export type ComboboxOption = {
  /** Stable id of the option; this is what `value` and `onValueChange` carry. */
  value: string;
  /** Text shown in the list and in the field; also what typing filters on. */
  label: string;
  /** Shows the second line under the label. */
  description?: string;
  /** Icon, flag or avatar shown before the label. */
  icon?: ReactNode;
  /** Options with the same group are listed under one heading. */
  group?: string;
  /** Show the option but make it unselectable. */
  disabled?: boolean;
};

/** Translatable text of {@link Combobox}. */
export type ComboboxLabels = {
  /** Heading for options without a `group` when other options have one. */
  otherGroup: string;
  /** Multiple: placeholder once at least one chip is selected. */
  placeholderMore: string;
  /** Async: shown before the user has typed anything. */
  startTyping: string;
  /** Async: shown while results load. */
  searching: string;
  /** Async: shown when `loadOptions` fails. */
  error: string;
  /** Async: the option that runs the search again after a failure. */
  retry: string;
  /** Label of the "create" option. */
  create: (query: string) => string;
  /** Shown under the field when `onCreate` fails. */
  createError: (query: string) => string;
  /** Accessible name of the clear button. */
  clear: string;
  /** Accessible name of the chevron button. */
  trigger: string;
  /** Multiple: accessible name of the chip toolbar. */
  chips: string;
  /** Multiple: accessible name of a chip's remove button. */
  remove: (label: string) => string;
  /** Multiple: screen-reader hint read on a focused chip. */
  chipHint: string;
  /** Multiple: screen-reader hint read on the input when chips exist. */
  selectedHint: (count: number) => string;
  /** Spoken (politely) after the person types and the list settles: "5 results". Not spoken for 0 results (the empty state is) or while loading. */
  results: (count: number) => string;
};

/** The English {@link ComboboxLabels} used when `labels` is omitted; a partial `labels` prop is merged over it. */
export const defaultComboboxLabels: ComboboxLabels = {
  otherGroup: "Other",
  placeholderMore: "Add more…",
  startTyping: "Start typing to search.",
  searching: "Searching…",
  error: "Couldn’t load results.",
  retry: "Try again",
  create: (q) => `Create “${q}”`,
  createError: (q) => `Couldn’t create “${q}”. Try again.`,
  clear: "Clear selection",
  trigger: "Show options",
  chips: "Selected",
  remove: (l) => `Remove ${l}`,
  chipHint: "Press Backspace or Delete to remove",
  selectedHint: (n) => `${n} selected. From the start of the input, press Left Arrow to reach the selected items.`,
  results: (n) => (n === 1 ? "1 result" : `${n} results`),
};

type BaseProps = {
  /** All options. With `loadOptions`, these are shown before the user types. */
  options?: ComboboxOption[];
  /** Visible label above the field. Without one, pass `aria-label` or `aria-labelledby`. */
  label?: ReactNode;
  /** Helper text under the field; replaced by `error` when there is one. */
  description?: ReactNode;
  /** Shows an error message under the field. Marks the field invalid and is announced. */
  error?: ReactNode;
  /** Sets the placeholder of the text input. */
  placeholder?: string;
  /** Let users add an option that isn't in the list. Return the new option (or a promise of it). */
  onCreate?: (label: string) => ComboboxOption | Promise<ComboboxOption>;
  /** Fetch options from a server as the user types (debounced). Errors are caught and shown in the popup. */
  loadOptions?: (query: string) => Promise<ComboboxOption[]>;
  /** Sets the debounce for `loadOptions`, in ms. */
  debounceMs?: number;
  /** Called when `loadOptions` or `onCreate` throws, for logging. The UI already shows the error. */
  onError?: (error: unknown) => void;
  /** Called with the new state when the popup opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Escape on a closed popup clears the selection (ARIA combobox pattern). In a multiple Combobox it is off unless you
   * set it, so one key press can't wipe every chip.
   *
   * @default on for single, off for multiple
   */
  clearOnEscape?: boolean;
  /** Runs when the text input gains focus. */
  onFocus?: FocusEventHandler<HTMLInputElement>;
  /** Blur handler of the text input. */
  onBlur?: FocusEventHandler<HTMLInputElement>;
  /** Ref to the text input (focus target). Form libraries use it to focus the field after a failed validation. */
  ref?: Ref<HTMLInputElement>;

  /**
   * Id of the text input; a generated one is used when omitted.
   *
   * @default generated
   */
  id?: string;
  /** Submits the selected value(s) with a form. */
  name?: string;
  /** Mark the field as required. */
  required?: boolean;
  /** Disable the whole field. */
  disabled?: boolean;
  /** Show the value but do not let it change. */
  readOnly?: boolean;
  /** Focus the input on mount. */
  autoFocus?: boolean;
  /** Accessible name when there is no visible `label`. */
  "aria-label"?: string;
  /** Id of an element that names the field. */
  "aria-labelledby"?: string;
  /** Id of extra descriptive text (the helper text is linked automatically). */
  "aria-describedby"?: string;
  /** Force the invalid state (also set by `error`). */
  "aria-invalid"?: boolean | "true" | "false";

  /** Height, consistent across every form control: "sm" 32px, "md" 40px, "lg" 48px (sm and md are 44px on touch screens), the same scale as Button. Default "md". */
  size?: FieldSize;
  /** Class for the outer wrapper (label + field + helper text), same as Input and Select. */
  className?: string;
  /** Class for the text <input> inside the field. */
  inputClassName?: string;
  /**
   * Windows the option list so only the options near the viewport are in the DOM: `true` always, `false` never,
   * `"auto"` only above 200 options (`VIRTUALIZE_THRESHOLD`). Keyboard navigation, `aria-activedescendant`, filtering and
   * `aria-setsize` / `aria-posinset` work across every option, and the scroll height does not change. Windowed rows are
   * a fixed height (one line; a `description` is cut to fit); options are listed group by group and group headings are
   * visual only.
   *
   * @default "auto"
   */
  virtualized?: boolean | "auto";

  // ---- UI strings (translate these) ----
  /** What shows when nothing matches (a string or any node). */
  emptyState?: ReactNode;
  /** Every other string, for translation: `labels={{ clear: "Effacer" }}`. A partial object is merged over `defaultComboboxLabels`. */
  labels?: Partial<ComboboxLabels>;
};

/**
 * Props of {@link Combobox}: the shared options above plus either the single-select shape
 * (`value`: `string | null`) or the multiple shape (`multiple: true`, `value`: `string[]`, `maxSelected`).
 */
export type ComboboxProps = BaseProps &
  (
    | {
        /**
         * Lets the person pick only one option.
         * @default false
         */
        multiple?: false;
        /** The selected option's `value` (controlled). `null` is no selection. */
        value?: string | null;
        /** The selected option's `value` on mount (uncontrolled). */
        defaultValue?: string | null;
        /** Called with the new value, or `null` when cleared. */
        onValueChange?: (value: string | null) => void;
        maxSelected?: never;
      }
    | {
        /** Select2-style tags: pick many, shown as removable chips. */
        multiple: true;
        /** Sets the selected `value`s when controlled. */
        value?: string[];
        /** The selected `value`s on mount (uncontrolled). */
        defaultValue?: string[];
        /** Called with the new list of values. */
        onValueChange?: (value: string[]) => void;
        /** Stop adding chips after this many. */
        maxSelected?: number;
      }
  );

type Item = ComboboxOption & { __create?: string; __retry?: true };
type Group = { value: string; items: Item[] };

const CREATE_PREFIX = "__sheen_create__:";
const RETRY_VALUE = "__sheen_retry__";
const GAP = 6;

/**
 * Searchable select (Select2-style): single or multiple selection with chips, groups, icons, a
 * "create" option and async search. Built on Base UI Combobox. Use it instead of a Select when
 * the list is long enough that people will want to type to find an item.
 *
 * Props: see {@link ComboboxProps} (`options`, `label`, `description`, `error`, `placeholder`,
 * `multiple`, `value` / `defaultValue` / `onValueChange`, `maxSelected`, `onCreate`,
 * `loadOptions` with `debounceMs`, `onError`, `clearOnEscape`, form and ARIA attributes, and
 * every UI string for translation). `className` styles the outer wrapper (label + field +
 * helper text); `inputClassName` the text input.
 *
 * Long lists are windowed (`virtualized`, automatic above 200 options): 5,000 options filter, open and scroll without a long task.
 *
 * Keyboard: Type to filter; Down / Up move through the options (Down opens the list), Enter picks, Escape closes (on a closed list it clears a single selection). In multiple mode Backspace removes the last chip and Left / Right move through the chips.
 * Accessibility: The ARIA combobox pattern: an input with `aria-expanded`, `aria-controls` and a listbox of options; result counts, loading, errors and "create" are announced politely; `error` marks the field invalid and is linked to it; chips have remove buttons with names.
 * Glass: The input is one `glass-1` field and the popup one glass surface.
 * Motion: The popup scales and fades in, chips animate in and out and the active highlight glides between options; reduced motion removes the movement.
 *
 * @example
 * ```tsx
 * import { useState } from "react";
 * import { Combobox } from "@sheenui/theme";
 *
 * const countries = [
 *   { value: "in", label: "India" },
 *   { value: "jp", label: "Japan" },
 * ];
 *
 * export function CountryPicker() {
 *   const [country, setCountry] = useState<string | null>(null);
 *   return <Combobox label="Country" options={countries} value={country} onValueChange={setCountry} />;
 * }
 * ```
 *
 * @see /components/combobox
 */
export function Combobox(props: ComboboxProps) {
  const {
    options = [],
    label,
    description,
    error,
    placeholder = "Search…",
    onCreate,
    loadOptions,
    debounceMs = 250,
    onError,
    onOpenChange,
    clearOnEscape,
    onFocus,
    onBlur,
    ref: inputRefProp,
    id: idProp,
    name,
    required,
    disabled,
    readOnly,
    autoFocus,
    className,
    inputClassName,
    size = "md",
    emptyState = "No results found.",
    labels: labelsProp,
  } = props;
  const {
    otherGroup: otherGroupLabel,
    placeholderMore,
    startTyping: startTypingText,
    searching: searchingText,
    error: errorText,
    retry: retryText,
    create: createText,
    createError: createErrorText,
    clear: clearLabel,
    trigger: triggerLabel,
    chips: chipsLabel,
    remove: removeLabel,
    chipHint,
    selectedHint,
    results: resultsText,
  } = { ...defaultComboboxLabels, ...labelsProp };
  const multiple = props.multiple === true;
  const maxSelected = multiple ? props.maxSelected : undefined;

  const autoId = useId();
  const inputId = idProp ?? `${autoId}-input`;
  const labelId = `${autoId}-label`;
  const helperId = `${autoId}-helper`;
  const errorId = `${autoId}-error`;
  const reduced = useSheenReducedMotion();

  const rootRef = useRef<HTMLDivElement>(null);
  const rtl = useResolvedDirection(undefined, rootRef) === "rtl";
  const groupRef = useRef<HTMLDivElement>(null);

  const [created, setCreated] = useState<ComboboxOption[]>([]);
  const [remote, setRemote] = useState<ComboboxOption[] | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  // Every option that has ever been picked or created. Never cleared, so a chip picked from
  // async results keeps its label after the results are replaced or reset.
  const [picked, setPicked] = useState<ReadonlyMap<string, ComboboxOption>>(() => new Map());

  const remember = useCallback((list: ComboboxOption[]) => {
    if (list.length === 0) return;
    setPicked((prev) => {
      if (list.every((o) => prev.get(o.value) === o)) return prev;
      const next = new Map(prev);
      for (const o of list) next.set(o.value, o);
      return next;
    });
  }, []);

  // Every option we know about, so selected ids can always be resolved to labels.
  const known = useMemo(() => {
    const map = new Map(picked);
    for (const o of [...created, ...(remote ?? []), ...options]) map.set(o.value, o);
    return map;
  }, [picked, created, remote, options]);

  // Selection is stored as option ids (strings), like a native select.
  const [innerValue, setInnerValue] = useState<string[]>(() => {
    const v = props.defaultValue;
    return v == null ? [] : Array.isArray(v) ? v : [v];
  });
  const controlled = props.value !== undefined;
  const selectedIds: string[] = controlled
    ? props.value == null
      ? []
      : Array.isArray(props.value)
        ? props.value
        : [props.value]
    : innerValue;
  // Read after `await onCreate(...)`, when the selection may have changed in the meantime.
  const selectedIdsRef = useLatest(selectedIds);

  const selectedItems: ComboboxOption[] = selectedIds.map((v) => known.get(v) ?? { value: v, label: v });

  function commit(ids: string[]) {
    if (!controlled) setInnerValue(ids);
    if (props.multiple === true) props.onValueChange?.(ids);
    else props.onValueChange?.(ids[0] ?? null);
  }

  // ---- Async search: debounced, stale responses ignored, failures caught. ----
  // Latest callbacks live in refs so an inline `loadOptions={(q) => ...}` doesn't restart the debounce.
  const loadRef = useLatest(loadOptions);
  const onErrorRef = useLatest(onError);
  const requestRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastQueryRef = useRef("");

  useEffect(
    () => () => {
      clearTimeout(timerRef.current);
      requestRef.current++;
    },
    [],
  );

  const search = useCallback(
    (raw: string, wait = debounceMs) => {
      clearTimeout(timerRef.current);
      // Any new input (even an empty one) invalidates requests still in flight.
      const request = ++requestRef.current;
      const q = raw.trim();
      lastQueryRef.current = q;
      setLoadFailed(false);
      if (!q) {
        setRemote(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      timerRef.current = setTimeout(async () => {
        try {
          const load = loadRef.current;
          if (!load) return;
          const result = await load(q);
          if (request !== requestRef.current) return;
          setRemote(Array.isArray(result) ? result : []);
        } catch (err) {
          if (request !== requestRef.current) return;
          setRemote([]);
          setLoadFailed(true);
          onErrorRef.current?.(err);
        } finally {
          if (request === requestRef.current) setLoading(false);
        }
      }, wait);
    },
    [debounceMs, loadRef, onErrorRef],
  );

  const trimmed = query.trim();
  const atLimit = maxSelected !== undefined && selectedIds.length >= maxSelected;

  // What the list shows. With async search and no query, keep the picked options listed
  // so they can be unchecked from the popup too.
  const base: Item[] = remote ?? [...options, ...created];
  const extras: Item[] =
    loadOptions && remote === null ? selectedItems.filter((s) => !base.some((o) => o.value === s.value)) : [];
  const canCreate =
    !!onCreate &&
    !loadFailed &&
    trimmed.length > 0 &&
    ![...known.values()].some((o) => o.label.toLowerCase() === trimmed.toLowerCase());

  const items: Item[] = loadFailed
    ? [{ value: RETRY_VALUE, label: retryText, __retry: true }]
    : [
        ...[...base, ...extras].map((o) => (atLimit && !selectedIds.includes(o.value) ? { ...o, disabled: true } : o)),
        ...(canCreate ? [{ value: CREATE_PREFIX + trimmed, label: createText(trimmed), __create: trimmed }] : []),
      ];

  const hasGroups = items.some((o) => o.group);
  const grouped: Group[] | null = hasGroups
    ? Object.values(
        items.reduce<Record<string, Group>>((acc, item) => {
          const key = item.__create !== undefined ? "\u0000create" : (item.group ?? otherGroupLabel);
          (acc[key] ??= { value: item.__create !== undefined ? "" : key, items: [] }).items.push(item);
          return acc;
        }, {}),
      )
    : null;

  // Windowed lists render a flat, group-ordered list: Base UI navigates by index and the rows are placed by hand.
  const virtual = shouldVirtualize(props.virtualized, items.length);
  const hasDescriptions = virtual && items.some((o) => o.description);
  const windowItems = virtual && hasGroups ? groupOrdered(items, otherGroupLabel) : items;
  const scrollApi = useRef<WindowedScrollApi | null>(null);
  const pageKeys = usePageKeys();

  async function handleChange(next: Item | Item[] | null) {
    const list = next == null ? [] : Array.isArray(next) ? next : [next];
    const creating = list.find((i) => i.__create !== undefined);
    const chosen = list.filter((i) => i.__create === undefined && !i.__retry);
    remember(chosen);
    setCreateError(null);

    if (!creating?.__create || !onCreate) {
      commit(chosen.map((i) => i.value));
      return;
    }

    const text = creating.__create;
    try {
      const option = (await onCreate(text)) as ComboboxOption | undefined;
      // A forgotten `return` (undefined) must show the create error, not throw while rendering.
      if (!option || typeof option.value !== "string")
        throw new TypeError("Combobox onCreate must resolve with an option ({ value, label }).");
      remember([option]);
      setCreated((c) => (c.some((o) => o.value === option.value) ? c : [...c, option]));
      setQuery("");
      // The selection may have changed while `onCreate` was pending.
      const current = selectedIdsRef.current.filter((v) => v !== option.value);
      commit(multiple ? [...current, option.value] : [option.value]);
    } catch (err) {
      setCreateError(createErrorText(text));
      onErrorRef.current?.(err);
    }
  }

  function retry() {
    search(lastQueryRef.current, 0);
  }

  const renderItem = (item: Item, windowed?: { index: number; total: number; top: number; height: number }) => (
    <BaseCombobox.Item
      data-slot="combobox-item"
      key={item.value}
      value={item}
      disabled={item.disabled}
      {...(windowed
        ? {
            index: windowed.index,
            "data-vrow": "",
            "aria-setsize": windowed.total,
            "aria-posinset": windowed.index + 1,
            style: {
              position: "absolute",
              insetInline: 0,
              top: windowed.top,
              height: windowed.height,
            },
          }
        : {})}
      onClick={
        item.__retry
          ? (event) => {
              // Retry is an action, not a value: skip Base UI's selection.
              event.preventBaseUIHandler();
              retry();
            }
          : undefined
      }
      className={cn(
        "relative isolate grid cursor-pointer grid-cols-[1rem_auto_1fr] items-center gap-2.5 rounded-sheen-sm py-2 pe-3 ps-2.5 text-sm outline-none select-none",
        windowed ? (hasDescriptions ? "h-14" : "h-10 any-pointer-coarse:h-11") : "min-h-10 any-pointer-coarse:min-h-11",
        "data-disabled:cursor-not-allowed data-disabled:opacity-45",
        (item.__create !== undefined || item.__retry) && "font-medium text-sheen-accent",
      )}
      render={(itemProps, state) => (
        <div {...itemProps} className={cn(itemProps.className, state.highlighted && "sheen-fill")}>
          {/* The pill glides between options, like the Menu's. */}
          <MenuHighlight active={state.highlighted} />
          {itemProps.children}
        </div>
      )}
    >
      <BaseCombobox.ItemIndicator className="col-start-1 flex text-sheen-accent">
        <CheckIcon className="size-3.5" />
      </BaseCombobox.ItemIndicator>
      {/* Icons are decorative: the label beside them is the accessible name. */}
      <span aria-hidden className="col-start-2 flex items-center">
        {item.__create !== undefined ? <PlusIcon /> : item.__retry ? <RetryIcon /> : item.icon}
      </span>
      <span className="col-start-3 flex min-w-0 flex-col">
        <span className={cn("truncate", item.__create === undefined && !item.__retry && "font-medium")}>
          {item.label}
        </span>
        {item.description && <span className="truncate text-xs text-sheen-fg-muted">{item.description}</span>}
      </span>
    </BaseCombobox.Item>
  );

  const value = multiple ? selectedItems : (selectedItems[0] ?? null);
  const message = error ?? createError;
  const invalid = Boolean(error) || props["aria-invalid"] === true || props["aria-invalid"] === "true";
  const hasHelper = Boolean(description) || maxSelected !== undefined;
  const describedBy =
    [props["aria-describedby"], message ? errorId : undefined, hasHelper ? helperId : undefined]
      .filter(Boolean)
      .join(" ") || undefined;
  const listName = props["aria-labelledby"] ?? (label ? labelId : undefined);

  // Keep the popup clear of the label (when it opens above) and the helper/counter row (below).
  const sideOffset = useCallback(({ side }: { side: string }) => {
    const wrap = rootRef.current?.getBoundingClientRect();
    const field = groupRef.current?.getBoundingClientRect();
    if (!wrap || !field) return GAP;
    if (side === "bottom") return GAP + Math.max(0, wrap.bottom - field.bottom);
    if (side === "top") return GAP + Math.max(0, field.top - wrap.top);
    return GAP;
  }, []);

  // Only defined keys: an explicit `undefined` would override Base UI's own ARIA wiring.
  // aria-labelledby (on top of <label for>) keeps the name while Base UI aria-hides the
  // page outside the open popup, label included.
  const inputProps = withoutUndefined({
    id: inputId,
    autoFocus,
    onFocus,
    onBlur,
    onKeyDown: pageKeys.onKeyDown,
    "aria-label": props["aria-label"],
    "aria-labelledby": props["aria-labelledby"] ?? (label ? labelId : undefined),
    "aria-describedby": describedBy,
    "aria-invalid": invalid || undefined,
  });
  const inputClass = cn(
    size === "sm" ? "h-7" : "h-8",
    // On touch the field is 44px tall: the input fills it (md, the field's 3px padding cancelled), so the whole row is a 44px text target.
    size === "md" && "any-pointer-coarse:-my-[3px] any-pointer-coarse:h-11",
    "bg-transparent text-sm text-sheen-fg outline-none placeholder:text-sheen-fg-subtle any-pointer-coarse:text-base",
    "disabled:cursor-not-allowed",
    inputClassName,
  );

  return (
    <BaseCombobox.Root
      items={virtual ? windowItems : (grouped ?? items)}
      virtualized={virtual || undefined}
      onItemHighlighted={(item, { reason, index }) => {
        pageKeys.track(item ? index : null);
        if (virtual && item && reason !== "pointer") scrollApi.current?.scrollToOption(index);
      }}
      multiple={multiple}
      value={value}
      onValueChange={(v, details) => {
        if (details.reason === "escape-key" && !(clearOnEscape ?? !multiple)) {
          details.cancel();
          return;
        }
        void handleChange(v);
      }}
      inputValue={multiple ? query : undefined}
      onInputValueChange={(v, details) => {
        setQuery(v);
        if (createError) setCreateError(null);
        if (!loadOptions) return;
        // Picking an item writes its label into the input (single mode): that isn't a search.
        if (details.reason === "item-press") return;
        if (!multiple && v === selectedItems[0]?.label) return;
        search(v);
      }}
      onOpenChange={(open) => onOpenChange?.(open)}
      // Base UI hands these callbacks `null` for an empty single selection although it types them as `Item`.
      itemToStringLabel={(item: Item) => (item as Item | null)?.label ?? ""}
      itemToStringValue={(item: Item) => (item as Item | null)?.value ?? ""}
      isItemEqualToValue={(a: Item, b: Item) => (a as Item | null)?.value === (b as Item | null)?.value}
      filter={loadOptions ? null : undefined}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      name={name}
      autoHighlight
    >
      <div ref={rootRef} data-slot="combobox" className={cn("flex w-full flex-col gap-1.5", className)}>
        {label && (
          <label
            data-slot="combobox-label"
            id={labelId}
            htmlFor={inputId}
            className="text-sm font-medium text-sheen-fg"
          >
            {label}
          </label>
        )}

        <BaseCombobox.InputGroup
          data-slot="combobox-input-group"
          ref={groupRef}
          className={cn(
            // The field's edge is its only outline: the >= 3:1 control boundary (WCAG 1.4.11).
            fieldMinHeight[size],
            size === "sm" ? "py-0" : size === "lg" ? "py-[7px]" : "py-[3px]",
            "glass-1 flex w-full cursor-text items-center gap-1.5 rounded-sheen-md border-sheen-control-border pe-1.5 ps-3",
            "transition-[box-shadow,border-color] duration-(--sheen-duration-fast) ease-sheen-out",
            "focus-within:border-sheen-accent focus-within:shadow-[0_0_0_4px_var(--sheen-ring)]",
            "has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-solid has-[input:focus-visible]:outline-sheen-focus",
            invalid && "border-sheen-danger-border focus-within:border-sheen-danger-border",
            "data-disabled:cursor-not-allowed data-disabled:opacity-55",
          )}
        >
          {multiple ? (
            <BaseCombobox.Chips
              // Taller row gap on touch so stacked chips' 44px remove targets don't overlap.
              className="relative flex min-w-0 flex-1 flex-wrap items-center gap-1.5 any-pointer-coarse:gap-y-3"
              aria-label={selectedItems.length > 0 ? chipsLabel : undefined}
            >
              <LayoutGroup id={autoId}>
                <AnimatePresence initial={false} mode="popLayout">
                  {selectedItems.map((item) => (
                    // A chip grows out of (and shrinks back into) its inline-start edge on the same
                    // spring the input slides on, so its trailing edge stays just ahead of the caret.
                    <motion.span
                      key={item.value}
                      layout={reduced ? false : "position"}
                      style={{ originX: rtl ? 1 : 0 }}
                      initial={reduced ? { opacity: 0 } : { scale: 0, opacity: 0 }}
                      animate={{
                        scale: 1,
                        opacity: 1,
                        transition: reduced
                          ? { duration: duration.fast }
                          : {
                              // One frame late: the input's layout animation only starts on the frame after mount.
                              scale: { ...spring.snappy, delay: 1 / 60 },
                              opacity: { duration: duration.fast },
                              layout: spring.snappy,
                            },
                      }}
                      exit={
                        reduced
                          ? { opacity: 0, transition: { duration: duration.instant } }
                          : {
                              scale: 0,
                              opacity: 0,
                              // Gone (opacity) within the exit duration; the scale only keeps pace with the input.
                              transition: {
                                scale: spring.snappy,
                                opacity: { duration: duration.exit, ease: ease.exit },
                              },
                            }
                      }
                      transition={{ layout: spring.snappy }}
                      className="inline-flex"
                    >
                      <Chip item={item} removeLabel={removeLabel(item.label)} hint={chipHint} />
                    </motion.span>
                  ))}
                </AnimatePresence>
                {/* The input slides with the chips, so a chip never animates over the caret. */}
                <motion.span
                  layout={reduced ? false : "position"}
                  transition={{ layout: spring.snappy }}
                  className="flex min-w-24 flex-1"
                >
                  <BaseCombobox.Input
                    {...inputProps}
                    ref={inputRefProp}
                    aria-description={selectedItems.length > 0 ? selectedHint(selectedItems.length) : undefined}
                    placeholder={selectedItems.length > 0 ? (atLimit ? "" : placeholderMore) : placeholder}
                    className={cn(inputClass, "w-full min-w-0")}
                  />
                </motion.span>
              </LayoutGroup>
            </BaseCombobox.Chips>
          ) : (
            <BaseCombobox.Input
              {...inputProps}
              ref={inputRefProp}
              placeholder={placeholder}
              className={cn(inputClass, "min-w-0 flex-1")}
            />
          )}

          {/* Pinned to the first row when chips wrap onto several lines. */}
          <span className="ms-auto flex shrink-0 items-center gap-0.5 self-start text-sheen-fg-muted">
            {(selectedItems.length > 0 || query.length > 0) && !readOnly && (
              <BaseCombobox.Clear aria-label={clearLabel} className={cn(iconButton, size === "sm" && "size-7")}>
                <CloseIcon strokeWidth={2.6} className="size-3.5" />
              </BaseCombobox.Clear>
            )}
            <BaseCombobox.Trigger
              aria-label={triggerLabel}
              className={cn(iconButton, size === "sm" && "size-7", "group/trigger")}
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="size-4 motion-ok:transition-transform motion-ok:duration-(--sheen-duration-base) motion-ok:ease-sheen-out group-data-popup-open/trigger:rotate-180"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </BaseCombobox.Trigger>
          </span>
        </BaseCombobox.InputGroup>

        {message && (
          <p
            data-slot="combobox-error"
            id={errorId}
            role="alert"
            className="text-xs font-medium text-sheen-danger-text"
          >
            {message}
          </p>
        )}
        {hasHelper && (
          <p
            data-slot="combobox-helper"
            id={helperId}
            className="flex justify-between gap-3 text-xs text-sheen-fg-muted"
          >
            <span>{description}</span>
            {maxSelected !== undefined && (
              <span className={cn("tabular-nums", atLimit && "font-medium text-sheen-accent")}>
                {selectedIds.length}/{maxSelected}
              </span>
            )}
          </p>
        )}
      </div>

      <BaseCombobox.Portal>
        <BaseCombobox.Positioner
          {...typeablePopupA11yProps}
          className="z-50 outline-none"
          sideOffset={sideOffset}
          collisionPadding={8}
        >
          <BaseCombobox.Popup
            data-slot="combobox-popup"
            aria-busy={loading || undefined}
            className={cn(
              "glass-3 w-(--anchor-width) max-w-(--available-width) origin-(--transform-origin) overflow-hidden rounded-sheen-md outline-none",
              popupMotion,
            )}
          >
            <BaseCombobox.Status className="empty:hidden">
              {loading ? (
                <span className="flex items-center gap-2 px-3 py-2.5 text-sm text-sheen-fg-muted">
                  <SpinnerIcon className="size-4 shrink-0" />
                  {searchingText}
                </span>
              ) : loadFailed ? (
                <span className="flex items-center gap-2 px-3 pt-2.5 pb-1 text-sm font-medium text-sheen-danger-text">
                  <AlertIcon strokeWidth={2.2} className="size-4 shrink-0" />
                  {errorText}
                </span>
              ) : trimmed ? (
                virtual ? (
                  <WindowedResultCount format={resultsText} />
                ) : (
                  <ResultCount query={trimmed} format={resultsText} />
                )
              ) : null}
            </BaseCombobox.Status>
            <BaseCombobox.Empty className="empty:hidden">
              {!loading && (
                <span className="block px-3 py-3 text-sm text-sheen-fg-muted">
                  {loadOptions && !trimmed ? startTypingText : emptyState}
                </span>
              )}
            </BaseCombobox.Empty>
            <GlideHighlightScope>
              {virtual ? (
                <WindowedOptions
                  apiRef={scrollApi}
                  selected={selectedIds}
                  groupOf={groupOfItem}
                  otherGroup={otherGroupLabel}
                  hasGroups={hasGroups}
                  hasDescriptions={hasDescriptions}
                  renderItem={renderItem}
                  aria-labelledby={listName}
                  aria-label={listName ? undefined : (props["aria-label"] ?? placeholder)}
                />
              ) : (
                <BaseCombobox.List
                  aria-labelledby={listName}
                  aria-label={listName ? undefined : (props["aria-label"] ?? placeholder)}
                  className="max-h-[min(22rem,var(--available-height))] scroll-py-1 overflow-y-auto overscroll-contain p-1 empty:p-0"
                >
                  {grouped
                    ? (group: Group) => (
                        <BaseCombobox.Group
                          key={group.value || "create"}
                          items={group.items}
                          className="pb-1 last:pb-0"
                        >
                          {group.value && (
                            <BaseCombobox.GroupLabel className="px-2.5 pt-2 pb-1 text-2xs font-semibold tracking-[0.12em] text-sheen-fg-muted uppercase select-none">
                              {group.value}
                            </BaseCombobox.GroupLabel>
                          )}
                          <BaseCombobox.Collection>{(item: Item) => renderItem(item)}</BaseCombobox.Collection>
                        </BaseCombobox.Group>
                      )
                    : (item: Item) => renderItem(item)}
                </BaseCombobox.List>
              )}
            </GlideHighlightScope>
          </BaseCombobox.Popup>
        </BaseCombobox.Positioner>
      </BaseCombobox.Portal>
    </BaseCombobox.Root>
  );
}

/**
 * Says how many options match, once the list has settled (the status region is polite). It counts the rendered options
 * of the popup it lives in, so it works for filtered, grouped and async lists alike.
 */
function ResultCount({ query, format }: { query: string; format: (count: number) => string }) {
  const anchor = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(0);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const popup = anchor.current?.parentElement?.parentElement; // span > status > popup
      setCount(popup?.querySelectorAll("[role=option]").length ?? 0);
    });
    return () => cancelAnimationFrame(frame);
  }, [query]);
  return (
    <span ref={anchor} className="sr-only">
      {count > 0 ? format(count) : ""}
    </span>
  );
}

function withoutUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>;
}

const iconButton = cn(
  "relative flex size-8 items-center justify-center rounded-sheen-sm transition-colors hover:text-sheen-fg",
  "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-solid focus-visible:outline-sheen-focus",
  // 44px touch target on coarse pointers without changing the field's height.
  "any-pointer-coarse:w-11 any-pointer-coarse:after:absolute any-pointer-coarse:after:inset-x-0 any-pointer-coarse:after:-inset-y-1.5 any-pointer-coarse:after:content-['']",
);

/** Items listed group by group (groups in order of first appearance), as a windowed list shows them. */
function groupOrdered(items: Item[], otherGroup: string): Item[] {
  const buckets = new Map<string, Item[]>();
  for (const item of items) {
    const key = item.__create !== undefined ? "\u0000create" : (item.group ?? otherGroup);
    const bucket = buckets.get(key);
    if (bucket) bucket.push(item);
    else buckets.set(key, [item]);
  }
  return [...buckets.values()].flat();
}

/** The group a windowed list files an option under: `""` for the "create" row (no heading), `undefined` for ungrouped options. */
function groupOfItem(item: Item): string | undefined {
  return item.__create !== undefined ? "" : item.group;
}
