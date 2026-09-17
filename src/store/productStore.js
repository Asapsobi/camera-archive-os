import { create } from "zustand";

// Live product catalog, fetched from the API once and cached. Replaces the
// old build-time static data file — products now come from the database and
// can change any time via the admin panel.
export const useProductStore = create((set, get) => ({
  products: [],
  status: "idle", // idle | loading | ready | error
  error: null,

  async ensureLoaded() {
    const s = get();
    if (s.status === "loading" || s.status === "ready") return;
    set({ status: "loading", error: null });
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const products = await res.json();
      set({ products, status: "ready" });
    } catch (err) {
      set({ status: "error", error: err.message || "Could not load products." });
    }
  },

  async refresh() {
    set({ status: "idle" });
    return get().ensureLoaded();
  },
}));
