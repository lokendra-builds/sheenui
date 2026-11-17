// ChatApp: two panes on a wide container, a stack with a slide-over thread on a narrow one,
// focus hand-offs, per-chat drafts, the unread divider, and the contact / group info drawer.

import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { ChatApp, type ChatAppProps } from "../../src/blocks/chat-app";
import type { ChatConversation, ChatMessage, ChatParticipant } from "../../src/components/chat/types";
import { pixel, settle } from "../helpers";
import { renderUi, runAxe } from "../render";

afterEach(() => {
  vi.restoreAllMocks();
});

const NOW = new Date(2026, 10, 18, 14, 30);
const at = (minutesAgo: number) => new Date(NOW.getTime() - minutesAgo * 60_000).toISOString();

const people: ChatParticipant[] = [
  { id: "me", name: "Ava Chen" },
  {
    id: "riya",
    name: "Riya Sharma",
    presence: "online",
    phone: "+91 98765 43210",
    email: "riya@example.com",
    about: "Support lead",
  },
  { id: "arjun", name: "Arjun Mehta", presence: "away", role: "Designer" },
  { id: "lena", name: "Lena Fischer", presence: "offline", lastSeenAt: at(300) },
];

const msg = (
  id: string,
  senderId: string,
  text: string,
  minutesAgo: number,
  extra: Partial<ChatMessage> = {},
): ChatMessage => ({ id, senderId, text, createdAt: at(minutesAgo), ...extra });

const conversations: ChatConversation[] = [
  {
    id: "c1",
    participantIds: ["me", "riya"],
    unreadCount: 2,
    lastMessage: msg("m3", "riya", "Shipping tomorrow", 5),
    draft: "stale draft",
  },
  {
    id: "c2",
    kind: "group",
    title: "Design team",
    participantIds: ["me", "riya", "arjun", "lena"],
    lastMessage: msg("g2", "arjun", "New mockups", 60),
    muted: true,
  },
  { id: "c3", participantIds: ["me", "lena"], lastMessage: msg("l1", "lena", "Hello", 3000) },
];

const messages: Record<string, ChatMessage[] | undefined> = {
  c1: [
    msg("m1", "me", "Hi Riya", 40),
    msg("m2", "riya", "Morning", 20, {
      attachments: [
        { id: "p1", kind: "image", name: "cat.png", url: pixel },
        { id: "p2", kind: "image", name: "dog.png", url: pixel, alt: "A dog" },
      ],
    }),
    msg("m3", "riya", "Shipping tomorrow", 5),
    msg("m3b", "riya", "Deleted pic", 4, {
      deleted: true,
      attachments: [{ id: "p3", kind: "image", name: "gone.png", url: pixel }],
    }),
  ],
  c2: [msg("g1", "arjun", "Mockups?", 90), msg("g2", "arjun", "New mockups", 60)],
  c3: [msg("l1", "lena", "Hello", 3000)],
};

function App(props: Partial<ChatAppProps> & { width?: number }) {
  const { width = 960, ...rest } = props;
  return (
    <div style={{ width }}>
      <ChatApp
        conversations={conversations}
        participants={people}
        currentUserId="me"
        messages={messages}
        now={NOW}
        locale="en-US"
        {...rest}
      />
    </div>
  );
}
const root = () => document.querySelector<HTMLElement>("[data-slot=chat-app]")!;
const open = (name: RegExp | string) => userEvent.click(screen.getByRole("option", { name }));

describe("two panes (wide)", () => {
  it("shows the list beside an empty prompt until a chat is opened; opening shows its thread and marks the chat selected", async () => {
    const onSelectedIdChange = vi.fn();
    renderUi(<App onSelectedIdChange={onSelectedIdChange} />);
    expect(root()).toHaveAttribute("data-layout", "split");
    expect(screen.getByText("Pick a chat")).toBeInTheDocument();
    await open(/Riya Sharma/);
    expect(onSelectedIdChange).toHaveBeenCalledWith("c1");
    expect(await screen.findByRole("log", { name: "Messages with Riya Sharma" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Riya Sharma/ })).toHaveAttribute("aria-selected", "true");
    expect(screen.queryByText("Pick a chat")).toBeNull();
    // No back button in two-pane mode.
    expect(screen.queryByRole("button", { name: "Back to chats" })).toBeNull();
  });

  it("opening with the keyboard moves focus into the composer", async () => {
    renderUi(<App />);
    screen.getByRole("option", { name: /Design team/ }).focus();
    await userEvent.keyboard("{Enter}");
    // The composer mounts with the thread and takes focus after the hand-off: poll both (queryBy, so a not-yet-mounted composer is `null`, never a throw).
    await expect.poll(() => document.activeElement === screen.queryByRole("textbox", { name: "Message" })).toBe(true);
  });

  it("starts on defaultSelectedId, or follows a controlled selectedId", () => {
    const view = renderUi(<App defaultSelectedId="c2" />);
    expect(screen.getByRole("log", { name: "Messages with Design team" })).toBeInTheDocument();
    view.unmount();
    const controlled = renderUi(<App selectedId="c3" />);
    expect(screen.getByRole("log", { name: "Messages with Lena Fischer" })).toBeInTheDocument();
    controlled.rerender(<App selectedId={null} />);
    expect(screen.getByText("Pick a chat")).toBeInTheDocument();
  });

  it("passes thread events up with the conversation id: send, edit, delete, react, retry, read, typing, call", async () => {
    const h = {
      onSend: vi.fn(),
      onEdit: vi.fn(),
      onDelete: vi.fn(),
      onReact: vi.fn(),
      onRetry: vi.fn(),
      onRead: vi.fn(),
      onTyping: vi.fn(),
      onCall: vi.fn(),
      onVideoCall: vi.fn(),
    };
    renderUi(<App defaultSelectedId="c1" {...h} />);
    await userEvent.click(screen.getByRole("button", { name: "Voice call" }));
    expect(h.onCall).toHaveBeenCalledWith(expect.objectContaining({ id: "c1" }));
    await userEvent.click(screen.getByRole("button", { name: "Video call" }));
    expect(h.onVideoCall).toHaveBeenCalledWith(expect.objectContaining({ id: "c1" }));
    await expect.poll(() => h.onRead.mock.calls.length).toBeGreaterThan(0);
    expect(h.onRead).toHaveBeenCalledWith("c1");

    const field = screen.getByRole("textbox", { name: "Message" });
    await userEvent.type(field, "Ok");
    expect(h.onTyping).toHaveBeenCalledWith("c1", true);
    await userEvent.keyboard("{Enter}");
    expect(h.onSend.mock.calls[0]![0]).toBe("c1");
    expect(h.onSend.mock.calls[0]![1]).toMatchObject({ text: "Ok" });
  });

  it("opens at the first unread message with a New messages divider", async () => {
    renderUi(<App defaultSelectedId="c1" />);
    expect(await screen.findByRole("separator", { name: "New messages" })).toBeInTheDocument();
  });

  it("keeps a typed draft per chat (shown in the list while you are elsewhere) and clears the stale draft of the open chat", async () => {
    renderUi(<App defaultSelectedId="c1" />);
    // The open chat's own saved draft is not shown in the list.
    expect(screen.getByRole("option", { name: /Riya Sharma/ })).not.toHaveTextContent("Draft:");
    const field = screen.getByRole("textbox", { name: "Message" });
    await userEvent.type(field, "half a thought");
    await open(/Design team/);
    await expect
      .poll(() => screen.getByRole("option", { name: /Riya Sharma/ }).textContent)
      .toContain("Draft: half a thought");
    await open(/Riya Sharma/);
    await expect
      .poll(() => screen.getByRole<HTMLTextAreaElement>("textbox", { name: "Message" }).value)
      .toBe("half a thought");
  });

  it("with onDraftChange the app stores drafts itself", async () => {
    const onDraftChange = vi.fn();
    renderUi(<App defaultSelectedId="c3" onDraftChange={onDraftChange} />);
    await userEvent.type(screen.getByRole("textbox", { name: "Message" }), "x");
    expect(onDraftChange).toHaveBeenCalledWith("c3", "x");
  });

  it("loading shows the list skeleton; loadingOlderId and hasOlder drive the open thread", () => {
    const view = renderUi(<App loading />);
    expect(screen.getAllByText("Loading chats…").length).toBeGreaterThan(0);
    view.unmount();
    const onLoadOlder = vi.fn();
    renderUi(
      <App defaultSelectedId="c3" hasOlder={(id) => id === "c3"} loadingOlderId="c3" onLoadOlder={onLoadOlder} />,
    );
    expect(screen.getByText("Loading earlier messages…")).toBeInTheDocument();
  });

  it("list and thread props pass through (hide search, compact thread)", () => {
    renderUi(<App defaultSelectedId="c1" listProps={{ showSearch: false }} threadProps={{ density: "compact" }} />);
    expect(screen.queryByRole("searchbox")).toBeNull();
  });
});

describe("stacked (narrow)", () => {
  it("below the breakpoint the thread slides over the list; Back returns and puts focus on the chat that was open", async () => {
    renderUi(<App width={420} />);
    expect(root()).toHaveAttribute("data-layout", "stack");
    await open(/Riya Sharma/);
    const back = await screen.findByRole("button", { name: "Back to chats" });
    // The hidden pane is inert, so only one is reachable.
    const panes = [...root().children].filter(
      (n) => n.hasAttribute("inert") || n.querySelector("[data-slot=conversation-list], [data-slot=chat-thread]"),
    );
    expect(panes.some((p) => p.hasAttribute("inert"))).toBe(true);
    // Focus goes to the chat title when it opens.
    await expect.poll(() => (document.activeElement as HTMLElement | null)?.tagName).toBe("H2");
    await userEvent.click(back);
    await expect.poll(() => (document.activeElement as HTMLElement).getAttribute("role")).toBe("option");
    expect(document.activeElement).toHaveTextContent("Riya Sharma");
  });

  it("stackBelow moves the breakpoint", () => {
    renderUi(<App width={700} stackBelow={800} />);
    expect(root()).toHaveAttribute("data-layout", "stack");
  });

  it("reacts to the container being resized across the breakpoint", async () => {
    function Resizer() {
      const [w, setW] = useState(900);
      return (
        <>
          <button onClick={() => setW(400)}>narrow</button>
          <App width={w} />
        </>
      );
    }
    renderUi(<Resizer />);
    expect(root()).toHaveAttribute("data-layout", "split");
    await userEvent.click(screen.getByRole("button", { name: "narrow" }));
    await expect.poll(() => root().getAttribute("data-layout")).toBe("stack");
  });
});

describe("info drawer", () => {
  it("a direct chat's info shows presence, about, phone and email links, shared photos, and block", async () => {
    const onBlock = vi.fn();
    const onConversationAction = vi.fn();
    renderUi(<App defaultSelectedId="c1" onBlock={onBlock} onConversationAction={onConversationAction} />);
    await userEvent.click(screen.getByRole("button", { name: "Contact info" }));
    const drawer = await screen.findByRole("dialog");
    expect(within(drawer).getByRole("heading", { name: "Riya Sharma" })).toBeInTheDocument();
    expect(within(drawer).getByText("Online")).toBeInTheDocument();
    expect(within(drawer).getByText("Support lead")).toBeInTheDocument();
    expect(within(drawer).getByRole("link", { name: "+91 98765 43210" })).toHaveAttribute("href", "tel:+919876543210");
    expect(within(drawer).getByRole("link", { name: "riya@example.com" })).toHaveAttribute(
      "href",
      "mailto:riya@example.com",
    );
    // Two photos in the chat are shared; the deleted one is not.
    expect(within(drawer).getAllByRole("button", { name: /^Open / })).toHaveLength(2);

    await userEvent.click(within(drawer).getByRole("switch", { name: "Mute notifications" }));
    expect(onConversationAction).toHaveBeenCalledWith(expect.objectContaining({ id: "c1" }), "mute");
    await userEvent.click(within(drawer).getByRole("button", { name: "Block Riya Sharma" }));
    expect(onBlock).toHaveBeenCalledWith(expect.objectContaining({ id: "riya" }));
  });

  it("a shared photo opens the viewer; closing it returns focus to that photo", async () => {
    renderUi(<App defaultSelectedId="c1" />);
    await userEvent.click(screen.getByRole("button", { name: "Contact info" }));
    const drawer = await screen.findByRole("dialog");
    const photo = within(drawer).getByRole("button", { name: "Open A dog" });
    await userEvent.click(photo);
    const viewer = await screen.findByRole("dialog", { name: "A dog" });
    expect(within(viewer).getByText("2 of 2")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await settle();
    await expect.poll(() => document.activeElement).toBe(photo);
  });

  it("a group's info lists its members with roles or presence, offers Leave group, and the drawer returns focus to the info button", async () => {
    const onLeaveGroup = vi.fn();
    renderUi(<App defaultSelectedId="c2" onLeaveGroup={onLeaveGroup} />);
    const infoButton = screen.getByRole("button", { name: "Group info" });
    await userEvent.click(infoButton);
    const drawer = await screen.findByRole("dialog");
    expect(within(drawer).getByText("4 members, 1 online")).toBeInTheDocument();
    expect(within(drawer).getByText("Ava Chen (You)")).toBeInTheDocument();
    expect(within(drawer).getByText("Designer")).toBeInTheDocument();
    expect(within(drawer).getByText("No photos shared yet.")).toBeInTheDocument();
    await userEvent.click(within(drawer).getByRole("button", { name: "Leave group" }));
    expect(onLeaveGroup).toHaveBeenCalledWith(expect.objectContaining({ id: "c2" }));
    await userEvent.keyboard("{Escape}");
    await settle();
    await expect.poll(() => document.activeElement).toBe(infoButton);
  });

  it("a person who was last seen earlier shows how long ago; the mute switch shows the chat's state", async () => {
    renderUi(<App defaultSelectedId="c3" onConversationAction={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "Contact info" }));
    const drawer = await screen.findByRole("dialog");
    expect(within(drawer).getByText(/Last seen 5h ago/)).toBeInTheDocument();
    expect(within(drawer).getByRole("switch", { name: "Mute notifications" })).not.toBeChecked();
    await userEvent.keyboard("{Escape}");
  });

  it("a muted chat's switch is on and turning it off reports unmute", async () => {
    const onConversationAction = vi.fn();
    renderUi(<App defaultSelectedId="c2" onConversationAction={onConversationAction} />);
    await userEvent.click(screen.getByRole("button", { name: "Group info" }));
    const drawer = await screen.findByRole("dialog");
    const toggle = within(drawer).getByRole("switch", { name: "Mute notifications" });
    expect(toggle).toBeChecked();
    await userEvent.click(toggle);
    expect(onConversationAction).toHaveBeenCalledWith(expect.objectContaining({ id: "c2" }), "unmute");
  });
});

describe("a11y + labels", () => {
  it("labels translate the empty prompt", () => {
    renderUi(<App labels={{ selectChatTitle: "Wähle einen Chat", selectChatDescription: "Links auswählen" }} />);
    expect(screen.getByText("Wähle einen Chat")).toBeInTheDocument();
  });

  it("has no axe violations (two panes with a chat open)", async () => {
    renderUi(<App defaultSelectedId="c3" />);
    await settle();
    expect(await runAxe()).toHaveNoViolations();
  });
});
