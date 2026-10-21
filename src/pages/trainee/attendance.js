import React, { useEffect, useState } from "react";
import TraineeLayout, { useTraineePortal } from "../../components/trainee/trainee-layout";
import { usePager, Pager } from "../../components/trainee/pager";
import { tApi, fmtTime, fmtDate, fmtMins } from "../../utils/trainee-api";

/* Attendance: check in when you join, check out when you leave. Today, this month's numbers and streak,
   a month calendar (greener = more hours) and the full history, page by page. */
const IST_MS = 330 * 60000;
const istDay = (d = new Date()) => new Date(d.getTime() + IST_MS).toISOString().slice(0, 10);
const dayNum = (iso) => new Date(`${iso}T00:00:00Z`).getUTCDate();

function Attendance() {
  const { att, reloadAtt, openCheckOut } = useTraineePortal();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [, tick] = useState(0);
  const today = att?.today;
  const working = !!(today?.checkIn && !today?.checkOut);
  useEffect(() => {
    if (!working) return undefined;
    const iv = setInterval(() => tick((n) => n + 1), 30000);
    return () => clearInterval(iv);
  }, [working]);
  const days = att?.days || [];
  const pg = usePager(days, 10);

  const checkIn = async () => {
    setBusy(true); setErr("");
    const r = await tApi("/trainee-portal/attendance/check-in", { method: "POST", body: {} });
    setBusy(false);
    if (!r.status) { setErr(r.message || "Couldn't check in"); return; }
    reloadAtt();
  };

  if (!att) return <div className="tp-load">Loading your attendance…</div>;
  const liveMins = today?.checkIn ? Math.max(0, Math.round(((today.checkOut ? new Date(today.checkOut) : new Date()) - new Date(today.checkIn)) / 60000)) : 0;
  const now = istDay();
  const month = now.slice(0, 7);
  const byDate = new Map(days.map((d) => [d.date, d]));
  // streak: consecutive days with a check-in, ending today (or yesterday if today isn't started yet)
  let streak = 0;
  for (let i = byDate.has(now) ? 0 : 1; i < 60; i += 1) {
    if (byDate.has(istDay(new Date(Date.now() - i * 86400000)))) streak += 1; else break;
  }
  const avgDay = att.month.present ? Math.round(att.month.minutes / att.month.present) : 0;
  // month calendar (Mon-first)
  const [y, m] = month.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const lead = (first.getUTCDay() + 6) % 7;
  const nDays = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const cells = [...Array(lead).fill(null), ...Array.from({ length: nDays }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`)];
  const level = (mins) => (!mins ? 0 : mins < 120 ? 1 : mins < 240 ? 2 : mins < 360 ? 3 : 4);

  return (
    <>
      <div className="tp-h">
        <div>
          <h1>Attendance</h1>
          <p>Check in when you start, check out when you finish for the day.</p>
        </div>
      </div>

      <div className="ta-top">
        <section className={`tp-card ta-today${working ? " live" : ""}${today?.checkOut ? " done" : ""}`}>
          <div className="ta-t-l">
            <span className="ta-date">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</span>
            {!today?.checkIn && <><h2>Not checked in yet</h2><p>Tap check in when you start today&apos;s work.</p></>}
            {working && <><h2><i className="ta-dot" />Checked in · {fmtMins(liveMins)}</h2><p>Since {fmtTime(today.checkIn)} — check out when you leave.</p></>}
            {today?.checkOut && <><h2><i className="feather-check-circle" aria-hidden="true" /> Done for today · {fmtMins(liveMins)}</h2><p>{fmtTime(today.checkIn)} – {fmtTime(today.checkOut)}. See you tomorrow!</p></>}
            {err && <div className="tl-err">{err}</div>}
          </div>
          {!today?.checkIn && <button type="button" className="tl-btn ta-big" onClick={checkIn} disabled={busy}><i className="feather-log-in" aria-hidden="true" /> {busy ? "Checking in…" : "Check in"}</button>}
          {working && <button type="button" className="tl-btn ghost ta-big" onClick={openCheckOut}><i className="feather-log-out" aria-hidden="true" /> Check out</button>}
        </section>

        <div className="ta-stats">
          <div className="ta-stat"><i className="feather-calendar" aria-hidden="true" /><span>Days this month</span><b>{att.month.present}</b></div>
          <div className="ta-stat"><i className="feather-clock" aria-hidden="true" /><span>Hours this month</span><b>{fmtMins(att.month.minutes)}</b></div>
          <div className="ta-stat"><i className="feather-bar-chart-2" aria-hidden="true" /><span>Average a day</span><b>{avgDay ? fmtMins(avgDay) : "—"}</b></div>
          <div className="ta-stat"><i className="feather-zap" aria-hidden="true" /><span>Streak</span><b>{streak} day{streak === 1 ? "" : "s"}</b></div>
        </div>
      </div>

      <div className="ta-grid">
        <section className="tp-card ta-cal">
          <div className="ta-ch"><h3>{first.toLocaleDateString("en-IN", { month: "long", year: "numeric", timeZone: "UTC" })}</h3><span>{att.month.present} day{att.month.present === 1 ? "" : "s"}</span></div>
          <div className="ta-wk" aria-hidden="true">{["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <span key={i}>{d}</span>)}</div>
          <div className="ta-days">
            {cells.map((d, i) => {
              if (!d) return <span key={`x${i}`} />;
              const r = byDate.get(d);
              const future = d > now;
              return (
                <span key={d} className={`ta-c l${level(r?.minutes)}${d === now ? " today" : ""}${future ? " fut" : ""}`} title={r ? `${fmtDate(`${d}T00:00:00+05:30`, { day: "numeric", month: "short" })}: ${fmtTime(r.checkIn)} – ${r.checkOut ? fmtTime(r.checkOut) : "now"} · ${fmtMins(r.minutes)}` : undefined}>
                  {dayNum(d)}
                </span>
              );
            })}
          </div>
          <div className="ta-legend"><span>Less</span>{[0, 1, 2, 3, 4].map((l) => <i key={l} className={`l${l}`} />)}<span>More hours</span></div>
        </section>

        <section className="tp-card ta-hist">
          <div className="ta-ch"><h3>History</h3><span>last 60 days</span></div>
          {days.length === 0 ? (
            <div className="tp-empty"><i className="feather-calendar" aria-hidden="true" /><b>No attendance yet</b>Your check-ins will show here.</div>
          ) : (
            <>
              <div className="ta-list">
                {pg.slice.map((d) => (
                  <div key={d._id} className="ta-row">
                    <span className="ta-d"><b>{dayNum(d.date)}</b><small>{new Date(`${d.date}T00:00:00Z`).toLocaleDateString("en-IN", { weekday: "short", month: "short", timeZone: "UTC" })}</small></span>
                    <span className="ta-times">
                      <b>{fmtTime(d.checkIn)} – {d.checkOut ? fmtTime(d.checkOut) : <em className="ta-open">working</em>}</b>
                      {d.note ? <small>{d.note}</small> : d.autoOut ? <small className="ta-auto">Forgot to check out — closed automatically</small> : null}
                    </span>
                    <span className="ta-m">{fmtMins(d.minutes)}</span>
                  </div>
                ))}
              </div>
              <Pager pg={pg} />
            </>
          )}
        </section>
      </div>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
    </>
  );
}

const CSS = `
.ta-top { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr); gap: 14px; margin-bottom: 14px; }
.ta-today { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; border-left: 4px solid #cbd5e1; }
.ta-today.live { border-left-color: #22a35a; background: linear-gradient(135deg, #f0faf3, #fff 60%); }
.ta-today.done { border-left-color: #15803d; }
.ta-t-l { min-width: 0; }
.ta-date { font-size: 11.5px; font-weight: 800; color: #15803d; text-transform: uppercase; letter-spacing: .06em; }
.ta-today h2 { margin: 6px 0 2px; font-size: 18px; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 8px; }
.ta-today h2 i { color: #15803d; }
.ta-today p { margin: 0; font-size: 13px; color: #64748b; }
.ta-dot { width: 9px; height: 9px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 0 4px rgba(34,197,94,.2); display: inline-block; animation: tlPulse 1.6s ease-in-out infinite; }
.ta-big { height: 44px; padding: 0 20px; }
.ta-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
.ta-stat { background: #fff; border: 1px solid #e4ece7; border-radius: 14px; padding: 12px; display: flex; flex-direction: column; gap: 2px; }
.ta-stat i { width: 30px; height: 30px; border-radius: 9px; background: #ecf7ef; color: #15803d; display: grid; place-items: center; font-size: 15px; margin-bottom: 4px; }
.ta-stat span { font-size: 11.5px; color: #64748b; font-weight: 700; }
.ta-stat b { font-size: 18px; font-weight: 800; color: #0f172a; }
.ta-grid { display: grid; grid-template-columns: 340px minmax(0, 1fr); gap: 14px; align-items: start; }
.ta-ch { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; margin-bottom: 12px; }
.ta-ch h3 { margin: 0; font-size: 15.5px; font-weight: 800; color: #0f172a; }
.ta-ch span { font-size: 12px; color: #94a3b8; font-weight: 600; }
.ta-wk, .ta-days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; }
.ta-wk span { text-align: center; font-size: 10.5px; font-weight: 800; color: #94a3b8; }
.ta-days { margin-top: 6px; }
.ta-c { aspect-ratio: 1; border-radius: 8px; display: grid; place-items: center; font-size: 12px; font-weight: 700; color: #64748b; background: #f3f6f4; }
.ta-c.l1 { background: #d5f0dd; color: #14532d; }
.ta-c.l2 { background: #9fdcb2; color: #0f3d24; }
.ta-c.l3 { background: #4cb874; color: #fff; }
.ta-c.l4 { background: #15803d; color: #fff; }
.ta-c.today { box-shadow: 0 0 0 2px #14532d; }
.ta-c.fut { background: transparent; color: #cbd5e1; }
.ta-legend { display: flex; align-items: center; gap: 4px; justify-content: flex-end; margin-top: 10px; font-size: 11px; color: #94a3b8; }
.ta-legend i { width: 12px; height: 12px; border-radius: 3px; background: #f3f6f4; }
.ta-legend i.l1 { background: #d5f0dd; } .ta-legend i.l2 { background: #9fdcb2; } .ta-legend i.l3 { background: #4cb874; } .ta-legend i.l4 { background: #15803d; }
.ta-legend span { margin: 0 4px; }
.ta-list { display: grid; }
.ta-row { display: grid; grid-template-columns: 54px minmax(0, 1fr) auto; gap: 12px; align-items: center; padding: 10px 2px; border-top: 1px solid #f1f5f3; }
.ta-row:first-child { border-top: 0; }
.ta-d { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 46px; border-radius: 12px; background: #f6faf7; line-height: 1.1; }
.ta-d b { font-size: 17px; font-weight: 800; color: #14532d; }
.ta-d small { font-size: 10.5px; color: #64748b; font-weight: 700; }
.ta-times { display: flex; flex-direction: column; min-width: 0; }
.ta-times b { font-size: 13.5px; font-weight: 700; color: #0f172a; }
.ta-times small { font-size: 12px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ta-times small.ta-auto { color: #b45309; }
.ta-open { font-style: normal; color: #15803d; }
.ta-m { font-size: 13.5px; font-weight: 800; color: #14532d; background: #ecf7ef; border-radius: 999px; padding: 4px 10px; white-space: nowrap; }
@media (max-width: 1100px) { .ta-top { grid-template-columns: 1fr; } .ta-grid { grid-template-columns: 1fr; } .ta-cal { max-width: 420px; } }
@media (max-width: 640px) { .ta-stats { grid-template-columns: 1fr 1fr; } .ta-today .tl-btn { width: 100%; } .ta-cal { max-width: none; } }
`;

export default function AttendancePage() {
  return <TraineeLayout title="Attendance"><Attendance /></TraineeLayout>;
}
