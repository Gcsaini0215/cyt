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
    <section style={{ background: "#fff", padding: "64px 0 68px" }}>
      <style>{`
        /* ── Header ────────────────────────────────── */
        .wk-header {
          display:flex; align-items:flex-start;
          justify-content:space-between; gap:16px;
          margin-bottom:24px; flex-wrap:wrap;
        }
        .wk-accent { width:42px; height:4px; background:#228756; border-radius:2px; margin-bottom:12px; }
        .wk-title { font-size:clamp(1.6rem,3.5vw,2.3rem); font-weight:900; color:#1e293b; margin:0 0 6px; line-height:1.2; }
        .wk-sub { color:#64748b; font-size:15px; margin:0; }
        .wk-view-all {
          display:inline-flex; align-items:center; gap:6px;
          font-size:13px; font-weight:700; color:#228756;
          border:1.5px solid #bbf7d0; background:#f0fdf4;
          padding:8px 18px; border-radius:50px;
          text-decoration:none; white-space:nowrap;
          transition:all .2s; flex-shrink:0; align-self:flex-start;
        }
        .wk-view-all:hover { background:#228756; color:#fff; border-color:#228756; }
        .wk-view-all i { font-size:12px; }

        /* ── Category pills ─────────────────────────── */
        .wk-pills {
          display:flex; gap:8px; overflow-x:auto;
          padding-bottom:4px; scrollbar-width:none;
          margin-bottom:32px;
        }
        .wk-pills::-webkit-scrollbar { display:none; }
        .wk-pill {
          flex-shrink:0; padding:7px 18px; border-radius:50px;
          font-size:13px; font-weight:700;
          border:1.5px solid #e2e8f0; background:#fff;
          color:#64748b; cursor:pointer; transition:all .2s;
          white-space:nowrap; line-height:1;
        }
        .wk-pill.active { background:#228756; border-color:#228756; color:#fff; box-shadow:0 4px 12px rgba(34,135,86,.25); }
        .wk-pill:hover:not(.active) { border-color:#228756; color:#228756; }

        /* ── Skeleton ────────────────────────────────── */
        .wk-skel { border-radius:18px; overflow:hidden; background:#f8fafc; }
        .wk-skel-img { aspect-ratio:16/9; background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%); background-size:200%; animation:wk-shimmer 1.4s infinite; }
        .wk-skel-body { padding:16px; }
        .wk-skel-line { height:13px; border-radius:6px; background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%); background-size:200%; animation:wk-shimmer 1.4s infinite; margin-bottom:10px; }
        @keyframes wk-shimmer { 0%{background-position:200%} 100%{background-position:-200%} }

        /* ── View all btn bottom ─────────────────────── */
        .wk-bottom-btn {
          display:inline-flex; align-items:center; gap:8px;
          background:linear-gradient(135deg,#228756,#1a6b44);
          color:#fff; font-size:14px; font-weight:700;
          padding:13px 36px; border-radius:50px;
          text-decoration:none;
          box-shadow:0 6px 18px rgba(34,135,86,.25);
          transition:all .2s;
        }
        .wk-bottom-btn:hover { transform:translateY(-2px); box-shadow:0 10px 24px rgba(34,135,86,.3); color:#fff; }

        @media(max-width:767px){
          .wk-header { flex-direction:column; gap:10px; }
        }
      `}</style>

      <div className="container">

        {/* Header */}
        <div className="wk-header">
          <div>
            <div className="wk-accent"></div>
            <h2 className="wk-title">Mind Matters Programs</h2>
            <p className="wk-sub">Learn, connect & grow with guided mental wellness programs</p>
          </div>
          <Link href="/all-workshop" className="wk-view-all">
            View All <i className="feather-arrow-right"></i>
          </Link>
        </div>

        {/* Category pills */}
        <div className="wk-pills">
          {TABS.map(t => (
            <button
              key={t}
              className={`wk-pill${tab === t ? " active" : ""}`}
              onClick={() => handleTab(t)}
            >
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
                    <div className="wk-skel-line" style={{ width:"80%" }}></div>
                    <div className="wk-skel-line" style={{ width:"55%" }}></div>
                    <div className="wk-skel-line" style={{ width:"70%", marginTop:16 }}></div>
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

        {/* View all bottom */}
        {data.length > 6 && (
          <div style={{ textAlign:"center", marginTop:44 }}>
            <Link href="/all-workshop" className="wk-bottom-btn">
              View All Programs <i className="feather-arrow-right"></i>
            </Link>
          </div>
        )}

      </div>
    </section>
  );
}
