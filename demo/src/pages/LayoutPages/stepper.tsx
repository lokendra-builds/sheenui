import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Button, GlassCard, Input, Switch, useToast } from "@sheenui/theme";
import { Stepper, type StepperLabels, type StepperStep } from "@sheenui/theme";
import { I, icon } from "./shared";

/* =====================================================================
 * Stepper
 * ===================================================================== */

export const checkoutSteps: StepperStep[] = [
  { title: "Cart", description: "3 items" },
  { title: "Shipping", description: "Address and speed" },
  { title: "Payment", description: "Card or wallet" },
  { title: "Review", description: "Confirm and pay" },
];

export const checkoutStepsFr: StepperStep[] = [
  { title: "Panier", description: "3 articles" },
  { title: "Livraison", description: "Adresse et délai" },
  { title: "Paiement", description: "Carte ou portefeuille" },
  { title: "Récapitulatif", description: "Confirmer et payer" },
];

export const frenchStepperLabels: Partial<StepperLabels> = {
  nav: "Progression",
  stepOf: (step, total) => `Étape ${step} sur ${total}`,
  complete: "terminée",
  current: "étape en cours",
  upcoming: "à venir",
  error: "à corriger",
  status: (words) => ` : ${words.join(", ")}`,
  next: (title) => (
    <>
      Suivante : <strong>{title}</strong>
    </>
  ),
};

export const stepperCheckoutCode = `
import { useState } from "react";
import { Button, Stepper, Switch } from "@sheenui/theme";

export function Example() {
  const [current, setCurrent] = useState(1);
  const [failed, setFailed] = useState(false);

  return (
    <>
      <Switch label="Payment fails" checked={failed} onCheckedChange={setFailed} />
      <Stepper
        current={current}
        onStepClick={setCurrent}            // completed steps become buttons
        labels={{ nav: "Checkout progress" }}
        steps={[
          { title: "Cart", description: "3 items" },
          { title: "Shipping", description: "Address and speed" },
          { title: "Payment", description: "Card or wallet", status: failed ? "error" : undefined },
          { title: "Review", description: "Confirm and pay" },
        ]}
      />
      <Button variant="ghost" onClick={() => setCurrent((c) => c - 1)}>Back</Button>
      <Button onClick={() => setCurrent((c) => c + 1)}>Continue</Button>
    </>
  );
}`;

export const stepperVerticalCode = `
import { useState } from "react";
import { Button, Stepper } from "@sheenui/theme";

export function Example() {
  const [current, setCurrent] = useState(0);

  // "Continue" inside a step's content unmounts with it: focus moves to the next step for you.

  return (
    <Stepper
      orientation="vertical"
      current={current}
      onStepClick={setCurrent}
      labels={{ nav: "Workspace setup" }}
      steps={[
        { title: "Create a workspace", description: "Name it and pick a region", content: <p>Workspace name and region go here.</p> },
        { title: "Invite your team", optional: true, content: <p>Email addresses go here.</p> },
        { title: "Connect a repository", description: "Import repositories", content: <Button variant="glass">Connect a repository</Button> },
        { title: "Ship it", description: "Your first deploy" },
      ]}
    />
  );
}`;

export const stepperCompactCode = `
import { Stepper, type StepperStep } from "@sheenui/theme";

const steps: StepperStep[] = [
  { title: "Cart", description: "3 items" },
  { title: "Shipping" },
  { title: "Payment" },
  { title: "Review" },
];

export function Example() {
  return (
    <>
      {/* Labels beside the dots, small size */}
      <Stepper labelPlacement="end" size="sm" current={1} steps={steps.map(({ title }) => ({ title }))} />

      {/* Phones: "auto" (the default) collapses to "Step 2 of 4" when steps get narrower than minStepWidth; "always" forces the compact view. */}
      <Stepper collapse="always" current={1} steps={steps} />

      {/* Every string is a label, punctuation included (French shown): */}
      <div lang="fr">
        <Stepper
          collapse="always"
          current={1}
          steps={[{ title: "Panier", description: "3 articles" }, { title: "Livraison" }, { title: "Paiement" }]}
          labels={{
            nav: "Progression",
            stepOf: (step, total) => \`Étape \${step} sur \${total}\`,
            complete: "terminée",
            current: "étape en cours",
            upcoming: "à venir",
            error: "à corriger",
            status: (words) => \` : \${words.join(", ")}\`,
            next: (title) => <>Suivante : <strong>{title}</strong></>,
          }}
        />
      </div>
    </>
  );
}`;

export function StepperCheckoutDemo() {
  const toast = useToast();
  const [current, setCurrent] = useState(1);
  const [failed, setFailed] = useState(false);
  const steps = checkoutSteps.map((step, i) =>
    i === 2 && failed ? { ...step, status: "error" as const, description: "Card declined" } : step,
  );
  const done = current >= steps.length;
  const actions = useRef<HTMLDivElement | null>(null);
  const back = () => {
    const next = Math.max(0, current - 1);
    flushSync(() => setCurrent(next));
    // Back disables itself on the first step: hand focus to the forward button instead of the page.
    if (next === 0) actions.current?.querySelector<HTMLElement>("button:not(:disabled)")?.focus();
  };
  return (
    <div className="flex w-full max-w-3xl flex-col gap-8">
      <Stepper current={current} onStepClick={setCurrent} steps={steps} labels={{ nav: "Checkout progress" }} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Switch label="Payment fails" checked={failed} onCheckedChange={setFailed} />
        <div ref={actions} className="flex gap-2">
          <Button variant="ghost" disabled={current === 0} onClick={back}>
            Back
          </Button>
          {done ? (
            <Button variant="glass" onClick={() => setCurrent(0)}>
              Start over
            </Button>
          ) : (
            <Button
              onClick={() => {
                if (current === steps.length - 1) toast.success("Order placed", "Thanks! A receipt is on its way.");
                setCurrent((c) => c + 1);
              }}
            >
              {current === steps.length - 1 ? "Place order" : "Continue"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function StepperVerticalDemo() {
  const [current, setCurrent] = useState(0);
  const card = useRef<HTMLDivElement | null>(null);
  const restart = () => {
    flushSync(() => setCurrent(0));
    // The Restart button goes away with the summary: continue from the first step.
    card.current?.querySelector<HTMLElement>('[data-step-index="0"]')?.focus();
  };
  const next = () => setCurrent((c) => c + 1);
  const steps: StepperStep[] = [
    {
      title: "Create a workspace",
      description: "Name it and pick a region",
      content: (
        <div className="flex max-w-sm flex-col gap-3">
          <Input label="Workspace name" defaultValue="Acme" />
          <Button size="sm" className="self-start" onClick={next}>
            Continue
          </Button>
        </div>
      ),
    },
    {
      title: "Invite your team",
      optional: true,
      description: "You can do this later",
      content: (
        <div className="flex max-w-sm flex-col gap-3">
          <Input label="Emails" placeholder="grace@example.com, linus@example.com" />
          <div className="flex gap-2">
            <Button size="sm" onClick={next}>
              Send invites
            </Button>
            <Button size="sm" variant="ghost" onClick={next}>
              Skip
            </Button>
          </div>
        </div>
      ),
    },
    {
      title: "Connect a repository",
      description: "Import repositories",
      content: (
        <Button size="sm" variant="glass" leading={icon(I.github, "size-4")} onClick={next}>
          Connect a repository
        </Button>
      ),
    },
    {
      title: "Ship it",
      description: "Your first deploy",
      content: (
        <Button size="sm" leading={icon(I.rocket, "size-4")} onClick={next}>
          Deploy
        </Button>
      ),
    },
  ];
  return (
    <GlassCard ref={card} className="w-full max-w-lg p-6">
      <Stepper
        orientation="vertical"
        current={current}
        onStepClick={setCurrent}
        steps={steps}
        labels={{ nav: "Workspace setup" }}
      />
      {current >= steps.length && (
        <div className="mt-6 flex items-center justify-between gap-3 border-t border-sheen-border pt-4">
          <p className="text-sm font-medium text-sheen-success-text">You're all set.</p>
          <Button size="sm" variant="ghost" onClick={restart}>
            Restart
          </Button>
        </div>
      )}
    </GlassCard>
  );
}
