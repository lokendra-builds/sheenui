/**
 * A small, curated emoji set for the chat picker: the ones people actually send, with an
 * English name (read by screen readers and matched by search) and a few search keywords.
 * Replace it with your own list (and translated names) through the picker's `categories` prop.
 */

export type ChatEmoji = {
  /** The emoji itself. */
  char: string;
  /** Spoken name, e.g. "red heart". */
  name: string;
  /** Extra search words. */
  keywords?: string;
};

/** The ids of the built-in emoji categories (smileys, people, hearts, nature, food, activities and objects). */
export type ChatEmojiCategoryId = "smileys" | "people" | "hearts" | "nature" | "food" | "activities" | "objects";

/** A group of emoji in the picker: an id (a built-in id or your own), the emoji shown on its tab and the emoji it holds. */
export type ChatEmojiCategory = {
  id: ChatEmojiCategoryId | (string & {});
  /** Shown on the category tab (an emoji). */
  icon: string;
  emojis: ChatEmoji[];
};

/** Parse "😀 grinning face | happy smile, …" lines (keeps this file short and readable). */
function parse(source: string): ChatEmoji[] {
  return source
    .trim()
    .split("\n")
    .map((line) => {
      const [head = "", keywords] = line.split("|");
      const trimmed = head.trim();
      const space = trimmed.indexOf(" ");
      return { char: trimmed.slice(0, space), name: trimmed.slice(space + 1).trim(), keywords: keywords?.trim() };
    })
    .filter((e) => e.char && e.name);
}

/** The built-in emoji set the picker uses, grouped into `ChatEmojiCategory` entries with searchable names and keywords. */
export const defaultEmojiCategories: ChatEmojiCategory[] = [
  {
    id: "smileys",
    icon: "😀",
    emojis: parse(`
😀 grinning face | happy smile
😃 grinning face with big eyes | happy joy
😄 grinning face with smiling eyes | happy laugh
😁 beaming face | grin happy
😆 laughing face | lol haha
😅 grinning face with sweat | relief phew
😂 face with tears of joy | lol laugh crying
🤣 rolling on the floor laughing | rofl lol
🙂 slightly smiling face | smile ok
😉 winking face | wink flirt
😊 smiling face with smiling eyes | blush happy
😇 smiling face with halo | angel innocent
🥰 smiling face with hearts | love adore
😍 heart eyes | love crush
🤩 star struck | wow amazing
😘 face blowing a kiss | kiss love
😋 face savoring food | yum tasty
😜 winking face with tongue | joke silly
🤪 zany face | crazy silly
🤗 hugging face | hug thanks
🤭 face with hand over mouth | oops giggle
🤔 thinking face | hmm think
🤨 face with raised eyebrow | doubt skeptical
😐 neutral face | meh
🙄 face with rolling eyes | eyeroll whatever
😏 smirking face | smirk
😴 sleeping face | sleep tired zzz
😌 relieved face | calm relief
😎 smiling face with sunglasses | cool
🥳 partying face | party celebrate birthday
🤓 nerd face | geek
😮 face with open mouth | wow surprised
😲 astonished face | shocked
🥺 pleading face | please puppy eyes
😢 crying face | sad tear
😭 loudly crying face | sob sad
😤 face with steam from nose | triumph frustrated
😡 enraged face | angry mad
🤯 exploding head | mind blown
😱 face screaming in fear | scared omg
🥶 cold face | freezing
🥵 hot face | heat sweating
😬 grimacing face | awkward yikes
🫠 melting face | embarrassed hot
🫡 saluting face | yes sir respect
`),
  },
  {
    id: "people",
    icon: "👍",
    emojis: parse(`
👍 thumbs up | yes ok like approve
👎 thumbs down | no dislike
👌 ok hand | perfect fine
✌️ victory hand | peace
🤞 crossed fingers | luck hope
🤝 handshake | deal agree
🙏 folded hands | please thanks pray namaste
👏 clapping hands | applause bravo
🙌 raising hands | hooray celebrate
👋 waving hand | hi hello bye
🤙 call me hand | shaka
💪 flexed biceps | strong
✋ raised hand | stop high five
👀 eyes | look see
🧠 brain | smart think
🫶 heart hands | love support
🤷 person shrugging | dunno whatever
🤦 person facepalming | facepalm ugh
🙋 person raising hand | me question
💃 woman dancing | dance party
🕺 man dancing | dance party
🧑‍💻 technologist | developer coding laptop
👩‍🍳 cook | chef kitchen
🧘 person in lotus position | yoga calm
`),
  },
  {
    id: "hearts",
    icon: "❤️",
    emojis: parse(`
❤️ red heart | love
🧡 orange heart | love
💛 yellow heart | love
💚 green heart | love
💙 blue heart | love
💜 purple heart | love
🖤 black heart | love
🤍 white heart | love
💖 sparkling heart | love
💗 growing heart | love
💕 two hearts | love
💞 revolving hearts | love
💯 hundred points | 100 perfect
✨ sparkles | magic shine
🔥 fire | lit hot
⭐ star | favourite
🌟 glowing star | shine
💫 dizzy | stars
💥 collision | boom
💤 zzz | sleep
`),
  },
  {
    id: "nature",
    icon: "🌸",
    emojis: parse(`
🌸 cherry blossom | flower spring
🌹 rose | flower love
🌻 sunflower | flower
🌷 tulip | flower
🌱 seedling | plant grow
🌴 palm tree | beach holiday
🌈 rainbow | colours
☀️ sun | sunny weather
🌙 crescent moon | night
⛅ sun behind cloud | weather
🌧️ cloud with rain | rain monsoon
❄️ snowflake | cold winter
🌊 water wave | sea ocean beach
🐶 dog face | puppy pet
🐱 cat face | kitty pet
🐼 panda | bear cute
🦊 fox | animal
🐘 elephant | animal
🦋 butterfly | insect
🐝 honeybee | bee
`),
  },
  {
    id: "food",
    icon: "🍕",
    emojis: parse(`
☕ hot beverage | coffee tea chai
🍵 teacup without handle | tea chai
🧋 bubble tea | boba
🍕 pizza | food
🍔 hamburger | burger food
🍟 french fries | chips
🌮 taco | food
🍜 steaming bowl | noodles ramen
🍛 curry rice | curry food
🍣 sushi | food
🍩 doughnut | donut sweet
🍰 shortcake | cake dessert
🎂 birthday cake | birthday party
🍫 chocolate bar | sweet
🍎 red apple | fruit
🥭 mango | fruit summer
🍉 watermelon | fruit
🥑 avocado | food
🍿 popcorn | movie snack
🥂 clinking glasses | cheers toast celebrate
`),
  },
  {
    id: "activities",
    icon: "⚽",
    emojis: parse(`
🎉 party popper | celebrate party congrats
🎊 confetti ball | celebrate
🎁 wrapped gift | present birthday
🎈 balloon | party
🏆 trophy | win award
🥇 first place medal | gold win
⚽ soccer ball | football
🏏 cricket game | cricket bat
🏀 basketball | sport
🎾 tennis | sport
🎮 video game | gaming controller
🎧 headphone | music
🎵 musical note | music song
🎬 clapper board | movie film
🎨 artist palette | art paint design
🏃 person running | run exercise
✈️ airplane | travel flight
🚀 rocket | launch ship
🏖️ beach with umbrella | holiday vacation
🗺️ world map | travel
`),
  },
  {
    id: "objects",
    icon: "💡",
    emojis: parse(`
💡 light bulb | idea
📌 pushpin | pin
📎 paperclip | attach
📅 calendar | date schedule
⏰ alarm clock | time reminder
📷 camera | photo picture
📱 mobile phone | phone
💻 laptop | computer work
⌨️ keyboard | typing
🖥️ desktop computer | computer
📦 package | box delivery shipping
✅ check mark button | done yes
❌ cross mark | no wrong
⚠️ warning | careful alert
❓ question mark | what
❗ exclamation mark | important
🔒 locked | secure private
🔑 key | password
💬 speech balloon | chat message
📣 megaphone | announce
`),
  },
];

/** The quick reactions (WhatsApp's set): one tap under a message. */
export const defaultQuickReactions = ["👍", "❤️", "😂", "😮", "😢", "🙏"] as const;

/** Every emoji by its character, for spoken names of reactions. */
const byChar = new Map<string, ChatEmoji>();
for (const category of defaultEmojiCategories) for (const emoji of category.emojis) byChar.set(emoji.char, emoji);

/** The spoken name of an emoji when it is in the set ("red heart"), else the emoji itself. */
export function emojiName(char: string): string {
  return byChar.get(char)?.name ?? char;
}

/**
 * True for a short message that is only emoji (1-3): shown large, without a bubble
 * (as WhatsApp, iMessage and Telegram do).
 */
export function isJumboEmoji(text: string | undefined): boolean {
  if (!text) return false;
  const trimmed = text.trim();
  if (!trimmed || trimmed.length > 24) return false;
  if (!/^(?:\p{Extended_Pictographic}|\p{Emoji_Component}|‍|️|\s)+$/u.test(trimmed)) return false;
  // Digits and # are Emoji_Component too: require at least one pictograph.
  if (!/\p{Extended_Pictographic}/u.test(trimmed)) return false;
  const segmenter =
    typeof Intl !== "undefined" && "Segmenter" in Intl
      ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
      : null;
  const count = segmenter
    ? [...segmenter.segment(trimmed.replace(/\s+/g, ""))].length
    : Array.from(trimmed.replace(/\s+/g, "")).length;
  return count >= 1 && count <= 3;
}
