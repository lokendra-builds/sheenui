"use client";

import { CloseIcon } from "../status-icons/icons";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ClipboardEvent,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { Autocomplete } from "@base-ui/react/autocomplete";
import { AnimatePresence, LayoutGroup, motion, useAnimationControls, useIsPresent } from "motion/react";

import { cn } from "../../lib/cn";
import { fieldMinHeight, type FieldSize } from "../../lib/field-size";
import { joinIds, useMergedRef, type FormControlProps } from "../../lib/form";
import { isImeComposing } from "../../lib/ime";
import { typeablePopupA11yProps } from "../../lib/popup-a11y";
import { duration, ease, spring } from "../../motion/tokens";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { useControllable } from "../../hooks/use-controllable";
import { isRtlAt } from "../../hooks/use-direction";

/** A suggestion in `TagsInput`: a plain string, or an object with a `value` and a `description`. */
export type TagSuggestion = string | { value: string; description?: string };

/**
 * Every user-facing string of `TagsInput` (accessible names, announcements, placeholders); pass a
 * partial `labels` prop to translate or reword them. Entries that need a count or a name are
 * functions.
 */
export type TagsInputLabels = {
  /** Accessible name of the tag list. */
  tagsLabel: string;
  /** Accessible name of a tag's × button. */
  remove: (tag: string) => string;
  /** Accessible name of the clear-all button. */
  clearAll: string;
  /** Read on the field: how it works. */
  hint: string;
  /** Read on a focused tag. */
  tagHint: string;
  /** Error: the tag is already in the list. */
  duplicate: (tag: string) => string;
  /** Error: the list is full. */
  maxReached: (max: number) => string;
  /** Error: the tag is longer than `maxLength`. */
  tooLong: (max: number) => string;
  /** Error: the tag is not one of the `suggestions` (with `restrictToSuggestions`). */
  notAllowed: (tag: string) => string;
  /** Announced (polite) after tags are added. */
  added: (tags: string[]) => string;
  /** Announced (polite) after a tag is removed. */
  removed: (tag: string) => string;
  /** Announced (polite) after all tags are removed. */
  cleared: string;
  /** Shown while some pasted tags were skipped. */
  skipped: (count: number, reason: string) => string;
  /** Visible counter, e.g. "3/5". */
  count: (count: number, max: number) => string;
};

/**
 * Default English strings of `TagsInputLabels`; spread it and override single keys to reword. Plain
 * data with no DOM access: safe to read while prerendering. The module is `"use client"`, so a React
 * Server Component receives a client reference instead of the object: read it from a client component.
 */
export const defaultTagsInputLabels: TagsInputLabels = {
  tagsLabel: "Tags",
  remove: (tag) => `Remove ${tag}`,
  clearAll: "Remove all tags",
  hint: "Press Enter or comma to add a tag. Backspace at the start selects the last tag.",
  tagHint: "Press Backspace or Delete to remove",
  duplicate: (tag) => `“${tag}” is already added.`,
  maxReached: (max) => `You can add up to ${max} tags.`,
  tooLong: (max) => `Tags can be at most ${max} characters.`,
  notAllowed: (tag) => `“${tag}” isn’t in the list.`,
  added: (tags) => (tags.length === 1 ? `Added ${tags[0]}` : `Added ${tags.length} tags`),
  removed: (tag) => `Removed ${tag}`,
  cleared: "All tags removed",
  skipped: (count, reason) => `${count} not added. ${reason}`,
  count: (count, max) => `${count}/${max}`,
};

/** Props of `TagsInput`; each option is documented on its field. */
export type TagsInputProps = FormControlProps<HTMLInputElement> & {
  /** Sets the current list of tags when controlled. */
  value?: string[];
  /** Sets the starting tags when uncontrolled. */
  defaultValue?: string[];
  /** Called with the new list whenever a tag is added or removed. */
  onValueChange?: (tags: string[]) => void;
  /** Text above the field, linked to the input as its accessible name. */
  label?: ReactNode;
  /** Muted helper text under the field. */
  description?: ReactNode;
  /** Error message from outside (e.g. form validation). Overrides the built-in messages. */
  error?: ReactNode;
  /** Hint shown while the field is empty. */
  placeholder?: string;
  /** Placeholder once at least one tag exists. */
  placeholderMore?: string;
  /** Maximum number of tags a person can add. */
  max?: number;
  /** Sets the maximum number of characters in one tag. */
  maxLength?: number;
  /** Allow the same tag twice. Duplicates compare case-insensitively unless `caseSensitive`. */
  allowDuplicates?: boolean;
  /** Makes "Tag" and "tag" count as different tags. Default false. */
  caseSensitive?: boolean;
  /** Keys that add a tag, besides Enter. */
  delimiters?: string[];
  /** Splits pasted text into tags. Default: commas, semicolons, tabs, new lines and your `delimiters`. */
  pasteSplit?: RegExp;
  /** Clean a tag before it is added. Default: trim and collapse spaces. */
  transform?: (tag: string) => string;
  /** Your own rule: return an error message to reject the tag. */
  validate?: (tag: string, tags: string[]) => string | null | undefined | void; // eslint-disable-line @typescript-eslint/no-invalid-void-type -- a validator that finds no problem may simply return nothing
  /** Add what's typed when the field loses focus. Default false. */
  addOnBlur?: boolean;
  /** Lists suggestions under the field while typing. */
  suggestions?: TagSuggestion[];
  /** With `suggestions`: only tags from the list can be added. */
  restrictToSuggestions?: boolean;
  /** Show the × button that removes every tag. Default true. */
  clearable?: boolean;
  /** Disables typing and removing tags. */
  disabled?: boolean;
  /** Show the tags but do not allow changes. */
  readOnly?: boolean;
  /** Submits one hidden input per tag with a form. */
  name?: string;
  /** `id` of the text input (so a `<label htmlFor>` can point at it). */
  id?: string;
  /** Height, consistent across every form control: "sm" 32px, "md" 40px, "lg" 48px (sm and md are 44px on touch screens), the same scale as Button. Default "md". */
  size?: FieldSize;
  /** Accessible name when there is no visible `label`. */
  "aria-label"?: string;
  /** Override the strings (i18n). */
  labels?: Partial<TagsInputLabels>;
  /** Class for the outer wrapper (label + field + helper text). */
  className?: string;
  /** Adds extra classes to the text input. */
  inputClassName?: string;
};

type Item = { value: string; label: string; description?: string };

const defaultTransform = (tag: string) => tag.trim().replace(/\s+/g, " ");
const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\-]/g, "\\$&");

/**
 * Tags input: type and press Enter (or a comma) to turn text into a chip. Use it for keywords, recipients and labels; use `Combobox` to pick from a fixed list and `Input` for one free value.
 *
 * Keyboard
 * - Enter / `,` add what you typed (or the highlighted suggestion).
 * - Backspace at the start of the field selects the last tag; again, removes it.
 * - ← / → from the start of the field, walk the tags (RTL flips).
 * - Backspace / Delete on a tag removes it (focus moves to the previous / next tag).
 * - Any letter on a tag jumps back to the field and types.
 * - Paste "a, b; c" (or one per line) to add several at once.
 *
 * Validation: `max` tags, `maxLength`, duplicates (the existing chip pulses; `allowDuplicates`, `caseSensitive`), an optional list-only mode (`restrictToSuggestions`) and your own `validate` (return a message to reject). Errors are announced and the field shakes.
 * `transform` cleans a tag before it is added; `delimiters` and `pasteSplit` change what splits text into tags; `addOnBlur` adds what is typed when the field loses focus; `error` overrides the built-in messages with your own.
 * Optional `suggestions` open a glass list under the field (Base UI Autocomplete). Controlled with `value` + `onValueChange`, or uncontrolled with `defaultValue`; `name` submits one hidden input per tag; `labels` translates every string.
 *
 * Accessibility: the tags are a real list (`role="list"`) with a named × per chip; the field is described by a hint, the counter and any error; additions and removals are announced politely, and an error (a duplicate, a rejected tag) at once with `role="alert"`; chips and buttons are 44px targets on touch screens; the field border is 3:1.
 * Glass and motion: a `glass-1` field and a `glass-3` suggestion list. Chips spring in from where you typed and shrink away; the field slides along. Reduced motion: chips fade, nothing moves.
 *
 * @example
 * ```tsx
 * import { TagsInput } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <TagsInput
 *       label="Topics"
 *       placeholder="Add a topic"
 *       max={5}
 *       suggestions={["design", "motion", "accessibility"]}
 *       onValueChange={(tags) => console.log(tags)}
 *     />
 *   );
 * }
 * ```
 *
 * @see /forms/tags-input
 */
export function TagsInput({
  value,
  defaultValue = [],
  onValueChange,
  label,
  description,
  error: errorProp,
  placeholder = "Add a tag…",
  placeholderMore = "Add more…",
  max,
  maxLength,
  allowDuplicates = false,
  caseSensitive = false,
  delimiters = [","],
  pasteSplit: pasteSplitProp,
  transform = defaultTransform,
  validate,
  addOnBlur = false,
  suggestions,
  restrictToSuggestions = false,
  clearable = true,
  disabled = false,
  readOnly = false,
  name,
  id: idProp,
  "aria-label": ariaLabel,
  labels: labelsProp,
  className,
  inputClassName,
  size = "md",
  ref,
  onBlur,
  required,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
}: TagsInputProps) {
  const labels = { ...defaultTagsInputLabels, ...labelsProp };
  const [tags, setTags, tagsRef] = useControllable(value, defaultValue, onValueChange);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [flash, setFlash] = useState<{ tag: string; n: number } | null>(null);
  const [open, setOpen] = useState(false);
  const reduced = useSheenReducedMotion();
  const shake = useAnimationControls();

  const autoId = useId();
  const inputId = idProp ?? `${autoId}-input`;
  const labelId = `${autoId}-label`;
  const helperId = `${autoId}-helper`;
  const errorId = `${autoId}-error`;
  const hintId = `${autoId}-hint`;
  const fieldRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mergedInputRef = useMergedRef(inputRef, ref);
  const listRef = useRef<HTMLUListElement>(null);
  const highlighted = useRef<Item | undefined>(undefined);
  const flashTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(flashTimer.current), []);

  const error = errorProp ?? message;
  const pasteSplit =
    pasteSplitProp ??
    new RegExp(
      `(?:[,;\\t\\n\\r]|${
        delimiters
          .filter((d) => d.length === 1)
          .map(escapeRegExp)
          .join("|") || "[,]"
      })+`,
    );
  const atMax = max !== undefined && tags.length >= max;
  const canEdit = !disabled && !readOnly;

  const norm = (t: string) => (caseSensitive ? t : t.toLocaleLowerCase());
  const suggestionItems: Item[] = (suggestions ?? []).map((s) =>
    typeof s === "string" ? { value: s, label: s } : { value: s.value, label: s.value, description: s.description },
  );
  const taken = new Set(tags.map(norm));
  const q = norm(query.trim());
  const filtered = suggestionItems.filter((s) => !taken.has(norm(s.value)) && (!q || norm(s.value).includes(q)));
  const popupOpen = open && filtered.length > 0 && canEdit && !atMax;

  function announce(text: string) {
    // Clear first so the same message twice is still read.
    setAnnouncement("");
    requestAnimationFrame(() => setAnnouncement(text));
  }

  function fail(text: string) {
    setMessage(text);
    if (!reduced) void shake.start({ x: [0, -6, 6, -4, 4, 0], transition: { duration: 0.4, ease: ease.out } });
  }

  /** Why a tag can't be added (or null). `pending` holds tags accepted earlier in the same batch. */
  function rejection(tag: string, pending: string[]): string | null {
    const all = [...tagsRef.current, ...pending];
    if (maxLength !== undefined && tag.length > maxLength) return labels.tooLong(maxLength);
    if (max !== undefined && all.length >= max) return labels.maxReached(max);
    if (!allowDuplicates) {
      const existing = all.find((t) => norm(t) === norm(tag));
      if (existing !== undefined) {
        setFlash((f) => ({ tag: existing, n: (f?.n ?? 0) + 1 }));
        window.clearTimeout(flashTimer.current);
        flashTimer.current = window.setTimeout(() => setFlash(null), 900);
        return labels.duplicate(existing);
      }
    }
    if (restrictToSuggestions && suggestions && !suggestionItems.some((s) => norm(s.value) === norm(tag)))
      return labels.notAllowed(tag);
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- an empty message from validate() means "valid": this must test truthiness, not null
    return validate?.(tag, all) || null;
  }

  /** Add one or more raw strings. Returns true when everything was added. */
  function add(raw: string[]): boolean {
    const accepted: string[] = [];
    const errors: string[] = [];
    for (const r of raw) {
      let tag = transform(r);
      if (!tag) continue;
      // Pick the suggestion's own casing when the text matches one.
      const match = suggestionItems.find((s) => norm(s.value) === norm(tag));
      if (match) tag = match.value;
      const why = rejection(tag, accepted);
      if (why) errors.push(why);
      else accepted.push(tag);
    }
    if (accepted.length) {
      setTags([...tagsRef.current, ...accepted]);
      announce(labels.added(accepted));
    }
    if (errors.length === 0) {
      setMessage(null);
      return true;
    }
    fail(
      errors.length === 1 || accepted.length === 0 ? (errors[0] ?? "") : labels.skipped(errors.length, errors[0] ?? ""),
    );
    return false;
  }

  function commitQuery() {
    if (!query.trim()) return;
    if (add([query])) setQuery("");
  }

  function removeAt(index: number, focus: "previous" | "next" | "input" | "none" = "none") {
    const current = tagsRef.current;
    const tag = current[index];
    if (tag === undefined) return;
    setTags(current.filter((_, i) => i !== index));
    setMessage(null);
    announce(labels.removed(tag));
    if (focus === "none") return;
    const remaining = current.length - 1;
    const target = focus === "previous" ? index - 1 : focus === "next" ? index : -1;
    // After React commits: chips re-index once the removed one is gone.
    requestAnimationFrame(() => {
      if (focus !== "input" && target >= 0 && target < remaining) focusTag(target);
      else inputRef.current?.focus();
    });
  }

  function focusTag(index: number) {
    listRef.current?.querySelector<HTMLElement>(`[data-tag-index="${index}"]`)?.focus();
  }

  function clearAll() {
    setTags([]);
    setMessage(null);
    announce(labels.cleared);
    inputRef.current?.focus();
  }

  function onInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const atStart = input.selectionStart === 0 && input.selectionEnd === 0;
    const rtl = isRtlAt(input);
    // Mid-composition (Japanese, Chinese, Korean IMEs) Enter confirms the text: never commit then.
    if (isImeComposing(event.nativeEvent)) return;

    if (event.key === "Enter") {
      // A highlighted suggestion is picked by Autocomplete itself (see onValueChange).
      if (popupOpen && highlighted.current) return;
      if (query.trim()) {
        event.preventDefault();
        commitQuery();
      }
      return;
    }
    if (delimiters.includes(event.key)) {
      event.preventDefault();
      commitQuery();
      return;
    }
    // Backspace only reaches the tags from an empty field, so it never surprises mid-edit.
    if (event.key === "Backspace" && input.value === "" && tags.length > 0) {
      event.preventDefault();
      focusTag(tags.length - 1);
      return;
    }
    if (event.key === (rtl ? "ArrowRight" : "ArrowLeft") && atStart && tags.length > 0) {
      event.preventDefault();
      focusTag(tags.length - 1);
    }
  }

  function onTagKeyDown(event: KeyboardEvent<HTMLElement>, index: number) {
    const rtl = isRtlAt(event.currentTarget);
    const prev = rtl ? "ArrowRight" : "ArrowLeft";
    const next = rtl ? "ArrowLeft" : "ArrowRight";
    if (event.key === prev) {
      event.preventDefault();
      focusTag(Math.max(0, index - 1));
    } else if (event.key === next) {
      event.preventDefault();
      if (index + 1 < tags.length) focusTag(index + 1);
      else inputRef.current?.focus();
    } else if (event.key === "Home") {
      event.preventDefault();
      focusTag(0);
    } else if (event.key === "End") {
      event.preventDefault();
      inputRef.current?.focus();
    } else if ((event.key === "Backspace" || event.key === "Delete") && canEdit) {
      event.preventDefault();
      removeAt(index, event.key === "Backspace" ? "previous" : "next");
    } else if (event.key === "Escape") {
      event.preventDefault();
      inputRef.current?.focus();
    } else if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey && canEdit) {
      // Typing on a chip types into the field (the key lands in the newly focused input).
      inputRef.current?.focus();
    }
  }

  function onPaste(event: ClipboardEvent<HTMLInputElement>) {
    const text = event.clipboardData.getData("text");
    pasteSplit.lastIndex = 0;
    if (!pasteSplit.test(text)) return;
    event.preventDefault();
    const parts = text.split(pasteSplit);
    add(query.trim() ? [query, ...parts] : parts);
    setQuery("");
  }

  function onFieldMouseDown(event: MouseEvent<HTMLDivElement>) {
    // Clicking the empty part of the field focuses the input (without stealing focus from chips).
    if (event.target === event.currentTarget || (event.target as HTMLElement).dataset.tagsRow !== undefined) {
      event.preventDefault();
      inputRef.current?.focus();
    }
  }

  // The keyboard hint is a hidden element in the describedby list (aria-description would be
  // dropped by browsers whenever aria-describedby is present).
  const describedBy = joinIds(
    ariaDescribedBy,
    error && errorId,
    (Boolean(description) || max !== undefined) && helperId,
    canEdit && labels.hint && hintId,
  );

  const inputProps = {
    id: inputId,
    disabled,
    readOnly,
    placeholder: atMax ? "" : tags.length > 0 ? placeholderMore : placeholder,
    "aria-labelledby": label ? labelId : undefined,
    "aria-label": label ? undefined : (ariaLabel ?? labels.tagsLabel),
    "aria-describedby": describedBy,
    "aria-invalid": error || ariaInvalid === true || ariaInvalid === "true" ? true : undefined,
    "aria-required": required ? true : undefined,
    enterKeyHint: "enter" as const,
    autoComplete: "off",
    onKeyDown: onInputKeyDown,
    onPaste,
    onBlur: (event: FocusEvent<HTMLInputElement>) => {
      if (addOnBlur && query.trim()) commitQuery();
      onBlur?.(event);
    },
    className: cn(
      size === "sm" ? "h-7" : "h-8",
      "min-w-24 flex-1 bg-transparent text-sm text-sheen-fg outline-none placeholder:text-sheen-fg-subtle",
      // Touch: a 44 px tall hit area; the negative margin keeps the field's height as it is.
      size === "sm" ? "any-pointer-coarse:-my-2" : "any-pointer-coarse:-my-1.5",
      "any-pointer-coarse:h-11 any-pointer-coarse:text-base disabled:cursor-not-allowed",
      inputClassName,
    ),
  };

  return (
    <div
      // While the suggestions list is open, Base UI aria-hides everything outside it and the
      // input, which would hide this field's own chips and its focusable clear button. It keeps
      // [aria-live] subtrees visible, so this no-op live setting keeps the whole field readable.
      data-slot="tags-input"
      aria-live={suggestions ? "off" : undefined}
      className={cn("flex w-full flex-col gap-1.5", className)}
    >
      {label && (
        <label id={labelId} htmlFor={inputId} className="w-fit text-sm font-medium text-sheen-fg">
          {label}
        </label>
      )}

      <motion.div
        ref={fieldRef}
        animate={shake}
        onMouseDown={onFieldMouseDown}
        className={cn(
          fieldMinHeight[size],
          size === "sm" ? "py-0" : size === "lg" ? "py-[7px]" : "py-[3px]",
          "glass-1 flex w-full cursor-text items-start gap-1 rounded-sheen-md ps-2 pe-1.5",
          "transition-[box-shadow,border-color] duration-(--sheen-duration-fast) ease-sheen-out",
          "focus-within:border-sheen-accent focus-within:shadow-[0_0_0_4px_var(--sheen-ring)]",
          "has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-solid has-[input:focus-visible]:outline-sheen-focus",
          error &&
            "border-sheen-danger focus-within:border-sheen-danger focus-within:shadow-[0_0_0_4px_var(--sheen-danger-soft)]",
          disabled && "cursor-not-allowed opacity-55",
        )}
      >
        {/* Chips and the input wrap together; the clear button stays pinned to the first row. */}
        <div
          data-tags-row=""
          className={cn(
            "flex min-w-0 flex-1 flex-wrap items-center gap-1.5 any-pointer-coarse:gap-y-3",
            size === "sm" ? "min-h-7" : "min-h-8",
          )}
        >
          <LayoutGroup id={autoId}>
            {/* display: contents, so chips and the input share one wrapping row. */}
            {/* eslint-disable-next-line jsx-a11y/no-redundant-roles -- display: contents drops the list role in Safari; the explicit role restores it */}
            <ul ref={listRef} role="list" aria-label={labels.tagsLabel} className="contents">
              <AnimatePresence initial={false} mode="popLayout">
                {tags.map((tag, index) => (
                  <motion.li
                    // Stable across removals: the tag plus how many identical tags come before it.
                    key={`${tag}\u0000${tags.slice(0, index).filter((t) => t === tag).length}`}
                    layout={reduced ? false : "position"}
                    initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      transition: reduced
                        ? { duration: duration.fast }
                        : { scale: spring.snappy, opacity: { duration: duration.fast } },
                    }}
                    exit={
                      reduced
                        ? { opacity: 0, transition: { duration: duration.exit } }
                        : { opacity: 0, scale: 0.6, transition: { duration: duration.exit, ease: ease.exit } }
                    }
                    transition={{ layout: spring.snappy }}
                    className="flex min-w-0 origin-left rtl:origin-right"
                  >
                    <Chip
                      tag={tag}
                      index={index}
                      hint={labels.tagHint}
                      removeLabel={labels.remove(tag)}
                      removable={canEdit}
                      flash={flash?.tag === tag ? flash.n : 0}
                      reduced={reduced}
                      onRemove={() => removeAt(index, "input")}
                      onKeyDown={(e) => onTagKeyDown(e, index)}
                    />
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>

            <motion.span
              layout={reduced ? false : "position"}
              transition={{ layout: spring.snappy }}
              className="flex min-w-24 flex-1"
            >
              {suggestions ? (
                <Autocomplete.Root
                  items={filtered}
                  value={query}
                  onValueChange={(v, details) => {
                    if (details.reason === "item-press") {
                      if (add([v])) setQuery("");
                      return;
                    }
                    setQuery(v);
                    if (message) setMessage(null);
                  }}
                  open={popupOpen}
                  onOpenChange={(next) => {
                    setOpen(next);
                    if (!next) highlighted.current = undefined;
                  }}
                  onItemHighlighted={(item) => {
                    highlighted.current = item;
                  }}
                  itemToStringValue={(item: Item) => item.value}
                  filter={null}
                  openOnInputClick
                  disabled={disabled}
                  readOnly={readOnly}
                >
                  <Autocomplete.Input
                    {...inputProps}
                    ref={mergedInputRef}
                    // eslint-disable-next-line react-hooks/refs -- the key, paste and blur handlers in inputProps touch refs only when an event fires; Base UI never calls them while rendering
                    className={cn(inputProps.className, "w-full")}
                  />
                  <Autocomplete.Portal>
                    <Autocomplete.Positioner
                      {...typeablePopupA11yProps}
                      anchor={fieldRef}
                      sideOffset={6}
                      className="z-50 outline-none"
                    >
                      <Autocomplete.Popup
                        className={cn(
                          "glass-3 w-(--anchor-width) max-w-(--available-width) origin-(--transform-origin) overflow-hidden rounded-sheen-md outline-none",
                          "transition-[opacity,scale] duration-(--sheen-duration-base) ease-sheen-out",
                          "data-ending-style:duration-(--sheen-duration-exit) data-ending-style:ease-sheen-exit",
                          "data-starting-style:opacity-0 data-ending-style:opacity-0",
                          "motion-ok:data-starting-style:scale-95 motion-ok:data-ending-style:scale-[0.98]",
                        )}
                      >
                        <Autocomplete.List
                          aria-label={labels.tagsLabel}
                          className="max-h-[min(18rem,var(--available-height))] scroll-py-1 overflow-y-auto overscroll-contain p-1"
                        >
                          {(item: Item) => (
                            <Autocomplete.Item
                              key={item.value}
                              value={item}
                              className={cn(
                                "flex cursor-pointer flex-col rounded-sheen-sm px-2.5 py-2 text-sm outline-none select-none",
                                "min-h-10 justify-center any-pointer-coarse:min-h-11 data-highlighted:bg-sheen-hover",
                              )}
                            >
                              <span className="truncate font-medium">
                                <Highlight text={item.value} query={query.trim()} caseSensitive={caseSensitive} />
                              </span>
                              {item.description && (
                                <span className="truncate text-xs text-sheen-fg-muted">{item.description}</span>
                              )}
                            </Autocomplete.Item>
                          )}
                        </Autocomplete.List>
                      </Autocomplete.Popup>
                    </Autocomplete.Positioner>
                  </Autocomplete.Portal>
                </Autocomplete.Root>
              ) : (
                <input
                  {...inputProps}
                  ref={mergedInputRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    if (message) setMessage(null);
                  }}
                />
              )}
            </motion.span>
          </LayoutGroup>
        </div>

        {clearable && canEdit && tags.length > 0 && (
          <button
            type="button"
            aria-label={labels.clearAll}
            onClick={clearAll}
            className={cn(
              "relative flex size-8 shrink-0 items-center justify-center self-start rounded-sheen-sm text-sheen-fg-muted",
              "transition-[background-color,color] duration-(--sheen-duration-fast) hover:bg-sheen-hover hover:text-sheen-fg",
              "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-solid focus-visible:outline-sheen-focus",
              "any-pointer-coarse:after:absolute any-pointer-coarse:after:-inset-1.5 any-pointer-coarse:after:content-['']",
            )}
          >
            <CloseIcon strokeWidth={2.6} className="size-3.5" />
          </button>
        )}
      </motion.div>

      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-sheen-danger-text">
          {error}
        </p>
      )}
      {(Boolean(description) || max !== undefined) && (
        <p id={helperId} className="flex justify-between gap-3 text-xs text-sheen-fg-muted">
          <span>{description}</span>
          {max !== undefined && (
            <span className={cn("shrink-0 tabular-nums", atMax && "font-medium text-sheen-accent")}>
              {labels.count(tags.length, max)}
            </span>
          )}
        </p>
      )}
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </span>
      {canEdit && labels.hint && (
        <span id={hintId} hidden>
          {labels.hint}
        </span>
      )}
      {name && tags.map((tag, i) => <input key={`${tag}-${i}`} type="hidden" name={name} value={tag} />)}
    </div>
  );
}

function Chip({
  tag,
  index,
  hint,
  removeLabel,
  removable,
  flash,
  reduced,
  onRemove,
  onKeyDown,
}: {
  tag: string;
  index: number;
  hint: string;
  removeLabel: string;
  removable: boolean;
  flash: number;
  reduced: boolean;
  onRemove: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}) {
  const present = useIsPresent();
  const hintId = useId();
  return (
    <motion.span
      data-slot="tags-input-chip"
      // While leaving, the copy is inert: indexes and focus belong to the chips that stay.
      data-tag-index={present ? index : undefined}
      tabIndex={present ? -1 : undefined}
      aria-hidden={present ? undefined : true}
      // A focusable chip needs a role and a name (4.1.2): a group named by the tag, with the removal hint as its description.
      role="group"
      aria-label={tag}
      aria-describedby={hintId}
      onKeyDown={present ? onKeyDown : undefined}
      key={flash}
      initial={flash > 0 && !reduced ? { scale: 1.12 } : false}
      animate={{ scale: 1 }}
      transition={spring.bouncy}
      className={cn(
        "flex h-7 min-w-0 items-center gap-1 rounded-sheen-full border border-sheen-accent-border bg-sheen-accent-soft ps-2.5 pe-1 text-xs font-medium text-sheen-fg",
        "any-pointer-coarse:h-8",
        "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-solid focus-visible:outline-sheen-focus",
        // A focused chip is "selected for removal": make that visible without the focus ring too.
        "focus:border-sheen-accent focus:bg-sheen-accent-soft",
        flash > 0 && "border-sheen-accent",
        !removable && "pe-2.5",
      )}
    >
      <span className="max-w-48 truncate">{tag}</span>
      <span id={hintId} hidden>
        {hint}
      </span>
      {removable && (
        <button
          type="button"
          tabIndex={-1}
          aria-label={removeLabel}
          onClick={onRemove}
          className={cn(
            "relative flex size-5 shrink-0 items-center justify-center rounded-full text-sheen-fg-muted",
            "transition-[background-color,color] duration-(--sheen-duration-fast) hover:bg-sheen-hover hover:text-sheen-fg",
            "any-pointer-coarse:size-6 any-pointer-coarse:after:absolute any-pointer-coarse:after:-inset-2.5 any-pointer-coarse:after:content-['']",
          )}
        >
          <CloseIcon strokeWidth={2.6} className="size-3" />
        </button>
      )}
    </motion.span>
  );
}

/** Bold the part of a suggestion that matches what was typed. */
function Highlight({ text, query, caseSensitive }: { text: string; query: string; caseSensitive: boolean }) {
  if (!query) return <>{text}</>;
  const hay = caseSensitive ? text : text.toLocaleLowerCase();
  const needle = caseSensitive ? query : query.toLocaleLowerCase();
  const at = hay.indexOf(needle);
  if (at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <mark className="rounded-[0.2rem] bg-sheen-accent-soft text-sheen-accent">
        {text.slice(at, at + query.length)}
      </mark>
      {text.slice(at + query.length)}
    </>
  );
}
