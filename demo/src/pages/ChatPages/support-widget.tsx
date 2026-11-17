import { useMemo, useRef, useState } from "react";
import type { ChatConversation, ChatMessage } from "@sheenui/theme";
import { demoNowMs, useDemoNow } from "../../demo-clock";
import { ME, PEOPLE, at } from "./data";
import { ChatWidget } from "./lazy";
import { useChatSim } from "./sim";

/* =====================================================================
 * Popover chat (support widget)
 * ===================================================================== */

const SUPPORT_REPLIES = [
  "Thanks for reaching out! Let me look into that for you 🔍",
  "Got it. Could you share your account email so I can check?",
  "All sorted ✅ Anything else I can help with?",
  "Happy to help! 😊",
];

function supportSeed(): { conversations: ChatConversation[]; messages: Record<string, ChatMessage[]> } {
  const billing: ChatMessage[] = [
    {
      id: "s1",
      senderId: ME,
      createdAt: at(3, 15, 2),
      text: "Hi! I was charged twice for the Pro plan this month",
      status: "read",
    },
    {
      id: "s2",
      senderId: "sana",
      createdAt: at(3, 15, 4),
      text: "Hi Kabir 👋 Sorry about that! Let me check your invoices.",
    },
    {
      id: "s3",
      senderId: "sana",
      createdAt: at(3, 15, 9),
      text: "Found it: the second charge is refunded. It shows up in 3-5 working days 💳",
    },
    {
      id: "s4",
      senderId: ME,
      createdAt: at(3, 15, 10),
      text: "That was quick, thank you!",
      status: "read",
      reactions: [{ emoji: "❤️", userIds: ["sana"] }],
    },
    { id: "s5", senderId: "sana", createdAt: at(3, 15, 11), text: "Glad I could help! 😊" },
  ];
  const bug: ChatMessage[] = [
    {
      id: "b1",
      senderId: ME,
      createdAt: at(0, 9, 30),
      text: "The date picker doesn't open on Safari 17",
      status: "read",
    },
    {
      id: "b2",
      senderId: "leo",
      createdAt: at(0, 9, 48),
      text: "Thanks for the report! Can you try the latest version? We shipped a fix this morning 🛠️",
    },
  ];
  return {
    conversations: [
      {
        id: "sup-bug",
        title: "Date picker on Safari",
        participantIds: [ME, "leo"],
        unreadCount: 1,
        lastMessage: bug[bug.length - 1],
      },
      {
        id: "sup-billing",
        title: "Charged twice",
        participantIds: [ME, "sana"],
        lastMessage: billing[billing.length - 1],
      },
    ],
    messages: { "sup-bug": bug, "sup-billing": billing },
  };
}

const HELP_LINKS = [
  { label: "Install SheenUI in a Vite app", description: "Getting started", href: "#install" },
  { label: "Theming, tokens and dark mode", description: "Guides", href: "#theming" },
  { label: "Billing and invoices", description: "Account", href: "#billing" },
];

export function SupportWidget({
  position = "right",
  labels,
  defaultOpen = false,
  helpLinks = HELP_LINKS,
}: {
  position?: "right" | "left";
  labels?: Parameters<typeof ChatWidget>[0]["labels"];
  defaultOpen?: boolean;
  helpLinks?: Parameters<typeof ChatWidget>[0]["helpLinks"];
}) {
  const now = useDemoNow();
  const seed = useMemo(() => supportSeed(), []);
  const sim = useChatSim({
    conversations: seed.conversations,
    messages: seed.messages,
    replies: SUPPORT_REPLIES,
    failOn: 0,
  });
  const [conversationId, setConversationId] = useState<string | null>(null);
  const count = useRef(0);
  return (
    <ChatWidget
      conversations={sim.conversations}
      messages={sim.messages}
      participants={PEOPLE}
      currentUserId={ME}
      teamIds={["sana", "leo", "maya"]}
      defaultOpen={defaultOpen}
      conversationId={conversationId}
      onConversationChange={setConversationId}
      onNewConversation={() => {
        count.current += 1;
        const id = `sup-new-${count.current}`;
        const hello: ChatMessage = {
          id: `${id}-hello`,
          senderId: "sana",
          createdAt: demoNowMs(),
          text: "Hi Kabir 👋 What can we help you with today?",
        };
        sim.start({ id, title: "New conversation", participantIds: [ME, "sana"], lastMessage: hello }, [hello]);
        return id;
      }}
      onSend={(id, d) => sim.send(id, d)}
      onReact={(id, m, e, add) => sim.react(id, m, e, add)}
      onRetry={(id, m) => sim.retry(id, m)}
      onRead={(id) => sim.read(id)}
      quickReplies={["I have a billing question 💳", "Report a bug 🐞", "Talk to sales"]}
      helpLinks={helpLinks}
      position={position}
      strategy="absolute"
      now={now}
      locale="en-US"
      labels={labels}
    />
  );
}
