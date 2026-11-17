import type { Story } from "./ShowcaseStage";

/** The Tabs stage's scene: the active tab and the Activity badge count. */
export type TabsScene = { tab: "overview" | "activity" | "billing"; count: number };

/** The pill glides to Billing and then Activity with a trail of light; the Activity badge counts up. */
const story: Story<TabsScene> = async ({ state, scene, wait }) => {
  await wait(900);
  state("working");
  scene({ tab: "billing" });
  await wait(1500);
  scene({ tab: "activity" });
  await wait(700);
  scene({ count: 3 });
  state("idle");
  await wait(1200);
  state("idle");
};

export default story;
