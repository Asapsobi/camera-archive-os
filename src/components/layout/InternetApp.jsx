import { useState } from "react";
import CameraArchiveApp from "../catalog/CameraArchiveApp";
import Icon from "../desktop/Icon";

export default function InternetApp() {
  const [address, setAddress] = useState("http://www.camera-archive.net/storefront");

  return (
    <div className="app">
      <div className="app__menubar">
        <span>File</span>
        <span>Edit</span>
        <span>View</span>
        <span>Favorites</span>
        <span>Tools</span>
        <span>Help</span>
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center", padding: "5px 8px", borderBottom: "1px solid var(--silver-400)", background: "var(--silver-100)" }}>
        <button type="button" className="btn btn--sm" aria-label="Back">◁</button>
        <button type="button" className="btn btn--sm" aria-label="Forward">▷</button>
        <button type="button" className="btn btn--sm" aria-label="Refresh">⟳</button>
        <span style={{ fontSize: 11, color: "var(--metal-700)" }}>Address:</span>
        <input
          className="input"
          style={{ flex: 1 }}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          aria-label="Address bar"
        />
        <button type="button" className="btn btn--sm">Go</button>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <CameraArchiveApp />
      </div>
      <div className="app__statusbar">
        <span>Done</span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Icon name="globe" size={14} /> Internet
        </span>
      </div>
    </div>
  );
}
