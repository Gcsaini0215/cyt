import React, { useState, useEffect, useRef } from "react";
import { fetchData } from "../../utils/actions";
import { getTherapistProfiles, imagePath, defaultProfile } from "../../utils/url";
import DashAppointmentForm from "./dash-appointment-form";

function TherapistMiniCard({ t, onSelect }) {
  const photo = t.user?.profile ? `${imagePath}/${t.user.profile}` : defaultProfile;
  const name  = t.user?.name || "Therapist";

  return (
    <div
      onClick={() => onSelect(t)}
      style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "14px 16px", borderRadius: 12,
        border: "1px solid #e2e8f0", background: "#fff",
        transition: "all 0.15s", cursor: "pointer",
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "#16a34a"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.07)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <img
        src={photo} alt={name}
        style={{ width: 52, height: 52, borderRadius: 12, objectFit: "cover", flexShrink: 0, border: "2px solid #f1f5f9" }}
        onError={e => { e.target.src = defaultProfile; }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
          {t.priority === 1 && (
            <span style={{ fontSize: 9, fontWeight: 700, color: "#16a34a", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 20, padding: "1px 7px", flexShrink: 0 }}>Recommended</span>
          )}
        </div>
        {t.profile_type && <div style={{ fontSize: 12, color: "#64748b", marginBottom: 3 }}>{t.profile_type}</div>}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {t.year_of_exp && <span style={{ fontSize: 11, color: "#475569" }}><i className="feather-award" style={{ fontSize: 10, color: "#94a3b8", marginRight: 3 }}></i>{t.year_of_exp}y exp</span>}
          {t.language_spoken && <span style={{ fontSize: 11, color: "#475569" }}><i className="feather-globe" style={{ fontSize: 10, color: "#94a3b8", marginRight: 3 }}></i>{t.language_spoken}</span>}
          {t.state && <span style={{ fontSize: 11, color: "#475569" }}><i className="feather-map-pin" style={{ fontSize: 10, color: "#94a3b8", marginRight: 3 }}></i>{t.state}</span>}
        </div>
      </div>
      <i className="feather-chevron-right" style={{ fontSize: 14, color: "#cbd5e1", flexShrink: 0 }}></i>
    </div>
  );
}

export default function TherapistSearchModal({ open, onClose }) {
  const [therapists, setTherapists]   = useState([]);
  const [filtered, setFiltered]       = useState([]);
  const [loading, setLoading]         = useState(false);
  const [search, setSearch]           = useState("");
  const [selected, setSelected]       = useState(null); // therapist chosen → show apt form
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!open || fetchedRef.current) return;
    fetchedRef.current = true;
    setLoading(true);
    fetchData(getTherapistProfiles)
      .then(res => { const l = res?.data || []; setTherapists(l); setFiltered(l); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open]);

  useEffect(() => {
    const q = search.trim().toLowerCase();
    if (!q) { setFiltered(therapists); return; }
    setFiltered(therapists.filter(t =>
      (t.user?.name || "").toLowerCase().includes(q) ||
      (t.profile_type || "").toLowerCase().includes(q) ||
      (t.state || "").toLowerCase().includes(q) ||
      (t.language_spoken || "").toLowerCase().includes(q) ||
      (t.services_offered || "").toLowerCase().includes(q)
    ));
  }, [search, therapists]);

  useEffect(() => {
    if (!open) return;
    const fn = e => { if (e.key === "Escape") { if (selected) setSelected(null); else onClose(); } };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [open, onClose, selected]);

  if (!open) return null;

  return (
    <>
      <style>{`
        .tsm-overlay {
          position: fixed; inset: 0; z-index: 1400;
          background: rgba(0,0,0,0.6);
          display: flex; align-items: flex-end;
          animation: tsmFadeIn 0.18s ease;
        }
        @keyframes tsmFadeIn { from{opacity:0} to{opacity:1} }
        .tsm-drawer {
          width: 100%; background: #f8fafc;
          border-radius: 20px 20px 0 0;
          max-height: 92vh;
          display: flex; flex-direction: column;
          animation: tsmSlideUp 0.22s cubic-bezier(0.34,1.2,0.64,1);
          box-shadow: 0 -8px 40px rgba(0,0,0,0.18);
        }
        @keyframes tsmSlideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
        .tsm-head {
          background: linear-gradient(135deg,#0f172a,#1e293b);
          padding: 18px 22px 16px;
          border-radius: 20px 20px 0 0;
          display: flex; align-items: center; justify-content: space-between;
          flex-shrink: 0;
        }
        .tsm-search {
          background: #fff; border: 1.5px solid #e2e8f0;
          border-radius: 10px; padding: 10px 14px 10px 38px;
          font-size: 14px; color: #0f172a; outline: none;
          width: 100%; box-sizing: border-box; font-family: inherit;
          transition: border-color 0.15s;
        }
        .tsm-search:focus { border-color: #16a34a; }
        .tsm-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .tsm-close-btn {
          width: 32px; height: 32px; border-radius: 9px;
          background: rgba(255,255,255,0.1); border: none;
          color: #94a3b8; font-size: 18px; cursor: pointer;
          display: flex; align-items: center; justify-content: center; transition: all 0.15s;
        }
        .tsm-close-btn:hover { background: rgba(239,68,68,0.3); color: #fff; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @media (max-width: 600px) {
          .tsm-grid { grid-template-columns: 1fr; }
          .tsm-drawer { max-height: 88vh; }
        }
      `}</style>

      <div className="tsm-overlay" onClick={e => { if (e.target === e.currentTarget) { if (selected) setSelected(null); else onClose(); } }}>
        <div className="tsm-drawer">

          {/* ── Header ── */}
          <div className="tsm-head">
            <div>
              {selected ? (
                <>
                  <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.55)", cursor: "pointer", fontSize: 12, fontWeight: 600, padding: 0, marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
                    <i className="feather-arrow-left" style={{ fontSize: 12 }}></i> Back to therapists
                  </button>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>Request Appointment</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>We'll confirm via WhatsApp</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 4 }}>Explore</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>Find a Therapist</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
                    {loading ? "Loading..." : `${filtered.length} therapist${filtered.length !== 1 ? "s" : ""} available`}
                  </div>
                </>
              )}
            </div>
            <button className="tsm-close-btn" onClick={() => { setSelected(null); onClose(); }}>
              <i className="feather-x"></i>
            </button>
          </div>

          {/* ── Search bar (only on list view) ── */}
          {!selected && (
            <div style={{ padding: "14px 20px 10px", flexShrink: 0, background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
              <div style={{ position: "relative" }}>
                <i className="feather-search" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: "#94a3b8", pointerEvents: "none" }}></i>
                <input
                  className="tsm-search"
                  placeholder="Search by name, specialty, language, location…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  autoFocus
                />
                {search && (
                  <button onClick={() => setSearch("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 16, display: "flex", alignItems: "center" }}>
                    <i className="feather-x"></i>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── Body ── */}
          <div style={{ overflowY: "auto", flex: 1, padding: "16px 20px 32px" }}>
            {selected ? (
              /* Appointment form for selected therapist */
              <DashAppointmentForm compact therapist={selected} />
            ) : loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} style={{ height: 80, borderRadius: 12, background: "#e2e8f0", animation: "pulse 1.5s ease infinite" }}></div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 20px", color: "#94a3b8" }}>
                <i className="feather-search" style={{ fontSize: 40, marginBottom: 12, display: "block", opacity: 0.4 }}></i>
                <div style={{ fontSize: 14, fontWeight: 600 }}>No therapists found for "{search}"</div>
                <div style={{ fontSize: 12, marginTop: 6 }}>Try a different name, specialty or location</div>
              </div>
            ) : (
              <div className="tsm-grid">
                {filtered.map(t => <TherapistMiniCard key={t._id} t={t} onSelect={setSelected} />)}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
