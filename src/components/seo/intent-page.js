import React from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import Footer from "../footer";
import MyNavbar from "../navbar";
import ProfileCardRow, { CARD_CSS } from "../home/profile-card-row";
import LeadCard from "../global/lead-card";
import MobileActionBar from "../global/mobile-action-bar";
import { profilePath } from "../../utils/therapist-slug";
import { fitTitle, fitDesc } from "../../utils/seo-text";
import { therapistPhotoUrl, siteCardUrl } from "../../utils/og-urls";
import { CONCERN_PAGES, concernPath } from "../../utils/concerns";
import { PLACE_CSS } from "./place-css";

/* One landing page for a search intent people type into Google — "psychologist near me",
   "clinical psychologist", "child psychologist" (Google Trends, Nov 2026). Real, server-rendered
   therapist list (no made-up numbers), dated quick facts, FAQ + Service / ItemList schema.
   near: therapists carry their public ~1 km area pin (office_area), so "Use my location" can sort
   them by distance in the browser — the location never leaves the visitor's device. */

const BookingPopup = dynamic(() => import("../global/booking-popup"), { ssr: false });
const SITE = "https://www.chooseyourtherapist.in";

const km = (a, b) => {
  const R = 6371, r = (x) => (x * Math.PI) / 180;
  const dLat = r(b.lat - a.lat), dLng = r(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

function FaqItem({ q, a }) {
  return (
    <details className="pl-faq">
      <summary>{q}</summary>
      <p>{a}</p>
    </details>
  );
}

export default function IntentPage({ page, therapists, stats, updatedAt, places = [] }) {
  const URL = `${SITE}${page.path}`;
  const [now, setNow] = React.useState(null);
  React.useEffect(() => { setNow(Date.now()); }, []);
  const [me, setMe] = React.useState(null); // { lat, lng }
  const [geo, setGeo] = React.useState("idle"); // idle | finding | done | failed
  const updatedLabel = updatedAt ? new Date(updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "";

  const locate = () => {
    if (!navigator.geolocation) { setGeo("failed"); return; }
    setGeo("finding");
    navigator.geolocation.getCurrentPosition(
      (p) => { setMe({ lat: p.coords.latitude, lng: p.coords.longitude }); setGeo("done"); },
      () => setGeo("failed"),
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 10 * 60 * 1000 }
    );
  };
  const list = React.useMemo(() => {
    if (!page.near || !me) return therapists.map((t) => ({ t, d: null }));
    return therapists
      .map((t) => ({ t, d: t.area?.lat != null ? km(me, t.area) : null }))
      .sort((a, b) => (a.d ?? 1e9) - (b.d ?? 1e9));
  }, [therapists, me, page.near]);

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${URL}#service`,
    name: page.schemaName,
    serviceType: "Psychological counselling and therapy",
    description: page.description,
    url: URL,
    provider: { "@type": "MedicalOrganization", "@id": `${SITE}#organization`, name: "Choose Your Therapist", telephone: "+91-8077757951" },
    areaServed: { "@type": "Country", name: "India" },
    ...(stats.minFee ? { offers: { "@type": "Offer", priceCurrency: "INR", price: stats.minFee, description: "Starting fee per session" } } : {}),
  };
  const faqSchema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: page.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  const crumbs = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
    { "@type": "ListItem", position: 2, name: "Find a Psychologist", item: `${SITE}/view-all-therapist` },
    { "@type": "ListItem", position: 3, name: page.crumb, item: URL },
  ] };
  const itemList = therapists.length ? { "@context": "https://schema.org", "@type": "ItemList", name: page.schemaName, itemListElement: therapists.slice(0, 12).map((t, i) => ({
    "@type": "ListItem", position: i + 1,
    item: { "@type": "Person", name: t.user?.name || "Verified Psychologist", jobTitle: t.profile_type || "Psychologist", url: `${SITE}${profilePath(t)}`, ...(therapistPhotoUrl(t) ? { image: therapistPhotoUrl(t) } : {}) },
  })) } : null;
  const webPage = { "@context": "https://schema.org", "@type": "WebPage", "@id": `${URL}#webpage`, url: URL, name: page.title, description: page.description,
    isPartOf: { "@id": `${SITE}#organization` }, about: { "@id": `${URL}#service` },
    speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", ".pl-facts-box"] }, ...(updatedAt ? { dateModified: updatedAt } : {}) };
  const OG = siteCardUrl("city", { city: page.ogCity || "India" });

  return (
    <div style={{ overflowX: "hidden", width: "100%" }}>
      <Head>
        <title>{fitTitle(page.title)}</title>
        <meta name="description" content={fitDesc(page.description)} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={URL} />
        <meta key="og:type" property="og:type" content="website" />
        <meta property="og:url" content={URL} />
        <meta property="og:title" content={fitTitle(page.title)} />
        <meta property="og:description" content={fitDesc(page.description)} />
        <meta key="og:image" property="og:image" content={OG} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={fitTitle(page.title)} />
        <meta name="twitter:description" content={fitDesc(page.description)} />
        <meta name="twitter:image" content={OG} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }} />
        {itemList && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />}
      </Head>
      <MyNavbar />

      <section className="pl-banner" aria-labelledby="ip-h1">
        <img className="pl-ban-img" alt={page.crumb} src={page.img || "/assets/img/therapist-directory-banner-1600.webp"} width="1200" height="520" fetchPriority="high" decoding="async" />
        <div className="container pl-ban-inner">
          <nav className="pl-crumbs" aria-label="Breadcrumb">
            <a href="/">CYT Home</a> <span aria-hidden="true">›</span> <a href="/view-all-therapist">Find a Psychologist</a> <span aria-hidden="true">›</span> <span aria-current="page">{page.crumb}</span>
          </nav>
          <p className="pl-eyebrow">{page.eyebrow}</p>
          <h1 id="ip-h1">{page.h1[0]} <span>{page.h1[1]}</span></h1>
          <p className="pl-sub">{page.description}</p>
          <ul className="pl-facts">
            {stats.count > 0 && <li><b>{stats.count}</b> {page.countLabel}</li>}
            {stats.inPerson > 0 && !page.near && <li><b>{stats.inPerson}</b> in person</li>}
            {stats.rating && <li><b>{stats.rating.avg} ★</b> {stats.rating.count} reviews</li>}
            {stats.minFee && <li>from <b>₹{stats.minFee.toLocaleString("en-IN")}</b></li>}
          </ul>
          <div className="pl-ctas">
            {page.near
              ? <button type="button" className="pl-btn gold" onClick={locate} style={{ border: 0, cursor: "pointer", fontFamily: "inherit" }}>{geo === "finding" ? "Finding you…" : "📍 Use my location"}</button>
              : <a href="#therapists" className="pl-btn gold">See psychologists</a>}
            <button type="button" className="pl-btn line" onClick={() => window.dispatchEvent(new Event("cyt:open-chat"))}>
              <i className="feather-message-circle" aria-hidden="true" /> Talk to us
            </button>
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: CARD_CSS + PLACE_CSS + IP_CSS }} />
      <div id="therapists" className="pl-thers">
        <div className="container">
          <div className="pl-head">
            <h2>{page.listTitle}</h2>
            <p>{page.listIntro}</p>
            {page.near && geo === "done" && <p className="ip-geo ok">Sorted by distance from you. Distances are to each psychologist&apos;s area (about 1 km), not the exact address.</p>}
            {page.near && geo === "failed" && <p className="ip-geo">Couldn&apos;t get your location — pick your city below, or see everyone online.</p>}
          </div>
          {page.near && (
            <a href="/noida-appointment" className="ip-centre">
              <b>CYT Therapy Centre, Noida (Sector 51)</b>
              <span>Our own in-person centre · Mon–Sun, 9 AM–9 PM</span>
              <em>Book a slot →</em>
            </a>
          )}
          {list.length > 0 ? (
            <div className="pl-list">
              {list.map(({ t, d }) => (
                <div key={t._id} className="ip-row">
                  {page.near && (t.area?.label || d != null) && (
                    <div className="ip-dist">📍 {d != null ? `~${d < 10 ? d.toFixed(1) : Math.round(d)} km away · ` : ""}{t.area?.label || ""}</div>
                  )}
                  <ProfileCardRow data={t} favrioutes={[]} now={now} />
                </div>
              ))}
            </div>
          ) : (
            <div className="pl-empty"><a href="/view-all-therapist" className="pl-btn">See all psychologists — online</a></div>
          )}
          <div className="pl-more">
            {page.moreHref && <a href={page.moreHref} className="pl-btn" rel="nofollow">{page.moreText}</a>}
            <a href="/view-all-therapist" className="pl-btn ghost">Browse all {stats.total || ""} psychologists online</a>
          </div>
          {places.length > 0 && (
            <div className="ip-places">
              <h3>Psychologists by city</h3>
              <div className="pl-concerns">{places.map((p) => <a key={p.href} href={p.href}>{p.name}{p.count ? ` · ${p.count}` : ""}</a>)}</div>
            </div>
          )}
        </div>
      </div>

      <div className="pl-lead">
        <div className="container">
          <LeadCard tag={page.leadTag} title={page.leadTitle} waText={page.waText} />
        </div>
      </div>

      <section className="pl-factsec" aria-labelledby="ip-facts">
        <div className="container pl-narrow">
          <h2 id="ip-facts">{page.factsTitle}</h2>
          <ul className="pl-facts-box">{page.facts(stats).filter(Boolean).map((x) => <li key={x}>{x}</li>)}</ul>
          {updatedLabel && <p className="pl-updated">Updated {updatedLabel} from our live directory.</p>}
          <h3>Help for common concerns</h3>
          <div className="pl-concerns">{CONCERN_PAGES.slice(0, 8).map((c) => <a key={c.slug} href={concernPath(c)}>{c.title}</a>)}</div>
        </div>
      </section>

      {page.sections?.length > 0 && (
        <section className="pl-intro">
          <div className="container pl-narrow">
            {page.sections.map((s) => (
              <div key={s.h} className="ip-sec">
                <h2>{s.h}</h2>
                {s.p.map((x) => <p key={x}>{x}</p>)}
              </div>
            ))}
            {page.related?.length > 0 && <p className="pl-areas">Read next: {page.related.map((r, i) => <React.Fragment key={r.href}>{i ? " · " : ""}<a href={r.href}>{r.text}</a></React.Fragment>)}</p>}
          </div>
        </section>
      )}

      <section className="pl-faqs">
        <div className="container pl-narrow">
          <h2>{page.faqTitle}</h2>
          {page.faqs.map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)}
        </div>
      </section>

      <Footer />
      <BookingPopup delay={15000} showHeading={false} showLocation={false} showSource={false}
        title={page.leadTitle} note="Tell us a little — our team will WhatsApp you with psychologists who fit, usually within minutes."
        sourceTag={`Popup · ${page.crumb}`} />
      <MobileActionBar waText={page.waText} />
    </div>
  );
}

const IP_CSS = `
.ip-row { display: flex; flex-direction: column; gap: 6px; }
.ip-dist { align-self: flex-start; font-size: 13px; font-weight: 700; color: #14532d; background: #ecfdf3; border: 1px solid #c7ecd5; border-radius: 999px; padding: 4px 12px; }
.ip-geo { margin-top: 10px !important; font-size: 13.5px !important; color: #8a5a06 !important; }
.ip-geo.ok { color: #166534 !important; }
.ip-centre { display: grid; grid-template-columns: 1fr auto; gap: 2px 12px; align-items: center; margin: 0 0 16px; padding: 14px 18px; border-radius: 16px; background: linear-gradient(135deg, #f3f9f5, #fdf8ec); border: 1px solid #cfe3d6; text-decoration: none !important; }
.ip-centre b { color: #0b1712; font-size: 15.5px; }
.ip-centre span { grid-column: 1; color: #475569; font-size: 13.5px; }
.ip-centre em { grid-row: 1 / span 2; grid-column: 2; font-style: normal; font-weight: 800; color: #1e7a4c; white-space: nowrap; }
.ip-places { margin-top: 30px; text-align: center; }
.ip-places h3 { font-size: 17px; font-weight: 800; color: #14532d; margin: 0 0 12px; }
.ip-places .pl-concerns { justify-content: center; }
.ip-sec + .ip-sec { margin-top: 22px; }
@media (max-width: 575px) { .ip-centre { grid-template-columns: 1fr; } .ip-centre em { grid-row: auto; grid-column: 1; margin-top: 6px; } }
`;
