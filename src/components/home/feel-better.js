import React, { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { createPortal } from "react-dom";
import { availableToday } from "../../utils/concerns";
import { imagePath } from "../../utils/url";
import { thumb, thumbSet } from "../../utils/thumb";

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

// what we say back first — a kind, human line for each feeling
const KIND = {
  anxious: ["It's okay to feel this way.", "Anxiety is your body trying to keep you safe. Let's help it slow down."],
  low: ["Some days are heavy.", "You don't have to feel better all at once — one small step is enough for today."],
  stressed: ["You're carrying a lot.", "Take one minute of space for yourself before the next thing."],
  angry: ["Your anger makes sense.", "It usually means something matters to you. Let's cool the heat first."],
  sleep: ["Lying awake is exhausting.", "Let's help your mind and body wind down for the night."],
  hurt: ["Being hurt stays with you.", "Your feelings deserve to be heard — by you first, and by someone who listens."],
};

const LABELS = { anxiety: "anxiety", depression: "low mood", "work-stress-burnout": "work stress", anger: "anger", stress: "stress & sleep", relationships: "relationships" };

function Modal({ tool, concern, count, onClose }) {
  const [css, setCss] = useState("");
  useEffect(() => { toolCss().then(setCss); }, []);
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    const prev = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; document.documentElement.style.overflow = prevHtml; window.removeEventListener("keydown", onKey); };
  }, [onClose]);
  const Tool = TOOLS[tool.id];
  // rendered on <body>: the section is its own layer, so a pop-up inside it slid under later sections and the phone bar
  return createPortal(
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
    </div>,
    document.body
  );
}

// stats: concernStats(...).bySlug from pages/index.js (counts / fees per concern)
// week: concernStats(...).week — weekly openings, for "available today"
export default function FeelBetter({ stats = null, week = null }) {
  const [feel, setFeel] = useState("anxious");
  // the clock only after mount, so server and browser HTML match
  const [now, setNow] = useState(null);
  useEffect(() => { setNow(Date.now()); }, []);
  const [open, setOpen] = useState(null); // { tool, concern }
  const f = FEELINGS.find((x) => x.id === feel);
  const s = stats?.[f.concern];
  const faces = s?.faces || [];
  const extra = Math.max(0, (s?.count || 0) - faces.length);
  const today = availableToday(s?.ids, week, now);

  const [kindT, kindS] = KIND[f.id];
  return (
    <section className="fb-sec" aria-labelledby="fb-h">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      {/* a full-width band in two halves: the question on the left, our answer on the right */}
      <div className="fb-band">
        <div className="fb-ask">
          <p className="fb-eyebrow">Free · no sign-up · private</p>
          <h2 id="fb-h" className="fb-title">How are you <span>feeling</span> right now?</h2>
          <p className="fb-sub">Whatever it is, it's okay to feel it. Tap the one closest to you — we'll share a small step that helps right now, and people who can help for longer.</p>
          <div className="fb-feelings" role="tablist" aria-label="How are you feeling">
            {FEELINGS.map((x) => (
              <button key={x.id} type="button" role="tab" aria-selected={feel === x.id} className={feel === x.id ? "on" : ""} onClick={() => setFeel(x.id)}>
                <span aria-hidden="true">{x.emoji}</span>{x.label}
              </button>
            ))}
          </div>
          <p className="fb-sos">
            <span className="fb-orb" aria-hidden="true"><i /><b>🫁</b></span>
            <span><b>Panic attack right now?</b> <button type="button" onClick={() => setOpen({ tool: { id: "sos", title: "30-second SOS" }, concern: "anxiety" })}>Try a 30-second reset</button> or call <a href="tel:18008914416">Tele-MANAS 1800-89-14416</a> (free, 24×7).</span>
          </p>
        </div>

        <div className="fb-answer" role="tabpanel" aria-live="polite">
          <div className="fb-kind" key={f.id}>
            <span className="fb-big" aria-hidden="true">{f.emoji}</span>
            <div><b>{kindT}</b><span>{kindS}</span></div>
          </div>
          <p className="fb-lbl">Try this now</p>
          <div className="fb-steps">
            {f.tools.map((t) => {
              const inner = (
                <>
                  <span className="fb-ic" aria-hidden="true"><i className={`feather-${t.id === "breathing" ? "wind" : t.id === "grounding" ? "anchor" : t.id === "sounds" ? "headphones" : "edit-3"}`} /></span>
                  <span className="fb-st"><b>{t.title}</b><small>{t.desc}</small></span>
                  <span className="fb-time">{t.time}</span>
                  <i className="feather-arrow-right fb-arr" aria-hidden="true" />
                </>
              );
              return t.href
                ? <Link key={t.title} href={t.href} className="fb-step">{inner}</Link>
                : <button key={t.title} type="button" className="fb-step" onClick={() => setOpen({ tool: t, concern: f.concern })}>{inner}</button>;
            })}
          </div>
          <p className="fb-lbl">Talk to someone who understands</p>
          <div className="fb-people">
            {faces.length > 0 && (
              <span className="fb-faces" aria-hidden="true">
                {faces.map((x) => (
                  <img key={x.profile} src={thumb(`${imagePath}/${x.profile}`, 64)} srcSet={thumbSet(`${imagePath}/${x.profile}`, 64, 128)} alt={x.name || "Psychologist"} width="40" height="40" loading="lazy" />
                ))}
                {extra > 0 && <em>+{extra}</em>}
              </span>
            )}
            <span className="fb-pp-t">
              <b>{s?.count ? `${s.count} psychologists` : "Psychologists"} for {LABELS[f.concern]}</b>
              <small>{today > 0 ? <><i className="fb-dot" />{today} free today</> : "Online & in person"}{s?.minFee ? <> · from ₹{s.minFee.toLocaleString("en-IN")}</> : null}</small>
            </span>
            <Link href={`/therapy-for/${f.concern}`} className="fb-pp-btn">See who can help <i className="feather-arrow-right" aria-hidden="true" /></Link>
          </div>
          <p className="fb-more">More free tools — mood tracker, gratitude jar, calming sounds: <Link href="/wellness-toolkit">Wellness Toolkit <i className="feather-arrow-right" aria-hidden="true" /></Link></p>
        </div>
      </div>

      {open && <Modal tool={open.tool} concern={open.concern} count={stats?.[open.concern]?.count} onClose={() => setOpen(null)} />}
    </section>
  );
}

const CSS = `
/* full-width band (like the Cycle & Mood and "Not sure where to start?" sections): left = the question on soft green,
   right = our answer on white. Content lines up with .container (same --g as LeadCard full) */
.fb-sec { --g: 20px; position: relative; isolation: isolate; background: #fff; border-top: 1px solid #e3ece5; }
@media (min-width: 601px) and (max-width: 1023px) { .fb-sec { --g: 40px; } }
@media (min-width: 1024px) { .fb-sec { --g: max(clamp(40px, 4.5vw, 56px), calc((100% - 1380px) / 2 + 40px)); } }
@media (min-width: 1300px) { .fb-sec { --g: max(40px, calc((100% - 1380px) / 2 + 40px)); } }
.fb-band { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
.fb-ask { position: relative; overflow: hidden; isolation: isolate; padding: 64px 48px 56px var(--g); background: linear-gradient(160deg, #eaf4ec 0%, #e1efe4 55%, #d6eadb 100%); }
.fb-ask::before { content: ""; position: absolute; z-index: -1; width: 380px; height: 380px; right: -150px; top: -170px; border-radius: 50%; background: radial-gradient(circle, rgba(227,168,58,.22), rgba(227,168,58,0) 68%); }
.fb-ask::after { content: ""; position: absolute; z-index: -1; width: 260px; height: 260px; left: -120px; bottom: -130px; border-radius: 50%; border: 40px solid rgba(30,122,76,.06); }
.fb-eyebrow { display: inline-flex; align-items: center; gap: 10px; margin: 0 0 12px; padding: 0; font-size: 12px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; color: #a86e0e; }
.fb-eyebrow::before { content: ""; width: 26px; height: 2px; background: #d4a24c; }
.fb-title { font-size: clamp(28px, 3vw, 40px); font-weight: 800; color: #0b1712; margin: 0 0 12px; line-height: 1.12; letter-spacing: -.02em; }
.fb-title span { color: #1e7a4c; }
.fb-sub { color: #3f5249; font-size: 16px; line-height: 1.65; margin: 0 0 24px; padding: 0; max-width: 52ch; }
.fb-feelings { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; max-width: 560px; }
.fb-feelings button { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; min-height: 92px; padding: 12px 8px; border-radius: 18px; border: 1.5px solid rgba(30,122,76,.14); background: rgba(255,255,255,.75); color: #1f3d30; font: inherit; font-size: 14.5px; font-weight: 800; cursor: pointer; text-align: center; line-height: 1.2;
  transition: transform .15s ease, background .15s ease, border-color .15s ease, box-shadow .15s ease; }
.fb-feelings button span { font-size: 30px; line-height: 1; }
.fb-feelings button:hover { transform: translateY(-2px); background: #fff; border-color: rgba(30,122,76,.35); }
.fb-feelings button.on { background: #fff; border-color: #1e7a4c; box-shadow: 0 0 0 3px rgba(30,122,76,.14), 0 14px 26px -16px rgba(20,83,45,.6); color: #14532d; }
.fb-feelings button:focus-visible { outline: 2px solid #e3a83a; outline-offset: 2px; }
.fb-sos { display: flex; align-items: center; gap: 12px; margin: 22px 0 0; padding: 0; max-width: 560px; font-size: 13.5px; color: #4b5b53; line-height: 1.55; }
.fb-sos b { color: #7c2d12; }
.fb-sos button { border: 0; background: none; padding: 0; font: inherit; font-weight: 800; color: #c2410c; text-decoration: underline; text-underline-offset: 3px; cursor: pointer; }
.fb-sos a { color: #7c2d12 !important; font-weight: 800; white-space: nowrap; }
.fb-orb { position: relative; flex: none; width: 40px; height: 40px; display: grid; place-items: center; }
.fb-orb i { position: absolute; inset: 0; border-radius: 50%; background: radial-gradient(circle, rgba(234,88,12,.28), rgba(234,88,12,.05) 70%); animation: fbBreathe 6s ease-in-out infinite; }
.fb-orb b { position: relative; width: 28px; height: 28px; border-radius: 50%; background: #fff; display: grid; place-items: center; font-size: 15px; }
@keyframes fbBreathe { 0%, 100% { transform: scale(.75); opacity: .6; } 50% { transform: scale(1); opacity: 1; } }

.fb-answer { padding: 64px var(--g) 56px 56px; background: linear-gradient(180deg, #fff, #f8fbf9); display: flex; flex-direction: column; }
.fb-kind { display: flex; align-items: center; gap: 16px; padding: 18px 20px; border-radius: 20px; background: #f3f9f5; border: 1px solid #e0eee5; animation: fbIn .35s ease; }
@keyframes fbIn { from { opacity: 0; transform: translateY(6px); } }
.fb-big { font-size: 44px; line-height: 1; flex: none; }
.fb-kind b { display: block; font-size: 20px; font-weight: 800; color: #0b1712; letter-spacing: -.01em; }
.fb-kind div > span { display: block; font-size: 14.5px; color: #4b5b53; line-height: 1.5; margin-top: 2px; }
.fb-lbl { margin: 22px 0 10px; padding: 0; font-size: 12px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: #6b7c73; }
.fb-steps { display: grid; gap: 10px; }
.fb-step { display: flex; align-items: center; gap: 14px; width: 100%; padding: 14px 16px; border-radius: 16px; border: 1px solid #e3ece6; background: #fff; text-align: left; font: inherit; cursor: pointer; color: #0b1712 !important; text-decoration: none !important;
  transition: border-color .15s ease, transform .15s ease, box-shadow .15s ease; }
.fb-step:hover { border-color: #a7d7b8; transform: translateX(3px); box-shadow: 0 12px 24px -20px rgba(11,52,30,.6); }
.fb-step:focus-visible { outline: 3px solid #1e7a4c; outline-offset: 2px; }
.fb-ic { width: 42px; height: 42px; border-radius: 13px; flex: none; display: grid; place-items: center; background: #e7f6ec; color: #1e7a4c; font-size: 19px; }
.fb-st { flex: 1; min-width: 0; display: grid; gap: 2px; }
.fb-st b { font-size: 15.5px; font-weight: 800; }
.fb-st small { font-size: 13px; color: #5b6b63; line-height: 1.4; }
.fb-time { flex: none; font-size: 11px; font-weight: 800; letter-spacing: .3px; text-transform: uppercase; color: #8a5a0b; background: #fbefd3; border-radius: 999px; padding: 4px 9px; white-space: nowrap; }
.fb-arr { flex: none; color: #1e7a4c; font-size: 17px; }
.fb-people { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; padding: 16px 18px; border-radius: 18px; color: #fff; background: linear-gradient(140deg, #1e7a4c 0%, #166534 55%, #0f3f24 100%); box-shadow: 0 18px 32px -24px rgba(11,52,30,.9); }
.fb-faces { display: inline-flex; align-items: center; flex: none; }
.fb-faces img, .fb-faces em { width: 38px; height: 38px; border-radius: 50%; border: 2.5px solid #1a6e44; margin-left: -10px; background: #e8f3ec; object-fit: cover; }
.fb-faces img:first-child { margin-left: 0; }
.fb-faces em { display: inline-flex; align-items: center; justify-content: center; font-style: normal; font-size: 12px; font-weight: 900; color: #3b2604; background: #ecc77d; }
.fb-pp-t { flex: 1; min-width: 160px; display: grid; gap: 2px; }
.fb-pp-t b { font-size: 15.5px; font-weight: 800; }
.fb-pp-t small { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; color: rgba(255,255,255,.82); }
.fb-dot { width: 7px; height: 7px; border-radius: 50%; background: #4ade80; animation: fbPulse 1.8s infinite; }
@keyframes fbPulse { 0% { box-shadow: 0 0 0 0 rgba(74,222,128,.6); } 70% { box-shadow: 0 0 0 7px rgba(74,222,128,0); } 100% { box-shadow: 0 0 0 0 rgba(74,222,128,0); } }
.fb-pp-btn { display: inline-flex; align-items: center; gap: 7px; height: 42px; padding: 0 16px; border-radius: 12px; background: #ecc77d; color: #3b2604 !important; font-size: 14px; font-weight: 800; text-decoration: none !important; white-space: nowrap; transition: background .2s ease; }
.fb-pp-btn:hover { background: #f5d595; }
.fb-more { margin: 16px 0 0; padding: 0; font-size: 13.5px; color: #5b6b63; }
.fb-more a { color: #1e7a4c; font-weight: 800; text-decoration: none; white-space: nowrap; }

.fb-modal-wrap { position: fixed; inset: 0; z-index: 2147483100; display: flex; align-items: center; justify-content: center; padding: 16px; }
.fb-overlay { position: absolute; inset: 0; background: rgba(7,26,17,.55); }
.fb-modal { position: relative; width: 100%; max-width: 460px; max-height: calc(100vh - 32px); max-height: calc(100dvh - 32px); overflow-y: auto; overscroll-behavior: contain; background: #fff; border-radius: 20px; box-shadow: 0 30px 60px -20px rgba(0,0,0,.45); }
.fb-modal-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 18px; border-bottom: 1px solid #eef2f0; }
.fb-modal-head h3 { font-size: 17px; font-weight: 800; color: #0b1712; margin: 0; }
.fb-x { width: 34px; height: 34px; border-radius: 10px; border: none; background: #f1f5f3; color: #475569; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.fb-modal-body { padding: 18px 20px 22px; }
.fb-modal-foot { display: flex; flex-direction: column; gap: 2px; padding: 12px 20px 16px; border-top: 1px solid #eef2f0; background: #f8faf9; font-size: 13px; color: #64748b; }
.fb-modal-foot a { color: #1e7a4c; font-weight: 800; font-size: 14px; text-decoration: none; }
.fb-loading { text-align: center; color: #94a3b8; padding: 30px 0; margin: 0; }

@media (max-width: 1023px) {
  .fb-band { grid-template-columns: minmax(0, 1fr); }
  .fb-ask { padding: 48px var(--g) 32px; }
  .fb-feelings { max-width: none; grid-template-columns: repeat(6, minmax(0, 1fr)); }
  .fb-answer { padding: 28px var(--g) 44px; }
}
@media (max-width: 767px) {
  .fb-ask { padding: 40px var(--g) 26px; }
  .fb-title { font-size: 27px; line-height: 1.2; }
  .fb-sub { font-size: 15px; margin-bottom: 18px; }
  .fb-feelings { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
  .fb-feelings button { min-height: 78px; font-size: 13px; border-radius: 16px; }
  .fb-feelings button span { font-size: 26px; }
  .fb-sos { align-items: flex-start; font-size: 13px; }
  .fb-answer { padding: 24px var(--g) 36px; }
  .fb-kind { padding: 14px 16px; gap: 12px; }
  .fb-big { font-size: 36px; }
  .fb-kind b { font-size: 17px; }
  .fb-kind div > span { font-size: 13.5px; }
  .fb-step { padding: 12px 13px; gap: 11px; }
  .fb-ic { width: 38px; height: 38px; }
  .fb-st b { font-size: 14.5px; }
  .fb-time { display: none; }
  .fb-people { padding: 14px; }
  .fb-pp-btn { width: 100%; justify-content: center; }
  .fb-modal-wrap { align-items: flex-end; padding: 0; }
  .fb-modal { max-width: none; border-radius: 20px 20px 0 0; max-height: 92vh; max-height: 92dvh; padding-bottom: env(safe-area-inset-bottom, 0px); }
}
@media (prefers-reduced-motion: reduce) { .fb-feelings button, .fb-step { transition: none; } .fb-orb i, .fb-dot, .fb-kind { animation: none; } }
`;
