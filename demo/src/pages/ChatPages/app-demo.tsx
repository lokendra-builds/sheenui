import { useToast } from "@sheenui/theme";
import { useDemoNow } from "../../demo-clock";
import { useChatSim } from "./sim";
import { DANIEL_ARRIVES, ME, PEOPLE, RIYA_OLDER, initialMessages, makeConversations } from "./data";
import { ChatApp } from "./lazy";

/** A quiet app screen behind the widget preview (glass look without blur: the widget's own glass is what should blur). */
export function DashboardMock() {
  return (
    <div aria-hidden className="flex h-full flex-col gap-4 p-4 sm:p-6">
      <div className="h-6 w-40 rounded-sheen-full bg-sheen-hover" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="glass-1 flex h-24 flex-col justify-end gap-2 rounded-sheen-lg p-3 [-webkit-backdrop-filter:none] [backdrop-filter:none] last:hidden sm:last:flex"
          >
            <div className="h-3 w-16 rounded-full bg-sheen-hover" />
            <div className="h-5 w-24 rounded-full bg-sheen-accent-soft" />
          </div>
        ))}
      </div>
      <div className="glass-1 flex-1 rounded-sheen-lg [-webkit-backdrop-filter:none] [backdrop-filter:none]" />
    </div>
  );
}

/* =====================================================================
 * Chat app (block)
 * ===================================================================== */

export function AppDemo({
  selected,
  onSelectedChange,
}: {
  selected: string | null;
  onSelectedChange: (id: string | null) => void;
}) {
  const toast = useToast();
  const now = useDemoNow();
  const sim = useChatSim({
    conversations: makeConversations(),
    messages: initialMessages(),
    older: { "c-riya": RIYA_OLDER },
    arrivals: DANIEL_ARRIVES,
  });
  return (
    <ChatApp
      conversations={sim.conversations}
      participants={PEOPLE}
      currentUserId={ME}
      messages={sim.messages}
      selectedId={selected}
      onSelectedIdChange={(id) => {
        if (id) sim.ensureThread(id);
        onSelectedChange(id);
      }}
      hasOlder={sim.hasOlder}
      loadingOlderId={sim.loadingOlder}
      onLoadOlder={sim.loadOlder}
      onSend={sim.send}
      onEdit={sim.edit}
      onDelete={sim.remove}
      onReact={sim.react}
      onRetry={sim.retry}
      onRead={sim.read}
      onDraftChange={sim.setDraft}
      onConversationAction={sim.action}
      onCall={(c) => toast.info(`Calling ${c.title ?? "…"}`)}
      onVideoCall={() => toast.info("Starting a video call…")}
      onBlock={(p) => toast.success(`${p.name} is blocked`)}
      onLeaveGroup={(c) => toast.info(`You left ${c.title}`)}
      now={now}
      locale="en-US"
      className="h-[44rem] max-h-[calc(100dvh-8rem)] rounded-none border-0 sm:rounded-none"
    />
  );
}
