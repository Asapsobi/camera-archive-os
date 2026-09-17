import { useState } from "react";
import DesktopIcon from "./DesktopIcon";
import { useLauncher } from "../../hooks/useLauncher";
import { useSystemStore } from "../../store/systemStore";
import { useSound } from "../../hooks/useSound";

const ICONS = [
  { key: "mycomputer", icon: "computer", label: "My Computer" },
  { key: "archive", icon: "camera", label: "Catalog" },
  { key: "contact", icon: "mail", label: "Contact" },
  { key: "wishlist", icon: "heart", label: "Wishlist" },
  { key: "internet", icon: "globe", label: "Search" },
  { key: "winamp", icon: "music", label: "Winamp" },
  { key: "video-channel", icon: "video", label: "TikTok" },
  { key: "grid-channel", icon: "grid", label: "Instagram" },
  { key: "cart", icon: "cart", label: "Cart" },
  { key: "recyclebin", icon: "trash", label: "Recycle Bin" },
  { key: "mysteryfolder", icon: "folderMystery", label: "SYSTEM_OLD~1" },
];

const CORNER_ICONS = [
  { key: "specguide", icon: "doc", label: "Spec Guide" },
  { key: "about", icon: "doc", label: "About Us" },
];

export default function Desktop() {
  const launch = useLauncher();
  const toggleWinamp = useSystemStore((s) => s.toggleWinamp);
  const play = useSound();
  const [selected, setSelected] = useState(null);

  function openIcon(key) {
    if (key === "winamp") {
      toggleWinamp();
      play("open");
      return;
    }
    if (key === "video-channel" || key === "grid-channel") {
      launch("contact");
      return;
    }
    launch(key);
  }

  function renderIcon(item) {
    return (
      <DesktopIcon
        key={item.key}
        iconName={item.icon}
        label={item.label}
        selected={selected === item.key}
        onSelect={(e) => {
          e.stopPropagation();
          setSelected(item.key);
        }}
        onOpen={(e) => {
          e?.stopPropagation?.();
          openIcon(item.key);
        }}
      />
    );
  }

  return (
    <div className="desktop" onClick={() => setSelected(null)}>
      <nav className="desktop__grid" aria-label="Desktop icons">
        {ICONS.map(renderIcon)}
      </nav>
      <nav className="desktop__grid desktop__grid--corner" aria-label="Reference icons">
        {CORNER_ICONS.map(renderIcon)}
      </nav>
    </div>
  );
}
