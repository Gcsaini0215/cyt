import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { TEST_BY_KEY, optionsFor, questionText } from "../../components/self-assessment/tests";
import { fetchById, postData } from "../../utils/actions";
import { apiUrl } from "../../utils/url";
import { isAuthenticated } from "../../utils/jwt";

/* The automatic report for a clinical assessment. The psychologist fills in their notes (draft or
   release), and their name, profile type and registration no. go into the signature block; the
   client can open it only after release. Prints cleanly on A4. */

const fmt = (d, time = true) => (d ? new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", ...(time ? { hour: "numeric", minute: "2-digit" } : {}), timeZone: "Asia/Kolkata" }) : "—");
const FOLLOW = ["", "Re-assess in 2 weeks", "Re-assess in 4 weeks", "Re-assess in 6–8 weeks", "Re-assess after 6 sessions", "Re-assess at the end of therapy"];
const EMPTY = { observations: "", recommendations: "", followUp: "", referral: "" };

export default function AssessmentReport() {
  const router = useRouter();
  const { id } = router.query;
  const [rep, setRep] = useState(null);
  const [err, setErr] = useState("");
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState(EMPTY);
  const [regNo, setRegNo] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ text: "", err: false });

  const load = () => fetchById(`${apiUrl}/assessment-requests/${id}/report`)
    .then((r) => { const d = r.data; setRep(d); setNote(d?.note || ""); setNotes({ ...EMPTY, ...(d?.notes || {}) }); setRegNo(d?.regNo || d?.signer?.regNo || ""); })
    .catch((e) => setErr(e?.response?.data?.message || "Couldn't load the report."));
  useEffect(() => {
    if (!id) return;
    if (!isAuthenticated()) { router.replace(`/login?next=${encodeURIComponent(router.asPath)}`); return; }
    load();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async (release) => {
    if (release && rep.status !== "released" && !window.confirm("Approve and release this report to the client? Do this after you've gone through it with them.")) return;
    setBusy(true); setMsg({ text: "", err: false });
    try {
      const r = await postData(`${apiUrl}/assessment-requests/${id}/release`, { note, notes, release });
      setMsg({ text: r?.message || "Saved.", err: false });
      await load();
    } catch (e) { setMsg({ text: e?.response?.data?.message || "Couldn't save — please try again.", err: true }); }
    setBusy(false);
  };

  const test = rep && TEST_BY_KEY[rep.tool];
  const res = rep?.result || {};
  const isT = rep?.viewer === "therapist";
  const released = rep?.status === "released";
  const signer = rep?.signer || {};
  const shownNotes = rep?.notes || {};
  const hasNotes = rep?.note || Object.values(shownNotes).some(Boolean);

  return (
    <div className="rp-page">
      <Head><title>{test ? `${test.short} report` : "Assessment report"} | Choose Your Therapist</title><meta name="robots" content="noindex" /></Head>
      <style dangerouslySetInnerHTML={{ __html: RP_CSS }} />
      <div className="rp-bar no-print">
        <Link href={isT ? "/therapist-questionnaires" : "/client/check-ins"}>← Back</Link>
        {rep && <button type="button" onClick={() => window.print()}>Print / Save PDF</button>}
      </div>

      {err ? <div className="rp-sheet"><p className="rp-err">{err}</p></div> : !rep ? <div className="rp-sheet"><div className="rp-skel" /></div> : !test ? (
        <div className="rp-sheet"><p className="rp-err">This assessment is no longer available.</p></div>
      ) : (
        <article className="rp-sheet">
          {/* ── header ── */}
          <header className="rp-head">
            <div className="rp-brand">
              <span className="rp-logo"><img src="/cyt-emblem.png" alt="Choose Your Therapist" /></span>
              <div>
                <b>Choose Your Therapist</b>
                <span>Choose Your Therapist LLP · Sector 51, Noida, Uttar Pradesh</span>
                <span>HFR ID IN0510005384 · www.chooseyourtherapist.in</span>
              </div>
            </div>
            <div className="rp-doc">
              <b>Clinical Assessment Report</b>
              <span>Report No. {rep.reportNo}</span>
              <span>Date {fmt(rep.doneAt, false)}</span>
            </div>
          </header>
          <div className="rp-titlebar">
            <h1>{test.full}</h1>
            <span className={`rp-status${released ? " ok" : ""}`}>{released ? "Approved by psychologist" : "Draft — not released"}</span>
          </div>

          {/* ── client box ── */}
          <dl className="rp-client">
            <div><dt>Client</dt><dd>{rep.client.name}</dd></div>
            <div><dt>Age / Gender</dt><dd>{[rep.client.age ? `${rep.client.age} yrs` : "", rep.client.gender].filter(Boolean).join(" · ") || "—"}</dd></div>
            <div><dt>Client ID</dt><dd>{rep.client.code}</dd></div>
            <div><dt>Assessment</dt><dd>{test.short}</dd></div>
            <div><dt>Completed</dt><dd>{fmt(rep.doneAt)}</dd></div>
            <div><dt>Session</dt><dd>{fmt(rep.booking_date)}</dd></div>
            <div><dt>Psychologist</dt><dd>{signer.name || rep.therapist}</dd></div>
            <div><dt>Mode</dt><dd>Online, self-report</dd></div>
          </dl>

          {/* ── result ── */}
          <section className="rp-result" style={{ "--lc": res.color || "#16a34a" }}>
            <div className="rp-level"><div><small>Result</small><b><i className="rp-dot" />{res.level}</b></div>{res.score != null && <span>Score <strong>{res.score}</strong> / {res.max}</span>}</div>
            <p>{res.text}</p>
            {isT && res.flag && <p className="rp-flag">⚠ Self-harm item answered above zero — please assess risk at the start of the session.</p>}
          </section>

          {Array.isArray(res.bars) && res.bars.length > 0 && (
            <section className="rp-sec">
              <h2>Scores by area</h2>
              {res.bars.map((b) => (
                <div key={b.key} className="rp-bar-row">
                  <div><b>{b.label}</b><span><i className="rp-dot" style={{ "--lc": b.color }} />{b.band} · {b.value}{b.max === 100 ? "/100" : `/${b.max}`}</span></div>
                  <i><em style={{ width: `${Math.round((b.value / b.max) * 100)}%` }} /></i>
                </div>
              ))}
            </section>
          )}

          {rep.earlier?.length > 0 && (
            <section className="rp-sec">
              <h2>Progress</h2>
              <table className="rp-prog">
                <thead><tr><th>Date</th><th>Score</th><th>Level</th></tr></thead>
                <tbody>
                  <tr className="now"><td>{fmt(rep.doneAt, false)} (this report)</td><td>{res.score ?? "—"}</td><td>{res.level}</td></tr>
                  {rep.earlier.map((e, i) => <tr key={i}><td>{fmt(e.doneAt, false)}</td><td>{e.score ?? "—"}</td><td>{e.level}</td></tr>)}
                </tbody>
              </table>
            </section>
          )}

          {/* ── psychologist's notes ── */}
          {isT ? (
            <section className="rp-sec rp-edit no-print">
              <h2>Psychologist&apos;s notes</h2>
              <label>Summary for the client<textarea rows={2} maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} placeholder="What this result means for them, in simple words." /></label>
              <label>Clinical observations<textarea rows={3} maxLength={1500} value={notes.observations} onChange={(e) => setNotes({ ...notes, observations: e.target.value })} placeholder="What you noticed in the session — context, presentation, factors behind the score." /></label>
              <label>Recommendations / next steps<textarea rows={3} maxLength={1500} value={notes.recommendations} onChange={(e) => setNotes({ ...notes, recommendations: e.target.value })} placeholder="Therapy plan, frequency, self-help, lifestyle, etc." /></label>
              <div className="rp-edit-row">
                <label>Follow-up
                  <select value={FOLLOW.includes(notes.followUp) ? notes.followUp : "__other"} onChange={(e) => setNotes({ ...notes, followUp: e.target.value === "__other" ? "" : e.target.value })}>
                    {FOLLOW.map((f) => <option key={f} value={f}>{f || "No follow-up set"}</option>)}
                  </select>
                </label>
                <label>Referral (if any)<input maxLength={300} value={notes.referral} onChange={(e) => setNotes({ ...notes, referral: e.target.value })} placeholder="e.g. Psychiatrist for medication review" /></label>
                <div className="rp-regno"><span>Registration / licence no.</span><b>{regNo || "Not added"}</b><Link href="/therapist-questionnaires#addon">{regNo ? "Change" : "Add"} on the Assessments page</Link></div>
              </div>
              <div className="rp-acts">
                <button type="button" className="ghost" onClick={() => save(false)} disabled={busy}>Save draft</button>
                <button type="button" onClick={() => save(true)} disabled={busy}>{released ? "Update report" : "Approve & release to client"}</button>
                <span>{released ? `Released ${fmt(rep.releasedAt)}` : "Not visible to the client yet."}</span>
              </div>
              {msg.text && <p className={`rp-msg${msg.err ? " err" : ""}`}>{msg.text}</p>}
            </section>
          ) : null}
          {hasNotes && (
            <section className={`rp-sec rp-notes${isT ? " print-only" : ""}`}>
              <h2>Psychologist&apos;s notes</h2>
              {rep.note && <div><b>Summary</b><p>{rep.note}</p></div>}
              {shownNotes.observations && <div><b>Clinical observations</b><p>{shownNotes.observations}</p></div>}
              {shownNotes.recommendations && <div><b>Recommendations / next steps</b><p>{shownNotes.recommendations}</p></div>}
              {(shownNotes.followUp || shownNotes.referral) && (
                <dl className="rp-notes-kv">
                  {shownNotes.followUp && <div><dt>Follow-up</dt><dd>{shownNotes.followUp}</dd></div>}
                  {shownNotes.referral && <div><dt>Referral</dt><dd>{shownNotes.referral}</dd></div>}
                </dl>
              )}
            </section>
          )}

          {/* ── answers ── */}
          <section className="rp-sec rp-items">
            <h2>Responses</h2>
            <p className="rp-intro">{test.intro}</p>
            <table>
              <thead><tr><th>#</th><th>Item</th><th>Answer</th></tr></thead>
              <tbody>
                {test.questions.map((_, i) => {
                  const v = rep.answers?.[i];
                  const o = optionsFor(test, i).find((x) => x.value === v);
                  const hot = res.flag && ((test.key === "phq9" && i === 8) || (test.key === "epds" && i === 9)) && v > 0;
                  return <tr key={i} className={hot ? "hot" : ""}><td>{i + 1}</td><td>{questionText(test, i)}</td><td>{o ? o.label : "—"}</td></tr>;
                })}
              </tbody>
            </table>
          </section>

          {/* ── signature ── */}
          <section className="rp-sign">
            <div className="rp-ref">
              <b>Reference</b>
              <p>{test.ref}</p>
              <p className="rp-lic">{test.licence}</p>
            </div>
            <div className="rp-sig">
              <div className="rp-sig-space">{released ? <span>Digitally approved · {fmt(rep.releasedAt, false)}</span> : null}</div>
              <b className="rp-sig-name">{signer.name || rep.therapist}</b>
              <span>{signer.profileType || "Psychologist"}</span>
              <span>Reg. / Licence No.: {(isT ? regNo : signer.regNo) || "—"}</span>
            </div>
          </section>

          {/* ── how this document may be used ── */}
          <footer className="rp-foot">
            <b>About this document</b>
            <p>This report is generated automatically from the client&apos;s own answers, scored with the published scoring of the questionnaire, and approved by the psychologist named above before it is shared. It is meant only to track progress across therapy sessions and to assess the current level of symptoms.</p>
            <div className="rp-use">
              <div><em>Can be used for</em><span>Tracking your progress between sessions · discussing results with your psychologist · comparing with later re-assessments</span></div>
              <div><em>Not valid for</em><span>Any legal or medico-legal purpose · court, police or insurance matters · employment, leave or fitness certificates · diagnosis or prescription</span></div>
            </div>
            <p>A screening score is not a diagnosis. In a crisis in India call Tele-MANAS 14416 (free, 24×7) or go to the nearest hospital.</p>
            <p className="rp-foot-id">Choose Your Therapist · {rep.reportNo} · {test.short}</p>
          </footer>
        </article>
      )}
    </div>
  );
}

const RP_CSS = `
.rp-page { min-height: 100vh; background: #eceeed; padding: 0 16px 40px; font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; color: #1f2937; }
.rp-page p { font-size: inherit; }
.rp-bar { max-width: 860px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 14px 0; }
.rp-bar a { color: #14532d !important; font-weight: 800; font-size: 14px; text-decoration: none !important; }
.rp-bar button, .rp-acts button { height: 40px; padding: 0 16px; border-radius: 8px; border: 1.5px solid #14532d; background: #14532d; color: #fff; font-weight: 700; font-size: 14px; cursor: pointer; font-family: inherit; }
.rp-acts button.ghost { background: #fff; color: #14532d; border-color: #cbd5d0; }
.rp-acts button:disabled { opacity: .6; }
.rp-sheet { max-width: 860px; margin: 0 auto; background: #fff; border: 1px solid #dfe3e1; box-shadow: 0 12px 32px -24px rgba(15,23,42,.45); padding: 30px 36px 26px; }
.rp-skel { height: 400px; border-radius: 8px; background: #f1f3f2; }
.rp-err { color: #b91c1c; font-weight: 700; }

/* header */
.rp-head { display: flex; justify-content: space-between; align-items: center; gap: 18px; flex-wrap: wrap; padding-bottom: 14px; border-bottom: 2px solid #14532d; }
.rp-brand { display: flex; align-items: center; gap: 14px; min-width: 0; }
.rp-logo { width: 58px; height: 58px; flex-shrink: 0; border: 1px solid #dfe3e1; border-radius: 10px; background: #fff; display: flex; align-items: center; justify-content: center; padding: 6px; }
.rp-logo img { display: block; width: 100%; height: 100%; object-fit: contain; }
.rp-brand b { display: block; font-size: 19px; color: #14532d; letter-spacing: -.2px; }
.rp-brand span { display: block; font-size: 11.5px; color: #6b7280; line-height: 1.5; }
.rp-doc { text-align: right; display: flex; flex-direction: column; gap: 2px; }
.rp-doc b { font-size: 13px; letter-spacing: 1.2px; text-transform: uppercase; color: #111827; }
.rp-doc span { font-size: 12px; color: #4b5563; }
.rp-titlebar { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; padding: 14px 0 10px; }
.rp-titlebar h1 { margin: 0; font-size: 20px; font-weight: 800; color: #111827; font-family: inherit; }
.rp-status { font-size: 11.5px; font-weight: 700; color: #92400e; border: 1px solid #f2d39b; border-radius: 4px; padding: 2px 8px; }
.rp-status.ok { color: #14532d; border-color: #b9d7c4; }
.rp-sheet h2 { margin: 0 0 8px; font-size: 11.5px; font-weight: 800; font-family: inherit; color: #14532d; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 4px; border-bottom: 1px solid #e5e7eb; }

/* client box */
.rp-client { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); margin: 0 0 16px; border: 1px solid #d1d5db; }
.rp-client div { padding: 7px 10px; border-right: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; min-width: 0; }
.rp-client div:nth-child(4n) { border-right: 0; } .rp-client div:nth-last-child(-n+4) { border-bottom: 0; }
.rp-client dt { font-size: 10px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: .5px; }
.rp-client dd { margin: 2px 0 0; font-size: 13px; font-weight: 600; color: #111827; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* result */
.rp-result { border: 1px solid #d1d5db; border-left: 4px solid #14532d; background: #fafafa; padding: 12px 16px; margin-bottom: 16px; }
.rp-level { display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; }
.rp-level small { display: block; font-size: 10px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: .5px; }
.rp-level b { font-size: 19px; color: #111827; display: inline-flex; align-items: center; gap: 8px; }
.rp-level span { color: #4b5563; font-size: 13px; } .rp-level strong { font-size: 20px; color: #111827; }
.rp-sheet .rp-dot { display: inline-block; width: 9px; height: 9px; border-radius: 50%; background: var(--lc, #14532d); flex-shrink: 0; margin-right: 6px; }
.rp-level .rp-dot { margin-right: 0; }
.rp-result p { margin: 6px 0 0; font-size: 13.5px; line-height: 1.6; color: #374151; }
.rp-result .rp-flag { color: #991b1b; font-weight: 700; }
.rp-sec { margin-bottom: 16px; }
.rp-bar-row { margin-bottom: 8px; } .rp-bar-row > div { display: flex; justify-content: space-between; font-size: 13px; }
.rp-bar-row span { font-weight: 700; color: #374151; display: inline-flex; align-items: center; }
.rp-bar-row > i { display: block; height: 6px; background: #e5e7eb; margin-top: 4px; overflow: hidden; } .rp-bar-row em { display: block; height: 100%; background: #4b5563; }
.rp-prog { width: 100%; border-collapse: collapse; font-size: 12.5px; }
.rp-prog th { text-align: left; font-size: 10.5px; color: #6b7280; text-transform: uppercase; letter-spacing: .4px; border-bottom: 1px solid #d1d5db; padding: 5px 8px; }
.rp-prog td { padding: 5px 8px; border-bottom: 1px solid #f0f1f1; } .rp-prog tr.now td { font-weight: 700; }

/* editor (screen only) */
.rp-edit { background: #f8faf9; border: 1px solid #dfe7e2; border-radius: 10px; padding: 14px 16px; }
.rp-edit h2 { border-bottom: 0; padding-bottom: 0; }
.rp-edit label { display: flex; flex-direction: column; gap: 4px; font-size: 12.5px; font-weight: 700; color: #374151; margin-bottom: 10px; }
.rp-edit textarea, .rp-edit input, .rp-edit select { width: 100%; border: 1.5px solid #d9e2dc; border-radius: 8px; padding: 8px 10px; font: inherit; font-size: 14px; font-weight: 500; background: #fff; }
.rp-edit textarea:focus, .rp-edit input:focus, .rp-edit select:focus { outline: none; border-color: #16a34a; }
.rp-edit-row { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; align-items: start; }
.rp-regno { display: flex; flex-direction: column; gap: 3px; font-size: 12.5px; } .rp-regno span { font-weight: 700; color: #374151; }
.rp-regno b { font-size: 14px; color: #111827; padding: 8px 0 0; } .rp-regno a { color: #14532d !important; font-weight: 700; font-size: 12px; }
.rp-acts { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; } .rp-acts span { font-size: 12.5px; color: #6b7280; }
.rp-msg { margin: 8px 0 0; font-size: 13px; font-weight: 700; color: #14532d; } .rp-msg.err { color: #b91c1c; }

/* notes (as printed) */
.rp-notes > div { margin-bottom: 8px; } .rp-notes b { display: block; font-size: 12px; color: #374151; }
.rp-notes p { margin: 2px 0 0; font-size: 13.5px; line-height: 1.6; white-space: pre-wrap; color: #111827; }
.rp-notes-kv { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin: 0; }
.rp-notes-kv dt { font-size: 12px; font-weight: 700; color: #374151; } .rp-notes-kv dd { margin: 2px 0 0; font-size: 13.5px; }

/* responses */
.rp-sheet .rp-intro { margin: 0 0 8px; font-size: 12px; color: #6b7280; font-style: italic; }
.rp-items table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
.rp-items th { text-align: left; font-size: 10.5px; color: #6b7280; text-transform: uppercase; letter-spacing: .4px; border-bottom: 1px solid #d1d5db; padding: 5px 8px; }
.rp-items td { border-bottom: 1px solid #f0f1f1; padding: 5px 8px; vertical-align: top; color: #1f2937; }
.rp-items td:first-child { color: #9ca3af; width: 26px; } .rp-items td:last-child { font-weight: 600; width: 34%; }
.rp-items tr.hot td { color: #991b1b; font-weight: 700; }

/* signature */
.rp-sign { display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; margin-top: 10px; padding-top: 14px; border-top: 1px solid #d1d5db; }
.rp-ref { flex: 1; min-width: 0; } .rp-ref b { font-size: 11px; color: #374151; text-transform: uppercase; letter-spacing: .5px; }
.rp-ref p { margin: 3px 0 0; font-size: 11px; color: #6b7280; line-height: 1.5; } .rp-ref .rp-lic { font-style: italic; }
.rp-sig { margin-left: auto; flex-shrink: 0; text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 1px; }
.rp-sig-space { height: 46px; display: flex; align-items: flex-end; padding-bottom: 4px; }
.rp-sig-space span { font-size: 10.5px; color: #4b5563; font-style: italic; }
.rp-sig .rp-sig-name { display: inline-block; min-width: 160px; border-top: 1px solid #111827; padding-top: 5px; font-size: 14px; color: #111827; }
.rp-sig > span { font-size: 11.5px; color: #4b5563; }

/* footer */
.rp-foot { margin-top: 18px; border-top: 2px solid #14532d; padding-top: 10px; }
.rp-foot b { font-size: 11px; color: #111827; text-transform: uppercase; letter-spacing: .6px; }
.rp-foot p { margin: 4px 0 6px; font-size: 11px; color: #4b5563; line-height: 1.55; }
.rp-use { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin: 6px 0; }
.rp-use div { border: 1px solid #e5e7eb; border-left-width: 3px; padding: 7px 10px; font-size: 11px; line-height: 1.5; color: #374151; }
.rp-use div:first-child { border-left-color: #14532d; } .rp-use div:last-child { border-left-color: #991b1b; }
.rp-use em { display: block; font-style: normal; font-weight: 800; font-size: 10.5px; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 2px; color: #111827; }
.rp-foot .rp-foot-id { margin: 6px 0 0; color: #9ca3af; font-size: 10px; text-align: center; }
.print-only { display: none; }

@media (max-width: 700px) {
  .rp-sheet { padding: 18px 16px; }
  .rp-doc { text-align: left; }
  .rp-client { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .rp-client div:nth-child(4n) { border-right: 1px solid #e5e7eb; } .rp-client div:nth-child(2n) { border-right: 0; }
  .rp-client div:nth-last-child(-n+4) { border-bottom: 1px solid #e5e7eb; } .rp-client div:nth-last-child(-n+2) { border-bottom: 0; }
  .rp-edit-row, .rp-use, .rp-notes-kv { grid-template-columns: 1fr; }
  .rp-sign { flex-direction: column; align-items: stretch; }
  .rp-items td:last-child { width: auto; }
}
@media print {
  @page { size: A4; margin: 14mm 12mm; }
  /* everything above the report prints as plain blocks: flex / clipped wrappers make Chrome slice lines at page breaks */
  html, body, #__next, #__next > div, .rp-page, .rp-sheet { display: block !important; overflow: visible !important; height: auto !important; min-height: 0 !important; max-height: none !important; }
  html, body { background: #fff !important; }
  .rp-page { background: #fff; padding: 0; } .rp-sheet { box-shadow: none; border: 0; max-width: none; padding: 0; }
  .rp-sheet p, .rp-sheet td, .rp-sheet dd { orphans: 3; widows: 3; }
  .rp-sheet h1, .rp-sheet h2 { break-after: avoid; page-break-after: avoid; }
  .rp-items thead { display: table-header-group; }
  .rp-items tr, .rp-prog tr, .rp-notes > div, .rp-notes-kv, .rp-bar-row, .rp-head, .rp-titlebar, .rp-use div { break-inside: avoid; page-break-inside: avoid; }
  .rp-sign, .rp-foot, .rp-result, .rp-client { page-break-inside: avoid; }
  .rp-dot, .rp-bar-row em, .rp-result { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .no-print, #__next .cb-widget, #__next .ck-wrap, .cb-widget, .ck-wrap, #__next > .cb-widget { display: none !important; } .print-only { display: block !important; }
  .rp-items tr, .rp-sign, .rp-foot, .rp-result, .rp-client { break-inside: avoid; }
}
`;
