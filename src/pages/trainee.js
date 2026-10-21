import React, { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { apiUrl } from "../utils/url";
import { getTrainee, getTraineeToken, setTraineeToken, clearTraineeToken } from "../utils/trainee-auth";
import { PROGRAM_DATA } from "./internship-registration";

/* /trainee — the trainee portal home (student view). Needs the trainee sign-in from /supervision-login.
   Shows where the internship stands (applied → under review → active → completed), the program,
   the learning path from the curriculum, the certificate and help. Nothing here is invented: hours
   and tasks appear only once the CYT team records them. */

const STAGES = [
  { key: "applied", label: "Applied", icon: "feather-send" },
  { key: "pending", label: "Under review", icon: "feather-search" },
  { key: "active", label: "Internship active", icon: "feather-play-circle" },
  { key: "completed", label: "Completed", icon: "feather-award" },
];
const stageIndex = (status) => (status === "completed" ? 3 : status === "active" ? 2 : 1);
const fmtDate = (d) => {
  if (!d) return "—";
  const x = new Date(d);
  return Number.isNaN(x.getTime()) ? String(d) : x.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

export default function TraineeHome() {
  const router = useRouter();
  const [me, setMe] = useState(null); // { data: application|null, account }
  const [err, setErr] = useState("");
  const [tokName, setTokName] = useState(""); // read after mount (the server has no sign-in)

  useEffect(() => {
    const tk = getTrainee();
    if (!tk) { router.replace("/supervision-login"); return; }
    setTokName(tk.name || "");
    fetch(`${apiUrl}/trainees/me`, { headers: { Authorization: `Bearer ${getTraineeToken()}` } })
      .then((r) => r.json().then((j) => ({ r, j })))
      .then(({ r, j }) => {
        if (r.status === 401) { clearTraineeToken(); router.replace("/supervision-login"); return; }
        if (!j?.status) { setErr(j?.message || "Couldn't load your portal"); return; }
        if (j.token) setTraineeToken(j.token); // applied after making the account — the token now carries the application
        setMe(j);
      })
      .catch(() => setErr("Couldn't load your portal — please check your connection."));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const logout = () => { clearTraineeToken(); router.push("/supervision-login"); };
  const app = me?.data || null;
  const name = app?.name || me?.account?.name || tokName || "Trainee";
  const firstName = String(name).split(/\s+/)[0];
  const tracks = useMemo(() => (app?.internType || []).filter((t) => PROGRAM_DATA[t]), [app]);
  const [openTrack, setOpenTrack] = useState(null);
  const shownTrack = openTrack || tracks[0];
  const si = app ? stageIndex(app.status) : -1;
  const traineeId = app?._id ? `CYT-TR-${String(app._id).slice(-6).toUpperCase()}` : null;

  return (
    <>
      <Head>
        <title>Trainee Portal · Choose Your Therapist</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="tp">
        {/* top bar */}
        <header className="tp-top">
          <Link href="/" className="tp-brand"><span>CYT</span> Trainee Portal</Link>
          <div className="tp-top-r">
            <span className="tp-av" aria-hidden="true">{firstName.charAt(0).toUpperCase()}</span>
            <button type="button" className="tp-out" onClick={logout}><i className="feather-log-out" aria-hidden="true" /> <span>Sign out</span></button>
          </div>
        </header>

        <main className="tp-main">
          {err && <div className="tp-err">{err}</div>}
          {!me && !err && <div className="tp-skel" />}

          {me && (
            <>
              {/* welcome */}
              <section className="tp-hello">
                <div>
                  <span className="tp-k">{app ? "Supervision cum Internship" : "Welcome to the trainee portal"}</span>
                  <h1>Hi {firstName} 👋</h1>
                  <p>{app ? (app.status === "active" ? "Your internship is on — keep going, one module at a time." : app.status === "completed" ? "You've completed your internship. Well done!" : "Thanks for applying — the CYT team is reviewing your application.") : "You're one step away — choose your track and plan to start your supervised internship."}</p>
                </div>
                <div className="tp-id">
                  {traineeId && <span>Trainee ID <b>{traineeId}</b></span>}
                  <span>{me.account?.email || app?.email}</span>
                </div>
              </section>

              {!app ? (
                <section className="tp-start">
                  <div className="tp-start-ic" aria-hidden="true"><i className="feather-compass" /></div>
                  <div className="tp-start-t">
                    <b>Start your internship</b>
                    <span>Pick a track (clinical, counselling, research, content and more), your hours and a start date. Your details are already filled in.</span>
                  </div>
                  <Link href="/internship-registration?account=1#apply-form" className="tp-btn">Apply now <i className="feather-arrow-right" aria-hidden="true" /></Link>
                  <Link href="/internship-modules" className="tp-btn ghost">See the modules</Link>
                </section>
              ) : (
                <>
                  {/* journey */}
                  <section className="tp-card">
                    <div className="tp-card-h"><b>Your internship journey</b>{app.status === "rejected" && <span className="tp-pill bad">Not approved</span>}</div>
                    <ol className="tp-journey">
                      {STAGES.map((s, i) => (
                        <li key={s.key} className={i < si ? "done" : i === si ? "now" : ""}>
                          <span className="tp-dot"><i className={i < si ? "feather-check" : s.icon} aria-hidden="true" /></span>
                          <b>{s.label}</b>
                          <small>{i === 0 ? fmtDate(app.createdAt) : i === si ? "Now" : ""}</small>
                        </li>
                      ))}
                    </ol>
                  </section>

                  <div className="tp-grid">
                    {/* program */}
                    <section className="tp-card">
                      <div className="tp-card-h"><b>My program</b></div>
                      <dl className="tp-dl">
                        <div><dt>Track{(app.internType || []).length > 1 ? "s" : ""}</dt><dd>{(app.internType || []).join(", ") || "—"}</dd></div>
                        <div><dt>Hours</dt><dd>{app.hours || "—"}</dd></div>
                        <div><dt>Duration</dt><dd>{app.duration || "—"}</dd></div>
                        <div><dt>Mode</dt><dd>{app.mode || "—"}</dd></div>
                        <div><dt>Start date</dt><dd>{fmtDate(app.availableFrom)}</dd></div>
                        <div><dt>Payment</dt><dd>{app.paymentStatus === "paid" ? "Paid ✓" : app.paymentStatus || "—"}</dd></div>
                      </dl>
                    </section>

                    {/* certificate */}
                    <section className={`tp-card tp-cert${app.status === "completed" ? " on" : ""}`}>
                      <div className="tp-card-h"><b>Certificate &amp; LOR</b></div>
                      <div className="tp-cert-ic" aria-hidden="true"><i className={app.status === "completed" ? "feather-award" : "feather-lock"} /></div>
                      <p>{app.status === "completed" ? "Your certificate and letter of recommendation are being prepared — the CYT team will share them with you." : `Unlocks when you complete your ${app.hours || "required hours"} under supervision.`}</p>
                    </section>
                  </div>

                  {/* learning path */}
                  {tracks.length > 0 && (
                    <section className="tp-card">
                      <div className="tp-card-h"><b>My learning path</b><span>{PROGRAM_DATA[shownTrack].modules.length} modules</span></div>
                      {tracks.length > 1 && (
                        <div className="tp-tabs">{tracks.map((t) => <button key={t} type="button" className={t === shownTrack ? "on" : ""} onClick={() => setOpenTrack(t)}>{t}</button>)}</div>
                      )}
                      <ol className="tp-mods" style={{ "--c": PROGRAM_DATA[shownTrack].color || "#1e7a4c" }}>
                        {PROGRAM_DATA[shownTrack].modules.map((m, i) => (
                          <li key={m.title}>
                            <span className="tp-mod-n">{String(i + 1).padStart(2, "0")}</span>
                            <div>
                              <b>{m.title.replace(/^Module \d+\s*[:—-]\s*/, "")}</b>
                              <small>{m.activities.slice(0, 2).join(" · ")}</small>
                            </div>
                          </li>
                        ))}
                      </ol>
                      <p className="tp-note">Your supervisor guides you through these modules and records your hours as you go.</p>
                    </section>
                  )}
                </>
              )}

              {/* resources + help */}
              <div className="tp-grid">
                <section className="tp-card">
                  <div className="tp-card-h"><b>Resources</b></div>
                  <div className="tp-links">
                    <Link href="/internship-modules"><i className="feather-book-open" aria-hidden="true" /> Full curriculum</Link>
                    <Link href="/blogs"><i className="feather-file-text" aria-hidden="true" /> Articles by psychologists</Link>
                    <Link href="/self-assessment"><i className="feather-check-square" aria-hidden="true" /> Clinical assessment tools</Link>
                  </div>
                </section>
                <section className="tp-card tp-help">
                  <div className="tp-card-h"><b>Need help?</b></div>
                  <p>Questions about your internship, schedule or certificate — we&apos;re a message away.</p>
                  <div className="tp-links">
                    <a href="https://wa.me/918077757951?text=Hi%2C%20I%27m%20a%20CYT%20trainee%20and%20need%20help" target="_blank" rel="noreferrer"><i className="feather-message-circle" aria-hidden="true" /> WhatsApp the team</a>
                    <a href="tel:+918077757951"><i className="feather-phone" aria-hidden="true" /> +91 80777 57951</a>
                  </div>
                </section>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}

const CSS = `
.tp { min-height: 100vh; background: linear-gradient(180deg, #eaf5ee 0, #f7f9f8 360px); color: #13261c; }
.tp-top { position: sticky; top: 0; z-index: 10; display: flex; align-items: center; justify-content: space-between; gap: 12px; height: 60px; padding: 0 20px; background: #14532d; color: #fff; }
.tp-brand { display: inline-flex; align-items: center; gap: 10px; color: #fff !important; text-decoration: none !important; font-weight: 800; font-size: 15px; }
.tp-brand span { width: 32px; height: 32px; border-radius: 10px; background: #ecc77d; color: #14532d; font-size: 11px; font-weight: 900; display: inline-flex; align-items: center; justify-content: center; }
.tp-top-r { display: flex; align-items: center; gap: 10px; }
.tp-av { width: 34px; height: 34px; border-radius: 50%; background: rgba(255,255,255,.16); display: inline-flex; align-items: center; justify-content: center; font-weight: 800; }
.tp-out { display: inline-flex; align-items: center; gap: 6px; height: 34px; padding: 0 12px; border-radius: 9px; border: 1px solid rgba(255,255,255,.3); background: transparent; color: #fff; font-size: 13px; font-weight: 700; cursor: pointer; }
.tp-main { max-width: 1040px; margin: 0 auto; padding: 24px 16px 48px; display: flex; flex-direction: column; gap: 16px; box-sizing: border-box; }
.tp-err { padding: 12px 14px; border-radius: 12px; background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; font-weight: 600; }
.tp-skel { height: 260px; border-radius: 20px; background: linear-gradient(90deg, #eef3f0, #f8faf9, #eef3f0); background-size: 200% 100%; animation: tpSk 1.4s infinite; }
@keyframes tpSk { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
.tp-hello { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 14px; padding: 24px; border-radius: 22px; background: linear-gradient(135deg, #c3e3cd 0%, #f0dfb4 60%, #cfe6d3 100%); }
.tp-k { font-size: 12px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: #8a5a0b; }
.tp-hello h1 { margin: 4px 0 6px; font-size: clamp(24px, 3.4vw, 32px); font-weight: 800; color: #173c2a; }
.tp-hello p { margin: 0; max-width: 560px; font-size: 15px; color: #3f4f47; line-height: 1.55; }
.tp-id { display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: #3f4f47; text-align: right; }
.tp-id b { color: #14532d; }
.tp-start { display: flex; flex-wrap: wrap; align-items: center; gap: 14px; padding: 22px; border-radius: 20px; background: #fff; border: 1.5px solid #ecd49a; box-shadow: 0 20px 40px -30px rgba(122,84,19,.6); }
.tp-start-ic { width: 52px; height: 52px; border-radius: 14px; background: #fbf1dc; color: #b07a1c; font-size: 24px; display: inline-flex; align-items: center; justify-content: center; }
.tp-start-t { flex: 1; min-width: 220px; display: flex; flex-direction: column; gap: 2px; }
.tp-start-t b { font-size: 18px; }
.tp-start-t span { font-size: 14px; color: #5b6b62; line-height: 1.5; }
.tp-btn { display: inline-flex; align-items: center; gap: 6px; height: 46px; padding: 0 20px; border-radius: 12px; background: #14532d; color: #fff !important; font-weight: 800; font-size: 14.5px; text-decoration: none !important; }
.tp-btn.ghost { background: #fff; color: #14532d !important; border: 1.5px solid #cfe3d6; }
.tp-card { background: #fff; border: 1px solid #e3ebe6; border-radius: 20px; padding: 18px 20px; display: flex; flex-direction: column; gap: 12px; }
.tp-card-h { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.tp-card-h b { font-size: 16px; }
.tp-card-h span { font-size: 12.5px; color: #8a948f; font-weight: 700; }
.tp-pill.bad { color: #b91c1c !important; background: #fef2f2; border-radius: 999px; padding: 2px 10px; }
.tp-journey { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; position: relative; }
.tp-journey li { margin: 0; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 4px; position: relative; }
.tp-journey li::before { content: none; }
.tp-journey li:not(:last-child)::after { content: ""; position: absolute; top: 18px; left: calc(50% + 22px); right: calc(-50% + 22px); height: 3px; border-radius: 3px; background: #e3ebe6; }
.tp-journey li.done:not(:last-child)::after { background: #1e7a4c; }
.tp-dot { width: 38px; height: 38px; border-radius: 50%; background: #f1f5f2; color: #94a3b8; display: inline-flex; align-items: center; justify-content: center; font-size: 16px; position: relative; z-index: 1; }
.tp-journey li.done .tp-dot { background: #1e7a4c; color: #fff; }
.tp-journey li.now .tp-dot { background: #ecc77d; color: #3d2a00; box-shadow: 0 0 0 5px rgba(236,199,125,.35); }
.tp-journey b { font-size: 13px; }
.tp-journey small { font-size: 11.5px; color: #8a948f; min-height: 14px; }
.tp-grid { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); gap: 16px; }
.tp-dl { margin: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 18px; }
.tp-dl dt { font-size: 11px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: #8a948f; }
.tp-dl dd { margin: 2px 0 0; font-size: 14.5px; font-weight: 700; color: #13261c; }
.tp-cert { align-items: center; text-align: center; background: linear-gradient(135deg, #fffaf0, #fff 70%); border-color: #efe2bf; }
.tp-cert .tp-card-h { align-self: stretch; }
.tp-cert-ic { width: 64px; height: 64px; border-radius: 50%; background: #f1f5f2; color: #94a3b8; font-size: 28px; display: inline-flex; align-items: center; justify-content: center; }
.tp-cert.on .tp-cert-ic { background: linear-gradient(135deg, #f0cf7a, #c48a1c); color: #fff; }
.tp-cert p { margin: 0; font-size: 13.5px; color: #5b6b62; line-height: 1.55; }
.tp-tabs { display: flex; flex-wrap: wrap; gap: 6px; }
.tp-tabs button { height: 32px; padding: 0 12px; border-radius: 999px; border: 1.5px solid #e3ebe6; background: #fff; font-size: 12.5px; font-weight: 700; color: #475569; cursor: pointer; }
.tp-tabs button.on { background: #14532d; border-color: #14532d; color: #fff; }
.tp-mods { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.tp-mods li { margin: 0; display: flex; gap: 12px; padding: 12px; border-radius: 14px; border: 1px solid #eef2ef; background: #fcfdfc; }
.tp-mods li::before { content: none; }
.tp-mod-n { flex-shrink: 0; width: 32px; height: 32px; border-radius: 10px; background: var(--c); color: #fff; font-weight: 900; font-size: 12px; display: inline-flex; align-items: center; justify-content: center; }
.tp-mods b { display: block; font-size: 14px; line-height: 1.35; }
.tp-mods small { display: block; margin-top: 2px; font-size: 12px; color: #6b7c72; line-height: 1.45; }
.tp-note { margin: 0; font-size: 12.5px; color: #8a948f; }
.tp-links { display: flex; flex-direction: column; gap: 8px; }
.tp-links a { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 12px; border: 1px solid #eef2ef; color: #14532d !important; font-weight: 700; font-size: 14px; text-decoration: none !important; }
.tp-links a:hover { background: #f4f8f5; }
.tp-help p { margin: 0; font-size: 13.5px; color: #5b6b62; }
@media (max-width: 820px) {
  .tp-grid { grid-template-columns: 1fr; }
  .tp-mods { grid-template-columns: 1fr; }
  .tp-id { text-align: left; }
}
@media (max-width: 560px) {
  .tp-top { padding: 0 12px; }
  .tp-out span { display: none; }
  .tp-hello { padding: 18px; }
  .tp-journey { grid-template-columns: repeat(2, minmax(0, 1fr)); row-gap: 16px; }
  .tp-journey li::after { display: none; }
  .tp-dl { grid-template-columns: 1fr; }
  .tp-btn { width: 100%; justify-content: center; }
}
`;
