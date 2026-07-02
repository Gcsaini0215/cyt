import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { GetFavriouteTherapistListUrl, getTherapistProfiles } from "../../utils/url";
import { fetchById, fetchData } from "../../utils/actions";
import ProfileCardVert from "../home/profile-card-vert.js";
import { ExpList, languageSpoken, services, stateList } from "../../utils/static-lists";
import { getDecodedToken } from "../../utils/jwt";

export default function ViewAllTherapist() {
  const router = useRouter();
  const [allData, setAllData] = React.useState([]);
  const [filteredData, setFilteredData] = React.useState([]);
  const [data, setData] = React.useState([]);
  const [favrioutes, setFavrioutes] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [tempFilter, setTempFilter] = React.useState({});
  const timeoutRef = React.useRef(null);
  const resultsRef = React.useRef(null);
  const isFirstRender = React.useRef(true);
  const ITEMS_PER_PAGE = 9;

  const [filter, setFilter] = React.useState({
    profile_type: "", services: "", year_of_exp: "",
    language_spoken: "", state: "", search: "", page: 1, pageSize: 1000,
  });

  React.useEffect(() => {
    if (!router.isReady) return;
    const q = router.query;
    const fromUrl = {
      profile_type: q.profile_type || "", services: q.services || "",
      year_of_exp: q.year_of_exp || "", language_spoken: q.language_spoken || "",
      state: q.state || "", search: q.search || "", page: 1, pageSize: 1000,
    };
    if (q.search) setSearch(q.search);
    setFilter(fromUrl);
  }, [router.isReady]);

  React.useEffect(() => {
    if (!router.isReady) return;
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    const params = {};
    if (filter.profile_type)    params.profile_type    = filter.profile_type;
    if (filter.services)        params.services        = filter.services;
    if (filter.year_of_exp)     params.year_of_exp     = filter.year_of_exp;
    if (filter.language_spoken) params.language_spoken = filter.language_spoken;
    if (filter.state)           params.state           = filter.state;
    if (filter.search)          params.search          = filter.search;
    router.replace({ pathname: router.pathname, query: params }, undefined, { shallow: true });
  }, [filter.profile_type, filter.services, filter.year_of_exp, filter.language_spoken, filter.state, filter.search]);

  React.useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const res = await fetchData(getTherapistProfiles, filter);
        if (res?.data) setAllData(res.data || []);
      } catch {}
      finally { setLoading(false); }
    };
    const getFavs = async () => {
      try {
        const res = await fetchById(GetFavriouteTherapistListUrl);
        if (res?.data) setFavrioutes(res.data.therapists || []);
      } catch {}
    };
    getData();
    const tok = getDecodedToken();
    if (tok && tok.role !== 1) getFavs();
  }, []);

  const profileTypeOptions = React.useMemo(() => {
    const types = allData.map(i => i.profile_type).filter(Boolean);
    return [...new Set(types)].map(t => ({ label: t, value: t }));
  }, [allData]);

  React.useEffect(() => {
    let f = allData;
    if (filter.search) {
      const q = filter.search.toLowerCase();
      f = f.filter(i =>
        (i.user?.name || "").toLowerCase().includes(q) ||
        (i.services || "").toLowerCase().includes(q) ||
        (i.language_spoken || "").toLowerCase().includes(q) ||
        (i.state || "").toLowerCase().includes(q)
      );
    }
    if (filter.profile_type)    f = f.filter(i => i.profile_type === filter.profile_type);
    if (filter.services)        f = f.filter(i => i.services?.includes(filter.services));
    if (filter.year_of_exp)     f = f.filter(i => (i.year_of_exp || "").trim() === filter.year_of_exp);
    if (filter.language_spoken) f = f.filter(i => i.language_spoken?.includes(filter.language_spoken));
    if (filter.state)           f = f.filter(i => (i.state || "").toLowerCase() === filter.state.toLowerCase());
    setFilteredData(f);
    setCurrentPage(1);
    setData(f.slice(0, ITEMS_PER_PAGE));
  }, [filter, allData]);

  React.useEffect(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    setData(filteredData.slice(start, start + ITEMS_PER_PAGE));
  }, [currentPage, filteredData]);

  const handleSearchChange = (e) => {
    const v = e.target.value;
    setSearch(v);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setFilter(f => ({ ...f, search: v.length > 2 ? v : "" }));
    }, 300);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilter(f => ({ ...f, [name]: value }));
  };

  const openSheet = () => {
    setTempFilter({ profile_type: filter.profile_type, services: filter.services, year_of_exp: filter.year_of_exp, language_spoken: filter.language_spoken, state: filter.state });
    setSheetOpen(true);
  };
  const applySheet = () => { setFilter(f => ({ ...f, ...tempFilter })); setSheetOpen(false); };
  const clearSheet = () => setTempFilter({ profile_type: "", services: "", year_of_exp: "", language_spoken: "", state: "" });

  const resetFilters = () => {
    setSearch(""); setCurrentPage(1);
    setFilter({ profile_type: "", services: "", year_of_exp: "", language_spoken: "", state: "", search: "", page: 1, pageSize: 1000 });
  };

  const hasFilter = filter.profile_type || filter.services || filter.year_of_exp || filter.language_spoken || filter.state || filter.search;
  const activeFilterCount = [filter.profile_type, filter.services, filter.year_of_exp, filter.language_spoken, filter.state].filter(Boolean).length;
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const goToPage = (page) => {
    setCurrentPage(page);
    if (resultsRef.current) resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const getPageNumbers = () => {
    const pages = [], delta = 2;
    const left = Math.max(1, currentPage - delta);
    const right = Math.min(totalPages, currentPage + delta);
    for (let i = left; i <= right; i++) pages.push(i);
    if (left > 1)           { pages.unshift("..."); pages.unshift(1); }
    if (right < totalPages) { pages.push("..."); pages.push(totalPages); }
    return pages;
  };

  const ro = (item) => typeof item === "string" ? item : item.label || item.value;

  /* Quick filter pills — Zomato-style horizontal scroll */
  const QUICK = [
    { label: "Anxiety", field: "services", value: "Anxiety" },
    { label: "Depression", field: "services", value: "Depression" },
    { label: "Relationships", field: "services", value: "Relationship" },
    { label: "Trauma", field: "services", value: "Trauma" },
    { label: "OCD", field: "services", value: "OCD" },
    { label: "Child Therapy", field: "services", value: "Child" },
    { label: "Online", field: "services", value: "Online" },
  ];

  const isQuickActive = (q) => filter[q.field]?.toLowerCase().includes(q.value.toLowerCase());

  const toggleQuick = (q) => {
    setFilter(f => ({ ...f, [q.field]: isQuickActive(q) ? "" : q.value }));
  };

  return (
    <>
      <style suppressHydrationWarning>{`
        /* ───────── BANNER ───────── */
        .vat-banner {
          background: linear-gradient(145deg,#061810 0%,#0c2e1a 40%,#0f3d25 100%);
          padding: 60px 0 80px;
          position: relative;
          overflow: hidden;
        }
        .vat-banner::after {
          content:'';
          position:absolute; bottom:0; left:0; right:0; height:1px;
          background:linear-gradient(90deg,transparent,rgba(46,204,113,.4),transparent);
        }
        .vat-ban-orb1 { position:absolute; top:-80px; right:-60px; width:380px; height:380px; border-radius:50%; background:radial-gradient(circle,rgba(34,135,86,.15) 0%,transparent 70%); pointer-events:none; }
        .vat-ban-orb2 { position:absolute; bottom:-60px; left:-40px; width:280px; height:280px; border-radius:50%; background:radial-gradient(circle,rgba(14,165,233,.08) 0%,transparent 70%); pointer-events:none; }
        .vat-ban-inner { position:relative; z-index:2; }
        .vat-ban-eyebrow { display:inline-flex; align-items:center; gap:7px; background:rgba(46,204,113,.12); border:1px solid rgba(46,204,113,.25); border-radius:20px; padding:5px 14px; font-size:12px; font-weight:700; color:#4ade80; letter-spacing:.4px; margin-bottom:16px; }
        .vat-ban-title { color:#fff; font-size:clamp(1.9rem,5vw,3rem); font-weight:900; margin:0 0 12px; line-height:1.12; letter-spacing:-0.5px; }
        .vat-ban-title em { color:#4ade80; font-style:normal; }
        .vat-ban-sub { color:rgba(255,255,255,.6); font-size:15px; margin:0; max-width:480px; line-height:1.7; font-weight:500; }
        .vat-ban-stats { display:flex; gap:28px; margin-top:28px; }
        .vat-ban-stat-val { font-size:22px; font-weight:900; color:#fff; line-height:1; }
        .vat-ban-stat-lbl { font-size:11px; color:rgba(255,255,255,.45); font-weight:600; margin-top:3px; text-transform:uppercase; letter-spacing:.5px; }

        /* ───────── STICKY FILTER BAR ───────── */
        .vat-filter-wrap {
          position: sticky;
          top: 0;
          z-index: 200;
          background: #fff;
          border-bottom: 1px solid #e8edf2;
          box-shadow: 0 2px 16px rgba(0,0,0,.07);
        }
        .vat-filter-inner {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 0;
        }
        .vat-search-wrap { position:relative; flex:1; min-width:0; }
        .vat-search-input {
          width:100%; padding:11px 44px 11px 16px;
          border-radius:12px; border:1.5px solid #e2e8f0;
          font-size:14px; background:#f8fafc; outline:none;
          color:#1e293b; transition:all .2s; box-sizing:border-box;
          font-family:inherit;
        }
        .vat-search-input:focus { border-color:#228756; background:#fff; box-shadow:0 0 0 3px rgba(34,135,86,.08); }
        .vat-search-icon {
          position:absolute; right:12px; top:50%; transform:translateY(-50%);
          color:#94a3b8; pointer-events:none;
        }
        .vat-fsel {
          height:42px; border-radius:12px; border:1.5px solid #e8edf2;
          background:#f8fafc; font-size:13px; padding:0 12px;
          color:#475569; font-weight:600; outline:none; cursor:pointer;
          transition:all .2s; white-space:nowrap; font-family:inherit;
          flex-shrink:0;
        }
        .vat-fsel:focus { border-color:#228756; }
        .vat-fsel.on { border-color:#228756; background:#f0fdf4; color:#166534; }
        .vat-clear-btn {
          display:inline-flex; align-items:center; gap:5px;
          font-size:12.5px; font-weight:700; color:#ef4444;
          border:1.5px solid #fecaca; background:#fff5f5;
          padding:0 14px; height:42px; border-radius:12px;
          cursor:pointer; white-space:nowrap; flex-shrink:0; font-family:inherit;
        }

        /* ───────── QUICK PILLS ───────── */
        .vat-quick-bar {
          padding: 10px 0 14px;
          display: flex;
          gap: 8px;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .vat-quick-bar::-webkit-scrollbar { display:none; }
        .vat-qpill {
          flex-shrink:0;
          padding:6px 16px; border-radius:20px;
          font-size:13px; font-weight:700;
          border:1.5px solid #e2e8f0; background:#fff;
          color:#64748b; cursor:pointer;
          transition:all .18s; white-space:nowrap; font-family:inherit;
        }
        .vat-qpill:hover { border-color:#228756; color:#228756; background:#f0fdf4; }
        .vat-qpill.on { border-color:#228756; background:#228756; color:#fff; }

        /* ───────── RESULTS ───────── */
        .vat-results { padding:32px 0 80px; background:#f8fafc; min-height:50vh; }
        .vat-results-hd { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; flex-wrap:wrap; gap:10px; }
        .vat-results-label { font-size:17px; font-weight:800; color:#1e293b; }
        .vat-results-sub { font-size:13px; color:#94a3b8; font-weight:600; margin-top:2px; }
        .vat-reset { display:inline-flex; align-items:center; gap:5px; font-size:12px; font-weight:700; color:#ef4444; border:1.5px solid #fecaca; background:#fff5f5; padding:5px 14px; border-radius:20px; cursor:pointer; font-family:inherit; }

        /* active filter chips */
        .vat-chip { display:inline-flex; align-items:center; gap:6px; background:#f0fdf4; border:1.5px solid #86efac; color:#166534; font-size:12px; font-weight:700; padding:4px 10px 4px 13px; border-radius:20px; }
        .vat-chip-x { background:none; border:none; padding:0; cursor:pointer; color:#16a34a; display:flex; align-items:center; line-height:1; font-size:13px; }

        /* skeleton */
        @keyframes vat-sh { 0%{background-position:200%} 100%{background-position:-200%} }
        .vat-sk { border-radius:18px; overflow:hidden; background:#fff; border:1px solid #e8edf2; }
        .vat-sk-img { height:200px; background:linear-gradient(90deg,#f1f5f9 25%,#e8edf2 50%,#f1f5f9 75%); background-size:200%; animation:vat-sh 1.4s infinite; }
        .vat-sk-body { padding:16px; display:flex; flex-direction:column; gap:10px; }
        .vat-sk-line { height:13px; border-radius:6px; background:linear-gradient(90deg,#f1f5f9 25%,#e8edf2 50%,#f1f5f9 75%); background-size:200%; animation:vat-sh 1.4s infinite; }

        /* pagination */
        .vat-pag { display:flex; align-items:center; justify-content:center; gap:6px; margin-top:40px; flex-wrap:wrap; }
        .vat-pg {
          min-width:38px; height:38px; border-radius:10px; border:1.5px solid #e2e8f0;
          background:#fff; color:#475569; font-size:14px; font-weight:700;
          cursor:pointer; display:inline-flex; align-items:center; justify-content:center;
          transition:all .18s; padding:0 6px; font-family:inherit;
        }
        .vat-pg:hover:not(:disabled):not(.el) { border-color:#228756; color:#228756; background:#f0fdf4; }
        .vat-pg.act { background:#228756; border-color:#228756; color:#fff; box-shadow:0 4px 14px rgba(34,135,86,.28); }
        .vat-pg:disabled { opacity:.4; cursor:not-allowed; }
        .vat-pg.el { border:none; background:transparent; cursor:default; }
        .vat-pg-info { font-size:12.5px; color:#94a3b8; font-weight:600; text-align:center; margin-top:10px; }

        /* empty state */
        .vat-empty { text-align:center; padding:60px 20px; }
        .vat-empty-ico { width:72px; height:72px; border-radius:20px; background:#f1f5f9; display:flex; align-items:center; justify-content:center; margin:0 auto 18px; font-size:28px; }
        .vat-empty h4 { font-size:17px; font-weight:800; color:#1e293b; margin:0 0 8px; }
        .vat-empty p { color:#94a3b8; font-size:14px; margin:0 0 20px; }

        /* ───────── MOBILE FAB + SHEET ───────── */
        .vat-fab { display:none; }
        .vat-overlay { display:none; }
        .vat-sheet { display:none; }

        @media(max-width:767px){
          .vat-banner { padding:44px 0 64px; }
          .vat-ban-stats { gap:20px; }
          .vat-ban-stat-val { font-size:18px; }
          .vat-desk-sel { display:none; }
          .vat-results { padding:20px 0 100px; }

          .vat-fab {
            display:flex; align-items:center; gap:8px;
            position:fixed; bottom:20px; left:50%; transform:translateX(-50%);
            z-index:300;
            background:linear-gradient(135deg,#228756,#1a6b44); color:#fff;
            border:none; padding:13px 26px; border-radius:50px;
            font-size:14px; font-weight:800;
            box-shadow:0 6px 24px rgba(34,135,86,.45);
            cursor:pointer; white-space:nowrap; font-family:inherit;
          }
          .vat-fab-badge { background:#fff; color:#228756; font-size:11px; font-weight:900; width:19px; height:19px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; }

          .vat-overlay { display:block; position:fixed; inset:0; z-index:400; background:rgba(0,0,0,.55); backdrop-filter:blur(3px); opacity:0; pointer-events:none; transition:opacity .25s; }
          .vat-overlay.open { opacity:1; pointer-events:all; }

          .vat-sheet {
            display:block; position:fixed; bottom:0; left:0; right:0;
            z-index:500; background:#fff;
            border-radius:24px 24px 0 0;
            transform:translateY(102%);
            transition:transform .32s cubic-bezier(.32,.72,0,1);
            max-height:88vh; overflow-y:auto;
            padding-bottom:env(safe-area-inset-bottom,0);
          }
          .vat-sheet.open { transform:translateY(0); }
          .vat-sh-handle { width:40px; height:4px; border-radius:2px; background:#e2e8f0; margin:14px auto 0; display:block; }
          .vat-sh-hd { display:flex; align-items:center; justify-content:space-between; padding:16px 20px 12px; border-bottom:1px solid #f1f5f9; }
          .vat-sh-hd h5 { margin:0; font-size:16px; font-weight:900; color:#1e293b; }
          .vat-sh-close { width:32px; height:32px; border-radius:50%; border:none; background:#f1f5f9; color:#64748b; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:16px; }
          .vat-sh-body { padding:16px 20px; display:flex; flex-direction:column; gap:14px; }
          .vat-sh-lbl { font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:.8px; margin-bottom:5px; }
          .vat-sh-sel { width:100%; height:48px; border-radius:13px; border:1.5px solid #e8edf2; background:#f8fafc; font-size:14px; padding:0 16px; color:#1e293b; font-weight:600; outline:none; cursor:pointer; font-family:inherit; }
          .vat-sh-sel:focus { border-color:#228756; }
          .vat-sh-sel.on { border-color:#228756; background:#f0fdf4; color:#166534; }
          .vat-sh-foot { display:flex; gap:10px; padding:14px 20px 20px; border-top:1px solid #f1f5f9; }
          .vat-sh-clr { flex:1; height:48px; border-radius:13px; border:1.5px solid #e2e8f0; background:#fff; color:#64748b; font-size:14px; font-weight:700; cursor:pointer; font-family:inherit; }
          .vat-sh-apply { flex:2; height:48px; border-radius:13px; border:none; background:linear-gradient(135deg,#228756,#1a6b44); color:#fff; font-size:15px; font-weight:800; cursor:pointer; box-shadow:0 4px 14px rgba(34,135,86,.32); font-family:inherit; }
        }

        @media(min-width:768px) and (max-width:1100px){
          .vat-fsel { font-size:12px; padding:0 9px; }
        }
      `}</style>

      {/* ── BANNER ── */}
      <div className="vat-banner">
        <div className="vat-ban-orb1" /><div className="vat-ban-orb2" />
        <div className="container">
          <div className="vat-ban-inner">
            <div className="vat-ban-eyebrow">
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4"/><path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/></svg>
              Verified Professionals Only
            </div>
            <h1 className="vat-ban-title">Find Your <em>Perfect</em><br />Therapist</h1>
            <p className="vat-ban-sub">Browse India's most trusted directory of verified psychologists, counsellors &amp; therapists.</p>
            <div className="vat-ban-stats">
              <div>
                <div className="vat-ban-stat-val">{allData.length > 0 ? `${allData.length}+` : "—"}</div>
                <div className="vat-ban-stat-lbl">Verified Therapists</div>
              </div>
              <div style={{ width:1, background:"rgba(255,255,255,.1)", alignSelf:"stretch" }} />
              <div>
                <div className="vat-ban-stat-val">4.8★</div>
                <div className="vat-ban-stat-lbl">Avg. Rating</div>
              </div>
              <div style={{ width:1, background:"rgba(255,255,255,.1)", alignSelf:"stretch" }} />
              <div>
                <div className="vat-ban-stat-val">Online</div>
                <div className="vat-ban-stat-lbl">Available Now</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── STICKY FILTER BAR ── */}
      <div className="vat-filter-wrap">
        <div className="container">
          <div className="vat-filter-inner">
            {/* Search */}
            <div className="vat-search-wrap">
              <input
                type="text"
                className="vat-search-input"
                placeholder="Search name, concern, language..."
                value={search}
                onChange={handleSearchChange}
              />
              <span className="vat-search-icon">
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              </span>
            </div>

            {/* Desktop selects */}
            <div className="vat-desk-sel" style={{ display:"flex", gap:8, alignItems:"center" }}>
              <select name="profile_type" value={filter.profile_type} onChange={handleChange} className={`vat-fsel${filter.profile_type ? " on" : ""}`}>
                <option value="">Type</option>
                {profileTypeOptions.map((item, i) => <option key={i} value={item.value}>{ro(item)}</option>)}
              </select>
              <select name="services" value={filter.services} onChange={handleChange} className={`vat-fsel${filter.services ? " on" : ""}`}>
                <option value="">Specialty</option>
                {services.map((item, i) => <option key={i} value={item}>{ro(item)}</option>)}
              </select>
              <select name="year_of_exp" value={filter.year_of_exp} onChange={handleChange} className={`vat-fsel${filter.year_of_exp ? " on" : ""}`}>
                <option value="">Experience</option>
                {ExpList.map((item, i) => <option key={i} value={item}>{ro(item)}</option>)}
              </select>
              <select name="language_spoken" value={filter.language_spoken} onChange={handleChange} className={`vat-fsel${filter.language_spoken ? " on" : ""}`}>
                <option value="">Language</option>
                {languageSpoken.map((item, i) => <option key={i} value={typeof item === "string" ? item : item.value}>{ro(item)}</option>)}
              </select>
              <select name="state" value={filter.state} onChange={handleChange} className={`vat-fsel${filter.state ? " on" : ""}`}>
                <option value="">State</option>
                {stateList.map((item, i) => <option key={i} value={typeof item === "string" ? item : item.value}>{ro(item)}</option>)}
              </select>
              {hasFilter && <button className="vat-clear-btn" onClick={resetFilters}><svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Clear</button>}
            </div>
          </div>

          {/* Quick pills */}
          <div className="vat-quick-bar">
            {QUICK.map(q => (
              <button key={q.label} className={`vat-qpill${isQuickActive(q) ? " on" : ""}`} onClick={() => toggleQuick(q)}>
                {q.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── MOBILE OVERLAY + SHEET ── */}
      <div className={`vat-overlay${sheetOpen ? " open" : ""}`} onClick={() => setSheetOpen(false)} />
      <div className={`vat-sheet${sheetOpen ? " open" : ""}`}>
        <span className="vat-sh-handle" />
        <div className="vat-sh-hd">
          <h5>Filter Therapists</h5>
          <button className="vat-sh-close" onClick={() => setSheetOpen(false)}>✕</button>
        </div>
        <div className="vat-sh-body">
          {[
            { label:"Profile Type",   name:"profile_type",    opts:profileTypeOptions, obj:true },
            { label:"Specialty",      name:"services",        opts:services,           obj:false },
            { label:"Experience",     name:"year_of_exp",     opts:ExpList,            obj:false },
            { label:"Language",       name:"language_spoken", opts:languageSpoken,     obj:true },
            { label:"State",          name:"state",           opts:stateList,          obj:true },
          ].map(({ label, name, opts, obj }) => (
            <div key={name}>
              <div className="vat-sh-lbl">{label}</div>
              <select name={name} value={tempFilter[name] || ""} onChange={e => setTempFilter(f => ({ ...f, [name]: e.target.value }))} className={`vat-sh-sel${tempFilter[name] ? " on" : ""}`}>
                <option value="">All {label}s</option>
                {opts.map((item, i) => { const val = obj && typeof item === "object" ? item.value : item; return <option key={i} value={val}>{ro(item)}</option>; })}
              </select>
            </div>
          ))}
        </div>
        <div className="vat-sh-foot">
          <button className="vat-sh-clr" onClick={clearSheet}>Clear All</button>
          <button className="vat-sh-apply" onClick={applySheet}>Show Results</button>
        </div>
      </div>

      {/* ── RESULTS ── */}
      <div className="vat-results" ref={resultsRef}>
        <div className="container">
          <div className="vat-results-hd">
            <div>
              <div className="vat-results-label">
                {loading ? "Loading..." : hasFilter ? `${filteredData.length} therapist${filteredData.length !== 1 ? "s" : ""} found` : "All Therapists"}
              </div>
              <div className="vat-results-sub">
                {!loading && (hasFilter ? "Filtered results" : `${allData.length} verified professionals`)}
                {!loading && totalPages > 1 && ` · Page ${currentPage} of ${totalPages}`}
              </div>
            </div>
            {hasFilter && !loading && (
              <button className="vat-reset" onClick={resetFilters}>
                <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                Clear Filters
              </button>
            )}
          </div>

          {/* Active filter chips */}
          {hasFilter && !loading && (
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:20 }}>
              {[
                { key:"profile_type", val:filter.profile_type },
                { key:"services",     val:filter.services },
                { key:"year_of_exp",  val:filter.year_of_exp },
                { key:"language_spoken", val:filter.language_spoken },
                { key:"state",        val:filter.state },
                { key:"search",       val:filter.search ? `"${filter.search}"` : "" },
              ].filter(f => f.val).map(f => (
                <span key={f.key} className="vat-chip">
                  {f.val}
                  <button className="vat-chip-x" onClick={() => { if (f.key === "search") { setSearch(""); } setFilter(p => ({ ...p, [f.key]: "" })); }}>✕</button>
                </span>
              ))}
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="row g-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="col-lg-4 col-md-6 col-12">
                  <div className="vat-sk">
                    <div className="vat-sk-img" />
                    <div className="vat-sk-body">
                      <div className="vat-sk-line" style={{ width:"65%" }} />
                      <div className="vat-sk-line" style={{ width:"45%" }} />
                      <div className="vat-sk-line" style={{ width:"80%", marginTop:8 }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : data.length === 0 ? (
            <div className="vat-empty">
              <div className="vat-empty-ico">🔍</div>
              <h4>No therapists found</h4>
              <p>Try adjusting or clearing your filters</p>
              <button className="vat-reset" style={{ margin:"0 auto", padding:"9px 20px" }} onClick={resetFilters}>Clear Filters</button>
            </div>
          ) : (
            <div className="row g-4">
              {data.map(item => (
                <div key={item._id} className="col-lg-4 col-md-6 col-sm-6 col-12">
                  <ProfileCardVert data={item} favrioutes={favrioutes} />
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div>
              <div className="vat-pag">
                <button className="vat-pg" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
                {getPageNumbers().map((p, i) => (
                  <button key={i} className={`vat-pg${p === currentPage ? " act" : ""}${p === "..." ? " el" : ""}`} onClick={() => p !== "..." && goToPage(p)} disabled={p === "..."}>{p}</button>
                ))}
                <button className="vat-pg" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
                </button>
              </div>
              <div className="vat-pg-info">Showing {((currentPage-1)*ITEMS_PER_PAGE)+1}–{Math.min(currentPage*ITEMS_PER_PAGE, filteredData.length)} of {filteredData.length}</div>
            </div>
          )}
        </div>
      </div>

      {/* ── MOBILE FILTER FAB ── */}
      <button className="vat-fab" onClick={openSheet}>
        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
        Filters
        {activeFilterCount > 0 && <span className="vat-fab-badge">{activeFilterCount}</span>}
      </button>
    </>
  );
}
