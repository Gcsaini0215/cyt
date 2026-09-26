import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  GetFavriouteTherapistListUrl,
  getTherapistProfiles,
} from "../../utils/url";
import { fetchById, fetchData } from "../../utils/actions";
import ProfileCardRow from "../home/profile-card-row.js";
import ConsultationConsentModal from "../global/consultation-consent-modal";
import { ExpList, languageSpoken, services, stateList } from "../../utils/static-lists";
import { getDecodedToken } from "../../utils/jwt";
import { filterTherapists } from "../../utils/filterTherapists";

const EMPTY_FILTER = {
  profile_type: "", services: "", year_of_exp: "",
  language_spoken: "", state: "", search: "", page: 1, pageSize: 1000,
};

const FEE_STEP = 100;

const getMinFee = (fees) => {
  if (!fees || !Array.isArray(fees)) return null;
  const allFees = fees
    .filter((f) => f && Array.isArray(f.formats))
    .flatMap((f) => f.formats.filter((fmt) => fmt && typeof fmt.fee === "number").map((fmt) => fmt.fee));
  return allFees.length > 0 ? Math.min(...allFees) : null;
};

export default function ViewAllTherapist({ initialAllData = [], initialFilters = null }) {
  const router = useRouter();
  const [allData, setAllData] = React.useState(initialAllData);
  const [search, setSearch] = React.useState(initialFilters?.search || "");
  const [favrioutes, setFavrioutes] = React.useState([]);
  const timeoutRef = React.useRef(null);
  const [loading, setLoading] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const ITEMS_PER_PAGE = 18;
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [tempFilter, setTempFilter] = React.useState({});
  const [consultOpen, setConsultOpen] = React.useState(false);
  const [feeRange, setFeeRange] = React.useState("");
  const resultsRef = React.useRef(null);
  const isFirstRender = React.useRef(true);
  const hasServerData = React.useRef(initialAllData.length > 0);

  // Auto-open the 15-min consultation modal a few seconds after landing on the page
  React.useEffect(() => {
    const t = setTimeout(() => setConsultOpen(true), 4000);
    return () => clearTimeout(t);
  }, []);

  const [filter, setFilter] = React.useState(initialFilters || EMPTY_FILTER);

  // Read URL query params on first load and set filters
  React.useEffect(() => {
    if (!router.isReady) return;
    const q = router.query;
    const fromUrl = {
      profile_type: q.profile_type || "",
      services: q.services || "",
      year_of_exp: q.year_of_exp || "",
      language_spoken: q.language_spoken || "",
      state: q.state || "",
      search: q.search || "",
      page: 1,
      pageSize: 1000,
    };
    if (q.search) setSearch(q.search);
    setFilter(fromUrl);
  }, [router.isReady]);

  // Sync filter changes back to URL (skip first render to avoid double-set)
  React.useEffect(() => {
    if (!router.isReady) return;
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    const params = {};
    if (filter.profile_type) params.profile_type = filter.profile_type;
    if (filter.services) params.services = filter.services;
    if (filter.year_of_exp) params.year_of_exp = filter.year_of_exp;
    if (filter.language_spoken) params.language_spoken = filter.language_spoken;
    if (filter.state) params.state = filter.state;
    if (filter.search) params.search = filter.search;
    router.replace({ pathname: router.pathname, query: params }, undefined, { shallow: true });
  }, [filter.profile_type, filter.services, filter.year_of_exp, filter.language_spoken, filter.state, filter.search]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setFilter(f => ({ ...f, search: value.trim().length >= 2 ? value.trim() : "" }));
    }, 300);
  };

  const applySearch = (value) => {
    clearTimeout(timeoutRef.current);
    const q = (value ?? search).trim();
    setSearch(q);
    setFilter(f => ({ ...f, search: q }));
    setCurrentPage(1);
    if (resultsRef.current) resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const clearSearch = () => {
    clearTimeout(timeoutRef.current);
    setSearch("");
    setFilter(f => ({ ...f, search: "" }));
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
    setCurrentPage(1);
    setFeeRange("");
    setFilter({ profile_type: "", services: "", year_of_exp: "", language_spoken: "", state: "", search: "", page: 1, pageSize: 1000 });
  };

  const hasFilter = filter.profile_type || filter.services || filter.year_of_exp || filter.language_spoken || filter.state || filter.search || feeRange;
  const activeFilterCount = [filter.profile_type, filter.services, filter.year_of_exp, filter.language_spoken, filter.state].filter(Boolean).length;

  React.useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const res = await fetchData(getTherapistProfiles, filter);
        if (res?.data) {
          setAllData(res.data || []);
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

    // Server already fetched the initial (unfiltered-by-search) dataset for
    // this URL — skip the redundant duplicate call and avoid a loading flash.
    if (!hasServerData.current) getData();
    const tokenData = getDecodedToken();
    if (tokenData && tokenData.role !== 1) getFavrioutes();
  }, []);

  // states with the most therapists — shown as one-tap chips under the search box
  const popularStates = React.useMemo(() => {
    const counts = {};
    allData.forEach(t => {
      const st = (t.state || "").trim();
      if (st) counts[st] = (counts[st] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([st]) => st);
  }, [allData]);

  const profileTypeOptions = React.useMemo(() => {
    const types = allData.map(i => i.profile_type).filter(Boolean);
    return [...new Set(types)].map(t => ({ label: t, value: t }));
  }, [allData]);

  // Computed synchronously (not in an effect) so the server-rendered HTML
  // already contains the correctly filtered/paginated list for crawlers —
  // an effect wouldn't run during SSR and would leave the initial markup empty.
  const feeBounds = React.useMemo(() => {
    const fees = allData.map((t) => getMinFee(t.fees)).filter((f) => f !== null && f > 0);
    if (!fees.length) return null;
    const min = Math.floor(Math.min(...fees) / FEE_STEP) * FEE_STEP;
    const max = Math.ceil(Math.max(...fees) / FEE_STEP) * FEE_STEP;
    return max > min ? { min, max } : null;
  }, [allData]);
  const [feeLo, feeHi] = React.useMemo(() => {
    if (!feeBounds) return [0, 0];
    if (!feeRange) return [feeBounds.min, feeBounds.max];
    const [a, b] = feeRange.split("-").map(Number);
    return [Math.max(feeBounds.min, a), Math.min(feeBounds.max, b)];
  }, [feeRange, feeBounds]);
  const setFees = (lo, hi) => {
    if (!feeBounds) return;
    setCurrentPage(1);
    setFeeRange(lo <= feeBounds.min && hi >= feeBounds.max ? "" : `${lo}-${hi}`);
  };
  const feePct = (v) => (feeBounds ? ((v - feeBounds.min) / (feeBounds.max - feeBounds.min)) * 100 : 0);

  const filteredData = React.useMemo(() => {
    const base = filterTherapists(allData, filter);
    if (!feeRange) return base;
    const [minStr, maxStr] = feeRange.split("-");
    const min = Number(minStr);
    const max = maxStr === "Infinity" ? Infinity : Number(maxStr);
    return base.filter((t) => {
      const fee = getMinFee(t.fees);
      return fee !== null && fee >= min && fee <= max;
    });
  }, [allData, filter, feeRange]);
  const data = React.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  // Reset to page 1 whenever the filter (or the underlying dataset) changes.
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filter, allData]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const goToPage = (page) => {
    setCurrentPage(page);
    if (resultsRef.current) resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const getPageNumbers = () => {
    const pages = [];
    const delta = 2;
    const left = Math.max(1, currentPage - delta);
    const right = Math.min(totalPages, currentPage + delta);
    for (let i = left; i <= right; i++) pages.push(i);
    if (left > 1) { pages.unshift("..."); pages.unshift(1); }
    if (right < totalPages) { pages.push("..."); pages.push(totalPages); }
    return pages;
  };

  const ro = (item) => typeof item === "string" ? item : item.label || item.value;

  return (
    <>
      {/* dangerouslySetInnerHTML, not a string child: React escapes quotes
          in <style> text children but browsers don't un-escape them, so a
          string child hydration-mismatches and silently breaks any rule
          with a quote in it (the banner's url('...') included) — that's
          what suppressHydrationWarning was papering over. */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* ── Banner ──────────────────────────────────── */
        .vat-banner { position: relative; overflow: hidden; padding: 72px 0 64px; background: #111; }
        /* the photo's speaker sits on the left — mirror it so she faces the copy from the right */
        .vat-ban-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 30% 30%; transform: scaleX(-1); }
        .vat-banner::before {
          content: ''; position: absolute; inset: 0; z-index: 1;
          background: linear-gradient(90deg, rgba(0,0,0,.82) 0%, rgba(0,0,0,.62) 40%, rgba(0,0,0,.22) 72%, rgba(0,0,0,.08) 100%);
        }
        .vat-ban-inner { position: relative; z-index: 2; text-align: left; }
        /* desktop: the banner runs 200px up behind the header (navbar.js) — start the photo below it so faces aren't hidden */
        @media (min-width: 992px) { .vat-ban-img { top: 200px; height: calc(100% - 200px); } }
        .vat-ban-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 11px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase;
          color: #f0cf6e; margin-bottom: 12px;
        }
        .vat-ban-eyebrow::before { content: ''; width: 22px; height: 2px; background: #d4af37; display: inline-block; }
        .vat-ban-title { color: #fff; font-size: clamp(20px, 5.2vw, 46px); font-weight: 800; margin: 0 0 10px; line-height: 1.15; letter-spacing: -.3px; white-space: nowrap; }
        .vat-ban-sub { color: rgba(255,255,255,.9); font-size: clamp(15px, 1.4vw, 17px); margin: 0 0 22px; max-width: 540px; line-height: 1.6; font-weight: 500; padding: 0; }
        .vat-sr { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }

        .vat-ban-search {
          position: relative; display: flex; align-items: center; max-width: 620px;
          background: #fff; border-radius: 14px; padding: 6px; box-shadow: 0 18px 40px -16px rgba(0,0,0,.55);
        }
        .vat-ban-search-icon { position: absolute; left: 20px; font-size: 18px; color: #64748b; pointer-events: none; }
        .vat-ban-search input {
          flex: 1; min-width: 0; height: 48px; border: none; outline: none; background: transparent;
          padding: 0 40px 0 44px; font-size: 15.5px; color: #0f172a;
        }
        .vat-ban-search input::-webkit-search-cancel-button { display: none; }
        .vat-ban-search:focus-within { box-shadow: 0 0 0 3px rgba(240,207,110,.55), 0 18px 40px -16px rgba(0,0,0,.55); }
        .vat-ban-clear {
          position: absolute; right: 124px; width: 30px; height: 30px; border-radius: 50%; border: none;
          background: #f1f5f9; color: #64748b; display: flex; align-items: center; justify-content: center; cursor: pointer;
        }
        .vat-ban-go {
          flex-shrink: 0; height: 48px; padding: 0 26px; border: none; border-radius: 10px;
          background: linear-gradient(135deg, #1a6b3a, #0f3d24); color: #fff; font-size: 15px; font-weight: 800; cursor: pointer;
        }
        .vat-ban-go:hover { filter: brightness(1.12); }
        .vat-ban-chips { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-top: 16px; max-width: 700px; }
        .vat-ban-chips > span { font-size: 12.5px; font-weight: 700; color: rgba(255,255,255,.75); margin-right: 2px; }
        .vat-ban-chips button {
          display: inline-flex; align-items: center; gap: 5px; padding: 6px 12px; border-radius: 999px;
          border: 1px solid rgba(255,255,255,.35); background: rgba(255,255,255,.12); color: #fff;
          font-size: 12.5px; font-weight: 600; cursor: pointer; backdrop-filter: blur(4px); transition: background .15s;
        }
        .vat-ban-chips button:hover, .vat-ban-chips button.on { background: #fff; color: #0f3d24; }
        .vat-ban-chips button i { font-size: 12px; }
        @media (max-width: 767px) {
          .vat-banner { padding: 40px 0 36px; }
          .vat-ban-img { object-position: 70% 10%; }
          .vat-banner::before { background: linear-gradient(180deg, rgba(0,0,0,.66) 0%, rgba(0,0,0,.78) 100%); }
          .vat-ban-search { padding: 5px; border-radius: 12px; }
          .vat-ban-search input { height: 46px; font-size: 15px; padding-right: 36px; }
          .vat-ban-go { height: 46px; padding: 0 16px; font-size: 14px; }
          .vat-ban-clear { right: 92px; }
          .vat-ban-chips { display: none; }
        }

        /* ── Sticky filter bar (overlaps banner bottom) ─ */
        .vat-sticky-bar {
          position: sticky;
          top: 0;
          z-index: 200;
          margin-top: -46px;
          padding: 0 0 16px;
        }
        .vat-filter-card {
          background: #fff;
          border: 1px solid #dbe3df;
          border-radius: 8px;
          box-shadow: 0 8px 28px rgba(15,61,36,.14);
          padding: 14px 18px;
        }
        .vat-filter-inner {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .vat-search-wrap { position:relative; flex:1; min-width:0; }
        .vat-search-input {
          width:100%; padding:10px 42px 10px 16px;
          border-radius:4px; border:1.5px solid #cbd5c9;
          font-size:14px; background:#f8faf9; outline:none;
          color:#1e293b; transition:border-color .2s; box-sizing:border-box;
        }
        .vat-search-input:focus { border-color:#166534; background:#fff; box-shadow:0 0 0 3px rgba(22,101,52,.08); }
        .vat-search-btn {
          position:absolute; right:8px; top:50%; transform:translateY(-50%);
          background:#166534; color:#fff; border:none;
          width:30px; height:30px; border-radius:4px;
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; flex-shrink:0;
        }
        .vat-search-btn i { font-size:13px; }
        .vat-fsel {
          height:40px; border-radius:4px; border:1.5px solid #cbd5c9;
          background:#f8faf9; font-size:13px; padding:0 10px;
          color:#475569; font-weight:600; outline:none; cursor:pointer;
          transition:border-color .2s; white-space:nowrap;
        }
        .vat-fsel:focus { border-color:#166534; }
        .vat-fsel.active { border-color:#166534; background:#f0fdf4; color:#166534; }
        .vat-reset-btn {
          display:inline-flex; align-items:center; gap:4px;
          font-size:12px; font-weight:700; color:#ef4444;
          border:1px solid #fecaca; background:#fff5f5;
          padding:0 12px; height:40px; border-radius:4px;
          cursor:pointer; white-space:nowrap; flex-shrink:0;
        }

        /* ── Results ─────────────────────────────────── */
        .vat-list { display: flex; flex-direction: column; gap: 14px; }
        /* Footer.js forces <body> dark green site-wide; this section had no
           background of its own, so the therapist cards floated on that
           dark green instead of a page background. */
        .vat-results-wrap { padding:44px 0 60px; background:#fff; }
        .vat-results-header { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:28px; flex-wrap:wrap; gap:10px; padding-bottom:18px; border-bottom:1px solid #eef2f0; }
        .vat-results-title { font-size:26px; font-weight:800; color:#0f3d24; letter-spacing:-0.3px; position:relative; padding-left:18px; line-height:1.2; }
        .vat-results-title::before { content:''; position:absolute; left:0; top:3px; bottom:3px; width:4px; border-radius:2px; background:linear-gradient(180deg,#d4af37,#b8912a); }
        .vat-results-count { font-size:13.5px; color:#64748b; font-weight:600; margin-top:6px; padding-left:18px; }
        .vat-header-right { display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
        .vat-fee-range { width: 280px; }
        .vat-fee-head { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; margin-bottom: 6px; }
        .vat-fee-head span { font-size: 13px; font-weight: 700; color: #0f3d24; }
        .vat-fee-head b { font-size: 13.5px; font-weight: 800; color: #166534; }
        .vat-fee-track { position: relative; height: 24px; }
        .vat-fee-track::before { content: ''; position: absolute; left: 0; right: 0; top: 50%; height: 5px; margin-top: -2.5px; border-radius: 999px; background: #e2e8f0; }
        .vat-fee-fill { position: absolute; top: 50%; height: 5px; margin-top: -2.5px; border-radius: 999px; background: linear-gradient(90deg, #22a35a, #166534); }
        .vat-fee-track input[type=range] {
          position: absolute; inset: 0; width: 100%; height: 24px; margin: 0; background: none; pointer-events: none;
          -webkit-appearance: none; appearance: none; outline: none;
        }
        .vat-fee-track input[type=range]::-webkit-slider-runnable-track { background: none; border: none; }
        .vat-fee-track input[type=range]::-moz-range-track { background: none; border: none; }
        .vat-fee-track input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none; pointer-events: auto; cursor: grab;
          width: 22px; height: 22px; border-radius: 50%; background: #fff; border: 3px solid #166534;
          box-shadow: 0 2px 8px rgba(15,61,36,.3); margin-top: 0;
        }
        .vat-fee-track input[type=range]::-moz-range-thumb {
          pointer-events: auto; cursor: grab; width: 16px; height: 16px; border-radius: 50%;
          background: #fff; border: 3px solid #166534; box-shadow: 0 2px 8px rgba(15,61,36,.3);
        }
        .vat-fee-track input[type=range]:active::-webkit-slider-thumb { cursor: grabbing; transform: scale(1.1); }
        .vat-fee-track input[type=range]:focus-visible::-webkit-slider-thumb { box-shadow: 0 0 0 4px rgba(22,101,52,.25); }
        @media (max-width: 575px) { .vat-fee-range { width: 100%; } .vat-header-right { width: 100%; } }
        .vat-reset { display:inline-flex; align-items:center; gap:5px; font-size:12px; font-weight:700; color:#ef4444; border:1px solid #fecaca; background:#fff5f5; padding:4px 12px; border-radius:4px; cursor:pointer; }

        /* loading skeleton */
        .vat-skeleton { border-radius:6px; background:#f8faf9; overflow:hidden; border:1px solid #eef2f0; }
        .vat-skel-img { height:220px; background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%); background-size:200%; animation:vat-shimmer 1.4s infinite; }
        .vat-skel-body { padding:16px; }
        .vat-skel-line { height:14px; border-radius:4px; background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%); background-size:200%; animation:vat-shimmer 1.4s infinite; margin-bottom:10px; }
        @keyframes vat-shimmer { 0%{background-position:200%} 100%{background-position:-200%} }

        /* active filter chips */
        .vat-chip {
          display: inline-flex; align-items: center; gap: 6px;
          background: #eef5f1; border: 1.5px solid #cfe4d7;
          color: #166534; font-size: 12px; font-weight: 700;
          padding: 4px 10px 4px 12px; border-radius: 4px;
        }
        .vat-chip-x {
          background: none; border: none; padding: 0; cursor: pointer;
          color: #16a34a; display: flex; align-items: center;
          line-height: 1;
        }
        .vat-chip-x i { font-size: 11px; }

        /* pagination */
        .vat-pagination { display:flex; align-items:center; justify-content:center; gap:6px; margin-top:44px; flex-wrap:wrap; }
        .vat-page-btn {
          min-width:38px; height:38px; border-radius:4px; border:1.5px solid #cbd5c9;
          background:#fff; color:#475569; font-size:14px; font-weight:700;
          cursor:pointer; display:inline-flex; align-items:center; justify-content:center;
          transition:all .18s; padding:0 6px;
        }
        .vat-page-btn:hover:not(:disabled):not(.ellipsis) { border-color:#166534; color:#166534; background:#f0fdf4; }
        .vat-page-btn.active { background:#166534; border-color:#166534; color:#fff; box-shadow:0 4px 12px rgba(22,101,52,.25); }
        .vat-page-btn:disabled { opacity:.4; cursor:not-allowed; }
        .vat-page-btn.ellipsis { border:none; background:transparent; cursor:default; }
        .vat-page-info { font-size:13px; color:#94a3b8; font-weight:600; text-align:center; margin-top:12px; }

        /* ── Desktop filter selects ──────────────────── */
        .vat-desk-filters { display:flex; align-items:center; gap:8px; }

        /* ── Mobile overrides ────────────────────────── */
        .vat-filter-fab { display:none; }
        .vat-sheet-overlay { display:none; }
        .vat-sheet { display:none; }

        @media(max-width:991px){
          .vat-sticky-bar { margin-top:-44px; padding:0 0 12px; }
          .vat-filter-card { padding:10px 14px; border-radius:14px; }
          .vat-desk-filters { display:none; }
          .vat-search-input { font-size:14px; }
          .vat-results-wrap { padding:24px 0 100px; }
          .vat-results-header { margin-bottom:14px; }

          .vat-filter-fab {
            display:flex; align-items:center; gap:8px;
            position:fixed; bottom:20px; left:50%; transform:translateX(-50%);
            z-index:300;
            background:linear-gradient(135deg,#0f3d24,#175c37); color:#fff;
            border:1px solid #d4af37; padding:12px 24px; border-radius:6px;
            font-size:14px; font-weight:700;
            box-shadow:0 6px 20px rgba(15,61,36,.4);
            cursor:pointer; white-space:nowrap;
          }
          .vat-filter-fab:active { transform:translateX(-50%) scale(.96); }
          .vat-fab-badge {
            background:#d4af37; color:#0f3d24; font-size:11px; font-weight:800;
            width:18px; height:18px; border-radius:4px;
            display:inline-flex; align-items:center; justify-content:center;
          }

          .vat-sheet-overlay {
            display:block; position:fixed; inset:0; z-index:400;
            background:rgba(15,35,26,.5); backdrop-filter:blur(4px);
            opacity:0; pointer-events:none; transition:opacity .25s;
          }
          .vat-sheet-overlay.open { opacity:1; pointer-events:all; }

          .vat-sheet {
            display:block; position:fixed; bottom:0; left:0; right:0;
            z-index:500; background:#fff; border-radius:12px 12px 0 0;
            border-top:3px solid #d4af37;
            padding:0 0 env(safe-area-inset-bottom,0);
            transform:translateY(100%);
            transition:transform .3s cubic-bezier(.4,0,.2,1);
            max-height:85vh; overflow-y:auto;
          }
          .vat-sheet.open { transform:translateY(0); }
          .vat-sheet-handle { width:40px; height:4px; border-radius:2px; background:#dbe3df; margin:12px auto 0; display:block; }
          .vat-sheet-head { display:flex; align-items:center; justify-content:space-between; padding:16px 20px 12px; border-bottom:1px solid #eef2f0; }
          .vat-sheet-head h5 { margin:0; font-size:15px; font-weight:800; color:#132a1c; }
          .vat-sheet-close { width:30px; height:30px; border-radius:6px; border:none; background:#f1f5f9; color:#64748b; display:flex; align-items:center; justify-content:center; cursor:pointer; }
          .vat-sheet-body { padding:16px 20px; display:flex; flex-direction:column; gap:12px; }
          .vat-sheet-label { font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:.6px; margin-bottom:4px; }
          .vat-sheet-sel { width:100%; height:46px; border-radius:4px; border:1.5px solid #cbd5c9; background:#f8faf9; font-size:14px; padding:0 14px; color:#1e293b; font-weight:600; outline:none; cursor:pointer; }
          .vat-sheet-sel:focus { border-color:#166534; }
          .vat-sheet-sel.active { border-color:#166534; background:#f0fdf4; color:#166534; }
          .vat-sheet-footer { display:flex; gap:10px; padding:14px 20px 20px; border-top:1px solid #eef2f0; }
          .vat-sheet-clear { flex:1; height:46px; border-radius:4px; border:1.5px solid #cbd5c9; background:#fff; color:#64748b; font-size:14px; font-weight:700; cursor:pointer; }
          .vat-sheet-apply { flex:2; height:46px; border-radius:4px; border:none; background:linear-gradient(135deg,#0f3d24,#175c37); color:#fff; font-size:14px; font-weight:800; cursor:pointer; box-shadow:0 4px 12px rgba(15,61,36,.3); }
        }

        @media(min-width:768px) and (max-width:1100px){
          .vat-fsel { font-size:12px; padding:0 7px; }
        }
      ` }} />

      {/* ── Banner: photo + search by name / state / city ── */}
      <section className="vat-banner" aria-labelledby="vat-ban-title">
        <img
          className="vat-ban-img"
          src="/assets/img/therapist-directory-banner.jpg"
          alt="A client talking openly with a therapist in a calm, bright room"
          width="1920"
          height="900"
          fetchPriority="high"
          decoding="async"
        />
        <div className="container vat-ban-inner">
          <span className="vat-ban-eyebrow">Verified therapists across India</span>
          <h2 id="vat-ban-title" className="vat-ban-title">Find the right <span className="theme-gradient">therapist</span> for you</h2>
          <p className="vat-ban-sub">Search by therapist name, state or city — online and in-person sessions.</p>

          <form className="vat-ban-search" role="search" onSubmit={(e) => { e.preventDefault(); applySearch(); }}>
            <i className="feather-search vat-ban-search-icon" aria-hidden="true" />
            <label htmlFor="vat-search" className="vat-sr">Search therapists by name, state or city</label>
            <input
              id="vat-search"
              type="search"
              list="vat-search-states"
              autoComplete="off"
              placeholder="Name, state or city…"
              value={search}
              onChange={handleSearchChange}
            />
            {search && (
              <button type="button" className="vat-ban-clear" onClick={clearSearch} aria-label="Clear search">
                <i className="feather-x" />
              </button>
            )}
            <button type="submit" className="vat-ban-go">Search</button>
            <datalist id="vat-search-states">
              {popularStates.map(st => <option key={st} value={st} />)}
            </datalist>
          </form>

          {popularStates.length > 0 && (
            <div className="vat-ban-chips" aria-label="Popular locations">
              <span>Popular:</span>
              {popularStates.slice(0, 5).map(st => (
                <button key={st} type="button" className={filter.search === st ? "on" : ""} onClick={() => applySearch(st)}>
                  <i className="feather-map-pin" aria-hidden="true" /> {st}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <ConsultationConsentModal open={consultOpen} onClose={() => setConsultOpen(false)} />

      {/* ── Results ───────────────────────────────────── */}
      <div ref={resultsRef} className="vat-results-wrap">
        <div className="container">
          <div className="vat-results-header">
            <div>
              <div className="vat-results-title">
                {hasFilter ? `${filteredData.length} therapist${filteredData.length !== 1 ? "s" : ""} found` : "All Therapists"}
              </div>
              <div className="vat-results-count">
                {hasFilter ? "Filtered results" : `${allData.length} verified professionals`}
                {totalPages > 1 && ` · Page ${currentPage} of ${totalPages}`}
              </div>
            </div>
            <div className="vat-header-right">
              {feeBounds && (
                <div className="vat-fee-range" role="group" aria-label="Fees per session">
                  <div className="vat-fee-head">
                    <span>Fees</span>
                    <b>₹{feeLo.toLocaleString("en-IN")} – ₹{feeHi.toLocaleString("en-IN")}{feeHi >= feeBounds.max ? "+" : ""}</b>
                  </div>
                  <div className="vat-fee-track">
                    <div className="vat-fee-fill" style={{ left: `${feePct(feeLo)}%`, right: `${100 - feePct(feeHi)}%` }} />
                    <input
                      type="range" min={feeBounds.min} max={feeBounds.max} step={FEE_STEP} value={feeLo}
                      aria-label="Minimum fee" aria-valuetext={`₹${feeLo}`}
                      onChange={(e) => setFees(Math.min(Number(e.target.value), feeHi - FEE_STEP), feeHi)}
                    />
                    <input
                      type="range" min={feeBounds.min} max={feeBounds.max} step={FEE_STEP} value={feeHi}
                      aria-label="Maximum fee" aria-valuetext={`₹${feeHi}`}
                      onChange={(e) => setFees(feeLo, Math.max(Number(e.target.value), feeLo + FEE_STEP))}
                    />
                  </div>
                </div>
              )}
              {hasFilter && (
                <button className="vat-reset" onClick={resetFilters}>
                  <i className="feather-x" style={{ fontSize: 12 }}></i>
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Active filter chips */}
          {hasFilter && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
              {filter.profile_type && (
                <span className="vat-chip">
                  {filter.profile_type}
                  <button onClick={() => setFilter(f => ({ ...f, profile_type: "" }))} className="vat-chip-x"><i className="feather-x" /></button>
                </span>
              )}
              {filter.services && (
                <span className="vat-chip">
                  {filter.services}
                  <button onClick={() => setFilter(f => ({ ...f, services: "" }))} className="vat-chip-x"><i className="feather-x" /></button>
                </span>
              )}
              {filter.year_of_exp && (
                <span className="vat-chip">
                  {filter.year_of_exp}
                  <button onClick={() => setFilter(f => ({ ...f, year_of_exp: "" }))} className="vat-chip-x"><i className="feather-x" /></button>
                </span>
              )}
              {filter.language_spoken && (
                <span className="vat-chip">
                  {filter.language_spoken}
                  <button onClick={() => setFilter(f => ({ ...f, language_spoken: "" }))} className="vat-chip-x"><i className="feather-x" /></button>
                </span>
              )}
              {filter.state && (
                <span className="vat-chip">
                  {filter.state}
                  <button onClick={() => setFilter(f => ({ ...f, state: "" }))} className="vat-chip-x"><i className="feather-x" /></button>
                </span>
              )}
              {filter.search && (
                <span className="vat-chip">
                  &ldquo;{filter.search}&rdquo;
                  <button onClick={() => { setSearch(""); setFilter(f => ({ ...f, search: "" })); }} className="vat-chip-x"><i className="feather-x" /></button>
                </span>
              )}
            </div>
          )}

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
            <div className="vat-list">
              {data.map(item => (
                <ProfileCardRow key={item._id} data={item} favrioutes={favrioutes} />
              ))}
            </div>
          )}

          {!loading && totalPages > 1 && (
            <div>
              <div className="vat-pagination">
                <button
                  className="vat-page-btn"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <i className="feather-chevron-left" style={{ fontSize: 16 }} />
                </button>

                {getPageNumbers().map((p, i) => (
                  <button
                    key={i}
                    className={`vat-page-btn${p === currentPage ? " active" : ""}${p === "..." ? " ellipsis" : ""}`}
                    onClick={() => p !== "..." && goToPage(p)}
                    disabled={p === "..."}
                  >
                    {p}
                  </button>
                ))}

                <button
                  className="vat-page-btn"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <i className="feather-chevron-right" style={{ fontSize: 16 }} />
                </button>
              </div>
              <div className="vat-page-info">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)} of {filteredData.length} therapists
              </div>
            </div>
          )}
        </div>
      </div>

    </>
  );
}
