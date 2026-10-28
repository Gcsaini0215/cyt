// Session packs — the sizes and discounts on sale come from the backend (GET /session-packs, set in
// Admin → Pack Pricing), which also prices the pack when it's booked. This only works out what to show.
export const packTotal = (fee, size, packs) => {
  const p = (packs || []).find((x) => x.size === size);
  return p && fee > 0 ? Math.round((fee * size * (100 - p.pct)) / 100) : 0;
};
