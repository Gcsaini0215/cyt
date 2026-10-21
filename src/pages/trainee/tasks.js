import React, { useEffect, useState } from "react";
import TraineeLayout, { useTraineePortal } from "../../components/trainee/trainee-layout";
import { tApi, fmtDate } from "../../utils/trainee-api";

/* Tasks the CYT team sends. The trainee moves each one To do → In progress → Done and can reply with a note / link. */
const STATUS = [
  { k: "todo", label: "To do" },
  { k: "doing", label: "In progress" },
  { k: "done", label: "Done" },
];
const dayStart = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };

function Tasks() {
  const { live } = useTraineePortal();
  const [list, setList] = useState(null);
  const [tab, setTab] = useState("open");
  const [err, setErr] = useState("");
  const load = async () => {
    const r = await tApi("/trainee-portal/tasks");
    if (r.status) setList(Array.isArray(r.data) ? r.data : []); else setErr(r.message || "Couldn't load tasks");
  };
  useEffect(() => { load(); }, []);
  useEffect(() => { if (live) load(); }, [live]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!list) return err ? <div className="tl-err">{err}</div> : <div className="tp-load">Loading your tasks…</div>;
  const open = list.filter((t) => t.status !== "done");
  const done = list.filter((t) => t.status === "done");
  const shown = tab === "open" ? open : done;
  const put = (t) => setList((l) => l.map((x) => (x._id === t._id ? t : x)));

  return (
    <>
      <div className="tp-h">
        <div>
          <h1>Tasks</h1>
          <p>Work sent to you by the CYT team. Mark each one done when you finish it.</p>
        </div>
        <div className="tp-tabs" role="tablist">
          <button type="button" role="tab" aria-selected={tab === "open"} className={tab === "open" ? "on" : ""} onClick={() => setTab("open")}>Open ({open.length})</button>
          <button type="button" role="tab" aria-selected={tab === "done"} className={tab === "done" ? "on" : ""} onClick={() => setTab("done")}>Done ({done.length})</button>
        </div>
      </div>
      {shown.length === 0 ? (
        <div className="tp-card tp-empty">
          <i className={tab === "open" ? "feather-coffee" : "feather-check-circle"} aria-hidden="true" />
          <b>{tab === "open" ? "No open tasks" : "Nothing finished yet"}</b>
          {tab === "open" ? "New tasks from the CYT team will appear here — we'll email you too." : "Tasks you mark as done will show here."}
        </div>
      ) : (
        <div className="tk-list">{shown.map((t) => <TaskCard key={t._id} t={t} onSaved={put} />)}</div>
      )}
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
    </>
  );
}

function TaskCard({ t, onSaved }) {
  const [note, setNote] = useState(t.traineeNote || "");
  const [link, setLink] = useState(t.link || "");
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState(null);
  const [open, setOpen] = useState(false);
  const overdue = t.due && t.status !== "done" && dayStart(t.due) < dayStart(new Date());
  const dueToday = t.due && t.status !== "done" && dayStart(t.due).getTime() === dayStart(new Date()).getTime();

  const save = async (patch, what) => {
    setBusy(what); setMsg(null);
    const r = await tApi(`/trainee-portal/tasks/${t._id}`, { method: "PATCH", body: patch });
    setBusy("");
    if (!r.status) { setMsg({ bad: true, text: r.message || "Couldn't save" }); return; }
    setMsg({ text: r.message || "Saved" });
    onSaved(r.data);
  };

  return (
    <article className={`tp-card tk${t.status === "done" ? " is-done" : ""}`}>
      <div className="tk-top">
        <div className="tk-tags">
          {t.priority === "high" && <span className="tk-tag hi">High priority</span>}
          {t.priority === "low" && <span className="tk-tag lo">Low priority</span>}
          {t.due && <span className={`tk-tag due${overdue ? " late" : ""}${dueToday ? " today" : ""}`}><i className="feather-calendar" aria-hidden="true" /> {overdue ? "Overdue · " : dueToday ? "Due today · " : "Due "}{fmtDate(t.due, { day: "numeric", month: "short" })}</span>}
          <span className="tk-from">From {t.createdBy || "CYT team"} · {fmtDate(t.createdAt, { day: "numeric", month: "short" })}</span>
        </div>
        <h3>{t.title}</h3>
        {t.details && <p className="tk-details">{t.details}</p>}
      </div>
      <div className="tk-status" role="group" aria-label="Task status">
        {STATUS.map((s) => (
          <button key={s.k} type="button" className={`tk-st ${s.k}${t.status === s.k ? " on" : ""}`} disabled={!!busy} aria-pressed={t.status === s.k}
            onClick={() => t.status !== s.k && save({ status: s.k, traineeNote: note, link }, s.k)}>
            {s.k === "done" && <i className="feather-check" aria-hidden="true" />} {busy === s.k ? "Saving…" : s.label}
          </button>
        ))}
        <button type="button" className="tk-more" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          {open ? "Hide reply" : t.traineeNote || t.link ? "View reply" : "Add a reply"} <i className={open ? "feather-chevron-up" : "feather-chevron-down"} aria-hidden="true" />
        </button>
      </div>
      {open && (
        <div className="tk-reply">
          <label htmlFor={`n-${t._id}`}>Your note to the team</label>
          <textarea id={`n-${t._id}`} rows={3} maxLength={2000} value={note} onChange={(e) => setNote(e.target.value)} placeholder="What did you do? Any questions?" />
          <label htmlFor={`l-${t._id}`}>Link to your work <span>(Google Drive, Docs … optional)</span></label>
          <input id={`l-${t._id}`} type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://" />
          <div className="tk-a">
            {msg && <span className={msg.bad ? "tk-bad" : "tk-ok"}>{msg.text}</span>}
            <button type="button" className="tl-btn ghost sm" disabled={!!busy} onClick={() => save({ traineeNote: note, link }, "note")}>{busy === "note" ? "Saving…" : "Save reply"}</button>
          </div>
        </div>
      )}
    </article>
  );
}

const CSS = `
.tk-list { display: grid; gap: 14px; }
.tk.is-done { background: #fbfdfc; }
.tk.is-done h3 { color: #64748b; }
.tk-tags { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-bottom: 8px; }
.tk-tag { font-size: 11.5px; font-weight: 800; border-radius: 999px; padding: 3px 10px; display: inline-flex; align-items: center; gap: 5px; }
.tk-tag.hi { background: #fef2f2; color: #b91c1c; }
.tk-tag.lo { background: #f1f5f9; color: #64748b; }
.tk-tag.due { background: #f0faf3; color: #166534; }
.tk-tag.due.today { background: #fff7e6; color: #b45309; }
.tk-tag.due.late { background: #fef2f2; color: #b91c1c; }
.tk-from { font-size: 12px; color: #94a3b8; font-weight: 600; }
.tk h3 { margin: 0; font-size: 17px; font-weight: 800; color: #0f172a; line-height: 1.35; }
.tk-details { margin: 8px 0 0; font-size: 14px; color: #475569; line-height: 1.6; white-space: pre-line; overflow-wrap: anywhere; }
.tk-status { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-top: 16px; padding-top: 14px; border-top: 1px solid #eef2f0; }
.tk-st { height: 34px; padding: 0 14px; border-radius: 999px; border: 1.5px solid #e2e8e4; background: #fff; font: inherit; font-size: 13px; font-weight: 700; color: #475569; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; }
.tk-st:hover:not(:disabled) { border-color: #b7dcc4; color: #166534; }
.tk-st.on.todo { background: #f1f5f9; border-color: #cbd5e1; color: #334155; }
.tk-st.on.doing { background: #fff7e6; border-color: #ecc77d; color: #8a5a0b; }
.tk-st.on.done { background: #15803d; border-color: #15803d; color: #fff; }
.tk-st:disabled { cursor: wait; }
.tk-more { margin-left: auto; border: none; background: none; font: inherit; font-size: 13px; font-weight: 700; color: #15803d; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; }
.tk-reply { margin-top: 14px; display: grid; gap: 6px; }
.tk-reply label { font-size: 13px; font-weight: 800; color: #1e293b; margin-top: 4px; }
.tk-reply label span { color: #94a3b8; font-weight: 600; }
.tk-reply textarea, .tk-reply input { width: 100%; box-sizing: border-box; border: 1.5px solid #dbe5df; border-radius: 12px; padding: 10px 12px; font: inherit; font-size: 14px; outline: none; resize: vertical; }
.tk-reply textarea:focus, .tk-reply input:focus { border-color: #15803d; box-shadow: 0 0 0 3px rgba(21,128,61,.12); }
.tk-a { display: flex; align-items: center; justify-content: flex-end; gap: 10px; margin-top: 4px; flex-wrap: wrap; }
.tk-ok { font-size: 13px; color: #166534; font-weight: 700; }
.tk-bad { font-size: 13px; color: #b91c1c; font-weight: 700; }
@media (max-width: 640px) { .tk-more { margin-left: 0; width: 100%; justify-content: flex-start; padding-top: 4px; } .tk-st { flex: 1; justify-content: center; padding: 0 8px; } }
`;

export default function TasksPage() {
  return <TraineeLayout title="Tasks"><Tasks /></TraineeLayout>;
}
