import { useSystemStore } from "../../store/systemStore";
import { useNotifyStore } from "../../store/notifyStore";
import { useLauncher } from "../../hooks/useLauncher";
import Icon from "./Icon";
import Clock from "./Clock";

const NAV = [
  { key: "archive", label: "Archive" },
  { key: "about", label: "About" },
  { key: "contact", label: "Contact" },
  { key: "chat", label: "Chat" },
];

export default function TopBar() {
  const soundOn = useSystemStore((s) => s.soundOn);
  const crtOn = useSystemStore((s) => s.crtOn);
  const toggleSound = useSystemStore((s) => s.toggleSound);
  const toggleCrt = useSystemStore((s) => s.toggleCrt);
  const push = useNotifyStore((s) => s.push);
  const launch = useLauncher();

  return (
    <div className="topbar">
      <button type="button" className="topbar__brand" onClick={() => launch("about")}>
        ARCHIVE.SYS
      </button>
      <nav className="topbar__nav" aria-label="Primary">
        {NAV.map((item) => (
          <button key={item.key} type="button" onClick={() => launch(item.key)}>
            {item.label}
          </button>
        ))}
      </nav>
      <div className="topbar__right">
        <button
          type="button"
          className="topbar__icon-btn"
          aria-label={soundOn ? "System sound: on. Click to mute." : "System sound: off. Click to enable."}
          title={`SYSTEM SOUND: ${soundOn ? "ON" : "OFF"}`}
          onClick={toggleSound}
        >
          <Icon name={soundOn ? "sound" : "soundMute"} size={18} />
        </button>
        <button
          type="button"
          className="topbar__icon-btn"
          aria-label={crtOn ? "CRT mode: on. Click to disable." : "CRT mode: off. Click to enable."}
          title={`CRT MODE: ${crtOn ? "ON" : "OFF"}`}
          style={{ opacity: crtOn ? 1 : 0.5 }}
          onClick={toggleCrt}
        >
          <Icon name="crt" size={18} />
        </button>
        <button
          type="button"
          className="topbar__signin"
          onClick={() => push("ARCHIVE.SYS", "Guest session only — accounts aren't part of this demo archive.")}
        >
          Sign in
        </button>
        <span className="topbar__clock">
          <Clock withDate />
        </span>
      </div>
    </div>
  );
}
