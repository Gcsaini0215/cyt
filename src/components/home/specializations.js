import React, { useState } from 'react';
import Link from "next/link";

const CATS = ["All", "Mental Health", "Relationships", "Work", "Family"];

const specs = [
  {
    id: 1, title: "Anxiety", cat: "Mental Health", popular: true,
    img: "/images/anxiety.jpg",
    accent: "#065f46", tagBg: "#d1fae5", tagColor: "#065f46",
    short: "Manage stress, worry, and panic attacks with expert help.",
    link: "/view-all-therapist?services=Anxiety",
  },
  {
    id: 2, title: "Depression", cat: "Mental Health", popular: true,
    img: "/images/depression.jpg",
    accent: "#1e40af", tagBg: "#dbeafe", tagColor: "#1e40af",
    short: "Overcome low mood and find hope with professional support.",
    link: "/view-all-therapist?services=Depression",
  },
  {
    id: 3, title: "Relationships", cat: "Relationships", popular: true,
    img: "/images/couple.jpg",
    accent: "#991b1b", tagBg: "#fee2e2", tagColor: "#991b1b",
    short: "Build healthier connections and resolve conflicts.",
    link: "/view-all-therapist?services=Relationship",
  },
  {
    id: 4, title: "Stress", cat: "Mental Health", popular: false,
    img: "/images/stress.jpg",
    accent: "#1a6b44", tagBg: "#dcfce7", tagColor: "#1a6b44",
    short: "Tackle burnout and find balance in daily life.",
    link: "/view-all-therapist?services=Stress",
  },
  {
    id: 5, title: "OCD", cat: "Mental Health", popular: false,
    img: "/images/ocd.jpg",
    accent: "#92400e", tagBg: "#fef3c7", tagColor: "#92400e",
    short: "Break the cycle of obsessive thoughts and compulsions.",
    link: "/view-all-therapist?services=OCD",
  },
  {
    id: 6, title: "Trauma & PTSD", cat: "Mental Health", popular: false,
    img: "/images/trauma.jpg",
    accent: "#0f766e", tagBg: "#ccfbf1", tagColor: "#0f766e",
    short: "Heal from past trauma and emotional abuse safely.",
    link: "/view-all-therapist?services=Trauma",
  },
  {
    id: 7, title: "Parenting", cat: "Family", popular: false,
    img: "/images/parenting.jpg",
    accent: "#9a3412", tagBg: "#ffedd5", tagColor: "#9a3412",
    short: "Expert guidance on child behavior and family dynamics.",
    link: "/view-all-therapist?services=Parenting",
  },
  {
    id: 8, title: "Career", cat: "Work", popular: false,
    img: "/images/career.jpg",
    accent: "#3f6212", tagBg: "#ecfccb", tagColor: "#3f6212",
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
    <section style={{ background: "#fff", padding: "64px 0 68px" }}>
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
        .sp-search-wrap { display:flex; align-items:center; }
        .sp-search-box {
          display:flex; align-items:center; gap:8px;
          border:1.5px solid #e2e8f0; border-radius:12px;
          background:#fff; padding:0 14px;
          width:240px; transition:border-color .2s, box-shadow .2s;
        }
        .sp-search-box:focus-within {
          border-color:#228756;
          box-shadow:0 0 0 3px rgba(34,135,86,.08);
        }
        .sp-search-ic { color:#94a3b8; font-size:15px; flex-shrink:0; line-height:1; }
        .sp-search {
          border:none; background:transparent; outline:none;
          padding:11px 0; font-size:14px; color:#1e293b;
          width:100%; line-height:1.4;
        }
        .sp-search::placeholder { color:#b0bec5; }

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

        /* image top */
        .sp-card-top {
          height:150px; flex-shrink:0;
          position:relative; overflow:hidden;
        }
        .sp-card-img {
          width:100%; height:100%; object-fit:cover;
          transition:transform .5s ease;
          display:block;
        }
        .sp-card:hover .sp-card-img { transform:scale(1.07); }
        .sp-card-overlay {
          position:absolute; inset:0;
          background:linear-gradient(to top, rgba(0,0,0,.35) 0%, transparent 60%);
        }
        .sp-popular-badge {
          position:absolute; top:10px; right:10px;
          background:rgba(255,255,255,.92); color:#228756;
          font-size:10px; font-weight:800;
          padding:3px 9px; border-radius:20px;
          border:1px solid rgba(34,135,86,.2);
          letter-spacing:.4px; backdrop-filter:blur(4px);
        }
        .sp-cat-pill {
          position:absolute; bottom:10px; left:12px;
          font-size:10px; font-weight:800;
          padding:3px 10px; border-radius:20px;
          letter-spacing:.3px; backdrop-filter:blur(4px);
        }

        /* card body */
        .sp-card-body {
          padding:14px 16px 16px;
          flex:1; display:flex; flex-direction:column; gap:6px;
        }
        .sp-card-title { font-size:15px; font-weight:800; color:#1e293b; margin:0; }
        .sp-card:hover .sp-card-title { color:#228756; }
        .sp-card-desc { font-size:12.5px; color:#64748b; line-height:1.55; margin:0; flex:1; }
        .sp-card-cta {
          display:inline-flex; align-items:center; gap:5px;
          font-size:12px; font-weight:700; color:#228756;
          margin-top:4px;
        }
        .sp-card-cta i { font-size:12px; transition:transform .2s; }
        .sp-card:hover .sp-card-cta i { transform:translateX(4px); }

        /* empty state */
        .sp-empty { text-align:center; padding:52px 0; color:#94a3b8; }
        .sp-empty i { font-size:44px; display:block; margin-bottom:12px; }

        /* ── Mobile ───────────────────────────────────── */
        @media(max-width:767px){
          .sp-header { flex-direction:column; gap:14px; }
          .sp-search-wrap { display:none; }
          .sp-card-top { height:120px; }
          .sp-card-body { padding:10px 12px 12px; gap:5px; }
          .sp-card-title { font-size:13.5px; }
          .sp-card-desc { font-size:11.5px; }
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
            <div className="sp-search-box">
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
            {filtered.map(s => (
                <div key={s.id} className="col-lg-3 col-md-4 col-sm-6 col-6">
                  <Link href={s.link} className="sp-card">

                    {/* Image top */}
                    <div className="sp-card-top">
                      <img
                        src={s.img}
                        alt={s.title}
                        className="sp-card-img"
                        loading="lazy"
                      />
                      <div className="sp-card-overlay"></div>
                      {s.popular && <span className="sp-popular-badge">🔥 Popular</span>}
                      <span className="sp-cat-pill" style={{ background: s.tagBg, color: s.tagColor }}>
                        {s.cat}
                      </span>
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
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
