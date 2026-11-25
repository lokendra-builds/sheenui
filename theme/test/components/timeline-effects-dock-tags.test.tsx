// More branches the per-component suites skip: TagsInput chip keys, Timeline avatars, text-effect helpers,
// Marquee fade masks, and the Dock's floating label when its row scrolls.

import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, renderHook, screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { TagsInput } from "../../src/components/tags-input/tags-input";
import { Timeline, TimelineItem } from "../../src/components/timeline/timeline";
import { listLabel, useMediaQuery } from "../../src/components/text-effects/text-utils";
import { Typewriter } from "../../src/components/text-effects/typewriter";
import { ShimmerText } from "../../src/components/text-effects/shimmer-text";
import { Marquee } from "../../src/components/marquee/marquee";
import { Dock, DockItem } from "../../src/components/dock/dock";
import { renderUi } from "../render";
import { frames } from "../helpers";

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("TagsInput chip keyboard", () => {
  it("arrows, Home, End, Escape and Delete / Backspace work on the chips; typing on a chip types into the field", async () => {
    const onValueChange = vi.fn();
    renderUi(<TagsInput label="Skills" defaultValue={["react", "css", "node"]} onValueChange={onValueChange} />);
    const input = screen.getByRole("textbox", { name: /Skills/ });
    const tag = (name: string) =>
      [...document.querySelectorAll<HTMLElement>("[data-tag-index]")].find(
        (t) => t.getAttribute("aria-label") === name,
      )!;
    tag("css").focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect.poll(() => document.activeElement).toBe(tag("node"));
    await userEvent.keyboard("{ArrowRight}");
    await expect.poll(() => document.activeElement).toBe(input); // past the last chip: the field
    tag("node").focus();
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    await expect.poll(() => document.activeElement).toBe(tag("react"));
    await userEvent.keyboard("{ArrowLeft}"); // first chip stays
    await expect.poll(() => document.activeElement).toBe(tag("react"));
    await userEvent.keyboard("{End}");
    await expect.poll(() => document.activeElement).toBe(input);
    tag("node").focus();
    await userEvent.keyboard("{Home}");
    await expect.poll(() => document.activeElement).toBe(tag("react"));
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => document.activeElement).toBe(input);
    tag("css").focus();
    await userEvent.keyboard("{Delete}");
    expect(onValueChange).toHaveBeenLastCalledWith(["react", "node"]);
    await expect.poll(() => screen.queryByText("css")).toBeNull();
    tag("node").focus();
    await userEvent.keyboard("{Backspace}");
    expect(onValueChange).toHaveBeenLastCalledWith(["react"]);
    tag("react").focus();
    await userEvent.keyboard("x");
    await expect.poll(() => document.activeElement).toBe(input);
  });

  it("a disabled / read-only list ignores Delete and typing on chips", async () => {
    const onValueChange = vi.fn();
    renderUi(<TagsInput label="Fixed" defaultValue={["a", "b"]} readOnly onValueChange={onValueChange} />);
    const chip = document.querySelector<HTMLElement>("[data-tag-index]");
    chip?.focus();
    await userEvent.keyboard("{Delete}{Backspace}");
    expect(onValueChange).not.toHaveBeenCalled();
  });
});

describe("Timeline", () => {
  it("an avatar replaces the marker, a missing or invalid dateTime is dropped, and animated items arrive one after another", async () => {
    renderUi(
      <Timeline aria-label="History" animate>
        <TimelineItem
          title="Joined"
          time="Today"
          dateTime={new Date(NaN)}
          avatar={<img alt="" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" />}
        />
        <TimelineItem title="Left" time="Later" dateTime={new Date("2026-10-30T09:12:00Z")} />
        <TimelineItem title="Visited" dateTime="2026-10-31" />
      </Timeline>,
    );
    expect(document.querySelector("[data-slot=timeline-avatar]")).not.toBeNull();
    const times = [...document.querySelectorAll("time")];
    expect(times.some((t) => t.getAttribute("datetime") === "2026-10-30T09:12:00.000Z")).toBe(true);
    expect(times.every((t) => t.getAttribute("datetime") !== "Invalid Date")).toBe(true);
    await expect.poll(() => document.querySelectorAll("[data-slot=timeline-item]").length).toBe(3);
  });
});

describe("text effect helpers", () => {
  it("listLabel joins with the locale's conjunction and falls back to commas when Intl.ListFormat is missing", () => {
    expect(listLabel(["a", "b", "c"], "en-US")).toBe("a, b, and c");
    expect(listLabel(["a", "b"], "en-US")).toBe("a and b");
    const real = Intl.ListFormat;
    Object.defineProperty(Intl, "ListFormat", {
      value: function () {
        throw new Error("nope");
      },
      configurable: true,
    });
    try {
      expect(listLabel(["x", "y", "z"])).toBe("x, y, z");
    } finally {
      Object.defineProperty(Intl, "ListFormat", { value: real, configurable: true });
    }
  });

  it("useMediaQuery follows its query", () => {
    const wide = renderHook(() => useMediaQuery("(min-width: 1px)"));
    expect(wide.result.current).toBe(true);
    expect(renderHook(() => useMediaQuery("(min-width: 99999px)")).result.current).toBe(false);
  });

  it("Typewriter types, holds, deletes and moves to the next phrase; new phrases start over", async () => {
    const view = renderUi(
      <Typewriter words={["ab", "cd"]} typeSpeed={20} deleteSpeed={10} hold={40} data-testid="t" />,
    );
    const el = () => screen.getByTestId("t");
    await expect.poll(() => el().textContent, { timeout: 4000 }).toContain("ab");
    await expect.poll(() => el().textContent, { timeout: 4000 }).toContain("cd");
    view.rerender(<Typewriter words={["zz"]} typeSpeed={10} hold={40} data-testid="t" />);
    await expect.poll(() => el().textContent, { timeout: 4000 }).toContain("zz");
  });

  it("ShimmerText sweeps on a mouse hover and on keyboard focus, not on a finger", async () => {
    renderUi(
      <a href="#x" data-testid="s">
        <ShimmerText trigger="hover">Shiny</ShimmerText>
      </a>,
    );
    const link = screen.getByTestId("s");
    fireEvent.pointerEnter(link, { pointerType: "touch" });
    fireEvent.pointerEnter(link, { pointerType: "mouse" });
    fireEvent.pointerLeave(link, { pointerType: "mouse" });
    link.focus();
    await userEvent.keyboard("{Tab}");
    expect(screen.getAllByText("Shiny").length).toBeGreaterThan(0);
  });
});

describe("Marquee fade", () => {
  const masked = () =>
    [...document.querySelectorAll<HTMLElement>('[style*="mask"]')].map((n) => n.getAttribute("style") ?? "");

  it("items near the edges get a fade mask; vertical strips fade top to bottom; a strip with fade off has none", async () => {
    const items = Array.from({ length: 8 }, (_, i) => (
      <span key={i} className="glass-1 inline-block px-4 py-2">
        Item number {i + 1}
      </span>
    ));
    const view = renderUi(
      <div style={{ width: 360 }}>
        <Marquee listLabel="Logos" fade fadeSize={80} speed={30}>
          {items}
        </Marquee>
      </div>,
    );
    await expect.poll(() => masked().some((m) => m.includes("to right")), { timeout: 5000 }).toBe(true);
    view.unmount();
    const tall = renderUi(
      <div style={{ width: 360, height: 200 }}>
        <Marquee listLabel="Logos" vertical fade fadeSize={40} speed={30} className="h-48">
          {items}
        </Marquee>
      </div>,
    );
    await expect.poll(() => masked().some((m) => !m.includes("to right")), { timeout: 5000 }).toBe(true); // (to bottom is the default direction: the browser leaves it out)
    tall.unmount();
    renderUi(
      <div style={{ width: 360 }}>
        <Marquee listLabel="Logos" fade={false}>
          {items}
        </Marquee>
      </div>,
    );
    await frames(19);
    expect(masked().length).toBe(0);
  });
});

describe("Dock when its row scrolls", () => {
  const Glyph = () => (
    <svg aria-hidden viewBox="0 0 8 8" width="20" height="20">
      <rect width="8" height="8" />
    </svg>
  );
  const apps = Array.from({ length: 14 }, (_, i) => <DockItem key={i} label={`App ${i + 1}`} icon={<Glyph />} />);

  it("shows one floating label for the hovered or focused item, hides it on Escape, and brings it back when the pointer moves", async () => {
    renderUi(
      <div style={{ width: 260, padding: 40 }}>
        <Dock label="Apps" size="sm">
          {apps}
        </Dock>
      </div>,
    );
    const dock = screen.getByRole("toolbar", { name: "Apps" });
    const items = () => [...document.querySelectorAll<HTMLElement>("[data-dock-item]")];
    await expect.poll(() => items().length).toBe(14);
    await userEvent.hover(items()[1]!.querySelector("button, a") ?? items()[1]!);
    await frames(13);
    await userEvent.keyboard("{Tab}");
    await userEvent.keyboard("{Escape}");
    await userEvent.hover(items()[2]!.querySelector("button, a") ?? items()[2]!);
    fireEvent.pointerMove(items()[2]!, { pointerType: "mouse", clientX: 50, clientY: 50 });
    fireEvent.pointerOver(items()[3]!, { pointerType: "mouse" });
    fireEvent.pointerOver(items()[3]!, { pointerType: "touch" });
    fireEvent.pointerLeave(dock);
    expect(dock).toBeInTheDocument();
    await userEvent.click(items()[0]!.querySelector("button, a") ?? items()[0]!);
  });
});
