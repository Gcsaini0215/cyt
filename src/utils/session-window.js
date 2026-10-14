// Join / Start window for a session — keep in step with cyt_backend_api/helper/googleMeet.js
export const SESSION_MINUTES = 60;
export const JOIN_EARLY_MIN = 15;
export const JOIN_AFTER_END_MIN = 30;

export function sessionWindow(bookingDate, now = Date.now()) {
  const at = new Date(bookingDate).getTime();
  const opens = at - JOIN_EARLY_MIN * 60000;
  const closes = at + (SESSION_MINUTES + JOIN_AFTER_END_MIN) * 60000;
  const t = typeof now === "number" ? now : now.getTime();
  return { opens, closes, before: t < opens, open: t >= opens && t <= closes, after: t > closes };
}

export const opensAtText = (ms) => new Date(ms).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" });
