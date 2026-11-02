import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { SESSION_ENDED_FLAG } from "../../utils/session-guard";

/* On the login page, after a session ended by itself: says why they're here. */
export default function SessionNotice() {
  const { pathname } = useRouter();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (pathname !== "/login") { setShow(false); return; }
    try {
      if (sessionStorage.getItem(SESSION_ENDED_FLAG)) {
        sessionStorage.removeItem(SESSION_ENDED_FLAG);
        setShow(true);
      }
    } catch (e) { /* storage blocked */ }
  }, [pathname]);

  if (!show) return null;
  return (
    <div role="status" style={{ position: "fixed", top: 12, left: "50%", transform: "translateX(-50%)", zIndex: 3000, width: "min(440px, calc(100% - 24px))", boxSizing: "border-box", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px 10px 16px", borderRadius: 12, background: "#fffbeb", border: "1px solid #fde68a", boxShadow: "0 10px 26px -14px rgba(15,23,42,.45)", color: "#78350f", fontSize: 14.5, fontWeight: 600, lineHeight: 1.4 }}>
      <span style={{ flex: 1 }}>Your session has ended. Please log in again.</span>
      <button type="button" aria-label="Dismiss" onClick={() => setShow(false)} style={{ width: 32, height: 32, border: 0, borderRadius: 8, background: "none", color: "#92400e", fontSize: 20, lineHeight: 1, cursor: "pointer" }}>×</button>
    </div>
  );
}
