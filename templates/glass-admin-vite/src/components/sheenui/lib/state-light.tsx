import type { ComponentProps } from "react";

import { cn } from "./cn";

/**
 * The states a surface can be lit by. Written as `data-state` on the surface; `StateLightLayer` (one child) draws
 * the aura, the light pool and the lit edge from the glow tokens (glass.css, "State light").
 * `"on"` is a calm accent light that is not a status (a checked switch, an open dialog).
 *
 * @internal
 */
export type SheenLightState = "idle" | "working" | "success" | "warning" | "error" | "on";

/**
 * The one light layer a surface holds: a decorative, pointer-transparent child that draws the state light
 * (aura, light pool, lit edge) for the `data-state` of its parent. Colours, motion and the reduced-motion,
 * reduced-transparency and forced-colours behaviour are all in glass.css. Put it inside the surface (never around
 * glass) and give the surface a stacking context (`isolate`, or a glass class). Weigh the three lights per surface with
 * `--sl-aura`, `--sl-pool`, `--sl-edge` and the whole layer with `--sl-strength` (0 to 1) via `className`.
 *
 * @internal Not part of the public barrel: the example documents the module's own helper.
 * @example
 * ```tsx
 * import { StateLightLayer } from "./state-light";
 *
 * export const Saved = () => (
 *   <div className="glass-2 relative rounded-sheen-lg" data-state="success">
 *     <StateLightLayer className="[--sl-pool:0.5]" />
 *     Saved
 *   </div>
 * );
 * ```
 *
 * @see /foundations
 */
export function StateLightLayer({ className, ...props }: ComponentProps<"span">) {
  return <span aria-hidden data-slot="state-light" className={cn(className)} {...props} />;
}
