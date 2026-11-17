import type { Story } from "./ShowcaseStage";

/** The Badge stage's scene: where the invoice is. */
export type BadgeScene = { status: "pending" | "processing" | "paid" };

/** Pending (pulsing dot), processing, then paid: a badge carries a word, never colour alone. */
const story: Story<BadgeScene> = async ({ state, scene, wait }) => {
  await wait(1300);
  scene({ status: "processing" });
  state("working");
  await wait(2200);
  scene({ status: "paid" });
  state("success");
  await wait(600);
};

export default story;
