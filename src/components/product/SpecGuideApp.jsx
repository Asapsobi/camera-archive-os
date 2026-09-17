const ENTRIES = [
  {
    term: "MEGAPIXELS (MP)",
    body: "Resolution of the sensor. 2–4MP was normal before ~2003, 5–8MP through the mid-2000s, 10MP+ became common after ~2007. More megapixels does not automatically mean a better photo on sensors this small and this old — condition and lens quality matter just as much.",
  },
  {
    term: "OPTICAL ZOOM",
    body: "How far the lens itself can zoom using glass, not cropping. \"3x\" roughly means the farthest zoom is 3 times closer than the widest view. Digital zoom (also listed on some units) just crops the image digitally and loses quality — optical is the number that matters.",
  },
  {
    term: "STORAGE FORMAT",
    body: "Early digital cameras used a scattered mix of formats: SmartMedia, CompactFlash, xD-Picture Card, Memory Stick (and its later Duo variant), and eventually the SD card that won out. A few very early units — like the Mavica in this archive — saved straight to 3.5\" floppy disks. Check MEDIA on the camera file before buying if you don't already have a compatible card or reader.",
  },
  {
    term: "BATTERY TYPE",
    body: "Either a proprietary lithium-ion pack (which may be hard to find new today) or plain AA batteries. AA-powered cameras are more convenient long-term since AAs are everywhere; proprietary packs can still often be found as reproductions.",
  },
  {
    term: "CONDITION SCORE",
    body: "Our 0–10 overall score plus a BODY / LENS / LCD breakdown. We don't touch up condition photos — what you see is what ships. A 6.5 with clean glass and a scuffed grip is usually a better buy than a spotless 9 with a hazy lens, depending what you care about.",
  },
  {
    term: "VIDEO CAPABILITY",
    body: "Wildly inconsistent before ~2008 — some cameras have none at all, some do tiny low-framerate clips, a few late-2000s models genuinely shoot usable 720p or 1080p. Check the VIDEO field, don't assume.",
  },
];

export default function SpecGuideApp() {
  return (
    <div className="app__scroll" style={{ padding: 16 }}>
      <p style={{ fontSize: 12.5, color: "var(--metal-700)", marginTop: 0 }}>
        A quick glossary for anyone new to shopping for cameras this old.
      </p>
      {ENTRIES.map((e) => (
        <div key={e.term} className="panel" style={{ marginBottom: 10 }}>
          <div className="filter-group__title" style={{ marginBottom: 4 }}>
            {e.term}
          </div>
          <p style={{ fontSize: 12.5, margin: 0 }}>{e.body}</p>
        </div>
      ))}
    </div>
  );
}
