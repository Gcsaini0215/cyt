import React from "react";

/* Banner shared by the sign-in, sign-up and therapist-registration pages — the same soothing light
   look as /blogs: soft sage → cream → lavender with gentle shapes, the copy on the left, and room
   underneath so the page's form card can overlap the bottom edge (give that card the
   "phx-overlap" class).

   Props: pill, title, lead (nodes), stats ([{ value, label }]).
   images / image / interval are still accepted from older callers but no longer shown (the photo
   slideshow was replaced by the light banner, 2026-10-21). */
// eslint-disable-next-line no-unused-vars
export default function PhotoHero({ images, image, interval, pill, title, lead, stats = [] }) {
  return (
    <section className="phx">
      <style dangerouslySetInnerHTML={{ __html: PHX_CSS }} />
      <span className="phx-blob a" aria-hidden="true" /><span className="phx-blob b" aria-hidden="true" /><span className="phx-blob c" aria-hidden="true" />
      <div className="phx-in">
        {pill && <span className="phx-pill">{pill}</span>}
        <h1 className="phx-title">{title}</h1>
        {lead && <p className="phx-lead">{lead}</p>}
        {stats.length > 0 && (
          <div className="phx-stats">
            {stats.map((s) => <div key={s.label}><b>{s.value}</b><span>{s.label}</span></div>)}
          </div>
        )}
      </div>
    </section>
  );
}

const PHX_CSS = `
.phx { position: relative; overflow: hidden; color: #173c2a; padding: 56px 0 104px; background: linear-gradient(135deg, #d9eee1 0%, #f3ead9 55%, #e4e2f6 100%); font-family: 'Inter', system-ui, -apple-system, sans-serif; }
.phx-blob { position: absolute; border-radius: 50%; filter: blur(2px); pointer-events: none; }
.phx-blob.a { width: 420px; height: 420px; right: -100px; top: -150px; background: radial-gradient(circle, rgba(140,200,165,.6), rgba(140,200,165,0)); }
.phx-blob.b { width: 300px; height: 300px; left: -90px; bottom: -140px; background: radial-gradient(circle, rgba(184,176,236,.5), rgba(184,176,236,0)); }
.phx-blob.c { width: 220px; height: 220px; right: 24%; bottom: -80px; background: radial-gradient(circle, rgba(240,200,150,.55), rgba(240,200,150,0)); }
.phx-in { position: relative; z-index: 1; max-width: 1380px; margin: 0 auto; padding: 0 16px; box-sizing: border-box; }
/* same width and gutters as the site's .container, so the banner text lines up with the page */
@media (min-width: 601px) and (max-width: 1023px) { .phx-in { padding: 0 40px; } }
@media (min-width: 1024px) { .phx-in { padding: 0 clamp(40px, 4.5vw, 56px); } }
@media (min-width: 1300px) { .phx-in { padding: 0 40px; } }
.phx-in > * { max-width: 640px; }
.phx-pill { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 999px; background: rgba(255,255,255,.75); border: 1px solid #d3e6da; font-size: 13px; font-weight: 700; color: #166534; box-shadow: 0 6px 16px -10px rgba(20,83,45,.35); }
.phx-pill i, .phx-pill svg { font-size: 14px; }
.phx .phx-title { color: #173c2a; font-size: clamp(28px, 4.6vw, 46px); line-height: 1.12; margin: 14px 0 12px; padding: 0; font-weight: 800; letter-spacing: -0.02em; }
.phx .phx-title span { color: #2f8a5b; }
.phx-lead { font-size: 17px; line-height: 1.6; color: #475569; margin: 0 0 22px; padding: 0; }
.phx-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.phx-stats div { background: rgba(255,255,255,.72); border: 1px solid #dfeae3; border-radius: 14px; padding: 12px; box-shadow: 0 8px 20px -14px rgba(20,83,45,.35); }
.phx-stats b { display: block; font-size: 22px; font-weight: 900; color: #14532d; line-height: 1.2; }
.phx-stats span { font-size: 12.5px; color: #5b6b62; line-height: 1.35; display: block; }
/* the page's form card pulls up over the banner's bottom edge */
.phx-overlap { position: relative; z-index: 2; margin-top: -64px; }
@media (max-width: 640px) {
  .phx { padding: 32px 0 84px; }
  .phx .phx-title { font-size: 27px; margin: 12px 0 8px; }
  .phx-lead { font-size: 15px; margin-bottom: 16px; }
  .phx-stats { gap: 6px; }
  .phx-stats div { padding: 9px 8px; border-radius: 12px; }
  .phx-stats b { font-size: 17px; }
  .phx-stats span { font-size: 11px; }
  .phx-overlap { margin-top: -56px; }
  .phx-blob.a { width: 260px; height: 260px; right: -90px; top: -90px; }
}
`;
