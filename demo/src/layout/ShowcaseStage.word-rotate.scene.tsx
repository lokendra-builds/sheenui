import { WordRotate } from "@sheenui/theme";

import { useFollow } from "./ShowcaseStage.follow";
import type { StageContext } from "./ShowcaseStage";
import type { WordRotateScene } from "./ShowcaseStage.word-rotate";

const WORDS = ["faster", "calmer", "clearer", "brighter"] as const;

/** The live WordRotate on its stage: the story picks the word (controlled index); it never loops by itself here. */
export function WordRotateScene({ scene }: { scene: WordRotateScene; ctx: StageContext }) {
  const [index, setIndex] = useFollow(scene.index);
  return (
    <div className="sheen-stage-col">
      <p className="m-0 text-2xl leading-tight font-semibold text-sheen-fg">
        Ship interfaces{" "}
        <WordRotate
          words={WORDS}
          index={index}
          onIndexChange={setIndex}
          paused
          highlightClassName="rounded-full bg-sheen-accent-soft"
          wordClassName="px-3 text-sheen-accent"
        />
      </p>
    </div>
  );
}
