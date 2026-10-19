/* A CYT Noida centre session appears in the dashboards as a Booking worth ₹0 (the client paid CYT,
   so it never counts as the therapist's earning). What the client actually paid is in noida_amount —
   this copy shows that amount on the session details and the invoice. Other bookings pass through. */
export function withNoidaCharges(b) {
  if (!b || b.source !== "noida" || b.noida_amount == null) return b;
  const via = b.noida_paid_via ? `CYT Noida · ${b.noida_paid_via}` : "CYT Noida";
  return { ...b, amount: b.noida_amount, transaction: { ...(b.transaction || {}), amount: b.noida_amount, payment_method: via } };
}

// a Noida session has an invoice only when money was paid for it (a package session is prepaid)
export const hasNoidaInvoice = (b) => b?.source === "noida" && Number(b.noida_amount) > 0;
