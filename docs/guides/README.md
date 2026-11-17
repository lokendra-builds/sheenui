# SheenUI guides

The Markdown files in this folder are the long-form articles published at `/guides/<slug>` on the docs site, plus the tested install reference ([install-frameworks.md](install-frameworks.md)). The site imports each file as text, renders it inside the docs page template and writes one static HTML page per guide.

**To add a guide:** write `docs/guides/<slug>.md` with the front matter below, then add a row to `guides` in `demo/src/guides.ts`, a route in `demo/src/routes/guides.ts`, an export and `?raw` import in `demo/src/pages/GuidePages.tsx`, and a row in `demo/src/seo/meta/guides.ts`. `pnpm --filter demo seo:check` compares each built page with the file's front matter.

```yaml
---
title: "… | SheenUI"   # 50 to 60 characters with the brand
description: "…"        # 130 to 160 characters
slug: "…"
route: "/guides/…"
targetKeyword: "…"
secondaryKeywords: ["…"]
published: "2026-11-08"
updated: "2026-11-15"   # shown on the page and in the sitemap
relatedRoutes: ["/components/button"]
---
```

Markdown subset: headings, paragraphs, bullet and numbered lists (with nested paragraphs and code), tables, fenced code, inline code, bold, italic and links. No raw HTML, images or block quotes. Links to the site must use `https://lokendra-builds.github.io/sheenui/` paths that exist.
