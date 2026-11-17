import { PropsTable } from "../layout/Page";
import * as PROPS from "../generated/component-props";

export function FoundationComponents() {
  return (
    <section className="flex flex-col gap-4">
      <h2 id="foundation-components" className="text-xl font-semibold tracking-tight">
        Foundation components
      </h2>
      <p className="text-sm text-sheen-fg-muted">
        The logo, the animated backdrop and the app-wide motion provider.{" "}
        <code className="font-sheen-mono">SheenBackdrop</code> also pauses its loops off-screen, so you never need to
        manage that yourself.
      </p>
      <PropsTable of={PROPS.SheenLogo} title="SheenLogo props" as="h3" />
      <PropsTable of={PROPS.SheenMark} title="SheenMark props" as="h3" />
      <PropsTable of={PROPS.SheenBackdrop} title="SheenBackdrop props" as="h3" />
      <PropsTable of={PROPS.SheenMotionProvider} title="SheenMotionProvider props" as="h3" />
      <PropsTable of={PROPS.AnimatedList} title="AnimatedList props" as="h3" />
      <PropsTable of={PROPS.AnimatedListItem} title="AnimatedListItem props" as="h3" />
    </section>
  );
}
