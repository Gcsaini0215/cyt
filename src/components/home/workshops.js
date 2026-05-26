import React, { useState, useEffect } from "react";
import Link from "next/link";
import WellNessCard from "./wellness-card";
import { fetchData } from "../../utils/actions";
import { getWorkshopsWebUrl } from "../../utils/url";

const TABS = ["See All", "Support Groups", "Capacity Building", "Ongoing Series", "Mentorship"];

export default function HomeWorkshop() {
  const [data, setData] = useState([]);
  const [tab, setTab] = useState("See All");
  const [loading, setLoading] = useState(false);

  const getData = async (categoryTab = "See All") => {
    try {
      setLoading(true);
      const res = await fetchData(getWorkshopsWebUrl, {
        category: categoryTab === "See All" ? "" : categoryTab,
      });
      if (res?.data) setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { getData(); }, []);
  const handleTab = (t) => { setTab(t); getData(t); };

  if (!data || data.length === 0) return null;

  return (
    <section style={{ background: "#0f172a", padding: "72px 0 80px", position: "relative", overflow: "hidden" }}>
      <style>{`
        /* ── Decorative bg ───────────────────────────── */
        .wk-bg-dot {
          position:absolute; border-radius:50%;
          pointer-events:none; z-index:0;
        }

        /* ── Header ──────────────────────────────────── */
        .wk-header {
          display:flex; align-items:flex-end;
          justify-content:space-between; gap:20px;
          margin-bottom:32px; flex-wrap:wrap;
          position:relative; z-index:1;
        }
        .wk-tag {
          display:inline-flex; align-items:center; gap:7px;
          background:rgba(34,135,86,.2); border:1px solid rgba(34,135,86,.35);
          color:#4ade80; font-size:11px; font-weight:700;
          padding:5px 14px; border-radius:50px;
          letter-spacing:.8px; text-transform:uppercase; margin-bottom:14px;
        }
        .wk-tag-dot { width:6px; height:6px; border-radius:50%; background:#4ade80; animation:wk-pulse 1.8s ease-in-out infinite; }
        @keyframes wk-pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        .wk-title { font-size:clamp(1.8rem,4vw,2.8rem); font-weight:900; color:#f1f5f9; margin:0 0 8px; line-height:1.15; }
        .wk-title span { color:#4ade80; }
        .wk-sub { color:#64748b; font-size:15px; margin:0; max-width:460px; line-height:1.6; }
        .wk-view-all {
          display:inline-flex; align-items:center; gap:7px;
          font-size:13px; font-weight:700; color:#4ade80;
          border:1.5px solid rgba(74,222,128,.3);
          background:rgba(74,222,128,.08);
          padding:10px 22px; border-radius:50px;
          text-decoration:none; white-space:nowrap;
          transition:all .2s; flex-shrink:0;
        }
        .wk-view-all:hover { background:rgba(74,222,128,.18); color:#4ade80; }
        .wk-view-all i { font-size:12px; transition:transform .2s; }
        .wk-view-all:hover i { transform:translateX(3px); }

        /* ── Pills ───────────────────────────────────── */
        .wk-pills {
          display:flex; gap:8px; overflow-x:auto;
          scrollbar-width:none; margin-bottom:36px;
          padding-bottom:2px; position:relative; z-index:1;
        }
        .wk-pills::-webkit-scrollbar { display:none; }
        .wk-pill {
          flex-shrink:0; padding:8px 20px; border-radius:50px;
          font-size:13px; font-weight:700;
          border:1.5px solid rgba(255,255,255,.1);
          background:rgba(255,255,255,.05);
          color:#94a3b8; cursor:pointer; transition:all .2s;
          white-space:nowrap;
        }
        .wk-pill.active {
          background:#228756; border-color:#228756; color:#fff;
          box-shadow:0 4px 14px rgba(34,135,86,.4);
        }
        .wk-pill:hover:not(.active) { border-color:rgba(255,255,255,.25); color:#e2e8f0; }

        /* ── Skeleton ─────────────────────────────────── */
        .wk-skel { border-radius:18px; overflow:hidden; background:#1e293b; }
        .wk-skel-img { aspect-ratio:16/9; background:linear-gradient(90deg,#1e293b 25%,#334155 50%,#1e293b 75%); background-size:200%; animation:wk-shimmer 1.4s infinite; }
        .wk-skel-body { padding:16px; }
        .wk-skel-line { height:13px; border-radius:6px; background:linear-gradient(90deg,#1e293b 25%,#334155 50%,#1e293b 75%); background-size:200%; animation:wk-shimmer 1.4s infinite; margin-bottom:10px; }
        @keyframes wk-shimmer { 0%{background-position:200%} 100%{background-position:-200%} }

        /* ── Bottom CTA ───────────────────────────────── */
        .wk-bottom-btn {
          display:inline-flex; align-items:center; gap:8px;
          background:linear-gradient(135deg,#228756,#1a6b44);
          color:#fff; font-size:14px; font-weight:700;
          padding:14px 40px; border-radius:50px;
          text-decoration:none;
          box-shadow:0 6px 24px rgba(34,135,86,.35);
          transition:all .2s;
        }
        .wk-bottom-btn:hover { transform:translateY(-2px); box-shadow:0 12px 28px rgba(34,135,86,.45); color:#fff; }

        @media(max-width:767px){
          .wk-header { flex-direction:column; gap:12px; align-items:flex-start; }
        }
      `}</style>

      {/* Decorative blobs */}
      <div className="wk-bg-dot" style={{ width:320, height:320, background:"rgba(34,135,86,.07)", filter:"blur(80px)", top:"-60px", right:"5%" }}></div>
      <div className="wk-bg-dot" style={{ width:240, height:240, background:"rgba(74,222,128,.05)", filter:"blur(60px)", bottom:"40px", left:"8%" }}></div>

      <div className="container" style={{ position:"relative", zIndex:1 }}>

        {/* Header */}
        <div className="wk-header">
          <div>
            <div className="wk-tag">
              <span className="wk-tag-dot"></span>
              Wellness Programs
            </div>
            <h2 className="wk-title">Mind Matters <span>Programs</span></h2>
            <p className="wk-sub">Learn, connect & grow with guided mental wellness programs led by expert therapists.</p>
          </div>
          <Link href="/all-workshop" className="wk-view-all">
            View All Programs <i className="feather-arrow-right"></i>
          </Link>
        </div>

        {/* Category pills */}
        <div className="wk-pills">
          {TABS.map(t => (
            <button key={t} className={`wk-pill${tab === t ? " active" : ""}`} onClick={() => handleTab(t)}>
              {t}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="row g-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="col-lg-4 col-md-6 col-12">
                <div className="wk-skel">
                  <div className="wk-skel-img"></div>
                  <div className="wk-skel-body">
                    <div className="wk-skel-line" style={{ width:"75%" }}></div>
                    <div className="wk-skel-line" style={{ width:"50%" }}></div>
                    <div className="wk-skel-line" style={{ width:"65%", marginTop:14 }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="row g-4">
            {data.slice(0, 6).map(item => (
              <div key={item._id} className="col-lg-4 col-md-6 col-sm-6 col-12">
                <WellNessCard data={item} />
              </div>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        {!loading && data.length > 6 && (
          <div style={{ textAlign:"center", marginTop:52 }}>
            <Link href="/all-workshop" className="wk-bottom-btn">
              View All Programs <i className="feather-arrow-right"></i>
            </Link>
          </div>
        )}

      </div>
    </section>
  );
}
