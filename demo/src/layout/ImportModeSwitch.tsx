import { SegmentedControl } from "@sheenui/theme";

import type { ImportMode } from "./import-mode";

/** The "Package / Copied files" switch of an example's Code tab, split out so the segmented control stays out of every page's initial JS. */
export function ImportModeSwitch({
  value,
  onValueChange,
}: {
  value: ImportMode;
  onValueChange: (next: ImportMode) => void;
}) {
  return (
    <SegmentedControl
      aria-label="Import path"
      size="sm"
      value={value}
      onValueChange={(next) => onValueChange(next as ImportMode)}
      items={[
        { value: "package", label: "Package" },
        { value: "files", label: "Copied files" },
      ]}
    />
  );
}
