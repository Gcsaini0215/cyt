import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { TEST_BY_KEY, optionsFor, questionText } from "../../components/self-assessment/tests";
import { clinicalOf, CLINICAL_META } from "../../components/self-assessment/clinical";
import { pathOf } from "../../components/self-assessment/seo";
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
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ text: "", err: false });

  const load = () => fetchById(`${apiUrl}/assessment-requests/${id}/report`)
    .then((r) => { const d = r.data; setRep(d); setNote(d?.note || ""); setNotes({ ...EMPTY, ...(d?.notes || {}) }); })
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

  const printReport = async () => {
    try { if (document.fonts?.ready) await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2500))]); } catch (e) { /* print anyway */ }
    window.print();
  };

  const test = rep && TEST_BY_KEY[rep.tool];
  const res = rep?.result || {};
  const cl = rep ? clinicalOf(rep.tool, res, rep.answers) : null;
  // "Summary of findings": one row per score, flagged when outside the manual's normal / minimal band
  const NORMAL_RE = /none|minimal|below|low-risk|low psychological|normal|low \/ no|no burnout/i;
  const summaryRows = !rep || !test ? [] : (Array.isArray(res.bars) && res.bars.length && res.max == null)
    ? res.bars.map((b) => ({
      name: `${test.short} — ${b.label}`, result: b.band, score: `${b.value}${b.max === 100 ? "/100" : `/${b.max}`}`,
      ref: test.key === "bigfive" ? "0–100 · no clinical cut-off" : test.key === "dass21" ? "Normal band per DASS manual" : "Below 50 = no burnout",
      out: test.key !== "bigfive" && !NORMAL_RE.test(b.band),
    }))
    : (() => {
      const normal = cl.bands.find((b) => NORMAL_RE.test(b.label)) || cl.bands[0];
      const cur = cl.bands.find((b) => b.current);
      return [{
        name: test.short, result: cl.headline, score: cl.score != null ? `${cl.score} / ${cl.max}` : "—",
        ref: normal ? `${normal.range} · ${normal.label}` : "—", out: !!(cur && normal && cur !== normal),
      }];
    })();
  const isT = rep?.viewer === "therapist";
  const released = rep?.status === "released";
  const signer = rep?.signer || {};
  const selfOnly = !!rep?.selfOnly;
  const shownNotes = rep?.notes || {};
  const hasNotes = rep?.note || Object.values(shownNotes).some(Boolean);

  return (
    <div className="rp-page">
      <Head><title>{test ? `${test.short} screening report` : "Screening report"} | Choose Your Therapist</title><meta name="robots" content="noindex" />
        {[400, 600, 700].map((w) => <link key={w} rel="preload" href={`/fonts/inter/inter-${w}.woff2`} as="font" type="font/woff2" crossOrigin="anonymous" />)}
      </Head>
      <style dangerouslySetInnerHTML={{ __html: RP_CSS }} />
      {rep && <style dangerouslySetInnerHTML={{ __html: pageCss(rep) }} />}
      <div className="rp-bar no-print">
        <Link href={isT ? "/therapist-questionnaires" : "/client/check-ins"}>← Back</Link>
        {rep && <button type="button" onClick={printReport}>Print / Save PDF</button>}
      </div>

      {err ? <div className="rp-sheet"><p className="rp-err">{err}</p></div> : !rep ? <div className="rp-sheet"><div className="rp-skel" /></div> : !test ? (
        <div className="rp-sheet"><p className="rp-err">This screening is no longer available.</p></div>
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
              <b>Screening Report</b>
              <span>Report No. {rep.reportNo}</span>
              <span>Date {fmt(rep.doneAt, false)}</span>
            </div>
          </header>
          <div className="rp-conf">{rep.selfOnly ? "Confidential · for the client only" : "Confidential · for the client and the treating psychologist only"}</div>
          <div className="rp-titlebar">
            <h1>{test.full}</h1>
            {!released && <span className="rp-status">Draft — not released</span>}
          </div>

          {/* ── client box ── */}
          <div className="rp-info">
            <dl>
              <div><dt>Client name</dt><dd>{rep.client.name}{rep.client.age || rep.client.gender ? ` (${[rep.client.age ? `${rep.client.age}Y` : "", rep.client.gender ? String(rep.client.gender).charAt(0).toUpperCase() : ""].filter(Boolean).join("/")})` : ""}</dd></div>
              <div><dt>Client ID</dt><dd>{rep.client.code}</dd></div>
              <div><dt>Referred by</dt><dd>{selfOnly ? "Self — screening only" : `${signer.name || rep.therapist}${signer.profileType ? `, ${signer.profileType}` : ""}`}</dd></div>
              {!selfOnly && <div><dt>Session</dt><dd>{fmt(rep.booking_date)}</dd></div>}
            </dl>
            <dl>
              <div><dt>Assigned on</dt><dd>{fmt(rep.sentAt)}</dd></div>
              <div><dt>Completed on</dt><dd>{fmt(rep.doneAt)}</dd></div>
              <div><dt>Released on</dt><dd>{released ? fmt(rep.releasedAt) : "Not released"}</dd></div>
              <div><dt>Mode</dt><dd>Online self-report</dd></div>
            </dl>
          </div>

          {/* ── result: one lab-style table, then the interpretation ── */}
          <section className="rp-sec">
            <h2>Result</h2>
            <table className="rp-lab rp-lab-res">
              <thead><tr><th>Test</th><th>Method</th><th className="num">Score</th><th>Reference</th><th>Interpretation</th></tr></thead>
              <tbody>
                {summaryRows.map((r) => (
                  <tr key={r.name} className={r.out ? "out" : ""}>
                    <td className="t">{r.name}</td><td className="m">Self-report questionnaire</td><td className="num v">{r.score}</td><td className="m">{r.ref}</td>
                    <td>{r.out && <span className="rp-mark" aria-label="Outside normal range">▲</span>}{r.result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="rp-small">▲ outside the minimal / normal range defined in the manual.</p>

            <div className="rp-result">
              <small>Interpretation</small>
              {cl.interpretation.map((t, k) => <p key={k}>{t}</p>)}
              {cl.details.map((t, k) => <p key={`d${k}`} className="rp-detail">{t}</p>)}
              {cl.notes.map((t, k) => <p key={`n${k}`} className="rp-detail">{t}</p>)}
              {(cl.alerts || []).map((t, k) => <p key={`a${k}`} className="rp-flag">{t}</p>)}
            </div>
          </section>

          {(cl.bands.length > 0 || cl.action) && (
            <section className="rp-sec">
              <h2>Reference interval</h2>
              {cl.bandTitle && <p className="rp-bandtitle">{cl.bandTitle}</p>}
              {cl.bands.length > 0 && (
                <table className="rp-bands">
                  <tbody>
                    {cl.bands.map((b) => <tr key={b.range + b.label} className={b.current ? "now" : ""}><td>{b.range}</td><td>{b.label}</td><td>{b.current ? "◀ this result" : ""}</td></tr>)}
                  </tbody>
                </table>
              )}
              {cl.action && <p className="rp-action"><b>Recommended action (manual)</b>{cl.action}</p>}
            </section>
          )}

          {CLINICAL_META[test.key] && (
            <section className="rp-sec">
              <h2>About this test</h2>
              <div className="rp-about">
                <div><b>Clinical significance</b><p>{CLINICAL_META[test.key].significance}</p></div>
                <div><b>Specifications</b><p>{CLINICAL_META[test.key].specs}</p></div>
              </div>
              <p className="rp-meta-line"><b>Administration:</b> {CLINICAL_META[test.key].method}</p>
              <p className="rp-correlate">Please correlate with clinical findings.</p>
            </section>
          )}

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
              </div>
              <div className={`rp-signer${signer.verified ? "" : " warn"}`}>
                <div className="rp-signer-h">
                  <b>Printed in the signature block</b>
                  <span>{signer.verified ? `✓ Approved by CYT${signer.verifiedAt ? ` · ${fmt(signer.verifiedAt, false)}` : ""}` : "Not approved by CYT yet — your signature won't print until it is"}</span>
                </div>
                <div className="rp-signer-row">
                  <div><span>Qualification</span><b>{signer.credential || "—"}</b></div>
                  <div><span>RCI / Reg. No.</span><b>{signer.regNo || (signer.noRegNo ? "Not RCI-registered" : "—")}</b></div>
                  <div><span>Signature</span>{signer.signature ? <img src={signer.signature} alt="" /> : <b>—</b>}</div>
                </div>
                <Link href="/therapist-questionnaires?buy=1">Change these on the Assessments page →</Link>
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
              <dl className="rp-notes-grid">
                {rep.note && <div className="wide"><dt>Summary</dt><dd>{rep.note}</dd></div>}
                {shownNotes.observations && <div className="wide"><dt>Clinical observations</dt><dd>{shownNotes.observations}</dd></div>}
                {shownNotes.recommendations && <div className="wide"><dt>Recommendations / next steps</dt><dd>{shownNotes.recommendations}</dd></div>}
                {shownNotes.followUp && <div><dt>Follow-up</dt><dd>{shownNotes.followUp}</dd></div>}
                {shownNotes.referral && <div><dt>Referral</dt><dd>{shownNotes.referral}</dd></div>}
              </dl>
            </section>
          )}

          {/* ── answers ── */}
          <section className="rp-sec rp-items">
            <h2>Responses</h2>
            <p className="rp-intro">{test.intro}</p>
            <table>
              <thead><tr><th>#</th><th>Item</th><th>Answer</th><th className="num">Score</th></tr></thead>
              <tbody>
                {test.questions.map((_, i) => {
                  const v = rep.answers?.[i];
                  const o = optionsFor(test, i).find((x) => x.value === v);
                  const hot = res.flag && ((test.key === "phq9" && i === 8) || (test.key === "epds" && i === 9)) && v > 0;
                  return <tr key={i} className={hot ? "hot" : ""}><td>{i + 1}</td><td>{questionText(test, i)}</td><td>{o ? o.label : "—"}</td><td className="num">{v ?? "—"}</td></tr>;
                })}
              </tbody>
            </table>
          </section>

          <div className="rp-end"><span>End of report</span></div>

          {/* ── signature ── */}
          <section className="rp-sign">
            {rep.verifyQr && (
              <div className="rp-qr">
                <img src={rep.verifyQr} alt="QR code to verify this report" />
                <span>Scan to verify this report</span>
              </div>
            )}
            <div className="rp-ref">
              <b>Reference</b>
              <p>{test.ref}</p>
              <p className="rp-lic">{test.licence}</p>
            </div>
            {selfOnly ? (
              <div className="rp-sig rp-auto">
                <b>Computer-generated report</b>
                <span>Generated by Choose Your Therapist from the client&apos;s own answers on {fmt(rep.releasedAt || rep.doneAt, false)}.</span>
                <span>Not reviewed by a psychologist · no signature required.</span>
              </div>
            ) : (
            <div className="rp-sig">
              <div className="rp-sig-space">
                {signer.signature && <img src={signer.signature} alt={`Signature of ${signer.name || rep.therapist}`} className="rp-sig-img" />}
                {released ? <span>Digitally approved · {fmt(rep.releasedAt, false)}</span> : null}
              </div>
              <b className="rp-sig-name">{signer.name || rep.therapist}</b>
              <span>{signer.profileType || "Psychologist"}</span>
              {signer.regNo && <span>RCI / Reg. No.: {signer.regNo}</span>}
            </div>
            )}
          </section>
          {selfOnly && (
            <section className="rp-sec rp-next no-print">
              <b>Want a psychologist to go through it with you?</b>
              <span>In a session they explain your result and add a summary, clinical observations, recommendations, a follow-up plan and their signature to your report.</span>
              <Link href={`${pathOf(rep.tool)}?mode=with`}>Find a psychologist →</Link>
            </section>
          )}

          {/* ── how this document may be used ── */}
          <section className="rp-sec rp-terms">
            <div>
              <b>Conditions of reporting</b>
              <ul>
                <li>Results are based on the client&apos;s own answers and are for interpretation by the treating psychologist.</li>
                <li>It is presumed that the client named above completed the questionnaire personally.</li>
                <li>Scores can change with time and circumstances; an unexpected result should be re-assessed.</li>
                <li>Only qualified mental-health professionals should interpret scores and cut-offs.</li>
                <li>This report is not valid for any medico-legal purpose.</li>
              </ul>
            </div>
            <div>
              <b>Explanations</b>
              <ul>
                <li><b>Score</b> — the total (or subscale) calculated with the questionnaire&apos;s published scoring.</li>
                <li><b>Cut-point</b> — the score at or above which further clinical evaluation is recommended.</li>
                <li><b>Reference interval</b> — the score ranges and severity labels defined in the manual.</li>
                <li><b>Assigned / Completed / Released</b> — when the screening was sent, answered, and approved by the psychologist.</li>
              </ul>
            </div>
          </section>

          <footer className="rp-foot">
            <b>About this document</b>
            <p>This report is generated automatically from the client&apos;s own answers, scored with the published scoring of the questionnaire{selfOnly ? ". It was taken as a screening only and has not been reviewed by a psychologist" : ", and approved by the psychologist named above before it is shared"}.{!selfOnly && signer.verified ? " The psychologist's qualification, registration details and signature were checked by Choose Your Therapist before they could issue reports." : ""} It is meant only to track progress across therapy sessions and to assess the current level of symptoms.</p>
            <div className="rp-use">
              <div><em>Can be used for</em><span>Tracking your progress between sessions · discussing results with your psychologist · comparing with later screenings</span></div>
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

// printed page margins: our own footer (report no. + release date + page x of y). Defining margin
// boxes also stops the browser printing its own header / footer (page URL, date).
const cssStr = (v) => `"${String(v || "").replace(/["\\\n]/g, " ")}"`;
function pageCss(rep) {
  const rel = rep.releasedAt ? `Released ${new Date(rep.releasedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" })}` : "Draft — not released";
  const box = "font-family: 'CYT Report', Arial, sans-serif; font-size: 7.5pt; font-weight: 500; color: #4b5563;";
  return `@media print { @page {
    @top-left { content: ""; } @top-center { content: ""; } @top-right { content: ""; }
    @bottom-left { content: ${cssStr(`Choose Your Therapist · Report No. ${rep.reportNo} · ${rel}`)}; width: 78%; ${box} }
    @bottom-right { content: "Page " counter(page) " of " counter(pages); width: 22%; ${box} }
  } }`;
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

/* lab-style details */
.rp-info { display: grid; grid-template-columns: 1.15fr 1fr; gap: 6px 28px; padding: 10px 0 12px; border-bottom: 1px solid #d1d5db; margin-bottom: 14px; }
.rp-info dl { margin: 0; display: flex; flex-direction: column; gap: 4px; }
.rp-info dl div { display: grid; grid-template-columns: 128px 1fr; gap: 8px; font-size: 12.5px; }
.rp-info dt { color: #6b7280; } .rp-info dt::after { content: " :"; }
.rp-info dd { margin: 0; font-weight: 700; color: #111827; }
.rp-lab { width: 100%; border-collapse: collapse; font-size: 12.5px; }
.rp-lab th { text-align: left; font-size: 10.5px; color: #6b7280; text-transform: uppercase; letter-spacing: .5px; border-bottom: 1.5px solid #111827; padding: 5px 8px; }
.rp-lab td { padding: 6px 8px; border-bottom: 1px solid #e5e7eb; color: #1f2937; }
.rp-lab tr.out td { color: #111827; }
.rp-lab td.t { font-weight: 700; } .rp-lab td.m { color: #4b5563; } .rp-lab tr.out td.v, .rp-lab tr.out td:last-child { font-weight: 800; }
.rp-lab-res th:nth-child(1) { width: 30%; }
.rp-lab .num, .rp-items .num { text-align: right; white-space: nowrap; }
.rp-mark { color: #b45309; margin-right: 6px; font-size: 11px; }
.rp-result small { display: block; font-size: 10px; font-weight: 800; letter-spacing: .6px; text-transform: uppercase; color: #6b7280; margin-bottom: 2px; }
.rp-sheet .rp-action { margin: 10px 0 0; padding: 8px 12px; border-left: 3px solid #14532d; background: #f7f9f8; font-size: 12.5px; color: #1f2937; line-height: 1.55; }
.rp-sheet .rp-action b { display: block; font-size: 10.5px; text-transform: uppercase; letter-spacing: .5px; color: #14532d; margin-bottom: 2px; }
.rp-about { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.rp-about > div { border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 12px; }
.rp-about b { display: block; font-size: 10.5px; text-transform: uppercase; letter-spacing: .5px; color: #14532d; margin-bottom: 3px; }
.rp-sheet .rp-about p { margin: 0; font-size: 12.5px; color: #374151; line-height: 1.55; }
.rp-notes-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 18px; margin: 0; }
.rp-notes-grid > div.wide { grid-column: 1 / -1; }
.rp-sheet .rp-notes-grid dt { margin: 0; font-size: 10.5px; font-weight: 800; text-transform: uppercase; letter-spacing: .5px; color: #6b7280; }
.rp-sheet .rp-notes-grid dd { margin: 3px 0 0; font-size: 13.5px; line-height: 1.6; color: #111827; white-space: pre-wrap; }
.rp-lab-main td { font-size: 13px; }
.rp-sheet .rp-small { margin: 6px 0 0; font-size: 11px; color: #6b7280; font-style: italic; }
.rp-sheet .rp-meta-line { margin: 6px 0 0; font-size: 12px; color: #374151; }
.rp-signif p { margin: 0 0 6px; font-size: 12.5px; color: #374151; line-height: 1.55; }
.rp-sheet .rp-correlate { font-weight: 800; color: #111827; margin: 6px 0 0; font-size: 12.5px; }
.rp-terms { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; border-top: 1px solid #d1d5db; padding-top: 12px; }
.rp-terms > div { border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 12px; }
.rp-terms > div > b { display: block; font-size: 11px; text-transform: uppercase; letter-spacing: .6px; color: #111827; margin-bottom: 4px; text-align: center; }
.rp-terms ul { margin: 0; padding-left: 16px; } .rp-terms li { font-size: 11px; color: #4b5563; line-height: 1.5; margin-bottom: 2px; }
.rp-qr { display: flex; flex-direction: column; align-items: center; gap: 4px; flex-shrink: 0; }
.rp-qr img { width: 84px; height: 84px; display: block; }
.rp-qr span { font-size: 10px; color: #6b7280; text-align: center; max-width: 100px; }

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
.rp-sheet .rp-summary .rp-flag { margin: 8px 0 0; font-size: 12.5px; color: #991b1b; font-weight: 700; line-height: 1.5; }
.rp-result .rp-detail { font-size: 12.5px; color: #4b5563; }
.rp-sheet .rp-bandtitle { margin: 0 0 6px; font-size: 12px; color: #6b7280; font-style: italic; }
.rp-bands { width: 100%; border-collapse: collapse; font-size: 12.5px; margin-bottom: 8px; }
.rp-bands td { padding: 5px 8px; border-bottom: 1px solid #f0f1f1; color: #374151; }
.rp-bands td:first-child { width: 90px; font-weight: 700; white-space: nowrap; } .rp-bands td:last-child { width: 110px; text-align: right; font-size: 11.5px; color: #14532d; font-weight: 700; }
.rp-bands tr.now td { background: #f3f4f6; color: #111827; font-weight: 700; }
.rp-sheet .rp-action { margin: 4px 0 0; font-size: 13px; color: #1f2937; line-height: 1.55; }
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
.rp-items td:first-child { color: #9ca3af; width: 26px; } .rp-items td:nth-child(3) { width: 34%; } .rp-items td:last-child { font-weight: 700; width: 56px; }
.rp-items tr.hot td { color: #991b1b; font-weight: 700; }

/* signature */
.rp-sign { display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; margin-top: 10px; padding-top: 14px; border-top: 1px solid #d1d5db; }
.rp-ref { flex: 1; min-width: 0; } .rp-ref b { font-size: 11px; color: #374151; text-transform: uppercase; letter-spacing: .5px; }
.rp-ref p { margin: 3px 0 0; font-size: 11px; color: #6b7280; line-height: 1.5; } .rp-ref .rp-lic { font-style: italic; }
.rp-sig { margin-left: auto; flex-shrink: 0; text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 1px; }
.rp-sig-space { min-height: 46px; display: flex; flex-direction: column; align-items: flex-end; justify-content: flex-end; padding-bottom: 4px; gap: 2px; }
.rp-sig-img { display: block; max-height: 56px; max-width: 200px; object-fit: contain; }
.rp-sig-space span { font-size: 10.5px; color: #4b5563; font-style: italic; padding-right: 3px; }
.rp-sig .rp-sig-name { display: inline-block; min-width: 160px; border-top: 1px solid #111827; padding-top: 5px; font-size: 14px; color: #111827; }
.rp-sig > span { font-size: 11.5px; color: #4b5563; }
.rp-auto { max-width: 260px; border: 1px solid #d1d5db; background: #f9fafb; padding: 10px 12px; text-align: left !important; align-items: flex-start !important; gap: 3px !important; }
.rp-auto b { font-size: 11px; text-transform: uppercase; letter-spacing: .8px; color: #111827; }
.rp-next { margin-top: 12px; border: 1px solid #d9e7de; background: #f3faf5; border-radius: 10px; padding: 12px 14px; display: flex; flex-direction: column; gap: 4px; }
.rp-next b { font-size: 14px; color: #14532d; } .rp-next span { font-size: 13px; color: #374151; line-height: 1.5; }
.rp-next a { margin-top: 4px; font-size: 13.5px; font-weight: 800; color: #14532d !important; }
.rp-sig > span.rp-sig-ver { margin-top: 3px; font-size: 10.5px; color: #14532d; font-weight: 600; }
.rp-signer { margin: 12px 0 4px; border: 1px solid #d9e7de; background: #f7fbf8; border-radius: 8px; padding: 10px 12px; }
.rp-signer.warn { border-color: #fde68a; background: #fffbeb; }
.rp-signer-h { display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap; align-items: baseline; }
.rp-signer-h b { font-size: 12.5px; color: #111827; } .rp-signer-h span { font-size: 12px; font-weight: 700; color: #14532d; }
.rp-signer.warn .rp-signer-h span { color: #92400e; }
.rp-signer-row { display: grid; grid-template-columns: 1.3fr 1fr 1fr; gap: 10px; margin: 8px 0 6px; }
.rp-signer-row span { display: block; font-size: 10px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: .4px; }
.rp-signer-row b { display: block; font-size: 13px; color: #111827; margin-top: 1px; }
.rp-signer-row img { display: block; max-height: 34px; max-width: 140px; object-fit: contain; margin-top: 2px; }
.rp-signer a { font-size: 12px; font-weight: 700; color: #1d4ed8 !important; }
@media screen and (max-width: 700px) { .rp-signer-row { grid-template-columns: 1fr; } }

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

/* one typeface across the whole report. Static (non-variable) Inter files, self-hosted: Chrome turns
   variable fonts into blurry Type 3 glyphs in printed PDFs, static ones stay real, sharp text. */
@font-face { font-family: "CYT Report"; src: url("/fonts/inter/inter-400.woff2") format("woff2"); font-weight: 400; font-style: normal; font-display: swap; }
@font-face { font-family: "CYT Report"; src: url("/fonts/inter/inter-500.woff2") format("woff2"); font-weight: 500; font-style: normal; font-display: swap; }
@font-face { font-family: "CYT Report"; src: url("/fonts/inter/inter-600.woff2") format("woff2"); font-weight: 600; font-style: normal; font-display: swap; }
@font-face { font-family: "CYT Report"; src: url("/fonts/inter/inter-greek-400.woff2") format("woff2"); font-weight: 400 900; font-style: normal; font-display: swap; unicode-range: U+0370-03FF; }
@font-face { font-family: "CYT Report"; src: url("/fonts/inter/inter-700.woff2") format("woff2"); font-weight: 700 900; font-style: normal; font-display: swap; }
.rp-page, .rp-page * { font-family: "CYT Report", Arial, Helvetica, sans-serif !important; }
.rp-sheet { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; text-rendering: optimizeLegibility; font-feature-settings: "kern" 1, "liga" 1; }
.rp-lab, .rp-bands, .rp-prog, .rp-items, .rp-info dd, .rp-doc { font-variant-numeric: tabular-nums; }
.rp-qr img { image-rendering: pixelated; }

/* formal grey styling: section bars, table heads, zebra rows, boxed details */
.rp-sheet h2 { background: #f3f4f6; border-left: 3px solid #14532d; border-bottom: 0; padding: 6px 10px; color: #111827; letter-spacing: 1.1px; margin-bottom: 10px; }
.rp-edit h2 { background: none; border-left: 0; padding: 0; }
.rp-conf { margin-top: 8px; background: #f3f4f6; color: #4b5563; text-align: center; font-size: 10px; font-weight: 700; letter-spacing: 1.4px; text-transform: uppercase; padding: 4px 8px; }
.rp-info { background: #f9fafb; border: 1px solid #e5e7eb; padding: 12px 16px; }
.rp-lab th, .rp-items th, .rp-prog th { background: #f3f4f6; color: #374151; border-bottom: 1px solid #d1d5db; padding: 7px 8px; }
.rp-lab { border: 1px solid #e5e7eb; } .rp-prog, .rp-items table { border: 1px solid #e5e7eb; }
.rp-lab tbody tr:nth-child(even) td, .rp-items tbody tr:nth-child(even) td, .rp-prog tbody tr:nth-child(even) td { background: #fafafa; }
.rp-items tr.hot td { background: #fef2f2 !important; }
.rp-bands { border: 1px solid #e5e7eb; } .rp-bands td:first-child { background: #f9fafb; }
.rp-about > div, .rp-terms > div { border-radius: 0; padding: 0 12px 10px; }
.rp-about b, .rp-terms > div > b { margin: 0 -12px 8px; padding: 6px 12px; background: #f3f4f6; border-bottom: 1px solid #e5e7eb; color: #111827; }
.rp-terms > div > b { text-align: left; }
.rp-notes-grid > div { background: #fafafa; border: 1px solid #eef0ef; padding: 8px 12px; }
.rp-result { background: #f9fafb; }
.rp-end { display: flex; align-items: center; gap: 12px; margin: 18px 0 4px; color: #6b7280; font-size: 10.5px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; }
.rp-end::before, .rp-end::after { content: ""; flex: 1; border-top: 1px dashed #c7cbd1; }
.rp-foot { background: #f9fafb; border: 1px solid #e5e7eb; border-top: 2px solid #14532d; padding: 12px 14px; }
.rp-use div { background: #fff; }

@media screen and (max-width: 700px) {
  .rp-sheet { padding: 18px 16px; }
  .rp-doc { text-align: left; }
  .rp-client { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .rp-client div:nth-child(4n) { border-right: 1px solid #e5e7eb; } .rp-client div:nth-child(2n) { border-right: 0; }
  .rp-client div:nth-last-child(-n+4) { border-bottom: 1px solid #e5e7eb; } .rp-client div:nth-last-child(-n+2) { border-bottom: 0; }
  .rp-edit-row, .rp-use, .rp-notes-kv { grid-template-columns: 1fr; }
  .rp-sign { flex-direction: column; align-items: stretch; }
  .rp-info, .rp-terms, .rp-about, .rp-notes-grid { grid-template-columns: 1fr; } .rp-info dl div { grid-template-columns: 112px 1fr; }
  .rp-lab th:nth-child(2), .rp-lab td:nth-child(2), .rp-lab th:nth-child(4), .rp-lab td:nth-child(4) { display: none; }
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
  .rp-items tr, .rp-prog tr, .rp-bands tr, .rp-lab tr, .rp-info, .rp-terms, .rp-about, .rp-notes-grid > div, .rp-notes > div, .rp-notes-kv, .rp-bar-row, .rp-head, .rp-titlebar, .rp-use div { break-inside: avoid; page-break-inside: avoid; }
  .rp-sign, .rp-foot, .rp-result, .rp-client { page-break-inside: avoid; }
  .rp-dot, .rp-bar-row em, .rp-result { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .rp-sheet, .rp-sheet * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .no-print, #__next .cb-widget, #__next .ck-wrap, .cb-widget, .ck-wrap, #__next > .cb-widget { display: none !important; } .print-only { display: block !important; }
  .rp-items tr, .rp-sign, .rp-foot, .rp-result, .rp-client { break-inside: avoid; }
  /* print type scale (pt) — crisp at any zoom; weights the loaded font really has */
  .rp-sheet { font-size: 9pt; line-height: 1.45; color: #1f2937; text-rendering: geometricPrecision; }
  .rp-sheet [style*="font-weight: 800"], .rp-sheet b, .rp-sheet strong, .rp-sheet th, .rp-sheet h1, .rp-sheet h2, .rp-sheet dd { font-weight: 700 !important; }
  .rp-sheet h1 { font-size: 14pt !important; letter-spacing: -.1pt; }
  .rp-sheet h2 { font-size: 8pt !important; letter-spacing: .8pt !important; }
  .rp-brand b { font-size: 13pt !important; } .rp-brand span, .rp-doc span { font-size: 7.5pt !important; color: #4b5563 !important; }
  .rp-doc b { font-size: 8.5pt !important; letter-spacing: .9pt !important; }
  .rp-conf { font-size: 6.5pt !important; color: #374151 !important; }
  .rp-info dl div { font-size: 8.5pt !important; } .rp-info dt { color: #4b5563 !important; }
  .rp-lab, .rp-bands, .rp-prog, .rp-items table { font-size: 8.5pt !important; }
  .rp-lab th, .rp-items th, .rp-prog th { font-size: 7pt !important; color: #374151 !important; letter-spacing: .4pt !important; }
  .rp-items td:first-child { color: #4b5563 !important; }
  .rp-result p { font-size: 9pt !important; } .rp-result small, .rp-sheet .rp-action b, .rp-about b, .rp-terms > div > b, .rp-sheet .rp-notes-grid dt { font-size: 7pt !important; letter-spacing: .5pt !important; }
  .rp-about p, .rp-sheet .rp-meta-line, .rp-intro, .rp-notes-grid dd, .rp-bar-row > div { font-size: 8.5pt !important; }
  .rp-ref p, .rp-terms li, .rp-foot p, .rp-use div, .rp-qr span, .rp-sig-space span { font-size: 7.5pt !important; color: #374151 !important; }
  .rp-sig .rp-sig-name { font-size: 10.5pt !important; } .rp-sig > span { font-size: 8pt !important; color: #374151 !important; }
  .rp-end { font-size: 7pt !important; color: #4b5563 !important; }
  .rp-foot-id { font-size: 7pt !important; color: #6b7280 !important; }
  /* compact type + even columns on A4 */
  .rp-sheet { font-size: 11px; }
  .rp-head { display: grid !important; grid-template-columns: 1fr auto; align-items: center; padding-bottom: 10px; }
  .rp-logo { width: 46px; height: 46px; } .rp-brand b { font-size: 16px; } .rp-brand span { font-size: 9.5px; }
  .rp-doc { text-align: right; } .rp-doc b { font-size: 11px; } .rp-doc span { font-size: 9.5px; }
  .rp-titlebar { padding: 10px 0 8px; } .rp-titlebar h1 { font-size: 16px; }
  .rp-info { padding: 8px 12px; gap: 3px 20px; margin-bottom: 10px; }
  .rp-info dl div { grid-template-columns: 92px 1fr; font-size: 10.5px; gap: 6px; }
  .rp-sheet h2 { font-size: 10px; padding: 4px 8px; margin-bottom: 6px; }
  .rp-sec { margin-bottom: 10px; }
  .rp-lab, .rp-bands, .rp-prog, .rp-items table { font-size: 10.5px; }
  .rp-lab th, .rp-items th, .rp-prog th { font-size: 9px; padding: 4px 6px; }
  .rp-lab td, .rp-bands td, .rp-prog td, .rp-items td { padding: 3px 6px; }
  .rp-lab td.m { white-space: nowrap; }
  .rp-items td:nth-child(3) { width: 30%; } .rp-items td:last-child { width: 44px; }
  .rp-result { padding: 8px 12px; margin-bottom: 10px; } .rp-result p { font-size: 11.5px; margin-top: 3px; line-height: 1.45; }
  .rp-about { gap: 10px; } .rp-about p, .rp-sheet .rp-meta-line, .rp-intro { font-size: 10.5px; }
  .rp-notes-grid { gap: 6px 12px; } .rp-notes-grid dd { font-size: 11px; }
  .rp-end { margin: 12px 0 2px; }
  .rp-sign { display: grid !important; grid-template-columns: 78px minmax(0, 1fr) 230px; gap: 16px; align-items: end; }
  .rp-qr { grid-column: 1; } .rp-ref { grid-column: 2; } .rp-sig { grid-column: 3; }
  .rp-qr img { width: 74px; height: 74px; } .rp-qr span { font-size: 8.5px; }
  .rp-ref p { font-size: 9px; line-height: 1.4; }
  .rp-sig-img { max-height: 46px; } .rp-sig .rp-sig-name { font-size: 12.5px; } .rp-sig > span { font-size: 10px; }
  .rp-terms { gap: 10px; padding-top: 8px; } .rp-terms li { font-size: 9.5px; margin-bottom: 1px; }
  .rp-foot { margin-top: 10px; padding: 8px 12px; } .rp-foot p, .rp-use div { font-size: 9.5px; }
}
`;
