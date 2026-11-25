import { useState } from "react";
import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from "@sheenui/theme";
import { Stepper } from "@sheenui/theme";
import { Page, PropsTable } from "../layout/Page";
import { Example } from "../layout/Example";
import type { StepperScene as StepperSceneData } from "../layout/ShowcaseStage.stepper";
import { StepperScene } from "../layout/ShowcaseStage.stepper.scene";
import { ShowcaseStage } from "../layout/ShowcaseStage";
import type { AccordionScene as AccordionSceneData } from "../layout/ShowcaseStage.accordion";
import { AccordionScene } from "../layout/ShowcaseStage.accordion.scene";
import { A11yNotes, KeyboardTable } from "./DocSections";
import * as PROPS from "../generated/component-props";
import { accordionControlledCode, accordionFaqCode, accordionSeparatedCode, faqs } from "./LayoutPages/accordion";
import { icon } from "./LayoutPages/shared";
import {
  StepperCheckoutDemo,
  StepperVerticalDemo,
  checkoutSteps,
  checkoutStepsFr,
  frenchStepperLabels,
  stepperCheckoutCode,
  stepperCompactCode,
  stepperVerticalCode,
} from "./LayoutPages/stepper";
import { lazyBlock } from "../layout/lazy-block";

/** Page bodies that pull in Base UI popup code load as islands while the page hydrates. */
const AccordionControlledDemo = lazyBlock(
  () => import("./LayoutPages/accordion-demo").then((m) => m.AccordionControlledDemo),
  { minHeight: "22rem" },
);

const island = { eager: true, minHeight: "80vh" };

/** The "Accordion" docs page (/layout/accordion): live examples, props and notes. */
export function AccordionPage() {
  const [faqOpen, setFaqOpen] = useState<string[]>(["shipping"]);
  return (
    <Page
      eyebrow="Layout"
      title="Accordion"
      description="Stacked sections that expand in place. The height follows a spring on the way open and a quicker ease on the way closed, the chevron turns with it, and the content drifts into place. Every trigger is a real button in the tab order."
      source="theme/src/components/accordion/accordion.tsx"
    >
      <ShowcaseStage<AccordionSceneData>
        label="Accordion demo"
        story={() => import("../layout/ShowcaseStage.accordion")}
        initial={{ open: "shipping" }}
        minHeight="32rem"
      >
        {(scene, ctx) => <AccordionScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="FAQ"
        description="The default glass variant: one card, and the open item rises as a lighter pane. Leading icons pick up the accent while open."
        // Signature motion, once in view: the first section folds as the next springs open, then it comes back.
        autoplay={() => {
          const next = faqs.find((faq) => faq.value !== "shipping")?.value;
          const timers = [
            window.setTimeout(() => setFaqOpen(next ? [next] : []), 600),
            window.setTimeout(() => setFaqOpen(["shipping"]), 2600),
          ];
          return () => {
            timers.forEach((t) => window.clearTimeout(t));
            setFaqOpen(["shipping"]);
          };
        }}
        code={accordionFaqCode}
      >
        {/* min-h: the tallest the group gets while the autoplay folds one item as the next springs open (both are part open at
            once, and the spring overshoots), measured from 320px to 1440px wide. A taller group would push the examples below
            it down a few times as it scrolls into view. */}
        <Accordion
          value={faqOpen}
          onValueChange={(value) => setFaqOpen(value.map(String))}
          className="min-h-[704px] max-w-xl min-[360px]:min-h-[597px] min-[390px]:min-h-[525px] min-[500px]:min-h-[449px] min-[640px]:min-h-[413px]"
        >
          {faqs.map((faq) => (
            <AccordionItem key={faq.value} value={faq.value}>
              <AccordionTrigger icon={icon(faq.icon)} description={faq.description}>
                {faq.title}
              </AccordionTrigger>
              <AccordionPanel>{faq.body}</AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </Example>

      <Example
        title="Separated, several open"
        description="Each item is its own glass card. multiple lets any number stay open; the plus folds into a minus."
        code={accordionSeparatedCode}
      >
        <Accordion variant="separated" multiple defaultValue={["plans", "billing"]} className="max-w-xl">
          <AccordionItem value="plans">
            <AccordionTrigger indicator="plus">Can I switch plans later?</AccordionTrigger>
            <AccordionPanel>
              Any time. Upgrades apply at once and are prorated; downgrades take effect at the end of the billing
              period.
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem value="billing">
            <AccordionTrigger indicator="plus">When am I billed?</AccordionTrigger>
            <AccordionPanel>
              On the same day each month as your first payment. Annual plans are billed once a year and save two months.
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem value="team">
            <AccordionTrigger indicator="plus">Do you offer team discounts?</AccordionTrigger>
            <AccordionPanel>
              Teams of ten or more get 20% off every seat. Nonprofits and schools get 50% off.
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Example>

      <Example
        title="Plain, controlled, inside a card"
        description='variant="plain" has no surface of its own, for settings inside an existing card. value / onValueChange control which sections are open; a disabled item stays visible.'
        code={accordionControlledCode}
      >
        <AccordionControlledDemo />
      </Example>

      <PropsTable
        title="Accordion"
        of={PROPS.Accordion}
        rows={[
          ["multiple", "boolean", "false", "Let several items stay open at once."],
          ["defaultValue", "any[]", "", "Values of the items open at first (uncontrolled)."],
          ["value / onValueChange", "any[] / (value) => void", "", "Control which items are open."],
          [
            "hiddenUntilFound",
            "boolean",
            "false",
            "Closed panels stay in the page so the browser's find-in-page can open them.",
          ],
          ["disabled", "boolean", "false", "Disables every item of the group."],
        ]}
      />
      <PropsTable
        title="AccordionItem"
        as="h3"
        of={PROPS.AccordionItem}
        rows={[
          ["value", "any", "auto id", "Names the item for defaultValue / value."],
          ["disabled", "boolean", "false", "The trigger stays visible but cannot be toggled."],
          ["onOpenChange", "(open) => void", "", "Called when this item opens or closes."],
        ]}
      />
      <PropsTable title="AccordionTrigger" as="h3" of={PROPS.AccordionTrigger} />
      <PropsTable
        title="AccordionPanel"
        as="h3"
        of={PROPS.AccordionPanel}
        rows={[["keepMounted", "boolean", "false", "Keep closed content in the DOM."]]}
      />
      <KeyboardTable
        rows={[
          ["Tab / Shift + Tab", "Move between triggers (disabled items are skipped)."],
          ["Enter / Space", "Open or close the focused item."],
        ]}
      />
      <A11yNotes
        items={[
          "Each trigger is a native button inside a heading (headingLevel sets the level) with aria-expanded and aria-controls.",
          "Closed panels are hidden from the accessibility tree, so their links are not tabbable; hiddenUntilFound lets find-in-page open matching panels.",
          "A disabled item is announced as dimmed; the chevron and icon tile are aria-hidden.",
        ]}
      />
    </Page>
  );
}

/** The Breadcrumb page body: its own chunk (see island), so its demos stay out of the route's initial JavaScript. */
export const BreadcrumbPage = lazyBlock(() => import("./BreadcrumbPageBody").then((m) => m.BreadcrumbPage), island);

/** The "Stepper" docs page (/layout/stepper): live examples, props and notes. */
export function StepperPage() {
  return (
    <Page
      eyebrow="Layout"
      title="Stepper"
      description="Progress through a multi-step flow. Lines fill with the accent as you advance, one after another when you jump; completed steps can be revisited; a step can flag an error. On phones it collapses to “Step 2 of 4” with a segmented bar."
      source="theme/src/components/stepper/stepper.tsx"
    >
      <ShowcaseStage<StepperSceneData>
        label="Stepper demo"
        story={() => import("../layout/ShowcaseStage.stepper")}
        initial={{ current: 0 }}
        minHeight="14rem"
      >
        {(scene, ctx) => <StepperScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Checkout"
        description="Click a completed step to go back to it. Toggle the error to see a step flag itself; screen readers hear each step's state."
        code={stepperCheckoutCode}
      >
        <StepperCheckoutDemo />
      </Example>

      <Example
        title="Vertical, with content"
        description="The current step reveals its own content. Optional steps say so."
        code={stepperVerticalCode}
      >
        <StepperVerticalDemo />
      </Example>

      <Example
        title="Labels beside, compact, translated"
        description='labelPlacement="end" puts titles next to the dots. The compact view is what phones get automatically. Every string, punctuation included, comes from labels.'
        code={stepperCompactCode}
      >
        <div className="flex w-full max-w-3xl flex-col gap-10">
          <Stepper
            labelPlacement="end"
            size="sm"
            current={1}
            steps={checkoutSteps.map(({ title }) => ({ title }))}
            labels={{ nav: "Checkout progress (labels beside)" }}
          />
          <div className="flex w-full flex-wrap gap-x-10 gap-y-8">
            <div className="w-full max-w-sm">
              <Stepper
                collapse="always"
                current={1}
                steps={checkoutSteps}
                labels={{ nav: "Checkout progress (compact)" }}
              />
            </div>
            <div lang="fr" className="w-full max-w-sm">
              <Stepper collapse="always" current={1} steps={checkoutStepsFr} labels={frenchStepperLabels} />
            </div>
          </div>
        </div>
      </Example>

      <PropsTable title="Stepper" of={PROPS.Stepper} />
      <KeyboardTable
        rows={[
          ["Tab / Shift + Tab", "Clickable steps are normal tab stops; non-clickable steps are not focusable."],
          ["Enter / Space", "Go to the focused step."],
        ]}
      />
      <A11yNotes
        items={[
          'An ordered list (<ol>) in a <nav>; the current step has aria-current="step" and every state (complete, current, upcoming, error) is also spoken.',
          "When current changes, keyboard focus stays in the stepper (it moves to the next step if its button disappeared).",
          'The compact "Step 2 of 4" view keeps the same information; every string is translatable through labels.',
        ]}
      />
    </Page>
  );
}
