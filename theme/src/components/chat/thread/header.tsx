"use client";

import type { ReactNode, Ref } from "react";
import { cn } from "../../../lib/cn";
import { HEADING_TAGS, headingBelow, type HeadingLevelOption } from "../../../lib/heading";
import { Tooltip } from "../../tooltip/tooltip";
import { ChatAvatar, chatIconButton } from "../chat-parts";
import { firstName, formatRelative, toDate } from "../format";
import { ChevronLeftIcon, InfoIcon, PhoneIcon, VideoIcon } from "../icons";
import type { ChatLabels } from "../labels";
import type { ChatConversation, ChatParticipant } from "../types";

/** What {@link ThreadHeader} needs from the thread. */
export type ThreadHeaderProps = {
  showHeader: boolean;
  conversation: ChatConversation;
  others: readonly ChatParticipant[];
  typingPeople: readonly ChatParticipant[];
  group: boolean;
  title: string;
  titleId: string;
  headingLevel: HeadingLevelOption;
  headingRef: Ref<HTMLHeadingElement> | undefined;
  density: "comfortable" | "compact";
  L: ChatLabels;
  now: Date;
  locale: string | undefined;
  onBack: (() => void) | undefined;
  onCall: (() => void) | undefined;
  onVideoCall: (() => void) | undefined;
  onInfo: (() => void) | undefined;
  headerActions: ReactNode;
};

/**
 * The header of a `ChatThread`: back button, avatar, name, a status line (typing, members, presence or last seen) and
 * the call / info buttons. Without a visible header the name is still rendered, as a screen-reader-only heading.
 *
 * @internal
 */
export function ThreadHeader({
  showHeader,
  conversation,
  others,
  typingPeople,
  group,
  title,
  titleId,
  headingLevel,
  headingRef,
  density,
  L,
  now,
  locale,
  onBack,
  onCall,
  onVideoCall,
  onInfo,
  headerActions,
}: ThreadHeaderProps) {
  const Heading = HEADING_TAGS[headingBelow(headingLevel, 0)];
  const direct = !group ? others[0] : undefined;
  let subtitle: ReactNode;
  let subtitleTone: "accent" | "success" | "muted" = "muted";
  if (typingPeople.length) {
    subtitle = L.typing(
      typingPeople.map((p) => firstName(p.name)),
      group,
    );
    subtitleTone = "accent";
  } else if (group) {
    const members = conversation.participantIds.length;
    const online = others.filter((p) => p.presence === "online").length;
    subtitle = L.members(members, online);
  } else if (direct?.presence === "online") {
    subtitle = L.online;
    subtitleTone = "success";
  } else if (direct?.presence === "away") {
    subtitle = L.away;
  } else if (direct?.lastSeenAt) {
    const seen = toDate(direct.lastSeenAt);
    subtitle = seen ? L.lastSeen(formatRelative(seen, now, locale)) : undefined;
  }

  return (
    <>
      {showHeader ? (
        <header
          role="none"
          className={cn(
            "relative z-[4] flex min-w-0 shrink-0 items-center gap-2 border-b border-sheen-border",
            density === "compact" ? "px-2 py-2" : "px-2.5 py-2.5 @lg:px-4",
            // Phones at 320–360px: a little less padding leaves room for the name beside three buttons.
            "@max-[22.5rem]:gap-1 @max-[22.5rem]:px-1.5",
          )}
        >
          {onBack && (
            <Tooltip content={L.back} delay={300}>
              <button type="button" onClick={onBack} aria-label={L.back} className={chatIconButton}>
                <ChevronLeftIcon className="size-5" />
              </button>
            </Tooltip>
          )}
          <div
            // A pointer shortcut for "contact info"; the keyboard route is the info button in the header actions.
            role="presentation"
            className={cn("flex min-w-0 flex-1 items-center gap-2.5 @max-[22.5rem]:gap-2", onInfo && "cursor-pointer")}
            onClick={onInfo}
          >
            <ChatAvatar
              people={others.slice(0, 2)}
              src={conversation.avatarUrl}
              name={title}
              size="md"
              presence={direct?.presence}
            />
            <div className="flex min-w-0 flex-col">
              <Heading
                id={titleId}
                ref={headingRef}
                tabIndex={-1}
                className="truncate text-[0.9375rem] leading-5 font-semibold outline-none focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus"
              >
                {title}
              </Heading>
              {subtitle && (
                <p
                  className={cn(
                    "flex min-w-0 items-center gap-1 truncate text-xs leading-4",
                    subtitleTone === "accent"
                      ? "font-medium text-sheen-accent"
                      : subtitleTone === "success"
                        ? "text-sheen-success-text"
                        : "text-sheen-fg-muted",
                  )}
                >
                  <span className="truncate">{subtitle}</span>
                </p>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-0.5 @max-[22.5rem]:gap-0 any-pointer-coarse:gap-2!">
            {onCall && (
              <Tooltip content={L.call} delay={300}>
                <button type="button" onClick={onCall} aria-label={L.call} className={chatIconButton}>
                  <PhoneIcon />
                </button>
              </Tooltip>
            )}
            {onVideoCall && (
              <Tooltip content={L.videoCall} delay={300}>
                <button type="button" onClick={onVideoCall} aria-label={L.videoCall} className={chatIconButton}>
                  <VideoIcon />
                </button>
              </Tooltip>
            )}
            {onInfo && (
              <Tooltip content={group ? L.groupInfo : L.contactInfo} delay={300}>
                <button
                  type="button"
                  data-chat-info=""
                  onClick={onInfo}
                  aria-label={group ? L.groupInfo : L.contactInfo}
                  className={chatIconButton}
                >
                  <InfoIcon />
                </button>
              </Tooltip>
            )}
            {headerActions}
          </div>
        </header>
      ) : (
        <Heading id={titleId} ref={headingRef} tabIndex={-1} className="sr-only">
          {title}
        </Heading>
      )}
    </>
  );
}
