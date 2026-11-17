import { useState } from "react";

import { useScrollFade } from "./use-scroll-fade";

/**
 * A one-line shell command: a scrollable code field with an end fade and a Copy button, the same terminal row as the home
 * page's call to action (the `home-cta__*` rules in index.css). The command never wraps and is never cut without a hint.
 */
export function CommandField({ command, label = "Install command" }: { command: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const field = useScrollFade<HTMLElement>();
  const copy = () => {
    void navigator.clipboard.writeText(command).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      },
      () => undefined,
    );
  };
  return (
    <div className="home-cta__term">
      <span className="home-cta__prompt" aria-hidden>
        $
      </span>
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrollable region must be keyboard-reachable */}
      <code ref={field} className="home-cta__cmd" tabIndex={0} role="region" aria-label={label}>
        {command}
      </code>
      <button type="button" className="home-cta__copy-btn" onClick={copy} aria-live="polite">
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
