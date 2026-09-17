import { getClue } from "../../data/clues";

export default function Error404App() {
  const clue = getClue("error-404");
  return (
    <div className="app" style={{ background: "#0a0e07", color: "#9fd63c" }}>
      <div className="app__scroll" style={{ padding: 20, fontFamily: "var(--font-mono)", fontSize: 13, lineHeight: 1.6 }}>
        <div className="pixel" style={{ fontSize: 34, marginBottom: 6 }}>
          404
        </div>
        <div>{clue.title}</div>
        <pre style={{ whiteSpace: "pre-wrap", marginTop: 10 }}>{clue.body}</pre>
      </div>
    </div>
  );
}
