import React, { useState } from "react";
import { Dialog } from "@mui/material";
import { postData } from "../../utils/actions";
import { rescheduleSessionUrl } from "../../utils/url";

/* Therapist moves an upcoming session. Times are entered in IST; the client is emailed and,
   if the session has a Google Meet, the calendar event moves too. */
const istParts = (d) => {
  const x = new Date(d);
  const date = x.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const time = x.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" });
  return { date, time };
};

export default function RescheduleDialog({ booking, onClose, onDone }) {
  const start = booking?.date ? istParts(booking.date) : { date: "", time: "" };
  const [date, setDate] = useState(start.date);
  const [time, setTime] = useState(start.time);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

  const save = async () => {
    setErr("");
    if (!date || !time) { setErr("Pick a date and time"); return; }
    const when = new Date(`${date}T${time}:00+05:30`);
    if (isNaN(when)) { setErr("Pick a valid date and time"); return; }
    if (booking?.date && Math.abs(when - new Date(booking.date)) < 60000) { setErr("That's the current time — pick a new one"); return; }
    setBusy(true);
    try {
      const r = await postData(rescheduleSessionUrl(booking.id), { booking_date: when.toISOString(), reason });
      if (r?.status) { onDone && onDone(r.data?.booking_date || when.toISOString(), r.message); onClose(); }
      else setErr(r?.message || "Couldn't reschedule");
    } catch (e) {
      setErr(e?.response?.data?.message || "Couldn't reschedule — please try again");
    }
    setBusy(false);
  };

  return (
    <Dialog open={!!booking} onClose={() => !busy && onClose()} maxWidth="xs" fullWidth PaperProps={{ style: { borderRadius: 18, margin: 16, width: "calc(100% - 32px)" } }}>
      <style dangerouslySetInnerHTML={{ __html: RS_CSS }} />
      <div className="rs">
        <h3>Reschedule session</h3>
        <p>{booking?.name ? <>With <b>{booking.name}</b>. </> : null}The client gets an email with the new time{booking?.meet ? " and their Google Calendar invite moves too" : ""}.</p>
        <div className="rs-row">
          <label><span>New date</span><input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} /></label>
          <label><span>New time (IST)</span><input type="time" step="900" value={time} onChange={(e) => setTime(e.target.value)} /></label>
        </div>
        <label className="rs-full"><span>Note for the client <small>optional</small></span>
          <input type="text" maxLength={300} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Clinic closed that day — sorry for the change" />
        </label>
        {err && <div className="rs-err" role="alert">{err}</div>}
        <div className="rs-acts">
          <button type="button" className="rs-btn ghost" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="button" className="rs-btn primary" onClick={save} disabled={busy}>{busy ? "Saving…" : "Reschedule"}</button>
        </div>
      </div>
    </Dialog>
  );
}

const RS_CSS = `
.rs { padding: 20px; font-family: Inter, system-ui, sans-serif; color: #0f172a; }
.rs h3 { font-size: 18px; font-weight: 800; margin: 0 0 4px; font-family: inherit; }
.rs p { font-size: 13px; color: #64748b; margin: 0 0 14px; line-height: 1.5; }
.rs-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.rs label { display: flex; flex-direction: column; gap: 5px; margin: 0 0 10px; }
.rs label span { font-size: 12.5px; font-weight: 700; color: #334155; }
.rs label small { font-weight: 600; color: #94a3b8; }
.rs input { height: 44px; border: 1px solid #d6e0da; border-radius: 10px; padding: 0 12px; font-size: 15px; font-family: inherit; color: #0f172a; background: #fff; width: 100%; box-sizing: border-box; }
.rs input:focus { outline: none; border-color: #166534; box-shadow: 0 0 0 3px rgba(22,101,52,.12); }
.rs-err { font-size: 13px; color: #b91c1c; background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 8px 12px; margin-bottom: 10px; }
.rs-acts { display: flex; gap: 8px; justify-content: flex-end; margin-top: 4px; }
.rs-btn { height: 42px; padding: 0 18px; border-radius: 10px; font-weight: 700; font-size: 14px; cursor: pointer; font-family: inherit; border: 1px solid transparent; }
.rs-btn.primary { background: #166534; color: #fff; } .rs-btn.primary:hover { background: #0f3d24; }
.rs-btn.ghost { background: #fff; color: #475569; border-color: #e2e8f0; }
.rs-btn:disabled { opacity: .6; cursor: default; }
@media (max-width: 420px) { .rs-row { grid-template-columns: 1fr; gap: 0; } .rs input { font-size: 16px; } }
`;
