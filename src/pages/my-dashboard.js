import React, { useState, useEffect } from "react";
import Link from "next/link";
import ClientTopNav from "../components/dashboard/client-top-nav";
import DashAppointmentForm from "../components/dashboard/dash-appointment-form";
import TherapistSearchModal from "../components/dashboard/therapist-search-modal";
import { GetDashboardDataUrl } from "../utils/url";
import { fetchById } from "../utils/actions";

const FEATURE_CARDS = [
  { icon: "feather-search",     color: "#0f172a", bg: "#f1f5f9", label: "Find a Therapist",        desc: "Browse all verified therapists and find your match",          href: null,               tag: null, action: "therapist-search" },
  { icon: "feather-clipboard",  color: "#7c3aed", bg: "#f5f3ff", label: "Self Assessment",        desc: "Understand your mental health with quick assessments",        href: "/self-assessment", tag: "Coming Soon" },
  { icon: "feather-book-open",  color: "#0ea5e9", bg: "#f0f9ff", label: "Digital Journaling",     desc: "Write, reflect, and track your emotional journey",            href: "/my-journal",      tag: "Coming Soon" },
  { icon: "feather-file-text",  color: "#f59e0b", bg: "#fffbeb", label: "Worksheets",             desc: "Therapeutic exercises and worksheets for self-growth",        href: "/worksheets",      tag: "Coming Soon" },
  { icon: "feather-calendar",   color: "#16a34a", bg: "#f0fdf4", label: "Session History",        desc: "View your past appointments and session notes",               href: "/my-bookings",     tag: null },
  { icon: "feather-sun",        color: "#f97316", bg: "#fff7ed", label: "Mood Tracker",           desc: "Log your daily mood and track emotional patterns",            href: "/mood-tracker",    tag: "Coming Soon" },
  { icon: "feather-heart",      color: "#e11d48", bg: "#fff1f2", label: "My Therapist",           desc: "View your assigned therapist's profile and details",          href: "/my-therapists",   tag: "Coming Soon" },
  { icon: "feather-video",      color: "#0891b2", bg: "#ecfeff", label: "Upcoming Sessions",      desc: "See your next booked therapy sessions",                       href: "/my-bookings",     tag: "Coming Soon" },
  { icon: "feather-activity",   color: "#dc2626", bg: "#fef2f2", label: "My Reports",             desc: "Access your session reports and progress notes",              href: "/my-reports",      tag: "Coming Soon" },
  { icon: "feather-headphones", color: "#6d28d9", bg: "#f5f3ff", label: "Meditation & Resources", desc: "Guided meditations and mental wellness resources",             href: "/resources",       tag: "Coming Soon" },
  { icon: "feather-users",      color: "#059669", bg: "#ecfdf5", label: "Refer a Friend",         desc: "Share CYT with someone who needs support",                    href: "/refer",           tag: "Coming Soon" },
];

export default function UserDashboard() {
  const [data, setData]       = useState({});
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [therapistModalOpen, setTherapistModalOpen] = useState(false);

  useEffect(() => {
    fetchById(GetDashboardDataUrl)
      .then(r => { if (r?.status) setData(r.data || {}); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // close on Escape key
  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e) => { if (e.key === "Escape") setModalOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen]);

  return (
    <>
      <style>{`
        .db-feat {
          display: flex; flex-direction: column; gap: 14px;
          padding: 20px; border-radius: 14px;
          border: 1px solid #e2e8f0; background: #fff;
          text-decoration: none; transition: all 0.18s; cursor: pointer;
          box-sizing: border-box;
        }
        .db-feat:hover {
          border-color: #cbd5e1;
          box-shadow: 0 6px 20px rgba(0,0,0,0.08);
          transform: translateY(-2px);
        }
        .db-feat-soon {
          display: flex; flex-direction: column; gap: 14px;
          padding: 20px; border-radius: 14px;
          border: 1.5px solid #fecaca; background: #fff9f9;
          text-decoration: none; transition: all 0.18s; cursor: not-allowed;
          box-sizing: border-box; opacity: 0.72;
        }
        .db-shell {
          min-height: calc(100vh - 56px);
          background: #f8fafc;
          padding: 24px 32px 100px;
          box-sizing: border-box;
        }
        .db-feat-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          max-width: 1200px;
          margin: 0 auto;
        }
        /* FAB button */
        .db-fab {
          position: fixed; bottom: 28px; right: 28px; z-index: 900;
          display: flex; align-items: center; gap: 10px;
          background: #16a34a; color: #fff;
          border: none; border-radius: 50px;
          padding: 14px 24px; font-size: 14px; font-weight: 700;
          cursor: pointer; box-shadow: 0 8px 24px rgba(22,163,74,0.4);
          transition: all 0.18s;
        }
        .db-fab:hover { background: #15803d; transform: translateY(-2px); box-shadow: 0 12px 28px rgba(22,163,74,0.45); }

        /* Modal overlay */
        .db-overlay {
          position: fixed; inset: 0; z-index: 1300;
          background: rgba(0,0,0,0.55);
          display: flex; align-items: center; justify-content: center;
          padding: 16px;
          animation: db-fadein 0.18s ease;
        }
        @keyframes db-fadein { from { opacity: 0 } to { opacity: 1 } }

        /* Modal panel */
        .db-modal {
          background: #fff; border-radius: 18px;
          width: 100%; max-width: 480px;
          max-height: 90vh; overflow-y: auto;
          box-shadow: 0 24px 60px rgba(0,0,0,0.22);
          animation: db-slidein 0.2s ease;
        }
        @keyframes db-slidein { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }

        .db-modal-head {
          background: linear-gradient(135deg,#0f172a,#1e293b);
          padding: 18px 22px;
          display: flex; align-items: flex-start; justify-content: space-between;
          border-radius: 18px 18px 0 0;
          position: sticky; top: 0; z-index: 1;
        }
        .db-modal-close {
          width: 30px; height: 30px; border-radius: 8px;
          background: rgba(255,255,255,0.1); border: none;
          color: #94a3b8; font-size: 18px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.15s; flex-shrink: 0; margin-top: 2px;
        }
        .db-modal-close:hover { background: rgba(255,255,255,0.18); color: #fff; }

        /* Tablet */
        @media (max-width: 1024px) {
          .db-feat-grid { grid-template-columns: repeat(4, 1fr); }
          .db-shell { padding: 20px 20px 100px; }
        }
        /* Mobile */
        @media (max-width: 600px) {
          .db-feat-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
          .db-shell { padding: 14px 10px 90px; }
          .db-fab { bottom: 72px; right: 16px; padding: 13px 20px; font-size: 13px; }
          .db-feat, .db-feat-soon { padding: 14px 10px; gap: 10px; }
        }
      `}</style>

      <ClientTopNav />

      <div style={{ paddingTop: 56 }}>
        <div className="db-shell">
          <div className="db-feat-grid">
            {FEATURE_CARDS.map(c => {
              const inner = (
                <>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", color: c.color, fontSize: 20, flexShrink: 0 }}>
                      <i className={c.icon}></i>
                    </div>
                    {c.tag && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 20, padding: "2px 9px" }}>{c.tag}</span>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>{c.label}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>{c.desc}</div>
                  </div>
                </>
              );
              if (c.action === "therapist-search") {
                return (
                  <div key={c.label} className="db-feat" onClick={() => setTherapistModalOpen(true)}>
                    {inner}
                  </div>
                );
              }
              if (c.tag === "Coming Soon") {
                return (
                  <div key={c.label} className="db-feat-soon">
                    {inner}
                  </div>
                );
              }
              return (
                <Link key={c.label} href={c.href} className="db-feat">
                  {inner}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button className="db-fab" onClick={() => setModalOpen(true)}>
        <i className="feather-plus-circle" style={{ fontSize: 18 }}></i>
        Request Appointment
      </button>

      {/* Therapist search modal */}
      <TherapistSearchModal open={therapistModalOpen} onClose={() => setTherapistModalOpen(false)} />

      {/* Appointment modal */}
      {modalOpen && (
        <div className="db-overlay" onClick={e => { if (e.target === e.currentTarget) setModalOpen(false); }}>
          <div className="db-modal">
            <div className="db-modal-head">
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 4 }}>Book a Session</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>Request Appointment</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 3 }}>We'll confirm via WhatsApp</div>
              </div>
              <button className="db-modal-close" onClick={() => setModalOpen(false)}>
                <i className="feather-x"></i>
              </button>
            </div>
            <div style={{ padding: "4px 20px 24px" }}>
              <DashAppointmentForm compact />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
