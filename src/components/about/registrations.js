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
  .rg-label::before, .rg-label::after { content: ""; width: 28px; height: 2px; background: #e3a83a; display: inline-block; }

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
  .rgg-label::before, .rgg-label::after { content: ""; width: 28px; height: 2px; background: #e3a83a; display: inline-block; }
  .rgg-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
  .rgg-card {
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;
    height: 132px; padding: 16px 14px 12px; box-sizing: border-box;
    background: #fff; border: 1px solid #ece4cf; border-radius: 16px;
    box-shadow: 0 18px 36px -22px rgba(20,83,45,.45), 0 2px 6px rgba(20,83,45,.05);
  }
  .rgg-card img { max-width: 150px; max-height: 64px; width: auto; height: auto; object-fit: contain; }
  .rgg-card span { font-size: 12px; font-weight: 700; color: #4b5d53; line-height: 1.3; }
  /* phones: same as the home banner — one slim white strip of logos, centred on the banner's bottom edge */
  @media (max-width: 767px) {
    .rgg-band { margin-top: -25px; background: linear-gradient(180deg, transparent 0, transparent 25px, #fff 25px); }
    .rgg { padding: 0 12px; }
    .rgg-label { display: none; }
    .rgg-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0; padding: 8px 4px; background: #fff; border: 1px solid #ece4cf; border-radius: 14px; box-shadow: 0 10px 22px -14px rgba(20,60,35,.4); }
    .rgg-card { height: 32px; padding: 0 6px; border: 0; border-radius: 0; box-shadow: none; background: none; }
    .rgg-card + .rgg-card { border-left: 1px solid #efe8d6; }
    .rgg-card img { max-width: 100%; max-height: 32px; }
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
  /* home: a full-width navy strip (the About us page navy) right under the banner, logos in white (owner 2026-11-28) */
  .rgb-band { position: relative; z-index: 3; margin: 0; background: #0f172a; }
  .rgb { box-sizing: border-box; display: flex; flex-direction: column; align-items: stretch; gap: 14px; width: 100%; max-width: none; margin: 0;
    padding: 16px 64px; background: none; border: 0; border-radius: 0; box-shadow: none; }
  .rgb-label, .rgb-id { display: none; }
  .rgb-l-short { display: none; }
  .rgb-line { margin: 0; text-align: left; color: #fff; font-size: 14.5px; font-weight: 600; line-height: 1.5; letter-spacing: .005em; }
  .rgb-grid { flex: 1; min-width: 0; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
  .rgb-item { display: flex; align-items: center; justify-content: center; gap: 12px; min-width: 0; }

  /* each logo in its own colours on a small white tile: clean and readable on navy */
  .rgb-item img { flex: none; box-sizing: border-box; width: 112px; height: 52px; padding: 6px 12px; object-fit: contain; background: #fff; border-radius: 12px; box-shadow: 0 6px 16px -8px rgba(0,0,0,.5); }
  .rgb-item span { min-width: 0; font-size: 13.5px; font-weight: 700; line-height: 1.3; color: #fff; }
  /* iPad and phones: logos only */
  @media (max-width: 767px), (max-width: 1199px) and (any-pointer: coarse) {
    .rgb { padding: 14px 32px; gap: 10px; }
    .rgb-line { font-size: 13px; }
    .rgb-grid { gap: 10px; }
    .rgb-item { padding: 0 8px; }
    .rgb-item img { width: 100%; max-width: 150px; height: 46px; padding: 5px 10px; }
    .rgb-item span { display: none; }
  }
  @media (max-width: 767px) {
    .rgb { padding: 12px 16px; gap: 10px; }
    .rgb-line { font-size: 12.5px; line-height: 1.45; }
    .rgb-l-full { display: none; }
    .rgb-l-short { display: inline; }
    .rgb-grid { gap: 8px; }
    .rgb-item { padding: 0; }
    .rgb-item img { height: 40px; padding: 4px 6px; border-radius: 10px; }
  }
`;

// the four registrations under the home banner
export function RegistrationsBand() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: bandStyles }} />
      <div className="rgb-band">
      <div className="rgb">
        <p className="rgb-line"><span className="rgb-l-full">Choose Your Therapist LLP is registered with the Ministry of Corporate Affairs and MSME, and is a registered health facility under the Ayushman Bharat Digital Mission (ABDM), National Health Authority.</span><span className="rgb-l-short">Registered with MCA &amp; MSME · Health facility under ABDM, National Health Authority.</span></p>
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
