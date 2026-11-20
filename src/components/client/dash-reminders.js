import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchById } from "../../utils/actions";
import { apiUrl } from "../../utils/url";
import { cycleState, istDay, niceDay } from "../../utils/cycle";

/* My Space reminders (2026-11-20, owner): one gentle pop-up at a time.
   1. A worksheet the therapist sent that hasn't been opened yet — shows every visit (each new tab / app open)
      until the client opens it; "Later" hides it for this visit only. Opening it ends the reminder for good.
   2. Cycle & Mood — for a client who switched the tracker on and hasn't logged today: once a day, with a line
      that fits where she is in her cycle.
   Waits while the "What's new" dialog is open, so two pop-ups never stack. */

const WS_SEEN = "cyt_ws_remind"; // sessionStorage: worksheet ids hidden for this visit
const CY_SEEN = "cyt_cycle_remind"; // localStorage: the day the cycle reminder was shown
const get = (store, k) => { try { return window[store].getItem(k) || ""; } catch (e) { return ""; } };
const put = (store, k, v) => { try { window[store].setItem(k, v); } catch (e) { /* storage blocked */ } };

function cycleLine(p, logs) {
  const st = cycleState(p, logs || {});
  if (!st?.start) return { t: "Log your period to begin", b: "Tap when your period starts — Cycle & Mood will learn your rhythm from there." };
  if (st.late) return { t: `Your period is ${st.late} day${st.late === 1 ? "" : "s"} late`, b: "Log it when it starts. If you're worried, your therapist or a doctor can help." };
  if (st.phase === "menstrual") return { t: `Period · day ${st.day}`, b: "How's your flow and mood today? A quick log keeps your predictions right." };
  if (st.inDays <= 3) return { t: `Your period may start in ${st.inDays} day${st.inDays === 1 ? "" : "s"}`, b: `Expected around ${niceDay(st.next)}. Keep a pad handy, and be kind to yourself if your mood dips.` };
  return { t: "How are you feeling today?", b: `Day ${st.day} of your cycle — log your mood and any symptoms in a few seconds.` };
}

export default function DashReminders() {
  const [queue, setQueue] = useState([]);
  const [blocked, setBlocked] = useState(true); // a "What's new" dialog is up

  useEffect(() => {
    let alive = true;
    const hidden = get("sessionStorage", WS_SEEN).split(",");
    const today = istDay();
    Promise.all([
      fetchById(`${apiUrl}/my-worksheets`).catch(() => null),
      get("localStorage", CY_SEEN) === today ? null : fetchById(`${apiUrl}/my-cycle`, { lite: 1 }).catch(() => null),
    ]).then(([ws, cy]) => {
      if (!alive) return;
      const q = [];
      const waiting = (ws?.data || []).filter((w) => w.status === "assigned" && w.therapist && !hidden.includes(w._id));
      if (waiting.length) q.push({ kind: "ws", items: waiting });
      const p = cy?.data?.profile;
      if (p?.enabled && !cy.data.logs?.[today]) q.push({ kind: "cycle", ...cycleLine(p, cy.data.logs) });
      setQueue(q);
    });
    // never on top of the "What's new" dialog
    const check = () => setBlocked(!!document.querySelector(".wn-wrap"));
    check();
    const iv = setInterval(check, 800);
    return () => { alive = false; clearInterval(iv); };
  }, []);

  const cur = queue[0];
  if (!cur || blocked) return null;
  const next = () => setQueue((q) => q.slice(1));
  const later = () => {
    if (cur.kind === "ws") put("sessionStorage", WS_SEEN, [...get("sessionStorage", WS_SEEN).split(",").filter(Boolean), ...cur.items.map((w) => w._id)].join(","));
    else put("localStorage", CY_SEEN, istDay());
    next();
  };

  let body;
  if (cur.kind === "ws") {
    const one = cur.items.length === 1 ? cur.items[0] : null;
    const who = one ? one.therapist.name : "Your therapist";
    body = (
      <>
        <span className="dr-ic ws" aria-hidden="true">📝</span>
        <h3 id="dr-h">{one ? `${who} sent you a worksheet` : `You have ${cur.items.length} worksheets waiting`}</h3>
        {one ? (
          <>
            <p><b>{one.title}</b>{one.note ? <> — <i>&ldquo;{one.note}&rdquo;</i></> : null}</p>
            <p className="dr-soft">It only takes a few minutes, and it makes your next session much more useful. Small steps count.</p>
            <div className="dr-acts">
              <Link href={`/client/worksheets/${one._id}`} className="dr-btn" onClick={next}>Open the worksheet</Link>
              <button type="button" className="dr-later" onClick={later}>Remind me later</button>
            </div>
          </>
        ) : (
          <>
            <ul className="dr-list">{cur.items.slice(0, 4).map((w) => <li key={w._id}><Link href={`/client/worksheets/${w._id}`} onClick={next}><b>{w.title}</b><span>from {w.therapist.name}</span><i aria-hidden="true">›</i></Link></li>)}</ul>
            <div className="dr-acts"><button type="button" className="dr-later" onClick={later}>Remind me later</button></div>
          </>
        )}
      </>
    );
  } else {
    body = (
      <>
        <span className="dr-ic cy" aria-hidden="true">🌸</span>
        <h3 id="dr-h">{cur.t}</h3>
        <p className="dr-soft">{cur.b}</p>
        <div className="dr-acts">
          <Link href="/client/cycle" className="dr-btn pink" onClick={() => { put("localStorage", CY_SEEN, istDay()); next(); }}>Log today</Link>
          <button type="button" className="dr-later" onClick={later}>Later</button>
        </div>
      </>
    );
  }
  return (
    <div className="dr-wrap" role="dialog" aria-modal="true" aria-labelledby="dr-h" onClick={(e) => { if (e.target === e.currentTarget) later(); }}>
      <style>{DR_CSS}</style>
      <div className="dr">
        <button type="button" className="dr-x" onClick={later} aria-label="Close">×</button>
        {body}
      </div>
    </div>
  );
}

const DR_CSS = `
.dr-wrap { position: fixed; inset: 0; z-index: 2147483000; display: grid; place-items: center; padding: 20px; background: rgba(7,26,17,.45); -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px); animation: drFade .2s ease; }
@keyframes drFade { from { opacity: 0; } }
.dr { position: relative; width: min(420px, 100%); background: #fff; border-radius: 26px; padding: 26px 22px 20px; text-align: center; box-shadow: 0 30px 60px -20px rgba(0,0,0,.45); animation: drUp .28s cubic-bezier(.2,.9,.3,1.2); }
@keyframes drUp { from { opacity: 0; transform: translateY(16px) scale(.97); } }
.dr-x { position: absolute; top: 10px; right: 12px; width: 32px; height: 32px; border: 0; border-radius: 50%; background: #f1f5f3; color: #475569; font-size: 20px; line-height: 1; cursor: pointer; }
.dr-ic { display: inline-grid; place-items: center; width: 64px; height: 64px; border-radius: 20px; font-size: 32px; margin-bottom: 10px; }
.dr-ic.ws { background: linear-gradient(160deg, #ffe9c7, #ffd08a); } .dr-ic.cy { background: linear-gradient(160deg, #ffe3ef, #ffc2da); }
.dr h3 { margin: 0 0 8px; font-size: 20px; font-weight: 800; letter-spacing: -.02em; color: #1c1c1e; }
.dr p { margin: 0 0 8px; font-size: 15px; line-height: 1.5; color: #334155; }
.dr p i { color: #6b7280; }
.dr .dr-soft { color: #6b7280; font-size: 14px; }
.dr-acts { display: flex; flex-direction: column; gap: 6px; margin-top: 14px; }
.dr-btn { display: flex; align-items: center; justify-content: center; height: 48px; border-radius: 14px; background: #14532d; color: #fff !important; font-weight: 800; font-size: 15.5px; text-decoration: none !important; }
.dr-btn.pink { background: linear-gradient(160deg, #f0668a, #c22d58); }
.dr a[href="/client/cycle"]::before { content: none !important; display: none !important; } /* the menu adds a FREE badge to cycle links */
.dr-later { height: 40px; border: 0; background: none; color: #64748b; font: inherit; font-size: 14.5px; font-weight: 700; cursor: pointer; }
.dr-list { list-style: none; margin: 6px 0 0; padding: 0; text-align: left; }
.dr-list a { display: flex; align-items: center; gap: 10px; padding: 12px 4px; border-top: 1px solid #eef2f0; text-decoration: none !important; color: #1c1c1e !important; }
.dr-list li:first-child a { border-top: 0; }
.dr-list b { flex: 1; font-size: 15px; } .dr-list span { font-size: 12.5px; color: #6b7280; } .dr-list i { font-style: normal; font-size: 20px; color: #15803d; }
@media (prefers-reduced-motion: reduce) { .dr-wrap, .dr { animation: none; } }
`;
