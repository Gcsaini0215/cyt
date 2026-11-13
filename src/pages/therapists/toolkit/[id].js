import React, { useEffect, useRef, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import MainLayout from "../../../components/therapists/main-layout";
import { AbcdMulti, AbcdLogsView, toLogs } from "../../../components/toolkit/abcd";
import { ActivityForm, ActivityView, withActivity } from "../../../components/toolkit/activity";
import { WhatIfForm, WhatIfView, withWhatIf } from "../../../components/toolkit/whatif";
import { Tiles, WhyCard, WR_CSS, toolOf } from "../../../components/toolkit/registry";
import { deleteById, fetchById, putData } from "../../../utils/actions";
import { apiUrl, imagePath } from "../../../utils/url";

/* Toolkit worksheet as a full page (not a pop-up):
   /therapists/toolkit/<id>           — the therapist's own worksheet (saved as they type, private)
   /therapists/toolkit/<id>?review=1  — a worksheet a client sent: their answers + the therapist's feedback */
const dt = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }) : "");
const photoOf = (p) => (!p || /pngegg|default/i.test(p) ? "" : /^(https?:|data:)/.test(p) ? p : `${imagePath}/${p}`);

export default function ToolkitWorksheetPage() {
  const router = useRouter();
  const { id, review } = router.query;
  return (
    <MainLayout>
      <Head><title>Worksheet | Toolkit</title></Head>
      <style>{CSS + WR_CSS}</style>
      <div className="tw">
        <Link href="/therapists/toolkit" className="tw-back">← Toolkit</Link>
        {!id ? null : review ? <Review id={String(id)} /> : <Mine id={String(id)} />}
      </div>
    </MainLayout>
  );
}

/* the therapist's own worksheet */
function Mine({ id }) {
  const router = useRouter();
  const [tool, setTool] = useState("");
  const [data, setData] = useState(null);
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState("");
  const [err, setErr] = useState("");
  const dataRef = useRef(null);
  const timer = useRef(null);
  const latest = useRef(null);
  useEffect(() => {
    fetchById(`${apiUrl}/my-worksheets/${id}`).then((r) => {
      if (!r?.status) return setErr(r?.message || "Couldn't open it");
      const t = r.data.tool;
      const first = t === "activity" ? withActivity(r.data.data) : t === "whatif" ? withWhatIf(r.data.data) : { logs: toLogs(r.data.data) };
      setTool(t); setData(first); dataRef.current = first; setStep(r.data.step || 0);
    }).catch(() => setErr("Couldn't open it"));
  }, [id]);
  const save = (body) => putData(`${apiUrl}/my-worksheets/${id}`, body);
  // save anything typed in the last moment when leaving the page
  useEffect(() => () => { clearTimeout(timer.current); if (latest.current) putData(`${apiUrl}/my-worksheets/${id}`, latest.current).catch(() => {}); }, [id]);
  const queue = (next, n) => {
    latest.current = { data: next, step: n };
    setSaved("Saving…");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { save(latest.current).then((r) => { setSaved(r?.status ? "Saved ✓" : "Not saved"); if (r?.status) latest.current = null; }).catch(() => setSaved("Not saved — check your internet")); }, 800);
  };
  const onChange = (next) => { dataRef.current = next; setData(next); queue(next, step); };
  const onStep = (n) => { setStep(n); if (dataRef.current) queue(dataRef.current, n); };
  const remove = async () => {
    if (!window.confirm("Delete this worksheet?")) return;
    clearTimeout(timer.current); latest.current = null;
    try { await deleteById(`${apiUrl}/my-worksheets/${id}`); } catch (x) { /* already gone */ }
    router.push("/therapists/toolkit");
  };
  if (err) return <div className="tw-box">{err}</div>;
  if (!data) return <div className="tw-box">Loading…</div>;
  const w = toolOf(tool);
  const finish = <p className="tw-note">🔒 Saved for you only. <button type="button" onClick={remove}>Delete this worksheet</button></p>;
  return (
    <>
      <header className="tw-h">
        <Tiles tool={tool} size={34} />
        <div><h1>{w.name}</h1><p>Just for you — it saves as you type. {saved && <b className="tw-saved">{saved}</b>}</p></div>
      </header>
      <WhyCard tool={tool} open={false} />
      {tool === "whatif" ? <WhatIfForm value={data} step={step} onChange={onChange} onStep={onStep} finish={finish} /> : tool === "activity"
        ? <ActivityForm value={data} step={step} onChange={onChange} onStep={onStep} finish={finish} />
        : <AbcdMulti value={data} step={step} onChange={onChange} onStep={onStep} finish={finish} />}
    </>
  );
}

/* a client's worksheet: their answers (once they sent it) and the therapist's feedback */
function Review({ id }) {
  const [e, setE] = useState(null);
  const [fb, setFb] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  useEffect(() => {
    const load = () => fetchById(`${apiUrl}/therapist/worksheets/entries/${id}`).then((r) => {
      if (r?.status) { setE(r.data); setFb((f) => f || r.data.feedback || ""); } else setMsg(r?.message || "Not found");
    }).catch(() => setMsg("Couldn't open it"));
    load();
    // still being filled? check again every 30 s, so the answers appear the moment the client sends them
    const t = setInterval(() => { if (document.visibilityState === "visible") load(); }, 30000);
    return () => clearInterval(t);
  }, [id]);
  const save = async () => {
    setBusy(true);
    try {
      const r = await putData(`${apiUrl}/therapist/worksheets/entries/${id}/review`, { feedback: fb });
      if (r?.status) { setMsg("✓ Feedback sent — your client gets a notification"); setE((x) => ({ ...x, status: "reviewed", reviewedAt: new Date().toISOString() })); }
    } catch (x) { setMsg(x?.response?.data?.message || "Couldn't send"); }
    setBusy(false);
  };
  if (!e) return <div className="tw-box">{msg || "Loading…"}</div>;
  return (
    <>
      <header className="tw-h">
        {photoOf(e.client.photo) ? <img src={photoOf(e.client.photo)} alt="" className="tw-av" /> : <span className="tw-av i">{(e.client.name || "C").slice(0, 1)}</span>}
        <div><h1>{e.client.name}</h1><p>{e.title}{e.shared ? ` · sent ${dt(e.submittedAt)}` : ""}{e.reviewedAt ? ` · you reviewed it ${dt(e.reviewedAt)}` : ""}</p></div>
      </header>
      {!e.shared ? (
        <div className="tw-box">{e.client.name} {e.status === "assigned" ? "hasn't opened it yet" : "is still filling it in"}. You&apos;ll see the answers here when they press <b>Send</b>.</div>
      ) : (
        <div className="tw-grid">
          <section className="tw-card">
            {e.flag && <div className="tw-sos">⚠ Something in this worksheet mentions self-harm. Please check in with {e.client.name} today. Tele-MANAS: 14416 (free, 24×7).</div>}
            {e.tool === "activity" ? <ActivityView data={e.data} /> : e.tool === "whatif" ? <WhatIfView data={e.data} /> : <AbcdLogsView data={e.data} />}
          </section>
          <aside className="tw-card tw-fb">
            <h2>Your feedback to {e.client.name.split(" ")[0]}</h2>
            <textarea rows={7} maxLength={2000} value={fb} onChange={(x) => setFb(x.target.value)} placeholder="What you noticed, a kind word, and what to try before the next session" />
            {msg && <p className="tw-ok">{msg}</p>}
            <button type="button" className="tw-btn" disabled={busy || !fb.trim()} onClick={save}>{busy ? "Sending…" : e.status === "reviewed" ? "Update feedback" : "Send feedback"}</button>
          </aside>
        </div>
      )}
    </>
  );
}

const CSS = `
.tw { max-width: 1100px; margin: 0 auto; color: #0f1f17; }
.tw-back { display: inline-block; margin-bottom: 12px; font-size: 14px; font-weight: 800; color: #15803d !important; text-decoration: none !important; }
.tw-box { background: #fff; border: 1px solid #e3e9e5; border-radius: 16px; padding: 22px; color: #475569; font-size: 15px; }
.tw-h { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
.tw-h h1 { margin: 0; font-size: 24px; font-weight: 800; }
.tw-h p { margin: 2px 0 0; font-size: 14px; color: #64748b; }
.tw-h .wr-tiles { display: grid; grid-template-columns: 1fr 1fr; gap: 3px; flex: none; }
.tw-saved { margin-left: 6px; color: #15803d; font-size: 13px; }
.tw-av { width: 52px; height: 52px; border-radius: 16px; object-fit: cover; flex: none; }
.tw-av.i { display: grid; place-items: center; background: #14532d; color: #fff; font-weight: 800; font-size: 20px; }
.tw-note { margin: 14px 0 0; font-size: 13.5px; color: #475569; }
.tw-note button { border: 0; background: none; color: #b91c1c; font: inherit; font-weight: 700; cursor: pointer; margin-left: 6px; }
.tw-grid { display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 14px; align-items: start; }
.tw-card { background: #fff; border: 1px solid #e3e9e5; border-radius: 18px; padding: 16px; min-width: 0; }
.tw-fb { position: sticky; top: 80px; }
.tw-fb h2 { margin: 0 0 10px; font-size: 16px; font-weight: 800; }
.tw-fb textarea { width: 100%; box-sizing: border-box; padding: 11px 13px; border: 1.5px solid #dfe7e2; border-radius: 12px; font: inherit; font-size: 15px; resize: vertical; }
.tw-btn { width: 100%; height: 48px; margin-top: 10px; border-radius: 12px; border: 0; background: #14532d; color: #fff; font: inherit; font-size: 15px; font-weight: 800; cursor: pointer; }
.tw-btn:disabled { opacity: .5; cursor: default; }
.tw-ok { margin: 8px 0 0; color: #15803d; font-weight: 800; font-size: 14px; }
.tw-sos { margin-bottom: 12px; padding: 12px 14px; border-radius: 12px; background: #fff1f2; border: 1px solid #fecdd3; color: #881337; font-weight: 700; font-size: 14px; }
@media (max-width: 900px) { .tw-grid { grid-template-columns: minmax(0, 1fr); } .tw-fb { position: static; } }
@media (max-width: 560px) { .tw-h h1 { font-size: 20px; } }
`;
