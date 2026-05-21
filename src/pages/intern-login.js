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
  const [email, setEmail]       = useState("");
  const [otp, setOtp]           = useState("");
  const [otpView, setOtpView]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let t;
    if (cooldown > 0) t = setInterval(() => setCooldown(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  useEffect(() => {
    const decoded = getDecodedToken();
    if (decoded) router.push("/trainee-psychologist");
  }, [router]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (loading || cooldown > 0) return;
    setError(""); setSuccess("");
    if (!isValidMail(email)) { setError("Enter a valid email address"); return; }
    setLoading(true);
    try {
      const res = await postData(loginUrl, { email });
      if (res.status) {
        setSuccess(res.message || "OTP sent to your email");
        setOtpView(true);
        setCooldown(60);
      } else {
        setError(res.message || "Could not send OTP");
      }
    } catch (err) {
      if (err.response?.status === 429) {
        setError("Too many requests. Please wait a moment.");
        setCooldown(60);
      } else {
        setError(err.response?.data?.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (loading) return;
    setError(""); setSuccess("");
    if (otp.length !== 6) { setError("Enter the 6-digit OTP"); return; }
    setLoading(true);
    try {
      const res = await postData(verifyOtpUrl, { email, otp });
      if (res.status) {
        setToken(res.token);
        setSuccess("Login successful! Redirecting...");
        setTimeout(() => router.push("/trainee-psychologist"), 800);
      } else {
        setError(res.message || "Invalid OTP");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Intern Login | Choose Your Therapist</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <style dangerouslySetInnerHTML={{ __html: `
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Segoe UI',Roboto,Arial,sans-serif;background:#f8fafc;}
        .ipt{width:100%;border:1.5px solid #e2e8f0;border-radius:10px;padding:13px 16px;font-size:14px;color:#1e293b;font-family:inherit;outline:none;transition:border-color 0.2s,box-shadow 0.2s;background:#fff;}
        .ipt:focus{border-color:#228756;box-shadow:0 0 0 3px rgba(34,135,86,0.09);}
        @keyframes spin{to{transform:rotate(360deg);}}
      `}} />

      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
        <div style={{ width: "100%", maxWidth: 380 }}>

          {/* Logo mark */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg,#1b5e20,#2ecc71)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
              <i className="feather-user-check" style={{ fontSize: 22, color: "#fff" }}></i>
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#1e293b", marginBottom: 4 }}>Intern Portal</h1>
            <p style={{ fontSize: 13, color: "#94a3b8" }}>Choose Your Therapist</p>
          </div>

          {/* Alerts */}
          {error && (
            <div style={{ background: "#fef2f2", border: "1.5px solid #fca5a5", borderRadius: 10, padding: "11px 14px", marginBottom: 16, fontSize: 13, color: "#dc2626", fontWeight: 600, display: "flex", gap: 8, alignItems: "center" }}>
              <i className="feather-alert-circle" style={{ flexShrink: 0, fontSize: 14 }}></i> {error}
            </div>
          )}
          {success && (
            <div style={{ background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 10, padding: "11px 14px", marginBottom: 16, fontSize: 13, color: "#166534", fontWeight: 600, display: "flex", gap: 8, alignItems: "center" }}>
              <i className="feather-check-circle" style={{ flexShrink: 0, fontSize: 14 }}></i> {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={otpView ? (e) => { e.preventDefault(); handleVerifyOtp(); } : handleSendOtp} noValidate>
            {!otpView ? (
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>Email Address</label>
                <div style={{ position: "relative" }}>
                  <i className="feather-mail" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: "#94a3b8", pointerEvents: "none" }}></i>
                  <input className="ipt" type="email" placeholder="your@email.com" value={email}
                    onChange={e => setEmail(e.target.value)} autoFocus style={{ paddingLeft: 40 }} />
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>
                  6-Digit OTP <span style={{ color: "#94a3b8", fontWeight: 500 }}>— sent to {email}</span>
                </label>
                <input className="ipt" type="text" inputMode="numeric" placeholder="• • • • • •"
                  maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                  autoFocus style={{ fontSize: 22, fontWeight: 800, letterSpacing: "10px", textAlign: "center" }} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                  <button type="button" onClick={() => { setOtpView(false); setOtp(""); setError(""); setSuccess(""); }}
                    style={{ background: "none", border: "none", color: "#64748b", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                    <i className="feather-arrow-left" style={{ fontSize: 12 }}></i> Change email
                  </button>
                  <button type="button" disabled={cooldown > 0 || loading} onClick={handleSendOtp}
                    style={{ background: "none", border: "none", color: cooldown > 0 ? "#94a3b8" : "#228756", fontSize: 12, fontWeight: 700, cursor: cooldown > 0 ? "not-allowed" : "pointer" }}>
                    {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
                  </button>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: "100%", background: "linear-gradient(135deg,#1b5e20,#228756)",
              color: "#fff", border: "none", borderRadius: 10, padding: "13px",
              fontSize: 14, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.75 : 1, display: "flex", alignItems: "center",
              justifyContent: "center", gap: 8, fontFamily: "inherit", marginTop: 4,
            }}>
              {loading
                ? <><span style={{ width: 16, height: 16, border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }}></span>{otpView ? "Verifying..." : "Sending..."}</>
                : <><i className={otpView ? "feather-unlock" : "feather-send"} style={{ fontSize: 14 }}></i>{otpView ? "Verify & Sign In" : "Send OTP"}</>
              }
            </button>
          </form>

          {/* Links */}
          <div style={{ marginTop: 24, textAlign: "center", display: "flex", flexDirection: "column", gap: 8 }}>
            <p style={{ fontSize: 12, color: "#94a3b8" }}>
              Not applied yet?{" "}
              <Link href="/internship-registration" style={{ color: "#228756", fontWeight: 700, textDecoration: "none" }}>Apply here →</Link>
            </p>
            <Link href="/" style={{ fontSize: 12, color: "#cbd5e1", textDecoration: "none" }}>← Back to Home</Link>
          </div>

        </div>
      </div>
    </>
  );
}
