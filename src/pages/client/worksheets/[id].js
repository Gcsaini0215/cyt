import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import ClientShell from "../../../components/client/client-shell";
import { AbcdMulti, toLogs } from "../../../components/toolkit/abcd";
import { ActivityForm, withActivity } from "../../../components/toolkit/activity";
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
  const timer = useRef(null);
  const latest = useRef({ data: null, step: 0 });

  useEffect(() => {
    if (!id) return;
    fetchById(`${apiUrl}/my-worksheets/${id}`).then((r) => {
      if (!r?.status) return setErr(r?.message || "Worksheet not found");
      const act = r.data.tool === "activity";
      setW(r.data); setData(act ? withActivity(r.data.data) : { logs: toLogs(r.data.data) });
      setStep(r.data.status === "submitted" || r.data.status === "reviewed" ? (act ? 1 : 4) : Math.min(r.data.step || 0, act ? 1 : 4));
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
  const onChange = (next) => { setData(next); queue(next, step); };
  const onStep = (n) => { setStep(n); if (data) queue(data, n); };

  const send = async () => {
    clearTimeout(timer.current);
    setBusy(true);
    try {
      const r = await save({ data, step: w.tool === "activity" ? 1 : 4, submit: true });
      if (r?.status) setW((x) => ({ ...x, status: r.data.status, flag: r.data.flag, submittedAt: new Date().toISOString() }));
      setSaved(r?.message || "");
    } catch (e) { setSaved(e?.response?.data?.message || "Couldn't send — try again"); }
    setBusy(false);
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
              {th?.live && <Link href={bookPath(th)} className="ws-book">Book {th.name.split(" ")[0]}</Link>}
            </div>
            {router.query.again === "1" && !w.ongoing && th && <div className="ws-note">You&apos;ve already used your free worksheet from {th.name} — here it is. To log more situations, book a session with them.</div>}
            {w.note && <div className="ws-note"><b>{th ? `${th.name.split(" ")[0]} says:` : "Note:"}</b> {w.note}</div>}
            {w.status === "reviewed" && w.feedback && <div className="ws-fb"><b>{th?.name || "Your therapist"} reviewed it:</b><p>{w.feedback}</p></div>}
            <WhyCard tool={w.tool} open={!sent && w.status !== "draft"} />
            {(() => { const finish = (
                <div className="ws-send">
                  {sent ? (
                    <p className="ws-ok">✓ Sent to {th?.name || "your therapist"} on {new Date(w.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}. {w.status === "reviewed" ? "They've reviewed it." : "They'll go through it with you."} You can still edit and send again.</p>
                  ) : null}
                  {th ? (
                    <button type="button" className="ab-btn" disabled={busy} onClick={send}>{busy ? "Sending…" : sent ? `Send the update to ${th.name.split(" ")[0]}` : `Send to ${th.name}`}</button>
                  ) : null}
                  <p className="ws-priv">🔒 Only you{th ? ` and ${th.name}` : ""} can see this. {th ? "They see it only after you press Send." : ""}</p>
                  {th?.live && <Link href={bookPath(th)} className="ws-talk">Worksheets work best when you talk them through — book a session with {th.name} →</Link>}
                </div>
              );
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
.ws-book { flex: none; height: 40px; display: inline-flex; align-items: center; padding: 0 16px; border-radius: 12px; background: #14532d; color: #fff !important; font-weight: 800; font-size: 14px; text-decoration: none !important; }
.ws-note { margin-bottom: 12px; padding: 12px 14px; border-radius: 14px; background: #fffaf0; border: 1px solid #f3e2bb; font-size: 14.5px; color: #5b4310; }
.ws-fb { margin-bottom: 12px; padding: 12px 14px; border-radius: 14px; background: #e9f8ef; border: 1px solid #bfe6cc; color: #14532d; }
.ws-fb p { margin: 4px 0 0; font-size: 14.5px; white-space: pre-wrap; }
.ws-send { margin-top: 16px; display: flex; flex-direction: column; align-items: flex-start; gap: 10px; }
.ws-ok { margin: 0; padding: 10px 12px; border-radius: 12px; background: #e9f8ef; color: #14532d; font-size: 14px; font-weight: 600; }
.ws-priv { margin: 0; font-size: 12.5px; color: #64748b; }
.ws-lockbtn { display: inline-flex; align-items: center; text-decoration: none !important; color: #fff !important; background: #14532d !important; }
.ws-talk { font-size: 14px; font-weight: 800; color: #15803d !important; text-decoration: none !important; }
@media (max-width: 560px) { .ws-h h1 { font-size: 20px; } .ws-book { height: 36px; padding: 0 12px; font-size: 13px; } }
`;
