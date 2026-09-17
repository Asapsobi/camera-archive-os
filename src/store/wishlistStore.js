import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      ids: [],

      toggle(productId) {
        set((state) =>
          state.ids.includes(productId)
            ? { ids: state.ids.filter((id) => id !== productId) }
            : { ids: [...state.ids, productId] }
        );
      },

      has(productId) {
        return get().ids.includes(productId);
      },
    }),
    { name: "archive.wishlist.v1" }
  )
);
