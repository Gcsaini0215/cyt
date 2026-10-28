import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import SessionTicket from "./session-ticket";
import { fmtWhen, therapistName, therapistPhoto } from "./session-card";
import { bookAgainPath, nextSameSlot } from "./dash-cards";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import Diversity3RoundedIcon from "@mui/icons-material/Diversity3Rounded";
import FlagRoundedIcon from "@mui/icons-material/FlagRounded";
import AirRoundedIcon from "@mui/icons-material/AirRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import TipsAndUpdatesRoundedIcon from "@mui/icons-material/TipsAndUpdatesRounded";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import PhoneCallbackRoundedIcon from "@mui/icons-material/PhoneCallbackRounded";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import { CONCERNS } from "../../utils/therapist-directory";
import { withNoidaCharges, hasNoidaInvoice } from "../../utils/noida-booking";

/* Small everyday widgets for the client home: tip of the day, journey stats, mood check-in,
   a one-minute breathing exercise (both in the "Calm corner"), recent sessions and the first-visit start card. */

const TZ = "Asia/Kolkata";
const istDay = (d = new Date()) => d.toLocaleDateString("en-CA", { timeZone: TZ }); // YYYY-MM-DD
const dayIndex = (d = new Date()) => Math.floor((d.getTime() + 5.5 * 3600000) / 86400000);
const done = (b) => b.status === "Completed";

/* #6 — tip of the day (a different one each day; "Another tip" steps through the rest) */
const TIPS = [
  ["Grounding", "Try 5-4-3-2-1: name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste."],
  ["Gratitude", "Write down one thing that went okay today — small wins count."],
  ["Movement", "A 10-minute walk outside can lift your mood more than you'd expect."],
  ["Therapy", "Before your next session, jot down what you want to talk about."],
  ["Mornings", "Keep your phone away for the first 30 minutes after you wake up."],
  ["Thoughts", "When a thought feels heavy, ask yourself: is this a fact, or a feeling?"],
  ["Pause", "Drink a glass of water and take three slow breaths — then decide."],
  ["Connection", "Message one person you trust today, even just to say hi."],
  ["Body", "Notice your shoulders and jaw — let them drop."],
  ["Sleep", "Sleep is therapy too: try the same bedtime for a week."],
  ["Boundaries", "It's okay to say no. Protecting your energy is not selfish."],
  ["Feelings", "Name the feeling. Saying \"I feel anxious\" already makes it smaller."],
  ["Movement", "Move your body for 5 minutes — stretch, dance, anything."],
  ["Self-kindness", "Be as kind to yourself as you would be to a friend."],
];
export function TipLine({ now }) {
  const [step, setStep] = useState(0);
  const [cat, text] = TIPS[(dayIndex(new Date(now)) + step) % TIPS.length];
  return (
    <div className="dw-tip" aria-live="polite">
      <span className="dw-tip-ic"><TipsAndUpdatesRoundedIcon /></span>
      <div className="dw-tip-txt">
        <em>{step ? "Another tip" : "Tip of the day"} · {cat}</em>
        <p key={step}>{text}</p>
      </div>
      <button type="button" className="dw-tip-next" onClick={() => setStep((n) => n + 1)} title="Another tip" aria-label="Show another tip">
        <AutorenewRoundedIcon />
      </button>
    </div>
  );
}

/* #1 — your journey so far */
export function JourneyStats({ bookings, now }) {
  const list = (bookings || []).filter((b) => b.status !== "Cancelled");
  if (!list.length) return null;
  const completed = list.filter(done).length;
  const upcoming = list.filter((b) => b.status === "New" && new Date(b.booking_date).getTime() > now - 90 * 60000).length;
  const therapists = new Set(list.map((b) => b.therapist?._id).filter(Boolean)).size;
  const first = list.reduce((m, b) => Math.min(m, new Date(b.booking_date).getTime() || m), Infinity);
  const since = Number.isFinite(first) ? new Date(first).toLocaleDateString("en-IN", { month: "short", year: "numeric", timeZone: TZ }) : "—";
  const tiles = [
    { Icon: TaskAltRoundedIcon, v: completed, l: `session${completed === 1 ? "" : "s"} done`, c: "g" },
    { Icon: EventAvailableRoundedIcon, v: upcoming, l: "upcoming", c: "b" },
    { Icon: Diversity3RoundedIcon, v: therapists, l: `therapist${therapists === 1 ? "" : "s"}`, c: "r" },
    { Icon: FlagRoundedIcon, v: since, l: "with us since", c: "y" },
  ];
  return (
    <div className="dw-stats">
      {tiles.map(({ Icon, v, l, c }) => (
        <div key={l} className="dw-stat">
          <span className={`dw-stat-ic ${c}`}><Icon /></span>
          <div><b>{v}</b><span>{l}</span></div>
        </div>
      ))}
    </div>
  );
}

/* #2 — mood check-in (kept in this browser only) */
const MOOD_KEY = "cyt_mood_v1";
const MOODS = [
  { v: 1, e: "😞", l: "Low" }, { v: 2, e: "😕", l: "Meh" }, { v: 3, e: "😐", l: "Okay" }, { v: 4, e: "🙂", l: "Good" }, { v: 5, e: "😄", l: "Great" },
];
const REPLY = {
  1: "Thank you for being honest. Rough days happen — talking to someone can really help.",
  2: "Some days are heavier. Be gentle with yourself today.",
  3: "Okay is okay. A short walk or a few slow breaths might help.",
  4: "Glad to hear it! Notice what's helping — it's worth keeping.",
  5: "Love that! Hold on to this feeling — maybe note what made today good.",
};
const readMoods = () => { try { return JSON.parse(localStorage.getItem(MOOD_KEY) || "{}"); } catch (e) { return {}; } };

export function MoodCard({ now, bookHref }) {
  const [moods, setMoods] = useState({});
  useEffect(() => { setMoods(readMoods()); }, []);
  const today = istDay(new Date(now));
  const pick = (v) => {
    const next = { ...readMoods(), [today]: v };
    // keep the last 60 days
    const keys = Object.keys(next).sort().slice(-60);
    const trimmed = Object.fromEntries(keys.map((k) => [k, next[k]]));
    try { localStorage.setItem(MOOD_KEY, JSON.stringify(trimmed)); } catch (e) { /* storage blocked */ }
    setMoods(trimmed);
  };
  const cur = moods[today];
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now - (6 - i) * 86400000);
    return { k: istDay(d), d: d.toLocaleDateString("en-IN", { weekday: "narrow", timeZone: TZ }), v: moods[istDay(d)] };
  });

  return (
    <div className="dw-card dw-mood">
      <div className="dw-h"><b>How are you feeling today?</b></div>
      <div className="dw-moods" role="radiogroup" aria-label="Today's mood">
        {MOODS.map((m) => (
          <button key={m.v} type="button" role="radio" aria-checked={cur === m.v} aria-label={m.l} className={cur === m.v ? "on" : ""} onClick={() => pick(m.v)}>
            <span>{m.e}</span><em>{m.l}</em>
          </button>
        ))}
      </div>
      {cur ? (
        <div className={`dw-reply${cur <= 2 ? " low" : ""}`}>
          <p>{REPLY[cur]}</p>
          {cur <= 2 && (
            <div className="dw-reply-acts">
              <Link href={bookHref} className="dw-btn">Talk to a therapist</Link>
              {cur === 1 && <a href="tel:14416" className="dw-link">Tele-MANAS 14416 (24×7)</a>}
            </div>
          )}
        </div>
      ) : <p className="dw-sub">One tap — only you can see this.</p>}
      <div className="dw-week" aria-label="Your last 7 days">
        {week.map((w) => (
          <span key={w.k} title={w.k}><i className={w.v ? `m${w.v}` : ""}>{w.v ? MOODS[w.v - 1].e : ""}</i>{w.d}</span>
        ))}
      </div>
    </div>
  );
}

/* #3 — one-minute breathing (in 4s · hold 4s · out 6s) */
const PHASES = [{ t: "Breathe in", s: 4, cls: "in" }, { t: "Hold", s: 4, cls: "hold" }, { t: "Breathe out", s: 6, cls: "out" }];
// `bare`: just the exercise, for inside another card (the Calm corner)
export function BreathCard({ bare = false }) {
  const [on, setOn] = useState(false);
  const [i, setI] = useState(0);
  const [round, setRound] = useState(0);
  const timer = useRef(null);
  useEffect(() => {
    if (!on) return undefined;
    timer.current = setTimeout(() => {
      const n = (i + 1) % PHASES.length;
      if (n === 0) {
        if (round + 1 >= 4) { setOn(false); setI(0); setRound(4); return; } // 4 rounds ≈ 1 minute
        setRound((r) => r + 1);
      }
      setI(n);
    }, PHASES[i].s * 1000);
    return () => clearTimeout(timer.current);
  }, [on, i, round]);
  const start = () => { setI(0); setRound(0); setOn(true); };
  const ph = PHASES[i];
  const body = (
      <div className="dw-breath-body">
        <div className={`dw-orb${on ? ` ${ph.cls}` : ""}`} style={on ? { transitionDuration: `${ph.s}s` } : undefined}>
          <span>{on ? ph.t : round >= 4 ? "Well done" : <AirRoundedIcon />}</span>
        </div>
        <div className="dw-breath-txt">
          <p>{on ? `Round ${round + 1} of 4` : round >= 4 ? "Notice how you feel now." : "In for 4, hold for 4, out for 6. Four calm rounds."}</p>
          <button type="button" className="dw-btn" onClick={on ? () => { setOn(false); setI(0); } : start}>{on ? "Stop" : round >= 4 ? "Again" : "Start"}</button>
        </div>
      </div>
  );
  if (bare) return body;
  return (
    <div className="dw-card dw-breath">
      <div className="dw-h"><b>One-minute breathing</b></div>
      {body}
    </div>
  );
}

/* tip of the day + the breathing exercise in one card; the exercise opens on a tap */
export function CalmCorner({ now }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="dw-card dw-calm">
      <div className="dw-h"><b>Calm corner</b></div>
      <TipLine now={now} />
      <button type="button" className={`dw-calm-tog${open ? " on" : ""}`} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <AirRoundedIcon /><span>One-minute breathing</span><ExpandMoreRoundedIcon className="chev" />
      </button>
      {open && <BreathCard bare />}
    </div>
  );
}

/* first visit (no bookings yet): pick what to talk about -> the directory filtered to it */
const START_TOPICS = CONCERNS.slice(0, 9);
export function StartCard({ onCallback }) {
  return (
    <div className="dw-card dw-start">
      <div className="dw-start-h">
        <b>What would you like to talk about?</b>
        <span>Pick one — we&apos;ll show therapists who work with it.</span>
      </div>
      <div className="dw-topics">
        {START_TOPICS.map((c) => (
          <Link key={c.value} href={`/client/find?concern=${encodeURIComponent(c.value)}`}>{c.label}</Link>
        ))}
        <Link href="/client/find" className="all">See all therapists →</Link>
      </div>
      <div className="dw-start-alt">
        <button type="button" onClick={onCallback}>
          <PhoneCallbackRoundedIcon /><div><b>Not sure? Get a call back</b><span>We&apos;ll help you choose</span></div>
        </button>
        <Link href="/self-assessment">
          <FactCheckRoundedIcon /><div><b>Take a screening test</b><span>PHQ-9, GAD-7 and more</span></div>
        </Link>
      </div>
    </div>
  );
}

/* #4 — recent sessions */
export function RecentSessions({ bookings, now }) {
  const [ticket, setTicket] = useState(null);
  const past = (bookings || [])
    .filter((b) => b.status !== "Cancelled" && b.therapist?._id && (done(b) || new Date(b.booking_date).getTime() < now - 90 * 60000))
    .sort((a, b) => new Date(b.booking_date) - new Date(a.booking_date))
    .slice(0, 3);
  if (!past.length) return null;
  return (
    <div className="ch-card dw-recent">
      <div className="dw-recent-h"><h3>Recent sessions</h3><Link href="/client/my-bookings">All →</Link></div>
      {past.map((raw) => {
        const b = withNoidaCharges(raw);
        const photo = therapistPhoto(b);
        const name = therapistName(b);
        const amount = Number(b.transaction?.amount ?? b.amount?.$numberDecimal ?? b.amount) || 0;
        const missed = !done(b) && b.status !== "Started"; // time passed, never started or marked done
        return (
          <div key={b._id} className="dw-row">
            <span className="dw-av">{photo ? <img src={photo} alt="" /> : name.charAt(0)}</span>
            <div className="dw-row-txt">
              <b>{name}</b>
              <span>{fmtWhen(b.booking_date)}{missed ? "" : amount ? ` · ₹${amount.toLocaleString("en-IN")}` : ""}</span>
              {missed && <em className="dw-missed">Not marked as done</em>}
            </div>
            {(b.source !== "noida" || hasNoidaInvoice(b)) && (
            <button type="button" className="dw-ic" title="Invoice" aria-label="Download invoice"
              onClick={() => setTicket(b)}>
              <ReceiptLongRoundedIcon />
            </button>
            )}
            <Link href={bookAgainPath(b, nextSameSlot(b, now))} className="dw-ic go" title="Book again" aria-label={`Book again with ${name}`}><ArrowForwardRoundedIcon /></Link>
          </div>
        );
      })}
      {ticket && <SessionTicket b={ticket} onClose={() => setTicket(null)} />}
    </div>
  );
}

export const DW_CSS = `
.dw-tip { display: flex; align-items: center; gap: 12px; margin-top: 10px; padding: 10px 10px 10px 12px; border-radius: 14px;
  background: linear-gradient(100deg, #fff7dc 0%, #fffdf5 70%); border: 1px solid #f3e2a4; border-left: 4px solid #e0b73a; }
.dw-tip-ic { width: 36px; height: 36px; border-radius: 50%; background: #fdecb2; display: grid; place-items: center; flex-shrink: 0; box-shadow: 0 4px 10px -6px rgba(180,130,10,.7); }
.dw-tip-ic svg { font-size: 20px; color: #b7791f; }
.dw-tip-txt { flex: 1; min-width: 0; }
.dw-tip-txt em { display: block; font-style: normal; font-size: 10.5px; font-weight: 800; letter-spacing: .6px; text-transform: uppercase; color: #a16207; }
.dw-tip-txt p { margin: 2px 0 0; font-size: 13.5px; font-weight: 600; color: #3f2d00; line-height: 1.45; animation: dwTip .3s ease; }
@keyframes dwTip { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: none; } }
.dw-tip-next { width: 34px; height: 34px; border-radius: 10px; border: 1px solid #f1dc94; background: #fff; color: #a16207; display: grid; place-items: center; cursor: pointer; flex-shrink: 0; }
.dw-tip-next:hover { background: #fff3c4; } .dw-tip-next svg { font-size: 18px; }

.dw-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-bottom: 16px; }
.dw-stat { display: flex; align-items: center; gap: 10px; background: #fff; border: 1px solid #e4ece7; border-radius: 14px; padding: 10px 12px; min-width: 0; }
.dw-stat-ic { width: 36px; height: 36px; border-radius: 11px; display: grid; place-items: center; flex-shrink: 0; }
.dw-stat-ic svg { font-size: 20px; display: block; }
.dw-stat-ic.g { background: #e7f6ec; color: #166534; } .dw-stat-ic.b { background: #e0f2fe; color: #0369a1; } .dw-stat-ic.r { background: #ffe4e6; color: #be123c; } .dw-stat-ic.y { background: #fef3c7; color: #b45309; }
.dw-stat > div { min-width: 0; }
.dw-stat b { display: block; font-size: 17px; font-weight: 800; line-height: 1.15; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dw-stat > div > span { display: block; font-size: 11.5px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.dw-pair { margin-top: 16px; }
/* wide mood card (main column): faces on the left, the week on the right */
@media (min-width: 900px) {
  .dw-pair .dw-mood { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); grid-template-areas: "h week" "faces week" "reply week"; column-gap: 20px; row-gap: 10px; }
  .dw-pair .dw-mood .dw-h { grid-area: h; } .dw-pair .dw-mood .dw-moods { grid-area: faces; }
  .dw-pair .dw-mood .dw-reply, .dw-pair .dw-mood .dw-sub { grid-area: reply; }
  .dw-pair .dw-mood .dw-week { grid-area: week; margin: 0; padding: 0 0 0 20px; border-top: 0; border-left: 1px dashed #e2e8f0; align-self: center; }
}
.dw-card { background: #fff; border: 1px solid #e4ece7; border-radius: 16px; padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; min-width: 0; }
.dw-h b { font-size: 14.5px; font-weight: 800; }
.dw-sub { margin: 0; font-size: 12px; color: #94a3b8; }
.dw-btn { display: inline-flex; align-items: center; justify-content: center; height: 34px; padding: 0 14px; border-radius: 10px; border: 0; background: linear-gradient(135deg, #14532d, #16a34a); color: #fff !important; font-size: 13px; font-weight: 800; cursor: pointer; text-decoration: none !important; font-family: inherit; }
.dw-link { font-size: 12.5px; font-weight: 700; color: #b91c1c !important; }

.dw-moods { display: flex; justify-content: space-between; gap: 4px; }
.dw-moods button { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; border: 1.5px solid transparent; background: #f6f8f7; border-radius: 12px; padding: 6px 0 4px; cursor: pointer; font-family: inherit; transition: transform .12s, border-color .12s; }
.dw-moods button span { font-size: 22px; line-height: 1.1; }
.dw-moods button em { font-style: normal; font-size: 10.5px; font-weight: 700; color: #64748b; }
.dw-moods button:hover { transform: translateY(-2px); }
.dw-moods button.on { border-color: #16a34a; background: #ecfdf3; }
.dw-reply p { margin: 0; font-size: 12.5px; color: #475569; line-height: 1.45; }
.dw-reply.low p { color: #7c2d12; }
.dw-reply-acts { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-top: 8px; }
.dw-week { display: flex; justify-content: space-between; margin-top: auto; padding-top: 8px; border-top: 1px dashed #e2e8f0; }
.dw-week span { display: flex; flex-direction: column; align-items: center; gap: 2px; font-size: 10.5px; font-weight: 700; color: #94a3b8; }
.dw-week i { width: 22px; height: 22px; border-radius: 50%; background: #eef2f0; display: grid; place-items: center; font-style: normal; font-size: 13px; }

.dw-breath-body { display: flex; align-items: center; gap: 14px; flex: 1; }
.dw-orb { width: 96px; height: 96px; border-radius: 50%; flex-shrink: 0; display: grid; place-items: center; text-align: center;
  background: radial-gradient(circle at 35% 30%, #bbf7d0, #22c55e 60%, #15803d); color: #fff; font-size: 11.5px; font-weight: 800; transform: scale(.82);
  transition-property: transform; transition-timing-function: ease-in-out; box-shadow: 0 10px 26px -12px rgba(22,101,52,.7); }
.dw-orb span { padding: 0 8px; line-height: 1.2; } .dw-orb svg { font-size: 30px; }
.dw-orb.in { transform: scale(1.08); } .dw-orb.hold { transform: scale(1.08); } .dw-orb.out { transform: scale(.82); }
.dw-breath-txt { display: flex; flex-direction: column; align-items: flex-start; gap: 10px; min-width: 0; }
.dw-breath-txt p { margin: 0; font-size: 12.5px; color: #475569; line-height: 1.45; }

.dw-recent-h { display: flex; align-items: baseline; justify-content: space-between; }
.dw-recent-h h3 { margin: 0 0 4px !important; }
.dw-recent-h a { font-size: 12.5px; font-weight: 700; color: #166534 !important; text-decoration: none !important; }
.dw-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-top: 1px solid #eef2f0; }
.dw-recent-h + .dw-row { border-top: 0; }
.dw-av { width: 34px; height: 34px; border-radius: 10px; background: #e7f6ec; color: #166534; display: grid; place-items: center; font-weight: 800; font-size: 13px; overflow: hidden; flex-shrink: 0; }
.dw-av img { width: 100%; height: 100%; object-fit: cover; }
.dw-row-txt { flex: 1; min-width: 0; }
.dw-row-txt b { display: block; font-size: 13.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dw-row-txt span { display: block; font-size: 11.5px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dw-missed { display: inline-block; margin-top: 2px; font-style: normal; font-size: 10.5px; font-weight: 800; color: #475569; background: #f1f5f9; border-radius: 999px; padding: 1px 8px; }
.dw-ic { width: 32px; height: 32px; border-radius: 9px; border: 1px solid #e2e8f0; background: #fff; color: #475569; display: grid; place-items: center; cursor: pointer; flex-shrink: 0; }
.dw-ic svg { font-size: 17px; } .dw-ic.go { background: #f0faf3; border-color: #cfe9d8; color: #166534 !important; }


.dw-calm .dw-tip { margin-top: 0; }
.dw-calm-tog { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 12px; border-radius: 12px; border: 1px solid #e4ece7; background: #f6faf7; color: #14532d; font: inherit; font-size: 13.5px; font-weight: 800; cursor: pointer; text-align: left; }
.dw-calm-tog > svg { font-size: 20px; color: #16a34a; } .dw-calm-tog span { flex: 1; }
.dw-calm-tog .chev { color: #64748b; transition: transform .2s; } .dw-calm-tog.on .chev { transform: rotate(180deg); }

.dw-start { padding: 18px; gap: 14px; background: linear-gradient(160deg, #f0faf3 0%, #fff 55%); }
.dw-start-h b { display: block; font-size: 17px; font-weight: 800; color: #0f172a; }
.dw-start-h span { display: block; font-size: 13px; color: #64748b; margin-top: 2px; }
.dw-topics { display: flex; flex-wrap: wrap; gap: 8px; }
.dw-topics a { padding: 8px 14px; border-radius: 999px; border: 1.5px solid #cfe3d6; background: #fff; color: #14532d !important; font-size: 13.5px; font-weight: 700; text-decoration: none !important; }
.dw-topics a:hover { border-color: #16a34a; background: #ecfdf3; }
.dw-topics a.all { border-style: dashed; color: #166534 !important; }
.dw-start-alt { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 230px), 1fr)); gap: 10px; }
.dw-start-alt > * { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 14px; border: 1px solid #e4ece7; background: #fff; text-align: left; font: inherit; cursor: pointer; text-decoration: none !important; color: #0f172a !important; }
.dw-start-alt svg { font-size: 26px; color: #166534; flex-shrink: 0; }
.dw-start-alt b { display: block; font-size: 14px; } .dw-start-alt span { display: block; font-size: 12px; color: #64748b; }

/* phone: the four numbers as one compact strip */
@media (max-width: 640px) {
  .dw-stats { grid-template-columns: repeat(3, minmax(0, 1fr)) minmax(0, 1.35fr); gap: 6px; margin-bottom: 14px; }
  .dw-stat { flex-direction: column; align-items: flex-start; gap: 0; padding: 8px 9px; border-radius: 12px; }
  .dw-stat-ic { display: none; }
  .dw-stat b { font-size: 15px; } .dw-stat > div > span { font-size: 10.5px; }
}
`;
