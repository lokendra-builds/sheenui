import type { HeadingLevelOption } from "../../lib/heading";
/* ---------- Types ---------- */

/** Who wrote a message: the person (`"user"`) or the assistant (`"assistant"`). */
export type AiChatRole = "user" | "assistant";

/** "thinking" until the first words arrive, then "streaming", then one of the end states. */
export type AiChatStatus = "thinking" | "streaming" | "done" | "stopped" | "error";

/** A file attached to a message: its name, optional size in bytes, MIME type, preview URL and (for files picked in this session) the `File` itself. */
export type AiChatAttachment = {
  id: string;
  name: string;
  /** Size in bytes. */
  size?: number;
  /** MIME type, e.g. "image/png". */
  type?: string;
  /** Thumbnail URL for images. Object URLs the block creates are revoked when it unmounts. */
  previewUrl?: string;
  /** The picked file (attachments added in this session). */
  file?: File;
};

/** One message of the conversation: author role, light-Markdown `content`, optional attachments and model, and (assistant messages) the reply status and error text. */
export type AiChatMessage = {
  id: string;
  role: AiChatRole;
  /** Light Markdown: **bold**, `code`, ``` fenced blocks ```, - lists, 1. lists, [links](https://…). */
  content: string;
  attachments?: AiChatAttachment[];
  /** Value of the model that wrote an assistant message. */
  model?: string;
  /** Assistant messages only. Left out = "done". */
  status?: AiChatStatus;
  /** Shown when status is "error". */
  error?: string;
};

/** A model the person can pick: the `value` sent with requests, the display `label` and an optional one-line `description`. */
export type AiChatModel = { value: string; label: string; description?: string };

/** What an `AiChatRespond` handler receives: the prompt, attachments, the conversation so far, the chosen model, the regeneration attempt number and an abort signal. */
export type AiChatRequest = {
  prompt: string;
  attachments: AiChatAttachment[];
  /** The conversation so far, oldest first, ending with this prompt. */
  messages: AiChatMessage[];
  model: string;
  /** 0 for a new prompt; 1, 2… each time the reply is regenerated. */
  attempt: number;
  /** Aborted when the person presses Stop, starts a new chat or the block unmounts. */
  signal: AbortSignal;
};

/** Return the whole reply (typed out for you) or an async iterable of chunks (real streaming). */
export type AiChatRespond = (request: AiChatRequest) => string | Promise<string> | AsyncIterable<string>;

/** A thumbs rating on an assistant reply: `"up"`, `"down"`, or `null` when the rating was cleared. */
export type AiChatFeedback = "up" | "down" | null;

/** Every user-facing string, so the block can be translated. */
export type AiChatLabels = {
  /** The assistant's name, shown in the header. */
  assistant: string;
  online: string;
  thinking: string;
  writing: string;
  newChat: string;
  /** Accessible name of the scrolling conversation. */
  conversation: string;
  /** Hidden heading before each of the person's messages. */
  youSaid: string;
  /** Hidden heading before each reply; receives the assistant's name. */
  assistantSaid: (assistant: string) => string;
  emptyTitle: string;
  emptyDescription: string;
  /** Accessible name of the suggestion list. The default is sample content for demos and prototypes: pass your own in production. The default is sample content for demos and prototypes: pass your own in production. */
  suggestions: string;
  /** Label of the message field (visually hidden). */
  message: string;
  placeholder: string;
  /** How to send with a keyboard. */
  keyHint: string;
  /** The same for touch keyboards, where Enter adds a line. */
  keyHintTouch: string;
  /** Small print under the composer. Empty string hides it. */
  disclaimer: string;
  send: string;
  stop: string;
  attach: string;
  /** Accessible name of the pending attachments list. */
  attachments: string;
  removeAttachment: (name: string) => string;
  attached: (names: string[]) => string;
  removed: (name: string) => string;
  /** Shown (and announced) when more files are picked than fit. */
  tooManyFiles: (max: number) => string;
  dropFiles: string;
  model: string;
  scrollToBottom: string;
  copy: string;
  copied: string;
  copyFailed: string;
  /** Header of a code block without a language. */
  code: string;
  /** Accessible name of a code block, also read in place of its code when a reply is announced; receives its language ("" when unknown). */
  codeRegion: (language: string) => string;
  copyCode: string;
  goodResponse: string;
  badResponse: string;
  feedbackThanks: string;
  regenerate: string;
  /** Under a reply that was stopped part way. */
  stopped: string;
  /** In place of a reply stopped before it began. */
  stoppedEarly: string;
  errorFallback: string;
  retry: string;
  /** Live announcements. */
  thinkingAnnouncement: string;
  /** Receives the reply as plain text (code blocks named, not read; long replies cut short). */
  replied: (assistant: string, text: string) => string;
  /** Ends an announcement that was cut short. */
  replyContinues: string;
  stoppedAnnouncement: string;
  cleared: string;
};

/** Props of `AiChat`. Everything is optional: with none it plays canned demo replies. */
export type AiChatProps = {
  /** Produces the reply (`AiChatRespond`). Returns a string (typed out for you), a promise of one, or an async iterable of chunks (real streaming). Defaults to canned demo replies. The default is sample content for demos and prototypes: pass your own in production. The default is sample content for demos and prototypes: pass your own in production. */
  respond?: AiChatRespond;
  /** Conversation to start with (shown without animation). */
  defaultMessages?: AiChatMessage[];
  /**
   * The conversation (controlled). Passing a new array replaces what is shown (load history, switch threads) without
   * animation and stops a reply in progress. Keep it in sync with `onMessagesChange`; leave it out to let the chat own it.
   */
  messages?: AiChatMessage[];
  /** Show the assistant's "thinking" row although no reply is running here, for chats whose replies come from your own backend (controlled `messages`). */
  isTyping?: boolean;
  /** Called with the whole conversation whenever it settles: a reply ends, stops or fails, or the chat is cleared. */
  onMessagesChange?: (messages: AiChatMessage[]) => void;
  /** Called when the person sends a message. */
  onSend?: (message: AiChatMessage) => void;
  /** Called when a reply is rated (null = rating removed). */
  onFeedback?: (message: AiChatMessage, feedback: AiChatFeedback) => void;
  /** Models for the picker; the picker hides with fewer than two. The default is sample content for demos and prototypes: pass your own in production. The default is sample content for demos and prototypes: pass your own in production. */
  models?: AiChatModel[];
  /** Sets the selected model's `value` when controlled. */
  model?: string;
  /** The model selected at first when `model` is not controlled; the first of `models` when omitted. */
  defaultModel?: string;
  /** Called when another model is picked. */
  onModelChange?: (model: string) => void;
  /** Prompts offered as chips while the chat is empty. */
  suggestions?: string[];
  /** Show the attach button and accept dropped files. */
  allowAttachments?: boolean;
  /** `accept` for the file picker, e.g. "image/*,.pdf". */
  accept?: string;
  /** Most files one message can carry. */
  maxAttachments?: number;
  /** Type out string replies word by word (turn it off to show them whole). Streams are never delayed. */
  simulateStreaming?: boolean;
  /** Characters per second for the typed-out reply. */
  typingSpeed?: number;
  /** Shortest "thinking" time (ms) before a string reply starts, so it never flashes. */
  thinkingDelay?: number;
  /** Tallest the message field grows, in lines, before it scrolls. */
  maxRows?: number;
  /** Heading level of the assistant name; message headings are one level below. `"none"` renders them all as paragraphs with no heading role (for an example). */
  headingLevel?: HeadingLevelOption;
  /** Focus the message field on mount. Off by default: only use it when the chat is the page's main task. */
  autoFocus?: boolean;
  /** BCP 47 locale for file sizes. */
  locale?: string;
  /** Overrides for the built-in English strings (`Partial<AiChatLabels>`). */
  labels?: Partial<AiChatLabels>;
  /** Classes for the outer glass panel (set its height here). */
  className?: string;
};
