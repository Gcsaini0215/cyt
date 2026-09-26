// First open session slot for a therapist — the same rules as the booking page's slot grid
// (/book/[id]): 60-minute slots built from the weekly availability over the next 14 days,
// skipping slots that have already started today and ones that are booked.

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const SDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function toMinutes(t) {
  if (!t) return 0;
  const lower = t.trim().toLowerCase();
  const isPm = lower.endsWith("pm");
  const isAm = lower.endsWith("am");
  const [hStr, mStr] = lower.replace("am", "").replace("pm", "").trim().split(":");
  let h = parseInt(hStr, 10) || 0;
  const m = parseInt(mStr, 10) || 0;
  if (isPm && h !== 12) h += 12;
  if (isAm && h === 12) h = 0;
  return h * 60 + m;
}

function slotStarts(open, close, dur = 60) {
  const out = [];
  const end = toMinutes(close);
  for (let cur = toMinutes(open); cur + dur <= end; cur += dur) out.push(cur);
  return out;
}

const timeLabel = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};

/**
 * @param {Array<{day: string, times: {open: string, close: string}[]}>} availabilities
 * @param {Set<string>} bookedIso ISO start times already booked (from /booked-slots/:id)
 * @returns {{ date: Date, label: string } | null}
 */
export function nextOpenSlot(availabilities = [], bookedIso = new Set(), now = new Date()) {
  const nowMin = now.getHours() * 60 + now.getMinutes();
  for (let i = 0; i < 14; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const av = availabilities.find((a) => a.day === DAYS[d.getDay()]);
    if (!av?.times?.length) continue;
    const starts = [...new Set(av.times.flatMap((t) => slotStarts(t.open, t.close)))].sort((a, b) => a - b);
    for (const mins of starts) {
      if (i === 0 && mins <= nowMin) continue;
      const at = new Date(d);
      at.setHours(Math.floor(mins / 60), mins % 60, 0, 0);
      if (bookedIso.has(at.toISOString())) continue;
      const dayLabel = i === 0 ? "Today" : i === 1 ? "Tomorrow" : `${SDAYS[d.getDay()]} ${d.getDate()} ${MONS[d.getMonth()]}`;
      return { date: at, label: `${dayLabel}, ${timeLabel(mins)}` };
    }
  }
  return null;
}
