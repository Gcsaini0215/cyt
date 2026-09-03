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

/* "Soft Organic" — rounded cards & arches on a warm sage field, serif headings. */
const styles = `
  .ac-section {
    position: relative;
    overflow: hidden;
    background: #f5f7ef;
    padding: clamp(48px, 7vw, 84px) 0;
  }
  .ac-section::before {
    content: "";
    position: absolute;
    width: 460px; height: 460px;
    border-radius: 50%;
    background: #e7f0e1;
    right: -180px; top: 60px;
    pointer-events: none;
  }
  .ac-section .container { position: relative; z-index: 1; }

  .ac-tag {
    display: inline-block;
    font-size: 11px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase;
    color: #35603f;
    background: #e2efdc;
    border: 1px solid #cfe0c6;
    padding: 5px 14px;
    border-radius: 999px;
    margin-bottom: 12px;
  }
  .ac-h2 {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: clamp(23px, 3vw, 34px);
    font-weight: 600;
    color: #1f3320;
    line-height: 1.22;
    letter-spacing: -0.01em;
    margin: 0 0 12px;
  }
  .ac-h2 .accent { font-style: italic; color: #3c7a4a; }
  .ac-lead { font-size: 14.5px; color: #5a6a52; line-height: 1.75; margin: 0; }

  .ac-story-card {
    background: #fff;
    border: 1px solid #e0ead8;
    border-radius: 26px;
    padding: clamp(22px, 3vw, 34px);
    height: 100%;
    box-shadow: 0 22px 44px -34px rgba(31, 51, 28, 0.35);
  }

  .ac-pill {
    background: #eef4e9;
    border: 1px solid #d8e6cf;
    border-radius: 18px;
    padding: 16px 10px;
    text-align: center;
  }
  .ac-stat-val {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 24px; font-weight: 700; color: #3c7a4a; line-height: 1; margin-bottom: 3px;
  }
  .ac-stat-lbl { font-size: 10px; font-weight: 700; color: #8a9a80; text-transform: uppercase; letter-spacing: 0.1em; }

  .ac-milestone {
    background: #fff;
    border: 1px solid #e0ead8;
    border-radius: 18px;
    padding: 16px 12px;
    text-align: center;
  }
  .ac-milestone.active { border-color: #b7d5bd; box-shadow: 0 0 0 3px rgba(60, 122, 74, 0.10); }
  .ac-milestone-yr {
    font-size: 10px; font-weight: 800; padding: 3px 10px; border-radius: 999px;
    background: #eef4e9; color: #5a6a52; display: inline-block; margin-bottom: 8px;
  }
  .ac-milestone.done .ac-milestone-yr { background: #e2efdc; color: #35603f; }
  .ac-milestone.active .ac-milestone-yr { background: #3c7a4a; color: #fff; }
  .ac-milestone.global .ac-milestone-yr { background: #eef2e6; color: #7d8c74; }
  .ac-milestone-city { font-size: 13px; font-weight: 800; color: #1f3320; margin: 0 0 3px; }
  .ac-milestone-desc { font-size: 11px; color: #8a9a80; margin: 0; line-height: 1.4; }

  .ac-card {
    background: #fff;
    border: 1px solid #e0ead8;
    border-radius: 22px;
    padding: 24px 22px;
    height: 100%;
    transition: box-shadow .2s, transform .2s, border-color .2s;
  }
  .ac-card:hover { box-shadow: 0 16px 40px -22px rgba(31, 51, 28, 0.28); transform: translateY(-3px); border-color: #cfe0c6; }
  .ac-icon {
    width: 46px; height: 46px;
    background: #e6f0e0;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: #3c7a4a; font-size: 18px; margin-bottom: 14px; flex-shrink: 0;
  }
  .ac-card-title { font-size: 15px; font-weight: 800; color: #1f3320; margin: 0 0 5px; }
  .ac-card-desc { font-size: 13px; color: #5a6a52; line-height: 1.6; margin: 0; }
  .ac-service-row { display: flex; align-items: flex-start; gap: 14px; }

  .ac-step {
    background: #fff;
    border: 1px solid #e0ead8;
    border-radius: 22px;
    padding: 28px 20px 24px;
    text-align: center;
    position: relative;
    height: 100%;
  }
  .ac-step-num {
    position: absolute; top: -13px; left: 50%; transform: translateX(-50%);
    background: #3c7a4a; color: #fff;
    font-size: 11px; font-weight: 800;
    width: 28px; height: 28px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    border: 4px solid #f5f7ef;
  }
  .ac-step-icon {
    width: 50px; height: 50px;
    background: #e6f0e0; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: #3c7a4a; font-size: 20px; margin: 10px auto 14px;
  }
  .ac-step-title { font-size: 16px; font-weight: 800; color: #1f3320; margin: 0 0 6px; }
  .ac-step-desc { font-size: 13px; color: #5a6a52; line-height: 1.6; margin: 0; }

  .ac-divider { border: none; border-top: 1px solid #dfe9d6; margin: clamp(34px, 5vw, 52px) 0; }

  .ac-stat-grid, .ac-mile-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
  .ac-stat-grid { margin-bottom: 12px; }

  @media (max-width: 560px) {
    .ac-mile-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 767px) {
    .ac-steps-row { display: flex; flex-direction: column; gap: 22px; }
    .ac-steps-row > div { width: 100%; }
  }
`;

export default function AboutCyt() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <section className="ac-section">
        <div className="container">

          {/* — Our Story — */}
          <div className="row g-4 align-items-stretch mb-2">
            <div className="col-12 col-lg-5">
              <div className="ac-story-card">
                <span className="ac-tag">Our Story</span>
                <h2 className="ac-h2">Born During a Crisis. <span className="accent">Built for India.</span></h2>
                <p className="ac-lead" style={{ marginBottom: 14 }}>
                  Choose Your Therapist started in 2020 during the pandemic — a response to the surge in mental health struggles when support systems were collapsing.
                </p>
                <p className="ac-lead">
                  By 2021 we registered under MCA &amp; MSME and expanded from Haridwar to Delhi NCR, adding online therapy to reach anyone, anywhere.
                </p>
              </div>
            </div>
            <div className="col-12 col-lg-7">
              <div className="ac-stat-grid">
                {stats.map((s) => (
                  <div key={s.label} className="ac-pill">
                    <div className="ac-stat-val">{s.value}</div>
                    <div className="ac-stat-lbl">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="ac-mile-grid">
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
            <h2 className="ac-h2">Therapy That Fits <span className="accent">Your Life</span></h2>
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
            <h2 className="ac-h2">Three Steps to <span className="accent">Better Mental Health</span></h2>
          </div>
          <div className="row g-3 ac-steps-row">
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
