import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import useTherapistStore from "../../store/therapistStore";
import { removeToken } from "../../utils/jwt";
import { defaultProfile, imagePath } from "../../utils/url";
import { fetchBookingsShared } from "../../utils/bookings-shared";
import { drawerGroupsFor, NAV_ITEMS, isActive } from "./side-nav";
import useCommsStore from "../../store/commsStore";
import NewBookingPopup from "./new-booking-popup";
import NotifBell from "./notif-bell";
import { useNavBadges, NavBadge, NavTag, useAssessmentsUpgrade, useOwnedUpgrades, listingOf, shareProfile, NX_CSS } from "./nav-extras";
import { profilePct } from "../../utils/profile-checks";
import IosShareRoundedIcon from "@mui/icons-material/IosShareRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";

import MonitorHeartRoundedIcon from "@mui/icons-material/MonitorHeartRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import MenuOpenRoundedIcon from "@mui/icons-material/MenuOpenRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import MonitorHeartOutlinedIcon from "@mui/icons-material/MonitorHeartOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

const WIDE_KEY = "cyt_tsn_wide";
// phones + touch tablets get the app shell (bottom bar, tile menu, no side rail) — same query in side-nav / main-layout CSS
export const TOUCH_SHELL = "(max-width: 767px), (min-width: 768px) and (max-width: 1400px) and (hover: none) and (pointer: coarse)";
const TILES_PER_PAGE = 12;

// phones: four favourites + "More" (opens the full menu)
const MOB_NAV = [
  { to: "/therapist-dashboard", Icon: MonitorHeartRoundedIcon, Off: MonitorHeartOutlinedIcon, label: "Home" },
  { to: "/appointments", Icon: EventAvailableRoundedIcon, Off: EventAvailableOutlinedIcon, label: "Sessions", badgeKey: "bookings" },
  { to: "/my-schedule", Icon: CalendarMonthRoundedIcon, Off: CalendarMonthOutlinedIcon, label: "Schedule" },
  { to: "/settings", Icon: ManageAccountsRoundedIcon, Off: ManageAccountsOutlinedIcon, label: "Settings", badgeKey: "settings" },
];

// iPhone-style "opening an app": the next page grows out of the tapped icon (bottom bar / menu tiles).
// Leaves the icon's centre (relative to the page body) for the shell, which gives the NEW page .ts-zoom as it
// mounts (main-layout.js) — so the zoom starts exactly when it appears and the old page never moves.
function openFromIcon(e) {
  if (typeof window === "undefined" || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  const el = e?.currentTarget;
  const page = document.querySelector(".ts-page");
  if (!el || !page) return;
  const r = el.getBoundingClientRect();
  const pr = page.getBoundingClientRect();
  window.__tsOpen = { ox: Math.round(r.left + r.width / 2 - pr.left), oy: Math.round(r.top + r.height / 2 - pr.top), at: Date.now() };
}

function AppClock() {
  const [now, setNow] = useState(null);
  useEffect(() => { setNow(new Date()); const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  if (!now) return null;
  const pad = (n) => String(n).padStart(2, "0");
  return (
    <span className="tn-clock" aria-label={now.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}>
      <b className="h">{pad(now.getHours() % 12 || 12)}</b><i>:</i><b className="m">{pad(now.getMinutes())}</b><small>{now.getHours() < 12 ? "AM" : "PM"}</small>
    </span>
  );
}

/* Top bar for the therapist portal: menu button (widens the rail on desktop / opens the
   full menu on phones & tablets), logo, a page search, and account controls. Phones also
   get an always-visible bottom bar. */
export default function DashboardTopNav() {
  const { therapistInfo, fetchTherapistInfo, setNotificationCount } = useTherapistStore();
  const router = useRouter();
  const pathname = router.pathname;
  const [profileOpen, setProfileOpen] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [menuPage, setMenuPage] = useState(0); // phones: which page of the tile menu is showing
  const pagesRef = useRef(null);
  const [barHidden, setBarHidden] = useState(false); // phone bar: slides away while scrolling down
  const [wide, setWide] = useState(false);
  const [q, setQ] = useState("");
  const [qOpen, setQOpen] = useState(false);
  const [mSearch, setMSearch] = useState(false); // phones: search opens over the bar
  const [qIdx, setQIdx] = useState(0);
  const profileRef = useRef(null);
  const searchRef = useRef(null);
  const closeTimer = useRef(null);
  const badges = useNavBadges();
  const upgrade = useAssessmentsUpgrade();
  const drawerGroups = drawerGroupsFor(useOwnedUpgrades()); // bought upgrades sit in their normal group
  const { fetchInbox, fetchReviewsCount, markReviewsSeen } = useCommsStore();

  const openProfile = () => { clearTimeout(closeTimer.current); setProfileOpen(true); };
  const closeProfileSoon = () => { clearTimeout(closeTimer.current); closeTimer.current = setTimeout(() => setProfileOpen(false), 250); };

  // remembered rail width (desktop). _document.js already set data-tsn-wide before first paint, so this only
  // reads it back — it never removes and re-adds it on a page change (that made the rail close and re-open
  // on every navigation). Only portal CSS reads the attribute, so it can stay on outside the portal too.
  useEffect(() => {
    let on = document.documentElement.hasAttribute("data-tsn-wide");
    try { on = localStorage.getItem(WIDE_KEY) === "1"; } catch (e) { /* storage blocked: keep the attribute */ }
    setWide(on);
  }, []);
  const animTimer = useRef(null);
  const toggleWide = () => {
    const next = !document.documentElement.hasAttribute("data-tsn-wide");
    // slide only when the therapist presses the button, never on load or navigation
    const html = document.documentElement;
    html.classList.add("tsn-anim");
    clearTimeout(animTimer.current);
    animTimer.current = setTimeout(() => html.classList.remove("tsn-anim"), 320);
    if (next) html.setAttribute("data-tsn-wide", ""); else html.removeAttribute("data-tsn-wide");
    try { localStorage.setItem(WIDE_KEY, next ? "1" : "0"); } catch (e) { /* ignore */ }
    setWide(next);
  };

  const onMenu = () => {
    // phones and touch tablets (iPad) use the app-style tile menu; desktop widens the rail
    if (window.matchMedia(TOUCH_SHELL).matches) setDrawer(true);
    else if (window.matchMedia("(min-width: 1024px)").matches) toggleWide();
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
  // phone bar: down hides it, up brings it back, and it's always there at the top and the end of a page
  useEffect(() => {
    let last = window.scrollY;
    let queued = false;
    const check = () => {
      queued = false;
      const y = window.scrollY;
      const atEdge = y < 80 || y + window.innerHeight >= document.documentElement.scrollHeight - 40;
      if (Math.abs(y - last) < 12 && !atEdge) return; // small movements add up until they're a real scroll
      setBarHidden(!atEdge && y > last);
      last = y;
    };
    const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(check); } };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => { setBarHidden(false); }, [pathname]);

  // new-booking alert on every portal page. Known booking ids are kept for the browser tab,
  // so moving between pages doesn't miss (or repeat) an alert.
  const [popup, setPopup] = useState([]);
  useEffect(() => {
    const KEY = "cyt_known_booking_ids";
    // force: skip the shared 15s cache (the live stream just said a booking came in)
    const check = async (force) => {
      if (document.hidden) return;
      try {
        const res = await fetchBookingsShared(force === true ? 0 : 15000);
        if (!res?.status || !Array.isArray(res.data)) return;
        let known = null;
        try { known = JSON.parse(sessionStorage.getItem(KEY) || "null"); } catch (e) { /* storage blocked */ }
        const ids = res.data.map((b) => b._id);
        if (Array.isArray(known)) {
          const seen = new Set(known);
          const fresh = res.data.filter((b) => !seen.has(b._id));
          if (fresh.length) {
            setNotificationCount((useTherapistStore.getState?.().notificationCount || 0) + fresh.length);
            setPopup(fresh);
            window.dispatchEvent(new CustomEvent("cyt:new-booking", { detail: { count: fresh.length } }));
          }
        }
        try { sessionStorage.setItem(KEY, JSON.stringify(ids)); } catch (e) { /* ignore */ }
      } catch (err) {
        console.error("booking poll error:", err);
      }
    };
    check();
    const id = setInterval(check, 20000);
    const onVisible = () => { if (!document.hidden) check(); };
    document.addEventListener("visibilitychange", onVisible);
    // the live notification stream saw a new booking → show it now, not at the next poll
    const onLive = () => check(true);
    window.addEventListener("cyt:check-bookings", onLive);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", onVisible); window.removeEventListener("cyt:check-bookings", onLive); };
  }, [setNotificationCount]);
  const closePopup = useCallback(() => setPopup([]), []);

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

  const pageItem = NAV_ITEMS.find((i) => isActive(i, pathname));
  const pageTitle = pathname === "/therapist-dashboard" ? "Home" : (pageItem?.label || "Dashboard");
  const barTos = new Set(MOB_NAV.map((m) => m.to));
  const sheetTiles = [
    ...drawerGroups.flatMap((g) => g.items.filter((i) => !barTos.has(i.to)).map((i) => ({ ...i, up: !!g.upgrade }))),
    ...(publicProfile ? [
      { label: "My profile", Icon: OpenInNewRoundedIcon, href: publicProfile },
      { label: "Share profile", Icon: IosShareRoundedIcon, onClick: () => shareProfile(therapistInfo) },
    ] : []),
    { label: "Website", Icon: LanguageRoundedIcon, href: "/" },
    { label: "Log out", Icon: LogoutRoundedIcon, onClick: handleLogout, out: true },
  ];
  const sheetPages = Array.from({ length: Math.ceil(sheetTiles.length / TILES_PER_PAGE) }, (_, i) => sheetTiles.slice(i * TILES_PER_PAGE, (i + 1) * TILES_PER_PAGE));
  const mobOn = drawer ? MOB_NAV.length : MOB_NAV.findIndex((i) => isActive(i, pathname));
  // the sheet opens on the page holding the current screen
  useEffect(() => {
    if (!drawer) return;
    const page = Math.max(0, Math.floor(sheetTiles.findIndex((t) => t.to && isActive(t, pathname)) / TILES_PER_PAGE));
    if (pagesRef.current) pagesRef.current.scrollLeft = page * pagesRef.current.clientWidth;
    setMenuPage(page);
  }, [drawer]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: TN_CSS + NX_CSS }} />

      <header className={`tn-bar${mSearch ? " msearch" : ""}`}>
        <button type="button" className="tn-menu-btn" onClick={onMenu} aria-label="Menu" title="Menu">
          {wide ? <MenuOpenRoundedIcon /> : <MenuRoundedIcon />}
        </button>
        {/* phones / iPad: the page's name, like an app (the profile chip moves to the right as an avatar) */}
        <span className="tn-app-title">{pageTitle}</span>
        <a href="https://www.chooseyourtherapist.in" target="_blank" rel="noopener noreferrer" className="tn-app-site">WWW.CHOOSEYOURTHERAPIST.IN</a>

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
          <AppClock />
          <button type="button" className="tn-icon-btn tn-refresh" aria-label="Refresh" title="Refresh" onClick={(e) => {
            const b = e.currentTarget; b.classList.add("spin"); setTimeout(() => window.location.reload(), 200);
          }}><RefreshRoundedIcon /></button>
          <button type="button" className="tn-icon-btn tn-search-ic" onClick={() => { setMSearch(true); setTimeout(() => searchRef.current?.focus(), 30); }} aria-label="Search pages" title="Search">
            <SearchRoundedIcon />
          </button>
          <a href="https://www.chooseyourtherapist.in" target="_blank" rel="noopener noreferrer" className="tn-icon-btn tn-hide-sm" title="Go to website" aria-label="Go to website">
            <LanguageRoundedIcon />
          </a>
          <NotifBell fallbackCount={bellCount} onOpenBell={() => setNotificationCount(0)} />

        </div>
      </header>

      {/* new booking — on every page except Appointments, which has its own alert */}
      {pathname !== "/appointments" && <NewBookingPopup items={popup} onClose={closePopup} />}

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
            {/* phones: tiles in the sidebar's order, minus what the bottom bar already has, eight to a page that
                slide sideways; Upgrade tiles are gold, and the account actions come last */}
            <div className="tn-pages-wrap">
              <div className="tn-pages" ref={pagesRef} onScroll={(e) => setMenuPage(Math.round(e.currentTarget.scrollLeft / Math.max(1, e.currentTarget.clientWidth)))}>
                {sheetPages.map((items, pi) => (
                  <div key={pi} className="tn-drawer-group tn-page">
                    {items.map((item) => {
                      const body = (
                        <>
                          <span className="tn-dr-ic"><item.Icon /><NavBadge value={badges[item.badgeKey]} className="tn-dr-badge" /></span>
                          <span className="tn-dr-lbl">{item.label}<NavTag item={item} upgrade={upgrade} className="tn-dr-tag" /></span>
                        </>
                      );
                      if (item.onClick) return <button key={item.label} type="button" className={item.out ? "out" : ""} onClick={item.onClick}>{body}</button>;
                      if (item.href) return <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer">{body}</a>;
                      return <Link key={item.to} href={item.to} className={`${isActive(item, pathname) ? "on" : ""}${item.up ? " up" : ""}`} onClick={(e) => { if (!isActive(item, pathname)) openFromIcon(e); if (item.badgeKey === "bookings") setNotificationCount(0); setDrawer(false); }}>{body}</Link>;
                    })}
                  </div>
                ))}
              </div>
              {sheetPages.length > 1 && (
                <div className="tn-dots" role="tablist" aria-label="Menu pages">
                  {sheetPages.map((_, i) => (
                    <button key={i} type="button" role="tab" className={i === menuPage ? "on" : ""} aria-label={`Page ${i + 1}`} aria-selected={i === menuPage}
                      onClick={() => pagesRef.current?.scrollTo({ left: i * pagesRef.current.clientWidth, behavior: "smooth" })} />
                  ))}
                </div>
              )}
            </div>
            <nav>
              {drawerGroups.map((g) => (
                <div key={g.title} className={`tn-drawer-group${g.upgrade ? " up" : ""}`}>
                  <span>{g.upgrade ? "✦ " : ""}{g.title}</span>
                  {g.items.map((item) => (
                    <Link key={item.to} href={item.to} className={isActive(item, pathname) ? "on" : ""} onClick={() => { if (item.badgeKey === "bookings") setNotificationCount(0); setDrawer(false); }}>
                      <span className="tn-dr-ic"><item.Icon /><NavBadge value={badges[item.badgeKey]} className="tn-dr-badge" /></span>
                      <span className="tn-dr-lbl">{item.label}<NavTag item={item} upgrade={upgrade} className="tn-dr-tag" /></span>
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

      {/* phones: the bottom bar, which slides away while scrolling down */}
      <nav className={`tn-mob-nav${barHidden && !drawer ? " away" : ""}`} aria-label="Quick menu" style={{ "--n": MOB_NAV.length + 1, "--i": mobOn }} onFocus={() => setBarHidden(false)}>
        {mobOn >= 0 && <span className="tn-mob-line" aria-hidden="true" />}
        {MOB_NAV.map((item) => {
          const on = isActive(item, pathname);
          return (
            <Link key={item.to} href={item.to} data-k={item.label.toLowerCase()} className={`tn-mob-item${on ? " active" : ""}`} aria-current={on ? "page" : undefined}
              onClick={(e) => { if (!on) openFromIcon(e); if (item.badgeKey === "bookings") setNotificationCount(0); }}>
              <NavBadge value={badges[item.badgeKey]} className="tn-mob-badge" />
              <span className="tn-mob-ico">{on ? <item.Icon /> : <item.Off />}</span>
              {item.label}
            </Link>
          );
        })}
        {sheetTiles.filter((t) => t.to).slice(0, 7).map((item, i) => {
          const on = isActive(item, pathname);
          return (
            <Link key={`dx-${item.to}`} href={item.to} data-i={i} className={`tn-mob-item dock-x${on ? " active" : ""}${item.up ? " up" : ""}`} aria-current={on ? "page" : undefined}
              onClick={(e) => { if (!on) openFromIcon(e); }}>
              <NavBadge value={badges[item.badgeKey]} className="tn-mob-badge" />
              <span className="tn-mob-ico"><item.Icon /></span>
              {item.short || item.label}
            </Link>
          );
        })}
        <button type="button" data-k="more" className={`tn-mob-item${drawer ? " active" : ""}`} onClick={() => setDrawer(true)}>
          <NavBadge value={moreCount} className="tn-mob-badge" />
          <span className="tn-mob-ico">{drawer ? <GridViewRoundedIcon /> : <GridViewOutlinedIcon />}</span>
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
.tn-pages-wrap { display: none; }
.tn-drawer-group { display: flex; flex-direction: column; gap: 2px; margin-bottom: 8px; }
.tn-drawer-group > span { font-size: 11px; font-weight: 800; letter-spacing: .6px; text-transform: uppercase; color: #94a3b8; padding: 10px 12px 4px; }
.tn-drawer-group a { display: flex; align-items: center; gap: 12px; height: 46px; padding: 0 12px; border-radius: 12px; color: #334155; font-size: 15px; font-weight: 700; text-decoration: none !important; }
.tn-drawer-group a svg { font-size: 21px; color: #64748b; }
.tn-drawer-group a.on { background: #e7f6ec; color: #166534; }
.tn-drawer-group a.on svg { color: #166534; }
/* Upgrade group (Assessments, Coupons) in gold, same as the desktop rail */
.tn-drawer-group.up > span { color: #a37a16; }
.tn-drawer-group.up a svg { color: #c9962c; }
.tn-drawer-group.up a.on { background: #fdf6e3; color: #7a5a10; }
.tn-drawer-group.up a.on svg { color: #a37a16; }
.tn-drawer-group a em { margin-left: auto; font-style: normal; background: #ef4444; color: #fff; font-size: 11px; font-weight: 800; border-radius: 9px; padding: 1px 7px; }
.tn-drawer-foot { display: flex; gap: 8px; padding: 12px 14px calc(12px + env(safe-area-inset-bottom, 0px)); border-top: 1px solid #eef2f0; }
.tn-drawer-foot a, .tn-drawer-foot button { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 44px; border-radius: 12px; border: 1.5px solid #e2e8f0; background: #fff; color: #334155; font-weight: 700; font-size: 13.5px; font-family: inherit; text-decoration: none !important; cursor: pointer; }
.tn-drawer-foot button.out { color: #dc2626; border-color: #fecaca; }
.tn-drawer-foot button.share { color: #166534; border-color: #cfe3d6; }
.tn-drawer-foot svg { font-size: 18px; }

/* phones: the menu is a bottom sheet with a grid of tiles */
@media (max-width: 767px), (min-width: 768px) and (max-width: 1400px) and (hover: none) and (pointer: coarse) {
  .tn-drawer { top: auto; right: 0; width: 100%; max-height: 88vh; border-radius: 22px 22px 0 0; padding-top: 0;
    animation: tnSheet .26s cubic-bezier(.2,.9,.3,1); box-shadow: 0 -20px 50px -20px rgba(0,0,0,.35); }
  @keyframes tnSheet { from { transform: translateY(100%); } to { transform: none; } }
  .tn-sheet-grip { display: block; position: absolute; top: 8px; left: 50%; width: 40px; height: 4px; margin-left: -20px; border-radius: 4px; background: rgba(255,255,255,.45); }
  .tn-drawer-head { padding: 18px 14px 10px; border: 0; background: linear-gradient(100deg, #0b3320, #166534); border-radius: 22px 22px 0 0; }
  .tn-drawer-head b { color: #fff; }
  .tn-drawer-head > div > span:not(.nx-tone) { color: #f5c542; }
  .tn-drawer-head button { background: rgba(255,255,255,.14); color: #fff; }
  /* the tile pages replace the grouped list on phones */
  .tn-drawer nav { display: none; }
  .tn-pages-wrap { display: block; padding: 12px 0 calc(8px + env(safe-area-inset-bottom, 0px)); }
  .tn-pages { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; overscroll-behavior-x: contain; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
  .tn-pages::-webkit-scrollbar { display: none; }
  .tn-pages .tn-page { flex: 0 0 100%; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); grid-auto-rows: min-content; gap: 12px 2px; padding: 0 8px; align-content: start; scroll-snap-align: start; scroll-snap-stop: always; margin: 0; }
  .tn-dots { display: flex; justify-content: center; gap: 6px; margin-top: 10px; }
  .tn-dots button { width: 7px; height: 7px; padding: 0; border: 0; border-radius: 7px; background: #d6dfda; cursor: pointer; transition: width .2s ease, background .2s ease; }
  .tn-dots button.on { width: 20px; background: #d4a24c; }
  .tn-drawer-group { display: contents; }
  .tn-drawer-group > span { display: none; }
  .tn-drawer-group a, .tn-drawer-group > button { min-width: 0; height: auto; display: flex; flex-direction: column; justify-content: flex-start; align-items: center; gap: 6px; padding: 2px; border: 0; border-radius: 0;
    background: none; font: inherit; font-size: 12px; font-weight: 700; color: #334155; text-align: center; line-height: 1.2; text-decoration: none !important; cursor: pointer; -webkit-tap-highlight-color: transparent; }
  .tn-dr-ic { width: 50px; height: 50px; border-radius: 16px; background: #f1f6f3; display: grid; place-items: center; transition: background .15s; }
  .tn-drawer-group a svg, .tn-drawer-group > button svg { font-size: 24px; color: #166534; }
  .tn-drawer-group a.on { background: none; color: #166534; font-weight: 800; }
  .tn-drawer-group a.on .tn-dr-ic { background: #e3f4e9; }
  .tn-drawer-group > button.out { color: #dc2626; }
  .tn-drawer-group > button.out .tn-dr-ic { background: #fef2f2; }
  .tn-drawer-group > button.out svg { color: #dc2626; }
  .tn-drawer-group a:active .tn-dr-ic { background: #e7f6ec; }
  /* Upgrade tiles (Assessments, Coupons until bought) in gold, like the sidebar */
  .tn-drawer-group a.up .tn-dr-ic { background: linear-gradient(145deg, #fff8e6, #fbefcc); box-shadow: inset 0 0 0 1px #ecd49a; }
  .tn-drawer-group a.up svg { color: #a37a16; }
  .tn-drawer-group a.up { color: #7a5a10; }
  /* the golden underline draws in from the left when tapped, and stays on the current page */
  .tn-dr-lbl { flex: 0 0 auto; max-width: 100%; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; padding-bottom: 4px;
    background: linear-gradient(#d4a24c, #d4a24c) left bottom / 0 2.5px no-repeat; transition: background-size .22s ease; }
  .tn-drawer-group a.on .tn-dr-lbl, .tn-drawer-group a:active .tn-dr-lbl, .tn-drawer-group > button:active .tn-dr-lbl { background-size: 100% 2.5px; }
  .tn-drawer-group a .tn-dr-badge.nx-badge { top: -5px; right: -6px; }
  .tn-drawer-group a .tn-dr-badge.nx-dot { top: 2px; right: 2px; }
  .tn-drawer-pct { margin: 10px 14px 0; }
  .tn-drawer-foot { display: none; }
}

.tn-mob-nav { display: none; }
@media (max-width: 1023px) {
  .tn-search kbd { display: none; }
}
@media (max-width: 767px), (min-width: 768px) and (max-width: 1400px) and (hover: none) and (pointer: coarse) {
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
  .tn-mob-nav { display: flex; position: fixed; z-index: 1200; left: 10px; right: 10px; bottom: calc(10px + env(safe-area-inset-bottom, 0px)); padding: 0 4px; background: #fff; border: 1px solid #e4ece7; border-radius: 22px; overflow: hidden;
    box-shadow: 0 14px 30px -12px rgba(4,30,16,.38), 0 3px 8px -4px rgba(4,30,16,.14); transition: transform .26s cubic-bezier(.22,.8,.3,1); will-change: transform; }
  .tn-mob-nav.away { transform: translateY(calc(100% + 24px + env(safe-area-inset-bottom, 0px))); }
  body:has(.ts-area) #cyt-cookie-consent-bar { bottom: calc(76px + env(safe-area-inset-bottom, 0px)) !important; } /* never over the bar's buttons */
  body:has(.tn-drawer-wrap) #cyt-cookie-consent-bar { display: none !important; }
  .tn-mob-line { position: absolute; top: 0; left: 4px; width: calc((100% - 8px) / var(--n)); height: 3px; transform: translateX(calc(100% * var(--i))); transition: transform .24s cubic-bezier(.22,.8,.3,1); pointer-events: none; }
  .tn-mob-line::after { content: ""; display: block; width: 34px; height: 100%; margin: 0 auto; border-radius: 0 0 4px 4px; background: #d4a24c; }
  .tn-mob-item { flex: 1; min-width: 0; min-height: 58px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; padding: 8px 0 6px; position: relative; border: 0; background: none; color: #64748b; font-family: inherit; font-size: 11.5px; font-weight: 600; text-decoration: none !important; cursor: pointer; -webkit-tap-highlight-color: transparent; transition: color .18s ease; }
  .tn-mob-item:active .tn-mob-ico { transform: scale(.88); }
  .tn-mob-ico { display: grid; place-items: center; width: 48px; height: 28px; border-radius: 999px; transition: transform .18s ease, background .18s ease; }
  .tn-mob-ico svg { font-size: 24px; color: inherit; }
  .tn-mob-item.active { color: #166534; font-weight: 800; }
  .tn-mob-item.active .tn-mob-ico { background: #e3f4e9; }
  .tn-mob-badge { position: absolute; top: 0; right: calc(50% - 26px); background: #ef4444; color: #fff; border-radius: 8px; padding: 1px 5px; font-size: 9.5px; font-weight: 800; border: 2px solid #fff; z-index: 1; }
  .tn-mob-item .tn-mob-badge.nx-badge { margin: 0; height: auto; min-width: 0; line-height: 1.3; }
  .tn-mob-item .tn-mob-badge.nx-dot { width: 11px; height: 11px; padding: 0; top: 3px; right: calc(50% - 20px); background: #f59e0b; border: 2px solid #fff; box-shadow: none; }
}
@media (prefers-reduced-motion: reduce) { .tn-drawer, .tn-drawer-wrap, .tn-prof-dd { animation: none; } .tn-mob-nav, .tn-mob-line, .tn-mob-ico { transition: none; } }

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

/* ═══ App feel on phones + touch tablets (browser and installed app) — same look as the CYT admin app ═══
   white top bar, colourful app-icon bottom bar (a Dock on iPad), colourful menu tiles, white KPI cards with
   coloured titles, and pages that grow out of the tapped icon. Desktop is untouched. */
@media (max-width: 767px), (min-width: 768px) and (max-width: 1400px) and (hover: none) and (pointer: coarse) {
  .tn-bar.tn-bar { background: #fff; box-shadow: none; border-bottom: 1px solid rgba(0,0,0,.06); }
  .tn-bar .tn-menu-btn { background: #f0f3f1; border-color: transparent; color: #1c1c1e; border-radius: 50%; }
  .tn-bar .tn-menu-btn:hover { background: #e6ebe8; color: #1c1c1e; }
  .tn-bar .tn-who:hover, .tn-bar .tn-who[aria-expanded="true"] { background: #f4f6f5; }
  .tn-bar .tn-who-av { border-radius: 50%; box-shadow: 0 0 0 1px #e4ece7; }
  .tn-bar .tn-who-txt > b { color: #1c1c1e; }
  .tn-bar .tn-who-tick { color: #16a34a; }
  .tn-bar .tn-who-type { color: #64748b; }
  .tn-bar .tn-who-brand { color: #1e8a4f; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; font-size: 9.5px; }
  .tn-bar .tn-icon-btn { color: #1c1c1e; background: #f0f3f1; border-radius: 50%; width: 38px; height: 38px; margin-left: 6px; }
  .tn-bar .tn-icon-btn:hover { background: #e6ebe8; color: #1c1c1e; }
  .tn-bar .tn-notif-dot { border-color: #fff; }

  /* bottom bar: app icons */
  .tn-mob-line { display: none; }
  .tn-mob-nav { background: rgba(255,255,255,.94); -webkit-backdrop-filter: saturate(180%) blur(16px); backdrop-filter: saturate(180%) blur(16px); overflow: visible; }
  .tn-mob-item { gap: 4px; font-size: 11px; font-weight: 700; color: #475569; min-height: 66px; }
  .tn-mob-ico { width: 40px; height: 40px; border-radius: 12px; color: #fff; background: var(--tile, linear-gradient(160deg, #3fa66b, #14532d));
    box-shadow: 0 6px 12px -6px var(--tile-sh, rgba(11,63,38,.6)), inset 0 1px 0 rgba(255,255,255,.35); }
  .tn-mob-ico svg { font-size: 22px; color: #fff; }
  .tn-mob-item.active { color: #0b1712; font-weight: 800; }
  .tn-mob-item.active .tn-mob-ico { background: var(--tile, linear-gradient(160deg, #3fa66b, #14532d)); transform: translateY(-2px); }
  .tn-mob-item.active::after { content: ""; position: absolute; bottom: 3px; left: 50%; width: 4px; height: 4px; margin-left: -2px; border-radius: 50%; background: #0b1712; opacity: .5; }
  .tn-mob-item[data-k="home"]     { --tile: linear-gradient(160deg, #5ab0ff, #1d63d8); --tile-sh: rgba(29,99,216,.65); }
  .tn-mob-item[data-k="sessions"] { --tile: linear-gradient(160deg, #ffc65a, #f07b12); --tile-sh: rgba(240,123,18,.6); }
  .tn-mob-item[data-k="schedule"] { --tile: linear-gradient(160deg, #4fd6d6, #0e8a9a); --tile-sh: rgba(14,138,154,.6); }
  .tn-mob-item[data-k="settings"] { --tile: linear-gradient(160deg, #b98cff, #6a3fd6); --tile-sh: rgba(106,63,214,.6); }
  .tn-mob-item[data-k="more"]     { --tile: linear-gradient(160deg, #8e9aa6, #4b5662); --tile-sh: rgba(75,86,98,.6); }

  /* menu tiles: colourful app icons */
  .tn-dr-ic { width: 56px; height: 56px; border-radius: 17px; background: var(--tile, linear-gradient(160deg, #4fd38b, #12804a));
    box-shadow: 0 10px 18px -10px var(--tile-sh, rgba(11,63,38,.6)), inset 0 1px 0 rgba(255,255,255,.35); }
  .tn-drawer-group a svg, .tn-drawer-group > button svg { color: #fff !important; font-size: 26px; }
  .tn-drawer-group a.on .tn-dr-ic { background: var(--tile, linear-gradient(160deg, #4fd38b, #12804a)); box-shadow: 0 0 0 3px #fff, 0 0 0 5px rgba(20,83,45,.45); }
  .tn-drawer-group a:active .tn-dr-ic { background: var(--tile); transform: scale(.9); }
  .tn-dr-lbl { color: #1f2a24; overflow-wrap: anywhere; -webkit-hyphens: auto; hyphens: auto; }
  .tn-page > :nth-child(8n+1) { --tile: linear-gradient(160deg, #5ab0ff, #1d63d8); --tile-sh: rgba(29,99,216,.6); }
  .tn-page > :nth-child(8n+2) { --tile: linear-gradient(160deg, #ffc65a, #f07b12); --tile-sh: rgba(240,123,18,.55); }
  .tn-page > :nth-child(8n+3) { --tile: linear-gradient(160deg, #b98cff, #6a3fd6); --tile-sh: rgba(106,63,214,.55); }
  .tn-page > :nth-child(8n+4) { --tile: linear-gradient(160deg, #4fd38b, #12804a); --tile-sh: rgba(18,128,74,.55); }
  .tn-page > :nth-child(8n+5) { --tile: linear-gradient(160deg, #ff8aa6, #e0335e); --tile-sh: rgba(224,51,94,.55); }
  .tn-page > :nth-child(8n+6) { --tile: linear-gradient(160deg, #4fd6d6, #0e8a9a); --tile-sh: rgba(14,138,154,.55); }
  .tn-page > :nth-child(8n+7) { --tile: linear-gradient(160deg, #ff9b6b, #e5532a); --tile-sh: rgba(229,83,42,.55); }
  .tn-page > :nth-child(8n+8) { --tile: linear-gradient(160deg, #7f9cff, #3b4fd1); --tile-sh: rgba(59,79,209,.55); }
  .tn-drawer-group a.up .tn-dr-ic { background: linear-gradient(160deg, #f6d27a, #c9962c); box-shadow: 0 10px 18px -10px rgba(201,150,44,.7), inset 0 1px 0 rgba(255,255,255,.4); }
  .tn-drawer-group > button.out .tn-dr-ic { background: linear-gradient(160deg, #ff7a7a, #dc2626); box-shadow: 0 10px 18px -10px rgba(220,38,38,.6); }

  /* dashboard numbers: white cards, coloured title, crisp tinted outline (no gradients / stripes) */
  .ov-kpi, .ov-kpi.green, .ov-kpi.teal, .ov-kpi.gold, .ov-kpi.amber {
    background: #fff !important; border: 1.5px solid var(--kc-b, #e3e8e5) !important; border-radius: 20px; box-shadow: 0 1px 2px rgba(0,0,0,.04);
  }
  .ov-kpi.green { --kc: #16a34a; --kc-b: #c6ead3; } .ov-kpi.teal { --kc: #0a84ff; --kc-b: #c4dcfb; }
  .ov-kpi.gold { --kc: #e08a00; --kc-b: #f3dcae; } .ov-kpi.amber { --kc: #e5397a; --kc-b: #f6c9da; }
  .ov-kpis .ov-kpi::before { display: none; }
  .ov-kpi-label { color: var(--kc, #16a34a) !important; font-size: 13px; }
  .ov-kpi-ic { color: var(--kc, #16a34a); }
  .ov-kpi .ov-kpi-val, .ov-kpi.green .ov-kpi-val, .ov-kpi.teal .ov-kpi-val, .ov-kpi.gold .ov-kpi-val, .ov-kpi.amber .ov-kpi-val { color: #1c1c1e; }

  /* opening a page from an icon: it grows out of that icon, like opening an app */
  .ts-page.ts-zoom { transform-origin: var(--ox, 50%) var(--oy, 100%); animation: tsOpen .46s cubic-bezier(.16,1,.3,1) both; }
  @keyframes tsOpen { 0% { opacity: 0; transform: scale(.08); border-radius: 60px; } 35% { opacity: 1; } 100% { opacity: 1; transform: none; border-radius: 0; } }
}

/* iPad: the bottom bar becomes a Dock with big icons; the menu opens as a centred card */
@media (min-width: 768px) and (max-width: 1400px) and (hover: none) and (pointer: coarse) {
  .tn-mob-nav { left: 50%; right: auto; width: auto; max-width: calc(100% - 40px); transform: translateX(-50%); gap: 14px; padding: 10px 14px 8px; border-radius: 30px; bottom: calc(14px + env(safe-area-inset-bottom, 0px)); }
  .tn-mob-nav.away { transform: translate(-50%, calc(100% + 30px + env(safe-area-inset-bottom, 0px))); }
  .tn-mob-item { flex: none; width: 76px; min-height: 0; font-size: 12px; padding: 0; }
  .tn-mob-ico { width: 58px; height: 58px; border-radius: 18px; }
  .tn-mob-ico svg { font-size: 30px; }
  .tn-mob-item[data-k="more"] { margin-left: 6px; }
  .tn-mob-item[data-k="more"]::before { content: ""; position: absolute; left: -11px; top: 8px; bottom: 26px; width: 1px; background: rgba(20,83,45,.18); }
  .tn-mob-item.active::after { bottom: -6px; }
  .tn-drawer { left: 0; right: 0; margin: 0 auto; width: min(760px, 100%); bottom: calc(12px + env(safe-area-inset-bottom, 0px)); border-radius: 24px; }
  .tn-drawer-head { border-radius: 24px 24px 0 0; }
  .tn-dr-ic { width: 66px; height: 66px; border-radius: 20px; }
  .tn-drawer-group a svg, .tn-drawer-group > button svg { font-size: 32px; }
  .tn-drawer-group a, .tn-drawer-group > button { font-size: 13px; }
}
@media (prefers-reduced-motion: reduce) { .ts-page.ts-zoom { animation: none; } }

/* ═══ app bar like the CYT admin app (phones + touch tablets): page title left, round buttons right ═══ */
.tn-app-title, .tn-app-site, .tn-clock, .tn-refresh { display: none !important; }
.dock-x { display: none !important; }
@media (max-width: 767px), (min-width: 768px) and (max-width: 1400px) and (hover: none) and (pointer: coarse) {
  .tn-bar.tn-bar { height: 60px; gap: 8px; padding: 0 12px 0 16px; }
  :root { --tn-h: 60px; }
  .tn-bar .tn-menu-btn { display: none; }
  .tn-app-title { display: block !important; order: 1; flex: 0 1 auto; min-width: 0; font-size: 24px; font-weight: 800; letter-spacing: -.03em; color: #1c1c1e; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .tn-bar .tn-prof { order: 10; flex: 0 0 auto; }
  .tn-bar .tn-who { padding: 0; max-width: none; flex: none; }
  .tn-bar .tn-who-txt { display: none; }
  .tn-bar .tn-who-av { width: 38px; height: 38px; border-radius: 50%; }
  .tn-prof-dd { left: auto; right: 0; }
  .tn-bar .tn-right { order: 5; margin-left: auto; gap: 8px; }
  .tn-bar .tn-icon-btn { margin-left: 0; }
  .tn-refresh { display: grid !important; }
  .tn-refresh.spin svg { animation: tnSpin .7s linear infinite; }
  @keyframes tnSpin { to { transform: rotate(360deg); } }
  /* More: a bottom sheet like the admin's — white header, 12 icons a page */
  .tn-drawer-head { background: #fff !important; border-bottom: 1px solid #eef2f0 !important; padding: 20px 16px 12px !important; }
  .tn-drawer-head b { color: #0b1712 !important; font-size: 17px; }
  .tn-drawer-head > div > span:not(.nx-tone) { color: #1e8a4f !important; }
  .tn-drawer-head button { background: #f0f3f1 !important; color: #1c1c1e !important; border-radius: 50% !important; }
  .tn-drawer-head img { border-radius: 50%; }
  .tn-sheet-grip { background: #d6dfda !important; }
  .tn-pages .tn-page { gap: 16px 4px; padding: 4px 10px; }
}
@media (min-width: 768px) and (max-width: 1400px) and (hover: none) and (pointer: coarse) {
  .tn-app-site { display: inline-flex !important; order: 2; margin: 3px auto 0 4px; color: #1e8a4f !important; font-size: 15px; font-weight: 800; letter-spacing: .06em; text-decoration: none !important; white-space: nowrap; }
  .tn-bar .tn-right { margin-left: 0; }
  .tn-clock { display: inline-flex !important; align-items: baseline; gap: 1px; margin-right: 4px; padding: 4px 12px; border-radius: 14px; background: #f0f3f1;
    font-family: "SF Pro Rounded", ui-rounded, Inter, -apple-system, sans-serif; font-variant-numeric: tabular-nums; line-height: 1; }
  .tn-clock b { font-size: 26px; font-weight: 900; letter-spacing: -.02em; }
  .tn-clock .h { color: #1c1c1e; } .tn-clock .m { color: #1e8a4f; }
  .tn-clock i { font-style: normal; font-size: 24px; font-weight: 900; color: #d4a24c; margin: 0 1px; animation: tnBlink 1s steps(1) infinite; }
  .tn-clock small { font-size: 11px; font-weight: 800; color: #6e6e73; margin-left: 4px; letter-spacing: .04em; }
  @keyframes tnBlink { 50% { opacity: .25; } }
  /* the Dock fills the width: 3 extra favourites in portrait, 7 in landscape */
  .dock-x { display: flex !important; }
  .dock-x[data-i="3"], .dock-x[data-i="4"], .dock-x[data-i="5"], .dock-x[data-i="6"] { display: none !important; }
  .dock-x[data-i="0"] { --tile: linear-gradient(160deg, #ff8aa6, #e0335e); --tile-sh: rgba(224,51,94,.55); }
  .dock-x[data-i="1"] { --tile: linear-gradient(160deg, #7f9cff, #3b4fd1); --tile-sh: rgba(59,79,209,.55); }
  .dock-x[data-i="2"] { --tile: linear-gradient(160deg, #ff9b6b, #e5532a); --tile-sh: rgba(229,83,42,.55); }
  .dock-x[data-i="3"] { --tile: linear-gradient(160deg, #4fd38b, #12804a); --tile-sh: rgba(18,128,74,.55); }
  .dock-x[data-i="4"] { --tile: linear-gradient(160deg, #5ab0ff, #1d63d8); --tile-sh: rgba(29,99,216,.55); }
  .dock-x[data-i="5"] { --tile: linear-gradient(160deg, #ffc65a, #f07b12); --tile-sh: rgba(240,123,18,.55); }
  .dock-x[data-i="6"] { --tile: linear-gradient(160deg, #4fd6d6, #0e8a9a); --tile-sh: rgba(14,138,154,.55); }
  .dock-x.up { --tile: linear-gradient(160deg, #f6d27a, #c9962c); --tile-sh: rgba(201,150,44,.6); }
  .tn-mob-nav { gap: 10px; }
  .tn-mob-item { width: 80px; }
  .tn-mob-item { font-size: 11.5px; white-space: nowrap; }
  .tn-mob-item > :not(.tn-mob-ico):not(.tn-mob-badge) { overflow: hidden; text-overflow: ellipsis; }
}
@media (min-width: 768px) and (max-width: 1400px) and (hover: none) and (pointer: coarse) and (orientation: landscape) {
  .dock-x[data-i="3"], .dock-x[data-i="4"], .dock-x[data-i="5"], .dock-x[data-i="6"] { display: flex !important; }
}
`;
