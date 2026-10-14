import React from "react";
import Link from "next/link";

/* Pieces of the therapist dashboard Overview (2026-10 redesign): a slim "today" bar, KPI cards
   with sparklines, a big next-session card, a 7-day strip and a to-do card. Plain CSS (OV_CSS),
   one look: light grey page, white cards, same radius/spacing, green only where it matters. */

const IST = "Asia/Kolkata";
const sd = (d) => { const x = new Date(d); return isNaN(x) ? null : x; };
const fmtTime = (d) => (sd(d) ? sd(d).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: IST }) : "");
const fmtDay = (d) => (sd(d) ? sd(d).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: IST }) : "");
const istKey = (d) => sd(d) && sd(d).toLocaleDateString("en-CA", { timeZone: IST });
const inr = (n) => "₹" + Math.round(Number(n) || 0).toLocaleString("en-IN");

export function minutesUntil(d) {
  const x = sd(d);
  return x ? Math.round((x - Date.now()) / 60000) : null;
}

function greeting(now) {
  const h = Number(new Date(now || Date.now()).toLocaleString("en-US", { hour: "numeric", hour12: false, timeZone: IST }));
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

/* ── 1. slim today bar ── */
export function TodayBar({ firstName, now, todaySessions, nextSession, loading, refreshing, lastRefreshed, onRefresh, since, savingSince, onChangeSince, listing }) {
  return (
    <div className="ov-today">
      <div className="ov-today-main">
        <div className="ov-hello-row">
          <div className="ov-hello">{greeting(now)}, <span className="ov-hello-name">{firstName}</span></div>
          <button type="button" className="ov-refresh-ic" onClick={onRefresh} disabled={refreshing} title={lastRefreshed ? `Updated ${fmtTime(lastRefreshed)} · tap to refresh` : "Refresh"} aria-label="Refresh">
            <span className={refreshing ? "spin" : ""}>↻</span>
          </button>
        </div>
        <div className="ov-today-line">
          {loading ? "Loading your day…" : (
            <>
              <b>{todaySessions || 0}</b> session{todaySessions === 1 ? "" : "s"} today
              {nextSession && <span className="ov-next-inline"> · Next: <b>{fmtTime(nextSession.date)}</b> with {nextSession.name}</span>}
            </>
          )}
        </div>
      </div>
      <div className="ov-today-side">
        {listing && <span className={`ov-listing ${listing.tone}`} title={listing.title}>{listing.label}</span>}
        <button type="button" className="ov-refresh" onClick={onRefresh} disabled={refreshing} title="Refresh">
          <span className={refreshing ? "spin" : ""}>↻</span> {lastRefreshed ? `Updated ${fmtTime(lastRefreshed)}` : "Loading…"}
        </button>
        <span className="ov-since">
          {since ? (
            <>Since {fmtDay(since)} · <button type="button" disabled={savingSince} onClick={() => onChangeSince(null)}>All time</button></>
          ) : (
            <>All time · <button type="button" disabled={savingSince} onClick={() => onChangeSince("month")}>From this month</button></>
          )}
        </span>
      </div>
    </div>
  );
}

/* phones: the "All time / From this month" switch sits right above the numbers it changes */
export function KpiHead({ since, savingSince, onChangeSince }) {
  return (
    <div className="ov-kpi-head">
      <b>Your numbers</b>
      <div className="ov-seg" role="group" aria-label="Count from">
        <button type="button" className={!since ? "on" : ""} disabled={savingSince} onClick={() => since && onChangeSince(null)}>All time</button>
        <button type="button" className={since ? "on" : ""} disabled={savingSince} onClick={() => !since && onChangeSince("month")}>{since ? `Since ${fmtDay(since)}` : "This month"}</button>
      </div>
    </div>
  );
}

/* ── 2. KPI card with a sparkline ── */
function Sparkline({ data = [], color }) {
  const pts = data.map(Number).filter((n) => Number.isFinite(n));
  if (pts.length < 2) return null;
  const max = Math.max(...pts, 1), w = 100, h = 28;
  const d = pts.map((v, i) => `${(i / (pts.length - 1)) * w},${h - (v / max) * (h - 4) - 2}`).join(" ");
  return (
    <svg className="ov-spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <polyline points={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
export function KpiCard({ label, value, isCurrency, trend, trendUp, spark, href, tone = "green", loading }) {
  const body = (
    <>
      <div className="ov-kpi-top">
        <span className="ov-kpi-label">{label}</span>
        {trend && <span className={`ov-trend ${trendUp ? "up" : "down"}`}>{trendUp ? "▲" : "▼"} {trend}</span>}
      </div>
      <div className="ov-kpi-val">{loading ? "—" : isCurrency ? inr(value) : value}</div>
      <Sparkline data={spark} color={`var(--ov-${tone})`} />
    </>
  );
  return href ? <Link href={href} className={`ov-kpi ${tone}`}>{body}</Link> : <div className={`ov-kpi ${tone}`}>{body}</div>;
}

/* ── 3. next session ── */
export function NextSessionCard({ s, loading, onJoin }) {
  if (loading) return <div className="ov-next ov-card"><div className="ov-skel" /></div>;
  if (!s) {
    return (
      <div className="ov-next ov-card empty">
        <div className="ov-next-k">Next session</div>
        <div className="ov-next-name">No sessions booked yet</div>
        <p className="ov-next-sub">Keep your availability up to date so clients can book you.</p>
        <Link href="/my-schedule?tab=availability" className="ov-btn">Update availability</Link>
      </div>
    );
  }
  const mins = minutesUntil(s.date);
  const live = mins !== null && mins <= 10;
  const when = mins === null ? "" : mins <= 0 ? "Happening now" : mins < 60 ? `in ${mins} min` : mins < 1440 ? `in ${Math.floor(mins / 60)}h ${mins % 60}m` : fmtDay(s.date);
  return (
    <div className={`ov-next ov-card ${live ? "live" : ""}`}>
      <div className="ov-next-k">{live ? "Starting now" : "Next session"} <span>{when}</span></div>
      <div className="ov-next-row">
        <div className="ov-next-av">{s.imgSrc ? <img src={s.imgSrc} alt="" /> : <b>{String(s.name || "?").charAt(0)}</b>}</div>
        <div className="ov-next-info">
          <div className="ov-next-name">{s.name}</div>
          <div className="ov-next-sub">{fmtDay(s.date)} · {fmtTime(s.date)} · {s.badge || "Online"}</div>
        </div>
      </div>
      <div className="ov-next-btns">
        {s.meet && onJoin
          ? <button type="button" className={`ov-btn ${live ? "gold" : ""}`} onClick={() => onJoin(s)}>{live ? "Join Meet now" : "Join Meet"}</button>
          : <Link href="/appointments" className={`ov-btn ${live ? "gold" : ""}`}>{live ? "Start session" : "Open session"}</Link>}
        <Link href="/appointments" className="ov-btn ghost">Reschedule</Link>
      </div>
    </div>
  );
}

/* ── 4. next 7 days ── */
export function WeekStrip({ sessions = [], now }) {
  const base = sd(now) || new Date();
  const days = Array.from({ length: 7 }, (_, i) => new Date(base.getTime() + i * 86400000));
  const counts = {};
  sessions.forEach((s) => { const k = istKey(s.date); if (k) counts[k] = (counts[k] || 0) + 1; });
  return (
    <div className="ov-card ov-week">
      <div className="ov-card-h"><b>Next 7 days</b><Link href="/appointments">Calendar →</Link></div>
      <div className="ov-week-row">
        {days.map((d, i) => {
          const k = istKey(d), n = counts[k] || 0;
          return (
            <Link key={k} href="/appointments" className={`ov-day ${i === 0 ? "today" : ""} ${n ? "has" : ""}`}>
              <span>{i === 0 ? "Today" : d.toLocaleDateString("en-IN", { weekday: "short", timeZone: IST })}</span>
              <b>{d.toLocaleDateString("en-IN", { day: "numeric", timeZone: IST })}</b>
              <em>{n ? `${n} session${n > 1 ? "s" : ""}` : "—"}</em>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* ── 5. to-do ── */
export function TodoCard({ items = [], pct }) {
  return (
    <div className="ov-card ov-todo">
      <div className="ov-card-h">
        <b>To-do</b>
        {typeof pct === "number" && <span className="ov-pct" title="Profile strength">Profile {pct}%</span>}
      </div>
      {typeof pct === "number" && <div className="ov-bar"><i style={{ width: `${pct}%` }} /></div>}
      {items.length ? (
        <ul>
          {items.map((t) => (
            <li key={t.key || t.label} className={t.tone || ""}>
              <span>{t.label}</span>
              <span className="ov-todo-acts">
                {t.href && (/^https?:/i.test(t.href)
                  ? <a href={t.href} target="_blank" rel="noopener noreferrer">{t.cta || "Do it"} →</a>
                  : <Link href={t.href}>{t.cta || "Do it"} →</Link>)}
                {t.onDone && <button type="button" onClick={t.onDone} title="Mark as done">✓ Done</button>}
              </span>
            </li>
          ))}
        </ul>
      ) : <p className="ov-allset">✓ All set — nothing pending.</p>}
    </div>
  );
}

export const OV_CSS = `
.ov { --ov-green: #16a34a; --ov-teal: #0d9488; --ov-violet: #6366f1; --ov-gold: #c9962c; --ov-amber: #d97706; font-family: inherit; }
.ov-card { background: #fff; border: 1px solid #e6ece8; border-radius: 16px; box-shadow: 0 1px 2px rgba(15,23,42,.04), 0 10px 24px -14px rgba(15,23,42,.12); padding: 16px 18px; min-width: 0; }
.ov-card-h { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 12px; }
.ov-card-h b { font-size: 15px; font-weight: 800; color: #0f172a; }
.ov-card-h a { font-size: 12.5px; font-weight: 700; color: #166534; text-decoration: none; }

.ov-today { display: flex; align-items: center; justify-content: space-between; gap: 10px 16px; flex-wrap: wrap; margin-bottom: 14px; }
.ov-hello { font-size: clamp(19px, 2.2vw, 24px); font-weight: 800; color: #0f172a; letter-spacing: -.2px; }
.ov-hello-name { color: #166534; }
.ov-today-line { font-size: 13.5px; color: #475569; margin-top: 2px; }
.ov-today-line b { color: #0f172a; }
.ov-today-side { display: flex; align-items: center; gap: 8px 12px; flex-wrap: wrap; }
.ov-join { display: inline-flex; align-items: center; height: 36px; padding: 0 14px; border-radius: 10px; background: #166534; color: #fff !important; font-size: 13px; font-weight: 800; text-decoration: none; }
.ov-join.live { background: #f5c542; color: #3d2a00 !important; box-shadow: 0 0 0 4px rgba(245,197,66,.3); animation: ovPulse 1.6s ease-in-out infinite; }
@keyframes ovPulse { 50% { box-shadow: 0 0 0 8px rgba(245,197,66,.12); } }
.ov-refresh { border: 0; background: none; padding: 0; font-size: 12px; font-weight: 600; color: #64748b; cursor: pointer; }
.ov-refresh .spin { display: inline-block; animation: ovSpin 1s linear infinite; }
@keyframes ovSpin { to { transform: rotate(360deg); } }
.ov-since { font-size: 12px; color: #64748b; }
.ov-since button { border: 0; background: none; padding: 0; font: inherit; font-weight: 700; color: #166534; text-decoration: underline; cursor: pointer; }
.ov-listing { display: inline-flex; align-items: center; height: 28px; padding: 0 11px; border-radius: 999px; font-size: 12px; font-weight: 800; border: 1px solid; }
.ov-listing.ok { background: #ecfdf3; border-color: #bbf7d0; color: #166534; }
.ov-listing.warn { background: #fffbeb; border-color: #fde68a; color: #92400e; }
.ov-listing.off { background: #fef2f2; border-color: #fecaca; color: #b91c1c; }

.ov-top { display: grid; gap: 14px; align-items: start; grid-template-columns: minmax(0, 1fr) 360px; grid-template-areas: "next todo" "kpis todo"; grid-template-rows: auto 1fr; margin-bottom: 14px; }
.ov-top > .ov-todo { align-self: stretch; }
.ov-top > .ov-next { grid-area: next; } .ov-top > .ov-todo { grid-area: todo; } .ov-top > .ov-kpis { grid-area: kpis; } .ov-top > .ov-kpi-head { grid-area: kpihead; }
.ov-hello-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.ov-refresh-ic { display: none; width: 36px; height: 36px; border-radius: 50%; border: 1px solid #e4ece7; background: #fff; color: #166534; font-size: 17px; font-weight: 800; cursor: pointer; flex-shrink: 0; place-items: center; padding: 0; }
.ov-refresh-ic .spin { display: inline-block; animation: ovSpin 1s linear infinite; }
.ov-kpi-head { display: none; }
.ov-seg { display: inline-flex; background: #eef2f0; border-radius: 999px; padding: 3px; gap: 2px; }
.ov-seg button { border: 0; background: transparent; height: 30px; padding: 0 12px; border-radius: 999px; font-size: 12.5px; font-weight: 700; color: #64748b; font-family: inherit; cursor: pointer; white-space: nowrap; }
.ov-seg button.on { background: #fff; color: #166534; box-shadow: 0 1px 3px rgba(15,23,42,.12); }
.ov-kpis { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.ov-kpi { display: flex; flex-direction: column; gap: 4px; background: #fff; border: 1px solid #e6ece8; border-radius: 16px; padding: 14px 16px 10px; text-decoration: none; box-shadow: 0 1px 2px rgba(15,23,42,.04); transition: transform .15s, box-shadow .15s; min-width: 0; }
a.ov-kpi:hover { transform: translateY(-2px); box-shadow: 0 12px 24px -16px rgba(15,23,42,.3); }
.ov-kpi-top { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
.ov-kpi-label { font-size: 12px; font-weight: 700; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
.ov-kpi-val { font-size: clamp(20px, 2.2vw, 26px); font-weight: 800; color: #0f172a; letter-spacing: -.3px; }
/* each number in its own theme colour */
.ov-kpi { border-top: 3px solid transparent; }
.ov-kpi.green { background: linear-gradient(165deg, #e6f7ec 0%, #ffffff 62%); border-color: #cdebd7; border-top-color: #16a34a; }
.ov-kpi.teal { background: linear-gradient(165deg, #e2f6f3 0%, #ffffff 62%); border-color: #c8ebe5; border-top-color: #0d9488; }
.ov-kpi.gold { background: linear-gradient(165deg, #fbf3e2 0%, #ffffff 62%); border-color: #eedfbd; border-top-color: #c9962c; }
.ov-kpi.amber { background: linear-gradient(165deg, #fef3e2 0%, #ffffff 62%); border-color: #f5dfb8; border-top-color: #d97706; }
.ov-kpi.green .ov-kpi-val { color: #166534; } .ov-kpi.teal .ov-kpi-val { color: #0f766e; }
.ov-kpi.gold .ov-kpi-val { color: #92651a; } .ov-kpi.amber .ov-kpi-val { color: #b45309; }
.ov-trend { font-size: 11px; font-weight: 800; padding: 2px 7px; border-radius: 999px; white-space: nowrap; }
.ov-trend.up { background: #ecfdf3; color: #15803d; } .ov-trend.down { background: #fef2f2; color: #b91c1c; }
.ov-spark { width: 100%; height: 28px; display: block; }

.ov-next { display: flex; flex-direction: column; justify-content: center; gap: 12px; background: linear-gradient(160deg, #f0fdf4, #fff 70%); border-color: #cdeedb; }
.ov-next.live { background: linear-gradient(160deg, #dcfce7, #f0fdf4 70%); border-color: #4ade80; box-shadow: 0 0 0 4px rgba(34,197,94,.15), 0 16px 30px -18px rgba(22,101,52,.5); }
.ov-next-k { font-size: 12px; font-weight: 800; letter-spacing: .4px; text-transform: uppercase; color: #15803d; display: flex; gap: 8px; align-items: center; }
.ov-next-k span { text-transform: none; letter-spacing: 0; padding: 2px 8px; border-radius: 999px; background: #fff; border: 1px solid #bbf7d0; color: #166534; }
.ov-next-row { display: flex; align-items: center; gap: 14px; min-width: 0; }
.ov-next-av { width: 56px; height: 56px; flex-shrink: 0; border-radius: 16px; overflow: hidden; background: #dcfce7; display: flex; align-items: center; justify-content: center; }
.ov-next-av img { width: 100%; height: 100%; object-fit: cover; }
.ov-next-av b { font-size: 22px; color: #166534; }
.ov-next-info { min-width: 0; }
.ov-next-name { font-size: 20px; font-weight: 800; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ov-next-sub { font-size: 13.5px; color: #475569; margin: 2px 0 0; }
.ov-next-btns { display: flex; gap: 8px; flex-wrap: wrap; }
.ov-btn { display: inline-flex; align-items: center; justify-content: center; height: 40px; padding: 0 16px; border-radius: 11px; background: #166534; color: #fff !important; font-size: 13.5px; font-weight: 800; text-decoration: none; border: 1.5px solid #166534; }
.ov-btn.gold { background: #f5c542; border-color: #f5c542; color: #3d2a00 !important; }
.ov-btn.ghost { background: #fff; color: #166534 !important; border-color: #cfe3d6; }
.ov-skel { height: 120px; border-radius: 12px; background: linear-gradient(90deg, #f1f5f3, #f8faf9, #f1f5f3); background-size: 200% 100%; animation: ovSkel 1.2s linear infinite; }
@keyframes ovSkel { to { background-position: -200% 0; } }

.ov-week-row { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 8px; }
.ov-day { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 10px 4px; border-radius: 12px; border: 1px solid #eef2f0; background: #fafcfb; text-decoration: none; color: #475569; min-width: 0; }
.ov-day span { font-size: 11px; font-weight: 700; }
.ov-day b { font-size: 18px; font-weight: 800; color: #0f172a; }
.ov-day em { font-style: normal; font-size: 11px; color: #94a3b8; white-space: nowrap; }
.ov-day.has { background: #ecfdf3; border-color: #bbf7d0; } .ov-day.has em { color: #15803d; font-weight: 700; }
.ov-day.today { border-color: #166534; box-shadow: inset 0 0 0 1px #166534; }

.ov-todo ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.ov-todo li { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 12px; border-radius: 12px; background: #f8fafc; border: 1px solid #eef2f6; font-size: 13.5px; color: #334155; }
.ov-todo li.warn { background: #fffbeb; border-color: #fde68a; }
.ov-todo li.bad { background: #fef2f2; border-color: #fecaca; }
.ov-todo li a { flex-shrink: 0; font-size: 12.5px; font-weight: 800; color: #166534; text-decoration: none; }
.ov-todo-acts { display: inline-flex; align-items: center; gap: 10px; flex-shrink: 0; }
.ov-todo-acts button { border: 1px solid #cfe3d6; background: #fff; color: #166534; font-weight: 800; font-size: 12px; font-family: inherit; border-radius: 8px; padding: 4px 9px; cursor: pointer; }
.ov-todo-acts button:hover { background: #e7f6ec; }
.ov-pct { font-size: 12px; font-weight: 800; color: #166534; }
.ov-bar { height: 6px; border-radius: 999px; background: #eef2f0; overflow: hidden; margin: -4px 0 12px; }
.ov-bar i { display: block; height: 100%; background: linear-gradient(90deg, #22c55e, #166534); border-radius: 999px; }
.ov-allset { margin: 0; font-size: 13.5px; color: #15803d; font-weight: 700; }
.ov-compare { font-size: 12.5px; color: #475569; padding: 0 18px 4px; }
.ov-compare b.up { color: #15803d; } .ov-compare b.down { color: #b91c1c; }
.ov-tag-pending { margin-left: 6px; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 5px; background: #fef2f2; color: #b91c1c; }

@media (max-width: 1100px) { .ov-top { grid-template-columns: minmax(0, 1fr) 300px; } }
@media (max-width: 899px) {
  .ov-top { grid-template-columns: minmax(0, 1fr); grid-template-areas: "next" "kpis" "todo"; }
  .ov-kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .ov-today-side { width: 100%; }
}
/* phones: slim greeting, nothing repeated above the Next session card */
@media (max-width: 767px) {
  .ov-today { margin-bottom: 10px; }
  .ov-today-main { width: 100%; }
  .ov-hello { font-size: 19px; }
  .ov-today-line { font-size: 13px; }
  .ov-next-inline, .ov-today-side { display: none !important; }
  .ov-refresh-ic { display: grid; }
  .ov-top { grid-template-areas: "next" "kpihead" "kpis" "todo"; gap: 12px; }
  .ov-kpi-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: -4px; }
  .ov-kpi-head b { font-size: 15px; font-weight: 800; color: #0f172a; }
  .ov-kpis { gap: 10px; }
  .ov-kpi { padding: 12px 14px 8px; }
  .ov-kpi-top { flex-wrap: wrap; row-gap: 4px; }
  .ov-kpi-label { white-space: normal; }
}
@media (max-width: 560px) {
  .ov-week-row { grid-template-columns: repeat(7, 64px); overflow-x: auto; scrollbar-width: none; padding-bottom: 2px; }
  .ov-next-name { font-size: 17px; }
  .ov-btn { flex: 1; }
}
@media (prefers-reduced-motion: reduce) { .ov-join.live, .ov-refresh .spin, .ov-skel { animation: none; } a.ov-kpi:hover { transform: none; } }
`;
