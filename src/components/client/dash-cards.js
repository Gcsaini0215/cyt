import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchById, postData } from "../../utils/actions";
import { MyReferralUrl, SaveReviewUrl } from "../../utils/url";
import { bookPath } from "../../utils/therapist-slug";
import { fmtWhen, therapistName, therapistPhoto } from "./session-card";
import EventRepeatRoundedIcon from "@mui/icons-material/EventRepeatRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import CardGiftcardRoundedIcon from "@mui/icons-material/CardGiftcardRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import IosShareRoundedIcon from "@mui/icons-material/IosShareRounded";
import HourglassTopRoundedIcon from "@mui/icons-material/HourglassTopRounded";
import EventBusyRoundedIcon from "@mui/icons-material/EventBusyRounded";

/* Client home cards that bring people back: finish a booking left unpaid, book the next session,
   review the last one, refer a friend. (Self-check / family / meeting in person are in the portal menu — client-shell.) */

const SITE = "https://www.chooseyourtherapist.in";
const WA_HELP = "https://wa.me/918077757951?text=";
const DAY = 24 * 60 * 60 * 1000;

// Same weekday and time as the last session, the first such slot at least a day away.
export const nextSameSlot = (b, now = Date.now()) => {
  const t = new Date(b?.booking_date);
  if (isNaN(t)) return null;
  let n = t.getTime() + 7 * DAY;
  while (n < now + DAY) n += 7 * DAY;
  return new Date(n);
};

// /book/<slug>?svc=&fmt=[&at=] — the booking page preselects these
export const bookAgainPath = (b, at) => {
  const p = new URLSearchParams();
  if (b?.service) p.set("svc", b.service);
  if (b?.format) p.set("fmt", b.format);
  if (at) p.set("at", at.toISOString());
  const q = p.toString();
  return `${bookPath(b.therapist)}${q ? `?${q}` : ""}`;
};

const Avatar = ({ b, size }) => {
  const photo = therapistPhoto(b);
  const name = therapistName(b);
  return (
    <span className="dc-av" style={size ? { width: size, height: size } : undefined}>
      {photo ? <img src={photo} alt="" /> : name.replace(/^dr\.?\s*/i, "").charAt(0)}
    </span>
  );
};

/* #0 — a booking left at the payment step (GET /my-pending-bookings): pay for the same slot,
   or pick another time if someone else has booked it since */
export function PendingCard({ p }) {
  const name = therapistName(p);
  const amount = Number(p.amount?.$numberDecimal ?? p.amount) || 0;
  const mode = /in[- ]?person|offline/i.test(p.format || "") ? "In person" : /audio/i.test(p.format || "") ? "Voice call" : "Video call";
  const taken = p.state === "taken";
  return (
    <div className={`dc-pend${taken ? " taken" : ""}`}>
      <div className="dc-pend-top">
        <Avatar b={p} />
        <div className="dc-pend-txt">
          <span className="dc-pend-eye">{taken ? <><EventBusyRoundedIcon /> Slot no longer free</> : <><HourglassTopRoundedIcon /> Payment pending</>}</span>
          <b>{name}</b>
          <span>{fmtWhen(p.booking_date)} · {mode}{amount ? ` · ₹${amount.toLocaleString("en-IN")}` : ""}</span>
        </div>
      </div>
      <p>{taken
        ? "Someone else booked this time before payment went through. Pick another time with the same therapist."
        : "Your booking isn't confirmed yet. Complete the payment to confirm it — until then someone else can book this time."}</p>
      <div className="dc-actions">
        {taken
          ? <Link href={bookAgainPath(p)} className="dc-btn green">Pick another time</Link>
          : <Link href={`/complete-payment/${p._id}`} className="dc-btn green">Complete payment</Link>}
        {!taken && <Link href={bookAgainPath(p)} className="dc-btn link">Change time</Link>}
      </div>
    </div>
  );
}

/* #1 — continue with the same therapist, same time next week. `missed`: that session was never
   started or marked done — don't say "last session", offer a new time and help instead */
export function RebookCard({ b, now, missed }) {
  const at = nextSameSlot(b, now);
  const name = therapistName(b);
  const first = name.replace(/^dr\.?\s*/i, "").split(/\s+/)[0];
  const atLabel = at ? fmtWhen(at) : "";
  if (missed) {
    const wa = WA_HELP + encodeURIComponent(`Hi CYT team, my session with ${name} on ${fmtWhen(b.booking_date)} didn't take place. Please help.`);
    return (
      <div className="dc-rebook">
        <div className="dc-rebook-top">
          <Avatar b={b} size={56} />
          <div className="dc-rebook-txt">
            <span className="dc-eyebrow"><EventBusyRoundedIcon /> Session not marked as done</span>
            <b>Book a new time with {name}</b>
            <span>Booked for {fmtWhen(b.booking_date)}{b.service ? ` · ${b.service}` : ""}</span>
          </div>
        </div>
        <p>If this session didn't happen, pick a new time with {first} — or message us and we'll sort it out.</p>
        <div className="dc-actions">
          <Link href={bookAgainPath(b)} className="dc-btn gold">Pick a new time</Link>
          <a href={wa} target="_blank" rel="noopener noreferrer" className="dc-btn ghost">Talk to us</a>
        </div>
      </div>
    );
  }
  return (
    <div className="dc-rebook">
      <div className="dc-rebook-top">
        <Avatar b={b} size={56} />
        <div className="dc-rebook-txt">
          <span className="dc-eyebrow"><EventRepeatRoundedIcon /> Keep the momentum going</span>
          <b>Continue with {name}</b>
          <span>Last session · {fmtWhen(b.booking_date)}{b.service ? ` · ${b.service}` : ""}</span>
        </div>
      </div>
      <p>Regular sessions help progress stick. Book your next one with {first} — the same time next week is a good habit.</p>
      <div className="dc-actions">
        {at && <Link href={bookAgainPath(b, at)} className="dc-btn gold">Book {atLabel}</Link>}
        <Link href={bookAgainPath(b)} className="dc-btn ghost">Pick another time</Link>
      </div>
    </div>
  );
}

/* #5 — rate the last session, then book the next one */
export function ReviewCard({ b, user, now, onDone, onSkip }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [state, setState] = useState(""); // "", "sending", "sent"
  const [err, setErr] = useState("");
  const name = therapistName(b);
  const LABELS = ["", "Not helpful", "Could be better", "Okay", "Helpful", "Very helpful"];

  const send = async () => {
    if (!rating) { setErr("Tap a star to rate your session"); return; }
    if (text.trim().length < 5) { setErr("Please write a line about your experience"); return; }
    if (!user?.email) { setErr("Couldn't find your email — please refresh and try again"); return; }
    setState("sending"); setErr("");
    try {
      const r = await postData(SaveReviewUrl, {
        therapistId: b.therapist._id, name: user.name || "Verified Client", email: user.email,
        rating, description: text.trim(),
      });
      if (r?.status) { setState("sent"); onDone?.(b.therapist._id); } else { setState(""); setErr(r?.message || "Couldn't send your review"); }
    } catch (e) {
      setState(""); setErr(e?.response?.data?.message || "Couldn't send your review — check your connection");
    }
  };

  if (state === "sent") {
    return (
      <div className="dc-review sent">
        <span className="dc-tick">✓</span>
        <div className="dc-review-sent-txt">
          <b>Thank you for your review!</b>
          <span>It helps others find the right therapist. Ready for your next session with {name.split(/\s+/)[0]}?</span>
        </div>
        <Link href={bookAgainPath(b, nextSameSlot(b, now))} className="dc-btn green">Book next session</Link>
      </div>
    );
  }

  return (
    <div className="dc-review">
      <div className="dc-review-h">
        <Avatar b={b} />
        <div>
          <b>How was your session with {name}?</b>
          <span>{fmtWhen(b.booking_date)} · your review is shown on their profile</span>
        </div>
      </div>
      <div className="dc-stars" onMouseLeave={() => setHover(0)} role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} star${n > 1 ? "s" : ""}`}
            className={(hover || rating) >= n ? "on" : ""} onMouseEnter={() => setHover(n)} onClick={() => { setRating(n); setErr(""); }}>
            <StarRoundedIcon />
          </button>
        ))}
        <span className="dc-stars-lbl">{LABELS[hover || rating]}</span>
      </div>
      {rating > 0 && (
        <textarea value={text} onChange={(e) => { setText(e.target.value); setErr(""); }} rows={3} maxLength={600}
          placeholder="What helped? How did you feel after the session?" />
      )}
      {err && <em className="dc-err">{err}</em>}
      <div className="dc-actions">
        <button type="button" className="dc-btn green" onClick={send} disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Submit review"}</button>
        <button type="button" className="dc-btn link" onClick={() => onSkip?.(b._id)}>Not now</button>
      </div>
    </div>
  );
}

/* #4 — Give ₹200, get ₹200 */
export function ReferralCard() {
  const [d, setD] = useState(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    fetchById(MyReferralUrl).then((r) => { if (r?.status) setD(r.data); }).catch(() => {});
  }, []);
  if (!d?.code) return null;

  const amt = `₹${Number(d.amount || 200).toLocaleString("en-IN")}`;
  const link = `${SITE}/view-all-therapist?refer=${d.code}`;
  const msg = `I've been using Choose Your Therapist for therapy sessions with verified psychologists. Use my code ${d.code} to get ${amt} off your first session: ${link}`;
  const copy = async () => {
    try { await navigator.clipboard.writeText(d.code); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch (e) { /* clipboard blocked */ }
  };
  const share = async () => {
    if (navigator.share) { try { await navigator.share({ title: "Choose Your Therapist", text: msg }); } catch (e) { /* cancelled */ } return; }
    try { await navigator.clipboard.writeText(msg); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch (e) { /* clipboard blocked */ }
  };

  return (
    <div className="dc-ref">
      <div className="dc-ref-h">
        <CardGiftcardRoundedIcon />
        <div><b>Give {amt}, get {amt}</b><span>Friends get {amt} off their first session. You get {amt} credit when they book.</span></div>
      </div>
      <div className="dc-ref-code">
        <span>Your code</span>
        <b>{d.code}</b>
        <button type="button" onClick={copy} aria-label="Copy code">{copied ? "Copied" : <><ContentCopyRoundedIcon /> Copy</>}</button>
      </div>
      <div className="dc-ref-share">
        <a href={`https://wa.me/?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer" className="dc-btn wa"><WhatsAppIcon /> Share on WhatsApp</a>
        <button type="button" className="dc-btn ghost-dark" onClick={share} aria-label="Share"><IosShareRoundedIcon /></button>
      </div>
      {(d.credit > 0 || d.friends > 0) && (
        <div className="dc-ref-stats">
          <span><b>₹{Number(d.credit || 0).toLocaleString("en-IN")}</b> credit to use</span>
          <span><b>{d.friends}</b> friend{d.friends === 1 ? "" : "s"} booked</span>
        </div>
      )}
      {d.credit > 0 && <p className="dc-ref-note">Your credit comes off your next booking automatically.</p>}
    </div>
  );
}

export const DC_CSS = `
.dc-av { width: 44px; height: 44px; border-radius: 14px; background: #e7f6ec; color: #166534; display: grid; place-items: center; font-weight: 800; font-size: 17px; flex-shrink: 0; overflow: hidden; }
.dc-av img { width: 100%; height: 100%; object-fit: cover; }
.dc-actions { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
.dc-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 42px; padding: 0 16px; border-radius: 11px; font-size: 14px; font-weight: 800; cursor: pointer; border: 1px solid transparent; font-family: inherit; text-decoration: none !important; white-space: nowrap; }
.dc-btn svg { font-size: 18px; }
.dc-btn:disabled { opacity: .65; cursor: default; }
.dc-btn.gold { background: #f5c542; color: #1f2a12 !important; }
.dc-btn.ghost { background: rgba(255,255,255,.1); color: #fff !important; border-color: rgba(255,255,255,.28); }
.dc-btn.green { background: linear-gradient(135deg, #14532d, #16a34a); color: #fff !important; }
.dc-btn.link { background: none; color: #64748b !important; padding: 0 6px; }
.dc-btn.wa { background: #25d366; color: #fff !important; flex: 1; }
.dc-btn.ghost-dark { background: #fff; color: #166534 !important; border-color: #cfe3d6; width: 42px; padding: 0; flex: none; }

.dc-rebook { border-radius: 18px; padding: 18px; color: #fff; background: radial-gradient(120% 140% at 100% 0%, #1f7a45 0%, #0b3320 55%); box-shadow: 0 16px 34px -20px rgba(4,30,16,.8); display: flex; flex-direction: column; gap: 12px; }
.dc-rebook-top { display: flex; align-items: center; gap: 14px; min-width: 0; }
.dc-rebook .dc-av { border-radius: 16px; background: rgba(255,255,255,.14); color: #fff; font-size: 22px; }
.dc-rebook-txt { min-width: 0; }
.dc-eyebrow { display: inline-flex; align-items: center; gap: 5px; font-size: 11.5px; font-weight: 800; letter-spacing: .4px; text-transform: uppercase; color: #f5c542; }
.dc-eyebrow svg { font-size: 15px; }
.dc-rebook-txt b { display: block; font-size: 18px; font-weight: 800; margin-top: 2px; line-height: 1.25; }
.dc-rebook-txt > span:last-child { display: block; font-size: 12.5px; color: #bbf7d0; margin-top: 2px; }
.dc-rebook p { margin: 0; font-size: 13.5px; line-height: 1.5; color: #dcfce7; }

.dc-pend { background: #fff; border: 1.5px solid #fbbf24; border-radius: 16px; padding: 16px; display: flex; flex-direction: column; gap: 12px; box-shadow: 0 10px 24px -18px rgba(180,120,10,.6); }
.dc-pend.taken { border-color: #e2e8f0; box-shadow: none; }
.dc-pend-top { display: flex; align-items: center; gap: 12px; min-width: 0; }
.dc-pend-txt { min-width: 0; }
.dc-pend-eye { display: inline-flex; align-items: center; gap: 5px; font-size: 11.5px; font-weight: 800; letter-spacing: .4px; text-transform: uppercase; color: #b45309; }
.dc-pend.taken .dc-pend-eye { color: #64748b; }
.dc-pend-eye svg { font-size: 15px; }
.dc-pend-txt b { display: block; font-size: 16px; font-weight: 800; margin-top: 1px; }
.dc-pend-txt > span:last-child { display: block; font-size: 12.5px; color: #475569; margin-top: 1px; }
.dc-pend p { margin: 0; font-size: 13.5px; line-height: 1.5; color: #475569; }
.dc-review { background: #fff; border: 1px solid #e4ece7; border-radius: 16px; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.dc-review-h { display: flex; align-items: center; gap: 12px; min-width: 0; }
.dc-review-h b { display: block; font-size: 15px; font-weight: 800; }
.dc-review-h > div > span { display: block; font-size: 12.5px; color: #64748b; margin-top: 1px; }
.dc-stars { display: flex; align-items: center; gap: 2px; flex-wrap: wrap; }
.dc-stars button { border: 0; background: none; padding: 2px; cursor: pointer; color: #d6dde2; line-height: 0; }
.dc-stars button svg { font-size: 36px; transition: transform .12s; }
.dc-stars button.on { color: #f5b301; }
.dc-stars button:hover svg { transform: scale(1.12); }
.dc-stars-lbl { font-size: 13px; font-weight: 700; color: #475569; margin-left: 8px; }
.dc-review textarea { width: 100%; border: 1px solid #d6e0da; border-radius: 12px; padding: 10px 12px; font-size: 14.5px; font-family: inherit; resize: vertical; min-height: 78px; }
.dc-review textarea:focus { outline: none; border-color: #166534; box-shadow: 0 0 0 3px rgba(22,101,52,.12); }
.dc-err { font-style: normal; font-size: 12.5px; font-weight: 600; color: #dc2626; }
.dc-review.sent { flex-direction: row; align-items: center; flex-wrap: wrap; background: #f0faf3; border-color: #cfe9d8; }
.dc-tick { width: 40px; height: 40px; border-radius: 50%; background: #16a34a; color: #fff; display: grid; place-items: center; font-weight: 900; font-size: 18px; flex-shrink: 0; }
.dc-review-sent-txt { flex: 1; min-width: 200px; }
.dc-review-sent-txt b { display: block; font-size: 15px; } .dc-review-sent-txt span { display: block; font-size: 13px; color: #475569; margin-top: 2px; }

.dc-ref { border-radius: 16px; padding: 16px; background: linear-gradient(160deg, #fffbea 0%, #fff 60%); border: 1px solid #f3e2a4; display: flex; flex-direction: column; gap: 12px; }
.dc-ref-h { display: flex; gap: 12px; align-items: flex-start; }
.dc-ref-h > svg { font-size: 30px; color: #b7791f; background: #fdf0c4; border-radius: 12px; padding: 6px; box-sizing: content-box; flex-shrink: 0; }
.dc-ref-h b { display: block; font-size: 16px; font-weight: 800; color: #1f2937; }
.dc-ref-h span { display: block; font-size: 12.5px; color: #64748b; margin-top: 2px; line-height: 1.45; }
.dc-ref-code { display: flex; align-items: center; gap: 10px; border: 1.5px dashed #e3c565; border-radius: 12px; padding: 8px 8px 8px 12px; background: #fff; }
.dc-ref-code span { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: .4px; }
.dc-ref-code b { flex: 1; font-size: 17px; font-weight: 900; letter-spacing: 1.5px; color: #0f172a; min-width: 0; overflow: hidden; text-overflow: ellipsis; }
.dc-ref-code button { display: inline-flex; align-items: center; gap: 4px; height: 34px; padding: 0 12px; border-radius: 9px; border: 0; background: #0f3d24; color: #fff; font-weight: 800; font-size: 12.5px; cursor: pointer; font-family: inherit; }
.dc-ref-code button svg { font-size: 15px; }
.dc-ref-share { display: flex; gap: 8px; }
.dc-ref-stats { display: flex; gap: 8px; }
.dc-ref-stats span { flex: 1; background: #fff; border: 1px solid #f1e6bd; border-radius: 10px; padding: 8px 10px; font-size: 12px; color: #64748b; }
.dc-ref-stats b { display: block; font-size: 16px; color: #0f172a; }
.dc-ref-note { margin: 0; font-size: 12px; color: #92400e; font-weight: 600; }


@media (max-width: 640px) {
  .dc-rebook .dc-actions .dc-btn, .dc-pend .dc-actions .dc-btn.green { flex: 1; }
  .dc-stars button svg { font-size: 34px; }
}
`;
