import React, { useEffect, useState } from "react";
import TraineeLayout, { useTraineePortal } from "../../components/trainee/trainee-layout";
import { tApi, fmtTime, fmtDate, fmtMins } from "../../utils/trainee-api";

/* Attendance: check in when you join, check out when you leave; your last 60 days below. */
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

  const checkIn = async () => {
    setBusy(true); setErr("");
    const r = await tApi("/trainee-portal/attendance/check-in", { method: "POST", body: {} });
    setBusy(false);
    if (!r.status) { setErr(r.message || "Couldn't check in"); return; }
    reloadAtt();
  };

  if (!att) return <div className="tp-load">Loading your attendance…</div>;
  const liveMins = today?.checkIn ? Math.max(0, Math.round(((today.checkOut ? new Date(today.checkOut) : new Date()) - new Date(today.checkIn)) / 60000)) : 0;
  const now = new Date();

  return (
    <>
      <div className="tp-h">
        <div>
          <h1>Attendance</h1>
          <p>Check in when you start, check out when you finish for the day.</p>
        </div>
      </div>

      <div className="ta-top">
        <div className={`ta-today${working ? " live" : ""}${today?.checkOut ? " done" : ""}`}>
          <div className="ta-date">{now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</div>
          {!today?.checkIn && (
            <>
              <h2>You haven&apos;t checked in yet</h2>
              <p>Tap check in when you join today&apos;s session or start your work.</p>
              <button type="button" className="tl-btn ta-big" onClick={checkIn} disabled={busy}>
                <i className="feather-log-in" aria-hidden="true" /> {busy ? "Checking in…" : "Check in now"}
              </button>
            </>
          )}
          {working && (
            <>
              <h2><i className="ta-dot" />You&apos;re checked in</h2>
              <div className="ta-clock">{fmtMins(liveMins)}</div>
              <p>Since {fmtTime(today.checkIn)}. Don&apos;t forget to check out when you leave.</p>
              <button type="button" className="tl-btn gold ta-big" onClick={openCheckOut}>
                <i className="feather-log-out" aria-hidden="true" /> Check out
              </button>
            </>
          )}
          {today?.checkOut && (
            <>
              <h2><i className="feather-check-circle" aria-hidden="true" /> Done for today</h2>
              <div className="ta-clock">{fmtMins(liveMins)}</div>
              <p>{fmtTime(today.checkIn)} – {fmtTime(today.checkOut)}. See you tomorrow!</p>
            </>
          )}
          {err && <div className="tl-err">{err}</div>}
        </div>
        <div className="ta-stats">
          <div className="ta-stat"><span>Days this month</span><b>{att.month.present}</b></div>
          <div className="ta-stat"><span>Hours this month</span><b>{fmtMins(att.month.minutes)}</b></div>
          <div className="ta-stat"><span>Days in total</span><b>{att.total.present}</b></div>
        </div>
      </div>

      <div className="tp-card ta-hist">
        <h3>Your history <small>last 60 days</small></h3>
        {att.days.length === 0 ? (
          <div className="tp-empty"><i className="feather-calendar" aria-hidden="true" /><b>No attendance yet</b>Your check-ins will show here.</div>
        ) : (
          <div className="ta-list">
            <div className="ta-row ta-head" aria-hidden="true"><span>Date</span><span>Check in</span><span>Check out</span><span>Time</span><span>Worked on</span></div>
            {att.days.map((d) => (
              <div key={d._id} className="ta-row">
                <span className="ta-d"><b>{fmtDate(`${d.date}T00:00:00+05:30`, { day: "numeric", month: "short" })}</b><small>{new Date(`${d.date}T00:00:00+05:30`).toLocaleDateString("en-IN", { weekday: "short" })}</small></span>
                <span data-l="In">{fmtTime(d.checkIn)}</span>
                <span data-l="Out">{d.checkOut ? fmtTime(d.checkOut) : <em className="ta-open">Working</em>}{d.autoOut && <em className="ta-auto" title="You forgot to check out — closed automatically">auto</em>}</span>
                <span data-l="Time" className="ta-m">{fmtMins(d.minutes)}</span>
                <span className={`ta-note${d.note ? "" : " empty"}`}>{d.note || <i>—</i>}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
    </>
  );
}

const CSS = `
.ta-top { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); gap: 16px; margin-bottom: 16px; }
.ta-today { background: #fff; border: 1px solid #e4ece7; border-radius: 18px; padding: 24px; }
.ta-today.live { background: linear-gradient(135deg, #f0faf3, #fff 60%); border-color: #cfe9d8; }
.ta-today.done { background: linear-gradient(135deg, #fffaf0, #fff 60%); border-color: #f1e2bd; }
.ta-date { font-size: 12.5px; font-weight: 800; color: #8a5a0b; text-transform: uppercase; letter-spacing: .06em; }
.ta-today h2 { margin: 8px 0 4px; font-size: 21px; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 10px; }
.ta-today h2 i { color: #15803d; }
.ta-today p { margin: 0 0 16px; font-size: 14px; color: #64748b; }
.ta-clock { font-size: 38px; font-weight: 800; color: #14532d; letter-spacing: -.02em; margin: 2px 0 2px; }
.ta-dot { width: 10px; height: 10px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 0 4px rgba(34,197,94,.22); display: inline-block; animation: tlPulse 1.6s ease-in-out infinite; }
.ta-big { height: 48px; padding: 0 22px; font-size: 15px; }
.ta-stats { display: grid; grid-template-rows: repeat(3, 1fr); gap: 12px; }
.ta-stat { background: #fff; border: 1px solid #e4ece7; border-radius: 16px; padding: 14px 18px; display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.ta-stat span { font-size: 13.5px; color: #64748b; font-weight: 700; }
.ta-stat b { font-size: 22px; font-weight: 800; color: #0f172a; }
.ta-hist h3 { margin: 0 0 14px; font-size: 17px; font-weight: 800; color: #0f172a; }
.ta-hist h3 small { font-size: 12.5px; color: #94a3b8; font-weight: 600; margin-left: 6px; }
.ta-row { display: grid; grid-template-columns: 110px 100px 130px 90px minmax(0, 1fr); gap: 12px; align-items: center; padding: 12px 6px; border-top: 1px solid #eef2f0; font-size: 14px; color: #1e293b; }
.ta-head { border-top: none; font-size: 12px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: .05em; padding-top: 0; }
.ta-d { display: flex; flex-direction: column; line-height: 1.2; }
.ta-d small { font-size: 12px; color: #94a3b8; }
.ta-m { font-weight: 800; color: #14532d; }
.ta-note { color: #475569; font-size: 13.5px; overflow-wrap: anywhere; }
.ta-note i { color: #cbd5e1; font-style: normal; }
.ta-open { font-style: normal; color: #15803d; font-weight: 700; }
.ta-auto { font-style: normal; margin-left: 6px; font-size: 11px; font-weight: 800; color: #b45309; background: #fff7e6; border-radius: 999px; padding: 1px 7px; }
@media (max-width: 900px) { .ta-top { grid-template-columns: 1fr; } .ta-stats { grid-template-rows: none; grid-template-columns: repeat(3, 1fr); } .ta-stat { flex-direction: column; align-items: flex-start; } }
@media (max-width: 700px) {
  .ta-head { display: none; }
  .ta-row { grid-template-columns: 1fr 1fr 1fr; gap: 6px 10px; padding: 12px 2px; }
  .ta-d { grid-column: 1 / -1; flex-direction: row; gap: 8px; align-items: baseline; }
  .ta-row > span[data-l]::before { content: attr(data-l); display: block; font-size: 11px; color: #94a3b8; font-weight: 700; }
  .ta-note { grid-column: 1 / -1; }
  .ta-note.empty { display: none; }
  .ta-today { padding: 18px; }
  .ta-clock { font-size: 32px; }
  .ta-stat { padding: 12px; } .ta-stat b { font-size: 18px; } .ta-stat span { font-size: 12px; }
}
`;

export default function AttendancePage() {
  return <TraineeLayout title="Attendance"><Attendance /></TraineeLayout>;
}
