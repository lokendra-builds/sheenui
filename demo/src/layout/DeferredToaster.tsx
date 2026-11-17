import { lazy, Suspense, type ComponentProps } from "react";
import type { Toaster } from "@sheenui/theme";

import { whenIdle } from "../hydration";

// The viewport only paints inside a portal once a toast exists, so its code (and Base UI's toast and swipe parts) can
// arrive after hydration instead of sitting in the page's initial JS. It is the same chunk the app's own viewport uses.
const Viewport = lazy(() =>
  (typeof window === "undefined" ? Promise.resolve() : whenIdle()).then(() => import("./LazyToaster")),
);

/** `<Toaster />` loaded as a separate chunk after hydration; same props. Renders nothing until then. */
export function DeferredToaster(props: ComponentProps<typeof Toaster>) {
  return (
    <Suspense fallback={null}>
      <Viewport {...props} />
    </Suspense>
  );
}
