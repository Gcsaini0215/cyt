/* Breathing sounds for /breathe, made live with the Web Audio API (nothing to download):
   - the breath itself: filtered noise shaped like air through the nose (in) and a warm "haaa" (out); a hum for
     Bhramari, an "fff" through pursed lips, silence while holding
   - a soft singing-bowl tone when the phase changes
   - a quiet nature bed that matches the scene: waves, rain, breeze, birds in the forest, crickets at night
   createBreathAudio() must be called from a tap (browsers only allow sound after the user acts). */

const noiseBuffer = (ctx, secs = 3) => {
  const b = ctx.createBuffer(1, ctx.sampleRate * secs, ctx.sampleRate);
  const d = b.getChannelData(0);
  // pink-ish noise: softer, more natural than white noise
  let b0 = 0, b1 = 0, b2 = 0;
  for (let i = 0; i < d.length; i++) {
    const w = Math.random() * 2 - 1;
    b0 = 0.99765 * b0 + w * 0.099046; b1 = 0.963 * b1 + w * 0.2965164; b2 = 0.57 * b2 + w * 1.0526913;
    d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.11;
  }
  return b;
};
const loopNoise = (ctx, buf) => { const s = ctx.createBufferSource(); s.buffer = buf; s.loop = true; s.start(); return s; };

export function createBreathAudio() {
  const AC = typeof window !== "undefined" && (window.AudioContext || window.webkitAudioContext);
  if (!AC) return null;
  const ctx = new AC();
  const buf = noiseBuffer(ctx);
  const master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);

  // ── breath voice: noise → band-pass → low-pass → gain ──
  const bSrc = loopNoise(ctx, buf);
  const bBand = ctx.createBiquadFilter(); bBand.type = "bandpass"; bBand.Q.value = 0.7; bBand.frequency.value = 900;
  const bLow = ctx.createBiquadFilter(); bLow.type = "lowpass"; bLow.frequency.value = 3000;
  const bGain = ctx.createGain(); bGain.gain.value = 0;
  const BREATH = 2.2, NATURE = 0.75; // the breath sits clearly above the nature bed
  const breathBus = ctx.createGain(); breathBus.gain.value = BREATH;
  bSrc.connect(bBand); bBand.connect(bLow); bLow.connect(bGain); bGain.connect(breathBus); breathBus.connect(master);
  // hum voice (Bhramari): a low buzz with a little vibrato
  const hum = ctx.createOscillator(); hum.type = "sawtooth"; hum.frequency.value = 138;
  const vib = ctx.createOscillator(); vib.frequency.value = 5; const vibG = ctx.createGain(); vibG.gain.value = 1.6; vib.connect(vibG); vibG.connect(hum.frequency);
  const humLow = ctx.createBiquadFilter(); humLow.type = "lowpass"; humLow.frequency.value = 520;
  const humGain = ctx.createGain(); humGain.gain.value = 0;
  hum.connect(humLow); humLow.connect(humGain); humGain.connect(breathBus); hum.start(); vib.start();

  // ── nature bed ──
  const natBus = ctx.createGain(); natBus.gain.value = 0; natBus.connect(master);
  let natNodes = [], timers = [];
  const clearNature = () => { natNodes.forEach((n) => { try { n.stop?.(); n.disconnect(); } catch (e) { /* gone */ } }); natNodes = []; timers.forEach(clearInterval); timers = []; };
  const lfo = (rate, depth, target, base) => {
    const o = ctx.createOscillator(); o.frequency.value = rate; const g = ctx.createGain(); g.gain.value = depth;
    o.connect(g); g.connect(target); if (base != null) target.value = base; o.start(); natNodes.push(o, g); return o;
  };
  const noiseBed = (type, freq, q, vol) => {
    const s = loopNoise(ctx, buf); const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = ctx.createGain(); g.gain.value = vol; s.connect(f); f.connect(g); g.connect(natBus); natNodes.push(s, f, g); return { f, g };
  };
  const chirp = (f1, f2, at, len, vol) => {
    const o = ctx.createOscillator(); o.type = "sine"; const g = ctx.createGain();
    o.frequency.setValueAtTime(f1, at); o.frequency.exponentialRampToValueAtTime(f2, at + len);
    g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(vol, at + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, at + len);
    o.connect(g); g.connect(natBus); o.start(at); o.stop(at + len + 0.05);
  };
  const birds = () => { // a short song now and then
    const t0 = ctx.currentTime + 0.05, base = 2600 + Math.random() * 1400, n = 2 + Math.floor(Math.random() * 4);
    for (let i = 0; i < n; i++) chirp(base, base * (1.15 + Math.random() * 0.3), t0 + i * 0.13, 0.09, 0.05);
  };
  const crickets = () => { const t0 = ctx.currentTime + 0.05; for (let i = 0; i < 3; i++) chirp(4400, 4300, t0 + i * 0.06, 0.035, 0.018); };
  const startNature = (scene) => {
    clearNature();
    if (scene === "ocean") { const w = noiseBed("lowpass", 520, 0.5, 0.35); lfo(0.085, 0.3, w.g.gain, 0.32); }
    else if (scene === "rain") { noiseBed("highpass", 900, 0.4, 0.12); noiseBed("lowpass", 400, 0.5, 0.08); }
    else if (scene === "night" || scene === "fireflies") {
      const w = noiseBed("bandpass", 320, 0.6, 0.06); lfo(0.05, 120, w.f.frequency, 320);
      timers.push(setInterval(() => { if (Math.random() < 0.7) crickets(); }, 900));
    } else {
      const w = noiseBed("bandpass", 420, 0.5, 0.09); lfo(0.06, 160, w.f.frequency, 420); lfo(0.04, 0.05, w.g.gain, 0.08);
      if (scene === "forest" || scene === "meadow" || scene === "sunrise") timers.push(setInterval(() => { if (Math.random() < 0.35) birds(); }, 2600));
    }
  };

  // soft singing-bowl tone
  const bell = () => {
    const t0 = ctx.currentTime;
    [[392, 0.05], [392 * 2.76, 0.018], [392 * 5.4, 0.008]].forEach(([f, v]) => {
      const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = f; const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(v, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.4);
      o.connect(g); g.connect(breathBus); o.start(t0); o.stop(t0 + 2.5);
    });
  };

  // shape one phase of breath (secs = how long the phase lasts)
  const phase = (ph, secs, opts = {}) => {
    const t0 = ctx.currentTime, end = t0 + Math.max(0.4, secs);
    const g = bGain.gain, fr = bBand.frequency, hg = humGain.gain;
    [g, fr, hg, bBand.Q].forEach((p) => p.cancelScheduledValues(t0));
    g.setValueAtTime(g.value, t0); hg.setValueAtTime(hg.value, t0); fr.setValueAtTime(fr.value, t0);
    if (opts.bell) bell();
    if (ph.a === "in") {
      // air through the nose: rises, brightens, eases off at the top
      bBand.Q.setValueAtTime(0.9, t0);
      fr.linearRampToValueAtTime(700, t0 + 0.05); fr.linearRampToValueAtTime(1500, end);
      g.linearRampToValueAtTime(0.0, t0 + 0.02);
      g.linearRampToValueAtTime(secs < 1.6 ? 0.26 : 0.2, t0 + Math.min(0.6, secs * 0.35));
      g.linearRampToValueAtTime(0.16, end - Math.min(0.4, secs * 0.2));
      g.linearRampToValueAtTime(0.0, end);
      hg.linearRampToValueAtTime(0, t0 + 0.1);
    } else if (ph.a === "out" && ph.hum) {
      // Bhramari: the hum, with a little air
      hg.linearRampToValueAtTime(0.05, t0 + 0.4); hg.linearRampToValueAtTime(0.045, end - 0.6); hg.linearRampToValueAtTime(0, end);
      fr.linearRampToValueAtTime(500, t0 + 0.1); g.linearRampToValueAtTime(0.04, t0 + 0.3); g.linearRampToValueAtTime(0, end);
    } else if (ph.a === "out") {
      const pursed = opts.tech === "pursed";
      // a warm "haaa" (or a narrow "fff" through pursed lips), fading slowly
      bBand.Q.setValueAtTime(pursed ? 2.2 : 0.6, t0);
      fr.linearRampToValueAtTime(pursed ? 2600 : 1100, t0 + 0.05); fr.linearRampToValueAtTime(pursed ? 2200 : 480, end);
      g.linearRampToValueAtTime(pursed ? 0.2 : 0.28, t0 + 0.25);
      g.linearRampToValueAtTime(pursed ? 0.14 : 0.12, t0 + secs * 0.7);
      g.linearRampToValueAtTime(0.0, end);
      hg.linearRampToValueAtTime(0, t0 + 0.1);
    } else {
      g.linearRampToValueAtTime(0, t0 + 0.15); hg.linearRampToValueAtTime(0, t0 + 0.15); // hold: quiet
    }
  };

  let scene = "lake";
  return {
    start(sc, { breath = true, nature = true } = {}) {
      scene = sc; ctx.resume?.();
      breathBus.gain.value = breath ? BREATH : 0;
      startNature(scene);
      natBus.gain.cancelScheduledValues(ctx.currentTime);
      natBus.gain.setValueAtTime(0, ctx.currentTime); natBus.gain.linearRampToValueAtTime(nature ? NATURE : 0, ctx.currentTime + 2);
    },
    phase,
    setBreath(on) { breathBus.gain.setTargetAtTime(on ? BREATH : 0, ctx.currentTime, 0.1); },
    setNature(on) { natBus.gain.setTargetAtTime(on ? NATURE : 0, ctx.currentTime, 0.4); },
    pause() { try { ctx.suspend(); } catch (e) { /* ignore */ } },
    resume() { try { ctx.resume(); } catch (e) { /* ignore */ } },
    // fade everything out and free the audio
    stop() {
      const t = ctx.currentTime;
      try { master.gain.setTargetAtTime(0, t, 0.5); } catch (e) { /* ignore */ }
      setTimeout(() => { clearNature(); try { ctx.close(); } catch (e) { /* ignore */ } }, 1800);
    },
  };
}
