import { Navbar } from "@sheenui/theme";

import { useFollow } from "./ShowcaseStage.follow";
import type { StageContext } from "./ShowcaseStage";
import type { HorizontalScene } from "./ShowcaseStage.horizontal";

const ITEMS = [
  { value: "home", label: "Home" },
  { value: "work", label: "Work" },
  { value: "pricing", label: "Pricing" },
];
const COPY: Record<string, string> = {
  home: "Interfaces that feel like glass.",
  work: "Six case studies from 2025.",
  pricing: "Free for open source. $24 a seat.",
};

/** The live Navbar on its stage: the highlight morphs to the active item (by the story or a click) and the page text follows. */
export function HorizontalScene({ scene }: { scene: HorizontalScene; ctx: StageContext }) {
  const [page, setPage] = useFollow<string>(scene.page);
  return (
    <div className="sheen-stage-col">
      <Navbar
        aria-label="Studio navigation"
        items={ITEMS}
        value={page}
        onValueChange={setPage}
        shrinkOnScroll={false}
        className="w-full"
      />
      <p className="sheen-stage-sub sheen-stage-slot">{COPY[page]}</p>
    </div>
  );
}
