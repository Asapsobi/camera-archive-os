import { useEffect, useRef } from "react";
import { useWindowStore } from "../../store/windowStore";
import { useSound } from "../../hooks/useSound";
import Icon from "./Icon";

export default function Dock() {
  const windows = useWindowStore((s) => s.windows);
  const focus = useWindowStore((s) => s.focus);
  const minimize = useWindowStore((s) => s.minimize);
  const topKey = useWindowStore((s) => s.topWindowKey());
  const play = useSound();
  const activeRef = useRef(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [topKey]);

  if (windows.length === 0) return null;

  function onClick(w) {
    if (!w.minimized && w.key === topKey) minimize(w.key);
    else focus(w.key);
    play("click");
  }

  return (
    <div className="dock" role="toolbar" aria-label="Open windows">
      {windows.map((w) => {
        const isActive = !w.minimized && w.key === topKey;
        return (
          <button
            key={w.key}
            ref={isActive ? activeRef : null}
            type="button"
            className={`dock__btn ${isActive ? "dock__btn--active" : ""}`}
            onClick={() => onClick(w)}
          >
            {w.icon && <Icon name={w.icon} size={15} />}
            <span className="dock__btn-label">{w.title}</span>
          </button>
        );
      })}
    </div>
  );
}
