import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import TraineeLayout, { useTraineePortal } from "../../components/trainee/trainee-layout";
import { tApi } from "../../utils/trainee-api";

/* Pro bono sessions the CYT team has given this trainee, and the Google account their Meet links come from.
   Marking a session completed gives the client their coupon. */

const when = (d) => new Date(d).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true });
const PAST = { completed: "Completed", no_show: "Didn't attend", declined: "Cancelled by CYT", cancelled: "Cancelled by client" };
const GOOGLE_MSG = {
  connected: "Google is connected.", denied: "Google wasn't connected: permission was not given.", expired: "That took too long. Please try again.",
  noscope: "Please allow calendar access so Meet links can be created.", error: "Google couldn't connect. Please try again.",
};

function Probono() {
  const router = useRouter();
  const { live } = useTraineePortal();
  const [d, setD] = useState(null);
  const [err, setErr] = useState("");
  const [noProfile, setNoProfile] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = async () => {
    const r = await tApi("/trainee-portal/probono");
    if (r.status) setD(r.data);
    else if (r.code === "no_profile") setNoProfile(true);
    else setErr(r.message || "Couldn't load your sessions");
  };
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (live) load(); }, [live]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const g = router.query.google;
    if (g) setMsg({ bad: g !== "connected", text: GOOGLE_MSG[g] || GOOGLE_MSG.error });
  }, [router.query.google]);

  if (noProfile) {
    return (
      <div className="tp-card tp-empty">
        <i className="feather-heart" aria-hidden="true" />
        <b>Your pro bono profile isn&apos;t set up yet</b>
        Please ask the CYT team to add your profile with this email.
      </div>
    );
  }
  if (!d) return err ? <div className="tl-err">{err}</div> : <div className="tp-load">Loading your sessions…</div>;

  const act = async (id, action, body) => {
    setMsg(null);
    const r = await tApi(`/trainee-portal/probono/${id}/${action}`, { method: "POST", body: body || {} });
    setMsg({ bad: !r.status, text: r.message || (r.status ? "Done" : "Something went wrong") });
    load();
  };
  const connect = async () => {
    const r = await tApi("/trainee-portal/probono/google/connect");
    if (r.status) window.location.href = r.data.url; else setMsg({ bad: true, text: r.message || "Google connection isn't available yet" });
  };
  const disconnect = async () => {
    if (!window.confirm("Disconnect Google? The CYT team won't be able to create Meet links for you.")) return;
    await tApi("/trainee-portal/probono/google/disconnect", { method: "POST", body: {} });
    load();
  };

  const upcoming = d.sessions.filter((r) => r.status === "accepted").sort((a, b) => new Date(a.slot_at) - new Date(b.slot_at));
  const past = d.sessions.filter((r) => PAST[r.status]);

  return (
    <>
      <div className="tp-h">
        <div>
          <h1>Pro bono sessions</h1>
          <p>The CYT team schedules your sessions. They appear here.</p>
        </div>
      </div>
      {msg && <p className={`pbt-msg${msg.bad ? " bad" : ""}`} role="status">{msg.text}</p>}

      <div className="pbt-stats">
        <div><b>{upcoming.length}</b><span>Upcoming</span></div>
        <div><b>{d.sessions.filter((r) => r.status === "completed").length}</b><span>Completed</span></div>
      </div>

      <section className="pbt-sec">
        <h2>Upcoming sessions</h2>
        {upcoming.length === 0 ? <div className="tp-card pbt-none">No sessions scheduled.</div> : upcoming.map((r) => <Req key={r._id} r={r} act={act} />)}
      </section>

      <section className="tp-card pbt-sec">
        <h2>Google Meet</h2>
        <div className="pbt-row">
          {d.google.connected
            ? <p>Connected as <b>{d.google.email || "your Google account"}</b>.</p>
            : <p>Connect your Google account so Meet links are created on your calendar.</p>}
          {d.google.connected
            ? <button type="button" className="pbt-btn ghost" onClick={disconnect}>Disconnect</button>
            : <button type="button" className="pbt-btn" onClick={connect} disabled={!d.google.configured}>Connect Google</button>}
        </div>
        {d.google.lastError && <p className="pbt-msg bad">Last Google problem: {d.google.lastError}</p>}
      </section>

      {past.length > 0 && (
        <section className="pbt-sec">
          <h2>Past sessions</h2>
          <div className="tp-card pbt-past">
            {past.slice(0, 20).map((r) => <div key={r._id}><span><b>{r.name}</b> · {when(r.slot_at)}</span><em>{PAST[r.status]}</em></div>)}
          </div>
        </section>
      )}
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
    </>
  );
}

function Req({ r, act }) {
  const [busy, setBusy] = useState(false);
  const [releasing, setReleasing] = useState(false);
  const [reason, setReason] = useState("");
  const started = new Date(r.slot_at) <= new Date();
  const run = async (action, body) => { setBusy(true); await act(r._id, action, body); setBusy(false); };
  const about = [r.age && `${r.age} yrs`, r.language].filter(Boolean).join(" · ");

  return (
    <article className="tp-card pbt-req">
      <div className="pbt-req-top"><b>{r.name}{about && <small> · {about}</small>}</b><span>{when(r.slot_at)}</span></div>
      <p>{r.concern}</p>
      {releasing ? (
        <div className="pbt-decline">
          <label htmlFor={`why-${r._id}`}>Reason, for the CYT team (optional)</label>
          <input id={`why-${r._id}`} value={reason} maxLength={300} onChange={(e) => setReason(e.target.value)} />
          <div className="pbt-acts">
            <button type="button" className="pbt-btn danger" disabled={busy} onClick={() => run("release", { reason })}>Confirm</button>
            <button type="button" className="pbt-btn ghost" onClick={() => setReleasing(false)}>Back</button>
          </div>
        </div>
      ) : (
        <div className="pbt-acts">
          {r.meet_link && <a className="pbt-btn" href={r.meet_link} target="_blank" rel="noopener noreferrer">Join Meet</a>}
          {started && <button type="button" className="pbt-btn ghost" disabled={busy} onClick={() => run("complete")}>Mark completed</button>}
          {started && <button type="button" className="pbt-btn ghost" disabled={busy} onClick={() => run("no-show")}>Client didn&apos;t attend</button>}
          {!started && <button type="button" className="pbt-btn ghost" onClick={() => setReleasing(true)}>Can&apos;t make it</button>}
        </div>
      )}
    </article>
  );
}

const CSS = `
.pbt-msg { margin: 0 0 12px; font-size: 14px; font-weight: 700; color: #166534; }
.pbt-msg.bad { color: #b91c1c; }
.pbt-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px; }
.pbt-stats > div { background: #fff; border: 1px solid #e4ece7; border-top: 3px solid #16a34a; border-radius: 14px; padding: 14px; }
.pbt-stats > div:nth-child(2) { border-top-color: #d97706; }
.pbt-stats b { display: block; font-size: 24px; font-weight: 800; color: #0f172a; line-height: 1.1; }
.pbt-stats span { font-size: 12.5px; color: #64748b; font-weight: 600; }
.pbt-sec { margin-bottom: 16px; }
.pbt-sec h2 { margin: 0 0 10px; font-size: 16px; font-weight: 800; color: #0f172a; font-family: inherit; }
.pbt-row { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; }
.pbt-row p { margin: 0; flex: 1 1 260px; font-size: 14px; color: #475569; }
.pbt-none { padding: 16px 20px; font-size: 14px; color: #64748b; }
.pbt-btn { display: inline-flex; align-items: center; justify-content: center; min-height: 40px; padding: 0 16px; border: 1px solid #166534; border-radius: 10px; background: #166534; color: #fff !important; font: inherit; font-size: 14px; font-weight: 800; cursor: pointer; text-decoration: none !important; }
.pbt-btn.ghost { background: #fff; color: #166534 !important; border-color: #cfe3d6; }
.pbt-btn.danger { background: #b91c1c; border-color: #b91c1c; }
.pbt-btn:disabled { opacity: .55; cursor: not-allowed; }
.pbt-req { margin-bottom: 10px; padding: 16px; }
.pbt-req-top { display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.pbt-req-top b { font-size: 15.5px; color: #0f172a; } .pbt-req-top small { font-size: 13px; font-weight: 600; color: #64748b; } .pbt-req-top span { font-size: 13.5px; font-weight: 700; color: #166534; }
.pbt-req p { margin: 6px 0 12px; font-size: 14px; color: #475569; line-height: 1.55; white-space: pre-wrap; overflow-wrap: anywhere; }
.pbt-acts { display: flex; gap: 8px; flex-wrap: wrap; }
.pbt-decline label { display: block; margin-bottom: 6px; font-size: 13.5px; font-weight: 700; color: #334155; }
.pbt-decline input { width: 100%; box-sizing: border-box; margin-bottom: 8px; border: 1.5px solid #dbe5df; border-radius: 10px; padding: 9px 12px; font: inherit; font-size: 14px; outline: none; }
.pbt-past > div { display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap; padding: 9px 0; border-top: 1px solid #eef2f0; font-size: 13.5px; color: #475569; }
.pbt-past > div:first-child { border-top: 0; padding-top: 0; } .pbt-past > div:last-child { padding-bottom: 0; }
.pbt-past em { font-style: normal; font-weight: 700; color: #64748b; }
`;

export default function ProbonoPage() {
  return <TraineeLayout title="Pro bono sessions"><Probono /></TraineeLayout>;
}
