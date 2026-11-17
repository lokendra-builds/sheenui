export type SeoMeta = {
  /** Page part of the <title>, keyword first. */
  title: string;
  /** Meta description, 70–155 characters. */
  description: string;
  /** The one primary keyword this URL owns. */
  keyword: string;
  /** The page's visible H1; the sidebar keeps the route's short name. Defaults to the route title. */
  h1?: string;
  /** First sentence of the page's intro paragraph; carries the primary keyword. */
  intro?: string;
  /**
   * The answer-first definition shown right under the H1 (1 to 2 plain sentences: what it is, the use case, and for charts the
   * data shape). Filled in by meta.ts from ../answers.ts for every component, chart, effect, block and dashboard route.
   */
  answer?: string;
  /** The page's install line, `npx shadcn@latest add <site>/r/<item>.json` (filled in by meta.ts from ../answers.ts). */
  install?: string;
  /** Secondary keywords, for llms.txt and future copy work. */
  secondary?: string[];
  /** The day the page's own sources last changed (ISO date; filled in by meta.ts from generated/page-dates.ts). */
  modified?: string;
  /** Hidden from search: <meta name="robots" content="noindex"> and no sitemap entry. */
  noindex?: boolean;
};
