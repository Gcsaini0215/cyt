import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import useUserStore from "../../store/userStore";
import { removeToken } from "../../utils/jwt";
import { defaultProfile, imagePath, GetDashboardDataUrl } from "../../utils/url";
import { fetchById } from "../../utils/actions";

const logo1 = "/logo.png";

const NAV = [
  { to: "/my-dashboard", label: "Home", icon: "feather-home" },
];

const MOB_NAV = [
  { to: "/my-dashboard",         icon: "feather-home",     label: "Home" },
  { to: "/my-bookings",          icon: "feather-calendar", label: "Bookings" },
  { to: "/my-therapists",        icon: "feather-heart",    label: "My Care" },
  { to: "/my-workshop-bookings", icon: "feather-star",     label: "Events" },
  { to: "/my-settings",          icon: "feather-settings", label: "Settings" },
];

export default function ClientTopNav() {
  const { userInfo } = useUserStore();
  const router = useRouter();
  const pathname = router.pathname;
  const [profileOpen, setProfileOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetchById(GetDashboardDataUrl)
      .then(r => {
        if (r?.status && r.data?.appointmentRequests) {
          setAppointments(r.data.appointmentRequests.filter(
            a => a.status === "confirmed" || a.status === "rescheduled"
          ));
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    removeToken();
    router.push("/login");
  };

  const avatarSrc = userInfo?.profile ? `${imagePath}/${userInfo.profile}` : null;
  const initials = (userInfo?.name || "U").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <>
      <style>{`
        .ctn-bar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 1200;
          height: 56px; background: #1e293b;
          display: flex; align-items: center;
          padding: 0 16px 0 20px;
          box-shadow: 0 1px 0 rgba(255,255,255,.06);
          overflow: visible;
        }
        .ctn-logo {
          display: flex; align-items: center;
          text-decoration: none; flex-shrink: 0; margin-right: 24px;
        }
        .ctn-nav { display: flex; align-items: center; gap: 2px; flex: 1; overflow: visible; }
        .ctn-link {
          padding: 6px 11px; border-radius: 8px;
          font-size: 13px; font-weight: 600; color: #94a3b8;
          text-decoration: none; white-space: nowrap; cursor: pointer;
          display: flex; align-items: center; gap: 5px;
          border: none; background: transparent; transition: all 0.15s;
          position: relative;
        }
        .ctn-link:hover { color: #e2e8f0; background: rgba(255,255,255,.07); }
        .ctn-link.active { color: #fff; background: rgba(255,255,255,.1); }
        .ctn-link-underline {
          position: absolute; bottom: -1px; left: 50%; transform: translateX(-50%);
          width: 16px; height: 2px; background: #4ade80; border-radius: 2px;
        }
        .ctn-right { display: flex; align-items: center; gap: 6px; margin-left: auto; flex-shrink: 0; }
        .ctn-icon-btn {
          width: 34px; height: 34px; border-radius: 8px;
          background: transparent; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: #94a3b8; font-size: 18px; transition: all 0.15s;
          text-decoration: none; position: relative;
        }
        .ctn-icon-btn:hover { background: rgba(255,255,255,.08); color: #e2e8f0; }
        .ctn-notif-dot {
          position: absolute; top: 4px; right: 4px;
          width: 15px; height: 15px; border-radius: 50%;
          background: #ef4444; color: #fff;
          font-size: 8px; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid #1e293b;
        }
        .ctn-bell-dd {
          position: absolute; top: calc(100% + 8px); right: 0;
          background: #1e293b; border: 1px solid rgba(255,255,255,.09);
          border-radius: 14px; width: 300px; z-index: 600;
          box-shadow: 0 14px 36px rgba(0,0,0,.45); overflow: hidden;
        }
        .ctn-bell-head { padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,.08); font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.8px; }
        .ctn-bell-empty { padding: 20px 16px; text-align: center; font-size: 13px; color: #475569; }
        .ctn-bell-item { padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,.06); display: flex; gap: 10px; align-items: flex-start; }
        .ctn-bell-item:last-child { border-bottom: none; }
        .ctn-prof-btn {
          display: flex; align-items: center; gap: 7px;
          background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.1);
          border-radius: 10px; padding: 4px 10px 4px 4px;
          cursor: pointer; transition: all 0.15s; user-select: none;
        }
        .ctn-prof-btn:hover { background: rgba(255,255,255,.12); }
        .ctn-prof-av {
          width: 28px; height: 28px; border-radius: 8px; object-fit: cover; flex-shrink: 0;
        }
        .ctn-prof-name {
          font-size: 13px; font-weight: 700; color: #e2e8f0;
          max-width: 110px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .ctn-prof-chevron { font-size: 12px; color: #64748b; }
        .ctn-prof-dd {
          position: absolute; top: calc(100% + 8px); right: 0;
          background: #1e293b; border: 1px solid rgba(255,255,255,.09);
          border-radius: 14px; min-width: 200px; z-index: 600;
          box-shadow: 0 14px 36px rgba(0,0,0,.45); overflow: hidden;
        }
        .ctn-prof-dd-head { padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,.08); }
        .ctn-prof-dd a, .ctn-prof-dd button {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 16px; width: 100%;
          color: #94a3b8; font-size: 13px; font-weight: 600;
          text-decoration: none; transition: all 0.15s;
          background: transparent; border: none; cursor: pointer; text-align: left;
        }
        .ctn-prof-dd a:hover, .ctn-prof-dd button:hover { background: rgba(255,255,255,.06); color: #e2e8f0; }
        .ctn-logout { color: #ef4444 !important; }
        .ctn-logout:hover { background: rgba(239,68,68,.08) !important; color: #ef4444 !important; }
        .ctn-mob-nav { display: none; }
        @media(max-width: 960px) {
          .ctn-nav { display: none; }
          .ctn-mob-nav {
            display: flex; position: fixed; bottom: 0; left: 0; right: 0;
            z-index: 1200; background: #1e293b;
            border-top: 1px solid rgba(255,255,255,.08);
            padding: 6px 0 10px;
          }
          .ctn-mob-item {
            flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px;
            text-decoration: none; color: #64748b;
            font-size: 10px; font-weight: 600; padding: 4px 0;
            transition: color 0.15s;
          }
          .ctn-mob-item.active { color: #4ade80; }
          .ctn-mob-item i { font-size: 20px; }
        }
      `}</style>

      {/* Top bar */}
      <div className="ctn-bar">
        <Link href="/my-dashboard" className="ctn-logo">
          <div style={{ background: "#fff", borderRadius: "8px", padding: "3px 10px", display: "flex", alignItems: "center" }}>
            <img alt="CYT Logo" height="34" width="110" src={logo1} style={{ objectFit: "contain", display: "block" }} />
          </div>
        </Link>

        <nav className="ctn-nav">
          {NAV.map((item) => (
            <Link
              key={item.to}
              href={item.to}
              className={`ctn-link${pathname === item.to ? " active" : ""}`}
            >
              {item.label}
              {pathname === item.to && <span className="ctn-link-underline"></span>}
            </Link>
          ))}
        </nav>

        <div className="ctn-right">
          {/* Website link */}
          <a href="/" className="ctn-icon-btn" title="Go to Website">
            <i className="feather-globe"></i>
          </a>

          {/* Bell — confirmed appointments */}
          <div style={{ position: "relative" }}
            onMouseEnter={() => setBellOpen(true)}
            onMouseLeave={() => setBellOpen(false)}
          >
            <button className="ctn-icon-btn" onClick={() => setBellOpen(o => !o)}>
              <i className="feather-bell"></i>
              {appointments.length > 0 && (
                <span className="ctn-notif-dot">{appointments.length}</span>
              )}
            </button>
            {bellOpen && (
              <div className="ctn-bell-dd">
                <div className="ctn-bell-head">Upcoming Appointments</div>
                {appointments.length === 0 ? (
                  <div className="ctn-bell-empty">No confirmed appointments yet.</div>
                ) : (
                  appointments.map(req => {
                    const isRescheduled = req.status === "rescheduled";
                    const color = isRescheduled ? "#60a5fa" : "#4ade80";
                    return (
                      <div key={req._id} className="ctn-bell-item">
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: isRescheduled ? "rgba(96,165,250,0.12)" : "rgba(74,222,128,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>
                          <i className="feather-clock" style={{ fontSize: 14 }}></i>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>{req.concern || "Therapy Session"}</div>
                          {req.confirmedTime && <div style={{ fontSize: 12, color, marginTop: 2, fontWeight: 600 }}>{req.confirmedTime}</div>}
                          {req.adminNote && <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{req.adminNote}</div>}
                          <span style={{ fontSize: 10, fontWeight: 700, color, marginTop: 3, display: "inline-block" }}>
                            {isRescheduled ? "Rescheduled" : "Confirmed"}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Profile dropdown */}
          <div
            style={{ position: "relative" }}
            onMouseEnter={() => setProfileOpen(true)}
            onMouseLeave={() => setProfileOpen(false)}
          >
            <div className="ctn-prof-btn">
              {avatarSrc
                ? <img src={avatarSrc} alt={userInfo?.name || "User"} className="ctn-prof-av" />
                : <div style={{ width: 28, height: 28, borderRadius: 8, background: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{initials}</div>
              }
              <span className="ctn-prof-name">{userInfo?.name || "My Account"}</span>
              <i className="feather-chevron-down ctn-prof-chevron"></i>
            </div>
            {profileOpen && (
              <div className="ctn-prof-dd">
                <div className="ctn-prof-dd-head">
                  <p style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 14, margin: 0 }}>
                    {userInfo?.name || "My Account"}
                  </p>
                  <p style={{ color: "#64748b", fontSize: 12, margin: "2px 0 0" }}>{userInfo?.email || "Client"}</p>
                </div>
                <Link href="/my-dashboard"><i className="feather-home"></i> Dashboard</Link>
                <Link href="/my-bookings"><i className="feather-calendar"></i> My Bookings</Link>
                <Link href="/my-settings"><i className="feather-settings"></i> Edit Profile</Link>
                <button onClick={handleLogout} className="ctn-logout">
                  <i className="feather-log-out"></i> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="ctn-mob-nav">
        {MOB_NAV.map((item) => (
          <Link
            key={item.to}
            href={item.to}
            className={`ctn-mob-item${pathname === item.to ? " active" : ""}`}
          >
            <i className={item.icon}></i>
            {item.label}
          </Link>
        ))}
      </div>
    </>
  );
}
