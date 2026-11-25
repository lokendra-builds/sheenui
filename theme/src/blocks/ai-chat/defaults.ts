import { type AiChatModel, type AiChatRequest, type AiChatLabels } from "./types";

/* ---------- Defaults ---------- */

/** The English strings used when the `labels` prop is omitted (an `AiChatLabels`); the block merges a partial `labels` over them. */
export const defaultAiChatLabels: AiChatLabels = {
  assistant: "Sheen",
  online: "Online",
  thinking: "Thinking",
  writing: "Writing…",
  newChat: "New chat",
  conversation: "Conversation",
  youSaid: "You said:",
  assistantSaid: (assistant) => `${assistant} said:`,
  emptyTitle: "How can I help today?",
  emptyDescription: "Ask a question, paste some code or pick a suggestion to get started.",
  suggestions: "Suggestions",
  message: "Message",
  placeholder: "Ask anything…",
  keyHint: "Enter to send, Shift + Enter for a new line",
  keyHintTouch: "Use the send button to send",
  disclaimer: "AI replies can be wrong. Check anything important.",
  send: "Send message",
  stop: "Stop generating",
  attach: "Attach files",
  attachments: "Attachments",
  removeAttachment: (name) => `Remove ${name}`,
  attached: (names) => (names.length === 1 ? `Attached ${names[0]}` : `Attached ${names.length} files`),
  removed: (name) => `Removed ${name}`,
  tooManyFiles: (max) => `You can attach up to ${max} files`,
  dropFiles: "Drop files to attach",
  model: "Model",
  scrollToBottom: "Scroll to latest message",
  copy: "Copy",
  copied: "Copied",
  copyFailed: "Couldn't copy. Select the text and copy it instead.",
  code: "code",
  codeRegion: (language) => (language ? `Code, ${language}` : "Code"),
  copyCode: "Copy code",
  goodResponse: "Good response",
  badResponse: "Bad response",
  feedbackThanks: "Thanks for the feedback",
  regenerate: "Regenerate",
  stopped: "Stopped",
  stoppedEarly: "Stopped before replying.",
  errorFallback: "Something went wrong while replying.",
  retry: "Try again",
  thinkingAnnouncement: "Thinking",
  replied: (assistant, text) => `${assistant}: ${text}`,
  replyContinues: "The full reply is in the conversation.",
  stoppedAnnouncement: "Reply stopped",
  cleared: "New chat started",
};

/** The sample models of the model picker, used when `models` is not given. */
export const defaultModels: AiChatModel[] = [
  { value: "sheen-pro", label: "Sheen Pro", description: "Best for complex work" },
  { value: "sheen-flash", label: "Sheen Flash", description: "Fast everyday answers" },
  { value: "sheen-mini", label: "Sheen Mini", description: "Light and quick" },
];

/** The sample prompt suggestions of the empty state, used when `suggestions` is not given. */
export const defaultSuggestions = [
  "Explain glassmorphism in two sentences",
  "Write a React hook for dark mode",
  "Give me three tips for accessible motion",
  "Draft a release note for SheenUI 2.0",
];

/* ---------- Demo replies ---------- */

/** The canned replies of the demo responder: the first entry whose pattern matches the prompt wins. */
export const demoReplies: { match: RegExp; reply: string }[] = [
  {
    match: /glass/i,
    reply:
      "**Glassmorphism** layers translucent panels over colourful backgrounds and blurs whatever sits behind them with `backdrop-filter`, so each surface reads as frosted glass. A lit rim, a soft inner glow and a gentle shadow sell the depth.\n\nThe catch is contrast: test text against the **busiest** part of the backdrop, and fall back to a solid surface when someone asks for reduced transparency.",
  },
  {
    match: /hook|dark mode|theme/i,
    reply:
      'Here is a small hook that follows the system setting until someone picks a theme, then remembers the choice:\n\n```tsx\nimport { useEffect, useState } from "react";\n\ntype Theme = "light" | "dark";\n\nexport function useTheme() {\n  const [theme, setTheme] = useState<Theme | null>(\n    () => localStorage.getItem("theme") as Theme | null,\n  );\n\n  useEffect(() => {\n    const root = document.documentElement;\n    if (theme) {\n      root.dataset.theme = theme;\n      localStorage.setItem("theme", theme);\n    } else {\n      delete root.dataset.theme;\n      localStorage.removeItem("theme");\n    }\n  }, [theme]);\n\n  return [theme, setTheme] as const;\n}\n```\n\nPass `null` to follow the OS again. Add `color-scheme: light dark` to `:root` so scrollbars and form controls match.',
  },
  {
    match: /motion|animat|access/i,
    reply:
      "Three habits that keep motion kind:\n\n1. **Respect the setting.** Read `prefers-reduced-motion` and swap movement for a quick fade rather than removing feedback.\n2. **Animate transform and opacity only.** They stay on the compositor, so nothing janks and the layout never shifts.\n3. **Keep exits short.** Things should leave faster than they arrive, and never overshoot on the way out.\n\nBonus: anything that loops should stop by itself within five seconds or offer a pause button.",
  },
  {
    match: /release|changelog|note/i,
    reply:
      "**SheenUI 2.0 is here.** This release adds an AI chat block, a pricing table with rolling prices and a bento grid that shows real components instead of screenshots.\n\n- **New:** `AiChat`, `Pricing` and `FeatureBento` blocks\n- **Faster:** glass surfaces blur for less on low-end devices\n- **Kinder:** every animation honours the in-app reduced motion switch\n\nUpgrade with `pnpm up @sheenui/theme`, then skim the [migration guide](https://github.com/lokendra-builds/sheenui) for the two renamed props.",
  },
];

/** Answers a prompt with a canned reply after a short delay (demo only; it makes no network call). */
export function demoRespond({ prompt, attachments, attempt }: AiChatRequest): Promise<string> {
  const found = demoReplies.find((r) => r.match.test(prompt));
  const files = attachments.length
    ? `I can see ${attachments.length === 1 ? `**${attachments[0]?.name}**` : `${attachments.length} attached files`}, but this demo doesn't read files. `
    : "";
  const short = prompt.length > 60 ? `${prompt.slice(0, 57).trimEnd()}…` : prompt;
  const body =
    found?.reply ??
    `This is a demo, so my replies are canned. Here is what would happen with “${short}” in your app:\n\n- The text goes to the \`respond\` function you pass in, with the history and an abort \`signal\`.\n- Return a string to have it typed out like this, or an async iterable to stream real tokens.\n- **Stop** aborts the signal, so your request is cancelled too.`;
  const again = attempt > 0 ? "Here is another take.\n\n" : "";
  return Promise.resolve(`${files ? `${files}\n\n` : ""}${again}${body}`);
}
