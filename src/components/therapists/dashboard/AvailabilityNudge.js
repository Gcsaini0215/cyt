import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { fetchData } from "../../../utils/actions";
import { getBookings } from "../../../utils/url";
import { getToken } from "../../../utils/jwt";

/* Shown once per login on the therapist dashboard: "are your timings for this week right?"
   — nudges therapists to keep their availability up to date. */

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const SEEN_KEY = "cyt_avail_nudge_for";

function toMinutes(t) {
  if (!t) return null;
  const lower = t.trim().toLowerCase();
  const isPm = lower.endsWith("pm");
  const isAm = lower.endsWith("am");
  const [hStr, mStr] = lower.replace("am", "").replace("pm", "").trim().split(":");
  let h = parseInt(hStr, 10);
  if (Number.isNaN(h)) return null;
  const m = parseInt(mStr, 10) || 0;
  if (isPm && h !== 12) h += 12;
  if (isAm && h === 12) h = 0;
  return h * 60 + m;
}
const label = (m) => `${Math.floor(m / 60) % 12 || 12}:${String(m % 60).padStart(2, "0")} ${m < 720 ? "AM" : "PM"}`;

export default function AvailabilityNudge({ therapistInfo, blocked }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [bookings, setBookings] = useState([]);

  const loginKey = typeof window !== "undefined" ? (getToken() || "").slice(-24) : "";

  useEffect(() => {
    if (blocked || !therapistInfo?.user?.email || !loginKey) return undefined;
    let seen = "";
    try { seen = localStorage.getItem(SEEN_KEY) || ""; } catch { /* storage blocked */ }
    if (seen === loginKey) return undefined;
    let alive = true;
    fetchData(getBookings).then((r) => { if (alive && r?.status) setBookings(r.data || []); }).catch(() => {});
    const t = setTimeout(() => alive && setOpen(true), 700);
    return () => { alive = false; clearTimeout(t); };
  }, [blocked, therapistInfo?.user?.email, loginKey]);

  const avail = useMemo(() => therapistInfo?.availabilities || [], [therapistInfo?.availabilities]);
  const summary = useMemo(() => {
    const now = new Date();
    const taken = new Set(bookings.filter((b) => b.status !== "Cancelled").map((b) => new Date(b.booking_date).getTime()));
    let hoursWeek = 0, free = 0, nextFree = null;
    const perDay = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(now); d.setDate(d.getDate() + i); d.setHours(0, 0, 0, 0);
      const av = avail.find((a) => a.day === DAYS[d.getDay()]);
      let dayHrs = 0;
      (av?.times || []).forEach(({ open: o, close: c }) => {
        const s = toMinutes(o), e = toMinutes(c);
        if (s == null || e == null) return;
        for (let m = s; m + 60 <= e; m += 60) {
          dayHrs++;
          const at = new Date(d); at.setHours(Math.floor(m / 60), m % 60, 0, 0);
          if (at > now && !taken.has(at.getTime())) {
            free++;
            if (!nextFree) nextFree = `${i === 0 ? "Today" : i === 1 ? "Tomorrow" : SHORT[d.getDay()]}, ${label(m)}`;
          }
        }
      });
      hoursWeek += dayHrs;
      perDay.push({ day: SHORT[d.getDay()], hrs: dayHrs });
    }
    return { hoursWeek, free, nextFree, perDay };
  }, [avail, bookings]);

  const close = () => {
    try { localStorage.setItem(SEEN_KEY, loginKey); } catch { /* ignore */ }
    setOpen(false);
  };
  const update = () => { close(); router.push("/my-schedule?tab=availability"); };

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null;
  const hasHours = summary.hoursWeek > 0;

  return (
    <div className="avn" role="dialog" aria-modal="true" aria-labelledby="avn-title" onClick={(e) => e.target === e.currentTarget && close()}>
      <style dangerouslySetInnerHTML={{ __html: `
        .avn { position: fixed; inset: 0; z-index: 1400; background: rgba(15,23,20,.45); display: flex; align-items: center; justify-content: center; padding: 16px; animation: avnFade .2s ease; }
        @keyframes avnFade { from { opacity: 0; } to { opacity: 1; } }
        .avn-box { position: relative; width: 100%; max-width: 440px; background: #fff; border-radius: 18px; padding: 24px 22px 20px; box-shadow: 0 30px 70px rgba(15,61,34,.3); animation: avnPop .22s cubic-bezier(.2,.9,.3,1.2); }
        @keyframes avnPop { from { opacity: 0; transform: translateY(10px) scale(.97); } to { opacity: 1; transform: none; } }
        .avn-x { position: absolute; top: 12px; right: 12px; width: 32px; height: 32px; border-radius: 50%; border: none; background: #f1f5f9; color: #64748b; cursor: pointer; font-size: 16px; }
        .avn-icon { width: 48px; height: 48px; border-radius: 14px; background: #f0fdf4; color: #166534; display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 12px; }
        .avn-icon.warn { background: #fffbeb; color: #b45309; }
        .avn h2 { font-size: 19px; font-weight: 800; color: #122019; margin: 0 0 6px; padding-right: 30px; }
        .avn p { font-size: 13.5px; color: #64748b; line-height: 1.55; margin: 0 0 14px; }
        .avn-week { display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; margin-bottom: 14px; }
        .avn-day { text-align: center; border-radius: 9px; padding: 7px 0; background: #f8fafc; border: 1px solid #eef2f0; }
        .avn-day b { display: block; font-size: 11px; color: #64748b; font-weight: 700; }
        .avn-day span { font-size: 13px; font-weight: 800; color: #cbd5e1; }
        .avn-day.on { background: #f0fdf4; border-color: #bbf7d0; }
        .avn-day.on span { color: #166534; }
        .avn-facts { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
        .avn-facts div { flex: 1; min-width: 110px; border: 1px solid #eef2f0; border-radius: 10px; padding: 9px 11px; }
        .avn-facts small { display: block; font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: .4px; }
        .avn-facts strong { font-size: 14.5px; color: #122019; }
        .avn-btns { display: flex; gap: 8px; }
        .avn-btns button { flex: 1; height: 46px; border-radius: 11px; font-weight: 800; font-size: 14px; cursor: pointer; font-family: inherit; }
        .avn-primary { border: none; background: #1a6b3a; color: #fff; }
        .avn-ghost { border: 1px solid #d5e3da; background: #fff; color: #334155; }
      ` }} />
      <div className="avn-box">
        <button type="button" className="avn-x" onClick={close} aria-label="Close">✕</button>
        <div className={`avn-icon ${hasHours ? "" : "warn"}`}><i className="feather-clock" /></div>
        <h2 id="avn-title">{hasHours ? "Are your timings right for this week?" : "Set your appointment timings"}</h2>
        <p>
          {hasHours
            ? "Clients can only book the hours you've opened. Take a moment to add, remove or change hours for the next few days."
            : "You haven't set any hours yet, so clients can't book a session with you. It takes a minute."}
        </p>
        {hasHours && (
          <>
            <div className="avn-week" aria-label="Hours set for the next 7 days">
              {summary.perDay.map((d, i) => (
                <div key={i} className={`avn-day ${d.hrs ? "on" : ""}`}><b>{d.day}</b><span>{d.hrs ? `${d.hrs}h` : "—"}</span></div>
              ))}
            </div>
            <div className="avn-facts">
              <div><small>Open slots (7 days)</small><strong>{summary.free}</strong></div>
              <div><small>Next free slot</small><strong>{summary.nextFree || "—"}</strong></div>
            </div>
          </>
        )}
        <div className="avn-btns">
          <button type="button" className="avn-primary" onClick={update}>{hasHours ? "Update timings" : "Set my timings"}</button>
          <button type="button" className="avn-ghost" onClick={close}>{hasHours ? "Looks good" : "Later"}</button>
        </div>
      </div>
    </div>
  );
}
