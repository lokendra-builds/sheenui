// Blocks, part 1: GlassLogin, OtpVerification, PaymentCheckout and Pricing.

import { describe, expect, it, vi } from "vitest";
import type { ComponentProps } from "react";
import { screen, within } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { GlassLogin } from "../../src/blocks/glass-login";
import { OtpVerification } from "../../src/blocks/otp-verification";
import { PaymentCheckout } from "../../src/blocks/payment-checkout";
import { Pricing, type PricingFeature, type PricingTier } from "../../src/blocks/pricing";
import { accessibleText, liveTexts, setReducedMotion } from "../helpers-text";
import { describeVariants, renderUi, runAxe } from "../render";

/* ---------- GlassLogin ---------- */

const noop = vi.fn();
const email = () => screen.getByRole<HTMLInputElement>("textbox", { name: /Email/ });
const password = () => screen.getByLabelText<HTMLInputElement>(/^Password/);

/** A made-up passphrase for the login form tests; not a real credential. */
const FAKE_PASS = "hunter2hunter2";

describe("GlassLogin", () => {
  it("is a labelled form with email, password and a submit button", () => {
    renderUi(<GlassLogin />);
    expect(screen.getByRole("heading", { name: "Welcome back" })).toBeInTheDocument();
    expect(email()).toHaveAttribute("type", "email");
    expect(password()).toHaveAttribute("type", "password");
    expect(screen.getByRole("button", { name: "Sign in" })).toHaveAttribute("type", "submit");
    expect(screen.getByRole("link", { name: "Forgot password?" })).toHaveAttribute("href", "#");
    expect(screen.getByRole("link", { name: "Create an account" })).toBeInTheDocument();
    // No social row without onSocial.
    expect(screen.queryByRole("button", { name: "GitHub" })).toBeNull();
  });

  it("validation: bad email and short password show linked messages and focus goes to the first invalid field", async () => {
    const onSubmit = vi.fn();
    renderUi(<GlassLogin onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(await screen.findByText("Enter a valid email address.")).toBeInTheDocument();
    expect(screen.getByText("Password must be at least 8 characters.")).toBeInTheDocument();
    await expect.poll(() => document.activeElement).toBe(email());
    expect(email()).toBeInvalid();
    expect(email()).toHaveAccessibleDescription("Enter a valid email address.");
    expect(password()).toHaveAccessibleDescription("Password must be at least 8 characters.");
  });

  it("errors clear as the person fixes the field, and focus goes to the password when only it is invalid", async () => {
    const onSubmit = vi.fn();
    renderUi(<GlassLogin onSubmit={onSubmit} />);
    await userEvent.click(email());
    await userEvent.keyboard("ava@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));
    await expect.poll(() => document.activeElement).toBe(password());
    await userEvent.keyboard("12345678");
    await expect.poll(() => screen.queryByText(/Password must be/)).toBeNull();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("Enter in a field submits the trimmed email and the password", async () => {
    const onSubmit = vi.fn();
    renderUi(<GlassLogin onSubmit={onSubmit} />);
    await userEvent.click(email());
    await userEvent.keyboard("  ava@example.com  ");
    await userEvent.tab();
    await userEvent.keyboard("hunter2hunter2{Enter}");
    await expect.poll(() => onSubmit.mock.calls.length).toBe(1);
    expect(onSubmit).toHaveBeenCalledWith({ email: "ava@example.com", password: FAKE_PASS });
  });

  it("the reveal button has a state-aware name and toggles the field type without losing focus order", async () => {
    renderUi(<GlassLogin />);
    const reveal = screen.getByRole("button", { name: "Show password" });
    expect(reveal).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(reveal);
    expect(screen.getByRole("button", { name: "Hide password" })).toHaveAttribute("aria-pressed", "true");
    expect(password()).toHaveAttribute("type", "text");
  });

  it("a rejected onSubmit shows its message in an alert (generic text when it has none); loading disables a second submit", async () => {
    const onSubmit = vi.fn().mockRejectedValueOnce(new Error("Wrong password")).mockRejectedValueOnce(new Error(""));
    renderUi(<GlassLogin onSubmit={onSubmit} />);
    await userEvent.click(email());
    await userEvent.keyboard("ava@example.com");
    await userEvent.tab();
    await userEvent.keyboard("hunter2hunter2{Enter}");
    expect(await screen.findByRole("alert")).toHaveTextContent("Wrong password");
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));
    await expect.poll(() => screen.getByRole("alert").textContent).toContain("Something went wrong. Try again.");
    expect(onSubmit).toHaveBeenCalledTimes(2);
  });

  it("onSocial adds GitHub / Google buttons that report the provider; signUpHref={null} hides the sign-up line", async () => {
    const onSocial = vi.fn<NonNullable<ComponentProps<typeof GlassLogin>["onSocial"]>>();
    renderUi(<GlassLogin onSocial={onSocial} signUpHref={null} />);
    await userEvent.click(screen.getByRole("button", { name: "Google" }));
    await userEvent.click(screen.getByRole("button", { name: "GitHub" }));
    expect(onSocial.mock.calls.map((c) => c[0])).toEqual(["google", "github"]);
    expect(screen.queryByRole("link", { name: "Create an account" })).toBeNull();
  });

  it("labels override every string; minPasswordLength is honoured", async () => {
    renderUi(
      <GlassLogin
        minPasswordLength={12}
        labels={{
          email: "Correo",
          password: "Contraseña",
          submit: "Entrar",
          invalidEmail: "Correo no válido",
          shortPassword: (n) => `Mínimo ${n} caracteres`,
        }}
        title="Hola"
      />,
    );
    expect(screen.getByRole("heading", { name: "Hola" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));
    expect(await screen.findByText("Correo no válido")).toBeInTheDocument();
    expect(screen.getByText("Mínimo 12 caracteres")).toBeInTheDocument();
  });

  it("Tab order: email, password, reveal, forgot link, submit", async () => {
    renderUi(<GlassLogin onSocial={() => undefined} />);
    const order = [
      email(),
      password(),
      screen.getByRole("button", { name: "Show password" }),
      screen.getByRole("link", { name: "Forgot password?" }),
      screen.getByRole("button", { name: "Sign in" }),
      screen.getByRole("button", { name: "GitHub" }),
      screen.getByRole("button", { name: "Google" }),
      screen.getByRole("link", { name: "Create an account" }),
    ];
    for (const el of order) {
      await userEvent.tab();
      expect(el).toHaveFocus();
    }
  });

  describeVariants((variant) => {
    it("has no axe violations (empty, and with errors showing)", async () => {
      renderUi(
        <div className="p-4">
          <GlassLogin onSocial={() => undefined} />
        </div>,
        variant,
      );
      expect(await runAxe()).toHaveNoViolations();
      await userEvent.click(screen.getByRole("button", { name: "Sign in" }));
      await screen.findByText("Enter a valid email address.");
      expect(await runAxe()).toHaveNoViolations();
    });
  });
});

/* ---------- OtpVerification ---------- */

const slots = () =>
  screen.getAllByRole("textbox").filter((el) => el.getAttribute("aria-hidden") !== "true") as HTMLInputElement[];

describe("OtpVerification", () => {
  it("renders one slot per digit inside a named group, with the destination in the description", () => {
    renderUi(<OtpVerification destination="ada@example.com" onVerify={() => true} autoFocus={false} />);
    expect(slots()).toHaveLength(6);
    expect(screen.getByRole("heading", { name: "Check your inbox" })).toBeInTheDocument();
    expect(screen.getByText(/ada@example.com/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Verify code" })).toBeInTheDocument();
  });

  it("autofocuses the first slot; typing the last digit verifies automatically and shows the verified state", async () => {
    const onVerify = vi.fn().mockResolvedValue(true);
    const onContinue = vi.fn();
    renderUi(<OtpVerification onVerify={onVerify} onContinue={onContinue} />);
    await expect.poll(() => document.activeElement).toBe(slots()[0]);
    await userEvent.keyboard("123456");
    await expect.poll(() => onVerify.mock.calls.length).toBe(1);
    expect(onVerify).toHaveBeenCalledWith("123456");
    expect(await screen.findByRole("heading", { name: "You're verified" })).toBeInTheDocument();
    // Focus moves to Continue after success.
    const cont = await screen.findByRole("button", { name: "Continue" });
    await expect.poll(() => document.activeElement).toBe(cont);
    await userEvent.keyboard("{Enter}");
    expect(onContinue).toHaveBeenCalledTimes(1);
    // The success message is announced in a polite status region.
    expect(liveTexts()).toContain("Code accepted.");
  });

  it("a wrong code announces the error, keeps the digits editable and re-verifies after a fix", async () => {
    const onVerify = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    renderUi(<OtpVerification onVerify={onVerify} />);
    await userEvent.keyboard("111111");
    await expect.poll(() => liveTexts()).toContain("That code didn't match. Try again.");
    await expect.poll(() => onVerify.mock.calls.length).toBe(1);
    // Focus goes to the last slot and the digits stay: fix the last one and the second try is accepted.
    await expect.poll(() => document.activeElement).toBe(slots()[5]);
    expect(
      slots()
        .map((s) => s.value)
        .join(""),
    ).toBe("111111");
    await userEvent.keyboard("2");
    // The error clears as soon as the code is edited; Verify submits the corrected code.
    await expect.poll(() => liveTexts()).not.toContain("That code didn't match. Try again.");
    await userEvent.click(screen.getByRole("button", { name: "Verify code" }));
    await expect.poll(() => onVerify.mock.calls.length, { timeout: 4000 }).toBe(2);
    expect(onVerify).toHaveBeenLastCalledWith("111112");
    expect(await screen.findByRole("heading", { name: "You're verified" })).toBeInTheDocument();
  });

  it("Backspace steps back across slots; pasting fills them", async () => {
    renderUi(<OtpVerification onVerify={() => false} />);
    await userEvent.keyboard("12");
    expect(slots()[2]).toHaveFocus();
    await userEvent.keyboard("{Backspace}");
    await expect.poll(() => slots()[1]!.value).toBe("");
    slots()[0]!.focus();
    const data = new DataTransfer();
    data.setData("text/plain", "987654");
    slots()[0]!.dispatchEvent(new ClipboardEvent("paste", { clipboardData: data, bubbles: true, cancelable: true }));
    await expect
      .poll(() =>
        slots()
          .map((s) => s.value)
          .join(""),
      )
      .toBe("987654");
  });

  it("Verify before every digit is in explains and moves focus to the first empty slot", async () => {
    renderUi(<OtpVerification onVerify={() => true} autoFocus={false} />);
    slots()[0]!.focus();
    await userEvent.keyboard("12");
    await userEvent.click(screen.getByRole("button", { name: "Verify code" }));
    await expect.poll(() => liveTexts()).toContain("Enter all 6 digits.");
    await expect.poll(() => document.activeElement).toBe(slots()[2]);
  });

  it("length controls the number of slots", () => {
    renderUi(<OtpVerification onVerify={() => true} length={4} autoFocus={false} />);
    expect(slots()).toHaveLength(4);
  });

  it("the resend control counts down, then asks for a new code and announces it", async () => {
    const onResend = vi.fn();
    renderUi(<OtpVerification onVerify={() => false} onResend={onResend} resendAfter={1} autoFocus={false} />);
    expect(screen.getByText(/Resend in \d+s/)).toBeInTheDocument();
    const resend = await screen.findByRole("button", { name: "Resend code" }, { timeout: 4000 });
    await userEvent.click(resend);
    expect(onResend).toHaveBeenCalledTimes(1);
    await expect.poll(() => liveTexts()).toContain("We sent you a new code.");
  });

  it("labels override the strings", () => {
    renderUi(
      <OtpVerification
        onVerify={() => true}
        autoFocus={false}
        labels={{ title: "Revisa tu correo", verify: "Verificar", codeLabel: "Código" }}
      />,
    );
    expect(screen.getByRole("heading", { name: "Revisa tu correo" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Verificar" })).toBeInTheDocument();
  });

  describeVariants((variant) => {
    it("has no axe violations (idle, and after a wrong code)", async () => {
      renderUi(
        <div className="p-4">
          <OtpVerification onVerify={() => false} autoFocus={false} />
        </div>,
        variant,
      );
      expect(await runAxe()).toHaveNoViolations();
      slots()[0]!.focus();
      await userEvent.keyboard("123456");
      await expect.poll(() => liveTexts()).toContain("That code didn't match. Try again.");
      expect(await runAxe()).toHaveNoViolations();
    });
  });

  describe("variant unlock", () => {
    const card = () => document.querySelector<HTMLElement>('[data-variant="unlock"]')!;
    const type = async (code: string) => {
      slots()[0]!.focus();
      await userEvent.keyboard(code);
    };

    it("keeps the default design unless asked: no lock, no state attribute", () => {
      renderUi(<OtpVerification onVerify={() => true} autoFocus={false} />);
      expect(document.querySelector('[data-variant="unlock"]')).toBeNull();
      expect(document.querySelector('[data-slot="otp-lock"]')).toBeNull();
    });

    it("still uses the real OTP input: six slots, typing and paste work", async () => {
      renderUi(<OtpVerification variant="unlock" onVerify={() => false} autoFocus={false} />);
      expect(slots()).toHaveLength(6);
      expect(card()).toHaveAttribute("data-state", "idle");
      await type("12");
      expect(slots()[2]).toHaveFocus();
      slots()[0]!.focus();
      const data = new DataTransfer();
      data.setData("text/plain", "987654");
      slots()[0]!.dispatchEvent(new ClipboardEvent("paste", { clipboardData: data, bubbles: true, cancelable: true }));
      await expect
        .poll(() =>
          slots()
            .map((s) => s.value)
            .join(""),
        )
        .toBe("987654");
    });

    it("success: checks, opens the lock with sparks and a badge, announces, and moves focus to Continue", async () => {
      let release: (ok: boolean) => void = noop;
      const onVerify = vi.fn(() => new Promise<boolean>((resolve) => (release = resolve)));
      renderUi(<OtpVerification variant="unlock" onVerify={onVerify} onContinue={noop} autoFocus={false} />);
      await type("123456");
      await expect.poll(() => card().getAttribute("data-state")).toBe("checking");
      expect(document.querySelector('[data-slot="otp-spark"]')).toBeNull();
      release(true);
      await expect.poll(() => card().getAttribute("data-state")).toBe("success");
      expect(await screen.findByRole("heading", { name: "You're verified" })).toBeInTheDocument();
      expect(document.querySelectorAll('[data-slot="otp-spark"]').length).toBeGreaterThan(0);
      expect(document.querySelector('[data-slot="otp-badge"]')).toHaveTextContent("Verified");
      // The code row is inert once the badge shows, and the decorative parts stay hidden from assistive tech.
      expect(slots()[0]!.closest("[inert]")).not.toBeNull();
      expect(document.querySelector('[data-slot="otp-lock"]')).toHaveAttribute("aria-hidden", "true");
      expect(liveTexts()).toContain("Code accepted.");
      await expect.poll(() => document.activeElement).toBe(await screen.findByRole("button", { name: "Continue" }));
    });

    it("error: the lock rattles, the message is announced, and the cells clear themselves", async () => {
      renderUi(<OtpVerification variant="unlock" onVerify={() => false} autoFocus={false} />);
      await type("111111");
      await expect.poll(() => liveTexts()).toContain("That code didn't match. Try again.");
      expect(card()).toHaveAttribute("data-state", "error");
      expect(slots()[0]).toHaveAttribute("aria-invalid", "true");
      await expect
        .poll(
          () =>
            slots()
              .map((s) => s.value)
              .join(""),
          { timeout: 4000 },
        )
        .toBe("");
      await expect.poll(() => document.activeElement).toBe(slots()[0]);
      expect(card()).toHaveAttribute("data-state", "idle");
      // The message stays until the person types again.
      expect(liveTexts()).toContain("That code didn't match. Try again.");
      await userEvent.keyboard("7");
      await expect.poll(() => liveTexts()).not.toContain("That code didn't match. Try again.");
    });

    it("reduced motion: the same states, but no sparks, flood sweep or spin", async () => {
      setReducedMotion();
      try {
        const onVerify = vi.fn().mockResolvedValue(true);
        renderUi(<OtpVerification variant="unlock" onVerify={onVerify} autoFocus={false} />);
        await type("123456");
        expect(await screen.findByRole("heading", { name: "You're verified" })).toBeInTheDocument();
        expect(card()).toHaveAttribute("data-state", "success");
        expect(document.querySelector('[data-slot="otp-spark"]')).toBeNull();
        expect(document.querySelector('[data-slot="otp-sweep"]')).toBeNull();
        expect(liveTexts()).toContain("Code accepted.");
        // The badge still appears (as a fade) so the state is visible without motion.
        await expect.poll(() => getComputedStyle(document.querySelector('[data-slot="otp-badge"]')!).opacity).toBe("1");
      } finally {
        document.documentElement.removeAttribute("data-motion");
      }
    });

    describeVariants((variant) => {
      it("has no axe violations (idle, wrong code, success)", async () => {
        const onVerify = vi.fn().mockResolvedValueOnce(false).mockResolvedValue(true);
        renderUi(
          <div className="p-4">
            <OtpVerification variant="unlock" onVerify={onVerify} onContinue={noop} autoFocus={false} />
          </div>,
          variant,
        );
        expect(await runAxe()).toHaveNoViolations();
        await type("123456");
        await expect.poll(() => liveTexts()).toContain("That code didn't match. Try again.");
        expect(await runAxe()).toHaveNoViolations();
        await expect.poll(() => slots().every((s) => s.value === ""), { timeout: 4000 }).toBe(true);
        await type("123456");
        expect(await screen.findByRole("heading", { name: "You're verified" })).toBeInTheDocument();
        expect(await runAxe()).toHaveNoViolations();
      });
    });
  });
});

/* ---------- PaymentCheckout ---------- */

describe("PaymentCheckout", () => {
  const pay = () => screen.getByRole("button", { name: /^Pay / });

  it("summarises the order with a formatted total and offers Card and UPI tabs", () => {
    renderUi(<PaymentCheckout />);
    expect(screen.getByRole("tablist", { name: "Payment method" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Card" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "UPI" })).toHaveAttribute("aria-selected", "false");
    expect(pay()).toHaveTextContent("$31.32");
    expect(screen.getByRole("group", { name: "Order summary" })).toHaveTextContent("Pro plan");
  });

  it("methods={['card']} hides the tabs; currency and locale drive the amounts", () => {
    renderUi(
      <PaymentCheckout methods={["card"]} currency="EUR" locale="de-DE" lines={[{ label: "Plan", amount: 10 }]} />,
    );
    expect(screen.queryByRole("tablist")).toBeNull();
    expect(pay().textContent).toContain("10,00");
  });

  it("an empty submit lists problems, focuses the first invalid field, and does not call onPay", async () => {
    const onPay = vi.fn();
    renderUi(<PaymentCheckout onPay={onPay} />);
    await userEvent.click(pay());
    expect(onPay).not.toHaveBeenCalled();
    expect(await screen.findByText("Enter the 16-digit card number.")).toBeInTheDocument();
    expect(screen.getByText("Enter the name shown on the card.")).toBeInTheDocument();
    await expect
      .poll(
        () =>
          (document.activeElement as HTMLInputElement | null)?.getAttribute("name") ??
          document.activeElement?.getAttribute("autocomplete"),
      )
      .toMatch(/number|cc-number/);
    expect(document.activeElement).toBeInvalid();
  });

  it("formats the card number and expiry as you type, and a valid card calls onPay with clean values", async () => {
    const onPay = vi.fn();
    renderUi(<PaymentCheckout onPay={onPay} />);
    const number = screen.getByLabelText<HTMLInputElement>("Card number");
    await userEvent.click(number);
    await userEvent.keyboard("4242424242424242");
    expect(number.value).toBe("4242 4242 4242 4242");
    await userEvent.tab();
    await userEvent.keyboard("Jane Doe");
    await userEvent.tab();
    await userEvent.keyboard("1230");
    expect(screen.getByLabelText<HTMLInputElement>("Expiry").value).toBe("12/30");
    await userEvent.tab();
    await userEvent.keyboard("123");
    await userEvent.click(pay());
    await expect.poll(() => onPay.mock.calls.length).toBe(1);
    expect(onPay).toHaveBeenCalledWith("card", {
      method: "card",
      number: "4242424242424242",
      name: "Jane Doe",
      expiry: "12/30",
      cvc: "123",
    });
    expect(await screen.findByText("Payment successful")).toBeInTheDocument();
  });

  it("an expired card is rejected", async () => {
    renderUi(<PaymentCheckout />);
    await userEvent.click(screen.getByLabelText("Card number"));
    await userEvent.keyboard("4242424242424242");
    await userEvent.tab();
    await userEvent.keyboard("Jane Doe");
    await userEvent.tab();
    await userEvent.keyboard("0120");
    await userEvent.tab();
    await userEvent.keyboard("123");
    await userEvent.click(pay());
    expect(await screen.findByText("This card has expired.")).toBeInTheDocument();
  });

  it("switching to UPI validates the UPI id only", async () => {
    const onPay = vi.fn();
    renderUi(<PaymentCheckout onPay={onPay} />);
    await userEvent.click(screen.getByRole("tab", { name: "UPI" }));
    const upi = await screen.findByLabelText("UPI ID");
    await userEvent.click(pay());
    expect(await screen.findByText("Enter a UPI ID like name@bank.")).toBeInTheDocument();
    await userEvent.click(upi);
    await userEvent.keyboard("ava@okbank{Enter}");
    await expect.poll(() => onPay.mock.calls.length).toBe(1);
    expect(onPay).toHaveBeenCalledWith("upi", { method: "upi", upiId: "ava@okbank" });
  });

  it("a rejected onPay shows an alert and keeps the form", async () => {
    renderUi(<PaymentCheckout onPay={() => Promise.reject(new Error("declined"))} />);
    await userEvent.click(screen.getByLabelText("Card number"));
    await userEvent.keyboard("4242424242424242");
    await userEvent.tab();
    await userEvent.keyboard("Jane Doe");
    await userEvent.tab();
    await userEvent.keyboard("1230");
    await userEvent.tab();
    await userEvent.keyboard("123");
    await userEvent.click(pay());
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.queryByText("Payment successful")).toBeNull();
  });

  it("promo: a valid code adds a discount line, updates the total and can be removed; invalid and empty codes explain", async () => {
    const onApplyPromo = vi.fn((code: string) =>
      Promise.resolve(code === "SAVE10" ? { label: "SAVE10", amount: -10 } : null),
    );
    renderUi(<PaymentCheckout onApplyPromo={onApplyPromo} />);
    const promo = screen.getByLabelText("Promo code");
    await userEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(await screen.findByText("Enter a promo code first.")).toBeInTheDocument();
    await userEvent.click(promo);
    await userEvent.keyboard("NOPE{Enter}");
    expect(await screen.findByText("That code isn't valid.")).toBeInTheDocument();
    await userEvent.clear(promo);
    await userEvent.keyboard("SAVE10{Enter}");
    await expect.poll(() => pay().textContent).toContain("$21.32");
    await expect
      .poll(() => screen.getAllByRole("status").some((s) => s.textContent.includes("SAVE10 applied")))
      .toBe(true);
    await userEvent.click(screen.getByRole("button", { name: "Remove promo code SAVE10" }));
    await expect.poll(() => pay().textContent).toContain("$31.32");
  });

  it("reduced motion: tab switching still works", async () => {
    setReducedMotion();
    renderUi(<PaymentCheckout />);
    await userEvent.click(screen.getByRole("tab", { name: "UPI" }));
    expect(await screen.findByLabelText("UPI ID")).toBeInTheDocument();
  });

  describeVariants((variant) => {
    it("has no axe violations (card with errors, UPI, and success)", async () => {
      renderUi(
        <div className="p-4">
          <PaymentCheckout />
        </div>,
        variant,
      );
      await userEvent.click(pay());
      await screen.findByText("Enter the 16-digit card number.");
      expect(await runAxe()).toHaveNoViolations();
      await userEvent.click(screen.getByRole("tab", { name: "UPI" }));
      await screen.findByLabelText("UPI ID");
      expect(await runAxe()).toHaveNoViolations();
    });
  });
});

/* ---------- Pricing ---------- */

const tiers: PricingTier[] = [
  { id: "free", name: "Free", price: { monthly: 0, yearly: 0 }, cta: "Start free" },
  {
    id: "pro",
    name: "Pro",
    price: { monthly: 20, yearly: 16 },
    cta: "Go Pro",
    popular: true,
    featuresTitle: "Everything in Free, plus:",
  },
  { id: "ent", name: "Enterprise", priceLabel: "Let's talk", cta: "Contact us", href: "/contact" },
];
const features: PricingFeature[] = [
  { label: "Projects", values: { free: "3", pro: "Unlimited", ent: "Unlimited" } },
  { label: "Priority support", values: { free: false, pro: true, ent: true }, group: "Support" },
  { label: "SSO", values: { ent: true }, group: "Security", inCards: false },
];

describe("Pricing", () => {
  // The billing period is a radio group (name "Billing period"); the checked state is aria-checked.
  const monthly = () => screen.getByRole("radio", { name: /Monthly|Mensual/ });
  const yearly = () => screen.getByRole("radio", { name: /Yearly|Anual/ });
  const checked = (el: HTMLElement) => el.getAttribute("aria-checked");

  it("a region with a billing toggle (pressed state) and one card per tier; the popular tier is marked", () => {
    renderUi(<Pricing tiers={tiers} features={features} title="Plans" />);
    expect(screen.getByRole("heading", { name: "Plans", level: 2 })).toBeInTheDocument();
    expect(screen.getByRole("radiogroup", { name: "Billing period" })).toBeInTheDocument();
    // Yearly is the default billing period (the cheaper per-month price).
    expect(yearly()).toBeChecked();
    expect(monthly()).not.toBeChecked();
    expect(screen.getByRole("heading", { name: "Pro", level: 3 })).toBeInTheDocument();
    expect(screen.getByText("Most popular")).toBeInTheDocument();
    expect(accessibleText(screen.getByRole("group", { name: "Plans" }))).toContain("$16");
    expect(screen.getByText("Let's talk")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contact us" })).toHaveAttribute("href", "/contact");
  });

  it("toggling to monthly changes the prices, announces it once, and reports onBillingChange", async () => {
    const onBillingChange = vi.fn();
    renderUi(<Pricing tiers={tiers} onBillingChange={onBillingChange} />);
    await userEvent.click(monthly());
    expect(onBillingChange).toHaveBeenCalledWith("monthly");
    await expect.poll(() => checked(monthly())).toBe("true");
    const plans = () => accessibleText(screen.getByRole("group", { name: "Pricing plans" }));
    await expect.poll(plans).toContain("$20");
    expect(plans()).not.toContain("$16");
    await expect.poll(() => liveTexts().filter((t) => t.includes("Showing monthly prices"))).toHaveLength(1);
  });

  it("keyboard: Tab to the toggle, arrows / Enter switch period", async () => {
    renderUi(<Pricing tiers={tiers} />);
    yearly().focus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect.poll(() => checked(monthly())).toBe("true");
    await userEvent.keyboard("{ArrowRight}");
    await expect.poll(() => checked(yearly())).toBe("true");
  });

  it("controlled billing follows its prop", () => {
    const view = renderUi(<Pricing tiers={tiers} billing="monthly" />);
    expect(monthly()).toBeChecked();
    view.rerender(<Pricing tiers={tiers} billing="yearly" />);
    expect(yearly()).toBeChecked();
  });

  it("choosing a tier calls onSelect with the tier and the billing period", async () => {
    const onSelect = vi.fn();
    renderUi(<Pricing tiers={tiers} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole("button", { name: "Go Pro" }));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "pro" }), "yearly");
  });

  it("the comparison table opens from the 'Compare all features' disclosure, with row headers and included / not-included text", async () => {
    renderUi(<Pricing tiers={tiers} features={features} />);
    const toggle = screen.getByRole("button", { name: "Compare all features" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(toggle);
    const table = await screen.findByRole("table", { name: "Feature comparison" });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    const headers = within(table)
      .getAllByRole("columnheader")
      .map((h) => h.textContent);
    for (const name of ["Feature", "Free", "Pro", "Enterprise"])
      expect(headers.some((h) => h.startsWith(name))).toBe(true);
    expect(within(table).getByRole("rowheader", { name: "Priority support" })).toBeInTheDocument();
    // Icons are never the only signal.
    expect(within(table).getAllByText("Included").length).toBeGreaterThan(0);
    expect(within(table).getAllByText("Not included").length).toBeGreaterThan(0);
    // Table-only rows are not on the cards.
    expect(screen.getAllByText("SSO")).toHaveLength(1);
  });

  it("defaultCompareOpen opens it from the start; labels override strings", () => {
    renderUi(
      <Pricing
        tiers={tiers}
        features={features}
        defaultCompareOpen
        labels={{ monthly: "Mensual", yearly: "Anual", comparison: "Comparativa" }}
      />,
    );
    expect(screen.getByRole("table", { name: "Comparativa" })).toBeInTheDocument();
    expect(monthly()).toHaveAccessibleName(/Mensual/);
    expect(yearly()).toHaveAccessibleName(/Anual/);
  });

  it("headingLevel moves the title and tier names together", () => {
    renderUi(<Pricing tiers={tiers} title="Plans" headingLevel={3} />);
    expect(screen.getByRole("heading", { name: "Plans", level: 3 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Pro", level: 4 })).toBeInTheDocument();
  });

  describeVariants((variant) => {
    it("has no axe violations (cards, and with the comparison open)", async () => {
      renderUi(
        <div className="p-4">
          <Pricing tiers={tiers} features={features} title="Plans" />
        </div>,
        variant,
      );
      expect(await runAxe()).toHaveNoViolations();
      await userEvent.click(screen.getByRole("button", { name: "Compare all features" }));
      await screen.findByRole("table", { name: "Feature comparison" });
      expect(await runAxe()).toHaveNoViolations();
    });
  });
});
