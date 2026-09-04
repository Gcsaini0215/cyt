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

const NAV_ITEMS = [
  { to: "/therapist-dashboard", Icon: MonitorHeartRoundedIcon, label: "Dashboard" },
  { to: "/appointments", Icon: EventAvailableRoundedIcon, label: "Appointments", hasBadge: true },
  { to: "/therapists/invoices", Icon: ReceiptLongRoundedIcon, label: "Invoices" },
  { to: "/therapists/reviews", Icon: StarRateRoundedIcon, label: "Reviews" },
  { to: "/therapists/notifications", Icon: NotificationsActiveRoundedIcon, label: "Notifications" },
  { to: "/settings", Icon: ManageAccountsRoundedIcon, label: "Settings" },
];

/* "Command Bar + Slim Sidebar" — a minimal white icon rail under the
   search-first top bar. Labels drop to a hover tooltip since the rail
   itself is icon-only. */
export default function TherapistSideNav() {
  const router = useRouter();
  const pathname = router.pathname;
  const { notificationCount } = useTherapistStore();

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .tsn-rail {
          position: fixed; left: 0; top: 38px; bottom: 0; z-index: 1100;
          width: 60px;
          background: #fff;
          border-right: 1px solid #e4ece7;
          display: flex; flex-direction: column; align-items: center;
          padding: 14px 0;
          gap: 4px;
        }
        .tsn-item {
          position: relative;
          width: 38px; height: 38px;
          display: grid; place-items: center;
          border-radius: 10px; color: #94a3b8;
          text-decoration: none !important;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .tsn-item svg { font-size: 19px; }
        .tsn-item:hover { background: #f8faf9; color: #166534; text-decoration: none; }
        .tsn-item.active { background: #f0fdf4; color: #166534; }
        .tsn-badge {
          position: absolute; top: 1px; right: 2px;
          background: #ef4444; color: #fff; border-radius: 8px;
          min-width: 15px; padding: 0 4px; font-size: 8px; font-weight: 800;
          line-height: 14px; text-align: center; border: 1.5px solid #fff;
        }

        /* Tooltip: attr()-based content avoids literal quote characters in
           this style block, which is what breaks SSR/client hydration here. */
        .tsn-item:hover::after {
          content: attr(data-label);
          position: absolute; left: calc(100% + 12px); top: 50%; transform: translateY(-50%);
          background: #0f172a; color: #fff; font-size: 12px; font-weight: 600;
          padding: 6px 11px; border-radius: 7px; white-space: nowrap;
          box-shadow: 0 10px 28px rgba(15,23,42,0.28);
          z-index: 1010; pointer-events: none;
        }

        @media (max-width: 960px) { .tsn-rail { display: none; } }
      `,
        }}
      />
      <nav className="tsn-rail">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.to;
          return (
            <Link key={item.to} href={item.to} data-label={item.label} className={`tsn-item${active ? " active" : ""}`}>
              <item.Icon />
              {item.hasBadge && notificationCount > 0 && <span className="tsn-badge">{notificationCount}</span>}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
