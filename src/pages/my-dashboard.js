import React, { useState, useEffect } from "react";
import Link from "next/link";
import ClientTopNav from "../components/dashboard/client-top-nav";
import DashAppointmentForm from "../components/dashboard/dash-appointment-form";
import { GetDashboardDataUrl } from "../utils/url";
import { fetchById } from "../utils/actions";

const FEATURE_CARDS = [
  {
    icon: "feather-clipboard",
    color: "#7c3aed",
    bg: "#f5f3ff",
    label: "Self Assessment",
    desc: "Understand your mental health with quick assessments",
    href: "/self-assessment",
    tag: "Coming Soon",
  },
  {
    icon: "feather-book-open",
    color: "#0ea5e9",
    bg: "#f0f9ff",
    label: "Digital Journaling",
    desc: "Write, reflect, and track your emotional journey",
    href: "/my-journal",
    tag: "Coming Soon",
  },
  {
    icon: "feather-file-text",
    color: "#f59e0b",
    bg: "#fffbeb",
    label: "Worksheets",
    desc: "Therapeutic exercises and worksheets for self-growth",
    href: "/worksheets",
    tag: "Coming Soon",
  },
  {
    icon: "feather-calendar",
    color: "#16a34a",
    bg: "#f0fdf4",
    label: "Session History",
    desc: "View your past appointments and session notes",
    href: "/my-bookings",
    tag: null,
  },
];

export default function UserDashboard() {
  const [data, setData]     = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchById(GetDashboardDataUrl)
      .then(r => { if (r?.status) setData(r.data || {}); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <style>{`
        /* ── Feature card ── */
        .db-feat {
          display: flex; flex-direction: column; gap: 14px;
          padding: 20px; border-radius: 14px;
          border: 1px solid #e2e8f0; background: #fff;
          text-decoration: none; transition: all 0.18s; cursor: pointer;
          height: 100%; box-sizing: border-box;
        }
        .db-feat:hover {
          border-color: #cbd5e1;
          box-shadow: 0 6px 20px rgba(0,0,0,0.08);
          transform: translateY(-2px);
        }

        /* ── Outer shell: topnav=56px, page fills rest ── */
        .db-shell {
          min-height: calc(100vh - 56px);
          background: #f8fafc;
          padding: 24px 32px 32px;
          box-sizing: border-box;
        }

        /* ── Two-column layout ── */
        .db-layout {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 24px;
          align-items: start;
          max-width: 1280px;
          margin: 0 auto;
        }

        /* ── Left: 2×2 card grid fills the column ── */
        .db-feat-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr 1fr;
          gap: 16px;
        }

        /* ── Right: form panel ── */
        .db-form-panel {
          position: sticky;
          top: 72px;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          overflow: hidden;
        }

        /* ── Tablet ── */
        @media (max-width: 1024px) {
          .db-layout { grid-template-columns: 1fr 340px; gap: 18px; }
          .db-shell { padding: 20px 20px 40px; }
        }

        /* ── Mobile: stack vertically ── */
        @media (max-width: 768px) {
          .db-layout { grid-template-columns: 1fr; }
          .db-form-panel { position: static; }
          .db-shell { padding: 16px 14px 80px; }
        }

        /* ── Small mobile: single column cards ── */
        @media (max-width: 480px) {
          .db-feat-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <ClientTopNav />

      <div style={{ paddingTop: 56 }}>
        <div className="db-shell">
          <div className="db-layout">

            {/* ── LEFT: 2×2 feature grid ── */}
            <div className="db-feat-grid">
              {FEATURE_CARDS.map(c => (
                <Link key={c.label} href={c.href} className="db-feat">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: c.bg, display: "flex", alignItems: "center",
                      justifyContent: "center", color: c.color, fontSize: 20, flexShrink: 0,
                    }}>
                      <i className={c.icon}></i>
                    </div>
                    {c.tag && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: "#94a3b8",
                        background: "#f1f5f9", border: "1px solid #e2e8f0",
                        borderRadius: 20, padding: "2px 9px",
                      }}>{c.tag}</span>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginBottom: 5 }}>{c.label}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>{c.desc}</div>
                  </div>
                </Link>
              ))}
            </div>

            {/* ── RIGHT: appointment form ── */}
            <div className="db-form-panel">
              <div style={{ background: "linear-gradient(135deg,#0f172a,#1e293b)", padding: "18px 22px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 5 }}>Book a Session</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>Request Appointment</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 3 }}>We'll confirm via WhatsApp</div>
              </div>
              <div style={{ padding: "4px 20px 22px" }}>
                <DashAppointmentForm compact />
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
