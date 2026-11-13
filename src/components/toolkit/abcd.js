import React, { useState } from "react";

/* The ABCD thought log (CBT) — written in our own words, filled one step at a time instead of a long form.
   Used by: the client's worksheet page (fill + autosave), the therapist Toolkit (try-it preview, review answers)
   and the public /worksheet/<code> page (the "how it works" steps). */

export const STEPS = [
  {
    k: "a", letter: "A", name: "What happened?", color: "#2563eb", soft: "#eaf1ff",
    help: "Describe the moment like a camera would see it — just the facts, not what you think about it.",
    example: "My manager didn't reply to my message the whole day.",
  },
  {
    k: "b", letter: "B", name: "What went through your mind?", color: "#7c3aed", soft: "#f2ecff",
    help: "The thoughts that popped up. Write them exactly as they sounded in your head.",
    example: "She's upset with me. I must have done something wrong. I'm going to lose this job.",
  },
  {
    k: "c", letter: "C", name: "How did you feel and what did you do?", color: "#ea580c", soft: "#fff1e8",
    help: "The feelings that came with those thoughts, how strong they were, and what you did next.",
    example: "Anxious (80), couldn't focus, checked my phone again and again, skipped lunch.",
  },
  {
    k: "d", letter: "D", name: "Is there another way to see it?", color: "#16a34a", soft: "#e9f8ef",
    help: "Question the thought gently — like a kind friend would — and find a more balanced one.",
    example: "She had back-to-back meetings. One quiet day doesn't mean I'm in trouble. If something is wrong, I'll ask her tomorrow.",
  },
];

export const TRAPS = [
  ["all-or-nothing", "All-or-nothing", "Seeing it as total success or total failure"],
  ["mind-reading", "Mind reading", "Assuming you know what others think"],
  ["fortune-telling", "Fortune telling", "Predicting it will go badly"],
  ["catastrophising", "Catastrophising", "Jumping to the worst possible outcome"],
  ["should", "Should / must", "Strict rules for yourself or others"],
  ["labelling", "Labelling", "“I'm useless”, “They're selfish”"],
  ["personalising", "Personalising", "Blaming yourself for things outside your control"],
  ["overgeneralising", "Overgeneralising", "“This always happens to me”"],
  ["filtering", "Only the negative", "Ignoring the good, zooming in on the bad"],
  ["emotional-reasoning", "Feelings as facts", "“I feel it, so it must be true”"],
];
export const TRAP_LABEL = Object.fromEntries(TRAPS.map(([k, l]) => [k, l]));
export const FEELINGS = ["Anxious", "Sad", "Angry", "Guilty", "Ashamed", "Hurt", "Frustrated", "Lonely", "Scared", "Embarrassed", "Hopeless", "Jealous"];

// same words the server watches for — the client gets Tele-MANAS at once, the therapist an alert when it's sent
export const CRISIS = /suicid|kill (my ?self|me)|end (my|this) life|want to die|wanna die|self[- ]?harm|hurt myself|cut myself|no reason to live|marna (chahta|chahti|hai)|khud ko (khatam|maar)|jeena nahi|zindagi khatam/i;

export const emptyData = () => ({ a: { what: "", when: "" }, b: { thought: "", traps: [], strength: 70 }, c: { feelings: [], body: "", did: "" }, d: { evidenceFor: "", evidenceAgainst: "", friend: "", balanced: "", strengthAfter: null, feelAfter: null, next: "" } });
export const withDefaults = (d) => {
  const e = emptyData();
  return { a: { ...e.a, ...(d?.a || {}) }, b: { ...e.b, ...(d?.b || {}) }, c: { ...e.c, ...(d?.c || {}) }, d: { ...e.d, ...(d?.d || {}) } };
};

function Slider({ label, value, onChange, color, low = "Not at all", high = "Completely" }) {
  const v = value == null ? 50 : value;
  return (
    <label className="ab-sl" style={{ "--c": color }}>
      <span className="ab-sl-t">{label} <b>{value == null ? "—" : `${v}%`}</b></span>
      <input type="range" min="0" max="100" step="5" value={v} onChange={(e) => onChange(Number(e.target.value))} style={{ "--p": `${v}%` }} />
      <span className="ab-sl-x"><i>{low}</i><i>{high}</i></span>
    </label>
  );
}

/* the step-by-step form. onChange(data, step) fires on every edit (the page autosaves). */
export function AbcdForm({ value, step, onChange, onStep, therapistName, readOnly = false, finish }) {
  const d = withDefaults(value);
  const [ex, setEx] = useState(false);
  const set = (part, patch) => onChange({ ...d, [part]: { ...d[part], ...patch } });
  const s = STEPS[Math.min(step, 3)];
  const crisis = CRISIS.test(JSON.stringify(d));
  const go = (n) => { setEx(false); onStep(Math.max(0, Math.min(4, n))); if (typeof window !== "undefined") document.querySelector(".ab")?.scrollIntoView({ behavior: "smooth", block: "start" }); };
  const feel = (k) => d.c.feelings.find((f) => f.k === k);
  const toggleFeel = (k) => set("c", { feelings: feel(k) ? d.c.feelings.filter((f) => f.k !== k) : [...d.c.feelings, { k, v: 60 }] });
  const toggleTrap = (k) => set("b", { traps: d.b.traps.includes(k) ? d.b.traps.filter((x) => x !== k) : [...d.b.traps, k] });

  return (
    <div className="ab">
      <style>{AB_CSS}</style>
      <ol className="ab-prog" aria-label="Steps">
        {STEPS.map((x, i) => (
          <li key={x.k} className={i === step ? "on" : i < step ? "done" : ""} style={{ "--c": x.color }}>
            <button type="button" onClick={() => go(i)} aria-current={i === step ? "step" : undefined}><b>{x.letter}</b><span>{x.name.replace("?", "")}</span></button>
          </li>
        ))}
        <li className={step === 4 ? "on" : ""} style={{ "--c": "#14532d" }}><button type="button" onClick={() => go(4)}><b>✓</b><span>Review</span></button></li>
      </ol>

      {crisis && (
        <div className="ab-sos" role="alert">
          <b>You don&apos;t have to carry this alone.</b> If you&apos;re thinking about hurting yourself, please call <a href="tel:14416">Tele-MANAS 14416</a> (free, 24×7) or someone you trust right now.
        </div>
      )}

      {step < 4 ? (
        <section className="ab-card" style={{ "--c": s.color, "--soft": s.soft }}>
          <div className="ab-h">
            <span className="ab-l">{s.letter}</span>
            <div><h3>{s.name}</h3><p>{s.help}</p></div>
          </div>
          <button type="button" className="ab-ex-b" onClick={() => setEx((o) => !o)} aria-expanded={ex}>{ex ? "Hide example" : "See an example"}</button>
          {ex && <p className="ab-ex">“{s.example}”</p>}

          {s.k === "a" && (
            <>
              <textarea rows={4} maxLength={1000} disabled={readOnly} value={d.a.what} onChange={(e) => set("a", { what: e.target.value })} placeholder="What happened? Who was there, what was said or done…" />
              <input type="text" maxLength={80} disabled={readOnly} value={d.a.when} onChange={(e) => set("a", { when: e.target.value })} placeholder="When / where? (optional) — e.g. Monday, at office" />
            </>
          )}
          {s.k === "b" && (
            <>
              <textarea rows={4} maxLength={1000} disabled={readOnly} value={d.b.thought} onChange={(e) => set("b", { thought: e.target.value })} placeholder="The thoughts in your head at that moment…" />
              <div className="ab-sub">Any of these thinking traps? <small>(tap all that fit)</small></div>
              <div className="ab-chips">
                {TRAPS.map(([k, l, hint]) => (
                  <button key={k} type="button" disabled={readOnly} className={d.b.traps.includes(k) ? "on" : ""} onClick={() => toggleTrap(k)} title={hint}>
                    <b>{l}</b><small>{hint}</small>
                  </button>
                ))}
              </div>
              <Slider label="How much do you believe this thought?" value={d.b.strength} onChange={(v) => set("b", { strength: v })} color={s.color} />
            </>
          )}
          {s.k === "c" && (
            <>
              <div className="ab-sub">What did you feel? <small>(tap all that fit, then set how strong)</small></div>
              <div className="ab-chips feel">
                {FEELINGS.map((k) => <button key={k} type="button" disabled={readOnly} className={feel(k) ? "on" : ""} onClick={() => toggleFeel(k)}>{k}</button>)}
              </div>
              {d.c.feelings.map((f) => (
                <Slider key={f.k} label={f.k} value={f.v} low="A little" high="Very strong" color={s.color}
                  onChange={(v) => set("c", { feelings: d.c.feelings.map((x) => (x.k === f.k ? { ...x, v } : x)) })} />
              ))}
              <textarea rows={2} maxLength={400} disabled={readOnly} value={d.c.body} onChange={(e) => set("c", { body: e.target.value })} placeholder="In your body? (optional) — racing heart, tight chest, tired…" />
              <textarea rows={3} maxLength={1000} disabled={readOnly} value={d.c.did} onChange={(e) => set("c", { did: e.target.value })} placeholder="What did you do next? — e.g. stayed quiet, snapped at someone, couldn't sleep…" />
            </>
          )}
          {s.k === "d" && (
            <>
              <label className="ab-q"><span>What supports this thought?</span>
                <textarea rows={2} maxLength={1000} disabled={readOnly} value={d.d.evidenceFor} onChange={(e) => set("d", { evidenceFor: e.target.value })} placeholder="Facts only — not feelings" /></label>
              <label className="ab-q"><span>What doesn&apos;t fit this thought?</span>
                <textarea rows={2} maxLength={1000} disabled={readOnly} value={d.d.evidenceAgainst} onChange={(e) => set("d", { evidenceAgainst: e.target.value })} placeholder="Anything that shows it may not be fully true" /></label>
              <label className="ab-q"><span>What would you tell a close friend who thought this?</span>
                <textarea rows={2} maxLength={1000} disabled={readOnly} value={d.d.friend} onChange={(e) => set("d", { friend: e.target.value })} /></label>
              <label className="ab-q strong"><span>A more balanced thought</span>
                <textarea rows={3} maxLength={1000} disabled={readOnly} value={d.d.balanced} onChange={(e) => set("d", { balanced: e.target.value })} placeholder="Something true and kinder you can tell yourself instead" /></label>
              <Slider label="Now, how much do you believe the first thought?" value={d.d.strengthAfter} onChange={(v) => set("d", { strengthAfter: v })} color={s.color} />
              <Slider label="And how strong is the feeling now?" value={d.d.feelAfter} onChange={(v) => set("d", { feelAfter: v })} color={s.color} low="Gone" high="Same as before" />
              <input type="text" maxLength={400} disabled={readOnly} value={d.d.next} onChange={(e) => set("d", { next: e.target.value })} placeholder="One small next step (optional) — e.g. ask her tomorrow morning" />
            </>
          )}

          <div className="ab-nav">
            {step > 0 ? <button type="button" className="ab-btn line" onClick={() => go(step - 1)}>← Back</button> : <span />}
            <button type="button" className="ab-btn" onClick={() => go(step + 1)}>{step === 3 ? "Review" : `Next: ${STEPS[step + 1].letter}`} →</button>
          </div>
        </section>
      ) : (
        <section className="ab-card" style={{ "--c": "#14532d", "--soft": "#eef7f1" }}>
          <div className="ab-h"><span className="ab-l">✓</span><div><h3>Your ABCD at a glance</h3><p>{therapistName ? `Check it, then send it to ${therapistName} — you'll talk it through together.` : "Check it over. You can come back and change it any time."}</p></div></div>
          <AbcdView data={d} />
          {finish}
          <div className="ab-nav"><button type="button" className="ab-btn line" onClick={() => go(3)}>← Back</button><span /></div>
        </section>
      )}
    </div>
  );
}

/* read-only answers (review step, the therapist's view) */
export function AbcdView({ data }) {
  const d = withDefaults(data);
  const row = (s, body) => (
    <div className="ab-v" style={{ "--c": s.color, "--soft": s.soft }} key={s.k}>
      <span className="ab-l sm">{s.letter}</span>
      <div><b>{s.name}</b>{body}</div>
    </div>
  );
  const p = (t) => (t ? <p>{t}</p> : <p className="ab-mut">—</p>);
  return (
    <div className="ab-vw">
      <style>{AB_CSS}</style>
      {row(STEPS[0], <>{p(d.a.what)}{d.a.when && <small>{d.a.when}</small>}</>)}
      {row(STEPS[1], <>{p(d.b.thought)}{d.b.traps.length > 0 && <div className="ab-tags">{d.b.traps.map((k) => <i key={k}>{TRAP_LABEL[k] || k}</i>)}</div>}{d.b.strength != null && <small>Believed it: {d.b.strength}%</small>}</>)}
      {row(STEPS[2], <>{d.c.feelings.length > 0 && <div className="ab-tags">{d.c.feelings.map((f) => <i key={f.k}>{f.k} {f.v}%</i>)}</div>}{d.c.body && <p>Body: {d.c.body}</p>}{p(d.c.did)}</>)}
      {row(STEPS[3], <>
        {d.d.evidenceFor && <p><small>Supports it:</small> {d.d.evidenceFor}</p>}
        {d.d.evidenceAgainst && <p><small>Doesn&apos;t fit:</small> {d.d.evidenceAgainst}</p>}
        {d.d.friend && <p><small>To a friend:</small> {d.d.friend}</p>}
        <p className="ab-bal">{d.d.balanced || "—"}</p>
        {(d.d.strengthAfter != null || d.d.feelAfter != null) && <small>After: believes it {d.d.strengthAfter ?? "—"}% · feeling {d.d.feelAfter ?? "—"}%{d.b.strength != null && d.d.strengthAfter != null ? ` (was ${d.b.strength}%)` : ""}</small>}
        {d.d.next && <p><small>Next step:</small> {d.d.next}</p>}
      </>)}
    </div>
  );
}

export const AB_CSS = `
.ab { --ink: #0f1f17; --mut: #64748b; color: var(--ink); }
.ab-prog { list-style: none; margin: 0 0 14px; padding: 0; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 6px; }
.ab-prog button { width: 100%; display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 12px; border: 1.5px solid #e3e9e5; background: #fff; font: inherit; cursor: pointer; text-align: left; min-width: 0; }
.ab-prog b { flex: none; width: 26px; height: 26px; border-radius: 8px; display: grid; place-items: center; font-size: 13px; font-weight: 900; background: #f1f5f3; color: var(--c); }
.ab-prog span { font-size: 12px; font-weight: 700; color: var(--mut); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ab-prog li.on button { border-color: var(--c); box-shadow: 0 6px 16px -10px var(--c); }
.ab-prog li.on b { background: var(--c); color: #fff; }
.ab-prog li.on span { color: var(--ink); }
.ab-prog li.done b { background: var(--c); color: #fff; opacity: .55; }
.ab-sos { margin: 0 0 12px; padding: 12px 14px; border-radius: 14px; background: #fff1f2; border: 1px solid #fecdd3; color: #881337; font-size: 14px; line-height: 1.5; }
.ab-sos a { color: #be123c; font-weight: 800; }
.ab-card { background: #fff; border: 1px solid #e3e9e5; border-top: 4px solid var(--c); border-radius: 18px; padding: 18px; box-shadow: 0 10px 30px -22px rgba(15,31,23,.45); }
.ab-h { display: flex; gap: 14px; align-items: flex-start; }
.ab-h h3 { margin: 2px 0 4px; font-size: 20px; font-weight: 800; color: var(--ink); line-height: 1.25; }
.ab-h p { margin: 0; font-size: 14.5px; color: #475569; line-height: 1.5; }
.ab-l { flex: none; width: 46px; height: 46px; border-radius: 14px; display: grid; place-items: center; font-size: 22px; font-weight: 900; color: #fff; background: var(--c); box-shadow: 0 8px 18px -8px var(--c); }
.ab-l.sm { width: 34px; height: 34px; border-radius: 10px; font-size: 16px; }
.ab-ex-b { margin: 12px 0 0; padding: 0; border: 0; background: none; font: inherit; font-size: 13px; font-weight: 800; color: var(--c); cursor: pointer; }
.ab-ex { margin: 8px 0 0; padding: 10px 12px; border-radius: 12px; background: var(--soft); font-size: 14px; color: #334155; font-style: italic; }
.ab-card textarea, .ab-card input[type="text"] { display: block; width: 100%; box-sizing: border-box; margin-top: 12px; padding: 12px 14px; border: 1.5px solid #dfe7e2; border-radius: 12px; font: inherit; font-size: 15px; color: var(--ink); background: #fcfdfc; resize: vertical; outline: none; }
.ab-card textarea:focus, .ab-card input[type="text"]:focus { border-color: var(--c); background: #fff; box-shadow: 0 0 0 3px var(--soft); }
.ab-sub { margin: 16px 0 8px; font-size: 14px; font-weight: 800; color: var(--ink); }
.ab-sub small { font-weight: 600; color: var(--mut); }
.ab-chips { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 8px; }
.ab-chips button { display: flex; flex-direction: column; align-items: flex-start; gap: 1px; padding: 9px 12px; border-radius: 12px; border: 1.5px solid #e3e9e5; background: #fff; font: inherit; text-align: left; cursor: pointer; }
.ab-chips button b { font-size: 13.5px; color: var(--ink); }
.ab-chips button small { font-size: 11.5px; color: var(--mut); line-height: 1.35; }
.ab-chips button.on { border-color: var(--c); background: var(--soft); }
.ab-chips.feel { display: flex; flex-wrap: wrap; }
.ab-chips.feel button { flex-direction: row; padding: 8px 14px; border-radius: 999px; font-size: 14px; font-weight: 700; color: #334155; }
.ab-chips.feel button.on { color: var(--c); }
.ab-sl { display: block; margin-top: 14px; }
.ab-sl-t { display: flex; justify-content: space-between; gap: 10px; font-size: 13.5px; font-weight: 700; color: #334155; }
.ab-sl-t b { color: var(--c); }
.ab-sl input { width: 100%; margin: 8px 0 2px; -webkit-appearance: none; appearance: none; height: 8px; border-radius: 999px; background: linear-gradient(90deg, var(--c) var(--p), #e5ebe7 var(--p)); outline: none; }
.ab-sl input::-webkit-slider-thumb { -webkit-appearance: none; width: 24px; height: 24px; border-radius: 50%; background: #fff; border: 3px solid var(--c); box-shadow: 0 2px 6px rgba(0,0,0,.18); cursor: pointer; }
.ab-sl input::-moz-range-thumb { width: 20px; height: 20px; border-radius: 50%; background: #fff; border: 3px solid var(--c); cursor: pointer; }
.ab-sl-x { display: flex; justify-content: space-between; font-size: 11px; color: var(--mut); }
.ab-sl-x i { font-style: normal; }
.ab-q { display: block; margin-top: 14px; }
.ab-q > span { display: block; font-size: 14px; font-weight: 800; color: var(--ink); }
.ab-q textarea { margin-top: 6px !important; }
.ab-q.strong > span { color: var(--c); }
.ab-q.strong textarea { border-color: var(--c); background: var(--soft); }
.ab-nav { display: flex; justify-content: space-between; gap: 10px; margin-top: 18px; }
.ab-btn { height: 46px; padding: 0 20px; border-radius: 12px; border: 0; background: var(--c); color: #fff; font: inherit; font-size: 15px; font-weight: 800; cursor: pointer; }
.ab-btn.line { background: #fff; color: #334155; border: 1.5px solid #dfe7e2; }
.ab-btn:disabled { opacity: .55; cursor: default; }
.ab-vw { display: flex; flex-direction: column; gap: 10px; margin-top: 14px; }
.ab-v { display: grid; grid-template-columns: 34px minmax(0, 1fr); gap: 12px; padding: 12px; border-radius: 14px; background: var(--soft); }
.ab-v b { display: block; font-size: 13px; color: var(--c); margin-bottom: 2px; }
.ab-v p { margin: 4px 0 0; font-size: 14.5px; color: #1e293b; line-height: 1.5; white-space: pre-wrap; overflow-wrap: anywhere; }
.ab-v small { display: inline-block; margin-top: 4px; font-size: 12px; color: var(--mut); font-weight: 700; }
.ab-v p small { margin: 0 4px 0 0; }
.ab-mut { color: #94a3b8 !important; }
.ab-bal { font-weight: 700; color: #14532d !important; }
.ab-tags { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 6px; }
.ab-tags i { font-style: normal; font-size: 12px; font-weight: 700; background: #fff; color: var(--c); border-radius: 999px; padding: 3px 9px; }
@media (max-width: 760px) {
  .ab-prog { grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 4px; }
  .ab-prog button { flex-direction: column; gap: 3px; padding: 7px 2px; text-align: center; }
  .ab-prog span { font-size: 10.5px; max-width: 100%; }
  .ab-card { padding: 14px; border-radius: 16px; }
  .ab-h h3 { font-size: 18px; }
  .ab-l { width: 40px; height: 40px; font-size: 19px; border-radius: 12px; }
  .ab-chips { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
  .ab-chips button small { display: none; }
}
`;
