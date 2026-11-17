import type { SeoMeta } from "./types";

/** The keyword-map rows of the "Effects" routes (and the pages that sit beside them). */
export const seoEffects: Record<string, SeoMeta> = {
  "/effects/blur-in": {
    title: "Blur Text Animation for React with Motion",
    description:
      "A blur-in text animation for React: words sharpen out of a blur one by one with Motion. Screen readers get the full sentence; reduced motion shows text.",
    keyword: "blur text animation react",
    h1: "Blur-In Text Animation for React",
    intro:
      "A blur text animation for React where words sharpen out of a soft blur one after another: the classic hero-headline reveal.",
    secondary: ["text reveal animation", "framer motion text animation"],
  },
  "/effects/border-beam": {
    title: "Border Beam: Animated Gradient Border for React",
    description:
      "An animated border beam for React: a comet of light runs around any rounded border at one steady speed, rests off-screen, stops for reduced motion. MIT.",
    keyword: "border beam react",
    h1: "Border Beam for React",
    intro:
      "Border beam is an animated gradient border for React: a comet of light that runs around a rounded edge at one steady speed.",
    secondary: ["animated gradient border css", "glowing border animation"],
  },
  "/effects/macos-dock": {
    title: "macOS Dock for React with Magnification",
    description:
      "A macOS-style dock for React: icons swell near the pointer and push neighbors apart, transform-only with no re-renders. A plain bar on touch screens. MIT.",
    keyword: "macos dock react",
    h1: "macOS Dock for React",
    intro:
      "A macOS dock for React with magnification: icons near the pointer swell and push their neighbors apart, with labels riding on top.",
    secondary: ["dock magnification", "floating dock react"],
  },
  "/effects/liquid-glass": {
    title: "Liquid Glass UI for React (iOS 26 Style)",
    description:
      "Apple Liquid Glass for React: real SVG refraction in Chrome and Edge, frosted fallback in Safari and Firefox. Tailwind v4 + Motion. Copy the source.",
    keyword: "liquid glass ui react",
    h1: "Liquid Glass UI for React",
    intro:
      "A Liquid Glass UI effect for React in the style of Apple's iOS 26 design: a lens that refracts the page behind it through an SVG displacement map, with a specular rim.",
    secondary: [
      "liquid glass react component",
      "liquid glass effect react",
      "liquid glass button react",
      "liquid glass tailwind",
    ],
  },
  "/effects/marquee": {
    title: "React Marquee: Infinite Logo & Testimonial Scroll",
    description:
      "A seamless infinite marquee for React logos and testimonials: eases to a stop on hover and focus, has a Pause button, supports RTL and reduced motion. MIT.",
    keyword: "react marquee",
    h1: "React Marquee",
    intro:
      "A React marquee for an endless, seamless strip of logos or testimonials that eases to a stop under the mouse or keyboard focus.",
    secondary: ["infinite scroll logos react", "logo carousel tailwind", "testimonials marquee"],
  },
  "/effects/morphing-dialog": {
    title: "Morphing Dialog for React: Card-to-Modal Motion",
    description:
      "A morphing dialog for React: a card grows into a modal with Motion shared layout animation, on top of Base UI's accessible Dialog. Tailwind CSS v4, MIT.",
    keyword: "morphing dialog react",
    h1: "Morphing Dialog for React",
    intro:
      "A morphing dialog for React where a card grows into a modal: its image, title and surface fly into place with Motion's shared layout animation.",
    secondary: ["shared layout animation", "card to modal animation framer motion"],
  },
  "/effects/number-ticker": {
    title: "Number Ticker: Animated Counter for React",
    description:
      "A number ticker for React: an animated counter whose digits roll like an odometer. Intl formats currency, percent and locales; screen readers hear it once.",
    keyword: "number ticker react",
    h1: "Number Ticker for React",
    intro:
      "A number ticker for React where every digit is a little wheel that rolls to its new value, formatted with Intl.NumberFormat.",
    secondary: ["animated counter react", "odometer animation", "count up react"],
  },
  "/effects/shimmer-text": {
    title: "Shimmer Text Animation for React & CSS",
    description:
      "A shimmer text animation for React: a band of light sweeps across the letters once, on hover or on a loop, with transforms only. Text stays readable.",
    keyword: "shimmer text animation",
    h1: "React Shimmer Text Animation",
    intro:
      "A shimmer text animation for React: a band of light sweeps across the letters while the real text stays whole and selectable.",
    secondary: ["shimmer text react", "text shine effect css"],
  },
  "/effects/spotlight-card": {
    title: "Spotlight Card: Cursor Glow Effect for React",
    description:
      "A React spotlight card: a soft glow follows the pointer across glass, with a rim that catches the light, via CSS variables and no re-renders. Tailwind v4.",
    keyword: "spotlight card react",
    h1: "Spotlight Card for React",
    intro:
      "A spotlight card for React: a glass card lit by a soft glow that follows the pointer, written straight to CSS variables.",
    secondary: ["cursor glow effect", "hover glow card css"],
  },
  "/effects/3d-tilt-card": {
    title: "3D Tilt Card for React with Glare Effect",
    description:
      "A 3D tilt card for React that leans toward the pointer on Motion springs, with a glare sliding across real glass. Still on touch and for reduced motion.",
    keyword: "3d tilt card react",
    h1: "3D Tilt Card for React",
    intro:
      "A 3D tilt card for React that leans toward the pointer, up to 8°, with a glare sliding across its glass surface on springs.",
    secondary: ["tilt effect react", "parallax hover card"],
  },
  "/effects/typewriter": {
    title: "Typewriter Effect for React (Typing Animation)",
    description:
      "A typewriter effect for React that types with a human rhythm, deletes and types the next phrase, reserving space so nothing shifts. Reduced-motion safe.",
    keyword: "typewriter effect react",
    h1: "Typewriter Effect for React",
    intro:
      "A typewriter effect for React that types each phrase with a human rhythm, holds it, deletes it and types the next.",
    secondary: ["typing animation react", "typewriter text tailwind"],
  },
  "/effects/word-rotate": {
    title: "Rotating Text Animation for React (Word Rotate)",
    description:
      "Rotating text for React headlines: each word slides through a clipped slot sized to the longest, so the sentence never reflows. Pauses off-screen. MIT.",
    keyword: "rotating text react",
    h1: "Rotating Text for React",
    intro:
      "A rotating text animation for React: one slot in a sentence cycles through words, each sliding up through a clipped window.",
    secondary: ["word rotate animation", "text loop react", "flip words"],
  },
  "/effects": {
    title: "Animated React Components & Effects with Motion",
    description:
      "Animated React components made with Motion (formerly Framer Motion): Liquid Glass, border beam, dock, number ticker and text effects. Reduced-motion safe.",
    keyword: "animated react components",
    h1: "Animated React Components",
    intro:
      "Animated React components built with Motion, with React animations like Liquid Glass, border beam, dock and text effects.",
    secondary: ["framer motion components", "motion react animations", "react animation effects"],
  },
  "/effects/animated-beam": {
    title: "Animated Beam: Light Along a Path for React",
    description:
      "An animated beam for React: a light travels along an SVG path between two elements, for integration diagrams. Transform only, rests off-screen. MIT.",
    keyword: "animated beam react",
    h1: "Animated Beam for React",
    intro:
      "An animated beam for React that sends a light along a path between two elements, measured from refs, for integration diagrams.",
    secondary: ["integration diagram animation", "svg path animation react"],
  },
  "/effects/particles": {
    title: "Particles Background for React: Canvas Effect",
    description:
      "A particles background for React: a capped canvas field of drifting lights that lean away from the pointer. Pauses off-screen, still for reduced motion.",
    keyword: "particles background react",
    h1: "Particles Background for React",
    intro:
      "A particles background for React: a capped canvas field of small drifting lights that lean softly away from the pointer.",
    secondary: ["react particles canvas", "hero background effect"],
  },
  "/effects/meteors": {
    title: "Meteors Effect for React: Light Streaks on Cards",
    description:
      "A meteors effect for React: occasional streaks of light cross a card background, moved by transform only. Pauses off-screen and stops for reduced motion.",
    keyword: "meteors effect react",
    h1: "Meteors Effect for React",
    intro: "A meteors effect for React where occasional streaks of light cross a card or section background.",
    secondary: ["shooting star animation", "card background animation"],
  },
  "/effects/confetti": {
    title: "Confetti for React: useConfetti Success Burst",
    description:
      "A confetti effect for React: fire a one-shot burst with useConfetti().fire(). Capped canvas, idle at zero cost, a still badge for reduced motion. MIT.",
    keyword: "react confetti",
    h1: "Confetti for React",
    intro:
      "A confetti effect for React: a one-shot burst fired from an event handler with useConfetti, for success moments.",
    secondary: ["confetti animation react", "success celebration effect"],
  },
  "/effects/orbiting-circles": {
    title: "Orbiting Circles for React: Icons on Rings",
    description:
      "Orbiting circles for React: icons or avatars circle a centre on rings with transform only. Holds still on hover and focus, static for reduced motion.",
    keyword: "orbiting circles react",
    h1: "Orbiting Circles for React",
    intro: "Orbiting circles for React: items that circle a centre on rings, for integration and works-with sections.",
    secondary: ["orbit animation react", "integrations section animation"],
  },
  "/effects/text-reveal": {
    title: "Text Reveal on Scroll for React: Word by Word",
    description:
      "A scroll text reveal for React: words light up one by one with scroll progress. Real text, readable without JS, no layout shift, static for reduced motion.",
    keyword: "text reveal scroll react",
    h1: "Scroll Text Reveal for React",
    intro:
      "A scroll text reveal for React where the words of a statement light up one after another as the reader scrolls.",
    secondary: ["scroll linked text animation", "manifesto text effect"],
  },
  "/effects/scroll-progress": {
    title: "Scroll Progress Bar for React: Reading Progress",
    description:
      "A scroll progress bar for React: a thin scaleX bar tied to page or container scroll. Decorative by default, a named progressbar with a label. MIT.",
    keyword: "scroll progress bar react",
    h1: "Scroll Progress Bar for React",
    intro:
      "A scroll progress bar for React: a thin bar that fills with the page or container scroll through a scaleX transform.",
    secondary: ["reading progress bar", "scroll indicator react"],
  },
};
