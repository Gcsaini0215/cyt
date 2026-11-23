import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { apiUrl } from "../../utils/url";
import { getDecodedToken } from "../../utils/jwt";

/* "Ask a quick question" on a therapist's profile (2026-11-23): opens the live chat with this therapist
   (one question before booking). Hidden when the therapist has switched messages off. Signed-out visitors
   log in first and come straight back to the chat. */
export default function AskButton({ therapistId, variant = "card" }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);
  useEffect(() => {
    if (!therapistId) return undefined;
    let live = true;
    fetch(`${apiUrl}/live-chat/therapist/${therapistId}`).then((r) => r.json()).then((j) => { if (live) setOk(!!j?.data?.enabled); }).catch(() => {});
    return () => { live = false; };
  }, [therapistId]);
  if (!ok) return null;
  const go = () => {
    const to = `/client/messages?to=${therapistId}`;
    const d = getDecodedToken();
    if (d && d.role === 1) return; // therapists don't message other therapists
    router.push(d ? to : `/login?next=${encodeURIComponent(to)}`);
  };
  return (
    <button type="button" className={`ask-q ${variant}`} onClick={go} aria-label="Ask a quick question">
      <style>{CSS}</style>
      <span aria-hidden="true">💬</span>{variant === "icon" ? null : " Ask a quick question"}
    </button>
  );
}

const CSS = `
.ask-q { display: inline-flex; align-items: center; justify-content: center; gap: 6px; border: 1.5px solid #1e7a4c; background: #fff; color: #14532d; font: inherit; font-weight: 800; cursor: pointer; }
.ask-q.card { width: 100%; padding: 11px 16px; border-radius: 4px; font-size: 13.5px; }
.ask-q.card:hover { background: #f0f8f3; }
.ask-q.icon { flex: none; width: 46px; height: 46px; border-radius: 14px; font-size: 20px; }
`;
