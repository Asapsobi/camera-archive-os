import { useNotifyStore } from "../../store/notifyStore";
import Icon from "./Icon";

export default function Notifications() {
  const toasts = useNotifyStore((s) => s.toasts);
  const dismiss = useNotifyStore((s) => s.dismiss);

  return (
    <div className="notif-stack" aria-live="polite">
      {toasts.map((t) => (
        <div className="notif" key={t.id} role="status">
          <div className="notif__title">
            <Icon name="warning" size={14} />
            {t.title}
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer" }}
            >
              <Icon name="close" size={11} />
            </button>
          </div>
          <div>{t.body}</div>
        </div>
      ))}
    </div>
  );
}
