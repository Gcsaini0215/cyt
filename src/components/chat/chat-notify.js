import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/router";
import { apiUrl, imagePath } from "../../utils/url";
import { getToken, getDecodedToken } from "../../utils/jwt";
import { postData, fetchById } from "../../utils/actions";
import SupportMini, { SM_CSS } from "./support-mini";
import WidgetLogin from "./widget-login";

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

const photoSrc = (p) => (!p || /pngegg|default/i.test(p) ? "" : /^(https?:|data:)/.test(p) ? p : `${imagePath}/${p}`);
const ini = (n) => String(n || "?").trim().split(/\s+/).slice(0, 2).map((x) => x[0]).join("").toUpperCase();

/* the app-wide listener + floating chat, mounted once in _app (2026-11-23, owner):
   - on every page of the website (not login / booking / payment screens, and not the Messages pages themselves),
     sitting just above any bottom bar (portal dock, mobile action bar, profile "Book" bar) or in the corner on desktop;
   - signed out: "Log in to chat", and back to the same page with the chat open;
   - clients: the CYT Care Team chat right inside the widget (the team answers in admin → Live Chats → Care Team);
   - therapists: their latest chats;
   - new-message pop-ups come out of the button, wherever it is. */
const HIDE_ON = /^\/(login|register|therapist-app|book\/|therapist-checkout|payment|checkout|noida-reception|offline|therapists\/messages|client\/messages)/;
const BARS = ".tn-mob-nav, .cls-mob, .mab, .ph-sticky, .mobile-bottom-nav";

export default function ChatNotifier() {
  const router = useRouter();
  const [toast, setToast] = useState(null);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [threads, setThreads] = useState(null);
  const [bottom, setBottom] = useState(24);
  /* drag the button anywhere (owner, 2026-11-23): it snaps to the nearest side, keeps clear of the top bar and the
     bottom bar, and this device remembers it. Untouched, it stays in the bottom corner above any bottom bar. */
  const FAB_KEY = "cyt_fab_pos";
  const [pos, setPos] = useState(null); // { side: "left" | "right", y } (y = top, px)
  const [drag, setDrag] = useState(null); // { x, y } while dragging
  const dragRef = useRef(null);
  const btnRef = useRef(null);
  useEffect(() => { try { const v = JSON.parse(localStorage.getItem(FAB_KEY) || "null"); if (v && (v.side === "left" || v.side === "right") && Number.isFinite(v.y)) setPos(v); } catch { /* ignore */ } }, []);
  const clampY = (y) => {
    const topBar = [...document.querySelectorAll(".tn-bar, .cls-bar, .rbt-header, header")].map((h) => h.getBoundingClientRect()).filter((r) => r.top <= 1 && r.height < 160).reduce((m, r) => Math.max(m, r.bottom), 0);
    const min = Math.max(12, topBar + 10);
    const max = window.innerHeight - bottom - 58;
    return Math.round(Math.min(Math.max(y, min), Math.max(min, max)));
  };
  const onDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    const r = e.currentTarget.getBoundingClientRect();
    dragRef.current = { sx: e.clientX, sy: e.clientY, dx: e.clientX - r.left, dy: e.clientY - r.top, moved: false };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ignore */ }
  };
  const onMove = (e) => {
    const d = dragRef.current; if (!d) return;
    if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < 8) return;
    d.moved = true;
    setDrag({ x: e.clientX - d.dx, y: e.clientY - d.dy });
  };
  const onUp = (e) => {
    const d = dragRef.current; dragRef.current = null;
    if (!d || !d.moved) return;
    e.preventDefault();
    d.justDragged = true; window.__lcfJustDragged = Date.now();
    const next = { side: e.clientX < window.innerWidth / 2 ? "left" : "right", y: clampY(e.clientY - d.dy) };
    setPos(next); setDrag(null);
    try { localStorage.setItem(FAB_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  };
  const resetPos = () => { setPos(null); try { localStorage.removeItem(FAB_KEY); } catch { /* ignore */ } };
  const [who, setWho] = useState(null); // null (loading) | "guest" | "client" | "therapist"
  const [authTick, setAuthTick] = useState(0); // bumps after logging in inside the widget → reconnect as that user
  const timer = useRef(null);
  const role = useRef(null);
  const base = () => (role.current === "therapist" ? "/therapists/messages" : "/client/messages");
  const path = router.asPath.split("#")[0];
  const hidden = HIDE_ON.test(path);

  const loadUnread = () => fetchById(`${apiUrl}/live-chat/unread`).then((r) => r?.status && setUnread(r.data.count || 0)).catch(() => {});

  useEffect(() => {
    const d = getDecodedToken();
    const live = d && (!d.exp || d.exp * 1000 > Date.now());
    if (!live || (d.role !== 0 && d.role !== 1)) { setWho("guest"); return undefined; }
    role.current = d.role === 1 ? "therapist" : "client";
    setWho(role.current);
    if (typeof EventSource === "undefined") return undefined;
    syncPush();
    loadUnread();
    const es = new EventSource(`${apiUrl}/live-chat/stream?token=${encodeURIComponent(getToken() || "")}`);
    es.addEventListener("message", (e) => {
      const { threadId, message } = JSON.parse(e.data || "{}");
      if (!message) return;
      // the Care Team chat open inside the widget shows it right there
      if (window.__lcMini && window.__lcMini(threadId, message)) return;
      if (message.fromRole === role.current || message.fromRole === "system") return;
      // the chat that's open and visible already shows it
      if (window.__lcActive === threadId && document.visibilityState === "visible") return;
      setUnread((n) => n + 1);
      playChime();
      if (navigator.vibrate) try { navigator.vibrate(60); } catch { /* ignore */ }
      setToast({ threadId, name: message.fromName || (role.current === "therapist" ? "Your client" : "Your therapist"), body: message.body, href: `${base()}?t=${threadId}` });
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setToast(null), 6000);
    });
    es.addEventListener("read", loadUnread);
    return () => { es.close(); clearTimeout(timer.current); };
  }, [authTick]); // eslint-disable-line react-hooks/exhaustive-deps

  // sit just above whatever bar is at the bottom of this page
  useEffect(() => {
    // above a bottom bar only while that bar is on screen; otherwise right down in the corner (owner, 2026-11-23).
    // While the page scrolls (docks slide away / back) it follows the bar every frame, so it never sits on it.
    const place = () => {
      let need = 16;
      const vh = window.innerHeight;
      for (const x of document.querySelectorAll(BARS)) {
        const cs = getComputedStyle(x);
        if (!x.offsetHeight || cs.display === "none" || cs.visibility === "hidden" || cs.position !== "fixed") continue;
        const top = x.getBoundingClientRect().top;
        if (top >= vh - 4 || top < vh * 0.5) continue; // slid away, or not a bottom bar
        need = Math.max(need, Math.round(vh - top + 12));
      }
      setBottom((v) => (v === need ? v : need));
    };
    place();
    const iv = setInterval(place, 600);
    let raf = 0, until = 0;
    const follow = () => { place(); if (performance.now() < until) raf = requestAnimationFrame(follow); };
    const onScroll = () => { until = performance.now() + 700; cancelAnimationFrame(raf); raf = requestAnimationFrame(follow); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", place);
    return () => { clearInterval(iv); cancelAnimationFrame(raf); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", place); };
  }, [router.asPath]);

  // back from logging in to chat (?chat=1): open the widget once
  // a new page closes the widget; signing in inside it keeps it open (the chat starts right there)
  useEffect(() => { setOpen(false); }, [router.asPath]);
  useEffect(() => {
    if (router.isReady && router.query.chat === "1" && who === "client") setOpen(true);
  }, [router.isReady, who]); // eslint-disable-line react-hooks/exhaustive-deps

  /* phones: the open widget is a full-screen sheet sized to the part of the screen you can actually see, so when
     the keyboard opens the messages and the typing box stay in view (owner, 2026-11-23) */
  const [sheet, setSheet] = useState(false);
  const rootRef = useRef(null);
  useEffect(() => {
    const isPhone = window.matchMedia("(max-width: 600px)").matches;
    setSheet(open && isPhone);
    if (!open || !isPhone) return undefined;
    const vv = window.visualViewport;
    const fit = () => {
      const el = rootRef.current; if (!el) return;
      if (vv && vv.offsetTop > 0 && window.innerHeight - vv.height > 150) { window.scrollTo(0, 0); document.documentElement.scrollTop = 0; }
      el.style.setProperty("--vvh", `${Math.round(vv ? vv.height : window.innerHeight)}px`);
      el.style.setProperty("--vvt", `${Math.round(vv ? vv.offsetTop : 0)}px`);
    };
    fit();
    vv?.addEventListener("resize", fit); vv?.addEventListener("scroll", fit); window.addEventListener("resize", fit);
    const b = document.body, y = window.scrollY, prev = b.style.cssText;
    b.style.position = "fixed"; b.style.top = `-${y}px`; b.style.left = "0"; b.style.right = "0"; b.style.width = "100%"; b.style.overflow = "hidden";
    return () => {
      vv?.removeEventListener("resize", fit); vv?.removeEventListener("scroll", fit); window.removeEventListener("resize", fit);
      b.style.cssText = prev; window.scrollTo(0, y);
    };
  }, [open]);

  const toggle = () => {
    if (window.__lcfJustDragged && Date.now() - window.__lcfJustDragged < 400) return;
    if (!open && who === "therapist") fetchById(`${apiUrl}/live-chat/threads`).then((r) => setThreads(Array.isArray(r?.data?.threads) ? r.data.threads : [])).catch(() => setThreads([]));
    setOpen((o) => !o); setToast(null);
  };
  const go = (href) => { setOpen(false); setToast(null); router.push(href); };

  if (typeof document === "undefined" || !who) return null;
  const fabY = pos ? clampY(pos.y) : null;
  const btnStyle = drag ? { left: drag.x, top: drag.y, right: "auto", bottom: "auto", transition: "none" }
    : pos ? { top: fabY, bottom: "auto", ...(pos.side === "left" ? { left: 14, right: "auto" } : { right: 14, left: "auto" }) } : undefined;
  const anchor = (() => {
    if (!pos || drag) return undefined;
    const low = fabY > window.innerHeight / 2;
    return { ...(pos.side === "left" ? { left: 12, right: "auto" } : { right: 12, left: "auto" }), ...(low ? { bottom: window.innerHeight - fabY + 10, top: "auto" } : { top: fabY + 66, bottom: "auto" }) };
  })();
  const showFab = !hidden;
  if (!showFab && !toast) return null;
  return createPortal((
    <div className="lcf" ref={rootRef} style={{ "--lcf-b": `${bottom}px` }}>
      <style>{CSS + SM_CSS}</style>
      {toast && (
        <button type="button" className={`lcn${showFab ? " at-fab" : ""}`} style={showFab ? anchor : undefined} onClick={() => go(toast.href)}>
          <span className="lcn-ic" aria-hidden="true">💬</span>
          <span className="lcn-m"><b>{toast.name}</b><small>{toast.body}</small></span>
          <span className="lcn-x" role="presentation" onClick={(e) => { e.stopPropagation(); setToast(null); }}>×</span>
        </button>
      )}
      {showFab && open && (
        <div className={`lcf-panel ${who}${sheet ? " sheet" : ""}`} style={sheet ? undefined : anchor} role="dialog" aria-label={who === "therapist" ? "Recent messages" : "Chat with the CYT Care Team"}>
          {who === "therapist" ? (
            <>
              <div className="lcf-h"><b>Messages</b><button type="button" onClick={() => setOpen(false)} aria-label="Close">×</button></div>
              {threads === null ? <p className="lcf-muted">Loading…</p> : !threads.length ? <p className="lcf-muted">No messages yet.</p> : (
                <ul>{threads.slice(0, 4).map((t) => (
                  <li key={t._id}><button type="button" className={t.unread ? "unread" : ""} onClick={() => go(`${base()}?t=${t._id}`)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <span className="lcf-av">{photoSrc(t.other?.photo) ? <img src={photoSrc(t.other.photo)} alt="" /> : ini(t.other?.name)}</span>
                    <span className="lcf-m"><b>{t.other?.name}</b><small>{t.lastFrom === role.current ? "You: " : ""}{t.preview}</small></span>
                    {t.unread > 0 && <em>{t.unread}</em>}
                  </button></li>
                ))}</ul>
              )}
              <button type="button" className="lcf-all" onClick={() => go(base())}>Open Messages ›</button>
              {pos && <button type="button" className="lcf-reset" onClick={resetPos}>Move the chat button back to the corner</button>}
            </>
          ) : (
            <>
              <div className="lcf-h lcf-team">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <span className="lcf-av cyt"><img src="/icons/cyt-icon-96.png" alt="" /></span>
                <span className="lcf-m"><b>CYT Care Team</b><small>Usually replies within minutes · 9 AM – 9 PM</small></span>
                <button type="button" onClick={() => setOpen(false)} aria-label="Close">×</button>
              </div>
              {who === "guest" ? (
                <div className="lcf-guest">
                  <p className="lcf-hi">Hi 👋 Not sure which therapist is right for you? Chat with our care team — we&apos;ll help you choose.</p>
                  {/* log in / sign up right here; the chat starts in the same place (owner, 2026-11-23) */}
                  {pos && <button type="button" className="lcf-reset" onClick={resetPos}>Move the chat button back to the corner</button>}
                  <WidgetLogin onDone={() => { setAuthTick((n) => n + 1); window.dispatchEvent(new Event("cyt-auth-changed")); }} />
                </div>
              ) : (
                <SupportMini page={path.slice(0, 180)} onOpenAll={(tid) => go(`/client/messages?t=${tid}`)} />
              )}
            </>
          )}
        </div>
      )}
      {showFab && !sheet && (
        <button type="button" ref={btnRef} className={`lcf-btn${open ? " on" : ""}${drag ? " dragging" : ""}`} style={btnStyle} onClick={toggle}
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={() => { dragRef.current = null; setDrag(null); }} title="Drag to move" aria-label={unread ? `Chat, ${unread} unread` : "Chat with us"} aria-expanded={open}>
          {open ? <span className="lcf-x" aria-hidden="true">×</span> : <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="currentColor" d="M12 3C6.5 3 2 6.9 2 11.6c0 2.6 1.4 4.9 3.6 6.5-.2 1.1-.7 2.5-1.8 3.6 0 0 2.9-.2 5-1.6 1 .3 2.1.4 3.2.4 5.5 0 10-3.9 10-8.6S17.5 3 12 3Z" /></svg>}
          {!open && unread > 0 && <em>{unread > 9 ? "9+" : unread}</em>}
        </button>
      )}
    </div>
  ), document.body);
}

const CSS = `
.lcf { position: static; font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Inter, sans-serif; }
.lcf-btn { position: fixed; z-index: 9997; right: 18px; bottom: var(--lcf-b); width: 58px; height: 58px; border-radius: 50%; border: 0; cursor: pointer; color: #fff;
  display: grid; place-items: center; background: linear-gradient(160deg, #3bd16a, #1f9a4f); box-shadow: 0 14px 30px -10px rgba(16,110,55,.7), 0 0 0 1px rgba(255,255,255,.6) inset;
  transition: transform .18s ease; }
.lcf-btn:hover { transform: translateY(-2px) scale(1.03); }
.lcf-btn { touch-action: none; -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; }
.lcf-btn.dragging { transform: scale(1.1); box-shadow: 0 22px 40px -12px rgba(16,110,55,.8); cursor: grabbing; }
.lcf-reset { display: block; width: 100%; margin-top: 6px; border: 0; background: none; padding: 4px; font: inherit; font-size: 12px; color: #8e8e93; cursor: pointer; text-decoration: underline; }
.lcf-btn.on { background: #1c1c1e; }
.lcf-btn em { position: absolute; top: -3px; right: -3px; min-width: 22px; height: 22px; padding: 0 6px; border-radius: 999px; background: #ff3b30; color: #fff; font-style: normal; font-size: 12px; font-weight: 800; display: grid; place-items: center; box-shadow: 0 0 0 2px #fff; animation: lcfPop .3s ease; }
.lcf-x { font-size: 28px; line-height: 1; font-weight: 300; }
.lcf-panel { position: fixed; z-index: 9998; right: 18px; bottom: calc(var(--lcf-b) + 70px); width: min(340px, calc(100vw - 36px)); background: rgba(255,255,255,.97); -webkit-backdrop-filter: saturate(180%) blur(20px); backdrop-filter: saturate(180%) blur(20px);
  border-radius: 22px; box-shadow: 0 24px 60px -20px rgba(0,0,0,.45), 0 0 0 1px rgba(0,0,0,.05); padding: 12px; animation: lcfUp .25s cubic-bezier(.2,.9,.3,1.1); transform-origin: bottom right; }
.lcf-h { display: flex; align-items: center; justify-content: space-between; padding: 2px 4px 8px; } .lcf-h b { font-size: 18px; font-weight: 800; color: #1c1c1e; }
.lcf-h button { width: 28px; height: 28px; border: 0; border-radius: 50%; background: #f2f2f7; color: #6e6e73; font-size: 18px; cursor: pointer; }
.lcf-panel ul { list-style: none; margin: 0; padding: 0; }
.lcf-panel li button { width: 100%; display: flex; align-items: center; gap: 10px; padding: 8px 6px; border: 0; border-radius: 14px; background: none; text-align: left; cursor: pointer; font: inherit; color: #1c1c1e; }
.lcf-panel li button:hover { background: #f2f2f7; }
.lcf-av { flex: none; width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; overflow: hidden; background: linear-gradient(180deg, #a5abb8, #858b98); color: #fff; font-size: 14px; font-weight: 600; }
.lcf-av img { width: 100%; height: 100%; object-fit: cover; } .lcf-av.cyt { background: #fff; box-shadow: inset 0 0 0 1px rgba(60,60,67,.14); } .lcf-av.cyt img { object-fit: contain; padding: 4px; box-sizing: border-box; }
.lcf-m { flex: 1; min-width: 0; display: flex; flex-direction: column; } .lcf-m b { font-size: 14.5px; font-weight: 600; } .lcf-m small { font-size: 13px; color: #8e8e93; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lcf-panel li button.unread b { font-weight: 800; } .lcf-panel li button.unread small { color: #3c3c43; }
.lcf-panel li em { flex: none; min-width: 20px; height: 20px; padding: 0 6px; border-radius: 999px; background: #0a84ff; color: #fff; font-style: normal; font-size: 11.5px; font-weight: 800; display: grid; place-items: center; }
.lcf-muted { margin: 6px 6px 10px; font-size: 13.5px; color: #8e8e93; }
.lcf-panel.client, .lcf-panel.guest { width: min(370px, calc(100vw - 24px)); right: 12px; }
.lcf-h.lcf-team { justify-content: flex-start; gap: 10px; padding: 0 2px 10px; border-bottom: 1px solid rgba(60,60,67,.1); margin-bottom: 6px; }
.lcf-h.lcf-team .lcf-m b { font-size: 15.5px; } .lcf-h.lcf-team .lcf-m small { color: #34a853; font-weight: 600; } .lcf-h.lcf-team > button { margin-left: auto; }
.lcf-guest { padding: 4px 2px 2px; }
/* the public site has its own styles for headers and lists — keep the widget clean everywhere */
.lcf .lcf-h, .lcf .lcf-h.lcf-team { background: none !important; background-image: none !important; box-shadow: none !important; }
.lcf .lcf-guest ul { list-style: disc; } .lcf .lcf-guest li { margin: 0 !important; padding: 0 !important; line-height: 1.5; }
.lcf .lcf-panel p, .lcf .lcf-panel ul { margin-top: 0; }
.lcf-hi { margin: 4px 0 10px; padding: 9px 12px; border-radius: 18px; background: #e9e9eb; font-size: 14.5px; line-height: 1.4; color: #000; }
.lcf-guest ul { margin: 0 0 12px; padding-left: 18px; font-size: 13.5px; color: #3c3c43; display: grid; gap: 3px; }
.lcf-guest small { display: block; margin-top: 8px; text-align: center; font-size: 12px; color: #8e8e93; }
@media (max-width: 600px) { .lcf-btn { right: 14px; width: 54px; height: 54px; } .lcf-panel, .lcn.at-fab { right: 12px; } }
/* with no bar it sits in the corner, clear of the iPhone home indicator */
.lcf-btn { bottom: max(var(--lcf-b), calc(16px + env(safe-area-inset-bottom, 0px))); }
/* phone sheet: fills exactly the visible screen (it shrinks above the keyboard) */
.lcf-panel.sheet { position: fixed; z-index: 2147483000; left: 0; right: 0; top: var(--vvt, 0px); bottom: auto; width: auto; height: var(--vvh, 100dvh); max-height: none;
  border-radius: 0; display: flex; flex-direction: column; padding: calc(10px + env(safe-area-inset-top, 0px)) 14px 10px; overflow-y: auto; animation: lcfSheet .25s ease; background: #fff; }
.lcf-panel.sheet .lcf-h { flex: none; }
.lcf-panel.sheet .lsm { flex: 1; min-height: 0; }
.lcf-panel.sheet .lsm-msgs { flex: 1; height: auto; min-height: 120px; }
.lcf-panel.sheet .lcf-guest { flex: 1; }
@keyframes lcfSheet { from { opacity: 0; transform: translateY(24px); } }
.lcf-all { width: 100%; height: 42px; margin-top: 6px; border: 0; border-radius: 13px; background: #34c759; color: #fff; font: inherit; font-size: 14.5px; font-weight: 700; cursor: pointer; }
.lcn { position: fixed; z-index: 100001; top: calc(10px + env(safe-area-inset-top, 0px)); left: 50%; transform: translateX(-50%); width: min(420px, calc(100vw - 24px));
  display: flex; align-items: center; gap: 12px; padding: 12px 14px; border: 0; border-radius: 20px; text-align: left; cursor: pointer; font: inherit; color: #1c1c1e;
  background: rgba(255,255,255,.96); backdrop-filter: saturate(1.6) blur(16px); -webkit-backdrop-filter: saturate(1.6) blur(16px);
  box-shadow: 0 18px 40px -16px rgba(0,0,0,.45), 0 0 0 1px rgba(0,0,0,.05); animation: lcnIn .35s cubic-bezier(.2,.9,.3,1.2); }
/* with the floating button on screen, the pop-up comes out of the button instead of the top of the screen */
.lcn.at-fab { top: auto; left: auto; right: 18px; bottom: calc(var(--lcf-b) + 70px); transform: none; width: min(340px, calc(100vw - 36px)); animation: lcnUp .35s cubic-bezier(.2,.9,.3,1.2); transform-origin: bottom right; }
.lcn.at-fab::after { content: ""; position: absolute; right: 22px; bottom: -7px; width: 14px; height: 14px; background: #fff; transform: rotate(45deg); border-radius: 0 0 4px 0; box-shadow: 4px 4px 8px -6px rgba(0,0,0,.25); }
@keyframes lcnUp { from { opacity: 0; transform: translateY(16px) scale(.9); } }
@keyframes lcfUp { from { opacity: 0; transform: translateY(12px) scale(.94); } }
@keyframes lcfPop { from { transform: scale(.4); } }
@media (prefers-reduced-motion: reduce) { .lcf-panel, .lcf-btn em { animation: none; } }
.lcn-ic { flex: none; width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center; font-size: 20px; background: linear-gradient(160deg, #5ad08a, #1f8a52); }
.lcn-m { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.lcn-m b { font-size: 14.5px; } .lcn-m small { font-size: 13.5px; color: #475569; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lcn-x { flex: none; width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center; background: #eef2f0; color: #6e6e73; font-size: 17px; }
@keyframes lcnIn { from { opacity: 0; transform: translate(-50%, -24px) scale(.96); } }
@media (prefers-reduced-motion: reduce) { .lcn { animation: none; } }
`;
