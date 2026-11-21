import React, { useEffect, useMemo, useRef, useState } from "react";
import { BRAIN_GROUPS, BRAIN_PARTS } from "./brain-data";

/* Brain Explorer (2026-11-21) — a therapist resource for psychoeducation. Two views of one brain (outside:
   the lobes; inside: a midline cut showing the deep parts), tap any part for what it does, what changes in
   common difficulties, a plain line to say to a client and how therapy works with it. "Stress response" and
   "Calming down" play the parts in order (the 4th dimension — time). "Show to client" opens a big, simple card
   for screen-sharing. Drawn in SVG (no 3D library) so it loads fast on phones. */

const BY_ID = Object.fromEntries(BRAIN_PARTS.map((p) => [p.id, p]));
const colorOf = (id) => BY_ID[id]?.color || BRAIN_GROUPS[BY_ID[id]?.group]?.color || "#94a3b8";

// cerebrum outline (front = left)
const OUTLINE = "M150,262 C118,202 138,120 220,84 C300,50 420,54 492,95 C556,131 586,192 571,251 C563,286 541,301 511,306 C472,336 420,346 380,341 C330,351 270,346 240,321 C200,316 165,296 150,262 Z";
const CEREB = "M428,318 C458,300 538,300 566,272 C588,300 578,342 542,360 C506,378 456,372 430,352 C419,342 419,328 428,318 Z";
const STEM = "M366,326 C364,352 376,374 383,394 C387,410 385,428 383,442 L410,442 C410,426 413,406 418,388 C429,368 432,346 426,326 Z";

const OUTSIDE = [
  { id: "prefrontal", d: "M0,0 L270,0 L262,64 C250,130 238,190 224,256 L214,264 C212,330 228,400 260,470 L0,470 Z", clip: true },
  { id: "frontal", d: "M270,0 L345,0 L340,52 C330,110 318,170 301,240 C270,244 240,250 224,256 C238,190 250,130 262,64 Z", clip: true },
  { id: "parietal", d: "M345,0 L490,0 L488,92 C498,150 505,200 505,250 C490,244 460,238 420,238 C380,238 340,239 301,240 C318,170 330,110 340,52 Z", clip: true },
  { id: "occipital", d: "M490,0 L700,0 L700,470 L512,306 L505,250 C505,200 498,150 488,92 Z", clip: true },
  { id: "temporal", d: "M214,264 C250,250 330,240 420,238 C460,238 490,244 505,250 L512,306 L520,470 L260,470 C228,400 212,330 214,264 Z", clip: true },
  { id: "cerebellum", d: CEREB },
  { id: "brainstem", d: STEM },
  { id: "insula", ellipse: [322, 228, 46, 20], deep: true },
];

const INSIDE = [
  { id: "prefrontal", d: "M0,0 L240,0 C228,80 220,160 214,230 C208,260 200,285 196,300 L0,470 Z", clip: true },
  { id: "parietal", d: "M360,0 L478,0 L480,150 L420,140 L380,120 Z", clip: true, faint: true },
  { id: "occipital", d: "M478,0 L700,0 L700,470 L520,300 C506,240 494,190 480,150 Z", clip: true },
  { id: "cingulate", d: "M206,222 C214,140 300,108 382,112 C458,116 500,162 494,214 L470,212 C474,174 440,140 382,138 C316,136 244,160 236,222 Z" },
  { id: "callosum", d: "M238,222 C246,166 312,142 382,142 C440,144 470,176 468,214 C466,232 446,240 432,230 C436,206 420,172 380,170 C326,170 276,186 266,226 Z" },
  { id: "basal", ellipse: [312, 226, 30, 18], deep: true },
  { id: "thalamus", ellipse: [370, 234, 38, 21] },
  { id: "hypothalamus", ellipse: [322, 266, 19, 12] },
  { id: "pituitary", circle: [313, 296, 9], stalk: "M318,276 L314,288" },
  { id: "amygdala", circle: [285, 290, 13], deep: true },
  { id: "hippocampus", d: "M298,300 C326,316 380,312 424,286 L428,296 C384,326 324,330 294,312 Z", deep: true },
  { id: "cerebellum", d: CEREB },
  { id: "brainstem", d: STEM },
];

// decorative folds (gyri) on the outside view
const FOLDS = [
  "M190,150 C215,135 240,150 262,140", "M170,205 C200,190 225,205 250,195", "M265,90 C280,120 270,150 285,180",
  "M380,80 C370,110 390,140 375,170", "M420,90 C440,120 425,150 445,185", "M520,150 C540,170 530,200 548,225",
  "M260,290 C300,280 340,295 380,285", "M300,318 C340,308 380,322 430,310", "M215,110 C240,95 260,110 285,100",
];

const STORIES = {
  stress: {
    label: "Stress response", view: "inside",
    steps: [
      { id: "amygdala", t: "1 · The amygdala spots a threat — real or imagined — in a fraction of a second." },
      { id: "hypothalamus", t: "2 · It alerts the hypothalamus, which switches on the stress system." },
      { id: "pituitary", t: "3 · The pituitary signals the adrenal glands: adrenaline now, cortisol after." },
      { id: "brainstem", t: "4 · The brainstem speeds up heart and breathing — the body is ready to fight, flee or freeze." },
      { id: "prefrontal", t: "5 · Meanwhile the prefrontal cortex goes quieter, so it's hard to think clearly. This is normal, not weakness.", dim: true },
    ],
  },
  calm: {
    label: "Calming down", view: "inside",
    steps: [
      { id: "brainstem", t: "1 · Slow breathing with a longer out-breath tells the brainstem the body is safe." },
      { id: "prefrontal", t: "2 · The prefrontal cortex comes back online — naming the feeling helps it." },
      { id: "cingulate", t: "3 · Attention shifts from the alarm to the present moment." },
      { id: "amygdala", t: "4 · The amygdala settles; with practice it learns this situation is safe.", cool: true },
      { id: "hippocampus", t: "5 · The hippocampus files the moment as 'I got through it' — next time feels a little easier." },
    ],
  },
};

function Region({ r, sel, hot, cool, dim, onPick }) {
  const c = colorOf(r.id);
  const on = sel === r.id || hot === r.id;
  const common = {
    className: `be-r${on ? " on" : ""}${hot === r.id ? " hot" : ""}${cool && hot === r.id ? " cool" : ""}${dim && hot === r.id ? " dim" : ""}${r.deep ? " deep" : ""}${r.faint ? " faint" : ""}`,
    style: { "--c": c },
    onClick: () => onPick(r.id),
    role: "button", tabIndex: 0, "aria-label": BY_ID[r.id]?.name, "aria-pressed": sel === r.id,
    onKeyDown: (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPick(r.id); } },
  };
  if (r.ellipse) return <ellipse cx={r.ellipse[0]} cy={r.ellipse[1]} rx={r.ellipse[2]} ry={r.ellipse[3]} {...common} />;
  if (r.circle) return <g>{r.stalk && <path d={r.stalk} className="be-stalk" />}<circle cx={r.circle[0]} cy={r.circle[1]} r={r.circle[2]} {...common} /></g>;
  return <path d={r.d} {...common} clipPath={r.clip ? "url(#be-clip)" : undefined} />;
}

function Brain({ view, sel, hot, cool, dim, onPick }) {
  const regions = view === "inside" ? INSIDE : OUTSIDE;
  // under-the-cortex parts first, then the cerebrum, then deep parts drawn on top
  const back = regions.filter((r) => r.id === "cerebellum" || r.id === "brainstem");
  const cortex = regions.filter((r) => r.clip);
  const front = regions.filter((r) => !r.clip && r.id !== "cerebellum" && r.id !== "brainstem");
  return (
    <svg className="be-svg" viewBox="100 40 500 420" role="group" aria-label={view === "inside" ? "Brain, cut down the middle" : "Brain from the side"}>
      <defs>
        <clipPath id="be-clip"><path d={OUTLINE} /></clipPath>
        <radialGradient id="be-shade" cx="40%" cy="30%" r="75%"><stop offset="0" stopColor="#fff" stopOpacity=".35" /><stop offset="1" stopColor="#000" stopOpacity=".12" /></radialGradient>
        <pattern id="be-cbl" width="10" height="8" patternUnits="userSpaceOnUse"><path d="M0,6 Q5,0 10,6" fill="none" stroke="rgba(0,0,0,.18)" strokeWidth="1.2" /></pattern>
      </defs>
      {back.map((r) => <Region key={r.id} r={r} sel={sel} hot={hot} cool={cool} dim={dim} onPick={onPick} />)}
      <path d={CEREB} fill="url(#be-cbl)" pointerEvents="none" />
      <path d={OUTLINE} className="be-base" />
      {cortex.map((r) => <Region key={r.id} r={r} sel={sel} hot={hot} cool={cool} dim={dim} onPick={onPick} />)}
      {view === "outside" && FOLDS.map((d) => <path key={d} d={d} className="be-fold" clipPath="url(#be-clip)" />)}
      {view === "outside" && <path d="M214,264 C250,250 330,240 420,238 C460,238 490,244 505,250" className="be-fold big" clipPath="url(#be-clip)" />}
      {view === "outside" && <path d="M340,52 C330,110 318,170 301,240" className="be-fold big" clipPath="url(#be-clip)" />}
      <path d={OUTLINE} fill="url(#be-shade)" pointerEvents="none" />
      <path d={OUTLINE} className="be-edge" />
      {front.map((r) => <Region key={r.id} r={r} sel={sel} hot={hot} cool={cool} dim={dim} onPick={onPick} />)}
      <text x="128" y="70" className="be-dir">Front</text><text x="560" y="70" className="be-dir" textAnchor="end">Back</text>
    </svg>
  );
}

export default function BrainExplorer() {
  const [view, setView] = useState("outside");
  const [sel, setSel] = useState("amygdala");
  const [story, setStory] = useState(null); // { key, i }
  const [present, setPresent] = useState(false);
  const panelRef = useRef(null);
  const part = BY_ID[sel];
  const step = story ? STORIES[story.key].steps[story.i] : null;

  const inView = useMemo(() => new Set((view === "inside" ? INSIDE : OUTSIDE).map((r) => r.id)), [view]);
  const pick = (id, scroll = false) => {
    setStory(null);
    setSel(id);
    if (!(view === "inside" ? INSIDE : OUTSIDE).some((r) => r.id === id)) setView(view === "inside" ? "outside" : "inside");
    if (scroll && panelRef.current && window.innerWidth < 900) panelRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // play a story one step at a time
  useEffect(() => {
    if (!story) return undefined;
    const t = setTimeout(() => {
      const steps = STORIES[story.key].steps;
      if (story.i + 1 < steps.length) setStory({ key: story.key, i: story.i + 1 });
    }, 3400);
    return () => clearTimeout(t);
  }, [story]);
  useEffect(() => { if (step) setSel(step.id); }, [step]);
  const play = (key) => { setView(STORIES[key].view); setStory({ key, i: 0 }); };

  // full-screen client card: Esc closes, page behind doesn't scroll
  useEffect(() => {
    if (!present) return undefined;
    const k = (e) => { if (e.key === "Escape") setPresent(false); };
    document.addEventListener("keydown", k);
    const ov = document.body.style.overflow; document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", k); document.body.style.overflow = ov; };
  }, [present]);

  return (
    <div className="be" data-sm-skip="">
      <style>{CSS}</style>
      <header className="be-h">
        <span className="be-h-ic" aria-hidden="true">🧠</span>
        <div>
          <h1>Brain Explorer</h1>
          <p>Tap any part of the brain to see what it does, how it changes in anxiety, depression or trauma, and a simple way to explain it to your client.</p>
        </div>
      </header>

      <div className="be-main">
        <section className="be-stage">
          <div className="be-bar">
            <div className="be-seg" role="tablist" aria-label="View">
              <button type="button" role="tab" aria-selected={view === "outside"} className={view === "outside" ? "on" : ""} onClick={() => { setStory(null); setView("outside"); }}>Outside</button>
              <button type="button" role="tab" aria-selected={view === "inside"} className={view === "inside" ? "on" : ""} onClick={() => { setStory(null); setView("inside"); }}>Inside</button>
            </div>
            <div className="be-play">
              {Object.entries(STORIES).map(([k, s]) => (
                <button type="button" key={k} className={`be-pbtn ${k}${story?.key === k ? " on" : ""}`} onClick={() => (story?.key === k ? setStory(null) : play(k))}>
                  {story?.key === k ? "■ Stop" : `▶ ${s.label}`}
                </button>
              ))}
            </div>
          </div>
          <div className={`be-canvas${story ? " playing" : ""}`}>
            <Brain view={view} sel={sel} hot={step?.id} cool={step?.cool} dim={step?.dim} onPick={(id) => pick(id, true)} />
          </div>
          {story ? (
            <div className={`be-cap ${story.key}`} role="status" aria-live="polite">
              <b>{STORIES[story.key].label}</b>
              <p>{step.t}</p>
              <div className="be-cap-dots">{STORIES[story.key].steps.map((s, i) => <button type="button" key={s.id + i} className={i === story.i ? "on" : ""} onClick={() => setStory({ key: story.key, i })} aria-label={`Step ${i + 1}`} />)}</div>
            </div>
          ) : (
            <p className="be-tip">{view === "outside" ? "Outside view: the four lobes, cerebellum and brainstem. Dashed = deeper, under the folds." : "Inside view: the brain cut down the middle. Dashed parts sit deeper, off the midline."}</p>
          )}
          <div className="be-legend">
            {Object.entries(BRAIN_GROUPS).map(([k, g]) => <span key={k}><i style={{ background: g.color }} />{g.label}</span>)}
          </div>
        </section>

        <aside className="be-panel" ref={panelRef} style={{ "--c": colorOf(sel) }}>
          <div className="be-p-h">
            <span className="be-p-grp">{BRAIN_GROUPS[part.group].label}</span>
            <h2>{part.name}</h2>
            <p className="be-where">📍 {part.where}</p>
          </div>
          <div className="be-say">
            <small>Say it to your client</small>
            <p>“{part.say}”</p>
            <button type="button" onClick={() => setPresent(true)}>⤢ Show to client</button>
          </div>
          <h3>What it does</h3>
          <ul>{part.does.map((x) => <li key={x}>{x}</li>)}</ul>
          <h3>In mental health</h3>
          <ul className="mh">{part.mind.map((x) => <li key={x}>{x}</li>)}</ul>
          <h3>How therapy helps</h3>
          <p className="be-th">{part.therapy}</p>
        </aside>
      </div>

      <section className="be-all" aria-label="All parts">
        <h2>All parts</h2>
        {Object.entries(BRAIN_GROUPS).map(([k, g]) => (
          <div key={k} className="be-grp">
            <span className="be-grp-l"><i style={{ background: g.color }} />{g.label}</span>
            <div className="be-chips">
              {BRAIN_PARTS.filter((p) => p.group === k).map((p) => (
                <button type="button" key={p.id} className={sel === p.id ? "on" : ""} style={{ "--c": g.color }} onClick={() => pick(p.id, true)}>
                  {p.name}{!inView.has(p.id) && <em> ↻</em>}
                </button>
              ))}
            </div>
          </div>
        ))}
        <p className="be-note">For education, not diagnosis. Brain science describes patterns seen across many people — every client&apos;s brain and story is different.</p>
      </section>

      {present && (
        <div className="be-show" role="dialog" aria-modal="true" aria-label={part.name} onClick={(e) => { if (e.target === e.currentTarget) setPresent(false); }}>
          <div className="be-show-c" style={{ "--c": colorOf(sel) }}>
            <button type="button" className="be-show-x" onClick={() => setPresent(false)} aria-label="Close">×</button>
            <div className="be-show-svg"><Brain view={INSIDE.some((r) => r.id === sel) && !OUTSIDE.some((r) => r.id === sel) ? "inside" : view} sel={sel} onPick={(id) => setSel(id)} /></div>
            <h2>{part.name}</h2>
            <p>{part.say}</p>
          </div>
        </div>
      )}
    </div>
  );
}

const CSS = `
.be { max-width: 1200px; margin: 0 auto; color: #1c1c1e; }
.be-h { display: flex; gap: 14px; align-items: center; margin-bottom: 16px; }
.be-h-ic { flex: none; width: 54px; height: 54px; border-radius: 16px; display: grid; place-items: center; font-size: 28px; background: linear-gradient(160deg, #ffd0e0, #f6a5c0); box-shadow: 0 10px 20px -12px #d6336c; }
.be-h h1 { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -.01em; }
.be-h p { margin: 3px 0 0; font-size: 14.5px; color: #6e6e73; max-width: 720px; }
.be-main { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); gap: 16px; align-items: start; }
.be-stage, .be-panel, .be-all { background: #fff; border-radius: 22px; box-shadow: 0 1px 2px rgba(0,0,0,.04), 0 14px 32px -22px rgba(15,23,42,.35); }
.be-stage { padding: 14px 14px 12px; position: sticky; top: 84px; }
.be-bar { display: flex; flex-wrap: wrap; gap: 8px; justify-content: space-between; align-items: center; }
.be-seg { display: inline-flex; padding: 3px; border-radius: 12px; background: #f2f4f3; }
.be-seg button { height: 34px; padding: 0 16px; border: 0; border-radius: 9px; background: none; font: inherit; font-size: 13.5px; font-weight: 700; color: #6e6e73; cursor: pointer; }
.be-seg button.on { background: #fff; color: #14532d; box-shadow: 0 2px 6px -2px rgba(0,0,0,.2); }
.be-play { display: flex; gap: 6px; flex-wrap: wrap; }
.be-pbtn { height: 34px; padding: 0 13px; border-radius: 10px; border: 1.5px solid #fecaca; background: #fff5f5; color: #b91c1c; font: inherit; font-size: 13px; font-weight: 800; cursor: pointer; }
.be-pbtn.calm { border-color: #bbe5cb; background: #f0faf4; color: #15803d; }
.be-pbtn.on { background: #1c1c1e; border-color: #1c1c1e; color: #fff; }
.be-canvas { margin: 6px 0 4px; border-radius: 18px; background: radial-gradient(circle at 50% 45%, #f6f9ff, #eef3f8 70%); }
.be-svg { display: block; width: 100%; height: auto; touch-action: manipulation; }
.be-base { fill: #f2d7cf; }
.be-edge { fill: none; stroke: rgba(120,60,50,.35); stroke-width: 2; pointer-events: none; }
.be-r { fill: var(--c); fill-opacity: .42; stroke: var(--c); stroke-opacity: .55; stroke-width: 1.5; cursor: pointer; transition: fill-opacity .25s ease, stroke-width .25s ease; outline: none; }
.be-r:hover, .be-r:focus-visible { fill-opacity: .5; }
.be-r.deep { stroke-dasharray: 5 4; fill-opacity: .42; }
.be-r.faint { fill-opacity: .14; }
.be-r.on { fill-opacity: .78; stroke-width: 3; stroke-opacity: 1; }
.be-r.hot { animation: bePulse 1.1s ease-in-out infinite; }
.be-r.hot.cool { animation: beCool 1.6s ease-in-out infinite; }
.be-r.hot.dim { animation: none; fill-opacity: .15; stroke-dasharray: 3 4; }
@keyframes bePulse { 0%, 100% { fill-opacity: .55; stroke-width: 3; } 50% { fill-opacity: .95; stroke-width: 6; } }
@keyframes beCool { 0%, 100% { fill-opacity: .75; } 50% { fill-opacity: .35; } }
.be-stalk { stroke: #b38a1f; stroke-width: 3; }
.be-fold { fill: none; stroke: rgba(90,40,30,.22); stroke-width: 2.2; stroke-linecap: round; pointer-events: none; }
.be-fold.big { stroke: rgba(90,40,30,.38); stroke-width: 3; }
.be-dir { font-size: 13px; font-weight: 700; fill: #94a3b8; letter-spacing: .08em; text-transform: uppercase; }
.be-tip { margin: 4px 4px 8px; font-size: 12.5px; color: #8e8e93; }
.be-cap { margin: 4px 0 8px; padding: 12px 14px; border-radius: 14px; background: #fff5f5; border: 1px solid #fecaca; }
.be-cap.calm { background: #f0faf4; border-color: #bbe5cb; }
.be-cap b { font-size: 12px; text-transform: uppercase; letter-spacing: .08em; color: #b91c1c; } .be-cap.calm b { color: #15803d; }
.be-cap p { margin: 4px 0 8px; font-size: 15px; line-height: 1.5; font-weight: 600; color: #1c1c1e; min-height: 45px; }
.be-cap-dots { display: flex; gap: 6px; }
.be-cap-dots button { width: 24px; height: 6px; border: 0; border-radius: 3px; background: rgba(0,0,0,.12); cursor: pointer; padding: 0; }
.be-cap-dots button.on { background: #1c1c1e; }
.be-legend { display: flex; flex-wrap: wrap; gap: 6px 14px; padding: 4px 4px 2px; font-size: 12px; color: #6e6e73; }
.be-legend span { display: inline-flex; align-items: center; gap: 6px; } .be-legend i, .be-grp-l i { width: 10px; height: 10px; border-radius: 3px; }
.be-panel { padding: 18px 20px 20px; border-top: 5px solid var(--c); }
.be-p-grp { font-size: 11.5px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: var(--c); }
.be-panel h2 { margin: 4px 0 6px; font-size: 24px; font-weight: 800; letter-spacing: -.01em; }
.be-where { margin: 0 0 14px; font-size: 14px; color: #475569; line-height: 1.5; }
.be-say { position: relative; padding: 14px 16px; border-radius: 16px; background: linear-gradient(160deg, #fffaf0, #fdf3dc); border: 1px solid #f0dfb4; margin-bottom: 6px; }
.be-say small { font-size: 11.5px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: #a16207; }
.be-say p { margin: 6px 0 10px; font-size: 15.5px; line-height: 1.55; color: #3d2f12; font-weight: 600; }
.be-say button { height: 34px; padding: 0 14px; border-radius: 10px; border: 0; background: #14532d; color: #fff; font: inherit; font-size: 13px; font-weight: 800; cursor: pointer; }
.be-panel h3 { margin: 16px 0 6px; font-size: 14px; font-weight: 800; color: #1c1c1e; }
.be-panel ul { margin: 0; padding-left: 18px; display: grid; gap: 5px; font-size: 14.5px; line-height: 1.5; color: #334155; }
.be-panel ul.mh li::marker { color: var(--c); }
.be-th { margin: 0; font-size: 14.5px; line-height: 1.55; color: #334155; padding: 10px 12px; border-radius: 12px; background: #f0faf4; }
.be-all { margin-top: 16px; padding: 18px 20px; }
.be-all h2 { margin: 0 0 10px; font-size: 18px; font-weight: 800; }
.be-grp { display: flex; flex-wrap: wrap; gap: 8px 14px; align-items: center; padding: 8px 0; border-top: 1px solid #eef2f0; }
.be-grp-l { flex: 0 0 240px; display: inline-flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: #475569; }
.be-chips { flex: 1; display: flex; flex-wrap: wrap; gap: 6px; }
.be-chips button { height: 34px; padding: 0 13px; border-radius: 999px; border: 1.5px solid #e2e8f0; background: #fff; font: inherit; font-size: 13.5px; font-weight: 700; color: #1c1c1e; cursor: pointer; }
.be-chips button:hover { border-color: var(--c); }
.be-chips button.on { background: var(--c); border-color: var(--c); color: #fff; }
.be-chips em { font-style: normal; opacity: .6; }
.be-note { margin: 12px 0 0; font-size: 12.5px; color: #8e8e93; }
.be-show { position: fixed; inset: 0; z-index: 100000; display: grid; place-items: center; padding: 16px; background: rgba(15,23,42,.6); backdrop-filter: blur(4px); }
.be-show-c { position: relative; width: min(760px, 100%); max-height: calc(100dvh - 32px); overflow-y: auto; background: #fff; border-radius: 28px; padding: 22px 28px 28px; text-align: center; border-top: 8px solid var(--c); }
.be-show-x { position: absolute; top: 12px; right: 14px; width: 40px; height: 40px; border: 0; border-radius: 50%; background: #f1f5f9; font-size: 24px; cursor: pointer; }
.be-show-svg { max-width: 460px; margin: 0 auto; }
.be-show-c h2 { margin: 8px 0 8px; font-size: 30px; font-weight: 800; color: var(--c); }
.be-show-c p { margin: 0 auto; max-width: 620px; font-size: 21px; line-height: 1.55; color: #1c1c1e; font-weight: 600; }
@media (max-width: 899px) {
  .be-main { grid-template-columns: minmax(0, 1fr); }
  .be-stage { position: static; }
  .be-grp-l { flex: 1 1 100%; }
  .be-h h1 { font-size: 22px; }
  .be-show-c p { font-size: 18px; }
}
@media (prefers-reduced-motion: reduce) { .be-r.hot, .be-r.hot.cool { animation: none; fill-opacity: .9; } }
`;
