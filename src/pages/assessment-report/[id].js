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
      const r = await postData(`${apiUrl}/assessment-requests/${id}/release`, { note, notes, regNo, release });
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
              <span className="rp-logo"><img src="/cyt-emblem.png" alt="" width={40} height={40} /></span>
              <div><b>Choose Your Therapist</b><span>Clinical Assessment Report</span></div>
            </div>
            <div className="rp-head-meta">
              <span className={`rp-status${released ? " ok" : ""}`}>{released ? "✓ Approved by psychologist" : "Draft · not released"}</span>
              <span>Report No. <b>{rep.reportNo}</b></span>
              <span>Generated {fmt(rep.doneAt, false)}</span>
            </div>
          </header>
          <div className="rp-strip">HFR ID IN0510005384 · Govt. of India Health Facility Registry · www.chooseyourtherapist.in</div>

          <h1>{test.full}</h1>

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
            <div className="rp-level"><div><small>Result</small><b>{res.level}</b></div>{res.score != null && <span>Score <strong>{res.score}</strong> / {res.max}</span>}</div>
            <p>{res.text}</p>
            {isT && res.flag && <p className="rp-flag">⚠ Self-harm item answered above zero — please assess risk at the start of the session.</p>}
          </section>

          {Array.isArray(res.bars) && res.bars.length > 0 && (
            <section className="rp-sec">
              <h2>Scores by area</h2>
              {res.bars.map((b) => (
                <div key={b.key} className="rp-bar-row">
                  <div><b>{b.label}</b><span style={{ color: b.color }}>{b.band} · {b.value}{b.max === 100 ? "/100" : `/${b.max}`}</span></div>
                  <i><em style={{ width: `${Math.round((b.value / b.max) * 100)}%`, background: b.color }} /></i>
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
                <label>Your registration / licence no.<input maxLength={60} value={regNo} onChange={(e) => setRegNo(e.target.value)} placeholder="e.g. RCI CRR No. A12345" /></label>
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
              <div className="rp-sig-line">{released ? <span>Digitally approved · {fmt(rep.releasedAt, false)}</span> : <span>&nbsp;</span>}</div>
              <b>{signer.name || rep.therapist}</b>
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
.rp-page { min-height: 100vh; background: #eef1ef; padding: 0 16px 40px; font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; color: #0f172a; }
.rp-page p { font-size: inherit; }
.rp-bar { max-width: 860px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 14px 0; }
.rp-bar a { color: #166534 !important; font-weight: 800; font-size: 14px; text-decoration: none !important; }
.rp-bar button, .rp-acts button { height: 40px; padding: 0 16px; border-radius: 11px; border: 1.5px solid #166534; background: #166534; color: #fff; font-weight: 800; font-size: 14px; cursor: pointer; font-family: inherit; }
.rp-acts button.ghost { background: #fff; color: #166534; border-color: #cfe3d6; }
.rp-acts button:disabled { opacity: .6; }
.rp-sheet { max-width: 860px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 16px 40px -28px rgba(15,23,42,.45); padding-bottom: 26px; }
.rp-sheet > *:not(.rp-head):not(.rp-strip) { margin-left: 32px; margin-right: 32px; }
.rp-skel { height: 400px; margin: 24px; border-radius: 12px; background: #f1f5f4; }
.rp-err { color: #b91c1c; font-weight: 700; padding: 24px; }
.rp-head { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; padding: 20px 32px; background: linear-gradient(120deg, #0b3320 0%, #14532d 55%, #1f7a47 100%); color: #fff; }
.rp-brand { display: flex; align-items: center; gap: 12px; }
.rp-logo { width: 48px; height: 48px; border-radius: 13px; background: #fff; display: grid; place-items: center; }
.rp-brand b { display: block; font-size: 18px; letter-spacing: -.2px; } .rp-brand span { display: block; font-size: 12.5px; color: #bbf7d0; font-weight: 700; letter-spacing: .5px; text-transform: uppercase; }
.rp-head-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; font-size: 12px; color: #dcfce7; }
.rp-head-meta b { color: #fff; }
.rp-status { font-size: 11.5px; font-weight: 800; color: #92400e; background: #fde68a; border-radius: 999px; padding: 3px 10px; margin-bottom: 2px; }
.rp-status.ok { color: #14532d; background: #bbf7d0; }
.rp-strip { padding: 7px 32px; background: #f0fdf4; border-bottom: 1px solid #dcfce7; font-size: 11.5px; color: #166534; font-weight: 600; }
.rp-sheet h1 { margin-top: 18px; margin-bottom: 12px; font-size: 21px; font-weight: 800; font-family: inherit; }
.rp-sheet h2 { margin: 0 0 8px; font-size: 13px; font-weight: 800; font-family: inherit; color: #14532d; text-transform: uppercase; letter-spacing: .5px; }
.rp-client { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0; margin-top: 0; margin-bottom: 16px; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
.rp-client div { padding: 8px 12px; border-right: 1px solid #eef2f0; border-bottom: 1px solid #eef2f0; min-width: 0; }
.rp-client div:nth-child(4n) { border-right: 0; } .rp-client div:nth-last-child(-n+4) { border-bottom: 0; }
.rp-client dt { font-size: 10.5px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: .4px; }
.rp-client dd { margin: 2px 0 0; font-size: 13.5px; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rp-result { border: 1.5px solid color-mix(in srgb, var(--lc) 45%, #fff); background: color-mix(in srgb, var(--lc) 8%, #fff); border-radius: 14px; padding: 14px 18px; margin-bottom: 16px; }
.rp-level { display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; }
.rp-level small { display: block; font-size: 10.5px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: .4px; }
.rp-level b { font-size: 22px; color: var(--lc); } .rp-level span { color: #475569; } .rp-level strong { font-size: 22px; color: #0f172a; }
.rp-result p { margin: 8px 0 0; font-size: 14px; line-height: 1.6; color: #334155; }
.rp-result .rp-flag { color: #b91c1c; font-weight: 800; }
.rp-sec { margin-bottom: 16px; }
.rp-bar-row { margin-bottom: 9px; } .rp-bar-row > div { display: flex; justify-content: space-between; font-size: 13.5px; } .rp-bar-row span { font-weight: 800; }
.rp-bar-row i { display: block; height: 8px; border-radius: 8px; background: #eef2f0; margin-top: 4px; overflow: hidden; } .rp-bar-row em { display: block; height: 100%; }
.rp-prog { width: 100%; border-collapse: collapse; font-size: 13px; }
.rp-prog th { text-align: left; font-size: 11px; color: #64748b; border-bottom: 1.5px solid #e2e8f0; padding: 5px 8px; }
.rp-prog td { padding: 6px 8px; border-bottom: 1px solid #eef2f0; } .rp-prog tr.now td { font-weight: 800; background: #f0fdf4; }
.rp-edit { background: #f8fbf9; border: 1px solid #dcebe2; border-radius: 14px; padding: 14px 16px; }
.rp-edit label { display: flex; flex-direction: column; gap: 4px; font-size: 12.5px; font-weight: 700; color: #334155; margin-bottom: 10px; }
.rp-edit textarea, .rp-edit input, .rp-edit select { width: 100%; border: 1.5px solid #dfe7e2; border-radius: 10px; padding: 8px 10px; font: inherit; font-size: 14px; font-weight: 500; background: #fff; }
.rp-edit textarea:focus, .rp-edit input:focus, .rp-edit select:focus { outline: none; border-color: #16a34a; }
.rp-edit-row { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.rp-acts { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; } .rp-acts span { font-size: 12.5px; color: #64748b; }
.rp-msg { margin: 8px 0 0; font-size: 13px; font-weight: 700; color: #166534; } .rp-msg.err { color: #b91c1c; }
.rp-notes > div { margin-bottom: 8px; } .rp-notes b { display: block; font-size: 12.5px; color: #334155; }
.rp-notes p { margin: 2px 0 0; font-size: 14px; line-height: 1.6; white-space: pre-wrap; }
.rp-notes-kv { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin: 0; }
.rp-notes-kv dt { font-size: 12.5px; font-weight: 700; color: #334155; } .rp-notes-kv dd { margin: 2px 0 0; font-size: 14px; }
.rp-sheet .rp-intro { margin: 0 0 8px; font-size: 12.5px; color: #64748b; }
.rp-items table { width: 100%; border-collapse: collapse; font-size: 13px; }
.rp-items th { text-align: left; font-size: 11px; color: #64748b; border-bottom: 1.5px solid #e2e8f0; padding: 5px 8px; }
.rp-items td { border-bottom: 1px solid #eef2f0; padding: 6px 8px; vertical-align: top; } .rp-items td:first-child { color: #94a3b8; width: 28px; } .rp-items td:last-child { font-weight: 700; width: 34%; }
.rp-items tr.hot td { background: #fef2f2; color: #991b1b; }
.rp-sign { display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; margin-top: 8px; padding-top: 14px; border-top: 1px solid #e2e8f0; }
.rp-ref { flex: 1; min-width: 0; } .rp-ref b { font-size: 12px; color: #334155; }
.rp-ref p { margin: 3px 0 0; font-size: 11.5px; color: #64748b; line-height: 1.5; } .rp-ref .rp-lic { font-style: italic; }
.rp-sig { width: 260px; flex-shrink: 0; text-align: center; display: flex; flex-direction: column; gap: 2px; }
.rp-sig-line { height: 54px; border-bottom: 1.5px solid #0f172a; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 4px; margin-bottom: 6px; }
.rp-sig-line span { font-size: 11px; color: #166534; font-weight: 700; }
.rp-sig b { font-size: 14.5px; } .rp-sig span { font-size: 12px; color: #475569; }
.rp-foot { margin-top: 18px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 14px; }
.rp-foot b { font-size: 12.5px; color: #0f172a; }
.rp-foot p { margin: 4px 0 6px; font-size: 11.5px; color: #475569; line-height: 1.55; }
.rp-use { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin: 6px 0; }
.rp-use div { border-radius: 10px; padding: 8px 10px; font-size: 11.5px; line-height: 1.5; color: #334155; }
.rp-use div:first-child { background: #f0fdf4; border: 1px solid #bbf7d0; } .rp-use div:last-child { background: #fef2f2; border: 1px solid #fecaca; }
.rp-use em { display: block; font-style: normal; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: .4px; margin-bottom: 2px; }
.rp-use div:first-child em { color: #166534; } .rp-use div:last-child em { color: #b91c1c; }
.rp-foot .rp-foot-id { margin: 6px 0 0; color: #94a3b8; font-size: 10.5px; }
.print-only { display: none; }
@media (max-width: 700px) {
  .rp-sheet > *:not(.rp-head):not(.rp-strip) { margin-left: 16px; margin-right: 16px; }
  .rp-head { padding: 16px; } .rp-strip { padding: 7px 16px; } .rp-head-meta { align-items: flex-start; }
  .rp-client { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .rp-client div:nth-child(4n) { border-right: 1px solid #eef2f0; } .rp-client div:nth-child(2n) { border-right: 0; }
  .rp-client div:nth-last-child(-n+4) { border-bottom: 1px solid #eef2f0; } .rp-client div:nth-last-child(-n+2) { border-bottom: 0; }
  .rp-edit-row, .rp-use, .rp-notes-kv { grid-template-columns: 1fr; }
  .rp-sign { flex-direction: column; align-items: stretch; } .rp-sig { width: 100%; }
  .rp-items td:last-child { width: auto; }
}
@media print {
  @page { size: A4; margin: 12mm; }
  .rp-page { background: #fff; padding: 0; } .rp-sheet { box-shadow: none; border-radius: 0; max-width: none; }
  .rp-head, .rp-strip, .rp-result, .rp-use div, .rp-status { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .no-print { display: none !important; } .print-only { display: block !important; }
  .rp-items tr, .rp-sign, .rp-foot { break-inside: avoid; }
}
`;
