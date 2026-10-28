import React from "react";
import Head from "next/head";

/* A visible FAQ and its FAQPage schema from the same list, so the answers in the schema are exactly the ones
   on the page (Google's rule, and what AI search quotes). items: [{ q, a }] — `a` is plain text. */
export default function FaqBlock({ id = "faq", title = "Frequently asked questions", items = [] }) {
  const list = items.filter((x) => x && x.q && x.a);
  if (!list.length) return null;
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: list.map((x) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } })),
  };
  return (
    <section className="fqb" id={id} aria-labelledby={`${id}-h`}>
      <Head>
        <script key={`ld-${id}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </Head>
      <style dangerouslySetInnerHTML={{ __html: FQB_CSS }} />
      <h2 id={`${id}-h`}>{title}</h2>
      <div className="fqb-list">
        {list.map((x, i) => (
          <details key={x.q} className="fqb-item" open={i === 0}>
            <summary>{x.q}</summary>
            <p>{x.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

const FQB_CSS = `
.fqb { max-width: 1180px; margin: 0 auto; padding: 26px 32px 10px; font-family: inherit; }
.fqb h2 { margin: 0 0 12px; font-size: 22px; font-weight: 800; color: #0f2a1d; letter-spacing: -.2px; }
.fqb-list { display: flex; flex-direction: column; gap: 8px; max-width: 900px; }
.fqb-item { border: 1px solid #e2ebe5; border-radius: 12px; background: #fff; }
.fqb-item summary { cursor: pointer; list-style: none; padding: 13px 44px 13px 16px; position: relative; font-size: 15px; font-weight: 700; color: #0f2a1d; }
.fqb-item summary::-webkit-details-marker { display: none; }
.fqb-item summary::after { content: "+"; position: absolute; right: 16px; top: 50%; transform: translateY(-50%); font-size: 20px; font-weight: 700; color: #166534; }
.fqb-item[open] summary::after { content: "–"; }
.fqb-item p { margin: 0; padding: 0 16px 14px; font-size: 14.5px; line-height: 1.7; color: #334155; }
@media (max-width: 599px) { .fqb { padding: 22px 14px 8px; } .fqb h2 { font-size: 20px; } }
`;
