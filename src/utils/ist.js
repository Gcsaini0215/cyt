// Therapist availability is set in India time, so slot dates/times must be worked out in IST
// whatever timezone the visitor's browser is in (a client booking from the UK saw 10:30 PM IST
// saved as 3:00 AM IST, because setHours() ran in UK time).
//
// "IST days" here are plain local-midnight Date objects built from the IST calendar date, so
// getDay()/getDate()/getMonth()/toDateString() on them give the IST day in any browser.
// istInstant() turns such a day + "HH:MM" (IST) into the real moment.

const IST_OFFSET_MS = 330 * 60 * 1000;

// the IST wall-clock parts of a moment
export function istParts(at = new Date()) {
  const s = new Date(new Date(at).getTime() + IST_OFFSET_MS);
  return { y: s.getUTCFullYear(), m: s.getUTCMonth(), d: s.getUTCDate(), dow: s.getUTCDay(), h: s.getUTCHours(), min: s.getUTCMinutes() };
}

// the IST calendar day of a moment (plus `add` days), as a local-midnight Date
export function istDay(at = new Date(), add = 0) {
  const p = istParts(at);
  return new Date(p.y, p.m, p.d + add);
}

// minutes past midnight, IST
export function istNowMinutes(at = new Date()) {
  const p = istParts(at);
  return p.h * 60 + p.min;
}

// an IST day (local-midnight Date from istDay) + IST hours/minutes → the real moment
export function istInstant(day, h, min = 0) {
  return new Date(Date.UTC(day.getFullYear(), day.getMonth(), day.getDate(), h, min) - IST_OFFSET_MS);
}

// true when the browser is not on India time (used to show the visitor their own local time too)
export function isAwayFromIst(at = new Date()) {
  return new Date(at).getTimezoneOffset() !== -330;
}

// the visitor's own local day + time for a moment, e.g. "Thu 22 Oct, 6:00 PM GMT+1"
export function localTimeLabel(at) {
  try {
    const d = new Date(at);
    const parts = new Intl.DateTimeFormat("en-GB", { timeZoneName: "short" }).formatToParts(d);
    const tz = (parts.find((p) => p.type === "timeZoneName") || {}).value || "";
    const day = d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
    const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    return `${day}, ${time}${tz ? ` ${tz}` : ""}`;
  } catch {
    return "";
  }
}
