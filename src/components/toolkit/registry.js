import React, { useState } from "react";

/* Every Toolkit worksheet in one place: name, why it matters, benefits, who it's for, how long, how it works.
   Shown on the therapist Toolkit, the shared /worksheet/<code> page and at the top of the client's worksheet. */
export const WORKSHEETS = {
  abcd: {
    key: "abcd", name: "ABCD Thought Log", tag: "CBT", ready: true,
    tiles: [["A", "#2563eb"], ["B", "#7c3aed"], ["C", "#ea580c"], ["D", "#16a34a"]],
    short: "Situation → thought → feeling → a balanced thought. For anxiety, low mood, anger and overthinking.",
    headline: "Untangle a stressful moment in 4 small steps",
    why: "How we feel usually comes from the meaning we give a moment — not the moment itself. Writing it down slows things down, so you can see the thought behind the feeling and choose a calmer, more realistic one.",
    benefits: [
      "Catch the exact thought that sets off a strong feeling",
      "Spot thinking traps like mind reading or expecting the worst",
      "Feel less overwhelmed as a balanced thought sinks in",
      "Gives you and your therapist real moments to work on in session",
    ],
    forWho: ["Anxiety & overthinking", "Low mood", "Anger", "Self-criticism"],
    time: "About 10 minutes, soon after a tough moment — 2–3 times a week",
    how: [
      ["A", "What happened?", "Just the facts, like a camera would see it."],
      ["B", "What went through your mind?", "The thoughts, exactly as they sounded."],
      ["C", "How did you feel and what did you do?", "Feelings, how strong, and your reaction."],
      ["D", "Is there another way to see it?", "Question the thought gently and find a balanced one."],
    ],
  },
  activity: {
    key: "activity", name: "Activity Diary", tag: "Behavioural activation", ready: true,
    tiles: [["A", "#0ea5e9"], ["C", "#ec4899"], ["E", "#f59e0b"], ["☺", "#16a34a"]],
    short: "A week of what you did and how it felt — find what lifts your mood and what drains it.",
    headline: "Find out what really lifts your mood",
    why: "When mood is low we tend to do less — and doing less pulls mood down even further. Noting what you do for one week, and how each thing felt, shows clearly which activities lift you, which drain you, and where a small change can make the biggest difference.",
    benefits: [
      "See how your mood moves across the day and the week",
      "Find activities that give you achievement, closeness and enjoyment",
      "Notice draining patterns — long hours in bed, on the phone, alone",
      "Plan small, doable steps that lift mood (what therapists call behavioural activation)",
    ],
    forWho: ["Low mood & depression", "Low energy", "Burnout", "Loneliness"],
    time: "1–2 minutes, a few times a day, for 7 days",
    how: [
      ["1", "Write what you did", "Anything counts — even resting, scrolling or lying in bed."],
      ["2", "Name your mood", "One word, and how strong it was (0–100%)."],
      ["3", "Rate A · C · E", "Achievement, Closeness to others and Enjoyment, each 0–10."],
      ["4", "Look at the patterns", "After a few days, see what lifts you — then plan more of it."],
    ],
  },
  record: { key: "record", name: "Thought Record", tag: "CBT", short: "The 7-column record: evidence for and against, and a re-rated feeling." },
  worry: { key: "worry", name: "Worry Tree", tag: "Anxiety", short: "Sort worries you can act on from the ones to let go, and plan worry time." },
  exposure: { key: "exposure", name: "Exposure Ladder", tag: "Anxiety", short: "Step-by-step fear ladder with distress ratings, from easiest to hardest." },
  coping: { key: "coping", name: "Coping Cards", tag: "Skills", short: "Personal reminder cards for hard moments — made together in session." },
};
export const LIBRARY = ["abcd", "activity", "record", "worry", "exposure", "coping"].map((k) => WORKSHEETS[k]);
export const toolOf = (k) => WORKSHEETS[k] || WORKSHEETS.abcd;

export function Tiles({ tool, size = 38 }) {
  return (
    <span className="wr-tiles" aria-hidden="true">
      {toolOf(tool).tiles.map(([l, c]) => <i key={l + c} style={{ background: c, width: size, height: size, fontSize: size * 0.45 }}>{l}</i>)}
    </span>
  );
}

/* "Why this helps" — the importance of the sheet, its benefits, who it's for and how long it takes */
export function WhyCard({ tool, open: startOpen = true, compact = false }) {
  const w = toolOf(tool);
  const [open, setOpen] = useState(startOpen);
  return (
    <section className={`wr-why${compact ? " compact" : ""}`}>
      <style>{WR_CSS}</style>
      <button type="button" className="wr-why-h" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="wr-why-ic" aria-hidden="true">💡</span>
        <span><b>Why this worksheet helps</b><small>{w.time}</small></span>
        <i aria-hidden="true">{open ? "−" : "+"}</i>
      </button>
      {open && (
        <div className="wr-why-b">
          <p className="wr-why-p">{w.why}</p>
          <div className="wr-why-g">
            <div>
              <h4>What you get</h4>
              <ul>{w.benefits.map((b) => <li key={b}>{b}</li>)}</ul>
            </div>
            <div>
              <h4>Helpful for</h4>
              <div className="wr-chips">{w.forWho.map((x) => <span key={x}>{x}</span>)}</div>
              <h4>Time it takes</h4>
              <p className="wr-time">⏱ {w.time}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export const WR_CSS = `
.wr-tiles { display: inline-flex; gap: 5px; }
.wr-tiles i { display: grid; place-items: center; border-radius: 28%; color: #fff; font-style: normal; font-weight: 900; }
.wr-why { background: #fffdf6; border: 1px solid #f1e3bd; border-radius: 18px; margin-bottom: 14px; overflow: hidden; }
.wr-why-h { width: 100%; display: flex; align-items: center; gap: 12px; padding: 14px 16px; border: 0; background: none; font: inherit; text-align: left; cursor: pointer; color: #3b2a06; }
.wr-why-ic { flex: none; width: 38px; height: 38px; border-radius: 12px; display: grid; place-items: center; background: #ffefc2; font-size: 19px; }
.wr-why-h > span:nth-child(2) { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.wr-why-h b { font-size: 16px; }
.wr-why-h small { font-size: 12.5px; color: #8a6a2a; }
.wr-why-h > i { font-style: normal; font-size: 22px; font-weight: 700; color: #b8860b; }
.wr-why-b { padding: 0 16px 16px; }
.wr-why-p { margin: 0 0 12px; font-size: 15px; line-height: 1.6; color: #3f3420; }
.wr-why-g { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); gap: 16px; }
.wr-why h4 { margin: 0 0 8px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; color: #8a6a2a; }
.wr-why h4 + p, .wr-why .wr-chips + h4 { margin-top: 12px; }
.wr-why ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 7px; }
.wr-why li { position: relative; padding-left: 26px; font-size: 14.5px; color: #1f2937; line-height: 1.45; }
.wr-why li::before { content: "✓"; position: absolute; left: 0; top: 0; width: 18px; height: 18px; border-radius: 50%; background: #16a34a; color: #fff; font-size: 11px; font-weight: 900; display: grid; place-items: center; }
.wr-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.wr-chips span { font-size: 12.5px; font-weight: 700; background: #fff; border: 1px solid #f1e3bd; color: #6b4f12; border-radius: 999px; padding: 4px 10px; }
.wr-time { margin: 0; font-size: 14px; color: #3f3420; }
.wr-why.compact .wr-why-p { font-size: 14px; }
@media (max-width: 640px) { .wr-why-g { grid-template-columns: minmax(0, 1fr); } }
`;
