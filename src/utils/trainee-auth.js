import { jwtDecode } from "jwt-decode";

/* Trainee-portal sign-in, kept apart from the client / therapist login (its own token key). */
const KEY = "cyt_trainee_token";
const store = (fn, fallback = null) => { try { return fn(); } catch { return fallback; } };

export const setTraineeToken = (t) => store(() => localStorage.setItem(KEY, t));
export const getTraineeToken = () => store(() => localStorage.getItem(KEY));
export const clearTraineeToken = () => store(() => localStorage.removeItem(KEY));

// the decoded token, or null when missing / expired / not a trainee token
export function getTrainee() {
  const t = getTraineeToken();
  if (!t) return null;
  const d = store(() => jwtDecode(t));
  if (!d || d.kind !== "trainee" || (d.exp && d.exp * 1000 < Date.now())) return null;
  return d;
}
