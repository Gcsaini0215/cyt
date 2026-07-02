import React, { useEffect, useRef } from "react";
import WatchLaterIcon from "@mui/icons-material/WatchLater";
import { getValidServices } from "../../utils/helpers";

const TABS = [
  { id: 1, label: "Overview",     icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
  { id: 3, label: "Fees",         icon: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" },
  { id: 4, label: "Availability", icon: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" },
];

export default function ProfileInfoTab({ pageData }) {
  const [tab, setTab] = React.useState(1);
  const [services, setServices] = React.useState([]);
  const [sticky, setSticky] = React.useState(false);
  const barRef = useRef(null);
  const sentinelRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      const valid = await getValidServices(pageData.fees);
      setServices(valid || []);
    };
    load();
  }, [pageData]);

  /* Make tab bar sticky on scroll */
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const obs = new IntersectionObserver(
      ([entry]) => setSticky(!entry.isIntersecting),
      { threshold: 0, rootMargin: "0px" }
    );
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, []);

  const chipGreen  = { background:"#f0fdf4", color:"#166534", border:"1.5px solid #dcfce7" };
  const chipBlue   = { background:"#eff6ff", color:"#1e40af", border:"1.5px solid #dbeafe" };

  return (
    <div style={{ background:"#f8fafc", minHeight:"60vh", paddingBottom:60 }}>
      <style>{`
        /* ── Tab bar ── */
        .pit-bar-wrap {
          background: #fff;
          border-bottom: 1px solid #e2e8f0;
          position: relative;
          z-index: 40;
          transition: box-shadow 0.2s;
        }
        .pit-bar-wrap.sticky {
          position: sticky;
          top: 0;
          box-shadow: 0 4px 24px rgba(0,0,0,0.10);
        }
        .pit-bar {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          gap: 4px;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .pit-bar::-webkit-scrollbar { display:none; }
        .pit-tab {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 14px 18px;
          font-size: 13.5px;
          font-weight: 600;
          color: #64748b;
          background: none;
          border: none;
          border-bottom: 3px solid transparent;
          cursor: pointer;
          transition: color 0.18s, border-color 0.18s;
          white-space: nowrap;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        .pit-tab:hover { color: #228756; }
        .pit-tab.active { color: #228756; border-bottom-color: #228756; font-weight: 700; }
        .pit-tab svg { transition: opacity 0.18s; }
        .pit-tab.active svg { opacity: 1; }

        /* ── Content area ── */
        .pit-content {
          max-width: 1100px;
          margin: 0 auto;
          padding: 28px 20px 0;
        }

        /* ── Section card ── */
        .pit-card {
          background: #fff;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          padding: 24px 28px;
          margin-bottom: 16px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
        }
        .pit-card-title {
          font-size: 16px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 16px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .pit-card-title::before {
          content: '';
          display: block;
          width: 4px;
          height: 18px;
          background: #228756;
          border-radius: 4px;
          flex-shrink: 0;
        }
        .pit-card-title.blue::before { background: #3b82f6; }

        /* ── Bio text ── */
        .pit-bio {
          font-size: 15px;
          line-height: 1.85;
          color: #475569;
          white-space: pre-line;
          margin: 0;
        }

        /* ── Chips ── */
        .pit-chips { display:flex; flex-wrap:wrap; gap:8px; }
        .pit-chip {
          display: inline-flex;
          align-items: center;
          padding: 7px 16px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 600;
          cursor: default;
          transition: transform 0.15s;
        }
        .pit-chip:hover { transform: translateY(-1px); }

        /* ── Fee card ── */
        .pit-fee-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 20px 24px;
          margin-bottom: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
        }
        .pit-fee-name { font-size:15px; font-weight:800; color:#0f172a; margin:0 0 12px; }
        .pit-fee-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #f1f5f9;
          font-size: 14px;
        }
        .pit-fee-row:last-child { border-bottom: none; padding-bottom:0; }
        .pit-fee-type { color:#475569; font-weight:500; display:flex; align-items:center; gap:8px; }
        .pit-fee-dot { width:7px; height:7px; border-radius:50%; background:#10b981; }
        .pit-fee-amount { color:#228756; font-weight:800; font-size:16px; }

        /* ── Availability ── */
        .pit-avail-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 16px 24px;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
        }
        .pit-day-badge {
          font-size: 13px;
          font-weight: 800;
          color: #0f172a;
          background: #f1f5f9;
          border-radius: 10px;
          padding: 6px 14px;
          min-width: 90px;
          text-align: center;
          flex-shrink: 0;
        }
        .pit-times { display:flex; flex-wrap:wrap; gap:8px; }
        .pit-time-chip {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 9px;
          padding: 5px 12px;
          font-size: 13px;
          font-weight: 600;
          color: #166534;
        }

        /* ── Mobile ── */
        @media (max-width: 767px) {
          .pit-bar { padding: 0 10px; }
          .pit-tab { padding: 13px 14px; font-size: 13px; }
          .pit-content { padding: 16px 12px 0; }
          .pit-card { padding: 18px 16px; }
          .pit-fee-card { padding: 16px; }
          .pit-avail-card { padding: 14px 16px; gap:12px; }
          .pit-bio { font-size: 14.5px; line-height: 1.8; }
        }
      `}</style>

      {/* Sentinel — triggers sticky when scrolled past */}
      <div ref={sentinelRef} style={{ height: 1 }} />

      {/* Tab bar */}
      <div className={`pit-bar-wrap${sticky ? " sticky" : ""}`} ref={barRef}>
        <div className="pit-bar">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`pit-tab${tab === t.id ? " active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" style={{ opacity: tab === t.id ? 1 : 0.5 }}>
                <path d={t.icon} />
              </svg>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="pit-content">

        {/* ── OVERVIEW ── */}
        {tab === 1 && (
          <>
            {/* About */}
            {pageData.user?.bio && (
              <div className="pit-card">
                <h3 className="pit-card-title">About Me</h3>
                <p className="pit-bio">{pageData.user.bio}</p>
              </div>
            )}

            {/* Services */}
            {pageData.services && (
              <div className="pit-card">
                <h3 className="pit-card-title">Services</h3>
                <div className="pit-chips">
                  {pageData.services.split(",").filter(Boolean).map(s => (
                    <span key={s} className="pit-chip" style={chipGreen}>{s.trim()}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Expertise */}
            {pageData.experties && (
              <div className="pit-card">
                <h3 className="pit-card-title blue">Areas of Expertise</h3>
                <div className="pit-chips">
                  {pageData.experties.split(",").filter(Boolean).map(e => (
                    <span key={e} className="pit-chip" style={chipBlue}>{e.trim()}</span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── FEES ── */}
        {tab === 3 && (
          <div>
            {services && services.length > 0 ? services.map(item => (
              <div key={item._id} className="pit-fee-card">
                <p className="pit-fee-name">{item.name}</p>
                {item.formats.map(format => (
                  <div key={format._id} className="pit-fee-row">
                    <span className="pit-fee-type">
                      <span className="pit-fee-dot" />
                      {format.type.charAt(0).toUpperCase() + format.type.slice(1)} Session
                    </span>
                    <span className="pit-fee-amount">₹{format.fee}</span>
                  </div>
                ))}
              </div>
            )) : (
              <div className="pit-card" style={{ textAlign:"center", padding:"40px 24px" }}>
                <div style={{ fontSize:36, marginBottom:12 }}>💰</div>
                <p style={{ color:"#94a3b8", fontWeight:600, margin:0 }}>Fee details not available yet</p>
              </div>
            )}
          </div>
        )}

        {/* ── AVAILABILITY ── */}
        {tab === 4 && (
          <div>
            {pageData.availabilities && pageData.availabilities.length > 0 ? pageData.availabilities.map((item, i) => (
              <div key={i} className="pit-avail-card">
                <div className="pit-day-badge">{item.day}</div>
                <div className="pit-times">
                  {item.times.map((time, j) => (
                    <span key={j} className="pit-time-chip">
                      <WatchLaterIcon style={{ fontSize:14, color:"#16a34a" }} />
                      {time.open} – {time.close}
                    </span>
                  ))}
                </div>
              </div>
            )) : (
              <div className="pit-card" style={{ textAlign:"center", padding:"40px 24px" }}>
                <div style={{ fontSize:36, marginBottom:12 }}>🗓️</div>
                <p style={{ color:"#94a3b8", fontWeight:600, margin:0 }}>Availability not set yet</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
