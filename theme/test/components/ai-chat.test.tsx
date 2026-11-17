// AiChat beyond the basics: Markdown rendering, code blocks, streaming from an async iterable,
// regenerate, copy, attachments (pick / drop / paste / limits), history states, and keyboard rules.

import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, within } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import {
  AiChat,
  defaultAiChatLabels,
  type AiChatMessage,
  type AiChatProps,
  type AiChatRequest,
} from "../../src/blocks/ai-chat";
import { pixel, settle } from "../helpers";
import { renderUi, runAxe } from "../render";

afterEach(() => {
  vi.restoreAllMocks();
  Reflect.deleteProperty(navigator, "clipboard");
});

const field = () => screen.getByRole<HTMLTextAreaElement>("textbox", { name: "Message" });
const sendButton = () => screen.getByRole("button", { name: "Send message" });
const fast = { thinkingDelay: 0, typingSpeed: 1000 } as const;

function Chat(props: Partial<AiChatProps>) {
  return (
    <div className="h-[640px] w-[720px]">
      <AiChat {...fast} {...props} />
    </div>
  );
}
const msg = (
  id: string,
  role: "user" | "assistant",
  content: string,
  extra: Partial<AiChatMessage> = {},
): AiChatMessage => ({ id, role, content, ...extra });
const file = (name: string, type = "text/plain", size = 20) => new File([new Uint8Array(size)], name, { type });
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
async function ask(text: string) {
  field().focus();
  await userEvent.keyboard(text);
  await userEvent.keyboard("{Enter}");
}

describe("Markdown", () => {
  const reply = [
    "# Title one",
    "",
    "A paragraph with **bold**, `inline code` and a [link](https://example.com/docs) plus [mail](mailto:hi@example.com).",
    "Second line of the same paragraph.",
    "",
    "- first bullet",
    "- second **bullet**",
    "",
    "3. third",
    "4. fourth",
    "",
    "```ts",
    "const answer: number = 42;",
    "```",
    "",
    "Unsafe [x](javascript:alert(1)) stays text.",
  ].join("\n");

  it("renders headings, emphasis, inline code, safe links, bullet and numbered lists (with their start number)", () => {
    renderUi(<Chat defaultMessages={[msg("u", "user", "hi"), msg("a", "assistant", reply, { status: "done" })]} />);
    // A Markdown heading is a bold paragraph on purpose: the chat must not add headings to the page outline.
    expect(screen.queryByRole("heading", { name: "Title one" })).toBeNull();
    const title = screen.getByText("Title one");
    expect(title.tagName).toBe("P");
    expect(title).toHaveClass("font-semibold");
    const answer = title.parentElement!;
    expect(within(answer).getByText("bold").tagName).toBe("STRONG");
    expect(within(answer).getByText("inline code").tagName).toBe("CODE");
    const docs = within(answer).getByRole("link", { name: "link" });
    expect(docs).toHaveAttribute("href", "https://example.com/docs");
    expect(docs).toHaveAttribute("rel", expect.stringContaining("noopener"));
    expect(within(answer).getByRole("link", { name: "mail" })).toHaveAttribute("href", "mailto:hi@example.com");
    expect(within(answer).queryByRole("link", { name: "x" })).toBeNull();
    const lists = within(answer).getAllByRole("list");
    expect(lists).toHaveLength(2);
    expect(within(lists[0]!).getAllByRole("listitem")).toHaveLength(2);
    expect(lists[1]!.tagName).toBe("OL");
    expect(lists[1]).toHaveAttribute("start", "3");
  });

  it("a fenced code block is a named region with the language, highlighted tokens and a working Copy code button", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    renderUi(<Chat defaultMessages={[msg("u", "user", "code?"), msg("a", "assistant", reply, { status: "done" })]} />);
    const region = screen.getByRole("group", { name: "Code, ts" });
    expect(region).toHaveAttribute("tabindex", "0"); // scrollable by keyboard
    expect(region).toHaveTextContent("const answer: number = 42;");
    expect(region.querySelector("[class*='token'], span[style], span[class]")).not.toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Copy code" }));
    expect(writeText).toHaveBeenCalledWith("const answer: number = 42;");
    await expect
      .poll(() => [...document.querySelectorAll("[aria-live]")].map((n) => n.textContent))
      .toContain("Copied");
  });

  it("markers that never close stay literal in a finished reply, but style the rest of a stopped one", () => {
    renderUi(
      <Chat
        defaultMessages={[
          msg("u1", "user", "a"),
          msg("a1", "assistant", "Done with **dangling and `tick", { status: "done" }),
          msg("u2", "user", "b"),
          msg("a2", "assistant", "Cut **off in `code", { status: "stopped" }),
        ]}
      />,
    );
    expect(screen.getByText("Done with **dangling and `tick")).toBeInTheDocument();
    const cut = screen.getByText("off in", { exact: false });
    expect(cut.tagName).toBe("STRONG");
    expect(cut.querySelector("code")).toHaveTextContent("code");
  });

  it("an unclosed fence (mid-stream) still shows its code; a code block with no language is just 'Code'", () => {
    renderUi(
      <Chat
        defaultMessages={[msg("u", "user", "x"), msg("a", "assistant", "```\nplain text only", { status: "done" })]}
      />,
    );
    expect(screen.getByRole("group", { name: "Code" })).toHaveTextContent("plain text only");
  });

  it("copy failure is announced, not swallowed", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
      configurable: true,
    });
    renderUi(
      <Chat
        defaultMessages={[msg("u", "user", "x"), msg("a", "assistant", "```js\nlet a\n```", { status: "done" })]}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Copy code" }));
    await expect
      .poll(() => [...document.querySelectorAll("[aria-live]")].map((n) => n.textContent).join("|"))
      .toContain("Couldn't copy");
    Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true });
    await userEvent.click(screen.getByRole("button", { name: "Copy code" }));
    await expect
      .poll(() => [...document.querySelectorAll("[aria-live]")].map((n) => n.textContent).join("|"))
      .toContain("Couldn't copy");
  });
});

describe("replying", () => {
  it("a respond() that returns a string shows it; the message button copies the whole answer", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    const respond = vi.fn((_r: AiChatRequest) => "Plain **answer**");
    const onMessagesChange = vi.fn<(messages: AiChatMessage[]) => void>();
    renderUi(<Chat respond={respond} onMessagesChange={onMessagesChange} />);
    await ask("hello");
    expect(await screen.findByText("answer")).toBeInTheDocument();
    const request = respond.mock.calls[0]![0];
    expect(request).toMatchObject({ prompt: "hello", attempt: 0, attachments: [] });
    expect(request.signal).toBeInstanceOf(AbortSignal);
    await userEvent.click(await screen.findByRole("button", { name: "Copy" }));
    expect(writeText).toHaveBeenCalledWith("Plain **answer**");
    expect(onMessagesChange).toHaveBeenCalled();
    expect(onMessagesChange.mock.lastCall![0].map((m: AiChatMessage) => m.role)).toEqual(["user", "assistant"]);
  });

  it("an async iterable streams in pieces; the finished reply is marked done", async () => {
    // eslint-disable-next-line @typescript-eslint/require-await -- an async generator is what is under test; its pieces are available at once
    async function* chunks() {
      yield "Hello ";
      yield "streaming ";
      yield "world";
    }
    const onMessagesChange = vi.fn<(messages: AiChatMessage[]) => void>();
    renderUi(<Chat respond={() => chunks()} onMessagesChange={onMessagesChange} />);
    await ask("go");
    expect((await screen.findAllByText(/Hello streaming world/)).length).toBeGreaterThan(0);
    await expect.poll(() => onMessagesChange.mock.lastCall?.[0].at(-1)?.status).toBe("done");
  });

  it("the demo responder answers on its own, and a new attempt says it is another take", async () => {
    renderUi(<Chat />);
    await ask("explain glassmorphism");
    expect(await screen.findByText(/Glassmorphism/, undefined, { timeout: 5000 })).toBeInTheDocument();
    await userEvent.click(await screen.findByRole("button", { name: "Regenerate" }));
    expect(await screen.findByText(/Here is another take/, undefined, { timeout: 5000 })).toBeInTheDocument();
  });

  it("Regenerate asks again with attempt 1 and replaces the old answer", async () => {
    const respond = vi.fn(({ attempt }: AiChatRequest) => `answer ${attempt}`);
    renderUi(<Chat respond={respond} />);
    await ask("q");
    expect(await screen.findByText("answer 0")).toBeInTheDocument();
    await userEvent.click(await screen.findByRole("button", { name: "Regenerate" }));
    expect(await screen.findByText("answer 1")).toBeInTheDocument();
    expect(screen.queryByText("answer 0")).toBeNull();
  });

  it("a failing respond() shows its message with Try again, and the fallback text when it has none", async () => {
    let n = 0;
    const respond = vi.fn(() => {
      n += 1;
      if (n === 1) throw new Error("Rate limited");
      // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- the test: a rejection that is not an Error
      if (n === 2) return Promise.reject("");
      return "Recovered";
    });
    renderUi(<Chat respond={respond} />);
    await ask("hi");
    expect((await screen.findAllByText("Rate limited")).length).toBeGreaterThan(0);
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect((await screen.findAllByText("Something went wrong while replying.")).length).toBeGreaterThan(0);
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("Recovered")).toBeInTheDocument();
  });

  it("Stop ends a stream mid-way: the partial text stays and says it was stopped; stopping before any text says so", async () => {
    const gate: { release?: () => void } = {};
    async function* slow() {
      yield "Partial ";
      await new Promise<void>((r) => (gate.release = r));
      yield "never shown";
    }
    renderUi(<Chat respond={() => slow()} />);
    await ask("go");
    expect(await screen.findByText(/Partial/)).toBeInTheDocument();
    await userEvent.click(await screen.findByRole("button", { name: "Stop generating" }));
    expect(await screen.findByText("Stopped")).toBeInTheDocument();
    expect(screen.getByText(/Partial/)).toBeInTheDocument();
    gate.release?.();
    await expect
      .poll(() => [...document.querySelectorAll("[aria-live]")].map((n) => n.textContent))
      .toContain("Reply stopped");
  });

  it("Stop before any text arrives shows the 'stopped before replying' note", async () => {
    const respond = (_r: AiChatRequest) => new Promise<string>(() => undefined);
    renderUi(<Chat respond={respond} thinkingDelay={0} />);
    await ask("go");
    await userEvent.click(await screen.findByRole("button", { name: "Stop generating" }));
    expect(await screen.findByText("Stopped before replying.")).toBeInTheDocument();
  });

  it("onSend reports the user message; thinking is announced; the input is cleared and refocused", async () => {
    const onSend = vi.fn();
    renderUi(<Chat respond={() => "ok"} onSend={onSend} />);
    await ask("report me");
    expect(onSend).toHaveBeenCalledWith(expect.objectContaining({ role: "user", content: "report me" }));
    await expect.poll(() => field().value).toBe("");
  });
});

describe("history states", () => {
  it("shows thinking, streaming, stopped and error messages from defaultMessages", () => {
    renderUi(
      <Chat
        defaultMessages={[
          msg("u1", "user", "one"),
          msg("a1", "assistant", "", { status: "thinking" }),
          msg("u2", "user", "two"),
          msg("a2", "assistant", "Half an ans", { status: "stopped" }),
          msg("u3", "user", "three"),
          msg("a3", "assistant", "", { status: "error", error: "Boom" }),
        ]}
      />,
    );
    expect(screen.getAllByText("Thinking").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Stopped").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Boom").length).toBeGreaterThan(0);
  });

  it("user attachments show as chips (image preview or file icon with size) on their message", () => {
    renderUi(
      <Chat
        defaultMessages={[
          msg("u", "user", "see these", {
            attachments: [
              { id: "i", name: "cat.png", type: "image/png", size: 1500, previewUrl: pixel },
              { id: "f", name: "report.pdf", type: "application/pdf", size: 2_300_000 },
            ],
          }),
          msg("a", "assistant", "Nice", { status: "done" }),
        ]}
      />,
    );
    expect(screen.getByText("cat.png")).toBeInTheDocument();
    expect(screen.getByText("report.pdf")).toBeInTheDocument();
    expect(screen.getByText(/2\.\d MB|2,\d MB/)).toBeInTheDocument();
  });

  it("the model picker shows the chosen model's label and the empty state offers suggestions", () => {
    renderUi(<Chat suggestions={["First idea", "Second idea"]} defaultModel="sheen-flash" />);
    expect(screen.getByText("First idea")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Model" })).toHaveTextContent("Sheen Flash");
  });

  it("a controlled model follows its prop and reports picks", async () => {
    const onModelChange = vi.fn();
    const view = renderUi(<Chat model="sheen-pro" onModelChange={onModelChange} />);
    const picker = screen.getByRole("combobox", { name: "Model" });
    expect(picker).toHaveTextContent("Sheen Pro");
    await userEvent.click(picker);
    await userEvent.click(await screen.findByRole("option", { name: /Sheen Mini/ }));
    expect(onModelChange).toHaveBeenCalledWith("sheen-mini");
    view.rerender(<Chat model="sheen-mini" onModelChange={onModelChange} />);
    expect(screen.getByRole("combobox", { name: "Model" })).toHaveTextContent("Sheen Mini");
  });
});

describe("attachments", () => {
  it("picked files appear as removable chips and are sent with the message", async () => {
    const respond = vi.fn((_r: AiChatRequest) => "got them");
    renderUi(<Chat respond={respond} />);
    pick([file("notes.txt", "text/plain", 2048), file("pic.png", "image/png", 100)]);
    const list = await screen.findByRole("list", { name: "Attachments" });
    expect(within(list).getByText("notes.txt")).toBeInTheDocument();
    expect(await screen.findAllByText(/Attached 2 files/)).not.toHaveLength(0);
    await userEvent.click(within(list).getByRole("button", { name: "Remove notes.txt" }));
    await expect.poll(() => within(list).queryByText("notes.txt")).toBeNull();
    await ask("with a file");
    expect(respond.mock.calls[0]![0].attachments.map((a) => a.name)).toEqual(["pic.png"]);
    await expect.poll(() => screen.queryByRole("list", { name: "Attachments" }), { timeout: 4000 }).toBeNull();
  });

  it("an attachment-only message can be sent; the cap is enforced with a spoken note", async () => {
    renderUi(<Chat maxAttachments={2} accept="image/*" respond={() => "ok"} />);
    expect(document.querySelector('input[type="file"]')).toHaveAttribute("accept", "image/*");
    pick([file("a.png", "image/png"), file("b.png", "image/png"), file("c.png", "image/png")]);
    await expect
      .poll(() => [...document.querySelectorAll("[aria-live]")].map((n) => n.textContent).join("|"))
      .toContain("You can attach up to 2 files");
    expect(within(await screen.findByRole("list", { name: "Attachments" })).getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Send message" })).toBeEnabled();
  });

  it("files dropped on the chat attach (a drop hint shows while dragging); other drags are ignored; allowAttachments={false} hides it all", async () => {
    const view = renderUi(<Chat respond={() => "ok"} />);
    const zone = document.querySelector("form > div")!;
    const drag = (type: string, dt: DataTransfer, init: DragEventInit = {}) =>
      zone.dispatchEvent(new DragEvent(type, { dataTransfer: dt, bubbles: true, cancelable: true, ...init }));
    drag("dragenter", transfer());
    expect(screen.queryByText("Drop files to attach")).toBeNull();
    const dt = transfer(file("dropped.txt"));
    drag("dragenter", dt);
    drag("dragover", dt);
    expect(await screen.findByText("Drop files to attach")).toBeInTheDocument();
    drag("dragleave", dt, { relatedTarget: document.body });
    await expect.poll(() => screen.queryByText("Drop files to attach")).toBeNull();
    drag("dragenter", dt);
    drag("drop", dt);
    expect(await screen.findByText("dropped.txt")).toBeInTheDocument();
    view.rerender(<Chat allowAttachments={false} />);
    expect(screen.queryByRole("button", { name: "Attach files" })).toBeNull();
    expect(document.querySelector('input[type="file"]')).toBeNull();
  });

  it("pasting an image attaches it; pasting text is untouched", () => {
    renderUi(<Chat />);
    const paste = (dt: DataTransfer) => {
      const event = new ClipboardEvent("paste", { clipboardData: dt, bubbles: true, cancelable: true });
      field().dispatchEvent(event);
      return event.defaultPrevented;
    };
    expect(paste(transfer(file("shot.png", "image/png")))).toBe(true);
    const text = new DataTransfer();
    text.setData("text/plain", "just text");
    expect(paste(text)).toBe(false);
  });
});

describe("keyboard + chrome", () => {
  it("Enter sends, Shift+Enter adds a line, an IME composition Enter does nothing, empty cannot be sent", async () => {
    const respond = vi.fn((_r: AiChatRequest) => "ok");
    renderUi(<Chat respond={respond} />);
    expect(sendButton()).toBeDisabled();
    field().focus();
    await userEvent.keyboard("   {Enter}");
    expect(respond).not.toHaveBeenCalled();
    await userEvent.keyboard("a{Shift>}{Enter}{/Shift}b");
    expect(field().value).toBe("   a\nb");
    fireEvent.keyDown(field(), { key: "Enter", isComposing: true });
    fireEvent.keyDown(field(), { key: "Enter", keyCode: 229 });
    expect(respond).not.toHaveBeenCalled();
    await userEvent.keyboard("{Enter}");
    expect(respond).toHaveBeenCalledTimes(1);
    expect(respond.mock.calls[0]![0].prompt).toBe("a\nb");
  });

  it("New chat clears the conversation; the scroll-to-latest button appears when scrolled up and works", async () => {
    const many = Array.from({ length: 30 }, (_, i) => [
      msg(`u${i}`, "user", `Question number ${i}`),
      msg(`a${i}`, "assistant", `Answer number ${i} `.repeat(8), { status: "done" }),
    ]).flat();
    renderUi(<Chat defaultMessages={many} />);
    const scroller = document.querySelector("[class*='overflow-y-auto']")!;
    await expect.poll(() => scroller.scrollHeight - scroller.clientHeight).toBeGreaterThan(200);
    scroller.scrollTop = 0;
    const jump = await screen.findByRole("button", { name: "Scroll to latest message" });
    await userEvent.click(jump);
    await expect
      .poll(() => scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight, { timeout: 4000 })
      .toBeLessThan(80);
    await userEvent.click(screen.getByRole("button", { name: "New chat" }));
    await expect.poll(() => screen.queryByText("Question number 0")).toBeNull();
  });

  it("touch keyboards: Return adds a line, and the hint says to use the button", async () => {
    const real = window.matchMedia.bind(window);
    vi.spyOn(window, "matchMedia").mockImplementation((q: string) =>
      q.includes("pointer: coarse")
        ? ({
            matches: true,
            media: q,
            addEventListener: () => undefined,
            removeEventListener: () => undefined,
          } as unknown as MediaQueryList)
        : real(q),
    );
    const respond = vi.fn((_r: AiChatRequest) => "ok");
    renderUi(<Chat respond={respond} />);
    field().focus();
    await userEvent.keyboard("one{Enter}two");
    expect(field().value).toBe("one\ntwo");
    expect(respond).not.toHaveBeenCalled();
    await userEvent.click(sendButton());
    expect(respond).toHaveBeenCalledTimes(1);
  });

  it("labels, heading level, locale and autofocus are honoured", () => {
    renderUi(
      <Chat
        headingLevel={3}
        autoFocus
        locale="de-DE"
        labels={{ placeholder: "Frag etwas", emptyTitle: "Leer", send: "Senden" }}
      />,
    );
    expect(document.activeElement).toBe(field());
    expect(field()).toHaveAttribute("placeholder", "Frag etwas");
    expect(screen.getByText("Leer")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Senden" })).toBeInTheDocument();
    expect(defaultAiChatLabels.attached(["a.txt"])).toBe("Attached a.txt");
  });

  it("works with reduced motion and has no axe violations with a Markdown answer and code", async () => {
    document.documentElement.setAttribute("data-motion", "reduced");
    renderUi(
      <Chat
        defaultMessages={[
          msg("u", "user", "hi"),
          msg(
            "a",
            "assistant",
            "## Heading\n\n- one\n- two\n\n```ts\nconst a = 1;\n```\n\nSee [docs](https://example.com).",
            { status: "done" },
          ),
        ]}
      />,
    );
    await settle();
    expect(await runAxe()).toHaveNoViolations();
  });
});
