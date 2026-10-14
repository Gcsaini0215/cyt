import { fetchById } from "./actions";
import { getBookings } from "./url";

// The therapist portal asks for the same booking list from several places at once (dashboard,
// top-bar new-booking poll, availability reminder). Share one request and reuse the answer briefly.
let inflight = null;
let cached = null;
let cachedAt = 0;

export function fetchBookingsShared(maxAgeMs = 15000) {
  if (cached && Date.now() - cachedAt < maxAgeMs) return Promise.resolve(cached);
  if (inflight) return inflight;
  inflight = fetchById(getBookings)
    .then((r) => { cached = r; cachedAt = Date.now(); return r; })
    .finally(() => { inflight = null; });
  return inflight;
}
