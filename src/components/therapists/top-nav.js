import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import useTherapistStore from "../../store/therapistStore";
import { removeToken } from "../../utils/jwt";
import { defaultProfile, imagePath, getBookings } from "../../utils/url";
import { fetchById } from "../../utils/actions";
import { toast } from "react-toastify";

import MonitorHeartRoundedIcon from "@mui/icons-material/MonitorHeartRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

const logo1 = "/cyt-emblem.png";

const MOB_NAV = [
  { to: "/therapist-dashboard", Icon: MonitorHeartRoundedIcon, label: "Home" },
  { to: "/appointments", Icon: EventAvailableRoundedIcon, label: "Appointments", badge: true },
  { to: "/settings", Icon: ManageAccountsRoundedIcon, label: "Settings" },
];

/* "Command Bar + Slim Sidebar" — a light, search-first top bar: hamburger,
   logo, a command-style search field, and account controls on the right. */
export default function DashboardTopNav() {
  const { therapistInfo, fetchTherapistInfo, notificationCount, setNotificationCount } =
    useTherapistStore();
  const router = useRouter();
  const pathname = router.pathname;
  const [profileOpen, setProfileOpen] = useState(false);
  const prevBookingsCount = useRef(null);

  // Blinkit-style floating bottom bar: tucked away at the top of the page,
  // slides up into view once the user scrolls down; hides again near the top.
  const [showMobNav, setShowMobNav] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      if (y < 40) setShowMobNav(false);
      else if (y > lastScrollY.current + 2) setShowMobNav(true); // scrolling down
      lastScrollY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    fetchTherapistInfo();
  }, [fetchTherapistInfo]);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetchById(getBookings);
        if (res?.status && res.data) {
          const count = res.data.length;
          if (prevBookingsCount.current !== null && count > prevBookingsCount.current) {
            const n = count - prevBookingsCount.current;
            setNotificationCount(notificationCount + n);
            toast.info(`🔔 You have ${n} new session booking${n > 1 ? "s" : ""}!`, {
              position: "top-right", autoClose: 5000,
            });
          }
          prevBookingsCount.current = count;
        }
      } catch (err) {
        console.error("booking poll error:", err);
      }
    };
    check();
    const id = setInterval(check, 30000);
    return () => clearInterval(id);
  }, [notificationCount, setNotificationCount]);

  const handleLogout = () => {
    removeToken();
    router.push("/login");
  };

  const avatarSrc = therapistInfo?.user?.profile
    ? `${imagePath}/${therapistInfo.user.profile}`
    : defaultProfile;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        /* ── Light command-bar chrome ──────────────────── */
        .tn-bar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 1200;
          height: 38px;
          background: #fff;
          border-bottom: 1px solid #e4ece7;
          box-shadow: 0 1px 3px rgba(15,23,42,0.03);
          display: flex; align-items: center; gap: 10px;
          padding: 0 12px;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif;
          user-select: none;
        }

        /* ── Menu toggle + logo ─────────────────────────── */
        .tn-menu-btn {
          width: 26px; height: 26px; border-radius: 7px; flex-shrink: 0;
          background: transparent; border: none; cursor: pointer;
          display: grid; place-items: center; color: #5b6b7c;
          transition: background 0.14s, color 0.14s;
        }
        .tn-menu-btn:hover { background: #f8faf9; color: #166534; }
        .tn-menu-btn svg { font-size: 17px; }
        .tn-logo { display: flex; align-items: center; gap: 8px; text-decoration: none; flex-shrink: 0; }
        .tn-logo img { width: 21px; height: 21px; object-fit: contain; display: block; }
        .tn-title-text { font-size: 12.5px; font-weight: 700; color: #0f172a; letter-spacing: 0.1px; white-space: nowrap; }

        /* ── Command / search field ─────────────────────── */
        .tn-cmd {
          flex: 1; max-width: 360px;
          height: 25px;
          background: #f1f5f4; border-radius: 8px;
          display: flex; align-items: center; gap: 7px;
          padding: 0 10px;
          color: #94a3b8; font-size: 11.5px; font-weight: 600;
        }
        .tn-cmd svg { font-size: 14px; flex-shrink: 0; }

        /* ── Right controls ──────────────────────────── */
        .tn-right { display: flex; align-items: center; gap: 3px; margin-left: auto; flex-shrink: 0; height: 100%; }
        .tn-icon-btn {
          width: 28px; height: 28px; border-radius: 7px;
          background: transparent; border: none; cursor: pointer;
          display: grid; place-items: center;
          color: #5b6b7c; transition: background 0.14s, color 0.14s;
          text-decoration: none; position: relative;
        }
        .tn-icon-btn svg { font-size: 16px; }
        .tn-icon-btn:hover { background: #f8faf9; color: #166534; }
        .tn-notif-dot {
          position: absolute; top: 0px; right: 0px;
          min-width: 13px; height: 13px; padding: 0 3px; border-radius: 7px;
          background: #ef4444; color: #fff;
          font-size: 7.5px; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid #fff;
        }

        /* ── Profile ──────────────────────────────────── */
        .tn-prof-btn {
          height: 28px; padding: 0 8px 0 6px;
          display: flex; align-items: center; gap: 7px;
          border-radius: 7px; border: none; background: none;
          color: #334155; font-size: 12px; font-weight: 700;
          cursor: pointer; transition: background 0.14s, color 0.14s;
        }
        .tn-prof-btn:hover { background: #f8faf9; }
        .tn-prof-av {
          width: 20px; height: 20px; border-radius: 6px; object-fit: cover; flex-shrink: 0;
          box-shadow: 0 0 0 1px #e4ece7;
        }
        .tn-prof-name { max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .tn-prof-chevron { font-size: 14px !important; opacity: 0.55; }

        .tn-prof-dd {
          position: absolute; top: calc(100% + 6px); right: 0;
          background: #fff; border: 1px solid #e4ece7;
          border-radius: 10px; min-width: 210px; z-index: 600;
          box-shadow: 0 18px 44px rgba(15,23,42,0.14); padding: 5px;
        }
        .tn-prof-dd-head { padding: 10px 12px 9px; border-bottom: 1px solid #eef2f0; margin-bottom: 5px; }
        .tn-prof-dd a, .tn-prof-dd button {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 10px; width: 100%;
          color: #475569; font-size: 12.5px; font-weight: 600;
          text-decoration: none !important; transition: background 0.12s, color 0.12s;
          background: transparent; border: none; border-radius: 7px; cursor: pointer; text-align: left;
        }
        .tn-prof-dd a svg, .tn-prof-dd button svg { font-size: 16px; }
        .tn-prof-dd a:hover, .tn-prof-dd button:hover { background: #f0fdf4; color: #166534; }
        .tn-prof-dd .logout-btn { color: #dc2626; }
        .tn-prof-dd .logout-btn:hover { background: #fef2f2; color: #dc2626; }

        /* ── Floating app-style bottom nav (solid white) ── */
        .tn-mob-nav { display: none; }
        @media(max-width: 960px) {
          .tn-cmd, .tn-title-text { display: none; }
          .tn-mob-nav {
            display: flex; position: fixed; z-index: 1200;
            left: 16px; right: 16px; max-width: 440px; margin: 0 auto;
            bottom: calc(14px + env(safe-area-inset-bottom, 0px));
            padding: 8px 6px;
            gap: 2px;
            background: #ffffff;
            border: 1px solid rgba(15,61,36,0.08);
            border-radius: 22px;
            box-shadow: 0 10px 34px rgba(4,22,14,0.16), 0 2px 8px rgba(4,22,14,0.08);
            transform: translateY(calc(100% + 28px));
            opacity: 0;
            pointer-events: none;
            transition: transform .34s cubic-bezier(.4,0,.2,1), opacity .26s ease;
          }
          .tn-mob-nav.show { transform: translateY(0); opacity: 1; pointer-events: auto; }
          .tn-mob-item {
            flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px;
            text-decoration: none; color: #64748b;
            font-size: 10.5px; font-weight: 700; letter-spacing: 0.1px;
            padding: 3px 0; position: relative;
            transition: color 0.16s;
          }
          .tn-mob-ico {
            width: 48px; height: 30px; border-radius: 999px;
            display: grid; place-items: center;
            transition: background 0.18s, transform 0.18s;
          }
          .tn-mob-ico svg { font-size: 23px; }
          .tn-mob-item.active { color: #166534; }
          .tn-mob-item.active .tn-mob-ico {
            background: #e7f6ec;
            transform: translateY(-1px);
          }
          .tn-mob-badge {
            position: absolute; top: -2px; right: calc(50% - 25px);
            background: #ef4444; color: #fff; border-radius: 8px;
            padding: 1px 5px; font-size: 9px; font-weight: 800;
            border: 2px solid #fff;
          }
        }
      `,
        }}
      />

      {/* ── Top bar ───────────────────────────────────── */}
      <div className="tn-bar">
        <button className="tn-menu-btn" title="Menu">
          <MenuRoundedIcon />
        </button>

        <Link href="/therapist-dashboard" className="tn-logo">
          <img src={logo1} alt="CYT" width={21} height={21} />
          <span className="tn-title-text">Therapist Portal</span>
        </Link>

        <div className="tn-cmd">
          <SearchRoundedIcon />
          Search clients, invoices…
        </div>

        <div className="tn-right">
          <a href="https://chooseyourtherapist.in" target="_blank" rel="noopener noreferrer" className="tn-icon-btn" title="Go to Website">
            <LanguageRoundedIcon />
          </a>

          <Link href="/appointments" className="tn-icon-btn" onClick={() => setNotificationCount(0)} title="Notifications">
            <NotificationsActiveRoundedIcon />
            {notificationCount > 0 && <span className="tn-notif-dot">{notificationCount}</span>}
          </Link>

          <div
            style={{ position: "relative", height: "100%", display: "flex", alignItems: "center" }}
            onMouseEnter={() => setProfileOpen(true)}
            onMouseLeave={() => setProfileOpen(false)}
          >
            <button className="tn-prof-btn">
              <img src={avatarSrc} alt={therapistInfo?.user?.name || "Therapist"} className="tn-prof-av" onError={(e) => { e.target.onerror = null; e.target.src = defaultProfile; }} />
              <span className="tn-prof-name">{therapistInfo?.user?.name || "Therapist"}</span>
              <KeyboardArrowDownRoundedIcon className="tn-prof-chevron" />
            </button>
            {profileOpen && (
              <div className="tn-prof-dd">
                <div className="tn-prof-dd-head">
                  <p style={{ color: "#0f172a", fontWeight: 700, fontSize: 13, margin: 0 }}>{therapistInfo?.user?.name}</p>
                  <p style={{ color: "#166534", fontSize: 10.5, margin: "2px 0 0", fontWeight: 600 }}>Therapist</p>
                </div>
                <Link href="/therapist-dashboard"><MonitorHeartRoundedIcon /> Dashboard</Link>
                <Link href="/settings"><PersonRoundedIcon /> Edit Profile</Link>
                <Link href="/appointments"><EventAvailableRoundedIcon /> Appointments</Link>
                <button onClick={handleLogout} className="logout-btn"><LogoutRoundedIcon /> Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Floating glass bottom nav (reveals on scroll) ── */}
      <div className={`tn-mob-nav${showMobNav ? " show" : ""}`}>
        {MOB_NAV.map((item) => (
          <Link
            key={item.to}
            href={item.to}
            className={`tn-mob-item${pathname === item.to ? " active" : ""}`}
            onClick={() => item.badge && setNotificationCount(0)}
          >
            {item.badge && notificationCount > 0 && <span className="tn-mob-badge">{notificationCount}</span>}
            <span className="tn-mob-ico"><item.Icon /></span>
            {item.label}
          </Link>
        ))}
      </div>
    </>
  );
}
