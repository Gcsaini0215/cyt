/* Microsoft Clarity (heatmaps + session replays) for chooseyourtherapist.in.
   This is a mental-health site, so:
   - it follows the cookie card: "Only essential" (analytics off) = Clarity never loads, and
     switching analytics off later tells Clarity to stop storing cookies (consentv2 denied);
   - it never starts on a private page (client/therapist/trainee portals, reports, worksheets,
     chat, checkout…), and if a visitor moves from a public page into a private one, the whole
     page is masked (data-clarity-mask) so no text from it reaches a replay;
   - form fields are masked by Clarity itself. */
import { useEffect } from "react";
import { useRouter } from "next/router";

const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID || "zk9t29jd2i";
const CONSENT_KEY = "cookie_consent_v2";

// Pages with personal or clinical information: never recorded.
const PRIVATE = [
  /^\/client(\/|$)/, /^\/therapists(\/|$)/, /^\/trainee(\/|$)/, /^\/my-/,
  /^\/assessment-report/, /^\/self-assessment\//, /^\/verify-report/, /^\/worksheet/, /^\/invoice/,
  /^\/ai-chat/, /^\/ai-affirmation/, /^\/case-history/, /^\/clinic-patients/, /^\/create-report/,
  /^\/add-offline-client/, /^\/appointments?(\/|$)/, /^\/therapist-dashboard/, /^\/therapist-questionnaires/,
  /^\/therapist-complete/, /^\/therapist-reupload/, /^\/therapist-payment/, /^\/therapist-checkout/,
  /^\/complete-payment/, /^\/payment-success/, /^\/settings/, /^\/supervision/, /^\/abha-preview/,
  /^\/probono-therapist\//, /^\/noida-review/, /^\/coupon\//, /^\/success/,
];
export const isPrivatePath = (path) => PRIVATE.some((r) => r.test(path || ""));

const analyticsAllowed = () => {
  try {
    const c = JSON.parse(localStorage.getItem(CONSENT_KEY) || "null");
    return c ? !!c.analytics : true; // same default as Google consent mode in _document.js
  } catch {
    return true;
  }
};

const sendConsent = (on) => {
  try {
    const v = on ? "granted" : "denied";
    window.clarity?.("consentv2", { ad_Storage: "denied", analytics_Storage: v });
  } catch { /* analytics never blocks the page */ }
};

const loadClarity = () => {
  if (typeof window === "undefined" || window.__cytClarity) return;
  window.__cytClarity = true;
  window.clarity = window.clarity || function clarity() { (window.clarity.q = window.clarity.q || []).push(arguments); };
  sendConsent(true);
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.clarity.ms/tag/${CLARITY_ID}`;
  document.head.appendChild(s);
};

export default function Clarity() {
  const router = useRouter();
  const path = router.asPath.split(/[?#]/)[0];

  useEffect(() => {
    const priv = isPrivatePath(path);
    // mask a private page completely if Clarity is already running from an earlier public page
    if (priv) document.body.setAttribute("data-clarity-mask", "true");
    else document.body.removeAttribute("data-clarity-mask");
    if (!priv && analyticsAllowed()) loadClarity();
  }, [path]);

  // cookie card changes (cookie-consent.js fires "cyt:consent")
  useEffect(() => {
    const onConsent = (e) => {
      const on = !!e?.detail?.analytics;
      if (window.__cytClarity) sendConsent(on);
      else if (on && !isPrivatePath(window.location.pathname)) loadClarity();
    };
    window.addEventListener("cyt:consent", onConsent);
    return () => window.removeEventListener("cyt:consent", onConsent);
  }, []);

  return null;
}
