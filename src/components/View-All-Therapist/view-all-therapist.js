import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  GetFavriouteTherapistListUrl,
  getTherapistProfiles,
} from "../../utils/url";
import { fetchById, fetchData } from "../../utils/actions";
import ProfileCardRow, { CARD_CSS } from "../home/profile-card-row.js";
import ConsultationConsentModal from "../global/consultation-consent-modal";
import { ExpList, services } from "../../utils/static-lists";
import { getDecodedToken } from "../../utils/jwt";
import { filterTherapists } from "../../utils/filterTherapists";
import {
  split, getMinFee, sortTherapists, SORTS, CONCERNS, MODES, PLACE_LINKS, feeBand, directoryFaqs,
} from "../../utils/therapist-directory";
import { CONCERN_PAGES, concernPath } from "../../utils/concerns";

const EMPTY_FILTER = {
  profile_type: "", services: "", year_of_exp: "", language_spoken: "", state: "", search: "",
  concern: "", mode: "", gender: "", page: 1, pageSize: 1000,
};
const FILTER_KEYS = ["profile_type", "services", "year_of_exp", "language_spoken", "state", "search", "concern", "mode", "gender"];
const PAGE_SIZE = 18;
const FEE_STEP = 100;

const concernLabel = (v) => CONCERNS.find((c) => c.value === v)?.label || v;

// count values of a comma-list field across therapists, most common first
const countValues = (list, get) => {
  const m = {};
  list.forEach((t) => split(get(t)).forEach((v) => { m[v] = (m[v] || 0) + 1; }));
  return Object.entries(m).sort((a, b) => b[1] - a[1]).map(([v]) => v);
};

// Visible page heading: says what the visitor is looking at once a filter is set.
const headingFor = (f) => {
  const who = f.profile_type ? `${f.profile_type}s` : "Therapists";
  if (f.concern && f.state) return `${who} for ${concernLabel(f.concern)} in ${f.state}`;
  if (f.concern) return `${who} for ${concernLabel(f.concern)}`;
  if (f.state) return `${who} in ${f.state}`;
  if (f.profile_type) return `${who} in India`;
  return null;
};

export default function ViewAllTherapist({ initialAllData = [], initialFilters = null }) {
  const router = useRouter();
  const [allData, setAllData] = React.useState(initialAllData);
  const [filter, setFilter] = React.useState({ ...EMPTY_FILTER, ...(initialFilters || {}) });
  const [search, setSearch] = React.useState(initialFilters?.search || "");
  const [sort, setSort] = React.useState(initialFilters?.sort || "");
  const [feeRange, setFeeRange] = React.useState(initialFilters?.fee || "");
  const [visible, setVisible] = React.useState(PAGE_SIZE);
  const [favrioutes, setFavrioutes] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [now, setNow] = React.useState(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [helperOpen, setHelperOpen] = React.useState(false);
  const [consultOpen, setConsultOpen] = React.useState(false);
  const timeoutRef = React.useRef(null);
  const resultsRef = React.useRef(null);
  const barRef = React.useRef(null);
  const isFirstRender = React.useRef(true);
  const hasServerData = React.useRef(initialAllData.length > 0);

  // "Available today" etc. depend on the clock — only computed after mount so the
  // server HTML and the first client render match.
  React.useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 5 * 60000);
    return () => clearInterval(t);
  }, []);

  // Read URL query params on first load
  React.useEffect(() => {
    if (!router.isReady) return;
    const q = router.query;
    const fromUrl = { ...EMPTY_FILTER };
    FILTER_KEYS.forEach((k) => { if (typeof q[k] === "string") fromUrl[k] = q[k]; });
    setSearch(fromUrl.search);
    setFilter(fromUrl);
    setSort(typeof q.sort === "string" ? q.sort : "");
    if (q.help === "1") setHelperOpen(true);
    setFeeRange(typeof q.fee === "string" ? q.fee : "");
  }, [router.isReady]);

  // Sync filters / sort / fees back to the URL (shareable, back-button friendly)
  React.useEffect(() => {
    if (!router.isReady) return;
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    const params = {};
    FILTER_KEYS.forEach((k) => { if (filter[k]) params[k] = filter[k]; });
    if (sort) params.sort = sort;
    if (feeRange) params.fee = feeRange;
    router.replace({ pathname: router.pathname, query: params }, undefined, { shallow: true, scroll: false });
  }, [...FILTER_KEYS.map((k) => filter[k]), sort, feeRange]);

  // Back to the first page of results whenever what's shown changes
  React.useEffect(() => { setVisible(PAGE_SIZE); }, [filter, sort, feeRange, allData]);

  React.useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const res = await fetchData(getTherapistProfiles, { page: 1, pageSize: 1000 });
        if (res?.data) setAllData(res.data || []);
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
    // the server already sent the full list for this URL — no duplicate fetch
    if (!hasServerData.current) getData();
    const tokenData = getDecodedToken();
    if (tokenData && tokenData.role !== 1) getFavrioutes();
  }, []);

  // The filter bar sticks right under the site header, whose height changes once it
  // pins itself on scroll — measure it instead of hard-coding.
  React.useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      let bottom = 0;
      document.querySelectorAll(".top-strip, .rbt-header, .rbt-header-wrapper").forEach((el) => {
        const pos = getComputedStyle(el).position;
        if (pos !== "fixed" && pos !== "sticky") return;
        const r = el.getBoundingClientRect();
        if (r.height && r.top <= bottom + 1 && r.bottom > bottom) bottom = r.bottom;
      });
      barRef.current?.style.setProperty("--vat-top", `${Math.max(0, Math.round(bottom))}px`);
    };
    // the header switches to its slimmer pinned style just after the scroll — measure again then
    let late = 0;
    const on = () => {
      if (!raf) raf = requestAnimationFrame(measure);
      clearTimeout(late);
      late = setTimeout(measure, 300);
    };
    measure();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); cancelAnimationFrame(raf); clearTimeout(late); };
  }, []);

  // modals: Escape closes, page behind doesn't scroll
  const anyModal = sheetOpen || helperOpen;
  React.useEffect(() => {
    if (!anyModal) return;
    const onKey = (e) => { if (e.key === "Escape") { setSheetOpen(false); setHelperOpen(false); } };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [anyModal]);

  const scrollToResults = () => {
    if (!resultsRef.current) return;
    const top = resultsRef.current.getBoundingClientRect().top + window.scrollY - 140;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setFilter((f) => ({ ...f, search: value.trim().length >= 2 ? value.trim() : "" }));
    }, 300);
  };
  const applySearch = (value) => {
    clearTimeout(timeoutRef.current);
    const q = (value ?? search).trim();
    setSearch(q);
    setFilter((f) => ({ ...f, search: q }));
    scrollToResults();
  };
  const clearSearch = () => {
    clearTimeout(timeoutRef.current);
    setSearch("");
    setFilter((f) => ({ ...f, search: "" }));
  };
  const setField = (name, value) => setFilter((f) => ({ ...f, [name]: value }));
  const onSelect = (e) => setField(e.target.name, e.target.value);

  const resetFilters = () => {
    setSearch("");
    setFeeRange("");
    setSort("");
    setFilter(EMPTY_FILTER);
  };

  // ── options, built from the therapists actually listed ──
  const popularStates = React.useMemo(() => countValues(allData, (t) => (t.state || "").trim()), [allData]);
  const typeOptions = React.useMemo(() => countValues(allData, (t) => t.profile_type), [allData]);
  const langOptions = React.useMemo(() => countValues(allData, (t) => t.language_spoken), [allData]);
  const expOptions = React.useMemo(() => {
    const have = new Set(allData.map((t) => (t.year_of_exp || "").trim()));
    return ExpList.filter((e) => e !== "Select" && have.has(e));
  }, [allData]);
  const concernOptions = React.useMemo(() => {
    const all = countValues(allData, (t) => t.experties);
    const common = CONCERNS.filter((c) => all.includes(c.value));
    const rest = all.filter((v) => !common.some((c) => c.value === v)).sort((a, b) => a.localeCompare(b));
    return { common, rest };
  }, [allData]);
  const hasGender = React.useMemo(() => new Set(allData.map((t) => (t.user?.gender || "").toLowerCase()).filter(Boolean)).size > 1, [allData]);

  // ── fees slider ──
  const feeBounds = React.useMemo(() => {
    const fees = allData.map((t) => getMinFee(t.fees)).filter(Boolean);
    if (!fees.length) return null;
    const min = Math.floor(Math.min(...fees) / FEE_STEP) * FEE_STEP;
    const max = Math.ceil(Math.max(...fees) / FEE_STEP) * FEE_STEP;
    return max > min ? { min, max } : null;
  }, [allData]);
  const [feeLo, feeHi] = React.useMemo(() => {
    if (!feeBounds) return [0, 0];
    if (!feeRange) return [feeBounds.min, feeBounds.max];
    const [a, b] = feeRange.split("-").map(Number);
    return [Math.max(feeBounds.min, a || 0), Math.min(feeBounds.max, b || feeBounds.max)];
  }, [feeRange, feeBounds]);
  const setFees = (lo, hi) => {
    if (!feeBounds) return;
    setFeeRange(lo <= feeBounds.min && hi >= feeBounds.max ? "" : `${lo}-${hi}`);
  };
  const feePct = (v) => (feeBounds ? ((v - feeBounds.min) / (feeBounds.max - feeBounds.min)) * 100 : 0);

  // Computed during render (not in an effect) so the server HTML already holds the
  // filtered list for crawlers.
  const filteredData = React.useMemo(() => {
    let base = filterTherapists(allData, filter);
    if (feeRange && feeBounds) {
      base = base.filter((t) => {
        const fee = getMinFee(t.fees);
        return fee !== null && fee >= feeLo && fee <= feeHi;
      });
    }
    return sortTherapists(base, sort, now);
  }, [allData, filter, feeRange, feeBounds, feeLo, feeHi, sort, now]);
  const shown = filteredData.slice(0, visible);
  const left = filteredData.length - shown.length;

  const activeChips = [
    filter.concern && { key: "concern", label: concernLabel(filter.concern) },
    filter.profile_type && { key: "profile_type", label: filter.profile_type },
    filter.mode && { key: "mode", label: filter.mode === "online" ? "Online" : "In-person" },
    filter.language_spoken && { key: "language_spoken", label: filter.language_spoken },
    filter.year_of_exp && { key: "year_of_exp", label: `${filter.year_of_exp} exp.` },
    filter.services && { key: "services", label: filter.services },
    filter.gender && { key: "gender", label: `${filter.gender} therapist` },
    filter.state && { key: "state", label: filter.state },
    filter.search && { key: "search", label: `“${filter.search}”` },
    feeRange && { key: "fee", label: `₹${feeLo.toLocaleString("en-IN")}–₹${feeHi.toLocaleString("en-IN")}` },
  ].filter(Boolean);
  const removeChip = (key) => {
    if (key === "fee") return setFeeRange("");
    if (key === "search") setSearch("");
    setField(key, "");
  };
  const panelCount = activeChips.filter((c) => c.key !== "search" && c.key !== "state").length;

  const heading = headingFor(filter);
  const band = React.useMemo(() => feeBand(allData), [allData]);
  const faqs = directoryFaqs(band);

  // ── shared bits of markup ──
  const selects = (cls) => (
    <>
      <select name="concern" aria-label="Concern" className={`${cls}${filter.concern ? " on" : ""}`} value={filter.concern} onChange={onSelect}>
        <option value="">Any concern</option>
        <optgroup label="Common">
          {concernOptions.common.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </optgroup>
        <optgroup label="More">
          {concernOptions.rest.map((v) => <option key={v} value={v}>{v}</option>)}
        </optgroup>
      </select>
      <select name="profile_type" aria-label="Therapist type" className={`${cls}${filter.profile_type ? " on" : ""}`} value={filter.profile_type} onChange={onSelect}>
        <option value="">All types</option>
        {typeOptions.map((v) => <option key={v} value={v}>{v}</option>)}
      </select>
      <select name="mode" aria-label="Session mode" className={`${cls}${filter.mode ? " on" : ""}`} value={filter.mode} onChange={onSelect}>
        <option value="">Online or in-person</option>
        {MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
      </select>
      <select name="language_spoken" aria-label="Language" className={`${cls}${filter.language_spoken ? " on" : ""}`} value={filter.language_spoken} onChange={onSelect}>
        <option value="">Any language</option>
        {langOptions.map((v) => <option key={v} value={v}>{v}</option>)}
      </select>
      <select name="year_of_exp" aria-label="Experience" className={`${cls}${filter.year_of_exp ? " on" : ""}`} value={filter.year_of_exp} onChange={onSelect}>
        <option value="">Any experience</option>
        {expOptions.map((v) => <option key={v} value={v}>{v}</option>)}
      </select>
      <select name="services" aria-label="Service" className={`${cls}${filter.services ? " on" : ""}`} value={filter.services} onChange={onSelect}>
        <option value="">Any service</option>
        {services.map((v) => <option key={v} value={v}>{v}</option>)}
      </select>
      {hasGender && (
        <select name="gender" aria-label="Therapist gender" className={`${cls}${filter.gender ? " on" : ""}`} value={filter.gender} onChange={onSelect}>
          <option value="">Any gender</option>
          <option value="Female">Female therapist</option>
          <option value="Male">Male therapist</option>
        </select>
      )}
    </>
  );

  const sortSelect = (cls) => (
    <label className={`vat-sort ${cls}`}>
      <span>Sort</span>
      <select aria-label="Sort therapists" value={sort} onChange={(e) => setSort(e.target.value)}>
        {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
      </select>
    </label>
  );

  const feeSlider = () => feeBounds && (
    <div className="vat-fee-range" role="group" aria-label="Fees per session">
      <div className="vat-fee-head">
        <span>Fees per session</span>
        <b>₹{feeLo.toLocaleString("en-IN")} – ₹{feeHi.toLocaleString("en-IN")}{feeHi >= feeBounds.max ? "+" : ""}</b>
      </div>
      <div className="vat-fee-track">
        <div className="vat-fee-fill" style={{ left: `${feePct(feeLo)}%`, right: `${100 - feePct(feeHi)}%` }} />
        <input type="range" min={feeBounds.min} max={feeBounds.max} step={FEE_STEP} value={feeLo}
          aria-label="Minimum fee" aria-valuetext={`₹${feeLo}`}
          onChange={(e) => setFees(Math.min(Number(e.target.value), feeHi - FEE_STEP), feeHi)} />
        <input type="range" min={feeBounds.min} max={feeBounds.max} step={FEE_STEP} value={feeHi}
          aria-label="Maximum fee" aria-valuetext={`₹${feeHi}`}
          onChange={(e) => setFees(feeLo, Math.max(Number(e.target.value), feeLo + FEE_STEP))} />
      </div>
    </div>
  );

  return (
    <>
      {/* dangerouslySetInnerHTML, not a string child: React escapes quotes in <style> text
          children but browsers don't un-escape them, so a string child hydration-mismatches. */}
      <style dangerouslySetInnerHTML={{ __html: CSS + CARD_CSS }} />

      {/* ── Banner: photo + search ── */}
      <section className="vat-banner" aria-labelledby="vat-ban-title">
        <img
          className="vat-ban-img"
          src="/assets/img/therapist-directory-banner-1600.webp"
          srcSet="/assets/img/therapist-directory-banner-800.webp 800w, /assets/img/therapist-directory-banner-1600.webp 1600w"
          sizes="100vw"
          alt=""
          width="1600"
          height="750"
          fetchPriority="high"
          decoding="async"
        />
        <div className="container vat-ban-inner">
          <p className="vat-ban-eyebrow">Verified psychologists &amp; therapists across India</p>
          <h1 id="vat-ban-title" className="vat-ban-title">
            {heading || <>Find the right <span className="vat-gold">therapist</span> for you</>}
          </h1>
          <p className="vat-ban-sub">Compare expertise, languages and fees — then book online or in-person.</p>

          <form className="vat-ban-search" role="search" onSubmit={(e) => { e.preventDefault(); applySearch(); }}>
            <i className="feather-search vat-ban-search-icon" aria-hidden="true" />
            <label htmlFor="vat-search" className="vat-sr">Search therapists by name, concern, state or city</label>
            <input
              id="vat-search"
              type="search"
              list="vat-search-states"
              autoComplete="off"
              placeholder="Name, concern, state or city…"
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
              {popularStates.map((st) => <option key={st} value={st} />)}
            </datalist>
          </form>

          <div className="vat-ban-row">
            <button type="button" className="vat-help-btn" onClick={() => setHelperOpen(true)}>
              <i className="feather-compass" aria-hidden="true" /> Not sure? <b>Help me choose</b>
            </button>
            {popularStates.length > 0 && (
              <div className="vat-ban-chips" aria-label="Popular locations">
                {popularStates.slice(0, 4).map((st) => (
                  <button key={st} type="button" className={filter.search === st ? "on" : ""} onClick={() => applySearch(st)}>
                    <i className="feather-map-pin" aria-hidden="true" /> {st}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Sticky filter + sort bar ── */}
      <div className="vat-bar" ref={barRef}>
        <div className="container vat-bar-in">
          <div className="vat-bar-desk">
            <div className="vat-bar-sels">{selects("vat-sel")}</div>
            {sortSelect("")}
          </div>
          <div className="vat-bar-mob">
            <button type="button" className={`vat-mob-btn${panelCount ? " on" : ""}`} onClick={() => setSheetOpen(true)}>
              <i className="feather-sliders" aria-hidden="true" /> Filters{panelCount ? <span className="vat-badge">{panelCount}</span> : null}
            </button>
            {sortSelect("mob")}
            <button type="button" className="vat-mob-btn ghost" onClick={() => setHelperOpen(true)}>
              <i className="feather-compass" aria-hidden="true" /> Help me choose
            </button>
          </div>
        </div>
      </div>

      <ConsultationConsentModal open={consultOpen} onClose={() => setConsultOpen(false)} />

      {/* ── Results ── */}
      <div ref={resultsRef} className="vat-results-wrap">
        <div className="container">
          <div className="vat-results-header">
            <div>
              <h2 className="vat-results-title">
                {filteredData.length} therapist{filteredData.length !== 1 ? "s" : ""}{activeChips.length ? " found" : ""}
              </h2>
              <p className="vat-results-count">
                {activeChips.length ? "matching your filters" : "verified professionals, online & in-person"}
                <span className="vat-legend" title="Top Pick: handpicked by the CYT team. Verified: documents checked by our team.">
                  <b className="tp">★ Top Pick</b> handpicked by our team
                </span>
              </p>
            </div>
            <div className="vat-fee-desk">{feeSlider()}</div>
          </div>

          {activeChips.length > 0 && (
            <div className="vat-chips">
              {activeChips.map((c) => (
                <span key={c.key} className="vat-chip">
                  {c.label}
                  <button type="button" onClick={() => removeChip(c.key)} className="vat-chip-x" aria-label={`Remove ${c.label}`}><i className="feather-x" /></button>
                </span>
              ))}
              <button type="button" className="vat-clear" onClick={resetFilters}>Clear all</button>
            </div>
          )}

          {loading ? (
            <div className="vat-list">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="vat-skeleton">
                  <div className="vat-skel-img" />
                  <div className="vat-skel-body">
                    <div className="vat-skel-line" style={{ width: "50%" }} />
                    <div className="vat-skel-line" style={{ width: "35%" }} />
                    <div className="vat-skel-line" style={{ width: "80%", marginTop: 16 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : shown.length === 0 ? (
            <div className="vat-empty">
              <i className="feather-search" aria-hidden="true" />
              <h3>No therapists match all of these</h3>
              <p>Try removing a filter — or tell us what you need and we'll suggest someone.</p>
              <div className="vat-empty-acts">
                <button type="button" className="vat-btn" onClick={resetFilters}>Clear filters</button>
                <button type="button" className="vat-btn ghost" onClick={() => setConsultOpen(true)}>15-min call · ₹99</button>
              </div>
            </div>
          ) : (
            <div className="vat-list">
              {shown.map((item, i) => (
                <React.Fragment key={item._id}>
                  <ProfileCardRow data={item} favrioutes={favrioutes} highlight={filter.concern} now={now} />
                  {i === 5 && shown.length > 6 && (
                    <aside className="vat-cta" aria-label="Help choosing a therapist">
                      <div>
                        <b>Not sure who's right for you?</b>
                        <span>Answer 3 quick questions, or talk to our team for 15 minutes and we'll suggest a good fit.</span>
                      </div>
                      <div className="vat-cta-acts">
                        <button type="button" className="vat-btn" onClick={() => setHelperOpen(true)}>Help me choose</button>
                        <button type="button" className="vat-btn ghost" onClick={() => setConsultOpen(true)}>15-min call · ₹99</button>
                      </div>
                    </aside>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {!loading && left > 0 && (
            <div className="vat-more">
              <button type="button" className="vat-more-btn" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                Show {Math.min(PAGE_SIZE, left)} more therapists
              </button>
              <span>Showing {shown.length} of {filteredData.length}</span>
            </div>
          )}

          {/* ── Browse + FAQ (also internal links for search engines) ── */}
          <section className="vat-browse" aria-labelledby="vat-browse-h">
            <h2 id="vat-browse-h">Browse by place, concern or type</h2>
            <div className="vat-links">
              {PLACE_LINKS.map(([slug, label]) => (
                <Link key={slug} href={`/psychologist-in/${slug}`}>Psychologists in {label}</Link>
              ))}
            </div>
            <div className="vat-links types">
              {CONCERN_PAGES.map((c) => (
                <Link key={c.slug} href={concernPath(c)}>Therapy for {c.label.toLowerCase()}</Link>
              ))}
            </div>
            <div className="vat-links types">
              {typeOptions.map((v) => (
                <Link key={v} href={`/view-all-therapist?profile_type=${encodeURIComponent(v)}`}>{v}s</Link>
              ))}
            </div>
          </section>

          <section className="vat-faq" aria-labelledby="vat-faq-h">
            <h2 id="vat-faq-h">Questions people ask</h2>
            {faqs.map((f, i) => (
              <details key={f.q} open={i === 0}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </section>
        </div>
      </div>

      {/* ── Mobile filter sheet (filters apply live) ── */}
      <div className={`vat-sheet-overlay${sheetOpen ? " open" : ""}`} onClick={() => setSheetOpen(false)} aria-hidden="true" />
      <div className={`vat-sheet${sheetOpen ? " open" : ""}`} role="dialog" aria-modal="true" aria-label="Filters" aria-hidden={!sheetOpen}>
        <div className="vat-sheet-head">
          <h3>Filters</h3>
          <button type="button" className="vat-x" onClick={() => setSheetOpen(false)} aria-label="Close filters"><i className="feather-x" /></button>
        </div>
        <div className="vat-sheet-body">
          {selects("vat-sheet-sel")}
          {feeSlider()}
        </div>
        <div className="vat-sheet-foot">
          <button type="button" className="vat-btn ghost" onClick={resetFilters}>Clear all</button>
          <button type="button" className="vat-btn" onClick={() => { setSheetOpen(false); scrollToResults(); }}>
            Show {filteredData.length} therapist{filteredData.length !== 1 ? "s" : ""}
          </button>
        </div>
      </div>

      {helperOpen && (
        <HelpMeChoose
          allData={allData}
          concerns={concernOptions.common}
          langs={langOptions.slice(0, 2)}
          onClose={() => setHelperOpen(false)}
          onCall={() => { setHelperOpen(false); setConsultOpen(true); }}
          onApply={(f) => {
            setHelperOpen(false);
            setSearch("");
            setFeeRange("");
            setSort("");
            setFilter({ ...EMPTY_FILTER, ...f });
            setTimeout(scrollToResults, 50);
          }}
        />
      )}
    </>
  );
}

// Three quick questions -> concern, session mode, language; shows how many match as you go.
function HelpMeChoose({ allData, concerns, langs, onClose, onApply, onCall }) {
  const [step, setStep] = React.useState(0);
  const [ans, setAns] = React.useState({ concern: "", mode: "", language_spoken: "" });
  const count = filterTherapists(allData, { ...EMPTY_FILTER, ...ans }).length;
  const pick = (k, v) => { setAns((a) => ({ ...a, [k]: v })); setStep((s) => s + 1); };
  const STEPS = [
    {
      q: "What would you like help with?",
      opts: [...concerns.map((c) => [c.value, c.label]), ["", "Something else / not sure"]],
      k: "concern",
    },
    { q: "How would you like to meet?", opts: [["online", "Online (video / audio)"], ["in-person", "In-person"], ["", "Either is fine"]], k: "mode" },
    { q: "Which language are you most comfortable in?", opts: [...langs.map((l) => [l, l]), ["", "Either is fine"]], k: "language_spoken" },
  ];
  const s = STEPS[step];

  return (
    <div className="vat-help-wrap" role="dialog" aria-modal="true" aria-labelledby="vat-help-q">
      <div className="vat-help-overlay" onClick={onClose} />
      <div className="vat-help">
        <div className="vat-help-top">
          <div className="vat-steps" aria-label={`Step ${Math.min(step + 1, 3)} of 3`}>
            {[0, 1, 2].map((i) => <span key={i} className={i <= step ? "on" : ""} />)}
          </div>
          <button type="button" className="vat-x" onClick={onClose} aria-label="Close"><i className="feather-x" /></button>
        </div>
        {s ? (
          <>
            <h3 id="vat-help-q">{s.q}</h3>
            <div className={`vat-help-opts${s.opts.length > 5 ? " grid" : ""}`}>
              {s.opts.map(([v, label]) => (
                <button key={label} type="button" className={ans[s.k] === v && v ? "on" : ""} onClick={() => pick(s.k, v)}>{label}</button>
              ))}
            </div>
            {step > 0 && <button type="button" className="vat-help-back" onClick={() => setStep(step - 1)}><i className="feather-arrow-left" /> Back</button>}
          </>
        ) : (
          <div className="vat-help-done">
            <h3 id="vat-help-q">{count ? `${count} therapist${count !== 1 ? "s" : ""} match what you need` : "No exact match yet"}</h3>
            <p>
              {count
                ? "We've put the best fits first. Compare a couple of profiles and book whoever feels right."
                : "Talk to our team for 15 minutes — we'll suggest the right therapist for you."}
            </p>
            {count > 0 && <button type="button" className="vat-btn" onClick={() => onApply(ans)}>Show {count} therapist{count !== 1 ? "s" : ""}</button>}
            <button type="button" className="vat-btn ghost" onClick={onCall}>Talk to our team · 15 min · ₹99</button>
            <button type="button" className="vat-help-back" onClick={() => setStep(0)}><i className="feather-rotate-ccw" /> Start again</button>
          </div>
        )}
      </div>
    </div>
  );
}

const CSS = `
/* ── Banner ── */
.vat-banner { position: relative; overflow: hidden; padding: 64px 0 52px; background: #0b1712; }
/* the photo's speaker sits on the left — mirror it so she faces the copy from the right */
.vat-ban-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 30% 30%; transform: scaleX(-1); }
.vat-banner::before { content: ''; position: absolute; inset: 0; z-index: 1; background: linear-gradient(90deg, rgba(7,26,17,.86) 0%, rgba(7,26,17,.64) 40%, rgba(7,26,17,.22) 72%, rgba(7,26,17,.06) 100%); }
.vat-ban-inner { position: relative; z-index: 2; text-align: left; }
/* desktop: the banner runs 200px up behind the header (navbar.js) — start the photo below it */
@media (min-width: 992px) { .vat-ban-img { top: 200px; height: calc(100% - 200px); } }
.vat-ban-eyebrow { display: inline-flex; align-items: center; gap: 8px; font-size: 11.5px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; color: #ecc77d; margin: 0 0 12px; padding: 0; }
.vat-ban-eyebrow::before { content: ''; width: 22px; height: 2px; background: #d4a24c; display: inline-block; }
.vat-ban-title { color: #fff; font-size: clamp(26px, 4.2vw, 46px); font-weight: 800; margin: 0 0 10px; line-height: 1.15; letter-spacing: -.3px; max-width: 760px; }
.vat-gold { color: #ecc77d; }
.vat-ban-sub { color: rgba(255,255,255,.9); font-size: clamp(15px, 1.4vw, 17px); margin: 0 0 22px; max-width: 540px; line-height: 1.6; font-weight: 500; padding: 0; }
.vat-sr { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
.vat-ban-search { position: relative; display: flex; align-items: center; max-width: 620px; background: #fff; border-radius: 14px; padding: 6px; box-shadow: 0 18px 40px -16px rgba(0,0,0,.55); }
.vat-ban-search-icon { position: absolute; left: 20px; font-size: 18px; color: #64748b; pointer-events: none; }
.vat-ban-search input { flex: 1; min-width: 0; height: 48px; border: none; outline: none; background: transparent; padding: 0 40px 0 44px; font-size: 15.5px; color: #0f172a; }
.vat-ban-search input::-webkit-search-cancel-button { display: none; }
.vat-ban-search:focus-within { box-shadow: 0 0 0 3px rgba(236,199,125,.6), 0 18px 40px -16px rgba(0,0,0,.55); }
.vat-ban-clear { position: absolute; right: 124px; width: 30px; height: 30px; border-radius: 50%; border: none; background: #f1f5f9; color: #64748b; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.vat-ban-go { flex-shrink: 0; height: 48px; padding: 0 26px; border: none; border-radius: 10px; background: #1e7a4c; color: #fff; font-size: 15px; font-weight: 800; cursor: pointer; }
.vat-ban-go:hover { background: #186640; }
.vat-ban-row { display: flex; align-items: center; flex-wrap: wrap; gap: 10px 16px; margin-top: 16px; }
.vat-help-btn { display: inline-flex; align-items: center; gap: 7px; height: 36px; padding: 0 14px; border-radius: 999px; border: 1px solid rgba(236,199,125,.7); background: rgba(212,162,76,.18); color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; backdrop-filter: blur(4px); }
.vat-help-btn b { color: #ecc77d; font-weight: 800; }
.vat-help-btn:hover { background: rgba(212,162,76,.32); }
.vat-ban-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.vat-ban-chips button { display: inline-flex; align-items: center; gap: 5px; padding: 6px 12px; border-radius: 999px; border: 1px solid rgba(255,255,255,.35); background: rgba(255,255,255,.12); color: #fff; font-size: 12.5px; font-weight: 600; cursor: pointer; backdrop-filter: blur(4px); transition: background .15s; }
.vat-ban-chips button:hover, .vat-ban-chips button.on { background: #fff; color: #14532d; }
.vat-ban-chips button i { font-size: 12px; }

/* ── Sticky filter bar ── */
.vat-bar { position: sticky; top: var(--vat-top, 0px); z-index: 900; background: #fff; border-bottom: 1px solid #e3ebe6; box-shadow: 0 8px 20px -16px rgba(20,83,45,.45); }
.vat-bar-in { padding-top: 10px; padding-bottom: 10px; }
.vat-bar-desk { display: flex; align-items: center; gap: 12px; }
.vat-bar-sels { flex: 1; min-width: 0; display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; }
.vat-bar-sels::-webkit-scrollbar { display: none; }
.vat-sel { flex: 1 1 0; min-width: 118px; max-width: 200px; height: 40px; border-radius: 10px; border: 1.5px solid #dbe5df; background-color: #f7faf8; font-size: 13px; padding: 0 30px 0 10px; color: #334155; font-weight: 600; outline: none; cursor: pointer; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; }
.vat-sel:hover { border-color: #b9d3c3; }
.vat-sel:focus-visible { border-color: #1e7a4c; box-shadow: 0 0 0 3px #dcefe3; }
.vat-sel.on { border-color: #1e7a4c; background-color: #eef6f1; color: #14532d; }
.vat-sort { display: inline-flex; align-items: center; gap: 6px; margin: 0; flex-shrink: 0; font-size: 12.5px; font-weight: 700; color: #64748b; }
.vat-sort select { height: 40px; border-radius: 10px; border: 1.5px solid #dbe5df; background-color: #fff; font-size: 13px; font-weight: 700; color: #14532d; padding: 0 30px 0 10px; outline: none; cursor: pointer; }
.vat-bar-mob { display: none; }

/* ── Results ── */
/* Footer.js forces <body> dark green site-wide — the results need their own background */
.vat-results-wrap { padding: 32px 0 64px; background: #f7f9f8; }
.vat-results-header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 18px; flex-wrap: wrap; gap: 14px; }
.vat-results-title { font-size: 24px; font-weight: 800; color: #14532d; letter-spacing: -0.3px; position: relative; padding-left: 16px; line-height: 1.2; margin: 0; }
.vat-results-title::before { content: ''; position: absolute; left: 0; top: 3px; bottom: 3px; width: 4px; border-radius: 2px; background: #d4a24c; }
.vat-results-count { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 14px; font-size: 13.5px; color: #64748b; font-weight: 600; margin: 6px 0 0; padding: 0 0 0 16px; }
.vat-legend { font-size: 12px; font-weight: 500; color: #64748b; cursor: help; }
.vat-legend .tp { font-size: 10.5px; font-weight: 800; color: #14532d; background: #ecc77d; border-radius: 5px; padding: 2px 6px; margin-right: 4px; }
.vat-fee-range { width: 280px; }
.vat-fee-head { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; margin-bottom: 4px; }
.vat-fee-head span { font-size: 12.5px; font-weight: 700; color: #334155; }
.vat-fee-head b { font-size: 13.5px; font-weight: 800; color: #1e7a4c; }
.vat-fee-track { position: relative; height: 24px; }
.vat-fee-track::before { content: ''; position: absolute; left: 0; right: 0; top: 50%; height: 5px; margin-top: -2.5px; border-radius: 999px; background: #e2e8e4; }
.vat-fee-fill { position: absolute; top: 50%; height: 5px; margin-top: -2.5px; border-radius: 999px; background: #1e7a4c; }
.vat-fee-track input[type=range] { position: absolute; inset: 0; width: 100%; height: 24px; margin: 0; background: none; pointer-events: none; -webkit-appearance: none; appearance: none; outline: none; border: none; padding: 0; }
.vat-fee-track input[type=range]::-webkit-slider-runnable-track { background: none; border: none; }
.vat-fee-track input[type=range]::-moz-range-track { background: none; border: none; }
.vat-fee-track input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; pointer-events: auto; cursor: grab; width: 22px; height: 22px; border-radius: 50%; background: #fff; border: 3px solid #1e7a4c; box-shadow: 0 2px 8px rgba(20,83,45,.3); }
.vat-fee-track input[type=range]::-moz-range-thumb { pointer-events: auto; cursor: grab; width: 16px; height: 16px; border-radius: 50%; background: #fff; border: 3px solid #1e7a4c; box-shadow: 0 2px 8px rgba(20,83,45,.3); }
.vat-fee-track input[type=range]:focus-visible::-webkit-slider-thumb { box-shadow: 0 0 0 4px rgba(30,122,76,.25); }

.vat-chips { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-bottom: 18px; }
.vat-chip { display: inline-flex; align-items: center; gap: 6px; background: #eef6f1; border: 1px solid #cfe3d6; color: #14532d; font-size: 12.5px; font-weight: 700; padding: 4px 6px 4px 12px; border-radius: 999px; }
.vat-chip-x { width: 20px; height: 20px; border-radius: 50%; background: none; border: none; padding: 0; cursor: pointer; color: #1e7a4c; display: flex; align-items: center; justify-content: center; }
.vat-chip-x:hover { background: #d5eadc; }
.vat-chip-x i { font-size: 11px; }
.vat-clear { background: none; border: none; color: #b42318; font-size: 12.5px; font-weight: 700; cursor: pointer; padding: 4px 6px; }

.vat-list { display: flex; flex-direction: column; gap: 14px; }
.vat-skeleton { display: flex; gap: 18px; padding: 16px; border-radius: 16px; background: #fff; border: 1px solid #e3ebe6; }
.vat-skel-img { width: 124px; height: 124px; border-radius: 14px; flex-shrink: 0; background: linear-gradient(90deg,#f1f5f3 25%,#e4ebe7 50%,#f1f5f3 75%); background-size: 200%; animation: vat-shimmer 1.4s infinite; }
.vat-skel-body { flex: 1; padding-top: 6px; }
.vat-skel-line { height: 14px; border-radius: 4px; background: linear-gradient(90deg,#f1f5f3 25%,#e4ebe7 50%,#f1f5f3 75%); background-size: 200%; animation: vat-shimmer 1.4s infinite; margin-bottom: 10px; }
@keyframes vat-shimmer { 0% { background-position: 200%; } 100% { background-position: -200%; } }

.vat-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 42px; padding: 0 18px; border-radius: 10px; border: none; background: #1e7a4c; color: #fff; font-size: 13.5px; font-weight: 800; cursor: pointer; white-space: nowrap; }
.vat-btn:hover { background: #186640; }
.vat-btn.ghost { background: #fff; color: #14532d; border: 1.5px solid #cfdcd4; }
.vat-btn.ghost:hover { border-color: #1e7a4c; background: #f7faf8; }

.vat-cta { display: flex; align-items: center; justify-content: space-between; gap: 14px 24px; flex-wrap: wrap; padding: 18px 20px; border-radius: 16px; background: #fffaf0; border: 1px solid #f0dfba; }
.vat-cta b { display: block; font-size: 16px; font-weight: 800; color: #14532d; margin-bottom: 3px; }
.vat-cta span { font-size: 13.5px; color: #5b4a2a; line-height: 1.5; }
.vat-cta-acts { display: flex; gap: 8px; flex-wrap: wrap; }

.vat-empty { text-align: center; padding: 48px 16px; background: #fff; border: 1px dashed #d5e0d9; border-radius: 16px; }
.vat-empty > i { font-size: 40px; color: #b9cbbf; }
.vat-empty h3 { font-size: 18px; color: #14532d; margin: 12px 0 6px; font-weight: 800; }
.vat-empty p { color: #64748b; font-size: 14px; margin: 0 0 16px; padding: 0; }
.vat-empty-acts { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }

.vat-more { display: flex; flex-direction: column; align-items: center; gap: 8px; margin-top: 26px; }
.vat-more-btn { height: 46px; padding: 0 28px; border-radius: 12px; border: 1.5px solid #1e7a4c; background: #fff; color: #1e7a4c; font-size: 14px; font-weight: 800; cursor: pointer; }
.vat-more-btn:hover { background: #1e7a4c; color: #fff; }
.vat-more span { font-size: 12.5px; color: #94a3b8; font-weight: 600; }

.vat-browse, .vat-faq { margin-top: 48px; }
.vat-browse h2, .vat-faq h2 { font-size: 20px; font-weight: 800; color: #14532d; margin: 0 0 14px; }
.vat-links { display: flex; flex-wrap: wrap; gap: 8px; }
.vat-links + .vat-links { margin-top: 10px; }
.vat-links a { font-size: 13px; font-weight: 600; color: #26463a; background: #fff; border: 1px solid #e0e9e3; border-radius: 999px; padding: 6px 13px; text-decoration: none; }
.vat-links a:hover { border-color: #1e7a4c; color: #1e7a4c; }
.vat-links.types a { background: #eef6f1; border-color: #d5e8dc; }
.vat-faq details { background: #fff; border: 1px solid #e3ebe6; border-radius: 12px; margin-bottom: 8px; }
.vat-faq summary { cursor: pointer; list-style: none; padding: 14px 44px 14px 16px; font-size: 15px; font-weight: 700; color: #0b1712; position: relative; }
.vat-faq summary::-webkit-details-marker { display: none; }
.vat-faq summary::after { content: '+'; position: absolute; right: 16px; top: 50%; transform: translateY(-50%); font-size: 20px; font-weight: 500; color: #1e7a4c; }
.vat-faq details[open] summary::after { content: '–'; }
.vat-faq details p { margin: 0; padding: 0 16px 14px; font-size: 14px; line-height: 1.65; color: #475569; }

/* ── Mobile filter sheet — above the cookie bar (z 99998) so its buttons stay tappable ── */
.vat-sheet-overlay { position: fixed; inset: 0; z-index: 100000; background: rgba(7,26,17,.5); opacity: 0; pointer-events: none; transition: opacity .25s; }
.vat-sheet-overlay.open { opacity: 1; pointer-events: auto; }
.vat-sheet { position: fixed; left: 0; right: 0; bottom: 0; z-index: 100001; background: #fff; border-radius: 18px 18px 0 0; transform: translateY(105%); transition: transform .3s cubic-bezier(.4,0,.2,1); max-height: 88vh; display: flex; flex-direction: column; padding-bottom: env(safe-area-inset-bottom, 0); visibility: hidden; }
.vat-sheet.open { transform: none; visibility: visible; }
.vat-sheet-head { display: flex; align-items: center; justify-content: space-between; padding: 16px 18px 12px; border-bottom: 1px solid #eef2f0; }
.vat-sheet-head h3 { margin: 0; font-size: 17px; font-weight: 800; color: #0b1712; }
.vat-x { width: 34px; height: 34px; border-radius: 10px; border: none; background: #f1f5f3; color: #475569; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
.vat-sheet-body { padding: 14px 18px; display: flex; flex-direction: column; gap: 10px; overflow-y: auto; }
.vat-sheet-sel { width: 100%; height: 46px; border-radius: 12px; border: 1.5px solid #dbe5df; background-color: #f7faf8; font-size: 14.5px; padding: 0 32px 0 12px; color: #1e293b; font-weight: 600; outline: none; }
.vat-sheet-sel.on { border-color: #1e7a4c; background-color: #eef6f1; color: #14532d; }
.vat-sheet-body .vat-fee-range { width: 100%; margin-top: 6px; }
.vat-sheet-foot { display: flex; gap: 10px; padding: 12px 18px 16px; border-top: 1px solid #eef2f0; }
.vat-sheet-foot .vat-btn { flex: 1; height: 48px; }
.vat-sheet-foot .vat-btn:last-child { flex: 2; }

/* ── Help me choose ── */
.vat-help-wrap { position: fixed; inset: 0; z-index: 100002; display: flex; align-items: center; justify-content: center; padding: 16px; }
.vat-help-overlay { position: absolute; inset: 0; background: rgba(7,26,17,.55); }
.vat-help { position: relative; width: 100%; max-width: 520px; max-height: calc(100vh - 32px); overflow-y: auto; background: #fff; border-radius: 20px; padding: 18px 20px 22px; box-shadow: 0 30px 60px -20px rgba(0,0,0,.4); }
.vat-help-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.vat-steps { display: flex; gap: 6px; }
.vat-steps span { width: 34px; height: 5px; border-radius: 999px; background: #e2e8e4; }
.vat-steps span.on { background: #1e7a4c; }
.vat-help h3 { font-size: 20px; font-weight: 800; color: #0b1712; margin: 0 0 14px; line-height: 1.3; }
.vat-help-opts { display: flex; flex-direction: column; gap: 8px; }
.vat-help-opts.grid { display: grid; grid-template-columns: 1fr 1fr; }
.vat-help-opts button { min-height: 46px; padding: 10px 14px; border-radius: 12px; border: 1.5px solid #dbe5df; background: #fff; text-align: left; font-size: 14px; font-weight: 600; color: #1e293b; cursor: pointer; line-height: 1.3; }
.vat-help-opts button:hover { border-color: #1e7a4c; background: #f4faf6; }
.vat-help-opts button.on { border-color: #1e7a4c; background: #eef6f1; color: #14532d; }
.vat-help-opts.grid button:last-child { grid-column: 1 / -1; text-align: center; color: #64748b; }
.vat-help-back { display: inline-flex; align-items: center; gap: 6px; margin-top: 12px; background: none; border: none; color: #64748b; font-size: 13px; font-weight: 700; cursor: pointer; padding: 4px 0; }
.vat-help-done { display: flex; flex-direction: column; gap: 10px; }
.vat-help-done h3 { margin-bottom: 0; }
.vat-help-done p { margin: 0 0 4px; font-size: 14px; color: #475569; line-height: 1.6; padding: 0; }
.vat-help-done .vat-btn { height: 48px; width: 100%; }
.vat-help-done .vat-help-back { align-self: center; }

/* ── Tablet / phone ── */
@media (max-width: 991px) {
  .vat-bar-desk { display: none; }
  .vat-bar-mob { display: flex; align-items: center; gap: 8px; }
  .vat-bar-in { padding-top: 8px; padding-bottom: 8px; }
  .vat-mob-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 40px; padding: 0 14px; border-radius: 10px; border: 1.5px solid #1e7a4c; background: #1e7a4c; color: #fff; font-size: 13.5px; font-weight: 800; cursor: pointer; white-space: nowrap; flex-shrink: 0; }
  .vat-mob-btn.ghost { background: #fff; color: #14532d; border-color: #cfdcd4; margin-left: auto; }
  .vat-badge { min-width: 19px; height: 19px; border-radius: 999px; background: #ecc77d; color: #14532d; font-size: 11px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; padding: 0 5px; }
  .vat-sort.mob { min-width: 0; flex: 1 1 auto; }
  .vat-sort.mob span { display: none; }
  .vat-sort.mob select { width: 100%; max-width: 180px; }
  .vat-fee-desk { display: none; }
  .vat-results-wrap { padding: 20px 0 48px; }
}
@media (max-width: 767px) {
  .vat-banner { padding: 26px 0 22px; }
  .vat-ban-img { object-position: 70% 10%; }
  .vat-banner::before { background: linear-gradient(180deg, rgba(7,26,17,.7) 0%, rgba(7,26,17,.82) 100%); }
  .vat-ban-eyebrow { font-size: 9.5px; letter-spacing: .6px; margin-bottom: 8px; }
  .vat-ban-eyebrow::before { display: none; }
  .vat-ban-title { font-size: 25px; margin-bottom: 14px; }
  .vat-ban-sub { display: none; }
  .vat-ban-search { padding: 5px; border-radius: 12px; }
  .vat-ban-search input { height: 44px; font-size: 15px; padding-right: 36px; padding-left: 40px; }
  .vat-ban-search-icon { left: 17px; }
  .vat-ban-go { height: 44px; padding: 0 16px; font-size: 14px; }
  .vat-ban-clear { right: 88px; }
  .vat-ban-chips { display: none; }
  .vat-ban-row { margin-top: 12px; }
  .vat-results-title { font-size: 20px; }
  .vat-legend { display: none; }
  .vat-cta { padding: 16px; }
  .vat-cta-acts { width: 100%; }
  .vat-cta-acts .vat-btn { flex: 1; }
  .vat-help-opts.grid button { font-size: 13.5px; }
  .vat-help-wrap { align-items: flex-end; padding: 0; }
  .vat-help { border-radius: 20px 20px 0 0; max-height: 92vh; padding-bottom: calc(22px + env(safe-area-inset-bottom, 0px)); }
  .vat-browse, .vat-faq { margin-top: 36px; }
  .vat-faq summary { font-size: 14.5px; }
}
/* small phones: "Help me choose" is already in the banner and after the 6th card — give Sort the room */
@media (max-width: 480px) {
  .vat-mob-btn.ghost { display: none; }
  .vat-sort.mob select { max-width: none; }
}
`;
