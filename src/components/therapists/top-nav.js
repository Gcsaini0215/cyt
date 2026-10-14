import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import useTherapistStore from "../../store/therapistStore";
import { removeToken } from "../../utils/jwt";
import { defaultProfile, imagePath, getBookings } from "../../utils/url";
import { fetchById } from "../../utils/actions";
import { toast } from "react-toastify";
import { NAV_GROUPS, NAV_ITEMS, isActive } from "./side-nav";

import MonitorHeartRoundedIcon from "@mui/icons-material/MonitorHeartRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import MenuOpenRoundedIcon from "@mui/icons-material/MenuOpenRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AppsRoundedIcon from "@mui/icons-material/AppsRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";

const logo1 = "/cyt-emblem.png";
const WIDE_KEY = "cyt_tsn_wide";

// phones: four favourites + "More" (opens the full menu)
const MOB_NAV = [
  { to: "/therapist-dashboard", Icon: MonitorHeartRoundedIcon, label: "Home" },
  { to: "/appointments", Icon: EventAvailableRoundedIcon, label: "Sessions", badge: true },
  { to: "/my-schedule", Icon: CalendarMonthRoundedIcon, label: "Schedule" },
  { to: "/settings", Icon: ManageAccountsRoundedIcon, label: "Settings" },
];

/* Top bar for the therapist portal: menu button (widens the rail on desktop / opens the
   full menu on phones & tablets), logo, a page search, and account controls. Phones also
   get an always-visible bottom bar. */
export default function DashboardTopNav() {
  const { therapistInfo, fetchTherapistInfo, notificationCount, setNotificationCount } = useTherapistStore();
  const router = useRouter();
  const pathname = router.pathname;
  const [profileOpen, setProfileOpen] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [wide, setWide] = useState(false);
  const [q, setQ] = useState("");
  const [qOpen, setQOpen] = useState(false);
  const [qIdx, setQIdx] = useState(0);
  const profileRef = useRef(null);
  const searchRef = useRef(null);
  const closeTimer = useRef(null);
  const prevBookingsCount = useRef(null);

  const openProfile = () => { clearTimeout(closeTimer.current); setProfileOpen(true); };
  const closeProfileSoon = () => { clearTimeout(closeTimer.current); closeTimer.current = setTimeout(() => setProfileOpen(false), 250); };

  // remembered rail width (desktop)
  useEffect(() => {
    let on = false;
    try { on = localStorage.getItem(WIDE_KEY) === "1"; } catch (e) { /* storage blocked */ }
    setWide(on);
  }, []);
  useEffect(() => {
    if (wide) document.documentElement.setAttribute("data-tsn-wide", "");
    else document.documentElement.removeAttribute("data-tsn-wide");
    try { localStorage.setItem(WIDE_KEY, wide ? "1" : "0"); } catch (e) { /* ignore */ }
  }, [wide]);
  // leaving the portal: drop the attribute so other pages aren't affected
  useEffect(() => () => document.documentElement.removeAttribute("data-tsn-wide"), []);

  const onMenu = () => {
    if (window.matchMedia("(min-width: 1024px)").matches) setWide((w) => !w);
    else setDrawer(true);
  };

  // close menus on navigation / Esc / outside click
  useEffect(() => { setDrawer(false); setProfileOpen(false); setQOpen(false); setQ(""); }, [pathname]);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") { setDrawer(false); setProfileOpen(false); setQOpen(false); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); searchRef.current?.focus(); setQOpen(true); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    if (!profileOpen) return undefined;
    const onDown = (e) => { if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("touchstart", onDown); };
  }, [profileOpen]);
  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawer]);
  useEffect(() => () => clearTimeout(closeTimer.current), []);

  useEffect(() => { fetchTherapistInfo(); }, [fetchTherapistInfo]);

  // new-booking alert
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetchById(getBookings);
        if (res?.status && res.data) {
          const count = res.data.length;
          if (prevBookingsCount.current !== null && count > prevBookingsCount.current) {
            const n = count - prevBookingsCount.current;
            setNotificationCount((useTherapistStore.getState?.().notificationCount || 0) + n);
            toast.info(`🔔 You have ${n} new session booking${n > 1 ? "s" : ""}!`, { position: "top-right", autoClose: 5000 });
          }
          prevBookingsCount.current = count;
        }
      } catch (err) {
        console.error("booking poll error:", err);
      }
    };
    check();
    const id = setInterval(check, 30000);
    return () => clearInterval(id);
  }, [setNotificationCount]);

  const handleLogout = () => { removeToken(); router.push("/login"); };

  const name = therapistInfo?.user?.name || "Therapist";
  const avatarSrc = therapistInfo?.user?.profile ? `${imagePath}/${therapistInfo.user.profile}` : defaultProfile;
  const publicProfile = therapistInfo?._id ? `/view-profile/${therapistInfo._id}` : null;

  // page search
  const results = q.trim() ? NAV_ITEMS.filter((i) => i.label.toLowerCase().includes(q.trim().toLowerCase())) : NAV_ITEMS;
  const go = (item) => { if (item) { setQOpen(false); setQ(""); searchRef.current?.blur(); router.push(item.to); } };
  const onSearchKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setQIdx((i) => Math.min(i + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setQIdx((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); go(results[qIdx]); }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: TN_CSS }} />

      <header className="tn-bar">
        <button type="button" className="tn-menu-btn" onClick={onMenu} aria-label="Menu" title="Menu">
          {wide ? <MenuOpenRoundedIcon /> : <MenuRoundedIcon />}
        </button>

        <Link href="/therapist-dashboard" className="tn-logo">
          <img src={logo1} alt="CYT" width={28} height={28} />
          <span className="tn-title-text">Therapist Portal</span>
        </Link>

        <div className="tn-search" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setQOpen(false); }}>
          <SearchRoundedIcon />
          <input ref={searchRef} type="search" value={q} placeholder="Search pages…" aria-label="Search pages — appointments, schedule, settings"
            aria-label="Search pages" onFocus={() => { setQOpen(true); setQIdx(0); }}
            onChange={(e) => { setQ(e.target.value); setQIdx(0); setQOpen(true); }} onKeyDown={onSearchKey} />
          <kbd>Ctrl K</kbd>
          {qOpen && (
            <div className="tn-search-dd" role="listbox">
              {results.length ? results.map((item, i) => (
                <button key={item.to} type="button" role="option" aria-selected={i === qIdx} className={i === qIdx ? "on" : ""}
                  onMouseEnter={() => setQIdx(i)} onMouseDown={(e) => { e.preventDefault(); go(item); }}>
                  <item.Icon /> {item.label}
                </button>
              )) : <div className="tn-search-empty">No page called “{q}”</div>}
            </div>
          )}
        </div>

        <div className="tn-right">
          <a href="https://www.chooseyourtherapist.in" target="_blank" rel="noopener noreferrer" className="tn-icon-btn tn-hide-sm" title="Go to website" aria-label="Go to website">
            <LanguageRoundedIcon />
          </a>
          <Link href="/appointments" className="tn-icon-btn" onClick={() => setNotificationCount(0)} title="New bookings" aria-label="New bookings">
            <NotificationsActiveRoundedIcon />
            {notificationCount > 0 && <span className="tn-notif-dot">{notificationCount}</span>}
          </Link>

          <div ref={profileRef} className="tn-prof" onMouseEnter={openProfile} onMouseLeave={closeProfileSoon}>
            <button type="button" className="tn-prof-btn" aria-haspopup="menu" aria-expanded={profileOpen}
              onClick={() => { clearTimeout(closeTimer.current); setProfileOpen((o) => !o); }}>
              <img src={avatarSrc} alt="" className="tn-prof-av" onError={(e) => { e.target.onerror = null; e.target.src = defaultProfile; }} />
              <span className="tn-prof-name">{name}</span>
              <KeyboardArrowDownRoundedIcon className="tn-prof-chevron" />
            </button>
            {profileOpen && (
              <div className="tn-prof-dd" role="menu" onClick={() => setProfileOpen(false)}>
                <div className="tn-prof-dd-head">
                  <img src={avatarSrc} alt="" onError={(e) => { e.target.onerror = null; e.target.src = defaultProfile; }} />
                  <div><b>{name}</b><span>Therapist</span></div>
                </div>
                {publicProfile && <a href={publicProfile} target="_blank" rel="noopener noreferrer"><OpenInNewRoundedIcon /> View public profile</a>}
                <Link href="/settings"><PersonRoundedIcon /> Edit profile</Link>
                <button type="button" onClick={handleLogout} className="logout-btn"><LogoutRoundedIcon /> Log out</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* full menu (phones / tablets) */}
      {drawer && (
        <div className="tn-drawer-wrap" onClick={(e) => { if (e.target === e.currentTarget) setDrawer(false); }}>
          <aside className="tn-drawer" role="dialog" aria-modal="true" aria-label="Menu">
            <div className="tn-drawer-head">
              <img src={avatarSrc} alt="" onError={(e) => { e.target.onerror = null; e.target.src = defaultProfile; }} />
              <div><b>{name}</b><span>Therapist</span></div>
              <button type="button" onClick={() => setDrawer(false)} aria-label="Close menu"><CloseRoundedIcon /></button>
            </div>
            <nav>
              {NAV_GROUPS.map((g) => (
                <div key={g.title} className="tn-drawer-group">
                  <span>{g.title}</span>
                  {g.items.map((item) => (
                    <Link key={item.to} href={item.to} className={isActive(item, pathname) ? "on" : ""} onClick={() => item.badge && setNotificationCount(0)}>
                      <item.Icon /> {item.label}
                      {item.badge && notificationCount > 0 && <em>{notificationCount}</em>}
                    </Link>
                  ))}
                </div>
              ))}
            </nav>
            <div className="tn-drawer-foot">
              {publicProfile && <a href={publicProfile} target="_blank" rel="noopener noreferrer"><OpenInNewRoundedIcon /> Public profile</a>}
              <button type="button" onClick={handleLogout}><LogoutRoundedIcon /> Log out</button>
            </div>
          </aside>
        </div>
      )}

      {/* phones: always-visible bottom bar */}
      <nav className="tn-mob-nav" aria-label="Quick menu">
        {MOB_NAV.map((item) => (
          <Link key={item.to} href={item.to} className={`tn-mob-item${isActive(item, pathname) ? " active" : ""}`}
            onClick={() => item.badge && setNotificationCount(0)}>
            {item.badge && notificationCount > 0 && <span className="tn-mob-badge">{notificationCount}</span>}
            <span className="tn-mob-ico"><item.Icon /></span>
            {item.label}
          </Link>
        ))}
        <button type="button" className={`tn-mob-item${drawer ? " active" : ""}`} onClick={() => setDrawer(true)}>
          <span className="tn-mob-ico"><AppsRoundedIcon /></span>
          More
        </button>
      </nav>
    </>
  );
}

const TN_CSS = `
:root { --tn-h: 56px; }
.tn-bar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 1200; height: var(--tn-h);
  background: rgba(255,255,255,.96); backdrop-filter: saturate(1.4) blur(8px); -webkit-backdrop-filter: saturate(1.4) blur(8px);
  border-bottom: 1px solid #e4ece7; display: flex; align-items: center; gap: 12px; padding: 0 16px 0 14px;
  user-select: none;
}
.tn-menu-btn { width: 40px; height: 40px; border-radius: 11px; flex-shrink: 0; background: transparent; border: none; cursor: pointer; display: grid; place-items: center; color: #475569; transition: background .14s, color .14s; }
.tn-menu-btn:hover { background: #f1f5f3; color: #166534; }
.tn-menu-btn svg { font-size: 23px; }
.tn-logo { display: flex; align-items: center; gap: 9px; text-decoration: none !important; flex-shrink: 0; }
.tn-logo img { width: 28px; height: 28px; object-fit: contain; display: block; }
.tn-title-text { font-size: 15px; font-weight: 800; color: #0f172a; white-space: nowrap; }

.tn-search { position: relative; flex: 1; min-width: 0; max-width: 460px; height: 40px; margin-left: 12px; background: #f1f5f3; border: 1px solid transparent; border-radius: 11px; display: flex; align-items: center; gap: 8px; padding: 0 10px 0 12px; color: #94a3b8; transition: border-color .14s, background .14s; }
.tn-search:focus-within { background: #fff; border-color: #a7d7b8; box-shadow: 0 0 0 3px rgba(22,101,52,.08); }
.tn-search svg { font-size: 19px; flex-shrink: 0; }
.tn-search input { flex: 1; min-width: 0; height: 100%; border: 0; outline: none; background: transparent; font-size: 14px; color: #0f172a; font-family: inherit; }
.tn-search input::placeholder { color: #94a3b8; }
.tn-search kbd { font: 700 10.5px inherit; color: #94a3b8; background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 2px 6px; white-space: nowrap; }
.tn-search-dd { position: absolute; top: calc(100% + 6px); left: 0; right: 0; background: #fff; border: 1px solid #e4ece7; border-radius: 12px; box-shadow: 0 18px 44px rgba(15,23,42,.14); padding: 6px; max-height: 60vh; overflow-y: auto; z-index: 1300; }
.tn-search-dd button { display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 10px; border: 0; background: none; border-radius: 9px; text-align: left; font: 600 14px inherit; color: #334155; cursor: pointer; }
.tn-search-dd button svg { font-size: 18px; color: #64748b; }
.tn-search-dd button.on { background: #f0fdf4; color: #166534; }
.tn-search-dd button.on svg { color: #166534; }
.tn-search-empty { padding: 12px; font-size: 13.5px; color: #64748b; }

.tn-right { display: flex; align-items: center; gap: 4px; margin-left: auto; flex-shrink: 0; height: 100%; }
.tn-icon-btn { width: 40px; height: 40px; border-radius: 11px; background: transparent; border: none; cursor: pointer; display: grid; place-items: center; color: #475569; transition: background .14s, color .14s; text-decoration: none; position: relative; }
.tn-icon-btn svg { font-size: 21px; }
.tn-icon-btn:hover { background: #f1f5f3; color: #166534; }
.tn-notif-dot { position: absolute; top: 4px; right: 4px; min-width: 17px; height: 17px; padding: 0 4px; border-radius: 9px; background: #ef4444; color: #fff; font-size: 10px; font-weight: 800; display: flex; align-items: center; justify-content: center; border: 2px solid #fff; }

.tn-prof { position: relative; height: 100%; display: flex; align-items: center; }
.tn-prof-btn { height: 40px; padding: 0 8px 0 5px; display: flex; align-items: center; gap: 8px; border-radius: 11px; border: none; background: none; color: #0f172a; font-size: 14px; font-weight: 700; cursor: pointer; transition: background .14s; }
.tn-prof-btn:hover { background: #f1f5f3; }
.tn-prof-av { width: 30px; height: 30px; border-radius: 9px; object-fit: cover; flex-shrink: 0; box-shadow: 0 0 0 1px #e4ece7; }
.tn-prof-name { max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tn-prof-chevron { font-size: 18px !important; opacity: .55; }
.tn-prof-dd { position: absolute; top: calc(100% - 4px); right: 0; background: #fff; border: 1px solid #e4ece7; border-radius: 14px; min-width: 240px; z-index: 1300; box-shadow: 0 18px 44px rgba(15,23,42,.16); padding: 6px; animation: tnDdIn .14s ease both; }
.tn-prof-dd::before { content: ""; position: absolute; left: 0; right: 0; top: -10px; height: 10px; }
@keyframes tnDdIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
.tn-prof-dd-head { display: flex; align-items: center; gap: 10px; padding: 10px; border-bottom: 1px solid #eef2f0; margin-bottom: 6px; }
.tn-prof-dd-head img { width: 38px; height: 38px; border-radius: 11px; object-fit: cover; }
.tn-prof-dd-head b { display: block; font-size: 14px; color: #0f172a; }
.tn-prof-dd-head span { font-size: 12px; color: #166534; font-weight: 700; }
.tn-prof-dd a, .tn-prof-dd button { display: flex; align-items: center; gap: 10px; padding: 10px; width: 100%; color: #334155; font-size: 14px; font-weight: 600; text-decoration: none !important; background: transparent; border: none; border-radius: 9px; cursor: pointer; text-align: left; font-family: inherit; }
.tn-prof-dd a svg, .tn-prof-dd button svg { font-size: 19px; color: #64748b; }
.tn-prof-dd a:hover, .tn-prof-dd button:hover { background: #f0fdf4; color: #166534; }
.tn-prof-dd .logout-btn, .tn-prof-dd .logout-btn svg { color: #dc2626; }
.tn-prof-dd .logout-btn:hover { background: #fef2f2; }

.tn-drawer-wrap { position: fixed; inset: 0; z-index: 1400; background: rgba(15,23,42,.38); animation: tnFade .18s ease; }
@keyframes tnFade { from { opacity: 0; } to { opacity: 1; } }
.tn-drawer { position: absolute; top: 0; left: 0; bottom: 0; width: min(320px, 86vw); background: #fff; display: flex; flex-direction: column; box-shadow: 20px 0 50px -20px rgba(0,0,0,.35); animation: tnSlide .24s cubic-bezier(.2,.9,.3,1); padding-top: env(safe-area-inset-top, 0px); }
@keyframes tnSlide { from { transform: translateX(-100%); } to { transform: none; } }
.tn-drawer-head { display: flex; align-items: center; gap: 12px; padding: 16px; border-bottom: 1px solid #eef2f0; }
.tn-drawer-head img { width: 44px; height: 44px; border-radius: 13px; object-fit: cover; }
.tn-drawer-head div { flex: 1; min-width: 0; }
.tn-drawer-head b { display: block; font-size: 15px; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tn-drawer-head span { font-size: 12.5px; font-weight: 700; color: #166534; }
.tn-drawer-head button { width: 40px; height: 40px; border-radius: 11px; border: 0; background: #f1f5f3; color: #334155; display: grid; place-items: center; cursor: pointer; }
.tn-drawer nav { flex: 1; overflow-y: auto; padding: 8px 10px; }
.tn-drawer-group { display: flex; flex-direction: column; gap: 2px; margin-bottom: 8px; }
.tn-drawer-group > span { font-size: 11px; font-weight: 800; letter-spacing: .6px; text-transform: uppercase; color: #94a3b8; padding: 10px 12px 4px; }
.tn-drawer-group a { display: flex; align-items: center; gap: 12px; height: 46px; padding: 0 12px; border-radius: 12px; color: #334155; font-size: 15px; font-weight: 700; text-decoration: none !important; }
.tn-drawer-group a svg { font-size: 21px; color: #64748b; }
.tn-drawer-group a.on { background: #e7f6ec; color: #166534; }
.tn-drawer-group a.on svg { color: #166534; }
.tn-drawer-group a em { margin-left: auto; font-style: normal; background: #ef4444; color: #fff; font-size: 11px; font-weight: 800; border-radius: 9px; padding: 1px 7px; }
.tn-drawer-foot { display: flex; gap: 8px; padding: 12px 14px calc(12px + env(safe-area-inset-bottom, 0px)); border-top: 1px solid #eef2f0; }
.tn-drawer-foot a, .tn-drawer-foot button { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 44px; border-radius: 12px; border: 1.5px solid #e2e8f0; background: #fff; color: #334155; font: 700 13.5px inherit; text-decoration: none !important; cursor: pointer; }
.tn-drawer-foot button { color: #dc2626; border-color: #fecaca; }

.tn-mob-nav { display: none; }
@media (max-width: 1023px) {
  .tn-search kbd { display: none; }
}
@media (max-width: 767px) {
  .tn-bar { gap: 6px; padding: 0 8px; }
  .tn-title-text, .tn-prof-name, .tn-prof-chevron, .tn-hide-sm { display: none; }
  .tn-search { margin-left: 4px; max-width: none; min-width: 0; padding: 0 8px 0 10px; }
  .tn-search input::placeholder { text-overflow: ellipsis; }
  .tn-right { gap: 0; }
  .tn-search input { font-size: 16px; }
  .tn-search input::placeholder { font-size: 14px; }
  .tn-mob-nav {
    display: flex; position: fixed; z-index: 1200; left: 0; right: 0; bottom: 0;
    padding: 6px 6px calc(6px + env(safe-area-inset-bottom, 0px)); gap: 2px;
    background: rgba(255,255,255,.97); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
    border-top: 1px solid #e4ece7; box-shadow: 0 -6px 20px -12px rgba(4,22,14,.2);
  }
  .tn-mob-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; text-decoration: none !important; color: #64748b; font: 700 10.5px inherit; padding: 4px 0; position: relative; border: 0; background: none; cursor: pointer; }
  .tn-mob-ico { width: 52px; height: 30px; border-radius: 999px; display: grid; place-items: center; transition: background .18s; }
  .tn-mob-ico svg { font-size: 23px; }
  .tn-mob-item.active { color: #166534; }
  .tn-mob-item.active .tn-mob-ico { background: #e7f6ec; }
  .tn-mob-badge { position: absolute; top: 0; right: calc(50% - 26px); background: #ef4444; color: #fff; border-radius: 8px; padding: 1px 5px; font-size: 9.5px; font-weight: 800; border: 2px solid #fff; z-index: 1; }
}
@media (prefers-reduced-motion: reduce) { .tn-drawer, .tn-drawer-wrap, .tn-prof-dd { animation: none; } }
`;
