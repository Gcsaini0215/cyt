import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { apiUrl } from "../utils/url";
import { isValidMail } from "../utils/validators";
import { setTraineeToken, getTrainee } from "../utils/trainee-auth";

/* Trainee portal: sign in with an email code, or "Create account" (first name, last name, mobile, email
   + email code) on the same page. Uses its own trainee sign-in — a client / therapist login on this
   browser doesn't count. After sign-in: the trainee's page if they've applied, else the application form. */

async function post(path, body) {
  const r = await fetch(`${apiUrl}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  return { ...j, ok: r.ok && !!j?.status, code: r.status };
}

export default function SupervisionLogin() {
  const router = useRouter();
  const [mode, setMode] = useState("signin"); // signin | register
  const [email, setEmail] = useState("");
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpView, setOtpView] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [waiting, setWaiting] = useState(""); // account made — waiting for CYT approval

  const goOn = () => router.push("/trainee"); // the trainee portal home (it links to the application form if needed)

  // already signed in to the trainee portal on this browser
  useEffect(() => {
    const t = getTrainee();
    if (t) goOn();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = setInterval(() => setCooldown((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const switchMode = (m) => { setMode(m); setOtpView(false); setOtp(""); setError(""); };

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    if (loading || cooldown > 0) return;
    setError("");
    if (mode === "register") {
      if (first.trim().length < 2) { setError("Enter your first name"); return; }
      if (!/^[6-9]\d{9}$/.test(phone)) { setError("Enter a valid 10-digit mobile number"); return; }
    }
    if (!isValidMail(email)) { setError("Enter a valid email address"); return; }
    setLoading(true);
    try {
      const res = mode === "register"
        ? await post("/trainees/register", { firstName: first.trim(), lastName: last.trim(), phone, email: email.trim() })
        : await post("/trainees/login", { email: email.trim() });
      if (res.ok) { setOtpView(true); setCooldown(30); }
      else {
        setError(res.message || "Could not send the code");
        if (res.code === 429) setCooldown(30);
      }
    } catch { setError("Something went wrong — please check your connection."); }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    if (loading) return;
    setError("");
    if (otp.length !== 6) { setError("Enter the 6-digit code"); return; }
    setLoading(true);
    try {
      const res = await post(mode === "register" ? "/trainees/register/verify" : "/trainees/verify-otp", { email: email.trim(), otp });
      if (res.ok && res.pending) { setWaiting(res.message || "Account created — waiting for approval."); setLoading(false); return; }
      if (res.ok && res.token) { setTraineeToken(res.token); goOn(); return; }
      setError(res.message || "That code is not right");
    } catch { setError("Verification failed — please try again."); }
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Trainee Portal Login · Choose Your Therapist</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <style dangerouslySetInnerHTML={{ __html: `
        html,body{margin:0;padding:0;height:100%;}
        #__next,.wrapper,.main-wrapper{height:100%!important;min-height:100vh;}
        .sl-page{
          min-height:100vh;display:flex;align-items:center;justify-content:center;
          background:linear-gradient(160deg,#e3f2e8 0%,#f8f1de 55%,#e6f3ea 100%);
          padding:20px 16px;font-family:inherit;
          box-sizing:border-box;position:relative;overflow:hidden;
        }
        .sl-blob{position:absolute;border-radius:50%;pointer-events:none;}
        .sl-blob-1{width:320px;height:320px;top:-110px;left:-110px;background:radial-gradient(circle,rgba(104,182,136,0.35) 0%,transparent 70%);}
        .sl-blob-2{width:340px;height:340px;bottom:-120px;right:-120px;background:radial-gradient(circle,rgba(232,190,110,0.35) 0%,transparent 70%);}
        .sl-card{
          width:100%;max-width:420px;background:#ffffff;border-radius:24px;
          padding:34px 30px;border:1px solid #e6ece8;
          box-shadow:0 24px 60px -24px rgba(20,60,40,0.35);position:relative;z-index:1;
        }
        .sl-icon{
          width:56px;height:56px;border-radius:16px;margin:0 auto 14px;
          background:linear-gradient(135deg,#14532d,#1e7a4c);
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 8px 20px rgba(20,83,45,0.3);
        }
        .sl-title{font-size:21px;font-weight:800;color:#13261c;margin:0 0 4px;text-align:center;}
        .sl-sub{font-size:13px;color:#6b7c72;text-align:center;margin:0 0 20px;}
        .sl-tabs{display:flex;gap:4px;padding:4px;border-radius:12px;background:#f1f5f2;margin:0 0 18px;}
        .sl-tabs button{flex:1;height:38px;border:none;border-radius:9px;background:transparent;font:inherit;font-size:13.5px;font-weight:800;color:#64748b;cursor:pointer;}
        .sl-tabs button.on{background:#fff;color:#14532d;box-shadow:0 1px 3px rgba(16,24,40,.12);}
        .sl-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;}
        .sl-label{display:block;font-size:11px;font-weight:700;color:#5b6b62;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;}
        .sl-input{
          width:100%;background:#f8faf9;border:1.5px solid #e2e8e4;border-radius:12px;
          padding:12px 14px;font-size:15px;color:#13261c;font-family:inherit;
          outline:none;box-sizing:border-box;transition:border-color .2s,box-shadow .2s,background .2s;
        }
        .sl-input:focus{border-color:#1e7a4c;background:#fff;box-shadow:0 0 0 3px rgba(30,122,76,.12);}
        .sl-otp{font-size:22px;font-weight:800;letter-spacing:12px;text-align:center;}
        .sl-btn{
          width:100%;background:linear-gradient(135deg,#14532d,#1e7a4c);color:#fff;
          border:none;border-radius:12px;padding:13px;font-size:14.5px;font-weight:800;
          cursor:pointer;font-family:inherit;margin-top:6px;transition:opacity .2s,transform .2s;
          box-shadow:0 8px 20px rgba(20,83,45,0.25);
        }
        .sl-btn:hover:not(:disabled){transform:translateY(-1px);}
        .sl-btn:disabled{opacity:.6;cursor:not-allowed;}
        .sl-err{background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:10px 12px;font-size:12.5px;color:#dc2626;margin-bottom:14px;font-weight:600;}
        .sl-back{background:none;border:none;color:#64748b;font-size:12.5px;font-weight:700;cursor:pointer;font-family:inherit;padding:0;margin-bottom:14px;}
        .sl-back:hover{color:#13261c;}
        .sl-resend{background:none;border:none;font-size:12.5px;font-weight:800;cursor:pointer;font-family:inherit;padding:0;}
        .sl-wait{text-align:center;display:flex;flex-direction:column;align-items:center;gap:6px;padding:6px 0;}
        .sl-wait-ic{width:52px;height:52px;border-radius:50%;background:#dcfce7;color:#166534;font-size:24px;font-weight:900;display:flex;align-items:center;justify-content:center;}
        .sl-wait b{font-size:17px;color:#13261c;}
        .sl-wait p{margin:0 0 6px;font-size:13.5px;line-height:1.6;color:#5b6b62;}
        .sl-foot{text-align:center;margin-top:20px;font-size:13px;color:#64748b;}
        .sl-link{background:none;border:none;padding:0;font:inherit;font-size:13px;font-weight:800;color:#1e7a4c;cursor:pointer;text-decoration:underline;text-underline-offset:3px;}
        .sl-foot2{margin-top:10px;}
        .sl-foot2 a{font-size:12.5px;color:#8a5a0b;text-decoration:none;font-weight:700;}
        .sl-foot2 a:hover{text-decoration:underline;}
        @keyframes spin{to{transform:rotate(360deg);}}
        .sl-spin{width:14px;height:14px;border-radius:50%;border:2px solid rgba(255,255,255,.35);border-top-color:#fff;display:inline-block;animation:spin .7s linear infinite;vertical-align:middle;margin-right:6px;}
        @media(max-width:420px){.sl-card{padding:26px 18px;} .sl-row{grid-template-columns:1fr;}}
      `}} />

      <div className="sl-page">
        <div className="sl-blob sl-blob-1" />
        <div className="sl-blob sl-blob-2" />

        <div className="sl-card">
          <div className="sl-icon">
            <i className="feather-award" style={{ fontSize: 22, color: "#ecc77d" }}></i>
          </div>
          <h1 className="sl-title">Trainee Portal</h1>
          <p className="sl-sub">{mode === "register" ? "Create your trainee account" : "Supervision cum Internship · Choose Your Therapist"}</p>

          {waiting ? (
            <div className="sl-wait">
              <span className="sl-wait-ic" aria-hidden="true">✓</span>
              <b>Account created</b>
              <p>{waiting}</p>
              <button type="button" className="sl-btn" onClick={() => { setWaiting(""); switchMode("signin"); }}>Back to sign in</button>
            </div>
          ) : (<>
          {!otpView && (
            <div className="sl-tabs" role="tablist">
              <button type="button" role="tab" aria-selected={mode === "signin"} className={mode === "signin" ? "on" : ""} onClick={() => switchMode("signin")}>Sign in</button>
              <button type="button" role="tab" aria-selected={mode === "register"} className={mode === "register" ? "on" : ""} onClick={() => switchMode("register")}>Create account</button>
            </div>
          )}

          {error && <div className="sl-err">{error}</div>}

          {!otpView ? (
            <form onSubmit={handleSendOtp} noValidate>
              {mode === "register" && (
                <>
                  <div className="sl-row">
                    <div>
                      <label className="sl-label" htmlFor="sl-first">First name</label>
                      <input id="sl-first" className="sl-input" type="text" placeholder="First name" autoComplete="given-name" value={first} onChange={(e) => setFirst(e.target.value)} />
                    </div>
                    <div>
                      <label className="sl-label" htmlFor="sl-last">Last name</label>
                      <input id="sl-last" className="sl-input" type="text" placeholder="Last name" autoComplete="family-name" value={last} onChange={(e) => setLast(e.target.value)} />
                    </div>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label className="sl-label" htmlFor="sl-phone">Mobile number</label>
                    <input id="sl-phone" className="sl-input" type="tel" inputMode="numeric" placeholder="10-digit mobile" autoComplete="tel" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} />
                  </div>
                </>
              )}
              <div style={{ marginBottom: 14 }}>
                <label className="sl-label" htmlFor="sl-email">Email</label>
                <input id="sl-email" className="sl-input" type="email" placeholder="your@email.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <button type="submit" className="sl-btn" disabled={loading || cooldown > 0}>
                {loading ? <><span className="sl-spin" />Sending…</> : cooldown > 0 ? `Wait ${cooldown}s` : mode === "register" ? "Create account — send code →" : "Send code →"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} noValidate>
              <button type="button" className="sl-back" onClick={() => { setOtpView(false); setOtp(""); setError(""); }}>
                ← {mode === "register" ? "Edit details" : "Change email"}
              </button>
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, gap: 8 }}>
                  <label className="sl-label" style={{ margin: 0 }}>Code sent to {email}</label>
                  <button type="button" className="sl-resend" disabled={cooldown > 0 || loading}
                    style={{ color: cooldown > 0 ? "#cbd5e1" : "#1e7a4c" }} onClick={handleSendOtp}>
                    {cooldown > 0 ? `${cooldown}s` : "Resend"}
                  </button>
                </div>
                <input className="sl-input sl-otp" type="text" inputMode="numeric" autoComplete="one-time-code"
                  placeholder="——————" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} autoFocus />
              </div>
              <button type="submit" className="sl-btn" disabled={loading}>
                {loading ? <><span className="sl-spin" />Verifying…</> : mode === "register" ? "Verify & create account" : "Verify & sign in"}
              </button>
            </form>
          )}

          </>)}

          <div className="sl-foot">
            {mode === "signin"
              ? <>New here? <button type="button" className="sl-link" onClick={() => switchMode("register")}>Create account</button></>
              : <>Already have an account? <button type="button" className="sl-link" onClick={() => switchMode("signin")}>Sign in</button></>}
            <div className="sl-foot2"><Link href="/internship-modules">See the internship modules →</Link></div>
          </div>
        </div>
      </div>
    </>
  );
}
