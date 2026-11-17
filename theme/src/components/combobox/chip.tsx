"use client";

import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { useIsPresent } from "motion/react";

import { cn } from "../../lib/cn";
import { CloseIcon } from "../status-icons/icons";
import type { ComboboxOption } from "./combobox";

const chipClass = cn(
  "flex h-7 items-center gap-1.5 rounded-sheen-full border border-sheen-accent-border bg-sheen-accent-soft pe-1 ps-2.5 text-xs font-medium text-sheen-fg",
  "any-pointer-coarse:h-8",
);

/**
 * One chip of a multiple Combobox (internal). While it animates out it renders as a plain, inert copy: the real Base UI chip
 * unregisters at once, so chip indexes and keyboard focus move to the chips that remain.
 *
 * @example
 * ```tsx
 * import { Combobox } from "@sheenui/theme";
 *
 * export function Example() {
 *   return <Combobox label="Item" options={[{ value: "a", label: "A" }]} multiple />;
 * }
 * ```
 *
 * @see /components/combobox
 *
 * @internal
 */
export function Chip({ item, removeLabel, hint }: { item: ComboboxOption; removeLabel: string; hint: string }) {
  const present = useIsPresent();
  const content = (
    <>
      {item.icon && (
        // A fixed 20px round slot: avatars, flags and icons all fit without stretching the chip.
        <span
          aria-hidden
          className="-ms-1 flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-full [&_svg]:size-3.5"
        >
          {item.icon}
        </span>
      )}
      <span className="max-w-48 truncate">{item.label}</span>
    </>
  );

  if (!present) {
    return (
      <span aria-hidden data-sheen-exiting="" className={chipClass}>
        {content}
        <span className="flex size-5 items-center justify-center text-sheen-fg-muted any-pointer-coarse:size-6">
          <CloseIcon strokeWidth={2.6} className="size-3" />
        </span>
      </span>
    );
  }

  return (
    <BaseCombobox.Chip
      data-sheen-chip=""
      aria-description={hint}
      className={cn(
        chipClass,
        // No `outline-none` here: in Tailwind v4 it zeroes --tw-outline-style and hides the focus outline.
        "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-solid focus-visible:outline-sheen-focus",
      )}
    >
      {content}
      <BaseCombobox.ChipRemove
        aria-label={removeLabel}
        className={cn(
          "relative flex size-5 items-center justify-center rounded-full text-sheen-fg-muted transition-colors hover:bg-sheen-hover hover:text-sheen-fg",
          // 44px hit area on touch screens.
          "any-pointer-coarse:size-6 any-pointer-coarse:after:absolute any-pointer-coarse:after:-inset-2.5 any-pointer-coarse:after:content-['']",
        )}
      >
        <CloseIcon strokeWidth={2.6} className="size-3" />
      </BaseCombobox.ChipRemove>
    </BaseCombobox.Chip>
  );
}
