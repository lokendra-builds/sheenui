import type { Story } from "./ShowcaseStage";

/** The Popover chat stage's scene: 0 the launcher alone, 1 the panel (home), 2 a conversation, 3 a reply sent, 4 the team has answered. */
export type ChatWidgetScene = { step: 0 | 1 | 2 | 3 | 4 };

/** The launcher shows an unread badge, the panel springs out of it, a conversation opens, a reply is sent and the team answers. */
const story: Story<ChatWidgetScene> = async ({ state, scene, wait }) => {
  await wait(900);
  scene({ step: 1 });
  state("lit");
  await wait(1500);
  scene({ step: 2 });
  await wait(1400);
  scene({ step: 3 });
  state("working");
  await wait(900);
  scene({ step: 4 });
  state("success");
  await wait(1300);
  state("idle");
};

export default story;
