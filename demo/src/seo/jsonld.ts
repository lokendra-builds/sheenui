import { version as THEME_VERSION } from "../../../theme/package.json";
import { guides } from "../guides";
import { routes } from "../routes";
import { breadcrumbs, type PageSeo, type RouteLike } from "./head";
import { HUBS, hubChildren } from "./hubs";
import { labelFor } from "./related";
import { AUTHOR, LICENSE_URL, REPO_URL, SITE_ALT_NAMES, SITE_NAME, SITE_URL, canonicalUrl } from "./site";
import { pageDates } from "./dates";

const SITE_ID = `${SITE_URL}/#website`;
const AUTHOR_ID = `${SITE_URL}/#author`;
const CODE_ID = `${SITE_URL}/#code`;
const ORG_ID = `${SITE_URL}/#project`;

const DESCRIPTION =
  "Glassmorphism and Liquid Glass React components with Motion animations. Accessible, copy-paste, built on Base UI and Tailwind CSS v4. Free and MIT.";

type JsonLd = Record<string, unknown>;

const website: JsonLd = {
  "@type": "WebSite",
  "@id": SITE_ID,
  name: SITE_NAME,
  alternateName: SITE_ALT_NAMES,
  url: `${SITE_URL}/`,
  inLanguage: "en",
};

const author: JsonLd = {
  "@type": "Person",
  "@id": AUTHOR_ID,
  name: AUTHOR.name,
  alternateName: AUTHOR.handle,
  url: AUTHOR.url,
  // The public GitHub avatar of the profile the byline links to.
  image: `${AUTHOR.url}.png`,
  sameAs: [AUTHOR.url],
};

/** The publisher of every article: the SheenUI project, with the site icon as its logo. */
const publisher: JsonLd = {
  "@type": "Organization",
  "@id": ORG_ID,
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  logo: { "@type": "ImageObject", url: `${SITE_URL}/icon-512.png`, width: 512, height: 512 },
  // The project's public repository: the one other place the project lives (the site itself is `url`).
  sameAs: [REPO_URL, `${SITE_URL}/`],
};

const code: JsonLd = {
  "@type": "SoftwareSourceCode",
  "@id": CODE_ID,
  name: SITE_NAME,
  description: DESCRIPTION,
  codeRepository: REPO_URL,
  programmingLanguage: ["TypeScript", "CSS"],
  runtimePlatform: "React 19.2",
  license: LICENSE_URL,
  // The version of @sheenui/theme (theme/package.json) and a free offer: the library is MIT and costs nothing.
  softwareVersion: THEME_VERSION,
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/InStock" },
  author: { "@id": AUTHOR_ID },
  keywords: ["glassmorphism", "liquid glass", "react components", "tailwind css", "motion", "base ui"],
};

/**
 * Google reads `offers` on a SoftwareApplication, not on SoftwareSourceCode: the same free offer, on the same project, as an
 * application node (a library you install from the registry, so DeveloperApplication on the web).
 */
const application: JsonLd = {
  "@type": "SoftwareApplication",
  "@id": `${SITE_URL}/#application`,
  name: SITE_NAME,
  description: DESCRIPTION,
  url: `${SITE_URL}/`,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  softwareVersion: THEME_VERSION,
  isAccessibleForFree: true,
  license: LICENSE_URL,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/InStock" },
  author: { "@id": AUTHOR_ID },
};

export type JsonLdOptions = {
  /** Last change of the page source (file mtime). Kept for callers; article dates come from pageDates() in site.ts. */
  dateModified?: string;
  /** Repo-relative source paths the page documents, e.g. "theme/src/components/glass-card". */
  sources?: string[];
  /** The questions and answers the page shows in its FAQ (read back from its HTML by the prerender): becomes a FAQPage node. */
  faq?: { q: string; a: string }[];
};

/** The FAQPage node for the visible FAQ, or none when the page has no FAQ. */
function faqPage(faq: JsonLdOptions["faq"]): JsonLd[] {
  if (!faq?.length) return [];
  return [
    {
      "@type": "FAQPage",
      mainEntity: faq.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    },
  ];
}

/**
 * The page's JSON-LD graph. Home: WebSite (site name only, no SearchAction),
 * Person, SoftwareSourceCode and SoftwareApplication. Hubs: BreadcrumbList, CollectionPage and ItemList. Guides: BreadcrumbList and
 * Article. Other pages: BreadcrumbList and TechArticle. The 404 page: none. A FAQPage node is added to any of them whose page shows a FAQ (options.faq, the visible questions and answers).
 */
export function buildJsonLd(route: RouteLike, seo: PageSeo, options: JsonLdOptions = {}): JsonLd | null {
  // The 404 page is noindex and has no address of its own: no structured data.
  if (route.path === "/404") return null;
  if (route.path === "/") {
    // The home page's WebSite carries the dates the home footer shows (layout/PageByline.tsx, scripts/gen-page-dates.mjs).
    const dated = {
      ...website,
      datePublished: pageDates("/").published,
      dateModified: pageDates("/").modified,
      publisher: { "@id": ORG_ID },
    };
    return {
      "@context": "https://schema.org",
      "@graph": [dated, author, publisher, code, application, ...faqPage(options.faq)],
    };
  }

  const breadcrumb: JsonLd = {
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs(route).map((crumb, index, all) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      ...(index < all.length - 1 || crumb.path !== route.path ? { item: canonicalUrl(crumb.path) } : {}),
    })),
  };

  const isPartOf = { "@type": "WebSite", "@id": SITE_ID, name: SITE_NAME, url: `${SITE_URL}/` };

  // Hubs are collections: a CollectionPage whose ItemList names every page they link to.
  if (HUBS[route.path]) {
    const items = hubChildren(routes, route.path);
    const collection: JsonLd = {
      "@type": "CollectionPage",
      "@id": `${seo.canonical}#collection`,
      name: seo.h1,
      headline: seo.h1,
      description: seo.description,
      url: seo.canonical,
      image: seo.ogImage,
      inLanguage: "en",
      // The dates the page footer shows (layout/PageByline.tsx): the ledger of scripts/gen-page-dates.mjs is their one source.
      datePublished: pageDates(route.path).published,
      dateModified: pageDates(route.path).modified,
      author: { "@id": AUTHOR_ID },
      publisher,
      isPartOf,
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: items.length,
        itemListElement: items.map((r, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: canonicalUrl(r.path),
          name: labelFor(routes, r.path),
        })),
      },
    };
    return { "@context": "https://schema.org", "@graph": [breadcrumb, collection, ...faqPage(options.faq)] };
  }

  // Guides are Articles with their own published and modified dates (front matter).
  const guide = guides.find((g) => route.path === `/guides/${g.slug}`);
  if (guide) {
    const post: JsonLd = {
      "@type": "Article",
      headline: seo.h1,
      description: seo.description,
      url: seo.canonical,
      mainEntityOfPage: seo.canonical,
      image: seo.ogImage,
      inLanguage: "en",
      datePublished: guide.published,
      dateModified: guide.updated,
      author: { ...author },
      publisher,
      isPartOf,
    };
    return { "@context": "https://schema.org", "@graph": [breadcrumb, post, ...faqPage(options.faq)] };
  }

  const source = options.sources?.[0];
  // /about is the entity page: an AboutPage that names the project (Organization), its maker (Person) and the code
  // (SoftwareSourceCode) by the same @ids the home page uses.
  const about = route.path === "/about";
  const article: JsonLd = {
    "@type": about ? "AboutPage" : "TechArticle",
    headline: seo.h1,
    description: seo.description,
    url: seo.canonical,
    mainEntityOfPage: seo.canonical,
    image: seo.ogImage,
    inLanguage: "en",
    // The dates and the author are the ones the page footer shows (layout/PageByline.tsx): pageDates() is their one source.
    // The file mtime that prerender passes in is deliberately not used.
    datePublished: pageDates(route.path).published,
    dateModified: pageDates(route.path).modified,
    author: { ...author },
    publisher,
    isPartOf,
    about: about
      ? { "@id": CODE_ID }
      : {
          "@type": "SoftwareSourceCode",
          codeRepository: source ? `${REPO_URL}/tree/main/${source.replace(/^\/+|\/+$/g, "")}` : REPO_URL,
          programmingLanguage: "TypeScript",
          license: LICENSE_URL,
        },
  };

  if (about) {
    const project: JsonLd = {
      ...publisher,
      description: DESCRIPTION,
      founder: { "@id": AUTHOR_ID },
    };
    return {
      "@context": "https://schema.org",
      "@graph": [breadcrumb, author, project, code, application, article, ...faqPage(options.faq)],
    };
  }
  return { "@context": "https://schema.org", "@graph": [breadcrumb, article, ...faqPage(options.faq)] };
}

/** Serialise for a <script type="application/ld+json"> (no "<" can end the script early). */
export function jsonLdScript(data: JsonLd) {
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;
}
