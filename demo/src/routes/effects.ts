import { lazyPage, type Route } from "./shared";

const hubs = () => import("../pages/HubPages");

/** The "Effects" routes of the docs site, in sidebar order. */
export const effectsRoutes: Route[] = [
  { path: "/effects", title: "All effects", group: "Effects", ...lazyPage(hubs, (m) => m.EffectsHubPage) },
  {
    path: "/effects/blur-in",
    title: "Blur in",
    group: "Effects",
    ...lazyPage(
      () => import("../pages/TextEffectsPages"),
      (m) => m.BlurInPage,
    ),
  },
  {
    path: "/effects/border-beam",
    title: "Border beam",
    group: "Effects",
    ...lazyPage(
      () => import("../pages/LiquidGlassPages"),
      (m) => m.BorderBeamPage,
    ),
  },
  {
    path: "/effects/macos-dock",
    title: "macOS dock",
    group: "Effects",
    ...lazyPage(
      () => import("../pages/DockTiltPages"),
      (m) => m.DockPage,
    ),
  },
  {
    path: "/effects/liquid-glass",
    title: "Liquid glass",
    group: "Effects",
    ...lazyPage(
      () => import("../pages/LiquidGlassPages"),
      (m) => m.LiquidGlassPage,
    ),
  },
  {
    path: "/effects/marquee",
    title: "Marquee",
    group: "Effects",
    ...lazyPage(
      () => import("../pages/NumberTickerMarqueePages"),
      (m) => m.MarqueePage,
    ),
  },
  {
    path: "/effects/morphing-dialog",
    title: "Morphing dialog",
    group: "Effects",
    ...lazyPage(
      () => import("../pages/DockTiltPages"),
      (m) => m.MorphingDialogPage,
    ),
  },
  {
    path: "/effects/number-ticker",
    title: "Number ticker",
    group: "Effects",
    ...lazyPage(
      () => import("../pages/NumberTickerMarqueePages"),
      (m) => m.NumberTickerPage,
    ),
  },
  {
    path: "/effects/shimmer-text",
    title: "Shimmer text",
    group: "Effects",
    ...lazyPage(
      () => import("../pages/TextEffectsPages"),
      (m) => m.ShimmerTextPage,
    ),
  },
  {
    path: "/effects/spotlight-card",
    title: "Spotlight card",
    group: "Effects",
    ...lazyPage(
      () => import("../pages/LiquidGlassPages"),
      (m) => m.SpotlightCardPage,
    ),
  },
  {
    path: "/effects/3d-tilt-card",
    title: "3D tilt card",
    group: "Effects",
    ...lazyPage(
      () => import("../pages/DockTiltPages"),
      (m) => m.TiltCardPage,
    ),
  },
  {
    path: "/effects/typewriter",
    title: "Typewriter",
    group: "Effects",
    ...lazyPage(
      () => import("../pages/TextEffectsPages"),
      (m) => m.TypewriterPage,
    ),
  },
  {
    path: "/effects/word-rotate",
    title: "Word rotate",
    group: "Effects",
    ...lazyPage(
      () => import("../pages/TextEffectsPages"),
      (m) => m.WordRotatePage,
    ),
  },
  {
    path: "/effects/animated-beam",
    title: "Animated beam",
    group: "Effects",
    ...lazyPage(
      () => import("../pages/BeamParticlesPages"),
      (m) => m.AnimatedBeamPage,
    ),
  },
  {
    path: "/effects/confetti",
    title: "Confetti",
    group: "Effects",
    ...lazyPage(
      () => import("../pages/ScrollEffectsPages"),
      (m) => m.ConfettiPage,
    ),
  },
  {
    path: "/effects/meteors",
    title: "Meteors",
    group: "Effects",
    ...lazyPage(
      () => import("../pages/MeteorsOrbitPages"),
      (m) => m.MeteorsPage,
    ),
  },
  {
    path: "/effects/orbiting-circles",
    title: "Orbiting circles",
    group: "Effects",
    ...lazyPage(
      () => import("../pages/MeteorsOrbitPages"),
      (m) => m.OrbitingCirclesPage,
    ),
  },
  {
    path: "/effects/particles",
    title: "Particles",
    group: "Effects",
    ...lazyPage(
      () => import("../pages/BeamParticlesPages"),
      (m) => m.ParticlesPage,
    ),
  },
  {
    path: "/effects/scroll-progress",
    title: "Scroll progress",
    group: "Effects",
    ...lazyPage(
      () => import("../pages/ScrollEffectsPages"),
      (m) => m.ScrollProgressPage,
    ),
  },
  {
    path: "/effects/text-reveal",
    title: "Text reveal",
    group: "Effects",
    ...lazyPage(
      () => import("../pages/ScrollEffectsPages"),
      (m) => m.TextRevealPage,
    ),
  },
];
