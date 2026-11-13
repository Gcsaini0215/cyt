import { useEffect } from "react";
import { getDecodedToken, getToken } from "./jwt";
import { apiUrl } from "./url";

/* Logged-in clients and therapists tell the server "I'm here" every ~45 s while the tab is visible, so Admin → Client 360
   can show who is online right now (and "last seen" stays true). Only the page path, device class and
   whether it's the installed app are sent. Therapists are tracked too (Therapist 360); admins are not. */
const EVERY_MS = 45 * 1000;

const device = () => {
  const w = window.innerWidth;
  const touch = window.matchMedia?.("(pointer: coarse)")?.matches;
  return w < 768 ? "mobile" : touch && w <= 1400 ? "tablet" : "desktop";
};
const isApp = () => !!(window.navigator.standalone || window.matchMedia?.("(display-mode: standalone)")?.matches);

export default function useClientPresence(router) {
  useEffect(() => {
    let timer;
    const client = () => {
      const t = getDecodedToken();
      return t && (t.role === 0 || t.role === 1) && (!t.exp || t.exp * 1000 > Date.now()) ? getToken() : null;
    };
    const send = (body) => {
      const token = client();
      if (!token) return;
      fetch(`${apiUrl}/me/presence`, {
        method: "POST", keepalive: true,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      }).catch(() => {});
    };
    const ping = () => { if (document.visibilityState === "visible") send({ path: window.location.pathname, device: device(), app: isApp() }); };
    const start = () => { clearInterval(timer); ping(); timer = setInterval(ping, EVERY_MS); };
    const onVis = () => { if (document.visibilityState === "visible") start(); else clearInterval(timer); };
    const onLeave = () => send({ leave: true });
    const onRoute = () => ping();
    start();
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pagehide", onLeave);
    router?.events?.on("routeChangeComplete", onRoute);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pagehide", onLeave);
      router?.events?.off("routeChangeComplete", onRoute);
    };
  }, [router]);
}
