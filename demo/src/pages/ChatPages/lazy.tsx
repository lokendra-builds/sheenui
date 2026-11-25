import { lazyBlock } from "../../layout/lazy-block";

// The chat components are islands (see layout/lazy-block.tsx): this page's chunk holds the docs and the
// demo stories; the components (message list, composer, popover...) are a chunk of their own. Each is the subject
// of its page, so it is fetched while the page hydrates (eager), not one idle period later.
export const ConversationList = lazyBlock(
  () => import("../../../../theme/src/components/chat/conversation-list").then((m) => m.ConversationList),
  { minHeight: "100%", eager: true },
);

export const ChatThread = lazyBlock(
  () => import("../../../../theme/src/components/chat/chat-thread").then((m) => m.ChatThread),
  {
    minHeight: "100%",
    eager: true,
  },
);

export const ChatWidget = lazyBlock(
  () => import("../../../../theme/src/components/chat/chat-widget").then((m) => m.ChatWidget),
  {
    minHeight: "0",
    eager: true,
  },
);

export const ChatApp = lazyBlock(() => import("../../../../theme/src/blocks/chat-app").then((m) => m.ChatApp), {
  minHeight: "100%",
  eager: true,
});
