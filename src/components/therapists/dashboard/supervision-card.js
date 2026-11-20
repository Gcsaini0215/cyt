import React, { useEffect, useRef, useState } from "react";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import { fetchById, postData } from "../../../utils/actions";
import { apiUrl } from "../../../utils/url";

/* Therapist home: "Supervision & training with our founder" (2026-11-20, owner). The therapist says they're
   interested and picks topics from a drop-down (one or more) + an optional note → admin → Therapist comms
   (kind "supervision"). Sending again updates the same request. Upcoming workshops / training are planned
   around what therapists pick. */

const FALLBACK = ["Basic communication skills", "CBT (Cognitive Behavioural Therapy)", "Mindfulness", "Narrative therapy", "Existential therapy approaches", "Family therapy", "Couple sessions", "Business of private practice", "Planning to open an in-person centre"];

export default function SupervisionCard() {
  const [topics, setTopics] = useState(FALLBACK);
  const [mine, setMine] = useState(null); // what they sent before
  const [step, setStep] = useState("intro"); // intro | form | done
  const [pick, setPick] = useState([]);
  const [note, setNote] = useState("");
  const [open, setOpen] = useState(false); // the drop-down
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const ddRef = useRef(null);

  useEffect(() => {
    fetchById(`${apiUrl}/therapist-comms/supervision`).then((r) => {
      if (!r?.status) return;
      if (r.data.topics?.length) setTopics(r.data.topics);
      if (r.data.mine) { setMine(r.data.mine); setPick(r.data.mine.topics || []); setNote(r.data.mine.note || ""); setStep("done"); }
    }).catch(() => {});
  }, []);
  useEffect(() => {
    if (!open) return undefined;
    const off = (e) => { if (ddRef.current && !ddRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", off);
    return () => document.removeEventListener("mousedown", off);
  }, [open]);

  const toggle = (t) => setPick((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]));
  const send = async () => {
    setBusy(true); setErr("");
    try {
      const r = await postData(`${apiUrl}/therapist-comms/supervision`, { topics: pick, note: note.trim() });
      if (r?.status) { setMine({ topics: r.data.topics, note: r.data.note, status: "open" }); setStep("done"); setOpen(false); }
      else setErr(r?.message || "Couldn't send — try again.");
    } catch (e) { setErr(e?.response?.data?.message || "Couldn't send — try again."); }
    setBusy(false);
  };

  return (
    <section className="sv" aria-labelledby="sv-h">
      <style>{SV_CSS}</style>
      <div className="sv-l">
        <span className="sv-ic" aria-hidden="true"><SchoolRoundedIcon /></span>
        <div>
          <small className="sv-eyebrow">Coming soon · Supervision &amp; training</small>
          <h3 id="sv-h">Supervision with our founder &amp; psychologist</h3>
          <p>Grow your practice with 1:1 and group supervision from the founder of Choose Your Therapist. We&apos;ll also launch workshops and training programmes — tell us what you&apos;d like to learn first.</p>
        </div>
      </div>

      {step === "intro" && (
        <div className="sv-r">
          <button type="button" className="sv-btn" onClick={() => setStep("form")}>Yes, I&apos;m interested</button>
          <span className="sv-fine">No payment now — just show your interest.</span>
        </div>
      )}

      {step === "form" && (
        <div className="sv-r sv-form">
          <label className="sv-l2" htmlFor="sv-dd">Which topics interest you?</label>
          <div className="sv-dd" ref={ddRef}>
            <button id="sv-dd" type="button" className={`sv-dd-btn${open ? " on" : ""}`} onClick={() => setOpen((o) => !o)} aria-haspopup="listbox" aria-expanded={open}>
              <span>{pick.length ? `${pick.length} topic${pick.length === 1 ? "" : "s"} selected` : "Choose topics"}</span><i aria-hidden="true">▾</i>
            </button>
            {open && (
              <ul className="sv-menu" role="listbox" aria-multiselectable="true">
                {topics.map((t) => (
                  <li key={t} role="option" aria-selected={pick.includes(t)}>
                    <label><input type="checkbox" className="sv-cb" checked={pick.includes(t)} onChange={() => toggle(t)} /><i className="sv-box" aria-hidden="true">{pick.includes(t) ? "✓" : ""}</i><span>{t}</span></label>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {pick.length > 0 && <div className="sv-chips">{pick.map((t) => <button key={t} type="button" onClick={() => toggle(t)} aria-label={`Remove ${t}`}>{t} <i aria-hidden="true">×</i></button>)}</div>}
          <textarea rows={2} maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Anything else? (optional) — e.g. your experience, a case type you want help with" />
          {err && <p className="sv-err" role="alert">{err}</p>}
          <div className="sv-acts">
            <button type="button" className="sv-btn" disabled={busy || !pick.length} onClick={send}>{busy ? "Sending…" : "Submit my interest"}</button>
            <button type="button" className="sv-link" onClick={() => { setStep(mine ? "done" : "intro"); setOpen(false); }}>Cancel</button>
          </div>
        </div>
      )}

      {step === "done" && mine && (
        <div className="sv-r sv-done">
          <b>✓ You&apos;re on the list</b>
          <span>We&apos;ll let you know when supervision and the first workshops open.</span>
          <div className="sv-chips static">{(mine.topics || []).map((t) => <span key={t}>{t}</span>)}</div>
          {mine.reply && <p className="sv-reply"><b>CYT:</b> {mine.reply}</p>}
          <button type="button" className="sv-link" onClick={() => setStep("form")}>Change topics</button>
        </div>
      )}
    </section>
  );
}

const SV_CSS = `
.sv { display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr); gap: 18px; align-items: center; margin: 14px 0; padding: 20px; border-radius: 22px;
  background: radial-gradient(90% 120% at 100% 0%, rgba(236,199,125,.28), transparent 55%), linear-gradient(135deg, #fffaf0 0%, #f3f8f4 100%); border: 1px solid #e8dfc8; box-shadow: 0 10px 26px -20px rgba(15,23,42,.35); }
.sv-l { display: flex; gap: 14px; align-items: flex-start; min-width: 0; }
.sv-ic { flex: none; width: 48px; height: 48px; border-radius: 15px; display: grid; place-items: center; color: #fff; background: linear-gradient(160deg, #2fa36a, #14532d); box-shadow: 0 10px 18px -10px #14532d; }
.sv-eyebrow { display: block; font-size: 11px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: #a16207; margin-bottom: 4px; }
.sv h3 { margin: 0 0 6px; font-size: 19px; font-weight: 800; letter-spacing: -.01em; color: #10241a; }
.sv-l p { margin: 0; font-size: 14px; line-height: 1.55; color: #475569; }
.sv-r { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.sv-btn { height: 46px; padding: 0 20px; border: 0; border-radius: 14px; background: #14532d; color: #fff; font: inherit; font-size: 15px; font-weight: 800; cursor: pointer; box-shadow: 0 10px 18px -12px rgba(20,83,45,.9); }
.sv-btn:hover { background: #0f3f23; } .sv-btn:disabled { opacity: .55; cursor: default; }
.sv-fine { font-size: 12.5px; color: #6b7280; }
.sv-l2 { font-size: 13.5px; font-weight: 800; color: #10241a; }
.sv-dd { position: relative; }
.sv-dd-btn { width: 100%; height: 44px; display: flex; align-items: center; justify-content: space-between; padding: 0 14px; border-radius: 12px; border: 1px solid #d7e2db; background: #fff; font: inherit; font-size: 14.5px; color: #1f2937; cursor: pointer; }
.sv-dd-btn.on, .sv-dd-btn:focus-visible { border-color: #15803d; box-shadow: 0 0 0 3px rgba(21,128,61,.12); outline: none; }
.sv-menu { position: absolute; z-index: 30; left: 0; right: 0; top: calc(100% + 6px); max-height: 280px; overflow-y: auto; margin: 0; padding: 6px; list-style: none; background: #fff; border: 1px solid #e3ebe6; border-radius: 14px; box-shadow: 0 18px 40px -16px rgba(15,23,42,.35); }
.sv-menu label { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 10px; font-size: 14px; color: #1f2937; cursor: pointer; }
.sv-menu label:hover { background: #f3f8f5; }
.sv-menu .sv-cb { position: absolute; opacity: 0; width: 1px; height: 1px; pointer-events: none; } /* the site hides native checkboxes — our own box below */
.sv-box { flex: none; width: 20px; height: 20px; border-radius: 6px; border: 2px solid #b9cbbf; display: grid; place-items: center; font-style: normal; font-size: 13px; font-weight: 900; color: #fff; background: #fff; }
.sv-menu li[aria-selected="true"] .sv-box { background: #15803d; border-color: #15803d; }
.sv-menu label { position: relative; }
.sv-menu .sv-cb:focus-visible + .sv-box { box-shadow: 0 0 0 3px rgba(21,128,61,.25); }
.sv-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.sv-chips button, .sv-chips span { display: inline-flex; align-items: center; gap: 6px; padding: 5px 10px; border-radius: 999px; border: 0; background: #e3f4e9; color: #14532d; font: inherit; font-size: 12.5px; font-weight: 700; cursor: pointer; }
.sv-chips.static span { cursor: default; }
.sv-chips i { font-style: normal; opacity: .7; }
.sv textarea { width: 100%; box-sizing: border-box; border: 1px solid #d7e2db; border-radius: 12px; padding: 10px 12px; font: inherit; font-size: 14px; resize: vertical; background: #fff; }
.sv textarea:focus { outline: none; border-color: #15803d; box-shadow: 0 0 0 3px rgba(21,128,61,.12); }
.sv-acts { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.sv-link { border: 0; background: none; padding: 0; color: #15803d; font: inherit; font-size: 14px; font-weight: 800; cursor: pointer; text-decoration: underline; text-underline-offset: 3px; align-self: flex-start; }
.sv-err { margin: 0; color: #b42318; font-size: 13.5px; font-weight: 700; }
.sv-done > b { font-size: 16px; color: #15803d; } .sv-done > span { font-size: 13.5px; color: #475569; }
.sv-reply { margin: 0; padding: 10px 12px; border-radius: 12px; background: #fff; font-size: 13.5px; color: #334155; }
@media (max-width: 900px) { .sv { grid-template-columns: minmax(0, 1fr); } }
`;
