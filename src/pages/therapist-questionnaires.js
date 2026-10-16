import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import MainLayout from "../components/therapists/main-layout";
import { PT_CSS } from "../components/therapists/portal-ui";
import { fetchById, postData } from "../utils/actions";
import { apiUrl } from "../utils/url";
import { LICENSED_TESTS } from "../components/self-assessment/tests";
import SendRoundedIcon from "@mui/icons-material/SendRounded";

/* Licensed questionnaires clients fill before their session. A client who asks for one while booking
   gets it automatically once the booking is paid; the therapist can also send one to any upcoming
   session. The score the therapist records stays hidden from the client until "Release". */

const NAME = Object.fromEntries(LICENSED_TESTS.map((t) => [t.key, `${t.title} (${t.short})`]));
const when = (d) => (d ? new Date(d).toLocaleString("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }) : "No session date");
const STATUS = {
  sent: ["Waiting for client", "warn"],
  done: ["Filled — add score", "warn"],
  scored: ["Score saved · hidden", "mut"],
  released: ["Released to client", "ok"],
};

export default function TherapistQuestionnaires() {
  const [rows, setRows] = useState(null);
  const [licences, setLicences] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [send, setSend] = useState({ bookingId: "", tool: "" });
  const [edit, setEdit] = useState(null); // { id, score, max, level, note }
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ text: "", err: false });

  const load = () => Promise.all([
    fetchById(`${apiUrl}/assessment-requests/therapist`),
    fetchById(`${apiUrl}/assessment-licences/mine`),
    fetchById(`${apiUrl}/assessment-requests/therapist/bookings`),
  ]).then(([r, l, b]) => {
    setRows(r?.data || []);
    const cur = (l?.data || []).filter((x) => !x.validTill || new Date(x.validTill) >= new Date());
    setLicences(cur);
    setSessions(b?.data || []);
    setSend((s) => ({ bookingId: s.bookingId || b?.data?.[0]?._id || "", tool: s.tool || cur[0]?.tool || "" }));
  }).catch(() => { setRows([]); setMsg({ text: "Couldn't load — please refresh", err: true }); });
  useEffect(() => { load(); }, []);

  const act = async (fn, ok) => {
    setBusy(true); setMsg({ text: "", err: false });
    try {
      const r = await fn();
      if (!r?.status) throw new Error(r?.message);
      setMsg({ text: r.message || ok, err: false });
      await load();
      return true;
    } catch (e) {
      setMsg({ text: e?.response?.data?.message || e?.message || "Something went wrong — please try again", err: true });
      return false;
    } finally { setBusy(false); }
  };
  const doSend = () => act(() => postData(`${apiUrl}/assessment-requests/send`, send), "Sent.");
  const doScore = async () => {
    const ok = await act(() => postData(`${apiUrl}/assessment-requests/${edit.id}/score`, { score: edit.score, max: edit.max, level: edit.level, note: edit.note }), "Saved.");
    if (ok) setEdit(null);
  };
  const doRelease = (id) => {
    if (!window.confirm("Release this score to the client? Do this after you've gone through it with them.")) return;
    act(() => postData(`${apiUrl}/assessment-requests/${id}/release`, {}), "Released.");
  };
  const noForm = licences.filter((l) => !l.formUrl);

  return (
    <MainLayout>
      <Head><title>Questionnaires | Choose Your Therapist</title></Head>
      <style dangerouslySetInnerHTML={{ __html: PT_CSS + TQ_CSS }} />
      <div className="pt">
        <div className="pt-head">
          <div>
            <h1>Questionnaires</h1>
            <p>Licensed questionnaires your clients fill before their session. Scores stay hidden from the client until you release them.</p>
          </div>
          <Link href="/settings?tab=licences" className="pt-btn outline">Manage licences</Link>
        </div>

        {msg.text && <p className={`tq-msg${msg.err ? " err" : ""}`} role="status">{msg.text}</p>}

        {rows !== null && licences.length === 0 && (
          <div className="pt-card tq-empty-lic">
            <b>Add a licence first</b>
            <span>Add the questionnaires you hold a licence for (with your licensed form link) in <Link href="/settings?tab=licences">Settings → Licences</Link>. Clients who want them will then see you.</span>
          </div>
        )}
        {noForm.length > 0 && (
          <p className="tq-warn">⚠ No online form link for {noForm.map((l) => NAME[l.tool]?.split(" (")[1]?.replace(")", "") || l.tool).join(", ")} — clients will be told you&apos;ll take them through it in the session. <Link href="/settings?tab=licences">Add the link</Link></p>
        )}

        {licences.length > 0 && (
          <div className="pt-card">
            <div className="pt-card-h"><h2>Send a questionnaire for a session</h2></div>
            {sessions.length ? (
              <div className="tq-send">
                <select value={send.bookingId} onChange={(e) => setSend({ ...send, bookingId: e.target.value })} aria-label="Session">
                  {sessions.map((s) => <option key={s._id} value={s._id}>{s.client} · {when(s.booking_date)}</option>)}
                </select>
                <select value={send.tool} onChange={(e) => setSend({ ...send, tool: e.target.value })} aria-label="Questionnaire">
                  {licences.map((l) => <option key={l.tool} value={l.tool}>{NAME[l.tool] || l.tool}</option>)}
                </select>
                <button type="button" className="pt-btn primary" onClick={doSend} disabled={busy || !send.bookingId || !send.tool}><SendRoundedIcon /> Send</button>
              </div>
            ) : <div className="pt-empty">No upcoming paid sessions right now.</div>}
          </div>
        )}

        <div className="pt-card">
          <div className="pt-card-h"><h2>Sent to clients</h2>{rows?.length > 0 && <span className="pt-chip mut">{rows.length}</span>}</div>
          {rows === null ? <div className="pt-skel" /> : rows.length ? (
            <div className="tq-list">
              {rows.map((r) => {
                const [label, tone] = STATUS[r.status] || ["", "mut"];
                const editing = edit?.id === r._id;
                return (
                  <div key={r._id} className="tq-row">
                    <div className="tq-top">
                      <div className="tq-who">
                        <b>{r.client}</b>
                        <span>{NAME[r.tool] || r.name} · session {when(r.booking_date)}</span>
                      </div>
                      <span className={`pt-chip ${tone}`}>{label}</span>
                    </div>
                    {r.score != null && !editing && (
                      <p className="tq-score">Score <b>{r.score}{r.max ? `/${r.max}` : ""}</b>{r.level ? ` · ${r.level}` : ""}{r.note ? ` — “${r.note}”` : ""}</p>
                    )}
                    {editing ? (
                      <div className="tq-form">
                        <div className="tq-grid">
                          <label>Score<input type="number" min="0" value={edit.score} onChange={(e) => setEdit({ ...edit, score: e.target.value })} /></label>
                          <label>Out of (optional)<input type="number" min="0" value={edit.max} onChange={(e) => setEdit({ ...edit, max: e.target.value })} /></label>
                          <label className="wide">Level / interpretation<input maxLength={60} placeholder="e.g. Moderate clinical insomnia" value={edit.level} onChange={(e) => setEdit({ ...edit, level: e.target.value })} /></label>
                        </div>
                        <label>Note for the client (shown when you release)<textarea rows={2} maxLength={600} value={edit.note} onChange={(e) => setEdit({ ...edit, note: e.target.value })} /></label>
                        <div className="tq-acts">
                          <button type="button" className="pt-btn primary" onClick={doScore} disabled={busy || edit.score === ""}>Save score</button>
                          <button type="button" className="pt-btn outline" onClick={() => setEdit(null)} disabled={busy}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="tq-acts">
                        {r.status !== "sent" && (
                          <button type="button" className="pt-btn outline" onClick={() => setEdit({ id: r._id, score: r.score ?? "", max: r.max ?? "", level: r.level || "", note: r.note || "" })} disabled={busy}>
                            {r.score != null ? "Edit score" : "Add score"}
                          </button>
                        )}
                        {r.status === "sent" && <span className="tq-hint">You&apos;ll be notified when they&apos;ve filled it. You can also add the score after the session.</span>}
                        {r.status === "sent" && <button type="button" className="pt-btn outline" onClick={() => setEdit({ id: r._id, score: "", max: "", level: "", note: "" })} disabled={busy}>Add score</button>}
                        {r.status === "scored" && <button type="button" className="pt-btn primary" onClick={() => doRelease(r._id)} disabled={busy}>Release to client</button>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : <div className="pt-empty">Nothing sent yet. When a client asks for one of your licensed questionnaires and books you, it shows up here automatically.</div>}
        </div>
      </div>
    </MainLayout>
  );
}

const TQ_CSS = `
.tq-msg { margin: 0 0 12px; font-size: 13.5px; font-weight: 700; color: #166534; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 9px 12px; }
.tq-msg.err { color: #b91c1c; background: #fef2f2; border-color: #fecaca; }
.tq-warn { margin: 0 0 12px; font-size: 13px; color: #92400e; background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 9px 12px; }
.tq-warn a, .tq-empty-lic a { color: #166534 !important; font-weight: 800; }
.tq-empty-lic { display: flex; flex-direction: column; gap: 4px; } .tq-empty-lic span { font-size: 13.5px; color: #475569; }
.tq-send { display: flex; gap: 8px; flex-wrap: wrap; }
.tq-send select { flex: 1 1 220px; height: 42px; border: 1.5px solid #dfe7e2; border-radius: 10px; padding: 0 10px; font: inherit; font-size: 14px; background: #fff; min-width: 0; }
.tq-list { display: flex; flex-direction: column; gap: 10px; }
.tq-row { border: 1px solid #e3eae6; border-radius: 14px; padding: 12px 14px; }
.tq-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.tq-who { min-width: 0; } .tq-who b { display: block; font-size: 14.5px; color: #0f172a; } .tq-who span { display: block; font-size: 12.5px; color: #64748b; margin-top: 2px; }
.tq-score { margin: 8px 0 0; font-size: 13.5px; color: #334155; }
.tq-acts { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-top: 10px; }
.tq-hint { font-size: 12.5px; color: #64748b; flex: 1 1 240px; }
.tq-form { margin-top: 10px; display: flex; flex-direction: column; gap: 8px; }
.tq-grid { display: grid; grid-template-columns: 120px 140px 1fr; gap: 8px; }
.tq-form label { display: flex; flex-direction: column; gap: 4px; font-size: 12.5px; font-weight: 700; color: #334155; }
.tq-form input, .tq-form textarea { border: 1.5px solid #dfe7e2; border-radius: 10px; padding: 8px 10px; font: inherit; font-size: 14px; font-weight: 500; }
.tq-form input:focus, .tq-form textarea:focus, .tq-send select:focus { outline: none; border-color: #16a34a; }
@media (max-width: 640px) { .tq-grid { grid-template-columns: 1fr 1fr; } .tq-grid .wide { grid-column: 1 / -1; } .tq-send .pt-btn { width: 100%; justify-content: center; } }
`;
