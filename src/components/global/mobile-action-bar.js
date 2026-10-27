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
      <a className="mab-call" href={`tel:${PHONE}`} tabIndex={shown ? undefined : -1}><i className="feather-phone" aria-hidden="true" /> Call us</a>
      {noida && (
        <Link className="mab-noida" href={offer ? "/noida-appointment?offer=1" : "/noida-appointment"} tabIndex={shown ? undefined : -1}>
          <i className="feather-map-pin" aria-hidden="true" /> Therapist @ Noida<span className="mab-sr"> — book a psychologist in Noida, Sector 51</span>
          {offer && <span className="mab-badge">{String(offer.discount || "").replace(/ off$/i, "")} OFF</span>}
        </Link>
      )}
      <button type="button" className="mab-go" tabIndex={shown ? undefined : -1} onClick={() => window.dispatchEvent(new Event("cyt:open-chat"))}>Get matched</button>
    </div>
  );
}

const CSS = `
.mab { display: none; }
@media (max-width: 767px) {
  .mab { position: fixed; left: 0; right: 0; bottom: 0; z-index: 9995; display: grid; grid-template-columns: 1fr 1.6fr; gap: 8px; padding: 8px 10px calc(8px + env(safe-area-inset-bottom, 0px)); background: rgba(255,255,255,.97); border-top: 1px solid #e3ebe6; box-shadow: 0 -8px 24px -14px rgba(0,0,0,.35); backdrop-filter: blur(6px); transform: translateY(110%); transition: transform .3s ease; pointer-events: none; }
  .mab.on { transform: translateY(0); pointer-events: auto; }
  .mab a, .mab button { height: 44px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-size: 14px; font-weight: 800; text-decoration: none !important; border: none; cursor: pointer; }
  .mab-call { background: #fff; color: #14532d !important; border: 1.5px solid #cfdcd4 !important; }
  .mab-go { background: #1e7a4c; color: #fff; }
  .mab.mab-3 { grid-template-columns: .8fr 1.3fr 1fr; gap: 6px; }
  .mab.mab-3 a, .mab.mab-3 button { font-size: 13px; gap: 4px; padding: 0 6px; white-space: nowrap; }
  /* same gold as the underline under "psychologist" in the home hero */
  .mab-noida { background: #e0ab45; color: #3b2606 !important; border: 1.5px solid #e0ab45 !important; box-shadow: 0 6px 14px -8px rgba(160,110,20,.7); position: relative; overflow: visible; }
  .mab-badge { position: absolute; top: -9px; right: -4px; padding: 2px 7px; border-radius: 999px; background: #c2410c; color: #fff; font-size: 10px; font-weight: 800; line-height: 1.3; letter-spacing: .02em; box-shadow: 0 4px 10px -2px rgba(194,65,12,.45); }
  .mab-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
  .cb-widget { bottom: calc(150px + env(safe-area-inset-bottom, 0px)) !important; }
}
@media (prefers-reduced-motion: reduce) { .mab { transition: none; } }
`;
