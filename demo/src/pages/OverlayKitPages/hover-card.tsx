import { type ReactNode } from "react";
import { Badge } from "@sheenui/theme";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  LinkPreview,
  ProfilePreview,
  createHoverCardHandle,
  type ProfilePreviewProps,
} from "@sheenui/theme";

/* =====================================================================
 * Hover card
 * ===================================================================== */

const CONTRIBUTORS = "https://github.com/lokendra-builds/sheenui/graphs/contributors";

const people: Record<"jonas" | "mira" | "sam" | "ada", ProfilePreviewProps & { href: string }> = {
  jonas: {
    name: "Jonas Weber",
    handle: "jonasweber",
    href: "https://example.com/jonas",
    status: "online",
    badge: <Badge tone="accent">Maintainer</Badge>,
    bio: "Builds SheenUI. Likes glass, springs and contrast ratios above 4.5.",
    stats: [
      { label: "followers", value: 12400 },
      { label: "following", value: 183 },
    ],
    joined: "2019-03-14",
  },
  mira: {
    name: "Mira Okafor",
    handle: "mira.designs",
    href: CONTRIBUTORS,
    status: "away",
    bio: "Design systems at Acme. Reviews every motion curve twice.",
    stats: [
      { label: "followers", value: 3210 },
      { label: "following", value: 412 },
    ],
    joined: "2021-08-02",
  },
  sam: {
    name: "Sam Rivera",
    handle: "samr",
    href: CONTRIBUTORS,
    bio: "Accessibility engineer. Tests with VoiceOver, NVDA and a very old Android.",
    stats: [{ label: "followers", value: 980 }],
    joined: "2022-11-20",
  },
  ada: {
    name: "Ada Chen",
    handle: "adachen",
    href: CONTRIBUTORS,
    status: "offline",
    bio: "Charts and data viz. Thinks every chart needs a table view.",
    stats: [{ label: "followers", value: 1540 }],
    joined: "2020-05-09",
  },
};

export function Mention({ id }: { id: keyof typeof people }) {
  const person = people[id];
  return (
    <HoverCard>
      <HoverCardTrigger href={person.href} target="_blank" rel="noopener">
        @{person.handle}
      </HoverCardTrigger>
      <HoverCardContent>
        <ProfilePreview {...person} />
      </HoverCardContent>
    </HoverCard>
  );
}

/*
 * A local, illustrative social image (an SVG data URI: no network, no third-party artwork) so the
 * link preview shows its image path: fade-in on load, alt text and an image favicon.
 */
const svgUri = (svg: string) => `data:image/svg+xml,${encodeURIComponent(svg)}`;

const springOgImage = svgUri(
  '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="628" viewBox="0 0 1200 628"><defs><linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1c1745"/><stop offset=".55" stop-color="#3a1f73"/><stop offset="1" stop-color="#0d3b5e"/></linearGradient><radialGradient id="g" cx=".8" cy=".2" r=".7"><stop offset="0" stop-color="#b69cff" stop-opacity=".5"/><stop offset="1" stop-color="#b69cff" stop-opacity="0"/></radialGradient><linearGradient id="l" x1="0" x2="1"><stop offset="0" stop-color="#f5b4ff"/><stop offset="1" stop-color="#7eeaff"/></linearGradient></defs><rect width="1200" height="628" fill="url(#b)"/><rect width="1200" height="628" fill="url(#g)"/><path d="M140 190H1060M140 470H1060" stroke="#ffffff" stroke-opacity=".14" stroke-width="2" stroke-dasharray="6 10"/><path d="M140 470L155 436L171 387L186 328L201 267L217 209L232 158L247 119L263 91L278 76L293 73L309 81L324 97L339 118L355 142L370 166L385 189L401 208L416 222L431 232L447 236L462 236L477 232L493 225L508 216L523 206L539 197L554 188L569 181L585 176L600 172L615 171L631 172L646 174L661 177L677 181L692 185L707 188L723 192L738 194L753 196L769 197L784 198L799 197L815 196L830 195L845 193L861 192L876 190L891 189L907 188L922 187L937 187L953 187L968 187L983 188L999 188L1014 189L1029 189L1045 190L1060 191" fill="none" stroke="url(#l)" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><circle cx="186" cy="328" r="16" fill="#ffffff" fill-opacity="0.12"/><circle cx="232" cy="158" r="16" fill="#ffffff" fill-opacity="0.2"/><circle cx="278" cy="76" r="16" fill="#ffffff" fill-opacity="0.3"/><circle cx="324" cy="97" r="16" fill="#ffffff" fill-opacity="0.45"/><circle cx="1060" cy="191" r="22" fill="#ffffff"/><circle cx="1060" cy="191" r="36" fill="none" stroke="#ffffff" stroke-opacity=".35" stroke-width="3"/><text x="140" y="572" fill="#ffffff" fill-opacity=".75" font-family="ui-monospace,SFMono-Regular,Menlo,Consolas,monospace" font-size="30" letter-spacing="1">spring · stiffness 300 · damping 18</text></svg>',
);

const springIcon = svgUri(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="i" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7c5cff"/><stop offset="1" stop-color="#1fb6d9"/></linearGradient></defs><rect width="32" height="32" rx="8" fill="url(#i)"/><path d="M6 21c3 0 4-10 7-10s3 8 6 8 3-4 7-4" fill="none" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round"/></svg>',
);

export const links = {
  baseui: {
    url: "https://base-ui.com/react/components/preview-card",
    siteName: "Base UI",
    title: "Preview Card – Base UI",
    description: "A popup that appears when a link is hovered, showing a preview for sighted users.",
  },
  motion: {
    url: "https://motion.dev",
    siteName: "Motion",
    title: "Motion – A modern animation library for JavaScript and React",
    description:
      "Springs, gestures, layout animations and scroll effects, with a tiny footprint and hardware acceleration.",
    image: springOgImage,
    imageAlt: "A spring curve that overshoots once, then settles on its target.",
    favicon: springIcon,
  },
  tailwind: {
    url: "https://tailwindcss.com",
    siteName: "Tailwind CSS",
    title: "Tailwind CSS – Rapidly build modern websites without ever leaving your HTML",
    description:
      "A utility-first CSS framework packed with classes that can be composed to build any design, directly in your markup.",
  },
} as const;

export function SiteLink({ id, children }: { id: keyof typeof links; children: ReactNode }) {
  const link = links[id];
  return (
    <HoverCard>
      <HoverCardTrigger href={link.url} target="_blank" rel="noopener">
        {children}
      </HoverCardTrigger>
      <HoverCardContent padded={false}>
        <LinkPreview {...link} />
      </HoverCardContent>
    </HoverCard>
  );
}

type Person = (typeof people)[keyof typeof people];

export const teamCard = createHoverCardHandle<Person>();

export const team = [people.jonas, people.mira, people.sam, people.ada];

export const sideOptions = [
  { value: "top", label: "Top" },
  { value: "bottom", label: "Bottom" },
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
] as const;

export const delayOptions = [
  { value: "0", label: "Instant" },
  { value: "500", label: "500 ms" },
  { value: "1000", label: "1 s" },
] as const;

/** The "Placement and delay" sample, with the delay and side picked above. */
export const hoverCardCode: (delay: string, side: string) => string = (delay, side) => {
  const ms = ["0", "500", "1000"].includes(delay) ? delay : "500";
  const edge = ["top", "bottom", "left", "right"].includes(side) ? side : "top";
  return `
import { HoverCard, HoverCardContent, HoverCardTrigger, LinkPreview } from "@sheenui/theme";

export function Example() {
  return (
    <HoverCard>
      <HoverCardTrigger href="https://base-ui.com" target="_blank" rel="noopener" delay={${ms}} closeDelay={250}>
        Base UI
      </HoverCardTrigger>
      <HoverCardContent side="${edge}" align="center" sideOffset={10} padded={false}>
        <LinkPreview url="https://base-ui.com" siteName="Base UI" title="Base UI" description="Unstyled, accessible React components." />
      </HoverCardContent>
    </HoverCard>
  );
}`;
};
