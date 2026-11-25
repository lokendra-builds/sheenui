import type { Story } from "./ShowcaseStage";

/** The Accordion stage's scene: which answer is open. */
export type AccordionScene = { open: "shipping" | "returns" | "warranty" };

/** One answer folds as the next springs open, twice. */
const story: Story<AccordionScene> = async ({ state, scene, wait }) => {
  await wait(1000);
  scene({ open: "returns" });
  await wait(1700);
  scene({ open: "warranty" });
  state("lit");
  await wait(1500);
};

export default story;
