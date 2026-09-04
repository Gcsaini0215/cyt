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

/* "Two-Tier Nav": the top bar carries brand + account, this sidebar carries
   the sectioned, labeled section nav underneath it. */
const SECTIONS = [
  {
    label: "Overview",
    items: [{ to: "/therapist-dashboard", Icon: MonitorHeartRoundedIcon, label: "Dashboard" }],
  },
  {
    label: "Practice",
    items: [
      { to: "/appointments", Icon: EventAvailableRoundedIcon, label: "Appointments", hasBadge: true },
      { to: "/therapists/invoices", Icon: ReceiptLongRoundedIcon, label: "Invoices" },
      { to: "/therapists/reviews", Icon: StarRateRoundedIcon, label: "Reviews" },
    ],
  },
  {
    label: "Account",
    items: [
      { to: "/therapists/notifications", Icon: NotificationsActiveRoundedIcon, label: "Notifications" },
      { to: "/settings", Icon: ManageAccountsRoundedIcon, label: "Settings" },
    ],
  },
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
          width: 200px;
          background: #fff;
          border-right: 1px solid #e4ece7;
          overflow-y: auto;
          padding: 16px 12px 24px;
        }
        .tsn-sec {
          font-size: 10px; font-weight: 800; color: #94a3b8;
          text-transform: uppercase; letter-spacing: 0.06em;
          padding: 0 10px; margin: 16px 0 6px;
        }
        .tsn-sec:first-child { margin-top: 0; }
        .tsn-item {
          position: relative;
          display: flex; align-items: center; gap: 11px;
          padding: 9px 10px; margin-bottom: 2px;
          border-radius: 9px; color: #475569; font-size: 12.5px; font-weight: 700;
          text-decoration: none !important;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .tsn-item svg { font-size: 18px; flex-shrink: 0; }
        .tsn-item:hover { background: #f8faf9; color: #0f172a; text-decoration: none; }
        .tsn-item.active { background: #f0fdf4; color: #166534; }
        .tsn-item.active svg { color: #16a34a; }
        .tsn-badge {
          margin-left: auto;
          background: #ef4444; color: #fff; border-radius: 8px;
          min-width: 17px; padding: 0 5px; font-size: 9.5px; font-weight: 800;
          line-height: 17px; text-align: center; flex-shrink: 0;
        }

        @media (max-width: 960px) { .tsn-rail { display: none; } }
      `,
        }}
      />
      <nav className="tsn-rail">
        {SECTIONS.map((sec) => (
          <React.Fragment key={sec.label}>
            <div className="tsn-sec">{sec.label}</div>
            {sec.items.map((item) => {
              const active = pathname === item.to;
              return (
                <Link key={item.to} href={item.to} className={`tsn-item${active ? " active" : ""}`}>
                  <item.Icon />
                  {item.label}
                  {item.hasBadge && notificationCount > 0 && <span className="tsn-badge">{notificationCount}</span>}
                </Link>
              );
            })}
          </React.Fragment>
        ))}
      </nav>
    </>
  );
}
