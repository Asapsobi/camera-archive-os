// Hand-drawn retro icon glyphs shared by desktop icons, window titlebars,
// the taskbar, and the Start menu. No emoji, no icon font — flat vector
// shapes styled after late-90s/2000s OS iconography.

const GLYPHS = {
  computer: (
    <>
      <rect x="4" y="4" width="24" height="17" rx="1.5" fill="#dfe6ef" stroke="#3a4a5c" strokeWidth="1.2" />
      <rect x="7" y="7" width="18" height="10" fill="#1b3a63" />
      <rect x="1" y="23" width="30" height="4" rx="1" fill="#b9c3cc" stroke="#3a4a5c" strokeWidth="1" />
      <rect x="12" y="21" width="8" height="2.5" fill="#b9c3cc" />
    </>
  ),
  folder: (
    <>
      <path d="M2 8 h9 l2.5 3 H30 v14 a2 2 0 0 1-2 2 H4 a2 2 0 0 1-2-2 Z" fill="#ffd166" stroke="#8a5a12" strokeWidth="1.1" />
      <path d="M2 8 h9 l2.5 3 H30 v2 H2 Z" fill="#ffe6a0" />
    </>
  ),
  folderMystery: (
    <>
      <path d="M2 8 h9 l2.5 3 H30 v14 a2 2 0 0 1-2 2 H4 a2 2 0 0 1-2-2 Z" fill="#8a8f9a" stroke="#3a3d33" strokeWidth="1.1" />
      <text x="16" y="24" textAnchor="middle" fontSize="13" fontFamily="Courier New" fill="#1b1e14" fontWeight="700">?</text>
    </>
  ),
  trash: (
    <>
      <path d="M8 10 h16 l-1.5 16 a2 2 0 0 1-2 1.8h-9 a2 2 0 0 1-2-1.8Z" fill="#dfe1e6" stroke="#3a4a5c" strokeWidth="1.2" />
      <rect x="6" y="7" width="20" height="3" rx="1" fill="#8f96a3" stroke="#3a4a5c" strokeWidth="1" />
      <rect x="13" y="3.5" width="6" height="3" rx="1" fill="#8f96a3" />
      <line x1="13" y1="13" x2="14" y2="25" stroke="#8f96a3" strokeWidth="1.2" />
      <line x1="16" y1="13" x2="16" y2="25" stroke="#8f96a3" strokeWidth="1.2" />
      <line x1="19" y1="13" x2="18" y2="25" stroke="#8f96a3" strokeWidth="1.2" />
    </>
  ),
  trashFull: (
    <>
      <path d="M8 10 h16 l-1.5 16 a2 2 0 0 1-2 1.8h-9 a2 2 0 0 1-2-1.8Z" fill="#dfe1e6" stroke="#3a4a5c" strokeWidth="1.2" />
      <rect x="6" y="7" width="20" height="3" rx="1" fill="#8f96a3" stroke="#3a4a5c" strokeWidth="1" />
      <rect x="13" y="3.5" width="6" height="3" rx="1" fill="#8f96a3" />
      <path d="M9 11 l1 5 h12 l1-5 Z" fill="#c23b3b" opacity="0.7" />
    </>
  ),
  doc: (
    <>
      <path d="M8 3 h11 l5 5 v20 a1.4 1.4 0 0 1-1.4 1.4H8A1.4 1.4 0 0 1 6.6 28V4.4A1.4 1.4 0 0 1 8 3Z" fill="#fbfcf8" stroke="#3a4a5c" strokeWidth="1.1" />
      <path d="M19 3 v5 h5 Z" fill="#c9cfb8" />
      <line x1="10" y1="14" x2="22" y2="14" stroke="#8a8f7a" strokeWidth="1.1" />
      <line x1="10" y1="18" x2="22" y2="18" stroke="#8a8f7a" strokeWidth="1.1" />
      <line x1="10" y1="22" x2="18" y2="22" stroke="#8a8f7a" strokeWidth="1.1" />
    </>
  ),
  globe: (
    <>
      <circle cx="16" cy="16" r="12" fill="#4f8fe0" stroke="#0a246a" strokeWidth="1.2" />
      <ellipse cx="16" cy="16" rx="5" ry="12" fill="none" stroke="#e7f1ff" strokeWidth="1" />
      <line x1="4" y1="16" x2="28" y2="16" stroke="#e7f1ff" strokeWidth="1" />
      <path d="M6 10 Q16 14 26 10" fill="none" stroke="#e7f1ff" strokeWidth="1" />
      <path d="M6 22 Q16 18 26 22" fill="none" stroke="#e7f1ff" strokeWidth="1" />
    </>
  ),
  camera: (
    <>
      <rect x="4" y="10" width="24" height="15" rx="2" fill="#c7c9cc" stroke="#3a3d33" strokeWidth="1.1" />
      <circle cx="19" cy="17.5" r="6" fill="#1b1e14" stroke="#565a5f" strokeWidth="1" />
      <circle cx="19" cy="17.5" r="3" fill="#3a6ea5" />
      <rect x="7" y="6" width="8" height="5" rx="1" fill="#a8abaf" stroke="#3a3d33" strokeWidth="1" />
      <circle cx="9" cy="13" r="1.1" fill="#9fd63c" />
    </>
  ),
  terminal: (
    <>
      <rect x="3" y="5" width="26" height="20" rx="1.5" fill="#0a0e07" stroke="#3a3d33" strokeWidth="1.1" />
      <path d="M7 12 l5 4 -5 4" fill="none" stroke="#9fd63c" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="15" y1="20" x2="23" y2="20" stroke="#9fd63c" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  cart: (
    <>
      <path d="M5 6 h3 l2.6 14.5 h13.4" fill="none" stroke="#3a3d33" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M10 6 H27 L24.5 17 H11.5" fill="#ffd166" stroke="#3a3d33" strokeWidth="1.1" />
      <circle cx="13" cy="25" r="2.1" fill="#3a3d33" />
      <circle cx="22" cy="25" r="2.1" fill="#3a3d33" />
    </>
  ),
  heart: (
    <path d="M16 27 C6 20 3 14 6.5 10 C9 7 13.5 7.5 16 12 C18.5 7.5 23 7 25.5 10 C29 14 26 20 16 27 Z" fill="none" stroke="#c23b3b" strokeWidth="1.8" />
  ),
  heartFull: (
    <path d="M16 27 C6 20 3 14 6.5 10 C9 7 13.5 7.5 16 12 C18.5 7.5 23 7 25.5 10 C29 14 26 20 16 27 Z" fill="#c23b3b" stroke="#7a1f1f" strokeWidth="1" />
  ),
  floppy: (
    <>
      <rect x="4" y="4" width="24" height="24" rx="1.5" fill="#2b2b2d" stroke="#0a0e07" strokeWidth="1" />
      <rect x="9" y="4" width="10" height="9" fill="#c7c9cc" />
      <rect x="7" y="17" width="18" height="9" fill="#eef0f2" stroke="#8f96a3" strokeWidth="1" />
      <rect x="17" y="6" width="4" height="5" fill="#2b2b2d" />
    </>
  ),
  gear: (
    <path
      d="M16 10a6 6 0 1 0 0 12 6 6 0 0 0 0-12Zm12.5 4.2-2.6-.5a10.4 10.4 0 0 0-.9-2.1l1.5-2.2a1 1 0 0 0-.1-1.3l-1.6-1.6a1 1 0 0 0-1.3-.1l-2.2 1.5a10.4 10.4 0 0 0-2.1-.9l-.5-2.6a1 1 0 0 0-1-.8h-2.3a1 1 0 0 0-1 .8l-.5 2.6c-.75.2-1.46.5-2.1.9l-2.2-1.5a1 1 0 0 0-1.3.1L6.7 8a1 1 0 0 0-.1 1.3l1.5 2.2c-.4.65-.7 1.36-.9 2.1l-2.6.5a1 1 0 0 0-.8 1v2.3a1 1 0 0 0 .8 1l2.6.5c.2.75.5 1.46.9 2.1l-1.5 2.2a1 1 0 0 0 .1 1.3l1.6 1.6a1 1 0 0 0 1.3.1l2.2-1.5c.65.4 1.36.7 2.1.9l.5 2.6a1 1 0 0 0 1 .8h2.3a1 1 0 0 0 1-.8l.5-2.6c.75-.2 1.46-.5 2.1-.9l2.2 1.5a1 1 0 0 0 1.3-.1l1.6-1.6a1 1 0 0 0 .1-1.3l-1.5-2.2c.4-.65.7-1.36.9-2.1l2.6-.5a1 1 0 0 0 .8-1v-2.3a1 1 0 0 0-.8-1Z"
      fill="#8f96a3"
      stroke="#3a4a5c"
      strokeWidth="0.6"
    />
  ),
  sound: (
    <>
      <path d="M5 12 h4 l6-5 v18 l-6-5 H5 Z" fill="#3a4a5c" />
      <path d="M19 10 a8 8 0 0 1 0 12" fill="none" stroke="#3a4a5c" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M22 6 a13 13 0 0 1 0 20" fill="none" stroke="#3a4a5c" strokeWidth="1.6" strokeLinecap="round" opacity="0.6" />
    </>
  ),
  soundMute: (
    <>
      <path d="M5 12 h4 l6-5 v18 l-6-5 H5 Z" fill="#8f96a3" />
      <line x1="19" y1="11" x2="27" y2="21" stroke="#c23b3b" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="27" y1="11" x2="19" y2="21" stroke="#c23b3b" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  crt: (
    <>
      <rect x="3" y="6" width="26" height="18" rx="3" fill="#2b2b2d" stroke="#0a0e07" strokeWidth="1" />
      <rect x="6" y="9" width="20" height="12" rx="1.5" fill="#173a1f" />
      <line x1="6" y1="12" x2="26" y2="12" stroke="#2f6b3b" strokeWidth="0.6" />
      <line x1="6" y1="15" x2="26" y2="15" stroke="#2f6b3b" strokeWidth="0.6" />
      <line x1="6" y1="18" x2="26" y2="18" stroke="#2f6b3b" strokeWidth="0.6" />
      <rect x="13" y="25" width="6" height="3" fill="#2b2b2d" />
    </>
  ),
  warning: (
    <>
      <path d="M16 4 L29 27 H3 Z" fill="#ffcc33" stroke="#7a5c00" strokeWidth="1.2" />
      <rect x="14.6" y="12" width="2.8" height="8" fill="#3a2e00" />
      <rect x="14.6" y="22" width="2.8" height="2.8" fill="#3a2e00" />
    </>
  ),
  lock: (
    <>
      <rect x="8" y="14" width="16" height="13" rx="1.5" fill="#c7c9cc" stroke="#3a3d33" strokeWidth="1.1" />
      <path d="M11 14 v-3 a5 5 0 0 1 10 0 v3" fill="none" stroke="#3a3d33" strokeWidth="1.6" />
      <circle cx="16" cy="20" r="2" fill="#3a3d33" />
    </>
  ),
  search: (
    <>
      <circle cx="13" cy="13" r="7" fill="none" stroke="#3a4a5c" strokeWidth="2" />
      <line x1="18.5" y1="18.5" x2="27" y2="27" stroke="#3a4a5c" strokeWidth="2.4" strokeLinecap="round" />
    </>
  ),
  close: (
    <line x1="6" y1="6" x2="26" y2="26" stroke="currentColor" strokeWidth="2" />
  ),
  chat: (
    <>
      <path d="M4 7 h24 a2 2 0 0 1 2 2 v11 a2 2 0 0 1-2 2 H13 l-6 5 v-5 H4 a2 2 0 0 1-2-2 V9 a2 2 0 0 1 2-2Z" fill="#fff" stroke="#3a4a5c" strokeWidth="1.2" />
      <circle cx="11" cy="14.5" r="1.6" fill="#2f7fc1" />
      <circle cx="17" cy="14.5" r="1.6" fill="#2f7fc1" />
      <circle cx="23" cy="14.5" r="1.6" fill="#2f7fc1" />
    </>
  ),
  music: (
    <>
      <circle cx="9" cy="24" r="4" fill="#2b2b2d" />
      <circle cx="22" cy="21" r="4" fill="#2b2b2d" />
      <path d="M13 24 V6 L26 3 V21" fill="none" stroke="#2b2b2d" strokeWidth="2" />
    </>
  ),
  video: (
    <>
      <rect x="3" y="8" width="19" height="16" rx="3" fill="#111" stroke="#3a4a5c" strokeWidth="1" />
      <path d="M22 13 L29 9 V23 L22 19 Z" fill="#111" stroke="#3a4a5c" strokeWidth="1" />
      <circle cx="12.5" cy="16" r="4.4" fill="none" stroke="#ff5a8a" strokeWidth="1.8" />
      <circle cx="12.5" cy="16" r="4.4" fill="none" stroke="#2fd6c6" strokeWidth="1.8" transform="translate(1.2,-1.2)" />
    </>
  ),
  grid: (
    <>
      <rect x="4" y="4" width="24" height="24" rx="5" fill="#fff" stroke="#3a4a5c" strokeWidth="1.4" />
      <circle cx="16" cy="16" r="6" fill="none" stroke="#c2447a" strokeWidth="1.8" />
      <circle cx="22.5" cy="9.5" r="1.4" fill="#c2447a" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="7" width="26" height="18" rx="2" fill="#fff" stroke="#3a4a5c" strokeWidth="1.3" />
      <path d="M4 8.5 L16 18 L28 8.5" fill="none" stroke="#2f7fc1" strokeWidth="1.6" />
    </>
  ),
};

export default function Icon({ name, size = 32, className }) {
  const glyph = GLYPHS[name] ?? GLYPHS.doc;
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} aria-hidden="true" focusable="false">
      {glyph}
    </svg>
  );
}
