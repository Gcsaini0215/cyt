import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import usePullToRefresh, { PTR_CSS, PTR_ICON } from "../../utils/pull-refresh";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import SpaRoundedIcon from "@mui/icons-material/SpaRounded";
import { CYCLE_FLAG, CYCLE_EVENT } from "./cycle-card";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import useUserStore from "../../store/userStore";
import { removeToken, getDecodedToken } from "../../utils/jwt";
import useSessionGuard from "../../utils/session-guard";
import { imagePath } from "../../utils/url";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import PersonSearchRoundedIcon from "@mui/icons-material/PersonSearchRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import PsychologyAltRoundedIcon from "@mui/icons-material/PsychologyAltRounded";
import VolunteerActivismRoundedIcon from "@mui/icons-material/VolunteerActivismRounded";
import ChildCareRoundedIcon from "@mui/icons-material/ChildCareRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import NorthEastRoundedIcon from "@mui/icons-material/NorthEastRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import ClientNotifications from "./client-notifications";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import PersonSearchOutlinedIcon from "@mui/icons-material/PersonSearchOutlined";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import QuestionAnswerRoundedIcon from "@mui/icons-material/QuestionAnswerRounded";
import InstallAppBar from "./install-app-bar";

/* Client portal frame: green top bar, side menu on desktop / iPad, bottom bar + "More" sheet on
   phones. Sends logged-out visitors to /login and brings them back afterwards. */

export const CLIENT_NAV = [
  { to: "/my-dashboard", label: "My Space", Icon: HomeRoundedIcon, Off: HomeOutlinedIcon, mob: true },
  { to: "/client/free-session", label: "Free Consultation", Icon: VolunteerActivismRoundedIcon }, // phones: in "More"
  { to: "/client/my-bookings", label: "My Sessions", short: "Sessions", Icon: EventAvailableRoundedIcon, Off: EventAvailableOutlinedIcon, mob: true },
  { to: "/client/find", label: "Find My Therapist", short: "Explore", Icon: PersonSearchRoundedIcon, Off: PersonSearchOutlinedIcon, mob: true },
  { to: "/client/favrioute-therapits", label: "My Shortlist", short: "Shortlist", Icon: FavoriteRoundedIcon, Off: FavoriteBorderRoundedIcon, mob: true },
  { to: "/client/ask", label: "Ask a Psychologist", Icon: QuestionAnswerRoundedIcon }, // phones: in "More"
  { to: "/my-settings", label: "About Me", Icon: ManageAccountsRoundedIcon }, // phones: in "More"
];
// "See Links" — a small drop-down of public pages, so they open outside the portal (marked ↗). Never say "centre".
export const HELP_NAV = [
  { to: "/therapy-for/relationships", label: "For us as a couple", Icon: VolunteerActivismRoundedIcon },
  { to: "/therapy-for/parenting", label: "For my child", Icon: ChildCareRoundedIcon },
  { to: "/noida-appointment", label: "Meet in person", Icon: StorefrontRoundedIcon },
  { to: "/blogs", label: "Reads for me", Icon: MenuBookRoundedIcon },
];
// "How am I doing?" — a small drop-down in the side menu: the client's own history + the public self-checks
export const CHECK_NAV = [
  { to: "/client/check-ins", label: "My check-ins", Icon: InsightsRoundedIcon },
  { to: "/self-assessment", label: "Book an assessment", Icon: PsychologyAltRoundedIcon, ext: true },
];
const CYCLE_ITEM = { to: "/client/cycle", label: "Cycle & Mood", Icon: SpaRoundedIcon };
export const WA_HELP = "https://wa.me/918077757951?text=" + encodeURIComponent("Hi CYT team, I need help with my booking: ");
// short names for the iPad Dock
const DOCK_SHORT = { "Free Consultation": "Free session", "Ask a Psychologist": "Ask", "My check-ins": "Check-ins", "Book an assessment": "Assessment", "For us as a couple": "Couple", "For my child": "Child", "Meet in person": "In person", "Reads for me": "Reads" };
const TILES_PER_PAGE = 12; // 3 rows of 4, like the admin app menu
// phones + touch tablets (iPad) get the app shell: bottom bar, tile menu, no side menu
const TOUCH_SHELL = "(max-width: 767px), (min-width: 768px) and (max-width: 1400px) and (hover: none) and (pointer: coarse)";
// iPhone-style "opening an app": the next page grows out of the tapped icon. The shell remounts with every
// page, so the new page reads this as it mounts (zoom state below) and the old page never moves.
function openFromIcon(e) {
  if (typeof window === "undefined" || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  const el = e?.currentTarget;
  const main = document.querySelector(".cls-main");
  if (!el || !main) return;
  const r = el.getBoundingClientRect();
  const m = main.getBoundingClientRect();
  window.__clsOpen = { ox: Math.round(r.left + r.width / 2 - m.left), oy: Math.round(r.top + r.height / 2 - m.top), at: Date.now() };
}
const RAIL_KEY = "cyt_cls_rail_mini";
// runs while the HTML is parsed, before the rail is painted
const RAIL_SCRIPT = `try{if(localStorage.getItem("${"cyt_cls_rail_mini"}")==="1")document.documentElement.classList.add("cls-mini")}catch(e){}`;
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// iPad app bar: a bold two-colour digital clock (shown on touch tablets only)
function AppClock() {
  const [now, setNow] = useState(null);
  useEffect(() => { setNow(new Date()); const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  if (!now) return null;
  const pad = (n) => String(n).padStart(2, "0");
  return (
    <span className="cls-clock" aria-label={now.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}>
      <b className="h">{pad(now.getHours() % 12 || 12)}</b><i>:</i><b className="m">{pad(now.getMinutes())}</b><small>{now.getHours() < 12 ? "AM" : "PM"}</small>
    </span>
  );
}

export default function ClientShell({ title, children }) {
  const router = useRouter();
  const { userInfo } = useUserStore();
  const [ready, setReady] = useState(false);
  const [menu, setMenu] = useState(false);
  const [more, setMore] = useState(false); // phones: the "More" sheet
  const [checksOpen, setChecksOpen] = useState(false); // side menu: "How am I doing?" drop-down
  const [linksOpen, setLinksOpen] = useState(false); // side menu: "See Links" drop-down
  const [barHidden, setBarHidden] = useState(false); // phone bar: slides away while scrolling down
  const [sheetPage, setSheetPage] = useState(0);
  // "Cycle & Mood" shows in the menu once the client has switched it on (pages/client/cycle.js)
  const [cycleOn, setCycleOn] = useState(false);
  useEffect(() => {
    const read = () => { try { setCycleOn(localStorage.getItem(CYCLE_FLAG) === "on"); } catch (e) { /* storage blocked */ } };
    read();
    window.addEventListener(CYCLE_EVENT, read);
    return () => window.removeEventListener(CYCLE_EVENT, read);
  }, []);
  const tilesRef = useRef(null);
  const ptrRef = usePullToRefresh(); // installed app: pull down at the top to refresh
  const [zoom] = useState(() => {
    if (typeof window === "undefined") return null;
    const z = window.__clsOpen;
    window.__clsOpen = null;
    return z && Date.now() - z.at < 8000 ? z : null;
  });
  // ☰ flips the side menu: desktop full ↔ icons only (remembered), tablet icons ↔ full
  // Desktop: the icons-only rail is a class on <html> (`cls-mini`), set by RAIL_SCRIPT while the
  // page is still loading, so a refresh shows the right width at once (reading it in an effect made
  // the rail open and then close). Tablet: `flip` opens the full menu over the page (not remembered).
  const [flip, setFlip] = useState(false);
  useIsoLayoutEffect(() => {
    // arriving from another page without a full load: apply the saved choice before paint
    try {
      const mini = localStorage.getItem(RAIL_KEY) === "1";
      document.documentElement.classList.toggle("cls-mini", mini);
    } catch (e) { /* storage blocked */ }
  }, []);
  const toggleRail = () => {
    if (window.matchMedia(TOUCH_SHELL).matches) { setMore(true); return; } // phones + iPad: the menu sheet
    const html = document.documentElement;
    html.classList.add("cls-anim"); // animate only when the user toggles, never on load
    if (window.matchMedia("(min-width: 1024px)").matches) {
      const mini = !html.classList.contains("cls-mini");
      html.classList.toggle("cls-mini", mini);
      try { localStorage.setItem(RAIL_KEY, mini ? "1" : "0"); } catch (e) { /* storage blocked */ }
      return;
    }
    setFlip((f) => !f);
  };
  const menuRef = useRef(null);

  const signedIn = useSessionGuard();
  useEffect(() => {
    if (!signedIn) return;
    // a therapist account can't use the client pages (the API rejects it) — send it to its own dashboard
    if (getDecodedToken()?.role === 1) {
      router.replace("/therapist-dashboard");
      return;
    }
    setReady(true);
  }, [router, signedIn]);
  useEffect(() => {
    if (!menu) return undefined;
    const close = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(false); };
    document.addEventListener("mousedown", close);
    document.addEventListener("touchstart", close);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("touchstart", close); };
  }, [menu]);
  useEffect(() => {
    setMenu(false); setMore(false);
    // the tablet overlay closes when you pick a page
    if (window.matchMedia("(max-width: 1023px)").matches) setFlip(false);
  }, [router.pathname]);
  useEffect(() => {
    if (!more) return undefined;
    const onKey = (e) => { if (e.key === "Escape") setMore(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [more]);

  // ask first — a stray tap on a phone should never log anyone out
  const logout = () => {
    setMenu(false);
    setMore(false);
    if (!window.confirm("Log out of your account?")) return;
    removeToken();
    router.push("/login");
  };
  const name = userInfo?.name || "";
  // no photo, a "null" placeholder, or a file that won't load → initials (a broken <img> showed as "?")
  const [photoFailed, setPhotoFailed] = useState(false);
  const pf = String(userInfo?.profile || "").trim();
  const noPhoto = !pf || /^(null|undefined)$/i.test(pf) || pf.startsWith("blob:") || photoFailed;
  const photo = noPhoto ? "" : /^https?:/.test(pf) ? pf : `${imagePath}/${pf}`;
  useEffect(() => { setPhotoFailed(false); }, [pf]);
  const initials = (name || "U").split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const active = (to) => router.pathname === to;
  const onChecks = CHECK_NAV.some((c) => active(c.to));
  useEffect(() => { if (onChecks) setChecksOpen(true); }, [onChecks]);
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
  useEffect(() => { setBarHidden(false); }, [router.asPath]);

  // phone "More" sheet: tiles in pages of 8 that slide sideways
  const mobNav = CLIENT_NAV.filter((n) => n.mob);
  const moreOn = more || active("/my-settings") || active("/client/ask") || active("/client/cycle") || onChecks;
  const mobOn = moreOn ? mobNav.length : mobNav.findIndex((n) => active(n.to));
  const sheetTiles = [
    { to: "/client/free-session", label: "Free Consultation", Icon: VolunteerActivismRoundedIcon },
    ...(cycleOn ? [CYCLE_ITEM] : []),
    { to: "/client/ask", label: "Ask a Psychologist", Icon: QuestionAnswerRoundedIcon },
    { to: "/my-settings", label: "About Me", Icon: ManageAccountsRoundedIcon },
    ...CHECK_NAV,
    ...HELP_NAV,
    { href: WA_HELP, label: "Talk to us", Icon: SupportAgentRoundedIcon, blank: true },
    { href: "/", label: "Website", Icon: LanguageRoundedIcon },
    { label: "Log out", Icon: LogoutRoundedIcon, onClick: logout },
  ];
  const navAll = [...CLIENT_NAV, CYCLE_ITEM, ...CHECK_NAV];
  const pageTitle = router.pathname === "/my-dashboard" ? "Home" : (navAll.find((n) => active(n.to))?.label || title || "My account");
  const tilePages = [];
  for (let i = 0; i < sheetTiles.length; i += TILES_PER_PAGE) tilePages.push(sheetTiles.slice(i, i + TILES_PER_PAGE));
  const onTilesScroll = (e) => { const el = e.currentTarget; setSheetPage(Math.round(el.scrollLeft / el.clientWidth)); };
  const goTilePage = (i) => { const el = tilesRef.current; if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" }); };
  // opens on the page holding the current screen
  useEffect(() => {
    if (!more) return;
    const page = Math.max(0, Math.floor(sheetTiles.findIndex((t) => t.to && active(t.to)) / TILES_PER_PAGE));
    if (tilesRef.current) tilesRef.current.scrollLeft = page * tilesRef.current.clientWidth;
    setSheetPage(page);
  }, [more]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`cls${flip ? " flip" : ""}`}>
      <script dangerouslySetInnerHTML={{ __html: RAIL_SCRIPT }} />
      <Head><title>{title ? `${title} | Choose Your Therapist` : "My account | Choose Your Therapist"}</title></Head>
      <style dangerouslySetInnerHTML={{ __html: CLS_CSS + PTR_CSS }} />
      <div className="ptr" ref={ptrRef} aria-hidden="true" dangerouslySetInnerHTML={{ __html: PTR_ICON }} />
      <header className="cls-bar">
        <button type="button" className="cls-burger" onClick={toggleRail} aria-label={flip ? "Expand menu" : "Collapse menu"} title="Menu"><MenuRoundedIcon /></button>
        <Link href="/my-dashboard" className="cls-logo" aria-label="Home"><img src="/cyt-emblem.png" alt="CYT" width={32} height={32} /></Link>
        <div className="cls-brand"><b>Choose Your Therapist</b><span>www.chooseyourtherapist.in</span></div>
        {/* phones / iPad: the page's name, like an app */}
        <span className="cls-app-title">{pageTitle}</span>
        <a href="https://www.chooseyourtherapist.in" target="_blank" rel="noopener noreferrer" className="cls-app-site">WWW.CHOOSEYOURTHERAPIST.IN</a>
        <div className="cls-right">
          <AppClock />
          <button type="button" className="cls-ic cls-refresh" aria-label="Refresh" title="Refresh" onClick={(e) => {
            e.currentTarget.classList.add("spin"); setTimeout(() => window.location.reload(), 200);
          }}><RefreshRoundedIcon /></button>
          <ClientNotifications ready={ready} />
          <a href="/" className="cls-ic hide-sm" title="Go to website" aria-label="Go to website"><LanguageRoundedIcon /></a>
          <div className="cls-me" ref={menuRef}>
            <button type="button" className="cls-me-btn" onClick={() => setMenu((m) => !m)} aria-haspopup="menu" aria-expanded={menu}>
              <span className="cls-av">{photo ? <img src={photo} alt="" onError={() => setPhotoFailed(true)} /> : initials}</span>
              <span className="cls-me-name hide-sm">{name || "My account"}</span>
              <KeyboardArrowDownRoundedIcon className="hide-sm" />
            </button>
            {menu && (
              <div className="cls-dd" role="menu">
                <div className="cls-dd-head"><b>{name || "My account"}</b><span>{userInfo?.email || ""}</span></div>
                <Link href="/my-settings"><ManageAccountsRoundedIcon /> About Me</Link>
                <a href={WA_HELP} target="_blank" rel="noopener noreferrer"><SupportAgentRoundedIcon /> Help on WhatsApp</a>
                <button type="button" className="out" onClick={logout}><LogoutRoundedIcon /> Log out</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <nav className="cls-rail" aria-label="My account">
        {(cycleOn ? [...CLIENT_NAV.slice(0, 2), CYCLE_ITEM, ...CLIENT_NAV.slice(2)] : CLIENT_NAV).map(({ to, label, Icon }) => (
          <Link key={to} href={to} className={`cls-item${active(to) ? " on" : ""}`} aria-current={active(to) ? "page" : undefined}>
            <Icon /><span>{label}</span>
          </Link>
        ))}
        <div className={`cls-dd-group${checksOpen ? " open" : ""}`}>
          <button type="button" className={`cls-item${onChecks && !checksOpen ? " on" : ""}`} onClick={() => setChecksOpen((o) => !o)} aria-expanded={checksOpen} title="How am I doing?">
            <PsychologyAltRoundedIcon /><span>How am I doing?</span><KeyboardArrowDownRoundedIcon className="cls-chev" />
          </button>
          {checksOpen && (
            <div className="cls-dd-kids">
              {CHECK_NAV.map(({ to, label, Icon, ext }) => (
                <Link key={to} href={to} className={`cls-item kid${active(to) ? " on" : ""}`} title={label} aria-current={active(to) ? "page" : undefined}>
                  <Icon /><span>{label}</span>{ext && <NorthEastRoundedIcon className="cls-ext" />}
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="cls-rail-group">
          <div className={`cls-dd-group${linksOpen ? " open" : ""}`}>
            <button type="button" className="cls-item" onClick={() => setLinksOpen((o) => !o)} aria-expanded={linksOpen} title="See Links">
              <LinkRoundedIcon /><span>See Links</span><KeyboardArrowDownRoundedIcon className="cls-chev" />
            </button>
            {linksOpen && (
              <div className="cls-dd-kids">
                {HELP_NAV.map(({ to, label, Icon }) => (
                  <Link key={to} href={to} className="cls-item kid" title={label}>
                    <Icon /><span>{label}</span><NorthEastRoundedIcon className="cls-ext" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="cls-rail-foot">
          <a href={WA_HELP} target="_blank" rel="noopener noreferrer" className="cls-item"><SupportAgentRoundedIcon /><span>Talk to us</span></a>
          <button type="button" className="cls-item out" onClick={logout}><LogoutRoundedIcon /><span>Log out</span></button>
        </div>
      </nav>

      <main className={`cls-main${zoom ? " cls-zoom" : ""}`} style={zoom ? { "--ox": `${zoom.ox}px`, "--oy": `${zoom.oy}px` } : undefined}>{ready ? <><InstallAppBar />{children}</> : null}</main>

      <nav className={`cls-mob${barHidden && !more ? " away" : ""}`} aria-label="Quick menu" style={{ "--n": mobNav.length + 1, "--i": mobOn }} onFocus={() => setBarHidden(false)}>
        {mobOn >= 0 && <span className="cls-mob-line" aria-hidden="true" />}
        {mobNav.map(({ to, label, short, Icon, Off }, i) => (
          <Link key={to} href={to} data-k={["home", "sessions", "explore", "shortlist"][i] || "x"} className={`cls-mob-item${active(to) ? " on" : ""}`} aria-current={active(to) ? "page" : undefined}
            onClick={(e) => { if (!active(to)) openFromIcon(e); }}>
            <span className="cls-mob-ic">{active(to) ? <Icon /> : <Off />}</span>{short || label}
          </Link>
        ))}
        {sheetTiles.filter((t) => t.to).slice(0, 7).map(({ to, label, Icon }, i) => (
          <Link key={`dx-${to}`} href={to} data-i={i} className={`cls-mob-item dock-x${active(to) ? " on" : ""}`} aria-current={active(to) ? "page" : undefined}
            onClick={(e) => { if (!active(to)) openFromIcon(e); }}>
            <span className="cls-mob-ic"><Icon /></span><span className="cls-dock-l">{DOCK_SHORT[label] || label}</span>
          </Link>
        ))}
        <button type="button" data-k="more" className={`cls-mob-item${moreOn ? " on" : ""}`} onClick={() => setMore(true)} aria-haspopup="dialog" aria-expanded={more}>
          <span className="cls-mob-ic">{moreOn ? <GridViewRoundedIcon /> : <GridViewOutlinedIcon />}</span>More
        </button>
      </nav>

      {/* phones: everything else, as a sheet of tiles (same pattern as the therapist portal) */}
      {more && (
        <div className="cls-sheet-wrap" onClick={(e) => { if (e.target === e.currentTarget) setMore(false); }}>
          <div className="cls-sheet" role="dialog" aria-modal="true" aria-label="More">
            <span className="cls-grip" aria-hidden="true" />
            <div className="cls-sheet-head">
              <span className="cls-av">{photo ? <img src={photo} alt="" onError={() => setPhotoFailed(true)} /> : initials}</span>
              <div><b>{name || "My account"}</b><span className="cls-room">My therapy room</span></div>
              <button type="button" onClick={() => setMore(false)} aria-label="Close"><CloseRoundedIcon /></button>
            </div>
            <div className="cls-tiles-track" ref={tilesRef} onScroll={onTilesScroll}>
              {tilePages.map((tiles, k) => (
                <div key={k} className="cls-tiles">
                  {tiles.map(({ to, href, label, Icon, blank, onClick }) => {
                    const body = <><span className="cls-tile-ic"><Icon /></span><span className="cls-tile-tx">{label}</span></>;
                    if (onClick) return <button key={label} type="button" className="out" onClick={onClick}>{body}</button>;
                    return to ? <Link key={label} href={to} className={active(to) ? "on" : ""} aria-current={active(to) ? "page" : undefined} onClick={(e) => { if (!active(to)) openFromIcon(e); }}>{body}</Link>
                      : <a key={label} href={href} {...(blank ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{body}</a>;
                  })}
                </div>
              ))}
            </div>
            <div className="cls-dots" role="tablist" aria-label="Menu pages">
              {tilePages.map((_, k) => (
                <button key={k} type="button" role="tab" className={k === sheetPage ? "on" : ""} onClick={() => goTilePage(k)} aria-label={`Page ${k + 1}`} aria-selected={k === sheetPage} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const CLS_CSS = `
:root { --cls-h: 60px; }
.cls { --g: #166534; --g-dk: #0f3d24; --g-bg: #e7f6ec; --line: #e4ece7; --ink: #0f172a; --mut: #64748b; --faint: #94a3b8;
  font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; color: var(--ink); min-height: 100vh;
  background: #f1f3f5; } /* plain grey page, white cards */
.cls *, .cls *::before, .cls *::after { box-sizing: border-box; }
.cls svg { font-size: 20px; }
.cls-bar { position: fixed; top: 0; left: 0; right: 0; z-index: 1200; height: var(--cls-h); display: flex; align-items: center; gap: 12px; padding: 0 16px;
  background: linear-gradient(90deg, #0b3320 0%, #14532d 55%, #166534 100%); box-shadow: 0 6px 18px -10px rgba(4,30,16,.55); }
.cls-burger { width: 40px; height: 40px; margin-left: -6px; border-radius: 11px; border: 0; background: transparent; color: #fff; display: grid; place-items: center; cursor: pointer; flex-shrink: 0; }
.cls-burger:hover { background: rgba(255,255,255,.14); } .cls-burger svg { font-size: 24px; }
.cls-logo img { width: 36px; height: 36px; background: #fff; border-radius: 11px; padding: 3px; display: block; }
.cls-brand { display: flex; flex-direction: column; line-height: 1.15; min-width: 0; }
.cls-brand b { color: #fff; font-size: 15px; font-weight: 800; white-space: nowrap; }
.cls-brand span { color: #bbf7d0; font-size: 11.5px; }
.cls-right { margin-left: auto; display: flex; align-items: center; gap: 6px; }
.cls-ic { width: 40px; height: 40px; border-radius: 11px; display: grid; place-items: center; color: rgba(255,255,255,.9) !important; }
.cls-ic:hover { background: rgba(255,255,255,.14); }
.cls-me { position: relative; }
.cls-me-btn { display: flex; align-items: center; gap: 8px; height: 44px; padding: 0 8px 0 4px; border: 0; border-radius: 12px; background: transparent; color: #fff; cursor: pointer; font-family: inherit; font-size: 14px; font-weight: 700; }
.cls-me-btn:hover { background: rgba(255,255,255,.1); }
.cls-av { width: 36px; height: 36px; border-radius: 11px; background: #fff; color: var(--g); display: grid; place-items: center; font-weight: 800; font-size: 13px; overflow: hidden; flex-shrink: 0; }
.cls-av img { width: 100%; height: 100%; object-fit: cover; }
.cls-me-name { max-width: 160px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cls-dd { position: absolute; right: 0; top: calc(100% + 6px); min-width: 240px; background: #fff; border: 1px solid var(--line); border-radius: 14px; padding: 6px;
  box-shadow: 0 18px 44px rgba(15,23,42,.18); z-index: 1300; }
.cls-dd-head { padding: 10px; border-bottom: 1px solid #eef2f0; margin-bottom: 6px; }
.cls-dd-head b { display: block; font-size: 14px; } .cls-dd-head span { font-size: 12px; color: var(--mut); word-break: break-all; }
.cls-dd a, .cls-dd button { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px; border: 0; background: none; border-radius: 9px; color: #334155 !important;
  font-size: 14px; font-weight: 600; text-decoration: none !important; cursor: pointer; font-family: inherit; text-align: left; }
.cls-dd a:hover, .cls-dd button:hover { background: #f0fdf4; color: var(--g) !important; }
.cls-dd .out { color: #dc2626 !important; }
.cls-rail { position: fixed; top: var(--cls-h); left: 0; bottom: 0; width: 232px; background: #fff; border-right: 1px solid var(--line); padding: 14px 12px;
  display: flex; flex-direction: column; gap: 3px; z-index: 1100; overflow-y: auto; }
body:has(.cls) { padding-bottom: 0 !important; } /* the shell keeps its own room for the phone bar */
.cls-rail > *, .cls-rail .cls-item { flex-shrink: 0; } /* the menu scrolls when the drop-down opens — items never squeeze */
.cls-item { display: flex; align-items: center; gap: 12px; height: 44px; padding: 0 12px; border-radius: 12px; color: #475569 !important; font-size: 14.5px; font-weight: 700;
  text-decoration: none !important; border: 0; background: none; cursor: pointer; font-family: inherit; width: 100%; text-align: left; }
.cls-item svg { color: #64748b; }
.cls-item:hover { background: #e7f6ec; color: var(--g) !important; } .cls-item:hover svg { color: var(--g); }
.cls-item.on { position: relative; background: none; color: var(--g) !important; font-weight: 800; }
.cls-item.on svg { color: var(--g); }
.cls-item.on > span { padding-bottom: 3px; border-bottom: 2.5px solid #d4a24c; }
.cls-item.out { color: #dc2626 !important; } .cls-item.out svg { color: #dc2626; }
.cls-dd-group { display: flex; flex-direction: column; gap: 2px; }
.cls-chev { margin-left: auto; font-size: 19px !important; color: #94a3b8 !important; transition: transform .18s ease; }
.cls-dd-group.open .cls-chev { transform: rotate(180deg); }
.cls-dd-kids { display: flex; flex-direction: column; gap: 2px; margin-left: 14px; padding-left: 6px; border-left: 2px solid #e4ece7; }
.cls-item.kid { height: 38px; font-size: 13.5px; font-weight: 600; padding: 0 10px; gap: 10px; white-space: nowrap; }
.cls-item.kid svg { font-size: 18px; }
.cls-item.kid.on { color: var(--g) !important; } .cls-item.kid.on svg { color: var(--g); }
.cls-rail-group { margin-top: 14px; padding-top: 12px; border-top: 1px solid #eef2f0; display: flex; flex-direction: column; gap: 2px; }
.cls-item.sub { height: 40px; font-size: 13.5px; font-weight: 600; }
.cls-item.sub svg { font-size: 19px; }
.cls-item .cls-ext { margin-left: auto; font-size: 15px !important; color: #cbd5e1 !important; }
.cls-item.sub:hover .cls-ext { color: var(--g) !important; }
.cls-rail-foot { margin-top: auto; padding-top: 10px; border-top: 1px solid #eef2f0; display: flex; flex-direction: column; gap: 3px; }
.cls-main { padding: calc(var(--cls-h) + 24px) 32px 40px 264px; max-width: 1480px; }
.cls-mob { display: none; }
@media (max-width: 1023px) {
  .cls-rail { width: 76px; padding: 12px 10px; }
  .cls-item { justify-content: center; padding: 0; } .cls-item span, .cls-item .cls-ext, .cls-chev { display: none; }
  .cls-item.on::after { content: ""; position: absolute; left: 50%; bottom: 5px; width: 22px; height: 3px; margin-left: -11px; border-radius: 2px; background: #d4a24c; }
  .cls-dd-kids { margin-left: 0; padding-left: 0; border-left: 0; background: #f4f8f5; border-radius: 12px; }
  .cls-item.kid { padding: 0; }
  .cls-rail-group { margin-top: 10px; padding-top: 10px; }
  .cls-main { padding: calc(var(--cls-h) + 20px) 24px 40px 100px; }
}
/* ☰ on desktop: icons-only rail */
@media (min-width: 1024px) {
  html.cls-mini .cls .cls-rail { width: 76px; padding: 12px 10px; }
  html.cls-mini .cls .cls-item { justify-content: center; padding: 0; }
  html.cls-mini .cls .cls-item.on::after { content: ""; position: absolute; left: 50%; bottom: 5px; width: 22px; height: 3px; margin-left: -11px; border-radius: 2px; background: #d4a24c; }
  html.cls-mini .cls .cls-item span, html.cls-mini .cls .cls-item .cls-ext, html.cls-mini .cls .cls-chev { display: none; }
  html.cls-mini .cls .cls-dd-kids { margin-left: 0; padding-left: 0; border-left: 0; background: #f4f8f5; border-radius: 12px; }
  html.cls-mini .cls .cls-item.kid { padding: 0; }
  html.cls-mini .cls .cls-main { padding-left: 100px; max-width: 1348px; }
}
/* ☰ on a tablet: the full menu over the page */
@media (min-width: 768px) and (max-width: 1023px) {
  .cls.flip .cls-rail { width: 232px; padding: 14px 12px; box-shadow: 18px 0 40px -20px rgba(4,30,16,.35); }
  .cls.flip .cls-item { justify-content: flex-start; padding: 0 12px; }
  .cls.flip .cls-item span { display: inline; } .cls.flip .cls-item .cls-ext, .cls.flip .cls-chev { display: block; }
  .cls.flip .cls-dd-kids { margin-left: 14px; padding-left: 6px; border-left: 2px solid #e4ece7; background: none; }
  .cls.flip .cls-item.kid { padding: 0 10px; }
}
html.cls-anim .cls-rail, html.cls-anim .cls-main { transition: width .2s ease, padding .2s ease; }
@media (max-width: 767px), (min-width: 768px) and (max-width: 1400px) and (hover: none) and (pointer: coarse) {
  .hide-sm { display: none !important; }
  .cls-bar { padding: 0 12px; }
  .cls-rail { display: none; }
  .cls-main { padding: calc(var(--cls-h) + 14px) 16px calc(100px + env(safe-area-inset-bottom, 0px)); }
  .cls-mob { display: flex; position: fixed; left: 10px; right: 10px; bottom: calc(10px + env(safe-area-inset-bottom, 0px)); z-index: 1200; padding: 0 4px; background: #fff; border: 1px solid #e4ece7; border-radius: 22px; overflow: hidden;
    box-shadow: 0 14px 30px -12px rgba(4,30,16,.38), 0 3px 8px -4px rgba(4,30,16,.14); transition: transform .26s cubic-bezier(.22,.8,.3,1); will-change: transform; }
  .cls-mob.away { transform: translateY(calc(100% + 24px + env(safe-area-inset-bottom, 0px))); }
  body:has(.cls) #cyt-cookie-consent-bar { bottom: calc(76px + env(safe-area-inset-bottom, 0px)) !important; } /* never over the bar's buttons */
  body:has(.cls-sheet) #cyt-cookie-consent-bar { display: none !important; }
  .cls-mob-line { position: absolute; top: 0; left: 4px; width: calc((100% - 8px) / var(--n)); height: 3px; transform: translateX(calc(100% * var(--i))); transition: transform .24s cubic-bezier(.22,.8,.3,1); pointer-events: none; }
  .cls-mob-line::after { content: ""; display: block; width: 34px; height: 100%; margin: 0 auto; border-radius: 0 0 4px 4px; background: #d4a24c; }
  .cls-mob-item { flex: 1; min-width: 0; min-height: 58px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; padding: 8px 0 6px; color: #64748b !important; font-size: 11.5px; font-weight: 600; text-decoration: none !important; -webkit-tap-highlight-color: transparent; transition: color .18s ease; }
  .cls-mob-item:active .cls-mob-ic { transform: scale(.88); }
  .cls-mob-ic { display: grid; place-items: center; width: 48px; height: 28px; border-radius: 999px; transition: transform .18s ease, background .18s ease; }
  .cls-mob-ic svg { font-size: 24px; color: inherit; }
  .cls-mob-item.on { color: var(--g) !important; font-weight: 800; }
  .cls-mob-item.on .cls-mob-ic { background: #e3f4e9; }
  @media (prefers-reduced-motion: reduce) { .cls-mob, .cls-mob-line, .cls-mob-ic { transition: none; } }
  button.cls-mob-item { border: 0; background: none; font-family: inherit; cursor: pointer; }
  .cls-sheet-wrap { position: fixed; inset: 0; z-index: 1400; background: rgba(15,23,42,.45); display: flex; align-items: flex-end; }
  .cls-sheet { width: 100%; max-height: 88vh; overflow-y: auto; background: #fff; border-radius: 22px 22px 0 0; box-shadow: 0 -20px 50px -20px rgba(0,0,0,.35); animation: clsSheet .26s cubic-bezier(.2,.9,.3,1); }
  @keyframes clsSheet { from { transform: translateY(100%); } to { transform: none; } }
  .cls-grip { display: block; width: 42px; height: 5px; border-radius: 5px; background: #d6dfda; margin: 8px auto 0; }
  .cls-sheet-head { display: flex; align-items: center; gap: 12px; padding: 10px 16px 12px; border-bottom: 1px solid #eef2f0; }
  .cls-sheet-head > div { flex: 1; min-width: 0; }
  .cls-sheet-head b { display: block; font-size: 15px; } .cls-sheet-head > div > span { display: block; font-size: 12px; color: var(--mut); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .cls-sheet-head button { width: 36px; height: 36px; border-radius: 10px; border: 0; background: #f1f5f4; color: #334155; display: grid; place-items: center; cursor: pointer; }
  .cls-sheet-head > div > .cls-room { color: #b7791f; font-weight: 800; font-size: 12.5px; }
  .cls-av.big { width: 46px; height: 46px; border-radius: 14px; background: var(--g-bg); font-size: 16px; }
  /* eight to a page, four across: the rest are one swipe away */
  .cls-tiles-track { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; overscroll-behavior-x: contain; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
  .cls-tiles-track::-webkit-scrollbar { display: none; }
  .cls-tiles { flex: 0 0 100%; min-width: 0; scroll-snap-align: start; scroll-snap-stop: always; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); grid-auto-rows: min-content; align-content: start; gap: 12px 2px; padding: 12px 8px 6px; }
  .cls-dots { display: flex; justify-content: center; gap: 6px; padding: 2px 0 calc(10px + env(safe-area-inset-bottom, 0px)); }
  .cls-dots button { width: 7px; height: 7px; padding: 0; border: 0; border-radius: 7px; background: #d6dfda; cursor: pointer; transition: width .2s ease, background .2s ease; }
  .cls-dots button.on { width: 20px; background: #d4a24c; }
  .cls-tiles > * { min-width: 0; display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 2px; border: 0; background: none; color: #334155 !important; font: inherit; font-size: 12px; font-weight: 700; line-height: 1.2; text-align: center; text-decoration: none !important; cursor: pointer; -webkit-tap-highlight-color: transparent; }
  .cls-tile-ic { flex: none; width: 50px; height: 50px; border-radius: 16px; background: #f1f6f3; display: grid; place-items: center; }
  .cls-tile-ic svg { font-size: 24px; color: var(--g); }
  .cls-tile-tx { position: relative; padding-bottom: 4px; }
  /* the golden underline draws in from the left when tapped, and stays on the current page */
  .cls-tile-tx::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 2.5px; border-radius: 2px; background: #d4a24c; transform: scaleX(0); transform-origin: left; transition: transform .22s ease; }
  .cls-tiles > :hover .cls-tile-tx::after, .cls-tiles > :active .cls-tile-tx::after, .cls-tiles > :focus-visible .cls-tile-tx::after, .cls-tiles > .on .cls-tile-tx::after { transform: scaleX(1); }
  .cls-tiles > .on { color: var(--g) !important; font-weight: 800; }
  .cls-tiles > .on .cls-tile-ic { background: #e3f4e9; }
  .cls-tiles > .out { color: #dc2626 !important; }
  .cls-tiles > .out .cls-tile-ic { background: #fef2f2; }
  .cls-tiles > .out svg { color: #dc2626; }
  .cls-sheet { position: relative; }
  .cls-grip { position: absolute; top: 8px; left: 50%; width: 40px; height: 4px; margin: 0 0 0 -20px; border-radius: 4px; background: rgba(255,255,255,.45); }
  .cls-sheet-head { padding: 18px 14px 10px; border: 0; background: linear-gradient(100deg, #0b3320, #166534); color: #fff; }
  .cls-sheet-head b { color: #fff; }
  .cls-sheet-head > div > .cls-room { color: #f5c542; }
  .cls-sheet-head button { background: rgba(255,255,255,.14); color: #fff; }
}

/* ═══ App feel on phones + touch tablets (browser and installed app) — same look as the CYT admin app ═══ */
@media (max-width: 767px), (min-width: 768px) and (max-width: 1400px) and (hover: none) and (pointer: coarse) {
  html.cls-mini .cls .cls-main, .cls.flip .cls-main { padding: calc(var(--cls-h) + 14px) 16px calc(110px + env(safe-area-inset-bottom, 0px)); }
  .cls-main { max-width: none; }
  /* white top bar */
  .cls-bar { background: #fff; box-shadow: none; border-bottom: 1px solid rgba(0,0,0,.06); }
  .cls-burger { background: #f0f3f1; color: #1c1c1e; border-radius: 50%; margin-left: -4px; }
  .cls-burger:hover { background: #e6ebe8; }
  .cls-logo img { box-shadow: 0 0 0 1px #e4ece7; border-radius: 50%; }
  .cls-brand b { color: #1c1c1e; }
  .cls-brand { flex: 1; overflow: hidden; }
  .cls-brand b { overflow: hidden; text-overflow: ellipsis; font-size: 14px; }
  .cls-brand span { color: #1e8a4f; font-weight: 800; letter-spacing: .02em; text-transform: uppercase; font-size: 8.6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .cls-right { margin-left: 8px; }
  .cls-ic { color: #1c1c1e !important; background: #f0f3f1; border-radius: 50%; }
  .cls-right > :not(.cls-me) button, .cls-right > :not(.cls-me) a { color: #1c1c1e !important; }
  .cls-me-btn { color: #1c1c1e; }
  .cls-av { background: #14532d; color: #fff; border-radius: 50%; }

  /* bottom bar: app icons */
  .cls-mob-line { display: none; }
  .cls-mob { background: rgba(255,255,255,.94); -webkit-backdrop-filter: saturate(180%) blur(16px); backdrop-filter: saturate(180%) blur(16px); overflow: visible; }
  .cls-mob-item { position: relative; gap: 4px; font-size: 11px; font-weight: 700; color: #475569 !important; min-height: 66px; }
  .cls-mob-ic { width: 40px; height: 40px; border-radius: 12px; color: #fff; background: var(--tile, linear-gradient(160deg, #3fa66b, #14532d));
    box-shadow: 0 6px 12px -6px var(--tile-sh, rgba(11,63,38,.6)), inset 0 1px 0 rgba(255,255,255,.35); }
  .cls-mob-ic svg { font-size: 22px; color: #fff; }
  .cls-mob-item.on { color: #0b1712 !important; font-weight: 800; }
  .cls-mob-item.on .cls-mob-ic { background: var(--tile, linear-gradient(160deg, #3fa66b, #14532d)); transform: translateY(-2px); }
  .cls-mob-item.on::after { content: ""; position: absolute; bottom: 3px; left: 50%; width: 4px; height: 4px; margin-left: -2px; border-radius: 50%; background: #0b1712; opacity: .5; }
  .cls-mob-item[data-k="home"]      { --tile: linear-gradient(160deg, #4fd38b, #12804a); --tile-sh: rgba(18,128,74,.6); }
  .cls-mob-item[data-k="sessions"]  { --tile: linear-gradient(160deg, #5ab0ff, #1d63d8); --tile-sh: rgba(29,99,216,.65); }
  .cls-mob-item[data-k="explore"]   { --tile: linear-gradient(160deg, #ffc65a, #f07b12); --tile-sh: rgba(240,123,18,.6); }
  .cls-mob-item[data-k="shortlist"] { --tile: linear-gradient(160deg, #ff8aa6, #e0335e); --tile-sh: rgba(224,51,94,.6); }
  .cls-mob-item[data-k="more"]      { --tile: linear-gradient(160deg, #8e9aa6, #4b5662); --tile-sh: rgba(75,86,98,.6); }

  /* More sheet: colourful app icons */
  .cls-tile-ic { width: 56px; height: 56px; border-radius: 17px; background: var(--tile, linear-gradient(160deg, #4fd38b, #12804a));
    box-shadow: 0 10px 18px -10px var(--tile-sh, rgba(11,63,38,.6)), inset 0 1px 0 rgba(255,255,255,.35); }
  .cls-tile-ic svg { color: #fff !important; font-size: 26px; }
  .cls-tiles > .on .cls-tile-ic { background: var(--tile); box-shadow: 0 0 0 3px #fff, 0 0 0 5px rgba(20,83,45,.45); }
  .cls-tiles > :active .cls-tile-ic { transform: scale(.9); }
  .cls-tiles > * { color: #1f2a24 !important; }
  .cls-tile-tx { overflow-wrap: anywhere; -webkit-hyphens: auto; hyphens: auto; }
  .cls-tiles > :nth-child(8n+1) { --tile: linear-gradient(160deg, #5ab0ff, #1d63d8); --tile-sh: rgba(29,99,216,.6); }
  .cls-tiles > :nth-child(8n+2) { --tile: linear-gradient(160deg, #ffc65a, #f07b12); --tile-sh: rgba(240,123,18,.55); }
  .cls-tiles > :nth-child(8n+3) { --tile: linear-gradient(160deg, #b98cff, #6a3fd6); --tile-sh: rgba(106,63,214,.55); }
  .cls-tiles > :nth-child(8n+4) { --tile: linear-gradient(160deg, #4fd38b, #12804a); --tile-sh: rgba(18,128,74,.55); }
  .cls-tiles > :nth-child(8n+5) { --tile: linear-gradient(160deg, #ff8aa6, #e0335e); --tile-sh: rgba(224,51,94,.55); }
  .cls-tiles > :nth-child(8n+6) { --tile: linear-gradient(160deg, #4fd6d6, #0e8a9a); --tile-sh: rgba(14,138,154,.55); }
  .cls-tiles > :nth-child(8n+7) { --tile: linear-gradient(160deg, #ff9b6b, #e5532a); --tile-sh: rgba(229,83,42,.55); }
  .cls-tiles > :nth-child(8n+8) { --tile: linear-gradient(160deg, #7f9cff, #3b4fd1); --tile-sh: rgba(59,79,209,.55); }
  .cls-tiles > .out .cls-tile-ic { background: linear-gradient(160deg, #ff7a7a, #dc2626); box-shadow: 0 10px 18px -10px rgba(220,38,38,.6); }
  .cls-tiles > .out { color: #dc2626 !important; }

  /* My Space numbers: 2 x 2 white cards, coloured icon + title, tinted outline */
  .dw-stats { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 10px !important; }
  .dw-stat { flex-direction: column !important; align-items: flex-start !important; gap: 6px !important; padding: 12px 13px !important; border-radius: 18px !important;
    background: #fff; border: 1.5px solid var(--kc-b, #e3e8e5) !important; box-shadow: 0 1px 2px rgba(0,0,0,.04); }
  .dw-stat-ic { display: grid !important; width: 30px !important; height: 30px !important; border-radius: 50% !important; color: #fff !important; background: var(--kc, #16a34a) !important; }
  .dw-stat-ic svg { font-size: 17px !important; }
  .dw-stat b { font-size: 22px !important; color: #1c1c1e; }
  .dw-stat > div > span { font-size: 12px !important; font-weight: 700; color: var(--kc, #16a34a) !important; }
  .dw-stat:has(.dw-stat-ic.g) { --kc: #16a34a; --kc-b: #c6ead3; }
  .dw-stat:has(.dw-stat-ic.b) { --kc: #0a84ff; --kc-b: #c4dcfb; }
  .dw-stat:has(.dw-stat-ic.r) { --kc: #e5397a; --kc-b: #f6c9da; }
  .dw-stat:has(.dw-stat-ic.y) { --kc: #e08a00; --kc-b: #f3dcae; }

  /* opening a page from an icon */
  .cls-main.cls-zoom { transform-origin: var(--ox, 50%) var(--oy, 100%); animation: clsOpen .46s cubic-bezier(.16,1,.3,1) both; }
  @keyframes clsOpen { 0% { opacity: 0; transform: scale(.08); border-radius: 60px; } 35% { opacity: 1; } 100% { opacity: 1; transform: none; border-radius: 0; } }
}
/* iPad: Dock with big icons; the menu as a centred card */
@media (min-width: 768px) and (max-width: 1400px) and (hover: none) and (pointer: coarse) {
  .cls-mob { left: 50%; right: auto; width: auto; max-width: calc(100% - 40px); transform: translateX(-50%); gap: 14px; padding: 10px 14px 8px; border-radius: 30px; bottom: calc(14px + env(safe-area-inset-bottom, 0px)); }
  .cls-mob.away { transform: translate(-50%, calc(100% + 30px + env(safe-area-inset-bottom, 0px))); }
  .cls-mob-item { flex: none; width: 76px; min-height: 0; font-size: 12px; padding: 0; }
  .cls-mob-ic { width: 58px; height: 58px; border-radius: 18px; }
  .cls-mob-ic svg { font-size: 30px; }
  .cls-mob-item[data-k="more"] { margin-left: 6px; }
  .cls-mob-item[data-k="more"]::before { content: ""; position: absolute; left: -11px; top: 8px; bottom: 26px; width: 1px; background: rgba(20,83,45,.18); }
  .cls-mob-item.on::after { bottom: -6px; }
  .cls-sheet-wrap { justify-content: center; }
  .cls-sheet { width: min(760px, 100%); margin-bottom: calc(12px + env(safe-area-inset-bottom, 0px)); border-radius: 24px; }
  .cls-sheet-head { border-radius: 24px 24px 0 0; }
  .cls-tile-ic { width: 66px; height: 66px; border-radius: 20px; }
  .cls-tile-ic svg { font-size: 32px; }
  .cls-tiles > * { font-size: 13px; }
  .dw-stats { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
}
@media (prefers-reduced-motion: reduce) { .cls-main.cls-zoom { animation: none; } }

/* ═══ app bar like the CYT admin app (phones + touch tablets) ═══ */
.cls-app-title, .cls-app-site, .cls-clock, .cls-refresh, .dock-x { display: none !important; }
@media (max-width: 767px), (min-width: 768px) and (max-width: 1400px) and (hover: none) and (pointer: coarse) {
  .cls-burger, .cls-logo, .cls-brand { display: none !important; }
  .cls-bar { padding: 0 12px 0 16px; gap: 8px; }
  .cls-app-title { display: block !important; flex: 0 1 auto; min-width: 0; font-size: 24px; font-weight: 800; letter-spacing: -.03em; color: #1c1c1e; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .cls-right { margin-left: auto !important; gap: 8px; }
  .cls-refresh { display: grid !important; border: 0; cursor: pointer; }
  .cls-refresh.spin svg { animation: clsSpin .7s linear infinite; }
  @keyframes clsSpin { to { transform: rotate(360deg); } }
  .cls-right .cls-ic, .cls-right > :not(.cls-me):not(.cls-clock) button { width: 38px; height: 38px; border-radius: 50%; background: #f0f3f1; color: #1c1c1e !important; display: grid; place-items: center; }
  .cls-me-btn { padding: 0; height: 38px; }
  .cls-av { width: 38px; height: 38px; }
  /* More: white header like the admin's, 12 icons a page */
  .cls-sheet-head { background: #fff !important; color: #0b1712 !important; border-bottom: 1px solid #eef2f0 !important; padding: 20px 16px 12px !important; }
  .cls-sheet-head b { color: #0b1712 !important; font-size: 17px; }
  .cls-sheet-head > div > .cls-room { color: #1e8a4f !important; }
  .cls-sheet-head button { background: #f0f3f1 !important; color: #1c1c1e !important; border-radius: 50% !important; }
  .cls-grip { background: #d6dfda !important; }
  .cls-tiles { gap: 16px 4px; padding: 14px 10px 8px; }
}
@media (min-width: 768px) and (max-width: 1400px) and (hover: none) and (pointer: coarse) {
  .cls-app-site { display: inline-flex !important; margin: 3px auto 0 4px; color: #1e8a4f !important; font-size: 15px; font-weight: 800; letter-spacing: .06em; text-decoration: none !important; white-space: nowrap; }
  .cls-right { margin-left: 0 !important; }
  .cls-clock { display: inline-flex !important; align-items: baseline; gap: 1px; margin-right: 4px; padding: 4px 12px; border-radius: 14px; background: #f0f3f1;
    font-family: "SF Pro Rounded", ui-rounded, Inter, -apple-system, sans-serif; font-variant-numeric: tabular-nums; line-height: 1; }
  .cls-clock b { font-size: 26px; font-weight: 900; letter-spacing: -.02em; }
  .cls-clock .h { color: #1c1c1e; } .cls-clock .m { color: #1e8a4f; }
  .cls-clock i { font-style: normal; font-size: 24px; font-weight: 900; color: #d4a24c; margin: 0 1px; animation: clsBlink 1s steps(1) infinite; }
  .cls-clock small { font-size: 11px; font-weight: 800; color: #6e6e73; margin-left: 4px; letter-spacing: .04em; }
  @keyframes clsBlink { 50% { opacity: .25; } }
  /* the Dock fills the width: 3 extra favourites in portrait, 7 in landscape */
  .dock-x { display: flex !important; }
  .dock-x[data-i="3"], .dock-x[data-i="4"], .dock-x[data-i="5"], .dock-x[data-i="6"] { display: none !important; }
  .dock-x[data-i="0"] { --tile: linear-gradient(160deg, #b98cff, #6a3fd6); --tile-sh: rgba(106,63,214,.55); }
  .dock-x[data-i="1"] { --tile: linear-gradient(160deg, #4fd6d6, #0e8a9a); --tile-sh: rgba(14,138,154,.55); }
  .dock-x[data-i="2"] { --tile: linear-gradient(160deg, #7f9cff, #3b4fd1); --tile-sh: rgba(59,79,209,.55); }
  .dock-x[data-i="3"] { --tile: linear-gradient(160deg, #ff9b6b, #e5532a); --tile-sh: rgba(229,83,42,.55); }
  .dock-x[data-i="4"] { --tile: linear-gradient(160deg, #5ab0ff, #1d63d8); --tile-sh: rgba(29,99,216,.55); }
  .dock-x[data-i="5"] { --tile: linear-gradient(160deg, #ffc65a, #f07b12); --tile-sh: rgba(240,123,18,.55); }
  .dock-x[data-i="6"] { --tile: linear-gradient(160deg, #4fd38b, #12804a); --tile-sh: rgba(18,128,74,.55); }
  .cls-mob { gap: 10px; }
  .cls-mob-item { width: 80px; font-size: 11.5px; white-space: nowrap; }
  .cls-dock-l { display: block; max-width: 100%; overflow: hidden; text-overflow: ellipsis; }
}
@media (min-width: 768px) and (max-width: 1400px) and (hover: none) and (pointer: coarse) and (orientation: landscape) {
  .dock-x[data-i="3"], .dock-x[data-i="4"], .dock-x[data-i="5"], .dock-x[data-i="6"] { display: flex !important; }
}
`;
