Canonical: https://lokendra-builds.github.io/sheenui/docs/performance

# React Glass UI Performance: Budgets and Numbers

URL: https://lokendra-builds.github.io/sheenui/docs/performance
Sidebar name: Performance

How SheenUI keeps glass fast: blur and refraction budgets, JavaScript per route, motion gates and reduced motion, with labelled lab numbers and limits.

By Lokendra Singh Rathore. Published November 25, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > Performance

React glass UI performance in SheenUI is a set of enforced budgets: at most 8 blurred surfaces in view, 3 refracting ones, a JavaScript limit per route, loops that pause off-screen and full reduced-motion support, with lab numbers and their limits.

## What is enforced

These are rules the docs site is built against, and a failing check stops a release. A budget that cannot be met says so in the tables below instead of being quietly loosened.

- Blurred surfaces. At most 8 elements with a backdrop-filter are in view at once, checked at every scroll position of key pages in a real browser. Glass nested inside glass draws no blur of its own, and while a dialog is open the page behind it stops blurring.
- Refraction. The [Liquid Glass](https://lokendra-builds.github.io/sheenui/effects/liquid-glass) lens refracts on at most 3 surfaces page-wide; the rest fall back to frosted blur until a slot frees up.
- Motion. Only transform and opacity animate, apart from a short listed set of exceptions. An ancestor of glass never gets an opacity below 1, a filter, a mask or a clip-path, because that flattens the glass inside it.
- Loops sleep. Marquees, beams, ambient backdrops, looping CSS animations and live charts pause when they scroll off-screen and when the tab is hidden, then resume.
- Reduced motion. The OS setting and the in-app switch both calm every loop and pointer effect. Exits are shorter than entrances and never overshoot.
- Interaction. A browser test drives real interactions on a fixed set of routes in both looks and fails on a long task over 50 ms or any layout shift. Scrolling a page from top to bottom may add at most 0.01 of layout shift.
- JavaScript per route. pnpm budget measures the gzip size of the scripts a route needs before it can hydrate, and of everything it fetches in the first seconds after load. A route over its class budget fails the check.

JavaScript budgets per page class, in KB gzip, with the last pnpm budget run (measured on the 25 Nov 2026 build) as minimum, median and maximum

| Page class | Routes | Initial JS budget (KB gzip) | Initial JS measured (min / median / max) | Load + idle budget (KB gzip) | Fetched measured (min / median / max) |
| --- | --- | --- | --- | --- | --- |
| Home | 1 | 135 | 133.0 | 280 | 270.3 |
| Plain docs, foundations and guides | 22 | 190 | 144.0 / 155.8 / 189.0 | 270 (one page at 465) | 232.6 / 251.4 / 374.3 |
| Example, popup or form page | 117 | 210 | 131.8 / 194.2 / 207.7 | 390 (six pages held between 425 and 490) | 231.8 / 280.8 / 475.8 |
| Chart page | 50 | 250 | 132.4 / 228.0 / 244.5 | 360 (the gallery at 470) | 278.2 / 301.1 / 402.1 |

Initial JS is what the browser downloads before the page can hydrate. Lazy parts such as charts and demos load afterwards, so the second pair of columns counts every script requested in the first 5 seconds after load. The floor is the shared docs shell, about 132 KB, plus roughly 100 KB it fetches when idle.

## Lab measurements

Method. Measured 25 Nov 2026 on the deployed site, the production build users get, not a local build (the Data table row is the one exception, described under the table). Machine: a Linux desktop (Ubuntu 24.04, AMD Ryzen 9 9950X, 32 threads, 60 GB RAM; load average 1.1 to 3.7 during the runs, none above 4) running Chromium 159.0.8154.6 (Playwright build, headless), against the deployed site at lokendra-builds.github.io/sheenui, which GitHub Pages serves through its CDN with gzip or brotli compression. Page loads: CPU slowed 4x (Emulation.setCPUThrottlingRate 4) and a slow-4G network (Network.emulateNetworkConditions: 150 ms latency, 1638.4 kbit/s down, 750 kbit/s up) on a 390 by 844 px phone viewport at 3x pixel ratio, a new browser context for every load. Each figure is the median of 5 cold loads. LCP is the last largest-contentful-paint entry. CLS counts layout shifts without recent input up to 5 seconds after the load event. Total Blocking Time is the time over 50 ms of each long task that ends after First Contentful Paint, up to 5 seconds after load. JavaScript bytes are the encoded response sizes of every script, before the load event and by 5 seconds after it. The Lighthouse table is a separate run of Lighthouse 13.6.0, mobile preset with simulated throttling (4x CPU, 150 ms round trip, 1638.4 kbit/s), median of 3, on the site’s default look. This is a laboratory profile run on a desktop machine, not a phone.

Per-route load metrics on the deployed site (the Data table row: a local build): LCP in seconds, CLS, Total Blocking Time and longest task in milliseconds, and JavaScript transferred in KB

| Route | LCP (s) | CLS | TBT (ms) | Longest task, ms median (worst) | JS before load (KB) | JS by load + 5 s (KB) |
| --- | --- | --- | --- | --- | --- | --- |
| Home | 0.98 | 0.0006 | 5 | 64 (85) | 141 | 319 KB |
| Button (component) | 0.86 | 0.0008 | 0 | 59 (77) | 200 | 307 KB |
| Data table (local build) | 1.08 | 0 | 113 | 163 (187) | 212 | 451 KB |
| Line chart | 0.96 | 0 | 0 | 61 (89) | 238 | 345 KB |
| Chart gallery | 1.10 | 0 | 67 | 74 (87) | 228 | 441 KB |
| Chat thread | 1.22 | 0 | 63 | 116 (146) | 213 | 461 KB |
| Guide (backdrop-filter performance) | 0.78 | 0.0001 | 0 | 64 (78) | 166 | 295 KB |
| Web analytics dashboard | 1.45 | 0 | 0 | 132 (180) | 215 | 420 KB |
| SaaS dashboard | 1.22 | 0 | 0 | 124 (144) | 211 | 399 KB |

The Data table row is the exception. It was re-measured on 26 Nov 2026 on a local production build of the current source, served from localhost on the same machine with the same throttling and the same method (median of 5 cold loads, run alone), not on the deployed site. A local build of the source before that fix, measured the same way, gave a median longest task of 194 ms and 144 ms of Total Blocking Time. The row first published for the deployed site (25 Nov 2026) said 83 ms and 33 ms; why a local load shows a longer task than the deployed one is not explained, so do not compare that row with the others.

Lighthouse mobile Performance score and Total Blocking Time per route, median of 3 runs

| Route | Performance score | Total Blocking Time (ms) |
| --- | --- | --- |
| Home | 100 | 9 ms |
| Button (component) | 100 | 10 ms |
| Data table | 99 | 109 ms |
| Line chart | 100 | 4 ms |
| Chart gallery | 100 | 9 ms |
| Chat thread | 100 | 72 ms |
| Guide (backdrop-filter performance) | 94 | 10 ms |
| Web analytics dashboard | 99 | 88 ms |
| SaaS dashboard | 100 | 26 ms |

Interaction latency at 4x CPU: time from the pointer event to the first frame that shows the opened popup, median of 5

| Interaction | Route | Median (ms) | Range (ms) |
| --- | --- | --- | --- |
| Open a dropdown menu | /overlays/dropdown-menu | 91 | 87 to 121 |
| Open a popover | /components/popover | 60 | 59 to 65 |
| Open a dialog | /components/dialog | 51 | 49 to 62 |
| Open the side drawer | /overlays/drawer | 57 | 53 to 70 |

Interactions were measured on a 1440 by 900 px viewport with the 4x CPU slowdown and no network throttling, after the page had loaded and the demo had hydrated. The JavaScript columns are transferred (compressed) sizes including headers, so they differ a little from the gzip figures in the budget table.

Other lab metrics, the target each is held to and whether it was met

| Metric | Target | Measured | Met |
| --- | --- | --- | --- |
| Largest Contentful Paint (4x CPU, slow 4G) | 2.5 s or less | Medians 0.78 to 1.45 s across the 9 routes; the slowest single load was 2.39 s | Yes |
| Lighthouse Largest Contentful Paint, guide page | 2.5 s or less | Median 2.9 s (runs 2.0, 2.9 and 3.1 s), which gives the 94 score; the other 8 routes score 99 or 100 | No |
| Cumulative Layout Shift (load plus 5 s) | 0.05 or less | 0 to 0.0008 in every median; the largest single load was 0.0008 | Yes |
| Interaction latency at 4x CPU | under 200 ms | Medians 51 to 91 ms; the slowest single interaction was 121 ms (dropdown menu) | Yes |
| Longest task while loading (4x CPU, 390 px) | 50 ms or less where achievable | All 9 routes still show a task over 50 ms. The median longest task ranges from 59 to 163 ms; 4 routes (data table, chat thread, SaaS dashboard, web analytics dashboard) are over 100 ms; the worst single load was 187 ms (data table, local build; 180 ms on the deployed site, web analytics dashboard) | No |

## Honest limits

- Long tasks over 50 ms remain on the throttled phone profile: all 9 measured routes still show one, with the median longest task between 59 and 163 ms and the worst single load at 187 ms (the data table, on a local build). The data table, the chat thread and the two dashboards are over 100 ms. They were reduced, not removed.
- Real refraction runs in Chromium only. Safari and Firefox accept the filter but draw nothing, so they get the frosted blur instead.
- There is no field data yet: every number above is a lab run, with one machine and one network profile.
- The guide page scores 94 in Lighthouse, because its simulated Largest Contentful Paint is about 2.9 s, over the 2.5 s target. Lighthouse is a simulation and the machine was not otherwise idle (load average up to 3.7), so treat differences of a few points as noise. The budget table was measured on the 25 Nov 2026 build with pnpm budget, not on the deployed site. Run your own build with pnpm budget and the browser’s own tools before relying on any of this.


## Keep your own page fast with glass

- Count the blur. Keep at most 8 blurred surfaces in view, and 3 of them refracting. Use glass-1 for small controls, since it never blurs, and do not stack glass in glass. The [backdrop-filter performance guide](https://lokendra-builds.github.io/sheenui/guides/backdrop-filter-performance) explains why each surface costs a render pass.
- Offer Lite glass. It lowers the blur radius for slow devices. SheenUI applies it automatically on weak hardware and the visitor can switch it from the preferences bar (see [Foundations](https://lokendra-builds.github.io/sheenui/foundations)).
- Animate transform and opacity only. Do not fade, filter, mask or clip a wrapper that holds glass: animate the glass element itself.
- Let loops sleep. The [Marquee](https://lokendra-builds.github.io/sheenui/effects/marquee), [Particles](https://lokendra-builds.github.io/sheenui/effects/particles) and [Liquid Glass](https://lokendra-builds.github.io/sheenui/effects/liquid-glass) effects already pause off-screen and in hidden tabs; do the same for any loop of your own.
- Import only what you use. Components are copied as source, so a page pays only for the files it imports (see [Installation](https://lokendra-builds.github.io/sheenui/docs/installation)).


## Frequently asked questions

### Is backdrop-filter slow?

Each blurred surface is an extra full-size render pass, so the cost grows with how many are in view at once, not with how many exist. SheenUI holds a page to at most 8 blurred surfaces in view and at most 3 refracting ones, and nested glass draws no blur of its own.

### How do I make glass cheaper on a slow phone?

Turn on Lite glass: set data-glass="lite" on the html element, or call useGlassMode. It cuts the blur radius and calms the backdrop, with the same contrast and layout. SheenUI also turns it on by itself for low memory, few cores, Save-Data or measured dropped frames, unless the visitor chose.

### Does SheenUI work with reduced motion?

Yes. The OS setting and the html data-motion=reduced switch both turn loops into a single quick pass and drop pointer effects, and exits stay shorter than entrances.

### Are these numbers from real visitors?

No. They are lab runs on a simulated slow phone profile, so they show regressions and trade-offs but not what your visitors see. They were measured on one machine on 25 Nov 2026. There is no field data for the demo site yet.


## Related pages

- [backdrop-filter performance](https://lokendra-builds.github.io/sheenui/guides/backdrop-filter-performance)
- [Liquid glass](https://lokendra-builds.github.io/sheenui/effects/liquid-glass)
- [Foundations](https://lokendra-builds.github.io/sheenui/foundations)
- [About SheenUI](https://lokendra-builds.github.io/sheenui/about)
- [Introduction](https://lokendra-builds.github.io/sheenui/)
- [Showcase](https://lokendra-builds.github.io/sheenui/showcase)


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
