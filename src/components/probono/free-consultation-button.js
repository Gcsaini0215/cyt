import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Dialog } from "@mui/material";
import OtpInput from "../global/otp-input";
import { isAuthenticated, setToken } from "../../utils/jwt";
import { postData } from "../../utils/actions";
import { apiErrorMessage } from "../../utils/api-error";
import { isValidMail, sanitizeOtp } from "../../utils/validators";
import { loginUrl, registerUrl, verifyOtpUrl } from "../../utils/url";

/* Signed-in people go straight to the details page. Everyone else logs in or creates a client account
   here in the popup, with the same one-time code and the same API calls as /login and /register. */

const NEXT = "/client/free-session";
const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export default function FreeConsultationButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("login"); // login | register
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otpView, setOtpView] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = setInterval(() => setCooldown((c) => (c <= 1 ? 0 : c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const start = () => { if (isAuthenticated()) router.push(NEXT); else setOpen(true); };
  const pick = (m) => { setMode(m); setError(""); setNotice(""); };
  const goBack = () => { setOtpView(false); setOtp(""); setError(""); setNotice(""); };

  const send = async () => {
    if (loading) return;
    setError("");
    const mail = email.trim();
    if (mode === "register") {
      if (name.trim().length < 3 || name.trim().length > 30) return setError("Please enter your full name.");
      if (phone.length !== 10) return setError("Please enter a 10-digit phone number.");
    }
    if (!isValidMail(mail)) return setError("Please enter a valid email address.");
    setLoading(true);
    try {
      const res = mode === "login"
        ? await postData(loginUrl, { email: mail, portal: "site" })
        : await postData(registerUrl, { email: mail, name: name.trim(), phone });
      if (res.status) {
        setOtp(""); setOtpView(true); setNotice(""); setCooldown(RESEND_COOLDOWN);
      } else setError(res.message || "Couldn't send the code. Please try again.");
    } catch (e) {
      if (mode === "login" && e.response?.status === 404) {
        setMode("register");
        setNotice("We couldn't find an account with this email. Please create one.");
      } else {
        if (e.response?.status === 429) setCooldown(RESEND_COOLDOWN);
        setError(apiErrorMessage(e, "Couldn't send the code. Please try again."));
      }
    }
    setLoading(false);
    return undefined;
  };

  const verify = async (value) => {
    if (loading) return;
    const code = sanitizeOtp(value ?? otp, OTP_LENGTH);
    setError("");
    if (code.length !== OTP_LENGTH) { setError("Please enter the 6-digit code."); return; }
    setLoading(true);
    try {
      const body = mode === "login" ? { email: email.trim(), otp: code, portal: "site" } : { email: email.trim(), otp: code };
      const res = await postData(verifyOtpUrl, body);
      if (res.status) {
        setToken(res.token);
        router.push(NEXT);
        return;
      }
      setError(res.message || "That code didn't work. Please try again.");
    } catch (e) {
      setError(apiErrorMessage(e, "Couldn't check the code. Please try again."));
    }
    setLoading(false);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <button type="button" className="fc-btn" onClick={start}>Get Free Consultation</button>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs" aria-labelledby="fc-title" PaperProps={{ sx: { borderRadius: "16px", m: 2, width: "calc(100% - 32px)" } }}>
        <div className="fc-pop">
          <button type="button" className="fc-x" aria-label="Close" onClick={() => setOpen(false)}>×</button>
          {otpView ? (
            <>
              <h2 id="fc-title">Check your inbox</h2>
              <p>We sent a 6-digit code to <b>{email.trim()}</b>. It may take a minute, so please check Spam too.</p>
              <div className="fc-otp"><OtpInput autoFocus value={otp} onChange={setOtp} onComplete={(v) => verify(v)} disabled={loading} /></div>
              {error && <p className="fc-err" role="alert">{error}</p>}
              <button type="button" className="fc-btn fc-wide" onClick={() => verify()} disabled={loading}>{loading ? "Checking…" : "Continue"}</button>
              <div className="fc-links">
                <button type="button" onClick={send} disabled={loading || cooldown > 0}>{cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}</button>
                <button type="button" onClick={goBack}>Change email</button>
              </div>
            </>
          ) : (
            <>
              <h2 id="fc-title">Get your free consultation</h2>
              <p>Use your client account. You&apos;ll then share your details, and our team will arrange your session.</p>
              <div className="fc-tabs" role="tablist" aria-label="Your account">
                <button type="button" role="tab" aria-selected={mode === "login"} className={mode === "login" ? "on" : ""} onClick={() => pick("login")}>Log in</button>
                <button type="button" role="tab" aria-selected={mode === "register"} className={mode === "register" ? "on" : ""} onClick={() => pick("register")}>Create account</button>
              </div>
              {notice && <p className="fc-note" role="status">{notice}</p>}
              <form onSubmit={(e) => { e.preventDefault(); send(); }} noValidate>
                {mode === "register" && (
                  <>
                    <label htmlFor="fc-name">Your name</label>
                    <input id="fc-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                    <label htmlFor="fc-phone">Phone number</label>
                    <input id="fc-phone" type="tel" inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} autoComplete="tel-national" />
                  </>
                )}
                <label htmlFor="fc-email">Email address</label>
                <input id="fc-email" type="email" inputMode="email" autoFocus={mode === "login"} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                {error && <p className="fc-err" role="alert">{error}</p>}
                <button type="submit" className="fc-btn fc-wide" disabled={loading}>{loading ? "Sending…" : mode === "login" ? "Send me a code" : "Create account"}</button>
              </form>
            </>
          )}
        </div>
      </Dialog>
    </>
  );
}

const CSS = `
.fc-btn { display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box; min-height: 48px; padding: 0 26px; border: 1.5px solid #166534; border-radius: 12px; background: #166534; color: #fff !important; font: inherit; font-size: 15.5px; font-weight: 800; cursor: pointer; text-decoration: none !important; }
.fc-btn:hover { background: #14532d; }
.fc-btn:disabled { background: #cbd5e1; border-color: #cbd5e1; color: #64748b !important; cursor: not-allowed; }
.fc-wide { width: 100%; margin-top: 14px; }
.fc-pop { position: relative; padding: 24px; }
.fc-x { position: absolute; top: 10px; right: 10px; width: 40px; height: 40px; border: 0; border-radius: 50%; background: none; font-size: 24px; line-height: 1; color: #64748b; cursor: pointer; }
.fc-x:hover { background: #f1f5f9; }
.fc-pop h2 { margin: 0 34px 6px 0; font-size: 21px; font-weight: 800; color: #0f172a; font-family: inherit; }
.fc-pop > p { margin: 0 0 14px; font-size: 14.5px; line-height: 1.5; color: #475569; }
.fc-tabs { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; padding: 4px; margin-bottom: 6px; border-radius: 12px; background: #f1f5f9; }
.fc-tabs button { min-height: 40px; border: 0; border-radius: 9px; background: none; font: inherit; font-size: 14.5px; font-weight: 700; color: #475569; cursor: pointer; }
.fc-tabs button.on { background: #fff; color: #166534; box-shadow: 0 1px 3px rgba(15,23,42,.14); }
.fc-pop label { display: block; margin: 12px 0 5px; font-size: 14px; font-weight: 700; color: #334155; }
.fc-pop input:not([autocomplete=one-time-code]):not(.otp) { width: 100%; box-sizing: border-box; min-height: 46px; padding: 9px 12px; border: 1.5px solid #dbe5df; border-radius: 10px; background: #fff; font: inherit; font-size: 16px; color: #0f172a; outline: none; }
.fc-pop form input:focus { border-color: #15803d; }
.fc-otp { margin: 4px 0 8px; }
.fc-err { margin: 10px 0 0; font-size: 14px; font-weight: 700; color: #b91c1c; }
.fc-note { margin: 8px 0 0; padding: 9px 12px; border-radius: 10px; background: #fffbeb; font-size: 14px; color: #78350f; }
.fc-links { display: flex; justify-content: space-between; gap: 8px; margin-top: 8px; }
.fc-links button { min-height: 40px; padding: 0 4px; border: 0; background: none; font: inherit; font-size: 14px; font-weight: 700; color: #166534; cursor: pointer; }
.fc-links button:disabled { color: #94a3b8; cursor: default; }
`;
