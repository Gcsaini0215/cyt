import React, { useState } from 'react';
import Link from "next/link";
import { Brain, CloudRain, Heart, Activity, Zap, Stethoscope, Users, Briefcase } from 'lucide-react';

const CATS = ["All", "Mental Health", "Relationships", "Work", "Family"];

const specs = [
  {
    id: 1, title: "Anxiety", cat: "Mental Health", popular: true,
    Icon: Brain, color: "#dbeafe", accent: "#1d4ed8",
    short: "Manage stress, worry, and panic attacks with expert help.",
    link: "/view-all-therapist?services=Anxiety",
  },
  {
    id: 2, title: "Depression", cat: "Mental Health", popular: true,
    Icon: CloudRain, color: "#ede9fe", accent: "#6d28d9",
    short: "Overcome low mood and find hope with professional support.",
    link: "/view-all-therapist?services=Depression",
  },
  {
    id: 3, title: "Relationships", cat: "Relationships", popular: true,
    Icon: Heart, color: "#fee2e2", accent: "#dc2626",
    short: "Build healthier connections and resolve conflicts.",
    link: "/view-all-therapist?services=Relationship",
  },
  {
    id: 4, title: "Stress", cat: "Mental Health", popular: false,
    Icon: Activity, color: "#dcfce7", accent: "#16a34a",
    short: "Tackle burnout and find balance in daily life.",
    link: "/view-all-therapist?services=Stress",
  },
  {
    id: 5, title: "OCD", cat: "Mental Health", popular: false,
    Icon: Zap, color: "#fef9c3", accent: "#ca8a04",
    short: "Break the cycle of obsessive thoughts and compulsions.",
    link: "/view-all-therapist?services=OCD",
  },
  {
    id: 6, title: "Trauma & PTSD", cat: "Mental Health", popular: false,
    Icon: Stethoscope, color: "#ccfbf1", accent: "#0d9488",
    short: "Heal from past trauma and emotional abuse safely.",
    link: "/view-all-therapist?services=Trauma",
  },
  {
    id: 7, title: "Parenting", cat: "Family", popular: false,
    Icon: Users, color: "#fef3c7", accent: "#d97706",
    short: "Expert guidance on child behavior and family dynamics.",
    link: "/view-all-therapist?services=Parenting",
  },
  {
    id: 8, title: "Career", cat: "Work", popular: false,
    Icon: Briefcase, color: "#f1f5f9", accent: "#475569",
    short: "Support for career transitions and workplace wellbeing.",
    link: "/view-all-therapist?services=Career",
  },
];

export default function Specializations() {
  const [activeCat, setActiveCat] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = specs.filter(s => {
    const matchCat = activeCat === "All" || s.cat === activeCat;
    const matchSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.short.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <section style={{ background: "#f8fafc", padding: "64px 0 68px" }}>
      <style>{`
        /* ── Header ───────────────────────────────────── */
        .sp-header {
          display:flex; align-items:flex-start;
          justify-content:space-between; gap:16px;
          margin-bottom:24px; flex-wrap:wrap;
        }
        .sp-accent-bar { width:42px; height:4px; background:#228756; border-radius:2px; margin-bottom:12px; }
        .sp-title { font-size:clamp(1.6rem,3.5vw,2.3rem); font-weight:900; color:#1e293b; margin:0 0 6px; line-height:1.2; }
        .sp-sub { color:#64748b; font-size:15px; margin:0; }

        /* search */
        .sp-search-wrap { position:relative; }
        .sp-search-ic { position:absolute; left:13px; top:50%; transform:translateY(-50%); color:#94a3b8; font-size:14px; pointer-events:none; }
        .sp-search {
          padding:10px 16px 10px 38px; border-radius:12px;
          border:1.5px solid #e2e8f0; background:#fff;
          font-size:14px; color:#1e293b; outline:none;
          width:220px; transition:border-color .2s; box-sizing:border-box;
        }
        .sp-search:focus { border-color:#228756; box-shadow:0 0 0 3px rgba(34,135,86,.08); }

        /* ── Category pills ───────────────────────────── */
        .sp-pills {
          display:flex; gap:8px; overflow-x:auto;
          padding-bottom:4px; scrollbar-width:none;
          margin-bottom:32px;
        }
        .sp-pills::-webkit-scrollbar { display:none; }
        .sp-pill {
          flex-shrink:0; padding:7px 18px; border-radius:50px;
          font-size:13px; font-weight:700;
          border:1.5px solid #e2e8f0; background:#fff;
          color:#64748b; cursor:pointer; transition:all .2s;
          white-space:nowrap; line-height:1;
        }
        .sp-pill.active { background:#228756; border-color:#228756; color:#fff; box-shadow:0 4px 12px rgba(34,135,86,.25); }
        .sp-pill:hover:not(.active) { border-color:#228756; color:#228756; }

        /* ── Cards ────────────────────────────────────── */
        .sp-card {
          display:flex; flex-direction:column;
          background:#fff; border-radius:20px;
          border:1px solid #f1f5f9;
          box-shadow:0 2px 12px rgba(0,0,0,.06);
          overflow:hidden; height:100%;
          text-decoration:none; position:relative;
          transition:transform .25s ease, box-shadow .25s ease;
        }
        .sp-card:hover {
          transform:translateY(-6px);
          box-shadow:0 16px 40px rgba(0,0,0,.13);
          border-color:transparent;
        }

        /* colored top strip */
        .sp-card-top {
          height:78px; flex-shrink:0;
          position:relative;
        }
        .sp-popular-badge {
          position:absolute; top:12px; right:12px;
          background:rgba(255,255,255,.9); color:#228756;
          font-size:10px; font-weight:800;
          padding:3px 9px; border-radius:20px;
          border:1px solid rgba(34,135,86,.2);
          letter-spacing:.4px;
        }
        /* icon badge overlapping the strip */
        .sp-icon-wrap {
          position:absolute; bottom:-22px; left:18px;
          width:52px; height:52px; border-radius:15px;
          background:#fff;
          display:flex; align-items:center; justify-content:center;
          box-shadow:0 6px 20px rgba(0,0,0,.13);
          z-index:2;
        }

        /* card body */
        .sp-card-body {
          padding:30px 18px 18px;
          flex:1; display:flex; flex-direction:column; gap:7px;
        }
        .sp-card-title { font-size:15.5px; font-weight:800; color:#1e293b; margin:0; }
        .sp-card-desc { font-size:13px; color:#64748b; line-height:1.55; margin:0; flex:1; }
        .sp-card-cta {
          display:inline-flex; align-items:center; gap:5px;
          font-size:12.5px; font-weight:700; color:#228756;
          margin-top:6px;
        }
        .sp-card-cta i { font-size:12px; transition:transform .2s; }
        .sp-card:hover .sp-card-cta i { transform:translateX(4px); }

        /* empty state */
        .sp-empty { text-align:center; padding:52px 0; color:#94a3b8; }
        .sp-empty i { font-size:44px; display:block; margin-bottom:12px; }

        /* ── Mobile ───────────────────────────────────── */
        @media(max-width:767px){
          .sp-header { flex-direction:column; gap:14px; }
          .sp-search { width:100%; }
          .sp-search-wrap { width:100%; }
          .sp-card-top { height:64px; }
          .sp-icon-wrap { width:44px; height:44px; border-radius:12px; bottom:-18px; }
          .sp-card-body { padding:26px 14px 14px; gap:6px; }
          .sp-card-title { font-size:14px; }
          .sp-card-desc { font-size:12px; }
        }
      `}</style>

      <div className="container">

        {/* ── Header ──────────────────────────────────── */}
        <div className="sp-header">
          <div>
            <div className="sp-accent-bar"></div>
            <h2 className="sp-title">Explore Specializations</h2>
            <p className="sp-sub">Find the right expert for your specific concern</p>
          </div>
          <div className="sp-search-wrap">
            <i className="feather-search sp-search-ic"></i>
            <input
              type="text"
              className="sp-search"
              placeholder="Search concerns..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* ── Category pills ──────────────────────────── */}
        <div className="sp-pills">
          {CATS.map(cat => (
            <button
              key={cat}
              className={`sp-pill${activeCat === cat ? " active" : ""}`}
              onClick={() => setActiveCat(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── Grid ────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="sp-empty">
            <i className="feather-search"></i>
            <p style={{ fontWeight: 700, margin: 0 }}>No specializations found</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>Try a different search or category</p>
          </div>
        ) : (
          <div className="row g-4">
            {filtered.map(s => {
              const IconComp = s.Icon;
              return (
                <div key={s.id} className="col-lg-3 col-md-4 col-sm-6 col-6">
                  <Link href={s.link} className="sp-card">

                    {/* Colored top strip */}
                    <div className="sp-card-top" style={{ background: s.color }}>
                      {s.popular && (
                        <span className="sp-popular-badge">🔥 Popular</span>
                      )}
                      <div className="sp-icon-wrap">
                        <IconComp size={24} color={s.accent} strokeWidth={2} />
                      </div>
                    </div>

                    {/* Body */}
                    <div className="sp-card-body">
                      <h3 className="sp-card-title">{s.title}</h3>
                      <p className="sp-card-desc">{s.short}</p>
                      <span className="sp-card-cta">
                        Find Therapists <i className="feather-arrow-right"></i>
                      </span>
                    </div>

                  </Link>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
