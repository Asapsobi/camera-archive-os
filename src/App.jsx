import { useEffect, useState } from "react";
import Desktop from "./components/desktop/Desktop";
import TopBar from "./components/desktop/TopBar";
import Dock from "./components/desktop/Dock";
import Notifications from "./components/desktop/Notifications";
import CrtOverlay from "./components/desktop/CrtOverlay";
import BootScreen from "./components/desktop/BootScreen";
import WindowManager from "./components/window/WindowManager";
import WinampWidget from "./components/music/WinampWidget";
import { useSystemStore } from "./store/systemStore";
import { useNotifyStore } from "./store/notifyStore";
import { useLauncher } from "./hooks/useLauncher";
import { useSecretHash } from "./hooks/useSecretHash";

export default function App() {
  const booted = useSystemStore((s) => s.booted);
  const [showBoot, setShowBoot] = useState(!booted);
  const push = useNotifyStore((s) => s.push);
  const launch = useLauncher();

  useSecretHash();

  useEffect(() => {
    if (showBoot) return;
    const t = setTimeout(() => {
      push("ARCHIVE.SYS", "1,284 devices indexed. 3 records could not be recovered.");
    }, 1400);
    return () => clearTimeout(t);
  }, [showBoot, push]);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === "x") {
        e.preventDefault();
        launch("terminal");
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [launch]);

  if (showBoot) {
    return <BootScreen onDone={() => setShowBoot(false)} />;
  }

  return (
    <div>
      <Desktop />
      <WindowManager />
      <WinampWidget />
      <Notifications />
      <TopBar />
      <Dock />
      <CrtOverlay />
    </div>
  );
}
