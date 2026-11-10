import React from "react";
import Link from "next/link";
import { thumb } from "../../utils/thumb";
import { imagePath } from "../../utils/url";

// Bits shared by /ask-a-psychologist and /ask-a-psychologist/[slug].

// therapist who answered → { name, role, photo, profileHref, bookHref } using the live directory's slug maps
export function therapistLink(card, maps) {
  if (!card) return null;
  const t = maps?.list?.find((x) => String(x._id) === String(card._id));
  const slug = maps?.slugById?.[card._id];
  return {
    name: card.name || "CYT psychologist",
    role: card.profile_type || "Psychologist",
    photo: card.profile ? thumb(`${imagePath}/${card.profile}`, 160) : "",
    profileHref: t ? `/view-profile/${slug || card._id}` : "",
    bookHref: t ? `/book/${slug || card._id}` : "",
  };
}

export function Answerer({ who, big = false }) {
  if (!who) return null;
  return (
    <div className={`apq-who${big ? " big" : ""}`}>
      {who.photo
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={who.photo} alt={who.name} width={big ? 64 : 40} height={big ? 64 : 40} loading="lazy" />
        : <span className="apq-ini" aria-hidden="true">{(who.name || "C")[0]}</span>}
      <div>
        <div className="apq-who-n">{who.profileHref ? <Link href={who.profileHref}>{who.name}</Link> : who.name}
          <svg viewBox="0 0 24 24" width="15" height="15" fill="#1e8a4f" aria-label="Verified"><path d="m23 12-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.96 8.6 1.5 6.71 4.69 3.1 5.5l.34 3.7L1 12l2.44 2.79-.34 3.7 3.61.82L8.6 22.5l3.4-1.47 3.4 1.46 1.89-3.19 3.61-.82-.34-3.69L23 12zm-12.91 4.72-3.8-3.81 1.48-1.48 2.32 2.33 5.85-5.87 1.48 1.48-7.33 7.35z" /></svg>
        </div>
        <div className="apq-who-r">{who.role} · Verified on Choose Your Therapist</div>
      </div>
    </div>
  );
}

export const ASK_PUBLIC_CSS = `
.apq { --g:#14532d; --g2:#1e7a4c; --gold:#e0ab45; --ink:#0b1712; --mut:#5b6b63; --line:#e2ebe5; color: var(--ink); background: #fbfaf6; }
.apq-wrap { max-width: 1100px; margin: 0 auto; padding: 0 20px; }
.apq-hero { background: radial-gradient(circle at 100% 0, rgba(242,201,76,.28), transparent 40%), linear-gradient(135deg, #1f7a4a, #0b3d26 75%); color: #fff; padding: 46px 0 40px; }
.apq-eyebrow { display: inline-block; font-size: 12px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: #f6d58a; margin-bottom: 10px; }
.apq-hero h1 { font-size: clamp(1.9rem, 4vw, 2.8rem); font-weight: 800; line-height: 1.15; margin: 0 0 12px; color: #fff; }
.apq-hero h1 em { font-style: normal; color: #f2c94c; }
.apq-hero p { font-size: 16.5px; line-height: 1.6; color: #d9eadf; max-width: 640px; margin: 0 0 20px; }
.apq-cta { display: inline-flex; align-items: center; gap: 8px; height: 50px; padding: 0 24px; border-radius: 14px; font-size: 15.5px; font-weight: 800; background: linear-gradient(180deg, #f6d27a, #e3a83a); color: #1f2a14 !important; text-decoration: none !important; }
.apq-trust { display: flex; flex-wrap: wrap; gap: 8px 18px; margin-top: 16px; font-size: 13.5px; color: #cfe3d6; }
.apq-cats { display: flex; gap: 8px; overflow-x: auto; padding: 18px 0 6px; scrollbar-width: none; }
.apq-cats a { flex: none; padding: 8px 14px; border-radius: 999px; border: 1.5px solid var(--line); background: #fff; font-size: 13.5px; font-weight: 700; color: #334155 !important; text-decoration: none !important; white-space: nowrap; }
.apq-cats a.on { border-color: var(--g2); background: #ecfdf3; color: var(--g) !important; }
.apq-cats a small { color: #94a3b8; font-weight: 700; margin-left: 4px; }
.apq-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; padding: 14px 0 30px; }
.apq-card { position: relative; background: #fff; border: 1px solid var(--line); border-radius: 18px; padding: 18px; display: flex; flex-direction: column; gap: 10px; transition: box-shadow .2s, border-color .2s; }
.apq-card:hover { border-color: #cfe3d6; box-shadow: 0 16px 34px -26px rgba(20,83,45,.6); }
.apq-card h2 { font-size: 17px; line-height: 1.4; font-weight: 800; margin: 0; }
.apq-card h2 a { color: var(--ink) !important; text-decoration: none !important; }
.apq-card h2 a::after { content: ""; position: absolute; inset: 0; border-radius: 18px; }
.apq-tag { align-self: flex-start; font-size: 11.5px; font-weight: 800; color: var(--g); background: #ecfdf3; padding: 3px 9px; border-radius: 999px; }
.apq-snip { margin: 0; font-size: 14px; line-height: 1.6; color: #475569; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.apq-who { display: flex; align-items: center; gap: 10px; position: relative; z-index: 1; }
.apq-who img, .apq-ini { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; flex: none; border: 2px solid #f1e3bf; }
.apq-ini { display: grid; place-items: center; background: #ecfdf3; color: var(--g); font-weight: 800; }
.apq-who.big img, .apq-who.big .apq-ini { width: 64px; height: 64px; }
.apq-who-n { display: flex; align-items: center; gap: 5px; font-weight: 800; font-size: 14px; }
.apq-who-n a { color: var(--g) !important; text-decoration: none !important; }
.apq-who.big .apq-who-n { font-size: 17px; }
.apq-who-r { font-size: 12.5px; color: var(--mut); }
.apq-empty { background: #fff; border: 1px dashed #cfe3d6; border-radius: 18px; padding: 30px 20px; text-align: center; color: var(--mut); margin: 14px 0 30px; }
.apq-empty b { display: block; color: var(--ink); font-size: 17px; margin-bottom: 6px; }
.apq-pager { display: flex; gap: 8px; justify-content: center; padding-bottom: 30px; }
.apq-pager a { padding: 8px 14px; border-radius: 10px; border: 1.5px solid var(--line); background: #fff; font-weight: 700; color: var(--g) !important; text-decoration: none !important; }
.apq-how { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; padding: 6px 0 40px; }
.apq-how div { background: #fff; border: 1px solid var(--line); border-radius: 16px; padding: 18px; }
.apq-how b { display: block; font-size: 15.5px; margin: 6px 0 4px; }
.apq-how span { font-size: 26px; font-weight: 800; color: var(--gold); }
.apq-how p { margin: 0; font-size: 14px; color: var(--mut); line-height: 1.55; }
.apq-note { font-size: 13px; color: var(--mut); padding-bottom: 36px; }
.apq-note a { color: #b42318 !important; font-weight: 700; }
/* detail */
.apq-crumb { font-size: 13px; color: #cfe3d6; margin-bottom: 12px; }
.apq-crumb a { color: #f6d58a !important; text-decoration: none !important; }
.apq-q-meta { display: flex; gap: 10px; flex-wrap: wrap; font-size: 13.5px; color: #cfe3d6; }
.apq-detail { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 22px; padding: 26px 0 40px; align-items: start; }
.apq-asked { background: #fff; border: 1px solid var(--line); border-radius: 18px; padding: 20px; margin-bottom: 16px; }
.apq-asked small, .apq-answer small { display: block; font-size: 11.5px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: var(--g2); margin-bottom: 8px; }
.apq-asked p { margin: 0; font-size: 16px; line-height: 1.7; white-space: pre-line; color: #1f2937; }
.apq-answer { background: #fff; border: 1px solid #cfe3d6; border-left: 4px solid var(--g2); border-radius: 18px; padding: 20px; }
.apq-answer .apq-who { margin-bottom: 14px; }
.apq-answer-t { font-size: 16px; line-height: 1.8; white-space: pre-line; color: #1f2937; }
.apq-helpful { display: flex; align-items: center; gap: 10px; margin-top: 16px; font-size: 14px; color: var(--mut); flex-wrap: wrap; }
.apq-helpful button { border: 1.5px solid #cfe3d6; background: #fff; color: var(--g); font-weight: 800; border-radius: 999px; padding: 7px 14px; cursor: pointer; font-family: inherit; }
.apq-helpful button:disabled { opacity: .7; cursor: default; }
.apq-disc { margin-top: 16px; font-size: 12.5px; color: #64748b; line-height: 1.55; background: #f8faf9; border-radius: 12px; padding: 10px 12px; }
.apq-side { position: sticky; top: 90px; display: grid; gap: 14px; }
.apq-book { background: linear-gradient(135deg, #1f7a4a, #0b3d26); color: #fff; border-radius: 18px; padding: 20px; }
.apq-book .apq-who-n a, .apq-book .apq-who-n { color: #fff !important; }
.apq-book .apq-who-r { color: #cfe3d6; }
.apq-book p { font-size: 14px; color: #d9eadf; line-height: 1.55; margin: 12px 0 14px; }
.apq-book .apq-cta { width: 100%; justify-content: center; }
.apq-book .apq-sec { display: block; text-align: center; margin-top: 10px; color: #f6d58a !important; font-weight: 700; font-size: 13.5px; text-decoration: none !important; }
.apq-ask { background: #fff; border: 1px solid var(--line); border-radius: 18px; padding: 18px; }
.apq-ask b { display: block; font-size: 15.5px; margin-bottom: 4px; }
.apq-ask p { margin: 0 0 12px; font-size: 13.5px; color: var(--mut); }
.apq-ask a.apq-cta { height: 44px; font-size: 14.5px; width: 100%; justify-content: center; }
.apq-rel h3 { font-size: 15px; font-weight: 800; margin: 0 0 10px; }
.apq-rel a { display: block; padding: 10px 0; border-top: 1px solid var(--line); color: var(--ink) !important; font-weight: 600; font-size: 14px; text-decoration: none !important; line-height: 1.45; }
@media (max-width: 900px) { .apq-detail { grid-template-columns: 1fr; } .apq-side { position: static; } }
@media (max-width: 700px) { .apq-list, .apq-how { grid-template-columns: 1fr; } .apq-wrap { padding: 0 16px; } .apq-hero { padding: 34px 0 30px; } }
`;
