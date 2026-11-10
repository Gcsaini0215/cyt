import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import ClientShell from "../../components/client/client-shell";
import { fetchById, postData } from "../../utils/actions";
import { apiUrl } from "../../utils/url";
import { ASK_CATEGORIES, ASK_LABEL, ASK_AGES, ASK_GENDERS, ASK_PATH, HELPLINES, fmtAskDate } from "../../utils/ask";

/* "Ask a psychologist" in the client portal: ask anonymously, see answers from verified CYT
   psychologists. Backend: POST /ask/questions, GET /ask/questions/mine (AskController). */

const MAX = 1500;

export default function AskPage() {
  const [list, setList] = useState(null);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({ body: "", category: "", ageRange: "", gender: "", allowPublish: true });
  const [sending, setSending] = useState(false);
  const [formErr, setFormErr] = useState("");
  const [done, setDone] = useState(null); // { urgent }
  const [open, setOpen] = useState(null);

  const load = () => fetchById(`${apiUrl}/ask/questions/mine`).then((r) => setList(r?.status ? r.data : [])).catch(() => setErr("Couldn't load your questions. Please refresh."));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setFormErr("");
    if (form.body.trim().length < 30) return setFormErr("Please write a little more (at least 30 characters) so a psychologist can help.");
    if (!form.category) return setFormErr("Please pick what it's about.");
    setSending(true);
    try {
      const r = await postData(`${apiUrl}/ask/questions`, { ...form, body: form.body.trim() });
      if (!r?.status) throw new Error(r?.message);
      setDone({ urgent: !!r.data?.urgent });
      setForm({ body: "", category: "", ageRange: "", gender: "", allowPublish: true });
      load();
    } catch (ex) {
      setFormErr(ex?.response?.data?.message || ex?.message || "Couldn't send. Please try again.");
    }
    setSending(false);
  };

  const pending = (list || []).filter((q) => !q.answer).length;

  return (
    <ClientShell title="Ask a psychologist">
      <Head>
        <title>Ask a psychologist | Choose Your Therapist</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="aq">
        <header className="aq-head">
          <div>
            <span className="aq-eyebrow">Free · anonymous</span>
            <h1>Ask a psychologist</h1>
            <p>Ask anything on your mind. A verified Choose Your Therapist psychologist will write back — usually within 48 hours. Your name is never shown.</p>
          </div>
          <Link href={ASK_PATH} className="aq-link">Read answered questions →</Link>
        </header>

        <div className="aq-grid">
          <form className="aq-card aq-form" onSubmit={submit} noValidate>
            {done ? (
              <div className={`aq-done${done.urgent ? " urgent" : ""}`} role="status">
                {done.urgent ? (
                  <>
                    <b>Thank you for telling us. You don&apos;t have to go through this alone.</b>
                    <p>A psychologist will read your question soon. If you might act on these thoughts or feel unsafe right now, please call one of these free lines straight away:</p>
                    <ul>{HELPLINES.map(([n, num]) => <li key={num}><a href={`tel:${num.replace(/\D/g, "")}`}>{num}</a> — {n}</li>)}</ul>
                    <Link href="/client/find" className="aq-b main">Talk to a psychologist today</Link>
                  </>
                ) : (
                  <>
                    <b>Your question is with our psychologists ✓</b>
                    <p>You&apos;ll get a notification and an email when it&apos;s answered — usually within 48 hours.</p>
                    <button type="button" className="aq-b line" onClick={() => setDone(null)}>Ask another question</button>
                  </>
                )}
              </div>
            ) : (
              <>
                <h2>Your question</h2>
                <label className="aq-l" htmlFor="aq-cat">What is it about?</label>
                <div className="aq-chips" id="aq-cat" role="radiogroup" aria-label="Topic">
                  {ASK_CATEGORIES.map(([k, l]) => (
                    <button key={k} type="button" role="radio" aria-checked={form.category === k} className={form.category === k ? "on" : ""} onClick={() => setForm((f) => ({ ...f, category: k }))}>{l}</button>
                  ))}
                </div>
                <label className="aq-l" htmlFor="aq-body">Write your question</label>
                <textarea id="aq-body" rows={7} maxLength={MAX} value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                  placeholder="e.g. I overthink every small thing at work and can't switch off at night. How can I stop this cycle?" />
                <div className="aq-count">{form.body.length}/{MAX}</div>
                <div className="aq-two">
                  <label className="aq-l">Age (optional)
                    <select value={form.ageRange} onChange={(e) => setForm((f) => ({ ...f, ageRange: e.target.value }))}><option value="">—</option>{ASK_AGES.map((a) => <option key={a}>{a}</option>)}</select>
                  </label>
                  <label className="aq-l">Gender (optional)
                    <select value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}><option value="">—</option>{ASK_GENDERS.map((a) => <option key={a}>{a}</option>)}</select>
                  </label>
                </div>
                <label className="aq-consent">
                  <input type="checkbox" checked={form.allowPublish} onChange={(e) => setForm((f) => ({ ...f, allowPublish: e.target.checked }))} />
                  <span>The question and answer may be shared on the website <b>without my name</b> to help others (we remove anything that could identify you).</span>
                </label>
                <p className="aq-safe">Not for emergencies. If you feel unsafe, call <a href="tel:14416">Tele-MANAS 14416</a> or <a href="tel:112">112</a>.</p>
                {formErr && <div className="aq-err" role="alert">{formErr}</div>}
                <button type="submit" className="aq-b main" disabled={sending}>{sending ? "Sending…" : "Send to a psychologist"}</button>
              </>
            )}
          </form>

          <section className="aq-side">
            <div className="aq-card aq-how">
              <h2>How it works</h2>
              <ol>
                <li><b>Ask</b> — only you and our psychologists see your question.</li>
                <li><b>Get an answer</b> from a verified psychologist, here and on email.</li>
                <li><b>Go further</b> — book that psychologist if you&apos;d like to talk it through.</li>
              </ol>
            </div>
          </section>
        </div>

        <section className="aq-mine">
          <h2>Your questions {pending > 0 && <span className="aq-pill">{pending} waiting</span>}</h2>
          {err && <div className="aq-err">{err}</div>}
          {!list && !err && <div className="aq-skel" />}
          {list && list.length === 0 && <p className="aq-empty">You haven&apos;t asked anything yet.</p>}
          {list && list.map((q) => (
            <article key={q._id} className={`aq-card aq-q${q.answer ? " answered" : ""}`}>
              <div className="aq-q-top">
                <span className="aq-tag">{ASK_LABEL[q.category] || "Question"}</span>
                <span className={`aq-status ${q.answer ? "ok" : "wait"}`}>{q.answer ? "Answered" : "Waiting for a psychologist"}</span>
                <span className="aq-date">{fmtAskDate(q.createdAt)}</span>
              </div>
              <p className="aq-q-body">{q.body}</p>
              {q.answer && (
                <div className="aq-ans">
                  <div className="aq-ans-who">
                    <b>{q.therapist?.name || "CYT psychologist"}</b>
                    {q.therapist?.profile_type && <span>{q.therapist.profile_type}</span>}
                  </div>
                  <p className={open === q._id ? "" : "clip"}>{q.answer.text}</p>
                  {q.answer.text.length > 420 && <button type="button" className="aq-more" onClick={() => setOpen(open === q._id ? null : q._id)}>{open === q._id ? "Show less" : "Read full answer"}</button>}
                  <div className="aq-ans-acts">
                    <Link href="/client/find" className="aq-b main sm">Book a session</Link>
                    {q.published && q.slug && <Link href={`${ASK_PATH}/${q.slug}`} className="aq-b line sm">See it on the website</Link>}
                  </div>
                </div>
              )}
            </article>
          ))}
        </section>
      </div>
    </ClientShell>
  );
}

const CSS = `
.aq { --g:#14532d; --g2:#1e7a4c; --gold:#e0ab45; --ink:#0b1712; --mut:#5b6b63; --line:#e2ebe5; max-width: 1080px; margin: 0 auto; padding: 6px 0 40px; color: var(--ink); }
.aq-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; margin-bottom: 18px; flex-wrap: wrap; }
.aq-eyebrow { display: inline-block; font-size: 11.5px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: #8a5a06; background: #fdf3dc; padding: 4px 10px; border-radius: 999px; margin-bottom: 8px; }
.aq-head h1 { font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 800; margin: 0 0 6px; color: var(--ink); }
.aq-head p { margin: 0; color: var(--mut); max-width: 640px; font-size: 15px; line-height: 1.55; }
.aq-link { font-weight: 800; color: var(--g2) !important; font-size: 14px; text-decoration: none !important; }
.aq-grid { display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr); gap: 16px; align-items: start; }
.aq-card { background: #fff; border: 1px solid var(--line); border-radius: 18px; padding: 20px; box-shadow: 0 10px 30px -26px rgba(15,23,42,.4); }
.aq-card h2, .aq-mine h2 { font-size: 17px; font-weight: 800; margin: 0 0 12px; color: var(--ink); display: flex; align-items: center; gap: 8px; }
.aq-l { display: block; font-size: 13px; font-weight: 700; color: #334155; margin: 12px 0 6px; }
.aq-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.aq-chips button { border: 1.5px solid var(--line); background: #fff; border-radius: 999px; padding: 7px 12px; font-size: 13px; font-weight: 600; color: #334155; cursor: pointer; font-family: inherit; }
.aq-chips button.on { border-color: var(--g2); background: #ecfdf3; color: var(--g); box-shadow: inset 0 0 0 1px var(--g2); }
.aq textarea, .aq select { width: 100%; border: 1.5px solid var(--line); border-radius: 12px; padding: 11px 13px; font-size: 15px; line-height: 1.55; font-family: inherit; color: var(--ink); background: #fff; height: auto; }
.aq select { height: 44px; padding: 0 10px; margin-top: 6px; font-size: 14px; }
.aq textarea:focus, .aq select:focus { outline: none; border-color: var(--g2); box-shadow: 0 0 0 3px rgba(30,122,76,.12); }
.aq-count { text-align: right; font-size: 12px; color: #94a3b8; margin-top: 4px; }
.aq-two { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.aq-consent { display: flex; gap: 10px; align-items: flex-start; margin-top: 14px; padding: 11px 13px; border-radius: 12px; background: #f6faf7; border: 1px solid var(--line); font-size: 13px; line-height: 1.55; color: #334155; cursor: pointer; }
.aq .aq-consent input[type="checkbox"] { opacity: 1; position: static; appearance: auto; -webkit-appearance: checkbox; width: 18px; height: 18px; min-width: 18px; margin: 2px 0 0; accent-color: var(--g2); }
.aq-safe { font-size: 12.5px; color: var(--mut); margin: 12px 0 0; }
.aq-safe a { color: #b42318 !important; font-weight: 700; }
.aq-err { margin-top: 12px; font-size: 14px; color: #b42318; background: #fef3f2; border: 1px solid #fecdca; padding: 10px 12px; border-radius: 10px; }
.aq-b { display: inline-flex; align-items: center; justify-content: center; height: 46px; padding: 0 20px; border-radius: 12px; font-size: 15px; font-weight: 800; border: 0; cursor: pointer; font-family: inherit; text-decoration: none !important; }
.aq-b.main { background: linear-gradient(180deg, #1f7a4a, #14532d); color: #fff !important; }
.aq-form > .aq-b.main { width: 100%; margin-top: 16px; }
.aq-b.line { background: #fff; border: 1.5px solid #cfe3d6; color: #166534 !important; }
.aq-b.sm { height: 38px; font-size: 13.5px; padding: 0 14px; }
.aq-b:disabled { opacity: .65; }
.aq-done { padding: 6px 2px; }
.aq-done b { display: block; font-size: 17px; margin-bottom: 6px; color: var(--g); }
.aq-done.urgent b { color: #b42318; }
.aq-done p { color: #334155; font-size: 14.5px; line-height: 1.6; margin: 0 0 12px; }
.aq-done ul { margin: 0 0 14px; padding-left: 18px; font-size: 14.5px; line-height: 1.8; }
.aq-done ul a { font-weight: 800; color: #b42318 !important; }
.aq-how ol { margin: 0; padding-left: 18px; color: #334155; font-size: 14px; line-height: 1.6; display: grid; gap: 8px; }
.aq-mine { margin-top: 26px; }
.aq-pill { font-size: 12px; font-weight: 800; color: #8a5a06; background: #fdf3dc; padding: 3px 9px; border-radius: 999px; }
.aq-empty { color: var(--mut); }
.aq-skel { height: 120px; border-radius: 16px; background: #eef3ef; }
.aq-q { margin-bottom: 12px; }
.aq-q.answered { border-color: #cfe3d6; }
.aq-q-top { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-bottom: 8px; }
.aq-tag { font-size: 12px; font-weight: 700; color: var(--g); background: #ecfdf3; padding: 3px 9px; border-radius: 999px; }
.aq-status { font-size: 12px; font-weight: 700; padding: 3px 9px; border-radius: 999px; }
.aq-status.ok { color: #166534; background: #dcfce7; }
.aq-status.wait { color: #8a5a06; background: #fdf3dc; }
.aq-date { margin-left: auto; font-size: 12px; color: #94a3b8; }
.aq-q-body { margin: 0; font-size: 15px; line-height: 1.6; color: #1f2937; white-space: pre-line; }
.aq-ans { margin-top: 12px; padding: 14px; border-radius: 14px; background: #f3f8f4; border-left: 3px solid var(--g2); }
.aq-ans-who { display: flex; gap: 8px; align-items: baseline; flex-wrap: wrap; margin-bottom: 6px; }
.aq-ans-who b { color: var(--g); font-size: 14px; }
.aq-ans-who span { color: var(--mut); font-size: 13px; }
.aq-ans p { margin: 0; font-size: 14.5px; line-height: 1.7; color: #1f2937; white-space: pre-line; }
.aq-ans p.clip { display: -webkit-box; -webkit-line-clamp: 6; -webkit-box-orient: vertical; overflow: hidden; }
.aq-more { border: 0; background: none; color: var(--g2); font-weight: 800; padding: 6px 0 0; cursor: pointer; font-family: inherit; font-size: 13.5px; }
.aq-ans-acts { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
@media (max-width: 900px) { .aq-grid { grid-template-columns: 1fr; } }
@media (max-width: 575px) { .aq-card { padding: 16px 14px; } .aq-two { grid-template-columns: 1fr; } }
`;
