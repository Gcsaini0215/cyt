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
import { earningOf } from "../utils/earning";

/* My Schedule — four plain tabs (Bookings · Calendar · Hours · Fees) under a setup strip that
   shows your hours and fee range with one-tap Edit. Old links (?tab=today / week / availability /
   fees) still land in the right place. */

const TABS = [
  ["bookings", "Bookings", "feather-list"],
  ["week", "Calendar", "feather-grid"],
  ["availability", "Hours", "feather-clock"],
  ["fees", "Fees", "feather-tag"],
];
const VIEW_IDS = [...TABS.map(([id]) => id), "today"];
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
const money = (b) => earningOf(b); // your share of the session (70% to start, more with achievements)

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
// the CYT team moved this session to you from another therapist (admin → Client 360 → Replace therapist)
const assignedOf = (b) => (b.reassignments?.length ? b.reassignments[b.reassignments.length - 1] : null);
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
  const [when, setWhen] = useState("upcoming"); // today | upcoming | past | all
  const [q, setQ] = useState("");
  const [showCancelled, setShowCancelled] = useState(false);
  const [menu, setMenu] = useState(false); // "More": show cancelled · export CSV
  // Today's free slots + Week
  const day = useMemo(() => startOfDay(new Date()), []);
  const [weekStart, setWeekStart] = useState(() => startOfDay(new Date()));

  useEffect(() => {
    if (!router.isReady) return;
    const t = String(router.query.tab || "");
    if (t === "today") { setView("bookings"); setWhen("today"); return; }
    if (VIEW_IDS.includes(t)) setView(t);
  }, [router.isReady, router.query.tab]);
  const go = (id) => {
    setView(id);
    router.replace({ pathname: router.pathname, query: id === "bookings" ? {} : { tab: id } }, undefined, { shallow: true });
  };

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
    window.addEventListener("cyt:therapist-bookings", loadBookings); // live: added / changed / removed bookings
    return () => { clearInterval(iv); window.removeEventListener("cyt:therapist-bookings", loadBookings); };
  }, [loadBookings]);

  const avail = useMemo(() => therapistInfo?.availabilities || [], [therapistInfo?.availabilities]);
  const hasHours = avail.some((a) => a.times?.length);
  const hasFees = (therapistInfo?.fees || []).some((f) => f?.formats?.some((x) => x?.fee));
  // setup strip: "Mon–Sat · 11:00 AM–8:00 PM" and the fee range
  const hoursText = useMemo(() => {
    const on = DAYS.map((d, i) => ({ i, a: avail.find((x) => x.day === d) })).filter((x) => x.a?.times?.length);
    if (!on.length) return "";
    const idx = on.map((x) => x.i);
    const run = idx.every((v, k) => k === 0 || v === idx[k - 1] + 1);
    const daysTxt = idx.length === 7 ? "Every day" : run && idx.length > 2 ? `${SDAYS[idx[0]]}–${SDAYS[idx[idx.length - 1]]}` : idx.map((i) => SDAYS[i]).join(", ");
    const opens = on.flatMap((x) => x.a.times.map((t) => toMinutes(t.open))).filter((v) => v != null);
    const closes = on.flatMap((x) => x.a.times.map((t) => toMinutes(t.close))).filter((v) => v != null);
    return opens.length && closes.length ? `${daysTxt} · ${timeLabel(Math.min(...opens))}–${timeLabel(Math.max(...closes))}` : daysTxt;
  }, [avail]);
  const feeText = useMemo(() => {
    const v = (therapistInfo?.fees || []).flatMap((f) => (f.formats || []).map((x) => Number(x?.fee)).filter((n) => n > 0));
    if (!v.length) return "";
    const lo = Math.min(...v), hi = Math.max(...v);
    return lo === hi ? inr(lo) : `${inr(lo)} – ${inr(hi)}`;
  }, [therapistInfo?.fees]);
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
      .filter((b) => when === "all" ? true : when === "today" ? sameDay(b.at, now) : when === "upcoming" ? b.at >= startOfDay(now) : b.at < startOfDay(now))
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

  /* ── today's free slots (Bookings → Today) ── */
  const dayList = useMemo(() => all.filter((b) => sameDay(b.at, day)).sort((a, b) => a.at - b.at), [all, day]);
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
      <span className="ms-who"><b>{clientName(b)}</b><span>{[b.service, b.format, assignedOf(b) && "Assigned by CYT"].filter(Boolean).join(" · ")}</span></span>
      {money(b) > 0 && <span className="ms-amt">{inr(money(b))}</span>}
      <Chip meta={statusMeta(b.status)} />
      <i className="feather-chevron-right ms-chev" aria-hidden="true" />
    </button>
  );

  return (
    <MainLayout>
      <style dangerouslySetInnerHTML={{ __html: `
        /* My Schedule, Apple look (2026-11-18): large title, iOS segmented tabs, app-icon tiles, grouped lists */
        .ms-page { font-family: inherit; color: #1c1c1e; max-width: 1240px; margin: 0 auto; }
        .ms-title { font-size: clamp(26px, 2.6vw, 32px); font-weight: 800; letter-spacing: -.03em; color: #1c1c1e; margin: 0; }
        .ms-sub { font-size: 14.5px; color: #6e6e73; margin: 4px 0 18px; }
        /* hours + fees: two iOS rows with app tiles */
        .ms-setup-strip { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-bottom: 16px; }
        .ms-sum { display: flex; align-items: center; gap: 12px; text-align: left; background: #fff; border: 0; border-radius: 18px; padding: 12px 14px; cursor: pointer; font-family: inherit; min-width: 0;
          box-shadow: 0 1px 2px rgba(0,0,0,.04), 0 10px 26px -18px rgba(15,23,42,.28); transition: transform .15s ease; }
        .ms-sum:hover { transform: translateY(-1px); }
        .ms-sum > i { width: 36px; height: 36px; border-radius: 11px; color: #fff; display: grid; place-items: center; font-size: 17px; flex-shrink: 0; background: linear-gradient(160deg, #5ab0ff, #1d63d8); box-shadow: 0 6px 12px -7px #1d63d8; }
        .ms-sum + .ms-sum > i { background: linear-gradient(160deg, #4fd38b, #12804a); box-shadow: 0 6px 12px -7px #12804a; }
        .ms-sum > span { flex: 1; min-width: 0; }
        .ms-sum small { display: block; font-size: 12.5px; font-weight: 600; color: #8e8e93; }
        .ms-sum b { display: block; font-size: 15px; font-weight: 600; color: #1c1c1e; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .ms-sum em { font-style: normal; font-size: 12.5px; font-weight: 700; color: #14532d; background: #e3f4e9; border-radius: 999px; padding: 4px 11px; flex-shrink: 0; }
        .ms-sum.todo > i { background: linear-gradient(160deg, #ffc65a, #f07b12); box-shadow: 0 6px 12px -7px #f07b12; }
        .ms-sum.todo em { color: #b45309; background: #fff1e0; }
        /* tabs: iOS segmented control */
        .ms-tabs { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; }
        .ms-segtabs { display: inline-flex; flex: 0 1 560px; background: #e5e7e6; border-radius: 12px; padding: 3px; gap: 2px; min-width: 0; }
        .ms-tab { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 7px; height: 36px; padding: 0 12px; border-radius: 10px; border: 0; background: none;
          font-size: 14px; font-weight: 600; color: #3c3c43; cursor: pointer; white-space: nowrap; font-family: inherit; position: relative; transition: background .15s ease; }
        .ms-tab i { font-size: 15px; color: #8e8e93; }
        .ms-tab.on { background: #fff; color: #1c1c1e; box-shadow: 0 1px 3px rgba(0,0,0,.12), 0 1px 1px rgba(0,0,0,.04); }
        .ms-tab.on i { color: #1e8a4f; }
        .ms-tab .dot { width: 7px; height: 7px; border-radius: 50%; background: #ff9f0a; }
        .ms-tab:focus-visible { outline: 2px solid #1e8a4f; outline-offset: 2px; }
        .ms-group-link { margin-left: auto; display: inline-flex; align-items: center; gap: 6px; height: 36px; padding: 0 14px; border-radius: 999px; background: #e3f4e9; color: #14532d; font-size: 13.5px; font-weight: 700; text-decoration: none; white-space: nowrap; }
        .ms-group-link:hover { background: #d2ecdb; color: #14532d; }
        /* numbers: white cards with app tiles */
        .ms-cards { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 16px; }
        .ms-card-s { position: relative; display: grid; grid-template-columns: auto 1fr; grid-template-areas: "ic lab" "num num" "sub sub"; align-items: center; column-gap: 10px; row-gap: 2px;
          background: #fff; border: 0; border-radius: 18px; padding: 14px 16px; box-shadow: 0 1px 2px rgba(0,0,0,.04), 0 10px 26px -18px rgba(15,23,42,.28); min-width: 0; }
        .ms-card-s > i { grid-area: ic; width: 30px; height: 30px; border-radius: 9px; display: grid; place-items: center; color: #fff; font-size: 15px; }
        .ms-card-s.c1 > i { background: linear-gradient(160deg, #5ab0ff, #1d63d8); } .ms-card-s.c2 > i { background: linear-gradient(160deg, #ffc65a, #f07b12); }
        .ms-card-s.c3 > i { background: linear-gradient(160deg, #4fd38b, #12804a); } .ms-card-s.c4 > i { background: linear-gradient(160deg, #c58cff, #8a3fd6); }
        .ms-card-s small { grid-area: lab; font-size: 13.5px; font-weight: 600; color: #1c1c1e; }
        .ms-card-s b { grid-area: num; font-size: clamp(22px, 2.2vw, 28px); font-weight: 800; letter-spacing: -.03em; color: #1c1c1e; margin-top: 6px; }
        .ms-card-s span { grid-area: sub; font-size: 12.5px; color: #8e8e93; }
        /* toolbar: search, when, and a More menu */
        .ms-bar { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 14px; }
        .ms-search { flex: 1 1 260px; max-width: 380px; position: relative; margin: 0; }
        .ms-search i { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #8e8e93; }
        .ms-search input { width: 100%; height: 40px; border: 0 !important; border-radius: 999px; padding: 0 14px 0 38px; font-size: 14px; background: #fff; outline: none; box-sizing: border-box; font-family: inherit; box-shadow: 0 1px 2px rgba(0,0,0,.06) !important; }
        .ms-search input:focus { box-shadow: 0 0 0 3px rgba(30,138,79,.18) !important; }
        .ms-seg { display: inline-flex; background: #e5e7e6; border-radius: 10px; padding: 3px; gap: 2px; }
        .ms-seg button { border: none; background: none; padding: 7px 14px; border-radius: 8px; font-size: 13.5px; font-weight: 600; color: #3c3c43; cursor: pointer; font-family: inherit; }
        .ms-seg button.on { background: #fff; color: #1c1c1e; box-shadow: 0 1px 3px rgba(0,0,0,.12); }
        .ms-btn { display: inline-flex; align-items: center; gap: 7px; border: 0; background: #fff; border-radius: 999px; padding: 0 14px; height: 40px; font-size: 13.5px; font-weight: 600; color: #1c1c1e; cursor: pointer; font-family: inherit; box-shadow: 0 1px 2px rgba(0,0,0,.06); }
        .ms-btn:hover { background: #f6f7f7; }
        .ms-btn.on { color: #14532d; background: #e3f4e9; }
        .ms-right { margin-left: auto; position: relative; display: flex; gap: 8px; }
        .ms-menu-bg { position: fixed; inset: 0; z-index: 40; }
        .ms-menu { position: absolute; right: 0; top: calc(100% + 6px); z-index: 41; min-width: 210px; background: rgba(255,255,255,.96); -webkit-backdrop-filter: blur(16px); backdrop-filter: blur(16px);
          border-radius: 14px; padding: 6px; box-shadow: 0 18px 44px -12px rgba(15,23,42,.35), 0 0 0 1px rgba(60,60,67,.1); animation: msMenu .14s ease; }
        @keyframes msMenu { from { opacity: 0; transform: translateY(-4px) scale(.98); } to { opacity: 1; transform: none; } }
        .ms-menu button { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 12px; border: 0; background: none; border-radius: 10px; font: inherit; font-size: 14px; font-weight: 600; color: #1c1c1e; cursor: pointer; text-align: left; }
        .ms-menu button + button { box-shadow: inset 0 1px 0 rgba(60,60,67,.1); border-radius: 0 0 10px 10px; }
        .ms-menu button:hover { background: #f2f4f3; }
        .ms-menu button:disabled { opacity: .45; cursor: default; }
        .ms-menu i { color: #1e8a4f; font-size: 16px; }
        /* day groups: an iOS inset list per day */
        .ms-grp-title { font-size: 15px; font-weight: 700; letter-spacing: -.01em; color: #1c1c1e; margin: 18px 4px 8px; }
        .ms-list { display: flex; flex-direction: column; gap: 0; background: #fff; border-radius: 18px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,.04), 0 10px 26px -18px rgba(15,23,42,.28); }
        .ms-row { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border: 0; border-radius: 0; cursor: pointer; background: #fff; text-align: left; font-family: inherit; width: 100%; transition: background .12s ease; }
        .ms-row + .ms-row { box-shadow: inset 0 1px 0 rgba(60,60,67,.1); }
        .ms-row:hover { background: #f6faf7; }
        .ms-time { flex-shrink: 0; min-width: 76px; text-align: center; font-weight: 700; color: #14532d; font-size: 13px; background: #e9f5ee; border-radius: 10px; padding: 7px 8px; }
        .ms-who { flex: 1; min-width: 0; }
        .ms-who b { display: block; font-size: 15px; font-weight: 600; color: #1c1c1e; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .ms-who span { font-size: 12.5px; color: #8e8e93; }
        .ms-amt { font-size: 14px; font-weight: 700; color: #1c1c1e; }
        .ms-chip { font-size: 11.5px; font-weight: 700; padding: 3px 10px; border-radius: 999px; white-space: nowrap; }
        .ms-chev { color: #c7c7cc; font-size: 17px; flex-shrink: 0; }
        .ms-empty { text-align: center; padding: 44px 16px; color: #8e8e93; font-size: 13.5px; background: #fff; border-radius: 18px; box-shadow: 0 1px 2px rgba(0,0,0,.04); }
        .ms-empty i { display: block; font-size: 30px; color: #c7c7cc; margin-bottom: 10px; }
        .ms-empty b { display: block; color: #1c1c1e; font-size: 16px; margin-bottom: 4px; }
        .ms-empty button, .ms-empty a { margin-top: 12px; }
        /* calendar */
        .ms-daybar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 14px; }
        .ms-nav { display: inline-flex; background: #e5e7e6; border-radius: 10px; padding: 3px; gap: 2px; }
        .ms-nav button { border: none; background: none; padding: 0 12px; height: 32px; border-radius: 8px; font-size: 13.5px; font-weight: 600; color: #1c1c1e; cursor: pointer; font-family: inherit; }
        .ms-nav button:hover { background: #fff; }
        .ms-daylabel { font-size: 17px; font-weight: 700; letter-spacing: -.01em; color: #1c1c1e; }
        .ms-free { display: flex; flex-wrap: wrap; gap: 6px; }
        .ms-free span { font-size: 12.5px; font-weight: 700; color: #14532d; background: #e9f5ee; padding: 6px 11px; border-radius: 999px; }
        .ms-box { background: #fff; border: 0; border-radius: 18px; padding: 14px 16px; margin-top: 14px; box-shadow: 0 1px 2px rgba(0,0,0,.04), 0 10px 26px -18px rgba(15,23,42,.28); }
        .ms-box h3 { font-size: 15px; font-weight: 700; letter-spacing: -.01em; text-transform: none; color: #1c1c1e; margin: 0 0 10px; }
        .ms-legend { display: flex; gap: 12px; flex-wrap: wrap; font-size: 12.5px; color: #6e6e73; margin-left: auto; }
        .ms-legend i { display: inline-block; width: 11px; height: 11px; border-radius: 4px; margin-right: 5px; vertical-align: -1px; }
        .ms-grid-wrap { overflow-x: auto; border: 0; border-radius: 18px; background: #fff; box-shadow: 0 1px 2px rgba(0,0,0,.04), 0 10px 26px -18px rgba(15,23,42,.28); }
        .ms-grid { border-collapse: separate; border-spacing: 0; width: 100%; min-width: 720px; }
        .ms-grid th { background: #fff; font-size: 12.5px; font-weight: 700; color: #6e6e73; padding: 12px 6px; border-bottom: 1px solid rgba(60,60,67,.1); text-align: center; }
        .ms-grid th.today { background: #fff; color: #1e8a4f; box-shadow: inset 0 -2px 0 #1e8a4f; }
        .ms-grid td { padding: 3px; border-bottom: 0; }
        .ms-grid td.t { font-size: 12px; font-weight: 600; color: #8e8e93; white-space: nowrap; padding: 0 10px; width: 80px; }
        .ms-c { height: 38px; border-radius: 10px; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; padding: 0 6px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
        .ms-c.free { background: #eef8f2; color: #1e8a4f; border: 0; }
        .ms-c.booked { background: linear-gradient(180deg, #2fb36a, #1e8a4f); color: #fff; cursor: pointer; box-shadow: 0 6px 12px -8px rgba(23,118,63,.8); }
        .ms-c.past { background: #fafafa; color: #d1d1d6; }
        .ms-c.off { background: #f4f5f5; }
        /* hours + fees panels */
        .ms-panel { background: #fff; border: 0; border-radius: 20px; padding: 18px 20px; box-shadow: 0 1px 2px rgba(0,0,0,.04), 0 10px 26px -18px rgba(15,23,42,.28); }
        .ms-panel h3 { font-size: 20px; font-weight: 800; letter-spacing: -.02em; color: #1c1c1e; margin: 0 0 4px; }
        .ms-panel p.ms-sub { margin: 0 0 14px; }
        .ms-setup { background: #fff1e0; border: 0; color: #7c3d06; border-radius: 14px; padding: 12px 14px; font-size: 13.5px; margin-bottom: 14px; }
        .ms-setup button { background: none; border: none; color: #b45309; font-weight: 800; text-decoration: underline; cursor: pointer; padding: 0; font-family: inherit; font-size: 13.5px; }
        /* session sheet */
        .ms-detail { position: fixed; inset: 0; z-index: 1300; background: rgba(0,0,0,.32); display: flex; justify-content: flex-end; }
        .ms-detail-in { background: #f2f4f3; width: 100%; max-width: 420px; height: 100%; overflow-y: auto; padding: 22px 18px; box-shadow: -12px 0 40px rgba(0,0,0,.18); animation: msIn .22s cubic-bezier(.2,.9,.3,1); }
        @keyframes msIn { from { transform: translateX(30px); opacity: 0; } to { transform: none; opacity: 1; } }
        .ms-detail h4 { font-size: 22px; font-weight: 800; letter-spacing: -.02em; color: #1c1c1e; margin: 0 0 8px; }
        .ms-kv { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 0; font-size: 14px; margin: 16px 0 18px; background: #fff; border-radius: 16px; overflow: hidden; }
        .ms-kv > * { padding: 11px 14px; box-shadow: inset 0 -1px 0 rgba(60,60,67,.08); }
        .ms-kv > span { color: #8e8e93; font-weight: 500; }
        .ms-kv > b, .ms-kv > a { text-align: right; font-weight: 600; color: #1c1c1e; word-break: break-word; }
        .ms-actions { display: flex; gap: 8px; }
        .ms-actions a, .ms-actions button { flex: 1; text-align: center; padding: 12px; border-radius: 13px; font-weight: 700; font-size: 14.5px; text-decoration: none; cursor: pointer; font-family: inherit; }
        .ms-actions a { background: linear-gradient(180deg, #2fb36a, #1e8a4f 55%, #17763f); color: #fff !important; border: none; }
        .ms-actions button { background: #fff; border: 0; color: #1c1c1e; }
        @media (prefers-reduced-motion: reduce) { .ms-sum, .ms-row, .ms-tab { transition: none; } .ms-menu, .ms-detail-in { animation: none; } }
        @media (max-width: 1023px) { .ms-cards { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 767px) {
          .ms-title { display: none; } /* the app bar already says My Schedule */
          .ms-sub { margin: 0 0 12px; font-size: 13.5px; }
          .ms-setup-strip { grid-template-columns: 1fr; gap: 8px; margin-bottom: 12px; }
          .ms-tabs { margin-bottom: 14px; }
          .ms-segtabs { flex: 1 1 100%; }
          .ms-tab { flex-direction: column; gap: 2px; height: 50px; padding: 0 2px; font-size: 12px; }
          .ms-tab .dot { position: absolute; top: 6px; right: 10px; }
          .ms-group-link { display: none; }
          /* the four numbers: one short row you can swipe, instead of a tall 2 x 2 block */
          .ms-cards { display: flex; gap: 8px; margin: 0 -12px 12px; padding: 2px 12px 6px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; }
          .ms-cards::-webkit-scrollbar { display: none; }
          .ms-card-s { flex: 0 0 136px; scroll-snap-align: start; padding: 10px 12px; }
          .ms-card-s > i { width: 26px; height: 26px; font-size: 13px; border-radius: 8px; }
          .ms-card-s small { font-size: 12.5px; }
          .ms-card-s b { font-size: 20px; margin-top: 2px; }
          .ms-card-s span { font-size: 11.5px; }
          .ms-bar { gap: 8px; }
          .ms-search { flex: 1 1 100%; max-width: none; }
          .ms-search input { font-size: 16px; }
          .ms-seg { flex: 1; } .ms-seg button { flex: 1; padding: 7px 4px; font-size: 13px; }
          .ms-right { margin-left: 0; }
          .ms-more span { display: none; } .ms-more { width: 40px; justify-content: center; padding: 0; }
          .ms-amt { display: none; }
          .ms-time { min-width: 66px; font-size: 12.5px; }
          .ms-legend { margin-left: 0; }
          .ms-detail { align-items: flex-end; }
          .ms-detail-in { height: auto; max-height: 86vh; border-radius: 20px 20px 0 0; max-width: none; }
        }
      ` }} />

      <div className="ms-page">
        <h1 className="ms-title">My Schedule</h1>
        <p className="ms-sub">Your bookings, today&rsquo;s sessions, weekly hours and fees.</p>

        <div className="ms-setup-strip">
          <button type="button" className={`ms-sum ${hoursText ? "" : "todo"}`} onClick={() => go("availability")}>
            <i className="feather-clock" />
            <span><small>Weekly hours</small><b>{hoursText || "Not set — clients can't book you"}</b></span>
            <em>{hoursText ? "Edit" : "Set now"}</em>
          </button>
          <button type="button" className={`ms-sum ${feeText ? "" : "todo"}`} onClick={() => go("fees")}>
            <i className="feather-tag" />
            <span><small>Session fees</small><b>{feeText || "Not set yet"}</b></span>
            <em>{feeText ? "Edit" : "Set now"}</em>
          </button>
        </div>

        <div className="ms-tabs">
          <div className="ms-segtabs" role="tablist" aria-label="My Schedule">
          {TABS.map(([id, label, icon]) => (
            <button key={id} type="button" role="tab" aria-selected={view === id} className={`ms-tab ${view === id ? "on" : ""}`} onClick={() => go(id)}>
              <i className={icon} /> {label}
              {((id === "availability" && !hasHours) || (id === "fees" && !hasFees)) && therapistInfo?.user?.email && <span className="dot" title="Needs setup" />}
            </button>
          ))}
          </div>
          <Link href="/appointments" className="ms-group-link"><i className="feather-play-circle" /> Start a session</Link>
        </div>

        {/* ── All bookings ── */}
        {view === "bookings" && (
          <>
            <div className="ms-cards">
              <div className="ms-card-s c1"><i className="feather-sun" aria-hidden="true" /><small>Today</small><b>{todayCount}</b><span>sessions</span></div>
              <div className="ms-card-s c2"><i className="feather-calendar" aria-hidden="true" /><small>Next 7 days</small><b>{next7}</b><span>appointments</span></div>
              <div className="ms-card-s c3"><i className="feather-check-circle" aria-hidden="true" /><small>Completed</small><b>{doneMonth}</b><span>this month</span></div>
              <div className="ms-card-s c4"><i className="feather-trending-up" aria-hidden="true" /><small>Last 7 days</small><b>{inr(earned7)}</b><span>earned</span></div>
            </div>

            <div className="ms-bar">
              <label className="ms-search">
                <i className="feather-search" aria-hidden="true" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search client name, phone or service" aria-label="Search bookings" />
              </label>
              <div className="ms-seg" role="radiogroup" aria-label="Which bookings">
                {[["today", "Today"], ["upcoming", "Upcoming"], ["past", "Past"], ["all", "All"]].map(([id, l]) => (
                  <button key={id} type="button" role="radio" aria-checked={when === id} className={when === id ? "on" : ""} onClick={() => setWhen(id)}>{l}</button>
                ))}
              </div>
              <div className="ms-right">
                <button type="button" className={`ms-btn ms-more${showCancelled ? " on" : ""}`} aria-haspopup="menu" aria-expanded={menu} onClick={() => setMenu((m) => !m)} title="More options">
                  <i className="feather-more-horizontal" /> <span>More</span>
                </button>
                {menu && (
                  <>
                    <div className="ms-menu-bg" onClick={() => setMenu(false)} aria-hidden="true" />
                    <div className="ms-menu" role="menu">
                      <button type="button" role="menuitemcheckbox" aria-checked={showCancelled} onClick={() => { setShowCancelled((v) => !v); setMenu(false); }}>
                        <i className="feather-x-circle" /> {showCancelled ? "Hide cancelled" : "Show cancelled"}
                      </button>
                      <button type="button" role="menuitem" disabled={!listed.length} onClick={() => { exportCsv(); setMenu(false); }}>
                        <i className="feather-download" /> Export CSV
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {when === "today" && (
              <div className="ms-box" style={{ marginTop: 0, marginBottom: 12 }}>
                <h3>Free slots left today</h3>
                {dayFree.length ? <div className="ms-free">{dayFree.map((m) => <span key={m}>{timeLabel(m)}</span>)}</div>
                  : <span style={{ fontSize: 13.5, color: "#8a978f" }}>{slotsFor(avail, now).length ? "Fully booked for today." : "You're not working today."}</span>}
              </div>
            )}
            {loading ? <div className="ms-empty">Loading…</div> : grouped.length === 0 ? (
              <div className="ms-empty">
                <i className="feather-calendar" />
                <b>{q ? "No bookings match your search" : when === "today" ? "No sessions today" : when === "upcoming" ? "No upcoming appointments" : "No bookings yet"}</b>
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
                <span><i style={{ background: "#1e7a4c" }} />Booked</span>
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
            <p className="ms-sub">Switch on what you offer and type the fee — or set one fee for everything at the top. Clients see these on your profile as soon as you save.</p>
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
              {money(picked) > 0 && <><span>You earn</span><b>{inr(money(picked))}</b></>}
              {picked.client?.phone && <><span>Phone</span><a href={`tel:${picked.client.phone}`}>{picked.client.phone}</a></>}
              {picked.client?.email && <><span>Email</span><a href={`mailto:${picked.client.email}`} style={{ wordBreak: "break-all" }}>{picked.client.email}</a></>}
              {picked.notes && <><span>Notes</span><span style={{ color: "#334155", fontWeight: 500 }}>{picked.notes}</span></>}
              {assignedOf(picked) && <><span>How they came</span><span style={{ color: "#4b3a12", fontWeight: 500 }}>Moved to you by the CYT team{assignedOf(picked).fromName ? ` (booked with ${assignedOf(picked).fromName})` : ""}{assignedOf(picked).reason ? ` — ${assignedOf(picked).reason}` : ""}</span></>}
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
