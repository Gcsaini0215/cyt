import React, { useState, useEffect, useCallback, useRef } from "react";
import Head from "next/head";
import Script from "next/script";
import { apiUrl } from "../utils/url";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ScheduleRounded from "@mui/icons-material/ScheduleRounded";
import CurrencyRupeeRounded from "@mui/icons-material/CurrencyRupeeRounded";
import PlaceRounded from "@mui/icons-material/PlaceRounded";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import CalendarMonthRounded from "@mui/icons-material/CalendarMonthRounded";
import WarningAmberRounded from "@mui/icons-material/WarningAmberRounded";
import ConfirmationNumberRounded from "@mui/icons-material/ConfirmationNumberRounded";
import WavingHandRounded from "@mui/icons-material/WavingHandRounded";
import HourglassTopRounded from "@mui/icons-material/HourglassTopRounded";
import BoltRounded from "@mui/icons-material/BoltRounded";
import CheckRounded from "@mui/icons-material/CheckRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import EventBusyRounded from "@mui/icons-material/EventBusyRounded";
import DirectionsRounded from "@mui/icons-material/DirectionsRounded";
import DownloadRounded from "@mui/icons-material/DownloadRounded";

const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const STEP_LABELS = ["You", "Session", "Payment"];
const MATRIX_DAYS = 10;

function dateLabel(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d, 12);
  return { value: dateStr, weekday: WEEKDAY_SHORT[dt.getDay()], day: dt.getDate(), month: MONTH_SHORT[dt.getMonth()] };
}

function slotStartMinutes(label) {
  const [time, ampm] = label.split(" - ")[0].split(" ");
  let [h, m] = time.split(":").map(Number);
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return h * 60 + m;
}

function priceFieldFor(sessionMode, format) {
  const fmt = format === "home-visit" ? "homevisit" : format === "online" ? "online" : "inperson";
  const mode = sessionMode === "couple" ? "couple" : "individual";
  return `${mode}_${fmt}`;
}

// Slot times are always IST regardless of the viewer's own timezone — build
// the true UTC instant by constructing as if UTC, then undoing the +5:30
// offset, so a live countdown is correct no matter where the browser is.
function slotStartInstant(dateStr, slotLabel) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const startMin = slotStartMinutes(slotLabel);
  const utcMs = Date.UTC(y, m - 1, d, Math.floor(startMin / 60), startMin % 60) - (5 * 60 + 30) * 60000;
  return new Date(utcMs);
}

function mmss(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds || 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// A short confetti burst — used to celebrate a slot getting booked live,
// spotted via the auto-refreshing slots table. No external library: a
// plain canvas overlay that removes itself when the animation ends.
function fireConfetti() {
  if (typeof window === "undefined") return;
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:9999;";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  const colors = ["#1a6b3a", "#f59e0b", "#dc2626", "#3b82f6", "#a855f7", "#16a34a"];
  const particles = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * canvas.height * 0.3,
    w: 5 + Math.random() * 4,
    h: 3 + Math.random() * 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    vx: (Math.random() - 0.5) * 4,
    vy: 2 + Math.random() * 3,
    rotation: Math.random() * 360,
    vr: (Math.random() - 0.5) * 10,
  }));
  const start = Date.now();
  const duration = 2600;
  function tick() {
    const elapsed = Date.now() - start;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05;
      p.rotation += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    if (elapsed < duration) requestAnimationFrame(tick);
    else canvas.remove();
  }
  tick();
}

// True when any cell that was open (or a last-minute request slot) in the
// previous grid is now booked — i.e. someone just took it.
function hasNewlyBooked(prevGrid, nextGrid) {
  if (!prevGrid) return false;
  return Object.keys(nextGrid).some(
    (key) => nextGrid[key] === "taken" && (prevGrid[key] === "open" || prevGrid[key] === "lastMinute")
  );
}

function waitForRazorpay(timeout = 12000) {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.Razorpay) return resolve();
    const t0 = Date.now();
    const iv = setInterval(() => {
      if (typeof window !== "undefined" && window.Razorpay) {
        clearInterval(iv);
        resolve();
      } else if (Date.now() - t0 > timeout) {
        clearInterval(iv);
        reject(new Error("Payment library failed to load. Please check your connection and retry."));
      }
    }, 150);
  });
}

// Fetches an open-days x time-slots matrix for a given booking type in one
// call — the server already limits to future, notice-window-safe slots.
// Shared by the full-page New/Follow-up slot picker and the Reschedule tab.
async function fetchSlotsMatrix(type) {
  const res = await fetch(`${apiUrl}/noida-appointments/slots-matrix?type=${type}`);
  const json = await res.json();
  const all = json?.status ? (json.data || []) : [];
  const dates = Array.from(new Set(all.map(s => s.date))).sort().slice(0, MATRIX_DAYS);
  const dateSet = new Set(dates);
  const times = Array.from(new Set(all.filter(s => dateSet.has(s.date)).map(s => s.slot)))
    .sort((a, b) => slotStartMinutes(a) - slotStartMinutes(b));
  const grid = {};
  all.forEach(s => { if (dateSet.has(s.date)) grid[`${s.date}|${s.slot}`] = s.booked ? "taken" : s.past ? "past" : (s.lastMinute ? "lastMinute" : "open"); });
  return { dates, times, grid };
}

// Reusable date x time availability table — an open cell is a clickable
// button, booked/not-opened cells are inert. A "lastMinute" cell (inside
// the last-minute window) is still clickable but styled distinctly, since
// picking it starts the request-and-wait flow instead of an instant book.
// `disableLastMinute` makes those cells inert too — used for Reschedule,
// which doesn't support the request flow. `selected` (optional
// {date, slot}) highlights the currently-picked cell.
// On a phone there's no room for 10 day-columns, so the table shows 5 days
// at a time with prev/next buttons (`isMobile`) instead of scrolling sideways.
// `header` sits beside the pager on mobile and above the table otherwise.
const MOBILE_PAGE_DAYS = 5;

const WA_NUMBER = "918077757951";
const waLink = (text) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;

// One consistent icon style everywhere instead of emoji, which render
// differently on every phone.
const Ic = ({ I, s = 16 }) => <I aria-hidden="true" style={{ fontSize: s, verticalAlign: "-0.2em", flexShrink: 0 }} />;

// Same shape as the real table, so nothing jumps when the slots arrive.
const CENTER_ADDRESS = "Choose Your Therapist LLP, Gate No-3, D-137, near LPS Global School, Block D, Sector 51, Noida, Uttar Pradesh 201301";
const MAPS_URL = "https://www.google.com/maps/search/?api=1&query=Choose+Your+Therapist+LLP+Sector+51+Noida";

function slotEndInstant(dateStr, slotLabel) {
  const start = slotStartInstant(dateStr, slotLabel);
  const endPart = (slotLabel || "").split(" - ")[1];
  if (!endPart) return new Date(start.getTime() + 60 * 60000);
  const [y, m, d] = dateStr.split("-").map(Number);
  const endMin = slotStartMinutes(endPart);
  return new Date(Date.UTC(y, m - 1, d, Math.floor(endMin / 60), endMin % 60) - (5 * 60 + 30) * 60000);
}

const icsStamp = (dt) => dt.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const icsEscape = (t) => String(t || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

function calendarEvent({ date, slot, online }) {
  const start = slotStartInstant(date, slot);
  const end = slotEndInstant(date, slot);
  const title = "Therapy session - Choose Your Therapist";
  const location = online ? "Online session" : CENTER_ADDRESS;
  const details = online
    ? "Your online session with Choose Your Therapist. The center will share the joining link."
    : "Please arrive 10 minutes early. Need to change the time? Use the Reschedule tab on chooseyourtherapist.in/noida-appointment.";
  const google = "https://calendar.google.com/calendar/render?action=TEMPLATE"
    + "&text=" + encodeURIComponent(title)
    + "&dates=" + icsStamp(start) + "/" + icsStamp(end)
    + "&details=" + encodeURIComponent(details)
    + "&location=" + encodeURIComponent(location);
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Choose Your Therapist//Noida Booking//EN", "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    "UID:" + icsStamp(start) + "-" + Math.random().toString(36).slice(2, 10) + "@chooseyourtherapist.in",
    "DTSTAMP:" + icsStamp(new Date()),
    "DTSTART:" + icsStamp(start),
    "DTEND:" + icsStamp(end),
    "SUMMARY:" + icsEscape(title),
    "LOCATION:" + icsEscape(location),
    "DESCRIPTION:" + icsEscape(details),
    "BEGIN:VALARM", "TRIGGER:-PT60M", "ACTION:DISPLAY", "DESCRIPTION:Therapy session in 1 hour", "END:VALARM",
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  return { google, ics };
}

function downloadIcs(ics) {
  try {
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "therapy-session.ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  } catch { /* ignore — Google Calendar link still works */ }
}

// Animated tick + ticket-style confirmation shared by a fresh booking and a
// reschedule. `format` is "in-person" | "online" | "home-visit" | null (unknown:
// no address / directions shown).
function BookingSuccess({ title, text, dateStr, dateLbl, slot, rows, format, showAddress }) {
  const cal = calendarEvent({ date: dateStr, slot, online: format === "online" });
  const shareText = "My therapy session at Choose Your Therapist"
    + (format === "online" ? " (online)" : ", Sector 51 Noida")
    + ": " + (dateLbl ? dateLbl.weekday + ", " + dateLbl.day + " " + dateLbl.month : dateStr) + ", " + slot;
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(fireConfetti, 350);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="na-success">
      <div className="na-tick" aria-hidden="true">
        <svg viewBox="0 0 52 52">
          <circle className="na-tick-bg" cx="26" cy="26" r="24" />
          <circle className="na-tick-c" cx="26" cy="26" r="24" />
          <path className="na-tick-p" d="M15 27l8 8 14-16" />
        </svg>
      </div>
      <h2>{title}</h2>
      <p>{text}</p>
      <div className="na-ticket">
        <div className="na-ticket-top">
          {dateLbl && (
            <div className="na-ticket-date"><span>{dateLbl.weekday}</span><b>{dateLbl.day}</b><span>{dateLbl.month}</span></div>
          )}
          <div>
            <div className="na-ticket-time">{slot}</div>
            {rows[0] && <div className="na-ticket-sub">{rows[0][1]}</div>}
          </div>
        </div>
        {rows.length > 1 && (
          <>
            <div className="na-ticket-tear" />
            <div className="na-ticket-rows">
              {rows.slice(1).map(([k, v]) => <div className="na-ticket-row" key={k}><span>{k}</span><b>{v}</b></div>)}
            </div>
          </>
        )}
      </div>
      <div className="na-succ-actions">
        <a className="na-succ-btn" href={cal.google} target="_blank" rel="noopener noreferrer"><Ic I={CalendarMonthRounded} s={18} /> Google Calendar</a>
        <button type="button" className="na-succ-btn" onClick={() => downloadIcs(cal.ics)}><Ic I={DownloadRounded} s={18} /> Apple / Outlook</button>
        <a className="na-succ-btn" href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer"><Ic I={WhatsAppIcon} s={18} /> Share on WhatsApp</a>
      </div>
      {showAddress && (
        <div className="na-address-box">
          <div className="na-address-title"><Ic I={PlaceRounded} /> Our Noida Center</div>
          <div className="na-address-text">Choose Your Therapist LLP<br />Gate No-3, D-137, near LPS Global School, Block D, Sector 51, Noida</div>
          <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="na-address-link">Get Directions →</a>
        </div>
      )}
      {showAddress && <p className="na-succ-hint">Please arrive 10 minutes early.</p>}
    </div>
  );
}

function SlotsSkeleton({ cols }) {
  return (
    <div className="na-fullslots-scroll" role="status" aria-label="Loading available slots">
      <table className="na-fullslots-table">
        <thead>
          <tr>
            <th></th>
            {Array.from({ length: cols }).map((_, i) => <th key={i}><span className="na-skel na-skel-head" /></th>)}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 10 }).map((_, r) => (
            <tr key={r}>
              <td className="na-time-col"><span className="na-skel na-skel-time" /></td>
              {Array.from({ length: cols }).map((_, c) => <td key={c}><span className="na-skel na-skel-cell" /></td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptySlots() {
  return (
    <div className="na-empty">
      <div className="na-empty-ic"><Ic I={EventBusyRounded} s={30} /></div>
      <div className="na-empty-title">No slots are open right now</div>
      <p className="na-empty-text">We open new times regularly. Message us and we'll find one that suits you.</p>
      <a className="na-wa-btn" href={waLink("Hi, I'd like to book a session at your Noida center.")} target="_blank" rel="noopener noreferrer">
        <Ic I={WhatsAppIcon} s={18} /> WhatsApp us
      </a>
    </div>
  );
}

function istTodayStr() {
  const d = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// "10:00 AM" -> "10 AM" (keeps "10:30 AM"), to fit the narrow time column.
function shortTime(label) {
  return label.split(" - ")[0].replace(":00 ", " ");
}

function SlotsTable({ matrix, loading, selected, disableLastMinute, isMobile, isTablet, header }) {
  // Phones page through 5 days; tablets fit all 10 but share the compact
  // header (weekday + day circle) and short time labels.
  const compact = isMobile || isTablet;
  const [page, setPage] = useState(0);
  if (loading) return <>{header}<SlotsSkeleton cols={isMobile ? MOBILE_PAGE_DAYS : 10} /></>;
  if (!matrix.dates.length) return <>{header}<EmptySlots /></>;

  const pageCount = isMobile ? Math.ceil(matrix.dates.length / MOBILE_PAGE_DAYS) : 1;
  const safePage = Math.min(page, pageCount - 1);
  const visibleDates = isMobile ? matrix.dates.slice(safePage * MOBILE_PAGE_DAYS, safePage * MOBILE_PAGE_DAYS + MOBILE_PAGE_DAYS) : matrix.dates;
  const today = istTodayStr();
  const first = dateLabel(visibleDates[0]);
  const last = dateLabel(visibleDates[visibleDates.length - 1]);
  const rangeLabel = first.month === last.month ? `${first.day} – ${last.day} ${last.month}` : `${first.day} ${first.month} – ${last.day} ${last.month}`;

  return (
    <>
      {isMobile ? (
        <div className="na-pager-row">
          <div className="na-pager-head">{header}<div className="na-pager-range">{rangeLabel} · IST</div></div>
          {pageCount > 1 && (
            <div className="na-pager-btns">
              <button type="button" className="na-pager-btn" aria-label="Earlier days" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>‹</button>
              <button type="button" className="na-pager-btn" aria-label="Later days" disabled={safePage >= pageCount - 1} onClick={() => setPage(safePage + 1)}>›</button>
            </div>
          )}
        </div>
      ) : header}
    <div className="na-fullslots-scroll">
      <table className="na-fullslots-table">
        <thead>
          <tr>
            <th></th>
            {visibleDates.map((d, i) => {
              const lbl = dateLabel(d);
              const isToday = d === today;
              if (!compact) return <th key={d} className={isToday ? "na-th-today" : undefined}>{isToday ? "Today" : lbl.weekday}<br />{lbl.day} {lbl.month}</th>;
              return (
                <th key={d} className={`na-th-m ${isToday ? "na-th-today" : ""}`}>
                  <div className="na-wd">{isToday ? "Today" : lbl.weekday}</div>
                  <div className={`na-dn ${isToday ? "today" : ""}`}>{lbl.day}</div>
                  {(i === 0 || lbl.day === 1) && <div className="na-mo">{lbl.month}</div>}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {matrix.times.map((t, ri) => (
            <tr key={t}>
              <td className="na-time-col">{compact ? shortTime(t) : t.split(" - ")[0]}</td>
              {visibleDates.map((d, ci) => {
                const tdProps = { className: d === today ? "na-td-today" : undefined, style: { "--na-i": ri + ci } };
                const state = matrix.grid[`${d}|${t}`];
                const isSelected = selected && selected.date === d && selected.slot === t;
                if (state === "lastMinute" && disableLastMinute) {
                  return (
                    <td key={d} {...tdProps}>
                      <span className="na-slotcell closed" title="Starting too soon to reschedule into" aria-label="Starting too soon to reschedule into" />
                    </td>
                  );
                }
                if (state === "open" || state === "lastMinute") {
                  const isLM = state === "lastMinute";
                  return (
                    <td key={d} {...tdProps}>
                      <button
                        type="button"
                        className={`na-slotcell ${isLM ? "lastminute" : "open"} ${isSelected ? "selected" : ""}`}
                        title={isSelected ? `Selected — ${t}` : isLM ? `Request ${t} — starting soon` : `Book ${t}`}
                        onClick={() => matrix.onPick(d, t, isLM)}
                      >
                        {isLM ? (isSelected ? <Ic I={CheckRounded} s={16} /> : "!") : <span className="na-wm">cyt<i className="na-wm-dot" aria-hidden="true" /></span>}
                      </button>
                    </td>
                  );
                }
                const label = state === "taken" ? "Booked" : state === "past" ? "Time has passed" : "Not opened";
                return (
                  <td key={d} {...tdProps}>
                    <span className={`na-slotcell ${state || "closed"}`} title={label} aria-label={label}>
                      {state === "taken" ? <span className="na-taken-stamp">Booked</span> : state === "past" ? <span className="na-past-label">Passed</span> : null}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </>
  );
}

export default function NoidaAppointment() {
  const [bookingType, setBookingType] = useState("new"); // "new" | "followup" | "reschedule"
  const [phase, setPhase] = useState("slots"); // "identify" | "slots" | "form" — meaningful for new/followup
  const [step, setStep] = useState(1);

  // Phone layout: paged 5-day table and a bottom "Selected → Continue" bar
  // instead of a table that scrolls sideways. Desktop is unchanged.
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  // Tablet layout: a touch screen wider than a phone (iPad). Portrait stacks
  // the table above a "Selected" card; landscape puts a "Your booking" panel
  // beside the table. Mouse-driven desktops keep the original layout.
  const [tablet, setTablet] = useState(false);
  const [landscape, setLandscape] = useState(false);
  useEffect(() => {
    const mqT = window.matchMedia("(min-width: 641px) and (min-height: 600px) and (pointer: coarse)");
    const mqL = window.matchMedia("(orientation: landscape)");
    const sync = () => { setTablet(mqT.matches); setLandscape(mqL.matches); };
    sync();
    mqT.addEventListener("change", sync);
    mqL.addEventListener("change", sync);
    return () => { mqT.removeEventListener("change", sync); mqL.removeEventListener("change", sync); };
  }, []);
  const tabletLandscape = tablet && landscape;
  // On phones and tablets a tap only selects a slot; Continue moves on.
  const usePendingPick = isMobile || tablet;

  // The site-wide cookie banner is fixed to the bottom of the screen and sits
  // above everything; lift the page's own bottom bars clear of it until it's dismissed.
  const [cookieH, setCookieH] = useState(0);
  useEffect(() => {
    if (!isMobile) { setCookieH(0); return; }
    const read = () => setCookieH(document.getElementById("cyt-cookie-consent-bar")?.offsetHeight || 0);
    read();
    const iv = setInterval(read, 400);
    return () => clearInterval(iv);
  }, [isMobile]);
  // On mobile a tap only selects a slot; the bottom bar's Continue moves on.
  const [pendingPick, setPendingPick] = useState(null); // { date, slot, isLM } | null

  // ── Pricing + packages, fetched once ─────────────────────────────────
  const [pricing, setPricing] = useState(null);
  useEffect(() => {
    fetch(`${apiUrl}/noida-appointments/pricing`)
      .then(r => r.json())
      .then(data => setPricing(data?.status ? data.data : null))
      .catch(() => setPricing(null));
  }, []);

  // ── Full-page available-slots table — the primary view for New/Follow-up.
  // Clicking an open cell picks that date+slot and moves straight into the
  // booking form, so there's no separate "pick a date/time" step later.
  const [slotsMatrix, setSlotsMatrix] = useState({ dates: [], times: [], grid: {} });
  const [slotsMatrixLoading, setSlotsMatrixLoading] = useState(true);

  // A slot tapped on mobile can get booked (or pass) before Continue is hit.
  useEffect(() => {
    if (!pendingPick) return;
    const st = slotsMatrix.grid[`${pendingPick.date}|${pendingPick.slot}`];
    if (st !== "open" && st !== "lastMinute") setPendingPick(null);
  }, [slotsMatrix, pendingPick]);

  // Baseline for spotting a slot that flipped open -> booked between two
  // polls, so the confetti only fires for a live booking, never on first load.
  const prevGridRef = useRef(null);

  const loadSlotsMatrix = useCallback(async (type, { silent = false } = {}) => {
    if (type !== "new" && type !== "followup") return;
    if (!silent) setSlotsMatrixLoading(true);
    try {
      const fresh = await fetchSlotsMatrix(type);
      if (hasNewlyBooked(prevGridRef.current, fresh.grid)) fireConfetti();
      prevGridRef.current = fresh.grid;
      setSlotsMatrix(fresh);
    } catch {
      // A silent background poll keeps the last known table on screen
      // instead of blanking it over one dropped request.
      if (!silent) setSlotsMatrix({ dates: [], times: [], grid: {} });
    } finally {
      if (!silent) setSlotsMatrixLoading(false);
    }
  }, []);

  useEffect(() => {
    prevGridRef.current = null;
    loadSlotsMatrix(bookingType);
    const iv = setInterval(() => {
      if (!document.hidden) loadSlotsMatrix(bookingType, { silent: true });
    }, 6000);
    return () => clearInterval(iv);
  }, [bookingType, loadSlotsMatrix]);

  // A tab left open on the slots table would otherwise keep running the old
  // build after a deploy. Reload it, but only while idle on the New Client
  // table — never mid-form, and not Follow-up where a typed phone would be lost.
  useEffect(() => {
    if (phase !== "slots" || bookingType !== "new") return;
    const current = window.__NEXT_DATA__?.buildId;
    if (!current) return;
    const iv = setInterval(async () => {
      if (document.hidden) return;
      try {
        const html = await (await fetch(window.location.pathname, { cache: "no-store" })).text();
        const m = html.match(/"buildId":"([^"]+)"/);
        if (m && m[1] !== current) window.location.reload();
      } catch {
        // offline or mid-deploy — try again next tick
      }
    }, 60000);
    return () => clearInterval(iv);
  }, [phase, bookingType]);

  const [sessionMode, setSessionMode] = useState("individual"); // "individual" | "couple" | "package"
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [format, setFormat] = useState("in-person"); // "in-person" | "online" | "home-visit"
  const [address, setAddress] = useState("");

  const selectedPackage = (pricing?.packages || []).find(p => p._id === selectedPackageId);
  const baseAmount = sessionMode === "package"
    ? (selectedPackage?.price ?? 0)
    : (pricing?.[priceFieldFor(sessionMode, format)] ?? 0);
  const platformFee = pricing?.platformFee ?? 20;
  const totalAmount = baseAmount + platformFee;

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");

  // ── Last-minute request flow (see LAST_MINUTE_WINDOW_MINUTES backend-side)
  // A slot inside the last-minute window can't be booked outright — the
  // client sends a request, staff accepts it from the admin panel, and only
  // then does payment unlock.
  const [selectedIsLastMinute, setSelectedIsLastMinute] = useState(false);
  const [lastMinuteRequestId, setLastMinuteRequestId] = useState(null);
  const [lastMinuteStatus, setLastMinuteStatus] = useState(null); // null | "pending" | "accepted" | "rejected" | "expired"
  const [lastMinuteExpiresIn, setLastMinuteExpiresIn] = useState(null); // seconds, as of lastMinutePolledAt
  const [lastMinutePolledAt, setLastMinutePolledAt] = useState(null); // ms epoch
  const [lastMinuteSending, setLastMinuteSending] = useState(false);
  const lastMinutePollRef = useRef(null);
  const [nowTick, setNowTick] = useState(Date.now());

  const stopLastMinutePoll = () => {
    if (lastMinutePollRef.current) { clearInterval(lastMinutePollRef.current); lastMinutePollRef.current = null; }
  };
  useEffect(() => () => stopLastMinutePoll(), []);

  // Ticks once a second only while a live countdown is actually on screen.
  useEffect(() => {
    const active = phase === "form" && step === 3 && selectedIsLastMinute && lastMinuteStatus !== "accepted";
    if (!active) return;
    const iv = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(iv);
  }, [phase, step, selectedIsLastMinute, lastMinuteStatus]);

  const resetLastMinute = () => {
    stopLastMinutePoll();
    setSelectedIsLastMinute(false);
    setLastMinuteRequestId(null);
    setLastMinuteStatus(null);
    setLastMinuteExpiresIn(null);
    setLastMinutePolledAt(null);
  };

  const handlePickSlot = (date, slot, isLastMinute) => {
    setSlotNotice("");
    setPendingPick(null);
    resetLastMinute();
    setSelectedDate(date);
    setSelectedSlot(slot);
    setSelectedIsLastMinute(!!isLastMinute);
    setPhase("form");
    // Follow-up already collected phone/name during the identify phase —
    // jump straight to Session. New Client hasn't, so start at You.
    setStep(bookingType === "followup" ? (skipSession ? 3 : 2) : 1);
    setError("");
    setStatus(null);
  };

  const pollLastMinuteStatus = async (id) => {
    try {
      const res = await fetch(`${apiUrl}/noida-appointments/last-minute-requests/${id}/status`);
      const data = await res.json();
      if (!data?.status) return;
      setLastMinuteStatus(data.data.status);
      setLastMinuteExpiresIn(data.data.expiresInSeconds);
      setLastMinutePolledAt(Date.now());
      if (data.data.status !== "pending") stopLastMinutePoll();
    } catch {
      // transient network error while polling — just try again next tick
    }
  };

  const handleSendLastMinuteRequest = async () => {
    setLastMinuteSending(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/noida-appointments/last-minute-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: effectiveName.trim(), age: form.age.trim(), phone: form.phone.trim(),
          email: form.email.trim(), concern: form.concern.trim(),
          date: selectedDate, slot: selectedSlot, type: bookingType,
          sessionMode, format,
          address: format === "home-visit" ? address.trim() : undefined,
          packageId: sessionMode === "package" ? selectedPackageId : undefined,
        }),
      });
      const data = await res.json();
      if (!data.status) { setError(data.message || "Could not send request. Please try again."); return; }
      setLastMinuteRequestId(data.data._id);
      setLastMinuteStatus(data.data.status);
      setLastMinuteExpiresIn(data.data.status === "pending" ? 10 * 60 : null);
      setLastMinutePolledAt(Date.now());
      if (data.data.status === "pending") {
        lastMinutePollRef.current = setInterval(() => pollLastMinuteStatus(data.data._id), 3000);
      }
    } catch {
      setError("Could not send request. Please try again.");
    } finally {
      setLastMinuteSending(false);
    }
  };

  // ── Follow-up phone lookup ───────────────────────────────────────────
  const [lookupStatus, setLookupStatus] = useState(null); // null | "checking" | "found" | "not-found"
  const [foundName, setFoundName] = useState("");
  const [manualOverride, setManualOverride] = useState(false); // "not you? enter manually"
  const [credit, setCredit] = useState(null); // { available, sessionsRemaining, packageName } | null

  const runLookup = useCallback(async (phone) => {
    if (!/^\d{10}$/.test(phone)) { setLookupStatus(null); setCredit(null); return; }
    setLookupStatus("checking");
    try {
      const res = await fetch(`${apiUrl}/noida-appointments/lookup?phone=${phone}`);
      const data = await res.json();
      setCredit(data?.data?.credit?.available ? data.data.credit : null);
      if (data?.status && data.data?.found) {
        setFoundName(data.data.name || "");
        setLookupStatus("found");
      } else {
        setLookupStatus("not-found");
      }
    } catch {
      setLookupStatus("not-found");
      setCredit(null);
    }
  }, []);

  const usingCredit = bookingType === "followup" && !!credit;

  // ── Reschedule tab — compact single-screen flow: phone → nearest
  // upcoming booking → pick new date/time from the same slots table.
  const [reschedulePhone, setReschedulePhone] = useState("");
  const [rescheduleStatus, setRescheduleStatus] = useState(null); // null | "checking" | "found" | "not-found"
  const [rescheduleInfo, setRescheduleInfo] = useState(null); // { name, date, slot, type }
  const [rescheduleMatrix, setRescheduleMatrix] = useState({ dates: [], times: [], grid: {} });
  const [rescheduleMatrixLoading, setRescheduleMatrixLoading] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleSlot, setRescheduleSlot] = useState("");
  const [rescheduleSubmitting, setRescheduleSubmitting] = useState(false);
  const [rescheduleDone, setRescheduleDone] = useState(false);
  const [rescheduleError, setRescheduleError] = useState("");

  const runRescheduleLookup = useCallback(async (phone) => {
    if (!/^\d{10}$/.test(phone)) { setRescheduleStatus(null); setRescheduleInfo(null); return; }
    setRescheduleStatus("checking");
    try {
      const res = await fetch(`${apiUrl}/noida-appointments/upcoming?phone=${phone}`);
      const data = await res.json();
      if (data?.status && data.data?.found) {
        setRescheduleInfo(data.data);
        setRescheduleStatus("found");
      } else {
        setRescheduleInfo(null);
        setRescheduleStatus("not-found");
      }
    } catch {
      setRescheduleStatus("not-found");
      setRescheduleInfo(null);
    }
  }, []);

  const handleReschedulePhoneChange = (v) => {
    const digits = v.replace(/\D/g, "").slice(0, 10);
    setReschedulePhone(digits);
    setRescheduleDate(""); setRescheduleSlot(""); setRescheduleError("");
    if (digits.length === 10) runRescheduleLookup(digits);
    else { setRescheduleStatus(null); setRescheduleInfo(null); }
  };

  useEffect(() => {
    if (!rescheduleInfo) { setRescheduleMatrix({ dates: [], times: [], grid: {} }); return; }
    setRescheduleMatrixLoading(true);
    setRescheduleDate(""); setRescheduleSlot("");
    let prevGrid = null;
    let cancelled = false;
    const load = async (silent) => {
      try {
        const fresh = await fetchSlotsMatrix(rescheduleInfo.type);
        if (cancelled) return;
        if (hasNewlyBooked(prevGrid, fresh.grid)) fireConfetti();
        prevGrid = fresh.grid;
        setRescheduleMatrix(fresh);
      } catch {
        if (!silent && !cancelled) setRescheduleMatrix({ dates: [], times: [], grid: {} });
      } finally {
        if (!silent && !cancelled) setRescheduleMatrixLoading(false);
      }
    };
    load(false);
    const iv = setInterval(() => { if (!document.hidden) load(true); }, 6000);
    return () => { cancelled = true; clearInterval(iv); };
  }, [rescheduleInfo]);

  const handleReschedulePickSlot = (date, slot) => {
    setRescheduleDate(date);
    setRescheduleSlot(slot);
    setRescheduleError("");
  };

  const rescheduleDateLabel = rescheduleDate ? dateLabel(rescheduleDate) : null;

  const submitReschedule = async () => {
    setRescheduleError("");
    if (!rescheduleDate || !rescheduleSlot) { setRescheduleError("Please select a date and time."); return; }
    setRescheduleSubmitting(true);
    try {
      const res = await fetch(`${apiUrl}/noida-appointments/reschedule`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: reschedulePhone, newDate: rescheduleDate, newSlot: rescheduleSlot }),
      });
      const data = await res.json();
      if (data.status) setRescheduleDone(true);
      else setRescheduleError(data.message || "Could not reschedule. Please try again.");
    } catch {
      setRescheduleError("Could not reschedule. Please try again.");
    } finally {
      setRescheduleSubmitting(false);
    }
  };

  // ── Form ──────────────────────────────────────────────────────────────
  const [form, setForm] = useState({ name: "", age: "", phone: "", email: "", concern: "" });
  const [status, setStatus] = useState(null); // null | "loading" | "success"
  const [error, setError] = useState("");
  // Shown above the slots table when a slot was lost while the client was booking it.
  const [slotNotice, setSlotNotice] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(null); // null | "razorpay"

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handlePhoneChange = (v) => {
    const digits = v.replace(/\D/g, "").slice(0, 10);
    set("phone", digits);
    setManualOverride(false);
    if (digits.length === 10 && bookingType === "followup") runLookup(digits);
    else { setLookupStatus(null); setCredit(null); }
  };

  const switchTab = (type) => {
    setSlotNotice("");
    setPendingPick(null);
    resetLastMinute();
    setBookingType(type);
    setPhase(type === "followup" ? "identify" : "slots");
    setStep(1);
    setStatus(null);
    setError("");
    setLookupStatus(null);
    setManualOverride(false);
    setCredit(null);
    setForm({ name: "", age: "", phone: "", email: "", concern: "" });
    setPaymentMethod(null);
    setSelectedDate(""); setSelectedSlot("");
    setReschedulePhone(""); setRescheduleStatus(null); setRescheduleInfo(null);
    setRescheduleDate(""); setRescheduleSlot(""); setRescheduleDone(false); setRescheduleError("");
  };

  const needsFullDetails = bookingType === "new" || lookupStatus === "not-found" || manualOverride;
  const effectiveName = bookingType === "followup" && lookupStatus === "found" && !manualOverride ? foundName : form.name;

  // Landscape tablets pick session + mode in the "Your booking" panel beside
  // the table, so the Session step is skipped unless something still needs
  // filling in (a package to choose, or a home-visit address) or the client
  // is using package credit (which only asks for the mode there).
  const skipSession = tabletLandscape && !usingCredit && sessionMode !== "package" && format !== "home-visit";

  const goToStep2 = () => {
    setError("");
    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone.trim())) {
      setError("Please enter a valid 10-digit phone number."); return;
    }
    if (!effectiveName?.trim()) { setError("Name is required."); return; }
    setStep(skipSession ? 3 : 2);
  };
  const goBackFromPay = () => {
    if (!skipSession) { setStep(2); return; }
    if (bookingType === "followup") { resetLastMinute(); setPhase("slots"); }
    else setStep(1);
  };
  // Follow-up's identify phase — same validation as goToStep2, but moves
  // to the slots table instead of a wizard step.
  const goToIdentifySlots = () => {
    setError("");
    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone.trim())) {
      setError("Please enter a valid 10-digit phone number."); return;
    }
    if (!effectiveName?.trim()) { setError("Name is required."); return; }
    setPhase("slots");
  };
  const goToPayment = () => {
    setError("");
    if (!usingCredit) {
      if (sessionMode === "package" && !selectedPackageId) { setError("Please choose a package."); return; }
      if (format === "home-visit" && !address.trim()) { setError("Please add your address for the home visit."); return; }
    }
    setStep(3);
  };

  const buildPayload = () => ({
    name: effectiveName.trim(),
    age: form.age.trim(),
    phone: form.phone.trim(),
    email: form.email.trim(),
    concern: form.concern.trim(),
    date: selectedDate, slot: selectedSlot, type: bookingType,
    sessionMode, format,
    address: format === "home-visit" ? address.trim() : "",
    packageId: sessionMode === "package" ? selectedPackageId : undefined,
  });

  const finalizeBooking = async (paymentExtra = {}) => {
    setStatus("loading");
    setError("");
    try {
      const res = await fetch(`${apiUrl}/noida-appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...buildPayload(), ...paymentExtra }),
      });
      const data = await res.json();
      if (data.status) {
        setStatus("success");
      } else if (data.paymentHandled && data.refunded !== undefined) {
        // Paid, but the slot went before the booking could be made — the server
        // has already refunded (or flagged it for staff). Send them back to
        // pick another slot with the explanation, instead of a dead-end error.
        setSlotNotice(data.message);
        setError("");
        setStatus(null);
        resetLastMinute();
        setPhase("slots");
        loadSlotsMatrix(bookingType);
      } else if (data.paymentHandled) {
        setError(data.message);
        setStatus(null);
      } else if (paymentExtra.razorpay_payment_id) {
        setError(`${data.message || "Booking failed after payment."} Please WhatsApp us with payment ID ${paymentExtra.razorpay_payment_id} and we'll sort it out.`);
        setStatus(null);
      } else {
        setError(data.message || "Booking failed. Please try again.");
        setStatus(null);
      }
    } catch {
      if (paymentExtra.razorpay_payment_id) {
        setError("Payment succeeded but we couldn't save the booking. Please WhatsApp us and we'll sort it out.");
      } else {
        setError("Could not save the booking. Please try again.");
      }
      setStatus(null);
    }
  };

  const handleConfirmCredit = () => finalizeBooking();

  const handleRazorpay = async () => {
    setPaymentMethod("razorpay");
    setStatus("loading");
    setError("");
    try {
      const orderRes = await fetch(`${apiUrl}/noida-appointments/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionMode, format,
          packageId: sessionMode === "package" ? selectedPackageId : undefined,
          address: format === "home-visit" ? address.trim() : undefined,
          type: bookingType, phone: form.phone.trim(),
          // The whole booking goes with the order so the server can refuse a
          // taken slot before charging, and finish or refund the booking itself
          // if this browser never gets to confirm.
          name: effectiveName.trim(), age: form.age.trim(), email: form.email.trim(), concern: form.concern.trim(),
          date: selectedDate, slot: selectedSlot,
        }),
      });
      const orderData = await orderRes.json();
      if (!orderData.status) {
        if (orderRes.status === 409) {
          // Someone took the slot while this client was filling in the form — nothing was charged.
          setSlotNotice(orderData.message || "That slot was just booked. Please pick another.");
          setError("");
          setStatus(null);
          resetLastMinute();
          setPhase("slots");
          loadSlotsMatrix(bookingType);
          return;
        }
        setError(orderData.message || "Could not start payment. Please try again.");
        setStatus(null);
        return;
      }

      await waitForRazorpay();

      const rzp = new window.Razorpay({
        key: orderData.data.keyId,
        amount: Math.round(orderData.data.amount * 100),
        currency: "INR",
        order_id: orderData.data.orderId,
        name: "Choose Your Therapist",
        description: "Noida Center Appointment",
        handler: (response) => finalizeBooking({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        }),
        prefill: { name: effectiveName, email: form.email, contact: form.phone },
        theme: { color: "#1a6b3a" },
        modal: {
          ondismiss: () => {
            setStatus(null);
            setError("Payment was cancelled. You can try again whenever you're ready.");
          },
        },
      });
      rzp.on("payment.failed", () => {
        setStatus(null);
        setError("Payment failed. Please try again or use a different payment method.");
      });
      rzp.open();
    } catch (err) {
      setError(err.message || "Could not start payment. Please try again.");
      setStatus(null);
    }
  };

  const pickedDateLabel = selectedDate ? dateLabel(selectedDate) : null;
  const formatLabel = format === "home-visit" ? "Home Visit" : format === "online" ? "Online" : "In-person";
  const modeLabel = sessionMode === "package" ? (selectedPackage?.name || "Package") : sessionMode === "couple" ? "Couple" : "Individual";

  return (
    <>
      <Head>
        <title>Book an In-Person Appointment — Noida Therapy Center | Choose Your Therapist</title>
        <meta name="description" content="Book your in-person therapy session at our Noida (Sector 51) center. Pick a date and time that works for you — instantly confirmed." />
        <link rel="canonical" href="https://chooseyourtherapist.in/noida-appointment" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Book an In-Person Appointment — Noida Therapy Center" />
        <meta property="og:description" content="Pick a date and time for your in-person session at our Noida center — instantly confirmed." />
        <meta property="og:url" content="https://chooseyourtherapist.in/noida-appointment" />
        <meta property="og:site_name" content="Choose Your Therapist" />
        <meta property="og:image" content="https://chooseyourtherapist.in/og-noida-appointment.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Choose Your Therapist — book an in-person session at our Noida center" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Book an In-Person Appointment — Noida Therapy Center" />
        <meta name="twitter:description" content="Pick a date and time for your in-person session at our Noida center — instantly confirmed." />
        <meta name="twitter:image" content="https://chooseyourtherapist.in/og-noida-appointment.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </Head>

      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      <style dangerouslySetInnerHTML={{ __html: `
        .na-page { font-family: 'Inter', sans-serif; background: #f4f6f5; min-height: 100vh; display: flow-root; }

        .na-topbar { max-width: 1100px; margin: 0 auto; padding: 18px 20px 4px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
        .na-topbar-tabs { display: flex; gap: 6px; background: #fff; border-radius: 12px; padding: 5px; box-shadow: 0 4px 16px rgba(15,61,34,.08); }
        .na-topbar-tab { border: none; background: none; padding: 9px 18px; border-radius: 8px; font-size: 13px; font-weight: 800; color: #64748b; cursor: pointer; transition: all .15s; white-space: nowrap; }
        .na-topbar-tab.active { background: #1a6b3a; color: #fff; }
        .na-shell { max-width: 1100px; margin: 8px auto 0; background: #fff; border-radius: 20px; box-shadow: 0 20px 50px rgba(15,61,34,.14); overflow: hidden; }
        .na-shell .na-fullslots-wrap, .na-shell .na-centerwrap { max-width: none; }
        .na-shell .na-fullslots-wrap { padding-top: 6px; padding-bottom: 16px; }
        .na-shell .na-fullslots-wrap.na-tab { padding: 8px 10px 20px; }
        .na-shell .na-fullslots-wrap.has-bar { padding-bottom: calc(140px + var(--na-ck, 0px)); }
        .na-shell .na-fullslots-card, .na-shell .na-card { background: transparent; box-shadow: none; border-radius: 0; }
        .na-wa-btn { display: inline-flex; align-items: center; justify-content: center; gap: 7px; padding: 9px 16px; border-radius: 999px; background: #fff; border: 1.5px solid #bbf7d0; color: #166534; font-size: 13px; font-weight: 800; text-decoration: none; cursor: pointer; transition: all .15s; font-family: inherit; }
        .na-wa-btn:hover { background: #f0fdf4; border-color: #1a6b3a; }
        .na-skel { display: block; border-radius: 8px; background: linear-gradient(90deg, #e8eeeb 25%, #f6f8f7 37%, #e8eeeb 63%); background-size: 400% 100%; animation: naShimmer 1.4s ease infinite; }
        /* the site's bottom navigation reserves 75px of body padding up to 1200px wide; let the grey footer fill it */
        @media (max-width: 1200px) { .na-page { margin-bottom: -75px; } .na-foot-in { padding-bottom: 75px; } }
        .na-foot { background: #e9edeb; margin-top: 44px; padding: 44px 20px 40px; }
        .na-foot-in { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: minmax(0, 1fr) auto; column-gap: 32px; align-items: center; }
        .na-foot-in > :not(.na-foot-help) { grid-column: 1; }
        .na-foot-help { grid-column: 2; grid-row: 1 / span 5; align-self: center; width: 300px; display: flex; flex-direction: column; align-items: flex-start; gap: 10px; padding-left: 32px; border-left: 1px solid #d5dcd8; }
        .na-foot-help-title { font-size: 17px; font-weight: 800; color: #334155; }
        .na-foot-help-text { margin: 0; font-size: 13px; line-height: 1.55; color: #5b6b64; }
        .na-foot-help .na-wa-btn { margin-top: 4px; }
        .na-foot-big { font-size: clamp(30px, 6.4vw, 60px); font-weight: 800; line-height: 1.08; letter-spacing: -1.2px; color: #c5cec9; }
        .na-foot-tag { margin: 22px 0 0; font-size: 14px; line-height: 1.5; color: #5b6b64; }
        .na-foot-list { list-style: none; margin: 14px 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 8px 22px; }
        .na-foot-list li { margin: 0; display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: #475569; }
        .na-foot-list li svg { color: #5b6b64; }
        .na-foot-note { margin: 14px 0 0; display: flex; align-items: flex-start; gap: 6px; font-size: 12.5px; line-height: 1.5; color: #5b6b64; }
        .na-foot-note svg { flex: 0 0 auto; margin-top: 2px; }
        .na-foot-brand { grid-column: 1 / -1 !important; margin-top: 26px; padding-top: 16px; border-top: 1px solid #d5dcd8; font-size: 12px; font-weight: 700; color: #7b8a83; }
        .na-skel-chip { width: 170px; height: 14px; }
        .na-skel-head { width: 40px; height: 34px; margin: 0 auto; }
        .na-skel-time { width: 36px; height: 12px; }
        .na-skel-cell { height: 44px; border-radius: 12px; }
        @keyframes naShimmer { 0% { background-position: 100% 50%; } 100% { background-position: 0 50%; } }
        @media (prefers-reduced-motion: reduce) { .na-skel { animation: none; } }
        .na-empty { text-align: center; padding: 44px 16px; }
        .na-empty-ic { width: 60px; height: 60px; border-radius: 50%; background: #f1f5f9; color: #64748b; display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; }
        .na-empty-title { font-size: 16px; font-weight: 800; color: #0f172a; }
        .na-empty-text { font-size: 13.5px; color: #64748b; line-height: 1.6; margin: 6px auto 18px; max-width: 340px; }

        .na-centerwrap { max-width: 1100px; margin: 0 auto; padding: 20px 20px 60px; }
        .na-card-inner { max-width: 560px; margin: 0 auto; }
        .na-card { background: #fff; border-radius: 20px; box-shadow: 0 20px 50px rgba(15,61,34,.14); padding: 28px 24px 32px; }

        .na-picked-banner { display: flex; align-items: center; justify-content: space-between; gap: 10px; background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; border-radius: 12px; padding: 10px 14px; font-size: 13px; font-weight: 700; margin-bottom: 18px; }
        .na-picked-change { background: none; border: none; color: #1a6b3a; font-size: 12px; font-weight: 800; text-decoration: underline; cursor: pointer; flex-shrink: 0; padding: 12px 10px; margin: -12px -10px; font-family: inherit; }

        .na-fullslots-wrap { max-width: 1100px; margin: 0 auto; padding: 20px 20px 60px; }
        .na-fullslots-card { background: #fff; border-radius: 20px; box-shadow: 0 20px 50px rgba(15,61,34,.14); padding: 26px 26px 22px; }
        .na-fullslots-title { font-size: 16px; font-weight: 800; color: #0f172a; }
        .na-fullslots-sub { font-size: 12.5px; color: #64748b; margin-top: 3px; margin-bottom: 18px; }
        .na-fullslots-scroll { overflow-x: auto; }
        .na-fullslots-table { width: 100%; border-collapse: separate; border-spacing: 6px; }
        .na-fullslots-table th, .na-fullslots-table td, .na-fullslots-table tr { border: 0; }
        .na-fullslots-table th { font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; padding: 6px 5px 10px; text-align: center; white-space: nowrap; line-height: 1.4; }
        .na-fullslots-table td { padding: 0; text-align: center; }
        .na-fullslots-table td.na-time-col { text-align: center; font-size: 13px; font-weight: 800; color: #1e293b; white-space: nowrap; background: #eef3f0; border-radius: 12px; padding: 0 12px; width: 104px; letter-spacing: .1px; }
        .na-fullslots-table th:first-child { width: 104px; }
        .na-slotcell { display: flex; align-items: center; justify-content: center; width: 100%; min-width: 68px; height: 44px; border-radius: 12px; border: 1.5px solid transparent; font-size: 13px; font-weight: 800; cursor: default; box-sizing: border-box; font-family: inherit; }
        button.na-slotcell.open { background: #f0fdf4; border-color: #bbf7d0; color: #15803d; cursor: pointer; transition: all .15s; }
        button.na-slotcell.open:hover { background: #1a6b3a; border-color: #1a6b3a; color: #fff; transform: translateY(-1px); }
        button.na-slotcell.open.selected { background: #1a6b3a; border-color: #1a6b3a; color: #fff; box-shadow: 0 0 0 3px rgba(26,107,58,.2); }
        button.na-slotcell.open.selected:hover { transform: none; }
        button.na-slotcell.lastminute { background: #fffbeb; border-color: #fde68a; color: #b45309; cursor: pointer; transition: all .15s; }
        button.na-slotcell.lastminute:hover { background: #b45309; border-color: #b45309; color: #fff; transform: translateY(-1px); }
        button.na-slotcell.lastminute.selected { background: #b45309; border-color: #b45309; color: #fff; box-shadow: 0 0 0 3px rgba(245,158,11,.25); }
        button.na-slotcell.lastminute.selected:hover { transform: none; }
        .na-slotcell.taken { background: #fef2f2; border-color: #fecaca; color: #fca5a5; overflow: hidden; }
        .na-wm { display: inline-flex; align-items: flex-end; font-size: 16px; font-weight: 800; letter-spacing: -.3px; text-transform: lowercase; line-height: 1; }
        .na-wm-dot { display: inline-block; flex-shrink: 0; width: 6px; height: 6px; margin: 0 0 1px 2px; border-radius: 50%; background: #f5b301; }
        .na-past-label { font-size: 9px; font-weight: 700; letter-spacing: .4px; color: #64748b; text-transform: uppercase; }
        .na-taken-stamp { display: inline-block; transform: rotate(-18deg); font-size: 9px; font-weight: 900; letter-spacing: .4px; color: #c81e1e; text-transform: uppercase; white-space: nowrap; }
        .na-slotcell.closed { background: repeating-linear-gradient(135deg, #f8fafc 0 6px, #eef2f6 6px 12px); border-color: #eef2f6; }
        .na-slotcell.past { background: #f8fafc; color: #e2e8f0; }
        .na-sw-open { background: #f0fdf4; border: 1.5px solid #bbf7d0; }
        .na-sw-lm { background: #fffbeb; border: 1.5px solid #fde68a; }
        .na-sw-taken { background: #fef2f2; border: 1.5px solid #fecaca; }
        .na-sw-past { background: #f1f5f9; }
        .na-sw-closed { background: repeating-linear-gradient(135deg, #f8fafc 0 3px, #dbe2ea 3px 6px); border: 1px solid #e2e8f0; }
        .na-fullslots-table th.na-th-today { color: #166534; background: #e7f5ec; border-radius: 12px; }
        .na-th-m.na-th-today { background: transparent; }
        .na-td-today button.na-slotcell.open { border-color: #86efac; }
        .na-foot-link { color: inherit; text-decoration: underline; text-underline-offset: 2px; }
        .na-foot-link:hover { color: #166534; }
        .na-fullslots-legend { display: flex; gap: 16px; flex-wrap: wrap; margin-top: 18px; padding-top: 14px; border-top: 1px solid #f1f5f9; }
        .na-fullslots-legend span { display: inline-flex; align-items: center; gap: 6px; font-size: 11.5px; color: #64748b; font-weight: 600; }
        .na-fullslots-legend i { display: inline-block; width: 11px; height: 11px; border-radius: 3px; }
        .na-fullslots-empty { font-size: 13px; color: #64748b; padding: 40px 0; text-align: center; }

        .na-steps { display: flex; align-items: center; gap: 6px; margin-bottom: 22px; }
        .na-step-dot { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; }
        .na-step-circle { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; border: 2px solid #cbd5e1; color: #64748b; background: #fff; transition: all .2s; }
        .na-step-dot.done .na-step-circle { background: #1a6b3a; border-color: #1a6b3a; color: #fff; }
        .na-step-dot.active .na-step-circle { border-color: #1a6b3a; color: #1a6b3a; }
        .na-step-label { font-size: 10.5px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: .4px; }
        .na-step-dot.active .na-step-label, .na-step-dot.done .na-step-label { color: #1a6b3a; }
        .na-step-line { position: relative; overflow: hidden; flex: 1.4; height: 2px; background: #e2e8f0; margin-top: -22px; }
        .na-step-line::after { content: ""; position: absolute; inset: 0; background: #1a6b3a; transform: scaleX(0); transform-origin: left center; transition: transform .45s ease; }
        .na-step-line.done::after { transform: scaleX(1); }
        .na-step-dot.active .na-step-circle { box-shadow: 0 0 0 4px rgba(26,107,58,.14); }
        .na-step-dot.done .na-step-circle svg { animation: naPop .35s ease; }

        .na-section-label { font-size: 11.5px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 12px; }

        .na-pill-row { display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }
        .na-pill { flex: 1; min-width: 90px; padding: 10px 8px; border-radius: 10px; text-align: center; border: 1.5px solid #e2e8f0; background: #fff; cursor: pointer; transition: all .15s; font-size: 12.5px; font-weight: 700; color: #334155; }
        .na-pill:hover { border-color: #94a3b8; }
        .na-pill.active { background: #f0fdf4; border-color: #1a6b3a; color: #15803d; }
        .na-pill-price { display: block; font-size: 10.5px; font-weight: 600; color: #64748b; margin-top: 2px; }
        .na-pill.active .na-pill-price { color: #15803d; }

        .na-pkg-card-row { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
        .na-pkg-card { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; border: 1.5px solid #e2e8f0; border-radius: 12px; background: #fff; cursor: pointer; transition: all .15s; }
        .na-pkg-card:hover { border-color: #94a3b8; }
        .na-pkg-card.active { background: #f0fdf4; border-color: #1a6b3a; }
        .na-pkg-card-name { font-size: 13px; font-weight: 700; color: #0f172a; }
        .na-pkg-card-meta { font-size: 11.5px; color: #64748b; margin-top: 2px; }
        .na-pkg-card-price { font-size: 14px; font-weight: 800; color: #1a6b3a; }

        .na-inp { width: 100%; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 11px 13px; font-size: 14px; color: #0f172a; outline: none; background: #f8fafc; box-sizing: border-box; font-family: inherit; transition: border-color .15s; }
        .na-inp:focus { border-color: #1a6b3a; background: #fff; }
        .na-textarea { resize: vertical; min-height: 70px; line-height: 1.6; }
        .na-lbl { font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: .5px; display: block; margin-bottom: 6px; }
        .na-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
        @media (max-width: 480px) { .na-row { grid-template-columns: 1fr; } }

        .na-btn-row { display: flex; gap: 10px; margin-top: 10px; }
        .na-btn-back { flex: 0 0 auto; padding: 15px 20px; border: 1.5px solid #e2e8f0; border-radius: 12px; background: #fff; color: #475569; font-size: 14px; font-weight: 700; cursor: pointer; transition: all .15s; }
        .na-btn-back:hover { border-color: #94a3b8; }
        .na-submit { display: block; width: 100%; flex: 1; padding: 15px 0; border: none; border-radius: 12px; background: linear-gradient(135deg, #166534, #1a6b3a); color: #fff; font-size: 15px; font-weight: 800; cursor: pointer; transition: all .2s; box-shadow: 0 6px 18px rgba(22,101,52,.28); }
        .na-submit:disabled { opacity: .6; cursor: not-allowed; }

        .na-error { background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; font-size: 13px; font-weight: 600; padding: 10px 14px; border-radius: 10px; margin-bottom: 16px; }

        .na-lookup-box { border-radius: 12px; padding: 12px 14px; margin-bottom: 18px; font-size: 13px; display: flex; align-items: center; justify-content: space-between; gap: 10px; }
        .na-lookup-checking { background: #f8fafc; color: #64748b; }
        .na-lookup-found { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; font-weight: 700; }
        .na-lookup-notfound { background: #fffbeb; border: 1px solid #fde68a; color: #92400e; }
        .na-lookup-link { background: none; border: none; color: inherit; text-decoration: underline; font-size: 12px; font-weight: 700; cursor: pointer; padding: 0; flex-shrink: 0; }

        .na-review { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 18px; font-size: 13.5px; color: #334155; line-height: 2; margin-bottom: 20px; }
        .na-review strong { color: #0f172a; }
        .na-price-breakdown { border-top: 1px dashed #cbd5e1; margin-top: 8px; padding-top: 8px; }
        .na-price-total { display: flex; justify-content: space-between; font-size: 15px; font-weight: 800; color: #1a6b3a; margin-top: 4px; }

        .na-lastmin-box { background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 16px 18px; margin-top: 4px; }
        .na-lastmin-title { font-size: 14px; font-weight: 800; color: #92400e; margin-bottom: 6px; }
        .na-lastmin-text { font-size: 13px; color: #78350f; line-height: 1.6; }

        .na-success { text-align: center; padding: 20px 4px; }
        .na-success-icon { width: 72px; height: 72px; border-radius: 50%; background: #dcfce7; color: #16a34a; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 34px; }
        .na-success h2 { font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 10px; }
        .na-success p { font-size: 14px; color: #64748b; line-height: 1.7; margin-bottom: 20px; }
        .na-summary { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 18px; text-align: left; font-size: 13.5px; color: #334155; line-height: 2; }
        .na-address-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px 18px; text-align: left; margin-top: 12px; }
        .na-address-title { font-size: 12.5px; font-weight: 800; color: #166534; margin-bottom: 6px; }
        .na-address-text { font-size: 13px; color: #334155; line-height: 1.6; margin-bottom: 10px; }
        .na-address-link { font-size: 12.5px; font-weight: 700; color: #1a6b3a; text-decoration: none; }
        .na-address-link:hover { text-decoration: underline; }

        .na-pager-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 10px; padding: 0 2px; }
        .na-pager-range { font-size: 12px; color: #64748b; margin-top: 2px; }
        .na-pager-btns { display: flex; gap: 6px; flex-shrink: 0; }
        .na-pager-btn { width: 40px; height: 40px; border-radius: 10px; border: 1.5px solid #e2e8f0; background: #fff; color: #1a6b3a; font-size: 22px; font-weight: 800; line-height: 1; cursor: pointer; padding: 0; display: flex; align-items: center; justify-content: center; font-family: inherit; }
        .na-pager-btn:disabled { color: #cbd5e1; background: #f8fafc; cursor: default; }
        .na-th-m { padding: 0 0 6px !important; }
        .na-wd { font-size: 10px; font-weight: 800; letter-spacing: .5px; color: #64748b; text-transform: uppercase; }
        .na-dn { margin: 3px auto 0; width: 26px; height: 26px; border-radius: 13px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; color: #0f172a; }
        .na-dn.today { background: #1a6b3a; color: #fff; }
        .na-mo { font-size: 9.5px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-top: 1px; }
        .na-selbar { position: fixed; left: 0; right: 0; bottom: var(--na-ck, 0px); z-index: 50; display: flex; align-items: center; gap: 12px; padding: 12px 16px calc(14px + env(safe-area-inset-bottom)); background: #fff; border-top: 1px solid #e2e8f0; box-shadow: 0 -8px 24px rgba(15,61,34,.10); }
        .na-selbar-info { flex: 1; min-width: 0; }
        .na-selbar-k { font-size: 10.5px; font-weight: 700; letter-spacing: .5px; text-transform: uppercase; color: #64748b; }
        .na-selbar-v { font-size: 15px; font-weight: 800; color: #0f172a; margin-top: 1px; }
        .na-selbar-h { font-size: 12px; color: #64748b; margin-top: 1px; }
        .na-selbar-btn { flex-shrink: 0; height: 52px; padding: 0 22px; border: none; border-radius: 12px; background: linear-gradient(135deg, #166534, #1a6b3a); color: #fff; font-size: 15px; font-weight: 800; cursor: pointer; box-shadow: 0 6px 18px rgba(22,101,52,.28); font-family: inherit; }
        .na-fullslots-wrap.has-bar { padding-bottom: calc(140px + var(--na-ck, 0px)); }
        .na-rv { display: flex; justify-content: space-between; gap: 16px; font-size: 14px; color: #334155; padding: 9px 0; }
        .na-rv + .na-rv { border-top: 1px solid #eef2f6; }
        .na-rv b { font-weight: 700; color: #0f172a; text-align: right; }
        .na-secure { text-align: center; font-size: 12px; color: #64748b; margin-top: 10px; }

        /* ── Tablet (touch, wider than a phone) ─────────────────────────── */
        .na-tab .na-tab-cols { display: flex; gap: 20px; align-items: stretch; }
        .na-tab.port .na-tab-cols { flex-direction: column; }
        .is-tablet .na-topbar { padding: 24px 20px 4px; max-width: none; }
        .is-tablet .na-topbar-tabs { width: 400px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 4px; padding: 5px; border-radius: 14px; }
        .is-tablet .na-topbar-tab { height: 46px; padding: 0; font-size: 14px; border-radius: 10px; }
        .is-tablet .na-foot { padding: 48px 24px 44px; }
        .is-tablet .na-shell { margin: 8px 16px 0; }
        .na-tab .na-skel-cell { height: 52px; }
        .na-tab.land .na-skel-cell { height: 44px; }
        .na-fullslots-wrap.na-tab, .na-centerwrap.na-tab { padding: 24px 32px 48px; max-width: none; }
        .na-tab .na-fullslots-card { padding: 20px 14px 18px; }
        .na-tab .na-tab-main { flex: 1; min-width: 0; }
        .na-tab .na-fullslots-scroll { overflow-x: visible; }
        .na-tab .na-fullslots-table { table-layout: fixed; }
        .na-tab .na-fullslots-table { border-spacing: 5px; }
        .na-tab .na-fullslots-table th:first-child { width: 84px; }
        .na-tab .na-fullslots-table td.na-time-col { width: 84px; font-size: 13px; padding: 0 6px; }
        .na-tab .na-slotcell { min-width: 0; height: 52px; font-size: 14px; }
        .na-tab.land .na-slotcell { height: 44px; }
        .na-tab .na-th-m { padding: 0 0 6px !important; }
        .na-tab .na-dn { width: 30px; height: 30px; border-radius: 15px; font-size: 15px; }
        .na-tab-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; margin-bottom: 14px; }
        .na-tab-legend { margin: 0; padding: 0; border: none; max-width: 300px; justify-content: flex-end; gap: 8px 16px; }
        .na-tab-selcard { display: flex; align-items: center; justify-content: space-between; gap: 24px; padding: 20px 24px; background: #fff; border-radius: 22px; box-shadow: 0 20px 50px rgba(15,61,34,.12); }
        .na-tab-selv { font-size: 21px; font-weight: 800; color: #0f172a; margin-top: 3px; }
        .na-tab-cta { flex-shrink: 0; height: 56px; padding: 0 40px; border: none; border-radius: 14px; background: linear-gradient(135deg, #166534, #1a6b3a); color: #fff; font-size: 16px; font-weight: 800; cursor: pointer; box-shadow: 0 8px 22px rgba(22,101,52,.28); font-family: inherit; }
        .na-tab-cta:disabled { opacity: .5; cursor: not-allowed; box-shadow: none; }
        .na-tab-panel { flex-shrink: 0; width: 330px; box-sizing: border-box; padding: 22px; background: #fff; border-radius: 22px; box-shadow: 0 20px 50px rgba(15,61,34,.12); display: flex; flex-direction: column; gap: 14px; }
        .na-tab-panel-title { font-size: 20px; font-weight: 800; color: #0f172a; }
        .na-tab-slotbox { padding: 16px 18px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 14px; }
        .na-tab-slotbox-k { font-size: 11px; font-weight: 700; letter-spacing: .6px; text-transform: uppercase; color: #166534; }
        .na-tab-slotbox-v { font-size: 18px; font-weight: 800; color: #14532d; margin-top: 4px; }
        .na-tab-slotbox-t { font-size: 15px; font-weight: 600; color: #166534; margin-top: 2px; }
        .na-tab-pills { display: grid; grid-template-columns: repeat(auto-fit, minmax(90px, 1fr)); gap: 8px; }
        .na-tab-pill { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; height: 56px; border-radius: 12px; border: 1.5px solid #e2e8f0; background: #fff; color: #334155; font-size: 14px; font-weight: 700; padding: 0; cursor: pointer; font-family: inherit; }
        .na-tab-pill.short { height: 48px; font-size: 13px; }
        .na-tab-pill small { font-size: 12px; font-weight: 600; color: #64748b; }
        .na-tab-pill.on { background: #f0fdf4; border-color: #1a6b3a; color: #15803d; }
        .na-tab-pill.on small { color: #15803d; }
        .na-tab-price { padding: 4px 16px 12px; border: 1px solid #e2e8f0; border-radius: 14px; }
        .na-centerwrap.na-tab .na-card { max-width: 700px; margin: 0 auto; padding: 32px 36px 36px; }
        .na-tab .na-card-inner { max-width: none; }
        .na-tab input.na-inp { height: 52px; font-size: 16px; border-radius: 12px; }
        .na-tab textarea.na-inp { font-size: 16px; border-radius: 12px; }
        .na-tab .na-submit, .na-tab .na-btn-back { height: 56px; padding-top: 0; padding-bottom: 0; border-radius: 14px; font-size: 16px; }
        .na-tab .na-pill { padding: 14px 8px; font-size: 14px; }
        .na-tab .na-step-circle { width: 30px; height: 30px; }

        @media (max-width: 640px) {
          .na-shell { margin: 8px 8px 0; border-radius: 16px; }
          .na-foot { margin-top: 32px; padding: 32px 16px 32px; }
          .na-foot-in { grid-template-columns: 1fr; }
          .na-foot-in > :not(.na-foot-help) { grid-column: 1; }
          .na-foot-help { grid-column: 1; grid-row: auto; order: 5; width: auto; padding: 18px 0 0; margin-top: 20px; border-left: 0; border-top: 1px solid #d5dcd8; }
          .na-foot-brand { order: 6; }
          .na-foot-big { letter-spacing: -.8px; }
          .na-foot-tag { margin-top: 16px; font-size: 13px; }
          .na-topbar { padding: 10px 12px 4px; flex-direction: column; align-items: stretch; }
          .na-skel-cell { height: 44px; }
          .na-topbar-tabs { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 4px; }
          .na-topbar-tab { padding: 0; height: 44px; font-size: 13px; }
          .na-centerwrap, .na-fullslots-wrap { padding: 8px 6px 20px; }
          .na-card { padding: 16px 14px 18px; }
          .na-fullslots-card { padding: 12px 4px 12px; }
          .na-fullslots-scroll { overflow-x: visible; }
          .na-fullslots-table { table-layout: fixed; }
          .na-fullslots-table { border-spacing: 4px; }
          .na-fullslots-table th:first-child { width: 50px; }
          .na-fullslots-table td.na-time-col { width: 50px; padding: 0 2px; font-size: 11px; border-radius: 10px; }
          .na-slotcell { min-width: 0; height: 44px; border-radius: 10px; }
          .na-inp { font-size: 16px; }
          input.na-inp { height: 48px; }
          .na-textarea { min-height: 76px; }
          .na-btn-row { position: sticky; bottom: var(--na-ck, 0px); z-index: 5; margin: 18px -14px -18px; padding: 12px 14px calc(14px + env(safe-area-inset-bottom)); background: #fff; border-top: 1px solid #e2e8f0; border-radius: 0 0 20px 20px; }
          .na-btn-back { height: 52px; padding: 0 20px; }
          .na-submit { height: 52px; padding: 0; }
          .na-fullslots-legend { gap: 8px 14px; }
        }

        /* ── motion ─────────────────────────────────────────────────── */
        @keyframes naPop { 0% { transform: scale(.9); } 55% { transform: scale(1.07); } 100% { transform: scale(1); } }
        @keyframes naSlideUp { from { transform: translateY(100%); opacity: 0; } to { transform: none; opacity: 1; } }
        @keyframes naFadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        @keyframes naRing { 0% { box-shadow: 0 0 0 0 rgba(26,107,58,.35); } 100% { box-shadow: 0 0 0 14px rgba(26,107,58,0); } }
        @keyframes naDraw { to { stroke-dashoffset: 0; } }
        @keyframes naSpin { to { transform: rotate(360deg); } }
        .na-fullslots-table td .na-slotcell { animation: naCellIn .4s ease backwards; animation-delay: calc(var(--na-i, 0) * 14ms); }
        @keyframes naCellIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        button.na-slotcell.selected { animation: naPop .32s ease; }
        .na-selbar { animation: naSlideUp .28s ease; }
        .na-selbar-v, .na-tab-selv { animation: naFadeUp .28s ease; }
        .na-tab-slotbox { animation: naRing .7s ease-out; }
        .na-tab-slotbox-v, .na-tab-slotbox-t { animation: naFadeUp .3s ease; }
        .na-submit[data-busy]::before { content: ""; display: inline-block; width: 14px; height: 14px; margin-right: 9px; vertical-align: -2px; border: 2px solid rgba(255,255,255,.4); border-top-color: #fff; border-radius: 50%; animation: naSpin .7s linear infinite; }

        /* ── booking confirmation ───────────────────────────────────── */
        .na-tick { width: 84px; height: 84px; margin: 0 auto 18px; }
        .na-tick svg { width: 100%; height: 100%; display: block; }
        .na-tick-bg { fill: #dcfce7; transform-origin: 26px 26px; animation: naPop .5s ease; }
        .na-tick-c { fill: none; stroke: #16a34a; stroke-width: 2.5; stroke-linecap: round; stroke-dasharray: 152; stroke-dashoffset: 152; animation: naDraw .6s ease .1s forwards; }
        .na-tick-p { fill: none; stroke: #16a34a; stroke-width: 3.2; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 40; stroke-dashoffset: 40; animation: naDraw .35s ease .55s forwards; }
        .na-ticket { margin-top: 18px; background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; text-align: left; overflow: hidden; box-shadow: 0 8px 24px rgba(15,61,34,.08); }
        .na-ticket-top { display: flex; align-items: center; gap: 16px; padding: 18px; }
        .na-ticket-date { flex: 0 0 auto; width: 68px; border-radius: 14px; background: #1a6b3a; color: #fff; text-align: center; padding: 8px 0 9px; line-height: 1.1; }
        .na-ticket-date span { display: block; font-size: 11px; font-weight: 700; letter-spacing: .6px; text-transform: uppercase; opacity: .85; }
        .na-ticket-date b { display: block; font-size: 26px; font-weight: 800; margin: 2px 0; }
        .na-ticket-time { font-size: 17px; font-weight: 800; color: #0f172a; }
        .na-ticket-sub { font-size: 13px; color: #64748b; margin-top: 3px; }
        .na-ticket-tear { border-top: 2px dashed #e2e8f0; margin: 0 16px; }
        .na-ticket-rows { padding: 10px 18px 14px; }
        .na-ticket-row { display: flex; justify-content: space-between; gap: 14px; font-size: 13px; color: #475569; padding: 5px 0; }
        .na-ticket-row b { color: #0f172a; font-weight: 700; text-align: right; overflow-wrap: anywhere; }
        .na-succ-actions { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px; margin-top: 14px; }
        .na-succ-btn { display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-height: 46px; padding: 0 12px; border-radius: 12px; border: 1.5px solid #bbf7d0; background: #f0fdf4; color: #166534; font-size: 13px; font-weight: 800; text-decoration: none; cursor: pointer; font-family: inherit; transition: all .15s; }
        .na-succ-btn:hover { border-color: #1a6b3a; background: #e3f8ea; }
        .na-succ-hint { font-size: 12.5px; color: #64748b; margin: 14px 0 0 !important; }
        @media (prefers-reduced-motion: reduce) {
          .na-fullslots-table td .na-slotcell, button.na-slotcell.selected, .na-selbar, .na-selbar-v, .na-tab-selv, .na-tab-slotbox, .na-tab-slotbox-v, .na-tab-slotbox-t, .na-tick-bg, .na-step-dot.done .na-step-circle svg { animation: none; }
          .na-tick-c, .na-tick-p { animation: none; stroke-dashoffset: 0; }
          .na-step-line::after { transition: none; }
        }
      ` }} />

      <div className={`na-page ${tablet ? "is-tablet" : ""}`} style={{ "--na-ck": `${cookieH}px` }}>

        <div className="na-topbar">
          <div className="na-topbar-tabs">
            <button type="button" className={`na-topbar-tab ${bookingType === "new" ? "active" : ""}`} onClick={() => switchTab("new")}>New Client</button>
            <button type="button" className={`na-topbar-tab ${bookingType === "followup" ? "active" : ""}`} onClick={() => switchTab("followup")}>Follow-up</button>
            <button type="button" className={`na-topbar-tab ${bookingType === "reschedule" ? "active" : ""}`} onClick={() => switchTab("reschedule")}>Reschedule</button>
          </div>
        </div>

        <div className="na-shell">
        {bookingType === "reschedule" ? (
          <div className={`na-centerwrap ${tablet ? "na-tab" : ""}`}>
            <div className="na-card">
              <div className="na-card-inner">
                {rescheduleDone ? (
                  <BookingSuccess
                    title="All set!"
                    text="Your appointment has been moved to the new time. We've sent a confirmation to your email if you gave us one."
                    dateStr={rescheduleDate}
                    dateLbl={rescheduleDateLabel}
                    slot={rescheduleSlot}
                    rows={[["Time", "New appointment time"]]}
                    format={null}
                    showAddress={false}
                  />
                ) : (
                  <>
                    <div className="na-row" style={{ gridTemplateColumns: "1fr", marginBottom: rescheduleStatus ? 10 : 14 }}>
                      <div>
                        <label className="na-lbl">Phone Number *</label>
                        <input className="na-inp" value={reschedulePhone} onChange={e => handleReschedulePhoneChange(e.target.value)} placeholder="10-digit mobile you booked with" type="tel" inputMode="numeric" maxLength={10} />
                      </div>
                    </div>

                    {rescheduleStatus === "checking" && <div className="na-lookup-box na-lookup-checking">Checking…</div>}
                    {rescheduleStatus === "not-found" && (
                      <div className="na-lookup-box na-lookup-notfound">No upcoming appointment found for this number — check it, or WhatsApp us for help.</div>
                    )}
                    {rescheduleStatus === "found" && rescheduleInfo && (
                      <>
                        <div className="na-lookup-box na-lookup-found">
                          <span><Ic I={CalendarMonthRounded} /> Currently: {rescheduleInfo.date} at {rescheduleInfo.slot}</span>
                        </div>

                        <SlotsTable
                          matrix={{ ...rescheduleMatrix, onPick: handleReschedulePickSlot }}
                          loading={rescheduleMatrixLoading}
                          isMobile={isMobile}
                          isTablet={tablet}
                          selected={rescheduleDate && rescheduleSlot ? { date: rescheduleDate, slot: rescheduleSlot } : null}
                          header={<div className="na-section-label" style={{ marginBottom: isMobile ? 0 : 12 }}>Pick a new date &amp; time</div>}
                          disableLastMinute
                        />
                        {rescheduleDate && rescheduleSlot && (
                          <div className="na-lookup-box na-lookup-found" style={{ marginTop: 14, marginBottom: 0 }}>
                            <span>New time: {rescheduleDateLabel.weekday}, {rescheduleDateLabel.day} {rescheduleDateLabel.month} · {rescheduleSlot}</span>
                          </div>
                        )}
                      </>
                    )}

                    {rescheduleError && <div className="na-error" style={{ marginTop: 12 }}><Ic I={WarningAmberRounded} /> {rescheduleError}</div>}

                    {rescheduleStatus === "found" && (
                      <button type="button" className="na-submit" style={{ marginTop: 10 }} disabled={rescheduleSubmitting || !rescheduleSlot} onClick={submitReschedule}>
                        {rescheduleSubmitting ? "Rescheduling…" : "Confirm New Time"}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ) : phase === "identify" ? (
          <div className={`na-centerwrap ${tablet ? "na-tab" : ""}`}>
            <div className="na-card">
              <div className="na-card-inner">
                <div className="na-section-label" style={{ marginBottom: 16 }}>Let's find you first</div>
                <div className="na-row" style={{ gridTemplateColumns: "1fr", marginBottom: lookupStatus ? 10 : 14 }}>
                  <div>
                    <label className="na-lbl">Phone Number *</label>
                    <input className="na-inp" value={form.phone} onChange={e => handlePhoneChange(e.target.value)} placeholder="10-digit mobile you booked with before" type="tel" inputMode="numeric" maxLength={10} />
                  </div>
                </div>
                {lookupStatus === "checking" && <div className="na-lookup-box na-lookup-checking">Checking…</div>}
                {lookupStatus === "found" && !manualOverride && (
                  <div className="na-lookup-box na-lookup-found">
                    <span>
                      <Ic I={WavingHandRounded} /> Welcome back, {foundName}!
                      {usingCredit && ` You have ${credit.sessionsRemaining} session(s) left${credit.packageName ? ` on ${credit.packageName}` : ""} — no payment needed.`}
                    </span>
                    <button type="button" className="na-lookup-link" onClick={() => setManualOverride(true)}>Not you?</button>
                  </div>
                )}
                {(lookupStatus === "not-found" || (lookupStatus === "found" && manualOverride)) && (
                  <div className="na-lookup-box na-lookup-notfound">
                    {lookupStatus === "not-found" ? "New here — please add your details below." : "No problem, please add your details below."}
                  </div>
                )}
                {needsFullDetails && form.phone.length === 10 && (
                  <div className="na-row">
                    <div>
                      <label className="na-lbl">Full Name *</label>
                      <input className="na-inp" value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Priya Sharma" />
                    </div>
                    <div>
                      <label className="na-lbl">Age</label>
                      <input className="na-inp" value={form.age} onChange={e => set("age", e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="e.g. 27" inputMode="numeric" />
                    </div>
                  </div>
                )}
                {form.phone.length === 10 && (
                  <div className="na-row" style={{ gridTemplateColumns: "1fr" }}>
                    <div>
                      <label className="na-lbl">Email <span style={{ fontWeight: 400, textTransform: "none", color: "#64748b" }}>(optional, for confirmation)</span></label>
                      <input className="na-inp" value={form.email} onChange={e => set("email", e.target.value)} placeholder="your@email.com" type="email" />
                    </div>
                  </div>
                )}
                {form.phone.length === 10 && (
                  <div className="na-row" style={{ gridTemplateColumns: "1fr" }}>
                    <div>
                      <label className="na-lbl">Major Concern <span style={{ fontWeight: 400, textTransform: "none", color: "#64748b" }}>(optional)</span></label>
                      <textarea className="na-inp na-textarea" rows={2} value={form.concern} onChange={e => set("concern", e.target.value)} placeholder="Briefly describe what you're going through…" />
                    </div>
                  </div>
                )}

                {error && <div className="na-error"><Ic I={WarningAmberRounded} /> {error}</div>}
                <div className="na-btn-row"><button type="button" className="na-submit" onClick={goToIdentifySlots}>Continue →</button></div>
              </div>
            </div>
          </div>
        ) : phase === "slots" ? (
          <div className={`na-fullslots-wrap ${isMobile && pendingPick ? "has-bar" : ""} ${tablet ? `na-tab ${landscape ? "land" : "port"}` : ""}`}>
            <div className="na-tab-cols">
            <div className="na-fullslots-card na-tab-main">
              {slotNotice && (
                <div className="na-error" role="alert" style={{ marginBottom: 14, display: "flex", gap: 10, alignItems: "flex-start", justifyContent: "space-between" }}>
                  <span><Ic I={WarningAmberRounded} /> {slotNotice}</span>
                  <button type="button" aria-label="Dismiss" onClick={() => setSlotNotice("")} style={{ background: "none", border: "none", color: "inherit", fontSize: 18, lineHeight: 1, cursor: "pointer", padding: "0 4px", fontFamily: "inherit" }}><Ic I={CloseRounded} s={18} /></button>
                </div>
              )}
              <SlotsTable
                matrix={{ ...slotsMatrix, onPick: usePendingPick ? (d, s, lm) => setPendingPick({ date: d, slot: s, isLM: lm }) : handlePickSlot }}
                loading={slotsMatrixLoading}
                isMobile={isMobile}
                isTablet={tablet}
                selected={usePendingPick ? pendingPick : (selectedDate && selectedSlot ? { date: selectedDate, slot: selectedSlot } : null)}
                header={isMobile ? (
                  <div className="na-fullslots-title">Pick a slot</div>
                ) : tablet ? (
                  <div className="na-tab-head">
                    <div>
                      <div className="na-fullslots-title" style={{ fontSize: 20 }}>Pick an open slot</div>
                      <div className="na-fullslots-sub" style={{ marginBottom: 0 }}>{bookingType === "followup" ? "Follow-up" : "New client"} · next {MATRIX_DAYS} open days · times in IST</div>
                    </div>
                    <div className="na-fullslots-legend na-tab-legend">
                      <span><i className="na-sw na-sw-open" /> Open</span>
                      <span><i className="na-sw na-sw-lm" /> Starting soon</span>
                      <span><i className="na-sw na-sw-taken" /> Booked</span>
                      <span><i className="na-sw na-sw-past" /> Passed</span>
                      <span><i className="na-sw-closed" /> Not open</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="na-fullslots-title">Pick an open slot to start booking</div>
                    <div className="na-fullslots-sub">{bookingType === "followup" ? "Follow-up" : "New client"} availability — next {MATRIX_DAYS} open days</div>
                  </>
                )}
              />

              {!tablet && (
                <div className="na-fullslots-legend">
                  <span><i className="na-sw na-sw-open" /> Open{isMobile ? "" : " — tap to book"}</span>
                  <span><i className="na-sw na-sw-lm" /> Starting soon{isMobile ? "" : " — needs a quick OK from us"}</span>
                  <span><i className="na-sw na-sw-taken" /> Booked</span>
                  <span><i className="na-sw na-sw-past" /> Passed</span>
                  <span><i className="na-sw-closed" /> Not open</span>
                </div>
              )}
            </div>

            {tablet && (() => {
              const lbl = pendingPick ? dateLabel(pendingPick.date) : null;
              const go = () => pendingPick && handlePickSlot(pendingPick.date, pendingPick.slot, pendingPick.isLM);
              const cta = pendingPick?.isLM ? "Send request" : "Continue";
              if (!landscape) {
                return (
                  <div className="na-tab-selcard">
                    <div>
                      <div className="na-selbar-k">Selected</div>
                      <div className="na-tab-selv" key={pendingPick ? pendingPick.date + pendingPick.slot : "none"}>{lbl ? `${lbl.weekday}, ${lbl.day} ${lbl.month} · ${pendingPick.slot}` : "Tap an open slot to continue"}</div>
                      <div className="na-selbar-h">{pendingPick?.isLM ? "Starts within 15 min — the center confirms first" : "50–60 min session · Sector 51, Noida"}</div>
                    </div>
                    <button type="button" className="na-tab-cta" disabled={!pendingPick} onClick={go}>{cta}</button>
                  </div>
                );
              }
              return (
                <div className="na-tab-panel">
                  <div className="na-tab-panel-title">Your booking</div>
                  <div className="na-tab-slotbox" key={pendingPick ? pendingPick.date + pendingPick.slot : "none"}>
                    <div className="na-tab-slotbox-k">Selected slot</div>
                    {lbl ? (
                      <>
                        <div className="na-tab-slotbox-v">{lbl.weekday}, {lbl.day} {lbl.month}</div>
                        <div className="na-tab-slotbox-t">{pendingPick.slot}</div>
                      </>
                    ) : (
                      <div className="na-tab-slotbox-t" style={{ marginTop: 6 }}>Tap an open slot in the table</div>
                    )}
                  </div>

                  {usingCredit ? (
                    <div className="na-lookup-box na-lookup-found" style={{ marginBottom: 0 }}>
                      <span><Ic I={ConfirmationNumberRounded} /> Uses 1 of your {credit.sessionsRemaining} remaining session(s) — no payment.</span>
                    </div>
                  ) : (
                    <>
                      <div>
                        <div className="na-section-label" style={{ marginBottom: 8 }}>Session · 50–60 min</div>
                        <div className="na-tab-pills">
                          <button type="button" className={`na-tab-pill ${sessionMode === "individual" ? "on" : ""}`} onClick={() => setSessionMode("individual")}>Individual<small>₹{pricing?.[priceFieldFor("individual", format)] ?? "—"}</small></button>
                          <button type="button" className={`na-tab-pill ${sessionMode === "couple" ? "on" : ""}`} onClick={() => setSessionMode("couple")}>Couple<small>₹{pricing?.[priceFieldFor("couple", format)] ?? "—"}</small></button>
                          {(pricing?.packages || []).length > 0 && (
                            <button type="button" className={`na-tab-pill ${sessionMode === "package" ? "on" : ""}`} onClick={() => setSessionMode("package")}>Package<small>{pricing.packages.length} available</small></button>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="na-section-label" style={{ marginBottom: 8 }}>Mode</div>
                        <div className="na-tab-pills">
                          <button type="button" className={`na-tab-pill short ${format === "in-person" ? "on" : ""}`} onClick={() => setFormat("in-person")}>In-person</button>
                          <button type="button" className={`na-tab-pill short ${format === "online" ? "on" : ""}`} onClick={() => setFormat("online")}>Online</button>
                          <button type="button" className={`na-tab-pill short ${format === "home-visit" ? "on" : ""}`} onClick={() => setFormat("home-visit")}>Home Visit</button>
                        </div>
                      </div>
                      <div className="na-tab-price">
                        {sessionMode === "package" && !selectedPackage ? (
                          <div className="na-selbar-h" style={{ padding: "10px 0 6px" }}>You'll choose a package in the next step.</div>
                        ) : (
                          <>
                            <div className="na-rv"><span>{sessionMode === "package" ? selectedPackage?.name : `${sessionMode === "couple" ? "Couple" : "Individual"} session`}</span><b>₹{baseAmount}</b></div>
                            <div className="na-rv" style={{ borderTop: "none", paddingTop: 0 }}><span>Platform fee</span><b>₹{platformFee}</b></div>
                            <div className="na-price-total" style={{ fontSize: 22, alignItems: "baseline", borderTop: "1px dashed #cbd5e1", paddingTop: 10 }}><span>Total</span><span>₹{totalAmount}</span></div>
                          </>
                        )}
                        {format === "home-visit" && <div className="na-selbar-h" style={{ marginTop: 8 }}>Home visit charges may increase with distance.</div>}
                      </div>
                    </>
                  )}

                  <div style={{ flexGrow: 1 }} />
                  <button type="button" className="na-tab-cta" style={{ width: "100%" }} disabled={!pendingPick} onClick={go}>{cta}</button>
                </div>
              );
            })()}
            </div>
          </div>
        ) : (
          <div className={`na-centerwrap ${tablet ? "na-tab" : ""}`}>
            <div className="na-card">
              <div className="na-card-inner">
                {status === "success" ? (
                  <BookingSuccess
                    title={`You're all set, ${(effectiveName || "there").split(" ")[0]}!`}
                    text="Your appointment at our Noida center is confirmed. We'll see you there."
                    dateStr={selectedDate}
                    dateLbl={pickedDateLabel}
                    slot={selectedSlot}
                    rows={[
                      ["Session", `${modeLabel} · ${formatLabel}`],
                      [usingCredit ? "Payment" : "Amount paid", usingCredit ? `Package session used (${credit.sessionsRemaining - 1} remaining)` : `₹${totalAmount}`],
                      ...(form.email ? [["Confirmation sent to", form.email]] : []),
                    ]}
                    format={format}
                    showAddress={format !== "online"}
                  />
                ) : (
                  <>
                    <div className="na-picked-banner">
                      <span><Ic I={CalendarMonthRounded} /> {pickedDateLabel ? `${pickedDateLabel.weekday}, ${pickedDateLabel.day} ${pickedDateLabel.month}` : selectedDate} · {selectedSlot}{selectedIsLastMinute && <> · <Ic I={BoltRounded} /> Last-minute</>}</span>
                      <button type="button" className="na-picked-change" onClick={() => { resetLastMinute(); setPhase("slots"); }}>Change</button>
                    </div>

                    <div className="na-steps">
                      {STEP_LABELS.map((label, i) => {
                        const n = i + 1;
                        const state = n < step ? "done" : n === step ? "active" : "";
                        return (
                          <React.Fragment key={label}>
                            <div className={`na-step-dot ${state}`}>
                              <div className="na-step-circle">{n < step ? <Ic I={CheckRounded} s={15} /> : n}</div>
                              <div className="na-step-label">{label}</div>
                            </div>
                            {i < STEP_LABELS.length - 1 && <div className={`na-step-line ${n < step ? "done" : ""}`} />}
                          </React.Fragment>
                        );
                      })}
                    </div>

                    {step === 1 && (
                      <>
                        {bookingType === "followup" ? (
                          <>
                            <div className="na-row" style={{ gridTemplateColumns: "1fr", marginBottom: lookupStatus ? 10 : 14 }}>
                              <div>
                                <label className="na-lbl">Phone Number *</label>
                                <input className="na-inp" value={form.phone} onChange={e => handlePhoneChange(e.target.value)} placeholder="10-digit mobile you booked with before" type="tel" inputMode="numeric" maxLength={10} />
                              </div>
                            </div>
                            {lookupStatus === "checking" && <div className="na-lookup-box na-lookup-checking">Checking…</div>}
                            {lookupStatus === "found" && !manualOverride && (
                              <div className="na-lookup-box na-lookup-found">
                                <span><Ic I={WavingHandRounded} /> Welcome back, {foundName}!{usingCredit && ` You have ${credit.sessionsRemaining} session(s) left${credit.packageName ? ` on ${credit.packageName}` : ""} — no payment needed.`}</span>
                                <button type="button" className="na-lookup-link" onClick={() => setManualOverride(true)}>Not you?</button>
                              </div>
                            )}
                            {(lookupStatus === "not-found" || (lookupStatus === "found" && manualOverride)) && (
                              <div className="na-lookup-box na-lookup-notfound">New here — please add your details below.</div>
                            )}
                            {needsFullDetails && form.phone.length === 10 && (
                              <div className="na-row">
                                <div>
                                  <label className="na-lbl">Full Name *</label>
                                  <input className="na-inp" value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Priya Sharma" />
                                </div>
                                <div>
                                  <label className="na-lbl">Age</label>
                                  <input className="na-inp" value={form.age} onChange={e => set("age", e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="e.g. 27" inputMode="numeric" />
                                </div>
                              </div>
                            )}
                            {form.phone.length === 10 && (
                              <div className="na-row" style={{ gridTemplateColumns: "1fr" }}>
                                <div>
                                  <label className="na-lbl">Email <span style={{ fontWeight: 400, textTransform: "none", color: "#64748b" }}>(optional)</span></label>
                                  <input className="na-inp" value={form.email} onChange={e => set("email", e.target.value)} placeholder="your@email.com" type="email" />
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="na-row">
                              <div>
                                <label className="na-lbl">Full Name *</label>
                                <input className="na-inp" value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Priya Sharma" />
                              </div>
                              <div>
                                <label className="na-lbl">Age</label>
                                <input className="na-inp" value={form.age} onChange={e => set("age", e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="e.g. 27" inputMode="numeric" />
                              </div>
                            </div>
                            <div className="na-row">
                              <div>
                                <label className="na-lbl">Phone Number *</label>
                                <input className="na-inp" value={form.phone} onChange={e => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit mobile" type="tel" inputMode="numeric" maxLength={10} />
                              </div>
                              <div>
                                <label className="na-lbl">Email <span style={{ fontWeight: 400, textTransform: "none", color: "#64748b" }}>(optional)</span></label>
                                <input className="na-inp" value={form.email} onChange={e => set("email", e.target.value)} placeholder="your@email.com" type="email" />
                              </div>
                            </div>
                          </>
                        )}

                        {(bookingType === "new" || form.phone.length === 10) && (
                          <div className="na-row" style={{ gridTemplateColumns: "1fr" }}>
                            <div>
                              <label className="na-lbl">Major Concern <span style={{ fontWeight: 400, textTransform: "none", color: "#64748b" }}>(optional)</span></label>
                              <textarea className="na-inp na-textarea" rows={2} value={form.concern} onChange={e => set("concern", e.target.value)} placeholder="Briefly describe what you're going through…" />
                            </div>
                          </div>
                        )}

                        {error && <div className="na-error"><Ic I={WarningAmberRounded} /> {error}</div>}
                        <div className="na-btn-row"><button type="button" className="na-submit" onClick={goToStep2}>Continue →</button></div>
                      </>
                    )}

                    {step === 2 && (
                      <>
                        {usingCredit ? (
                          <div className="na-lookup-box na-lookup-found" style={{ marginBottom: 18 }}>
                            <span><Ic I={ConfirmationNumberRounded} /> Using 1 of your {credit.sessionsRemaining} remaining session(s){credit.packageName ? ` on ${credit.packageName}` : ""} — no payment for this booking.</span>
                          </div>
                        ) : (
                          <>
                            <div className="na-section-label">Choose Format (50–60 min session)</div>
                            <div className="na-pill-row">
                              <div className={`na-pill ${sessionMode === "individual" ? "active" : ""}`} onClick={() => setSessionMode("individual")}>
                                Individual
                                <span className="na-pill-price">₹{pricing?.[priceFieldFor("individual", format)] ?? "—"}</span>
                              </div>
                              <div className={`na-pill ${sessionMode === "couple" ? "active" : ""}`} onClick={() => setSessionMode("couple")}>
                                Couple
                                <span className="na-pill-price">₹{pricing?.[priceFieldFor("couple", format)] ?? "—"}</span>
                              </div>
                              {(pricing?.packages || []).length > 0 && (
                                <div className={`na-pill ${sessionMode === "package" ? "active" : ""}`} onClick={() => setSessionMode("package")}>
                                  Package
                                  <span className="na-pill-price">{pricing.packages.length} available</span>
                                </div>
                              )}
                            </div>

                            {sessionMode === "package" && (
                              <div className="na-pkg-card-row">
                                {(pricing?.packages || []).map(pkg => (
                                  <div
                                    key={pkg._id}
                                    className={`na-pkg-card ${selectedPackageId === pkg._id ? "active" : ""}`}
                                    onClick={() => setSelectedPackageId(pkg._id)}
                                  >
                                    <div>
                                      <div className="na-pkg-card-name">{pkg.name}</div>
                                      <div className="na-pkg-card-meta">{pkg.sessionsCount} sessions</div>
                                    </div>
                                    <div className="na-pkg-card-price">₹{pkg.price}</div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        )}

                        <div className="na-section-label">Mode</div>
                        <div className="na-pill-row">
                          <div className={`na-pill ${format === "in-person" ? "active" : ""}`} onClick={() => setFormat("in-person")}>In-person</div>
                          <div className={`na-pill ${format === "online" ? "active" : ""}`} onClick={() => setFormat("online")}>Online</div>
                          <div className={`na-pill ${format === "home-visit" ? "active" : ""}`} onClick={() => setFormat("home-visit")}>Home Visit</div>
                        </div>

                        {format === "home-visit" && (
                          <div className="na-row" style={{ gridTemplateColumns: "1fr" }}>
                            <div>
                              <label className="na-lbl">Address in Noida *</label>
                              <textarea className="na-inp na-textarea" rows={2} value={address} onChange={e => setAddress(e.target.value)} placeholder="Flat / House no., Street, Sector, Landmark…" />
                            </div>
                            <div className="na-lookup-box na-lookup-notfound" style={{ marginTop: 10, marginBottom: 0 }}>
                              <span><Ic I={InfoOutlined} /> Home visit charges may increase depending on distance from our Noida center — we'll confirm the final amount with you before your session.</span>
                            </div>
                          </div>
                        )}

                        {error && <div className="na-error"><Ic I={WarningAmberRounded} /> {error}</div>}
                        <div className="na-btn-row">
                          <button type="button" className="na-btn-back" onClick={() => bookingType === "followup" ? setPhase("slots") : setStep(1)}>Back</button>
                          <button type="button" className="na-submit" onClick={goToPayment}>Continue →</button>
                        </div>
                      </>
                    )}

                    {step === 3 && (
                      <>
                        <div className="na-section-label">Review &amp; pay</div>
                        <div className="na-review" style={{ lineHeight: 1.5, padding: "6px 16px" }}>
                          <div className="na-rv"><span>Name</span><b>{effectiveName || "—"}</b></div>
                          <div className="na-rv"><span>Phone</span><b>{form.phone}</b></div>
                          <div className="na-rv"><span>Session</span><b>{modeLabel} · {formatLabel}</b></div>
                          {format === "home-visit" && <div className="na-rv"><span>Address</span><b>{address}</b></div>}
                          <div className="na-rv"><span>Date</span><b>{pickedDateLabel ? `${pickedDateLabel.weekday}, ${pickedDateLabel.day} ${pickedDateLabel.month}` : selectedDate}</b></div>
                          <div className="na-rv"><span>Time</span><b>{selectedSlot}</b></div>
                          {form.concern && <div className="na-rv"><span>Concern</span><b>{form.concern}</b></div>}
                          {usingCredit ? (
                            <div className="na-price-breakdown">
                              <div className="na-rv"><span>Package session</span><b>1 of {credit.sessionsRemaining} remaining</b></div>
                              <div className="na-price-total"><span>Amount due</span><span>₹0</span></div>
                            </div>
                          ) : (
                            <div className="na-price-breakdown" style={{ paddingBottom: 10 }}>
                              <div className="na-rv"><span>{modeLabel === "Package" ? selectedPackage?.name : `${modeLabel} session`}</span><b>₹{baseAmount}</b></div>
                              <div className="na-rv" style={{ borderTop: "none", paddingTop: 0 }}><span>Platform fee</span><b>₹{platformFee}</b></div>
                              <div className="na-price-total" style={{ fontSize: 18, alignItems: "baseline" }}><span>Total</span><span>₹{totalAmount}</span></div>
                            </div>
                          )}
                        </div>

                        {error && <div className="na-error"><Ic I={WarningAmberRounded} /> {error}</div>}

                        {selectedIsLastMinute && lastMinuteStatus !== "accepted" ? (
                          <>
                            <div className="na-lastmin-box">
                              {lastMinuteStatus === "pending" ? (
                                <>
                                  <div className="na-lastmin-title"><Ic I={HourglassTopRounded} /> Waiting for the center to confirm</div>
                                  <div className="na-lastmin-text">
                                    We'll unlock payment the moment they accept — expires in{" "}
                                    {mmss(Math.max(0, (lastMinuteExpiresIn ?? 0) - (lastMinutePolledAt ? (nowTick - lastMinutePolledAt) / 1000 : 0)))}.
                                  </div>
                                </>
                              ) : lastMinuteStatus === "rejected" || lastMinuteStatus === "expired" ? (
                                <>
                                  <div className="na-lastmin-title">
                                    {lastMinuteStatus === "rejected" ? "This request wasn't accepted" : "This request timed out"}
                                  </div>
                                  <div className="na-lastmin-text">Please pick another slot.</div>
                                  <button type="button" className="na-btn-back" style={{ marginTop: 12 }} onClick={() => { resetLastMinute(); setPhase("slots"); }}>Choose another slot</button>
                                </>
                              ) : (
                                <>
                                  <div className="na-lastmin-title"><Ic I={BoltRounded} /> This slot starts very soon</div>
                                  <div className="na-lastmin-text">
                                    It's inside our last-minute window, so we need the center to confirm they can take you before you pay.
                                    {(() => {
                                      const secondsToStart = Math.round((slotStartInstant(selectedDate, selectedSlot).getTime() - nowTick) / 1000);
                                      return secondsToStart <= 120 && secondsToStart > 0 ? (
                                        <strong style={{ color: "#b91c1c", display: "block", marginTop: 6 }}>
                                          Closing in {mmss(secondsToStart)} — send your request now.
                                        </strong>
                                      ) : null;
                                    })()}
                                  </div>
                                  <button type="button" className="na-submit" style={{ marginTop: 12 }} disabled={lastMinuteSending} onClick={handleSendLastMinuteRequest}>
                                    {lastMinuteSending ? "Sending…" : "Send Request"}
                                  </button>
                                </>
                              )}
                            </div>
                            <div className="na-btn-row">
                              <button type="button" className="na-btn-back" onClick={goBackFromPay}>Back</button>
                            </div>
                          </>
                        ) : usingCredit ? (
                          <div className="na-btn-row">
                            <button type="button" className="na-btn-back" onClick={goBackFromPay}>Back</button>
                            <button type="button" className="na-submit" data-busy={status === "loading" ? "1" : undefined} disabled={status === "loading"} onClick={handleConfirmCredit}>
                              {status === "loading" ? "Booking…" : "Confirm Booking"}
                            </button>
                          </div>
                        ) : (
                          <>
                          <div className="na-secure">Secure checkout by Razorpay — UPI, cards &amp; netbanking</div>
                          <div className="na-btn-row">
                            <button type="button" className="na-btn-back" onClick={goBackFromPay}>Back</button>
                            <button type="button" className="na-submit" data-busy={status === "loading" ? "1" : undefined} disabled={status === "loading"} onClick={handleRazorpay}>
                              {status === "loading" ? "Opening payment…" : `Pay ₹${totalAmount} & Confirm`}
                            </button>
                          </div>
                          </>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        </div>

        <footer className="na-foot">
          <div className="na-foot-in">
            <div className="na-foot-help">
              <div className="na-foot-help-title">Need help booking?</div>
              <p className="na-foot-help-text">Stuck at any step or unsure which session fits? Message us and we'll sort it out.</p>
              <a className="na-wa-btn" href={waLink("Hi, I need help with booking at the Noida center.")} target="_blank" rel="noopener noreferrer"><Ic I={WhatsAppIcon} s={18} /> Chat on WhatsApp</a>
            </div>
            <div className="na-foot-big" aria-hidden="true">In-person therapy,<br />confirmed instantly.</div>
            <p className="na-foot-tag">Our Noida center. Pick a slot, pay, and your session is booked.</p>
            <ul className="na-foot-list">
              <li><Ic I={ScheduleRounded} /> 50–60 min session</li>
              <li>
                {pricing
                  ? <><Ic I={CurrencyRupeeRounded} /> Individual ₹{pricing.individual_inperson} · Couple ₹{pricing.couple_inperson}</>
                  : <span className="na-skel na-skel-chip" aria-hidden="true" />}
              </li>
              <li><Ic I={PlaceRounded} /> Sector 51, Noida</li>
              <li><Ic I={DirectionsRounded} /> <a className="na-foot-link" href={MAPS_URL} target="_blank" rel="noopener noreferrer">Get directions</a></li>
            </ul>
            <p className="na-foot-note"><Ic I={PlaceRounded} s={15} /> Gate No-3, D-137, near LPS Global School, Block D, Sector 51, Noida 201301</p>
            <p className="na-foot-note"><Ic I={InfoOutlined} s={15} /> Need a different time? Use the Reschedule tab. To cancel, WhatsApp us.</p>
            <div className="na-foot-brand">Choose Your Therapist · Know Expertise Before Choose</div>
          </div>
        </footer>

        {isMobile && phase === "slots" && bookingType !== "reschedule" && pendingPick && (() => {
          const lbl = dateLabel(pendingPick.date);
          return (
            <div className="na-selbar" role="region" aria-label="Selected slot">
              <div className="na-selbar-info">
                <div className="na-selbar-k">Selected</div>
                <div className="na-selbar-v" key={pendingPick.date + pendingPick.slot}>{lbl.weekday}, {lbl.day} {lbl.month} · {shortTime(pendingPick.slot)}</div>
                <div className="na-selbar-h">{pendingPick.isLM ? "Starts within 15 min — the center confirms first" : "50–60 min session · Sector 51, Noida"}</div>
              </div>
              <button type="button" className="na-selbar-btn" onClick={() => handlePickSlot(pendingPick.date, pendingPick.slot, pendingPick.isLM)}>
                {pendingPick.isLM ? "Send request" : "Continue"}
              </button>
            </div>
          );
        })()}
      </div>
    </>
  );
}
