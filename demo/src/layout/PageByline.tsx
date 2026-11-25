import { pageDates } from "../seo/dates";
import { AUTHOR } from "../seo/site";

const dateText = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { dateStyle: "long", timeZone: "UTC" });

/**
 * The footer line of a docs page: who wrote it and when it was last revised. It shows the same dates and author the page's
 * TechArticle JSON-LD declares (both read `pageDates` in seo/site.ts), so structured data never claims what the page hides.
 * The home page and the hubs have one too (their CollectionPage / WebSite JSON-LD declares the same dates); guides (their own byline) and the 404 page have none.
 */
export function PageByline({ path }: { path: string }) {
  if (path === "/404" || path.startsWith("/guides/")) return null;
  const { published, modified } = pageDates(path);
  return (
    <p className="text-sm text-sheen-fg-muted" data-llms="skip">
      By{" "}
      <a
        href={AUTHOR.url}
        target="_blank"
        rel="author noopener"
        className="font-medium text-sheen-fg underline underline-offset-4 hover:text-sheen-accent"
      >
        {AUTHOR.name}
        <span className="sr-only"> (GitHub, opens in a new tab)</span>
      </a>
      . Published <time dateTime={published}>{dateText(published)}</time>
      {modified !== published && (
        <>
          , updated <time dateTime={modified}>{dateText(modified)}</time>
        </>
      )}
      .
    </p>
  );
}
