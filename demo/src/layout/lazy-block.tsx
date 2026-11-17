import { Suspense, use, useEffect, useId, useState, type ComponentType } from "react";

import { whenIdle } from "../hydration";

/** The size of an island's server HTML while the page hydrates (0 x 0 on the server, on a client-side visit and when it is not displayed). */
function prerenderedSize(id: string) {
  if (typeof document === "undefined") return { height: 0, width: 0, top: 0 };
  const root = document.querySelector(`[data-island="${CSS.escape(id)}"]`)?.firstElementChild;
  const box = root?.getBoundingClientRect();
  return { height: box ? Math.round(box.height) : 0, width: box ? Math.round(box.width) : 0, top: box ? box.top : 0 };
}

/**
 * Lets the islands that wait for idle time take effect one at a time. Their chunks are fetched together, but when they
 * land at the same moment React retries every suspended boundary in one go and hydrates all of them in a single long
 * task (a page with four tables is one 200 ms task on a phone). Each release waits for an idle period of its own, so
 * every island hydrates in a task of its own and input is served in between.
 */
let releases: Promise<void> = Promise.resolve();
function releaseInTurn(settle: () => void): Promise<void> {
  const mine = releases.then(settle);
  // The retry React schedules once this island's promise resolves runs before the next idle period starts.
  releases = mine.then(() => whenIdle(120));
  return mine;
}

/**
 * Resolves once an eager island's server HTML is within `margin` of the viewport (at once when it is already there, when
 * the browser cannot observe, or when there is no server HTML to watch). An eager island far down a long page (the data
 * table's own page puts its first table five phone screens down) used to hydrate, in one task of 200 ms on a phone, long
 * before anyone could see it; now it does so when the reader gets near. The server HTML stays on screen meanwhile.
 */
function whenNear(id: string, margin = "1200px 0px"): Promise<void> {
  return new Promise((resolve) => {
    const root = document.querySelector(`[data-island="${CSS.escape(id)}"]`)?.firstElementChild;
    if (!root || typeof IntersectionObserver === "undefined") {
      resolve();
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        resolve();
      },
      { rootMargin: margin },
    );
    observer.observe(root);
  });
}

/**
 * Marks an eager island's wrapper `data-island-live` once its block is hydrated (an effect runs only after the boundary's
 * content is live). The block stages wait for this mark before they press anything (ShowcaseStage.block.scene.tsx).
 */
function IslandLive({ id }: { id: string }) {
  useEffect(() => {
    document.querySelector(`[data-island="${CSS.escape(id)}"]`)?.setAttribute("data-island-live", "");
  }, [id]);
  return null;
}

/**
 * A heavy block (a dashboard, a chat app) as a lazily loaded island.
 *
 * The page chunk then holds only the docs around the block; the block's own code (and the charts, Base UI
 * parts and sample data behind it) is a separate chunk. By default the browser fetches it once it is idle,
 * after the page has hydrated. The prerendered HTML already contains the finished block, so it stays on screen
 * at its real size while the code arrives (no layout shift) and becomes interactive when it lands. A visit made
 * by in-app navigation shows an empty placeholder of `minHeight` meanwhile.
 *
 * `eager: true` is for the island the page is about (the dashboard on a dashboard page, the first drawer demo on
 * the side-drawer page, the data table on its page): its chunk is requested the moment the island first renders,
 * which is while the page hydrates, so it is interactive as soon as the page is rather than one idle period later.
 * Keep the other islands of the page idle (`eager` is per island, so a second table lower down still waits).
 * Neither kind is in the initial-JS budget (`pnpm budget` counts the HTML's modulepreloads and their static
 * imports; an island is a dynamic import either way).
 *
 * The island never re-suspends and is not client-rendered under its fallback: the fetch starts while the page hydrates and,
 * once the code is in, the block is read through a fulfilled thenable (`use()` returns it at once). The page's Tabs (Base UI)
 * update their context in ref callbacks right after hydrating; with the code still on its way that update made React give up
 * on the island's server HTML, delete it, show the (shorter) fallback and mount the block again, a layout shift in about one
 * load in ten.
 *
 * Usage: `const WebAnalytics = lazyBlock(() => import("../../../theme/src/blocks/analytics-web").then((m) => m.WebAnalyticsDashboard), { eager: true });`
 * then render `<WebAnalytics … />` with the block's own props. Keep helpers the page needs synchronously
 * (sample-data builders) out of module scope: reach them through the same dynamic import inside event handlers or loaders.
 */
export function lazyBlock<P extends object>(
  load: () => Promise<ComponentType<P>>,
  { minHeight = "36rem", eager = false, hold = false }: { minHeight?: string; eager?: boolean; hold?: boolean } = {},
) {
  // The block's code as a thenable that carries its own `status`/`value` (React's `use()` reads a fulfilled one without
  // suspending, the `seoMetaResource` pattern in seo/head.ts). The fetch starts when the island is first rendered (during
  // the page's hydration render, a step before its boundary is reached), not when a shared module such as
  // demo-dashboards.tsx is evaluated. Once the chunk is in, a boundary that React retries hydrating (see below) renders the
  // block at once, so the server HTML is kept instead of being client-rendered under the fallback.
  // One promise object for the island's whole life: React compares the thenable a retry hands `use()` with the one it
  // suspended on, and a different object (say a fulfilled copy made once the code lands) is an "uncached promise" warning.
  // So the promise itself carries `status`/`value` once settled, which `use()` reads without suspending.
  type Settled = Promise<ComponentType<P>> & { status?: "fulfilled"; value?: ComponentType<P> };
  let pending: Settled | undefined;
  const start = (): Settled => {
    if (pending) return pending;
    const settle = (component: ComponentType<P>) => {
      promise.status = "fulfilled";
      promise.value = component;
    };
    const promise: Settled = (eager ? Promise.resolve() : whenIdle()).then(load).then((component) => {
      if (eager) {
        settle(component);
        return component;
      }
      return releaseInTurn(() => settle(component)).then(() => component);
    });
    pending = promise;
    return promise;
  };
  function Block({ ready, blockProps }: { ready: Promise<ComponentType<P>>; blockProps: P }) {
    const Component = use(ready);
    // eslint-disable-next-line react-hooks/static-components -- the component is the module's own export, resolved once and cached on the island's promise (the same object every render), not a new component per render
    return <Component {...blockProps} />;
  }

  return function LazyBlock(props: P) {
    const holdId = useId();
    // An eager island (a dashboard) sits in a box-less wrapper: while the page hydrates, the height of the finished server
    // HTML is read once (the technique of the home hero, HomePage.tsx) and the fallback holds it, so if React ever does
    // client-render the boundary (a context update from the page's Tabs lands before the code does) nothing below moves.
    // `hold` does the same for a lazy (idle) island that sits in a row of other content, such as the header's Style and theme
    // bar: React client-renders it under the fallback when a context update lands before its code does (a slow phone or a
    // heavy page), and a fallback of another width would push its neighbours sideways. The fallback then also holds the width.
    const [held] = useState(() => (eager || hold ? prerenderedSize(holdId) : { height: 0, width: 0, top: 0 }));
    // The code the island waits for. Normally the one promise of the island type; an eager island whose server HTML is on
    // screen but not near the viewport (`held.height` is 0 for an island that is not displayed) waits to get near first,
    // with a promise of its own (kept for the island's life, so React's retries see the same object).
    const [ready] = useState((): Promise<ComponentType<P>> => {
      if (typeof window === "undefined") return start();
      // An island on or near the first screen (the stage at the top of a page) starts at once.
      if (!eager || hold || !held.height || held.top < window.innerHeight + 1500) return start();
      const own: Settled = whenNear(holdId)
        .then(start)
        .then((component) => {
          own.status = "fulfilled";
          own.value = component;
          return component;
        });
      return own;
    });
    // (an island that is not eager starts its fetch the moment it renders, as before)
    if (typeof window !== "undefined" && !(eager && !hold && held.height && held.top >= window.innerHeight + 1500))
      void start();
    const boundary = (
      <Suspense
        fallback={
          <div
            aria-hidden
            style={{
              minHeight: held.height || minHeight,
              width: held.width || undefined,
              // A held island that was not displayed (the header bar below lg) has no placeholder either.
              display: hold && !eager && !held.width ? "none" : undefined,
            }}
          />
        }
      >
        <Block blockProps={props} ready={ready} />
        {(eager || hold) && <IslandLive id={holdId} />}
      </Suspense>
    );
    return eager || hold ? (
      <div data-island={holdId} style={{ display: "contents" }}>
        {boundary}
      </div>
    ) : (
      boundary
    );
  };
}
