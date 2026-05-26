import React from "react";
import Link from "next/link";
import {
  GetFavriouteTherapistListUrl,
  getTherapistProfiles,
} from "../../utils/url";
import { fetchById, fetchData } from "../../utils/actions";
import ProfileCardVert from "../home/profile-card-vert.js";
import { ExpList, languageSpoken, services, stateList } from "../../utils/static-lists";
import { getDecodedToken } from "../../utils/jwt";

export default function ViewAllTherapist() {
  const [data, setData] = React.useState([]);
  const [allData, setAllData] = React.useState([]);
  const [count, setCount] = React.useState(0);
  const [search, setSearch] = React.useState("");
  const [favrioutes, setFavrioutes] = React.useState([]);
  const timeoutRef = React.useRef(null);
  const [loading, setLoading] = React.useState(false);
  const [visibleCount, setVisibleCount] = React.useState(9);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [tempFilter, setTempFilter] = React.useState({});
  const resultsRef = React.useRef(null);

  const [filter, setFilter] = React.useState({
    profile_type: "", services: "", year_of_exp: "",
    language_spoken: "", state: "", search: "", page: 1, pageSize: 1000,
  });

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setFilter(f => ({ ...f, search: value.length > 2 ? value : "" }));
    }, 300);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilter(f => ({ ...f, [name]: value }));
  };

  const handleTempChange = (e) => {
    const { name, value } = e.target;
    setTempFilter(f => ({ ...f, [name]: value }));
  };

  const openSheet = () => {
    setTempFilter({
      profile_type: filter.profile_type,
      services: filter.services,
      year_of_exp: filter.year_of_exp,
      language_spoken: filter.language_spoken,
      state: filter.state,
    });
    setSheetOpen(true);
  };

  const applySheet = () => {
    setFilter(f => ({ ...f, ...tempFilter }));
    setSheetOpen(false);
  };

  const clearSheet = () => {
    setTempFilter({ profile_type: "", services: "", year_of_exp: "", language_spoken: "", state: "" });
  };

  const resetFilters = () => {
    setSearch("");
    setFilter({ profile_type: "", services: "", year_of_exp: "", language_spoken: "", state: "", search: "", page: 1, pageSize: 1000 });
  };

  const hasFilter = filter.profile_type || filter.services || filter.year_of_exp || filter.language_spoken || filter.state || filter.search;
  const activeFilterCount = [filter.profile_type, filter.services, filter.year_of_exp, filter.language_spoken, filter.state].filter(Boolean).length;

  React.useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const res = await fetchData(getTherapistProfiles, filter);
        if (res?.data) {
          setAllData(res.data || []);
          setCount(res.totalCount || res.data?.length || 0);
          setData(res.data?.slice(0, visibleCount) || []);
        }
      } catch (err) {
        console.error("Error fetching therapists:", err);
      } finally {
        setLoading(false);
      }
    };

    const getFavrioutes = async () => {
      try {
        const res = await fetchById(GetFavriouteTherapistListUrl);
        if (res?.data) setFavrioutes(res.data.therapists || []);
      } catch {}
    };

    getData();
    const tokenData = getDecodedToken();
    if (tokenData && tokenData.role !== 1) getFavrioutes();
  }, []);

  const profileTypeOptions = React.useMemo(() => {
    const types = allData.map(i => i.profile_type).filter(Boolean);
    return [...new Set(types)].map(t => ({ label: t, value: t }));
  }, [allData]);

  React.useEffect(() => {
    let filtered = allData;
    if (filter.search) {
      const q = filter.search.toLowerCase();
      filtered = filtered.filter(i =>
        (i.user?.name || "").toLowerCase().includes(q) ||
        (i.services || "").toLowerCase().includes(q) ||
        (i.language_spoken || "").toLowerCase().includes(q) ||
        (i.state || "").toLowerCase().includes(q)
      );
    }
    if (filter.profile_type) filtered = filtered.filter(i => i.profile_type === filter.profile_type);
    if (filter.services) filtered = filtered.filter(i => i.services?.includes(filter.services));
    if (filter.year_of_exp) filtered = filtered.filter(i => (i.year_of_exp || "").trim() === filter.year_of_exp);
    if (filter.language_spoken) filtered = filtered.filter(i => i.language_spoken?.includes(filter.language_spoken));
    if (filter.state) filtered = filtered.filter(i => (i.state || "").toLowerCase() === filter.state.toLowerCase());

    setData(filtered.slice(0, visibleCount));
  }, [filter, allData, visibleCount]);

  const handleLoadMore = () => setVisibleCount(p => p + 6);

  const ro = (item) => typeof item === "string" ? item : item.label || item.value;

  return (
    <>
      <style suppressHydrationWarning>{`
        /* ── Banner ─────────────────────────────────── */
        .vat-banner {
          position: relative;
          background-image: url('https://i.postimg.cc/5yf8k8ts/bg-image-12dabd.jpg');
          background-size: cover;
          background-position: center;
          overflow: hidden;
          padding: 64px 0 52px;
        }
        .vat-banner::before {
          content:'';
          position:absolute;
          inset:0;
          background: linear-gradient(135deg,rgba(10,46,28,.88) 0%,rgba(0,0,0,.65) 100%);
          z-index:1;
        }
        .vat-ban-inner { position:relative; z-index:2; text-align:center; }
        .vat-ban-tag { display:inline-flex; align-items:center; gap:7px; background:rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.2); border-radius:50px; padding:5px 16px; font-size:12px; font-weight:700; color:#fff; letter-spacing:.8px; text-transform:uppercase; margin-bottom:16px; }
        .vat-ban-dot { width:7px; height:7px; border-radius:50%; background:#4ade80; animation:vat-pulse 1.8s ease-in-out infinite; }
        @keyframes vat-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .vat-ban-title { color:#fff; font-size:clamp(1.7rem,5vw,3rem); font-weight:900; margin:0 0 10px; line-height:1.15; }
        .vat-ban-title span { color:#86efac; }
        .vat-ban-sub { color:rgba(255,255,255,.75); font-size:clamp(.85rem,2vw,1.05rem); margin:0 auto 28px; max-width:540px; line-height:1.65; font-weight:500; padding:0 12px; }

        /* search card */
        .vat-search-card { background:#fff; border-radius:20px; padding:22px 24px 18px; max-width:920px; margin:0 auto; box-shadow:0 16px 48px rgba(0,0,0,.25); }
        .vat-search-wrap { position:relative; margin-bottom:16px; }
        .vat-search-input { width:100%; padding:13px 50px 13px 18px; border-radius:12px; border:1.5px solid #e2e8f0; font-size:15px; background:#f8fafc; outline:none; color:#1e293b; transition:border-color .2s; box-sizing:border-box; }
        .vat-search-input:focus { border-color:#228756; background:#fff; box-shadow:0 0 0 3px rgba(34,135,86,.08); }
        .vat-search-btn { position:absolute; right:8px; top:50%; transform:translateY(-50%); background:#228756; color:#fff; border:none; width:34px; height:34px; border-radius:9px; display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; }
        .vat-search-btn i { font-size:14px; }

        /* filter grid — desktop/tablet only */
        .vat-filter-grid { display:grid; grid-template-columns:repeat(5,1fr); gap:10px; margin-bottom:14px; }
        .vat-fsel { width:100%; height:40px; border-radius:10px; border:1.5px solid #e8edf2; background:#f8fafc; font-size:13.5px; padding:0 10px; color:#475569; font-weight:600; outline:none; cursor:pointer; transition:border-color .2s; }
        .vat-fsel:focus { border-color:#228756; }

        /* stats strip */
        .vat-stats-strip { display:flex; align-items:center; justify-content:center; gap:0; flex-wrap:wrap; padding-top:4px; }
        .vat-stat-item { display:flex; align-items:center; gap:5px; font-size:12.5px; color:#64748b; font-weight:600; padding:0 14px; }
        .vat-stat-item:not(:last-child) { border-right:1px solid #e2e8f0; }
        .vat-stat-item i { color:#228756; font-size:13px; }

        /* reset pill */
        .vat-reset { display:inline-flex; align-items:center; gap:5px; font-size:12px; font-weight:700; color:#ef4444; border:1px solid #fecaca; background:#fff5f5; padding:4px 12px; border-radius:20px; cursor:pointer; margin-left:8px; }

        /* ── Results ─────────────────────────────────── */
        .vat-results-wrap { padding:52px 0 60px; }
        .vat-results-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:28px; flex-wrap:wrap; gap:10px; }
        .vat-results-title { font-size:18px; font-weight:800; color:#1e293b; }
        .vat-results-count { font-size:14px; color:#64748b; font-weight:600; }

        /* loading skeleton */
        .vat-skeleton { border-radius:18px; background:#f8fafc; overflow:hidden; }
        .vat-skel-img { height:220px; background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%); background-size:200%; animation:vat-shimmer 1.4s infinite; }
        .vat-skel-body { padding:16px; }
        .vat-skel-line { height:14px; border-radius:6px; background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%); background-size:200%; animation:vat-shimmer 1.4s infinite; margin-bottom:10px; }
        @keyframes vat-shimmer { 0%{background-position:200%} 100%{background-position:-200%} }

        /* load more */
        .vat-load-more { background:linear-gradient(135deg,#228756,#1a6b44); color:#fff; border:none; padding:13px 44px; font-size:15px; font-weight:700; border-radius:50px; cursor:pointer; box-shadow:0 6px 18px rgba(34,135,86,.25); transition:all .2s; }
        .vat-load-more:hover { transform:translateY(-2px); box-shadow:0 10px 24px rgba(34,135,86,.3); }

        /* ── Mobile: Filter FAB + Bottom Sheet ─────── */
        .vat-filter-fab { display:none; }
        .vat-sheet-overlay { display:none; }
        .vat-sheet { display:none; }

        @media(max-width:767px){
          .vat-banner { padding:36px 0 30px; }
          .vat-filter-grid { display:none; }
          .vat-stats-strip { display:none; }
          .vat-search-card { padding:14px 14px 12px; border-radius:16px; }
          .vat-search-input { font-size:14px; padding:11px 46px 11px 14px; }
          .vat-search-btn { width:32px; height:32px; right:7px; }
          .vat-results-wrap { padding:24px 0 100px; }
          .vat-results-header { margin-bottom:14px; }

          /* FAB filter button */
          .vat-filter-fab {
            display:flex;
            align-items:center;
            gap:8px;
            position:fixed;
            bottom:20px;
            left:50%;
            transform:translateX(-50%);
            z-index:300;
            background:linear-gradient(135deg,#228756,#1a6b44);
            color:#fff;
            border:none;
            padding:12px 24px;
            border-radius:50px;
            font-size:14px;
            font-weight:700;
            box-shadow:0 6px 20px rgba(34,135,86,.4);
            cursor:pointer;
            white-space:nowrap;
            transition:transform .2s, box-shadow .2s;
          }
          .vat-filter-fab:active { transform:translateX(-50%) scale(.96); }
          .vat-fab-badge {
            background:#fff;
            color:#228756;
            font-size:11px;
            font-weight:800;
            width:18px;
            height:18px;
            border-radius:50%;
            display:inline-flex;
            align-items:center;
            justify-content:center;
          }

          /* Bottom sheet overlay */
          .vat-sheet-overlay {
            display:block;
            position:fixed;
            inset:0;
            z-index:400;
            background:rgba(0,0,0,.5);
            backdrop-filter:blur(2px);
            opacity:0;
            pointer-events:none;
            transition:opacity .25s;
          }
          .vat-sheet-overlay.open { opacity:1; pointer-events:all; }

          /* Bottom sheet panel */
          .vat-sheet {
            display:block;
            position:fixed;
            bottom:0;
            left:0;
            right:0;
            z-index:500;
            background:#fff;
            border-radius:22px 22px 0 0;
            padding:0 0 env(safe-area-inset-bottom,0);
            transform:translateY(100%);
            transition:transform .3s cubic-bezier(.4,0,.2,1);
            max-height:85vh;
            overflow-y:auto;
          }
          .vat-sheet.open { transform:translateY(0); }

          .vat-sheet-handle {
            width:40px; height:4px; border-radius:2px;
            background:#e2e8f0; margin:12px auto 0; display:block;
          }
          .vat-sheet-head {
            display:flex; align-items:center; justify-content:space-between;
            padding:16px 20px 12px;
            border-bottom:1px solid #f1f5f9;
          }
          .vat-sheet-head h5 { margin:0; font-size:16px; font-weight:800; color:#1e293b; }
          .vat-sheet-close {
            width:30px; height:30px; border-radius:50%; border:none;
            background:#f1f5f9; color:#64748b;
            display:flex; align-items:center; justify-content:center;
            cursor:pointer; font-size:16px;
          }
          .vat-sheet-body { padding:16px 20px; display:flex; flex-direction:column; gap:12px; }
          .vat-sheet-label { font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:.6px; margin-bottom:4px; }
          .vat-sheet-sel {
            width:100%; height:46px; border-radius:12px;
            border:1.5px solid #e8edf2; background:#f8fafc;
            font-size:14px; padding:0 14px; color:#1e293b;
            font-weight:600; outline:none; cursor:pointer;
          }
          .vat-sheet-sel:focus { border-color:#228756; }
          .vat-sheet-sel.active { border-color:#228756; background:#f0fdf4; color:#228756; }
          .vat-sheet-footer {
            display:flex; gap:10px; padding:14px 20px 20px;
            border-top:1px solid #f1f5f9;
          }
          .vat-sheet-clear {
            flex:1; height:46px; border-radius:12px;
            border:1.5px solid #e2e8f0; background:#fff;
            color:#64748b; font-size:14px; font-weight:700;
            cursor:pointer;
          }
          .vat-sheet-apply {
            flex:2; height:46px; border-radius:12px; border:none;
            background:linear-gradient(135deg,#228756,#1a6b44);
            color:#fff; font-size:14px; font-weight:800;
            cursor:pointer; box-shadow:0 4px 12px rgba(34,135,86,.3);
          }
        }

        @media(min-width:768px) and (max-width:991px){
          .vat-filter-grid { grid-template-columns:repeat(3,1fr); }
        }
      `}</style>

      {/* ── Banner ────────────────────────────────────── */}
      <div className="vat-banner">
        <div className="container">
          <div className="vat-ban-inner">
            <div className="vat-ban-tag">
              <div className="vat-ban-dot"></div>
              Verified Therapists
            </div>

            <h1 className="vat-ban-title">
              Find Your <span>Perfect</span> Therapist
            </h1>
            <p className="vat-ban-sub">
              Browse verified mental health professionals across India. Filter by expertise, language, or location.
            </p>

            {/* Search + filter card */}
            <div className="vat-search-card">
              <div className="vat-search-wrap">
                <input
                  type="text"
                  className="vat-search-input"
                  placeholder="Search by name, concern, or language..."
                  value={search}
                  onChange={handleSearchChange}
                />
                <button className="vat-search-btn" type="button">
                  <i className="feather-search"></i>
                </button>
              </div>

              {/* Filter selects — desktop/tablet only */}
              <div className="vat-filter-grid">
                <select name="profile_type" value={filter.profile_type} onChange={handleChange} className="vat-fsel">
                  <option value="">Profile Type</option>
                  {profileTypeOptions.map((item, i) => <option key={i} value={item.value}>{ro(item)}</option>)}
                </select>
                <select name="services" value={filter.services} onChange={handleChange} className="vat-fsel">
                  <option value="">Specialty</option>
                  {services.map((item, i) => <option key={i} value={item}>{ro(item)}</option>)}
                </select>
                <select name="year_of_exp" value={filter.year_of_exp} onChange={handleChange} className="vat-fsel">
                  <option value="">Experience</option>
                  {ExpList.map((item, i) => <option key={i} value={item}>{ro(item)}</option>)}
                </select>
                <select name="language_spoken" value={filter.language_spoken} onChange={handleChange} className="vat-fsel">
                  <option value="">Language</option>
                  {languageSpoken.map((item, i) => <option key={i} value={typeof item === "string" ? item : item.value}>{ro(item)}</option>)}
                </select>
                <select name="state" value={filter.state} onChange={handleChange} className="vat-fsel">
                  <option value="">State</option>
                  {stateList.map((item, i) => <option key={i} value={typeof item === "string" ? item : item.value}>{ro(item)}</option>)}
                </select>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile: Bottom Sheet Overlay ─────────────── */}
      <div className={`vat-sheet-overlay${sheetOpen ? " open" : ""}`} onClick={() => setSheetOpen(false)} />

      {/* ── Mobile: Bottom Sheet Panel ───────────────── */}
      <div className={`vat-sheet${sheetOpen ? " open" : ""}`}>
        <span className="vat-sheet-handle"></span>
        <div className="vat-sheet-head">
          <h5>Filter Therapists</h5>
          <button className="vat-sheet-close" onClick={() => setSheetOpen(false)}>
            <i className="feather-x"></i>
          </button>
        </div>
        <div className="vat-sheet-body">
          {[
            { label: "Profile Type", name: "profile_type", options: profileTypeOptions, isObj: true },
            { label: "Specialty / Concern", name: "services", options: services, isObj: false },
            { label: "Experience", name: "year_of_exp", options: ExpList, isObj: false },
            { label: "Language", name: "language_spoken", options: languageSpoken, isObj: true },
            { label: "State", name: "state", options: stateList, isObj: true },
          ].map(({ label, name, options, isObj }) => (
            <div key={name}>
              <div className="vat-sheet-label">{label}</div>
              <select
                name={name}
                value={tempFilter[name] || ""}
                onChange={handleTempChange}
                className={`vat-sheet-sel${tempFilter[name] ? " active" : ""}`}
              >
                <option value="">All {label}s</option>
                {options.map((item, i) => {
                  const val = isObj && typeof item === "object" ? item.value : item;
                  return <option key={i} value={val}>{ro(item)}</option>;
                })}
              </select>
            </div>
          ))}
        </div>
        <div className="vat-sheet-footer">
          <button className="vat-sheet-clear" onClick={clearSheet}>Clear All</button>
          <button className="vat-sheet-apply" onClick={applySheet}>
            Show Results
          </button>
        </div>
      </div>

      {/* ── Results ───────────────────────────────────── */}
      <div ref={resultsRef} className="vat-results-wrap">
        <div className="container">
          <div className="vat-results-header">
            <div>
              <div className="vat-results-title">
                {hasFilter ? `${data.length} result${data.length !== 1 ? "s" : ""} found` : "All Therapists"}
              </div>
              <div className="vat-results-count">
                {hasFilter ? "Showing filtered results" : `${allData.length} verified professionals`}
              </div>
            </div>
            {hasFilter && (
              <button className="vat-reset" onClick={resetFilters}>
                <i className="feather-x" style={{ fontSize: 12 }}></i>
                Clear Filters
              </button>
            )}
          </div>

          {loading ? (
            <div className="row g-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="col-lg-4 col-md-6 col-12">
                  <div className="vat-skeleton">
                    <div className="vat-skel-img"></div>
                    <div className="vat-skel-body">
                      <div className="vat-skel-line" style={{ width: "70%" }}></div>
                      <div className="vat-skel-line" style={{ width: "50%" }}></div>
                      <div className="vat-skel-line" style={{ width: "90%", marginTop: 16 }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : data.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <i className="feather-search" style={{ fontSize: 48, color: "#cbd5e1" }}></i>
              <h4 style={{ color: "#94a3b8", marginTop: 16, fontWeight: 700 }}>No therapists found</h4>
              <p style={{ color: "#cbd5e1", fontSize: 14 }}>Try adjusting your filters</p>
              <button className="vat-reset" style={{ margin: "12px auto 0", padding: "8px 20px" }} onClick={resetFilters}>
                Clear Filters
              </button>
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

          {!loading && visibleCount < allData.length && (
            <div style={{ textAlign: "center", marginTop: 44 }}>
              <button className="vat-load-more" onClick={handleLoadMore}>
                Load More Therapists
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile Filter FAB ─────────────────────────── */}
      <button className="vat-filter-fab" onClick={openSheet}>
        <i className="feather-sliders"></i>
        Filters
        {activeFilterCount > 0 && (
          <span className="vat-fab-badge">{activeFilterCount}</span>
        )}
      </button>
    </>
  );
}
