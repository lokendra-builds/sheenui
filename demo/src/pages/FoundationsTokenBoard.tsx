import { spring } from "@sheenui/theme";

/*
 * The token board at the top of /foundations: a static, glanceable sheet of the real `--sheen-*` tokens for the
 * look that is on (colour, glass levels over a backdrop, radius, control heights, type, spring curves). Everything
 * reads a CSS variable, so it re-themes with the style and theme switches. Plain markup and SVG, no state; the page
 * loads it as an island (lazyBlock) so it adds nothing to the initial JS. Styles: Foundations.board.css.
 * The swatch, radius and type demos are marked data-llms="skip" (decorative: the twins and llms files leave them out);
 * the spring names and values are real information and stay, as a list with separators.
 */

const surface = ["--sheen-bg", "--sheen-bg-2", "--sheen-surface-solid", "--sheen-hover", "--sheen-border"] as const;
const accent = ["--sheen-accent", "--sheen-accent-2", "--sheen-accent-soft", "--sheen-focus"] as const;
const tones = ["--sheen-success", "--sheen-warning", "--sheen-danger"] as const;
const chart = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => `--sheen-chart-${n}`);
const spectrum = [1, 2, 3, 4, 5, 6].map((n) => `--sheen-spectrum-${n}`);
const radii = ["sm", "md", "lg", "xl", "full"] as const;
const controls = ["sm", "md", "lg"] as const;
const glass = [
  [1, "Chips, inputs, toggles", "tint and rim"],
  [2, "Cards and popovers", "blur 20px"],
  [3, "Dialogs and nav bars", "blur 32px"],
] as const;

/** Step responses of the four springs (motion's generator, t = 0 to 0.9 s, overshoot visible), as SVG paths in a 120 x 48 box. */
const curves = {
  snappy: "M0 44L6 35.2L12 24.5L18 18.6L24 16.2L30 15.5L36 15.3L48 15.4L120 15.4",
  smooth: "M0 44L6 38.7L12 30.7L18 24.5L24 20.5L30 18.2L36 16.9L48 15.8L60 15.5L120 15.4",
  gentle:
    "M0 44L6 41.9L12 37.5L18 32.4L24 27.7L30 23.7L36 20.7L42 18.5L48 17.1L54 16.1L60 15.5L72 15.1L90 15.2L120 15.4",
  bouncy: "M0 44L6 40.2L12 32.4L18 24.6L24 18.6L30 15L36 13.4L42 13.1L48 13.5L54 14.1L60 14.8L72 15.5L84 15.6L120 15.4",
} as const;

const names = (token: string) => token.replace("--sheen-", "");

function Strip({ tokens, label, list = true }: { tokens: readonly string[]; label: string; list?: boolean }) {
  return (
    <div className="fb-strip">
      <p className="fb-label">
        <strong>{label}</strong>
        {list && <span className="font-sheen-mono">{` ${tokens.map(names).join(" · ")}`}</span>}
      </p>
      <ul className="fb-ramp" aria-hidden>
        {tokens.map((token) => (
          <li key={token} style={{ background: `var(${token})` }} />
        ))}
      </ul>
    </div>
  );
}

/** The token board: glass levels, colour ramps, radius, controls, type and springs for the current look. */
export function TokenBoard() {
  return (
    <section aria-labelledby="token-board" className="fb">
      <div className="fb-head">
        <h2 id="token-board" className="text-xl font-semibold tracking-tight">
          Token board
        </h2>
        <p className="text-sm text-sheen-fg-muted">
          Read live from the <code className="font-sheen-mono">--sheen-*</code> variables of the look you have on.
          Switch style or theme in the top bar and every swatch follows.
        </p>
      </div>

      <div
        data-llms="skip"
        className="fb-glass"
        role="img"
        aria-label="Glass levels 1, 2 and 3 over a colourful backdrop"
      >
        <div className="fb-glass__back" aria-hidden />
        {glass.map(([level, use, note]) => (
          <div key={level} className={`fb-chip glass-${level}`}>
            <code className="fb-chip__name">glass-{level}</code>
            <span className="fb-chip__use">{use}</span>
            <span className="fb-chip__note">{note}</span>
          </div>
        ))}
      </div>

      <div className="fb-grid">
        <div data-llms="skip" className="fb-card fb-card--wide">
          <h3 id="token-colour" className="fb-title">
            Colour
          </h3>
          <div className="fb-colour">
            <Strip tokens={surface} label="Surface" />
            <Strip tokens={accent} label="Accent" />
            <div className="fb-strip">
              <p className="fb-label">Accent fill</p>
              <div className="fb-fill" style={{ background: "var(--sheen-accent-fill)" }} />
            </div>
            <Strip tokens={tones} label="Tone" />
            <Strip tokens={chart} label="Chart, colourblind-safe" list={false} />
            <Strip tokens={spectrum} label="Spectrum" list={false} />
          </div>
        </div>

        <div data-llms="skip" className="fb-card">
          <h3 id="token-radius" className="fb-title">
            Radius
          </h3>
          <ul className="fb-radii">
            {radii.map((r) => (
              <li key={r}>
                <span style={{ borderRadius: `var(--sheen-radius-${r})` }} />
                <code>{r}</code>
              </li>
            ))}
          </ul>
          <h3 id="token-control-height" className="fb-title">
            Control height
          </h3>
          <ul className="fb-controls">
            {controls.map((s) => (
              <li key={s} style={{ height: `var(--sheen-control-h-${s})` }}>
                <code>{s}</code>
              </li>
            ))}
          </ul>
          <h3 id="token-spacing" className="fb-title">
            Spacing
          </h3>
          <ul className="fb-space" aria-label="Spacing scale in 4 px steps">
            {[1, 2, 3, 4, 6, 8].map((n) => (
              <li key={n} style={{ width: `calc(var(--spacing) * ${n * 2})` }}>
                {n * 4}
              </li>
            ))}
          </ul>
        </div>

        <div data-llms="skip" className="fb-card">
          <h3 id="token-type" className="fb-title">
            Type
          </h3>
          <p className="fb-type fb-type--display">Display Aa</p>
          <p className="fb-type fb-type--sans">Sans text, Aa 1234</p>
          <p className="fb-type fb-type--mono">Mono code, Aa 1234</p>
          <div className="fb-scale" aria-label="Type scale">
            {["xs", "sm", "base", "lg", "xl", "2xl"].map((s) => (
              <span key={s} style={{ fontSize: `var(--text-${s})` }}>
                Aa
              </span>
            ))}
          </div>
        </div>

        <div className="fb-card fb-card--wide">
          <h3 id="token-motion-springs" className="fb-title">
            Motion springs
          </h3>
          <ul className="fb-springs">
            {(Object.keys(curves) as (keyof typeof curves)[]).map((name) => {
              const s = spring[name];
              return (
                <li key={name}>
                  <svg viewBox="0 0 120 48" aria-hidden focusable="false">
                    <line x1="0" x2="120" y1="15.4" y2="15.4" className="fb-spring__target" />
                    <path d={curves[name]} className="fb-spring__curve" />
                  </svg>
                  <code>{name}</code>{" "}
                  <span>
                    {s.visualDuration} s, bounce {s.bounce}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
