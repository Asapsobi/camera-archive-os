import { useRef, useState } from "react";
import { GREETING, matchReply } from "../../data/chatScript";
import { useSound } from "../../hooks/useSound";

function timeNow() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatApp() {
  const [messages, setMessages] = useState([{ from: "bot", text: GREETING, at: timeNow() }]);
  const [input, setInput] = useState("");
  const play = useSound();
  const scrollRef = useRef(null);

  function send(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    const reply = matchReply(text);
    setMessages((m) => [...m, { from: "user", text, at: timeNow() }, { from: "bot", text: reply, at: timeNow() }]);
    setInput("");
    play("notify");
    requestAnimationFrame(() => scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight));
  }

  return (
    <div className="app">
      <div ref={scrollRef} className="app__scroll chat-log">
        <div className="chat-log__divider">Today at {timeNow()}</div>
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble chat-bubble--${m.from}`}>
            {m.text}
          </div>
        ))}
      </div>
      <form className="chat-input" onSubmit={send}>
        <input
          className="input"
          style={{ flex: 1 }}
          placeholder="Message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="Chat message"
        />
        <button type="submit" className="btn btn--primary btn--sm" aria-label="Send message">
          ➤
        </button>
      </form>
    </div>
  );
}
