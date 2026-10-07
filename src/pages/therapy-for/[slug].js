import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import dynamic from "next/dynamic";
import MyNavbar from "../../components/navbar";
import Footer from "../../components/footer";
import ProfileCardRow, { CARD_CSS } from "../../components/home/profile-card-row";
import { fetchData } from "../../utils/actions";
import { getTherapistProfiles } from "../../utils/url";
import { CONCERN_PAGES, concernBySlug, concernPath } from "../../utils/concerns";
import { slimTherapist, sortTherapists, split, getMinFee, sessionModes } from "../../utils/therapist-directory";
import LeadCard from "../../components/global/lead-card";
import MobileActionBar from "../../components/global/mobile-action-bar";
import { PLACES, placePath } from "../../utils/places";

// cities / states with the most psychologists, linked from every concern page
const TOP_PLACES = ["delhi", "uttar-pradesh", "mumbai", "bangalore", "pune", "jaipur", "hyderabad", "chandigarh", "kolkata", "lucknow"];

const BookingPopup = dynamic(() => import("../../components/global/booking-popup"), { ssr: false });

// /therapy-for/<concern>: an indexable page per concern (the directory's ?concern= views are
// noindex) — what it is, signs, how therapy helps, the psychologists who work with it, FAQ.
const SITE = "https://www.chooseyourtherapist.in";
const SHOW = 8;

export async function getStaticPaths() {
  return { paths: CONCERN_PAGES.map((c) => ({ params: { slug: c.slug } })), fallback: false };
}

export async function getStaticProps({ params }) {
  const c = concernBySlug(params.slug);
  if (!c) return { notFound: true };
  let list = [];
  try {
    const res = await fetchData(getTherapistProfiles, { page: 1, pageSize: 1000 });
    list = (res?.data || []).filter((t) => split(t.experties).includes(c.value));
  } catch (err) {
    console.error("therapy-for getStaticProps:", err?.message);
  }
  const fees = list.map((t) => getMinFee(t.fees)).filter(Boolean);
  const langs = [...new Set(list.flatMap((t) => split(t.language_spoken)))].slice(0, 6);
  return {
    props: {
      slug: c.slug,
      count: list.length,
      minFee: fees.length ? Math.min(...fees) : null,
      inPerson: list.filter((t) => sessionModes(t).inPerson).length,
      langs,
      updatedAt: new Date().toISOString(),
      therapists: sortTherapists(list, "", null).slice(0, SHOW).map(slimTherapist),
    },
    revalidate: 600,
  };
}

export default function TherapyFor({ slug, count, minFee, therapists, inPerson = 0, langs = [], updatedAt = null }) {
  const c = concernBySlug(slug);
  const [now, setNow] = useState(null);
  useEffect(() => { setNow(Date.now()); }, []);
  const url = `${SITE}${concernPath(c)}`;
  const all = `/view-all-therapist?concern=${encodeURIComponent(c.value)}`;
  const label = c.label.toLowerCase();
  const title = `${c.title} — Verified Psychologists in India | Choose Your Therapist`;
  const description = `${c.intro.split(". ")[0]}. Talk to ${count ? `${count} verified psychologists` : "verified psychologists"} for ${label}${minFee ? `, from ₹${minFee}` : ""} — online or in person.`.slice(0, 300);
  const others = CONCERN_PAGES.filter((x) => x.slug !== c.slug);
  const updatedLabel = updatedAt ? new Date(updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "";
  // short, factual statements — the kind search engines and AI assistants quote directly
  const facts = [
    count ? `${count} verified psychologists on Choose Your Therapist list ${label} among their areas of expertise${inPerson ? `; ${inPerson} also see clients in person` : ""}.` : null,
    minFee ? `Sessions start from ₹${minFee.toLocaleString("en-IN")}; every fee is shown on the psychologist's profile before booking.` : null,
    langs.length ? `Sessions are available in ${langs.join(", ")}.` : null,
    "Sessions are online (video or audio) from anywhere in India, or in person at the CYT centre in Sector 51, Noida.",
    "In a crisis, call Tele-MANAS on 1800-89-14416 (free, 24×7) or go to the nearest hospital.",
  ].filter(Boolean);

  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "MedicalWebPage",
      "name": c.title,
      "url": url,
      "description": description,
      "about": { "@type": "MedicalCondition", "name": c.label },
      "audience": { "@type": "PeopleAudience", "geographicArea": { "@type": "Country", "name": "India" } },
      "publisher": { "@type": "Organization", "name": "Choose Your Therapist", "url": SITE },
      ...(updatedAt ? { "dateModified": updatedAt, "lastReviewed": updatedAt } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": `${SITE}/` },
        { "@type": "ListItem", "position": 2, "name": "Find a therapist", "item": `${SITE}/view-all-therapist` },
        { "@type": "ListItem", "position": 3, "name": c.title, "item": url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": c.faqs.map((f) => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } })),
    },
  ];

  return (
    <div className="tf-page">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={url} />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
        {c.img && <meta property="og:image" content={`${SITE}/images/${c.img}.jpg`} />}
        {schemas.map((s, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />)}
      </Head>
      <style dangerouslySetInnerHTML={{ __html: CSS + CARD_CSS }} />
      <MyNavbar />

      <main>
        <section className="tf-hero">
          <div className="container tf-hero-in">
            <nav className="tf-crumbs" aria-label="Breadcrumb">
              <Link href="/">Home</Link> <span aria-hidden="true">›</span>
              <Link href="/view-all-therapist">Find a therapist</Link> <span aria-hidden="true">›</span>
              <span aria-current="page">{c.label}</span>
            </nav>
            <div className="tf-hero-grid">
              <div>
                <h1>{c.title}</h1>
                <p className="tf-lead">{c.intro}</p>
                <ul className="tf-facts">
                  {count > 0 && <li><b>{count}</b> verified psychologists</li>}
                  {minFee && <li>Sessions from <b>₹{minFee.toLocaleString("en-IN")}</b></li>}
                  <li>Online &amp; in-person</li>
                  <li>100% confidential</li>
                </ul>
                <div className="tf-ctas">
                  <Link className="tf-btn" href={all}>See {count ? `all ${count} ` : ""}therapists for {label}</Link>
                  <Link className="tf-btn ghost" href="/view-all-therapist?help=1"><i className="feather-compass" aria-hidden="true" /> Help me choose</Link>
                </div>
              </div>
              {c.img && (
                <div className="tf-hero-img">
                  <img src={`/images/concerns/${c.img}.webp`} alt="" width="560" height="340" fetchPriority="high" />
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="container tf-cols">
          <div className="tf-box">
            <h2>Signs you might want support</h2>
            <ul className="tf-list">{c.signs.map((s) => <li key={s}>{s}</li>)}</ul>
          </div>
          <div className="tf-box green">
            <h2>How therapy helps</h2>
            <ul className="tf-list check">{c.helps.map((s) => <li key={s}>{s}</li>)}</ul>
          </div>
        </section>

        <section className="container tf-qf" aria-labelledby="tf-fx">
          <h2 id="tf-fx">Quick facts</h2>
          <ul>{facts.map((x) => <li key={x}>{x}</li>)}</ul>
          {updatedLabel && <p className="tf-updated">Updated {updatedLabel} from our live directory.</p>}
        </section>

        {therapists.length > 0 && (
          <section className="container tf-thers" aria-labelledby="tf-th">
            <div className="tf-sec-head">
              <h2 id="tf-th">Psychologists who help with {label}</h2>
              {count > therapists.length && <Link href={all}>See all {count} <i className="feather-arrow-right" aria-hidden="true" /></Link>}
            </div>
            <div className="tf-cards">
              {therapists.map((t) => <ProfileCardRow key={t._id} data={t} favrioutes={[]} highlight={c.value} now={now} />)}
            </div>
            {count > therapists.length && (
              <div className="tf-more"><Link className="tf-btn" href={all}>See all {count} therapists for {label}</Link></div>
            )}
          </section>
        )}

        <div className="container tf-lead">
          <LeadCard tag={`Concern · ${c.label}`} title={`Want help finding the right psychologist for ${label}?`}
            concern={c.label} waText={`Hi, I'd like to talk to a psychologist about ${label}.`} />
        </div>

        <section className="container tf-faq" aria-labelledby="tf-fq">
          <h2 id="tf-fq">Common questions</h2>
          {c.faqs.map((f, i) => (
            <details key={f.q} open={i === 0}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </section>

        <section className="container tf-others" aria-labelledby="tf-pl">
          <h2 id="tf-pl">{c.title} near you</h2>
          <div className="tf-chips">
            {TOP_PLACES.filter((x) => PLACES[x]).map((x) => <Link key={x} href={placePath(x)}>Psychologist in {PLACES[x].name}</Link>)}
            <Link href="/psychologist-in">All cities →</Link>
          </div>
        </section>

        <section className="container tf-others" aria-labelledby="tf-ot">
          <h2 id="tf-ot">Other things we can help with</h2>
          <div className="tf-chips">
            {others.map((x) => <Link key={x.slug} href={concernPath(x)}>{x.label}</Link>)}
          </div>
          <p className="tf-crisis">
            <i className="feather-alert-circle" aria-hidden="true" /> In crisis or thinking of harming yourself? Call <a href="tel:18008914416">Tele-MANAS 1800-89-14416</a> (free, 24×7) or go to your nearest hospital.
          </p>
          <p className="tf-note">This page is general information, not a diagnosis. A psychologist can help you understand what you're going through.</p>
        </section>
      </main>

      <Footer />
      <BookingPopup delay={20000} showHeading={false} showLocation={false} showSource={false}
        title={`Talk to someone about ${label}`}
        note="Tell us a little — our team will WhatsApp you with psychologists who work with this, usually within minutes."
        sourceTag={`Popup · Concern · ${c.label}`} />
      <MobileActionBar waText={`Hi, I'd like to talk to a psychologist about ${label}.`} />
    </div>
  );
}

const CSS = `
/* Footer.js forces <body> dark green — the page needs its own background */
.tf-page main { background: #fff; padding-bottom: 56px; }
.tf-hero { background: linear-gradient(180deg, #f3f9f5 0%, #fff 100%); padding: 28px 0 40px; border-bottom: 1px solid #edf3ef; }
.tf-crumbs { font-size: 13px; color: #64748b; margin-bottom: 18px; display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.tf-crumbs a { color: #1e7a4c; text-decoration: none; font-weight: 600; }
.tf-crumbs a:hover { text-decoration: underline; }
.tf-hero-grid { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); gap: 40px; align-items: center; }
.tf-hero h1 { font-size: clamp(30px, 4vw, 44px); font-weight: 800; color: #0b1712; letter-spacing: -.02em; line-height: 1.15; margin: 0 0 14px; }
.tf-lead { font-size: 16.5px; line-height: 1.7; color: #334155; margin: 0 0 18px; padding: 0; max-width: 62ch; }
.tf-facts { list-style: none; margin: 0 0 22px; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; }
.tf-facts li { margin: 0; font-size: 13px; font-weight: 600; color: #26463a; background: #fff; border: 1px solid #dbe5df; border-radius: 999px; padding: 6px 12px; }
.tf-facts li::before { content: none; }
.tf-facts b { color: #1e7a4c; }
.tf-ctas { display: flex; flex-wrap: wrap; gap: 10px; }
.tf-btn { display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-height: 46px; padding: 0 20px; border-radius: 12px; background: #1e7a4c; color: #fff !important; font-weight: 800; font-size: 14.5px; text-decoration: none !important; box-shadow: 0 8px 18px -10px rgba(30,122,76,.8); }
.tf-btn:hover { background: #186640; }
.tf-btn.ghost { background: #fffaf0; color: #7a5413 !important; border: 1px solid #ecd3a3; box-shadow: none; }
.tf-hero-img img { width: 100%; height: auto; aspect-ratio: 560 / 340; object-fit: cover; border-radius: 20px; display: block; box-shadow: 0 24px 48px -24px rgba(20,83,45,.45); }

.tf-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-top: 40px; }
.tf-box { background: #f8faf9; border: 1px solid #e6eee9; border-radius: 18px; padding: 22px 24px; }
.tf-box.green { background: #f1f8f4; border-color: #d5e8dc; }
.tf-box h2, .tf-sec-head h2, .tf-faq h2, .tf-others h2 { font-size: 20px; font-weight: 800; color: #14532d; margin: 0 0 14px; }
.tf-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.tf-list li { position: relative; margin: 0; padding-left: 24px; font-size: 15px; line-height: 1.55; color: #334155; }
.tf-list li::before { content: ""; position: absolute; left: 4px; top: 9px; width: 8px; height: 8px; border-radius: 50%; background: #d4a24c; }
.tf-list.check li::before { content: "✓"; width: auto; height: auto; background: none; top: 0; left: 2px; color: #1e7a4c; font-weight: 800; }

.tf-qf { margin-top: 40px; }
.tf-qf h2 { font-size: 20px; font-weight: 800; color: #14532d; margin: 0 0 12px; }
.tf-qf ul { list-style: none; margin: 0; padding: 16px 18px; border-radius: 14px; background: #f7faf8; border: 1px solid #e3ebe6; display: flex; flex-direction: column; gap: 8px; }
.tf-qf li { position: relative; margin: 0; padding-left: 20px; font-size: 15px; line-height: 1.55; color: #334155; }
.tf-qf li::before { content: ""; position: absolute; left: 3px; top: 9px; width: 7px; height: 7px; border-radius: 50%; background: #1e7a4c; }
.tf-updated { font-size: 12.5px; color: #94a3b8; margin: 8px 0 0; padding: 0; }
.tf-lead { margin-top: 44px; }
.tf-thers { margin-top: 44px; }
.tf-sec-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.tf-sec-head a { color: #1e7a4c; font-weight: 800; font-size: 14px; text-decoration: none; }
.tf-cards { display: flex; flex-direction: column; gap: 14px; }
.tf-more { display: flex; justify-content: center; margin-top: 22px; }

.tf-faq { margin-top: 44px; }
.tf-faq details { background: #fff; border: 1px solid #e3ebe6; border-radius: 12px; margin-bottom: 8px; }
.tf-faq summary { cursor: pointer; list-style: none; padding: 14px 44px 14px 16px; font-size: 15px; font-weight: 700; color: #0b1712; position: relative; }
.tf-faq summary::-webkit-details-marker { display: none; }
.tf-faq summary::after { content: '+'; position: absolute; right: 16px; top: 50%; transform: translateY(-50%); font-size: 20px; color: #1e7a4c; }
.tf-faq details[open] summary::after { content: '–'; }
.tf-faq details p { margin: 0; padding: 0 16px 14px; font-size: 14.5px; line-height: 1.65; color: #475569; }

.tf-others { margin-top: 44px; }
.tf-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.tf-chips a { height: 36px; display: inline-flex; align-items: center; padding: 0 14px; border-radius: 999px; border: 1px solid #dbe5df; color: #26463a; font-size: 13.5px; font-weight: 600; text-decoration: none; }
.tf-chips a:hover { border-color: #1e7a4c; color: #1e7a4c; }
.tf-crisis { margin: 24px 0 6px; padding: 12px 14px; border-radius: 12px; background: #fff7ed; border: 1px solid #fed7aa; color: #7c2d12; font-size: 14px; line-height: 1.5; }
.tf-crisis a { color: #9a3412; font-weight: 800; }
.tf-note { font-size: 12.5px; color: #94a3b8; margin: 0; padding: 0; }

@media (max-width: 991px) {
  .tf-hero-grid { grid-template-columns: 1fr; gap: 20px; }
  .tf-hero-img { order: -1; }
  .tf-hero-img img { max-height: 220px; }
}
@media (max-width: 767px) {
  .tf-hero { padding: 18px 0 28px; }
  .tf-lead { font-size: 15px; }
  .tf-ctas .tf-btn { flex: 1 1 100%; }
  .tf-cols { grid-template-columns: 1fr; margin-top: 28px; }
  .tf-box { padding: 18px; }
  .tf-thers, .tf-faq, .tf-others { margin-top: 32px; }
}
`;
