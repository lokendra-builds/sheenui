// The controlled / uncontrolled pairs added for integrators: Tooltip open, AiChat messages + isTyping,
// Pricing compareOpen, DataTable defaults, Progress max.

import { expect, it, vi } from "vitest";
import { useState } from "react";
import { screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { AiChat, type AiChatMessage } from "../../src/blocks/ai-chat";
import { Button } from "../../src/components/button/button";
import { Progress } from "../../src/components/progress/progress";
import { Tooltip } from "../../src/components/tooltip/tooltip";
import { parkPointer, settle } from "../helpers";
import { renderUi } from "../render";

const msg = (id: string, role: "user" | "assistant", content: string): AiChatMessage => ({ id, role, content });

it("Tooltip: open={true} shows it without hover, and onOpenChange reports Escape", async () => {
  await parkPointer();
  const onOpenChange = vi.fn();
  function Controlled() {
    const [open, setOpen] = useState(true);
    return (
      <Tooltip
        content="Pinned hint"
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          onOpenChange(o);
        }}
      >
        <Button>Trigger</Button>
      </Tooltip>
    );
  }
  renderUi(<Controlled />);
  await expect.poll(() => screen.queryByText("Pinned hint")).not.toBeNull();
  await userEvent.keyboard("{Escape}");
  await expect.poll(() => onOpenChange.mock.calls.some((c) => c[0] === false)).toBe(true);
  await expect.poll(() => screen.queryByText("Pinned hint")).toBeNull();
});

it("Tooltip: defaultOpen starts open (uncontrolled) and disabled never shows it", async () => {
  await parkPointer();
  const { unmount } = renderUi(
    <Tooltip content="Starts open" defaultOpen>
      <Button>A</Button>
    </Tooltip>,
  );
  await expect.poll(() => screen.queryByText("Starts open")).not.toBeNull();
  unmount();
  renderUi(
    <Tooltip content="Never" disabled delay={0}>
      <Button>B</Button>
    </Tooltip>,
  );
  await userEvent.tab();
  await settle();
  expect(screen.queryByText("Never")).toBeNull();
});

it("AiChat: controlled messages show, a new array replaces them, and loading history is not reported", async () => {
  const onMessagesChange = vi.fn();
  const { rerender } = renderUi(
    <div className="h-[640px] w-[720px]">
      <AiChat
        messages={[msg("1", "user", "First question"), msg("2", "assistant", "First answer")]}
        onMessagesChange={onMessagesChange}
      />
    </div>,
  );
  expect(screen.getByText("First answer")).toBeInTheDocument();
  rerender(
    <div className="h-[640px] w-[720px]">
      <AiChat
        messages={[msg("3", "user", "Other thread"), msg("4", "assistant", "Other answer")]}
        onMessagesChange={onMessagesChange}
      />
    </div>,
  );
  expect(screen.getByText("Other answer")).toBeInTheDocument();
  expect(screen.queryByText("First answer")).toBeNull();
  await settle();
  expect(onMessagesChange).not.toHaveBeenCalled();
});

it("AiChat: sending a message reports the settled conversation through onMessagesChange", async () => {
  const onMessagesChange = vi.fn();
  renderUi(
    <div className="h-[640px] w-[720px]">
      <AiChat
        messages={[]}
        respond={() => "Hello back"}
        thinkingDelay={0}
        typingSpeed={1000}
        onMessagesChange={onMessagesChange}
      />
    </div>,
  );
  await userEvent.fill(screen.getByRole("textbox", { name: "Message" }), "Hi");
  await userEvent.keyboard("{Enter}");
  await expect.poll(() => onMessagesChange.mock.calls.length, { timeout: 10_000 }).toBeGreaterThan(0);
  const last = onMessagesChange.mock.calls.at(-1)![0] as AiChatMessage[];
  expect(last.map((m) => m.role)).toEqual(["user", "assistant"]);
  expect(last[1]!.content).toBe("Hello back");
});

it("AiChat: isTyping shows the assistant's thinking row and removing it takes it away", () => {
  const { rerender } = renderUi(
    <div className="h-[640px] w-[720px]">
      <AiChat messages={[msg("1", "user", "Question")]} isTyping />
    </div>,
  );
  expect(screen.getAllByText(/thinking/i).length).toBeGreaterThan(0);
  rerender(
    <div className="h-[640px] w-[720px]">
      <AiChat messages={[msg("1", "user", "Question")]} isTyping={false} />
    </div>,
  );
  expect(screen.queryAllByText(/thinking/i)).toHaveLength(0);
});

it("Progress: max scales the value (50 of 200 is 25%) and keeps the percentage text honest", () => {
  renderUi(<Progress value={50} max={200} label="Upload" locale="en-US" />);
  const bar = screen.getByRole("progressbar", { name: "Upload" });
  expect(bar).toHaveAttribute("aria-valuemax", "200");
  expect(screen.getByText("25%")).toBeInTheDocument();
});
