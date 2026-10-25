// Keep <title> and meta description inside what Google shows (~580 px ≈ 60 characters for a
// title, ~158 characters for a description) — longer ones get cut off with "…" in results
// and were flagged by the Seobility audit (2026-10-25).

const TITLE_MAX = 60;
const DESC_MAX = 158;

// "Main | Choose Your Therapist" if it fits, else "Main | CYT", else just the main part.
export function fitTitle(main, max = TITLE_MAX) {
  const m = String(main || "").trim();
  for (const brand of ["Choose Your Therapist", "CYT"]) {
    const t = `${m} | ${brand}`;
    if (t.length <= max) return t;
  }
  return m.length <= max ? m : `${m.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
}

// Whole sentences while they fit; otherwise cut at a word and end with "…".
export function fitDesc(text, max = DESC_MAX) {
  const s = String(text || "").replace(/\s+/g, " ").trim();
  if (s.length <= max) return s;
  const cut = s.slice(0, max + 1);
  const end = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
  if (end >= 90) return s.slice(0, end + 1);
  return `${s.slice(0, max - 1).replace(/[\s,;:—–-]+\S*$/, "")}…`;
}
