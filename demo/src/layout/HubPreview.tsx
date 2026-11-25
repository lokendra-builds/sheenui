import { useEffect, useId, useRef, type ReactNode } from "react";

import { DashMini } from "./HubPreviewDash";
import { ExtraMini, StyledCover } from "./HubPreviewExtra";
import { HUB_COVER_SIZES } from "./hub-cover-sizes";

/*
 * A small live preview for a hub card: a motion that says what kind of thing the page is about (a chart
 * draws, a switch flips, a toast slides in, a tab pill slides, rows shimmer, a chat types, a layout fills,
 * avatars fan, badges pop, a button lifts and catches light, a card tilts under a spotlight, code types, a
 * number rolls, a word types itself). The kind comes from the page's path (kindFor); a guide card shows its
 * cover instead (`cover`). CSS animation on transform or opacity, in the card's own tokens, only while the card
 * is on screen (useHubLive sets data-live) and never under reduced motion (the finished frame). Decorative:
 * aria-hidden; the only text is the typed sample word of the "type" kind.
 */

export type PreviewKind =
  | "line"
  | "bars"
  | "ring"
  | "toggle"
  | "toast"
  | "tabs"
  | "rows"
  | "chat"
  | "layout"
  | "dash"
  | "dash-web"
  | "dash-saas"
  | "dash-shop"
  | "dash-product"
  | "dash-crypto"
  | "blk-login"
  | "blk-otp"
  | "blk-pay"
  | "blk-stats"
  | "blk-ai"
  | "blk-split"
  | "blk-bento"
  | "blk-chat"
  | "blk-notify"
  | "blk-pricing"
  | "blk-settings"
  | "text"
  | "avatar"
  | "badge"
  | "button"
  | "btn-group"
  | "beam"
  | "lens"
  | "marquee"
  | "card"
  | "code"
  | "count"
  | "type"
  | "glass";

/** A guide cover: the light shot and, when the scene has one, its dark counterpart (swapped by theme in CSS). */
export type PreviewCover = {
  light: { src: string; srcSet?: string; alt: string; width: number; height: number };
  dark?: { src: string; srcSet?: string; alt: string; width: number; height: number };
  /** The same hero scene in each style and theme: the one that matches the site's look is shown (index.css). */
  styled?: Record<"liquid" | "aurora", { light: PreviewCover["light"]; dark: PreviewCover["light"] }>;
};

/* First match wins: the specific names come before the broad families ("menubar" is a menu, not bars). */
const RULES: [RegExp, PreviewKind][] = [
  [/\/blocks\/glass-login/, "blk-login"],
  [/\/blocks\/otp/, "blk-otp"],
  [/\/blocks\/payment/, "blk-pay"],
  [/\/blocks\/dashboard-stats/, "blk-stats"],
  [/\/blocks\/ai-chat/, "blk-ai"],
  [/\/blocks\/auth-split/, "blk-split"],
  [/\/blocks\/bento/, "blk-bento"],
  [/\/blocks\/chat-app/, "blk-chat"],
  [/\/blocks\/notification/, "blk-notify"],
  [/\/blocks\/pricing/, "blk-pricing"],
  [/\/blocks\/settings/, "blk-settings"],
  [/chat|message|conversation/, "chat"],
  [/\/dashboards\/web-analytics/, "dash-web"],
  [/\/dashboards\/saas/, "dash-saas"],
  [/\/dashboards\/ecommerce/, "dash-shop"],
  [/\/dashboards\/product/, "dash-product"],
  [/\/dashboards\/finance/, "dash-crypto"],
  [/\/dashboards\//, "dash"],
  [/\/blocks\//, "layout"],
  [/\/guides\//, "text"],
  [/avatar/, "avatar"],
  [/badge|kbd/, "badge"],
  [/button-group|toggle-group|segmented/, "btn-group"],
  [/border-beam/, "beam"],
  [/liquid-glass/, "lens"],
  [/marquee/, "marquee"],
  [/button/, "button"],
  [/glass-card|spotlight|tilt|border-beam|liquid-glass|aspect-ratio|empty-state/, "card"],
  [/code-block|\/docs\/|foundations/, "code"],
  [/number-ticker/, "count"],
  [/typewriter|word-rotate|shimmer-text|blur-in/, "type"],
  [/menubar|toolbar|sidebar|navigation-menu/, "tabs"],
  [/data-table|\/table|separator/, "rows"],
  [/donut|pie|gauge|radial|meter|progress|spinner|circular/, "ring"],
  [/bar|histogram|column|funnel|waterfall|candlestick|heatmap|treemap|stack/, "bars"],
  [/chart|line|area|sparkline|scatter|sankey|trend|plot|graph|radar/, "line"],
  [
    /switch|toggle|checkbox|radio|slider|rating|field|input|select|combobox|otp|number|color|date|calendar|textarea|tags|upload/,
    "toggle",
  ],
  [/toast|alert|dialog|popover|tooltip|notification|banner|drawer|sheet|modal|hover-card|command/, "toast"],
  [/tabs|nav|menu|breadcrumb|pagination|stepper|segmented|dock|accordion|collapsible/, "tabs"],
  [/list|timeline|tree|skeleton|description|scroll|resizable|carousel|marquee/, "rows"],
];

/** The preview kind for a page path. Unknown pages get the glass shimmer. */
export function kindFor(path: string): PreviewKind {
  for (const [re, kind] of RULES) if (re.test(path)) return kind;
  return "glass";
}

/** The sample the "type" kind types out, one letter per span (plain ASCII, so a split by character is exact). */
const TYPED = "Catch light.".split("");

/** One miniature per block, drawn from that block's real layout (login card, OTP boxes, checkout card + fields, stat tiles + chart, AI thread + composer, split auth, bento tiles, chat sidebar + thread, notification rows, three pricing tiers, settings nav + toggles). */
function BlockMini({ kind }: { kind: PreviewKind }) {
  const accent = "var(--sheen-accent)";
  const ink = "color-mix(in oklab, var(--sheen-fg) 20%, transparent)";
  const faint = "color-mix(in oklab, var(--sheen-fg) 9%, transparent)";
  const edge = "color-mix(in oklab, var(--sheen-fg) 22%, transparent)";
  const tint = (n: number) => `color-mix(in oklab, ${accent} ${n}%, transparent)`;
  const panel = (x: number, y: number, w: number, h: number, r = 5) => (
    <rect x={x} y={y} width={w} height={h} rx={r} fill={faint} stroke={edge} strokeWidth="0.6" />
  );
  const bar = (x: number, y: number, w: number, h = 3, fill = ink) => (
    <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} rx={h / 2} fill={fill} />
  );
  let body: ReactNode;
  switch (kind) {
    case "blk-login":
      body = (
        <>
          {panel(44, 4, 72, 76, 8)}
          <circle cx="80" cy="20" r="7" fill={tint(40)} />
          {bar(62, 32, 36, 3)}
          {panel(54, 40, 52, 8, 3)}
          {panel(54, 52, 52, 8, 3)}
          <rect x="54" y="64" width="52" height="10" rx="5" fill={accent} />
        </>
      );
      break;
    case "blk-otp":
      body = (
        <>
          {bar(52, 10, 56, 4)}
          {bar(62, 18, 36, 2.5)}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect
              key={i}
              x={20 + i * 20}
              y="32"
              width="16"
              height="22"
              rx="5"
              fill={i < 3 ? tint(22) : faint}
              stroke={i === 3 ? accent : edge}
              strokeWidth={i === 3 ? 1.4 : 0.6}
            />
          ))}
          <rect x="52" y="64" width="56" height="12" rx="6" fill={accent} />
        </>
      );
      break;
    case "blk-pay":
      body = (
        <>
          <rect x="10" y="6" width="68" height="42" rx="7" fill={tint(55)} />
          <rect x="17" y="14" width="14" height="10" rx="2.5" fill="color-mix(in oklab, white 55%, transparent)" />
          {bar(17, 36, 44, 3, "color-mix(in oklab, white 55%, transparent)")}
          {panel(10, 54, 68, 8, 3)}
          {panel(10, 66, 32, 8, 3)}
          {panel(46, 66, 32, 8, 3)}
          {panel(88, 6, 62, 68, 6)}
          {[16, 28, 40].map((y) => (
            <g key={y}>
              {bar(94, y, 24)}
              {bar(130, y, 14)}
            </g>
          ))}
          <rect x="94" y="58" width="50" height="10" rx="5" fill={accent} />
        </>
      );
      break;
    case "blk-stats":
      body = (
        <>
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              {panel(6 + i * 38, 4, 34, 24, 4)}
              {bar(10 + i * 38, 9, 14, 2.5)}
              {bar(10 + i * 38, 16, 20, 5, tint(55))}
            </g>
          ))}
          {panel(6, 34, 148, 46, 5)}
          <path d="M12 70 C28 62 34 48 52 52 S80 72 98 56 120 40 148 44 L148 76 L12 76Z" fill={accent} opacity="0.2" />
          <path
            d="M12 70 C28 62 34 48 52 52 S80 72 98 56 120 40 148 44"
            fill="none"
            stroke={accent}
            strokeWidth="2"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </>
      );
      break;
    case "blk-ai":
      body = (
        <>
          <circle cx="14" cy="12" r="6" fill={tint(45)} />
          {bar(26, 8, 70, 3.5)}
          {bar(26, 15, 50, 3.5)}
          <rect x="74" y="26" width="80" height="14" rx="7" fill={tint(40)} />
          {bar(82, 31.5, 56, 3, "color-mix(in oklab, white 60%, transparent)")}
          <circle cx="14" cy="50" r="6" fill={tint(45)} />
          {bar(26, 46, 86, 3.5)}
          {bar(26, 53, 62, 3.5)}
          <rect x="6" y="64" width="148" height="16" rx="8" fill={faint} stroke={edge} strokeWidth="0.6" />
          {bar(14, 71, 60, 3)}
          <circle cx="143" cy="72" r="5.5" fill={accent} />
        </>
      );
      break;
    case "blk-split":
      body = (
        <>
          <rect x="4" y="4" width="70" height="76" rx="7" fill={tint(45)} />
          <circle cx="20" cy="20" r="6" fill="color-mix(in oklab, white 55%, transparent)" />
          {bar(14, 50, 46, 4, "color-mix(in oklab, white 60%, transparent)")}
          {bar(14, 58, 34, 3, "color-mix(in oklab, white 40%, transparent)")}
          {bar(88, 12, 40, 4)}
          {panel(88, 24, 62, 9, 3)}
          {panel(88, 37, 62, 9, 3)}
          <rect x="88" y="52" width="62" height="11" rx="5.5" fill={accent} />
          {bar(98, 70, 42, 2.5)}
        </>
      );
      break;
    case "blk-bento":
      body = (
        <>
          <rect x="4" y="4" width="68" height="46" rx="7" fill={tint(42)} />
          {bar(12, 12, 28, 3.5, "color-mix(in oklab, white 60%, transparent)")}
          <path
            d="M10 44 C24 30 32 40 44 30 S62 26 68 20"
            fill="none"
            stroke="color-mix(in oklab, white 70%, transparent)"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          {panel(78, 4, 36, 22, 6)}
          {panel(118, 4, 38, 22, 6)}
          {panel(78, 30, 78, 20, 6)}
          {bar(86, 38, 36, 3)}
          {panel(4, 54, 36, 26, 6)}
          {panel(44, 54, 56, 26, 6)}
          <circle cx="130" cy="67" r="12" fill={tint(22)} stroke={accent} strokeWidth="1.2" />
          {panel(104, 54, 52, 26, 6)}
          <circle cx="130" cy="67" r="7" fill={tint(40)} />
        </>
      );
      break;
    case "blk-chat":
      body = (
        <>
          {panel(4, 4, 44, 76, 6)}
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              {i === 1 && <rect x="7" y={10 + i * 17 - 2} width="38" height="15" rx="4" fill={tint(22)} />}
              <circle cx="14" cy={16 + i * 17} r="5" fill={i === 1 ? tint(55) : ink} />
              {bar(23, 13 + i * 17, 18, 3)}
              {bar(23, 19 + i * 17, 12, 2.5, faint)}
            </g>
          ))}
          <rect x="56" y="8" width="62" height="12" rx="6" fill={faint} stroke={edge} strokeWidth="0.6" />
          <rect x="82" y="26" width="72" height="12" rx="6" fill={tint(45)} />
          <rect x="56" y="44" width="50" height="12" rx="6" fill={faint} stroke={edge} strokeWidth="0.6" />
          <rect x="56" y="64" width="98" height="14" rx="7" fill={faint} stroke={edge} strokeWidth="0.6" />
          <circle cx="146" cy="71" r="4.5" fill={accent} />
        </>
      );
      break;
    case "blk-notify":
      body = (
        <>
          {bar(6, 6, 34, 4)}
          <rect x="102" y="3" width="52" height="10" rx="5" fill={faint} stroke={edge} strokeWidth="0.6" />
          <rect x="104" y="4.5" width="24" height="7" rx="3.5" fill={tint(40)} />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              {panel(4, 18 + i * 20, 152, 17, 5)}
              <circle cx="16" cy={26.5 + i * 20} r="5" fill={i === 0 ? tint(55) : ink} />
              {bar(26, 22.5 + i * 20, 68, 3)}
              {bar(26, 28.5 + i * 20, 96, 2.5, faint)}
              {i < 2 && <circle cx="146" cy={26.5 + i * 20} r="2.5" fill={accent} />}
            </g>
          ))}
        </>
      );
      break;
    case "blk-pricing":
      body = (
        <>
          {panel(4, 12, 46, 62, 6)}
          {bar(11, 20, 18, 3)}
          {bar(11, 28, 26, 5, ink)}
          {[0, 1, 2].map((i) => bar(11, 42 + i * 7, 32, 2.5, faint))}
          <rect x="11" y="63" width="32" height="7" rx="3.5" fill={faint} stroke={edge} strokeWidth="0.6" />
          <rect x="55" y="4" width="50" height="76" rx="7" fill={tint(20)} stroke={accent} strokeWidth="1.2" />
          <rect x="68" y="9" width="24" height="6" rx="3" fill={accent} />
          {bar(63, 22, 30, 6, tint(70))}
          {[0, 1, 2, 3].map((i) => bar(63, 38 + i * 7, 34, 2.5, ink))}
          <rect x="63" y="68" width="34" height="8" rx="4" fill={accent} />
          {panel(110, 12, 46, 62, 6)}
          {bar(117, 20, 18, 3)}
          {bar(117, 28, 26, 5, ink)}
          {[0, 1, 2].map((i) => bar(117, 42 + i * 7, 32, 2.5, faint))}
          <rect x="117" y="63" width="32" height="7" rx="3.5" fill={faint} stroke={edge} strokeWidth="0.6" />
        </>
      );
      break;
    default:
      body = (
        <>
          {panel(4, 4, 38, 76, 6)}
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              {i === 0 && <rect x="7" y="8" width="32" height="11" rx="3.5" fill={tint(25)} />}
              {bar(12, 12 + i * 14, 22, 3, i === 0 ? accent : ink)}
            </g>
          ))}
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              {panel(50, 6 + i * 19, 104, 16, 4)}
              {bar(57, 11 + i * 19, 40, 3)}
              {bar(57, 16.5 + i * 19, 62, 2, faint)}
              <rect x="130" y={9.5 + i * 19} width="18" height="9" rx="4.5" fill={i % 2 === 0 ? accent : ink} />
              <circle cx={i % 2 === 0 ? 143.5 : 134.5} cy={14 + i * 19} r="3.2" fill="white" opacity="0.9" />
            </g>
          ))}
        </>
      );
  }
  return (
    <svg viewBox="0 0 160 84" preserveAspectRatio="xMidYMid meet" className="hubp-dm">
      {body}
    </svg>
  );
}

function Parts({ kind }: { kind: PreviewKind }): ReactNode {
  const clipId = `hubp-clip-${useId().replace(/[^\w-]/g, "")}`;
  switch (kind) {
    case "line":
      return (
        <svg viewBox="0 0 120 40" preserveAspectRatio="none" className="hubp-line">
          <defs>
            <clipPath id={clipId}>
              <rect className="hubp-draw" x="0" y="-2" width="120" height="44" />
            </clipPath>
          </defs>
          <g clipPath={`url(#${clipId})`}>
            <path
              d="M0 32 C12 30 14 20 26 22 S42 34 54 24 70 8 82 14 100 20 120 6 L120 40 L0 40Z"
              fill="var(--sheen-accent)"
              opacity="0.16"
            />
            <path
              d="M0 32 C12 30 14 20 26 22 S42 34 54 24 70 8 82 14 100 20 120 6"
              fill="none"
              stroke="var(--sheen-accent)"
              strokeWidth="2"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        </svg>
      );
    case "bars":
      return (
        <div className="hubp-bars">
          {[0.5, 0.8, 0.6, 1, 0.7, 0.9, 0.55].map((h, i) => (
            <i key={i} style={{ "--h": h, "--i": i } as React.CSSProperties} />
          ))}
        </div>
      );
    case "ring":
      return (
        <div className="hubp-ring">
          <i />
          <b />
        </div>
      );
    case "toggle":
      return (
        <div className="hubp-toggle">
          <i />
          <i />
        </div>
      );
    case "toast":
      return (
        <div className="hubp-toast">
          <b />
          <span />
        </div>
      );
    case "tabs":
      return (
        <div className="hubp-tabs">
          <i className="hubp-tabs__pill" />
          <span />
          <span />
          <span />
        </div>
      );
    case "rows":
      return (
        <div className="hubp-rows">
          {[0, 1, 2].map((i) => (
            <i key={i} style={{ "--i": i } as React.CSSProperties} />
          ))}
        </div>
      );
    case "chat":
      return (
        <div className="hubp-chat">
          <i />
          <i />
          <b>
            <u />
            <u />
            <u />
          </b>
        </div>
      );
    case "layout":
      return (
        <div className="hubp-layout">
          {[0, 1, 2, 3].map((i) => (
            <i key={i} style={{ "--i": i } as React.CSSProperties} />
          ))}
        </div>
      );
    case "dash":
      return (
        <div className="hubp-dash">
          {[0, 1, 2].map((i) => (
            <i key={i} style={{ "--i": i } as React.CSSProperties} />
          ))}
          <svg viewBox="0 0 120 20" preserveAspectRatio="none">
            <rect className="hubp-draw" x="0" y="0" width="120" height="20" fill="none" />
            <path
              d="M0 16 C20 14 24 6 40 9 S70 18 84 8 104 4 120 2"
              fill="none"
              stroke="var(--sheen-accent)"
              strokeWidth="2"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              className="hubp-dashline"
            />
          </svg>
        </div>
      );
    case "dash-web":
    case "dash-saas":
    case "dash-shop":
    case "dash-product":
    case "dash-crypto":
      return <DashMini kind={kind} clipId={clipId} />;
    case "blk-login":
    case "blk-otp":
    case "blk-pay":
    case "blk-stats":
    case "blk-ai":
    case "blk-split":
    case "blk-bento":
    case "blk-chat":
    case "blk-notify":
    case "blk-pricing":
    case "blk-settings":
      return <BlockMini kind={kind} />;
    case "text":
      return (
        <div className="hubp-text">
          {[0, 1, 2, 3].map((i) => (
            <i key={i} style={{ "--i": i } as React.CSSProperties} />
          ))}
        </div>
      );
    case "avatar":
      return (
        <div className="hubp-avatars">
          {[0, 1, 2].map((i) => (
            <i key={i} style={{ "--i": i } as React.CSSProperties} />
          ))}
        </div>
      );
    case "badge":
      return (
        <div className="hubp-badges">
          {[0, 1, 2].map((i) => (
            <i key={i} style={{ "--i": i } as React.CSSProperties} />
          ))}
        </div>
      );
    case "button":
      return (
        <div className="hubp-button">
          <b>
            <i />
            <span />
          </b>
          <u />
        </div>
      );
    case "btn-group":
    case "beam":
    case "lens":
    case "marquee":
      return <ExtraMini kind={kind} />;
    case "card":
      return (
        <div className="hubp-cardx">
          <b>
            <i />
            <span />
            <span />
          </b>
        </div>
      );
    case "code":
      return (
        <div className="hubp-code">
          {[0, 1, 2].map((i) => (
            <i key={i} style={{ "--i": i } as React.CSSProperties} />
          ))}
          <u />
        </div>
      );
    case "count":
      return (
        <div className="hubp-count">
          {[4, 8, 2].map((n, i) => (
            <span key={i} style={{ "--n": n, "--i": i } as React.CSSProperties}>
              <i>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
                  <b key={d} data-d={d} />
                ))}
              </i>
            </span>
          ))}
        </div>
      );
    case "type":
      return (
        <div className="hubp-type">
          {TYPED.map((ch, i) => (
            // The letter is drawn by CSS (data-d), so the animation adds no spaced-out letters ("C a t c h") to the page text.
            <b key={i} data-d={ch === " " ? "\u00a0" : ch} style={{ "--i": i } as React.CSSProperties} />
          ))}
          <i />
        </div>
      );
    default:
      return (
        <div className="hubp-glass">
          <i />
          <i />
        </div>
      );
  }
}

/**
 * The preview itself. Place it at the top of a card. With `cover` (a guide's hero shot) the box is a 16:9 picture
 * that drifts slowly while the card is live; the dark shot, when there is one, is shown on dark pages (index.css).
 * `priority` marks the cover as the LCP of the page (the first card of a hub): see StyledCover.
 */
export function HubPreview({
  path,
  cover,
  priority = false,
}: {
  path: string;
  cover?: PreviewCover;
  priority?: boolean;
}) {
  if (cover) {
    const img = (shot: NonNullable<PreviewCover["light"]>, tone: "light" | "dark") => (
      <img
        src={shot.src}
        srcSet={shot.srcSet}
        sizes={HUB_COVER_SIZES}
        width={shot.width}
        height={shot.height}
        alt=""
        // The cover that is the page's largest picture (`priority`, the first card) is the LCP: it loads first.
        loading={priority && tone === "light" ? "eager" : "lazy"}
        fetchPriority={priority && tone === "light" ? "high" : undefined}
        decoding="async"
        className={`hubp-cover hubp-cover--${tone}`}
      />
    );
    if (cover.styled) return <StyledCover styled={cover.styled} priority={priority} />;
    return (
      <div className="hubp hubp--cover" data-kind="cover" data-dual={cover.dark ? "" : undefined} aria-hidden>
        {img(cover.light, "light")}
        {cover.dark && img(cover.dark, "dark")}
      </div>
    );
  }
  return (
    <div className="hubp" data-kind={kindFor(path)} aria-hidden>
      <Parts kind={kindFor(path)} />
    </div>
  );
}

/** One observer for a list of cards: `data-live` while on screen; `data-settled` after 5 s (WCAG 2.2.2, loop freezes; hover/focus replays). */
export function useHubLive() {
  const ref = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const list = ref.current;
    if (!list || typeof IntersectionObserver === "undefined") return;
    const timers = new Map<Element, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const card = e.target;
          window.clearTimeout(timers.get(card));
          card.toggleAttribute("data-live", e.isIntersecting);
          card.removeAttribute("data-settled");
          if (e.isIntersecting)
            timers.set(
              card,
              window.setTimeout(() => card.setAttribute("data-settled", ""), 5000),
            );
        }
      },
      { rootMargin: "60px" },
    );
    list.querySelectorAll(".hubp-card").forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);
  return ref;
}
