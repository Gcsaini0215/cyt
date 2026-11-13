import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import ClientShell from "../../../components/client/client-shell";
import { AbcdMulti, toLogs } from "../../../components/toolkit/abcd";
import { ActivityForm, withActivity } from "../../../components/toolkit/activity";
import { WhatIfForm, withWhatIf } from "../../../components/toolkit/whatif";
import { WhyCard, toolOf } from "../../../components/toolkit/registry";
import { fetchById, putData } from "../../../utils/actions";
import { apiUrl } from "../../../utils/url";
import { bookPath } from "../../../utils/therapist-slug";

/* One worksheet in My Space: filled step by step, saved as you type, sent to the therapist when ready. */
export default function WorksheetPage() {
  const router = useRouter();
  const { id } = router.query;
  const [w, setW] = useState(null);
  const [err, setErr] = useState("");
  const [data, setData] = useState(null);
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState("");
  const [busy, setBusy] = useState(false);
  const [askReset, setAskReset] = useState(false); // reset needs a second, deliberate tap in a confirm box
  const timer = useRef(null);
  const latest = useRef({ data: null, step: 0 });
  const dataRef = useRef(null); // always the newest answers (a click can change data and step together)

  useEffect(() => {
    if (!id) return;
    fetchById(`${apiUrl}/my-worksheets/${id}`).then((r) => {
      if (!r?.status) return setErr(r?.message || "Worksheet not found");
      const act = r.data.tool === "activity";
      const first = act ? withActivity(r.data.data) : r.data.tool === "whatif" ? withWhatIf(r.data.data) : { logs: toLogs(r.data.data) };
      setW(r.data); setData(first); dataRef.current = first;
      const last = act ? 1 : r.data.tool === "whatif" ? 2 : 4;
      setStep(r.data.status === "submitted" || r.data.status === "reviewed" ? last : Math.min(r.data.step || 0, last));
    }).catch(() => setErr("Couldn't open this worksheet"));
  }, [id]);

  const save = (body) => putData(`${apiUrl}/my-worksheets/${id}`, body);
  const queue = (next, nextStep) => {
    latest.current = { data: next, step: nextStep };
    setSaved("Saving…");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      save(latest.current).then((r) => setSaved(r?.status ? "Saved" : "Not saved")).catch(() => setSaved("Not saved — check your internet"));
    }, 900);
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  const onChange = (next) => { dataRef.current = next; setData(next); queue(next, step); };
  const onStep = (n) => { setStep(n); if (dataRef.current) queue(dataRef.current, n); };

  // the therapist's feedback shows up without a reload: check every 20 s (and when the tab comes back)
  useEffect(() => {
    if (!id) return undefined;
    const check = () => {
      if (document.visibilityState !== "visible") return;
      fetchById(`${apiUrl}/my-worksheets/${id}`).then((r) => {
        if (r?.status) setW((x) => (x ? { ...x, status: r.data.status, feedback: r.data.feedback, reviewedAt: r.data.reviewedAt, submittedAt: r.data.submittedAt, ongoing: r.data.ongoing } : x));
      }).catch(() => {});
    };
    const t = setInterval(check, 20000);
    document.addEventListener("visibilitychange", check);
    return () => { clearInterval(t); document.removeEventListener("visibilitychange", check); };
  }, [id]);

  const send = async () => {
    clearTimeout(timer.current);
    setBusy(true);
    try {
      const r = await save({ data: dataRef.current || data, step: w.tool === "activity" ? 1 : w.tool === "whatif" ? 2 : 4, submit: true });
      if (r?.status) setW((x) => ({ ...x, status: r.data.status, flag: r.data.flag, submittedAt: new Date().toISOString() }));
      setSaved(r?.message || "");
    } catch (e) { setSaved(e?.response?.data?.message || "Couldn't send — try again"); }
    setBusy(false);
  };

  const blank = (tool) => (tool === "activity" ? withActivity({}) : tool === "whatif" ? withWhatIf({}) : { logs: toLogs({}) });
  const reset = async () => {
    clearTimeout(timer.current); latest.current = { data: null, step: 0 };
    setBusy(true);
    try {
      const r = await save({ reset: true });
      if (r?.status) {
        const fresh = blank(w.tool);
        dataRef.current = fresh; setData(fresh); setStep(0);
        setW((x) => ({ ...x, status: r.data.status, flag: false, submittedAt: r.data.status === "draft" ? null : x.submittedAt }));
        setSaved("Cleared — start fresh");
      }
    } catch (e) { setSaved(e?.response?.data?.message || "Couldn't reset — try again"); }
    setBusy(false); setAskReset(false);
  };

  const th = w?.therapist;
  const sent = w && (w.status === "submitted" || w.status === "reviewed");
  return (
    <ClientShell title="Worksheet">
      <style>{CSS}</style>
      <div className="ws">
        <Link href="/client/worksheets" className="ws-back">← All worksheets</Link>
        {err ? <div className="ws-box">{err}</div> : !w || !data ? <div className="ws-box">Loading…</div> : (
          <>
            <div className="ws-h">
              <div>
                <h1>{toolOf(w.tool).name}</h1>
                <p>{th ? <>From <b>{th.name}</b>{th.profile_type ? ` · ${th.profile_type}` : ""}</> : "A CBT exercise"} {saved && <em className="ws-saved">{saved}</em>}</p>
              </div>
              <div className="ws-h-acts">
                <button type="button" className="ws-reset" onClick={() => setAskReset(true)} title="Clear all answers">↺ Reset</button>
                {th?.live && <Link href={bookPath(th)} className="ws-book">Book {th.name.split(" ")[0]}</Link>}
              </div>
            </div>
            {askReset && (
              <div className="ws-scrim" role="dialog" aria-modal="true" aria-label="Reset worksheet" onClick={(e) => e.target === e.currentTarget && !busy && setAskReset(false)}>
                <div className="ws-dlg">
                  <span className="ws-dlg-ic" aria-hidden="true">↺</span>
                  <h3>Reset this worksheet?</h3>
                  <p>Everything you&apos;ve written in <b>{toolOf(w.tool).name}</b> will be cleared and you&apos;ll start from the beginning. This can&apos;t be undone.{sent && th ? ` ${th.name} will see it as not sent any more.` : ""}</p>
                  <div className="ws-dlg-b">
                    <button type="button" className="ws-dlg-no" onClick={() => setAskReset(false)} disabled={busy} autoFocus>No, keep my answers</button>
                    <button type="button" className="ws-dlg-yes" onClick={reset} disabled={busy}>{busy ? "Clearing…" : "Yes, clear everything"}</button>
                  </div>
                </div>
              </div>
            )}
            {router.query.again === "1" && !w.ongoing && th && <div className="ws-note">You&apos;ve already used your free worksheet from {th.name} — here it is. To log more situations, book a session with them.</div>}
            {w.note && <div className="ws-note"><b>{th ? `${th.name.split(" ")[0]} says:` : "Note:"}</b> {w.note}</div>}
            {w.status === "reviewed" && w.feedback && <div className="ws-fb"><b>{th?.name || "Your therapist"} reviewed it:</b><p>{w.feedback}</p></div>}
            <WhyCard tool={w.tool} open={!sent && w.status !== "draft"} />
            {(() => { const finish = (
                <div className="ws-send">
                  {w.status === "reviewed" && w.feedback ? <div className="ws-fb"><b>{th?.name || "Your therapist"}&apos;s feedback:</b><p>{w.feedback}</p></div> : null}
                  {sent ? (
                    <p className="ws-ok">✓ Sent to {th?.name || "your therapist"} on {new Date(w.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}. {w.status === "reviewed" ? "They've reviewed it." : "They'll go through it with you."} You can still edit and send again.</p>
                  ) : null}
                  {th ? (
                    <button type="button" className="ws-sendbtn" disabled={busy} onClick={send}>{busy ? "Sending…" : sent ? `Send the update to ${th.name.split(" ")[0]}` : `Send to ${th.name}`}</button>
                  ) : null}
                  <p className="ws-priv">🔒 Only you{th ? ` and ${th.name}` : ""} can see this. {th ? "They see it only after you press Send." : ""}</p>
                  {th?.live && <Link href={bookPath(th)} className="ws-talk">Worksheets work best when you talk them through — book a session with {th.name} →</Link>}
                </div>
              );
              if (w.tool === "whatif") return <WhatIfForm value={data} step={step} onChange={onChange} onStep={onStep} finish={finish} />;
              return w.tool === "activity"
                ? <ActivityForm value={data} step={step} onChange={onChange} onStep={onStep} finish={finish} />
                : <AbcdMulti value={data} step={step} onChange={onChange} onStep={onStep} therapistName={th?.name} finish={finish}
                    canAdd={!th || !!w.ongoing}
                    lockCta={th?.live ? <Link href={bookPath(th)} className="ab-btn ws-lockbtn">Book a session with {th.name}</Link> : <Link href="/client/find" className="ab-btn ws-lockbtn">Find a therapist</Link>} />;
            })()}
          </>
        )}
      </div>
    </ClientShell>
  );
}

const CSS = `
.ws { max-width: 860px; margin: 0 auto; }
.ws-back { display: inline-block; margin-bottom: 10px; font-size: 13.5px; font-weight: 800; color: #15803d !important; text-decoration: none !important; }
.ws-box { background: #fff; border: 1px solid #e3e9e5; border-radius: 16px; padding: 30px; text-align: center; color: #64748b; }
.ws-h { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
.ws-h h1 { margin: 0; font-size: 24px; font-weight: 800; color: #0f1f17; }
.ws-h p { margin: 4px 0 0; font-size: 14px; color: #475569; }
.ws-saved { font-style: normal; margin-left: 8px; font-size: 12px; font-weight: 700; color: #94a3b8; }
.ws-h-acts { display: flex; align-items: center; gap: 8px; flex: none; }
.ws-reset { height: 40px; padding: 0 14px; border-radius: 12px; border: 1.5px solid #e3e9e5; background: #fff; color: #475569; font: inherit; font-size: 13.5px; font-weight: 800; cursor: pointer; }
.ws-reset:hover { border-color: #fca5a5; color: #b91c1c; }
.ws-scrim { position: fixed; inset: 0; z-index: 3000; background: rgba(11,23,18,.5); display: flex; align-items: center; justify-content: center; padding: 16px; }
.ws-dlg { width: 100%; max-width: 400px; background: #fff; border-radius: 20px; padding: 22px; text-align: center; box-shadow: 0 30px 70px -30px rgba(0,0,0,.5); }
.ws-dlg-ic { display: inline-grid; place-items: center; width: 54px; height: 54px; border-radius: 16px; background: #fff1f2; color: #b91c1c; font-size: 26px; font-weight: 900; }
.ws-dlg h3 { margin: 12px 0 6px; font-size: 19px; font-weight: 800; color: #0f1f17; }
.ws-dlg p { margin: 0; font-size: 14.5px; color: #475569; line-height: 1.5; }
.ws-dlg-b { display: flex; flex-direction: column; gap: 8px; margin-top: 18px; }
.ws-dlg-no { height: 46px; border-radius: 12px; border: 0; background: #14532d; color: #fff; font: inherit; font-size: 15px; font-weight: 800; cursor: pointer; }
.ws-dlg-yes { height: 44px; border-radius: 12px; border: 1.5px solid #fecaca; background: #fff; color: #b91c1c; font: inherit; font-size: 14.5px; font-weight: 800; cursor: pointer; }
.ws-dlg-yes:hover:not(:disabled) { background: #fff5f5; }
.ws-book { flex: none; height: 40px; display: inline-flex; align-items: center; padding: 0 16px; border-radius: 12px; background: #14532d; color: #fff !important; font-weight: 800; font-size: 14px; text-decoration: none !important; }
.ws-note { margin-bottom: 12px; padding: 12px 14px; border-radius: 14px; background: #fffaf0; border: 1px solid #f3e2bb; font-size: 14.5px; color: #5b4310; }
.ws-fb { margin-bottom: 12px; padding: 12px 14px; border-radius: 14px; background: #e9f8ef; border: 1px solid #bfe6cc; color: #14532d; }
.ws-fb p { margin: 4px 0 0; font-size: 14.5px; white-space: pre-wrap; }
.ws-sendbtn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 50px; padding: 0 24px; border-radius: 14px; border: 0; background: linear-gradient(135deg, #1e7a4c, #14532d); color: #fff; font: inherit; font-size: 16px; font-weight: 800; cursor: pointer; box-shadow: 0 12px 24px -12px rgba(20,83,45,.75); }
.ws-sendbtn::before { content: "➤"; font-size: 15px; }
.ws-sendbtn:hover:not(:disabled) { filter: brightness(1.08); }
.ws-sendbtn:disabled { opacity: .6; cursor: default; }
.ws-send .ws-fb { width: 100%; box-sizing: border-box; margin: 0; }
@media (max-width: 560px) { .ws-sendbtn { width: 100%; } }
.ws-send { margin-top: 16px; display: flex; flex-direction: column; align-items: flex-start; gap: 10px; }
.ws-ok { margin: 0; padding: 10px 12px; border-radius: 12px; background: #e9f8ef; color: #14532d; font-size: 14px; font-weight: 600; }
.ws-priv { margin: 0; font-size: 12.5px; color: #64748b; }
.ws-lockbtn { display: inline-flex; align-items: center; text-decoration: none !important; color: #fff !important; background: #14532d !important; }
.ws-talk { font-size: 14px; font-weight: 800; color: #15803d !important; text-decoration: none !important; }
@media (max-width: 560px) { .ws-h { flex-wrap: wrap; } .ws-reset { height: 36px; padding: 0 10px; font-size: 12.5px; } .ws-h h1 { font-size: 20px; } .ws-book { height: 36px; padding: 0 12px; font-size: 13px; } }
`;
