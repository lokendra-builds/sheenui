"use client";

import { useRender } from "@base-ui/react/use-render";

import { cn } from "../../lib/cn";

/** Props of {@link AspectRatio}. The attributes of a `div` (plus Base UI's `render`) and the ones below. */
export type AspectRatioProps = useRender.ComponentProps<"div"> & {
  /** Width divided by height: `16 / 9`, `4 / 3`, `1` (default) for a square. */
  ratio?: number;
};

/**
 * A box that keeps a fixed width-to-height ratio at any width: for an image, a video, a map or a chart placeholder, so
 * the page does not jump while the content loads. It is as wide as its container; its children fill it.
 *
 * - `ratio` is width / height (`16 / 9`, `4 / 3`, default `1`).
 * - Put one element inside and make it fill the box (`className="size-full object-cover"` on an `<img>`).
 * - `render` swaps the `<div>` for another element; `className` and `ref` go on the box.
 *
 * Keyboard: not focusable. Accessibility: a plain container with no role; give the media inside it its own text (`alt`, a caption).
 * Glass and motion: no surface and no movement; it clips its children to the rounded corners you give it with `className`.
 *
 * @example
 * ```tsx
 * import { AspectRatio } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <AspectRatio ratio={16 / 9} className="max-w-md rounded-sheen-lg">
 *       <img src="/cover.jpg" alt="A mountain lake at dawn" className="size-full object-cover" />
 *     </AspectRatio>
 *   );
 * }
 * ```
 *
 * @see /layout/aspect-ratio
 */
export function AspectRatio({ ratio = 1, className, style, render, ref, ...props }: AspectRatioProps) {
  return useRender({
    defaultTagName: "div",
    render,
    ref,
    props: {
      "data-slot": "aspect-ratio",
      ...props,
      style: { aspectRatio: ratio, ...style },
      className: cn("relative w-full overflow-hidden", className),
    },
  });
}
