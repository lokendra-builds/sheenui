import { lazyBlock } from "../layout/lazy-block";
import { BlockStage } from "../layout/ShowcaseStage.block.scene";
import { press, type } from "../layout/ShowcaseStage.block.drive";

const Pricing = lazyBlock(() => import("../../../theme/src/blocks/pricing").then((m) => m.Pricing), {
  minHeight: "36rem",
  eager: true,
});

const AiChat = lazyBlock(() => import("../../../theme/src/blocks/ai-chat").then((m) => m.AiChat), {
  minHeight: "36rem",
  eager: true,
});

/** The stage at the top of /blocks/pricing: the billing switch goes to yearly and every price drops. */
export function PricingStage() {
  return (
    <BlockStage label="Pricing demo" story="two" width={1080} height={805} fit={700} fade actions={[press("Yearly")]}>
      <Pricing
        title="Simple pricing, no surprises"
        description="Start free, upgrade when your team grows. Cancel any time."
        headingLevel="none"
        footnote="Prices in USD, excluding taxes."
      />
    </BlockStage>
  );
}
PricingStage.isShowcaseStage = true;

/** The stage at the top of /blocks/ai-chat: a question is typed and sent, and the answer streams in. */
export function AiChatStage() {
  return (
    <BlockStage
      label="AI chat demo"
      story="chat"
      width={900}
      height={640}
      fit={520}
      actions={[type("Message", "Explain glassmorphism in two sentences", 28), press("Send message")]}
    >
      <AiChat headingLevel="none" />
    </BlockStage>
  );
}
AiChatStage.isShowcaseStage = true;
