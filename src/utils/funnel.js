import { apiUrl } from "./url";

// Booking-funnel step counts (Phase 3, 2026-11-15). Sends ONLY the step name, guest/member and
// online/in-person — no ids, names, emails, phones or amounts. Each step is counted once per
// browser tab per therapist, so a visitor clicking around doesn't inflate the numbers.
// Steps: see FUNNEL_STEPS in the backend's controllers/FunnelController.js.
export function trackFunnel(step, { guest = false, mode = "", therapist = "" } = {}) {
  if (typeof window === "undefined") return;
  try {
    const key = `cyt_fn_${step}_${therapist}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
  } catch (e) {
    // storage blocked — still count it
  }
  const m = mode === "in-person" || mode === "inperson" ? "inperson" : mode ? "online" : "na";
  try {
    fetch(`${apiUrl}/funnel/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ e: step, g: guest ? "guest" : "member", m }),
      keepalive: true, // still sent if the page is navigating away (e.g. to Razorpay / checkout)
    }).catch(() => {});
  } catch (e) {
    // never let tracking break booking
  }
}
