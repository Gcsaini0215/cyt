import React, { useEffect, useRef, useState } from "react";
import { apiUrl } from "../../utils/url";
import { getToken } from "../../utils/jwt";

/* "My ABHA" — link a client's Ayushman Bharat Health Account (ABDM milestone M1).
   Two ways: link an ABHA they already have (ABHA number + OTP), or create one with Aadhaar OTP.
   Backend: GET/DELETE /abha/me, POST /abha/otp, POST /abha/verify (cyt_backend_api AbhaController).
   demo = true: the whole flow runs on made-up data in the browser (no API calls) — used by /abha-preview
   while NHA's sandbox keys are pending. Any 6-digit OTP works in demo. */

const digits = (v) => String(v || "").replace(/\D/g, "");
const fmtAbhaInput = (v) => {
  const d = digits(v).slice(0, 14);
  return [d.slice(0, 2), d.slice(2, 6), d.slice(6, 10), d.slice(10, 14)].filter(Boolean).join("-");
};
const fmtAadhaarInput = (v) => digits(v).slice(0, 12).replace(/(\d{4})(?=\d)/g, "$1 ");
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }) : "");
const GENDER = { M: "Male", F: "Female", O: "Other", T: "Transgender" };

const DEMO_PROFILE = (method, mobile) => ({
  configured: true, env: "sandbox", linked: true,
  abhaNumber: "91-XXXX-XXXX-4821", abhaAddress: "asha.verma@sbx", name: "Asha Verma",
  gender: "F", yearOfBirth: "1996", mobileLast4: digits(mobile).slice(-4) || "3210",
  method, linkedAt: new Date().toISOString(),
});

async function api(path, { method = "GET", body } = {}) {
  const res = await fetch(`${apiUrl}${path}`, {
    method,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  let j = null;
  try { j = await res.json(); } catch (e) { /* empty */ }
  if (!res.ok || !j?.status) {
    const err = new Error(j?.message || "Something went wrong. Please try again.");
    err.configured = j?.configured;
    throw err;
  }
  return j.data;
}

const Ico = {
  shield: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3Zm-1.2 14.2-3.5-3.5 1.4-1.4 2.1 2.1 4.9-4.9 1.4 1.4-6.3 6.3Z" /></svg>,
  link: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.6 13.4a1 1 0 0 1 0-1.4l3.3-3.3a1 1 0 1 1 1.4 1.4L12 13.4a1 1 0 0 1-1.4 0ZM8.5 19a4.5 4.5 0 0 1-3.2-7.7l2.1-2.1a1 1 0 1 1 1.4 1.4l-2.1 2.1a2.5 2.5 0 0 0 3.5 3.5l2.1-2.1a1 1 0 1 1 1.4 1.4l-2.1 2.1A4.5 4.5 0 0 1 8.5 19Zm7.4-4.8a1 1 0 0 1-.7-1.7l2.1-2.1a2.5 2.5 0 0 0-3.5-3.5l-2.1 2.1a1 1 0 1 1-1.4-1.4l2.1-2.1a4.5 4.5 0 0 1 6.4 6.4l-2.1 2.1a1 1 0 0 1-.8.2Z" /></svg>,
  plus: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z" /></svg>,
  lock: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 9h-1V7a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2Zm-7-2a2 2 0 1 1 4 0v2h-4V7Zm2 11a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z" /></svg>,
  back: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.4 7.4 14 6l-6 6 6 6 1.4-1.4L10.8 12z" /></svg>,
  doc: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm-1 7V3.5L18.5 9H13ZM8 13h8v2H8v-2Zm0 4h8v2H8v-2Z" /></svg>,
  qr: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3h8v8H3V3Zm2 2v4h4V5H5Zm8-2h8v8h-8V3Zm2 2v4h4V5h-4ZM3 13h8v8H3v-8Zm2 2v4h4v-4H5Zm13-2h3v3h-3v-3Zm-5 0h3v3h-3v-3Zm3 3h2v2h-2v-2Zm-3 2h3v3h-3v-3Zm5 1h3v2h-3v-2Z" /></svg>,
};

function OtpBoxes({ value, onChange, disabled }) {
  const refs = useRef([]);
  const v = digits(value).slice(0, 6).padEnd(6, " ");
  const set = (i, ch) => {
    const arr = v.split("");
    arr[i] = ch || " ";
    onChange(arr.join("").replace(/\s+$/, "").replace(/ /g, ""));
  };
  return (
    <div className="ab-otp" onPaste={(e) => { const d = digits(e.clipboardData.getData("text")).slice(0, 6); if (d) { e.preventDefault(); onChange(d); refs.current[Math.min(d.length, 5)]?.focus(); } }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input key={i} ref={(el) => { refs.current[i] = el; }} inputMode="numeric" autoComplete={i === 0 ? "one-time-code" : "off"} maxLength={1}
          aria-label={`OTP digit ${i + 1}`} disabled={disabled} value={v[i].trim()}
          onChange={(e) => { const d = digits(e.target.value).slice(-1); set(i, d); if (d && i < 5) refs.current[i + 1]?.focus(); }}
          onKeyDown={(e) => { if (e.key === "Backspace" && !v[i].trim() && i > 0) { set(i - 1, ""); refs.current[i - 1]?.focus(); } }} />
      ))}
    </div>
  );
}

export default function AbhaLink({ demo = false }) {
  const [info, setInfo] = useState(null); // { configured, env, linked, ... }
  const [err, setErr] = useState("");
  const [mode, setMode] = useState(null); // null | "link" | "create"
  const [step, setStep] = useState("id"); // id | otp
  const [abhaNo, setAbhaNo] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [consent, setConsent] = useState(false);
  const [otp, setOtp] = useState("");
  const [mobile, setMobile] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [askUnlink, setAskUnlink] = useState(false);
  const [wait, setWait] = useState(0); // resend countdown

  useEffect(() => {
    if (demo) { setInfo({ configured: true, env: "sandbox", linked: false }); return; }
    api("/abha/me").then(setInfo).catch((e) => setErr(e.message));
  }, [demo]);
  useEffect(() => {
    if (!wait) return undefined;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const reset = () => { setMode(null); setStep("id"); setOtp(""); setNote(""); setErr(""); setAadhaar(""); setAbhaNo(""); setConsent(false); setMobile(""); };

  const sendOtp = async () => {
    setErr(""); setNote("");
    if (mode === "link" && digits(abhaNo).length !== 14) return setErr("Enter your 14-digit ABHA number.");
    if (mode === "create" && digits(aadhaar).length !== 12) return setErr("Enter your 12-digit Aadhaar number.");
    if (mode === "create" && !consent) return setErr("Please tick the consent to continue.");
    setBusy(true);
    try {
      if (demo) {
        await new Promise((r) => setTimeout(r, 700));
        setNote(mode === "create" ? "OTP sent to the mobile linked with your Aadhaar (demo: type any 6 digits)." : "OTP sent to the mobile linked with your ABHA (demo: type any 6 digits).");
      } else {
        const d = await api("/abha/otp", { method: "POST", body: mode === "create" ? { flow: "create", aadhaar: digits(aadhaar), consent: true } : { flow: "link", abhaNumber: digits(abhaNo) } });
        setNote(d.message || "OTP sent.");
      }
      setStep("otp"); setOtp(""); setWait(45);
    } catch (e) { setErr(e.message); }
    setBusy(false);
  };

  const verify = async () => {
    setErr("");
    if (digits(otp).length !== 6) return setErr("Enter the 6-digit OTP.");
    if (mode === "create" && digits(mobile).length !== 10) return setErr("Enter a 10-digit mobile number for your ABHA.");
    setBusy(true);
    try {
      const d = demo
        ? (await new Promise((r) => setTimeout(r, 900)), DEMO_PROFILE(mode === "create" ? "created-aadhaar" : "linked-abha-number", mobile))
        : await api("/abha/verify", { method: "POST", body: { otp: digits(otp), mobile: digits(mobile) } });
      setInfo(d); reset();
    } catch (e) { setErr(e.message); }
    setBusy(false);
  };

  const unlink = async () => {
    setBusy(true);
    try {
      const d = demo ? { configured: true, env: "sandbox", linked: false } : await api("/abha/me", { method: "DELETE" });
      setInfo(d); setAskUnlink(false);
    } catch (e) { setErr(e.message); }
    setBusy(false);
  };

  return (
    <div className="ab">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <header className="ab-head">
        <div className="ab-head-ic">{Ico.shield}</div>
        <div>
          <h1>My ABHA</h1>
          <p>Link your <b>Ayushman Bharat Health Account</b> (ABHA) — India’s digital health ID — to Choose Your Therapist.</p>
        </div>
        {(demo || info?.env === "sandbox") && info?.configured !== false && <span className="ab-tag">{demo ? "Preview · demo data" : "Sandbox"}</span>}
      </header>

      {!info && !err && <div className="ab-skel" />}

      {info && info.configured === false && !info.linked && (
        <section className="ab-card ab-soon">
          <h2>Coming soon</h2>
          <p>We’re connecting Choose Your Therapist with the Ayushman Bharat Digital Mission (ABDM). Soon you’ll be able to link your ABHA here and keep your session invoices and assessment reports in your ABHA app — only when you choose to.</p>
        </section>
      )}

      {info?.linked && (
        <section className="ab-done">
          <div className="ab-abha">
            <div className="ab-abha-top">
              <span>Ayushman Bharat Health Account</span>
              <i className="ab-abha-chip">{Ico.shield} Verified with ABDM</i>
            </div>
            <div className="ab-abha-name">{info.name || "—"}</div>
            <div className="ab-abha-num"><small>ABHA number</small>{info.abhaNumber}</div>
            <div className="ab-abha-row">
              <div><small>ABHA address</small>{info.abhaAddress || "—"}</div>
              <div><small>Gender · Year of birth</small>{[GENDER[info.gender] || info.gender, info.yearOfBirth].filter(Boolean).join(" · ") || "—"}</div>
            </div>
          </div>
          <div className="ab-card ab-meta">
            <div><small>Linked on</small>{fmtDate(info.linkedAt)}</div>
            <div><small>How</small>{info.method === "created-aadhaar" ? "Created with Aadhaar OTP" : "Linked with ABHA number"}</div>
            {info.mobileLast4 && <div><small>Mobile</small>••••••{info.mobileLast4}</div>}
            {!askUnlink
              ? <button type="button" className="ab-b ghost" onClick={() => setAskUnlink(true)}>Unlink ABHA</button>
              : (
                <div className="ab-confirm">
                  <p>Remove this ABHA from your Choose Your Therapist account? Your ABHA itself is not deleted.</p>
                  <div><button type="button" className="ab-b danger" onClick={unlink} disabled={busy}>{busy ? "Removing…" : "Yes, unlink"}</button><button type="button" className="ab-b ghost" onClick={() => setAskUnlink(false)}>Cancel</button></div>
                </div>
              )}
          </div>
        </section>
      )}

      {info?.configured && !info.linked && !mode && (
        <section className="ab-choose">
          <button type="button" className="ab-opt" onClick={() => { reset(); setMode("link"); }}>
            <span className="ab-opt-ic">{Ico.link}</span>
            <b>I already have an ABHA</b>
            <span>Link it with your 14-digit ABHA number and an OTP.</span>
          </button>
          <button type="button" className="ab-opt" onClick={() => { reset(); setMode("create"); }}>
            <span className="ab-opt-ic gold">{Ico.plus}</span>
            <b>Create my ABHA</b>
            <span>Free, takes about 2 minutes with your Aadhaar and an OTP.</span>
          </button>
        </section>
      )}

      {info?.configured && !info.linked && mode && (
        <section className="ab-card ab-flow">
          <button type="button" className="ab-back" onClick={() => (step === "otp" ? (setStep("id"), setErr(""), setNote("")) : reset())}>{Ico.back} Back</button>
          <div className="ab-steps" aria-hidden="true"><i className="on" /><i className={step === "otp" ? "on" : ""} /></div>
          <h2>{mode === "link" ? "Link your ABHA" : "Create your ABHA"}</h2>

          {step === "id" && mode === "link" && (
            <>
              <label className="ab-l" htmlFor="ab-no">ABHA number</label>
              <input id="ab-no" className="ab-in mono" inputMode="numeric" placeholder="91-1234-5678-9012" value={abhaNo} onChange={(e) => setAbhaNo(fmtAbhaInput(e.target.value))} />
              <p className="ab-hint">It’s on your ABHA card and in the ABHA app. We’ll send an OTP to the mobile number registered with it.</p>
            </>
          )}
          {step === "id" && mode === "create" && (
            <>
              <label className="ab-l" htmlFor="ab-ad">Aadhaar number</label>
              <input id="ab-ad" className="ab-in mono" inputMode="numeric" autoComplete="off" placeholder="1234 5678 9012" value={aadhaar} onChange={(e) => setAadhaar(fmtAadhaarInput(e.target.value))} />
              <label className="ab-consent">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                <span>I agree to share my Aadhaar number with the National Health Authority (NHA) to create my ABHA, and I confirm this Aadhaar number is mine. Choose Your Therapist does not store my Aadhaar number.</span>
              </label>
            </>
          )}
          {step === "otp" && (
            <>
              {note && <p className="ab-note">{note}</p>}
              <label className="ab-l">Enter OTP</label>
              <OtpBoxes value={otp} onChange={setOtp} disabled={busy} />
              {mode === "create" && (
                <>
                  <label className="ab-l" htmlFor="ab-mob">Mobile number for your ABHA</label>
                  <div className="ab-mob"><span>+91</span><input id="ab-mob" className="ab-in" inputMode="numeric" placeholder="98765 43210" value={mobile} onChange={(e) => setMobile(digits(e.target.value).slice(0, 10))} /></div>
                </>
              )}
              <button type="button" className="ab-resend" disabled={wait > 0 || busy} onClick={sendOtp}>{wait > 0 ? `Resend OTP in ${wait}s` : "Resend OTP"}</button>
            </>
          )}

          {err && <div className="ab-err" role="alert">{err}</div>}
          <button type="button" className="ab-b main" onClick={step === "id" ? sendOtp : verify} disabled={busy}>
            {busy ? "Please wait…" : step === "id" ? "Send OTP" : mode === "link" ? "Verify & link" : "Verify & create ABHA"}
          </button>
        </section>
      )}

      {err && !mode && <div className="ab-err" role="alert">{err}</div>}

      <section className="ab-why">
        <div><span>{Ico.doc}</span><b>Your records, in one place</b><p>Soon, session invoices and assessment reports can go to your ABHA app — only when you say yes.</p></div>
        <div><span>{Ico.lock}</span><b>Private by design</b><p>We never store your Aadhaar number or OTP. Session notes are never shared on their own.</p></div>
        <div><span>{Ico.qr}</span><b>Faster check-in</b><p>At our Noida centre, scan &amp; share your ABHA instead of filling forms.</p></div>
      </section>
      <p className="ab-foot">ABHA is a service of the National Health Authority, Government of India. Choose Your Therapist is registered on the Health Facility Registry (HFR ID IN0510005384).</p>
    </div>
  );
}

const CSS = `
.ab { --g:#14532d; --g2:#1e7a4c; --gold:#e0ab45; --ink:#0b1712; --mut:#5b6b63; --line:#e2ebe5; max-width: 980px; margin: 0 auto; color: var(--ink); }
.ab svg { width: 1em; height: 1em; fill: currentColor; flex: none; }
.ab-head { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 22px; position: relative; }
.ab-head-ic { width: 52px; height: 52px; border-radius: 16px; display: grid; place-items: center; font-size: 28px; color: #fff; background: linear-gradient(135deg, #1f7a4a, #0b3d26); box-shadow: 0 10px 22px -12px rgba(20,83,45,.7); }
.ab-head h1 { font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 800; margin: 0 0 4px; color: var(--ink); }
.ab-head p { margin: 0; color: var(--mut); font-size: 15px; max-width: 640px; }
.ab-tag { margin-left: auto; align-self: center; font-size: 12px; font-weight: 800; color: #8a5a06; background: #fdf3dc; border: 1px solid #f3dca6; padding: 5px 10px; border-radius: 999px; white-space: nowrap; }
.ab-skel { height: 220px; border-radius: 20px; background: linear-gradient(90deg,#eef3ef 0,#f7faf8 50%,#eef3ef 100%); background-size: 200% 100%; animation: abSk 1.2s infinite; }
@keyframes abSk { to { background-position: -200% 0; } }
.ab-card { background: #fff; border: 1px solid var(--line); border-radius: 20px; padding: 22px; box-shadow: 0 10px 30px -24px rgba(15,23,42,.35); }
.ab-card h2 { font-size: 19px; font-weight: 800; margin: 0 0 14px; }
.ab-soon p { margin: 0; color: var(--mut); line-height: 1.6; }
.ab-choose { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.ab-opt { text-align: left; display: flex; flex-direction: column; gap: 6px; padding: 22px; border-radius: 20px; border: 1.5px solid var(--line); background: #fff; cursor: pointer; font-family: inherit; transition: border-color .2s, box-shadow .2s, transform .2s; }
.ab-opt:hover { border-color: var(--g2); box-shadow: 0 14px 30px -22px rgba(20,83,45,.6); transform: translateY(-2px); }
.ab-opt b { font-size: 17px; color: var(--ink); }
.ab-opt span:last-child { color: var(--mut); font-size: 14px; line-height: 1.5; }
.ab-opt-ic { width: 44px; height: 44px; border-radius: 14px; display: grid; place-items: center; font-size: 22px; color: var(--g); background: #e8f5ec; margin-bottom: 6px; }
.ab-opt-ic.gold { color: #8a5a06; background: #fdf3dc; }
.ab-flow { max-width: 520px; position: relative; }
.ab-back { display: inline-flex; align-items: center; gap: 4px; border: 0; background: none; color: var(--g2); font-weight: 700; font-size: 14px; padding: 0; margin-bottom: 12px; cursor: pointer; font-family: inherit; }
.ab-back svg { font-size: 18px; }
.ab-steps { position: absolute; top: 24px; right: 22px; display: flex; gap: 6px; }
.ab-steps i { width: 26px; height: 5px; border-radius: 3px; background: var(--line); }
.ab-steps i.on { background: var(--g2); }
.ab-l { display: block; font-size: 13.5px; font-weight: 700; color: #334155; margin: 12px 0 6px; }
.ab-in { width: 100%; height: 50px; border: 1.5px solid var(--line); border-radius: 12px; padding: 0 14px; font-size: 17px; font-family: inherit; color: var(--ink); background: #fff; }
.ab-in.mono { letter-spacing: .06em; font-variant-numeric: tabular-nums; }
.ab-in:focus, .ab-otp input:focus { outline: none; border-color: var(--g2); box-shadow: 0 0 0 3px rgba(30,122,76,.14); }
.ab-hint { margin: 8px 0 0; font-size: 13px; color: var(--mut); line-height: 1.5; }
.ab-consent { display: flex; gap: 10px; align-items: flex-start; margin-top: 14px; padding: 12px 14px; border-radius: 12px; background: #f6faf7; border: 1px solid var(--line); font-size: 13px; line-height: 1.55; color: #334155; cursor: pointer; }
.ab-consent input { width: 18px; height: 18px; margin-top: 2px; accent-color: var(--g2); flex: none; }
.ab-note { margin: 0 0 4px; font-size: 13.5px; color: #166534; background: #ecfdf3; border: 1px solid #c7ecd5; padding: 9px 12px; border-radius: 10px; }
.ab-otp { display: flex; gap: 8px; }
.ab-otp input { width: 48px; height: 54px; text-align: center; font-size: 22px; font-weight: 800; border: 1.5px solid var(--line); border-radius: 12px; font-family: inherit; color: var(--ink); }
.ab-mob { display: flex; align-items: stretch; }
.ab-mob span { display: grid; place-items: center; padding: 0 12px; border: 1.5px solid var(--line); border-right: 0; border-radius: 12px 0 0 12px; background: #f6faf7; font-weight: 700; color: #334155; }
.ab-mob .ab-in { border-radius: 0 12px 12px 0; }
.ab-resend { margin-top: 10px; border: 0; background: none; color: var(--g2); font-weight: 700; font-size: 13.5px; padding: 0; cursor: pointer; font-family: inherit; }
.ab-resend:disabled { color: #94a3b8; cursor: default; }
.ab-err { margin-top: 14px; font-size: 14px; color: #b42318; background: #fef3f2; border: 1px solid #fecdca; padding: 10px 12px; border-radius: 10px; }
.ab-b { display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 48px; padding: 0 20px; border-radius: 12px; font-size: 15px; font-weight: 800; border: 0; cursor: pointer; font-family: inherit; }
.ab-b.main { width: 100%; margin-top: 18px; color: #fff; background: linear-gradient(180deg, #1f7a4a, #14532d); box-shadow: 0 10px 20px -12px rgba(20,83,45,.7); }
.ab-b.ghost { background: #fff; border: 1.5px solid #cfe3d6; color: #166534; height: 42px; }
.ab-b.danger { background: #b42318; color: #fff; height: 42px; }
.ab-b:disabled { opacity: .65; cursor: default; }
.ab-done { display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr); gap: 14px; align-items: start; }
.ab-abha { position: relative; overflow: hidden; border-radius: 22px; padding: 22px 24px; color: #fff; min-height: 220px; background: radial-gradient(circle at 100% 0, rgba(242,201,76,.45), transparent 45%), linear-gradient(135deg, #1f7a4a, #0b3d26 70%); box-shadow: 0 22px 40px -26px rgba(11,61,38,.9); }
.ab-abha::after { content: ""; position: absolute; right: -60px; bottom: -60px; width: 200px; height: 200px; border-radius: 50%; border: 2px solid rgba(255,255,255,.12); }
.ab-abha-top { display: flex; justify-content: space-between; align-items: center; gap: 10px; font-size: 12.5px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; color: #f6d58a; }
.ab-abha-chip { display: inline-flex; align-items: center; gap: 5px; font-style: normal; text-transform: none; letter-spacing: 0; font-size: 12px; background: rgba(255,255,255,.14); color: #fff; padding: 4px 10px; border-radius: 999px; }
.ab-abha-name { font-size: 24px; font-weight: 800; margin: 18px 0 10px; }
.ab-abha-num { font-size: 22px; font-weight: 800; letter-spacing: .08em; font-variant-numeric: tabular-nums; }
.ab-abha small, .ab-meta small { display: block; font-size: 11.5px; font-weight: 700; letter-spacing: .03em; text-transform: uppercase; opacity: .75; margin-bottom: 2px; letter-spacing: .04em; }
.ab-abha-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px; font-size: 15px; font-weight: 600; }
.ab-meta { display: grid; gap: 14px; font-size: 15px; font-weight: 600; }
.ab-meta small { color: var(--mut); opacity: 1; }
.ab-confirm p { margin: 0 0 10px; font-size: 13.5px; color: #334155; font-weight: 500; line-height: 1.5; }
.ab-confirm div { display: flex; gap: 8px; flex-wrap: wrap; }
.ab-why { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 26px; }
.ab-why > div { padding: 18px; border-radius: 18px; background: #f6faf7; border: 1px solid var(--line); }
.ab-why span { display: grid; place-items: center; width: 38px; height: 38px; border-radius: 12px; background: #fff; color: var(--g2); font-size: 20px; margin-bottom: 10px; box-shadow: 0 6px 14px -10px rgba(20,83,45,.5); }
.ab-why b { display: block; font-size: 15px; margin-bottom: 4px; }
.ab-why p { margin: 0; font-size: 13.5px; color: var(--mut); line-height: 1.55; }
.ab-foot { margin: 18px 0 0; font-size: 12.5px; color: #7b8a83; }
@media (max-width: 767px) {
  .ab-head { flex-wrap: wrap; gap: 12px; }
  .ab-head-ic { width: 44px; height: 44px; font-size: 24px; border-radius: 14px; }
  .ab-head > div:nth-child(2) { flex: 1 1 calc(100% - 56px); min-width: 0; }
  .ab-tag { margin-left: 56px; }
  .ab-choose, .ab-done, .ab-why { grid-template-columns: 1fr; }
  .ab-otp { gap: 6px; }
  .ab-otp input { width: calc((100% - 30px) / 6); height: 50px; }
  .ab-abha-row { grid-template-columns: 1fr; }
}
`;
