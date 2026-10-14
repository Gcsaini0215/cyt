import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import VideoCallRoundedIcon from "@mui/icons-material/VideoCallRounded";
import EventBusyRoundedIcon from "@mui/icons-material/EventBusyRounded";
import StarRateRoundedIcon from "@mui/icons-material/StarRateRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import AssignmentLateRoundedIcon from "@mui/icons-material/AssignmentLateRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import ForumRoundedIcon from "@mui/icons-material/ForumRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import useNotifStore, { connectNotifications } from "../../store/notifStore";

// The portal bell: a dropdown of recent notifications next to it, and live pop-ups under it the
// moment something happens (fed by store/notifStore's live stream — no refresh needed).

const KIND = {
  booking: { Icon: EventAvailableRoundedIcon, fg: "#166534", bg: "#dcfce7" },
  joined: { Icon: VideoCallRoundedIcon, fg: "#7c2d12", bg: "#fde68a" },
  cancelled: { Icon: EventBusyRoundedIcon, fg: "#b91c1c", bg: "#fee2e2" },
  review: { Icon: StarRateRoundedIcon, fg: "#b45309", bg: "#fef3c7" },
  session: { Icon: TaskAltRoundedIcon, fg: "#0f766e", bg: "#ccfbf1" },
  notice: { Icon: CampaignRoundedIcon, fg: "#1d4ed8", bg: "#dbeafe" },
  action: { Icon: AssignmentLateRoundedIcon, fg: "#9a3412", bg: "#ffedd5" },
  payout: { Icon: PaymentsRoundedIcon, fg: "#166534", bg: "#dcfce7" },
  reply: { Icon: ForumRoundedIcon, fg: "#6d28d9", bg: "#ede9fe" },
};
const kindOf = (t) => KIND[t] || KIND.notice;

function ago(iso) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 7 * 86400) return `${Math.floor(s / 86400)} d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function Row({ n, onOpen }) {
  const { Icon, fg, bg } = kindOf(n.type);
  return (
    <button type="button" className={`nb-row${n.read ? "" : " unread"}`} onClick={() => onOpen(n)}>
      <span className="nb-ic" style={{ color: fg, background: bg }}><Icon /></span>
      <span className="nb-txt">
        <b>{n.title}</b>
        {n.body && <span>{n.body}</span>}
        <em>{ago(n.createdAt)}</em>
      </span>
      {!n.read && <i className="nb-dot" aria-label="unread" />}
    </button>
  );
}

// fallbackCount: the old badge, shown until the notifications service answers (older backend)
export default function NotifBell({ fallbackCount = 0, onOpenBell }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const { items, unread, loaded, toasts, markRead, dismissToast } = useNotifStore();
  const [, tick] = useState(0);

  useEffect(() => connectNotifications(), []);
  // keep "x min ago" fresh while the panel is open
  useEffect(() => {
    if (!open) return undefined;
    const id = setInterval(() => tick((x) => x + 1), 30000);
    return () => clearInterval(id);
  }, [open]);
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("touchstart", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);
  useEffect(() => { setOpen(false); }, [router.asPath]);

  // pop-ups close by themselves after a while (a client waiting in the session stays longer)
  useEffect(() => {
    if (!toasts.length) return undefined;
    const timers = toasts.map((t) => setTimeout(() => dismissToast(t._id), t.type === "joined" ? 60000 : 12000));
    return () => timers.forEach(clearTimeout);
  }, [toasts, dismissToast]);

  const go = (n) => {
    if (!n.read) markRead([n._id]);
    dismissToast(n._id);
    setOpen(false);
    if (n.link) router.push(n.link);
  };

  const count = loaded ? unread : fallbackCount;

  return (
    <div className="nb-wrap" ref={wrapRef}>
      <button type="button" className={`tn-icon-btn nb-bell${count ? " has" : ""}`} onClick={() => { setOpen((o) => !o); onOpenBell?.(); }}
        title="Notifications" aria-haspopup="dialog" aria-expanded={open} aria-label={`Notifications${count ? ` (${count} new)` : ""}`}>
        <NotificationsActiveRoundedIcon />
        {count > 0 && <span className="tn-notif-dot">{count > 99 ? "99+" : count}</span>}
      </button>

      {open && (
        <div className="nb-panel" role="dialog" aria-label="Notifications">
          <div className="nb-head">
            <b>Notifications</b>
            {unread > 0 && <button type="button" onClick={() => markRead()}><DoneAllRoundedIcon /> Mark all read</button>}
          </div>
          <div className="nb-list">
            {!loaded && <div className="nb-empty">Loading…</div>}
            {loaded && !items.length && <div className="nb-empty">You&apos;re all caught up. New bookings, reviews and messages from the CYT team will show up here the moment they happen.</div>}
            {items.slice(0, 30).map((n) => <Row key={n._id} n={n} onOpen={go} />)}
          </div>
          <Link href="/therapists/notifications" className="nb-all" onClick={() => setOpen(false)}>See all activity →</Link>
        </div>
      )}

      {/* live pop-ups, right under the bell */}
      {!open && toasts.length > 0 && (
        <div className="nb-toasts" aria-live="polite">
          {toasts.map((n) => {
            const { Icon, fg, bg } = kindOf(n.type);
            return (
              <div key={n._id} className={`nb-toast t-${n.type}`} role="status">
                <button type="button" className="nb-toast-main" onClick={() => go(n)}>
                  <span className="nb-ic" style={{ color: fg, background: bg }}><Icon /></span>
                  <span className="nb-txt">
                    <b>{n.title}</b>
                    {n.body && <span>{n.body}</span>}
                    <em>{n.type === "joined" ? "Tap to open your sessions" : ago(n.createdAt)}</em>
                  </span>
                </button>
                <button type="button" className="nb-toast-x" onClick={() => dismissToast(n._id)} aria-label="Dismiss"><CloseRoundedIcon /></button>
              </div>
            );
          })}
        </div>
      )}
      <style>{NB_CSS}</style>
    </div>
  );
}

const NB_CSS = `
.nb-wrap { position: relative; }
.nb-bell.has svg { animation: nbRing 2.4s ease-in-out 1; transform-origin: 50% 4px; }
@keyframes nbRing { 0%,60%,100% { transform: rotate(0); } 10% { transform: rotate(14deg); } 20% { transform: rotate(-12deg); } 30% { transform: rotate(9deg); } 40% { transform: rotate(-6deg); } 50% { transform: rotate(3deg); } }
.nb-panel { position: absolute; top: calc(100% + 10px); right: -6px; width: 370px; max-width: calc(100vw - 20px); background: #fff; border: 1px solid #e2e8f0; border-radius: 18px; box-shadow: 0 24px 50px -18px rgba(15,23,42,.35); z-index: 1300; overflow: hidden; animation: nbIn .16s ease-out; font-family: inherit; }
@keyframes nbIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
.nb-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 14px 16px 10px; border-bottom: 1px solid #eef2f6; }
.nb-head b { font-size: 15px; font-weight: 800; color: #0f172a; }
.nb-head button { display: inline-flex; align-items: center; gap: 4px; border: 0; background: none; color: #166534; font-size: 12.5px; font-weight: 700; cursor: pointer; padding: 4px 6px; border-radius: 8px; }
.nb-head button:hover { background: #f0fdf4; }
.nb-head button svg { font-size: 16px; }
.nb-list { max-height: min(430px, 62vh); overflow-y: auto; }
.nb-row { display: flex; align-items: flex-start; gap: 11px; width: 100%; padding: 11px 16px; border: 0; border-bottom: 1px solid #f1f5f9; background: #fff; text-align: left; cursor: pointer; font-family: inherit; position: relative; }
.nb-row:hover { background: #f8fafc; }
.nb-row.unread { background: #f3fbf5; }
.nb-row.unread:hover { background: #eaf7ee; }
.nb-ic { flex-shrink: 0; width: 36px; height: 36px; border-radius: 11px; display: grid; place-items: center; }
.nb-ic svg { font-size: 20px; }
.nb-txt { display: flex; flex-direction: column; min-width: 0; flex: 1; gap: 1px; }
.nb-txt b { font-size: 13.5px; font-weight: 700; color: #0f172a; line-height: 1.3; }
.nb-txt span { font-size: 12.5px; color: #475569; line-height: 1.35; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.nb-txt em { font-style: normal; font-size: 11.5px; color: #94a3b8; margin-top: 2px; }
.nb-dot { flex-shrink: 0; width: 9px; height: 9px; border-radius: 50%; background: #16a34a; margin-top: 6px; }
.nb-empty { padding: 26px 18px; text-align: center; font-size: 13px; color: #64748b; line-height: 1.5; }
.nb-all { display: block; text-align: center; padding: 11px; font-size: 13px; font-weight: 700; color: #166534 !important; text-decoration: none !important; border-top: 1px solid #eef2f6; background: #fafcfb; }
.nb-all:hover { background: #f0fdf4; }

.nb-toasts { position: absolute; top: calc(100% + 10px); right: -6px; width: 350px; max-width: calc(100vw - 20px); display: flex; flex-direction: column; gap: 8px; z-index: 1300; pointer-events: none; }
.nb-toast { pointer-events: auto; display: flex; align-items: flex-start; background: #fff; border: 1px solid #dcefe3; border-left: 4px solid #16a34a; border-radius: 14px; box-shadow: 0 18px 40px -16px rgba(15,23,42,.4); animation: nbToast .28s cubic-bezier(.2,.9,.3,1.2); overflow: hidden; }
.nb-toast.t-joined { border-left-color: #f59e0b; box-shadow: 0 0 0 3px rgba(245,158,11,.25), 0 18px 40px -16px rgba(15,23,42,.4); }
.nb-toast.t-cancelled { border-left-color: #ef4444; }
.nb-toast.t-review { border-left-color: #f59e0b; }
.nb-toast.t-notice, .nb-toast.t-action { border-left-color: #3b82f6; }
@keyframes nbToast { from { opacity: 0; transform: translateY(-10px) scale(.97); } to { opacity: 1; transform: none; } }
.nb-toast-main { flex: 1; min-width: 0; display: flex; gap: 11px; align-items: flex-start; padding: 12px 6px 12px 12px; border: 0; background: none; text-align: left; cursor: pointer; font-family: inherit; }
.nb-toast-x { flex-shrink: 0; border: 0; background: none; color: #94a3b8; padding: 8px; cursor: pointer; border-radius: 8px; }
.nb-toast-x:hover { color: #0f172a; background: #f1f5f9; }
.nb-toast-x svg { font-size: 18px; }

@media (max-width: 600px) {
  .nb-panel, .nb-toasts { position: fixed; top: calc(var(--tn-h, 60px) + 8px); left: 10px; right: 10px; width: auto; max-width: none; }
}
@media (prefers-reduced-motion: reduce) { .nb-bell.has svg, .nb-panel, .nb-toast { animation: none; } }
`;
