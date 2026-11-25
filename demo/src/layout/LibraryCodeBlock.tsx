import { CodeBlock } from "@sheenui/theme";

/** The docs' code samples, rendered with the library's own `CodeBlock` (default export so `lazy()` can load it). */
export default function LibraryCodeBlock({
  code,
  label,
  language,
  maxHeight,
}: {
  code: string;
  label: string;
  language: string;
  maxHeight?: number;
}) {
  return (
    <CodeBlock
      code={code}
      language={language}
      aria-label={label}
      className="[&_pre]:max-sm:pt-10"
      showLineNumbers={false}
      header={false}
      showWrapToggle={false}
      maxHeight={maxHeight ?? "28rem"}
      level={3}
    />
  );
}
