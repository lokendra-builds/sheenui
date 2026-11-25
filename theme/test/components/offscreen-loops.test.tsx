import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { SheenMotionProvider } from "../../src/motion/provider";
import { offscreenLoopStats } from "../../src/motion/offscreen-loops";
import { Spinner } from "../../src";

describe("useOffscreenLoops bookkeeping", () => {
  it("forgets every spinner once it is unmounted (nothing is retained or observed)", async () => {
    expect(offscreenLoopStats()).toEqual({ anchors: 0, elements: 0 });
    const spinners = (n: number) => (
      <div>
        {Array.from({ length: n }, (_, i) => (
          <div key={i}>
            <Spinner />
          </div>
        ))}
      </div>
    );
    const view = render(spinners(50), { wrapper: SheenMotionProvider });
    await expect.poll(() => offscreenLoopStats().elements, { timeout: 4000 }).toBeGreaterThanOrEqual(50);
    view.unmount();
    // The provider unmounts too, so unmount alone proves the cleanup; remount the provider and churn instead:
    expect(offscreenLoopStats()).toEqual({ anchors: 0, elements: 0 });
  });

  it("while the provider stays mounted, removed spinners are unobserved by production sweeps (no stats() call needed)", async () => {
    const unobserve = vi.spyOn(IntersectionObserver.prototype, "unobserve");
    const view = render(
      <SheenMotionProvider>
        <div data-testid="host">
          {Array.from({ length: 50 }, (_, i) => (
            <Spinner key={i} />
          ))}
        </div>
      </SheenMotionProvider>,
    );
    await expect.poll(() => offscreenLoopStats().elements, { timeout: 4000 }).toBeGreaterThanOrEqual(50);
    view.rerender(
      <SheenMotionProvider>
        <div data-testid="host" />
      </SheenMotionProvider>,
    );
    // offscreenLoopStats() sweeps by itself, so it cannot prove the leak is closed. The sweep the app really runs
    // (animationcancel / observer entries) must unobserve each removed anchor on its own: poll the spy, not the stats.
    await expect.poll(() => unobserve.mock.calls.length, { timeout: 4000 }).toBeGreaterThanOrEqual(50);
    expect(offscreenLoopStats()).toEqual({ anchors: 0, elements: 0 });
    view.unmount();
    unobserve.mockRestore();
  });

  it("pauses an infinite loop drawn on a ::before pseudo-element off-screen and resumes it in view", async () => {
    // The observer is driven by hand: headless iframes deliver real IntersectionObserver entries unreliably late.
    const callbacks: IntersectionObserverCallback[] = [];
    const RealObserver = window.IntersectionObserver;
    class FakeObserver extends RealObserver {
      constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
        super(callback, options);
        callbacks.push(callback);
      }
    }
    window.IntersectionObserver = FakeObserver;
    const style = document.createElement("style");
    style.textContent = `
      @keyframes pseudo-loop-test { from { transform: translateX(0); } to { transform: translateX(20px); } }
      [data-testid="pseudo-host"]::before { content: ""; display: block; width: 10px; height: 10px;
        animation: pseudo-loop-test 1s linear infinite; }`;
    document.head.append(style);
    const view = render(
      <SheenMotionProvider>
        <div data-testid="pseudo-anchor">
          <div data-testid="pseudo-host" />
        </div>
      </SheenMotionProvider>,
    );
    const host = view.getByTestId("pseudo-host");
    const anchor = view.getByTestId("pseudo-anchor");
    const loops = () =>
      host.getAnimations({ subtree: true }).filter((a) => a.effect?.getComputedTiming().iterations === Infinity);
    const report = (isIntersecting: boolean) =>
      callbacks.forEach((cb) =>
        cb([{ target: anchor, isIntersecting } as unknown as IntersectionObserverEntry], {} as IntersectionObserver),
      );
    await expect.poll(() => offscreenLoopStats().elements, { timeout: 4000 }).toBe(1);
    expect(loops()).toHaveLength(1);
    expect(loops()[0]?.playState).toBe("running");
    report(false);
    expect(loops()[0]?.playState).toBe("paused");
    report(true);
    expect(loops()[0]?.playState).toBe("running");
    view.unmount();
    style.remove();
    window.IntersectionObserver = RealObserver;
  });
});
