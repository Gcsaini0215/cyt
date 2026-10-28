// Session packs — the same sizes and discounts the backend charges (helper/sessionBundle.js PACKS).
// The server prices the pack itself; these are for showing it.
export const PACKS = [{ size: 4, pct: 5 }, { size: 6, pct: 10 }];
export const PACK_DAYS = 90;

export const packTotal = (fee, size) => {
  const p = PACKS.find((x) => x.size === size);
  return p && fee > 0 ? Math.round((fee * size * (100 - p.pct)) / 100) : 0;
};
