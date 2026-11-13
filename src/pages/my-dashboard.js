import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PreSessionForms from "../components/client/pre-session-forms";
import ClientShell, { WA_HELP } from "../components/client/client-shell";
import SessionCard, { CSC_CSS, therapistName, therapistPhoto, dayKey } from "../components/client/session-card";
import { PendingCard, RebookCard, ReviewCard, ReferralCard, ForYouCard, PackCard, ProbonoCard, forYouOffer, bookAgainPath, nextSameSlot, DC_CSS } from "../components/client/dash-cards";
import { DashKpis, ActivityChart, ScreeningSection, KPI_CSS } from "../components/client/dash-kpis";
import { MoodCard, CalmCorner, StartCard, RecentSessions, DW_CSS } from "../components/client/dash-widgets";
import DashAppointmentForm from "../components/dashboard/dash-appointment-form";
import FestivalGiftCards from "../components/festival/festival-gift-card";
import useUserStore from "../store/userStore";
import { GetDashboardDataUrl, getBookings, MyReviewedTherapistsUrl, MyPendingBookingsUrl, MyReferralUrl, apiUrl } from "../utils/url";
import { fetchById } from "../utils/actions";
import { CLIENT_BOOKINGS_EVENT } from "../store/clientNotifStore";
import PhoneCallbackRoundedIcon from "@mui/icons-material/PhoneCallbackRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import PersonSearchRoundedIcon from "@mui/icons-material/PersonSearchRounded";
import PsychologyAltRoundedIcon from "@mui/icons-material/PsychologyAltRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

/* Client home: what's next, how to book, and the therapists you've seen — plus the cards that
   bring people back: book the next session, review the last one, refer a friend, more help. */

// a kind line to open the client's day — a different one each day
// [before the name, after the name, without a name]
const CHEERS = [
  ["Every small step counts, ", " 🌱", "Every small step counts 🌱"],
  ["Showing up for yourself matters, ", "", "Showing up for yourself matters"],
  ["", ", you're doing better than you think", "You're doing better than you think"],
  ["Be gentle with yourself today, ", "", "Be gentle with yourself today"],
  ["Progress, not perfection, ", " 💚", "Progress, not perfection 💚"],
  ["Caring for your mind is strength, ", "", "Caring for your mind is strength"],
  ["", ", one conversation can change a lot", "One conversation can change a lot"],
];
const cheerOf = (d, name) => {
  const day = Math.floor((d.getTime() + 5.5 * 3600000) / 86400000); // IST calendar day
  const [pre, post, plain] = CHEERS[day % CHEERS.length];
  return name ? { pre, name, post } : { pre: plain, name: "", post: "" };
};

// the countdown beside "Your next session": minutes/hours when it's close, else today / tomorrow / in N days
function startsIn(b, now) {
  if (b.status === "Started") return { t: "Live now", live: true };
  const min = Math.round((new Date(b.booking_date).getTime() - now) / 60000);
  if (min <= 0) return { t: "Starting now", live: true };
  if (min < 60) return { t: `Starts in ${min} min`, live: min <= 15 };
  if (min < 180) return { t: `Starts in ${Math.floor(min / 60)} h${min % 60 ? ` ${min % 60} min` : ""}` };
  const days = Math.round((Date.parse(dayKey(b.booking_date)) - Date.parse(dayKey(now))) / 86400000);
  return { t: days <= 0 ? "Today" : days === 1 ? "Tomorrow" : `In ${days} days` };
}

const SKIP_KEY = "cyt_review_skip"; // bookings the client said "Not now" to
const readSkips = () => { try { return JSON.parse(localStorage.getItem(SKIP_KEY) || "[]"); } catch (e) { return []; } };
const REVIEW_WINDOW = 45 * 24 * 60 * 60 * 1000; // only ask about sessions from the last 45 days

const REBOOK_DAYS = 30;
const MISSED_DAYS = 14;

export default function ClientHome() {
  const { userInfo } = useUserStore();
  const [bookings, setBookings] = useState(null);
  const [requests, setRequests] = useState([]);
  const [now, setNow] = useState(() => Date.now());
  const [callback, setCallback] = useState(false);
  const [reviewed, setReviewed] = useState(null); // therapist ids this client has already reviewed
  const [skips, setSkips] = useState([]);
  const [pending, setPending] = useState([]); // bookings left at the payment step
  const [referral, setReferral] = useState(null); // { code, amount, credit, friends }
  const [checks, setChecks] = useState(null); // screenings sent to / taken by the client
  const [packs, setPacks] = useState([]); // session packs with sessions left
  const [probono, setProbono] = useState(null); // the free session and its coupon

  useEffect(() => {
    // also re-run live: the notification stream says when a session is confirmed / starts / moves / ends
    const load = () => {
      fetchById(`${apiUrl}/probono/me`).then((r) => setProbono(r?.data || null)).catch(() => {});
      fetchById(getBookings).then((r) => { if (r?.status) setBookings(r.data || []); else setBookings((b) => b || []); }).catch(() => setBookings((b) => b || []));
      fetchById(MyPendingBookingsUrl).then((r) => setPending(r?.status ? r.data || [] : [])).catch(() => {});
      fetchById(`${apiUrl}/my-bundles`).then((r) => setPacks(r?.status ? r.data || [] : [])).catch(() => {});
      fetchById(GetDashboardDataUrl).then((r) => {
        if (r?.status) setRequests((r.data?.appointmentRequests || []).filter((a) => a.status === "confirmed" || a.status === "rescheduled"));
      }).catch(() => {});
    };
    load();
    window.addEventListener(CLIENT_BOOKINGS_EVENT, load);
    fetchById(MyReviewedTherapistsUrl).then((r) => setReviewed(r?.status ? r.data || [] : [])).catch(() => setReviewed([]));
    fetchById(MyReferralUrl).then((r) => setReferral(r?.status ? r.data || {} : {})).catch(() => setReferral({}));
    fetchById(`${apiUrl}/assessment-requests/mine`).then((r) => setChecks(r?.data || [])).catch(() => setChecks([]));
    setSkips(readSkips());
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => { clearInterval(t); window.removeEventListener(CLIENT_BOOKINGS_EVENT, load); };
  }, []);
  useEffect(() => {
    if (!callback) return undefined;
    const onKey = (e) => { if (e.key === "Escape") setCallback(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [callback]);

  const skipReview = (bookingId) => {
    const list = [...new Set([...readSkips(), bookingId])].slice(-30);
    try { localStorage.setItem(SKIP_KEY, JSON.stringify(list)); } catch (e) { /* storage blocked */ }
    setSkips(list);
  };
  const markReviewed = (therapistId) => setReviewed((r) => [...(r || []), String(therapistId)]);

  const { next, upcoming, therapists, doneCount, last, toReview } = useMemo(() => {
    const list = (bookings || []).filter((b) => b.status !== "Cancelled");
    const cutoff = now - 90 * 60000;
    const live = list.filter((b) => b.status === "Started");
    const ahead = list.filter((b) => b.status === "New" && new Date(b.booking_date).getTime() >= cutoff).sort((a, b) => new Date(a.booking_date) - new Date(b.booking_date));
    const all = [...live, ...ahead];
    const seen = new Map();
    (bookings || []).forEach((b) => { if (b.therapist?._id && !seen.has(b.therapist._id)) seen.set(b.therapist._id, b); });
    // sessions that have happened, newest first — "continue with" and "how was it?" use these
    const past = list
      .filter((b) => b.therapist?._id && (b.status === "Completed" || (b.status !== "Started" && new Date(b.booking_date).getTime() < cutoff)))
      .sort((a, b) => new Date(b.booking_date) - new Date(a.booking_date));
    const done = past.find((b) => b.status === "Completed") || null;
    const askable = done && reviewed && now - new Date(done.booking_date).getTime() < REVIEW_WINDOW
      && !reviewed.includes(String(done.therapist._id)) && !skips.includes(done._id);
    return {
      next: all[0] || null, upcoming: all.slice(1, 4), therapists: [...seen.values()].slice(0, 6),
      doneCount: list.filter((b) => b.status === "Completed").length, last: past[0] || null, toReview: askable ? done : null,
    };
  }, [bookings, now, reviewed, skips]);

  const first = (userInfo?.name || "").trim().split(/\s+/)[0];
  const newbie = bookings !== null && !bookings.length && !pending.length && !packs.length; // nothing booked yet
  // had sessions, but no screening in the last 30 days → suggest a check-in test
  const checkIn = doneCount > 0 && checks !== null && !checks.some((c) => now - new Date(c.createdAt || c.booking_date || 0).getTime() < 30 * 86400000);
  const offer = forYouOffer(bookings);
  // the latest past booking was never started or marked done → don't call it "your last session"
  const lastMissed = !!last && last.status !== "Completed";
  // "continue with this therapist" stays fresh for a month (a missed session for two weeks); after that, the default card
  const rebookable = !!last && now - new Date(last.booking_date).getTime() < (lastMissed ? MISSED_DAYS : REBOOK_DAYS) * 86400000;
  // therapists already shown in "Recent sessions" (its last three past sessions)
  const recentIds = new Set((bookings || [])
    .filter((b) => b.status !== "Cancelled" && b.therapist?._id && (b.status === "Completed" || new Date(b.booking_date).getTime() < now - 90 * 60000))
    .sort((a, b) => new Date(b.booking_date) - new Date(a.booking_date))
    .slice(0, 3)
    .map((b) => b.therapist._id));

  // with no review or pack the main column is short, so this card fills it instead of a stretched one
  const moodInMain = !newbie && !toReview && !packs.length;
  const moodCard = (
    <div className="dw-pair ch-mood">
      <MoodCard now={now} bookHref={last ? bookAgainPath(last, nextSameSlot(last, now)) : "/client/find"} />
    </div>
  );

  return (
    <ClientShell title="My Space">
      <style dangerouslySetInnerHTML={{ __html: CSC_CSS + DC_CSS + DW_CSS + KPI_CSS + HOME_CSS }} />
      <div className="ch">
        <div className="ch-grid">
          <div className="ch-hello">
            {(() => { const c = cheerOf(new Date(now), first); return <h1>{c.pre}{c.name && <span>{c.name}</span>}{c.post}</h1>; })()}
            <p>{bookings === null ? "Loading your sessions…" : next ? "Here's what's coming up." : doneCount ? `You've completed ${doneCount} session${doneCount === 1 ? "" : "s"} with us.` : "Welcome — let's find the right therapist for you."}</p>
          </div>
          <div className="ch-kpi"><DashKpis bookings={bookings} now={now} credit={referral?.credit} /></div>
          <div className="ch-main">

            <div className="ch-pb">
              <ProbonoCard data={probono} onChange={() => fetchById(`${apiUrl}/probono/me`).then((r) => setProbono(r?.data || null)).catch(() => {})} />
            </div>

            <FestivalGiftCards />

            {pending.length > 0 && (
              <section className="ch-next ch-pend">
                <h2>Finish your booking</h2>
                <div className="ch-pend-list">{pending.map((p) => <PendingCard key={p._id} p={p} />)}</div>
              </section>
            )}

            {/* the first thing on every screen: the next session with its countdown, else the next step */}
            <section className={`ch-next${next ? " hero" : ""}`}>
              {next ? (() => { const s = startsIn(next, now); return (
                <div className="ch-next-h"><h2>Your next session</h2><span className={`ch-count${s.live ? " live" : ""}`}><ScheduleRoundedIcon />{s.t}</span></div>
              ); })() : newbie ? null : <h2>{rebookable ? "Your next step" : last ? "Welcome back" : "Your next session"}</h2>}
              {bookings === null ? <div className="ch-skel" /> : next ? <SessionCard b={next} now={now} /> : rebookable ? (
                <RebookCard b={last} now={now} missed={lastMissed} credit={Number(referral?.credit) || 0} />
              ) : pending.length ? (
                <div className="ch-empty">
                  <EventAvailableRoundedIcon />
                  <b>No confirmed sessions yet</b>
                  <p>Complete the payment above to confirm your session.</p>
                </div>
              ) : <StartCard onCallback={() => setCallback(true)} />}
            </section>

            {!newbie && (
              <nav className="ch-quick" aria-label="Quick actions">
                <Link href="/client/find"><PersonSearchRoundedIcon /><span>Find a therapist</span></Link>
                <Link href="/client/my-bookings"><EventAvailableRoundedIcon /><span>My sessions</span></Link>
                <Link href="/self-assessment"><PsychologyAltRoundedIcon /><span>Take a screening</span></Link>
                <a href={WA_HELP} target="_blank" rel="noopener noreferrer"><SupportAgentRoundedIcon /><span>Talk to us</span></a>
              </nav>
            )}

            {bookings !== null && <ActivityChart bookings={bookings} now={now} />}

            {packs.length > 0 && (
              <section className="ch-sec tight">
                <h2>Your session pack{packs.length > 1 ? "s" : ""}</h2>
                <div className="ch-pend-list">{packs.map((p) => <PackCard key={p._id} p={p} now={now} />)}</div>
              </section>
            )}

            {toReview && (
              <section className="ch-sec tight">
                <h2>Your last session</h2>
                <ReviewCard key={toReview._id} b={toReview} user={userInfo} now={now} onDone={markReviewed} onSkip={skipReview} />
              </section>
            )}

            <PreSessionForms compact rows={checks} />

            {moodInMain && moodCard}
          </div>

          <aside className="ch-side">
            {referral !== null && <ReferralCard data={referral} />}
            {bookings !== null && <RecentSessions bookings={bookings} now={now} />}
            <CalmCorner now={now} />
            {/* a first-time client already has the call back in the start card */}
            {!newbie && (
              <button type="button" className="ch-cta alt" onClick={() => setCallback(true)}>
                <PhoneCallbackRoundedIcon />
                <div><b>Not sure whom to book?</b><span>Request a call back — we&apos;ll help you choose</span></div>
              </button>
            )}
          </aside>

          <div className="ch-rest">
            <div className="ch-scr"><ScreeningSection due={checkIn} /></div>
          {upcoming.length > 0 && (
            <section className="ch-sec">
              <div className="ch-sec-h"><h2>Also coming up</h2><Link href="/client/my-bookings">All sessions →</Link></div>
              <div className="ch-cards">{upcoming.map((b) => <SessionCard key={b._id} b={b} now={now} compact />)}</div>
            </section>
          )}

          </div>

          {/* full width under both columns: each row of cards stretches to fill it, however many there are */}
          <div className="ch-band">
            {!moodInMain && moodCard}
            {offer && <ForYouCard offer={offer} />}
            {/* only when Recent sessions doesn't already list every therapist */}
            {therapists.length > 0 && !therapists.every((t) => recentIds.has(t.therapist._id)) && (
              <div className="ch-card">
                <h3>Your therapists</h3>
                {therapists.map((b) => {
                  const photo = therapistPhoto(b);
                  const name = therapistName(b);
                  return (
                    <div key={b.therapist._id} className="ch-ther">
                      <div className="csc-av">{photo ? <img src={photo} alt="" /> : name.replace(/^dr\.?\s*/i, "").charAt(0)}</div>
                      <div className="ch-ther-txt"><b>{name}</b><span>{b.therapist?.profile_type || b.service || ""}</span></div>
                      <Link href={bookAgainPath(b, nextSameSlot(b, now))} className="csc-btn soft">Book again</Link>
                    </div>
                  );
                })}
              </div>
            )}
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
          </div>
        </div>

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

.ch-hello { grid-area: hello; margin-bottom: 14px; }
.ch-kpi { grid-area: kpi; min-width: 0; }
.ch-kpi:empty { display: none; }
.ch-scr { margin-top: 18px; }
/* every card below the stat cards: one dashboard look */
.ch .dw-card, .ch .ch-cta.alt, .ch .dw-pair > * { border-radius: 18px; border-color: #e6ece8; box-shadow: 0 1px 2px rgba(15,23,42,.04), 0 10px 24px -20px rgba(15,23,42,.35); }
.ch .dw-start { padding: 18px; gap: 14px; }
.ch .dw-start-h b { font-size: 17px; }
.ch .dw-topics a { transition: transform .15s ease, background .15s ease; }
.ch .dw-topics a:hover { transform: translateY(-1px); }
.ch .dw-start-alt > * { background: #f6fbf7; border-color: #dcefe3; }
.ch-main > .ck-act { margin-top: 12px; flex: none; }
.ch-hello h1 { font-size: clamp(21px, 2.4vw, 26px); font-weight: 800; margin: 0; letter-spacing: -.3px; color: #0f172a; font-family: inherit; }
.ch-hello h1 span { color: #166534; }
.ch-hello p { margin: 4px 0 0; font-size: 14px; color: #64748b; }
.cls-main:has(.ch) { max-width: none !important; }
/* the two columns end level, and the band below them runs the full width */
.ch-grid { display: grid; grid-template-columns: minmax(0, 1fr) 360px; grid-template-areas: "hello hello" "kpi kpi" "main side" "rest rest" "band band"; column-gap: 16px; align-items: stretch; }
.ch-pend { margin-bottom: 16px; }
.ch-pb:not(:empty) { margin-bottom: 16px; }
.ch-next-h { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 10px; }
.ch-next-h h2 { margin: 0; }
.ch-count { display: inline-flex; align-items: center; gap: 5px; padding: 4px 11px; border-radius: 999px; background: #e7f6ec; color: #166534; font-size: 12.5px; font-weight: 800; white-space: nowrap; }
.ch-count svg { font-size: 16px; }
.ch-count.live { background: #16a34a; color: #fff; animation: chPulse 1.6s ease-in-out infinite; }
@keyframes chPulse { 50% { box-shadow: 0 0 0 6px rgba(22,163,74,.18); } }
/* the next session leads the page: a soft green lift behind its card */
.ch-next.hero > .csc { box-shadow: 0 18px 40px -26px rgba(4,60,30,.55); }
.ch-main > .psf.compact { margin: 16px 0 0; }
.ch-main > .dw-stats { margin-top: 12px; margin-bottom: 0; }
/* the columns end level by growing whatever is last in the main one, never the next-session card above it */
.ch-main > :last-child { flex: 1 0 auto; }
.ch-main > section:last-child { display: flex; flex-direction: column; }
.ch-main > section:last-child > :last-child { flex: 1; }
.ch-main > .dw-stats { flex: none; }
.ch-main > .ch-mood { display: flex; margin-top: 12px; }
.ch-main > .ch-mood > * { flex: 1; min-width: 0; }
@media (min-width: 1280px) and (max-width: 1499px) {
  .ch-grid { grid-template-columns: minmax(0, 1fr) 320px; }
  .ch-main > .dw-stats { grid-template-columns: repeat(3, minmax(0, 1fr)) minmax(0, 1.2fr); gap: 8px; }
}
.ch-quick { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-top: 12px; }
.ch-quick a { display: flex; align-items: center; gap: 10px; min-height: 60px; padding: 10px 12px; border-radius: 16px; background: #fff; border: 1px solid #e6ece8; color: #0f172a !important; font-size: 14px; font-weight: 700; line-height: 1.25; text-decoration: none !important;
  box-shadow: 0 1px 2px rgba(15,23,42,.04), 0 10px 24px -20px rgba(15,23,42,.35); transition: transform .15s ease; }
.ch-quick a:hover { transform: translateY(-2px); }
.ch-quick svg { flex: none; box-sizing: content-box; font-size: 20px; padding: 8px; border-radius: 11px; color: #fff; background: var(--qa); box-shadow: 0 6px 12px -6px var(--qa-sh); }
.ch-quick a:nth-child(1) { --qa: linear-gradient(160deg, #ff9b6b, #e5532a); --qa-sh: rgba(229,83,42,.6); }
.ch-quick a:nth-child(2) { --qa: linear-gradient(160deg, #5ab0ff, #1d63d8); --qa-sh: rgba(29,99,216,.6); }
.ch-quick a:nth-child(3) { --qa: linear-gradient(160deg, #b98cff, #6a3fd6); --qa-sh: rgba(106,63,214,.6); }
.ch-quick a:nth-child(4) { --qa: linear-gradient(160deg, #4fd38b, #12804a); --qa-sh: rgba(18,128,74,.6); }
.ch-band { grid-area: band; display: flex; flex-wrap: wrap; gap: 12px; margin-top: 16px; }
.ch-band > * { flex: 1 1 300px; min-width: 0; margin: 0 !important; }
.ch-band > .ch-mood { flex: 2 1 620px; display: flex; }
.ch-band > .ch-mood > * { flex: 1; min-width: 0; }
.ch-pend-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr)); gap: 12px; }
.ch-main { grid-area: main; } .ch-side { grid-area: side; } .ch-rest { grid-area: rest; min-width: 0; }
.ch h2 { display: flex; align-items: center; gap: 8px; font-size: 16.5px; font-weight: 800; letter-spacing: -.01em; color: #0f172a; margin: 0 0 10px; font-family: inherit; }
.ch h2::before { content: ""; width: 4px; height: 18px; border-radius: 4px; background: linear-gradient(180deg, #34c27a, #15803d); flex: none; }
.ch-skel { height: 220px; border-radius: 16px; background: linear-gradient(90deg,#eef2f0 0%,#f7f9f8 40%,#eef2f0 80%); background-size: 600px 100%; animation: chsk 1.3s infinite linear; }
@keyframes chsk { from { background-position: -300px 0; } to { background-position: 300px 0; } }
.ch-empty { background: #fff; border: 1px dashed #cfe3d6; border-radius: 16px; padding: 28px 18px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 6px; }
.ch-empty > svg { font-size: 34px; color: #16a34a; }
.ch-empty b { font-size: 16px; } .ch-empty p { margin: 0 0 8px; font-size: 13.5px; color: #64748b; }
.ch-side { display: flex; flex-direction: column; gap: 12px; }
.ch-side > :last-child { flex: 1 0 auto; }
.ch-cta { display: flex; align-items: center; gap: 14px; padding: 16px; border-radius: 16px; text-decoration: none !important; color: #fff !important; border: 0; text-align: left; width: 100%; cursor: pointer; font-family: inherit;
  background: linear-gradient(135deg, #0b3320, #166534); box-shadow: 0 12px 26px -16px rgba(4,30,16,.7); }
.ch-cta > svg { font-size: 30px; color: #f5c542; flex-shrink: 0; }
.ch-cta b { display: block; font-size: 15.5px; } .ch-cta span { display: block; font-size: 12.5px; opacity: .8; margin-top: 2px; line-height: 1.4; }
.ch-cta.alt { background: #fff; color: #0f172a !important; border: 1px solid #e4ece7; box-shadow: none; }
.ch-cta.alt > svg { color: #166534; } .ch-cta.alt span { color: #64748b; opacity: 1; }
.ch-card { background: #fff; border: 1px solid #e6ece8; border-radius: 18px; padding: 16px 18px; box-shadow: 0 1px 2px rgba(15,23,42,.04), 0 10px 24px -20px rgba(15,23,42,.35); }
.ch-card h3 { font-size: 14px; font-weight: 800; margin: 0 0 8px; font-family: inherit; }
.ch-req { padding: 8px 0; border-top: 1px solid #eef2f0; } .ch-req:first-of-type { border-top: 0; }
.ch-req b { display: block; font-size: 13px; color: #166534; } .ch-req span { font-size: 12.5px; color: #475569; }
.ch-main { display: flex; flex-direction: column; min-width: 0; }
.ch-sec { margin-top: 22px; }
.ch-sec.tight { margin-top: 16px; }
.ch-sec-h { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
.ch-sec-h a { font-size: 13px; font-weight: 700; color: #166534 !important; text-decoration: none !important; }
.ch-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr)); gap: 12px; }
.ch-ther { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-top: 1px solid #eef2f0; }
.ch-card h3 + .ch-ther { border-top: 0; padding-top: 2px; }
.ch-ther-txt { flex: 1; min-width: 0; } .ch-ther-txt b { display: block; font-size: 14.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ch-ther-txt span { display: block; font-size: 12px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ch-ther .csc-btn { height: 34px; flex: none; padding: 0 12px; font-size: 12.5px; }
.ch-overlay { position: fixed; inset: 0; z-index: 1400; background: rgba(15,23,42,.5); display: flex; align-items: center; justify-content: center; padding: 16px; }
.ch-modal { background: #fff; border-radius: 18px; width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto; box-shadow: 0 24px 60px rgba(0,0,0,.25); }
.ch-modal-h { position: sticky; top: 0; z-index: 1; display: flex; gap: 12px; align-items: flex-start; justify-content: space-between; padding: 16px 18px; background: linear-gradient(90deg, #0b3320, #166534); color: #fff; }
.ch-modal-h b { display: block; font-size: 16px; } .ch-modal-h span { display: block; font-size: 12.5px; color: #bbf7d0; margin-top: 2px; }
.ch-modal-h button { width: 34px; height: 34px; border-radius: 10px; border: 0; background: rgba(255,255,255,.14); color: #fff; display: grid; place-items: center; cursor: pointer; flex-shrink: 0; }
.ch-modal-b { padding: 6px 4px 10px; }
/* below 1280px two columns left the session card ~400px wide (iPad landscape / small laptops, with the
   menu open): one column, with the side cards two across from 700px */
@media (max-width: 1279px) {
  .ch-grid { grid-template-columns: minmax(0, 1fr); grid-template-areas: "hello" "kpi" "main" "rest" "side" "band"; }
  .ch-side { margin-top: 12px; }
  .ch-band { margin-top: 12px; }
  .ch-sec { margin-top: 6px; }
}
@media (min-width: 700px) and (max-width: 1279px) {
  .ch-side { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  .ch-side > :last-child:nth-child(odd) { grid-column: 1 / -1; }
  /* the taller cards pair up, and so do the shorter ones */
  .ch-side > :nth-child(2) { order: 3; } .ch-side > :nth-child(4) { order: 4; }
}
@media (max-width: 699px) {
  .ch-quick { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .ch-band > *, .ch-band > .ch-mood { flex-basis: 100%; }
}
`;
