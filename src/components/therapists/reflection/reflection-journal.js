import React, { useEffect, useState } from "react";
import Link from "next/link";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import SelfImprovementRoundedIcon from "@mui/icons-material/SelfImprovementRounded";
import { fetchById, postData, deleteById } from "../../../utils/actions";
import { apiUrl } from "../../../utils/url";

/* Reflection journal (2026-11-20, owner): the therapist's private self-help space for countertransference —
   what they felt during a session, where it sits in the body, the pull to act, whose feeling it is, what it
   may say about the work, a plan for next time and some care for themselves now. Private: only this
   therapist can read it (text encrypted on the server, no admin view). Prompts are CYT's own wording. */

const API = `${apiUrl}/therapist-reflections`;
const WHOSE = {
  mine: "Mostly from my own life / story",
  client: "Mostly what the client brought into the room",
  both: "A bit of both",
  unsure: "Not sure yet",
};
const WHOSE_SHORT = { mine: "Mine", client: "Client", both: "Both", unsure: "Not sure" };
const EMPTY = { label: "", feelings: [], intensity: 5, body: [], moment: "", pulls: [], whose: "", story: "", meaning: "", plan: "", care: [], supervision: false };
const fmt = (d) => new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" });

function Chips({ list = [], value = [], onChange }) {
  const flip = (x) => onChange(value.includes(x) ? value.filter((y) => y !== x) : [...value, x]);
  return (
    <div className="rj-chips">
      {list.map((x) => (
        <button key={x} type="button" className={value.includes(x) ? "on" : ""} aria-pressed={value.includes(x)} onClick={() => flip(x)}>{x}</button>
      ))}
    </div>
  );
}

function Step({ n, title, hint, children }) {
  return (
    <div className="rj-step" role="group" aria-label={title}>
      <h3><i>{n}</i>{title}</h3>
      {hint && <p className="rj-hint">{hint}</p>}
      {children}
    </div>
  );
}

export default function ReflectionJournal() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [f, setF] = useState(null); // the form (null = closed)
  const [busy, setBusy] = useState(false);
  const [openId, setOpenId] = useState("");
  const [saved, setSaved] = useState(false);
  const set = (k) => (v) => setF((p) => ({ ...p, [k]: v }));

  const load = () => fetchById(API)
    .then((r) => { if (r?.status) setData(r.data); else setErr(r?.message || "Couldn't load"); })
    .catch(() => setErr("Couldn't load your journal — check your connection."));
  useEffect(() => { load(); }, []);

  const save = async () => {
    setBusy(true); setErr("");
    try {
      const r = await postData(API, f);
      if (r?.status) { setF(null); setSaved(true); await load(); window.scrollTo({ top: 0, behavior: "smooth" }); }
      else setErr(r?.message || "Couldn't save");
    } catch (e) { setErr(e?.response?.data?.message || "Couldn't save — try again."); }
    setBusy(false);
  };
  const remove = async (id) => {
    if (!window.confirm("Delete this reflection for good?")) return;
    try { await deleteById(`${API}/${id}`); load(); } catch { setErr("Couldn't delete"); }
  };

  const o = data?.options || {};
  const p = data?.patterns;
  const whoseTotal = p ? Object.values(p.whose || {}).reduce((s, n) => s + n, 0) : 0;

  return (
    <div className="rj" data-sm-skip="">
      <style>{RJ_CSS}</style>
      <header className="rj-hero">
        <span className="rj-ic" aria-hidden="true"><SelfImprovementRoundedIcon /></span>
        <div>
          <h1>Reflection journal</h1>
          <p>A quiet place to notice what a session stirred up in you — and to take care of it. Feelings that come up with a client are normal and useful; noticing them helps you stay steady for the client and for yourself.</p>
          <span className="rj-lock"><LockRoundedIcon /> Private to you — not visible to CYT, admins or clients. Please don&apos;t write client names.</span>
        </div>
      </header>

      {saved && !f && <p className="rj-ok" role="status">✓ Saved privately. Be kind to yourself today.</p>}
      {err && <p className="rj-err" role="alert">{err}</p>}

      {!f && (
        <button type="button" className="rj-new" onClick={() => { setF({ ...EMPTY }); setSaved(false); }}>+ Reflect on a session</button>
      )}

      {f && (
        <section className="rj-form" aria-label="New reflection">
          <Step n="1" title="Which session?" hint="A short private label — like “Tue 5 pm” or a code you use. No client names.">
            <input className="rj-in" maxLength={60} value={f.label} onChange={(e) => set("label")(e.target.value)} placeholder="e.g. Tue 5 pm · online" />
          </Step>
          <Step n="2" title="What did I feel in the session?" hint="Pick all that fit, then how strong it was.">
            <Chips list={o.feelings} value={f.feelings} onChange={set("feelings")} />
            <label className="rj-range">
              <span>How strong? <b>{f.intensity}/10</b></span>
              <input type="range" min="0" max="10" value={f.intensity} onChange={(e) => set("intensity")(Number(e.target.value))} />
            </label>
          </Step>
          <Step n="3" title="Where did I notice it in my body?">
            <Chips list={o.body} value={f.body} onChange={set("body")} />
          </Step>
          <Step n="4" title="When did it come up?" hint="What was the client saying or doing at that moment?">
            <textarea className="rj-in" rows={3} maxLength={2000} value={f.moment} onChange={(e) => set("moment")(e.target.value)} placeholder="It came up when…" />
          </Step>
          <Step n="5" title="What did I feel pulled to do?" hint="The urge — whether or not I acted on it.">
            <Chips list={o.pulls} value={f.pulls} onChange={set("pulls")} />
          </Step>
          <Step n="6" title="Whose feeling is this?" hint="Is it touching something in my own life, or is it what the client may be bringing (or making others feel)?">
            <div className="rj-radio">
              {(o.whose || []).map((w) => (
                <button key={w} type="button" className={f.whose === w ? "on" : ""} aria-pressed={f.whose === w} onClick={() => set("whose")(f.whose === w ? "" : w)}>{WHOSE[w] || w}</button>
              ))}
            </div>
            <textarea className="rj-in" rows={2} maxLength={2000} value={f.story} onChange={(e) => set("story")(e.target.value)} placeholder="It reminds me of… (someone, a time in my life, an old pattern)" />
          </Step>
          <Step n="7" title="What might it tell me about the client or our work?" hint="Sometimes what we feel is how others in the client's life feel around them.">
            <textarea className="rj-in" rows={3} maxLength={2000} value={f.meaning} onChange={(e) => set("meaning")(e.target.value)} placeholder="Maybe it shows…" />
          </Step>
          <Step n="8" title="Next session, I will…">
            <textarea className="rj-in" rows={2} maxLength={2000} value={f.plan} onChange={(e) => set("plan")(e.target.value)} placeholder="e.g. slow down before giving advice; notice when I want to rescue" />
          </Step>
          <Step n="9" title="Care for me, right now">
            <Chips list={o.care} value={f.care} onChange={set("care")} />
            <Link href="/breathe" className="rj-breathe">Take a 2-minute breathing reset →</Link>
            <label className="rj-sup"><input type="checkbox" checked={f.supervision} onChange={(e) => set("supervision")(e.target.checked)} /><i className="rj-box" aria-hidden="true">{f.supervision ? "✓" : ""}</i> I want to take this to supervision</label>
          </Step>
          <div className="rj-acts">
            <button type="button" className="rj-save" disabled={busy} onClick={save}>{busy ? "Saving…" : "Save privately"}</button>
            <button type="button" className="rj-link" onClick={() => { setF(null); setErr(""); }}>Cancel</button>
          </div>
        </section>
      )}

      {p && p.entries > 0 && (
        <section className="rj-pat" aria-label="My patterns, last 30 days">
          <h2>My patterns · last 30 days</h2>
          <div className="rj-stats">
            <div><b>{p.entries}</b><span>reflection{p.entries === 1 ? "" : "s"}</span></div>
            <div><b>{p.avgIntensity}</b><span>avg. strength /10</span></div>
            <div><b>{p.toSupervision}</b><span>for supervision</span></div>
          </div>
          {p.feelings?.length > 0 && <div className="rj-row"><small>Feelings that come up most</small><div className="rj-tags">{p.feelings.map((x) => <span key={x.name}>{x.name} · {x.n}</span>)}</div></div>}
          {p.pulls?.length > 0 && <div className="rj-row"><small>Pulls I notice most</small><div className="rj-tags warm">{p.pulls.map((x) => <span key={x.name}>{x.name} · {x.n}</span>)}</div></div>}
          {whoseTotal > 0 && (
            <div className="rj-row"><small>Whose feeling</small>
              <div className="rj-bar">{(o.whose || []).filter((w) => p.whose[w]).map((w) => <i key={w} className={`w-${w}`} style={{ flex: p.whose[w] }} title={`${WHOSE[w]}: ${p.whose[w]}`}>{WHOSE_SHORT[w]} {p.whose[w]}</i>)}</div>
            </div>
          )}
          {p.avgIntensity >= 7 && <p className="rj-note">Your feelings have been strong lately. That&apos;s a sign to slow down — consider supervision, a lighter day, or someone to talk to.</p>}
        </section>
      )}

      {data && (
        <section className="rj-list" aria-label="My reflections">
          <h2>My reflections</h2>
          {!data.entries.length && <p className="rj-empty">Nothing yet. After a session that stays with you, take five minutes here.</p>}
          {data.entries.map((e) => (
            <article key={e._id} className="rj-item">
              <button type="button" className="rj-item-h" onClick={() => setOpenId(openId === e._id ? "" : e._id)} aria-expanded={openId === e._id}>
                <span><b>{e.label || "Session"}</b><small>{fmt(e.at)}</small></span>
                <span className="rj-item-f">{e.feelings.slice(0, 3).join(" · ")}{e.feelings.length > 3 ? " …" : ""}</span>
                <span className="rj-int" style={{ "--v": e.intensity }} title={`Strength ${e.intensity}/10`}>{e.intensity}</span>
              </button>
              {openId === e._id && (
                <div className="rj-item-b">
                  {e.body.length > 0 && <p><small>Body</small>{e.body.join(", ")}</p>}
                  {e.moment && <p><small>When it came up</small>{e.moment}</p>}
                  {e.pulls.length > 0 && <p><small>Pulled to</small>{e.pulls.join(", ")}</p>}
                  {e.whose && <p><small>Whose feeling</small>{WHOSE[e.whose]}</p>}
                  {e.story && <p><small>It reminds me of</small>{e.story}</p>}
                  {e.meaning && <p><small>What it may tell me</small>{e.meaning}</p>}
                  {e.plan && <p><small>Next session</small>{e.plan}</p>}
                  {e.care.length > 0 && <p><small>Care for me</small>{e.care.join(", ")}</p>}
                  {e.supervision && <p className="rj-flag">★ To take to supervision</p>}
                  <button type="button" className="rj-del" onClick={() => remove(e._id)}>Delete</button>
                </div>
              )}
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

/* Small dashboard card → the journal */
export function ReflectionCard() {
  return (
    <Link href="/therapists/reflection" className="rjc">
      <style>{RJC_CSS}</style>
      <span className="rjc-ic" aria-hidden="true"><SelfImprovementRoundedIcon /></span>
      <span className="rjc-t"><b>A session stayed with you?</b><span>Reflect privately on what you felt — your own countertransference journal. Only you can see it.</span></span>
      <em>Reflect →</em>
    </Link>
  );
}

const RJC_CSS = `
.rjc { display: flex; align-items: center; gap: 14px; margin: 14px 0; padding: 16px 18px; border-radius: 20px; text-decoration: none; color: #10241a;
  background: linear-gradient(135deg, #f2f4ff, #f5f1ff); border: 1px solid #dfe3f5; box-shadow: 0 10px 24px -20px rgba(15,23,42,.35); }
.rjc:hover { border-color: #b9c2ec; }
.rjc-ic { flex: none; width: 46px; height: 46px; border-radius: 14px; display: grid; place-items: center; color: #fff; background: linear-gradient(160deg, #8f9cff, #5146d6); box-shadow: 0 10px 18px -10px #5146d6; }
.rjc-ic svg { font-size: 26px !important; width: 26px; height: 26px; }
.rjc-t { min-width: 0; }
.rjc-t b { display: block; font-size: 16.5px; font-weight: 800; }
.rjc-t span { display: block; font-size: 13.5px; color: #475569; line-height: 1.45; margin-top: 2px; }
.rjc em { margin-left: auto; flex: none; font-style: normal; font-weight: 800; font-size: 14px; color: #4338ca; }
@media (max-width: 600px) { .rjc em { display: none; } }
`;

const RJ_CSS = `
.rj { max-width: 860px; margin: 0 auto; padding: 4px 0 40px; color: #10241a; }
.rj-hero { display: flex; gap: 16px; align-items: flex-start; padding: 22px; border-radius: 22px; background: radial-gradient(90% 120% at 100% 0%, rgba(143,156,255,.22), transparent 60%), linear-gradient(135deg, #f6f7ff, #f3f8f4); border: 1px solid #e0e4f3; }
.rj-ic { flex: none; width: 52px; height: 52px; border-radius: 16px; display: grid; place-items: center; color: #fff; background: linear-gradient(160deg, #8f9cff, #5146d6); box-shadow: 0 10px 18px -10px #5146d6; }
.rj-ic svg { font-size: 28px !important; width: 28px; height: 28px; }
.rj-hero h1 { margin: 0 0 6px; font-size: 24px; font-weight: 800; letter-spacing: -.01em; }
.rj-hero p { margin: 0 0 10px; font-size: 14.5px; line-height: 1.6; color: #475569; }
.rj-lock { display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px; border-radius: 999px; background: #fff; border: 1px solid #e3e6f2; font-size: 12.5px; font-weight: 700; color: #3730a3; }
.rj-lock svg { font-size: 15px; }
.rj-new { display: block; width: 100%; margin: 16px 0; height: 52px; border: 0; border-radius: 16px; background: #14532d; color: #fff; font: inherit; font-size: 16px; font-weight: 800; cursor: pointer; box-shadow: 0 12px 22px -14px rgba(20,83,45,.9); }
.rj-new:hover { background: #0f3f23; }
.rj-ok { margin: 14px 0 0; padding: 10px 14px; border-radius: 12px; background: #e7f6ec; color: #14532d; font-weight: 700; font-size: 14px; }
.rj-err { margin: 14px 0 0; padding: 10px 14px; border-radius: 12px; background: #fdecea; color: #b42318; font-weight: 700; font-size: 14px; }
.rj-form { margin: 16px 0; padding: 4px 20px 20px; border-radius: 22px; background: #fff; border: 1px solid #e5ebe7; box-shadow: 0 14px 30px -24px rgba(15,23,42,.4); }
.rj-step { padding: 16px 0; border-bottom: 1px solid #eef2ef; min-width: 0; }
.rj-step h3 { display: flex; align-items: center; gap: 10px; margin: 0 0 8px; font-size: 16px; font-weight: 800; }
.rj-step h3 i { flex: none; width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; font-style: normal; font-size: 13px; color: #fff; background: #5146d6; }
.rj-hint { margin: 0 0 10px; font-size: 13.5px; color: #64748b; line-height: 1.5; }
.rj-chips, .rj-radio { display: flex; flex-wrap: wrap; gap: 8px; }
.rj-chips button, .rj-radio button { padding: 8px 13px; border-radius: 999px; border: 1px solid #d9e2dc; background: #fff; color: #1f2937; font: inherit; font-size: 13.5px; font-weight: 700; cursor: pointer; }
.rj-chips button.on { background: #5146d6; border-color: #5146d6; color: #fff; }
.rj-radio button { border-radius: 12px; }
.rj-radio button.on { background: #14532d; border-color: #14532d; color: #fff; }
.rj-radio + .rj-in { margin-top: 10px; }
.rj-in { display: block; width: 100%; box-sizing: border-box; border: 1px solid #d7e2db; border-radius: 12px; padding: 10px 12px; font: inherit; font-size: 14.5px; background: #fbfcfb; resize: vertical; }
.rj-in:focus { outline: none; border-color: #5146d6; box-shadow: 0 0 0 3px rgba(81,70,214,.12); background: #fff; }
.rj-range { display: block; margin-top: 14px; font-size: 13.5px; color: #475569; }
.rj-range b { color: #3730a3; }
.rj-range input { display: block !important; width: 100%; margin-top: 6px; accent-color: #5146d6; }
.rj-breathe { display: inline-block; margin-top: 12px; font-size: 14px; font-weight: 800; color: #15803d; }
.rj-sup { display: flex !important; align-items: center; gap: 10px; margin-top: 12px; font-size: 14px; font-weight: 700; cursor: pointer; position: relative; }
.rj-sup input { position: absolute; opacity: 0; width: 1px; height: 1px; }
.rj-box { flex: none; width: 20px; height: 20px; border-radius: 6px; border: 2px solid #b9c2ec; display: grid; place-items: center; font-style: normal; font-size: 13px; font-weight: 900; color: #fff; }
.rj-sup input:checked + .rj-box { background: #5146d6; border-color: #5146d6; }
.rj-sup input:focus-visible + .rj-box { box-shadow: 0 0 0 3px rgba(81,70,214,.25); }
.rj-acts { display: flex; align-items: center; gap: 14px; padding-top: 16px; flex-wrap: wrap; }
.rj-save { height: 48px; padding: 0 24px; border: 0; border-radius: 14px; background: #14532d; color: #fff; font: inherit; font-size: 15px; font-weight: 800; cursor: pointer; }
.rj-save:disabled { opacity: .6; }
.rj-link { border: 0; background: none; padding: 0; color: #475569; font: inherit; font-size: 14px; font-weight: 700; cursor: pointer; text-decoration: underline; }
.rj-pat, .rj-list { margin: 18px 0; padding: 18px 20px; border-radius: 22px; background: #fff; border: 1px solid #e5ebe7; }
.rj h2 { margin: 0 0 12px; font-size: 17px; font-weight: 800; }
.rj-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.rj-stats div { padding: 12px; border-radius: 14px; background: #f6f7ff; text-align: center; }
.rj-stats b { display: block; font-size: 24px; font-weight: 800; color: #3730a3; }
.rj-stats span { font-size: 12px; color: #64748b; font-weight: 700; }
.rj-row { margin-top: 14px; }
.rj-row small { display: block; font-size: 12px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: #64748b; margin-bottom: 6px; }
.rj-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.rj-tags span { padding: 5px 10px; border-radius: 999px; background: #ecebff; color: #3730a3; font-size: 13px; font-weight: 700; }
.rj-tags.warm span { background: #fff1e0; color: #9a4b0b; }
.rj-bar { display: flex; height: 30px; border-radius: 10px; overflow: hidden; gap: 2px; }
.rj-bar i { display: grid; place-items: center; min-width: 64px; font-style: normal; font-size: 12px; font-weight: 800; color: #fff; white-space: nowrap; }
.w-mine { background: #5146d6; } .w-client { background: #15803d; } .w-both { background: #0e7490; } .w-unsure { background: #94a3b8; }
.rj-note { margin: 14px 0 0; padding: 10px 12px; border-radius: 12px; background: #fff7e6; color: #8a5a00; font-size: 13.5px; font-weight: 600; line-height: 1.5; }
.rj-empty { margin: 0; color: #64748b; font-size: 14px; }
.rj-item { border-top: 1px solid #eef2ef; }
.rj-item:first-of-type { border-top: 0; }
.rj-item-h { width: 100%; display: flex; align-items: center; gap: 12px; padding: 12px 0; border: 0; background: none; font: inherit; text-align: left; cursor: pointer; color: inherit; }
.rj-item-h > span:first-child { display: flex; flex-direction: column; min-width: 110px; }
.rj-item-h b { font-size: 14.5px; }
.rj-item-h small { font-size: 12px; color: #64748b; }
.rj-item-f { flex: 1; min-width: 0; font-size: 13.5px; color: #475569; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rj-int { flex: none; width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; font-weight: 800; font-size: 13px; color: #fff; background: hsl(calc(140 - var(--v) * 13), 55%, 42%); }
.rj-item-b { padding: 0 0 14px; }
.rj-item-b p { margin: 0 0 8px; font-size: 14px; line-height: 1.55; white-space: pre-wrap; }
.rj-item-b small { display: block; font-size: 11.5px; font-weight: 800; letter-spacing: .05em; text-transform: uppercase; color: #64748b; }
.rj-flag { color: #a16207; font-weight: 800; }
.rj-del { border: 1px solid #f3c7c2; background: #fff; color: #b42318; border-radius: 10px; padding: 6px 12px; font: inherit; font-size: 13px; font-weight: 700; cursor: pointer; }
@media (max-width: 600px) {
  .rj-hero { flex-direction: column; padding: 18px; }
  .rj-hero h1 { font-size: 21px; }
  .rj-form { padding: 4px 14px 16px; }
  .rj-pat, .rj-list { padding: 16px 14px; }
  .rj-item-h > span:first-child { min-width: 90px; }
}
`;
