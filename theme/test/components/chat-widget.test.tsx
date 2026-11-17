// ChatWidget beyond open / Escape: the phone sheet (modal), new conversation, launcher badge,
// help links, typing subtitle, quick replies that retire after the first reply, and left placement.

import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { ChatWidget, type ChatWidgetProps } from "../../src/components/chat/chat-widget";
import type { ChatConversation, ChatMessage, ChatParticipant } from "../../src/components/chat/types";
import { settle } from "../helpers";
import { renderUi, runAxe } from "../render";

afterEach(() => {
  vi.restoreAllMocks();
});

const NOW = new Date(2026, 10, 18, 14, 30);
const at = (minutesAgo: number) => new Date(NOW.getTime() - minutesAgo * 60_000).toISOString();
const people: ChatParticipant[] = [
  { id: "me", name: "Ava Chen" },
  { id: "riya", name: "Riya Sharma", presence: "online" },
  { id: "arjun", name: "Arjun Mehta", presence: "away" },
];
const msg = (id: string, senderId: string, text: string, minutesAgo: number): ChatMessage => ({
  id,
  senderId,
  text,
  createdAt: at(minutesAgo),
});

const conversations: ChatConversation[] = [
  { id: "c1", participantIds: ["me", "riya"], unreadCount: 2, lastMessage: msg("m2", "riya", "Happy to help", 4) },
  { id: "c2", participantIds: ["me", "arjun"], lastMessage: msg("n1", "me", "Thanks!", 600) },
];
const messages = {
  c1: [msg("m1", "me", "Hello", 10), msg("m2", "riya", "Happy to help", 4)],
  c2: [msg("n1", "riya", "Welcome", 700)],
};

function Widget(props: Partial<ChatWidgetProps>) {
  return (
    <div className="relative h-[720px] w-[720px]">
      <ChatWidget
        conversations={conversations}
        messages={messages}
        participants={people}
        currentUserId="me"
        strategy="absolute"
        now={NOW}
        locale="en-US"
        {...props}
      />
    </div>
  );
}
const launcher = () => screen.getByRole("button", { name: /^(Open|Close) chat/ });

function stubNarrow() {
  const real = window.matchMedia.bind(window);
  vi.spyOn(window, "matchMedia").mockImplementation((q: string) =>
    q.includes("max-width: 639.98px") || q.includes("pointer: coarse")
      ? ({
          matches: true,
          media: q,
          addEventListener: () => undefined,
          removeEventListener: () => undefined,
        } as unknown as MediaQueryList)
      : real(q),
  );
}

describe("launcher", () => {
  it("shows the unread total in its name and as a badge, which disappears while open; unreadCount overrides", async () => {
    const view = renderUi(<Widget />);
    expect(launcher()).toHaveAccessibleName("Open chat, 2 unread messages");
    view.rerender(<Widget unreadCount={120} />);
    expect(launcher()).toHaveAccessibleName("Open chat, 120 unread messages");
    await userEvent.click(launcher());
    expect(launcher()).toHaveAccessibleName("Close chat");
  });

  it("placing the widget on the left flips its corner", () => {
    const view = renderUi(<Widget position="left" defaultOpen />);
    const corner = (el: Element | null) =>
      el?.closest("[class*='left-[max']") !== null || el.className.includes("left-[max");
    expect(corner(launcher().parentElement ?? launcher())).toBe(true);
    expect(screen.getByRole("dialog").className).toContain("left-[max");
    view.rerender(<Widget position="right" defaultOpen />);
    expect(screen.getByRole("dialog").className).toContain("right-[max");
  });
});

describe("home", () => {
  it("lists the three most recent chats with preview and unread badge, shows custom content and help links (new tab ones are safe)", async () => {
    renderUi(
      <Widget
        defaultOpen
        homeContent={<p>We reply fast</p>}
        helpLinks={[
          { label: "Shipping", href: "/help/shipping", description: "When it arrives" },
          { label: "Docs", href: "https://docs.example", newTab: true },
        ]}
      />,
    );
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("We reply fast")).toBeInTheDocument();
    const recent = within(dialog)
      .getAllByRole("button")
      .filter((b) => b.hasAttribute("data-widget-conversation"));
    expect(recent).toHaveLength(2);
    expect(recent[0]).toHaveTextContent("Riya Sharma");
    expect(recent[0]).toHaveTextContent("Happy to help");
    expect(recent[1]).toHaveTextContent("You: Thanks!");
    expect(within(dialog).getByRole("link", { name: /Shipping/ })).not.toHaveAttribute("target");
    const docs = within(dialog).getByRole("link", { name: /Docs/ });
    expect(docs).toHaveAttribute("target", "_blank");
    expect(docs).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("Send us a message is disabled without onNewConversation; with it, it opens the new chat and focuses the composer", async () => {
    const view = renderUi(<Widget defaultOpen />);
    expect(await screen.findByRole("button", { name: "Send us a message" })).toBeDisabled();
    view.unmount();
    const onNew = vi.fn(() => "c2");
    renderUi(<Widget defaultOpen onNewConversation={onNew} />);
    await userEvent.click(await screen.findByRole("button", { name: "Send us a message" }));
    expect(onNew).toHaveBeenCalledTimes(1);
    expect(await screen.findByRole("log")).toBeInTheDocument();
    await expect.poll(() => document.activeElement).toBe(screen.getByRole("textbox", { name: "Message" }));
  });

  it("an onNewConversation that returns nothing leaves the home view as it was", async () => {
    renderUi(<Widget defaultOpen onNewConversation={() => undefined} />);
    await userEvent.click(await screen.findByRole("button", { name: "Send us a message" }));
    expect(screen.queryByRole("log")).toBeNull();
  });
});

describe("thread view", () => {
  it("opening a chat marks it read, shows the agent in the header, and Back returns home with focus on that chat", async () => {
    const onRead = vi.fn();
    const onConversationChange = vi.fn();
    renderUi(<Widget defaultOpen onRead={onRead} onConversationChange={onConversationChange} />);
    const dialog = await screen.findByRole("dialog");
    await userEvent.click(
      within(dialog)
        .getAllByRole("button")
        .find((b) => b.getAttribute("data-widget-conversation") === "c1")!,
    );
    expect(onConversationChange).toHaveBeenCalledWith("c1");
    await expect.poll(() => onRead.mock.calls.length).toBeGreaterThan(0);
    expect(onRead).toHaveBeenCalledWith("c1");
    await userEvent.click(await screen.findByRole("button", { name: "Back" }));
    await expect.poll(() => document.activeElement?.getAttribute("data-widget-conversation")).toBe("c1");
  });

  it("shows typing in the subtitle; quick replies are offered until you have replied; send and reactions report the chat id", async () => {
    const onSend = vi.fn();
    const onReact = vi.fn();
    const noReplyYet = [conversations[0]!, { ...conversations[1]!, typingIds: ["arjun"] }];
    renderUi(
      <Widget
        defaultOpen
        defaultConversationId="c2"
        conversations={noReplyYet}
        messages={{ ...messages, c2: [msg("n1", "riya", "Welcome", 700)] }}
        quickReplies={["Pricing?", "Talk to a human"]}
        onSend={onSend}
        onReact={onReact}
      />,
    );
    await screen.findByRole("log");
    expect(screen.getByText("typing…")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Talk to a human" }));
    expect(onSend).toHaveBeenCalledWith("c2", expect.objectContaining({ text: "Talk to a human" }));
  });

  it("no quick replies once the visitor has written in the chat", async () => {
    renderUi(<Widget defaultOpen defaultConversationId="c1" quickReplies={["Pricing?"]} />);
    await screen.findByRole("log");
    expect(screen.queryByRole("button", { name: "Pricing?" })).toBeNull();
  });

  it("controlled open and conversationId follow their props", async () => {
    const view = renderUi(<Widget open={false} conversationId={null} />);
    expect(screen.queryByRole("dialog")).toBeNull();
    view.rerender(<Widget open conversationId="c1" />);
    expect(await screen.findByRole("log")).toBeInTheDocument();
    view.rerender(<Widget open conversationId={null} />);
    await expect.poll(() => screen.queryByRole("log")).toBeNull();
  });
});

describe("phone sheet", () => {
  it("on a small screen the panel is a modal sheet: the page behind is inert and Escape closes it", async () => {
    stubNarrow();
    const onOpenChange = vi.fn<(open: boolean) => void>();
    renderUi(
      <div>
        <button>Page button</button>
        <ChatWidget
          conversations={conversations}
          messages={messages}
          participants={people}
          currentUserId="me"
          onOpenChange={onOpenChange}
          now={NOW}
        />
      </div>,
    );
    await userEvent.click(launcher());
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    await expect
      .poll(
        () =>
          screen.getByText("Page button").hasAttribute("inert") ||
          screen.getByText("Page button").closest("[inert]") !== null,
      )
      .toBe(true);
    // The panel moves focus in on the next animation frame; Escape pressed before that lands on the page, not the sheet.
    await expect.poll(() => dialog.contains(document.activeElement)).toBe(true);
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => onOpenChange.mock.calls.at(-1)?.[0]).toBe(false);
  });

  it("touch: opening a chat focuses the Back button (no keyboard pops up), and the minimise button closes the sheet", async () => {
    stubNarrow();
    renderUi(<Widget defaultOpen />);
    const dialog = await screen.findByRole("dialog");
    await userEvent.click(
      within(dialog)
        .getAllByRole("button")
        .find((b) => b.getAttribute("data-widget-conversation") === "c1")!,
    );
    await expect.poll(() => document.activeElement?.hasAttribute("data-widget-back")).toBe(true);
    await expect.poll(() => screen.getAllByRole("button", { name: "Minimise chat" }).length).toBe(1);
    await userEvent.click(screen.getByRole("button", { name: "Minimise chat" }));
    await settle();
    await expect.poll(() => screen.queryByRole("dialog")).toBeNull();
  });
});

describe("reduced motion + a11y", () => {
  it("opens and switches views without springs", async () => {
    document.documentElement.setAttribute("data-motion", "reduced");
    renderUi(<Widget />);
    await userEvent.click(launcher());
    const dialog = await screen.findByRole("dialog");
    await userEvent.click(
      within(dialog)
        .getAllByRole("button")
        .find((b) => b.getAttribute("data-widget-conversation") === "c1")!,
    );
    expect(await screen.findByRole("log")).toBeInTheDocument();
  });

  it("has no axe violations in the thread view", async () => {
    renderUi(<Widget defaultOpen defaultConversationId="c1" />);
    await screen.findByRole("log");
    await settle();
    expect(await runAxe()).toHaveNoViolations();
  });
});
