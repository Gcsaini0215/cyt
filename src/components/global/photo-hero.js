import React, { useEffect, useState } from "react";

/* Photo banner shared by the sign-in, sign-up, therapist-registration and collaboration pages:
   calm, relatable photos that slowly cross-fade under a green gradient, the copy on the left,
   and room underneath so the page's form card can overlap the bottom edge (give that card the
   "phx-overlap" class).

   Props: images ([url] — or a single image), interval (ms), pill, title, lead (nodes),
          stats ([{ value, label }]). A "-1920.webp" image is swapped for its "-900.webp" twin on phones.

   Photos in /assets/img/hero (in-*.webp) were AI-generated for CYT with Canva (design "CYT banner photos"). */
export default function PhotoHero({ images, image, interval = 6000, pill, title, lead, stats = [] }) {
  const list = images?.length ? images : [image];
  const [at, setAt] = useState(0);

  useEffect(() => {
    if (list.length < 2) return undefined;
    // people who ask for less motion get a still banner
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;
    const t = setInterval(() => setAt((i) => (i + 1) % list.length), interval);
    return () => clearInterval(t);
  }, [list.length, interval]);

  return (
    <section className="phx">
      <style dangerouslySetInnerHTML={{ __html: PHX_CSS }} />
      <div className="phx-bgs" aria-hidden="true">
        {list.map((src, i) => (
          <div key={src} className={`phx-bg ${i === at ? "on" : ""}`}
            style={{ backgroundImage: `url('${src}')`, "--phx-sm": `url('${src.replace(/-1920\.webp$/, "-900.webp")}')` }} />
        ))}
      </div>
      <div className="phx-in">
        {pill && <span className="phx-pill">{pill}</span>}
        <h1 className="phx-title">{title}</h1>
        {lead && <p className="phx-lead">{lead}</p>}
        {stats.length > 0 && (
          <div className="phx-stats">
            {stats.map((s) => <div key={s.label}><b>{s.value}</b><span>{s.label}</span></div>)}
          </div>
        )}
        {list.length > 1 && (
          <div className="phx-dots" role="tablist" aria-label="Banner photos">
            {list.map((src, i) => (
              <button key={src} type="button" role="tab" aria-selected={i === at} aria-label={`Photo ${i + 1}`}
                className={i === at ? "on" : ""} onClick={() => setAt(i)} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

const PHX_CSS = `
.phx { position: relative; overflow: hidden; color: #fff; padding: 72px 0 104px; background: #1a4d30; font-family: 'Inter', system-ui, -apple-system, sans-serif; }
.phx-bgs { position: absolute; inset: 0; }
.phx-bg { position: absolute; inset: 0; background-size: cover; background-position: center; opacity: 0; transform: scale(1.04); transition: opacity 1.4s ease, transform 7s ease; }
.phx-bg.on { opacity: 1; transform: scale(1); }
.phx-bgs::after { content: ""; position: absolute; inset: 0; background: linear-gradient(90deg, rgba(12,58,32,.94) 0%, rgba(20,86,48,.84) 42%, rgba(26,107,58,.35) 75%, rgba(26,107,58,.12) 100%); }
.phx-in { position: relative; z-index: 1; max-width: 1040px; margin: 0 auto; padding: 0 16px; }
.phx-in > * { max-width: 600px; }
.phx-pill { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 999px; background: rgba(255,255,255,.14); border: 1px solid rgba(255,255,255,.2); font-size: 13px; font-weight: 700; color: #fff; }
.phx-pill i, .phx-pill svg { font-size: 14px; }
.phx .phx-title { color: #fff; font-size: clamp(28px, 4.6vw, 44px); line-height: 1.12; margin: 14px 0 12px; padding: 0; font-weight: 800; letter-spacing: -0.02em; }
.phx .phx-title span { color: #bbf7d0; }
.phx-lead { font-size: 17px; line-height: 1.6; color: #dcfce7; margin: 0 0 22px; padding: 0; }
.phx-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.phx-stats div { background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.18); border-radius: 14px; padding: 12px; -webkit-backdrop-filter: blur(2px); backdrop-filter: blur(2px); }
.phx-stats b { display: block; font-size: 22px; font-weight: 900; color: #fff; line-height: 1.2; }
.phx-stats span { font-size: 12.5px; color: #d1fae5; line-height: 1.35; display: block; }
.phx-dots { display: flex; gap: 6px; margin-top: 18px; }
.phx-dots button { width: 8px; height: 8px; padding: 0; border: none; border-radius: 99px; background: rgba(255,255,255,.4); cursor: pointer; transition: width .3s, background .3s; }
.phx-dots button.on { width: 22px; background: #fff; }
/* the page's form card pulls up over the banner's bottom edge */
.phx-overlap { position: relative; z-index: 2; margin-top: -64px; }
@media (prefers-reduced-motion: reduce) { .phx-bg { transition: none; transform: none; } }
@media (max-width: 640px) {
  .phx { padding: 40px 0 84px; }
  .phx-bg { background-position: 65% center; background-image: var(--phx-sm) !important; }
  .phx-bgs::after { background: linear-gradient(180deg, rgba(12,58,32,.9) 0%, rgba(20,86,48,.86) 60%, rgba(26,107,58,.78) 100%); }
  .phx .phx-title { font-size: 27px; margin: 12px 0 8px; }
  .phx-lead { font-size: 15px; margin-bottom: 16px; }
  .phx-stats { gap: 6px; }
  .phx-stats div { padding: 9px 8px; border-radius: 12px; }
  .phx-stats b { font-size: 17px; }
  .phx-stats span { font-size: 11px; }
  .phx-dots { margin-top: 14px; }
  .phx-overlap { margin-top: -56px; }
}
`;
