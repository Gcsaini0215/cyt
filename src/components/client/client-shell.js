import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import useUserStore from "../../store/userStore";
import { isAuthenticated, removeToken, getDecodedToken } from "../../utils/jwt";
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
import AppsRoundedIcon from "@mui/icons-material/AppsRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import NorthEastRoundedIcon from "@mui/icons-material/NorthEastRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import ClientNotifications from "./client-notifications";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";

/* Client portal frame: green top bar, side menu on desktop / iPad, bottom bar + "More" sheet on
   phones. Sends logged-out visitors to /login and brings them back afterwards. */

export const CLIENT_NAV = [
  { to: "/my-dashboard", label: "My Space", Icon: HomeRoundedIcon, mob: true },
  { to: "/client/my-bookings", label: "My Sessions", short: "Sessions", Icon: EventAvailableRoundedIcon, mob: true },
  { to: "/client/find", label: "Find My Therapist", short: "Explore", Icon: PersonSearchRoundedIcon, mob: true },
  { to: "/client/favrioute-therapits", label: "My Shortlist", short: "Shortlist", Icon: FavoriteRoundedIcon, mob: true },
  { to: "/my-settings", label: "About Me", Icon: ManageAccountsRoundedIcon }, // phones: in "More"
];
// "Just for you" — public pages, so they open outside the portal (marked ↗). Never say "centre".
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
const TILES_PER_PAGE = 8;
const WA_HELP = "https://wa.me/918077757951?text=" + encodeURIComponent("Hi CYT team, I need help with my booking: ");
const RAIL_KEY = "cyt_cls_rail_mini";
// runs while the HTML is parsed, before the rail is painted
const RAIL_SCRIPT = `try{if(localStorage.getItem("${"cyt_cls_rail_mini"}")==="1")document.documentElement.classList.add("cls-mini")}catch(e){}`;
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function ClientShell({ title, children }) {
  const router = useRouter();
  const { userInfo } = useUserStore();
  const [ready, setReady] = useState(false);
  const [menu, setMenu] = useState(false);
  const [more, setMore] = useState(false); // phones: the "More" sheet
  const [checksOpen, setChecksOpen] = useState(false); // side menu: "How am I doing?" drop-down
  const [sheetPage, setSheetPage] = useState(0);
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
    if (window.matchMedia("(max-width: 767px)").matches) { setMore(true); return; } // phones: the menu sheet
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

  useEffect(() => {
    // isAuthenticated() also drops an expired token, before the page calls the API with it
    if (!isAuthenticated()) {
      router.replace(`/login?next=${encodeURIComponent(router.asPath)}`);
      return;
    }
    // a therapist account can't use the client pages (the API rejects it) — send it to its own dashboard
    if (getDecodedToken()?.role === 1) {
      router.replace("/therapist-dashboard");
      return;
    }
    setReady(true);
  }, [router]);
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
  useEffect(() => { if (more) setSheetPage(0); }, [more]);

  // phone "More" sheet: tiles in pages of 8 that slide sideways
  const tiles = [
    { to: "/my-settings", label: "About Me", Icon: ManageAccountsRoundedIcon },
    ...CHECK_NAV,
    ...HELP_NAV,
    { href: WA_HELP, label: "Talk to us", Icon: SupportAgentRoundedIcon, blank: true },
    { href: "/", label: "Website", Icon: LanguageRoundedIcon },
  ];
  const tilePages = [];
  for (let i = 0; i < tiles.length; i += TILES_PER_PAGE) tilePages.push(tiles.slice(i, i + TILES_PER_PAGE));
  const tilesRef = useRef(null);
  const onTilesScroll = (e) => { const el = e.currentTarget; setSheetPage(Math.round(el.scrollLeft / Math.max(1, el.clientWidth))); };
  const goTilePage = (i) => { const el = tilesRef.current; if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" }); };

  return (
    <div className={`cls${flip ? " flip" : ""}`}>
      <script dangerouslySetInnerHTML={{ __html: RAIL_SCRIPT }} />
      <Head><title>{title ? `${title} | Choose Your Therapist` : "My account | Choose Your Therapist"}</title></Head>
      <style dangerouslySetInnerHTML={{ __html: CLS_CSS }} />
      <header className="cls-bar">
        <button type="button" className="cls-burger" onClick={toggleRail} aria-label={flip ? "Expand menu" : "Collapse menu"} title="Menu"><MenuRoundedIcon /></button>
        <Link href="/my-dashboard" className="cls-logo" aria-label="Home"><img src="/cyt-emblem.png" alt="CYT" width={32} height={32} /></Link>
        <div className="cls-brand"><b>Choose Your Therapist</b><span>www.chooseyourtherapist.in</span></div>
        <div className="cls-right">
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
        {CLIENT_NAV.map(({ to, label, Icon }) => (
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
          <span className="cls-rail-h">Just for you</span>
          {HELP_NAV.map(({ to, label, Icon }) => (
            <Link key={to} href={to} className="cls-item sub" title={label}>
              <Icon /><span>{label}</span><NorthEastRoundedIcon className="cls-ext" />
            </Link>
          ))}
        </div>
        <div className="cls-rail-foot">
          <a href={WA_HELP} target="_blank" rel="noopener noreferrer" className="cls-item"><SupportAgentRoundedIcon /><span>Talk to us</span></a>
          <button type="button" className="cls-item out" onClick={logout}><LogoutRoundedIcon /><span>Log out</span></button>
        </div>
      </nav>

      <main className="cls-main">{ready ? children : null}</main>

      <nav className="cls-mob" aria-label="Quick menu">
        {CLIENT_NAV.filter((n) => n.mob).map(({ to, label, short, Icon }) => (
          <Link key={to} href={to} className={`cls-mob-item${active(to) ? " on" : ""}`}>
            <span className="cls-mob-ic"><Icon /></span>{short || label}
          </Link>
        ))}
        <button type="button" className={`cls-mob-item${more || active("/my-settings") || onChecks ? " on" : ""}`} onClick={() => setMore(true)} aria-haspopup="dialog" aria-expanded={more}>
          <span className="cls-mob-ic"><AppsRoundedIcon /></span>More
        </button>
      </nav>

      {/* phones: everything else, as a sheet of tiles (same pattern as the therapist portal) */}
      {more && (
        <div className="cls-sheet-wrap" onClick={(e) => { if (e.target === e.currentTarget) setMore(false); }}>
          <div className="cls-sheet" role="dialog" aria-modal="true" aria-label="More">
            <span className="cls-grip" aria-hidden="true" />
            <div className="cls-sheet-head">
              <span className="cls-av big">{photo ? <img src={photo} alt="" onError={() => setPhotoFailed(true)} /> : initials}</span>
              <div><b>{name || "My account"}</b><span className="cls-room">My therapy room</span></div>
              <button type="button" onClick={() => setMore(false)} aria-label="Close"><CloseRoundedIcon /></button>
            </div>
            <div className="cls-tiles-track" ref={tilesRef} onScroll={onTilesScroll}>
              {tilePages.map((pageTiles, k) => (
                <div key={k} className="cls-tiles">
                  {pageTiles.map(({ to, href, label, Icon, blank }) => (to ? (
                    <Link key={label} href={to} className={active(to) ? "on" : ""}><span><Icon /></span>{label}</Link>
                  ) : (
                    <a key={label} href={href} {...(blank ? { target: "_blank", rel: "noopener noreferrer" } : {})}><span><Icon /></span>{label}</a>
                  )))}
                </div>
              ))}
            </div>
            {tilePages.length > 1 && (
              <div className="cls-dots" role="tablist" aria-label="Menu pages">
                {tilePages.map((_, k) => (
                  <button key={k} type="button" role="tab" className={k === sheetPage ? "on" : ""} onClick={() => goTilePage(k)} aria-label={`Page ${k + 1}`} aria-selected={k === sheetPage} />
                ))}
              </div>
            )}
            <div className="cls-sheet-foot">
              <button type="button" onClick={logout}><LogoutRoundedIcon /> Log out</button>
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
.cls-rail > *, .cls-rail .cls-item { flex-shrink: 0; } /* the menu scrolls when the drop-down opens — items never squeeze */
.cls-item { display: flex; align-items: center; gap: 12px; height: 44px; padding: 0 12px; border-radius: 12px; color: #475569 !important; font-size: 14.5px; font-weight: 700;
  text-decoration: none !important; border: 0; background: none; cursor: pointer; font-family: inherit; width: 100%; text-align: left; }
.cls-item svg { color: #64748b; }
.cls-item:hover { background: #e7f6ec; color: var(--g) !important; } .cls-item:hover svg { color: var(--g); }
.cls-item.on { background: linear-gradient(135deg, #14532d, #16a34a); color: #fff !important; box-shadow: 0 6px 14px -6px rgba(22,101,52,.6); }
.cls-item.on svg { color: #fff; }
.cls-item.out { color: #dc2626 !important; } .cls-item.out svg { color: #dc2626; }
.cls-dd-group { display: flex; flex-direction: column; gap: 2px; }
.cls-chev { margin-left: auto; font-size: 19px !important; color: #94a3b8 !important; transition: transform .18s ease; }
.cls-dd-group.open .cls-chev { transform: rotate(180deg); }
.cls-dd-kids { display: flex; flex-direction: column; gap: 2px; margin-left: 14px; padding-left: 6px; border-left: 2px solid #e4ece7; }
.cls-item.kid { height: 38px; font-size: 13.5px; font-weight: 600; padding: 0 10px; gap: 10px; white-space: nowrap; }
.cls-item.kid svg { font-size: 18px; }
.cls-item.kid.on { box-shadow: none; background: #e7f6ec; color: var(--g) !important; } .cls-item.kid.on svg { color: var(--g); }
.cls-rail-group { margin-top: 14px; padding-top: 12px; border-top: 1px solid #eef2f0; display: flex; flex-direction: column; gap: 2px; }
.cls-rail-h { font-size: 11px; font-weight: 800; letter-spacing: .5px; text-transform: uppercase; color: var(--faint); padding: 0 12px 6px; }
.cls-item.sub { height: 40px; font-size: 13.5px; font-weight: 600; }
.cls-item.sub svg { font-size: 19px; }
.cls-item .cls-ext { margin-left: auto; font-size: 15px !important; color: #cbd5e1 !important; }
.cls-item.sub:hover .cls-ext { color: var(--g) !important; }
.cls-rail-foot { margin-top: auto; padding-top: 10px; border-top: 1px solid #eef2f0; display: flex; flex-direction: column; gap: 3px; }
.cls-main { padding: calc(var(--cls-h) + 24px) 32px 40px 264px; max-width: 1480px; }
.cls-mob { display: none; }
@media (max-width: 1023px) {
  .cls-rail { width: 76px; padding: 12px 10px; }
  .cls-item { justify-content: center; padding: 0; } .cls-item span, .cls-item .cls-ext, .cls-rail-h, .cls-chev { display: none; }
  .cls-dd-kids { margin-left: 0; padding-left: 0; border-left: 0; background: #f4f8f5; border-radius: 12px; }
  .cls-item.kid { padding: 0; }
  .cls-rail-group { margin-top: 10px; padding-top: 10px; }
  .cls-main { padding: calc(var(--cls-h) + 20px) 24px 40px 100px; }
}
/* ☰ on desktop: icons-only rail */
@media (min-width: 1024px) {
  html.cls-mini .cls .cls-rail { width: 76px; padding: 12px 10px; }
  html.cls-mini .cls .cls-item { justify-content: center; padding: 0; }
  html.cls-mini .cls .cls-item span, html.cls-mini .cls .cls-item .cls-ext, html.cls-mini .cls .cls-rail-h, html.cls-mini .cls .cls-chev { display: none; }
  html.cls-mini .cls .cls-dd-kids { margin-left: 0; padding-left: 0; border-left: 0; background: #f4f8f5; border-radius: 12px; }
  html.cls-mini .cls .cls-item.kid { padding: 0; }
  html.cls-mini .cls .cls-main { padding-left: 100px; max-width: 1348px; }
}
/* ☰ on a tablet: the full menu over the page */
@media (min-width: 768px) and (max-width: 1023px) {
  .cls.flip .cls-rail { width: 232px; padding: 14px 12px; box-shadow: 18px 0 40px -20px rgba(4,30,16,.35); }
  .cls.flip .cls-item { justify-content: flex-start; padding: 0 12px; }
  .cls.flip .cls-item span { display: inline; } .cls.flip .cls-item .cls-ext, .cls.flip .cls-chev { display: block; } .cls.flip .cls-rail-h { display: block; }
  .cls.flip .cls-dd-kids { margin-left: 14px; padding-left: 6px; border-left: 2px solid #e4ece7; background: none; }
  .cls.flip .cls-item.kid { padding: 0 10px; }
}
html.cls-anim .cls-rail, html.cls-anim .cls-main { transition: width .2s ease, padding .2s ease; }
@media (max-width: 767px) {
  .hide-sm { display: none !important; }
  .cls-bar { padding: 0 12px; }
  .cls-rail { display: none; }
  .cls-main { padding: calc(var(--cls-h) + 14px) 16px calc(88px + env(safe-area-inset-bottom, 0px)); }
  .cls-mob { display: flex; position: fixed; left: 0; right: 0; bottom: 0; z-index: 1200; gap: 2px; padding: 6px 6px calc(6px + env(safe-area-inset-bottom, 0px));
    background: rgba(255,255,255,.97); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border-top: 1px solid var(--line); box-shadow: 0 -6px 20px -12px rgba(4,22,14,.2); }
  .cls-mob-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; color: #64748b !important; font-size: 10.5px; font-weight: 700; text-decoration: none !important; padding: 4px 0; }
  .cls-mob-ic { width: 52px; height: 30px; border-radius: 999px; display: grid; place-items: center; }
  .cls-mob-ic svg { font-size: 23px; }
  .cls-mob-item.on { color: var(--g) !important; }
  .cls-mob-item.on .cls-mob-ic { background: #166534; box-shadow: 0 4px 12px -4px rgba(22,101,52,.55); }
  .cls-mob-item.on .cls-mob-ic svg { color: #fff; }
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
  .cls-tiles-track { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; overscroll-behavior-x: contain; }
  .cls-tiles-track::-webkit-scrollbar { display: none; }
  .cls-tiles { flex: 0 0 100%; scroll-snap-align: start; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); grid-auto-rows: min-content; gap: 16px 6px; padding: 16px 12px 14px; align-content: start; }
  .cls-dots { display: flex; justify-content: center; gap: 6px; padding: 0 0 12px; }
  .cls-dots button { width: 7px; height: 7px; padding: 0; border-radius: 7px; border: 0; background: #d6dfda; cursor: pointer; transition: width .2s ease, background .2s ease; }
  .cls-dots button.on { width: 20px; background: #166534; }
  .cls-tiles a { display: flex; flex-direction: column; align-items: center; gap: 6px; font-size: 11.5px; font-weight: 700; color: #334155 !important; text-align: center; line-height: 1.25; text-decoration: none !important; }
  .cls-tiles a > span { width: 52px; height: 52px; border-radius: 16px; background: #f1f6f3; display: grid; place-items: center; }
  .cls-tiles a svg { font-size: 24px; color: var(--g); }
  .cls-tiles a.on { color: var(--g) !important; } .cls-tiles a.on > span { background: #dff3e6; box-shadow: inset 0 0 0 1.5px #a7d7b8; }
  .cls-sheet-foot { padding: 10px 14px calc(12px + env(safe-area-inset-bottom, 0px)); border-top: 1px solid #eef2f0; }
  .cls-sheet-foot button { width: 100%; height: 44px; border-radius: 12px; border: 1.5px solid #fecaca; background: #fff; color: #dc2626; font-weight: 800; font-size: 14px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer; font-family: inherit; }
}
`;
