import React, { useEffect, useState } from "react";
import Link from "next/link";
import TraineeLayout, { useTraineePortal } from "../components/trainee/trainee-layout";
import { tApi, fileUrl, fmtTime, fmtDate, fmtMins } from "../utils/trainee-api";

/* Trainee portal home: today's check-in, internship hours progress, this month at a glance,
   tasks due next, this week's attendance, latest notes, certificate status and help. */
const greet = () => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; };
const dayStart = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x.getTime(); };
const KIND = { worksheet: ["Worksheet", "feather-edit-3"], ppt: ["Slides", "feather-monitor"], notes: ["Notes", "feather-file-text"], other: ["File", "feather-paperclip"] };

function Home() {
  const { me, profile, att, reloadAtt, openCheckOut } = useTraineePortal();
  const [ov, setOv] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const load = async () => {
    const r = await tApi("/trainee-portal/overview");
    if (r.status) setOv(r.data); else setErr(r.message || "Couldn't load your dashboard");
  };
  useEffect(() => { load(); }, []);
  // refresh the numbers after a check-in / check-out from the top bar
  const todayKey = `${att?.today?.checkIn || ""}|${att?.today?.checkOut || ""}`;
  useEffect(() => { if (ov) load(); }, [todayKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const first = profile?.firstName || (me?.name || "").split(" ")[0] || "there";
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

  const checkIn = async () => {
    setBusy(true);
    const r = await tApi("/trainee-portal/attendance/check-in", { method: "POST", body: {} });
    setBusy(false);
    if (!r.status) { window.alert(r.message || "Couldn't check in"); return; }
    reloadAtt();
  };

  return (
    <div className="th">
      {/* ── hero: greeting + today ── */}
      <section className="th-hero">
        <div className="th-hero-l">
          <span className="th-date">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</span>
          <h1>{greet()}, {first}</h1>
          {program ? (
            <div className="th-chips">
              <span><i className="feather-clock" aria-hidden="true" /> {program.hours}</span>
              {program.duration && <span><i className="feather-calendar" aria-hidden="true" /> {program.duration}</span>}
              {program.mode && <span><i className={program.mode === "Online" ? "feather-monitor" : "feather-map-pin"} aria-hidden="true" /> {program.mode}</span>}
              {program.tracks.slice(0, 2).map((t) => <span key={t} className="gold">{t}</span>)}
            </div>
          ) : <p className="th-sub">Welcome to your trainee portal.</p>}
        </div>
        <div className="th-today">
          {!today?.checkIn && (
            <>
              <b>Not checked in yet</b>
              <span>Check in when you start today&apos;s work.</span>
              <button type="button" className="th-cta" onClick={checkIn} disabled={busy}><i className="feather-log-in" aria-hidden="true" /> {busy ? "Checking in…" : "Check in"}</button>
            </>
          )}
          {working && (
            <>
              <b><i className="th-dot" /> Checked in · {fmtMins(liveMins)}</b>
              <span>Since {fmtTime(today.checkIn)}</span>
              <button type="button" className="th-cta out" onClick={openCheckOut}><i className="feather-log-out" aria-hidden="true" /> Check out</button>
            </>
          )}
          {today?.checkOut && (
            <>
              <b><i className="feather-check-circle" aria-hidden="true" /> Done for today · {fmtMins(liveMins)}</b>
              <span>{fmtTime(today.checkIn)} – {fmtTime(today.checkOut)}</span>
              <Link href="/trainee/attendance" className="th-cta ghost">View attendance</Link>
            </>
          )}
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
              <p>You haven&apos;t applied for an internship yet. Pick your track and hours to get started.</p>
              <Link href="/internship-registration" className="tl-btn">Apply for internship <i className="feather-arrow-right" aria-hidden="true" /></Link>
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
.th-hero { display: flex; align-items: stretch; justify-content: space-between; gap: 20px; flex-wrap: wrap; padding: 24px 26px; border-radius: 20px; color: #fff; background: radial-gradient(120% 140% at 100% 0%, rgba(233,196,106,.28) 0%, rgba(233,196,106,0) 45%), linear-gradient(120deg, #0b3320 0%, #14532d 55%, #1e7a4c 100%); box-shadow: 0 18px 40px -22px rgba(4,30,16,.6); }
.th-hero-l { min-width: 0; flex: 1 1 320px; display: flex; flex-direction: column; justify-content: center; }
.th-date { font-size: 12px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: #ecc77d; }
.th-hero h1 { margin: 6px 0 12px; font-size: 28px; font-weight: 800; color: #fff; letter-spacing: -.01em; line-height: 1.2; }
.th-sub { margin: 0; color: #cfe9d8; font-size: 14.5px; }
.th-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.th-chips span { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 700; color: #e7f6ec; background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.18); border-radius: 999px; padding: 5px 11px; }
.th-chips span.gold { color: #3b2a05; background: #f3d27a; border-color: #f3d27a; }
.th-today { flex: 0 1 300px; background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.18); border-radius: 16px; padding: 16px 18px; display: flex; flex-direction: column; gap: 4px; justify-content: center; }
.th-today b { font-size: 16px; font-weight: 800; display: flex; align-items: center; gap: 8px; }
.th-today b i { color: #86efac; }
.th-today span { font-size: 13px; color: #cfe9d8; }
.th-dot { width: 9px; height: 9px; border-radius: 50%; background: #4ade80; box-shadow: 0 0 0 3px rgba(74,222,128,.3); display: inline-block; animation: tlPulse 1.6s ease-in-out infinite; }
.th-cta { margin-top: 10px; height: 44px; border-radius: 12px; border: none; font: inherit; font-size: 14.5px; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 8px; text-decoration: none !important; background: linear-gradient(135deg, #f3d27a, #d4a24c); color: #3b2a05 !important; box-shadow: 0 8px 18px -8px rgba(0,0,0,.45); }
.th-cta.out { background: #fff; color: #14532d !important; }
.th-cta.ghost { background: rgba(255,255,255,.12); color: #fff !important; border: 1px solid rgba(255,255,255,.35); box-shadow: none; }
.th-cta:disabled { opacity: .7; cursor: wait; }

.th-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.th-stat { background: #fff; border: 1px solid #e4ece7; border-radius: 16px; padding: 14px 16px; text-decoration: none !important; display: grid; grid-template-columns: auto 1fr; grid-template-rows: auto auto; column-gap: 12px; align-items: center; transition: border-color .15s, transform .15s; }
.th-stat:hover { border-color: #b7dcc4; transform: translateY(-1px); }
.th-stat i { grid-row: 1 / 3; width: 42px; height: 42px; border-radius: 12px; background: #ecf7ef; color: #15803d; display: grid; place-items: center; font-size: 19px; }
.th-stat span { font-size: 12.5px; font-weight: 700; color: #64748b; }
.th-stat b { font-size: 22px; font-weight: 800; color: #0f172a; display: flex; align-items: baseline; gap: 8px; line-height: 1.2; }
.th-stat b.txt { font-size: 18px; }
.th-stat b small { font-size: 11.5px; font-weight: 800; color: #b91c1c; background: #fef2f2; border-radius: 999px; padding: 1px 8px; }
.th-stat.warn i { background: #fef2f2; color: #b91c1c; }
.th-stat.gold i { background: #fff6dc; color: #b8860b; }

.th-grid { display: grid; grid-template-columns: minmax(0, 1fr) 360px; gap: 16px; align-items: start; }
.th-col { display: grid; gap: 16px; min-width: 0; }
.th-col > * { min-width: 0; }
.th-ch { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 14px; }
.th-ch h2, .th-cert h2, .th-help h2 { margin: 0; font-size: 16.5px; font-weight: 800; color: #0f172a; }
.th-link { font-size: 13px; font-weight: 800; color: #15803d !important; text-decoration: none !important; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; }
.th-muted { font-size: 12.5px; font-weight: 700; color: #94a3b8; }

.th-ring-row { display: flex; align-items: center; gap: 22px; flex-wrap: wrap; }
.th-ring { --p: 0; width: 132px; height: 132px; border-radius: 50%; flex-shrink: 0; display: grid; place-items: center; background: conic-gradient(from -90deg, #15803d 0, #22a35a calc(var(--p) * 1%), #edf2ef calc(var(--p) * 1%)); }
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
.th-steps li.now { color: #8a5a0b; }
.th-steps li.now i { border-color: #d4a24c; color: #b8860b; }
.th-apply p { margin: 0 0 14px; color: #64748b; font-size: 14px; }

.th-bars { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; height: 170px; align-items: end; }
.th-bar { display: flex; flex-direction: column; align-items: center; gap: 6px; height: 100%; min-width: 0; }
.th-bar-v { font-size: 10.5px; font-weight: 800; color: #64748b; height: 14px; white-space: nowrap; }
.th-bar-col { flex: 1; width: 100%; max-width: 30px; border-radius: 9px; background: #f1f5f3; display: flex; align-items: flex-end; overflow: hidden; }
.th-bar-col span { width: 100%; border-radius: 9px; background: linear-gradient(180deg, #22a35a, #15803d); }
.th-bar.today .th-bar-col span { background: linear-gradient(180deg, #f3d27a, #c9962c); }
.th-bar-d { font-size: 12px; font-weight: 800; color: #94a3b8; }
.th-bar.today .th-bar-d { color: #8a5a0b; }

.th-task, .th-note { display: flex; align-items: center; gap: 12px; padding: 11px 10px; margin: 0 -10px; border-radius: 12px; text-decoration: none !important; color: inherit; }
.th-task:hover, .th-note:hover { background: #f6faf7; }
.th-task + .th-task, .th-note + .th-note { border-top: 1px solid #f1f5f3; }
.th-task-ic { width: 34px; height: 34px; border-radius: 10px; display: grid; place-items: center; flex-shrink: 0; background: #f1f5f9; color: #64748b; }
.th-task-ic.doing { background: #fff7e6; color: #b45309; }
.th-task-t { display: flex; flex-direction: column; min-width: 0; flex: 1; }
.th-task-t b { font-size: 14px; font-weight: 800; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.th-task-t small { font-size: 12px; color: #94a3b8; font-weight: 600; }
.th-due { font-size: 11.5px; font-weight: 800; border-radius: 999px; padding: 3px 10px; background: #f0faf3; color: #166534; white-space: nowrap; }
.th-due.today { background: #fff7e6; color: #b45309; }
.th-due.late { background: #fef2f2; color: #b91c1c; }
.th-note-ic { width: 34px; height: 34px; border-radius: 10px; display: grid; place-items: center; flex-shrink: 0; background: linear-gradient(135deg, #fff6dc, #fdecc0); color: #8a5a0b; }
.th-note > i { color: #94a3b8; }
.th-none { display: flex; align-items: center; gap: 10px; font-size: 14px; color: #64748b; padding: 10px 0; }
.th-none i { color: #c9962c; font-size: 18px; }

.th-cert { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; }
.th-cert.ready { background: linear-gradient(135deg, #fffaf0, #fff 60%); border-color: #f1e2bd; }
.th-cert p, .th-help p { margin: 0 0 6px; font-size: 13.5px; color: #64748b; line-height: 1.55; }
.th-seal { width: 46px; height: 46px; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #fbe7a8, #d4a24c 70%); color: #fff; display: grid; place-items: center; font-size: 21px; box-shadow: 0 8px 18px -8px rgba(201,150,44,.6); }
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
  .th-hero { padding: 18px; border-radius: 18px; }
  .th-hero h1 { font-size: 22px; }
  .th-today { flex-basis: 100%; }
  .th-col-r { grid-template-columns: minmax(0, 1fr); }
  .th-chips span { font-size: 12px; padding: 4px 10px; }
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
