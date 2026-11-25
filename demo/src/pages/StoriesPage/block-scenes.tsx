import { useEffect, useRef } from "react";
import { LampLogin, OtpVerification, PaymentCheckout } from "@sheenui/theme";

import type { Story, StageContext } from "../../layout/ShowcaseStage";

/*
 * The payoff blocks as stories. A block is a whole form, not a stage scene, so each story only counts a step in the scene
 * and the scene types into the real fields (the way a person would, through input events) and presses the real buttons.
 * Everything inside a card is inert: nobody can reach it, the card's link is the only target.
 */

const noop = () => undefined;

/** Writes a value into a React-controlled input and tells React (a native setter plus an input event). */
function typeInto(input: HTMLInputElement | null | undefined, value: string): boolean {
  if (!input || input.value === value) return false;
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  return true;
}

/** A pause that lets React render what was just typed (a story that jumps to its last frame types in one go). */
const tick = (ms = 0) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

/** Focus without moving real focus: React reads focusin / focusout. */
function fakeFocus(input: HTMLInputElement | null | undefined, on: boolean) {
  input?.dispatchEvent(new FocusEvent(on ? "focusin" : "focusout", { bubbles: true }));
}

/* ----------------------------- Lamp login ----------------------------- */

const LAMP_EMAIL = "maya@example.com";
const LAMP_PASSWORD = "lamplight42";

/** The Lamp login scene: whether the light is on and how much of each field is typed. */
export type LampScene = { lit: boolean; email: number; password: number };

/** The cord is pulled, the light comes on, then the email and password are typed into the lit card. */
export const lampStory: Story<LampScene> = async ({ scene, wait, reduced }) => {
  await wait(700);
  scene({ lit: true });
  await wait(1200);
  if (reduced) {
    scene({ email: LAMP_EMAIL.length, password: LAMP_PASSWORD.length });
    return;
  }
  for (let i = 1; i <= LAMP_EMAIL.length; i += 1) {
    scene({ email: i });
    await wait(70);
  }
  await wait(250);
  for (let i = 1; i <= LAMP_PASSWORD.length; i += 1) {
    scene({ password: i });
    await wait(60);
  }
};

/** The Lamp login block with the story's light and typing. */
export function LampScene({ scene }: { scene: LampScene; ctx: StageContext }) {
  const root = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    typeInto(root.current?.querySelector<HTMLInputElement>('input[type="email"]'), LAMP_EMAIL.slice(0, scene.email));
    typeInto(
      root.current?.querySelector<HTMLInputElement>('input[type="password"]'),
      LAMP_PASSWORD.slice(0, scene.password),
    );
  }, [scene.email, scene.password]);
  return (
    <div ref={root}>
      <LampLogin lit={scene.lit} onLitChange={noop} headingLevel="none" />
    </div>
  );
}

/* --------------------------- Payment checkout --------------------------- */

const CARD_FIELDS = [
  ["cc-number", "4242424242424242"],
  ["cc-name", "Maya Patel"],
  ["cc-exp", "1230"],
  ["cc-csc", "123"],
] as const;
const CARD_TOTAL = CARD_FIELDS.reduce((sum, [, text]) => sum + text.length, 0);

/** The Payment checkout scene: characters typed so far (across the four card fields) and whether Pay was pressed. */
export type PaymentScene = { typed: number; pay: boolean };

/** The card is typed in, the preview flips for the security code, then Pay: the card glows amber, then green. */
export const paymentStory: Story<PaymentScene> = async ({ scene, wait, reduced }) => {
  await wait(600);
  if (reduced) {
    scene({ typed: CARD_TOTAL, pay: true });
    return;
  }
  for (let i = 1; i <= CARD_TOTAL; i += 1) {
    scene({ typed: i });
    await wait(60);
  }
  await wait(700);
  scene({ pay: true });
  await wait(2600);
};

function PaymentBlock({ scene }: { scene: PaymentScene }) {
  const root = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const form = root.current;
    if (!form) return;
    const run = { cancelled: false };
    void (async () => {
      let left = scene.typed;
      for (const [name, text] of CARD_FIELDS) {
        const input = form.querySelector<HTMLInputElement>(`input[name="${name}"]`);
        const count = Math.max(0, Math.min(text.length, left));
        left -= text.length;
        const changed = typeInto(input, text.slice(0, count));
        // The preview flips to its back while the security code is being typed.
        if (name === "cc-csc") fakeFocus(input, count > 0 && count < text.length);
        if (changed) await tick();
        if (run.cancelled) return;
      }
      if (!scene.pay) return;
      await tick(80);
      if (!run.cancelled) form.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
    })();
    return () => {
      run.cancelled = true;
    };
  }, [scene.typed, scene.pay]);
  return (
    <div ref={root}>
      <PaymentCheckout headingLevel="none" onPay={() => new Promise((resolve) => setTimeout(resolve, 900))} />
    </div>
  );
}

/** The Payment checkout block with the story's typing. A fresh block starts with every new run, so a paid one never lingers. */
export function PaymentScene({ scene }: { scene: PaymentScene; ctx: StageContext }) {
  return <PaymentBlock key={scene.typed === 0 ? "fresh" : "run"} scene={scene} />;
}

/* ------------------------------ OTP unlock ------------------------------ */

const OTP_CODE = "482913";

/** The OTP unlock scene: digits typed so far. */
export type OtpUnlockScene = { digits: number };

/** Six digits fill the ring, the lock opens and the card floods with light. */
export const otpUnlockStory: Story<OtpUnlockScene> = async ({ scene, wait, reduced }) => {
  await wait(700);
  if (reduced) {
    scene({ digits: OTP_CODE.length });
    return;
  }
  for (let i = 1; i <= OTP_CODE.length; i += 1) {
    scene({ digits: i });
    await wait(260);
  }
  await wait(2600);
};

function OtpBlock({ scene }: { scene: OtpUnlockScene }) {
  const root = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const slots = root.current?.querySelectorAll<HTMLInputElement>('input:not([aria-hidden="true"])');
    if (!slots) return;
    const run = { cancelled: false };
    void (async () => {
      for (const [i, digit] of OTP_CODE.split("").entries()) {
        if (i >= scene.digits || run.cancelled) return;
        if (typeInto(slots[i], digit)) await tick();
      }
    })();
    return () => {
      run.cancelled = true;
    };
  }, [scene.digits]);
  return (
    <div ref={root}>
      <OtpVerification
        variant="unlock"
        headingLevel="none"
        destination="the phone ending in 47"
        // eslint-disable-next-line jsx-a11y/no-autofocus -- explicitly turns the block's autofocus off, so a card never takes focus
        autoFocus={false}
        onVerify={async (code) => {
          await new Promise((resolve) => setTimeout(resolve, 700));
          return code === OTP_CODE;
        }}
      />
    </div>
  );
}

/** The OTP verification block, unlock variant, with the story's typing. */
export function OtpUnlockScene({ scene }: { scene: OtpUnlockScene; ctx: StageContext }) {
  return <OtpBlock key={scene.digits === 0 ? "fresh" : "run"} scene={scene} />;
}
