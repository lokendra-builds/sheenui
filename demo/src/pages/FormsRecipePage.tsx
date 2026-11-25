import { CommandField } from "../layout/CommandField";
import { Faq, type FaqItem } from "../layout/LazyAbout";
import { SITE_URL } from "../seo/site";
import { Page } from "../layout/Page";
import { lazyBlock } from "../layout/lazy-block";
import { whenNear } from "./when-near";
import { href } from "../router";
import { ScrollPre } from "../layout/ScrollPre";

// The two live forms, each inside its Example (code panel included), are islands: react-hook-form, zod, every form
// control and the Example chrome stay out of the page's initial JavaScript. The prerendered HTML holds both finished.
// The first one is the page's subject (its chunk is requested while the page hydrates); the second waits for idle.
const SignUpExample = lazyBlock(() => import("./FormsRecipePage/examples").then((m) => m.SignUpExample), {
  minHeight: "40rem",
  eager: true,
});
// The second form is far below the fold and holds ten more controls: its chunk is fetched when it is about to scroll
// into view (or after 20 s), not at idle. Its prerendered HTML stays on screen at full size meanwhile.
const EVERY_ID = "forms-every-control";
const EveryControlExample = lazyBlock(
  () =>
    whenNear(EVERY_ID)
      .then(() => import("./FormsRecipePage/every-control-example"))
      .then((m) => m.EveryControlExample),
  { minHeight: "46rem" },
);

const faq: FaqItem[] = [
  {
    q: "When do I use register() and when Controller with SheenUI controls?",
    a: "Text inputs use register(): Input forwards ref, onChange, onBlur and name, which is all register() hands out. Select and NumberField (value and onValueChange) and Checkbox (checked and onCheckedChange) are controlled, so they go through Controller and receive field.value, field.onChange, field.onBlur and field.ref. The sign-up example on this page uses both.",
  },
  {
    q: "How do I show a server error on one field?",
    a: 'Call setError with the field name and a message from the submit handler, for example setError("email", { message: "That email is already registered" }). FieldError renders it under the control, linked through aria-describedby and announced as an alert, the same as a zod error. Try an @example.com address in the first form above.',
  },
  {
    q: "Does SheenUI need react-hook-form or zod?",
    a: "No. They are your app's dependencies, not SheenUI's, and the controls also work with plain React state through their value props. The examples were tested with react-hook-form 7.91, zod 4.6 and @hookform/resolvers 7.0.",
  },
  {
    q: "How do I stop a double submit?",
    a: "Pass isSubmitting from react-hook-form to the Button as loading. The button sets aria-busy, ignores clicks while the async submit runs and keeps focus, so a second submit cannot start.",
  },
];

/** The "Forms" recipe page (/docs/forms): react-hook-form + zod with Field, validation and an async submit, then every control. */
/** Every registry item the two form examples import. */
const ITEMS = [
  "alert",
  "button",
  "checkbox",
  "color-picker",
  "combobox",
  "date-picker",
  "field",
  "input",
  "number-field",
  "otp-input",
  "radio-group",
  "rating",
  "segmented",
  "select",
  "slider",
  "switch",
  "tags-input",
];

export function FormsRecipePage() {
  return (
    <Page
      eyebrow="Docs"
      title="Forms with react-hook-form and zod"
      description="How SheenUI inputs plug into a form library: Field wires the label, description and error, zod validates, the submit button shows the async state, and every control forwards ref and onBlur so focus-on-error and touched state just work."
      source={[
        "theme/src/components/alert/alert.tsx",
        "theme/src/components/button/button.tsx",
        "theme/src/components/checkbox/checkbox.tsx",
        "theme/src/components/field/field.tsx",
        "theme/src/components/input/input.tsx",
        "theme/src/components/number-field/number-field.tsx",
        "theme/src/components/select/select.tsx",
      ]}
      keyboard={[
        [
          "Tab",
          "Moves through the fields; after a failed submit focus goes to the first invalid control (react-hook-form calls its ref.focus()).",
        ],
        ["Enter", "Submits from any text field."],
      ]}
      a11y={[
        "Field links each label, description and error to its control (for, aria-describedby, aria-invalid), and the error is announced as an alert when it appears.",
        "Every SheenUI form control forwards ref, onBlur, name and the aria props: ref lets react-hook-form focus the control after a failed validation, onBlur marks it touched.",
        "The submit button shows loading through aria-busy and ignores clicks while it runs, so a second submit cannot start; focus stays on it.",
        "Server errors are put on the field they belong to with setError, so they are announced and linked like client-side errors.",
      ]}
    >
      <section aria-labelledby="forms-install" className="flex max-w-3xl flex-col gap-3">
        <h2 id="forms-install" className="text-xl font-semibold tracking-tight">
          Install
        </h2>
        <p className="text-sm text-pretty text-sheen-fg-muted">
          The form libraries are your app&apos;s dependencies, not SheenUI&apos;s. The examples were tested with
          react-hook-form 7.91, zod 4.6 and @hookform/resolvers 7.0:
        </p>
        <ScrollPre className="overflow-x-auto">{`pnpm add react-hook-form zod @hookform/resolvers`}</ScrollPre>
        <p className="text-sm text-pretty text-sheen-fg-muted">
          The controls come from the registry; every item below installs with{" "}
          <code className="font-sheen-mono text-xs">npx shadcn@latest add</code> and its docs page lists the exact
          files:{" "}
          {[
            ["Field", "/forms/field"],
            ["Input", "/components/input"],
            ["Select", "/components/select"],
            ["Checkbox", "/components/checkbox"],
            ["NumberField", "/forms/number-field"],
            ["Button", "/components/button"],
            ["Alert", "/components/alert"],
          ].map(([label = "", path = ""], i, all) => (
            <span key={path}>
              <a
                href={href(path)}
                className="font-medium text-sheen-accent underline underline-offset-4 hover:text-sheen-fg"
              >
                {label}
              </a>
              {i < all.length - 1 ? ", " : "."}
            </span>
          ))}{" "}
          Each control page has the single-field version of this pattern; the{" "}
          <a
            href={href("/forms/field")}
            className="font-medium text-sheen-accent underline underline-offset-4 hover:text-sheen-fg"
          >
            Field page
          </a>{" "}
          shows it with every control.
        </p>
        <p className="text-sm text-pretty text-sheen-fg-muted">
          The second example (every control) also uses these. One command adds everything both examples import:
        </p>
        <CommandField
          command={`npx shadcn@latest add ${ITEMS.map((n) => `${SITE_URL}/r/${n}.json`).join(" ")}`}
          label="Install command: every control the form examples use"
        />
      </section>
      <SignUpExample />
      <div id={EVERY_ID}>
        <EveryControlExample />
      </div>
      <Faq items={faq} />
    </Page>
  );
}
