import { useState } from "react";
import { getDeletedProducts, STATUS } from "../../data/products";
import { getClue, clues } from "../../data/clues";
import { useSystemStore } from "../../store/systemStore";
import { useSound } from "../../hooks/useSound";

export default function RecycleBinApp() {
  const items = getDeletedProducts();
  const restoredFiles = useSystemStore((s) => s.restoredFiles);
  const restoreFile = useSystemStore((s) => s.restoreFile);
  const discoverClue = useSystemStore((s) => s.discoverClue);
  const play = useSound();
  const [openClue, setOpenClue] = useState(null);

  function handleRestore(item) {
    restoreFile(item.id);
    if (item.mystery) discoverClue(item.mystery.clueId);
    play("notify");
    setOpenClue(item.mystery?.clueId ?? null);
  }

  const activeClue = openClue ? getClue(openClue) : null;

  return (
    <div className="app">
      <div className="app__menubar">
        <span>File</span>
        <span>Edit</span>
        <span>View</span>
      </div>
      <div className="app__scroll" style={{ padding: 12 }}>
        <div className="panel" style={{ marginBottom: 10, fontSize: 12, fontFamily: "var(--font-mono)" }}>
          {clues["recycle-bin-note"].body}
        </div>

        {items.map((item) => {
          const isRestored = restoredFiles.includes(item.id);
          const sealed = item.status === STATUS.CLASSIFIED;
          return (
            <div key={item.id} className="panel--sunken" style={{ marginBottom: 10, padding: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline" }}>
                <strong className="mono" style={{ fontSize: 12 }}>
                  {item.id}.EXE
                </strong>
                <span className={`badge ${sealed ? "badge--classified" : "badge--sold"}`}>{item.status}</span>
              </div>
              <div style={{ fontSize: 12, marginTop: 4 }}>
                {item.brand} {item.model} — {item.year}
              </div>
              <div className="mono" style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>
                SERIAL: {item.serial}
              </div>

              {!isRestored ? (
                <button type="button" className="btn btn--sm" style={{ marginTop: 8 }} onClick={() => handleRestore(item)}>
                  {sealed ? "[ ATTEMPT OVERRIDE ]" : "[ RESTORE FILE ]"}
                </button>
              ) : (
                <button type="button" className="btn btn--sm" style={{ marginTop: 8 }} onClick={() => setOpenClue(item.mystery?.clueId)}>
                  View recovered fragment
                </button>
              )}
            </div>
          );
        })}
      </div>

      {activeClue && (
        <div
          role="dialog"
          aria-label={activeClue.title}
          style={{
            position: "absolute",
            inset: "10%",
            background: "#fffef2",
            border: "2px solid #0a246a",
            boxShadow: "var(--shadow-window)",
            padding: 16,
            overflow: "auto",
            zIndex: 5,
          }}
        >
          <strong className="mono">{activeClue.title}</strong>
          <pre className="mono" style={{ whiteSpace: "pre-wrap", fontSize: 12, marginTop: 10, lineHeight: 1.6 }}>
            {activeClue.body}
          </pre>
          <button type="button" className="btn btn--sm" onClick={() => setOpenClue(null)}>
            Close
          </button>
        </div>
      )}
    </div>
  );
}
