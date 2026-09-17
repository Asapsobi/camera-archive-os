// Lightweight scripted assistant — keyword-matched canned replies, no LLM
// call. Mirrors the "ask about sizing" helper pattern, aimed at camera
// questions instead of clothing.

export const GREETING = "Hello! How can I help you find the right camera today?";

export const RULES = [
  {
    keywords: ["budget", "cheap", "afford", "price"],
    reply:
      "Most of the archive sits between €40 and €130. Use the price slider in the Camera Archive filters — drag \"Max price\" down and everything above it disappears.",
  },
  {
    keywords: ["travel", "trip", "vacation", "light", "small"],
    reply:
      "For travel, look at ultracompact bodies — Casio Exilim, Canon S-series, or the Nikon Coolpix S1. Small enough for a jacket pocket, still real optical zoom.",
  },
  {
    keywords: ["zoom", "wildlife", "sport", "far"],
    reply:
      "For reach, the bridge cameras win — Panasonic Lumix FZ5 (12x) or the Casio EX-F1 (12x, plus absurd 1200fps slow-mo). Filter by \"Min optical zoom\" in the archive.",
  },
  {
    keywords: ["video", "film", "movie"],
    reply:
      "Video capability varies a lot by era. Anything after ~2009 usually does real 720p/1080p — try the \"Has video capability\" filter and sort by year.",
  },
  {
    keywords: ["battery", "aa"],
    reply:
      "Some of these still run on plain AA batteries (Canon A520, Kodak EasyShare) — handy if you don't want to hunt for a proprietary charger. Check the BATTERY line on any camera file.",
  },
  {
    keywords: ["storage", "card", "memory", "sd", "xd", "smartmedia"],
    reply:
      "Storage formats from this era are all over the place — SD, xD-Picture Card, SmartMedia, even Memory Stick and one that saves to floppy disks. Check the MEDIA field before you buy; some formats are hard to find new.",
  },
  {
    keywords: ["condition", "damage", "scratch", "broken"],
    reply:
      "Every camera file has a CONDITION breakdown — body, lens, LCD — plus an honest overall score out of 10. Nothing is filtered or touched up.",
  },
  {
    keywords: ["mystery", "secret", "hidden", "easter", "deleted", "classified"],
    reply:
      "...I probably shouldn't have said anything. Try the Recycle Bin. Or don't. Up to you.",
  },
  {
    keywords: ["hello", "hi", "hey"],
    reply: "Hey there. Ask me about budget, travel cameras, zoom range, video, batteries, or storage formats.",
  },
  {
    keywords: ["thanks", "thank you", "cool", "nice"],
    reply: "Happy hunting. This place rewards patience.",
  },
];

export function matchReply(input) {
  const text = input.toLowerCase();
  for (const rule of RULES) {
    if (rule.keywords.some((k) => text.includes(k))) return rule.reply;
  }
  return "I'm a small scripted helper, not a full assistant — I know about budget, travel, zoom, video, batteries, storage, and condition. Try asking about one of those, or just browse the Camera Archive directly.";
}
