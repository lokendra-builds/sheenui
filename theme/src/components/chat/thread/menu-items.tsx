"use client";

import type { ReactNode } from "react";
import { MenuGroup, MenuItem, MenuSeparator } from "../../menu/menu";
import { CopyIcon, InfoIcon, PencilIcon, ReplyIcon, RetryIcon, SmilePlusIcon, TrashIcon } from "../icons";
import type { ChatLabels } from "../labels";
import type { ChatMessage } from "../types";
import { ReactionMenuItem } from "./parts";

/** Everything {@link MessageMenuItems} reads from the thread. */
export type MessageMenuContext = {
  currentUserId: string;
  L: ChatLabels;
  coarse: boolean;
  quickReactions: readonly string[];
  hasReact: boolean;
  onRetry: ((message: ChatMessage) => void) | undefined;
  hasDelete: boolean;
  toggleReaction: (message: ChatMessage, emoji: string) => void;
  openReactionsFor: (message: ChatMessage) => void;
  openInfoFor: (message: ChatMessage) => void;
  startReply: (message: ChatMessage) => void;
  startEdit: (message: ChatMessage) => void;
  canEdit: (message: ChatMessage) => boolean;
  copy: (message: ChatMessage) => void;
  remove: (message: ChatMessage) => Promise<void>;
};

/**
 * The entries of a message's actions menu (reactions row, reply, copy, edit, retry, info, delete), for the context menu
 * and the hover toolbar's ⋯ menu.
 *
 * @internal
 */
export function MessageMenuItems({
  message: m,
  from,
  ctx,
}: {
  message: ChatMessage;
  from: "context" | "more";
  ctx: MessageMenuContext;
}) {
  const { currentUserId, L, coarse, quickReactions, hasReact, onRetry, hasDelete } = ctx;
  const { toggleReaction, openReactionsFor, openInfoFor, startReply, startEdit, canEdit, copy, remove } = ctx;
  const own = m.senderId === currentUserId;
  const mineReactions = new Set(
    (m.reactions ?? []).filter((r) => r.userIds.includes(currentUserId)).map((r) => r.emoji),
  );
  const items: ReactNode[] = [
    hasReact && (
      <MenuGroup
        key="reactions"
        aria-label={L.reactions}
        className="flex items-center justify-between gap-0.5 px-0.5 pb-1"
      >
        {quickReactions.map((emoji) => (
          <ReactionMenuItem
            key={emoji}
            emoji={emoji}
            checked={mineReactions.has(emoji)}
            onToggle={() => toggleReaction(m, emoji)}
          />
        ))}
        <MenuItem
          key="more"
          aria-label={L.moreEmoji}
          onClick={() => openReactionsFor(m)}
          className="size-9 min-h-9 shrink-0 justify-center gap-0 rounded-full px-0 text-sheen-fg-muted any-pointer-coarse:size-10"
        >
          <SmilePlusIcon className="mx-auto size-[1.125rem]" />
        </MenuItem>
      </MenuGroup>
    ),
    hasReact && <MenuSeparator key="sep1" />,
    <MenuItem
      key="reply"
      icon={<ReplyIcon />}
      shortcut={from === "context" && !coarse ? "r" : undefined}
      onClick={() => startReply(m)}
    >
      {L.reply}
    </MenuItem>,
    m.text?.trim() && (
      <MenuItem key="copy" icon={<CopyIcon />} onClick={() => copy(m)}>
        {L.copy}
      </MenuItem>
    ),
    canEdit(m) && (
      <MenuItem
        key="edit"
        icon={<PencilIcon />}
        shortcut={from === "context" && !coarse ? "e" : undefined}
        onClick={() => startEdit(m)}
      >
        {L.edit}
      </MenuItem>
    ),
    own && m.status === "failed" && onRetry && (
      <MenuItem key="retry" icon={<RetryIcon />} onClick={() => onRetry(m)}>
        {L.retry}
      </MenuItem>
    ),
    own && (
      <MenuItem key="info" icon={<InfoIcon />} onClick={() => openInfoFor(m)}>
        {L.messageInfo}
      </MenuItem>
    ),
    own && hasDelete && <MenuSeparator key="sep2" />,
    own && hasDelete && (
      <MenuItem key="delete" icon={<TrashIcon />} tone="danger" onClick={() => void remove(m)}>
        {L.delete}
      </MenuItem>
    ),
  ];
  return <>{items}</>;
}
