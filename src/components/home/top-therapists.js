import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { imagePath } from "../../utils/url";
import { profilePath, bookPath } from "../../utils/therapist-slug";
import { thumb, thumbSet } from "../../utils/thumb";
import { split, getMinFee, sessionModes, nextAvailable } from "../../utils/therapist-directory";

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
  const photo = t.user?.profile ? `${imagePath}/${t.user.profile}` : "";
  const [broken, setBroken] = useState(false);
  const href = profilePath(t);
  const tab = hidden ? -1 : undefined;
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const exp = expLabel(t.year_of_exp);
  const langs = split(t.language_spoken).slice(0, 2).join(", ");
  return (
    <article className="tt-card">
      {/* same as the home banner's therapist card on phones: white card, photo on top, details + Book now below */}
      <div className="tt-photo">
        {photo && !broken
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={thumb(photo, 640, 90)} srcSet={`${thumb(photo, 640, 90)} 1x, ${thumb(photo, 1080, 90)} 2x`} alt={name} loading="lazy" decoding="async" width="246" height="190" onError={() => setBroken(true)} />
          : <span className="tt-init" aria-hidden="true"><span>{initials || "C"}</span></span>}
      </div>
      <div className="tt-info">
        <Link href={href} className="tt-name tt-stretch" tabIndex={tab}>
          <span>{name}</span><span className="tt-sr">, {t.profile_type || "Psychologist"}</span><svg viewBox="0 0 24 24" width="17" height="17" fill="#1d9bf0" style={{ flexShrink: 0 }} aria-hidden="true"><path d="m23 12-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.96 8.6 1.5 6.71 4.69 3.1 5.5l.34 3.7L1 12l2.44 2.79-.34 3.7 3.61.82L8.6 22.5l3.4-1.47 3.4 1.46 1.89-3.19 3.61-.82-.34-3.69L23 12zm-12.91 4.72-3.8-3.81 1.48-1.48 2.32 2.33 5.85-5.87 1.48 1.48-7.33 7.35z" /></svg>
        </Link>
        <div className="tt-role">{t.profile_type || "Mental Health Professional"}</div>
        <div className="tt-meta">
          <span className="tt-rate">{r ? <><svg className="cyt-star" viewBox="0 0 24 24" width="15" height="15" fill="#e3a83a" aria-hidden="true"><path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg><span className="tt-num">{r.avg.toFixed(1)}</span> ({r.count})</> : <span className="tt-num">New</span>}</span>
          {exp && <span>{exp}</span>}
          {langs && <span>{langs}</span>}
        </div>
        <div className="tt-row">
          {fee ? <span className="tt-fee"><small>Session from</small><span className="tt-num">₹{fee.toLocaleString("en-IN")}</span></span> : <span />}
          <Link href={bookPath(t)} className="tt-book" tabIndex={tab}>Book now<span className="tt-sr"> with {name}</span></Link>
        </div>
      </div>
    </article>
  );
}

export default function TopTherapists({ people = [], visitorState = null, total = 0 }) {
  const [now, setNow] = useState(null);
  useEffect(() => { setNow(Date.now()); }, []);
  const [tab, setTab] = useState("all");
  // every live psychologist, in a fresh random order on each visit (shuffled after load, so the server HTML is stable)
  const [order, setOrder] = useState(null);
  useEffect(() => {
    const ids = people.map((t) => String(t._id));
    for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; }
    setOrder(new Map(ids.map((id, i) => [id, i])));
  }, [people]);
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
    const all = order ? [...byLang].sort((a, b) => (order.get(String(a._id)) ?? 0) - (order.get(String(b._id)) ?? 0)) : [...byLang].sort(byPriority);
    return { all, top, today, near, inPerson };
  }, [people, lang, now, visitorState, order]);

  const nearLabel = visitorState ? (/delhi/i.test(visitorState) ? "Delhi" : visitorState) : "";
  const TABS = [
    { key: "all", label: "All", n: lists.all.length },
    { key: "top", label: "Top rated", n: lists.top.length },
    // "Available today" is off: therapists don't keep their weekly availability current
    { key: "today", label: "Available today", n: lists.today.length, hide: true },
    { key: "near", label: `Near you · ${nearLabel}`, n: lists.near.length, hide: lists.near.length < 2 && tab !== "near" },
    { key: "inPerson", label: "In-person", n: lists.inPerson.length },
  ].filter((x) => !x.hide);
  const shown = lists[tab] || [];

  // new tab / language -> back to the start of the row
  useEffect(() => { rowRef.current?.scrollTo({ left: 0 }); onRowScroll(); }, [tab, lang]); // eslint-disable-line react-hooks/exhaustive-deps
  // the row moves on by itself, one card every few seconds — paused while someone hovers, touches or tabs into it,
  // when it's off screen or the tab is hidden, and never for people who prefer reduced motion
  const pauseUntil = useRef(0);
  const hold = (ms = 8000) => { pauseUntil.current = Date.now() + ms; };
  useEffect(() => {
    const el = rowRef.current;
    if (!el || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;
    let visible = false;
    const io = "IntersectionObserver" in window ? new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.3 }) : null;
    io?.observe(el);
    const timer = setInterval(() => {
      if (!visible || document.hidden || Date.now() < pauseUntil.current) return;
      const card = el.querySelector(".tt-card");
      const step = (card?.getBoundingClientRect().width || 250) + 18;
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 8) el.scrollTo({ left: 0, behavior: "smooth" });
      else el.scrollBy({ left: step, behavior: "smooth" });
    }, 3800);
    return () => { clearInterval(timer); io?.disconnect(); };
  }, [tab, lang]);
  const slide = (dir) => {
    hold(10000);
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
              <div className="tt-row-scroll" ref={rowRef} role="tabpanel" onScroll={onRowScroll}
                onMouseEnter={() => hold(600000)} onMouseLeave={() => hold(1500)} onTouchStart={() => hold(10000)} onFocus={() => hold(15000)}>
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

        <Link href="/view-all-therapist" className="tt-all tt-all-m">Browse all {total || ""} psychologists <i className="feather-arrow-right" aria-hidden="true" /></Link>

      </div>
    </section>
  );
}

const CSS = `
.tt-sec { position: relative; overflow: hidden; padding: 72px 0 52px;
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
.tt-all-m { display: none; }
.tt-all i { transition: transform .2s ease; } .tt-all:hover i { transform: translateX(3px); }

/* filters: plain text tabs (gold underline when on) — no pill boxes, so the section stays short */
.tt-controls { display: flex; align-items: center; gap: 4px 18px; flex-wrap: wrap; margin-bottom: 18px; border-bottom: 1px solid rgba(255,255,255,.12); }
.tt-tabs, .tt-langs { display: flex; align-items: center; gap: 2px; overflow-x: auto; scrollbar-width: none; }
.tt-tabs::-webkit-scrollbar, .tt-langs::-webkit-scrollbar { display: none; }
.tt-langs { margin-left: auto; padding-left: 14px; border-left: 1px solid rgba(255,255,255,.14); }
.tt-tabs button, .tt-langs button { position: relative; display: inline-flex; align-items: center; gap: 6px; height: 38px; padding: 0 12px; border: 0; border-radius: 0; background: none;
  color: #b9cdc1; font-size: 14px; font-weight: 700; cursor: pointer; white-space: nowrap; transition: color .2s ease; }
.tt-langs button { font-size: 13px; padding: 0 10px; }
.tt-tabs button::after, .tt-langs button::after { content: ""; position: absolute; left: 10px; right: 10px; bottom: -1px; height: 2px; border-radius: 2px; background: #ecc77d; transform: scaleX(0); transition: transform .25s ease; }
.tt-tabs button:hover, .tt-langs button:hover { color: #fff; }
.tt-tabs button.on, .tt-langs button.on { color: #fff; }
.tt-tabs button.on::after, .tt-langs button.on::after { transform: scaleX(1); }
.tt-langs button.on { color: #ecc77d; }
.tt-tabs button small { font-size: 12px; font-weight: 700; color: #8fae9c; }
.tt-tabs button.on small { color: #ecc77d; }
.tt-dot { width: 7px; height: 7px; border-radius: 50%; background: #34d27b; box-shadow: 0 0 0 3px rgba(52,210,123,.25); }

.tt-frame { position: relative; }
.tt-row-scroll { display: flex; gap: 20px; overflow-x: auto; scroll-snap-type: x mandatory; padding: 6px 2px 18px; scrollbar-width: none; scroll-padding-left: 2px;
  -webkit-mask-image: linear-gradient(90deg, #000 calc(100% - 64px), transparent); mask-image: linear-gradient(90deg, #000 calc(100% - 64px), transparent); }
.tt-row-scroll::-webkit-scrollbar { display: none; }
.tt-arrow { position: absolute; top: 38%; z-index: 3; width: 46px; height: 46px; border-radius: 50%; border: 1px solid rgba(255,255,255,.18); background: rgba(11,36,24,.75); color: #fff; backdrop-filter: blur(6px); box-shadow: 0 12px 26px -10px rgba(0,0,0,.7); display: flex; align-items: center; justify-content: center; font-size: 20px; cursor: pointer; transition: background .2s ease, color .2s ease, transform .2s ease; }
.tt-arrow.prev { left: -26px; } .tt-arrow.next { right: -26px; }
.tt-arrow:hover { background: #ecc77d; color: #14532d; transform: scale(1.06); }
.tt-track { position: relative; height: 4px; border-radius: 99px; background: rgba(255,255,255,.1); margin: 4px auto 0; max-width: 320px; overflow: hidden; }
.tt-track span { position: absolute; top: 0; bottom: 0; border-radius: 99px; background: linear-gradient(90deg, #22895a, #ecc77d); transition: left .15s linear, width .2s ease; }

.tt-card { position: relative; flex: 0 0 262px; scroll-snap-align: start; display: flex; flex-direction: column; padding: 8px; background: #fff; border-radius: 22px;
  box-shadow: 0 22px 40px -24px rgba(0,0,0,.8); transition: transform .3s ease, box-shadow .3s ease; }
.tt-card:hover { transform: translateY(-6px); box-shadow: 0 30px 52px -26px rgba(0,0,0,.85); }
.tt-photo { position: relative; height: 190px; border-radius: 16px; overflow: hidden; background: #e6efe9; flex: none; }
.tt-photo img { width: 100%; height: 100%; object-fit: cover; object-position: center 22%; display: block; transition: transform .6s ease; }
.tt-card:hover .tt-photo img { transform: scale(1.04); }
.tt-init { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle at 30% 25%, #2a8a58 0, #14532d 60%, #0b2418 100%); }
.tt-init span { width: 88px; height: 88px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 800; color: #14532d; background: linear-gradient(135deg, #fbf1dc, #ecc77d); }
.tt-info { flex: 1; display: flex; flex-direction: column; padding: 12px 8px 6px; }
.tt-name { display: flex; align-items: center; gap: 5px; color: #0b1712 !important; font-size: 16px; font-weight: 800; line-height: 1.25; text-decoration: none !important; }
.tt-name span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tt-name:hover { color: #1e7a4c !important; }
.tt-role { margin-top: 1px; color: #55665c; font-size: 13.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tt-meta { display: flex; align-items: center; flex-wrap: nowrap; margin-top: 8px; color: #55665c; font-size: 13px; white-space: nowrap; overflow: hidden; }
.tt-meta > span + span::before { content: "·"; margin: 0 6px; color: #9fb3a6; }
.tt-rate { display: inline-flex; align-items: center; gap: 3px; }
.tt-rate .tt-num { color: #0b1712; font-weight: 800; }
.tt-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: auto; padding-top: 10px; border-top: 1px solid #eef2ee; }
.tt-meta { margin-bottom: 10px; }
.tt-fee small { display: block; color: #7c8b81; font-size: 11.5px; line-height: 1.2; }
.tt-fee .tt-num { display: block; color: #0b1712; font-size: 18px; font-weight: 800; line-height: 1.2; }
.tt-book { position: relative; z-index: 2; flex: none; min-height: 44px; display: inline-flex; align-items: center; padding: 0 20px; border-radius: 12px; background: #1e7a4c; color: #fff !important;
  font-size: 14.5px; font-weight: 800; text-decoration: none !important; transition: background .2s ease; }
.tt-book:hover { background: #14532d; }

.tt-more { flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 10px; padding: 26px; background: linear-gradient(160deg, rgba(255,255,255,.08), rgba(255,255,255,.02)); border: 1.5px dashed rgba(236,199,125,.45); box-shadow: none; text-decoration: none !important; }
.tt-more:hover { background: rgba(255,255,255,.1); box-shadow: none; }
.tt-more-ic { width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #f3d48f, #d4a24c); color: #14532d; display: flex; align-items: center; justify-content: center; font-size: 24px; }
.tt-more .tt-more-a { color: #fff !important; font-size: 17px; font-weight: 800; text-decoration: none !important; }
.tt-stretch::after { content: ""; position: absolute; inset: 0; z-index: 1; }
.tt-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.tt-more span:last-child { color: #c9dbd0; font-size: 13.5px; }

.tt-empty { padding: 40px 16px; text-align: center; color: #d6e5dc; border: 1px dashed rgba(255,255,255,.25); border-radius: 18px; }
.tt-empty p { margin: 0 0 10px; padding: 0; color: inherit; }
.tt-empty button { height: 40px; padding: 0 18px; border-radius: 10px; border: none; background: #fff; color: #14532d; font-weight: 800; cursor: pointer; }


@media (max-width: 1240px) { .tt-arrow.prev { left: -8px; } .tt-arrow.next { right: -8px; } }
@media (max-width: 991px) { .tt-arrow { display: none; } }
@media (max-width: 767px) {
  .tt-sec { padding: 48px 0 44px; }
  .tt-all { display: none; }
  .tt-all.tt-all-m { display: flex; justify-content: center; width: 100%; margin: 14px 0 0; }
  /* heading: like every other home section on phones — left-aligned, full width */
  .tt-head { margin-bottom: 20px; }
  .tt-head > div { width: 100%; }
  .tt-title { font-size: 24px; line-height: 1.25; margin: 0 0 8px; }
  .tt-sub { font-size: 15px; line-height: 1.6; max-width: none; }
  /* phones: tabs and languages share one sideways-scrolling line */
  .tt-controls { flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; margin: 0 -16px 14px; padding: 0 16px; gap: 0 12px; }
  .tt-controls::-webkit-scrollbar { display: none; }
  .tt-tabs, .tt-langs { flex: none; overflow: visible; }
  .tt-langs { margin-left: 0; padding-left: 10px; }
  .tt-tabs button { height: 36px; font-size: 13.5px; padding: 0 9px; }
  .tt-langs button { height: 36px; padding: 0 8px; }
  .tt-row-scroll { margin: 0 -16px; padding: 6px 16px 16px; scroll-padding-left: 16px; gap: 14px; -webkit-mask-image: none; mask-image: none; }
  .tt-card { flex-basis: 72%; max-width: 262px; }
  .tt-card:hover { transform: none; }
  .tt-card:hover .tt-photo img { transform: none; }
}
@media (prefers-reduced-motion: reduce) { .tt-photo img, .tt-card, .tt-arrow, .tt-track span { transition: none; } }
`;
