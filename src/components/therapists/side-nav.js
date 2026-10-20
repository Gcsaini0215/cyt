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

/* Every therapist-portal page, grouped. Items marked `hidden` are switched off for now
   (pages exist but aren't in the menu yet) — remove the flag to show them. `match` lists the route prefixes that count as
   "this item" so sub-pages (e.g. /coupon/create) keep their menu item highlighted.
   The `upgrade` group (paid add-ons and growth tools) sits last and gets the gold styling. Once the therapist
   owns an upgrade (`owns`), the item moves up into its `home` group (groupsFor). */
const ALL_GROUPS = [
  {
    title: "Practice",
    items: [
      { to: "/therapist-dashboard", Icon: MonitorHeartRoundedIcon, label: "Dashboard" },
      { to: "/appointments", Icon: EventAvailableRoundedIcon, label: "Appointments", badgeKey: "bookings" },
      { to: "/my-schedule", Icon: CalendarMonthRoundedIcon, label: "My Schedule" },
      { to: "/therapists/reviews", Icon: StarRateRoundedIcon, label: "Reviews", badgeKey: "reviews" },
      { to: "/clinic-patients", Icon: GroupsRoundedIcon, label: "Clients", hidden: true, match: ["/clinic-patients", "/add-offline-client"] },
      { to: "/case-history", Icon: FolderSharedRoundedIcon, label: "Case History", hidden: true, match: ["/case-history", "/create-report"] },
    ],
  },
  {
    title: "Money",
    items: [
      { to: "/therapists/payouts", Icon: AccountBalanceWalletRoundedIcon, label: "Payouts" },
      { to: "/therapists/invoices", Icon: ReceiptLongRoundedIcon, label: "Invoices", hidden: true },
    ],
  },
  {
    title: "Grow",
    items: [
      { to: "/workshops", Icon: EventNoteRoundedIcon, label: "Workshops", hidden: true, match: ["/workshops", "/create-workshop", "/update-workshop"] },
      { to: "/therapist-blogs", Icon: ArticleRoundedIcon, label: "Blogs", hidden: true, match: ["/therapist-blogs", "/therapist-ai-blog"] },
    ],
  },
  {
    title: "Account",
    items: [
      { to: "/therapists/notifications", Icon: NotificationsActiveRoundedIcon, label: "Notifications", badgeKey: "inbox" },
      { to: "/settings", Icon: ManageAccountsRoundedIcon, label: "Settings", badgeKey: "settings", match: ["/settings", "/therapists/change-password"] },
      { to: "/therapists/help", Icon: SupportAgentRoundedIcon, label: "Help & support" },
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
    // the plans page sits last (after the gold Upgrade group), like a billing link usually does
    title: "Billing",
    items: [
      { to: "/my-plans", Icon: WorkspacePremiumRoundedIcon, label: "Subscriptions" },
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
                  <item.Icon />
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
.tsn-rail {
  position: fixed; left: 0; top: var(--tn-h, 56px); bottom: 0; z-index: 1100;
  width: 68px; background: #fff; border-right: 1px solid #e4ece7;
  display: flex; flex-direction: column; align-items: stretch; padding: 12px 10px; gap: 2px;
  overflow-y: auto; overflow-x: hidden; scrollbar-width: none;
}
.tsn-rail::-webkit-scrollbar { display: none; }
/* width animates only while the menu button is pressed (html.tsn-anim, set in top-nav.js) */
html.tsn-anim .tsn-rail { transition: width .22s cubic-bezier(.2,.8,.2,1); }
@keyframes tsnFade { from { opacity: 0; transform: translateX(-4px); } to { opacity: 1; transform: none; } }
.tsn-group { display: flex; flex-direction: column; gap: 2px; }
.tsn-sep { display: block; height: 1px; background: #eef2f0; margin: 8px 6px; flex-shrink: 0; }
.tsn-gtitle { display: none; font-size: 10.5px; font-weight: 800; letter-spacing: .6px; text-transform: uppercase; color: #94a3b8; padding: 8px 12px 4px; white-space: nowrap; }
.tsn-item {
  position: relative; height: 44px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; gap: 12px;
  border-radius: 12px; color: #64748b; text-decoration: none !important; padding: 0 12px; outline: none;
  transition: background .15s ease, color .15s ease, box-shadow .15s ease;
}
.tsn-item svg { font-size: 21px; flex-shrink: 0; transition: transform .15s ease; }
.tsn-item:hover { background: #f3faf5; color: #166534; }
.tsn-item:hover svg { transform: scale(1.08); }
.tsn-item:focus-visible { box-shadow: 0 0 0 2px #fff, 0 0 0 4px #16a34a; }
/* the current page: no background box — just a gold line on the left and green text/icon (user's choice);
   hovering it doesn't change it */
.tsn-item.active, .tsn-item.active:hover { background: none; color: #15803d; box-shadow: none; }
.tsn-item.active svg { color: #15803d; }
.tsn-item.active:hover svg { transform: none; }
.tsn-item.active::before { content: ""; position: absolute; left: -10px; top: 8px; bottom: 8px; width: 4px; border-radius: 0 4px 4px 0; background: linear-gradient(180deg, #e9c46a, #c9962c); box-shadow: 0 0 8px rgba(212,161,47,.45); }
.tsn-item.active .tsn-label { font-weight: 800; }
.tsn-label { display: none; align-items: center; gap: 6px; font-size: 14px; font-weight: 700; white-space: nowrap; min-width: 0; }
.tsn-item .tsn-badge.nx-badge { position: absolute; top: 3px; right: 4px; min-width: 17px; height: 17px; padding: 0 4px; font-size: 9.5px; border: 1.5px solid #fff; }
.tsn-item .tsn-badge.nx-dot { position: absolute; top: 9px; right: 11px; }

/* Upgrade group: paid add-ons + growth tools, in gold */
.tsn-group.up .tsn-sep { background: linear-gradient(90deg, transparent, #e6cf8f, transparent); }
.tsn-group.up .tsn-gtitle { color: #a37a16; display: none; }
.tsn-group.up .tsn-gtitle i { font-style: normal; margin-right: 5px; color: #d4a12f; }
.tsn-group.up .tsn-item:not(.active) { color: #a37a16; }
.tsn-group.up .tsn-item:not(.active):hover { background: #fdf6e3; color: #7a5a10; }
.tsn-group.up .tsn-item.active, .tsn-group.up .tsn-item.active:hover { background: none; color: #15803d; box-shadow: none; }
.tsn-group.up .tsn-item.active svg { color: #15803d; }


/* icon-only rail: tooltip outside the rail */
.tsn-tip { position: fixed; z-index: 1200; transform: translateY(-50%); background: #0f172a; color: #fff; font-size: 12.5px; font-weight: 600;
  padding: 6px 11px; border-radius: 8px; white-space: nowrap; box-shadow: 0 10px 28px rgba(15,23,42,.28); pointer-events: none; animation: tsnTip .12s ease-out; }
.tsn-tip::before { content: ""; position: absolute; left: -4px; top: 50%; width: 8px; height: 8px; margin-top: -4px; background: #0f172a; transform: rotate(45deg); }
@keyframes tsnTip { from { opacity: 0; margin-left: -4px; } to { opacity: 1; margin-left: 0; } }

/* widened rail: labels + group titles */
html[data-tsn-wide] .tsn-rail { width: 232px; }
html[data-tsn-wide] .tsn-item { justify-content: flex-start; }
html[data-tsn-wide] .tsn-label { display: inline-flex; }
html[data-tsn-wide] .tsn-gtitle, html[data-tsn-wide] .tsn-group.up .tsn-gtitle { display: block; }
html[data-tsn-wide] .tsn-sep { display: none; }
html[data-tsn-wide] .tsn-group.up { margin: 6px 0 2px; padding: 4px 6px 6px; border-radius: 14px; background: linear-gradient(160deg, #fffaf0, #fdf3dc); border: 1px solid #f0e2b8; }
html[data-tsn-wide] .tsn-group.up .tsn-gtitle { padding-left: 6px; }
html[data-tsn-wide] .tsn-item .tsn-badge.nx-badge, html[data-tsn-wide] .tsn-item .tsn-badge.nx-dot { position: static; margin-left: auto; }

@media (max-width: 1023px) {
  /* iPad: the rail is always icon-only (main-layout keeps 68px), even if it was left wide on a desktop */
  html[data-tsn-wide] .tsn-rail { width: 68px; }
  html[data-tsn-wide] .tsn-item { justify-content: center; }
  html[data-tsn-wide] .tsn-label, html[data-tsn-wide] .tsn-gtitle, html[data-tsn-wide] .tsn-group.up .tsn-gtitle { display: none; }
  html[data-tsn-wide] .tsn-sep { display: block; }
  html[data-tsn-wide] .tsn-group.up { margin: 0; padding: 0; background: none; border: 0; }
  html[data-tsn-wide] .tsn-item .tsn-badge.nx-badge { position: absolute; }
}
@media (max-width: 767px) { .tsn-rail, .tsn-tip { display: none; } }
@media (prefers-reduced-motion: reduce) { html.tsn-anim .tsn-rail { transition: none; } .tsn-tip { animation: none; } }
`;
