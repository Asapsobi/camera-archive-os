import { readmeText } from "../../data/readme";

export default function ReadmeApp() {
  return (
    <div className="app">
      <div className="app__menubar">
        <span>File</span>
        <span>Edit</span>
        <span>Format</span>
        <span>View</span>
        <span>Help</span>
      </div>
      <div className="app__scroll" style={{ background: "#fffef8", padding: "14px 18px" }}>
        <pre
          style={{
            margin: 0,
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            lineHeight: 1.55,
            whiteSpace: "pre-wrap",
            color: "#1b1e14",
          }}
        >
          {readmeText}
        </pre>
      </div>
      <div className="app__statusbar">
        <span>Ln 1, Col 1</span>
        <span>100%</span>
      </div>
    </div>
  );
}
