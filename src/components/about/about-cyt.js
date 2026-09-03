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

  /* Our Story — journey line */
  .ac-story-head { max-width: 640px; margin-bottom: clamp(26px, 4vw, 38px); }
  .ac-story-head .ac-lead + .ac-lead { margin-top: 12px; }

  .ac-journey {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    position: relative;
    margin-bottom: clamp(26px, 4vw, 36px);
  }
  .ac-journey::before {
    content: "";
    position: absolute;
    top: 9px; left: 12%; right: 12%;
    height: 2px;
    background: #cfe0c6;
  }
  .ac-j { text-align: center; padding: 0 10px; }
  .ac-jdot {
    width: 20px; height: 20px;
    border-radius: 50%;
    background: #fff;
    border: 3px solid #3c7a4a;
    margin: 0 auto 12px;
    position: relative;
    z-index: 1;
  }
  .ac-j.active .ac-jdot { background: #3c7a4a; }
  .ac-jy {
    display: block;
    font-family: Georgia, 'Times New Roman', serif;
    font-weight: 700;
    font-size: 0.95rem;
    color: #3c7a4a;
    margin-bottom: 2px;
  }
  .ac-jc { font-size: 14px; font-weight: 800; color: #1f3320; margin: 0 0 3px; }
  .ac-jd { font-size: 11.5px; color: #7d8c74; margin: 0; line-height: 1.45; }

  .ac-statbox {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    border: 1px solid #dde8d3;
    border-radius: 16px;
    overflow: hidden;
  }
  .ac-s { padding: 20px 12px; text-align: center; border-right: 1px solid #dde8d3; }
  .ac-s:last-child { border-right: 0; }
  .ac-sv {
    font-family: Georgia, 'Times New Roman', serif;
    font-weight: 700; font-size: 1.7rem; color: #3c7a4a; line-height: 1;
  }
  .ac-sl {
    font-size: 10px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.1em; color: #8a9a80; margin-top: 4px;
  }

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

  @media (max-width: 767px) {
    .ac-journey { grid-template-columns: 1fr; gap: 20px; }
    .ac-journey::before { display: none; }
    .ac-statbox { grid-template-columns: repeat(2, 1fr); }
    .ac-s:nth-child(2) { border-right: 0; }
    .ac-s:nth-child(1), .ac-s:nth-child(2) { border-bottom: 1px solid #dde8d3; }
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
          <div className="ac-story-head">
            <span className="ac-tag">Our Story</span>
            <h2 className="ac-h2">Born During a Crisis. <span className="accent">Built for India.</span></h2>
            <p className="ac-lead">
              Choose Your Therapist started in 2020 during the pandemic — a response to the surge in mental health struggles when support systems were collapsing.
            </p>
            <p className="ac-lead">
              By 2021 we registered under MCA &amp; MSME and expanded from Haridwar to Delhi NCR, adding online therapy to reach anyone, anywhere.
            </p>
          </div>

          <div className="ac-journey">
            {milestones.map((m) => (
              <div key={m.city} className={`ac-j${m.active ? " active" : ""}`}>
                <div className="ac-jdot" />
                <span className="ac-jy">{m.year}</span>
                <div className="ac-jc">{m.city}</div>
                <p className="ac-jd">{m.desc}</p>
              </div>
            ))}
          </div>

          <div className="ac-statbox">
            {stats.map((s) => (
              <div key={s.label} className="ac-s">
                <div className="ac-sv">{s.value}</div>
                <div className="ac-sl">{s.label}</div>
              </div>
            ))}
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
