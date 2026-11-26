import { cn } from "@sheenui/theme";
import { AboutSection, Faq } from "../layout/LazyAbout";
import { GuideArticle } from "../layout/GuideArticle";
import { Page } from "../layout/Page";
import { HubPreview, useHubLive, type PreviewCover } from "../layout/HubPreview";
import { guidePath, guides } from "../guides";
import { guideDarkImage, guideStyledShots, guideImageSrcSet, guideImages, type GuideImage } from "../guide-images";
import { href } from "../router";
import { BASE_PATH } from "../seo/site";
import installFrameworksMarkdown from "../../../docs/guides/install-frameworks.md?raw";
import glassmorphismReactTutorialMarkdown from "../../../docs/guides/glassmorphism-react-tutorial.md?raw";
import liquidGlassCssReactMarkdown from "../../../docs/guides/liquid-glass-css-react.md?raw";
import accessibleGlassmorphismMarkdown from "../../../docs/guides/accessible-glassmorphism.md?raw";
import glassmorphismVsLiquidGlassMarkdown from "../../../docs/guides/glassmorphism-vs-liquid-glass.md?raw";
import backdropFilterPerformanceMarkdown from "../../../docs/guides/backdrop-filter-performance.md?raw";
import accessibleReactChartsMarkdown from "../../../docs/guides/accessible-react-charts.md?raw";
import framerMotionExamplesMarkdown from "../../../docs/guides/framer-motion-examples.md?raw";
import framerMotionToMotionMarkdown from "../../../docs/guides/framer-motion-to-motion.md?raw";
import baseUiVsRadixMarkdown from "../../../docs/guides/base-ui-vs-radix.md?raw";
import bestGlassmorphismReactLibrariesMarkdown from "../../../docs/guides/best-glassmorphism-react-libraries.md?raw";
import shadcnAlternativesMarkdown from "../../../docs/guides/shadcn-alternatives.md?raw";
import shadcnGlassmorphismMarkdown from "../../../docs/guides/shadcn-glassmorphism.md?raw";
import glassmorphismUiPromptMarkdown from "../../../docs/guides/glassmorphism-ui-prompt.md?raw";

// The guides are Markdown files in docs/guides (readable on GitHub as they are). Each page below imports
// only its own file as text, so a guide's route downloads that one article and nothing else (the build gives each
// route its own copy of this module with only its page kept: vite.page-instances.mjs).

/** The hub's groups by what the reader wants to do. Every guide sits in exactly one. */
const GUIDE_GROUPS: { id: string; title: string; intro: string; slugs: string[] }[] = [
  {
    id: "getting-started",
    title: "Getting started",
    intro:
      "Read these to get glass UI running: install SheenUI in Next.js or Vite, build a glass card from scratch in React, add glass to a shadcn/ui project, or give an AI coding agent rules that produce readable glass.",
    slugs: ["install-frameworks", "glassmorphism-react-tutorial", "shadcn-glassmorphism", "glassmorphism-ui-prompt"],
  },
  {
    id: "concepts",
    title: "Concepts and patterns",
    intro:
      "Read these to understand how a technique works before you use it: Apple's Liquid Glass refraction with a Safari and Firefox fallback, and twelve Motion patterns for React.",
    slugs: ["liquid-glass-css-react", "framer-motion-examples"],
  },
  {
    id: "comparisons",
    title: "Comparisons",
    intro:
      "Read these to choose: glassmorphism against Liquid Glass and neumorphism, Base UI against Radix, glass libraries against each other, and shadcn alternatives. Each compares checked data and says where SheenUI is the author's own.",
    slugs: [
      "glassmorphism-vs-liquid-glass",
      "base-ui-vs-radix",
      "best-glassmorphism-react-libraries",
      "shadcn-alternatives",
    ],
  },
  {
    id: "migration",
    title: "Migration",
    intro:
      "Read this if your code still imports from framer-motion: the package is now Motion, imported from motion/react, and the guide covers the switch, Next.js and bundle size.",
    slugs: ["framer-motion-to-motion"],
  },
  {
    id: "performance-accessibility",
    title: "Performance and accessibility",
    intro:
      "Read these before shipping glass: what backdrop-filter costs and how to keep it fast, how to measure and meet contrast on translucent surfaces, and how to make charts usable without color or a mouse.",
    slugs: ["backdrop-filter-performance", "accessible-glassmorphism", "accessible-react-charts"],
  },
];

/** The hub's own questions, answered in one paragraph each (the FAQPage markup is read back from them). */
const HUB_FAQ = [
  {
    q: "Which guide should I read first?",
    a: "To install, read the Next.js and Vite install guide. To learn the technique, read the glassmorphism React tutorial. To choose a library, start with the comparison of glassmorphism React libraries.",
  },
  {
    q: "Do the guides say which versions they were checked against?",
    a: "Where a guide quotes third-party facts (versions, licences, star counts, browser support), it dates them in the text, such as React 19.3, Tailwind CSS 4.3 and Vite 8.3 in the install guide. Several guides also say near the top what they are based on, and every guide shows its published and updated dates; those are when the text was written and revised, not a claim that every fact was re-checked that day.",
  },
  {
    q: "Is the code in the guides tested?",
    a: "Yes, the TypeScript samples that use SheenUI are compiled against the library by the repo's checks. The Code panel samples on the component pages and the guides' own code blocks are type-checked against the real SheenUI exports by pnpm pagecode:check, and the @example blocks in the library source by pnpm examples:check. A guide sample that shows another library's API, such as the Radix version in the Base UI comparison, is marked external and is not compiled. Compiling is not running: where a guide says it ran or checked something, such as the install guide's end-to-end runs in Next.js and Vite apps, it says what and on which date.",
  },
  {
    q: "Are the comparison guides neutral?",
    a: "They say up front that SheenUI is the author's own library, give strengths first and mark data they could not verify instead of guessing.",
  },
  {
    q: "Can I read the guides outside the site?",
    a: "Yes. Each guide is a Markdown file in the docs/guides folder of the repository, and the full text is also in the llms.txt files.",
  },
];

/** /guides: every guide with its one-line summary, grouped by what the reader wants to do. */
export function GuidesHubPage() {
  const list = useHubLive();
  return (
    <Page
      eyebrow="Guides"
      title="React glass UI guides and tutorials"
      description="Step-by-step guides for building accessible glass UI in React: tutorials, Safari and Firefox fallbacks, performance, Motion, Base UI and how to install SheenUI."
    >
      <div className="flex flex-col gap-10">
        <ul ref={list} className="flex flex-col gap-10">
          {GUIDE_GROUPS.map((group, g) => (
            <li key={group.id}>
              <section aria-labelledby={`guides-${group.id}`} className="flex flex-col gap-4">
                <h2 id={`guides-${group.id}`} className="text-xl font-semibold tracking-tight">
                  {group.title}
                </h2>
                <p className="max-w-3xl text-base leading-relaxed text-pretty text-sheen-fg-muted">{group.intro}</p>
                <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {group.slugs
                    .flatMap((slug) => {
                      const guide = guides.find((x) => x.slug === slug);
                      return guide ? [guide] : [];
                    })
                    .map((guide) => (
                      <li
                        key={guide.slug}
                        className={cn(
                          "flex",
                          g === 0 && guide.slug === "install-frameworks" && "sm:col-span-2 xl:col-span-3",
                        )}
                      >
                        <GuideCard guide={guide} featured={g === 0 && guide.slug === "install-frameworks"} />
                      </li>
                    ))}
                </ul>
              </section>
            </li>
          ))}
        </ul>

        <Faq items={HUB_FAQ} />

        <div className="max-w-3xl">
          <AboutSection
            title="About the guides"
            groups={[
              {
                items: [
                  {
                    value: "overview",
                    title: "How the guides are written",
                    body: (
                      <p className="text-base leading-relaxed text-pretty">
                        Each guide is a Markdown file in the repository (
                        <code className="rounded-sheen-sm bg-sheen-hover px-1.5 py-0.5 font-sheen-mono text-[0.85em]">
                          docs/guides
                        </code>
                        ), so you can read it on GitHub or here. The component pages&rsquo; code samples are
                        type-checked against the real exports, and so are the guides&rsquo; own TypeScript samples that
                        use SheenUI, and every guide links to the SheenUI pages it talks about. Who writes them and how
                        the facts are checked is on the{" "}
                        <a
                          href={href("/about")}
                          className="font-medium text-sheen-accent underline underline-offset-4 hover:text-sheen-fg"
                        >
                          About SheenUI
                        </a>{" "}
                        page.
                      </p>
                    ),
                  },
                ],
              },
            ]}
          />
        </div>
      </div>
    </Page>
  );
}

/** A guide's cover for its hub card: the light shot and the dark counterpart of the same scene, when there is one. */
function coverFor(slug: string): PreviewCover | undefined {
  const image = guideImages[slug];
  if (!image) return undefined;
  const shot = (img: GuideImage) => ({
    src: `${BASE_PATH}img/${img.file}`,
    srcSet: guideImageSrcSet(img, BASE_PATH),
    alt: img.alt,
    width: img.width,
    height: img.height,
  });
  const dark = guideDarkImage(image);
  // The hero scenes exist in both styles and themes: the card shows the one that matches the site's look.
  const styled = guideStyledShots(image);
  return {
    light: shot(image),
    dark: dark && shot(dark),
    styled: styled && {
      liquid: { light: shot(styled.liquid.light), dark: shot(styled.liquid.dark) },
      aurora: { light: shot(styled.aurora.light), dark: shot(styled.aurora.dark) },
    },
  };
}

function GuideCard({ guide, featured = false }: { guide: (typeof guides)[number]; featured?: boolean }) {
  return (
    <div
      className={cn(
        "hubp-card sheen-spot glass-2 docs-flat relative flex w-full min-w-0 flex-col gap-2 rounded-sheen-lg p-5 transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-sheen-focus",
        featured &&
          "md:grid md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] md:items-center md:gap-x-8 md:gap-y-2 md:p-6",
      )}
    >
      <div className={cn(featured && "md:row-span-2")}>
        <HubPreview path={guidePath(guide.slug)} cover={coverFor(guide.slug)} priority={featured} />
      </div>
      <h3
        id={`guide-${guide.slug}`}
        className={cn("text-base font-semibold tracking-tight text-balance", featured && "md:self-end md:text-2xl")}
      >
        {/* The whole card is the target: the link's ::after covers it. */}
        <a
          href={href(guidePath(guide.slug))}
          className="outline-none after:absolute after:inset-0 after:content-[''] hover:text-sheen-accent"
        >
          {guide.title}
        </a>
      </h3>
      <p className={cn("text-sm text-pretty text-sheen-fg-muted", featured && "md:self-start md:text-base")}>
        {guide.description}
      </p>
    </div>
  );
}

export function InstallFrameworksGuidePage() {
  return <GuideArticle slug="install-frameworks" markdown={installFrameworksMarkdown} />;
}

export function GlassmorphismReactTutorialGuidePage() {
  return <GuideArticle slug="glassmorphism-react-tutorial" markdown={glassmorphismReactTutorialMarkdown} />;
}

export function LiquidGlassCssReactGuidePage() {
  return <GuideArticle slug="liquid-glass-css-react" markdown={liquidGlassCssReactMarkdown} />;
}

export function AccessibleGlassmorphismGuidePage() {
  return <GuideArticle slug="accessible-glassmorphism" markdown={accessibleGlassmorphismMarkdown} />;
}

export function GlassmorphismVsLiquidGlassGuidePage() {
  return <GuideArticle slug="glassmorphism-vs-liquid-glass" markdown={glassmorphismVsLiquidGlassMarkdown} />;
}

export function BackdropFilterPerformanceGuidePage() {
  return <GuideArticle slug="backdrop-filter-performance" markdown={backdropFilterPerformanceMarkdown} />;
}

export function AccessibleReactChartsGuidePage() {
  return <GuideArticle slug="accessible-react-charts" markdown={accessibleReactChartsMarkdown} />;
}

export function FramerMotionExamplesGuidePage() {
  return <GuideArticle slug="framer-motion-examples" markdown={framerMotionExamplesMarkdown} />;
}

export function FramerMotionToMotionGuidePage() {
  return <GuideArticle slug="framer-motion-to-motion" markdown={framerMotionToMotionMarkdown} />;
}

export function BaseUiVsRadixGuidePage() {
  return <GuideArticle slug="base-ui-vs-radix" markdown={baseUiVsRadixMarkdown} />;
}

export function BestGlassmorphismReactLibrariesGuidePage() {
  return <GuideArticle slug="best-glassmorphism-react-libraries" markdown={bestGlassmorphismReactLibrariesMarkdown} />;
}

export function ShadcnAlternativesGuidePage() {
  return <GuideArticle slug="shadcn-alternatives" markdown={shadcnAlternativesMarkdown} />;
}

export function ShadcnGlassmorphismGuidePage() {
  return <GuideArticle slug="shadcn-glassmorphism" markdown={shadcnGlassmorphismMarkdown} />;
}

export function GlassmorphismUiPromptGuidePage() {
  return <GuideArticle slug="glassmorphism-ui-prompt" markdown={glassmorphismUiPromptMarkdown} />;
}
