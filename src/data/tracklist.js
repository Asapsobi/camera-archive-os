export const TRACKLIST = [
  { title: "DIAL-UP DREAMS", seconds: 252 },
  { title: "SHUTTER SESSIONS", seconds: 227 },
  { title: "CRT LULLABY", seconds: 304 },
  { title: "FLOPPY DISK LOVE SONG", seconds: 195 },
  { title: "ARCHIVE.SYS THEME", seconds: 178 },
];

export function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
