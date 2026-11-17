import { createContext } from "react";

/**
 * The path of the route being rendered ("/components/button"). `Page` reads it to find the page's row in
 * the keyword map (H1 and intro sentence, meta.ts) and its breadcrumb, so no page repeats its own path.
 */
export const RoutePathContext = createContext<string>("/");
