import{r as e}from"./toast-PePh6sao.js";import{t}from"./lazy-block-BfzH_8EP.js";import{t as n}from"./vendor-react-D30i__oY.js";import{t as r}from"./BlockStages.pricing-DDGok9zK.js";import{i,n as a,o,r as s}from"./Page-BAL5Idhy.js";import{t as c}from"./Example-BPfHvEYD.js";import{t as l}from"./preload-helper-BrmCrVM7.js";var u=[[`respond`,`AiChatRespond`,`demoRespond`,"Produces the reply (`AiChatRespond`). Returns a string (typed out for you), a promise of one, or an async iterable of chunks (real streaming). Defaults to canned demo replies. The default is sample content for demos and prototypes: pass your own in production.",!1],[`defaultMessages`,`AiChatMessage[]`,`[]`,`Conversation to start with (shown without animation).`,!1],[`messages`,`AiChatMessage[]`,``,"The conversation (controlled). Passing a new array replaces what is shown (load history, switch threads) without animation and stops a reply in progress. Keep it in sync with `onMessagesChange`; leave it out to let the chat own it.",!1],[`isTyping`,`boolean`,`false`,'Show the assistant\'s "thinking" row although no reply is running here, for chats whose replies come from your own backend (controlled `messages`).',!1],[`onMessagesChange`,`((messages: AiChatMessage[]) => void)`,``,`Called with the whole conversation whenever it settles: a reply ends, stops or fails, or the chat is cleared.`,!1],[`onSend`,`((message: AiChatMessage) => void)`,``,`Called when the person sends a message.`,!1],[`onFeedback`,`((message: AiChatMessage, feedback: AiChatFeedback) => void)`,``,`Called when a reply is rated (null = rating removed).`,!1],[`models`,`AiChatModel[]`,`defaultModels`,`Models for the picker; the picker hides with fewer than two. The default is sample content for demos and prototypes: pass your own in production.`,!1],[`model`,`string`,``,"Sets the selected model's `value` when controlled.",!1],[`defaultModel`,`string`,``,"The model selected at first when `model` is not controlled; the first of `models` when omitted.",!1],[`onModelChange`,`((model: string) => void)`,``,`Called when another model is picked.`,!1],[`suggestions`,`string[]`,`defaultSuggestions`,`Prompts offered as chips while the chat is empty.`,!1],[`allowAttachments`,`boolean`,`true`,`Show the attach button and accept dropped files.`,!1],[`accept`,`string`,``,'`accept` for the file picker, e.g. "image/*,.pdf".',!1],[`maxAttachments`,`number`,`4`,`Most files one message can carry.`,!1],[`simulateStreaming`,`boolean`,`true`,`Type out string replies word by word (turn it off to show them whole). Streams are never delayed.`,!1],[`typingSpeed`,`number`,`160`,`Characters per second for the typed-out reply.`,!1],[`thinkingDelay`,`number`,`900`,`Shortest "thinking" time (ms) before a string reply starts, so it never flashes.`,!1],[`maxRows`,`number`,`8`,`Tallest the message field grows, in lines, before it scrolls.`,!1],[`headingLevel`,`HeadingLevelOption`,`2`,'Heading level of the assistant name; message headings are one level below. `"none"` renders them all as paragraphs with no heading role (for an example).',!1],[`autoFocus`,`boolean`,`false`,`Focus the message field on mount. Off by default: only use it when the chat is the page's main task.`,!1],[`locale`,`string`,`"en-US"`,`BCP 47 locale for file sizes.`,!1],[`labels`,`Partial<AiChatLabels>`,`defaultAiChatLabels`,'Every other string, for translation: `labels={{ assistant: "…" }}`; omitted keys keep the English of `defaultAiChatLabels`. All 46 keys of `AiChatLabels` are listed in the key table under the props table.',!1,{type:`AiChatLabels`,const:`defaultAiChatLabels`,keys:[[`assistant`,`Sheen`],[`online`,`Online`],[`thinking`,`Thinking`],[`writing`,`Writing…`],[`newChat`,`New chat`],[`conversation`,`Conversation`],[`youSaid`,`You said:`],[`assistantSaid`,"(assistant) => `${assistant} said:`"],[`emptyTitle`,`How can I help today?`],[`emptyDescription`,`Ask a question, paste some code or pick a suggestion to get started.`],[`suggestions`,`Suggestions`],[`message`,`Message`],[`placeholder`,`Ask anything…`],[`keyHint`,`Enter to send, Shift + Enter for a new line`],[`keyHintTouch`,`Use the send button to send`],[`disclaimer`,`AI replies can be wrong. Check anything important.`],[`send`,`Send message`],[`stop`,`Stop generating`],[`attach`,`Attach files`],[`attachments`,`Attachments`],[`removeAttachment`,"(name) => `Remove ${name}`"],[`attached`,"(names) => (names.length === 1 ? `Attached ${names[0]}` : `Attached ${names.length} files`)"],[`removed`,"(name) => `Removed ${name}`"],[`tooManyFiles`,"(max) => `You can attach up to ${max} files`"],[`dropFiles`,`Drop files to attach`],[`model`,`Model`],[`scrollToBottom`,`Scroll to latest message`],[`copy`,`Copy`],[`copied`,`Copied`],[`copyFailed`,`Couldn't copy. Select the text and copy it instead.`],[`code`,`code`],[`codeRegion`,'(language) => (language ? `Code, ${language}` : "Code")'],[`copyCode`,`Copy code`],[`goodResponse`,`Good response`],[`badResponse`,`Bad response`],[`feedbackThanks`,`Thanks for the feedback`],[`regenerate`,`Regenerate`],[`stopped`,`Stopped`],[`stoppedEarly`,`Stopped before replying.`],[`errorFallback`,`Something went wrong while replying.`],[`retry`,`Try again`],[`thinkingAnnouncement`,`Thinking`],[`replied`,"(assistant, text) => `${assistant}: ${text}`"],[`replyContinues`,`The full reply is in the conversation.`],[`stoppedAnnouncement`,`Reply stopped`],[`cleared`,`New chat started`]]}],[`className`,`string`,``,`Classes for the outer glass panel (set its height here).`,!1]],d=n(),f=t(()=>l(()=>import(`./ai-chat-fiI76Ax9.js`).then(e=>e.AiChat),[]),{minHeight:`32rem`,eager:!0});t(()=>l(()=>import(`./BentoGridPageBody-BVHWklVB.js`).then(e=>e.BentoGridPage),[]),{eager:!0,minHeight:`80vh`});var p=[{id:`h1`,role:`user`,content:`How do I debounce a search field in React?`},{id:`h2`,role:`assistant`,model:`nova-large`,content:`Keep the input instant and debounce the **value** you search with:

\`\`\`tsx
function useDebounced<T>(value: T, ms = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return debounced;
}
\`\`\`

Then fetch with \`useDebounced(query)\` instead of \`query\`.`}],m="Good question. With `AbortController` you can cancel the stale request too:\n\n1. Create a controller in the effect.\n2. Pass `controller.signal` to `fetch`.\n3. Call `controller.abort()` in the cleanup.\n\nNow a fast typist never sees results for an old query arrive **after** the new ones.";async function*h({signal:e}){await new Promise(e=>setTimeout(e,700));let t=m.split(/(?<=\s)/);for(let n=0;n<t.length&&!e.aborted;n+=2)yield t.slice(n,n+2).join(``),await new Promise(e=>setTimeout(e,40+Math.random()*50))}async function g({attempt:e,signal:t}){if(await new Promise(e=>setTimeout(e,600)),t.aborted)return``;if(e===0)throw Error(`The model is busy right now (429). Try again in a moment.`);return"Back online. Errors keep whatever text already arrived, show the message from your `Error`, and offer **Try again**, which calls `respond` again with `attempt` set to 1."}function _(){let t=e();return(0,d.jsxs)(a,{eyebrow:`Block`,title:`AI chat`,description:`An assistant panel: user and assistant messages, a reply that streams in word by word, a “thinking” shimmer, light Markdown with code blocks, attachments, a model picker, stop and regenerate, suggestion chips and a scroll-to-latest button. Screen readers hear one clean announcement per reply instead of every streamed word.`,source:`theme/src/blocks/ai-chat.tsx`,children:[(0,d.jsx)(r,{}),(0,d.jsx)(c,{title:`Assistant`,description:`Pick a suggestion or type a message. Press Stop (or Escape) while it writes, regenerate the last reply, attach or drop a file, and scroll up mid-reply to see the jump button.`,stageClassName:`p-3 sm:p-8`,code:`
import { AiChat } from "@sheenui/theme";

// Your analytics call
function track(event: string, properties: Record<string, unknown>) {
  void fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, properties }),
  });
}

export function Example() {
  return (
    <AiChat
      respond={async ({ messages, model, signal }) => {
        const res = await fetch("/api/chat", {
          method: "POST",
          body: JSON.stringify({ model, messages }),
          signal, // Stop aborts the request
        });
        return res.text(); // a string is typed out word by word
      }}
      onFeedback={(message, rating) => track("feedback", { id: message.id, rating })}
    />
  );
}`,children:(0,d.jsx)(f,{headingLevel:`none`,onFeedback:(e,n)=>n&&t.success(n===`up`?`Marked as helpful`:`Thanks, we'll do better`)})}),(0,d.jsx)(c,{title:`Real streaming and history`,description:`Return an async iterable to stream tokens as they arrive. This one continues an earlier conversation, uses its own assistant name and models, and turns attachments off.`,stageClassName:`p-3 sm:p-8`,code:`
import { AiChat, type AiChatMessage } from "@sheenui/theme";

// An earlier conversation, e.g. loaded from your database
const savedMessages: AiChatMessage[] = [
  { id: "h1", role: "user", content: "How do I debounce a search field in React?" },
  {
    id: "h2",
    role: "assistant",
    model: "nova-large",
    content: "Keep the input instant and debounce the **value** you search with, then fetch with the debounced value instead of the raw one.",
  },
];

export function Example() {
  return (
    <AiChat
      defaultMessages={savedMessages}
      models={[
        { value: "nova-large", label: "Nova Large", description: "Most capable" },
        { value: "nova-small", label: "Nova Small", description: "Fastest" },
      ]}
      allowAttachments={false}
      labels={{ assistant: "Nova", placeholder: "Ask Nova…" }}
      respond={async function* ({ messages, model, signal }) {
        const res = await fetch("/api/chat/stream", { method: "POST", body: JSON.stringify({ model, messages }), signal });
        const reader = res.body!.pipeThrough(new TextDecoderStream()).getReader();
        for (;;) {
          const { value, done } = await reader.read();
          if (done) return;
          yield value; // each chunk is appended as it arrives
        }
      }}
    />
  );
}`,children:(0,d.jsx)(f,{headingLevel:`none`,defaultMessages:p,models:[{value:`nova-large`,label:`Nova Large`,description:`Most capable`},{value:`nova-small`,label:`Nova Small`,description:`Fastest`}],allowAttachments:!1,labels:{assistant:`Nova`,placeholder:`Ask Nova…`},respond:h,className:`h-[34rem]`})}),(0,d.jsx)(c,{title:`Errors and retry`,description:`Throw from respond to show an error under the reply. This one fails the first time and works on Try again. Give each chat on a page its own assistant name: it names the chat for screen readers.`,stageClassName:`p-3 sm:p-8`,code:`
import { AiChat } from "@sheenui/theme";

<AiChat
  labels={{ assistant: "Atlas" }}
  suggestions={["Summarize my week"]}
  respond={async ({ attempt }) => {
    if (attempt === 0) throw new Error("The model is busy right now (429).");
    return "Back online…";
  }}
/>`,children:(0,d.jsx)(f,{headingLevel:`none`,labels:{assistant:`Atlas`},suggestions:[`Summarize my week`,`What changed in the last release?`],respond:g,className:`h-[30rem]`})}),(0,d.jsx)(s,{of:u}),(0,d.jsx)(s,{title:`AiChatRequest`,rows:[[`prompt`,`string`,``,`The text of the message being answered.`],[`attachments`,`AiChatAttachment[]`,``,`{ id, name, size, type, previewUrl, file } for files sent with it.`],[`messages`,`AiChatMessage[]`,``,`The conversation so far, oldest first, ending with this prompt.`],[`model`,`string`,``,`Holds the value of the model the person chose.`],[`attempt`,`number`,``,`0 for a new prompt; 1, 2… for each regenerate or retry.`],[`signal`,`AbortSignal`,``,`Aborted by Stop, New chat or unmount. Pass it to fetch.`]]}),(0,d.jsx)(s,{title:`AiChatMessage`,rows:[[`id`,`string`,``,`Stable identifier of the message, used as the React key and in callbacks.`],[`role`,`"user" | "assistant"`,``,`Says who wrote the message: the person ("user") or the model ("assistant").`],[`content`,`string`,``,"Light Markdown: **bold**, `code`, fenced code blocks, - and 1. lists, [links](https://…). User messages show as plain text."],[`attachments`,`AiChatAttachment[]`,``,`Lists the files shown above a user message.`],[`model`,`string`,``,`Sets the model value shown under an assistant reply.`],[`status`,`"thinking" | "streaming" | "done" | "stopped" | "error"`,`"done"`,`Progress of an assistant reply; user messages have no status.`],[`error`,`string`,``,`Shown when status is error.`]]}),(0,d.jsx)(o,{rows:[[`Enter`,`Send the message (on touch keyboards Enter adds a line and the send button sends).`],[`Shift + Enter`,`Add a line.`],[`Escape`,`Stop a reply.`],[`Tab`,`The conversation (a scrollable region), the suggestion chips, the attach button, the model picker, then send.`]]}),(0,d.jsx)(i,{notes:[`Every message starts with a visually hidden heading (“You said:”), so the conversation can be navigated by heading.`,`Streaming text is not read piece by piece: one polite live region reports thinking, then the finished reply, a stop or an error.`,`The key hint is linked to the field with aria-describedby. Give each chat on a page its own assistant name: it names the chat for screen readers.`]})]})}export{_ as default};