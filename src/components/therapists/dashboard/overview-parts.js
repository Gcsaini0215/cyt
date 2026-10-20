import { sessionWindow, opensAtText } from "../../../utils/session-window";
import { useAssessmentMap, bookingAssessments, AssessmentChips } from "../booking-assessments";
import { isInPerson, InPersonStartDialog } from "../inperson-start";
import { postData } from "../../../utils/actions";
import { EndSessionUrl } from "../../../utils/url";
import React from "react";
import Link from "next/link";
import SessionTicket from "../../client/session-ticket";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import StopRoundedIcon from "@mui/icons-material/StopRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import EventRepeatRoundedIcon from "@mui/icons-material/EventRepeatRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import { earningOf } from "../../../utils/earning";

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
// area sparkline: soft gradient fill under the line, a dot on the latest point
function Sparkline({ data = [], color, labels, fmt = (v) => v }) {
  const id = `ovg${React.useId().replace(/:/g, "")}`; // same on the server and in the browser
  const pts = data.map(Number).filter((n) => Number.isFinite(n));
  if (pts.length < 2) return null;
  const max = Math.max(...pts, 1), w = 100, h = 28;
  const xy = pts.map((v, i) => [(i / (pts.length - 1)) * w, h - (v / max) * (h - 5) - 2.5]);
  const line = xy.map(([x, y]) => `${x},${y}`).join(" ");
  const [lx, ly] = xy[xy.length - 1];
  return (
    <div className="ov-spark-wrap">
      <div className="ov-spark-box">
      <svg className="ov-spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity=".28" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`0,${h} ${line} ${w},${h}`} fill={`url(#${id})`} />
        <polyline points={line} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>
      <i className="ov-spark-dot" style={{ left: `${lx}%`, top: `${(ly / h) * 100}%`, background: color }} />
      <em className="ov-spark-val" style={{ top: `${(ly / h) * 100}%` }}>{fmt(pts[pts.length - 1])}</em>
      </div>
      {labels?.length === pts.length && <div className="ov-axis">{labels.map((l, i) => <span key={i} className={i === labels.length - 1 ? "on" : ""}>{l}</span>)}</div>}
    </div>
  );
}
// mini bars (e.g. sessions per month); the latest bar is solid
function MiniBars({ data = [], color, labels }) {
  const pts = data.map(Number).filter((n) => Number.isFinite(n));
  if (!pts.length) return null;
  const max = Math.max(...pts, 1);
  return (
    <div className="ov-bars-wrap" aria-hidden="true">
      <div className="ov-bars">
        {pts.map((v, i) => (
          <span key={i} className="ov-mbar">
            <em>{v || ""}</em>
            <span className="ov-mbar-track"><i style={{ height: `${Math.max(6, (v / max) * 100)}%`, background: color, opacity: i === pts.length - 1 ? 1 : 0.32 }} /></span>
          </span>
        ))}
      </div>
      {labels?.length === pts.length && <div className="ov-axis bars">{labels.map((l, i) => <span key={i} className={i === labels.length - 1 ? "on" : ""}>{l}</span>)}</div>}
    </div>
  );
}
// five stars filled to the average rating
function Stars({ value = 0, count = 0 }) {
  const v = Math.max(0, Math.min(5, Number(value) || 0));
  return (
    <div className="ov-stars-wrap" aria-hidden="true">
      <div className="ov-stars">
        {[0, 1, 2, 3, 4].map((i) => <span key={i}><i style={{ width: `${Math.max(0, Math.min(1, v - i)) * 100}%` }}>★</i>★</span>)}
      </div>
      <div className="ov-axis stars"><span className="on">{count ? `${v.toFixed(1)} out of 5 · ${count} review${count === 1 ? "" : "s"}` : "No reviews yet — ask your clients after a session"}</span></div>
    </div>
  );
}
// chart: "area" (default) | "bars" | "stars" (stars uses `rating` + `count`); labels = one per point (e.g. months);
// caption = what the graph shows ("Last 6 months")
export function KpiCard({ label, short, value, isCurrency, trend, trendUp, spark, href, tone = "green", loading, Icon, hint, chart = "area", rating, count, labels, caption }) {
  const body = (
    <>
      <div className="ov-kpi-top">
        {Icon && <span className="ov-kpi-ic"><Icon /></span>}
        <span className="ov-kpi-label"><span className="full">{label}</span><span className="short">{short || label}</span></span>
        {trend && <span className={`ov-trend ${trendUp ? "up" : "down"}`}>{trendUp ? "▲" : "▼"} {trend}</span>}
      </div>
      <div className="ov-kpi-val">{loading ? "—" : isCurrency ? inr(value) : value}</div>
      {caption && <span className="ov-kpi-cap">{caption}</span>}
      {chart === "stars" ? <Stars value={rating} count={count} />
        : chart === "bars" ? <MiniBars data={spark} color={`var(--ov-${tone})`} labels={labels} />
        : <Sparkline data={spark} color={`var(--ov-${tone})`} labels={labels} fmt={isCurrency ? inr : (v) => v} />}
      {href && hint && <span className="ov-kpi-hint">{hint} →</span>}
    </>
  );
  return href ? <Link href={href} className={`ov-kpi ${tone}`}>{body}</Link> : <div className={`ov-kpi ${tone}`}>{body}</div>;
}

/* ── 3. next session: who / when / join on the left, the booking's details + receipt on the right ── */
const modeLabel = (b) => {
  const t = `${b?.session_type || ""} ${b?.format || ""}`.toLowerCase();
  if (/person|offline|clinic/.test(t)) return "In-person";
  if (/audio|voice/.test(t) && !/video/.test(t)) return "Voice call";
  return "Video call";
};
const clean = (v) => (v && v !== "null" && v !== "undefined" ? String(v).trim() : "");
const digits = (p) => String(p || "").replace(/\D/g, "");

export function NextSessionCard({ s, loading, onJoin, onReschedule, therapist, onChanged, nav = null, upcoming = false }) {
  const [receipt, setReceipt] = React.useState(false);
  const [starting, setStarting] = React.useState(false);
  const [ending, setEnding] = React.useState(false);
  const amap = useAssessmentMap();
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
  const b = s.raw || {};
  const mins = minutesUntil(s.date);
  const live = mins !== null && mins <= 10;
  const joinWin = sessionWindow(s.date);
  const when = mins === null ? "" : mins <= 0 ? "Happening now" : mins < 60 ? `in ${mins} min` : mins < 1440 ? `in ${Math.floor(mins / 60)}h ${mins % 60}m` : fmtDay(s.date);
  const paid = Number(b.transaction?.amount?.$numberDecimal ?? b.transaction?.amount ?? b.amount?.$numberDecimal ?? b.amount) || 0;
  const forOther = /other/i.test(b.whom || "") ? [clean(b.cname), clean(b.relation_with_client)].filter(Boolean).join(" · ") : "";
  const about = [clean(b.age || b.client?.age) && `${clean(b.age || b.client?.age)} yrs`, clean(b.client?.gender)].filter(Boolean).join(" · ");
  const phone = digits(b.client?.phone);
  const notes = clean(b.notes);
  const assess = bookingAssessments(b, amap);
  const inPerson = isInPerson(b);
  const started = s.status === "Started";
  const at = new Date(s.date).getTime();
  const canStartAt = at - 60 * 60 * 1000; // in person: start (with the client's code) from 1 h before
  const endSession = async () => {
    if (!window.confirm("End this session now?")) return;
    setEnding(true);
    try { await postData(EndSessionUrl, { bookingId: b._id }); onChanged && onChanged(); } catch (e) { window.alert(e?.response?.data?.message || "Couldn't end the session — please try again."); }
    setEnding(false);
  };
  const report = assess.find((x) => x.reportId);
  const details = [
    ["Service", clean(b.service) || "Session"],
    ["Mode", modeLabel(b)],
    paid ? ["You earn", `${inr(earningOf(b))} · client paid ${inr(paid)}`] : null,
    forOther ? ["Session for", forOther] : about ? ["Client", about] : null,
  ].filter(Boolean);
  return (
    <div className={`ov-next ov-card hero ${live || started ? "live" : ""}`}>
      <div className="ov-next-top">
        <div className="ov-next-k">{started ? "In session" : live ? "Starting now" : upcoming ? "Upcoming session" : "Next session"} <span>{started ? "started" : when}</span></div>
        <span className="ov-next-tr">
          <span className={`ov-mode ${inPerson ? "ip" : "vid"}`}>{inPerson ? "📍 In person" : "🎥 Video session"}</span>
          {nav}
        </span>
      </div>
      <div className="ov-next-grid">
        <div className="ov-next-left">
          <div className="ov-next-row">
            <div className={`ov-next-av${s.imgSrc ? "" : " ini"}`}>{s.imgSrc ? <img src={s.imgSrc} alt="" /> : <b>{String(s.name || "Client").trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase()}</b>}</div>
            <div className="ov-next-info">
              <div className="ov-next-name">{s.name}</div>
              <div className="ov-next-sub">{fmtDay(s.date)} · {fmtTime(s.date)}</div>
              {(phone || b._id) && (
                <div className="ov-next-contact">
                  {phone && <a href={`tel:${phone}`}>Call</a>}
                  {phone && <a href={`https://wa.me/${phone.length === 10 ? "91" + phone : phone}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
                  {b._id && <button type="button" className="ov-inv-link" onClick={() => setReceipt(true)}>Invoice</button>}
                </div>
              )}
            </div>
          </div>
          <div className="ov-next-btns">
            {inPerson ? (started
              ? <button type="button" className="ov-btn gold" onClick={endSession} disabled={ending}><StopRoundedIcon />{ending ? "Ending…" : "End session"}</button>
              : Date.now() < canStartAt
                ? <span className="ov-btn ghost ov-opens" style={{ cursor: "default" }}><ScheduleRoundedIcon />Start from&nbsp;<b>{opensAtText(canStartAt)}</b></span>
                : <button type="button" className={`ov-btn ${live ? "gold" : ""}`} onClick={() => setStarting(true)}><PlayArrowRoundedIcon />Start session</button>)
            : s.meet && onJoin && joinWin.open
              ? <button type="button" className={`ov-btn ${live ? "gold" : ""}`} onClick={() => onJoin(s)}><VideocamRoundedIcon />{live ? "Join Meet now" : "Join Meet"}</button>
              : s.meet && joinWin.before
                ? <span className="ov-btn ghost ov-opens" style={{ cursor: "default" }}><ScheduleRoundedIcon />Join opens at&nbsp;<b>{opensAtText(joinWin.opens)}</b></span>
                : <Link href="/appointments" className={`ov-btn ${live ? "gold" : ""}`}>{live ? "Start session" : "Open session"}</Link>}
            {onReschedule && s.status !== "Started"
              ? <button type="button" className="ov-btn ghost" onClick={() => onReschedule(s)}><EventRepeatRoundedIcon />Reschedule</button>
              : <Link href="/appointments" className="ov-btn ghost">Details</Link>}
            {report && <Link href={`/assessment-report/${report.reportId}`} className="ov-btn ghost ov-assess-btn ov-only-phone"><AssignmentRoundedIcon />{report.short} report{report.flag ? " ⚠" : ""}</Link>}
          </div>
          {assess.length > 0 && (
            <div className="ov-next-assess ov-phone-block">
              <span>Clinical assessment</span>
              <AssessmentChips b={b} map={amap} />
            </div>
          )}
        </div>

        <div className="ov-next-right">
          <dl className="ov-next-dl">
            {details.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
          </dl>
          {notes && <p className="ov-next-notes" title={notes}><b>Client&apos;s note:</b> {notes}</p>}
          {assess.length > 0 && (
            <div className="ov-next-assess">
              <span>Clinical assessment</span>
              <AssessmentChips b={b} map={amap} compact />
            </div>
          )}
          {report && <div className="ov-next-rbtns"><Link href={`/assessment-report/${report.reportId}`} className="ov-btn ghost sm"><AssignmentRoundedIcon />{report.short} report{report.flag ? " ⚠" : ""}</Link></div>}
        </div>
      </div>
      {receipt && <SessionTicket b={b} therapist={therapist} onClose={() => setReceipt(false)} />}
      {starting && <InPersonStartDialog booking={b} clientName={s.name} onClose={() => setStarting(false)} onStarted={() => onChanged && onChanged()} />}
    </div>
  );
}

/* Next session card as a slider when more than one session is coming up: arrows + count in the
   card's top row, dots under it, swipe on phones. Always starts on the soonest session. */
export function NextSessionSlider({ sessions = [], loading, max = 8, ...rest }) {
  const list = sessions.slice(0, max);
  const [i, setI] = React.useState(0);
  const touch = React.useRef(null);
  const first = list[0]?.id;
  React.useEffect(() => { setI(0); }, [first]);
  if (loading || list.length <= 1) return <NextSessionCard s={list[0] || null} loading={loading} {...rest} />;
  const at = Math.min(i, list.length - 1);
  const go = (d) => setI((x) => (x + d + list.length) % list.length);
  const nav = (
    <span className="ov-next-nav" role="group" aria-label="Upcoming sessions">
      <button type="button" onClick={() => go(-1)} aria-label="Previous session">‹</button>
      <b>{at + 1}<i>/{list.length}</i></b>
      <button type="button" onClick={() => go(1)} aria-label="Next session">›</button>
    </span>
  );
  return (
    <div className="ov-next-slider"
      onTouchStart={(e) => { touch.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => { const dx = e.changedTouches[0].clientX - (touch.current ?? 0); if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); touch.current = null; }}>
      <NextSessionCard key={list[at].id} s={list[at]} loading={false} nav={nav} upcoming={at > 0} {...rest} />
      <div className="ov-next-dots">
        {list.map((x, k) => <button key={x.id} type="button" className={k === at ? "on" : ""} onClick={() => setI(k)} aria-label={`Session ${k + 1}: ${x.name}`} />)}
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
  const [all, setAll] = React.useState(false); // phones show the first 3
  return (
    <div className="ov-card ov-todo">
      <div className="ov-card-h">
        <b>To-do</b>
        {typeof pct === "number" && <span className="ov-pct" title="Profile strength">Profile {pct}%</span>}
      </div>
      {typeof pct === "number" && <div className="ov-bar"><i style={{ width: `${pct}%` }} /></div>}
      {items.length ? (
        <>
        <ul className={all ? "all" : ""}>
          {items.map((t) => (
            <li key={t.key || t.label} className={t.tone || ""}>
              <span>{t.tone === "done" && <i className="ov-todo-ok" aria-hidden="true">✓</i>}{t.label}</span>
              <span className="ov-todo-acts">
                {t.href && (/^https?:/i.test(t.href)
                  ? <a href={t.href} target="_blank" rel="noopener noreferrer">{t.cta || "Do it"} →</a>
                  : <Link href={t.href}>{t.cta || "Do it"} →</Link>)}
                {t.onDone && <button type="button" onClick={t.onDone} title="Mark as done">✓ Done</button>}
              </span>
            </li>
          ))}
        </ul>
        {items.length > 3 && <button type="button" className="ov-todo-more" onClick={() => setAll((x) => !x)}>{all ? "Show less" : `Show ${items.length - 3} more`}</button>}
        </>
      ) : <p className="ov-allset">✓ All set — nothing pending.</p>}
    </div>
  );
}

export const OV_CSS = `
.ov-todo li.done { color: #166534; }
.ov-todo li.done span:first-child { color: #166534; font-weight: 600; }
.ov-todo-ok { display: inline-grid; place-items: center; width: 17px; height: 17px; margin-right: 7px; border-radius: 50%; background: #16a34a; color: #fff; font-size: 10.5px; font-style: normal; font-weight: 800; vertical-align: -2px; }
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
.ov-top.no-next { grid-template-areas: "kpis todo"; grid-template-rows: auto; }
.ov-spark-box { position: relative; }
.ov-spark-dot { position: absolute; width: 7px; height: 7px; border-radius: 50%; transform: translate(-50%, -50%); box-shadow: 0 0 0 3px #fff, 0 0 0 4px rgba(15,23,42,.08); }
.ov-bars { display: flex; align-items: flex-end; gap: 5px; height: 28px; }
.ov-mbar { flex: 1; height: 100%; display: flex; flex-direction: column; min-width: 0; }
.ov-mbar-track { flex: 1; position: relative; min-height: 0; }
.ov-mbar-track i { position: absolute; left: 0; right: 0; bottom: 0; border-radius: 4px 4px 2px 2px; min-height: 3px; }
.ov-mbar em { display: none; font-style: normal; font-size: 11px; font-weight: 800; color: #475569; text-align: center; line-height: 1; margin-bottom: 3px; }
.ov-spark-val, .ov-axis, .ov-kpi-cap { display: none; }
.ov-kpi-label .short { display: none; }
.ov-stars { display: flex; gap: 3px; font-size: 20px; line-height: 1; color: #f1e3c4; }
.ov-stars span { position: relative; display: inline-block; }
.ov-stars i { position: absolute; left: 0; top: 0; overflow: hidden; color: #f59e0b; font-style: normal; white-space: nowrap; }
/* without the Next session card (desktop): the four KPIs go 2 × 2 and the To-do list scrolls within the same height,
   so no empty space opens up beside it */
@media (min-width: 900px) {
  .ov-top.no-next .ov-kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .ov-top.no-next > .ov-todo { height: 0; min-height: 100%; display: flex; flex-direction: column; overflow: hidden; }
  .ov-top.no-next > .ov-todo ul { overflow-y: auto; min-height: 0; flex: 1; padding-right: 2px; scrollbar-width: thin; }
  /* the bigger cards: the chart is the feature — taller, filling the card, and it says what it shows */
  .ov-top.no-next .ov-kpi-cap { display: block; font-size: 11.5px; font-weight: 700; color: #94a3b8; letter-spacing: .3px; text-transform: uppercase; margin-top: -2px; }
  .ov-top.no-next .ov-spark-val { display: block; position: absolute; right: 0; transform: translateY(-160%); font-style: normal; font-size: 11.5px; font-weight: 800; color: #0f172a; background: #fff; border: 1px solid rgba(15,23,42,.1); border-radius: 7px; padding: 1px 6px; white-space: nowrap; box-shadow: 0 2px 6px -2px rgba(15,23,42,.15); }
  .ov-top.no-next .ov-axis { display: flex; justify-content: space-between; margin-top: 10px; font-size: 11px; font-weight: 600; color: #94a3b8; }
  .ov-top.no-next .ov-axis.bars { gap: 8px; } .ov-top.no-next .ov-axis.bars span { flex: 1; text-align: center; }
  .ov-top.no-next .ov-axis span.on { color: #334155; font-weight: 800; }
  .ov-top.no-next .ov-axis.stars { justify-content: flex-start; margin-top: 2px; }
  .ov-top.no-next .ov-axis.stars span.on { color: #64748b; font-weight: 600; }
  .ov-top.no-next .ov-mbar em { display: block; }
  .ov-top.no-next .ov-kpi > .ov-bars-wrap, .ov-top.no-next .ov-kpi > .ov-stars-wrap { margin-top: auto; }
  .ov-top.no-next .ov-kpi { padding: 16px 18px 12px; gap: 6px; }
  .ov-top.no-next .ov-kpi-val { font-size: 30px; }
  .ov-top.no-next .ov-spark { height: 64px; }
  .ov-top.no-next .ov-bars { height: 64px; gap: 8px; }
  .ov-top.no-next .ov-stars { font-size: 34px; gap: 6px; margin: 6px 0 4px; }
  .ov-top.no-next .ov-kpi > .ov-spark-wrap, .ov-top.no-next .ov-kpi > .ov-bars, .ov-top.no-next .ov-kpi > .ov-stars { margin-top: auto; }
}
.ov-top > .ov-next, .ov-top > .ov-next-slider { grid-area: next; } .ov-top > .ov-todo { grid-area: todo; } .ov-top > .ov-kpis { grid-area: kpis; } .ov-top > .ov-kpi-head { grid-area: kpihead; }
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

.ov-next { display: flex; flex-direction: column; justify-content: center; gap: 12px; background: linear-gradient(150deg, #fdf3d8 0%, #fffaf0 55%, #fff 100%); border-color: #ecd49a; }
.ov-next.live { background: linear-gradient(150deg, #fbe6ad 0%, #fdf3d8 60%, #fffaf0 100%); border-color: #d4a24c; box-shadow: 0 0 0 4px rgba(212,162,76,.2), 0 16px 30px -18px rgba(138,93,6,.5); }
.ov-next-k { font-size: 12px; font-weight: 800; letter-spacing: .4px; text-transform: uppercase; color: #8a5d06; display: flex; gap: 8px; align-items: center; }
.ov-next-k span { text-transform: none; letter-spacing: 0; padding: 2px 8px; border-radius: 999px; background: #fff; border: 1px solid #ecd49a; color: #8a5d06; }
.ov-next-tr { display: inline-flex; align-items: center; gap: 8px; }
.ov-next-nav { display: inline-flex; align-items: center; gap: 2px; background: #fff; border: 1px solid #ecd49a; border-radius: 999px; padding: 2px; }
.ov-next-nav button { width: 26px; height: 26px; border: none; border-radius: 50%; background: transparent; color: #8a5d06; font-size: 18px; font-weight: 800; line-height: 1; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
.ov-next-nav button:hover { background: #fdf3d8; }
.ov-next-nav b { font-size: 12.5px; color: #3d2a00; min-width: 30px; text-align: center; }
.ov-next-nav b i { font-style: normal; font-weight: 600; color: #a08a5c; }
.ov-next-slider { position: relative; display: flex; flex-direction: column; min-width: 0; }
.ov-next-slider > .ov-next { flex: 1; animation: ovSlideIn .25s ease; }
@keyframes ovSlideIn { from { opacity: .4; transform: translateX(8px); } to { opacity: 1; transform: none; } }
.ov-next-dots { display: flex; justify-content: center; gap: 5px; padding-top: 8px; }
.ov-next-dots button { width: 7px; height: 7px; padding: 0; border: none; border-radius: 99px; background: #e7d3a3; cursor: pointer; transition: width .2s, background .2s; }
.ov-next-dots button.on { width: 18px; background: #b07a1c; }
@media (prefers-reduced-motion: reduce) { .ov-next-slider > .ov-next { animation: none; } }
.ov-next-row { display: flex; align-items: center; gap: 14px; min-width: 0; }
.ov-next-av { width: 56px; height: 56px; flex-shrink: 0; border-radius: 16px; overflow: hidden; background: #f6e3b4; display: flex; align-items: center; justify-content: center; }
.ov-next-av img { width: 100%; height: 100%; object-fit: cover; }
.ov-next-av b { font-size: 22px; color: #8a5d06; }
.ov-next-info { min-width: 0; }
.ov-next-name { font-size: 20px; font-weight: 800; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ov-next-sub { font-size: 13.5px; color: #475569; margin: 2px 0 0; }
.ov-next-btns { display: flex; gap: 8px; flex-wrap: wrap; }
.ov-opens b { font-weight: 800; margin-left: 2px; }
.ov-next-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.ov-mode { font-size: 11.5px; font-weight: 800; border-radius: 999px; padding: 3px 10px; background: #fff; border: 1px solid #e2e8f0; color: #334155; white-space: nowrap; }
.ov-mode.ip { border-color: #f1dca6; color: #8a5d06; }
.ov-next .ov-btn:disabled { opacity: .6; cursor: default; }
button.ov-btn { cursor: pointer; font-family: inherit; }
.ov-next-assess { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.ov-next-assess > span:first-child { font-size: 11px; font-weight: 800; letter-spacing: .4px; text-transform: uppercase; color: #64748b; }
.ov-next-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 16px 22px; align-items: center; }
.ov-next-left { display: flex; flex-direction: column; gap: 14px; min-width: 0; }
.ov-next-right { display: flex; flex-direction: column; gap: 10px; align-items: flex-start; padding-left: 20px; border-left: 1px dashed #e6cf96; min-width: 0; }
.ov-next-dl { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px 16px; margin: 0; width: 100%; }
.ov-next-dl div { min-width: 0; }
.ov-next-dl dt { font-size: 10.5px; font-weight: 800; letter-spacing: .5px; text-transform: uppercase; color: #64748b; }
.ov-next-dl dd { margin: 2px 0 0; font-size: 13.5px; font-weight: 700; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ov-next-notes { margin: 0; font-size: 12.5px; color: #475569; line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.ov-next-notes b { color: #0f172a; }
.ov-next-contact { display: flex; gap: 10px; margin-top: 4px; }
.ov-next-contact a { font-size: 12.5px; font-weight: 800; color: #166534; text-decoration: none; }
.ov-next-contact a:hover { text-decoration: underline; }
.ov-only-phone, .ov-only-phone-inline, .ov-btn.ov-only-phone { display: none; }
.ov-btn.sm { height: 34px; padding: 0 14px; font-size: 13px; cursor: pointer; font-family: inherit; }
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
.ov-todo li { margin: 0; display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 12px; border-radius: 12px; background: #f8fafc; border: 1px solid #eef2f6; font-size: 13.5px; color: #334155; }
.ov-todo li.warn { background: #fffbeb; border-color: #fde68a; }
.ov-todo li.bad { background: #fef2f2; border-color: #fecaca; }
.ov-todo li.done { background: #f0fdf4; border-color: #bbf7d0; }
.ov-todo li a { flex-shrink: 0; font-size: 12.5px; font-weight: 800; color: #166534; text-decoration: none; }
.ov-todo-more { display: none; width: 100%; margin-top: 8px; border: 1px dashed #cbd5e1; background: #fff; color: #166534; font-size: 13px; font-weight: 800; border-radius: 10px; padding: 8px; cursor: pointer; font-family: inherit; }
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

/* same column widths as the cards grid below (MUI md 300px / lg 360px) so To-do lines up with Client Reviews */
@media (max-width: 1199px) { .ov-top { grid-template-columns: minmax(0, 1fr) 300px; } }
@media (max-width: 899px) {
  .ov-top { grid-template-columns: minmax(0, 1fr); grid-template-areas: "next" "kpis" "todo"; }
  .ov-top.no-next { grid-template-areas: "kpis" "todo"; }
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
  .ov-top.no-next { grid-template-areas: "kpihead" "kpis" "todo"; }
  .ov-kpi-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: -4px; }
  .ov-kpi-head b { font-size: 15px; font-weight: 800; color: #0f172a; }
  .ov-kpis { gap: 10px; }
  .ov-kpi { padding: 12px 14px 8px; }
  .ov-kpi-top { flex-wrap: wrap; row-gap: 4px; }
  .ov-kpi-label { white-space: normal; }
}
@media (max-width: 767px) {
  .ov-next-grid { grid-template-columns: 1fr; }
  /* phones: keep the card short — who/when + one line of three buttons, no details panel */
  .ov-next-right { display: none; }
  .ov-only-phone, .ov-btn.ov-only-phone { display: inline-flex; } .ov-only-phone-inline { display: inline; } .ov-hide-phone { display: none; }
  /* phones: first action full width (its text never spills out), the rest two per row */
  .ov-next-btns { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
  .ov-next-btns > :first-child { grid-column: 1 / -1; }
  .ov-next-btns .ov-btn { min-width: 0; padding: 0 8px; height: 40px; font-size: 12.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
}
@media (max-width: 560px) {
  .ov-week-row { grid-template-columns: repeat(7, 64px); overflow-x: auto; scrollbar-width: none; padding-bottom: 2px; }
  .ov-next-name { font-size: 17px; }
  .ov-btn { flex: 1; }
}
/* ── phones: tidy KPI cards (labelled mini graphs) and a short To-do ── */
@media (max-width: 767px) {
  .ov-kpis { grid-auto-rows: 1fr; }
  .ov-kpi { padding: 12px 12px 10px !important; gap: 4px; }
  .ov-kpi-top { flex-wrap: nowrap !important; gap: 6px; }
  .ov-kpi-top { align-items: flex-start !important; }
  .ov-kpi-ic { display: none !important; }
  .ov-kpi-label .full { display: none; } .ov-kpi-label .short { display: inline; }
  .ov-kpi-label { white-space: normal !important; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; flex: 1; font-size: 12px; line-height: 1.3; }
  .ov-trend { font-size: 10.5px !important; padding: 1px 6px !important; flex-shrink: 0; }
  .ov-kpi-val { font-size: 22px !important; line-height: 1.15; }
  .ov-kpi-cap { display: block; font-size: 9.5px; font-weight: 700; letter-spacing: .3px; text-transform: uppercase; color: #94a3b8; line-height: 1.35; }

  .ov-kpi > .ov-spark-wrap, .ov-kpi > .ov-bars-wrap, .ov-kpi > .ov-stars-wrap { margin-top: auto; }
  .ov-spark { height: 40px; }
  .ov-bars { height: 40px; gap: 4px; }
  .ov-axis { display: flex; justify-content: space-between; margin-top: 8px; font-size: 10px; font-weight: 600; color: #94a3b8; }
  .ov-axis span:not(:first-child):not(:last-child) { display: none; }
  .ov-axis span.on { color: #334155; font-weight: 800; }
  .ov-axis.stars span { display: block !important; font-size: 10.5px; line-height: 1.35; white-space: normal; color: #64748b; font-weight: 600; }
  .ov-stars { font-size: 19px; gap: 2px; }
  .ov-kpi-hint { display: none; }
  .ov-todo ul:not(.all) li:nth-child(n+4) { display: none; }
  .ov-todo-more { display: block; }
  .ov-todo li { padding: 10px 12px; font-size: 13.5px; }
}
@media (prefers-reduced-motion: reduce) { .ov-join.live, .ov-refresh .spin, .ov-skel { animation: none; } a.ov-kpi:hover { transform: none; } }
/* ── Next session: the dashboard's hero card — solid pastel mint, compact left / right split ── */
.ov-card.ov-next.hero { background: linear-gradient(135deg, #f7e2a8 0%, #fbedc6 45%, #fff7e2 100%); border: 1px solid #e3c47c; box-shadow: 0 10px 26px -22px rgba(138,93,6,.55); gap: 10px; padding-top: 16px; padding-bottom: 16px; }
.ov-card.ov-next.hero.live { border: 2px solid #c48a1c; box-shadow: 0 0 0 4px rgba(212,162,76,.22), 0 10px 26px -20px rgba(138,93,6,.6); }
.ov-next.hero .ov-next-k { color: #7a5413; }
.ov-next.hero .ov-next-k span { background: #fff; border-color: #e3c47c; color: #6b4a0f; }
.ov-next.hero .ov-mode { background: #fff; border-color: #e3c47c; color: #6b4a0f; }
.ov-next.hero .ov-next-av { background: #fff; box-shadow: none; width: 52px; height: 52px; }
.ov-next.hero .ov-next-av b { color: #166534; }
.ov-next.hero .ov-next-name { color: #0f2e1d; }
.ov-next.hero .ov-next-sub { color: #6b5a33; }
.ov-next.hero .ov-next-contact a { color: #166534; }
.ov-next.hero .ov-btn { background: #166534; border-color: #166534; color: #fff !important; }
.ov-next.hero .ov-btn.gold { background: #f5c542; border-color: #f5c542; color: #3d2a00 !important; }
.ov-next.hero .ov-btn.ghost { background: #166534; border-color: #166534; color: #fff !important; }
.ov-next.hero .ov-btn.ghost:hover, .ov-next.hero .ov-btn:hover { background: #14532d; border-color: #14532d; }
.ov-next.hero .ov-next-av.ini { border-radius: 50%; background: linear-gradient(135deg, #14532d, #1f7a47); box-shadow: none; }
.ov-next.hero .ov-next-av.ini b { color: #fff; font-size: 19px; font-weight: 800; letter-spacing: .5px; }
.ov-next.hero .ov-next-left { gap: 12px; }
.ov-next.hero .ov-next-right { border-left: 0; background: #fff; border: 1px solid #ecd49a; border-radius: 14px; padding: 12px 14px; gap: 10px; }
.ov-next.hero .ov-next-dl { gap: 8px 14px; }
.ov-next.hero .ov-next-dl dt { color: #8a7342; }
.ov-next.hero .ov-next-dl dd { color: #0f2e1d; }
.ov-next.hero .ov-next-assess > span:first-child { color: #8a7342; }
.ov-next-rbtns { display: flex; gap: 8px; flex-wrap: wrap; }
.ov-next.hero .ov-btn svg { font-size: 18px; margin-right: 6px; flex-shrink: 0; }
/* every size: one strong main action, softer green for the rest */
.ov-next.hero .ov-next-btns > :first-child { background: #14532d; border-color: #14532d; box-shadow: 0 8px 16px -10px rgba(20,83,45,.75); }
.ov-next.hero .ov-next-btns > :first-child.gold { background: #f5c542; border-color: #f5c542; color: #3d2a00 !important; }
.ov-next.hero .ov-next-btns > :not(:first-child), .ov-next.hero .ov-next-rbtns .ov-btn { background: #2b7a4b; border-color: #2b7a4b; box-shadow: none; }
.ov-next.hero .ov-next-btns > :first-child:hover { background: #0f3d22; border-color: #0f3d22; }
.ov-next.hero .ov-next-btns > :not(:first-child):hover, .ov-next.hero .ov-next-rbtns .ov-btn:hover { background: #236640; border-color: #236640; }
.ov-next.hero .ov-btn b { margin-left: 3px; }
.ov-inv-link { border: 0; background: none; padding: 0; font: inherit; font-size: 12.5px; font-weight: 700; color: #1d4ed8; cursor: pointer; text-decoration: underline; text-underline-offset: 2px; }
.ov-inv-link:hover { color: #1e3a8a; }
.ov-card.ov-next.hero { padding: 14px 16px; gap: 8px; }
.ov-next.hero .ov-next-grid { gap: 12px 18px; }
.ov-next.hero .ov-next-row { gap: 12px; }
.ov-next.hero .ov-next-av { width: 46px; height: 46px; }
.ov-next.hero .ov-next-av.ini b { font-size: 16px; }
.ov-next.hero .ov-next-name { font-size: 17px; }
.ov-next.hero .ov-next-sub { font-size: 12.5px; }
.ov-next.hero .ov-next-contact { gap: 12px; margin-top: 2px; }
.ov-next.hero .ov-next-contact a { font-size: 12.5px; }
.ov-next.hero .ov-next-left { gap: 10px; }
.ov-next.hero .ov-btn { height: 36px; padding: 0 14px; font-size: 13px; border-radius: 9px; }
.ov-next.hero .ov-btn.sm { height: 32px; font-size: 12.5px; }
.ov-next.hero .ov-next-right { padding: 10px 12px; gap: 8px; border-radius: 12px; }
.ov-next.hero .ov-next-dl { gap: 6px 14px; }
.ov-next.hero .ov-next-dl dt { font-size: 10px; }
.ov-next.hero .ov-next-dl dd { font-size: 13px; margin-top: 1px; }
.ov-next.hero .ov-next-k { font-size: 11px; }
.ov-next.hero .ov-mode { font-size: 11px; padding: 2px 9px; }
.ov-phone-block { display: none; }
@media (max-width: 767px) {
  .ov-phone-block { display: flex; }
  .ov-card.ov-next.hero { padding: 12px 14px; }
  /* phones: one clear main action, then equal secondary actions */
  .ov-next.hero .ov-next-btns { gap: 8px; }
  .ov-next.hero .ov-next-btns > :first-child { height: 46px; font-size: 14.5px; border-radius: 12px; background: #14532d; border-color: #14532d; box-shadow: 0 8px 16px -10px rgba(20,83,45,.75); }
  .ov-next.hero .ov-next-btns > :first-child.gold { background: #f5c542; border-color: #f5c542; color: #3d2a00 !important; }
  .ov-next.hero .ov-next-btns > :not(:first-child) { height: 40px; font-size: 13px; border-radius: 11px; background: #2b7a4b; border-color: #2b7a4b; box-shadow: none; }
  .ov-next.hero .ov-next-btns > :only-child, .ov-next.hero .ov-next-btns > :last-child:nth-child(2) { grid-column: auto; }
  .ov-next.hero .ov-next-btns > :nth-child(2):last-child { grid-column: 1 / -1; }
  .ov-next.hero .ov-btn svg { font-size: 19px; }
}
/* ── KPI cards: clean white cards, tinted icon chip, one accent per card ── */
.ov-kpis .ov-kpi { background: #fff; border: 1px solid #e3ebe6; border-top: 1px solid #e3ebe6; border-radius: 16px; padding: 14px 16px 12px; gap: 6px; box-shadow: 0 6px 18px -16px rgba(15,23,42,.35); position: relative; overflow: hidden; }
.ov-kpis a.ov-kpi:hover { transform: translateY(-2px); border-color: #c9e3d3; box-shadow: 0 14px 28px -20px rgba(20,83,45,.45); }
.ov-kpi-top { gap: 8px; justify-content: flex-start; }
.ov-kpi-top .ov-trend { margin-left: auto; }
.ov-kpi-ic { width: 32px; height: 32px; border-radius: 10px; display: grid; place-items: center; flex-shrink: 0; }
.ov-kpi-ic svg { font-size: 18px; }
.ov-kpis .ov-kpi-label { font-size: 12.5px; color: #475569; }
.ov-kpis .ov-kpi-val { color: #0f172a; font-size: clamp(22px, 2.3vw, 28px); line-height: 1.1; }
.ov-kpi-hint { font-size: 11.5px; font-weight: 700; color: #94a3b8; margin-top: -2px; transition: color .15s; }
a.ov-kpi:hover .ov-kpi-hint { color: #166534; }
.ov-kpi.green .ov-kpi-ic { background: #dcf3e4; color: #166534; }
.ov-kpi.teal .ov-kpi-ic { background: #d7f1ec; color: #0f766e; }
.ov-kpi.gold .ov-kpi-ic { background: #f8ecd0; color: #8a6116; }
.ov-kpi.amber .ov-kpi-ic { background: #fde9cc; color: #b45309; }
.ov-kpis .ov-kpi.green .ov-kpi-val, .ov-kpis .ov-kpi.teal .ov-kpi-val, .ov-kpis .ov-kpi.gold .ov-kpi-val, .ov-kpis .ov-kpi.amber .ov-kpi-val { color: #0f172a; }
.ov-kpis .ov-kpi::before { content: ""; position: absolute; left: 0; top: 14px; bottom: 14px; width: 3px; border-radius: 0 3px 3px 0; }
.ov-kpis .ov-kpi.green::before { background: #16a34a; } .ov-kpis .ov-kpi.teal::before { background: #0d9488; }
.ov-kpis .ov-kpi.gold::before { background: #c9962c; } .ov-kpis .ov-kpi.amber::before { background: #d97706; }
@media (max-width: 767px) {
  .ov-kpis .ov-kpi { padding: 12px 12px 10px; }
  .ov-kpi-ic { width: 28px; height: 28px; border-radius: 9px; } .ov-kpi-ic svg { font-size: 16px; }
  .ov-kpi-hint { display: none; }
}
`;
