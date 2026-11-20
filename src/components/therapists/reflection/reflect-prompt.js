import React, { useEffect, useState } from "react";
import Link from "next/link";
import SelfImprovementRoundedIcon from "@mui/icons-material/SelfImprovementRounded";

/* "Take a moment to reflect" popup after a session is completed (2026-11-20, owner).
   - Dashboard: pass `bookings` — the latest session completed in the last 48 h that hasn't been asked about.
   - Appointments: End session / Mark completed fires window "cyt:session-done" { id, name, date } → asks at once.
   Each session is asked about once (localStorage cyt_refl_seen). Closing the popup switches the reminders
   off for good (cyt_refl_off = "1", 2026-11-21 owner); the journal page has the switch to turn them back on. Waits until other popups (welcome, what's new,
   install app) are closed. The journal label never carries the client's name — only the session time. */

const SEEN = "cyt_refl_seen";
const OFF = "cyt_refl_off";
const WINDOW_MS = 48 * 3600 * 1000;
const OTHER_POPUPS = ".wn-wrap, .dr-wrap, .tw-welcome, .iap-wrap";

const read = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : v; } catch { return d; } };
const write = (k, v) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } };
const seenList = () => { try { return JSON.parse(read(SEEN, "[]")) || []; } catch { return []; } };
const markSeen = (id) => write(SEEN, JSON.stringify([String(id), ...seenList().filter((x) => x !== String(id))].slice(0, 60)));
export const reflectRemindersOn = () => read(OFF, "") !== "1";
export const setReflectReminders = (on) => write(OFF, on ? "" : "1");

export const sessionLabel = (date) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }).replace(/,/g, "").replace(/ (am|pm)$/i, (m) => m.toLowerCase());
};

export default function ReflectPrompt({ bookings = null }) {
  const [s, setS] = useState(null); // { id, name, date }
  const [blocked, setBlocked] = useState(true);

  // dashboard: newest completed session in the last 48 h not asked about yet
  useEffect(() => {
    if (!bookings || !reflectRemindersOn()) return;
    const now = Date.now();
    const seen = seenList();
    const pick = bookings
      .filter((b) => b && b.status === "Completed" && !seen.includes(String(b._id)))
      .map((b) => ({ b, t: new Date(b.session_completed_at || b.booking_date).getTime() }))
      .filter(({ t }) => t && t <= now + 60000 && now - t < WINDOW_MS)
      .sort((x, y) => y.t - x.t)[0];
    if (pick) setS({ id: pick.b._id, name: pick.b.client?.name || "", date: pick.b.booking_date });
  }, [bookings]);

  // appointments: asked right after End session / Mark completed
  useEffect(() => {
    const on = (e) => { const d = e.detail || {}; if (d.id && reflectRemindersOn() && !seenList().includes(String(d.id))) setS({ id: d.id, name: d.name || "", date: d.date }); };
    window.addEventListener("cyt:session-done", on);
    return () => window.removeEventListener("cyt:session-done", on);
  }, []);

  // never on top of another popup
  useEffect(() => {
    if (!s) return undefined;
    const check = () => setBlocked(!!document.querySelector(OTHER_POPUPS));
    const first = setTimeout(check, 1200);
    const iv = setInterval(check, 800);
    return () => { clearTimeout(first); clearInterval(iv); };
  }, [s]);

  if (!s || blocked) return null;
  // closed (×, Not now, tap outside) = never pop up again on this device (owner, 2026-11-21) — back on from the journal page
  const close = () => { markSeen(s.id); setReflectReminders(false); setS(null); };
  const first = String(s.name || "").trim().split(/\s+/)[0];
  const href = `/therapists/reflection?new=1&label=${encodeURIComponent(sessionLabel(s.date))}`;

  return (
    <div className="rp-wrap" role="dialog" aria-modal="true" aria-labelledby="rp-h" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
      <style>{RP_CSS}</style>
      <div className="rp">
        <button type="button" className="rp-x" onClick={close} aria-label="Not now">×</button>
        <span className="rp-ic" aria-hidden="true"><SelfImprovementRoundedIcon /></span>
        <small className="rp-k">Session complete{first ? ` · ${first}` : ""}</small>
        <h2 id="rp-h">Take 3 minutes for yourself?</h2>
        <p>What did this session stir up in you? Noting it now — feelings, the pull to act, whose feeling it is — keeps you steady for the next client.</p>
        <span className="rp-lock">🔒 Private to you · no client names</span>
        <Link href={href} className="rp-go" onClick={() => markSeen(s.id)}>Reflect now</Link>
        <button type="button" className="rp-later" onClick={close}>Not now</button>
        <span className="rp-off">Closing turns these reminders off — switch them back on any time in your Reflection journal.</span>
      </div>
    </div>
  );
}

const RP_CSS = `
.rp-wrap { position: fixed; inset: 0; z-index: 1400; display: grid; place-items: center; padding: 16px; background: rgba(15,23,42,.45); backdrop-filter: blur(3px); animation: rpIn .2s ease; }
.rp { position: relative; width: 100%; max-width: 400px; box-sizing: border-box; padding: 26px 24px 18px; border-radius: 26px; text-align: center; color: #10241a;
  background: radial-gradient(100% 70% at 50% 0%, rgba(143,156,255,.25), transparent 70%), #fff; box-shadow: 0 30px 60px -24px rgba(15,23,42,.5); animation: rpUp .28s cubic-bezier(.2,.8,.2,1); }
.rp-x { position: absolute; top: 10px; right: 12px; width: 34px; height: 34px; border: 0; border-radius: 50%; background: #f1f5f9; color: #475569; font-size: 20px; line-height: 1; cursor: pointer; }
.rp-ic { width: 64px; height: 64px; margin: 0 auto 10px; border-radius: 20px; display: grid; place-items: center; color: #fff; background: linear-gradient(160deg, #8f9cff, #5146d6); box-shadow: 0 14px 24px -12px #5146d6; }
.rp-ic svg { font-size: 34px !important; width: 34px; height: 34px; }
.rp-k { display: block; font-size: 11.5px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: #4338ca; }
.rp h2 { margin: 6px 0 8px; font-size: 21px; font-weight: 800; letter-spacing: -.01em; }
.rp p { margin: 0 0 12px; font-size: 14.5px; line-height: 1.55; color: #475569; }
.rp-lock { display: inline-block; margin-bottom: 16px; padding: 5px 10px; border-radius: 999px; background: #f3f4ff; color: #3730a3; font-size: 12.5px; font-weight: 700; }
.rp-go { display: block; height: 50px; line-height: 50px; border-radius: 15px; background: #14532d; color: #fff !important; font-size: 16px; font-weight: 800; text-decoration: none; box-shadow: 0 12px 22px -14px rgba(20,83,45,.9); }
.rp-go:hover { background: #0f3f23; }
.rp-later { display: block; width: 100%; margin-top: 8px; height: 42px; border: 0; background: none; color: #334155; font: inherit; font-size: 14.5px; font-weight: 700; cursor: pointer; }
.rp-off { display: block; margin-top: 4px; color: #94a3b8; font-size: 12px; line-height: 1.45; }
@keyframes rpIn { from { opacity: 0; } }
@keyframes rpUp { from { opacity: 0; transform: translateY(16px) scale(.97); } }
@media (prefers-reduced-motion: reduce) { .rp-wrap, .rp { animation: none; } }
`;
