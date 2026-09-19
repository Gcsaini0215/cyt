import React, { useState, useEffect, useCallback, useRef } from "react";
import Head from "next/head";
import Script from "next/script";
import { apiUrl } from "../utils/url";

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
  if (loading) return <>{header}<div className="na-fullslots-empty">Loading…</div></>;
  if (!matrix.dates.length) return <>{header}<div className="na-fullslots-empty">No slots are open right now — please WhatsApp us and we'll set one up.</div></>;

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
              if (!compact) return <th key={d}>{lbl.weekday}<br />{lbl.day} {lbl.month}</th>;
              const isToday = d === today;
              return (
                <th key={d} className="na-th-m">
                  <div className="na-wd">{isToday ? "Today" : lbl.weekday}</div>
                  <div className={`na-dn ${isToday ? "today" : ""}`}>{lbl.day}</div>
                  {(i === 0 || lbl.day === 1) && <div className="na-mo">{lbl.month}</div>}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {matrix.times.map(t => (
            <tr key={t}>
              <td className="na-time-col">{compact ? shortTime(t) : t.split(" - ")[0]}</td>
              {visibleDates.map(d => {
                const state = matrix.grid[`${d}|${t}`];
                const isSelected = selected && selected.date === d && selected.slot === t;
                if (state === "lastMinute" && disableLastMinute) {
                  return (
                    <td key={d}>
                      <span className="na-slotcell closed" title="Starting too soon to reschedule into">–</span>
                    </td>
                  );
                }
                if (state === "open" || state === "lastMinute") {
                  const isLM = state === "lastMinute";
                  return (
                    <td key={d}>
                      <button
                        type="button"
                        className={`na-slotcell ${isLM ? "lastminute" : "open"} ${isSelected ? "selected" : ""}`}
                        title={isSelected ? `Selected — ${t}` : isLM ? `Request ${t} — starting soon` : `Book ${t}`}
                        onClick={() => matrix.onPick(d, t, isLM)}
                      >
                        {isSelected ? "✓" : isLM ? "!" : ""}
                      </button>
                    </td>
                  );
                }
                const label = state === "taken" ? "Booked" : state === "past" ? "Time has passed" : "Not opened";
                return (
                  <td key={d}>
                    <span className={`na-slotcell ${state === "past" ? "closed" : (state || "closed")}`} title={label}>
                      {state === "taken" ? <span className="na-taken-stamp">Booked</span> : state === "past" ? <span className="na-past-label">Passed</span> : "–"}
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
        }),
      });
      const orderData = await orderRes.json();
      if (!orderData.status) {
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </Head>

      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      <style dangerouslySetInnerHTML={{ __html: `
        .na-page { font-family: 'Inter', sans-serif; background: #f4f6f5; min-height: 100vh; }

        .na-topbar { max-width: 1100px; margin: 0 auto; padding: 18px 20px 4px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
        .na-topbar-tabs { display: flex; gap: 6px; background: #fff; border-radius: 12px; padding: 5px; box-shadow: 0 4px 16px rgba(15,61,34,.08); }
        .na-topbar-tab { border: none; background: none; padding: 9px 18px; border-radius: 8px; font-size: 13px; font-weight: 800; color: #64748b; cursor: pointer; transition: all .15s; white-space: nowrap; }
        .na-topbar-tab.active { background: #1a6b3a; color: #fff; }
        .na-topbar-brand { font-size: 11px; font-weight: 300; letter-spacing: 1.5px; text-transform: uppercase; color: #a3aca6; }

        .na-centerwrap { max-width: 1100px; margin: 0 auto; padding: 20px 20px 60px; }
        .na-card-inner { max-width: 560px; margin: 0 auto; }
        .na-card { background: #fff; border-radius: 20px; box-shadow: 0 20px 50px rgba(15,61,34,.14); padding: 28px 24px 32px; }

        .na-picked-banner { display: flex; align-items: center; justify-content: space-between; gap: 10px; background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; border-radius: 12px; padding: 10px 14px; font-size: 13px; font-weight: 700; margin-bottom: 18px; }
        .na-picked-change { background: none; border: none; color: #1a6b3a; font-size: 12px; font-weight: 800; text-decoration: underline; cursor: pointer; flex-shrink: 0; }

        .na-fullslots-wrap { max-width: 1100px; margin: 0 auto; padding: 20px 20px 60px; }
        .na-fullslots-card { background: #fff; border-radius: 20px; box-shadow: 0 20px 50px rgba(15,61,34,.14); padding: 26px 26px 22px; }
        .na-fullslots-title { font-size: 16px; font-weight: 800; color: #0f172a; }
        .na-fullslots-sub { font-size: 12.5px; color: #94a3b8; margin-top: 3px; margin-bottom: 18px; }
        .na-fullslots-scroll { overflow-x: auto; }
        .na-fullslots-table { width: 100%; border-collapse: collapse; }
        .na-fullslots-table th { font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; padding: 6px 5px 10px; text-align: center; white-space: nowrap; line-height: 1.4; }
        .na-fullslots-table td { padding: 3px; text-align: center; }
        .na-fullslots-table td.na-time-col { text-align: left; font-size: 12.5px; font-weight: 700; color: #334155; white-space: nowrap; padding-right: 14px; }
        .na-slotcell { display: flex; align-items: center; justify-content: center; width: 100%; min-width: 68px; height: 34px; border-radius: 9px; border: 1.5px solid transparent; font-size: 13px; font-weight: 800; cursor: default; box-sizing: border-box; font-family: inherit; }
        button.na-slotcell.open { background: #f0fdf4; border-color: #bbf7d0; color: #15803d; cursor: pointer; transition: all .15s; }
        button.na-slotcell.open:hover { background: #1a6b3a; border-color: #1a6b3a; color: #fff; transform: translateY(-1px); }
        button.na-slotcell.open.selected { background: #1a6b3a; border-color: #1a6b3a; color: #fff; box-shadow: 0 0 0 3px rgba(26,107,58,.2); }
        button.na-slotcell.open.selected:hover { transform: none; }
        button.na-slotcell.lastminute { background: #fffbeb; border-color: #fde68a; color: #b45309; cursor: pointer; transition: all .15s; }
        button.na-slotcell.lastminute:hover { background: #f59e0b; border-color: #f59e0b; color: #fff; transform: translateY(-1px); }
        button.na-slotcell.lastminute.selected { background: #f59e0b; border-color: #f59e0b; color: #fff; box-shadow: 0 0 0 3px rgba(245,158,11,.25); }
        button.na-slotcell.lastminute.selected:hover { transform: none; }
        .na-slotcell.taken { background: #fef2f2; border-color: #fecaca; color: #fca5a5; overflow: hidden; }
        .na-past-label { font-size: 9px; font-weight: 700; letter-spacing: .4px; color: #cbd5e1; text-transform: uppercase; }
        .na-taken-stamp { display: inline-block; transform: rotate(-18deg); font-size: 9px; font-weight: 900; letter-spacing: .4px; color: #dc2626; text-transform: uppercase; white-space: nowrap; }
        .na-slotcell.closed { background: #f8fafc; color: #e2e8f0; }
        .na-fullslots-legend { display: flex; gap: 16px; flex-wrap: wrap; margin-top: 18px; padding-top: 14px; border-top: 1px solid #f1f5f9; }
        .na-fullslots-legend span { display: inline-flex; align-items: center; gap: 6px; font-size: 11.5px; color: #64748b; font-weight: 600; }
        .na-fullslots-legend i { display: inline-block; width: 11px; height: 11px; border-radius: 3px; }
        .na-fullslots-empty { font-size: 13px; color: #94a3b8; padding: 40px 0; text-align: center; }

        .na-steps { display: flex; align-items: center; gap: 6px; margin-bottom: 22px; }
        .na-step-dot { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; }
        .na-step-circle { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; border: 2px solid #e2e8f0; color: #94a3b8; background: #fff; transition: all .2s; }
        .na-step-dot.done .na-step-circle { background: #1a6b3a; border-color: #1a6b3a; color: #fff; }
        .na-step-dot.active .na-step-circle { border-color: #1a6b3a; color: #1a6b3a; }
        .na-step-label { font-size: 10.5px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: .4px; }
        .na-step-dot.active .na-step-label, .na-step-dot.done .na-step-label { color: #1a6b3a; }
        .na-step-line { flex: 1.4; height: 2px; background: #e2e8f0; margin-top: -22px; }
        .na-step-line.done { background: #1a6b3a; }

        .na-section-label { font-size: 11.5px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 12px; }

        .na-pill-row { display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }
        .na-pill { flex: 1; min-width: 90px; padding: 10px 8px; border-radius: 10px; text-align: center; border: 1.5px solid #e2e8f0; background: #fff; cursor: pointer; transition: all .15s; font-size: 12.5px; font-weight: 700; color: #334155; }
        .na-pill:hover { border-color: #94a3b8; }
        .na-pill.active { background: #f0fdf4; border-color: #1a6b3a; color: #15803d; }
        .na-pill-price { display: block; font-size: 10.5px; font-weight: 600; color: #94a3b8; margin-top: 2px; }
        .na-pill.active .na-pill-price { color: #15803d; }

        .na-pkg-card-row { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
        .na-pkg-card { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; border: 1.5px solid #e2e8f0; border-radius: 12px; background: #fff; cursor: pointer; transition: all .15s; }
        .na-pkg-card:hover { border-color: #94a3b8; }
        .na-pkg-card.active { background: #f0fdf4; border-color: #1a6b3a; }
        .na-pkg-card-name { font-size: 13px; font-weight: 700; color: #0f172a; }
        .na-pkg-card-meta { font-size: 11.5px; color: #94a3b8; margin-top: 2px; }
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

        .na-error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; font-size: 13px; font-weight: 600; padding: 10px 14px; border-radius: 10px; margin-bottom: 16px; }

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
        .is-tablet .na-topbar { padding: 28px 32px 4px; max-width: none; }
        .is-tablet .na-topbar-tabs { width: 400px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 4px; padding: 5px; border-radius: 14px; }
        .is-tablet .na-topbar-tab { height: 46px; padding: 0; font-size: 14px; border-radius: 10px; }
        .is-tablet .na-topbar-brand { font-weight: 600; letter-spacing: 1.6px; color: #64748b; }
        .na-fullslots-wrap.na-tab, .na-centerwrap.na-tab { padding: 24px 32px 48px; max-width: none; }
        .na-tab .na-fullslots-card { padding: 24px 24px 22px; }
        .na-tab .na-tab-main { flex: 1; min-width: 0; }
        .na-tab .na-fullslots-scroll { overflow-x: visible; }
        .na-tab .na-fullslots-table { table-layout: fixed; }
        .na-tab .na-fullslots-table th:first-child { width: 64px; }
        .na-tab .na-fullslots-table td { padding: 2px; }
        .na-tab .na-fullslots-table td.na-time-col { width: 64px; font-size: 12.5px; padding-right: 6px; }
        .na-tab .na-slotcell { min-width: 0; height: 50px; font-size: 14px; }
        .na-tab.land .na-slotcell { height: 42px; }
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
          .na-topbar { padding: 14px 12px 4px; flex-direction: column-reverse; align-items: stretch; gap: 10px; }
          .na-topbar-brand { font-size: 10px; font-weight: 600; letter-spacing: 1.4px; color: #64748b; padding: 0 4px; }
          .na-topbar-tabs { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 4px; }
          .na-topbar-tab { padding: 0; height: 44px; font-size: 13px; }
          .na-centerwrap, .na-fullslots-wrap { padding: 12px 12px 32px; }
          .na-card { padding: 16px 14px 18px; }
          .na-fullslots-card { padding: 14px 10px 14px; }
          .na-fullslots-scroll { overflow-x: visible; }
          .na-fullslots-table { table-layout: fixed; }
          .na-fullslots-table th:first-child { width: 44px; }
          .na-fullslots-table td { padding: 1.5px; }
          .na-fullslots-table td.na-time-col { width: 44px; padding-right: 4px; font-size: 11px; }
          .na-slotcell { min-width: 0; height: 38px; }
          .na-inp { font-size: 16px; }
          input.na-inp { height: 48px; }
          .na-textarea { min-height: 76px; }
          .na-btn-row { position: sticky; bottom: var(--na-ck, 0px); z-index: 5; margin: 18px -14px -18px; padding: 12px 14px calc(14px + env(safe-area-inset-bottom)); background: #fff; border-top: 1px solid #e2e8f0; border-radius: 0 0 20px 20px; }
          .na-btn-back { height: 52px; padding: 0 20px; }
          .na-submit { height: 52px; padding: 0; }
          .na-fullslots-legend { gap: 8px 14px; }
        }
      ` }} />

      <div className={`na-page ${tablet ? "is-tablet" : ""}`} style={{ "--na-ck": `${cookieH}px` }}>
        <div className="na-topbar">
          <div className="na-topbar-tabs">
            <button type="button" className={`na-topbar-tab ${bookingType === "new" ? "active" : ""}`} onClick={() => switchTab("new")}>New Client</button>
            <button type="button" className={`na-topbar-tab ${bookingType === "followup" ? "active" : ""}`} onClick={() => switchTab("followup")}>Follow-up</button>
            <button type="button" className={`na-topbar-tab ${bookingType === "reschedule" ? "active" : ""}`} onClick={() => switchTab("reschedule")}>Reschedule</button>
          </div>
          <div className="na-topbar-brand">Choose Your Therapist LLP | NOIDA</div>
        </div>

        {bookingType === "reschedule" ? (
          <div className={`na-centerwrap ${tablet ? "na-tab" : ""}`}>
            <div className="na-card">
              <div className="na-card-inner">
                {rescheduleDone ? (
                  <div className="na-success">
                    <div className="na-success-icon">✓</div>
                    <h2>All set!</h2>
                    <p>Your appointment has been moved to the new time. We've sent a confirmation to your email if you gave us one.</p>
                    <div className="na-summary">
                      <div><strong>New Date:</strong> {rescheduleDateLabel ? `${rescheduleDateLabel.weekday}, ${rescheduleDateLabel.day} ${rescheduleDateLabel.month}` : rescheduleDate}</div>
                      <div><strong>New Time:</strong> {rescheduleSlot}</div>
                    </div>
                  </div>
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
                          <span>📅 Currently: {rescheduleInfo.date} at {rescheduleInfo.slot}</span>
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

                    {rescheduleError && <div className="na-error" style={{ marginTop: 12 }}>⚠️ {rescheduleError}</div>}

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
                      👋 Welcome back, {foundName}!
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
                      <label className="na-lbl">Email <span style={{ fontWeight: 400, textTransform: "none", color: "#94a3b8" }}>(optional, for confirmation)</span></label>
                      <input className="na-inp" value={form.email} onChange={e => set("email", e.target.value)} placeholder="your@email.com" type="email" />
                    </div>
                  </div>
                )}
                {form.phone.length === 10 && (
                  <div className="na-row" style={{ gridTemplateColumns: "1fr" }}>
                    <div>
                      <label className="na-lbl">Major Concern <span style={{ fontWeight: 400, textTransform: "none", color: "#94a3b8" }}>(optional)</span></label>
                      <textarea className="na-inp na-textarea" rows={2} value={form.concern} onChange={e => set("concern", e.target.value)} placeholder="Briefly describe what you're going through…" />
                    </div>
                  </div>
                )}

                {error && <div className="na-error">⚠️ {error}</div>}
                <div className="na-btn-row"><button type="button" className="na-submit" onClick={goToIdentifySlots}>Continue →</button></div>
              </div>
            </div>
          </div>
        ) : phase === "slots" ? (
          <div className={`na-fullslots-wrap ${isMobile && pendingPick ? "has-bar" : ""} ${tablet ? `na-tab ${landscape ? "land" : "port"}` : ""}`}>
            <div className="na-tab-cols">
            <div className="na-fullslots-card na-tab-main">
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
                      <span><i style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0" }} /> Open</span>
                      <span><i style={{ background: "#fffbeb", border: "1.5px solid #fde68a" }} /> Starting soon</span>
                      <span><i style={{ background: "#fef2f2", border: "1.5px solid #fecaca" }} /> Booked</span>
                      <span><i style={{ background: "#f1f5f9" }} /> Passed</span>
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
                  <span><i style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0" }} /> Open{isMobile ? "" : " — tap to book"}</span>
                  <span><i style={{ background: "#fffbeb", border: "1.5px solid #fde68a" }} /> Starting soon{isMobile ? "" : " — needs a quick OK from us"}</span>
                  <span><i style={{ background: "#fef2f2", border: "1.5px solid #fecaca" }} /> Booked</span>
                  <span><i style={{ background: "#f1f5f9" }} /> {isMobile ? "Passed" : "Passed / not opened"}</span>
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
                      <div className="na-tab-selv">{lbl ? `${lbl.weekday}, ${lbl.day} ${lbl.month} · ${pendingPick.slot}` : "Tap an open slot to continue"}</div>
                      <div className="na-selbar-h">{pendingPick?.isLM ? "Starts within 15 min — the center confirms first" : "50–60 min session · Sector 51, Noida"}</div>
                    </div>
                    <button type="button" className="na-tab-cta" disabled={!pendingPick} onClick={go}>{cta}</button>
                  </div>
                );
              }
              return (
                <div className="na-tab-panel">
                  <div className="na-tab-panel-title">Your booking</div>
                  <div className="na-tab-slotbox">
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
                      <span>🎟️ Uses 1 of your {credit.sessionsRemaining} remaining session(s) — no payment.</span>
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
                  <div className="na-success">
                    <div className="na-success-icon">✓</div>
                    <h2>You're all set, {(effectiveName || "there").split(" ")[0]}!</h2>
                    <p>Your appointment at our Noida center is confirmed. We'll see you there — please arrive 10 minutes early.</p>
                    <div className="na-summary">
                      <div><strong>Date:</strong> {pickedDateLabel ? `${pickedDateLabel.weekday}, ${pickedDateLabel.day} ${pickedDateLabel.month}` : selectedDate}</div>
                      <div><strong>Time:</strong> {selectedSlot}</div>
                      <div><strong>Session:</strong> {modeLabel} · {formatLabel}</div>
                      {usingCredit ? (
                        <div><strong>Payment:</strong> Package session used ({credit.sessionsRemaining - 1} remaining)</div>
                      ) : (
                        <div><strong>Amount Paid:</strong> ₹{totalAmount}</div>
                      )}
                      {form.email && <div><strong>Confirmation sent to:</strong> {form.email}</div>}
                    </div>

                    {format !== "online" && (
                      <div className="na-address-box">
                        <div className="na-address-title">📍 Our Noida Center</div>
                        <div className="na-address-text">Choose Your Therapist LLP<br />Sector 51, Noida, Uttar Pradesh, India</div>
                        <a
                          href="https://www.google.com/maps/search/?api=1&query=Choose+Your+Therapist+LLP+Sector+51+Noida"
                          target="_blank" rel="noopener noreferrer" className="na-address-link"
                        >
                          Get Directions →
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="na-picked-banner">
                      <span>📅 {pickedDateLabel ? `${pickedDateLabel.weekday}, ${pickedDateLabel.day} ${pickedDateLabel.month}` : selectedDate} · {selectedSlot}{selectedIsLastMinute && " · ⚡ Last-minute"}</span>
                      <button type="button" className="na-picked-change" onClick={() => { resetLastMinute(); setPhase("slots"); }}>Change</button>
                    </div>

                    <div className="na-steps">
                      {STEP_LABELS.map((label, i) => {
                        const n = i + 1;
                        const state = n < step ? "done" : n === step ? "active" : "";
                        return (
                          <React.Fragment key={label}>
                            <div className={`na-step-dot ${state}`}>
                              <div className="na-step-circle">{n < step ? "✓" : n}</div>
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
                                <span>👋 Welcome back, {foundName}!{usingCredit && ` You have ${credit.sessionsRemaining} session(s) left${credit.packageName ? ` on ${credit.packageName}` : ""} — no payment needed.`}</span>
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
                                  <label className="na-lbl">Email <span style={{ fontWeight: 400, textTransform: "none", color: "#94a3b8" }}>(optional)</span></label>
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
                                <label className="na-lbl">Email <span style={{ fontWeight: 400, textTransform: "none", color: "#94a3b8" }}>(optional)</span></label>
                                <input className="na-inp" value={form.email} onChange={e => set("email", e.target.value)} placeholder="your@email.com" type="email" />
                              </div>
                            </div>
                          </>
                        )}

                        {(bookingType === "new" || form.phone.length === 10) && (
                          <div className="na-row" style={{ gridTemplateColumns: "1fr" }}>
                            <div>
                              <label className="na-lbl">Major Concern <span style={{ fontWeight: 400, textTransform: "none", color: "#94a3b8" }}>(optional)</span></label>
                              <textarea className="na-inp na-textarea" rows={2} value={form.concern} onChange={e => set("concern", e.target.value)} placeholder="Briefly describe what you're going through…" />
                            </div>
                          </div>
                        )}

                        {error && <div className="na-error">⚠️ {error}</div>}
                        <div className="na-btn-row"><button type="button" className="na-submit" onClick={goToStep2}>Continue →</button></div>
                      </>
                    )}

                    {step === 2 && (
                      <>
                        {usingCredit ? (
                          <div className="na-lookup-box na-lookup-found" style={{ marginBottom: 18 }}>
                            <span>🎟️ Using 1 of your {credit.sessionsRemaining} remaining session(s){credit.packageName ? ` on ${credit.packageName}` : ""} — no payment for this booking.</span>
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
                              <span>ℹ️ Home visit charges may increase depending on distance from our Noida center — we'll confirm the final amount with you before your session.</span>
                            </div>
                          </div>
                        )}

                        {error && <div className="na-error">⚠️ {error}</div>}
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

                        {error && <div className="na-error">⚠️ {error}</div>}

                        {selectedIsLastMinute && lastMinuteStatus !== "accepted" ? (
                          <>
                            <div className="na-lastmin-box">
                              {lastMinuteStatus === "pending" ? (
                                <>
                                  <div className="na-lastmin-title">⏳ Waiting for the center to confirm</div>
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
                                  <div className="na-lastmin-title">⚡ This slot starts very soon</div>
                                  <div className="na-lastmin-text">
                                    It's inside our last-minute window, so we need the center to confirm they can take you before you pay.
                                    {(() => {
                                      const secondsToStart = Math.round((slotStartInstant(selectedDate, selectedSlot).getTime() - nowTick) / 1000);
                                      return secondsToStart <= 120 && secondsToStart > 0 ? (
                                        <strong style={{ color: "#dc2626", display: "block", marginTop: 6 }}>
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
                            <button type="button" className="na-submit" disabled={status === "loading"} onClick={handleConfirmCredit}>
                              {status === "loading" ? "Booking…" : "Confirm Booking"}
                            </button>
                          </div>
                        ) : (
                          <>
                          <div className="na-secure">Secure checkout by Razorpay — UPI, cards &amp; netbanking</div>
                          <div className="na-btn-row">
                            <button type="button" className="na-btn-back" onClick={goBackFromPay}>Back</button>
                            <button type="button" className="na-submit" disabled={status === "loading"} onClick={handleRazorpay}>
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

        {isMobile && phase === "slots" && bookingType !== "reschedule" && pendingPick && (() => {
          const lbl = dateLabel(pendingPick.date);
          return (
            <div className="na-selbar" role="region" aria-label="Selected slot">
              <div className="na-selbar-info">
                <div className="na-selbar-k">Selected</div>
                <div className="na-selbar-v">{lbl.weekday}, {lbl.day} {lbl.month} · {shortTime(pendingPick.slot)}</div>
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
