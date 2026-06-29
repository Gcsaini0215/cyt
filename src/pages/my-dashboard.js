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
        .db-feat { display: flex; flex-direction: column; gap: 12px; padding: 18px 18px; border-radius: 12px; border: 1px solid #e2e8f0; background: #fff; text-decoration: none; transition: all 0.15s; cursor: pointer; }
        .db-feat:hover { border-color: #cbd5e1; box-shadow: 0 4px 16px rgba(0,0,0,0.07); transform: translateY(-2px); }
        @media (max-width: 900px) {
          .db-layout { grid-template-columns: 1fr !important; }
          .db-form-sticky { position: static !important; }
          .db-feat-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 540px) {
          .db-feat-grid { grid-template-columns: 1fr !important; }
          .db-layout { padding: 16px 12px !important; }
        }
      `}</style>

      <ClientTopNav />

      <div style={{ background: "#f8fafc", minHeight: "100vh", paddingTop: 56, paddingBottom: 80 }}>
        <main style={{ padding: "28px 36px", maxWidth: 1300, margin: "0 auto" }}>
          <div className="db-layout" style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, alignItems: "start" }}>

            {/* ── LEFT: feature grid ── */}
            <div>
<div className="db-feat-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {FEATURE_CARDS.map(c => (
                  <Link key={c.label} href={c.href} className="db-feat">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ width: 42, height: 42, borderRadius: 11, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", color: c.color, fontSize: 19 }}>
                        <i className={c.icon}></i>
                      </div>
                      {c.tag && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 20, padding: "2px 8px" }}>{c.tag}</span>
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>{c.label}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>{c.desc}</div>
                    </div>
                  </Link>
                ))}
              </div>

            </div>

            {/* ── RIGHT: appointment form ── */}
            <div className="db-form-sticky" style={{ position: "sticky", top: 76 }}>
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden" }}>
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
