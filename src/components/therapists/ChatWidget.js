import React, { useState, useEffect, useRef, useCallback } from "react";
import { fetchById } from "../../utils/actions";
import { chatConversationsUrl } from "../../utils/url";
import ChatInbox from "./dashboard/ChatInbox";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [pulse, setPulse] = useState(false);
  const prevUnreadRef = useRef(0);
  const firstPollRef = useRef(true);
  const openRef = useRef(open);
  openRef.current = open;

  const poll = useCallback(async () => {
    try {
      const r = await fetchById(chatConversationsUrl);
      if (!r?.success) return;
      const total = (r.data || []).reduce((s, c) => s + (c.unread || 0), 0);

      // First poll after mount just establishes the baseline — every page
      // navigation remounts this widget, so without this guard any
      // already-existing unread count would pop the widget open on every
      // single page load instead of only on genuinely new messages.
      if (firstPollRef.current) {
        firstPollRef.current = false;
        prevUnreadRef.current = total;
        setUnread(total);
        return;
      }

      if (total > prevUnreadRef.current && !openRef.current) {
        setOpen(true);
        setPulse(true);
        setTimeout(() => setPulse(false), 2000);
      }
      prevUnreadRef.current = total;
      setUnread(total);
    } catch {}
  }, []);

  useEffect(() => {
    poll();
    const iv = setInterval(poll, 6000);
    return () => clearInterval(iv);
  }, [poll]);

  return (
    <>
      <style>{`
        .cw-fab {
          position: fixed; bottom: 20px; z-index: 1250;
          width: 52px; height: 52px; border-radius: 50%;
          background: linear-gradient(135deg,#166534,#16a34a);
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; color: #fff;
          box-shadow: 0 8px 24px rgba(22,101,52,.35);
          transition: transform .15s ease;
        }
        .cw-fab:hover { transform: scale(1.06); }
        .cw-fab.pulse { animation: cwPulse 1s ease infinite; }
        @keyframes cwPulse {
          0%,100% { box-shadow: 0 8px 24px rgba(22,101,52,.35); }
          50%     { box-shadow: 0 8px 24px rgba(22,101,52,.35), 0 0 0 10px rgba(22,101,52,.18); }
        }
        .cw-fab-badge {
          position: absolute; top: -3px; right: -3px;
          background: #ef4444; color: #fff; border-radius: 10px;
          min-width: 19px; height: 19px; padding: 0 4px;
          font-size: 11px; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid #fff;
        }
        .cw-panel {
          position: fixed; bottom: 84px; z-index: 1250;
          width: 520px; max-width: calc(100vw - 40px);
          border-radius: 12px; overflow: hidden;
          box-shadow: 0 24px 64px rgba(0,0,0,.28);
          animation: cwPop .2s cubic-bezier(.34,1.56,.64,1);
          background: #fff;
        }
        @keyframes cwPop { from { transform: translateY(12px) scale(.96); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
        .cw-panel-head {
          background: linear-gradient(135deg,#0f3d24,#175c37); border-bottom: 3px solid #d4af37;
          padding: 10px 14px; display: flex; align-items: center; justify-content: space-between;
        }
        .cw-panel-head span { color: #fff; font-size: 13px; font-weight: 800; }
        .cw-panel-head button {
          background: rgba(255,255,255,.15); border: none; width: 26px; height: 26px;
          border-radius: 6px; color: #fff; cursor: pointer; font-size: 16px; line-height: 1;
        }
        .cw-panel-head button:hover { background: rgba(255,255,255,.25); }

        @media (max-width: 960px) {
          .cw-fab   { left: 16px; bottom: 76px; }
          .cw-panel { left: 16px; bottom: 140px; width: calc(100vw - 32px); }
        }
        @media (min-width: 961px) {
          .cw-fab   { left: 76px; }
          .cw-panel { left: 76px; }
        }
      `}</style>

      {open && (
        <div className="cw-panel">
          <div className="cw-panel-head">
            <span>Messages</span>
            <button onClick={() => setOpen(false)} aria-label="Close chat">×</button>
          </div>
          <ChatInbox />
        </div>
      )}

      {!open && (
        <button className={`cw-fab${pulse ? " pulse" : ""}`} onClick={() => setOpen(true)} aria-label="Open chat">
          <svg width="22" height="22" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          {unread > 0 && <span className="cw-fab-badge">{unread}</span>}
        </button>
      )}
    </>
  );
}
