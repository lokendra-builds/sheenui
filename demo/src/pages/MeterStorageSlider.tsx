import { Slider } from "@sheenui/theme";

export function StorageSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <Slider
      label="Storage used"
      value={value}
      onValueChange={(v) => onChange(v as number)}
      className="w-full max-w-xs"
    />
  );
}
