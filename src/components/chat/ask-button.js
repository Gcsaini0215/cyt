import React, { useEffect, useState } from "react";
import { apiUrl } from "../../utils/url";
import { getDecodedToken } from "../../utils/jwt";
import ProfileChat from "./profile-chat";

/* "Ask a quick question" on a therapist's profile (2026-11-23): opens the live chat with this therapist
   (one question before booking). Hidden when the therapist has switched messages off. Signed-out visitors
   log in first and come straight back to the chat. */
/* 2026-11-24 (owner): opens the chat right here on the profile (ProfileChat) instead of leaving the page. */
export default function AskButton({ therapistId, variant = "card", name, photo, onBook }) {
  const [ok, setOk] = useState(false);
  const [open, setOpen] = useState(false);
  const [isTher, setIsTher] = useState(false);
  useEffect(() => { const d = getDecodedToken(); setIsTher(!!d && d.role === 1); }, []);
  useEffect(() => {
    if (!therapistId) return undefined;
    let live = true;
    fetch(`${apiUrl}/live-chat/therapist/${therapistId}`).then((r) => r.json()).then((j) => { if (live) setOk(!!j?.data?.enabled); }).catch(() => {});
    return () => { live = false; };
  }, [therapistId]);
  if (!ok || isTher) return null; // therapists don't message other therapists
  return (
    <>
      <button type="button" className={`ask-q ${variant}`} onClick={() => setOpen(true)} aria-label={`Message ${name || "the therapist"}`} title="Ask a quick question">
        <style>{CSS}</style>
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M12 3C6.5 3 2 6.9 2 11.6c0 2.6 1.4 4.9 3.6 6.5-.2 1.1-.7 2.5-1.8 3.6 0 0 2.9-.2 5-1.6 1 .3 2.1.4 3.2.4 5.5 0 10-3.9 10-8.6S17.5 3 12 3Z" /></svg>
        {variant === "card" ? " Ask a quick question" : variant === "icon" ? <small>Ask</small> : null}
      </button>
      {open && <ProfileChat therapistId={therapistId} name={name} photo={photo} onBook={onBook ? () => { setOpen(false); onBook(); } : null} onClose={() => setOpen(false)} />}
    </>
  );
}

const CSS = `
.ask-q { display: inline-flex; align-items: center; justify-content: center; gap: 6px; border: 1.5px solid #1e7a4c; background: #fff; color: #14532d; font: inherit; font-weight: 800; cursor: pointer; }
.ask-q.card { width: 100%; padding: 11px 16px; border-radius: 4px; font-size: 13.5px; }
.ask-q.card:hover { background: #f0f8f3; }
.ask-q.icon { flex: none; width: 52px; height: 46px; border-radius: 12px; flex-direction: column; gap: 0; padding: 0; line-height: 1; }
.ask-q.icon small { font-size: 10.5px; font-weight: 800; margin-top: 2px; }
.ask-q.round { flex: none; width: 46px; height: 46px; border-radius: 50%; padding: 0; }
.ask-q:active { transform: scale(.96); }
`;
