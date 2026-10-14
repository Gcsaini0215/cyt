import { postData } from "./actions";
import { joinSessionUrl } from "./url";

/* Join a session's Google Meet through CYT (records who joined; both joined = session started).
   The tab is opened synchronously so mobile browsers don't block it as a pop-up. */
export async function joinSession(bookingId, fallbackLink) {
  const win = typeof window !== "undefined" ? window.open("", "_blank") : null;
  try {
    const r = await postData(joinSessionUrl(bookingId), {});
    const link = r?.data?.meet_link || fallbackLink;
    if (!link) throw new Error(r?.message || "No meeting link");
    if (win) win.location.href = link; else window.location.href = link;
    return r?.data || null;
  } catch (e) {
    if (fallbackLink) {
      if (win) win.location.href = fallbackLink; else window.location.href = fallbackLink;
      return null;
    }
    if (win) win.close();
    throw new Error(e?.response?.data?.message || e.message || "Couldn't open the meeting");
  }
}
