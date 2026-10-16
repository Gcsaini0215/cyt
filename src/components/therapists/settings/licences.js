import React, { useEffect, useState } from "react";
import { fetchById, postData, deleteById } from "../../../utils/actions";
import { apiUrl } from "../../../utils/url";
import { LICENSED_TESTS } from "../../self-assessment/tests";
import { Section } from "./settings-ui";

/* Settings → Licences: the copyrighted questionnaires (ISI, PSS-10, BDI-II…) this therapist holds a
   licence for. Clients asking for one of them on /self-assessment see only licensed therapists. */

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "");
const toInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");

export default function Licences() {
  const [mine, setMine] = useState(null); // tool -> { details, validTill }
  const [edit, setEdit] = useState(null); // { tool, details, validTill }
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ text: "", err: false });

  const load = () => fetchById(`${apiUrl}/assessment-licences/mine`)
    .then((r) => setMine(Object.fromEntries((r?.data || []).map((x) => [x.tool, x]))))
    .catch(() => { setMine({}); setMsg({ text: "Couldn't load your licences — refresh to try again", err: true }); });
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!edit) return;
    if (edit.details.trim().length < 4) { setMsg({ text: "Please add your licence or permission details.", err: true }); return; }
    setBusy(true); setMsg({ text: "", err: false });
    try {
      const r = await postData(`${apiUrl}/assessment-licences`, { tool: edit.tool, details: edit.details.trim(), validTill: edit.validTill || null, formUrl: (edit.formUrl || "").trim(), instructions: (edit.instructions || "").trim() });
      if (!r?.status) throw new Error(r?.message);
      setEdit(null);
      setMsg({ text: "Licence saved — clients asking for this questionnaire will now see you.", err: false });
      await load();
    } catch (e) {
      setMsg({ text: e?.response?.data?.message || e?.message || "Couldn't save — please try again", err: true });
    }
    setBusy(false);
  };
  const remove = async (tool) => {
    if (!window.confirm("Remove this licence? You'll no longer be shown for this questionnaire.")) return;
    setBusy(true);
    try { await deleteById(`${apiUrl}/assessment-licences/${tool}`); await load(); setMsg({ text: "Licence removed.", err: false }); }
    catch (e) { setMsg({ text: "Couldn't remove — please try again", err: true }); }
    setBusy(false);
  };

  const expired = (x) => x?.validTill && new Date(x.validTill) < new Date();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: LIC_CSS }} />
      <Section
        title="Questionnaire licences"
        sub="Some clinical questionnaires are copyrighted and can only be used with a licence. Add the ones you hold — clients who want that questionnaire on our Self Assessment page are shown only licensed psychologists. Your licence details are never shown to clients."
      >
        {msg.text && <p className={`lic-msg${msg.err ? " err" : ""}`} role="status">{msg.text}</p>}
        {mine === null ? <div className="lic-skel" /> : (
          <div className="lic-list">
            {LICENSED_TESTS.map((t) => {
              const have = mine[t.key];
              const editing = edit?.tool === t.key;
              return (
                <div key={t.key} className={`lic-row${have ? " on" : ""}`}>
                  <div className="lic-top">
                    <div className="lic-name">
                      <b>{t.title} <em>{t.short}</em></b>
                      <span>{t.holder}</span>
                    </div>
                    {!editing && (have ? (
                      <div className="lic-acts">
                        <button type="button" className="lic-btn ghost" onClick={() => setEdit({ tool: t.key, details: have.details, validTill: toInput(have.validTill), formUrl: have.formUrl || "", instructions: have.instructions || "" })} disabled={busy}>Edit</button>
                        <button type="button" className="lic-btn danger" onClick={() => remove(t.key)} disabled={busy}>Remove</button>
                      </div>
                    ) : (
                      <button type="button" className="lic-btn" onClick={() => setEdit({ tool: t.key, details: "", validTill: "", formUrl: "", instructions: "" })} disabled={busy}>+ Add licence</button>
                    ))}
                  </div>
                  {have && !editing && (
                    <p className={`lic-have${expired(have) ? " exp" : ""}`}>
                      {expired(have) ? "⚠ Expired" : "✓ Licensed"} · {have.details}{have.validTill ? ` · valid till ${fmtDate(have.validTill)}` : ""}
                      <br />{have.formUrl ? <>Clients fill it at: <a href={have.formUrl} target="_blank" rel="noopener noreferrer">{have.formUrl}</a></> : <span className="lic-nolink">No online form link — clients will be told you&apos;ll take them through it in the session.</span>}
                    </p>
                  )}
                  {editing && (
                    <div className="lic-form">
                      <label htmlFor={`lic-d-${t.key}`}>Licence / permission details</label>
                      <textarea id={`lic-d-${t.key}`} rows={2} maxLength={400} placeholder="e.g. Licence no. / order no., issued by (Mapi, Pearson, Mind Garden, author permission…)" value={edit.details} onChange={(e) => setEdit({ ...edit, details: e.target.value })} />
                      <label htmlFor={`lic-v-${t.key}`}>Valid till <span>(leave empty if it doesn&apos;t expire)</span></label>
                      <input id={`lic-v-${t.key}`} type="date" value={edit.validTill} onChange={(e) => setEdit({ ...edit, validTill: e.target.value })} />
                      <label htmlFor={`lic-f-${t.key}`}>Your licensed online form link <span>(sent to clients before their session)</span></label>
                      <input id={`lic-f-${t.key}`} type="url" className="lic-url" placeholder="https://… (your licensed e-form, e.g. Q-global / ePROVIDE / your own licensed form)" value={edit.formUrl} onChange={(e) => setEdit({ ...edit, formUrl: e.target.value })} />
                      <label htmlFor={`lic-i-${t.key}`}>Instructions for the client <span>(optional)</span></label>
                      <textarea id={`lic-i-${t.key}`} rows={2} maxLength={300} placeholder="e.g. Use the code I send on WhatsApp. Takes about 5 minutes." value={edit.instructions} onChange={(e) => setEdit({ ...edit, instructions: e.target.value })} />
                      <div className="lic-acts">
                        <button type="button" className="lic-btn" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save licence"}</button>
                        <button type="button" className="lic-btn ghost" onClick={() => setEdit(null)} disabled={busy}>Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Section>
    </>
  );
}

const LIC_CSS = `
.lic-msg { margin: 0 0 12px; font-size: 13.5px; font-weight: 700; color: #166534; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 9px 12px; }
.lic-msg.err { color: #b91c1c; background: #fef2f2; border-color: #fecaca; }
.lic-skel { height: 200px; border-radius: 12px; background: #f1f5f4; }
.lic-list { display: flex; flex-direction: column; gap: 10px; }
.lic-row { border: 1px solid #e3eae6; border-radius: 14px; padding: 12px 14px; background: #fff; }
.lic-row.on { border-color: #bbf7d0; background: #fbfefc; }
.lic-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.lic-name { min-width: 0; flex: 1 1 260px; }
.lic-name b { display: block; font-size: 14.5px; color: #0f172a; } .lic-name em { font-style: normal; font-size: 12px; color: #166534; margin-left: 4px; }
.lic-name span { display: block; font-size: 12px; color: #64748b; margin-top: 2px; }
.lic-acts { display: flex; gap: 8px; flex-wrap: wrap; }
.lic-btn { height: 36px; padding: 0 14px; border-radius: 10px; border: 1.5px solid #166534; background: #166534; color: #fff; font-weight: 800; font-size: 13px; cursor: pointer; font-family: inherit; }
.lic-btn.ghost { background: #fff; color: #166534; border-color: #cfe3d6; }
.lic-btn.danger { background: #fff; color: #b91c1c; border-color: #fecaca; }
.lic-btn:disabled { opacity: .5; cursor: not-allowed; }
.lic-have { margin: 8px 0 0; font-size: 12.5px; color: #166534; font-weight: 600; word-break: break-word; }
.lic-have.exp { color: #b45309; }
.lic-form { margin-top: 10px; display: flex; flex-direction: column; gap: 6px; }
.lic-form label { font-size: 12.5px; font-weight: 700; color: #334155; } .lic-form label span { font-weight: 500; color: #94a3b8; }
.lic-form textarea, .lic-form input { width: 100%; border: 1.5px solid #dfe7e2; border-radius: 10px; padding: 9px 11px; font: inherit; font-size: 14px; }
.lic-form input { max-width: 220px; } .lic-form input.lic-url { max-width: none; }
.lic-have a { color: #166534 !important; text-decoration: underline; word-break: break-all; } .lic-nolink { color: #92400e; font-weight: 600; }
.lic-form textarea:focus, .lic-form input:focus { outline: none; border-color: #16a34a; }
.lic-form .lic-acts { margin-top: 4px; }
`;
