import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [], // { productId, qty }

      add(productId, qty = 1) {
        set((state) => {
          const existing = state.items.find((i) => i.productId === productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === productId ? { ...i, qty: i.qty + qty } : i
              ),
            };
          }
          return { items: [...state.items, { productId, qty }] };
        });
      },

      remove(productId) {
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) }));
      },

      setQty(productId, qty) {
        if (qty <= 0) {
          get().remove(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => (i.productId === productId ? { ...i, qty } : i)),
        }));
      },

      clear() {
        set({ items: [] });
      },

      count() {
        return get().items.reduce((sum, i) => sum + i.qty, 0);
      },
    }),
    { name: "archive.cart.v1" }
  )
);
