import React, { useState } from "react";

/* What-If Flip (anxiety) — our own worksheet. Step 1: the what-if and how strong the worry is.
   Step 2: flip cards — for each feared outcome, an equally likely good one, and (optional) the most likely one.
   Step 3: "if it did happen, I could…", the worry re-rated, and a summary. */

export const emptyWhatIf = () => ({ worry: "", before: 70, pairs: [{ bad: "", good: "", likely: "" }], cope: "", after: null });
export const withWhatIf = (v) => {
  const e = emptyWhatIf();
  const pairs = Array.isArray(v?.pairs) && v.pairs.length ? v.pairs.map((p) => ({ bad: p?.bad || "", good: p?.good || "", likely: p?.likely || "" })) : e.pairs;
  return { ...e, ...(v || {}), pairs };
};
const MAX = 8;
const STEPS = [["?", "The what-if", "#7c3aed"], ["⇅", "Flip it", "#e11d48"], ["✓", "Settle it", "#0ea5e9"]];
const EX = [
  { bad: "I'll forget everything in the interview and they'll think I'm useless.", good: "I'll remember most of what I prepared and they'll like how I think.", likely: "I'll stumble on one question, answer the rest well, and it'll be fine." },
  { bad: "My friend is angry with me — that's why she hasn't replied.", good: "She's busy today and will reply tonight with a funny story.", likely: "She saw it, got caught up, and will reply when she's free." },
];

function Meter({ label, value, onChange, disabled, low = "Calm", high = "Very worried" }) {
  const v = value == null ? 50 : value;
  return (
    <label className="wf-m">
      <span>{label} <b>{value == null ? "—" : `${v}%`}</b></span>
      <input type="range" min="0" max="100" step="5" disabled={disabled} value={v} onChange={(e) => onChange(Number(e.target.value))} style={{ "--p": `${v}%` }} />
      <span className="wf-m-x"><i>{low}</i><i>{high}</i></span>
    </label>
  );
}

export function WhatIfForm({ value, step, onChange, onStep, readOnly = false, finish }) {
  const d = withWhatIf(value);
  const [ex, setEx] = useState(false);
  const set = (patch) => onChange({ ...d, ...patch });
  const setPair = (i, patch) => set({ pairs: d.pairs.map((p, k) => (k === i ? { ...p, ...patch } : p)) });
  const go = (n) => { onStep(Math.max(0, Math.min(2, n))); if (typeof window !== "undefined") document.querySelector(".wf")?.scrollIntoView({ behavior: "smooth", block: "start" }); };
  const s = Math.min(step, 2);
  return (
    <div className="wf">
      <style>{WF_CSS}</style>
      <ol className="wf-prog">
        {STEPS.map(([l, n, c], i) => (
          <li key={n} className={i === s ? "on" : i < s ? "done" : ""} style={{ "--c": c }}>
            <button type="button" onClick={() => go(i)}><b>{l}</b><span>{n}</span></button>
          </li>
        ))}
      </ol>

      {s === 0 && (
        <section className="wf-card" style={{ "--c": "#7c3aed" }}>
          <h3>What&apos;s the &ldquo;what if&rdquo; on your mind?</h3>
          <p className="wf-help">Write it just as it sounds in your head — it usually starts with &ldquo;What if…&rdquo;.</p>
          <div className="wf-q">
            <span aria-hidden="true">What if…</span>
            <textarea rows={3} maxLength={500} disabled={readOnly} value={d.worry} onChange={(e) => set({ worry: e.target.value })} placeholder="…I fail the exam and everyone finds out?" />
          </div>
          <Meter label="Right now, how worried do you feel?" value={d.before} onChange={(v) => set({ before: v })} disabled={readOnly} />
          <div className="wf-nav"><span /><button type="button" className="wf-btn" onClick={() => go(1)}>Next: flip it →</button></div>
        </section>
      )}

      {s === 1 && (
        <section className="wf-card" style={{ "--c": "#e11d48" }}>
          <h3>Flip each fear</h3>
          <p className="wf-help">For every bad outcome your mind shows you, there&apos;s a good one that is <b>just as likely</b>. Then write what will <b>most probably</b> happen.</p>
          <button type="button" className="wf-ex-b" onClick={() => setEx((o) => !o)} aria-expanded={ex}>{ex ? "Hide examples" : "See examples"}</button>
          {ex && (
            <div className="wf-exs">
              {EX.map((x) => <div key={x.bad} className="wf-exr"><p className="bad">↓ {x.bad}</p><p className="good">↑ {x.good}</p><p className="lik">✓ {x.likely}</p></div>)}
            </div>
          )}
          <div className="wf-pairs">
            {d.pairs.map((p, i) => (
              <div key={i} className="wf-pair">
                <div className="wf-pair-h"><b>Flip {i + 1}</b>{d.pairs.length > 1 && !readOnly && <button type="button" onClick={() => set({ pairs: d.pairs.filter((_, k) => k !== i) })}>Remove</button>}</div>
                <div className="wf-two">
                  <label className="wf-side bad"><span>↓ The fear</span>
                    <textarea rows={3} maxLength={500} disabled={readOnly} value={p.bad} onChange={(e) => setPair(i, { bad: e.target.value })} placeholder="The bad outcome I'm afraid of…" />
                  </label>
                  <span className="wf-arrow" aria-hidden="true">⇄</span>
                  <label className="wf-side good"><span>↑ Just as likely</span>
                    <textarea rows={3} maxLength={500} disabled={readOnly} value={p.good} onChange={(e) => setPair(i, { good: e.target.value })} placeholder="A good outcome that could happen instead…" />
                  </label>
                </div>
                <label className="wf-side lik"><span>✓ Most likely (optional)</span>
                  <input type="text" maxLength={500} disabled={readOnly} value={p.likely} onChange={(e) => setPair(i, { likely: e.target.value })} placeholder="What will probably happen — often somewhere in the middle" />
                </label>
              </div>
            ))}
          </div>
          {!readOnly && d.pairs.length < MAX && <button type="button" className="wf-add" onClick={() => set({ pairs: [...d.pairs, { bad: "", good: "", likely: "" }] })}>+ Flip another fear</button>}
          <div className="wf-nav"><button type="button" className="wf-btn line" onClick={() => go(0)}>← Back</button><button type="button" className="wf-btn" onClick={() => go(2)}>Next: settle it →</button></div>
        </section>
      )}

      {s === 2 && (
        <section className="wf-card" style={{ "--c": "#0ea5e9" }}>
          <h3>Settle it</h3>
          <label className="wf-lbl"><span>Even if the hard thing did happen, I could cope by…</span>
            <textarea rows={3} maxLength={800} disabled={readOnly} value={d.cope} onChange={(e) => set({ cope: e.target.value })} placeholder="e.g. talking to my sister, asking for another chance, remembering I've handled hard days before" />
          </label>
          <Meter label="Now, how worried do you feel?" value={d.after} onChange={(v) => set({ after: v })} disabled={readOnly} />
          {d.after != null && d.before != null && d.after < d.before && <p className="wf-win">🌿 Your worry came down from {d.before}% to {d.after}%. That&apos;s your mind seeing the whole picture again.</p>}
          <h4 className="wf-sumh">Your flip at a glance</h4>
          <WhatIfView data={d} />
          {finish}
          <div className="wf-nav"><button type="button" className="wf-btn line" onClick={() => go(1)}>← Back</button><span /></div>
        </section>
      )}
    </div>
  );
}

/* read-only summary (review step + therapist) */
export function WhatIfView({ data }) {
  const d = withWhatIf(data);
  const pairs = d.pairs.filter((p) => p.bad || p.good || p.likely);
  return (
    <div className="wf-v">
      <style>{WF_CSS}</style>
      <p className="wf-v-q"><span>What if…</span> {d.worry || <i>—</i>}</p>
      {pairs.map((p, i) => (
        <div key={i} className="wf-v-p">
          <p className="bad">↓ {p.bad || "—"}</p>
          <p className="good">↑ {p.good || "—"}</p>
          {p.likely && <p className="lik">✓ {p.likely}</p>}
        </div>
      ))}
      {d.cope && <p className="wf-v-c"><b>I could cope by:</b> {d.cope}</p>}
      <p className="wf-v-r">Worry: {d.before ?? "—"}% → {d.after ?? "—"}%</p>
    </div>
  );
}

export const WF_CSS = `
.wf { color: #0f1f17; }
.wf-prog { list-style: none; margin: 0 0 14px; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
.wf-prog button { width: 100%; display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 12px; border: 1.5px solid #e3e9e5; background: #fff; font: inherit; cursor: pointer; }
.wf-prog b { flex: none; width: 26px; height: 26px; border-radius: 8px; display: grid; place-items: center; font-weight: 900; background: #f1f5f3; color: var(--c); }
.wf-prog span { font-size: 12.5px; font-weight: 700; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.wf-prog li.on button { border-color: var(--c); }
.wf-prog li.on b, .wf-prog li.done b { background: var(--c); color: #fff; }
.wf-prog li.done b { opacity: .55; }
.wf-prog li.on span { color: #0f1f17; }
.wf-card { background: #fff; border: 1px solid #e3e9e5; border-top: 4px solid var(--c); border-radius: 18px; padding: 18px; box-shadow: 0 10px 30px -22px rgba(15,31,23,.45); }
.wf-card h3 { margin: 0 0 4px; font-size: 20px; font-weight: 800; }
.wf-help { margin: 0; font-size: 14.5px; color: #475569; line-height: 1.5; }
.wf-q { margin-top: 14px; border: 1.5px solid #ddd6fe; background: #faf8ff; border-radius: 16px; padding: 12px 14px; }
.wf-q > span { display: block; font-size: 22px; font-weight: 800; color: #7c3aed; font-family: Georgia, "Times New Roman", serif; font-style: italic; }
.wf textarea, .wf input[type="text"] { display: block; width: 100%; box-sizing: border-box; padding: 11px 13px; border: 1.5px solid #dfe7e2; border-radius: 12px; font: inherit; font-size: 15px; background: #fff; resize: vertical; outline: none; color: #0f1f17; }
.wf-q textarea { border: 0; padding: 4px 0 0; background: transparent; font-size: 17px; }
.wf textarea:focus, .wf input[type="text"]:focus { border-color: var(--c); }
.wf-m { display: block; margin-top: 16px; }
.wf-m > span:first-child { display: flex; justify-content: space-between; font-size: 13.5px; font-weight: 700; color: #334155; }
.wf-m b { color: var(--c); }
.wf-m input { width: 100%; margin: 8px 0 2px; -webkit-appearance: none; appearance: none; height: 8px; border-radius: 999px; background: linear-gradient(90deg, var(--c) var(--p), #e5ebe7 var(--p)); }
.wf-m input::-webkit-slider-thumb { -webkit-appearance: none; width: 24px; height: 24px; border-radius: 50%; background: #fff; border: 3px solid var(--c); box-shadow: 0 2px 6px rgba(0,0,0,.18); }
.wf-m-x { display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; } .wf-m-x i { font-style: normal; }
.wf-ex-b { margin-top: 10px; padding: 0; border: 0; background: none; font: inherit; font-size: 13px; font-weight: 800; color: #7c3aed; cursor: pointer; }
.wf-exs { display: grid; gap: 8px; margin-top: 8px; }
.wf-exr { background: #f8fafc; border-radius: 12px; padding: 10px 12px; }
.wf-exr p, .wf-v-p p { margin: 2px 0; font-size: 13.5px; line-height: 1.45; }
.wf .bad { color: #be123c; } .wf .good { color: #15803d; } .wf .lik { color: #0369a1; }
.wf-pairs { display: flex; flex-direction: column; gap: 12px; margin-top: 14px; }
.wf-pair { border: 1px solid #e8eee9; border-radius: 16px; padding: 12px; background: #fcfdfc; }
.wf-pair-h { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.wf-pair-h b { font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: .06em; }
.wf-pair-h button { border: 0; background: none; color: #b91c1c; font: inherit; font-size: 13px; cursor: pointer; }
.wf-two { display: grid; grid-template-columns: minmax(0, 1fr) 28px minmax(0, 1fr); gap: 8px; align-items: center; }
.wf-arrow { display: grid; place-items: center; width: 28px; height: 28px; border-radius: 50%; background: #fff; border: 1px solid #e3e9e5; color: #64748b; font-weight: 900; }
.wf-side { display: block; }
.wf-side > span { display: block; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 5px; }
.wf-side.bad > span { color: #be123c; } .wf-side.good > span { color: #15803d; } .wf-side.lik > span { color: #0369a1; }
.wf-side.bad textarea { background: #fff5f7; border-color: #fecdd3; }
.wf-side.good textarea { background: #f0fdf4; border-color: #bbf7d0; }
.wf-side.lik { margin-top: 10px; }
.wf-side.lik input { background: #f0f9ff; border-color: #bae6fd; }
.wf-add { margin-top: 12px; width: 100%; height: 44px; border-radius: 12px; border: 1.5px dashed #c4b5fd; background: #faf8ff; color: #6d28d9; font: inherit; font-weight: 800; cursor: pointer; }
.wf-lbl { display: block; margin-top: 12px; }
.wf-lbl > span { display: block; font-size: 14px; font-weight: 800; margin-bottom: 6px; }
.wf-win { margin: 12px 0 0; padding: 10px 12px; border-radius: 12px; background: #ecfdf5; color: #065f46; font-weight: 700; font-size: 14px; }
.wf-sumh { margin: 18px 0 8px; font-size: 13px; text-transform: uppercase; letter-spacing: .06em; color: #64748b; }
.wf-nav { display: flex; justify-content: space-between; gap: 10px; margin-top: 18px; }
.wf-btn { height: 46px; padding: 0 20px; border-radius: 12px; border: 0; background: var(--c); color: #fff; font: inherit; font-size: 15px; font-weight: 800; cursor: pointer; }
.wf-btn.line { background: #fff; color: #334155; border: 1.5px solid #dfe7e2; }
.wf-v { display: flex; flex-direction: column; gap: 8px; }
.wf-v-q { margin: 0; padding: 12px 14px; border-radius: 14px; background: #faf8ff; font-size: 15px; color: #1e1b4b; }
.wf-v-q span { font-family: Georgia, serif; font-style: italic; font-weight: 800; color: #7c3aed; }
.wf-v-p { padding: 10px 12px; border-radius: 14px; background: #fff; border: 1px solid #edf1ee; }
.wf-v-p p { white-space: pre-wrap; overflow-wrap: anywhere; }
.wf-v-p .bad { color: #be123c; } .wf-v-p .good { color: #15803d; } .wf-v-p .lik { color: #0369a1; }
.wf-v-c { margin: 0; padding: 10px 12px; border-radius: 14px; background: #f0f9ff; font-size: 14px; }
.wf-v-r { margin: 0; font-size: 13px; font-weight: 800; color: #64748b; }
@media (max-width: 640px) {
  .wf-card { padding: 14px; }
  .wf-card h3 { font-size: 18px; }
  .wf-two { grid-template-columns: minmax(0, 1fr); }
  .wf-arrow { justify-self: center; transform: rotate(90deg); }
  .wf-prog button { flex-direction: column; gap: 3px; padding: 7px 2px; }
}
`;
