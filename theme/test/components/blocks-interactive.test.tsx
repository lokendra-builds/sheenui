// Interaction blocks with a payoff: PaymentCheckout's flip and state light, and LampLogin.

import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { LampLogin } from "../../src/blocks/lamp-login";
import { PaymentCheckout } from "../../src/blocks/payment-checkout";
import { setReducedMotion } from "../helpers-text";
import { describeVariants, renderUi, runAxe } from "../render";

const light = () => document.querySelector<HTMLElement>('[data-slot="checkout-light"]');
const preview = () => document.querySelector<HTMLElement>('[data-slot="card-preview"]');
const pay = () => screen.getByRole("button", { name: /^Pay / });

async function fillValidCard() {
  await userEvent.click(screen.getByLabelText("Card number"));
  await userEvent.keyboard("4242424242424242");
  await userEvent.tab();
  await userEvent.keyboard("Jane Doe");
  await userEvent.tab();
  await userEvent.keyboard("1230");
  await userEvent.tab();
  await userEvent.keyboard("123");
}

describe("PaymentCheckout: flip and state light", () => {
  it("the card preview turns to its back while the CVC field has focus and back again on blur", async () => {
    renderUi(<PaymentCheckout />);
    expect(preview()).toHaveAttribute("data-side", "front");
    await userEvent.click(screen.getByLabelText("CVC"));
    await expect.poll(() => preview()?.getAttribute("data-side")).toBe("back");
    await userEvent.keyboard("12");
    expect(preview()?.textContent).toContain("••");
    await userEvent.click(screen.getByLabelText("Card number"));
    await expect.poll(() => preview()?.getAttribute("data-side")).toBe("front");
  });

  it("flipCard={false} keeps the front side", async () => {
    renderUi(<PaymentCheckout flipCard={false} />);
    await userEvent.click(screen.getByLabelText("CVC"));
    expect(preview()).toHaveAttribute("data-side", "front");
  });

  it("the light follows the payment: idle, processing (announced), success", async () => {
    let finish: () => void = () => undefined;
    const onPay = () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      });
    renderUi(<PaymentCheckout onPay={onPay} />);
    expect(light()).toHaveAttribute("data-state", "idle");
    await fillValidCard();
    await userEvent.click(pay());
    await expect.poll(() => light()?.getAttribute("data-state")).toBe("processing");
    expect(document.body.textContent).toContain("Processing your payment");
    finish();
    await expect.poll(() => light()?.getAttribute("data-state")).toBe("success");
    expect(await screen.findByText("Payment successful")).toBeInTheDocument();
    expect(document.querySelector('[data-slot="checkout-seal"] svg path')).not.toBeNull();
  });

  it("a refused payment lights the card red and still shows the alert text", async () => {
    renderUi(<PaymentCheckout onPay={() => Promise.reject(new Error("declined"))} />);
    await fillValidCard();
    await userEvent.click(pay());
    expect(await screen.findByRole("alert")).toHaveTextContent("declined");
    expect(light()).toHaveAttribute("data-state", "error");
  });

  it("stateLight={false} renders no light and labels.processing is translatable", async () => {
    renderUi(
      <PaymentCheckout
        stateLight={false}
        labels={{ processing: "Contacting your bank" }}
        onPay={() => new Promise(() => undefined)}
      />,
    );
    expect(light()).toBeNull();
    await fillValidCard();
    await userEvent.click(pay());
    await expect.poll(() => document.body.textContent).toContain("Contacting your bank");
  });

  it("reduced motion: the preview still reports its side and the form still works", async () => {
    setReducedMotion();
    renderUi(<PaymentCheckout />);
    await userEvent.click(screen.getByLabelText("CVC"));
    await expect.poll(() => preview()?.getAttribute("data-side")).toBe("back");
  });

  describeVariants((variant) => {
    it("has no axe violations while processing and when paid", async () => {
      let finish: () => void = () => undefined;
      renderUi(
        <div className="p-4">
          <PaymentCheckout
            onPay={() =>
              new Promise<void>((resolve) => {
                finish = resolve;
              })
            }
          />
        </div>,
        variant,
      );
      await fillValidCard();
      await userEvent.click(pay());
      await expect.poll(() => light()?.getAttribute("data-state")).toBe("processing");
      expect(await runAxe()).toHaveNoViolations();
      finish();
      await screen.findByText("Payment successful");
      expect(await runAxe()).toHaveNoViolations();
    });
  });
});

/** Resolves any CSS colour (oklch, color-mix...) to [r, g, b, a] by painting one pixel. */
function rgba(css: string): [number, number, number, number] {
  const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("no 2d context");
  ctx.fillStyle = css;
  ctx.fillRect(0, 0, 1, 1);
  const [r = 0, g = 0, b = 0, a = 0] = ctx.getImageData(0, 0, 1, 1).data;
  return [r, g, b, a];
}

function luminance([r, g, b]: [number, number, number, number]) {
  const lin = (c: number) => (c / 255 <= 0.03928 ? c / 255 / 12.92 : ((c / 255 + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

describe("LampLogin", () => {
  const cord = () => screen.getByRole("button", { name: "Lamp light" });
  const stage = () => document.querySelector<HTMLElement>('[data-slot="lamp-login"]');

  it("the cord is a labelled toggle button; click, Enter and Space switch the light", async () => {
    renderUi(<LampLogin headingLevel="none" />);
    expect(stage()).toHaveAttribute("data-lit", "off");
    expect(cord()).toHaveAttribute("aria-pressed", "false");
    expect(cord()).toHaveAccessibleDescription("Pull the cord to switch the light on");
    await userEvent.click(cord());
    expect(stage()).toHaveAttribute("data-lit", "on");
    expect(cord()).toHaveAttribute("aria-pressed", "true");
    expect(cord()).toHaveAccessibleDescription("Pull the cord to switch it off");
    cord().focus();
    await userEvent.keyboard("{Enter}");
    expect(stage()).toHaveAttribute("data-lit", "off");
    await userEvent.keyboard(" ");
    expect(stage()).toHaveAttribute("data-lit", "on");
  });

  it("the card is always in the accessibility tree and reachable by Tab, and focus into it switches the light on", async () => {
    renderUi(<LampLogin />);
    expect(stage()).toHaveAttribute("data-lit", "off");
    expect(screen.getByRole("textbox", { name: /Email/ })).toBeVisible();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
    await userEvent.tab();
    expect(document.activeElement).toBe(cord());
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByRole("textbox", { name: /Email/ }));
    expect(stage()).toHaveAttribute("data-lit", "on");
  });

  it("is controlled with lit and onLitChange, and defaultLit starts on", async () => {
    const onLitChange = vi.fn();
    function Controlled() {
      const [lit, setLit] = useState(false);
      return (
        <LampLogin
          lit={lit}
          onLitChange={(next) => {
            onLitChange(next);
            setLit(next);
          }}
        />
      );
    }
    const { unmount } = renderUi(<Controlled />);
    await userEvent.click(cord());
    expect(onLitChange).toHaveBeenCalledWith(true);
    expect(stage()).toHaveAttribute("data-lit", "on");
    unmount();
    renderUi(<LampLogin defaultLit />);
    expect(stage()).toHaveAttribute("data-lit", "on");
  });

  it("passes the login form through: validation, onSubmit and translated labels", async () => {
    const onSubmit = vi.fn();
    renderUi(
      <LampLogin
        onSubmit={onSubmit}
        labels={{ cord: "Studio lamp", hintOff: "Tug it" }}
        loginLabels={{ submit: "Enter" }}
      />,
    );
    expect(screen.getByRole("button", { name: "Studio lamp" })).toBeInTheDocument();
    expect(screen.getByText("Tug it")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Enter" }));
    expect(await screen.findByText("Enter a valid email address.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("textbox", { name: /Email/ }));
    await userEvent.keyboard("ava@example.com");
    await userEvent.tab();
    await userEvent.keyboard("12345678{Enter}");
    await expect.poll(() => onSubmit.mock.calls.length).toBe(1);
    expect(onSubmit).toHaveBeenCalledWith({ email: "ava@example.com", password: "12345678" });
  });

  it("reduced motion: the light starts on and the cord still switches it", async () => {
    setReducedMotion();
    renderUi(<LampLogin />);
    await expect.poll(() => stage()?.getAttribute("data-lit")).toBe("on");
    await userEvent.click(cord());
    expect(stage()).toHaveAttribute("data-lit", "off");
  });

  describeVariants((variant) => {
    it("the lit room keeps its text readable against its surface (>= 4.5:1), in every look", () => {
      renderUi(<LampLogin defaultLit headingLevel="none" />, variant);
      const root = stage();
      const heading = screen.getByText("Welcome back");
      const hint = screen.getByText("Pull the cord to switch it off");
      if (!root) throw new Error("no stage");
      const surface = luminance(rgba(getComputedStyle(root).backgroundColor));
      for (const el of [heading, hint]) {
        const text = luminance(rgba(getComputedStyle(el).color));
        const ratio = (Math.max(text, surface) + 0.05) / (Math.min(text, surface) + 0.05);
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      }
    });

    it("has no axe violations with the light off and on", async () => {
      renderUi(<LampLogin />, variant);
      expect(await runAxe()).toHaveNoViolations();
      await userEvent.click(cord());
      expect(await runAxe()).toHaveNoViolations();
    });
  });
});
