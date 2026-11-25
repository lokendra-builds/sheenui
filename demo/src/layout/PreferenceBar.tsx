import { Suspense, lazy, useState } from "react";
import {
  useGlassMode,
  useMotionPreference,
  useReducedTransparency,
  useSheenStyle,
  cn,
  type SheenStyle,
  type ThemeChoice,
} from "@sheenui/theme";

import { Segmented } from "./Segmented";

const loadMore = () => import("./PreferenceMore");
const PreferenceMore = lazy(loadMore);
import { useThemeWave } from "./themeWave";

const themes = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
] as const satisfies readonly { value: ThemeChoice; label: string }[];

const styles = [
  { value: "liquid", label: "Liquid" },
  { value: "aurora", label: "Aurora" },
] as const satisfies readonly { value: SheenStyle; label: string }[];

/**
 * Style, theme + accessibility toggles. Everything here is SheenUI dogfooding its own hooks.
 * `compact` (the sticky header below 87.5rem) keeps Style and Theme inline and moves the three toggles into a "More"
 * popover, so the bar stays on one row beside the sidebar; from 87.5rem up they sit inline again.
 */
export function PreferenceBar({ className, compact = false }: { className?: string; compact?: boolean }) {
  const { style, setStyle } = useSheenStyle();
  const { theme, sweepTo } = useThemeWave();
  const [reducedMotion, setReducedMotion] = useMotionPreference();
  const [reducedTransparency, setReducedTransparency] = useReducedTransparency();
  const [lite, setLite] = useGlassMode();

  return (
    <div className={cn("flex items-center gap-2", compact ? "flex-nowrap" : "flex-wrap", className)}>
      <Segmented label="Style" size="sm" options={styles} value={style} onValueChange={setStyle} />
      <Segmented label="Color theme" size="sm" options={themes} value={theme} onValueChange={(next) => sweepTo(next)} />
      {compact && (
        <MoreMenu
          reducedMotion={reducedMotion}
          setReducedMotion={setReducedMotion}
          reducedTransparency={reducedTransparency}
          setReducedTransparency={setReducedTransparency}
          lite={lite}
          setLite={setLite}
        />
      )}
      <div className={cn(compact ? "hidden min-[87.5rem]:contents" : "contents")}>
        <Toggle label="Reduce motion" pressed={reducedMotion} onChange={setReducedMotion} />
        <Toggle label="Reduce transparency" pressed={reducedTransparency} onChange={setReducedTransparency} />
        <Toggle label="Lite glass" pressed={lite} onChange={setLite} />
      </div>
    </div>
  );
}

function Toggle({ label, pressed, onChange }: { label: string; pressed: boolean; onChange: (on: boolean) => void }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={() => onChange(!pressed)}
      className={cn(
        "glass-1 inline-flex h-9 items-center gap-2 rounded-sheen-full px-3 text-xs font-medium transition-colors any-pointer-coarse:h-11",
        pressed ? "text-sheen-fg" : "text-sheen-fg-muted hover:text-sheen-fg",
      )}
    >
      <span
        aria-hidden
        className={cn(
          // Same look as the theme Switch: a >= 3:1 control-border edge while off, the accent fill while on.
          "relative h-4 w-7 shrink-0 rounded-full border transition-colors duration-(--sheen-duration-base)",
          pressed
            ? "sheen-fill border-transparent [background-image:var(--sheen-accent-fill)]"
            : "border-sheen-control-border forced-colors:border-[CanvasText]",
        )}
      >
        <span
          className={cn(
            "absolute top-px start-px size-3 rounded-full bg-sheen-thumb shadow-(--sheen-thumb-shadow) forced-colors:bg-[CanvasText]",
            "motion-ok:transition-transform motion-ok:duration-(--sheen-duration-base) motion-ok:ease-sheen-out",
            pressed && "translate-x-3 rtl:-translate-x-3",
          )}
        />
      </span>
      {label}
    </button>
  );
}

const MORE_CLASS =
  "glass-1 inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-sheen-full px-3 text-xs font-medium text-sheen-fg-muted transition-colors hover:text-sheen-fg min-[87.5rem]:hidden any-pointer-coarse:h-11";

export const MoreChevron = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    className="size-3.5"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

type MoreProps = {
  reducedMotion: boolean;
  setReducedMotion: (on: boolean) => void;
  reducedTransparency: boolean;
  setReducedTransparency: (on: boolean) => void;
  lite: boolean;
  setLite: (on: boolean) => void;
};

/**
 * The "More" button. The popover behind it (Base UI popover + Floating UI, ~30 KB gzip) is its own chunk: a plain button is
 * what the page ships, and the first press (or hover / focus, which preload it) swaps in the real popover, already open.
 */
function MoreMenu(props: MoreProps) {
  const [armed, setArmed] = useState(false);
  const button = (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-expanded={false}
      className={MORE_CLASS}
      onPointerEnter={() => void loadMore()}
      onFocus={() => void loadMore()}
      onClick={() => setArmed(true)}
    >
      More
      <MoreChevron />
    </button>
  );
  if (!armed) return button;
  return (
    <Suspense fallback={button}>
      <PreferenceMore {...props} className={MORE_CLASS} Toggle={Toggle} />
    </Suspense>
  );
}
