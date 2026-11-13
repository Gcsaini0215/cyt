/* Cycle & Mood Care (pages/client/cycle.js + components/client/cycle-card.js): cycle maths and the words used.
   Everything is an estimate from the client's own logs — never medical or contraception advice. */

export const TZ = "Asia/Kolkata";
export const istDay = (d = new Date()) => new Date(d).toLocaleDateString("en-CA", { timeZone: TZ });
const toMs = (day) => Date.parse(`${day}T00:00:00Z`);
export const addDays = (day, n) => new Date(toMs(day) + n * 86400000).toISOString().slice(0, 10);
export const diffDays = (a, b) => Math.round((toMs(a) - toMs(b)) / 86400000);
export const niceDay = (day, opts = { day: "numeric", month: "short" }) => new Date(`${day}T00:00:00Z`).toLocaleDateString("en-IN", { ...opts, timeZone: "UTC" });

export const FLOWS = [
  { v: 0, l: "None" }, { v: 1, l: "Spotting" }, { v: 2, l: "Light" }, { v: 3, l: "Medium" }, { v: 4, l: "Heavy" },
];
export const SYMPTOMS = [
  ["cramps", "Cramps"], ["headache", "Headache"], ["bloating", "Bloating"], ["tired", "Tired"], ["irritable", "Irritable"], ["anxious", "Anxious"],
  ["low", "Low mood"], ["cravings", "Cravings"], ["sleep", "Poor sleep"], ["breasts", "Tender breasts"], ["acne", "Acne"], ["backpain", "Back pain"],
];
export const GOALS = [
  ["pms", "Mood swings before my period (PMS)"],
  ["pmdd", "Very low mood, anger or anxiety before my period"],
  ["pain", "Period pain and the stress it brings"],
  ["pcos", "Irregular periods / PCOS stress"],
  ["body", "Body image and how I feel about myself"],
  ["fertility", "Stress about trying to conceive"],
  ["meno", "Perimenopause or menopause changes"],
  ["track", "I just want to track"],
];

export const PHASES = {
  menstrual: {
    name: "Period", color: "#e5476b", soft: "#fde8ee",
    feel: "Energy can be low and cramps can make you irritable or teary. That's normal.",
    tips: ["Rest without guilt — slower days are allowed.", "Warmth, water and gentle stretching help cramps.", "Say no to extra plans if you need to."],
  },
  follicular: {
    name: "Follicular", color: "#1e9e64", soft: "#e4f6ec",
    feel: "Many people feel lighter, more hopeful and more social after their period.",
    tips: ["A good time to start something new or plan your week.", "Notice what lifts your mood — write it down.", "Move your body in a way you enjoy."],
  },
  ovulation: {
    name: "Ovulation (est.)", color: "#7c5ce0", soft: "#efeafd",
    feel: "Confidence and energy are often at their highest around now.",
    tips: ["Use the energy for conversations you've been putting off.", "Keep some quiet time — high energy can tire you later.", "Stay hydrated."],
  },
  luteal: {
    name: "Luteal (pre-period)", color: "#e08a1e", soft: "#fdf1e0",
    feel: "Mood can dip in the days before a period — more irritable, anxious or low. You're not overreacting.",
    tips: ["Plan lighter days just before your period.", "Cut down caffeine and keep regular sleep.", "Tell people close to you how you feel — it helps."],
  },
};

// period start days: the client's set-up date + the first heavy-enough (light+) day of each logged run
export function periodStarts(profile, logs) {
  const flowDays = Object.keys(logs || {}).filter((d) => (logs[d]?.flow || 0) >= 2).sort();
  const starts = flowDays.filter((d) => !flowDays.includes(addDays(d, -1)) && !flowDays.includes(addDays(d, -2)));
  // the set-up date only counts when no logged period is near it (what's logged is more exact)
  if (profile?.lastStart && !starts.some((d) => Math.abs(diffDays(d, profile.lastStart)) < 10)) starts.push(profile.lastStart);
  const out = [];
  [...new Set(starts)].sort().forEach((d) => {
    const prev = out[out.length - 1];
    if (prev && diffDays(d, prev) < 10) return; // the same period, logged a little differently
    out.push(d);
  });
  return out;
}

export function cycleState(profile, logs, today = istDay()) {
  if (!profile?.enabled) return null;
  const starts = periodStarts(profile, logs).filter((d) => d <= today);
  const gaps = starts.slice(1).map((d, i) => diffDays(d, starts[i])).filter((g) => g >= 15 && g <= 60).slice(-6);
  const cycleLen = gaps.length ? Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length) : profile.cycleLen || 28;
  const periodLen = profile.periodLen || 5;
  const start = starts[starts.length - 1] || null;
  if (!start) return { cycleLen, periodLen, start: null, starts, gaps };
  const day = diffDays(today, start) + 1;
  const next = addDays(start, cycleLen);
  const late = day > cycleLen ? day - cycleLen : 0;
  return { cycleLen, periodLen, start, starts, gaps, day, next, late, inDays: Math.max(0, diffDays(next, today)), phase: phaseOf(day, cycleLen, periodLen) };
}

export function phaseOf(day, cycleLen = 28, periodLen = 5) {
  const ovu = Math.max(periodLen + 2, cycleLen - 14);
  if (day <= periodLen) return "menstrual";
  if (day < ovu - 1) return "follicular";
  if (day <= ovu + 1) return "ovulation";
  return "luteal";
}

// the phase a past day fell in (from the nearest start before it)
export function phaseOnDay(dayStr, st) {
  if (!st?.starts?.length) return null;
  const before = st.starts.filter((s) => s <= dayStr);
  const s = before[before.length - 1];
  if (!s) return null;
  const n = diffDays(dayStr, s) + 1;
  if (n > 60) return null;
  return phaseOf(n, st.cycleLen, st.periodLen);
}

// average mood per phase over the logged months → { menstrual: { avg, n }, … }
export function moodByPhase(moods, st) {
  const acc = {};
  Object.entries(moods || {}).forEach(([d, v]) => {
    const ph = phaseOnDay(d, st);
    if (!ph) return;
    acc[ph] = acc[ph] || { sum: 0, n: 0 };
    acc[ph].sum += v; acc[ph].n += 1;
  });
  return Object.fromEntries(Object.entries(acc).map(([k, a]) => [k, { avg: a.sum / a.n, n: a.n }]));
}
