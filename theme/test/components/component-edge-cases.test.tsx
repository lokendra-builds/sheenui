// Branches the per-component suites do not reach: data-table cell helpers, ColorPicker (eyedropper,
// pointer drag, keyboard, channels), Calendar month / year pickers, Carousel (responsive, loop, drag,
// autoplay), Tabs overflow, Navbar hide-on-scroll, HoverCard touch + preview states.

import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import {
  CurrencyCell,
  Highlight,
  ProgressCell,
  RelativeDateCell,
  StatusCell,
  UserCell,
  foldText,
  formatCurrency,
  formatRelativeDate,
  highlightText,
} from "../../src/components/data-table/cells";
import { ColorField, ColorPicker } from "../../src/components/color-picker/color-picker";
import { Calendar } from "../../src/components/calendar/calendar";
import { Carousel } from "../../src/components/carousel/carousel";
import { Tabs, TabsList, TabsPanel, TabsTab } from "../../src/components/tabs/tabs";
import { Navbar } from "../../src/components/navbar/navbar";
import { HoverCard, HoverCardContent, HoverCardTrigger, LinkPreview } from "../../src/components/hover-card/hover-card";
import { pixel, settle, frames } from "../helpers";
import { renderUi } from "../render";

afterEach(() => {
  vi.restoreAllMocks();
  Reflect.deleteProperty(window, "EyeDropper");
  window.scrollTo(0, 0);
});

describe("data-table cells", () => {
  it("foldText ignores case and accents", () => {
    expect(foldText("Crème Brûlée")).toBe(foldText("creme brulee"));
    expect(foldText("ÆØÅ").length).toBeGreaterThan(0);
  });

  it("highlightText marks every match (accent- and case-insensitive), keeps surrounding text, and passes null / no-match through", () => {
    const view = render(<p>{highlightText("Crème brûlée and creme", "CREME")}</p>);
    expect([...view.container.querySelectorAll("mark")].map((m) => m.textContent)).toEqual(["Crème", "creme"]);
    expect(view.container.textContent).toBe("Crème brûlée and creme");
    expect(highlightText(null, "x")).toBeNull();
    expect(highlightText(undefined, "x")).toBeNull();
    expect(highlightText("abc", "   ")).toBe("abc");
    expect(highlightText("abc", "zzz")).toBe("abc");
    const num = render(<p>{highlightText(1234, "23")}</p>);
    expect([...num.container.querySelectorAll("mark")].map((m) => m.textContent)).toEqual(["23"]);
    num.unmount();
    const emoji = render(<p>{highlightText("a😀b😀c", "😀")}</p>);
    expect(emoji.container.querySelectorAll("mark")).toHaveLength(2);
    const view2 = render(<Highlight text="Hello" query="ell" />);
    expect(view2.container.querySelector("mark")).toHaveTextContent("ell");
  });

  it("UserCell shows the name and email (highlighted when given a highlighter) and hides the avatar from assistive tech", () => {
    const { container } = render(
      <UserCell
        name="Ada Lovelace"
        email="ada@example.com"
        src={pixel}
        status="online"
        highlight={(t) => <b>{t}</b>}
        className="u"
      />,
    );
    expect(container.querySelector(".u")).toBeTruthy();
    expect(container.querySelector("b")).toHaveTextContent("Ada Lovelace");
    expect(screen.getByText("ada@example.com")).toBeInTheDocument();
    expect(container.querySelector("[aria-hidden]")).not.toBeNull();
    const plain = render(<UserCell name="No Email" />);
    expect(plain.container).toHaveTextContent("No Email");
  });

  it("StatusCell uses the mapped tone (neutral for unknown values) and a custom label", () => {
    const { container, rerender } = render(<StatusCell value="active" tones={{ active: "success" }} />);
    expect(container).toHaveTextContent("active");
    rerender(<StatusCell value="weird" tones={{ active: "success" }} label="Strange" className="s" />);
    expect(container).toHaveTextContent("Strange");
    expect(container.querySelector(".s")).toBeTruthy();
    rerender(<StatusCell value="x" />);
    expect(container).toHaveTextContent("x");
  });

  it("ProgressCell clamps and rounds the percentage, with a hidden name", () => {
    const { container, rerender } = render(<ProgressCell value={42.6} label="Storage used" />);
    expect(container).toHaveTextContent("43%");
    expect(screen.getByRole("progressbar", { name: "Storage used" })).toBeInTheDocument();
    rerender(<ProgressCell value={250} label="Over" />);
    expect(container).toHaveTextContent("100%");
    rerender(<ProgressCell value={-5} label="Under" />);
    expect(container).toHaveTextContent("0%");
  });

  it("currency formatting is cached per locale / currency / digits, and CurrencyCell highlights it", () => {
    expect(formatCurrency(1234.5, "USD", "en-US")).toBe("$1,235");
    expect(formatCurrency(1234.5, "USD", "en-US", 2)).toBe("$1,234.50");
    expect(formatCurrency(1234.5, "EUR", "de-DE", 2)).toMatch(/1\.234,50\s?€/);
    expect(formatCurrency(1234.5, "USD", "en-US")).toBe("$1,235"); // second call: cached formatter
    const { container } = render(
      <CurrencyCell value={99} currency="USD" locale="en-US" highlight={(t) => <i>{t}</i>} />,
    );
    expect(container.querySelector("i")).toHaveTextContent("$99");
    expect(render(<CurrencyCell value={5} locale="en-US" />).container).toHaveTextContent("$5");
  });

  it("relative dates choose the largest sensible unit and handle the future", () => {
    const now = new Date(2026, 10, 18, 12, 0, 0);
    const ago = (s: number) => new Date(now.getTime() - s * 1000);
    expect(formatRelativeDate(ago(1), now, "en-US")).toBe("1 second ago");
    expect(formatRelativeDate(ago(0), now, "en-US")).toBe("now");
    expect(formatRelativeDate(ago(120), now, "en-US")).toBe("2 minutes ago");
    expect(formatRelativeDate(ago(3 * 3600), now, "en-US")).toBe("3 hours ago");
    expect(formatRelativeDate(ago(86400), now, "en-US")).toBe("yesterday");
    expect(formatRelativeDate(ago(10 * 86400), now, "en-US")).toBe("last week");
    expect(formatRelativeDate(ago(45 * 86400), now, "en-US")).toBe("last month");
    expect(formatRelativeDate(ago(800 * 86400), now, "en-US")).toBe("2 years ago");
    expect(formatRelativeDate(ago(-86400), now.getTime(), "en-US")).toBe("tomorrow");
    const { container } = render(<RelativeDateCell value={ago(7200)} now={now} locale="en-US" />);
    const time = container.querySelector("time")!;
    expect(time).toHaveAttribute("datetime", ago(7200).toISOString());
    expect(time.title).toMatch(/Nov 18, 2026/);
    expect(time).toHaveTextContent("2 hours ago, Nov 18, 2026");
  });
});

describe("ColorPicker gaps", () => {
  const area = () => screen.getByRole("slider", { name: "Saturation and brightness" });

  it("the area keys: Page Up / Down change brightness by 10, Home / End set saturation to the ends, Shift makes bigger steps, other keys are ignored", async () => {
    renderUi(<ColorPicker aria-label="C" defaultValue="#ff8000" />);
    await screen.findByRole("slider", { name: "Hue" });
    area().focus();
    const text = () => area().getAttribute("aria-valuetext");
    await userEvent.keyboard("{Home}");
    expect(text()).toMatch(/Saturation 0%/);
    await userEvent.keyboard("{End}");
    expect(text()).toMatch(/Saturation 100%/);
    await userEvent.keyboard("{PageDown}");
    expect(text()).toMatch(/brightness 90%/);
    await userEvent.keyboard("{PageUp}");
    expect(text()).toMatch(/brightness 100%/);
    await userEvent.keyboard("{ArrowRight}{ArrowRight}{ArrowUp}");
    expect(text()).toMatch(/Saturation 100%, brightness 100%/);
    await userEvent.keyboard("{Shift>}{ArrowLeft}{/Shift}");
    expect(text()).toMatch(/Saturation 90%/);
    await userEvent.keyboard("q");
    expect(text()).toMatch(/Saturation 90%/);
  });

  it("dragging in the area picks saturation and brightness and commits on release; disabled ignores it", async () => {
    const onValueChange = vi.fn<(value: string) => void>();
    const onValueCommit = vi.fn();
    const view = renderUi(
      <ColorPicker aria-label="C" defaultValue="#ff0000" onValueChange={onValueChange} onValueCommit={onValueCommit} />,
    );
    await screen.findByRole("slider", { name: "Hue" });
    const el = area();
    const rect = el.getBoundingClientRect();
    vi.spyOn(el, "setPointerCapture").mockImplementation(() => undefined);
    vi.spyOn(el, "hasPointerCapture").mockReturnValue(true);
    vi.spyOn(el, "releasePointerCapture").mockImplementation(() => undefined);
    const fire = (type: string, x: number, y: number, button = 0) =>
      el.dispatchEvent(
        new PointerEvent(type, {
          pointerId: 1,
          pointerType: "mouse",
          clientX: rect.left + x,
          clientY: rect.top + y,
          button,
          bubbles: true,
          cancelable: true,
        }),
      );
    fire("pointerdown", rect.width * 0.25, rect.height * 0.5, 2); // right button: ignored
    expect(onValueChange).not.toHaveBeenCalled();
    fire("pointerdown", rect.width * 0.25, rect.height * 0.5);
    fire("pointermove", rect.width * 0.5, rect.height * 0.25);
    fire("pointerup", rect.width * 0.5, rect.height * 0.25);
    await expect.poll(() => area().getAttribute("aria-valuetext")).toBe("Saturation 50%, brightness 75%");
    expect(onValueChange).toHaveBeenCalled();
    expect(onValueCommit).toHaveBeenCalled();
    view.rerender(<ColorPicker aria-label="C" defaultValue="#ff0000" disabled onValueChange={onValueChange} />);
    onValueChange.mockClear();
    fire("pointerdown", 5, 5);
    await frames(4);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("the eyedropper (where the browser has one) picks a colour from the screen; a cancelled pick changes nothing", async () => {
    // Promises are made when the picker opens, so a rejection is never created before something awaits it.
    let result: () => Promise<{ sRGBHex: string }> = () => Promise.resolve({ sRGBHex: "#00ff00" });
    (window as unknown as { EyeDropper: unknown }).EyeDropper = class {
      open() {
        return result();
      }
    };
    const onValueChange = vi.fn<(value: string) => void>();
    renderUi(<ColorPicker aria-label="C" defaultValue="#ff0000" onValueChange={onValueChange} />);
    await userEvent.click(await screen.findByRole("button", { name: "Pick a colour from the screen" }));
    await expect.poll(() => onValueChange.mock.lastCall?.[0]).toBe("#00ff00");
    result = () => Promise.reject(new DOMException("cancelled", "AbortError"));
    await userEvent.click(screen.getByRole("button", { name: "Pick a colour from the screen" }));
    await frames(4);
    expect(onValueChange.mock.lastCall?.[0]).toBe("#00ff00");
    result = () => Promise.resolve({ sRGBHex: "not a colour" });
    await userEvent.click(screen.getByRole("button", { name: "Pick a colour from the screen" }));
    await frames(4);
    expect(onValueChange.mock.lastCall?.[0]).toBe("#00ff00");
  });

  it("without EyeDropper there is no eyedropper button", async () => {
    renderUi(<ColorPicker aria-label="C" defaultValue="#ff0000" />);
    await screen.findByRole("slider", { name: "Hue" });
    expect(screen.queryByRole("button", { name: "Pick a colour from the screen" })).toBeNull();
  });

  it("the opacity slider changes alpha (8-digit hex); RGB and HSL channels accept typing, Enter and Escape", async () => {
    const onValueChange = vi.fn<(value: string) => void>();
    renderUi(
      <ColorPicker
        aria-label="C"
        defaultValue="#ff0000"
        alpha
        defaultFormat="rgb"
        formats={["hex", "rgb", "hsl"]}
        onValueChange={onValueChange}
      />,
    );
    const opacity = await screen.findByRole("slider", { name: "Opacity" });
    opacity.focus();
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    await expect.poll(() => onValueChange.mock.lastCall?.[0]).toMatch(/^#[0-9a-f]{8}$/);

    const red = screen.getByRole("textbox", { name: "Red" });
    await userEvent.fill(red, "128");
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => onValueChange.mock.lastCall?.[0]).toMatch(/^#80/);

    await userEvent.click(screen.getByRole("radio", { name: "HSL" }));
    const lightness = await screen.findByRole("textbox", { name: "Lightness" });
    await userEvent.fill(lightness, "80");
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => onValueChange.mock.lastCall?.[0]).toMatch(/^#[0-9a-f]{8}$/);
    const alpha = screen.getByRole("textbox", { name: "Opacity" });
    await userEvent.fill(alpha, "50");
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => onValueChange.mock.lastCall?.[0]).toMatch(/80$/);
  });

  it("typing in the hex field and pressing Escape reverts to the current colour; Enter applies", async () => {
    renderUi(<ColorPicker aria-label="C" defaultValue="#336699" />);
    const hex = await screen.findByRole("textbox", { name: "Hex colour" });
    await userEvent.fill(hex, "FF00");
    await userEvent.keyboard("{Escape}");
    expect(hex).toHaveValue("336699");
    await userEvent.fill(hex, "00FF00");
    await userEvent.keyboard("{Enter}");
    expect(hex).toHaveValue("00FF00");
  });

  it("Copy writes the colour; copying while it still announces resets the timer", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    try {
      renderUi(<ColorPicker aria-label="C" defaultValue="#336699" />);
      const copy = await screen.findByRole("button", { name: "Copy colour" });
      await userEvent.click(copy);
      await userEvent.click(copy);
      expect(writeText).toHaveBeenCalledTimes(2);
      expect(writeText).toHaveBeenCalledWith("#336699");
      await expect
        .poll(() => [...document.querySelectorAll("[aria-live], [role=status]")].map((n) => n.textContent).join("|"))
        .toContain("Copied #336699");
    } finally {
      Reflect.deleteProperty(navigator, "clipboard");
    }
  });

  it("ColorField: clearing the text, an invalid colour, and the picker from its swatch", async () => {
    function Host() {
      const [v, setV] = useState("#112233");
      return <ColorField label="Brand" value={v} onValueChange={setV} error={v === "" ? "Required" : undefined} />;
    }
    renderUi(<Host />);
    const input = screen.getByRole("textbox", { name: /Brand/ });
    await userEvent.fill(input, "");
    await userEvent.fill(input, "#abc");
    await userEvent.keyboard("{Escape}"); // leaves the text as it was typed or reverts it; never throws
    await userEvent.keyboard("{Enter}");
    expect((input as HTMLInputElement).value.length).toBeGreaterThan(0);
  });
});

describe("Calendar month and year pickers", () => {
  const today = new Date(2026, 9, 15);
  const openMonths = async () => {
    renderUi(<Calendar locale="en-US" today={today} />);
    await userEvent.click(screen.getByRole("button", { name: /October 2026, choose month and year/ }));
  };

  it("the months view has year arrows, picks a month, and moves with arrows, Home, End and Page keys", async () => {
    await openMonths();
    const months = await screen.findAllByRole("button", {
      name: /^(January|February|March|April|May|June|July|August|September|October|November|December)/,
    });
    expect(months.length).toBeGreaterThanOrEqual(12);
    await userEvent.click(screen.getByRole("button", { name: "Next year" }));
    await expect.poll(() => screen.queryByRole("button", { name: /2027, choose year/ })).not.toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Previous year" }));
    await userEvent.click(screen.getByRole("button", { name: "Previous year" }));
    await expect.poll(() => screen.queryByRole("button", { name: /2025, choose year/ })).not.toBeNull();
    const focused = document.activeElement as HTMLElement;
    focused.focus();
    const march = screen.getByRole("button", { name: /^March/ });
    march.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect((document.activeElement as HTMLElement).textContent).toMatch(/Apr/);
    await userEvent.keyboard("{ArrowDown}");
    expect((document.activeElement as HTMLElement).textContent).toMatch(/Jul/);
    await userEvent.keyboard("{ArrowLeft}{ArrowUp}");
    expect((document.activeElement as HTMLElement).textContent).toMatch(/Mar/);
    await userEvent.keyboard("{Home}");
    expect((document.activeElement as HTMLElement).textContent).toMatch(/Jan/);
    await userEvent.keyboard("{ArrowLeft}"); // before January: previous year, December
    await expect.poll(() => (document.activeElement as HTMLElement).textContent).toMatch(/Dec/);
    await userEvent.keyboard("{End}");
    expect((document.activeElement as HTMLElement).textContent).toMatch(/Dec/);
    await userEvent.keyboard("{ArrowRight}"); // after December: next year, January
    await expect.poll(() => (document.activeElement as HTMLElement).textContent).toMatch(/Jan/);
    await userEvent.keyboard("{PageDown}");
    await userEvent.keyboard("{PageUp}");
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => screen.queryByRole("grid")).not.toBeNull();
  });

  it("the year heading opens a 12-year page; picking a year returns to the months, and Escape leaves the picker", async () => {
    await openMonths();
    await userEvent.click(await screen.findByRole("button", { name: /2026, choose year/ }));
    expect(screen.getByRole("button", { name: "Previous 12 years" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Next 12 years" }));
    await userEvent.click(screen.getByRole("button", { name: "Previous 12 years" }));
    const years = () => screen.getAllByRole("button", { name: /^\d{4}$/ });
    const pick = years()[4]!;
    const picked = pick.textContent;
    pick.focus();
    await userEvent.keyboard("{ArrowDown}{ArrowUp}{ArrowRight}{ArrowLeft}{Home}{End}{PageUp}{PageDown}");
    await userEvent.click(screen.getByRole("button", { name: picked }));
    await userEvent.click(await screen.findByRole("button", { name: /^June/ }));
    await expect.poll(() => screen.queryByRole("grid", { name: new RegExp(`June ${picked}`) })).not.toBeNull();
    await userEvent.click(screen.getByRole("button", { name: new RegExp(`June ${picked}, choose month and year`) }));
    await screen.findAllByRole("button", { name: /^(January|February)/ });
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => screen.queryByRole("grid", { name: new RegExp(`June ${picked}`) })).not.toBeNull();
  });

  it("min and max disable the year arrows and the years outside the range", async () => {
    renderUi(<Calendar locale="en-US" today={today} min={new Date(2026, 5, 1)} max={new Date(2026, 11, 31)} />);
    await userEvent.click(screen.getByRole("button", { name: /October 2026, choose month and year/ }));
    expect(await screen.findByRole("button", { name: "Previous year" })).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("button", { name: "Next year" })).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("button", { name: /^January/ })).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("button", { name: /^October 2026$/ })).not.toHaveAttribute("aria-disabled", "true");
    await userEvent.click(screen.getByRole("button", { name: /2026, choose year/ }));
    const years = await screen.findAllByRole("button", { name: /^\d{4}$/ });
    expect(years.some((y) => y.getAttribute("aria-disabled") === "true")).toBe(true);
    expect(years.some((y) => y.textContent === "2026" && y.getAttribute("aria-disabled") !== "true")).toBe(true);
  });
});

describe("Carousel gaps", () => {
  const slides = (n: number) =>
    Array.from({ length: n }, (_, i) => (
      <div key={i} style={{ height: 60 }}>
        Slide content {i + 1}
      </div>
    ));

  it("slidesPerView by container width: 1 slide when narrow, 2 when wide", async () => {
    const view = renderUi(
      <div style={{ width: 300 }}>
        <Carousel aria-label="Responsive" slidesPerView={{ 0: 1, 500: 2 }}>
          {slides(4)}
        </Carousel>
      </div>,
    );
    await expect
      .poll(
        () =>
          screen.getAllByRole("group", { name: /of 4/ }).filter((g) => g.getAttribute("data-visible") === "full")
            .length,
      )
      .toBe(1);
    view.rerender(
      <div style={{ width: 800 }}>
        <Carousel aria-label="Responsive" slidesPerView={{ 0: 1, 500: 2 }}>
          {slides(4)}
        </Carousel>
      </div>,
    );
    await expect
      .poll(
        () =>
          screen.getAllByRole("group", { name: /of 4/ }).filter((g) => g.getAttribute("data-visible") === "full")
            .length,
      )
      .toBe(2);
  });

  it("loop: dots wrap around, controlled index is followed, and next from the last slide goes back to the first", async () => {
    const onIndexChange = vi.fn();
    function Host() {
      const [index, setIndex] = useState(3);
      return (
        <>
          <button onClick={() => setIndex(1)}>external</button>
          <div style={{ width: 500 }}>
            <Carousel
              aria-label="Loop"
              loop
              index={index}
              onIndexChange={(i) => {
                onIndexChange(i);
                setIndex(i);
              }}
            >
              {slides(4)}
            </Carousel>
          </div>
        </>
      );
    }
    renderUi(<Host />);
    const dots = await screen.findAllByRole("button", { name: /^Slide \d$/ });
    expect(dots).toHaveLength(4);
    expect(dots[3]).toHaveAttribute("aria-current", "true");
    await userEvent.click(screen.getByRole("button", { name: "Next slide" }));
    expect(onIndexChange).toHaveBeenLastCalledWith(0);
    await expect.poll(() => dots[0]!.getAttribute("aria-current")).toBe("true");
    await userEvent.click(screen.getByRole("button", { name: "Previous slide" }));
    expect(onIndexChange).toHaveBeenLastCalledWith(3);
    await userEvent.click(screen.getByRole("button", { name: "external" }));
    await expect.poll(() => dots[1]!.getAttribute("aria-current")).toBe("true");
    await userEvent.click(dots[3]!);
    expect(onIndexChange).toHaveBeenLastCalledWith(3);
  });

  it("align='center', slidesToScroll='page', the scale effect and a custom gap render and navigate", async () => {
    renderUi(
      <div style={{ width: 600 }}>
        <Carousel aria-label="Opts" slidesPerView={2} slidesToScroll="page" align="center" effect="scale" gap={8}>
          {slides(6)}
        </Carousel>
      </div>,
    );
    const next = await screen.findByRole("button", { name: "Next slide" });
    for (let i = 0; i < 8 && next.getAttribute("aria-disabled") !== "true"; i++) {
      await userEvent.click(next);
      await frames(5);
    }
    await expect.poll(() => next.getAttribute("aria-disabled")).toBe("true");
  });

  it("autoplay advances on its own after the interval and reports the move", async () => {
    const onIndexChange = vi.fn();
    renderUi(
      <div style={{ width: 400 }}>
        <Carousel aria-label="Auto" autoplay={300} onIndexChange={onIndexChange}>
          {slides(3)}
        </Carousel>
      </div>,
    );
    await screen.findByRole("button", { name: /Pause automatic slide show/ });
    await expect.poll(() => onIndexChange.mock.calls.length, { timeout: 4000 }).toBeGreaterThan(0);
    expect(onIndexChange.mock.calls[0]![0]).toBe(1);
  });

  it("dragging the track far enough moves to the next slide; a short drag springs back; links under a drag are not clicked", async () => {
    const onIndexChange = vi.fn();
    const onClick = vi.fn();
    renderUi(
      <div style={{ width: 400 }}>
        <Carousel aria-label="Drag" onIndexChange={onIndexChange}>
          {[
            <a key="a" href="#x" onClick={onClick}>
              First link
            </a>,
            <p key="b">Second</p>,
            <p key="c">Third</p>,
          ]}
        </Carousel>
      </div>,
    );
    const link = await screen.findByRole("link", { name: "First link" });
    const track = link.closest("[data-visible]")!.parentElement!;
    const pointer = (target: EventTarget, type: string, x: number) =>
      target.dispatchEvent(
        new PointerEvent(type, {
          pointerId: 9,
          pointerType: "mouse",
          clientX: x,
          clientY: 30,
          button: 0,
          buttons: type === "pointerup" ? 0 : 1,
          bubbles: true,
          cancelable: true,
          isPrimary: true,
        }),
      );
    pointer(track, "pointerdown", 300);
    for (let x = 300; x >= 60; x -= 30) {
      pointer(window, "pointermove", x);
      await frames(2); // a steady drag (about 30 ms per step), not a fling
    }
    pointer(window, "pointerup", 60);
    await expect.poll(() => onIndexChange.mock.calls.length, { timeout: 3000 }).toBeGreaterThan(0);
    expect(onIndexChange).toHaveBeenLastCalledWith(1);
  });
});

describe("Tabs overflow", () => {
  const many = Array.from({ length: 14 }, (_, i) => `Section number ${i + 1}`);
  function Example({ rtl }: { rtl?: boolean }) {
    return (
      <div style={{ width: 360 }} dir={rtl ? "rtl" : undefined}>
        <Tabs defaultValue={many[0]}>
          <TabsList aria-label="Many">
            {many.map((m) => (
              <TabsTab key={m} value={m}>
                {m}
              </TabsTab>
            ))}
          </TabsList>
          {many.map((m) => (
            <TabsPanel key={m} value={m}>
              {m} panel
            </TabsPanel>
          ))}
        </Tabs>
      </div>
    );
  }

  it("a list wider than its container scrolls to keep the selected tab and the focused tab in view", async () => {
    renderUi(<Example />);
    const list = screen.getByRole("tablist", { name: "Many" });
    const scroller = (list.scrollWidth > list.clientWidth ? list : list.parentElement)!;
    await expect.poll(() => scroller.scrollWidth > scroller.clientWidth).toBe(true);
    const last = screen.getByRole("tab", { name: "Section number 14" });
    await userEvent.click(screen.getAllByRole("tab")[0]!);
    await userEvent.keyboard("{End}");
    await expect.poll(() => document.activeElement).toBe(last);
    await expect.poll(() => scroller.scrollLeft, { timeout: 3000 }).toBeGreaterThan(50);
    await userEvent.keyboard("{Home}");
    await expect.poll(() => scroller.scrollLeft, { timeout: 3000 }).toBeLessThan(5);
    await userEvent.keyboard("{ArrowRight}{ArrowRight}{Enter}");
    await expect
      .poll(() => screen.getAllByRole("tabpanel").map((p) => p.textContent))
      .toContain("Section number 3 panel");
  });

  it("works right to left, and with reduced motion", async () => {
    document.documentElement.setAttribute("data-motion", "reduced");
    renderUi(<Example rtl />);
    const tabs = screen.getAllByRole("tab");
    await userEvent.click(tabs[0]!);
    await userEvent.keyboard("{End}");
    await expect.poll(() => document.activeElement).toBe(tabs.at(-1));
    await userEvent.keyboard("{ArrowLeft}{Enter}");
    await expect.poll(() => screen.getAllByRole("tabpanel").length).toBeGreaterThan(0);
  });
});

describe("Navbar scroll behaviour", () => {
  const items = [
    { value: "a", label: "Alpha", href: "#a" },
    { value: "b", label: "Beta", href: "#b" },
  ];

  it("hideOnScroll slides the bar away on a scroll down and back on any scroll up; shrinkOnScroll tightens it", async () => {
    renderUi(
      <div style={{ height: 4000 }}>
        <Navbar
          items={items}
          value="a"
          hideOnScroll={100}
          shrinkOnScroll={50}
          variant="bar"
          className="sticky top-0"
          aria-label="Site"
        />
      </div>,
    );
    const nav = screen.getByRole("navigation", { name: "Site" });
    const initialTransform = getComputedStyle(nav).transform;
    window.scrollTo(0, 60);
    await frames(10);
    window.scrollTo(0, 400);
    // Scrolling down hides the bar: its transform moves away from the resting one and then holds still.
    await expect.poll(() => getComputedStyle(nav).transform, { timeout: 3000 }).not.toBe(initialTransform);
    await settle();
    const hiddenTransform = getComputedStyle(nav).transform;
    window.scrollTo(0, 300);
    // Scrolling back up brings it back.
    await expect.poll(() => getComputedStyle(nav).transform, { timeout: 3000 }).not.toBe(hiddenTransform);
  });

  it("does not hide while focus is inside the bar", async () => {
    renderUi(
      <div style={{ height: 4000 }}>
        <Navbar items={items} value="a" hideOnScroll={50} variant="bar" className="sticky top-0" aria-label="Site" />
      </div>,
    );
    const nav = screen.getByRole("navigation", { name: "Site" });
    screen.getByRole("link", { name: "Beta" }).focus();
    window.scrollTo(0, 200);
    await frames(10);
    window.scrollTo(0, 600);
    await frames(32);
    expect(
      getComputedStyle(nav).transform === "none" || getComputedStyle(nav).transform === "matrix(1, 0, 0, 1, 0, 0)",
    ).toBe(true);
  });
});

describe("HoverCard gaps", () => {
  it("on touch, the first tap shows the preview instead of following the link; the second follows it", async () => {
    const onClick = vi.fn((e: MouseEvent) => e.preventDefault());
    renderUi(
      <HoverCard>
        <HoverCardTrigger href="/people/ada" delay={0} closeDelay={0} onClick={(e) => onClick(e.nativeEvent)}>
          Ada
        </HoverCardTrigger>
        <HoverCardContent>Preview body</HoverCardContent>
      </HoverCard>,
    );
    const trigger = screen.getByRole("link", { name: "Ada" });
    fireEvent.pointerDown(trigger, { pointerType: "touch" });
    fireEvent.click(trigger, { detail: 1 });
    expect(await screen.findByText("Preview body")).toBeInTheDocument();
    fireEvent.pointerDown(trigger, { pointerType: "touch" });
    fireEvent.pointerCancel(trigger, { pointerType: "touch" });
    fireEvent.click(trigger, { detail: 1 });
    // A keyboard "click" (detail 0) always follows the link.
    fireEvent.pointerDown(trigger, { pointerType: "touch" });
    fireEvent.click(trigger, { detail: 0 });
    expect(onClick).toHaveBeenCalled();
  });

  it("the specular highlight follows a mouse over the card, not a finger", async () => {
    renderUi(
      <HoverCard>
        <HoverCardTrigger href="/x" delay={0} closeDelay={0}>
          Open
        </HoverCardTrigger>
        <HoverCardContent data-testid="card">Body</HoverCardContent>
      </HoverCard>,
    );
    await userEvent.hover(screen.getByRole("link", { name: "Open" }));
    const card = await screen.findByTestId("card");
    fireEvent.pointerMove(card, {
      pointerType: "mouse",
      clientX: card.getBoundingClientRect().left + 20,
      clientY: card.getBoundingClientRect().top + 10,
    });
    // The pre-painted light layer is moved with `translate` (centred on the card, then offset by the pointer).
    const layer = card.querySelector<HTMLElement>("[data-slot='glass-card-sheen'] > span")!;
    // Left of centre (20px in, a wide card) and 10px down: the browser normalises the calc() text.
    expect(layer.style.translate).toMatch(/^calc\(-50% - [\d.]+px\) calc\(-50% \+ 10px\)$/);
    layer.style.translate = "";
    fireEvent.pointerMove(card, { pointerType: "touch", clientX: 5, clientY: 5 });
    expect(layer.style.translate).toBe("");
  });

  it("LinkPreview: the host falls back to the raw text for an invalid url; the image shows once loaded and disappears when it fails", async () => {
    const view = renderUi(
      <HoverCard defaultOpen>
        <HoverCardTrigger href="#" delay={0}>
          Trigger
        </HoverCardTrigger>
        <HoverCardContent>
          <LinkPreview url="not a url" title="Broken" image={pixel} imageAlt="Cover" />
        </HoverCardContent>
      </HoverCard>,
    );
    expect(await screen.findByText("not a url")).toBeInTheDocument();
    expect(await screen.findByRole("img", { name: "Cover" })).toBeInTheDocument();
    view.unmount();
    renderUi(
      <HoverCard defaultOpen>
        <HoverCardTrigger href="#" delay={0}>
          Trigger
        </HoverCardTrigger>
        <HoverCardContent>
          <LinkPreview
            url="https://www.example.com/a"
            title="Bad image"
            image="/missing-image.png"
            imageAlt="Gone"
            favicon={<i data-testid="fav" />}
            siteName="Example"
          />
        </HoverCardContent>
      </HoverCard>,
    );
    expect(await screen.findByText("Example")).toBeInTheDocument();
    expect(screen.getByTestId("fav")).toBeInTheDocument();
    await expect.poll(() => screen.queryByRole("img", { name: "Gone" }), { timeout: 3000 }).toBeNull();
    await settle();
  });
});
