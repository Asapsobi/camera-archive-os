import { useCallback, useEffect, useRef } from "react";
import { useWindowStore } from "../../store/windowStore";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useSound } from "../../hooks/useSound";
import Icon from "../desktop/Icon";

const TASKBAR_HEIGHT = 40;

export default function Window({ win, isTop, children }) {
  const focus = useWindowStore((s) => s.focus);
  const close = useWindowStore((s) => s.close);
  const minimize = useWindowStore((s) => s.minimize);
  const toggleMaximize = useWindowStore((s) => s.toggleMaximize);
  const move = useWindowStore((s) => s.move);
  const resize = useWindowStore((s) => s.resize);
  const isMobile = useIsMobile();
  const play = useSound();

  const dragRef = useRef(null);
  const resizeRef = useRef(null);

  const onTitleDown = useCallback(
    (e) => {
      if (isMobile || win.maximized) {
        focus(win.key);
        return;
      }
      focus(win.key);
      dragRef.current = { startX: e.clientX, startY: e.clientY, winX: win.x, winY: win.y };
      window.addEventListener("pointermove", onDragMove);
      window.addEventListener("pointerup", onDragUp);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [win.key, win.x, win.y, win.maximized, isMobile]
  );

  function onDragMove(e) {
    if (!dragRef.current) return;
    const { startX, startY, winX, winY } = dragRef.current;
    const nx = Math.max(0, winX + (e.clientX - startX));
    const ny = Math.max(0, Math.min(window.innerHeight - TASKBAR_HEIGHT - 40, winY + (e.clientY - startY)));
    move(win.key, nx, ny);
  }

  function onDragUp() {
    dragRef.current = null;
    window.removeEventListener("pointermove", onDragMove);
    window.removeEventListener("pointerup", onDragUp);
  }

  const onResizeDown = useCallback(
    (e) => {
      if (isMobile || win.maximized) return;
      e.stopPropagation();
      focus(win.key);
      resizeRef.current = { startX: e.clientX, startY: e.clientY, w: win.width, h: win.height };
      window.addEventListener("pointermove", onResizeMove);
      window.addEventListener("pointerup", onResizeUp);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [win.key, win.width, win.height, win.maximized, isMobile]
  );

  function onResizeMove(e) {
    if (!resizeRef.current) return;
    const { startX, startY, w, h } = resizeRef.current;
    const nw = Math.max(320, w + (e.clientX - startX));
    const nh = Math.max(220, h + (e.clientY - startY));
    resize(win.key, nw, nh);
  }

  function onResizeUp() {
    resizeRef.current = null;
    window.removeEventListener("pointermove", onResizeMove);
    window.removeEventListener("pointerup", onResizeUp);
  }

  useEffect(
    () => () => {
      window.removeEventListener("pointermove", onDragMove);
      window.removeEventListener("pointerup", onDragUp);
      window.removeEventListener("pointermove", onResizeMove);
      window.removeEventListener("pointerup", onResizeUp);
    },
    []
  );

  if (win.minimized) return null;

  const style = win.maximized
    ? { left: 0, top: 0, width: "100%", height: `calc(100% - ${TASKBAR_HEIGHT}px)`, zIndex: win.zIndex }
    : { left: win.x, top: win.y, width: win.width, height: win.height, zIndex: win.zIndex };

  return (
    <div
      className={`win win-anim-open ${isTop ? "win--focused" : "win--blurred"} ${win.maximized ? "win--maximized" : ""}`}
      style={style}
      onPointerDown={() => focus(win.key)}
      role="dialog"
      aria-label={win.title}
    >
      <div className="win__titlebar" onPointerDown={onTitleDown} onDoubleClick={() => !isMobile && toggleMaximize(win.key)}>
        {win.icon && <Icon name={win.icon} size={16} className="win__icon" />}
        <div className="win__title">{win.title}</div>
        <div className="win__controls">
          <button
            className="win__ctrl"
            aria-label="Minimize"
            onClick={(e) => {
              e.stopPropagation();
              play("click");
              minimize(win.key);
            }}
          >
            _
          </button>
          {!isMobile && (
            <button
              className="win__ctrl"
              aria-label={win.maximized ? "Restore" : "Maximize"}
              onClick={(e) => {
                e.stopPropagation();
                play("click");
                toggleMaximize(win.key);
              }}
            >
              {win.maximized ? "❐" : "□"}
            </button>
          )}
          <button
            className="win__ctrl win__ctrl--close"
            aria-label="Close"
            onClick={(e) => {
              e.stopPropagation();
              play("close");
              close(win.key);
            }}
          >
            ✕
          </button>
        </div>
      </div>
      <div className="win__body">{children}</div>
      {!isMobile && !win.maximized && <div className="win__resize-handle" onPointerDown={onResizeDown} />}
    </div>
  );
}
