import React, { useEffect, useState } from "react";

/**
 * About-Us hero — "Strip Divider".
 * Copy on warm paper up top, a thin full-bleed band of verified-therapist
 * faces slicing across the middle, and the proof stats sitting below it.
 * Keeps the `ab-section` class so navbar.js runs it up behind the floating
 * desktop navbar.
 */
const API =
  "https://api.chooseyourtherapist.in/api/get-therapists-profile?pageSize=60";
const IMG_BASE = "https://api.chooseyourtherapist.in/uploads/images/";
const STRIP_COUNT = 16;

const STATS = [
  ["10k+", "Sessions"],
  ["50+", "Experts"],
  ["4.9★", "Rating"],
  ["4+", "Cities"],
];

const bannerStyles = `
  *, *::before, *::after { box-sizing: border-box; }

  @keyframes _sd_up { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }

  .ab-section {
    position: relative;
    min-height: 86vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: #f4f6ee;
    color: #10231a;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .ab-top {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    max-width: 1180px;
    margin: 0 auto;
    padding: 40px clamp(22px, 5vw, 80px) 46px;
  }

  .ab-kicker {
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #1f7a4d;
    margin: 0 0 18px;
    display: inline-flex;
    align-items: center;
    gap: 12px;
    animation: _sd_up .55s cubic-bezier(.22, 1, .36, 1) both;
  }
  .ab-kicker::before {
    content: "";
    width: 30px;
    height: 2px;
    background: #c0962f;
    display: inline-block;
  }

  .ab-h1 {
    margin: 0;
    font-weight: 800;
    line-height: 1.09;
    letter-spacing: -0.012em;
    font-size: clamp(2rem, 4.8vw, 3.6rem);
    color: #10231a;
    max-width: 20ch;
    animation: _sd_up .55s cubic-bezier(.22, 1, .36, 1) .05s both;
  }
  .ab-h1 .ab-accent { color: #1f7a4d; }

  .ab-sub {
    margin: 16px 0 0;
    max-width: 54ch;
    font-size: clamp(0.95rem, 1.1vw, 1.06rem);
    line-height: 1.7;
    font-weight: 500;
    color: #40544a;
    animation: _sd_up .55s cubic-bezier(.22, 1, .36, 1) .1s both;
  }

  .ab-strip {
    display: flex;
    overflow: hidden;
    border-top: 1px solid #1f7a4d;
    border-bottom: 1px solid #1f7a4d;
    background: #10231a;
  }
  .ab-strip.is-empty {
    height: 3px;
    background: #1f7a4d;
    border: 0;
  }
  .ab-strip img {
    flex: 1 1 0;
    min-width: 0;
    height: clamp(92px, 11vw, 132px);
    object-fit: cover;
    object-position: top center;
    filter: grayscale(0.55) sepia(0.22) hue-rotate(78deg) saturate(1.05) contrast(1.02);
    opacity: 0.92;
  }

  .ab-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    width: 100%;
    max-width: 1180px;
    margin: 0 auto;
  }
  .ab-stat {
    padding: clamp(20px, 3vw, 34px) 12px;
    text-align: center;
    border-right: 1px solid #dfe6d7;
  }
  .ab-stat:last-child { border-right: 0; }
  .ab-stat-v {
    font-family: Georgia, 'Times New Roman', serif;
    font-weight: 600;
    font-size: clamp(1.7rem, 3.4vw, 2.6rem);
    color: #1f7a4d;
    letter-spacing: -0.01em;
    line-height: 1;
  }
  .ab-stat-l {
    margin-top: 6px;
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    color: #8a9a8e;
  }

  @media (max-width: 991px) {
    .ab-section { min-height: 0; }
  }
  @media (max-width: 640px) {
    .ab-top { padding: 34px 20px 38px; }
    .ab-h1 { font-size: clamp(1.9rem, 8vw, 2.6rem); max-width: none; }
    .ab-strip img { height: 84px; }
    .ab-stats { grid-template-columns: repeat(2, 1fr); }
    .ab-stat:nth-child(2n) { border-right: 0; }
    .ab-stat:nth-child(1), .ab-stat:nth-child(2) { border-bottom: 1px solid #dfe6d7; }
  }
  @media (prefers-reduced-motion: reduce) {
    .ab-kicker, .ab-h1, .ab-sub { animation: none; }
  }
`;

export default function AboutUsBanner() {
  const [pics, setPics] = useState([]);

  useEffect(() => {
    let alive = true;
    fetch(API)
      .then((r) => r.json())
      .then((json) => {
        if (!alive) return;
        const loaded = (json.data || [])
          .map((t) => {
            const pic = t.profile || (t.user && t.user.profile) || "";
            return pic ? IMG_BASE + pic : null;
          })
          .filter(Boolean);
        if (loaded.length) setPics(loaded);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const strip = pics.length
    ? Array.from({ length: STRIP_COUNT }, (_, i) => pics[i % pics.length])
    : [];

  return (
    <>
      {/* dangerouslySetInnerHTML: React escapes quotes in a text-node <style> on
          the server but not the client, which trips a hydration mismatch. */}
      <style dangerouslySetInnerHTML={{ __html: bannerStyles }} />

      <section className="ab-section">
        <div className="ab-top">
          <span className="ab-kicker">Our Story &amp; Vision</span>

          <h1 className="ab-h1">
            Making Mental Health Support{" "}
            <span className="ab-accent">Accessible to Every Indian</span>
          </h1>

          <p className="ab-sub">
            At CYT, we believe mental health is a fundamental human right. We connect
            individuals with verified psychologists across India for online and in-person therapy.
          </p>
        </div>

        <div className={`ab-strip${strip.length ? "" : " is-empty"}`}>
          {strip.map((src, i) => (
            <img key={i} src={src} alt="" loading="lazy" />
          ))}
        </div>

        <div className="ab-stats">
          {STATS.map(([v, l]) => (
            <div className="ab-stat" key={l}>
              <div className="ab-stat-v">{v}</div>
              <div className="ab-stat-l">{l}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
