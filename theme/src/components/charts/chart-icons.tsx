/**
 * Small icons shared by the chart chrome (zoom/reset toolbars, the live-chart pause button and the
 * export menu). Each is decorative (`aria-hidden`): the button that holds it carries the accessible name.
 */

/**
 * A magnifier with a plus (or a minus with `minus`), for zoom buttons.
 *
 * Props: `minus` swaps the plus for a minus. Decorative: the button around it needs an accessible name.
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { ZoomIcon } from "./chart-icons";
 *
 * export function Example() {
 *   return (
 *     <button aria-label="Zoom in"><ZoomIcon /></button>
 *   );
 * }
 * ```
 *
 * @see /charts
 */
export const ZoomIcon = ({ minus }: { minus?: boolean }) => (
  <svg
    aria-hidden
    width={16}
    height={16}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
  >
    <circle cx={7} cy={7} r={4.75} />
    <path d={minus ? "M5 7h4M10.6 10.6L14 14" : "M5 7h4M7 5v4M10.6 10.6L14 14"} />
  </svg>
);

/**
 * Four corner arrows, for "reset view" buttons.
 *
 * Decorative: the button around it needs an accessible name.
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { ResetIcon } from "./chart-icons";
 *
 * export function Example() {
 *   return (
 *     <button aria-label="Reset view"><ResetIcon /></button>
 *   );
 * }
 * ```
 *
 * @see /charts
 */
export const ResetIcon = () => (
  <svg
    aria-hidden
    width={16}
    height={16}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2.5 6V2.5H6M2.5 2.5L6 6M13.5 10v3.5H10M13.5 13.5L10 10M10 2.5h3.5V6M13.5 2.5L10 6M6 13.5H2.5V10M2.5 13.5L6 10" />
  </svg>
);

/**
 * Two bars, for pause buttons.
 *
 * Decorative: the button around it needs an accessible name.
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { PauseIcon } from "./chart-icons";
 *
 * export function Example() {
 *   return (
 *     <button aria-label="Pause"><PauseIcon /></button>
 *   );
 * }
 * ```
 *
 * @see /charts
 */
export const PauseIcon = () => (
  <svg aria-hidden width={14} height={14} viewBox="0 0 16 16" fill="currentColor">
    <rect x={3.5} y={2.5} width={3} height={11} rx={1} />
    <rect x={9.5} y={2.5} width={3} height={11} rx={1} />
  </svg>
);

/**
 * A right-pointing triangle, for play/resume buttons.
 *
 * Decorative: the button around it needs an accessible name.
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { PlayIcon } from "./chart-icons";
 *
 * export function Example() {
 *   return (
 *     <button aria-label="Resume"><PlayIcon /></button>
 *   );
 * }
 * ```
 *
 * @see /charts
 */
export const PlayIcon = () => (
  <svg aria-hidden width={14} height={14} viewBox="0 0 16 16" fill="currentColor">
    <path d="M4.5 2.8v10.4a.8.8 0 0 0 1.2.7l8.3-5.2a.8.8 0 0 0 0-1.4L5.7 2.1a.8.8 0 0 0-1.2.7z" />
  </svg>
);

/**
 * A tray with a down arrow, for the export menu trigger.
 *
 * Decorative: the button around it needs an accessible name.
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { DownloadIcon } from "./chart-icons";
 *
 * export function Example() {
 *   return (
 *     <button aria-label="Export"><DownloadIcon /></button>
 *   );
 * }
 * ```
 *
 * @see /charts
 */
export function DownloadIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19h14" />
    </svg>
  );
}
