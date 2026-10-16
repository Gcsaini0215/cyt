import React from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { imagePath } from "../../utils/url";
import { profilePath } from "../../utils/therapist-slug";
import { joinSession } from "../../utils/join-session";
import { sessionWindow, opensAtText } from "../../utils/session-window";
import SessionTicket from "./session-ticket";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import StarRateRoundedIcon from "@mui/icons-material/StarRateRounded";
import FamilyRestroomRoundedIcon from "@mui/icons-material/FamilyRestroomRounded";

/* One booking as the client sees it: who/when, a step tracker (Booked → Paid → Confirmed →
   Join → Done → Review) and the one action that matters right now. */

const TZ = "Asia/Kolkata";
export const fmtWhen = (d) => {
  const x = new Date(d);
  if (isNaN(x)) return "";
  return x.toLocaleString("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true, timeZone: TZ });
};
export const dayKey = (d) => new Date(d).toLocaleDateString("en-CA", { timeZone: TZ });
export const isInPerson = (b) => /offline|in[- ]?person|clinic/i.test(`${b.format || ""} ${b.session_type || ""}`);
export const isPaid = (b) => b.payment_status === "Paid" || /success|paid/i.test(b.transaction?.status?.name || "") || !!b.transaction;
export const therapistName = (b) => b.therapist?.user?.name || "Your therapist";
export const therapistPhoto = (b) => {
  const p = b.therapist?.user?.profile;
  if (!p || p === "null") return "";
  return /^https?:/.test(p) ? p : `${imagePath}/${p}`;
};
export const therapistLink = (b) => (b.therapist?._id ? profilePath({ _id: b.therapist._id, profile_type: b.therapist.profile_type, user: b.therapist.user, state: b.therapist.state }) : "/view-all-therapist");

// which step the booking is on, and the one action for now
export function bookingState(b, now = Date.now()) {
  if (b.status === "Cancelled") return { cancelled: true };
  const paid = isPaid(b);
  const online = !isInPerson(b);
  const w = sessionWindow(b.booking_date, now);
  const done = b.status === "Completed";
  const live = b.status === "Started";
  const steps = [
    { key: "booked", label: "Booked", done: true },
    { key: "paid", label: "Paid", done: paid },
    { key: "ready", label: online ? (b.meet_link ? "Meet link ready" : "Confirmed") : "Confirmed", done: paid },
    { key: "join", label: online ? "Join" : "Visit clinic", done: done || live || !!b.client_joined_at },
    { key: "done", label: "Session done", done },
    { key: "review", label: "Review", done: false },
  ];
  const current = steps.findIndex((s) => !s.done);
  let hint = "";
  if (!paid) hint = "Waiting for payment confirmation.";
  else if (done) hint = "How did it go? A short review helps others find the right therapist.";
  else if (live) hint = online ? "Your session is on — rejoin any time if the call drops." : "Your session is in progress.";
  else if (w.before) hint = online ? `Join opens at ${opensAtText(w.opens)} — 15 minutes before your session.` : "Please reach the clinic a few minutes early.";
  else if (w.open) hint = online ? "Your session is about to start — tap Join." : "It's time — please head in.";
  else hint = "This session's time has passed. Contact us if it didn't happen.";
  return { steps, current, hint, online, w, done, live, paid };
}

export function BookingSteps({ state }) {
  if (state.cancelled) return null;
  return (
    <ol className="csc-steps" aria-label="Booking progress">
      {state.steps.map((s, i) => (
        <li key={s.key} className={s.done ? "done" : i === state.current ? "now" : ""}>
          <span className="dot" aria-hidden="true">{s.done ? "✓" : i + 1}</span>
          <span className="lbl">{s.label}</span>
        </li>
      ))}
    </ol>
  );
}

export default function SessionCard({ b, now, compact }) {
  const [ticket, setTicket] = React.useState(false);
  const st = bookingState(b, now);
  const photo = therapistPhoto(b);
  const name = therapistName(b);
  const forOther = /other/i.test(b.whom || "") && b.cname;
  const amount = Number(b.transaction?.amount ?? b.amount?.$numberDecimal ?? b.amount) || 0;
  const statusLabel = st.cancelled ? "Cancelled" : st.done ? "Completed" : st.live ? "In session" : st.w?.after ? "Missed" : "Upcoming";
  const statusKey = st.cancelled ? "cancel" : st.done ? "done" : st.live ? "live" : st.w?.after ? "missed" : "new";
  const join = () => joinSession(b._id, b.meet_link).catch((e) => toast.error(e.message));

  let action = null;
  if (!st.cancelled && st.online && (st.live || (b.status === "New" && st.w.open))) {
    action = <button type="button" className="csc-btn primary" onClick={join}><VideocamRoundedIcon /> {st.live ? "Rejoin" : "Join now"}</button>;
  } else if (!st.cancelled && st.online && b.status === "New" && st.w.before) {
    action = <span className="csc-btn wait"><VideocamRoundedIcon /> Join at {opensAtText(st.w.opens)}</span>;
  } else if (st.done) {
    action = <a className="csc-btn primary" href={`${therapistLink(b)}#write-review`}><StarRateRoundedIcon /> Leave a review</a>;
  }

  return (
    <article className={`csc ${statusKey}${compact ? " compact" : ""}`}>
      <div className="csc-top">
        <div className="csc-av">{photo ? <img src={photo} alt="" /> : name.replace(/^dr\.?\s*/i, "").charAt(0)}</div>
        <div className="csc-who">
          <b>{name}</b>
          <span>{b.therapist?.profile_type || b.service || "Session"}</span>
        </div>
        <span className={`csc-st ${statusKey}`}>{statusLabel}</span>
      </div>

      <div className="csc-when">
        <b>{fmtWhen(b.booking_date)}</b>
        <span>{st.online ? <><VideocamRoundedIcon /> Online</> : <><PlaceRoundedIcon /> In person</>}{b.service ? ` · ${b.service}` : ""}</span>
        {forOther && <span><FamilyRestroomRoundedIcon /> For {b.cname}{b.relation_with_client ? ` (${b.relation_with_client})` : ""}</span>}
      </div>

      {!compact && <BookingSteps state={st} />}
      {!st.cancelled && st.hint && <p className="csc-hint">{st.hint}</p>}

      <div className="csc-acts">
        {action}
        {(st.done || st.cancelled || st.w?.after) && (
          <Link href={therapistLink(b)} className="csc-btn soft"><ReplayRoundedIcon /> Book again</Link>
        )}
        {!compact && amount > 0 && st.paid && (
          <button type="button" className="csc-btn ghost" onClick={() => setTicket(true)}>
            <ReceiptLongRoundedIcon /> Invoice
          </button>
        )}
      </div>
      {ticket && <SessionTicket b={b} onClose={() => setTicket(false)} />}
    </article>
  );
}

export const CSC_CSS = `
.csc { background: #fff; border: 1px solid #e4ece7; border-left: 3px solid #0369a1; border-radius: 16px; padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; min-width: 0; }
.csc.live { border-left-color: #d97706; } .csc.done { border-left-color: #16a34a; } .csc.cancel, .csc.missed { border-left-color: #94a3b8; }
.csc-top { display: flex; align-items: center; gap: 12px; min-width: 0; }
.csc-av { width: 44px; height: 44px; border-radius: 13px; background: #e7f6ec; color: #166534; display: grid; place-items: center; font-weight: 800; font-size: 16px; flex-shrink: 0; overflow: hidden; }
.csc-av img { width: 100%; height: 100%; object-fit: cover; }
.csc-who { flex: 1; min-width: 0; }
.csc-who b { display: block; font-size: 15.5px; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.csc-who span { display: block; font-size: 12.5px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.csc-st { font-size: 11px; font-weight: 800; border-radius: 999px; padding: 3px 10px; white-space: nowrap; flex-shrink: 0; }
.csc-st.new { background: #e0f2fe; color: #0369a1; } .csc-st.live { background: #fef3c7; color: #b45309; } .csc-st.done { background: #e7f6ec; color: #166534; }
.csc-st.cancel { background: #fee2e2; color: #b91c1c; } .csc-st.missed { background: #f1f5f9; color: #475569; }
.csc-when { display: flex; flex-direction: column; gap: 3px; background: #f6f8f7; border-radius: 12px; padding: 10px 12px; }
.csc-when b { font-size: 14.5px; font-weight: 800; }
.csc-when span { display: flex; align-items: center; gap: 5px; font-size: 12.5px; color: #475569; }
.csc-when svg { font-size: 16px; color: #166534; }
.csc-steps { list-style: none; margin: 2px 0 0; padding: 0; display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); position: relative; }
.csc-steps li { display: flex; flex-direction: column; align-items: center; gap: 4px; text-align: center; position: relative; margin: 0; }
.csc-steps li::before { content: ""; position: absolute; top: 11px; right: 50%; width: 100%; height: 2px; background: #e2e8f0; z-index: 0; }
.csc-steps li:first-child::before { display: none; }
.csc-steps li.done::before, .csc-steps li.now::before { background: #16a34a; }
.csc-steps .dot { position: relative; z-index: 1; width: 24px; height: 24px; border-radius: 50%; background: #fff; border: 2px solid #cbd5e1; color: #94a3b8; font-size: 11px; font-weight: 800; display: grid; place-items: center; }
.csc-steps li.done .dot { background: #16a34a; border-color: #16a34a; color: #fff; }
.csc-steps li.now .dot { border-color: #16a34a; color: #166534; box-shadow: 0 0 0 4px rgba(22,163,74,.15); }
.csc-steps .lbl { font-size: 10.5px; font-weight: 700; color: #94a3b8; line-height: 1.2; }
.csc-steps li.done .lbl { color: #166534; } .csc-steps li.now .lbl { color: #0f172a; }
.csc-hint { margin: 0; font-size: 13px; color: #334155; line-height: 1.5; }
.csc-acts { display: flex; flex-wrap: wrap; gap: 8px; }
.csc-acts:empty { display: none; }
.csc-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 40px; padding: 0 14px; border-radius: 11px; font-size: 13.5px; font-weight: 700;
  text-decoration: none !important; cursor: pointer; border: 1px solid transparent; font-family: inherit; white-space: nowrap; }
.csc-btn svg { font-size: 18px; }
.csc-btn.primary { background: linear-gradient(135deg, #14532d, #16a34a); color: #fff !important; flex: 1; min-width: 140px; }
.csc-btn.wait { background: #f1f5f9; color: #475569; flex: 1; min-width: 140px; cursor: default; }
.csc-btn.soft { background: #fff; color: #166534 !important; border-color: #cfe3d6; }
.csc-btn.ghost { background: #fff; color: #475569 !important; border-color: #e2e8f0; }
.csc.compact .csc-when { padding: 8px 10px; }
@media (max-width: 480px) {
  .csc { padding: 12px; }
  .csc-steps .lbl { font-size: 9.5px; }
  .csc-btn { height: 40px; flex: 1; }
}
`;
