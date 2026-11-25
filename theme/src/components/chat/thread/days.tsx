import type { Day } from "./layout";
import { dayLabelClass } from "./layout";
import { MessageRow, type MessageRowActions } from "../message-row";
import type { ChatLabels } from "../labels";
import type { ChatParticipant } from "../types";

/** What {@link ThreadDays} needs from the thread. */
export type ThreadDaysProps = {
  days: readonly Day[];
  people: ReadonlyMap<string, ChatParticipant>;
  currentUserId: string;
  group: boolean;
  activeId: string | null;
  flashId: string | null;
  appearing: (id: string) => boolean;
  nameOf: (id: string) => string;
  domIdOf: (id: string) => string;
  density: "comfortable" | "compact";
  locale: string | undefined;
  L: ChatLabels;
  actions: MessageRowActions;
};

/**
 * The message rows of a `ChatThread`, grouped by day: the in-place day label, the "New messages" divider and one
 * `MessageRow` per message.
 *
 * @internal
 */
export function ThreadDays({
  days,
  people,
  currentUserId,
  group,
  activeId,
  flashId,
  appearing,
  nameOf,
  domIdOf,
  density,
  locale,
  L,
  actions,
}: ThreadDaysProps) {
  return (
    <>
      {days.map((day) => (
        <div key={day.key} data-day={day.label} className="flex flex-col">
          {/* The day, in place (the floating copy above the log shows while scrolling). */}
          <div className="pointer-events-none flex justify-center py-1.5">
            <span className={dayLabelClass}>{day.label}</span>
          </div>
          {day.rows.map((row) => {
            const m = row.message;
            const own = m.senderId === currentUserId;
            const sender = people.get(m.senderId);
            return (
              <div key={m.id} className="contents">
                {row.unreadBefore && (
                  <div
                    data-unread-divider=""
                    className="my-2 flex items-center gap-3 px-4"
                    role="separator"
                    aria-label={L.newMessages}
                  >
                    <span className="h-px flex-1 bg-sheen-accent-border" />
                    <span className="rounded-full bg-sheen-accent-soft px-2.5 py-0.5 text-2xs font-semibold tracking-wide text-sheen-accent uppercase">
                      {L.newMessages}
                    </span>
                    <span className="h-px flex-1 bg-sheen-accent-border" />
                  </div>
                )}
                <MessageRow
                  message={m}
                  own={own}
                  sender={sender}
                  senderName={sender?.name ?? m.senderId}
                  first={row.first}
                  last={row.last}
                  avatarColumn={group && !own && m.kind !== "system"}
                  showName={row.showName}
                  active={m.id === activeId}
                  appear={appearing(m.id)}
                  flash={flashId === m.id}
                  quoteName={m.replyTo ? nameOf(m.replyTo.senderId) : undefined}
                  domId={domIdOf(m.id)}
                  currentUserId={currentUserId}
                  density={density}
                  locale={locale}
                  labels={L}
                  actions={actions}
                />
              </div>
            );
          })}
        </div>
      ))}
    </>
  );
}
