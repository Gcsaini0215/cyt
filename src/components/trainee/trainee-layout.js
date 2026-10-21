import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { getTrainee, getTraineeToken, clearTraineeToken } from "../../utils/trainee-auth";
import { apiUrl } from "../../utils/url";
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
  { to: "/trainee/upgrade", icon: "feather-trending-up", label: "Plan & upgrade" },
  { to: "/trainee/profile", icon: "feather-user", label: "Edit profile" },
];
// phones: bottom bar like the client / therapist portals; "More" opens the full menu
const MOB_NAV = [
  { to: "/trainee", icon: "feather-grid", label: "Home" },
  { to: "/trainee/attendance", icon: "feather-clock", label: "Attendance" },
  { to: "/trainee/tasks", icon: "feather-check-square", label: "Tasks" },
  { to: "/trainee/notes", icon: "feather-book-open", label: "Notes" },
];
const HELP = "https://wa.me/918077757951?text=Hi%2C%20I%27m%20a%20CYT%20trainee%20and%20need%20help";
const WIDE_KEY = "cyt_trainee_wide";

const Ctx = createContext({ me: null, att: null, reloadAtt: () => {}, profile: null, setProfile: () => {}, openCheckOut: () => {}, live: 0 });
export const useTraineePortal = () => useContext(Ctx);

let profileCache = null; // keeps the avatar steady between pages

// a short, upbeat line under the name — changes with the day's check-in and the time
function cheerFor(today) {
  if (today?.checkIn && !today?.checkOut) return "You're on a roll today 🔥";
  if (today?.checkOut) return "Great work today ✨";
  const h = new Date().getHours();
  if (h < 12) return "Let's make today count ☀️";
  if (h < 17) return "Future psychologist at work 🧠";
  return "Every hour counts 🌱";
}

const NOTIF_ICON = { task: "feather-check-square", "task-update": "feather-edit", note: "feather-book-open", certificate: "feather-award", plan: "feather-gift", attendance: "feather-clock" };
function ago(d) {
  const m = Math.max(0, Math.round((Date.now() - new Date(d).getTime()) / 60000));
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr${h > 1 ? "s" : ""} ago`;
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function TraineeLayout({ children, title = "Dashboard" }) {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [profile, setProfileState] = useState(profileCache);
  const [att, setAtt] = useState(null); // { today, days, month, total } | null while loading
  const [wide, setWide] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [menu, setMenu] = useState(false);
  const [outOpen, setOutOpen] = useState(false);
  const [live, setLive] = useState(0);          // bumps on every live event — pages refetch
  const [notifs, setNotifs] = useState({ items: [], unread: 0 });
  const [bell, setBell] = useState(false);
  const [toast, setToast] = useState(null);
  const menuRef = useRef(null);
  const bellRef = useRef(null);

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
  const loadNotifs = useCallback(async () => {
    const r = await tApi("/trainee-portal/notifications");
    if (r.status) setNotifs(r.data);
  }, []);
  // live stream: new alerts pop in, and any change makes open pages refetch
  useEffect(() => {
    if (!getTrainee()) return undefined;
    loadNotifs();
    let es = null;
    let toastTimer = null;
    try {
      es = new EventSource(`${apiUrl}/trainee-portal/stream?token=${encodeURIComponent(getTraineeToken() || "")}`);
      es.addEventListener("notif", (e) => {
        let n = null;
        try { n = JSON.parse(e.data); } catch { return; }
        setNotifs((cur) => ({ items: [n, ...cur.items.filter((x) => x._id !== n._id)].slice(0, 40), unread: cur.unread + 1 }));
        setToast(n);
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => setToast(null), 6000);
      });
      es.addEventListener("changed", (e) => {
        let d = {};
        try { d = JSON.parse(e.data); } catch { /* ignore */ }
        if (d.scope === "attendance") reloadAtt();
        if (d.scope === "profile") tApi("/trainee-portal/profile").then((r) => { if (r.status) setProfile(r.data); });
        setLive((n) => n + 1);
      });
      es.addEventListener("read", () => loadNotifs());
    } catch { /* EventSource unsupported — the bell still loads on open */ }
    // catch up after the tab was in the background
    const onVis = () => { if (document.visibilityState === "visible") { loadNotifs(); reloadAtt(); setLive((n) => n + 1); } };
    document.addEventListener("visibilitychange", onVis);
    return () => { if (es) es.close(); clearTimeout(toastTimer); document.removeEventListener("visibilitychange", onVis); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!bell) return undefined;
    const off = (e) => { if (bellRef.current && !bellRef.current.contains(e.target)) setBell(false); };
    document.addEventListener("mousedown", off);
    return () => document.removeEventListener("mousedown", off);
  }, [bell]);
  const markRead = async (ids) => {
    setNotifs((cur) => ({ items: cur.items.map((x) => (!ids || ids.includes(x._id) ? { ...x, read: true } : x)), unread: ids ? Math.max(0, cur.unread - cur.items.filter((x) => ids.includes(x._id) && !x.read).length) : 0 }));
    await tApi("/trainee-portal/notifications/read", { method: "POST", body: ids ? { ids } : {} });
  };
  const openNotif = (n) => { setBell(false); setToast(null); if (!n.read) markRead([n._id]); if (n.link) router.push(n.link); };

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
  const firstName = name.trim().split(/\s+/)[0] || "there";
  const cheer = cheerFor(att?.today);
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
    <Ctx.Provider value={{ me, att, reloadAtt, profile, setProfile, openCheckOut: () => setOutOpen(true), live }}>
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
            <img src="/cyt-emblem.png" alt="CYT" width="34" height="34" />
            <span className="tl-hi"><b>Hi, {firstName}<em aria-hidden="true">👋</em></b><small>{cheer}</small></span>
          </Link>
          <span className="tl-title">{title}</span>
          <div className="tl-right">
            <CheckChip att={att} reloadAtt={reloadAtt} onOut={() => setOutOpen(true)} />
            <div className="tl-bell-w" ref={bellRef}>
              <button type="button" className="tl-bell" onClick={() => setBell((b) => !b)} aria-label={`Notifications${notifs.unread ? ` (${notifs.unread} new)` : ""}`} aria-expanded={bell}>
                <i className="feather-bell" aria-hidden="true" />
                {notifs.unread > 0 && <span className="tl-bell-n">{notifs.unread > 9 ? "9+" : notifs.unread}</span>}
              </button>
              {bell && (
                <div className="tl-nd" role="dialog" aria-label="Notifications">
                  <div className="tl-nd-h">
                    <b>Notifications</b>
                    {notifs.unread > 0 && <button type="button" onClick={() => markRead(null)}>Mark all read</button>}
                  </div>
                  <div className="tl-nd-list">
                    {notifs.items.length === 0 ? (
                      <div className="tl-nd-empty"><i className="feather-bell-off" aria-hidden="true" />You&apos;re all caught up</div>
                    ) : notifs.items.map((n) => (
                      <button key={n._id} type="button" className={`tl-ni${n.read ? "" : " new"}`} onClick={() => openNotif(n)}>
                        <span className={`tl-ni-ic ${n.type}`} aria-hidden="true"><i className={NOTIF_ICON[n.type] || "feather-bell"} /></span>
                        <span className="tl-ni-t"><b>{n.title}</b>{n.body && <small>{n.body}</small>}<em>{ago(n.createdAt)}</em></span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
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

        <nav className="tl-mob" aria-label="Quick menu">
          {MOB_NAV.map((i) => (
            <Link key={i.to} href={i.to} className={`tl-mob-i${active(i.to) ? " on" : ""}`} aria-current={active(i.to) ? "page" : undefined}>
              <span className="tl-mob-ic"><i className={i.icon} aria-hidden="true" /></span>{i.label}
            </Link>
          ))}
          <button type="button" className={`tl-mob-i${drawer || NAV.slice(4).some((n) => active(n.to)) ? " on" : ""}`} onClick={() => setDrawer(true)}>
            <span className="tl-mob-ic"><i className="feather-more-horizontal" aria-hidden="true" /></span>More
          </button>
        </nav>
        {toast && (
          <button type="button" className="tl-toast" onClick={() => openNotif(toast)} role="status">
            <span className={`tl-ni-ic ${toast.type}`} aria-hidden="true"><i className={NOTIF_ICON[toast.type] || "feather-bell"} /></span>
            <span className="tl-ni-t"><b>{toast.title}</b>{toast.body && <small>{toast.body}</small>}</span>
            <i className="feather-x tl-toast-x" aria-hidden="true" onClick={(e) => { e.stopPropagation(); setToast(null); }} />
          </button>
        )}
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
.tl { --tl-h: 60px; min-height: 100vh; background: #f4f7f5; color: #13261c; }
.tl-bar { position: fixed; top: 0; left: 0; right: 0; z-index: 1200; height: var(--tl-h); display: flex; align-items: center; gap: 12px; padding: 0 16px 0 14px; background: rgba(255,255,255,.96); backdrop-filter: saturate(1.4) blur(8px); border-bottom: 1px solid #e4ece7; }
.tl-menu { width: 40px; height: 40px; flex-shrink: 0; border-radius: 12px; border: 1px solid #e4ece7; background: #f6f8f7; color: #334155; cursor: pointer; display: grid; place-items: center; font-size: 19px; }
.tl-menu:hover { background: #e7f6ec; border-color: #c6e6d1; color: #166534; }
.tl-logo { display: flex; align-items: center; gap: 10px; text-decoration: none !important; flex-shrink: 0; padding-left: 10px; border-left: 1px solid #e4ece7; }
.tl-logo img { width: 32px; height: 32px; display: block; }
.tl-logo span { display: flex; flex-direction: column; line-height: 1.15; }
.tl-logo b { font-size: 15px; font-weight: 800; color: #14532d; }
.tl-hi b { display: inline-flex; align-items: center; gap: 4px; max-width: 220px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; letter-spacing: -.01em; }
.tl-hi b em { font-style: normal; display: inline-block; transform-origin: 70% 70%; animation: tlWave 2.4s ease-in-out 0.6s 2; }
.tl-hi small { white-space: nowrap; }
@keyframes tlWave { 0%, 60%, 100% { transform: rotate(0); } 10%, 30% { transform: rotate(16deg); } 20% { transform: rotate(-8deg); } 40% { transform: rotate(-4deg); } 50% { transform: rotate(10deg); } }
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

.tl-bell-w { position: relative; }
.tl-bell { position: relative; width: 40px; height: 40px; border-radius: 12px; border: 0; background: none; color: rgba(255,255,255,.9); cursor: pointer; display: grid; place-items: center; font-size: 19px; }
.tl-bell:hover, .tl-bell[aria-expanded="true"] { background: rgba(255,255,255,.14); color: #fff; }
.tl-bell-n { position: absolute; top: 4px; right: 3px; min-width: 17px; height: 17px; padding: 0 4px; box-sizing: border-box; border-radius: 9px; background: #ef4444; color: #fff; font-size: 10px; font-weight: 800; display: grid; place-items: center; border: 2px solid #14532d; }
.tl-nd { position: absolute; right: -60px; top: calc(100% + 10px); width: 360px; max-width: calc(100vw - 20px); background: #fff; border: 1px solid #e4ece7; border-radius: 16px; box-shadow: 0 22px 50px rgba(15,23,42,.18); z-index: 1300; overflow: hidden; color: #0f172a; }
.tl-nd-h { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px 10px; border-bottom: 1px solid #eef2f0; }
.tl-nd-h b { font-size: 15px; font-weight: 800; }
.tl-nd-h button { border: 0; background: none; font: inherit; font-size: 12.5px; font-weight: 800; color: #15803d; cursor: pointer; }
.tl-nd-list { max-height: 420px; overflow-y: auto; padding: 6px; }
.tl-nd-empty { padding: 34px 10px; text-align: center; color: #94a3b8; font-size: 13.5px; display: flex; flex-direction: column; align-items: center; gap: 8px; }
.tl-nd-empty i { font-size: 24px; color: #cbd5e1; }
.tl-ni { width: 100%; display: flex; gap: 10px; align-items: flex-start; padding: 10px; border: 0; border-radius: 12px; background: none; font: inherit; text-align: left; cursor: pointer; position: relative; }
.tl-ni:hover { background: #f6faf7; }
.tl-ni.new { background: #f3faf5; }
.tl-ni.new::after { content: ""; position: absolute; top: 14px; right: 10px; width: 8px; height: 8px; border-radius: 50%; background: #15803d; }
.tl-ni-ic { width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0; display: grid; place-items: center; font-size: 15px; background: #ecf7ef; color: #15803d; }
.tl-ni-ic.note { background: #fff6dc; color: #8a5a0b; }
.tl-ni-ic.certificate, .tl-ni-ic.plan { background: linear-gradient(135deg, #fbe7a8, #e9c46a); color: #6b4a07; }
.tl-ni-ic.task-update, .tl-ni-ic.attendance { background: #eff6ff; color: #1d4ed8; }
.tl-ni-t { display: flex; flex-direction: column; min-width: 0; padding-right: 14px; }
.tl-ni-t b { font-size: 13.5px; font-weight: 800; color: #0f172a; line-height: 1.35; }
.tl-ni-t small { font-size: 12.5px; color: #64748b; line-height: 1.4; margin-top: 2px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.tl-ni-t em { font-style: normal; font-size: 11.5px; color: #94a3b8; font-weight: 600; margin-top: 3px; }
.tl-toast { position: fixed; right: 18px; top: calc(var(--tl-h) + 14px); z-index: 1350; width: 340px; max-width: calc(100vw - 28px); display: flex; gap: 10px; align-items: flex-start; padding: 12px 14px; border-radius: 14px; border: 1px solid #e4ece7; border-left: 4px solid #c9962c; background: #fff; box-shadow: 0 20px 44px rgba(15,23,42,.2); font: inherit; text-align: left; cursor: pointer; animation: tlToast .28s cubic-bezier(.2,.8,.2,1); }
.tl-toast-x { margin-left: auto; color: #94a3b8; font-size: 15px; padding: 2px; }
@keyframes tlToast { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: none; } }

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
@keyframes tlUp { from { transform: translateY(100%); } to { transform: none; } }
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

/* brand green top bar — same as the therapist / client dashboards */
.tl-bar.tl-bar { background: linear-gradient(90deg, #0b3320 0%, #14532d 55%, #166534 100%); border-bottom: 0; box-shadow: 0 6px 18px -10px rgba(4,30,16,.55); backdrop-filter: none; }
.tl-bar .tl-menu { background: rgba(255,255,255,.12); border-color: rgba(255,255,255,.22); color: #fff; }
.tl-bar .tl-menu:hover { background: rgba(255,255,255,.2); border-color: rgba(255,255,255,.35); color: #fff; }
.tl-bar .tl-logo { border-left-color: rgba(255,255,255,.22); }
.tl-bar .tl-logo img { width: 34px; height: 34px; background: #fff; border-radius: 10px; padding: 3px; box-sizing: border-box; object-fit: contain; }
.tl-bar .tl-logo b { color: #fff; }
.tl-bar .tl-logo small { color: #bbf7d0; font-weight: 700; }
.tl-bar .tl-title { color: #fff; border-left-color: rgba(255,255,255,.22); }
.tl-bar .tl-who:hover, .tl-bar .tl-who[aria-expanded="true"] { background: rgba(255,255,255,.1); }
.tl-bar .tl-who-t { display: none; } /* the name is already shown as "Hi, …" on the left */
.tl-bar .tl-who-t b { color: #fff; }
.tl-bar .tl-who-t small { color: #bbf7d0; }
.tl-bar .tl-who > i { color: rgba(255,255,255,.7); }
.tl-bar .tl-av { background: #fff; color: #14532d; box-shadow: 0 0 0 2px rgba(255,255,255,.85); }
.tl-bar .tl-av.img { background: #fff; }
.tl-bar .tl-chk.in { background: #fff; color: #14532d; box-shadow: 0 6px 16px -6px rgba(0,0,0,.4); }
.tl-bar .tl-chk.out { background: rgba(255,255,255,.12); color: #fff; border-color: rgba(255,255,255,.4); }
.tl-bar .tl-chk.out:hover { background: rgba(255,255,255,.2); }
.tl-bar .tl-chk-st { background: rgba(255,255,255,.12); border-color: rgba(255,255,255,.2); color: #dcfce7; }
.tl-bar .tl-chk-st.done { background: rgba(255,255,255,.1); color: #e2e8f0; }
.tl-bar .tl-chk-st.done i { color: #86efac; }

@media (max-width: 1023px) {
  .tl-rail { display: none; }
  .tl-main, .tl.wide .tl-main { padding: calc(var(--tl-h) + 20px) 24px 32px; }
  .tl-title { display: none; }
}
@media (max-width: 640px) {
  .tl-bar { padding: 0 10px; gap: 8px; }
  .tl-logo { padding-left: 8px; }
  .tl-bar .tl-who-t, .tl-who > i, .tl-chk-st { display: none; }
  .tl-hi b { max-width: 140px; }
  .tl-hi small { font-size: 10px; }
  .tl-logo b { font-size: 14px; }
  .tl-right { gap: 6px; }
  .tl-who { padding: 2px; }
  .tl-av { width: 36px; height: 36px; }
  .tl-chk { height: 36px; padding: 0 11px; font-size: 13px; }
  .tl-main, .tl.wide .tl-main { padding: calc(var(--tl-h) + 16px) 14px 28px; }
}
@media (max-width: 640px) { .tl-nd { position: fixed; left: 10px; right: 10px; top: calc(var(--tl-h) + 8px); width: auto; max-width: none; } .tl-bell { width: 36px; height: 36px; } }
@media (max-width: 420px) { .tl-hi small { display: none; } .tl-hi b { max-width: 110px; } }
.tl-mob { display: none; }
@media (max-width: 767px) {
  .tl-drawer { left: 0; right: 0; top: auto; bottom: 0; width: auto; max-height: 82vh; border-radius: 22px 22px 0 0; padding: 8px 14px calc(16px + env(safe-area-inset-bottom, 0px)); box-shadow: 0 -20px 40px rgba(0,0,0,.18); animation: tlUp .24s cubic-bezier(.2,.8,.2,1); display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; align-content: start; }
  .tl-drawer::before { content: ""; grid-column: 1 / -1; justify-self: center; width: 40px; height: 4px; border-radius: 4px; background: #d6ded9; margin: 2px 0 4px; }
  .tl-drawer-h { grid-column: 1 / -1; margin-bottom: 2px; }
  .tl-drawer .tl-item { height: auto; min-height: 76px; flex-direction: column; justify-content: center; gap: 6px; padding: 10px 6px; border-radius: 14px; background: #f6f9f7; text-align: center; }
  .tl-drawer .tl-item i { font-size: 20px; width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center; background: #fff; color: #15803d; box-shadow: 0 2px 6px -3px rgba(15,23,42,.2); }
  .tl-drawer .tl-label { font-size: 12px; font-weight: 700; white-space: normal; line-height: 1.25; color: #334155; }
  .tl-drawer .tl-item.on { background: #ecf7ef; }
  .tl-drawer .tl-item.on i { background: #15803d; color: #fff; }
  .tl-drawer .tl-item.on::before { display: none; }
  .tl-drawer .tl-fill { display: none; }
  .tl-drawer .tl-out i { color: #dc2626; }
  .tl-mob { display: flex; position: fixed; z-index: 1200; left: 0; right: 0; bottom: 0; gap: 2px; padding: 6px 6px calc(6px + env(safe-area-inset-bottom, 0px)); background: rgba(255,255,255,.97); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border-top: 1px solid #e4ece7; box-shadow: 0 -6px 20px -12px rgba(4,22,14,.2); }
  .tl-mob-i { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; text-decoration: none !important; color: #64748b !important; font: inherit; font-weight: 700; font-size: 10.5px; padding: 4px 0; border: 0; background: none; cursor: pointer; }
  .tl-mob-ic { width: 52px; height: 30px; border-radius: 999px; display: grid; place-items: center; font-size: 19px; transition: background .18s; }
  .tl-mob-i.on { color: #166534 !important; }
  .tl-mob-i.on .tl-mob-ic { background: #166534; color: #fff; box-shadow: 0 4px 12px -4px rgba(22,101,52,.55); }
  .tl-main, .tl.wide .tl-main { padding-bottom: calc(84px + env(safe-area-inset-bottom, 0px)); }
  .tl-menu { display: none; }
  .tl-logo { border-left: 0; padding-left: 2px; }
  .tl-toast { top: auto; bottom: calc(80px + env(safe-area-inset-bottom, 0px)); right: 10px; left: 10px; width: auto; }
}
@media (prefers-reduced-motion: reduce) { .tl-rail, .tl-main, .tl-drawer, .tl-chk-st .dot, .tl-hi b em { transition: none; animation: none; } }

/* shared page pieces */
.tp-h { display: flex; align-items: flex-end; justify-content: space-between; gap: 14px; flex-wrap: wrap; margin-bottom: 16px; }
.tp-h h1 { margin: 0; font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -.01em; line-height: 1.25; }
.tp-h p { margin: 3px 0 0; font-size: 13.5px; color: #64748b; }
.tp-card { background: #fff; border: 1px solid #e4ece7; border-radius: 18px; padding: 20px; box-shadow: 0 1px 2px rgba(15,23,42,.03); box-sizing: border-box; }
.tp-empty { text-align: center; padding: 48px 20px; color: #64748b; font-size: 14.5px; }
.tp-empty > i { display: block; font-size: 34px; color: #c9962c; margin-bottom: 10px; }
.tp-empty b { display: block; font-size: 16px; color: #0f172a; margin-bottom: 4px; }
.tp-load { padding: 40px; text-align: center; color: #94a3b8; font-size: 14px; }
.tp-tabs { display: inline-flex; gap: 4px; background: #fff; border: 1px solid #e4ece7; border-radius: 12px; padding: 4px; }
.tp-tabs button { height: 34px; padding: 0 14px; border: none; border-radius: 9px; background: none; font: inherit; font-size: 13.5px; font-weight: 700; color: #64748b; cursor: pointer; }
.tp-tabs button.on { background: #14532d; color: #fff; }
@media (max-width: 640px) { .tp-h h1 { font-size: 20px; } .tp-card { padding: 16px; border-radius: 16px; } }
`;
