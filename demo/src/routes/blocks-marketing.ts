import { lazyPage, type Route } from "./shared";

const first = () => import("../pages/BlockMarketingPages");
const second = () => import("../pages/BlockMarketingPages2");

/** The marketing-page "Blocks" routes of the docs site, in sidebar order. */
export const blocksMarketingRoutes: Route[] = [
  {
    path: "/blocks/hero-section",
    title: "Hero section",
    group: "Blocks",
    ...lazyPage(first, (m) => m.HeroSectionPage),
  },
  {
    path: "/blocks/feature-grid",
    title: "Feature grid",
    group: "Blocks",
    ...lazyPage(first, (m) => m.FeatureGridPage),
  },
  {
    path: "/blocks/testimonials",
    title: "Testimonials",
    group: "Blocks",
    ...lazyPage(first, (m) => m.TestimonialsPage),
  },
  {
    path: "/blocks/faq-section",
    title: "FAQ section",
    group: "Blocks",
    ...lazyPage(first, (m) => m.FaqSectionPage),
  },
  {
    path: "/blocks/contact-form",
    title: "Contact form",
    group: "Blocks",
    ...lazyPage(second, (m) => m.ContactFormPage),
  },
  {
    path: "/blocks/site-footer",
    title: "Site footer",
    group: "Blocks",
    ...lazyPage(second, (m) => m.SiteFooterPage),
  },
  {
    path: "/blocks/not-found-page",
    title: "404 page",
    group: "Blocks",
    ...lazyPage(second, (m) => m.NotFoundPage),
  },
  {
    path: "/blocks/announcement-banner",
    title: "Announcement banner",
    group: "Blocks",
    ...lazyPage(second, (m) => m.AnnouncementBannerPage),
  },
];
