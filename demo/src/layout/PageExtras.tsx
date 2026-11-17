import { routes } from "../routes";
import { contentRow } from "../seo/head";
import { whenHeading } from "../seo/when-heading";
import { useHeadingId } from "./heading-ids";
import { lazyBlock } from "./lazy-block";

// The FAQ accordion is below every demo: its code (the accordion and Motion's component layer) loads as an island once the
// page is idle; the questions and answers are in the prerendered HTML.
const Faq = lazyBlock(() => import("./Faq").then((m) => m.Faq), { minHeight: "20rem" });

/** The page's "When to use it" bullets and FAQ (src/seo/content), below the demos and the props. */
export function PageExtras({ path }: { path: string }) {
  const row = contentRow(path);
  // Headings read the way a person would write them: "When to use the glass card" (src/seo/when-heading.ts names every
  // page as a complete phrase). The keyword phrases live in the text of the bullets, answers and comparison sections
  // (src/seo/content), not in labels.
  const route = routes.find((r) => r.path === path);
  const whenTitle = whenHeading(path, route?.title ?? "");
  const faqTitle = "Frequently asked questions";
  const whenId = useHeadingId(whenTitle);
  const compareId = useHeadingId(row?.compare?.title);
  if (!row) return null;
  return (
    <>
      <section aria-labelledby={whenId} className="flex max-w-4xl flex-col gap-3">
        <h2 id={whenId} className="text-xl font-semibold tracking-tight">
          {whenTitle}
        </h2>
        <ul className="flex list-disc flex-col gap-2 ps-6 text-base leading-relaxed text-pretty marker:text-sheen-fg-muted">
          {row.when.map((item) => (
            <li key={item} className="ps-1">
              {item}
            </li>
          ))}
        </ul>
      </section>
      {row.compare && (
        <section aria-labelledby={compareId} className="flex max-w-4xl flex-col gap-3">
          <h2 id={compareId} className="text-xl font-semibold tracking-tight">
            {row.compare.title}
          </h2>
          <p className="text-base leading-relaxed text-pretty">{row.compare.text}</p>
        </section>
      )}
      <Faq items={row.faq.map(({ q, a }) => ({ q, a }))} title={faqTitle} />
    </>
  );
}
