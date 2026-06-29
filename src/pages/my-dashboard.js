import React, { useState, useEffect } from "react";
import Link from "next/link";
import UserLayout from "../components/dashboard/user-layout";
import DashAppointmentForm from "../components/dashboard/dash-appointment-form";
import { getClientDashboardDataUrl } from "../utils/url";
import { fetchById } from "../utils/actions";
import useUserStore from "../store/userStore";

const QUICK_LINKS = [
  { href: "/my-bookings",          icon: "feather-calendar",      label: "My Bookings",    desc: "View your sessions" },
  { href: "/my-therapists",        icon: "feather-heart",         label: "My Care",        desc: "Your therapist" },
  { href: "/my-workshop-bookings", icon: "feather-star",          label: "Events & Vibes", desc: "Workshops & events" },
  { href: "/my-settings",          icon: "feather-settings",      label: "Edit Profile",   desc: "Update your info" },
];

export default function UserDashboard() {
  const { userInfo } = useUserStore();
  const [data, setData]     = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchById(getClientDashboardDataUrl)
      .then(r => { if (r?.status) setData(r.data || {}); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const firstName = (userInfo?.name || "there").split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const stats = [
    { label: "Sessions",    value: data.bookings    ?? "—", icon: "feather-calendar",   color: "#16a34a", bg: "#f0fdf4" },
    { label: "Events",      value: data.events      ?? "—", icon: "feather-star",        color: "#7c3aed", bg: "#f5f3ff" },
    { label: "Appointments",value: data.appointments ?? "—", icon: "feather-clock",       color: "#0ea5e9", bg: "#f0f9ff" },
  ];

  return (
    <div id="__next">
      <style>{`
        .db-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px 22px; }
        .db-stat { display: flex; align-items: center; gap: 14px; }
        .db-stat-icon { width: 44px; height: 44px; border-radius: 11px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
        .db-ql { display: flex; align-items: center; gap: 12px; padding: 13px 16px; border-radius: 10px; border: 1px solid #e2e8f0; background: #fff; cursor: pointer; transition: all 0.15s; text-decoration: none; }
        .db-ql:hover { background: #f8fafc; border-color: #cbd5e1; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
        .db-ql-icon { width: 36px; height: 36px; border-radius: 9px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; color: #475569; flex-shrink: 0; }
        .db-apt-toggle { width: 100%; background: #16a34a; border: none; border-radius: 10px; padding: 13px 0; font-size: 14px; font-weight: 700; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background 0.15s; }
        .db-apt-toggle:hover { background: #15803d; }
      `}</style>

      <UserLayout title={data?.notify?.title}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>

          {/* ── LEFT: main content ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            {/* Welcome banner */}
            <div style={{ background: "linear-gradient(135deg,#0f172a 0%,#1e293b 100%)", borderRadius: 14, padding: "24px 28px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -30, right: -30, width: 180, height: 180, borderRadius: "50%", background: "rgba(22,163,74,0.12)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", bottom: -40, left: 60, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
              <div style={{ position: "relative" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.45)", marginBottom: 6, letterSpacing: "0.5px" }}>{greeting}</div>
                <h2 style={{ fontSize: 22, fontWeight: 900, color: "#fff", margin: "0 0 6px", letterSpacing: "-0.3px" }}>{firstName} 👋</h2>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", margin: 0, lineHeight: 1.6 }}>
                  Welcome to your wellness space. Your journey matters.
                </p>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              {stats.map(s => (
                <div key={s.label} className="db-card db-stat">
                  <div className="db-stat-icon" style={{ background: s.bg, color: s.color }}>
                    <i className={s.icon}></i>
                  </div>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", lineHeight: 1 }}>
                      {loading ? "—" : s.value}
                    </div>
                    <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 3, fontWeight: 600 }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick links */}
            <div className="db-card">
              <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 14 }}>Quick Access</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {QUICK_LINKS.map(ql => (
                  <Link key={ql.href} href={ql.href} className="db-ql">
                    <div className="db-ql-icon"><i className={ql.icon} style={{ fontSize: 15 }}></i></div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{ql.label}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>{ql.desc}</div>
                    </div>
                    <i className="feather-chevron-right" style={{ fontSize: 13, color: "#cbd5e1", marginLeft: "auto" }}></i>
                  </Link>
                ))}
              </div>
            </div>

          </div>

          {/* ── RIGHT: appointment form ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 90 }}>
            <div className="db-card" style={{ padding: 0, overflow: "hidden" }}>
              {/* Header */}
              <div style={{ background: "linear-gradient(135deg,#0f172a,#1e293b)", padding: "16px 20px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>Book a Session</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>Request Appointment</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>We'll confirm via WhatsApp</div>
              </div>
              <div style={{ padding: "0 20px 20px" }}>
                <DashAppointmentForm compact />
              </div>
            </div>
          </div>

        </div>
      </UserLayout>
    </div>
  );
}
