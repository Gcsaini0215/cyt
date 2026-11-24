import React from "react";

/* Verified tick beside a name in the chats (owner, 2026-11-25): green = the CYT Care Team, blue = a CYT therapist. */
export const TICK = { team: "#16a34a", therapist: "#1d9bf0" };

export default function VTick({ kind = "therapist", size = 15 }) {
  const label = kind === "team" ? "Official CYT team" : "Verified CYT therapist";
  return (
    <svg className="vtick" viewBox="0 0 24 24" width={size} height={size} style={{ width: size, height: size, minWidth: size, minHeight: size }} preserveAspectRatio="xMidYMid meet" role="img" aria-label={label}>
      <title>{label}</title>
      <path fill={TICK[kind] || TICK.therapist} d="M12.00 0.80L14.56 2.44L17.60 2.30L19.00 5.00L21.70 6.40L21.56 9.44L23.20 12.00L21.56 14.56L21.70 17.60L19.00 19.00L17.60 21.70L14.56 21.56L12.00 23.20L9.44 21.56L6.40 21.70L5.00 19.00L2.30 17.60L2.44 14.56L0.80 12.00L2.44 9.44L2.30 6.40L5.00 5.00L6.40 2.30L9.44 2.44Z" />
      <path fill="#fff" d="M10.5 16.2 6.8 12.5l1.5-1.5 2.2 2.2 5.2-5.2 1.5 1.5z" />
    </svg>
  );
}

export const VTICK_CSS = `.vtick { display: inline-block !important; flex: 0 0 auto !important; aspect-ratio: 1 / 1; max-width: none !important; vertical-align: -2px; margin-left: 4px; }`;
