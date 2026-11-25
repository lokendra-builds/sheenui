// ChatComposer: sending keys (Enter / Shift+Enter / IME / touch), edit-last, reply + edit modes,
// typing signal, attachments (pick, drop, paste, limits), emoji insertion, and the imperative handle.

import { createRef, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, within } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { ChatComposer, type ChatComposerHandle, type ChatComposerProps } from "../../src/components/chat/composer";
import type { ChatDraft } from "../../src/components/chat/types";
import { settle } from "../helpers";
import { setReducedMotion } from "../helpers-text";
import { renderUi, runAxe } from "../render";

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

const field = () => screen.getByRole<HTMLTextAreaElement>("textbox");
const send = () => screen.getByRole<HTMLButtonElement>("button", { name: /^(Send|Save changes)$/ });

function stubCoarse(on: boolean) {
  const real = window.matchMedia.bind(window);
  vi.spyOn(window, "matchMedia").mockImplementation((q: string) =>
    q.includes("pointer: coarse")
      ? ({
          matches: on,
          media: q,
          addEventListener: () => undefined,
          removeEventListener: () => undefined,
        } as unknown as MediaQueryList)
      : real(q),
  );
}

const file = (name: string, type = "text/plain", size = 10) => new File([new Uint8Array(size)], name, { type });
const transfer = (...files: File[]) => {
  const dt = new DataTransfer();
  for (const f of files) dt.items.add(f);
  return dt;
};
function pick(files: File[]) {
  const input = document.querySelector<HTMLInputElement>('input[type="file"]')!;
  input.files = transfer(...files).files;
  fireEvent.change(input);
}

function setup(props: Partial<ChatComposerProps> = {}) {
  const onSend = vi.fn<(draft: ChatDraft) => void>();
  const view = renderUi(<ChatComposer onSend={onSend} {...props} />);
  return { onSend, ...view };
}

describe("sending", () => {
  it("Enter sends the trimmed text, clears the field and keeps focus; Shift+Enter and Alt+Enter add lines", async () => {
    const { onSend } = setup();
    field().focus();
    await userEvent.keyboard("hello{Shift>}{Enter}{/Shift}world{Alt>}{Enter}{/Alt}!");
    // Alt+Enter is left to the browser (a textarea inserts nothing for it) and must not send.
    expect(field().value).toBe("hello\nworld!");
    expect(onSend).not.toHaveBeenCalled();
    await userEvent.keyboard("{Enter}");
    expect(onSend).toHaveBeenCalledWith({ text: "hello\nworld!", attachments: [], replyTo: undefined });
    await expect.poll(() => field().value).toBe("");
    expect(document.activeElement).toBe(field());
  });

  it("blank input cannot be sent: the button is disabled and Enter does nothing", async () => {
    const { onSend } = setup();
    expect(send()).toBeDisabled();
    field().focus();
    await userEvent.keyboard("   {Enter}");
    expect(onSend).not.toHaveBeenCalled();
    await userEvent.keyboard("x");
    expect(send()).toBeEnabled();
  });

  it("ignores Enter while an IME composition is in progress", () => {
    const { onSend } = setup({ defaultValue: "こんにちは" });
    fireEvent.keyDown(field(), { key: "Enter", isComposing: true });
    fireEvent.keyDown(field(), { key: "Enter", keyCode: 229 });
    expect(onSend).not.toHaveBeenCalled();
    fireEvent.keyDown(field(), { key: "Enter" });
    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it("touch keyboards: Return adds a line, Ctrl+Enter sends, and the hint says to use the button", async () => {
    stubCoarse(true);
    const { onSend } = setup();
    field().focus();
    await userEvent.keyboard("one{Enter}two");
    expect(field().value).toBe("one\ntwo");
    expect(onSend).not.toHaveBeenCalled();
    await userEvent.keyboard("{Control>}{Enter}{/Control}");
    expect(onSend).toHaveBeenCalledTimes(1);
    expect(field()).toHaveAttribute("enterkeyhint", "enter");
    expect(document.getElementById(field().getAttribute("aria-describedby")!)).toHaveTextContent(
      "Use the send button to send",
    );
  });

  it("mouse keyboards: the hint explains Enter / Shift+Enter / Up", () => {
    setup();
    expect(field()).toHaveAttribute("enterkeyhint", "send");
    expect(document.getElementById(field().getAttribute("aria-describedby")!)).toHaveTextContent(
      "Enter to send, Shift + Enter for a new line",
    );
  });

  it("works controlled: value / onValueChange", async () => {
    function Controlled({ onSend }: { onSend: ChatComposerProps["onSend"] }) {
      const [v, setV] = useState("draft ");
      return <ChatComposer value={v} onValueChange={setV} onSend={onSend} />;
    }
    const onSend = vi.fn<(draft: ChatDraft) => void>();
    renderUi(<Controlled onSend={onSend} />);
    expect(field().value).toBe("draft ");
    field().focus();
    field().setSelectionRange(6, 6);
    await userEvent.keyboard("text");
    expect(field().value).toBe("draft text");
    await userEvent.keyboard("{Enter}");
    expect(onSend.mock.calls[0]![0].text).toBe("draft text");
    await expect.poll(() => field().value).toBe("");
  });

  it("quick replies send straight away, and are hidden while editing", async () => {
    const { onSend, rerender } = setup({ quickReplies: ["Thanks!", "On my way"] });
    await userEvent.click(
      within(screen.getByRole("list", { name: "Suggested replies" })).getByRole("button", { name: "On my way" }),
    );
    expect(onSend).toHaveBeenCalledWith({ text: "On my way", attachments: [] });
    expect(document.activeElement).toBe(field());
    rerender(<ChatComposer onSend={onSend} quickReplies={["Thanks!"]} editing={{ id: "m1", text: "old" }} />);
    expect(screen.queryByRole("list", { name: "Suggested replies" })).toBeNull();
  });

  it("disabled: nothing can be typed, sent or attached", () => {
    setup({ disabled: true, quickReplies: ["Hi"], defaultValue: "x" });
    expect(field()).toBeDisabled();
    expect(send()).toBeDisabled();
    expect(screen.getByRole("button", { name: "Attach files" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Emoji" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Hi" })).toBeDisabled();
  });

  it("autoFocus focuses the field; placeholder follows title or prop; labels override strings", () => {
    const view = setup({ autoFocus: true, title: "Riya", labels: { send: "Senden", attach: "Anhang" } });
    expect(document.activeElement).toBe(field());
    expect(field()).toHaveAttribute("placeholder", "Message Riya");
    expect(screen.getByRole("button", { name: "Senden" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Anhang" })).toBeInTheDocument();
    view.rerender(<ChatComposer onSend={vi.fn()} placeholder="Say something" density="compact" />);
    expect(field()).toHaveAttribute("placeholder", "Say something");
  });

  it("grows with its text up to maxRows, then scrolls", async () => {
    setup({ maxRows: 3 });
    const one = field().getBoundingClientRect().height;
    field().focus();
    await userEvent.keyboard("a{Shift>}{Enter}{/Shift}b{Shift>}{Enter}{/Shift}c");
    await expect.poll(() => field().getBoundingClientRect().height).toBeGreaterThan(one);
    expect(field().style.overflowY).toBe("hidden");
    await userEvent.keyboard("{Shift>}{Enter}{/Shift}d{Shift>}{Enter}{/Shift}e{Shift>}{Enter}{/Shift}f");
    await expect.poll(() => field().style.overflowY).toBe("auto");
    expect(field().getBoundingClientRect().height).toBeLessThan(200);
  });
});

describe("edit last / reply / edit", () => {
  it("Up arrow in an empty field asks to edit the last message; not with text, files, modifiers or without a handler", async () => {
    const onEditLast = vi.fn();
    const view = setup({ onEditLast });
    field().focus();
    await userEvent.keyboard("{ArrowUp}");
    expect(onEditLast).toHaveBeenCalledTimes(1);
    await userEvent.keyboard("{Shift>}{ArrowUp}{/Shift}");
    expect(onEditLast).toHaveBeenCalledTimes(1);
    await userEvent.keyboard("x{ArrowUp}");
    expect(onEditLast).toHaveBeenCalledTimes(1);
    await userEvent.keyboard("{Backspace}");
    pick([file("a.txt")]);
    await userEvent.keyboard("{ArrowUp}");
    expect(onEditLast).toHaveBeenCalledTimes(1);
    view.rerender(<ChatComposer onSend={vi.fn()} />);
    pick([]);
  });

  it("reply mode: shows who is being answered with a quote, focuses the field, Escape and the X cancel it", async () => {
    const onCancelReply = vi.fn();
    const nameOf = (id: string) => (id === "riya" ? "Riya" : id);
    const view = setup({ replyTo: { id: "m1", senderId: "riya", text: "Lunch at 1?" }, onCancelReply, nameOf });
    expect(screen.getByText("Replying to Riya")).toBeInTheDocument();
    expect(screen.getByText("Lunch at 1?")).toBeInTheDocument();
    await expect.poll(() => document.activeElement).toBe(field());
    await userEvent.keyboard("{Escape}");
    expect(onCancelReply).toHaveBeenCalledTimes(1);
    await userEvent.click(screen.getByRole("button", { name: "Cancel reply" }));
    expect(onCancelReply).toHaveBeenCalledTimes(2);
    expect(document.activeElement).toBe(field());
    // A reply to a photo describes it.
    view.rerender(
      <ChatComposer
        onSend={vi.fn()}
        replyTo={{ id: "m2", senderId: "riya", attachmentKind: "image" }}
        nameOf={nameOf}
      />,
    );
    expect(await screen.findByText("Photo")).toBeInTheDocument();
  });

  it("sending a reply includes it in the draft", async () => {
    const reply = { id: "m1", senderId: "riya", text: "Lunch?" };
    const { onSend } = setup({ replyTo: reply, nameOf: () => "Riya" });
    await userEvent.type(field(), "Sure{Enter}");
    expect(onSend).toHaveBeenCalledWith({ text: "Sure", attachments: [], replyTo: reply });
  });

  it("Escape with nothing to cancel is left alone", async () => {
    const onCancelReply = vi.fn();
    setup({ onCancelReply });
    field().focus();
    await userEvent.keyboard("{Escape}");
    expect(onCancelReply).not.toHaveBeenCalled();
  });

  it("edit mode: pre-fills the text, Save only enables for a real change, Enter saves, Escape and the X cancel", async () => {
    const onSaveEdit = vi.fn();
    const onCancelEdit = vi.fn();
    const { onSend } = setup({ editing: { id: "m1", text: "Teh plan" }, onSaveEdit, onCancelEdit });
    expect(field().value).toBe("Teh plan");
    expect(screen.getByRole("textbox", { name: "Editing message" })).toBe(field());
    expect(screen.getAllByText("Editing message").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Save changes" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Attach files" })).toBeNull();
    await userEvent.fill(field(), "The plan");
    expect(screen.getByRole("button", { name: "Save changes" })).toBeEnabled();
    await userEvent.keyboard("{Enter}");
    expect(onSaveEdit).toHaveBeenCalledWith("m1", "The plan");
    expect(onSend).not.toHaveBeenCalled();
    await userEvent.keyboard("{Escape}");
    expect(onCancelEdit).toHaveBeenCalledTimes(1);
    await userEvent.click(screen.getByRole("button", { name: "Cancel editing" }));
    expect(onCancelEdit).toHaveBeenCalledTimes(2);
    expect(document.getElementById(field().getAttribute("aria-describedby")!)).toHaveTextContent("Esc to cancel");
  });

  it("an emptied edit cannot be saved, and the unsent draft comes back after editing", async () => {
    const onSaveEdit = vi.fn();
    function Host() {
      const [editing, setEditing] = useState<{ id: string; text: string } | null>(null);
      return (
        <>
          <button onClick={() => setEditing({ id: "m1", text: "original" })}>start</button>
          <ChatComposer
            onSend={vi.fn()}
            defaultValue="my draft"
            editing={editing}
            onSaveEdit={onSaveEdit}
            onCancelEdit={() => setEditing(null)}
          />
        </>
      );
    }
    renderUi(<Host />);
    expect(field().value).toBe("my draft");
    await userEvent.click(screen.getByRole("button", { name: "start" }));
    expect(field().value).toBe("original");
    await userEvent.fill(field(), "");
    expect(screen.getByRole("button", { name: "Save changes" })).toBeDisabled();
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => field().value).toBe("my draft");
  });
});

describe("typing signal", () => {
  it("reports typing once, stops after 4 s idle, on blur, and when the field is emptied; never while editing", async () => {
    const onTyping = vi.fn<(typing: boolean) => void>();
    const view = setup({ onTyping });
    field().focus();
    await userEvent.keyboard("ab");
    expect(onTyping.mock.calls).toEqual([[true]]);
    await userEvent.keyboard("{Backspace}{Backspace}");
    expect(onTyping.mock.calls).toEqual([[true], [false]]);

    await userEvent.keyboard("c");
    expect(onTyping).toHaveBeenLastCalledWith(true);
    field().blur();
    await expect.poll(() => onTyping.mock.lastCall![0]).toBe(false);

    // Idle for 4 s (fake timers just for the wait).
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    fireEvent.change(field(), { target: { value: "cd" } });
    expect(onTyping).toHaveBeenLastCalledWith(true);
    vi.advanceTimersByTime(4100);
    expect(onTyping).toHaveBeenLastCalledWith(false);
    vi.useRealTimers();

    onTyping.mockClear();
    view.rerender(<ChatComposer onSend={vi.fn()} onTyping={onTyping} editing={{ id: "m", text: "x" }} />);
    fireEvent.change(field(), { target: { value: "xy" } });
    expect(onTyping).not.toHaveBeenCalled();
  });

  it("sending ends the typing state", async () => {
    const onTyping = vi.fn<(typing: boolean) => void>();
    setup({ onTyping });
    field().focus();
    await userEvent.keyboard("hi{Enter}");
    expect(onTyping.mock.calls).toEqual([[true], [false]]);
  });
});

describe("attachments", () => {
  it("the attach button opens the file picker; picked files appear as removable previews and are announced", async () => {
    const { onSend } = setup();
    const input = document.querySelector<HTMLInputElement>('input[type="file"]')!;
    expect(input).toHaveAttribute("aria-hidden", "true");
    const click = vi.spyOn(input, "click").mockImplementation(() => undefined);
    await userEvent.click(screen.getByRole("button", { name: "Attach files" }));
    expect(click).toHaveBeenCalledTimes(1);

    pick([file("photo.png", "image/png", 200), file("notes.txt", "text/plain", 2048)]);
    const list = await screen.findByRole("list", { name: "Attachments" });
    expect(within(list).getByRole("img", { name: "photo.png" })).toBeInTheDocument();
    expect(within(list).getByText("notes.txt")).toBeInTheDocument();
    expect(within(list).getByText(/2(\.0)? ?KB/i)).toBeInTheDocument();
    await expect.poll(() => screen.getByRole("status").textContent).toBe("photo.png, notes.txt");
    expect(send()).toBeEnabled(); // files alone can be sent

    await userEvent.click(within(list).getByRole("button", { name: "Remove notes.txt" }));
    await expect.poll(() => screen.getByRole("status").textContent).toBe("Remove notes.txt");
    await expect.poll(() => within(list).queryByText("notes.txt")).toBeNull();
    expect(document.activeElement).toBe(field());

    await userEvent.click(send());
    expect(onSend).toHaveBeenCalledTimes(1);
    const draft = onSend.mock.calls[0]![0];
    expect(draft.text).toBe("");
    expect(draft.attachments).toHaveLength(1);
    expect(draft.attachments[0]).toMatchObject({ name: "photo.png", size: 200, mimeType: "image/png" });
    expect(draft.attachments[0]?.previewUrl).toMatch(/^blob:/);
    await expect.poll(() => screen.queryByRole("list", { name: "Attachments" })).toBeNull();
  });

  it("respects maxAttachments: extra files are dropped and the attach button disables", async () => {
    setup({ maxAttachments: 2, accept: "image/*" });
    expect(document.querySelector('input[type="file"]')).toHaveAttribute("accept", "image/*");
    pick([file("a.txt"), file("b.txt"), file("c.txt")]);
    const list = await screen.findByRole("list", { name: "Attachments" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Attach files" })).toBeDisabled();
    pick([file("d.txt")]);
    expect(within(list).getAllByRole("listitem")).toHaveLength(2);
  });

  it("allowAttachments={false} removes every attachment control", () => {
    setup({ allowAttachments: false });
    expect(screen.queryByRole("button", { name: "Attach files" })).toBeNull();
    expect(document.querySelector('input[type="file"]')).toBeNull();
  });

  it("dropping files on the composer attaches them (with a drop hint while dragging); other drags are ignored", async () => {
    const { container } = setup();
    const zone = container.querySelector<HTMLElement>("form > div")!;
    const drag = (type: string, dt: DataTransfer, init: DragEventInit = {}) =>
      zone.dispatchEvent(new DragEvent(type, { dataTransfer: dt, bubbles: true, cancelable: true, ...init }));

    drag("dragenter", transfer());
    expect(container.querySelector("[aria-hidden].border-dashed")).toBeNull();

    const dt = transfer(file("dropped.txt"));
    drag("dragenter", dt);
    drag("dragover", dt);
    await expect.poll(() => container.querySelector(".border-dashed")).not.toBeNull();
    drag("dragleave", dt, { relatedTarget: document.body });
    await expect.poll(() => container.querySelector(".border-dashed")).toBeNull();
    drag("dragenter", dt);
    drag("drop", dt);
    expect(await screen.findByText("dropped.txt")).toBeInTheDocument();
    expect(container.querySelector(".border-dashed")).toBeNull();
  });

  it("pasting a file attaches it; pasting text (even with a file) stays a normal paste; editing refuses files", async () => {
    const view = setup();
    const paste = (dt: DataTransfer) => {
      const event = new ClipboardEvent("paste", { clipboardData: dt, bubbles: true, cancelable: true });
      field().dispatchEvent(event);
      return event.defaultPrevented;
    };
    expect(paste(transfer(file("shot.png", "image/png")))).toBe(true);
    const withText = transfer(file("x.png", "image/png"));
    withText.setData("text/plain", "caption");
    expect(paste(withText)).toBe(false);
    expect(paste(new DataTransfer())).toBe(false);
    expect(await screen.findAllByRole("listitem")).toHaveLength(1);
    view.rerender(<ChatComposer onSend={vi.fn()} editing={{ id: "m", text: "e" }} />);
    expect(paste(transfer(file("z.png", "image/png")))).toBe(false);
  });
});

describe("emoji + handle", () => {
  it("the emoji button opens a picker; choosing one inserts it at the caret and returns focus to the field", async () => {
    setup({ defaultValue: "ab" });
    field().focus();
    field().setSelectionRange(1, 1);
    fireEvent.select(field());
    await userEvent.click(screen.getByRole("button", { name: "Emoji" }));
    const picker = await screen.findByRole("dialog");
    await userEvent.click(
      within(picker)
        .getAllByRole("button")
        .find((b) => b.hasAttribute("data-emoji-index"))!,
    );
    await expect.poll(() => field().value).toMatch(/^a.+b$/u);
    expect(field().value.length).toBeGreaterThan(2);
    await userEvent.keyboard("{Escape}");
    await settle();
    await expect.poll(() => document.activeElement).toBe(field());
  });

  it("the ref exposes focus(), insert() and the textarea", async () => {
    const ref = createRef<ChatComposerHandle>();
    renderUi(<ChatComposer ref={ref} onSend={vi.fn()} />);
    expect(ref.current!.textarea).toBe(field());
    ref.current!.focus();
    expect(document.activeElement).toBe(field());
    ref.current!.insert("hello");
    await expect.poll(() => field().value).toBe("hello");
    ref.current!.insert(" world");
    await expect.poll(() => field().value).toBe("hello world");
  });

  it("reduced motion still sends and shows attachments", async () => {
    setReducedMotion();
    const { onSend } = setup();
    pick([file("r.txt")]);
    expect(await screen.findByText("r.txt")).toBeInTheDocument();
    field().focus();
    await userEvent.keyboard("ok{Enter}");
    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it("has no axe violations (empty, with a reply, with files)", async () => {
    const view = setup();
    expect(await runAxe()).toHaveNoViolations();
    view.rerender(
      <ChatComposer
        onSend={vi.fn()}
        replyTo={{ id: "m", senderId: "riya", text: "Hi" }}
        nameOf={() => "Riya"}
        quickReplies={["Yes", "No"]}
      />,
    );
    pick([file("f.txt")]);
    await screen.findByText("f.txt");
    await settle();
    expect(await runAxe()).toHaveNoViolations();
  });
});
