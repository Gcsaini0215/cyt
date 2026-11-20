import React, { useCallback, useEffect, useRef, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

/* /breathe — full-page guided breathing (2026-11-20, owner's request: no pop-up, nothing else on screen, only a
   Back button). /breathe lists the techniques; /breathe?p=<key> opens one. While it runs only the breathing
   visual, the cue and a pause button show. Gentle tones on each phase (can be muted), vibration on phones (opt-in),
   the screen stays awake while it runs. Standard techniques, our own wording. */

const T = [
  { key: "box", name: "Box breathing", best: "Stress & focus", c: ["#14b8a6", "#0f766e", "#042f2e"], visual: "square",
    about: "Four equal sides — in, hold, out, hold. Used by athletes and the armed forces to stay calm under pressure.",
    phases: [{ a: "in", s: 4 }, { a: "hold", s: 4 }, { a: "out", s: 4 }, { a: "hold", s: 4, label: "Hold, empty" }] },
  { key: "478", name: "4-7-8 breathing", best: "Sleep & anger", c: ["#818cf8", "#4338ca", "#1e1b4b"], visual: "orb",
    about: "A long hold and an even longer breath out. Slows the body down — good in bed or before you react.",
    phases: [{ a: "in", s: 4, hint: "quietly, through your nose" }, { a: "hold", s: 7 }, { a: "out", s: 8, hint: "through your mouth, with a soft whoosh" }] },
  { key: "sigh", name: "Physiological sigh", best: "Fast stress relief", c: ["#38bdf8", "#0369a1", "#082f49"], visual: "orb",
    about: "Two breaths in through the nose, then one long breath out. The quickest way to let tension go.",
    phases: [{ a: "in", s: 2, to: 0.75, hint: "a deep breath through your nose" }, { a: "in", s: 1, label: "Sip in more", hint: "a short top-up breath" }, { a: "out", s: 6, hint: "slowly, all the way out through your mouth" }] },
  { key: "coherent", name: "Coherent breathing", best: "Calm heart & balance", c: ["#4ade80", "#15803d", "#052e16"], visual: "orb",
    about: "Slow, even breaths — about six a minute. Helps the heart and mind settle into a steady rhythm.",
    phases: [{ a: "in", s: 5 }, { a: "out", s: 5 }] },
  { key: "exhale", name: "Long exhale", best: "Anxiety", c: ["#c084fc", "#7e22ce", "#3b0764"], visual: "orb",
    about: "Breathing out for longer than you breathe in tells your body it's safe to relax.",
    phases: [{ a: "in", s: 4 }, { a: "out", s: 6, hint: "longer and slower than the breath in" }] },
  { key: "triangle", name: "Triangle breathing", best: "Easy start", c: ["#fb923c", "#c2410c", "#431407"], visual: "triangle",
    about: "Three equal steps — a gentle start if you're new to breathing exercises.",
    phases: [{ a: "in", s: 4 }, { a: "hold", s: 4 }, { a: "out", s: 4 }] },
  { key: "anulom", name: "Anulom Vilom", best: "Balance & clear mind", c: ["#fbbf24", "#b45309", "#451a03"], visual: "nostril",
    about: "Alternate-nostril breathing from yoga. Use your right thumb and ring finger to close one side at a time.",
    phases: [
      { a: "in", s: 4, side: "L", label: "In — left nostril", hint: "close the right side with your thumb" },
      { a: "out", s: 6, side: "R", label: "Out — right nostril", hint: "close the left side, open the right" },
      { a: "in", s: 4, side: "R", label: "In — right nostril", hint: "keep the left side closed" },
      { a: "out", s: 6, side: "L", label: "Out — left nostril", hint: "close the right side, open the left" },
    ] },
  { key: "bhramari", name: "Bhramari (humming bee)", best: "Racing thoughts", c: ["#f472b6", "#be185d", "#500724"], visual: "hum",
    about: "Breathe in, then hum softly like a bee as you breathe out. The hum quietens a busy mind.",
    phases: [{ a: "in", s: 4 }, { a: "out", s: 8, hum: true, label: "Hum… mmm", hint: "a soft, steady hum, lips closed" }] },
  { key: "pursed", name: "Pursed-lip breathing", best: "Feeling breathless", c: ["#22d3ee", "#0e7490", "#083344"], visual: "orb",
    about: "In through the nose, out slowly through pursed lips — as if blowing gently on hot chai.",
    phases: [{ a: "in", s: 2, hint: "through your nose" }, { a: "out", s: 4, hint: "slowly, through pursed lips" }] },
];
const BY = Object.fromEntries(T.map((t) => [t.key, t]));
const WORD = { in: "Breathe in", hold: "Hold", out: "Breathe out" };
const cycleOf = (t) => t.phases.reduce((n, p) => n + p.s, 0);
const ease = (x) => 0.5 - Math.cos(Math.PI * x) / 2;
const pattern = (t) => t.phases.map((p) => p.s).join(" · ");

// where we are: phase index, progress in it (0..1), seconds left, lung level (0 = empty, 1 = full)
function stateAt(t, ms) {
  const cyc = cycleOf(t) * 1000;
  const inCycle = ms % cyc;
  let acc = 0, level = 0;
  for (let i = 0; i < t.phases.length; i++) {
    const p = t.phases[i], len = p.s * 1000;
    const to = p.to ?? (p.a === "in" ? 1 : p.a === "out" ? 0 : level);
    if (inCycle < acc + len) {
      const prog = (inCycle - acc) / len;
      return { i, prog, left: Math.ceil((len - (inCycle - acc)) / 1000), level: level + (to - level) * ease(prog), round: Math.floor(ms / cyc) + 1 };
    }
    level = to; acc += len;
  }
  return { i: 0, prog: 0, left: t.phases[0].s, level: 0, round: 1 };
}

// soft tones: rising for in, falling for out, a low note for hold
function useTones() {
  const ctx = useRef(null);
  const start = () => { try { ctx.current = ctx.current || new (window.AudioContext || window.webkitAudioContext)(); ctx.current.resume?.(); } catch (e) { ctx.current = null; } };
  const play = (a) => {
    const c = ctx.current; if (!c) return;
    const o = c.createOscillator(), g = c.createGain(), now = c.currentTime;
    const [f1, f2] = a === "in" ? [262, 392] : a === "out" ? [392, 247] : [330, 330];
    o.type = "sine"; o.frequency.setValueAtTime(f1, now); o.frequency.exponentialRampToValueAtTime(f2, now + 0.6);
    g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(0.06, now + 0.08); g.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
    o.connect(g); g.connect(c.destination); o.start(now); o.stop(now + 0.95);
  };
  return { start, play };
}

function Visual({ t, st, running }) {
  const ph = t.phases[st.i];
  const scale = 0.5 + 0.5 * st.level;
  const orb = (
    <div className="br-orb" style={{ transform: `scale(${scale})` }}>
      <i className="br-glow" style={{ opacity: 0.35 + 0.5 * st.level }} />
      <i className="br-core" />
    </div>
  );
  if (t.visual === "square" || t.visual === "triangle") {
    const sq = t.visual === "square";
    const pts = sq ? [[20, 280], [20, 20], [280, 20], [280, 280]] : [[30, 270], [150, 30], [270, 270]];
    const a = pts[st.i % pts.length], b = pts[(st.i + 1) % pts.length];
    const x = a[0] + (b[0] - a[0]) * st.prog, y = a[1] + (b[1] - a[1]) * st.prog;
    return (
      <div className="br-vis">
        <svg viewBox="0 0 300 300" className="br-path" aria-hidden="true">
          <polygon points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke="rgba(255,255,255,.22)" strokeWidth="3" strokeLinejoin="round" />
          <line x1={a[0]} y1={a[1]} x2={x} y2={y} stroke="#fff" strokeWidth="4" strokeLinecap="round" />
          <circle cx={x} cy={y} r="11" fill="#fff" />
          <circle cx={x} cy={y} r="20" fill="rgba(255,255,255,.25)" />
        </svg>
        <div className="br-inner">{orb}</div>
      </div>
    );
  }
  return (
    <div className="br-vis">
      {t.visual === "hum" && ph.hum && running && <div className="br-ripples" aria-hidden="true"><i /><i /><i /></div>}
      {orb}
      {t.visual === "nostril" && (
        <>
          <span className={`br-side l${ph.side === "L" ? " on" : ""}`}>Left</span>
          <span className={`br-side r${ph.side === "R" ? " on" : ""}`}>Right</span>
        </>
      )}
    </div>
  );
}

function Session({ t, onPick }) {
  const [mins, setMins] = useState(t.key === "sigh" ? 1 : 3);
  const [run, setRun] = useState("idle"); // idle | on | paused | done
  const [ms, setMs] = useState(0);
  const [sound, setSound] = useState(true);
  const [buzz, setBuzz] = useState(false);
  const [felt, setFelt] = useState("");
  const raf = useRef(0), base = useRef(0), acc = useRef(0), lastPhase = useRef(-1), wake = useRef(null);
  const tones = useTones();
  const cyc = cycleOf(t) * 1000;
  const rounds = Math.max(1, Math.round((mins * 60000) / cyc));
  const total = rounds * cyc;
  const st = stateAt(t, Math.min(ms, total - 1));
  const ph = t.phases[st.i];

  const stopLoop = () => { cancelAnimationFrame(raf.current); try { wake.current?.release?.(); } catch (e) { /* ignore */ } wake.current = null; };
  const loop = useCallback(() => {
    const now = acc.current + (performance.now() - base.current);
    if (now >= total) { setMs(total); setRun("done"); stopLoop(); return; }
    setMs(now);
    raf.current = requestAnimationFrame(loop);
  }, [total]);
  useEffect(() => () => stopLoop(), []);
  // a cue on each new phase
  useEffect(() => {
    if (run !== "on") return;
    const key = st.round * 100 + st.i;
    if (key === lastPhase.current) return;
    lastPhase.current = key;
    if (sound) tones.play(ph.a);
    if (buzz && navigator.vibrate) navigator.vibrate(ph.a === "hold" ? 25 : 60);
  });
  const start = async () => {
    tones.start();
    if (run === "done" || run === "idle") { acc.current = 0; lastPhase.current = -1; setFelt(""); }
    base.current = performance.now();
    setRun("on");
    try { wake.current = await navigator.wakeLock?.request("screen"); } catch (e) { /* not allowed */ }
    raf.current = requestAnimationFrame(loop);
  };
  const pause = () => { acc.current += performance.now() - base.current; stopLoop(); setRun("paused"); };
  const reset = () => { stopLoop(); acc.current = 0; setMs(0); setRun("idle"); };
  const left = Math.max(0, Math.ceil((total - ms) / 1000));
  const running = run === "on";

  return (
    <div className={`br-s${running ? " running" : ""}`} style={{ "--c1": t.c[0], "--c2": t.c[1], "--c3": t.c[2] }}>
      {run !== "done" ? (
        <>
          <div className="br-head">
            <h1>{t.name}</h1>
            {!running && <p>{t.about}</p>}
            {!running && <span className="br-pat">{t.phases.map((p, i) => <em key={i}>{p.label || WORD[p.a]} {p.s}s</em>)}</span>}
          </div>
          <Visual t={t} st={run === "idle" ? { ...st, level: 0.35, prog: 0 } : st} running={running} />
          <div className="br-cue" aria-live="polite">
            {run === "idle" ? <b>Ready when you are</b> : <>
              <b>{ph.label || WORD[ph.a]}</b>
              <span className="br-num">{st.left}</span>
              {ph.hint && <small>{ph.hint}</small>}
            </>}
          </div>
          <div className="br-meta">
            {run !== "idle" && <span>Round {Math.min(st.round, rounds)} of {rounds} · {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")} left</span>}
          </div>
          <div className="br-ctl">
            {running ? <button type="button" className="br-main" onClick={pause}>Pause</button>
              : <button type="button" className="br-main" onClick={start}>{run === "paused" ? "Continue" : "Start"}</button>}
            {run === "paused" && <button type="button" className="br-ghost" onClick={reset}>Restart</button>}
          </div>
          {!running && run === "idle" && (
            <div className="br-opts">
              <div className="br-mins" role="radiogroup" aria-label="How long">
                {[1, 3, 5].map((m) => <button key={m} type="button" role="radio" aria-checked={mins === m} className={mins === m ? "on" : ""} onClick={() => setMins(m)}>{m} min</button>)}
              </div>
              <div className="br-tg">
                <button type="button" aria-pressed={sound} className={sound ? "on" : ""} onClick={() => setSound((x) => !x)}>{sound ? "🔔 Sound on" : "🔕 Sound off"}</button>
                <button type="button" aria-pressed={buzz} className={buzz ? "on" : ""} onClick={() => setBuzz((x) => !x)}>📳 Vibrate {buzz ? "on" : "off"}</button>
              </div>
              <p className="br-safe">Feel dizzy or uncomfortable? Stop and breathe normally.</p>
            </div>
          )}
          {!running && <Others current={t.key} onPick={onPick} />}
        </>
      ) : (
        <div className="br-done">
          <span className="br-done-ic" aria-hidden="true">🌿</span>
          <h1>Well done</h1>
          <p>You gave yourself {mins} calm minute{mins === 1 ? "" : "s"}. How do you feel now?</p>
          <div className="br-felt">
            {[["better", "😌", "Calmer"], ["same", "😐", "About the same"], ["worse", "😟", "Still not okay"]].map(([k, e, l]) => (
              <button key={k} type="button" className={felt === k ? "on" : ""} onClick={() => setFelt(k)}><span aria-hidden="true">{e}</span>{l}</button>
            ))}
          </div>
          {felt === "better" && <p className="br-say">Lovely. Come back any time — even one minute helps.</p>}
          {felt === "same" && <p className="br-say">That's okay. Try another technique, or a few more minutes of this one.</p>}
          {felt === "worse" && (
            <div className="br-help">
              <p>You don&apos;t have to handle this alone. Talking to someone can really help.</p>
              <a href="tel:18008914416" className="br-call">Call Tele-MANAS · 1800-89-14416 (free, 24×7)</a>
              <Link href="/therapy-for/anxiety" className="br-talk">Talk to a psychologist →</Link>
            </div>
          )}
          <div className="br-ctl">
            <button type="button" className="br-main" onClick={start}>Again</button>
          </div>
          <Others current={t.key} onPick={onPick} />
        </div>
      )}
    </div>
  );
}

function Others({ current, onPick }) {
  return (
    <div className="br-others">
      <p>Other breathing exercises</p>
      <div className="br-strip">
        {T.filter((x) => x.key !== current).map((x) => (
          <button key={x.key} type="button" onClick={() => onPick(x.key)} style={{ "--c1": x.c[0], "--c2": x.c[1] }}>
            <i aria-hidden="true" /><b>{x.name}</b><small>{x.best}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function BreathePage() {
  const router = useRouter();
  const key = typeof router.query.p === "string" ? router.query.p : "";
  const t = BY[key] || null;
  const pick = (k) => router.push({ pathname: "/breathe", query: { p: k } }, undefined, { shallow: true, scroll: true });
  const back = () => { if (typeof window !== "undefined" && window.history.length > 1) router.back(); else router.push("/"); };
  return (
    <>
      <Head>
        <title>{t ? `${t.name} — guided breathing | Choose Your Therapist` : "Guided breathing exercises | Choose Your Therapist"}</title>
        <meta name="description" content="Free guided breathing exercises — box breathing, 4-7-8, physiological sigh, Anulom Vilom, Bhramari and more. Calm your mind in one to five minutes." />
        <link rel="canonical" href="https://www.chooseyourtherapist.in/breathe" />
        <meta name="theme-color" content={t ? t.c[2] : "#042f2e"} />
      </Head>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <main className="br" style={t ? { "--c1": t.c[0], "--c2": t.c[1], "--c3": t.c[2] } : undefined}>
        <i className="br-blob a" aria-hidden="true" /><i className="br-blob b" aria-hidden="true" />
        <button type="button" className="br-back" onClick={back} aria-label="Go back">← Back</button>
        {t ? <Session key={t.key} t={t} onPick={pick} /> : (
          <div className="br-list">
            <h1>Breathe</h1>
            <p>Pick one and follow the circle. A minute or two is enough to feel a difference.</p>
            <div className="br-grid">
              {T.map((x) => (
                <button key={x.key} type="button" onClick={() => pick(x.key)} style={{ "--c1": x.c[0], "--c2": x.c[1] }}>
                  <i aria-hidden="true" />
                  <b>{x.name}</b>
                  <small>{x.best}</small>
                  <em>{pattern(x)}</em>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}

const CSS = `
html, body { background: #042f2e; }
.br { --c1: #14b8a6; --c2: #0f766e; --c3: #042f2e; position: relative; min-height: 100vh; min-height: 100dvh; overflow: hidden; color: #fff; font-family: inherit;
  background: radial-gradient(120% 80% at 50% 0%, var(--c2) 0%, var(--c3) 70%); transition: background .8s ease;
  padding: calc(64px + env(safe-area-inset-top, 0px)) 20px calc(28px + env(safe-area-inset-bottom, 0px)); box-sizing: border-box; }
.br * { box-sizing: border-box; }
.br-blob { position: absolute; border-radius: 50%; filter: blur(60px); opacity: .35; pointer-events: none; z-index: 0; background: var(--c1); }
.br-blob.a { width: 380px; height: 380px; top: -120px; right: -120px; animation: brFloat 18s ease-in-out infinite; }
.br-blob.b { width: 300px; height: 300px; bottom: -100px; left: -100px; background: var(--c2); animation: brFloat 22s ease-in-out infinite reverse; }
@keyframes brFloat { 50% { transform: translate(-40px, 30px) scale(1.1); } }
.br-back { position: fixed; z-index: 5; top: calc(14px + env(safe-area-inset-top, 0px)); left: 14px; height: 40px; padding: 0 16px; border-radius: 999px; border: 1px solid rgba(255,255,255,.25);
  background: rgba(255,255,255,.12); color: #fff; font: inherit; font-size: 15px; font-weight: 700; cursor: pointer; -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); }
.br-back:hover { background: rgba(255,255,255,.2); }
.br-list, .br-s { position: relative; z-index: 1; max-width: 920px; margin: 0 auto; }
.br-list h1 { margin: 6px 0 6px; font-size: clamp(34px, 5vw, 52px); font-weight: 800; letter-spacing: -.03em; color: #fff; }
.br-list > p { margin: 0 0 22px; font-size: 16px; color: rgba(255,255,255,.8); max-width: 52ch; }
.br-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.br-grid button { text-align: left; display: flex; flex-direction: column; gap: 4px; padding: 18px; border-radius: 22px; border: 1px solid rgba(255,255,255,.16); background: rgba(255,255,255,.08); color: #fff; font: inherit; cursor: pointer;
  -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); transition: transform .18s ease, background .18s ease; }
.br-grid button:hover { transform: translateY(-3px); background: rgba(255,255,255,.14); }
.br-grid i, .br-strip i { width: 44px; height: 44px; border-radius: 50%; margin-bottom: 8px; background: radial-gradient(circle at 35% 30%, #fff 0%, var(--c1) 40%, var(--c2) 100%); box-shadow: 0 0 24px var(--c1); animation: brMini 5s ease-in-out infinite; }
@keyframes brMini { 50% { transform: scale(.8); } }
.br-grid b { font-size: 17px; font-weight: 800; }
.br-grid small { font-size: 13px; color: rgba(255,255,255,.75); }
.br-grid em { margin-top: 6px; font-style: normal; font-size: 12.5px; font-weight: 800; letter-spacing: .06em; color: rgba(255,255,255,.9); }

.br-s { display: flex; flex-direction: column; align-items: center; text-align: center; }
.br-head h1 { margin: 0; font-size: clamp(26px, 4vw, 38px); font-weight: 800; letter-spacing: -.02em; color: #fff; }
.br-head p { margin: 8px auto 0; max-width: 48ch; font-size: 15px; line-height: 1.55; color: rgba(255,255,255,.82); }
.br-pat { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; margin-top: 12px; }
.br-pat em { font-style: normal; font-size: 12.5px; font-weight: 700; padding: 4px 10px; border-radius: 999px; background: rgba(255,255,255,.12); }
.br-s.running .br-head h1 { font-size: 18px; opacity: .7; }

.br-vis { position: relative; width: min(74vw, 340px); aspect-ratio: 1; margin: 26px auto 10px; display: grid; place-items: center; }
.br-s.running .br-vis { width: min(84vw, 400px); margin-top: 6vh; }
.br-orb { position: relative; width: 78%; aspect-ratio: 1; transition: transform .12s linear; will-change: transform; }
.br-glow { position: absolute; inset: -18%; border-radius: 50%; background: radial-gradient(circle, var(--c1) 0%, transparent 68%); }
.br-core { position: absolute; inset: 0; border-radius: 50%; background: radial-gradient(circle at 35% 30%, rgba(255,255,255,.95) 0%, var(--c1) 38%, var(--c2) 100%);
  box-shadow: inset 0 -20px 40px rgba(0,0,0,.18), 0 20px 60px -10px var(--c1); }
.br-path { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.br-inner { position: absolute; inset: 22%; display: grid; place-items: center; }
.br-inner .br-orb { width: 100%; }
.br-side { position: absolute; top: 50%; transform: translateY(-50%); font-size: 13px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; padding: 8px 12px; border-radius: 999px;
  background: rgba(255,255,255,.1); color: rgba(255,255,255,.55); transition: all .3s ease; }
.br-side.l { left: -6px; } .br-side.r { right: -6px; }
.br-side.on { background: #fff; color: var(--c3); box-shadow: 0 0 24px rgba(255,255,255,.6); }
.br-ripples { position: absolute; inset: 0; display: grid; place-items: center; }
.br-ripples i { position: absolute; width: 60%; aspect-ratio: 1; border-radius: 50%; border: 2px solid rgba(255,255,255,.5); animation: brRipple 2.4s ease-out infinite; }
.br-ripples i:nth-child(2) { animation-delay: .8s; } .br-ripples i:nth-child(3) { animation-delay: 1.6s; }
@keyframes brRipple { from { transform: scale(.9); opacity: .8; } to { transform: scale(1.7); opacity: 0; } }

.br-cue { min-height: 110px; display: flex; flex-direction: column; align-items: center; gap: 2px; }
.br-cue b { font-size: clamp(24px, 4vw, 32px); font-weight: 800; letter-spacing: -.01em; }
.br-num { font-size: 44px; font-weight: 300; line-height: 1.1; font-variant-numeric: tabular-nums; opacity: .9; }
.br-cue small { font-size: 14px; color: rgba(255,255,255,.8); }
.br-meta { min-height: 22px; font-size: 13px; color: rgba(255,255,255,.7); font-variant-numeric: tabular-nums; }
.br-ctl { display: flex; gap: 10px; justify-content: center; margin: 14px 0 6px; }
.br-main { min-width: 160px; height: 52px; padding: 0 26px; border-radius: 999px; border: 0; background: #fff; color: var(--c3); font: inherit; font-size: 17px; font-weight: 800; cursor: pointer; box-shadow: 0 14px 30px -12px rgba(0,0,0,.5); transition: transform .15s ease; }
.br-main:active { transform: scale(.97); }
.br-ghost { height: 52px; padding: 0 22px; border-radius: 999px; border: 1px solid rgba(255,255,255,.35); background: transparent; color: #fff; font: inherit; font-size: 16px; font-weight: 700; cursor: pointer; }
.br-opts { display: flex; flex-direction: column; align-items: center; gap: 10px; margin-top: 8px; }
.br-mins, .br-tg { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
.br-mins button, .br-tg button { height: 38px; padding: 0 14px; border-radius: 999px; border: 1px solid rgba(255,255,255,.25); background: rgba(255,255,255,.08); color: #fff; font: inherit; font-size: 14px; font-weight: 700; cursor: pointer; }
.br-mins button.on { background: #fff; color: var(--c3); border-color: #fff; }
.br-tg button.on { background: rgba(255,255,255,.2); }
.br-safe { margin: 4px 0 0; font-size: 12.5px; color: rgba(255,255,255,.65); }

.br-others { width: 100%; margin-top: 30px; text-align: left; }
.br-others > p { margin: 0 0 10px; font-size: 12px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: rgba(255,255,255,.6); }
.br-strip { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 6px; scrollbar-width: none; }
.br-strip::-webkit-scrollbar { display: none; }
.br-strip button { flex: none; width: 160px; text-align: left; display: flex; flex-direction: column; gap: 2px; padding: 14px; border-radius: 18px; border: 1px solid rgba(255,255,255,.15); background: rgba(255,255,255,.08); color: #fff; font: inherit; cursor: pointer; }
.br-strip i { width: 32px; height: 32px; margin-bottom: 6px; }
.br-strip b { font-size: 14px; font-weight: 800; }
.br-strip small { font-size: 12px; color: rgba(255,255,255,.7); }

.br-done { width: 100%; display: flex; flex-direction: column; align-items: center; padding-top: 6vh; }
.br-done-ic { font-size: 54px; }
.br-done h1 { margin: 8px 0 4px; font-size: 36px; font-weight: 800; color: #fff; }
.br-done > p { max-width: 100%; text-align: center; margin: 0 0 18px; font-size: 16px; color: rgba(255,255,255,.85); }
.br-felt { width: 100%; max-width: 380px; display: flex; gap: 8px; justify-content: center; }
.br-felt button { flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 14px 8px; border-radius: 18px; border: 1px solid rgba(255,255,255,.2); background: rgba(255,255,255,.08); color: #fff; font: inherit; font-size: 13.5px; font-weight: 700; cursor: pointer; }
.br-felt button span { font-size: 30px; }
.br-felt button.on { background: #fff; color: var(--c3); }
.br-say { margin: 16px 0 0; font-size: 15px; color: rgba(255,255,255,.9); }
.br-help { width: 100%; box-sizing: border-box; text-align: center; margin-top: 16px; display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 16px 18px; border-radius: 18px; background: rgba(0,0,0,.2); max-width: 420px; }
.br-help p { margin: 0; font-size: 15px; }
.br-call { color: #fff !important; font-weight: 800; text-decoration: underline; text-underline-offset: 3px; }
.br-talk { display: inline-flex; align-items: center; height: 44px; padding: 0 18px; border-radius: 12px; background: #ecc77d; color: #3b2604 !important; font-weight: 800; text-decoration: none !important; }

@media (max-width: 760px) { .br-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .br-grid button { padding: 14px; } .br-grid b { font-size: 15px; } }
@media (prefers-reduced-motion: reduce) { .br-blob, .br-grid i, .br-strip i { animation: none; } }
`;
