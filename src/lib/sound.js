// Tiny synthesized UI sound kit — oscillator beeps only, no audio files.
// Never plays unless the caller checks the system sound toggle first.

let ctx;
function getCtx() {
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    ctx = new AudioCtx();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function beep({ freq = 600, duration = 0.08, type = "square", gain = 0.05, glideTo = null, delay = 0 }) {
  const audio = getCtx();
  if (!audio) return;
  const osc = audio.createOscillator();
  const amp = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audio.currentTime + delay);
  if (glideTo) {
    osc.frequency.linearRampToValueAtTime(glideTo, audio.currentTime + delay + duration);
  }
  amp.gain.setValueAtTime(gain, audio.currentTime + delay);
  amp.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + delay + duration);
  osc.connect(amp);
  amp.connect(audio.destination);
  osc.start(audio.currentTime + delay);
  osc.stop(audio.currentTime + delay + duration + 0.02);
}

export const sounds = {
  click() {
    beep({ freq: 1200, duration: 0.03, type: "square", gain: 0.04 });
  },
  open() {
    beep({ freq: 420, glideTo: 780, duration: 0.14, type: "triangle", gain: 0.06 });
  },
  close() {
    beep({ freq: 700, glideTo: 320, duration: 0.12, type: "triangle", gain: 0.06 });
  },
  error() {
    beep({ freq: 220, duration: 0.16, type: "sawtooth", gain: 0.05 });
    beep({ freq: 180, duration: 0.18, type: "sawtooth", gain: 0.05, delay: 0.1 });
  },
  notify() {
    beep({ freq: 900, duration: 0.07, type: "sine", gain: 0.05 });
    beep({ freq: 1300, duration: 0.09, type: "sine", gain: 0.05, delay: 0.09 });
  },
};

export function playSound(name, enabled) {
  if (!enabled) return;
  sounds[name]?.();
}
