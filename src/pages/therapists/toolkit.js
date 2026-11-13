import React, { useCallback, useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import MainLayout from "../../components/therapists/main-layout";
import { AbcdForm, AbcdView, emptyData } from "../../components/toolkit/abcd";
import { ActivityForm, ActivityView } from "../../components/toolkit/activity";
import { LIBRARY, Tiles, WhyCard, WR_CSS, toolOf } from "../../components/toolkit/registry";
import { fetchById, postJsonData, putData } from "../../utils/actions";
import { apiUrl, imagePath } from "../../utils/url";

/* Therapist → Toolkit: CBT worksheets to use with clients.
   ABCD thought log: try it, share a link (anyone who opens it sees YOUR name and a Book button that books you),
   or send it straight to one of your clients — they fill it in their own dashboard, nothing to download —
   and review what clients send you. More worksheets come later (shown as "Coming soon"). */
const SITE = "https://www.chooseyourtherapist.in";
const STATUS = { assigned: ["Not opened yet", "new"], draft: ["Filling it in", "draft"], submitted: ["Sent to you — review", "sent"], reviewed: ["Reviewed", "done"] };
const dt = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" }) : "");
const photoOf = (p) => (!p || /pngegg|default/i.test(p) ? "" : /^(https?:|data:)/.test(p) ? p : `${imagePath}/${p}`);

export default function ToolkitPage() {
  const router = useRouter();
  const [d, setD] = useState(null);
  const [err, setErr] = useState("");
  const [panel, setPanel] = useState(null); // { kind: "try" | "share" | "send", tool } | { entry }
  const load = useCallback(() => fetchById(`${apiUrl}/therapist/worksheets`).then((r) => (r?.status ? setD(r.data) : setErr(r?.message || "Couldn't load"))).catch(() => setErr("Couldn't load your toolkit")), []);
  useEffect(() => { load(); }, [load]);
  // opened from a notification: ?entry=<id>
  useEffect(() => { if (router.query.entry) setPanel({ entry: String(router.query.entry) }); }, [router.query.entry]);

  const waiting = useMemo(() => (d?.entries || []).filter((e) => e.status === "submitted"), [d]);

  return (
    <MainLayout>
      <Head><title>Toolkit | Choose Your Therapist</title></Head>
      <style>{CSS + WR_CSS}</style>
      <div className="tk">
        <header className="tk-h">
          <div>
            <h1>Toolkit</h1>
            <p>Therapy worksheets your clients fill online — in their own dashboard, no PDFs. Share a link to bring new clients to <b>you</b>.</p>
          </div>
          {waiting.length > 0 && <button type="button" className="tk-alert" onClick={() => setPanel({ entry: waiting[0]._id })}>● {waiting.length} worksheet{waiting.length === 1 ? "" : "s"} to review</button>}
        </header>

        {err && <div className="tk-box">{err}</div>}

        <section className="tk-lib" aria-label="Worksheets">
          {LIBRARY.map((w) => (
            <article key={w.key} className={`tk-w${w.ready ? " ready" : ""}`}>
              <div className="tk-w-top">
                {w.ready ? <Tiles tool={w.key} /> : <span className="tk-soon">Coming soon</span>}
                <em>{w.tag}</em>
              </div>
              <h2>{w.name}</h2>
              <p>{w.short}</p>
              {w.ready && (
                <>
                  <div className="tk-acts">
                    <button type="button" className="tk-btn" onClick={() => setPanel({ kind: "share", tool: w.key })}>Share link</button>
                    <button type="button" className="tk-btn line" onClick={() => setPanel({ kind: "send", tool: w.key })}>Send to a client</button>
                    <button type="button" className="tk-btn ghost" onClick={() => setPanel({ kind: "try", tool: w.key })}>Try it yourself</button>
                  </div>
                  <WhyCard tool={w.key} open={false} compact />
                </>
              )}
            </article>
          ))}
        </section>

        <div className="tk-cols">
          <section className="tk-card">
            <div className="tk-card-h"><h3>From your clients</h3><small>{(d?.entries || []).length}</small></div>
            {!d ? <p className="tk-mut">Loading…</p> : d.entries.length === 0 ? (
              <p className="tk-mut">When a client fills a worksheet you shared or sent, it shows here. You see their answers once they press Send.</p>
            ) : (
              <ul className="tk-list">
                {d.entries.map((e) => {
                  const [label, tone] = STATUS[e.status] || STATUS.draft;
                  return (
                    <li key={e._id}>
                      <button type="button" onClick={() => setPanel({ entry: e._id })} className={e.flag ? "flag" : ""}>
                        {photoOf(e.client.photo) ? <img src={photoOf(e.client.photo)} alt="" /> : <span className="tk-av">{(e.client.name || "C").slice(0, 1)}</span>}
                        <span className="tk-l-t"><b>{e.client.name}{e.flag && <em className="tk-flag">⚠ check in</em>}</b><small>{e.title}{e.preview ? ` · “${e.preview}”` : ""}</small></span>
                        <span className="tk-l-r"><em className={`tk-st ${tone}`}>{label}</em><small>{dt(e.submittedAt || e.updatedAt)}</small></span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
          <section className="tk-card">
            <div className="tk-card-h"><h3>Your links</h3><small>{(d?.links || []).length}</small></div>
            {!d ? <p className="tk-mut">Loading…</p> : d.links.length === 0 ? <p className="tk-mut">Share the ABCD worksheet on WhatsApp, Instagram or with a client — every link shows your name and books you.</p> : (
              <ul className="tk-links">
                {d.links.slice(0, 12).map((l) => (
                  <li key={l._id}>
                    <span><b>{l.forClient ? `Sent to ${l.forClient.name}` : "Share link"}</b><small>{l.note ? `“${l.note}” · ` : ""}{dt(l.createdAt)}</small></span>
                    <span className="tk-nums"><i title="Opened">👁 {l.opens}</i><i title="Started">✍ {l.starts}</i><i title="Book clicks">📅 {l.bookClicks}</i></span>
                    <CopyBtn url={`${SITE}/worksheet/${l.code}`} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      {panel?.kind === "try" && <TryPanel tool={panel.tool} onClose={() => setPanel(null)} />}
      {panel?.kind === "share" && <SharePanel tool={panel.tool} onClose={() => setPanel(null)} onMade={load} />}
      {panel?.kind === "send" && <SendPanel tool={panel.tool} clients={d?.clients || []} onClose={() => setPanel(null)} onMade={load} />}
      {panel?.entry && <ReviewPanel id={panel.entry} onClose={() => { setPanel(null); if (router.query.entry) router.replace("/therapists/toolkit", undefined, { shallow: true }); }} onDone={load} />}
    </MainLayout>
  );
}

function Sheet({ title, onClose, children, wide }) {
  useEffect(() => {
    const k = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    const prev = document.body.style.overflow; document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = prev; };
  }, [onClose]);
  return (
    <div className="tk-scrim" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`tk-sheet${wide ? " wide" : ""}`}>
        <div className="tk-sheet-h"><h3>{title}</h3><button type="button" onClick={onClose} aria-label="Close">✕</button></div>
        <div className="tk-sheet-b">{children}</div>
      </div>
    </div>
  );
}

function CopyBtn({ url }) {
  const [ok, setOk] = useState(false);
  return <button type="button" className="tk-mini" onClick={() => { navigator.clipboard?.writeText(url).then(() => { setOk(true); setTimeout(() => setOk(false), 1500); }); }}>{ok ? "Copied" : "Copy"}</button>;
}

function TryPanel({ tool, onClose }) {
  const [data, setData] = useState(tool === "activity" ? {} : emptyData());
  const [step, setStep] = useState(0);
  return (
    <Sheet title={`Try the ${toolOf(tool).name} (not saved)`} onClose={onClose} wide>
      <p className="tk-mut tk-pad">This is exactly what your client sees in their dashboard. Nothing you type here is saved.</p>
      <WhyCard tool={tool} open={false} />
      {tool === "activity"
        ? <ActivityForm value={data} step={step} onChange={setData} onStep={setStep} />
        : <AbcdForm value={data} step={step} onChange={setData} onStep={setStep} therapistName="you" />}
    </Sheet>
  );
}

function ShareResult({ url, text, title = "Worksheet" }) {
  const wa = `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;
  const share = () => { if (navigator.share) navigator.share({ title, text, url }).catch(() => {}); else navigator.clipboard?.writeText(url); };
  return (
    <div className="tk-done">
      <p className="tk-ok">✓ Your link is ready</p>
      <div className="tk-url"><code>{url}</code><CopyBtn url={url} /></div>
      <div className="tk-acts">
        <a className="tk-btn wa" href={wa} target="_blank" rel="noreferrer">Share on WhatsApp</a>
        <button type="button" className="tk-btn line" onClick={share}>More ways to share</button>
        <a className="tk-btn ghost" href={url} target="_blank" rel="noreferrer">Open it</a>
      </div>
    </div>
  );
}

function SharePanel({ tool, onClose, onMade }) {
  const w = toolOf(tool);
  const [note, setNote] = useState("");
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState(false);
  const make = async () => {
    setBusy(true);
    try { const r = await postJsonData(`${apiUrl}/therapist/worksheets/link`, { tool, note }); if (r?.status) { setRes(r.data); onMade(); } else setRes({ error: r?.message || "Couldn't make the link" }); }
    catch (e) { setRes({ error: e?.response?.data?.message || "Couldn't make the link — try again in a minute" }); }
    setBusy(false);
  };
  return (
    <Sheet title={`Share the ${w.name}`} onClose={onClose}>
      <ul className="tk-how">
        <li>Anyone who opens the link sees the worksheet with <b>your name and photo</b>.</li>
        <li>The <b>Book</b> button books a session with <b>you</b>.</li>
        <li>They fill it in their own CYT account, and can send it to you.</li>
      </ul>
      {res?.code ? <ShareResult url={`${SITE}${res.path}`} title={w.name} text={`Try this free worksheet: ${w.name} — ${w.headline.toLowerCase()}.`} /> : (
        <>
          <label className="tk-lbl">A short note on top (optional)
            <input maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Use this whenever overthinking starts at night" />
          </label>
          {res?.error && <p className="tk-err">{res.error}</p>}
          <button type="button" className="tk-btn big" onClick={make} disabled={busy}>{busy ? "Making…" : "Make my share link"}</button>
        </>
      )}
    </Sheet>
  );
}

function SendPanel({ tool, clients, onClose, onMade }) {
  const w = toolOf(tool);
  const [q, setQ] = useState("");
  const [pick, setPick] = useState("");
  const [note, setNote] = useState("");
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState(false);
  const shown = clients.filter((c) => !q || c.name.toLowerCase().includes(q.toLowerCase()));
  const chosen = clients.find((c) => c.id === pick);
  const send = async () => {
    if (!pick) return;
    setBusy(true);
    try { const r = await postJsonData(`${apiUrl}/therapist/worksheets/link`, { tool, note, client: pick }); if (r?.status) { setRes(r.data); onMade(); } else setRes({ error: r?.message }); }
    catch (e) { setRes({ error: e?.response?.data?.message || "Couldn't send" }); }
    setBusy(false);
  };
  return (
    <Sheet title={`Send the ${w.name} to a client`} onClose={onClose}>
      {res?.code ? (
        <>
          <p className="tk-ok">✓ Sent to {res.client?.name}. It&apos;s waiting in their My Space → Worksheets, and they got a notification.</p>
          <ShareResult url={`${SITE}${res.path}`} title={w.name} text={`Hi ${res.client?.name?.split(" ")[0] || ""}, here's the worksheet we talked about. Fill it before our next session.`} />
        </>
      ) : clients.length === 0 ? (
        <p className="tk-mut">Clients appear here after their first paid session with you. For anyone else, use <b>Share link</b>.</p>
      ) : (
        <>
          <input className="tk-in" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search your clients" />
          <div className="tk-pick">
            {shown.map((c) => (
              <label key={c.id} className={pick === c.id ? "on" : ""}>
                <input type="radio" name="cl" checked={pick === c.id} onChange={() => setPick(c.id)} />
                {photoOf(c.photo) ? <img src={photoOf(c.photo)} alt="" /> : <span className="tk-av">{c.name.slice(0, 1)}</span>}
                <b>{c.name}</b>
              </label>
            ))}
          </div>
          <label className="tk-lbl">Note for {chosen ? chosen.name.split(" ")[0] : "them"} (optional)
            <input maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Fill this the next time you feel anxious at work" />
          </label>
          {res?.error && <p className="tk-err">{res.error}</p>}
          <button type="button" className="tk-btn big" disabled={!pick || busy} onClick={send}>{busy ? "Sending…" : chosen ? `Send to ${chosen.name}` : "Choose a client"}</button>
        </>
      )}
    </Sheet>
  );
}

function ReviewPanel({ id, onClose, onDone }) {
  const [e, setE] = useState(null);
  const [fb, setFb] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  useEffect(() => {
    fetchById(`${apiUrl}/therapist/worksheets/entries/${id}`).then((r) => { if (r?.status) { setE(r.data); setFb(r.data.feedback || ""); } else setMsg(r?.message || "Not found"); }).catch(() => setMsg("Couldn't open it"));
  }, [id]);
  const save = async () => {
    setBusy(true);
    try { const r = await putData(`${apiUrl}/therapist/worksheets/entries/${id}/review`, { feedback: fb }); if (r?.status) { setMsg("✓ Feedback sent to your client"); onDone(); } }
    catch (x) { setMsg(x?.response?.data?.message || "Couldn't send"); }
    setBusy(false);
  };
  return (
    <Sheet title={e ? `${e.client.name} · ${e.title}` : "Worksheet"} onClose={onClose} wide>
      {!e ? <p className="tk-mut">{msg || "Loading…"}</p> : !e.shared ? (
        <p className="tk-mut">{e.client.name} {e.status === "assigned" ? "hasn't opened it yet" : "is still filling it in"}. You&apos;ll see the answers when they press <b>Send</b>.</p>
      ) : (
        <>
          {e.flag && <div className="tk-sos">⚠ Something in this worksheet mentions self-harm. Please check in with {e.client.name} today. Tele-MANAS: 14416 (free, 24×7).</div>}
          <p className="tk-mut">Sent {dt(e.submittedAt)}{e.reviewedAt ? ` · you reviewed it ${dt(e.reviewedAt)}` : ""}</p>
          {e.tool === "activity" ? <ActivityView data={e.data} /> : <AbcdView data={e.data} />}
          <label className="tk-lbl">Your feedback to {e.client.name.split(" ")[0]}
            <textarea rows={4} maxLength={2000} value={fb} onChange={(x) => setFb(x.target.value)} placeholder="What you noticed, a kind word, and what to try next" />
          </label>
          {msg && <p className="tk-ok">{msg}</p>}
          <button type="button" className="tk-btn big" disabled={busy || !fb.trim()} onClick={save}>{busy ? "Sending…" : e.status === "reviewed" ? "Update feedback" : "Send feedback"}</button>
        </>
      )}
    </Sheet>
  );
}

const CSS = `
.tk { color: #0f1f17; }
.tk-h { display: flex; justify-content: space-between; align-items: flex-start; gap: 14px; flex-wrap: wrap; margin-bottom: 16px; }
.tk-h h1 { margin: 0; font-size: 26px; font-weight: 800; }
.tk-h p { margin: 4px 0 0; font-size: 14.5px; color: #475569; max-width: 680px; }
.tk-alert { border: 0; border-radius: 999px; padding: 10px 16px; background: #fee2e2; color: #b91c1c; font: inherit; font-weight: 800; font-size: 14px; cursor: pointer; }
.tk-box { background: #fff; border: 1px solid #e3e9e5; border-radius: 16px; padding: 18px; margin-bottom: 14px; color: #64748b; }
.tk-lib { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 14px; margin-bottom: 18px; align-items: start; }
.tk-w { grid-column: span 3; background: #fff; border: 1px solid #e3e9e5; border-radius: 18px; padding: 16px; display: flex; flex-direction: column; gap: 6px; opacity: .72; }
.tk-w.ready { opacity: 1; grid-column: span 6; border: 1.5px solid #bfe0cb; background: linear-gradient(135deg, #ffffff 55%, #eef8f2); box-shadow: 0 16px 34px -26px rgba(20,83,45,.6); padding: 20px; }
.tk-w .wr-why { margin: 12px 0 0; }
.tk-w-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.tk-w-top em { font-style: normal; font-size: 11.5px; font-weight: 800; color: #15803d; background: #e9f8ef; border-radius: 999px; padding: 3px 10px; }
.tk-abcd { display: flex; gap: 6px; }
.tk-abcd i { width: 38px; height: 38px; border-radius: 11px; display: grid; place-items: center; color: #fff; font-style: normal; font-weight: 900; font-size: 17px; }
.tk-soon { font-size: 11.5px; font-weight: 800; color: #64748b; background: #f1f5f3; border-radius: 999px; padding: 3px 10px; }
.tk-w h2 { margin: 6px 0 0; font-size: 17px; font-weight: 800; }
.tk-w.ready h2 { font-size: 22px; }
.tk-w p { margin: 0; font-size: 13.5px; color: #475569; line-height: 1.5; }
.tk-acts { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
.tk-btn { display: inline-flex; align-items: center; justify-content: center; height: 42px; padding: 0 16px; border-radius: 12px; border: 0; background: #14532d; color: #fff !important; font: inherit; font-size: 14px; font-weight: 800; cursor: pointer; text-decoration: none !important; }
.tk-btn.line { background: #fff; color: #14532d !important; border: 1.5px solid #cfe1d5; }
.tk-btn.ghost { background: transparent; color: #15803d !important; }
.tk-btn.wa { background: #25d366; color: #fff !important; }
.tk-btn.big { width: 100%; height: 48px; margin-top: 14px; font-size: 15px; }
.tk-btn:disabled { opacity: .5; cursor: default; }
.tk-cols { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); gap: 14px; }
.tk-card { background: #fff; border: 1px solid #e3e9e5; border-radius: 18px; padding: 16px; min-width: 0; }
.tk-card-h { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.tk-card-h h3 { margin: 0; font-size: 16px; font-weight: 800; }
.tk-card-h small { font-size: 12px; font-weight: 800; color: #64748b; background: #f1f5f3; border-radius: 999px; padding: 1px 8px; }
.tk-mut { color: #64748b; font-size: 14px; line-height: 1.5; margin: 6px 0; }
.tk-pad { margin: 0 0 12px; }
.tk-list, .tk-links { list-style: none; margin: 0; padding: 0; }
.tk-list li + li, .tk-links li + li { border-top: 1px solid #f1f5f3; }
.tk-list button { width: 100%; display: flex; align-items: center; gap: 10px; padding: 10px 4px; border: 0; background: none; font: inherit; text-align: left; cursor: pointer; border-radius: 10px; }
.tk-list button:hover { background: #f8fbf9; }
.tk-list button.flag { background: #fff5f5; }
.tk-list img, .tk-av, .tk-pick img { width: 38px; height: 38px; border-radius: 11px; object-fit: cover; flex: none; }
.tk-av { display: grid; place-items: center; background: #14532d; color: #fff; font-weight: 800; }
.tk-l-t { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.tk-l-t b { font-size: 14px; display: flex; gap: 6px; align-items: center; }
.tk-l-t small { font-size: 12.5px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tk-flag { font-style: normal; font-size: 11px; color: #b91c1c; background: #fee2e2; border-radius: 999px; padding: 1px 7px; }
.tk-l-r { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; flex: none; }
.tk-l-r small { font-size: 11.5px; color: #94a3b8; }
.tk-st { font-style: normal; font-size: 11px; font-weight: 800; border-radius: 999px; padding: 3px 9px; white-space: nowrap; }
.tk-st.new { background: #f1f5f9; color: #64748b; } .tk-st.draft { background: #fff4dd; color: #92651a; }
.tk-st.sent { background: #fee2e2; color: #b91c1c; } .tk-st.done { background: #e9f8ef; color: #15803d; }
.tk-links li { display: flex; align-items: center; gap: 10px; padding: 10px 2px; }
.tk-links li > span:first-child { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.tk-links b { font-size: 13.5px; }
.tk-links small { font-size: 12px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tk-nums { display: flex; gap: 8px; font-size: 12px; color: #475569; }
.tk-nums i { font-style: normal; white-space: nowrap; }
.tk-mini { height: 30px; padding: 0 10px; border-radius: 9px; border: 1px solid #cfe1d5; background: #fff; color: #14532d; font: inherit; font-size: 12.5px; font-weight: 800; cursor: pointer; flex: none; }
.tk-scrim { position: fixed; inset: 0; z-index: 3000; background: rgba(11,23,18,.5); display: flex; align-items: center; justify-content: center; padding: 16px; }
.tk-sheet { width: 100%; max-width: 560px; max-height: calc(100dvh - 32px); display: flex; flex-direction: column; background: #f7faf8; border-radius: 22px; overflow: hidden; box-shadow: 0 30px 70px -30px rgba(0,0,0,.5); }
.tk-sheet.wide { max-width: 900px; }
.tk-sheet-h { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 14px 18px; background: #fff; border-bottom: 1px solid #e3e9e5; }
.tk-sheet-h h3 { margin: 0; font-size: 17px; font-weight: 800; }
.tk-sheet-h button { width: 34px; height: 34px; border-radius: 10px; border: 0; background: #f1f5f3; font-size: 15px; cursor: pointer; }
.tk-sheet-b { padding: 16px 18px 20px; overflow-y: auto; overscroll-behavior: contain; }
.tk-how { margin: 0 0 14px; padding: 12px 14px 12px 32px; background: #fff; border: 1px solid #e3e9e5; border-radius: 14px; font-size: 14px; color: #334155; line-height: 1.7; }
.tk-lbl { display: block; margin-top: 12px; font-size: 13.5px; font-weight: 800; color: #334155; }
.tk-lbl input, .tk-lbl textarea, .tk-in { display: block; width: 100%; box-sizing: border-box; margin-top: 6px; padding: 11px 13px; border: 1.5px solid #dfe7e2; border-radius: 12px; font: inherit; font-size: 15px; font-weight: 400; background: #fff; }
.tk-pick { max-height: 280px; overflow: auto; margin-top: 8px; background: #fff; border: 1px solid #e3e9e5; border-radius: 14px; }
.tk-pick label { display: flex; align-items: center; gap: 10px; padding: 9px 12px; cursor: pointer; border-bottom: 1px solid #f1f5f3; }
.tk-pick label.on { background: #eef8f2; }
.tk-pick input { accent-color: #14532d; }
.tk-pick b { font-size: 14px; }
.tk-ok { margin: 8px 0; color: #15803d; font-weight: 800; font-size: 14.5px; }
.tk-err { color: #b91c1c; font-size: 14px; margin: 8px 0 0; }
.tk-done { background: #fff; border: 1px solid #cfe7d8; border-radius: 16px; padding: 14px; }
.tk-url { display: flex; gap: 8px; align-items: center; background: #f1f7f3; border-radius: 12px; padding: 8px 8px 8px 12px; }
.tk-url code { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; color: #14532d; }
.tk-sos { margin-bottom: 10px; padding: 12px 14px; border-radius: 12px; background: #fff1f2; border: 1px solid #fecdd3; color: #881337; font-weight: 700; font-size: 14px; }
@media (max-width: 1100px) { .tk-w { grid-column: span 6; } .tk-w.ready { grid-column: span 12; } .tk-cols { grid-template-columns: minmax(0, 1fr); } }
@media (max-width: 640px) {
  .tk-h h1 { font-size: 22px; }
  .tk-lib { grid-template-columns: minmax(0, 1fr); gap: 10px; } .tk-w, .tk-w.ready { grid-column: auto; } .tk-w.ready { padding: 16px; }
  .tk-acts .tk-btn { flex: 1 1 100%; }
  .tk-scrim { align-items: flex-end; padding: 0; }
  .tk-sheet { max-width: none !important; border-radius: 22px 22px 0 0; max-height: calc(100dvh - 24px); }
  .tk-nums { display: none; }
}
`;
