/* What a therapist earns from one booking: their 70% of the session amount — CYT keeps 30%
   (backend helper/payoutSplit.js; /get-bookings sends it on every booking as therapist_share).
   A cancelled session earns nothing. Use this wherever the therapist portal counts money. */
export const THERAPIST_PCT = 70;
export const earningOf = (b) => (!b || b.status === "Cancelled" ? 0 : Number(b.therapist_share) || 0);
