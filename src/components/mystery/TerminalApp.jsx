import { useRef, useState } from "react";
import { useSystemStore } from "../../store/systemStore";
import { useWindowStore } from "../../store/windowStore";
import { useProductStore } from "../../store/productStore";
import { getClue } from "../../data/clues";

const HELP = `available commands:
  help              show this list
  dir               list top-level archive folders
  dir old_index     list a folder the desktop shell doesn't show
  whoami            print current session identity
  restore <serial>  attempt to restore a sealed record by serial suffix
  sudo unlock       ...
  clear             clear the screen
  exit              close this window`;

export default function TerminalApp({ winKey }) {
  const [history, setHistory] = useState([
    "ARCHIVE.SYS [Version 4.11]",
    "(c) no rights reserved.",
    "",
    "type HELP to list commands.",
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);
  const unlockTerminal = useSystemStore((s) => s.unlockTerminal);
  const discoverClue = useSystemStore((s) => s.discoverClue);
  const restoreFile = useSystemStore((s) => s.restoreFile);
  const close = useWindowStore((s) => s.close);

  function print(lines) {
    setHistory((h) => [...h, ...(Array.isArray(lines) ? lines : [lines])]);
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
    });
  }

  function run(raw) {
    const cmd = raw.trim();
    print(`C:\\ARCHIVE> ${cmd}`);
    const [verb, ...rest] = cmd.toLowerCase().split(/\s+/);
    const arg = rest.join(" ");

    const products = useProductStore.getState().products;

    switch (verb) {
      case "":
        break;
      case "help":
        print(HELP.split("\n"));
        break;
      case "dir":
        if (arg === "old_index") {
          print([
            "OLD_INDEX/",
            ...products
              .filter((p) => p.status === "DELETED" || p.status === "CLASSIFIED")
              .map((p) => `  ${p.serial}   ${p.status.padEnd(11)} ${p.brand} ${p.model}`),
            "",
            "hint: try RESTORE <last 4 of a serial>",
          ]);
        } else {
          print([
            " Volume ARCHIVE",
            "",
            " SONY/          CANON/        NIKON/       OLYMPUS/",
            " CASIO/         KODAK/        FUJIFILM/    PANASONIC/",
            " ARCHIVE.DB     OLD_INDEX/  <-- not shown by the desktop shell",
          ]);
        }
        break;
      case "whoami":
        print("guest  (no administrator privileges on this session)");
        break;
      case "restore": {
        const target = products.find((p) => p.serial?.toLowerCase().endsWith(arg));
        if (!target || !target.mystery) {
          print(`no sealed record matches suffix "${arg}"`);
        } else {
          restoreFile(target.id);
          discoverClue(target.mystery.clueId);
          const clue = getClue(target.mystery.clueId);
          print([`record ${target.serial} restored.`, "", clue.title, ...clue.body.split("\n")]);
        }
        break;
      }
      case "sudo":
        if (arg === "unlock") {
          unlockTerminal();
          discoverClue("terminal-secret");
          const clue = getClue("terminal-secret");
          print(["", clue.title, ...clue.body.split("\n")]);
        } else {
          print("sudo: permission architecture not implemented on this build");
        }
        break;
      case "clear":
        setHistory([]);
        return;
      case "exit":
        close(winKey);
        return;
      default:
        print(`'${verb}' is not recognized as a command. type HELP.`);
    }
  }

  return (
    <div
      className="app"
      style={{ background: "#0a0e07", color: "#9fd63c" }}
      onClick={() => document.getElementById(`term-input-${winKey}`)?.focus()}
    >
      <div ref={scrollRef} className="app__scroll mono" style={{ padding: 12, fontSize: 13, lineHeight: 1.5 }}>
        {history.map((line, i) => (
          <div key={i} style={{ whiteSpace: "pre-wrap" }}>
            {line}
          </div>
        ))}
        <div style={{ display: "flex", gap: 4 }}>
          <span>C:\ARCHIVE&gt;</span>
          <input
            id={`term-input-${winKey}`}
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                run(input);
                setInput("");
              }
            }}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              color: "#9fd63c",
              fontFamily: "var(--font-mono)",
              fontSize: 13,
            }}
            spellCheck={false}
            aria-label="Terminal command input"
          />
        </div>
      </div>
    </div>
  );
}
