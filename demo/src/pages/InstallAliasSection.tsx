import type { ReactNode } from "react";

import { ScrollPre } from "../layout/ScrollPre";
import { href } from "../router";

const inlineCode =
  "rounded-sheen-sm bg-sheen-hover px-1.5 py-0.5 font-sheen-mono text-[0.85em] [overflow-wrap:anywhere]";
const pre = "glass-1 overflow-x-auto rounded-sheen-lg p-4 font-sheen-mono text-sm";

function Code({ children }: { children: ReactNode }) {
  return <code className={inlineCode}>{children}</code>;
}

/**
 * The "First, the `@/*` path alias" step of the installation page: the shadcn CLI needs the alias, and a fresh Vite
 * app does not have it (Next.js with `--import-alias "@/*"` does).
 */
export function InstallAliasSection() {
  return (
    <section aria-labelledby="install-alias" className="install-step flex max-w-3xl flex-col gap-3">
      <h2 id="install-alias" className="text-2xl font-semibold tracking-tight">
        First, the <code className="font-sheen-mono">@/*</code> path alias
      </h2>
      <div className="flex max-w-3xl flex-col gap-4 text-base leading-relaxed text-pretty">
        <p>
          The shadcn CLI needs an <Code>@/*</Code> alias that points at your source folder. A Next.js app made with{" "}
          <Code>create-next-app --import-alias &quot;@/*&quot;</Code> has it already. A fresh Vite app does not, and{" "}
          <Code>shadcn init</Code> stops with <Code>Could not find valid path aliases</Code>. In Vite, add the same{" "}
          <Code>paths</Code> entry to <Code>tsconfig.json</Code> and <Code>tsconfig.app.json</Code> (inside{" "}
          <Code>compilerOptions</Code>):
        </p>
      </div>
      <ScrollPre className={pre}>
        <code>{`"paths": { "@/*": ["./src/*"] }`}</code>
      </ScrollPre>
      <div className="flex max-w-3xl flex-col gap-4 text-base leading-relaxed text-pretty">
        <p>
          Do not add <Code>baseUrl</Code>: TypeScript 7 rejects it, and <Code>paths</Code> alone works on TypeScript 5,
          6 and 7. Then give Vite the same alias in <Code>vite.config.ts</Code>, next to the React and Tailwind plugins:
        </p>
      </div>
      <ScrollPre className={pre}>
        <code>{`import { fileURLToPath } from "node:url";\n\nexport default defineConfig({\n  plugins: [react(), tailwindcss()],\n  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },\n});`}</code>
      </ScrollPre>
      <div className="flex max-w-3xl flex-col gap-4 text-base leading-relaxed text-pretty">
        <p>
          Make sure <Code>src/index.css</Code> holds <Code>@import &quot;tailwindcss&quot;;</Code>, then run{" "}
          <Code>npx shadcn@latest init -d</Code>. The{" "}
          <a
            href={href("/guides/install-frameworks")}
            className="font-medium text-sheen-accent underline underline-offset-4 hover:text-sheen-fg"
          >
            install guide
          </a>{" "}
          shows every file in full.
        </p>
      </div>
    </section>
  );
}
