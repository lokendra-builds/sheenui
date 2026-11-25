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
