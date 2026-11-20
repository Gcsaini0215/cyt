import React, { useEffect, useState } from "react";

/* "Get the CYT app" pop-up on the client and therapist home screens (2026-11-20, owner: one tap, not
   instructions). Android / desktop Chrome & Edge: the browser's own install prompt — one tap installs it
   (kept by _app.js in window.__cytInstall). iPhone / iPad: Apple doesn't let any website install itself,
   so it shows the 3 steps with an arrow pointing at the Share button (Safari and Chrome differ). Android
   without the prompt (e.g. other browsers): the menu steps. Never inside the installed app; "Not now" =
   3 days; waits for other pop-ups (What's new, reminders) to close. */

const KEY = "cyt_install_pop";
const SNOOZE = 3 * 864e5;
const isStandalone = () => { try { return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true; } catch (e) { return false; } };
const platform = () => {
  const ua = navigator.userAgent || "";
  const ipad = /ipad/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (/iphone|ipod/i.test(ua) || ipad) return { os: "ios", ipad, chrome: /crios/i.test(ua) };
  if (/android/i.test(ua)) return { os: "android", samsung: /samsungbrowser/i.test(ua) };
  return { os: "desktop" };
};

export default function InstallAppPopup({ who = "client" }) {
  const [mode, setMode] = useState(null); // "prompt" | "ios" | "android"
  const [p, setP] = useState(null);
  const [show, setShow] = useState(false);
  const [blocked, setBlocked] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isStandalone()) return undefined;
    try { if (Number(localStorage.getItem(KEY) || 0) > Date.now()) return undefined; } catch (e) { /* storage blocked */ }
    const pl = platform(); setP(pl);
    const pick = () => setMode(window.__cytInstall ? "prompt" : pl.os === "ios" ? "ios" : pl.os === "android" ? "android" : null);
    pick();
    window.addEventListener("cyt-install-ready", pick);
    const gone = () => { setMode(null); setShow(false); };
    window.addEventListener("appinstalled", gone);
    const t = setTimeout(() => setShow(true), 2500); // let the home screen settle first
    const iv = setInterval(() => setBlocked(!!document.querySelector(".wn-wrap, .dr-wrap, .tw-welcome")), 700);
    return () => { clearTimeout(t); clearInterval(iv); window.removeEventListener("cyt-install-ready", pick); window.removeEventListener("appinstalled", gone); };
  }, []);

  if (!mode || !show || blocked) return null;
  const close = () => { try { localStorage.setItem(KEY, String(Date.now() + SNOOZE)); } catch (e) { /* fine */ } setShow(false); };
  const install = async () => {
    const ev = window.__cytInstall;
    if (!ev) return;
    setBusy(true);
    try {
      ev.prompt();
      const r = await ev.userChoice;
      window.__cytInstall = null;
      if (r?.outcome === "accepted") setShow(false); else close();
    } catch (e) { close(); }
    setBusy(false);
  };
  const perks = who === "therapist"
    ? ["New bookings and session alerts, instantly", "Start sessions and see your day in one tap", "Opens full screen — like any app"]
    : ["Session reminders and your therapist's messages", "Join your session in one tap", "Calm corner and check-ins, always at hand"];

  return (
    <div className="iap-wrap" role="dialog" aria-modal="true" aria-labelledby="iap-h" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
      <style>{IAP_CSS}</style>
      <div className="iap">
        <button type="button" className="iap-x" onClick={close} aria-label="Not now">×</button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="iap-ic" src="/icons/cyt-icon-192.png" alt="" width="76" height="76" />
        <h3 id="iap-h">Get the CYT app</h3>
        <p className="iap-sub">Free · no download from a store · under 1 MB</p>
        <ul className="iap-perks">{perks.map((x) => <li key={x}>{x}</li>)}</ul>

        {mode === "prompt" && (
          <button type="button" className="iap-go" disabled={busy} onClick={install}>{busy ? "Installing…" : "Install — one tap"}</button>
        )}

        {mode === "ios" && (
          <div className="iap-steps">
            <p className="iap-note">On {p?.ipad ? "iPad" : "iPhone"}, Apple adds apps from the Share menu — 3 quick taps:</p>
            <ol>
              <li>Tap <span className="iap-share" aria-label="Share"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12 2 7.5 6.5l1.4 1.4L11 5.8V15h2V5.8l2.1 2.1 1.4-1.4L12 2Zm-6 8v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h-2v10H8V10H6Z" /></svg></span> <b>Share</b> {p?.chrome ? "(top right, next to the address bar)" : p?.ipad ? "(top right)" : "(bottom of the screen)"}</li>
              <li>Tap <b>Add to Home Screen</b> <span className="iap-plus">＋</span></li>
              <li>Tap <b>Add</b> — CYT appears on your home screen</li>
            </ol>
            <button type="button" className="iap-go" onClick={close}>Got it</button>
          </div>
        )}

        {mode === "android" && (
          <div className="iap-steps">
            <p className="iap-note">Add it from your browser menu — 2 quick taps:</p>
            <ol>
              <li>Tap <b>⋮</b> {p?.samsung ? "(or ≡) at the bottom right" : "at the top right"}</li>
              <li>Tap <b>Install app</b> or <b>Add to Home screen</b></li>
            </ol>
            <button type="button" className="iap-go" onClick={close}>Got it</button>
          </div>
        )}
        <button type="button" className="iap-later" onClick={close}>Not now</button>
      </div>
      {/* point at the Share button (iPhone Safari: bottom middle · iPad / Chrome: top right) */}
      {mode === "ios" && <span className={`iap-arrow ${p?.ipad || p?.chrome ? "tr" : "bm"}`} aria-hidden="true">{p?.ipad || p?.chrome ? "↗" : "↓"}</span>}
    </div>
  );
}

const IAP_CSS = `
.iap-wrap { position: fixed; inset: 0; z-index: 2147483000; display: grid; place-items: center; padding: 20px; background: rgba(7,26,17,.5); -webkit-backdrop-filter: blur(5px); backdrop-filter: blur(5px); animation: iapFade .2s ease; }
@keyframes iapFade { from { opacity: 0; } }
.iap { position: relative; width: min(400px, 100%); max-height: calc(100dvh - 40px); overflow-y: auto; background: #fff; border-radius: 28px; padding: 26px 22px 16px; text-align: center; box-shadow: 0 30px 60px -20px rgba(0,0,0,.5); animation: iapUp .3s cubic-bezier(.2,.9,.3,1.2); }
@keyframes iapUp { from { opacity: 0; transform: translateY(18px) scale(.96); } }
.iap-x { position: absolute; top: 10px; right: 12px; width: 32px; height: 32px; border: 0; border-radius: 50%; background: #f1f5f3; color: #475569; font-size: 20px; line-height: 1; cursor: pointer; }
.iap-ic { width: 76px; height: 76px; border-radius: 20px; box-shadow: 0 14px 26px -14px rgba(20,83,45,.7); }
.iap h3 { margin: 12px 0 2px; font-size: 22px; font-weight: 800; letter-spacing: -.02em; color: #1c1c1e; }
.iap-sub { margin: 0 0 12px; font-size: 13px; color: #6b7280; }
.iap-perks { list-style: none; margin: 0 auto 16px; padding: 0; max-width: 320px; text-align: left; display: flex; flex-direction: column; gap: 8px; }
.iap-perks li { position: relative; padding-left: 26px; font-size: 14.5px; color: #334155; line-height: 1.45; }
.iap-perks li::before { content: "✓"; position: absolute; left: 0; top: 1px; width: 18px; height: 18px; border-radius: 50%; background: #1e7a4c; color: #fff; font-size: 11px; font-weight: 900; display: grid; place-items: center; }
.iap-go { width: 100%; height: 50px; border: 0; border-radius: 15px; background: linear-gradient(180deg, #1f7a4a, #14532d); color: #fff; font: inherit; font-size: 16px; font-weight: 800; cursor: pointer; box-shadow: 0 12px 22px -14px rgba(20,83,45,.9); }
.iap-go:disabled { opacity: .7; }
.iap-later { margin-top: 6px; height: 38px; border: 0; background: none; color: #64748b; font: inherit; font-size: 14px; font-weight: 700; cursor: pointer; }
.iap-steps { text-align: left; }
.iap-note { margin: 0 0 8px; font-size: 13.5px; color: #475569; text-align: center; }
.iap-steps ol { margin: 0 0 14px; padding: 12px 14px 12px 34px; border-radius: 16px; background: #f4f8f6; font-size: 14.5px; line-height: 1.9; color: #1f2937; }
.iap-share { display: inline-flex; vertical-align: middle; color: #1d6fe0; }
.iap-plus { display: inline-grid; place-items: center; width: 20px; height: 20px; border: 1.5px solid #334155; border-radius: 5px; font-size: 13px; vertical-align: middle; }
.iap-arrow { position: fixed; z-index: 2147483001; font-size: 44px; color: #fff; text-shadow: 0 4px 14px rgba(0,0,0,.4); animation: iapBob 1.1s ease-in-out infinite; pointer-events: none; }
.iap-arrow.bm { bottom: calc(6px + env(safe-area-inset-bottom, 0px)); left: 50%; margin-left: -14px; }
.iap-arrow.tr { top: calc(4px + env(safe-area-inset-top, 0px)); right: 18px; }
@keyframes iapBob { 50% { transform: translateY(8px); } }
.iap-arrow.tr { animation-name: iapBobUp; } @keyframes iapBobUp { 50% { transform: translate(4px, -6px); } }
@media (prefers-reduced-motion: reduce) { .iap-wrap, .iap, .iap-arrow { animation: none; } }
`;
