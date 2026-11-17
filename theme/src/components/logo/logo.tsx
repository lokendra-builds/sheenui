"use client";

import { useId, type ComponentProps } from "react";

import { cn } from "../../lib/cn";

/*
 * SheenUI logo: the owner's glossy ribbon "S" and the wide "Sheenui" wordmark with a violet i-dot. This
 * component draws the SMALL mark (the S only: three flat tones, readable at 16 px). The full artwork with the
 * orbit ring and the four-point star is too heavy to inline in every page, so it ships as files in the docs
 * site's brand/ folder (mark.svg, logo-full.png) for large uses.
 *
 * The ribbon colours are fixed brand artwork, not theme tokens: the mark must look the same in light and
 * dark mode and in both styles. The wordmark is drawn with `currentColor` and the i-dot uses the violet
 * token, so both follow the page.
 */
const BRAND = { base: "#4423c4", mid: "#9a62f6", light: "#ecd2fb" } as const;

/* The S outline (viewBox 656 110 388 388). The three flat tones are clipped to it. */
const RIBBON =
  "M911 343C910 343 910 344 909 344C905 346 901 346 898 347C890 350 882 352 874 355C863 360 852 365 840 370C805 382 766 384 731 370C719 364 707 357 698 348C694 345 685 334 683 332C682 332 682 332 681 331C680 332 679 332 678 332C673 336 667 345 664 350C656 362 639 384 634 395C633 397 633 398 632 400C633 401 633 403 633 404C637 413 648 425 655 431C660 435 666 438 671 441C675 444 679 447 684 449C691 452 704 454 712 458C717 459 721 462 725 463C739 469 753 473 768 476C832 492 908 487 964 450C989 434 1012 408 1020 379C1022 369 1021 360 1021 351C1021 342 1031 333 1024 324C1021 319 1012 311 1007 309C1004 307 1000 307 997 306C993 304 989 301 985 298C978 295 972 293 965 291C926 278 886 269 845 260C830 257 799 249 786 241C785 241 784 240 784 239C784 238 784 237 785 236C792 227 817 215 828 210C859 197 892 188 926 187C935 187 945 188 954 190C960 190 966 192 972 192C972 191 973 191 973 190C973 189 973 187 974 186C974 185 975 185 975 184C976 184 976 183 977 183C980 183 983 183 986 183C995 184 1007 185 1011 194C1011 195 1011 196 1011 197C1011 198 1011 198 1010 199C1008 201 1005 201 1003 202C1002 202 1002 203 1001 203C1001 204 1001 205 1002 206C1004 209 1007 211 1009 213C1012 216 1013 220 1016 223C1017 223 1018 223 1019 223C1019 223 1020 222 1020 221C1022 215 1020 199 1018 193C1017 189 1015 186 1013 183C1011 179 1009 174 1006 170C1004 167 1001 164 999 161C986 149 985 149 970 141C965 138 960 135 955 133C951 132 948 134 944 133C938 132 932 130 927 129C864 112 793 122 738 157C714 172 691 191 680 217C663 256 687 283 721 298C751 310 783 313 814 319C827 321 839 324 852 326C864 328 900 335 909 341C910 341 910 342 911 343ZM987 198L1002 206L1003 203L1011 198L1012 193L1003 185L974 183L972 192Z";
const RIBBON_MID =
  "M760 140L745 160L740 190L748 215L765 235L790 247L1100 262L1100 40L760 40Z M600 215L700 205L740 190L748 215L765 235L790 247L770 330L600 330Z M985 300L1100 320L1100 445L1010 445L950 392L930 360Z";
const RIBBON_LIGHT =
  "M600 40L760 40L760 140L745 160L740 190L700 205L600 215Z M790 247L985 300L930 360L905 342L770 330Z M600 330L770 330L905 342L930 360L950 392L900 405L850 430L800 445L760 455L700 452L660 432L600 410Z";

/* The "Sheenui" letters as one filled path (viewBox 400 514 858 133); the i-dot is a circle. */
const WORDMARK =
  "M568.5 516.5H442A35.2 35.2 0 0 0 442 587H535.5A20 20 0 0 1 535.5 627H424L406 645H535.5A38 38 0 0 0 535.5 569H442A17.2 17.2 0 0 1 442 534.5H550.5Z M592 517H612V566C619 559 633 554.3 650 554.3C678 554.3 700 568 700 600V645H681V603C681 582 670 571 648 571C630 571 612 580 612 596V645H592Z M829.2 607V593A57.5 46.5 0 1 0 817.8 629.1L802 619.3A37.5 30.5 0 0 1 735.9 607ZM736.1 593A37.5 30.5 0 1 1 808.9 593Z M959.2 607V593A57.5 46.5 0 1 0 947.8 629.1L932 619.3A37.5 30.5 0 0 1 865.9 607ZM866.1 593A37.5 30.5 0 1 1 938.9 593Z M976 555H995V566C1002 559 1016 555 1033 555C1061 555 1083 568 1083 600V645H1064V603C1064 582 1053 571 1031 571C1013 571 995 580 995 596V645H976Z M1099 555H1118V597C1118 618 1130 633 1152 633C1174 633 1186 618 1186 597V555H1204V600C1204 633 1182 647 1152 647C1122 647 1099 633 1099 600Z M1224.3 555H1243.3V645H1224.3Z";
const WORD_W = 858;
const WORD_H = 133;

/** Props of `SheenMark`: the native `<svg>` props plus its own options, each documented on its field. */
export type SheenMarkProps = Omit<ComponentProps<"svg">, "children"> & {
  /** Sets the width and height in px. Default 32. */
  px?: number;
  /** Accessible name. Default "SheenUI". Pass "" when the mark sits next to visible "Sheenui" text. */
  title?: string;
};

/**
 * The SheenUI logo mark on its own: a glossy ribbon "S", light on top and a deep violet fold below.
 * It stays readable down to 16 px. The same artwork ships as `mark-a2.svg` (the large version with the ring and star is `mark-a1.svg`) in the docs site's `brand/` folder
 * (use that for favicons and images).
 *
 * Brand rules: keep the ribbon's colours (don't recolour it), minimum size 16px, and leave clear space of at
 * least a quarter of the mark's height around it. Use `SheenLogo` when you also want the wordmark.
 *
 * `px` sets width and height in px; `title` is the accessible name. Other `svg` props pass through.
 *
 * Keyboard: none, it is an image. Accessibility: `role="img"` with `aria-label={title}`; pass `title=""` when
 * visible "Sheenui" text sits next to it, and the mark becomes `aria-hidden`. The clip id is unique per
 * instance, so several logos on one page never clash.
 * Glass and motion: static artwork, no backdrop blur and no motion. The ribbon colours are fixed brand colours
 * (not theme tokens), so they look the same in light, dark and both styles.
 *
 * @example
 * ```tsx
 * import { SheenMark } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <>
 *       <SheenMark px={24} />
 *       <SheenMark px={24} title="" />
 *     </>
 *   );
 * }
 * ```
 *
 * @see /foundations
 */
export function SheenMark({ px: size = 32, title = "SheenUI", className, ...props }: SheenMarkProps) {
  // Unique clip id, so several logos on one page never clash. React's ids can
  // contain characters (":", "«", "»") that are awkward inside url(#...), so strip them.
  const id = `sheen${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <svg
      viewBox="656 110 388 388"
      width={size}
      height={size}
      role={title ? "img" : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
      data-slot="logo-mark"
      className={cn("shrink-0", className)}
      {...props}
    >
      <clipPath id={id}>
        <path d={RIBBON} />
      </clipPath>
      <g clipPath={`url(#${id})`}>
        <rect x="600" y="60" width="600" height="480" fill={BRAND.base} />
        <path d={RIBBON_MID} fill={BRAND.mid} />
        <path d={RIBBON_LIGHT} fill={BRAND.light} />
      </g>
    </svg>
  );
}

/** Props of `SheenLogo`; each option is documented on its field. */
export type SheenLogoProps = {
  /** Height of the mark in px; the wordmark scales with it. Default 32. */
  px?: number;
  /** "full" = mark + "Sheenui" wordmark, "mark" = the ribbon S only. Default "full". */
  variant?: "full" | "mark";
  /** Soft violet glow under the mark. Default true. */
  glow?: boolean;
  /** Adds extra classes to the outer element. */
  className?: string;
};

/**
 * The full logo: the ribbon "S" mark plus the wide "Sheenui" wordmark with a violet i-dot. Use
 * `variant="mark"` for the ribbon only (favicon-like spots, tight headers).
 *
 * `px` is the mark's height in px and the wordmark scales with it; `glow` adds a soft violet drop shadow under the mark.
 *
 * Keyboard: none, it is an image (wrap it in a link for a home link, and give the link an accessible name).
 * Accessibility: the full logo is one `role="img"` named "SheenUI"; its wordmark is `aria-hidden`. The wordmark
 * is drawn in the current text colour, so it keeps the contrast of the text around it in light, dark and forced colors.
 * Glass and motion: no backdrop blur and no motion.
 *
 * @example
 * ```tsx
 * import { SheenLogo } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <>
 *       <a href="/"><SheenLogo px={28} /></a>
 *       <SheenLogo variant="mark" px={20} glow={false} />
 *     </>
 *   );
 * }
 * ```
 *
 * @see /foundations
 */
export function SheenLogo({ px: size = 32, variant = "full", glow = true, className }: SheenLogoProps) {
  const mark = (
    <SheenMark
      px={size}
      title={variant === "mark" ? "SheenUI" : ""}
      // Brand-violet glow, mixed from the violet scale so it follows token overrides.
      className={cn(glow && "drop-shadow-[0_4px_12px_color-mix(in_oklch,var(--sheen-violet-600)_35%,transparent)]")}
    />
  );
  if (variant === "mark")
    return (
      <span data-slot="logo" className={cn("inline-flex", className)}>
        {mark}
      </span>
    );

  // The wordmark's capital height is 0.6 of the mark; it is centred on the mark.
  const wordHeight = size * 0.62;
  return (
    <span
      data-slot="logo"
      className={cn("inline-flex items-center", className)}
      style={{ gap: size * 0.22 }}
      aria-label="SheenUI"
      role="img"
    >
      {mark}
      <span aria-hidden className="inline-flex text-sheen-fg">
        <svg
          viewBox={`400 514 ${WORD_W} ${WORD_H}`}
          width={(wordHeight * WORD_W) / WORD_H}
          height={wordHeight}
          focusable="false"
          className="shrink-0"
        >
          <path d={WORDMARK} fill="currentColor" fillRule="evenodd" />
          <circle cx="1234" cy="531" r="15" style={{ fill: "var(--sheen-violet-500)" }} />
        </svg>
      </span>
    </span>
  );
}
