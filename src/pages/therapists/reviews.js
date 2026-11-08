import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
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
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import SmsRoundedIcon from "@mui/icons-material/SmsRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";

// The therapist's own reviews (from their public profile): rating summary, filters and the full list.

const SITE = "https://www.chooseyourtherapist.in";
const SEEN_KEY = "cyt_th_reviews_seen"; // how many reviews they had seen (shared with the menu badge)
const AV = ["#166534", "#0f766e", "#1d4ed8", "#7c3aed", "#b45309", "#be185d", "#0369a1"];

const TZ = "Asia/Kolkata";
const valid = (d) => d && !Number.isNaN(new Date(d).getTime());
const day = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: TZ });
// "9 Nov 2026, 4:32 PM" (India time)
const exact = (d) => `${day(d)}, ${new Date(d).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: TZ }).toUpperCase()}`;
const istDay = (d) => new Date(d).toLocaleDateString("en-CA", { timeZone: TZ }); // YYYY-MM-DD
function ago(d) {
  const days = Math.round((new Date(istDay(Date.now())) - new Date(istDay(d))) / 86400000); // calendar days
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  const m = Math.floor(days / 30.4);
  if (m < 12) return `${m} month${m === 1 ? "" : "s"} ago`;
  const y = Math.floor(days / 365);
  return `${y} year${y === 1 ? "" : "s"} ago`;
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
          {valid(r.createdAt) && (
            <span className="rv-when">
              <time dateTime={new Date(r.createdAt).toISOString()}>{exact(r.createdAt)}</time>
              <em>· {ago(r.createdAt)}</em>
            </span>
          )}
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

// "Ask for a review": message + link with Copy / WhatsApp / Email / SMS (and the phone's share sheet).
function AskModal({ link, name, live, onClose }) {
  const first = (name || "").trim().split(/\s+/)[0];
  const [msg, setMsg] = useState(`Hi! It was good working with you. If our sessions helped, I'd be grateful if you could share a short review — it helps others find the right support.${first ? `\n— ${first}` : ""}`);
  const [copied, setCopied] = useState("");
  const full = `${msg.trim()}\n${link}`;
  const canShare = typeof navigator !== "undefined" && !!navigator.share && typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

  useEffect(() => {
    const prevB = document.body.style.overflow, prevH = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden"; document.documentElement.style.overflow = "hidden";
    const k = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", k);
    return () => { document.body.style.overflow = prevB; document.documentElement.style.overflow = prevH; window.removeEventListener("keydown", k); };
  }, [onClose]);

  const copy = async (what, text) => {
    try { await navigator.clipboard.writeText(text); }
    catch (e) {
      const ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch (e2) { /* nothing else to try */ }
      ta.remove();
    }
    setCopied(what); setTimeout(() => setCopied(""), 2200);
  };
  const share = async () => { try { await navigator.share({ title: "Leave a review", text: msg.trim(), url: link }); } catch (e) { /* closed */ } };
  const enc = encodeURIComponent;

  return createPortal(
    <div className="rv-ask-wrap" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="rv-ask" role="dialog" aria-modal="true" aria-labelledby="rv-ask-h">
        <div className="rv-ask-head">
          <div><h2 id="rv-ask-h">Ask for a review</h2><p>Send this to a client after a session. The link opens your profile right at the review form.</p></div>
          <button type="button" className="rv-ask-x" onClick={onClose} aria-label="Close"><CloseRoundedIcon /></button>
        </div>
        {!live && <div className="rv-ask-warn">Your profile isn't live on the website yet, so clients can't open this link. It will work once your profile is live.</div>}
        <label className="rv-ask-l" htmlFor="rv-ask-msg">Message</label>
        <textarea id="rv-ask-msg" rows={4} value={msg} maxLength={600} onChange={(e) => setMsg(e.target.value)} />
        <label className="rv-ask-l">Review link</label>
        <div className="rv-ask-link">
          <input readOnly value={link} onFocus={(e) => e.target.select()} aria-label="Review link" />
          <button type="button" onClick={() => copy("link", link)}>{copied === "link" ? <><CheckRoundedIcon /> Copied</> : <><ContentCopyRoundedIcon /> Copy</>}</button>
        </div>
        <div className="rv-ask-grid">
          <a className="wa" href={`https://wa.me/?text=${enc(full)}`} target="_blank" rel="noopener noreferrer"><WhatsAppIcon /> WhatsApp</a>
          <a className="em" href={`mailto:?subject=${enc("Could you share a short review?")}&body=${enc(full)}`}><EmailRoundedIcon /> Email</a>
          <a className="sm" href={`sms:?&body=${enc(full)}`}><SmsRoundedIcon /> SMS</a>
          <button type="button" className="cp" onClick={() => copy("msg", full)}>{copied === "msg" ? <><CheckRoundedIcon /> Copied</> : <><ContentCopyRoundedIcon /> Copy message</>}</button>
        </div>
        {canShare && <button type="button" className="pt-btn outline rv-ask-more" onClick={share}><IosShareRoundedIcon /> More apps…</button>}
      </div>
    </div>,
    document.body
  );
}

export default function Reviews() {
  const { therapistInfo } = useTherapistStore();
  const [reviews, setReviews] = useState(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("new");
  const [q, setQ] = useState("");
  const [asking, setAsking] = useState(false);
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
  const monthNow = istDay(Date.now()).slice(0, 7); // this month in India time, "2026-11"
  const thisMonth = list.filter((r) => valid(r.createdAt) && istDay(r.createdAt).slice(0, 7) === monthNow).length;
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
  const share = () => { if (askLink) setAsking(true); };
  const live = therapistInfo?.show_to_page === undefined || therapistInfo?.show_to_page === 1 || therapistInfo?.show_to_page === true;

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
            <button type="button" className="pt-btn primary" onClick={share} disabled={!askLink}><IosShareRoundedIcon /> Ask for a review</button>
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
            <button type="button" className="pt-btn primary" onClick={share} disabled={!askLink}><IosShareRoundedIcon /> Share review link</button>
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
      {asking && askLink && <AskModal link={askLink} name={therapistInfo?.user?.name} live={live} onClose={() => setAsking(false)} />}
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
.rv-when { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0 5px; font-size: 12.5px; color: #475569; font-weight: 600; }
.rv-when em { font-style: normal; font-weight: 500; color: var(--faint); }
.rv-ask-wrap { position: fixed; inset: 0; z-index: 2147483100; background: rgba(15,23,42,.5); display: grid; place-items: center; padding: 16px; overscroll-behavior: contain; }
.rv-ask { width: min(520px, 100%); max-height: calc(100dvh - 32px); overflow-y: auto; background: #fff; border-radius: 18px; padding: 20px; box-shadow: 0 30px 60px -20px rgba(0,0,0,.4); font-family: inherit; }
.rv-ask-head { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; }
.rv-ask-head > div { flex: 1; min-width: 0; }
.rv-ask-head h2 { margin: 0 0 4px; font-size: 19px; font-weight: 800; color: #0f172a; }
.rv-ask-head p { margin: 0; font-size: 13.5px; color: #64748b; line-height: 1.5; }
.rv-ask-x { width: 34px; height: 34px; border-radius: 10px; border: 0; background: #f1f5f9; color: #334155; display: grid; place-items: center; cursor: pointer; flex-shrink: 0; }
.rv-ask-warn { background: #fffbeb; border: 1px solid #fde68a; color: #92400e; font-size: 13px; font-weight: 600; border-radius: 10px; padding: 9px 11px; margin-bottom: 12px; line-height: 1.45; }
.rv-ask-l { display: block; font-size: 12px; font-weight: 700; color: #475569; margin: 0 0 5px; text-transform: uppercase; letter-spacing: .04em; }
.rv-ask textarea { width: 100%; border: 1.5px solid #dbe3df; border-radius: 11px; padding: 10px 12px; font-size: 14px; line-height: 1.5; font-family: inherit; resize: vertical; margin-bottom: 12px; color: #0f172a; height: auto; }
.rv-ask textarea:focus, .rv-ask-link input:focus { outline: none; border-color: #16a34a; }
.rv-ask-link { display: flex; gap: 8px; margin-bottom: 14px; }
.rv-ask-link input { flex: 1; min-width: 0; height: 42px; border: 1.5px solid #dbe3df; border-radius: 11px; padding: 0 11px; font-size: 13px; color: #334155; background: #f8faf9; font-family: inherit; margin: 0; }
.rv-ask-link button { height: 42px; padding: 0 14px; border-radius: 11px; border: 1.5px solid #166534; background: #fff; color: #166534; font-weight: 700; font-size: 13.5px; display: inline-flex; align-items: center; gap: 5px; cursor: pointer; font-family: inherit; white-space: nowrap; }
.rv-ask-link button svg { font-size: 17px; }
.rv-ask-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.rv-ask-grid a, .rv-ask-grid button { height: 46px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; gap: 7px; font-size: 14px; font-weight: 700; text-decoration: none; border: 0; cursor: pointer; font-family: inherit; }
.rv-ask-grid svg { font-size: 20px; }
.rv-ask-grid .wa { background: #25d366; color: #fff; }
.rv-ask-grid .em { background: #eef2ff; color: #3730a3; }
.rv-ask-grid .sm { background: #ecfeff; color: #0e7490; }
.rv-ask-grid .cp { background: #166534; color: #fff; }
.rv-ask-more { width: 100%; margin-top: 8px; justify-content: center; }
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
  .rv-ask-wrap { place-items: end center; padding: 0; }
  .rv-ask { border-radius: 18px 18px 0 0; max-height: 92dvh; padding: 18px 16px calc(18px + env(safe-area-inset-bottom)); }
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
