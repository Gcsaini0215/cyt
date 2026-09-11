import React from "react";

/**
 * About-Us hero — "Pinboard".
 * A Pinterest-style masonry board of pins: a bold statement card, the
 * founder's real portrait, a calm mood photo, and a few stat/quote cards —
 * instead of one full-bleed stock photo. Keeps the `ab-section` class so
 * navbar.js runs it up behind the floating desktop navbar, same as every
 * other hero on the site.
 */
const DEEPAK_IMG = "/assets/img/deepdirec.png";
const MOOD_IMG = "/images/bg5.jpg";

const bannerStyles = `
  *, *::before, *::after { box-sizing: border-box; }

  @keyframes _pb_up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

  .ab-section {
    position: relative;
    background: #fdfbf6;
    color: #1f3320;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    padding: 56px 0 64px;
  }

  .ab-wrap {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 1180px;
    margin: 0 auto;
    padding: 0 clamp(20px, 5vw, 48px);
  }

  .ab-kicker {
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #3c7a4a;
    margin: 0 0 8px;
    display: inline-flex;
    align-items: center;
    gap: 12px;
  }
  .ab-kicker::before { content: ""; width: 28px; height: 2px; background: #c0962f; display: inline-block; }

  .ab-lede {
    margin: 0 0 34px;
    font-family: Georgia, 'Times New Roman', serif;
    font-weight: 600;
    font-size: clamp(1.5rem, 3vw, 1.9rem);
    line-height: 1.3;
    color: #1f3320;
    max-width: 30ch;
  }
  .ab-lede .ab-accent { font-style: italic; color: #3c7a4a; }

  /* ── the board ───────────────────────────────────────── */
  .ab-board { column-count: 3; column-gap: 20px; }
  @media (max-width: 900px) { .ab-board { column-count: 2; } }
  @media (max-width: 560px) { .ab-board { column-count: 1; } }

  .ab-pin {
    break-inside: avoid;
    margin: 0 0 20px;
    border-radius: 20px;
    overflow: hidden;
    animation: _pb_up .5s cubic-bezier(.22,1,.36,1) both;
  }
  .ab-pin:nth-child(2) { animation-delay: .05s; }
  .ab-pin:nth-child(3) { animation-delay: .1s; }
  .ab-pin:nth-child(4) { animation-delay: .15s; }
  .ab-pin:nth-child(5) { animation-delay: .2s; }
  .ab-pin:nth-child(6) { animation-delay: .25s; }

  .ab-pin-statement {
    background: #0f3d24;
    color: #fff;
    padding: 30px 26px;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 22px;
    line-height: 1.4;
    font-weight: 600;
  }
  .ab-pin-statement em { color: #8fd6a8; font-style: italic; }

  .ab-pin-photo { position: relative; line-height: 0; }
  .ab-pin-photo img { width: 100%; display: block; object-fit: cover; }
  .ab-pin-photo.-mood img { aspect-ratio: 4 / 5; }
  .ab-pin-photo.-founder img { aspect-ratio: 4 / 5; object-position: top center; }
  .ab-pin-caption {
    position: absolute; left: 0; right: 0; bottom: 0;
    padding: 26px 16px 12px;
    background: linear-gradient(180deg, transparent, rgba(15, 25, 15, 0.78));
    color: #fff; font-size: 12px; font-weight: 600;
  }

  .ab-pin-quote {
    background: #e2efdc;
    border: 1px solid #cfe0c6;
    padding: 24px 22px;
    font-size: 14px;
    line-height: 1.7;
    color: #35603f;
    font-style: italic;
  }

  .ab-pin-stat {
    background: #fff;
    border: 1px solid #ece6d3;
    padding: 22px;
    text-align: center;
  }
  .ab-pin-stat b {
    display: block;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 32px;
    color: #c0962f;
    line-height: 1;
    margin-bottom: 6px;
  }
  .ab-pin-stat span { font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #4c5b45; }

  .ab-pin-tag {
    background: #fff;
    border: 1px dashed #c9d9c1;
    padding: 16px 20px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: .03em;
    color: #3c7a4a;
    text-align: center;
  }

  @media (prefers-reduced-motion: reduce) { .ab-pin { animation: none; } }
`;

export default function AboutUsBanner() {
  return (
    <>
      {/* dangerouslySetInnerHTML, not a string child: React escapes quotes in
          <style> text children but browsers don't un-escape them, so a
          string child hydration-mismatches and can silently break any rule
          with a quote in it. */}
      <style dangerouslySetInnerHTML={{ __html: bannerStyles }} />

      <section className="ab-section">
        <div className="ab-wrap">
          <span className="ab-kicker">Our Story &amp; Vision</span>
          <h1 className="ab-lede">
            Making mental health support{" "}
            <span className="ab-accent">accessible to every Indian.</span>
          </h1>

          <div className="ab-board">
            <div className="ab-pin ab-pin-statement">
              We believe mental health is a <em>fundamental human right</em> —
              not a privilege.
            </div>

            <figure className="ab-pin ab-pin-photo -founder">
              <img src={DEEPAK_IMG} alt="Dr. Deepak Kumar, Founder &amp; Director at Choose Your Therapist" />
              <figcaption className="ab-pin-caption">Dr. Deepak Kumar — Founder &amp; Director</figcaption>
            </figure>

            <div className="ab-pin ab-pin-stat">
              <b>2020</b>
              <span>Founded</span>
            </div>

            <figure className="ab-pin ab-pin-photo -mood">
              <img src={MOOD_IMG} alt="A calm, open road at sunset" />
              <figcaption className="ab-pin-caption">Every journey starts with one step</figcaption>
            </figure>

            <div className="ab-pin ab-pin-quote">
              &ldquo;We connect individuals with verified psychologists across India
              for online and in-person therapy — because reaching out shouldn&rsquo;t
              be the hardest part.&rdquo;
            </div>

            <div className="ab-pin ab-pin-stat">
              <b>MCA</b>
              <span>&amp; MSME Registered</span>
            </div>

            <div className="ab-pin ab-pin-tag">Noida &middot; Delhi NCR &middot; Online</div>
          </div>
        </div>
      </section>
    </>
  );
}
