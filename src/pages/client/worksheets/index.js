import React, { useEffect, useState } from "react";
import Link from "next/link";
import ClientShell from "../../../components/client/client-shell";
import { fetchById } from "../../../utils/actions";
import { apiUrl } from "../../../utils/url";
import { bookPath } from "../../../utils/therapist-slug";

/* My Space → Worksheets: worksheets my therapist sent me (or I opened from a therapist's link).
   Filled right here — nothing to download. */
const STATUS = { assigned: ["New", "new"], draft: ["In progress", "draft"], submitted: ["Sent — waiting for review", "sent"], reviewed: ["Reviewed ✓", "done"] };
const dt = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" }) : "");

export default function MyWorksheetsPage() {
  const [rows, setRows] = useState(null);
  useEffect(() => {
    fetchById(`${apiUrl}/my-worksheets`).then((r) => setRows(r?.status ? r.data : [])).catch(() => setRows([]));
  }, []);
  return (
    <ClientShell title="Worksheets">
      <style>{CSS}</style>
      <div className="wk">
        <div className="wk-h">
          <h1>Worksheets</h1>
          <p>Exercises from your therapist. Fill them here at your own pace — they save as you type, and your therapist sees them only when you press Send.</p>
        </div>
        {rows === null ? <div className="wk-empty">Loading…</div> : rows.length === 0 ? (
          <div className="wk-empty">
            <b>No worksheets yet</b>
            <p>When your therapist sends you one (like the ABCD thought log), it shows up here.</p>
            <Link href="/client/find" className="wk-btn">Find a therapist</Link>
          </div>
        ) : (
          <ul className="wk-list">
            {rows.map((w) => {
              const [label, tone] = STATUS[w.status] || STATUS.draft;
              return (
                <li key={w._id}>
                  <Link href={`/client/worksheets/${w._id}`} className="wk-row">
                    <span className="wk-ic" aria-hidden="true">ABCD</span>
                    <span className="wk-t">
                      <b>{w.title}</b>
                      <small>{w.therapist ? `From ${w.therapist.name}` : "My worksheet"}{w.preview ? ` · “${w.preview}”` : w.note ? ` · ${w.note}` : ""}</small>
                    </span>
                    <span className="wk-r"><em className={`wk-st ${tone}`}>{label}</em><small>{dt(w.updatedAt)}</small></span>
                  </Link>
                  {w.status === "reviewed" && w.therapist?.live && <Link href={bookPath(w.therapist)} className="wk-book">Talk it through with {w.therapist.name} →</Link>}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </ClientShell>
  );
}

const CSS = `
.wk { max-width: 860px; margin: 0 auto; }
.wk-h h1 { margin: 0; font-size: 26px; font-weight: 800; color: #0f1f17; }
.wk-h p { margin: 6px 0 18px; font-size: 14.5px; color: #475569; line-height: 1.5; }
.wk-empty { background: #fff; border: 1px solid #e3e9e5; border-radius: 18px; padding: 34px 20px; text-align: center; color: #64748b; }
.wk-empty b { display: block; font-size: 17px; color: #0f1f17; }
.wk-empty p { margin: 6px 0 14px; }
.wk-btn { display: inline-flex; height: 42px; align-items: center; padding: 0 18px; border-radius: 12px; background: #14532d; color: #fff !important; font-weight: 800; text-decoration: none !important; }
.wk-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.wk-list li { background: #fff; border: 1px solid #e3e9e5; border-radius: 16px; overflow: hidden; }
.wk-row { display: flex; align-items: center; gap: 12px; padding: 14px; text-decoration: none !important; color: inherit; }
.wk-row:hover { background: #f8fbf9; }
.wk-ic { flex: none; width: 52px; height: 52px; border-radius: 14px; display: grid; place-items: center; font-size: 11.5px; font-weight: 900; letter-spacing: .04em; color: #fff; background: linear-gradient(135deg, #2563eb, #7c3aed 45%, #ea580c 75%, #16a34a); }
.wk-t { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.wk-t b { font-size: 15.5px; color: #0f1f17; }
.wk-t small { font-size: 13px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.wk-r { flex: none; display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.wk-r small { font-size: 12px; color: #94a3b8; }
.wk-st { font-style: normal; font-size: 11.5px; font-weight: 800; border-radius: 999px; padding: 3px 10px; white-space: nowrap; }
.wk-st.new { background: #fee2e2; color: #b91c1c; } .wk-st.draft { background: #fff4dd; color: #92651a; }
.wk-st.sent { background: #eaf1ff; color: #1d4ed8; } .wk-st.done { background: #e9f8ef; color: #15803d; }
.wk-book { display: block; padding: 10px 14px; border-top: 1px solid #eef2f0; background: #f6fbf8; font-size: 13.5px; font-weight: 800; color: #15803d !important; text-decoration: none !important; }
@media (max-width: 560px) { .wk-r small { display: none; } .wk-st { font-size: 10.5px; padding: 2px 8px; } .wk-ic { width: 44px; height: 44px; font-size: 10px; } }
`;
