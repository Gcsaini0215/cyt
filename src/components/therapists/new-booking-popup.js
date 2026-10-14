import React, { useEffect, useRef } from "react";
import Link from "next/link";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

/* Pops up on any therapist page when a new booking arrives (fed by the top bar's poll).
   Plays the booking chime if the browser allows it; hides itself after a minute. */
const fmt = (d) => {
  const x = new Date(d);
  return isNaN(x) ? "" : x.toLocaleString("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" });
};

export default function NewBookingPopup({ items, onClose }) {
  const audio = useRef(null);
  useEffect(() => {
    if (!items?.length) return undefined;
    try {
      if (!audio.current) audio.current = new Audio("/notification.mp3");
      audio.current.currentTime = 0;
      audio.current.play().catch(() => {});
    } catch (e) { /* no audio */ }
    const t = setTimeout(onClose, 60000);
    return () => { clearTimeout(t); audio.current?.pause(); };
  }, [items, onClose]);
  if (!items?.length) return null;
  const b = items[0];
  const who = (/other/i.test(b.whom || "") && b.cname) ? b.cname : b.client?.name || "A client";
  return (
    <div className="nbp" role="alert">
      <style dangerouslySetInnerHTML={{ __html: NBP_CSS }} />
      <span className="nbp-ic"><NotificationsActiveRoundedIcon /></span>
      <div className="nbp-txt">
        <b>{items.length > 1 ? `${items.length} new bookings!` : "New booking!"}</b>
        <span>{who}{b.booking_date ? ` · ${fmt(b.booking_date)}` : ""}{b.service ? ` · ${b.service}` : ""}</span>
      </div>
      <Link href="/appointments" className="nbp-view" onClick={onClose}>View</Link>
      <button type="button" className="nbp-x" onClick={onClose} aria-label="Dismiss"><CloseRoundedIcon /></button>
    </div>
  );
}

const NBP_CSS = `
.nbp { position: fixed; top: calc(var(--tn-h, 56px) + 10px); left: 50%; transform: translateX(-50%); z-index: 1500; width: min(540px, calc(100vw - 24px));
  display: flex; align-items: center; gap: 12px; background: #0f3d24; color: #fff; border: 1px solid #c9962c; border-radius: 14px; padding: 12px 12px 12px 14px;
  box-shadow: 0 18px 44px -14px rgba(4,30,16,.65); animation: nbpDrop .35s cubic-bezier(.34,1.56,.64,1); font-family: Inter, system-ui, sans-serif; }
@keyframes nbpDrop { from { transform: translate(-50%, -30px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
.nbp-ic { width: 40px; height: 40px; border-radius: 12px; background: rgba(245,197,66,.18); color: #f5c542; display: grid; place-items: center; flex-shrink: 0; animation: nbpRing 1.2s ease-in-out 3; }
@keyframes nbpRing { 0%,100% { transform: rotate(0); } 20% { transform: rotate(-14deg); } 40% { transform: rotate(12deg); } 60% { transform: rotate(-8deg); } 80% { transform: rotate(5deg); } }
.nbp-txt { flex: 1; min-width: 0; }
.nbp-txt b { display: block; font-size: 15px; }
.nbp-txt span { display: block; font-size: 12.5px; opacity: .8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.nbp-view { height: 36px; padding: 0 16px; border-radius: 10px; background: #f5c542; color: #3d2a00 !important; font-weight: 800; font-size: 13.5px; display: inline-flex; align-items: center; text-decoration: none !important; flex-shrink: 0; }
.nbp-x { width: 34px; height: 34px; border-radius: 9px; border: 0; background: rgba(255,255,255,.12); color: #fff; display: grid; place-items: center; cursor: pointer; flex-shrink: 0; }
@media (prefers-reduced-motion: reduce) { .nbp, .nbp-ic { animation: none; } }
`;
