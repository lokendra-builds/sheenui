/** The screenshot shown under each guide's title (files in demo/public/img, copies of docs/img). */
export type GuideImage = { file: string; width: number; height: number; alt: string };
type StyledShots = Record<"liquid" | "aurora", { light: GuideImage; dark: GuideImage }>;

const SHOTS = {
  liquidLight: {
    file: "sheenui-liquid-glass-react-components-light.webp",
    width: 1440,
    height: 900,
    alt: "Glassmorphism React components in the Liquid Glass style, light theme: a glass music player, revenue sparkline and sign-in toast over silk ribbons",
  },
  liquidDark: {
    file: "sheenui-liquid-glass-react-components-dark.webp",
    width: 1440,
    height: 900,
    alt: "Glass React components in the Liquid Glass style, dark theme: frosted cards over glowing ribbons and glossy spheres",
  },
  auroraLight: {
    file: "sheenui-aurora-neon-glassmorphism-light.webp",
    width: 1440,
    height: 900,
    alt: "Aurora Neon glassmorphism React components, light theme: frosted glass cards with glowing rims on a pearl aurora",
  },
  auroraDark: {
    file: "sheenui-aurora-neon-glassmorphism-dark.webp",
    width: 1440,
    height: 900,
    alt: "Aurora Neon glassmorphism React components, dark theme: neon-rimmed glass cards over a night aurora",
  },
  login: {
    file: "glassmorphism-login-form-react-liquid-light.webp",
    width: 1136,
    height: 694,
    alt: "A glassmorphism login form in React: a frosted glass sign-in card with email and password fields over a colorful background",
  },
  loginAurora: {
    file: "glassmorphism-login-form-react-aurora-dark.webp",
    width: 1136,
    height: 696,
    alt: "A glassmorphism login form in React, Aurora Neon style on a dark background",
  },
  refraction: {
    file: "liquid-glass-react-refraction-lens.webp",
    width: 1136,
    height: 394,
    alt: "Liquid Glass in React: a glass lens that bends the colorful background behind it, the refraction effect from iOS 26",
  },
  dashboard: {
    file: "glassmorphism-dashboard-react-liquid-light.webp",
    width: 1136,
    height: 832,
    alt: "A glassmorphism dashboard in React with animated charts and KPI tiles on glass cards, Liquid Glass style",
  },
  dashboardAurora: {
    file: "glassmorphism-dashboard-react-aurora-dark.webp",
    width: 1136,
    height: 838,
    alt: "A glassmorphism dashboard in React, Aurora Neon style on a dark background",
  },
  charts: {
    file: "animated-react-charts-glass-light.webp",
    width: 1136,
    height: 658,
    alt: "Animated React charts in glass cards: line, area, bar and donut charts with a colorblind-safe palette",
  },
} satisfies Record<string, GuideImage>;

/** A guide's own cover: four compositions (Liquid / Aurora x light / dark) made by scripts/make-guide-covers.mjs from live captures of the site. */
function cover(slug: string, alt: string) {
  // The four pictures are four different looks of one scene and each is in the page's HTML, so each says which one it is
  // (the page shows the one of the visitor's style and theme; the others are display:none).
  const shot = (style: string, tone: string): GuideImage => ({
    file: `guide-${slug}-${style}-${tone}.webp`,
    width: 1200,
    height: 630,
    alt: `${alt} (${style === "liquid" ? "Liquid Glass" : "Aurora Neon"} style, ${tone} theme)`,
  });
  return {
    ...shot("liquid", "light"),
    styled: {
      liquid: { light: shot("liquid", "light"), dark: shot("liquid", "dark") },
      aurora: { light: shot("aurora", "light"), dark: shot("aurora", "dark") },
    },
  };
}

export const guideImages: Record<string, (GuideImage & { styled?: StyledShots }) | undefined> = {
  "install-frameworks": cover(
    "install-frameworks",
    "Install SheenUI in Next.js and Vite: the shadcn CLI command beside a glass button and a dialog",
  ),
  "glassmorphism-react-tutorial": cover(
    "glassmorphism-react-tutorial",
    "Glassmorphism in React tutorial: a frosted glass card and a sign-in form over a colourful backdrop",
  ),
  "liquid-glass-css-react": cover(
    "liquid-glass-css-react",
    "Liquid Glass in CSS and React: a glass lens that refracts the colourful background behind it",
  ),
  "accessible-glassmorphism": cover(
    "accessible-glassmorphism",
    "Accessible glassmorphism: a glass switch and dialog next to the token board with solid fallbacks",
  ),
  "glassmorphism-vs-liquid-glass": cover(
    "glassmorphism-vs-liquid-glass",
    "Glassmorphism compared with Liquid Glass: a frosted card beside a refracting lens",
  ),
  "backdrop-filter-performance": cover(
    "backdrop-filter-performance",
    "Backdrop-filter performance: glass analytics dashboards with several blurred surfaces",
  ),
  "accessible-react-charts": cover(
    "accessible-react-charts",
    "Accessible React charts: an animated line chart and a web analytics dashboard in glass cards",
  ),
  "framer-motion-examples": cover(
    "framer-motion-examples",
    "Framer Motion examples: a magnifying dock, a morphing dialog and a rolling number ticker",
  ),
  "framer-motion-to-motion": cover(
    "framer-motion-to-motion",
    "Framer Motion to Motion: animated tabs, a toast and a morphing dialog built with motion/react",
  ),
  "base-ui-vs-radix": cover(
    "base-ui-vs-radix",
    "Base UI vs Radix: glass dialog, select and tabs components built on Base UI",
  ),
  "best-glassmorphism-react-libraries": cover(
    "best-glassmorphism-react-libraries",
    "Best glassmorphism React libraries: a component gallery, a glass card and a dashboard",
  ),
  "shadcn-alternatives": cover(
    "shadcn-alternatives",
    "shadcn alternatives: a collage of glass button, dialog, data table and tabs components",
  ),
  "shadcn-glassmorphism": cover(
    "shadcn-glassmorphism",
    "shadcn glassmorphism: a glass card, a glass dialog and a glass button",
  ),
  "glassmorphism-ui-prompt": cover(
    "glassmorphism-ui-prompt",
    "Glassmorphism UI prompts for AI coding agents: a glass sign-in form and the design token board",
  ),
};

/** The dark-theme counterpart of a light hero shot (same scene), so a dark page never gets a bright white card. Dark shots and the two light-only scenes (charts, refraction lens) have none. */
const DARK_OF: Record<string, GuideImage> = {
  [SHOTS.liquidLight.file]: SHOTS.liquidDark,
  [SHOTS.auroraLight.file]: SHOTS.auroraDark,
  [SHOTS.login.file]: SHOTS.loginAurora,
  [SHOTS.dashboard.file]: SHOTS.dashboardAurora,
};
export function guideDarkImage(image: GuideImage): GuideImage | undefined {
  return DARK_OF[image.file];
}

/** The cover in both styles and themes (a guide's own four compositions, or the four hero pictures); the old shared shots have no counterpart. */
export function guideStyledShots(image: GuideImage & { styled?: StyledShots }): StyledShots | undefined {
  if (image.styled) return image.styled;
  const hero = [SHOTS.liquidLight.file, SHOTS.liquidDark.file, SHOTS.auroraLight.file, SHOTS.auroraDark.file];
  if (!hero.includes(image.file)) return undefined;
  return {
    liquid: { light: SHOTS.liquidLight, dark: SHOTS.liquidDark },
    aurora: { light: SHOTS.auroraLight, dark: SHOTS.auroraDark },
  };
}

/** The `sizes` of a guide's hero image: the article column is 48rem wide, full width minus the gutters below that. */
export const GUIDE_IMAGE_SIZES = "(min-width: 48rem) 48rem, calc(100vw - 2rem)";

/** `srcset` of a guide image (files from scripts/make-guide-images.mjs): 480 px, 768 px and the original. */
export function guideImageSrcSet(image: GuideImage, base: string) {
  const stem = image.file.replace(/\.webp$/, "");
  return `${base}img/${stem}-480.webp 480w, ${base}img/${stem}-768.webp 768w, ${base}img/${image.file} ${image.width}w`;
}
