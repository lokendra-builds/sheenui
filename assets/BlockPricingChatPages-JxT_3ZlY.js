import{r as e}from"./toast-CiFfCngf.js";import{t}from"./pricing-DjjJ8BFz.js";import{t as n}from"./lazy-block-BfzH_8EP.js";import{t as r}from"./vendor-react-D30i__oY.js";import{n as i}from"./BlockStages.pricing-CbqQq8ir.js";import{i as a,n as o,o as s,r as c}from"./Page-BRuP8nt1.js";import{t as l}from"./Example-DaSezASZ.js";import{t as u}from"./preload-helper-BrmCrVM7.js";var d=[[`tiers`,`PricingTier[]`,`defaultTiers (The default plan tiers)`,"The plans (`PricingTier[]`, default: three sample tiers). The default is sample content for demos and prototypes: pass your own in production.",!1],[`features`,`PricingFeature[]`,`defaultFeatures (The default feature rows of the comparison table)`,"Rows of the comparison table (`PricingFeature[]`, default: sample features). The default is sample content for demos and prototypes: pass your own in production.",!1],[`title`,`ReactNode`,``,`Heading above the block. Leave out to render without a heading.`,!1],[`description`,`ReactNode`,``,"Shows text under the heading (`ReactNode`).",!1],[`headingLevel`,`HeadingLevelOption`,`2`,'Heading level of `title`, to fit the page outline. Tier names are one level below (`2 | 3`, default 2). `"none"` renders both as paragraphs with no heading role, for a block shown as an example.',!1],[`billing`,`PricingBilling`,``,'The billing period shown (controlled): `"monthly"` or `"yearly"`.',!1],[`defaultBilling`,`PricingBilling`,`"yearly"`,'The billing period at first when `billing` is not controlled (`PricingBilling`, default `"yearly"`).',!1],[`onBillingChange`,`((billing: PricingBilling) => void)`,``,`Called when the billing switch is flipped.`,!1],[`currency`,`string`,`"USD"`,'Sets the ISO 4217 currency code (`string`, default `"USD"`).',!1],[`locale`,`string`,`"en-US"`,'BCP 47 locale for prices and the savings percentage (`string`, default `"en-US"`).',!1],[`onSelect`,`((tier: PricingTier, billing: PricingBilling) => void)`,``,"Called when a tier's button is pressed (tiers with `href` navigate as well).",!1],[`compareOpen`,`boolean`,``,"Whether the comparison table is open (controlled). Pair with `onCompareOpenChange`.",!1],[`defaultCompareOpen`,`boolean`,`false`,"Start with the comparison table open (`boolean`, default `false`).",!1],[`onCompareOpenChange`,`((open: boolean) => void)`,``,`Called when the comparison table opens or closes.`,!1],[`footnote`,`ReactNode`,``,`Small print under the cards, e.g. "Prices in USD. Taxes may apply."`,!1],[`labels`,`Partial<PricingLabels>`,`defaultPricingLabels`,'Every other string, for translation: `labels={{ region: "…" }}`; omitted keys keep the English of `defaultPricingLabels`. All 21 keys of `PricingLabels` are listed in the key table under the props table.',!1,{type:`PricingLabels`,const:`defaultPricingLabels`,keys:[[`region`,`Pricing plans`],[`billing`,`Billing period`],[`monthly`,`Monthly`],[`yearly`,`Yearly`],[`save`,"(percent) => `Save ${percent}`"],[`perMonth`,`/mo`],[`perMonthLong`,`per month`],[`billedMonthly`,`Billed monthly`],[`billedYearly`,"(total) => `Billed ${total} yearly`"],[`free`,`Free forever`],[`custom`,`Custom`],[`customNote`,`Volume pricing for your org`],[`popular`,`Most popular`],[`included`,`Included`],[`notIncluded`,`Not included`],[`compare`,`Compare all features`],[`hideCompare`,`Hide comparison`],[`comparison`,`Feature comparison`],[`feature`,`Feature`],[`otherGroup`,`Other`],[`pricesShown`,"(billing) => `Showing ${billing} prices`"]]}],[`className`,`string`,``,`Adds extra classes to the outer <section>.`,!1]],f=r();n(()=>u(()=>import(`./ai-chat-CzgEl9F1.js`).then(e=>e.AiChat),[]),{minHeight:`32rem`,eager:!0});var p={eager:!0,minHeight:`80vh`},m=[{id:`basis`,name:`Basis`,description:`Für Einzelpersonen.`,price:{monthly:9,yearly:7.5},cta:`Jetzt starten`},{id:`studio`,name:`Studio`,description:`Für kleine Studios und Agenturen.`,price:{monthly:29,yearly:24},cta:`14 Tage testen`,popular:!0,featuresTitle:`Alles aus Basis, plus:`},{id:`konzern`,name:`Konzern`,description:`Für große Organisationen.`,cta:`Vertrieb kontaktieren`,featuresTitle:`Alles aus Studio, plus:`}],h=[{label:`Projekte`,values:{basis:`5`,studio:`Unbegrenzt`,konzern:`Unbegrenzt`}},{label:`Teammitglieder`,values:{basis:`1`,studio:`10`,konzern:`Unbegrenzt`}},{label:`Eigene Themes`,values:{basis:!1,studio:!0,konzern:!0}},{label:`SSO`,values:{basis:!1,studio:!1,konzern:!0}},{label:`Support`,values:{basis:`E-Mail`,studio:`Priorität`,konzern:`Persönlich`}}],g={region:`Preispläne`,billing:`Abrechnungszeitraum`,monthly:`Monatlich`,yearly:`Jährlich`,save:e=>`${e} sparen`,perMonth:`/Monat`,perMonthLong:`pro Monat`,billedMonthly:`Monatliche Abrechnung`,billedYearly:e=>`${e} jährlich abgerechnet`,custom:`Individuell`,customNote:`Volumenpreise für Ihr Unternehmen`,popular:`Beliebt`,included:`Enthalten`,notIncluded:`Nicht enthalten`,compare:`Alle Funktionen vergleichen`,hideCompare:`Vergleich ausblenden`,comparison:`Funktionsvergleich`,feature:`Funktion`,pricesShown:e=>e===`yearly`?`Jahrespreise werden angezeigt`:`Monatspreise werden angezeigt`};function _(){let n=e();return(0,f.jsxs)(o,{eyebrow:`Block`,title:`Pricing`,description:`Tier cards with a monthly / yearly switch and savings badge, prices that roll like an odometer, a “Most popular” tier traced by a beam of light, check and minus feature lists, and a full comparison table. It stacks by its own width, so it fits a sidebar layout as well as a landing page.`,source:`theme/src/blocks/pricing.tsx`,children:[(0,f.jsx)(i,{}),(0,f.jsx)(l,{title:`Four tiers`,description:`Switch between monthly and yearly: every digit rolls to its new value. Hover or focus the popular tier to keep its beam circling, then open the comparison table.`,stageClassName:`p-3 sm:p-8`,code:`
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
}`,children:(0,f.jsx)(t,{title:`Simple pricing, no surprises`,description:`Start free, upgrade when your team grows. Cancel any time.`,headingLevel:`none`,footnote:`Prices in USD, excluding taxes.`,onSelect:(e,t)=>n.success(`${e.name} selected`,`Billed ${t}. Wire this to your checkout.`)})}),(0,f.jsx)(l,{title:`Your own tiers, currency and language`,description:`Three tiers in euros with German labels. Prices, the savings badge and the yearly total are formatted with Intl for the locale, and the comparison table starts open.`,stageClassName:`p-3 sm:p-8`,code:`
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
/>`,children:(0,f.jsx)(`div`,{lang:`de`,className:`contents`,children:(0,f.jsx)(t,{headingLevel:`none`,tiers:m,features:h,currency:`EUR`,locale:`de-DE`,defaultBilling:`monthly`,defaultCompareOpen:!0,labels:g,footnote:`Alle Preise zzgl. MwSt.`})})}),(0,f.jsx)(c,{of:d}),(0,f.jsx)(s,{rows:[[`Tab`,`The billing switch, each plan's button, then the “Compare plans” disclosure.`],[`Space on the billing switch`,`Toggle monthly / yearly.`],[`Enter / Space on Compare plans`,`Open the comparison table, which scrolls horizontally on small screens.`]]}),(0,f.jsx)(a,{notes:[`A labeled <section>; tier names are headings one level below the title.`,`The price is real text with its period, and the billing switch announces the saving.`,`The comparison table has column and row headers.`]})]})}n(()=>u(()=>import(`./BentoGridPageBody-CBd8gqxn.js`).then(e=>e.BentoGridPage),[]),p);export{_ as default};