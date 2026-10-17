import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SuggestedTherapists from "./suggested-therapists";
import { optionsFor, questionText } from "./tests";
import { postData } from "../../utils/actions";
import { apiUrl } from "../../utils/url";
import { getDecodedToken } from "../../utils/jwt";

/* Takes one free self-check (definition from ./tests) one question at a time, then shows the
   published result, the reference, and saves score + band (never the answers) for clients. */

export default function AssessmentForm({ test, onBack, clinical = null }) {
  // clinical = { therapist, onSubmit(answers) → Promise<boolean> }: a booked clinical assessment —
  // answers go to the psychologist; the client doesn't see the score here
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(""); // "" | saving | ok | err
  const [sending, setSending] = useState(false);
  const [sendErr, setSendErr] = useState("");
  const advanceRef = useRef(null);
  const cardRef = useRef(null);
  const savedRef = useRef(false);

  const total = test.questions.length;
  const progress = ((current + 1) / total) * 100;
  const options = optionsFor(test, current);

  const choose = (value) => {
    setAnswers((a) => ({ ...a, [current]: value }));
    clearTimeout(advanceRef.current);
    // picking an answer moves on by itself (a short pause so the choice is seen)
    if (current < total - 1) advanceRef.current = setTimeout(() => setCurrent((q) => Math.min(q + 1, total - 1)), 320);
  };
  useEffect(() => () => clearTimeout(advanceRef.current), []);
  // keep the question in view on phones
  useEffect(() => {
    const el = cardRef.current;
    if (el && el.getBoundingClientRect().top < 70) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [current]);

  const result = submitted ? test.score(answers) : null;

  const save = () => {
    if (clinical) return;
    const tok = getDecodedToken();
    if (!tok || tok.role !== 0) return; // only clients keep a history
    setSaved("saving");
    postData(`${apiUrl}/assessments`, {
      test: test.key, title: test.full, level: result.level, flag: !!result.flag,
      ...(result.dims ? { dims: result.dims } : { score: result.score }),
    }).then((x) => setSaved(x?.status ? "ok" : "err")).catch(() => setSaved("err"));
  };
  useEffect(() => {
    if (!submitted || savedRef.current) return;
    savedRef.current = true;
    save();
  }, [submitted]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async () => {
    if (clinical) {
      setSending(true); setSendErr("");
      const ok = await clinical.onSubmit(test.questions.map((_, i) => answers[i]));
      setSending(false);
      if (!ok) { setSendErr("Couldn't submit — please check your connection and try again."); return; }
    }
    setSubmitted(true); window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (submitted && clinical) {
    return (
      <section className="saf" style={{ "--c": test.color }}>
        <style dangerouslySetInnerHTML={{ __html: SAF_CSS }} />
        <div className="saf-in">
          <div className="sar">
            <span className="sar-kick">{test.full}</span>
            <div className="sar-level" style={{ "--lc": "#16a34a" }}><b>Submitted ✓</b></div>
            <p className="sar-text">Thank you. Your answers have gone to {clinical.therapist}, who will go through the result with you in your session. Your report will appear in My check-ins after that.</p>
            {result.flag && (
              <div className="sar-alert" role="alert">
                <b>You don&apos;t have to handle this alone</b>
                <span>If you are having thoughts of harming yourself, please talk to someone now — call Tele-MANAS on <a href="tel:14416">14416</a> or <a href="tel:18008914416">1800-89-14416</a> (free, 24×7), or go to your nearest hospital.</span>
              </div>
            )}
            <div className="saf-nav"><Link href="/client/check-ins" className="saf-btn solid">Go to My check-ins</Link></div>
          </div>
        </div>
      </section>
    );
  }

  if (submitted) {
    return (
      <section className="saf" style={{ "--c": test.color }}>
        <style dangerouslySetInnerHTML={{ __html: SAF_CSS }} />
        <div className="saf-in wide">
          <div className="sar">
            <span className="sar-kick">{test.full} · result</span>
            <div className="sar-level" style={{ "--lc": result.color }}>
              <b>{result.level}</b>
              {result.score != null && <span>Score <strong>{result.score}</strong> / {test.max}</span>}
            </div>
            <p className="sar-text">{result.text}</p>

            {result.bars && (
              <div className="sar-bars">
                {result.bars.map((b) => (
                  <div key={b.key} className="sar-bar">
                    <div className="sar-bar-h"><b>{b.label}</b><span style={{ color: b.color }}>{b.band} · {b.value}{b.max === 100 ? "" : `/${b.max}`}</span></div>
                    <i><em style={{ width: `${Math.round((b.value / b.max) * 100)}%`, background: b.color }} /></i>
                    {b.def && <p>{b.def}</p>}
                  </div>
                ))}
              </div>
            )}

            {result.flag && (
              <div className="sar-alert" role="alert">
                <b>You don&apos;t have to handle this alone</b>
                <span>If you are having thoughts of harming yourself, please talk to someone now — call Tele-MANAS on <a href="tel:14416">14416</a> or <a href="tel:18008914416">1800-89-14416</a> (free, 24×7), or go to your nearest hospital.</span>
              </div>
            )}

            <div className="sar-ref">
              <b>About this check</b>
              <p>{test.ref}</p>
              <p className="sar-lic">{test.licence}</p>
              {saved === "saving" && <p className="sar-save">Saving to your check-ins…</p>}
              {saved === "err" && <p className="sar-save err">Couldn&apos;t save this result to your check-ins. <button type="button" onClick={save}>Try again</button></p>}
              {saved === "ok" && <p className="sar-save ok">✓ Saved privately to your account — <Link href="/client/check-ins">see all your check-ins</Link></p>}
            </div>

            <SuggestedTherapists keywords={test.keywords} label={test.match} />

            <p className="sar-note">A self-check is a screening tool, not a diagnosis. Only a qualified mental-health professional can diagnose.</p>
            <div className="saf-nav">
              <Link href="/view-all-therapist" className="saf-btn solid">Talk to a psychologist</Link>
              <button type="button" className="saf-btn ghost" onClick={onBack}>Back to all checks</button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const isAnswered = answers[current] !== undefined;
  const answeredCount = Object.keys(answers).length;
  const isLast = current === total - 1;

  return (
    <section className="saf" style={{ "--c": test.color }}>
      <style dangerouslySetInnerHTML={{ __html: SAF_CSS }} />
      <div className="saf-in">
        <div className="saf-top">
          <button type="button" className="saf-back" onClick={onBack} aria-label="Back to all checks"><ArrowBackIcon /></button>
          <div className="saf-tt">
            <b>{test.full}</b>
            <span>Question {current + 1} of {total} · {answeredCount} answered</span>
          </div>
        </div>
        <div className="saf-prog" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={current + 1}>
          <i style={{ width: `${progress}%` }} />
        </div>

        <div className="saf-card" ref={cardRef}>
          <p className="saf-frame">{test.intro}</p>
          <h2 className="saf-q" key={current}>{questionText(test, current)}</h2>
          <div className="saf-opts" role="radiogroup" aria-label="Your answer">
            {options.map((o) => {
              const on = answers[current] === o.value;
              return (
                <button key={o.label} type="button" role="radio" aria-checked={on} className={`saf-opt${on ? " on" : ""}`} onClick={() => choose(o.value)}>
                  <span className="saf-dot" aria-hidden="true" />
                  <span className="saf-lbl">{o.label}</span>
                </button>
              );
            })}
          </div>

          <div className="saf-nav">
            <button type="button" className="saf-btn ghost" onClick={() => { clearTimeout(advanceRef.current); setCurrent((q) => Math.max(0, q - 1)); }} disabled={current === 0}>← Previous</button>
            {(isLast || isAnswered) && (
              <button type="button" className="saf-btn solid" onClick={isLast ? submit : () => setCurrent(current + 1)} disabled={!isAnswered || sending || (isLast && answeredCount < total)}>
                {isLast ? (clinical ? (sending ? "Submitting…" : `Submit to ${clinical.therapist.split(" ").slice(0, 2).join(" ")}`) : "See my result") : "Next →"}
              </button>
            )}
          </div>
          {sendErr && <p className="saf-miss">{sendErr}</p>}
          {isLast && answeredCount < total && <p className="saf-miss">Please answer every question to see your result — tap Previous to go back.</p>}
        </div>

        <p className="saf-priv">{clinical ? `Answer honestly — there are no right or wrong answers. Your answers are shared only with ${clinical.therapist}.` : "🔒 Answer honestly — there are no right or wrong answers. Only your score is saved, never your answers."}</p>
        <p className="saf-src">{test.short} · {test.by}</p>
      </div>
    </section>
  );
}

const SAF_CSS = `
.saf { background: #f4f7f5; padding: 26px 0 48px; }
.saf-in { max-width: 760px; margin: 0 auto; padding: 0 16px; }
.saf-in.wide { max-width: 980px; }
.saf-top { display: flex; align-items: center; gap: 12px; }
.saf-back { width: 40px; height: 40px; border-radius: 12px; border: 1px solid #e2e8f0; background: #fff; color: #334155; display: grid; place-items: center; cursor: pointer; flex-shrink: 0; }
.saf-back:hover { border-color: var(--c); color: var(--c); }
.saf-tt { min-width: 0; }
.saf-tt b { display: block; font-size: 16px; color: #0f172a; line-height: 1.3; }
.saf-tt span { display: block; font-size: 12.5px; color: #64748b; font-weight: 600; margin-top: 1px; }
.saf-prog { height: 8px; border-radius: 8px; background: #e2e8f0; overflow: hidden; margin: 14px 0 16px; }
.saf-prog i { display: block; height: 100%; border-radius: 8px; background: var(--c); transition: width .3s ease; }
.saf-card { background: #fff; border: 1px solid #e5ebe7; border-radius: 18px; padding: 22px; box-shadow: 0 10px 30px -22px rgba(15,23,42,.35); scroll-margin-top: 80px; }
.saf-frame { margin: 0 0 8px; font-size: 13px; color: #64748b; font-weight: 600; line-height: 1.5; }
.saf-q { margin: 0 0 18px; font-size: clamp(18px, 2.4vw, 22px); font-weight: 800; color: #0f172a; line-height: 1.4; font-family: inherit; animation: safIn .25s ease; }
@keyframes safIn { from { opacity: 0; transform: translateX(10px); } to { opacity: 1; transform: none; } }
.saf-opts { display: flex; flex-direction: column; gap: 10px; }
.saf-opt { display: flex; align-items: center; gap: 12px; width: 100%; min-height: 54px; padding: 12px 16px; border-radius: 14px; border: 1.5px solid #e2e8f0; background: #fff; text-align: left; cursor: pointer; font-family: inherit; transition: border-color .15s, background .15s, transform .1s; }
.saf-opt:hover { border-color: var(--c); background: #fafcfb; }
.saf-opt:active { transform: scale(.99); }
.saf-dot { width: 22px; height: 22px; border-radius: 50%; border: 2px solid #cbd5e1; flex-shrink: 0; }
.saf-lbl { font-size: 15.5px; font-weight: 700; color: #1e293b; line-height: 1.35; }
.saf-opt.on { border-color: var(--c); background: color-mix(in srgb, var(--c) 8%, #fff); }
.saf-opt.on .saf-dot { border-color: var(--c); background: var(--c); box-shadow: inset 0 0 0 4px #fff; }
.saf-nav { display: flex; gap: 10px; margin-top: 20px; }
.saf-btn { flex: 1; height: 48px; border-radius: 12px; font-size: 15px; font-weight: 800; cursor: pointer; font-family: inherit; border: 1.5px solid transparent; display: inline-flex; align-items: center; justify-content: center; text-decoration: none !important; }
.saf-btn.ghost { background: #fff; border-color: #d5e3da; color: #166534 !important; }
.saf-btn.solid { background: var(--c); color: #fff !important; }
.saf-btn:disabled { opacity: .45; cursor: not-allowed; }
.saf-miss { margin: 10px 0 0; font-size: 12.5px; color: #b45309; font-weight: 600; }
.saf-priv { margin: 14px 0 0; text-align: center; font-size: 12.5px; color: #64748b; }
.saf-src { margin: 4px 0 0; text-align: center; font-size: 11.5px; color: #94a3b8; }
.sar { background: #fff; border: 1px solid #e5ebe7; border-radius: 18px; padding: 24px; box-shadow: 0 10px 30px -22px rgba(15,23,42,.35); }
.sar-kick { font-size: 12px; font-weight: 800; letter-spacing: .4px; text-transform: uppercase; color: #64748b; }
.sar-level { margin-top: 10px; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 16px 18px; border-radius: 14px; background: color-mix(in srgb, var(--lc) 10%, #fff); border: 1.5px solid color-mix(in srgb, var(--lc) 45%, #fff); }
.sar-level b { font-size: clamp(20px, 2.6vw, 26px); font-weight: 800; color: var(--lc); }
.sar-level span { font-size: 14px; color: #475569; } .sar-level strong { font-size: 24px; color: #0f172a; }
.sar-text { margin: 12px 0 0; font-size: 15px; line-height: 1.65; color: #334155; }
.sar-bars { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 16px; }
.sar-bar { border: 1px solid #e8eeea; border-radius: 12px; padding: 12px; }
.sar-bar-h { display: flex; justify-content: space-between; gap: 8px; font-size: 13.5px; } .sar-bar-h span { font-weight: 800; white-space: nowrap; }
.sar-bar i { display: block; height: 8px; border-radius: 8px; background: #eef2f0; margin-top: 8px; overflow: hidden; }
.sar-bar em { display: block; height: 100%; border-radius: 8px; }
.sar-bar p { margin: 6px 0 0; font-size: 12px; color: #64748b; line-height: 1.45; }
.sar-alert { margin-top: 14px; background: #fef2f2; border: 1.5px solid #fecaca; border-radius: 12px; padding: 14px; display: flex; flex-direction: column; gap: 4px; }
.sar-alert b { color: #b91c1c; font-size: 15px; } .sar-alert span { color: #7f1d1d; font-size: 13.5px; line-height: 1.55; }
.sar-alert a { color: #b91c1c !important; font-weight: 800; }
.sar-ref { margin: 16px 0; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 14px; }
.sar-ref b { font-size: 13px; color: #0f172a; }
.sar-ref p { margin: 4px 0 0; font-size: 12.5px; color: #475569; line-height: 1.55; }
.sar-ref .sar-lic { color: #64748b; font-style: italic; }
.sar-save { font-weight: 700; } .sar-ref .sar-save.ok { color: #166534; } .sar-ref .sar-save.err { color: #b91c1c; }
.sar-save a, .sar-save button { color: #166534 !important; font-weight: 800; text-decoration: underline; border: 0; background: none; padding: 0; cursor: pointer; font: inherit; }
.sar-note { margin: 4px 0 0; text-align: center; font-size: 12.5px; color: #64748b; }
@media (max-width: 560px) {
  .saf { padding: 16px 0 32px; }
  .saf-card, .sar { padding: 16px; border-radius: 16px; }
  .saf-opt { min-height: 50px; padding: 10px 14px; }
  .saf-lbl { font-size: 15px; }
  .sar-bars { grid-template-columns: 1fr; }
  .sar .saf-nav { flex-direction: column; }
}
`;
