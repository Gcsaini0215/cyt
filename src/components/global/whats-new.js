import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import SpaRoundedIcon from "@mui/icons-material/SpaRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import DashboardCustomizeRoundedIcon from "@mui/icons-material/DashboardCustomizeRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";

/* "What's new" — introduces a new feature once, on the portal's home page (client My Space / therapist Dashboard).
   Closing it (or trying it) marks it seen in this browser, so it never shows again.
   To announce something: add an entry at the TOP of NEWS with a new id. Entries older than SHOW_DAYS stop showing.
   Waits until the cookie card has been answered, so the two never stack. */

const NEWS = [
  {
    id: "cycle-care-2026-11", portal: "client", forWomen: true, date: "2026-11-13", Icon: SpaRoundedIcon, tone: "rose",
    title: "Cycle & Mood Care", kicker: "New · Free · For women",
    text: "A private space to track your period and mood — and get support when PMS, PMDD, period pain or PCOS weigh on you.",
    points: ["See your phase and next period", "Spot how your mood changes through the month", "Find women therapists who understand"],
    to: "/client/cycle", cta: "Try it",
  },
  {
    id: "myspace-dashboard-2026-11", portal: "client", date: "2026-11-13", Icon: DashboardCustomizeRoundedIcon, tone: "green",
    title: "My Space has a new look", kicker: "Updated",
    text: "Your sessions, credit and progress at a glance — plus quick screening tests.",
    points: ["Stat cards for sessions, credit and more", "Your activity chart for 6 months", "Six screening tests, one tap away"],
    cta: "Take a look",
  },
  {
    id: "cycle-care-th-2026-11", portal: "therapist", forWomen: true, date: "2026-11-13", Icon: SpaRoundedIcon, tone: "rose",
    title: "Cycle & Mood Care — for you", kicker: "New · Free · Self-care",
    text: "You look after others all day. Track your own cycle and mood privately — nobody else can see it.",
    points: ["Your phase and next period", "Mood through the month", "Private to you, delete any time"],
    to: "/therapists/cycle", cta: "Try it",
  },
  {
    id: "social-posts-colours-2026-11", portal: "therapist", date: "2026-11-13", Icon: CampaignRoundedIcon, tone: "violet",
    title: "Social posts: 8 colours + HD", kicker: "Updated",
    text: "Make your Instagram and WhatsApp posts in the colour you like, and download them in sharp HD.",
    points: ["Forest, Lavender, Ocean, Sunset, Rose and more", "2160 px HD download and share", "Your photo, words and booking link"],
    to: "/therapists/social-posts", cta: "Make a post",
  },
];

const SEEN_KEY = "cyt_seen_news";
const CONSENT_KEY = "cookie_consent_v2";
const SHOW_DAYS = 45;
const readSeen = () => { try { return JSON.parse(localStorage.getItem(SEEN_KEY) || "[]"); } catch (e) { return []; } };

export default function WhatsNew({ portal, home }) {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [i, setI] = useState(0);
  const onHome = router.pathname === home;
  const open = onHome && items.length > 0;
  const wrapRef = useRef(null);

  // while it's open the page behind must not move: on iPhone a drag on the backdrop scrolled the page
  // (and the app bar hid / showed), which looked like the screen shaking
  useEffect(() => {
    if (!open) return undefined;
    const html = document.documentElement; const body = document.body;
    const y = window.scrollY;
    const prev = { ho: html.style.overflow, bo: body.style.overflow, bp: body.style.position, bt: body.style.top, bw: body.style.width };
    html.style.overflow = "hidden"; body.style.overflow = "hidden";
    body.style.position = "fixed"; body.style.top = `-${y}px`; body.style.width = "100%";
    const el = wrapRef.current;
    // only the card's own text may scroll (and only when it is taller than the screen)
    const stop = (e) => { const sc = e.target.closest?.(".wn-body"); if (!sc || sc.scrollHeight <= sc.clientHeight) e.preventDefault(); };
    el?.addEventListener("touchmove", stop, { passive: false });
    return () => {
      el?.removeEventListener("touchmove", stop);
      html.style.overflow = prev.ho; body.style.overflow = prev.bo;
      body.style.position = prev.bp; body.style.top = prev.bt; body.style.width = prev.bw;
      window.scrollTo(0, y);
    };
  }, [open]);

  useEffect(() => {
    if (!onHome) return undefined;
    let t = 0; let alive = true;
    const fresh = () => {
      const seen = readSeen();
      const cutoff = Date.now() - SHOW_DAYS * 86400000;
      return NEWS.filter((n) => n.portal === portal && !seen.includes(n.id) && Date.parse(n.date) >= cutoff);
    };
    const tryShow = () => {
      if (!alive) return;
      let answered = true;
      try { answered = !!localStorage.getItem(CONSENT_KEY); } catch (e) { answered = true; }
      if (!answered) { t = setTimeout(tryShow, 1500); return; } // the cookie card first
      const list = fresh();
      if (list.length) { setItems(list); setI(0); }
    };
    t = setTimeout(tryShow, 1400);
    return () => { alive = false; clearTimeout(t); };
  }, [onHome, portal]);

  if (!onHome || !items.length) return null;
  const n = items[i];
  const markSeen = (ids) => {
    try { localStorage.setItem(SEEN_KEY, JSON.stringify([...new Set([...readSeen(), ...ids])].slice(-60))); } catch (e) { /* storage blocked */ }
  };
  const closeAll = () => { markSeen(items.map((x) => x.id)); setItems([]); };
  const next = () => { markSeen([n.id]); if (i < items.length - 1) setI(i + 1); else setItems([]); };
  const go = () => { markSeen(items.map((x) => x.id)); setItems([]); if (n.to) router.push(n.to); };

  return (
    <div ref={wrapRef} className="wn-wrap" role="dialog" aria-modal="true" aria-label={`What's new: ${n.title}`} onClick={(e) => { if (e.target === e.currentTarget) closeAll(); }}>
      <style dangerouslySetInnerHTML={{ __html: WN_CSS }} />
      <div className={`wn ${n.tone}`} key={n.id}>
        <button type="button" className="wn-x" onClick={closeAll} aria-label="Close"><CloseRoundedIcon /></button>
        <div className="wn-top">
          <span className="wn-badge"><AutoAwesomeRoundedIcon /> What&apos;s new{items.length > 1 ? ` · ${i + 1} of ${items.length}` : ""}</span>
          <span className="wn-ic"><n.Icon /></span>
          <small>{n.kicker}</small>
          <h2>{n.title}</h2>
        </div>
        <div className="wn-body">
          <p>{n.text}</p>
          <ul>{n.points.map((p) => <li key={p}><CheckRoundedIcon />{p}</li>)}</ul>
          <div className="wn-acts">
            {i < items.length - 1
              ? <button type="button" className="wn-btn line" onClick={next}>Next</button>
              : <button type="button" className="wn-btn line" onClick={closeAll}>Close</button>}
            <button type="button" className="wn-btn" onClick={n.to ? go : next}>{n.cta} {n.to && <ArrowForwardRoundedIcon />}</button>
          </div>
          <button type="button" className="wn-skip" onClick={n.forWomen && i < items.length - 1 ? next : closeAll}>{n.forWomen ? "Not for me — skip" : "Skip"}</button>
          {items.length > 1 && <div className="wn-dots">{items.map((x, k) => <i key={x.id} className={k === i ? "on" : ""} />)}</div>}
        </div>
      </div>
    </div>
  );
}

const WN_CSS = `
.wn-wrap { position: fixed; inset: 0; z-index: 1500; overscroll-behavior: contain; touch-action: none; -webkit-tap-highlight-color: transparent; background: rgba(9,20,14,.45); display: flex; align-items: center; justify-content: center; padding: 16px; animation: wnFade .2s ease; }
@keyframes wnFade { from { opacity: 0; } }
.wn { position: relative; display: flex; flex-direction: column; max-height: calc(100dvh - 32px); width: 100%; max-width: 420px; touch-action: manipulation; border-radius: 26px; overflow: hidden; background: #fff; box-shadow: 0 30px 70px -20px rgba(0,0,0,.45); animation: wnUp .35s cubic-bezier(.16,1,.3,1); }
@keyframes wnUp { from { transform: translateY(24px) scale(.97); opacity: 0; } }
.wn { --wn-a: #1e9e64; --wn-b: #0b5d38; --wn-soft: #e7f6ec; }
.wn.rose { --wn-a: #f0668a; --wn-b: #a3173f; --wn-soft: #fde8ee; }
.wn.violet { --wn-a: #9f87f0; --wn-b: #4c2fb3; --wn-soft: #efeafd; }
.wn-top { position: relative; padding: 22px 22px 20px; color: #fff; text-align: center;
  background: radial-gradient(120% 120% at 100% 0%, rgba(255,255,255,.28) 0%, rgba(255,255,255,0) 50%), linear-gradient(150deg, var(--wn-a), var(--wn-b)); }
.wn-badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 999px; background: rgba(255,255,255,.2); font-size: 11.5px; font-weight: 800; letter-spacing: .03em; }
.wn-badge svg { font-size: 14px; }
.wn-ic { display: grid; place-items: center; width: 64px; height: 64px; margin: 14px auto 10px; border-radius: 20px; background: rgba(255,255,255,.95); color: var(--wn-b); box-shadow: 0 10px 24px -10px rgba(0,0,0,.4); }
.wn-ic svg { font-size: 36px; }
.wn-top small { display: block; font-size: 12px; font-weight: 800; letter-spacing: .05em; text-transform: uppercase; opacity: .9; }
.wn-top h2 { margin: 4px 0 0; color: #fff !important; font-size: 23px; font-weight: 800; letter-spacing: -.02em; font-family: inherit; }
.wn-x { position: absolute; top: 12px; right: 12px; z-index: 1; width: 34px; height: 34px; border-radius: 50%; border: 0; background: rgba(255,255,255,.22); color: #fff; display: grid; place-items: center; cursor: pointer; }
.wn-x svg { font-size: 20px; }
.wn-top { flex: none; }
.wn-body { padding: 18px 20px 18px; overflow-y: auto; overscroll-behavior: contain; -webkit-overflow-scrolling: touch; touch-action: pan-y; }
.wn-body p { margin: 0 0 12px; font-size: 14.5px; line-height: 1.55; color: #334155; text-align: center; }
.wn-body ul { list-style: none; margin: 0 0 16px; padding: 0; display: grid; gap: 8px; }
.wn-body li { display: flex; align-items: flex-start; gap: 8px; padding: 9px 12px; border-radius: 12px; background: var(--wn-soft); font-size: 13.5px; font-weight: 700; color: #0f172a; line-height: 1.35; }
.wn-body li svg { flex: none; font-size: 18px; color: var(--wn-b); }
.wn-acts { display: grid; grid-template-columns: 1fr 1.4fr; gap: 10px; }
.wn-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 48px; border-radius: 14px; border: 0; font: inherit; font-size: 15px; font-weight: 800; cursor: pointer;
  background: linear-gradient(160deg, var(--wn-a), var(--wn-b)); color: #fff; box-shadow: 0 10px 20px -12px var(--wn-b); }
.wn-btn svg { font-size: 19px; }
.wn-btn.line { background: #fff; color: #334155; border: 1.5px solid #e2e8f0; box-shadow: none; }
.wn-skip { display: block; margin: 12px auto 0; border: 0; background: none; font: inherit; font-size: 13.5px; font-weight: 700; color: #64748b; text-decoration: underline; cursor: pointer; padding: 4px 8px; }
.wn-dots { display: flex; justify-content: center; gap: 6px; margin-top: 14px; }
.wn-dots i { width: 7px; height: 7px; border-radius: 50%; background: #d6dfda; }
.wn-dots i.on { width: 20px; border-radius: 4px; background: var(--wn-b); }
@media (max-width: 599px) {
  .wn-wrap { align-items: flex-end; padding: 0; }
  .wn { max-width: none; max-height: calc(100dvh - 24px); border-radius: 26px 26px 0 0; padding-bottom: env(safe-area-inset-bottom, 0px); animation: wnSheet .38s cubic-bezier(.16,1,.3,1); will-change: transform; }
  .wn-top { padding: 18px 20px 16px; }
  .wn-ic { width: 56px; height: 56px; margin: 10px auto 8px; }
  @keyframes wnSheet { from { transform: translateY(100%); } }
}
@media (prefers-reduced-motion: reduce) { .wn, .wn-wrap { animation: none; } }
`;
