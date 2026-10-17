import React from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import MyNavbar from "../../components/navbar";
import Footer from "../../components/footer";
import AssessmentOptions, { AssessmentProviders, useAssessmentData } from "../../components/self-assessment/assessment-options";
import { FREE_TESTS } from "../../components/self-assessment/tests";
import { CLINICAL_META } from "../../components/self-assessment/clinical";
import { ASSESSMENT_SLUGS, SITE, testBySlug, seoOf, faqOf, pathOf } from "../../components/self-assessment/seo";

/* One clinical assessment's own page (/self-assessment/phq-9-depression-test …): what the test is,
   the two ways to take it (on its own, or with a psychologist), FAQs — with full SEO, Open Graph
   (banner image per test from /api/og-assessment) and schema.org markup. Static, built per test. */

export async function getStaticPaths() {
  return { paths: ASSESSMENT_SLUGS.map((slug) => ({ params: { slug } })), fallback: false };
}
export async function getStaticProps({ params }) {
  return testBySlug(params.slug) ? { props: { slug: params.slug } } : { notFound: true };
}

export default function AssessmentPage({ slug }) {
  const router = useRouter();
  const test = testBySlug(slug);
  const seo = seoOf(test);
  const meta = CLINICAL_META[test.key] || {};
  const faq = faqOf(test);
  const others = FREE_TESTS.filter((t) => t.key !== test.key);
  const mode = router.query.mode === "with" ? "with" : "self";
  const { list, price } = useAssessmentData(test.key);

  const schema = [
    {
      "@context": "https://schema.org", "@type": "MedicalWebPage", "@id": `${seo.url}#page`, "url": seo.url, "name": seo.title, "description": seo.description,
      "inLanguage": "en-IN", "isPartOf": { "@type": "WebSite", "name": "Choose Your Therapist", "url": SITE },
      "primaryImageOfPage": seo.image, "lastReviewed": "2026-10-18",
      "about": { "@type": "MedicalTest", "name": test.full, "alternateName": test.short, "description": meta.significance || test.blurb, "citation": test.ref, "usedToDiagnose": { "@type": "MedicalCondition", "name": test.match || test.title } },
    },
    { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": faq.map(([q, a]) => ({ "@type": "Question", "name": q, "acceptedAnswer": { "@type": "Answer", "text": a } })) },
    {
      "@context": "https://schema.org", "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE },
        { "@type": "ListItem", "position": 2, "name": "Assessments", "item": `${SITE}/self-assessment` },
        { "@type": "ListItem", "position": 3, "name": seo.h1, "item": seo.url },
      ],
    },
  ];

  return (
    <div id="__next">
      <Head>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta name="keywords" content={seo.keywords} />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
        <link rel="canonical" href={seo.url} />

        <meta key="og:type" property="og:type" content="website" />
        <meta key="og:site_name" property="og:site_name" content="Choose Your Therapist" />
        <meta key="og:locale" property="og:locale" content="en_IN" />
        <meta property="og:url" content={seo.url} />
        <meta property="og:title" content={`${seo.h1} — online, with a scored report`} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:image" content={seo.image} />
        <meta property="og:image:secure_url" content={seo.image} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={`${seo.h1} — Choose Your Therapist`} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@chooseyourtherapist" />
        <meta name="twitter:url" content={seo.url} />
        <meta name="twitter:title" content={`${seo.h1} — online, with a scored report`} />
        <meta name="twitter:description" content={seo.description} />
        <meta name="twitter:image" content={seo.image} />
        <meta name="twitter:image:alt" content={`${seo.h1} — Choose Your Therapist`} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </Head>
      <style dangerouslySetInnerHTML={{ __html: AP_CSS }} />
      <MyNavbar />

      <section className="ap-hero" style={{ "--c": test.color }}>
        <div className="ap-in">
          <nav className="ap-crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link><span>›</span><Link href="/self-assessment">Assessments</Link><span>›</span><b>{test.short}</b>
          </nav>
          <span className="ap-kick"><i className={test.icon} aria-hidden="true" /> {test.category} · Clinical assessment</span>
          <h1>{seo.h1}</h1>
          <p className="ap-full">{test.full}</p>
          <p className="ap-blurb">{test.blurb}</p>
          <div className="ap-chips">
            <span><i className="feather-list" aria-hidden="true" /> {test.questions.length} questions</span>
            <span><i className="feather-clock" aria-hidden="true" /> {test.time}</span>
            <span><i className="feather-user" aria-hidden="true" /> {test.age}</span>
            <span><i className="feather-file-text" aria-hidden="true" /> Published scoring</span>
          </div>
          <p className="ap-by">Developed by: {test.by}</p>
        </div>
      </section>

      <main className="ap-main">
        <div className="ap-in ap-grid">
          <div className="ap-left">
            <AssessmentOptions test={test} initialMode={mode} list={list} price={price} />
          </div>
          <aside className="ap-right">
            <section className="ap-card">
              <h2>About the {test.short}</h2>
              {meta.significance && <><h3>What it measures</h3><p>{meta.significance}</p></>}
              {meta.method && <><h3>How it&apos;s taken</h3><p>{meta.method}</p></>}
              {meta.specs && <><h3>Accuracy</h3><p>{meta.specs}</p></>}
              <h3>Reference</h3>
              <p className="ap-ref">{test.ref}</p>
              {test.licence && <p className="ap-lic">{test.licence}</p>}
            </section>
            <section className="ap-card ap-trust">
              <div><i className="feather-lock" aria-hidden="true" /><span><b>Private</b>Your answers stay with you — or only your psychologist</span></div>
              <div><i className="feather-check-circle" aria-hidden="true" /><span><b>Word-for-word questionnaire</b>Original items and scoring, with references</span></div>
            </section>
          </aside>
        </div>

        <div className="ap-in">
          <AssessmentProviders test={test} list={list} />
          <section className="ap-faq" aria-labelledby="ap-faq-h">
            <h2 id="ap-faq-h">{test.short} — frequently asked questions</h2>
            {faq.map(([q, a], i) => (
              <details key={q} open={i === 0}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
            <p className="ap-crisis">A screening score is not a diagnosis. If you are in crisis in India, call Tele-MANAS <a href="tel:14416">14416</a> (free, 24×7) or go to the nearest hospital.</p>
          </section>

          <section className="ap-more" aria-labelledby="ap-more-h">
            <h2 id="ap-more-h">Other clinical assessments</h2>
            <div className="ap-more-grid">
              {others.map((t) => (
                <Link key={t.key} href={pathOf(t.key)} className="ap-more-a" style={{ "--c": t.color }}>
                  <i className={t.icon} aria-hidden="true" />
                  <span><b>{t.short}</b>{t.title}</span>
                </Link>
              ))}
            </div>
            <Link href="/self-assessment" className="ap-all">All assessments →</Link>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

const AP_CSS = `
.ap-in { max-width: 1180px; margin: 0 auto; padding: 0 20px; }
.ap-hero { background: linear-gradient(135deg, #e3f1e8 0%, #f5efe3 60%, #ebeaf8 100%); padding: 26px 0 30px; }
.ap-crumbs { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; font-size: 13px; color: #5b6b62; margin-bottom: 14px; }
.ap-crumbs a { color: #1f6b45 !important; font-weight: 700; text-decoration: none !important; } .ap-crumbs b { color: #173c2a; }
.ap-kick { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 800; color: #3f7a58; background: rgba(255,255,255,.75); border: 1px solid rgba(23,60,42,.1); border-radius: 999px; padding: 5px 12px; }
.ap-kick i { color: var(--c); }
.ap-hero h1 { margin: 12px 0 2px; font-size: clamp(28px, 4vw, 42px); line-height: 1.15; font-weight: 800; letter-spacing: -.4px; color: #173c2a; font-family: inherit; }
.ap-full { margin: 0; font-size: 15px; font-weight: 700; color: #2f8a5b; }
.ap-blurb { max-width: 680px; margin: 10px 0 0; font-size: clamp(14.5px, 1.4vw, 16.5px); line-height: 1.65; color: #4b5b53; }
.ap-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
.ap-chips span { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 700; color: #334155; background: rgba(255,255,255,.8); border: 1px solid rgba(23,60,42,.08); border-radius: 999px; padding: 6px 12px; }
.ap-chips i { color: #1f6b45; }
.ap-by { margin: 12px 0 0; font-size: 12.5px; color: #5b6b62; font-weight: 600; }
.ap-main { background: #f6f8f7; padding: 24px 0 44px; }
.ap-grid { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr); gap: 18px; align-items: start; }
.ap-right { display: flex; flex-direction: column; gap: 14px; }
.ap-card { background: #fff; border: 1px solid #e3eae6; border-radius: 18px; padding: 18px; }
.ap-card h2 { margin: 0 0 8px; font-size: 17px; font-weight: 800; color: #0f172a; font-family: inherit; }
.ap-card h3 { margin: 12px 0 3px; font-size: 12px; font-weight: 800; color: #1f6b45; text-transform: uppercase; letter-spacing: .5px; font-family: inherit; }
.ap-card p { margin: 0; font-size: 13.5px; color: #475569; line-height: 1.6; }
.ap-card .ap-ref { font-size: 12.5px; } .ap-card .ap-lic { margin-top: 6px; font-size: 12px; color: #64748b; font-style: italic; }
.ap-trust { display: flex; flex-direction: column; gap: 10px; }
.ap-trust > div { display: flex; gap: 10px; align-items: flex-start; }
.ap-trust i { width: 32px; height: 32px; border-radius: 10px; background: #e7f6ec; color: #1f6b45; display: grid; place-items: center; flex-shrink: 0; }
.ap-trust b { display: block; font-size: 13.5px; color: #173c2a; } .ap-trust span { font-size: 12px; color: #5b6b62; line-height: 1.45; }
.ap-faq { margin-top: 26px; background: #fff; border: 1px solid #e3eae6; border-radius: 18px; padding: 18px 20px; }
.ap-faq h2, .ap-more h2 { margin: 0 0 10px; font-size: 19px; font-weight: 800; color: #0f172a; font-family: inherit; }
.ap-faq details { border-top: 1px solid #eef2f0; padding: 10px 0; }
.ap-faq summary { cursor: pointer; font-size: 14.5px; font-weight: 700; color: #173c2a; list-style: none; position: relative; padding-right: 26px; }
.ap-faq summary::-webkit-details-marker { display: none; }
.ap-faq summary::after { content: "+"; position: absolute; right: 2px; top: -2px; font-size: 20px; color: #1f6b45; }
.ap-faq details[open] summary::after { content: "–"; }
.ap-faq details p { margin: 8px 0 0; font-size: 13.5px; color: #475569; line-height: 1.65; }
.ap-crisis { margin: 12px 0 0; font-size: 12.5px; color: #64748b; } .ap-crisis a { color: #b91c1c !important; font-weight: 800; }
.ap-more { margin-top: 26px; }
.ap-more-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
.ap-more-a { display: flex; gap: 10px; align-items: center; background: #fff; border: 1px solid #e3eae6; border-radius: 14px; padding: 12px; text-decoration: none !important; transition: border-color .2s, box-shadow .2s; }
.ap-more-a:hover { border-color: color-mix(in srgb, var(--c) 45%, #e3eae6); box-shadow: 0 10px 24px -18px rgba(15,23,42,.4); }
.ap-more-a i { width: 36px; height: 36px; border-radius: 10px; display: grid; place-items: center; flex-shrink: 0; background: color-mix(in srgb, var(--c) 12%, #fff); color: var(--c); }
.ap-more-a b { display: block; font-size: 13.5px; color: #0f172a; } .ap-more-a span { font-size: 12px; color: #64748b; line-height: 1.35; }
.ap-all { display: inline-block; margin-top: 12px; font-size: 14px; font-weight: 800; color: #1f6b45 !important; }
@media (max-width: 991px) { .ap-grid { grid-template-columns: 1fr; } .ap-more-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 560px) { .ap-in { padding: 0 16px; } .ap-more-grid { grid-template-columns: 1fr; } .ap-faq { padding: 14px 16px; } }
`;
