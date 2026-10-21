import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { getTrainee, clearTraineeToken } from "../../utils/trainee-auth";
import { tApi, fileUrl, fmtTime, fmtMins } from "../../utils/trainee-api";

/* Trainee portal shell — same look as the therapist portal: white top bar (menu, logo, check-in, account),
   a slim icon rail on the left that widens with labels, and a slide-in menu on phones / tablets.
   Pages read the signed-in trainee and today's attendance from useTraineePortal(). */
export const NAV = [
  { to: "/trainee", icon: "feather-grid", label: "Dashboard" },
  { to: "/trainee/attendance", icon: "feather-clock", label: "Attendance" },
  { to: "/trainee/tasks", icon: "feather-check-square", label: "Tasks" },
  { to: "/trainee/notes", icon: "feather-book-open", label: "Notes" },
  { to: "/trainee/certificate", icon: "feather-award", label: "Certificate" },
  { to: "/trainee/upgrade", icon: "feather-trending-up", label: "Upgrade internship" },
  { to: "/trainee/profile", icon: "feather-user", label: "Edit profile" },
];
const HELP = "https://wa.me/918077757951?text=Hi%2C%20I%27m%20a%20CYT%20trainee%20and%20need%20help";
const WIDE_KEY = "cyt_trainee_wide";

const Ctx = createContext({ me: null, att: null, reloadAtt: () => {}, profile: null, setProfile: () => {}, openCheckOut: () => {} });
export const useTraineePortal = () => useContext(Ctx);

let profileCache = null; // keeps the avatar steady between pages

export default function TraineeLayout({ children, title = "Dashboard" }) {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [profile, setProfileState] = useState(profileCache);
  const [att, setAtt] = useState(null); // { today, days, month, total } | null while loading
  const [wide, setWide] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [menu, setMenu] = useState(false);
  const [outOpen, setOutOpen] = useState(false);
  const menuRef = useRef(null);

  const setProfile = useCallback((p) => { profileCache = p; setProfileState(p); }, []);
  const reloadAtt = useCallback(async () => {
    const r = await tApi("/trainee-portal/attendance");
    if (r.status) setAtt(r.data);
  }, []);

  useEffect(() => {
    const t = getTrainee();
    if (!t) { router.replace("/supervision-login"); return; }
    setMe(t);
    try { setWide(localStorage.getItem(WIDE_KEY) === "1"); } catch { /* storage blocked */ }
    reloadAtt();
    if (!profileCache) tApi("/trainee-portal/profile").then((r) => { if (r.status) setProfile(r.data); });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!menu) return undefined;
    const off = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(false); };
    document.addEventListener("mousedown", off);
    return () => document.removeEventListener("mousedown", off);
  }, [menu]);
  useEffect(() => { setDrawer(false); }, [router.asPath]);

  const toggle = () => {
    if (window.innerWidth < 1024) { setDrawer((d) => !d); return; }
    setWide((w) => { try { localStorage.setItem(WIDE_KEY, w ? "0" : "1"); } catch { /* ignore */ } return !w; });
  };
  const signOut = () => { profileCache = null; clearTraineeToken(); router.push("/supervision-login"); };
  const name = (profile && [profile.firstName, profile.lastName].filter(Boolean).join(" ")) || me?.name || "Trainee";
  const initials = name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const photo = profile?.photo ? fileUrl(profile.photo) : "";
  const active = (to) => (to === "/trainee" ? router.pathname === to : router.pathname === to || router.pathname.startsWith(`${to}/`));
  const avatar = () => (photo
    // eslint-disable-next-line @next/next/no-img-element
    ? <img className="tl-av img" src={photo} alt="" />
    : <span className="tl-av">{initials}</span>);

  const items = (labels) => (
    <>
      {NAV.map((i) => (
        <Link key={i.to} href={i.to} className={`tl-item${active(i.to) ? " on" : ""}`} title={labels ? undefined : i.label} aria-current={active(i.to) ? "page" : undefined}>
          <i className={i.icon} aria-hidden="true" /><span className="tl-label">{i.label}</span>
        </Link>
      ))}
      <span className="tl-fill" />
      <a href={HELP} target="_blank" rel="noreferrer" className="tl-item" title={labels ? undefined : "Help"}>
        <i className="feather-help-circle" aria-hidden="true" /><span className="tl-label">Help</span>
      </a>
      <button type="button" className="tl-item tl-out" onClick={signOut} title={labels ? undefined : "Sign out"}>
        <i className="feather-log-out" aria-hidden="true" /><span className="tl-label">Sign out</span>
      </button>
    </>
  );

  return (
    <Ctx.Provider value={{ me, att, reloadAtt, profile, setProfile, openCheckOut: () => setOutOpen(true) }}>
      <div className={`tl${wide ? " wide" : ""}`}>
        <Head>
          <title>{`${title} · Trainee Portal | Choose Your Therapist`}</title>
          <meta name="robots" content="noindex" />
        </Head>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <header className="tl-bar">
          <button type="button" className="tl-menu" onClick={toggle} aria-label="Menu" title="Menu">
            <i className={wide ? "feather-chevrons-left" : "feather-menu"} aria-hidden="true" />
          </button>
          <Link href="/trainee" className="tl-logo" aria-label="Trainee portal home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/cyt-mark.svg" alt="" width="32" height="32" />
            <span><b>Trainee Portal</b><small>Choose Your Therapist</small></span>
          </Link>
          <span className="tl-title">{title}</span>
          <div className="tl-right">
            <CheckChip att={att} reloadAtt={reloadAtt} onOut={() => setOutOpen(true)} />
            <div className="tl-acc" ref={menuRef}>
              <button type="button" className="tl-who" onClick={() => setMenu((m) => !m)} aria-haspopup="menu" aria-expanded={menu}>
                {avatar()}
                <span className="tl-who-t"><b>{name}</b><small>Trainee</small></span>
                <i className="feather-chevron-down" aria-hidden="true" />
              </button>
              {menu && (
                <div className="tl-dd" role="menu">
                  <div className="tl-dd-h"><b>{name}</b><span>{me?.email}</span></div>
                  <Link href="/trainee/profile" role="menuitem"><i className="feather-user" aria-hidden="true" /> Edit profile</Link>
                  <Link href="/internship-modules" role="menuitem"><i className="feather-layers" aria-hidden="true" /> Internship modules</Link>
                  <button type="button" role="menuitem" className="out" onClick={signOut}><i className="feather-log-out" aria-hidden="true" /> Sign out</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <nav className="tl-rail" aria-label="Trainee menu">{items(wide)}</nav>

        {drawer && (
          <div className="tl-drawer-bg" onClick={() => setDrawer(false)} role="presentation">
            <nav className="tl-drawer" onClick={(e) => e.stopPropagation()} aria-label="Trainee menu">
              <div className="tl-drawer-h">
                {avatar()}
                <span className="tl-who-t"><b>{name}</b><small>{me?.email}</small></span>
                <button type="button" className="tl-x" onClick={() => setDrawer(false)} aria-label="Close menu"><i className="feather-x" aria-hidden="true" /></button>
              </div>
              {items(true)}
            </nav>
          </div>
        )}

        <main className="tl-main">{me ? children : null}</main>
        {outOpen && <CheckOutModal onClose={() => setOutOpen(false)} onDone={reloadAtt} today={att?.today} />}
      </div>
    </Ctx.Provider>
  );
}

/* Top-bar attendance button: Check in → (working timer) Check out → Done for today */
function CheckChip({ att, reloadAtt, onOut }) {
  const [busy, setBusy] = useState(false);
  const [, tick] = useState(0);
  const today = att?.today;
  const working = !!(today?.checkIn && !today?.checkOut);
  useEffect(() => {
    if (!working) return undefined;
    const iv = setInterval(() => tick((n) => n + 1), 30000);
    return () => clearInterval(iv);
  }, [working]);
  if (!att) return null;
  const checkIn = async () => {
    setBusy(true);
    const r = await tApi("/trainee-portal/attendance/check-in", { method: "POST", body: {} });
    setBusy(false);
    if (!r.status) { window.alert(r.message || "Couldn't check in"); return; }
    reloadAtt();
  };
  if (!today?.checkIn) {
    return (
      <button type="button" className="tl-chk in" onClick={checkIn} disabled={busy}>
        <i className="feather-log-in" aria-hidden="true" /><span>{busy ? "Checking in…" : "Check in"}</span>
      </button>
    );
  }
  const mins = Math.max(0, Math.round(((today.checkOut ? new Date(today.checkOut) : new Date()) - new Date(today.checkIn)) / 60000));
  if (working) {
    return (
      <div className="tl-chk-wrap">
        <span className="tl-chk-st" title={`Checked in at ${fmtTime(today.checkIn)}`}><i className="dot" />In since {fmtTime(today.checkIn)} · {fmtMins(mins)}</span>
        <button type="button" className="tl-chk out" onClick={onOut}><i className="feather-log-out" aria-hidden="true" /><span>Check out</span></button>
      </div>
    );
  }
  return <span className="tl-chk-st done" title={`${fmtTime(today.checkIn)} – ${fmtTime(today.checkOut)}`}><i className="feather-check-circle" aria-hidden="true" /> Done today · {fmtMins(mins)}</span>;
}

export function CheckOutModal({ onClose, onDone, today }) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
    const r = await tApi("/trainee-portal/attendance/check-out", { method: "POST", body: { note } });
    setBusy(false);
    if (!r.status) { setErr(r.message || "Couldn't check out"); return; }
    onDone(); onClose();
  };
  return (
    <div className="tl-modal-bg" role="presentation" onClick={onClose}>
      <form className="tl-modal" role="dialog" aria-modal="true" aria-labelledby="tl-out-h" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h3 id="tl-out-h">Check out for today</h3>
        <p>You checked in at <b>{fmtTime(today?.checkIn)}</b>. Add a line about what you worked on — it goes to your supervisor.</p>
        <label htmlFor="tl-out-note">What did you work on today? <span>(optional)</span></label>
        <textarea id="tl-out-note" rows={4} maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Finished module 2 reading, wrote case notes for session 3" />
        {err && <div className="tl-err">{err}</div>}
        <div className="tl-modal-a">
          <button type="button" className="tl-btn ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="tl-btn" disabled={busy}>{busy ? "Checking out…" : "Check out"}</button>
        </div>
      </form>
    </div>
  );
}

const CSS = `
.tl { --tl-h: 60px; min-height: 100vh; background: linear-gradient(180deg, #e9f3ec 0, #f1f6f2 320px, #f3f6f4 100%); color: #13261c; }
.tl-bar { position: fixed; top: 0; left: 0; right: 0; z-index: 1200; height: var(--tl-h); display: flex; align-items: center; gap: 12px; padding: 0 16px 0 14px; background: rgba(255,255,255,.96); backdrop-filter: saturate(1.4) blur(8px); border-bottom: 1px solid #e4ece7; }
.tl-menu { width: 40px; height: 40px; flex-shrink: 0; border-radius: 12px; border: 1px solid #e4ece7; background: #f6f8f7; color: #334155; cursor: pointer; display: grid; place-items: center; font-size: 19px; }
.tl-menu:hover { background: #e7f6ec; border-color: #c6e6d1; color: #166534; }
.tl-logo { display: flex; align-items: center; gap: 10px; text-decoration: none !important; flex-shrink: 0; padding-left: 10px; border-left: 1px solid #e4ece7; }
.tl-logo img { width: 32px; height: 32px; display: block; }
.tl-logo span { display: flex; flex-direction: column; line-height: 1.15; }
.tl-logo b { font-size: 15px; font-weight: 800; color: #14532d; }
.tl-logo small { font-size: 10.5px; color: #94a3b8; font-weight: 600; }
.tl-title { margin-left: 12px; padding-left: 14px; border-left: 1px solid #e4ece7; font-size: 15px; font-weight: 800; color: #0f172a; white-space: nowrap; }
.tl-right { margin-left: auto; display: flex; align-items: center; gap: 12px; min-width: 0; }
.tl-acc { position: relative; }
.tl-who { display: flex; align-items: center; gap: 10px; padding: 4px 10px 4px 4px; border: 0; background: none; border-radius: 12px; cursor: pointer; font-family: inherit; text-align: left; }
.tl-who:hover, .tl-who[aria-expanded="true"] { background: #f6f8f7; }
.tl-who > i { color: #94a3b8; }
.tl-av { width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, #14532d, #1e7a4c); color: #ecc77d; font-weight: 800; font-size: 14px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
.tl-av.img { object-fit: cover; background: #e7efe9; }
.tl-who-t { display: flex; flex-direction: column; min-width: 0; line-height: 1.2; }
.tl-who-t b { font-size: 14px; font-weight: 800; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px; }
.tl-who-t small { font-size: 11px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tl-dd { position: absolute; right: 0; top: calc(100% + 8px); width: 250px; background: #fff; border: 1px solid #e4ece7; border-radius: 14px; box-shadow: 0 18px 44px rgba(15,23,42,.14); padding: 6px; z-index: 1300; }
.tl-dd-h { display: flex; flex-direction: column; padding: 8px 10px 10px; border-bottom: 1px solid #eef2f0; margin-bottom: 4px; }
.tl-dd-h b { font-size: 14px; } .tl-dd-h span { font-size: 12px; color: #64748b; overflow: hidden; text-overflow: ellipsis; }
.tl-dd a, .tl-dd button { width: 100%; display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 9px; border: none; background: none; font: inherit; font-size: 13.5px; font-weight: 600; color: #26392f !important; text-decoration: none !important; cursor: pointer; text-align: left; }
.tl-dd a:hover, .tl-dd button:hover { background: #f4f8f5; }
.tl-dd .out, .tl-dd .out i { color: #dc2626 !important; }
.tl-dd .out:hover { background: #fef2f2; }

.tl-chk-wrap { display: flex; align-items: center; gap: 8px; }
.tl-chk { height: 38px; padding: 0 14px; border-radius: 11px; border: none; font: inherit; font-size: 13.5px; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 7px; white-space: nowrap; }
.tl-chk.in { background: linear-gradient(135deg, #15803d, #166534); color: #fff; box-shadow: 0 6px 16px rgba(22,101,52,.25); }
.tl-chk.in:hover { filter: brightness(1.06); }
.tl-chk.out { background: #fff8e8; color: #8a5a0b; border: 1.5px solid #ecc77d; }
.tl-chk.out:hover { background: #fdf0cf; }
.tl-chk:disabled { opacity: .7; cursor: wait; }
.tl-chk-st { display: inline-flex; align-items: center; gap: 7px; font-size: 12.5px; font-weight: 700; color: #166534; background: #ecf7ef; border: 1px solid #cfe9d8; border-radius: 999px; padding: 6px 12px; white-space: nowrap; }
.tl-chk-st .dot { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 0 3px rgba(34,197,94,.25); animation: tlPulse 1.6s ease-in-out infinite; }
.tl-chk-st.done { color: #475569; background: #f1f5f3; border-color: #e2e8e4; }
.tl-chk-st.done i { color: #15803d; }
@keyframes tlPulse { 50% { box-shadow: 0 0 0 6px rgba(34,197,94,0); } }

.tl-rail { position: fixed; left: 0; top: var(--tl-h); bottom: 0; z-index: 1100; width: 68px; background: #fff; border-right: 1px solid #e4ece7; display: flex; flex-direction: column; gap: 2px; padding: 12px 10px; overflow-y: auto; overflow-x: hidden; transition: width .22s cubic-bezier(.2,.8,.2,1); }
.tl.wide .tl-rail { width: 232px; }
.tl-item { position: relative; height: 44px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; gap: 12px; padding: 0 12px; border-radius: 12px; border: none; background: none; color: #64748b; font: inherit; text-decoration: none !important; cursor: pointer; }
.tl-item i { font-size: 19px; flex-shrink: 0; }
.tl-item:hover { background: #f3faf5; color: #166534; }
.tl-item.on, .tl-item.on:hover { background: none; color: #15803d; }
.tl-item.on::before { content: ""; position: absolute; left: -10px; top: 8px; bottom: 8px; width: 4px; border-radius: 0 4px 4px 0; background: linear-gradient(180deg, #e9c46a, #c9962c); box-shadow: 0 0 8px rgba(212,161,47,.45); }
.tl-label { display: none; font-size: 14px; font-weight: 700; white-space: nowrap; }
.tl-item.on .tl-label { font-weight: 800; }
.tl.wide .tl-rail .tl-item { justify-content: flex-start; }
.tl.wide .tl-rail .tl-label { display: inline; }
.tl-fill { flex: 1; min-height: 12px; }
.tl-out:hover { background: #fef2f2; color: #dc2626; }

.tl-main { padding: calc(var(--tl-h) + 28px) 40px 48px calc(68px + 40px); min-height: 100vh; box-sizing: border-box; transition: padding-left .22s cubic-bezier(.2,.8,.2,1); }
.tl.wide .tl-main { padding-left: calc(232px + 40px); }

.tl-drawer-bg { position: fixed; inset: 0; z-index: 1300; background: rgba(15,23,20,.35); }
.tl-drawer { position: absolute; left: 0; top: 0; bottom: 0; width: min(300px, 86vw); background: #fff; display: flex; flex-direction: column; gap: 2px; padding: 14px 12px; box-shadow: 20px 0 40px rgba(0,0,0,.15); animation: tlIn .2s ease; overflow-y: auto; }
@keyframes tlIn { from { transform: translateX(-100%); } to { transform: none; } }
.tl-drawer-h { display: flex; align-items: center; gap: 10px; padding: 4px 4px 14px; margin-bottom: 6px; border-bottom: 1px solid #eef2f0; }
.tl-x { margin-left: auto; width: 34px; height: 34px; flex-shrink: 0; border-radius: 10px; border: 1px solid #e4ece7; background: #fff; color: #334155; cursor: pointer; display: grid; place-items: center; }
.tl-drawer .tl-item { justify-content: flex-start; }
.tl-drawer .tl-label { display: inline; }
.tl-drawer .tl-item.on::before { left: -12px; }

.tl-modal-bg { position: fixed; inset: 0; z-index: 1400; background: rgba(15,23,20,.45); display: grid; place-items: center; padding: 16px; }
.tl-modal { width: min(460px, 100%); background: #fff; border-radius: 18px; padding: 22px; box-shadow: 0 30px 70px rgba(0,0,0,.25); box-sizing: border-box; max-height: calc(100vh - 32px); overflow-y: auto; }
.tl-modal h3 { margin: 0 0 6px; font-size: 19px; font-weight: 800; color: #0f172a; }
.tl-modal p { margin: 0 0 14px; font-size: 13.5px; color: #475569; line-height: 1.55; }
.tl-modal label { display: block; font-size: 13px; font-weight: 800; color: #1e293b; margin-bottom: 6px; }
.tl-modal label span { color: #94a3b8; font-weight: 600; }
.tl-modal textarea, .tl-modal input { width: 100%; box-sizing: border-box; border: 1.5px solid #dbe5df; border-radius: 12px; padding: 10px 12px; font: inherit; font-size: 14px; resize: vertical; outline: none; }
.tl-modal textarea:focus, .tl-modal input:focus { border-color: #15803d; box-shadow: 0 0 0 3px rgba(21,128,61,.12); }
.tl-modal-a { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; flex-wrap: wrap; }
.tl-btn { height: 42px; padding: 0 18px; border-radius: 12px; border: none; background: #14532d; color: #fff !important; font: inherit; font-size: 14px; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 7px; text-decoration: none !important; white-space: nowrap; }
.tl-btn:hover { background: #166534; }
.tl-btn.ghost { background: #fff; color: #14532d !important; border: 1.5px solid #cfe3d6; }
.tl-btn.ghost:hover { background: #f3faf5; }
.tl-btn.gold { background: linear-gradient(135deg, #e9c46a, #c9962c); color: #3b2a05 !important; }
.tl-btn.sm { height: 34px; padding: 0 12px; font-size: 13px; border-radius: 10px; }
.tl-btn:disabled { opacity: .65; cursor: not-allowed; }
.tl-err { margin-top: 10px; font-size: 13px; color: #b91c1c; background: #fef2f2; border-radius: 10px; padding: 8px 12px; }
.tl-okmsg { margin-top: 10px; font-size: 13px; color: #166534; background: #ecf7ef; border-radius: 10px; padding: 8px 12px; }

@media (max-width: 1023px) {
  .tl-rail { display: none; }
  .tl-main, .tl.wide .tl-main { padding: calc(var(--tl-h) + 20px) 24px 32px; }
  .tl-title { display: none; }
}
@media (max-width: 640px) {
  .tl-bar { padding: 0 10px; gap: 8px; }
  .tl-logo { padding-left: 8px; }
  .tl-logo small, .tl-who-t, .tl-who > i, .tl-chk-st { display: none; }
  .tl-logo b { font-size: 14px; }
  .tl-right { gap: 6px; }
  .tl-who { padding: 2px; }
  .tl-av { width: 36px; height: 36px; }
  .tl-chk { height: 36px; padding: 0 11px; font-size: 13px; }
  .tl-main, .tl.wide .tl-main { padding: calc(var(--tl-h) + 16px) 14px 28px; }
}
@media (max-width: 380px) { .tl-logo span { display: none; } }
@media (prefers-reduced-motion: reduce) { .tl-rail, .tl-main, .tl-drawer, .tl-chk-st .dot { transition: none; animation: none; } }

/* shared page pieces */
.tp-h { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 20px; }
.tp-h h1 { margin: 0; font-size: 26px; font-weight: 800; color: #0f172a; letter-spacing: -.01em; line-height: 1.25; }
.tp-h p { margin: 4px 0 0; font-size: 14.5px; color: #64748b; }
.tp-card { background: #fff; border: 1px solid #e4ece7; border-radius: 18px; padding: 20px; box-shadow: 0 1px 2px rgba(15,23,42,.03); box-sizing: border-box; }
.tp-empty { text-align: center; padding: 48px 20px; color: #64748b; font-size: 14.5px; }
.tp-empty > i { display: block; font-size: 34px; color: #c9962c; margin-bottom: 10px; }
.tp-empty b { display: block; font-size: 16px; color: #0f172a; margin-bottom: 4px; }
.tp-load { padding: 40px; text-align: center; color: #94a3b8; font-size: 14px; }
.tp-tabs { display: inline-flex; gap: 4px; background: #fff; border: 1px solid #e4ece7; border-radius: 12px; padding: 4px; }
.tp-tabs button { height: 34px; padding: 0 14px; border: none; border-radius: 9px; background: none; font: inherit; font-size: 13.5px; font-weight: 700; color: #64748b; cursor: pointer; }
.tp-tabs button.on { background: #14532d; color: #fff; }
@media (max-width: 640px) { .tp-h h1 { font-size: 22px; } .tp-card { padding: 16px; border-radius: 16px; } }
`;
