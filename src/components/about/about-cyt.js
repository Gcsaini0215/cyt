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

  /* What We Offer — compact chips */
  .ac-chip-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
  .ac-chip {
    background: #fff;
    border: 1px solid #e0ead8;
    border-radius: 18px;
    padding: 20px;
    transition: box-shadow .2s, transform .2s, border-color .2s;
  }
  .ac-chip:hover { box-shadow: 0 16px 40px -24px rgba(31, 51, 28, 0.26); transform: translateY(-3px); border-color: #cfe0c6; }
  .ac-chip-row { display: flex; align-items: center; gap: 11px; margin-bottom: 8px; }
  .ac-chip-ic {
    width: 34px; height: 34px; border-radius: 50%;
    background: #e6f0e0; color: #3c7a4a;
    display: flex; align-items: center; justify-content: center;
    font-size: 15px; flex-shrink: 0;
  }
  .ac-chip-row h3 { margin: 0; font-size: 14.5px; font-weight: 800; color: #1f3320; }
  .ac-chip p { margin: 0; font-size: 12.5px; color: #5a6a52; line-height: 1.6; }

  /* How It Works — zigzag timeline */
  .ac-tl { position: relative; max-width: 780px; margin: 4px auto 0; }
  .ac-tl::before {
    content: ""; position: absolute; left: 50%; top: 12px; bottom: 12px;
    width: 2px; background: #cfe0c6; transform: translateX(-50%);
  }
  .ac-ev { position: relative; width: calc(50% - 36px); margin-bottom: 22px; }
  .ac-ev:last-child { margin-bottom: 0; }
  .ac-ev:nth-child(even) { margin-left: calc(50% + 36px); }
  .ac-ev-dot {
    position: absolute; top: 16px;
    box-sizing: border-box;
    width: 34px; height: 34px; border-radius: 50%;
    background: #3c7a4a; color: #fff; font-weight: 800; font-size: 12px;
    display: flex; align-items: center; justify-content: center;
    border: 4px solid #f5f7ef;
  }
  .ac-ev:nth-child(odd) .ac-ev-dot { right: -53px; }
  .ac-ev:nth-child(even) .ac-ev-dot { left: -53px; }
  .ac-ev-card { background: #fff; border: 1px solid #e0ead8; border-radius: 18px; padding: 18px 20px; }
  .ac-ev-card h3 { margin: 0 0 4px; font-size: 15px; font-weight: 800; color: #1f3320; }
  .ac-ev-card p { margin: 0; font-size: 12.5px; color: #5a6a52; line-height: 1.6; }

  .ac-divider { border: none; border-top: 1px solid #dfe9d6; margin: clamp(34px, 5vw, 52px) 0; }

  .ac-stat-grid, .ac-mile-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
  .ac-stat-grid { margin-bottom: 12px; }

  @media (max-width: 560px) {
    .ac-mile-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 767px) {
    .ac-chip-grid { grid-template-columns: 1fr; }
    .ac-tl { max-width: none; }
    .ac-tl::before { left: 17px; }
    .ac-ev, .ac-ev:nth-child(even) { width: auto; margin-left: 44px; }
    .ac-ev:nth-child(odd) .ac-ev-dot,
    .ac-ev:nth-child(even) .ac-ev-dot { left: -44px; right: auto; }
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
          <div className="ac-chip-grid">
            {services.map((s) => (
              <div className="ac-chip" key={s.title}>
                <div className="ac-chip-row">
                  <span className="ac-chip-ic"><i className={s.icon}></i></span>
                  <h3>{s.title}</h3>
                </div>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>

          <hr className="ac-divider" />

          {/* — How It Works — */}
          <div className="text-center mb-4">
            <span className="ac-tag">How It Works</span>
            <h2 className="ac-h2">Three Steps to <span className="accent">Better Mental Health</span></h2>
          </div>
          <div className="ac-tl">
            {steps.map((s) => (
              <div className="ac-ev" key={s.num}>
                <div className="ac-ev-dot">{s.num}</div>
                <div className="ac-ev-card">
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>
    </>
  );
}
