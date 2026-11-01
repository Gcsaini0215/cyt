import React from "react";
import Link from "next/link";
import { CONSENT_GLANCE, CONSENT_SECTIONS } from "./probono-consent-data";

/* Terms and consent, for reading. The client agrees with the tick box on /client/free-session. */

function List({ items, style }) {
  if (style === "chips") return <div className="pc-chips">{items.map((x) => <span key={x}>{x}</span>)}</div>;
  return <ul className={style === "cross" ? "pc-cross" : "pc-list"}>{items.map((x) => <li key={x}>{x}</li>)}</ul>;
}

export default function ProbonoConsent() {
  return (
    <div className="pc">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <header className="pc-hero">
        <h1>Session Terms and Consent</h1>
        <p>Please read this before you share your details for a free session. It explains what the session is, what it isn&apos;t and how your information is used.</p>
        <div className="pc-glance">
          {CONSENT_GLANCE.map(([a, b]) => <div key={a}><b>{a}</b><span>{b}</span></div>)}
        </div>
      </header>

      <div className="pc-wrap">
        <nav className="pc-nav" aria-label="On this page">
          <b>On this page</b>
          {CONSENT_SECTIONS.map((s, i) => <a key={s.id} href={`#${s.id}`}>{i + 1}. {s.title}</a>)}
        </nav>

        <main className="pc-main">
          <p className="pc-alert" role="note"><b>Not for emergencies.</b> If you or someone else is in immediate danger, contact local emergency services or go to the nearest emergency department.</p>

          {CONSENT_SECTIONS.map((s, i) => (
            <section key={s.id} id={s.id} className={`pc-sec${s.highlight ? " warn" : ""}`}>
              <h2><span>{i + 1}</span>{s.title}</h2>
              {s.intro && <p>{s.intro}</p>}
              {s.lead && <p>{s.lead}</p>}
              {s.items && <List items={s.items} style={s.style} />}
              {s.groups && s.groups.map((g) => (
                <div key={g.heading} className="pc-group">
                  <h3>{g.heading}</h3>
                  <List items={g.items} />
                </div>
              ))}
              {s.outro && <p className="pc-outro">{s.outro}</p>}
            </section>
          ))}

          <div className="pc-end">
            <p>You also agree to our <Link href="/terms-conditions">Terms and Conditions</Link> and <Link href="/privacy-policy">Privacy Policy</Link>.</p>
            <Link href="/client/free-session" className="pc-btn">Go to Free Consultation</Link>
          </div>
        </main>
      </div>
    </div>
  );
}

const CSS = `
.pc { background: #f6f8f7; color: #334155; padding-bottom: 56px; }
.pc-hero { background: #fff; border-bottom: 1px solid #e4ece7; padding: 40px 16px 28px; text-align: center; }
.pc-hero h1 { margin: 0 0 10px; font-size: 32px; font-weight: 800; color: #0f172a; font-family: inherit; }
.pc-hero > p { max-width: 640px; margin: 0 auto 22px; font-size: 16px; line-height: 1.6; color: #475569; }
.pc-glance { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; max-width: 880px; margin: 0 auto; }
.pc-glance div { padding: 12px; border-radius: 12px; background: #f0fdf4; border: 1px solid #d7ecdd; }
.pc-glance b { display: block; font-size: 16px; color: #14532d; }
.pc-glance span { display: block; font-size: 13.5px; color: #475569; }
.pc-wrap { display: grid; grid-template-columns: 250px minmax(0, 760px); gap: 28px; justify-content: center; max-width: 1080px; margin: 24px auto 0; padding: 0 16px; }
.pc-nav { position: sticky; top: 96px; align-self: start; display: flex; flex-direction: column; gap: 2px; font-size: 14px; }
.pc-nav b { margin-bottom: 6px; font-size: 14px; color: #0f172a; }
.pc-nav a { padding: 5px 8px; border-radius: 8px; color: #475569; text-decoration: none; line-height: 1.35; }
.pc-nav a:hover { background: #e8f3ec; color: #14532d; }
.pc-alert { margin: 0 0 14px; padding: 14px 16px; border-radius: 12px; background: #fffbeb; border: 1px solid #fde68a; font-size: 14.5px; line-height: 1.6; color: #78350f; }
.pc-sec { scroll-margin-top: 96px; margin-bottom: 14px; padding: 20px; border-radius: 16px; background: #fff; border: 1px solid #e4ece7; }
.pc-sec.warn { border-color: #fcd9a8; }
.pc-sec h2 { display: flex; align-items: center; gap: 10px; margin: 0 0 10px; font-size: 19px; font-weight: 800; color: #0f172a; font-family: inherit; }
.pc-sec h2 span { flex: none; width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: #166534; color: #fff; font-size: 13.5px; }
.pc-sec.warn h2 span { background: #b45309; }
.pc-sec p { margin: 0 0 8px; font-size: 15px; line-height: 1.65; color: #475569; }
.pc-sec p.pc-outro { margin: 10px 0 0; }
.pc-sec.warn p.pc-outro { font-weight: 700; color: #92400e; }
.pc-list, .pc-cross { margin: 0; padding-left: 20px; font-size: 15px; line-height: 1.65; color: #475569; }
.pc-cross { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 2px 18px; padding: 0; list-style: none; }
.pc-cross li { position: relative; padding-left: 20px; }
.pc-cross li::before { content: "×"; position: absolute; left: 2px; font-weight: 800; color: #b91c1c; }
.pc-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.pc-chips span { padding: 5px 12px; border-radius: 999px; background: #f0fdf4; border: 1px solid #d7ecdd; font-size: 14px; color: #14532d; }
.pc-group { margin-top: 14px; padding-top: 12px; border-top: 1px solid #eef2f0; }
.pc-group:first-of-type { margin-top: 0; padding-top: 0; border-top: 0; }
.pc-group h3 { margin: 0 0 4px; font-size: 15.5px; font-weight: 800; color: #14532d; font-family: inherit; }
.pc-end { padding: 20px; border-radius: 16px; background: #fff; border: 1px solid #e4ece7; text-align: center; }
.pc-end p { margin: 0 0 12px; font-size: 14.5px; color: #475569; }
.pc-end p a { color: #166534; font-weight: 700; text-decoration: underline; }
.pc-btn { display: inline-flex; align-items: center; justify-content: center; min-height: 46px; padding: 0 22px; border-radius: 10px; background: #166534; color: #fff !important; font-size: 15px; font-weight: 800; text-decoration: none !important; }
@media (max-width: 900px) {
  .pc-wrap { grid-template-columns: minmax(0, 1fr); }
  .pc-nav { display: none; }
  .pc-glance { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 480px) {
  .pc-hero { padding-top: 28px; }
  .pc-hero h1 { font-size: 25px; }
  .pc-cross { grid-template-columns: 1fr; }
  .pc-sec { padding: 16px; }
}
`;
