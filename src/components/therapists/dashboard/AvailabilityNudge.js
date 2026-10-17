import { useEffect, useMemo, useState } from "react";

/* Weekly "are your timings right?" reminder — a To-do item on the dashboard (it used to be a popup
   on every login). "Done" hides it until next Monday; with no hours set it stays until they're added. */

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DONE_KEY = "cyt_timings_checked_week";

function toMinutes(t) {
  if (!t) return null;
  const lower = t.trim().toLowerCase();
  const isPm = lower.endsWith("pm");
  const isAm = lower.endsWith("am");
  const [hStr, mStr] = lower.replace("am", "").replace("pm", "").trim().split(":");
  let h = parseInt(hStr, 10);
  if (Number.isNaN(h)) return null;
  const m = parseInt(mStr, 10) || 0;
  if (isPm && h !== 12) h += 12;
  if (isAm && h === 12) h = 0;
  return h * 60 + m;
}

// this week's Monday, as YYYY-MM-DD
function weekKey(d = new Date()) {
  const x = new Date(d); x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
}

export function useTimingsTodo(therapistInfo) {
  const [doneWeek, setDoneWeek] = useState(null);
  useEffect(() => { try { setDoneWeek(localStorage.getItem(DONE_KEY) || ""); } catch { setDoneWeek(""); } }, []);

  const hoursWeek = useMemo(() => {
    const avail = therapistInfo?.availabilities || [];
    let hrs = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(); d.setDate(d.getDate() + i);
      const av = avail.find((a) => a.day === DAYS[d.getDay()]);
      (av?.times || []).forEach(({ open, close }) => {
        const s = toMinutes(open), e = toMinutes(close);
        if (s != null && e != null && e > s) hrs += Math.floor((e - s) / 60);
      });
    }
    return hrs;
  }, [therapistInfo?.availabilities]);

  if (!therapistInfo?.user?.email || doneWeek === null) return null;
  if (hoursWeek === 0) {
    return { key: "timings", label: "Set your appointment timings — clients can't book you yet", href: "/my-schedule?tab=availability", cta: "Set timings", tone: "bad" };
  }
  if (doneWeek === weekKey()) return null;
  return {
    key: "timings",
    label: `Check your timings for this week (${hoursWeek}h open in the next 7 days)`,
    href: "/my-schedule?tab=availability", cta: "Review", tone: "warn",
    onDone: () => { const k = weekKey(); try { localStorage.setItem(DONE_KEY, k); } catch { /* storage blocked */ } setDoneWeek(k); },
  };
}
