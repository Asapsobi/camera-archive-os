import { useState } from "react";
import Icon from "../desktop/Icon";
import { useNotifyStore } from "../../store/notifyStore";
import { useSound } from "../../hooks/useSound";

const CHANNELS = [
  { icon: "video", label: "TikTok", handle: "@archive.sys" },
  { icon: "grid", label: "Instagram", handle: "@archive.sys" },
  { icon: "globe", label: "Forum", handle: "archive.sys/board" },
];

export default function ContactApp() {
  const [message, setMessage] = useState("");
  const push = useNotifyStore((s) => s.push);
  const play = useSound();

  function submit(e) {
    e.preventDefault();
    play("notify");
    push("ARCHIVE.SYS", "Message logged locally. This demo archive has no mail server behind it yet.");
    setMessage("");
  }

  return (
    <div className="app__scroll" style={{ padding: 16 }}>
      <div className="panel" style={{ marginBottom: 12 }}>
        <strong>archive@camera-archive.example</strong>
        <p style={{ fontSize: 12.5, margin: "6px 0 0" }}>
          Estate sales, closed-shop lots, or a camera you think belongs here — that's the inbox for it.
        </p>
      </div>

      <div className="filter-group__title">CHANNELS</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
        {CHANNELS.map((c) => (
          <div key={c.label} className="panel--sunken" style={{ display: "flex", alignItems: "center", gap: 10, padding: 8 }}>
            <Icon name={c.icon} size={26} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{c.label}</div>
              <div className="mono" style={{ fontSize: 11, color: "var(--metal-700)" }}>
                {c.handle}
              </div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={submit}>
        <div className="field" style={{ marginBottom: 8 }}>
          <label htmlFor="contact-msg">Leave a note for the archivist</label>
          <textarea
            id="contact-msg"
            className="input"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            style={{ resize: "vertical", fontFamily: "var(--font-ui)" }}
          />
        </div>
        <button type="submit" className="btn btn--primary">
          Send
        </button>
      </form>
    </div>
  );
}
