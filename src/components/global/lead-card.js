import React, { useState } from "react";
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
  const [topic, setTopic] = useState(concern);
  const [agree, setAgree] = useState(false);
  const [state, setState] = useState("idle"); // idle | sending | done | error
  const [error, setError] = useState("");

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
        <h2>{title}</h2>
        <p>{sub}</p>
        <ul>
          <li><i className="feather-check" aria-hidden="true" /> Verified psychologists</li>
          <li><i className="feather-check" aria-hidden="true" /> 100% confidential</li>
          <li><i className="feather-check" aria-hidden="true" /> No obligation to book</li>
        </ul>
      </div>
      {state === "done" ? (
        <div className="lc-done" aria-live="polite">
          <span className="lc-tick" aria-hidden="true">✓</span>
          <b>Thank you, {name.split(" ")[0]}!</b>
          <p>We'll reach you on {displayPhone(code, phone)} soon. Want to talk now?</p>
          <a className="lc-wa" href={waLink(waText)} target="_blank" rel="noreferrer"><i className="feather-message-circle" aria-hidden="true" /> WhatsApp us</a>
        </div>
      ) : (
        <form className="lc-form" onSubmit={submit} noValidate>
          <div className="lc-row">
            <label><span>Your name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="e.g. Priya" />
            </label>
            <div className="lc-phone">
              <label htmlFor={phoneId}><span>Mobile number</span></label>
              <PhoneField id={phoneId} code={code} onCode={setCode} value={phone} onChange={setPhone} />
            </div>
          </div>
          <div className="lc-topics" role="group" aria-label="What would you like help with? (optional)">
            {CONCERNS.map((c) => (
              <button key={c} type="button" className={topic === c ? "on" : ""} onClick={() => setTopic(topic === c ? "" : c)}>{c}</button>
            ))}
          </div>
          <label className="lc-agree">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            I agree to be contacted by Choose Your Therapist about my request. See our <a href="/privacy-policy">Privacy Policy</a>.
          </label>
          {error && <p className="lc-err">{error}</p>}
          <div className="lc-acts">
            <button type="submit" className="lc-btn" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Call me back"}</button>
            <a className="lc-wa" href={waLink(waText)} target="_blank" rel="noreferrer"><i className="feather-message-circle" aria-hidden="true" /> WhatsApp</a>
            <a className="lc-call" href={`tel:${PHONE}`}><i className="feather-phone" aria-hidden="true" /> Call</a>
          </div>
        </form>
      )}
    </section>
  );
}

const CSS = `
.lc { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr); gap: 24px 36px; align-items: center; padding: 28px 30px; border-radius: 20px; background: #fffaf0; border: 1px solid #f0dfba; margin: 0; }
.lc.dark { background: #14532d; border-color: #14532d; }
.lc h2 { font-size: clamp(20px, 2.6vw, 26px); font-weight: 800; color: #14532d; margin: 0 0 8px; line-height: 1.25; }
.lc.dark h2 { color: #fff; }
.lc-copy p { font-size: 15px; color: #5b4a2a; line-height: 1.6; margin: 0 0 12px; padding: 0; }
.lc.dark .lc-copy p { color: rgba(255,255,255,.8); }
.lc-copy ul { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px 16px; }
.lc-copy li { margin: 0; font-size: 13.5px; font-weight: 600; color: #14532d; display: inline-flex; align-items: center; gap: 5px; }
.lc-copy li::before { content: none; }
.lc.dark .lc-copy li { color: #ecc77d; }
.lc-form { background: #fff; border-radius: 16px; padding: 18px; box-shadow: 0 14px 30px -20px rgba(20,83,45,.5); }
.lc-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.lc-row label { display: flex; flex-direction: column; gap: 4px; margin: 0; }
.lc-row label span { font-size: 11.5px; font-weight: 800; letter-spacing: .3px; text-transform: uppercase; color: #64748b; }
.lc-row input { height: 46px; border-radius: 11px; border: 1.5px solid #dbe5df; padding: 0 12px; font-size: 15px; color: #0b1712; background: #f8faf9; outline: none; width: 100%; box-shadow: none; }
.lc-phone { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.lc-row .lc-phone label { gap: 0; }
.lc-row input:focus { border-color: #1e7a4c; background: #fff; box-shadow: 0 0 0 3px #dcefe3; }
.lc-topics { display: flex; flex-wrap: wrap; gap: 6px; margin: 12px 0 10px; }
.lc-topics button { height: 32px; padding: 0 11px; border-radius: 999px; border: 1px solid #dbe5df; background: #fff; color: #334155; font-size: 12.5px; font-weight: 600; cursor: pointer; }
.lc-topics button.on { background: #1e7a4c; border-color: #1e7a4c; color: #fff; }
.lc-agree { display: flex; gap: 8px; align-items: flex-start; font-size: 12px; color: #64748b; line-height: 1.45; margin: 0 0 10px; }
/* the theme hides native checkboxes (position:absolute, full width) for its own styling — that
   made this one 390px wide and pushed the page sideways on phones. Use a plain native checkbox. */
.lc-agree input[type=checkbox] { position: static !important; opacity: 1 !important; visibility: visible !important; display: inline-block !important; -webkit-appearance: checkbox !important; appearance: checkbox !important; width: 16px !important; height: 16px !important; min-width: 16px; margin: 2px 0 0 !important; padding: 0 !important; accent-color: #1e7a4c; flex-shrink: 0; }
.lc-agree { position: relative; overflow: hidden; }
.lc-agree a { color: #1e7a4c; font-weight: 700; }
.lc-err { color: #b91c1c; font-size: 13px; margin: 0 0 8px; padding: 0; }
.lc-acts { display: flex; gap: 8px; flex-wrap: wrap; }
.lc-btn { flex: 1 1 160px; height: 48px; border: none; border-radius: 12px; background: #1e7a4c; color: #fff; font-size: 15px; font-weight: 800; cursor: pointer; }
.lc-btn:hover { background: #186640; }
.lc-btn:disabled { opacity: .6; }
.lc-wa, .lc-call { display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 48px; padding: 0 16px; border-radius: 12px; font-size: 14px; font-weight: 800; text-decoration: none !important; }
.lc-wa { background: #25d366; color: #fff !important; }
.lc-call { border: 1.5px solid #cfdcd4; color: #14532d !important; background: #fff; }
.lc-done { background: #fff; border-radius: 16px; padding: 22px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 6px; }
.lc-done b { font-size: 18px; color: #14532d; }
.lc-done p { margin: 0 0 8px; padding: 0; color: #475569; font-size: 14px; }
.lc-tick { width: 46px; height: 46px; border-radius: 50%; background: #eef6f1; color: #1e7a4c; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 800; }
@media (max-width: 767px) {
  .lc { grid-template-columns: 1fr; padding: 20px 16px; gap: 14px; border-radius: 16px; }
  .lc-form { padding: 14px; }
  .lc-row { grid-template-columns: 1fr; }
  .lc-btn { flex-basis: 100%; }
  .lc-wa, .lc-call { flex: 1; }
}
`;
