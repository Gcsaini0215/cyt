import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import VerifiedRounded from "@mui/icons-material/VerifiedRounded";
import Star from "@mui/icons-material/Star";
import { imagePath } from "../../utils/url";
import { profilePath } from "../../utils/therapist-slug";
import { thumb, thumbSet } from "../../utils/thumb";
import { split, getMinFee, sessionModes, nextAvailable } from "../../utils/therapist-directory";
import { GBP_URL } from "../about/visit-centre";

// Home "Meet our psychologists": a swipeable row of therapist cards with real ratings, fees
// and availability, in tabs that differ from the banner wall — Top rated, Available today,
// Near you (once the visitor's state is known) and In-person, plus a language filter.
// `people` is the whole directory in a slim shape (pages/index.js), rendered on the server.

const isTop = (t) => t.priority === 1 || t.priority === "1";
const ratingOf = (t) => {
  const r = (t.reviews || []).filter((x) => typeof x.rating === "number");
  return r.length ? { avg: r.reduce((a, x) => a + x.rating, 0) / r.length, count: r.length } : null;
};
// a 5.0 from one review shouldn't beat a 4.9 from twenty
const score = (t) => { const r = ratingOf(t); return r ? (r.avg * r.count + 4.5 * 3) / (r.count + 3) : 0; };
const byPriority = (a, b) => (isTop(b) - isTop(a)) || ((b.reviews?.length || 0) - (a.reviews?.length || 0));
const expLabel = (raw) => { const v = String(raw || "").trim(); return !v ? "" : /year|yr/i.test(v) ? v.replace(/years?/i, "yrs") : `${v} yrs`; };

// ipapi gives e.g. "National Capital Territory of Delhi"; therapists write "Delhi", "Noida, Uttar Pradesh"…
const sameState = (therapistState, visitorState) => {
  const a = String(therapistState || "").toLowerCase();
  const b = String(visitorState || "").toLowerCase();
  if (!a || !b) return false;
  const key = b.includes("delhi") ? "delhi" : b.replace(/^(state of|union territory of)\s+/, "");
  return a.includes(key) || (key === "delhi" && /ncr|new delhi/.test(a));
};

function Card({ t, now, hidden }) {
  const r = ratingOf(t);
  const name = t.user?.name || "Therapist";
  const fee = getMinFee(t.fees);
  const langs = split(t.language_spoken).slice(0, 2);
  const modes = sessionModes(t);
  const next = nextAvailable(t, now);
  const photo = t.user?.profile ? `${imagePath}/${t.user.profile}` : "";
  const href = profilePath(t);
  const tab = hidden ? -1 : undefined;
  return (
    <article className="tt-card">
      <Link href={href} className="tt-photo" tabIndex={tab} aria-label={`${name} — view profile`}>
        {photo
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={thumb(photo, 384)} srcSet={thumbSet(photo, 384, 640)} alt={name} loading="lazy" decoding="async" width="250" height="230" />
          : <span className="tt-init">{name.slice(0, 1)}</span>}
        <span className={`tt-rate${r ? "" : " new"}`}>
          {r ? <><Star sx={{ fontSize: 14, color: "#d4a24c" }} /> {r.avg.toFixed(1)} <small>({r.count})</small></> : "New on CYT"}
        </span>
        {isTop(t) && <span className="tt-pick" title="Handpicked by the CYT team">★ Top Pick</span>}
      </Link>
      <div className="tt-body">
        <Link href={href} className="tt-name" tabIndex={tab}>
          <span>{name}</span><VerifiedRounded sx={{ fontSize: 16, color: "#1d9bf0", flexShrink: 0 }} />
        </Link>
        <div className="tt-role">{t.profile_type || "Psychologist"}</div>
        <div className="tt-meta">
          {expLabel(t.year_of_exp) && <span>{expLabel(t.year_of_exp)} exp.</span>}
          {langs.length > 0 && <span>{langs.join(", ")}</span>}
        </div>
        <div className="tt-modes">
          {modes.online && <span><i className="feather-video" aria-hidden="true" /> Online</span>}
          {modes.inPerson && <span className="ip"><i className="feather-home" aria-hidden="true" /> In-person</span>}
        </div>
        <div className="tt-row">
          <div className="tt-fee">{fee ? <>From <b>₹{fee.toLocaleString("en-IN")}</b></> : "Fees on request"}</div>
          {next && <div className={`tt-next${next.days === 0 ? " today" : ""}`}><i aria-hidden="true" />{next.days === 0 ? "Today" : next.days === 1 ? "Tomorrow" : next.label} {next.time}</div>}
        </div>
        <div className="tt-acts">
          <Link href={href} className="tt-view" tabIndex={tab}>View</Link>
          <Link href={`/book/${t._id}`} className="tt-book" tabIndex={tab}>Book</Link>
        </div>
      </div>
    </article>
  );
}

export default function TopTherapists({ people = [], visitorState = null, total = 0 }) {
  const [now, setNow] = useState(null);
  useEffect(() => { setNow(Date.now()); }, []);
  const [tab, setTab] = useState("top");
  const [lang, setLang] = useState("");
  const rowRef = useRef(null);

  const languages = useMemo(() => {
    const m = {};
    people.forEach((t) => split(t.language_spoken).forEach((l) => { m[l] = (m[l] || 0) + 1; }));
    return Object.entries(m).filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]).map(([l]) => l).slice(0, 5);
  }, [people]);

  const lists = useMemo(() => {
    const byLang = lang ? people.filter((t) => split(t.language_spoken).includes(lang)) : people;
    const top = byLang.filter(ratingOf).sort((a, b) => score(b) - score(a));
    const today = now
      ? byLang.map((t) => ({ t, n: nextAvailable(t, now) })).filter((x) => x.n?.days === 0)
        .sort((a, b) => (a.n.rank - b.n.rank) || byPriority(a.t, b.t)).map((x) => x.t)
      : [];
    const near = visitorState ? byLang.filter((t) => sameState(t.state, visitorState)).sort(byPriority) : [];
    const inPerson = byLang.filter((t) => sessionModes(t).inPerson).sort(byPriority);
    return { top, today, near, inPerson };
  }, [people, lang, now, visitorState]);

  const nearLabel = visitorState ? (/delhi/i.test(visitorState) ? "Delhi" : visitorState) : "";
  const TABS = [
    { key: "top", label: "Top rated", n: lists.top.length },
    { key: "today", label: "Available today", n: lists.today.length, hide: !now },
    { key: "near", label: `Near you · ${nearLabel}`, n: lists.near.length, hide: lists.near.length < 2 && tab !== "near" },
    { key: "inPerson", label: "In-person", n: lists.inPerson.length },
  ].filter((x) => !x.hide);
  const shown = (lists[tab] || []).slice(0, 16);

  // new tab / language -> back to the start of the row
  useEffect(() => { rowRef.current?.scrollTo({ left: 0 }); }, [tab, lang]);
  const slide = (dir) => {
    const el = rowRef.current;
    if (!el) return;
    const card = el.querySelector(".tt-card");
    el.scrollBy({ left: dir * ((card?.getBoundingClientRect().width || 250) + 18) * 2, behavior: "smooth" });
  };

  if (!people.length) return null;
  return (
    <section className="tt-sec" aria-labelledby="tt-h">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="container">
        <div className="tt-head">
          <div>
            <p className="tt-eyebrow">Our psychologists</p>
            <h2 id="tt-h" className="tt-title">Find someone you'll feel <span>comfortable</span> with</h2>
            <p className="tt-sub">Real ratings from clients, fees upfront and live availability — online or in person.</p>
          </div>
          <Link href="/view-all-therapist" className="tt-all">View all {total || ""} psychologists <i className="feather-arrow-right" aria-hidden="true" /></Link>
        </div>

        <div className="tt-controls">
          <div className="tt-tabs" role="tablist" aria-label="Show psychologists">
            {TABS.map((x) => (
              <button key={x.key} type="button" role="tab" aria-selected={tab === x.key} className={tab === x.key ? "on" : ""} onClick={() => setTab(x.key)}>
                {x.key === "today" && <i className="tt-dot" aria-hidden="true" />}{x.label}<small>{x.n}</small>
              </button>
            ))}
          </div>
          {languages.length > 1 && (
            <div className="tt-langs" aria-label="Language">
              <button type="button" className={!lang ? "on" : ""} onClick={() => setLang("")}>Any language</button>
              {languages.map((l) => <button key={l} type="button" className={lang === l ? "on" : ""} onClick={() => setLang(lang === l ? "" : l)}>{l}</button>)}
            </div>
          )}
        </div>

        <div className="tt-frame">
          {shown.length > 0 ? (
            <>
              <button type="button" className="tt-arrow prev" onClick={() => slide(-1)} aria-label="Previous psychologists"><i className="feather-chevron-left" /></button>
              <div className="tt-row-scroll" ref={rowRef} role="tabpanel">
                {shown.map((t) => <Card key={t._id} t={t} now={now} />)}
                <Link href="/view-all-therapist" className="tt-card tt-more">
                  <span className="tt-more-ic" aria-hidden="true"><i className="feather-users" /></span>
                  <b>See all {total || ""} psychologists</b>
                  <span>Filter by concern, language, fees and more</span>
                </Link>
              </div>
              <button type="button" className="tt-arrow next" onClick={() => slide(1)} aria-label="More psychologists"><i className="feather-chevron-right" /></button>
            </>
          ) : (
            <div className="tt-empty">
              <p>No one matches this right now.</p>
              <button type="button" onClick={() => { setLang(""); setTab("top"); }}>Show top rated</button>
            </div>
          )}
        </div>

        <div className="tt-foot">
          <ul className="tt-trust">
            <li><b>{total || "50+"}</b> verified psychologists</li>
            <li><a href={GBP_URL} target="_blank" rel="noreferrer"><Star sx={{ fontSize: 15, color: "#d4a24c" }} /> <b>4.9</b> on Google</a></li>
            <li><b>5000+</b> sessions</li>
            <li>100% confidential</li>
          </ul>
          <Link href="/view-all-therapist?help=1" className="tt-help"><i className="feather-compass" aria-hidden="true" /> Not sure who to pick? <b>Help me choose</b></Link>
        </div>
      </div>
    </section>
  );
}

const CSS = `
.tt-sec { position: relative; overflow: hidden; background: #0b2418; padding: 72px 0 56px; }
.tt-sec::before { content: ""; position: absolute; top: -80px; right: 4%; width: 380px; height: 380px; border-radius: 50%; background: rgba(30,122,76,.22); filter: blur(90px); pointer-events: none; }
.tt-sec .container { position: relative; z-index: 1; }
.tt-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 14px 24px; flex-wrap: wrap; margin-bottom: 22px; }
.tt-eyebrow { display: inline-flex; align-items: center; gap: 8px; margin: 0 0 10px; padding: 0; font-size: 12px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; color: #ecc77d; }
.tt-eyebrow::before { content: ""; width: 22px; height: 2px; background: #d4a24c; }
.tt-title { font-size: clamp(1.9rem, 3.6vw, 2.8rem); font-weight: 800; color: #fff; margin: 0 0 8px; line-height: 1.15; letter-spacing: -.02em; }
.tt-title span { color: #ecc77d; }
.tt-sub { font-size: 15.5px; color: rgba(255,255,255,.72); margin: 0; padding: 0; max-width: 60ch; }
.tt-all { display: inline-flex; align-items: center; gap: 8px; height: 46px; padding: 0 22px; border-radius: 12px; background: #1e7a4c; color: #fff !important; font-weight: 800; font-size: 14.5px; text-decoration: none !important; white-space: nowrap; box-shadow: 0 10px 22px -12px rgba(0,0,0,.6); }
.tt-all:hover { background: #22895a; }

.tt-controls { display: flex; align-items: center; justify-content: space-between; gap: 10px 20px; flex-wrap: wrap; margin-bottom: 18px; }
.tt-tabs, .tt-langs { display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; }
.tt-tabs::-webkit-scrollbar, .tt-langs::-webkit-scrollbar { display: none; }
.tt-tabs button { display: inline-flex; align-items: center; gap: 7px; height: 40px; padding: 0 16px; border-radius: 999px; border: 1px solid rgba(255,255,255,.2); background: rgba(255,255,255,.06); color: rgba(255,255,255,.85); font-size: 14px; font-weight: 700; cursor: pointer; white-space: nowrap; }
.tt-tabs button small { font-size: 11px; font-weight: 800; background: rgba(255,255,255,.14); border-radius: 999px; padding: 1px 7px; }
.tt-tabs button:hover { border-color: rgba(255,255,255,.4); }
.tt-tabs button.on { background: #fff; color: #14532d; border-color: #fff; }
.tt-tabs button.on small { background: #eef6f1; color: #1e7a4c; }
.tt-dot { width: 7px; height: 7px; border-radius: 50%; background: #34d27b; box-shadow: 0 0 0 3px rgba(52,210,123,.25); }
.tt-langs button { height: 32px; padding: 0 12px; border-radius: 8px; border: 1px solid transparent; background: none; color: rgba(255,255,255,.65); font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; }
.tt-langs button:hover { color: #fff; }
.tt-langs button.on { color: #ecc77d; border-color: rgba(236,199,125,.5); }

.tt-frame { position: relative; }
.tt-row-scroll { display: flex; gap: 18px; overflow-x: auto; scroll-snap-type: x mandatory; padding: 4px 2px 14px; scrollbar-width: none; scroll-padding-left: 2px; }
.tt-row-scroll::-webkit-scrollbar { display: none; }
.tt-arrow { position: absolute; top: 40%; z-index: 2; width: 44px; height: 44px; border-radius: 50%; border: none; background: #fff; color: #14532d; box-shadow: 0 10px 24px -8px rgba(0,0,0,.55); display: flex; align-items: center; justify-content: center; font-size: 20px; cursor: pointer; }
.tt-arrow.prev { left: -18px; } .tt-arrow.next { right: -18px; }
.tt-arrow:hover { background: #ecc77d; }

.tt-card { flex: 0 0 250px; scroll-snap-align: start; display: flex; flex-direction: column; background: #fff; border-radius: 18px; overflow: hidden; box-shadow: 0 18px 36px -22px rgba(0,0,0,.7); }
.tt-photo { position: relative; display: block; height: 230px; background: linear-gradient(150deg, #c3e8d2, #82cca1); overflow: hidden; }
.tt-photo img { width: 100%; height: 100%; object-fit: cover; object-position: top center; display: block; transition: transform .45s ease; }
.tt-card:hover .tt-photo img { transform: scale(1.04); }
.tt-init { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 40px; font-weight: 800; color: #1e7a4c; }
.tt-rate { position: absolute; left: 10px; bottom: 10px; display: inline-flex; align-items: center; gap: 4px; padding: 4px 9px; border-radius: 999px; background: rgba(255,255,255,.95); color: #0b1712; font-size: 12.5px; font-weight: 800; }
.tt-rate small { font-weight: 600; color: #64748b; }
.tt-rate.new { background: rgba(251,243,226,.97); color: #7a5413; font-size: 11.5px; }
.tt-pick { position: absolute; top: 10px; left: 10px; padding: 3px 9px; border-radius: 999px; background: rgba(236,199,125,.97); color: #14532d; font-size: 10.5px; font-weight: 800; cursor: help; }
.tt-body { flex: 1; display: flex; flex-direction: column; gap: 5px; padding: 13px 14px 14px; }
.tt-name { display: inline-flex; align-items: center; gap: 5px; max-width: 100%; color: #0b1712 !important; font-size: 16px; font-weight: 800; text-decoration: none !important; }
.tt-name span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tt-name:hover { color: #1e7a4c !important; }
.tt-role { font-size: 12.5px; font-weight: 700; color: #1e7a4c; }
.tt-meta { display: flex; flex-wrap: wrap; gap: 2px 10px; font-size: 12.5px; color: #475569; }
.tt-meta span + span::before { content: "·"; margin-right: 10px; color: #94a3b8; }
.tt-modes { display: flex; gap: 6px; flex-wrap: wrap; }
.tt-modes span { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 700; color: #14532d; background: #eef6f1; border-radius: 6px; padding: 2px 7px; }
.tt-modes span.ip { background: #fbf3e2; color: #7a5413; }
.tt-row { display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-top: 4px; padding-top: 8px; border-top: 1px dashed #e2e8e4; }
.tt-fee { font-size: 13px; color: #475569; }
.tt-fee b { color: #14532d; font-weight: 800; font-size: 14.5px; }
.tt-next { display: inline-flex; align-items: center; gap: 5px; font-size: 11.5px; font-weight: 700; color: #475569; white-space: nowrap; }
.tt-next i { width: 7px; height: 7px; border-radius: 50%; background: #94a3b8; }
.tt-next.today { color: #1e7a4c; }
.tt-next.today i { background: #22a35a; box-shadow: 0 0 0 3px rgba(34,163,90,.18); }
.tt-acts { display: flex; gap: 8px; margin-top: 8px; }
.tt-acts a { flex: 1; text-align: center; padding: 9px 0; border-radius: 10px; font-size: 13.5px; font-weight: 800; text-decoration: none !important; }
.tt-view { border: 1.5px solid #cfdcd4; color: #26463a !important; }
.tt-view:hover { border-color: #1e7a4c; color: #1e7a4c !important; }
.tt-book { background: #1e7a4c; color: #fff !important; }
.tt-book:hover { background: #186640; }

.tt-more { align-items: center; justify-content: center; text-align: center; gap: 8px; padding: 24px; background: rgba(255,255,255,.06); border: 1.5px dashed rgba(255,255,255,.3); box-shadow: none; text-decoration: none !important; }
.tt-more:hover { background: rgba(255,255,255,.1); }
.tt-more-ic { width: 54px; height: 54px; border-radius: 50%; background: #1e7a4c; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 22px; }
.tt-more b { color: #fff; font-size: 16px; }
.tt-more span:last-child { color: rgba(255,255,255,.65); font-size: 13px; }

.tt-empty { padding: 40px 16px; text-align: center; color: rgba(255,255,255,.8); border: 1px dashed rgba(255,255,255,.25); border-radius: 18px; }
.tt-empty p { margin: 0 0 10px; padding: 0; color: inherit; }
.tt-empty button { height: 40px; padding: 0 18px; border-radius: 10px; border: none; background: #fff; color: #14532d; font-weight: 800; cursor: pointer; }

.tt-foot { display: flex; align-items: center; justify-content: space-between; gap: 12px 24px; flex-wrap: wrap; margin-top: 18px; padding-top: 18px; border-top: 1px solid rgba(255,255,255,.1); }
.tt-trust { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 8px 22px; font-size: 13.5px; color: rgba(255,255,255,.7); }
.tt-trust li { display: inline-flex; align-items: center; gap: 5px; margin: 0; }
.tt-trust li::before { content: none; }
.tt-trust b { color: #fff; }
.tt-trust a { display: inline-flex; align-items: center; gap: 5px; color: inherit !important; text-decoration: none !important; }
.tt-trust a:hover { color: #ecc77d !important; }
.tt-help { display: inline-flex; align-items: center; gap: 7px; height: 40px; padding: 0 16px; border-radius: 999px; border: 1px solid rgba(236,199,125,.55); background: rgba(212,162,76,.14); color: #fff !important; font-size: 13.5px; text-decoration: none !important; }
.tt-help b { color: #ecc77d; }
.tt-help:hover { background: rgba(212,162,76,.26); }

@media (max-width: 991px) { .tt-arrow { display: none; } }
@media (max-width: 767px) {
  .tt-sec { padding: 48px 0 40px; }
  .tt-all { display: none; }
  .tt-controls { flex-direction: column; align-items: stretch; margin-bottom: 14px; }
  .tt-tabs, .tt-langs { margin: 0 -16px; padding: 0 16px; }
  .tt-tabs button { height: 38px; font-size: 13.5px; padding: 0 14px; }
  .tt-row-scroll { margin: 0 -16px; padding: 4px 16px 12px; scroll-padding-left: 16px; gap: 12px; }
  .tt-card { flex-basis: 72%; }
  .tt-photo { height: 210px; }
  .tt-card:hover .tt-photo img { transform: none; }
  .tt-trust { font-size: 12.5px; gap: 6px 16px; }
  .tt-help { width: 100%; justify-content: center; }
}
@media (prefers-reduced-motion: reduce) { .tt-photo img { transition: none; } }
`;
