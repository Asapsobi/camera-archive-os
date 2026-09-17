import Icon from "./Icon";
import { useIsMobile } from "../../hooks/useIsMobile";

export default function DesktopIcon({ iconName, label, onOpen, selected, onSelect }) {
  const isMobile = useIsMobile();

  return (
    <button
      type="button"
      className={`dicon ${selected ? "dicon--selected" : ""}`}
      onClick={isMobile ? onOpen : onSelect}
      onDoubleClick={isMobile ? undefined : onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter") onOpen?.();
      }}
    >
      <Icon name={iconName} size={40} />
      <span className="dicon__label">{label}</span>
    </button>
  );
}
