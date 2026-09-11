import React from "react";

export default function ServiceQuality() {
  return (
    <>
      {/* dangerouslySetInnerHTML, not a string child: React escapes quotes
          in <style> text children but browsers don't un-escape them, so a
          string child hydration-mismatches and silently breaks any rule
          with a quote in it (content: ""; here included). */}
      <style dangerouslySetInnerHTML={{ __html: `
        .sq-section { background: #0f172a; padding: 72px 0; }
        .sq-tag { display: inline-block; font-size: 11px; font-weight: 800; color: #4ade80; letter-spacing: 1.4px; text-transform: uppercase; background: rgba(74,222,128,.12); border: 1px solid rgba(74,222,128,.2); padding: 5px 14px; border-radius: 50px; margin-bottom: 14px; }
        .sq-h2 { font-size: clamp(26px, 3vw, 38px); font-weight: 900; color: #fff; line-height: 1.2; margin: 0 0 12px; }
        .sq-lead { font-size: 15px; color: rgba(255,255,255,.55); line-height: 1.7; margin: 0; }

        .sq-cols { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(28px, 5vw, 56px); position: relative; margin-top: 48px; }
        .sq-cols::before { content: ""; position: absolute; top: 4px; bottom: 4px; left: 50%; width: 1px; background: rgba(255,255,255,.1); }
        .sq-col h3 { font-size: 13px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: #d4af37; margin: 0 0 14px; padding-bottom: 10px; border-bottom: 2px solid rgba(212,175,55,.4); display: inline-block; }
        .sq-col p { font-size: 14.5px; line-height: 1.85; color: rgba(255,255,255,.62); margin: 0 0 16px; }
        .sq-col p:last-child { margin-bottom: 0; }
        @media (max-width: 820px) {
          .sq-cols { grid-template-columns: 1fr; gap: 36px; }
          .sq-cols::before { display: none; }
        }

        .sq-cta { background: rgba(74,222,128,.08); border: 1px solid rgba(74,222,128,.18); border-radius: 16px; padding: 36px 28px; margin-top: 48px; display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; }
        .sq-cta-title { font-size: clamp(18px, 2.5vw, 26px); font-weight: 900; color: #fff; margin: 0 0 6px; }
        .sq-cta-sub { font-size: 13px; color: rgba(255,255,255,.5); margin: 0; }
        .sq-btn { display: inline-flex; align-items: center; gap: 10px; background: #16a34a; color: #fff; font-weight: 700; font-size: 14px; padding: 12px 24px; border-radius: 10px; text-decoration: none; transition: background .2s, transform .2s; white-space: nowrap; }
        .sq-btn:hover { background: #15803d; transform: translateY(-2px); color: #fff; }
        @media (max-width: 767px) {
          .sq-section { padding: 40px 0; }
          .sq-cta { padding: 24px 16px; text-align: center; justify-content: center; }
          .sq-cta-title { font-size: 18px; }
        }
      ` }} />

      <section className="sq-section">
        <div className="container">
          <div className="text-center mb-5">
            <span className="sq-tag">About The Platform</span>
            <h2 className="sq-h2">What Choose Your Therapist <span style={{ color: "#4ade80" }}>Stands For</span></h2>
          </div>

          <div className="sq-cols">
            <div className="sq-col">
              <h3>Who We Are</h3>
              <p>
                Choose Your Therapist (CYT) was founded in 2020, at a time when India was
                facing an unprecedented mental health crisis brought on by the pandemic. What
                began as a small effort to connect people with therapists has grown into a
                structured, MCA &amp; MSME registered mental health platform, built on one
                simple belief — that quality psychological support should be within everyone's
                reach, not just a privileged few.
              </p>
              <p>
                We work with individuals, couples, and families across every stage of life —
                from students navigating academic pressure to professionals managing burnout,
                from couples working through conflict to parents seeking guidance for their
                children. Every person who comes to CYT is met with the same standard of care:
                confidential, non-judgmental, and genuinely attentive.
              </p>
            </div>

            <div className="sq-col">
              <h3>What We Offer</h3>
              <p>
                At the heart of CYT is a growing network of verified psychologists,
                counsellors, and psychiatrists, each screened for their qualifications,
                licenses, and clinical experience before they're allowed to see a single
                client. Sessions are available online — by video or audio call, from anywhere
                in the world — or in person at our clinical spaces in Noida and Delhi NCR.
              </p>
              <p>
                Beyond one-on-one therapy, CYT runs workshops and awareness programs, a
                structured internship and supervision track for psychology students, and a
                pro bono counselling initiative for those who cannot afford paid sessions.
                Whether it's a first session or a long-term therapeutic relationship, our
                goal stays the same — making the first step towards help the easiest one.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
