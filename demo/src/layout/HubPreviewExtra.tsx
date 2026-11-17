import type { CSSProperties } from "react";

import type { PreviewCover, PreviewKind } from "./HubPreview";
import { HUB_COVER_SIZES } from "./hub-cover-sizes";

/** The hub minis of a button group, a border beam, a Liquid Glass lens and a marquee (styles: index.css, .hubp-bgroup and the like). */
export function ExtraMini({ kind }: { kind: PreviewKind }) {
  switch (kind) {
    case "btn-group":
      return (
        <div className="hubp-bgroup">
          <i />
          <i />
          <i />
        </div>
      );
    case "beam":
      return (
        <div className="hubp-beam">
          <b />
          <span />
          <span />
        </div>
      );
    case "lens":
      return (
        <div className="hubp-lens">
          <span />
          <span />
          <span />
          <b />
        </div>
      );
    case "marquee":
      return (
        <div className="hubp-marq">
          {[0, 1].map((row) => (
            <div key={row} className="hubp-marq__row" style={{ "--r": row } as CSSProperties}>
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <i key={i} style={{ "--w": 3 + ((i + row * 2) % 3) } as CSSProperties} />
              ))}
            </div>
          ))}
        </div>
      );
    default:
      return null;
  }
}

/**
 * A guide cover in all four looks: only the picture of the site's style and theme is shown (index.css, data-styled).
 * With `priority` (the first card of the hub, its LCP) the wrapper is marked `data-lcp`: Liquid light (the default look) is eager
 * with high priority in the HTML and the other three stay lazy. The inline script of the prerender (scripts/prerender.mjs,
 * `guideHeroScript`) preloads the saved look's picture and moves eager/high to it when it is another, so the display:none ones
 * are never fetched.
 */
export function StyledCover({
  styled,
  priority = false,
}: {
  styled: NonNullable<PreviewCover["styled"]>;
  priority?: boolean;
}) {
  return (
    <div className="hubp hubp--cover" data-kind="cover" data-styled="" data-lcp={priority ? "" : undefined} aria-hidden>
      {(["liquid", "aurora"] as const).flatMap((style) =>
        (["light", "dark"] as const).map((tone) => {
          const shot = styled[style][tone];
          // The first card's default look (Liquid light) is the hub's LCP: eager with high priority in the HTML itself, matching the
          // media-gated preload in the head. The `<picture>` wrapper stops React hoisting a second, unconditional preload for it (that
          // one would also fetch Liquid light for a saved dark or Aurora look). The inline script of the prerender moves eager/high to
          // the saved look when it is another.
          const first = priority && style === "liquid" && tone === "light";
          const img = (
            <img
              key={`${style}-${tone}`}
              src={shot.src}
              srcSet={shot.srcSet}
              sizes={HUB_COVER_SIZES}
              width={shot.width}
              height={shot.height}
              alt=""
              loading={first ? "eager" : "lazy"}
              fetchPriority={first ? "high" : undefined}
              decoding="async"
              className={`hubp-cover hubp-cover--${style}-${tone}`}
            />
          );
          return first ? (
            <picture key={`${style}-${tone}`} className="contents">
              {img}
            </picture>
          ) : (
            img
          );
        }),
      )}
    </div>
  );
}
