import { useEffect, useRef, useState } from "react";
import { cn } from "@sheenui/theme";
import { KbdShortcut } from "@sheenui/theme";
import { Segmented } from "../../layout/Segmented";

/* =====================================================================
 * Kbd
 * ===================================================================== */

const platformOptions = [
  { value: "auto", label: "This device" },
  { value: "mac", label: "macOS" },
  { value: "other", label: "Windows" },
] as const;

const sampleShortcuts = [
  { keys: "mod+k", what: "Search" },
  { keys: "shift+mod+p", what: "Command palette" },
  { keys: "alt+arrowup", what: "Move line up" },
  { keys: "mod+backspace", what: "Delete" },
  { keys: "?", what: "Show shortcuts" },
] as const;

/** True while an element's content is wider than the element (so it scrolls sideways). */
function useOverflowsX<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [overflows, setOverflows] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setOverflows(el.scrollWidth > el.clientWidth + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => ro.disconnect();
  }, []);
  return [ref, overflows] as const;
}

export function PlatformTable() {
  const [platform, setPlatform] = useState<"auto" | "mac" | "other">("auto");
  // The table fits a 320px screen; if it ever doesn't (large text), its scroller becomes a
  // named, focusable region so keyboard users can scroll it too.
  const [scrollerRef, overflows] = useOverflowsX<HTMLDivElement>();
  const cell = "px-2.5 py-2.5 sm:px-4";
  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <Segmented label="Platform" options={platformOptions} value={platform} onValueChange={setPlatform} size="sm" />
      <div
        ref={scrollerRef}
        role={overflows ? "region" : undefined}
        aria-label={overflows ? "Shortcuts table" : undefined}
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrollable region must be keyboard-focusable so it can be scrolled without a mouse (only while it overflows)
        tabIndex={overflows ? 0 : undefined}
        className="glass-2 overflow-x-auto rounded-sheen-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus"
      >
        <table className="w-full text-start [:where(&)_th]:text-start text-sm">
          <caption className="sr-only">Shortcuts as chips and as inline menu text</caption>
          <thead className="text-xs text-sheen-fg-muted">
            <tr className="border-b border-sheen-border">
              <th scope="col" className={cn(cell, "font-medium")}>
                Action
              </th>
              <th scope="col" className={cn(cell, "font-medium")}>
                Chips<span className="sm:hidden"> · inline</span>
              </th>
              <th scope="col" className={cn(cell, "hidden font-medium sm:table-cell")}>
                Inline
              </th>
            </tr>
          </thead>
          <tbody>
            {sampleShortcuts.map((s) => (
              <tr key={s.keys} className="border-b border-sheen-border last:border-0">
                <th scope="row" className={cn(cell, "font-medium text-pretty")}>
                  {s.what}
                </th>
                <td className={cell}>
                  <KbdShortcut keys={s.keys} platform={platform} className="flex-wrap gap-y-1" />
                  {/* Phones: the inline form sits under the chips instead of in a third column. */}
                  <KbdShortcut
                    keys={s.keys}
                    platform={platform}
                    variant="inline"
                    announce={false}
                    className="mt-1.5 flex sm:hidden"
                  />
                </td>
                <td className={cn(cell, "hidden sm:table-cell")}>
                  <KbdShortcut keys={s.keys} platform={platform} variant="inline" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
