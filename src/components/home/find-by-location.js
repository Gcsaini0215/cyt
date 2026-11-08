import React, { useEffect, useState } from "react";
import { usePublicStats, ratingText, reviewsText } from "../../utils/public-stats";
import Link from "next/link";
import { PLACES, placePath, placeForRegion, isStateSlug, isAbroad, NOIDA_CENTRE } from "../../utils/places";
import { GBP_URL } from "../about/visit-centre";

// Home "Find a psychologist near you": the visitor's own state first (when we know it),
// the Noida centre (our only physical clinic), photo tiles for the main cities and chips for
// the rest — every count is real. City photos are Wikimedia Commons (CC BY-SA), credited
// below the tiles; resized to ~20 KB webp each (they were ~1.9 MB together).
// stats: placeStats(...) from pages/index.js; visitorState: ipapi region, client side.

// photo tile -> place page (count shown from that place's stats)
const TILES = [
  { label: "Delhi NCR", img: "delhi", slug: "delhi" },
  { label: "Noida", img: "noida", slug: "uttar-pradesh", href: "/noida-appointment", note: "In-person centre", centre: true },
  { label: "Mumbai", img: "mumbai", slug: "mumbai" },
  { label: "Bangalore", img: "bangalore", slug: "bangalore" },
  { label: "Hyderabad", img: "hyderabad", slug: "hyderabad" },
  { label: "Chennai", img: "chennai", slug: "chennai" },
  { label: "Kolkata", img: "kolkata", slug: "kolkata" },
  { label: "Jaipur", img: "jaipur", slug: "jaipur" },
  { label: "Uttarakhand", img: "dehradun", slug: "uttarakhand" },
];

// centre hours 9 AM – 9 PM IST, every day — worked out in the browser only
function useCentreOpen() {
  const [open, setOpen] = useState(null);
  useEffect(() => {
    const check = () => {
      const now = new Date();
      const h = new Date(now.getTime() + (now.getTimezoneOffset() + 330) * 60000).getHours();
      setOpen(h >= 9 && h < 21);
    };
    check();
    const t = setInterval(check, 60000);
    return () => clearInterval(t);
  }, []);
  return open;
}

// watermark in the "Near you" card: rings of words only (no lines), each turning its own way
const RINGS = [
  { r: 96, text: "CHOOSE YOUR THERAPIST • CHOOSE YOUR THERAPIST • ", size: 13 },
  { r: 74, text: "VERIFIED PSYCHOLOGISTS • VERIFIED PSYCHOLOGISTS • ", size: 10.5 },
  { r: 53, text: "IN PERSON • ONLINE • IN PERSON • ONLINE • ", size: 9.5 },
  { r: 33, text: "CYT • CARE • CYT • CARE • ", size: 8 },
];
function Seal() {
  return (
    <svg className="fbl-seal" viewBox="0 0 220 220" aria-hidden="true" focusable="false">
      <defs>
        {RINGS.map((x, i) => <path key={i} id={`fbl-ring-${i}`} d={`M110,110 m-${x.r},0 a${x.r},${x.r} 0 1,1 ${x.r * 2},0 a${x.r},${x.r} 0 1,1 -${x.r * 2},0`} />)}
      </defs>
      {RINGS.map((x, i) => (
        <g key={i} className={`fbl-ring r${i}`}>
          <text style={{ fontSize: x.size }}><textPath href={`#fbl-ring-${i}`} textLength={Math.floor(2 * Math.PI * x.r) - 4} lengthAdjust="spacing">{x.text}</textPath></text>
        </g>
      ))}
    </svg>
  );
}

export default function FindByLocation({ stats = {}, total = 0, visitorState = null }) {
  const ps = usePublicStats();
  const open = useCentreOpen();
  const near = placeForRegion(visitorState);
  const n = near ? stats[near] : null;
  const slugs = Object.keys(PLACES);
  const tiled = new Set(TILES.map((t) => t.slug));
  const ranked = [...slugs].filter((x) => !tiled.has(x)).sort((a, b) => isAbroad(b) - isAbroad(a) || (stats[b]?.count || 0) - (stats[a]?.count || 0) || PLACES[a].name.localeCompare(PLACES[b].name));

  return (
    <section className="fbl-section" aria-labelledby="fbl-h">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="container">
        <div className="fbl-head">
          <p className="fbl-eyebrow">In person · online · abroad</p>
          <h2 id="fbl-h">Find a psychologist <span>near you</span></h2>
          <p>Meet in person at our Noida centre, or talk online from anywhere in India — and abroad.</p>
        </div>

        <div className="fbl-cards">
          {near && n ? (
            <div className="fbl-card near">
              <Seal />
              <span className="fbl-pin" aria-hidden="true"><i className="feather-map-pin" /></span>
              <span className="fbl-tag"><i className="feather-navigation" aria-hidden="true" /> Near you</span>
              <h3><Link href={placePath(near)} className="fbl-stretch">Psychologists in {PLACES[near].name}</Link></h3>
              <div className="fbl-stats">
                {n.count ? <span><b>{n.count}</b> based here</span> : <span>Online sessions from anywhere</span>}
                {n.inPerson ? <span><b>{n.inPerson}</b> in person</span> : null}
                {n.minFee ? <span>from <b>₹{n.minFee.toLocaleString("en-IN")}</b></span> : null}
              </div>
              <p className="fbl-note">Meet one close to home, or start online today. Fees are shown upfront on every profile.</p>
              <span className="fbl-go">See who can help <i className="feather-arrow-right" aria-hidden="true" /></span>
            </div>
          ) : (
            <div className="fbl-card near">
              <Seal />
              <span className="fbl-pin" aria-hidden="true"><i className="feather-globe" /></span>
              <span className="fbl-tag"><i className="feather-globe" aria-hidden="true" /> Anywhere in India</span>
              <h3><Link href="/view-all-therapist" className="fbl-stretch">Online sessions</Link></h3>
              <div className="fbl-stats">
                {total ? <span><b>{total}</b> verified psychologists</span> : null}
                <span>Video or audio</span>
                <span>Hindi, English &amp; more</span>
              </div>
              <p className="fbl-note">Talk from home, from anywhere in India. Fees are shown upfront on every profile.</p>
              <span className="fbl-go">Browse psychologists <i className="feather-arrow-right" aria-hidden="true" /></span>
            </div>
          )}
          <div className="fbl-card centre">
            <div className="fbl-ctop">
              <span className="fbl-tag"><i className="feather-home" aria-hidden="true" /> Our centre</span>
              {open !== null && <span className={`fbl-open${open ? " on" : ""}`}><i aria-hidden="true" />{open ? "Open now" : "Opens 9 AM"}</span>}
            </div>
            <h3>{NOIDA_CENTRE.name}</h3>
            <ul className="fbl-meta">
              <li><i className="feather-map-pin" aria-hidden="true" /> {NOIDA_CENTRE.address}</li>
              <li><i className="feather-clock" aria-hidden="true" /> {NOIDA_CENTRE.hours}</li>
            </ul>
            <a href={GBP_URL} target="_blank" rel="noreferrer" className="fbl-rate"><span aria-hidden="true">★★★★★</span> <b>{ratingText(ps)}</b> on Google · {reviewsText(ps)} reviews</a>
            <div className="fbl-acts">
              <Link href={NOIDA_CENTRE.book} className="fbl-btn">Book in person <i className="feather-arrow-right" aria-hidden="true" /></Link>
              <a href={GBP_URL} target="_blank" rel="noreferrer" className="fbl-btn ghost"><i className="feather-navigation" aria-hidden="true" /> Directions</a>
            </div>
          </div>
        </div>

        <div className="fbl-sub">
          <h3>Popular cities</h3>
          <Link href="/psychologist-in" className="fbl-more">All cities &amp; states <i className="feather-arrow-right" aria-hidden="true" /></Link>
        </div>
        <div className="fbl-grid" aria-label="Psychologists in major cities">
          {TILES.map((t) => {
            const st = stats[t.slug];
            return (
              <Link key={t.label} href={t.href || placePath(t.slug)} className={`fbl-tile${t.slug === near ? " on" : ""}`}>
                <img src={`/assets/img/cities/w/${t.img}.webp`} alt={`Psychologist in ${t.label}`} width="480" height="320" loading="lazy" decoding="async" />
                <span className="fbl-scrim" aria-hidden="true" />
                {t.centre ? <span className="fbl-badge gold">★ Our centre</span>
                  : st?.inPerson ? <span className="fbl-badge">In person</span> : null}
                <span className="fbl-info">
                  <b>{t.label}</b>
                  <small>{t.note ? t.note : st?.count ? `${st.count} psychologist${st.count !== 1 ? "s" : ""}` : "Online sessions"}</small>
                </span>
                <span className="fbl-arrow" aria-hidden="true"><i className="feather-arrow-up-right" /></span>
              </Link>
            );
          })}
          <Link href="/psychologist-in" className="fbl-tile fbl-tile-all">
            <span className="fbl-all-ic" aria-hidden="true"><i className="feather-map" /></span>
            <span className="fbl-info"><b>All cities &amp; states</b><small>Online from anywhere in India</small></span>
          </Link>
        </div>

        <div className="fbl-sub">
          <h3>More places</h3>
        </div>
        <div className="fbl-places" aria-label="More cities and states">
          {ranked.map((slug) => {
            const s = stats[slug];
            return (
              <Link key={slug} href={placePath(slug)} className={`fbl-place${slug === near ? " on" : ""}${isAbroad(slug) ? " abroad" : ""}`}>
                {isAbroad(slug) ? <i className="feather-globe" aria-hidden="true" /> : <i className="feather-map-pin" aria-hidden="true" />}
                <span>Psychologist in {PLACES[slug].name}{isAbroad(slug) ? `, ${PLACES[slug].country}` : ""}</span>
                <small>{s?.count ? `${s.count}${isStateSlug(slug) || isAbroad(slug) ? "" : " nearby"}` : "Online"}</small>
              </Link>
            );
          })}
        </div>

        <p className="fbl-credit">
          City photos: <a href="https://commons.wikimedia.org/" target="_blank" rel="noreferrer nofollow">Wikimedia Commons</a> contributors,{" "}
          <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer nofollow">CC BY-SA</a>.
        </p>
      </div>
    </section>
  );
}

const CSS = `
@keyframes fblPulse { 0% { box-shadow: 0 0 0 0 rgba(74,222,128,.6); } 70% { box-shadow: 0 0 0 7px rgba(74,222,128,0); } 100% { box-shadow: 0 0 0 0 rgba(74,222,128,0); } }
.fbl-section { position: relative; overflow: hidden; isolation: isolate; padding: 72px 0 60px; background: linear-gradient(180deg, #fbf6ea 0%, #f4f7f1 100%); }
.fbl-section::before { content: ""; position: absolute; z-index: -1; inset: 0; background-image: radial-gradient(rgba(30,122,76,.10) 1.2px, transparent 1.3px); background-size: 22px 22px;
  -webkit-mask-image: radial-gradient(ellipse 70% 60% at 85% 10%, #000 0%, transparent 70%); mask-image: radial-gradient(ellipse 70% 60% at 85% 10%, #000 0%, transparent 70%); }
.fbl-head { margin-bottom: 26px; }
.fbl-eyebrow { display: inline-flex; align-items: center; gap: 10px; margin: 0 0 12px !important; padding: 0; font-size: 12px !important; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; color: #a86e0e !important; }
.fbl-eyebrow::before { content: ""; width: 26px; height: 2px; background: #d4a24c; }
.fbl-head h2 { font-size: clamp(1.95rem, 3.6vw, 2.9rem); font-weight: 800; color: #0b1712; margin: 0 0 10px; line-height: 1.12; letter-spacing: -.02em; }
.fbl-head h2 span { color: #1e7a4c; }
.fbl-head p { color: #4b5b53; font-size: 16px; line-height: 1.6; margin: 0; padding: 0; max-width: 60ch; }

.fbl-cards { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 18px; margin-bottom: 34px; }
.fbl-card { position: relative; overflow: hidden; display: flex; flex-direction: column; gap: 8px; padding: 26px 28px; border-radius: 22px; text-decoration: none !important; }
.fbl-card.near { background: #fff; border: 1px solid #dbe7de; box-shadow: 0 18px 40px -30px rgba(11,52,30,.6), 0 1px 3px rgba(11,52,30,.05); cursor: pointer; transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease; }
@keyframes fblSpin { to { transform: rotate(360deg); } }
.fbl-seal { position: absolute; right: -40px; bottom: -40px; width: 230px; height: 230px; pointer-events: none; }
.fbl-ring { transform-origin: 110px 110px; animation: fblSpin 40s linear infinite; }
.fbl-ring.r1 { animation-duration: 32s; animation-direction: reverse; }
.fbl-ring.r2 { animation-duration: 26s; }
.fbl-ring.r3 { animation-duration: 20s; animation-direction: reverse; }
.fbl-seal text { font-weight: 800; letter-spacing: 1px; fill: rgba(30,122,76,.16); }
.fbl-ring.r1 text { fill: rgba(168,110,14,.17); }
.fbl-ring.r3 text { fill: rgba(168,110,14,.2); }
.fbl-card.near:hover { transform: translateY(-3px); border-color: #b9d6c3; box-shadow: 0 24px 44px -28px rgba(11,52,30,.65); }
.fbl-pin { position: absolute; top: 22px; right: 24px; width: 54px; height: 54px; border-radius: 18px; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #fff;
  background: linear-gradient(135deg, #22895a, #14532d); box-shadow: 0 12px 24px -12px rgba(20,83,45,.8); }
.fbl-stretch { color: inherit !important; text-decoration: none !important; }
.fbl-stretch::after { content: ""; position: absolute; inset: 0; z-index: 1; }
.fbl-card.near:has(.fbl-stretch:focus-visible) { outline: 3px solid #e3a83a; outline-offset: 2px; }
.fbl-tag { align-self: flex-start; display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 800; letter-spacing: .5px; text-transform: uppercase; padding: 5px 10px; border-radius: 999px; background: #e7f4ec; color: #166534; }
.fbl-card h3 { font-size: 22px; font-weight: 800; color: #0b1712; margin: 6px 0 2px; line-height: 1.25; padding-right: 64px; }
.fbl-stats { display: flex; flex-wrap: wrap; gap: 8px; }
.fbl-stats span { display: inline-flex; align-items: center; gap: 4px; height: 32px; padding: 0 12px; border-radius: 10px; background: #f3f8f4; border: 1px solid #e1ece4; font-size: 13.5px; color: #4b5b53; font-weight: 600; }
.fbl-stats b { color: #14532d; font-weight: 800; }
.fbl-note { margin: 4px 0 16px !important; padding: 0; font-size: 14.5px; line-height: 1.6; color: #5b6b63; max-width: 46ch; }
.fbl-go { align-self: flex-start; margin-top: auto; display: inline-flex; align-items: center; gap: 7px; height: 46px; padding: 0 20px; border-radius: 13px; background: linear-gradient(135deg, #22895a, #1e7a4c 55%, #14532d); color: #fff;
  font-size: 14.5px; font-weight: 800; box-shadow: 0 10px 20px -12px rgba(20,83,45,.85); }
.fbl-card.near .fbl-stats { margin-bottom: 2px; }
.fbl-go i { transition: transform .2s ease; }
.fbl-card.near:hover .fbl-go i { transform: translateX(3px); }

.fbl-card.centre { color: #fff; background: linear-gradient(150deg, #1e7a4c 0%, #166534 50%, #0f3f24 100%); box-shadow: 0 22px 44px -28px rgba(11,52,30,.9); }
.fbl-card.centre::before { content: ""; position: absolute; width: 260px; height: 260px; right: -90px; top: -110px; border-radius: 50%; background: radial-gradient(circle, rgba(227,168,58,.35), rgba(227,168,58,0) 70%); pointer-events: none; }
.fbl-card.centre::after { content: ""; position: absolute; width: 180px; height: 180px; left: -70px; bottom: -90px; border-radius: 50%; border: 28px solid rgba(255,255,255,.05); pointer-events: none; }
.fbl-card.centre > * { position: relative; }
.fbl-ctop { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.fbl-card.centre .fbl-tag { background: rgba(236,199,125,.18); color: #f5d595; }
.fbl-open { display: inline-flex; align-items: center; gap: 7px; padding: 5px 11px; border-radius: 999px; background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.16); font-size: 12px; font-weight: 700; color: #fff; }
.fbl-open i { width: 7px; height: 7px; border-radius: 50%; background: #ecc77d; }
.fbl-open.on i { background: #4ade80; animation: fblPulse 1.8s infinite; }
.fbl-card.centre h3 { color: #fff; padding-right: 0; }
.fbl-meta { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 5px; }
.fbl-meta li { margin: 0; display: flex; align-items: flex-start; gap: 8px; font-size: 14px; line-height: 1.5; color: rgba(255,255,255,.82); }
.fbl-meta li::before { content: none; }
.fbl-meta i { color: #f5d595; margin-top: 3px; }
.fbl-rate { align-self: flex-start; display: inline-flex; align-items: center; gap: 6px; margin-top: 4px; padding: 6px 12px; border-radius: 10px; background: rgba(255,255,255,.1); color: #fff !important; font-size: 13.5px; text-decoration: none !important; }
.fbl-rate span { color: #fbbf24; letter-spacing: 1px; }
.fbl-rate b { color: #f5d595; }
.fbl-acts { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 8px; }
.fbl-btn { display: inline-flex; align-items: center; gap: 7px; height: 46px; padding: 0 20px; border-radius: 13px; background: #ecc77d; color: #3b2604 !important; font-weight: 800; font-size: 14.5px; text-decoration: none !important; transition: background .2s ease; }
.fbl-btn:hover { background: #f5d595; }
.fbl-btn.ghost { background: transparent; border: 1.5px solid rgba(255,255,255,.45); color: #fff !important; }
.fbl-btn.ghost:hover { background: rgba(255,255,255,.1); }

.fbl-sub { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin: 0 0 14px; }
.fbl-sub h3 { margin: 0; font-size: 18px; font-weight: 800; color: #0b1712; }
.fbl-more { display: inline-flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 800; color: #1e7a4c !important; text-decoration: none !important; white-space: nowrap; }
.fbl-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 16px; margin-bottom: 30px; }
.fbl-tile { position: relative; display: block; aspect-ratio: 4 / 3; border-radius: 18px; overflow: hidden; isolation: isolate; background: #dfeee5; text-decoration: none !important; box-shadow: 0 10px 22px -16px rgba(11,52,30,.55); transition: transform .25s ease, box-shadow .25s ease; }
/* clean edge drawn inside the tile, so a scrolling row never cuts it off */
.fbl-tile::after { content: ""; position: absolute; inset: 0; z-index: 3; border-radius: inherit; box-shadow: inset 0 0 0 1px rgba(255,255,255,.22); pointer-events: none; transition: box-shadow .2s ease; }
.fbl-tile:hover { transform: translateY(-4px); box-shadow: 0 22px 36px -18px rgba(11,52,30,.65); }
.fbl-tile img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .6s ease; }
.fbl-tile:hover img { transform: scale(1.07); }
.fbl-tile.on::after { box-shadow: inset 0 0 0 3px #e3a83a, inset 0 0 0 4px rgba(255,255,255,.5); }
.fbl-tile:focus-visible { outline: none; }
.fbl-tile:focus-visible::after { box-shadow: inset 0 0 0 3px #e3a83a; }
.fbl-scrim { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(7,26,17,.05) 25%, rgba(7,26,17,.85) 100%); }
.fbl-badge { position: absolute; top: 10px; left: 10px; padding: 4px 9px; border-radius: 999px; background: rgba(255,255,255,.92); color: #166534; font-size: 11px; font-weight: 800; letter-spacing: .2px; backdrop-filter: blur(4px); }
.fbl-badge.gold { background: #ecc77d; color: #3b2604; }
.fbl-info { position: absolute; left: 14px; right: 44px; bottom: 12px; display: flex; flex-direction: column; color: #fff; }
.fbl-info b { font-size: 16.5px; font-weight: 800; line-height: 1.25; }
.fbl-info small { font-size: 12.5px; color: rgba(255,255,255,.85); }
.fbl-arrow { position: absolute; right: 12px; bottom: 12px; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,.18); color: #fff; font-size: 14px; backdrop-filter: blur(4px); transition: background .2s ease, color .2s ease; }
.fbl-tile:hover .fbl-arrow { background: #ecc77d; color: #3b2604; }
.fbl-tile-all { display: flex; flex-direction: column; justify-content: space-between; padding: 14px; background: linear-gradient(150deg, #1e7a4c, #0f3f24); }
.fbl-tile-all::before { content: ""; position: absolute; width: 160px; height: 160px; right: -60px; top: -60px; border-radius: 50%; background: radial-gradient(circle, rgba(227,168,58,.35), rgba(227,168,58,0) 70%); }
.fbl-all-ic { position: relative; width: 42px; height: 42px; border-radius: 13px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,.12); color: #f5d595; font-size: 19px; }
.fbl-tile-all .fbl-info { right: 14px; }
.fbl-tile-all .fbl-info small { color: #f5d595; }

.fbl-places { display: flex; flex-wrap: wrap; gap: 10px; }
.fbl-place { display: inline-flex; align-items: center; gap: 8px; height: 40px; padding: 0 8px 0 13px; border-radius: 999px; border: 1px solid #dbe5df; background: #fff; color: #26463a !important; font-size: 13.5px; font-weight: 600; text-decoration: none !important; white-space: nowrap;
  box-shadow: 0 4px 12px -9px rgba(11,52,30,.45); transition: border-color .15s ease, transform .15s ease; }
.fbl-place > i { color: #1e7a4c; font-size: 13px; }
.fbl-place small { font-size: 11px; font-weight: 800; color: #166534; background: #e7f4ec; border-radius: 999px; padding: 3px 9px; }
.fbl-place.abroad { border-color: #e6c98a; background: #fffaf0; }
.fbl-place.abroad > i { color: #a86e0e; }
.fbl-place.abroad small { background: #fbefd3; color: #8a5a0b; }
.fbl-place:hover, .fbl-place.on { border-color: #1e7a4c; color: #166534 !important; transform: translateY(-1px); }
.fbl-credit { margin: 18px 0 0; padding: 0; font-size: 11.5px; color: #94a3b8; }
.fbl-credit a { color: #64748b; }

/* iPad: cards stay side by side, tiles in 5 squares */
@media (min-width: 768px) and (max-width: 1100px) {
  .fbl-cards { gap: 14px; }
  .fbl-card { padding: 22px 22px; }
  .fbl-card h3 { font-size: 19px; }
  .fbl-pin { width: 46px; height: 46px; font-size: 20px; top: 18px; right: 18px; border-radius: 15px; }
  .fbl-grid { gap: 12px; }
  .fbl-tile { aspect-ratio: 1 / 1.1; }
  .fbl-info { left: 11px; right: 11px; }
  .fbl-info b { font-size: 15px; }
  .fbl-arrow { display: none; }
}
@media (min-width: 768px) and (max-width: 900px) {
  .fbl-cards { grid-template-columns: 1fr; }
}
/* phones */
@media (max-width: 767px) {
  .fbl-section { padding: 48px 0 44px; }
  .fbl-head { margin-bottom: 20px; }
  .fbl-head h2 { font-size: 24px; line-height: 1.25; margin: 0 0 8px; }
  .fbl-head p { font-size: 15px; }
  .fbl-cards { grid-template-columns: 1fr; gap: 12px; margin-bottom: 28px; }
  .fbl-card { padding: 20px 18px; border-radius: 20px; }
  .fbl-card h3 { font-size: 19px; padding-right: 54px; }
  .fbl-pin { width: 44px; height: 44px; font-size: 19px; top: 18px; right: 16px; border-radius: 14px; }
  .fbl-seal { width: 190px; height: 190px; right: -52px; bottom: -52px; }
  .fbl-stats span { height: 30px; font-size: 12.5px; padding: 0 10px; }
  .fbl-acts { display: grid; grid-template-columns: 1fr 1fr; }
  .fbl-btn { justify-content: center; padding: 0 12px; font-size: 14px; }
  .fbl-sub h3 { font-size: 16.5px; }
  /* two rows of city tiles you swipe sideways */
  .fbl-grid { grid-template-columns: none; grid-template-rows: repeat(2, auto); grid-auto-flow: column; grid-auto-columns: 42%; overflow-x: auto; scroll-snap-type: x mandatory;
    gap: 12px; margin: -6px -16px 16px; padding: 6px 16px 16px; scroll-padding-inline: 16px; scrollbar-width: none; }
  .fbl-grid::after { content: ""; width: 4px; grid-row: 1 / -1; }
  .fbl-grid::-webkit-scrollbar { display: none; }
  .fbl-tile { scroll-snap-align: start; aspect-ratio: 1 / 1; border-radius: 16px; box-shadow: 0 8px 16px -12px rgba(11,52,30,.6); }
  .fbl-tile:hover { transform: none; }
  .fbl-info { left: 11px; right: 11px; bottom: 10px; }
  .fbl-info b { font-size: 15px; }
  .fbl-info small { font-size: 11.5px; }
  .fbl-arrow { display: none; }
  .fbl-badge { top: 8px; left: 8px; font-size: 10px; padding: 3px 8px; }
  .fbl-places { flex-wrap: nowrap; overflow-x: auto; margin: -4px -16px 0; padding: 4px 16px 12px; scroll-padding-inline: 16px; scrollbar-width: none; }
  .fbl-places::after { content: ""; flex: none; width: 6px; }
  .fbl-places::-webkit-scrollbar { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .fbl-card, .fbl-tile, .fbl-tile img, .fbl-place, .fbl-go i { transition: none; }
  .fbl-open.on i, .fbl-ring { animation: none; }
}
`;
