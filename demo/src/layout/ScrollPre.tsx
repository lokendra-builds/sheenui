import { useEffect, useRef, useState, type ComponentPropsWithoutRef } from "react";

type ScrollPreProps = ComponentPropsWithoutRef<"pre"> & {
  /** Accessible name announced when the block scrolls (default "Code sample"). */
  label?: string;
};

/**
 * A `<pre>` that stays keyboard-reachable (WCAG 2.1.1, axe `scrollable-region-focusable`): it joins the tab order,
 * as a named group with a visible focus ring, only while its content overflows (ResizeObserver), like
 * `KeyboardTable`. When it fits it is a plain `<pre>`, so there are no dead tab stops.
 */
export function ScrollPre({ label = "Code sample", className, children, ...rest }: ScrollPreProps) {
  const ref = useRef<HTMLPreElement>(null);
  const [scrolls, setScrolls] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setScrolls(el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);
    return () => observer.disconnect();
  }, [children]);
  return (
    <pre
      ref={ref}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrolling box must be keyboard focusable so it can be scrolled without a mouse (set only while it overflows)
      tabIndex={scrolls ? 0 : undefined}
      role={scrolls ? "group" : undefined}
      aria-label={scrolls ? label : undefined}
      className={`${className ?? ""} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus`}
      {...rest}
    >
      {children}
    </pre>
  );
}
