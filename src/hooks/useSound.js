import { useCallback } from "react";
import { useSystemStore } from "../store/systemStore";
import { playSound } from "../lib/sound";

export function useSound() {
  const soundOn = useSystemStore((s) => s.soundOn);
  return useCallback((name) => playSound(name, soundOn), [soundOn]);
}
