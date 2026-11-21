import SpaRoundedIcon from "@mui/icons-material/SpaRounded";
import SelfImprovementRoundedIcon from "@mui/icons-material/SelfImprovementRounded";
import HandymanRoundedIcon from "@mui/icons-material/HandymanRounded";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useNavBadges, NavBadge, NavTag, useAssessmentsUpgrade, useOwnedUpgrades, NX_CSS } from "./nav-extras";

import MonitorHeartRoundedIcon from "@mui/icons-material/MonitorHeartRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import StarRateRoundedIcon from "@mui/icons-material/StarRateRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import FolderSharedRoundedIcon from "@mui/icons-material/FolderSharedRounded";
import EventNoteRoundedIcon from "@mui/icons-material/EventNoteRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import CurrencyRupeeRoundedIcon from "@mui/icons-material/CurrencyRupeeRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import QrCode2RoundedIcon from "@mui/icons-material/QrCode2Rounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import QuestionAnswerRoundedIcon from "@mui/icons-material/QuestionAnswerRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";

/* Every therapist-portal page, grouped, in order of how often it's used:
     Practice (daily work) > Grow (reputation + new clients) > Money (payouts + plan) > ✦ Upgrade (gold box) > Account (bottom)
   Items marked `hidden` are switched off for now (pages exist but aren't in the menu yet) — remove the flag to show them.
   `match` lists the route prefixes that count as "this item" so sub-pages (e.g. /coupon/create) keep their menu item
   highlighted. Once the therapist owns an upgrade (`owns`), the item moves up into its `home` group (groupsFor). */
const ALL_GROUPS = [
  {
    title: "Practice",
    items: [
      { to: "/therapist-dashboard", Icon: MonitorHeartRoundedIcon, label: "Dashboard" },
      { to: "/appointments", Icon: EventAvailableRoundedIcon, label: "Appointments", badgeKey: "bookings" },
      { to: "/my-schedule", Icon: CalendarMonthRoundedIcon, label: "My Schedule" },
      // CBT worksheets clients fill online + share links that book this therapist (pages/therapists/toolkit.js)
      { to: "/therapists/toolkit", Icon: HandymanRoundedIcon, label: "Toolkit" },
      { to: "/therapists/brain-explorer", Icon: PsychologyRoundedIcon, label: "Brain Explorer" },
      { to: "/clinic-patients", Icon: GroupsRoundedIcon, label: "Clients", hidden: true, match: ["/clinic-patients", "/add-offline-client"] },
      { to: "/case-history", Icon: FolderSharedRoundedIcon, label: "Case History", hidden: true, match: ["/case-history", "/create-report"] },
      { to: "/therapists/notifications", Icon: NotificationsActiveRoundedIcon, label: "Notifications", badgeKey: "inbox" },
    ],
  },
  {
    title: "Grow",
    items: [
      { to: "/therapists/reviews", Icon: StarRateRoundedIcon, label: "Reviews", badgeKey: "reviews" },
      // their own short booking link, QR code and "Scan to book" poster (pages/therapists/my-link.js) — free for everyone
      { to: "/therapists/my-link", Icon: QrCode2RoundedIcon, label: "My booking link" },
      // one tweet-style post with their own words, photo and booking link (pages/therapists/social-posts.js) — free
      { to: "/therapists/social-posts", Icon: CampaignRoundedIcon, label: "Social posts" },
      // anonymous client questions — good answers go public on /ask-a-psychologist with a Book button (pages/therapists/questions.js)
      { to: "/therapists/questions", Icon: QuestionAnswerRoundedIcon, label: "Client questions" },
      // set up their own Google Business Profile ("psychologist near me") with the CYT booking link (pages/therapists/google-listing.js)
      { to: "/therapists/google-listing", Icon: PlaceRoundedIcon, label: "Google Maps listing" },
      // certificates for sessions / 4★+ reviews / time on CYT (pages/therapists/achievements.js)
      { to: "/therapists/achievements", Icon: EmojiEventsRoundedIcon, label: "Achievements" },
      { to: "/workshops", Icon: EventNoteRoundedIcon, label: "Workshops", hidden: true, match: ["/workshops", "/create-workshop", "/update-workshop"] },
      { to: "/therapist-blogs", Icon: ArticleRoundedIcon, label: "Blogs", hidden: true, match: ["/therapist-blogs", "/therapist-ai-blog"] },
    ],
  },
  {
    title: "Money",
    items: [
      { to: "/therapists/payouts", Icon: AccountBalanceWalletRoundedIcon, label: "Payouts" },
      { to: "/therapists/invoices", Icon: ReceiptLongRoundedIcon, label: "Invoices", hidden: true },
      { to: "/my-plans", Icon: WorkspacePremiumRoundedIcon, label: "Subscriptions" },
    ],
  },
  {
    title: "Upgrade",
    upgrade: true,
    items: [
      { to: "/therapist-questionnaires", Icon: FactCheckRoundedIcon, label: "Assessments", owns: "assessments", home: "Practice", match: ["/therapist-questionnaires", "/assessment-report"] },
      { to: "/coupons", Icon: LocalOfferRoundedIcon, label: "Coupons", owns: "coupons", home: "Money", match: ["/coupons", "/coupon/"] },
    ],
  },
  {
    // settings and help sit at the bottom, as in most apps
    title: "Account",
    items: [
      // private period + mood tracker for the therapist themself (pages/therapists/cycle.js)
      { to: "/therapists/cycle", Icon: SpaRoundedIcon, label: "Cycle & Mood" },
      // private countertransference journal for the therapist themself (pages/therapists/reflection.js)
      { to: "/therapists/reflection", Icon: SelfImprovementRoundedIcon, label: "Reflection journal" },
      { to: "/settings", Icon: ManageAccountsRoundedIcon, label: "Settings", badgeKey: "settings", match: ["/settings", "/therapists/change-password"] },
      { to: "/therapists/help", Icon: SupportAgentRoundedIcon, label: "Help & support" },
    ],
  },
];
export const NAV_GROUPS = ALL_GROUPS.map((g) => ({ ...g, items: g.items.filter((i) => !i.hidden) })).filter((g) => g.items.length);
export const NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

// owned = { assessments: true, coupons: true } (useOwnedUpgrades) → bought upgrades leave the gold group
export const groupsFor = (owned = {}, groups = NAV_GROUPS) => {
  const moving = groups.flatMap((g) => (g.upgrade ? g.items.filter((i) => i.owns && owned[i.owns]) : []));
  if (!moving.length) return groups;
  return groups
    .map((g) => (g.upgrade
      ? { ...g, items: g.items.filter((i) => !moving.includes(i)) }
      : { ...g, items: [...g.items, ...moving.filter((i) => i.home === g.title)] }))
    .filter((g) => g.items.length);
};

// The phone / tablet menu also has shortcuts straight into My Schedule's setup tabs
// (never highlighted as the current page — My Schedule itself is).
const SETUP_SHORTCUTS = [
  { to: "/my-schedule?tab=fees", Icon: CurrencyRupeeRoundedIcon, label: "Session fees", match: [] },
  { to: "/my-schedule?tab=availability", Icon: ScheduleRoundedIcon, label: "Weekly hours", match: [] },
];
const withShortcuts = (groups) => groups.map((g) => {
  const at = g.items.findIndex((i) => i.to === "/my-schedule");
  return at < 0 ? g : { ...g, items: [...g.items.slice(0, at + 1), ...SETUP_SHORTCUTS, ...g.items.slice(at + 1)] };
});
export const DRAWER_GROUPS = withShortcuts(NAV_GROUPS);
export const drawerGroupsFor = (owned) => withShortcuts(groupsFor(owned));
/* Desktop rail: every page has its own colourful app icon, the same colours as the phone / iPad bottom bar
   (Home blue, Appointments orange, Schedule teal, Settings purple). Upgrade items are gold. */
const G = (a, b, sh) => ({ "--tile": `linear-gradient(160deg, ${a}, ${b})`, "--tile-sh": sh });
export const TILES = {
  "/therapist-dashboard": G("#5ab0ff", "#1d63d8", "rgba(29,99,216,.6)"),
  "/appointments": G("#ffc65a", "#f07b12", "rgba(240,123,18,.55)"),
  "/my-schedule": G("#4fd6d6", "#0e8a9a", "rgba(14,138,154,.55)"),
  "/therapists/toolkit": G("#ff9b6b", "#e5532a", "rgba(229,83,42,.55)"),
  "/therapists/brain-explorer": G("#ff8ab4", "#d6336c", "rgba(214,51,108,.5)"),
  "/therapists/notifications": G("#ff8aa6", "#e0335e", "rgba(224,51,94,.55)"),
  "/therapists/reviews": G("#ffd66b", "#e09a12", "rgba(224,154,18,.55)"),
  "/therapists/my-link": G("#7f9cff", "#3b4fd1", "rgba(59,79,209,.55)"),
  "/therapists/social-posts": G("#c58cff", "#8a3fd6", "rgba(138,63,214,.55)"),
  "/therapists/questions": G("#5ad1ff", "#0b84c6", "rgba(11,132,198,.55)"),
  "/therapists/google-listing": G("#5fdc8f", "#16924f", "rgba(22,146,79,.55)"),
  "/therapists/achievements": G("#ffb36b", "#d9661c", "rgba(217,102,28,.55)"),
  "/therapists/payouts": G("#4fd38b", "#12804a", "rgba(18,128,74,.55)"),
  "/my-plans": G("#8f8cff", "#5146d6", "rgba(81,70,214,.55)"),
  "/therapist-questionnaires": G("#4fc3d6", "#0e7490", "rgba(14,116,144,.55)"),
  "/coupons": G("#ff8ac2", "#d6338a", "rgba(214,51,138,.55)"),
  "/therapists/cycle": G("#ff9ec7", "#d63f86", "rgba(214,63,134,.55)"),
  "/therapists/reflection": G("#8f9cff", "#5146d6", "rgba(81,70,214,.55)"),
  "/settings": G("#b98cff", "#6a3fd6", "rgba(106,63,214,.55)"),
  "/therapists/help": G("#8e9aa6", "#4b5662", "rgba(75,86,98,.55)"),
};
const GOLD = G("#f6d27a", "#c9962c", "rgba(201,150,44,.6)");
export const tileOf = (item, up = false) => (up ? GOLD : TILES[item.to] || G("#4fd38b", "#12804a", "rgba(18,128,74,.55)"));

export const isActive = (item, pathname) => (item.match || [item.to]).some((m) => pathname === m || pathname.startsWith(m.endsWith("/") ? m : `${m}/`));

/* Desktop / iPad rail: icons only by default, or icons + labels when widened from the
   top bar's menu button (remembered per device; _document.js applies it before first paint).
   Hidden on phones (bottom nav + drawer there). */
export default function TherapistSideNav() {
  const router = useRouter();
  const pathname = router.pathname;
  const upgrade = useAssessmentsUpgrade();
  const badges = useNavBadges();
  const groups = groupsFor(useOwnedUpgrades());
  // icon-only rail: the label shows in a tooltip drawn outside the rail (the rail scrolls, so a
  // tooltip inside it was cut off)
  const [tip, setTip] = React.useState(null);
  const showTip = (e, label) => {
    const rail = e.currentTarget.closest(".tsn-rail");
    if (rail && rail.offsetWidth > 100) return; // labels are showing
    const r = e.currentTarget.getBoundingClientRect();
    setTip({ label, top: r.top + r.height / 2, left: r.right + 12 });
  };
  const hideTip = () => setTip(null);
  React.useEffect(() => { setTip(null); }, [pathname]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: RAIL_CSS + NX_CSS }} />
      <nav className="tsn-rail" aria-label="Therapist menu" onScroll={hideTip}>
        {groups.map((g, gi) => (
          <div key={g.title} className={`tsn-group${g.upgrade ? " up" : ""}`}>
            {gi > 0 && <span className="tsn-sep" aria-hidden="true" />}
            <span className="tsn-gtitle">{g.upgrade && <i aria-hidden="true">✦</i>}{g.title}</span>
            {g.items.map((item) => {
              const active = isActive(item, pathname);
              return (
                <Link key={item.to} href={item.to} aria-label={item.label}
                  aria-current={active ? "page" : undefined} className={`tsn-item${active ? " active" : ""}`}
                  onMouseEnter={(e) => showTip(e, item.label)} onMouseLeave={hideTip} onFocus={(e) => showTip(e, item.label)} onBlur={hideTip}>
                  <span className="tsn-ic" style={tileOf(item, g.upgrade)}><item.Icon /></span>
                  <span className="tsn-label">{item.label}<NavTag item={item} upgrade={upgrade} /></span>
                  <NavBadge value={badges[item.badgeKey]} className="tsn-badge" />
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      {tip && <span className="tsn-tip" role="tooltip" style={{ top: tip.top, left: tip.left }}>{tip.label}</span>}
    </>
  );
}

const RAIL_CSS = `
/* Desktop rail, app style (2026-11-17): white, each page a colourful app icon. Icons only by default;
   icons + labels when widened from the top bar's menu button. */
.tsn-rail {
  position: fixed; left: 0; top: var(--tn-h, 56px); bottom: 0; z-index: 1100;
  width: 76px; background: #fff; border-right: 1px solid rgba(15,23,42,.07);
  display: flex; flex-direction: column; align-items: stretch; padding: 14px 12px 18px; gap: 4px;
  overflow-y: auto; overflow-x: hidden; scrollbar-width: none;
}
.tsn-rail::-webkit-scrollbar { display: none; }
/* width animates only while the menu button is pressed (html.tsn-anim, set in top-nav.js) */
html.tsn-anim .tsn-rail { transition: width .22s cubic-bezier(.2,.8,.2,1); }
.tsn-group { display: flex; flex-direction: column; gap: 4px; }
.tsn-sep { display: block; height: 1px; background: #eef2f0; margin: 8px; flex-shrink: 0; }
.tsn-gtitle { display: none; font-size: 11px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: #8a94a0; padding: 10px 10px 4px; white-space: nowrap; }
.tsn-item {
  position: relative; height: 48px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; gap: 12px;
  border-radius: 14px; color: #1f2937; text-decoration: none !important; padding: 0 6px; outline: none;
  transition: background .15s ease, color .15s ease;
}
.tsn-ic { position: relative; flex: none; width: 36px; height: 36px; border-radius: 11px; display: grid; place-items: center;
  background: var(--tile, linear-gradient(160deg, #4fd38b, #12804a)); box-shadow: 0 6px 12px -7px var(--tile-sh, rgba(18,128,74,.55)), inset 0 1px 0 rgba(255,255,255,.35);
  transition: transform .15s ease, box-shadow .15s ease; }
.tsn-ic svg { font-size: 20px; color: #fff; }
.tsn-item:hover { background: #f3f6f4; color: #0b1712; }
.tsn-item:hover .tsn-ic { transform: translateY(-1px) scale(1.05); }
.tsn-item:focus-visible { box-shadow: 0 0 0 2px #fff, 0 0 0 4px #16a34a; }
/* the current page: a soft green pill, a ring round its icon and a gold mark on the rail edge */
.tsn-item.active, .tsn-item.active:hover { background: #e9f5ee; color: #14532d; }
.tsn-item.active .tsn-ic { box-shadow: 0 0 0 2px #fff, 0 0 0 4px rgba(20,83,45,.38); transform: none; }
.tsn-item.active::before { content: ""; position: absolute; left: -12px; top: 11px; bottom: 11px; width: 4px; border-radius: 0 4px 4px 0; background: #e3a83a; }
.tsn-label { display: none; align-items: center; gap: 6px; font-size: 14px; font-weight: 650; white-space: nowrap; min-width: 0; }
.tsn-item.active .tsn-label { font-weight: 800; }
.tsn-item .tsn-badge.nx-badge { position: absolute; top: 1px; right: 2px; min-width: 18px; height: 18px; padding: 0 4px; font-size: 10px; border: 2px solid #fff; z-index: 2; }
.tsn-item .tsn-badge.nx-dot { position: absolute; top: 6px; right: 9px; z-index: 2; }

/* Upgrade group: paid add-ons, gold */
.tsn-group.up .tsn-sep { background: linear-gradient(90deg, transparent, #e6cf8f, transparent); }
.tsn-group.up .tsn-gtitle { color: #a37a16; display: none; }
.tsn-group.up .tsn-gtitle i { font-style: normal; margin-right: 5px; color: #d4a12f; }
.tsn-group.up .tsn-item:not(.active) { color: #7a5a10; }
.tsn-group.up .tsn-item:not(.active):hover { background: #fdf6e3; }

/* icon-only rail: tooltip outside the rail */
.tsn-tip { position: fixed; z-index: 1200; transform: translateY(-50%); background: #0f172a; color: #fff; font-size: 12.5px; font-weight: 600;
  padding: 6px 11px; border-radius: 8px; white-space: nowrap; box-shadow: 0 10px 28px rgba(15,23,42,.28); pointer-events: none; animation: tsnTip .12s ease-out; }
.tsn-tip::before { content: ""; position: absolute; left: -4px; top: 50%; width: 8px; height: 8px; margin-top: -4px; background: #0f172a; transform: rotate(45deg); }
@keyframes tsnTip { from { opacity: 0; margin-left: -4px; } to { opacity: 1; margin-left: 0; } }

/* widened rail: labels + group titles */
html[data-tsn-wide] .tsn-rail { width: 248px; }
html[data-tsn-wide] .tsn-item { justify-content: flex-start; padding: 0 8px; }
html[data-tsn-wide] .tsn-label { display: inline-flex; }
html[data-tsn-wide] .tsn-gtitle, html[data-tsn-wide] .tsn-group.up .tsn-gtitle { display: block; }
html[data-tsn-wide] .tsn-sep { display: none; }
html[data-tsn-wide] .tsn-group.up { margin: 8px 0 2px; padding: 4px 6px 6px; border-radius: 16px; background: linear-gradient(160deg, #fffaf0, #fdf3dc); border: 1px solid #f0e2b8; }
html[data-tsn-wide] .tsn-group.up .tsn-gtitle { padding-left: 6px; }
html[data-tsn-wide] .tsn-group.up .tsn-item.active::before { left: -18px; }
html[data-tsn-wide] .tsn-item .tsn-badge.nx-badge, html[data-tsn-wide] .tsn-item .tsn-badge.nx-dot { position: static; margin-left: auto; border-color: transparent; }

@media (max-width: 1023px) {
  /* small desktop windows: the rail is always icon-only (main-layout keeps 76px), even if it was left wide */
  html[data-tsn-wide] .tsn-rail { width: 76px; }
  html[data-tsn-wide] .tsn-item { justify-content: center; padding: 0 6px; }
  html[data-tsn-wide] .tsn-label, html[data-tsn-wide] .tsn-gtitle, html[data-tsn-wide] .tsn-group.up .tsn-gtitle { display: none; }
  html[data-tsn-wide] .tsn-sep { display: block; }
  html[data-tsn-wide] .tsn-group.up { margin: 0; padding: 0; background: none; border: 0; }
  html[data-tsn-wide] .tsn-item .tsn-badge.nx-badge, html[data-tsn-wide] .tsn-item .tsn-badge.nx-dot { position: absolute; }
}
@media (max-width: 767px), (min-width: 768px) and (max-width: 1400px) and (hover: none) and (pointer: coarse) { .tsn-rail, .tsn-tip { display: none; } }
@media (prefers-reduced-motion: reduce) { html.tsn-anim .tsn-rail { transition: none; } .tsn-tip { animation: none; } .tsn-ic { transition: none; } }
`;
