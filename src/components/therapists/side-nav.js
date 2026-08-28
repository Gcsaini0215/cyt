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
          width: 56px;
          background: linear-gradient(180deg, #0f3d24 0%, #0a2818 100%);
          border-right: 1px solid rgba(212,175,55,0.22);
          display: flex; flex-direction: column; align-items: center;
          padding: 12px 0;
        }
        .tsn-item {
          position: relative;
          width: 44px; height: 44px; margin: 3px 0;
          display: grid; place-items: center;
          border-radius: 11px; color: rgba(255,255,255,0.58);
          text-decoration: none !important;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .tsn-item svg { font-size: 21px; }
        .tsn-item:hover { background: rgba(255,255,255,0.08); color: #fff; text-decoration: none; }
        .tsn-item.active {
          background: linear-gradient(135deg, rgba(74,222,128,0.22), rgba(34,197,94,0.1));
          color: #bbf7d0;
          box-shadow: inset 0 0 0 1px rgba(134,239,172,0.3);
        }
        .tsn-active-bar {
          position: absolute; left: -12px; top: 50%; transform: translateY(-50%);
          width: 3px; height: 58%; background: #22c55e; border-radius: 0 3px 3px 0;
          box-shadow: 0 0 10px rgba(34,197,94,0.6);
        }
        .tsn-badge {
          position: absolute; top: 3px; right: 4px;
          background: #ef4444; color: #fff; border-radius: 8px;
          min-width: 15px; padding: 0 4px; font-size: 8px; font-weight: 800;
          line-height: 14px; text-align: center; border: 1.5px solid #0a2818;
        }

        /* Tooltip: attr()-based content avoids literal quote characters in
           this style block, which is what breaks SSR/client hydration here. */
        .tsn-item:hover::after {
          content: attr(data-label);
          position: absolute; left: calc(100% + 12px); top: 50%; transform: translateY(-50%);
          background: #0f3d24; color: #fff; font-size: 12px; font-weight: 600;
          padding: 6px 11px; border-radius: 7px; white-space: nowrap;
          box-shadow: 0 10px 28px rgba(4,22,14,0.55), 0 0 0 1px rgba(212,175,55,0.22);
          z-index: 1010; pointer-events: none;
        }

        @media (max-width: 960px) { .tsn-rail { display: none; } }
        @media (min-width: 768px) and (max-width: 1024px) {
          .tsn-item { width: 46px; height: 46px; }
        }
      `,
        }}
      />
      <nav className="tsn-rail">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.to;
          return (
            <Link key={item.to} href={item.to} data-label={item.label} className={`tsn-item${active ? " active" : ""}`}>
              {active && <span className="tsn-active-bar" />}
              <item.Icon />
              {item.hasBadge && notificationCount > 0 && <span className="tsn-badge">{notificationCount}</span>}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
