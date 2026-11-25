import { useToast } from "@sheenui/theme";
import { useDemoNow } from "../../demo-clock";
import { useChatSim } from "./sim";
import { ME, PEOPLE, RIYA_OLDER, initialMessages, makeConversations } from "./data";
import { ChatThread } from "./lazy";

/* =====================================================================
 * Chat view
 * ===================================================================== */

export function DirectThreadDemo() {
  const toast = useToast();
  const now = useDemoNow();
  const sim = useChatSim({
    conversations: makeConversations(),
    messages: initialMessages(),
    older: { "c-riya": RIYA_OLDER },
  });
  const riya = sim.conversations.find((c) => c.id === "c-riya");
  if (!riya) return null;
  return (
    <ChatThread
      headingLevel="none"
      conversation={riya}
      messages={sim.messages["c-riya"] ?? []}
      participants={PEOPLE}
      currentUserId={ME}
      firstUnreadId="r15"
      hasOlder={sim.hasOlder("c-riya")}
      loadingOlder={sim.loadingOlder === "c-riya"}
      onLoadOlder={() => sim.loadOlder("c-riya")}
      onSend={(d) => sim.send("c-riya", d)}
      onEdit={(id, text) => sim.edit("c-riya", id, text)}
      onDelete={(m) => sim.remove("c-riya", m)}
      onReact={(m, e, add) => sim.react("c-riya", m, e, add)}
      onRetry={(m) => sim.retry("c-riya", m)}
      onRead={() => sim.read("c-riya")}
      onCall={() => toast.info("Calling Riya…")}
      onVideoCall={() => toast.info("Starting a video call…")}
      onInfo={() => toast.info("Contact info", "ChatApp opens this in a side drawer.")}
      now={now}
      locale="en-US"
      className="h-[40rem] max-h-[calc(100dvh-6rem)] w-full max-w-3xl"
    />
  );
}

export function GroupThreadDemo() {
  const toast = useToast();
  const now = useDemoNow();
  const sim = useChatSim({ conversations: makeConversations(), messages: initialMessages() });
  const design = sim.conversations.find((c) => c.id === "c-design");
  if (!design) return null;
  return (
    <ChatThread
      headingLevel="none"
      conversation={design}
      messages={sim.messages["c-design"] ?? []}
      participants={PEOPLE}
      currentUserId={ME}
      onSend={(d) => sim.send("c-design", d)}
      onEdit={(id, text) => sim.edit("c-design", id, text)}
      onDelete={(m) => sim.remove("c-design", m)}
      onReact={(m, e, add) => sim.react("c-design", m, e, add)}
      onRetry={(m) => sim.retry("c-design", m)}
      onInfo={() => toast.info("Group info")}
      now={now}
      locale="en-US"
      className="h-[36rem] max-h-[calc(100dvh-6rem)] w-full max-w-3xl"
    />
  );
}
