import React, { useState, useEffect } from "react";
import Link from "next/link";
import ClientTopNav from "../components/dashboard/client-top-nav";
import DashAppointmentForm from "../components/dashboard/dash-appointment-form";
import { GetDashboardDataUrl } from "../utils/url";
import { fetchById } from "../utils/actions";
import useUserStore from "../store/userStore";

const QUICK_LINKS = [
  { href: "/my-bookings",          icon: "feather-calendar",  label: "My Bookings",    desc: "View your sessions" },
  { href: "/my-therapists",        icon: "feather-heart",     label: "My Care",        desc: "Your therapist" },
  { href: "/my-workshop-bookings", icon: "feather-star",      label: "Events & Vibes", desc: "Workshops & events" },
  { href: "/my-settings",          icon: "feather-settings",  label: "Edit Profile",   desc: "Update your info" },
];

export default function UserDashboard() {
  const { userInfo } = useUserStore();
  const [data, setData]     = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchById(GetDashboardDataUrl)
      .then(r => { if (r?.status) setData(r.data || {}); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const firstName = (userInfo?.name || "there").split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const sessionCount = data.bookings ?? "—";

  return (
    <>
      <style>{`
        .db-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px 22px; }
        .db-stat { display: flex; align-items: center; gap: 14px; }
        .db-stat-icon { width: 44px; height: 44px; border-radius: 11px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
        .db-ql { display: flex; align-items: center; gap: 12px; padding: 13px 16px; border-radius: 10px; border: 1px solid #e2e8f0; background: #fff; cursor: pointer; transition: all 0.15s; text-decoration: none; }
        .db-ql:hover { background: #f8fafc; border-color: #cbd5e1; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
        .db-ql-icon { width: 36px; height: 36px; border-radius: 9px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; color: #475569; flex-shrink: 0; }
        @media (max-width: 900px) {
          .db-main-grid { grid-template-columns: 1fr !important; }
          .db-apt-sticky { position: static !important; }
        }
        @media (max-width: 600px) {
          .db-ql-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <ClientTopNav />

      <div style={{ background: "#f8fafc", minHeight: "100vh", paddingTop: 56, paddingBottom: 80 }}>
        <main style={{ padding: "28px 40px", maxWidth: 1400, margin: "0 auto" }}>

          {/* Two-column grid: main content + appointment sidebar */}
          <div className="db-main-grid" style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>

            {/* ── LEFT: main content ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              {/* Quick links */}
              <div className="db-card">
                <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 14 }}>Quick Access</div>
                <div className="db-ql-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
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

              {/* Appointment requests */}
              {!loading && data.appointmentRequests && data.appointmentRequests.length > 0 && (
                <div className="db-card">
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 14 }}>Your Appointment Requests</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {data.appointmentRequests.map(req => {
                      const isConfirmed   = req.status === "confirmed";
                      const isRescheduled = req.status === "rescheduled";
                      const isPending     = req.status === "pending";
                      const isCancelled   = req.status === "cancelled";

                      const statusColor = isConfirmed ? "#16a34a"
                        : isRescheduled ? "#2563eb"
                        : isCancelled   ? "#dc2626"
                        : "#f59e0b";
                      const statusBg = isConfirmed ? "#f0fdf4"
                        : isRescheduled ? "#eff6ff"
                        : isCancelled   ? "#fef2f2"
                        : "#fffbeb";
                      const statusLabel = isConfirmed ? "Confirmed"
                        : isRescheduled ? "Rescheduled"
                        : isCancelled   ? "Cancelled"
                        : "Pending";

                      return (
                        <div key={req._id} style={{ border: `1.5px solid ${isConfirmed || isRescheduled ? statusColor + "40" : "#e2e8f0"}`, borderRadius: 10, padding: "14px 16px", background: isConfirmed || isRescheduled ? statusBg : "#fafafa" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                              {req.concern || "Appointment Request"}
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 700, color: statusColor, background: statusBg, border: `1px solid ${statusColor}40`, borderRadius: 20, padding: "2px 10px" }}>
                              {statusLabel}
                            </span>
                          </div>

                          {(isConfirmed || isRescheduled) && req.confirmedTime && (
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                              <i className="feather-clock" style={{ fontSize: 12, color: statusColor }}></i>
                              <span style={{ fontSize: 13, fontWeight: 700, color: statusColor }}>{req.confirmedTime}</span>
                            </div>
                          )}

                          {isPending && (
                            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                              We'll confirm your time via WhatsApp soon.
                            </div>
                          )}

                          {req.adminNote && (
                            <div style={{ marginTop: 6, fontSize: 12, color: "#475569", background: "#f1f5f9", borderRadius: 6, padding: "6px 10px", borderLeft: `3px solid ${statusColor}` }}>
                              {req.adminNote}
                            </div>
                          )}

                          {req.preferredTime && isPending && (
                            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                              Preferred: {req.preferredTime}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

            {/* ── RIGHT: appointment form ── */}
            <div className="db-apt-sticky" style={{ display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 76 }}>
              <div className="db-card" style={{ padding: 0, overflow: "hidden" }}>
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
        </main>
      </div>
    </>
  );
}
