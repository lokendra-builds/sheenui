import { Carousel, CarouselCaption } from "@sheenui/theme";

import { useFollow } from "./ShowcaseStage.follow";
import type { StageContext } from "./ShowcaseStage";
import type { CarouselScene } from "./ShowcaseStage.carousel";

const SLIDES = [
  { title: "Dunes", tint: "from-amber-300 to-rose-500" },
  { title: "Glacier", tint: "from-sky-200 to-indigo-500" },
  { title: "Forest", tint: "from-lime-300 to-emerald-700" },
] as const;

/** The live Carousel on its stage: swipe, drag, use the arrows or the dots. It never autoplays here. */
export function CarouselScene({ scene }: { scene: CarouselScene; ctx: StageContext }) {
  const [index, setIndex] = useFollow(scene.index);
  return (
    <div className="sheen-stage-col sheen-stage-wide">
      <Carousel aria-label="Landscape previews" index={index} onIndexChange={setIndex} arrows="overlay">
        {SLIDES.map((slide) => (
          <div
            key={slide.title}
            className={`relative aspect-video overflow-hidden rounded-sheen-lg bg-gradient-to-br ${slide.tint} `}
          >
            <CarouselCaption>{slide.title}</CarouselCaption>
          </div>
        ))}
      </Carousel>
    </div>
  );
}
