import type { ComponentProps } from "react";

import { cn } from "../../lib/cn";

/** Props of {@link CarouselCaption}. The attributes of a `div` plus the ones below. */
export type CarouselCaptionProps = ComponentProps<"div"> & {
  /**
   * Where the bar sits on the slide: "bottom" or "top".
   * @default "bottom"
   */
  position?: "bottom" | "top";
};

/**
 * A caption bar for a slide that is an image. It sits over the slide's edge on a fixed dark scrim with light text, so
 * the words keep at least 4.5:1 whatever the picture is (bright, busy, any theme). Put it inside a slide that is
 * `relative`; the slide is the positioning parent. The text is inset 4rem from both edges, so the overlay arrows
 * (`arrows="overlay"`) never sit on it.
 *
 * - `children` is the caption text.
 * - `position` is `"bottom"` or `"top"`.
 * - `className` goes on the bar.
 *
 * Keyboard: Not interactive; it takes no focus.
 * Accessibility: Plain text inside the slide's group, so it is read with the slide. The scrim and text colours are the
 * `--sheen-image-scrim` and `--sheen-on-image` tokens, which are the same in light and dark because a photo does not change with the theme; contrast is at least 9:1 over pure white. In forced
 * colors it becomes a Canvas bar with CanvasText.
 * Motion: None; it moves with the slide.
 *
 * @example
 * ```tsx
 * import { Carousel, CarouselCaption } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <Carousel aria-label="Landscapes">
 *       <div className="relative aspect-video bg-gradient-to-br from-lime-300 to-emerald-700">
 *         <CarouselCaption>Forest</CarouselCaption>
 *       </div>
 *     </Carousel>
 *   );
 * }
 * ```
 *
 * @see /components/carousel
 */
export function CarouselCaption({ position = "bottom", className, ...rest }: CarouselCaptionProps) {
  return (
    <div
      data-slot="carousel-caption"
      {...rest}
      className={cn(
        "absolute inset-x-0 py-3 ps-16 pe-16 text-base font-semibold text-(--sheen-on-image) forced-colors:bg-[Canvas] forced-colors:text-[CanvasText]",
        position === "top"
          ? "top-0 bg-linear-to-b from-(--sheen-image-scrim) from-75% to-transparent pb-6"
          : "bottom-0 bg-linear-to-t from-(--sheen-image-scrim) from-75% to-transparent pt-6",
        className,
      )}
    />
  );
}
