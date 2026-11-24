import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { postData } from "../../utils/actions";
import { apiUrl } from "../../utils/url";

/* "Clear chat" — asks: for me, or for everyone (2026-11-23, owner). iOS action-sheet look, centred, page frozen.
   Messages are never removed from CYT's record; clearing hides them from the screen. */
export default function ClearSheet({ threadId, otherName, onClose, onDone, remove = false }) {
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  useEffect(() => {
    const k = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [onClose]);
  const go = async (scope) => {
    setBusy(scope); setErr("");
    try { const r = await postData(`${apiUrl}/live-chat/threads/${threadId}/clear`, remove ? { scope, remove: true } : { scope }); if (r?.status) onDone(scope); else setErr(r?.message || "Couldn't clear — try again"); }
    catch (e) { setErr(e?.response?.data?.message || "Couldn't clear — try again"); }
    setBusy("");
  };
  if (typeof document === "undefined") return null;
  return createPortal((
    <div className="lcs-scrim" role="dialog" aria-modal="true" aria-label={remove ? "Delete chat" : "Clear chat"} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <style>{CSS}</style>
      <div className="lcs">
        <div className="lcs-card">
          {remove ? (
            <>
              <div className="lcs-h"><b>Delete this chat?</b><small>It goes from your Messages. A new message brings it back.</small></div>
              <button type="button" className="bad" disabled={!!busy} onClick={() => go("me")}>{busy === "me" ? "Deleting…" : "Delete for me"}<small>Only from your Messages. {otherName || "The other person"} still has it.</small></button>
              <button type="button" className="bad" disabled={!!busy} onClick={() => go("all")}>{busy === "all" ? "Deleting…" : "Delete for everyone"}<small>Gone from Messages for both of you.</small></button>
            </>
          ) : (
            <>
              <div className="lcs-h"><b>Clear this chat?</b><small>Choose who it&apos;s cleared for.</small></div>
              <button type="button" disabled={!!busy} onClick={() => go("me")}>{busy === "me" ? "Clearing…" : "Clear for me"}<small>Only your screen. {otherName || "The other person"} still sees everything.</small></button>
              <button type="button" className="bad" disabled={!!busy} onClick={() => go("all")}>{busy === "all" ? "Clearing…" : "Clear for everyone"}<small>Hides the messages for both of you. They&apos;ll see that the chat was cleared.</small></button>
            </>
          )}
          {err && <p className="lcs-err">{err}</p>}
        </div>
        <button type="button" className="lcs-cancel" onClick={onClose}>Cancel</button>
      </div>
    </div>
  ), document.body);
}

const CSS = `
.lcs-scrim { position: fixed; inset: 0; z-index: 2147483600; /* above the full-screen chat widget on phones (it sits at 2147483000) — owner, 2026-11-25 */ display: flex; align-items: flex-end; justify-content: center; padding: 12px 12px calc(12px + env(safe-area-inset-bottom, 0px)); background: rgba(0,0,0,.35); animation: lcsIn .2s ease; }
@media (min-width: 700px) { .lcs-scrim { align-items: center; } }
.lcs { width: min(420px, 100%); display: flex; flex-direction: column; gap: 8px; font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Inter, sans-serif; animation: lcsUp .28s cubic-bezier(.2,.9,.3,1.1); }
.lcs-card { background: rgba(250,250,250,.96); -webkit-backdrop-filter: blur(20px); backdrop-filter: blur(20px); border-radius: 16px; overflow: hidden; }
.lcs-h { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 14px 16px 12px; text-align: center; border-bottom: 1px solid rgba(60,60,67,.14); }
.lcs-h b { font-size: 14px; font-weight: 600; color: #3c3c43; } .lcs-h small { font-size: 12.5px; color: #8e8e93; }
.lcs-card > button { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 13px 16px; border: 0; border-bottom: 1px solid rgba(60,60,67,.14); background: none; font: inherit; font-size: 17px; color: #0a84ff; cursor: pointer; }
.lcs-card > button:last-of-type { border-bottom: 0; }
.lcs-card > button.bad { color: #ff3b30; }
.lcs-card > button small { font-size: 12px; color: #8e8e93; }
.lcs-card > button:disabled { opacity: .6; cursor: default; }
.lcs-cancel { height: 56px; border: 0; border-radius: 16px; background: #fff; font: inherit; font-size: 17px; font-weight: 600; color: #0a84ff; cursor: pointer; }
.lcs-err { margin: 0; padding: 8px 16px 12px; font-size: 12.5px; color: #ff3b30; text-align: center; }
@keyframes lcsIn { from { opacity: 0; } } @keyframes lcsUp { from { opacity: 0; transform: translateY(30px); } }
`;
