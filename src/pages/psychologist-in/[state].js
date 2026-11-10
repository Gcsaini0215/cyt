import React from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import Footer from "../../components/footer";
import MyNavbar from "../../components/navbar";
import { fetchData } from "../../utils/actions";
import { getTherapistProfiles } from "../../utils/url";
import { profilePath } from "../../utils/therapist-slug";
import { fitTitle, fitDesc } from "../../utils/seo-text";
import { PLACES as STATE_CONFIG, PLACE_SERVICES as SERVICES, inPlace, PLACE_IMG } from "../../utils/places";
import ProfileCardRow, { CARD_CSS } from "../../components/home/profile-card-row";
import LeadCard from "../../components/global/lead-card";
import MobileActionBar from "../../components/global/mobile-action-bar";
import { CONCERN_PAGES, concernPath } from "../../utils/concerns";
import { split as splitList } from "../../utils/therapist-directory";
import { slimTherapist, sortTherapists, getMinFee, sessionModes } from "../../utils/therapist-directory";
import { siteCardUrl, therapistPhotoUrl } from "../../utils/og-urls";
import { placeHinglishFaqs } from "../../utils/hinglish-faqs";
import { PLACE_CSS } from "../../components/seo/place-css";

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
    config.abroad
      ? `Online video and audio sessions are available from anywhere in ${config.country}; in-person sessions at the CYT centre in Sector 51, Noida (Mon–Sun, 9 AM–9 PM) for visits to India.`
      : "Online video and audio sessions are available anywhere in India; in-person sessions at the CYT centre in Sector 51, Noida (Mon–Sun, 9 AM–9 PM).",
    "Every psychologist's qualifications and documents are checked by the CYT team before their profile goes live.",
  ].filter(Boolean);
  const [now, setNow] = React.useState(null);
  React.useEffect(() => { setNow(Date.now()); }, []);
  const isCity = isCityPage(config);
  const where = config.abroad ? `anywhere in ${config.country}` : "anywhere in India";
  // therapists record their state, not their city — the directory search matches that
  const dirHref = `/view-all-therapist?search=${encodeURIComponent(config.filterValues[0])}`;
  const PAGE_URL = `https://www.chooseyourtherapist.in/psychologist-in/${config.slug}`;
  const OG_IMAGE = siteCardUrl("city", { city: config.name });

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
      { "@type": isCity || config.abroad ? "City" : "State", "name": config.name, ...(config.country ? { "containedInPlace": { "@type": "Country", "name": config.country } } : {}) },
      ...config.cities.map((c) => ({ "@type": "Place", "name": c })),
    ],
    "availableChannel": { "@type": "ServiceChannel", "serviceUrl": PAGE_URL, "name": "Online video / audio sessions" },
    ...(stats.minFee ? { "offers": { "@type": "Offer", "priceCurrency": "INR", "price": stats.minFee, "description": "Starting fee per session" } } : {}),
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [...config.faqs, ...placeHinglishFaqs(config)].map(f => ({
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
    "itemListElement": therapists.map((t, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "item": {
        "@type": "Person",
        "name": t.user?.name || t.name || "Verified Psychologist",
        "jobTitle": t.profile_type || "Psychologist",
        "url": `https://www.chooseyourtherapist.in${profilePath(t)}`,
        ...(therapistPhotoUrl(t) ? { "image": therapistPhotoUrl(t) } : {})
      }
    }))
  } : null;

  return (
    <div style={{ overflowX: "hidden", width: "100%" }}>
      <Head>
        <title>{fitTitle(`Best Psychologist in ${config.name}`)}</title>
        <meta name="description" content={fitDesc(config.description)} />
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
        <meta property="og:description" content={fitDesc(config.description)} />
        <meta key="og:image" property="og:image" content={OG_IMAGE} />
        <meta key="og:site_name" property="og:site_name" content="Choose Your Therapist" />
        <meta key="og:locale" property="og:locale" content="en_IN" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Best Psychologist in ${config.name} | Choose Your Therapist`} />
        <meta name="twitter:description" content={fitDesc(config.description)} />
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
        <img className="pl-ban-img" alt={`Psychologist in ${config.name}`}
          src={PLACE_IMG[config.slug] ? `/assets/img/cities/b/${PLACE_IMG[config.slug]}.webp` : "/assets/img/therapist-directory-banner-1600.webp"}
          width="1200" height="520" fetchPriority="high" decoding="async" />
        <div className="container pl-ban-inner">
          <nav className="pl-crumbs" aria-label="Breadcrumb">
            <a href="/">CYT Home</a> <span aria-hidden="true">›</span> <a href="/psychologist-in">Psychologists by city</a> <span aria-hidden="true">›</span> <span aria-current="page">{config.name}</span>
          </nav>
          <p className="pl-eyebrow">Verified psychologists · online &amp; in person</p>
          <h1 id="pl-h1">Psychologist in <span>{config.name}</span></h1>
          <p className="pl-sub">{config.description}</p>
          <ul className="pl-facts">
            {stats.count > 0
              ? <li><b>{stats.count}</b> based {isCity ? "nearby" : "here"}</li>
              : <li><b>{stats.total || "50+"}</b> online, {where}</li>}
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
                : `We don't have psychologists based in ${config.name} yet, but all ${stats.total || ""} of our verified psychologists see clients online — ${where}.`}
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
            {stats.count > therapists.length && <a href={dirHref} className="pl-btn" rel="nofollow">See all {stats.count} in {config.name}</a>}
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
          {[...config.faqs, ...placeHinglishFaqs(config)].map((faq, i) => <FaqItem key={i} q={faq.q} a={faq.a} />)}
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

// abroad places read "based in Riyadh", not "near" (the psychologist really is there)
const isCityPage = (config) => !config.abroad && (Boolean(config.relatedRegion) || !/pradesh|delhi|maharashtra|rajasthan|gujarat|chandigarh|uttarakhand|bengal/i.test(config.slug));

// FAQ item: a native <details>, so the answer is in the HTML (crawlable) and works without JS
function FaqItem({ q, a }) {
  return (
    <details className="pl-faq">
      <summary>{q}</summary>
      <p>{a}</p>
    </details>
  );
}
