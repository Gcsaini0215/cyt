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
    <section style={{ background: "linear-gradient(135deg,#0f3d24,#175c37)", padding: "64px 0 72px", position: "relative", overflow: "hidden", borderTop: "3px solid #d4af37", borderBottom: "3px solid #d4af37" }}>
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
          margin-bottom:28px; flex-wrap:wrap;
          position:relative; z-index:1;
        }
        .wk-tag {
          display:inline-flex; align-items:center; gap:8px;
          font-size:11px; font-weight:800; letter-spacing:1.2px; text-transform:uppercase;
          color:#d4af37; margin-bottom:12px;
        }
        .wk-tag-dot { width:20px; height:2px; background:#d4af37; display:inline-block; }
        .wk-title { font-size:clamp(1.5rem,3.4vw,2.1rem); font-weight:800; color:#fff; margin:0 0 8px; line-height:1.25; }
        .wk-title span { color:#d4af37; }
        .wk-sub { color:rgba(255,255,255,.7); font-size:14.5px; margin:0; max-width:460px; line-height:1.6; }
        .wk-view-all {
          display:inline-flex; align-items:center; gap:7px;
          font-size:13px; font-weight:700; color:#0f3d24;
          border:1px solid #d4af37;
          background:#d4af37;
          padding:10px 22px; border-radius:6px;
          text-decoration:none; white-space:nowrap;
          transition:all .2s; flex-shrink:0;
        }
        .wk-view-all:hover { filter:brightness(1.08); color:#0f3d24; }
        .wk-view-all i { font-size:12px; transition:transform .2s; }
        .wk-view-all:hover i { transform:translateX(3px); }

        /* ── Pills ───────────────────────────────────── */
        .wk-pills {
          display:flex; gap:8px; overflow-x:auto;
          scrollbar-width:none; margin-bottom:32px;
          padding-bottom:2px; position:relative; z-index:1;
        }
        .wk-pills::-webkit-scrollbar { display:none; }
        .wk-pill {
          flex-shrink:0; padding:8px 18px; border-radius:4px;
          font-size:13px; font-weight:700;
          border:1.5px solid rgba(255,255,255,.16);
          background:rgba(255,255,255,.05);
          color:rgba(255,255,255,.7); cursor:pointer; transition:all .2s;
          white-space:nowrap;
        }
        .wk-pill.active {
          background:#d4af37; border-color:#d4af37; color:#0f3d24;
        }
        .wk-pill:hover:not(.active) { border-color:rgba(255,255,255,.32); color:#fff; }

        /* ── Skeleton ─────────────────────────────────── */
        .wk-skel { border-radius:6px; overflow:hidden; background:rgba(255,255,255,.06); }
        .wk-skel-img { aspect-ratio:16/9; background:linear-gradient(90deg,rgba(255,255,255,.05) 25%,rgba(255,255,255,.1) 50%,rgba(255,255,255,.05) 75%); background-size:200%; animation:wk-shimmer 1.4s infinite; }
        .wk-skel-body { padding:16px; }
        .wk-skel-line { height:13px; border-radius:4px; background:linear-gradient(90deg,rgba(255,255,255,.05) 25%,rgba(255,255,255,.1) 50%,rgba(255,255,255,.05) 75%); background-size:200%; animation:wk-shimmer 1.4s infinite; margin-bottom:10px; }
        @keyframes wk-shimmer { 0%{background-position:200%} 100%{background-position:-200%} }

        /* ── Bottom CTA ───────────────────────────────── */
        .wk-bottom-btn {
          display:inline-flex; align-items:center; gap:8px;
          background:#d4af37;
          color:#0f3d24; font-size:14px; font-weight:700;
          padding:13px 36px; border-radius:6px;
          text-decoration:none;
          transition:all .2s;
        }
        .wk-bottom-btn:hover { transform:translateY(-2px); filter:brightness(1.08); color:#0f3d24; }

        @media(min-width:768px) and (max-width:1024px){
          section .wk-title { font-size: 1.8rem; }
        }
        @media(max-width:767px){
          .wk-header { flex-direction:column; gap:12px; align-items:flex-start; }
        }
      `}</style>

      {/* Decorative blobs */}
      <div className="wk-bg-dot" style={{ width:320, height:320, background:"rgba(212,175,55,.08)", filter:"blur(80px)", top:"-60px", right:"5%" }}></div>
      <div className="wk-bg-dot" style={{ width:240, height:240, background:"rgba(255,255,255,.04)", filter:"blur(60px)", bottom:"40px", left:"8%" }}></div>

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
