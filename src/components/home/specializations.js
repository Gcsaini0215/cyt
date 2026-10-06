import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CONCERN_PAGES, concernPath, availableToday } from "../../utils/concerns";
import { imagePath } from "../../utils/url";
import { thumb, thumbSet } from "../../utils/thumb";

// Home "Explore Specializations": the main concerns as photo cards (each opens its
// /therapy-for/<slug> page), a "Help me choose" card, and the rest as chips. Counts, fees,
// faces and "available today" come from the real directory (stats from getStaticProps).
const MORE = ["stress", "anger", "self-esteem", "grief", "adhd"];

export default function Specializations({ stats: data = null }) {
  const stats = data?.bySlug || null;
  // "available today" depends on the clock — worked out after mount so server and browser HTML match
  const [now, setNow] = useState(null);
  useEffect(() => { setNow(Date.now()); }, []);

  const featured = CONCERN_PAGES.filter((c) => c.featured);
  const more = MORE.map((s) => CONCERN_PAGES.find((c) => c.slug === s)).filter(Boolean);
  const popular = useMemo(() => {
    if (!stats) return new Set();
    return new Set([...featured].sort((a, b) => (stats[b.slug]?.count || 0) - (stats[a.slug]?.count || 0)).slice(0, 3).map((c) => c.slug));
  }, [stats]);
  const today = (slug) => availableToday(stats?.[slug]?.ids, data?.week, now);

  return (
    <section className="sp-sec" aria-labelledby="sp-h">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="container">
        <div className="sp-head">
          <div>
            <span className="sp-bar" aria-hidden="true" />
            <h2 id="sp-h" className="sp-title">What would you like help with?</h2>
            <p className="sp-sub">Pick a concern to see psychologists who specialise in it.</p>
          </div>
          <Link href="/view-all-therapist?help=1" className="sp-help-link">
            <i className="feather-compass" aria-hidden="true" /> Not sure? Help me choose
          </Link>
        </div>

        <div className="sp-grid">
          {featured.map((c) => {
            const s = stats?.[c.slug];
            const n = today(c.slug);
            return (
              <Link key={c.slug} href={concernPath(c)} className="sp-card">
                <div className="sp-img">
                  <img src={`/images/concerns/${c.img}.webp`} alt="" width="560" height="340" loading="lazy" decoding="async" />
                  {popular.has(c.slug) && <span className="sp-pop">Popular</span>}
                  {s?.count > 0 && <span className="sp-count">{s.count} therapists</span>}
                </div>
                <div className="sp-body">
                  <h3>{c.label}</h3>
                  <p>{c.short}</p>
                  <div className="sp-meta">
                    {s?.faces?.length > 0 && (
                      <span className="sp-faces" aria-hidden="true">
                        {s.faces.map((f) => (
                          <img key={f.profile} src={thumb(`${imagePath}/${f.profile}`, 64)} srcSet={thumbSet(`${imagePath}/${f.profile}`, 64, 128)} alt="" width="26" height="26" loading="lazy" />
                        ))}
                      </span>
                    )}
                    {s?.minFee && <span className="sp-fee">from ₹{s.minFee.toLocaleString("en-IN")}</span>}
                  </div>
                  <div className="sp-foot">
                    {n > 0 ? <span className="sp-today"><i aria-hidden="true" /> {n} available today</span> : <span />}
                    <span className="sp-cta">See therapists <i className="feather-arrow-right" aria-hidden="true" /></span>
                  </div>
                </div>
              </Link>
            );
          })}

          <Link href="/view-all-therapist?help=1" className="sp-card sp-helpcard">
            <span className="sp-help-ic" aria-hidden="true"><i className="feather-compass" /></span>
            <h3>Not sure what you're feeling?</h3>
            <p>Answer 3 quick questions and we'll show the therapists who fit.</p>
            <span className="sp-help-btn">Help me choose <i className="feather-arrow-right" aria-hidden="true" /></span>
          </Link>
        </div>

        <div className="sp-more" aria-label="More concerns">
          <span>Also:</span>
          {more.map((c) => (
            <Link key={c.slug} href={concernPath(c)}>
              {c.label}{stats?.[c.slug]?.count ? <small>{stats[c.slug].count}</small> : null}
            </Link>
          ))}
          <Link href="/view-all-therapist?services=Teen%20Counselling">Teen counselling</Link>
          <Link href="/view-all-therapist" className="sp-all">All therapists <i className="feather-arrow-right" aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  );
}

const CSS = `
.sp-sec { background: #fff; padding: 64px 0 60px; }
.sp-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px 24px; flex-wrap: wrap; margin-bottom: 26px; }
.sp-bar { display: block; width: 42px; height: 4px; border-radius: 2px; background: #d4a24c; margin-bottom: 12px; }
.sp-title { font-size: clamp(1.6rem, 3.2vw, 2.2rem); font-weight: 800; color: #0b1712; margin: 0 0 6px; line-height: 1.2; letter-spacing: -.01em; }
.sp-sub { color: #64748b; font-size: 15px; margin: 0; padding: 0; }
.sp-help-link { display: inline-flex; align-items: center; gap: 7px; height: 40px; padding: 0 16px; border-radius: 999px; background: #fffaf0; border: 1px solid #ecd3a3; color: #7a5413 !important; font-size: 14px; font-weight: 700; text-decoration: none !important; white-space: nowrap; }
.sp-help-link:hover { background: #fbf0d9; }

.sp-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 18px; }
.sp-card { display: flex; flex-direction: column; background: #fff; border: 1px solid #e6eee9; border-radius: 18px; overflow: hidden; text-decoration: none !important; box-shadow: 0 2px 10px rgba(20,83,45,.05); transition: transform .22s ease, box-shadow .22s ease, border-color .22s ease; }
.sp-card:hover { transform: translateY(-4px); box-shadow: 0 16px 34px -14px rgba(20,83,45,.28); border-color: #cfe3d6; }
.sp-card:focus-visible { outline: 3px solid #1e7a4c; outline-offset: 2px; }
.sp-img { position: relative; height: 140px; overflow: hidden; background: #e8f3ec; }
.sp-img img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .5s ease; }
.sp-card:hover .sp-img img { transform: scale(1.05); }
.sp-img::after { content: ""; position: absolute; inset: 0; background: linear-gradient(to top, rgba(7,26,17,.45), transparent 55%); }
.sp-pop { position: absolute; top: 10px; left: 10px; z-index: 1; font-size: 10.5px; font-weight: 800; color: #14532d; background: rgba(236,199,125,.96); padding: 3px 9px; border-radius: 999px; }
.sp-count { position: absolute; bottom: 9px; left: 10px; z-index: 1; font-size: 11.5px; font-weight: 800; color: #fff; }
.sp-body { flex: 1; display: flex; flex-direction: column; gap: 6px; padding: 13px 15px 14px; }
.sp-body h3 { font-size: 16px; font-weight: 800; color: #0b1712; margin: 0; }
.sp-card:hover .sp-body h3 { color: #1e7a4c; }
.sp-body p { font-size: 13px; color: #64748b; line-height: 1.5; margin: 0; padding: 0; }
.sp-meta { display: flex; align-items: center; gap: 8px; min-height: 26px; margin-top: 2px; }
.sp-faces { display: inline-flex; }
.sp-faces img { width: 26px; height: 26px; border-radius: 50%; object-fit: cover; border: 2px solid #fff; margin-left: -8px; background: #e8f3ec; }
.sp-faces img:first-child { margin-left: 0; }
.sp-fee { font-size: 12.5px; font-weight: 700; color: #14532d; }
.sp-foot { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: auto; padding-top: 6px; }
.sp-today { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: #1e7a4c; }
.sp-today i { width: 7px; height: 7px; border-radius: 50%; background: #22a35a; box-shadow: 0 0 0 3px rgba(34,163,90,.18); }
.sp-cta { display: inline-flex; align-items: center; gap: 5px; font-size: 12.5px; font-weight: 800; color: #1e7a4c; white-space: nowrap; }
.sp-cta i { transition: transform .2s; }
.sp-card:hover .sp-cta i { transform: translateX(3px); }

.sp-helpcard { background: #fffaf0; border-color: #f0dfba; padding: 22px 20px; justify-content: center; gap: 8px; }
.sp-helpcard:hover { border-color: #ecd3a3; }
.sp-help-ic { width: 46px; height: 46px; border-radius: 14px; background: #fbf0d9; color: #9a6f22; display: flex; align-items: center; justify-content: center; font-size: 22px; }
.sp-helpcard h3 { font-size: 17px; font-weight: 800; color: #14532d; margin: 6px 0 0; }
.sp-helpcard p { font-size: 13.5px; color: #6b5a3a; line-height: 1.5; margin: 0; padding: 0; }
.sp-help-btn { align-self: flex-start; display: inline-flex; align-items: center; gap: 6px; margin-top: 8px; height: 40px; padding: 0 16px; border-radius: 10px; background: #1e7a4c; color: #fff; font-size: 13.5px; font-weight: 800; }

.sp-more { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 22px; }
.sp-more > span { font-size: 13px; font-weight: 700; color: #64748b; margin-right: 2px; }
.sp-more a { display: inline-flex; align-items: center; gap: 6px; height: 36px; padding: 0 14px; border-radius: 999px; border: 1px solid #dbe5df; background: #fff; color: #26463a !important; font-size: 13.5px; font-weight: 600; text-decoration: none !important; white-space: nowrap; }
.sp-more a small { font-size: 11px; font-weight: 800; color: #1e7a4c; background: #eef6f1; border-radius: 999px; padding: 1px 7px; }
.sp-more a:hover { border-color: #1e7a4c; color: #1e7a4c !important; }
.sp-more a.sp-all { border: none; color: #1e7a4c !important; font-weight: 800; }

@media (max-width: 1100px) { .sp-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
/* phones: one swipeable row instead of a 1300px-tall grid */
@media (max-width: 767px) {
  .sp-sec { padding: 40px 0 36px; }
  .sp-head { margin-bottom: 16px; }
  .sp-help-link { display: none; }
  .sp-grid { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; gap: 12px; margin: 0 -16px; padding: 2px 16px 8px; scrollbar-width: none; }
  .sp-grid::-webkit-scrollbar { display: none; }
  .sp-card { flex: 0 0 72%; scroll-snap-align: start; }
  .sp-card:hover { transform: none; }
  .sp-img { height: 118px; }
  .sp-body { padding: 11px 13px 12px; }
  .sp-body h3 { font-size: 15px; }
  .sp-body p { font-size: 12.5px; }
  .sp-helpcard { padding: 18px 16px; }
  .sp-more { flex-wrap: nowrap; overflow-x: auto; margin: 16px -16px 0; padding: 0 16px 2px; scrollbar-width: none; }
  .sp-more::-webkit-scrollbar { display: none; }
}
@media (prefers-reduced-motion: reduce) { .sp-card, .sp-img img, .sp-cta i { transition: none; } }
`;
