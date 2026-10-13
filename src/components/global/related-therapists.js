import React from "react";
import Link from "next/link";

/* A row of therapist cards that link to their profiles — used for "Similar psychologists"
   on a profile, "Talk to a psychologist" under a blog, and the Noida pages. The links are
   in the server HTML so search engines can follow them to every profile. */
export default function RelatedTherapists({ title, subtitle, items, moreHref, moreLabel, id = "related-therapists" }) {
  if (!items || !items.length) return null;
  return (
    <section className="rt" aria-labelledby={`${id}-h`}>
      <style dangerouslySetInnerHTML={{ __html: RT_CSS }} />
      <div className="rt-head">
        <div>
          <h2 id={`${id}-h`}>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {moreHref && <Link href={moreHref} className="rt-more">{moreLabel || "See all"} →</Link>}
      </div>
      <div className="rt-grid">
        {items.map((t) => (
          <Link key={t.id} href={t.href} className="rt-card" title={`${t.name} — ${t.type}${t.city ? ` in ${t.city}` : ""}`}>
            <span className="rt-av">
              {t.photo ? <img src={t.photo} alt={`${t.name}, ${t.type}`} loading="lazy" width="56" height="56" /> : <b>{t.name.charAt(0)}</b>}
            </span>
            <span className="rt-info">
              <span className="rt-name">{t.name}</span>
              <span className="rt-type">{t.type}{t.city ? ` · ${t.city}` : ""}</span>
              <span className="rt-meta">
                {t.rating && <span className="rt-star">★ {Number(t.rating.avg).toFixed(1)} ({t.rating.count})</span>}
                {t.fee && <span>from ₹{t.fee.toLocaleString("en-IN")}</span>}
                {t.modes && <span>{t.modes}</span>}
              </span>
              {t.tags?.length > 0 && <span className="rt-tags">{t.tags.join(" · ")}</span>}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

const RT_CSS = `
.rt { max-width: 1180px; margin: 0 auto; padding: 34px 16px 26px; font-family: 'Inter', system-ui, sans-serif; }
.rt-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.rt-head h2 { margin: 0; font-size: 24px; font-weight: 800; color: #0f2a1d; letter-spacing: -.2px; }
.rt-head p { margin: 4px 0 0; font-size: 14.5px; color: #64748b; }
.rt-more { font-size: 14px; font-weight: 800; color: #1a6b3a; text-decoration: none; white-space: nowrap; }
.rt-more:hover { text-decoration: underline; }
.rt-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr)); gap: 12px; }
.rt-card { display: flex; gap: 12px; align-items: flex-start; padding: 14px; border-radius: 16px; background: linear-gradient(160deg, #f3faf6, #fff 75%); border: 1px solid #dfece4; text-decoration: none; color: inherit; transition: transform .15s, box-shadow .15s, border-color .15s; }
.rt-card:hover { transform: translateY(-2px); border-color: #b7dcc5; box-shadow: 0 12px 26px -16px rgba(15,61,34,.4); }
.rt-av { flex-shrink: 0; width: 56px; height: 56px; border-radius: 50%; overflow: hidden; background: #e7f5ec; display: flex; align-items: center; justify-content: center; }
.rt-av img { width: 100%; height: 100%; object-fit: cover; display: block; }
.rt-av b { font-size: 22px; color: #1a6b3a; }
.rt-info { min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.rt-name { font-size: 15.5px; font-weight: 800; color: #0f172a; }
.rt-type { font-size: 13px; color: #475569; }
.rt-meta { display: flex; flex-wrap: wrap; gap: 4px 10px; font-size: 12.5px; color: #334155; margin-top: 2px; }
.rt-star { color: #b45309; font-weight: 700; }
.rt-tags { font-size: 12px; color: #1a6b3a; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
@media (max-width: 640px) { .rt { padding: 26px 12px 18px; } .rt-head h2 { font-size: 20px; } }
`;
