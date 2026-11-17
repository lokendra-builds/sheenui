"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../../../lib/cn";
import { duration, spring } from "../../../motion/tokens";
import { exitTransition } from "../../../motion/presets";
import { DescriptionList } from "../../description-list/description-list";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../dialog/dialog";
import { Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerTitle } from "../../drawer/drawer";
import { MenuHighlight } from "../../menu/menu";
import { UnreadBadge, chatAppearReduced } from "../chat-parts";
import { emojiName } from "../emoji";
import { EmojiPicker } from "../emoji-picker";
import { formatDateTime, messageSummary, toDate } from "../format";
import { type ChatLabels } from "../labels";
import type { ChatMessage } from "../types";
import { ArrowDownIcon } from "../icons";

/* ---------- A quick reaction in the actions menu ---------- */

/** A menuitemcheckbox: aria-checked says which reaction is already yours (the ring shows it). */
export function ReactionMenuItem({
  emoji,
  checked,
  onToggle,
}: {
  emoji: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <BaseMenu.CheckboxItem
      checked={checked}
      onCheckedChange={onToggle}
      closeOnClick
      aria-label={emojiName(emoji)}
      className={cn(
        "relative isolate flex size-9 shrink-0 cursor-default items-center justify-center rounded-full text-xl leading-none outline-none select-none any-pointer-coarse:size-10",
        "touch-manipulation [-webkit-tap-highlight-color:transparent]",
        checked &&
          "bg-sheen-accent-soft ring-1 ring-sheen-accent-border forced-colors:ring-2 forced-colors:ring-[Highlight]",
      )}
      render={(itemProps, state) => (
        <div {...itemProps} className={cn(itemProps.className, state.highlighted && "sheen-fill")}>
          <MenuHighlight active={state.highlighted} className="rounded-full" />
          {itemProps.children}
        </div>
      )}
    >
      <span aria-hidden>{emoji}</span>
    </BaseMenu.CheckboxItem>
  );
}

/* ---------- Reaction picker ---------- */

/** The reaction picker of a message: the quick reactions and the ones already given. */
export function ReactionPanel({
  message,
  currentUserId,
  quickReactions,
  labels: L,
  labelsProp,
  coarse,
  onPick,
}: {
  message: ChatMessage;
  currentUserId: string;
  quickReactions: readonly string[];
  labels: ChatLabels;
  labelsProp?: Partial<ChatLabels>;
  coarse: boolean;
  onPick: (emoji: string) => void;
}) {
  const [more, setMore] = useState(false);
  const mine = (message.reactions ?? []).filter((r) => r.userIds.includes(currentUserId)).map((r) => r.emoji);
  return (
    <div className="flex flex-col gap-2">
      <div role="group" aria-label={L.reactions} className="flex items-center justify-between gap-1">
        {quickReactions.map((emoji) => {
          const pressed = mine.includes(emoji);
          return (
            <button
              key={emoji}
              type="button"
              aria-label={emojiName(emoji)}
              aria-pressed={pressed}
              onClick={() => onPick(emoji)}
              className={cn(
                "flex size-10 cursor-pointer items-center justify-center rounded-full text-[1.375rem] leading-none",
                "transition-[background-color,scale] duration-(--sheen-duration-snappy) ease-sheen-snappy hover:bg-sheen-hover motion-ok:hover:scale-125 motion-ok:active:scale-95",
                "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sheen-focus any-pointer-coarse:size-11",
                pressed && "bg-sheen-accent-soft ring-1 ring-sheen-accent-border forced-colors:ring-[Highlight]",
              )}
            >
              <span aria-hidden>{emoji}</span>
            </button>
          );
        })}
        <button
          type="button"
          aria-label={L.moreEmoji}
          aria-expanded={more}
          onClick={() => setMore((v) => !v)}
          className={cn(
            "flex size-10 cursor-pointer items-center justify-center rounded-full text-sheen-fg-muted transition-[background-color,rotate] duration-(--sheen-duration-base)",
            "hover:bg-sheen-hover hover:text-sheen-fg focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sheen-focus any-pointer-coarse:size-11",
            more && "bg-sheen-hover text-sheen-accent motion-ok:rotate-45",
          )}
        >
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="size-5"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>
      {more && (
        <EmojiPicker
          onSelect={onPick}
          selected={mine}
          autoFocusSearch={!coarse}
          labels={labelsProp}
          className={coarse ? "w-full" : undefined}
        />
      )}
    </div>
  );
}

/**
 * Where the reaction picker lives: a popover beside the bubble (mouse), a bottom sheet (touch). `children` is the
 * {@link ReactionPanel}; `finalFocus` is the message focus returns to when the picker closes.
 */
export function ReactionPicker({
  open,
  coarse,
  anchor,
  align,
  label,
  finalFocus,
  onClose,
  children,
}: {
  open: boolean;
  coarse: boolean;
  anchor: HTMLElement | null;
  align: "start" | "end";
  label: string;
  finalFocus: () => HTMLElement | true;
  onClose: () => void;
  children: ReactNode;
}) {
  if (coarse) {
    return (
      <Drawer open={open} onOpenChange={(next) => !next && onClose()}>
        <DrawerContent finalFocus={finalFocus}>
          <DrawerHeader>
            <DrawerTitle>{label}</DrawerTitle>
          </DrawerHeader>
          <DrawerBody className="pb-[max(1rem,env(safe-area-inset-bottom))]">{children}</DrawerBody>
        </DrawerContent>
      </Drawer>
    );
  }
  return (
    <BasePopover.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <BasePopover.Portal>
        <BasePopover.Positioner
          anchor={anchor}
          side="top"
          align={align}
          sideOffset={8}
          collisionPadding={12}
          className="z-50"
        >
          <BasePopover.Popup
            aria-label={label}
            finalFocus={finalFocus}
            className={cn(
              "glass-3 origin-(--transform-origin) rounded-sheen-lg p-2 outline-none",
              "[transition:opacity_var(--sheen-duration-fast)_var(--sheen-ease-out),scale_var(--sheen-duration-snappy)_var(--sheen-ease-snappy)]",
              "data-starting-style:opacity-0 motion-ok:data-starting-style:scale-90",
              "data-ending-style:[transition:opacity_var(--sheen-duration-exit)_var(--sheen-ease-exit),scale_var(--sheen-duration-exit)_var(--sheen-ease-exit)]",
              "data-ending-style:opacity-0 motion-ok:data-ending-style:scale-95",
            )}
          >
            {children}
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
}

/* ---------- Short notes ("Copied") ---------- */

/** A short note over the bottom of the log; it is also announced, so it is hidden from assistive tech here. */
export function ThreadNotice({ notice, reduced }: { notice: string | null; reduced: boolean }) {
  return (
    <AnimatePresence>
      {notice && (
        <motion.p
          key={notice}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduced ? { opacity: 0, transition: exitTransition } : { opacity: 0, y: 6, transition: exitTransition }}
          transition={reduced ? { duration: duration.fast } : spring.snappy}
          aria-hidden
          className="rounded-full bg-sheen-fg px-3.5 py-1.5 text-center text-xs font-medium text-sheen-bg shadow-lg"
        >
          {notice}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

/* ---------- Message info ---------- */

/** The info sheet of a message: who read or received it and when. */
export function MessageInfo({
  message,
  coarse,
  locale,
  labels: L,
  returnFocus,
  onClose,
}: {
  message: ChatMessage | undefined;
  coarse: boolean;
  locale?: string;
  labels: ChatLabels;
  /** Where focus goes once it has closed (the message). */
  returnFocus: () => HTMLElement | true;
  onClose: () => void;
}) {
  // Keep the last message while the dialog animates closed.
  const [kept, setKept] = useState(message);
  if (message && message !== kept) setKept(message);
  const m = message ?? kept;
  const open = Boolean(message);
  const when = (value: ChatMessage["createdAt"] | undefined) => {
    const date = toDate(value);
    return date ? formatDateTime(date, locale) : L.notYet;
  };
  const status = m?.status ?? "sent";
  const delivered = m?.deliveredAt ?? (status === "read" ? m?.readAt : undefined);
  const body = m ? (
    <div className="flex flex-col gap-4">
      <p className="line-clamp-4 rounded-[1.125rem] rounded-ee-[0.375rem] px-3.5 py-2 text-sm text-sheen-accent-fg [overflow-wrap:anywhere] [background-image:var(--sheen-accent-fill)] bg-(--sheen-violet-700) forced-colors:border forced-colors:border-[CanvasText]">
        {messageSummary(m, L, true)}
      </p>
      <DescriptionList
        size="sm"
        items={[
          { id: "sent", label: L.sentAt, value: when(m.createdAt) },
          {
            id: "delivered",
            label: L.deliveredAt,
            value: status === "delivered" || status === "read" ? when(delivered ?? m.createdAt) : L.notYet,
          },
          { id: "read", label: L.readAt, value: status === "read" ? when(m.readAt ?? m.createdAt) : L.notYet },
        ]}
      />
    </div>
  ) : null;

  if (coarse) {
    return (
      <Drawer open={open} onOpenChange={(next) => !next && onClose()}>
        <DrawerContent finalFocus={returnFocus}>
          <DrawerHeader>
            <DrawerTitle>{L.messageInfo}</DrawerTitle>
          </DrawerHeader>
          <DrawerBody className="pb-[max(1.25rem,env(safe-area-inset-bottom))]">{body}</DrawerBody>
        </DrawerContent>
      </Drawer>
    );
  }
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent finalFocus={returnFocus}>
        <DialogHeader>
          <DialogTitle>{L.messageInfo}</DialogTitle>
        </DialogHeader>
        {body}
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Jump to latest: a pill with its own state, so the scroll that shows it never re-renders the thread ---------- */

/** State of the jump-to-latest pill: whether it shows and how many new messages are unseen. */
export type JumpState = { show: boolean; unseen: number };

/** Creates the small store behind the jump-to-latest pill, so the scroll that shows it never re-renders the thread. */
export function createJumpStore() {
  let state: JumpState = { show: false, unseen: 0 };
  const listeners = new Set<() => void>();
  const update = (next: JumpState) => {
    if (next.show === state.show && next.unseen === state.unseen) return;
    state = next;
    listeners.forEach((fn) => fn());
  };
  return {
    get: () => state,
    subscribe: (fn: () => void) => {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
    setShow: (show: boolean) => update({ ...state, show }),
    setUnseen: (value: number | ((n: number) => number)) =>
      update({ ...state, unseen: typeof value === "function" ? value(state.unseen) : value }),
  };
}

/** A pill that scrolls the log to the newest message, with the count of unseen ones. */
export function JumpToLatest({
  store,
  empty,
  reduced,
  label,
  newBelow,
  onJump,
}: {
  store: ReturnType<typeof createJumpStore>;
  empty: boolean;
  reduced: boolean;
  label: string;
  newBelow: (count: number) => string;
  onJump: () => void;
}) {
  const { show, unseen } = useSyncExternalStore(store.subscribe, store.get, store.get);
  return (
    <AnimatePresence>
      {show && !empty && (
        <motion.button
          key="jump"
          type="button"
          onClick={onJump}
          aria-label={unseen ? `${label}, ${newBelow(unseen)}` : label}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={
            reduced
              ? { opacity: 0, transition: exitTransition }
              : { opacity: 0, y: 8, scale: 0.92, transition: exitTransition }
          }
          // The pill pops in (bouncy); the glass fades on its own element only, so its blur holds.
          transition={
            reduced ? { duration: duration.fast } : { ...spring.bouncy, opacity: { duration: duration.fast } }
          }
          className={cn(
            "glass-3 pointer-events-auto relative flex size-10 cursor-pointer items-center justify-center rounded-full text-sheen-fg",
            "hover:bg-sheen-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus any-pointer-coarse:size-11",
          )}
        >
          <ArrowDownIcon className="size-[1.125rem]" />
          {unseen > 0 && (
            <UnreadBadge
              count={unseen}
              className={cn(
                "absolute -end-1.5 -top-2 motion-ok:animate-[sheen-chat-pop_var(--sheen-duration-snappy)_var(--sheen-ease-snappy)]",
                chatAppearReduced,
              )}
            />
          )}
        </motion.button>
      )}
    </AnimatePresence>
  );
}
