import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { loginUrl, verifyOtpUrl } from "../utils/url";
import { postData } from "../utils/actions";
import { getDecodedToken, setToken } from "../utils/jwt";
import { isValidMail } from "../utils/validators";

const slugify = (s) => (s || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function SupervisionLogin() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [otp,      setOtp]      = useState("");
  const [otpView,  setOtpView]  = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    const decoded = getDecodedToken();
    if (decoded) router.push(`/supervision_to_psychologist/${slugify(decoded.name)}`);
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
      if (res.status) {
        setToken(res.token);
        const decoded = getDecodedToken();
        router.push(`/supervision_to_psychologist/${slugify(decoded?.name || email)}`);
      }
      else setError(res.message || "Invalid OTP");
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    }
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
          background:linear-gradient(160deg,#f0fdf4 0%,#ffffff 45%,#f0f9ff 100%);
          padding:20px 16px;font-family:'Segoe UI',Roboto,Arial,sans-serif;
          box-sizing:border-box;position:relative;overflow:hidden;
        }
        .sl-blob{position:absolute;border-radius:50%;pointer-events:none;}
        .sl-blob-1{width:280px;height:280px;top:-90px;left:-90px;background:radial-gradient(circle,rgba(74,222,128,0.16) 0%,transparent 70%);}
        .sl-blob-2{width:320px;height:320px;bottom:-110px;right:-110px;background:radial-gradient(circle,rgba(96,165,250,0.14) 0%,transparent 70%);}
        .sl-card{
          width:100%;max-width:380px;background:#ffffff;border-radius:24px;
          padding:38px 32px;border:1px solid #eef2f0;
          box-shadow:0 20px 50px rgba(15,23,42,0.08);position:relative;z-index:1;
        }
        .sl-icon{
          width:56px;height:56px;border-radius:16px;margin:0 auto 18px;
          background:linear-gradient(135deg,#1b5e20,#4ade80);
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 8px 20px rgba(34,135,86,0.25);
        }
        .sl-title{font-size:20px;font-weight:800;color:#1e293b;margin:0 0 4px;text-align:center;}
        .sl-sub{font-size:12.5px;color:#94a3b8;text-align:center;margin:0 0 28px;}
        .sl-label{display:block;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;}
        .sl-input{
          width:100%;background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:12px;
          padding:12px 14px;font-size:14px;color:#1e293b;font-family:inherit;
          outline:none;box-sizing:border-box;transition:border-color .2s,box-shadow .2s,background .2s;
        }
        .sl-input:focus{border-color:#228756;background:#fff;box-shadow:0 0 0 3px rgba(34,135,86,.1);}
        .sl-otp{font-size:22px;font-weight:800;letter-spacing:12px;text-align:center;}
        .sl-btn{
          width:100%;background:linear-gradient(135deg,#1b5e20,#228756);color:#fff;
          border:none;border-radius:12px;padding:13px;font-size:14px;font-weight:700;
          cursor:pointer;font-family:inherit;margin-top:8px;transition:opacity .2s,transform .2s;
          box-shadow:0 8px 20px rgba(34,135,86,0.22);
        }
        .sl-btn:hover:not(:disabled){transform:translateY(-1px);}
        .sl-btn:disabled{opacity:.6;cursor:not-allowed;}
        .sl-err{background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:10px 12px;font-size:12px;color:#dc2626;margin-bottom:14px;font-weight:600;}
        .sl-back{background:none;border:none;color:#94a3b8;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;padding:0;margin-bottom:16px;}
        .sl-back:hover{color:#64748b;}
        .sl-resend{background:none;border:none;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;padding:0;}
        .sl-foot{text-align:center;margin-top:22px;}
        .sl-foot a{font-size:12.5px;color:#228756;text-decoration:none;font-weight:700;}
        .sl-foot a:hover{text-decoration:underline;}
        @keyframes spin{to{transform:rotate(360deg);}}
        .sl-spin{width:14px;height:14px;border-radius:50%;border:2px solid rgba(255,255,255,.35);border-top-color:#fff;display:inline-block;animation:spin .7s linear infinite;vertical-align:middle;margin-right:6px;}
        @media(max-width:400px){.sl-card{padding:30px 22px;}}
      `}} />

      <div className="sl-page">
        <div className="sl-blob sl-blob-1" />
        <div className="sl-blob sl-blob-2" />

        <div className="sl-card">
          <div className="sl-icon">
            <i className="feather-heart" style={{ fontSize: 22, color: "#fff" }}></i>
          </div>
          <h1 className="sl-title">Trainee Portal</h1>
          <p className="sl-sub">Choose Your Therapist</p>

          {error && <div className="sl-err">{error}</div>}

          {!otpView ? (
            <form onSubmit={handleSendOtp} noValidate>
              <div style={{ marginBottom: 14 }}>
                <label className="sl-label">Email</label>
                <input className="sl-input" type="email" placeholder="your@email.com"
                  value={email} onChange={e => setEmail(e.target.value)} autoFocus />
              </div>
              <button type="submit" className="sl-btn" disabled={loading}>
                {loading ? <><span className="sl-spin" />Sending…</> : "Send OTP →"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} noValidate>
              <button type="button" className="sl-back"
                onClick={() => { setOtpView(false); setOtp(""); setError(""); }}>
                ← Change email
              </button>
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <label className="sl-label" style={{ margin: 0 }}>OTP — sent to {email}</label>
                  <button type="button" className="sl-resend"
                    disabled={cooldown > 0 || loading}
                    style={{ color: cooldown > 0 ? "#cbd5e1" : "#228756" }}
                    onClick={handleSendOtp}>
                    {cooldown > 0 ? `${cooldown}s` : "Resend"}
                  </button>
                </div>
                <input className="sl-input sl-otp" type="text" inputMode="numeric"
                  placeholder="——————" maxLength={6}
                  value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                  autoFocus />
              </div>
              <button type="submit" className="sl-btn" disabled={loading}>
                {loading ? <><span className="sl-spin" />Verifying…</> : "Verify & Sign In"}
              </button>
            </form>
          )}

          <div className="sl-foot">
            <Link href="/internship-registration">Apply for the program →</Link>
          </div>

        </div>
      </div>
    </>
  );
}
