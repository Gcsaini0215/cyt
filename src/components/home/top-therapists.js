import React, { useEffect, useMemo, useRef, useState } from "react";
import { usePublicStats, sessionsText, ratingText, reviewsText } from "../../utils/public-stats";
import Link from "next/link";
import VerifiedRounded from "@mui/icons-material/VerifiedRounded";
import Star from "@mui/icons-material/Star";
import { imagePath } from "../../utils/url";
import { profilePath, bookPath } from "../../utils/therapist-slug";
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
  const photo = t.user?.profile ? `${imagePath}/${t.user.profile}` : "";
  const [broken, setBroken] = useState(false);
  const href = profilePath(t);
  const tab = hidden ? -1 : undefined;
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <article className="tt-card">
      {/* one link per card: the name, stretched over the whole card (+ the Book button) */}
      <div className="tt-photo">
        {photo && !broken
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={thumb(photo, 384)} srcSet={thumbSet(photo, 384, 640)} alt={name} loading="lazy" decoding="async" width="270" height="250" onError={() => setBroken(true)} />
          : <span className="tt-init" aria-hidden="true"><b>{initials || "C"}</b></span>}
        <span className="tt-shade" aria-hidden="true" />
        {isTop(t) && <span className="tt-pick" title="Handpicked by the CYT team">★ Top Pick</span>}
        <span className={`tt-rate${r ? "" : " new"}`}>
          {r ? <><Star sx={{ fontSize: 14, color: "#ecc77d" }} /> {r.avg.toFixed(1)} <small>· {r.count} review{r.count === 1 ? "" : "s"}</small></> : "New on CYT"}
        </span>
        <div className="tt-modes">
          {modes.online && <span><i className="feather-video" aria-hidden="true" /> Online</span>}
          {modes.inPerson && <span><i className="feather-map-pin" aria-hidden="true" /> In-person</span>}
        </div>
      </div>
      <div className="tt-body">
        <Link href={href} className="tt-name tt-stretch" tabIndex={tab}>
          <span>{name}</span><span className="tt-sr">, {t.profile_type || "Psychologist"}</span><VerifiedRounded sx={{ fontSize: 17, color: "#1d9bf0", flexShrink: 0 }} />
        </Link>
        <div className="tt-role">{t.profile_type || "Psychologist"}</div>
        <ul className="tt-meta">
          {expLabel(t.year_of_exp) && <li><i className="feather-briefcase" aria-hidden="true" /> {expLabel(t.year_of_exp)} experience</li>}
          {langs.length > 0 && <li><i className="feather-message-circle" aria-hidden="true" /> {langs.join(", ")}</li>}
        </ul>
        <div className="tt-fee">
          {fee ? <><span>Session from</span><b>₹{fee.toLocaleString("en-IN")}</b></> : <span>Fees on request</span>}
        </div>
        <div className="tt-acts">
          <span className="tt-view" aria-hidden="true">View profile</span>
          <Link href={bookPath(t)} className="tt-book" tabIndex={tab}>Book <i className="feather-arrow-right" aria-hidden="true" /><span className="tt-sr"> a session with {name}</span></Link>
        </div>
      </div>
    </article>
  );
}

export default function TopTherapists({ people = [], visitorState = null, total = 0 }) {
  const ps = usePublicStats();
  const [now, setNow] = useState(null);
  useEffect(() => { setNow(Date.now()); }, []);
  const [tab, setTab] = useState("top");
  const [lang, setLang] = useState("");
  const rowRef = useRef(null);
  const [prog, setProg] = useState({ at: 0, size: 1 });
  const onRowScroll = () => {
    const el = rowRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProg({ at: max > 0 ? el.scrollLeft / max : 0, size: Math.min(1, el.clientWidth / Math.max(1, el.scrollWidth)) });
  };

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
    // "Available today" is off: therapists don't keep their weekly availability current
    { key: "today", label: "Available today", n: lists.today.length, hide: true },
    { key: "near", label: `Near you · ${nearLabel}`, n: lists.near.length, hide: lists.near.length < 2 && tab !== "near" },
    { key: "inPerson", label: "In-person", n: lists.inPerson.length },
  ].filter((x) => !x.hide);
  const shown = (lists[tab] || []).slice(0, 16);

  // new tab / language -> back to the start of the row
  useEffect(() => { rowRef.current?.scrollTo({ left: 0 }); onRowScroll(); }, [tab, lang]); // eslint-disable-line react-hooks/exhaustive-deps
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
            <p className="tt-sub">Some of the best psychologists in India, chosen by Choose Your Therapist — real ratings from clients, fees upfront, online or in person.</p>
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
              <div className="tt-row-scroll" ref={rowRef} role="tabpanel" onScroll={onRowScroll}>
                {shown.map((t) => <Card key={t._id} t={t} now={now} />)}
                <div className="tt-card tt-more">
                  <span className="tt-more-ic" aria-hidden="true"><i className="feather-users" /></span>
                  <Link href="/view-all-therapist" className="tt-stretch tt-more-a">See all {total || ""} psychologists</Link>
                  <span>Filter by concern, language, fees and more</span>
                </div>
              </div>
              <button type="button" className="tt-arrow next" onClick={() => slide(1)} aria-label="More psychologists"><i className="feather-chevron-right" /></button>
              <div className="tt-track" aria-hidden="true">
                <span style={{ width: `${Math.max(12, prog.size * 100)}%`, left: `${prog.at * (100 - Math.max(12, prog.size * 100))}%` }} />
              </div>
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
            <li><i className="feather-user-check" aria-hidden="true" /><div><b>{total || "50+"}</b><span>verified psychologists</span></div></li>
            <li><a href={GBP_URL} target="_blank" rel="noreferrer"><Star sx={{ fontSize: 20, color: "#ecc77d" }} /><div><b>{ratingText(ps)} ★</b><span>on Google · {reviewsText(ps)} reviews</span></div></a></li>
            <li><i className="feather-calendar" aria-hidden="true" /><div><b>{sessionsText(ps)}</b><span>sessions on CYT</span></div></li>
            <li><i className="feather-lock" aria-hidden="true" /><div><b>100%</b><span>confidential</span></div></li>
          </ul>
          <Link href="/view-all-therapist?help=1" className="tt-help" rel="nofollow"><i className="feather-compass" aria-hidden="true" /> Not sure who to pick? <b>Help me choose</b></Link>
        </div>
      </div>
    </section>
  );
}

const CSS = `
.tt-sec { position: relative; overflow: hidden; padding: 80px 0 64px;
  background: radial-gradient(circle at 88% 0%, rgba(30,122,76,.38) 0, transparent 42%), radial-gradient(circle at 0% 100%, rgba(212,162,76,.16) 0, transparent 40%), linear-gradient(180deg, #0b2418 0%, #0d2b1d 100%); }
.tt-sec::before { content: ""; position: absolute; inset: 0; pointer-events: none; opacity: .5;
  background-image: radial-gradient(rgba(236,199,125,.18) 1px, transparent 1px); background-size: 26px 26px;
  -webkit-mask-image: linear-gradient(180deg, #000, transparent 70%); mask-image: linear-gradient(180deg, #000, transparent 70%); }
.tt-sec .container { position: relative; z-index: 1; }
.tt-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px 28px; flex-wrap: wrap; margin-bottom: 26px; }
.tt-eyebrow { display: inline-flex; align-items: center; gap: 10px; margin: 0 0 12px; padding: 0; font-size: 12px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; color: #ecc77d; }
.tt-eyebrow::before { content: ""; width: 26px; height: 2px; background: #d4a24c; }
.tt-title { font-size: clamp(1.95rem, 3.6vw, 2.9rem); font-weight: 800; color: #fff; margin: 0 0 10px; line-height: 1.12; letter-spacing: -.02em; }
.tt-title span { color: #ecc77d; }
.tt-sub { font-size: 16px; line-height: 1.6; color: #c9dbd0; margin: 0; padding: 0; max-width: 60ch; }
.tt-all { display: inline-flex; align-items: center; gap: 8px; height: 48px; padding: 0 22px; border-radius: 999px; background: linear-gradient(135deg, #22895a, #1e7a4c 60%, #14532d); color: #fff !important; font-weight: 800; font-size: 14.5px; text-decoration: none !important; white-space: nowrap; box-shadow: 0 14px 28px -14px rgba(0,0,0,.7), inset 0 0 0 1px rgba(255,255,255,.12); transition: transform .2s ease; }
.tt-all:hover { transform: translateY(-2px); }
.tt-all i { transition: transform .2s ease; } .tt-all:hover i { transform: translateX(3px); }

.tt-controls { display: flex; align-items: center; justify-content: space-between; gap: 12px 20px; flex-wrap: wrap; margin-bottom: 22px; }
.tt-tabs, .tt-langs { display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; }
.tt-tabs::-webkit-scrollbar, .tt-langs::-webkit-scrollbar { display: none; }
.tt-tabs { padding: 5px; border-radius: 999px; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.12); }
.tt-tabs button { display: inline-flex; align-items: center; gap: 7px; height: 38px; padding: 0 16px; border-radius: 999px; border: 0; background: none; color: #d6e5dc; font-size: 14px; font-weight: 700; cursor: pointer; white-space: nowrap; transition: background .2s ease, color .2s ease; }
.tt-tabs button small { font-size: 11px; font-weight: 800; background: rgba(255,255,255,.14); color: #fff; border-radius: 999px; padding: 1px 8px; }
.tt-tabs button:hover { color: #fff; }
.tt-tabs button.on { background: #fff; color: #14532d; box-shadow: 0 6px 16px -8px rgba(0,0,0,.6); }
.tt-tabs button.on small { background: #e6f3ea; color: #1e7a4c; }
.tt-dot { width: 7px; height: 7px; border-radius: 50%; background: #34d27b; box-shadow: 0 0 0 3px rgba(52,210,123,.25); }
.tt-langs button { height: 34px; padding: 0 14px; border-radius: 999px; border: 1px solid rgba(255,255,255,.14); background: none; color: #c9dbd0; font-size: 13px; font-weight: 700; cursor: pointer; white-space: nowrap; transition: border-color .2s ease, color .2s ease, background .2s ease; }
.tt-langs button:hover { color: #fff; border-color: rgba(255,255,255,.35); }
.tt-langs button.on { color: #14532d; background: #ecc77d; border-color: #ecc77d; }

.tt-frame { position: relative; }
.tt-row-scroll { display: flex; gap: 20px; overflow-x: auto; scroll-snap-type: x mandatory; padding: 6px 2px 18px; scrollbar-width: none; scroll-padding-left: 2px;
  -webkit-mask-image: linear-gradient(90deg, #000 calc(100% - 64px), transparent); mask-image: linear-gradient(90deg, #000 calc(100% - 64px), transparent); }
.tt-row-scroll::-webkit-scrollbar { display: none; }
.tt-arrow { position: absolute; top: 38%; z-index: 3; width: 46px; height: 46px; border-radius: 50%; border: 1px solid rgba(255,255,255,.18); background: rgba(11,36,24,.75); color: #fff; backdrop-filter: blur(6px); box-shadow: 0 12px 26px -10px rgba(0,0,0,.7); display: flex; align-items: center; justify-content: center; font-size: 20px; cursor: pointer; transition: background .2s ease, color .2s ease, transform .2s ease; }
.tt-arrow.prev { left: -26px; } .tt-arrow.next { right: -26px; }
.tt-arrow:hover { background: #ecc77d; color: #14532d; transform: scale(1.06); }
.tt-track { position: relative; height: 4px; border-radius: 99px; background: rgba(255,255,255,.1); margin: 4px auto 0; max-width: 320px; overflow: hidden; }
.tt-track span { position: absolute; top: 0; bottom: 0; border-radius: 99px; background: linear-gradient(90deg, #22895a, #ecc77d); transition: left .15s linear, width .2s ease; }

.tt-card { position: relative; flex: 0 0 270px; scroll-snap-align: start; display: flex; flex-direction: column; background: #fff; border-radius: 22px; overflow: hidden;
  box-shadow: 0 22px 44px -26px rgba(0,0,0,.85); transition: transform .3s ease, box-shadow .3s ease; }
.tt-card:hover { transform: translateY(-6px); box-shadow: 0 30px 56px -28px rgba(0,0,0,.9), 0 0 0 2px rgba(236,199,125,.55); }
.tt-photo { position: relative; display: block; height: 250px; background: linear-gradient(150deg, #1e7a4c, #0b2418); overflow: hidden; }
.tt-photo img { width: 100%; height: 100%; object-fit: cover; object-position: top center; display: block; transition: transform .6s ease; }
.tt-card:hover .tt-photo img { transform: scale(1.06); }
.tt-shade { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(8,28,18,.78) 100%); pointer-events: none; }
.tt-init { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  background: radial-gradient(circle at 30% 25%, #2a8a58 0, #14532d 55%, #0b2418 100%); }
.tt-init b { width: 104px; height: 104px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 38px; font-weight: 800; letter-spacing: 1px;
  color: #14532d; background: linear-gradient(135deg, #fbf1dc, #ecc77d); box-shadow: 0 0 0 6px rgba(236,199,125,.25); }
.tt-pick { position: absolute; top: 12px; left: 12px; z-index: 1; padding: 4px 10px; border-radius: 999px; background: linear-gradient(135deg, #f3d48f, #d4a24c); color: #14532d; font-size: 11px; font-weight: 800; letter-spacing: .02em; cursor: help; box-shadow: 0 6px 14px -6px rgba(0,0,0,.5); }
.tt-rate { position: absolute; top: 12px; right: 12px; z-index: 1; display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 999px;
  background: rgba(11,36,24,.66); backdrop-filter: blur(6px); color: #fff; font-size: 12.5px; font-weight: 800; border: 1px solid rgba(255,255,255,.18); }
.tt-rate small { font-weight: 600; color: #d6e5dc; }
.tt-rate.new { background: rgba(251,243,226,.95); color: #7a5413; font-size: 11.5px; border-color: transparent; }
.tt-modes { position: absolute; left: 12px; bottom: 12px; right: 12px; z-index: 1; display: flex; gap: 6px; flex-wrap: wrap; }
.tt-modes span { display: inline-flex; align-items: center; gap: 5px; font-size: 11.5px; font-weight: 800; color: #fff; background: rgba(255,255,255,.16); border: 1px solid rgba(255,255,255,.28); backdrop-filter: blur(6px); border-radius: 999px; padding: 3px 10px; }
.tt-body { flex: 1; display: flex; flex-direction: column; gap: 6px; padding: 16px 16px 16px; }
.tt-name { display: inline-flex; align-items: center; gap: 6px; max-width: 100%; color: #0b1712 !important; font-size: 17px; font-weight: 800; letter-spacing: -.01em; text-decoration: none !important; }
.tt-name span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tt-name:hover { color: #1e7a4c !important; }
.tt-role { font-size: 13px; font-weight: 700; color: #1e7a4c; }
.tt-meta { list-style: none; margin: 4px 0 0; padding: 0; display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: #3d4d44; }
.tt-meta li { display: flex; align-items: center; gap: 7px; margin: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.tt-meta li::before { content: none; }
.tt-meta i { color: #a86e0e; font-size: 13px; flex: none; }
.tt-fee { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; margin-top: 8px; padding: 10px 12px; border-radius: 12px; background: #f4f8f5; }
.tt-fee span { font-size: 12.5px; color: #4b5b53; font-weight: 600; }
.tt-fee b { font-size: 18px; font-weight: 900; color: #14532d; letter-spacing: -.01em; }
.tt-acts { display: flex; gap: 8px; margin-top: 10px; }
.tt-acts a, .tt-acts .tt-view { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 42px; border-radius: 12px; font-size: 13.5px; font-weight: 800; text-decoration: none !important; }
.tt-view { border: 1.5px solid #cfdcd4; color: #26463a !important; transition: border-color .2s ease, color .2s ease; }
.tt-card:hover .tt-view { border-color: #1e7a4c; color: #1e7a4c !important; }
.tt-book { background: linear-gradient(135deg, #22895a, #1e7a4c 55%, #14532d); color: #fff !important; box-shadow: 0 8px 18px -10px rgba(20,83,45,.9); }
.tt-book i { transition: transform .2s ease; } .tt-book:hover i { transform: translateX(3px); }

.tt-more { align-items: center; justify-content: center; text-align: center; gap: 10px; padding: 26px; background: linear-gradient(160deg, rgba(255,255,255,.08), rgba(255,255,255,.02)); border: 1.5px dashed rgba(236,199,125,.45); box-shadow: none; text-decoration: none !important; }
.tt-more:hover { background: rgba(255,255,255,.1); box-shadow: none; }
.tt-more-ic { width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #f3d48f, #d4a24c); color: #14532d; display: flex; align-items: center; justify-content: center; font-size: 24px; }
.tt-more .tt-more-a { color: #fff !important; font-size: 17px; font-weight: 800; text-decoration: none !important; }
.tt-stretch::after { content: ""; position: absolute; inset: 0; z-index: 1; }
.tt-acts .tt-book { position: relative; z-index: 2; }
.tt-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.tt-more span:last-child { color: #c9dbd0; font-size: 13.5px; }

.tt-empty { padding: 40px 16px; text-align: center; color: #d6e5dc; border: 1px dashed rgba(255,255,255,.25); border-radius: 18px; }
.tt-empty p { margin: 0 0 10px; padding: 0; color: inherit; }
.tt-empty button { height: 40px; padding: 0 18px; border-radius: 10px; border: none; background: #fff; color: #14532d; font-weight: 800; cursor: pointer; }

.tt-foot { display: flex; align-items: center; justify-content: space-between; gap: 16px 24px; flex-wrap: wrap; margin-top: 30px; }
.tt-trust { list-style: none; margin: 0; padding: 0; flex: 1 1 640px; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
.tt-trust li { margin: 0; display: flex; }
.tt-trust li::before { content: none; }
.tt-trust li > i, .tt-trust li > a > svg { flex: none; }
.tt-trust li, .tt-trust a { align-items: center; gap: 12px; }
.tt-trust li { padding: 12px 14px; border-radius: 16px; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.12); }
.tt-trust li > i { width: 38px; height: 38px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: rgba(236,199,125,.16); color: #ecc77d; font-size: 17px; }
.tt-trust a { display: flex; color: inherit !important; text-decoration: none !important; width: 100%; }
.tt-trust a > svg { width: 38px !important; height: 38px !important; padding: 9px; border-radius: 12px; background: rgba(236,199,125,.16); }
.tt-trust div { display: flex; flex-direction: column; min-width: 0; }
.tt-trust b { color: #fff; font-size: 17px; font-weight: 800; line-height: 1.2; }
.tt-trust span { color: #c9dbd0; font-size: 12.5px; line-height: 1.3; }
.tt-trust a:hover b { color: #ecc77d; }
.tt-help { display: inline-flex; align-items: center; gap: 8px; height: 48px; padding: 0 20px; border-radius: 999px; border: 1px solid rgba(236,199,125,.6); background: rgba(212,162,76,.16); color: #fff !important; font-size: 14px; text-decoration: none !important; white-space: nowrap; transition: background .2s ease; }
.tt-help b { color: #ecc77d; }
.tt-help:hover { background: rgba(212,162,76,.3); }

@media (max-width: 1240px) { .tt-arrow.prev { left: -8px; } .tt-arrow.next { right: -8px; } }
@media (max-width: 991px) { .tt-arrow { display: none; } .tt-trust { grid-template-columns: repeat(2, minmax(0, 1fr)); flex-basis: 100%; } .tt-help { width: 100%; justify-content: center; } }
@media (max-width: 767px) {
  .tt-sec { padding: 52px 0 88px; }
  .tt-all { display: none; }
  .tt-sub { font-size: 15px; }
  .tt-controls { flex-direction: column; align-items: stretch; margin-bottom: 16px; }
  .tt-tabs { margin: 0; align-self: flex-start; max-width: 100%; }
  .tt-langs { margin: 0 -16px; padding: 0 16px; }
  .tt-tabs button { height: 36px; font-size: 13.5px; padding: 0 13px; }
  .tt-row-scroll { margin: 0 -16px; padding: 6px 16px 16px; scroll-padding-left: 16px; gap: 14px; -webkit-mask-image: none; mask-image: none; }
  .tt-card { flex-basis: 80%; }
  .tt-photo { height: 240px; }
  .tt-card:hover { transform: none; }
  .tt-card:hover .tt-photo img { transform: none; }
  .tt-trust li { padding: 10px 12px; gap: 10px; }
  .tt-trust b { font-size: 16px; }
  .tt-trust span { font-size: 12px; }
}
@media (prefers-reduced-motion: reduce) { .tt-photo img, .tt-card, .tt-arrow, .tt-track span { transition: none; } }
`;
