import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { TEST_BY_KEY, optionsFor, questionText } from "../../components/self-assessment/tests";
import { fetchById, postData } from "../../utils/actions";
import { apiUrl } from "../../utils/url";
import { isAuthenticated } from "../../utils/jwt";

/* The automatic report for a clinical assessment: client details, result with the published scoring,
   subscales, every answer, the reference. The psychologist adds a note and releases it to the client;
   the client can open it only after that. Prints cleanly (A4). */

const fmt = (d, time = true) => (d ? new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", ...(time ? { hour: "numeric", minute: "2-digit" } : {}), timeZone: "Asia/Kolkata" }) : "—");

export default function AssessmentReport() {
  const router = useRouter();
  const { id } = router.query;
  const [rep, setRep] = useState(null);
  const [err, setErr] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const load = () => fetchById(`${apiUrl}/assessment-requests/${id}/report`)
    .then((r) => { setRep(r.data); setNote(r.data?.note || ""); })
    .catch((e) => setErr(e?.response?.data?.message || "Couldn't load the report."));
  useEffect(() => {
    if (!id) return;
    if (!isAuthenticated()) { router.replace(`/login?next=${encodeURIComponent(router.asPath)}`); return; }
    load();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const release = async () => {
    if (rep.status !== "released" && !window.confirm("Release this report to the client? Do this after you've gone through it with them.")) return;
    setBusy(true); setMsg("");
    try { const r = await postData(`${apiUrl}/assessment-requests/${id}/release`, { note }); setMsg(r?.message || "Saved."); await load(); }
    catch (e) { setMsg(e?.response?.data?.message || "Couldn't save — please try again."); }
    setBusy(false);
  };

  const test = rep && TEST_BY_KEY[rep.tool];
  const res = rep?.result || {};
  const isT = rep?.viewer === "therapist";

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
          <header className="rp-head">
            <img src="/cyt-emblem.png" alt="" width={44} height={44} />
            <div><b>Choose Your Therapist</b><span>Clinical Assessment Report · HFR ID IN0510005384</span></div>
          </header>

          <h1>{test.full}</h1>
          <dl className="rp-meta">
            <div><dt>Client</dt><dd>{rep.client.name}{rep.client.age ? `, ${rep.client.age} yrs` : ""}{rep.client.gender ? `, ${rep.client.gender}` : ""}</dd></div>
            <div><dt>Psychologist</dt><dd>{rep.therapist}</dd></div>
            <div><dt>Completed</dt><dd>{fmt(rep.doneAt)}</dd></div>
            <div><dt>Session</dt><dd>{fmt(rep.booking_date)}</dd></div>
          </dl>

          <section className="rp-result" style={{ "--lc": res.color || "#16a34a" }}>
            <div className="rp-level"><b>{res.level}</b>{res.score != null && <span>Score <strong>{res.score}</strong> / {res.max}</span>}</div>
            <p>{res.text}</p>
            {isT && res.flag && <p className="rp-flag">⚠ Self-harm item answered above zero — please assess risk at the start of the session.</p>}
          </section>

          {Array.isArray(res.bars) && res.bars.length > 0 && (
            <section className="rp-bars">
              <h2>Scores by area</h2>
              {res.bars.map((b) => (
                <div key={b.key} className="rp-bar">
                  <div><b>{b.label}</b><span style={{ color: b.color }}>{b.band} · {b.value}{b.max === 100 ? "/100" : `/${b.max}`}</span></div>
                  <i><em style={{ width: `${Math.round((b.value / b.max) * 100)}%`, background: b.color }} /></i>
                </div>
              ))}
            </section>
          )}

          {(isT || rep.note) && (
            <section className="rp-note">
              <h2>Psychologist&apos;s note</h2>
              {isT ? (
                <div className="no-print">
                  <textarea rows={3} maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} placeholder="What this means for the client and the next steps — shown to them when you release the report." />
                  <div className="rp-acts">
                    <button type="button" onClick={release} disabled={busy}>{rep.status === "released" ? "Update note" : "Release report to client"}</button>
                    <span>{rep.status === "released" ? `Released ${fmt(rep.releasedAt)}` : "Not visible to the client yet."}</span>
                  </div>
                  {msg && <p className="rp-msg">{msg}</p>}
                </div>
              ) : null}
              {rep.note && <p className={`rp-note-txt${isT ? " print-only" : ""}`}>{rep.note}</p>}
            </section>
          )}

          <section className="rp-items">
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

          <footer className="rp-foot">
            <p><b>Reference:</b> {test.ref}</p>
            <p>{test.licence}</p>
            <p>This is a screening result scored automatically with the published scoring of the questionnaire. It is not a diagnosis; it should be interpreted by a qualified mental-health professional together with a clinical interview.</p>
          </footer>
        </article>
      )}
    </div>
  );
}

const RP_CSS = `
.rp-page { min-height: 100vh; background: #eef1ef; padding: 0 16px 40px; font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; color: #0f172a; }
.rp-bar { max-width: 860px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 14px 0; }
.rp-bar a { color: #166534 !important; font-weight: 800; font-size: 14px; text-decoration: none !important; }
.rp-bar button, .rp-acts button { height: 40px; padding: 0 16px; border-radius: 11px; border: 0; background: #166534; color: #fff; font-weight: 800; font-size: 14px; cursor: pointer; font-family: inherit; }
.rp-acts button:disabled { opacity: .6; }
.rp-sheet { max-width: 860px; margin: 0 auto; background: #fff; border-radius: 16px; padding: 32px 36px; box-shadow: 0 16px 40px -28px rgba(15,23,42,.45); }
.rp-skel { height: 400px; border-radius: 12px; background: #f1f5f4; }
.rp-err { color: #b91c1c; font-weight: 700; }
.rp-head { display: flex; align-items: center; gap: 12px; padding-bottom: 14px; border-bottom: 2px solid #166534; }
.rp-head b { display: block; font-size: 17px; color: #14532d; } .rp-head span { font-size: 12.5px; color: #64748b; }
.rp-sheet h1 { margin: 18px 0 10px; font-size: 22px; font-weight: 800; font-family: inherit; }
.rp-sheet h2 { margin: 0 0 8px; font-size: 15px; font-weight: 800; font-family: inherit; color: #14532d; text-transform: uppercase; letter-spacing: .4px; }
.rp-meta { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px 20px; margin: 0 0 18px; }
.rp-meta div { display: flex; gap: 8px; font-size: 14px; } .rp-meta dt { color: #64748b; min-width: 96px; } .rp-meta dd { margin: 0; font-weight: 700; }
.rp-result { border: 1.5px solid color-mix(in srgb, var(--lc) 45%, #fff); background: color-mix(in srgb, var(--lc) 8%, #fff); border-radius: 14px; padding: 16px 18px; margin-bottom: 18px; }
.rp-level { display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; }
.rp-level b { font-size: 22px; color: var(--lc); } .rp-level span { color: #475569; } .rp-level strong { font-size: 22px; color: #0f172a; }
.rp-result p { margin: 8px 0 0; font-size: 14.5px; line-height: 1.6; color: #334155; }
.rp-result .rp-flag { color: #b91c1c; font-weight: 800; }
.rp-bars, .rp-note, .rp-items { margin-bottom: 18px; }
.rp-bar { margin-bottom: 10px; } .rp-bar > div { display: flex; justify-content: space-between; font-size: 14px; } .rp-bar span { font-weight: 800; }
.rp-bar i { display: block; height: 8px; border-radius: 8px; background: #eef2f0; margin-top: 5px; overflow: hidden; } .rp-bar em { display: block; height: 100%; }
.rp-note textarea { width: 100%; border: 1.5px solid #dfe7e2; border-radius: 10px; padding: 10px; font: inherit; font-size: 14px; }
.rp-acts { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-top: 8px; } .rp-acts span { font-size: 13px; color: #64748b; }
.rp-msg { margin: 8px 0 0; font-size: 13px; font-weight: 700; color: #166534; }
.rp-note-txt { margin: 0; font-size: 14.5px; line-height: 1.6; background: #f8fafc; border-left: 3px solid #166534; padding: 10px 12px; border-radius: 6px; }
.rp-intro { margin: 0 0 8px; font-size: 13px; color: #64748b; }
.rp-items table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
.rp-items th { text-align: left; font-size: 12px; color: #64748b; border-bottom: 1.5px solid #e2e8f0; padding: 6px 8px; }
.rp-items td { border-bottom: 1px solid #eef2f0; padding: 7px 8px; vertical-align: top; } .rp-items td:first-child { color: #94a3b8; width: 28px; } .rp-items td:last-child { font-weight: 700; width: 34%; }
.rp-items tr.hot td { background: #fef2f2; color: #991b1b; }
.rp-foot { border-top: 1px solid #e2e8f0; padding-top: 12px; color: #64748b; } .rp-foot p { margin: 0 0 6px; font-size: 12px; line-height: 1.55; color: #64748b; }
.print-only { display: none; }
@media (max-width: 600px) { .rp-sheet { padding: 20px 16px; } .rp-meta { grid-template-columns: 1fr; } .rp-items td:last-child { width: auto; } }
@media print {
  .rp-page { background: #fff; padding: 0; } .rp-sheet { box-shadow: none; border-radius: 0; padding: 0; max-width: none; }
  .no-print { display: none !important; } .print-only { display: block !important; }
  .rp-items tr { break-inside: avoid; }
}
`;
