import type { Story } from "./ShowcaseStage";

/** The Number field stage's scene: the quantity. */
export type NumberFieldScene = { quantity: number };

/** The price per ticket, in dollars. */
export const TICKET_PRICE = 24;

/** The stepper is pressed three times: the digits roll like an odometer and the total follows. */
const story: Story<NumberFieldScene> = async ({ state, scene, wait }) => {
  await wait(900);
  state("working");
  for (const quantity of [2, 3, 4]) {
    scene({ quantity });
    await wait(650);
  }
  state("warning");
};

export default story;
