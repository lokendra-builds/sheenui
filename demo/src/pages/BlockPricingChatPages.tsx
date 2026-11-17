import { useToast } from "@sheenui/theme";

import { Pricing, type PricingFeature, type PricingTier } from "@sheenui/theme";
import type { AiChatMessage, AiChatRequest } from "@sheenui/theme";
import { lazyBlock } from "../layout/lazy-block";

// The chat block is an island (see layout/lazy-block.tsx): its code is a chunk of its own, fetched while the docs hydrate (it is the page's subject).
const AiChat = lazyBlock(() => import("../../../theme/src/blocks/ai-chat").then((m) => m.AiChat), {
  minHeight: "32rem",
  eager: true,
});
import { AiChatStage, PricingStage } from "./BlockStages.pricing";

import { Page, PropsTable } from "../layout/Page";
import { A11yNotes, KeyboardTable } from "../layout/DocSections";
import { Example } from "../layout/Example";
import * as PROPS from "../generated/component-props";

/** Page bodies that pull in Base UI popup code load as islands while the page hydrates. */
const island = { eager: true, minHeight: "80vh" };

/* =====================================================================
 * Pricing
 * ===================================================================== */

const euroTiers: PricingTier[] = [
  {
    id: "basis",
    name: "Basis",
    description: "Für Einzelpersonen.",
    price: { monthly: 9, yearly: 7.5 },
    cta: "Jetzt starten",
  },
  {
    id: "studio",
    name: "Studio",
    description: "Für kleine Studios und Agenturen.",
    price: { monthly: 29, yearly: 24 },
    cta: "14 Tage testen",
    popular: true,
    featuresTitle: "Alles aus Basis, plus:",
  },
  {
    id: "konzern",
    name: "Konzern",
    description: "Für große Organisationen.",
    cta: "Vertrieb kontaktieren",
    featuresTitle: "Alles aus Studio, plus:",
  },
];

const euroFeatures: PricingFeature[] = [
  { label: "Projekte", values: { basis: "5", studio: "Unbegrenzt", konzern: "Unbegrenzt" } },
  { label: "Teammitglieder", values: { basis: "1", studio: "10", konzern: "Unbegrenzt" } },
  { label: "Eigene Themes", values: { basis: false, studio: true, konzern: true } },
  { label: "SSO", values: { basis: false, studio: false, konzern: true } },
  { label: "Support", values: { basis: "E-Mail", studio: "Priorität", konzern: "Persönlich" } },
];

const germanLabels = {
  region: "Preispläne",
  billing: "Abrechnungszeitraum",
  monthly: "Monatlich",
  yearly: "Jährlich",
  save: (percent: string) => `${percent} sparen`,
  perMonth: "/Monat",
  perMonthLong: "pro Monat",
  billedMonthly: "Monatliche Abrechnung",
  billedYearly: (total: string) => `${total} jährlich abgerechnet`,
  custom: "Individuell",
  customNote: "Volumenpreise für Ihr Unternehmen",
  popular: "Beliebt",
  included: "Enthalten",
  notIncluded: "Nicht enthalten",
  compare: "Alle Funktionen vergleichen",
  hideCompare: "Vergleich ausblenden",
  comparison: "Funktionsvergleich",
  feature: "Funktion",
  pricesShown: (billing: "monthly" | "yearly") =>
    billing === "yearly" ? "Jahrespreise werden angezeigt" : "Monatspreise werden angezeigt",
};

/** The "Pricing" docs page (/blocks/pricing): live examples, props and notes. */
export function PricingPage() {
  const toast = useToast();
  return (
    <Page
      eyebrow="Block"
      title="Pricing"
      description="Tier cards with a monthly / yearly switch and savings badge, prices that roll like an odometer, a “Most popular” tier traced by a beam of light, check and minus feature lists, and a full comparison table. It stacks by its own width, so it fits a sidebar layout as well as a landing page."
      source="theme/src/blocks/pricing.tsx"
    >
      <PricingStage />
      <Example
        title="Four tiers"
        description="Switch between monthly and yearly: every digit rolls to its new value. Hover or focus the popular tier to keep its beam circling, then open the comparison table."
        stageClassName="p-3 sm:p-8"
        code={`
import { Pricing, type PricingBilling } from "@sheenui/theme";

// Your call: create a checkout session, then send the person to it
async function startCheckout(tierId: string, billing: PricingBilling) {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tier: tierId, billing }),
  });
  const { url } = (await res.json()) as { url: string };
  window.location.assign(url);
}

export function Example() {
  return (
    <Pricing
      title="Simple pricing, no surprises"
      description="Start free, upgrade when your team grows. Cancel any time."
      footnote="Prices in USD, excluding taxes."
      onSelect={(tier, billing) => startCheckout(tier.id, billing)}
    />
  );
}`}
      >
        <Pricing
          title="Simple pricing, no surprises"
          description="Start free, upgrade when your team grows. Cancel any time."
          headingLevel="none"
          footnote="Prices in USD, excluding taxes."
          onSelect={(tier, billing) =>
            toast.success(`${tier.name} selected`, `Billed ${billing}. Wire this to your checkout.`)
          }
        />
      </Example>

      <Example
        title="Your own tiers, currency and language"
        description="Three tiers in euros with German labels. Prices, the savings badge and the yearly total are formatted with Intl for the locale, and the comparison table starts open."
        stageClassName="p-3 sm:p-8"
        code={`
import { Pricing, type PricingTier, type PricingFeature } from "@sheenui/theme";

const tiers: PricingTier[] = [
  { id: "basis", name: "Basis", price: { monthly: 9, yearly: 7.5 }, cta: "Jetzt starten" },
  { id: "studio", name: "Studio", price: { monthly: 29, yearly: 24 }, cta: "14 Tage testen", popular: true },
  { id: "konzern", name: "Konzern", cta: "Vertrieb kontaktieren" }, // no price: "Individuell"
];

const features: PricingFeature[] = [
  { label: "Projekte", values: { basis: "5", studio: "Unbegrenzt", konzern: "Unbegrenzt" } },
  { label: "Eigene Themes", values: { basis: false, studio: true, konzern: true } },
  // true = included, false = not included, a string = included with a detail
];

<Pricing
  tiers={tiers}
  features={features}
  currency="EUR"
  locale="de-DE"
  defaultBilling="monthly"
  defaultCompareOpen
  labels={{ region: "Preispläne", monthly: "Monatlich", yearly: "Jährlich", save: (p) => \`\${p} sparen\`, perMonth: "/Monat" /* … */ }}
/>`}
      >
        <div lang="de" className="contents">
          <Pricing
            headingLevel="none"
            tiers={euroTiers}
            features={euroFeatures}
            currency="EUR"
            locale="de-DE"
            defaultBilling="monthly"
            defaultCompareOpen
            labels={germanLabels}
            footnote="Alle Preise zzgl. MwSt."
          />
        </div>
      </Example>

      <PropsTable of={PROPS.Pricing} />
      <KeyboardTable
        rows={[
          ["Tab", "The billing switch, each plan's button, then the “Compare plans” disclosure."],
          ["Space on the billing switch", "Toggle monthly / yearly."],
          ["Enter / Space on Compare plans", "Open the comparison table, which scrolls horizontally on small screens."],
        ]}
      />
      <A11yNotes
        notes={[
          "A labeled <section>; tier names are headings one level below the title.",
          "The price is real text with its period, and the billing switch announces the saving.",
          "The comparison table has column and row headers.",
        ]}
      />
    </Page>
  );
}

/* =====================================================================
 * Bento grid
 * ===================================================================== */

/** The BentoGrid page body: its own chunk (see island), so its demos stay out of the route's initial JavaScript. */
export const BentoGridPage = lazyBlock(() => import("./BentoGridPageBody").then((m) => m.BentoGridPage), island);

/* =====================================================================
 * AI chat
 * ===================================================================== */

const history: AiChatMessage[] = [
  { id: "h1", role: "user", content: "How do I debounce a search field in React?" },
  {
    id: "h2",
    role: "assistant",
    model: "nova-large",
    content:
      "Keep the input instant and debounce the **value** you search with:\n\n```tsx\nfunction useDebounced<T>(value: T, ms = 250) {\n  const [debounced, setDebounced] = useState(value);\n  useEffect(() => {\n    const id = setTimeout(() => setDebounced(value), ms);\n    return () => clearTimeout(id);\n  }, [value, ms]);\n  return debounced;\n}\n```\n\nThen fetch with `useDebounced(query)` instead of `query`.",
  },
];

const streamedReply =
  "Good question. With `AbortController` you can cancel the stale request too:\n\n1. Create a controller in the effect.\n2. Pass `controller.signal` to `fetch`.\n3. Call `controller.abort()` in the cleanup.\n\nNow a fast typist never sees results for an old query arrive **after** the new ones.";

/** A stand-in for a real streaming API: yields a few words at a time. */
async function* fakeStream({ signal }: AiChatRequest): AsyncGenerator<string> {
  await new Promise((resolve) => setTimeout(resolve, 700));
  const words = streamedReply.split(/(?<=\s)/);
  for (let i = 0; i < words.length && !signal.aborted; i += 2) {
    yield words.slice(i, i + 2).join("");
    await new Promise((resolve) => setTimeout(resolve, 40 + Math.random() * 50));
  }
}

async function flakyRespond({ attempt, signal }: AiChatRequest): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  if (signal.aborted) return "";
  if (attempt === 0) throw new Error("The model is busy right now (429). Try again in a moment.");
  return "Back online. Errors keep whatever text already arrived, show the message from your `Error`, and offer **Try again**, which calls `respond` again with `attempt` set to 1.";
}

/** The "AI chat" docs page (/blocks/ai-chat): live examples, props and notes. */
export function AiChatPage() {
  const toast = useToast();
  return (
    <Page
      eyebrow="Block"
      title="AI chat"
      description="An assistant panel: user and assistant messages, a reply that streams in word by word, a “thinking” shimmer, light Markdown with code blocks, attachments, a model picker, stop and regenerate, suggestion chips and a scroll-to-latest button. Screen readers hear one clean announcement per reply instead of every streamed word."
      source="theme/src/blocks/ai-chat.tsx"
    >
      <AiChatStage />
      <Example
        title="Assistant"
        description="Pick a suggestion or type a message. Press Stop (or Escape) while it writes, regenerate the last reply, attach or drop a file, and scroll up mid-reply to see the jump button."
        stageClassName="p-3 sm:p-8"
        code={`
import { AiChat } from "@sheenui/theme";

// Your analytics call
function track(event: string, properties: Record<string, unknown>) {
  void fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, properties }),
  });
}

export function Example() {
  return (
    <AiChat
      respond={async ({ messages, model, signal }) => {
        const res = await fetch("/api/chat", {
          method: "POST",
          body: JSON.stringify({ model, messages }),
          signal, // Stop aborts the request
        });
        return res.text(); // a string is typed out word by word
      }}
      onFeedback={(message, rating) => track("feedback", { id: message.id, rating })}
    />
  );
}`}
      >
        <AiChat
          headingLevel="none"
          onFeedback={(_, rating) =>
            rating && toast.success(rating === "up" ? "Marked as helpful" : "Thanks, we'll do better")
          }
        />
      </Example>

      <Example
        title="Real streaming and history"
        description="Return an async iterable to stream tokens as they arrive. This one continues an earlier conversation, uses its own assistant name and models, and turns attachments off."
        stageClassName="p-3 sm:p-8"
        code={`
import { AiChat, type AiChatMessage } from "@sheenui/theme";

// An earlier conversation, e.g. loaded from your database
const savedMessages: AiChatMessage[] = [
  { id: "h1", role: "user", content: "How do I debounce a search field in React?" },
  {
    id: "h2",
    role: "assistant",
    model: "nova-large",
    content: "Keep the input instant and debounce the **value** you search with, then fetch with the debounced value instead of the raw one.",
  },
];

export function Example() {
  return (
    <AiChat
      defaultMessages={savedMessages}
      models={[
        { value: "nova-large", label: "Nova Large", description: "Most capable" },
        { value: "nova-small", label: "Nova Small", description: "Fastest" },
      ]}
      allowAttachments={false}
      labels={{ assistant: "Nova", placeholder: "Ask Nova…" }}
      respond={async function* ({ messages, model, signal }) {
        const res = await fetch("/api/chat/stream", { method: "POST", body: JSON.stringify({ model, messages }), signal });
        const reader = res.body!.pipeThrough(new TextDecoderStream()).getReader();
        for (;;) {
          const { value, done } = await reader.read();
          if (done) return;
          yield value; // each chunk is appended as it arrives
        }
      }}
    />
  );
}`}
      >
        <AiChat
          headingLevel="none"
          defaultMessages={history}
          models={[
            { value: "nova-large", label: "Nova Large", description: "Most capable" },
            { value: "nova-small", label: "Nova Small", description: "Fastest" },
          ]}
          allowAttachments={false}
          labels={{ assistant: "Nova", placeholder: "Ask Nova…" }}
          respond={fakeStream}
          className="h-[34rem]"
        />
      </Example>

      <Example
        title="Errors and retry"
        description="Throw from respond to show an error under the reply. This one fails the first time and works on Try again. Give each chat on a page its own assistant name: it names the chat for screen readers."
        stageClassName="p-3 sm:p-8"
        code={`
import { AiChat } from "@sheenui/theme";

<AiChat
  labels={{ assistant: "Atlas" }}
  suggestions={["Summarize my week"]}
  respond={async ({ attempt }) => {
    if (attempt === 0) throw new Error("The model is busy right now (429).");
    return "Back online…";
  }}
/>`}
      >
        <AiChat
          headingLevel="none"
          labels={{ assistant: "Atlas" }}
          suggestions={["Summarize my week", "What changed in the last release?"]}
          respond={flakyRespond}
          className="h-[30rem]"
        />
      </Example>

      <PropsTable of={PROPS.AiChat} />
      <PropsTable
        title="AiChatRequest"
        rows={[
          ["prompt", "string", "", "The text of the message being answered."],
          [
            "attachments",
            "AiChatAttachment[]",
            "",
            "{ id, name, size, type, previewUrl, file } for files sent with it.",
          ],
          ["messages", "AiChatMessage[]", "", "The conversation so far, oldest first, ending with this prompt."],
          ["model", "string", "", "Holds the value of the model the person chose."],
          ["attempt", "number", "", "0 for a new prompt; 1, 2… for each regenerate or retry."],
          ["signal", "AbortSignal", "", "Aborted by Stop, New chat or unmount. Pass it to fetch."],
        ]}
      />
      <PropsTable
        title="AiChatMessage"
        rows={[
          ["id", "string", "", "Stable identifier of the message, used as the React key and in callbacks."],
          [
            "role",
            '"user" | "assistant"',
            "",
            'Says who wrote the message: the person ("user") or the model ("assistant").',
          ],
          [
            "content",
            "string",
            "",
            "Light Markdown: **bold**, `code`, fenced code blocks, - and 1. lists, [links](https://…). User messages show as plain text.",
          ],
          ["attachments", "AiChatAttachment[]", "", "Lists the files shown above a user message."],
          ["model", "string", "", "Sets the model value shown under an assistant reply."],
          [
            "status",
            '"thinking" | "streaming" | "done" | "stopped" | "error"',
            '"done"',
            "Progress of an assistant reply; user messages have no status.",
          ],
          ["error", "string", "", "Shown when status is error."],
        ]}
      />
      <KeyboardTable
        rows={[
          ["Enter", "Send the message (on touch keyboards Enter adds a line and the send button sends)."],
          ["Shift + Enter", "Add a line."],
          ["Escape", "Stop a reply."],
          [
            "Tab",
            "The conversation (a scrollable region), the suggestion chips, the attach button, the model picker, then send.",
          ],
        ]}
      />
      <A11yNotes
        notes={[
          "Every message starts with a visually hidden heading (“You said:”), so the conversation can be navigated by heading.",
          "Streaming text is not read piece by piece: one polite live region reports thinking, then the finished reply, a stop or an error.",
          "The key hint is linked to the field with aria-describedby. Give each chat on a page its own assistant name: it names the chat for screen readers.",
        ]}
      />
    </Page>
  );
}
