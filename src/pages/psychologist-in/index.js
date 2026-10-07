import React from "react";
import Head from "next/head";
import Link from "next/link";
import MyNavbar from "../../components/navbar";
import Footer from "../../components/footer";
import { fetchData } from "../../utils/actions";
import { getTherapistProfiles } from "../../utils/url";
import { PLACES, placePath, placeStats, isStateSlug, NOIDA_CENTRE } from "../../utils/places";
import { getMinFee, sessionModes } from "../../utils/therapist-directory";
import { GBP_URL } from "../../components/about/visit-centre";

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
  return (
    <Link href={placePath(slug)} className="ph-tile">
      <b>Psychologist in {p.name}</b>
      <span>
        {s?.count ? `${s.count} based here${s.inPerson ? ` · ${s.inPerson} in person` : ""}` : "Online sessions"}
        {s?.minFee ? ` · from ₹${s.minFee.toLocaleString("en-IN")}` : ""}
      </span>
    </Link>
  );
}

export default function PsychologistHub({ stats, total }) {
  const slugs = Object.keys(PLACES);
  const states = slugs.filter(isStateSlug).sort((a, b) => (stats[b]?.count || 0) - (stats[a]?.count || 0));
  const cities = slugs.filter((x) => !isStateSlug(x)).sort((a, b) => PLACES[a].name.localeCompare(PLACES[b].name));
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
        <section className="ph-hero">
          <div className="container">
            <nav className="ph-crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link> <span aria-hidden="true">›</span> <span aria-current="page">Psychologists by city</span></nav>
            <h1>Find a psychologist near you</h1>
            <p>Meet a psychologist in person at our Noida centre, or talk online from anywhere in India — {total ? `all ${total} of our` : "all our"} verified psychologists offer video or audio sessions.</p>
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
          <p className="ph-note">Don't see your city? You can still book any psychologist online — <Link href="/view-all-therapist">browse everyone</Link>.</p>
        </section>
      </main>
      <Footer />
    </div>
  );
}

const CSS = `
.ph-page main { background: #fff; padding-bottom: 60px; }
.ph-hero { background: linear-gradient(180deg, #f3f9f5, #fff); padding: 30px 0 26px; border-bottom: 1px solid #edf3ef; }
.ph-crumbs { font-size: 13px; color: #64748b; margin-bottom: 14px; }
.ph-crumbs a { color: #1e7a4c; font-weight: 600; text-decoration: none; }
.ph-hero h1 { font-size: clamp(28px, 4vw, 42px); font-weight: 800; color: #0b1712; margin: 0 0 10px; letter-spacing: -.02em; }
.ph-hero p { font-size: 16.5px; color: #475569; line-height: 1.65; margin: 0; padding: 0; max-width: 66ch; }
.ph-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 28px; }
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
.ph-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.ph-tile { display: flex; flex-direction: column; gap: 4px; padding: 14px 16px; border-radius: 14px; border: 1px solid #e3ebe6; background: #fff; text-decoration: none !important; transition: border-color .2s, box-shadow .2s; }
.ph-tile:hover { border-color: #1e7a4c; box-shadow: 0 10px 24px -16px rgba(20,83,45,.4); }
.ph-tile b { font-size: 15.5px; color: #0b1712; }
.ph-tile span { font-size: 13px; color: #64748b; }
.ph-note { margin: 16px 0 0; padding: 0; font-size: 14px; color: #64748b; }
.ph-note a { color: #1e7a4c; font-weight: 700; }
@media (max-width: 991px) { .ph-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 640px) { .ph-cards, .ph-grid { grid-template-columns: 1fr; } }
`;
