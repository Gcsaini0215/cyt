import { THERAPIST_SHELL_ROUTES } from "../components/therapists/shell-routes";

/* Two installable apps on one site (2026-11-21): the client "CYT" app (manifest.json) and the
   "CYT Therapist" app (manifest-therapist.json). Therapist portal pages point at the therapist manifest
   (and iPhone's home-screen icon + name), so "Install" there gives the therapist app with its own icon that
   opens on the dashboard. _document sets it on the first load, _app keeps it right on page changes. */
// route patterns (router.pathname / __NEXT_DATA__.page)
export const isTherapistPage = (route = "") => {
  const p = String(route).split("?")[0];
  return p === "/therapist-app" || p === "/therapist-questionnaires" || p.startsWith("/therapists/") || THERAPIST_SHELL_ROUTES.has(p);
};
export const appMeta = (route) => (isTherapistPage(route)
  ? { manifest: "/manifest-therapist.json", appleIcon: "/icons/cyt-therapist-apple-180.png", title: "CYT Therapist" }
  : { manifest: "/manifest.json", appleIcon: "/apple-icon.png", title: "CYT" });

export function syncAppMeta(route) {
  if (typeof document === "undefined") return;
  const m = appMeta(route);
  const set = (sel, attr, v) => { const el = document.querySelector(sel); if (el && el.getAttribute(attr) !== v) el.setAttribute(attr, v); };
  set('link[rel="manifest"]', "href", m.manifest);
  set('link[rel="apple-touch-icon"]', "href", m.appleIcon);
  set('meta[name="apple-mobile-web-app-title"]', "content", m.title);
}
