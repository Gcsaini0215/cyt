import React, { useEffect, useState } from "react";
import { PHONE } from "./lead-card";

// Phones: a slim bar at the bottom of landing pages — call, and "Get matched" (opens the lead
// popup). It isn't pinned all the time (it covered too much of a small screen): it slides up
// while the visitor scrolls and tucks itself away a few seconds after they stop.
// waText is still accepted from pages but unused — WhatsApp left the bar (2026-10-21).
// eslint-disable-next-line no-unused-vars
export default function MobileActionBar({ waText } = {}) {
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

  return (
    <div className={`mab${shown ? " on" : ""}`} role="region" aria-label="Contact us">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <a className="mab-call" href={`tel:${PHONE}`} tabIndex={shown ? undefined : -1}><i className="feather-phone" aria-hidden="true" /> Call us</a>
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
  .cb-widget { bottom: calc(150px + env(safe-area-inset-bottom, 0px)) !important; }
}
@media (prefers-reduced-motion: reduce) { .mab { transition: none; } }
`;
