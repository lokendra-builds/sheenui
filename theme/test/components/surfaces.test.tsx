// Surfaces and decoration: Separator, GlassCard, Logo, DescriptionList, CopyButton / CopyChip,
// Spotlight, BorderBeam, TiltCard and Timeline.

import { describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { Separator } from "../../src/components/separator/separator";
import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardFooter,
  GlassCardHeader,
  GlassCardTitle,
} from "../../src/components/glass-card/glass-card";
import { SheenLogo, SheenMark } from "../../src/components/logo/logo";
import { DescriptionItem, DescriptionList } from "../../src/components/description-list/description-list";
import { CopyButton, CopyChip } from "../../src/components/description-list/copy-button";
import { SpotlightCard, SpotlightGroup } from "../../src/components/spotlight/spotlight";
import { BorderBeam } from "../../src/components/border-beam/border-beam";
import { TiltCard, TiltCardLayer } from "../../src/components/tilt-card/tilt-card";
import { Timeline, TimelineHeading, TimelineItem } from "../../src/components/timeline/timeline";
import { reduceMotion } from "../helpers";
import { describeVariants, renderUi, runAxe } from "../render";

/* ---------- Separator ---------- */

describe("Separator", () => {
  it("is a separator with an orientation; a label becomes its accessible name", () => {
    renderUi(
      <div>
        <Separator />
        <Separator orientation="vertical" />
        <Separator label="or" />
        <Separator label={<b>Today</b>} aria-label="Earlier today" variant="fade" labelAlign="start" />
      </div>,
    );
    const separators = screen.getAllByRole("separator");
    expect(separators).toHaveLength(4);
    expect(separators[1]).toHaveAttribute("aria-orientation", "vertical");
    expect(screen.getByRole("separator", { name: "or" })).toBeInTheDocument();
    expect(screen.getByRole("separator", { name: "Earlier today" })).toBeInTheDocument();
    // The label text is shown once, in the DOM, not duplicated.
    expect(screen.getAllByText("or")).toHaveLength(1);
  });

  it("decorative separators are hidden from assistive tech", () => {
    renderUi(
      <div>
        <Separator decorative />
        <Separator decorative label="or" variant="dashed" labelVariant="pill" />
      </div>,
    );
    expect(screen.queryAllByRole("separator")).toHaveLength(0);
    expect(document.querySelectorAll('[data-slot="separator"][aria-hidden="true"]')).toHaveLength(2);
  });

  it("draws visible lines with borders (still visible in forced colors)", () => {
    renderUi(<Separator />);
    const line = screen.getByRole("separator");
    expect(parseFloat(getComputedStyle(line).borderTopWidth)).toBeGreaterThan(0);
  });

  describeVariants((variant) => {
    it("has no axe violations", async () => {
      renderUi(
        <div className="flex flex-col gap-4 p-4">
          <Separator />
          <Separator label="or" labelVariant="pill" />
          <Separator variant="fade" label="Today" labelAlign="end" />
          <div className="flex h-8 items-center gap-3">
            <span>Docs</span>
            <Separator orientation="vertical" />
            <span>Blog</span>
          </div>
        </div>,
        variant,
      );
      expect(await runAxe()).toHaveNoViolations();
    });
  });
});

/* ---------- GlassCard ---------- */

describe("GlassCard", () => {
  it("renders its parts with the right semantics and glass level classes", () => {
    renderUi(
      <GlassCard level={3} tint interactive data-testid="card">
        <GlassCardHeader>
          <GlassCardTitle>Billing</GlassCardTitle>
          <GlassCardDescription>Manage your plan</GlassCardDescription>
        </GlassCardHeader>
        <GlassCardContent>Body</GlassCardContent>
        <GlassCardFooter>Footer</GlassCardFooter>
      </GlassCard>,
    );
    const card = screen.getByTestId("card");
    expect(card).toHaveAttribute("data-slot", "glass-card");
    expect(card).toHaveClass("glass-3", "glass-tint", "glass-sheen");
    expect(screen.getByRole("heading", { name: "Billing", level: 3 })).toBeInTheDocument();
    expect(screen.getByText("Manage your plan")).toBeInTheDocument();
  });

  it("sheen follows the mouse by moving a composited layer, and ignores touch", () => {
    const onPointerMove = vi.fn();
    renderUi(
      <GlassCard data-testid="card" onPointerMove={onPointerMove} className="h-24 w-48">
        x
      </GlassCard>,
    );
    const card = screen.getByTestId("card");
    const rect = card.getBoundingClientRect();
    card.dispatchEvent(
      new PointerEvent("pointermove", {
        bubbles: true,
        pointerType: "mouse",
        clientX: rect.left + 30,
        clientY: rect.top + 12,
      }),
    );
    // The light is a pre-painted layer moved with `translate` (offsets from the card's top centre).
    const layer = card.querySelector<HTMLElement>('[data-slot="glass-card-sheen"] > span')!;
    expect(layer.style.translate).toContain(
      `${30 - rect.width / 2 < 0 ? "- " : "+ "}${Math.abs(30 - rect.width / 2)}px`,
    );
    expect(layer.style.translate).toContain("12px");
    layer.style.translate = "";
    card.dispatchEvent(
      new PointerEvent("pointermove", {
        bubbles: true,
        pointerType: "touch",
        clientX: rect.left + 5,
        clientY: rect.top + 5,
      }),
    );
    expect(layer.style.translate).toBe("");
    expect(onPointerMove).toHaveBeenCalledTimes(2);
  });

  it("sheen={false} leaves out the highlight", () => {
    renderUi(<GlassCard sheen={false} data-testid="card" />);
    expect(screen.getByTestId("card")).not.toHaveClass("glass-sheen");
  });

  it("a focusable interactive card shows a focus outline", async () => {
    renderUi(
      <GlassCard interactive tabIndex={0} role="link" aria-label="Open project" className="p-4">
        Project
      </GlassCard>,
    );
    await userEvent.tab();
    const card = screen.getByRole("link", { name: "Open project" });
    expect(card).toHaveFocus();
    expect(parseFloat(getComputedStyle(card).outlineWidth)).toBeGreaterThanOrEqual(2);
  });

  describeVariants((variant) => {
    it("has no axe violations", async () => {
      renderUi(
        <GlassCard className="m-4">
          <GlassCardHeader>
            <GlassCardTitle>Billing</GlassCardTitle>
            <GlassCardDescription>Manage your plan</GlassCardDescription>
          </GlassCardHeader>
          <GlassCardContent>Body</GlassCardContent>
        </GlassCard>,
        variant,
      );
      expect(await runAxe()).toHaveNoViolations();
    });
  });
});

/* ---------- Logo ---------- */

describe("SheenLogo / SheenMark", () => {
  it("the mark is an image named SheenUI; an empty title hides it", () => {
    renderUi(
      <div>
        <SheenMark />
        <SheenMark title="" data-testid="quiet" />
      </div>,
    );
    expect(screen.getAllByRole("img", { name: "SheenUI" })).toHaveLength(1);
    expect(screen.getByTestId("quiet")).toHaveAttribute("aria-hidden", "true");
  });

  it("gives every mark its own clip id", () => {
    renderUi(
      <div>
        <SheenMark />
        <SheenMark />
      </div>,
    );
    const ids = [...document.querySelectorAll("clipPath")].map((n) => n.id);
    expect(ids.length).toBe(2);
    expect(new Set(ids).size).toBe(2);
    for (const id of ids) expect(id).toMatch(/^[a-zA-Z0-9_-]+$/);
  });

  it("the full logo is one image named SheenUI (wordmark not read twice); the mark variant is the square only", () => {
    renderUi(
      <div>
        <SheenLogo />
        <SheenLogo variant="mark" glow={false} />
      </div>,
    );
    // Full logo: the wrapper is the single named image; mark inside is hidden.
    expect(screen.getAllByRole("img", { name: "SheenUI" })).toHaveLength(2);
    // The wordmark is drawn artwork: hidden from assistive tech, so the name is not read twice.
    expect(document.querySelectorAll("[data-slot=logo] span[aria-hidden=true] path")).toHaveLength(1);
  });

  it("size scales the mark", () => {
    renderUi(<SheenMark px={48} data-testid="m" />);
    expect(screen.getByTestId("m")).toHaveAttribute("width", "48");
  });

  describeVariants((variant) => {
    it("has no axe violations (wordmark contrast included)", async () => {
      renderUi(
        <div className="p-4">
          <SheenLogo />
        </div>,
        variant,
      );
      expect(await runAxe()).toHaveNoViolations();
    });
  });
});

/* ---------- DescriptionList ---------- */

describe("DescriptionList", () => {
  it("is a <dl> with a dt/dd pair per row and empty values read as 'Not set'", () => {
    renderUi(
      <DescriptionList aria-label="Customer">
        <DescriptionItem label="Email">ada@example.com</DescriptionItem>
        <DescriptionItem label="Phone" />
        <DescriptionItem label="Plan" hint="Renews monthly">
          Pro
        </DescriptionItem>
      </DescriptionList>,
    );
    const dl = document.querySelector("dl")!;
    expect(dl.querySelectorAll("dt")).toHaveLength(3);
    expect(dl.querySelectorAll("dd")).toHaveLength(3);
    expect([...dl.querySelectorAll("dt")].map((n) => n.textContent)).toEqual(["Email", "Phone", "Plan"]);
    expect(within(dl.querySelectorAll("dd")[1]!).getByText("Not set")).toBeInTheDocument();
    expect(screen.getByText("Renews monthly")).toBeInTheDocument();
    // Every div child has exactly one dt and one dd (valid HTML for dl).
    for (const row of dl.children) expect(row.children.length).toBeGreaterThanOrEqual(2);
  });

  it("the items shorthand renders rows; labels override the empty text and the copy name", () => {
    renderUi(
      <DescriptionList
        items={[
          { label: "Order", value: "#1042", copyValue: "ord_8Hk2Qx" },
          { label: "Coupon", value: "" },
        ]}
        labels={{ empty: "Sin definir", copyValue: (l) => `Copiar ${l}` }}
      />,
    );
    expect(screen.getByRole("button", { name: "Copiar Order" })).toBeInTheDocument();
    expect(screen.getByText("Sin definir")).toBeInTheDocument();
    expect(screen.queryByText("Not set")).toBeNull();
  });

  it("layout and variant are reflected on the element", () => {
    renderUi(
      <DescriptionList layout="stacked" variant="glass" dividers={false} data-testid="dl">
        <DescriptionItem label="A">1</DescriptionItem>
      </DescriptionList>,
    );
    const dl = screen.getByTestId("dl");
    expect(dl).toHaveAttribute("data-layout", "stacked");
    expect(dl).toHaveClass("glass-2");
  });

  it("a row's copy button copies its value and announces 'Copied' once", async () => {
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    renderUi(
      <DescriptionList>
        <DescriptionItem label="Email" copyValue="ada@example.com">
          ada@example.com
        </DescriptionItem>
      </DescriptionList>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Copy email" }));
    expect(writeText).toHaveBeenCalledWith("ada@example.com");
    // The button's name becomes "Copied" and the polite region says it once.
    await screen.findByRole("button", { name: "Copied" });
    const live = document.querySelector('[aria-live="polite"]')!;
    await expect.poll(() => live.textContent).toBe("Copied");
    writeText.mockRestore();
  });

  describeVariants((variant) => {
    it("has no axe violations", async () => {
      renderUi(
        <div className="p-4">
          <DescriptionList variant="glass">
            <DescriptionItem label="Email" copyValue="ada@example.com">
              ada@example.com
            </DescriptionItem>
            <DescriptionItem label="Phone" />
          </DescriptionList>
        </div>,
        variant,
      );
      expect(await runAxe()).toHaveNoViolations();
    });
  });
});

/* ---------- CopyButton / CopyChip ---------- */

describe("CopyButton and CopyChip", () => {
  it("CopyButton: named by `label`, copies, calls onCopied, then returns to idle", async () => {
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    const onCopied = vi.fn();
    renderUi(<CopyButton value="sk_test_123" label="Copy API key" onCopied={onCopied} />);
    const button = screen.getByRole("button", { name: "Copy API key" });
    button.focus();
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => onCopied.mock.calls.length).toBe(1);
    expect(onCopied).toHaveBeenCalledWith("sk_test_123");
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(button).toHaveAttribute("data-status", "copied");
    expect(button).toHaveAccessibleName("Copied");
    await expect.poll(() => button.getAttribute("data-status"), { timeout: 4000 }).toBe("idle");
    expect(button).toHaveAccessibleName("Copy API key");
    writeText.mockRestore();
  });

  it("CopyButton: labels override every string, including the failure message", async () => {
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("denied"));
    const exec = vi.spyOn(document, "execCommand").mockReturnValue(false);
    renderUi(<CopyButton value="x" labels={{ copy: "Copiar", copied: "Copiado", failed: "No se pudo copiar" }} />);
    const button = screen.getByRole("button", { name: "Copiar" });
    await userEvent.click(button);
    await expect.poll(() => document.querySelector('[aria-live="polite"]')!.textContent).toBe("No se pudo copiar");
    expect(button).toHaveAttribute("data-status", "failed");
    writeText.mockRestore();
    exec.mockRestore();
  });

  it("CopyButton: falls back to execCommand when the Clipboard API rejects", async () => {
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("denied"));
    const exec = vi.spyOn(document, "execCommand").mockReturnValue(true);
    const onCopied = vi.fn();
    renderUi(<CopyButton value="fallback" onCopied={onCopied} />);
    await userEvent.click(screen.getByRole("button", { name: "Copy" }));
    await expect.poll(() => onCopied.mock.calls.length).toBe(1);
    expect(exec).toHaveBeenCalledWith("copy");
    // The temporary textarea is removed again.
    expect(document.querySelector("textarea")).toBeNull();
    writeText.mockRestore();
    exec.mockRestore();
  });

  it("CopyChip: names itself from label + value, shows `display`, copies the full value", async () => {
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    renderUi(<CopyChip value="ord_8Hk2Qx" label="Order ID" display="ord_8…Qx" />);
    const chip = screen.getByRole("button", { name: "Copy Order ID ord_8Hk2Qx" });
    expect(chip).toHaveTextContent("ord_8…Qx");
    await userEvent.click(chip);
    expect(writeText).toHaveBeenCalledWith("ord_8Hk2Qx");
    await expect.poll(() => chip.getAttribute("aria-label")).toBe("Copied: ord_8Hk2Qx");
    writeText.mockRestore();
  });

  it("a click handler that calls preventDefault cancels the copy", async () => {
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    renderUi(<CopyButton value="x" onClick={(e) => e.preventDefault()} />);
    await userEvent.click(screen.getByRole("button", { name: "Copy" }));
    expect(writeText).not.toHaveBeenCalled();
    writeText.mockRestore();
  });

  describeVariants((variant) => {
    it("has no axe violations", async () => {
      renderUi(
        <div className="flex items-center gap-3 p-4">
          <CopyButton value="x" label="Copy token" />
          <CopyChip value="ord_8Hk2Qx" label="Order ID" />
        </div>,
        variant,
      );
      expect(await runAxe()).toHaveNoViolations();
    });
  });
});

/* ---------- Spotlight ---------- */

describe("SpotlightCard / SpotlightGroup", () => {
  it("a lone card moves its light layers with translate (mouse), not for touch", async () => {
    renderUi(
      <SpotlightCard data-testid="card" className="m-4 h-32 w-64 p-4">
        <h3>Insights</h3>
      </SpotlightCard>,
    );
    const card = screen.getByTestId("card");
    await userEvent.hover(card);
    await expect.poll(() => card.querySelector<HTMLElement>("[data-spot-layer]")!.style.translate).toMatch(/px/);
    expect(card.querySelector('[data-slot="spotlight-glow"]')).toHaveAttribute("aria-hidden", "true");
    expect(card.querySelector('[data-slot="spotlight-rim"]')).toBeInTheDocument();
  });

  it("rim={false} drops the rim; size and color become CSS variables", () => {
    renderUi(
      <SpotlightCard data-testid="card" rim={false} diameter={200} color="red" rimColor="blue">
        x
      </SpotlightCard>,
    );
    const card = screen.getByTestId("card");
    expect(card.querySelector('[data-slot="spotlight-rim"]')).toBeNull();
    expect(card.style.getPropertyValue("--spot-size")).toBe("200px");
    expect(card.style.getPropertyValue("--spot-color")).toBe("red");
    expect(card.style.getPropertyValue("--spot-rim")).toBe("blue");
  });

  it("in a group, one pointer paints every card and marks the group active", async () => {
    renderUi(
      <SpotlightGroup data-testid="group" className="grid grid-cols-2 gap-4 p-4">
        <SpotlightCard data-testid="a" className="h-24 p-3">
          A
        </SpotlightCard>
        <SpotlightCard data-testid="b" className="h-24 p-3">
          B
        </SpotlightCard>
      </SpotlightGroup>,
    );
    const group = screen.getByTestId("group");
    await userEvent.hover(screen.getByTestId("a"));
    await expect
      .poll(() => screen.getByTestId("b").querySelector<HTMLElement>("[data-spot-layer]")!.style.translate)
      .toMatch(/px/);
    expect(group).toHaveAttribute("data-spotlight-active");
    await userEvent.unhover(screen.getByTestId("a"));
    await expect.poll(() => group.hasAttribute("data-spotlight-active")).toBe(false);
  });

  it("keyboard focus inside a card does not break focus handling of its content", async () => {
    renderUi(
      <SpotlightCard>
        <button>Inside</button>
      </SpotlightCard>,
    );
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Inside" })).toHaveFocus();
  });

  describeVariants((variant) => {
    it("has no axe violations", async () => {
      renderUi(
        <SpotlightGroup className="grid gap-4 p-4">
          <SpotlightCard tint className="p-4">
            <h3 className="font-semibold">Insights</h3>
            <p className="text-sheen-fg-muted">Muted copy stays AA.</p>
          </SpotlightCard>
        </SpotlightGroup>,
        variant,
      );
      expect(await runAxe()).toHaveNoViolations();
    });
  });
});

/* ---------- BorderBeam ---------- */

function BeamHost(props: Parameters<typeof BorderBeam>[0]) {
  return (
    <div className="relative m-6 h-24 w-56 rounded-2xl border border-white/10" data-testid="host">
      <BorderBeam {...props} />
      <span>content</span>
    </div>
  );
}

describe("BorderBeam", () => {
  const beam = () => document.querySelector<HTMLElement>('[data-slot="border-beam"]')!;
  const running = () =>
    beam()
      .getAnimations({ subtree: true })
      .filter((a) => a.playState === "running").length;

  it("is decorative (aria-hidden, pointer-events none) and does not cover the content", async () => {
    renderUi(<BeamHost />);
    expect(beam()).toHaveAttribute("aria-hidden", "true");
    expect(getComputedStyle(beam()).pointerEvents).toBe("none");
    await userEvent.click(screen.getByText("content"));
  });

  it("runs a lap animation while visible; `paused` holds it; unpausing resumes", async () => {
    const view = renderUi(<BeamHost duration={4} />);
    await expect.poll(running).toBeGreaterThan(0);
    view.rerender(<BeamHost duration={4} paused />);
    await expect.poll(running).toBe(0);
    expect(beam()).toHaveAttribute("data-paused");
    view.rerender(<BeamHost duration={4} />);
    await expect.poll(running).toBeGreaterThan(0);
  });

  it("double adds a second light to the halo", async () => {
    renderUi(<BeamHost double />);
    await expect.poll(() => beam().querySelectorAll("[data-light]").length).toBe(2);
  });

  it("track={false} / glow={false} drop their layers", () => {
    renderUi(<BeamHost track={false} glow={false} />);
    expect(beam().querySelector('[data-slot="border-beam-halo"]')).toBeNull();
    // Only the beam ring (+ the <style> element) remain.
    expect(beam().querySelectorAll(":scope > span")).toHaveLength(1);
  });

  it("reduced motion: no lap animation, a still beam lit on the corner", async () => {
    reduceMotion();
    renderUi(<BeamHost />);
    await expect.poll(() => beam().style.getPropertyValue("--sheen-beam-angle")).not.toBe("");
    expect(beam().getAnimations({ subtree: true })).toHaveLength(0);
  });

  describeVariants((variant) => {
    it("has no axe violations", async () => {
      renderUi(<BeamHost />, variant);
      expect(await runAxe()).toHaveNoViolations();
    });
  });
});

/* ---------- TiltCard ---------- */

describe("TiltCard", () => {
  it("renders glass content, a decorative glare, and keeps content accessible", () => {
    renderUi(
      <TiltCard className="m-6 h-40 w-64 p-4">
        <TiltCardLayer depth={12}>
          <h3>Deep card</h3>
        </TiltCardLayer>
      </TiltCard>,
    );
    expect(screen.getByRole("heading", { name: "Deep card" })).toBeInTheDocument();
    const glare = document.querySelector('[data-slot="tilt-card-glare"]')!;
    expect(glare.closest("[aria-hidden='true']")).not.toBeNull();
    expect(document.querySelector('[data-slot="tilt-card-layer"]')).toBeInTheDocument();
  });

  it("leans toward the pointer on hover and settles flat again on leave", async () => {
    renderUi(
      <TiltCard data-testid="card" className="m-8 h-40 w-64 p-4">
        card
      </TiltCard>,
    );
    const card = screen.getByTestId("card");
    const rect = card.getBoundingClientRect();
    await userEvent.hover(card, { position: { x: rect.width * 0.85, y: rect.height * 0.15 } });
    await expect.poll(() => card.style.transform, { timeout: 4000 }).toMatch(/rotate/);
    await userEvent.unhover(card);
    const lean = () =>
      Math.max(
        0,
        ...[...card.style.transform.matchAll(/rotate[XY]\((-?[\d.]+)deg\)/g)].map((m) => Math.abs(Number(m[1]))),
      );
    await expect.poll(lean, { timeout: 5000 }).toBeLessThan(0.5);
  });

  it("reduced motion: a still glass card with no glare and no transform", async () => {
    reduceMotion();
    renderUi(
      <TiltCard data-testid="card" className="m-8 h-40 w-64 p-4">
        card
      </TiltCard>,
    );
    const card = screen.getByTestId("card");
    await userEvent.hover(card);
    expect(card.style.transform).toBe("");
    expect(document.querySelector('[data-slot="tilt-card-glare"]')).toBeNull();
  });

  it("maxTilt is capped at 8 degrees", async () => {
    renderUi(
      <TiltCard data-testid="card" maxTilt={40} className="m-8 h-40 w-64 p-4">
        card
      </TiltCard>,
    );
    const card = screen.getByTestId("card");
    const rect = card.getBoundingClientRect();
    await userEvent.hover(card, { position: { x: rect.width * 0.9, y: rect.height * 0.1 } });
    const angles = () =>
      [...card.style.transform.matchAll(/rotate[XY]\((-?[\d.]+)deg\)/g)].map((m) => Math.abs(Number(m[1])));
    // Leaning clearly (springs are still easing in), and never past the 8 degree cap.
    await expect.poll(() => Math.max(0, ...angles()), { timeout: 4000 }).toBeGreaterThan(2);
    for (const a of angles()) expect(a).toBeLessThanOrEqual(8.01);
  });

  describeVariants((variant) => {
    it("has no axe violations", async () => {
      renderUi(
        <TiltCard className="m-6 h-40 w-64 p-4">
          <h3>Title</h3>
          <p className="text-sheen-fg-muted">Muted copy</p>
        </TiltCard>,
        variant,
      );
      expect(await runAxe()).toHaveNoViolations();
    });
  });
});

/* ---------- Timeline ---------- */

function Feed({ animate }: { animate?: boolean }) {
  return (
    <Timeline animate={animate} aria-label="Order history">
      <TimelineHeading>Today</TimelineHeading>
      <TimelineItem
        title="Order shipped"
        time="2h ago"
        dateTime="2026-10-30T09:12:00Z"
        description="Courier picked it up"
        tone="success"
        connector="accent"
      />
      <TimelineItem title="Out for delivery" current tone="accent" connector="dashed" />
      <TimelineItem title="Delivered" time="Pending" icon={<svg aria-hidden viewBox="0 0 8 8" width="8" height="8" />}>
        <p>Leave at the door</p>
      </TimelineItem>
    </Timeline>
  );
}

describe("Timeline", () => {
  it("is an ordered list; headings and items are list items; the live step is aria-current", () => {
    renderUi(<Feed animate={false} />);
    const list = screen.getByRole("list", { name: "Order history" });
    expect(list.tagName).toBe("OL");
    expect(within(list).getAllByRole("listitem")).toHaveLength(4);
    expect(screen.getByText("Today")).toBeInTheDocument();
    const current = list.querySelector('[aria-current="step"]')!;
    expect(current).toHaveTextContent("Out for delivery");
    expect(list.querySelectorAll('[aria-current="step"]')).toHaveLength(1);
  });

  it("times use <time datetime> with a full-date title; extra children render under the item", () => {
    renderUi(<Feed animate={false} />);
    const time = document.querySelector("time")!;
    expect(time).toHaveAttribute("datetime", "2026-10-30T09:12:00Z");
    expect(time).toHaveTextContent("2h ago");
    expect(time.getAttribute("title") ?? time.closest("[title]")?.getAttribute("title")).toBeTruthy();
    expect(screen.getByText("Leave at the door")).toBeInTheDocument();
  });

  it("item content is accessible once even with the entrance animation on, and reduced motion renders it instantly", () => {
    reduceMotion();
    renderUi(<Feed />);
    expect(screen.getAllByText("Order shipped")).toHaveLength(1);
    const first = screen.getByText("Order shipped").closest("li")!;
    expect(parseFloat(getComputedStyle(first).opacity)).toBe(1);
  });

  it("layout='alternate' marks the list", () => {
    renderUi(
      <Timeline layout="alternate" data-testid="tl">
        <TimelineItem title="A" />
        <TimelineItem title="B" />
      </Timeline>,
    );
    expect(screen.getByTestId("tl")).toHaveAttribute("data-layout", "alternate");
  });

  describeVariants((variant) => {
    it("has no axe violations", async () => {
      renderUi(
        <div className="p-4">
          <Feed animate={false} />
        </div>,
        variant,
      );
      expect(await runAxe()).toHaveNoViolations();
    });
  });
});
