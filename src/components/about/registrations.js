import React from "react";

/**
 * "Registered with" logo strip — an endless, auto-scrolling row of the
 * government bodies CYT is registered with. Pure CSS marquee (no Swiper):
 * the set is rendered twice and the track slides by exactly one set's
 * width, so the loop is seamless. Pauses on hover; static row for
 * prefers-reduced-motion. Sits on the dark "About The Platform" section,
 * so each logo gets its own white card (the logos are dark-on-transparent).
 */
const REGISTRATIONS = [
  { src: "/images/registrations/mca.png", alt: "Ministry of Corporate Affairs, Government of India", w: 600, h: 263 },
  { src: "/images/registrations/msme.svg", alt: "Micro, Small & Medium Enterprises (MSME)", w: 900, h: 320 },
  { src: "/images/registrations/nha.png", alt: "National Health Authority", w: 395, h: 173 },
  { src: "/images/registrations/abdm.svg", alt: "Ayushman Bharat Digital Mission (ABDM)", w: 363, h: 335 },
];

// Repeat the 4 logos so one "set" is wider than any screen — otherwise a gap
// shows on wide displays before the duplicate set slides in.
const SET = [...REGISTRATIONS, ...REGISTRATIONS];

const styles = `
  .rg-wrap { margin-top: 48px; text-align: center; }
  .rg-label {
    display: inline-flex; align-items: center; gap: 12px;
    font-size: 12px; font-weight: 800; letter-spacing: .18em; text-transform: uppercase;
    color: rgba(255,255,255,.7); margin: 0 0 22px;
  }
  .rg-label::before, .rg-label::after { content: ""; width: 28px; height: 2px; background: #d4af37; display: inline-block; }

  .rg-viewport {
    overflow: hidden;
    -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
            mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
  }
  .rg-track { display: flex; width: max-content; animation: rg-scroll 36s linear infinite; }
  .rg-viewport:hover .rg-track { animation-play-state: paused; }
  .rg-set { display: flex; gap: 20px; padding-right: 20px; }

  .rg-card {
    flex: 0 0 auto;
    width: 200px; height: 100px;
    background: #fff;
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    padding: 14px 20px;
    box-shadow: 0 10px 24px -14px rgba(0,0,0,.6);
  }
  .rg-card img { max-width: 100%; max-height: 100%; width: auto; height: auto; object-fit: contain; }

  @keyframes rg-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }

  @media (max-width: 767px) {
    .rg-wrap { margin-top: 36px; }
    .rg-card { width: 150px; height: 78px; padding: 10px 14px; border-radius: 12px; }
    .rg-set { gap: 14px; padding-right: 14px; }
    .rg-track { animation-duration: 28s; }
  }
  @media (prefers-reduced-motion: reduce) {
    .rg-viewport { -webkit-mask-image: none; mask-image: none; }
    .rg-track { animation: none; width: auto; justify-content: center; }
    .rg-set { flex-wrap: wrap; justify-content: center; padding-right: 0; }
    .rg-set[aria-hidden="true"] { display: none; }
  }
`;

function LogoSet({ hidden }) {
  // Only the first 4 logos are announced; every repeat exists purely for the
  // loop, so screen readers skip them.
  return (
    <div className="rg-set" aria-hidden={hidden ? "true" : undefined}>
      {SET.map((r, i) => {
        const repeat = hidden || i >= REGISTRATIONS.length;
        return (
          <div className="rg-card" key={i} aria-hidden={repeat && !hidden ? "true" : undefined}>
            <img src={r.src} alt={repeat ? "" : r.alt} width={r.w} height={r.h} loading="lazy" />
          </div>
        );
      })}
    </div>
  );
}

export default function Registrations() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="rg-wrap">
        <p className="rg-label">Registered With</p>
        <div className="rg-viewport">
          <div className="rg-track">
            <LogoSet />
            <LogoSet hidden />
          </div>
        </div>
      </div>
    </>
  );
}
