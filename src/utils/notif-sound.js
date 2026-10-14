// Notification chime for the therapist portal, made with Web Audio (no sound file to load).
// Browsers only allow sound after the person has interacted with the page, so the audio is
// unlocked on the first tap / click / key press. "Off" is remembered per browser.

const PREF_KEY = "cyt_th_notif_sound";
let ctx = null;
let unlocked = false;

export const soundOn = () => { try { return localStorage.getItem(PREF_KEY) !== "off"; } catch (e) { return true; } };
export const setSoundOn = (on) => { try { localStorage.setItem(PREF_KEY, on ? "on" : "off"); } catch (e) { /* storage blocked */ } };

function getCtx() {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  return ctx;
}

export function unlockSound() {
  if (unlocked || typeof window === "undefined") return;
  const unlock = () => {
    const c = getCtx();
    if (c && c.state === "suspended") c.resume().catch(() => {});
    unlocked = true;
    ["pointerdown", "keydown", "touchstart"].forEach((e) => window.removeEventListener(e, unlock, true));
  };
  ["pointerdown", "keydown", "touchstart"].forEach((e) => window.addEventListener(e, unlock, true));
}

function tone(c, freq, start, dur, vol) {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(freq, start);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(vol, start + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  o.connect(g).connect(c.destination);
  o.start(start);
  o.stop(start + dur + 0.05);
}

// kind "urgent" (new booking, client waiting in the session) rings three rising notes; others two
export function playChime(kind = "normal", force = false) {
  if (!force && !soundOn()) return;
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") c.resume().catch(() => {});
  const t = c.currentTime + 0.02;
  if (kind === "urgent") {
    tone(c, 880, t, 0.22, 0.28);
    tone(c, 1108.7, t + 0.16, 0.22, 0.28);
    tone(c, 1318.5, t + 0.32, 0.45, 0.3);
  } else {
    tone(c, 987.8, t, 0.25, 0.22);
    tone(c, 1318.5, t + 0.14, 0.4, 0.22);
  }
}
