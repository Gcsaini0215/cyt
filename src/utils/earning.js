/* What a therapist earns from one booking: their share of the session amount — 70% to start, more as they earn
   achievements (stamped on the booking when the session is completed; backend helper/achievements.js)
   (backend helper/payoutSplit.js; /get-bookings sends it on every booking as therapist_share).
   A cancelled session earns nothing. Use this wherever the therapist portal counts money. */
export const THERAPIST_PCT = 70;
export const earningOf = (b) => (!b || b.status === "Cancelled" ? 0 : Number(b.therapist_share) || 0);
