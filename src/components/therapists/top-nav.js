import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import useTherapistStore from "../../store/therapistStore";
import { removeToken } from "../../utils/jwt";
import { defaultProfile, imagePath } from "../../utils/url";
import { fetchBookingsShared } from "../../utils/bookings-shared";
import { toast } from "react-toastify";
import { NAV_GROUPS, NAV_ITEMS, isActive } from "./side-nav";
import useCommsStore from "../../store/commsStore";
import { useNavBadges, NavBadge, listingOf, shareProfile, NX_CSS } from "./nav-extras";
import { profilePct } from "../../utils/profile-checks";
import IosShareRoundedIcon from "@mui/icons-material/IosShareRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";

import MonitorHeartRoundedIcon from "@mui/icons-material/MonitorHeartRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
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
  { to: "/appointments", Icon: EventAvailableRoundedIcon, label: "Sessions", badgeKey: "bookings" },
  { to: "/my-schedule", Icon: CalendarMonthRoundedIcon, label: "Schedule" },
  { to: "/settings", Icon: ManageAccountsRoundedIcon, label: "Settings", badgeKey: "settings" },
];

/* Top bar for the therapist portal: menu button (widens the rail on desktop / opens the
   full menu on phones & tablets), logo, a page search, and account controls. Phones also
   get an always-visible bottom bar. */
export default function DashboardTopNav() {
  const { therapistInfo, fetchTherapistInfo, setNotificationCount } = useTherapistStore();
  const router = useRouter();
  const pathname = router.pathname;
  const [profileOpen, setProfileOpen] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [wide, setWide] = useState(false);
  const [q, setQ] = useState("");
  const [qOpen, setQOpen] = useState(false);
  const [mSearch, setMSearch] = useState(false); // phones: search opens over the bar
  const [qIdx, setQIdx] = useState(0);
  const profileRef = useRef(null);
  const searchRef = useRef(null);
  const closeTimer = useRef(null);
  const prevBookingsCount = useRef(null);
  const badges = useNavBadges();
  const { fetchInbox, fetchReviewsCount, markReviewsSeen } = useCommsStore();

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
  useEffect(() => { setDrawer(false); setProfileOpen(false); setQOpen(false); setQ(""); setMSearch(false); }, [pathname]);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") { setDrawer(false); setProfileOpen(false); setQOpen(false); setMSearch(false); }
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
        const res = await fetchBookingsShared(20000);
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

  // messages from the CYT team + new reviews (menu badges)
  useEffect(() => {
    fetchInbox();
    fetchReviewsCount();
    const a = setInterval(() => { if (!document.hidden) fetchInbox(); }, 60000);
    const b = setInterval(() => { if (!document.hidden) fetchReviewsCount(); }, 300000);
    return () => { clearInterval(a); clearInterval(b); };
  }, [fetchInbox, fetchReviewsCount]);
  const reviewsTotal = useCommsStore((st) => st.reviewsTotal);
  useEffect(() => { if (pathname === "/therapists/reviews") markReviewsSeen(); }, [pathname, reviewsTotal, markReviewsSeen]);

  const handleLogout = () => { removeToken(); router.push("/login"); };

  const name = therapistInfo?.user?.name || "Therapist";
  const avatarSrc = therapistInfo?.user?.profile ? `${imagePath}/${therapistInfo.user.profile}` : defaultProfile;
  const publicProfile = therapistInfo?._id ? `/view-profile/${therapistInfo._id}` : null;
  const listing = listingOf(therapistInfo);
  const verified = !!therapistInfo?.user?.name; // every therapist on the portal shows the tick
  const pct = therapistInfo?.user?.email ? profilePct(therapistInfo) : null;
  const bellCount = (badges.bookings || 0) + (badges.inbox || 0);
  const moreCount = (badges.inbox || 0) + (badges.reviews || 0);

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
      <style dangerouslySetInnerHTML={{ __html: TN_CSS + NX_CSS }} />

      <header className={`tn-bar${mSearch ? " msearch" : ""}`}>
        <button type="button" className="tn-menu-btn" onClick={onMenu} aria-label="Menu" title="Menu">
          {wide ? <MenuOpenRoundedIcon /> : <MenuRoundedIcon />}
        </button>

        {/* who's signed in — name, what they are, and whether the profile is live */}
        <div ref={profileRef} className="tn-prof" onMouseEnter={openProfile} onMouseLeave={closeProfileSoon}>
          <button type="button" className="tn-who" aria-haspopup="menu" aria-expanded={profileOpen} title="Your profile"
            onClick={() => { clearTimeout(closeTimer.current); setProfileOpen((o) => !o); }}>
            <img src={avatarSrc} alt="" className="tn-who-av" onError={(e) => { e.target.onerror = null; e.target.src = defaultProfile; }} />
            <span className="tn-who-txt">
              <b>
                <span className="tn-who-name">{therapistInfo?.user?.name || "Therapist Portal"}</span>
                {verified && <VerifiedRoundedIcon className="tn-who-tick" titleAccess="Verified therapist" />}
              </b>
              <span>
                {therapistInfo?.profile_type && <em className="tn-who-type">{therapistInfo.profile_type}</em>}
                {listing && <i className={`tn-who-st ${listing.tone}`}>{listing.label}</i>}
              </span>
              <small className="tn-who-brand">www.chooseyourtherapist.in</small>
            </span>
          </button>
          {profileOpen && (
            <div className="tn-prof-dd" role="menu" onClick={() => setProfileOpen(false)}>
              {publicProfile && <a href={publicProfile} target="_blank" rel="noopener noreferrer"><OpenInNewRoundedIcon /> View public profile</a>}
              <Link href="/settings"><PersonRoundedIcon /> Edit profile</Link>
              <button type="button" onClick={handleLogout} className="logout-btn"><LogoutRoundedIcon /> Log out</button>
            </div>
          )}
        </div>

        <div className="tn-search" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setQOpen(false); }}>
          <SearchRoundedIcon />
          <input ref={searchRef} type="search" value={q} placeholder="Search pages…"
            aria-label="Search pages" onFocus={() => { setQOpen(true); setQIdx(0); }}
            onChange={(e) => { setQ(e.target.value); setQIdx(0); setQOpen(true); }} onKeyDown={onSearchKey} />
          <kbd>Ctrl K</kbd>
          <button type="button" className="tn-search-x" onClick={() => { setMSearch(false); setQOpen(false); setQ(""); }} aria-label="Close search"><CloseRoundedIcon /></button>
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
          <button type="button" className="tn-icon-btn tn-search-ic" onClick={() => { setMSearch(true); setTimeout(() => searchRef.current?.focus(), 30); }} aria-label="Search pages" title="Search">
            <SearchRoundedIcon />
          </button>
          <a href="https://www.chooseyourtherapist.in" target="_blank" rel="noopener noreferrer" className="tn-icon-btn tn-hide-sm" title="Go to website" aria-label="Go to website">
            <LanguageRoundedIcon />
          </a>
          <Link href="/therapists/notifications" className="tn-icon-btn" onClick={() => setNotificationCount(0)} title="Notifications" aria-label={`Notifications${bellCount ? ` (${bellCount} new)` : ""}`}>
            <NotificationsActiveRoundedIcon />
            {bellCount > 0 && <span className="tn-notif-dot">{bellCount > 99 ? "99+" : bellCount}</span>}
          </Link>

          <Link href="/therapist-dashboard" className="tn-logo" title="Choose Your Therapist — dashboard" aria-label="Dashboard">
            <img src={logo1} alt="Choose Your Therapist" width={32} height={32} />
          </Link>
        </div>
      </header>

      {/* full menu (phones / tablets) */}
      {drawer && (
        <div className="tn-drawer-wrap" onClick={(e) => { if (e.target === e.currentTarget) setDrawer(false); }}>
          <aside className="tn-drawer" role="dialog" aria-modal="true" aria-label="Menu">
            <span className="tn-sheet-grip" aria-hidden="true" />
            <div className="tn-drawer-head">
              <img src={avatarSrc} alt="" onError={(e) => { e.target.onerror = null; e.target.src = defaultProfile; }} />
              <div>
                <b>{name}</b>
                {listing ? <span className={`nx-tone ${listing.tone}`}>{listing.label}</span> : <span>Therapist</span>}
              </div>
              <button type="button" onClick={() => setDrawer(false)} aria-label="Close menu"><CloseRoundedIcon /></button>
            </div>
            {pct !== null && pct < 100 && (
              <Link href="/settings" className="tn-drawer-pct">
                <span>Your profile isn&apos;t complete</span><i><b style={{ width: `${pct}%` }} /></i><em>Finish →</em>
              </Link>
            )}
            <nav>
              {NAV_GROUPS.map((g) => (
                <div key={g.title} className="tn-drawer-group">
                  <span>{g.title}</span>
                  {g.items.map((item) => (
                    <Link key={item.to} href={item.to} className={isActive(item, pathname) ? "on" : ""} onClick={() => item.badgeKey === "bookings" && setNotificationCount(0)}>
                      <span className="tn-dr-ic"><item.Icon /><NavBadge value={badges[item.badgeKey]} className="tn-dr-badge" /></span>
                      <span className="tn-dr-lbl">{item.label}</span>
                    </Link>
                  ))}
                </div>
              ))}
            </nav>
            <div className="tn-drawer-foot">
              {publicProfile && <a href={publicProfile} target="_blank" rel="noopener noreferrer"><OpenInNewRoundedIcon /> Profile</a>}
              {publicProfile && <button type="button" className="share" onClick={() => shareProfile(therapistInfo)}><IosShareRoundedIcon /> Share</button>}
              <button type="button" className="out" onClick={handleLogout}><LogoutRoundedIcon /> Log out</button>
            </div>
          </aside>
        </div>
      )}

      {/* phones: always-visible bottom bar */}
      <nav className="tn-mob-nav" aria-label="Quick menu">
        {MOB_NAV.map((item) => (
          <Link key={item.to} href={item.to} className={`tn-mob-item${isActive(item, pathname) ? " active" : ""}`}
            onClick={() => item.badgeKey === "bookings" && setNotificationCount(0)}>
            <NavBadge value={badges[item.badgeKey]} className="tn-mob-badge" />
            <span className="tn-mob-ico"><item.Icon /></span>
            {item.label}
          </Link>
        ))}
        <button type="button" className={`tn-mob-item${drawer ? " active" : ""}`} onClick={() => setDrawer(true)}>
          <NavBadge value={moreCount} className="tn-mob-badge" />
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
.tn-menu-btn { width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0; background: #f6f8f7; border: 1px solid #e4ece7; cursor: pointer; display: grid; place-items: center; color: #334155; transition: background .14s, color .14s, border-color .14s; }
.tn-menu-btn:hover { background: #e7f6ec; border-color: #c6e6d1; color: #166534; }
.tn-menu-btn svg { font-size: 22px; }
.tn-logo { display: flex; align-items: center; text-decoration: none !important; flex-shrink: 0; }
.tn-logo img { width: 32px; height: 32px; object-fit: contain; display: block; }
.tn-prof { position: relative; height: 100%; display: flex; align-items: center; min-width: 0; flex: 0 1 auto; }
.tn-who { display: flex; align-items: center; gap: 10px; min-width: 0; max-width: 340px; padding: 4px 10px 4px 4px; border: 0; background: none;
  border-radius: 12px; cursor: pointer; text-align: left; font-family: inherit; transition: background .14s; }
.tn-who:hover, .tn-who[aria-expanded="true"] { background: #f6f8f7; }
.tn-who-av { width: 40px; height: 40px; border-radius: 12px; object-fit: cover; flex-shrink: 0; box-shadow: 0 0 0 1px #e4ece7; background: #f1f5f3; }
.tn-who-txt { display: flex; flex-direction: column; justify-content: center; gap: 1px; min-width: 0; }
.tn-who-txt > b { display: flex; align-items: center; gap: 4px; min-width: 0; font-size: 14px; font-weight: 800; color: #0f172a; line-height: 1.2; }
.tn-who-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
.tn-who-tick { font-size: 16px !important; color: #16a34a; flex-shrink: 0; }
.tn-who-txt > span { display: flex; align-items: center; gap: 6px; min-width: 0; line-height: 1.2; }
.tn-who-type { font-style: normal; font-size: 11px; font-weight: 400; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
.tn-who-type + .tn-who-st::before { content: "·"; color: #cbd5e1; margin-right: 6px; }
.tn-who-st { font-style: normal; font-size: 11px; font-weight: 500; white-space: nowrap; flex-shrink: 0; }
.tn-who-st.ok { color: #15803d; } .tn-who-st.warn { color: #b45309; } .tn-who-st.off { color: #b91c1c; }
.tn-who-brand { font-size: 9px; font-weight: 400; letter-spacing: .3px; color: #94a3b8; line-height: 1.1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tn-logo { margin-left: 6px; padding-left: 10px; border-left: 1px solid #e4ece7; height: 32px; }
.tn-search-ic, .tn-search-x { display: none !important; }
.tn-prof-name, .tn-prof-chevron { display: none; }
.tn-title-text { font-size: 15px; font-weight: 800; color: #0f172a; white-space: nowrap; }

.tn-search { position: relative; flex: 1; min-width: 0; max-width: 460px; height: 40px; margin-left: 12px; background: #f1f5f3; border: 1px solid transparent; border-radius: 11px; display: flex; align-items: center; gap: 8px; padding: 0 10px 0 12px; color: #94a3b8; transition: border-color .14s, background .14s; }
.tn-search:focus-within { background: #fff; border-color: #a7d7b8; box-shadow: 0 0 0 3px rgba(22,101,52,.08); }
.tn-search svg { font-size: 19px; flex-shrink: 0; }
.tn-search input { flex: 1; min-width: 0; height: 100%; border: 0; outline: none; background: transparent; font-size: 14px; color: #0f172a; font-family: inherit; }
.tn-search input::placeholder { color: #94a3b8; }
.tn-search kbd { font-weight: 700; font-size: 10.5px; font-family: inherit; color: #94a3b8; background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 2px 6px; white-space: nowrap; }
.tn-search-dd { position: absolute; top: calc(100% + 6px); left: 0; right: 0; background: #fff; border: 1px solid #e4ece7; border-radius: 12px; box-shadow: 0 18px 44px rgba(15,23,42,.14); padding: 6px; max-height: 60vh; overflow-y: auto; z-index: 1300; }
.tn-search-dd button { display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 10px; border: 0; background: none; border-radius: 9px; text-align: left; font-weight: 600; font-size: 14px; font-family: inherit; color: #334155; cursor: pointer; }
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
.tn-prof-dd { position: absolute; top: calc(100% - 4px); left: 0; background: #fff; border: 1px solid #e4ece7; border-radius: 14px; min-width: 240px; z-index: 1300; box-shadow: 0 18px 44px rgba(15,23,42,.16); padding: 6px; animation: tnDdIn .14s ease both; }
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
.tn-drawer-head .nx-tone { margin-top: 3px; }
.tn-sheet-grip { display: none; }
.tn-drawer-pct { display: flex; align-items: center; gap: 10px; margin: 10px 14px 2px; padding: 10px 12px; border-radius: 12px; background: #fffbeb; border: 1px solid #fde68a; text-decoration: none !important; color: #92400e; font-size: 12.5px; font-weight: 700; }
.tn-drawer-pct span { white-space: nowrap; }
.tn-drawer-pct i { flex: 1; height: 6px; border-radius: 6px; background: #fde68a; overflow: hidden; }
.tn-drawer-pct i b { display: block; height: 100%; background: #d97706; border-radius: 6px; }
.tn-drawer-pct em { font-style: normal; white-space: nowrap; }
.tn-dr-ic { position: relative; display: inline-flex; }
.tn-dr-lbl { flex: 1; min-width: 0; }
.tn-drawer-group a .tn-dr-badge.nx-badge { position: absolute; top: -7px; right: -10px; min-width: 17px; height: 17px; font-size: 9.5px; padding: 0 4px; border: 2px solid #fff; }
.tn-drawer-group a .tn-dr-badge.nx-dot { position: absolute; top: -2px; right: -3px; }
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
.tn-drawer-foot a, .tn-drawer-foot button { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 44px; border-radius: 12px; border: 1.5px solid #e2e8f0; background: #fff; color: #334155; font-weight: 700; font-size: 13.5px; font-family: inherit; text-decoration: none !important; cursor: pointer; }
.tn-drawer-foot button.out { color: #dc2626; border-color: #fecaca; }
.tn-drawer-foot button.share { color: #166534; border-color: #cfe3d6; }
.tn-drawer-foot svg { font-size: 18px; }

/* phones: the menu is a bottom sheet with a grid of tiles */
@media (max-width: 767px) {
  .tn-drawer { top: auto; right: 0; width: 100%; max-height: 88vh; border-radius: 22px 22px 0 0; padding-top: 0;
    animation: tnSheet .26s cubic-bezier(.2,.9,.3,1); box-shadow: 0 -20px 50px -20px rgba(0,0,0,.35); }
  @keyframes tnSheet { from { transform: translateY(100%); } to { transform: none; } }
  .tn-sheet-grip { display: block; width: 42px; height: 5px; border-radius: 5px; background: #d6dfda; margin: 8px auto 0; }
  .tn-drawer-head { padding: 10px 16px 12px; }
  /* one compact launcher grid: every item, four per row, no half-empty group rows */
  .tn-drawer nav { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px 6px; padding: 14px 12px 16px; align-content: start; }
  .tn-drawer-group { display: contents; }
  .tn-drawer-group > span { display: none; }
  .tn-drawer-group a { height: auto; flex-direction: column; justify-content: flex-start; align-items: center; gap: 6px; padding: 0; border-radius: 0;
    background: none; font-size: 11.5px; font-weight: 700; color: #334155; text-align: center; line-height: 1.25; }
  .tn-dr-ic { width: 52px; height: 52px; border-radius: 16px; background: #f1f6f3; display: grid; place-items: center; transition: background .15s; }
  .tn-drawer-group a svg { font-size: 24px; color: #166534; }
  .tn-drawer-group a.on { background: none; color: #166534; }
  .tn-drawer-group a.on .tn-dr-ic { background: #dff3e6; box-shadow: inset 0 0 0 1.5px #a7d7b8; }
  .tn-drawer-group a:active .tn-dr-ic { background: #e7f6ec; }
  .tn-dr-lbl { flex: 0 0 auto; max-width: 100%; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .tn-drawer-group a .tn-dr-badge.nx-badge { top: -5px; right: -6px; }
  .tn-drawer-group a .tn-dr-badge.nx-dot { top: 2px; right: 2px; }
  .tn-drawer-pct { margin: 10px 14px 0; }
  .tn-drawer-foot { padding: 10px 14px calc(10px + env(safe-area-inset-bottom, 0px)); }
  .tn-drawer-foot a, .tn-drawer-foot button { height: 42px; font-size: 13px; }
}

.tn-mob-nav { display: none; }
@media (max-width: 1023px) {
  .tn-search kbd { display: none; }
}
@media (max-width: 767px) {
  .tn-bar { gap: 6px; padding: 0 8px; }
  .tn-title-text, .tn-prof-name, .tn-prof-chevron, .tn-hide-sm { display: none; }
  .tn-search { display: none; }
  .tn-bar.msearch .tn-search { display: flex; position: absolute; left: 8px; right: 8px; top: 8px; height: 40px; margin: 0; max-width: none; z-index: 3; background: #fff; border-color: #a7d7b8; box-shadow: 0 0 0 3px rgba(22,101,52,.08); }
  .tn-bar.msearch .tn-search-x { display: grid !important; place-items: center; width: 32px; height: 32px; border: 0; background: #f1f5f3; border-radius: 9px; color: #334155; cursor: pointer; flex-shrink: 0; }
  .tn-bar.msearch .tn-search-x svg { font-size: 18px; }
  .tn-search-ic { display: grid !important; }
  .tn-prof { flex: 1; }
  .tn-who { flex: 1; max-width: none; gap: 8px; padding: 2px 4px 2px 2px; }
  .tn-who-av { width: 36px; height: 36px; border-radius: 11px; }
  .tn-who-txt > b { font-size: 13.5px; }
  .tn-who-st { display: none; }
  .tn-logo { margin-left: 2px; padding-left: 6px; }
  .tn-logo img { width: 28px; height: 28px; }
  .tn-menu-btn { width: 38px; height: 38px; }
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
  .tn-mob-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; text-decoration: none !important; color: #64748b; font-weight: 700; font-size: 10.5px; font-family: inherit; padding: 4px 0; position: relative; border: 0; background: none; cursor: pointer; }
  .tn-mob-ico { width: 52px; height: 30px; border-radius: 999px; display: grid; place-items: center; transition: background .18s; }
  .tn-mob-ico svg { font-size: 23px; }
  .tn-mob-item.active { color: #166534; }
  .tn-mob-item.active .tn-mob-ico { background: #166534; box-shadow: 0 4px 12px -4px rgba(22,101,52,.55); }
  .tn-mob-item.active .tn-mob-ico svg { color: #fff; }
  .tn-mob-badge { position: absolute; top: 0; right: calc(50% - 26px); background: #ef4444; color: #fff; border-radius: 8px; padding: 1px 5px; font-size: 9.5px; font-weight: 800; border: 2px solid #fff; z-index: 1; }
  .tn-mob-item .tn-mob-badge.nx-badge { margin: 0; height: auto; min-width: 0; line-height: 1.3; }
  .tn-mob-item .tn-mob-badge.nx-dot { width: 11px; height: 11px; padding: 0; top: 3px; right: calc(50% - 20px); background: #f59e0b; border: 2px solid #fff; box-shadow: none; }
}
@media (prefers-reduced-motion: reduce) { .tn-drawer, .tn-drawer-wrap, .tn-prof-dd { animation: none; } }

/* -- brand green top bar -- */
.tn-bar.tn-bar { background: linear-gradient(90deg, #0b3320 0%, #14532d 55%, #166534 100%); border-bottom: 0; box-shadow: 0 6px 18px -10px rgba(4,30,16,.55); }
.tn-bar .tn-menu-btn { background: rgba(255,255,255,.12); border-color: rgba(255,255,255,.22); color: #fff; }
.tn-bar .tn-menu-btn:hover { background: rgba(255,255,255,.2); border-color: rgba(255,255,255,.35); color: #fff; }
.tn-bar .tn-who:hover, .tn-bar .tn-who[aria-expanded="true"] { background: rgba(255,255,255,.1); }
.tn-bar .tn-who-av { box-shadow: 0 0 0 2px rgba(255,255,255,.85); }
.tn-bar .tn-who-txt > b { color: #fff; }
.tn-bar .tn-who-tick { color: #4ade80; }
.tn-bar .tn-who-type { color: #bbf7d0; }
.tn-bar .tn-who-type + .tn-who-st::before { color: rgba(255,255,255,.35); }
.tn-bar .tn-who-st.ok { color: #86efac; } .tn-bar .tn-who-st.warn { color: #fcd34d; } .tn-bar .tn-who-st.off { color: #fca5a5; }
.tn-bar .tn-who-brand { color: rgba(255,255,255,.62); }
.tn-bar .tn-search { background: #fff; color: #64748b; border-color: #fff; box-shadow: 0 2px 8px -4px rgba(0,0,0,.35); }
.tn-bar .tn-search input { color: #0f172a; }
.tn-bar .tn-search input::placeholder { color: #94a3b8; }
.tn-bar .tn-search:focus-within { border-color: #a7d7b8; box-shadow: 0 0 0 3px rgba(255,255,255,.25); }
/* desktop + iPad: search sits on the right, next to the icons */
@media (min-width: 768px) {
  .tn-bar .tn-search { margin-left: auto; flex: 0 1 360px; }
  .tn-bar .tn-right { margin-left: 0; }
}
@media (min-width: 768px) and (max-width: 1023px) { .tn-bar .tn-search { flex-basis: 220px; } }
.tn-bar .tn-icon-btn { color: rgba(255,255,255,.9); }
.tn-bar .tn-icon-btn:hover { background: rgba(255,255,255,.14); color: #fff; }
.tn-bar .tn-notif-dot { border-color: #14532d; }
.tn-bar .tn-logo { border-left-color: rgba(255,255,255,.22); }
.tn-bar .tn-logo img { background: #fff; border-radius: 10px; padding: 3px; box-sizing: border-box; }
`;
