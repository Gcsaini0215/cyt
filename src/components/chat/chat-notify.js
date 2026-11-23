import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/router";
import { apiUrl } from "../../utils/url";
import { getToken, getDecodedToken } from "../../utils/jwt";
import { postData } from "../../utils/actions";

/* Message alerts (2026-11-23, owner):
   - In the app: a soft three-note chime (our own, made with Web Audio — not Apple's tone) + a banner at the top,
     on any portal page. Not for the chat that's open on screen.
   - Phone closed / app in the background: a phone notification (web push, the phone's own sound and pop-up).
     Turned on with a tap (iPhone only allows it from a tap, and only in the installed app). */

const VAPID_PUBLIC_KEY = "BM-eSBc4K9UwksrkgfGhkCYlz6zcSo8qdWflowLTDB6CZ07cMnCIcBr_9hTPUaBhMnzKFM7DtR3cvcM1K3pUivA";
const SOUND = "cyt_chat_sound";

export const soundOn = () => { try { return localStorage.getItem(SOUND) !== "0"; } catch { return true; } };
export const setSound = (on) => { try { localStorage.setItem(SOUND, on ? "1" : "0"); } catch { /* private mode */ } };

let ctx = null;
export function playChime() {
  if (!soundOn()) return;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = ctx || new AC();
    if (ctx.state === "suspended") ctx.resume();
    const t0 = ctx.currentTime + 0.01;
    // three quick rising notes, bell-like (sine + a soft overtone), quick fade
    [[1046.5, 0], [1318.5, 0.11], [1568, 0.22]].forEach(([f, dt]) => {
      for (const [mult, vol] of [[1, 0.16], [2, 0.035]]) {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = "sine"; o.frequency.value = f * mult;
        g.gain.setValueAtTime(0.0001, t0 + dt);
        g.gain.exponentialRampToValueAtTime(vol, t0 + dt + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dt + 0.42);
        o.connect(g).connect(ctx.destination);
        o.start(t0 + dt); o.stop(t0 + dt + 0.45);
      }
    });
  } catch { /* no audio */ }
}

const b64 = (s) => { const p = "=".repeat((4 - (s.length % 4)) % 4); const raw = window.atob((s + p).replace(/-/g, "+").replace(/_/g, "/")); return Uint8Array.from(raw, (c) => c.charCodeAt(0)); };
export const pushSupported = () => typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
export const pushState = () => (!pushSupported() ? "unsupported" : Notification.permission); // default | granted | denied | unsupported
const isIOS = () => typeof navigator !== "undefined" && (/iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));
const standalone = () => { try { return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true; } catch { return false; } };
export const iosNeedsInstall = () => isIOS() && !standalone();

// call from a tap
export async function enablePush() {
  if (!pushSupported()) return "unsupported";
  const perm = await Notification.requestPermission();
  if (perm !== "granted") return perm;
  const reg = await navigator.serviceWorker.ready;
  const sub = (await reg.pushManager.getSubscription()) || (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(VAPID_PUBLIC_KEY) }));
  await postData(`${apiUrl}/live-chat/push-subscribe`, { subscription: sub.toJSON() });
  return "granted";
}
// already allowed: make sure this phone is linked to the signed-in account (quietly)
export async function syncPush() {
  try {
    if (pushState() !== "granted") return;
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) await postData(`${apiUrl}/live-chat/push-subscribe`, { subscription: sub.toJSON() });
  } catch { /* fine */ }
}

// the app-wide listener, mounted once in _app for signed-in clients and therapists
export default function ChatNotifier() {
  const router = useRouter();
  const [toast, setToast] = useState(null);
  const timer = useRef(null);
  const role = useRef(null);
  const path = useRef(router.asPath);
  path.current = router.asPath;

  useEffect(() => {
    const d = getDecodedToken();
    if (!d || (d.role !== 0 && d.role !== 1) || typeof EventSource === "undefined") return undefined;
    role.current = d.role === 1 ? "therapist" : "client";
    syncPush();
    const es = new EventSource(`${apiUrl}/live-chat/stream?token=${encodeURIComponent(getToken() || "")}`);
    es.addEventListener("message", (e) => {
      const { threadId, message } = JSON.parse(e.data || "{}");
      if (!message || message.fromRole === role.current || message.fromRole === "system") return;
      // the chat that's open and visible already shows it
      if (window.__lcActive === threadId && document.visibilityState === "visible") return;
      playChime();
      if (navigator.vibrate) try { navigator.vibrate(60); } catch { /* ignore */ }
      const base = role.current === "therapist" ? "/therapists/messages" : "/client/messages";
      setToast({ threadId, name: message.fromName || (role.current === "therapist" ? "Your client" : "Your therapist"), body: message.body, href: `${base}?t=${threadId}` });
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setToast(null), 6000);
    });
    return () => { es.close(); clearTimeout(timer.current); };
  }, []);

  if (!toast || typeof document === "undefined") return null;
  return createPortal((
    <button type="button" className="lcn" onClick={() => { setToast(null); router.push(toast.href); }}>
      <style>{CSS}</style>
      <span className="lcn-ic" aria-hidden="true">💬</span>
      <span className="lcn-m"><b>{toast.name}</b><small>{toast.body}</small></span>
      <span className="lcn-x" role="presentation" onClick={(e) => { e.stopPropagation(); setToast(null); }}>×</span>
    </button>
  ), document.body);
}

const CSS = `
.lcn { position: fixed; z-index: 100001; top: calc(10px + env(safe-area-inset-top, 0px)); left: 50%; transform: translateX(-50%); width: min(420px, calc(100vw - 24px));
  display: flex; align-items: center; gap: 12px; padding: 12px 14px; border: 0; border-radius: 20px; text-align: left; cursor: pointer; font: inherit; color: #1c1c1e;
  background: rgba(255,255,255,.94); backdrop-filter: saturate(1.6) blur(16px); -webkit-backdrop-filter: saturate(1.6) blur(16px);
  box-shadow: 0 18px 40px -16px rgba(0,0,0,.45), 0 0 0 1px rgba(0,0,0,.05); animation: lcnIn .35s cubic-bezier(.2,.9,.3,1.2); }
.lcn-ic { flex: none; width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center; font-size: 20px; background: linear-gradient(160deg, #5ad08a, #1f8a52); }
.lcn-m { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.lcn-m b { font-size: 14.5px; } .lcn-m small { font-size: 13.5px; color: #475569; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lcn-x { flex: none; width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center; background: #eef2f0; color: #6e6e73; font-size: 17px; }
@keyframes lcnIn { from { opacity: 0; transform: translate(-50%, -24px) scale(.96); } }
@media (prefers-reduced-motion: reduce) { .lcn { animation: none; } }
`;
