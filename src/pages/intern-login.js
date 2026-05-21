import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import MyNavbar from "../components/navbar";
import { loginUrl, verifyOtpUrl } from "../utils/url";
import { postData } from "../utils/actions";
import { getDecodedToken, setToken } from "../utils/jwt";
import { isValidMail } from "../utils/validators";

const PERKS = [
  { icon: "feather-check-square",   text: "Track tasks & weekly goals" },
  { icon: "feather-trending-up",    text: "Log hours and view your progress" },
  { icon: "feather-calendar",       text: "Monitor attendance in real time" },
  { icon: "feather-award",          text: "Download certificate & LOR" },
];

export default function InternLogin() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [otp, setOtp]           = useState("");
  const [otpView, setOtpView]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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
    if (!isValidMail(email)) { setError("Please enter a valid email address"); return; }
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
    if (otp.length !== 6) { setError("Please enter the 6-digit OTP"); return; }
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
        <meta name="description" content="Intern portal login for Choose Your Therapist internship program." />
      </Head>

      <style dangerouslySetInnerHTML={{ __html: `
        *{box-sizing:border-box;}
        body{margin:0;font-family:'Segoe UI',Roboto,Arial,sans-serif;}
        .intern-input:focus{border-color:#228756!important;box-shadow:0 0 0 3px rgba(34,135,86,0.09)!important;outline:none;}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}
      `}} />

      <MyNavbar />

      <div style={{ background: "#f8fafc", minHeight: "100vh" }}>

        {/* ── Banner ── */}
        <div style={{
          background: "linear-gradient(150deg,#071a0e 0%,#1b5e20 50%,#228756 100%)",
          padding: isMobile ? "40px 20px 60px" : "52px 24px 72px",
          textAlign: "center", position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -60, left: -60, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "30%", left: "50%", width: 300, height: 300, borderRadius: "50%", background: "rgba(46,204,113,0.05)", pointerEvents: "none", transform: "translate(-50%,-50%)" }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 20, padding: "5px 14px", marginBottom: 20 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block" }}></span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.85)", letterSpacing: "1px", textTransform: "uppercase" }}>Trainee Portal</span>
            </div>

            <h1 style={{ color: "#fff", fontSize: isMobile ? 26 : 36, fontWeight: 900, lineHeight: 1.2, margin: "0 0 12px" }}>
              Welcome Back, <span style={{ color: "#4ade80" }}>Trainee</span>
            </h1>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: isMobile ? 13 : 15, lineHeight: 1.7, margin: "0 auto 32px", maxWidth: 480 }}>
              Log in to your internship portal to manage tasks, track progress, and connect with your mentor.
            </p>

            {/* Perks row */}
            <div style={{ display: "flex", justifyContent: "center", gap: isMobile ? 12 : 28, flexWrap: "wrap" }}>
              {PERKS.map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <i className={p.icon} style={{ fontSize: 14, color: "#4ade80" }}></i>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>{p.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Centered form card ── */}
        <div style={{ display: "flex", justifyContent: "center", padding: isMobile ? "0 16px 48px" : "0 24px 60px", marginTop: -32 }}>
          <div style={{ width: "100%", maxWidth: 440, background: "#fff", borderRadius: 20, boxShadow: "0 8px 40px rgba(0,0,0,0.1)", padding: isMobile ? "28px 22px" : "36px 36px", animation: "fadeUp 0.35s ease" }}>

              {/* Header */}
              <div style={{ marginBottom: 30 }}>
                <h2 style={{ fontSize: 24, fontWeight: 900, color: "#1e293b", margin: "0 0 6px" }}>
                  {otpView ? "Enter OTP" : "Sign In"}
                </h2>
                <p style={{ color: "#64748b", fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                  {otpView
                    ? `We sent a 6-digit code to ${email}`
                    : "Enter your registered email to receive a one-time password"}
                </p>
              </div>

              {/* Messages */}
              {error && (
                <div style={{ background: "#fef2f2", border: "1.5px solid #fca5a5", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#dc2626", fontWeight: 600, display: "flex", gap: 8, alignItems: "center" }}>
                  <i className="feather-alert-circle" style={{ flexShrink: 0 }}></i> {error}
                </div>
              )}
              {success && (
                <div style={{ background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#166534", fontWeight: 600, display: "flex", gap: 8, alignItems: "center" }}>
                  <i className="feather-check-circle" style={{ flexShrink: 0 }}></i> {success}
                </div>
              )}

              {/* Form */}
              <form onSubmit={otpView ? (e) => { e.preventDefault(); handleVerifyOtp(); } : handleSendOtp} noValidate>

                {!otpView ? (
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", display: "block", marginBottom: 7 }}>
                      Email Address
                    </label>
                    <div style={{ position: "relative" }}>
                      <i className="feather-mail" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "#94a3b8", pointerEvents: "none" }}></i>
                      <input
                        className="intern-input"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        autoFocus
                        style={{
                          width: "100%", background: "#fff", border: "1.5px solid #e2e8f0",
                          borderRadius: 10, padding: "13px 16px 13px 42px",
                          fontSize: 14, color: "#1e293b", fontFamily: "inherit",
                          transition: "border-color 0.2s, box-shadow 0.2s",
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", display: "block", marginBottom: 7 }}>
                      6-Digit OTP
                    </label>
                    <input
                      className="intern-input"
                      type="text"
                      inputMode="numeric"
                      placeholder="• • • • • •"
                      maxLength={6}
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                      autoFocus
                      style={{
                        width: "100%", background: "#fff", border: "1.5px solid #e2e8f0",
                        borderRadius: 10, padding: "14px 16px",
                        fontSize: 26, fontWeight: 800, letterSpacing: "10px",
                        textAlign: "center", fontFamily: "inherit",
                        transition: "border-color 0.2s, box-shadow 0.2s",
                      }}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                      <button type="button" onClick={() => { setOtpView(false); setOtp(""); setError(""); setSuccess(""); }}
                        style={{ background: "none", border: "none", color: "#64748b", fontSize: 12, fontWeight: 600, cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 4 }}>
                        <i className="feather-arrow-left" style={{ fontSize: 13 }}></i> Change email
                      </button>
                      <button type="button" disabled={cooldown > 0 || loading}
                        onClick={handleSendOtp}
                        style={{ background: "none", border: "none", color: cooldown > 0 ? "#94a3b8" : "#228756", fontSize: 12, fontWeight: 700, cursor: cooldown > 0 ? "not-allowed" : "pointer", padding: 0 }}>
                        {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
                      </button>
                    </div>
                  </div>
                )}

                <button type="submit" disabled={loading} style={{
                  width: "100%", background: "linear-gradient(135deg,#1b5e20,#228756)",
                  color: "#fff", border: "none", borderRadius: 12, padding: "14px",
                  fontSize: 15, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.75 : 1, display: "flex", alignItems: "center",
                  justifyContent: "center", gap: 10, transition: "opacity 0.2s",
                  fontFamily: "inherit",
                }}>
                  {loading ? (
                    <>
                      <span style={{ width: 18, height: 18, border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }}></span>
                      {otpView ? "Verifying..." : "Sending OTP..."}
                    </>
                  ) : (
                    <>
                      <i className={otpView ? "feather-unlock" : "feather-send"} style={{ fontSize: 15 }}></i>
                      {otpView ? "Verify & Sign In" : "Send OTP"}
                    </>
                  )}
                </button>
              </form>

              {/* Footer links */}
              <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: 10, textAlign: "center" }}>
                <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
                  Not yet applied?{" "}
                  <Link href="/internship-registration" style={{ color: "#228756", fontWeight: 700, textDecoration: "none" }}>
                    Apply for Internship →
                  </Link>
                </p>
                <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
                  Client or Therapist?{" "}
                  <Link href="/login" style={{ color: "#475569", fontWeight: 700, textDecoration: "none" }}>
                    Login here →
                  </Link>
                </p>
                <Link href="/" style={{ fontSize: 12, color: "#94a3b8", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, justifyContent: "center" }}>
                  <i className="feather-home" style={{ fontSize: 12 }}></i> Back to Home
                </Link>
              </div>
          </div>
        </div>
      </div>
    </>
  );
}
