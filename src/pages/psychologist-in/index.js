import React from "react";
import Head from "next/head";
import Link from "next/link";
import MyNavbar from "../../components/navbar";
import Footer from "../../components/footer";
import { fetchData } from "../../utils/actions";
import { getTherapistProfiles } from "../../utils/url";
import { useRouter } from "next/router";
import { PLACES, placePath, placeStats, isStateSlug, isAbroad, NOIDA_CENTRE, PLACE_IMG, PHOTO_CREDITS } from "../../utils/places";
import { getMinFee, sessionModes } from "../../utils/therapist-directory";
import { GBP_URL } from "../../components/about/visit-centre";
import dynamic from "next/dynamic";
import LeadCard from "../../components/global/lead-card";
import MobileActionBar from "../../components/global/mobile-action-bar";

const BookingPopup = dynamic(() => import("../../components/global/booking-popup"), { ssr: false });

// /psychologist-in — hub for every city / state page, with real counts. Gives the place
// pages one strong internal link source and a clear path for visitors outside those cities.
const SITE = "https://www.chooseyourtherapist.in";
const URL = `${SITE}/psychologist-in`;

export async function getStaticProps() {
  let stats = {};
  let total = 0;
  try {
    const res = await fetchData(getTherapistProfiles, { page: 1, pageSize: 1000 });
    const all = res?.data || [];
    total = all.length;
    stats = placeStats(all, getMinFee, sessionModes);
  } catch (e) {
    console.error("psychologist-in hub:", e?.message);
  }
  return { props: { stats, total }, revalidate: 3600 };
}

function PlaceTile({ slug, s }) {
  const p = PLACES[slug];
  const img = PLACE_IMG[slug];
  return (
    <Link href={placePath(slug)} className={`ph-tile${img ? "" : " noimg"}`}>
      {img
        ? <img src={`/assets/img/cities/w/${img}.webp`} alt={`Psychologist in ${p.name}`} width="480" height="320" loading="lazy" decoding="async" />
        : <span className="ph-letter" aria-hidden="true">{p.name.slice(0, 1)}</span>}
      <span className="ph-scrim" aria-hidden="true" />
      <span className="ph-info">
        <b>Psychologist in {p.name}{p.country ? `, ${p.country}` : ""}</b>
        <small>
          {s?.count ? `${s.count} ${isStateSlug(slug) || isAbroad(slug) ? "based here" : "nearby"}${s.inPerson ? ` · ${s.inPerson} in person` : ""}` : "Online sessions"}
          {s?.minFee ? ` · from ₹${s.minFee.toLocaleString("en-IN")}` : ""}
        </small>
      </span>
    </Link>
  );
}

export default function PsychologistHub({ stats, total }) {
  const router = useRouter();
  const [q, setQ] = React.useState("");
  const query = q.trim().toLowerCase();
  // a place matches its own name or any area listed for it ("Saket" -> Delhi)
  const matches = (slug) => !query || PLACES[slug].name.toLowerCase().includes(query) || PLACES[slug].cities.some((c) => c.toLowerCase().includes(query));
  const slugs = Object.keys(PLACES);
  const states = slugs.filter(isStateSlug).filter(matches).sort((a, b) => (stats[b]?.count || 0) - (stats[a]?.count || 0));
  const abroad = slugs.filter(isAbroad).filter(matches);
  const cities = slugs.filter((x) => !isStateSlug(x) && !isAbroad(x)).filter(matches).sort((a, b) => PLACES[a].name.localeCompare(PLACES[b].name));
  const title = "Find a Psychologist Near You — Cities & States in India | Choose Your Therapist";
  const description = `Verified psychologists across India — in person at our Noida centre and online from anywhere. Browse ${slugs.length} cities and states${total ? `, ${total} psychologists` : ""}.`;
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Find a psychologist near you",
      "url": URL,
      "description": description,
      "mainEntity": {
        "@type": "ItemList",
        "itemListElement": slugs.map((x, i) => ({ "@type": "ListItem", "position": i + 1, "name": `Psychologist in ${PLACES[x].name}`, "url": `${SITE}${placePath(x)}` })),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": `${SITE}/` },
        { "@type": "ListItem", "position": 2, "name": "Psychologists by city", "item": URL },
      ],
    },
  ];

  return (
    <div className="ph-page">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={URL} />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={URL} />
        {schemas.map((x, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(x) }} />)}
      </Head>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <MyNavbar />
      <main>
        <section className="ph-banner" aria-labelledby="ph-h1">
          <img className="ph-ban-img" src="/assets/img/therapist-directory-banner-1600.webp"
            srcSet="/assets/img/therapist-directory-banner-800.webp 800w, /assets/img/therapist-directory-banner-1600.webp 1600w"
            sizes="100vw" alt="" width="1600" height="750" fetchPriority="high" decoding="async" />
          <div className="container ph-ban-inner">
            <nav className="ph-crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link> <span aria-hidden="true">›</span> <span aria-current="page">Psychologists by city</span></nav>
            <p className="ph-eyebrow">{slugs.length} cities &amp; states · online across India</p>
            <h1 id="ph-h1">Find a psychologist <span>near you</span></h1>
            <p className="ph-sub">Meet in person at our Noida centre, or talk online from anywhere — {total ? `all ${total} of our` : "all our"} verified psychologists offer video or audio sessions.</p>
            <form className="ph-search" role="search" onSubmit={(e) => {
              e.preventDefault();
              const only = [...states, ...cities, ...abroad];
              if (only.length === 1) router.push(placePath(only[0]));
              else if (query && !only.length) router.push(`/view-all-therapist?search=${encodeURIComponent(q.trim())}`);
              else document.getElementById("ph-states")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}>
              <i className="feather-map-pin" aria-hidden="true" />
              <label htmlFor="ph-q" className="ph-sr">Search your city or state</label>
              <input id="ph-q" type="search" autoComplete="off" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Your city, state or area…" />
              <button type="submit">Search</button>
            </form>
            <div className="ph-quick">
              <Link href={NOIDA_CENTRE.book}><i className="feather-home" aria-hidden="true" /> Book at Noida centre</Link>
              <Link href="/view-all-therapist"><i className="feather-video" aria-hidden="true" /> Online — anywhere</Link>
            </div>
          </div>
        </section>

        <section className="container ph-cards">
          <div className="ph-card centre">
            <span className="ph-tag">Our centre</span>
            <h2>{NOIDA_CENTRE.name}</h2>
            <p>{NOIDA_CENTRE.address}<br />{NOIDA_CENTRE.hours}</p>
            <a href={GBP_URL} target="_blank" rel="noreferrer" className="ph-rate">★ 4.9 on Google · 178 reviews</a>
            <div className="ph-acts">
              <Link href={NOIDA_CENTRE.book} className="ph-btn">Book in person</Link>
              <Link href={NOIDA_CENTRE.page} className="ph-btn ghost">About the centre</Link>
            </div>
          </div>
          <div className="ph-card online">
            <span className="ph-tag">Anywhere in India</span>
            <h2>Online sessions</h2>
            <p>Video or audio sessions with {total ? `any of our ${total}` : "our"} verified psychologists — in Hindi, English and more.</p>
            <div className="ph-acts">
              <Link href="/view-all-therapist" className="ph-btn">Browse psychologists</Link>
              <Link href="/view-all-therapist?help=1" className="ph-btn ghost">Help me choose</Link>
            </div>
          </div>
        </section>

        <section className="container ph-sec" aria-labelledby="ph-states">
          <h2 id="ph-states">By state</h2>
          <div className="ph-grid">{states.map((x) => <PlaceTile key={x} slug={x} s={stats[x]} />)}</div>
        </section>
        <section className="container ph-sec" aria-labelledby="ph-cities">
          <h2 id="ph-cities">By city</h2>
          <div className="ph-grid">{cities.map((x) => <PlaceTile key={x} slug={x} s={stats[x]} />)}</div>
          {!states.length && !cities.length && !abroad.length && <p className="ph-note"><b>No city page for “{q.trim()}” yet</b> — but you can talk to any of our psychologists online.</p>}
          {abroad.length > 0 && (
            <>
              <h2 id="ph-abroad" className="ph-sub-h">Outside India</h2>
              <div className="ph-grid">{abroad.map((x) => <PlaceTile key={x} slug={x} s={stats[x]} />)}</div>
            </>
          )}
          <p className="ph-note">Don't see your city? You can still book any psychologist online — <Link href="/view-all-therapist">browse everyone</Link>.</p>
          <div className="ph-lead">
            <LeadCard tag="Hub · Psychologists by city" title="Can't find your city? We'll match you with someone"
              waText="Hi, I'm looking for a psychologist near me." />
          </div>
          <details className="ph-credit">
            <summary>Photo credits</summary>
            <p>
              City photos from <a href="https://commons.wikimedia.org/" target="_blank" rel="noreferrer nofollow">Wikimedia Commons</a>:{" "}
              {PHOTO_CREDITS.map((c, i) => (
                <React.Fragment key={c.file}>
                  {i > 0 && " · "}
                  <a href={`https://commons.wikimedia.org/wiki/File:${encodeURIComponent(c.file)}`} target="_blank" rel="noreferrer nofollow">{c.what}</a> by {c.by} ({c.license})
                </React.Fragment>
              ))}
              {" "}· other city photos by Wikimedia Commons contributors (CC BY-SA).
            </p>
          </details>
        </section>
      </main>
      <Footer />
      <BookingPopup delay={20000} showHeading={false} showLocation={false} showSource={false}
        title="Looking for a psychologist near you?"
        note="Tell us your city and what you're going through — our team will WhatsApp you with psychologists who fit."
        sourceTag="Popup · Hub · Psychologists by city" />
      <MobileActionBar waText="Hi, I'm looking for a psychologist near me." />
    </div>
  );
}

const CSS = `
.ph-page main { background: #fff; padding-bottom: 60px; }
.ph-banner { position: relative; overflow: hidden; padding: 60px 0 52px; background: #0b1712; }
.ph-ban-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 30% 30%; transform: scaleX(-1); }
.ph-banner::before { content: ""; position: absolute; inset: 0; z-index: 1; background: linear-gradient(90deg, rgba(7,26,17,.88) 0%, rgba(7,26,17,.66) 42%, rgba(7,26,17,.25) 75%, rgba(7,26,17,.08) 100%); }
@media (min-width: 992px) { .ph-ban-img { top: 200px; height: calc(100% - 200px); } }
.ph-ban-inner { position: relative; z-index: 2; }
.ph-crumbs { font-size: 13px; color: rgba(255,255,255,.65); margin-bottom: 14px; }
.ph-crumbs a { color: rgba(255,255,255,.85); font-weight: 600; text-decoration: none; }
.ph-eyebrow { display: inline-flex; align-items: center; gap: 8px; margin: 0 0 10px; padding: 0; font-size: 11.5px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; color: #ecc77d; }
.ph-eyebrow::before { content: ""; width: 22px; height: 2px; background: #d4a24c; }
.ph-banner h1 { font-size: clamp(28px, 4.2vw, 46px); font-weight: 800; color: #fff; margin: 0 0 10px; letter-spacing: -.02em; line-height: 1.15; }
.ph-banner h1 span { color: #ecc77d; }
.ph-sub { font-size: clamp(15px, 1.4vw, 17px); color: rgba(255,255,255,.9); line-height: 1.6; margin: 0 0 22px; padding: 0; max-width: 560px; font-weight: 500; }
.ph-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; }
.ph-search { position: relative; display: flex; align-items: center; max-width: 600px; background: #fff; border-radius: 14px; padding: 6px; box-shadow: 0 18px 40px -16px rgba(0,0,0,.55); }
.ph-search:focus-within { box-shadow: 0 0 0 3px rgba(236,199,125,.6), 0 18px 40px -16px rgba(0,0,0,.55); }
.ph-search > i { position: absolute; left: 20px; font-size: 18px; color: #64748b; pointer-events: none; }
.ph-search input { flex: 1; min-width: 0; height: 48px; border: none !important; outline: none; background: transparent; padding: 0 12px 0 46px; font-size: 15.5px; color: #0f172a; box-shadow: none !important; }
.ph-search input::-webkit-search-cancel-button { display: none; }
.ph-search button { flex-shrink: 0; height: 48px; padding: 0 26px; border: none; border-radius: 10px; background: #1e7a4c; color: #fff; font-size: 15px; font-weight: 800; cursor: pointer; }
.ph-search button:hover { background: #186640; }
.ph-quick { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
.ph-quick a { display: inline-flex; align-items: center; gap: 6px; height: 36px; padding: 0 14px; border-radius: 999px; border: 1px solid rgba(255,255,255,.35); background: rgba(255,255,255,.12); color: #fff !important; font-size: 13px; font-weight: 600; text-decoration: none !important; backdrop-filter: blur(4px); }
.ph-quick a:hover { background: #fff; color: #14532d !important; }
@media (max-width: 767px) {
  .ph-banner { padding: 24px 0 22px; }
  .ph-ban-img { object-position: 70% 10%; }
  .ph-banner::before { background: linear-gradient(180deg, rgba(7,26,17,.72), rgba(7,26,17,.84)); }
  .ph-sub { display: none; }
  .ph-banner h1 { font-size: 26px; margin-bottom: 14px; }
  .ph-eyebrow { font-size: 10px; letter-spacing: .6px; }
  .ph-eyebrow::before { display: none; }
  .ph-search { padding: 5px; border-radius: 12px; }
  .ph-search input { height: 44px; font-size: 15px; padding-left: 40px; }
  .ph-search > i { left: 17px; }
  .ph-search button { height: 44px; padding: 0 16px; font-size: 14px; }
}
.ph-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 32px; }
.ph-card { border-radius: 18px; padding: 22px 24px; display: flex; flex-direction: column; gap: 8px; }
.ph-card.centre { background: #14532d; color: #fff; }
.ph-card.online { background: #fffaf0; border: 1px solid #f0dfba; }
.ph-tag { align-self: flex-start; font-size: 11px; font-weight: 800; letter-spacing: .5px; text-transform: uppercase; padding: 3px 9px; border-radius: 6px; background: rgba(236,199,125,.2); color: #ecc77d; }
.ph-card.online .ph-tag { background: #fbf0d9; color: #9a6f22; }
.ph-card h2 { font-size: 21px; font-weight: 800; margin: 2px 0 0; color: inherit; }
.ph-card.online h2 { color: #14532d; }
.ph-card p { margin: 0; padding: 0; font-size: 14.5px; line-height: 1.6; color: rgba(255,255,255,.82); }
.ph-card.online p { color: #6b5a3a; }
.ph-rate { color: #ecc77d !important; font-weight: 700; font-size: 14px; text-decoration: none !important; }
.ph-acts { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 6px; }
.ph-btn { display: inline-flex; align-items: center; height: 44px; padding: 0 18px; border-radius: 12px; background: #1e7a4c; color: #fff !important; font-weight: 800; font-size: 14px; text-decoration: none !important; }
.ph-card.centre .ph-btn { background: #ecc77d; color: #14532d !important; }
.ph-btn.ghost { background: transparent !important; border: 1.5px solid currentColor; color: #14532d !important; }
.ph-card.centre .ph-btn.ghost { color: #fff !important; }
.ph-sec { margin-top: 40px; }
.ph-sec h2 { font-size: 20px; font-weight: 800; color: #14532d; margin: 0 0 14px; }
.ph-sec h2.ph-sub-h { margin-top: 28px; }
.ph-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.ph-tile { position: relative; display: block; aspect-ratio: 16 / 10; border-radius: 16px; overflow: hidden; background: #dfeee5; text-decoration: none !important; box-shadow: 0 10px 24px -16px rgba(20,83,45,.5); }
.ph-tile img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .5s ease; }
.ph-tile:hover img { transform: scale(1.06); }
.ph-tile.noimg { background: radial-gradient(120% 90% at 85% 10%, #2a8a5a 0%, #14532d 55%, #0b2418 100%); }
.ph-letter { position: absolute; right: 14px; top: 2px; font-size: 96px; font-weight: 800; line-height: 1; color: rgba(236,199,125,.22); }
.ph-scrim { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(7,26,17,0) 35%, rgba(7,26,17,.84) 100%); }
.ph-tile.noimg .ph-scrim { background: none; }
.ph-info { position: absolute; left: 14px; right: 14px; bottom: 12px; display: flex; flex-direction: column; gap: 2px; color: #fff; }
.ph-info b { font-size: 16px; font-weight: 800; }
.ph-info small { font-size: 12.5px; color: rgba(255,255,255,.85); }
.ph-lead { margin-top: 36px; }
.ph-credit { margin: 18px 0 0; font-size: 11.5px; color: #94a3b8; }
.ph-credit summary { cursor: pointer; font-weight: 700; color: #64748b; }
.ph-credit p { margin: 6px 0 0; padding: 0; line-height: 1.6; }
.ph-credit a { color: #64748b; }
.ph-note { margin: 16px 0 0; padding: 0; font-size: 14px; color: #64748b; }
.ph-note a { color: #1e7a4c; font-weight: 700; }
@media (max-width: 991px) { .ph-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 640px) { .ph-cards, .ph-grid { grid-template-columns: 1fr; } }
`;
