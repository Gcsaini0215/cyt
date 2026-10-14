import { create } from "zustand";
import { fetchById, postData } from "../utils/actions";
import { commsInboxUrl, commsReadUrl, commsActionDoneUrl, GetMyReviewsUrl } from "../utils/url";

// Messages from the CYT team (announcements + action requests) and the review count,
// polled by the portal top bar and shared by the menu badges, dashboard and notifications.
const REV_SEEN_KEY = "cyt_th_reviews_seen";

const useCommsStore = create((set, get) => ({
  announcements: [],
  actions: [],
  unread: 0,
  loaded: false,
  reviewsTotal: null,
  reviewsSeen: null,

  fetchInbox: async () => {
    try {
      const r = await fetchById(commsInboxUrl);
      if (r?.status) set({ announcements: r.data.announcements || [], actions: r.data.actions || [], unread: r.data.unread || 0, loaded: true });
    } catch (e) { /* offline or old backend — keep last state */ }
  },

  fetchReviewsCount: async () => {
    try {
      const r = await fetchById(`${GetMyReviewsUrl}?limit=1000`); // full count for the "new reviews" badge
      if (!r?.status) return;
      const total = (r.data || []).length;
      let seen = null;
      try { seen = localStorage.getItem(REV_SEEN_KEY); } catch (e) { /* storage blocked */ }
      if (seen === null) { seen = total; try { localStorage.setItem(REV_SEEN_KEY, String(total)); } catch (e) {} }
      set({ reviewsTotal: total, reviewsSeen: Number(seen) || 0 });
    } catch (e) { /* ignore */ }
  },

  markReviewsSeen: () => {
    const total = get().reviewsTotal;
    if (total == null) return;
    try { localStorage.setItem(REV_SEEN_KEY, String(total)); } catch (e) {}
    set({ reviewsSeen: total });
  },

  markRead: async (id) => {
    const a = get().announcements.find((x) => x._id === id);
    if (!a || a.read) return;
    set((s) => ({ announcements: s.announcements.map((x) => (x._id === id ? { ...x, read: true } : x)), unread: Math.max(0, s.unread - 1) }));
    try { await postData(commsReadUrl(id), {}); } catch (e) { /* retried next visit */ }
  },

  completeAction: async (id, note = "") => {
    const r = await postData(commsActionDoneUrl(id), { note });
    if (r?.status) {
      set((s) => ({
        actions: s.actions.map((x) => (x._id === id ? { ...x, status: "done", doneAt: new Date().toISOString() } : x)),
        unread: Math.max(0, s.unread - 1),
      }));
    }
    return r;
  },
}));

export const newReviewsCount = (s) => (s.reviewsTotal != null && s.reviewsSeen != null ? Math.max(0, s.reviewsTotal - s.reviewsSeen) : 0);

export default useCommsStore;
