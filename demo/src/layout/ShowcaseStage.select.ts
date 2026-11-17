import type { Story } from "./ShowcaseStage";

/** The Select stage's scene: whether the list is open, the chosen value and whether the field is nudging the person to try it. */
export type SelectScene = { open: boolean; value: string | null; nudge?: boolean };

/**
 * Base UI's select is modal (it makes the page inert and takes focus), and a demo that plays by itself must never do
 * that (WCAG 2.4.3, 3.2.1). So the story stops at a pulsing field and the list opens only on a real click.
 */
const story: Story<SelectScene> = async ({ state, scene, wait }) => {
  await wait(1000);
  scene({ nudge: true });
  state("working");
  await wait(2600);
  scene({ nudge: false });
  state("idle");
};

export default story;
