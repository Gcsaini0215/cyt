import React, { useState, useRef } from "react";
import Link from "next/link";

const SPECS = [
  {
    id: 1, title: "Anxiety",          cat: "Mental Health", popular: true,
    emoji: "😰", icon: "feather-wind",
    grad: "linear-gradient(135deg,#065f46,#059669)",
    light: "#d1fae5", textLight: "#065f46",
    short: "Manage stress, worry & panic attacks with expert help.",
    therapists: "42+",
    link: "/view-all-therapist?services=Anxiety",
  },
  {
    id: 2, title: "Depression",        cat: "Mental Health", popular: true,
    emoji: "🌧️", icon: "feather-cloud-rain",
    grad: "linear-gradient(135deg,#1e3a8a,#3b82f6)",
    light: "#dbeafe", textLight: "#1e40af",
    short: "Overcome low mood & find hope with professional support.",
    therapists: "38+",
    link: "/view-all-therapist?services=Depression",
  },
  {
    id: 3, title: "Relationships",     cat: "Relationships", popular: true,
    emoji: "💑", icon: "feather-heart",
    grad: "linear-gradient(135deg,#9f1239,#e11d48)",
    light: "#ffe4e6", textLight: "#9f1239",
    short: "Build healthier connections & resolve conflicts with ease.",
    therapists: "29+",
    link: "/view-all-therapist?services=Relationship",
  },
  {
    id: 4, title: "Stress & Burnout",  cat: "Work", popular: false,
    emoji: "🔥", icon: "feather-zap",
    grad: "linear-gradient(135deg,#92400e,#d97706)",
    light: "#fef3c7", textLight: "#92400e",
    short: "Tackle burnout & find balance in daily life & work.",
    therapists: "31+",
    link: "/view-all-therapist?services=Stress",
  },
  {
    id: 5, title: "OCD",               cat: "Mental Health", popular: false,
    emoji: "🔄", icon: "feather-refresh-cw",
    grad: "linear-gradient(135deg,#5b21b6,#7c3aed)",
    light: "#ede9fe", textLight: "#5b21b6",
    short: "Break the cycle of obsessive thoughts & compulsions.",
    therapists: "18+",
    link: "/view-all-therapist?services=OCD",
  },
  {
    id: 6, title: "Trauma & PTSD",     cat: "Mental Health", popular: false,
    emoji: "🩹", icon: "feather-shield",
    grad: "linear-gradient(135deg,#0f766e,#14b8a6)",
    light: "#ccfbf1", textLight: "#0f766e",
    short: "Heal from past trauma & emotional abuse safely.",
    therapists: "24+",
    link: "/view-all-therapist?services=Trauma",
  },
  {
    id: 7, title: "Parenting",         cat: "Family", popular: false,
    emoji: "👨‍👩‍👧", icon: "feather-users",
    grad: "linear-gradient(135deg,#9a3412,#f97316)",
    light: "#ffedd5", textLight: "#9a3412",
    short: "Expert guidance on child behavior & family dynamics.",
    therapists: "21+",
    link: "/view-all-therapist?services=Parenting",
  },
  {
    id: 8, title: "Career & Work",     cat: "Work", popular: false,
    emoji: "💼", icon: "feather-briefcase",
    grad: "linear-gradient(135deg,#3f6212,#65a30d)",
    light: "#ecfccb", textLight: "#3f6212",
    short: "Support for career transitions & workplace wellbeing.",
    therapists: "16+",
    link: "/view-all-therapist?services=Career",
  },
  {
    id: 9, title: "Child & Teen",      cat: "Family", popular: false,
    emoji: "🧒", icon: "feather-smile",
    grad: "linear-gradient(135deg,#0369a1,#0ea5e9)",
    light: "#e0f2fe", textLight: "#0369a1",
    short: "Specialized support for children & adolescent mental health.",
    therapists: "14+",
    link: "/view-all-therapist?services=Child",
  },
  {
    id: 10, title: "Self-Esteem",      cat: "Mental Health", popular: false,
    emoji: "✨", icon: "feather-star",
    grad: "linear-gradient(135deg,#be185d,#ec4899)",
    light: "#fce7f3", textLight: "#be185d",
    short: "Build confidence & silence your inner critic.",
    therapists: "27+",
    link: "/view-all-therapist?services=Self+Esteem",
  },
  {
    id: 11, title: "Grief & Loss",     cat: "Mental Health", popular: false,
    emoji: "🕊️", icon: "feather-feather",
    grad: "linear-gradient(135deg,#374151,#6b7280)",
    light: "#f3f4f6", textLight: "#374151",
    short: "Navigate grief, loss & life transitions with compassion.",
    therapists: "19+",
    link: "/view-all-therapist?services=Grief",
  },
  {
    id: 12, title: "Anger Management", cat: "Mental Health", popular: false,
    emoji: "😤", icon: "feather-alert-triangle",
    grad: "linear-gradient(135deg,#b91c1c,#ef4444)",
    light: "#fee2e2", textLight: "#b91c1c",
    short: "Learn healthy ways to express and manage anger.",
    therapists: "22+",
    link: "/view-all-therapist?services=Anger",
  },
];

const CATS = [
  { key: "All",          icon: "feather-grid",     label: "All" },
  { key: "Mental Health",icon: "feather-activity",  label: "Mental Health" },
  { key: "Relationships",icon: "feather-heart",     label: "Relationships" },
  { key: "Work",         icon: "feather-briefcase", label: "Work & Career" },
  { key: "Family",       icon: "feather-users",     label: "Family" },
];

export default function Specializations() {
  const [activeCat, setActiveCat] = useState("All");
  const [search,    setSearch]    = useState("");
  const [hovered,   setHovered]   = useState(null);
  const searchRef = useRef(null);

  const filtered = SPECS.filter(s => {
    const mc = activeCat === "All" || s.cat === activeCat;
    const ms = !search || s.title.toLowerCase().includes(search.toLowerCase()) ||
               s.short.toLowerCase().includes(search.toLowerCase());
    return mc && ms;
  });

  return (
    <section style={{ background: "linear-gradient(180deg,#f8fafc 0%,#fff 100%)", padding: "72px 0 80px" }}>
      <style>{`
        /* ── container ─────────────────────────────────── */
        .sp2-wrap { max-width: 1200px; margin: 0 auto; padding: 0 20px; }

        /* ── header row ────────────────────────────────── */
        .sp2-head { display:flex; align-items:flex-end; justify-content:space-between; gap:20px; margin-bottom:32px; flex-wrap:wrap; }
        .sp2-bar { width:44px; height:4px; background:linear-gradient(90deg,#1a5c38,#228756); border-radius:2px; margin-bottom:12px; }
        .sp2-title { font-size:clamp(1.8rem,3.5vw,2.6rem); font-weight:900; color:#0f172a; margin:0 0 6px; line-height:1.18; letter-spacing:-.5px; }
        .sp2-sub   { font-size:15px; color:#64748b; margin:0; }
        .sp2-count { font-size:13px; font-weight:700; color:#228756; background:#f0fdf4; padding:6px 14px; border-radius:20px; border:1.5px solid #bbf7d0; white-space:nowrap; }

        /* ── search ─────────────────────────────────────── */
        .sp2-search-wrap { display:flex; align-items:center; gap:10px; }
        .sp2-search-box  { display:flex; align-items:center; gap:8px; border:1.5px solid #e2e8f0; border-radius:12px; background:#fff; padding:0 14px; width:220px; transition:all .2s; box-shadow:0 1px 4px rgba(0,0,0,.04); }
        .sp2-search-box:focus-within { border-color:#228756; box-shadow:0 0 0 3px rgba(34,135,86,.09); }
        .sp2-search { border:none; background:transparent; outline:none; padding:11px 0; font-size:14px; color:#0f172a; width:100%; }
        .sp2-search::placeholder { color:#b0bec5; }
        .sp2-clear { border:none; background:none; cursor:pointer; color:#94a3b8; font-size:16px; padding:0; line-height:1; }
        .sp2-clear:hover { color:#ef4444; }

        /* ── category pills ─────────────────────────────── */
        .sp2-pills { display:flex; gap:8px; overflow-x:auto; padding-bottom:4px; margin-bottom:36px; scrollbar-width:none; }
        .sp2-pills::-webkit-scrollbar { display:none; }
        .sp2-pill { flex-shrink:0; display:inline-flex; align-items:center; gap:6px; padding:9px 18px; border-radius:50px; font-size:13px; font-weight:700; border:1.5px solid #e2e8f0; background:#fff; color:#64748b; cursor:pointer; transition:all .2s; white-space:nowrap; }
        .sp2-pill:hover:not(.on) { border-color:#228756; color:#228756; background:#f0fdf4; }
        .sp2-pill.on { background:#1a5c38; border-color:#1a5c38; color:#fff; box-shadow:0 4px 14px rgba(26,92,56,.28); }
        .sp2-pill i { font-size:13px; }

        /* ── grid ───────────────────────────────────────── */
        .sp2-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }

        /* ── card ───────────────────────────────────────── */
        .sp2-card { border-radius:20px; overflow:hidden; text-decoration:none; display:block; position:relative; background:#fff; border:1.5px solid #f1f5f9; box-shadow:0 2px 10px rgba(0,0,0,.05); transition:transform .26s cubic-bezier(.22,1,.36,1), box-shadow .26s ease, border-color .2s; cursor:pointer; }
        .sp2-card:hover { transform:translateY(-7px) scale(1.01); box-shadow:0 18px 50px rgba(0,0,0,.13); border-color:transparent; }

        /* icon top area */
        .sp2-card-top { height:110px; display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden; }
        .sp2-card-top-pattern { position:absolute; inset:0; opacity:.07; background-image:radial-gradient(circle,#fff 1.5px,transparent 1.5px); background-size:18px 18px; }
        .sp2-card-emoji { font-size:42px; position:relative; z-index:1; transition:transform .3s; line-height:1; }
        .sp2-card:hover .sp2-card-emoji { transform:scale(1.18) translateY(-3px); }
        .sp2-popular { position:absolute; top:10px; right:10px; background:rgba(255,255,255,.22); backdrop-filter:blur(6px); color:#fff; font-size:10px; font-weight:800; padding:3px 9px; border-radius:20px; letter-spacing:.3px; z-index:2; border:1px solid rgba(255,255,255,.25); }

        /* card body */
        .sp2-card-body { padding:14px 16px 16px; }
        .sp2-card-title { font-size:15px; font-weight:800; color:#0f172a; margin:0 0 5px; line-height:1.2; }
        .sp2-card:hover .sp2-card-title { color:#1a5c38; }
        .sp2-card-desc { font-size:12px; color:#64748b; line-height:1.55; margin:0 0 10px; }
        .sp2-card-foot { display:flex; align-items:center; justify-content:space-between; }
        .sp2-therapists { display:inline-flex; align-items:center; gap:4px; font-size:11px; font-weight:700; padding:3px 10px; border-radius:20px; }
        .sp2-card-arrow { display:flex; align-items:center; gap:4px; font-size:12px; font-weight:700; color:#228756; transition:gap .2s; }
        .sp2-card:hover .sp2-card-arrow { gap:7px; }
        .sp2-card-arrow i { font-size:12px; }

        /* empty */
        .sp2-empty { text-align:center; padding:60px 0; grid-column:1/-1; color:#94a3b8; }
        .sp2-empty i { font-size:48px; display:block; margin-bottom:14px; }

        /* view all CTA */
        .sp2-cta-wrap { text-align:center; margin-top:40px; }
        .sp2-cta { display:inline-flex; align-items:center; gap:8px; padding:13px 32px; background:linear-gradient(135deg,#1a5c38,#228756); color:#fff; border-radius:50px; font-size:14px; font-weight:800; text-decoration:none; box-shadow:0 4px 20px rgba(26,92,56,.3); transition:all .2s; }
        .sp2-cta:hover { transform:translateY(-2px); box-shadow:0 8px 28px rgba(26,92,56,.35); color:#fff; }
        .sp2-cta i { font-size:14px; transition:transform .2s; }
        .sp2-cta:hover i { transform:translateX(4px); }

        /* ── responsive ─────────────────────────────────── */
        @media(max-width:1024px) { .sp2-grid { grid-template-columns:repeat(3,1fr); } }
        @media(max-width:767px)  {
          .sp2-grid { grid-template-columns:repeat(2,1fr); gap:12px; }
          .sp2-head { flex-direction:column; align-items:flex-start; gap:12px; }
          .sp2-search-wrap { width:100%; }
          .sp2-search-box { width:100%; }
          .sp2-card-top { height:90px; }
          .sp2-card-emoji { font-size:34px; }
          .sp2-card-body { padding:11px 12px 13px; }
          .sp2-card-title { font-size:13.5px; }
          .sp2-card-desc { font-size:11.5px; display:none; }
        }
        @media(max-width:400px) {
          .sp2-grid { grid-template-columns:repeat(2,1fr); gap:10px; }
        }
      `}</style>

      <div className="sp2-wrap">

        {/* ── Header ── */}
        <div className="sp2-head">
          <div>
            <div className="sp2-bar" />
            <h2 className="sp2-title">Explore Specializations</h2>
            <p className="sp2-sub">Find the right expert for what you're going through</p>
          </div>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:10 }}>
            <span className="sp2-count">
              <i className="feather-check-circle" style={{ fontSize:12, marginRight:4 }}></i>
              {filtered.length} specializations
            </span>
            <div className="sp2-search-wrap">
              <div className="sp2-search-box">
                <i className="feather-search" style={{ color:"#94a3b8", fontSize:14, flexShrink:0 }}></i>
                <input
                  ref={searchRef}
                  className="sp2-search"
                  type="text"
                  placeholder="Search concerns…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {search && (
                  <button className="sp2-clear" onClick={() => { setSearch(""); searchRef.current?.focus(); }}>×</button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Category pills ── */}
        <div className="sp2-pills">
          {CATS.map(c => (
            <button
              key={c.key}
              className={`sp2-pill${activeCat === c.key ? " on" : ""}`}
              onClick={() => setActiveCat(c.key)}
            >
              <i className={c.icon}></i>
              {c.label}
            </button>
          ))}
        </div>

        {/* ── Grid ── */}
        <div className="sp2-grid">
          {filtered.length === 0 ? (
            <div className="sp2-empty">
              <i className="feather-search"></i>
              <p style={{ fontWeight:700, margin:"0 0 4px", color:"#334155" }}>No results found</p>
              <p style={{ fontSize:13, margin:0 }}>Try a different search or category</p>
            </div>
          ) : (
            filtered.map(s => (
              <Link key={s.id} href={s.link} className="sp2-card"
                onMouseEnter={() => setHovered(s.id)}
                onMouseLeave={() => setHovered(null)}>

                {/* Coloured top with emoji */}
                <div className="sp2-card-top" style={{ background: s.grad }}>
                  <div className="sp2-card-top-pattern" />
                  <span className="sp2-card-emoji">{s.emoji}</span>
                  {s.popular && <span className="sp2-popular">🔥 Popular</span>}
                </div>

                {/* Body */}
                <div className="sp2-card-body">
                  <h3 className="sp2-card-title">{s.title}</h3>
                  <p className="sp2-card-desc">{s.short}</p>
                  <div className="sp2-card-foot">
                    <span className="sp2-therapists"
                      style={{ background: s.light, color: s.textLight }}>
                      <i className="feather-user" style={{ fontSize:10 }}></i>
                      {s.therapists} therapists
                    </span>
                    <span className="sp2-card-arrow" style={{ color: s.textLight }}>
                      Explore <i className="feather-arrow-right"></i>
                    </span>
                  </div>
                </div>

              </Link>
            ))
          )}
        </div>

        {/* ── View All CTA ── */}
        <div className="sp2-cta-wrap">
          <Link href="/view-all-therapist" className="sp2-cta">
            <i className="feather-grid"></i>
            Browse All Therapists
            <i className="feather-arrow-right"></i>
          </Link>
          <p style={{ margin:"14px 0 0", fontSize:13, color:"#94a3b8" }}>
            100+ verified mental health professionals across India
          </p>
        </div>

      </div>
    </section>
  );
}
