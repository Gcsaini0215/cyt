import React from "react";
import Head from "next/head";
import Link from "next/link";
import MyNavbar from "../navbar";
import Footer from "../footer";
import MobileActionBar from "../global/mobile-action-bar";
import { fitTitle, fitDesc } from "../../utils/seo-text";
import { siteCardUrl } from "../../utils/og-urls";

/* Comparison guides (/psychologist-vs-psychiatrist-vs-counsellor, /online-vs-in-person-therapy):
   a short direct answer first (what search and AI answers quote), then a side-by-side table,
   "when to choose which", FAQs (English + Hinglish) and links to book. The page's data lives in
   the page file; this renders it and its schema. */

const SITE = "https://www.chooseyourtherapist.in";

export default function CompareGuide({ g }) {
  const url = `${SITE}${g.path}`;
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": ["Article", "MedicalWebPage"],
      "@id": `${url}#article`,
      headline: g.h1,
      description: g.description,
      url,
      inLanguage: "en-IN",
      image: siteCardUrl("concern", { concern: g.cardTitle }),
      datePublished: g.published,
      dateModified: g.updated,
      lastReviewed: g.updated,
      author: { "@type": "Organization", "@id": `${SITE}#organization`, name: "Choose Your Therapist" },
      reviewedBy: { "@type": "Organization", "@id": `${SITE}#organization`, name: "Choose Your Therapist" },
      publisher: { "@type": "Organization", "@id": `${SITE}#organization`, name: "Choose Your Therapist", logo: { "@type": "ImageObject", url: `${SITE}/icons/cyt-icon-512.png` } },
      about: g.about.map((name) => ({ "@type": "Thing", name })),
      medicalAudience: { "@type": "MedicalAudience", audienceType: "Patient" },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: g.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
        { "@type": "ListItem", position: 2, name: "All psychologists", item: `${SITE}/view-all-therapist` },
        { "@type": "ListItem", position: 3, name: g.crumb, item: url },
      ],
    },
  ];
  const fmt = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

  return (
    <>
      <Head>
        <title>{fitTitle(g.title)}</title>
        <meta name="description" content={fitDesc(g.description)} />
        <link rel="canonical" href={url} />
        <meta name="robots" content="index, follow" />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={g.title} />
        <meta property="og:description" content={fitDesc(g.description)} />
        <meta property="og:url" content={url} />
        <meta key="og:image" property="og:image" content={siteCardUrl("concern", { concern: g.cardTitle })} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        {schemas.map((s, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />)}
      </Head>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <MyNavbar />

      <main className="cg">
        <section className="cg-hero" aria-labelledby="cg-h1">
          <div className="container">
            <nav className="cg-crumbs" aria-label="Breadcrumb">
              <Link href="/">CYT Home</Link> <span aria-hidden="true">›</span>
              <Link href="/view-all-therapist">All psychologists</Link> <span aria-hidden="true">›</span>
              <span aria-current="page">{g.crumb}</span>
            </nav>
            <p className="cg-eyebrow">Guide · India</p>
            <h1 id="cg-h1">{g.h1}</h1>
            <p className="cg-meta">By the Choose Your Therapist team · Reviewed by CYT psychologists · Updated <time dateTime={g.updated}>{fmt(g.updated)}</time></p>
          </div>
        </section>

        <div className="container cg-body">
          {/* the short answer — written to be quoted on its own */}
          <section className="cg-answer" aria-labelledby="cg-ans">
            <h2 id="cg-ans">The short answer</h2>
            {g.answer.map((p, i) => <p key={i}>{p}</p>)}
          </section>

          <section aria-labelledby="cg-tbl">
            <h2 id="cg-tbl">{g.tableTitle}</h2>
            <div className="cg-table-wrap">
              <table className="cg-table">
                <thead>
                  <tr><th scope="col"><span className="cg-sr">Question</span></th>{g.columns.map((c) => <th key={c} scope="col">{c}</th>)}</tr>
                </thead>
                <tbody>
                  {g.rows.map(([label, ...cells]) => (
                    <tr key={label}><th scope="row">{label}</th>{cells.map((v, i) => <td key={i}>{v}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section aria-labelledby="cg-when">
            <h2 id="cg-when">{g.whenTitle}</h2>
            <div className="cg-cards">
              {g.when.map((w) => (
                <div key={w.title} className="cg-card">
                  <h3>{w.title}</h3>
                  <ul>{w.points.map((p) => <li key={p}>{p}</li>)}</ul>
                  {w.link && <Link className="cg-link" href={w.link.href} rel={w.link.href.includes("?") ? "nofollow" : undefined}>{w.link.text} →</Link>}
                </div>
              ))}
            </div>
          </section>

          {g.sections.map((s) => (
            <section key={s.h} className="cg-prose">
              <h2>{s.h}</h2>
              {s.p.map((p, i) => <p key={i}>{p}</p>)}
            </section>
          ))}

          <aside className="cg-crisis" role="note">
            <b>In a crisis?</b> If you are thinking of harming yourself, call Tele-MANAS on <a href="tel:14416">14416</a> or <a href="tel:18008914416">1800-89-14416</a> (free, 24×7), or go to the nearest hospital emergency.
          </aside>

          <section className="cg-cta" aria-labelledby="cg-next">
            <h2 id="cg-next">Talk to a verified psychologist</h2>
            <p>Online from ₹500, anywhere in India — or in person at our Noida centre (Sector 51) from ₹1,200.</p>
            <div className="cg-btns">
              <Link className="cg-btn" href="/view-all-therapist">Browse verified psychologists</Link>
              <Link className="cg-btn ghost" href="/noida-appointment">Book at the Noida centre</Link>
            </div>
          </section>

          <section className="cg-faq" aria-labelledby="cg-fq">
            <h2 id="cg-fq">Common questions</h2>
            {g.faqs.map((f, i) => (
              <details key={f.q} open={i === 0}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </section>

          <nav className="cg-more" aria-label="Related guides">
            <b>Related</b>
            {g.related.map((r) => <Link key={r.href} href={r.href}>{r.text}</Link>)}
          </nav>
        </div>
      </main>

      <MobileActionBar />
      <Footer />
    </>
  );
}

const CSS = `
.cg { background: #fff; }
.cg-hero { background: linear-gradient(135deg, #0b1712 0%, #14532d 100%); padding: 44px 0 40px; color: #fff; }
.cg-crumbs { font-size: 13px; color: rgba(255,255,255,.6); margin-bottom: 14px; }
.cg-crumbs a { color: rgba(255,255,255,.85) !important; font-weight: 600; text-decoration: none !important; }
.cg-eyebrow { display: inline-flex; align-items: center; gap: 8px; margin: 0 0 10px; font-size: 11.5px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; color: #ecc77d; }
.cg-eyebrow::before { content: ""; width: 22px; height: 2px; background: #e0ab45; }
.cg-hero h1 { font-size: clamp(28px, 4vw, 44px); font-weight: 800; color: #fff; margin: 0 0 12px; line-height: 1.15; letter-spacing: -.02em; max-width: 900px; }
.cg-meta { font-size: 13.5px; color: rgba(255,255,255,.75); margin: 0; }
.cg-body { max-width: 980px; padding-top: 32px; padding-bottom: 56px; }
.cg-body h2 { font-size: clamp(20px, 2.6vw, 26px); font-weight: 800; color: #0b1712; margin: 36px 0 14px; }
.cg-body p, .cg-body li { font-size: 16.5px; line-height: 1.7; color: #334155; }
.cg-answer { background: #f5faf6; border: 1px solid #dcebe1; border-left: 5px solid #e0ab45; border-radius: 14px; padding: 6px 22px 10px; }
.cg-answer h2 { margin-top: 16px; }
.cg-table-wrap { overflow-x: auto; border: 1px solid #e3ebe6; border-radius: 14px; }
.cg-table { width: 100%; border-collapse: collapse; min-width: 640px; font-size: 14.5px; }
.cg-table th, .cg-table td { padding: 12px 14px; text-align: left; vertical-align: top; border-bottom: 1px solid #eef2ef; line-height: 1.5; color: #334155; }
.cg-table thead th { background: #14532d; color: #fff; font-weight: 800; }
.cg-table tbody th { background: #f8fbf9; color: #0f2a1d; font-weight: 700; width: 22%; }
.cg-table tbody tr:last-child th, .cg-table tbody tr:last-child td { border-bottom: none; }
.cg-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.cg-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; }
.cg-card { border: 1px solid #e3ebe6; border-radius: 14px; padding: 18px 20px; background: #fff; }
.cg-card h3 { font-size: 18px; font-weight: 800; color: #14532d; margin: 0 0 8px; }
.cg-card ul { margin: 0 0 10px; padding-left: 18px; }
.cg-card li { font-size: 15px; margin-bottom: 4px; }
.cg-link { font-weight: 800; color: #1e7a4c !important; text-decoration: none !important; font-size: 14.5px; }
.cg-crisis { margin: 32px 0 0; padding: 14px 18px; border-radius: 12px; background: #fff7ed; border: 1px solid #fed7aa; font-size: 15px; color: #7c2d12; }
.cg-crisis a { color: #9a3412 !important; font-weight: 800; }
.cg-cta { margin-top: 32px; padding: 24px; border-radius: 16px; background: #0b1712; color: #fff; }
.cg-cta h2 { color: #fff; margin: 0 0 6px; }
.cg-cta p { color: rgba(255,255,255,.85); margin: 0 0 16px; }
.cg-btns { display: flex; flex-wrap: wrap; gap: 10px; }
.cg-btn { display: inline-flex; align-items: center; height: 46px; padding: 0 20px; border-radius: 12px; background: #e0ab45; color: #3b2606 !important; font-weight: 800; text-decoration: none !important; }
.cg-btn.ghost { background: transparent; color: #fff !important; border: 1.5px solid rgba(255,255,255,.5); }
.cg-faq details { border: 1px solid #e3ebe6; border-radius: 12px; padding: 0 16px; margin-bottom: 8px; background: #fff; }
.cg-faq summary { cursor: pointer; padding: 14px 0; font-weight: 700; color: #0f2a1d; font-size: 16px; }
.cg-faq details p { margin: 0 0 14px; }
.cg-more { display: flex; flex-wrap: wrap; gap: 8px 16px; align-items: center; margin-top: 28px; font-size: 15px; }
.cg-more a { color: #1e7a4c !important; font-weight: 700; }
@media (max-width: 767px) {
  .cg-hero { padding: 30px 0 28px; }
  .cg-body { padding-left: 16px; padding-right: 16px; }
  .cg-body p, .cg-body li { font-size: 15.5px; }
  .cg-btn { width: 100%; justify-content: center; }
}
`;
