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
        .sq-card { background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08); border-radius: 14px; padding: 20px 18px; height: 100%; transition: border-color .2s, background .2s; position: relative; overflow: hidden; display: flex; align-items: flex-start; gap: 14px; }
        .sq-card:hover { border-color: rgba(74,222,128,.35); background: rgba(74,222,128,.05); }
        .sq-icon { width: 44px; height: 44px; background: rgba(74,222,128,.12); border-radius: 11px; display: flex; align-items: center; justify-content: center; color: #4ade80; font-size: 18px; flex-shrink: 0; }
        .sq-card-title { font-size: 15px; font-weight: 800; color: #fff; margin: 0 0 5px; }
        .sq-card-desc { font-size: 13px; color: rgba(255,255,255,.5); line-height: 1.6; margin: 0; }
        .sq-cta { background: rgba(74,222,128,.08); border: 1px solid rgba(74,222,128,.18); border-radius: 16px; padding: 36px 28px; margin-top: 44px; display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; }
        .sq-cta-title { font-size: clamp(18px, 2.5vw, 26px); font-weight: 900; color: #fff; margin: 0 0 6px; }
        .sq-cta-sub { font-size: 13px; color: rgba(255,255,255,.5); margin: 0; }
        .sq-btn { display: inline-flex; align-items: center; gap: 10px; background: #16a34a; color: #fff; font-weight: 700; font-size: 14px; padding: 12px 24px; border-radius: 10px; text-decoration: none; transition: background .2s, transform .2s; white-space: nowrap; }
        .sq-btn:hover { background: #15803d; transform: translateY(-2px); color: #fff; }
        @media (max-width: 767px) {
          .sq-section { padding: 40px 0; }
          .sq-cta { padding: 24px 16px; text-align: center; justify-content: center; }
          .sq-cta-title { font-size: 18px; }
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
              <div className="col-12 col-sm-6 col-lg-3" key={q.num}>
                <div className="sq-card">
                  <div className="sq-icon"><i className={q.icon}></i></div>
                  <div>
                    <div className="sq-card-title">{q.title}</div>
                    <p className="sq-card-desc">{q.desc}</p>
                  </div>
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
