import type { Story } from "./ShowcaseStage";

/** The Context menu stage's scene: whether the menu is open, the highlighted row, the chosen action and whether the photo is nudging the person to try it. */
export type ContextMenuScene = { open: boolean; hot: number | null; picked: string; nudge?: boolean };

/**
 * Base UI keeps a context menu modal (it hides the page and takes focus), and a demo that plays by itself must never do
 * that (WCAG 2.4.3, 3.2.1). So the story stops at a pulsing photo and the menu opens only on a real right-click.
 */
const story: Story<ContextMenuScene> = async ({ state, scene, wait }) => {
  await wait(900);
  scene({ nudge: true });
  state("working");
  await wait(2600);
  scene({ nudge: false });
  state("idle");
};

export default story;
