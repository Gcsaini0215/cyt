import React, { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import MainLayout from "../../components/therapists/main-layout";
import { PT_CSS } from "../../components/therapists/portal-ui";
import { fetchById } from "../../utils/actions";
import { GetMyReviewsUrl } from "../../utils/url";
import useTherapistStore from "../../store/therapistStore";
import { profilePath } from "../../utils/therapist-slug";
import { usePager, Pager } from "../../components/therapists/pager";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import IosShareRoundedIcon from "@mui/icons-material/IosShareRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import FormatQuoteRoundedIcon from "@mui/icons-material/FormatQuoteRounded";

// The therapist's own reviews (from their public profile): rating summary, filters and the full list.

const SITE = "https://www.chooseyourtherapist.in";
const SEEN_KEY = "cyt_th_reviews_seen"; // how many reviews they had seen (shared with the menu badge)
const AV = ["#166534", "#0f766e", "#1d4ed8", "#7c3aed", "#b45309", "#be185d", "#0369a1"];

const day = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
function ago(d) {
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  if (days < 1) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return day(d);
}
const initials = (n) => String(n || "?").trim().split(/\s+/).slice(0, 2).map((x) => x[0]).join("").toUpperCase();
const colorFor = (n) => AV[[...String(n || "")].reduce((a, c) => a + c.charCodeAt(0), 0) % AV.length];

function Stars({ value, size = 18 }) {
  return (
    <span className="rv-stars" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (i <= Math.round(value)
        ? <StarRoundedIcon key={i} style={{ fontSize: size }} className="on" />
        : <StarBorderRoundedIcon key={i} style={{ fontSize: size }} />))}
    </span>
  );
}

function ReviewCard({ r, isNew }) {
  const [more, setMore] = useState(false);
  const long = (r.description || "").length > 260;
  return (
    <article className={`rv-card${isNew ? " new" : ""}`}>
      <div className="rv-card-top">
        <span className="rv-av" style={{ background: colorFor(r.name) }}>{initials(r.name)}</span>
        <div className="rv-who">
          <b>{r.name || "Client"}</b>
          <span title={day(r.createdAt)}>{ago(r.createdAt)}</span>
        </div>
        {isNew && <span className="pt-chip ok">New</span>}
      </div>
      <Stars value={r.rating} />
      <p className={`rv-text${long && !more ? " clamp" : ""}`}>
        <FormatQuoteRoundedIcon className="rv-q" />
        {r.description}
      </p>
      {long && <button type="button" className="rv-more" onClick={() => setMore((m) => !m)}>{more ? "Show less" : "Read more"}</button>}
    </article>
  );
}

export default function Reviews() {
  const { therapistInfo } = useTherapistStore();
  const [reviews, setReviews] = useState(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("new");
  const [q, setQ] = useState("");
  const [copied, setCopied] = useState(false);
  // read before the menu marks everything seen, so this visit can still show what's new
  const [seenBefore] = useState(() => {
    if (typeof window === "undefined") return null;
    try { const v = localStorage.getItem(SEEN_KEY); return v === null ? null : Number(v) || 0; } catch (e) { return null; }
  });

  useEffect(() => {
    fetchById(`${GetMyReviewsUrl}?limit=1000`)
      .then((r) => { if (r?.status) setReviews(r.data || []); else setError(r?.message || "Couldn't load your reviews."); })
      .catch(() => setError("Couldn't load your reviews. Please check your connection and refresh."));
  }, []);

  const list = useMemo(() => reviews || [], [reviews]);
  const total = list.length;
  const avg = total ? list.reduce((a, r) => a + (Number(r.rating) || 0), 0) / total : 0;
  const dist = [5, 4, 3, 2, 1].map((s) => ({ s, n: list.filter((r) => Math.round(r.rating) === s).length }));
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const thisMonth = list.filter((r) => new Date(r.createdAt) >= monthStart).length;
  const happy = total ? Math.round((list.filter((r) => r.rating >= 4).length / total) * 100) : 0;
  const newCount = seenBefore === null ? 0 : Math.max(0, total - seenBefore);
  const newIds = new Set(list.slice(0, newCount).map((r) => r._id)); // list comes newest first

  const shown = useMemo(() => {
    let out = list;
    if (filter === "5") out = out.filter((r) => r.rating >= 5);
    else if (filter === "4") out = out.filter((r) => Math.round(r.rating) === 4);
    else if (filter === "low") out = out.filter((r) => r.rating <= 3);
    const s = q.trim().toLowerCase();
    if (s) out = out.filter((r) => `${r.name} ${r.description}`.toLowerCase().includes(s));
    const byDate = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);
    const by = { new: byDate, high: (a, b) => b.rating - a.rating || byDate(a, b), low: (a, b) => a.rating - b.rating || byDate(a, b) };
    return [...out].sort(by[sort]);
  }, [list, filter, q, sort]);

  const pg = usePager(shown, 10, `${filter}|${q}|${sort}`);

  const profileUrl = therapistInfo?._id ? `${SITE}${profilePath(therapistInfo)}` : "";
  const askLink = profileUrl ? `${profileUrl}#write-review` : "";
  const share = async () => {
    if (!askLink) return;
    const text = "I'd be grateful if you could share a short review of our sessions:";
    try {
      if (navigator.share) { await navigator.share({ title: "Leave a review", text, url: askLink }); return; }
    } catch (e) { return; /* share sheet closed */ }
    try { await navigator.clipboard.writeText(`${text} ${askLink}`); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch (e) { window.prompt("Copy this link:", askLink); }
  };

  const FILTERS = [
    { k: "all", label: `All (${total})` },
    { k: "5", label: `5★ (${dist[0].n})` },
    { k: "4", label: `4★ (${dist[1].n})` },
    { k: "low", label: `3★ & below (${dist[2].n + dist[3].n + dist[4].n})` },
  ];

  return (
    <MainLayout>
      <Head><title>Reviews | Choose Your Therapist</title></Head>
      <style dangerouslySetInnerHTML={{ __html: PT_CSS + RV_CSS }} />
      <div className="pt">
        <div className="pt-head">
          <div>
            <h1>Reviews</h1>
            <p>What your clients say about you — shown on your public profile.</p>
          </div>
          <div className="rv-head-acts">
            {profileUrl && <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="pt-btn outline"><OpenInNewRoundedIcon /> See on profile</a>}
            <button type="button" className="pt-btn primary" onClick={share} disabled={!askLink}><IosShareRoundedIcon /> {copied ? "Link copied!" : "Ask for a review"}</button>
          </div>
        </div>

        {error && <div className="pt-err">{error}</div>}

        <div className="rv-top">
          <div className="pt-card rv-summary">
            <div className="rv-big">
              <b>{reviews ? (total ? avg.toFixed(1) : "—") : "…"}</b>
              <Stars value={avg} size={22} />
              <span>{total} review{total === 1 ? "" : "s"}</span>
            </div>
            <div className="rv-dist">
              {dist.map(({ s, n }) => (
                <button type="button" key={s} className={`rv-bar${(filter === String(s) && s >= 4) || (filter === "low" && s <= 3) ? " on" : ""}`}
                  onClick={() => setFilter(s === 5 ? "5" : s === 4 ? "4" : "low")} title={`Show ${s}★ reviews`}>
                  <span>{s}★</span>
                  <i><em style={{ width: total ? `${(n / total) * 100}%` : 0 }} /></i>
                  <small>{n}</small>
                </button>
              ))}
            </div>
          </div>
          <div className="rv-mini">
            <div className="pt-stat"><small>This month</small><b>{reviews ? thisMonth : "—"}</b><span>new review{thisMonth === 1 ? "" : "s"}</span></div>
            <div className="pt-stat"><small>Happy clients</small><b>{reviews && total ? `${happy}%` : "—"}</b><span>rated 4★ or 5★</span></div>
          </div>
        </div>

        {reviews && total > 0 && (
          <div className="rv-tools">
            <div className="rv-chips">
              {FILTERS.map((f) => <button key={f.k} type="button" className={filter === f.k ? "on" : ""} onClick={() => setFilter(f.k)}>{f.label}</button>)}
            </div>
            <div className="rv-tools-r">
              <label className="rv-search"><SearchRoundedIcon /><input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search reviews" aria-label="Search reviews" /></label>
              <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort reviews">
                <option value="new">Newest first</option>
                <option value="high">Highest rated</option>
                <option value="low">Lowest rated</option>
              </select>
            </div>
          </div>
        )}

        {!reviews && !error && <div className="rv-grid">{[1, 2, 3, 4].map((i) => <div key={i} className="pt-skel rv-skel" />)}</div>}

        {reviews && total === 0 && (
          <div className="pt-card rv-empty">
            <span className="rv-empty-ic"><StarRoundedIcon /></span>
            <b>No reviews yet</b>
            <p>Reviews build trust with new clients. After a session, send your client the review link — it opens your profile right at the review form.</p>
            <button type="button" className="pt-btn primary" onClick={share} disabled={!askLink}><IosShareRoundedIcon /> {copied ? "Link copied!" : "Share review link"}</button>
          </div>
        )}

        {reviews && total > 0 && (shown.length ? (
          <div data-pager-scope>
            <div className="rv-grid">
              {pg.items.map((r) => <ReviewCard key={r._id} r={r} isNew={newIds.has(r._id)} />)}
            </div>
            <Pager pg={pg} noun="reviews" />
          </div>
        ) : (
          <div className="pt-card pt-empty"><b>No reviews match</b>Try another filter or search.</div>
        ))}
      </div>
    </MainLayout>
  );
}

const RV_CSS = `
.rv-head-acts { display: flex; gap: 8px; flex-wrap: wrap; }
.rv-top { display: grid; grid-template-columns: minmax(0, 1fr) 260px; gap: 14px; margin-bottom: 14px; }
.rv-summary { display: flex; align-items: center; gap: 24px; margin: 0; padding: 18px 22px; }
.rv-big { display: flex; flex-direction: column; align-items: center; min-width: 120px; }
.rv-big b { font-size: 46px; font-weight: 800; line-height: 1; color: var(--ink); letter-spacing: -1px; }
.rv-big span { font-size: 12.5px; color: var(--mut); margin-top: 4px; font-weight: 600; }
.rv-stars { display: inline-flex; color: #cbd5e1; margin: 4px 0 2px; }
.rv-stars .on { color: #f5a524; }
.rv-dist { flex: 1; display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.rv-bar { display: grid; grid-template-columns: 30px 1fr 30px; align-items: center; gap: 10px; border: 0; background: none; padding: 3px 6px; border-radius: 8px; cursor: pointer; font-family: inherit; }
.rv-bar:hover, .rv-bar.on { background: #f0fdf4; }
.rv-bar span { font-size: 12.5px; font-weight: 700; color: #334155; text-align: left; }
.rv-bar i { height: 9px; border-radius: 99px; background: #eef2f0; overflow: hidden; display: block; }
.rv-bar em { display: block; height: 100%; border-radius: 99px; background: linear-gradient(90deg, #f5a524, #f59e0b); transition: width .5s ease; }
.rv-bar small { font-size: 12px; color: var(--mut); text-align: right; font-variant-numeric: tabular-nums; }
.rv-mini { display: grid; gap: 14px; }
.rv-mini .pt-stat { display: flex; flex-direction: column; justify-content: center; }
.rv-tools { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; margin-bottom: 12px; }
.rv-chips { display: flex; gap: 6px; flex-wrap: wrap; }
.rv-chips button { height: 34px; padding: 0 13px; border-radius: 999px; border: 1px solid var(--line); background: #fff; font-size: 13px; font-weight: 700; color: #475569; cursor: pointer; font-family: inherit; }
.rv-chips button.on { background: var(--g); border-color: var(--g); color: #fff; }
.rv-tools-r { display: flex; gap: 8px; }
.rv-search { display: flex; align-items: center; gap: 6px; height: 36px; padding: 0 10px; border: 1px solid var(--line); border-radius: 10px; background: #fff; margin: 0; }
.rv-search svg { font-size: 18px; color: var(--faint); }
.rv-search input { border: 0; outline: 0; font-size: 13.5px; width: 170px; background: transparent; font-family: inherit; height: auto; padding: 0; }
.rv-tools-r select { height: 36px; border: 1px solid var(--line); border-radius: 10px; padding: 0 10px; font-size: 13px; font-weight: 600; color: #334155; background: #fff; font-family: inherit; width: auto; }
.rv-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.rv-skel { height: 150px; margin: 0; border-radius: 16px; }
.rv-card { background: #fff; border: 1px solid var(--line); border-radius: 16px; padding: 16px 18px; min-width: 0; transition: box-shadow .15s, transform .15s; }
.rv-card:hover { box-shadow: 0 12px 28px -18px rgba(15,23,42,.3); transform: translateY(-1px); }
.rv-card.new { border-color: #bbe5c8; box-shadow: 0 0 0 3px #e7f6ec; }
.rv-card-top { display: flex; align-items: center; gap: 11px; }
.rv-av { width: 40px; height: 40px; border-radius: 12px; color: #fff; display: grid; place-items: center; font-weight: 800; font-size: 14px; flex-shrink: 0; }
.rv-who { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.rv-who b { font-size: 14.5px; font-weight: 800; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rv-who span { font-size: 12px; color: var(--faint); }
.rv-card .rv-stars { margin: 10px 0 4px; }
.rv-text { font-size: 14px; color: #334155; line-height: 1.6; margin: 0; white-space: pre-line; overflow-wrap: anywhere; }
.rv-text.clamp { display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
.rv-q { font-size: 18px !important; color: #cfe3d6; vertical-align: -3px; margin-right: 3px; transform: scaleX(-1); }
.rv-more { border: 0; background: none; padding: 0; margin-top: 6px; font-size: 12.5px; font-weight: 700; color: var(--g); cursor: pointer; font-family: inherit; }
.rv-empty { text-align: center; padding: 34px 20px; }
.rv-empty-ic { width: 54px; height: 54px; border-radius: 16px; background: #fef3c7; color: #f59e0b; display: inline-grid; place-items: center; margin-bottom: 10px; }
.rv-empty-ic svg { font-size: 30px; }
.rv-empty b { display: block; font-size: 16px; margin-bottom: 4px; }
.rv-empty p { font-size: 13.5px; color: var(--mut); max-width: 440px; margin: 0 auto 14px; line-height: 1.55; }
@media (max-width: 1023px) {
  .rv-top { grid-template-columns: 1fr; }
  .rv-mini { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 767px) {
  .rv-grid { grid-template-columns: 1fr; }
  .rv-summary { gap: 14px; padding: 14px; }
  .rv-big { min-width: 92px; }
  .rv-big b { font-size: 38px; }
  .rv-tools-r { width: 100%; }
  .rv-search { flex: 1; }
  .rv-search input { width: 100%; }
  .rv-head-acts { width: 100%; }
  .rv-head-acts .pt-btn { flex: 1; }
}
`;
