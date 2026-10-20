import { apiUrl } from "./url";
import { getToken } from "./jwt";

/* Profile insights tracking (backend: /api/profile-stats). Nothing personal is sent — a random
   browser id (for "unique visitors"), where the visitor came from, and what they clicked.
   The token goes along only so a therapist looking at their own profile isn't counted. */

const store = (fn, fallback = null) => { try { return fn(); } catch { return fallback; } };

export function visitorId() {
  return store(() => {
    let v = localStorage.getItem("cyt_vid");
    if (!v) {
      v = (crypto.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`).slice(0, 36);
      localStorage.setItem("cyt_vid", v);
    }
    return v;
  }, "");
}

// remembered by _app on every page change, so an in-site visit knows which page led here
export const LAST_PATH_KEY = "cyt_last_path";

export function sourceOf() {
  return store(() => {
    const q = new URLSearchParams(window.location.search);
    const utm = String(q.get("utm_source") || q.get("src") || "").toLowerCase();
    if (/whatsapp|^wa$|facebook|instagram|^fb$|^ig$|linkedin|twitter|^x$|telegram|youtube/.test(utm)) return "social";
    if (/google/.test(utm)) return "google";
    const prev = sessionStorage.getItem(LAST_PATH_KEY) || "";
    if (prev) {
      if (prev === "/") return "home";
      if (prev.startsWith("/view-all-therapist") || prev.startsWith("/client/find")) return "directory";
      if (prev.startsWith("/psychologist-in") || prev.startsWith("/therapy-for") || prev.startsWith("/noida")) return "city";
      if (prev.startsWith("/blog")) return "blog";
      return "other";
    }
    const ref = document.referrer || "";
    if (!ref) return "direct";
    const host = store(() => new URL(ref).hostname, "");
    if (/google\.|bing\.|duckduckgo|yahoo\.|yandex/.test(host)) return "google";
    if (/facebook|instagram|whatsapp|t\.co|twitter|linkedin|telegram|youtube|lnkd/.test(host)) return "social";
    if (/chooseyourtherapist/.test(host)) return "other";
    return "other";
  }, "other");
}

function send(path, body) {
  const headers = { "Content-Type": "application/json" };
  const tok = getToken();
  if (tok) headers.Authorization = `Bearer ${tok}`;
  return fetch(`${apiUrl}${path}`, { method: "POST", headers, body: JSON.stringify(body), keepalive: true }).catch(() => {});
}

// a view per profile visit (a quick refresh within 2 minutes isn't another view);
// the server counts at most 3 views a day from the same browser
export function trackProfileView(therapistId) {
  if (!therapistId) return;
  const key = `cyt_pv_${therapistId}`;
  const last = Number(store(() => sessionStorage.getItem(key), 0)) || 0;
  if (Date.now() - last < 2 * 60000) return;
  store(() => sessionStorage.setItem(key, String(Date.now())));
  send("/profile-stats/event", { t: therapistId, type: "view", vid: visitorId(), src: sourceOf() });
}

// book | contact | share — once per profile per page view is plenty
const clicked = new Set();
export function trackProfileAction(therapistId, type) {
  if (!therapistId || clicked.has(`${therapistId}:${type}`)) return;
  clicked.add(`${therapistId}:${type}`);
  send("/profile-stats/event", { t: therapistId, type, vid: visitorId() });
}

// cards shown in the directory / search — each therapist counted once per browser session
export function trackImpressions(ids) {
  const seen = new Set(store(() => JSON.parse(sessionStorage.getItem("cyt_imp") || "[]"), []));
  const fresh = [...new Set((ids || []).filter(Boolean).map(String))].filter((id) => !seen.has(id));
  if (!fresh.length) return;
  fresh.forEach((id) => seen.add(id));
  store(() => sessionStorage.setItem("cyt_imp", JSON.stringify([...seen].slice(-400))));
  send("/profile-stats/impressions", { ids: fresh.slice(0, 80) });
}

// live "viewing now": ping every 20 s while the profile is open and the tab is visible; say goodbye on leave
export function startProfilePresence(therapistId) {
  if (!therapistId) return () => {};
  const vid = visitorId();
  if (!vid) return () => {};
  let timer = null;
  const ping = (leave = false) => send("/profile-stats/presence", { t: therapistId, vid, ...(leave ? { leave: true } : {}) });
  const startTimer = () => { if (!timer) { ping(); timer = setInterval(() => ping(), 20000); } };
  const stopTimer = (leave) => { if (timer) { clearInterval(timer); timer = null; } if (leave) ping(true); };
  const onVis = () => (document.visibilityState === "visible" ? startTimer() : stopTimer(true));
  const onHide = () => stopTimer(true);
  if (document.visibilityState === "visible") startTimer();
  document.addEventListener("visibilitychange", onVis);
  window.addEventListener("pagehide", onHide);
  return () => {
    document.removeEventListener("visibilitychange", onVis);
    window.removeEventListener("pagehide", onHide);
    stopTimer(true);
  };
}
