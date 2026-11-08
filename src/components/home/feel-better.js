import React, { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
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

  return (
    <section className="fb-sec" aria-labelledby="fb-h">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="container">
        <p className="fb-eyebrow">Free · no sign-up · private</p>
        <h2 id="fb-h" className="fb-title">How are you <span>feeling</span> right now?</h2>
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
          {/* the heading is the link (stretched over the card) — a whole-card link made one very long anchor text */}
          <div className="fb-tool fb-people">
            <div className="fb-pp-top">
              {faces.length > 0 ? (
                <span className="fb-faces" aria-hidden="true">
                  {faces.map((x) => (
                    <img key={x.profile} src={thumb(`${imagePath}/${x.profile}`, 64)} srcSet={thumbSet(`${imagePath}/${x.profile}`, 64, 128)} alt="" width="40" height="40" loading="lazy" />
                  ))}
                  {extra > 0 && <em>+{extra}</em>}
                </span>
              ) : <span className="fb-time">Talk to someone</span>}
              <span className={`fb-live${today > 0 ? " on" : ""}`}><i aria-hidden="true" />{today > 0 ? `${today} free today` : "Online & in person"}</span>
            </div>
            <h3><Link href={`/therapy-for/${f.concern}`} className="fb-stretch">{s?.count ? `${s.count} psychologists` : "Psychologists"} for {LABELS[f.concern]}</Link></h3>
            <p>{s?.minFee ? <>Verified experts · from <b>₹{s.minFee.toLocaleString("en-IN")}</b> a session</> : "Verified experts, online or in person."}</p>
            <span className="fb-pp-btn">See who can help <i className="feather-arrow-right" aria-hidden="true" /></span>
          </div>
        </div>

        <div className="fb-sos">
          <span className="fb-orb" aria-hidden="true"><i /><i /><b>🫁</b></span>
          <div className="fb-sos-txt">
            <b>Having a panic attack right now?</b>
            <span>A 30-second guided reset can slow things down. You're not alone.</span>
          </div>
          <div className="fb-sos-acts">
            <button type="button" className="fb-sos-go" onClick={() => setOpen({ tool: { id: "sos", title: "30-second SOS" }, concern: "anxiety" })}>Start 30-sec reset</button>
            <a className="fb-sos-call" href="tel:18008914416"><i className="feather-phone" aria-hidden="true" /> <span><b>Tele-MANAS 1800-89-14416</b><small>Free · 24×7 crisis line</small></span></a>
          </div>
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
.fb-sec { position: relative; overflow: hidden; isolation: isolate; padding: 72px 0 60px; background: linear-gradient(180deg, #e2ece1 0%, #edf3ea 55%, #f7f4ea 100%); }
.fb-sec::before { content: ""; position: absolute; z-index: -1; width: 520px; height: 520px; right: -180px; top: -220px; border-radius: 50%; background: radial-gradient(circle, rgba(227,168,58,.20), rgba(227,168,58,0) 68%); }
.fb-sec::after { content: ""; position: absolute; z-index: -1; width: 420px; height: 420px; left: -200px; bottom: -160px; border-radius: 50%; background: radial-gradient(circle, rgba(30,122,76,.13), rgba(30,122,76,0) 70%); }
.fb-eyebrow { display: inline-flex; align-items: center; gap: 10px; margin: 0 0 12px; padding: 0; font-size: 12px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; color: #a86e0e; }
.fb-eyebrow::before { content: ""; width: 26px; height: 2px; background: #d4a24c; }
.fb-title { font-size: clamp(1.95rem, 3.6vw, 2.9rem); font-weight: 800; color: #0b1712; margin: 0 0 10px; line-height: 1.12; letter-spacing: -.02em; }
.fb-title span { color: #1e7a4c; }
.fb-sub { color: #4b5b53; font-size: 16px; line-height: 1.6; margin: 0 0 24px; padding: 0; max-width: 60ch; }
.fb-feelings { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; }
.fb-feelings button { display: inline-flex; align-items: center; gap: 8px; height: 46px; padding: 0 18px; border-radius: 999px; border: 1.5px solid #d6e3d9; background: #fff; color: #1f3d30; font-size: 14.5px; font-weight: 700; cursor: pointer;
  box-shadow: 0 4px 12px -8px rgba(20,83,45,.35); transition: border-color .15s ease, transform .15s ease, background .15s ease; }
.fb-feelings button span { font-size: 19px; }
.fb-feelings button:hover { border-color: #1e7a4c; transform: translateY(-1px); }
.fb-feelings button.on { background: linear-gradient(135deg, #22895a, #1e7a4c 55%, #14532d); border-color: #14532d; color: #fff; box-shadow: 0 10px 20px -12px rgba(20,83,45,.9); }
.fb-feelings button:focus-visible { outline: 2px solid #e3a83a; outline-offset: 2px; }

.fb-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.fb-tool { position: relative; display: flex; flex-direction: column; align-items: flex-start; gap: 6px; text-align: left; padding: 20px 20px 18px; border-radius: 18px; border: 1px solid #dbe7de; background: #fff;
  box-shadow: 0 16px 34px -26px rgba(11,52,30,.55), 0 1px 3px rgba(11,52,30,.05); cursor: pointer; text-decoration: none !important; font: inherit; transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease; }
.fb-tool:hover { transform: translateY(-3px); box-shadow: 0 22px 40px -24px rgba(11,52,30,.6); border-color: #b9d6c3; }
.fb-tool:focus-visible { outline: 3px solid #1e7a4c; outline-offset: 2px; }
.fb-time { font-size: 11px; font-weight: 800; letter-spacing: .4px; text-transform: uppercase; color: #8a5a0b; background: #fbefd3; border-radius: 999px; padding: 4px 10px; }
.fb-tool h3 { font-size: 18px; font-weight: 800; color: #0b1712; margin: 6px 0 0; line-height: 1.3; }
.fb-tool p { font-size: 14.5px; color: #5b6b63; line-height: 1.55; margin: 0; padding: 0; }
.fb-go { display: inline-flex; align-items: center; gap: 6px; margin-top: auto; padding-top: 10px; font-size: 14px; font-weight: 800; color: #1e7a4c; }
.fb-tool:hover .fb-go i { transform: translateX(3px); }
.fb-go i { transition: transform .2s ease; }
@keyframes fbPulse { 0% { box-shadow: 0 0 0 0 rgba(74,222,128,.6); } 70% { box-shadow: 0 0 0 7px rgba(74,222,128,0); } 100% { box-shadow: 0 0 0 0 rgba(74,222,128,0); } }
@keyframes fbBreathe { 0%, 100% { transform: scale(.72); opacity: .55; } 50% { transform: scale(1); opacity: 1; } }
.fb-people { position: relative; overflow: hidden; gap: 8px; background: linear-gradient(150deg, #1e7a4c 0%, #166534 50%, #0f3f24 100%); border-color: #14532d; }
.fb-people::before { content: ""; position: absolute; width: 200px; height: 200px; right: -70px; top: -80px; border-radius: 50%; background: radial-gradient(circle, rgba(227,168,58,.35), rgba(227,168,58,0) 70%); pointer-events: none; }
.fb-people::after { content: ""; position: absolute; width: 150px; height: 150px; left: -60px; bottom: -70px; border-radius: 50%; border: 24px solid rgba(255,255,255,.05); pointer-events: none; }
.fb-people:has(.fb-stretch:focus-visible) { outline: 3px solid #e3a83a; outline-offset: 2px; }
.fb-stretch { color: inherit !important; text-decoration: none !important; }
.fb-stretch::after { content: ""; position: absolute; inset: 0; z-index: 1; }
.fb-pp-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; width: 100%; flex-wrap: wrap; }
.fb-faces { display: inline-flex; align-items: center; }
.fb-faces img, .fb-faces em { width: 40px; height: 40px; border-radius: 50%; border: 2.5px solid #1a6e44; margin-left: -10px; background: #e8f3ec; object-fit: cover; }
.fb-faces img:first-child { margin-left: 0; }
.fb-faces em { display: inline-flex; align-items: center; justify-content: center; font-style: normal; font-size: 12.5px; font-weight: 900; color: #3b2604; background: #ecc77d; }
.fb-live { display: inline-flex; align-items: center; gap: 7px; padding: 5px 11px; border-radius: 999px; background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.16); color: #fff; font-size: 12px; font-weight: 700; white-space: nowrap; }
.fb-live i { width: 7px; height: 7px; border-radius: 50%; background: #ecc77d; }
.fb-live.on i { background: #4ade80; animation: fbPulse 1.8s infinite; }
.fb-people .fb-time { background: rgba(236,199,125,.18); color: #f5d595; }
.fb-people h3 { color: #fff; margin-top: 8px; }
.fb-people p { color: rgba(255,255,255,.8); }
.fb-people p b { color: #f5d595; }
.fb-pp-btn { margin-top: auto; display: inline-flex; align-items: center; gap: 7px; height: 40px; padding: 0 16px; border-radius: 12px; background: #ecc77d; color: #3b2604; font-size: 14px; font-weight: 800; transition: background .2s ease; }
.fb-pp-btn i { transition: transform .2s ease; }
.fb-people:hover .fb-pp-btn { background: #f5d595; }
.fb-people:hover .fb-pp-btn i { transform: translateX(3px); }

.fb-sos { position: relative; overflow: hidden; display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 16px 22px; margin-top: 16px; padding: 18px 22px; border-radius: 20px;
  background: linear-gradient(120deg, #fff7f0 0%, #ffeee2 100%); border: 1px solid #f8d2b8; box-shadow: 0 16px 34px -28px rgba(124,45,18,.7); }
.fb-orb { position: relative; width: 62px; height: 62px; display: flex; align-items: center; justify-content: center; flex: none; }
.fb-orb i { position: absolute; inset: 0; border-radius: 50%; background: radial-gradient(circle, rgba(234,88,12,.28), rgba(234,88,12,.06) 70%); animation: fbBreathe 6s ease-in-out infinite; }
.fb-orb i + i { inset: 9px; background: rgba(234,88,12,.18); animation-delay: .4s; }
.fb-orb b { position: relative; width: 36px; height: 36px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 4px 12px -4px rgba(194,65,12,.5); }
.fb-sos-txt { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.fb-sos-txt b { font-size: 16.5px; font-weight: 800; color: #7c2d12; }
.fb-sos-txt span { font-size: 14px; color: #9a4a22; line-height: 1.5; }
.fb-sos-acts { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }
.fb-sos-go { height: 46px; padding: 0 20px; border-radius: 13px; border: none; background: linear-gradient(135deg, #ea580c, #c2410c); color: #fff; font-size: 14.5px; font-weight: 800; cursor: pointer; box-shadow: 0 10px 20px -12px rgba(194,65,12,.9); white-space: nowrap; }
.fb-sos-go:hover { background: #9a3412; }
.fb-sos-call { display: inline-flex; align-items: center; gap: 9px; height: 46px; padding: 0 14px; border-radius: 13px; background: #fff; border: 1.5px solid #f3c7a8; color: #7c2d12 !important; text-decoration: none !important; white-space: nowrap; }
.fb-sos-call:hover { border-color: #c2410c; }
.fb-sos-call > i { color: #c2410c; font-size: 16px; }
.fb-sos-call span { display: flex; flex-direction: column; line-height: 1.2; }
.fb-sos-call b { font-size: 13px; font-weight: 800; }
.fb-sos-call small { font-size: 11px; color: #9a4a22; font-weight: 600; }
.fb-sos-go:focus-visible, .fb-sos-call:focus-visible { outline: 2px solid #e3a83a; outline-offset: 2px; }
.fb-more { margin: 16px 0 0; padding: 0; font-size: 14px; color: #4b5b53; }
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
  .fb-sec { padding: 48px 0 44px; }
  .fb-title { font-size: 24px; line-height: 1.25; margin: 0 0 8px; }
  .fb-sub { font-size: 15px; margin-bottom: 18px; }
  .fb-feelings { flex-wrap: nowrap; overflow-x: auto; margin: 0 -16px 14px; padding: 0 16px 2px; scrollbar-width: none; }
  .fb-feelings::-webkit-scrollbar { display: none; }
  .fb-feelings button { flex-shrink: 0; height: 42px; font-size: 14px; }
  .fb-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
  .fb-people { grid-column: 1 / -1; }
  .fb-tool { padding: 15px 14px; border-radius: 16px; }
  .fb-tool h3 { font-size: 15.5px; }
  .fb-tool p { font-size: 13px; }
  .fb-sos { grid-template-columns: auto minmax(0, 1fr); padding: 16px; gap: 14px; }
  .fb-orb { width: 52px; height: 52px; }
  .fb-orb b { width: 30px; height: 30px; font-size: 15px; }
  .fb-sos-txt b { font-size: 15.5px; }
  .fb-sos-txt span { font-size: 13.5px; }
  .fb-sos-acts { grid-column: 1 / -1; display: grid; grid-template-columns: 1fr; gap: 8px; }
  .fb-sos-go, .fb-sos-call { width: 100%; justify-content: center; }
  .fb-modal-wrap { align-items: flex-end; padding: 0; }
  .fb-modal { max-width: none; border-radius: 20px 20px 0 0; max-height: 92vh; }
}
@media (prefers-reduced-motion: reduce) { .fb-tool, .fb-feelings button, .fb-go i, .fb-pp-btn i { transition: none; } .fb-orb i, .fb-live.on i { animation: none; } }
`;
