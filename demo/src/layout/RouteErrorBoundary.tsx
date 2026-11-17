import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@sheenui/theme";

import { href } from "../router";

type State = { failed: boolean };

/**
 * Catches a routed page that cannot render (a lazy chunk that is gone after a deploy, or a thrown error) and shows a
 * glass message with a Reload button and a link home, instead of a blank page. The shell stays up around it. `resetKey`
 * (the route path) clears it when another page is opened.
 */
export class RouteErrorBoundary extends Component<{ children: ReactNode; resetKey: string }, State> {
  state: State = { failed: false };
  private heading: HTMLHeadingElement | null = null;

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error("[sheenui] page failed to load:", error, info.componentStack);
  }

  componentDidUpdate(prev: { resetKey: string }) {
    // Following another link clears the message (a new route's page gets its own try); a fresh failure takes focus.
    if (prev.resetKey !== this.props.resetKey && this.state.failed) this.setState({ failed: false });
    else this.heading?.focus();
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="mx-auto flex min-h-[60dvh] w-full max-w-xl items-center justify-center px-4 py-16">
        <section
          role="alert"
          aria-labelledby="route-error-title"
          className="glass-2 w-full rounded-sheen-xl p-6 sm:p-8"
        >
          <h1
            id="route-error-title"
            ref={(node) => {
              this.heading = node;
            }}
            tabIndex={-1}
            className="text-xl font-semibold tracking-tight outline-none"
          >
            This page didn&rsquo;t load
          </h1>
          <p className="mt-2 text-sm text-pretty text-sheen-fg-muted">
            The site may have been updated while this tab was open, or the connection dropped. Reload to try again.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button type="button" onClick={() => window.location.reload()}>
              Reload
            </Button>
            {/* eslint-disable-next-line jsx-a11y/anchor-has-content -- Button passes its children into the rendered <a> */}
            <Button variant="glass" render={<a href={href("/")} />}>
              Go to the home page
            </Button>
          </div>
        </section>
      </div>
    );
  }
}
