"use client";

import {
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { motion } from "motion/react";

import { cn } from "../../lib/cn";
import { groupBlur, joinIds, useFocusProxyRef, type FormControlProps } from "../../lib/form";
import { spring } from "../../motion/tokens";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { useControllable } from "../../hooks/use-controllable";
import { isRtlAt } from "../../hooks/use-direction";

/* Cells are >= 44px on touch screens (half steps included: there a tap picks a whole star). */
const sizes = {
  sm: { icon: "size-4", cell: "p-0.5 any-pointer-coarse:p-3.5", text: "text-xs" },
  md: { icon: "size-6", cell: "p-1 any-pointer-coarse:p-2.5", text: "text-sm" },
  lg: { icon: "size-8", cell: "p-1 any-pointer-coarse:p-1.5", text: "text-base" },
} as const;

/* Fill colour, plus a slightly deeper rim (--rating-rim) that gives filled icons a crisp edge.
   Warning is gold: the bright amber in both themes, rimmed with the status amber, so stars
   read golden on light glass instead of brown. */
const tones = {
  warning: "text-(color:--sheen-amber-400) [--rating-rim:var(--sheen-warning)]",
  accent: "text-sheen-accent [--rating-rim:var(--sheen-accent)]",
  danger: "text-sheen-danger [--rating-rim:var(--sheen-danger)]",
  success: "text-sheen-success [--rating-rim:var(--sheen-success)]",
} as const;

/**
 * Every user-facing string of `Rating` (accessible names, announcements, placeholders); pass a partial
 * `labels` prop to translate or reword them. Entries that need a count or a name are functions.
 */
export type RatingLabels = {
  /** Accessible name of the radio for a value, e.g. "3.5 stars". */
  item: (value: number, max: number) => string;
  /** Accessible name of a read-only rating, e.g. "Rated 4 out of 5". */
  readOnly: (value: number, max: number) => string;
  /** Spoken on the group: how to clear. */
  clearHint: string;
};

/**
 * Default English strings of `RatingLabels`; spread it and override single keys to reword. Plain data
 * with no DOM access: safe to read while prerendering. The module is `"use client"`, so a React Server
 * Component receives a client reference instead of the object: read it from a client component.
 */
export const defaultRatingLabels: RatingLabels = {
  item: (value) => `${value} ${value === 1 ? "star" : "stars"}`,
  readOnly: (value, max) => `Rated ${value} out of ${max}`,
  clearHint: "Press Backspace to clear",
};

/** Props of `Rating`; each option is documented on its field. */
export type RatingProps = FormControlProps<HTMLDivElement> & {
  /** The rating (controlled): a number from 0 to `max`, or null for none. */
  value?: number | null;
  /** Sets the starting rating when uncontrolled. */
  defaultValue?: number | null;
  /** Called with the new value, or null when cleared. */
  onValueChange?: (value: number | null) => void;
  /** Number of icons the rating shows. Default 5. */
  max?: number;
  /** Allows half-star steps (0.5, 1, 1.5 …). Default false. */
  allowHalf?: boolean;
  /** Click the current value (or press Backspace / Delete) to clear it. Default true. */
  clearable?: boolean;
  /** Show the value as an image only: not focusable, no hover. Default false. */
  readOnly?: boolean;
  /** Disables the rating so it cannot be changed. */
  disabled?: boolean;
  /** Icon size: "sm" (16px), "md" (24px, default) or "lg" (32px). */
  size?: keyof typeof sizes;
  /** Colour of the filled icons: "warning" (gold, default), "accent", "danger" or "success". */
  tone?: keyof typeof tones;
  /** Sets a custom filled icon (an SVG using currentColor). Defaults to a star. */
  icon?: ReactNode;
  /** Sets a custom empty icon. Defaults to `icon` drawn as a faint outline. */
  emptyIcon?: ReactNode;
  /** Words for each whole value, shown next to the icons, e.g. ["Poor", …, "Excellent"]. */
  valueLabels?: string[];
  /** Show the number (e.g. "4.5") next to the icons. Default false. */
  showValue?: boolean;
  /** Locale used to format the number. */
  locale?: string;
  /** Visible text above the icons; it names the group. */
  label?: ReactNode;
  /** Muted helper text under the icons. */
  description?: ReactNode;
  /** Accessible name when there is no visible `label`. */
  "aria-label"?: string;
  /** Id of an element that names the rating. */
  "aria-labelledby"?: string;
  /** Submits the value with a form. */
  name?: string;
  /** Marks the field as required for form validation. */
  required?: boolean;
  /** Override the spoken strings (i18n). */
  labels?: Partial<RatingLabels>;
  /** Adds extra classes to the outer element. */
  className?: string;
};

/**
 * Rating: stars (or any icon) you can pick with the pointer, touch or keyboard. Use it for reviews and feedback; `readOnly` shows an existing score.
 *
 * - Controlled with `value` + `onValueChange` (null when cleared), or uncontrolled with `defaultValue`; `max` icons, `allowHalf` for half steps,
 *   `clearable` to allow clearing; `icon`/`emptyIcon` swap the star; `tone` and `size` style it; `valueLabels` shows words ("Poor" to "Excellent").
 * - Pointer: hovering previews the value (and its `valueLabels` text); click to set it, click the same value again to clear it (`clearable`).
 *   On touch screens with `allowHalf`, every icon stays one 44px target: tap for the whole icon, tap the same icon again for the half, and once more to clear.
 *
 * Keyboard: Tab enters the group once; ← → ↑ ↓ change the value (and select it); Backspace or Delete clear it; the group announces how to clear.
 * Accessibility: a radio group (Base UI), one radio per step, so screen readers hear "4 stars, radio, 4 of 5". With `allowHalf` every star holds two radios
 * (its left and right half). Read-only ratings are a single image with a label like "Rated 4.5 out of 5"; `labels` translates both.
 * Glass and motion: flat icons (no backdrop blur). The stars up to the new value pop in sequence when it changes. Reduced motion (OS or in-app toggle): no pop, the fill just changes.
 *
 * @example
 * ```tsx
 * import { Rating } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <>
 *       <Rating label="Your rating" defaultValue={4} allowHalf onValueChange={(stars) => console.log(stars)} />
 *       <Rating readOnly value={4.5} showValue aria-label="Average rating" />
 *     </>
 *   );
 * }
 * ```
 *
 * @see /forms/rating
 */
export function Rating({
  value: valueProp,
  defaultValue = null,
  onValueChange,
  max = 5,
  allowHalf = false,
  clearable = true,
  readOnly = false,
  disabled = false,
  size = "md",
  tone = "warning",
  icon,
  emptyIcon,
  valueLabels,
  showValue = false,
  locale,
  label,
  description,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  name,
  required,
  labels: labelsProp,
  className,
  ref,
  onBlur,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: RatingProps) {
  const labels = { ...defaultRatingLabels, ...labelsProp };
  const [value, setValue] = useControllable<number | null>(valueProp, defaultValue, onValueChange);
  const [hover, setHover] = useState<number | null>(null);
  // Bumped on every new value: the icons up to it pop in sequence.
  const [pop, setPop] = useState({ count: 0, value: 0 });
  const reduced = useSheenReducedMotion();
  const id = useId();
  const labelId = `${id}-label`;
  const descriptionId = `${id}-description`;
  const hintId = `${id}-hint`;
  /** The last pointer press: its type, when, and the value at that moment (see onClickCapture). */
  const groupRef = useFocusProxyRef(
    ref,
    '[role="radio"][aria-checked="true"]:not([aria-disabled="true"])',
    '[role="radio"]:not([aria-disabled="true"])',
  );
  const press = useRef<{ type: string; time: number; value: number | null } | null>(null);
  const count = Math.max(1, Math.floor(max));
  const shown = hover ?? value ?? 0;
  const s = sizes[size];

  const filled = icon ?? <StarIcon />;
  const empty = emptyIcon ?? icon ?? <StarIcon outline />;

  const valueText = (v: number) => {
    const word = valueLabels?.[Math.ceil(v) - 1];
    return [showValue ? formatNumber(v, locale) : null, word].filter(Boolean).join(" · ");
  };
  const caption = valueText(shown);

  function commit(next: number | null) {
    setValue(next);
    if (next !== null && next !== value) setPop((p) => ({ count: p.count + 1, value: next }));
  }

  /** Value under the pointer: which icon, and (with halves) which half of it. */
  function valueAt(event: { target: EventTarget; clientX: number }) {
    const cell = (event.target as HTMLElement).closest<HTMLElement>("[data-rating-cell]");
    if (!cell) return null;
    const index = Number(cell.dataset.ratingCell);
    if (!allowHalf) return index + 1;
    const rect = cell.getBoundingClientRect();
    const rtl = isRtlAt(cell);
    const x = rtl ? rect.right - event.clientX : event.clientX - rect.left;
    return index + (x < rect.width / 2 ? 0.5 : 1);
  }

  const icons = (fraction: (i: number) => number, interactive: boolean) =>
    Array.from({ length: count }, (_, i) => {
      const f = fraction(i);
      const partial = f > 0 && f < 1;
      return (
        <span
          key={i}
          data-rating-cell={i}
          className={cn(
            "relative flex shrink-0 rounded-sheen-sm",
            s.cell,
            interactive && [
              "cursor-pointer touch-manipulation",
              // The radio inside is focused; ring the whole icon.
              "has-[[role=radio]:focus-visible]:outline-2 has-[[role=radio]:focus-visible]:outline-offset-0 has-[[role=radio]:focus-visible]:outline-solid has-[[role=radio]:focus-visible]:outline-sheen-focus",
            ],
          )}
        >
          <motion.span
            aria-hidden
            key={pop.count}
            className={cn("relative flex", s.icon)}
            style={partial ? ({ "--fill": `${f * 100}%` } as CSSProperties) : undefined}
            initial={!reduced && pop.count > 0 && i < pop.value ? { scale: 0.55 } : false}
            animate={{ scale: 1 }}
            transition={{ ...spring.bouncy, delay: i * 0.045 }}
          >
            {/* The empty icon only where the fill isn't: no faint rim peeking out around filled icons. */}
            {f < 1 && (
              <span
                className={cn(
                  "flex size-full text-sheen-fg-subtle forced-colors:text-[GrayText]",
                  partial && "[clip-path:inset(0_0_0_var(--fill))] rtl:[clip-path:inset(0_var(--fill)_0_0)]",
                )}
              >
                {empty}
              </span>
            )}
            {f > 0 && (
              <span
                className={cn(
                  "absolute inset-0 flex",
                  tones[tone],
                  // A soft glow in the icon's own colour (static: never animated). It sits on this
                  // outer layer and the clip on the inner one, so a half icon glows along its own
                  // shape instead of being cut into a box.
                  "[filter:drop-shadow(0_1px_4px_color-mix(in_oklab,currentColor_50%,transparent))]",
                  "forced-colors:text-[CanvasText] forced-colors:[--rating-rim:CanvasText] forced-colors:[filter:none]",
                )}
              >
                <span
                  className={cn(
                    "flex size-full",
                    // Partial fill: clip to the start side (the right side in RTL).
                    partial &&
                      "[clip-path:inset(0_calc(100%-var(--fill))_0_0)] rtl:[clip-path:inset(0_0_0_calc(100%-var(--fill)))]",
                  )}
                >
                  {filled}
                </span>
              </span>
            )}
          </motion.span>
          {interactive &&
            (allowHalf ? (
              <>
                <RatingRadio value={i + 0.5} half="start" label={labels.item(i + 0.5, count)} />
                <RatingRadio value={i + 1} half="end" label={labels.item(i + 1, count)} />
              </>
            ) : (
              <RatingRadio value={i + 1} label={labels.item(i + 1, count)} />
            ))}
        </span>
      );
    });

  const fractionFor = (v: number) => (i: number) => Math.max(0, Math.min(1, v - i));

  const header = (Boolean(label) || Boolean(description)) && (
    <div className="flex flex-col gap-0.5">
      {label && (
        <span id={labelId} className="text-sm font-medium text-sheen-fg">
          {label}
        </span>
      )}
      {description && (
        <span id={descriptionId} className="text-xs text-sheen-fg-muted">
          {description}
        </span>
      )}
    </div>
  );

  if (readOnly) {
    const v = value ?? 0;
    return (
      <div data-slot="rating" className={cn("inline-flex flex-col gap-1.5", className)}>
        {header}
        <div className="flex items-center gap-2">
          <div role="img" aria-label={labels.readOnly(v, count)} className="flex items-center">
            {icons(fractionFor(v), false)}
          </div>
          {caption && (
            <span aria-hidden className={cn("font-medium text-sheen-fg-muted tabular-nums", s.text)}>
              {caption}
            </span>
          )}
        </div>
      </div>
    );
  }

  const describedBy = joinIds(ariaDescribedBy, description && descriptionId, clearable && labels.clearHint && hintId);

  return (
    <div data-slot="rating" className={cn("inline-flex flex-col gap-1.5", className)}>
      {header}
      <div className="flex items-center gap-2">
        <RadioGroup
          value={value ?? null}
          onValueChange={(v) => commit(v)}
          disabled={disabled}
          name={name}
          required={required}
          aria-label={label ? undefined : ariaLabel}
          aria-labelledby={ariaLabelledBy ?? (label ? labelId : undefined)}
          aria-describedby={describedBy}
          aria-invalid={ariaInvalid === true || ariaInvalid === "true" ? true : undefined}
          ref={groupRef}
          onBlur={groupBlur(onBlur)}
          onPointerDown={(e: PointerEvent<HTMLDivElement>) => {
            press.current = { type: e.pointerType, time: e.timeStamp, value };
          }}
          onPointerMove={(e: PointerEvent<HTMLDivElement>) => {
            if (disabled || e.pointerType === "touch") return;
            const v = valueAt(e);
            if (v !== null && v !== hover) setHover(v);
          }}
          onPointerLeave={() => setHover(null)}
          onClickCapture={(e: MouseEvent<HTMLDivElement>) => {
            // Pointer clicks are resolved here, from where the icon was hit. Clicks with no
            // pointer press just before (keyboard Space, screen-reader activation) fall through
            // to the radio itself, so they always pick that radio's own value.
            const p = press.current;
            press.current = null;
            if (!p || disabled || e.detail === 0 || e.timeStamp - p.time > 2000) return;
            const cell = (e.target as HTMLElement).closest<HTMLElement>("[data-rating-cell]");
            if (!cell) return;
            e.preventDefault(); // Base UI's radio skips a prevented click.
            const index = Number(cell.dataset.ratingCell);
            let next: number | null;
            if (allowHalf && p.type === "touch") {
              // Fingers are too wide for half-icon targets: tap picks the whole icon, tap it
              // again for the half, and again to clear.
              next =
                p.value === index + 1
                  ? index + 0.5
                  : p.value === index + 0.5
                    ? clearable
                      ? null
                      : index + 1
                    : index + 1;
            } else {
              const v = valueAt(e) ?? index + 1;
              next = clearable && v === p.value ? null : v;
            }
            if (next === null) {
              setValue(null);
              setHover(null);
            } else if (next !== value) {
              commit(next);
            }
          }}
          onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
            if (clearable && (e.key === "Backspace" || e.key === "Delete") && value !== null) {
              e.preventDefault();
              setValue(null);
            }
          }}
          className={cn(
            "flex items-center",
            disabled && "cursor-not-allowed opacity-55 [&_[data-rating-cell]]:cursor-not-allowed",
          )}
        >
          {icons(fractionFor(shown), true)}
        </RadioGroup>
        {clearable && labels.clearHint && (
          <span id={hintId} hidden>
            {labels.clearHint}
          </span>
        )}
        {(Boolean(valueLabels) || showValue) && (
          // Visual echo of the hovered / chosen value; the radios already announce it.
          <span
            aria-hidden
            className={cn(
              "min-w-[2ch] font-medium text-sheen-fg-muted tabular-nums",
              s.text,
              hover !== null && "text-sheen-fg",
            )}
          >
            {caption}
          </span>
        )}
      </div>
    </div>
  );
}

function RatingRadio({ value, half, label }: { value: number; half?: "start" | "end"; label: string }) {
  return (
    <Radio.Root
      value={value}
      aria-label={label}
      className={cn(
        "absolute inset-y-0 outline-none",
        // Touch screens: both halves span the whole (>= 44px) icon; a tap there picks the whole
        // icon and a second tap the half (see the group's click handler).
        half === "start"
          ? "start-0 w-1/2 any-pointer-coarse:w-full"
          : half === "end"
            ? "end-0 w-1/2 any-pointer-coarse:w-full"
            : "inset-x-0",
        "data-disabled:cursor-not-allowed",
      )}
    />
  );
}

function StarIcon({ outline = false }: { outline?: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      // Filled: a slightly deeper rim from the tone (--rating-rim) gives a crisp edge.
      className={cn("size-full", !outline && "[stroke:var(--rating-rim,currentColor)]")}
      fill={outline ? "none" : "currentColor"}
      stroke="currentColor"
      strokeWidth={outline ? 1.6 : 1.2}
      strokeLinejoin="round"
    >
      <path d="M12 2.8l2.83 5.73 6.33.92-4.58 4.46 1.08 6.3L12 17.24l-5.66 2.97 1.08-6.3L2.84 9.45l6.33-.92L12 2.8z" />
    </svg>
  );
}

function formatNumber(value: number, locale?: string) {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value);
}
