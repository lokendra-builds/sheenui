/**
 * The one height scale of every button and form control: "sm" 32px, "md" 40px (default), "lg" 48px, read from the
 * `--sheen-control-h-*` tokens (styles/tokens.css) so a Button beside an Input lines up at every size. On touch screens
 * (`any-pointer: coarse`) "sm" and "md" grow to 44px, so no control is shorter than a finger.
 */
export type FieldSize = "sm" | "md" | "lg";

/** Fixed heights for single-line controls (Select trigger, NumberField, date picker trigger, ColorField, Input). */
export const fieldHeight: Record<FieldSize, string> = {
  sm: "h-(--sheen-control-h-sm)",
  md: "h-(--sheen-control-h-md)",
  lg: "h-(--sheen-control-h-lg)",
};

/** Minimum heights for controls that can grow (Combobox with chips, TagsInput). */
export const fieldMinHeight: Record<FieldSize, string> = {
  sm: "min-h-(--sheen-control-h-sm)",
  md: "min-h-(--sheen-control-h-md)",
  lg: "min-h-(--sheen-control-h-lg)",
};
