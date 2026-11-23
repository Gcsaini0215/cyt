import React, { useEffect, useRef, useState } from "react";
import { postData } from "../../utils/actions";
import { loginUrl, registerUrl, verifyOtpUrl } from "../../utils/url";
import { setToken } from "../../utils/jwt";

/* Log in / create an account right inside the chat widget (2026-11-23, owner) — the same email-code flow as
   /login and /register, without leaving the page: email → code (login); unknown email → name + phone → code
   (new account). On success the chat starts right there (onDone). */

const isMail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || "").trim());
const RESEND = 30;
const msgOf = (e, d) => e?.response?.data?.message || (e?.response?.status === 429 ? "Too many tries — please wait a minute." : d);

export default function WidgetLogin({ onDone }) {
  const [step, setStep] = useState("email"); // email | register | otp
  const [mode, setMode] = useState("login"); // login | register
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [cool, setCool] = useState(0);
  const otpRef = useRef(null);

  useEffect(() => { if (cool <= 0) return undefined; const t = setTimeout(() => setCool((c) => c - 1), 1000); return () => clearTimeout(t); }, [cool]);
  useEffect(() => { if (step === "otp") setTimeout(() => otpRef.current?.focus(), 60); }, [step]);

  const sendLogin = async (e) => {
    e?.preventDefault();
    if (busy) return;
    setErr("");
    if (!isMail(email)) return setErr("Please enter a valid email address.");
    setBusy(true);
    try {
      const r = await postData(loginUrl, { email: email.trim(), portal: "site" });
      if (r?.status) { setMode("login"); setStep("otp"); setOtp(""); setCool(RESEND); }
      else setErr(r?.message || "Couldn't send the code. Please try again.");
    } catch (x) {
      if (x?.response?.status === 404) { setMode("register"); setStep("register"); }
      else setErr(msgOf(x, "Couldn't send the code. Please try again."));
    }
    setBusy(false);
  };

  const sendRegister = async (e) => {
    e?.preventDefault();
    if (busy) return;
    setErr("");
    if (name.trim().length < 3 || name.trim().length > 30) return setErr("Please enter your name (3–30 letters).");
    if (phone.length !== 10) return setErr("Please enter a 10-digit mobile number.");
    if (!isMail(email)) return setErr("Please enter a valid email address.");
    setBusy(true);
    try {
      const r = await postData(registerUrl, { email: email.trim(), name: name.trim(), phone });
      if (r?.status) { setStep("otp"); setOtp(""); setCool(RESEND); }
      else setErr(r?.message || "Couldn't create the account. Please try again.");
    } catch (x) { setErr(msgOf(x, "Couldn't create the account. Please try again.")); }
    setBusy(false);
  };

  const verify = async (code = otp) => {
    if (busy) return;
    setErr("");
    if (String(code).length !== 6) return setErr("Please enter the 6-digit code.");
    setBusy(true);
    try {
      const r = await postData(verifyOtpUrl, { email: email.trim(), otp: code, portal: "site" });
      if (r?.status && r?.token) { setToken(r.token); onDone(); return; }
      setErr(r?.message || "That code didn't work. Please try again.");
    } catch (x) { setErr(msgOf(x, "That code didn't work. Please try again.")); }
    setBusy(false);
  };

  const resend = () => { if (cool > 0) return; if (mode === "register") sendRegister(); else sendLogin(); };

  return (
    <div className="wl">
      <style>{CSS}</style>
      {step === "email" && (
        <form onSubmit={sendLogin}>
          <p className="wl-t">Log in or sign up to chat</p>
          <p className="wl-s">We&apos;ll email you a 6-digit code — no password needed.</p>
          <input type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" aria-label="Email" />
          {err && <p className="wl-err">{err}</p>}
          <button type="submit" disabled={busy}>{busy ? "Sending…" : "Continue"}</button>
        </form>
      )}
      {step === "register" && (
        <form onSubmit={sendRegister}>
          <p className="wl-t">Create your free account</p>
          <p className="wl-s"><b>{email.trim()}</b> is new to CYT — just two more details.</p>
          <input type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" aria-label="Your name" />
          <div className="wl-phone"><em>+91</em><input type="tel" inputMode="numeric" autoComplete="tel-national" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="Mobile number" aria-label="Mobile number" /></div>
          {err && <p className="wl-err">{err}</p>}
          <button type="submit" disabled={busy}>{busy ? "Creating…" : "Create account & get code"}</button>
          <button type="button" className="wl-link" onClick={() => { setStep("email"); setErr(""); }}>Use a different email</button>
        </form>
      )}
      {step === "otp" && (
        <form onSubmit={(e) => { e.preventDefault(); verify(); }}>
          <p className="wl-t">Enter the code</p>
          <p className="wl-s">Sent to <b>{email.trim()}</b>. Check your inbox (and spam).</p>
          <input ref={otpRef} className="wl-otp" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otp} placeholder="••••••" aria-label="6-digit code"
            onChange={(e) => { const v = e.target.value.replace(/\D/g, "").slice(0, 6); setOtp(v); if (v.length === 6) verify(v); }} />
          {err && <p className="wl-err">{err}</p>}
          <button type="submit" disabled={busy || otp.length !== 6}>{busy ? "Checking…" : mode === "register" ? "Verify & start chatting" : "Log in & start chatting"}</button>
          <div className="wl-row">
            <button type="button" className="wl-link" disabled={cool > 0} onClick={resend}>{cool > 0 ? `Resend in ${cool}s` : "Resend code"}</button>
            <button type="button" className="wl-link" onClick={() => { setStep("email"); setOtp(""); setErr(""); }}>Change email</button>
          </div>
        </form>
      )}
      <small className="wl-fine">By continuing you agree to our <a href="/terms-conditions" target="_blank" rel="noopener noreferrer">terms</a> and <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">privacy policy</a>.</small>
    </div>
  );
}

const CSS = `
.wl form { display: flex; flex-direction: column; gap: 9px; }
.wl-t { margin: 2px 0 0 !important; font-size: 16px; font-weight: 800; color: #1c1c1e; }
.wl-s { margin: 0 0 2px !important; font-size: 13px; color: #6e6e73; line-height: 1.45; } .wl-s b { color: #1c1c1e; }
.wl input { width: 100%; box-sizing: border-box; height: 44px; border: 1px solid rgba(60,60,67,.22) !important; border-radius: 12px !important; padding: 0 14px !important; font: inherit; font-size: 16px; background: #fff !important; outline: none; box-shadow: none !important; margin: 0 !important; }
.wl input:focus { border-color: #34c759 !important; box-shadow: 0 0 0 3px rgba(52,199,89,.18) !important; }
.wl-otp { text-align: center; letter-spacing: .5em; font-size: 22px !important; font-weight: 700; }
.wl-phone { display: flex; } .wl-phone em { font-style: normal; display: flex; align-items: center; padding: 0 12px; border: 1px solid rgba(60,60,67,.22); border-right: 0; border-radius: 12px 0 0 12px; background: #f2f2f7; font-weight: 700; font-size: 14px; color: #6e6e73; }
.wl-phone input { border-radius: 0 12px 12px 0 !important; }
.wl button[type="submit"] { height: 44px; border: 0; border-radius: 13px; background: #34c759; color: #fff; font: inherit; font-size: 15px; font-weight: 700; cursor: pointer; }
.wl button[type="submit"]:disabled { background: #a7dfb6; cursor: default; }
.wl-link { border: 0; background: none; padding: 2px 0; font: inherit; font-size: 13px; font-weight: 600; color: #0a84ff; cursor: pointer; }
.wl-link:disabled { color: #aeaeb2; cursor: default; }
.wl-row { display: flex; justify-content: space-between; }
.wl-err { margin: 0 !important; font-size: 12.5px; color: #c41e16; }
.wl-fine { display: block; margin-top: 10px; font-size: 11px; color: #aeaeb2; text-align: center; } .wl-fine a { color: #8e8e93; }
`;
