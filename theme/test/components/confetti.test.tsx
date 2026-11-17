// Confetti: an imperative one-shot burst. Idle until fired, capped, hides itself, and marks the moment with a badge under reduced motion.

import { afterEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { Confetti, useConfetti } from "../../src/components/confetti/confetti";
import { frames, reduceMotion } from "../helpers";
import { describeVariants, renderUi, runAxe } from "../render";

afterEach(() => vi.restoreAllMocks());

function Demo({ count, badge, maxCount }: { count?: number; badge?: string; maxCount?: number }) {
  const { ref, fire, clear } = useConfetti();
  return (
    <>
      <button type="button" onClick={(event) => fire({ origin: event.currentTarget, count })}>
        Celebrate
      </button>
      <button type="button" onClick={() => clear()}>
        Clear
      </button>
      <Confetti ref={ref} badge={badge} maxCount={maxCount} badgeDuration={0.3} />
    </>
  );
}

const canvas = () => document.querySelector<HTMLCanvasElement>('[data-slot="confetti"]')!;

describeVariants((variant) => {
  describe(`Confetti in ${variant.theme} / ${variant.style}`, () => {
    it("renders a hidden, decorative canvas while idle and passes axe", async () => {
      renderUi(<Demo badge="Done" />, variant);
      await expect.poll(canvas).not.toBeNull();
      expect(canvas()).toHaveAttribute("aria-hidden", "true");
      expect(getComputedStyle(canvas()).display).toBe("none");
      expect((await runAxe()).violations).toEqual([]);
    });
  });
});

describe("Confetti burst", () => {
  it("fires on demand, draws pieces, and hides itself again when they are gone", async () => {
    const rect = vi.spyOn(CanvasRenderingContext2D.prototype, "fillRect");
    const arc = vi.spyOn(CanvasRenderingContext2D.prototype, "arc");
    renderUi(<Demo />);
    await expect.poll(canvas).not.toBeNull();
    expect(rect.mock.calls.length + arc.mock.calls.length).toBe(0);
    await userEvent.click(screen.getByRole("button", { name: "Celebrate" }));
    await expect.poll(() => getComputedStyle(canvas()).display).toBe("block");
    await expect.poll(() => rect.mock.calls.length + arc.mock.calls.length).toBeGreaterThan(10);
    await expect.poll(() => getComputedStyle(canvas()).display, { timeout: 8000 }).toBe("none");
  });

  it("never draws more than 220 pieces in one frame, whatever count asks for", async () => {
    // Every frame starts with one clearRect; each piece is one fill()/fillRect(). Read the draws between two
    // consecutive clearRects: one whole frame, never a count taken in the middle of one.
    const log: ("frame" | "piece")[] = [];
    vi.spyOn(CanvasRenderingContext2D.prototype, "clearRect").mockImplementation(() => {
      log.push("frame");
    });
    for (const method of ["fill", "fillRect"] as const) {
      vi.spyOn(CanvasRenderingContext2D.prototype, method).mockImplementation(() => {
        log.push("piece");
      });
    }
    renderUi(<Demo count={5000} maxCount={5000} />);
    await expect.poll(canvas).not.toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Celebrate" }));
    await expect.poll(() => log.filter((e) => e === "frame").length).toBeGreaterThanOrEqual(4);
    const frameStarts = log.flatMap((e, i) => (e === "frame" ? [i] : []));
    const perFrame = frameStarts.slice(1).map((at, i) => at - frameStarts[i]! - 1);
    for (const pieces of perFrame) expect(pieces).toBeLessThanOrEqual(220);
    // Both limits ask for 5000, so the hard cap decides: exactly 220 pieces (110 on a weak device, where it is halved).
    expect([110, 220]).toContain(perFrame[0]);
  });

  it("clear() removes the pieces at once", async () => {
    renderUi(<Demo />);
    await expect.poll(canvas).not.toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Celebrate" }));
    await expect.poll(() => getComputedStyle(canvas()).display).toBe("block");
    await userEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(getComputedStyle(canvas()).display).toBe("none");
  });

  it("with reduced motion draws nothing and shows the badge in a polite live region, then removes it", async () => {
    reduceMotion();
    const rect = vi.spyOn(CanvasRenderingContext2D.prototype, "fillRect");
    renderUi(<Demo badge="Order placed" />);
    await expect.poll(() => screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    await userEvent.click(screen.getByRole("button", { name: "Celebrate" }));
    await expect.poll(() => screen.getByRole("status")).toHaveTextContent("Order placed");
    await frames(3);
    expect(rect).not.toHaveBeenCalled();
    expect(getComputedStyle(canvas()).display).toBe("none");
    await expect.poll(() => screen.getByRole("status"), { timeout: 3000 }).toBeEmptyDOMElement();
  });
});
