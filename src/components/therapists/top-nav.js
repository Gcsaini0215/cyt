import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import ImageTag from "../../utils/image-tag";
import useTherapistStore from "../../store/therapistStore";
import { removeToken } from "../../utils/jwt";
import { defaultProfile, imagePath, getBookings } from "../../utils/url";
import { fetchById } from "../../utils/actions";
import { toast } from "react-toastify";

const logo1 = "/logo.png";

const NAV = [
  { to: "/therapist-dashboard", label: "Dashboard", icon: "feather-home" },
  { to: "/appointments", label: "Sessions", icon: "feather-calendar", hasBadge: true },
  { to: "/settings", label: "Settings", icon: "feather-settings" },
];

const MOB_NAV = [
  { to: "/therapist-dashboard", icon: "feather-home", label: "Home" },
  { to: "/appointments", icon: "feather-calendar", label: "Sessions", badge: true },
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
        /* ── Bar ─────────────────────────────────────── */
        .tn-bar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 1200;
          height: 56px; background: #1e293b;
          display: flex; align-items: center;
          padding: 0 16px 0 20px;
          box-shadow: 0 1px 0 rgba(255,255,255,.06);
          overflow: visible;
        }

        /* ── Logo ─────────────────────────────────────── */
        .tn-logo {
          display: flex; align-items: center;
          text-decoration: none; flex-shrink: 0; margin-right: 20px;
        }

        /* ── Nav ──────────────────────────────────────── */
        .tn-nav { display: flex; align-items: center; gap: 2px; flex: 1; overflow: visible; }
        .tn-link {
          padding: 6px 11px; border-radius: 8px;
          font-size: 13px; font-weight: 600; color: #94a3b8;
          text-decoration: none; white-space: nowrap; cursor: pointer;
          display: flex; align-items: center; gap: 5px;
          border: none; background: transparent; transition: all 0.15s;
          position: relative;
        }
        .tn-link:hover { color: #e2e8f0; background: rgba(255,255,255,.07); }
        .tn-link.active { color: #fff; background: rgba(255,255,255,.1); }
        .tn-link-underline {
          position: absolute; bottom: -1px; left: 50%; transform: translateX(-50%);
          width: 16px; height: 2px; background: #4ade80; border-radius: 2px;
        }

        /* ── Events dropdown ─────────────────────────── */
        .tn-dd-wrap { position: relative; }
        .tn-dd {
          position: absolute; top: calc(100% + 8px); left: 0;
          background: #1e293b; border: 1px solid rgba(255,255,255,.09);
          border-radius: 12px; padding: 6px; min-width: 180px;
          z-index: 500; box-shadow: 0 12px 32px rgba(0,0,0,.4);
        }
        .tn-dd a {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 12px; border-radius: 8px;
          color: #94a3b8; font-size: 13px; font-weight: 600;
          text-decoration: none; transition: all 0.15s;
        }
        .tn-dd a:hover { background: rgba(255,255,255,.07); color: #e2e8f0; }
        .tn-dd a.active { color: #4ade80; background: rgba(74,222,128,.08); }

        /* ── Right controls ──────────────────────────── */
        .tn-right { display: flex; align-items: center; gap: 6px; margin-left: auto; flex-shrink: 0; }
        .tn-icon-btn {
          width: 34px; height: 34px; border-radius: 8px;
          background: transparent; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: #94a3b8; font-size: 18px; transition: all 0.15s;
          text-decoration: none; position: relative;
        }
        .tn-icon-btn:hover { background: rgba(255,255,255,.08); color: #e2e8f0; }
        .tn-notif-dot {
          position: absolute; top: 4px; right: 4px;
          width: 15px; height: 15px; border-radius: 50%;
          background: #ef4444; color: #fff;
          font-size: 8px; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid #1e293b;
        }

        /* ── Profile button ──────────────────────────── */
        .tn-prof-btn {
          display: flex; align-items: center; gap: 7px;
          background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.1);
          border-radius: 10px; padding: 4px 10px 4px 4px;
          cursor: pointer; transition: all 0.15s; user-select: none;
        }
        .tn-prof-btn:hover { background: rgba(255,255,255,.12); }
        .tn-prof-av {
          width: 28px; height: 28px; border-radius: 8px; object-fit: cover; flex-shrink: 0;
        }
        .tn-prof-name {
          font-size: 13px; font-weight: 700; color: #e2e8f0;
          max-width: 110px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .tn-prof-chevron { font-size: 12px; color: #64748b; }

        /* ── Profile dropdown ─────────────────────────── */
        .tn-prof-dd {
          position: absolute; top: calc(100% + 8px); right: 0;
          background: #1e293b; border: 1px solid rgba(255,255,255,.09);
          border-radius: 14px; min-width: 200px; z-index: 600;
          box-shadow: 0 14px 36px rgba(0,0,0,.45); overflow: hidden;
        }
        .tn-prof-dd-head { padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,.08); }
        .tn-prof-dd a, .tn-prof-dd button {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 16px; width: 100%;
          color: #94a3b8; font-size: 13px; font-weight: 600;
          text-decoration: none; transition: all 0.15s;
          background: transparent; border: none; cursor: pointer; text-align: left;
        }
        .tn-prof-dd a:hover, .tn-prof-dd button:hover { background: rgba(255,255,255,.06); color: #e2e8f0; }
        .tn-prof-dd .logout-btn { color: #ef4444; }
        .tn-prof-dd .logout-btn:hover { background: rgba(239,68,68,.08); color: #ef4444; }

        /* ── Mobile bottom nav ───────────────────────── */
        .tn-mob-nav { display: none; }
        @media(max-width: 960px) {
          .tn-nav { display: none; }
          .tn-mob-nav {
            display: flex; position: fixed; bottom: 0; left: 0; right: 0;
            z-index: 1200; background: #1e293b;
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
          <div style={{ background: "#fff", borderRadius: "8px", padding: "3px 10px", display: "flex", alignItems: "center" }}>
            <ImageTag alt="CYT Logo" height="34" width="110" src={logo1} style={{ objectFit: "contain", display: "block" }} />
          </div>
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
                  {item.label}
                  <i className="feather-chevron-down" style={{ fontSize: 11 }}></i>
                  {isItemActive(item) && <span className="tn-link-underline"></span>}
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
                {item.label}
                {item.hasBadge && notificationCount > 0 && (
                  <span
                    style={{
                      background: "#ef4444", color: "#fff",
                      borderRadius: 8, padding: "1px 6px",
                      fontSize: 10, fontWeight: 800,
                    }}
                  >
                    {notificationCount}
                  </span>
                )}
                {isItemActive(item) && <span className="tn-link-underline"></span>}
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
            style={{ position: "relative" }}
            onMouseEnter={() => setProfileOpen(true)}
            onMouseLeave={() => setProfileOpen(false)}
          >
            <div className="tn-prof-btn">
              <img src={avatarSrc} alt={therapistInfo?.user?.name || "Therapist"} className="tn-prof-av" />
              <span className="tn-prof-name">{therapistInfo?.user?.name || "Therapist"}</span>
              <i className="feather-chevron-down tn-prof-chevron"></i>
            </div>
            {profileOpen && (
              <div className="tn-prof-dd">
                <div className="tn-prof-dd-head">
                  <p style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 14, margin: 0 }}>
                    {therapistInfo?.user?.name}
                  </p>
                  <p style={{ color: "#64748b", fontSize: 12, margin: "2px 0 0" }}>Therapist</p>
                </div>
                <Link href="/therapist-dashboard">
                  <i className="feather-home"></i> Dashboard
                </Link>
                <Link href="/settings">
                  <i className="feather-settings"></i> Edit Profile
                </Link>
                <Link href="/appointments">
                  <i className="feather-calendar"></i> Sessions
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
