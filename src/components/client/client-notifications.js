import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import useClientNotifStore, { connectClientNotifications } from "../../store/clientNotifStore";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";
import AlarmRoundedIcon from "@mui/icons-material/AlarmRounded";
import UpdateRoundedIcon from "@mui/icons-material/UpdateRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import EventBusyRoundedIcon from "@mui/icons-material/EventBusyRounded";
import CardGiftcardRoundedIcon from "@mui/icons-material/CardGiftcardRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

/* The client portal's bell (top bar) and the pop-up cards for new notifications. */

const KIND = {
  booking: [EventAvailableRoundedIcon, "mint"],
  joined: [VideocamRoundedIcon, "sky"],
  soon: [AlarmRoundedIcon, "butter"],
  rescheduled: [UpdateRoundedIcon, "lilac"],
  completed: [TaskAltRoundedIcon, "mint"],
  cancelled: [EventBusyRoundedIcon, "blush"],
  referral: [CardGiftcardRoundedIcon, "butter"],
};
const kindOf = (t) => KIND[t] || [NotificationsRoundedIcon, "sky"];
const ago = (d) => {
  const m = Math.round((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  if (m < 1440) return `${Math.floor(m / 60)} h ago`;
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });
};

function Row({ n, onOpen }) {
  const [Icon, tone] = kindOf(n.type);
  return (
    <button type="button" className={`cn-row${n.read ? "" : " unread"}`} onClick={() => onOpen(n)}>
      <span className={`cn-ic ${tone}`}><Icon /></span>
      <span className="cn-txt"><b>{n.title}</b>{n.body && <span>{n.body}</span>}<em>{ago(n.createdAt)}</em></span>
    </button>
  );
}

export default function ClientNotifications({ ready }) {
  const router = useRouter();
  const { items, unread, toasts, markRead, dismissToast } = useClientNotifStore();
  const [open, setOpen] = useState(false);
  const [perm, setPerm] = useState("granted");
  const ref = useRef(null);

  useEffect(() => { if (ready) return connectClientNotifications(); return undefined; }, [ready]);
  useEffect(() => { try { setPerm("Notification" in window ? Notification.permission : "granted"); } catch (e) { /* not supported */ } }, []);
  useEffect(() => { setOpen(false); }, [router.asPath]);
  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    document.addEventListener("touchstart", close);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("touchstart", close); };
  }, [open]);
  // pop-ups close by themselves after a while
  useEffect(() => {
    if (!toasts.length) return undefined;
    const t = setTimeout(() => dismissToast(toasts[toasts.length - 1]._id), 9000);
    return () => clearTimeout(t);
  }, [toasts, dismissToast]);

  const go = (n) => {
    if (!n.read) markRead([n._id]);
    dismissToast(n._id);
    setOpen(false);
    if (n.link) router.push(n.link);
  };
  const allow = async () => {
    try { setPerm(await Notification.requestPermission()); } catch (e) { /* not supported */ }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CN_CSS }} />
      <div className="cn" ref={ref}>
        <button type="button" className="cn-bell" onClick={() => setOpen((o) => !o)} aria-label={`Notifications${unread ? `, ${unread} new` : ""}`} aria-expanded={open}>
          <NotificationsRoundedIcon />
          {unread > 0 && <span className="cn-badge">{unread > 9 ? "9+" : unread}</span>}
        </button>
        {open && (
          <div className="cn-panel" role="dialog" aria-label="Notifications">
            <div className="cn-head">
              <b>Notifications</b>
              {unread > 0 && <button type="button" onClick={() => markRead()}>Mark all read</button>}
            </div>
            {perm === "default" && (
              <button type="button" className="cn-allow" onClick={allow}>🔔 Get alerts even when this tab is in the background</button>
            )}
            <div className="cn-list">
              {items.length ? items.map((n) => <Row key={n._id} n={n} onOpen={go} />) : (
                <p className="cn-empty">You&apos;re all caught up. Session updates show up here the moment they happen.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {toasts.length > 0 && (
        <div className="cn-toasts" aria-live="polite">
          {toasts.map((n) => {
            const [Icon, tone] = kindOf(n.type);
            return (
              <div key={n._id} className="cn-toast">
                <button type="button" className="cn-toast-body" onClick={() => go(n)}>
                  <span className={`cn-ic ${tone}`}><Icon /></span>
                  <span className="cn-txt"><b>{n.title}</b>{n.body && <span>{n.body}</span>}</span>
                </button>
                <button type="button" className="cn-x" onClick={() => dismissToast(n._id)} aria-label="Dismiss"><CloseRoundedIcon /></button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

const CN_CSS = `
.cn { position: relative; }
.cn-bell { position: relative; width: 40px; height: 40px; border-radius: 11px; border: 0; background: transparent; color: #fff; display: grid; place-items: center; cursor: pointer; }
.cn-bell:hover { background: rgba(255,255,255,.14); } .cn-bell svg { font-size: 23px; }
.cn-badge { position: absolute; top: 4px; right: 3px; min-width: 18px; height: 18px; padding: 0 5px; border-radius: 999px; background: #f43f5e; color: #fff; font-size: 10.5px; font-weight: 800; display: grid; place-items: center; border: 2px solid #14532d; }
.cn-panel { position: absolute; right: -6px; top: calc(100% + 8px); width: 360px; max-height: min(520px, 75vh); display: flex; flex-direction: column; background: #fff; border: 1px solid #e4ece7; border-radius: 16px; box-shadow: 0 22px 50px rgba(15,23,42,.22); z-index: 1300; overflow: hidden; }
.cn-head { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; border-bottom: 1px solid #eef2f0; }
.cn-head b { font-size: 15px; color: #0f172a; }
.cn-head button { border: 0; background: none; color: #166534; font-weight: 800; font-size: 12.5px; cursor: pointer; font-family: inherit; }
.cn-allow { margin: 10px 12px 0; border: 1px dashed #c7d2fe; background: #eef2ff; color: #3730a3; border-radius: 10px; padding: 8px 10px; font-size: 12.5px; font-weight: 700; cursor: pointer; text-align: left; font-family: inherit; }
.cn-list { overflow-y: auto; padding: 6px; }
.cn-row { display: flex; gap: 10px; width: 100%; text-align: left; border: 0; background: none; padding: 10px; border-radius: 12px; cursor: pointer; font-family: inherit; }
.cn-row:hover { background: #f6f8f7; }
.cn-row.unread { background: #f0fdf4; }
.cn-ic { width: 36px; height: 36px; border-radius: 11px; display: grid; place-items: center; flex-shrink: 0; }
.cn-ic svg { font-size: 20px; }
.cn-ic.mint { background: #dcfce7; color: #15803d; } .cn-ic.sky { background: #e0f2fe; color: #0369a1; } .cn-ic.butter { background: #fef3c7; color: #b45309; }
.cn-ic.lilac { background: #ede9fe; color: #6d28d9; } .cn-ic.blush { background: #ffe4e6; color: #be123c; }
.cn-txt { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.cn-txt b { font-size: 13.5px; color: #0f172a; line-height: 1.3; }
.cn-txt span { font-size: 12.5px; color: #475569; line-height: 1.4; }
.cn-txt em { font-style: normal; font-size: 11px; color: #94a3b8; margin-top: 2px; }
.cn-empty { margin: 0; padding: 28px 18px; text-align: center; font-size: 13px; color: #64748b; }
.cn-toasts { position: fixed; top: calc(var(--cls-h, 60px) + 10px); right: 14px; z-index: 1450; display: flex; flex-direction: column; gap: 8px; width: min(360px, calc(100vw - 24px)); }
.cn-toast { display: flex; align-items: flex-start; background: #fff; border: 1px solid #e4ece7; border-left: 4px solid #22c55e; border-radius: 14px; box-shadow: 0 16px 36px -12px rgba(15,23,42,.35); animation: cnIn .25s ease; }
@keyframes cnIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }
.cn-toast-body { flex: 1; display: flex; gap: 10px; border: 0; background: none; padding: 12px; text-align: left; cursor: pointer; font-family: inherit; min-width: 0; }
.cn-x { border: 0; background: none; color: #94a3b8; padding: 10px 10px 0 0; cursor: pointer; line-height: 0; }
.cn-x svg { font-size: 18px; }
@media (max-width: 767px) {
  .cn-panel { position: fixed; left: 10px; right: 10px; top: calc(var(--cls-h, 60px) + 6px); width: auto; }
  .cn-toasts { left: 12px; right: 12px; width: auto; }
}
`;
