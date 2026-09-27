import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import MainLayout from "../components/therapists/main-layout";
import AvailabilityGrid from "../components/therapists/settings/availability-grid";
import TherapistFees from "../components/therapists/settings/therapist-fees";
import useTherapistStore from "../store/therapistStore";
import { fetchData } from "../utils/actions";
import { getBookings } from "../utils/url";
import { SESSION_STATUS } from "../utils/constant";

/* My Schedule — laid out like the admin's CYT Noida desk:
   Appointments (All bookings · Today · Week) and Setup (Availability · Fees). */

const GROUPS = [
  { id: "appts", label: "Appointments", icon: "feather-calendar", views: [["bookings", "All bookings"], ["today", "Today"], ["week", "Week"]] },
  { id: "setup", label: "Setup", icon: "feather-sliders", views: [["availability", "Availability"], ["fees", "Fees"]] },
];
const VIEW_IDS = GROUPS.flatMap((g) => g.views.map(([id]) => id));
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const SDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const SLOT_MIN = 60;

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
const timeLabel = (mins) => `${Math.floor(mins / 60) % 12 || 12}:${String(mins % 60).padStart(2, "0")} ${mins < 720 ? "AM" : "PM"}`;
const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const minsOf = (d) => d.getHours() * 60 + d.getMinutes();
const inr = (n) => `₹${Math.round(Number(n) || 0).toLocaleString("en-IN")}`;
const money = (b) => Number(b.transaction?.amount?.$numberDecimal ?? b.transaction?.amount ?? b.amount?.$numberDecimal ?? b.amount ?? 0) || 0;

function slotsFor(avail, date) {
  const av = (avail || []).find((a) => a.day === DAYS[date.getDay()]);
  if (!av?.times?.length) return [];
  const out = new Set();
  av.times.forEach((t) => {
    const o = toMinutes(t.open), c = toMinutes(t.close);
    if (o == null || c == null) return;
    for (let m = o; m + SLOT_MIN <= c; m += SLOT_MIN) out.add(m);
  });
  return [...out].sort((a, b) => a - b);
}

const clientName = (b) => b.cname || b.client?.name || "Client";
const STATUS = {
  [SESSION_STATUS.NEW]: ["Booked", "#1d4ed8", "#eff6ff"],
  [SESSION_STATUS.STARTED]: ["In session", "#b45309", "#fffbeb"],
  [SESSION_STATUS.COMPLETED]: ["Completed", "#15803d", "#f0fdf4"],
  [SESSION_STATUS.CANCELED]: ["Cancelled", "#b91c1c", "#fef2f2"],
};
const statusMeta = (s) => STATUS[s] || [s || "Booked", "#475569", "#f1f5f9"];
const dayTitle = (d, now) => sameDay(d, now) ? "Today" : sameDay(d, addDays(now, 1)) ? "Tomorrow" : sameDay(d, addDays(now, -1)) ? "Yesterday"
  : `${SDAYS[d.getDay()]}, ${d.getDate()} ${MONS[d.getMonth()]}${d.getFullYear() !== now.getFullYear() ? ` ${d.getFullYear()}` : ""}`;

function Chip({ meta }) {
  return <span className="ms-chip" style={{ color: meta[1], background: meta[2] }}>{meta[0]}</span>;
}

export default function MySchedule() {
  const router = useRouter();
  const { therapistInfo, fetchTherapistInfo } = useTherapistStore();
  const [view, setView] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [picked, setPicked] = useState(null);
  // All bookings
  const [when, setWhen] = useState("upcoming"); // upcoming | past | all
  const [q, setQ] = useState("");
  const [showCancelled, setShowCancelled] = useState(false);
  // Today (any day) + Week
  const [day, setDay] = useState(() => startOfDay(new Date()));
  const [weekStart, setWeekStart] = useState(() => startOfDay(new Date()));

  useEffect(() => {
    if (!router.isReady) return;
    const t = String(router.query.tab || "");
    if (VIEW_IDS.includes(t)) setView(t);
  }, [router.isReady, router.query.tab]);
  const go = (id) => {
    setView(id);
    router.replace({ pathname: router.pathname, query: id === "bookings" ? {} : { tab: id } }, undefined, { shallow: true });
  };
  const group = GROUPS.find((g) => g.views.some(([id]) => id === view)) || GROUPS[0];

  useEffect(() => { if (!therapistInfo?.user?.email) fetchTherapistInfo(); }, [therapistInfo?.user?.email, fetchTherapistInfo]);

  const loadBookings = useCallback(async () => {
    try {
      const res = await fetchData(getBookings);
      if (res?.status) setBookings(res.data || []);
    } catch { /* not logged in / offline */ }
    setLoading(false);
  }, []);
  useEffect(() => {
    loadBookings();
    const iv = setInterval(() => { if (!document.hidden) loadBookings(); }, 60000);
    return () => clearInterval(iv);
  }, [loadBookings]);

  const avail = useMemo(() => therapistInfo?.availabilities || [], [therapistInfo?.availabilities]);
  const hasHours = avail.some((a) => a.times?.length);
  const hasFees = (therapistInfo?.fees || []).some((f) => f?.formats?.some((x) => x?.fee));
  const all = useMemo(() => bookings.map((b) => ({ ...b, at: new Date(b.booking_date) })), [bookings]);
  const live = useMemo(() => all.filter((b) => b.status !== SESSION_STATUS.CANCELED), [all]);
  const now = new Date();

  /* ── stat cards ── */
  const todayCount = live.filter((b) => sameDay(b.at, now)).length;
  const next7 = live.filter((b) => b.at > now && b.at < addDays(startOfDay(now), 8)).length;
  const doneMonth = all.filter((b) => b.status === SESSION_STATUS.COMPLETED && b.at.getMonth() === now.getMonth() && b.at.getFullYear() === now.getFullYear()).length;
  const earned7 = all.filter((b) => b.status === SESSION_STATUS.COMPLETED && b.at > addDays(now, -7) && b.at <= now).reduce((s, b) => s + money(b), 0);

  /* ── All bookings list ── */
  const listed = useMemo(() => {
    const term = q.trim().toLowerCase();
    return all
      .filter((b) => showCancelled || b.status !== SESSION_STATUS.CANCELED)
      .filter((b) => when === "all" ? true : when === "upcoming" ? b.at >= startOfDay(now) : b.at < startOfDay(now))
      .filter((b) => !term || [clientName(b), b.client?.phone, b.client?.email, b.service].some((v) => String(v || "").toLowerCase().includes(term)))
      .sort((a, b) => (when === "past" ? b.at - a.at : a.at - b.at));
  }, [all, q, when, showCancelled]); // eslint-disable-line react-hooks/exhaustive-deps
  const grouped = useMemo(() => {
    const out = [];
    listed.forEach((b) => {
      const k = startOfDay(b.at).getTime();
      let g = out[out.length - 1];
      if (!g || g.k !== k) { g = { k, date: startOfDay(b.at), items: [] }; out.push(g); }
      g.items.push(b);
    });
    return out;
  }, [listed]);

  const exportCsv = () => {
    const rows = [["Date", "Time", "Client", "Phone", "Service", "Format", "Status", "Amount"]];
    listed.forEach((b) => rows.push([
      `${b.at.getDate()} ${MONS[b.at.getMonth()]} ${b.at.getFullYear()}`, timeLabel(minsOf(b.at)), clientName(b), b.client?.phone || "",
      b.service || "", b.format || "", statusMeta(b.status)[0], money(b) || "",
    ]));
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `my-bookings-${now.toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  /* ── Today (any day) ── */
  const dayList = useMemo(() => all.filter((b) => sameDay(b.at, day)).sort((a, b) => a.at - b.at), [all, day]);
  const dayCounts = Object.fromEntries(Object.keys(STATUS).map((s) => [s, dayList.filter((b) => b.status === s).length]));
  const dayFree = useMemo(() => {
    const taken = new Set(dayList.filter((b) => b.status !== SESSION_STATUS.CANCELED).map((b) => minsOf(b.at)));
    return slotsFor(avail, day).filter((m) => !taken.has(m) && (!sameDay(day, now) || m > minsOf(now)));
  }, [avail, day, dayList]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Week ── */
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const rows = useMemo(() => {
    const set = new Set();
    days.forEach((d) => slotsFor(avail, d).forEach((m) => set.add(m)));
    live.forEach((b) => { if (days.some((d) => sameDay(d, b.at))) set.add(minsOf(b.at)); });
    return [...set].sort((a, b) => a - b);
  }, [days, avail, live]);
  const cell = (d, m) => {
    const b = live.find((x) => sameDay(x.at, d) && minsOf(x.at) === m);
    if (b) return { kind: "booked", b };
    if (!slotsFor(avail, d).includes(m)) return { kind: "off" };
    const at = new Date(d); at.setHours(Math.floor(m / 60), m % 60, 0, 0);
    return { kind: at <= now ? "past" : "free" };
  };

  const fmtWhen = (d) => `${dayTitle(d, now)}, ${timeLabel(minsOf(d))}`;

  const Row = ({ b }) => (
    <button type="button" className="ms-row" onClick={() => setPicked(b)}>
      <span className="ms-time">{timeLabel(minsOf(b.at))}</span>
      <span className="ms-who"><b>{clientName(b)}</b><span>{[b.service, b.format].filter(Boolean).join(" · ")}</span></span>
      {money(b) > 0 && <span className="ms-amt">{inr(money(b))}</span>}
      <Chip meta={statusMeta(b.status)} />
    </button>
  );

  return (
    <MainLayout>
      <style dangerouslySetInnerHTML={{ __html: `
        .ms-page { font-family: inherit; }
        .ms-title { display: flex; align-items: center; gap: 10px; font-size: 24px; font-weight: 700; color: #122019; margin: 0; }
        .ms-title i { color: #1a6b3a; font-size: 22px; }
        .ms-sub { font-size: 13.5px; color: #64748b; margin: 4px 0 18px; }
        .ms-groups { display: flex; align-items: flex-end; gap: 22px; border-bottom: 1px solid #e3e8e5; margin-bottom: 14px; overflow-x: auto; }
        .ms-group { display: inline-flex; align-items: center; gap: 8px; border: none; background: none; padding: 10px 2px; font-size: 14.5px; font-weight: 600; color: #8a978f; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1px; white-space: nowrap; font-family: inherit; }
        .ms-group.on { color: #1a6b3a; border-bottom-color: #1a6b3a; }
        .ms-group .dot { width: 7px; height: 7px; border-radius: 50%; background: #f59e0b; }
        .ms-group-link { margin-left: auto; font-size: 13.5px; font-weight: 600; color: #8a978f; text-decoration: none; padding: 10px 0; white-space: nowrap; display: inline-flex; align-items: center; gap: 6px; }
        .ms-group-link:hover { color: #1a6b3a; }
        .ms-subs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
        .ms-sub-tab { border: 1px solid #e3e8e5; background: #fff; border-radius: 999px; padding: 9px 18px; font-size: 13.5px; font-weight: 600; color: #334155; cursor: pointer; font-family: inherit; }
        .ms-sub-tab.on { background: #1a6b3a; border-color: #1a6b3a; color: #fff; }
        .ms-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 16px; }
        .ms-card-s { background: #fff; border: 1px solid #e3e8e5; border-radius: 12px; padding: 16px; min-height: 88px; }
        .ms-card-s small { display: block; font-size: 11px; font-weight: 700; letter-spacing: .8px; text-transform: uppercase; color: #8a978f; }
        .ms-card-s b { display: block; font-size: 24px; font-weight: 800; color: #122019; margin-top: 6px; }
        .ms-card-s span { font-size: 12px; color: #8a978f; }
        .ms-bar { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 14px; }
        .ms-search { flex: 1 1 280px; max-width: 380px; position: relative; }
        .ms-search i { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
        .ms-search input { width: 100%; height: 42px; border: 1px solid #e3e8e5; border-radius: 10px; padding: 0 12px 0 38px; font-size: 14px; background: #fff; outline: none; box-sizing: border-box; font-family: inherit; }
        .ms-search input:focus { border-color: #1a6b3a; }
        .ms-seg { display: inline-flex; background: #eef1ef; border-radius: 10px; padding: 3px; }
        .ms-seg button { border: none; background: none; padding: 8px 14px; border-radius: 8px; font-size: 13.5px; font-weight: 600; color: #8a978f; cursor: pointer; font-family: inherit; }
        .ms-seg button.on { background: #fff; color: #1a6b3a; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
        .ms-btn { display: inline-flex; align-items: center; gap: 7px; border: 1px solid #e3e8e5; background: #fff; border-radius: 10px; padding: 0 14px; height: 42px; font-size: 13.5px; font-weight: 600; color: #122019; cursor: pointer; font-family: inherit; }
        .ms-btn.on { border-color: #1a6b3a; color: #1a6b3a; background: #f0fdf4; }
        .ms-right { margin-left: auto; display: flex; gap: 8px; }
        .ms-grp-title { font-size: 12px; font-weight: 700; letter-spacing: .6px; text-transform: uppercase; color: #8a978f; margin: 16px 0 8px; }
        .ms-list { display: flex; flex-direction: column; gap: 8px; }
        .ms-row { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border: 1px solid #e3e8e5; border-radius: 12px; cursor: pointer; background: #fff; text-align: left; font-family: inherit; width: 100%; }
        .ms-row:hover { border-color: #bbf7d0; }
        .ms-time { width: 76px; flex-shrink: 0; font-weight: 700; color: #122019; font-size: 14px; }
        .ms-who { flex: 1; min-width: 0; }
        .ms-who b { display: block; font-size: 14px; color: #122019; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .ms-who span { font-size: 12.5px; color: #64748b; }
        .ms-amt { font-size: 13.5px; font-weight: 700; color: #122019; }
        .ms-chip { font-size: 11.5px; font-weight: 700; padding: 3px 10px; border-radius: 999px; white-space: nowrap; }
        .ms-empty { text-align: center; padding: 50px 10px; color: #8a978f; font-size: 13.5px; }
        .ms-empty i { display: block; font-size: 30px; color: #94a3b8; margin-bottom: 10px; }
        .ms-empty b { display: block; color: #122019; font-size: 15px; margin-bottom: 4px; }
        .ms-empty button, .ms-empty a { margin-top: 12px; }
        .ms-daybar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 14px; }
        .ms-nav { display: inline-flex; border: 1px solid #e3e8e5; border-radius: 10px; overflow: hidden; background: #fff; }
        .ms-nav button { border: none; background: none; padding: 0 12px; height: 40px; font-size: 13.5px; font-weight: 600; color: #122019; cursor: pointer; font-family: inherit; }
        .ms-nav button + button { border-left: 1px solid #e3e8e5; }
        .ms-daylabel { font-size: 16px; font-weight: 700; color: #122019; }
        .ms-counts { display: flex; gap: 8px; flex-wrap: wrap; margin-left: auto; }
        .ms-count { border: 1px solid #e3e8e5; background: #fff; border-radius: 10px; padding: 8px 12px; font-size: 12.5px; color: #8a978f; }
        .ms-count b { font-size: 16px; margin-right: 5px; }
        .ms-free { display: flex; flex-wrap: wrap; gap: 6px; }
        .ms-free span { font-size: 12.5px; font-weight: 700; color: #166534; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 5px 10px; border-radius: 999px; }
        .ms-box { background: #fff; border: 1px solid #e3e8e5; border-radius: 12px; padding: 16px; margin-top: 14px; }
        .ms-box h3 { font-size: 13px; font-weight: 700; letter-spacing: .5px; text-transform: uppercase; color: #8a978f; margin: 0 0 10px; }
        .ms-legend { display: flex; gap: 12px; flex-wrap: wrap; font-size: 12px; color: #475569; margin-left: auto; }
        .ms-legend i { display: inline-block; width: 11px; height: 11px; border-radius: 3px; margin-right: 5px; vertical-align: -1px; }
        .ms-grid-wrap { overflow-x: auto; border: 1px solid #e3e8e5; border-radius: 12px; background: #fff; }
        .ms-grid { border-collapse: separate; border-spacing: 0; width: 100%; min-width: 720px; }
        .ms-grid th { background: #f7f9f8; font-size: 12.5px; font-weight: 700; color: #122019; padding: 10px 6px; border-bottom: 1px solid #e3e8e5; text-align: center; }
        .ms-grid th.today { background: #1a6b3a; color: #fff; }
        .ms-grid td { padding: 3px; border-bottom: 1px solid #f1f5f3; }
        .ms-grid td.t { font-size: 12px; font-weight: 700; color: #64748b; white-space: nowrap; padding: 0 10px; width: 80px; }
        .ms-c { height: 38px; border-radius: 8px; font-size: 11.5px; font-weight: 700; display: flex; align-items: center; justify-content: center; padding: 0 6px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
        .ms-c.free { background: #f0fdf4; color: #16a34a; border: 1px dashed #86efac; }
        .ms-c.booked { background: #1a6b3a; color: #fff; cursor: pointer; }
        .ms-c.past { background: #f8fafc; color: #cbd5e1; }
        .ms-c.off { background: repeating-linear-gradient(45deg, #fafafa, #fafafa 6px, #f3f4f6 6px, #f3f4f6 12px); }
        .ms-panel { background: #fff; border: 1px solid #e3e8e5; border-radius: 12px; padding: 18px; }
        .ms-panel h3 { font-size: 16px; font-weight: 700; color: #122019; margin: 0 0 4px; }
        .ms-panel p.ms-sub { margin: 0 0 14px; }
        .ms-setup { background: #fffbeb; border: 1px solid #fde68a; color: #78350f; border-radius: 12px; padding: 12px 14px; font-size: 13.5px; margin-bottom: 14px; }
        .ms-setup button { background: none; border: none; color: #92400e; font-weight: 800; text-decoration: underline; cursor: pointer; padding: 0; font-family: inherit; font-size: 13.5px; }
        .ms-detail { position: fixed; inset: 0; z-index: 1300; background: rgba(15,23,20,.4); display: flex; justify-content: flex-end; }
        .ms-detail-in { background: #fff; width: 100%; max-width: 420px; height: 100%; overflow-y: auto; padding: 22px; box-shadow: -12px 0 40px rgba(15,61,34,.2); animation: msIn .2s ease; }
        @keyframes msIn { from { transform: translateX(30px); opacity: 0; } to { transform: none; opacity: 1; } }
        .ms-detail h4 { font-size: 20px; font-weight: 800; color: #122019; margin: 0 0 6px; }
        .ms-kv { display: grid; grid-template-columns: 100px 1fr; gap: 10px 12px; font-size: 14px; margin: 18px 0 22px; }
        .ms-kv span { color: #8a978f; font-weight: 600; }
        .ms-actions { display: flex; gap: 8px; }
        .ms-actions a, .ms-actions button { flex: 1; text-align: center; padding: 12px; border-radius: 10px; font-weight: 700; font-size: 14px; text-decoration: none; cursor: pointer; font-family: inherit; }
        .ms-actions a { background: #1a6b3a; color: #fff !important; border: none; }
        .ms-actions button { background: #fff; border: 1px solid #e3e8e5; color: #334155; }
        @media (max-width: 640px) {
          .ms-right { margin-left: 0; width: 100%; }
          .ms-cards { grid-template-columns: 1fr 1fr; gap: 8px; }
          .ms-card-s { padding: 12px; min-height: 0; }
          .ms-card-s b { font-size: 20px; margin-top: 4px; }
          .ms-group-link { display: none; }
          .ms-right .ms-btn { flex: 1; justify-content: center; }
          .ms-counts { margin-left: 0; }
          .ms-amt { display: none; }
          .ms-detail { align-items: flex-end; }
          .ms-detail-in { height: auto; max-height: 85vh; border-radius: 18px 18px 0 0; max-width: none; }
        }
      ` }} />

      <div className="ms-page">
        <h1 className="ms-title"><i className="feather-calendar" /> My Schedule</h1>
        <p className="ms-sub">Your bookings, today&rsquo;s sessions, weekly hours and fees.</p>

        <div className="ms-groups" role="tablist" aria-label="My Schedule sections">
          {GROUPS.map((g) => (
            <button key={g.id} type="button" role="tab" aria-selected={g.id === group.id} className={`ms-group ${g.id === group.id ? "on" : ""}`} onClick={() => go(g.views[0][0])}>
              <i className={g.icon} /> {g.label}
              {g.id === "setup" && therapistInfo?.user?.email && (!hasHours || !hasFees) && <span className="dot" title="Needs setup" />}
            </button>
          ))}
          <Link href="/appointments" className="ms-group-link"><i className="feather-play-circle" /> Start a session <i className="feather-external-link" style={{ fontSize: 12 }} /></Link>
        </div>

        <div className="ms-subs" role="tablist" aria-label={group.label}>
          {group.views.map(([id, label]) => (
            <button key={id} type="button" role="tab" aria-selected={view === id} className={`ms-sub-tab ${view === id ? "on" : ""}`} onClick={() => go(id)}>{label}</button>
          ))}
        </div>

        {group.id === "appts" && therapistInfo?.user?.email && !hasHours && (
          <div className="ms-setup">
            You haven&rsquo;t set your weekly hours yet, so clients can&rsquo;t book you.{" "}
            <button type="button" onClick={() => go("availability")}>Set your availability →</button>
          </div>
        )}

        {/* ── All bookings ── */}
        {view === "bookings" && (
          <>
            <div className="ms-cards">
              <div className="ms-card-s"><small>Today</small><b>{todayCount}</b><span>sessions</span></div>
              <div className="ms-card-s"><small>Next 7 days</small><b>{next7}</b><span>appointments</span></div>
              <div className="ms-card-s"><small>Completed</small><b>{doneMonth}</b><span>this month</span></div>
              <div className="ms-card-s"><small>Last 7 days</small><b>{inr(earned7)}</b><span>earned</span></div>
            </div>

            <div className="ms-bar">
              <label className="ms-search">
                <i className="feather-search" aria-hidden="true" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search client name, phone or service" aria-label="Search bookings" />
              </label>
              <div className="ms-seg" role="radiogroup" aria-label="Which bookings">
                {[["upcoming", "Upcoming"], ["past", "Past"], ["all", "All"]].map(([id, l]) => (
                  <button key={id} type="button" role="radio" aria-checked={when === id} className={when === id ? "on" : ""} onClick={() => setWhen(id)}>{l}</button>
                ))}
              </div>
              <div className="ms-right">
                <button type="button" className={`ms-btn ${showCancelled ? "on" : ""}`} onClick={() => setShowCancelled((v) => !v)}>
                  <i className="feather-x-circle" /> {showCancelled ? "Hide cancelled" : "Show cancelled"}
                </button>
                <button type="button" className="ms-btn" onClick={exportCsv} disabled={!listed.length}><i className="feather-download" /> Export CSV</button>
              </div>
            </div>

            {loading ? <div className="ms-empty">Loading…</div> : grouped.length === 0 ? (
              <div className="ms-empty">
                <i className="feather-calendar" />
                <b>{q ? "No bookings match your search" : when === "upcoming" ? "No upcoming appointments" : "No bookings yet"}</b>
                New bookings from your profile will show up here.
                {when === "upcoming" && !q && <div><button type="button" className="ms-btn" onClick={() => setWhen("past")}>See past appointments</button></div>}
              </div>
            ) : grouped.map((g) => (
              <div key={g.k}>
                <div className="ms-grp-title">{dayTitle(g.date, now)} · {g.items.length} session{g.items.length === 1 ? "" : "s"}</div>
                <div className="ms-list">{g.items.map((b) => <Row key={b._id} b={b} />)}</div>
              </div>
            ))}
          </>
        )}

        {/* ── Today (any day) ── */}
        {view === "today" && (
          <>
            <div className="ms-daybar">
              <div className="ms-nav">
                <button type="button" aria-label="Previous day" onClick={() => setDay((d) => addDays(d, -1))}><i className="feather-chevron-left" /></button>
                <button type="button" onClick={() => setDay(startOfDay(new Date()))}>Today</button>
                <button type="button" aria-label="Next day" onClick={() => setDay((d) => addDays(d, 1))}><i className="feather-chevron-right" /></button>
              </div>
              <span className="ms-daylabel">{DAYS[day.getDay()]}, {day.getDate()} {MONS[day.getMonth()]} {day.getFullYear()}</span>
              <div className="ms-counts">
                {Object.entries(STATUS).map(([s, meta]) => (
                  <span key={s} className="ms-count"><b style={{ color: meta[1] }}>{dayCounts[s] || 0}</b>{meta[0].toLowerCase()}</span>
                ))}
              </div>
            </div>
            {dayList.length === 0 ? (
              <div className="ms-empty" style={{ padding: "30px 10px" }}>No appointments on this day.</div>
            ) : <div className="ms-list">{dayList.map((b) => <Row key={b._id} b={b} />)}</div>}
            <div className="ms-box">
              <h3>Free slots {sameDay(day, now) ? "left today" : "this day"}</h3>
              {dayFree.length ? <div className="ms-free">{dayFree.map((m) => <span key={m}>{timeLabel(m)}</span>)}</div>
                : <span style={{ fontSize: 13.5, color: "#8a978f" }}>{slotsFor(avail, day).length ? "Fully booked." : "You're not working this day."}</span>}
            </div>
          </>
        )}

        {/* ── Week ── */}
        {view === "week" && (
          <>
            <div className="ms-daybar">
              <div className="ms-nav">
                <button type="button" aria-label="Previous week" onClick={() => setWeekStart((d) => addDays(d, -7))}><i className="feather-chevron-left" /></button>
                <button type="button" onClick={() => setWeekStart(startOfDay(new Date()))}>This week</button>
                <button type="button" aria-label="Next week" onClick={() => setWeekStart((d) => addDays(d, 7))}><i className="feather-chevron-right" /></button>
              </div>
              <span className="ms-daylabel">{days[0].getDate()} {MONS[days[0].getMonth()]} – {days[6].getDate()} {MONS[days[6].getMonth()]}</span>
              <div className="ms-legend">
                <span><i style={{ background: "#1a6b3a" }} />Booked</span>
                <span><i style={{ background: "#f0fdf4", border: "1px dashed #86efac" }} />Free</span>
                <span><i style={{ background: "#f3f4f6" }} />Not working</span>
              </div>
            </div>
            {rows.length === 0 ? (
              <div className="ms-empty">
                <i className="feather-clock" /><b>No hours set for these days</b>
                <div><button type="button" className="ms-btn" onClick={() => go("availability")}>Set availability</button></div>
              </div>
            ) : (
              <div className="ms-grid-wrap">
                <table className="ms-grid">
                  <thead>
                    <tr>
                      <th />
                      {days.map((d) => <th key={d.toISOString()} className={sameDay(d, now) ? "today" : ""}>{SDAYS[d.getDay()]} {d.getDate()}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((m) => (
                      <tr key={m}>
                        <td className="t">{timeLabel(m)}</td>
                        {days.map((d) => {
                          const c = cell(d, m);
                          return (
                            <td key={d.toISOString()}>
                              {c.kind === "booked" ? (
                                <div className="ms-c booked" role="button" tabIndex={0} title={clientName(c.b)}
                                  onClick={() => setPicked(c.b)} onKeyDown={(e) => e.key === "Enter" && setPicked(c.b)}>
                                  {clientName(c.b).split(" ")[0]}
                                </div>
                              ) : <div className={`ms-c ${c.kind}`}>{c.kind === "free" ? "Free" : ""}</div>}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ── Setup ── */}
        {view === "availability" && (
          <div className="ms-panel">
            <h3>Weekly hours</h3>
            <p className="ms-sub">Tap (or drag across) the hours you&rsquo;re available — each box is a 60-minute session clients can book. Tap a day or a time to select the whole column / row.</p>
            <AvailabilityGrid onSuccess={fetchTherapistInfo} />
          </div>
        )}
        {view === "fees" && (
          <div className="ms-panel">
            <h3>Session fees</h3>
            <TherapistFees onSuccess={fetchTherapistInfo} />
          </div>
        )}
      </div>

      {picked && (
        <div className="ms-detail" onClick={(e) => e.target === e.currentTarget && setPicked(null)} role="dialog" aria-modal="true" aria-label="Session details">
          <div className="ms-detail-in">
            <h4>{clientName(picked)}</h4>
            <Chip meta={statusMeta(picked.status)} />
            <div className="ms-kv">
              <span>When</span><b>{fmtWhen(new Date(picked.booking_date))}</b>
              {picked.service && <><span>Service</span><b>{picked.service}</b></>}
              {picked.format && <><span>Format</span><b>{picked.format}</b></>}
              {money(picked) > 0 && <><span>Amount</span><b>{inr(money(picked))}</b></>}
              {picked.client?.phone && <><span>Phone</span><a href={`tel:${picked.client.phone}`}>{picked.client.phone}</a></>}
              {picked.client?.email && <><span>Email</span><a href={`mailto:${picked.client.email}`} style={{ wordBreak: "break-all" }}>{picked.client.email}</a></>}
              {picked.notes && <><span>Notes</span><span style={{ color: "#334155", fontWeight: 500 }}>{picked.notes}</span></>}
            </div>
            <div className="ms-actions">
              <Link href="/appointments">Open in Appointments</Link>
              <button type="button" onClick={() => setPicked(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
