import { lazyPage, type Route } from "./shared";

/** The "Guides" routes of the docs site, in sidebar order. */
export const guidesRoutes: Route[] = [
  // Guides: docs/guides/*.md rendered by pages/GuidePages.tsx (the hub lists them; src/guides.ts is their index).
  {
    path: "/guides",
    title: "Guides",
    group: "Guides",
    ...lazyPage(
      () => import("../pages/GuidePages"),
      (m) => m.GuidesHubPage,
    ),
  },
  {
    path: "/guides/install-frameworks",
    title: "Install in Next.js and Vite",
    group: "Guides",
    ...lazyPage(
      () => import("../pages/GuidePages"),
      (m) => m.InstallFrameworksGuidePage,
    ),
  },
  {
    path: "/guides/glassmorphism-react-tutorial",
    title: "Glassmorphism React tutorial",
    group: "Guides",
    ...lazyPage(
      () => import("../pages/GuidePages"),
      (m) => m.GlassmorphismReactTutorialGuidePage,
    ),
  },
  {
    path: "/guides/liquid-glass-css-react",
    title: "Liquid Glass in CSS and React",
    group: "Guides",
    ...lazyPage(
      () => import("../pages/GuidePages"),
      (m) => m.LiquidGlassCssReactGuidePage,
    ),
  },
  {
    path: "/guides/accessible-glassmorphism",
    title: "Accessible glassmorphism",
    group: "Guides",
    ...lazyPage(
      () => import("../pages/GuidePages"),
      (m) => m.AccessibleGlassmorphismGuidePage,
    ),
  },
  {
    path: "/guides/glassmorphism-vs-liquid-glass",
    title: "Glassmorphism vs Liquid Glass",
    group: "Guides",
    ...lazyPage(
      () => import("../pages/GuidePages"),
      (m) => m.GlassmorphismVsLiquidGlassGuidePage,
    ),
  },
  {
    path: "/guides/backdrop-filter-performance",
    title: "backdrop-filter performance",
    group: "Guides",
    ...lazyPage(
      () => import("../pages/GuidePages"),
      (m) => m.BackdropFilterPerformanceGuidePage,
    ),
  },
  {
    path: "/guides/accessible-react-charts",
    title: "Accessible React charts",
    group: "Guides",
    ...lazyPage(
      () => import("../pages/GuidePages"),
      (m) => m.AccessibleReactChartsGuidePage,
    ),
  },
  {
    path: "/guides/framer-motion-examples",
    title: "Framer Motion examples",
    group: "Guides",
    ...lazyPage(
      () => import("../pages/GuidePages"),
      (m) => m.FramerMotionExamplesGuidePage,
    ),
  },
  {
    path: "/guides/framer-motion-to-motion",
    title: "Framer Motion to Motion",
    group: "Guides",
    ...lazyPage(
      () => import("../pages/GuidePages"),
      (m) => m.FramerMotionToMotionGuidePage,
    ),
  },
  {
    path: "/guides/base-ui-vs-radix",
    title: "Base UI vs Radix",
    group: "Guides",
    ...lazyPage(
      () => import("../pages/GuidePages"),
      (m) => m.BaseUiVsRadixGuidePage,
    ),
  },
  {
    path: "/guides/best-glassmorphism-react-libraries",
    title: "Best glassmorphism libraries",
    group: "Guides",
    ...lazyPage(
      () => import("../pages/GuidePages"),
      (m) => m.BestGlassmorphismReactLibrariesGuidePage,
    ),
  },
  {
    path: "/guides/shadcn-alternatives",
    title: "shadcn alternatives",
    group: "Guides",
    ...lazyPage(
      () => import("../pages/GuidePages"),
      (m) => m.ShadcnAlternativesGuidePage,
    ),
  },
  {
    path: "/guides/shadcn-glassmorphism",
    title: "shadcn glassmorphism",
    group: "Guides",
    ...lazyPage(
      () => import("../pages/GuidePages"),
      (m) => m.ShadcnGlassmorphismGuidePage,
    ),
  },
  {
    path: "/guides/glassmorphism-ui-prompt",
    title: "Glassmorphism UI prompts",
    group: "Guides",
    ...lazyPage(
      () => import("../pages/GuidePages"),
      (m) => m.GlassmorphismUiPromptGuidePage,
    ),
  },
];
