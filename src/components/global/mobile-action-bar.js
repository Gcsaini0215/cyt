import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PHONE } from "./lead-card";
import { apiUrl } from "../../utils/url";

// Phones: a slim bar at the bottom of landing pages — call, and "Get matched" (opens the lead
// popup). It isn't pinned all the time (it covered too much of a small screen): it slides up
// while the visitor scrolls and tucks itself away a few seconds after they stop.
// waText is still accepted from pages but unused — WhatsApp left the bar (2026-10-21).
// noida: adds a "Therapist @ Noida" button (the home page moved its hero Noida button here on phones).
// eslint-disable-next-line no-unused-vars
export default function MobileActionBar({ waText, noida = false } = {}) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    let hideT;
    const onScroll = () => {
      // not over the very top of the page — the hero has its own buttons there
      if (window.scrollY < 120) { setShown(false); return; }
      setShown(true);
      clearTimeout(hideT);
      hideT = setTimeout(() => setShown(false), 3000);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); clearTimeout(hideT); };
  }, []);

  // live Noida offer (admin → Coupons → "show on booking page") — same badge the hero button had
  const [offer, setOffer] = useState(null);
  useEffect(() => {
    if (!noida) return;
    fetch(`${apiUrl}/noida-appointments/offers`)
      .then((r) => r.json())
      .then((d) => { if (d?.status && d.data?.length) setOffer(d.data[0]); })
      .catch(() => {});
  }, [noida]);

  return (
    <div className={`mab${shown ? " on" : ""}${noida ? " mab-3" : ""}`} role="region" aria-label="Contact us">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      {/* looks like the app dock on the client / therapist dashboards: colour icon tiles with a label under them */}
      <a className="mab-it mab-call" href={`tel:${PHONE}`} tabIndex={shown ? undefined : -1}>
        <span className="mab-ic"><i className="feather-phone" aria-hidden="true" /></span><span className="mab-l">Call us</span>
      </a>
      {noida && (
        <Link className="mab-it mab-noida" href={offer ? "/noida-appointment?offer=1" : "/noida-appointment"} tabIndex={shown ? undefined : -1}>
          <span className="mab-ic"><i className="feather-map-pin" aria-hidden="true" />{offer && <span className="mab-badge">{String(offer.discount || "").replace(/ off$/i, "")} OFF</span>}</span>
          <span className="mab-l">Therapist @ Noida</span><span className="mab-sr"> — book a psychologist in Noida, Sector 51</span>
        </Link>
      )}
      <button type="button" className="mab-it mab-go" tabIndex={shown ? undefined : -1} onClick={() => window.dispatchEvent(new Event("cyt:open-chat"))}>
        <span className="mab-ic"><i className="feather-message-circle" aria-hidden="true" /></span><span className="mab-l">Get matched</span>
      </button>
    </div>
  );
}

const CSS = `
.mab { display: none; }
@media (max-width: 767px) {
  /* a floating, frosted dock — same feel as the bottom bar inside the client / therapist app */
  .mab { position: fixed; left: 10px; right: 10px; bottom: calc(10px + env(safe-area-inset-bottom, 0px)); z-index: 9995; display: flex; padding: 0 4px;
    background: rgba(255,255,255,.94); -webkit-backdrop-filter: saturate(180%) blur(16px); backdrop-filter: saturate(180%) blur(16px);
    border: 1px solid #e4ece7; border-radius: 22px; box-shadow: 0 14px 34px -14px rgba(11,23,18,.45);
    transform: translateY(calc(100% + 24px + env(safe-area-inset-bottom, 0px))); transition: transform .32s cubic-bezier(.22,.8,.3,1); pointer-events: none; }
  .mab.on { transform: translateY(0); pointer-events: auto; }
  .mab-it { flex: 1; min-width: 0; min-height: 66px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 8px 2px 7px;
    background: none; border: 0; font-family: inherit; font-size: 11.5px; font-weight: 700; color: #334155 !important; text-decoration: none !important; cursor: pointer; -webkit-tap-highlight-color: transparent; }
  .mab-ic { position: relative; display: grid; place-items: center; width: 42px; height: 42px; border-radius: 13px; color: #fff; background: var(--tile); overflow: visible;
    box-shadow: 0 8px 16px -6px var(--tile-sh), inset 0 1px 0 rgba(255,255,255,.5), inset 0 -2px 0 rgba(0,0,0,.12); transition: transform .18s ease; }
  /* glossy top shine, like an app icon */
  .mab-ic::before { content: ""; position: absolute; inset: 2px 3px 50% 3px; border-radius: 11px 11px 14px 14px / 11px 11px 8px 8px; background: linear-gradient(180deg, rgba(255,255,255,.42), rgba(255,255,255,0)); pointer-events: none; }
  .mab-ic i { position: relative; font-size: 20px; line-height: 1; color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,.25); }
  .mab-it:active .mab-ic { transform: scale(.88); }
  .mab-l { display: block; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .mab-call { --tile: linear-gradient(150deg, #34e89e 0%, #0fb67a 45%, #078a5c 100%); --tile-sh: rgba(7,138,92,.65); }
  /* gold, like the underline under "psychologist" in the home hero */
  .mab-noida { --tile: linear-gradient(150deg, #ffcf3f 0%, #ff9a1f 50%, #f26b0f 100%); --tile-sh: rgba(242,107,15,.65); color: #0b1712 !important; font-weight: 800; }
  .mab-go { --tile: linear-gradient(150deg, #ff7ac6 0%, #c13cf0 50%, #6a3fd6 100%); --tile-sh: rgba(150,50,220,.6); }
  .mab-badge { position: absolute; z-index: 1; top: -8px; left: 28px; padding: 2px 6px; border-radius: 999px; background: #c2410c; color: #fff; font-size: 9.5px; font-weight: 800; line-height: 1.3; letter-spacing: .02em; white-space: nowrap; box-shadow: 0 4px 10px -2px rgba(194,65,12,.45); border: 1.5px solid #fff; }
  .mab-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
  .cb-widget { bottom: calc(160px + env(safe-area-inset-bottom, 0px)) !important; }
}
@media (prefers-reduced-motion: reduce) { .mab, .mab-ic { transition: none; } }
`;
