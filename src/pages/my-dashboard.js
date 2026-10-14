import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ClientShell from "../components/client/client-shell";
import SessionCard, { CSC_CSS, therapistLink, therapistName } from "../components/client/session-card";
import DashAppointmentForm from "../components/dashboard/dash-appointment-form";
import useUserStore from "../store/userStore";
import { GetDashboardDataUrl, getBookings, imagePath } from "../utils/url";
import { fetchById } from "../utils/actions";
import PersonSearchRoundedIcon from "@mui/icons-material/PersonSearchRounded";
import PhoneCallbackRoundedIcon from "@mui/icons-material/PhoneCallbackRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

/* Client home: what's next, how to book, and the therapists you've seen. */

const greeting = (d) => { const h = Number(d.toLocaleString("en-US", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" })); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; };

export default function ClientHome() {
  const { userInfo } = useUserStore();
  const [bookings, setBookings] = useState(null);
  const [requests, setRequests] = useState([]);
  const [now, setNow] = useState(() => Date.now());
  const [callback, setCallback] = useState(false);

  useEffect(() => {
    fetchById(getBookings).then((r) => setBookings(r?.status ? r.data || [] : [])).catch(() => setBookings([]));
    fetchById(GetDashboardDataUrl).then((r) => {
      if (r?.status) setRequests((r.data?.appointmentRequests || []).filter((a) => a.status === "confirmed" || a.status === "rescheduled"));
    }).catch(() => {});
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (!callback) return undefined;
    const onKey = (e) => { if (e.key === "Escape") setCallback(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [callback]);

  const { next, upcoming, therapists, doneCount } = useMemo(() => {
    const list = (bookings || []).filter((b) => b.status !== "Cancelled");
    const cutoff = now - 90 * 60000;
    const live = list.filter((b) => b.status === "Started");
    const ahead = list.filter((b) => b.status === "New" && new Date(b.booking_date).getTime() >= cutoff).sort((a, b) => new Date(a.booking_date) - new Date(b.booking_date));
    const all = [...live, ...ahead];
    const seen = new Map();
    (bookings || []).forEach((b) => { if (b.therapist?._id && !seen.has(b.therapist._id)) seen.set(b.therapist._id, b); });
    return { next: all[0] || null, upcoming: all.slice(1, 4), therapists: [...seen.values()].slice(0, 6), doneCount: list.filter((b) => b.status === "Completed").length };
  }, [bookings, now]);

  const first = (userInfo?.name || "").trim().split(/\s+/)[0];

  return (
    <ClientShell title="Home">
      <style dangerouslySetInnerHTML={{ __html: CSC_CSS + HOME_CSS }} />
      <div className="ch">
        <div className="ch-hello">
          <h1>{greeting(new Date(now))}{first ? <>, <span>{first}</span></> : ""}</h1>
          <p>{bookings === null ? "Loading your sessions…" : next ? "Here's what's coming up." : doneCount ? `You've completed ${doneCount} session${doneCount === 1 ? "" : "s"} with us.` : "Welcome — let's find the right therapist for you."}</p>
        </div>

        <div className="ch-grid">
          <section className="ch-next">
            <h2>Your next session</h2>
            {bookings === null ? <div className="ch-skel" /> : next ? <SessionCard b={next} now={now} /> : (
              <div className="ch-empty">
                <EventAvailableRoundedIcon />
                <b>No upcoming sessions</b>
                <p>Book a session with a verified therapist — online or in person.</p>
                <Link href="/view-all-therapist" className="csc-btn primary" style={{ flex: "none" }}>Find a therapist</Link>
              </div>
            )}
          </section>

          <aside className="ch-side">
            <Link href="/view-all-therapist" className="ch-cta">
              <PersonSearchRoundedIcon />
              <div><b>Book a session</b><span>Browse verified therapists by concern, language and city</span></div>
            </Link>
            <button type="button" className="ch-cta alt" onClick={() => setCallback(true)}>
              <PhoneCallbackRoundedIcon />
              <div><b>Not sure whom to book?</b><span>Request a call back — we&apos;ll help you choose</span></div>
            </button>
            {requests.length > 0 && (
              <div className="ch-card">
                <h3>Appointment requests</h3>
                {requests.slice(0, 3).map((r) => (
                  <div key={r._id} className="ch-req">
                    <b>{r.status === "rescheduled" ? "Rescheduled" : "Confirmed"}</b>
                    <span>{r.confirmedTime || r.preferredTime || ""}{r.concern ? ` · ${r.concern}` : ""}</span>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>

        {upcoming.length > 0 && (
          <section className="ch-sec">
            <div className="ch-sec-h"><h2>Also coming up</h2><Link href="/client/my-bookings">All sessions →</Link></div>
            <div className="ch-cards">{upcoming.map((b) => <SessionCard key={b._id} b={b} now={now} compact />)}</div>
          </section>
        )}

        {therapists.length > 0 && (
          <section className="ch-sec">
            <div className="ch-sec-h"><h2>Your therapists</h2></div>
            <div className="ch-thers">
              {therapists.map((b) => {
                const p = b.therapist?.user?.profile;
                const photo = p && p !== "null" && !/^https?:/.test(p) ? `${imagePath}/${p}` : "";
                const name = therapistName(b);
                return (
                  <div key={b.therapist._id} className="ch-ther">
                    <div className="csc-av">{photo ? <img src={photo} alt="" /> : name.replace(/^dr\.?\s*/i, "").charAt(0)}</div>
                    <div className="ch-ther-txt"><b>{name}</b><span>{b.therapist?.profile_type || b.service || ""}</span></div>
                    <Link href={therapistLink(b)} className="csc-btn soft">Book again</Link>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {callback && (
        <div className="ch-overlay" onClick={(e) => { if (e.target === e.currentTarget) setCallback(false); }}>
          <div className="ch-modal" role="dialog" aria-modal="true" aria-label="Request a call back">
            <div className="ch-modal-h">
              <div><b>Request a call back</b><span>Tell us a little — our team will call to help you choose.</span></div>
              <button type="button" onClick={() => setCallback(false)} aria-label="Close"><CloseRoundedIcon /></button>
            </div>
            <div className="ch-modal-b"><DashAppointmentForm compact /></div>
          </div>
        </div>
      )}
    </ClientShell>
  );
}

const HOME_CSS = `
.ch-hello { margin-bottom: 18px; }
.ch-hello h1 { font-size: clamp(21px, 2.4vw, 26px); font-weight: 800; margin: 0; letter-spacing: -.3px; color: #0f172a; font-family: inherit; }
.ch-hello h1 span { color: #166534; }
.ch-hello p { margin: 4px 0 0; font-size: 14px; color: #64748b; }
.ch-grid { display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 16px; align-items: start; }
.ch h2 { font-size: 13px; font-weight: 800; letter-spacing: .5px; text-transform: uppercase; color: #166534; margin: 0 0 10px; font-family: inherit; }
.ch-skel { height: 220px; border-radius: 16px; background: linear-gradient(90deg,#eef2f0 0%,#f7f9f8 40%,#eef2f0 80%); background-size: 600px 100%; animation: chsk 1.3s infinite linear; }
@keyframes chsk { from { background-position: -300px 0; } to { background-position: 300px 0; } }
.ch-empty { background: #fff; border: 1px dashed #cfe3d6; border-radius: 16px; padding: 28px 18px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 6px; }
.ch-empty > svg { font-size: 34px; color: #16a34a; }
.ch-empty b { font-size: 16px; } .ch-empty p { margin: 0 0 8px; font-size: 13.5px; color: #64748b; }
.ch-side { display: flex; flex-direction: column; gap: 12px; padding-top: 27px; }
.ch-cta { display: flex; align-items: center; gap: 14px; padding: 16px; border-radius: 16px; text-decoration: none !important; color: #fff !important; border: 0; text-align: left; width: 100%; cursor: pointer; font-family: inherit;
  background: linear-gradient(135deg, #0b3320, #166534); box-shadow: 0 12px 26px -16px rgba(4,30,16,.7); }
.ch-cta > svg { font-size: 30px; color: #f5c542; flex-shrink: 0; }
.ch-cta b { display: block; font-size: 15.5px; } .ch-cta span { display: block; font-size: 12.5px; opacity: .8; margin-top: 2px; line-height: 1.4; }
.ch-cta.alt { background: #fff; color: #0f172a !important; border: 1px solid #e4ece7; box-shadow: none; }
.ch-cta.alt > svg { color: #166534; } .ch-cta.alt span { color: #64748b; opacity: 1; }
.ch-card { background: #fff; border: 1px solid #e4ece7; border-radius: 16px; padding: 14px 16px; }
.ch-card h3 { font-size: 14px; font-weight: 800; margin: 0 0 8px; font-family: inherit; }
.ch-req { padding: 8px 0; border-top: 1px solid #eef2f0; } .ch-req:first-of-type { border-top: 0; }
.ch-req b { display: block; font-size: 13px; color: #166534; } .ch-req span { font-size: 12.5px; color: #475569; }
.ch-sec { margin-top: 22px; }
.ch-sec-h { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
.ch-sec-h a { font-size: 13px; font-weight: 700; color: #166534 !important; text-decoration: none !important; }
.ch-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr)); gap: 12px; }
.ch-thers { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr)); gap: 10px; }
.ch-ther { display: flex; align-items: center; gap: 12px; background: #fff; border: 1px solid #e4ece7; border-radius: 14px; padding: 12px; }
.ch-ther-txt { flex: 1; min-width: 0; } .ch-ther-txt b { display: block; font-size: 14.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ch-ther-txt span { display: block; font-size: 12px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ch-ther .csc-btn { height: 36px; flex: none; }
.ch-overlay { position: fixed; inset: 0; z-index: 1400; background: rgba(15,23,42,.5); display: flex; align-items: center; justify-content: center; padding: 16px; }
.ch-modal { background: #fff; border-radius: 18px; width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto; box-shadow: 0 24px 60px rgba(0,0,0,.25); }
.ch-modal-h { position: sticky; top: 0; z-index: 1; display: flex; gap: 12px; align-items: flex-start; justify-content: space-between; padding: 16px 18px; background: linear-gradient(90deg, #0b3320, #166534); color: #fff; }
.ch-modal-h b { display: block; font-size: 16px; } .ch-modal-h span { display: block; font-size: 12.5px; color: #bbf7d0; margin-top: 2px; }
.ch-modal-h button { width: 34px; height: 34px; border-radius: 10px; border: 0; background: rgba(255,255,255,.14); color: #fff; display: grid; place-items: center; cursor: pointer; flex-shrink: 0; }
.ch-modal-b { padding: 6px 4px 10px; }
@media (max-width: 1023px) { .ch-grid { grid-template-columns: 1fr; } .ch-side { padding-top: 0; } }
`;
