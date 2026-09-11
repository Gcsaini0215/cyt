import React from "react";
import { imagePath } from "../../utils/url";

/**
 * Founder's note — a short personal message from Mr. Deepak Kumar, image on
 * one side and the note on the other. Sits right under the hero banner.
 */
// Same photo as his therapist directory card.
const DEEPAK_IMG = `${imagePath}/2bbed01e-4c05-4d99-aa6a-7c1f2053cfa5_profile-picture.jpg`;

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sacramento&display=swap');

  .dn-section {
    background: #fff;
    padding: clamp(48px, 8vw, 84px) 0;
  }
  .dn-wrap {
    max-width: 1080px;
    margin: 0 auto;
    padding: 0 clamp(20px, 5vw, 48px);
    display: grid;
    grid-template-columns: 0.85fr 1.15fr;
    gap: clamp(32px, 6vw, 64px);
    align-items: center;
  }

  .dn-portrait {
    position: relative;
    justify-self: center;
    width: min(320px, 100%);
    aspect-ratio: 3 / 3.6;
    border-radius: 20px;
    overflow: hidden;
    border: 6px solid #f2eee1;
    box-shadow: 0 30px 60px -28px rgba(15, 61, 36, 0.35);
  }
  .dn-portrait img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top center;
  }
  .dn-portrait figcaption {
    position: absolute;
    left: 0; right: 0; bottom: 0;
    padding: 26px 16px 14px;
    background: linear-gradient(180deg, transparent, rgba(15, 25, 15, 0.78));
    color: #fff;
    font-size: 12px;
    font-weight: 600;
    text-align: center;
  }

  .dn-copy { color: #1f3320; }
  .dn-kicker {
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #3c7a4a;
    margin: 0 0 14px;
    display: inline-flex;
    align-items: center;
    gap: 12px;
  }
  .dn-kicker::before { content: ""; width: 28px; height: 2px; background: #d4af37; display: inline-block; }

  .dn-quote-mark {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 64px;
    line-height: 0.5;
    color: #d9e5d2;
    display: block;
    margin-bottom: 8px;
  }

  .dn-note {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: clamp(1.05rem, 1.6vw, 1.28rem);
    line-height: 1.75;
    color: #2b3d2a;
    margin: 0 0 22px;
  }

  .dn-sign-name {
    font-family: 'Sacramento', cursive;
    font-size: 34px;
    line-height: 1;
    color: #0f3d24;
  }
  .dn-sign-role { font-size: 12.5px; color: #6b7a63; margin-top: 6px; }

  @media (max-width: 860px) {
    .dn-wrap { grid-template-columns: 1fr; text-align: center; }
    .dn-kicker { justify-content: center; }
    .dn-quote-mark { text-align: center; }
  }
`;

export default function DirectorNote() {
  return (
    <>
      {/* dangerouslySetInnerHTML, not a string child: React escapes quotes
          in <style> text children but browsers don't un-escape them, so a
          string child hydration-mismatches. */}
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <section className="dn-section">
        <div className="dn-wrap">
          <figure className="dn-portrait">
            <img src={DEEPAK_IMG} alt="Mr. Deepak Kumar, Founder & Director at Choose Your Therapist" />
            <figcaption>Mr. Deepak Kumar — Founder &amp; Director</figcaption>
          </figure>

          <div className="dn-copy">
            <span className="dn-kicker">A Note From Our Founder</span>
            <span className="dn-quote-mark">&ldquo;</span>
            <p className="dn-note">
              When I started Choose Your Therapist in 2020, mental health support in India
              was hard to find, harder to trust, and hardest to afford. I built this platform
              because reaching out for help should never be the hardest part of healing. Every
              therapist on our network is personally verified, every session is confidential,
              and every person who comes to us is met with care — not judgment.
            </p>
            <div className="dn-sign-name">Mr. Deepak Kumar</div>
            <div className="dn-sign-role">Founder &amp; Director, Choose Your Therapist LLP</div>
          </div>
        </div>
      </section>
    </>
  );
}
