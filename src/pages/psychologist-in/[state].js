import React from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import Footer from "../../components/footer";
import MyNavbar from "../../components/navbar";
import { fetchData } from "../../utils/actions";
import { getTherapistProfiles } from "../../utils/url";
import { profilePath } from "../../utils/therapist-slug";
import { PLACES as STATE_CONFIG, PLACE_SERVICES as SERVICES, inPlace, PLACE_IMG } from "../../utils/places";
import ProfileCardRow, { CARD_CSS } from "../../components/home/profile-card-row";
import LeadCard from "../../components/global/lead-card";
import MobileActionBar from "../../components/global/mobile-action-bar";
import { CONCERN_PAGES, concernPath } from "../../utils/concerns";
import { split as splitList } from "../../utils/therapist-directory";
import { slimTherapist, sortTherapists, getMinFee, sessionModes } from "../../utils/therapist-directory";

const SHOW = 12;

const BookingPopup = dynamic(() => import("../../components/global/booking-popup"), { ssr: false });

// ─── Static generation: known state slugs are prebuilt; anything else is a
// real 404 (not a soft-404 rendered client-side, which Google discounts).
// revalidate keeps the therapist list from going stale without a redeploy.
export async function getStaticPaths() {
  return {
    paths: Object.keys(STATE_CONFIG).map(slug => ({ params: { state: slug } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const config = STATE_CONFIG[params.state];
  if (!config) return { notFound: true };

  let list = [];
  let total = 0;
  try {
    const res = await fetchData(getTherapistProfiles);
    const all = (res?.data) ? res.data : (Array.isArray(res) ? res : []);
    total = all.length;
    list = all.filter((t) => inPlace(t, config));
  } catch (e) {
    console.error("Error in psychologist-in/[state] getStaticProps:", e);
  }
  const fees = list.map((t) => getMinFee(t.fees)).filter(Boolean);
  const ratings = list.flatMap((t) => (t.reviews || []).map((r) => r.rating)).filter((r) => typeof r === "number");
  const stats = {
    count: list.length,
    inPerson: list.filter((t) => sessionModes(t).inPerson).length,
    minFee: fees.length ? Math.min(...fees) : null,
    rating: ratings.length ? { avg: Number((ratings.reduce((a, r) => a + r, 0) / ratings.length).toFixed(1)), count: ratings.length } : null,
    total,
    languages: [...new Set(list.flatMap((t) => splitList(t.language_spoken)))].slice(0, 6),
  };
  const updatedAt = new Date().toISOString();

  return {
    // the real list (no placeholder numbers), rendered on the server so search engines see it
    props: { config, therapists: sortTherapists(list, "", null).slice(0, SHOW).map(slimTherapist), stats, updatedAt },
    revalidate: 3600,
  };
}

// ─── Page component ──────────────────────────────────────────────────────────
export default function StatePsychologistPage({ config, therapists, stats = {}, updatedAt = null }) {
  const updatedLabel = updatedAt ? new Date(updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "";
  const near = isCityPage(config) ? "near" : "in";
  // short, factual statements — the kind search engines and AI assistants quote directly
  const facts = [
    stats.count > 0
      ? `${stats.count} verified psychologist${stats.count !== 1 ? "s" : ""} based ${near} ${config.name}${stats.inPerson ? `; ${stats.inPerson === stats.count ? (stats.count === 1 ? "they also see" : "all also see") : `${stats.inPerson} also see`} clients in person` : ""}.`
      : `No psychologists are based in ${config.name} yet; all ${stats.total || ""} Choose Your Therapist psychologists offer online sessions.`,
    stats.minFee ? `Sessions start from ₹${stats.minFee.toLocaleString("en-IN")}; each psychologist's fee is shown on their profile before booking.` : null,
    stats.rating ? `Average client rating ${stats.rating.avg}/5 from ${stats.rating.count} verified reviews.` : null,
    stats.languages?.length ? `Languages: ${stats.languages.join(", ")}.` : null,
    "Online video and audio sessions are available anywhere in India; in-person sessions at the CYT centre in Sector 51, Noida (Mon–Sun, 9 AM–9 PM).",
    "Every psychologist's qualifications and documents are checked by the CYT team before their profile goes live.",
  ].filter(Boolean);
  const [now, setNow] = React.useState(null);
  React.useEffect(() => { setNow(Date.now()); }, []);
  const isCity = Boolean(config.relatedRegion) || !/pradesh|delhi|maharashtra|rajasthan|gujarat|chandigarh|uttarakhand|bengal/i.test(config.slug);
  // therapists record their state, not their city — the directory search matches that
  const dirHref = `/view-all-therapist?search=${encodeURIComponent(config.filterValues[0])}`;
  const PAGE_URL = `https://www.chooseyourtherapist.in/psychologist-in/${config.slug}`;
  const OG_IMAGE = "https://i.postimg.cc/gj1yngrd/choose.png";

  // ── Schema ────────────────────────────────────────────────────────────────
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${PAGE_URL}#service`,
    "name": `Psychologists for ${config.name}`,
    "serviceType": "Psychological counselling and therapy",
    "description": config.description,
    "url": PAGE_URL,
    "provider": { "@type": "MedicalOrganization", "@id": "https://www.chooseyourtherapist.in#organization", "name": "Choose Your Therapist", "telephone": "+91-8077757951" },
    "areaServed": [
      { "@type": isCity ? "City" : "State", "name": config.name },
      ...config.cities.map((c) => ({ "@type": "Place", "name": c })),
    ],
    "availableChannel": { "@type": "ServiceChannel", "serviceUrl": PAGE_URL, "name": "Online video / audio sessions" },
    ...(stats.minFee ? { "offers": { "@type": "Offer", "priceCurrency": "INR", "price": stats.minFee, "description": "Starting fee per session" } } : {}),
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": config.faqs.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a }
    }))
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.chooseyourtherapist.in/" },
      { "@type": "ListItem", "position": 2, "name": "Find a Psychologist", "item": "https://www.chooseyourtherapist.in/view-all-therapist" },
      { "@type": "ListItem", "position": 3, "name": `Psychologist in ${config.name}`, "item": PAGE_URL }
    ]
  };

  // WebPage + speakable — flags the headline/intro as the citable summary
  // for voice assistants and AI answer engines.
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${PAGE_URL}#webpage`,
    "url": PAGE_URL,
    "name": `Best Psychologist in ${config.name} | Choose Your Therapist`,
    "description": config.description,
    "isPartOf": { "@id": "https://www.chooseyourtherapist.in#organization" },
    "about": { "@id": `${PAGE_URL}#service` },
    "speakable": { "@type": "SpeakableSpecification", "cssSelector": ["h1", ".pl-facts-box", ".local-intro-text"] },
    ...(updatedAt ? { "dateModified": updatedAt } : {})
  };

  // ItemList of the real, currently-displayed verified psychologists —
  // omitted entirely when the city has none yet (no placeholder entries).
  const itemListSchema = therapists.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Verified Psychologists in ${config.name}`,
    "itemListElement": therapists.slice(0, 12).map((t, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "item": {
        "@type": "Person",
        "name": t.user?.name || t.name || "Verified Psychologist",
        "jobTitle": t.profile_type || "Psychologist",
        "url": `https://www.chooseyourtherapist.in${profilePath(t)}`
      }
    }))
  } : null;

  return (
    <div style={{ overflowX: "hidden", width: "100%" }}>
      <Head>
        <title>Best Psychologist in {config.name} | Verified Therapists | Choose Your Therapist</title>
        <meta name="description" content={config.description} />
        <meta name="keywords" content={config.localKeywords} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={PAGE_URL} />

        <meta name="geo.region" content={config.geo.region} />
        <meta name="geo.placename" content={config.name} />
        <meta name="geo.position" content={`${config.geo.lat};${config.geo.lng}`} />
        <meta name="ICBM" content={`${config.geo.lat}, ${config.geo.lng}`} />

        <meta key="og:type" property="og:type" content="website" />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:title" content={`Best Psychologist in ${config.name} | Choose Your Therapist`} />
        <meta property="og:description" content={config.description} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta key="og:site_name" property="og:site_name" content="Choose Your Therapist" />
        <meta key="og:locale" property="og:locale" content="en_IN" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Best Psychologist in ${config.name} | Choose Your Therapist`} />
        <meta name="twitter:description" content={config.description} />
        <meta name="twitter:image" content={OG_IMAGE} />
        <meta name="twitter:site" content="@CYT_India" />

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }} />
        {itemListSchema && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
        )}
      </Head>

      <MyNavbar />

      {/* ── Banner: the place's photo, real numbers, two actions ── */}
      <section className="pl-banner" aria-labelledby="pl-h1">
        <img className="pl-ban-img" alt=""
          src={PLACE_IMG[config.slug] ? `/assets/img/cities/b/${PLACE_IMG[config.slug]}.webp` : "/assets/img/therapist-directory-banner-1600.webp"}
          width="1200" height="520" fetchPriority="high" decoding="async" />
        <div className="container pl-ban-inner">
          <nav className="pl-crumbs" aria-label="Breadcrumb">
            <a href="/">Home</a> <span aria-hidden="true">›</span> <a href="/psychologist-in">Psychologists by city</a> <span aria-hidden="true">›</span> <span aria-current="page">{config.name}</span>
          </nav>
          <p className="pl-eyebrow">Verified psychologists · online &amp; in person</p>
          <h1 id="pl-h1">Psychologist in <span>{config.name}</span></h1>
          <p className="pl-sub">{config.description}</p>
          <ul className="pl-facts">
            {stats.count > 0
              ? <li><b>{stats.count}</b> based {isCity ? "nearby" : "here"}</li>
              : <li><b>{stats.total || "50+"}</b> online, anywhere in India</li>}
            {stats.inPerson > 0 && <li><b>{stats.inPerson}</b> in person</li>}
            {stats.rating && <li><b>{stats.rating.avg} ★</b> {stats.rating.count} reviews</li>}
            {stats.minFee && <li>from <b>₹{stats.minFee.toLocaleString("en-IN")}</b></li>}
          </ul>
          <div className="pl-ctas">
            <a href="#therapists" className="pl-btn gold">See psychologists</a>
            <button type="button" className="pl-btn line" onClick={() => window.dispatchEvent(new Event("cyt:open-chat"))}>
              <i className="feather-message-circle" aria-hidden="true" /> Talk to us
            </button>
          </div>
        </div>
      </section>

      {/* ── Therapist cards (rendered on the server, so search engines see who practises here) ── */}
      <style dangerouslySetInnerHTML={{ __html: CARD_CSS + PLACE_CSS }} />
      <div id="therapists" className="pl-thers">
        <div className="container">
          <div className="pl-head">
            <h2>{stats.count > 0 ? `Psychologists ${isCity ? "near" : "in"} ${config.name}` : `Talk to a psychologist online from ${config.name}`}</h2>
            <p>
              {stats.count > 0
                ? `${stats.count} verified psychologist${stats.count !== 1 ? "s" : ""} based ${isCity ? "near" : "in"} ${config.name}${stats.inPerson ? `, ${stats.inPerson} of them also in person` : ""} — and every one of our ${stats.total || ""} psychologists is available online.`
                : `We don't have psychologists based in ${config.name} yet, but all ${stats.total || ""} of our verified psychologists see clients online — wherever you are in India.`}
            </p>
          </div>
          {therapists.length > 0 ? (
            <div className="pl-list">
              {therapists.map((t) => <ProfileCardRow key={t._id} data={t} favrioutes={[]} now={now} />)}
            </div>
          ) : (
            <div className="pl-empty"><a href="/view-all-therapist" className="pl-btn">See all psychologists — online</a></div>
          )}
          <div className="pl-more">
            {stats.count > therapists.length && <a href={dirHref} className="pl-btn">See all {stats.count} in {config.name}</a>}
            <a href="/view-all-therapist" className="pl-btn ghost">Browse all {stats.total || ""} psychologists online</a>
            <a href="/psychologist-in" className="pl-link">Other cities &amp; states →</a>
          </div>
        </div>
      </div>

      {/* ── Lead capture ── */}
      <div className="pl-lead">
        <div className="container">
          <LeadCard tag={`City · ${config.name}`} title={`Not sure who to pick in ${config.name}?`}
            waText={`Hi, I'm looking for a psychologist in ${config.name}.`} />
        </div>
      </div>

      {/* ── Quick facts (dated) ── */}
      <section className="pl-factsec" aria-labelledby="pl-facts-h">
        <div className="container pl-narrow">
          <h2 id="pl-facts-h">Quick facts: psychologists {near} {config.name}</h2>
          <ul className="pl-facts-box">{facts.map((x) => <li key={x}>{x}</li>)}</ul>
          {updatedLabel && <p className="pl-updated">Updated {updatedLabel} from our live directory.</p>}
          <h3>Help for common concerns</h3>
          <div className="pl-concerns">
            {CONCERN_PAGES.slice(0, 8).map((c) => <a key={c.slug} href={concernPath(c)}>{c.title}</a>)}
          </div>
        </div>
      </section>

      {/* ── Local intro (unique per page) ── */}
      {config.localIntro && (
        <section className="pl-intro">
          <div className="container pl-narrow">
            <h2>Therapy in {config.name}</h2>
            <p className="local-intro-text">{config.localIntro}</p>
            {config.cities?.length > 0 && <p className="pl-areas"><b>Areas:</b> {config.cities.join(" · ")}</p>}
            {config.relatedRegion && (
              <p className="pl-areas">More psychologists across <a href={`/psychologist-in/${config.relatedRegion.slug}`}>{config.relatedRegion.name}</a>.</p>
            )}
          </div>
        </section>
      )}

      {/* ── FAQ ── */}
      <section className="pl-faqs">
        <div className="container pl-narrow">
          <h2>Common questions about therapy in {config.name}</h2>
          {config.faqs.map((faq, i) => <FaqItem key={i} q={faq.q} a={faq.a} />)}
        </div>
      </section>

      <Footer />
      <BookingPopup delay={15000} showHeading={false} showLocation={false} showSource={false}
        title={`Looking for a psychologist in ${config.name}?`}
        note="Tell us a little — our team will WhatsApp you with psychologists who fit, usually within minutes."
        sourceTag={`Popup · City · ${config.name}`} />
      <MobileActionBar waText={`Hi, I'm looking for a psychologist in ${config.name}.`} />
    </div>
  );
}

const isCityPage = (config) => Boolean(config.relatedRegion) || !/pradesh|delhi|maharashtra|rajasthan|gujarat|chandigarh|uttarakhand|bengal/i.test(config.slug);

// FAQ item: a native <details>, so the answer is in the HTML (crawlable) and works without JS
function FaqItem({ q, a }) {
  return (
    <details className="pl-faq">
      <summary>{q}</summary>
      <p>{a}</p>
    </details>
  );
}

const PLACE_CSS = `
/* Footer.js forces <body> dark green — sections need their own backgrounds */
.pl-banner { position: relative; overflow: hidden; padding: 56px 0 50px; background: #0b1712; }
.pl-ban-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.pl-banner::before { content: ""; position: absolute; inset: 0; z-index: 1; background: linear-gradient(90deg, rgba(7,26,17,.9) 0%, rgba(7,26,17,.72) 45%, rgba(7,26,17,.35) 80%, rgba(7,26,17,.2) 100%); }
@media (min-width: 992px) { .pl-ban-img { top: 200px; height: calc(100% - 200px); } }
.pl-ban-inner { position: relative; z-index: 2; }
.pl-crumbs { font-size: 13px; color: rgba(255,255,255,.6); margin-bottom: 14px; }
.pl-crumbs a { color: rgba(255,255,255,.85); font-weight: 600; text-decoration: none; }
.pl-eyebrow { display: inline-flex; align-items: center; gap: 8px; margin: 0 0 10px; padding: 0; font-size: 11.5px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; color: #ecc77d; }
.pl-eyebrow::before { content: ""; width: 22px; height: 2px; background: #d4a24c; }
.pl-banner h1 { font-size: clamp(30px, 4.4vw, 48px); font-weight: 800; color: #fff; margin: 0 0 12px; letter-spacing: -.02em; line-height: 1.12; }
.pl-banner h1 span { color: #ecc77d; }
.pl-sub { font-size: clamp(15px, 1.4vw, 17px); color: rgba(255,255,255,.88); line-height: 1.6; margin: 0 0 18px; padding: 0; max-width: 600px; }
.pl-facts { list-style: none; margin: 0 0 22px; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; }
.pl-facts li { margin: 0; padding: 6px 12px; border-radius: 999px; background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.22); color: rgba(255,255,255,.88); font-size: 13px; backdrop-filter: blur(4px); }
.pl-facts li::before { content: none; }
.pl-facts b { color: #fff; }
.pl-ctas { display: flex; flex-wrap: wrap; gap: 10px; }
.pl-btn.gold { background: #ecc77d; color: #14532d !important; }
.pl-btn.gold:hover { background: #f3d595; }
.pl-btn.line { background: transparent; border: 1.5px solid rgba(255,255,255,.55); color: #fff !important; gap: 7px; cursor: pointer; font-family: inherit; }
.pl-btn.line:hover { background: rgba(255,255,255,.12); }
.pl-lead { background: #fff; padding: 0 0 48px; }
.pl-factsec { background: #fff; padding: 0 0 44px; }
.pl-factsec h2 { font-size: clamp(20px, 3vw, 24px); font-weight: 800; color: #0b1712; margin: 0 0 12px; }
.pl-factsec h3 { font-size: 16px; font-weight: 800; color: #14532d; margin: 22px 0 10px; }
.pl-facts-box { list-style: none; margin: 0; padding: 16px 18px; border-radius: 14px; background: #f7faf8; border: 1px solid #e3ebe6; display: flex; flex-direction: column; gap: 8px; }
.pl-facts-box li { position: relative; margin: 0; padding-left: 20px; font-size: 15px; line-height: 1.55; color: #334155; }
.pl-facts-box li::before { content: ""; position: absolute; left: 3px; top: 9px; width: 7px; height: 7px; border-radius: 50%; background: #1e7a4c; }
.pl-updated { font-size: 12.5px; color: #94a3b8; margin: 8px 0 0; padding: 0; }
.pl-concerns { display: flex; flex-wrap: wrap; gap: 8px; }
.pl-concerns a { height: 36px; display: inline-flex; align-items: center; padding: 0 14px; border-radius: 999px; border: 1px solid #dbe5df; color: #26463a; font-size: 13.5px; font-weight: 600; text-decoration: none; background: #fff; }
.pl-concerns a:hover { border-color: #1e7a4c; color: #1e7a4c; }
.pl-intro { background: #f7faf8; padding: 48px 0; }
.pl-narrow { max-width: 820px; }
.pl-intro h2, .pl-faqs h2 { font-size: clamp(20px, 3vw, 26px); font-weight: 800; color: #0b1712; margin: 0 0 12px; }
.pl-intro p { color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 10px; padding: 0; }
.pl-areas { font-size: 14px !important; color: #64748b !important; }
.pl-areas a { color: #1e7a4c; font-weight: 700; }
.pl-faqs { background: #fff; padding: 48px 0 64px; }
@media (max-width: 767px) {
  .pl-banner { padding: 26px 0 24px; }
  .pl-banner::before { background: linear-gradient(180deg, rgba(7,26,17,.74), rgba(7,26,17,.86)); }
  .pl-sub { display: none; }
  .pl-banner h1 { font-size: 28px; }
  .pl-eyebrow { font-size: 10px; letter-spacing: .6px; }
  .pl-eyebrow::before { display: none; }
  .pl-facts { margin-bottom: 16px; }
  .pl-facts li { font-size: 12px; padding: 5px 10px; }
  .pl-ctas .pl-btn { flex: 1; justify-content: center; }
  .pl-thers { padding-top: 32px !important; }
  .pl-intro, .pl-faqs { padding: 36px 0; }
}
.pl-thers { background: #fff; padding: 56px 0 60px; }
.pl-head { text-align: center; max-width: 760px; margin: 0 auto 26px; }
.pl-head h2 { font-size: clamp(22px, 4vw, 32px); font-weight: 800; color: #0b1712; margin: 0 0 10px; }
.pl-head p { color: #475569; font-size: 16px; line-height: 1.6; margin: 0; padding: 0; }
.pl-list { display: flex; flex-direction: column; gap: 14px; }
.pl-empty { text-align: center; padding: 20px 0; }
.pl-more { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 12px 16px; margin-top: 24px; }
.pl-btn { display: inline-flex; align-items: center; height: 46px; padding: 0 22px; border-radius: 12px; background: #1e7a4c; color: #fff !important; font-weight: 800; font-size: 14.5px; text-decoration: none !important; }
.pl-btn:hover { background: #186640; }
.pl-btn.ghost { background: #fff; color: #14532d !important; border: 1.5px solid #cfdcd4; }
.pl-link { color: #1e7a4c !important; font-weight: 800; font-size: 14.5px; text-decoration: none !important; }
.pl-faq { margin-bottom: 12px; border-radius: 14px; border: 1px solid #e2e8f0; background: #fff; }
.pl-faq summary { cursor: pointer; list-style: none; padding: 18px 48px 18px 22px; font-size: 16px; font-weight: 700; color: #0b1712; position: relative; }
.pl-faq summary::-webkit-details-marker { display: none; }
.pl-faq summary::after { content: "+"; position: absolute; right: 22px; top: 50%; transform: translateY(-50%); font-size: 22px; color: #1e7a4c; }
.pl-faq[open] summary::after { content: "–"; }
.pl-faq[open] { box-shadow: 0 4px 20px rgba(30,122,76,.08); }
.pl-faq p { margin: 0; padding: 0 22px 18px; color: #475569; font-size: 15px; line-height: 1.7; }
`;
