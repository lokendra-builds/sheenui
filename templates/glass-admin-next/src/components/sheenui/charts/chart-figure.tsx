"use client";

import { createContext, useContext, useId, type ComponentProps, type ReactNode } from "react";

/**
 * The id of the table view that sits beside the chart in a `ChartCard`, or null when there is none. `ChartFigure`
 * points `aria-details` at it: the accessible twin of the drawing, one jump away for a screen reader.
 *
 * @internal Provided by `ChartCard`, read by `ChartFigure`.
 * @example
 * ```tsx
 * import { ChartTwinContext } from "./chart-figure";
 *
 * export function Card({ children }: { children: React.ReactNode }) {
 *   return <ChartTwinContext value="visits-table">{children}</ChartTwinContext>;
 * }
 * ```
 * @see /charts
 */
export const ChartTwinContext = createContext<string | null>(null);

type Shared = {
  /** The accessible name of the chart (its title), without the keyboard instructions. */
  label: string;
  /** Short text read after the name: how to use the keyboard, a one-line summary. Linked with `aria-describedby`. */
  description?: ReactNode;
  /** What the figure announces itself as. Default "chart"; pass the translated word (or "gauge"). */
  roleDescription?: string;
  children?: ReactNode;
};

/** Props of {@link ChartFigure}. An `<svg>` (default) or a `<div>` plus the chart's name and description. */
export type ChartFigureProps = Shared &
  (
    | (Omit<ComponentProps<"svg">, "children"> & { as?: "svg" })
    | (Omit<ComponentProps<"div">, "children"> & { as: "div" })
  );

/**
 * The root of an interactive chart, as an accessible figure: `role="figure"` named by `label` (the chart title), the
 * keyboard instructions as its description (`aria-describedby`), and, inside a `ChartCard` that has a table view,
 * `aria-details` pointing at that table. Pass `tabIndex={0}` and the key handler only when the chart is interactive:
 * a static drawing is not a tab stop.
 *
 * Keyboard: whatever the chart's own handler does (arrow keys, Home, End, Escape). Accessibility: the name stays
 * short, the instructions move to the description, and the table twin is the full text alternative.
 *
 * @internal Used by every chart; not part of the public barrel.
 * @example
 * ```tsx
 * import { ChartFigure } from "./chart-figure";
 *
 * export function Tiny() {
 *   return (
 *     <ChartFigure width={120} height={40} label="Visits" description="Use the arrow keys to read values." tabIndex={0}>
 *       <rect width={60} height={40} />
 *     </ChartFigure>
 *   );
 * }
 * ```
 * @see /charts
 */
export function ChartFigure(props: ChartFigureProps) {
  const { as, label, description, roleDescription = "chart", children, ...rest } = props;
  const descId = useId();
  const twin = useContext(ChartTwinContext);
  const common = {
    role: "figure",
    "aria-roledescription": roleDescription,
    "aria-label": label,
    "aria-describedby": description ? descId : undefined,
    "aria-details": twin ?? undefined,
  } as const;
  if (as === "div") {
    return (
      <div {...(rest as ComponentProps<"div">)} {...common}>
        {description ? (
          <span id={descId} className="sr-only">
            {description}
          </span>
        ) : null}
        {children}
      </div>
    );
  }
  return (
    <svg {...(rest as ComponentProps<"svg">)} {...common}>
      {description ? <desc id={descId}>{description}</desc> : null}
      {children}
    </svg>
  );
}
