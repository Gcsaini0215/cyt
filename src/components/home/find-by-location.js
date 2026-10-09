import React from "react";
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
  { label: "Noida", img: "noida", slug: "uttar-pradesh", href: "/psychologist-in-noida-delhi", note: "in-person centre" },
  { label: "Mumbai", img: "mumbai", slug: "mumbai" },
  { label: "Bangalore", img: "bangalore", slug: "bangalore" },
  { label: "Hyderabad", img: "hyderabad", slug: "hyderabad" },
  { label: "Chennai", img: "chennai", slug: "chennai" },
  { label: "Kolkata", img: "kolkata", slug: "kolkata" },
  { label: "Jaipur", img: "jaipur", slug: "jaipur" },
  { label: "Uttarakhand", img: "dehradun", slug: "uttarakhand" },
];
export default function FindByLocation({ stats = {}, total = 0, visitorState = null }) {
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
          <h2 id="fbl-h">Find a psychologist near you</h2>
          <p>Meet in person at our Noida centre, or talk online from anywhere in India — and abroad.</p>
        </div>

        <div className="fbl-cards">
          {near && n ? (
            <Link href={placePath(near)} className="fbl-card near">
              <span className="fbl-tag"><i className="feather-map-pin" aria-hidden="true" /> Near you</span>
              <h3>Psychologists in {PLACES[near].name}</h3>
              <p>
                {n.count ? `${n.count} based here${n.inPerson ? ` · ${n.inPerson} in person` : ""}` : "Online sessions from anywhere"}
                {n.minFee ? ` · from ₹${n.minFee.toLocaleString("en-IN")}` : ""}
              </p>
              <span className="fbl-go">See who can help <i className="feather-arrow-right" aria-hidden="true" /></span>
            </Link>
          ) : (
            <Link href="/view-all-therapist" className="fbl-card near">
              <span className="fbl-tag"><i className="feather-globe" aria-hidden="true" /> Anywhere in India</span>
              <h3>Online sessions</h3>
              <p>Video or audio sessions with {total ? `any of our ${total}` : "our"} verified psychologists — in Hindi, English and more.</p>
              <span className="fbl-go">Browse psychologists <i className="feather-arrow-right" aria-hidden="true" /></span>
            </Link>
          )}
          <div className="fbl-card centre">
            <span className="fbl-tag"><i className="feather-home" aria-hidden="true" /> Our centre</span>
            <h3>{NOIDA_CENTRE.name}</h3>
            <p>{NOIDA_CENTRE.address} · {NOIDA_CENTRE.hours}</p>
            <a href={GBP_URL} target="_blank" rel="noreferrer" className="fbl-rate">★ 4.9 on Google · 178 reviews</a>
            <div className="fbl-acts">
              <Link href={NOIDA_CENTRE.book} className="fbl-btn">Book in person</Link>
              <a href={GBP_URL} target="_blank" rel="noreferrer" className="fbl-btn ghost">Directions</a>
            </div>
          </div>
        </div>

        <div className="fbl-grid" aria-label="Psychologists in major cities">
          {TILES.map((t) => {
            const st = stats[t.slug];
            return (
              <Link key={t.label} href={t.href || placePath(t.slug)} className={`fbl-tile${t.slug === near ? " on" : ""}`}>
                <img src={`/assets/img/cities/w/${t.img}.webp`} alt={`Psychologist in ${t.label}`} width="480" height="320" loading="lazy" decoding="async" />
                <span className="fbl-scrim" aria-hidden="true" />
                <span className="fbl-info">
                  <b>{t.label}</b>
                  <small>{t.note ? t.note : st?.count ? `${st.count} psychologist${st.count !== 1 ? "s" : ""}${st.inPerson ? " · in person" : ""}` : "Online sessions"}</small>
                </span>
              </Link>
            );
          })}
          <Link href="/psychologist-in" className="fbl-tile fbl-tile-all">
            <span className="fbl-info"><b>All cities &amp; states</b><small>Online from anywhere in India</small></span>
            <i className="feather-arrow-right" aria-hidden="true" />
          </Link>
        </div>

        <div className="fbl-places" aria-label="More cities and states">
          {ranked.map((slug) => {
            const s = stats[slug];
            return (
              <Link key={slug} href={placePath(slug)} className={`fbl-place${slug === near ? " on" : ""}${isAbroad(slug) ? " abroad" : ""}`}>
                {isAbroad(slug) && <i className="feather-globe" aria-hidden="true" />}
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
.fbl-section { background: #f7faf8; padding: 64px 0 60px; }
.fbl-head { margin-bottom: 22px; }
.fbl-head h2 { font-size: clamp(1.6rem, 3.2vw, 2.2rem); font-weight: 800; color: #0b1712; margin: 0 0 6px; letter-spacing: -.01em; }
.fbl-head p { color: #64748b; font-size: 15px; margin: 0; padding: 0; }
@media (min-width: 768px) and (max-width: 1100px) { .fbl-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
.fbl-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
.fbl-card { display: flex; flex-direction: column; gap: 6px; padding: 22px 24px; border-radius: 18px; text-decoration: none !important; }
.fbl-card.near { background: #fff; border: 1px solid #e3ebe6; box-shadow: 0 2px 10px rgba(20,83,45,.05); transition: border-color .2s, box-shadow .2s; }
.fbl-card.near:hover { border-color: #1e7a4c; box-shadow: 0 14px 30px -16px rgba(20,83,45,.35); }
.fbl-card.centre { background: #14532d; color: #fff; }
.fbl-tag { align-self: flex-start; display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 800; letter-spacing: .5px; text-transform: uppercase; padding: 4px 9px; border-radius: 6px; background: #eef6f1; color: #1e7a4c; }
.fbl-card.centre .fbl-tag { background: rgba(236,199,125,.2); color: #ecc77d; }
.fbl-card h3 { font-size: 20px; font-weight: 800; color: #0b1712; margin: 4px 0 0; }
.fbl-card.centre h3 { color: #fff; }
.fbl-card p { margin: 0; padding: 0; font-size: 14.5px; color: #475569; line-height: 1.55; }
.fbl-card.centre p { color: rgba(255,255,255,.8); }
.fbl-go { margin-top: auto; padding-top: 6px; display: inline-flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 800; color: #1e7a4c; }
.fbl-rate { color: #ecc77d !important; font-weight: 700; font-size: 14px; text-decoration: none !important; }
.fbl-acts { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 6px; }
.fbl-btn { display: inline-flex; align-items: center; height: 42px; padding: 0 18px; border-radius: 11px; background: #ecc77d; color: #14532d !important; font-weight: 800; font-size: 14px; text-decoration: none !important; }
.fbl-btn.ghost { background: transparent; border: 1.5px solid rgba(255,255,255,.5); color: #fff !important; }
.fbl-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 14px; margin-bottom: 18px; }
.fbl-tile { position: relative; display: block; aspect-ratio: 3 / 2; border-radius: 16px; overflow: hidden; background: #dfeee5; text-decoration: none !important; box-shadow: 0 10px 24px -16px rgba(20,83,45,.5); }
.fbl-tile img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .5s ease; }
.fbl-tile:hover img { transform: scale(1.06); }
.fbl-tile.on { outline: 3px solid #d4a24c; outline-offset: 2px; }
.fbl-scrim { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(7,26,17,0) 35%, rgba(7,26,17,.82) 100%); }
.fbl-info { position: absolute; left: 12px; right: 12px; bottom: 10px; display: flex; flex-direction: column; color: #fff; }
.fbl-info b { font-size: 15.5px; font-weight: 800; }
.fbl-info small { font-size: 12px; color: rgba(255,255,255,.85); }
.fbl-tile-all { background: #14532d; display: flex; align-items: flex-end; }
.fbl-tile-all .fbl-info small { color: #ecc77d; }
.fbl-tile-all > i { position: absolute; top: 12px; right: 14px; color: #ecc77d; font-size: 20px; }
.fbl-credit { margin: 14px 0 0; padding: 0; font-size: 11.5px; color: #94a3b8; }
.fbl-credit a { color: #64748b; }
.fbl-places { display: flex; flex-wrap: wrap; gap: 8px; }
.fbl-place { display: inline-flex; align-items: center; gap: 8px; height: 38px; padding: 0 8px 0 14px; border-radius: 999px; border: 1px solid #dbe5df; background: #fff; color: #26463a !important; font-size: 13.5px; font-weight: 600; text-decoration: none !important; white-space: nowrap; }
.fbl-place small { font-size: 11px; font-weight: 800; color: #1e7a4c; background: #eef6f1; border-radius: 999px; padding: 2px 8px; }
.fbl-place.abroad { border-color: #d4a24c; background: #fffaf0; }
.fbl-place.abroad > i { color: #b7832f; font-size: 14px; margin-right: -2px; }
.fbl-place:hover, .fbl-place.on { border-color: #1e7a4c; color: #1e7a4c !important; }
.fbl-foot { margin-top: 16px; }
.fbl-all { display: inline-flex; align-items: center; gap: 6px; color: #1e7a4c !important; font-weight: 800; font-size: 14.5px; text-decoration: none !important; }
@media (max-width: 767px) {
  .fbl-section { padding: 44px 0 40px; }
  .fbl-cards { grid-template-columns: 1fr; gap: 12px; }
  .fbl-card { padding: 18px; }
  .fbl-grid { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; gap: 10px; margin: 0 -16px 14px; padding: 2px 16px 6px; scrollbar-width: none; }
  .fbl-grid::-webkit-scrollbar { display: none; }
  .fbl-tile { flex: 0 0 46%; scroll-snap-align: start; }
  .fbl-places { flex-wrap: nowrap; overflow-x: auto; margin: 0 -16px; padding: 0 16px 4px; scrollbar-width: none; }
  .fbl-places::-webkit-scrollbar { display: none; }
}
`;
