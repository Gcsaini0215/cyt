import { apiUrl } from "./url";
import { visitorId } from "./profile-stats";

/* Visitors who arrive from an AI assistant (ChatGPT, Perplexity, Gemini, Copilot, Claude …) —
   recognised by the referrer, or the utm_source the assistant adds to links (ChatGPT adds
   utm_source=chatgpt.com). The arrival is reported once (backend: /api/ai-visits), and if the same
   browser later sends an enquiry or books, that's reported too — shown on the admin Overview.
   Nothing personal is sent: an anonymous browser id, which assistant, and the landing page. */

const KEY = "cyt_ai";
const store = (fn, fallback = null) => { try { return fn(); } catch { return fallback; } };

const RULES = [
  ["chatgpt", /(^|\.)chatgpt\.com$|(^|\.)chat\.openai\.com$|^openai$|chatgpt/],
  ["perplexity", /perplexity/],
  ["gemini", /gemini\.google\.com$|bard\.google\.com$|^gemini$/],
  ["copilot", /copilot\.microsoft\.com$|^copilot$/],
  ["claude", /(^|\.)claude\.ai$|^claude$/],
  ["other", /(^|\.)(you\.com|phind\.com|meta\.ai|poe\.com|deepseek\.com|chat\.deepseek\.com|grok\.com|kagi\.com)$/],
];
const match = (s) => (RULES.find(([, re]) => re.test(s)) || [])[0] || null;

export function detectAiSource() {
  return store(() => {
    const utm = new URLSearchParams(window.location.search).get("utm_source");
    if (utm) { const m = match(utm.toLowerCase()); if (m) return m; }
    const ref = document.referrer ? new URL(document.referrer).hostname.toLowerCase() : "";
    return ref && ref !== window.location.hostname ? match(ref) : null;
  }, null);
}

const send = (path, body) => store(() => {
  const url = `${apiUrl}${path}`;
  // fetch + keepalive (not sendBeacon: a JSON beacon to another origin — api. — is blocked by Chrome)
  fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), keepalive: true }).catch(() => {});
});

// _app calls this on the first page of a visit
export function reportAiArrival() {
  const source = detectAiSource();
  if (!source) return;
  if (store(() => sessionStorage.getItem(KEY))) return; // once per visit
  store(() => sessionStorage.setItem(KEY, source));
  store(() => localStorage.setItem(KEY, JSON.stringify({ source, at: Date.now() })));
  send("/ai-visits", { source, landing: window.location.pathname, vid: visitorId() });
}

// an enquiry ("lead") or a booking ("booked") — counted only if this browser came from an AI in the last 30 days
export function reportAiConversion(kind) {
  const seen = store(() => JSON.parse(localStorage.getItem(KEY) || "null"));
  if (!seen?.at || Date.now() - seen.at > 30 * 86400 * 1000) return;
  send("/ai-visits/convert", { vid: visitorId(), kind });
}
