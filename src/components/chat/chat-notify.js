import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/router";
import { apiUrl, imagePath } from "../../utils/url";
import { getToken, getDecodedToken } from "../../utils/jwt";
import { postData, fetchById } from "../../utils/actions";
import SupportMini, { SM_CSS } from "./support-mini";
import WidgetLogin from "./widget-login";
import { isKeyboardUp, lockPagePan } from "./kb-lock";
import QuickAnswers, { QA_CSS } from "./quick-answers";

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
  // iPhone: the tone follows the ring / silent switch like any notification (owner, 2026-11-25)
  try {
    if (navigator.audioSession) {
      navigator.audioSession.type = "ambient"; // obeys the silent switch: phone on silent = no tone (owner, 2026-11-25)
      clearTimeout(window.__cytToneT);
      window.__cytToneT = setTimeout(() => { try { navigator.audioSession.type = "auto"; } catch (e) { /* ignore */ } }, 1500);
    }
  } catch (e) { /* older iOS */ }
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = ctx || new AC();
    if (ctx.state === "suspended") ctx.resume();
    const t0 = ctx.currentTime + 0.01;
    // "hel-lo": a low note then a higher one, soft mallet sound (fundamental + a few quiet overtones)
    [[783.99, 0, 0.42, 0.22], [1174.66, 0.15, 0.7, 0.24]].forEach(([f, dt, len, vol]) => {
      for (const [mult, part] of [[1, 1], [4, 0.14], [2, 0.06], [10, 0.025]]) {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = "sine"; o.frequency.value = f * mult;
        const end = t0 + dt + len / (mult > 1 ? 2.5 : 1);
        g.gain.setValueAtTime(0.0001, t0 + dt);
        g.gain.exponentialRampToValueAtTime(vol * part, t0 + dt + 0.006);
        g.gain.exponentialRampToValueAtTime(0.0001, end);
        o.connect(g).connect(ctx.destination);
        o.start(t0 + dt); o.stop(end + 0.02);
      }
    });
  } catch { /* no audio */ }
}


let audioArmed = false;
export function armAudio() {
  if (audioArmed || typeof window === "undefined") return;
  audioArmed = true;
  const unlock = () => {
    try {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      ctx = ctx || new AC();
      if (ctx.state !== "running") ctx.resume();
      const b = ctx.createBuffer(1, 1, 22050), src = ctx.createBufferSource();
      src.buffer = b; src.connect(ctx.destination); src.start(0);
    } catch (e) { /* no audio */ }
  };
  ["pointerdown", "touchend", "keydown", "click"].forEach((ev) => window.addEventListener(ev, unlock, { passive: true }));
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && ctx && ctx.state !== "running") { try { ctx.resume(); } catch (e) { /* tap will do it */ } } });
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
const HIDE_ON = /^\/(view-profile\/|login|register|therapist-app|book\/|therapist-checkout|payment|checkout|noida-reception|offline|therapists\/messages|client\/messages)/;
const BARS = ".tn-mob-nav, .cls-mob, .mab, .ph-sticky, .mobile-bottom-nav";

export default function ChatNotifier() {
  const router = useRouter();
  useEffect(() => { armAudio(); }, []);
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
    const max = window.innerHeight - bottom - 80;
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
  const [snd, setSnd] = useState(true);
  useEffect(() => { setSnd(soundOn()); }, []);
  const toggleSnd = () => { const v = !snd; setSnd(v); setSound(v); if (v) playChime(); };
  const sndBtn = <button type="button" className={`lcf-ic snd${snd ? "" : " off"}`} onClick={toggleSnd} aria-label={snd ? "Message sound on — tap to turn off" : "Message sound off — tap to turn on"} title={snd ? "Sound on" : "Sound off"}>{snd ? <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><path fill="currentColor" d="M4 9v6h4l5 4V5L8 9H4Zm11.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4Zm-2.5-8.8v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6Z" /></svg> : <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><path fill="currentColor" d="M4 9v6h4l5 4V5L8 9H4Zm12.6 3 2.7-2.7-1.4-1.4-2.7 2.7-2.7-2.7-1.4 1.4 2.7 2.7-2.7 2.7 1.4 1.4 2.7-2.7 2.7 2.7 1.4-1.4-2.7-2.7Z" /></svg>}</button>;
  const [sos, setSos] = useState(false); // "not for emergencies" pop-up from the header icon
  const [pending, setPending] = useState(""); // a question picked / typed before logging in — sent right after login
  const [own, setOwn] = useState("");
  useEffect(() => { try { const v = sessionStorage.getItem("cyt_chat_pending"); if (v) setPending(v); } catch { /* ignore */ } }, []);
  const pick = (q) => { setPending(q); try { sessionStorage.setItem("cyt_chat_pending", q); } catch { /* ignore */ } };
  const sentPending = () => { setPending(""); try { sessionStorage.removeItem("cyt_chat_pending"); } catch { /* ignore */ } };
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
      const shownInWidget = !!(window.__lcMini && window.__lcMini(threadId, message));
      if (message.fromRole === role.current || message.fromRole === "system") return;
      // the tone every time a message comes in — chat open or closed (owner, 2026-11-24)
      playChime();
      if (navigator.vibrate) try { navigator.vibrate(60); } catch { /* ignore */ }
      if (shownInWidget) return;
      // the chat that's open and visible already shows it
      if (window.__lcActive === threadId && document.visibilityState === "visible") return;
      setUnread((n) => n + 1);
      setToast({ threadId, name: message.fromName || (role.current === "therapist" ? "Your client" : "Your therapist"), body: message.body, href: `${base()}?t=${threadId}` });
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setToast(null), 6000);
    });
    es.addEventListener("read", loadUnread);
    // CYT connected this client with a therapist: the widget / Messages move to that chat (owner, 2026-11-24)
    es.addEventListener("assigned", (e) => {
      const d = JSON.parse(e.data || "{}");
      if (!d.threadId) return;
      window.dispatchEvent(new CustomEvent("cyt-chat-assigned", { detail: d }));
      playChime();
      setToast({ threadId: d.threadId, name: `You're connected with ${d.name || "a therapist"}`, body: "Tap to chat with them now", href: `${base()}?t=${d.threadId}` });
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setToast(null), 8000);
    });
    return () => { es.close(); clearTimeout(timer.current); };
  }, [authTick]); // eslint-disable-line react-hooks/exhaustive-deps

  // sit just above whatever bar is at the bottom of this page
  useEffect(() => {
    // above a bottom bar only while that bar is on screen; otherwise right down in the corner (owner, 2026-11-23).
    // While the page scrolls (docks slide away / back) it follows the bar every frame, so it never sits on it.
    const place = () => {
      let need = 26; // room for the round text
      const vh = window.innerHeight;
      for (const x of document.querySelectorAll(BARS)) {
        const cs = getComputedStyle(x);
        if (!x.offsetHeight || cs.display === "none" || cs.visibility === "hidden" || cs.position !== "fixed") continue;
        const top = x.getBoundingClientRect().top;
        if (top >= vh - 4 || top < vh * 0.5) continue; // slid away, or not a bottom bar
        need = Math.max(need, Math.round(vh - top + 26));
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
      el.classList.toggle("kb", isKeyboardUp(vv));
      el.style.setProperty("--vvh", `${Math.round(vv ? vv.height : window.innerHeight)}px`);
      el.style.setProperty("--vvt", `${Math.round(vv ? vv.offsetTop : 0)}px`);
    };
    fit();
    vv?.addEventListener("resize", fit); vv?.addEventListener("scroll", fit); window.addEventListener("resize", fit);
    const b = document.body, y = window.scrollY, prev = b.style.cssText;
    b.style.position = "fixed"; b.style.top = `-${y}px`; b.style.left = "0"; b.style.right = "0"; b.style.width = "100%"; b.style.overflow = "hidden";
    const unpan = lockPagePan(); // keyboard up: the screen doesn't slide / shake
    return () => {
      unpan();
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

  const teamHead = ({ onClear, onFull, tid } = {}) => (
    <div className="lcf-h lcf-team">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <span className="lcf-av cyt"><img src="/icons/cyt-icon-96.png" alt="" /></span>
      <span className="lcf-m"><b>CYT Care Team</b><small>Usually replies within minutes · 9 AM – 9 PM</small></span>
      <span className="lcf-icons">
        {tid && onClear && <button type="button" className="lcf-ic" onClick={onClear} aria-label="Clear chat" title="Clear chat"><svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><path fill="currentColor" d="M9 3h6l1 2h4v2H4V5h4l1-2Zm-3 6h12l-1 11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 9Zm4 2v8h2v-8h-2Zm4 0v8h2v-8h-2Z" /></svg></button>}
        {sndBtn}
        <button type="button" className="lcf-ic x" onClick={() => setOpen(false)} aria-label="Close">×</button>
      </span>
      {sos && (
        <div className="lcf-sos" role="note">
          <b>Not for emergencies</b>
          <span>If you or someone near you is in danger, call <a href="tel:112">112</a> or Tele-MANAS <a href="tel:14416">14416</a> (free, 24×7).</span>
          <button type="button" onClick={() => setSos(false)} aria-label="Close">×</button>
        </div>
      )}
    </div>
  );
  const SUGGEST = [
    "I'm not sure which therapist is right for me",
    "I've been feeling anxious or low lately",
    "Can I talk to someone in Hindi?",
    "Do you have online sessions?",
    "What happens in the first session?",
    "I need help for my child or teen",
  ];

  if (typeof document === "undefined" || !who) return null;
  const fabY = pos ? clampY(pos.y) : null;
  const btnStyle = drag ? { left: drag.x, top: drag.y, right: "auto", bottom: "auto", transition: "none" }
    : pos ? { top: fabY, bottom: "auto", ...(pos.side === "left" ? { left: 24, right: "auto" } : { right: 24, left: "auto" }) } : undefined;
  const anchor = (() => {
    if (!pos || drag) return undefined;
    const low = fabY > window.innerHeight / 2;
    return { ...(pos.side === "left" ? { left: 12, right: "auto" } : { right: 12, left: "auto" }), ...(low ? { bottom: window.innerHeight - fabY + 10, top: "auto" } : { top: fabY + 66, bottom: "auto" }) };
  })();
  const showFab = !hidden;
  if (!showFab && !toast) return null;
  return createPortal((
    <div className="lcf" ref={rootRef} style={{ "--lcf-b": `${bottom}px` }}>
      <style>{CSS + SM_CSS + QA_CSS}</style>
      {toast && (
        <button type="button" className={`lcn${showFab ? " at-fab" : ""}`} style={showFab ? anchor : undefined} onClick={() => go(toast.href)}>
          <span className="lcn-ic" aria-hidden="true">💬</span>
          <span className="lcn-m"><b>{toast.name}</b><small>{toast.body}</small></span>
          <span className="lcn-x" role="presentation" onClick={(e) => { e.stopPropagation(); setToast(null); }}>×</span>
        </button>
      )}
      {showFab && open && sheet && <div className="lcf-under" aria-hidden="true" />}
      {showFab && open && (
        <div className={`lcf-panel ${who}${sheet ? " sheet" : ""}`} style={sheet ? undefined : anchor} role="dialog" aria-label={who === "therapist" ? "Recent messages" : "Chat with the CYT Care Team"}>
          {who === "therapist" ? (
            <>
              <div className="lcf-h"><b>Messages</b><span className="lcf-icons">{sndBtn}<button type="button" className="lcf-ic x" onClick={() => setOpen(false)} aria-label="Close">×</button></span></div>
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
              {who === "guest" ? (
                <>
                {teamHead()}
                <div className="lcf-guest">
                  <p className="lcf-hi">Hi 👋 Not sure which therapist is right for you? Chat with our care team — we&apos;ll help you choose.</p>
                  {/* first: one-tap questions; the one picked is sent right after logging in, here (owner, 2026-11-24) */}
                  {!pending && <QuickAnswers onCta={() => setOpen(false)} />}
                  {!pending ? (
                    <>
                      <div className="lcf-sug" role="list">
                        {SUGGEST.map((q) => <button type="button" role="listitem" key={q} onClick={() => pick(q)}>{q}</button>)}
                      </div>
                      {pos && <button type="button" className="lcf-reset" onClick={resetPos}>Move the chat button back to the corner</button>}
                      <form className="lcf-own" onSubmit={(e) => { e.preventDefault(); if (own.trim()) pick(own.trim().slice(0, 500)); }}>
                        <input autoComplete="off" data-lpignore="true" data-form-type="other" enterKeyHint="send" name="cyt-chat-question" value={own} onChange={(e) => setOwn(e.target.value)} maxLength={500} placeholder="Or type your question…" aria-label="Your question" />
                        <button type="submit" disabled={!own.trim()} aria-label="Next">Send</button>
                      </form>
                    </>
                  ) : (
                    <>
                      <div className="lcf-q"><p>{pending}</p><button type="button" onClick={() => { sentPending(); setOwn(""); }}>Change</button></div>
                      <p className="lcf-why">Log in or create an account to send this — it goes to our care team as soon as you&apos;re in.</p>
                      <WidgetLogin onDone={() => { setAuthTick((n) => n + 1); window.dispatchEvent(new Event("cyt-auth-changed")); }} />
                    </>
                  )}
                  {pending && pos && <button type="button" className="lcf-reset" onClick={resetPos}>Move the chat button back to the corner</button>}
                </div>
                </>
              ) : (
                <SupportMini onCta={() => setOpen(false)} page={path.slice(0, 180)} onOpenAll={(tid) => go(`/client/messages?t=${tid}`)} head={teamHead} initial={pending} onSent={sentPending} />
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
          {!open && !drag && <span className="lcf-ring" aria-hidden="true"><svg viewBox="0 0 100 100"><defs><path id={"lcf-ring-p"} d="M50,50 m-39,0 a39,39 0 1,1 78,0 a39,39 0 1,1 -78,0" /></defs><circle cx="50" cy="50" r="49" /><text><textPath href={`#${"lcf-ring-p"}`} textLength="238" lengthAdjust="spacingAndGlyphs">{who === "therapist" ? "Your clients • Messages • Reply in one tap • " : who === "client" ? "Instant reply • Your care team • Ask anything • " : "Instant reply • Chat with our care team • "}</textPath></text></svg></span>}
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
.lcf-btn em { position: absolute; z-index: 3 !important; top: -9px; right: -9px; min-width: 22px; height: 22px; padding: 0 6px; border-radius: 999px; background: #ff3b30; color: #fff; font-style: normal; font-size: 12px; font-weight: 800; display: grid; place-items: center; box-shadow: 0 0 0 2px #fff; animation: lcfPop .3s ease; }
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
/* header icons (owner, 2026-11-24): emergency info, clear, full screen, close */
.lcf-h.lcf-team { position: relative; }
.lcf-icons { margin-left: auto; display: inline-flex; gap: 4px; flex: none; }
.lcf .lcf-ic { width: 30px; height: 30px; border: 0; border-radius: 50%; background: #f2f2f7; color: #6e6e73; display: grid; place-items: center; padding: 0; cursor: pointer; font-size: 18px; line-height: 1; }
.lcf .lcf-ic:hover { color: #1c1c1e; } .lcf .lcf-ic.snd { color: #15803d; } .lcf .lcf-ic.snd.off { color: #8e8e93; } .lcf .lcf-ic.sos { color: #d97706; } .lcf .lcf-ic.sos.on { background: #fff4e5; }
.lcf-sos { position: absolute; z-index: 3; top: calc(100% + 4px); left: 0; right: 0; display: flex; flex-direction: column; gap: 2px; padding: 10px 34px 10px 12px; border-radius: 14px; background: #fff8ec; border: 1px solid #fde3b5; box-shadow: 0 12px 24px -14px rgba(0,0,0,.35); font-size: 13px; line-height: 1.4; color: #5b3a06; }
.lcf-sos b { font-size: 13.5px; color: #92400e; } .lcf-sos a { color: #b45309; font-weight: 800; }
.lcf-sos button { position: absolute; top: 6px; right: 6px; width: 24px; height: 24px; border: 0; border-radius: 50%; background: none; color: #92400e; font-size: 17px; cursor: pointer; }
/* one-tap questions for visitors */
.lcf-sug { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; margin: 0 0 10px; }
.lcf .lcf-sug button { max-width: 92%; border: 1px solid #c7e7d1; background: #fff; color: #15803d; border-radius: 18px; padding: 8px 12px; font: inherit; font-size: 13.5px; font-weight: 600; text-align: right; cursor: pointer; line-height: 1.3; }
.lcf .lcf-sug button:hover { background: #effaf2; }
.lcf-own { display: flex; gap: 6px; align-items: center; margin-bottom: 4px; }
.lcf .lcf-own input { flex: 1; min-width: 0; height: 38px; border: 1px solid #d1d1d6; border-radius: 19px; padding: 0 14px; font: inherit; font-size: 16px; background: #fff; }
.lcf .lcf-own button { flex: none; width: 34px; height: 34px; border: 0; border-radius: 50%; background: #34c759; color: #fff; display: grid; place-items: center; cursor: pointer; padding: 0; }
.lcf .lcf-own button:disabled { background: #c7c7cc; }
.lcf-q { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; margin: 0 0 8px; }
.lcf .lcf-q p { margin: 0; max-width: 88%; padding: 8px 12px; border-radius: 18px; background: #34c759; color: #fff; font-size: 14.5px; line-height: 1.35; }
.lcf .lcf-q button { border: 0; background: none; padding: 0 4px; font: inherit; font-size: 12px; color: #0a84ff; cursor: pointer; }
.lcf .lcf-why { margin: 0 0 8px; font-size: 12.5px; color: #6e6e73; }

/* round text around the chat button (owner, 2026-11-24) */
.lcf-ring { position: absolute; left: -19px; top: -19px; width: calc(100% + 38px); height: calc(100% + 38px); pointer-events: none; z-index: -1; animation: lcfSpin 22s linear infinite; }
.lcf-ring svg { width: 100%; height: 100%; overflow: visible; display: block; }
.lcf-ring circle { fill: rgba(255,255,255,.96); stroke: rgba(20,83,45,.12); stroke-width: .6; filter: drop-shadow(0 4px 8px rgba(16,80,45,.25)); }
.lcf-ring text { font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Inter, sans-serif; font-size: 9.6px; font-weight: 800; letter-spacing: .5px; fill: #14532d; text-transform: uppercase; }
@keyframes lcfSpin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .lcf-ring { animation: none; } }
.lcf-btn { isolation: isolate; } .lcf-btn > :not(.lcf-ring):not(.lcf-lbl):not(em) { position: relative; z-index: 1; } .lcf-btn > .lcf-lbl { z-index: 1; }
.lcf-btn::before { content: ""; position: absolute; inset: 0; border-radius: 50%; background: inherit; z-index: 0; }

.lcf .lcf-lbl { display: none; }
@media (max-width: 767px), (hover: none) and (pointer: coarse) and (max-width: 1100px) {
  .lcf-ring { display: none !important; }
  .lcf .lcf-lbl { display: flex; animation: lcfLblAway 7s ease forwards !important; pointer-events: none; }
}
@keyframes lcfLblAway { 0% { opacity: 0; transform: translate(8px, -50%); } 6% { opacity: 1; transform: translate(0, -50%); } 86% { opacity: 1; transform: translate(0, -50%); } 100% { opacity: 0; transform: translate(6px, -50%); visibility: hidden; } }
.lcf-lbl { position: absolute; right: calc(100% + 10px); top: 50%; transform: translateY(-50%); display: flex; flex-direction: column; align-items: flex-start; padding: 7px 14px 7px 26px; border-radius: 16px;
  background: #fff; color: #14532d; font-size: 14px; font-weight: 800; line-height: 1.15; white-space: nowrap; box-shadow: 0 10px 26px -10px rgba(16,80,45,.45), 0 0 0 1px rgba(20,83,45,.08); pointer-events: auto; animation: lcfLbl .4s ease both .6s; }
.lcf-lbl.r { right: auto; left: calc(100% + 10px); }
.lcf-lbl small { font-size: 11.5px; font-weight: 600; color: #6b7a72; }
.lcf-lbl i { position: absolute; left: 11px; top: 50%; width: 8px; height: 8px; margin-top: -4px; border-radius: 50%; background: #34c759; box-shadow: 0 0 0 3px rgba(52,199,89,.22); animation: lcfDot 1.8s ease-in-out infinite; }
@keyframes lcfLbl { from { opacity: 0; transform: translate(8px, -50%); } }
@keyframes lcfDot { 50% { box-shadow: 0 0 0 6px rgba(52,199,89,0); } }
@media (max-width: 600px) { .lcf-lbl { padding: 6px 11px 6px 23px; font-size: 13px; } .lcf-lbl small { display: none; } .lcf-lbl i { left: 9px; } }
/* the public site has its own styles for headers and lists — keep the widget clean everywhere */
.lcf .lcf-h, .lcf .lcf-h.lcf-team { background: none !important; background-image: none !important; box-shadow: none !important; }
.lcf .lcf-guest ul { list-style: disc; } .lcf .lcf-guest li { margin: 0 !important; padding: 0 !important; line-height: 1.5; }
.lcf .lcf-panel p, .lcf .lcf-panel ul { margin-top: 0; }
.lcf-hi { margin: 4px 0 10px; padding: 9px 12px; border-radius: 18px; background: #e9e9eb; font-size: 14.5px; line-height: 1.4; color: #000; }
.lcf-guest ul { margin: 0 0 12px; padding-left: 18px; font-size: 13.5px; color: #3c3c43; display: grid; gap: 3px; }
.lcf-guest small { display: block; margin-top: 8px; text-align: center; font-size: 12px; color: #8e8e93; }
@media (max-width: 600px) { .lcf-btn { right: 24px; width: 54px; height: 54px; } .lcf-panel, .lcn.at-fab { right: 12px; } }
/* with no bar it sits in the corner, clear of the iPhone home indicator */
.lcf-btn { bottom: max(var(--lcf-b), calc(26px + env(safe-area-inset-bottom, 0px))); } .lcf-btn { right: 26px; }
@media (max-width: 600px) { .lcf-btn { right: 24px; } }
/* phone sheet: fills exactly the visible screen (it shrinks above the keyboard) */
.lcf-panel.sheet { position: fixed; z-index: 2147483000; left: 0; right: 0; top: var(--vvt, 0px); bottom: auto; width: auto; height: var(--vvh, 100dvh); max-height: none;
  border-radius: 0; display: flex; flex-direction: column; padding: calc(10px + env(safe-area-inset-top, 0px)) 14px 10px; overflow-y: auto; animation: lcfSheet .25s ease; background: #fff; }
.lcf-panel.sheet .lcf-h { flex: none; }
.lcf-panel.sheet .lsm { flex: 1; min-height: 0; }
.lcf.kb .lcf-panel.sheet { padding-bottom: 6px !important; } /* keyboard up: the typing box sits right on it */
.lcf-panel.sheet .lsm-msgs { flex: 1; height: auto; min-height: 120px; }
.lcf-panel.sheet .lcf-guest { flex: 1; display: flex; flex-direction: column; min-height: 0; }
.lcf-panel.sheet .lcf-own { margin-top: auto; padding-top: 8px; }
.lcf-under { position: fixed; z-index: 2147482999; left: 0; right: 0; top: 0; height: 100vh; height: 100lvh; background: #fff; }
/* phone sheet: it is already full screen — no full-screen icon; the typing box sits off the bottom edge (owner, 2026-11-24) */
.lcf-panel.sheet .lcf-ic.full { display: none; }
.lcf-panel.sheet { padding-bottom: calc(14px + env(safe-area-inset-bottom, 0px)); }
.lcf-panel.sheet .lsm-comp { margin: 8px 2px 0; }
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
/* "Send" written on the button, beside the typing box (owner, 2026-11-24) */
.lcf .lcf-own { display: flex !important; align-items: flex-end; gap: 8px; }
.lcf .lcf-own input { flex: 1; min-width: 0; padding-right: 14px !important; }
.lcf .lcf-own button[type="submit"] { position: static !important; flex: none; width: auto !important; height: 38px !important; min-width: 64px; padding: 0 16px !important; border-radius: 19px !important; border: 0;
  background: #34c759; color: #fff; font: inherit; font-size: 15px; font-weight: 700; letter-spacing: .01em; display: inline-flex !important; align-items: center; justify-content: center; cursor: pointer; margin-bottom: 1px; }
.lcf .lcf-own button[type="submit"]:disabled { background: #c7c7cc; color: #fff; }

`;
