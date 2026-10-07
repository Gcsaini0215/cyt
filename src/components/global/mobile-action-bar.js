import React from "react";
import { waLink, PHONE } from "./lead-card";

// Phones: a slim bar pinned to the bottom of landing pages — WhatsApp (with a message that
// already says what the visitor was looking at), call, and "Get matched" (opens the lead
// popup). On landing pages most visitors are on phones and never scroll back up to a form.
export default function MobileActionBar({ waText = "Hi, I'd like help finding the right psychologist." }) {
  return (
    <div className="mab" role="region" aria-label="Contact us">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <a className="mab-wa" href={waLink(waText)} target="_blank" rel="noreferrer"><i className="feather-message-circle" aria-hidden="true" /> WhatsApp</a>
      <a className="mab-call" href={`tel:${PHONE}`}><i className="feather-phone" aria-hidden="true" /> Call</a>
      <button type="button" className="mab-go" onClick={() => window.dispatchEvent(new Event("cyt:open-chat"))}>Get matched</button>
    </div>
  );
}

const CSS = `
.mab { display: none; }
@media (max-width: 767px) {
  .mab { position: fixed; left: 0; right: 0; bottom: 0; z-index: 9995; display: grid; grid-template-columns: 1fr 1fr 1.3fr; gap: 8px; padding: 8px 10px calc(8px + env(safe-area-inset-bottom, 0px)); background: rgba(255,255,255,.97); border-top: 1px solid #e3ebe6; box-shadow: 0 -8px 24px -14px rgba(0,0,0,.35); backdrop-filter: blur(6px); }
  .mab a, .mab button { height: 44px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-size: 14px; font-weight: 800; text-decoration: none !important; border: none; cursor: pointer; }
  .mab-wa { background: #25d366; color: #fff !important; }
  .mab-call { background: #fff; color: #14532d !important; border: 1.5px solid #cfdcd4 !important; }
  .mab-go { background: #1e7a4c; color: #fff; }
  /* keep page content and the floating callback tab clear of the bar */
  body { padding-bottom: calc(64px + env(safe-area-inset-bottom, 0px)); }
  .cb-widget { bottom: calc(150px + env(safe-area-inset-bottom, 0px)) !important; }
}
`;
