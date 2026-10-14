import React, { useEffect, useState } from "react";
import Link from "next/link";
import useCommsStore from "../../store/commsStore";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

/* Messages from the CYT team: the dashboard banner and the "From the CYT team" section
   on the Notifications page. Data comes from the shared comms store (polled by the top bar). */

const day = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "");
const isExternal = (l) => /^https?:\/\//i.test(l || "");

function CtaLink({ href, children, className }) {
  if (!href) return null;
  return isExternal(href)
    ? <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>
    : <Link href={href} className={className}>{children}</Link>;
}

// newest unread notice (important ones first) on the dashboard
export function TeamBanner() {
  const announcements = useCommsStore((s) => s.announcements);
  const markRead = useCommsStore((s) => s.markRead);
  const unread = announcements.filter((a) => !a.read);
  if (!unread.length) return null;
  const a = [...unread].sort((x, y) => (y.important - x.important) || (new Date(y.createdAt) - new Date(x.createdAt)))[0];
  return (
    <div className={`tib${a.important ? " imp" : ""}`} role="status">
      <style dangerouslySetInnerHTML={{ __html: TI_CSS }} />
      <span className="tib-ic"><CampaignRoundedIcon /></span>
      <div className="tib-body">
        <div className="tib-top">
          <span className="tib-from">{a.important ? "Important · " : ""}From the CYT team · {day(a.createdAt)}</span>
          {unread.length > 1 && <Link href="/therapists/notifications" className="tib-more">+{unread.length - 1} more</Link>}
        </div>
        <b>{a.title}</b>
        {a.body && <p>{a.body}</p>}
        <div className="tib-acts">
          {a.link && <CtaLink href={a.link} className="tib-btn primary">{a.linkLabel || "Open"}</CtaLink>}
          <button type="button" className="tib-btn" onClick={() => markRead(a._id)}>Got it</button>
        </div>
      </div>
      <button type="button" className="tib-x" onClick={() => markRead(a._id)} aria-label="Dismiss"><CloseRoundedIcon /></button>
    </div>
  );
}

// open requests as To-do items for the dashboard
export function useActionTodos() {
  const actions = useCommsStore((s) => s.actions);
  const completeAction = useCommsStore((s) => s.completeAction);
  return actions.filter((a) => a.status === "open").map((a) => {
    const overdue = a.dueDate && new Date(a.dueDate) < new Date();
    return {
      key: a._id,
      label: `${a.title}${a.dueDate ? ` · ${overdue ? "overdue" : "by " + day(a.dueDate)}` : ""}`,
      href: a.link || "",
      cta: "Open",
      tone: overdue ? "bad" : "warn",
      onDone: () => completeAction(a._id),
    };
  });
}

// full list on the Notifications page; visible notices are marked read after a moment
export function TeamInboxSection() {
  const { announcements, actions, loaded, markRead, completeAction, fetchInbox } = useCommsStore();
  const [busy, setBusy] = useState("");
  useEffect(() => { fetchInbox(); }, [fetchInbox]);
  useEffect(() => {
    const ids = announcements.filter((a) => !a.read).map((a) => a._id);
    if (!ids.length) return undefined;
    const t = setTimeout(() => ids.forEach((id) => markRead(id)), 2500);
    return () => clearTimeout(t);
  }, [announcements, markRead]);

  if (!loaded || (!announcements.length && !actions.length)) return null;
  const open = actions.filter((a) => a.status === "open");
  const done = actions.filter((a) => a.status === "done");

  const finish = async (id) => { setBusy(id); try { await completeAction(id); } catch (e) { /* keep it open */ } setBusy(""); };

  return (
    <section className="tis" aria-label="From the CYT team">
      <style dangerouslySetInnerHTML={{ __html: TI_CSS }} />
      <div className="tis-h"><CampaignRoundedIcon /><b>From the CYT team</b></div>
      {open.length > 0 && (
        <ul className="tis-list">
          {open.map((a) => {
            const overdue = a.dueDate && new Date(a.dueDate) < new Date();
            return (
              <li key={a._id} className="act">
                <span className="tis-dot warn" />
                <div className="tis-txt">
                  <span className="tis-kicker">Action needed{a.dueDate ? ` · ${overdue ? "overdue since" : "by"} ${day(a.dueDate)}` : ""}</span>
                  <b>{a.title}</b>
                  {a.body && <p>{a.body}</p>}
                  <div className="tib-acts">
                    {a.link && <CtaLink href={a.link} className="tib-btn primary">Open</CtaLink>}
                    <button type="button" className="tib-btn" disabled={busy === a._id} onClick={() => finish(a._id)}><TaskAltRoundedIcon /> {busy === a._id ? "Saving…" : "Mark as done"}</button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <ul className="tis-list">
        {announcements.map((a) => (
          <li key={a._id} className={a.read ? "" : "new"}>
            <span className={`tis-dot${a.important ? " imp" : ""}`} />
            <div className="tis-txt">
              <span className="tis-kicker">{a.important ? "Important · " : ""}{day(a.createdAt)}{!a.read && <em>New</em>}</span>
              <b>{a.title}</b>
              {a.body && <p>{a.body}</p>}
              {a.link && <div className="tib-acts"><CtaLink href={a.link} className="tib-btn">{a.linkLabel || "Open"}</CtaLink></div>}
            </div>
          </li>
        ))}
        {done.map((a) => (
          <li key={a._id} className="done">
            <span className="tis-dot ok" />
            <div className="tis-txt"><span className="tis-kicker">Done · {day(a.doneAt)}</span><b>{a.title}</b></div>
          </li>
        ))}
      </ul>
    </section>
  );
}

const TI_CSS = `
.tib { position: relative; display: flex; gap: 12px; align-items: flex-start; background: linear-gradient(135deg, #f0fdf4, #ffffff 70%); border: 1px solid #bbe5c8;
  border-radius: 16px; padding: 14px 44px 14px 14px; margin-bottom: 14px; font-family: inherit; }
.tib.imp { background: linear-gradient(135deg, #fffbeb, #ffffff 70%); border-color: #fcd34d; }
.tib-ic { width: 40px; height: 40px; border-radius: 12px; background: #166534; color: #fff; display: grid; place-items: center; flex-shrink: 0; }
.tib.imp .tib-ic { background: #d97706; }
.tib-body { flex: 1; min-width: 0; }
.tib-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.tib-from { font-size: 11.5px; font-weight: 800; letter-spacing: .3px; text-transform: uppercase; color: #166534; }
.tib.imp .tib-from { color: #b45309; }
.tib-more { font-size: 12.5px; font-weight: 700; color: #166534 !important; text-decoration: none !important; white-space: nowrap; }
.tib b, .tis-txt b { display: block; font-size: 15px; font-weight: 800; color: #0f172a; margin-top: 3px; line-height: 1.35; }
.tib p, .tis-txt p { font-size: 13.5px; color: #475569; margin: 4px 0 0; line-height: 1.55; white-space: pre-wrap; word-break: break-word; }
.tib p { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.tib-acts { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
.tib-btn { display: inline-flex; align-items: center; gap: 6px; height: 36px; padding: 0 14px; border-radius: 10px; border: 1px solid #cfe3d6; background: #fff;
  color: #166534 !important; font-weight: 700; font-size: 13px; font-family: inherit; text-decoration: none !important; cursor: pointer; }
.tib-btn svg { font-size: 17px; }
.tib-btn.primary { background: #166534; border-color: #166534; color: #fff !important; }
.tib-btn:disabled { opacity: .6; cursor: default; }
.tib-x { position: absolute; top: 10px; right: 10px; width: 30px; height: 30px; border-radius: 9px; border: 0; background: transparent; color: #64748b; display: grid; place-items: center; cursor: pointer; }
.tib-x:hover { background: rgba(15,23,42,.06); }
.tib-x svg { font-size: 18px; }

.tis { background: #fff; border: 1px solid #e4ece7; border-radius: 16px; padding: 14px 16px; margin-bottom: 14px; font-family: inherit; }
.tis-h { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; color: #166534; }
.tis-h b { font-size: 15px; font-weight: 800; color: #0f172a; }
.tis-list { list-style: none; margin: 0; padding: 0; }
.tis-list li { display: flex; gap: 12px; padding: 12px 0; border-top: 1px solid #eef2f0; margin: 0; }
.tis-list:first-of-type li:first-child { border-top: 0; }
.tis-list li.act { background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 12px; margin: 6px 0; }
.tis-list li.done b { color: #64748b; font-weight: 700; text-decoration: line-through; font-size: 13.5px; }
.tis-dot { width: 9px; height: 9px; border-radius: 50%; background: #cbd5e1; flex-shrink: 0; margin-top: 6px; }
.tis-list li.new .tis-dot { background: #16a34a; } .tis-dot.imp { background: #d97706 !important; } .tis-dot.warn { background: #d97706; } .tis-dot.ok { background: #16a34a; }
.tis-txt { flex: 1; min-width: 0; }
.tis-kicker { font-size: 11.5px; font-weight: 700; color: #64748b; display: flex; align-items: center; gap: 6px; }
.tis-kicker em { font-style: normal; font-size: 10.5px; font-weight: 800; color: #fff; background: #16a34a; border-radius: 999px; padding: 0 7px; line-height: 17px; }
@media (max-width: 767px) { .tib { padding: 12px 40px 12px 12px; } .tib-ic { width: 34px; height: 34px; } }
`;
