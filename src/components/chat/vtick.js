import React from "react";

/* Verified tick beside a name in the chats (owner, 2026-11-25): green = the CYT Care Team, blue = a CYT therapist. */
export const TICK = { team: "#16a34a", therapist: "#1d9bf0" };

export default function VTick({ kind = "therapist", size = 15 }) {
  const label = kind === "team" ? "Official CYT team" : "Verified CYT therapist";
  return (
    <svg className="vtick" viewBox="0 0 24 24" width={size} height={size} role="img" aria-label={label}>
      <title>{label}</title>
      <path fill={TICK[kind] || TICK.therapist} d="M12 1.6l2.5 1.8 3.1-.1 1 2.9 2.5 1.8-1 2.9 1 2.9-2.5 1.8-1 2.9-3.1-.1L12 22.4l-2.5-1.8-3.1.1-1-2.9-2.5-1.8 1-2.9-1-2.9 2.5-1.8 1-2.9 3.1.1z" />
      <path fill="#fff" d="M10.6 15.4 7.4 12.2l1.4-1.4 1.8 1.8 4.6-4.6 1.4 1.4z" />
    </svg>
  );
}

export const VTICK_CSS = `.vtick { display: inline-block; flex: none; vertical-align: -2px; margin-left: 4px; }`;
