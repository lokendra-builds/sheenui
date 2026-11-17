import type { Story } from "./ShowcaseStage";

/**
 * The Alert dialog stage's scene: whether it is open, how far the deletion went (0 asking, 1 deleting, 2 deleted) and
 * whether the trigger is nudging the person to try it.
 */
export type AlertDialogScene = { open: boolean; step: 0 | 1 | 2; nudge?: boolean };

/**
 * An alert dialog is modal by definition (Base UI forces it), and a demo that plays by itself must never lock the page
 * or move focus (WCAG 2.4.3, 3.2.1). So the story stops at a pulsing trigger and the dialog opens only on a real click.
 */
const story: Story<AlertDialogScene> = async ({ state, scene, wait }) => {
  await wait(900);
  scene({ nudge: true });
  state("working");
  await wait(2600);
  scene({ nudge: false });
  state("idle");
};

export default story;
