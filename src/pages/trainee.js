import React, { useEffect, useState } from "react";
import Link from "next/link";
import TraineeLayout, { useTraineePortal } from "../components/trainee/trainee-layout";
import { tApi, fileUrl, fmtTime, fmtDate, fmtMins } from "../utils/trainee-api";

/* Trainee portal home: today's check-in, internship hours progress, this month at a glance,
   tasks due next, this week's attendance, latest notes, certificate status and help. */
const dayStart = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x.getTime(); };
const KIND = { worksheet: ["Worksheet", "feather-edit-3"], ppt: ["Slides", "feather-monitor"], notes: ["Notes", "feather-file-text"], other: ["File", "feather-paperclip"] };

function Home() {
  const { att, reloadAtt, openCheckOut, live } = useTraineePortal();
  const [ov, setOv] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [updated, setUpdated] = useState(null);
  const load = async () => {
    const r = await tApi("/trainee-portal/overview");
    if (r.status) { setOv(r.data); setUpdated(new Date()); } else setErr(r.message || "Couldn't load your dashboard");
  };
  useEffect(() => { load(); }, []);
  // live: anything the team sends (task, notes, certificate, plan) refreshes the dashboard
  useEffect(() => { if (live) load(); }, [live]); // eslint-disable-line react-hooks/exhaustive-deps
  // refresh the numbers after a check-in / check-out from the top bar
  const todayKey = `${att?.today?.checkIn || ""}|${att?.today?.checkOut || ""}`;
  useEffect(() => { if (ov) load(); }, [todayKey]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ov) return err ? <div className="tl-err">{err}</div> : <div className="tp-load">Loading your dashboard…</div>;

  const { program, attendance: a, tasks, notes, certificate } = ov;
  const today = att?.today;
  const working = !!(today?.checkIn && !today?.checkOut);
  const liveMins = today?.checkIn ? Math.max(0, Math.round(((today.checkOut ? new Date(today.checkOut) : new Date()) - new Date(today.checkIn)) / 60000)) : 0;
  const goalHrs = program ? parseInt(program.hours, 10) || 0 : 0;
  const doneHrs = a.totalMinutes / 60;
  const pct = goalHrs ? Math.min(100, Math.round((doneHrs / goalHrs) * 100)) : 0;
  const leftHrs = Math.max(0, goalHrs - doneHrs);
  const weekMax = Math.max(60, ...a.week.map((d) => d.minutes));
  // the name is already in the top bar — the header leads with where they stand
  const headline = !program ? "Choose a plan to start your internship"
    : pct >= 100 ? "All hours done — brilliant work! 🎉"
      : working ? `In session · ${fmtMins(liveMins)} logged today`
        : doneHrs === 0 ? `Your ${program.hours} journey starts today`
          : `${leftHrs.toFixed(leftHrs < 10 ? 1 : 0)} hrs to go — keep it up!`;

  const checkIn = async () => {
    setBusy(true);
    const r = await tApi("/trainee-portal/attendance/check-in", { method: "POST", body: {} });
    setBusy(false);
    if (!r.status) { window.alert(r.message || "Couldn't check in"); return; }
    reloadAtt();
  };

  return (
    <div className="th">
      {/* ── header: same look as the therapist dashboard ── */}
      <section className="th-hdr">
        <span className="th-ring1" aria-hidden="true" /><span className="th-ring2" aria-hidden="true" /><span className="th-goldline" aria-hidden="true" />
        <div className="th-hdr-row">
          <div className="th-hdr-t">
            <span className="th-date">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</span>
            <div className="th-hdr-h">
              <h1>{headline}</h1>
              <span className="th-badge"><i className="feather-award" aria-hidden="true" /> Trainee</span>
            </div>
            <p className="th-hdr-sub">
              {program
                ? <>{program.hours} · {program.duration}{program.mode ? ` · ${program.mode}` : ""}{program.tracks.length ? <span className="th-tr"> · {program.tracks.slice(0, 2).join(", ")}</span> : null}{program.free ? " · Free plan" : ""}</>
                : <>No plan yet · <Link href="/trainee/upgrade">Choose your plan</Link></>}
            </p>
          </div>
          <div className="th-hdr-a">
            {!today?.checkIn && <button type="button" className="th-act" onClick={checkIn} disabled={busy}><i className="feather-log-in" aria-hidden="true" /> {busy ? "Checking in…" : "Check in"}</button>}
            {working && <button type="button" className="th-act gold" onClick={openCheckOut}><i className="feather-log-out" aria-hidden="true" /> Check out · {fmtMins(liveMins)}</button>}
            {today?.checkOut && <Link href="/trainee/attendance" className="th-act"><i className="feather-check-circle" aria-hidden="true" /> Done today · {fmtMins(liveMins)}</Link>}
            <div className="th-hdr-meta">
              <button type="button" onClick={load} className="th-upd"><i className="feather-refresh-cw" aria-hidden="true" /> {updated ? `Updated ${fmtTime(updated)}` : "Loading…"}</button>
              <Link href="/trainee/profile" className="th-edit">Edit profile <i className="feather-arrow-up-right" aria-hidden="true" /></Link>
            </div>
          </div>
        </div>
        <div className="th-hchips">
          <div className="th-hchip"><span><i className="feather-clock" aria-hidden="true" /></span><div><small>Today</small><b>{today?.checkIn ? fmtMins(liveMins) : "Not in"}</b></div></div>
          <div className="th-hchip"><span><i className="feather-target" aria-hidden="true" /></span><div><small>Hours done</small><b>{program ? `${doneHrs.toFixed(doneHrs < 10 ? 1 : 0)} / ${goalHrs}` : fmtMins(a.totalMinutes)}</b></div></div>
          <div className="th-hchip"><span><i className="feather-calendar" aria-hidden="true" /></span><div><small>This week</small><b>{a.weekDays}/7 days</b></div></div>
        </div>
      </section>

      {/* ── stats ── */}
      <section className="th-stats">
        <Link href="/trainee/attendance" className="th-stat"><i className="feather-calendar" aria-hidden="true" /><span>Days this month</span><b>{a.monthDays}</b></Link>
        <Link href="/trainee/attendance" className="th-stat"><i className="feather-clock" aria-hidden="true" /><span>Hours this month</span><b>{fmtMins(a.monthMinutes)}</b></Link>
        <Link href="/trainee/tasks" className={`th-stat${tasks.overdue ? " warn" : ""}`}><i className="feather-check-square" aria-hidden="true" /><span>Open tasks</span><b>{tasks.open}{tasks.overdue ? <small>{tasks.overdue} overdue</small> : null}</b></Link>
        <Link href="/trainee/certificate" className={`th-stat${certificate ? " gold" : ""}`}><i className="feather-award" aria-hidden="true" /><span>Certificate</span><b className="txt">{certificate ? "Ready" : "Not yet"}</b></Link>
      </section>

      <div className="th-grid">
        <div className="th-col">
        {/* ── internship progress ── */}
        <section className="tp-card th-prog">
          <div className="th-ch"><h2>Internship progress</h2>{program?.canUpgrade && <Link href="/trainee/upgrade" className="th-link">Add hours <i className="feather-arrow-right" aria-hidden="true" /></Link>}</div>
          {program ? (
            <>
              <div className="th-ring-row">
                <div className="th-ring" style={{ "--p": pct }} role="img" aria-label={`${pct}% of ${program.hours} done`}>
                  <span><b>{pct}%</b><small>done</small></span>
                </div>
                <div className="th-prog-t">
                  <b>{doneHrs.toFixed(doneHrs < 10 ? 1 : 0)} of {goalHrs} hrs</b>
                  <span>{leftHrs > 0 ? `${leftHrs.toFixed(leftHrs < 10 ? 1 : 0)} hrs to go` : "All hours completed 🎉"}</span>
                  <span>{a.totalDays} day{a.totalDays === 1 ? "" : "s"} attended</span>
                  {program.startFrom && <span>Started {fmtDate(program.startFrom)}</span>}
                </div>
              </div>
              <ol className="th-steps">
                <li className="done"><i className="feather-check" aria-hidden="true" />Enrolled</li>
                <li className={a.totalDays ? "done" : "now"}><i className={a.totalDays ? "feather-check" : "feather-play"} aria-hidden="true" />Attending</li>
                <li className={pct >= 100 ? "done" : ""}><i className={pct >= 100 ? "feather-check" : "feather-target"} aria-hidden="true" />Hours done</li>
                <li className={certificate ? "done" : ""}><i className="feather-award" aria-hidden="true" />Certificate</li>
              </ol>
            </>
          ) : (
            <div className="th-apply">
              <p>You don&apos;t have an internship plan yet. Choose what you apply for and your hours — it takes a minute.</p>
              <Link href="/trainee/upgrade" className="tl-btn">Choose your plan <i className="feather-arrow-right" aria-hidden="true" /></Link>
            </div>
          )}
        </section>

        {/* ── tasks + notes go here (left column) ── */}
        {/* ── tasks ── */}
        <section className="tp-card th-tasks">
          <div className="th-ch"><h2>Tasks due</h2><Link href="/trainee/tasks" className="th-link">All tasks <i className="feather-arrow-right" aria-hidden="true" /></Link></div>
          {tasks.next.length === 0 ? (
            <div className="th-none"><i className="feather-coffee" aria-hidden="true" /> No open tasks — you&apos;re all caught up.</div>
          ) : tasks.next.map((t) => {
            const late = t.due && dayStart(t.due) < dayStart(new Date());
            const isToday = t.due && dayStart(t.due) === dayStart(new Date());
            return (
              <Link key={t._id} href="/trainee/tasks" className="th-task">
                <span className={`th-task-ic ${t.status}`} aria-hidden="true"><i className={t.status === "doing" ? "feather-loader" : "feather-circle"} /></span>
                <span className="th-task-t"><b>{t.title}</b><small>{t.status === "doing" ? "In progress" : "To do"}{t.priority === "high" ? " · High priority" : ""}</small></span>
                {t.due && <span className={`th-due${late ? " late" : isToday ? " today" : ""}`}>{late ? "Overdue" : isToday ? "Today" : fmtDate(t.due, { day: "numeric", month: "short" })}</span>}
              </Link>
            );
          })}
        </section>

        {/* ── notes ── */}
        <section className="tp-card th-notes">
          <div className="th-ch"><h2>Latest notes</h2><Link href="/trainee/notes" className="th-link">All notes <i className="feather-arrow-right" aria-hidden="true" /></Link></div>
          {notes.length === 0 ? (
            <div className="th-none"><i className="feather-book-open" aria-hidden="true" /> Worksheets and slides from the team will show here.</div>
          ) : notes.map((n) => {
            const [label, icon] = KIND[n.kind] || KIND.other;
            return (
              <a key={n._id} href={n.file ? fileUrl(n.file) : n.link} target="_blank" rel="noreferrer" className="th-note">
                <span className="th-note-ic" aria-hidden="true"><i className={icon} /></span>
                <span className="th-task-t"><b>{n.title}</b><small>{label} · {fmtDate(n.createdAt, { day: "numeric", month: "short" })}</small></span>
                <i className={n.file ? "feather-download" : "feather-external-link"} aria-hidden="true" />
              </a>
            );
          })}
        </section>

        </div>
        <div className="th-col th-col-r">
        {/* ── this week ── */}
        <section className="tp-card th-week">
          <div className="th-ch"><h2>This week</h2><span className="th-muted">{a.weekDays}/7 days</span></div>
          <div className="th-bars" role="img" aria-label="Hours checked in each day this week">
            {a.week.map((d) => {
              const dt = new Date(`${d.date}T12:00:00+05:30`);
              const isToday = dayStart(dt) === dayStart(new Date());
              return (
                <div key={d.date} className={`th-bar${isToday ? " today" : ""}`} title={`${fmtDate(dt, { weekday: "short", day: "numeric", month: "short" })}: ${fmtMins(d.minutes)}`}>
                  <span className="th-bar-v">{d.minutes ? fmtMins(d.minutes).replace(/ 0m$/, "") : ""}</span>
                  <span className="th-bar-col"><span style={{ height: `${d.minutes ? Math.max(8, (d.minutes / weekMax) * 100) : 0}%` }} /></span>
                  <span className="th-bar-d">{dt.toLocaleDateString("en-IN", { weekday: "narrow" })}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── certificate + help ── */}
        <section className={`tp-card th-cert${certificate ? " ready" : ""}`}>
          <span className="th-seal" aria-hidden="true"><i className="feather-award" /></span>
          {certificate ? (
            <>
              <h2>Your certificate is ready</h2>
              <p>{certificate.title} · issued {fmtDate(certificate.createdAt)}</p>
              <a className="tl-btn gold" href={fileUrl(certificate.file)} target="_blank" rel="noreferrer"><i className="feather-download" aria-hidden="true" /> Download</a>
            </>
          ) : (
            <>
              <h2>Certificate</h2>
              <p>Complete your hours and tasks — the team will send your certificate here once your supervisor signs off.</p>
              <Link className="tl-btn ghost" href="/trainee/certificate">How it works</Link>
            </>
          )}
        </section>

        <section className="tp-card th-help">
          <h2>Need help?</h2>
          <p>Questions about sessions, tasks or your certificate? The CYT team is a message away.</p>
          <div className="th-help-a">
            <a className="tl-btn" href="https://wa.me/918077757951?text=Hi%2C%20I%27m%20a%20CYT%20trainee%20and%20need%20help" target="_blank" rel="noreferrer"><i className="feather-message-circle" aria-hidden="true" /> WhatsApp us</a>
            <a className="tl-btn ghost" href="tel:+918077757951"><i className="feather-phone" aria-hidden="true" /> Call</a>
          </div>
          <Link href="/internship-modules" className="th-link th-mod">Internship modules <i className="feather-arrow-right" aria-hidden="true" /></Link>
        </section>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
    </div>
  );
}

const CSS = `
.th { display: grid; grid-template-columns: minmax(0, 1fr); gap: 16px; }
.th-hdr { position: relative; overflow: hidden; color: #0f172a; border-radius: 20px; padding: 22px 24px; background: #eef8f1; border: 1px solid #d5ecdd; box-shadow: 0 10px 28px -24px rgba(20,83,45,.35); }
.th-ring1 { position: absolute; top: -70px; right: -50px; width: 220px; height: 220px; border-radius: 50%; border: 1px solid rgba(21,128,61,.12); pointer-events: none; }
.th-ring2 { position: absolute; top: -30px; right: 40px; width: 120px; height: 120px; border-radius: 50%; background: rgba(255,255,255,.5); pointer-events: none; }
.th-goldline { position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: #4cb874; pointer-events: none; }
.th-hdr-row { position: relative; display: flex; align-items: center; gap: 16px; }
.th-hdr-av { position: relative; width: 62px; height: 62px; flex-shrink: 0; }
.th-hdr-av img, .th-hdr-av > span { width: 100%; height: 100%; border-radius: 14px; object-fit: cover; display: grid; place-items: center; border: 2px solid #e9c46a; box-sizing: border-box; }
.th-hdr-av > span { background: #fff8e6; color: #8a5a0b; font-size: 22px; font-weight: 800; }
.th-hdr-av > i { position: absolute; bottom: -3px; right: -3px; width: 14px; height: 14px; border-radius: 50%; background: #cbd5e1; border: 2.5px solid #fff; }
.th-hdr-av > i.on { background: #22c55e; }
.th-hdr-t { min-width: 0; flex: 1; }
.th-date { display: block; font-size: 11.5px; font-weight: 700; color: #94a3b8; margin-bottom: 3px; letter-spacing: .2px; }
.th-hdr-h { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.th-hdr h1 { margin: 0; font-size: 25px; font-weight: 800; color: #0f172a; line-height: 1.2; }
.th-badge { display: inline-flex; align-items: center; gap: 4px; background: #ecf7ef; color: #166534; border: 1px solid #cfe9d8; border-radius: 999px; padding: 2px 9px; font-size: 10.5px; font-weight: 800; }
.th-hdr-sub { margin: 5px 0 0; font-size: 13.5px; font-weight: 600; color: #64748b; }
.th-hdr-sub a { color: #15803d !important; font-weight: 800; }
.th-hdr-a { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; flex-shrink: 0; }
.th-act { display: inline-flex; align-items: center; justify-content: center; gap: 7px; border: 0; border-radius: 11px; padding: 10px 18px; font: inherit; font-size: 13px; font-weight: 800; white-space: nowrap; cursor: pointer; text-decoration: none !important; background: #14532d; color: #fff !important; box-shadow: 0 8px 18px -10px rgba(20,83,45,.6); transition: transform .15s; }
.th-act:hover { transform: translateY(-1px); }
.th-act.gold { background: #fff; color: #166534 !important; border: 1.5px solid #15803d; box-shadow: none; }
.th-act:disabled { opacity: .7; cursor: wait; }
.th-hdr-meta { display: flex; align-items: center; gap: 12px; }
.th-upd { border: 0; background: none; padding: 0; display: inline-flex; align-items: center; gap: 5px; font: inherit; font-size: 11px; font-weight: 600; color: #94a3b8; cursor: pointer; }
.th-upd:hover { color: #14532d; }
.th-edit { display: inline-flex; align-items: center; gap: 3px; font-size: 11px; font-weight: 800; color: #15803d !important; text-decoration: none !important; }
.th-hchips { position: relative; margin-top: 18px; display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; }
.th-hchips::-webkit-scrollbar { display: none; }
.th-hchip { display: flex; align-items: center; gap: 8px; flex-shrink: 0; background: #fff; border: 1px solid #dcefe3; border-radius: 12px; padding: 7px 12px 7px 8px; }
.th-hchip > span { width: 30px; height: 30px; border-radius: 9px; background: #ecf7ef; color: #15803d; display: grid; place-items: center; font-size: 15px; }
.th-hchip small { display: block; font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: .6px; line-height: 1.2; white-space: nowrap; }
.th-hchip b { display: block; font-size: 15px; font-weight: 800; color: #0f172a; line-height: 1.3; white-space: nowrap; }

.th-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.th-stat { background: #fff; border: 1px solid #e4ece7; border-radius: 16px; padding: 14px 16px; text-decoration: none !important; display: grid; grid-template-columns: auto 1fr; grid-template-rows: auto auto; column-gap: 12px; align-items: center; transition: border-color .15s, transform .15s; }
.th-stat:hover { border-color: #b7dcc4; transform: translateY(-1px); }
.th-stat i { grid-row: 1 / 3; width: 42px; height: 42px; border-radius: 12px; background: #ecf7ef; color: #15803d; display: grid; place-items: center; font-size: 19px; }
.th-stat span { font-size: 12.5px; font-weight: 700; color: #64748b; }
.th-stat b { font-size: 22px; font-weight: 800; color: #0f172a; display: flex; align-items: baseline; gap: 8px; line-height: 1.2; }
.th-stat b.txt { font-size: 18px; }
.th-stat b small { font-size: 11.5px; font-weight: 800; color: #b91c1c; background: #fef2f2; border-radius: 999px; padding: 1px 8px; }
.th-stat:nth-child(1) { background: #eef8f1; border-color: #d5ecdd; } .th-stat:nth-child(1) i { background: #d5f0dd; color: #166534; }
.th-stat:nth-child(2) { background: #eef5fc; border-color: #d6e6f5; } .th-stat:nth-child(2) i { background: #d8e9fa; color: #1d4ed8; }
.th-stat:nth-child(3) { background: #fff4ec; border-color: #f7dfcc; } .th-stat:nth-child(3) i { background: #fde3cf; color: #c2410c; }
.th-stat:nth-child(4) { background: #f5f1fc; border-color: #e4daf5; } .th-stat:nth-child(4) i { background: #e9e0fa; color: #6d28d9; }
.th-stat:hover { border-color: #b7dcc4; }
.th-stat.warn i { background: #fde2e2; color: #b91c1c; }
.th-stat.gold i { background: #fbecb8; color: #8a5a0b; }

.th-grid { display: grid; grid-template-columns: minmax(0, 1fr) 360px; gap: 16px; align-items: start; }
.th-col { display: grid; gap: 16px; min-width: 0; }
.th-col > * { min-width: 0; }
.th-ch { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 14px; }
.th-ch h2, .th-cert h2, .th-help h2 { margin: 0; font-size: 16.5px; font-weight: 800; color: #0f172a; }
.th-link { font-size: 13px; font-weight: 800; color: #15803d !important; text-decoration: none !important; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; }
.th-muted { font-size: 12.5px; font-weight: 700; color: #94a3b8; }

.th-ring-row { display: flex; align-items: center; gap: 22px; flex-wrap: wrap; }
.th-ring { --p: 0; width: 132px; height: 132px; border-radius: 50%; flex-shrink: 0; display: grid; place-items: center; background: conic-gradient(from -90deg, #4cb874 0 calc(var(--p) * 1%), #dcefe3 calc(var(--p) * 1%)); }
.th-ring > span { width: 104px; height: 104px; border-radius: 50%; background: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; line-height: 1.1; }
.th-ring b { font-size: 26px; font-weight: 800; color: #14532d; }
.th-ring small { font-size: 12px; color: #94a3b8; font-weight: 700; }
.th-prog-t { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.th-prog-t b { font-size: 20px; font-weight: 800; color: #0f172a; }
.th-prog-t span { font-size: 13.5px; color: #64748b; }
.th-steps { list-style: none; margin: 18px 0 0; padding: 14px 0 0; border-top: 1px solid #eef2f0; display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
.th-steps li { display: flex; flex-direction: column; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 700; color: #94a3b8; text-align: center; position: relative; }
.th-steps li i { width: 30px; height: 30px; border-radius: 50%; border: 2px solid #e2e8e4; background: #fff; display: grid; place-items: center; font-size: 13px; position: relative; z-index: 1; }
.th-steps li:not(:last-child)::after { content: ""; position: absolute; top: 15px; left: calc(50% + 18px); right: calc(-50% + 18px); height: 2px; background: #e2e8e4; }
.th-steps li.done { color: #14532d; }
.th-steps li.done i { background: #15803d; border-color: #15803d; color: #fff; }
.th-steps li.done:not(:last-child)::after { background: #15803d; }
.th-steps li.now { color: #166534; }
.th-steps li.now i { border-color: #22a35a; color: #15803d; }
.th-apply p { margin: 0 0 14px; color: #64748b; font-size: 14px; }

.th-bars { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; height: 170px; align-items: end; }
.th-bar { display: flex; flex-direction: column; align-items: center; gap: 6px; height: 100%; min-width: 0; }
.th-bar-v { font-size: 10.5px; font-weight: 800; color: #64748b; height: 14px; white-space: nowrap; }
.th-bar-col { flex: 1; width: 100%; max-width: 30px; border-radius: 9px; background: #ffffff; display: flex; align-items: flex-end; overflow: hidden; }
.th-bar-col span { width: 100%; border-radius: 9px; background: #7cc79a; }
.th-bar.today .th-bar-col span { background: #f2c94c; }
.th-bar-d { font-size: 12px; font-weight: 800; color: #94a3b8; }
.th-bar.today .th-bar-d { color: #8a5a0b; }

.th-task, .th-note { display: flex; align-items: center; gap: 12px; padding: 11px 10px; margin: 0 -10px; border-radius: 12px; text-decoration: none !important; color: inherit; }
.th-task:hover, .th-note:hover { background: rgba(255,255,255,.75); }
.th-prog { background: #f2faf5; border-color: #d5ecdd; }
.th-week { background: #f2f7fd; border-color: #d6e6f5; }
.th-tasks { background: #fff8f2; border-color: #f7dfcc; }
.th-notes { background: #f8f5fd; border-color: #e4daf5; }
.th-help { background: #eef9f8; border-color: #cdebe7; }
.th-ring > span { background: #f2faf5 !important; }
.th-task + .th-task, .th-note + .th-note { border-top: 1px solid #f1f5f3; }
.th-task-ic { width: 34px; height: 34px; border-radius: 10px; display: grid; place-items: center; flex-shrink: 0; background: #fde3cf; color: #c2410c; }
.th-task-ic.doing { background: #fbecb8; color: #8a5a0b; }
.th-task-t { display: flex; flex-direction: column; min-width: 0; flex: 1; }
.th-task-t b { font-size: 14px; font-weight: 800; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.th-task-t small { font-size: 12px; color: #94a3b8; font-weight: 600; }
.th-due { font-size: 11.5px; font-weight: 800; border-radius: 999px; padding: 3px 10px; background: #f0faf3; color: #166534; white-space: nowrap; }
.th-due.today { background: #fff7e6; color: #b45309; }
.th-due.late { background: #fef2f2; color: #b91c1c; }
.th-note-ic { width: 34px; height: 34px; border-radius: 10px; display: grid; place-items: center; flex-shrink: 0; background: #e9e0fa; color: #6d28d9; }
.th-note > i { color: #94a3b8; }
.th-none { display: flex; align-items: center; gap: 10px; font-size: 14px; color: #64748b; padding: 10px 0; }
.th-none i { color: #22a35a; font-size: 18px; }

.th-cert { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; }
.th-cert { background: #fffbea; border-color: #f3e6b5; }
.th-cert.ready { background: #fff6d6; border-color: #efd98a; }
.th-cert p, .th-help p { margin: 0 0 6px; font-size: 13.5px; color: #64748b; line-height: 1.55; }
.th-seal { width: 46px; height: 46px; border-radius: 50%; background: #f6d77a; color: #6b4a07; display: grid; place-items: center; font-size: 21px; box-shadow: 0 8px 18px -8px rgba(201,150,44,.6); }
.th-help { display: flex; flex-direction: column; gap: 8px; }
.th-help-a { display: flex; gap: 8px; flex-wrap: wrap; }
.th-mod { margin-top: 6px; }

@media (max-width: 1180px) { .th-grid { grid-template-columns: minmax(0, 1fr) 320px; } }
@media (max-width: 1023px) {
  .th-grid { grid-template-columns: minmax(0, 1fr); }
  .th-col-r { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
  .th-col-r .th-week { grid-column: 1 / -1; }
  .th-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 640px) {
  .th-hdr { padding: 16px; border-radius: 18px; }
  .th-hdr-row { flex-wrap: wrap; align-items: flex-start; gap: 12px; }
  .th-hdr-av { width: 52px; height: 52px; }
  .th-hdr h1 { font-size: 19px; }
  .th-tr { display: none; }
  .th-hdr-a { width: 100%; align-items: stretch; }
  .th-hdr-meta { justify-content: space-between; }
  .th-hchips { margin-left: -16px; margin-right: -16px; padding: 0 16px; }
  .th-col-r { grid-template-columns: minmax(0, 1fr); }
  .th-stat { padding: 12px; column-gap: 10px; }
  .th-stat i { width: 36px; height: 36px; font-size: 16px; }
  .th-stat b { font-size: 18px; }
  .th-ring { width: 110px; height: 110px; } .th-ring > span { width: 86px; height: 86px; } .th-ring b { font-size: 22px; }
  .th-steps li { font-size: 11px; }
  .th-bars { height: 150px; gap: 5px; }
}
`;

export default function TraineeHome() {
  return <TraineeLayout title="Dashboard"><Home /></TraineeLayout>;
}
