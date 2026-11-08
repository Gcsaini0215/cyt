import React, { useEffect, useState } from "react";
import Link from "next/link";

/* Cookie choice card (every page). Choices are kept in localStorage "cookie_consent_v2" and sent to Google via
   Consent Mode (default set in _document.js before GTM). "Cookie settings" in the footer reopens it
   (window event "cyt:cookie-settings"). The id stays #cyt-cookie-consent-bar: other parts of the site look for it. */

const KEY = "cookie_consent_v2";

function applyConsent(c) {
  try {
    window.dataLayer = window.dataLayer || [];
    // eslint-disable-next-line prefer-rest-params
    const gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };
    const a = c.analytics ? "granted" : "denied";
    const m = c.marketing ? "granted" : "denied";
    gtag("consent", "update", { analytics_storage: a, ad_storage: m, ad_user_data: m, ad_personalization: m });
    window.dataLayer.push({ event: "cyt_consent_update", consent_analytics: a, consent_marketing: m });
  } catch { /* analytics never blocks the page */ }
}

function Switch({ on, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} className={`cyc-sw${on ? " on" : ""}`} onClick={() => onChange(!on)}>
      <span />
    </button>
  );
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [manage, setManage] = useState(false);
  const [prefs, setPrefs] = useState({ analytics: true, marketing: false });

  useEffect(() => {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(KEY) || "null"); } catch { saved = null; }
    let t = 0;
    if (!saved) t = setTimeout(() => setVisible(true), 1800);
    else setPrefs({ analytics: !!saved.analytics, marketing: !!saved.marketing });
    const reopen = () => { setManage(true); setVisible(true); };
    window.addEventListener("cyt:cookie-settings", reopen);
    return () => { clearTimeout(t); window.removeEventListener("cyt:cookie-settings", reopen); };
  }, []);

  const save = (c) => {
    try { localStorage.setItem(KEY, JSON.stringify(c)); } catch { /* storage blocked: ask again next time */ }
    applyConsent(c);
    setPrefs(c);
    setVisible(false);
    setManage(false);
  };

  if (!visible) return null;
  return (
    <div id="cyt-cookie-consent-bar" className="cyc" role="dialog" aria-modal="false" aria-labelledby="cyc-title">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="cyc-top">
        <span className="cyc-ic" aria-hidden="true">🍪</span>
        <div>
          <p id="cyc-title" className="cyc-title">{manage ? "Cookie preferences" : "We value your privacy"}</p>
          {!manage && (
            <p className="cyc-text">
              We use cookies to keep the site working and, with your OK, to understand visits and improve our care.{" "}
              <Link href="/privacy-policy">Privacy Policy</Link>
            </p>
          )}
        </div>
      </div>

      {manage && (
        <ul className="cyc-list">
          <li><div><b>Essential</b><span>Sign-in, bookings and security. Always on.</span></div><em>Always on</em></li>
          <li><div><b>Analytics</b><span>Helps us see which pages help people most.</span></div>
            <Switch label="Analytics cookies" on={prefs.analytics} onChange={(v) => setPrefs((p) => ({ ...p, analytics: v }))} /></li>
          <li><div><b>Marketing</b><span>Lets us show relevant ads on other sites.</span></div>
            <Switch label="Marketing cookies" on={prefs.marketing} onChange={(v) => setPrefs((p) => ({ ...p, marketing: v }))} /></li>
        </ul>
      )}

      <div className="cyc-acts">
        {manage ? (
          <>
            <button type="button" className="cyc-btn cyc-ghost" onClick={() => save(prefs)}>Save choices</button>
            <button type="button" className="cyc-btn cyc-main" onClick={() => save({ analytics: true, marketing: true })}>Accept all</button>
          </>
        ) : (
          <>
            <button type="button" className="cyc-btn cyc-ghost" onClick={() => save({ analytics: false, marketing: false })}>Only essential</button>
            <button type="button" className="cyc-btn cyc-main" onClick={() => save({ analytics: true, marketing: true })}>Accept all</button>
          </>
        )}
      </div>
      {!manage && <button type="button" className="cyc-link" onClick={() => setManage(true)}>Manage preferences</button>}
      {manage && <button type="button" className="cyc-link" onClick={() => setManage(false)}>← Back</button>}
    </div>
  );
}

const CSS = `
@keyframes cycIn { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:none; } }
.cyc { position:fixed; left:24px; bottom:24px; z-index:99998; width:min(400px, calc(100vw - 32px)); background:#fff; color:#0b1712; border:1px solid #e3ebe6;
  border-radius:20px; padding:18px 18px 14px; box-shadow:0 24px 60px -24px rgba(11,36,24,.55), 0 2px 6px rgba(11,36,24,.06); animation:cycIn .45s cubic-bezier(.2,.7,.2,1) both;
  font-size:14px; }
.cyc::before { content:""; position:absolute; left:18px; right:18px; top:0; height:3px; border-radius:0 0 3px 3px; background:linear-gradient(90deg,#1e7a4c,#e3a83a); }
.cyc-top { display:flex; gap:12px; align-items:flex-start; }
.cyc-ic { flex:none; width:42px; height:42px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:22px; background:#fbf1dc; }
.cyc-title { margin:2px 0 4px; font-size:16px; font-weight:800; color:#0b1712; line-height:1.3; }
.cyc-text { margin:0; font-size:13.5px; line-height:1.55; color:#4b5b53; }
.cyc-text a { color:#1e7a4c; font-weight:700; text-decoration:underline; text-underline-offset:2px; }
.cyc-list { list-style:none; margin:12px 0 0; padding:0; display:flex; flex-direction:column; gap:8px; }
.cyc-list li { display:flex; align-items:center; justify-content:space-between; gap:12px; margin:0; padding:10px 12px; border-radius:12px; background:#f6faf7; border:1px solid #e6efe9; }
.cyc-list li::before { content:none; }
.cyc-list b { display:block; font-size:13.5px; color:#0b1712; } .cyc-list span { display:block; font-size:12px; color:#66756d; line-height:1.4; }
.cyc-list em { font-style:normal; font-size:11px; font-weight:800; color:#1e7a4c; background:#e4f6ea; border-radius:999px; padding:3px 9px; white-space:nowrap; }
.cyc-sw { flex:none; position:relative; width:42px; height:24px; border-radius:999px; border:0; background:#cfd8d3; cursor:pointer; padding:0; transition:background .2s ease; }
.cyc-sw span { position:absolute; top:3px; left:3px; width:18px; height:18px; border-radius:50%; background:#fff; box-shadow:0 1px 3px rgba(0,0,0,.25); transition:transform .2s ease; }
.cyc-sw.on { background:#1e7a4c; } .cyc-sw.on span { transform:translateX(18px); }
.cyc-sw:focus-visible, .cyc-btn:focus-visible, .cyc-link:focus-visible { outline:2px solid #e3a83a; outline-offset:2px; }
.cyc-acts { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:14px; }
.cyc-btn { height:42px; border-radius:12px; font-size:14px; font-weight:800; cursor:pointer; border:1.5px solid transparent; transition:background .2s ease, border-color .2s ease; }
.cyc-main { background:linear-gradient(135deg,#22895a,#1e7a4c 55%,#14532d); color:#fff; }
.cyc-main:hover { background:#14532d; }
.cyc-ghost { background:#fff; color:#26463a; border-color:#cfdcd4; }
.cyc-ghost:hover { border-color:#1e7a4c; color:#1e7a4c; }
.cyc-link { display:block; margin:10px auto 0; background:none; border:0; padding:2px 4px; color:#66756d; font-size:12.5px; font-weight:700; cursor:pointer; text-decoration:underline; text-underline-offset:2px; }
.cyc-link:hover { color:#1e7a4c; }
@media (max-width:900px), (max-width:1100px) and (orientation:portrait) {
  .cyc { left:12px; right:12px; width:auto; bottom:calc(12px + env(safe-area-inset-bottom, 0px)); padding:16px 16px 12px; border-radius:18px; }
}
/* never over the phone action bar (home, Noida…) */
body:has(.mab.on) .cyc { bottom:calc(76px + env(safe-area-inset-bottom, 0px)); }
@media (prefers-reduced-motion: reduce) { .cyc { animation:none; } .cyc-sw, .cyc-sw span { transition:none; } }
@media print { .cyc { display:none; } }
`;
