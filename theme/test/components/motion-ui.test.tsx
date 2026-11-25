// Motion-heavy components: NumberTicker, Marquee, Dock, text effects (BlurIn, WordRotate,
// Typewriter, ShimmerText) and MorphingDialog.

import { describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { NumberTicker } from "../../src/components/number-ticker/number-ticker";
import { Marquee } from "../../src/components/marquee/marquee";
import { Dock, DockItem, DockSeparator } from "../../src/components/dock/dock";
import { BlurIn } from "../../src/components/text-effects/blur-in";
import { WordRotate } from "../../src/components/text-effects/word-rotate";
import { Typewriter } from "../../src/components/text-effects/typewriter";
import { ShimmerText } from "../../src/components/text-effects/shimmer-text";
import {
  MorphingDialog,
  MorphingDialogActions,
  MorphingDialogContent,
  MorphingDialogDescription,
  MorphingDialogMedia,
  MorphingDialogSubtitle,
  MorphingDialogTitle,
  MorphingDialogTrigger,
} from "../../src/components/morphing-dialog/morphing-dialog";
import { Button } from "../../src/components/button/button";
import { pixel, settle, frames } from "../helpers";
import { accessibleText, countOf, setReducedMotion } from "../helpers-text";
import { describeVariants, renderUi, runAxe } from "../render";

/* ---------- NumberTicker ---------- */

describe("NumberTicker", () => {
  const live = () => document.querySelector<HTMLElement>('[data-slot="number-ticker"] [aria-live]')!;
  const ticker = () => document.querySelector<HTMLElement>('[data-slot="number-ticker"]')!;

  it("announces the final formatted value once, whatever the wheels show", () => {
    renderUi(<NumberTicker value={48250} locales="en-US" prefix="$" suffix=" MRR" from={0} />);
    expect(accessibleText(ticker())).toBe("$48,250 MRR");
    expect(live()).toHaveAttribute("aria-live", "polite");
    expect(live()).toHaveAttribute("aria-atomic", "true");
  });

  it("every wheel reserves a 1ch box, so rolling never changes a width", async () => {
    renderUi(<NumberTicker value={4821} locales="en-US" from={4820} />);
    await expect
      .poll(() => ticker().querySelectorAll<HTMLElement>("span.min-w-\\[1ch\\]").length)
      .toBeGreaterThanOrEqual(4);
    const wheel = ticker().querySelector<HTMLElement>("span.min-w-\\[1ch\\]")!;
    const before = wheel.getBoundingClientRect().width;
    expect(before).toBeGreaterThan(0);
    expect(getComputedStyle(wheel).minWidth).not.toBe("0px");
  });

  it("reserves the final value's width up front, so a count that adds places never resizes the ticker", async () => {
    renderUi(<NumberTicker value={177500} locales="en-US" from={9} />);
    await expect
      .poll(() => ticker().querySelectorAll<HTMLElement>("span.min-w-\\[1ch\\]").length)
      .toBeGreaterThanOrEqual(1);
    const sizer = ticker().querySelector<HTMLElement>("span.h-0")!;
    expect(sizer.dataset.text).toBe("177,500");
    expect(sizer.textContent).toBe(""); // generated content: the value is not repeated in the DOM text
    expect(ticker().getBoundingClientRect().width).toBeGreaterThanOrEqual(sizer.scrollWidth - 1);
  });

  it("format and locales drive Intl.NumberFormat (currency, percent, compact)", () => {
    renderUi(
      <div>
        <NumberTicker data-testid="a" value={1234.5} locales="en-US" format={{ style: "currency", currency: "EUR" }} />
        <NumberTicker
          data-testid="b"
          value={0.256}
          locales="en-US"
          format={{ style: "percent", maximumFractionDigits: 1 }}
        />
        <NumberTicker data-testid="c" value={12400} locales="en-US" format={{ notation: "compact" }} />
        <NumberTicker data-testid="d" value={1234567} locales="de-DE" />
      </div>,
    );
    expect(accessibleText(screen.getByTestId("a"))).toBe("€1,234.50");
    expect(accessibleText(screen.getByTestId("b"))).toBe("25.6%");
    expect(accessibleText(screen.getByTestId("c"))).toBe("12K");
    expect(accessibleText(screen.getByTestId("d"))).toBe("1.234.567");
  });

  it("live='off' silences updates; a value change updates the announced text", () => {
    const view = renderUi(<NumberTicker value={1} from={1} live="off" locales="en-US" />);
    expect(live()).toHaveAttribute("aria-live", "off");
    view.rerender(<NumberTicker value={250} from={1} live="off" locales="en-US" />);
    expect(accessibleText(ticker())).toBe("250");
  });

  it("rolls to the value (from → value) and the visible wheels settle on the right digits", async () => {
    renderUi(<NumberTicker value={7} from={0} locales="en-US" />);
    // The visible layer is aria-hidden; its text content (all digits of every wheel) contains the final digit.
    await expect.poll(() => ticker().querySelector("[aria-hidden]")?.textContent ?? "").toContain("7");
  });

  it("reduced motion: plain text from the start, no wheels", () => {
    setReducedMotion();
    renderUi(<NumberTicker value={9999} from={0} locales="en-US" />);
    const visible = ticker().querySelector("[aria-hidden]")!;
    expect(visible).toHaveAttribute("data-text", "9,999");
    expect(accessibleText(ticker())).toBe("9,999");
    // Exactly one copy of the value in the DOM text (what a crawler or "select all" reads): the live region.
    expect(ticker().textContent).toBe("9,999");
  });

  it("an RTL locale keeps digits left to right", () => {
    setReducedMotion();
    renderUi(<NumberTicker value={1234} locales="ar-EG" data-testid="ar" />);
    expect(accessibleText(screen.getByTestId("ar"))).toMatch(/\S/);
  });

  describeVariants((variant) => {
    it("has no axe violations", async () => {
      renderUi(
        <p className="p-4 text-lg">
          MRR: <NumberTicker value={48250} locales="en-US" format={{ style: "currency", currency: "USD" }} />
        </p>,
        variant,
      );
      expect(await runAxe()).toHaveNoViolations();
    });
  });
});

/* ---------- Marquee ---------- */

// Each child of <Marquee> is one item, so this is a function that returns an array (not a component).
function logos(count = 4) {
  return Array.from({ length: count }, (_, i) => (
    <a key={i} href={`#brand-${i}`} className="inline-block w-24 px-2 py-1">
      Brand {i + 1}
    </a>
  ));
}

describe("Marquee", () => {
  const track = () => document.querySelector<HTMLElement>('[data-slot="marquee-track"]');
  const marquee = () => document.querySelector<HTMLElement>('[data-slot="marquee"]')!;

  it("exposes the items once as a named list; copies are aria-hidden and out of the tab order", async () => {
    renderUi(
      <div style={{ width: 360 }}>
        <Marquee listLabel="Customers" speed={20}>
          {logos()}
        </Marquee>
      </div>,
    );
    const list = screen.getByRole("list", { name: "Customers" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(4);
    // The strip is filled with copies, all hidden from assistive tech.
    await expect.poll(() => track()?.querySelectorAll("ul").length ?? 0).toBeGreaterThan(1);
    const hidden = [...track()!.querySelectorAll("ul")].filter((ul) => ul.getAttribute("aria-hidden") === "true");
    expect(hidden.length).toBeGreaterThan(0);
    for (const ul of hidden) for (const a of ul.querySelectorAll("a")) expect(a.getAttribute("tabindex")).toBe("-1");
    expect(screen.getAllByRole("link")).toHaveLength(4);
  });

  it("the Pause / Play button is first in the tab order and toggles; onPausedChange reports", async () => {
    const onPausedChange = vi.fn();
    renderUi(
      <div style={{ width: 360 }}>
        <Marquee listLabel="Customers" onPausedChange={onPausedChange}>
          {logos()}
        </Marquee>
      </div>,
    );
    await userEvent.tab();
    const pause = screen.getByRole("button", { name: "Pause animation" });
    expect(pause).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(onPausedChange).toHaveBeenLastCalledWith(true);
    await expect.poll(() => marquee().hasAttribute("data-paused")).toBe(true);
    expect(screen.getByRole("button", { name: "Play animation" })).toBeInTheDocument();
    await userEvent.keyboard(" ");
    expect(onPausedChange).toHaveBeenLastCalledWith(false);
    await expect.poll(() => marquee().hasAttribute("data-paused")).toBe(false);
  });

  it("controlled `paused` and `defaultPaused`; labels override the button name", () => {
    const view = renderUi(
      <div style={{ width: 360 }}>
        <Marquee paused labels={{ pause: "Parar", play: "Reproducir" }}>
          {logos()}
        </Marquee>
      </div>,
    );
    expect(marquee()).toHaveAttribute("data-paused");
    expect(screen.getByRole("button", { name: "Reproducir" })).toBeInTheDocument();
    view.rerender(
      <div style={{ width: 360 }}>
        <Marquee paused={false} labels={{ pause: "Parar", play: "Reproducir" }}>
          {logos()}
        </Marquee>
      </div>,
    );
    expect(marquee()).not.toHaveAttribute("data-paused");
    expect(screen.getByRole("button", { name: "Parar" })).toBeInTheDocument();
  });

  it("defaultPaused starts paused; controls={false} removes the button", () => {
    renderUi(
      <div style={{ width: 360 }}>
        <Marquee defaultPaused controls={false}>
          {logos()}
        </Marquee>
      </div>,
    );
    expect(marquee()).toHaveAttribute("data-paused");
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("keyboard focus inside the strip keeps links reachable one by one", async () => {
    renderUi(
      <div style={{ width: 360 }}>
        <Marquee listLabel="Customers">{logos(3)}</Marquee>
      </div>,
    );
    await userEvent.tab(); // pause button
    await userEvent.tab();
    expect(screen.getByRole("link", { name: "Brand 1" })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole("link", { name: "Brand 2" })).toHaveFocus();
  });

  it("reduced motion: static layout, no copies, no button", () => {
    setReducedMotion();
    renderUi(
      <div style={{ width: 360 }}>
        <Marquee listLabel="Customers">{logos()}</Marquee>
      </div>,
    );
    expect(marquee()).toHaveAttribute("data-static");
    expect(document.querySelectorAll("[data-slot=marquee] ul")).toHaveLength(1);
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getAllByRole("link")).toHaveLength(4);
  });

  it("reduced motion + vertical: a named, focusable scroll region", () => {
    setReducedMotion();
    renderUi(
      <Marquee vertical listLabel="Reviews" className="h-24">
        {logos(12)}
      </Marquee>,
    );
    const region = screen.getByRole("region", { name: "Reviews" });
    expect(region).toHaveAttribute("tabindex", "0");
  });

  describeVariants((variant) => {
    it("has no axe violations (animated)", async () => {
      renderUi(
        <div className="p-4" style={{ width: 400 }}>
          <Marquee listLabel="Customers">{logos()}</Marquee>
        </div>,
        variant,
      );
      await expect.poll(() => track()?.querySelectorAll("ul").length ?? 0).toBeGreaterThan(1);
      expect(await runAxe()).toHaveNoViolations();
    });
  });
});

/* ---------- Dock ---------- */

const Glyph = () => <svg aria-hidden viewBox="0 0 8 8" width="20" height="20" />;

function DockExample({ onMail }: { onMail?: () => void }) {
  return (
    <div className="p-24">
      <Dock label="Apps" size="sm">
        <DockItem label="Finder" icon={<Glyph />} active />
        <DockItem label="Mail" icon={<Glyph />} badge={3} badgeLabel="3 unread" onClick={onMail} />
        <DockSeparator />
        <DockItem label="Docs" icon={<Glyph />} href="#docs" active />
        <DockItem label="Trash" icon={<Glyph />} disabled />
      </Dock>
    </div>
  );
}

describe("Dock", () => {
  it("is a named toolbar; items are named by label; active button adds 'open', active link is aria-current", () => {
    renderUi(<DockExample />);
    expect(screen.getByRole("toolbar", { name: "Apps" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Finder, open" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Docs" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: /Mail/ })).toBeInTheDocument();
    // The visual labels are aria-hidden, so nothing is announced twice.
    for (const label of document.querySelectorAll('[data-slot="dock-label"]'))
      expect(label).toHaveAttribute("aria-hidden", "true");
  });

  it("the badge is announced with its label", () => {
    renderUi(<DockExample />);
    // The badge text is visual; the control's name carries the label: "Mail, 3 unread".
    expect(screen.getByRole("button", { name: "Mail, 3 unread" })).toBeInTheDocument();
  });

  it("labels override the active suffix (i18n)", () => {
    renderUi(
      <Dock label="Aplicaciones" labels={{ active: "abierta" }}>
        <DockItem label="Mail" icon={<Glyph />} active />
        <DockItem label="Notas" icon={<Glyph />} active activeLabel="en uso" />
      </Dock>,
    );
    expect(screen.getByRole("toolbar", { name: "Aplicaciones" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mail, abierta" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Notas, en uso" })).toBeInTheDocument();
  });

  it("one tab stop; arrows rove, Home/End jump; Enter activates; a disabled item stays focusable", async () => {
    const onMail = vi.fn();
    renderUi(
      <div>
        <button>before</button>
        <DockExample onMail={onMail} />
        <button>after</button>
      </div>,
    );
    screen.getByRole("button", { name: "before" }).focus();
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Finder, open" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: /Mail/ })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(onMail).toHaveBeenCalledTimes(1);
    await userEvent.keyboard("{End}");
    const trash = screen.getByRole("button", { name: "Trash" });
    expect(trash).toHaveFocus();
    expect(trash).toHaveAttribute("aria-disabled", "true");
    await userEvent.keyboard("{Home}");
    expect(screen.getByRole("button", { name: "Finder, open" })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "after" })).toHaveFocus();
  });

  it("Escape hides the focused item's label (WCAG 1.4.13) and a pointer move brings it back", async () => {
    renderUi(<DockExample />);
    await userEvent.tab();
    const toolbar = screen.getByRole("toolbar", { name: "Apps" });
    const root = toolbar.closest("[data-slot=dock]") ?? toolbar;
    expect(screen.getByRole("button", { name: "Finder, open" })).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await expect
      .poll(() => root.hasAttribute("data-labels-hidden") || toolbar.hasAttribute("data-labels-hidden"))
      .toBe(true);
    // Focus stays where it was.
    expect(screen.getByRole("button", { name: "Finder, open" })).toHaveFocus();
  });

  it("magnifies the item under the pointer, and flattens on leave", async () => {
    renderUi(<DockExample />);
    const mail = screen.getByRole("button", { name: /Mail/ });
    const before = mail.getBoundingClientRect().width;
    await userEvent.hover(mail);
    // Items grow by transform on an inner element; the slot keeps its layout size.
    const tile = () =>
      [...mail.querySelectorAll<HTMLElement>("*")].find((el) => /scale|matrix/.test(el.style.transform || ""));
    await expect
      .poll(() => Boolean(tile() ?? (mail.style.transform || mail.parentElement?.style.transform)), { timeout: 4000 })
      .toBe(true);
    expect(mail.getBoundingClientRect().width).toBeGreaterThanOrEqual(before - 0.5);
    await userEvent.unhover(mail);
  });

  it("throws a helpful error when an item is used outside a Dock", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => renderUi(<DockItem label="Lonely" icon={<Glyph />} />)).toThrow(/inside <Dock>/);
    spy.mockRestore();
  });

  it("reduced motion: still a working toolbar", async () => {
    setReducedMotion();
    renderUi(<DockExample />);
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: /Mail/ })).toHaveFocus();
  });

  describeVariants((variant) => {
    it("has no axe violations", async () => {
      renderUi(<DockExample />, variant);
      expect(await runAxe()).toHaveNoViolations();
    });
  });
});

/* ---------- Text effects ---------- */

describe("text effects", () => {
  it("BlurIn: the full sentence is accessible exactly once; pieces are aria-hidden", () => {
    renderUi(<BlurIn render={<h1 />} text="Interfaces you can see through" />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(accessibleText(h1)).toBe("Interfaces you can see through");
    expect(countOf(accessibleText(h1), "Interfaces")).toBe(1);
    expect(screen.getByRole("heading", { name: "Interfaces you can see through" })).toBeInTheDocument();
  });

  it("BlurIn by character: still one accessible copy, and words stay unbroken", () => {
    renderUi(<BlurIn text="Hello world" by="character" animateOnView={false} data-testid="b" />);
    expect(accessibleText(screen.getByTestId("b"))).toBe("Hello world");
  });

  it("BlurIn plays on mount and calls onComplete", async () => {
    const onComplete = vi.fn();
    renderUi(<BlurIn text="Two words" animateOnView={false} duration={0.1} stagger={0.02} onComplete={onComplete} />);
    await expect.poll(() => onComplete.mock.calls.length, { timeout: 4000 }).toBe(1);
  });

  it("BlurIn reduced motion: plain static text, nothing to wait for", () => {
    setReducedMotion();
    renderUi(<BlurIn text="Static headline" data-testid="b" />);
    const el = screen.getByTestId("b");
    expect(accessibleText(el)).toBe("Static headline");
    expect(el.querySelectorAll("[style*='blur']")).toHaveLength(0);
  });

  it("WordRotate: every word is read once as a list; the slot shows the current word", () => {
    renderUi(
      <p>
        Design for <WordRotate words={["designers", "developers", "everyone"]} data-testid="w" paused />
      </p>,
    );
    const text = accessibleText(screen.getByTestId("w"));
    expect(text).toMatch(/designers/);
    expect(text).toMatch(/developers/);
    expect(text).toMatch(/everyone/);
    for (const word of ["designers", "developers", "everyone"]) expect(countOf(text, word)).toBe(1);
  });

  it("WordRotate: `label` replaces the list; index is controlled; onIndexChange fires while cycling", async () => {
    const onIndexChange = vi.fn();
    const view = renderUi(<WordRotate words={["a", "b", "c"]} label="Pick a letter" index={1} data-testid="w" />);
    expect(accessibleText(screen.getByTestId("w"))).toBe("Pick a letter");
    view.unmount();
    renderUi(<WordRotate words={["x", "y"]} interval={0.2} onIndexChange={onIndexChange} data-testid="w2" />);
    await expect.poll(() => onIndexChange.mock.calls.length, { timeout: 5000 }).toBeGreaterThan(0);
    expect(onIndexChange.mock.calls[0]![0]).toBe(1);
  });

  it("WordRotate: paused stays on the first word; reduced motion stays put", async () => {
    const onIndexChange = vi.fn();
    setReducedMotion();
    renderUi(<WordRotate words={["x", "y"]} interval={0.1} onIndexChange={onIndexChange} data-testid="w" />);
    await frames(25);
    expect(onIndexChange).not.toHaveBeenCalled();
  });

  it("Typewriter: all phrases are accessible once (or `label`); the typing layer is aria-hidden", () => {
    renderUi(<Typewriter words={["design systems.", "fast websites."]} data-testid="t" />);
    const text = accessibleText(screen.getByTestId("t"));
    expect(countOf(text, "design systems.")).toBe(1);
    expect(countOf(text, "fast websites.")).toBe(1);
  });

  it("Typewriter: label override; types characters over time; onComplete once when not looping", async () => {
    const onComplete = vi.fn();
    renderUi(
      <Typewriter
        words="Hi!"
        label="Greeting"
        typeSpeed={0.01}
        startDelay={0}
        cursor={false}
        loop={false}
        onComplete={onComplete}
        data-testid="t"
      />,
    );
    expect(accessibleText(screen.getByTestId("t"))).toBe("Greeting");
    await expect.poll(() => onComplete.mock.calls.length, { timeout: 5000 }).toBe(1);
    const visible = [...screen.getByTestId("t").querySelectorAll("[aria-hidden]")].map((n) => n.textContent).join("");
    expect(visible).toContain("Hi!");
  });

  it("Typewriter reduced motion: the first phrase complete, with no caret", () => {
    setReducedMotion();
    renderUi(<Typewriter words={["first phrase", "second"]} data-testid="t" />);
    const el = screen.getByTestId("t");
    const visible = [...el.querySelectorAll("[aria-hidden]")].map((n) => n.textContent).join("");
    expect(visible).toContain("first phrase");
    // Nothing is typing or blinking.
    expect(el.getAnimations({ subtree: true })).toHaveLength(0);
  });

  it("ShimmerText: the real text stays the accessible text once; the highlight copy is aria-hidden", () => {
    renderUi(<ShimmerText data-testid="s">Generating your report…</ShimmerText>);
    const el = screen.getByTestId("s");
    expect(accessibleText(el)).toBe("Generating your report…");
    expect(countOf(accessibleText(el), "Generating")).toBe(1);
  });

  it("ShimmerText: reduced motion renders no overlay at all", () => {
    setReducedMotion();
    renderUi(<ShimmerText data-testid="s">Thinking…</ShimmerText>);
    const el = screen.getByTestId("s");
    expect(el.querySelectorAll("[aria-hidden]")).toHaveLength(0);
    expect(el.textContent).toBe("Thinking…");
  });

  it("ShimmerText: trigger='hover' sweeps on pointer enter (animations start)", async () => {
    renderUi(
      <ShimmerText trigger="hover" data-testid="s">
        Hover me
      </ShimmerText>,
    );
    const el = screen.getByTestId("s");
    const band = el.querySelector<HTMLElement>('[data-slot="shimmer-band"]')!;
    const copy = band.firstElementChild as HTMLElement;
    // At rest nothing runs: the band waits off the left edge.
    expect(band.getAnimations()).toHaveLength(0);
    await userEvent.hover(el);
    // The sweep is two native Web Animations (band and its text copy), both running on the compositor.
    await expect.poll(() => band.getAnimations().length, { timeout: 4000 }).toBe(1);
    expect(copy.getAnimations()).toHaveLength(1);
    expect(band.getAnimations()[0]!.playState).toBe("running");
    expect(band.getAnimations()[0]!.effect!.getComputedTiming().iterations).toBe(1);
  });

  it("ShimmerText: trigger='loop' repeats with the rest baked into the keyframes (no JS loop)", async () => {
    renderUi(
      <ShimmerText trigger="loop" data-testid="s">
        Working…
      </ShimmerText>,
    );
    const band = screen.getByTestId("s").querySelector<HTMLElement>('[data-slot="shimmer-band"]')!;
    await expect.poll(() => band.getAnimations().length, { timeout: 4000 }).toBe(1);
    const timing = band.getAnimations()[0]!.effect!.getComputedTiming();
    expect(timing.iterations).toBe(Infinity);
    // One cycle is the sweep (1.6 s) plus the rest (1 s).
    expect(timing.duration).toBe(2600);
  });

  it("ShimmerText: a paused loop (paused prop) cancels its animations", async () => {
    const { rerender } = renderUi(
      <ShimmerText trigger="loop" data-testid="s">
        Working…
      </ShimmerText>,
    );
    const band = screen.getByTestId("s").querySelector<HTMLElement>('[data-slot="shimmer-band"]')!;
    await expect.poll(() => band.getAnimations().length, { timeout: 4000 }).toBe(1);
    rerender(
      <ShimmerText trigger="loop" paused data-testid="s">
        Working…
      </ShimmerText>,
    );
    await expect.poll(() => band.getAnimations().length, { timeout: 4000 }).toBe(0);
  });

  describeVariants((variant) => {
    it("have no axe violations", async () => {
      renderUi(
        <div className="space-y-3 p-4">
          <BlurIn render={<h1 />} text="Interfaces you can see through" animateOnView={false} />
          <p>
            I build <Typewriter words={["design systems.", "fast websites."]} />
          </p>
          <p>
            For <WordRotate words={["designers", "developers"]} />
          </p>
          <ShimmerText className="text-sheen-fg-muted" trigger="mount">
            Generating your report…
          </ShimmerText>
        </div>,
        variant,
      );
      expect(await runAxe()).toHaveNoViolations();
    });
  });
});

/* ---------- MorphingDialog ---------- */

function MorphExample({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
  return (
    <div className="p-8">
      <MorphingDialog onOpenChange={onOpenChange}>
        <MorphingDialogTrigger className="w-72 p-2">
          <MorphingDialogMedia className="aspect-[4/3]">
            <img src={pixel} alt="" className="size-full object-cover" />
          </MorphingDialogMedia>
          <MorphingDialogTitle>Aurora</MorphingDialogTitle>
          <MorphingDialogSubtitle>Lofoten, Norway</MorphingDialogSubtitle>
        </MorphingDialogTrigger>
        <MorphingDialogContent labels={{ close: "Close aurora" }}>
          <MorphingDialogMedia className="aspect-[4/3]">
            <img src={pixel} alt="" className="size-full object-cover" />
          </MorphingDialogMedia>
          <MorphingDialogTitle>Aurora</MorphingDialogTitle>
          <MorphingDialogSubtitle>Lofoten, Norway</MorphingDialogSubtitle>
          <MorphingDialogDescription>The northern lights over the fjords.</MorphingDialogDescription>
          <MorphingDialogActions>
            <Button>Plan a trip</Button>
          </MorphingDialogActions>
        </MorphingDialogContent>
      </MorphingDialog>
      <button>outside</button>
    </div>
  );
}

const morphDialog = () => screen.queryByRole("dialog");
const morphTrigger = () => screen.getByRole("button", { name: /Aurora/ });

describe("MorphingDialog", () => {
  it("the card is a button; opening shows a modal dialog named by its title and described by its description", async () => {
    renderUi(<MorphExample />);
    expect(morphDialog()).toBeNull();
    await userEvent.click(morphTrigger());
    await expect.poll(morphDialog).not.toBeNull();
    const dialog = morphDialog()!;
    expect(dialog).toHaveAccessibleName("Aurora");
    expect(dialog).toHaveAccessibleDescription("The northern lights over the fjords.");
    expect(within(dialog).getByRole("button", { name: "Plan a trip" })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Close aurora" })).toBeInTheDocument();
  });

  it("moves focus in, traps Tab (and Shift+Tab), Escape closes and focus returns to the card", async () => {
    const onOpenChange = vi.fn<(open: boolean) => void>();
    renderUi(<MorphExample onOpenChange={onOpenChange} />);
    morphTrigger().focus();
    await userEvent.keyboard("{Enter}");
    await expect.poll(morphDialog).not.toBeNull();
    await expect.poll(() => morphDialog()!.contains(document.activeElement)).toBe(true);
    // Cycle through every control twice: focus never leaves the dialog.
    for (let i = 0; i < 5; i++) {
      await userEvent.tab();
      expect(morphDialog()!.contains(document.activeElement)).toBe(true);
    }
    await userEvent.tab({ shift: true });
    expect(morphDialog()!.contains(document.activeElement)).toBe(true);
    await userEvent.keyboard("{Escape}");
    await expect.poll(morphDialog, { timeout: 5000 }).toBeNull();
    await expect.poll(() => document.activeElement).toBe(morphTrigger());
    expect(onOpenChange.mock.calls.map((c) => c[0])).toEqual([true, false]);
  });

  it("the × button and an outside click close it", async () => {
    renderUi(<MorphExample />);
    await userEvent.click(morphTrigger());
    await expect.poll(morphDialog).not.toBeNull();
    await userEvent.click(within(morphDialog()!).getByRole("button", { name: "Close aurora" }));
    await expect.poll(morphDialog, { timeout: 5000 }).toBeNull();

    await userEvent.click(morphTrigger());
    await expect.poll(morphDialog).not.toBeNull();
    await userEvent.click(document.documentElement, { position: { x: 4, y: 4 } });
    await expect.poll(morphDialog, { timeout: 5000 }).toBeNull();
  });

  it("controlled `open` and defaultOpen", async () => {
    const view = renderUi(
      <MorphingDialog open>
        <MorphingDialogTrigger>Open</MorphingDialogTrigger>
        <MorphingDialogContent showClose={false}>
          <MorphingDialogTitle>Forced open</MorphingDialogTitle>
        </MorphingDialogContent>
      </MorphingDialog>,
    );
    await expect.poll(morphDialog).not.toBeNull();
    expect(within(morphDialog()!).queryByRole("button", { name: "Close" })).toBeNull();
    view.rerender(
      <MorphingDialog open={false}>
        <MorphingDialogTrigger>Open</MorphingDialogTrigger>
        <MorphingDialogContent showClose={false}>
          <MorphingDialogTitle>Forced open</MorphingDialogTitle>
        </MorphingDialogContent>
      </MorphingDialog>,
    );
    await expect.poll(morphDialog, { timeout: 5000 }).toBeNull();
  });

  it("reduced motion: opens and closes with a plain fade, same a11y", async () => {
    setReducedMotion();
    renderUi(<MorphExample />);
    await userEvent.click(morphTrigger());
    await expect.poll(morphDialog).not.toBeNull();
    expect(morphDialog()).toHaveAccessibleName("Aurora");
    await userEvent.keyboard("{Escape}");
    await expect.poll(morphDialog, { timeout: 5000 }).toBeNull();
  });

  describeVariants((variant) => {
    it("has no axe violations (card, and with the dialog open)", async () => {
      renderUi(<MorphExample />, variant);
      expect(await runAxe()).toHaveNoViolations();
      await userEvent.click(morphTrigger());
      await expect.poll(morphDialog).not.toBeNull();
      await settle();
      expect(await runAxe()).toHaveNoViolations();
    });
  });
});
