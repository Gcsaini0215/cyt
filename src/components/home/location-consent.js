import React, { useEffect, useState } from "react";

/* Home: "Find psychologists near you" card. "Use my location" asks the browser for the device location once,
   turns it into a city/state (BigDataCloud's free client-side reverse geocoder — coordinates go there only, not to
   CYT) and hands { city, state } to the page, which puts nearby psychologists first. The place is kept in
   localStorage ("cyt-visitor-place", 30 days) so the next visit starts there; "Not now" keeps the IP-based guess.
   Asked only after the visitor scrolls a bit (or ~18 s), and never while the cookie card is on screen.
   The id stays #cyt-location-consent-bar: other parts of the site look for it. */

export const PLACE_KEY = "cyt-visitor-place";
const CONSENT_KEY = "cyt-location-consent";

export function savedPlace() {
  try {
    const p = JSON.parse(localStorage.getItem(PLACE_KEY) || "null");
    return p && p.state && Date.now() - (p.at || 0) < 30 * 24 * 3600 * 1000 ? p : null;
  } catch { return null; }
}

export default function LocationConsent({ onPlace }) {
  const [show, setShow] = useState(false);
  const [phase, setPhase] = useState("ask"); // ask | finding | done | failed
  const [place, setPlace] = useState(null);

  useEffect(() => {
    try { if (localStorage.getItem(CONSENT_KEY)) return undefined; } catch { return undefined; }
    if (typeof navigator === "undefined" || !navigator.geolocation) return undefined;
    let cancelled = false;
    let poll;
    const maxAt = Date.now() + 40000;
    const reveal = () => {
      if (cancelled) return;
      const cookieUp = document.getElementById("cyt-cookie-consent-bar");
      if (!cookieUp || Date.now() > maxAt) setShow(true);
      else poll = setTimeout(reveal, 700);
    };
    let armed = false;
    const arm = () => { if (armed) return; armed = true; window.removeEventListener("scroll", onScroll); reveal(); };
    const onScroll = () => { if (window.scrollY > 500) arm(); };
    window.addEventListener("scroll", onScroll, { passive: true });
    const timer = setTimeout(arm, 18000);
    return () => { cancelled = true; clearTimeout(timer); clearTimeout(poll); window.removeEventListener("scroll", onScroll); };
  }, []);

  const close = (value) => {
    try { localStorage.setItem(CONSENT_KEY, value); } catch { /* fine */ }
    setShow(false);
  };

  const useLocation = () => {
    setPhase("finding");
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;
        const r = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
        const j = await r.json();
        if (j?.countryCode !== "IN" || !j.principalSubdivision) throw new Error("outside India");
        const p = { city: j.city || j.locality || "", state: j.principalSubdivision, at: Date.now() };
        try { localStorage.setItem(PLACE_KEY, JSON.stringify(p)); } catch { /* fine */ }
        setPlace(p);
        setPhase("done");
        onPlace?.(p);
        try { localStorage.setItem(CONSENT_KEY, "true"); } catch { /* fine */ }
        setTimeout(() => setShow(false), 2200);
      } catch {
        setPhase("failed");
      }
    }, () => setPhase("failed"), { enableHighAccuracy: false, timeout: 12000, maximumAge: 10 * 60 * 1000 });
  };

  if (!show) return null;
  return (
    <div id="cyt-location-consent-bar" className="loc" role="dialog" aria-modal="false" aria-labelledby="loc-title">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <button type="button" className="loc-x" onClick={() => close("declined")} aria-label="Close"><i className="feather-x" aria-hidden="true" /></button>
      <div className="loc-top">
        <span className={`loc-ic${phase === "done" ? " ok" : ""}`} aria-hidden="true"><i className={phase === "done" ? "feather-check" : "feather-map-pin"} /></span>
        <div>
          {phase === "done" ? (
            <>
              <p id="loc-title" className="loc-title">Showing psychologists near {place?.city || place?.state}</p>
              <p className="loc-text">We've put psychologists in {place?.state} first. You can still see everyone across India.</p>
            </>
          ) : phase === "failed" ? (
            <>
              <p id="loc-title" className="loc-title">Couldn't find your location</p>
              <p className="loc-text">No problem — we'll keep showing psychologists across India. You can filter by city in the directory.</p>
            </>
          ) : (
            <>
              <p id="loc-title" className="loc-title">Find psychologists near you</p>
              <p className="loc-text">Share your location once and we'll show psychologists in your city first, plus in-person options nearby. We only use it to work out your city.</p>
            </>
          )}
        </div>
      </div>
      {phase === "failed" ? (
        <div className="loc-acts one">
          <button type="button" className="loc-btn loc-ghost" onClick={() => close("declined")}>OK</button>
        </div>
      ) : phase !== "done" && (
        <div className="loc-acts">
          <button type="button" className="loc-btn loc-ghost" onClick={() => close("declined")} disabled={phase === "finding"}>Not now</button>
          <button type="button" className="loc-btn loc-main" onClick={useLocation} disabled={phase === "finding"}>
            {phase === "finding" ? <><span className="loc-spin" aria-hidden="true" /> Finding…</> : <><i className="feather-navigation" aria-hidden="true" /> Use my location</>}
          </button>
        </div>
      )}
    </div>
  );
}

const CSS = `
@keyframes locIn { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:none; } }
@keyframes locSpin { to { transform:rotate(360deg); } }
.loc { position:fixed; left:24px; bottom:24px; z-index:9999; width:min(400px, calc(100vw - 32px)); background:#fff; color:#0b1712; border:1px solid #e3ebe6;
  border-radius:20px; padding:18px 18px 16px; box-shadow:0 24px 60px -24px rgba(11,36,24,.55), 0 2px 6px rgba(11,36,24,.06); animation:locIn .45s cubic-bezier(.2,.7,.2,1) both; font-size:14px; }
.loc::before { content:""; position:absolute; left:18px; right:18px; top:0; height:3px; border-radius:0 0 3px 3px; background:linear-gradient(90deg,#1e7a4c,#e3a83a); }
.loc-x { position:absolute; top:10px; right:10px; width:32px; height:32px; border-radius:50%; border:0; background:none; color:#8a978f; font-size:16px; cursor:pointer; display:flex; align-items:center; justify-content:center; }
.loc-x:hover { background:#f2f5f3; color:#0b1712; }
.loc-top { display:flex; gap:12px; align-items:flex-start; padding-right:24px; }
.loc-ic { flex:none; width:42px; height:42px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:19px; background:#e4f6ea; color:#1e7a4c; }
.loc-ic.ok { background:#1e7a4c; color:#fff; }
.loc-title { margin:2px 0 4px; font-size:16px; font-weight:800; color:#0b1712; line-height:1.3; }
.loc-text { margin:0; font-size:13.5px; line-height:1.55; color:#4b5b53; }
.loc-acts { display:grid; grid-template-columns:1fr 1.4fr; gap:8px; margin-top:14px; }
.loc-acts.one { grid-template-columns:1fr; }
.loc-btn { height:42px; border-radius:12px; font-size:14px; font-weight:800; cursor:pointer; border:1.5px solid transparent; display:inline-flex; align-items:center; justify-content:center; gap:7px; transition:background .2s ease, border-color .2s ease; }
.loc-btn:disabled { opacity:.7; cursor:wait; }
.loc-main { background:linear-gradient(135deg,#22895a,#1e7a4c 55%,#14532d); color:#fff; }
.loc-main:hover:not(:disabled) { background:#14532d; }
.loc-ghost { background:#fff; color:#26463a; border-color:#cfdcd4; }
.loc-ghost:hover:not(:disabled) { border-color:#1e7a4c; color:#1e7a4c; }
.loc-spin { width:15px; height:15px; border-radius:50%; border:2px solid rgba(255,255,255,.45); border-top-color:#fff; animation:locSpin .8s linear infinite; }
.loc-x:focus-visible, .loc-btn:focus-visible { outline:2px solid #e3a83a; outline-offset:2px; }
@media (max-width:900px), (max-width:1100px) and (orientation:portrait) {
  .loc { left:12px; right:12px; width:auto; bottom:calc(12px + env(safe-area-inset-bottom, 0px)); padding:16px 16px 14px; border-radius:18px; }
}
body:has(.mab.on) .loc { bottom:calc(76px + env(safe-area-inset-bottom, 0px)); }
@media (prefers-reduced-motion: reduce) { .loc { animation:none; } .loc-spin { animation:none; } }
@media print { .loc { display:none; } }
`;
