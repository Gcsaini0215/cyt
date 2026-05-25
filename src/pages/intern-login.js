import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { loginUrl, verifyOtpUrl } from "../utils/url";
import { postData } from "../utils/actions";
import { getDecodedToken, setToken } from "../utils/jwt";
import { isValidMail } from "../utils/validators";

export default function InternLogin() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [otp,      setOtp]      = useState("");
  const [otpView,  setOtpView]  = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    const decoded = getDecodedToken();
    if (decoded) router.push("/trainee-psychologist");
  }, [router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    if (loading || cooldown > 0) return;
    setError("");
    if (!isValidMail(email)) { setError("Enter a valid email address"); return; }
    setLoading(true);
    try {
      const res = await postData(loginUrl, { email });
      if (res.status) { setOtpView(true); setCooldown(60); }
      else setError(res.message || "Could not send OTP");
    } catch (err) {
      if (err.response?.status === 429) { setError("Too many requests. Please wait."); setCooldown(60); }
      else setError(err.response?.data?.message || "Something went wrong");
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    if (loading) return;
    setError("");
    if (otp.length !== 6) { setError("Enter the 6-digit OTP"); return; }
    setLoading(true);
    try {
      const res = await postData(verifyOtpUrl, { email, otp });
      if (res.status) { setToken(res.token); router.push("/trainee-psychologist"); }
      else setError(res.message || "Invalid OTP");
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    }
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Intern Login · CYT</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <style dangerouslySetInnerHTML={{ __html: `
        html,body{margin:0;padding:0;height:100%;}
        #__next,.wrapper,.main-wrapper{height:100%!important;min-height:100vh;}
        .il-page{
          min-height:100vh;display:flex;align-items:center;justify-content:center;
          background:#0f172a;padding:20px 16px;font-family:'Segoe UI',Roboto,Arial,sans-serif;
          box-sizing:border-box;
        }
        .il-card{
          width:100%;max-width:360px;background:#1e293b;border-radius:16px;
          padding:36px 28px;border:1px solid rgba(255,255,255,0.06);
          box-shadow:0 24px 60px rgba(0,0,0,0.5);
        }
        .il-title{font-size:20px;font-weight:800;color:#f1f5f9;margin:0 0 4px;text-align:center;}
        .il-sub{font-size:12px;color:#475569;text-align:center;margin:0 0 28px;}
        .il-label{display:block;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;}
        .il-input{
          width:100%;background:#0f172a;border:1.5px solid #334155;border-radius:10px;
          padding:12px 14px;font-size:14px;color:#f1f5f9;font-family:inherit;
          outline:none;box-sizing:border-box;transition:border-color .2s,box-shadow .2s;
        }
        .il-input:focus{border-color:#228756;box-shadow:0 0 0 3px rgba(34,135,86,.15);}
        .il-otp{font-size:22px;font-weight:800;letter-spacing:12px;text-align:center;}
        .il-btn{
          width:100%;background:linear-gradient(135deg,#1b5e20,#228756);color:#fff;
          border:none;border-radius:10px;padding:13px;font-size:14px;font-weight:700;
          cursor:pointer;font-family:inherit;margin-top:6px;transition:opacity .2s;
        }
        .il-btn:disabled{opacity:.6;cursor:not-allowed;}
        .il-err{background:#7f1d1d22;border:1px solid #ef444444;border-radius:8px;padding:10px 12px;font-size:12px;color:#fca5a5;margin-bottom:14px;}
        .il-back{background:none;border:none;color:#475569;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;padding:0;margin-bottom:16px;}
        .il-back:hover{color:#94a3b8;}
        .il-resend{background:none;border:none;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;padding:0;}
        .il-foot{text-align:center;margin-top:22px;}
        .il-foot a{font-size:12px;color:#334155;text-decoration:none;}
        .il-foot a:hover{color:#64748b;}
        @keyframes spin{to{transform:rotate(360deg);}}
        .il-spin{width:14px;height:14px;border-radius:50%;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;display:inline-block;animation:spin .7s linear infinite;vertical-align:middle;margin-right:6px;}
        @media(max-width:400px){.il-card{padding:28px 20px;}}
      `}} />

      <div className="il-page">
        <div className="il-card">

          <h1 className="il-title">Intern Portal</h1>
          <p className="il-sub">Choose Your Therapist</p>

          {error && <div className="il-err">{error}</div>}

          {!otpView ? (
            <form onSubmit={handleSendOtp} noValidate>
              <div style={{ marginBottom: 14 }}>
                <label className="il-label">Email</label>
                <input className="il-input" type="email" placeholder="your@email.com"
                  value={email} onChange={e => setEmail(e.target.value)} autoFocus />
              </div>
              <button type="submit" className="il-btn" disabled={loading}>
                {loading ? <><span className="il-spin" />Sending…</> : "Send OTP →"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} noValidate>
              <button type="button" className="il-back"
                onClick={() => { setOtpView(false); setOtp(""); setError(""); }}>
                ← Change email
              </button>
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <label className="il-label" style={{ margin: 0 }}>OTP — sent to {email}</label>
                  <button type="button" className="il-resend"
                    disabled={cooldown > 0 || loading}
                    style={{ color: cooldown > 0 ? "#334155" : "#228756" }}
                    onClick={handleSendOtp}>
                    {cooldown > 0 ? `${cooldown}s` : "Resend"}
                  </button>
                </div>
                <input className="il-input il-otp" type="text" inputMode="numeric"
                  placeholder="——————" maxLength={6}
                  value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                  autoFocus />
              </div>
              <button type="submit" className="il-btn" disabled={loading}>
                {loading ? <><span className="il-spin" />Verifying…</> : "Verify & Sign In"}
              </button>
            </form>
          )}

          <div className="il-foot">
            <Link href="/internship-registration">Apply for internship →</Link>
          </div>

        </div>
      </div>
    </>
  );
}
