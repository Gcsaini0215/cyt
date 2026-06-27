import Link from "next/link";

const milestones = [
  { year: "2020", city: "Haridwar", desc: "Founded during the pandemic", done: true },
  { year: "2021", city: "Dehradun", desc: "Registered under MCA & MSME", done: true },
  { year: "Now", city: "Noida & Delhi", desc: "In-Person Therapy Hubs", active: true },
  { year: "Global", city: "Worldwide", desc: "Online Support for Everyone", global: true },
];

const stats = [
  { value: "10k+", label: "Sessions" },
  { value: "50+", label: "Experts" },
  { value: "4.9★", label: "Rating" },
  { value: "4+", label: "Cities" },
];

const services = [
  { icon: "feather-users", title: "In-Person Therapy", desc: "Dedicated clinical spaces in Noida and Delhi NCR for face-to-face sessions." },
  { icon: "feather-video", title: "Online Worldwide", desc: "Seamless video/audio consultations available globally for complete flexibility." },
  { icon: "feather-shield", title: "Verified Experts", desc: "Network of certified psychologists committed to your mental health journey." },
];

const steps = [
  { num: "01", icon: "feather-search", title: "Discover", desc: "Browse 50+ verified psychologists based on your specific needs and preferences." },
  { num: "02", icon: "feather-calendar", title: "Select", desc: "Book a session at your convenience — online or in-person, whatever works for you." },
  { num: "03", icon: "feather-heart", title: "Heal", desc: "Start your sessions in a safe, confidential space and grow toward a better you." },
];

export default function AboutCyt() {
  return (
    <>
      <style>{`
        .ac-section { background: #f8fafc; padding: 56px 0; }
        .ac-tag { display: inline-block; font-size: 11px; font-weight: 800; color: #16a34a; letter-spacing: 1.4px; text-transform: uppercase; background: #dcfce7; padding: 5px 14px; border-radius: 50px; margin-bottom: 12px; }
        .ac-h2 { font-size: clamp(22px, 3vw, 34px); font-weight: 900; color: #0f172a; line-height: 1.2; margin: 0 0 12px; }
        .ac-lead { font-size: 14px; color: #64748b; line-height: 1.7; margin: 0; }
        .ac-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px 18px; transition: box-shadow .2s, transform .2s; }
        .ac-card:hover { box-shadow: 0 8px 32px rgba(22,163,74,.10); transform: translateY(-3px); border-color: #bbf7d0; }
        .ac-icon { width: 44px; height: 44px; background: #f0fdf4; border-radius: 11px; display: flex; align-items: center; justify-content: center; color: #16a34a; font-size: 18px; margin-bottom: 14px; flex-shrink: 0; }
        .ac-card-title { font-size: 15px; font-weight: 800; color: #0f172a; margin: 0 0 5px; }
        .ac-card-desc { font-size: 13px; color: #64748b; line-height: 1.6; margin: 0; }
        .ac-stat-val { font-size: 26px; font-weight: 900; color: #16a34a; line-height: 1; margin-bottom: 2px; }
        .ac-stat-lbl { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
        .ac-milestone { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 12px; text-align: center; }
        .ac-milestone.done { border-color: #bbf7d0; }
        .ac-milestone.active { border-color: #16a34a; box-shadow: 0 0 0 3px rgba(22,163,74,.10); }
        .ac-milestone-yr { font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 20px; background: #f1f5f9; color: #64748b; display: inline-block; margin-bottom: 8px; }
        .ac-milestone.done .ac-milestone-yr { background: #dcfce7; color: #166534; }
        .ac-milestone.active .ac-milestone-yr { background: #16a34a; color: #fff; }
        .ac-milestone.global .ac-milestone-yr { background: #eff6ff; color: #3b82f6; }
        .ac-milestone-city { font-size: 13px; font-weight: 800; color: #0f172a; margin: 0 0 3px; }
        .ac-milestone-desc { font-size: 11px; color: #94a3b8; margin: 0; line-height: 1.4; }
        .ac-step { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 24px 18px; text-align: center; position: relative; height: 100%; }
        .ac-step-num { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: #16a34a; color: #fff; font-size: 11px; font-weight: 900; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #f8fafc; }
        .ac-step-icon { width: 48px; height: 48px; background: #f0fdf4; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #16a34a; font-size: 20px; margin: 8px auto 14px; }
        .ac-step-title { font-size: 16px; font-weight: 800; color: #0f172a; margin: 0 0 6px; }
        .ac-step-desc { font-size: 13px; color: #64748b; line-height: 1.6; margin: 0; }
        .ac-divider { border: none; border-top: 1px solid #e2e8f0; margin: 44px 0; }
        .ac-service-row { display: flex; align-items: flex-start; gap: 14px; }

        @media (max-width: 767px) {
          .ac-section { padding: 40px 0; }
          .ac-divider { margin: 32px 0; }
          .ac-steps-row { display: flex; flex-direction: column; gap: 20px; }
          .ac-steps-row > div { width: 100%; }
        }
      `}</style>

      <section className="ac-section">
        <div className="container">

          {/* — Our Story — */}
          <div className="row g-4 mb-2">
            <div className="col-12 col-lg-5">
              <span className="ac-tag">Our Story</span>
              <h2 className="ac-h2">Born During a Crisis. <span style={{ color: "#16a34a" }}>Built for India.</span></h2>
              <p className="ac-lead" style={{ marginBottom: 14 }}>
                Choose Your Therapist started in 2020 during the pandemic — a response to the surge in mental health struggles when support systems were collapsing.
              </p>
              <p className="ac-lead">
                By 2021 we registered under MCA & MSME and expanded from Haridwar to Delhi NCR, adding online therapy to reach anyone, anywhere.
              </p>
            </div>
            <div className="col-12 col-lg-7">
              {/* Stats — 4 in a row on all sizes */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 12 }}>
                {stats.map((s) => (
                  <div key={s.label} className="ac-card text-center" style={{ padding: "16px 8px" }}>
                    <div className="ac-stat-val">{s.value}</div>
                    <div className="ac-stat-lbl">{s.label}</div>
                  </div>
                ))}
              </div>
              {/* Milestones — 4 in a row on all sizes */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                {milestones.map((m) => (
                  <div key={m.city} className={`ac-milestone${m.done ? " done" : ""}${m.active ? " active" : ""}${m.global ? " global" : ""}`}>
                    <div className="ac-milestone-yr">{m.year}</div>
                    <div className="ac-milestone-city">{m.city}</div>
                    <div className="ac-milestone-desc">{m.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <hr className="ac-divider" />

          {/* — What We Offer — */}
          <div className="text-center mb-4">
            <span className="ac-tag">What We Offer</span>
            <h2 className="ac-h2">Therapy That Fits <span style={{ color: "#16a34a" }}>Your Life</span></h2>
          </div>
          <div className="row g-3 mb-2">
            {services.map((s) => (
              <div className="col-12 col-md-4" key={s.title}>
                <div className="ac-card h-100">
                  <div className="ac-service-row">
                    <div className="ac-icon"><i className={s.icon}></i></div>
                    <div>
                      <div className="ac-card-title">{s.title}</div>
                      <p className="ac-card-desc">{s.desc}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <hr className="ac-divider" />

          {/* — How It Works — */}
          <div className="text-center mb-4">
            <span className="ac-tag">How It Works</span>
            <h2 className="ac-h2">Three Steps to <span style={{ color: "#16a34a" }}>Better Mental Health</span></h2>
          </div>
          <div className="row g-3">
            {steps.map((s) => (
              <div className="col-12 col-md-4" key={s.num}>
                <div className="ac-step">
                  <div className="ac-step-num">{s.num}</div>
                  <div className="ac-step-icon"><i className={s.icon}></i></div>
                  <div className="ac-step-title">{s.title}</div>
                  <p className="ac-step-desc">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>
    </>
  );
}
