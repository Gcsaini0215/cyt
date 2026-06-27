import React from "react";
import Link from "next/link";

const qualities = [
  { num: "01", icon: "feather-layers", title: "Holistic Wellness", desc: "We consider every aspect of your life — emotional, social, and psychological — to support true well-being." },
  { num: "02", icon: "feather-smartphone", title: "Easy to Access", desc: "Book therapy from your phone in minutes. No long waits, no gatekeeping — just support when you need it." },
  { num: "03", icon: "feather-user-check", title: "Personalized Care", desc: "Every person is different. We match you with a therapist who fits your specific needs and goals." },
  { num: "04", icon: "feather-award", title: "Qualified Experts", desc: "All our psychologists are verified, licensed professionals with expertise across a wide range of specialties." },
];

export default function ServiceQuality() {
  return (
    <>
      <style>{`
        .sq-section { background: #0f172a; padding: 72px 0; }
        .sq-tag { display: inline-block; font-size: 11px; font-weight: 800; color: #4ade80; letter-spacing: 1.4px; text-transform: uppercase; background: rgba(74,222,128,.12); border: 1px solid rgba(74,222,128,.2); padding: 5px 14px; border-radius: 50px; margin-bottom: 14px; }
        .sq-h2 { font-size: clamp(26px, 3vw, 38px); font-weight: 900; color: #fff; line-height: 1.2; margin: 0 0 12px; }
        .sq-lead { font-size: 15px; color: rgba(255,255,255,.55); line-height: 1.7; margin: 0; }
        .sq-card { background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08); border-radius: 16px; padding: 28px 24px; height: 100%; transition: border-color .2s, background .2s; position: relative; overflow: hidden; }
        .sq-card:hover { border-color: rgba(74,222,128,.35); background: rgba(74,222,128,.05); }
        .sq-card-num { position: absolute; top: 16px; right: 20px; font-size: 42px; font-weight: 900; color: rgba(255,255,255,.04); line-height: 1; }
        .sq-icon { width: 48px; height: 48px; background: rgba(74,222,128,.12); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #4ade80; font-size: 20px; margin-bottom: 18px; }
        .sq-card-title { font-size: 16px; font-weight: 800; color: #fff; margin: 0 0 8px; }
        .sq-card-desc { font-size: 13px; color: rgba(255,255,255,.5); line-height: 1.6; margin: 0; }
        .sq-cta { background: rgba(74,222,128,.08); border: 1px solid rgba(74,222,128,.18); border-radius: 20px; padding: 48px 36px; margin-top: 56px; display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
        .sq-cta-title { font-size: clamp(20px, 2.5vw, 28px); font-weight: 900; color: #fff; margin: 0 0 8px; }
        .sq-cta-sub { font-size: 14px; color: rgba(255,255,255,.5); margin: 0; }
        .sq-btn { display: inline-flex; align-items: center; gap: 10px; background: #16a34a; color: #fff; font-weight: 700; font-size: 14px; padding: 13px 26px; border-radius: 10px; text-decoration: none; transition: background .2s, transform .2s; white-space: nowrap; }
        .sq-btn:hover { background: #15803d; transform: translateY(-2px); color: #fff; }
        @media (max-width: 767px) {
          .sq-section { padding: 48px 0; }
          .sq-cta { padding: 28px 20px; text-align: center; justify-content: center; }
        }
      `}</style>

      <section className="sq-section">
        <div className="container">
          <div className="text-center mb-5">
            <span className="sq-tag">Our Commitment</span>
            <h2 className="sq-h2">Why Thousands Choose <span style={{ color: "#4ade80" }}>CYT</span></h2>
            <p className="sq-lead" style={{ maxWidth: 520, margin: "0 auto" }}>
              We've built every part of our platform with one goal — making quality mental health support genuinely accessible.
            </p>
          </div>

          <div className="row g-3">
            {qualities.map((q) => (
              <div className="col-sm-6 col-lg-3" key={q.num}>
                <div className="sq-card">
                  <div className="sq-card-num">{q.num}</div>
                  <div className="sq-icon"><i className={q.icon}></i></div>
                  <div className="sq-card-title">{q.title}</div>
                  <p className="sq-card-desc">{q.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA strip */}
          <div className="sq-cta">
            <div>
              <div className="sq-cta-title">Are you a therapist? <span style={{ color: "#4ade80" }}>Join our network.</span></div>
              <p className="sq-cta-sub">List your practice, manage bookings, and grow your client base — all in one place.</p>
            </div>
            <Link href="/therapist-registration" className="sq-btn">
              Join Us Today <i className="feather-arrow-right"></i>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
