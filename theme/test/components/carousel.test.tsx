import { expect, it, vi } from "vitest";
import { useState } from "react";
import { screen, within } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { Carousel } from "../../src/components/carousel/carousel";
import { CarouselCaption } from "../../src/components/carousel/carousel-caption";
import { lastArg, reduceMotion } from "../helpers";
import { describeVariants, renderUi, runAxe } from "../render";

const slides = (n = 5) =>
  Array.from({ length: n }, (_, i) => (
    <div key={i} style={{ height: 120 }}>
      <a href={`#s${i + 1}`}>Slide content {i + 1}</a>
    </div>
  ));

const carousel = () => screen.getByRole("region", { name: "Featured" });
const live = () => carousel().querySelector<HTMLElement>("[aria-live]")!;
const dot = (n: number) => screen.getByRole("button", { name: `Slide ${n}` });
const current = () =>
  within(screen.getByRole("group", { name: "Choose a slide" }))
    .getAllByRole("button")
    .findIndex((b) => b.getAttribute("aria-current") === "true") + 1;

describeVariants((variant) => {
  it("is a named region with a carousel role description and one labelled slide group per child", () => {
    renderUi(
      <div style={{ width: 600 }}>
        <Carousel aria-label="Featured">{slides(4)}</Carousel>
      </div>,
      variant,
    );
    expect(carousel()).toHaveAttribute("aria-roledescription", "carousel");
    const groups = within(carousel()).getAllByRole("group", { name: /^\d of 4$/ });
    expect(groups).toHaveLength(4);
    expect(groups[0]).toHaveAttribute("aria-roledescription", "slide");
    expect(groups[0]).toHaveAccessibleName("1 of 4");
  });

  it("the arrows move one slide at a time and are aria-disabled at the ends (focus is kept)", async () => {
    renderUi(
      <div style={{ width: 600 }}>
        <Carousel aria-label="Featured">{slides(3)}</Carousel>
      </div>,
      variant,
    );
    const prev = screen.getByRole("button", { name: "Previous slide" });
    const next = screen.getByRole("button", { name: "Next slide" });
    expect(prev).toHaveAttribute("aria-disabled", "true");
    expect(current()).toBe(1);
    await userEvent.click(next);
    await expect.poll(current).toBe(2);
    await userEvent.click(next);
    await expect.poll(current).toBe(3);
    expect(next).toHaveAttribute("aria-disabled", "true");
    next.focus();
    await userEvent.keyboard("{Enter}");
    expect(next).toHaveFocus();
    await userEvent.click(prev);
    await expect.poll(current).toBe(2);
  });

  it("arrow keys on the control row move slides; Home and End jump to the first and last", async () => {
    renderUi(
      <div style={{ width: 600 }}>
        <Carousel aria-label="Featured">{slides(5)}</Carousel>
      </div>,
      variant,
    );
    screen.getByRole("button", { name: "Next slide" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect.poll(current).toBe(2);
    await userEvent.keyboard("{End}");
    await expect.poll(current).toBe(5);
    await userEvent.keyboard("{ArrowLeft}");
    await expect.poll(current).toBe(4);
    await userEvent.keyboard("{Home}");
    await expect.poll(current).toBe(1);
  });

  it("dots go to a slide, mark the current one and the live region announces it", async () => {
    renderUi(
      <div style={{ width: 600 }}>
        <Carousel aria-label="Featured">{slides(5)}</Carousel>
      </div>,
      variant,
    );
    await userEvent.click(dot(4));
    await expect.poll(current).toBe(4);
    await expect.poll(() => live().textContent).toBe("Slide 4 of 5");
    expect(live()).toHaveAttribute("aria-live", "polite");
  });

  it("slides that are off screen are inert so Tab never lands on hidden links", async () => {
    renderUi(
      <div style={{ width: 600 }}>
        <Carousel aria-label="Featured">{slides(3)}</Carousel>
      </div>,
      variant,
    );
    const groups = within(carousel()).getAllByRole("group", { name: /of 3$/, hidden: true });
    expect(groups[0]).not.toHaveAttribute("inert");
    await expect.poll(() => groups[2]!.hasAttribute("inert")).toBe(true);
    await userEvent.click(dot(3));
    await expect.poll(() => groups[2]!.hasAttribute("inert")).toBe(false);
    await expect.poll(() => groups[0]!.hasAttribute("inert")).toBe(true);
  });

  it("slidesPerView shows several slides and names ranges ('Slides 1 to 2 of 4')", async () => {
    renderUi(
      <div style={{ width: 800 }}>
        <Carousel aria-label="Featured" slidesPerView={2}>
          {slides(4)}
        </Carousel>
      </div>,
      variant,
    );
    expect(screen.getAllByRole("button", { name: /^Slides? \d/ }).length).toBeGreaterThanOrEqual(2);
    await userEvent.click(screen.getByRole("button", { name: "Next slide" }));
    await expect.poll(() => live().textContent).toMatch(/Slides \d to \d of 4/);
  });

  it("loop never disables the arrows", async () => {
    renderUi(
      <div style={{ width: 600 }}>
        <Carousel aria-label="Featured" loop>
          {slides(5)}
        </Carousel>
      </div>,
      variant,
    );
    const prev = screen.getByRole("button", { name: "Previous slide" });
    expect(prev).not.toHaveAttribute("aria-disabled", "true");
    await userEvent.click(prev);
    await expect.poll(current).toBe(5);
  });

  it("controlled index + onIndexChange; defaultIndex sets the start", async () => {
    function Controlled() {
      const [i, setI] = useState(2);
      return (
        <>
          <div style={{ width: 600 }}>
            <Carousel aria-label="Featured" index={i} onIndexChange={setI}>
              {slides(4)}
            </Carousel>
          </div>
          <button onClick={() => setI(0)}>reset</button>
          <output>{i}</output>
        </>
      );
    }
    renderUi(<Controlled />, variant);
    await expect.poll(current).toBe(3);
    await userEvent.click(screen.getByRole("button", { name: "Next slide" }));
    await expect.poll(() => document.querySelector("output")?.textContent).toBe("3");
    await userEvent.click(screen.getByRole("button", { name: "reset" }));
    await expect.poll(current).toBe(1);
  });

  it("onIndexChange reports user moves, not the initial mount", async () => {
    const onIndexChange = vi.fn();
    renderUi(
      <div style={{ width: 600 }}>
        <Carousel aria-label="Featured" onIndexChange={onIndexChange} defaultIndex={1}>
          {slides(4)}
        </Carousel>
      </div>,
      variant,
    );
    await expect.poll(current).toBe(2);
    expect(onIndexChange).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Next slide" }));
    await expect.poll(() => lastArg(onIndexChange)).toBe(2);
  });

  it("arrows='overlay' puts the buttons on the slides; arrows={false} and dots={false} remove controls", () => {
    const { rerender } = renderUi(
      <div style={{ width: 600 }}>
        <Carousel aria-label="Featured" arrows="overlay">
          {slides(3)}
        </Carousel>
      </div>,
      variant,
    );
    expect(screen.getByRole("button", { name: "Next slide" })).toBeInTheDocument();
    rerender(
      <div style={{ width: 600 }}>
        <Carousel aria-label="Featured" arrows={false} dots={false}>
          {slides(3)}
        </Carousel>
      </div>,
    );
    expect(screen.queryByRole("button", { name: "Next slide" })).toBeNull();
    expect(screen.queryByRole("group", { name: "Choose a slide" })).toBeNull();
    // With no controls the slide area itself becomes the keyboard target.
    expect(screen.getByRole("group", { name: "Slides" })).toHaveAttribute(
      "aria-keyshortcuts",
      "ArrowLeft ArrowRight Home End",
    );
  });

  it("autoplay: a pause button is shown, pausing silences it, and the live region is off while it rotates", async () => {
    renderUi(
      <div style={{ width: 600 }}>
        <Carousel aria-label="Featured" autoplay={60000}>
          {slides(3)}
        </Carousel>
      </div>,
      variant,
    );
    const pause = screen.getByRole("button", { name: "Pause automatic slide show" });
    expect(live()).toHaveAttribute("aria-live", "off");
    await userEvent.click(pause);
    expect(screen.getByRole("button", { name: "Start automatic slide show" })).toBeInTheDocument();
    await expect.poll(() => live().getAttribute("aria-live")).toBe("polite");
  });

  it("labels translate the carousel (i18n)", () => {
    renderUi(
      <div style={{ width: 600 }}>
        <Carousel
          aria-label="Empfohlen"
          labels={{
            carousel: "Karussell",
            slide: "Folie",
            slideLabel: (i, n) => `${i} von ${n}`,
            next: "Weiter",
            previous: "Zurück",
            picker: "Folie wählen",
          }}
        >
          {slides(3)}
        </Carousel>
      </div>,
      variant,
    );
    const region = screen.getByRole("region", { name: "Empfohlen" });
    expect(region).toHaveAttribute("aria-roledescription", "Karussell");
    expect(within(region).getByRole("group", { name: "2 von 3", hidden: true })).toHaveAttribute(
      "aria-roledescription",
      "Folie",
    );
    expect(screen.getByRole("button", { name: "Weiter" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Folie wählen" })).toBeInTheDocument();
  });

  it("has no axe violations (default, overlay arrows with autoplay, several slides)", async () => {
    renderUi(
      <div className="grid gap-6" style={{ width: 700 }}>
        <Carousel aria-label="One">{slides(4)}</Carousel>
        <Carousel aria-label="Two" arrows="overlay" autoplay={60000} loop>
          {slides(5)}
        </Carousel>
        <Carousel aria-label="Three" slidesPerView={2} effect="scale">
          {slides(5)}
        </Carousel>
      </div>,
      variant,
    );
    expect(await runAxe()).toHaveNoViolations();
  });
});

it("reduced motion: autoplay never starts by itself", () => {
  reduceMotion();
  renderUi(
    <div style={{ width: 600 }}>
      <Carousel aria-label="Featured" autoplay={200}>
        {slides(3)}
      </Carousel>
    </div>,
  );
  // Slides must not advance on their own, so the "start" button is offered instead of "pause".
  expect(screen.queryByRole("button", { name: "Pause automatic slide show" })).toBeNull();
  expect(current()).toBe(1);
});

/** Composite a CSS colour over a solid backdrop through a canvas and return linear-light luminance. */
const luminanceOver = (colour: string, backdrop: string) => {
  const c = document.createElement("canvas");
  c.width = c.height = 1;
  const g = c.getContext("2d", { willReadFrequently: true })!;
  g.fillStyle = backdrop;
  g.fillRect(0, 0, 1, 1);
  g.fillStyle = colour;
  g.fillRect(0, 0, 1, 1);
  const [r, gr, b] = Array.from(g.getImageData(0, 0, 1, 1).data).map((v) => {
    const x = v / 255;
    return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * gr! + 0.0722 * b!;
};

describeVariants((variant) => {
  it("CarouselCaption keeps 4.5:1 over the brightest possible image", async () => {
    renderUi(
      <div style={{ position: "relative", height: 120, background: "white" }}>
        <CarouselCaption data-testid="cap">Forest</CarouselCaption>
      </div>,
      variant,
    );
    const cap = screen.getByTestId("cap");
    const root = getComputedStyle(cap);
    const scrim = /(color\([^)]*\)|oklch\([^)]*\)|rgba?\([^)]*\))/.exec(root.backgroundImage)?.[1];
    expect(scrim).toBeTruthy();
    const bg = luminanceOver(scrim!, "white");
    const fg = luminanceOver(root.color, "black");
    expect((fg + 0.05) / (bg + 0.05)).toBeGreaterThanOrEqual(4.5);
    expect(await runAxe(cap.parentElement!)).toHaveNoViolations();
  });
});

describeVariants((variant) => {
  it("keeps the caption text clear of the overlay arrows and fills a centred parent", () => {
    renderUi(
      <div style={{ width: 600, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Carousel aria-label="Featured" arrows="overlay">
          {["Dunes", "Glacier"].map((t) => (
            <div key={t} style={{ position: "relative", height: 80 }}>
              <CarouselCaption>{t}</CarouselCaption>
            </div>
          ))}
        </Carousel>
      </div>,
      variant,
    );
    expect(carousel().getBoundingClientRect().width).toBe(600);
    const cap = carousel().querySelector<HTMLElement>("[data-slot=carousel-caption]")!;
    const cs = getComputedStyle(cap);
    const inner = cap.getBoundingClientRect();
    const textLeft = inner.left + parseFloat(cs.paddingLeft);
    const textRight = inner.right - parseFloat(cs.paddingRight);
    for (const name of ["Previous slide", "Next slide"]) {
      const r = screen.getByRole("button", { name }).getBoundingClientRect();
      expect(r.right <= textLeft || r.left >= textRight).toBe(true);
    }
  });
});
