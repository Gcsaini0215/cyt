import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import useTherapistStore from "../../store/therapistStore";

const NAV_ITEMS = [
  { to: "/therapist-dashboard",       icon: "feather-home",        label: "Dashboard" },
  { to: "/appointments",              icon: "feather-calendar",    label: "Appointments", hasBadge: true },
  { to: "/therapists/invoices",       icon: "feather-file-text",   label: "Invoices" },
  { to: "/therapists/reviews",        icon: "feather-star",        label: "Reviews" },
  { to: "/therapists/notifications",  icon: "feather-bell",        label: "Notifications" },
  { to: "/settings",                  icon: "feather-settings",    label: "Settings" },
];

export default function TherapistSideNav() {
  const router = useRouter();
  const pathname = router.pathname;
  const { notificationCount } = useTherapistStore();

  return (
    <>
      <style>{`
        :root { --tsn-bg: #14171c; --tsn-border: rgba(255,255,255,0.075); --tsn-accent: #22c55e; --tsn-accent-2: #4ade80; }

        .tsn-rail {
          position: fixed; left: 0; top: 38px; bottom: 0; z-index: 1100;
          width: 56px; background: var(--tsn-bg);
          border-right: 1px solid var(--tsn-border);
          display: flex; flex-direction: column; align-items: center;
          padding: 10px 0;
        }
        .tsn-item {
          position: relative;
          width: 44px; height: 44px; margin: 3px 0;
          display: flex; align-items: center; justify-content: center;
          border-radius: 9px; color: rgba(255,255,255,0.55);
          text-decoration: none !important; font-size: 18px;
          transition: background 0.14s ease, color 0.14s ease;
        }
        .tsn-item:hover { background: rgba(255,255,255,0.07); color: #fff; text-decoration: none; }
        .tsn-item.active { background: rgba(34,197,94,0.15); color: var(--tsn-accent-2); }
        .tsn-active-bar {
          position: absolute; left: -8px; top: 50%; transform: translateY(-50%);
          width: 3px; height: 60%; background: var(--tsn-accent); border-radius: 0 3px 3px 0;
        }
        .tsn-badge {
          position: absolute; top: 2px; right: 4px;
          background: #ef4444; color: #fff; border-radius: 8px;
          padding: 0 4px; font-size: 8px; font-weight: 800; line-height: 14px;
        }

        /* Tooltip: attr()-based content avoids literal quote characters in
           this style block, which is what breaks SSR/client hydration here. */
        .tsn-item:hover::after {
          content: attr(data-label);
          position: absolute; left: calc(100% + 10px); top: 50%; transform: translateY(-50%);
          background: #14171c; color: #fff; font-size: 12px; font-weight: 500;
          padding: 5px 10px; border-radius: 5px; white-space: nowrap;
          box-shadow: 0 8px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08);
          z-index: 1010; pointer-events: none;
        }

        @media (max-width: 960px) { .tsn-rail { display: none; } }
        @media (min-width: 768px) and (max-width: 1024px) {
          .tsn-item { width: 48px; height: 48px; }
        }
      `}</style>
      <nav className="tsn-rail">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.to;
          return (
            <Link key={item.to} href={item.to} data-label={item.label} className={`tsn-item${active ? " active" : ""}`}>
              {active && <span className="tsn-active-bar" />}
              <i className={item.icon}></i>
              {item.hasBadge && notificationCount > 0 && <span className="tsn-badge">{notificationCount}</span>}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
