import { expect, it, vi } from "vitest";
import { useState } from "react";
import { screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { Textarea } from "../../src/components/textarea/textarea";
import { describeVariants, renderUi, runAxe } from "../render";

const counter = () => document.querySelector<HTMLElement>("[data-slot=textarea-counter]");
const noop = vi.fn();
const polite = () =>
  [...document.querySelectorAll<HTMLElement>("[aria-live=polite]")].map((e) => e.textContent).join("|");

describeVariants((variant) => {
  it("is a labelled textbox with a description", () => {
    renderUi(<Textarea label="Bio" description="Tell us about you" placeholder="Hello" />, variant);
    const box = screen.getByRole("textbox", { name: "Bio" });
    expect(box).toHaveAccessibleDescription("Tell us about you");
    expect(box).toHaveAttribute("placeholder", "Hello");
  });

  it("types text (uncontrolled) and reports changes", async () => {
    const onChange = vi.fn();
    renderUi(<Textarea label="Notes" onChange={onChange} />, variant);
    const box = screen.getByRole("textbox", { name: "Notes" });
    await userEvent.click(box);
    await userEvent.keyboard("hi{Enter}there");
    expect(box).toHaveValue("hi\nthere");
    expect(onChange).toHaveBeenCalled();
  });

  it("controlled value follows the parent", async () => {
    function Controlled() {
      const [v, setV] = useState("start");
      return (
        <>
          <Textarea label="Controlled" value={v} onChange={(e) => setV(e.target.value.toUpperCase())} />
          <button onClick={() => setV("reset")}>reset</button>
        </>
      );
    }
    renderUi(<Controlled />, variant);
    const box = screen.getByRole("textbox", { name: "Controlled" });
    expect(box).toHaveValue("start");
    await userEvent.click(box);
    await userEvent.keyboard("ab");
    expect(box).toHaveValue("STARTAB");
    await userEvent.click(screen.getByRole("button", { name: "reset" }));
    expect(box).toHaveValue("reset");
  });

  it("maxLength shows the counter and the screen-reader count; typing stops at the limit", async () => {
    renderUi(<Textarea label="Tweet" maxLength={5} />, variant);
    const box = screen.getByRole("textbox", { name: "Tweet" });
    expect(counter()).toHaveTextContent("0/5");
    expect(counter()).toHaveAttribute("aria-hidden", "true");
    expect(box).toHaveAccessibleDescription(/0 of 5 characters used/);
    await userEvent.click(box);
    await userEvent.keyboard("abcdefgh");
    expect(box).toHaveValue("abcde");
    expect(counter()).toHaveTextContent("5/5");
    expect(counter()).toHaveAttribute("data-tone", "limit");
    expect(box).toHaveAccessibleDescription(/5 of 5 characters used/);
    // Reaching the limit is announced politely once.
    await expect.poll(polite).toContain("Character limit reached");
  });

  it("announces 'N characters left' when the limit is near", async () => {
    renderUi(<Textarea label="Short" maxLength={25} defaultValue="abcde" />, variant);
    const box = screen.getByRole("textbox", { name: "Short" });
    await userEvent.click(box);
    // Ten more characters: the last keystroke crosses the "10 left" threshold.
    await userEvent.keyboard("{End}fghijklmno");
    await expect.poll(polite).toContain("10 characters left");
  });

  it("keeps the announcement when another keystroke lands in the same frame", async () => {
    const { rerender } = renderUi(
      <Textarea label="Short" maxLength={25} value={"x".repeat(14)} onChange={noop} />,
      variant,
    );
    // Crosses "10 left", then the next keystroke re-renders before the frame that sets the message.
    rerender(<Textarea label="Short" maxLength={25} value={"x".repeat(15)} onChange={noop} />);
    rerender(<Textarea label="Short" maxLength={25} value={"x".repeat(16)} onChange={noop} />);
    await expect.poll(polite).toContain("10 characters left");
    expect(polite().match(/characters left/g)).toHaveLength(1);
  });

  it('limit="warn" lets you type past the limit and marks the field invalid', async () => {
    renderUi(<Textarea label="Warn" maxLength={3} limit="warn" />, variant);
    const box = screen.getByRole("textbox", { name: "Warn" });
    await userEvent.click(box);
    await userEvent.keyboard("abcd");
    expect(box).toHaveValue("abcd");
    await expect.poll(polite).toContain("1 character over the limit");
    await userEvent.keyboard("e");
    expect(box).toHaveValue("abcde");
    await expect.poll(() => box.getAttribute("aria-invalid")).toBe("true");
    expect(counter()).toHaveAttribute("data-tone", "over");
    expect(counter()).toHaveTextContent("−2");
  });

  it("showCount without maxLength counts up; showCount={false} hides it", async () => {
    const { rerender } = renderUi(<Textarea label="Count" showCount />, variant);
    await userEvent.click(screen.getByRole("textbox", { name: "Count" }));
    await userEvent.keyboard("abc");
    expect(counter()).toHaveTextContent("3");
    rerender(<Textarea label="Count" maxLength={10} showCount={false} />);
    expect(counter()).toBeNull();
  });

  it("`labels` overrides the counter strings (i18n)", async () => {
    renderUi(
      <Textarea
        label="Notiz"
        maxLength={4}
        labels={{ count: (n, max) => `${n} von ${max} Zeichen`, reached: "Limit erreicht" }}
      />,
      variant,
    );
    const box = screen.getByRole("textbox", { name: "Notiz" });
    expect(box).toHaveAccessibleDescription(/0 von 4 Zeichen/);
    await userEvent.click(box);
    await userEvent.keyboard("abcd");
    await expect.poll(polite).toContain("Limit erreicht");
  });

  it("error text marks the field invalid and replaces the description", () => {
    renderUi(<Textarea label="Bio" description="Helpful" error="Too short" />, variant);
    expect(screen.getByText("Too short")).toBeInTheDocument();
    expect(screen.queryByText("Helpful")).toBeNull();
    expect(screen.getByRole("textbox", { name: "Bio" })).toHaveAttribute("aria-invalid", "true");
  });

  it("autoResize grows with the content up to maxRows, then scrolls", async () => {
    renderUi(<Textarea label="Grow" minRows={2} maxRows={4} />, variant);
    const box = screen.getByRole("textbox", { name: "Grow" });
    const start = box.getBoundingClientRect().height;
    await userEvent.click(box);
    await userEvent.keyboard("1{Enter}2{Enter}3");
    await expect.poll(() => box.getBoundingClientRect().height).toBeGreaterThan(start);
    await userEvent.keyboard("{Enter}4{Enter}5{Enter}6{Enter}7");
    const capped = box.getBoundingClientRect().height;
    await userEvent.keyboard("{Enter}8{Enter}9");
    await expect.poll(() => box.getBoundingClientRect().height).toBe(capped);
    expect(box.scrollHeight).toBeGreaterThan(box.clientHeight);
  });

  it("autoResize={false} keeps a fixed height", async () => {
    renderUi(<Textarea label="Fixed" autoResize={false} minRows={3} />, variant);
    const box = screen.getByRole("textbox", { name: "Fixed" });
    const start = box.getBoundingClientRect().height;
    await userEvent.click(box);
    await userEvent.keyboard("a{Enter}b{Enter}c{Enter}d{Enter}e{Enter}f");
    expect(box.getBoundingClientRect().height).toBe(start);
  });

  it("a form reset clears the counter", async () => {
    renderUi(
      <form>
        <Textarea label="Reset me" maxLength={10} />
        <button type="reset">Reset</button>
      </form>,
      variant,
    );
    await userEvent.click(screen.getByRole("textbox", { name: "Reset me" }));
    await userEvent.keyboard("abc");
    expect(counter()).toHaveTextContent("3/10");
    await userEvent.click(screen.getByRole("button", { name: "Reset" }));
    await expect.poll(() => counter()?.textContent).toBe("0/10");
  });

  it("renders a footer and disabled state", () => {
    renderUi(<Textarea label="With footer" footer={<button type="button">Attach</button>} disabled />, variant);
    expect(screen.getByRole("textbox", { name: "With footer" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Attach" })).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    renderUi(
      <div className="grid gap-4">
        <Textarea label="Plain" />
        <Textarea label="Counted" maxLength={50} defaultValue="Hello" description="Short and sweet" />
        <Textarea label="Errored" error="Required" />
        <Textarea label="Over" maxLength={3} limit="warn" defaultValue="abcdef" />
        <Textarea aria-label="Bare" />
      </div>,
      variant,
    );
    expect(await runAxe()).toHaveNoViolations();
  });
});
