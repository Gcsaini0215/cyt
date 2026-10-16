import { create } from "zustand";
import { fetchById, postData } from "../utils/actions";
import { clientNotifUrl, clientNotifReadUrl, clientNotifStreamUrl } from "../utils/url";
import { getToken } from "../utils/jwt";
import { playChime } from "../utils/notif-sound";

/* Client portal notifications (the bell) — the client-side twin of store/notifStore.js.
   Saved on the server and pushed live over one EventSource per tab: session confirmed, therapist
   joined, starting soon, moved, completed, cancelled, referral credit. The stream also sends a
   "bookings" event whenever a session changes; pages listen for `cyt:client-bookings` and refetch,
   so the dashboard updates without a refresh. No stream → a 30s poll keeps things current. */

export const CLIENT_BOOKINGS_EVENT = "cyt:client-bookings";
const URGENT = new Set(["joined", "soon"]);
const TOAST_KEY = "cyt_cl_notif_toasted_at";
const MAX_TOASTS = 3;

let es = null;
let poll = null;
let retryTimer = null;
let subs = 0;

const readToasted = () => { try { return Number(localStorage.getItem(TOAST_KEY)) || 0; } catch (e) { return 0; } };
const writeToasted = (t) => { try { localStorage.setItem(TOAST_KEY, String(t)); } catch (e) { /* storage blocked */ } };
const bookingsChanged = () => { if (typeof window !== "undefined") window.dispatchEvent(new Event(CLIENT_BOOKINGS_EVENT)); };

// portal open in a background tab → a system notification too (only if the client allowed them)
function systemNotify(list) {
  try {
    if (typeof window === "undefined" || !document.hidden || !("Notification" in window) || Notification.permission !== "granted") return;
    list.slice(0, 2).forEach((n) => {
      const sn = new Notification(n.title, { body: n.body || "", icon: "/favicon.ico", tag: n._id });
      sn.onclick = () => { window.focus(); if (n.link) window.location.assign(n.link); sn.close(); };
    });
  } catch (e) { /* not supported here */ }
}

const useClientNotifStore = create((set, get) => ({
  items: [],
  unread: 0,
  loaded: false,
  toasts: [],

  _toast: (list) => {
    const seenAt = readToasted();
    const fresh = list.filter((n) => !n.read && new Date(n.createdAt).getTime() > seenAt);
    if (!fresh.length) return;
    writeToasted(Math.max(...fresh.map((n) => new Date(n.createdAt).getTime())));
    playChime(fresh.some((n) => URGENT.has(n.type)) ? "urgent" : "normal");
    systemNotify(fresh);
    set((s) => {
      const have = new Set(s.toasts.map((t) => t._id));
      return { toasts: [...fresh.filter((n) => !have.has(n._id)).reverse(), ...s.toasts].slice(0, MAX_TOASTS) };
    });
  },

  fetch: async ({ toast = false } = {}) => {
    try {
      const r = await fetchById(clientNotifUrl);
      if (!r?.status) return;
      const items = r.data.items || [];
      const first = !get().loaded;
      set({ items, unread: r.data.unread || 0, loaded: true });
      if (first) {
        // first visit on this browser: don't replay old history — only the last day
        if (!readToasted()) writeToasted(Date.now() - 24 * 3600e3);
        get()._toast(items.slice(0, 2));
      } else if (toast) get()._toast(items);
    } catch (e) { /* offline or older backend — keep what we have */ }
  },

  receive: (n) => {
    set((s) => (s.items.some((x) => x._id === n._id) ? s : { items: [n, ...s.items].slice(0, 60), unread: s.unread + (n.read ? 0 : 1) }));
    get()._toast([n]);
  },

  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t._id !== id) })),

  markRead: async (ids) => {
    const all = !ids;
    set((s) => ({
      items: s.items.map((n) => (all || ids.includes(n._id) ? { ...n, read: true } : n)),
      unread: all ? 0 : Math.max(0, s.unread - s.items.filter((n) => !n.read && ids.includes(n._id)).length),
      toasts: all ? [] : s.toasts.filter((t) => !ids.includes(t._id)),
    }));
    try {
      const r = await postData(clientNotifReadUrl, all ? {} : { ids });
      if (r?.status) set({ unread: r.data.unread });
    } catch (e) { /* the next refresh corrects it */ }
  },
}));

function startPoll() {
  if (!poll) poll = setInterval(() => { if (!document.hidden) { useClientNotifStore.getState().fetch({ toast: true }); bookingsChanged(); } }, 30000);
}
function stopPoll() { if (poll) { clearInterval(poll); poll = null; } }

function open() {
  const token = getToken();
  if (!token || typeof EventSource === "undefined") { startPoll(); return; }
  es = new EventSource(`${clientNotifStreamUrl}?token=${encodeURIComponent(token)}`);
  const watchdog = setTimeout(startPoll, 8000); // no hello in 8s → events aren't getting through
  es.addEventListener("hello", () => {
    clearTimeout(watchdog);
    stopPoll();
    useClientNotifStore.getState().fetch({ toast: true }); // (re)connected: catch up
  });
  es.addEventListener("notif", (e) => { try { useClientNotifStore.getState().receive(JSON.parse(e.data)); } catch (err) { /* bad frame */ } });
  es.addEventListener("bookings", bookingsChanged);
  es.addEventListener("read", () => { useClientNotifStore.getState().fetch(); });
  es.onerror = () => {
    startPoll();
    if (es && es.readyState === 2) {
      es = null;
      clearTimeout(retryTimer);
      retryTimer = setTimeout(() => { if (subs > 0 && !es) open(); }, 30000);
    }
  };
}

const onVisible = () => { if (!document.hidden) { useClientNotifStore.getState().fetch({ toast: true }); bookingsChanged(); } };

// the client shell calls this once it knows a client is signed in
export function connectClientNotifications() {
  subs += 1;
  if (subs === 1) {
    useClientNotifStore.getState().fetch();
    open();
    document.addEventListener("visibilitychange", onVisible);
  }
  return () => {
    subs -= 1;
    if (subs === 0) {
      if (es) { es.close(); es = null; }
      stopPoll();
      clearTimeout(retryTimer);
      document.removeEventListener("visibilitychange", onVisible);
    }
  };
}

export default useClientNotifStore;
