// A therapist whose PAID listing plan has run out stays live in the directory (/view-all-therapist,
// their profile, city / concern pages) but isn't shown on the home page until they renew.
// Free listings (no plan, or a "free" grant) are never affected.
export const PAID_PLANS = ["1_month", "3_month", "6_month", "annual"];

export function planLapsed(t, now = Date.now()) {
  if (!t || !PAID_PLANS.includes(t.subscription_plan)) return false;
  const exp = t.subscription_expires_at ? new Date(t.subscription_expires_at).getTime() : NaN;
  return Number.isFinite(exp) && exp <= now;
}

export const onHomePage = (list = []) => list.filter((t) => !planLapsed(t));
