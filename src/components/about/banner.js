import React from "react";

/**
 * About-Us hero — "Outline Headline".
 * A solid brand-green field. The first half of the headline is set in
 * outline (stroked) type, the payoff phrase is filled — stark and confident.
 * The section keeps the `ab-section` class so navbar.js runs it up behind
 * the floating desktop navbar.
 */
const bannerStyles = `
  *, *::before, *::after { box-sizing: border-box; }

  @keyframes _ohb_up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

  .ab-section {
    position: relative;
    min-height: 88vh;
    display: flex;
    align-items: stretch;
    overflow: hidden;
    background:
      radial-gradient(130% 100% at 12% 8%, #2a9462 0%, rgba(42, 148, 98, 0) 55%),
      radial-gradient(120% 90% at 100% 100%, #1a6b43 0%, rgba(26, 107, 67, 0) 50%),
      #1f7a4d;
    color: #eafff3;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .ab-content {
    position: relative;
    z-index: 2;
    width: 100%;
    max-width: 1180px;
    margin: 0 auto;
    padding: 72px clamp(22px, 5vw, 80px) 76px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
  }

  .ab-kicker {
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #bfe8cf;
    margin: 0 0 26px;
    display: inline-flex;
    align-items: center;
    gap: 12px;
    animation: _ohb_up .6s cubic-bezier(.22, 1, .36, 1) both;
  }
  .ab-kicker::before {
    content: "";
    width: 30px;
    height: 2px;
    background: #7ff0bd;
    display: inline-block;
  }

  .ab-h1 {
    margin: 0;
    font-weight: 800;
    line-height: 1.06;
    letter-spacing: -0.012em;
    font-size: clamp(2.15rem, 6.2vw, 5rem);
    color: #eafff3;
    max-width: 15ch;
    animation: _ohb_up .6s cubic-bezier(.22, 1, .36, 1) .06s both;
  }
  .ab-h1 .ab-fill { color: #eafff3; }
  @supports ((-webkit-text-stroke: 1px #fff) or (text-stroke: 1px #fff)) {
    .ab-h1 .ab-stroke {
      color: transparent;
      -webkit-text-stroke: 1.6px rgba(234, 255, 243, 0.92);
      text-stroke: 1.6px rgba(234, 255, 243, 0.92);
    }
  }

  .ab-sub {
    margin: 30px 0 0;
    max-width: 46ch;
    font-size: clamp(0.95rem, 1.1vw, 1.08rem);
    line-height: 1.7;
    font-weight: 500;
    color: rgba(234, 255, 243, 0.82);
    animation: _ohb_up .6s cubic-bezier(.22, 1, .36, 1) .12s both;
  }

  .ab-chips {
    margin-top: 28px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    animation: _ohb_up .6s cubic-bezier(.22, 1, .36, 1) .18s both;
  }
  .ab-chips span {
    font-size: 12px;
    font-weight: 600;
    padding: 8px 15px;
    border-radius: 999px;
    border: 1px solid rgba(234, 255, 243, 0.38);
    color: #eafff3;
    white-space: nowrap;
  }

  @media (max-width: 991px) {
    .ab-section { min-height: 0; }
  }
  @media (max-width: 768px) {
    .ab-content { padding: 46px 20px 54px; }
    .ab-h1 { font-size: clamp(2rem, 8.6vw, 3rem); max-width: none; }
    .ab-sub { font-size: 14px; margin-top: 22px; }
    .ab-kicker { margin-bottom: 18px; letter-spacing: 0.16em; }
    .ab-chips span { font-size: 11.5px; padding: 7px 13px; }
  }
  @media (max-width: 600px) {
    .ab-h1 .ab-stroke {
      color: #eafff3 !important;
      -webkit-text-stroke: 0 !important;
      text-stroke: 0 !important;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .ab-kicker, .ab-h1, .ab-sub, .ab-chips { animation: none; }
  }
`;

export default function AboutUsBanner() {
  return (
    <>
      <style>{bannerStyles}</style>

      <section className="ab-section">
        <div className="ab-content">
          <span className="ab-kicker">Our Story &amp; Vision</span>

          <h1 className="ab-h1">
            <span className="ab-stroke">Making Mental Health Support</span>{" "}
            <span className="ab-fill">Accessible to Every Indian</span>
          </h1>

          <p className="ab-sub">
            At CYT, we believe mental health is a fundamental human right. We connect
            individuals with verified psychologists across India for online and in-person therapy.
          </p>

          <div className="ab-chips">
            <span>Founded 2020</span>
            <span>MCA &amp; MSME registered</span>
            <span>Noida &middot; Delhi NCR &middot; Online</span>
            <span>50+ verified experts</span>
          </div>
        </div>
      </section>
    </>
  );
}
