import React from "react";
import Link from "next/link";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import Diversity3RoundedIcon from "@mui/icons-material/Diversity3Rounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import FlagRoundedIcon from "@mui/icons-material/FlagRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";

/* My Space dashboard: a row of stat cards under the greeting, and a "Your activity" chart
   (sessions per month for the last 6 months). Used by pages/my-dashboard.js. */

const TZ = "Asia/Kolkata";
const isDone = (b) => b.status === "Completed";
const monthKey = (d) => new Date(d).toLocaleDateString("en-CA", { year: "numeric", month: "2-digit", timeZone: TZ }).slice(0, 7);
const shortDate = (d) => new Date(d).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: TZ });

export function DashKpis({ bookings, now, credit = 0 }) {
  if (bookings === null || bookings === undefined) {
    return <div className="ck-row" aria-hidden="true">{[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="ck ck-skel" />)}</div>;
  }
  const list = bookings.filter((b) => b.status !== "Cancelled");
  const done = list.filter(isDone);
  const ahead = list.filter((b) => (b.status === "New" || b.status === "Started") && new Date(b.booking_date).getTime() > now - 90 * 60000)
    .sort((a, b) => new Date(a.booking_date) - new Date(b.booking_date));
  const therapists = new Set(list.map((b) => b.therapist?._id).filter(Boolean)).size;
  const thisMonth = monthKey(now);
  const month = list.filter((b) => monthKey(b.booking_date) === thisMonth && b.status !== "Cancelled").length;
  const first = list.reduce((m, b) => Math.min(m, new Date(b.booking_date).getTime() || m), Infinity);
  const since = Number.isFinite(first) ? new Date(first).toLocaleDateString("en-IN", { month: "short", year: "numeric", timeZone: TZ }) : "Today";
  const lastDone = done.sort((a, b) => new Date(b.booking_date) - new Date(a.booking_date))[0];
  const tiles = [
    { k: "done", Icon: TaskAltRoundedIcon, v: done.length, l: `Session${done.length === 1 ? "" : "s"} done`, s: lastDone ? `Last: ${shortDate(lastDone.booking_date)}` : "Your journey starts here", to: "/client/my-bookings" },
    { k: "up", Icon: EventAvailableRoundedIcon, v: ahead.length, l: "Upcoming", s: ahead[0] ? `Next: ${shortDate(ahead[0].booking_date)}` : "Book a session →", to: ahead[0] ? "/client/my-bookings" : "/client/find" },
    { k: "month", Icon: CalendarMonthRoundedIcon, v: month, l: "This month", s: new Date(now).toLocaleDateString("en-IN", { month: "long", timeZone: TZ }) },
    { k: "ther", Icon: Diversity3RoundedIcon, v: therapists, l: `Therapist${therapists === 1 ? "" : "s"}`, s: therapists ? "who've helped you" : "Find yours →", to: "/client/find" },
    { k: "credit", Icon: AccountBalanceWalletRoundedIcon, v: `₹${Number(credit) || 0}`, l: "Credit", s: credit ? "Off your next booking" : "Refer a friend, get ₹200" },
    { k: "since", Icon: FlagRoundedIcon, v: since, l: "With us since", s: `${done.length ? "Keep going" : "Welcome"} 💚` },
  ];
  return (
    <div className="ck-row">
      {tiles.map(({ k, Icon, v, l, s, to }) => {
        const inner = (
          <>
            <span className={`ck-ic ${k}`}><Icon /></span>
            <b className="ck-v">{v}</b>
            <span className="ck-l">{l}</span>
            <small className="ck-s">{s}</small>
          </>
        );
        return to
          ? <Link key={k} href={to} className={`ck ${k}`}>{inner}</Link>
          : <div key={k} className={`ck ${k}`}>{inner}</div>;
      })}
    </div>
  );
}

export function ActivityChart({ bookings, now }) {
  if (!bookings) return null;
  const list = bookings.filter((b) => b.status !== "Cancelled");
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now); d.setDate(1); d.setMonth(d.getMonth() - (5 - i));
    return { k: monthKey(d), l: d.toLocaleDateString("en-IN", { month: "short", timeZone: TZ }) };
  });
  const rows = months.map((m) => {
    const inMonth = list.filter((b) => monthKey(b.booking_date) === m.k);
    return { ...m, done: inMonth.filter(isDone).length, up: inMonth.filter((b) => !isDone(b) && new Date(b.booking_date).getTime() > now - 90 * 60000).length };
  });
  const max = Math.max(1, ...rows.map((r) => r.done + r.up));
  const total = rows.reduce((n, r) => n + r.done, 0);
  return (
    <div className="ck-card ck-act">
      <div className="ck-h">
        <span className="ck-h-ic"><InsightsRoundedIcon /></span>
        <div><b>Your activity</b><span>{total} session{total === 1 ? "" : "s"} done in the last 6 months</span></div>
      </div>
      {!list.length && <p className="ck-empty">Your sessions will show here as a chart — <Link href="/client/find">book your first one →</Link></p>}
      <div className="ck-bars" role="img" aria-label={rows.map((r) => `${r.l}: ${r.done} done${r.up ? `, ${r.up} booked` : ""}`).join("; ")}>
        {rows.map((r) => (
          <div key={r.k} className={`ck-bar${r.k === monthKey(now) ? " now" : ""}`}>
            <em>{r.done + r.up || ""}</em>
            <div className="ck-col">
              {r.up > 0 && <i className="up" style={{ height: `${(r.up / max) * 100}%` }} />}
              {r.done > 0 && <i className="dn" style={{ height: `${(r.done / max) * 100}%` }} />}
            </div>
            <span>{r.l}</span>
          </div>
        ))}
      </div>
      <div className="ck-legend"><span><i className="dn" />Done</span><span><i className="up" />Booked</span></div>
    </div>
  );
}

export const KPI_CSS = `
.ck-row { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 12px; margin: 0 0 18px; }
.ck { position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: flex-start; gap: 2px; min-width: 0; padding: 14px 14px 13px; border-radius: 18px;
  background: #fff; border: 1px solid #e6ece8; box-shadow: 0 1px 2px rgba(15,23,42,.04), 0 10px 24px -20px rgba(15,23,42,.35);
  color: #0f172a !important; text-decoration: none !important; transition: transform .15s ease, box-shadow .15s ease; }
a.ck:hover { transform: translateY(-2px); box-shadow: 0 14px 28px -18px rgba(15,23,42,.4); }
.ck::after { content: ""; position: absolute; right: -26px; top: -26px; width: 84px; height: 84px; border-radius: 50%; background: var(--ck-soft); opacity: .7; pointer-events: none; }
.ck-ic { position: relative; z-index: 1; width: 38px; height: 38px; border-radius: 12px; display: grid; place-items: center; color: #fff; margin-bottom: 8px; background: var(--ck-tile); box-shadow: 0 6px 14px -6px var(--ck-sh); }
.ck-ic svg { font-size: 21px; display: block; }
.ck-v { font-size: 25px; font-weight: 800; line-height: 1.1; letter-spacing: -.02em; max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ck-l { font-size: 13px; font-weight: 700; color: #334155; max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ck-s { font-size: 11.5px; font-weight: 600; color: var(--ck-ink); max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }
.ck.done { --ck-tile: linear-gradient(160deg, #4fd38b, #12804a); --ck-sh: rgba(18,128,74,.55); --ck-soft: #e3f6ea; --ck-ink: #15803d; }
.ck.up { --ck-tile: linear-gradient(160deg, #5ab0ff, #1d63d8); --ck-sh: rgba(29,99,216,.55); --ck-soft: #e3effd; --ck-ink: #1d4ed8; }
.ck.month { --ck-tile: linear-gradient(160deg, #b98cff, #6a3fd6); --ck-sh: rgba(106,63,214,.55); --ck-soft: #efe8fd; --ck-ink: #6d28d9; }
.ck.ther { --ck-tile: linear-gradient(160deg, #ff8aa6, #e0335e); --ck-sh: rgba(224,51,94,.55); --ck-soft: #fde7ed; --ck-ink: #be123c; }
.ck.credit { --ck-tile: linear-gradient(160deg, #ffc65a, #f07b12); --ck-sh: rgba(240,123,18,.55); --ck-soft: #fdf0dc; --ck-ink: #b45309; }
.ck.since { --ck-tile: linear-gradient(160deg, #4fd6d6, #0e8a9a); --ck-sh: rgba(14,138,154,.55); --ck-soft: #ddf4f4; --ck-ink: #0e7490; }
.ck.since .ck-v { font-size: 20px; padding: 3px 0 2px; }
.ck-skel { min-height: 128px; background: linear-gradient(90deg, #eef2f0 0%, #f7f9f8 40%, #eef2f0 80%); background-size: 600px 100%; animation: ckSk 1.3s infinite linear; box-shadow: none; border-color: transparent; }
.ck-skel::after { display: none; }
@keyframes ckSk { from { background-position: -300px 0; } to { background-position: 300px 0; } }
.ck-act { position: relative; }
.ck-empty { margin: 0 0 10px; padding: 10px 12px; border-radius: 12px; background: #f3faf5; color: #334155; font-size: 13px; font-weight: 600; }
.ck-empty a { color: #166534 !important; font-weight: 800; text-decoration: none !important; }

.ck-card { background: #fff; border: 1px solid #e6ece8; border-radius: 18px; padding: 16px 18px; box-shadow: 0 1px 2px rgba(15,23,42,.04), 0 10px 24px -20px rgba(15,23,42,.35); }
.ck-h { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.ck-h-ic { width: 34px; height: 34px; border-radius: 11px; display: grid; place-items: center; background: #e7f6ec; color: #166534; flex: none; }
.ck-h-ic svg { font-size: 20px; }
.ck-h b { display: block; font-size: 15.5px; font-weight: 800; color: #0f172a; }
.ck-h > div > span { display: block; font-size: 12.5px; color: #64748b; }
.ck-bars { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 10px; align-items: end; height: 150px; padding: 0 2px; }
.ck-bar { display: flex; flex-direction: column; align-items: center; gap: 5px; height: 100%; min-width: 0; }
.ck-bar em { font-style: normal; font-size: 12px; font-weight: 800; color: #334155; min-height: 15px; }
.ck-col { flex: 1; width: 100%; max-width: 44px; display: flex; flex-direction: column; justify-content: flex-end; gap: 3px; border-radius: 10px; background: repeating-linear-gradient(0deg, #f1f5f3 0 1px, transparent 1px 25%); }
.ck-col i { display: block; width: 100%; min-height: 6px; border-radius: 8px; }
.ck-col i.dn, .ck-legend i.dn { background: linear-gradient(180deg, #34c27a, #15803d); }
.ck-col i.up, .ck-legend i.up { background: repeating-linear-gradient(135deg, #a7d8bc 0 5px, #c9ead6 5px 10px); }
.ck-bar span { font-size: 12px; font-weight: 700; color: #64748b; }
.ck-bar.now span { color: #166534; font-weight: 800; }
.ck-legend { display: flex; gap: 16px; margin-top: 12px; font-size: 12px; font-weight: 700; color: #64748b; }
.ck-legend span { display: inline-flex; align-items: center; gap: 6px; }
.ck-legend i { width: 12px; height: 12px; border-radius: 4px; display: inline-block; }

@media (max-width: 1279px) { .ck-row { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (max-width: 699px) {
  .ck-row { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin-bottom: 14px; }
  .ck { padding: 10px 10px 9px; border-radius: 16px; gap: 1px; }
  .ck::after { width: 60px; height: 60px; right: -20px; top: -20px; }
  .ck-ic { width: 30px; height: 30px; border-radius: 10px; margin-bottom: 5px; }
  .ck-ic svg { font-size: 18px; }
  .ck-v { font-size: 20px; }
  .ck.since .ck-v { font-size: 14.5px; padding: 3px 0 4px; }
  .ck-l { font-size: 11.5px; }
  .ck-s { display: none; }
  .ck-skel { min-height: 96px; }
  .ck-bars { height: 130px; gap: 8px; }
}
`;
