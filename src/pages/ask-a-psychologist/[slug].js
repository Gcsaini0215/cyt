import React, { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import MyNavbar from "../../components/navbar";
import Footer from "../../components/footer";
import { fetchData } from "../../utils/actions";
import { apiUrl } from "../../utils/url";
import { getSlugMaps } from "../../utils/therapist-slug-maps";
import { ASK_LABEL, ASK_PATH, fmtAskDate } from "../../utils/ask";
import { therapistLink, Answerer, ASK_PUBLIC_CSS } from "../../components/ask/ask-public";

const SITE = "https://www.chooseyourtherapist.in";

export async function getServerSideProps({ params, res }) {
  let q = null;
  try {
    const r = await fetchData(`${apiUrl}/ask/public/${encodeURIComponent(params.slug)}`);
    if (r?.status) q = r.data;
  } catch (e) { /* 404 below */ }
  if (!q) return { notFound: true };
  let maps = null;
  try { maps = await getSlugMaps(); } catch (e) { /* no profile link */ }
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
  return { props: { q: { ...q, who: therapistLink(q.therapist, maps), therapist: null } } };
}

export default function AskOne({ q }) {
  const [helpful, setHelpful] = useState(q.helpful || 0);
  const [voted, setVoted] = useState(false);
  const url = `${SITE}${ASK_PATH}/${q.slug}`;
  const desc = String(q.answer || "").replace(/\s+/g, " ").slice(0, 155);
  const who = q.who;
  const schema = {
    "@context": "https://schema.org",
    "@type": "QAPage",
    mainEntity: {
      "@type": "Question",
      name: q.title,
      text: q.body,
      answerCount: 1,
      datePublished: q.publishedAt,
      author: { "@type": "Person", name: "Anonymous" },
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
        datePublished: q.answeredAt || q.publishedAt,
        upvoteCount: helpful,
        url,
        author: { "@type": "Person", name: who?.name || "Choose Your Therapist psychologist", jobTitle: who?.role, ...(who?.profileHref ? { url: `${SITE}${who.profileHref}` } : {}) },
      },
    },
  };
  const vote = async () => {
    if (voted) return;
    setVoted(true);
    try {
      const r = await fetch(`${apiUrl}/ask/public/${encodeURIComponent(q.slug)}/helpful`, { method: "POST" }).then((x) => x.json());
      if (r?.data?.counted) setHelpful(r.data.helpful);
    } catch (e) { /* fine */ }
  };
  return (
    <>
      <Head>
        <title>{`${q.title.length > 52 ? `${q.title.slice(0, 50)}…` : q.title} | Ask a Psychologist`}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={q.title} />
        <meta property="og:description" content={desc} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="article" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </Head>
      <style dangerouslySetInnerHTML={{ __html: ASK_PUBLIC_CSS }} />
      <MyNavbar />
      <main className="apq">
        <section className="apq-hero">
          <div className="apq-wrap">
            <div className="apq-crumb"><Link href={ASK_PATH}>Ask a Psychologist</Link> › <Link href={`${ASK_PATH}?category=${q.category}`}>{ASK_LABEL[q.category] || "Questions"}</Link></div>
            <h1>{q.title}</h1>
            <div className="apq-q-meta">
              <span>Asked anonymously{[q.context?.gender, q.context?.ageRange].filter(Boolean).length ? ` · ${[q.context.gender, q.context.ageRange].filter(Boolean).join(", ")}` : ""}</span>
              <span>· Answered {fmtAskDate(q.answeredAt || q.publishedAt)}</span>
            </div>
          </div>
        </section>
        <div className="apq-wrap apq-detail">
          <div>
            <div className="apq-asked"><small>The question</small><p>{q.body}</p></div>
            <div className="apq-answer">
              <small>Answer</small>
              <Answerer who={who} big />
              <div className="apq-answer-t">{q.answer}</div>
              <div className="apq-helpful">
                <button type="button" onClick={vote} disabled={voted}>{voted ? "Thanks!" : "👍 This helped"}</button>
                {helpful > 0 && <span>{helpful} {helpful === 1 ? "person" : "people"} found this helpful</span>}
              </div>
              <div className="apq-disc">General guidance from a psychologist, not a diagnosis or treatment plan. Everyone&apos;s situation is different — a session gives you advice for yours. If you feel unsafe, call <b>Tele-MANAS 14416</b> or <b>112</b>.</div>
            </div>
          </div>
          <aside className="apq-side">
            {who?.bookHref && (
              <div className="apq-book">
                <Answerer who={who} />
                <p>Want to talk this through for your own situation? Book a private session with {who.name.split(" ")[0]}.</p>
                <Link href={who.bookHref} className="apq-cta">Book a session</Link>
                <Link href={who.profileHref} className="apq-sec">View profile</Link>
              </div>
            )}
            <div className="apq-ask">
              <b>Have a question of your own?</b>
              <p>Ask anonymously — a verified psychologist will answer, free.</p>
              <Link href="/client/ask" className="apq-cta">Ask a psychologist</Link>
            </div>
            {q.related?.length > 0 && (
              <div className="apq-ask apq-rel">
                <h3>More on {(ASK_LABEL[q.category] || "this").toLowerCase()}</h3>
                {q.related.map((r) => <Link key={r.slug} href={`${ASK_PATH}/${r.slug}`}>{r.title}</Link>)}
              </div>
            )}
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
