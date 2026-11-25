import type { SeoMeta } from "./types";

/** The keyword-map rows of the "Chat" routes (and the pages that sit beside them). */
export const seoChat: Record<string, SeoMeta> = {
  "/chat/list": {
    title: "Chat List UI for React: Messaging Inbox",
    description:
      "A React chat list UI like WhatsApp: search with highlights, tabs with counts, pinned chats, presence, typing, drafts, ticks and unread badges. Glass, MIT.",
    keyword: "chat list ui react",
    h1: "Chat List UI for React",
    intro:
      "A React chat list UI for a messaging app, with search, filters with counts, pinned chats, presence and unread badges.",
    secondary: ["messaging inbox ui", "whatsapp chat list ui"],
  },
  "/chat/thread": {
    title: "React Chat UI: Message Bubbles & Threads",
    description:
      "A React chat UI in WhatsApp and iMessage style: grouped bubbles, day labels, replies, reactions, photos, files, link previews and typing. Glass, MIT.",
    keyword: "react chat ui",
    h1: "React Chat UI",
    intro:
      "A React chat UI for one conversation: bubbles grouped by sender, sticky day labels, replies, reactions, photos and typing.",
    secondary: ["chat bubble ui react", "message thread react", "imessage style chat ui"],
  },
  "/chat/widget": {
    title: "React Chat Widget: Intercom-Style Support Chat",
    description:
      "An Intercom-style support chat widget for React: a launcher with an unread badge springs open a glass panel with greeting, recent chats and full chat. MIT.",
    keyword: "react chat widget",
    h1: "Support Chat Widget for React",
    intro:
      "A React chat widget for support: a launcher in the corner of the page springs open a glass panel with a greeting and recent conversations.",
    secondary: ["intercom style chat widget", "live chat widget react"],
  },
};
