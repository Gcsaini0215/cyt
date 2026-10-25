import React, { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import Footer from "../components/footer";
import MyNavbar from "../components/navbar";
import { getDecodedToken } from "../utils/jwt";
import { getAllBlogs, blogCard } from "../utils/blog-cache";
import { usePager, Pager } from "../components/therapists/pager";
import dynamic from "next/dynamic";
import { blogPath } from "../utils/blog-slug";
const BookingPopup = dynamic(() => import("../components/global/booking-popup"), { ssr: false });

/* /blogs — calm banner with search + topics, a featured post, a grid of cards and a nudge to
   talk to someone. Clients reach it from their portal menu ("Reads for me"). */

const PAGE_URL = "https://www.chooseyourtherapist.in/blogs";
const OG_IMAGE = "https://i.postimg.cc/gj1yngrd/choose.png";
const SITE = "https://www.chooseyourtherapist.in";
const SEO_TITLE = "Mental Health Blog India — Psychologist Articles | CYT";
const SEO_DESC = "Free, psychologist-reviewed articles on anxiety, depression, OCD, stress and relationships in India — signs to watch for, tips and when to get help.";
const ORG = { "@type": "Organization", "@id": `${SITE}#organization`, "name": "Choose Your Therapist", "url": SITE, "logo": { "@type": "ImageObject", "url": `${SITE}/cyt-emblem.png` } };

// shown on the page AND sent as FAQPage — answer engines (Google, ChatGPT, Perplexity) quote these
const BLOG_FAQS = [
  { q: "Who writes the articles on the Choose Your Therapist blog?", a: "Articles are written or reviewed by verified psychologists and counsellors on Choose Your Therapist, an Indian mental-health platform registered on the Government of India's Health Facility Registry (HFR ID IN0510005384). Every psychologist's qualifications are checked before their profile goes live." },
  { q: "Can reading these articles replace therapy?", a: "No. The articles explain common mental-health concerns and practical coping steps, but they are general information, not a diagnosis or treatment. If something you read sounds like you, a session with a qualified psychologist is the right next step." },
  { q: "How do I know if I should see a therapist?", a: "Consider talking to a psychologist if worry, low mood, stress, sleep problems or relationship difficulties have lasted for two weeks or more, or are affecting your work, studies, relationships or daily routine. You don't need to be in crisis to start therapy." },
  { q: "What topics does the blog cover?", a: "Anxiety, depression, OCD, stress and burnout, relationships and couples issues, trauma, self-esteem, self-care, and how therapy works in India — including how to choose a psychologist and what to expect in a first session." },
  { q: "What should I do in a mental-health emergency in India?", a: "If you or someone you know is in danger or thinking about self-harm, call Tele-MANAS on 14416 or 1800-89-14416 (free, 24×7), dial 112, or go to the nearest hospital emergency." },
];

const blogListingSchema = {
  "@context": "https://schema.org",
  "@type": "Blog",
  "@id": `${PAGE_URL}#blog`,
  "name": "Choose Your Therapist — Mental Health & Psychology Blog",
  "description": "Expert articles on mental health, therapy, anxiety, depression, OCD, relationships, and psychological wellbeing — written and reviewed by verified psychologists in India.",
  "url": PAGE_URL,
  "inLanguage": "en-IN",
  "publisher": {
    "@type": "Organization",
    "@id": "https://www.chooseyourtherapist.in#organization",
    "name": "Choose Your Therapist"
  },
  "about": [
    { "@type": "MedicalCondition", "name": "Anxiety" },
    { "@type": "MedicalCondition", "name": "Depression" },
    { "@type": "MedicalCondition", "name": "OCD" },
    { "@type": "MedicalCondition", "name": "Trauma and PTSD" },
    { "@type": "MedicalCondition", "name": "Relationship Issues" },
    { "@type": "MedicalCondition", "name": "Mental Health Stigma" }
  ]
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.chooseyourtherapist.in/" },
    { "@type": "ListItem", "position": 2, "name": "Mental Health Blog", "item": PAGE_URL }
  ]
};

const blogsHeroSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${PAGE_URL}#webpage`,
  "name": "Mental Health & Psychology Blog — Choose Your Therapist",
  "description": "India's most trusted mental health blog. Expert articles on anxiety, depression, OCD, relationships, trauma, and therapy — written and reviewed by verified psychologists.",
  "url": PAGE_URL,
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": [".blogs-hero-heading", ".blogs-hero-desc", ".blogs-why-text", ".bl-faq-a"]
  },
  "about": [
    { "@type": "MedicalCondition", "name": "Anxiety Disorder" },
    { "@type": "MedicalCondition", "name": "Depression" },
    { "@type": "MedicalCondition", "name": "OCD" },
    { "@type": "MedicalCondition", "name": "Relationship Issues" },
    { "@type": "MedicalCondition", "name": "Trauma and PTSD" }
  ]
};

// Posts are read on the server (cached, see utils/blog-cache) so the page arrives with its
// articles — light for phones and readable by search engines.
export async function getServerSideProps({ res }) {
  let posts = [];
  try {
    posts = (await getAllBlogs()).map(blogCard);
  } catch (e) {
    console.error("blogs getServerSideProps:", e.message);
  }
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
  return { props: { posts } };
}

const AWARENESS = [
  { icon: "🧠", heading: "Anxiety vs. everyday stress — what's the difference?", text: "Everyone feels nervous sometimes. But anxiety is different — it's persistent, often irrational, and can interfere with daily life. Understanding the difference is the first step to getting the right support." },
  { icon: "💬", heading: "Common myths about therapy — debunked", text: "Therapy is not just for people in crisis. It's a structured, confidential conversation with a trained psychologist that helps you understand yourself better and develop practical coping strategies." },
  { icon: "❤️", heading: "How relationships affect your mental health", text: "Toxic relationships, loneliness, and unresolved family conflict have a direct impact on mental wellbeing. Our articles provide honest, practical perspectives on navigating these challenges." },
  { icon: "😔", heading: "Depression is more than just sadness", text: "Depression is a medical condition — not a personality flaw or weakness. Its symptoms can be subtle: disturbed sleep, loss of motivation, emotional numbness. Recognising it is the first step toward healing." },
  { icon: "🔄", heading: "OCD is not just about cleanliness", text: "OCD involves intrusive thoughts, checking behaviours, and mental compulsions — not just handwashing. It is a treatable condition, and understanding it clearly helps reduce stigma and seek the right help." },
  { icon: "🌱", heading: "Self-care that actually works", text: "Real self-care is not about expensive routines. It means setting boundaries, recognising your own needs, and building sustainable habits. Our articles focus on practical, evidence-backed approaches." },
];

// a soft tint per category, so the cards aren't all one colour
const TINTS = [["#e7f6ec", "#166534"], ["#e8f1fd", "#1d4ed8"], ["#fdeef2", "#be185d"], ["#fdf4e3", "#b45309"], ["#efeafd", "#6d28d9"], ["#e3f6f4", "#0f766e"]];
const tintOf = (cat) => TINTS[[...String(cat)].reduce((a, c) => a + c.charCodeAt(0), 0) % TINTS.length];
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }) : "");
const hrefOf = (p) => blogPath(p);
const thumbOf = (p) => (p.hasImage ? `/api/blog-thumb?id=${p.id}` : "/assets/img/blog-card-048b22.jpg");

function Card({ p }) {
  const [bg, fg] = tintOf(p.category);
  return (
    <article className="bl-card-wrap">
      <Link href={hrefOf(p)} className="bl-card">
        <span className="bl-card-img"><img src={thumbOf(p)} alt={p.title} loading="lazy" width="400" height="250" /></span>
        <span className="bl-card-body">
          <em className="bl-cat" style={{ background: bg, color: fg }}>{p.category}</em>
          <h3 className="bl-t">{p.title}</h3>
          <span className="bl-ex">{p.excerpt}</span>
          <span className="bl-meta">{p.createdAt && <time dateTime={new Date(p.createdAt).toISOString()}>{fmtDate(p.createdAt)}</time>} · {p.minutes} min read <i>Read →</i></span>
        </span>
      </Link>
    </article>
  );
}

export default function BlogsPage({ posts = [] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [isClient, setIsClient] = useState(false); // signed-in client who came from their dashboard
  useEffect(() => { try { setIsClient(getDecodedToken()?.role === 0); } catch (e) { /* not signed in */ } }, []);

  const cats = useMemo(() => ["All", ...Array.from(new Set(posts.map((p) => p.category))).slice(0, 8)], [posts]);
  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return posts.filter((p) => (cat === "All" || p.category === cat) && (!t || `${p.title} ${p.excerpt} ${p.category}`.toLowerCase().includes(t)));
  }, [posts, q, cat]);
  const browsing = !q.trim() && cat === "All";

  // ── SEO: the newest post's cover for link previews; every post as BlogPosting for search + AI answers
  const latest = posts[0] || null;
  const ogImage = latest?.hasImage ? `${SITE}/api/blog-thumb?id=${latest.id}` : OG_IMAGE;
  const postLd = (p) => ({
    "@type": "BlogPosting",
    "@id": `${SITE}${hrefOf(p)}#article`,
    "headline": p.title,
    "description": p.excerpt,
    "url": `${SITE}${hrefOf(p)}`,
    "mainEntityOfPage": `${SITE}${hrefOf(p)}`,
    ...(p.createdAt ? { "datePublished": p.createdAt, "dateModified": p.createdAt } : {}),
    ...(p.hasImage ? { "image": `${SITE}/api/blog-thumb?id=${p.id}` } : {}),
    "articleSection": p.category,
    "timeRequired": `PT${p.minutes}M`,
    "inLanguage": "en-IN",
    "author": { "@id": `${SITE}#organization` },
    "publisher": { "@id": `${SITE}#organization` },
  });
  const schemas = [
    { "@context": "https://schema.org", ...ORG },
    { ...blogListingSchema, "blogPost": posts.slice(0, 30).map(postLd) },
    {
      ...blogsHeroSchema, "@type": "CollectionPage", "name": SEO_TITLE, "description": SEO_DESC, "inLanguage": "en-IN",
      "isPartOf": { "@type": "WebSite", "@id": `${SITE}#website`, "name": "Choose Your Therapist", "url": SITE },
      "publisher": { "@id": `${SITE}#organization` },
      ...(latest?.createdAt ? { "dateModified": latest.createdAt } : {}),
      "mainEntity": {
        "@type": "ItemList", "numberOfItems": posts.length,
        "itemListElement": posts.slice(0, 30).map((p, k) => ({ "@type": "ListItem", "position": k + 1, "url": `${SITE}${hrefOf(p)}`, "name": p.title })),
      },
    },
    breadcrumbSchema,
    {
      "@context": "https://schema.org", "@type": "FAQPage", "@id": `${PAGE_URL}#faq`,
      "mainEntity": BLOG_FAQS.map((f) => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } })),
    },
  ];
  const featured = browsing ? shown[0] : null;
  const rest = featured ? shown.slice(1) : shown;
  const pg = usePager(rest, 9, `${q}|${cat}`);

  return (
    <div id="__next">
      <Head>
        <title>{SEO_TITLE}</title>
        <meta name="description" content={SEO_DESC} />
        <meta name="keywords" content="mental health blog India, psychology articles India, anxiety tips, depression help, OCD, stress and burnout, relationship counselling, therapy in India, psychologist articles, self care" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="author" content="Choose Your Therapist" />
        <link rel="canonical" href={PAGE_URL} />
        <link rel="alternate" hrefLang="en-IN" href={PAGE_URL} />
        <link rel="alternate" hrefLang="x-default" href={PAGE_URL} />

        {/* Open Graph */}
        <meta key="og:type" property="og:type" content="website" />
        <meta key="og:site_name" property="og:site_name" content="Choose Your Therapist" />
        <meta key="og:locale" property="og:locale" content="en_IN" />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:title" content="Mental Health Blog — Articles by Verified Psychologists in India" />
        <meta property="og:description" content={SEO_DESC} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:secure_url" content={ogImage} />
        <meta property="og:image:alt" content={latest ? latest.title : "Choose Your Therapist — mental health blog"} />
        {latest?.createdAt && <meta property="og:updated_time" content={new Date(latest.createdAt).toISOString()} />}

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@chooseyourtherapist" />
        <meta name="twitter:title" content="Mental Health Blog — Articles by Verified Psychologists in India" />
        <meta name="twitter:description" content={SEO_DESC} />
        <meta name="twitter:image" content={ogImage} />
        <meta name="twitter:image:alt" content={latest ? latest.title : "Choose Your Therapist — mental health blog"} />

        {schemas.map((sc, k) => (
          <script key={k} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(sc) }} />
        ))}
      </Head>
      <style dangerouslySetInnerHTML={{ __html: BL_CSS }} />
      <MyNavbar />

      <main className="bl">
        {/* soothing banner: soft sage → cream → lavender, gentle shapes, search + topics */}
        <section className="bl-hero">
          <span className="bl-blob a" /><span className="bl-blob b" /><span className="bl-blob c" />
          <div className="bl-wrap bl-hero-in">
            <nav className="bl-crumbs" aria-label="Breadcrumb">
              {isClient ? <Link href="/my-dashboard">← Back to My Space</Link> : <><Link href="/">Home</Link><span>/</span><b>Blog</b></>}
            </nav>
            <p className="bl-eyebrow">🌿 Mental Health Blog · by verified psychologists</p>
            <h1 className="blogs-hero-heading">Mental health articles for <span>calmer days</span></h1>
            <p className="bl-sub blogs-hero-desc">Evidence-based articles on anxiety, depression, OCD, relationships, trauma and therapy — written and reviewed by verified psychologists across India.</p>
            <label className="bl-search">
              <SearchRoundedIcon />
              <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search anxiety, sleep, relationships…" aria-label="Search articles" />
            </label>
            <div className="bl-chips" role="tablist" aria-label="Topics">
              {cats.map((c) => (
                <button key={c} type="button" role="tab" aria-selected={cat === c} className={cat === c ? "on" : ""} onClick={() => setCat(c)}>{c}</button>
              ))}
            </div>
          </div>
        </section>

        <section className="bl-wrap bl-list" data-pager-scope>
          {featured && pg.page === 1 && (
            <Link href={hrefOf(featured)} className="bl-feat">
              <span className="bl-feat-img"><img src={thumbOf(featured)} alt={featured.title} width="640" height="400" /></span>
              <span className="bl-feat-body">
                <em className="bl-cat" style={{ background: tintOf(featured.category)[0], color: tintOf(featured.category)[1] }}>✨ Latest · {featured.category}</em>
                <h2 className="bl-t">{featured.title}</h2>
                <span className="bl-ex">{featured.excerpt}</span>
                <span className="bl-meta">{fmtDate(featured.createdAt)} · {featured.minutes} min read</span>
                <span className="bl-btn">Read article →</span>
              </span>
            </Link>
          )}

          <div className="bl-head">
            <h2>{browsing ? "More to read" : `${shown.length} article${shown.length === 1 ? "" : "s"}${cat !== "All" ? ` on ${cat}` : ""}`}</h2>
            {!browsing && <button type="button" onClick={() => { setQ(""); setCat("All"); }}>Show all</button>}
          </div>
          {rest.length ? (
            <>
              <div className="bl-grid">{pg.items.map((p) => <Card key={p.id} p={p} />)}</div>
              <Pager pg={pg} noun="articles" />
            </>
          ) : (
            <p className="bl-empty">{posts.length ? "Nothing matches that yet — try another word or topic." : "Articles are on their way. Please check back soon."}</p>
          )}
        </section>

        <section className="bl-aware">
          <div className="bl-wrap">
            <h2>Understanding mental health — a starting point</h2>
            <p className="bl-aware-sub">Therapy is not just for crises. These help you understand your emotions, relationships and wellbeing — without judgment, at your own pace.</p>
            <div className="bl-aware-grid">
              {AWARENESS.map((a) => (
                <div key={a.heading} className="bl-aware-card blogs-why-text">
                  <span>{a.icon}</span><b>{a.heading}</b><p>{a.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bl-wrap bl-faq" aria-labelledby="bl-faq-h">
          <h2 id="bl-faq-h">Questions people ask</h2>
          {BLOG_FAQS.map((f, k) => (
            <details key={f.q} open={k === 0}>
              <summary>{f.q}</summary>
              <p className="bl-faq-a">{f.a}</p>
            </details>
          ))}
        </section>

        <section className="bl-wrap">
          <div className="bl-cta">
            <div><b>Reading is a good start. Talking helps even more.</b><span>Find a verified psychologist who fits you — online or in person.</span></div>
            <Link href={isClient ? "/client/find" : "/view-all-therapist"} className="bl-btn solid">Find my therapist</Link>
          </div>
        </section>
      </main>
      <BookingPopup showHeading={false} showLocation={false} showSource={false}
        title="Want to talk to someone?" note="Share a few details and our team will help you find the right psychologist on WhatsApp." sourceTag="Popup · Blogs" />
      <Footer />
    </div>
  );
}

const BL_CSS = `
.bl { background: #fbfaf7; font-family: inherit; display: flow-root; padding-bottom: 44px; } /* flow-root: the last margin stays inside, the footer never touches the CTA */
.bl-wrap { max-width: 1180px; margin: 0 auto; padding: 0 20px; }
.bl-hero { position: relative; overflow: hidden; background: linear-gradient(135deg, #c3e3cd 0%, #f0dfb4 52%, #cfe6d3 100%); padding: 34px 0 30px; }
.bl-blob { position: absolute; border-radius: 50%; filter: blur(2px); pointer-events: none; }
.bl-blob.a { width: 340px; height: 340px; right: -90px; top: -120px; background: radial-gradient(circle, rgba(104,182,136,.7), rgba(104,182,136,0)); }
.bl-blob.b { width: 260px; height: 260px; left: -80px; bottom: -120px; background: radial-gradient(circle, rgba(232,190,110,.55), rgba(232,190,110,0)); }
.bl-blob.c { width: 180px; height: 180px; right: 22%; bottom: -70px; background: radial-gradient(circle, rgba(234,178,110,.65), rgba(234,178,110,0)); }
.bl-hero-in { position: relative; z-index: 1; }
@media (max-width: 767px) { .bl-hero { background: linear-gradient(135deg, #e3f2e8 0%, #f8f1de 52%, #e6f3ea 100%); } .bl-blob { opacity: .4; } }
.bl-crumbs { display: flex; gap: 8px; align-items: center; font-size: 13px; color: #5b6b62; margin-bottom: 18px; }
.bl-crumbs a { color: #166534 !important; font-weight: 700; text-decoration: none !important; }
.bl-crumbs b { color: #334155; }
.bl-eyebrow { margin: 0 0 6px; font-size: 13px; font-weight: 800; letter-spacing: .4px; color: #3f7a58; }
.bl-hero h1 { margin: 0; font-size: clamp(30px, 4.6vw, 52px); line-height: 1.1; font-weight: 800; letter-spacing: -.5px; color: #173c2a; font-family: inherit; }
.bl-hero h1 span { color: #a86e0e; }
/* desktop: centred, like Our Story — no empty right half */
@media (min-width: 1024px) {
  .bl-hero-in { text-align: center; }
  .bl-crumbs, .bl-chips { justify-content: center; }
  .bl-hero .bl-sub, .bl-hero .bl-search { margin-left: auto; margin-right: auto; }
}
.bl-sub { max-width: 620px; margin: 12px 0 18px; font-size: clamp(14.5px, 1.4vw, 17px); line-height: 1.65; color: #4b5b53; }
.bl-search { display: flex; align-items: center; gap: 8px; max-width: 560px; height: 52px; padding: 0 16px; background: #fff; border-radius: 16px; box-shadow: 0 12px 30px -18px rgba(23,60,42,.45); border: 1px solid #e3ece6; margin: 0; }
.bl-search svg { color: #7b8f84; font-size: 22px; flex-shrink: 0; }
.bl-search input { flex: 1; border: 0; outline: none; font-size: 15.5px; background: transparent; color: #1f2937; height: 100%; font-family: inherit; }
.bl-chips { display: flex; gap: 8px; margin-top: 16px; flex-wrap: wrap; }
.bl-chips button { border: 1px solid rgba(23,60,42,.12); background: rgba(255,255,255,.75); color: #2d5a41; border-radius: 999px; padding: 7px 14px; font-size: 13.5px; font-weight: 700; cursor: pointer; font-family: inherit; backdrop-filter: blur(4px); }
.bl-chips button.on { background: #1f6b45; color: #fff; border-color: #1f6b45; }
.bl-list { padding-top: 26px; padding-bottom: 10px; }
.bl-feat { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); background: #fff; border-radius: 20px; overflow: hidden; border: 1px solid #ece9e1; box-shadow: 0 16px 40px -28px rgba(23,60,42,.45); text-decoration: none !important; color: inherit !important; margin-bottom: 26px; }
.bl-feat-img { display: block; min-height: 300px; background: #e7f0ea; }
.bl-feat-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
.bl-feat-body { display: flex; flex-direction: column; gap: 10px; padding: 26px 28px; justify-content: center; }
.bl-feat-body .bl-t { margin: 0; font-size: clamp(20px, 2.2vw, 27px); line-height: 1.25; color: #13261c; font-weight: 800; font-family: inherit; }
.bl-cat { align-self: flex-start; font-style: normal; font-size: 11.5px; font-weight: 800; border-radius: 999px; padding: 4px 10px; letter-spacing: .2px; }
.bl-ex { font-size: 14px; line-height: 1.6; color: #5b6560; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.bl-meta { display: flex; align-items: center; gap: 4px; font-size: 12.5px; color: #8a948f; font-weight: 600; }
.bl-meta i { margin-left: auto; font-style: normal; color: #1f6b45; font-weight: 800; }
.bl-btn { align-self: flex-start; display: inline-flex; align-items: center; height: 42px; padding: 0 18px; border-radius: 12px; background: #eaf5ee; color: #1f6b45 !important; font-weight: 800; font-size: 14px; text-decoration: none !important; margin-top: 4px; }
.bl-btn.solid { background: #1f6b45; color: #fff !important; align-self: center; white-space: nowrap; }
.bl-head { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; margin-bottom: 14px; }
.bl-head h2 { margin: 0; font-size: 20px; font-weight: 800; color: #13261c; font-family: inherit; }
.bl-head button { border: 0; background: none; color: #1f6b45; font-weight: 800; cursor: pointer; font-family: inherit; }
.bl-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
.bl-card { display: flex; flex-direction: column; background: #fff; border-radius: 18px; overflow: hidden; border: 1px solid #ece9e1; text-decoration: none !important; color: inherit !important; transition: transform .18s, box-shadow .18s; min-width: 0; }
.bl-card:hover { transform: translateY(-3px); box-shadow: 0 18px 34px -24px rgba(23,60,42,.5); }
.bl-card-img { display: block; aspect-ratio: 16 / 10; background: #e7f0ea; overflow: hidden; }
.bl-card-img img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .4s; }
.bl-card:hover .bl-card-img img { transform: scale(1.04); }
.bl-card-body { display: flex; flex-direction: column; gap: 8px; padding: 14px 16px 16px; flex: 1; }
.bl-card-wrap { display: flex; min-width: 0; } .bl-card-wrap > .bl-card { flex: 1; }
.bl-card-body .bl-t { margin: 0; font-size: 16.5px; font-weight: 800; font-family: inherit; line-height: 1.35; color: #13261c; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.bl-card .bl-ex { -webkit-line-clamp: 2; font-size: 13.5px; }
.bl-card .bl-meta { margin-top: auto; padding-top: 4px; }
.bl-empty { text-align: center; color: #6b7280; padding: 30px 10px; }
.bl-aware { background: #f2f7f3; margin-top: 30px; padding: 38px 0; }
.bl-aware h2 { margin: 0; text-align: center; font-size: clamp(20px, 2.4vw, 28px); font-weight: 800; color: #13261c; font-family: inherit; }
.bl-aware-sub { text-align: center; max-width: 620px; margin: 8px auto 22px; color: #5b6560; font-size: 14.5px; line-height: 1.65; }
.bl-aware-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.bl-aware-card { background: #fff; border-radius: 16px; padding: 18px; border: 1px solid #e3ece6; }
.bl-aware-card span { font-size: 26px; }
.bl-aware-card b { display: block; margin: 6px 0; font-size: 15.5px; color: #13261c; line-height: 1.35; }
.bl-aware-card p { margin: 0; font-size: 13.5px; color: #5b6560; line-height: 1.65; }
.bl-faq { margin-top: 32px; }
.bl-faq h2 { margin: 0 0 12px; font-size: clamp(20px, 2.2vw, 26px); font-weight: 800; color: #13261c; font-family: inherit; }
.bl-faq details { background: #fff; border: 1px solid #e3ece6; border-radius: 14px; padding: 0 16px; margin-bottom: 10px; }
.bl-faq summary { cursor: pointer; padding: 14px 0; font-size: 15px; font-weight: 800; color: #173c2a; list-style: none; }
.bl-faq summary::-webkit-details-marker { display: none; }
.bl-faq summary::after { content: "+"; float: right; color: #2f8a5b; font-weight: 800; }
.bl-faq details[open] summary::after { content: "–"; }
.bl-faq-a { margin: 0 0 14px; font-size: 14px; line-height: 1.7; color: #4b5b53; }
.bl-cta { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin: 30px 0 0; padding: 22px 24px; border-radius: 20px;
  background: linear-gradient(120deg, #e3f1e8, #f5efe3); border: 1px solid #dde9e0; }
.bl-cta b { display: block; font-size: 18px; color: #173c2a; } .bl-cta span { display: block; font-size: 14px; color: #4b5b53; margin-top: 2px; }
@media (max-width: 991px) {
  .bl-grid, .bl-aware-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .bl-feat { grid-template-columns: 1fr; } .bl-feat-img { min-height: 0; aspect-ratio: 16 / 9; }
}
@media (max-width: 640px) {
  .bl-wrap { padding: 0 16px; }
  .bl-hero { padding: 22px 0 20px; }
  .bl-crumbs { margin-bottom: 12px; }
  .bl-sub { margin: 8px 0 14px; }
  .bl-search { height: 48px; border-radius: 14px; }
  .bl-search input { font-size: 16px; }
  .bl-chips { flex-wrap: nowrap; overflow-x: auto; margin: 14px -16px 0; padding: 0 16px 4px; scrollbar-width: none; }
  .bl-chips::-webkit-scrollbar { display: none; }
  .bl-chips button { flex-shrink: 0; }
  .bl-grid, .bl-aware-grid { grid-template-columns: 1fr; gap: 14px; }
  .bl-feat-body { padding: 16px 18px 18px; }
  .bl-cta { flex-direction: column; align-items: stretch; text-align: center; }
  .bl-btn.solid { align-self: stretch; justify-content: center; }
}
`;
