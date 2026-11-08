import React, { useEffect, useState } from "react";
import { postFormUrlEncoded } from "../../utils/actions";
import { SubmitConsultationUrl } from "../../utils/url";
import PhoneField from "./phone-field";
import { DEFAULT_COUNTRY, phoneError, fullPhone, displayPhone } from "../../utils/phone";

// Inline "get matched" form that sits inside a page (not only in a popup): name + phone +
// optional concern, consent, and WhatsApp / call as one-tap alternatives. Every lead carries
// where it came from (source = `${tag} · ${path}`) so the admin shows which page converts.
//
//   <LeadCard tag="City · Bangalore" title="Not sure who to pick in Bangalore?" concern="Anxiety" />
export const WHATSAPP_NUMBER = "918077757951";
export const PHONE = "+918077757951";
export const waLink = (text) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

const CONCERNS = ["Anxiety", "Stress / burnout", "Low mood", "Relationship", "Anger", "Child / teen", "Something else"];

const STEPS = [
  ["phone-call", "Share your number", "Takes 20 seconds"],
  ["message-circle", "We call or WhatsApp", "Within 30 minutes"],
  ["user-check", "Get matched", "With the right psychologist"],
];

// team hours 9 AM – 9 PM IST, worked out in the browser only (no server/client mismatch)
function useTeamOnline() {
  const [online, setOnline] = useState(null);
  useEffect(() => {
    const check = () => {
      const now = new Date();
      const ist = new Date(now.getTime() + (now.getTimezoneOffset() + 330) * 60000);
      const h = ist.getHours();
      setOnline(h >= 9 && h < 21);
    };
    check();
    const t = setInterval(check, 60000);
    return () => clearInterval(t);
  }, []);
  return online;
}

export default function LeadCard({
  tag = "Lead card",
  title = "Not sure who to pick? We'll help you choose",
  sub = "Leave your number — our team will call or WhatsApp you within 30 minutes (9 AM – 9 PM) and suggest the right psychologist.",
  concern = "",
  waText = "Hi, I'd like help finding the right psychologist.",
  dark = false,
}) {
  const [name, setName] = useState("");
  const [code, setCode] = useState(DEFAULT_COUNTRY);
  const [phone, setPhone] = useState("");
  const phoneId = React.useId();
  const nameId = React.useId();
  const [topic, setTopic] = useState(concern);
  const [agree, setAgree] = useState(false);
  const [state, setState] = useState("idle"); // idle | sending | done | error
  const [error, setError] = useState("");
  const online = useTeamOnline();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (name.trim().length < 2) { setError("Please enter your name."); return; }
    const badPhone = phoneError(code, phone);
    if (badPhone) { setError(badPhone); return; }
    if (!agree) { setError("Please allow us to contact you."); return; }
    setState("sending");
    try {
      const path = typeof window !== "undefined" ? window.location.pathname : "";
      const res = await postFormUrlEncoded(SubmitConsultationUrl, {
        name: name.trim(),
        phone: fullPhone(code, phone),
        subject: "Callback request",
        concern: topic || "Not specified",
        source: `${tag} · ${path}`,
      });
      if (res?.status === false) throw new Error(res?.message || "fail");
      try { localStorage.setItem("cyt_lead_sent", String(Date.now())); } catch {}
      setState("done");
    } catch (err) {
      setState("error");
      setError("Couldn't send — please try again, or WhatsApp us.");
    }
  };

  return (
    <section className={`lc${dark ? " dark" : ""}`} aria-label="Get help choosing a psychologist">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="lc-copy">
        <span className="lc-eyebrow"><i className="feather-headphones" aria-hidden="true" /> Free help · no charge</span>
        <h2>{title}</h2>
        <p>{sub}</p>
        <ol className="lc-steps">
          {STEPS.map(([ic, t, s], i) => (
            <li key={t}>
              <span className="lc-step-ic" aria-hidden="true"><i className={`feather-${ic}`} /><em>{i + 1}</em></span>
              <span><b>{t}</b><small>{s}</small></span>
            </li>
          ))}
        </ol>
        <div className="lc-trust">
          <span><i className="feather-shield" aria-hidden="true" /> Verified psychologists</span>
          <span><i className="feather-lock" aria-hidden="true" /> 100% confidential</span>
          <span><i className="feather-check-circle" aria-hidden="true" /> No obligation</span>
        </div>
      </div>

      <div className="lc-side">
        {state === "done" ? (
          <div className="lc-done" aria-live="polite">
            <span className="lc-tick" aria-hidden="true"><i className="feather-check" /></span>
            <b>Thank you, {name.trim().split(" ")[0]}!</b>
            <p>We'll reach you on <strong>{displayPhone(code, phone)}</strong>{online === false ? " after 9 AM" : " soon"}. Want to talk right now?</p>
            <div className="lc-alt">
              <a className="lc-wa" href={waLink(waText)} target="_blank" rel="noreferrer"><i className="feather-message-circle" aria-hidden="true" /> WhatsApp us</a>
              <a className="lc-call" href={`tel:${PHONE}`}><i className="feather-phone" aria-hidden="true" /> Call</a>
            </div>
          </div>
        ) : (
          <form className="lc-form" onSubmit={submit} noValidate>
            <div className="lc-head">
              <b>Get a free callback</b>
              {online !== null && (
                <span className={`lc-status${online ? " on" : ""}`}>
                  <i aria-hidden="true" />{online ? "Team online now" : "Back at 9 AM"}
                </span>
              )}
            </div>
            <div className="lc-row">
              <div className="lc-field">
                <label htmlFor={nameId}>Your name</label>
                <div className="lc-in">
                  <i className="feather-user" aria-hidden="true" />
                  <input id={nameId} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="e.g. Priya" />
                </div>
              </div>
              <div className="lc-field lc-phone">
                <label htmlFor={phoneId}>Mobile number</label>
                <PhoneField id={phoneId} code={code} onCode={setCode} value={phone} onChange={setPhone} />
              </div>
            </div>
            <p className="lc-q">What would you like help with? <span>(optional)</span></p>
            <div className="lc-topics" role="group" aria-label="What would you like help with? (optional)">
              {CONCERNS.map((c) => (
                <button key={c} type="button" aria-pressed={topic === c} className={topic === c ? "on" : ""} onClick={() => setTopic(topic === c ? "" : c)}>{c}</button>
              ))}
            </div>
            <label className="lc-agree">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              <span>I agree to be contacted by Choose Your Therapist about my request. See <a href="/privacy-policy">how we use your data</a>.</span>
            </label>
            {error && <p className="lc-err" role="alert"><i className="feather-info" aria-hidden="true" /> {error}</p>}
            <button type="submit" className="lc-btn" disabled={state === "sending"}>
              {state === "sending" ? <><span className="lc-spin" aria-hidden="true" /> Sending…</> : <>Call me back <i className="feather-arrow-right" aria-hidden="true" /></>}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

const CSS = `
@keyframes lcPulse { 0% { box-shadow:0 0 0 0 rgba(34,197,94,.55); } 70% { box-shadow:0 0 0 7px rgba(34,197,94,0); } 100% { box-shadow:0 0 0 0 rgba(34,197,94,0); } }
@keyframes lcSpin { to { transform:rotate(360deg); } }
.lc { position:relative; display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1.08fr); margin:0; border-radius:26px; overflow:hidden; background:#fff;
  border:1px solid #e1ebe4; box-shadow:0 30px 70px -40px rgba(11,52,30,.45), 0 2px 8px rgba(11,52,30,.05); }
.lc-copy { position:relative; isolation:isolate; overflow:hidden; padding:40px 40px 36px; color:#0b1712; background:linear-gradient(160deg,#fffaf0 0%,#fbf0d9 55%,#f6e4bd 100%); border-right:1px solid #f0dfba; display:flex; flex-direction:column; }
.lc-copy::before { content:""; position:absolute; z-index:-1; width:320px; height:320px; right:-130px; top:-140px; border-radius:50%; background:radial-gradient(circle, rgba(227,168,58,.32), rgba(227,168,58,0) 70%); }
.lc-copy::after { content:""; position:absolute; z-index:-1; width:240px; height:240px; left:-110px; bottom:-120px; border-radius:50%; border:36px solid rgba(168,110,14,.07); }
.lc-eyebrow { align-self:flex-start; display:inline-flex; align-items:center; gap:7px; padding:6px 12px; border-radius:999px; background:#fff; border:1px solid #efd9a8; box-shadow:0 4px 12px -8px rgba(168,110,14,.6);
  color:#a86e0e; font-size:12px; font-weight:800; letter-spacing:.4px; text-transform:uppercase; margin-bottom:16px; }
.lc h2 { font-size:clamp(24px, 2.6vw, 32px); font-weight:800; color:#14532d; margin:0 0 10px; line-height:1.2; letter-spacing:-.3px; }
.lc-copy > p { font-size:15.5px; color:#5b4a2a; line-height:1.65; margin:0 0 24px; padding:0; max-width:460px; }
.lc-steps { list-style:none; margin:0 0 24px; padding:0; display:flex; flex-direction:column; gap:14px; counter-reset:none; }
.lc-steps li { margin:0; padding:0; display:flex; align-items:center; gap:14px; }
.lc-steps li::before { content:none; }
.lc-step-ic { position:relative; flex:none; width:44px; height:44px; border-radius:14px; background:#fff; border:1px solid #efd9a8; box-shadow:0 6px 14px -10px rgba(168,110,14,.7); display:flex; align-items:center; justify-content:center; font-size:18px; color:#1e7a4c; }
.lc-step-ic em { position:absolute; top:-6px; right:-6px; width:20px; height:20px; border-radius:50%; background:#e3a83a; color:#3b2604; font-style:normal; font-size:11px; font-weight:900; display:flex; align-items:center; justify-content:center; box-shadow:0 0 0 2px #fdf6e7; }
.lc-steps b { display:block; font-size:15px; font-weight:800; color:#14532d; line-height:1.3; }
.lc-steps small { display:block; font-size:13px; color:#7a6640; line-height:1.4; }
.lc-trust { margin-top:auto; padding-top:18px; border-top:1px dashed #e6cf9c; display:flex; flex-wrap:wrap; gap:8px 18px; }
.lc-trust span { display:inline-flex; align-items:center; gap:6px; font-size:13px; font-weight:700; color:#14532d; }
.lc-trust i { color:#a86e0e; }

.lc-side { padding:34px 36px; display:flex; flex-direction:column; justify-content:center; background:#fff; }
.lc-form { margin:0; }
.lc-head { display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap; margin-bottom:18px; }
.lc-head b { font-size:19px; font-weight:800; color:#0b1712; }
.lc-status { display:inline-flex; align-items:center; gap:7px; padding:5px 11px; border-radius:999px; background:#f3f4f2; color:#5b6660; font-size:12.5px; font-weight:700; white-space:nowrap; }
.lc-status i { width:8px; height:8px; border-radius:50%; background:#a3aca7; }
.lc-status.on { background:#e7f6ec; color:#166534; }
.lc-status.on i { background:#22c55e; animation:lcPulse 1.8s infinite; }
.lc-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.lc-field { display:flex; flex-direction:column; gap:6px; min-width:0; }
.lc-field > label { margin:0; font-size:12px; font-weight:800; letter-spacing:.3px; text-transform:uppercase; color:#5b6b63; }
.lc-in { position:relative; }
.lc-in i { position:absolute; left:14px; top:50%; transform:translateY(-50%); color:#7c8b83; font-size:16px; pointer-events:none; }
.lc-side input:not([type=checkbox]) { height:50px; border-radius:13px; border:1.5px solid #dbe5df; padding:0 14px; font-size:15.5px; color:#0b1712; background:#f8faf9; outline:none; width:100%; box-shadow:none; transition:border-color .2s, box-shadow .2s, background .2s; }
.lc-in input { padding-left:40px !important; }
.lc-side input:not([type=checkbox]):focus { border-color:#1e7a4c; background:#fff; box-shadow:0 0 0 4px #dcefe3; }
.lc-q { margin:18px 0 8px; padding:0; font-size:13.5px; font-weight:700; color:#26463a; }
.lc-q span { font-weight:500; color:#7c8b83; }
.lc-topics { display:flex; flex-wrap:wrap; gap:8px; margin:0 0 16px; }
.lc-topics button { height:36px; padding:0 14px; border-radius:999px; border:1.5px solid #dbe5df; background:#fff; color:#334155; font-size:13.5px; font-weight:600; cursor:pointer; white-space:nowrap; transition:all .15s ease; }
.lc-topics button:hover { border-color:#1e7a4c; color:#166534; }
.lc-topics button.on { background:#1e7a4c; border-color:#1e7a4c; color:#fff; }
.lc-agree { position:relative; overflow:hidden; display:flex; gap:10px; align-items:flex-start; font-size:12.5px; color:#64748b; line-height:1.5; margin:0 0 14px; cursor:pointer; }
/* the theme hides native checkboxes (position:absolute, full width) for its own styling — that
   made this one 390px wide and pushed the page sideways on phones. Use a plain native checkbox. */
.lc-agree input[type=checkbox] { position:static !important; opacity:1 !important; visibility:visible !important; display:inline-block !important; -webkit-appearance:checkbox !important; appearance:checkbox !important; width:17px !important; height:17px !important; min-width:17px; margin:1px 0 0 !important; padding:0 !important; accent-color:#1e7a4c; flex-shrink:0; cursor:pointer; }
.lc-agree a { color:#1e7a4c; font-weight:700; }
.lc-err { display:flex; align-items:center; gap:7px; color:#b91c1c; background:#fef2f2; border:1px solid #fecaca; border-radius:10px; font-size:13px; font-weight:600; margin:0 0 12px; padding:8px 12px; }
.lc-btn { width:100%; height:54px; border:none; border-radius:14px; background:linear-gradient(135deg,#22895a,#1e7a4c 55%,#14532d); color:#fff; font-size:16px; font-weight:800; cursor:pointer;
  display:inline-flex; align-items:center; justify-content:center; gap:9px; box-shadow:0 12px 24px -14px rgba(20,83,45,.8); transition:transform .15s ease, box-shadow .2s ease, background .2s; }
.lc-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 16px 28px -14px rgba(20,83,45,.9); }
.lc-btn:disabled { opacity:.75; cursor:wait; }
.lc-spin { width:16px; height:16px; border-radius:50%; border:2px solid rgba(255,255,255,.45); border-top-color:#fff; animation:lcSpin .8s linear infinite; }
.lc-alt { display:grid; grid-template-columns:1fr 1fr; gap:10px; width:100%; }
.lc-wa, .lc-call { display:inline-flex; align-items:center; justify-content:center; gap:7px; height:48px; padding:0 14px; border-radius:13px; font-size:14.5px; font-weight:800; text-decoration:none !important; transition:background .2s, border-color .2s; }
.lc-wa { background:#25d366; color:#fff !important; }
.lc-wa:hover { background:#1fb855; }
.lc-call { border:1.5px solid #cfdcd4; color:#14532d !important; background:#fff; }
.lc-call:hover { border-color:#1e7a4c; background:#f4faf6; }
.lc-btn:focus-visible, .lc-wa:focus-visible, .lc-call:focus-visible, .lc-topics button:focus-visible { outline:2px solid #e3a83a; outline-offset:2px; }
.lc-done { text-align:center; display:flex; flex-direction:column; align-items:center; gap:8px; padding:12px 0; }
.lc-done b { font-size:22px; color:#14532d; }
.lc-done p { margin:0 0 10px; padding:0; color:#475569; font-size:15px; line-height:1.6; max-width:360px; }
.lc-done strong { color:#0b1712; }
.lc-tick { width:64px; height:64px; border-radius:50%; background:#e7f6ec; color:#1e7a4c; display:flex; align-items:center; justify-content:center; font-size:28px; box-shadow:0 0 0 8px #f3faf5; margin-bottom:6px; }
.lc.dark { border-color:#14532d; }

/* iPad / small laptop: copy on top (steps in a row), form below */
@media (max-width:1023px) {
  .lc { grid-template-columns:minmax(0,1fr); border-radius:22px; }
  .lc-copy { padding:32px 32px 26px; border-right:0; border-bottom:1px solid #f0dfba; }
  .lc-copy > p { max-width:none; margin-bottom:20px; }
  .lc-steps { flex-direction:row; gap:12px; margin-bottom:20px; }
  .lc-steps li { flex:1; min-width:0; flex-direction:column; align-items:flex-start; gap:10px; padding:14px; border-radius:16px; background:rgba(255,255,255,.65); border:1px solid #f0dfba; }
  .lc-trust { margin-top:0; }
  .lc-side { padding:28px 32px 30px; }
}
/* phones */
@media (max-width:767px) {
  .lc { border-radius:20px; }
  .lc-copy { padding:24px 18px 20px; }
  .lc-eyebrow { font-size:11px; padding:5px 10px; margin-bottom:12px; }
  .lc h2 { font-size:24px; }
  .lc-copy > p { font-size:14.5px; margin-bottom:16px; }
  .lc-steps { gap:8px; margin-bottom:16px; }
  .lc-steps li { padding:11px 9px; gap:8px; border-radius:14px; }
  .lc-step-ic { width:36px; height:36px; border-radius:11px; font-size:15px; }
  .lc-step-ic em { width:17px; height:17px; font-size:10px; top:-5px; right:-5px; }
  .lc-steps b { font-size:12.5px; }
  .lc-steps small { font-size:11px; }
  .lc-trust { gap:6px 14px; padding-top:14px; }
  .lc-trust span { font-size:12px; }
  .lc-side { padding:22px 18px 22px; }
  .lc-head { margin-bottom:14px; }
  .lc-head b { font-size:17px; }
  .lc-row { grid-template-columns:1fr; gap:12px; }
  .lc-side input:not([type=checkbox]) { font-size:16px; } /* 16px stops iPhone zooming in */
  .lc-q { margin-top:16px; }
  /* one swipeable line of chips so the form stays short */
  .lc-topics { flex-wrap:nowrap; overflow-x:auto; margin:0 -18px 14px; padding:0 18px 2px; scrollbar-width:none; -webkit-overflow-scrolling:touch; }
  .lc-topics::-webkit-scrollbar { display:none; }
  .lc-topics button { flex:none; }
}
@media (max-width:360px) {
  .lc-steps small { display:none; }
}
@media (prefers-reduced-motion: reduce) { .lc-status.on i, .lc-spin { animation:none; } .lc-btn, .lc-topics button { transition:none; } }
`;
