import React, { useState } from "react";
import { FREE_TESTS, LICENSED_TESTS, CATEGORIES } from "./tests";

/* The list on /self-assessment: free checks (taken right here) by topic, and copyrighted ones that
   are taken with a licensed psychologist. */

export default function AssessmentCards({ onStart, onLicensed }) {
  const [cat, setCat] = useState("All");
  const shown = FREE_TESTS.filter((t) => cat === "All" || t.category === cat);
  const cats = CATEGORIES.filter((c) => c === "All" || FREE_TESTS.some((t) => t.category === c));

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SAC_CSS }} />
      <section className="sac" aria-labelledby="sac-h">
        <div className="sac-in">
          <div className="sac-head">
            <span className="sac-kick">Free self-checks</span>
            <h2 id="sac-h">What would you like to check?</h2>
            <p>Published screening questionnaires, word for word, with their original scoring — the same ones psychologists use. Each shows its research reference.</p>
          </div>

          <div className="sac-cats" role="tablist" aria-label="Topics">
            {cats.map((c) => (
              <button key={c} type="button" role="tab" aria-selected={cat === c} className={cat === c ? "on" : ""} onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>

          <div className="sac-grid">
            {shown.map((t) => (
              <article key={t.key} className="sac-card" style={{ "--c": t.color }}>
                <div className="sac-top">
                  <span className="sac-ic"><i className={t.icon} aria-hidden="true" /></span>
                  <div>
                    <h3>{t.title}</h3>
                    <span className="sac-short">{t.short}</span>
                  </div>
                </div>
                <p className="sac-blurb">{t.blurb}</p>
                <div className="sac-chips">
                  <span>{t.questions.length} questions</span><span>{t.time}</span><span>{t.age}</span>
                </div>
                <p className="sac-by">Developed by: {t.by}</p>
                <button type="button" className="sac-btn" onClick={() => onStart(t)}>Start <i className="feather-arrow-right" aria-hidden="true" /></button>
              </article>
            ))}
          </div>

          <div className="sac-head lic">
            <span className="sac-kick gold">With a licensed psychologist</span>
            <h2>Clinical questionnaires</h2>
            <p>These are copyrighted, so they can&apos;t be filled in online here. A psychologist who holds the licence gives them to you in a session and explains your score with you.</p>
          </div>
          <div className="sac-grid">
            {LICENSED_TESTS.map((t) => (
              <article key={t.key} className="sac-card lic" style={{ "--c": t.color }}>
                <div className="sac-top">
                  <span className="sac-ic"><i className={t.icon} aria-hidden="true" /></span>
                  <div>
                    <h3>{t.title}</h3>
                    <span className="sac-short">{t.short} · 🔒 licensed</span>
                  </div>
                </div>
                <p className="sac-blurb">{t.measures}</p>
                <p className="sac-by">{t.holder}</p>
                <button type="button" className="sac-btn ghost" onClick={() => onLicensed(t)}>Take with a psychologist</button>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

const SAC_CSS = `
.sac { background: #f6f8f7; padding: 44px 0 52px; }
.sac-in { max-width: 1180px; margin: 0 auto; padding: 0 20px; }
.sac-head { text-align: center; max-width: 640px; margin: 0 auto 18px; }
.sac-head.lic { margin-top: 44px; }
.sac-kick { display: inline-block; font-size: 11px; font-weight: 800; color: #16a34a; letter-spacing: 1.2px; text-transform: uppercase; background: #dcfce7; padding: 5px 14px; border-radius: 999px; }
.sac-kick.gold { color: #92400e; background: #fef3c7; }
.sac-head h2 { margin: 10px 0 6px; font-size: clamp(22px, 3vw, 30px); font-weight: 800; color: #0f172a; font-family: inherit; }
.sac-head p { margin: 0; font-size: 14px; color: #64748b; line-height: 1.6; }
.sac-cats { display: flex; gap: 8px; overflow-x: auto; padding: 4px 2px 10px; margin-bottom: 8px; scrollbar-width: none; justify-content: center; flex-wrap: wrap; }
.sac-cats::-webkit-scrollbar { display: none; }
.sac-cats button { flex-shrink: 0; height: 36px; padding: 0 14px; border-radius: 999px; border: 1px solid #dfe7e2; background: #fff; color: #475569; font-weight: 700; font-size: 13px; cursor: pointer; font-family: inherit; }
.sac-cats button.on { background: #166534; border-color: #166534; color: #fff; }
.sac-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.sac-card { background: #fff; border: 1px solid #e3eae6; border-radius: 16px; padding: 16px; display: flex; flex-direction: column; gap: 10px; min-width: 0; transition: box-shadow .2s, border-color .2s; }
.sac-card:hover { border-color: color-mix(in srgb, var(--c) 40%, #e3eae6); box-shadow: 0 12px 28px -20px rgba(15,23,42,.4); }
.sac-top { display: flex; gap: 12px; align-items: center; }
.sac-ic { width: 44px; height: 44px; border-radius: 12px; display: grid; place-items: center; font-size: 19px; flex-shrink: 0; background: color-mix(in srgb, var(--c) 12%, #fff); color: var(--c); }
.sac-card h3 { margin: 0; font-size: 15.5px; font-weight: 800; color: #0f172a; line-height: 1.3; font-family: inherit; }
.sac-short { font-size: 12px; font-weight: 800; color: var(--c); }
.sac-blurb { margin: 0; font-size: 13.5px; color: #475569; line-height: 1.55; }
.sac-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.sac-chips span { font-size: 11.5px; font-weight: 700; color: #475569; background: #f1f5f4; border-radius: 999px; padding: 3px 9px; }
.sac-by { margin: 0; font-size: 11.5px; color: #94a3b8; font-weight: 600; line-height: 1.45; }
.sac-btn { margin-top: auto; height: 42px; border-radius: 11px; border: 0; background: var(--c); color: #fff; font-weight: 800; font-size: 14px; cursor: pointer; font-family: inherit; display: inline-flex; align-items: center; justify-content: center; gap: 6px; }
.sac-btn.ghost { background: #fff; color: #166534; border: 1.5px solid #cfe3d6; }
.sac-btn.ghost:hover { background: #f0fdf4; }
.sac-card.lic { background: #fffdf7; border-color: #f1e7cf; }
@media (max-width: 991px) { .sac-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 600px) {
  .sac { padding: 28px 0 36px; }
  .sac-in { padding: 0 16px; }
  .sac-grid { grid-template-columns: 1fr; gap: 10px; }
  .sac-cats { justify-content: flex-start; flex-wrap: nowrap; }
}
`;
