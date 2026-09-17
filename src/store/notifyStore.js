import { create } from "zustand";

let nid = 0;

export const useNotifyStore = create((set) => ({
  toasts: [],
  push(title, body, ttl = 6000) {
    const id = (nid += 1);
    set((s) => ({ toasts: [...s.toasts, { id, title, body }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, ttl);
  },
  dismiss(id) {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },
}));
