import type { ReactNode } from "react";
import { SegmentedControl } from "@sheenui/theme";

export type SegmentedOption<T extends string> = { value: T; label: ReactNode };

type SegmentedProps<T extends string> = {
  /** Accessible name of the group (not shown). */
  label: string;
  options: readonly SegmentedOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  size?: "sm" | "md";
  className?: string;
};

/**
 * Segmented control for "pick one of a few" settings (theme, time range): the library's own `SegmentedControl`
 * behind the docs' small `label` / `options` vocabulary, so the docs exercise the shipped component and never a copy.
 */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onValueChange,
  size = "md",
  className,
}: SegmentedProps<T>) {
  return (
    <SegmentedControl
      aria-label={label}
      items={options.map((option) => ({ value: option.value, label: option.label }))}
      value={value}
      onValueChange={(next) => onValueChange(next as T)}
      size={size}
      className={className}
    />
  );
}
