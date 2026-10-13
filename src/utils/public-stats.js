// Live trust numbers for badges across the site: sessions booked so far (online bookings with
// therapists + Noida centre bookings) and the Google rating of the CYT Business Profile.
// Source: GET /api/public/stats (backend counts, cached ~10 min). The fallback is only used
// until the first response arrives or if the API is unreachable — keep it close to the truth.
import { useEffect, useState } from "react";
import { apiUrl } from "./url";

export const STATS_FALLBACK = { sessions: { total: 5100 }, google: { rating: 5.0, count: 183 } };
const KEY = "cyt_public_stats_v1";

const valid = (d) => d && d.sessions && typeof d.sessions.total === "number" && d.google && typeof d.google.rating === "number";

export async function fetchPublicStats(timeoutMs = 5000) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    const r = await fetch(`${apiUrl}/public/stats`, { signal: ctrl.signal });
    clearTimeout(t);
    const j = await r.json();
    return valid(j?.data) ? j.data : STATS_FALLBACK;
  } catch {
    return STATS_FALLBACK;
  }
}

// client hook — instant from this tab's cache, then refreshed from the API
export function usePublicStats(initial) {
  const [stats, setStats] = useState(() => (valid(initial) ? initial : STATS_FALLBACK));
  useEffect(() => {
    try {
      const cached = JSON.parse(sessionStorage.getItem(KEY) || "null");
      if (valid(cached)) setStats(cached);
    } catch { /* storage blocked */ }
    let alive = true;
    fetchPublicStats().then((d) => {
      if (!alive || d === STATS_FALLBACK) return;
      setStats(d);
      try { sessionStorage.setItem(KEY, JSON.stringify(d)); } catch { /* ignore */ }
    });
    return () => { alive = false; };
  }, []);
  return stats;
}

// "100+" / "1,240+"
export const sessionsText = (s) => `${Number(s?.sessions?.total || 0).toLocaleString("en-IN")}+`;
// "5.0"
export const ratingText = (s) => Number(s?.google?.rating || 5).toFixed(1);
// "183"
export const reviewsText = (s) => Number(s?.google?.count || 0).toLocaleString("en-IN");
