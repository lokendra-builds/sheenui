"use client";

import { SegmentedControl } from "@/components/sheenui/segmented/segmented";
import { useSheenStyle, useTheme, isSheenStyle, type ThemeChoice } from "@/components/sheenui/hooks/use-preferences";
import { DropIcon, MonitorIcon, MoonIcon, SparkleIcon, SunIcon } from "./icons";

/**
 * The two switches of the header: the style preset (Liquid Glass / Aurora Neon) and the colour
 * theme (light / dark / system). Both are saved in localStorage by SheenUI and applied to <html>
 * as `data-sheen-style` and `data-theme`; the inline script in the page head restores them
 * before the first paint.
 */
export function ThemeControls({ iconOnly, stacked = false }: { iconOnly: boolean; stacked?: boolean }) {
  const { theme, setTheme } = useTheme();
  const { style, setStyle } = useSheenStyle();
  return (
    <div className={stacked ? "flex flex-col items-stretch gap-2" : "flex items-center gap-2"}>
      <SegmentedControl
        size="sm"
        aria-label="Style"
        iconOnly={iconOnly}
        value={style}
        onValueChange={(value) => isSheenStyle(value) && setStyle(value)}
        items={[
          { value: "liquid", label: "Liquid Glass", icon: <DropIcon /> },
          { value: "aurora", label: "Aurora Neon", icon: <SparkleIcon /> },
        ]}
      />
      <SegmentedControl
        size="sm"
        aria-label="Theme"
        iconOnly
        value={theme}
        onValueChange={(value) => setTheme(value as ThemeChoice)}
        items={[
          { value: "light", label: "Light", icon: <SunIcon /> },
          { value: "dark", label: "Dark", icon: <MoonIcon /> },
          { value: "system", label: "System", icon: <MonitorIcon /> },
        ]}
      />
    </div>
  );
}
