import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import MainLayout from "../../components/therapists/main-layout";
import { PT_CSS } from "../../components/therapists/portal-ui";
import { fetchById, postData } from "../../utils/actions";
import { apiUrl } from "../../utils/url";
import { ASK_LABEL, ASK_PATH, HELPLINES, fmtAskDate } from "../../utils/ask";

/* "Client questions" — anonymous questions from CYT clients (Ask a psychologist). Verified therapists
   answer; good answers are published on /ask-a-psychologist with the therapist's name, photo and a
   link to book them. Backend: /ask/therapist (AskController). */

const MIN = 150;
const TIPS = [
  "Speak to the person warmly and simply — no jargon.",
  "Give 2–3 practical steps they can try this week.",
  "Don't diagnose or suggest medicines; say when a session or a psychiatrist would help.",
  "If there is any risk of harm, share helplines first (Tele-MANAS 14416, 112).",
];

export default function TherapistQuestions() {
  const [tab, setTab] = useState("open");
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [active, setActive] = useState(null); // question being answered
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const load = (t = tab) => {
    setData(null); setErr("");
    fetchById(`${apiUrl}/ask/therapist`, { tab: t }).then((r) => (r?.status ? setData(r.data) : setErr(r?.message || "Couldn't load."))).catch(() => setErr("Couldn't load questions. Please refresh."));
  };
  useEffect(() => { load(tab); }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  const start = async (q) => {
    setMsg(""); setErr("");
    try {
      const r = await postData(`${apiUrl}/ask/therapist/${q._id}/claim`, {});
      if (!r?.status) throw new Error(r?.message);
      setActive(q); setText("");
    } catch (e) { setErr(e?.response?.data?.message || e.message || "Couldn't open this question."); load(); }
  };
  const send = async () => {
    if (text.trim().length < MIN) return setErr(`Please write at least ${MIN} characters.`);
    setBusy(true); setErr("");
    try {
      const r = await postData(`${apiUrl}/ask/therapist/${active._id}/answer`, { text: text.trim() });
      if (!r?.status) throw new Error(r?.message);
      setActive(null); setText(""); setMsg("Answer sent ✓ The client has been notified. If it's published, it will show on the website with your name.");
      load();
    } catch (e) { setErr(e?.response?.data?.message || e.message || "Couldn't send."); }
    setBusy(false);
  };

  const items = data?.items || [];
  return (
    <MainLayout>
      <Head><title>Client questions | Choose Your Therapist</title></Head>
      <style dangerouslySetInnerHTML={{ __html: PT_CSS + CSS }} />
      <div className="pt">
        <div className="pt-head">
          <div>
            <h1>Client questions</h1>
            <p>Anonymous questions from people on CYT. Answer well and your answer can appear on our <Link href={ASK_PATH}>Ask a Psychologist</Link> page with your name, photo and a Book button.</p>
          </div>
        </div>

        <div className="tq-tabs" role="tablist">
          <button type="button" role="tab" aria-selected={tab === "open"} className={tab === "open" ? "on" : ""} onClick={() => { setActive(null); setTab("open"); }}>Waiting for an answer</button>
          <button type="button" role="tab" aria-selected={tab === "mine"} className={tab === "mine" ? "on" : ""} onClick={() => { setActive(null); setTab("mine"); }}>My answers</button>
        </div>

        {msg && <div className="tq-ok">{msg}</div>}
        {err && <div className="pt-err">{err}</div>}
        {data && !data.approved && tab === "open" && <div className="tq-warn">Only verified therapists can answer. Your profile will be able to answer once it&apos;s approved.</div>}
        {!data && !err && <div className="pt-skel" style={{ height: 220, borderRadius: 18 }} />}
        {data && items.length === 0 && <div className="pt-card tq-empty">{tab === "open" ? "No questions waiting right now. New ones show up here." : "You haven't answered any questions yet."}</div>}

        {active && (
          <div className="pt-card tq-write">
            <div className="tq-q-top"><span className="tq-tag">{ASK_LABEL[active.category] || "Question"}</span>{active.urgent && <span className="tq-urgent">Possible risk — share helplines first</span>}</div>
            <p className="tq-q">{active.body}</p>
            <div className="tq-ctx">{[active.context?.gender, active.context?.ageRange].filter(Boolean).join(" · ") || "No age / gender given"} · asked {fmtAskDate(active.createdAt)}</div>
            {active.urgent && <div className="tq-help">Helplines: {HELPLINES.map(([n, num]) => `${num} (${n})`).join(" · ")}</div>}
            <ul className="tq-tips">{TIPS.map((t) => <li key={t}>{t}</li>)}</ul>
            <textarea rows={10} value={text} onChange={(e) => setText(e.target.value)} placeholder="Write your answer…" maxLength={4000} />
            <div className={`tq-count${text.trim().length < MIN ? " low" : ""}`}>{text.trim().length} / min {MIN}</div>
            <div className="tq-acts">
              <button type="button" className="tq-b main" onClick={send} disabled={busy}>{busy ? "Sending…" : "Send answer"}</button>
              <button type="button" className="tq-b line" onClick={() => setActive(null)}>Cancel</button>
            </div>
            <p className="tq-hold">This question is kept for you for 45 minutes while you write.</p>
          </div>
        )}

        {!active && items.map((q) => (
          <article key={q._id} className="pt-card tq-card">
            <div className="tq-q-top">
              <span className="tq-tag">{ASK_LABEL[q.category] || "Question"}</span>
              {q.urgent && <span className="tq-urgent">Possible risk</span>}
              {tab === "mine" && q.published && <span className="tq-pub">Published</span>}
              <span className="tq-date">{fmtAskDate(tab === "mine" ? q.answer?.at : q.createdAt)}</span>
            </div>
            <p className="tq-q">{q.body}</p>
            {tab === "mine" ? (
              <>
                <p className="tq-a">{q.answer?.text}</p>
                <div className="tq-stats">{q.published ? <><Link href={`${ASK_PATH}/${q.slug}`}>See it on the website →</Link><span>{q.views} views · {q.helpful} found it helpful</span></> : <span>{q.allowPublish ? "Waiting for CYT review before publishing" : "Private — the client didn't allow publishing"}</span>}</div>
              </>
            ) : (
              <div className="tq-row">
                <span className="tq-ctx">{[q.context?.gender, q.context?.ageRange].filter(Boolean).join(" · ")}</span>
                <button type="button" className="tq-b main sm" onClick={() => start(q)} disabled={!data?.approved}>{q.claimedByMe ? "Continue answer" : "Answer"}</button>
              </div>
            )}
          </article>
        ))}
      </div>
    </MainLayout>
  );
}

const CSS = `
.tq-tabs { display: flex; gap: 6px; margin-bottom: 14px; flex-wrap: wrap; }
.tq-tabs button { border: 1.5px solid var(--line); background: #fff; border-radius: 999px; padding: 8px 16px; font-weight: 800; font-size: 13.5px; color: #334155; cursor: pointer; font-family: inherit; }
.tq-tabs button.on { border-color: #1e7a4c; background: #ecfdf3; color: #14532d; }
.tq-ok { background: #ecfdf3; border: 1px solid #c7ecd5; color: #166534; border-radius: 12px; padding: 10px 14px; font-size: 14px; margin-bottom: 12px; }
.tq-warn { background: #fdf3dc; border: 1px solid #f3dca6; color: #8a5a06; border-radius: 12px; padding: 10px 14px; font-size: 14px; margin-bottom: 12px; }
.tq-empty { padding: 22px; color: var(--mut); }
.tq-card, .tq-write { margin: 0 0 12px; padding: 18px 20px; }
.tq-q-top { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-bottom: 8px; }
.tq-tag { font-size: 12px; font-weight: 800; color: #14532d; background: #ecfdf3; padding: 3px 9px; border-radius: 999px; }
.tq-urgent { font-size: 12px; font-weight: 800; color: #b42318; background: #fef3f2; padding: 3px 9px; border-radius: 999px; }
.tq-pub { font-size: 12px; font-weight: 800; color: #1d4ed8; background: #eff6ff; padding: 3px 9px; border-radius: 999px; }
.tq-date { margin-left: auto; font-size: 12px; color: #94a3b8; }
.tq-q { margin: 0; font-size: 15px; line-height: 1.65; color: #1f2937; white-space: pre-line; }
.tq-a { margin: 12px 0 0; padding: 12px 14px; background: #f3f8f4; border-left: 3px solid #1e7a4c; border-radius: 0 12px 12px 0; font-size: 14px; line-height: 1.65; white-space: pre-line; color: #1f2937; }
.tq-stats { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 10px; font-size: 13px; color: var(--mut); }
.tq-stats a { font-weight: 800; color: #1e7a4c !important; }
.tq-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 12px; }
.tq-ctx { font-size: 12.5px; color: var(--mut); margin-top: 6px; }
.tq-help { margin-top: 10px; font-size: 13px; color: #b42318; background: #fef3f2; border-radius: 10px; padding: 8px 12px; }
.tq-tips { margin: 14px 0; padding: 12px 14px 12px 30px; background: #fbf8f0; border-radius: 12px; font-size: 13px; color: #334155; line-height: 1.6; }
.tq-write textarea { width: 100%; border: 1.5px solid var(--line); border-radius: 12px; padding: 12px 14px; font-size: 15px; line-height: 1.6; font-family: inherit; resize: vertical; height: auto; }
.tq-write textarea:focus { outline: none; border-color: #1e7a4c; }
.tq-count { text-align: right; font-size: 12px; color: #166534; font-weight: 700; margin-top: 4px; }
.tq-count.low { color: #b45309; }
.tq-acts { display: flex; gap: 8px; margin-top: 12px; }
.tq-b { display: inline-flex; align-items: center; justify-content: center; height: 44px; padding: 0 20px; border-radius: 12px; font-size: 14.5px; font-weight: 800; border: 0; cursor: pointer; font-family: inherit; }
.tq-b.main { background: linear-gradient(180deg, #1f7a4a, #14532d); color: #fff; }
.tq-b.line { background: #fff; border: 1.5px solid #cfe3d6; color: #166534; }
.tq-b.sm { height: 38px; font-size: 13.5px; padding: 0 16px; }
.tq-b:disabled { opacity: .55; cursor: default; }
.tq-hold { font-size: 12px; color: #94a3b8; margin: 10px 0 0; }
`;
