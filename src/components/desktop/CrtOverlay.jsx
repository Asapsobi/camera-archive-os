import { useSystemStore } from "../../store/systemStore";

export default function CrtOverlay() {
  const crtOn = useSystemStore((s) => s.crtOn);

  return (
    <div className="crt-overlay" aria-hidden="true">
      <div className="crt-overlay__scanlines" style={{ opacity: crtOn ? 0.55 : 0.18 }} />
      {crtOn && (
        <>
          <div className="crt-overlay__vignette" />
          <div className="crt-overlay__flicker" />
          <div className="crt-overlay__noise" />
        </>
      )}
    </div>
  );
}
