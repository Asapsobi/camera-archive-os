const COLORWAYS = {
  silver: { body: "#c7c9cc", shade: "#9a9da2", highlight: "#eef0f2", accent: "#5b6066" },
  black: { body: "#2a2b2d", shade: "#141416", highlight: "#54565a", accent: "#101112" },
  graphite: { body: "#4b4e52", shade: "#2c2e31", highlight: "#77797d", accent: "#1c1d1f" },
  titanium: { body: "#a19a8c", shade: "#786f60", highlight: "#d8d2c4", accent: "#4a4436" },
  blue: { body: "#3d6a95", shade: "#254a6b", highlight: "#7fb0dd", accent: "#1a3247" },
  pink: { body: "#d891ac", shade: "#b16587", highlight: "#f5c9d9", accent: "#7d3a53" },
  orange: { body: "#d9762f", shade: "#a8531a", highlight: "#f2a566", accent: "#6f3410" },
  white: { body: "#eeeae1", shade: "#c9c3b5", highlight: "#ffffff", accent: "#918a77" },
};

function useColorway(colorway) {
  return COLORWAYS[colorway] ?? COLORWAYS.silver;
}

// A small set of flat-vector camera silhouettes standing in for real product
// photography (none was supplied). Swap `<CameraIllustration>` for an
// `<img>` per-product once real photos exist — the `bodyStyle`/`colorway`
// fields on each product are already shaped for that migration.
export default function CameraIllustration({ bodyStyle = "compact", colorway = "silver", className, damaged = false }) {
  const c = useColorway(colorway);
  const body = bodyStyle === "ultracompact" ? <Ultracompact c={c} />
    : bodyStyle === "bridge" ? <Bridge c={c} />
    : bodyStyle === "rugged" ? <Rugged c={c} />
    : bodyStyle === "mirrorless" ? <Mirrorless c={c} />
    : <Compact c={c} />;

  return (
    <svg
      viewBox="0 0 200 160"
      className={className}
      role="img"
      aria-label={`Illustration of a ${colorway} ${bodyStyle} digital camera`}
    >
      <defs>
        <radialGradient id="deskBg" cx="50%" cy="38%" r="75%">
          <stop offset="0%" stopColor="#fbfbf8" />
          <stop offset="100%" stopColor="#dfded3" />
        </radialGradient>
        <linearGradient id="glassGlare" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="200" height="160" fill="url(#deskBg)" />
      <ellipse cx="100" cy="132" rx="70" ry="10" fill="#000" opacity="0.12" />
      {body}
      {damaged && (
        <g opacity="0.5">
          <line x1="40" y1="30" x2="80" y2="70" stroke="#fff" strokeWidth="1.5" />
          <line x1="120" y1="20" x2="150" y2="55" stroke="#fff" strokeWidth="1" />
        </g>
      )}
    </svg>
  );
}

function Compact({ c }) {
  return (
    <g>
      <rect x="45" y="45" width="110" height="70" rx="8" fill={c.body} stroke={c.accent} strokeWidth="1.5" />
      <rect x="45" y="45" width="110" height="18" rx="8" fill={c.highlight} opacity="0.5" />
      <circle cx="130" cy="80" r="24" fill={c.shade} stroke={c.accent} strokeWidth="1.5" />
      <circle cx="130" cy="80" r="15" fill="#171a1d" />
      <circle cx="124" cy="74" r="4" fill="url(#glassGlare)" />
      <rect x="58" y="56" width="26" height="16" rx="2" fill="#dfe6ea" opacity="0.85" />
      <circle cx="141" cy="52" r="3" fill={c.highlight} />
      <rect x="60" y="104" width="30" height="6" rx="2" fill={c.accent} opacity="0.6" />
    </g>
  );
}

function Ultracompact({ c }) {
  return (
    <g>
      <rect x="55" y="50" width="90" height="58" rx="10" fill={c.body} stroke={c.accent} strokeWidth="1.5" />
      <rect x="55" y="50" width="90" height="14" rx="10" fill={c.highlight} opacity="0.55" />
      <circle cx="122" cy="79" r="16" fill={c.shade} stroke={c.accent} strokeWidth="1.2" />
      <circle cx="122" cy="79" r="9" fill="#14171a" />
      <rect x="64" y="58" width="34" height="22" rx="2" fill="#dfe6ea" opacity="0.9" />
      <circle cx="136" cy="58" r="2.4" fill={c.highlight} />
      <rect x="55" y="94" width="90" height="4" fill={c.accent} opacity="0.3" />
    </g>
  );
}

function Bridge({ c }) {
  return (
    <g>
      <rect x="42" y="55" width="95" height="55" rx="7" fill={c.body} stroke={c.accent} strokeWidth="1.5" />
      <rect x="118" y="30" width="46" height="46" rx="20" fill={c.shade} stroke={c.accent} strokeWidth="1.5" />
      <circle cx="141" cy="53" r="19" fill="#14171a" />
      <circle cx="135" cy="47" r="5" fill="url(#glassGlare)" />
      <rect x="52" y="35" width="30" height="18" rx="4" fill={c.body} stroke={c.accent} strokeWidth="1.2" />
      <rect x="55" y="64" width="26" height="17" rx="2" fill="#dfe6ea" opacity="0.85" />
      <rect x="46" y="88" width="40" height="8" rx="2" fill={c.accent} opacity="0.55" />
      <rect x="150" y="20" width="8" height="12" rx="2" fill={c.accent} />
    </g>
  );
}

function Rugged({ c }) {
  return (
    <g>
      <rect x="48" y="48" width="100" height="62" rx="12" fill={c.body} stroke={c.accent} strokeWidth="2" />
      <rect x="48" y="48" width="100" height="62" rx="12" fill="none" stroke={c.highlight} strokeWidth="1" strokeDasharray="3 4" opacity="0.5" />
      <circle cx="128" cy="79" r="18" fill={c.shade} stroke={c.accent} strokeWidth="1.5" />
      <circle cx="128" cy="79" r="10" fill="#14171a" />
      <rect x="58" y="58" width="30" height="18" rx="2" fill="#dfe6ea" opacity="0.85" />
      <rect x="52" y="52" width="10" height="10" rx="2" fill={c.accent} opacity="0.7" />
      <rect x="52" y="98" width="90" height="6" rx="2" fill={c.accent} opacity="0.6" />
    </g>
  );
}

function Mirrorless({ c }) {
  return (
    <g>
      <rect x="50" y="52" width="88" height="52" rx="6" fill={c.body} stroke={c.accent} strokeWidth="1.5" />
      <rect x="50" y="52" width="88" height="14" rx="6" fill={c.highlight} opacity="0.5" />
      <rect x="66" y="40" width="24" height="14" rx="2" fill={c.shade} stroke={c.accent} strokeWidth="1" />
      <circle cx="102" cy="80" r="26" fill={c.accent} />
      <circle cx="102" cy="80" r="20" fill="#1a1d20" />
      <circle cx="102" cy="80" r="12" fill="#0c0e10" />
      <circle cx="96" cy="73" r="4" fill="url(#glassGlare)" />
      <rect x="60" y="60" width="6" height="6" fill={c.highlight} />
    </g>
  );
}
