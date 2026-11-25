import type { Story } from "./ShowcaseStage";

/** The Morphing dialog stage's scene: whether the card has grown into its dialog, and whether the card nudges the person to open it. */
export type MorphingDialogScene = { open: boolean; nudge?: boolean };

/**
 * MorphingDialog is a real full-viewport modal (Base UI's Dialog), so a story that plays by itself must not open it: it
 * would lock the page and cover it with the scrim (WCAG 2.4.3, 3.2.1). The story pulses the card and the dialog opens on a real click.
 */
const story: Story<MorphingDialogScene> = async ({ state, scene, wait }) => {
  await wait(900);
  scene({ nudge: true });
  state("working");
  await wait(2600);
  scene({ nudge: false });
  state("idle");
};

export default story;
