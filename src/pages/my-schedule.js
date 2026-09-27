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

/* My Schedule — one place for a therapist to see today's sessions, the week's booked / free
   slots, and to set up weekly hours and fees (moved here from Settings). */

const TABS = [
  { id: "today", label: "Today", icon: "feather-sun" },
  { id: "week", label: "Week", icon: "feather-calendar" },
  { id: "availability", label: "Availability", icon: "feather-clock" },
  { id: "fees", label: "Fees", icon: "feather-credit-card" },
];
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
const minsOf = (d) => d.getHours() * 60 + d.getMinutes();

// session start minutes for a weekday, from the weekly availability
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
const statusMeta = (s) => ({
  [SESSION_STATUS.NEW]: ["Booked", "#1d4ed8", "#eff6ff"],
  [SESSION_STATUS.STARTED]: ["In session", "#b45309", "#fffbeb"],
  [SESSION_STATUS.COMPLETED]: ["Completed", "#15803d", "#f0fdf4"],
  [SESSION_STATUS.CANCELED]: ["Cancelled", "#b91c1c", "#fef2f2"],
}[s] || [s || "Booked", "#475569", "#f1f5f9"]);

export default function MySchedule() {
  const router = useRouter();
  const { therapistInfo, fetchTherapistInfo } = useTherapistStore();
  const [tab, setTab] = useState("today");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weekStart, setWeekStart] = useState(() => startOfDay(new Date()));
  const [picked, setPicked] = useState(null); // booking shown in the details box

  // tab from the URL (?tab=availability) so other pages can deep-link
  useEffect(() => {
    if (!router.isReady) return;
    const t = String(router.query.tab || "");
    if (TABS.some((x) => x.id === t)) setTab(t);
  }, [router.isReady, router.query.tab]);
  const go = (id) => {
    setTab(id);
    router.replace({ pathname: router.pathname, query: id === "today" ? {} : { tab: id } }, undefined, { shallow: true });
  };

  useEffect(() => { if (!therapistInfo?.user?.email) fetchTherapistInfo(); }, [therapistInfo?.user?.email, fetchTherapistInfo]);

  const loadBookings = useCallback(async () => {
    try {
      const res = await fetchData(getBookings);
      if (res?.status) setBookings(res.data || []);
    } catch { /* not logged in / offline — the layout handles auth */ }
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
  const live = useMemo(() => bookings
    .filter((b) => b.status !== SESSION_STATUS.CANCELED)
    .map((b) => ({ ...b, at: new Date(b.booking_date) })), [bookings]);

  const now = new Date();

  /* ── Today ── */
  const today = useMemo(() => live.filter((b) => sameDay(b.at, now)).sort((a, b) => a.at - b.at), [live]); // eslint-disable-line react-hooks/exhaustive-deps
  const nextUp = useMemo(() => live.filter((b) => b.at > now && b.status === SESSION_STATUS.NEW).sort((a, b) => a.at - b.at)[0] || null, [live]); // eslint-disable-line react-hooks/exhaustive-deps
  const todayFree = useMemo(() => {
    const taken = new Set(today.map((b) => minsOf(b.at)));
    return slotsFor(avail, now).filter((m) => m > minsOf(now) && !taken.has(m));
  }, [avail, today]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Week ── */
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => { const d = new Date(weekStart); d.setDate(d.getDate() + i); return d; }), [weekStart]);
  const rows = useMemo(() => {
    const set = new Set();
    days.forEach((d) => slotsFor(avail, d).forEach((m) => set.add(m)));
    live.forEach((b) => { if (days.some((d) => sameDay(d, b.at))) set.add(minsOf(b.at)); });
    return [...set].sort((a, b) => a - b);
  }, [days, avail, live]);
  const weekBooked = live.filter((b) => b.at >= days[0] && b.at < new Date(days[6].getTime() + 864e5)).length;
  const weekOpen = days.reduce((n, d) => n + slotsFor(avail, d).filter((m) => {
    const at = new Date(d); at.setHours(Math.floor(m / 60), m % 60, 0, 0);
    return at > now && !live.some((b) => b.at.getTime() === at.getTime());
  }).length, 0);

  const cell = (d, m) => {
    const b = live.find((x) => sameDay(x.at, d) && minsOf(x.at) === m);
    if (b) return { kind: "booked", b };
    if (!slotsFor(avail, d).includes(m)) return { kind: "off" };
    const at = new Date(d); at.setHours(Math.floor(m / 60), m % 60, 0, 0);
    return { kind: at <= now ? "past" : "free" };
  };

  const fmtWhen = (d) => `${sameDay(d, now) ? "Today" : `${SDAYS[d.getDay()]} ${d.getDate()} ${MONS[d.getMonth()]}`}, ${timeLabel(minsOf(d))}`;

  return (
    <MainLayout>
      <style dangerouslySetInnerHTML={{ __html: `
        .ms-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 14px; }
        .ms-title { font-size: 22px; font-weight: 800; color: #0f3d24; margin: 0; }
        .ms-sub { font-size: 13px; color: #64748b; margin: 4px 0 0; }
        .ms-tabs { display: flex; gap: 6px; background: #fff; border: 1px solid #e3ebe6; border-radius: 12px; padding: 5px; margin-bottom: 16px; overflow-x: auto; }
        .ms-tab { display: inline-flex; align-items: center; gap: 7px; border: none; background: none; padding: 9px 16px; border-radius: 9px; font-size: 13.5px; font-weight: 700; color: #5b6b62; cursor: pointer; white-space: nowrap; font-family: inherit; }
        .ms-tab.on { background: #0f3d24; color: #fff; }
        .ms-tab .dot { width: 7px; height: 7px; border-radius: 50%; background: #f59e0b; }
        .ms-card { background: #fff; border: 1px solid #e3ebe6; border-radius: 14px; padding: 18px; margin-bottom: 14px; }
        .ms-card h3 { font-size: 15px; font-weight: 800; color: #122019; margin: 0 0 12px; }
        .ms-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-bottom: 14px; }
        .ms-stat { background: #fff; border: 1px solid #e3ebe6; border-radius: 12px; padding: 14px; }
        .ms-stat b { display: block; font-size: 22px; font-weight: 800; color: #0f3d24; }
        .ms-stat span { font-size: 12px; color: #64748b; font-weight: 600; }
        .ms-next { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; background: linear-gradient(135deg, #0f3d24, #1a6b3a); color: #fff; border-radius: 14px; padding: 16px 18px; margin-bottom: 14px; }
        .ms-next small { display: block; font-size: 11.5px; letter-spacing: .6px; text-transform: uppercase; opacity: .75; font-weight: 700; }
        .ms-next b { font-size: 17px; }
        .ms-next a { margin-left: auto; background: #fff; color: #0f3d24 !important; font-weight: 800; font-size: 13px; padding: 9px 16px; border-radius: 9px; text-decoration: none; }
        .ms-list { display: flex; flex-direction: column; gap: 8px; }
        .ms-row { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border: 1px solid #e8efeb; border-radius: 11px; cursor: pointer; background: #fff; text-align: left; font-family: inherit; width: 100%; }
        .ms-row:hover { border-color: #bbf7d0; background: #fbfefc; }
        .ms-time { width: 76px; flex-shrink: 0; font-weight: 800; color: #0f3d24; font-size: 14px; }
        .ms-who { flex: 1; min-width: 0; }
        .ms-who b { display: block; font-size: 14px; color: #122019; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .ms-who span { font-size: 12px; color: #64748b; }
        .ms-pill { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 999px; white-space: nowrap; }
        .ms-free { display: flex; flex-wrap: wrap; gap: 6px; }
        .ms-free span { font-size: 12.5px; font-weight: 700; color: #166534; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 5px 10px; border-radius: 999px; }
        .ms-empty { text-align: center; padding: 26px 10px; color: #64748b; font-size: 13.5px; }
        .ms-empty a { color: #166534; font-weight: 700; }
        .ms-weekbar { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
        .ms-weekbar button { border: 1px solid #d5e3da; background: #fff; border-radius: 8px; padding: 7px 12px; font-weight: 700; font-size: 12.5px; color: #0f3d24; cursor: pointer; font-family: inherit; }
        .ms-weekbar strong { font-size: 14px; color: #122019; margin: 0 6px; }
        .ms-legend { display: flex; gap: 12px; flex-wrap: wrap; font-size: 12px; color: #475569; margin-left: auto; }
        .ms-legend i { display: inline-block; width: 11px; height: 11px; border-radius: 3px; margin-right: 5px; vertical-align: -1px; }
        .ms-grid-wrap { overflow-x: auto; border: 1px solid #e3ebe6; border-radius: 12px; }
        .ms-grid { border-collapse: separate; border-spacing: 0; width: 100%; min-width: 720px; }
        .ms-grid th { position: sticky; top: 0; background: #f6faf7; font-size: 12px; font-weight: 800; color: #0f3d24; padding: 9px 6px; border-bottom: 1px solid #e3ebe6; text-align: center; }
        .ms-grid th.today { background: #0f3d24; color: #fff; }
        .ms-grid td { padding: 3px; border-bottom: 1px solid #f1f5f3; }
        .ms-grid td.t { font-size: 12px; font-weight: 700; color: #64748b; white-space: nowrap; padding: 0 10px; width: 80px; }
        .ms-c { height: 38px; border-radius: 7px; font-size: 11.5px; font-weight: 700; display: flex; align-items: center; justify-content: center; padding: 0 6px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
        .ms-c.free { background: #f0fdf4; color: #16a34a; border: 1px dashed #86efac; }
        .ms-c.booked { background: #1a6b3a; color: #fff; cursor: pointer; }
        .ms-c.past { background: #f8fafc; color: #cbd5e1; }
        .ms-c.off { background: repeating-linear-gradient(45deg, #fafafa, #fafafa 6px, #f3f4f6 6px, #f3f4f6 12px); }
        .ms-detail { position: fixed; inset: 0; z-index: 1300; background: rgba(15,23,20,.4); display: flex; align-items: center; justify-content: center; padding: 16px; }
        .ms-detail > div { background: #fff; border-radius: 16px; padding: 22px; width: 100%; max-width: 420px; box-shadow: 0 24px 60px rgba(15,61,34,.3); }
        .ms-detail h4 { font-size: 18px; font-weight: 800; color: #122019; margin: 0 0 4px; }
        .ms-kv { display: grid; grid-template-columns: 110px 1fr; gap: 8px 12px; font-size: 13.5px; margin: 14px 0 18px; }
        .ms-kv span { color: #64748b; font-weight: 600; }
        .ms-actions { display: flex; gap: 8px; }
        .ms-actions a, .ms-actions button { flex: 1; text-align: center; padding: 11px; border-radius: 10px; font-weight: 800; font-size: 13.5px; text-decoration: none; cursor: pointer; font-family: inherit; }
        .ms-actions a { background: #0f3d24; color: #fff !important; border: none; }
        .ms-actions button { background: #fff; border: 1.5px solid #d5e3da; color: #334155; }
        .ms-setup { background: #fffbeb; border: 1px solid #fde68a; color: #78350f; border-radius: 12px; padding: 12px 14px; font-size: 13.5px; margin-bottom: 14px; }
        .ms-setup button { background: none; border: none; color: #92400e; font-weight: 800; text-decoration: underline; cursor: pointer; padding: 0; font-family: inherit; font-size: 13.5px; }
      ` }} />

      <div className="ms-head">
        <div>
          <h1 className="ms-title">My Schedule</h1>
          <p className="ms-sub">Your sessions, free slots, weekly hours and fees — all in one place.</p>
        </div>
      </div>

      <div className="ms-tabs" role="tablist" aria-label="My Schedule">
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className={`ms-tab ${tab === t.id ? "on" : ""}`} onClick={() => go(t.id)}>
            <i className={t.icon} /> {t.label}
            {((t.id === "availability" && !hasHours) || (t.id === "fees" && !hasFees)) && therapistInfo?.user?.email && <span className="dot" title="Needs setup" />}
          </button>
        ))}
      </div>

      {(tab === "today" || tab === "week") && therapistInfo?.user?.email && !hasHours && (
        <div className="ms-setup">
          You haven&rsquo;t set your weekly hours yet, so clients can&rsquo;t book you.{" "}
          <button type="button" onClick={() => go("availability")}>Set your availability →</button>
        </div>
      )}

      {tab === "today" && (
        <>
          <div className="ms-stats">
            <div className="ms-stat"><b>{today.length}</b><span>Sessions today</span></div>
            <div className="ms-stat"><b>{today.filter((b) => b.status === SESSION_STATUS.COMPLETED).length}</b><span>Completed today</span></div>
            <div className="ms-stat"><b>{todayFree.length}</b><span>Free slots left today</span></div>
            <div className="ms-stat"><b>{live.filter((b) => b.at > now && b.status === SESSION_STATUS.NEW).length}</b><span>Upcoming (all)</span></div>
          </div>

          {nextUp && (
            <div className="ms-next">
              <div>
                <small>Next session</small>
                <b>{clientName(nextUp)} · {fmtWhen(nextUp.at)}</b>
              </div>
              <Link href="/appointments">Open in Appointments</Link>
            </div>
          )}

          <div className="ms-card">
            <h3>Today&rsquo;s sessions</h3>
            {loading ? <div className="ms-empty">Loading…</div> : today.length === 0 ? (
              <div className="ms-empty">No sessions today.{todayFree.length ? " Your open slots are below." : ""}</div>
            ) : (
              <div className="ms-list">
                {today.map((b) => {
                  const [label, color, bg] = statusMeta(b.status);
                  return (
                    <button type="button" key={b._id} className="ms-row" onClick={() => setPicked(b)}>
                      <span className="ms-time">{timeLabel(minsOf(b.at))}</span>
                      <span className="ms-who"><b>{clientName(b)}</b><span>{[b.service, b.format].filter(Boolean).join(" · ")}</span></span>
                      <span className="ms-pill" style={{ color, background: bg }}>{label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="ms-card">
            <h3>Free slots left today</h3>
            {todayFree.length ? (
              <div className="ms-free">{todayFree.map((m) => <span key={m}>{timeLabel(m)}</span>)}</div>
            ) : (
              <div className="ms-empty" style={{ padding: 8 }}>No free slots left today. <button type="button" onClick={() => go("availability")} style={{ background: "none", border: "none", color: "#166534", fontWeight: 700, cursor: "pointer" }}>Edit hours</button></div>
            )}
          </div>
        </>
      )}

      {tab === "week" && (
        <>
          <div className="ms-stats">
            <div className="ms-stat"><b>{weekBooked}</b><span>Booked this week</span></div>
            <div className="ms-stat"><b>{weekOpen}</b><span>Open slots left</span></div>
          </div>
          <div className="ms-card">
            <div className="ms-weekbar">
              <button type="button" onClick={() => setWeekStart((d) => { const x = new Date(d); x.setDate(x.getDate() - 7); return x; })} aria-label="Previous week">‹ Prev</button>
              <strong>{days[0].getDate()} {MONS[days[0].getMonth()]} – {days[6].getDate()} {MONS[days[6].getMonth()]}</strong>
              <button type="button" onClick={() => setWeekStart((d) => { const x = new Date(d); x.setDate(x.getDate() + 7); return x; })} aria-label="Next week">Next ›</button>
              {!sameDay(days[0], now) && <button type="button" onClick={() => setWeekStart(startOfDay(new Date()))}>This week</button>}
              <div className="ms-legend">
                <span><i style={{ background: "#1a6b3a" }} />Booked</span>
                <span><i style={{ background: "#f0fdf4", border: "1px dashed #86efac" }} />Free</span>
                <span><i style={{ background: "#f3f4f6" }} />Not working</span>
              </div>
            </div>
            {rows.length === 0 ? (
              <div className="ms-empty">No hours set for these days. <button type="button" onClick={() => go("availability")} style={{ background: "none", border: "none", color: "#166534", fontWeight: 700, cursor: "pointer" }}>Set availability</button></div>
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
          </div>
        </>
      )}

      {tab === "availability" && (
        <div className="ms-card">
          <h3>Weekly hours</h3>
          <p className="ms-sub" style={{ marginTop: -6, marginBottom: 14 }}>Tap (or drag across) the hours you&rsquo;re available — each box is a 60-minute session clients can book. Tap a day or a time to select the whole column / row.</p>
          <AvailabilityGrid onSuccess={fetchTherapistInfo} />
        </div>
      )}

      {tab === "fees" && (
        <div className="ms-card">
          <h3>Session fees</h3>
          <TherapistFees onSuccess={fetchTherapistInfo} />
        </div>
      )}

      {picked && (
        <div className="ms-detail" onClick={(e) => e.target === e.currentTarget && setPicked(null)} role="dialog" aria-modal="true" aria-label="Session details">
          <div>
            <h4>{clientName(picked)}</h4>
            <span className="ms-pill" style={{ color: statusMeta(picked.status)[1], background: statusMeta(picked.status)[2] }}>{statusMeta(picked.status)[0]}</span>
            <div className="ms-kv">
              <span>When</span><b>{fmtWhen(new Date(picked.booking_date))}</b>
              {picked.service && <><span>Service</span><b>{picked.service}</b></>}
              {picked.format && <><span>Format</span><b>{picked.format}</b></>}
              {picked.client?.phone && <><span>Phone</span><a href={`tel:${picked.client.phone}`}>{picked.client.phone}</a></>}
              {picked.notes && <><span>Notes</span><b style={{ fontWeight: 500 }}>{picked.notes}</b></>}
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
