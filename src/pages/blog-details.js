import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Head from "next/head";
import dompurify from "dompurify";
import RelatedTherapists from "../components/global/related-therapists";
import { pickRelated, getListedTherapists } from "../utils/related-therapists";
import MyNavbar from "../components/navbar";
import Footer from "../components/footer";
import BookingPopup from "../components/global/booking-popup";
import { getBlogUrl, frontendUrl, getTherapistProfiles } from "../utils/url";
import { fetchData } from "../utils/actions";
import { fitTitle, fitDesc } from "../utils/seo-text";
import { blogPath, blogIdFromSlug, blogThumb } from "../utils/blog-slug";

/* /blog-details — one article, built for reading: a light header (same family as /blogs), the
   cover image overlapping it, a 720px text column in large type, and on wide screens a sticky
   side card (talk to a psychologist + read next). Phones / iPad get the same card inside the flow. */

// ─── Internal linking engine ─────────────────────────────────────────────────
// Maps blog category/tags → relevant therapist filter URLs, service labels, state pages
const TOPIC_MAP = [
  {
    keywords: ["anxiety", "panic", "overthinking", "nervousness", "worry", "stress"],
    service: "Anxiety",
    label: "Anxiety & Stress",
    icon: "🧠",
    color: "#7c3aed",
    bg: "#f5f3ff",
    border: "#ddd6fe",
    desc: "Verified psychologists specialising in anxiety, panic attacks, and stress management.",
  },
  {
    keywords: ["depression", "sad", "hopeless", "low mood", "dysthymia", "burnout"],
    service: "Depression",
    label: "Depression",
    icon: "🌧️",
    color: "#2563eb",
    bg: "#eff6ff",
    border: "#bfdbfe",
    desc: "Talk to a counsellor trained in depression, low mood, and emotional exhaustion.",
  },
  {
    keywords: ["ocd", "obsessive", "compulsive", "intrusive thought", "checking"],
    service: "OCD",
    label: "OCD",
    icon: "🔄",
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
    desc: "Psychologists experienced in CBT-based treatment for OCD and intrusive thoughts.",
  },
  {
    keywords: ["relationship", "couple", "marriage", "divorce", "breakup", "partner", "family", "conflict", "attachment"],
    service: "Relationship Counselling",
    label: "Relationships & Couples",
    icon: "❤️",
    color: "#dc2626",
    bg: "#fff1f2",
    border: "#fecdd3",
    desc: "Couples counsellors and relationship therapists for individuals and partners.",
  },
  {
    keywords: ["trauma", "ptsd", "abuse", "grief", "loss", "bereavement", "accident"],
    service: "Trauma & PTSD",
    label: "Trauma & PTSD",
    icon: "🛡️",
    color: "#0891b2",
    bg: "#ecfeff",
    border: "#a5f3fc",
    desc: "Trauma-informed therapists trained in EMDR, somatic therapy, and grief counselling.",
  },
  {
    keywords: ["child", "teen", "adolescent", "school", "adhd", "learning", "parenting", "kid"],
    service: "Child & Adolescent Therapy",
    label: "Child & Teen Therapy",
    icon: "👶",
    color: "#16a34a",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    desc: "Child psychologists and special educators for kids, teens, and parents.",
  },
  {
    keywords: ["self esteem", "confidence", "identity", "self worth", "body image", "eating"],
    service: "Self-Esteem & Identity",
    label: "Self-Esteem & Identity",
    icon: "✨",
    color: "#db2777",
    bg: "#fdf2f8",
    border: "#fbcfe8",
    desc: "Psychologists helping with self-esteem, confidence, and personal identity issues.",
  },
  {
    keywords: ["sleep", "insomnia", "fatigue", "mindfulness", "meditation", "wellbeing"],
    service: "Counselling Psychology",
    label: "General Counselling",
    icon: "🌱",
    color: "#228756",
    bg: "#f0fdf4",
    border: "#86efac",
    desc: "Counselling psychologists for everyday mental health, stress, and personal growth.",
  },
];

function getTopicMatch(blog) {
  const text = `${blog.title || ""} ${blog.category || ""} ${blog.tags || ""} ${
    (blog.content || "").replace(/<[^>]*>/g, " ").substring(0, 500)
  }`.toLowerCase();

  const matches = TOPIC_MAP.filter(({ keywords }) =>
    keywords.some((kw) => text.includes(kw))
  );

  // Return top 2 matches max
  return matches.slice(0, 2);
}

// ─── Content cleaner ─────────────────────────────────────────────────────────
// Strips legacy Word/font tags, fixes empty headings, normalises inline styles
function cleanBlogContent(html) {
  if (!html) return "";

  let c = html;

  // 1. Remove Word-paste mso- inline styles entirely from style attributes
  c = c.replace(/\s*style="[^"]*mso-[^"]*"/gi, "");
  // Remove remaining empty style attributes
  c = c.replace(/\s*style="\s*"/gi, "");

  // 2. Unwrap <font face="..." size="..."> tags — keep inner content
  c = c.replace(/<font[^>]*>([\s\S]*?)<\/font>/gi, "$1");

  // 3. Remove data-start / data-end / data-section-id attributes (AI noise)
  c = c.replace(/\s*data-start="[^"]*"/gi, "");
  c = c.replace(/\s*data-end="[^"]*"/gi, "");
  c = c.replace(/\s*data-section-id="[^"]*"/gi, "");

  // 4. Remove empty headings like <h2><br></h2> or <h2></h2>
  c = c.replace(/<h[1-6][^>]*>\s*(<br\s*\/?>)?\s*<\/h[1-6]>/gi, "");

  // 5. Remove empty paragraphs and empty divs
  c = c.replace(/<p[^>]*>\s*(<br\s*\/?>)?\s*<\/p>/gi, "");
  c = c.replace(/<div[^>]*>\s*(<br\s*\/?>)?\s*<\/div>/gi, "");

  // 6. Remove lang attributes (Word noise)
  c = c.replace(/\s*lang="[^"]*"/gi, "");

  // 7. Remove class attributes with mso or MsoNormal
  c = c.replace(/\s*class="[^"]*Mso[^"]*"/gi, "");
  c = c.replace(/\s*class="[^"]*mso[^"]*"/gi, "");

  // 8. Remove &nbsp; chains (more than 2 consecutive)
  c = c.replace(/(&nbsp;){3,}/gi, " ");

  // 9. Collapse multiple <br> into one
  c = c.replace(/(<br\s*\/?>){3,}/gi, "<br>");

  // 10. Add .blog-intro class to the first <p> for speakable schema targeting
  c = c.replace(/^(\s*<p)/, '$1 class="blog-intro"');

  return c.trim();
}

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }) : "");
const readMinutes = (html) => Math.max(1, Math.ceil(String(html || "").replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length / 200));
const coverOf = (b) => {
  const img = String(b?.image || "");
  if (/^https?:\/\//.test(img)) return img;
  return blogThumb({ ...b, hasImage: b?.hasImage || !!img });
};
const OPEN_CHAT_EVENT = "cyt:open-chat";

// common search terms, most specific first — the first one found in the title is shown in gold
const SEO_TERMS = ["mental health", "anxiety", "depression", "panic attack", "overthinking", "stress", "burnout", "ocd", "trauma", "ptsd",
  "grief", "self esteem", "self-esteem", "self care", "self-care", "relationship", "marriage", "intimacy", "libido", "loneliness", "sleep",
  "insomnia", "anger", "adhd", "parenting", "therapy", "therapist", "psychologist", "counselling", "mindfulness", "healing"];
function titleWithKeyword(title, blog) {
  const t = String(title || "");
  const lower = t.toLowerCase();
  const tags = String(blog?.tags || "").split(",").map((x) => x.trim().toLowerCase()).filter((x) => x.length > 3);
  const terms = [...SEO_TERMS, ...tags.filter((x) => lower.includes(x)).sort((a, b) => b.length - a.length)];
  const hit = terms.find((k) => lower.includes(k));
  if (!hit) return t;
  const i = lower.indexOf(hit);
  return <>{t.slice(0, i)}<span className="bd-gold">{t.slice(i, i + hit.length)}</span>{t.slice(i + hit.length)}</>;
}

const STATES = [
  { label: "Delhi", slug: "delhi" }, { label: "Uttar Pradesh", slug: "uttar-pradesh" }, { label: "Maharashtra", slug: "maharashtra" },
  { label: "Rajasthan", slug: "rajasthan" }, { label: "Gujarat", slug: "gujarat" }, { label: "Chandigarh", slug: "chandigarh" }, { label: "Uttarakhand", slug: "uttarakhand" },
];

function ShareRow({ url, title }) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const links = [
    { k: "WhatsApp", href: `https://wa.me/?text=${t}%20${u}`, icon: "feather-message-circle" },
    { k: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, icon: "feather-linkedin" },
    { k: "X", href: `https://twitter.com/intent/tweet?text=${t}&url=${u}`, icon: "feather-twitter" },
    { k: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, icon: "feather-facebook" },
  ];
  const copy = () => {
    try { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* ignore */ }
  };
  return (
    <div className="bd-share" aria-label="Share this article">
      {links.map((l) => (
        <a key={l.k} href={l.href} target="_blank" rel="noreferrer" aria-label={`Share on ${l.k}`} title={l.k}><i className={l.icon} aria-hidden="true" /></a>
      ))}
      <button type="button" onClick={copy} aria-label="Copy link" title="Copy link"><i className={copied ? "feather-check" : "feather-link"} aria-hidden="true" /></button>
    </div>
  );
}

export default function BlogDetails({ initialBlog, blogTherapists = [] }) {
  const router = useRouter();
  // /blog/<slug> carries the id at the end of the slug; old /blog-details?id= links redirect there
  const id = router.query.id || blogIdFromSlug(router.query.slug);
  const [blog, setBlog] = useState(initialBlog);
  const [html, setHtml] = useState(initialBlog ? cleanBlogContent(initialBlog.content) : "");
  const [more, setMore] = useState([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => { if (initialBlog) setBlog(initialBlog); }, [initialBlog]);
  useEffect(() => { if (blog?.content) setHtml(dompurify.sanitize(cleanBlogContent(blog.content))); }, [blog]);

  // the post itself, if the server couldn't send it
  useEffect(() => {
    if (!id || (blog && String(blog._id) === String(id))) return;
    fetchData(`${getBlogUrl}/${id}`).then((res) => { if (res && (res.status === 200 || res.status === true || res.data)) setBlog(res.data || res); }).catch(() => {});
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // a few more posts to read next (light list — never the 2 MB feed)
  useEffect(() => {
    fetch("/api/blog-latest?n=10").then((r) => r.json())
      .then((d) => { if (d?.data) setMore(d.data.filter((p) => String(p.id) !== String(id)).slice(0, 9)); })
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    const on = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setProgress(max > 0 ? Math.min(100, (el.scrollTop / max) * 100) : 0);
    };
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  if (!blog) {
    return (
      <>
        <MyNavbar />
        <div className="container" style={{ padding: "80px 16px", textAlign: "center" }}>
          <h1 style={{ fontSize: 26 }}>Article not found</h1>
          <p><Link href="/blogs">Browse all articles →</Link></p>
        </div>
        <Footer />
      </>
    );
  }

  const tagsList = blog.tags ? blog.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
  const topicMatches = getTopicMatch(blog);
  const rawMetaDesc = (blog.metaDesc || "").replace(/<[^>]*>/g, "").trim();
  const plainContentDesc = blog.content ? blog.content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().substring(0, 200) : "";
  const rawCleanDesc = rawMetaDesc.length > 40 ? rawMetaDesc : plainContentDesc;
  const cleanDesc = rawCleanDesc.length > 160 ? rawCleanDesc.substring(0, 157) + "..." : rawCleanDesc;
  const imageUrl = `${frontendUrl}/api/blog-og-image?id=${blog._id}${Date.parse(blog.updatedAt || "") ? `&v=${Date.parse(blog.updatedAt)}` : ""}`;
  // always the www address — frontendUrl is the bare domain on the server, which 301s to www
  const pageUrl = `https://www.chooseyourtherapist.in${blogPath(blog)}`;
  const plainText = blog.content ? blog.content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "";
  const wordCount = plainText.split(" ").filter(Boolean).length;
  const isMedical = ["mental health", "psychology", "therapy", "counselling", "relationship concern", "anxiety", "depression"].some((kw) => (blog.category || "").toLowerCase().includes(kw));
  const author = blog.author && !/^admin$/i.test(blog.author) ? blog.author : "CYT Editorial Team";
  const minutes = readMinutes(blog.content);
  const findHref = topicMatches[0] ? `/view-all-therapist?services=${encodeURIComponent(topicMatches[0].service)}` : "/view-all-therapist";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": isMedical ? ["Article", "MedicalWebPage"] : "Article",
    "headline": blog.title?.trim(),
    "name": blog.title?.trim(),
    "description": cleanDesc,
    "image": { "@type": "ImageObject", "url": imageUrl, "width": 1200, "height": 630 },
    "url": pageUrl,
    "wordCount": wordCount,
    "inLanguage": "en-IN",
    "articleSection": blog.category || "Mental Health",
    "keywords": tagsList.length > 0 ? tagsList.join(", ") : (blog.category || "mental health, psychology"),
    "author": { "@type": "Person", "name": blog.author || "Choose Your Therapist Editorial", "worksFor": { "@type": "Organization", "@id": "https://www.chooseyourtherapist.in#organization", "name": "Choose Your Therapist" } },
    "publisher": { "@type": "Organization", "@id": "https://www.chooseyourtherapist.in#organization", "name": "Choose Your Therapist", "logo": { "@type": "ImageObject", "url": "https://www.chooseyourtherapist.in/logo.png", "width": 250, "height": 60 } },
    "datePublished": blog.createdAt,
    "dateModified": blog.updatedAt || blog.createdAt,
    "mainEntityOfPage": { "@type": "WebPage", "@id": pageUrl },
    ...(isMedical && {
      "about": { "@type": "MedicalCondition", "name": blog.category || "Mental Health" },
      "medicalAudience": { "@type": "MedicalAudience", "audienceType": "Patient" },
    }),
    "speakable": { "@type": "SpeakableSpecification", "cssSelector": ["h1", "h2", ".blog-intro"] },
  };
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": frontendUrl },
      { "@type": "ListItem", "position": 2, "name": "Blogs", "item": `${frontendUrl}/blogs` },
      { "@type": "ListItem", "position": 3, "name": blog.title, "item": pageUrl },
    ],
  };

  const ctaCard = (
    <div className="bd-cta">
      <span className="bd-cta-k">Talk to someone</span>
      <b>Reading is a good first step.</b>
      <p>Verified psychologists — online or in person, in Hindi, English and more. Confidential and judgment-free.</p>
      <Link href={findHref} className="bd-cta-go" rel="nofollow">{topicMatches[0] ? `Find a ${topicMatches[0].label} psychologist` : "Find a psychologist"} <i className="feather-arrow-right" aria-hidden="true" /></Link>
      <button type="button" className="bd-cta-alt" onClick={() => window.dispatchEvent(new Event(OPEN_CHAT_EVENT))}>Not sure? Get matched on WhatsApp</button>
    </div>
  );

  return (
    <div className="bd-page">
      <Head>
        <title>{fitTitle(blog.title)}</title>
        <meta name="description" content={fitDesc(cleanDesc)} />
        <meta name="keywords" content={blog.tags || blog.category} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={pageUrl} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }} />
        <meta key="og:type" property="og:type" content="article" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:title" content={`${blog.title} | Choose Your Therapist`} />
        <meta property="og:description" content={cleanDesc} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:image:secure_url" content={imageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={blog.title} />
        <meta key="og:site_name" property="og:site_name" content="Choose Your Therapist" />
        <meta property="article:published_time" content={blog.createdAt} />
        <meta property="article:author" content={blog.author || "Admin"} />
        <meta property="article:section" content={blog.category} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={pageUrl} />
        <meta name="twitter:title" content={`${blog.title} | Choose Your Therapist`} />
        <meta name="twitter:description" content={cleanDesc} />
        <meta name="twitter:image" content={imageUrl} />
        <meta name="twitter:image:alt" content={blog.title} />
      </Head>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="bd-progress" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>
      <MyNavbar />

      {/* ── header: light banner, same family as /blogs ── */}
      <header className="bd-head">
        <span className="bd-blob a" aria-hidden="true" /><span className="bd-blob b" aria-hidden="true" />
        <div className="bd-head-in">
          <nav className="bd-crumbs" aria-label="Breadcrumb">
            <Link href="/">CYT Home</Link><span>/</span><Link href="/blogs">Blog</Link>
            {blog.category && <><span>/</span><b>{blog.category}</b></>}
          </nav>
          <h1 className="bd-title">{titleWithKeyword(blog.title, blog)}</h1>
          {rawMetaDesc.length > 40 && <p className="bd-dek">{rawMetaDesc}</p>}
          <div className="bd-meta">
            <span className="bd-av" aria-hidden="true">{author.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase()}</span>
            <span className="bd-by"><b>{author}</b><span>Reviewed by CYT psychologists</span></span>
            <span className="bd-dot" aria-hidden="true" />
            <span><time dateTime={blog.createdAt}>{fmtDate(blog.createdAt)}</time> · {minutes} min read</span>
          </div>
        </div>
      </header>

      <div className="bd-cover">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={coverOf(blog)} alt={blog.title} width="1200" height="675" fetchPriority="high" />
      </div>

      <div className="bd-wrap">
        <article className="bd-main">
          <div className="bd-share-top"><span>Share</span><ShareRow url={pageUrl} title={blog.title} /></div>
          <div className="bd-body" dangerouslySetInnerHTML={{ __html: html }} />

          {tagsList.length > 0 && (
            <div className="bd-tags" aria-label="Topics in this article">
              <span>Topics</span>
              {tagsList.map((t) => <em key={t}>{t}</em>)}
            </div>
          )}

          <div className="bd-share-end"><b>Found this helpful? Share it</b><ShareRow url={pageUrl} title={blog.title} /></div>

          <div className="bd-cta-inline">{ctaCard}</div>

          {topicMatches.length > 0 && (
            <div className="bd-topics">
              {topicMatches.map((t) => (
                <Link key={t.service} href={`/view-all-therapist?services=${encodeURIComponent(t.service)}`} className="bd-topic" rel="nofollow">
                  <b>{t.label} specialists →</b>
                  <span>{t.desc}</span>
                </Link>
              ))}
            </div>
          )}

          <div className="bd-near">
            <span>Psychologists near you</span>
            {STATES.map((s) => <Link key={s.slug} href={`/psychologist-in/${s.slug}`}>{s.label}</Link>)}
          </div>

          <p className="bd-disc"><b>Disclaimer:</b> This article is for information and education only. It is not a substitute for professional psychological advice, diagnosis or treatment. If you are in crisis, please contact a mental health professional or a helpline immediately.</p>
        </article>

        <aside className="bd-side">
          {ctaCard}
          {blogTherapists.length > 0 && (
            <div className="bd-side-th">
              <b>Talk to a psychologist about this</b>
              {blogTherapists.map((t) => (
                <Link key={t.id} href={t.href} className="bd-th">
                  <span className="bd-th-av">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {t.photo ? <img src={t.photo} alt={t.name} loading="lazy" /> : <i>{t.name.charAt(0)}</i>}
                  </span>
                  <span className="bd-th-i">
                    <strong>{t.name}</strong>
                    <span>{t.type}{t.city ? ` · ${t.city}` : ""}</span>
                    <span className="bd-th-m">
                      {t.rating && <em>★ {Number(t.rating.avg).toFixed(1)}</em>}
                      {t.fee && <>from ₹{t.fee.toLocaleString("en-IN")}</>}
                    </span>
                  </span>
                </Link>
              ))}
              <Link href="/view-all-therapist" className="bd-th-all">See all psychologists →</Link>
            </div>
          )}
          {more.length > 0 && (
            <div className="bd-side-more">
              <b>Read next</b>
              {more.map((p) => (
                <Link key={p.id} href={blogPath(p)} className="bd-side-item">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={blogThumb(p)} alt={p.title} loading="lazy" />
                  <span><em>{p.category}</em>{p.title}</span>
                </Link>
              ))}
            </div>
          )}
        </aside>
      </div>

      {more.length > 0 && (
        <section className="bd-next" aria-labelledby="bd-next-t">
          <div className="bd-next-in">
            <div className="bd-next-head">
              <h2 id="bd-next-t">Keep reading</h2>
              <Link href="/blogs">All articles <i className="feather-arrow-right" aria-hidden="true" /></Link>
            </div>
            <div className="bd-next-grid">
              {more.slice(0, 3).map((p) => (
                <Link key={p.id} href={blogPath(p)} className="bd-card">
                  <span className="bd-card-img">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={blogThumb(p)} alt={p.title} loading="lazy" />
                  </span>
                  <span className="bd-card-b">
                    <em>{p.category}</em>
                    <b>{p.title}</b>
                    <span>{fmtDate(p.createdAt)} · {p.minutes} min read</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {blogTherapists.length > 0 && (
        <div className="bd-rt-below" style={{ background: "#fff", borderTop: "1px solid #e6ece8" }}>
          <RelatedTherapists
            id="blog-therapists"
            title="Talk to a psychologist about this"
            subtitle="Verified psychologists on Choose Your Therapist who work with this — online or in person."
            items={blogTherapists}
            moreHref="/view-all-therapist"
            moreLabel="Find your psychologist"
          />
        </div>
      )}
      <Footer />
      <BookingPopup showHeading={false} showLocation={false} showSource={false} />
    </div>
  );
}

const CSS = `
.bd-page { background: #fff; overflow-x: hidden; }
.bd-progress { position: fixed; top: 0; left: 0; right: 0; height: 3px; z-index: 10000; background: transparent; }
.bd-progress span { display: block; height: 100%; background: linear-gradient(90deg, #1e7a4c, #d4a24c); transition: width .1s linear; }

.bd-head { position: relative; overflow: hidden; background: linear-gradient(135deg, #c3e3cd 0%, #f0dfb4 52%, #cfe6d3 100%); padding: 26px 16px 84px; }
.bd-blob { position: absolute; border-radius: 50%; pointer-events: none; }
.bd-blob.a { width: 420px; height: 420px; right: -100px; top: -150px; background: radial-gradient(circle, rgba(104,182,136,.7), rgba(104,182,136,0)); }
.bd-blob.b { width: 300px; height: 300px; left: -90px; bottom: -140px; background: radial-gradient(circle, rgba(232,190,110,.55), rgba(232,190,110,0)); }
/* title, image and text share one left edge: the same width as the article + side column */
.bd-head-in { position: relative; z-index: 1; max-width: 1076px; margin: 0 auto; text-align: left; }
.bd-crumbs { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; font-size: 13px; color: #5b6b62; margin-bottom: 12px; }
.bd-crumbs a { color: #166534 !important; font-weight: 700; text-decoration: none !important; }
.bd-crumbs b { color: #8a5a0b; }
.bd-page .bd-title { margin: 0; max-width: 900px; font-size: clamp(26px, 3.6vw, 42px); line-height: 1.15; font-weight: 800; letter-spacing: -.02em; color: #173c2a; }
.bd-gold { color: #a86e0e; }
.bd-page .bd-dek { margin: 10px 0 0; max-width: 760px; font-size: clamp(15.5px, 1.6vw, 18px); line-height: 1.6; color: #3f4f47; padding: 0; }
.bd-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px; margin-top: 14px; font-size: 13.5px; color: #4b5d53; }
.bd-av { width: 36px; height: 36px; border-radius: 50%; background: #14532d; color: #ecc77d; display: inline-flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: 800; }
.bd-by { display: flex; flex-direction: column; text-align: left; line-height: 1.25; }
.bd-by b { color: #13261c; font-size: 14px; }
.bd-by span { font-size: 12px; color: #6b7c72; }
.bd-dot { width: 4px; height: 4px; border-radius: 50%; background: #9fb3a6; }

.bd-cover { max-width: 1108px; margin: -64px auto 0; padding: 0 16px; position: relative; z-index: 1; }
.bd-cover img { display: block; width: 100%; aspect-ratio: 3 / 1; object-fit: cover; border-radius: 22px; background: #e7f0ea; box-shadow: 0 30px 60px -36px rgba(20,60,40,.55); }

.bd-wrap { max-width: 1108px; margin: 0 auto; padding: 36px 16px 56px; display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 56px; box-sizing: border-box; }
.bd-main { min-width: 0; max-width: 720px; }
.bd-share-top { display: flex; align-items: center; gap: 12px; padding-bottom: 18px; margin-bottom: 26px; border-bottom: 1px solid #edf1ee; }
.bd-share-top > span { font-size: 12px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: #8a948f; }
.bd-share { display: flex; gap: 8px; }
.bd-share a, .bd-share button { width: 36px; height: 36px; border-radius: 50%; border: 1px solid #dfe8e2; background: #fff; color: #1e7a4c !important; display: inline-flex; align-items: center; justify-content: center; font-size: 15px; cursor: pointer; text-decoration: none !important; transition: background .15s, color .15s; }
.bd-share a:hover, .bd-share button:hover { background: #1e7a4c; color: #fff !important; border-color: #1e7a4c; }

/* the article text: big, calm, easy to read */
.bd-body { font-size: 18.5px; line-height: 1.85; color: #27322c; overflow-wrap: break-word; }
.bd-body * { font-family: inherit !important; max-width: 100%; }
.bd-body p, .bd-body li, .bd-body span, .bd-body div { font-size: inherit !important; line-height: inherit !important; color: inherit; }
.bd-body p { margin: 0 0 1.25em; padding: 0; }
.bd-body > p:first-of-type { font-size: 1.08em !important; color: #13261c; }
.bd-body h2 { font-size: clamp(23px, 2.6vw, 29px) !important; line-height: 1.3 !important; font-weight: 800; color: #173c2a !important; margin: 1.8em 0 .6em; }
.bd-body h3 { font-size: clamp(19px, 2vw, 22px) !important; line-height: 1.35 !important; font-weight: 800; color: #1f3d2c !important; margin: 1.5em 0 .5em; }
.bd-body h4 { font-size: 18px !important; font-weight: 800; color: #1f3d2c !important; margin: 1.3em 0 .4em; }
.bd-body ul, .bd-body ol { margin: 0 0 1.3em; padding-left: 1.3em; }
.bd-body li { margin: 0 0 .5em; padding-left: .2em; }
.bd-body li::marker { color: #a86e0e; font-weight: 800; }
.bd-body strong, .bd-body b { color: #13261c; font-weight: 700; }
.bd-body a { color: #1e7a4c !important; text-decoration: underline; text-decoration-color: #ecc77d; text-decoration-thickness: 2px; text-underline-offset: 3px; }
.bd-body blockquote { margin: 1.6em 0; padding: 4px 0 4px 20px; border-left: 4px solid #d4a24c; font-size: 1.1em; color: #173c2a; font-style: italic; }
.bd-body img { height: auto; border-radius: 16px; margin: 1.2em 0; }
.bd-body table { width: 100%; border-collapse: collapse; margin: 1.4em 0; font-size: 16px; display: block; overflow-x: auto; }
.bd-body th, .bd-body td { border: 1px solid #e6ece8; padding: 10px 12px; text-align: left; }
.bd-body th { background: #f4f8f5; }
.bd-body hr { border: none; border-top: 1px solid #edf1ee; margin: 2em 0; }

.bd-tags { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin: 34px 0 0; }
.bd-tags > span { font-size: 12px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: #8a948f; margin-right: 4px; }
.bd-tags em { font-style: normal; font-size: 13px; font-weight: 700; color: #26463a; background: #f4f8f5; border: 1px solid #e3ebe6; padding: 5px 12px; border-radius: 999px; }
.bd-share-end { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; margin-top: 26px; padding: 16px 18px; border-radius: 16px; background: #fbfaf6; border: 1px solid #efe9d8; }
.bd-share-end b { font-size: 15px; color: #13261c; }

.bd-cta { display: flex; flex-direction: column; gap: 8px; padding: 22px; border-radius: 20px; background: linear-gradient(135deg, #14532d, #1e7a4c); color: #fff; box-shadow: 0 24px 48px -30px rgba(20,83,45,.8); }
.bd-cta-k { font-size: 11.5px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; color: #ecc77d; }
.bd-cta b { font-size: 20px; line-height: 1.3; }
.bd-cta p { margin: 0 0 6px; padding: 0; font-size: 14px; line-height: 1.6; color: #d4ecdd; }
.bd-cta-go { display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 46px; padding: 0 18px; border-radius: 12px; background: #ecc77d; color: #14532d !important; font-weight: 800; font-size: 14.5px; text-decoration: none !important; }
.bd-cta-go:hover { background: #f2d593; }
.bd-cta-alt { background: none; border: none; padding: 6px 0 0; color: #fff; font-size: 13.5px; font-weight: 700; text-decoration: underline; text-decoration-color: rgba(236,199,125,.7); text-underline-offset: 3px; cursor: pointer; text-align: center; }
.bd-cta-inline { display: none; margin-top: 30px; }

.bd-topics { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 18px; }
.bd-topic { display: flex; flex-direction: column; gap: 4px; padding: 16px; border-radius: 16px; border: 1px solid #e3ebe6; background: #fff; text-decoration: none !important; transition: border-color .15s, transform .15s; }
.bd-topic:hover { border-color: #1e7a4c; transform: translateY(-2px); }
.bd-topic b { color: #14532d; font-size: 15px; }
.bd-topic span { color: #5b6560; font-size: 13.5px; line-height: 1.55; }
.bd-near { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 18px; }
.bd-near > span { font-size: 12px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: #8a948f; margin-right: 4px; }
.bd-near a { font-size: 13px; font-weight: 700; color: #26463a !important; border: 1px solid #e3ebe6; background: #fff; padding: 5px 12px; border-radius: 999px; text-decoration: none !important; }
.bd-near a:hover { border-color: #1e7a4c; color: #1e7a4c !important; }
.bd-page .bd-disc { margin: 26px 0 0; padding: 14px 16px; border-radius: 12px; background: #f7f9f8; font-size: 13px; line-height: 1.6; color: #6b7c72; }
.bd-disc b { color: #4b5d53; }

.bd-side { align-self: start; display: flex; flex-direction: column; gap: 18px; }
/* desktop: the read-next list is in the side column, so the bottom row isn't needed */
@media (min-width: 1100px) { .bd-next { display: none; } }
.bd-side-more { display: flex; flex-direction: column; gap: 12px; padding: 18px; border-radius: 18px; border: 1px solid #edf1ee; background: #fff; }
.bd-side-more > b { font-size: 12px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: #8a948f; }
.bd-side-item { display: flex; flex-direction: column; gap: 8px; padding-bottom: 14px; border-bottom: 1px solid #f0f3f1; text-decoration: none !important; }
.bd-side-item:last-child { border-bottom: none; padding-bottom: 0; }
.bd-side-item img { width: 100%; aspect-ratio: 16 / 9; object-fit: cover; border-radius: 12px; background: #e7f0ea; transition: opacity .15s; }
.bd-side-item:hover img { opacity: .9; }
.bd-side-item span { display: flex; flex-direction: column; gap: 3px; font-size: 15px; font-weight: 700; line-height: 1.35; color: #13261c; }
.bd-side-item em { font-style: normal; font-size: 10.5px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: #a86e0e; }
.bd-side-item:hover span { color: #1e7a4c; }

.bd-side-th { display: flex; flex-direction: column; gap: 10px; padding: 18px; border-radius: 18px; border: 1px solid #edf1ee; background: #fff; }
.bd-side-th > b { font-size: 12px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: #8a948f; }
.bd-th { display: flex; gap: 12px; align-items: center; padding: 8px; margin: 0 -8px; border-radius: 12px; text-decoration: none !important; transition: background .15s; }
.bd-th:hover { background: #f4f8f5; }
.bd-th-av { flex-shrink: 0; width: 52px; height: 52px; border-radius: 12px; overflow: hidden; background: #e7f0ea; display: inline-flex; align-items: center; justify-content: center; }
.bd-th-av img { width: 100%; height: 100%; object-fit: cover; object-position: top; }
.bd-th-av i { font-style: normal; font-weight: 800; color: #1e7a4c; font-size: 18px; }
.bd-th-i { min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.bd-th-i strong { font-size: 14.5px; color: #13261c; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bd-th-i > span { font-size: 12px; color: #6b7c72; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bd-th-m { display: flex; gap: 8px; font-weight: 600; }
.bd-th-m em { font-style: normal; color: #a86e0e; font-weight: 800; }
.bd-th-all { font-size: 13.5px; font-weight: 800; color: #14532d !important; text-decoration: none !important; padding-top: 4px; border-top: 1px solid #f0f3f1; }
.bd-rt-below { display: none; }

.bd-next { background: #fbfaf6; border-top: 1px solid #efe9d8; padding: 48px 16px 56px; }
.bd-next-in { max-width: 1120px; margin: 0 auto; }
.bd-next-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 20px; }
.bd-next-head h2 { margin: 0; font-size: clamp(22px, 2.6vw, 28px); font-weight: 800; color: #0b1712; }
.bd-next-head a { color: #14532d !important; font-weight: 800; font-size: 14px; text-decoration: none !important; display: inline-flex; align-items: center; gap: 6px; }
.bd-next-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
.bd-card { display: flex; flex-direction: column; background: #fff; border: 1px solid #ece9e1; border-radius: 18px; overflow: hidden; text-decoration: none !important; color: inherit !important; transition: transform .2s, box-shadow .2s; }
.bd-card:hover { transform: translateY(-3px); box-shadow: 0 20px 40px -28px rgba(23,60,42,.55); }
.bd-card-img { display: block; aspect-ratio: 16 / 10; background: #e7f0ea; overflow: hidden; }
.bd-card-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
.bd-card-b { display: flex; flex-direction: column; gap: 6px; padding: 14px 16px 16px; }
.bd-card-b em { font-style: normal; font-size: 11px; font-weight: 800; letter-spacing: .05em; text-transform: uppercase; color: #a86e0e; }
.bd-card-b b { font-size: 16px; line-height: 1.35; color: #13261c; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.bd-card-b span { font-size: 12.5px; color: #8a948f; font-weight: 600; }

/* iPad + phones: one column — the side card moves into the article flow */
@media (max-width: 1099px) {
  .bd-head-in { max-width: 720px; }
  .bd-cover { max-width: 752px; }
  .bd-cover img { aspect-ratio: 16 / 9; }
  .bd-wrap { grid-template-columns: minmax(0, 1fr); max-width: 752px; gap: 0; }
  .bd-main { max-width: none; }
  .bd-side { display: none; }
  .bd-cta-inline { display: block; }
  .bd-rt-below { display: block; }
}
@media (max-width: 767px) {
  .bd-head { padding: 18px 16px 56px; background: linear-gradient(135deg, #e3f2e8 0%, #f8f1de 52%, #e6f3ea 100%); }
  .bd-crumbs { font-size: 12px; margin-bottom: 10px; }
  .bd-meta { gap: 6px 10px; font-size: 12.5px; }
  .bd-dot { display: none; }
  .bd-cover { margin-top: -44px; }
  .bd-cover img { aspect-ratio: 16 / 10; }
  .bd-cover img { border-radius: 16px; }
  .bd-wrap { padding: 24px 18px 40px; }
  .bd-share-top { margin-bottom: 20px; padding-bottom: 14px; }
  .bd-body { font-size: 17px; line-height: 1.8; }
  .bd-topics { grid-template-columns: 1fr; }
  .bd-next { padding: 36px 16px 40px; }
  .bd-next-grid { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; gap: 12px; margin: 0 -16px; padding: 4px 16px 10px; scrollbar-width: none; }
  .bd-next-grid::-webkit-scrollbar { display: none; }
  .bd-card { flex: 0 0 78%; scroll-snap-align: start; }
}
@media (min-width: 768px) and (max-width: 1099px) {
  .bd-wrap { padding-top: 32px; }
}
`;

export async function getServerSideProps(context) {
  const { id } = context.query;
  try {
    const res = await fetchData(`${getBlogUrl}/${id}`);
    if (res && (res.status === 200 || res.status === true || res.data)) {
      const full = res.data || res;
      // the old address (/blog-details?id=…) -> 301 to the post's /blog/<slug> URL
      if (String(context.resolvedUrl || "").startsWith("/blog-details") && full?._id) {
        return { redirect: { destination: blogPath(full), permanent: true } };
      }
      const { image, ...rest } = full || {};
      const blog = { ...rest, hasImage: !!image, ...(/^https?:\/\//.test(String(image || "")) ? { image } : {}) };
      // 3 psychologists whose expertise matches the post's topic — links from every post to profiles
      let blogTherapists = [];
      try {
        const list = await getListedTherapists(() => fetchData(getTherapistProfiles));
        const keywords = getTopicMatch(blog).flatMap((m) => [...m.keywords, m.service]).filter(Boolean);
        blogTherapists = pickRelated(list, { keywords: keywords.length ? keywords : ["anxiety", "stress", "depression"], limit: 3 });
      } catch (e) { /* the post works without them */ }
      return {
        props: {
          initialBlog: blog,
          blogTherapists,
        },
      };
    }
  } catch (error) {
    console.error("Fetch Error in getServerSideProps:", error);
  }
  return {
    props: {
      initialBlog: null,
    },
  };
}
