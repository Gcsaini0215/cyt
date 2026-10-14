import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import StopRoundedIcon from "@mui/icons-material/StopRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CallRoundedIcon from "@mui/icons-material/CallRounded";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";
import PersonPinCircleRoundedIcon from "@mui/icons-material/PersonPinCircleRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import ViewAgendaRoundedIcon from "@mui/icons-material/ViewAgendaRounded";
import TableRowsRoundedIcon from "@mui/icons-material/TableRowsRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import PsychologyAltRoundedIcon from "@mui/icons-material/PsychologyAltRounded";
import FamilyRestroomRoundedIcon from "@mui/icons-material/FamilyRestroomRounded";
import AttachFileRoundedIcon from "@mui/icons-material/AttachFileRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import { postData, fetchData } from "../../../utils/actions";
import { startSessionNowUrl, EndSessionUrl, getBookings, imagePath } from "../../../utils/url";
import { joinSession } from "../../../utils/join-session";
import { SESSION_STATUS } from "../../../utils/constant";
import { printInvoice as printInvoiceDoc } from "../../../utils/invoice-template";
import useTherapistStore from "../../../store/therapistStore";

/* Therapist "Appointments": every booking with what the client told us at booking time
   (who the session is for, age, gender, concern, contact), grouped by day, with the
   Start (PIN) / End session flow, invoice and a live new-booking alert. */

const TZ = "Asia/Kolkata";
const ST = {
  [SESSION_STATUS.NEW]: { key: "new", label: "Upcoming" },
  [SESSION_STATUS.STARTED]: { key: "live", label: "In session" },
  [SESSION_STATUS.COMPLETED]: { key: "done", label: "Completed" },
  [SESSION_STATUS.CANCELED]: { key: "cancel", label: "Cancelled" },
};
const stOf = (s) => ST[s] || ST[SESSION_STATUS.NEW];

const safeDate = (d) => { const x = d ? new Date(d) : null; return x && !isNaN(x) ? x : null; };
const istKey = (d) => d.toLocaleDateString("en-CA", { timeZone: TZ });
const fmtTime = (d) => d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: TZ });
const fmtDay = (d) => d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: TZ });
const fmtFull = (d) => d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: TZ });
const num = (v) => Number(v?.$numberDecimal ?? v) || 0;
const inr = (v) => `₹${num(v).toLocaleString("en-IN")}`;
const initials = (name) => {
  const p = String(name || "?").trim().split(/\s+/);
  return ((p[0]?.[0] || "?") + (p[1]?.[0] || "")).toUpperCase();
};
const digits = (p) => String(p || "").replace(/\D/g, "");
const waLink = (p) => { const d = digits(p); return d ? `https://wa.me/${d.length === 10 ? "91" + d : d}` : ""; };
const cleanText = (v) => (v && v !== "null" && v !== "undefined" ? String(v).trim() : "");

// uploaded photos only — the stock "default" avatar URL looks worse than initials
const photoOf = (c) => {
  const v = cleanText(c?.profile);
  if (!v || /^https?:\/\//i.test(v)) return "";
  return `${imagePath}/${v}`;
};

// who the session is for, as entered at booking time
function personOf(a) {
  const forOther = /other/i.test(a.whom || "") && cleanText(a.cname);
  const age = Number(a.age) || (!forOther ? Number(a.client?.age) || null : null);
  return {
    name: forOther ? cleanText(a.cname) : cleanText(a.client?.name) || "Client",
    age: age || null,
    gender: !forOther ? cleanText(a.client?.gender) : "",
    forOther: !!forOther,
    relation: cleanText(a.relation_with_client),
    bookedBy: cleanText(a.client?.name),
    phone: cleanText(a.client?.phone),
    email: cleanText(a.client?.email),
    photo: !forOther ? photoOf(a.client) : "",
  };
}

const isOnline = (f) => !/offline|in[- ]?person|clinic/i.test(String(f || ""));

function dayLabel(d, now) {
  const k = istKey(d);
  if (k === istKey(now)) return "Today";
  if (k === istKey(new Date(now.getTime() + 864e5))) return "Tomorrow";
  if (k === istKey(new Date(now.getTime() - 864e5))) return "Yesterday";
  return fmtDay(d);
}

function relTime(d, now) {
  const m = Math.round((d - now) / 60000);
  if (m > 0 && m < 60) return `in ${m} min`;
  if (m >= 60 && m < 24 * 60) return `in ${Math.floor(m / 60)}h ${m % 60 ? `${m % 60}m` : ""}`.trim();
  return "";
}

const FILTERS = [
  { key: "all", label: "All" },
  { key: "today", label: "Today" },
  { key: "upcoming", label: "Upcoming" },
  { key: "live", label: "In session" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const AppointmentsContent = ({ appointments: initialAppointments, onRefresh }) => {
  const [appointments, setAppointments] = useState(initialAppointments || []);
  const [selected, setSelected] = useState(null);
  const [detailTab, setDetailTab] = useState("details");
  const [busyId, setBusyId] = useState("");
  const [endingId, setEndingId] = useState("");
  const [isRinging, setIsRinging] = useState(false);
  const [newCount, setNewCount] = useState(0);
  const [soundOn, setSoundOn] = useState(false);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState("cards");
  const [refreshing, setRefreshing] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const { therapistInfo } = useTherapistStore();
  const audioRef = useRef(null);
  const listRef = useRef(appointments);

  useEffect(() => { setAppointments(initialAppointments || []); }, [initialAppointments]);
  useEffect(() => { listRef.current = appointments; }, [appointments]);
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(t); }, []);

  // new-booking sound (browsers need one tap before audio may play)
  useEffect(() => {
    const audio = new Audio("/notification.mp3");
    audio.loop = true;
    audio.preload = "auto";
    audioRef.current = audio;
    const unlock = () => {
      setSoundOn(true);
      audio.play().then(() => { audio.pause(); audio.currentTime = 0; }).catch(() => {});
      window.removeEventListener("click", unlock);
      window.removeEventListener("touchstart", unlock);
    };
    window.addEventListener("click", unlock);
    window.addEventListener("touchstart", unlock);
    return () => {
      audio.pause();
      window.removeEventListener("click", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, []);

  const stopRinging = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    setIsRinging(false);
    setNewCount(0);
  }, []);
  useEffect(() => {
    if (!isRinging) return undefined;
    const t = setTimeout(stopRinging, 60000);
    return () => clearTimeout(t);
  }, [isRinging, stopRinging]);

  // poll for new bookings (paused in background tabs, never overlapping)
  useEffect(() => {
    let inFlight = false;
    const iv = setInterval(async () => {
      if (inFlight || document.hidden) return;
      inFlight = true;
      try {
        const r = await fetchData(getBookings);
        if (r?.status && Array.isArray(r.data)) {
          const known = new Set(listRef.current.map((a) => a._id));
          const fresh = r.data.filter((a) => !known.has(a._id));
          if (fresh.length) {
            setNewCount((c) => c + fresh.length);
            setIsRinging(true);
            audioRef.current?.play().catch(() => setSoundOn(false));
            setAppointments((prev) => Array.from(new Map([...fresh, ...prev].map((x) => [x._id, x])).values()));
            toast.success(`🔔 ${fresh.length} new booking${fresh.length > 1 ? "s" : ""}!`, { position: "top-right", autoClose: 10000 });
            if (onRefresh) onRefresh();
          }
        }
      } catch (e) { /* next tick retries */ }
      inFlight = false;
    }, 15000);
    return () => clearInterval(iv);
  }, [onRefresh]);

  const refresh = async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    try { await onRefresh(); } finally { setRefreshing(false); }
  };

  /* ── counts, filtering, grouping ── */
  const todayKey = istKey(now);
  const rows = useMemo(() => appointments.map((a) => ({ a, d: safeDate(a.booking_date), p: personOf(a) })), [appointments]);
  const isUpcoming = (r) => r.a.status === SESSION_STATUS.NEW && r.d && r.d.getTime() > now.getTime() - 60 * 60000;
  const counts = useMemo(() => ({
    all: rows.length,
    today: rows.filter((r) => r.d && istKey(r.d) === todayKey && r.a.status !== SESSION_STATUS.CANCELED).length,
    upcoming: rows.filter(isUpcoming).length,
    live: rows.filter((r) => r.a.status === SESSION_STATUS.STARTED).length,
    completed: rows.filter((r) => r.a.status === SESSION_STATUS.COMPLETED).length,
    cancelled: rows.filter((r) => r.a.status === SESSION_STATUS.CANCELED).length,
  }), [rows, todayKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    const sd = digits(s);
    return rows.filter((r) => {
      if (s) {
        const hay = [r.p.name, r.p.bookedBy, r.p.email, r.a.notes, r.a.service, r.a._id].join(" ").toLowerCase();
        if (!hay.includes(s) && !(sd.length >= 4 && digits(r.p.phone).includes(sd))) return false;
      }
      switch (filter) {
        case "today": return r.d && istKey(r.d) === todayKey && r.a.status !== SESSION_STATUS.CANCELED;
        case "upcoming": return isUpcoming(r);
        case "live": return r.a.status === SESSION_STATUS.STARTED;
        case "completed": return r.a.status === SESSION_STATUS.COMPLETED;
        case "cancelled": return r.a.status === SESSION_STATUS.CANCELED;
        default: return true;
      }
    });
  }, [rows, q, filter, todayKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // live first, then upcoming soonest-first, then past newest-first — in day groups
  const groups = useMemo(() => {
    const t = now.getTime();
    const live = shown.filter((r) => r.a.status === SESSION_STATUS.STARTED);
    const future = shown.filter((r) => r.a.status !== SESSION_STATUS.STARTED && r.d && r.d.getTime() >= t - 60 * 60000).sort((x, y) => x.d - y.d);
    const past = shown.filter((r) => r.a.status !== SESSION_STATUS.STARTED && (!r.d || r.d.getTime() < t - 60 * 60000)).sort((x, y) => (y.d || 0) - (x.d || 0));
    const out = [];
    if (live.length) out.push({ key: "live", title: "In session now", items: live });
    if (future.length) out.push({ key: "next", title: "Upcoming", items: future });
    if (past.length) out.push({ key: "past", title: "Past", items: past, past: true });
    return out;
  }, [shown, now]);

  /* ── session actions ── */
  const markStarted = (id) => {
    setAppointments((prev) => prev.map((x) => (x._id === id ? { ...x, status: SESSION_STATUS.STARTED, session_started_at: x.session_started_at || new Date().toISOString() } : x)));
    setSelected((s) => (s && s._id === id ? { ...s, status: SESSION_STATUS.STARTED } : s));
  };
  // one tap — no PIN (unlocks 15 min before the slot)
  const startNow = async (a) => {
    setBusyId(a._id);
    try {
      const r = await postData(startSessionNowUrl, { bookingId: a._id });
      if (r.status) { toast.success(r.message || "Session started"); markStarted(a._id); }
      else toast.error(r.message || "Couldn't start the session");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't start the session");
    }
    setBusyId("");
  };
  // open the Google Meet; the session starts by itself once the client has joined too
  const join = async (a) => {
    try {
      const d = await joinSession(a._id, a.meet_link);
      if (d?.meet_link && !a.meet_link) {
        setAppointments((prev) => prev.map((x) => (x._id === a._id ? { ...x, meet_link: d.meet_link } : x)));
        setSelected((s) => (s && s._id === a._id ? { ...s, meet_link: d.meet_link } : s));
      }
      if (d?.status === SESSION_STATUS.STARTED) markStarted(a._id);
      else if (d) toast.info("Opened Meet — the session starts automatically when your client joins.");
    } catch (e) {
      toast.error(e.message, { autoClose: 7000 });
      if (/connect your google/i.test(e.message)) setTimeout(() => { if (window.confirm("Open Settings to connect Google now?")) window.location.href = "/settings?tab=account"; }, 300);
    }
  };
  const endSession = async (a) => {
    if (!window.confirm(`End the session with ${personOf(a).name}?`)) return;
    setEndingId(a._id);
    try {
      const r = await postData(EndSessionUrl, { bookingId: a._id });
      if (r.status) {
        toast.success(r.message || "Session completed");
        setAppointments((prev) => prev.map((x) => (x._id === a._id ? { ...x, status: SESSION_STATUS.COMPLETED, session_completed_at: new Date().toISOString() } : x)));
        setSelected((s) => (s && s._id === a._id ? { ...s, status: SESSION_STATUS.COMPLETED } : s));
      } else toast.error(r.message || "Couldn't end the session");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't end the session");
    }
    setEndingId("");
  };
  const printInvoice = (a) => printInvoiceDoc(a, therapistInfo);

  // details drawer: Esc closes, page behind doesn't scroll
  useEffect(() => {
    if (!selected) return undefined;
    const onKey = (e) => { if (e.key === "Escape") setSelected(null); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [selected]);
  const open = (a, tab = "details") => { setSelected(a); setDetailTab(tab); };

  const SessionButton = ({ a, big }) => {
    const hasMeet = !!a.meet_link || isOnline(a.format);
    if (a.status === SESSION_STATUS.NEW) {
      return hasMeet
        ? <button type="button" className={`apx-btn primary${big ? " big" : ""}`} onClick={(e) => { e.stopPropagation(); join(a); }}><VideocamRoundedIcon /> Join<span className="apx-lg"> Meet</span></button>
        : <button type="button" className={`apx-btn primary${big ? " big" : ""}`} disabled={busyId === a._id} onClick={(e) => { e.stopPropagation(); startNow(a); }}><PlayArrowRoundedIcon /> {busyId === a._id ? "Starting…" : <>Start<span className="apx-lg"> session</span></>}</button>;
    }
    if (a.status === SESSION_STATUS.STARTED) {
      return (
        <>
          {hasMeet && <button type="button" className={`apx-btn soft${big ? " big" : ""}`} onClick={(e) => { e.stopPropagation(); join(a); }}><VideocamRoundedIcon /> Meet</button>}
          <button type="button" className={`apx-btn danger${big ? " big" : ""}`} disabled={endingId === a._id} onClick={(e) => { e.stopPropagation(); endSession(a); }}><StopRoundedIcon /> {endingId === a._id ? "Ending…" : <>End<span className="apx-lg"> session</span></>}</button>
        </>
      );
    }
    return null;
  };

  return (
    <div className="apx">
      <style dangerouslySetInnerHTML={{ __html: APX_CSS }} />

      {isRinging && (
        <div className="apx-ring" role="alert">
          <NotificationsActiveRoundedIcon />
          <div><b>{newCount > 1 ? `${newCount} new bookings` : "New booking!"}</b><span>A client just booked a session with you</span></div>
          <button type="button" onClick={() => { stopRinging(); setFilter("upcoming"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>View</button>
          <button type="button" className="x" onClick={stopRinging} aria-label="Dismiss"><CloseRoundedIcon /></button>
        </div>
      )}

      <div className="apx-head">
        <div>
          <h1>Appointments</h1>
          <p>Every booking with what your client shared — tap one for full details.</p>
        </div>
        <div className="apx-head-acts">
          {!soundOn && (
            <button type="button" className="apx-btn soft" onClick={() => setSoundOn(true)} title="Play a sound when a new booking arrives">
              <NotificationsActiveRoundedIcon /> Turn on alerts
            </button>
          )}
          <div className="apx-seg hide-sm" role="group" aria-label="View">
            <button type="button" className={view === "cards" ? "on" : ""} onClick={() => setView("cards")}><ViewAgendaRoundedIcon /> Cards</button>
            <button type="button" className={view === "list" ? "on" : ""} onClick={() => setView("list")}><TableRowsRoundedIcon /> List</button>
          </div>
          <button type="button" className="apx-btn soft" onClick={refresh} disabled={refreshing} aria-label="Refresh">
            <RefreshRoundedIcon className={refreshing ? "spin" : ""} /> <span className="hide-sm">Refresh</span>
          </button>
        </div>
      </div>

      <div className="apx-stats">
        {[
          { k: "today", label: "Today", tone: "green", sub: "sessions today" },
          { k: "upcoming", label: "Upcoming", tone: "teal", sub: "booked ahead" },
          { k: "live", label: "In session", tone: "gold", sub: "running now" },
          { k: "completed", label: "Completed", tone: "slate", sub: "all time" },
        ].map((s) => (
          <button key={s.k} type="button" className={`apx-stat ${s.tone}${filter === s.k ? " on" : ""}`} onClick={() => setFilter(filter === s.k ? "all" : s.k)}>
            <span>{s.label}</span><b>{counts[s.k]}</b><small>{s.sub}</small>
          </button>
        ))}
      </div>

      <div className="apx-bar">
        <div className="apx-filters" role="tablist" aria-label="Filter appointments">
          {FILTERS.map((f) => (
            <button key={f.key} type="button" role="tab" aria-selected={filter === f.key} className={filter === f.key ? "on" : ""} onClick={() => setFilter(f.key)}>
              {f.label}<i>{counts[f.key]}</i>
            </button>
          ))}
        </div>
        <label className="apx-search">
          <SearchRoundedIcon />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, phone, concern…" aria-label="Search appointments" />
        </label>
      </div>

      {!shown.length ? (
        <div className="apx-empty">
          <b>No appointments here</b>
          <p>{q || filter !== "all" ? "Try another filter or search." : "New bookings will show up here."}</p>
          {(q || filter !== "all") && <button type="button" className="apx-btn soft" onClick={() => { setQ(""); setFilter("all"); }}>Clear filters</button>}
        </div>
      ) : view === "list" ? (
        <div className="apx-table-wrap hide-sm">
          <table className="apx-table">
            <thead><tr><th>When</th><th>Client</th><th>Age / gender</th><th>Service</th><th>Concern</th><th>Status</th><th /></tr></thead>
            <tbody>
              {groups.flatMap((g) => g.items).map(({ a, d, p }) => {
                const st = stOf(a.status);
                return (
                  <tr key={a._id} onClick={() => open(a)}>
                    <td className="when">{d ? <><b>{fmtTime(d)}</b><span>{fmtDay(d)}</span></> : "—"}</td>
                    <td><b>{p.name}</b>{p.forOther && <span className="sub">for {p.relation || "someone"} · by {p.bookedBy}</span>}</td>
                    <td>{[p.age ? `${p.age} yrs` : "", p.gender].filter(Boolean).join(" · ") || "—"}</td>
                    <td>{a.service || "—"}<span className="sub">{a.format || "Online"}</span></td>
                    <td className="concern">{cleanText(a.notes) || "—"}</td>
                    <td><span className={`apx-st ${st.key}`}>{st.label}</span></td>
                    <td className="acts" onClick={(e) => e.stopPropagation()}><SessionButton a={a} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        groups.map((g) => (
          <section key={g.key} className={`apx-group${g.past ? " past" : ""}`}>
            <h2 className={g.key === "live" ? "live" : ""}>{g.title}<span>{g.items.length}</span></h2>
            <div className="apx-grid">
              {g.items.map(({ a, d, p }) => {
                const st = stOf(a.status);
                const soon = d && a.status === SESSION_STATUS.NEW ? relTime(d, now) : "";
                const concern = cleanText(a.notes);
                return (
                  <article key={a._id} className={`apx-card ${st.key}`} onClick={() => open(a)} tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter") open(a); }}>
                    <div className="apx-time">
                      <b>{d ? fmtTime(d) : "—"}</b>
                      <span>{d ? dayLabel(d, now) : ""}</span>
                      {soon && <em>{soon}</em>}
                    </div>
                    <div className="apx-main">
                      <div className="apx-who">
                        <div className="apx-av">{p.photo ? <img src={p.photo} alt="" /> : initials(p.name)}</div>
                        <div className="apx-who-txt">
                          <b>{p.name}</b>
                          <span>
                            {[p.age ? `${p.age} yrs` : "", p.gender].filter(Boolean).join(" · ") || "Age not shared"}
                            {p.forOther && <> · <FamilyRestroomRoundedIcon /> {p.relation || "Family"}</>}
                          </span>
                        </div>
                        <span className={`apx-st ${st.key}`}>{st.label}</span>
                      </div>
                      <div className="apx-chips">
                        <span className={`apx-st apx-st-inline ${st.key}`}>{st.label}</span>
                        {a.service && <span>{a.service}</span>}
                        <span>{/offline|in-person|person/i.test(a.format || "") ? <PersonPinCircleRoundedIcon /> : <VideocamRoundedIcon />}{a.format || "Online"}</span>
                        {cleanText(a.session_type) && <span>{a.session_type}</span>}
                        {p.forOther && p.bookedBy && <span className="by">Booked by {p.bookedBy}</span>}
                      </div>
                      {concern && <p className="apx-concern"><PsychologyAltRoundedIcon /> {concern}</p>}
                      <div className="apx-acts" onClick={(e) => e.stopPropagation()}>
                        <SessionButton a={a} />
                        {waLink(p.phone) && <a className="apx-btn icon wa" href={waLink(p.phone)} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp client" title="WhatsApp"><WhatsAppIcon /></a>}
                        {p.phone && <a className="apx-btn icon" href={`tel:${p.phone}`} aria-label="Call client" title="Call"><CallRoundedIcon /></a>}
                        <button type="button" className="apx-btn soft" onClick={() => open(a)}>Details</button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))
      )}

      {selected && (() => {
        const a = selected;
        const p = personOf(a);
        const d = safeDate(a.booking_date);
        const st = stOf(a.status);
        const amount = a.transaction?.amount ?? a.amount;
        const payName = a.transaction?.status?.name || a.payment_status || "";
        const paidOk = /success|paid|complete/i.test(payName);
        const paidAt = safeDate(a.transaction?.createdAt);
        const started = safeDate(a.session_started_at);
        const completed = safeDate(a.session_completed_at);
        const file = cleanText(a.file);
        return (
          <>
            <div className="apx-overlay" onClick={() => setSelected(null)} />
            <aside className="apx-drawer" role="dialog" aria-modal="true" aria-label={`Appointment with ${p.name}`}>
              <div className="apx-dr-head">
                <div className="apx-av lg">{p.photo ? <img src={p.photo} alt="" /> : initials(p.name)}</div>
                <div className="apx-dr-who">
                  <b>{p.name}</b>
                  <span>{[p.age ? `${p.age} yrs` : "", p.gender, a.service].filter(Boolean).join(" · ")}</span>
                </div>
                <span className={`apx-st ${st.key}`}>{st.label}</span>
                <button type="button" className="apx-x" onClick={() => setSelected(null)} aria-label="Close"><CloseRoundedIcon /></button>
              </div>
              <div className="apx-dr-tabs">
                <button type="button" className={detailTab === "details" ? "on" : ""} onClick={() => setDetailTab("details")}>Details</button>
                <button type="button" className={detailTab === "invoice" ? "on" : ""} onClick={() => setDetailTab("invoice")}>Invoice</button>
              </div>

              <div className="apx-dr-body">
                {detailTab === "details" ? (
                  <>
                    <div className="apx-when">
                      <div><span>Date</span><b>{d ? fmtFull(d) : "—"}</b></div>
                      <div><span>Time</span><b>{d ? fmtTime(d) : "—"}</b></div>
                      <div><span>Mode</span><b>{a.format || "Online"}</b></div>
                    </div>

                    <section className="apx-sec">
                      <h3>Client</h3>
                      <dl>
                        <div><dt>Name</dt><dd>{p.name}</dd></div>
                        <div><dt>Age</dt><dd>{p.age ? `${p.age} years` : "Not shared"}</dd></div>
                        {p.gender && <div><dt>Gender</dt><dd>{p.gender}</dd></div>}
                        <div><dt>Session for</dt><dd>{p.forOther ? `Someone else${p.relation ? ` (${p.relation})` : ""}` : "Themselves"}</dd></div>
                        {p.forOther && <div><dt>Booked by</dt><dd>{p.bookedBy || "—"}</dd></div>}
                      </dl>
                      <div className="apx-contact">
                        {p.phone && <a href={`tel:${p.phone}`} className="apx-btn soft"><CallRoundedIcon /> {p.phone}</a>}
                        {waLink(p.phone) && <a href={waLink(p.phone)} target="_blank" rel="noopener noreferrer" className="apx-btn soft wa"><WhatsAppIcon /> WhatsApp</a>}
                        {p.email && <a href={`mailto:${p.email}`} className="apx-btn soft"><MailOutlineRoundedIcon /> {p.email}</a>}
                      </div>
                    </section>

                    <section className="apx-sec">
                      <h3>What they shared</h3>
                      <p className="apx-note">{cleanText(a.notes) || "No concern was written at booking."}</p>
                      {file && /^https?:\/\//i.test(file) && (
                        <a href={file} target="_blank" rel="noopener noreferrer" className="apx-btn soft"><AttachFileRoundedIcon /> Attached file</a>
                      )}
                    </section>

                    <section className="apx-sec">
                      <h3>Session</h3>
                      <dl>
                        <div><dt>Service</dt><dd>{a.service || "—"}</dd></div>
                        {cleanText(a.session_type) && <div><dt>Session type</dt><dd>{a.session_type}</dd></div>}
                        <div><dt>Status</dt><dd>{st.label}</dd></div>
                        {started && <div><dt>Started</dt><dd>{fmtTime(started)}</dd></div>}
                        {completed && <div><dt>Ended</dt><dd>{fmtTime(completed)}</dd></div>}
                        <div><dt>Booking ID</dt><dd className="mono">#{String(a._id).slice(-8)}</dd></div>
                        {a.meet_link && <div style={{ gridColumn: "1 / -1" }}><dt>Google Meet</dt><dd><a href={a.meet_link} target="_blank" rel="noopener noreferrer" className="mono" style={{ color: "#166534" }}>{a.meet_link.replace("https://", "")}</a></dd></div>}
                        {a.meet_link && a.status === SESSION_STATUS.NEW && <div style={{ gridColumn: "1 / -1" }}><dt>Joined</dt><dd>{a.client_joined_at ? "Client ✓" : "Client —"} · {a.therapist_joined_at ? "You ✓" : "You —"}</dd></div>}
                      </dl>
                    </section>

                    <section className="apx-sec">
                      <h3>Payment</h3>
                      <dl>
                        <div><dt>Amount</dt><dd>{amount != null && amount !== "" ? inr(amount) : "—"}</dd></div>
                        <div><dt>Status</dt><dd><span className={`apx-pay ${paidOk ? "ok" : "warn"}`}>{payName || "—"}</span></dd></div>
                        {a.transaction?.payment_method && <div><dt>Method</dt><dd>{a.transaction.payment_method}</dd></div>}
                        {paidAt && <div><dt>Paid on</dt><dd>{fmtDay(paidAt)}, {fmtTime(paidAt)}</dd></div>}
                        {a.transaction?.transaction_id && <div><dt>Transaction</dt><dd className="mono">{a.transaction.transaction_id}</dd></div>}
                      </dl>
                    </section>
                  </>
                ) : (
                  <div className="apx-inv">
                    <div className="apx-inv-top">
                      <div><b>Choose Your Therapist</b><span>Session invoice</span></div>
                      <div className="r"><span>Invoice</span><b className="mono">#{(a.transaction?.transaction_id || String(a._id)).slice(-8)}</b></div>
                    </div>
                    <dl>
                      <div><dt>Billed to</dt><dd>{p.bookedBy || p.name}</dd></div>
                      <div><dt>Date</dt><dd>{d ? `${fmtDay(d)}, ${fmtTime(d)}` : "—"}</dd></div>
                      <div><dt>{a.service || "Session"} · {a.format || "Online"}</dt><dd>{inr(amount)}</dd></div>
                    </dl>
                    <div className="apx-inv-total"><span>Total</span><b>{inr(amount)}</b></div>
                    <div className="apx-inv-acts">
                      <button type="button" className="apx-btn primary big" onClick={() => printInvoice(a)}><DownloadRoundedIcon /> Download PDF</button>
                      <button type="button" className="apx-btn soft big" onClick={() => printInvoice(a)}><PrintRoundedIcon /> Print</button>
                    </div>
                  </div>
                )}
              </div>

              {detailTab === "details" && (
                <div className="apx-dr-foot">
                  <SessionButton a={a} big />
                  <button type="button" className="apx-btn soft big" onClick={() => setDetailTab("invoice")}><ReceiptLongRoundedIcon /> Invoice</button>
                </div>
              )}
            </aside>
          </>
        );
      })()}

    </div>
  );
};

export default AppointmentsContent;

const APX_CSS = `
.apx { --g: #166534; --g-dk: #0f3d24; --g-bg: #e7f6ec; --line: #e4ece7; --ink: #0f172a; --mut: #64748b; --faint: #94a3b8; --gold: #c9962c;
  font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; color: var(--ink); max-width: 1240px; margin: 0 auto; padding-bottom: 24px; }
.apx *, .apx *::before, .apx *::after { box-sizing: border-box; }
.apx svg { font-size: 18px; }
.apx .spin { animation: apxSpin 1s linear infinite; } @keyframes apxSpin { to { transform: rotate(360deg); } }

.apx-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 14px; }
.apx-head h1 { font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -.3px; font-family: inherit; color: var(--ink); }
.apx-head p { font-size: 13.5px; color: var(--mut); margin: 3px 0 0; }
.apx-head-acts { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }

.apx-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 38px; padding: 0 14px; border-radius: 10px; border: 1px solid transparent;
  font-size: 13px; font-weight: 700; cursor: pointer; text-decoration: none !important; white-space: nowrap; font-family: inherit; transition: background .15s, border-color .15s, color .15s; }
.apx-btn.primary { background: linear-gradient(135deg, #14532d, #16a34a); color: #fff !important; box-shadow: 0 6px 14px -8px rgba(22,101,52,.7); }
.apx-btn.primary:hover { filter: brightness(1.06); }
.apx-btn.danger { background: #b91c1c; color: #fff !important; }
.apx-btn.danger:hover { background: #991b1b; }
.apx-btn.soft { background: #fff; color: var(--g) !important; border-color: #cfe3d6; }
.apx-btn.soft:hover { background: var(--g-bg); }
.apx-btn.icon { width: 38px; padding: 0; background: #f1f6f3; color: var(--g) !important; }
.apx-btn.icon:hover { background: var(--g-bg); }
.apx-btn.wa { color: #15803d !important; }
.apx-btn.big { height: 44px; font-size: 14px; flex: 1; }
.apx-btn:disabled { opacity: .6; cursor: default; }

.apx-seg { display: inline-flex; background: #fff; border: 1px solid var(--line); border-radius: 11px; padding: 3px; gap: 2px; }
.apx-seg button { display: inline-flex; align-items: center; gap: 5px; height: 32px; padding: 0 11px; border: 0; border-radius: 8px; background: none; color: var(--mut); font-size: 12.5px; font-weight: 700; cursor: pointer; font-family: inherit; }
.apx-seg button.on { background: var(--g-bg); color: var(--g); }
.apx-seg svg { font-size: 16px; }

.apx-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 14px; }
.apx-stat { text-align: left; display: flex; flex-direction: column; gap: 2px; padding: 13px 15px 11px; border-radius: 16px; border: 1px solid var(--line); border-top: 3px solid; cursor: pointer; font-family: inherit; transition: transform .15s, box-shadow .15s; }
.apx-stat:hover { transform: translateY(-1px); box-shadow: 0 10px 22px -16px rgba(15,23,42,.35); }
.apx-stat span { font-size: 12.5px; font-weight: 700; color: var(--mut); }
.apx-stat b { font-size: 26px; font-weight: 800; line-height: 1.1; letter-spacing: -.3px; }
.apx-stat small { font-size: 11.5px; color: var(--faint); }
.apx-stat.green { background: linear-gradient(165deg, #e6f7ec, #fff 62%); border-color: #cdebd7; border-top-color: #16a34a; } .apx-stat.green b { color: #166534; }
.apx-stat.teal { background: linear-gradient(165deg, #e2f6f3, #fff 62%); border-color: #c8ebe5; border-top-color: #0d9488; } .apx-stat.teal b { color: #0f766e; }
.apx-stat.gold { background: linear-gradient(165deg, #fbf3e2, #fff 62%); border-color: #eedfbd; border-top-color: #c9962c; } .apx-stat.gold b { color: #92651a; }
.apx-stat.slate { background: linear-gradient(165deg, #eef2f6, #fff 62%); border-color: #dde4ec; border-top-color: #64748b; } .apx-stat.slate b { color: #334155; }
.apx-stat.on { box-shadow: 0 0 0 2px #166534; }

.apx-bar { position: sticky; top: var(--tn-h, 56px); z-index: 15; display: flex; gap: 10px; align-items: center; margin: 0 -4px 14px; padding: 8px 4px; background: #f1f6f2; }
.apx-filters { display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; flex: 1; min-width: 0; }
.apx-filters::-webkit-scrollbar { display: none; }
.apx-filters button { flex: 0 0 auto; display: inline-flex; align-items: center; gap: 6px; height: 36px; padding: 0 13px; border-radius: 999px; border: 1px solid var(--line); background: #fff; color: var(--mut); font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit; }
.apx-filters button i { font-style: normal; font-size: 11px; font-weight: 800; background: #eef2f0; color: var(--mut); border-radius: 999px; padding: 0 7px; line-height: 18px; }
.apx-filters button.on { background: var(--g-dk); border-color: var(--g-dk); color: #fff; }
.apx-filters button.on i { background: rgba(255,255,255,.2); color: #fff; }
.apx-search { display: flex; align-items: center; gap: 6px; height: 38px; width: 280px; flex-shrink: 0; background: #fff; border: 1px solid var(--line); border-radius: 11px; padding: 0 12px; color: var(--faint); margin: 0; }
.apx-search:focus-within { border-color: #a7d7b8; box-shadow: 0 0 0 3px rgba(22,101,52,.1); }
.apx-search input { border: 0 !important; outline: none; flex: 1; min-width: 0; height: 100%; font-size: 14px; background: transparent; color: var(--ink); font-family: inherit; padding: 0; box-shadow: none !important; }

.apx-group { margin-bottom: 18px; }
.apx-group h2 { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 800; letter-spacing: .4px; text-transform: uppercase; color: var(--g); margin: 0 0 10px; font-family: inherit; }
.apx-group h2 span { font-size: 11px; background: var(--g-bg); color: var(--g); border-radius: 999px; padding: 1px 8px; letter-spacing: 0; }
.apx-group h2.live { color: #b45309; } .apx-group h2.live span { background: #fef3c7; color: #b45309; }
.apx-group.past h2 { color: var(--mut); } .apx-group.past h2 span { background: #eef2f0; color: var(--mut); }
.apx-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
@media (min-width: 1000px) { .apx-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }

.apx-card { display: flex; background: #fff; border: 1px solid var(--line); border-radius: 16px; overflow: hidden; cursor: pointer; transition: box-shadow .15s, transform .15s, border-color .15s; min-width: 0; }
.apx-card:hover { box-shadow: 0 14px 30px -20px rgba(15,61,36,.45); border-color: #c6e2cf; transform: translateY(-1px); }
.apx-card:focus-visible { outline: 2px solid var(--g); outline-offset: 2px; }
.apx-time { width: 96px; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; padding: 12px 6px; text-align: center;
  background: linear-gradient(180deg, #14532d, #166534); color: #fff; }
.apx-time b { font-size: 15px; font-weight: 800; white-space: nowrap; }
.apx-time span { font-size: 11px; opacity: .8; }
.apx-time em { font-style: normal; font-size: 10.5px; font-weight: 800; background: #f5c542; color: #3d2a00; border-radius: 999px; padding: 1px 7px; margin-top: 4px; white-space: nowrap; }
.apx-card.live .apx-time { background: linear-gradient(180deg, #b45309, #d97706); }
.apx-card.done .apx-time { background: linear-gradient(180deg, #475569, #64748b); }
.apx-card.cancel .apx-time { background: linear-gradient(180deg, #991b1b, #b91c1c); }
.apx-main { flex: 1; min-width: 0; padding: 12px 14px; display: flex; flex-direction: column; gap: 8px; }
.apx-who { display: flex; align-items: center; gap: 10px; min-width: 0; }
.apx-av { width: 38px; height: 38px; border-radius: 12px; background: var(--g-bg); color: var(--g); display: grid; place-items: center; font-size: 13px; font-weight: 800; flex-shrink: 0; overflow: hidden; }
.apx-av img { width: 100%; height: 100%; object-fit: cover; }
.apx-av.lg { width: 48px; height: 48px; font-size: 16px; border-radius: 14px; }
.apx-who-txt { flex: 1; min-width: 0; }
.apx-who-txt b { display: block; font-size: 15px; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.apx-who-txt span { display: flex; align-items: center; gap: 4px; font-size: 12.5px; color: var(--mut); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.apx-who-txt span svg { font-size: 15px; color: var(--gold); }
.apx-st { flex-shrink: 0; font-size: 11px; font-weight: 800; border-radius: 999px; padding: 3px 10px; white-space: nowrap; }
.apx-st.new { background: #e0f2fe; color: #0369a1; } .apx-st.live { background: #fef3c7; color: #b45309; }
.apx-st.done { background: #e7f6ec; color: #166534; } .apx-st.cancel { background: #fee2e2; color: #b91c1c; }
.apx-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.apx-chips span { display: inline-flex; align-items: center; gap: 4px; font-size: 11.5px; font-weight: 600; color: #334155; background: #f3f6f4; border-radius: 8px; padding: 3px 8px; }
.apx-chips span svg { font-size: 14px; color: var(--g); }
.apx-chips span.by { background: #fbf3e2; color: #92651a; }
.apx-concern { display: flex; gap: 6px; margin: 0; font-size: 13px; color: #475569; line-height: 1.45; background: #f8faf9; border-left: 3px solid #a7d7b8; border-radius: 0 8px 8px 0; padding: 6px 10px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.apx-concern svg { font-size: 15px; color: var(--g); vertical-align: -3px; margin-right: 2px; }
.apx-acts { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 2px; }
.apx-acts .apx-btn.primary, .apx-acts .apx-btn.danger { flex: 1; min-width: 130px; }

.apx-empty { text-align: center; background: #fff; border: 1px dashed #cfe3d6; border-radius: 16px; padding: 36px 16px; color: var(--mut); }
.apx-empty b { display: block; font-size: 16px; color: var(--ink); margin-bottom: 4px; }
.apx-empty p { margin: 0 0 12px; font-size: 13.5px; }

.apx-table-wrap { background: #fff; border: 1px solid var(--line); border-radius: 16px; overflow-x: auto; }
.apx-table { width: 100%; border-collapse: collapse; min-width: 880px; font-size: 13px; }
.apx-table th { text-align: left; font-size: 11px; font-weight: 800; letter-spacing: .5px; text-transform: uppercase; color: #fff; background: var(--g-dk); padding: 11px 14px; white-space: nowrap; }
.apx-table td { padding: 11px 14px; border-top: 1px solid #eef2f0; vertical-align: middle; color: #334155; }
.apx-table tr:hover td { background: #f6faf7; cursor: pointer; }
.apx-table td b { display: block; color: var(--ink); font-weight: 700; }
.apx-table td .sub, .apx-table td.when span { display: block; font-size: 11.5px; color: var(--faint); }
.apx-table td.concern { max-width: 260px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.apx-table td.acts .apx-btn { height: 32px; font-size: 12px; }

.apx-overlay { position: fixed; inset: 0; z-index: 1299; background: rgba(15,32,25,.45); animation: apxFade .18s ease; }
@keyframes apxFade { from { opacity: 0; } to { opacity: 1; } }
.apx-drawer { position: fixed; top: 0; right: 0; bottom: 0; width: min(520px, 100vw); z-index: 1300; background: #f6f9f7; display: flex; flex-direction: column;
  box-shadow: -24px 0 60px -24px rgba(4,30,16,.45); animation: apxSlide .26s cubic-bezier(.2,.9,.3,1); font-family: Inter, system-ui, sans-serif; }
@keyframes apxSlide { from { transform: translateX(100%); } to { transform: none; } }
.apx-dr-head { display: flex; align-items: center; gap: 12px; padding: 16px 18px; background: linear-gradient(90deg, #0b3320, #166534); color: #fff; }
.apx-dr-head .apx-av { background: rgba(255,255,255,.16); color: #fff; }
.apx-dr-who { flex: 1; min-width: 0; }
.apx-dr-who b { display: block; font-size: 17px; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.apx-dr-who span { display: block; font-size: 12.5px; color: #bbf7d0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.apx-x { width: 36px; height: 36px; border-radius: 10px; border: 1px solid rgba(255,255,255,.25); background: rgba(255,255,255,.12); color: #fff; display: grid; place-items: center; cursor: pointer; flex-shrink: 0; }
.apx-dr-tabs { display: flex; gap: 4px; padding: 8px 14px 0; background: #fff; border-bottom: 1px solid var(--line); }
.apx-dr-tabs button { height: 40px; padding: 0 14px; border: 0; background: none; font-size: 13.5px; font-weight: 700; color: var(--mut); border-bottom: 2.5px solid transparent; cursor: pointer; font-family: inherit; }
.apx-dr-tabs button.on { color: var(--g); border-bottom-color: var(--gold); }
.apx-dr-body { flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 12px; overscroll-behavior: contain; }
.apx-when { display: grid; grid-template-columns: 1.6fr 1fr 1fr; gap: 8px; }
.apx-when > div { background: #fff; border: 1px solid var(--line); border-radius: 12px; padding: 10px 12px; min-width: 0; }
.apx-when span { display: block; font-size: 11px; font-weight: 700; color: var(--faint); text-transform: uppercase; letter-spacing: .4px; }
.apx-when b { display: block; font-size: 13.5px; font-weight: 800; margin-top: 2px; }
.apx-sec { background: #fff; border: 1px solid var(--line); border-radius: 14px; padding: 12px 14px; }
.apx-sec h3 { font-size: 12px; font-weight: 800; letter-spacing: .5px; text-transform: uppercase; color: var(--g); margin: 0 0 8px; font-family: inherit; }
.apx-sec dl { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 14px; margin: 0; }
.apx-sec dt { font-size: 11.5px; font-weight: 600; color: var(--faint); }
.apx-sec dd { margin: 1px 0 0; font-size: 14px; font-weight: 700; color: var(--ink); word-break: break-word; }
.apx-sec .mono, .apx .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12.5px; }
.apx-contact { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.apx-contact .apx-btn { height: 36px; font-size: 12.5px; max-width: 100%; overflow: hidden; text-overflow: ellipsis; }
.apx-note { margin: 0 0 8px; font-size: 14px; line-height: 1.6; color: #334155; white-space: pre-wrap; background: #f8faf9; border-left: 3px solid #a7d7b8; border-radius: 0 10px 10px 0; padding: 10px 12px; }
.apx-pay { font-size: 12px; font-weight: 800; border-radius: 999px; padding: 2px 10px; }
.apx-pay.ok { background: #e7f6ec; color: #166534; } .apx-pay.warn { background: #fef3c7; color: #b45309; }
.apx-dr-foot { display: flex; gap: 8px; padding: 12px 14px calc(12px + env(safe-area-inset-bottom, 0px)); background: #fff; border-top: 1px solid var(--line); }
.apx-inv { background: #fff; border: 1px solid var(--line); border-radius: 14px; padding: 16px; }
.apx-inv-top { display: flex; justify-content: space-between; gap: 10px; padding-bottom: 12px; border-bottom: 1px dashed #d6e0da; margin-bottom: 12px; }
.apx-inv-top b { display: block; font-size: 15px; color: var(--g-dk); } .apx-inv-top span { display: block; font-size: 11.5px; color: var(--faint); }
.apx-inv-top .r { text-align: right; }
.apx-inv dl { margin: 0; display: grid; gap: 8px; }
.apx-inv dl > div { display: flex; justify-content: space-between; gap: 10px; font-size: 13.5px; }
.apx-inv dt { color: var(--mut); } .apx-inv dd { margin: 0; font-weight: 700; }
.apx-inv-total { display: flex; justify-content: space-between; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--line); font-size: 16px; font-weight: 800; }
.apx-inv-total b { color: var(--g); }
.apx-inv-acts { display: flex; gap: 8px; margin-top: 16px; }

.apx-ring { position: fixed; top: calc(var(--tn-h, 56px) + 10px); left: 50%; transform: translateX(-50%); z-index: 1400; width: min(520px, calc(100vw - 24px));
  display: flex; align-items: center; gap: 12px; background: #0f3d24; color: #fff; border: 1px solid var(--gold); border-radius: 14px; padding: 12px 12px 12px 14px;
  box-shadow: 0 16px 40px -14px rgba(4,30,16,.6); animation: apxDrop .35s cubic-bezier(.34,1.56,.64,1); font-family: Inter, system-ui, sans-serif; }
@keyframes apxDrop { from { transform: translate(-50%, -30px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
.apx-ring > svg { font-size: 26px; color: #f5c542; flex-shrink: 0; }
.apx-ring div { flex: 1; min-width: 0; } .apx-ring b { display: block; font-size: 14.5px; } .apx-ring span { display: block; font-size: 12px; opacity: .75; }
.apx-ring button { height: 34px; padding: 0 14px; border-radius: 9px; border: 0; background: #f5c542; color: #3d2a00; font-weight: 800; font-size: 13px; cursor: pointer; font-family: inherit; }
.apx-ring button.x { width: 34px; padding: 0; background: rgba(255,255,255,.12); color: #fff; display: grid; place-items: center; }

.apx-chips .apx-st-inline { display: none; }
@media (max-width: 767px) {
  .hide-sm { display: none !important; }
  .apx-head h1 { font-size: 20px; }
  .apx-head p { font-size: 12.5px; }
  .apx-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .apx-stat { padding: 11px 12px 9px; } .apx-stat b { font-size: 22px; }
  .apx-bar { flex-direction: column; align-items: stretch; margin: 0 -16px 12px; padding: 8px 16px; }
  .apx-search { width: 100%; }
  .apx-search input { font-size: 16px; }
  .apx-time { width: 76px; } .apx-time b { font-size: 13.5px; }
  .apx-main { padding: 10px 12px; }
  .apx-acts .apx-btn.soft { flex: 1; }
  .apx-sec dl { grid-template-columns: 1fr 1fr; }
  .apx-when { grid-template-columns: 1fr 1fr; } .apx-when > div:first-child { grid-column: 1 / -1; }
  .apx-ring { top: calc(var(--tn-h, 56px) + 6px); }
}
@media (prefers-reduced-motion: reduce) { .apx-drawer, .apx-overlay, .apx-ring, .apx .spin { animation: none; } }

/* -- lighter, compact cards: colour only as an accent -- */
.apx-card { border-radius: 14px; border-left: 3px solid #0369a1; box-shadow: 0 1px 2px rgba(15,23,42,.04); }
.apx-card.live { border-left-color: #d97706; } .apx-card.done { border-left-color: #94a3b8; } .apx-card.cancel { border-left-color: #dc2626; }
.apx-card:hover { box-shadow: 0 10px 24px -18px rgba(15,23,42,.35); border-color: #d6e3da; }
.apx-time, .apx-card.live .apx-time, .apx-card.done .apx-time, .apx-card.cancel .apx-time {
  width: 78px; background: #f6f8f7; color: #0f172a; border-right: 1px solid #edf1ee; padding: 10px 4px; }
.apx-time b { font-size: 13.5px; }
.apx-time span { font-size: 11px; color: #64748b; opacity: 1; }
.apx-time em { background: #fef3c7; color: #92400e; font-size: 10px; }
.apx-main { padding: 10px 12px; gap: 6px; }
.apx-av { width: 32px; height: 32px; border-radius: 10px; font-size: 11.5px; background: #f1f5f3; color: #334155; }
.apx-who-txt b { font-size: 14px; }
.apx-who-txt span { font-size: 12px; }
.apx-st { font-size: 10.5px; padding: 2px 8px; }
.apx-chips span { font-size: 11px; padding: 2px 7px; background: #f4f6f5; }
.apx-chips span svg { font-size: 13px; color: #64748b; }
.apx-concern { font-size: 12.5px; background: none; border-left: 2px solid #e2e8f0; padding: 2px 0 2px 8px; color: #475569; }
.apx-concern svg { color: #94a3b8; }
.apx-acts .apx-btn { height: 32px; font-size: 12.5px; border-radius: 9px; }
.apx-acts .apx-btn.icon { width: 32px; background: #f6f8f7; color: #475569 !important; }
.apx-acts .apx-btn.icon.wa { color: #16a34a !important; }
.apx-acts .apx-btn.primary { background: #166534; box-shadow: none; }
.apx-acts .apx-btn.primary, .apx-acts .apx-btn.danger { min-width: 120px; }
.apx-acts .apx-btn.soft { border-color: #e2e8f0; color: #334155 !important; }
.apx-group h2 { font-size: 12px; color: #334155; }
.apx-group h2 span { background: #eef2f0; color: #475569; }
@media (max-width: 767px) {
  .apx-time { width: 68px; }
  .apx-acts { flex-wrap: nowrap; }
  .apx-acts .apx-lg { display: none; }
  .apx-acts .apx-btn.primary, .apx-acts .apx-btn.danger { flex: 1; min-width: 0; }
  .apx-acts .apx-btn.soft { flex: 0 0 auto; padding: 0 12px; }
}
`;
