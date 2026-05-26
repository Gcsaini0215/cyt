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
  const resultsRef = React.useRef(null);

  const scrollToResults = () =>
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

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

  const resetFilters = () => {
    setSearch("");
    setFilter({ profile_type: "", services: "", year_of_exp: "", language_spoken: "", state: "", search: "", page: 1, pageSize: 1000 });
  };

  const hasFilter = filter.profile_type || filter.services || filter.year_of_exp || filter.language_spoken || filter.state || filter.search;

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
        .vat-ban-dot { width:7px; height:7px; border-radius:50%; background:#4ade80; }
        .vat-ban-title { color:#fff; font-size:clamp(1.8rem,5vw,3rem); font-weight:900; margin:0 0 10px; line-height:1.15; }
        .vat-ban-title span { color:#86efac; }
        .vat-ban-sub { color:rgba(255,255,255,.75); font-size:clamp(.9rem,2vw,1.05rem); margin:0 auto 28px; max-width:540px; line-height:1.65; font-weight:500; }

        /* search card */
        .vat-search-card { background:#fff; border-radius:20px; padding:22px 24px 18px; max-width:920px; margin:0 auto; box-shadow:0 16px 48px rgba(0,0,0,.25); }
        .vat-search-wrap { position:relative; margin-bottom:16px; }
        .vat-search-input { width:100%; padding:13px 52px 13px 18px; border-radius:12px; border:1.5px solid #e2e8f0; font-size:15px; background:#f8fafc; outline:none; color:#1e293b; transition:border-color .2s; }
        .vat-search-input:focus { border-color:#228756; background:#fff; box-shadow:0 0 0 3px rgba(34,135,86,.08); }
        .vat-search-btn { position:absolute; right:10px; top:50%; transform:translateY(-50%); background:#228756; color:#fff; border:none; width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center; cursor:pointer; }
        .vat-search-btn i { font-size:15px; }

        /* filter grid */
        .vat-filter-grid { display:grid; grid-template-columns:repeat(5,1fr); gap:10px; margin-bottom:14px; }
        .vat-fsel { width:100%; height:40px; border-radius:10px; border:1.5px solid #e8edf2; background:#f8fafc; font-size:13.5px; padding:0 10px; color:#475569; font-weight:600; outline:none; cursor:pointer; transition:border-color .2s; }
        .vat-fsel:focus { border-color:#228756; }

        /* stats strip */
        .vat-stats-strip { display:flex; align-items:center; justify-content:center; gap:0; flex-wrap:wrap; padding-top:4px; }
        .vat-stat-item { display:flex; align-items:center; gap:5px; font-size:12.5px; color:#64748b; font-weight:600; padding:0 14px; }
        .vat-stat-item:not(:last-child) { border-right:1px solid #e2e8f0; }
        .vat-stat-item i { color:#228756; font-size:13px; }

        /* jump button */
        .vat-jump { display:inline-flex; align-items:center; gap:10px; background:rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.22); padding:9px 22px; border-radius:50px; color:#fff; font-weight:600; font-size:14px; cursor:pointer; transition:all .2s; backdrop-filter:blur(8px); margin-top:22px; position:relative; z-index:2; }
        .vat-jump:hover { background:rgba(255,255,255,.22); }
        .vat-jump-count { background:#228756; color:#fff; font-size:13px; font-weight:800; padding:1px 10px; border-radius:20px; }

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

        /* ── Mobile sticky filters ───────────────────── */
        .vat-sticky-mob { display:none; }
        @media(max-width:767px){
          .vat-banner { padding:40px 0 36px; }
          .vat-filter-grid { display:none; }
          .vat-search-card { padding:16px; }
          .vat-search-input { font-size:14px; padding:11px 48px 11px 14px; }
          .vat-stats-strip { display:none; }
          .vat-sticky-mob {
            display:flex;
            position:sticky;
            top:0;
            z-index:200;
            background:#0a2e1c;
            padding:10px 12px;
            gap:8px;
            overflow-x:auto;
            -webkit-overflow-scrolling:touch;
            box-shadow:0 3px 14px rgba(0,0,0,.3);
            scrollbar-width:none;
          }
          .vat-sticky-mob::-webkit-scrollbar { display:none; }
          .vat-sticky-mob select {
            flex-shrink:0;
            background:rgba(255,255,255,.14);
            color:#fff;
            border:1px solid rgba(255,255,255,.22);
            border-radius:9px;
            padding:7px 10px;
            font-size:13px;
            outline:none;
            min-width:120px;
            cursor:pointer;
          }
          .vat-sticky-mob select option { background:#0a2e1c; color:#fff; }
          .vat-results-wrap { padding:30px 0 80px; }
          .vat-results-header { margin-bottom:18px; }
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
              Browse verified mental health professionals across India. Filter by expertise, language, or location to find the right match.
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
                <button className="vat-search-btn">
                  <i className="feather-search"></i>
                </button>
              </div>

              {/* Filter selects — hidden on mobile */}
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

              {/* Stats strip */}
              <div className="vat-stats-strip">
                {[
                  ["feather-users", `${allData.length || "500"}+ Therapists`],
                  ["feather-check-circle", "Verified Profiles"],
                  ["feather-map-pin", "Pan India"],
                  ["feather-globe", "Multiple Languages"],
                ].map(([icon, text]) => (
                  <div className="vat-stat-item" key={text}>
                    <i className={icon}></i>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Scroll to results button */}
            {allData.length > 0 && (
              <button className="vat-jump" onClick={scrollToResults}>
                <span className="vat-jump-count">{allData.length}</span>
                Therapists Available
                <i className="feather-arrow-down"></i>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile sticky filter bar */}
      <div className="vat-sticky-mob">
        <select name="profile_type" value={filter.profile_type} onChange={handleChange}>
          <option value="">Profile Type</option>
          {profileTypeOptions.map((item, i) => <option key={i} value={item.value}>{ro(item)}</option>)}
        </select>
        <select name="services" value={filter.services} onChange={handleChange}>
          <option value="">Specialty</option>
          {services.map((item, i) => <option key={i} value={item}>{ro(item)}</option>)}
        </select>
        <select name="year_of_exp" value={filter.year_of_exp} onChange={handleChange}>
          <option value="">Experience</option>
          {ExpList.map((item, i) => <option key={i} value={item}>{ro(item)}</option>)}
        </select>
        <select name="language_spoken" value={filter.language_spoken} onChange={handleChange}>
          <option value="">Language</option>
          {languageSpoken.map((item, i) => <option key={i} value={typeof item === "string" ? item : item.value}>{ro(item)}</option>)}
        </select>
        <select name="state" value={filter.state} onChange={handleChange}>
          <option value="">State</option>
          {stateList.map((item, i) => <option key={i} value={typeof item === "string" ? item : item.value}>{ro(item)}</option>)}
        </select>
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
                <i className="feather-x" style={{ fontSize:12 }}></i>
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
                      <div className="vat-skel-line" style={{ width:"70%" }}></div>
                      <div className="vat-skel-line" style={{ width:"50%" }}></div>
                      <div className="vat-skel-line" style={{ width:"90%", marginTop:16 }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : data.length === 0 ? (
            <div style={{ textAlign:"center", padding:"60px 0" }}>
              <i className="feather-search" style={{ fontSize:48, color:"#cbd5e1" }}></i>
              <h4 style={{ color:"#94a3b8", marginTop:16, fontWeight:700 }}>No therapists found</h4>
              <p style={{ color:"#cbd5e1", fontSize:14 }}>Try adjusting your filters</p>
              <button className="vat-reset" style={{ margin:"12px auto 0", padding:"8px 20px" }} onClick={resetFilters}>
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
            <div style={{ textAlign:"center", marginTop:44 }}>
              <button className="vat-load-more" onClick={handleLoadMore}>
                Load More Therapists
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
