import { lazyBlock } from "./lazy-block";

export type { FaqItem } from "./Faq";

/*
 * The FAQ and the "About" accordions as islands. Both sit below the demos, and their code (the accordion, its
 * collapsible panel and Motion's component layer) is about 6 KB gzip: pages that render them import them from here
 * so it loads once the page is idle instead of being part of the route's initial JavaScript. The questions and answers
 * are in the prerendered HTML (hidden="until-found"), so crawlers and find-in-page see them either way.
 */
export const Faq = lazyBlock(() => import("./Faq").then((m) => m.Faq), { minHeight: "20rem" });

export const AboutSection = lazyBlock(() => import("./AboutAccordion").then((m) => m.AboutSection), {
  minHeight: "14rem",
});
