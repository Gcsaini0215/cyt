import React, { useEffect, useRef, useState } from "react";
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

/* Client portal frame: green top bar, side menu on desktop / iPad, bottom bar on phones.
   Sends logged-out visitors to /login and brings them back afterwards. */

export const CLIENT_NAV = [
  { to: "/my-dashboard", label: "Home", Icon: HomeRoundedIcon, mob: true },
  { to: "/client/my-bookings", label: "My Sessions", short: "Sessions", Icon: EventAvailableRoundedIcon, mob: true },
  { to: "/client/find", label: "Find a Therapist", short: "Find", Icon: PersonSearchRoundedIcon, mob: true },
  { to: "/client/favrioute-therapits", label: "Saved Therapists", short: "Saved", Icon: FavoriteRoundedIcon, mob: true },
  { to: "/my-settings", label: "Profile", Icon: ManageAccountsRoundedIcon, mob: true },
];
const WA_HELP = "https://wa.me/918077757951?text=" + encodeURIComponent("Hi CYT team, I need help with my booking: ");

export default function ClientShell({ title, children }) {
  const router = useRouter();
  const { userInfo } = useUserStore();
  const [ready, setReady] = useState(false);
  const [menu, setMenu] = useState(false);
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
  useEffect(() => { setMenu(false); }, [router.pathname]);

  // ask first — a stray tap on a phone should never log anyone out
  const logout = () => {
    setMenu(false);
    if (!window.confirm("Log out of your account?")) return;
    removeToken();
    router.push("/login");
  };
  const name = userInfo?.name || "";
  const pf = userInfo?.profile || "";
  const photo = !pf || pf.startsWith("blob:") ? "" : /^https?:/.test(pf) ? pf : `${imagePath}/${pf}`;
  const initials = (name || "U").split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const active = (to) => router.pathname === to;

  return (
    <div className="cls">
      <Head><title>{title ? `${title} | Choose Your Therapist` : "My account | Choose Your Therapist"}</title></Head>
      <style dangerouslySetInnerHTML={{ __html: CLS_CSS }} />
      <header className="cls-bar">
        <Link href="/my-dashboard" className="cls-logo" aria-label="Home"><img src="/cyt-emblem.png" alt="CYT" width={32} height={32} /></Link>
        <div className="cls-brand"><b>Choose Your Therapist</b><span>Your space</span></div>
        <div className="cls-right">
          <a href="/" className="cls-ic hide-sm" title="Go to website" aria-label="Go to website"><LanguageRoundedIcon /></a>
          <div className="cls-me" ref={menuRef}>
            <button type="button" className="cls-me-btn" onClick={() => setMenu((m) => !m)} aria-haspopup="menu" aria-expanded={menu}>
              <span className="cls-av">{photo ? <img src={photo} alt="" /> : initials}</span>
              <span className="cls-me-name hide-sm">{name || "My account"}</span>
              <KeyboardArrowDownRoundedIcon className="hide-sm" />
            </button>
            {menu && (
              <div className="cls-dd" role="menu">
                <div className="cls-dd-head"><b>{name || "My account"}</b><span>{userInfo?.email || ""}</span></div>
                <Link href="/my-settings"><ManageAccountsRoundedIcon /> Profile</Link>
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
        <div className="cls-rail-foot">
          <a href={WA_HELP} target="_blank" rel="noopener noreferrer" className="cls-item"><SupportAgentRoundedIcon /><span>Help</span></a>
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
      </nav>
    </div>
  );
}

const CLS_CSS = `
:root { --cls-h: 60px; }
.cls { --g: #166534; --g-dk: #0f3d24; --g-bg: #e7f6ec; --line: #e4ece7; --ink: #0f172a; --mut: #64748b; --faint: #94a3b8;
  font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; color: var(--ink); min-height: 100vh;
  background: linear-gradient(180deg, #e9f3ec 0, #f1f6f2 320px, #f3f6f4 100%); }
.cls *, .cls *::before, .cls *::after { box-sizing: border-box; }
.cls svg { font-size: 20px; }
.cls-bar { position: fixed; top: 0; left: 0; right: 0; z-index: 1200; height: var(--cls-h); display: flex; align-items: center; gap: 12px; padding: 0 16px;
  background: linear-gradient(90deg, #0b3320 0%, #14532d 55%, #166534 100%); box-shadow: 0 6px 18px -10px rgba(4,30,16,.55); }
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
.cls-item { display: flex; align-items: center; gap: 12px; height: 44px; padding: 0 12px; border-radius: 12px; color: #475569 !important; font-size: 14.5px; font-weight: 700;
  text-decoration: none !important; border: 0; background: none; cursor: pointer; font-family: inherit; width: 100%; text-align: left; }
.cls-item svg { color: #64748b; }
.cls-item:hover { background: #e7f6ec; color: var(--g) !important; } .cls-item:hover svg { color: var(--g); }
.cls-item.on { background: linear-gradient(135deg, #14532d, #16a34a); color: #fff !important; box-shadow: 0 6px 14px -6px rgba(22,101,52,.6); }
.cls-item.on svg { color: #fff; }
.cls-item.out { color: #dc2626 !important; } .cls-item.out svg { color: #dc2626; }
.cls-rail-foot { margin-top: auto; padding-top: 10px; border-top: 1px solid #eef2f0; display: flex; flex-direction: column; gap: 3px; }
.cls-main { padding: calc(var(--cls-h) + 24px) 32px 40px 264px; max-width: 1480px; }
.cls-mob { display: none; }
@media (max-width: 1023px) {
  .cls-rail { width: 76px; padding: 12px 10px; }
  .cls-item { justify-content: center; padding: 0; } .cls-item span { display: none; }
  .cls-main { padding: calc(var(--cls-h) + 20px) 24px 40px 100px; }
}
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
}
`;
