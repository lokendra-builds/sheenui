import { GlassCard } from "@sheenui/theme";

const colors = [
  ["--sheen-bg", "Background"],
  ["--sheen-fg", "Text"],
  ["--sheen-fg-muted", "Muted text"],
  ["--sheen-accent", "Accent"],
  ["--sheen-accent-2", "Accent 2"],
  ["--sheen-accent-soft", "Accent soft"],
  ["--sheen-focus", "Focus"],
  ["--sheen-success", "Success"],
  ["--sheen-danger", "Danger"],
  ["--sheen-warning", "Warning"],
] as const;

export function ApiConventions() {
  return (
    <>
      <section className="flex flex-col gap-4">
        <h2 id="api-conventions" className="text-xl font-semibold tracking-tight">
          API conventions
        </h2>
        <p className="text-sm text-sheen-fg-muted">
          Every component speaks one vocabulary, so a prop you learn on one component works the same on the next. The
          generated props table on each component page shows how it uses these words.
        </p>
        <ul className="flex list-disc flex-col gap-2 ps-5 text-sm text-sheen-fg-muted">
          <li>
            <strong>
              <code className="font-sheen-mono">tone</code>
            </strong>{" "}
            is the semantic colour of a component and comes from one list of six words:{" "}
            <code className="font-sheen-mono">danger</code>, <code className="font-sheen-mono">warning</code>,{" "}
            <code className="font-sheen-mono">success</code>, <code className="font-sheen-mono">info</code>,{" "}
            <code className="font-sheen-mono">neutral</code> and <code className="font-sheen-mono">accent</code>. A
            component accepts the subset it can show. Alert takes danger, warning, success and info. Badge adds{" "}
            <code className="font-sheen-mono">solid</code>, a filled neutral. Spinner and Sparkline add the ink choices{" "}
            <code className="font-sheen-mono">current</code> and <code className="font-sheen-mono">muted</code>.{" "}
            <code className="font-sheen-mono">tone</code> never means a shape or a layout.
          </li>
          <li>
            <strong>
              <code className="font-sheen-mono">variant</code>
            </strong>{" "}
            is the visual form (glass, ghost, outline, plain, card and so on), never a colour.
          </li>
          <li>
            <strong>Content slots.</strong> <code className="font-sheen-mono">leading</code> and{" "}
            <code className="font-sheen-mono">trailing</code> are the content slots of a control: a node placed before
            or after the label of Button, Input, the alert dialog actions and the side drawer header.{" "}
            <code className="font-sheen-mono">icon</code> is the single decorative glyph of an item-like component such
            as Alert, an accordion trigger, a menu item or an empty state, and it is hidden from screen readers. A
            component has one or the other, not both.
          </li>
          <li>
            <strong>
              <code className="font-sheen-mono">emptyState</code>
            </strong>{" "}
            is the node shown when there is nothing to show: every chart and table twin, DataTable, BarList and
            CommandPalette. Boolean state is a flag with a plain name such as{" "}
            <code className="font-sheen-mono">loading</code>, <code className="font-sheen-mono">disabled</code> or{" "}
            <code className="font-sheen-mono">open</code>.
          </li>
          <li>
            <strong>labels.</strong> Every string a component renders or announces lives in one{" "}
            <code className="font-sheen-mono">labels</code> object. Each component exports a default labels constant
            that your app can spread and translate. A chart and its table twin share one labels type, and an accessible
            name that depends on content is still a label key.
          </li>
          <li>
            <strong>
              <code className="font-sheen-mono">headingLevel</code>
            </strong>{" "}
            (1 to 6) is on every component that renders a heading. Blocks and shells default to 2, cards and panels to
            3, and <code className="font-sheen-mono">&quot;none&quot;</code> turns the heading into plain text where the
            component is used inline (<code className="font-sheen-mono">false</code> is the deprecated older spelling).
            The page keeps a correct outline without the component guessing.
          </li>
          <li>
            <strong>
              <code className="font-sheen-mono">size</code>
            </strong>{" "}
            is one scale: <code className="font-sheen-mono">sm</code>, <code className="font-sheen-mono">md</code> and{" "}
            <code className="font-sheen-mono">lg</code>, with <code className="font-sheen-mono">xs</code> and{" "}
            <code className="font-sheen-mono">xl</code> only where the scale needs them. Fields and buttons share the
            control heights 32, 40 and 48 px (coarse pointers lift small and medium to 44 px), so a Button and an Input
            of the same size line up. Pixel dimensions of a drawing are named for what they are, such as{" "}
            <code className="font-sheen-mono">diameter</code> or <code className="font-sheen-mono">px</code>, never{" "}
            <code className="font-sheen-mono">size</code>.
          </li>
          <li>
            <strong>Logical sides.</strong> Anything that places content horizontally uses the words start and end, so
            right-to-left layouts flip on their own: <code className="font-sheen-mono">align</code> takes start, center
            or end, and menus take <code className="font-sheen-mono">inline-start</code> and{" "}
            <code className="font-sheen-mono">inline-end</code> for <code className="font-sheen-mono">side</code>.
            Physical names stay only where the screen edge is meant, such as Toaster{" "}
            <code className="font-sheen-mono">position</code> or the Dock and Drawer{" "}
            <code className="font-sheen-mono">side</code>.
          </li>
          <li>
            <strong>
              <code className="font-sheen-mono">Controlled state</code>
            </strong>{" "}
            comes as <code className="font-sheen-mono">value</code>,{" "}
            <code className="font-sheen-mono">defaultValue</code> and{" "}
            <code className="font-sheen-mono">onValueChange</code> (<code className="font-sheen-mono">open</code>,{" "}
            <code className="font-sheen-mono">defaultOpen</code> and{" "}
            <code className="font-sheen-mono">onOpenChange</code> for overlays). A component warns once in development
            if it switches between controlled and uncontrolled.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 id="color-tokens" className="text-xl font-semibold tracking-tight">
          Color tokens in OKLCH
        </h2>
        <p className="text-sm text-sheen-fg-muted">
          OKLCH colors that switch between light and dark with <code className="font-sheen-mono">light-dark()</code>.
          Toggle the theme in the top bar to see them change.
        </p>
        {/* One glass pane for all swatches (glass budget: ten glass-1 chips here put the page at 13-16 blurred surfaces). */}
        <GlassCard level={2} sheen={false} className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-4">
          {colors.map(([token, name]) => (
            <div
              key={token}
              className="flex items-center gap-3 rounded-sheen-md border border-sheen-border bg-sheen-hover p-3"
            >
              <span
                className="size-9 shrink-0 rounded-sheen-sm border border-sheen-border"
                style={{ background: `var(${token})` }}
              />
              <span className="min-w-0">
                <span className="block text-sm font-medium">{name}</span>
                <span className="block font-sheen-mono text-2xs break-all text-sheen-fg-muted">{token}</span>
              </span>
            </div>
          ))}
        </GlassCard>
      </section>
    </>
  );
}
