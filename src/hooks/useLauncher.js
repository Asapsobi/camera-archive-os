import { useCallback } from "react";
import { useWindowStore } from "../store/windowStore";
import { useSound } from "./useSound";

// Central registry describing every "app" that can be opened as a window —
// desktop icons, the Start menu, and the taskbar all launch through here so
// there's exactly one place that knows window titles/icons/sizes.
export const APP_CONFIG = {
  mycomputer: { type: "mycomputer", title: "My Computer", icon: "computer", width: 520, height: 420 },
  archive: { type: "archive", title: "Camera Archive", icon: "camera", width: 780, height: 560 },
  wishlist: { type: "wishlist", title: "My Documents — Wishlist", icon: "heart", width: 520, height: 420 },
  recyclebin: { type: "recyclebin", title: "Recycle Bin", icon: "trash", width: 560, height: 460 },
  readme: { type: "readme", title: "Read Me.txt — Notepad", icon: "doc", width: 560, height: 480 },
  about: { type: "readme", title: "About Us — Read Me.txt", icon: "doc", width: 560, height: 480 },
  internet: { type: "internet", title: "The Internet — Camera Archive Online", icon: "globe", width: 820, height: 580 },
  cart: { type: "cart", title: "Shopping Cart", icon: "cart", width: 480, height: 460 },
  checkout: { type: "checkout", title: "Checkout", icon: "lock", width: 520, height: 560 },
  timeline: { type: "timeline", title: "Archive Timeline", icon: "floppy", width: 700, height: 520 },
  terminal: { type: "terminal", title: "MS-DOS Prompt", icon: "terminal", width: 560, height: 380 },
  error404: { type: "error404", title: "ERROR — 404", icon: "warning", width: 460, height: 320 },
  mysteryfolder: { type: "mysteryfolder", title: "SYSTEM_OLD~1", icon: "folderMystery", width: 460, height: 340 },
  product: { type: "product", title: "Camera File", icon: "camera", width: 620, height: 520 },
  contact: { type: "contact", title: "Contact", icon: "mail", width: 460, height: 480 },
  chat: { type: "chat", title: "Chat", icon: "chat", width: 420, height: 520 },
  specguide: { type: "specguide", title: "Spec Guide", icon: "doc", width: 480, height: 480 },
};

export function useLauncher() {
  const open = useWindowStore((s) => s.open);
  const play = useSound();

  const launch = useCallback(
    (key, props = {}, overrides = {}) => {
      const cfg = APP_CONFIG[key];
      if (!cfg) return null;
      play("open");
      const singletonKey = key === "product" ? props.productId : undefined;
      const title = props.titleOverride ?? overrides.title ?? cfg.title;
      return open({
        type: cfg.type,
        title,
        icon: cfg.icon,
        width: cfg.width,
        height: cfg.height,
        props,
        singletonKey: overrides.singletonKey ?? singletonKey ?? "single",
      });
    },
    [open, play]
  );

  return launch;
}
