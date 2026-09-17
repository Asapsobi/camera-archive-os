import { useSystemStore } from "../../store/systemStore";

export default function MysteryFolderApp() {
  const terminalUnlocked = useSystemStore((s) => s.terminalUnlocked);

  return (
    <div className="app panel--sunken" style={{ background: "#111308" }}>
      <div className="app__scroll" style={{ padding: 18, color: "#9fd63c", fontFamily: "var(--font-mono)", fontSize: 13, lineHeight: 1.7 }}>
        <div>ACCESS DENIED.</div>
        <div style={{ marginTop: 10 }}>SYSTEM_OLD~1 is not indexed by the desktop shell.</div>
        <div style={{ marginTop: 10 }}>
          this machine still has a command line somewhere underneath the wallpaper. it never
          got removed when the desktop shell was installed over it.
        </div>
        <div style={{ marginTop: 10, opacity: 0.7 }}>most keyboards still send raw signals straight through.</div>
        <div className="pixel" style={{ marginTop: 16, fontSize: 15, opacity: 0.8 }}>
          LAST MODIFIED: 08-14-2003 03:12 AM
        </div>
        {terminalUnlocked && (
          <div style={{ marginTop: 18, borderTop: "1px dashed #2f6b3b", paddingTop: 12 }}>
            <div>root access confirmed elsewhere. this folder has nothing left to hide from you.</div>
            <div style={{ marginTop: 8 }}>OLD_INDEX/ — 3 records, all present in the Recycle Bin.</div>
          </div>
        )}
      </div>
    </div>
  );
}
