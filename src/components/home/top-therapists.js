import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { imagePath } from "../../utils/url";
import { profilePath, bookPath } from "../../utils/therapist-slug";
import { thumb, thumbSet } from "../../utils/thumb";
import { split, getMinFee, sessionModes, nextAvailable } from "../../utils/therapist-directory";

// Home "Meet our psychologists": spotlight + list (2026-11-28) — one therapist large on a pastel card, the next
// few beside it, with real ratings, fees, View profile and Book; tabs that differ from the banner wall — Top rated, Available today,
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

const TICK = "m23 12-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.96 8.6 1.5 6.71 4.69 3.1 5.5l.34 3.7L1 12l2.44 2.79-.34 3.7 3.61.82L8.6 22.5l3.4-1.47 3.4 1.46 1.89-3.19 3.61-.82-.34-3.69zm-12.91 4.72-3.8-3.81 1.48-1.48 2.32 2.33 5.85-5.87 1.48 1.48z";
const STAR = "M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z";
const Tick = ({ s = 17 }) => <svg viewBox="0 0 24 24" width={s} height={s} fill="#1d9bf0" style={{ flexShrink: 0 }} aria-hidden="true"><path d={TICK} /></svg>;
const Stars = ({ n }) => <span className="tt-stars" aria-hidden="true">{[1, 2, 3, 4, 5].map((i) => <svg key={i} viewBox="0 0 24 24" width="14" height="14" fill={i <= Math.round(n) ? "#e3a83a" : "#d9e0dc"}><path d={STAR} /></svg>)}</span>;
// soft colours for the spotlight, a different one for each therapist
const PASTELS = [["#e3f4e9", "#bfe3cc"], ["#e4effb", "#c3d9f2"], ["#fdebdc", "#f4ceaa"], ["#fbe6ee", "#f1c6d6"], ["#fff4cc", "#f1dd8c"], ["#ece7fb", "#d2c7f3"]];

function useView(t) {
  const r = ratingOf(t);
  const name = t.user?.name || "Therapist";
  const photo = t.user?.profile ? `${imagePath}/${t.user.profile}` : "";
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return { r, name, photo, initials, fee: getMinFee(t.fees), exp: expLabel(t.year_of_exp), langs: split(t.language_spoken).slice(0, 2).join(", "), href: profilePath(t), book: bookPath(t) };
}

function Photo({ v, w, h, cls }) {
  const [broken, setBroken] = useState(false);
  return v.photo && !broken
    // eslint-disable-next-line @next/next/no-img-element
    ? <img className={cls} src={thumb(v.photo, w > 300 ? 640 : 256, 80)} srcSet={`${thumb(v.photo, w > 300 ? 640 : 256, 80)} 1x, ${thumb(v.photo, w > 300 ? 828 : 384, 80)} 2x`} alt={v.name} loading="lazy" decoding="async" width={w} height={h} onError={() => setBroken(true)} />
    : <span className={`${cls} tt-init`} aria-hidden="true"><span>{v.initials || "C"}</span></span>;
}

// the big card: one therapist at a time, on a soft colour
function Spotlight({ t, color }) {
  const v = useView(t);
  return (
    <article className="tt-spot" style={{ "--p": color[0], "--pd": color[1] }} key={t._id}>
      <div className="tt-spot-frame"><Photo v={v} w={260} h={310} cls="tt-spot-img" /></div>
      <div className="tt-spot-t">
        <span className="tt-tag">{v.r ? <><svg viewBox="0 0 24 24" width="13" height="13" fill="#e3a83a" aria-hidden="true"><path d={STAR} /></svg> {v.r.avg.toFixed(1)} from {v.r.count} review{v.r.count > 1 ? "s" : ""}</> : "Verified psychologist"}</span>
        <Link href={v.href} className="tt-spot-name"><span>{v.name}</span><Tick s={20} /></Link>
        <p className="tt-spot-role">{t.profile_type || "Mental Health Professional"}</p>
        {(v.langs || v.exp) && <p className="tt-spot-lang">{v.langs ? `Speaks ${v.langs}` : ""}{v.exp ? <span className="tt-exp">{v.langs ? " " : ""}({v.exp} exp)</span> : null}</p>}
        {v.r && <p className="tt-spot-rate"><Stars n={v.r.avg} /> <b>{v.r.avg.toFixed(1)}</b> ({v.r.count})</p>}
        {v.fee ? <p className="tt-spot-fee">Session from <b>₹{v.fee.toLocaleString("en-IN")}</b></p> : null}
        <div className="tt-btns">
          <Link href={v.book} className="tt-btn tt-btn-book">Book now<span className="tt-sr"> with {v.name}</span></Link>
          <Link href={v.href} className="tt-btn tt-btn-line">View profile<span className="tt-sr"> of {v.name}</span></Link>
        </div>
      </div>
    </article>
  );
}

// a row in the list beside it
function Row({ t, onPick, active }) {
  const v = useView(t);
  return (
    <div className={`tt-li${active ? " on" : ""}`}>
      <button type="button" className="tt-li-pick" onClick={onPick} aria-label={`Show ${v.name} above`}>
        <Photo v={v} w={72} h={72} cls="tt-li-img" />
      </button>
      <div className="tt-li-t">
        <Link href={v.href} className="tt-li-name"><span>{v.name}</span><Tick s={14} /></Link>
        <small><span className="tt-role">{t.profile_type || "Psychologist"}</span>{v.langs ? ` · ${v.langs}` : ""}{v.exp ? <span className="tt-exp"> ({v.exp})</span> : null}</small>
        <small className="tt-li-rate">{v.r ? <><Stars n={v.r.avg} /> <b>{v.r.avg.toFixed(1)}</b> ({v.r.count})</> : <b className="tt-new">New</b>}{v.fee ? <> · from <b>₹{v.fee.toLocaleString("en-IN")}</b></> : null}</small>
      </div>
      <div className="tt-li-btns">
        <Link href={v.href} className="tt-btn tt-btn-line sm">View profile<span className="tt-sr"> of {v.name}</span></Link>
        <Link href={v.book} className="tt-btn tt-btn-book sm">Book<span className="tt-sr"> with {v.name}</span></Link>
      </div>
    </div>
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
    { key: "near", label: <>Near you<span className="tt-near-at"> · {nearLabel}</span></>, n: lists.near.length, hide: lists.near.length < 2 && tab !== "near" },
    { key: "inPerson", label: "In-person", n: lists.inPerson.length },
  ].filter((x) => !x.hide);
  const shown = lists[tab] || [];

  // spotlight: one therapist at a time; the list shows the next few. A thin timer bar under the spotlight fills over
  // 6 s and moves it on when it ends — so the bar and the change always match. The bar pauses while the visitor
  // hovers/touches/focuses the box, when it's off screen or the tab is hidden; with reduced motion there's no bar
  // and no auto-change (arrows, list photos, swipe and ← → still work).
  const [idx, setIdx] = useState(0);
  useEffect(() => { setIdx(0); }, [tab, lang]);
  const boxRef = useRef(null);
  const hasAny = shown.length > 0;
  const [hover, setHover] = useState(false);
  const [inView, setInView] = useState(false);
  const [still, setStill] = useState(false);
  useEffect(() => { setStill(!!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches); }, []);
  useEffect(() => {
    const el = boxRef.current;
    if (!el || !("IntersectionObserver" in window)) { setInView(true); return undefined; }
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, [hasAny]);
  const go = (n) => setIdx((n + shown.length) % Math.max(1, shown.length));
  const at = shown.length ? idx % shown.length : 0;
  const paused = hover || !inView;
  const touchX = useRef(null);
  const onKey = (e) => { if (e.key === "ArrowRight") { e.preventDefault(); go(at + 1); } else if (e.key === "ArrowLeft") { e.preventDefault(); go(at - 1); } };
  const color = PASTELS[at % PASTELS.length];
  const next = shown.length ? [1, 2, 3, 4].map((k) => shown[(at + k) % shown.length]).filter((t, k, a) => t && t !== shown[at] && a.indexOf(t) === k) : [];

  if (!people.length) return null;
  return (
    <section className="tt-sec" aria-labelledby="tt-h">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      {/* a soft glow that takes the spotlight's colour */}
      <span className="tt-glow" style={{ background: color[1] }} aria-hidden="true" />
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
                {x.label}<small>{x.n}</small>
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

        {shown.length > 0 ? (
          <div className="tt-box" ref={boxRef} role="tabpanel" tabIndex={-1} onKeyDown={onKey}
            onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
            onFocus={() => setHover(true)} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setHover(false); }}>
            <div className="tt-spot-wrap"
              onTouchStart={(e) => { touchX.current = e.touches[0].clientX; setHover(true); }}
              onTouchEnd={(e) => {
                const dx = touchX.current == null ? 0 : e.changedTouches[0].clientX - touchX.current;
                touchX.current = null; setHover(false);
                if (Math.abs(dx) > 45) go(at + (dx < 0 ? 1 : -1));
              }}>
              <Spotlight t={shown[at]} color={color} />
              {shown.length > 1 && (
                <div className="tt-nav">
                  <button type="button" onClick={() => go(at - 1)} aria-label="Previous psychologist"><i className="feather-chevron-left" aria-hidden="true" /></button>
                  <span className="tt-count">{at + 1} / {shown.length}</span>
                  {!still && (
                    <span className="tt-prog" aria-hidden="true">
                      <i key={`${tab}-${lang}-${at}`} style={{ animationPlayState: paused ? "paused" : "running" }} onAnimationEnd={() => go(at + 1)} />
                    </span>
                  )}
                  <button type="button" onClick={() => go(at + 1)} aria-label="Next psychologist"><i className="feather-chevron-right" aria-hidden="true" /></button>
                </div>
              )}
            </div>
            <div className="tt-list" key={`${tab}-${lang}-${at}`}>
              {next.map((t, k) => <Row key={t._id} t={t} onPick={() => go(at + k + 1)} />)}
            </div>
          </div>
        ) : (
          <div className="tt-empty">
            <p>No one matches this right now.</p>
            <button type="button" onClick={() => { setLang(""); setTab("top"); }}>Show top rated</button>
          </div>
        )}

        <Link href="/view-all-therapist" className="tt-all tt-all-m">Browse all {total || ""} psychologists <i className="feather-arrow-right" aria-hidden="true" /></Link>
      </div>
    </section>
  );
}

const CSS = `
/* light "spotlight + list" (owner 2026-11-28): soft sage-to-cream, one therapist large on a pastel card, the next few beside it */
.tt-sec { position: relative; padding: 72px 0 60px; background: linear-gradient(180deg, #f1f7f3 0%, #fbf7ef 100%); overflow: hidden; isolation: isolate; }
.tt-sec > .container { position: relative; z-index: 1; }
.tt-glow { position: absolute; z-index: 0; left: -120px; top: 30%; width: 560px; height: 560px; border-radius: 50%; opacity: .45; filter: blur(90px); transition: background-color 1.2s ease; pointer-events: none; animation: ttFloat 14s ease-in-out infinite alternate; }
@keyframes ttFloat { from { transform: translate(0, 0) scale(1); } to { transform: translate(60px, -40px) scale(1.08); } }
.tt-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px 28px; flex-wrap: wrap; margin-bottom: 22px; }
.tt-eyebrow { display: inline-flex; align-items: center; gap: 10px; margin: 0 0 12px; padding: 0; font-size: 12px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; color: #8a5a0b; }
.tt-eyebrow::before { content: ""; width: 26px; height: 2px; background: #e3a83a; }
.tt-title { font-size: clamp(1.95rem, 3.6vw, 2.9rem); font-weight: 800; color: #0b1712; margin: 0 0 10px; line-height: 1.12; letter-spacing: -.02em; }
.tt-title span { color: #1e7a4c; }
.tt-sub { font-size: 16px; line-height: 1.6; color: #4b5d53; margin: 0; padding: 0; max-width: 60ch; }
.tt-all { display: inline-flex; align-items: center; gap: 8px; height: 48px; padding: 0 22px; border-radius: 999px; background: #14532d; color: #fff !important; font-size: 15px; font-weight: 800; text-decoration: none !important; white-space: nowrap; transition: transform .2s ease, background .2s ease; }
.tt-all:hover { transform: translateY(-2px); background: #0f3d24; }
.tt-all-m { display: none; }

/* filters: text tabs with a green underline */
.tt-controls { display: flex; align-items: center; gap: 4px 18px; flex-wrap: wrap; margin-bottom: 22px; border-bottom: 1px solid #dfe8e2; }
.tt-tabs, .tt-langs { display: flex; align-items: center; gap: 2px; overflow-x: auto; scrollbar-width: none; }
.tt-tabs::-webkit-scrollbar, .tt-langs::-webkit-scrollbar { display: none; }
.tt-langs { margin-left: auto; padding-left: 14px; border-left: 1px solid #dfe8e2; }
.tt-tabs button, .tt-langs button { position: relative; display: inline-flex; align-items: center; gap: 6px; height: 40px; padding: 0 12px; border: 0; background: none; color: #55665c; font-size: 14px; font-weight: 700; cursor: pointer; white-space: nowrap; }
.tt-langs button { font-size: 13px; padding: 0 10px; }
.tt-tabs button::after, .tt-langs button::after { content: ""; position: absolute; left: 10px; right: 10px; bottom: -1px; height: 2px; border-radius: 2px; background: #1e7a4c; transform: scaleX(0); transition: transform .25s ease; }
.tt-tabs button.on, .tt-langs button.on { color: #0b1712; }
.tt-tabs button.on::after, .tt-langs button.on::after { transform: scaleX(1); }
.tt-tabs button small { font-size: 12px; font-weight: 700; color: #8a9b91; }
.tt-tabs button.on small { color: #1e7a4c; }

.tt-box { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr); gap: 22px; align-items: start; }
.tt-spot-wrap { display: flex; flex-direction: column; gap: 12px; }
.tt-spot { display: grid; grid-template-columns: 260px minmax(0, 1fr); gap: 22px; align-items: center; padding: 18px; border-radius: 30px; background: var(--p); border: 1px solid var(--pd); animation: ttIn .55s cubic-bezier(.2,.7,.2,1) both; box-shadow: 0 18px 40px -28px rgba(20,83,45,.45); }
@keyframes ttIn { from { opacity: 0; transform: translateY(14px) scale(.985); } to { opacity: 1; transform: none; } }
@keyframes ttZoom { from { transform: scale(1.08); } to { transform: scale(1); } }
@keyframes ttUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
.tt-spot .tt-spot-img { animation: ttZoom 1.1s cubic-bezier(.2,.7,.2,1) both; }
.tt-spot-frame { overflow: hidden; border-radius: 22px; min-width: 0; }
.tt-spot-t > * { animation: ttUp .5s cubic-bezier(.2,.7,.2,1) both; }
.tt-spot-t > :nth-child(2) { animation-delay: .06s; } .tt-spot-t > :nth-child(3) { animation-delay: .12s; }
.tt-spot-t > :nth-child(4) { animation-delay: .18s; } .tt-spot-t > :nth-child(5) { animation-delay: .24s; }
.tt-spot-t > :nth-child(n+6) { animation-delay: .3s; }
.tt-spot-img { width: 260px; height: 310px; border-radius: 22px; object-fit: cover; object-position: center 22%; display: block; background: #fff; }
.tt-spot-t { min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.tt-tag { align-self: flex-start; display: inline-flex; align-items: center; gap: 5px; font-size: 12.5px; font-weight: 800; color: #14532d; background: #fff; border-radius: 999px; padding: 5px 11px; }
.tt-spot-name { display: flex; align-items: center; gap: 6px; font-size: 26px; font-weight: 800; line-height: 1.15; color: #0b1712 !important; text-decoration: none !important; letter-spacing: -.01em; }
.tt-spot-name span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tt-spot-name:hover { color: #1e7a4c !important; }
.tt-spot-t p { margin: 0; padding: 0; font-size: 15px; color: #4b5d53; line-height: 1.45; }
.tt-spot-rate { display: flex; align-items: center; gap: 6px; } .tt-spot-rate b { color: #0b1712; }
.tt-spot-fee b { color: #0b1712; font-size: 20px; }
.tt-stars { display: inline-flex; gap: 1px; }
.tt-btns { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 8px; }
.tt-btn { display: inline-flex; align-items: center; justify-content: center; height: 44px; padding: 0 18px; border-radius: 12px; font-size: 14.5px; font-weight: 800; text-decoration: none !important; white-space: nowrap; transition: background .2s ease, color .2s ease, transform .15s ease, box-shadow .2s ease; }
.tt-btn:active { transform: scale(.96); }
.tt-btn-book::after { content: "→"; display: inline-block; margin-left: 8px; transition: transform .2s ease; }
.tt-btn-book.sm::after { margin-left: 5px; }
.tt-btn-book:hover::after { transform: translateX(4px); }
.tt-btn-book:hover { box-shadow: 0 10px 20px -10px rgba(20,83,45,.6); }
.tt-btn.sm { height: 36px; padding: 0 12px; font-size: 13px; border-radius: 10px; }
.tt-btn-book { background: #14532d; color: #fff !important; } .tt-btn-book:hover { background: #0f3d24; }
.tt-btn-line { background: #fff; color: #14532d !important; border: 1.5px solid #14532d; } .tt-btn-line:hover { background: #eef6f1; }
.tt-nav { display: flex; align-items: center; justify-content: center; gap: 14px; color: #55665c; font-size: 13.5px; font-weight: 700; }
.tt-nav button { width: 40px; height: 40px; border-radius: 50%; border: 1px solid #d6e2da; background: #fff; color: #14532d; font-size: 18px; cursor: pointer; display: grid; place-items: center; }
.tt-nav button:hover { background: #14532d; color: #fff; border-color: #14532d; }
.tt-nav button { transition: background .2s ease, color .2s ease, transform .15s ease; } .tt-nav button:active { transform: scale(.9); }
.tt-count { min-width: 46px; text-align: center; font-variant-numeric: tabular-nums; }
.tt-prog { width: 120px; height: 4px; border-radius: 4px; background: #dde8e1; overflow: hidden; }
.tt-prog i { display: block; height: 100%; width: 100%; background: #1e7a4c; border-radius: 4px; transform-origin: left; animation: ttBar 6s linear both; }
@keyframes ttBar { from { transform: scaleX(0); } to { transform: scaleX(1); } }

.tt-list { display: flex; flex-direction: column; gap: 10px; }
.tt-li { display: grid; grid-template-columns: 72px minmax(0, 1fr) auto; gap: 14px; align-items: center; padding: 10px 12px; border-radius: 20px; background: #fff; border: 1px solid #e4ebe6; position: relative; overflow: hidden; animation: ttUp .45s cubic-bezier(.2,.7,.2,1) both; transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease; }
.tt-li:nth-of-type(2) { animation-delay: .07s; } .tt-li:nth-of-type(3) { animation-delay: .14s; } .tt-li:nth-of-type(4) { animation-delay: .21s; }
.tt-li::before { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: #1e7a4c; transform: scaleY(0); transition: transform .25s ease; }
@media (hover: hover) { .tt-li:hover { transform: translateY(-2px); box-shadow: 0 12px 26px -18px rgba(20,83,45,.5); border-color: #cfe0d5; } .tt-li:hover::before { transform: scaleY(1); } }
.tt-li-pick img { transition: transform .3s ease; } .tt-li-pick:hover img { transform: scale(1.06); }
.tt-li-pick { padding: 0; border: 0; background: none; cursor: pointer; border-radius: 16px; }
.tt-li-img { width: 72px; height: 72px; border-radius: 16px; object-fit: cover; object-position: center 22%; display: block; background: #eef3ef; }
.tt-li-t { min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.tt-li-name { display: flex; align-items: center; gap: 4px; font-size: 16px; font-weight: 800; color: #0b1712 !important; text-decoration: none !important; }
.tt-li-name span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tt-li-name:hover { color: #1e7a4c !important; }
.tt-spot-t p.tt-spot-role, .tt-role { color: #1e7a4c; font-weight: 700; }
.tt-exp { color: #64748b; white-space: nowrap; }
.tt-li-t small { font-size: 13px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tt-li-rate { display: flex; align-items: center; gap: 4px; } .tt-li-rate b { color: #0b1712; }
.tt-new { font-size: 11px; color: #14532d !important; background: #ecc77d; border-radius: 5px; padding: 0 6px; }
.tt-li-btns { display: flex; gap: 8px; }
.tt-li-all { display: flex; align-items: center; justify-content: space-between; gap: 10px; grid-template-columns: none; color: #14532d !important; font-weight: 800; font-size: 14px; text-decoration: none !important; background: #eef6f1; border-color: #d6e9dd; padding: 14px 16px; }

.tt-init { display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #2a8a58, #14532d); color: #fff; font-weight: 800; font-size: 28px; }
.tt-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.tt-empty { padding: 40px 16px; text-align: center; color: #4b5d53; border: 1px dashed #cfdcd4; border-radius: 18px; }
.tt-empty p { margin: 0 0 10px; padding: 0; }
.tt-empty button { height: 40px; padding: 0 18px; border-radius: 10px; border: none; background: #14532d; color: #fff; font-weight: 800; cursor: pointer; }

/* iPad: spotlight on top, the list below */
/* iPad landscape / small laptops: keep the desktop left-right layout, just a smaller photo */
@media (min-width: 1024px) and (max-width: 1199px) {
  .tt-box { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 18px; }
  .tt-spot { grid-template-columns: 190px minmax(0, 1fr); gap: 16px; padding: 14px; }
  .tt-spot-img { width: 190px; height: 240px; }
  .tt-spot-name { font-size: 22px; }
  .tt-spot-t p { font-size: 14px; }
  .tt-btn { padding: 0 14px; }
  .tt-li { grid-template-columns: 60px minmax(0, 1fr); gap: 4px 12px; }
  .tt-li-img { width: 60px; height: 60px; border-radius: 14px; }
  .tt-li-btns { grid-column: 2; }
}
@media (max-width: 1023px) {
  .tt-box { grid-template-columns: minmax(0, 1fr); }
}
/* iPad portrait + phone: tabs on one line, languages on their own line below — nothing slides sideways */
@media (max-width: 1199px) {
  .tt-controls { flex-direction: column; align-items: stretch; flex-wrap: nowrap; gap: 0; border-bottom: 0; }
  .tt-tabs { border-bottom: 1px solid #dfe8e2; overflow: visible; flex-wrap: wrap; }
  .tt-langs { margin: 10px 0 0; padding: 0; border-left: 0; flex-wrap: wrap; overflow: visible; gap: 8px; }
  .tt-langs button { height: 32px; padding: 0 12px; border-radius: 999px; border: 1px solid #d6e2da; background: #fff; }
  .tt-langs button::after { display: none; }
  .tt-langs button.on { background: #14532d; border-color: #14532d; color: #fff; }
}
@media (max-width: 767px) {
  .tt-sec { padding: 48px 0 44px; }
  .tt-all { display: none; }
  .tt-all.tt-all-m { display: flex; justify-content: center; width: 100%; margin: 16px 0 0; }
  .tt-head { margin-bottom: 18px; } .tt-head > div { width: 100%; }
  .tt-title { font-size: 24px; line-height: 1.25; margin: 0 0 8px; }
  .tt-sub { font-size: 15px; max-width: none; }
  .tt-controls { margin-bottom: 16px; }
  .tt-tabs { gap: 0; }
  .tt-tabs button { height: 36px; font-size: 13px; padding: 0 8px; gap: 4px; }
  .tt-tabs button::after { left: 6px; right: 6px; }
  .tt-langs { gap: 6px; }
  .tt-near-at { display: none; }
  .tt-langs button { height: 30px; padding: 0 11px; font-size: 12.5px; }
  /* phone: compact card — photo on the left, details beside it, buttons across the bottom */
  .tt-spot { grid-template-columns: 112px minmax(0, 1fr); grid-template-rows: repeat(5, auto) 1fr auto; gap: 0 14px; padding: 12px; border-radius: 22px; align-items: start; }
  .tt-spot-frame { grid-column: 1; grid-row: 1 / 7; border-radius: 16px; }
  .tt-spot-img { width: 112px; height: 136px; border-radius: 16px; }
  .tt-spot-t { display: contents; }
  .tt-spot .tt-tag { display: none; }
  .tt-spot-t > :not(.tt-btns) { grid-column: 2; margin-bottom: 3px !important; }
  .tt-spot-name { font-size: 18px; margin-top: 2px; }
  .tt-spot-t p { font-size: 13px; line-height: 1.35; }
  .tt-spot-fee b { font-size: 16px; }
  .tt-btns { grid-column: 1 / -1; grid-row: 7; margin-top: 12px; }
  .tt-btns .tt-btn { flex: 1; height: 42px; }
  .tt-li { grid-template-columns: 60px minmax(0, 1fr); gap: 12px; }
  .tt-li-img { width: 60px; height: 60px; border-radius: 14px; }
  .tt-li-btns { grid-column: 1 / -1; }
  .tt-li-btns .tt-btn { flex: 1; }
  .tt-li:nth-of-type(4) { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .tt-spot, .tt-spot .tt-spot-img, .tt-spot-t > *, .tt-li, .tt-glow { animation: none; }
  .tt-all, .tt-btn, .tt-li, .tt-li::before, .tt-glow, .tt-li-pick img { transition: none; }
}
`;
