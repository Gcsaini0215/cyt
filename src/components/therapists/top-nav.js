import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import ImageTag from "../../utils/image-tag";
import useTherapistStore from "../../store/therapistStore";
import { removeToken } from "../../utils/jwt";
import { defaultProfile, imagePath, getBookings } from "../../utils/url";
import { fetchById } from "../../utils/actions";
import { toast } from "react-toastify";

const logo1 = "/cyt-emblem.png";

const NAV = [
  { to: "/therapist-dashboard", label: "Dashboard", icon: "feather-home" },
  { to: "/appointments", label: "Appointments", icon: "feather-calendar", hasBadge: true },
  { to: "/settings", label: "Settings", icon: "feather-settings" },
];

const MOB_NAV = [
  { to: "/therapist-dashboard", icon: "feather-home", label: "Home" },
  { to: "/appointments", icon: "feather-calendar", label: "Appointments", badge: true },
  { to: "/settings", icon: "feather-settings", label: "Settings" },
];

export default function DashboardTopNav() {
  const { therapistInfo, fetchTherapistInfo, notificationCount, setNotificationCount } =
    useTherapistStore();
  const router = useRouter();
  const pathname = router.pathname;
  const [profileOpen, setProfileOpen] = useState(false);
  const prevBookingsCount = useRef(null);

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

  const isItemActive = (item) =>
    item.sub ? item.activePaths?.includes(pathname) : pathname === item.to;

  const avatarSrc = therapistInfo?.user?.profile
    ? `${imagePath}/${therapistInfo.user.profile}`
    : defaultProfile;

  return (
    <>
      <style>{`
        /* ── VS Code style title bar ─────────────────── */
        .tn-bar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 1200;
          height: 38px; background: #14171c;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          display: flex; align-items: center; gap: 8px;
          padding: 0 12px;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif;
          user-select: none;
        }

        /* ── Logo ─────────────────────────────────────── */
        .tn-logo {
          display: flex; align-items: center; gap: 8px;
          text-decoration: none; flex-shrink: 0;
        }
        .tn-logo-badge {
          width: 30px; height: 30px; flex-shrink: 0;
          background: #fff; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
        }
        .tn-logo-badge img { width: 92%; height: 92%; object-fit: contain; display: block; }
        .tn-title-text { font-size: 12.5px; font-weight: 600; color: rgba(255,255,255,0.75); letter-spacing: 0.2px; white-space: nowrap; }

        /* ── Nav (menu-bar style) ─────────────────────── */
        .tn-nav { display: flex; align-items: center; gap: 1px; margin-left: 6px; height: 100%; flex: 1; min-width: 0; overflow: visible; }
        .tn-link {
          height: 26px; padding: 0 10px;
          display: flex; align-items: center; gap: 6px;
          border-radius: 4px; border: none; background: none;
          color: rgba(255,255,255,0.6); font-size: 12px; font-weight: 500;
          text-decoration: none !important; white-space: nowrap; cursor: pointer;
          transition: background 0.12s, color 0.12s;
          position: relative;
        }
        .tn-link i { font-size: 13px !important; }
        .tn-link:hover, .tn-link.active { background: rgba(255,255,255,0.09); color: #fff; text-decoration: none; }

        /* ── Events dropdown ─────────────────────────── */
        .tn-dd-wrap { position: relative; height: 100%; display: flex; align-items: center; }
        .tn-dd {
          position: absolute; top: calc(100% + 4px); left: 0;
          background: #1c1f26; border: 1px solid rgba(255,255,255,.09);
          border-radius: 8px; padding: 4px; min-width: 190px;
          z-index: 500; box-shadow: 0 16px 40px rgba(0,0,0,.55);
        }
        .tn-dd a {
          display: flex; align-items: center; gap: 9px;
          padding: 7px 10px; border-radius: 5px;
          color: rgba(255,255,255,0.7); font-size: 12.5px; font-weight: 500;
          text-decoration: none !important; transition: background 0.12s, color 0.12s;
        }
        .tn-dd a:hover { background: rgba(255,255,255,.08); color: #fff; }
        .tn-dd a.active { color: #4ade80; background: rgba(74,222,128,.08); }

        /* ── Right controls ──────────────────────────── */
        .tn-right { display: flex; align-items: center; gap: 2px; margin-left: auto; flex-shrink: 0; height: 100%; }
        .tn-icon-btn {
          width: 26px; height: 26px; border-radius: 4px;
          background: transparent; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.6); font-size: 14px; transition: background 0.12s, color 0.12s;
          text-decoration: none; position: relative;
        }
        .tn-icon-btn:hover { background: rgba(255,255,255,.09); color: #fff; }
        .tn-notif-dot {
          position: absolute; top: 1px; right: 1px;
          width: 13px; height: 13px; border-radius: 50%;
          background: #ef4444; color: #fff;
          font-size: 7.5px; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid #14171c;
        }

        /* ── Profile menu item ─────────────────────────── */
        .tn-prof-btn {
          height: 26px; padding: 0 10px;
          display: flex; align-items: center; gap: 6px;
          border-radius: 4px; border: none; background: none;
          color: rgba(255,255,255,0.6); font-size: 12px; font-weight: 500;
          cursor: pointer; transition: background 0.12s, color 0.12s;
        }
        .tn-prof-btn:hover { background: rgba(255,255,255,.09); color: #fff; }
        .tn-prof-av { width: 18px; height: 18px; border-radius: 4px; object-fit: cover; flex-shrink: 0; }
        .tn-prof-name { max-width: 110px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .tn-prof-chevron { font-size: 12px; opacity: 0.6; }

        /* ── Profile dropdown ─────────────────────────── */
        .tn-prof-dd {
          position: absolute; top: calc(100% + 4px); right: 0;
          background: #1c1f26; border: 1px solid rgba(255,255,255,.09);
          border-radius: 8px; min-width: 200px; z-index: 600;
          box-shadow: 0 16px 40px rgba(0,0,0,.55); padding: 4px;
        }
        .tn-prof-dd-head { padding: 10px 12px 8px; border-bottom: 1px solid rgba(255,255,255,.08); margin-bottom: 4px; }
        .tn-prof-dd a, .tn-prof-dd button {
          display: flex; align-items: center; gap: 9px;
          padding: 7px 10px; width: 100%;
          color: rgba(255,255,255,0.7); font-size: 12.5px; font-weight: 500;
          text-decoration: none !important; transition: background 0.12s, color 0.12s;
          background: transparent; border: none; border-radius: 5px; cursor: pointer; text-align: left;
        }
        .tn-prof-dd a:hover, .tn-prof-dd button:hover { background: rgba(255,255,255,.08); color: #fff; }
        .tn-prof-dd .logout-btn { color: #f87171; }
        .tn-prof-dd .logout-btn:hover { background: rgba(248,113,113,.1); color: #f87171; }

        /* ── Mobile bottom nav ───────────────────────── */
        .tn-mob-nav { display: none; }
        @media(max-width: 960px) {
          .tn-nav { display: none; }
          .tn-title-text { display: none; }
          .tn-mob-nav {
            display: flex; position: fixed; bottom: 0; left: 0; right: 0;
            z-index: 1200; background: #14171c;
            border-top: 1px solid rgba(255,255,255,.08);
            padding: 6px 0 10px;
          }
          .tn-mob-item {
            flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px;
            text-decoration: none; color: #64748b;
            font-size: 10px; font-weight: 600; padding: 4px 0;
            transition: color 0.15s; position: relative;
          }
          .tn-mob-item.active { color: #4ade80; }
          .tn-mob-item i { font-size: 20px; }
          .tn-mob-badge {
            position: absolute; top: 0; right: calc(50% - 18px);
            background: #ef4444; color: #fff; border-radius: 8px;
            padding: 1px 5px; font-size: 9px; font-weight: 800;
          }
        }
      `}</style>

      {/* ── Top bar ───────────────────────────────────── */}
      <div className="tn-bar">
        <Link href="/therapist-dashboard" className="tn-logo">
          <span className="tn-logo-badge"><ImageTag alt="CYT" height="30" width="30" src={logo1} style={{ objectFit: "contain", display: "block" }} /></span>
          <span className="tn-title-text">Choose Your Therapist — Therapist Portal</span>
        </Link>

        <nav className="tn-nav">
          {NAV.map((item) =>
            item.sub ? (
              <div
                key={item.label}
                className="tn-dd-wrap"
                onMouseEnter={() => setEventsOpen(true)}
                onMouseLeave={() => setEventsOpen(false)}
              >
                <span className={`tn-link${isItemActive(item) ? " active" : ""}`}>
                  <i className={item.icon}></i>
                  {item.label}
                  <i className="feather-chevron-down" style={{ fontSize: 10 }}></i>
                </span>
                {eventsOpen && (
                  <div className="tn-dd">
                    {item.sub.map((s) => (
                      <Link
                        key={s.to}
                        href={s.to}
                        className={pathname === s.to ? "active" : ""}
                      >
                        <i className={s.icon}></i>
                        {s.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.to}
                href={item.to}
                className={`tn-link${isItemActive(item) ? " active" : ""}`}
                onClick={item.hasBadge ? () => setNotificationCount(0) : undefined}
              >
                <i className={item.icon}></i>
                {item.label}
                {item.hasBadge && notificationCount > 0 && (
                  <span
                    style={{
                      background: "#ef4444", color: "#fff",
                      borderRadius: 8, padding: "1px 5px",
                      fontSize: 9, fontWeight: 800,
                    }}
                  >
                    {notificationCount}
                  </span>
                )}
              </Link>
            )
          )}
        </nav>

        <div className="tn-right">
          {/* Website link */}
          <a
            href="https://chooseyourtherapist.in"
            target="_blank"
            rel="noopener noreferrer"
            className="tn-icon-btn"
            title="Go to Website"
          >
            <i className="feather-globe"></i>
          </a>

          {/* Bell */}
          <Link
            href="/appointments"
            className="tn-icon-btn"
            onClick={() => setNotificationCount(0)}
          >
            <i className="feather-bell"></i>
            {notificationCount > 0 && (
              <span className="tn-notif-dot">{notificationCount}</span>
            )}
          </Link>

          {/* Profile */}
          <div
            style={{ position: "relative", height: "100%", display: "flex", alignItems: "center" }}
            onMouseEnter={() => setProfileOpen(true)}
            onMouseLeave={() => setProfileOpen(false)}
          >
            <button className="tn-prof-btn">
              <img src={avatarSrc} alt={therapistInfo?.user?.name || "Therapist"} className="tn-prof-av" />
              <span className="tn-prof-name">{therapistInfo?.user?.name || "Therapist"}</span>
              <i className="feather-chevron-down tn-prof-chevron"></i>
            </button>
            {profileOpen && (
              <div className="tn-prof-dd">
                <div className="tn-prof-dd-head">
                  <p style={{ color: "#fff", fontWeight: 700, fontSize: 13, margin: 0 }}>
                    {therapistInfo?.user?.name}
                  </p>
                  <p style={{ color: "#4ade80", fontSize: 10.5, margin: "2px 0 0", fontWeight: 500 }}>Therapist</p>
                </div>
                <Link href="/therapist-dashboard">
                  <i className="feather-home"></i> Dashboard
                </Link>
                <Link href="/settings">
                  <i className="feather-settings"></i> Edit Profile
                </Link>
                <Link href="/appointments">
                  <i className="feather-calendar"></i> Appointments
                </Link>
                <button onClick={handleLogout} className="logout-btn">
                  <i className="feather-log-out"></i> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile bottom nav ─────────────────────────── */}
      <div className="tn-mob-nav">
        {MOB_NAV.map((item) => (
          <Link
            key={item.to}
            href={item.to}
            className={`tn-mob-item${pathname === item.to ? " active" : ""}`}
            onClick={() => item.badge && setNotificationCount(0)}
          >
            {item.badge && notificationCount > 0 && (
              <span className="tn-mob-badge">{notificationCount}</span>
            )}
            <i className={item.icon}></i>
            {item.label}
          </Link>
        ))}
      </div>
    </>
  );
}
