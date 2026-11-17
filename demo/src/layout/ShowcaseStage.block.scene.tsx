import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { useSheenReducedMotion } from "@sheenui/theme";

import { ShowcaseStage } from "./ShowcaseStage";
import { stories, type BlockScene, type BlockStoryName } from "./ShowcaseStage.blocks";
import type { Action } from "./ShowcaseStage.block.drive";

type BlockStageProps = {
  /** Accessible name of the stage group, for example "Glass login demo". */
  label: string;
  /** Which story plays (see ShowcaseStage.blocks.ts). */
  story: BlockStoryName;
  /** The block's own size in px, as it is laid out before it is scaled to the plate. */
  width: number;
  height: number;
  /** The tallest the block may show, in px (default 640): a taller block is cropped at the bottom, never the stage taller. */
  fit?: number;
  /** A block cropped at the bottom fades out into the plate over its last 2.5rem (an overlay, never a mask on the glass). */
  fade?: boolean;
  /** Where the block sits in its frame while it grows or changes (default "center"): "start" hangs it from the top. */
  align?: "center" | "start";
  /** Extra class on the frame, for CSS that reserves room for what the story opens (see ShowcaseStage.blocks.css). */
  frameClassName?: string;
  /** What the story does to the block at step 1, 2, 3 ... (action `n` runs when the step reaches `n + 1`). */
  actions: Action[];
  /** The live block. A function receives the story's step and whether motion is reduced. */
  children: ReactNode | ((step: number, reduced: boolean) => ReactNode);
};

/**
 * The stage at the top of a block page: the page's real block, in a fixed frame on the plate (it keeps its real text
 * size and is cropped at the bottom when taller than the frame, so the stage's height is the same in the prerendered HTML and after the story), played by `actions`
 * that find controls by name and press, fill or type into them. The block is not changed for the stage. Touching it ends
 * the story and the person's own state stays.
 */
export function BlockStage({
  label,
  story,
  width,
  height,
  fit = 640,
  fade,
  align,
  frameClassName,
  actions,
  children,
}: BlockStageProps) {
  return (
    <ShowcaseStage<BlockScene>
      label={label}
      story={() => Promise.resolve({ default: stories[story] })}
      initial={{ step: 0 }}
      onInterrupt="keep"
      className="sheen-stage-block"
    >
      {(scene) => (
        <Frame
          width={width}
          height={height}
          fit={fit}
          fade={fade}
          align={align}
          frameClassName={frameClassName}
          step={scene.step}
          actions={actions}
        >
          {children}
        </Frame>
      )}
    </ShowcaseStage>
  );
}

/** Page.tsx finds a page's stage among its children by this mark (see ShowcaseStage.tsx). */
BlockStage.isShowcaseStage = true;

/**
 * Resolves once the block inside the frame is interactive. A block can be a lazy island whose code is still on its way
 * while the prerendered HTML is on screen; a click made then is queued by React and replayed after hydration, which
 * would act on the story a second time. An eager island (lazy-block.tsx) sets `data-island-live` on its wrapper from an
 * effect once its block is hydrated, so the wrapper without the mark means the island is not live yet (it gives up
 * after 6 s and goes on). A block that is not an island is live as soon as the stage is.
 */
function hydrated(root: HTMLElement): Promise<void> {
  const live = () => {
    const island = root.querySelector("[data-island]");
    return !island || island.hasAttribute("data-island-live");
  };
  return new Promise((resolve) => {
    const started = performance.now();
    const check = () => {
      if (live() || performance.now() - started > 6000) resolve();
      else window.setTimeout(check, 30);
    };
    check();
  });
}

function Frame({
  width,
  height,
  fit,
  align,
  frameClassName,
  fade,
  step,
  actions,
  children,
}: Pick<BlockStageProps, "width" | "height" | "actions" | "children" | "align" | "frameClassName" | "fade"> & {
  fit: number;
  step: number;
}) {
  const reduced = useSheenReducedMotion();
  const root = useRef<HTMLDivElement | null>(null);
  const done = useRef(0);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const alive = useRef(true);
  const latest = useRef({ actions, reduced });
  useEffect(() => {
    latest.current = { actions, reduced };
  });
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  // Any jump (reduced motion goes straight to the last step) still plays every missed action, in order.
  useEffect(() => {
    while (done.current < step) {
      const action = latest.current.actions[done.current];
      done.current += 1;
      if (!action) continue;
      queue.current = queue.current.then(async () => {
        const el = root.current;
        if (!alive.current || !el) return;
        const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));
        await hydrated(el);
        await action({ root: el, reduced: latest.current.reduced, sleep });
      });
    }
  }, [step]);

  return (
    <div
      className={frameClassName ? `sheen-blk ${frameClassName}` : "sheen-blk"}
      data-align={align}
      data-fade={fade ? "" : undefined}
      style={{ "--bw": width, "--bh": height, "--fit": fit } as CSSProperties}
      ref={root}
    >
      <div className="sheen-blk-in">{typeof children === "function" ? children(step, reduced) : children}</div>
    </div>
  );
}
