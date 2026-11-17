"use client";

import {
  createContext,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Field } from "@base-ui/react/field";
import { Fieldset } from "@base-ui/react/fieldset";
import { Radio as BaseRadio } from "@base-ui/react/radio";
import { LabelableProvider } from "@base-ui/react/internals/labelable-provider";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import { motion } from "motion/react";

import { cn } from "../../lib/cn";
import { groupBlur, joinIds, useFocusProxyRef, type FormControlProps } from "../../lib/form";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { spring } from "../../motion/tokens";

/** One option of a `RadioGroup` given as data: its value, label, optional description and state. */
export type RadioItem = {
  /** Sets the value this option stands for. */
  value: string;
  /** Sets the option's visible text and accessible name. */
  label: ReactNode;
  /** Second line under the label (linked to the radio as its description). */
  description?: ReactNode;
  /** Card variant: icon or illustration at the start of the card. */
  icon?: ReactNode;
  /** Card variant: trailing content such as a price or a badge. */
  meta?: ReactNode;
  /** Makes this card unselectable: it is dimmed and skipped by arrow-key navigation and the tab order. */
  disabled?: boolean;
};

/** Props of `RadioGroup`; each option is documented on its field. */
export type RadioGroupProps = FormControlProps<HTMLDivElement> & {
  /** The options. Leave out to compose <Radio> or <RadioCard> children instead. */
  items?: RadioItem[];
  /** `Radio` or `RadioCard` options, when you do not pass `items`. */
  children?: ReactNode;
  /** "classic" dots or rich "card" options (used for `items`; also sets the layout for children). */
  variant?: "classic" | "card";
  /** Sets the chosen value when controlled. `null` means nothing chosen. */
  value?: string | null;
  /** Sets the starting value when uncontrolled. */
  defaultValue?: string | null;
  /** Called with the chosen option's value. */
  onValueChange?: (value: string) => void;
  /** Visible group label (a legend). Use `aria-label` when there is none. */
  label?: ReactNode;
  /** Shows helper text under the label. */
  description?: ReactNode;
  /** Error message; marks every radio invalid and is announced politely when it appears. */
  error?: ReactNode;
  /** Classic variant: stack the options or lay them out in a row (wraps on small screens). */
  orientation?: "vertical" | "horizontal";
  /** Card variant: columns once the group is wide enough (always one column when narrow). */
  columns?: 1 | 2 | 3 | 4;
  /**
   * Card variant: "row" (side by side), "stack" (pricing-card style), or "auto": stacked once a
   * 3- or 4-column group shows several columns, rows otherwise (e.g. one column on phones).
   */
  cardLayout?: RadioCardLayout;
  /** Submits the value with a form. */
  name?: string;
  /** Id of a form outside of which the group is rendered. */
  form?: string;
  /** Marks the group as required for form validation. */
  required?: boolean;
  /** Disables every option of the group. */
  disabled?: boolean;
  /** Show the choice but do not allow changes. */
  readOnly?: boolean;
  /** Accessible name of the group when there is no visible `label`. */
  "aria-label"?: string;
  /** Id of an element that names the group. */
  "aria-labelledby"?: string;
  /** Class for the outer wrapper (label + options + messages). */
  className?: string;
  /** Class for the element that lays out the options (list or grid). */
  listClassName?: string;
};

type GroupContextValue = {
  value: string | null;
  /** Shared-layout id of the card selection tint, unique per group. */
  selectionId: string;
  reduced: boolean;
  invalid: boolean;
  disabled: boolean;
  cardLayout: RadioCardLayout;
  columns: 1 | 2 | 3 | 4;
  /** Ids of the group's description and error (when shown), read with every radio. */
  messageIds?: string;
};

/**
 * How radio cards are laid out: `row` (side by side), `stack` (pricing-card style) or `auto` (stacked
 * once the group is narrow).
 */
export type RadioCardLayout = "row" | "stack" | "auto";

const GroupContext = createContext<GroupContextValue | null>(null);

const columnClasses = {
  1: "grid-cols-1",
  2: "@md:grid-cols-2",
  // Three options never split 2 + 1: straight from one column to three.
  3: "@xl:grid-cols-3",
  4: "@md:grid-cols-2 @3xl:grid-cols-4",
} as const;

/**
 * Radio group: pick exactly one option. Use `Select` for long lists, `SegmentedControl` for a few view modes, and `Checkbox` for many-of-many.
 *
 * - "classic": a glass dot per option; the accent fill fades in and a white pip springs out.
 * - "card": rich option cards (icon, description, price). The selection tint glides from the old card to the new one (Motion shared layout,
 *   transform only). `columns` (1 to 4) and `cardLayout` ("row", "stack", "auto") shape the grid, which follows the group's own width.
 * - Pass `items` (`{ value, label, description?, icon?, meta?, disabled? }`) for the common case, or compose `<Radio>` / `<RadioCard>` children yourself.
 * - Controlled with `value` + `onValueChange`, or uncontrolled with `defaultValue`; `label` is the legend; `error` marks every radio invalid; `name` submits it with a form.
 *
 * Built on Base UI RadioGroup inside Field + Fieldset: the legend names the group, the description and error are linked to every radio.
 * Keyboard: Tab enters the group once, on the chosen option (or the first); ↑ ↓ ← → move the choice and select it; Space selects the focused option.
 * Accessibility: `role="radiogroup"` named by the legend (or `aria-label`); each option is `role="radio"` with `aria-checked`; targets are 44px on touch screens;
 * a checked classic radio fills with `Highlight` in forced colors and a checked card gets a thick `Highlight` edge.
 * Glass and motion: classic dots and cards are `glass-1` surfaces (cards: keep the group within the budget of 8 backdrop-filter surfaces in view). With reduced motion the tint jumps and the pip simply fades.
 *
 * @example
 * ```tsx
 * import { RadioGroup } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <RadioGroup
 *       label="Plan"
 *       defaultValue="pro"
 *       items={[
 *         { value: "free", label: "Free", description: "For side projects" },
 *         { value: "pro", label: "Pro", description: "For teams" },
 *       ]}
 *       onValueChange={(plan) => console.log(plan)}
 *     />
 *   );
 * }
 * ```
 *
 * @see /forms/radio-group
 */
export function RadioGroup({
  items,
  children,
  variant = "classic",
  value,
  defaultValue,
  onValueChange,
  label,
  description,
  error,
  orientation = "vertical",
  columns = 2,
  cardLayout,
  name,
  form,
  required,
  disabled = false,
  readOnly,
  className,
  listClassName,
  ref,
  onBlur,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: RadioGroupProps) {
  const reduced = useSheenReducedMotion();
  const selectionId = useId();
  const descriptionId = `${selectionId}-description`;
  const errorId = `${selectionId}-error`;
  // Always drive Base UI with a value, so the cards know which one holds the selection tint.
  const [inner, setInner] = useState<string | null>(defaultValue ?? null);
  const current = value !== undefined ? value : inner;
  const invalid = Boolean(error) || ariaInvalid === true || ariaInvalid === "true";
  const groupRef = useFocusProxyRef(
    ref,
    '[role="radio"][aria-checked="true"]:not([aria-disabled="true"])',
    '[role="radio"]:not([aria-disabled="true"])',
  );
  const context: GroupContextValue = {
    value: current,
    selectionId,
    reduced,
    invalid,
    disabled,
    // Wide card grids read best as pricing-style stacks; narrow ones as rows.
    cardLayout: cardLayout ?? (columns >= 3 ? "auto" : "row"),
    columns,
    messageIds: joinIds(description && descriptionId, error && errorId),
  };

  const options = items
    ? items.map((item) =>
        variant === "card" ? <RadioCard key={item.value} {...item} /> : <Radio key={item.value} {...item} />,
      )
    : children;

  const list =
    variant === "card" ? (
      // Columns follow the group's own width (container query), not the viewport.
      <div className="@container w-full min-w-0">
        <div
          data-slot="radio-group-list"
          className={cn("grid grid-cols-1 gap-3", columnClasses[columns], listClassName)}
        >
          {options}
        </div>
      </div>
    ) : (
      <div
        data-slot="radio-group-list"
        className={cn(
          orientation === "horizontal" ? "flex flex-wrap gap-x-6 gap-y-1" : "flex flex-col gap-0.5",
          listClassName,
        )}
      >
        {options}
      </div>
    );

  return (
    <Field.Root
      name={name}
      disabled={disabled}
      invalid={invalid}
      data-slot="radio-group-root"
      className={cn("flex w-full min-w-0 flex-col gap-2", className)}
    >
      <Fieldset.Root
        render={
          <BaseRadioGroup
            value={current}
            onValueChange={(next) => {
              // A radio group always reports the chosen option's value.
              if (next === null) return;
              setInner(next);
              onValueChange?.(next);
            }}
            name={name}
            form={form}
            required={required}
            disabled={disabled}
            readOnly={readOnly}
            aria-invalid={invalid || undefined}
            aria-describedby={joinIds(ariaDescribedBy)}
            {...(ariaLabel !== undefined && { "aria-label": ariaLabel })}
            {...(ariaLabelledBy !== undefined && { "aria-labelledby": ariaLabelledBy })}
          />
        }
        data-slot="radio-group"
        ref={groupRef}
        onBlur={groupBlur(onBlur)}
        className="m-0 flex min-w-0 flex-col gap-2 border-0 p-0"
      >
        {label && <Fieldset.Legend className="text-sm font-medium text-sheen-fg">{label}</Fieldset.Legend>}
        {description && (
          <Field.Description id={descriptionId} className="-mt-1 text-xs text-sheen-fg-muted">
            {description}
          </Field.Description>
        )}
        <GroupContext value={context}>{list}</GroupContext>
      </Fieldset.Root>
      {/* A live region that is always there, so an error that appears (say, on submit) is
          announced politely. Taken out of the flow while empty, so it adds no gap. */}
      <div aria-live="polite" aria-atomic="true" className="empty:absolute">
        {error && (
          <Field.Error match id={errorId} className="text-xs font-medium text-sheen-danger-text">
            {error}
          </Field.Error>
        )}
      </div>
    </Field.Root>
  );
}

/* ---------- The dot ---------- */

type RadioDotProps = {
  value: string;
  disabled?: boolean;
  /** Space-separated ids of the visible text that names the radio. */
  labelledBy: string;
  /** Space-separated ids of the visible text that describes it. */
  describedBy?: string;
  /** Another element draws the focus ring (the card), so the dot skips the global high-contrast one. */
  innerFocus?: boolean;
  className?: string;
};

/**
 * Field gives every control inside it one shared `controlId`, so each hidden native input of a group
 * would carry the same id. A `LabelableProvider` per dot gives it its own id; the group's description
 * and error ids (which that Field context would have supplied) are passed on by hand.
 */
function RadioDot(props: RadioDotProps) {
  const group = useContext(GroupContext);
  const describedBy = joinIds(props.describedBy, group?.messageIds);
  return (
    <LabelableProvider>
      <RadioDotRoot {...props} describedBy={describedBy} />
    </LabelableProvider>
  );
}

function RadioDotRoot({ value, disabled, labelledBy, describedBy, innerFocus, className }: RadioDotProps) {
  return (
    <BaseRadio.Root
      value={value}
      disabled={disabled}
      {...(innerFocus && { "data-sheen-inner-focus": "" })}
      aria-labelledby={labelledBy}
      {...(describedBy && { "aria-describedby": describedBy })}
      data-slot="radio"
      className={cn(
        "glass-1 relative flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full",
        // A boundary with >= 3:1 contrast, so an empty radio is still recognisable as one.
        "border-sheen-control-border hover:border-sheen-accent",
        "touch-manipulation [-webkit-tap-highlight-color:transparent]",
        // Accent fill on its own layer, faded with opacity (a background-image can't transition).
        "before:pointer-events-none before:absolute before:-inset-px before:-z-10 before:rounded-[inherit] before:[background-image:var(--sheen-accent-fill)]",
        "before:opacity-0 before:transition-opacity before:duration-(--sheen-duration-exit) before:ease-sheen-exit",
        "data-checked:border-transparent data-checked:before:opacity-100 data-checked:before:duration-(--sheen-duration-fast) data-checked:before:ease-sheen-out",
        "transition-[border-color,scale] duration-(--sheen-duration-fast) ease-sheen-out",
        "motion-ok:active:not-data-disabled:not-data-readonly:scale-90",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
        "data-invalid:not-data-checked:border-sheen-danger",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50 data-disabled:hover:border-sheen-control-border",
        "data-readonly:cursor-default",
        // High contrast: a checked radio fills with Highlight (`!` beats glass.css's unlayered fallback).
        "forced-colors:data-checked:border-[Highlight]! forced-colors:data-checked:bg-[Highlight]!",
        className,
      )}
    >
      <BaseRadio.Indicator
        keepMounted
        className={cn(
          "size-2 rounded-full bg-sheen-accent-fg shadow-[0_1px_1px_var(--sheen-shadow-near)]",
          // Exit: quick ease-in, no overshoot. Enter: springs out. Reduced motion: fade only.
          "opacity-0 transition-[opacity,scale] duration-(--sheen-duration-exit) ease-sheen-exit motion-ok:scale-0",
          "data-checked:opacity-100 data-checked:duration-(--sheen-duration-snappy) data-checked:ease-sheen-snappy motion-ok:data-checked:scale-100",
          "forced-colors:bg-[HighlightText]",
        )}
      />
      {/* Invisible hit area: 44×44 px on touch screens. A real element, never ::after (glass owns it). */}
      <span aria-hidden className="sheen-hit-area" />
    </BaseRadio.Root>
  );
}

/* ---------- Classic option ---------- */

/** Props of `Radio`; each option is documented on its field. */
export type RadioProps = {
  /** Sets the value this option stands for. */
  value: string;
  /** Sets the option's visible text and accessible name. */
  label: ReactNode;
  /** Second line under the label (linked to the radio as its description). */
  description?: ReactNode;
  /** Makes this radio unselectable: it is dimmed and skipped by arrow-key navigation and the tab order. */
  disabled?: boolean;
  /** Adds extra classes to the option row (a <label>). */
  className?: string;
};

/**
 * One classic option: the dot plus its label and description. Use inside `<RadioGroup>`; it reads the group's value, disabled and invalid state.
 * `className` styles the option row (a `<label>`, so clicking the text selects it).
 *
 * Keyboard and accessibility: see `RadioGroup` (arrow keys move the choice; the label and description are linked to the radio).
 * Glass and motion: a `glass-1` dot; the pip springs out (fade only under reduced motion).
 *
 * @example
 * ```tsx
 * import { Radio, RadioGroup } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <RadioGroup label="Delivery" defaultValue="standard">
 *       <Radio value="standard" label="Standard" description="3 to 5 days" />
 *       <Radio value="express" label="Express" description="Next day" />
 *     </RadioGroup>
 *   );
 * }
 * ```
 *
 * @see /forms/radio-group
 */
export function Radio({ value, label, description, disabled: disabledProp, className }: RadioProps) {
  const group = useContext(GroupContext);
  const id = useId();
  const labelId = `${id}-label`;
  const descriptionId = description ? `${id}-description` : undefined;
  const disabled = Boolean(disabledProp) || Boolean(group?.disabled);

  return (
    <label
      data-slot="radio-item"
      data-disabled={disabled || undefined}
      className={cn(
        "flex w-fit max-w-full cursor-pointer items-start gap-3 py-1.5 select-none",
        // At least 44px tall on touch screens.
        "any-pointer-coarse:min-h-11 any-pointer-coarse:min-w-11 any-pointer-coarse:py-3",
        disabled && "cursor-not-allowed",
        className,
      )}
    >
      {/* h-5 = one line of text-sm, so the dot sits on the label's first line. */}
      <span className="flex h-5 items-center">
        <RadioDot value={value} disabled={disabledProp} labelledBy={labelId} describedBy={descriptionId} />
      </span>
      <span className={cn("flex min-w-0 flex-col gap-0.5", disabled && "opacity-55")}>
        <span id={labelId} className="text-sm leading-5 font-medium text-sheen-fg">
          {label}
        </span>
        {description && (
          <span id={descriptionId} className="text-xs text-sheen-fg-muted">
            {description}
          </span>
        )}
      </span>
    </label>
  );
}

/* ---------- Card option ---------- */

/** Props of `RadioCard`: everything `Radio` takes plus the card layout. */
export type RadioCardProps = RadioProps & {
  /** Icon or illustration at the start of the card. */
  icon?: ReactNode;
  /** Trailing content such as a price or a badge. Read with the label ("Pro, $12/mo"). */
  meta?: ReactNode;
  /** Extra content under the description (feature list, preview). Read as part of the description. */
  children?: ReactNode;
  /**
   * "row": icon, label and meta side by side, description underneath. "stack": icon and dot on
   * top, text below, meta pinned to the bottom (pricing-card style). "auto" (the group's
   * default): stack once a 3- or 4-column group shows several columns, row otherwise.
   */
  layout?: RadioCardLayout;
};

/*
 * One DOM, two grid templates. The areas are worked out from what the card has (so empty
 * tracks add no gaps) and passed as custom properties; the classes pick a template, and
 * "auto" swaps at the group's container breakpoint.
 *
 *   row:    icon head dot          head = label + meta, which wraps under the label (right
 *           icon desc desc         aligned) when both don't fit. desc spans under meta and dot,
 *                                  so on phones the description keeps the card's full width.
 *   stack:  icon  dot              head dissolves (display: contents), so label and meta
 *           label label            land in their own rows; meta takes the spare height and
 *           desc  desc             sits at the bottom.
 *           meta  meta
 */
const ROW = "[grid-template-areas:var(--row-areas)] [grid-template-columns:var(--row-cols)] gap-y-0.5";
const cardTemplates = {
  row: {
    card: ROW,
    icon: "",
    head: "flex flex-wrap items-baseline gap-x-3",
    meta: "ms-auto text-sm leading-5",
  },
  stack: {
    card: "[grid-template-areas:var(--stack-areas)] [grid-template-columns:minmax(0,1fr)_auto] [grid-template-rows:var(--stack-rows)] gap-y-0.5",
    icon: "mb-2.5",
    head: "contents",
    meta: "self-end pt-3 text-lg leading-6",
  },
  /** Stacked from a 448px-wide group (4 options: two columns, then four). */
  "auto-md": {
    card: `${ROW} @md:[grid-template-areas:var(--stack-areas)] @md:[grid-template-columns:minmax(0,1fr)_auto] @md:[grid-template-rows:var(--stack-rows)]`,
    icon: "@md:mb-2.5",
    head: "flex flex-wrap items-baseline gap-x-3 @md:contents",
    meta: "ms-auto text-sm leading-5 @md:ms-0 @md:self-end @md:pt-3 @md:text-lg @md:leading-6",
  },
  /** Stacked from a 576px-wide group (3 options in a row). */
  "auto-xl": {
    card: `${ROW} @xl:[grid-template-areas:var(--stack-areas)] @xl:[grid-template-columns:minmax(0,1fr)_auto] @xl:[grid-template-rows:var(--stack-rows)]`,
    icon: "@xl:mb-2.5",
    head: "flex flex-wrap items-baseline gap-x-3 @xl:contents",
    meta: "ms-auto text-sm leading-5 @xl:ms-0 @xl:self-end @xl:pt-3 @xl:text-lg @xl:leading-6",
  },
} as const;

/** The card's corner radius in px (+1 for the tint, which sits 1px outside), for Motion. */
function useCornerRadius() {
  const ref = useRef<HTMLLabelElement>(null);
  const [radius, setRadius] = useState<number>();
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const px = parseFloat(getComputedStyle(el).borderTopLeftRadius);
    if (Number.isFinite(px)) setRadius(px + 1);
  }, []);
  return [ref, radius] as const;
}

/**
 * One rich option card. Use inside `<RadioGroup variant="card">`. The whole card is the click target; `icon` sits at the start, `meta` holds a price or badge
 * (read with the label, "Pro, $12/mo"), `description` is the second line and `children` are extra content (a feature list) read as part of the description.
 * `layout` overrides the group's card layout ("row", "stack" or "auto").
 *
 * Keyboard and accessibility: see `RadioGroup` (the dot is focused; the whole card shows the focus ring).
 * Glass and motion: a `glass-1` card. The selection tint glides between cards with `spring.snappy` (transform only); with reduced motion it jumps.
 *
 * @example
 * ```tsx
 * import { RadioCard, RadioGroup } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <RadioGroup variant="card" label="Billing" defaultValue="monthly">
 *       <RadioCard value="monthly" label="Monthly" meta="$12/mo" description="Cancel any time" />
 *       <RadioCard value="yearly" label="Yearly" meta="$99/yr" description="Two months free" />
 *     </RadioGroup>
 *   );
 * }
 * ```
 *
 * @see /forms/radio-group
 */
export function RadioCard({
  value,
  label,
  description,
  icon,
  meta,
  disabled: disabledProp,
  layout,
  className,
  children,
}: RadioCardProps) {
  const group = useContext(GroupContext);
  const id = useId();
  const labelId = `${id}-label`;
  const metaId = `${id}-meta`;
  const descriptionId = `${id}-description`;
  const extraId = `${id}-extra`;
  const checked = group?.value === value;
  const disabled = Boolean(disabledProp) || Boolean(group?.disabled);
  const reduced = group?.reduced ?? false;
  const resolved = layout ?? group?.cardLayout ?? "row";
  const template = cardTemplates[resolved === "auto" ? (group?.columns === 3 ? "auto-xl" : "auto-md") : resolved];
  const faded = disabled && "opacity-55";
  const [cardRef, radius] = useCornerRadius();

  const hasIcon = Boolean(icon);
  const hasMeta = meta != null && meta !== false;
  const hasDescription = description != null && description !== false;
  const hasExtra = children != null && children !== false;
  const hasDesc = hasDescription || hasExtra;

  // The price is part of the option's name ("Pro $12/mo"); the description and extra content
  // (a badge, a delivery estimate) are its description.
  const labelledBy = [labelId, hasMeta && metaId].filter(Boolean).join(" ");
  const describedBy = [hasDescription && descriptionId, hasExtra && extraId].filter(Boolean).join(" ") || undefined;

  const areas = {
    "--row-areas": [
      `"${[hasIcon && "icon", "head", "dot"].filter(Boolean).join(" ")}"`,
      hasDesc && `"${[hasIcon && "icon", "desc", "desc"].filter(Boolean).join(" ")}"`,
    ]
      .filter(Boolean)
      .join(" "),
    "--row-cols": [hasIcon && "auto", "minmax(0,1fr)", "auto"].filter(Boolean).join(" "),
    "--stack-areas": [
      hasIcon ? `"icon dot"` : `"label dot"`,
      hasIcon && `"label label"`,
      hasDesc && `"desc desc"`,
      hasMeta && `"meta meta"`,
    ]
      .filter(Boolean)
      .join(" "),
    // Every row hugs its content except the last, which takes the spare height (meta sits at the bottom).
    "--stack-rows": [
      ...Array.from({ length: (hasIcon ? 2 : 1) + (hasDesc ? 1 : 0) + (hasMeta ? 1 : 0) - 1 }, () => "auto"),
      "minmax(0,1fr)",
    ].join(" "),
  } as CSSProperties;

  return (
    <label
      ref={cardRef}
      data-slot="radio-card"
      data-checked={checked || undefined}
      data-disabled={disabled || undefined}
      style={areas}
      className={cn(
        "glass-1 group/card relative grid min-w-0 cursor-pointer content-start items-start gap-x-3 rounded-sheen-lg p-4 text-start select-none",
        template.card,
        "touch-manipulation [-webkit-tap-highlight-color:transparent]",
        "transition-[border-color,scale] duration-(--sheen-duration-base) ease-sheen-out",
        // Hover wash on its own layer (the glass keeps its background).
        "after:pointer-events-none after:absolute after:inset-0 after:-z-20 after:rounded-[inherit] after:bg-sheen-hover after:opacity-0",
        "after:transition-opacity after:duration-(--sheen-duration-fast) hover:after:opacity-100",
        "data-checked:border-sheen-accent",
        group?.invalid && !checked && "border-sheen-danger",
        // The dot is focused, the whole card shows the ring.
        "has-[[role=radio]:focus-visible]:outline-2 has-[[role=radio]:focus-visible]:outline-offset-2 has-[[role=radio]:focus-visible]:outline-sheen-focus",
        !disabled && "motion-ok:active:scale-[0.985]",
        disabled && "cursor-not-allowed hover:after:opacity-0",
        // High contrast: the chosen card gets a thick Highlight edge (tints and shadows are dropped).
        "forced-colors:data-checked:border-2 forced-colors:data-checked:border-[Highlight]!",
        className,
      )}
    >
      {checked && (
        // The selection tint. Shared layout id: Motion slides it from the previously chosen card.
        // The radius goes through `style` so Motion keeps the corners round while it stretches.
        <motion.span
          aria-hidden
          layoutId={`${group.selectionId}-selection`}
          transition={reduced ? { duration: 0 } : spring.snappy}
          style={radius === undefined ? undefined : { borderRadius: radius }}
          className="pointer-events-none absolute -inset-px -z-10 rounded-[inherit] bg-sheen-accent-soft shadow-[inset_0_0_0_1px_var(--sheen-accent)]"
        />
      )}
      {hasIcon && (
        <span
          aria-hidden
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-sheen-md bg-sheen-hover text-sheen-fg-muted [grid-area:icon]",
            "transition-colors duration-(--sheen-duration-base) [&_svg]:size-5",
            "group-data-checked/card:bg-sheen-accent-soft group-data-checked/card:text-sheen-accent",
            template.icon,
            faded,
          )}
        >
          {icon}
        </span>
      )}
      <span className={cn("min-w-0 [grid-area:head]", template.head, faded)}>
        <span id={labelId} className="min-w-0 text-sm leading-5 font-semibold text-sheen-fg [grid-area:label]">
          {label}
        </span>
        {hasMeta && (
          <span
            id={metaId}
            className={cn("font-semibold whitespace-nowrap text-sheen-fg tabular-nums [grid-area:meta]", template.meta)}
          >
            {meta}
          </span>
        )}
      </span>
      {hasDesc && (
        <span className={cn("flex min-w-0 flex-col [grid-area:desc]", faded)}>
          {hasDescription && (
            <span id={descriptionId} className="text-xs text-pretty text-sheen-fg-muted">
              {description}
            </span>
          )}
          {hasExtra && (
            <span id={extraId} className="mt-2 block text-xs text-sheen-fg-muted">
              {children}
            </span>
          )}
        </span>
      )}
      <span className="flex h-5 items-center justify-self-end [grid-area:dot]">
        <RadioDot
          value={value}
          disabled={disabledProp}
          labelledBy={labelledBy}
          describedBy={describedBy}
          innerFocus
          // The card shows the focus ring (in high contrast too).
          className="focus-visible:outline-none forced-colors:focus-visible:outline-none!"
        />
      </span>
    </label>
  );
}
