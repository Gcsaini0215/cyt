import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { getToken, isAuthenticated, getDecodedToken, setToken, removeToken } from "./jwt";
import { apiUrl } from "./url";

/* Keeps a signed-in client or therapist's session honest:
   - a session in use is renewed before it runs out;
   - when it really has ended (expired, or the server refuses it) the portal goes to the login page,
     and login brings them back to the same screen. */

const ENDED_EVENT = "cyt:session-ended";
export const SESSION_ENDED_FLAG = "cyt_session_ended";
const DAY = 24 * 3600000;
const RENEW_WITHIN = 3 * DAY; // tokens last 7 days
const CHECK_GAP = 60000;
const MAX_TIMER = 2147483647; // setTimeout's limit

const endSession = () => {
  removeToken();
  try { sessionStorage.setItem(SESSION_ENDED_FLAG, "1"); } catch (e) { /* storage blocked */ }
  window.dispatchEvent(new Event(ENDED_EVENT));
};

// Asks the server. Also the only proof a 401 means the session is over: some routes answer 401 to a good
// token of the wrong role, so a 401 alone must never sign anyone out. Network trouble changes nothing.
let lastCheck = 0;
async function checkWithServer() {
  const token = getToken();
  if (!token || Date.now() - lastCheck < CHECK_GAP) return;
  lastCheck = Date.now();
  try {
    const res = await fetch(`${apiUrl}/session/refresh`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    if (getToken() !== token) return; // signed out or in again meanwhile
    if (res.status === 401 || res.status === 403) { endSession(); return; }
    if (res.ok) {
      const body = await res.json();
      if (body?.token) setToken(body.token);
    }
  } catch (e) { /* offline: try again next time */ }
}

if (typeof window !== "undefined") {
  axios.interceptors.response.use(undefined, (error) => {
    const sent = error?.config?.headers?.Authorization;
    const token = getToken();
    // only this session's token: the trainee portal has its own
    if (error?.response?.status === 401 && token && sent === `Bearer ${token}`) {
      if (isAuthenticated()) checkWithServer();
      else endSession();
    }
    return Promise.reject(error);
  });
}

// For the portal shells. Returns true once the page may show.
export default function useSessionGuard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let timer;
    let gone = false;
    const leave = (expired) => {
      if (gone) return;
      gone = true;
      if (expired) { try { sessionStorage.setItem(SESSION_ENDED_FLAG, "1"); } catch (e) { /* storage blocked */ } }
      router.replace(`/login?next=${encodeURIComponent(router.asPath)}`);
    };
    const check = () => {
      clearTimeout(timer);
      const hadToken = !!getToken();
      if (!isAuthenticated()) { leave(hadToken); return; }
      const exp = (getDecodedToken()?.exp || 0) * 1000;
      if (exp - Date.now() < RENEW_WITHIN) checkWithServer();
      timer = setTimeout(check, Math.min(Math.max(exp - Date.now(), 1000), MAX_TIMER));
    };
    const onBack = () => { if (document.visibilityState === "visible") check(); };
    const onStorage = (e) => { if (e.key === "token" || e.key === null) check(); }; // signed out in another tab
    const onEnded = () => leave(true);

    check();
    if (!gone) setReady(true);
    window.addEventListener("focus", onBack);
    document.addEventListener("visibilitychange", onBack);
    window.addEventListener("storage", onStorage);
    window.addEventListener(ENDED_EVENT, onEnded);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("focus", onBack);
      document.removeEventListener("visibilitychange", onBack);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(ENDED_EVENT, onEnded);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return ready;
}
