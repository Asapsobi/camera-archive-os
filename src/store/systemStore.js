import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useSystemStore = create(
  persist(
    (set, get) => ({
      soundOn: false,
      crtOn: false,
      booted: false,
      winampOpen: false,
      restoredFiles: [], // productIds the visitor has "restored" from the recycle bin
      foundClues: [], // clueIds discovered, for a lightweight completion sense
      terminalUnlocked: false,

      toggleSound() {
        set((s) => ({ soundOn: !s.soundOn }));
      },
      toggleCrt() {
        set((s) => ({ crtOn: !s.crtOn }));
      },
      toggleWinamp() {
        set((s) => ({ winampOpen: !s.winampOpen }));
      },
      setBooted(v) {
        set({ booted: v });
      },
      restoreFile(productId) {
        set((s) =>
          s.restoredFiles.includes(productId)
            ? s
            : { restoredFiles: [...s.restoredFiles, productId] }
        );
      },
      discoverClue(clueId) {
        set((s) => (s.foundClues.includes(clueId) ? s : { foundClues: [...s.foundClues, clueId] }));
      },
      unlockTerminal() {
        set({ terminalUnlocked: true });
      },
      isRestored(productId) {
        return get().restoredFiles.includes(productId);
      },
    }),
    {
      name: "archive.system.v1",
      partialize: (state) => ({
        soundOn: state.soundOn,
        crtOn: state.crtOn,
        restoredFiles: state.restoredFiles,
        foundClues: state.foundClues,
        terminalUnlocked: state.terminalUnlocked,
      }),
    }
  )
);
