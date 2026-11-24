import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/router";
import { fetchById, postData, putData, deleteById } from "../../utils/actions";
import { apiUrl, imagePath } from "../../utils/url";
import { getToken } from "../../utils/jwt";
import { soundOn, setSound, playChime, enablePush, pushState, iosNeedsInstall } from "./chat-notify";
import ClearSheet from "./clear-sheet";
import { isKeyboardUp, lockPagePan } from "./kb-lock";
import VTick, { VTICK_CSS } from "./vtick";
import { pathOf as assessmentPath } from "../self-assessment/seo";
import { DIRECTIONS as NOIDA_DIRECTIONS } from "../contact/centre";
import { usePullRefresh, PullBar, settle, PTR_CSS } from "./pull-refresh";

/* Live chat (2026-11-23) — one app for therapists (/therapists/messages) and clients (/client/messages).
   Desktop / iPad landscape: chat list + conversation side by side. Phones / iPad portrait: the list, then the
   conversation full screen with a back button. Live over SSE (/api/live-chat/stream). Rules live on the server
   (cyt_backend_api helper/chatRules.js): one question before booking, open until 15 days after the last
   session, phone / email / links hidden, office hours auto-reply, crisis help. */

const API = `${apiUrl}/live-chat`;
const photoOf = (p) => (!p || /pngegg|default/i.test(p) ? "" : /^(https?:|data:)/.test(p) ? p : `${imagePath}/${p}`);
const initials = (n) => String(n || "?").trim().split(/\s+/).slice(0, 2).map((x) => x[0]).join("").toUpperCase();
const timeOf = (d) => new Date(d).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }).toLowerCase();
const dayKey = (d) => new Date(new Date(d).getTime() + 5.5 * 36e5).toISOString().slice(0, 10);
const dayLabel = (d) => {
  const k = dayKey(d), today = dayKey(new Date()), y = dayKey(new Date(Date.now() - 864e5));
  if (k === today) return "Today"; if (k === y) return "Yesterday";
  return new Date(d).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "Asia/Kolkata" });
};
const listTime = (d) => (!d ? "" : dayKey(d) === dayKey(new Date()) ? timeOf(d) : new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" }));
const QUICK = ["Please book a session so we can talk properly.", "I've shared a worksheet in your dashboard.", "Thanks — let's go over this in our next session.", "Take care. If it gets too much, call Tele-MANAS 14416."];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function Avatar({ p, size = 44 }) {
  const src = p?.support ? "/icons/cyt-icon-192.png" : photoOf(p?.photo);
  return (
    <span className={`lc-av${p?.support ? " cyt" : ""}`} style={{ width: size, height: size }}>
      {src ? <img src={src} alt="" /> : <b>{initials(p?.name)}</b>}
      {p?.online && <i className="lc-on" aria-label="Online" />}
    </span>
  );
}

function Consent({ role, onAgree }) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="lc-consent">
      <span className="lc-consent-ic" aria-hidden="true">💬</span>
      <h2>Before you start messaging</h2>
      <ul>
        <li><b>Private.</b> Messages are stored encrypted and are between you and {role === "therapist" ? "your client" : "your therapist"}.</li>
        <li><b>Quality & safety.</b> CYT&apos;s clinical team may review conversations to keep care safe and professional. Every review is recorded.</li>
        <li><b>Stay on CYT.</b> Phone numbers, emails and outside links are hidden automatically.</li>
        <li><b>Not for emergencies.</b> If you or someone is in danger, call <a href="tel:112">112</a> or Tele-MANAS <a href="tel:14416">14416</a>.</li>
        {role === "client" && <li><b>How it works.</b> Ask one question before booking. After you book, messages stay open until 15 days after your last session.</li>}
      </ul>
      <button type="button" disabled={busy} onClick={async () => { setBusy(true); try { await postData(`${API}/consent`, {}); onAgree(); } catch { setBusy(false); } }}>{busy ? "Saving…" : "I agree — start messaging"}</button>
      <small>See our <Link href="/privacy-policy">privacy policy</Link>.</small>
    </div>
  );
}

function Settings({ onClose }) {
  const [s, setS] = useState(null);
  const [saving, setSaving] = useState("");
  useEffect(() => { fetchById(`${API}/settings`).then((r) => r?.status && setS(r.data)).catch(() => {}); }, []);
  useEffect(() => {
    const b = document.body, y = window.scrollY, prev = b.style.cssText;
    b.style.position = "fixed"; b.style.top = `-${y}px`; b.style.width = "100%"; b.style.overflow = "hidden";
    return () => { b.style.cssText = prev; window.scrollTo(0, y); };
  }, []);
  const save = async () => {
    setSaving("Saving…");
    try { const r = await putData(`${API}/settings`, s); if (r?.status) { setS(r.data); setSaving("Saved ✓"); setTimeout(onClose, 500); } else setSaving("Couldn't save"); } catch { setSaving("Couldn't save"); }
  };
  return createPortal((
    <div className="lc-scrim" role="dialog" aria-modal="true" aria-label="Message settings" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <style>{CSS + VTICK_CSS + PTR_CSS}</style>
      <div className="lc-sheet">
        <button type="button" className="lc-x" onClick={onClose} aria-label="Close">×</button>
        <h3>Message settings</h3>
        {!s ? <p className="lc-muted">Loading…</p> : (
          <>
            <label className="lc-switch">
              <span><b>Accept messages</b><small>Off: clients can still read old messages, but can&apos;t send new ones.</small></span>
              <input type="checkbox" checked={s.enabled !== false} onChange={(e) => setS({ ...s, enabled: e.target.checked })} />
              <i aria-hidden="true" />
            </label>
            <div className="lc-f">
              <b>Office hours</b>
              <small>Outside these hours clients get an automatic reply. You won&apos;t be expected to answer.</small>
              <div className="lc-hours">
                <input type="time" value={s.start} onChange={(e) => setS({ ...s, start: e.target.value })} aria-label="From" />
                <span>to</span>
                <input type="time" value={s.end} onChange={(e) => setS({ ...s, end: e.target.value })} aria-label="To" />
              </div>
              <div className="lc-days">
                {DAYS.map((d, i) => (
                  <button type="button" key={d} className={(s.days || []).includes(i) ? "on" : ""} aria-pressed={(s.days || []).includes(i)}
                    onClick={() => setS({ ...s, days: (s.days || []).includes(i) ? s.days.filter((x) => x !== i) : [...(s.days || []), i] })}>{d}</button>
                ))}
              </div>
            </div>
            <label className="lc-f">
              <b>Auto-reply (optional)</b>
              <textarea rows={3} maxLength={400} value={s.autoReply || ""} onChange={(e) => setS({ ...s, autoReply: e.target.value })} placeholder="Thanks for your message. I reply during my working hours…" />
            </label>
            <button type="button" className="lc-save" onClick={save}>{saving || "Save settings"}</button>
          </>
        )}
      </div>
    </div>
  ), document.body);
}

function Alerts({ onClose }) {
  const [perm, setPerm] = useState(pushState());
  const [snd, setSnd] = useState(soundOn());
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const b = document.body, y = window.scrollY, prev = b.style.cssText;
    b.style.position = "fixed"; b.style.top = `-${y}px`; b.style.width = "100%"; b.style.overflow = "hidden";
    return () => { b.style.cssText = prev; window.scrollTo(0, y); };
  }, []);
  const turnOn = async () => { setBusy(true); try { setPerm(await enablePush()); } catch { setPerm(pushState()); } setBusy(false); };
  return createPortal((
    <div className="lc-scrim" role="dialog" aria-modal="true" aria-label="Message alerts" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <style>{CSS + VTICK_CSS + PTR_CSS}</style>
      <div className="lc-sheet">
        <button type="button" className="lc-x" onClick={onClose} aria-label="Close">×</button>
        <h3>Message alerts</h3>
        <div className="lc-alert">
          <span aria-hidden="true">📱</span>
          <div>
            <b>Phone notifications</b>
            <small>{perm === "granted" ? "On — new messages pop up on this phone with its own sound, even when CYT is closed." : perm === "denied" ? "Blocked in your browser settings. Allow notifications for chooseyourtherapist.in, then come back." : perm === "unsupported" ? (iosNeedsInstall() ? "On iPhone: add CYT to your Home Screen first (Share → Add to Home Screen), open it from there, then turn this on." : "This browser can't show notifications.") : "Get a pop-up with your phone's own sound when a message arrives, even when CYT is closed."}</small>
            {perm === "default" && <button type="button" className="lc-btn" disabled={busy} onClick={turnOn}>{busy ? "Turning on…" : "Turn on notifications"}</button>}
            {perm === "granted" && <em className="lc-ok">✓ On</em>}
          </div>
        </div>
        <label className="lc-switch">
          <span><b>Sound in the app</b><small>A soft chime and a pop-up when a message comes in while CYT is open. Only you hear it.</small></span>
          <input type="checkbox" checked={snd} onChange={(e) => { setSnd(e.target.checked); setSound(e.target.checked); if (e.target.checked) playChime(); }} />
          <i aria-hidden="true" />
        </label>
        <button type="button" className="lc-test" onClick={() => playChime()}>▶ Play the sound</button>
        <p className="lc-privacy">🔒 Notifications never show what the message says — only who it&apos;s from.</p>
      </div>
    </div>
  ), document.body);
}

// what you were typing stays with each chat (this device only) until it's sent
const DKEY = (id) => `cyt_chat_draft_${id}`;
const saveDraft = (id, v) => { try { if (!id) return; if (v) localStorage.setItem(DKEY(id), v); else localStorage.removeItem(DKEY(id)); } catch { /* private mode */ } };
const useIsoLayout = typeof window !== "undefined" ? useLayoutEffect : useEffect;
const EMOJI = ["👍", "❤️", "😂", "🙏", "😮", "😢"];
const groupReacts = (rs) => { const g = {}; (rs || []).forEach((r) => { g[r.emoji] = (g[r.emoji] || 0) + 1; }); return Object.entries(g); };

export default function ChatApp({ role }) {
  const router = useRouter();
  const [consent, setConsent] = useState(null);
  const [threads, setThreads] = useState(null);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(null); // thread id
  const [conv, setConv] = useState(null); // { thread, state, messages, more }
  const [text, setText] = useState("");
  const [typingIn, setTypingIn] = useState({}); // threadId -> showing "typing…" until (ms)
  const [newCount, setNewCount] = useState(0); // messages that came in while you were reading further up
  const atBottom = useRef(true);
  const autoUntil = useRef(0); // while the chat scrolls itself to the newest message, it still counts as "at the bottom"
  const [conn, setConn] = useState(0); // bumps → the live connection starts again (after the phone was locked / offline)
  const lastTyped = useRef(0);
  const restore = useRef(null); // keep the place on screen after older messages are added above
  const [replyTo, setReplyTo] = useState(null); // the message being answered
  const [editing, setEditing] = useState(null); // my message being changed
  const [menu, setMenu] = useState(null); // long-press menu for a message
  const [findOpen, setFindOpen] = useState(false);
  const [fq, setFq] = useState("");
  const [found, setFound] = useState(null);
  const [hl, setHl] = useState(null); // message flashed after jumping to it
  const press = useRef(null);
  const [kitOpen, setKitOpen] = useState(null); // null | "menu" | "tools" | "tests"
  const [kit, setKit] = useState(null);
  const [kitBusy, setKitBusy] = useState("");
  const [kitMsg, setKitMsg] = useState("");
  const [err, setErr] = useState("");
  const [settings, setSettings] = useState(false);
  const [live, setLive] = useState(false);
  const [alerts, setAlerts] = useState(false);
  const [clearing, setClearing] = useState(null); // thread id
  const [delMode, setDelMode] = useState(false); // true: delete the whole chat (swipe), false: clear messages (🗑 in a chat)
  const [swiped, setSwiped] = useState(null); // list row showing its Delete button
  const swipe = useRef(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [askPush, setAskPush] = useState(false);
  const scroller = useRef(null);
  const appRef = useRef(null);
  /* Messages is the whole page (owner, 2026-11-23): no card — the chat fills the frame from under the top bar to just
     above the bottom dock (or the keyboard), and from the side menu to the screen edge. The dock stays; the page
     itself never moves — only the chat list and the message list scroll. */
  useEffect(() => {
    if (consent === false) return undefined;
    const html = document.documentElement, body = document.body;
    window.scrollTo(0, 0);
    html.classList.add("lc-lock");
    // iPhone-safe lock: overflow:hidden alone still lets Safari drag the page a little
    const prev = body.style.cssText;
    body.style.position = "fixed"; body.style.top = "0"; body.style.left = "0"; body.style.right = "0"; body.style.width = "100%";
    const shown = (n) => n && n.offsetWidth > 0 && getComputedStyle(n).display !== "none" && getComputedStyle(n).visibility !== "hidden";
    const fit = () => {
      const el = appRef.current;
      if (!el) return;
      const vv = window.visualViewport;
      const keyboard = vv && window.innerHeight - vv.height > 150;
      const bar = [...document.querySelectorAll(".tn-bar, .cls-bar")].find(shown);
      let top = bar ? Math.round(bar.getBoundingClientRect().bottom) : 0;
      // the side menu (desktop / iPad landscape) stays visible on the left
      const rail = [...document.querySelectorAll(".tsn-rail, .cls-rail")].find((r) => shown(r) && r.getBoundingClientRect().left < 4);
      const left = rail ? Math.max(0, Math.round(rail.getBoundingClientRect().right)) : 0;
      let bottom;
      // iOS slides the whole page up when the keyboard opens — put it back; the chat fits above the keyboard instead
      if (keyboard && vv.offsetTop > 0) { window.scrollTo(0, 0); document.documentElement.scrollTop = 0; }
      document.documentElement.classList.toggle("lc-kb", isKeyboardUp(vv));
      if (keyboard) {
        // typing: end right above the keyboard; keep the header in sight if the screen slid up
        top = Math.max(top, Math.round(vv.offsetTop));
        bottom = Math.round(vv.offsetTop + vv.height);
      } else {
        const dock = [...document.querySelectorAll(".tn-mob-nav, .cls-mob")].find(shown);
        const tucked = html.classList.contains("lc-nav-min");
        html.classList.toggle("lc-has-nav", !!dock);
        bottom = dock && !tucked ? Math.round(dock.getBoundingClientRect().top - 8) : Math.round(vv ? vv.height : window.innerHeight);
      }
      el.style.top = `${top}px`;
      el.style.left = `${left}px`;
      el.style.height = `${Math.max(240, bottom - top)}px`;
      // phones / iPad portrait: an open chat covers the whole visible screen (above the keyboard) — see the CSS
      const root = el.parentElement;
      if (root) { root.style.setProperty("--lc-vvh", `${Math.round(vv ? vv.height : window.innerHeight)}px`); root.style.setProperty("--lc-vvt", `${Math.round(vv ? vv.offsetTop : 0)}px`); }
    };
    fit();
    // after the box has its final height, show the newest message
    const toEnd = () => { fit(); const sc = scroller.current; if (sc) sc.scrollTop = sc.scrollHeight; };
    const t1 = setTimeout(toEnd, 120), t2 = setTimeout(toEnd, 600);
    window.addEventListener("resize", fit);
    window.visualViewport?.addEventListener("resize", fit);
    window.visualViewport?.addEventListener("scroll", fit);
    const fitLater = () => setTimeout(fit, 300);
    document.addEventListener("focusin", fitLater); document.addEventListener("focusout", fitLater);
    window.__lcFit = fit;
    const unpan = lockPagePan(); // keyboard up: the screen doesn't slide / shake
    return () => {
      clearTimeout(t1); clearTimeout(t2);
      window.__lcFit = null;
      unpan();
      window.removeEventListener("resize", fit);
      window.visualViewport?.removeEventListener("resize", fit);
      window.visualViewport?.removeEventListener("scroll", fit);
      document.removeEventListener("focusin", fitLater); document.removeEventListener("focusout", fitLater);
      html.classList.remove("lc-lock", "lc-kb");
      body.style.cssText = prev;
    };
  }, [consent, active]);
  const [navMin, setNavMin] = useState(false);
  const navTimer = useRef(null);
  const tuckNav = (ms) => { clearTimeout(navTimer.current); navTimer.current = setTimeout(() => setNavMin(true), ms); };
  useEffect(() => { tuckNav(2500); return () => { clearTimeout(navTimer.current); document.documentElement.classList.remove("lc-nav-min"); }; }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    document.documentElement.classList.toggle("lc-nav-min", navMin);
    const iv = setInterval(() => window.__lcFit && window.__lcFit(), 50); // follow the menu while it slides
    const stop = setTimeout(() => clearInterval(iv), 450);
    return () => { clearInterval(iv); clearTimeout(stop); };
  }, [navMin]);
  const showNav = () => { setNavMin(false); tuckNav(5000); };
  const activeRef = useRef(null);
  activeRef.current = active;
  useEffect(() => { window.__lcActive = active || null; return () => { window.__lcActive = null; }; }, [active]);
  // nudge once to turn on phone notifications (needs a tap)
  useEffect(() => { try { setAskPush(pushState() === "default" && localStorage.getItem("cyt_lc_pushask") !== "1"); } catch { /* ignore */ } }, []);

  const loadThreads = useCallback(() => fetchById(`${API}/threads`).then((r) => r?.status && setThreads(Array.isArray(r.data?.threads) ? r.data.threads : [])).catch(() => setThreads((t) => t || [])), []);
  useEffect(() => {
    fetchById(`${API}/consent`).then((r) => setConsent(!!r?.data?.agreed)).catch(() => setConsent(false));
    loadThreads();
  }, [loadThreads]);

  // open from a link: ?t=<thread>  or (clients) ?to=<therapistId>
  useEffect(() => {
    if (!router.isReady) return;
    const { t, to } = router.query;
    if (t) setActive(String(t));
    else if (to && role === "client") {
      postData(`${API}/start`, { therapistId: String(to) }).then((r) => { if (r?.status) { setActive(r.data.id); router.replace({ pathname: router.pathname, query: { t: r.data.id } }, undefined, { shallow: true }); } }).catch((e) => setErr(e?.response?.data?.message || "Couldn't open the chat"));
    }
  }, [router.isReady]); // eslint-disable-line react-hooks/exhaustive-deps

  const scrollDown = (smooth = false) => { atBottom.current = true; autoUntil.current = Date.now() + 900; setNewCount(0); requestAnimationFrame(() => { const el = scroller.current; if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" }); }); };
  const markRead = useCallback((id) => postData(`${API}/threads/${id}/read`, {}).then(() => setThreads((ts) => (ts || []).map((t) => (t._id === id ? { ...t, unread: 0 } : t)))).catch(() => {}), []);

  // the draft for this chat
  useEffect(() => {
    let v = "";
    try { if (active) v = localStorage.getItem(DKEY(active)) || ""; } catch { /* ignore */ }
    setText(v); setNewCount(0); atBottom.current = true;
    setReplyTo(null); setEditing(null); setMenu(null); setFindOpen(false); setFq(""); setFound(null);
  }, [active]);
  useIsoLayout(() => { const r = restore.current; if (r && r.el) { r.el.scrollTop = r.top + (r.el.scrollHeight - r.before); restore.current = null; } }, [conv]);

  // back after the phone was locked / the internet dropped: fetch what was missed, keep what's on screen
  const resync = useRef(null);
  resync.current = () => {
    loadThreads();
    const id = activeRef.current;
    if (!id) return;
    fetchById(`${API}/threads/${id}`).then((r) => {
      if (!r?.status || activeRef.current !== id) return;
      setConv((c) => {
        if (!c) return r.data;
        const have = new Map(c.messages.filter((m) => !m.pending && !m.failed).map((m) => [m._id, m]));
        r.data.messages.forEach((m) => have.set(m._id, m));
        const merged = [...have.values()].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        return { ...c, thread: r.data.thread, state: r.data.state, messages: [...merged, ...c.messages.filter((m) => m.pending || m.failed)] };
      });
      markRead(id);
      if (atBottom.current) scrollDown();
    }).catch(() => {});
  };
  const listRef = useRef(null);
  const listPull = usePullRefresh(listRef, () => settle(loadThreads()), threads !== null && consent === true);
  const msgPull = usePullRefresh(scroller, () => settle(resync.current && resync.current()), !!conv);
  useEffect(() => {
    let hiddenAt = 0;
    const vis = () => { if (document.visibilityState === "hidden") { hiddenAt = Date.now(); return; } if (hiddenAt && Date.now() - hiddenAt > 3000) setConn((k) => k + 1); };
    const online = () => setConn((k) => k + 1);
    document.addEventListener("visibilitychange", vis); window.addEventListener("online", online);
    return () => { document.removeEventListener("visibilitychange", vis); window.removeEventListener("online", online); };
  }, []);

  // load a conversation
  useEffect(() => {
    if (!active) { setConv(null); return; }
    setConv(null); setErr("");
    fetchById(`${API}/threads/${active}`).then((r) => {
      if (!r?.status) return setErr(r?.message || "Chat not found");
      setConv(r.data); scrollDown(); markRead(active);
      setThreads((ts) => (ts && !ts.some((t) => t._id === active) ? [r.data.thread, ...ts] : ts));
    }).catch((e) => setErr(e?.response?.data?.message || "Couldn't open this chat"));
  }, [active, markRead]);

  // live events
  useEffect(() => {
    const token = getToken();
    if (!token || typeof EventSource === "undefined") return undefined;
    const es = new EventSource(`${API}/stream?token=${encodeURIComponent(token)}`);
    let hellos = 0;
    es.addEventListener("hello", () => { setLive(true); if (hellos++ > 0 || conn > 0) resync.current && resync.current(); });
    es.addEventListener("typing", (e) => {
      const { threadId, by } = JSON.parse(e.data || "{}");
      if (!threadId || by === role) return;
      const until = Date.now() + 5000;
      setTypingIn((x) => ({ ...x, [threadId]: until }));
      setTimeout(() => setTypingIn((x) => (x[threadId] === until ? { ...x, [threadId]: 0 } : x)), 5100);
    });
    es.onerror = () => setLive(false);
    es.addEventListener("message", (e) => {
      const { threadId, message } = JSON.parse(e.data || "{}");
      if (!threadId || !message) return;
      const mine = message.fromRole === role;
      if (!mine) setTypingIn((x) => (x[threadId] ? { ...x, [threadId]: 0 } : x));
      if (threadId === activeRef.current) {
        setConv((c) => {
          if (!c || c.messages.some((m) => m._id === message._id)) return c;
          // my own message coming back: it takes the place of the "Sending…" bubble
          const i = mine ? c.messages.findIndex((m) => m.pending && m.body === message.body) : -1;
          if (i >= 0) { const ms = [...c.messages]; ms[i] = message; return { ...c, messages: ms }; }
          return { ...c, messages: [...c.messages, message] };
        });
        if (mine || atBottom.current) scrollDown(true); else setNewCount((n) => n + 1);
        if (!mine && document.visibilityState === "visible") markRead(threadId);
      }
      setThreads((ts) => {
        const list = ts || [];
        const t = list.find((x) => x._id === threadId);
        if (!t) { loadThreads(); return list; }
        const upd = { ...t, preview: message.body, lastMessageAt: message.createdAt, lastFrom: message.fromRole, unread: mine || threadId === activeRef.current ? t.unread : (t.unread || 0) + 1 };
        return [upd, ...list.filter((x) => x._id !== threadId)];
      });
    });
    es.addEventListener("read", (e) => {
      const { threadId, by, at } = JSON.parse(e.data || "{}");
      if (threadId !== activeRef.current || by === role) return;
      setConv((c) => (c ? { ...c, messages: c.messages.map((m) => (m.fromRole === role && !m.readAt ? { ...m, readAt: at } : m)) } : c));
    });
    es.addEventListener("assigned", (e) => {
      const d = JSON.parse(e.data || "{}");
      loadThreads();
      // the Care Team chat (or nothing) is open: move straight to the new therapist chat
      const cur = activeRef.current;
      if (d.threadId && (!cur || cur === d.supportId)) { setActive(d.threadId); router.replace({ pathname: router.pathname, query: { t: d.threadId } }, undefined, { shallow: true }); }
    });
    es.addEventListener("cleared", (e) => {
      const { threadId } = JSON.parse(e.data || "{}");
      if (threadId === activeRef.current) fetchById(`${API}/threads/${threadId}`).then((r) => r?.status && setConv(r.data)).catch(() => {});
      loadThreads();
    });
    const patchMsg = (threadId, id, fn) => { if (threadId === activeRef.current) setConv((c) => (c ? { ...c, messages: c.messages.map((m) => (m._id === id ? fn(m) : m)) } : c)); };
    es.addEventListener("edited", (e) => { const { threadId, message } = JSON.parse(e.data || "{}"); if (message) patchMsg(threadId, message._id, (m) => ({ ...m, body: message.body, editedAt: message.editedAt, masked: message.masked })); });
    es.addEventListener("react", (e) => { const { threadId, id, reactions } = JSON.parse(e.data || "{}"); patchMsg(threadId, id, (m) => ({ ...m, reactions })); });
    es.addEventListener("rated", (e) => { const { threadId, id, stars } = JSON.parse(e.data || "{}"); patchMsg(threadId, id, (m) => ({ ...m, meta: { ...(m.meta || {}), stars } })); });
    es.addEventListener("deleted", (e) => {
      const { threadId, id } = JSON.parse(e.data || "{}");
      if (threadId === activeRef.current) setConv((c) => (c ? { ...c, messages: c.messages.map((m) => (m._id === id ? { ...m, deleted: true, body: "" } : m)) } : c));
    });
    return () => es.close();
  }, [role, loadThreads, markRead, conn]); // eslint-disable-line react-hooks/exhaustive-deps

  // the bubble shows straight away ("Sending…"); no internet → "Not sent · Tap to retry", nothing is lost
  const send = async (body, retry) => {
    if (editing && !retry) { saveEdit(); return; }
    const t = (retry ? retry.body : (body ?? text)).trim();
    if (!t || !active) return;
    const quote = retry ? retry.replyTo : replyTo ? { id: replyTo._id, body: replyTo.body.slice(0, 140), fromRole: replyTo.fromRole } : undefined;
    if (!retry) setReplyTo(null);
    const tid = active;
    const tmp = retry ? retry._id : `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setErr("");
    if (!retry) {
      setText(""); saveDraft(tid, "");
      const ta = typeof document !== "undefined" && document.querySelector(".lc-comp textarea"); if (ta) ta.style.height = "auto";
    }
    setConv((c) => (c ? { ...c, messages: retry ? c.messages.map((m) => (m._id === tmp ? { ...m, pending: true, failed: false } : m)) : [...c.messages, { _id: tmp, pending: true, fromRole: role, kind: "text", body: t, createdAt: new Date().toISOString(), ...(quote ? { replyTo: quote } : {}) }] } : c));
    scrollDown(true);
    try {
      const r = await postData(`${API}/threads/${tid}/messages`, { text: t, ...(quote ? { replyTo: quote.id } : {}) });
      if (!r?.status) { const x = new Error("refused"); x.response = { status: 400, data: { message: r?.message } }; throw x; }
      const real = r.data.message;
      setConv((c) => { if (!c || activeRef.current !== tid) return c; const rest = c.messages.filter((m) => m._id !== tmp); return { ...c, messages: rest.some((m) => m._id === real._id) ? rest : [...rest, real] }; });
      if (r.data.masked) setErr("Phone numbers, emails and outside links are hidden to keep your conversation safe on CYT.");
      // the pre-booking question uses up the one message: refresh what's allowed next
      fetchById(`${API}/threads/${tid}`).then((x) => x?.status && activeRef.current === tid && setConv((c) => (c ? { ...c, state: x.data.state } : c))).catch(() => {});
    } catch (e) {
      const code = e?.response?.status, d = e?.response?.data;
      if (code && code < 500) {
        // refused (not allowed right now) — take the bubble back, the text returns to the box
        setConv((c) => (c ? { ...c, messages: c.messages.filter((m) => m._id !== tmp), ...(d?.state ? { state: d.state } : {}) } : c));
        if (!retry && activeRef.current === tid) { setText(t); saveDraft(tid, t); }
        if (d?.code === "consent") setConsent(false);
        setErr(d?.message || "Couldn't send");
      } else {
        setConv((c) => (c ? { ...c, messages: c.messages.map((m) => (m._id === tmp ? { ...m, pending: false, failed: true } : m)) } : c));
        if (atBottom.current) scrollDown(true); // show the "Not sent" line
      }
    }
  };
  const saveEdit = async () => {
    const m = editing, t = text.trim(); if (!m || !t) return;
    try {
      const r = await putData(`${API}/messages/${m._id}`, { text: t });
      if (r?.status) { setConv((c) => (c ? { ...c, messages: c.messages.map((x) => (x._id === m._id ? { ...x, body: r.data.message.body, editedAt: r.data.message.editedAt } : x)) } : c)); setEditing(null); setText(""); saveDraft(active, ""); if (r.data.masked) setErr("Phone numbers, emails and outside links are hidden to keep your conversation safe on CYT."); }
    } catch (e) { setErr(e?.response?.data?.message || "Couldn't edit"); }
  };
  const react = async (m, emoji) => {
    setMenu(null);
    try { const r = await postData(`${API}/messages/${m._id}/react`, { emoji }); if (r?.status) setConv((c) => (c ? { ...c, messages: c.messages.map((x) => (x._id === m._id ? { ...x, reactions: r.data.reactions } : x)) } : c)); }
    catch (e) { setErr(e?.response?.data?.message || "Couldn't react"); }
  };
  const copyMsg = (m) => { setMenu(null); try { navigator.clipboard.writeText(m.body); } catch { /* ignore */ } };
  const startEdit = (m) => { setMenu(null); setReplyTo(null); setEditing(m); setText(m.body); setTimeout(() => { const ta = document.querySelector(".lc-comp textarea"); if (ta) { ta.focus(); ta.style.height = "auto"; ta.style.height = `${Math.min(140, ta.scrollHeight)}px`; } }, 50); };
  const startReply = (m) => { setMenu(null); setEditing(null); setReplyTo(m); setTimeout(() => { const ta = document.querySelector(".lc-comp textarea"); if (ta) ta.focus(); }, 50); };
  const sendCard = async () => {
    try {
      const r = await postData(`${API}/threads/${active}/booking-card`, {});
      if (r?.status) { setConv((c) => (c && !c.messages.some((m) => m._id === r.data.message._id) ? { ...c, messages: [...c.messages, r.data.message] } : c)); scrollDown(true); }
    } catch (e) { setErr(e?.response?.data?.message || "Couldn't send the booking link"); }
  };
  const addCard = (msg) => { setConv((c) => (c && !c.messages.some((m) => m._id === msg._id) ? { ...c, messages: [...c.messages, msg] } : c)); scrollDown(true); };
  const openKit = (step = "menu") => {
    setKitMsg(""); setKitOpen(step);
    if (!kit) fetchById(`${API}/therapist-kit`).then((r) => setKit(r?.status ? r.data : { tools: [], tests: [] })).catch(() => setKit({ tools: [], tests: [] }));
  };
  const postCard = async (body, label) => {
    setKitBusy(label); setKitMsg("");
    try { const r = await postData(`${API}/threads/${active}/card`, body); if (r?.status) { addCard(r.data.message); setKitOpen(null); } else setKitMsg(r?.message || "Couldn't send"); }
    catch (e) { setKitMsg(e?.response?.data?.message || "Couldn't send — try again"); }
    setKitBusy("");
  };
  // a worksheet: sent straight to this client when they're yours (it waits in their My Space), otherwise a share link
  const sendTool = async (tool) => {
    setKitBusy(tool); setKitMsg("");
    let link = null;
    try { const r = await postData(`${apiUrl}/therapist/worksheets/link`, { tool, client: other?.id }); if (r?.status) link = r.data; }
    catch (e) {
      const code = e?.response?.status;
      if (code === 402) { setKitMsg(e.response.data?.message || "Sharing worksheets comes with the yearly plan"); setKitBusy(""); return; }
      if (code === 403) { try { const r2 = await postData(`${apiUrl}/therapist/worksheets/link`, { tool }); if (r2?.status) link = r2.data; } catch (e2) { setKitMsg(e2?.response?.data?.message || "Couldn't make the link"); } }
      else setKitMsg(e?.response?.data?.message || "Couldn't make the link");
    }
    setKitBusy("");
    if (link?.path) await postCard({ type: "tool", path: link.path }, tool);
  };
  const rate = async (m, stars) => {
    setConv((c) => (c ? { ...c, messages: c.messages.map((x) => (x._id === m._id ? { ...x, meta: { ...(x.meta || {}), stars } } : x)) } : c));
    try { await postData(`${API}/threads/${active}/rate`, { stars }); } catch (e) { setErr(e?.response?.data?.message || "Couldn't save your rating"); }
  };
  // jump to a message (search result / quote); older ones are loaded first if needed
  const jumpTo = async (id) => {
    setFindOpen(false);
    const show = () => { const el = typeof document !== "undefined" && document.getElementById(`lcm-${id}`); if (!el) return false; el.scrollIntoView({ block: "center", behavior: "smooth" }); atBottom.current = false; setHl(id); setTimeout(() => setHl((h) => (h === id ? null : h)), 2200); return true; };
    if (show()) return;
    let c = conv;
    for (let i = 0; i < 15 && c && c.more && !c.messages.some((m) => m._id === id); i++) {
      const r = await fetchById(`${API}/threads/${active}`, { before: c.messages[0].createdAt }).catch(() => null);
      if (!r?.status) break;
      c = { ...c, more: r.data.more, messages: [...r.data.messages.filter((m) => !c.messages.some((x) => x._id === m._id)), ...c.messages] };
    }
    if (c) setConv(c);
    setTimeout(show, 120);
  };
  useEffect(() => {
    if (!findOpen || fq.trim().length < 2 || !active) { setFound(null); return undefined; }
    const tm = setTimeout(() => fetchById(`${API}/threads/${active}/search`, { q: fq.trim() }).then((r) => setFound(r?.status ? r.data : [])).catch(() => setFound([])), 300);
    return () => clearTimeout(tm);
  }, [fq, findOpen, active]);
  // long-press (or right-click) opens the menu; a swipe to the right replies
  const touchFor = (m) => ({
    onTouchStart: (e) => { const p = e.touches[0]; press.current = { id: m._id, x: p.clientX, y: p.clientY, t: setTimeout(() => { press.current = null; if (navigator.vibrate) try { navigator.vibrate(15); } catch { /* ignore */ } setMenu(m); }, 450) }; },
    onTouchMove: (e) => { const g = press.current; if (!g) return; const p = e.touches[0]; const dx = p.clientX - g.x, dy = p.clientY - g.y; if (Math.abs(dx) > 10 || Math.abs(dy) > 10) clearTimeout(g.t); if (dx > 60 && Math.abs(dy) < 30) { press.current = null; if (!m.deleted && !m.pending && !m.failed) startReply(m); } },
    onTouchEnd: () => { const g = press.current; if (g) clearTimeout(g.t); press.current = null; },
    onContextMenu: (e) => { e.preventDefault(); setMenu(m); },
  });
  const typed = (v) => {
    setText(v); saveDraft(active, v);
    // "typing…" for the other side, at most every 3 seconds
    if (v && active && Date.now() - lastTyped.current > 3000) { lastTyped.current = Date.now(); postData(`${API}/threads/${active}/typing`, {}).catch(() => {}); }
  };

  const loadEarlier = async () => {
    if (!conv?.messages?.length || loadingMore) return;
    setLoadingMore(true);
    const el = scroller.current; const before = el ? el.scrollHeight : 0;
    try {
      const r = await fetchById(`${API}/threads/${active}`, { before: conv.messages[0].createdAt });
      if (r?.status) {
        // stay on the same message after the older ones are added above (applied before the screen paints)
        restore.current = { el, before, top: el ? el.scrollTop : 0 };
        setConv((c) => (c ? { ...c, more: r.data.more, messages: [...r.data.messages.filter((m) => !c.messages.some((x) => x._id === m._id)), ...c.messages] } : c));
      }
    } catch { /* keep what's shown */ }
    setLoadingMore(false);
  };
  const remove = async (m) => {
    try { await deleteById(`${API}/messages/${m._id}`); setConv((c) => ({ ...c, messages: c.messages.map((x) => (x._id === m._id ? { ...x, deleted: true, body: "" } : x)) })); }
    catch (e) { setErr(e?.response?.data?.message || "Couldn't delete"); }
  };

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (threads || []).filter((t) => !s || t.other.name.toLowerCase().includes(s));
  }, [threads, q]);

  const st = conv?.state;
  const other = conv?.thread?.other;
  const bookHref = conv?.thread?.therapistId ? `/book/${conv.thread.therapistId}` : "/client/find";
  const isSupport = !!conv?.thread?.support;

  return (
    <div className={`lc${active ? " has-active" : ""}`} data-sm-skip="">
      {navMin && <button type="button" className="lc-navtab" onClick={showNav} aria-label="Show the menu"><i /></button>}
      <style>{CSS + VTICK_CSS + PTR_CSS}</style>
      {consent === false ? <Consent role={role} onAgree={() => setConsent(true)} /> : (
        <div className="lc-app" ref={appRef}>
          {/* chat list */}
          <aside className="lc-list" aria-label="Chats">
            <Link href={role === "therapist" ? "/therapist-dashboard" : "/my-dashboard"} className="lc-home" aria-label="Back to dashboard">‹ Dashboard</Link>
            <div className="lc-list-h">
              <h1>Messages {live && <span className="lc-live" title="Live">● Live</span>}</h1>
              <span className="lc-hbtns">
                <button type="button" className="lc-gear" onClick={() => setAlerts(true)} aria-label="Message alerts">🔔</button>
                {role === "therapist" && <button type="button" className="lc-gear" onClick={() => setSettings(true)} aria-label="Message settings">⚙︎</button>}
              </span>
            </div>
            {askPush && (
              <div className="lc-nudge">
                <span aria-hidden="true">🔔</span>
                <p>Get notified when a message arrives, even when CYT is closed.</p>
                <button type="button" onClick={() => { setAlerts(true); setAskPush(false); try { localStorage.setItem("cyt_lc_pushask", "1"); } catch { /* ignore */ } }}>Turn on</button>
                <button type="button" className="no" aria-label="Not now" onClick={() => { setAskPush(false); try { localStorage.setItem("cyt_lc_pushask", "1"); } catch { /* ignore */ } }}>×</button>
              </div>
            )}
            <label className="lc-search"><span aria-hidden="true">⌕</span><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" aria-label="Search chats" /></label>
            <div className="lc-items" ref={listRef}>
              <PullBar {...listPull} />
              {threads === null ? <p className="lc-muted pad">Loading…</p> : !shown.length ? (
                <div className="lc-empty">
                  <span aria-hidden="true">💬</span>
                  <b>No messages yet</b>
                  <p>{role === "therapist" ? "When a client messages you, the chat appears here." : "Ask a therapist a quick question from their profile, or message your therapist after booking."}</p>
                  {role === "client" && <Link href="/client/find" className="lc-btn">Find a therapist</Link>}
                </div>
              ) : shown.map((t) => (
                <div key={t._id} className={`lc-sw${swiped === t._id ? " open" : ""}`}
                  onTouchStart={(e) => { swipe.current = { id: t._id, x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
                  onTouchMove={(e) => {
                    const g = swipe.current; if (!g || g.id !== t._id) return;
                    const dx = e.touches[0].clientX - g.x, dy = e.touches[0].clientY - g.y;
                    if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy) * 1.5) { setSwiped(dx < 0 ? t._id : null); swipe.current = null; }
                  }}>
                <button type="button" className="lc-sw-del" onClick={() => { setDelMode(true); setClearing(t._id); }} aria-label={`Delete chat with ${t.other.name}`}>
                  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M9 3h6l1 2h4v2H4V5h4l1-2Zm-3 6h12l-1 11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 9Zm4 2v8h2v-8h-2Zm4 0v8h2v-8h-2Z" /></svg>Delete
                </button>
                <button type="button" className={`lc-item${t._id === active ? " on" : ""}${t.unread ? " unread" : ""}`} onClick={() => { if (swiped) { setSwiped(null); return; } setActive(t._id); router.replace({ pathname: router.pathname, query: { t: t._id } }, undefined, { shallow: true }); }}>
                  <i className="lc-dot" aria-label={t.unread ? `${t.unread} unread` : undefined} />
                  <Avatar p={t.other} size={50} />
                  <span className="lc-item-m">
                    <span className="lc-item-t"><b>{t.other.name}{t.other.support ? <VTick kind="team" /> : role === "client" ? <VTick /> : null}</b><time>{listTime(t.lastMessageAt)} <span aria-hidden="true">›</span></time></span>
                    <span className="lc-item-p">{typingIn[t._id] > Date.now() ? <span className="lc-typing">typing…</span> : <>{t.lastFrom === role ? "You: " : ""}{t.preview || "…"}</>}</span>
                  </span>
                </button>
                <button type="button" className="lc-sw-bin" onClick={(e) => { e.stopPropagation(); setDelMode(true); setClearing(t._id); }} aria-label={`Delete chat with ${t.other.name}`} title="Delete chat">
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M9 3h6l1 2h4v2H4V5h4l1-2Zm-3 6h12l-1 11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 9Zm4 2v8h2v-8h-2Zm4 0v8h2v-8h-2Z" /></svg>
                </button>
                </div>
              ))}
            </div>
          </aside>

          {/* conversation */}
          <section className="lc-conv" aria-label="Conversation">
            {!active ? (
              <div className="lc-pick"><span aria-hidden="true">💬</span><b>Select a chat</b><p>Your conversations update live.</p></div>
            ) : !conv ? (
              <div className="lc-pick">{err ? <><b>{err}</b><button type="button" className="lc-btn" onClick={() => setActive(null)}>Back</button></> : <p>Loading…</p>}</div>
            ) : (
              <>
                <header className="lc-conv-h">
                  <button type="button" className="lc-back" onClick={() => { setActive(null); router.replace({ pathname: router.pathname }, undefined, { shallow: true }); }} aria-label="Back to chats"><span aria-hidden="true">‹</span> Back</button>
                  <div className="lc-conv-who">
                    <Avatar p={other} size={44} />
                    <b>{other.name}{other.support ? <VTick kind="team" /> : role === "client" ? <VTick /> : null} <span aria-hidden="true">›</span></b>
                    <small>{typingIn[active] > Date.now() ? <span className="lc-typing">typing…</span> : other.online ? "Online now" : (role === "client" || isSupport) && st?.hours ? `Replies ${st.hours}` : other.title || ""}</small>
                  </div>
                  <span className="lc-hr">
                    <button type="button" className={`lc-clear lc-find${findOpen ? " on" : ""}`} onClick={() => { setFindOpen((v) => !v); setFq(""); setFound(null); }} aria-label="Search in this chat" title="Search in this chat"><svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true"><path fill="currentColor" d="M10 3a7 7 0 0 1 5.6 11.2l4.6 4.6-1.4 1.4-4.6-4.6A7 7 0 1 1 10 3Zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z" /></svg></button>
                    <button type="button" className="lc-clear" onClick={() => { setDelMode(true); setClearing(active); }} aria-label="Delete chat" title="Delete chat"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M9 3h6l1 2h4v2H4V5h4l1-2Zm-3 6h12l-1 11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 9Zm4 2v8h2v-8h-2Zm4 0v8h2v-8h-2Z" /></svg></button>
                  </span>
                </header>
                {findOpen && (
                  <div className="lc-findbar">
                    <input autoFocus value={fq} onChange={(e) => setFq(e.target.value)} placeholder="Search this chat" autoComplete="off" aria-label="Search this chat" />
                    {fq.trim().length >= 2 && (
                      <div className="lc-found">
                        {found === null ? <p>Searching…</p> : !found.length ? <p>No messages found</p> : found.map((f) => (
                          <button type="button" key={f._id} onClick={() => jumpTo(f._id)}><b>{f.fromRole === role ? "You" : f.fromRole === "admin" ? "CYT Care Team" : other.name}</b><span>{f.body}</span><time>{dayLabel(f.createdAt)} {timeOf(f.createdAt)}</time></button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="lc-msgs" ref={scroller} onScroll={(e) => { const el = e.currentTarget; if (Date.now() > autoUntil.current) atBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80; if (atBottom.current && newCount) setNewCount(0); if (el.scrollTop < 60 && conv.more && !loadingMore && Date.now() > autoUntil.current) loadEarlier(); }}>
                  <PullBar {...msgPull} />
                  {conv.more && <button type="button" className="lc-earlier" disabled={loadingMore} onClick={loadEarlier}>{loadingMore ? "Loading…" : "Load earlier messages"}</button>}
                  {conv.messages.length === 0 && <p className="lc-start">{isSupport ? "Write to the CYT Care Team 👋 — we reply every day, 9 AM – 9 PM." : <>Say hello 👋 — {role === "client" ? "keep it short and simple." : "your reply goes to the client right away."}</>}</p>}
                  {(() => {
                    const ms = conv.messages;
                    const lastMine = [...ms].reverse().find((x) => x.fromRole === role && !x.deleted && !x.pending && !x.failed);
                    const gap = (a, b) => Math.abs(new Date(b.createdAt) - new Date(a.createdAt));
                    const near = (a, b) => !!(a && b && a.fromRole === b.fromRole && a.fromRole !== "system" && dayKey(a.createdAt) === dayKey(b.createdAt) && gap(a, b) < 5 * 60000);
                    return ms.map((m, i) => {
                      const prev = ms[i - 1], next = ms[i + 1];
                      const stamp = !prev || dayKey(prev.createdAt) !== dayKey(m.createdAt) || gap(prev, m) > 30 * 60000;
                      const mine = m.fromRole === role;
                      const first = stamp || !near(prev, m);
                      const last = !near(m, next);
                      const canDel = mine && !m.deleted && !m.pending && !m.failed && Date.now() - new Date(m.createdAt).getTime() < 10 * 60000;
                      return (
                        <React.Fragment key={m._id}>
                          {stamp && <div className="lc-day"><b>{dayLabel(m.createdAt)}</b> {timeOf(m.createdAt)}</div>}
                          {m.fromRole === "system" ? (
                            m.kind === "rate" ? (
                              <div className="lc-rate">
                                <span>{m.meta?.stars ? "Thanks for rating the CYT Care Team" : m.body}</span>
                                <div role="radiogroup" aria-label="Rate the CYT Care Team">{[1, 2, 3, 4, 5].map((n) => <button type="button" key={n} className={n <= (m.meta?.stars || 0) ? "on" : ""} disabled={!!m.meta?.stars} onClick={() => rate(m, n)} aria-label={`${n} star${n > 1 ? "s" : ""}`}>★</button>)}</div>
                              </div>
                            ) : <div className={`lc-sys${m.kind === "crisis-help" ? " crisis" : ""}`}><span>{m.kind === "crisis-help" ? "🆘 " : ""}{m.body}</span></div>
                          ) : (
                            <div id={`lcm-${m._id}`} className={`lc-row${mine ? " me" : ""}${first ? " first" : ""}${last ? " last" : ""}${hl === m._id ? " hl" : ""}`}>
                              <div className={`lc-bub${m.deleted ? " del" : ""}${m.crisis && !mine ? " flag" : ""}${m.pending ? " sending" : ""}${m.failed ? " failed" : ""}${["booking","review","tool","assessment","therapist","noida"].includes(m.kind) ? " lc-bubcard" : ""}`} title={timeOf(m.createdAt)} {...(!m.deleted && !m.pending && !m.failed ? touchFor(m) : {})}>
                                {m.kind === "pre-question" && <em className="lc-tag">Question before booking</em>}
                                {m.replyTo && !m.deleted && (
                                  <button type="button" className="lc-quote" onClick={() => jumpTo(m.replyTo.id)}><b>{m.replyTo.fromRole === role ? "You" : m.replyTo.fromRole === "admin" ? "CYT Care Team" : other.name}</b><span>{m.replyTo.body}</span></button>
                                )}
                                {m.deleted ? <i>This message was deleted</i> : m.kind === "review" ? (
                                  <div className="lc-bookcard">
                                    <b>⭐ {m.meta?.name || other.name} would love a short review</b>
                                    <span>A few words about your sessions help others find the right support.</span>
                                    {role === "client" ? <Link href={`/view-profile/${m.meta?.therapistId || conv.thread.therapistId}#write-review`} className="lc-btn sm">Write a review ›</Link> : <em>Review request sent</em>}
                                  </div>
                                ) : m.kind === "tool" ? (
                                  <div className="lc-bookcard">
                                    <b>🧰 {m.meta?.name || "Worksheet"}</b>
                                    {m.meta?.note ? <span>“{m.meta.note}”</span> : <span>Fill it in your CYT account — it takes a few minutes.</span>}
                                    {role === "client" ? <Link href={m.meta?.path || "/client/worksheets"} className="lc-btn sm">Open worksheet ›</Link> : <em>Worksheet sent</em>}
                                  </div>
                                ) : m.kind === "assessment" ? (
                                  <div className="lc-bookcard">
                                    <b>📋 {m.meta?.title || "Assessment"}{m.meta?.short ? ` (${m.meta.short})` : ""}</b>
                                    <span>{m.meta?.price != null ? `₹${m.meta.price} · ` : ""}a clinical assessment with your report right after.</span>
                                    {role === "client" ? <Link href={`${assessmentPath(m.meta?.tool || "")}?mode=self`} className="lc-btn sm">Take the assessment ›</Link> : <em>Assessment sent</em>}
                                  </div>
                                ) : m.kind === "therapist" ? (
                                  <div className="lc-bookcard lc-thcard">
                                    <div className="lc-thcard-p"><Avatar p={{ name: m.meta?.name, photo: m.meta?.photo }} size={52} /><span><b>{m.meta?.name}<VTick /></b><small>{[m.meta?.title, m.meta?.place].filter(Boolean).join(" · ")}</small></span></div>
                                    <span>Suggested for you by the CYT Care Team.</span>
                                    <div className="lc-thcard-b"><Link href={`/view-profile/${m.meta?.therapistId}`} className="lc-btn sm ghost">View profile</Link><Link href={`/book/${m.meta?.therapistId}`} className="lc-btn sm">Book ›</Link></div>
                                  </div>
                                ) : m.kind === "noida" ? (
                                  <div className="lc-bookcard">
                                    <b>📍 CYT Noida centre · Sector 51</b>
                                    <span>Meet a psychologist in person — pick a time that suits you.</span>
                                    <div className="lc-thcard-b"><Link href="/noida-appointment" className="lc-btn sm">Book at the centre ›</Link><a href={NOIDA_DIRECTIONS} target="_blank" rel="noopener noreferrer" className="lc-btn sm ghost">Directions</a></div>
                                  </div>
                                ) : m.kind === "booking" ? (
                                  <div className="lc-bookcard">
                                    <b>📅 Book a session with {m.meta?.name || other.name}</b>
                                    <span>Pick a time that suits you — it takes a minute.</span>
                                    {role === "client" ? <Link href={`/book/${m.meta?.therapistId || conv.thread.therapistId}`} className="lc-btn sm">Book a slot ›</Link> : <em>Booking link sent</em>}
                                  </div>
                                ) : <p>{m.body}</p>}
                                {m.editedAt && !m.deleted && <small className="lc-edited">edited</small>}
                                {!m.deleted && !m.pending && !m.failed && <button type="button" className="lc-more" onClick={() => setMenu(m)} aria-label="Message options">⋯</button>}
                              </div>
                            </div>
                          )}
                          {m.reactions && m.reactions.length > 0 && !m.deleted && (
                            <div className={`lc-reacts${mine ? " me" : ""}`}>{groupReacts(m.reactions).map(([e, n]) => <button type="button" key={e} onClick={() => react(m, e)}>{e}{n > 1 ? ` ${n}` : ""}</button>)}</div>
                          )}
                          {m.pending && <div className="lc-receipt">Sending…</div>}
                          {m.failed && (
                            <div className="lc-receipt fail">
                              <button type="button" onClick={() => send(null, m)}>Not sent · Tap to retry</button>
                              <button type="button" onClick={() => setConv((c) => ({ ...c, messages: c.messages.filter((x) => x._id !== m._id) }))} aria-label="Remove this message">✕</button>
                            </div>
                          )}
                          {lastMine && m._id === lastMine._id && <div className="lc-receipt">{m.readAt ? <><b>Read</b> {timeOf(m.readAt)}</> : "Delivered"}</div>}
                        </React.Fragment>
                      );
                    });
                  })()}
                  {typingIn[active] > Date.now() && <div className="lc-row first last"><div className="lc-bub lc-dots" aria-label="typing"><i /><i /><i /></div></div>}
                  {newCount > 0 && <button type="button" className="lc-newmsg" onClick={() => scrollDown(true)}>↓ {newCount} new message{newCount === 1 ? "" : "s"}</button>}
                </div>

                {st?.note && (
                  <div className={`lc-note ${st.mode}`}>
                    <span>{st.note}</span>
                    {role === "client" && (st.mode !== "open") && <Link href={bookHref} className="lc-btn sm">Book a session</Link>}
                    {role === "therapist" && !isSupport && st.mode !== "open" && <button type="button" className="lc-btn sm" onClick={() => openKit()}>＋ Send booking link, review, worksheet…</button>}
                  </div>
                )}
                {err && <div className="lc-err" role="alert">{err}</div>}
                {st?.canSend && (
                  <>
                    {role === "therapist" && !isSupport && st.mode === "open" && !text && (
                      <div className="lc-quick"><button type="button" className="lc-bk" onClick={sendCard}>📅 Send booking link</button>{QUICK.map((x) => <button type="button" key={x} onClick={() => typed(x)}>{x}</button>)}</div>
                    )}
                    {(replyTo || editing) && (
                      <div className="lc-replybar">
                        <span><b>{editing ? "Editing your message" : `Replying to ${replyTo.fromRole === role ? "yourself" : replyTo.fromRole === "admin" ? "CYT Care Team" : other.name}`}</b>{(editing || replyTo).body}</span>
                        <button type="button" onClick={() => { if (editing) { setText(""); } setEditing(null); setReplyTo(null); }} aria-label="Cancel">✕</button>
                      </div>
                    )}
                    <form className="lc-comp" onSubmit={(e) => { e.preventDefault(); send(); }}>
                      {role === "therapist" && !isSupport && <button type="button" className="lc-plus" onClick={() => openKit()} aria-label="Send a booking link, review request, worksheet or assessment" title="Send…">＋</button>}
                      <textarea rows={1} autoComplete="off" data-lpignore="true" data-form-type="other" enterKeyHint="send" name="cyt-chat-message" value={text} maxLength={2000} placeholder={st.mode === "pre" && role === "client" ? "Ask your one question…" : "Message"}
                        onChange={(e) => { typed(e.target.value); e.target.style.height = "auto"; e.target.style.height = `${Math.min(140, e.target.scrollHeight)}px`; }}
                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && window.matchMedia("(pointer: fine)").matches) { e.preventDefault(); send(); } }} aria-label="Message" />
                      <button type="submit" disabled={!text.trim()} aria-label={editing ? "Save" : "Send"}>{editing ? "Save" : "Send"}</button>
                    </form>
                  </>
                )}
              </>
            )}
          </section>
        </div>
      )}
      {kitOpen && conv && (
        <div className="lc-scrim lc-menu-scrim" role="dialog" aria-label="Send to your client" onClick={(e) => e.target === e.currentTarget && setKitOpen(null)}>
          <div className="lc-menu lc-kit">
            <div className="lc-kit-h">
              {kitOpen !== "menu" && <button type="button" onClick={() => setKitOpen("menu")} aria-label="Back">‹</button>}
              <b>{kitOpen === "tools" ? "Send a worksheet" : kitOpen === "tests" ? "Send an assessment" : `Send to ${other.name}`}</b>
              <button type="button" onClick={() => setKitOpen(null)} aria-label="Close">✕</button>
            </div>
            {kitMsg && <p className="lc-kit-err">{kitMsg}</p>}
            {kitOpen === "menu" && (
              <div className="lc-menu-acts">
                <button type="button" onClick={async () => { await sendCard(); setKitOpen(null); }}>📅 Booking link <small>They pick a time and book you</small></button>
                <button type="button" disabled={!!kitBusy} onClick={() => postCard({ type: "review" }, "review")}>⭐ Ask for a review <small>{kitBusy === "review" ? "Sending…" : "Opens the review box on your profile"}</small></button>
                <button type="button" onClick={() => setKitOpen("tools")}>🧰 Send a worksheet <small>From your Toolkit</small></button>
                <button type="button" onClick={() => setKitOpen("tests")}>📋 Send an assessment <small>At the price CYT has set</small></button>
              </div>
            )}
            {kitOpen === "tools" && (
              <div className="lc-kit-list">
                {kit === null ? <p className="lc-kit-mut">Loading…</p> : kit.tools.map((x) => (
                  <button type="button" key={x.key} disabled={!!kitBusy} onClick={() => sendTool(x.key)}>{x.name}{kitBusy === x.key ? <small>Sending…</small> : null}</button>
                ))}
              </div>
            )}
            {kitOpen === "tests" && (
              <div className="lc-kit-list">
                {kit === null ? <p className="lc-kit-mut">Loading…</p> : kit.tests.map((x) => (
                  <button type="button" key={x.key} disabled={!!kitBusy} onClick={() => postCard({ type: "assessment", tool: x.key }, x.key)}>
                    <span>{x.title} <i>{x.short}</i></span><small>{kitBusy === x.key ? "Sending…" : x.price != null ? `₹${x.price}` : ""}</small>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {menu && conv && (
        <div className="lc-scrim lc-menu-scrim" role="dialog" aria-label="Message options" onClick={(e) => e.target === e.currentTarget && setMenu(null)}>
          <div className="lc-menu">
            <p className="lc-menu-msg">{menu.kind === "booking" ? "📅 Booking link" : menu.body}</p>
            <div className="lc-menu-emo">{EMOJI.map((e) => <button type="button" key={e} onClick={() => react(menu, e)} aria-label={`React ${e}`}>{e}</button>)}</div>
            <div className="lc-menu-acts">
              {st?.canSend && <button type="button" onClick={() => startReply(menu)}>↩ Reply</button>}
              {!["booking","review","tool","assessment","therapist","noida"].includes(menu.kind) && <button type="button" onClick={() => copyMsg(menu)}>⧉ Copy</button>}
              {menu.fromRole === role && ["text", "pre-question", "pre-answer"].includes(menu.kind || "text") && Date.now() - new Date(menu.createdAt).getTime() < 10 * 60000 && <button type="button" onClick={() => startEdit(menu)}>✎ Edit</button>}
              {menu.fromRole === role && Date.now() - new Date(menu.createdAt).getTime() < 10 * 60000 && <button type="button" className="bad" onClick={() => { const m = menu; setMenu(null); remove(m); }}>🗑 Delete for everyone</button>}
              <button type="button" className="cancel" onClick={() => setMenu(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {clearing && (
        <ClearSheet threadId={clearing} remove={delMode} otherName={(threads || []).find((x) => x._id === clearing)?.other?.name || other?.name} onClose={() => setClearing(null)}
          onDone={() => { const id = clearing; setClearing(null); setSwiped(null);
            if (delMode) { setThreads((l) => (l ? l.filter((x) => x._id !== id) : l)); if (id === active) { setActive(null); router.replace({ pathname: router.pathname }, undefined, { shallow: true }); } loadThreads(); return; }
            if (id === active) fetchById(`${API}/threads/${id}`).then((r) => r?.status && setConv(r.data)).catch(() => {}); loadThreads(); }} />
      )}
      {settings && <Settings onClose={() => setSettings(false)} />}
      {alerts && <Alerts onClose={() => setAlerts(false)} />}
    </div>
  );
}

/* small dashboard widget: latest chats + unread, live */
export function MessagesWidget({ role }) {
  const [threads, setThreads] = useState(null);
  const href = role === "therapist" ? "/therapists/messages" : "/client/messages";
  useEffect(() => {
    const load = () => fetchById(`${API}/threads`).then((r) => r?.status && setThreads(Array.isArray(r.data?.threads) ? r.data.threads : [])).catch(() => setThreads([]));
    load();
    const token = getToken();
    if (!token || typeof EventSource === "undefined") return undefined;
    const es = new EventSource(`${API}/stream?token=${encodeURIComponent(token)}`);
    es.addEventListener("message", load);
    es.addEventListener("read", load);
    return () => es.close();
  }, []);
  const unread = (threads || []).reduce((n, t) => n + (t.unread || 0), 0);
  return (
    <section className="chw">
      <style>{W_CSS + VTICK_CSS}</style>
      <div className="chw-h">
        <span className="chw-ic" aria-hidden="true">💬</span>
        <b>Messages</b>
        {unread > 0 && <em>{unread} new</em>}
        <Link href={href} className="chw-all">Open ›</Link>
      </div>
      {threads === null ? <p className="chw-muted">Loading…</p> : !threads.length ? (
        <p className="chw-muted">{role === "therapist" ? "No messages yet. Clients can message you after booking, or ask one question from your profile." : "Message your therapist between sessions, or ask a therapist a question from their profile."}</p>
      ) : (
        <ul>
          {threads.slice(0, 3).map((t) => (
            <li key={t._id}>
              <Link href={`${href}?t=${t._id}`} className={t.unread ? "unread" : ""}>
                <Avatar p={t.other} size={36} />
                <span><b>{t.other.name}{t.other.support ? <VTick kind="team" size={13} /> : role === "client" ? <VTick size={13} /> : null}</b><small>{t.lastFrom === role ? "You: " : ""}{t.preview}</small></span>
                <time>{listTime(t.lastMessageAt)}</time>
                {t.unread > 0 && <em className="lc-badge">{t.unread}</em>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

const AV_CSS = `
.lc-av { position: relative; flex: none; display: inline-grid; place-items: center; border-radius: 50%; background: linear-gradient(160deg, #d9f2e3, #a7dcbc); color: #14532d; overflow: visible; }
.lc-av img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
.lc-av b { font-size: 15px; font-weight: 800; }
.lc-on { position: absolute; right: 0; bottom: 0; width: 12px; height: 12px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 0 2px #fff; }
.lc-badge { flex: none; min-width: 22px; height: 22px; padding: 0 6px; border-radius: 999px; background: #22a55a; color: #fff; font-style: normal; font-size: 12px; font-weight: 800; display: inline-grid; place-items: center; }
`;

const CSS = AV_CSS + `
.lc { max-width: 1200px; margin: 0 auto; color: #1c1c1e; }
.lc-app { display: grid; grid-template-columns: minmax(260px, 340px) minmax(0, 1fr); height: calc(100dvh - 150px); min-height: 520px; background: #fff; border-radius: 22px; overflow: hidden;
  box-shadow: 0 1px 2px rgba(0,0,0,.04), 0 16px 36px -24px rgba(15,23,42,.4); }
.lc-list { display: flex; flex-direction: column; min-height: 0; border-right: 1px solid #eef1f0; background: #fbfcfb; }
.lc-list-h { display: flex; align-items: center; justify-content: space-between; padding: 16px 16px 8px; }
.lc-list-h h1 { margin: 0; font-size: 22px; font-weight: 800; display: flex; align-items: center; gap: 8px; }
.lc-live { font-size: 11px; font-weight: 800; color: #16a34a; background: #e3f6ea; border-radius: 999px; padding: 3px 8px; }
.lc-hbtns { display: flex; gap: 6px; }
.lc-nudge { display: flex; align-items: center; gap: 8px; margin: 0 14px 8px; padding: 8px 10px; border-radius: 14px; background: #fff7e6; border: 1px solid #f3e2bb; }
.lc-nudge > span { font-size: 18px; } .lc-nudge p { flex: 1; margin: 0; font-size: 12.5px; color: #5b4310; line-height: 1.35; }
.lc-nudge button { flex: none; height: 30px; padding: 0 10px; border: 0; border-radius: 9px; background: #14532d; color: #fff; font: inherit; font-size: 12.5px; font-weight: 800; cursor: pointer; }
.lc-nudge button.no { width: 26px; padding: 0; background: none; color: #8e8e93; font-size: 17px; }
.lc-alert { display: flex; gap: 12px; padding: 12px 14px; border-radius: 16px; background: #f4f7f5; margin-bottom: 14px; }
.lc-alert > span { font-size: 24px; } .lc-alert > div { flex: 1; display: flex; flex-direction: column; gap: 4px; align-items: flex-start; }
.lc-alert small { font-size: 12.5px; color: #6e6e73; line-height: 1.45; }
.lc-alert .lc-btn { margin-top: 6px; }
.lc-ok { font-style: normal; font-size: 12.5px; font-weight: 800; color: #15803d; background: #e3f6ea; border-radius: 999px; padding: 3px 10px; }
.lc-test { height: 38px; padding: 0 14px; border-radius: 12px; border: 1px solid #d4e5da; background: #fff; color: #14532d; font: inherit; font-size: 13.5px; font-weight: 800; cursor: pointer; }
.lc-privacy { margin: 14px 0 0; font-size: 12.5px; color: #6e6e73; }
.lc-gear { width: 36px; height: 36px; border-radius: 50%; border: 0; background: #eef2f0; font-size: 18px; cursor: pointer; }
.lc-search { display: flex; align-items: center; gap: 8px; margin: 0 14px 8px; padding: 0 12px; height: 38px; border-radius: 12px; background: #eef2f0; color: #8e8e93; }
.lc-search input { flex: 1; min-width: 0; border: 0 !important; background: none !important; box-shadow: none !important; font: inherit; font-size: 14.5px; height: 36px; padding: 0 !important; outline: none; }
.lc-items { flex: 1; overflow-y: auto; padding: 4px 8px 12px; }
.lc-item { width: 100%; display: flex; align-items: center; gap: 12px; padding: 10px; border: 0; border-radius: 14px; background: none; text-align: left; cursor: pointer; font: inherit; color: inherit; }
.lc-item:hover { background: #f0f4f2; }
.lc-item.on { background: #e5f4eb; }
.lc-item-m { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.lc-item-t { display: flex; align-items: baseline; gap: 8px; }
.lc-item-t b { flex: 1; min-width: 0; font-size: 15px; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lc-item-t time { flex: none; font-size: 12px; color: #8e8e93; }
.lc-item-p { font-size: 13.5px; color: #6e6e73; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lc-item.unread .lc-item-t b, .lc-item.unread .lc-item-p { color: #1c1c1e; font-weight: 800; }
.lc-empty, .lc-pick { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; text-align: center; padding: 30px 20px; color: #6e6e73; }
.lc-pick { height: 100%; background: radial-gradient(circle at 50% 40%, #f3faf6, #fff 60%); }
.lc-empty > span, .lc-pick > span { font-size: 38px; }
.lc-empty b, .lc-pick b { color: #1c1c1e; font-size: 16px; }
.lc-empty p, .lc-pick p { margin: 0; font-size: 14px; max-width: 300px; }
.lc-muted { color: #8e8e93; font-size: 14px; } .lc-muted.pad { padding: 16px; }
.lc-btn { display: inline-flex; align-items: center; justify-content: center; height: 40px; padding: 0 16px; border-radius: 12px; border: 0; background: #14532d; color: #fff !important; font: inherit; font-size: 14px; font-weight: 800; text-decoration: none !important; cursor: pointer; margin-top: 8px; }
.lc-btn.sm { height: 34px; padding: 0 12px; font-size: 13px; margin: 0; flex: none; }
.lc-conv { display: flex; flex-direction: column; min-width: 0; min-height: 0; background: #f4f6f5; }
.lc-conv-h { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: rgba(255,255,255,.92); backdrop-filter: blur(10px); border-bottom: 1px solid #eef1f0; }
.lc-back { display: none; width: 34px; height: 34px; border: 0; border-radius: 50%; background: none; font-size: 30px; line-height: 1; color: #14532d; cursor: pointer; }
.lc-conv-who { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.lc-conv-who b { font-size: 16px; font-weight: 800; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lc-conv-who small { font-size: 12.5px; color: #16a34a; }
.lc-book { flex: none; height: 34px; display: inline-flex; align-items: center; padding: 0 14px; border-radius: 999px; background: #14532d; color: #fff !important; font-size: 13.5px; font-weight: 800; text-decoration: none !important; }
.lc-msgs { flex: 1; overflow-y: auto; padding: 14px 16px 10px; display: flex; flex-direction: column; gap: 4px; overscroll-behavior: contain; }
.lc-start { align-self: center; margin: 20px 0; font-size: 13.5px; color: #8e8e93; }
.lc-day { display: flex; justify-content: center; margin: 10px 0 6px; }
.lc-day span { font-size: 11.5px; font-weight: 700; color: #6e6e73; background: #e6ebe8; border-radius: 999px; padding: 3px 10px; }
.lc-row { display: flex; } .lc-row.me { justify-content: flex-end; }
.lc-bub { position: relative; max-width: min(76%, 560px); padding: 8px 12px 6px; border-radius: 6px 18px 18px 18px; background: #fff; box-shadow: 0 1px 1px rgba(0,0,0,.06); }
.lc-row.me .lc-bub { border-radius: 18px 6px 18px 18px; background: linear-gradient(160deg, #1f8a52, #15703f); color: #fff; }
.lc-bub p { margin: 0; font-size: 15px; line-height: 1.45; white-space: pre-wrap; overflow-wrap: anywhere; }
.lc-bub.del i { font-size: 13.5px; opacity: .7; }
.lc-bub.flag { box-shadow: 0 0 0 2px #fca5a5; }
.lc-tag { display: block; font-style: normal; font-size: 11px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; opacity: .75; margin-bottom: 2px; }
.lc-meta { display: flex; justify-content: flex-end; gap: 4px; margin-top: 2px; font-size: 11px; opacity: .7; }
.lc-meta b.read { color: #a7f3d0; } .lc-row:not(.me) .lc-meta b.read { color: #0ea5e9; }
.lc-del { position: absolute; top: -8px; left: -8px; width: 22px; height: 22px; border-radius: 50%; border: 0; background: #fff; color: #b91c1c; box-shadow: 0 2px 6px rgba(0,0,0,.2); font-size: 15px; line-height: 1; cursor: pointer; opacity: 0; transition: opacity .15s; }
.lc-bub:hover .lc-del, .lc-bub:focus-within .lc-del { opacity: 1; }
@media (hover: none) { .lc-del { opacity: .85; } }
.lc-sys { display: flex; justify-content: center; margin: 6px 0; }
.lc-sys span { max-width: 88%; font-size: 13px; line-height: 1.45; text-align: center; color: #5b4310; background: #fff7e6; border: 1px solid #f3e2bb; border-radius: 14px; padding: 8px 12px; }
.lc-sys.crisis span { color: #7f1d1d; background: #fff1f1; border-color: #fecaca; font-weight: 700; }
.lc-note { display: flex; align-items: center; gap: 10px; margin: 0 12px 8px; padding: 10px 12px; border-radius: 14px; background: #eef7f1; color: #14532d; font-size: 13.5px; line-height: 1.4; }
.lc-note.closed { background: #fff7e6; color: #5b4310; }
.lc-note span { flex: 1; }
.lc-err { margin: 0 12px 8px; padding: 8px 12px; border-radius: 12px; background: #fff1f1; color: #9b1c1c; font-size: 13px; }
.lc-quick { display: flex; gap: 6px; overflow-x: auto; padding: 0 12px 8px; scrollbar-width: none; }
.lc-quick button { flex: none; height: 32px; padding: 0 12px; border-radius: 999px; border: 1px solid #d4e5da; background: #fff; color: #14532d; font: inherit; font-size: 12.5px; font-weight: 700; cursor: pointer; white-space: nowrap; }
.lc-comp { display: flex; align-items: flex-end; gap: 8px; padding: 8px 12px 6px; background: #fff; border-top: 1px solid #eef1f0; }
.lc-comp textarea { flex: 1; min-width: 0; resize: none; max-height: 140px; border: 1px solid #e3e8e5 !important; border-radius: 20px !important; padding: 10px 14px !important; font: inherit; font-size: 15px; line-height: 1.4; background: #f7f9f8 !important; outline: none; box-shadow: none !important; }
.lc-comp textarea:focus { border-color: #1f8a52 !important; background: #fff !important; }
.lc-comp button { flex: none; width: 44px; height: 44px; border-radius: 50%; border: 0; background: #1f8a52; color: #fff; font-size: 17px; cursor: pointer; }
.lc-comp button:disabled { background: #b9d9c6; cursor: default; }
.lc-foot { display: block; padding: 0 16px 10px; background: #fff; font-size: 11.5px; color: #9aa3a0; }
.lc-consent { max-width: 560px; margin: 20px auto; padding: 26px; background: #fff; border-radius: 24px; box-shadow: 0 16px 36px -24px rgba(15,23,42,.4); text-align: center; }
.lc-consent-ic { display: inline-grid; place-items: center; width: 64px; height: 64px; border-radius: 20px; font-size: 32px; background: linear-gradient(160deg, #e3f6ea, #c6ead4); }
.lc-consent h2 { margin: 12px 0 10px; font-size: 22px; font-weight: 800; }
.lc-consent ul { text-align: left; margin: 0 0 18px; padding-left: 20px; display: grid; gap: 8px; font-size: 14.5px; line-height: 1.5; color: #334155; }
.lc-consent button { width: 100%; height: 50px; border-radius: 14px; border: 0; background: #14532d; color: #fff; font: inherit; font-size: 16px; font-weight: 800; cursor: pointer; }
.lc-consent small { display: block; margin-top: 10px; color: #8e8e93; }
.lc-scrim { position: fixed; inset: 0; z-index: 100000; display: grid; place-items: center; padding: 16px; background: rgba(15,23,42,.45); backdrop-filter: blur(3px); overscroll-behavior: contain; }
.lc-sheet { position: relative; width: 100%; max-width: 440px; max-height: calc(100dvh - 32px); overflow-y: auto; background: #fff; border-radius: 24px; padding: 22px; }
.lc-sheet h3 { margin: 0 0 14px; font-size: 20px; font-weight: 800; }
.lc-x { position: absolute; top: 12px; right: 12px; width: 34px; height: 34px; border-radius: 50%; border: 0; background: #f1f5f9; font-size: 20px; cursor: pointer; }
.lc-switch { position: relative; display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 16px; background: #f4f7f5; cursor: pointer; margin-bottom: 14px; }
.lc-switch span { flex: 1; display: flex; flex-direction: column; } .lc-switch small { font-size: 12.5px; color: #6e6e73; }
.lc-switch input { position: absolute; opacity: 0; pointer-events: none; }
.lc-switch i { flex: none; width: 50px; height: 30px; border-radius: 999px; background: #d1d5db; position: relative; transition: background .2s; }
.lc-switch i::after { content: ""; position: absolute; top: 3px; left: 3px; width: 24px; height: 24px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.3); transition: transform .2s; }
.lc-switch input:checked + i { background: #22a55a; } .lc-switch input:checked + i::after { transform: translateX(20px); }
.lc-f { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
.lc-f small { font-size: 12.5px; color: #6e6e73; }
.lc-f textarea { border: 1px solid #e3e8e5; border-radius: 12px; padding: 10px 12px; font: inherit; font-size: 14.5px; resize: vertical; }
.lc-hours { display: flex; align-items: center; gap: 8px; } .lc-hours input { height: 40px; border: 1px solid #e3e8e5; border-radius: 10px; padding: 0 10px; font: inherit; }
.lc-days { display: flex; flex-wrap: wrap; gap: 6px; }
.lc-days button { height: 34px; min-width: 46px; border-radius: 999px; border: 1px solid #d4e5da; background: #fff; font: inherit; font-size: 13px; font-weight: 700; cursor: pointer; }
.lc-days button.on { background: #14532d; border-color: #14532d; color: #fff; }
.lc-save { width: 100%; height: 48px; border-radius: 14px; border: 0; background: #14532d; color: #fff; font: inherit; font-size: 15px; font-weight: 800; cursor: pointer; }
/* the avatar never runs into the name under it */
.lc-conv-who .lc-av { display: block; flex: none; margin: 0 auto 4px; }
.lc-conv-who .lc-av img { display: block; width: 100% !important; height: 100% !important; max-width: none; }
.lc-conv-who { gap: 0; line-height: 1.25; }
/* swipe a chat left to delete it (touch); a bin shows on hover with a mouse */
.lc-sw { position: relative; overflow: hidden; }
.lc-sw > .lc-item { position: relative; z-index: 1; background: #fff; transition: transform .22s ease; }
.lc-sw.open > .lc-item { transform: translateX(-92px); }
.lc-sw-del { position: absolute; z-index: 0; top: 0; right: 0; bottom: 0; width: 92px; border: 0; background: #ff3b30; color: #fff; font: inherit; font-size: 13px; font-weight: 700; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; cursor: pointer; }
.lc-sw-bin { position: absolute; z-index: 2; right: 10px; top: 50%; transform: translateY(-50%); width: 34px; height: 34px; border-radius: 50%; border: 0; background: #fff; color: #8e8e93; box-shadow: 0 2px 8px -3px rgba(0,0,0,.3); display: none; place-items: center; cursor: pointer; }
.lc-sw-bin:hover { color: #ff3b30; }
@media (hover: hover) and (pointer: fine) { .lc-sw:hover .lc-sw-bin { display: grid; } }
.lc-earlier { align-self: center; margin: 6px 0 10px; height: 32px; padding: 0 14px; border: 0; border-radius: 999px; background: #f2f2f7; color: #0a84ff; font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; }
.lc-earlier:disabled { color: #8e8e93; }

/* ═══ iPhone Messages look (owner, 2026-11-23) ═══ */
.lc, .lc-sheet, .lc-consent { font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Inter, Roboto, sans-serif; -webkit-font-smoothing: antialiased; }
.lc-app { border-radius: 24px; box-shadow: 0 1px 2px rgba(0,0,0,.05), 0 20px 44px -28px rgba(0,0,0,.35); }
.lc-list { background: #fff; border-right: 1px solid rgba(60,60,67,.12); }
.lc-list-h h1 { font-size: 30px; font-weight: 800; letter-spacing: -.02em; }
.lc-gear { background: #f2f2f7; color: #1c1c1e; }
.lc-search { background: rgba(118,118,128,.12); border-radius: 11px; height: 36px; }
.lc-items { padding: 0 0 12px; }
.lc-item { position: relative; border-radius: 0; padding: 10px 14px 10px 22px; gap: 11px; }
.lc-item::after { content: ""; position: absolute; left: 83px; right: 0; bottom: 0; height: 1px; background: rgba(60,60,67,.12); }
.lc-item:hover { background: #f2f2f7; } .lc-item.on { background: #e9e9ee; }
.lc-dot { position: absolute; left: 7px; top: 50%; width: 10px; height: 10px; margin-top: -5px; border-radius: 50%; background: transparent; }
.lc-item.unread .lc-dot { background: #0a84ff; }
.lc-item-m { align-self: stretch; justify-content: center; }
.lc-item-t b { font-size: 16px; font-weight: 600; }
.lc-item-t time { font-size: 14px; color: #8e8e93; } .lc-item-t time span { color: #c7c7cc; font-size: 17px; margin-left: 2px; }
.lc-item-p { font-size: 14.5px; line-height: 1.3; color: #8e8e93; white-space: normal; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.lc-item.unread .lc-item-t b { font-weight: 700; } .lc-item.unread .lc-item-p { color: #3c3c43; font-weight: 500; }
.lc-conv { background: #fff; }
.lc-conv-h { position: relative; justify-content: space-between; padding: 8px 12px 6px; background: rgba(249,249,249,.94); -webkit-backdrop-filter: saturate(180%) blur(20px); backdrop-filter: saturate(180%) blur(20px); border-bottom: 1px solid rgba(60,60,67,.14); }
.lc-conv-who { align-items: center; text-align: center; gap: 2px; }
.lc-conv-who b { font-size: 12.5px; font-weight: 600; color: #1c1c1e; } .lc-conv-who b span { color: #c7c7cc; }
.lc-conv-who small { font-size: 11px; color: #8e8e93; }
.lc-back, .lc-hspace { width: 64px; flex: none; }
.lc-hr { flex: none; min-width: 64px; display: inline-flex; align-items: center; justify-content: flex-end; gap: 6px; }
.lc-clear { width: 34px; height: 34px; border: 0; border-radius: 50%; background: none; color: #8e8e93; display: grid; place-items: center; cursor: pointer; }
.lc-clear:hover { background: #f2f2f7; color: #ff3b30; }
.lc-clear.lc-sos { color: #d97706; } .lc-clear.lc-sos.on, .lc-clear.lc-sos:hover { background: #fff4e5; color: #b45309; }
.lc-sosp { position: absolute; z-index: 5; top: calc(100% + 6px); left: 12px; right: 12px; display: flex; flex-direction: column; gap: 2px; padding: 10px 36px 10px 12px; border-radius: 14px; background: #fff8ec; border: 1px solid #fde3b5; box-shadow: 0 12px 24px -14px rgba(0,0,0,.35); font-size: 13.5px; line-height: 1.4; color: #5b3a06; text-align: left; }
.lc-sosp b { color: #92400e; } .lc-sosp a { color: #b45309; font-weight: 800; }
.lc-sosp button { position: absolute; top: 6px; right: 6px; width: 26px; height: 26px; border: 0; border-radius: 50%; background: none; color: #92400e; font-size: 18px; cursor: pointer; }
.lc-back { justify-content: flex-start !important; color: #0a84ff; font-size: 34px; font-weight: 300; }
.lc-book { min-width: 64px; justify-content: center; background: none; color: #0a84ff !important; padding: 0; font-size: 15.5px; font-weight: 600; }
.lc-msgs { padding: 10px 14px 6px; gap: 0; }
.lc-day { display: block; text-align: center; margin: 14px 0 8px; font-size: 11.5px; color: #8e8e93; }
.lc-day b { font-weight: 600; color: #8e8e93; }
.lc-row { margin-top: 2px; } .lc-row.first { margin-top: 8px; }
.lc-bub { max-width: min(72%, 520px); padding: 7px 13px; border-radius: 19px; background: #e9e9eb; color: #000; box-shadow: none; }
.lc-row.me .lc-bub { background: linear-gradient(180deg, #3bd16a, #2fb457); color: #fff; border-radius: 19px; }
.lc-bub p { font-size: 16px; line-height: 1.32; letter-spacing: -.01em; }
/* the little tail on the last bubble of a group */
.lc-row.last .lc-bub::before, .lc-row.last .lc-bub::after { content: ""; position: absolute; bottom: 0; height: 18px; }
.lc-row.last:not(.me) .lc-bub::before { left: -7px; width: 20px; background: #e9e9eb; border-bottom-right-radius: 16px; }
.lc-row.last:not(.me) .lc-bub::after { left: -26px; width: 26px; background: #fff; border-bottom-right-radius: 10px; }
.lc-row.last.me .lc-bub::before { right: -7px; width: 20px; background: #2fb457; border-bottom-left-radius: 16px; }
.lc-row.last.me .lc-bub::after { right: -26px; width: 26px; background: #fff; border-bottom-left-radius: 10px; }
.lc-bub > * { position: relative; z-index: 1; }
.lc-bub > .lc-del { position: absolute; top: 50%; left: -32px; transform: translateY(-50%); z-index: 2; }
.lc-bub.del { background: #fff !important; border: 1px dashed #c7c7cc; color: #8e8e93 !important; }
.lc-row.last .lc-bub.del::before, .lc-row.last .lc-bub.del::after { display: none; }
.lc-bub.flag { box-shadow: 0 0 0 2px #ff3b30; }
.lc-tag { font-size: 10.5px; opacity: .65; }
.lc-receipt { text-align: right; margin: 3px 4px 4px; font-size: 11px; color: #8e8e93; } .lc-receipt b { font-weight: 600; }
.lc-sys { margin: 10px 0; } .lc-sys span { max-width: 80%; background: none; border: 0; padding: 0 8px; color: #8e8e93; font-size: 12px; }
.lc-sys.crisis span { background: #fff1f0; border-radius: 14px; padding: 9px 12px; color: #c41e16; }
.lc-note, .lc-note.closed { background: #f2f2f7; color: #3c3c43; border-radius: 14px; }
.lc-quick button { border-color: rgba(60,60,67,.18); color: #0a84ff; background: #fff; }
.lc-comp { position: relative; padding: 8px 10px 12px; background: rgba(249,249,249,.94); -webkit-backdrop-filter: saturate(180%) blur(20px); backdrop-filter: saturate(180%) blur(20px); border-top: 1px solid rgba(60,60,67,.12); }
.lc-comp textarea { border: 1px solid rgba(60,60,67,.25) !important; border-radius: 19px !important; background: #fff !important; padding: 8px 44px 8px 14px !important; font-size: 16px; min-height: 38px; }
.lc-comp textarea:focus { border-color: rgba(60,60,67,.35) !important; }
.lc-comp button { position: absolute; right: 15px; bottom: 11px; width: 30px; height: 30px; display: grid; place-items: center; background: #34c759; }
.lc-comp button:disabled { background: #c7c7cc; }
.lc-foot { background: rgba(249,249,249,.94); text-align: center; color: #aeaeb2; }
.lc-app .lc-av { background: linear-gradient(180deg, #a5abb8, #858b98); color: #fff; } .lc-app .lc-av b { font-weight: 600; letter-spacing: .02em; }
.lc-on { background: #34c759; }
.lc-app .lc-av.cyt { background: #fff; box-shadow: inset 0 0 0 1px rgba(60,60,67,.14); } .lc-av.cyt img { object-fit: contain; padding: 5px; box-sizing: border-box; }

/* the page doesn't scroll on the Messages screen — the chat box is sized to fit (JS above) */
html.lc-lock, html.lc-lock body { overflow: hidden !important; overscroll-behavior: none; }
html.lc-lock, html.lc-lock body { background: #fff !important; }
/* the portals open pages with a zoom (transform) — a transformed parent would trap the full-screen conversation */
html.lc-lock .ts-page.ts-zoom, html.lc-lock .cls-main.cls-zoom, html.lc-lock .ts-page, html.lc-lock .cls-main { animation: none !important; transform: none !important; }
.lc-app { height: calc(100dvh - 150px); }
/* the whole page (owner, 2026-11-23): a fixed frame between the top bar, the side menu, the screen edge and the
   bottom dock (top / left / height set by fit() above) — no card, no rounded corners, nothing moves */
html.lc-lock .lc-app { position: fixed; right: 0; top: 0; left: 0; z-index: 900; min-height: 0; max-width: none; border-radius: 0; box-shadow: none; border-top: 1px solid rgba(60,60,67,.1); }
html.lc-lock .lc-list, html.lc-lock .lc-conv { min-height: 0; }
.lc-items, .lc-msgs { overscroll-behavior: contain; -webkit-overflow-scrolling: touch; }
.lc-conv-h, .lc-comp, .lc-quick, .lc-note, .lc-err, .lc-foot { flex: none; }
.lc-home { display: none; align-self: flex-start; margin: 10px 0 0 10px; padding: 4px 6px; font-size: 16px; font-weight: 500; color: #0a84ff !important; text-decoration: none !important; }

/* phones + iPad portrait: one pane at a time — the list, or the open chat with the back arrow at the top */
@media (max-width: 899px), (max-width: 1100px) and (orientation: portrait) {
  .lc-app { grid-template-columns: minmax(0, 1fr); }
  .lc.has-active .lc-list { display: none; }
  .lc:not(.has-active) .lc-conv { display: none; }
  .lc-back { display: inline-grid; place-items: center; }
  .lc-list { border-right: 0; }
}
/* phones + iPad portrait: an open chat is the whole screen, like iPhone Messages — the portal's top bar and the bottom
   dock are covered; header, messages and the typing box stay put; it shrinks above the keyboard (owner, 2026-11-23) */
@media (max-width: 899px), (max-width: 1100px) and (orientation: portrait) {
  html.lc-lock .lc.has-active .lc-app { top: var(--lc-vvt, 0px) !important; left: 0 !important; right: 0; height: var(--lc-vvh, 100dvh) !important; z-index: 2100; border-top: 0; }
  .lc.has-active .lc-conv-h { padding-top: calc(8px + env(safe-area-inset-top, 0px)); }
  .lc.has-active .lc-foot { padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px)); }
  /* the typing box keeps clear of the bottom edge / home indicator (owner, 2026-11-24) */
  .lc.has-active .lc-comp { padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px)); }
}
/* bottom menu tucked away on Messages (owner, 2026-11-24) */
html.lc-lock .tn-mob-nav, html.lc-lock .cls-mob { transition: translate .35s cubic-bezier(.3,.8,.3,1); }
html.lc-lock.lc-nav-min .tn-mob-nav, html.lc-lock.lc-nav-min .cls-mob { translate: 0 calc(100% + 40px); }
.lc-navtab { position: fixed; left: 50%; bottom: calc(2px + env(safe-area-inset-bottom, 0px)); transform: translateX(-50%); z-index: 950; width: 140px; height: 20px; border: 0; padding: 0; background: none; cursor: pointer; display: none; place-items: center; }
.lc-navtab i { display: block; width: 110px; height: 5px; border-radius: 999px; background: rgba(28,28,30,.32); }
html.lc-has-nav .lc-navtab { display: grid; }
@media (max-width: 899px), (max-width: 1100px) and (orientation: portrait) { html.lc-has-nav .lc.has-active .lc-navtab { display: none; } }
html.lc-has-nav.lc-nav-min .lc-list { padding-bottom: calc(22px + env(safe-area-inset-bottom, 0px)); }
html.lc-has-nav.lc-nav-min .lc-comp { padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px)); }
/* back to the dashboard: phones and iPads (the desktop has the side menu) */
@media (max-width: 1199px), (pointer: coarse) { .lc-home { display: inline-block; } .lc-list-h { padding-top: 2px; } }
@media (max-width: 600px) {
  .lc-bub { max-width: 84%; }
}
/* header: the person in the exact centre, whatever sits left / right (owner, 2026-11-24) */
.lc-conv-h { position: relative; }
.lc-conv-h .lc-back, .lc-conv-h .lc-hr { flex: 0 0 78px !important; width: 78px; min-width: 0; }
.lc-conv-h .lc-conv-who { flex: 1 1 auto; min-width: 0; position: static; transform: none; padding: 2px 0; }
.lc-conv-h { align-items: center; }
.lc-conv-h .lc-back { display: inline-flex !important; align-items: center; gap: 2px; height: 36px; padding: 0; border-radius: 0; font-size: 16px !important; font-weight: 500 !important; color: #0a84ff; white-space: nowrap; }
.lc-conv-h .lc-back span { font-size: 30px; font-weight: 300; line-height: 1; margin-top: -3px; }
@media (min-width: 900px) and (orientation: landscape) { .lc-conv-h .lc-back { display: none !important; } .lc-conv-h .lc-hr { flex-basis: auto !important; width: auto; } }

/* "Send" written on the button, beside the typing box (owner, 2026-11-24) */
.lc-comp { display: flex !important; align-items: flex-end; gap: 8px; }
.lc-comp textarea { flex: 1; min-width: 0; padding-right: 14px !important; }
.lc-comp button[type="submit"] { position: static !important; flex: none; width: auto !important; height: 38px !important; min-width: 64px; padding: 0 16px !important; border-radius: 19px !important; border: 0;
  background: #34c759; color: #fff; font: inherit; font-size: 15px; font-weight: 700; letter-spacing: .01em; display: inline-flex !important; align-items: center; justify-content: center; cursor: pointer; margin-bottom: 1px; }
.lc-comp button[type="submit"]:disabled { background: #c7c7cc; color: #fff; }

/* keyboard up: the typing box sits right on the keyboard — no home-indicator gap (owner, 2026-11-24) */
html.lc-kb .lc .lc-comp, html.lc-kb .lc.has-active .lc-comp, html.lc-kb.lc-has-nav.lc-nav-min .lc .lc-comp { padding-bottom: 8px !important; }
/* Phase A (owner, 2026-11-25): sending / not sent, typing…, ↓ new messages */
.lc-bub.sending { opacity: .62; }
.lc-bub.failed { opacity: .8; box-shadow: 0 0 0 1.5px #ff3b30 inset; }
.lc-receipt.fail { display: flex; justify-content: flex-end; align-items: center; gap: 10px; }
.lc-receipt.fail button { border: 0; background: none; padding: 2px 0; font: inherit; font-size: 12px; font-weight: 700; color: #ff3b30; cursor: pointer; }
.lc-typing { color: #34c759 !important; font-weight: 600; font-style: normal; }
.lc-bub.lc-dots { display: inline-flex; align-items: center; gap: 4px; padding: 12px 14px; }
.lc-dots i { width: 7px; height: 7px; border-radius: 50%; background: #8e8e93; animation: lcDot 1.2s infinite ease-in-out; }
.lc-dots i:nth-child(2) { animation-delay: .15s; } .lc-dots i:nth-child(3) { animation-delay: .3s; }
@keyframes lcDot { 0%, 60%, 100% { opacity: .3; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-3px); } }
@media (prefers-reduced-motion: reduce) { .lc-dots i { animation: none; opacity: .6; } }
.lc-newmsg { position: sticky; bottom: 8px; align-self: center; z-index: 5; flex: none; margin-top: 8px; border: 0; border-radius: 999px; padding: 8px 16px; background: #0a84ff; color: #fff;
  font: inherit; font-size: 13.5px; font-weight: 700; box-shadow: 0 4px 14px rgba(0,0,0,.18); cursor: pointer; }
/* Phase C (owner, 2026-11-25): quote, reactions, edited, menu, booking card, search, rating */
.lc-bub { position: relative; -webkit-touch-callout: none; }
.lc-quote { display: flex; flex-direction: column; gap: 1px; width: 100%; margin: 0 0 5px; padding: 5px 9px; border: 0; border-left: 3px solid #0a84ff; border-radius: 8px; background: rgba(0,0,0,.06); text-align: left; font: inherit; cursor: pointer; color: inherit; }
.lc-row.me .lc-quote { background: rgba(255,255,255,.2); border-left-color: #fff; }
.lc-quote b { font-size: 12px; } .lc-quote span { font-size: 12.5px; opacity: .85; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.lc-edited { display: block; font-size: 10.5px; opacity: .7; text-align: right; margin-top: 1px; }
.lc-more { position: absolute; top: 50%; transform: translateY(-50%); right: -30px; width: 26px; height: 26px; border-radius: 50%; border: 0; background: #fff; color: #636366; box-shadow: 0 1px 3px rgba(0,0,0,.15); font-size: 15px; line-height: 1; cursor: pointer; opacity: 0; transition: opacity .15s; }
.lc-row.me .lc-more { right: auto; left: -30px; }
.lc-bub:hover .lc-more, .lc-more:focus-visible { opacity: 1; }
@media (hover: none) { .lc-more { display: none; } }
.lc-bub > .lc-del { display: none !important; }
.lc-reacts { display: flex; gap: 4px; margin: -4px 14px 4px; } .lc-reacts.me { justify-content: flex-end; }
.lc-reacts button { border: 1px solid #e5e5ea; background: #fff; border-radius: 999px; padding: 1px 7px; font: inherit; font-size: 13px; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,.06); }
.lc-row.hl .lc-bub { animation: lcHl 2s ease; } @keyframes lcHl { 0%, 60% { box-shadow: 0 0 0 3px #ffd60a; } 100% { box-shadow: none; } }
.lc-bub.lc-bubcard { padding: 0 !important; overflow: hidden; }
.lc-bookcard { display: flex; flex-direction: column; gap: 4px; padding: 12px 14px; min-width: 220px; background: #fff; color: #1c1c1e; border: 1px solid #d1fae5; border-radius: inherit; }
.lc-bookcard > b { font-size: 15px; } .lc-bookcard > span { font-size: 13px; color: #6e6e73; } .lc-bookcard em { font-size: 12px; color: #15803d; font-style: normal; font-weight: 700; }
.lc-bookcard .lc-btn { align-self: flex-start; margin-top: 4px; }
.lc-rate { margin: 10px auto; padding: 12px 16px; max-width: 300px; border-radius: 16px; background: #f2f2f7; text-align: center; }
.lc-rate span { display: block; font-size: 13.5px; color: #3c3c43; margin-bottom: 6px; }
.lc-rate button { border: 0; background: none; font-size: 30px; line-height: 1; color: #d1d1d6; cursor: pointer; padding: 0 3px; } .lc-rate button.on { color: #ffcc00; } .lc-rate button:disabled { cursor: default; }
.lc-replybar { display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: #f2f2f7; border-top: 1px solid rgba(60,60,67,.12); }
.lc-replybar span { flex: 1; min-width: 0; display: flex; flex-direction: column; border-left: 3px solid #0a84ff; padding-left: 8px; font-size: 13px; color: #3c3c43; }
.lc-replybar span b { font-size: 12px; color: #0a84ff; } .lc-replybar span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lc-replybar button { flex: none; width: 28px; height: 28px; border: 0; border-radius: 50%; background: #e5e5ea; font-size: 13px; cursor: pointer; }
.lc-quick button.lc-bk { /* not "card": Bootstrap .card stacks it in a column */ background: #ecfdf3; border-color: #bbf7d0; color: #14532d; }
.lc-findbar { position: relative; flex: none; padding: 8px 12px; background: #fff; border-bottom: 1px solid #eef1f0; z-index: 6; }
.lc-findbar input { width: 100%; box-sizing: border-box; height: 38px; border: 0; border-radius: 10px; background: #eeeef0; padding: 0 12px; font: inherit; font-size: 16px; }
.lc-found { position: absolute; left: 8px; right: 8px; top: 100%; max-height: 50vh; overflow-y: auto; background: #fff; border-radius: 14px; box-shadow: 0 12px 30px rgba(0,0,0,.18); padding: 4px; }
.lc-found p { margin: 10px; font-size: 13.5px; color: #8e8e93; }
.lc-found button { display: grid; grid-template-columns: 1fr auto; gap: 2px 8px; width: 100%; padding: 9px 10px; border: 0; border-bottom: 1px solid #f2f2f7; background: none; text-align: left; font: inherit; cursor: pointer; }
.lc-found button b { font-size: 12.5px; } .lc-found button time { font-size: 11px; color: #8e8e93; }
.lc-found button span { grid-column: 1 / -1; font-size: 13.5px; color: #3c3c43; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.lc-find.on { color: #0a84ff; }
.lc-menu-scrim { align-items: end; padding: 0; }
.lc-menu { width: 100%; max-width: 420px; margin: 0 auto; background: #fff; border-radius: 18px 18px 0 0; padding: 14px 14px calc(14px + env(safe-area-inset-bottom, 0px)); box-sizing: border-box; }
@media (min-width: 700px) { .lc-menu-scrim { align-items: center; } .lc-menu { border-radius: 18px; } }
.lc-menu-msg { margin: 0 0 10px; padding: 10px 12px; border-radius: 14px; background: #f2f2f7; font-size: 14px; max-height: 96px; overflow: hidden; }
.lc-menu-emo { display: flex; justify-content: space-between; gap: 4px; margin-bottom: 10px; }
.lc-menu-emo button { flex: 1; height: 46px; border: 0; border-radius: 12px; background: #f2f2f7; font-size: 24px; cursor: pointer; }
.lc-menu-acts { display: flex; flex-direction: column; border-radius: 14px; overflow: hidden; background: #f2f2f7; }
.lc-menu-acts button { height: 48px; border: 0; border-bottom: 1px solid #e5e5ea; background: #fff; text-align: left; padding: 0 16px; font: inherit; font-size: 16px; cursor: pointer; color: #1c1c1e; }
.lc-menu-acts button.bad { color: #ff3b30; } .lc-menu-acts button.cancel { text-align: center; font-weight: 600; color: #0a84ff; border-bottom: 0; }
/* typing box like admin Live Chats (owner, 2026-11-25): white bar, rounded box with a light border, blue "Send" pill */
.lc .lc-comp { background: #fff !important; -webkit-backdrop-filter: none !important; backdrop-filter: none !important; border-top: 1px solid #eef1f0 !important; padding-top: 10px !important; padding-left: 12px !important; padding-right: 12px !important; gap: 8px !important; align-items: flex-end !important; }
.lc .lc-comp textarea { border: 1px solid #dfe6e2 !important; border-radius: 18px !important; background: #fff !important; padding: 9px 14px !important; min-height: 40px; box-sizing: border-box; font-size: 16px !important; line-height: 1.35; box-shadow: none !important; outline: none; }
.lc .lc-comp textarea:focus { border-color: #94a3b8 !important; }
.lc .lc-comp button[type="submit"] { position: static !important; flex: none; height: 40px !important; min-width: 0 !important; width: auto !important; padding: 0 18px !important; border: 0 !important; border-radius: 999px !important; background: #1d4ed8 !important; color: #fff !important; font: inherit; font-size: 15px !important; font-weight: 800 !important; display: inline-flex !important; align-items: center; justify-content: center; margin: 0 !important; cursor: pointer; }
.lc .lc-comp button[type="submit"]:disabled { background: #b7c8ee !important; color: #fff !important; cursor: default; }

/* the message list never scrolls sideways (the "⋯" button sits just outside a bubble) */
.lc .lc-msgs { overflow-x: hidden !important; }
.lc-quick button { display: inline-flex !important; align-items: center; gap: 5px; line-height: 1 !important; padding-top: 0 !important; padding-bottom: 0 !important; }

/* the last message in the chat list: one line with "…" (the second line was cut) — owner, 2026-11-25 */
.lc .lc-item-p { display: block !important; -webkit-line-clamp: unset !important; white-space: nowrap !important; overflow: hidden; text-overflow: ellipsis; }
/* therapist's chat kit (owner, 2026-11-25) */
.lc .lc-comp .lc-plus { flex: none; width: 40px !important; height: 40px !important; min-width: 0 !important; padding: 0 !important; border-radius: 50% !important; border: 1px solid #dfe6e2 !important; background: #fff !important; color: #14532d !important; font-size: 22px !important; font-weight: 600 !important; display: grid !important; place-items: center; position: static !important; }
.lc-kit { max-height: min(640px, 85vh); display: flex; flex-direction: column; }
.lc-kit-h { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.lc-kit-h b { flex: 1; font-size: 16px; text-align: center; } .lc-kit-h button { width: 32px; height: 32px; border: 0; border-radius: 50%; background: #f2f2f7; font-size: 16px; cursor: pointer; }
.lc-kit .lc-menu-acts button { display: flex; flex-direction: column; justify-content: center; height: auto; min-height: 56px; padding: 8px 16px; }
.lc-kit .lc-menu-acts button small { font-size: 12.5px; color: #8e8e93; font-weight: 400; }
.lc-kit-list { overflow-y: auto; min-height: 0; display: flex; flex-direction: column; border-radius: 14px; background: #f2f2f7; }
.lc-kit-list button { display: flex; align-items: center; justify-content: space-between; gap: 10px; min-height: 48px; padding: 8px 16px; border: 0; border-bottom: 1px solid #e5e5ea; background: #fff; text-align: left; font: inherit; font-size: 15px; cursor: pointer; }
.lc-kit-list button i { font-style: normal; font-size: 12px; color: #8e8e93; margin-left: 4px; } .lc-kit-list button small { flex: none; font-size: 13px; font-weight: 700; color: #14532d; }
.lc-kit-list button:disabled { opacity: .6; }
.lc-kit-err { margin: 0 0 8px; padding: 8px 12px; border-radius: 10px; background: #fff1f0; color: #b91c1c; font-size: 13.5px; }
.lc-kit-mut { margin: 12px; color: #8e8e93; font-size: 13.5px; }
.lc-thcard-p { display: flex; align-items: center; gap: 10px; margin-bottom: 2px; }
.lc-thcard-p > span:not(.lc-av) { display: flex; flex-direction: column; min-width: 0; color: #1c1c1e; } .lc-thcard-p b { font-size: 15.5px; color: #1c1c1e; } .lc-thcard-p small { font-size: 12.5px; color: #6e6e73; }
.lc-thcard-b { display: flex; gap: 8px; margin-top: 6px; flex-wrap: wrap; } .lc-thcard-b .lc-btn { margin-top: 0 !important; }
.lc-btn.sm.ghost { background: #fff !important; color: #14532d !important; border: 1px solid #bbf7d0 !important; }
`;

const W_CSS = AV_CSS + `
.chw { background: #fff; border-radius: 20px; padding: 14px 16px; box-shadow: 0 1px 2px rgba(0,0,0,.04), 0 10px 26px -18px rgba(15,23,42,.28); }
.chw-h { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.chw-ic { width: 34px; height: 34px; border-radius: 10px; display: grid; place-items: center; background: linear-gradient(160deg, #5ad08a, #1f8a52); font-size: 17px; }
.chw-h b { font-size: 16px; font-weight: 800; }
.chw-h em { font-style: normal; font-size: 12px; font-weight: 800; color: #fff; background: #22a55a; border-radius: 999px; padding: 2px 8px; }
.chw-all { margin-left: auto; font-size: 13.5px; font-weight: 800; color: #15803d !important; text-decoration: none !important; }
.chw-muted { margin: 4px 0; font-size: 13.5px; color: #8e8e93; line-height: 1.45; }
.chw ul { list-style: none; margin: 0; padding: 0; }
.chw li + li { border-top: 1px solid #f0f2f1; }
.chw li a { display: flex; align-items: center; gap: 10px; padding: 8px 2px; text-decoration: none !important; color: #1c1c1e !important; }
.chw li a > span:not(.lc-av) { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.chw .lc-av { flex: none !important; } .chw .lc-av img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
.chw li b { font-size: 14px; } .chw li small { font-size: 12.5px; color: #6e6e73; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.chw li a.unread b, .chw li a.unread small { font-weight: 800; color: #1c1c1e; }
.chw li time { flex: none; font-size: 11.5px; color: #8e8e93; }

`;
