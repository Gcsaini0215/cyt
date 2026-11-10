import React, { useEffect, useState } from "react";

/* "Install the CYT app" bar at the top of the client portal (PWA — public/manifest.json + sw.js).
   Android / desktop Chrome & Edge: uses the browser's install prompt, kept by _app.js in
   window.__cytInstall (beforeinstallprompt fires once, early). iPhone Safari has no prompt, so it shows
   the "Share → Add to Home Screen" steps. Hidden inside the installed app and for 21 days after "Not now". */

const KEY = "cyt_install_snooze";
const SNOOZE_MS = 21 * 24 * 3600 * 1000;

const isStandalone = () => {
  try { return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true; } catch (e) { return false; }
};
const isIosSafari = () => {
  const ua = navigator.userAgent || "";
  const ios = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  return ios && /safari/i.test(ua) && !/crios|fxios|edgios|opios/i.test(ua);
};

export default function InstallAppBar() {
  const [mode, setMode] = useState(null); // null | "prompt" | "ios"
  const [steps, setSteps] = useState(false);

  useEffect(() => {
    if (isStandalone()) return undefined;
    try { if (Number(localStorage.getItem(KEY) || 0) > Date.now()) return undefined; } catch (e) { /* storage blocked */ }
    const pick = () => setMode(window.__cytInstall ? "prompt" : isIosSafari() ? "ios" : null);
    pick();
    const done = () => setMode(null);
    window.addEventListener("cyt-install-ready", pick);
    window.addEventListener("appinstalled", done);
    return () => { window.removeEventListener("cyt-install-ready", pick); window.removeEventListener("appinstalled", done); };
  }, []);

  if (!mode) return null;

  const snooze = () => { try { localStorage.setItem(KEY, String(Date.now() + SNOOZE_MS)); } catch (e) { /* fine */ } setMode(null); setSteps(false); };
  const install = async () => {
    if (mode === "ios") { setSteps(true); return; }
    const ev = window.__cytInstall;
    if (!ev) { setMode(null); return; }
    try {
      ev.prompt();
      const r = await ev.userChoice;
      window.__cytInstall = null;
      if (r?.outcome === "accepted") setMode(null); else snooze();
    } catch (e) { setMode(null); }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="iab" role="region" aria-label="Install the app">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/cyt-icon-96.png" alt="" width={40} height={40} />
        <div className="iab-t"><b>Get the CYT app</b><span>Your sessions, reminders and check-ins — one tap from your home screen.</span></div>
        <button type="button" className="iab-go" onClick={install}>Install</button>
        <button type="button" className="iab-x" onClick={snooze} aria-label="Not now">✕</button>
      </div>
      {steps && (
        <div className="iab-ov" role="dialog" aria-modal="true" aria-label="Add to Home Screen" onClick={(e) => { if (e.target === e.currentTarget) setSteps(false); }}>
          <div className="iab-sheet">
            <b>Add CYT to your Home Screen</b>
            <ol>
              <li>Tap the <span className="iab-share" aria-label="Share">
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12 2 7.5 6.5l1.4 1.4L11 5.8V15h2V5.8l2.1 2.1 1.4-1.4L12 2Zm-6 8v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h-2v10H8V10H6Z" /></svg>
              </span> <b>Share</b> button at the bottom of Safari.</li>
              <li>Scroll and tap <b>Add to Home Screen</b>.</li>
              <li>Tap <b>Add</b> — CYT will open like an app.</li>
            </ol>
            <button type="button" className="iab-go" onClick={() => setSteps(false)}>Got it</button>
          </div>
        </div>
      )}
    </>
  );
}

const CSS = `
.iab { display: flex; align-items: center; gap: 12px; margin: 0 0 14px; padding: 10px 12px 10px 12px; border-radius: 16px; background: linear-gradient(135deg, #f3f9f5, #fdf8ec); border: 1px solid #dcebe1; }
.iab img { width: 40px; height: 40px; border-radius: 11px; background: #fff; padding: 3px; flex: none; box-shadow: 0 4px 10px -6px rgba(20,83,45,.5); }
.iab-t { flex: 1; min-width: 0; }
.iab-t b { display: block; font-size: 14.5px; color: #0b1712; }
.iab-t span { display: block; font-size: 12.5px; color: #5b6b63; line-height: 1.4; }
.iab-go { flex: none; height: 38px; padding: 0 16px; border: 0; border-radius: 10px; font-weight: 800; font-size: 13.5px; color: #fff; background: linear-gradient(180deg, #1f7a4a, #14532d); cursor: pointer; font-family: inherit; }
.iab-x { flex: none; width: 30px; height: 30px; border: 0; border-radius: 50%; background: transparent; color: #64748b; font-size: 14px; cursor: pointer; }
.iab-ov { position: fixed; inset: 0; z-index: 3000; background: rgba(11,23,18,.45); display: flex; align-items: flex-end; justify-content: center; padding: 16px; }
.iab-sheet { width: 100%; max-width: 420px; background: #fff; border-radius: 20px; padding: 20px; box-shadow: 0 -10px 40px rgba(0,0,0,.2); }
.iab-sheet > b { display: block; font-size: 17px; margin-bottom: 10px; color: #0b1712; }
.iab-sheet ol { margin: 0 0 16px; padding-left: 20px; font-size: 14.5px; line-height: 1.9; color: #334155; }
.iab-share { display: inline-flex; vertical-align: middle; color: #1d6fe0; }
.iab-sheet .iab-go { width: 100%; height: 44px; }
@media (max-width: 575px) { .iab-t span { display: none; } }
`;
