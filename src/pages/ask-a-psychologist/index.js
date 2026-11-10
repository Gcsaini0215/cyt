import React from "react";
import Head from "next/head";
import Link from "next/link";
import MyNavbar from "../../components/navbar";
import Footer from "../../components/footer";
import { fetchData } from "../../utils/actions";
import { apiUrl } from "../../utils/url";
import { getSlugMaps } from "../../utils/therapist-slug-maps";
import { ASK_CATEGORIES, ASK_LABEL, ASK_PATH } from "../../utils/ask";
import { therapistLink, Answerer, ASK_PUBLIC_CSS } from "../../components/ask/ask-public";

/* Public "Ask a psychologist": real questions from CYT clients (anonymous, published with their OK),
   answered by verified CYT psychologists. Each answer links to that psychologist's profile.
   Kept out of the index until there are a few answers (thin pages hurt). */
const SITE = "https://www.chooseyourtherapist.in";

export async function getServerSideProps({ query, res }) {
  const category = ASK_LABEL[query.category] ? query.category : "";
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  let data = { items: [], total: 0, page: 1, pages: 1, categories: {} };
  try {
    const r = await fetchData(`${apiUrl}/ask/public`, { category, page });
    if (r?.status) data = r.data;
  } catch (e) { /* show the empty state */ }
  let maps = null;
  try { maps = await getSlugMaps(); } catch (e) { /* answers still show, without profile links */ }
  const items = data.items.map((q) => ({ ...q, who: therapistLink(q.therapist, maps), therapist: null }));
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
  return { props: { items, total: data.total, page: data.page, pages: data.pages, categories: data.categories || {}, category } };
}

export default function AskPublic({ items, total, page, pages, categories, category }) {
  const all = Object.values(categories).reduce((a, b) => a + b, 0);
  const title = category ? `${ASK_LABEL[category]} — Ask a Psychologist | CYT` : "Ask a Psychologist — Free Answers | Choose Your Therapist";
  const desc = "Real questions about anxiety, relationships, stress and more — answered by verified psychologists on Choose Your Therapist. Ask yours anonymously, free.";
  const canonical = `${SITE}${ASK_PATH}${category ? `?category=${category}` : ""}`;
  const q = (c, p) => { const s = new URLSearchParams(); if (c) s.set("category", c); if (p > 1) s.set("page", String(p)); const t = s.toString(); return `${ASK_PATH}${t ? `?${t}` : ""}`; };
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={canonical} />
        {(all < 3 || page > 1) && <meta name="robots" content="noindex, follow" />}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:url" content={canonical} />
      </Head>
      <style dangerouslySetInnerHTML={{ __html: ASK_PUBLIC_CSS }} />
      <MyNavbar />
      <main className="apq">
        <section className="apq-hero">
          <div className="apq-wrap">
            <span className="apq-eyebrow">Free · anonymous · answered by psychologists</span>
            <h1>Ask a <em>psychologist</em></h1>
            <p>Real questions from people like you — about anxiety, relationships, work stress, sleep and more — answered by verified psychologists on Choose Your Therapist.</p>
            <Link href="/client/ask" className="apq-cta">Ask your question — free →</Link>
            <div className="apq-trust"><span>✓ Your name is never shown</span><span>✓ Answered by verified psychologists</span><span>✓ Usually within 48 hours</span></div>
          </div>
        </section>

        <div className="apq-wrap">
          <nav className="apq-cats" aria-label="Topics">
            <Link href={q("", 1)} className={!category ? "on" : ""}>All{all ? <small>{all}</small> : null}</Link>
            {ASK_CATEGORIES.filter(([k]) => categories[k]).map(([k, l]) => (
              <Link key={k} href={q(k, 1)} className={category === k ? "on" : ""}>{l}<small>{categories[k]}</small></Link>
            ))}
          </nav>

          {items.length ? (
            <div className="apq-list">
              {items.map((it) => (
                <article key={it.slug} className="apq-card">
                  <span className="apq-tag">{ASK_LABEL[it.category] || "Question"}</span>
                  <h2><Link href={`${ASK_PATH}/${it.slug}`}>{it.title}</Link></h2>
                  <p className="apq-snip">{it.answer}</p>
                  <Answerer who={it.who} />
                </article>
              ))}
            </div>
          ) : (
            <div className="apq-empty">
              <b>{total === 0 && !category ? "Answers are on their way" : "No answers in this topic yet"}</b>
              Be the first to ask — a verified psychologist will write back, usually within 48 hours.
            </div>
          )}

          {pages > 1 && (
            <div className="apq-pager">
              {page > 1 && <Link href={q(category, page - 1)}>← Newer</Link>}
              {page < pages && <Link href={q(category, page + 1)}>Older →</Link>}
            </div>
          )}

          <section className="apq-how" aria-label="How it works">
            <div><span>1</span><b>Ask anonymously</b><p>Log in and write your question. Only our psychologists see it.</p></div>
            <div><span>2</span><b>A psychologist answers</b><p>A verified Choose Your Therapist psychologist writes back — on your dashboard and by email.</p></div>
            <div><span>3</span><b>Talk it through</b><p>If you&apos;d like more help, book a session with the psychologist who answered.</p></div>
          </section>
          <p className="apq-note">Answers here are general guidance, not a diagnosis or treatment. If you feel unsafe, call <a href="tel:14416">Tele-MANAS 14416</a> or <a href="tel:112">112</a>.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
