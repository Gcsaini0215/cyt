import React, { useState } from "react";
import Link from "next/link";
import { FREE_TESTS, CATEGORIES } from "./tests";
import { pathOf } from "./seo";

/* The list on /self-assessment: the clinical assessments by topic, with their price (admin pricing).
   Each card links to the test's own page: take it on its own, or with a psychologist. */

export default function AssessmentCards({ prices }) {
  const [cat, setCat] = useState("All");
  const bookable = (t) => !prices || prices[t.key]?.active !== false;
  const shown = FREE_TESTS.filter((t) => bookable(t) && (cat === "All" || t.category === cat));
  const cats = CATEGORIES.filter((c) => c === "All" || FREE_TESTS.some((t) => t.category === c));

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SAC_CSS }} />
      <section className="sac" aria-labelledby="sac-h">
        <div className="sac-in">
          <div className="sac-head">
            <span className="sac-kick">Screening tools</span>
            <h2 id="sac-h">Which screening do you need?</h2>
            <p>Standard, published screening tools with their original scoring — for screening only, not a diagnosis. Take one on its own for an instant report, or with a verified psychologist who adds their notes from your session.</p>
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
                    <h3><Link href={pathOf(t.key)} className="sac-title">{t.title}</Link></h3>
                    <span className="sac-short">{t.short}</span>
                  </div>
                </div>
                <p className="sac-blurb">{t.blurb}</p>
                <div className="sac-chips">
                  <span>{t.questions.length} questions</span><span>{t.time}</span><span>{t.age}</span>
                </div>
                <p className="sac-by">Developed by: {t.by}</p>
                <div className="sac-foot">
                  <span className="sac-price">
                    {prices?.[t.key] ? <>{prices[t.key].offer && <s>₹{prices[t.key].fee}</s>} <b>₹{prices[t.key].price}</b>{prices[t.key].offer && prices[t.key].offerLabel && <em>{prices[t.key].offerLabel}</em>}<small>screening fee</small></> : <small>&nbsp;</small>}
                  </span>
                  <Link href={pathOf(t.key)} className="sac-btn" aria-label={`Take the ${t.short} screening`}>Take the <span className="sac-sr">{t.short} </span>screening <span aria-hidden="true">→</span></Link>
                </div>
              </article>
            ))}
          </div>

          <div className="sac-clinical">
            <span className="sac-kick">How it works</span>
            <ol>
              <li><b>Just the screening</b> — pay the screening fee, answer it online and get your automatic report at once.</li>
              <li><b>With a psychologist</b> — book it with a session and answer it online before the session.</li>
              <li><b>Your psychologist goes through it with you</b> and adds a summary, observations, recommendations and a follow-up plan.</li>
              <li><b>Signed report</b> — with their RCI / registration no., yours to keep.</li>
            </ol>
          </div>
        </div>
      </section>
    </>
  );
}

const SAC_CSS = `
.sac { background: linear-gradient(180deg, #f2f7f3 0%, #f8f6f0 100%); padding: 44px 0 52px; }
.sac-in { max-width: 1180px; margin: 0 auto; padding: 0 20px; }
.sac-head { text-align: center; max-width: 660px; margin: 0 auto 18px; }
.sac-kick { display: inline-block; font-size: 11px; font-weight: 800; color: #2f7a52; letter-spacing: 1.2px; text-transform: uppercase; background: #e3f1e8; padding: 5px 14px; border-radius: 999px; }
.sac-head h2 { margin: 10px 0 6px; font-size: clamp(22px, 3vw, 30px); font-weight: 800; color: #173c2a; font-family: inherit; }
.sac-head p { margin: 0; font-size: 14px; color: #5b6b62; line-height: 1.65; }
.sac-cats { display: flex; gap: 8px; overflow-x: auto; padding: 4px 2px 10px; margin-bottom: 8px; scrollbar-width: none; justify-content: center; flex-wrap: wrap; }
.sac-cats::-webkit-scrollbar { display: none; }
.sac-cats button { flex-shrink: 0; height: 36px; padding: 0 14px; border-radius: 999px; border: 1px solid #dbe6df; background: #fff; color: #4b5b53; font-weight: 700; font-size: 13px; cursor: pointer; font-family: inherit; transition: background .2s, color .2s; }
.sac-cats button:hover { background: #eef6f1; }
.sac-cats button.on { background: #1f6b45; border-color: #1f6b45; color: #fff; }
.sac-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.sac-card { position: relative; background: #fff; border: 1px solid #e3ece6; border-radius: 18px; padding: 18px; display: flex; flex-direction: column; gap: 10px; min-width: 0; box-shadow: 0 1px 2px rgba(23,60,42,.04); transition: box-shadow .25s, border-color .25s, transform .25s; overflow: hidden; }
.sac-card::before { content: ""; position: absolute; inset: 0 0 auto 0; height: 4px; background: color-mix(in srgb, var(--c) 28%, #e3f1e8); }
.sac-card:hover { border-color: #cfe1d6; box-shadow: 0 16px 34px -24px rgba(23,60,42,.35); transform: translateY(-2px); }
.sac-top { display: flex; gap: 12px; align-items: center; }
.sac-ic { width: 46px; height: 46px; border-radius: 14px; display: grid; place-items: center; font-size: 19px; flex-shrink: 0; background: color-mix(in srgb, var(--c) 10%, #f4f8f5); color: color-mix(in srgb, var(--c) 55%, #2f5f48); }
.sac-card h3 { margin: 0; font-size: 15.5px; font-weight: 800; color: #173c2a; line-height: 1.3; font-family: inherit; }
.sac-short { font-size: 12px; font-weight: 800; color: #2f7a52; }
.sac-blurb { margin: 0; font-size: 13.5px; color: #5b6b62; line-height: 1.6; }
.sac-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.sac-chips span { font-size: 11.5px; font-weight: 700; color: #4b5b53; background: #f3f6f2; border: 1px solid #e6ece7; border-radius: 999px; padding: 3px 9px; }
.sac-by { margin: 0; font-size: 11.5px; color: #8a9a91; font-weight: 600; line-height: 1.45; }
.sac-foot { margin-top: auto; display: flex; align-items: center; justify-content: space-between; gap: 10px; padding-top: 12px; border-top: 1px dashed #e3ece6; }
.sac-price { font-size: 13px; color: #6b7b72; line-height: 1.2; } .sac-price b { font-size: 19px; color: #173c2a; } .sac-price s { color: #a3b0a8; }
.sac-price em { display: inline-block; margin-left: 4px; font-style: normal; font-size: 10.5px; font-weight: 800; color: #9a5b12; background: #fbf1df; border-radius: 999px; padding: 1px 7px; vertical-align: 3px; }
.sac-price small { display: block; font-size: 11px; color: #8a9a91; }
.sac-btn { padding: 0 16px; height: 42px; border-radius: 12px; border: 0; background: #1f6b45; color: #fff; font-weight: 800; font-size: 14px; cursor: pointer; font-family: inherit; display: inline-flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 8px 18px -12px rgba(31,107,69,.8); transition: background .2s, transform .2s; }
.sac-btn:hover { background: #185a39; transform: translateY(-1px); }
.sac-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.sac-btn span { transition: transform .2s; } .sac-btn:hover span { transform: translateX(2px); }
.sac-btn.ghost { background: #fff; color: #1f6b45; border: 1.5px solid #cfe1d6; box-shadow: none; }
.sac-btn.ghost:hover { background: #f0f7f2; }
.sac-clinical { margin-top: 36px; background: linear-gradient(135deg, #eaf4ed, #faf6ec); border: 1px solid #dfeae2; border-radius: 18px; padding: 22px 24px; }
.sac-clinical h2 { margin: 10px 0 6px; font-size: clamp(19px, 2.4vw, 24px); font-weight: 800; color: #173c2a; font-family: inherit; }
.sac-clinical ol { margin: 12px 0 0; padding-left: 20px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 28px; }
.sac-clinical li { font-size: 14px; color: #5b6b62; line-height: 1.55; } .sac-clinical li b { color: #1f6b45; }
.sac-title { color: inherit !important; text-decoration: none !important; }
.sac-title:hover { color: #1f6b45 !important; }
a.sac-btn { color: #fff !important; text-decoration: none !important; }
@media (max-width: 700px) { .sac-clinical ol { grid-template-columns: 1fr; } }
@media (max-width: 991px) { .sac-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 600px) {
  .sac { padding: 28px 0 36px; }
  .sac-in { padding: 0 16px; }
  .sac-grid { grid-template-columns: 1fr; gap: 12px; }
  .sac-cats { justify-content: flex-start; flex-wrap: nowrap; }
}
`;
