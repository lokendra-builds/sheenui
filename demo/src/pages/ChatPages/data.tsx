import type { ChatAttachment, ChatConversation, ChatMessage, ChatParticipant } from "@sheenui/theme";
import { DEMO_NOW_MS } from "../../demo-clock";

/* =====================================================================
 * Deterministic demo data: people, photos (inline SVG), conversations
 * ===================================================================== */

export const ME = "me";

// The story's "now" is fixed (the prerender and the hydration must print the same text); the demo clock then moves on.
const T0 = DEMO_NOW_MS;

const MIN = 60_000;

export const HOUR = 60 * MIN;

const DAY = 24 * HOUR;

/**
 * hh:mm, `days` days before the story's "today" (DEMO_NOW's day, 12:00, after the morning's last message at
 * 10:31, so no message is ever from the future). `setHours` returns the new timestamp.
 */
export function at(days: number, hh: number, mm: number) {
  return new Date(T0 - days * DAY).setHours(hh, mm, 0, 0);
}

const svg = (markup: string) => `data:image/svg+xml,${encodeURIComponent(markup)}`;

/** An abstract portrait: gradient, head and shoulders. */
function portrait(hue: number, skin: number, hair: number) {
  return svg(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='hsl(${hue} 70% 64%)'/><stop offset='1' stop-color='hsl(${(hue + 50) % 360} 62% 42%)'/></linearGradient></defs><rect width='96' height='96' fill='url(#g)'/><path d='M12 98c3-22 17-33 36-33s33 11 36 33z' fill='hsl(${(hue + 180) % 360} 35% 88%)'/><circle cx='48' cy='42' r='17' fill='hsl(${skin} 42% 68%)'/><path d='M30 42c-1-14 7-23 18-23s20 9 18 23c-4-8-10-11-18-11s-14 3-18 11z' fill='hsl(${hair} 35% 18%)'/></svg>`,
  );
}

/** A landscape "photo": sky, sun and two ridges. */
function scene(sky: number, land: number, sun = true, w = 800, h = 600) {
  return svg(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${h}'><defs><linearGradient id='s' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='hsl(${sky} 75% 62%)'/><stop offset='1' stop-color='hsl(${(sky + 35) % 360} 85% 82%)'/></linearGradient></defs><rect width='${w}' height='${h}' fill='url(#s)'/>${sun ? `<circle cx='${w * 0.7}' cy='${h * 0.33}' r='${h * 0.12}' fill='hsl(45 100% 78%)'/>` : ""}<path d='M0 ${h * 0.7} L${w * 0.22} ${h * 0.42} L${w * 0.4} ${h * 0.63} L${w * 0.6} ${h * 0.37} L${w} ${h * 0.72} V${h} H0Z' fill='hsl(${land} 38% 42%)'/><path d='M0 ${h * 0.8} L${w * 0.3} ${h * 0.6} L${w * 0.52} ${h * 0.78} L${w * 0.75} ${h * 0.63} L${w} ${h * 0.83} V${h} H0Z' fill='hsl(${land} 45% 27%)'/></svg>`,
  );
}

/** A "moodboard": soft shapes. */
function moodboard(hue: number) {
  return svg(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'><rect width='600' height='600' fill='hsl(${hue} 60% 92%)'/><circle cx='190' cy='210' r='130' fill='hsl(${hue} 75% 70%)'/><rect x='300' y='120' width='210' height='210' rx='48' fill='hsl(${(hue + 60) % 360} 70% 68%)'/><rect x='110' y='380' width='380' height='110' rx='55' fill='hsl(${(hue + 200) % 360} 60% 62%)'/><circle cx='470' cy='450' r='46' fill='hsl(${(hue + 120) % 360} 80% 74%)'/></svg>`,
  );
}

export const PEOPLE: ChatParticipant[] = [
  { id: ME, name: "Kabir Malhotra", avatarUrl: portrait(220, 28, 25), presence: "online", email: "kabir@example.com" },
  {
    id: "riya",
    name: "Riya Sharma",
    avatarUrl: portrait(320, 26, 20),
    presence: "online",
    phone: "+91 98201 44718",
    email: "riya.sharma@example.com",
    about: "Designing glass things ✨",
  },
  {
    id: "arjun",
    name: "Arjun Nair",
    avatarUrl: portrait(160, 24, 15),
    presence: "away",
    phone: "+91 99860 21357",
    about: "On a deadline. Text, don't call 🙏",
  },
  {
    id: "priya",
    name: "Priya Iyer",
    presence: "offline",
    lastSeenAt: T0 - 25 * MIN,
    phone: "+91 90040 66120",
    email: "priya.iyer@example.com",
  },
  {
    id: "daniel",
    name: "Daniel Okafor",
    avatarUrl: portrait(30, 22, 10),
    presence: "online",
    email: "daniel@example.org",
    about: "Lagos → Berlin",
  },
  {
    id: "sofia",
    name: "Sofia García",
    avatarUrl: portrait(10, 30, 30),
    presence: "offline",
    lastSeenAt: T0 - 2 * HOUR - 10 * MIN,
  },
  { id: "mei", name: "Mei Lin", avatarUrl: portrait(270, 34, 0), presence: "online" },
  { id: "lucas", name: "Lucas Moreau", presence: "offline", lastSeenAt: T0 - 1 * DAY - 3 * HOUR },
  { id: "ananya", name: "Ananya Gupta", avatarUrl: portrait(190, 27, 22), presence: "online" },
  { id: "rohan", name: "Rohan Verma", presence: "away" },
  {
    id: "fatima",
    name: "Fatima Zahra",
    avatarUrl: portrait(100, 25, 15),
    presence: "offline",
    lastSeenAt: T0 - 3 * DAY,
  },
  { id: "noah", name: "Noah Kim", presence: "online" },
  {
    id: "ishaan",
    name: "Ishaan Kapoor",
    avatarUrl: portrait(45, 26, 18),
    presence: "offline",
    lastSeenAt: T0 - 40 * MIN,
  },
  { id: "emma", name: "Emma Schmidt", presence: "offline", lastSeenAt: T0 - 6 * DAY },
  { id: "vikram", name: "Vikram Singh", avatarUrl: portrait(0, 24, 12), presence: "online" },
  { id: "sana", name: "Sana Qureshi", avatarUrl: portrait(300, 28, 22), presence: "online", role: "Support" },
  { id: "leo", name: "Leo Fischer", avatarUrl: portrait(200, 30, 35), presence: "online", role: "Support" },
  { id: "maya", name: "Maya Patel", avatarUrl: portrait(140, 27, 18), presence: "away", role: "Product" },
];

/* A tiny seeded random generator (same messages on every load). */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SMALL_TALK = [
  "Did you push the latest build?",
  "Yes, it's on staging now 🚀",
  "The blur looks so much better on Safari",
  "Haha true 😂",
  "Can you check the dark mode contrast?",
  "On it",
  "Chai break? ☕",
  "5 min, finishing this PR",
  "Arre, the tests are flaky again 😅",
  "I'll rerun them",
  "Looks good to me 👍",
  "What did the client say?",
  "They loved the motion on the dock!",
  "Nice 🎉",
  "Let's sync tomorrow morning",
  "Sure, 10:30 works",
  "Sending the design link in a bit",
  "Got it, thanks!",
  "Did you see the new icons?",
  "Yes, much cleaner",
  "Traffic is crazy today 🚗",
  "Working from home then?",
  "Probably 😄",
  "Ping me when you're free",
];

/** Older history for a chat: `count` messages, oldest first, ending before `before`. */
function olderHistory(
  conversationId: string,
  partners: string[],
  count: number,
  before: number,
  seed: number,
): ChatMessage[] {
  const random = rng(seed);
  const out: ChatMessage[] = [];
  let t = before;
  for (let i = 0; i < count; i++) {
    t -= Math.round((4 + random() * 70) * MIN);
    const mine = random() < 0.45;
    const sender = mine ? ME : (partners[Math.floor(random() * partners.length)] ?? partners[0] ?? ME);
    const text = SMALL_TALK[Math.floor(random() * SMALL_TALK.length)];
    out.push({
      id: `${conversationId}-old-${i}`,
      senderId: sender,
      createdAt: t,
      text,
      status: mine ? "read" : undefined,
    });
  }
  return out.reverse();
}

const roadmap: ChatAttachment = {
  id: "f-roadmap",
  kind: "file",
  name: "SheenUI-roadmap-Q4.pdf",
  size: 2_412_544,
  mimeType: "application/pdf",
  url: svg("<svg xmlns='http://www.w3.org/2000/svg'/>"),
};

/* ----- The main 1:1 chat (Riya) ----- */
const riyaRecent: ChatMessage[] = [
  { id: "r1", senderId: "riya", createdAt: at(1, 18, 2), text: "Did you see the new glass components? 😍" },
  {
    id: "r2",
    senderId: ME,
    createdAt: at(1, 18, 4),
    text: "Yes! The blur on the dock is so smooth",
    status: "read",
    readAt: at(1, 18, 5),
  },
  {
    id: "r3",
    senderId: ME,
    createdAt: at(1, 18, 4) + 20_000,
    text: "Also fixed the contrast in dark mode, check the badges",
    status: "read",
    readAt: at(1, 18, 5),
  },
  {
    id: "r4",
    senderId: "riya",
    createdAt: at(1, 18, 40),
    text: "Marine Drive right now 🌅",
    attachments: [
      {
        id: "img-sunset",
        kind: "image",
        name: "marine-drive.jpg",
        alt: "Sunset over the sea at Marine Drive",
        url: scene(20, 230),
      },
    ],
    reactions: [
      { emoji: "❤️", userIds: [ME] },
      { emoji: "😍", userIds: [ME] },
    ],
  },
  { id: "r5", senderId: ME, createdAt: at(1, 18, 41), text: "Wow. Jealous 😩", status: "read" },
  {
    id: "r6",
    senderId: "riya",
    createdAt: at(1, 19, 15),
    text: "Here's the roadmap for the next quarter",
    attachments: [roadmap],
  },
  { id: "r7", senderId: "riya", createdAt: at(0, 9, 12), text: "Morning! Standup in 10?" },
  {
    id: "r8",
    senderId: ME,
    createdAt: at(0, 9, 13),
    text: "Joining in 2 min ☕",
    status: "read",
    reactions: [{ emoji: "👍", userIds: ["riya"] }],
  },
  {
    id: "r9",
    senderId: "riya",
    createdAt: at(0, 9, 40),
    text: "The page I mentioned: https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter",
    linkPreview: {
      url: "https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter",
      siteName: "MDN Web Docs",
      title: "backdrop-filter - CSS",
      description: "Applies graphical effects such as blur or color shift to the area behind an element.",
      imageUrl: "linear-gradient(135deg, oklch(70% 0.15 285), oklch(75% 0.12 185))",
    },
  },
  {
    id: "r10",
    senderId: ME,
    createdAt: at(0, 9, 42),
    text: "Bookmarked, thanks! Reading it after lunch",
    status: "read",
    editedAt: at(0, 9, 43),
    replyTo: {
      id: "r9",
      senderId: "riya",
      text: "The page I mentioned: https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter",
    },
  },
  { id: "r11", senderId: ME, createdAt: at(0, 10, 5), deleted: true, status: "read" },
  { id: "r12", senderId: "riya", createdAt: at(0, 10, 20), text: "🔥🔥" },
  { id: "r13", senderId: ME, createdAt: at(0, 10, 21), text: "Lunch at 1? 🍛", status: "failed" },
  { id: "r14", senderId: ME, createdAt: at(0, 10, 22), text: "Lunch at 1? 🍛", status: "read" },
  {
    id: "r15",
    senderId: "riya",
    createdAt: at(0, 10, 30),
    text: "Yes! The usual place?",
    replyTo: { id: "r14", senderId: ME, text: "Lunch at 1? 🍛" },
  },
  { id: "r16", senderId: "riya", createdAt: at(0, 10, 31), text: "Also, can you review the chat PR before that? 🙏" },
];

/* ----- A group chat ----- */
const designRecent: ChatMessage[] = [
  {
    id: "d0",
    senderId: "riya",
    kind: "system",
    createdAt: at(2, 11, 0),
    text: "Riya created the group “Design Crew 🎨”",
  },
  { id: "d1", senderId: "mei", kind: "system", createdAt: at(2, 11, 1), text: "Mei Lin joined" },
  { id: "d2", senderId: "riya", createdAt: at(2, 11, 3), text: "Welcome Mei! 👋 Dropping the moodboards here" },
  {
    id: "d3",
    senderId: "riya",
    createdAt: at(2, 11, 4),
    attachments: [
      { id: "mb1", kind: "image", name: "moodboard-1.png", alt: "Moodboard with violet circles", url: moodboard(285) },
      { id: "mb2", kind: "image", name: "moodboard-2.png", alt: "Moodboard with teal shapes", url: moodboard(185) },
      { id: "mb3", kind: "image", name: "moodboard-3.png", alt: "Moodboard with warm shapes", url: moodboard(30) },
      { id: "mb4", kind: "image", name: "moodboard-4.png", alt: "Moodboard with pink shapes", url: moodboard(330) },
      { id: "mb5", kind: "image", name: "moodboard-5.png", alt: "Moodboard with green shapes", url: moodboard(120) },
      { id: "mb6", kind: "image", name: "moodboard-6.png", alt: "Moodboard with blue shapes", url: moodboard(220) },
    ],
    reactions: [
      { emoji: "🔥", userIds: ["mei", "arjun", ME] },
      { emoji: "😍", userIds: ["mei"] },
    ],
  },
  {
    id: "d4",
    senderId: "mei",
    createdAt: at(2, 11, 20),
    text: "These are gorgeous. The second one for the onboarding?",
  },
  { id: "d5", senderId: "arjun", createdAt: at(2, 11, 26), text: "+1 for the teal one" },
  { id: "d6", senderId: "arjun", createdAt: at(2, 11, 26) + 30_000, text: "Can we keep the radius at 20 though?" },
  {
    id: "d7",
    senderId: ME,
    createdAt: at(2, 11, 40),
    text: "Agreed, 20 everywhere. I'll update the tokens",
    status: "read",
  },
  { id: "d8", senderId: "mei", createdAt: at(0, 10, 5), text: "Standup notes are in the doc 📝" },
  {
    id: "d9",
    senderId: "riya",
    createdAt: at(0, 10, 12),
    text: "Thanks Mei 🙌",
    reactions: [{ emoji: "❤️", userIds: ["mei"] }],
  },
];

/* ----- Other chats: just their last message (a short thread is made when opened) ----- */
type Seed = Omit<ChatConversation, "lastMessage"> & { last: Omit<ChatMessage, "id"> };

/** Stand-in for an empty thread, so the last message of a seed is never undefined. */
const NO_MESSAGE: Omit<ChatMessage, "id"> = { senderId: ME, createdAt: 0, text: "" };

const SEEDS: Seed[] = [
  {
    id: "c-riya",
    participantIds: [ME, "riya"],
    pinned: true,
    unreadCount: 2,
    last: riyaRecent[riyaRecent.length - 1] ?? NO_MESSAGE,
  },
  {
    id: "c-design",
    kind: "group",
    title: "Design Crew 🎨",
    participantIds: [ME, "riya", "mei", "arjun"],
    pinned: true,
    last: designRecent[designRecent.length - 1] ?? NO_MESSAGE,
  },
  {
    id: "c-daniel",
    participantIds: [ME, "daniel"],
    unreadCount: 1,
    typingIds: ["daniel"],
    last: { senderId: "daniel", createdAt: T0 - 4 * MIN, text: "Just landed in Berlin ✈️" },
  },
  {
    id: "c-trek",
    kind: "group",
    title: "Weekend Trek ⛰️",
    participantIds: [ME, "rohan", "ananya", "ishaan"],
    unreadCount: 14,
    muted: true,
    last: { senderId: "ananya", createdAt: T0 - 22 * MIN, text: "Who's carrying the Maggi? 🍜" },
  },
  {
    id: "c-priya",
    participantIds: [ME, "priya"],
    last: { senderId: ME, createdAt: T0 - 50 * MIN, text: "Sent the invoice, let me know!", status: "delivered" },
  },
  {
    id: "c-arjun",
    participantIds: [ME, "arjun"],
    draft: "Can you send the specs",
    last: { senderId: "arjun", createdAt: at(1, 21, 10), text: "Okay, tomorrow then" },
  },
  {
    id: "c-sofia",
    participantIds: [ME, "sofia"],
    last: { senderId: "sofia", createdAt: at(1, 16, 5), text: "¡Gracias! See you on Friday 🎉" },
  },
  {
    id: "c-family",
    kind: "group",
    title: "Family 🏡",
    participantIds: [ME, "vikram", "ananya"],
    unreadCount: 128,
    last: {
      senderId: "vikram",
      createdAt: at(2, 20, 40),
      text: "Photo",
      attachments: [{ id: "fam1", kind: "image", name: "diwali.jpg", url: scene(280, 30, false) }],
    },
  },
  {
    id: "c-mei",
    participantIds: [ME, "mei"],
    last: { senderId: ME, createdAt: at(3, 12, 0), text: "That works 👍", status: "read" },
  },
  {
    id: "c-lucas",
    participantIds: [ME, "lucas"],
    last: { senderId: "lucas", createdAt: at(4, 10, 15), text: "Merci beaucoup!" },
  },
  {
    id: "c-fatima",
    participantIds: [ME, "fatima"],
    last: { senderId: ME, createdAt: at(9, 14, 30), text: "Happy birthday Fatima! 🎂🎈", status: "read" },
  },
  {
    id: "c-noah",
    participantIds: [ME, "noah"],
    archived: true,
    last: { senderId: "noah", createdAt: at(12, 9, 0), text: "Sounds like a plan" },
  },
  {
    id: "c-emma",
    participantIds: [ME, "emma"],
    archived: true,
    last: { senderId: "emma", createdAt: at(40, 18, 0), text: "Danke, bis bald!" },
  },
  {
    id: "c-ishaan",
    participantIds: [ME, "ishaan"],
    last: { senderId: "ishaan", createdAt: at(6, 19, 45), deleted: true },
  },
];

export function makeConversations(): ChatConversation[] {
  return SEEDS.map(({ last, ...c }) => ({ ...c, lastMessage: { ...last, id: `${c.id}-last` } }));
}

/** A short believable thread for chats that only have a last message. */
export function shortThread(c: ChatConversation): ChatMessage[] {
  const last = c.lastMessage;
  if (!last) return [];
  const partners = c.participantIds.filter((p) => p !== ME);
  const base = olderHistory(
    c.id,
    partners.length ? partners : [ME],
    9,
    Number(last.createdAt) - 6 * MIN,
    c.id.length * 97,
  );
  return [...base, { ...last, id: `${c.id}-last` }];
}

export const RIYA_OLDER = olderHistory("c-riya", ["riya"], 200, at(1, 17, 30), 7);

/** Daniel is typing when the page opens; his message lands a few seconds later. */
export const DANIEL_ARRIVES = [{ conversationId: "c-daniel", text: "Taking the S-Bahn into town now 🚆", after: 6000 }];

export function initialMessages(): Record<string, ChatMessage[]> {
  return { "c-riya": riyaRecent, "c-design": designRecent };
}

/** 1,200 extra chats to try the list's windowing. */
export function manyConversations(): ChatConversation[] {
  const random = rng(99);
  const first = [
    "Aarav",
    "Diya",
    "Vihaan",
    "Saanvi",
    "Ayaan",
    "Kiara",
    "Liam",
    "Olivia",
    "Mateo",
    "Yuki",
    "Amara",
    "Omar",
    "Chloe",
    "Ravi",
    "Nina",
  ];
  const lastNames = [
    "Shah",
    "Reddy",
    "Das",
    "Bose",
    "Joshi",
    "Smith",
    "Silva",
    "Tanaka",
    "Mensah",
    "Haddad",
    "Rossi",
    "Kumar",
    "Lee",
    "Novak",
  ];
  return Array.from({ length: 1200 }, (_, i) => {
    const id = `bulk-${i}`;
    const unread = random() < 0.12 ? Math.ceil(random() * 30) : 0;
    return {
      id,
      title: `${first[i % first.length]} ${lastNames[(i * 7) % lastNames.length]}`,
      participantIds: [ME, id],
      unreadCount: unread,
      lastMessage: {
        id: `${id}-last`,
        senderId: random() < 0.4 ? ME : id,
        createdAt: T0 - (i + 3) * 37 * MIN,
        text: SMALL_TALK[i % SMALL_TALK.length],
        status: "read",
      },
    } satisfies ChatConversation;
  });
}
