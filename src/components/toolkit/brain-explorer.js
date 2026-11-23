import React, { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { BRAIN_GROUPS, BRAIN_PARTS } from "./brain-data";

// the real-time 3D brain (three.js) loads only on this page, only in the browser
const Brain3D = dynamic(() => import("./brain-3d"), { ssr: false, loading: () => <div className="b3-load">Loading 3D brain…</div> });
const DEEP_IDS = new Set(["insula", "cingulate", "amygdala", "hippocampus", "hypothalamus", "pituitary", "thalamus", "basal", "callosum"]);

/* Brain Explorer (2026-11-21) — a therapist resource for psychoeducation. Two views of one brain (outside:
   the lobes; inside: a midline cut showing the deep parts), tap any part for what it does, what changes in
   common difficulties, a plain line to say to a client and how therapy works with it. "Stress response" and
   "Calming down" play the parts in order (the 4th dimension — time). "Show to client" opens a big, simple card
   for screen-sharing. The brain itself is real-time 3D (brain-3d.js, three.js), loaded only on this page. */

const BY_ID = Object.fromEntries(BRAIN_PARTS.map((p) => [p.id, p]));
const colorOf = (id) => BY_ID[id]?.color || BRAIN_GROUPS[BY_ID[id]?.group]?.color || "#94a3b8";

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

export default function BrainExplorer() {
  const [view, setView] = useState("outside");
  const [sel, setSel] = useState("amygdala");
  const [story, setStory] = useState(null); // { key, i }
  const [present, setPresent] = useState(false);
  const panelRef = useRef(null);
  const part = BY_ID[sel];
  const step = story ? STORIES[story.key].steps[story.i] : null;

  const [label, setLabel] = useState(null);
  const colors = useRef(Object.fromEntries(BRAIN_PARTS.map((p) => [p.id, colorOf(p.id)]))).current;
  const onLabel = useCallback((l) => setLabel((o) => (o && o.id === l.id && Math.abs(o.x - l.x) < 0.5 && Math.abs(o.y - l.y) < 0.5 && o.behind === l.behind ? o : l)), []);
  const pick3d = useCallback((id) => { setStory(null); setSel(id); setView(DEEP_IDS.has(id) ? "inside" : "outside"); }, []);
  const pick = (id, scroll = false) => {
    setStory(null);
    setSel(id);
    setView(DEEP_IDS.has(id) ? "inside" : "outside");
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
              <button type="button" role="tab" aria-selected={view === "outside"} className={view === "outside" ? "on" : ""} onClick={() => { setStory(null); setView("outside"); }}>Surface</button>
              <button type="button" role="tab" aria-selected={view === "inside"} className={view === "inside" ? "on" : ""} onClick={() => { setStory(null); setView("inside"); }}>X-ray</button>
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
            <Brain3D colors={colors} selected={sel} hot={step?.id} cool={step?.cool} dim={step?.dim} xray={view === "inside"} onPick={pick3d} onLabel={onLabel} />
            {label && !label.behind && BY_ID[label.id] && (
              <span className="b3-label" style={{ left: label.x, top: label.y, "--c": colorOf(label.id) }}><i />{BY_ID[label.id].name}</span>
            )}
          </div>
          {story ? (
            <div className={`be-cap ${story.key}`} role="status" aria-live="polite">
              <b>{STORIES[story.key].label}</b>
              <p>{step.t}</p>
              <div className="be-cap-dots">{STORIES[story.key].steps.map((s, i) => <button type="button" key={s.id + i} className={i === story.i ? "on" : ""} onClick={() => setStory({ key: story.key, i })} aria-label={`Step ${i + 1}`} />)}</div>
            </div>
          ) : (
            <p className="be-tip">{view === "outside" ? "Drag to turn the brain, pinch or scroll to zoom, tap a part. Switch to X-ray to see the parts deep inside." : "X-ray: the outer cortex is see-through so the deep parts show. Tap one to learn about it."}</p>
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
                  {p.name}
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
            <span className="be-show-ic" aria-hidden="true">🧠</span>
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
.be-canvas { position: relative; margin: 6px 0 4px; border-radius: 18px; overflow: hidden; background: radial-gradient(circle at 50% 42%, #ffffff 0, #eef3f8 55%, #dfe7f1 100%); }
.b3-mount { width: 100%; height: clamp(340px, 52vh, 520px); touch-action: none; cursor: grab; }
.b3-mount:active { cursor: grabbing; }
.b3-mount canvas { display: block; outline: none; }
.b3-load { height: clamp(340px, 52vh, 520px); display: grid; place-items: center; color: #8e8e93; font-size: 14px; font-weight: 700; }
.b3-label { position: absolute; transform: translate(-50%, calc(-100% - 14px)); pointer-events: none; white-space: nowrap; display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 11px; border-radius: 999px; background: rgba(255,255,255,.94); box-shadow: 0 8px 20px -10px rgba(0,0,0,.45); font-size: 13px; font-weight: 800; color: #1c1c1e; border: 1.5px solid var(--c); }
.b3-label i { width: 8px; height: 8px; border-radius: 50%; background: var(--c); }
.b3-label::after { content: ""; position: absolute; left: 50%; bottom: -12px; width: 2px; height: 11px; background: var(--c); transform: translateX(-50%); }
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
.be-show-ic { display: inline-grid; place-items: center; width: 76px; height: 76px; margin-top: 6px; border-radius: 24px; font-size: 40px; background: color-mix(in srgb, var(--c) 18%, #fff); }
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
