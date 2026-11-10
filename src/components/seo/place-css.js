// Shared look for place / search-intent landing pages (/psychologist-in/*, /psychologist-near-me,
// /clinical-psychologist, /child-psychologist). Footer.js forces <body> dark green, so every section sets its own background.
export const PLACE_CSS = `
/* Footer.js forces <body> dark green — sections need their own backgrounds */
.pl-banner { position: relative; overflow: hidden; padding: 56px 0 50px; background: #0b1712; }
.pl-ban-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.pl-banner::before { content: ""; position: absolute; inset: 0; z-index: 1; background: linear-gradient(90deg, rgba(7,26,17,.9) 0%, rgba(7,26,17,.72) 45%, rgba(7,26,17,.35) 80%, rgba(7,26,17,.2) 100%); }
@media (min-width: 992px) { .pl-ban-img { top: 200px; height: calc(100% - 200px); } }
.pl-ban-inner { position: relative; z-index: 2; }
.pl-crumbs { font-size: 13px; color: rgba(255,255,255,.6); margin-bottom: 14px; }
.pl-crumbs a { color: rgba(255,255,255,.85); font-weight: 600; text-decoration: none; }
.pl-eyebrow { display: inline-flex; align-items: center; gap: 8px; margin: 0 0 10px; padding: 0; font-size: 11.5px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; color: #ecc77d; }
.pl-eyebrow::before { content: ""; width: 22px; height: 2px; background: #d4a24c; }
.pl-banner h1 { font-size: clamp(30px, 4.4vw, 48px); font-weight: 800; color: #fff; margin: 0 0 12px; letter-spacing: -.02em; line-height: 1.12; }
.pl-banner h1 span { color: #ecc77d; }
.pl-sub { font-size: clamp(15px, 1.4vw, 17px); color: rgba(255,255,255,.88); line-height: 1.6; margin: 0 0 18px; padding: 0; max-width: 600px; }
.pl-facts { list-style: none; margin: 0 0 22px; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; }
.pl-facts li { margin: 0; padding: 6px 12px; border-radius: 999px; background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.22); color: rgba(255,255,255,.88); font-size: 13px; backdrop-filter: blur(4px); }
.pl-facts li::before { content: none; }
.pl-facts b { color: #fff; }
.pl-ctas { display: flex; flex-wrap: wrap; gap: 10px; }
.pl-btn.gold { background: #ecc77d; color: #14532d !important; }
.pl-btn.gold:hover { background: #f3d595; }
.pl-btn.line { background: transparent; border: 1.5px solid rgba(255,255,255,.55); color: #fff !important; gap: 7px; cursor: pointer; font-family: inherit; }
.pl-btn.line:hover { background: rgba(255,255,255,.12); }
.pl-lead { background: #fff; padding: 0 0 48px; }
.pl-factsec { background: #fff; padding: 0 0 44px; }
.pl-factsec h2 { font-size: clamp(20px, 3vw, 24px); font-weight: 800; color: #0b1712; margin: 0 0 12px; }
.pl-factsec h3 { font-size: 16px; font-weight: 800; color: #14532d; margin: 22px 0 10px; }
.pl-facts-box { list-style: none; margin: 0; padding: 16px 18px; border-radius: 14px; background: #f7faf8; border: 1px solid #e3ebe6; display: flex; flex-direction: column; gap: 8px; }
.pl-facts-box li { position: relative; margin: 0; padding-left: 20px; font-size: 15px; line-height: 1.55; color: #334155; }
.pl-facts-box li::before { content: ""; position: absolute; left: 3px; top: 9px; width: 7px; height: 7px; border-radius: 50%; background: #1e7a4c; }
.pl-updated { font-size: 12.5px; color: #94a3b8; margin: 8px 0 0; padding: 0; }
.pl-concerns { display: flex; flex-wrap: wrap; gap: 8px; }
.pl-concerns a { height: 36px; display: inline-flex; align-items: center; padding: 0 14px; border-radius: 999px; border: 1px solid #dbe5df; color: #26463a; font-size: 13.5px; font-weight: 600; text-decoration: none; background: #fff; }
.pl-concerns a:hover { border-color: #1e7a4c; color: #1e7a4c; }
.pl-intro { background: #f7faf8; padding: 48px 0; }
.pl-narrow { max-width: 820px; }
.pl-intro h2, .pl-faqs h2 { font-size: clamp(20px, 3vw, 26px); font-weight: 800; color: #0b1712; margin: 0 0 12px; }
.pl-intro p { color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 10px; padding: 0; }
.pl-areas { font-size: 14px !important; color: #64748b !important; }
.pl-areas a { color: #1e7a4c; font-weight: 700; }
.pl-faqs { background: #fff; padding: 48px 0 64px; }
@media (max-width: 767px) {
  .pl-banner { padding: 26px 0 24px; }
  .pl-banner::before { background: linear-gradient(180deg, rgba(7,26,17,.74), rgba(7,26,17,.86)); }
  .pl-sub { display: none; }
  .pl-banner h1 { font-size: 28px; }
  .pl-eyebrow { font-size: 10px; letter-spacing: .6px; }
  .pl-eyebrow::before { display: none; }
  .pl-facts { margin-bottom: 16px; }
  .pl-facts li { font-size: 12px; padding: 5px 10px; }
  .pl-ctas .pl-btn { flex: 1; justify-content: center; }
  .pl-thers { padding-top: 32px !important; }
  .pl-intro, .pl-faqs { padding: 36px 0; }
}
.pl-thers { background: #fff; padding: 56px 0 60px; }
.pl-head { text-align: center; max-width: 760px; margin: 0 auto 26px; }
.pl-head h2 { font-size: clamp(22px, 4vw, 32px); font-weight: 800; color: #0b1712; margin: 0 0 10px; }
.pl-head p { color: #475569; font-size: 16px; line-height: 1.6; margin: 0; padding: 0; }
.pl-list { display: flex; flex-direction: column; gap: 14px; }
.pl-empty { text-align: center; padding: 20px 0; }
.pl-more { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 12px 16px; margin-top: 24px; }
.pl-btn { display: inline-flex; align-items: center; height: 46px; padding: 0 22px; border-radius: 12px; background: #1e7a4c; color: #fff !important; font-weight: 800; font-size: 14.5px; text-decoration: none !important; }
.pl-btn:hover { background: #186640; }
.pl-btn.ghost { background: #fff; color: #14532d !important; border: 1.5px solid #cfdcd4; }
.pl-link { color: #1e7a4c !important; font-weight: 800; font-size: 14.5px; text-decoration: none !important; }
.pl-faq { margin-bottom: 12px; border-radius: 14px; border: 1px solid #e2e8f0; background: #fff; }
.pl-faq summary { cursor: pointer; list-style: none; padding: 18px 48px 18px 22px; font-size: 16px; font-weight: 700; color: #0b1712; position: relative; }
.pl-faq summary::-webkit-details-marker { display: none; }
.pl-faq summary::after { content: "+"; position: absolute; right: 22px; top: 50%; transform: translateY(-50%); font-size: 22px; color: #1e7a4c; }
.pl-faq[open] summary::after { content: "–"; }
.pl-faq[open] { box-shadow: 0 4px 20px rgba(30,122,76,.08); }
.pl-faq p { margin: 0; padding: 0 22px 18px; color: #475569; font-size: 15px; line-height: 1.7; }
`;
