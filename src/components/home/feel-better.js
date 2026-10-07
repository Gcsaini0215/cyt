import React, { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

// Home "How are you feeling right now?" — replaces the 8-card Wellness Toolkit grid.
// Pick a feeling -> two quick self-help tools + the psychologists who work with it.
// The tools themselves (components/wellness/quick-tools.js) load only when one opens.
const load = (name) => dynamic(() => import("../wellness/quick-tools").then((m) => m[name]), { ssr: false, loading: () => <p className="fb-loading">Loading…</p> });
const TOOLS = {
  breathing: load("BreathingTool"),
  grounding: load("GroundingTool"),
  sos: load("SosTool"),
  sounds: load("SoundsTool"),
};
const toolCss = () => import("../wellness/quick-tools").then((m) => m.QT_CSS);

const FEELINGS = [
  {
    id: "anxious", emoji: "😰", label: "Anxious", concern: "anxiety",
    tools: [
      { id: "breathing", props: { pattern: "box" }, title: "1-minute box breathing", desc: "Slow your breath, slow your heart.", time: "1 min" },
      { id: "grounding", title: "5-4-3-2-1 grounding", desc: "Come back to the present when thoughts race.", time: "2 min" },
    ],
  },
  {
    id: "low", emoji: "😔", label: "Low", concern: "depression",
    tools: [
      { href: "/wellness-toolkit?tool=gratitude", title: "Gratitude jar", desc: "Write one small good thing from today.", time: "1 min" },
      { href: "/daily-journal", title: "Guided journal", desc: "Gentle prompts to get it out of your head.", time: "5 min" },
    ],
  },
  {
    id: "stressed", emoji: "😫", label: "Stressed", concern: "work-stress-burnout",
    tools: [
      { id: "breathing", props: { pattern: "box" }, title: "Box breathing", desc: "A reset between meetings.", time: "1 min" },
      { id: "sounds", title: "Calming sounds", desc: "Rain, waves or wind to focus or unwind.", time: "Any time" },
    ],
  },
  {
    id: "angry", emoji: "😤", label: "Angry", concern: "anger",
    tools: [
      { id: "breathing", props: { pattern: "478" }, title: "4-7-8 calm-down breath", desc: "Cool down before you react.", time: "1 min" },
      { id: "grounding", title: "Pause & ground", desc: "Step out of the heat of the moment.", time: "2 min" },
    ],
  },
  {
    id: "sleep", emoji: "😴", label: "Can't sleep", concern: "stress",
    tools: [
      { id: "sounds", title: "Sleep sounds", desc: "Soft rain or brown noise, with a sleep timer.", time: "Any time" },
      { id: "breathing", props: { pattern: "478" }, title: "4-7-8 breathing", desc: "A classic to wind down in bed.", time: "3 min" },
    ],
  },
  {
    id: "hurt", emoji: "💔", label: "Hurt by someone", concern: "relationships",
    tools: [
      { href: "/wellness-toolkit?tool=couple", title: "Say it calmly", desc: "Turn hurt into an \"I feel…\" sentence.", time: "3 min" },
      { href: "/daily-journal", title: "Write it out", desc: "Untangle what happened and what you need.", time: "5 min" },
    ],
  },
];

const LABELS = { anxiety: "anxiety", depression: "low mood", "work-stress-burnout": "work stress", anger: "anger", stress: "stress & sleep", relationships: "relationships" };

function Modal({ tool, concern, count, onClose }) {
  const [css, setCss] = useState("");
  useEffect(() => { toolCss().then(setCss); }, []);
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [onClose]);
  const Tool = TOOLS[tool.id];
  return (
    <div className="fb-modal-wrap" role="dialog" aria-modal="true" aria-labelledby="fb-modal-h">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="fb-overlay" onClick={onClose} />
      <div className="fb-modal">
        <div className="fb-modal-head">
          <h3 id="fb-modal-h">{tool.title}</h3>
          <button type="button" className="fb-x" onClick={onClose} aria-label="Close"><i className="feather-x" /></button>
        </div>
        <div className="fb-modal-body"><Tool {...(tool.props || {})} /></div>
        {concern && (
          <div className="fb-modal-foot">
            <span>Feeling like this often?</span>
            <Link href={`/therapy-for/${concern}`} onClick={onClose}>
              Talk to {count ? `one of ${count} psychologists` : "a psychologist"} for {LABELS[concern] || concern} <i className="feather-arrow-right" aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// stats: concernStats(...).bySlug from pages/index.js (counts / fees per concern)
export default function FeelBetter({ stats = null }) {
  const [feel, setFeel] = useState("anxious");
  const [open, setOpen] = useState(null); // { tool, concern }
  const f = FEELINGS.find((x) => x.id === feel);
  const s = stats?.[f.concern];

  return (
    <section className="fb-sec" aria-labelledby="fb-h">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="container">
        <p className="fb-eyebrow">Free · no sign-up · private</p>
        <h2 id="fb-h" className="fb-title">How are you feeling right now?</h2>
        <p className="fb-sub">Pick one — we'll suggest a 1–5 minute exercise that can help, and the psychologists who work with it.</p>

        <div className="fb-feelings" role="tablist" aria-label="How are you feeling">
          {FEELINGS.map((x) => (
            <button key={x.id} type="button" role="tab" aria-selected={feel === x.id} className={feel === x.id ? "on" : ""} onClick={() => setFeel(x.id)}>
              <span aria-hidden="true">{x.emoji}</span> {x.label}
            </button>
          ))}
        </div>

        <div className="fb-grid" role="tabpanel">
          {f.tools.map((t) => {
            const inner = (
              <>
                <span className="fb-time">{t.time}</span>
                <h3>{t.title}</h3>
                <p>{t.desc}</p>
                <span className="fb-go">{t.href ? "Open" : "Start now"} <i className="feather-arrow-right" aria-hidden="true" /></span>
              </>
            );
            return t.href
              ? <Link key={t.title} href={t.href} className="fb-tool">{inner}</Link>
              : <button key={t.title} type="button" className="fb-tool" onClick={() => setOpen({ tool: t, concern: f.concern })}>{inner}</button>;
          })}
          <Link href={`/therapy-for/${f.concern}`} className="fb-tool fb-people">
            <span className="fb-time">Talk to someone</span>
            <h3>{s?.count ? `${s.count} psychologists` : "Psychologists"} for {LABELS[f.concern]}</h3>
            <p>{s?.minFee ? `Online or in person, from ₹${s.minFee.toLocaleString("en-IN")} a session.` : "Online or in person."}</p>
            <span className="fb-go">See who can help <i className="feather-arrow-right" aria-hidden="true" /></span>
          </Link>
        </div>

        <div className="fb-sos">
          <div>
            <b><span aria-hidden="true">🆘</span> Having a panic attack right now?</b>
            <span>Try a 30-second guided reset. In a crisis, call <a href="tel:18008914416">Tele-MANAS 1800-89-14416</a> (free, 24×7).</span>
          </div>
          <button type="button" onClick={() => setOpen({ tool: { id: "sos", title: "30-second SOS" }, concern: "anxiety" })}>Start SOS</button>
        </div>

        <p className="fb-more">
          More free tools — mood tracker, gratitude jar, calming sounds, couples guide: <Link href="/wellness-toolkit">open the Wellness Toolkit <i className="feather-arrow-right" aria-hidden="true" /></Link>
        </p>
      </div>

      {open && <Modal tool={open.tool} concern={open.concern} count={stats?.[open.concern]?.count} onClose={() => setOpen(null)} />}
    </section>
  );
}

const CSS = `
.fb-sec { background: linear-gradient(180deg, #fffaf0 0%, #fff 100%); padding: 64px 0 56px; }
.fb-eyebrow { display: inline-flex; align-items: center; gap: 8px; margin: 0 0 10px; padding: 0; font-size: 12px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; color: #9a6f22; }
.fb-eyebrow::before { content: ""; width: 22px; height: 2px; background: #d4a24c; }
.fb-title { font-size: clamp(1.6rem, 3.2vw, 2.2rem); font-weight: 800; color: #0b1712; margin: 0 0 6px; letter-spacing: -.01em; }
.fb-sub { color: #64748b; font-size: 15px; margin: 0 0 20px; padding: 0; max-width: 62ch; }
.fb-feelings { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 18px; }
.fb-feelings button { display: inline-flex; align-items: center; gap: 7px; height: 44px; padding: 0 16px; border-radius: 999px; border: 1.5px solid #e6dcc6; background: #fff; color: #26463a; font-size: 14.5px; font-weight: 700; cursor: pointer; }
.fb-feelings button span { font-size: 19px; }
.fb-feelings button:hover { border-color: #d4a24c; }
.fb-feelings button.on { background: #14532d; border-color: #14532d; color: #fff; }

.fb-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.fb-tool { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; text-align: left; padding: 18px 18px 16px; border-radius: 16px; border: 1px solid #e6eee9; background: #fff; box-shadow: 0 2px 10px rgba(20,83,45,.05); cursor: pointer; text-decoration: none !important; font: inherit; transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease; }
.fb-tool:hover { transform: translateY(-3px); box-shadow: 0 14px 28px -14px rgba(20,83,45,.3); border-color: #cfe3d6; }
.fb-tool:focus-visible { outline: 3px solid #1e7a4c; outline-offset: 2px; }
.fb-time { font-size: 11px; font-weight: 800; letter-spacing: .4px; text-transform: uppercase; color: #1e7a4c; background: #eef6f1; border-radius: 6px; padding: 3px 8px; }
.fb-tool h3 { font-size: 17px; font-weight: 800; color: #0b1712; margin: 4px 0 0; }
.fb-tool p { font-size: 14px; color: #64748b; line-height: 1.5; margin: 0; padding: 0; }
.fb-go { display: inline-flex; align-items: center; gap: 5px; margin-top: auto; padding-top: 6px; font-size: 13.5px; font-weight: 800; color: #1e7a4c; }
.fb-people { background: #14532d; border-color: #14532d; }
.fb-people .fb-time { background: rgba(236,199,125,.18); color: #ecc77d; }
.fb-people h3 { color: #fff; }
.fb-people p { color: rgba(255,255,255,.75); }
.fb-people .fb-go { color: #ecc77d; }

.fb-sos { display: flex; align-items: center; justify-content: space-between; gap: 12px 20px; flex-wrap: wrap; margin-top: 16px; padding: 14px 18px; border-radius: 14px; background: #fff7ed; border: 1px solid #fed7aa; }
.fb-sos > div { display: flex; flex-direction: column; gap: 2px; font-size: 14px; color: #7c2d12; }
.fb-sos b { font-size: 15px; }
.fb-sos a { color: #9a3412; font-weight: 800; }
.fb-sos button { height: 42px; padding: 0 20px; border-radius: 10px; border: none; background: #c2410c; color: #fff; font-size: 14.5px; font-weight: 800; cursor: pointer; }
.fb-sos button:hover { background: #9a3412; }
.fb-more { margin: 14px 0 0; padding: 0; font-size: 13.5px; color: #64748b; }
.fb-more a { color: #1e7a4c; font-weight: 800; text-decoration: none; white-space: nowrap; }

.fb-modal-wrap { position: fixed; inset: 0; z-index: 100002; display: flex; align-items: center; justify-content: center; padding: 16px; }
.fb-overlay { position: absolute; inset: 0; background: rgba(7,26,17,.55); }
.fb-modal { position: relative; width: 100%; max-width: 460px; max-height: calc(100vh - 32px); overflow-y: auto; background: #fff; border-radius: 20px; box-shadow: 0 30px 60px -20px rgba(0,0,0,.45); }
.fb-modal-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 18px; border-bottom: 1px solid #eef2f0; }
.fb-modal-head h3 { font-size: 17px; font-weight: 800; color: #0b1712; margin: 0; }
.fb-x { width: 34px; height: 34px; border-radius: 10px; border: none; background: #f1f5f3; color: #475569; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.fb-modal-body { padding: 18px 20px 22px; }
.fb-modal-foot { display: flex; flex-direction: column; gap: 2px; padding: 12px 20px 16px; border-top: 1px solid #eef2f0; background: #f8faf9; font-size: 13px; color: #64748b; }
.fb-modal-foot a { color: #1e7a4c; font-weight: 800; font-size: 14px; text-decoration: none; }
.fb-loading { text-align: center; color: #94a3b8; padding: 30px 0; margin: 0; }

@media (max-width: 767px) {
  .fb-sec { padding: 44px 0 40px; }
  .fb-feelings { flex-wrap: nowrap; overflow-x: auto; margin: 0 -16px 14px; padding: 0 16px 2px; scrollbar-width: none; }
  .fb-feelings::-webkit-scrollbar { display: none; }
  .fb-feelings button { flex-shrink: 0; height: 42px; font-size: 14px; }
  .fb-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
  .fb-people { grid-column: 1 / -1; }
  .fb-tool { padding: 14px; }
  .fb-tool h3 { font-size: 15px; }
  .fb-tool p { font-size: 13px; }
  .fb-sos button { width: 100%; }
  .fb-modal-wrap { align-items: flex-end; padding: 0; }
  .fb-modal { max-width: none; border-radius: 20px 20px 0 0; max-height: 92vh; }
}
@media (prefers-reduced-motion: reduce) { .fb-tool { transition: none; } }
`;
