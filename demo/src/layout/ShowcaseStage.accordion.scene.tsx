import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from "@sheenui/theme";

import { useFollow } from "./ShowcaseStage.follow";
import type { StageContext } from "./ShowcaseStage";
import type { AccordionScene } from "./ShowcaseStage.accordion";

const FAQ = [
  {
    value: "shipping",
    title: "How long does shipping take?",
    body: "Orders leave within a day and arrive in two to four.",
  },
  { value: "returns", title: "Can I return an order?", body: "Within 30 days, free, no questions asked." },
  {
    value: "warranty",
    title: "Is there a warranty?",
    body: "Two years on every product, covered from the day it ships.",
  },
] as const;

/**
 * The live Accordion on its stage: opening one answer folds the other. Every item is reserved the height of its open
 * state (trigger plus the longest answer, 8.25rem on a phone where a title wraps), so the panel opens inside its own slot
 * and the items below never move: the story plays on its own, and an auto-played height change that pushes siblings
 * would count as layout shift. (The real Accordion, which reflows by design, is unchanged: this is the stage only.)
 */
export function AccordionScene({ scene }: { scene: AccordionScene; ctx: StageContext }) {
  const [open, setOpen] = useFollow<string>(scene.open);
  return (
    <div className="sheen-stage-col sheen-stage-wide">
      <Accordion
        value={open ? [open] : []}
        onValueChange={(value) => setOpen(value.map(String)[0] ?? "")}
        className="w-full text-start"
      >
        {FAQ.map((item) => (
          <AccordionItem key={item.value} value={item.value} className="min-h-[7.5rem] max-sm:min-h-[8.25rem]">
            <AccordionTrigger headingLevel="none">{item.title}</AccordionTrigger>
            <AccordionPanel>{item.body}</AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
