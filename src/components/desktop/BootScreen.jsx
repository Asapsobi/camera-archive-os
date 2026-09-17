import { useEffect, useRef, useState } from "react";
import { useSystemStore } from "../../store/systemStore";

const LINES = [
  "ARCHIVE.SYS BIOS v4.11 — RECOVERED MACHINE",
  "CPU: UNKNOWN  MEMORY TEST: 262144K OK",
  "DETECTING PRIMARY DRIVE ... C:\\ARCHIVE  [FOUND]",
  "MOUNTING CAMERA DATABASE ......... OK",
  "1,284 DEVICES INDEXED",
  "CHECKING FOR DELETED SECTORS ..... 3 FOUND",
  "CONNECTION: 56K  LOCATION: UNKNOWN",
  "LOADING DESKTOP ENVIRONMENT ......",
];

export default function BootScreen({ onDone }) {
  const setBooted = useSystemStore((s) => s.setBooted);
  const [shown, setShown] = useState(0);
  const skippedRef = useRef(false);

  useEffect(() => {
    if (shown >= LINES.length) {
      const t = setTimeout(finish, 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setShown((n) => n + 1), 220 + Math.random() * 160);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown]);

  function finish() {
    if (skippedRef.current) return;
    skippedRef.current = true;
    setBooted(true);
    onDone();
  }

  return (
    <div
      onClick={finish}
      role="button"
      tabIndex={0}
      aria-label="Skip boot sequence"
      onKeyDown={(e) => e.key === "Enter" && finish()}
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        color: "#9fd63c",
        fontFamily: "var(--font-mono)",
        fontSize: 14,
        padding: "40px",
        zIndex: "var(--z-boot)",
        cursor: "pointer",
      }}
    >
      {LINES.slice(0, shown).map((line, i) => (
        <div key={i}>{line}</div>
      ))}
      {shown < LINES.length && <span className="blink-cursor" style={{ height: "1em" }} />}
      <div style={{ position: "absolute", bottom: 24, left: 40, right: 40, opacity: 0.6, fontSize: 12 }}>
        click anywhere or press enter to skip
      </div>
    </div>
  );
}
