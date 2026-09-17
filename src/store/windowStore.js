import { create } from "zustand";

let uid = 0;
const nextKey = () => `win-${(uid += 1)}`;

const CASCADE_STEP = 28;
const DEFAULT_SIZE = { width: 560, height: 420 };

function cascadePosition(index) {
  const bx = 90;
  const by = 60;
  return {
    x: bx + (index % 6) * CASCADE_STEP,
    y: by + (index % 6) * CASCADE_STEP,
  };
}

export const useWindowStore = create((set, get) => ({
  windows: [],
  topZ: 100,

  open({ type, title, icon, props = {}, singletonKey, width, height, x, y }) {
    const key = singletonKey ? `${type}:${singletonKey}` : nextKey();
    const state = get();
    const existing = state.windows.find((w) => w.key === key);
    if (existing) {
      set({
        windows: state.windows.map((w) =>
          w.key === key ? { ...w, minimized: false, props: { ...w.props, ...props } } : w
        ),
        topZ: state.topZ + 1,
      });
      get().focus(key);
      return key;
    }

    const idx = state.windows.length;
    const pos = cascadePosition(idx);
    const z = state.topZ + 1;
    const win = {
      key,
      type,
      title,
      icon,
      props,
      x: x ?? pos.x,
      y: y ?? pos.y,
      width: width ?? DEFAULT_SIZE.width,
      height: height ?? DEFAULT_SIZE.height,
      minimized: false,
      maximized: false,
      zIndex: z,
    };
    set({ windows: [...state.windows, win], topZ: z });
    return key;
  },

  close(key) {
    set((state) => ({ windows: state.windows.filter((w) => w.key !== key) }));
  },

  closeAll() {
    set({ windows: [] });
  },

  focus(key) {
    set((state) => {
      const z = state.topZ + 1;
      return {
        topZ: z,
        windows: state.windows.map((w) => (w.key === key ? { ...w, zIndex: z, minimized: false } : w)),
      };
    });
  },

  minimize(key) {
    set((state) => ({
      windows: state.windows.map((w) => (w.key === key ? { ...w, minimized: true } : w)),
    }));
  },

  toggleMaximize(key) {
    set((state) => ({
      windows: state.windows.map((w) => (w.key === key ? { ...w, maximized: !w.maximized } : w)),
    }));
  },

  move(key, x, y) {
    set((state) => ({
      windows: state.windows.map((w) => (w.key === key ? { ...w, x, y } : w)),
    }));
  },

  resize(key, width, height) {
    set((state) => ({
      windows: state.windows.map((w) => (w.key === key ? { ...w, width, height } : w)),
    }));
  },

  topWindowKey() {
    const wins = get().windows.filter((w) => !w.minimized);
    if (!wins.length) return null;
    return wins.reduce((top, w) => (w.zIndex > top.zIndex ? w : top), wins[0]).key;
  },
}));
