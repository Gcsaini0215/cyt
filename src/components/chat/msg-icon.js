import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";

/* Messages in a dashboard's top bar, with the unread count (owner, 2026-11-25). chat-notify.js keeps the count up to
   date and shows a new message's pop-up right under this icon (the floating chat button is off on dashboards). */
export default function MsgIcon({ href, className = "" }) {
  const [n, setN] = useState(0);
  const ref = useRef(null);
  // where the icon is, so the new-message pop-up can point at it
  useEffect(() => {
    const place = () => { const el = ref.current; if (!el) return; const r = el.getBoundingClientRect(); if (r.width) document.documentElement.style.setProperty("--msg-ic-x", `${Math.round(window.innerWidth - (r.left + r.width / 2))}px`); };
    place(); const t = setTimeout(place, 600);
    window.addEventListener("resize", place);
    return () => { clearTimeout(t); window.removeEventListener("resize", place); };
  }, []);
  useEffect(() => {
    if (typeof window.__cytUnread === "number") setN(window.__cytUnread);
    const f = (e) => setN(Number(e.detail) || 0);
    window.addEventListener("cyt-chat-unread", f);
    return () => window.removeEventListener("cyt-chat-unread", f);
  }, []);
  return (
    <Link ref={ref} href={href} className={`${className} cyt-msg-ic`} aria-label={n ? `Messages, ${n} unread` : "Messages"} title="Messages">
      <ChatBubbleOutlineRoundedIcon />{n > 0 && <em className="cyt-msg-n">{n > 9 ? "9+" : n}</em>}
    </Link>
  );
}

export const MSG_ICON_CSS = `
.cyt-msg-ic { position: relative; }
.cyt-msg-n { position: absolute; top: -3px; right: -3px; min-width: 18px; height: 18px; padding: 0 5px; box-sizing: border-box; border-radius: 999px; background: #ff3b30; color: #fff;
  font-style: normal; font-size: 11px; font-weight: 800; line-height: 18px; text-align: center; box-shadow: 0 0 0 2px #fff; }
`;
