import { useEffect, useState } from "react";
import { TRACKLIST, formatTime } from "../../data/tracklist";
import { useSystemStore } from "../../store/systemStore";
import { useSound } from "../../hooks/useSound";

export default function WinampWidget() {
  const winampOpen = useSystemStore((s) => s.winampOpen);
  const toggleWinamp = useSystemStore((s) => s.toggleWinamp);
  const play = useSound();
  const [trackIndex, setTrackIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(23);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);

  const track = TRACKLIST[trackIndex];

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setElapsed((e) => {
        if (e + 1 >= track.seconds) {
          setTrackIndex((i) => (shuffle ? Math.floor(Math.random() * TRACKLIST.length) : (i + 1) % TRACKLIST.length));
          return 0;
        }
        return e + 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [playing, track.seconds, shuffle]);

  function skip(dir) {
    setElapsed(0);
    setTrackIndex((i) => (i + dir + TRACKLIST.length) % TRACKLIST.length);
    play("click");
  }

  function togglePlay() {
    setPlaying((p) => !p);
    play(playing ? "close" : "open");
  }

  if (!winampOpen) return null;

  const pct = Math.min(100, (elapsed / track.seconds) * 100);

  return (
    <div className="winamp" role="complementary" aria-label="Winamp player">
      <div className="winamp__titlebar">
        <span>Winamp</span>
        <div className="winamp__wintools">
          <button type="button" aria-label="Minimize">_</button>
          <button type="button" aria-label="Maximize">□</button>
          <button type="button" aria-label="Close" onClick={() => { toggleWinamp(); play("close"); }}>✕</button>
        </div>
      </div>
      <div className="winamp__body">
        <div className="winamp__display">
          <div className="winamp__logo">
            A<br />R<br />C<br />H
          </div>
          <button type="button" className="winamp__playglyph" onClick={togglePlay} aria-label={playing ? "Pause" : "Play"}>
            {playing ? "❙❙" : "▶"}
          </button>
          <div className="winamp__time">{formatTime(elapsed)}</div>
          <div className="winamp__trackinfo">
            <span className="mono">{trackIndex + 1}.</span> {track.title} ({formatTime(track.seconds)})
          </div>
        </div>
        <div className="winamp__meta">
          <span className="winamp__chip">192 kbps</span>
          <span className="winamp__chip">44 kHz</span>
          <span className="winamp__chip">stereo</span>
        </div>
        <div className="winamp__progress" onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const ratio = (e.clientX - rect.left) / rect.width;
          setElapsed(Math.floor(ratio * track.seconds));
        }}>
          <div className="winamp__progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="winamp__controls">
          <button type="button" onClick={() => skip(-1)} aria-label="Previous track">⏮</button>
          <button type="button" onClick={togglePlay} aria-label={playing ? "Pause" : "Play"}>
            {playing ? "⏸" : "▶"}
          </button>
          <button type="button" onClick={() => setPlaying(false)} aria-label="Stop">⏹</button>
          <button type="button" onClick={() => skip(1)} aria-label="Next track">⏭</button>
          <button
            type="button"
            className={shuffle ? "winamp__toggle--on" : ""}
            onClick={() => setShuffle((v) => !v)}
            aria-pressed={shuffle}
          >
            SHUFFLE
          </button>
          <button
            type="button"
            className={repeat ? "winamp__toggle--on" : ""}
            onClick={() => setRepeat((v) => !v)}
            aria-pressed={repeat}
          >
            REPEAT
          </button>
        </div>
      </div>
    </div>
  );
}
