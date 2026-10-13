import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import useTherapistStore from "../../store/therapistStore";

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

/* Every therapist-portal page, grouped. Items marked `hidden` are switched off for now
   (pages exist but aren't in the menu yet) — remove the flag to show them. `match` lists the route prefixes that count as
   "this item" so sub-pages (e.g. /coupon/create) keep their menu item highlighted. */
const ALL_GROUPS = [
  {
    title: "Practice",
    items: [
      { to: "/therapist-dashboard", Icon: MonitorHeartRoundedIcon, label: "Dashboard" },
      { to: "/appointments", Icon: EventAvailableRoundedIcon, label: "Appointments", badge: true },
      { to: "/my-schedule", Icon: CalendarMonthRoundedIcon, label: "My Schedule" },
      { to: "/therapists/reviews", Icon: StarRateRoundedIcon, label: "Reviews" },
      { to: "/clinic-patients", Icon: GroupsRoundedIcon, label: "Clients", hidden: true, match: ["/clinic-patients", "/add-offline-client"] },
      { to: "/case-history", Icon: FolderSharedRoundedIcon, label: "Case History", hidden: true, match: ["/case-history", "/create-report"] },
    ],
  },
  {
    title: "Money & feedback",
    items: [
      { to: "/therapists/invoices", Icon: ReceiptLongRoundedIcon, label: "Invoices", hidden: true },
      { to: "/coupons", Icon: LocalOfferRoundedIcon, label: "Coupons", hidden: true, match: ["/coupons", "/coupon/"] },
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
      { to: "/therapists/notifications", Icon: NotificationsActiveRoundedIcon, label: "Notifications" },
      { to: "/settings", Icon: ManageAccountsRoundedIcon, label: "Settings", match: ["/settings", "/therapists/change-password"] },
    ],
  },
];
export const NAV_GROUPS = ALL_GROUPS.map((g) => ({ ...g, items: g.items.filter((i) => !i.hidden) })).filter((g) => g.items.length);
export const NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items);
export const isActive = (item, pathname) => (item.match || [item.to]).some((m) => pathname === m || pathname.startsWith(m.endsWith("/") ? m : `${m}/`));

/* Desktop / iPad rail: icons only by default, or icons + labels when widened from the
   top bar's menu button (remembered per device). Hidden on phones (bottom nav + drawer there). */
export default function TherapistSideNav() {
  const router = useRouter();
  const pathname = router.pathname;
  const { notificationCount } = useTherapistStore();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: RAIL_CSS }} />
      <nav className="tsn-rail" aria-label="Therapist menu">
        {NAV_GROUPS.map((g, gi) => (
          <div key={g.title} className="tsn-group">
            {gi > 0 && <span className="tsn-sep" aria-hidden="true" />}
            <span className="tsn-gtitle">{g.title}</span>
            {g.items.map((item) => {
              const active = isActive(item, pathname);
              return (
                <Link key={item.to} href={item.to} data-label={item.label} aria-label={item.label}
                  aria-current={active ? "page" : undefined} className={`tsn-item${active ? " active" : ""}`}>
                  <item.Icon />
                  <span className="tsn-label">{item.label}</span>
                  {item.badge && notificationCount > 0 && <span className="tsn-badge">{notificationCount}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </>
  );
}

const RAIL_CSS = `
.tsn-rail {
  position: fixed; left: 0; top: var(--tn-h, 56px); bottom: 0; z-index: 1100;
  width: 68px; background: #fff; border-right: 1px solid #e4ece7;
  display: flex; flex-direction: column; align-items: stretch; padding: 12px 10px; gap: 2px;
  overflow-y: auto; overflow-x: hidden; scrollbar-width: none; transition: width .2s ease;
}
.tsn-rail::-webkit-scrollbar { display: none; }
.tsn-group { display: flex; flex-direction: column; gap: 2px; }
.tsn-sep { display: block; height: 1px; background: #eef2f0; margin: 8px 6px; }
.tsn-gtitle { display: none; font-size: 10.5px; font-weight: 800; letter-spacing: .6px; text-transform: uppercase; color: #94a3b8; padding: 8px 12px 4px; white-space: nowrap; }
.tsn-item {
  position: relative; height: 44px; display: flex; align-items: center; justify-content: center; gap: 12px;
  border-radius: 12px; color: #64748b; text-decoration: none !important; padding: 0 12px;
  transition: background .15s ease, color .15s ease;
}
.tsn-item svg { font-size: 21px; flex-shrink: 0; }
.tsn-item:hover { background: #f4f7f5; color: #166534; }
.tsn-item.active { background: #e7f6ec; color: #166534; }
.tsn-item.active::before { content: ""; position: absolute; left: -10px; top: 10px; bottom: 10px; width: 3px; border-radius: 0 3px 3px 0; background: #166534; }
.tsn-label { display: none; font-size: 14px; font-weight: 700; white-space: nowrap; }
.tsn-badge { position: absolute; top: 4px; right: 6px; background: #ef4444; color: #fff; border-radius: 8px; min-width: 16px; padding: 0 4px; font-size: 9px; font-weight: 800; line-height: 15px; text-align: center; border: 1.5px solid #fff; }

/* icon-only: label as a tooltip */
html:not([data-tsn-wide]) .tsn-item:hover::after {
  content: attr(data-label); position: absolute; left: calc(100% + 14px); top: 50%; transform: translateY(-50%);
  background: #0f172a; color: #fff; font-size: 12.5px; font-weight: 600; padding: 6px 11px; border-radius: 8px;
  white-space: nowrap; box-shadow: 0 10px 28px rgba(15,23,42,.28); z-index: 1010; pointer-events: none;
}

/* widened rail: labels + group titles */
html[data-tsn-wide] .tsn-rail { width: 232px; }
html[data-tsn-wide] .tsn-item { justify-content: flex-start; }
html[data-tsn-wide] .tsn-label, html[data-tsn-wide] .tsn-gtitle { display: block; }
html[data-tsn-wide] .tsn-sep { display: none; }
html[data-tsn-wide] .tsn-badge { position: static; margin-left: auto; }

@media (max-width: 767px) { .tsn-rail { display: none; } }
@media (prefers-reduced-motion: reduce) { .tsn-rail { transition: none; } }
`;
