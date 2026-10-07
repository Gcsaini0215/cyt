import React, { useEffect, useRef, useState } from "react";

// Small self-help tools shared by the home "How are you feeling?" section and the
// /wellness-toolkit page: guided breathing, 5-4-3-2-1 grounding, an SOS sequence (with the
// Tele-MANAS helpline) and calming sounds generated in the browser (Web Audio — no files).
// No MUI here so the home page stays light; this file is only loaded when a tool opens.

export const HELPLINE = { name: "Tele-MANAS", number: "1800-89-14416", tel: "tel:18008914416" };

/* ── Guided breathing ─────────────────────────────────────────────────────── */
const PATTERNS = {
  box: { label: "Box breathing", hint: "4 in · 4 hold · 4 out · 4 hold", steps: [["Breathe in", 4, 1], ["Hold", 4, 1], ["Breathe out", 4, 0.55], ["Hold", 4, 0.55]] },
  "478": { label: "4-7-8 calm-down", hint: "4 in · 7 hold · 8 out", steps: [["Breathe in", 4, 1], ["Hold", 7, 1], ["Breathe out", 8, 0.55]] },
};

export function BreathingTool({ pattern: initial = "box" }) {
  const [pattern, setPattern] = useState(initial);
  const [minutes, setMinutes] = useState(1);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [el, setEl] = useState(0); // seconds since start — step and countdowns are derived from it
  const p = PATTERNS[pattern];
  const cycle = p.steps.reduce((a, s) => a + s[1], 0);
  const totalSecs = minutes * 60;

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setEl((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, [running]);
  useEffect(() => { if (running && el >= totalSecs) { setRunning(false); setDone(true); } }, [running, el, totalSecs]);

  let pos = el % cycle, step = 0;
  while (pos >= p.steps[step][1]) { pos -= p.steps[step][1]; step++; }
  const [label, secs, scale] = p.steps[step];
  const left = secs - pos;
  const total = Math.max(0, totalSecs - el);
  const start = () => { setEl(0); setDone(false); setRunning(true); };

  return (
    <div className="qt-breath">
      {!running && (
        <div className="qt-opts">
          <div className="qt-seg" role="group" aria-label="Pattern">
            {Object.entries(PATTERNS).map(([k, v]) => (
              <button key={k} type="button" className={pattern === k ? "on" : ""} onClick={() => setPattern(k)}>{v.label}</button>
            ))}
          </div>
          <div className="qt-seg" role="group" aria-label="Length">
            {[1, 3, 5].map((m) => <button key={m} type="button" className={minutes === m ? "on" : ""} onClick={() => setMinutes(m)}>{m} min</button>)}
          </div>
        </div>
      )}
      <div className="qt-circle-wrap" aria-live="polite">
        <div className="qt-circle" style={{ transform: `scale(${running ? scale : 0.7})`, transitionDuration: `${running ? secs : 0.4}s` }} />
        <div className="qt-circle-txt">
          {running ? <><b>{label}</b><span>{left}</span></> : done ? <b>Well done</b> : <b>Ready</b>}
        </div>
      </div>
      <p className="qt-hint">{running ? `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")} left` : p.hint}</p>
      {running
        ? <button type="button" className="qt-btn ghost" onClick={() => { setRunning(false); setEl(0); }}>Stop</button>
        : <button type="button" className="qt-btn" onClick={start}>{done ? "Go again" : "Start"}</button>}
      {done && <p className="qt-after">Notice how your body feels now. Even one minute of slow breathing can calm the nervous system.</p>}
    </div>
  );
}

/* ── 5-4-3-2-1 grounding ──────────────────────────────────────────────────── */
const GROUND = [
  [5, "things you can see", "Look around slowly. Name them in your head — a lamp, a cup, the colour of a wall."],
  [4, "things you can feel", "Your feet on the floor, your clothes, the chair under you, the air on your skin."],
  [3, "things you can hear", "A fan, traffic, birds, your own breathing."],
  [2, "things you can smell", "Or two smells you like, if nothing is around."],
  [1, "thing you can taste", "Or take one slow sip of water."],
];
export function GroundingTool() {
  const [i, setI] = useState(0);
  const end = i >= GROUND.length;
  return (
    <div className="qt-ground">
      <div className="qt-dots" aria-hidden="true">{GROUND.map((_, k) => <span key={k} className={k < i ? "done" : k === i ? "on" : ""} />)}</div>
      {!end ? (
        <>
          <div className="qt-big">{GROUND[i][0]}</div>
          <h4>{GROUND[i][1]}</h4>
          <p>{GROUND[i][2]}</p>
          <div className="qt-row">
            {i > 0 && <button type="button" className="qt-btn ghost" onClick={() => setI(i - 1)}>Back</button>}
            <button type="button" className="qt-btn" onClick={() => setI(i + 1)}>{i === GROUND.length - 1 ? "Finish" : "Next"}</button>
          </div>
        </>
      ) : (
        <>
          <h4>You're here, right now.</h4>
          <p>Grounding brings your attention back to the present when thoughts are racing. Use it any time.</p>
          <button type="button" className="qt-btn ghost" onClick={() => setI(0)}>Start again</button>
        </>
      )}
    </div>
  );
}

/* ── SOS: 30-second panic sequence + helpline ─────────────────────────────── */
const SOS_STEPS = [
  ["Breathe out slowly", "Longer out-breaths tell your body it is safe. In for 4… out for 6."],
  ["Look around", "Name 3 things you can see right now."],
  ["Feel your feet", "Press them into the floor. Notice the ground holding you."],
  ["This will pass", "Panic peaks and then fades — usually within minutes. You are safe."],
];
export function SosTool() {
  const [t, setT] = useState(null); // seconds left, null = not started
  useEffect(() => {
    if (t === null || t <= 0) return;
    const id = setTimeout(() => setT(t - 1), 1000);
    return () => clearTimeout(id);
  }, [t]);
  const idx = t === null ? 0 : Math.min(SOS_STEPS.length - 1, Math.floor((30 - t) / 7.5));
  return (
    <div className="qt-sos">
      {t === null ? (
        <>
          <p>A 30-second guided reset for a panic or anxiety attack. Follow the prompts on screen.</p>
          <button type="button" className="qt-btn sos" onClick={() => setT(30)}>Start 30-second SOS</button>
        </>
      ) : t > 0 ? (
        <div aria-live="polite">
          <div className="qt-sos-timer">{t}s</div>
          <div className="qt-bar"><i style={{ width: `${(t / 30) * 100}%` }} /></div>
          <h4>{SOS_STEPS[idx][0]}</h4>
          <p>{SOS_STEPS[idx][1]}</p>
          <button type="button" className="qt-btn ghost" onClick={() => setT(null)}>Stop</button>
        </div>
      ) : (
        <>
          <h4>Take a moment. How do you feel?</h4>
          <div className="qt-row">
            <button type="button" className="qt-btn ghost" onClick={() => setT(30)}>Do it again</button>
          </div>
        </>
      )}
      <div className="qt-help">
        <b>Still not okay, or thinking of harming yourself?</b>
        <span>Call <a href={HELPLINE.tel}>{HELPLINE.name} {HELPLINE.number}</a> — free, 24×7 — or go to your nearest hospital.</span>
      </div>
    </div>
  );
}

/* ── Calming sounds, made in the browser ──────────────────────────────────── */
export const SOUNDS = [
  { id: "rain", label: "Gentle rain" },
  { id: "waves", label: "Ocean waves" },
  { id: "wind", label: "Forest wind" },
  { id: "noise", label: "Soft brown noise" },
];

function noiseBuffer(ctx, kind) {
  const len = ctx.sampleRate * 4;
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    let last = 0, b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (kind === "brown") { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
      else { b0 = 0.99765 * b0 + w * 0.099046; b1 = 0.963 * b1 + w * 0.2965164; b2 = 0.57 * b2 + w * 1.0526913; d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.11; }
    }
  }
  return buf;
}

// builds the graph for one soundscape; returns the node to fade
function buildSound(ctx, id) {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx, id === "rain" ? "pink" : "brown");
  src.loop = true;
  const out = ctx.createGain();
  out.gain.value = 1;
  const lfo = (freq, depth, param) => {
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.frequency.value = freq; g.gain.value = depth; o.connect(g); g.connect(param); o.start();
    return o;
  };
  let tail = src;
  const extras = [];
  if (id === "rain") {
    const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 400;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 7000;
    src.connect(hp); hp.connect(lp); tail = lp;
  } else if (id === "waves") {
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 900;
    const swell = ctx.createGain(); swell.gain.value = 0.55;
    src.connect(lp); lp.connect(swell); tail = swell;
    extras.push(lfo(0.09, 0.45, swell.gain), lfo(0.09, 500, lp.frequency));
  } else if (id === "wind") {
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 500; bp.Q.value = 0.8;
    const gust = ctx.createGain(); gust.gain.value = 0.7;
    src.connect(bp); bp.connect(gust); tail = gust;
    extras.push(lfo(0.06, 300, bp.frequency), lfo(0.13, 0.3, gust.gain));
  } else {
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1200;
    src.connect(lp); tail = lp;
  }
  tail.connect(out);
  src.start();
  return { out, stop: () => { try { src.stop(); extras.forEach((o) => o.stop()); } catch {} } };
}

export function SoundsTool() {
  const ctxRef = useRef(null);
  const masterRef = useRef(null);
  const curRef = useRef(null);
  const timerRef = useRef(null);
  const [active, setActive] = useState(null);
  const [volume, setVolume] = useState(0.5);
  const [sleep, setSleep] = useState(0); // minutes, 0 = off

  const stopCurrent = (fade = 0.6) => {
    const cur = curRef.current;
    const ctx = ctxRef.current;
    if (!cur || !ctx) return;
    cur.out.gain.setTargetAtTime(0, ctx.currentTime, fade / 3);
    setTimeout(cur.stop, fade * 1000 + 100);
    curRef.current = null;
  };
  const play = (id) => {
    if (active === id) { stopCurrent(); setActive(null); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!ctxRef.current) {
      ctxRef.current = new AC();
      masterRef.current = ctxRef.current.createGain();
      masterRef.current.gain.value = volume;
      masterRef.current.connect(ctxRef.current.destination);
    }
    const ctx = ctxRef.current;
    if (ctx.state === "suspended") ctx.resume();
    stopCurrent();
    const s = buildSound(ctx, id);
    s.out.gain.value = 0;
    s.out.connect(masterRef.current);
    s.out.gain.setTargetAtTime(1, ctx.currentTime, 0.4);
    curRef.current = s;
    setActive(id);
  };
  useEffect(() => { if (masterRef.current) masterRef.current.gain.value = volume; }, [volume]);
  useEffect(() => {
    clearTimeout(timerRef.current);
    if (active && sleep) timerRef.current = setTimeout(() => { stopCurrent(3); setActive(null); }, sleep * 60000);
    return () => clearTimeout(timerRef.current);
  }, [active, sleep]);
  // stop and release the audio when the tool closes
  useEffect(() => () => { stopCurrent(0.2); setTimeout(() => ctxRef.current?.close?.(), 400); }, []);

  return (
    <div className="qt-sounds">
      <div className="qt-sound-grid">
        {SOUNDS.map((s) => (
          <button key={s.id} type="button" className={active === s.id ? "on" : ""} onClick={() => play(s.id)} aria-pressed={active === s.id}>
            <span className="qt-wave" aria-hidden="true">{[0, 1, 2, 3].map((k) => <i key={k} />)}</span>
            {s.label}
            <small>{active === s.id ? "Playing — tap to stop" : "Tap to play"}</small>
          </button>
        ))}
      </div>
      <label className="qt-vol">
        <span>Volume</span>
        <input type="range" min="0" max="1" step="0.05" value={volume} onChange={(e) => setVolume(Number(e.target.value))} />
      </label>
      <div className="qt-seg" role="group" aria-label="Sleep timer">
        {[0, 15, 30, 60].map((m) => <button key={m} type="button" className={sleep === m ? "on" : ""} onClick={() => setSleep(m)}>{m ? `${m} min` : "No timer"}</button>)}
      </div>
      <p className="qt-hint">Use headphones for focus, or a low volume to fall asleep.</p>
    </div>
  );
}

export const QT_CSS = `
.qt-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 46px; padding: 0 22px; border-radius: 12px; border: none; background: #1e7a4c; color: #fff; font-size: 15px; font-weight: 800; cursor: pointer; }
.qt-btn:hover { background: #186640; }
.qt-btn.ghost { background: #fff; color: #14532d; border: 1.5px solid #cfdcd4; }
.qt-btn.sos { background: #c2410c; width: 100%; height: 54px; font-size: 16.5px; }
.qt-btn.sos:hover { background: #9a3412; }
.qt-row { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
.qt-hint { font-size: 13px; color: #64748b; margin: 10px 0 14px; padding: 0; text-align: center; }
.qt-after { font-size: 13.5px; color: #475569; margin: 14px 0 0; padding: 0; text-align: center; line-height: 1.55; }
.qt-seg { display: inline-flex; padding: 3px; border-radius: 12px; background: #f1f5f3; gap: 2px; flex-wrap: wrap; justify-content: center; }
.qt-seg button { height: 34px; padding: 0 12px; border: none; border-radius: 9px; background: none; color: #475569; font-size: 13px; font-weight: 700; cursor: pointer; }
.qt-seg button.on { background: #fff; color: #14532d; box-shadow: 0 1px 4px rgba(0,0,0,.08); }

.qt-breath { text-align: center; }
.qt-opts { display: flex; flex-direction: column; align-items: center; gap: 8px; margin-bottom: 8px; }
.qt-circle-wrap { position: relative; width: 220px; height: 220px; margin: 14px auto 0; display: flex; align-items: center; justify-content: center; }
.qt-circle { position: absolute; inset: 0; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #dff1e6, #9fd3b4 70%, #6fbf93); box-shadow: 0 0 0 10px rgba(30,122,76,.08), 0 20px 40px -18px rgba(20,83,45,.5); transition-property: transform; transition-timing-function: ease-in-out; }
.qt-circle-txt { position: relative; display: flex; flex-direction: column; align-items: center; color: #14532d; }
.qt-circle-txt b { font-size: 19px; font-weight: 800; }
.qt-circle-txt span { font-size: 30px; font-weight: 800; line-height: 1.1; }

.qt-ground, .qt-sos { text-align: center; }
.qt-dots { display: flex; justify-content: center; gap: 6px; margin-bottom: 12px; }
.qt-dots span { width: 28px; height: 5px; border-radius: 999px; background: #e2e8e4; }
.qt-dots span.on { background: #d4a24c; } .qt-dots span.done { background: #1e7a4c; }
.qt-big { font-size: 64px; font-weight: 800; color: #1e7a4c; line-height: 1; }
.qt-ground h4, .qt-sos h4 { font-size: 20px; font-weight: 800; color: #0b1712; margin: 8px 0 6px; }
.qt-ground p, .qt-sos p { font-size: 14.5px; color: #475569; line-height: 1.6; margin: 0 auto 16px; padding: 0; max-width: 40ch; }
.qt-sos-timer { font-size: 54px; font-weight: 800; color: #c2410c; line-height: 1; }
.qt-bar { height: 6px; border-radius: 999px; background: #fde7d9; margin: 10px auto 14px; max-width: 300px; overflow: hidden; }
.qt-bar i { display: block; height: 100%; background: #c2410c; transition: width 1s linear; }
.qt-help { margin-top: 18px; padding: 12px 14px; border-radius: 12px; background: #fff7ed; border: 1px solid #fed7aa; text-align: left; font-size: 13.5px; line-height: 1.5; color: #7c2d12; display: flex; flex-direction: column; gap: 2px; }
.qt-help a { color: #9a3412; font-weight: 800; }

.qt-sounds { text-align: center; }
.qt-sound-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
.qt-sound-grid button { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 16px 10px; border-radius: 14px; border: 1.5px solid #e2e8e4; background: #f8faf9; color: #0b1712; font-size: 14.5px; font-weight: 800; cursor: pointer; }
.qt-sound-grid button small { font-size: 11.5px; font-weight: 600; color: #64748b; }
.qt-sound-grid button.on { border-color: #1e7a4c; background: #eef6f1; }
.qt-sound-grid button.on small { color: #1e7a4c; }
.qt-wave { display: inline-flex; align-items: flex-end; gap: 3px; height: 18px; margin-bottom: 4px; }
.qt-wave i { width: 4px; height: 6px; border-radius: 2px; background: #9fc9b0; }
.qt-sound-grid button.on .qt-wave i { background: #1e7a4c; animation: qtWave 1s ease-in-out infinite; }
.qt-sound-grid button.on .qt-wave i:nth-child(2) { animation-delay: .15s; } .qt-sound-grid button.on .qt-wave i:nth-child(3) { animation-delay: .3s; } .qt-sound-grid button.on .qt-wave i:nth-child(4) { animation-delay: .45s; }
@keyframes qtWave { 0%, 100% { height: 5px; } 50% { height: 18px; } }
.qt-vol { display: flex; align-items: center; gap: 10px; justify-content: center; margin-bottom: 12px; font-size: 13px; font-weight: 700; color: #475569; }
.qt-vol input { width: 180px; accent-color: #1e7a4c; }
@media (prefers-reduced-motion: reduce) { .qt-circle { transition-duration: 0s !important; } .qt-sound-grid button.on .qt-wave i { animation: none; height: 12px; } }
`;
