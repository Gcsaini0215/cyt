import React from "react";
import Link from "next/link";

/* Self-assessment banner: calm colours, what this is, and why it can be trusted. */

const TRUST = [
  ["feather-check-circle", "Standard screening tools", "PHQ-9, GAD-7, PCL-5 — used by psychologists worldwide"],
  ["feather-award", "Reviewed by psychologists", "Results explained by verified CYT psychologists"],
  ["feather-lock", "Private to you", "Only your score is saved, never your answers"],
  ["feather-shield", "Govt. registered platform", "Health Facility Registry · HFR ID IN0510005384"],
];

const styles = `
.sab { position: relative; overflow: hidden; background: linear-gradient(135deg, #e3f1e8 0%, #f5efe3 55%, #ebeaf8 100%); padding: 40px 0 34px; }
.sab-blob { position: absolute; border-radius: 50%; pointer-events: none; }
.sab-blob.a { width: 340px; height: 340px; right: -100px; top: -130px; background: radial-gradient(circle, rgba(167,214,186,.55), rgba(167,214,186,0)); }
.sab-blob.b { width: 260px; height: 260px; left: -90px; bottom: -130px; background: radial-gradient(circle, rgba(196,190,240,.45), rgba(196,190,240,0)); }
.sab-in { position: relative; z-index: 1; max-width: 1180px; margin: 0 auto; padding: 0 20px; }
.sab-eyebrow { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 800; color: #3f7a58; background: rgba(255,255,255,.7); border: 1px solid rgba(23,60,42,.1); border-radius: 999px; padding: 5px 12px; }
.sab h1 { margin: 12px 0 0; font-size: clamp(28px, 4.2vw, 46px); line-height: 1.12; font-weight: 800; letter-spacing: -.4px; color: #173c2a; font-family: inherit; }
.sab h1 span { display: block; color: #2f8a5b; font-size: .62em; margin-top: 6px; letter-spacing: 0; }
.sab-sub { max-width: 640px; margin: 12px 0 0; font-size: clamp(14.5px, 1.4vw, 17px); line-height: 1.65; color: #4b5b53; }
.sab-trust { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-top: 22px; }
.sab-t { display: flex; gap: 10px; align-items: flex-start; background: rgba(255,255,255,.78); border: 1px solid rgba(23,60,42,.08); border-radius: 14px; padding: 12px; }
.sab-t > i { width: 32px; height: 32px; border-radius: 10px; background: #e7f6ec; color: #1f6b45; display: grid; place-items: center; font-size: 15px; flex-shrink: 0; }
.sab-t b { display: block; font-size: 13.5px; color: #173c2a; }
.sab-t > div > span { display: block; font-size: 11.5px; color: #5b6b62; line-height: 1.45; margin-top: 1px; }
.sab-note { margin: 14px 0 0; font-size: 12.5px; color: #5b6b62; }
.sab-note a { color: #1f6b45 !important; font-weight: 800; }
@media (max-width: 991px) { .sab-trust { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 560px) {
  .sab { padding: 26px 0 22px; }
  .sab-in { padding: 0 16px; }
  .sab-trust { gap: 8px; }
  .sab-t { padding: 10px; align-items: center; } .sab-t > div > span { display: none; } .sab-t b { font-size: 12.5px; }
}
`;

export default function SelfAssessmentBanner() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <section className="sab" aria-labelledby="sab-title">
        <span className="sab-blob a" /><span className="sab-blob b" />
        <div className="sab-in">
          <span className="sab-eyebrow">🌿 Free · 2–10 minutes · Private</span>
          <h1 id="sab-title">Mental Health Self Assessment <span>How am I doing, really?</span></h1>
          <p className="sab-sub">
            Answer a few standard questions about your mood, worry, sleep or stress and get a clear, honest read on where you are —
            what it means, and when talking to a psychologist could help.
          </p>
          <div className="sab-trust">
            {TRUST.map(([icon, title, text]) => (
              <div key={title} className="sab-t"><i className={icon} aria-hidden="true" /><div><b>{title}</b><span>{text}</span></div></div>
            ))}
          </div>
          <p className="sab-note">
            A self-check is not a diagnosis. In a crisis in India call Tele-MANAS <a href="tel:14416">14416</a> (free, 24×7).{" "}
            <Link href="/view-all-therapist">Talk to a psychologist →</Link>
          </p>
        </div>
      </section>
    </>
  );
}
