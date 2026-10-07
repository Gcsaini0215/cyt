import React from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import Footer from "../../components/footer";
import MyNavbar from "../../components/navbar";
import { fetchData } from "../../utils/actions";
import { getTherapistProfiles } from "../../utils/url";
import { profilePath } from "../../utils/therapist-slug";
import { PLACES as STATE_CONFIG, PLACE_SERVICES as SERVICES, inPlace } from "../../utils/places";
import ProfileCardRow, { CARD_CSS } from "../../components/home/profile-card-row";
import { slimTherapist, sortTherapists, getMinFee, sessionModes } from "../../utils/therapist-directory";

const SHOW = 12;

const ConsultationForm = dynamic(() => import("../../components/home/consultation-form"), { ssr: false });

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
  };

  return {
    // the real list (no placeholder numbers), rendered on the server so search engines see it
    props: { config, therapists: sortTherapists(list, "", null).slice(0, SHOW).map(slimTherapist), stats },
    revalidate: 3600,
  };
}

// ─── Page component ──────────────────────────────────────────────────────────
export default function StatePsychologistPage({ config, therapists, stats = {} }) {
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
    "speakable": { "@type": "SpeakableSpecification", "cssSelector": ["h1", ".local-intro-text"] }
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

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg, #0b2418 0%, #14532d 55%, #1e7a4c 100%)",
        padding: "64px 0 72px", position: "relative", overflow: "hidden"
      }}>
        {/* decorative circle */}
        <div style={{
          position: "absolute", top: "-80px", right: "-80px",
          width: "400px", height: "400px", borderRadius: "50%",
          background: "rgba(255,255,255,0.04)", pointerEvents: "none"
        }} />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              {/* breadcrumb */}
              <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "20px", flexWrap: "wrap" }}>
                <a href="/" style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", textDecoration: "none" }}>Home</a>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>›</span>
                <a href="/view-all-therapist" style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", textDecoration: "none" }}>Find a Psychologist</a>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>›</span>
                <span style={{ color: "#ecc77d", fontSize: "13px", fontWeight: 700 }}>{config.name}</span>
              </div>

              <h1 style={{ fontSize: "clamp(2.4rem, 5vw, 3.8rem)", fontWeight: 900, color: "#fff", lineHeight: 1.15, marginBottom: "20px" }}>
                Best Psychologist in{" "}
                <span style={{ color: "#ecc77d" }}>{config.name}</span>
              </h1>
              <p style={{ fontSize: "1.6rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.7, marginBottom: "32px", maxWidth: "600px" }}>
                {config.description}
              </p>

              {/* city pills */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "28px" }}>
                {config.cities.map(city => (
                  <span key={city} style={{
                    padding: "6px 14px", borderRadius: "50px", fontSize: "13px", fontWeight: 600,
                    background: "rgba(255,255,255,0.12)", color: "#fff",
                    border: "1px solid rgba(255,255,255,0.2)"
                  }}>{city}</span>
                ))}
              </div>

              {/* trust stats */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "28px", marginBottom: "32px" }}>
                {[
                  stats.count > 0 ? { label: `Verified psychologists in ${config.name}`, value: stats.count } : { label: "Psychologists online, anywhere in India", value: stats.total || "50+" },
                  stats.rating ? { label: `Avg. rating · ${stats.rating.count} reviews`, value: `${stats.rating.avg} ★` } : null,
                  stats.minFee ? { label: "Starting from / session", value: `₹${stats.minFee.toLocaleString("en-IN")}` } : null,
                  stats.inPerson > 0 ? { label: "Also see clients in person", value: stats.inPerson } : null,
                ].filter(Boolean).map((s, i) => (
                  <div key={i}>
                    <div style={{ color: "#ecc77d", fontWeight: 800, fontSize: "22px", lineHeight: 1 }}>{s.value}</div>
                    <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "12px", fontWeight: 600, marginTop: "4px" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
                <a href="#therapists" style={{
                  padding: "14px 28px", borderRadius: "50px",
                  background: "#ecc77d", color: "#14532d",
                  fontWeight: 800, fontSize: "15px", textDecoration: "none"
                }}>
                  See psychologists
                </a>
                <a href={dirHref} style={{
                  padding: "14px 28px", borderRadius: "50px",
                  background: "rgba(255,255,255,0.12)", color: "#fff",
                  fontWeight: 700, fontSize: "15px", textDecoration: "none",
                  border: "1px solid rgba(255,255,255,0.25)"
                }}>
                  Filter by concern & fees
                </a>
              </div>
            </div>

            {/* Lead capture form */}
            <div className="col-lg-5">
              <div style={{
                background: "rgba(255,255,255,0.97)", borderRadius: "20px",
                padding: "24px", boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
                border: "1px solid rgba(255,255,255,0.5)"
              }}>
                <h3 style={{ color: "#064e3b", fontWeight: 800, fontSize: "17px", marginBottom: "4px" }}>
                  Book a Free Consultation
                </h3>
                <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "18px" }}>
                  For {config.name} residents — online, no commitment.
                </p>
                <ConsultationForm showHeading={false} showLocation={false} showSource={false} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Local intro — unique per-page content, not just a template ──────── */}
      {config.localIntro && (
        <div style={{ background: "#fff", padding: "56px 0 8px" }}>
          <div className="container">
            <div style={{ maxWidth: "800px", margin: "0 auto" }} className="clinic-details">
              <h2 style={{ fontSize: "clamp(20px, 3vw, 26px)", fontWeight: 900, color: "#1e293b", marginBottom: "14px" }}>
                Why Choose Online Therapy in {config.name}
              </h2>
              <p className="local-intro-text" style={{ color: "#475569", fontSize: "16px", lineHeight: 1.8, margin: 0 }}>
                {config.localIntro}
              </p>
              {config.relatedRegion && (
                <p style={{ color: "#64748b", fontSize: "14px", marginTop: "18px" }}>
                  Looking further afield? See verified psychologists across all of{" "}
                  <a href={`/psychologist-in/${config.relatedRegion.slug}`} style={{ color: "#166534", fontWeight: 700, textDecoration: "none" }}>
                    {config.relatedRegion.name}
                  </a>.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Services grid ─────────────────────────────────────────────────── */}
      <div style={{ background: "#f8fafc", padding: "72px 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2 style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 900, color: "#1e293b", marginBottom: "12px" }}>
              Therapy Services Available in {config.name}
            </h2>
            <p style={{ color: "#64748b", fontSize: "17px" }}>
              All services available online — book from anywhere in {config.name}
            </p>
          </div>
          <div className="row g-4">
            {SERVICES.map((s, i) => (
              <div key={i} className="col-lg-4 col-md-6">
                <div style={{
                  background: "#fff", borderRadius: "16px", padding: "28px",
                  border: "1px solid #f1f5f9", height: "100%",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                  transition: "all 0.2s"
                }}>
                  <div style={{
                    width: "48px", height: "48px", borderRadius: "12px",
                    background: `${s.color}15`, display: "flex",
                    alignItems: "center", justifyContent: "center", marginBottom: "16px"
                  }}>
                    <i className={s.icon} style={{ color: s.color, fontSize: "20px" }} />
                  </div>
                  <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#1e293b", marginBottom: "8px" }}>{s.title}</h3>
                  <p style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Therapist cards (rendered on the server, so search engines see who practises here) ── */}
      <style dangerouslySetInnerHTML={{ __html: CARD_CSS + PLACE_CSS }} />
      <div id="therapists" className="pl-thers">
        <div className="container">
          <div className="pl-head">
            <h2>{stats.count > 0 ? `Psychologists in ${config.name}` : `Talk to a psychologist online from ${config.name}`}</h2>
            <p>
              {stats.count > 0
                ? `${stats.count} verified psychologist${stats.count !== 1 ? "s" : ""} based in ${config.name}${stats.inPerson ? `, ${stats.inPerson} of them also in person` : ""} — and every one of our ${stats.total || ""} psychologists is available online.`
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

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <div style={{ background: "#f8fafc", padding: "72px 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2 style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 900, color: "#1e293b", marginBottom: "12px" }}>
              Common Questions About Therapy in {config.name}
            </h2>
          </div>
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            {config.faqs.map((faq, i) => (
              <FaqItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

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
