import { create } from "zustand";
import { fetchById, postData } from "../utils/actions";
import { therapistNotifUrl, therapistNotifReadUrl, therapistNotifStreamUrl } from "../utils/url";
import { getToken } from "../utils/jwt";
import { playChime } from "../utils/notif-sound";

const URGENT = new Set(["booking", "joined"]);

// portal open in a background tab → also show a system notification (if the therapist allowed them)
function systemNotify(list) {
  try {
    if (typeof window === "undefined" || !document.hidden || !("Notification" in window) || Notification.permission !== "granted") return;
    list.slice(0, 3).forEach((n) => {
      const sn = new Notification(n.title, { body: n.body || "", icon: "/favicon.ico", tag: n._id });
      sn.onclick = () => { window.focus(); if (n.link) window.location.assign(n.link); sn.close(); };
    });
  } catch (e) { /* not supported here */ }
}

/* Therapist portal notifications (the bell). Saved on the server, so nothing is missed while the
   portal is closed, and pushed live over one EventSource per tab — a new booking, a client joining,
   a review or a notice from the CYT team shows up at once, without a refresh.
   If the live stream can't stay open (proxy, offline) it falls back to a 20s refresh; coming back to
   the tab or reconnecting refetches, and anything new found that way still pops up. */

const TOAST_KEY = "cyt_th_notif_toasted_at"; // newest createdAt this browser has already popped up
const MAX_TOASTS = 4;

let es = null;
let poll = null;
let retryTimer = null;
let subs = 0;

const readToasted = () => { try { return Number(localStorage.getItem(TOAST_KEY)) || 0; } catch (e) { return 0; } };
const writeToasted = (t) => { try { localStorage.setItem(TOAST_KEY, String(t)); } catch (e) { /* storage blocked */ } };

const useNotifStore = create((set, get) => ({
  items: [],
  unread: 0,
  loaded: false,
  toasts: [],

  // pop up whatever this browser hasn't shown yet (live events, or ones that came while away)
  _toast: (list) => {
    const seenAt = readToasted();
    const fresh = list.filter((n) => !n.read && new Date(n.createdAt).getTime() > seenAt);
    if (!fresh.length) return;
    writeToasted(Math.max(...fresh.map((n) => new Date(n.createdAt).getTime())));
    playChime(fresh.some((n) => URGENT.has(n.type)) ? "urgent" : "normal");
    systemNotify(fresh);
    // a new booking also opens the big booking popup and refreshes the dashboard
    if (fresh.some((n) => n.type === "booking") && typeof window !== "undefined") window.dispatchEvent(new Event("cyt:check-bookings"));
    // bookings already get the big booking popup — everything else pops up under the bell
    const pop = fresh.filter((n) => n.type !== "booking");
    if (!pop.length) return;
    set((s) => {
      const have = new Set(s.toasts.map((t) => t._id));
      return { toasts: [...pop.filter((n) => !have.has(n._id)).reverse(), ...s.toasts].slice(0, MAX_TOASTS) };
    });
  },

  fetch: async ({ toast = false } = {}) => {
    try {
      const r = await fetchById(therapistNotifUrl);
      if (!r?.status) return;
      const items = r.data.items || [];
      const first = !get().loaded;
      set({ items, unread: r.data.unread || 0, loaded: true });
      if (first) {
        // first visit on this browser: don't replay old history — only things from the last day
        if (!readToasted()) writeToasted(Date.now() - 24 * 3600e3);
        get()._toast(items.slice(0, 3));
      } else if (toast) {
        get()._toast(items);
      }
    } catch (e) { /* offline or older backend — keep what we have */ }
  },

  receive: (n) => {
    set((s) => (s.items.some((x) => x._id === n._id) ? s : { items: [n, ...s.items].slice(0, 60), unread: s.unread + (n.read ? 0 : 1) }));
    get()._toast([n]);
    // something happened to a booking → open pages (Appointments) re-read it without a refresh
    if (typeof window !== "undefined" && ["booking", "joined", "cancelled", "session"].includes(n.type)) window.dispatchEvent(new Event("cyt:therapist-bookings"));
  },

  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t._id !== id) })),

  markRead: async (ids) => {
    const all = !ids;
    set((s) => {
      const items = s.items.map((n) => (all || ids.includes(n._id) ? { ...n, read: true } : n));
      const unread = all ? 0 : Math.max(0, s.unread - s.items.filter((n) => !n.read && ids.includes(n._id)).length);
      return { items, unread, toasts: all ? [] : s.toasts.filter((t) => !ids.includes(t._id)) };
    });
    try {
      const r = await postData(therapistNotifReadUrl, all ? {} : { ids });
      if (r?.status) set({ unread: r.data.unread });
    } catch (e) { /* the next refresh corrects it */ }
  },

}));

function startPoll() {
  if (!poll) poll = setInterval(() => { if (!document.hidden) useNotifStore.getState().fetch({ toast: true }); }, 20000);
}
function stopPoll() { if (poll) { clearInterval(poll); poll = null; } }

function open() {
  const token = getToken();
  if (!token || typeof EventSource === "undefined") { startPoll(); return; }
  es = new EventSource(`${therapistNotifStreamUrl}?token=${encodeURIComponent(token)}`);
  // no hello within 8s → events aren't getting through; poll until they do
  const watchdog = setTimeout(startPoll, 8000);
  es.addEventListener("hello", () => {
    clearTimeout(watchdog);
    stopPoll();
    // (re)connected: catch up on anything that happened while the stream was down
    useNotifStore.getState().fetch({ toast: true });
  });
  es.addEventListener("notif", (e) => { try { useNotifStore.getState().receive(JSON.parse(e.data)); } catch (err) { /* bad frame */ } });
  // read on another tab / device → keep this badge in step
  es.addEventListener("read", () => { useNotifStore.getState().fetch(); });
  es.onerror = () => {
    startPoll();
    if (es && es.readyState === 2) { // closed for good (e.g. 401) — try a fresh one later
      es = null;
      clearTimeout(retryTimer);
      retryTimer = setTimeout(() => { if (subs > 0 && !es) open(); }, 30000);
    }
  };
}

const onVisible = () => { if (!document.hidden) useNotifStore.getState().fetch({ toast: true }); };

// called by the top bar; one stream per tab however many components subscribe
export function connectNotifications() {
  subs += 1;
  if (subs === 1) {
    useNotifStore.getState().fetch();
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

export default useNotifStore;
