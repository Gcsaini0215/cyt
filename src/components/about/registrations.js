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

// what each registration is, shown under its logo in the grid
const CAPTIONS = ["Ministry of Corporate Affairs", "MSME registered", "National Health Authority", "ABDM · HFR ID IN0510005384"];
// home banner strip: no ID numbers, just what each logo is
const BAND_CAPTIONS = ["Ministry of Corporate Affairs", "MSME registered", "National Health Authority", "Ayushman Bharat Digital Mission"];

const gridStyles = `
  /* full-width band: see-through over the banner, clean white below it (the page behind is dark) */
  .rgg-band { position: relative; z-index: 2; margin-top: -92px; background: linear-gradient(180deg, transparent 0, transparent 92px, #fff 92px); }
  .rgg { max-width: 1080px; margin: 0 auto; padding: 0 16px; box-sizing: border-box; text-align: center; }
  .rgg-label {
    display: inline-flex; align-items: center; gap: 12px;
    font-size: 12px; font-weight: 800; letter-spacing: .18em; text-transform: uppercase;
    color: #8a5a0b; margin: 0 0 14px;
  }
  .rgg-label::before, .rgg-label::after { content: ""; width: 28px; height: 2px; background: #d4a24c; display: inline-block; }
  .rgg-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
  .rgg-card {
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;
    height: 132px; padding: 16px 14px 12px; box-sizing: border-box;
    background: #fff; border: 1px solid #ece4cf; border-radius: 16px;
    box-shadow: 0 18px 36px -22px rgba(20,83,45,.45), 0 2px 6px rgba(20,83,45,.05);
  }
  .rgg-card img { max-width: 150px; max-height: 64px; width: auto; height: auto; object-fit: contain; }
  .rgg-card span { font-size: 12px; font-weight: 700; color: #4b5d53; line-height: 1.3; }
  @media (max-width: 767px) {
    .rgg-band { margin-top: -44px; background: linear-gradient(180deg, transparent 0, transparent 44px, #fff 44px); }
    .rgg { padding: 0 12px; }
    .rgg-label { font-size: 10.5px; margin-bottom: 8px; }
    .rgg-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; }
    .rgg-card { height: 62px; padding: 8px 6px; border-radius: 12px; }
    .rgg-card img { max-width: 100%; max-height: 42px; }
    .rgg-card span { display: none; }
  }
`;

// Our Story: the four registrations as a grid, half over the bottom of the banner
export function RegistrationsGrid() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: gridStyles }} />
      <div className="rgg-band">
      <div className="rgg">
        <p className="rgg-label">Registered with</p>
        <div className="rgg-grid">
          {REGISTRATIONS.map((r, i) => (
            <div className="rgg-card" key={r.src}>
              <img src={r.src} alt={r.alt} width={r.w} height={r.h} loading="lazy" />
              <span>{CAPTIONS[i]}</span>
            </div>
          ))}
        </div>
      </div>
      </div>
    </>
  );
}

const bandStyles = `
  /* home: a white card over the banner's bottom edge */
  /* full width: see-through over the banner, white below it (the page behind is dark) */
  .rgb-band { position: relative; z-index: 3; margin-top: -44px; background: linear-gradient(180deg, transparent 0, transparent 44px, #fff 44px); }
  .rgb { box-sizing: border-box; display: flex; align-items: center; gap: 20px; width: calc(100% - 80px); max-width: 1240px; margin: 0 auto; padding: 14px 22px; background: #fff; border: 1px solid #ece4cf; border-radius: 18px; box-shadow: 0 16px 34px -14px rgba(20,60,35,.42); }
  .rgb-label { flex: none; margin: 0; font-size: 13px; font-weight: 800; line-height: 1.3; letter-spacing: .08em; text-transform: uppercase; color: #8a5a0b; }
  .rgb-grid { flex: 1; min-width: 0; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
  .rgb-item { display: flex; align-items: center; gap: 10px; min-width: 0; padding-left: 14px; border-left: 1px solid #efe8d6; }
  .rgb-item img { flex: none; width: 84px; height: 42px; object-fit: contain; }
  .rgb-item span { min-width: 0; font-size: 13px; font-weight: 700; line-height: 1.3; color: #4b5d53; }
  .rgb-id { display: none; }
  /* iPad and phones: logos only, to keep the band short */
  @media (max-width: 1199px) {
    .rgb-band { margin-top: -28px; background: linear-gradient(180deg, transparent 0, transparent 28px, #fff 28px); }
    .rgb { display: block; padding: 9px 18px; border-radius: 16px; box-shadow: 0 12px 26px -16px rgba(20,60,35,.4); }
    .rgb-label { font-size: 12px; white-space: nowrap; }
    .rgb-id { display: block; grid-column: 2; grid-row: 1; margin: 0; text-align: right; font-size: 12px; font-weight: 700; color: #4b5d53; white-space: nowrap; }
    .rgb-grid { width: 100%; }
    .rgb-item { justify-content: center; padding-left: 0; border-left: 0; }
    .rgb-item + .rgb-item { border-left: 1px solid #efe8d6; }
    .rgb-item img { width: 100%; height: 34px; }
    .rgb-item span { display: none; }
  }
  /* phones: a slim white strip of logos over the banner edge */
  @media (max-width: 767px) {
    .rgb-band { margin-top: -25px; background: linear-gradient(180deg, transparent 0, transparent 25px, #fff 25px); }
    .rgb { width: calc(100% - 24px); gap: 5px 8px; padding: 0; background: none; border: 0; border-radius: 0; box-shadow: none; }
    .rgb-label, .rgb-id { padding: 0 4px; font-size: 11px; color: #3a2a0c; }
    .rgb-grid { gap: 0; padding: 8px 4px; background: #fff; border: 1px solid #ece4cf; border-radius: 14px; box-shadow: 0 10px 22px -14px rgba(20,60,35,.4); }
    .rgb-item { padding: 0 6px; }
    .rgb-item img { height: 32px; }
  }
`;

// the four registrations under the home banner
export function RegistrationsBand() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: bandStyles }} />
      <div className="rgb-band">
      <div className="rgb">
        <div className="rgb-grid">
          {REGISTRATIONS.map((r, i) => (
            <div className="rgb-item" key={r.src}>
              <img src={r.src} alt={r.alt} width={r.w} height={r.h} loading="lazy" />
              <span>{BAND_CAPTIONS[i]}</span>
            </div>
          ))}
        </div>
      </div>
      </div>
    </>
  );
}

const rowStyles = `
  .rgr { margin-top: 16px; }
  .rgr-label { display: flex; align-items: center; gap: 8px; margin: 0 0 8px; font-size: 10.5px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; color: #8a5a0b; }
  .rgr-label::after { content: ""; flex: 1; height: 1px; background: #ecdcb6; }
  .rgr-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; }
  .rgr-card { display: flex; align-items: center; justify-content: center; height: 52px; padding: 6px; box-sizing: border-box; background: #fff; border: 1px solid #ece4cf; border-radius: 10px; }
  .rgr-card img { max-width: 100%; max-height: 38px; width: auto; height: auto; object-fit: contain; }
`;

// compact one-row version for narrow spots (therapist registration sidebar)
export function RegistrationsRow() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: rowStyles }} />
      <div className="rgr">
        <p className="rgr-label">Registered with</p>
        <div className="rgr-grid">
          {REGISTRATIONS.map((r) => (
            <div className="rgr-card" key={r.src} title={r.alt}>
              <img src={r.src} alt={r.alt} width={r.w} height={r.h} loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
