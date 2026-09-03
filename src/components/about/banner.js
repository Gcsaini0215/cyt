import React from "react";

/**
 * About-Us hero — "Soft Organic".
 * A calm sage field with rounded blob shapes, the founder's portrait tucked
 * into an arch, and a serif headline. Keeps the `ab-section` class so
 * navbar.js runs it up behind the floating desktop navbar.
 */
const DEEPAK_IMG = "/assets/img/deepdirec.png";

const bannerStyles = `
  *, *::before, *::after { box-sizing: border-box; }

  @keyframes _so_up  { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes _so_pop { from { opacity: 0; transform: scale(0.94); } to { opacity: 1; transform: scale(1); } }

  .ab-section {
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background: #eef2e6;
    color: #1f3320;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  .ab-section::before {
    content: "";
    position: absolute;
    width: 560px; height: 560px;
    border-radius: 50%;
    background: #dcebd6;
    right: -170px; top: -190px;
    pointer-events: none;
  }
  .ab-section::after {
    content: "";
    position: absolute;
    width: 320px; height: 320px;
    border-radius: 50%;
    background: #e4efde;
    left: -150px; bottom: -170px;
    pointer-events: none;
  }
  @media (min-width: 992px) {
    .ab-section { min-height: 84vh; }
  }

  .ab-wrap {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 1180px;
    margin: 0 auto;
    padding: 56px clamp(22px, 5vw, 72px) 72px;
    display: grid;
    grid-template-columns: 1.08fr 0.92fr;
    gap: clamp(28px, 5vw, 60px);
    align-items: center;
  }

  .ab-kicker {
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #3c7a4a;
    margin: 0 0 18px;
    display: inline-flex;
    align-items: center;
    gap: 12px;
    animation: _so_up .55s cubic-bezier(.22, 1, .36, 1) both;
  }
  .ab-kicker::before {
    content: "";
    width: 28px;
    height: 2px;
    background: #c0962f;
    display: inline-block;
  }

  .ab-h1 {
    margin: 0;
    font-family: Georgia, 'Times New Roman', serif;
    font-weight: 600;
    line-height: 1.12;
    letter-spacing: -0.01em;
    font-size: clamp(2.1rem, 5vw, 3.7rem);
    color: #1f3320;
    max-width: 16ch;
    animation: _so_up .55s cubic-bezier(.22, 1, .36, 1) .05s both;
  }
  .ab-h1 .ab-accent { font-style: italic; color: #3c7a4a; }

  .ab-sub {
    margin: 20px 0 0;
    max-width: 44ch;
    font-size: clamp(0.95rem, 1.1vw, 1.06rem);
    line-height: 1.72;
    font-weight: 500;
    color: #4c5b45;
    animation: _so_up .55s cubic-bezier(.22, 1, .36, 1) .1s both;
  }

  .ab-chips {
    margin-top: 24px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    animation: _so_up .55s cubic-bezier(.22, 1, .36, 1) .15s both;
  }
  .ab-chips span {
    font-size: 12px;
    font-weight: 600;
    padding: 8px 15px;
    border-radius: 999px;
    background: #e2efdc;
    border: 1px solid #cfe0c6;
    color: #35603f;
    white-space: nowrap;
  }

  .ab-portrait {
    position: relative;
    justify-self: center;
    margin: 0;
    width: min(330px, 82%);
    aspect-ratio: 3 / 3.8;
    border-radius: 1000px 1000px 30px 30px;
    overflow: hidden;
    border: 7px solid #fff;
    box-shadow: 0 30px 60px -28px rgba(31, 51, 28, 0.42);
    animation: _so_pop .6s cubic-bezier(.22, 1, .36, 1) .12s both;
  }
  .ab-portrait img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top center;
    filter: saturate(1.03) contrast(1.02);
  }
  .ab-portrait figcaption {
    position: absolute;
    left: 0; right: 0; bottom: 0;
    padding: 30px 16px 14px;
    background: linear-gradient(180deg, transparent, rgba(20, 40, 22, 0.74));
    color: #fff;
    font-size: 12px;
    font-weight: 600;
    text-align: center;
  }

  @media (max-width: 860px) {
    .ab-wrap { grid-template-columns: 1fr; padding: 42px 20px 54px; }
    .ab-h1 { max-width: none; }
    .ab-portrait { width: min(280px, 72%); margin-top: 8px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .ab-kicker, .ab-h1, .ab-sub, .ab-chips, .ab-portrait { animation: none; }
  }
`;

export default function AboutUsBanner() {
  return (
    <>
      {/* dangerouslySetInnerHTML: a text-node <style> escapes quotes differently
          on server vs client and trips a hydration mismatch. */}
      <style dangerouslySetInnerHTML={{ __html: bannerStyles }} />

      <section className="ab-section">
        <div className="ab-wrap">
          <div className="ab-copy">
            <span className="ab-kicker">Our Story &amp; Vision</span>

            <h1 className="ab-h1">
              Making Mental Health Support{" "}
              <span className="ab-accent">Accessible to Every Indian</span>
            </h1>

            <p className="ab-sub">
              At CYT, we believe mental health is a fundamental human right. We connect
              individuals with verified psychologists across India for online and in-person therapy.
            </p>

            <div className="ab-chips">
              <span>Founded 2020</span>
              <span>MCA &amp; MSME registered</span>
              <span>Noida &middot; Delhi NCR &middot; Online</span>
            </div>
          </div>

          <figure className="ab-portrait">
            <img
              src={DEEPAK_IMG}
              alt="Dr. Deepak Kumar, Founder &amp; Director at Choose Your Therapist"
            />
            <figcaption>Dr. Deepak Kumar &mdash; Founder &amp; Director</figcaption>
          </figure>
        </div>
      </section>
    </>
  );
}
