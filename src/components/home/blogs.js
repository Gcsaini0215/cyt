import React, { useState, useEffect } from "react";
import Link from "next/link";
import BlogCardImg from "../../assets/img/bg-image-12dabd.jpg";
import BlogCardImg2 from "../../assets/img/blog2.png";
import BlogCardImg3 from "../../assets/img/blog3.png";
import BlogCardImg4 from "../../assets/img/blog5.png";

// shown until the latest posts arrive (or if they can't be fetched)
const FALLBACK = [
  { id: "", title: "The Art of Setting Boundaries without Feeling Guilty", category: "Self Care", excerpt: "Saying no without the guilt — small, practical ways to protect your time and energy while staying kind.", minutes: 5, img: BlogCardImg },
  { id: "", title: "Is Your Relationship Missing the Intimacy?", category: "Relationships", excerpt: "", minutes: 4, img: BlogCardImg2 },
  { id: "", title: "How to Help a Friend during a Panic Attack?", category: "Anxiety", excerpt: "", minutes: 4, img: BlogCardImg3 },
  { id: "", title: "Self-Care: Why It Is Not Selfish", category: "Self Care", excerpt: "", minutes: 3, img: BlogCardImg4 },
];

const imgOf = (p) => (p.img ? (p.img.src || p.img) : p.hasImage ? `/api/blog-thumb?id=${p.id}` : "/assets/img/blog-card-048b22.jpg");
const hrefOf = (p) => (p.id ? `/blog-details?id=${p.id}` : "/blogs");
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }) : "");
const meta = (p) => [fmtDate(p.createdAt), p.minutes ? `${p.minutes} min read` : ""].filter(Boolean).join(" · ");

/* Home "Latest articles": one featured post + three more.
   Desktop: featured left, a list of three on the right. iPad: featured on top, three in a row.
   Phones: a swipeable row of cards (instead of four tall photos stacked down the page). */
export default function Blogs() {
  const [posts, setPosts] = useState(FALLBACK);

  useEffect(() => {
    fetch("/api/blog-latest?n=4")
      .then((r) => r.json())
      .then((d) => { if (d?.status && d.data?.length) setPosts(d.data); })
      .catch(() => {});
  }, []);

  const [feat, ...rest] = posts;

  return (
    <section className="hbl" aria-labelledby="hbl-title">
      <div className="container">
        <div className="hbl-head">
          <div>
            <span className="hbl-bar" aria-hidden="true" />
            <h2 id="hbl-title" className="hbl-title">Latest from our <span>psychologists</span></h2>
            <p className="hbl-sub">Practical, evidence-based reads on anxiety, relationships, self-care and more.</p>
          </div>
          <Link href="/blogs" className="hbl-all">All articles <i className="feather-arrow-right" aria-hidden="true" /></Link>
        </div>

        <div className="hbl-grid">
          {feat && (
            <Link href={hrefOf(feat)} className="hbl-card hbl-feat">
              <span className="hbl-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imgOf(feat)} alt={feat.title} loading="lazy" width="640" height="400" />
                <em className="hbl-cat">{feat.category}</em>
              </span>
              <span className="hbl-body">
                <b className="hbl-t">{feat.title}</b>
                {feat.excerpt && <span className="hbl-ex">{feat.excerpt}</span>}
                <span className="hbl-meta">{meta(feat)}<i>Read →</i></span>
              </span>
            </Link>
          )}
          <div className="hbl-list">
            {rest.map((p, i) => (
              <Link key={p.id || i} href={hrefOf(p)} className="hbl-card hbl-row">
                <span className="hbl-img">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imgOf(p)} alt={p.title} loading="lazy" width="320" height="200" />
                </span>
                <span className="hbl-body">
                  <em className="hbl-cat2">{p.category}</em>
                  <b className="hbl-t">{p.title}</b>
                  <span className="hbl-meta">{meta(p)}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>

        <Link href="/blogs" className="hbl-all-m">See all articles <i className="feather-arrow-right" aria-hidden="true" /></Link>
      </div>

      <style dangerouslySetInnerHTML={{ __html: CSS }} />
    </section>
  );
}

const CSS = `
.hbl { background: #fbfaf6; padding: 64px 0; }
.hbl-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin-bottom: 26px; }
.hbl-bar { display: block; width: 42px; height: 4px; border-radius: 2px; background: #d4a24c; margin-bottom: 12px; }
.hbl .hbl-title { font-size: clamp(24px, 3vw, 34px); font-weight: 800; color: #0b1712; margin: 0 0 6px; line-height: 1.2; }
.hbl-title span { color: #a86e0e; }
.hbl .hbl-sub { color: #64748b; font-size: 15px; line-height: 1.6; margin: 0; padding: 0; }
.hbl-all { flex-shrink: 0; display: inline-flex; align-items: center; gap: 6px; height: 42px; padding: 0 18px; border-radius: 999px; border: 1.5px solid #cfe3d6; background: #fff; color: #14532d !important; font-size: 14px; font-weight: 800; text-decoration: none !important; transition: background .15s, border-color .15s; }
.hbl-all:hover { background: #eef6f1; border-color: #1e7a4c; }
.hbl-all-m { display: none; }

.hbl-grid { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); gap: 22px; align-items: stretch; }
.hbl-card { display: flex; background: #fff; border: 1px solid #ece9e1; border-radius: 18px; overflow: hidden; text-decoration: none !important; color: inherit !important; box-shadow: 0 16px 36px -28px rgba(23,60,42,.5); transition: transform .2s ease, box-shadow .2s ease; }
.hbl-card:hover { transform: translateY(-3px); box-shadow: 0 22px 44px -26px rgba(23,60,42,.55); }
.hbl-img { position: relative; display: block; background: #e7f0ea; overflow: hidden; }
.hbl-img img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .5s ease; }
.hbl-card:hover .hbl-img img { transform: scale(1.04); }
.hbl-body { display: flex; flex-direction: column; gap: 7px; min-width: 0; }
.hbl-t { font-weight: 800; color: #13261c; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.hbl-ex { font-size: 14px; line-height: 1.6; color: #5b6560; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.hbl-meta { display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: #8a948f; font-weight: 600; }
.hbl-meta i { margin-left: auto; font-style: normal; color: #1e7a4c; font-weight: 800; }
.hbl-cat { position: absolute; top: 12px; left: 12px; font-style: normal; font-size: 11.5px; font-weight: 800; color: #14532d; background: rgba(255,255,255,.94); padding: 4px 10px; border-radius: 999px; }
.hbl-cat2 { font-style: normal; font-size: 11px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; color: #a86e0e; }

/* featured: photo on top, details below */
.hbl-feat { flex-direction: column; }
.hbl-feat .hbl-img { aspect-ratio: 16 / 9; }
.hbl-feat .hbl-body { padding: 18px 20px 20px; }
.hbl-feat .hbl-t { font-size: 21px; }

/* the other three: thumbnail + text rows */
.hbl-list { display: grid; grid-template-rows: repeat(3, 1fr); gap: 14px; }
.hbl-row { align-items: stretch; }
.hbl-row .hbl-img { flex: 0 0 38%; min-height: 112px; }
.hbl-row .hbl-body { justify-content: center; padding: 12px 16px; gap: 5px; }
.hbl-row .hbl-t { font-size: 15.5px; }

/* iPad: featured across the top (photo beside text), then the three in a row */
@media (min-width: 601px) and (max-width: 1023px) {
  .hbl { padding: 52px 0; }
  .hbl-grid { grid-template-columns: 1fr; gap: 16px; }
  .hbl-feat { flex-direction: row; }
  .hbl-feat .hbl-img { flex: 0 0 48%; aspect-ratio: auto; min-height: 240px; }
  .hbl-feat .hbl-body { justify-content: center; }
  .hbl-list { grid-template-rows: none; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
  .hbl-row { flex-direction: column; }
  .hbl-row .hbl-img { flex: none; aspect-ratio: 16 / 10; min-height: 0; }
  .hbl-row .hbl-body { justify-content: flex-start; padding: 12px 14px 14px; }
}

/* phones: one swipeable row of cards */
@media (max-width: 600px) {
  .hbl { padding: 40px 0; }
  .hbl-head { margin-bottom: 18px; }
  .hbl-all { display: none; }
  .hbl-grid { display: flex; gap: 12px; overflow-x: auto; scroll-snap-type: x mandatory; margin: 0 -16px; padding: 4px 16px 18px; scrollbar-width: none; }
  .hbl-grid::-webkit-scrollbar { display: none; }
  .hbl-list { display: contents; }
  .hbl-card { flex: 0 0 80%; scroll-snap-align: start; flex-direction: column; }
  .hbl-feat .hbl-img, .hbl-row .hbl-img { flex: none; aspect-ratio: 16 / 10; min-height: 0; }
  .hbl-feat .hbl-body, .hbl-row .hbl-body { justify-content: flex-start; padding: 12px 14px 14px; }
  .hbl-feat .hbl-t, .hbl-row .hbl-t { font-size: 15.5px; }
  .hbl-feat .hbl-ex { display: none; }
  .hbl-all-m { display: flex; align-items: center; justify-content: center; gap: 6px; height: 46px; margin-top: 4px; border-radius: 12px; border: 1.5px solid #cfe3d6; background: #fff; color: #14532d !important; font-size: 14.5px; font-weight: 800; text-decoration: none !important; }
}
@media (prefers-reduced-motion: reduce) { .hbl-card, .hbl-img img { transition: none; } }
`;
