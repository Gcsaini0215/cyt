import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ClientShell from "../../components/client/client-shell";
import SessionCard, { CSC_CSS } from "../../components/client/session-card";
import { fetchById } from "../../utils/actions";
import { getBookings } from "../../utils/url";
import { CLIENT_BOOKINGS_EVENT } from "../../store/clientNotifStore";
import { usePager, Pager } from "../../components/therapists/pager";

/* My Sessions: every booking with its progress — upcoming first, then past, then cancelled. */

const TABS = [
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
  { key: "cancelled", label: "Cancelled" },
];

export default function MySessions() {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("upcoming");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const load = () => fetchById(getBookings).then((r) => setData(r?.status ? r.data || [] : [])).catch(() => setData((d) => d || []));
    load();
    window.addEventListener(CLIENT_BOOKINGS_EVENT, load); // live: a session was confirmed / started / moved / ended
    const t = setInterval(() => { setNow(Date.now()); if (!document.hidden) load(); }, 60000);
    return () => { clearInterval(t); window.removeEventListener(CLIENT_BOOKINGS_EVENT, load); };
  }, []);

  const groups = useMemo(() => {
    const cutoff = now - 90 * 60000;
    const list = data || [];
    const upcoming = list.filter((b) => b.status === "Started" || (b.status === "New" && new Date(b.booking_date).getTime() >= cutoff))
      .sort((a, b) => (a.status === "Started" ? -1 : b.status === "Started" ? 1 : new Date(a.booking_date) - new Date(b.booking_date)));
    const past = list.filter((b) => b.status === "Completed" || (b.status === "New" && new Date(b.booking_date).getTime() < cutoff))
      .sort((a, b) => new Date(b.booking_date) - new Date(a.booking_date));
    const cancelled = list.filter((b) => b.status === "Cancelled").sort((a, b) => new Date(b.booking_date) - new Date(a.booking_date));
    return { upcoming, past, cancelled };
  }, [data, now]);

  // open on Past when there's nothing upcoming
  useEffect(() => {
    if (data && !groups.upcoming.length && groups.past.length && tab === "upcoming") setTab("past");
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  const shown = groups[tab] || [];
  const pg = usePager(shown, 6, tab);

  return (
    <ClientShell title="My Sessions">
      <style dangerouslySetInnerHTML={{ __html: CSC_CSS + MS_CSS }} />
      <div className="ms-head">
        <div>
          <h1>My Sessions</h1>
          <p>Every booking and where it stands. Join opens 15 minutes before an online session.</p>
        </div>
        <Link href="/client/find" className="csc-btn primary" style={{ flex: "none" }}>Book a session</Link>
      </div>

      <div className="ms-tabs" role="tablist" aria-label="Sessions">
        {TABS.map((t) => (
          <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} className={tab === t.key ? "on" : ""} onClick={() => setTab(t.key)}>
            {t.label}<i>{groups[t.key].length}</i>
          </button>
        ))}
      </div>

      {data === null ? (
        <div className="ms-grid">{[1, 2].map((i) => <div key={i} className="ms-skel" />)}</div>
      ) : shown.length ? (
        <div data-pager-scope>
          <div className="ms-grid">{pg.items.map((b) => <SessionCard key={b._id} b={b} now={now} />)}</div>
          <Pager pg={pg} noun="sessions" />
        </div>
      ) : (
        <div className="ms-empty">
          <b>{tab === "upcoming" ? "No upcoming sessions" : tab === "past" ? "No past sessions yet" : "No cancelled sessions"}</b>
          {tab === "upcoming" && <p>Find a therapist and book your first session — online or in person.</p>}
          {tab === "upcoming" && <Link href="/client/find" className="csc-btn primary" style={{ flex: "none" }}>Find a therapist</Link>}
        </div>
      )}
    </ClientShell>
  );
}

const MS_CSS = `
.ms-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 14px; }
.ms-head h1 { font-size: clamp(21px, 2.4vw, 26px); font-weight: 800; margin: 0; letter-spacing: -.3px; font-family: inherit; color: #0f172a; }
.ms-head p { margin: 4px 0 0; font-size: 13.5px; color: #64748b; }
.ms-tabs { position: sticky; top: var(--cls-h, 60px); z-index: 20; display: flex; gap: 6px; padding: 8px 0; margin-bottom: 8px; background: #f1f6f2; overflow-x: auto; scrollbar-width: none; }
.ms-tabs::-webkit-scrollbar { display: none; }
.ms-tabs button { flex: 0 0 auto; display: inline-flex; align-items: center; gap: 7px; height: 38px; padding: 0 15px; border-radius: 999px; border: 1px solid #e4ece7; background: #fff; color: #64748b; font-size: 13.5px; font-weight: 700; cursor: pointer; font-family: inherit; }
.ms-tabs button i { font-style: normal; font-size: 11px; font-weight: 800; background: #eef2f0; color: #64748b; border-radius: 999px; padding: 0 7px; line-height: 18px; }
.ms-tabs button.on { background: #0f3d24; border-color: #0f3d24; color: #fff; }
.ms-tabs button.on i { background: rgba(255,255,255,.2); color: #fff; }
.ms-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 380px), 1fr)); gap: 14px; }
.ms-skel { height: 260px; border-radius: 16px; background: linear-gradient(90deg,#eef2f0 0%,#f7f9f8 40%,#eef2f0 80%); background-size: 600px 100%; animation: mssk 1.3s infinite linear; }
@keyframes mssk { from { background-position: -300px 0; } to { background-position: 300px 0; } }
.ms-empty { background: #fff; border: 1px dashed #cfe3d6; border-radius: 16px; padding: 32px 18px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 6px; color: #64748b; }
.ms-empty b { color: #0f172a; font-size: 16px; } .ms-empty p { margin: 0 0 8px; font-size: 13.5px; }
@media (max-width: 767px) { .ms-head .csc-btn { width: 100%; } .ms-tabs { margin: 0 -16px 8px; padding: 8px 16px; } }
`;
