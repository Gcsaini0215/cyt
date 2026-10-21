import { apiUrl, baseApi } from "./url";
import { getTraineeToken, clearTraineeToken } from "./trainee-auth";

/* Calls the trainee-portal API with the trainee token. A 401 signs the trainee out.
   `form` sends FormData (files); `body` sends JSON. Always resolves to the JSON reply. */
export async function tApi(path, { method = "GET", body, form } = {}) {
  const headers = { Authorization: `Bearer ${getTraineeToken() || ""}` };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  let r;
  try {
    r = await fetch(`${apiUrl}${path}`, { method, headers, body: form || (body !== undefined ? JSON.stringify(body) : undefined) });
  } catch {
    return { status: false, message: "Can't reach the server. Check your internet and try again." };
  }
  if (r.status === 401) {
    clearTraineeToken();
    if (typeof window !== "undefined") window.location.href = "/supervision-login";
    return { status: false, message: "Please sign in" };
  }
  try { return await r.json(); } catch { return { status: false, message: "Something went wrong. Please try again." }; }
}

// stored upload path ("resources/x.pdf") → full URL
export const fileUrl = (rel) => (rel ? `${baseApi}/uploads/${rel}` : "");

export const fmtTime = (d) => (d ? new Date(d).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }) : "—");
export const fmtDate = (d, opts = { day: "numeric", month: "short", year: "numeric" }) => (d ? new Date(d).toLocaleDateString("en-IN", opts) : "—");
export const fmtMins = (m) => { const h = Math.floor((m || 0) / 60); const mm = (m || 0) % 60; return h ? `${h}h ${mm}m` : `${mm}m`; };
