import React, { useEffect, useState } from "react";
import TraineeLayout from "../../components/trainee/trainee-layout";
import { tApi, fileUrl, fmtDate } from "../../utils/trainee-api";

/* Notes: worksheets, slides and reading the CYT team shares with trainees. */
const KINDS = [
  { k: "all", label: "All" },
  { k: "worksheet", label: "Worksheets", icon: "feather-edit-3" },
  { k: "ppt", label: "Slides", icon: "feather-monitor" },
  { k: "notes", label: "Notes", icon: "feather-file-text" },
  { k: "other", label: "Other", icon: "feather-paperclip" },
];
const iconOf = (k) => (KINDS.find((x) => x.k === k) || KINDS[3]).icon;
const extOf = (n) => (String(n || "").split(".").pop() || "").toUpperCase();

function Notes() {
  const [list, setList] = useState(null);
  const [kind, setKind] = useState("all");
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");
  useEffect(() => {
    tApi("/trainee-portal/notes").then((r) => (r.status ? setList(r.data) : setErr(r.message || "Couldn't load notes")));
  }, []);
  if (!list) return err ? <div className="tl-err">{err}</div> : <div className="tp-load">Loading notes…</div>;
  const term = q.trim().toLowerCase();
  const shown = list.filter((n) => (kind === "all" || n.kind === kind) && (!term || `${n.title} ${n.details}`.toLowerCase().includes(term)));
  const isNew = (d) => Date.now() - new Date(d).getTime() < 7 * 86400000;

  return (
    <>
      <div className="tp-h">
        <div>
          <h1>Notes</h1>
          <p>Worksheets, slides and reading shared by the CYT team.</p>
        </div>
      </div>
      <div className="nt-bar">
        <div className="nt-kinds">
          {KINDS.map((k) => (
            <button key={k.k} type="button" className={kind === k.k ? "on" : ""} onClick={() => setKind(k.k)} aria-pressed={kind === k.k}>
              {k.label}{k.k !== "all" ? ` (${list.filter((n) => n.kind === k.k).length})` : ""}
            </button>
          ))}
        </div>
        <label className="nt-search"><i className="feather-search" aria-hidden="true" /><input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search notes" aria-label="Search notes" /></label>
      </div>
      {shown.length === 0 ? (
        <div className="tp-card tp-empty"><i className="feather-book-open" aria-hidden="true" /><b>{list.length ? "Nothing matches" : "No notes yet"}</b>{list.length ? "Try another filter." : "When the team shares worksheets or slides, they'll appear here."}</div>
      ) : (
        <div className="nt-grid">
          {shown.map((n) => (
            <article key={n._id} className="tp-card nt">
              <div className="nt-ic" aria-hidden="true"><i className={iconOf(n.kind)} /></div>
              <div className="nt-meta">
                <span>{(KINDS.find((x) => x.k === n.kind) || KINDS[3]).label.replace(/s$/, "")}</span>
                {n.fileName && <span>{extOf(n.fileName)}</span>}
                {isNew(n.createdAt) && <span className="new">New</span>}
              </div>
              <h3>{n.title}</h3>
              {n.details && <p>{n.details}</p>}
              <div className="nt-f">
                <small>{fmtDate(n.createdAt, { day: "numeric", month: "short", year: "numeric" })}</small>
                <div>
                  {n.file && <a className="tl-btn sm" href={fileUrl(n.file)} target="_blank" rel="noreferrer" download={n.fileName || true}><i className="feather-download" aria-hidden="true" /> Download</a>}
                  {n.link && <a className="tl-btn ghost sm" href={n.link} target="_blank" rel="noreferrer"><i className="feather-external-link" aria-hidden="true" /> Open</a>}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
    </>
  );
}

const CSS = `
.nt-bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; }
.nt-kinds { display: flex; gap: 6px; flex-wrap: wrap; }
.nt-kinds button { height: 34px; padding: 0 14px; border-radius: 999px; border: 1px solid #e2e8e4; background: #fff; font: inherit; font-size: 13px; font-weight: 700; color: #475569; cursor: pointer; }
.nt-kinds button.on { background: #14532d; border-color: #14532d; color: #fff; }
.nt-search { display: flex; align-items: center; gap: 8px; height: 38px; padding: 0 12px; background: #fff; border: 1px solid #e2e8e4; border-radius: 12px; min-width: 240px; }
.nt-search i { color: #94a3b8; }
.nt-search input { border: none; outline: none; font: inherit; font-size: 14px; width: 100%; background: none; }
.nt-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
.nt { display: flex; flex-direction: column; }
.nt-ic { width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #fff6dc, #fdecc0); color: #8a5a0b; display: grid; place-items: center; font-size: 20px; margin-bottom: 12px; }
.nt-meta { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 6px; }
.nt-meta span { font-size: 11px; font-weight: 800; color: #64748b; background: #f1f5f3; border-radius: 999px; padding: 2px 9px; text-transform: uppercase; letter-spacing: .04em; }
.nt-meta .new { background: #15803d; color: #fff; }
.nt h3 { margin: 0; font-size: 16px; font-weight: 800; color: #0f172a; line-height: 1.35; overflow-wrap: anywhere; }
.nt p { margin: 6px 0 0; font-size: 13.5px; color: #64748b; line-height: 1.55; white-space: pre-line; overflow-wrap: anywhere; }
.nt-f { margin-top: auto; padding-top: 14px; display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
.nt-f small { font-size: 12px; color: #94a3b8; font-weight: 600; }
.nt-f > div { display: flex; gap: 6px; }
@media (max-width: 640px) { .nt-search { min-width: 0; width: 100%; } .nt-kinds { flex-wrap: nowrap; overflow-x: auto; width: 100%; padding-bottom: 2px; } .nt-kinds button { flex-shrink: 0; } }
`;

export default function NotesPage() {
  return <TraineeLayout title="Notes"><Notes /></TraineeLayout>;
}
