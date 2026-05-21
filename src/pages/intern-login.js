import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import MyNavbar from "../components/navbar";
import Footer from "../components/footer";
import Newsletter from "../components/home/newsletter";
import { loginUrl, verifyOtpUrl } from "../utils/url";
import { postData } from "../utils/actions";
import { getDecodedToken, setToken } from "../utils/jwt";
import { isValidMail } from "../utils/validators";
import CircularProgress from "@mui/material/CircularProgress";

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
    if (decoded) router.push("/my-dashboard");
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
        setTimeout(() => router.push("/my-dashboard"), 800);
      } else {
        setError(res.message || "Invalid OTP");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", background: "#fff", border: "1.5px solid #e2e8f0",
    borderRadius: 10, padding: "13px 16px", fontSize: 14, color: "#1e293b",
    outline: "none", fontFamily: "inherit", transition: "border-color 0.2s",
  };

  const PERKS = [
    { icon: "feather-clipboard",   text: "Track your internship progress" },
    { icon: "feather-message-circle", text: "Connect with your mentor" },
    { icon: "feather-file-text",   text: "Access your tasks & reports" },
    { icon: "feather-award",       text: "Download your certificate" },
  ];

  return (
    <>
      <Head>
        <title>Intern Login | Choose Your Therapist</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="Intern portal login for Choose Your Therapist internship program." />
      </Head>

      <style>{`
        .intern-input:focus { border-color: #228756 !important; box-shadow: 0 0 0 3px rgba(34,135,86,0.08) !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform: translateY(6px); } to { opacity:1; transform: none; } }
      `}</style>

      <MyNavbar />

      <div style={{ minHeight: "calc(100vh - 60px)", marginTop: 60, display: "flex", flexDirection: isMobile ? "column" : "row" }}>

        {/* ── LEFT PANEL ── */}
        <div style={{
          width: isMobile ? "100%" : "42%",
          background: "linear-gradient(160deg, #1b5e20 0%, #228756 65%, #2ecc71 100%)",
          padding: isMobile ? "40px 24px" : "64px 48px",
          display: "flex", flexDirection: "column", justifyContent: "center",
          position: isMobile ? "static" : "sticky",
          top: 60, height: isMobile ? "auto" : "calc(100vh - 60px)",
          overflow: "hidden",
        }}>
          {/* decorative */}
          <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -40, left: 40, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            {/* Tag */}
            <span style={{ background: "rgba(255,255,255,0.18)", color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", padding: "4px 12px", borderRadius: 20, display: "inline-block", marginBottom: 20 }}>
              Intern Portal
            </span>

            {/* Brand */}
            <h1 style={{ color: "#fff", fontSize: isMobile ? 26 : 34, fontWeight: 900, lineHeight: 1.2, marginBottom: 10 }}>
              Welcome Back,<br />Intern!
            </h1>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, lineHeight: 1.7, marginBottom: 32 }}>
              Log in to access your internship portal, view your tasks, and connect with your mentor.
            </p>

            {/* Perks */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 36 }}>
              {PERKS.map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <i className={p.icon} style={{ fontSize: 15, color: "#fff" }}></i>
                  </div>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>{p.text}</span>
                </div>
              ))}
            </div>

            {/* CTA to register */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: 24 }}>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 12 }}>
                New to our program?
              </p>
              <Link href="/internship-registration" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(255,255,255,0.15)", color: "#fff",
                border: "1.5px solid rgba(255,255,255,0.25)",
                textDecoration: "none", borderRadius: 10, padding: "10px 20px",
                fontSize: 13, fontWeight: 700, transition: "background 0.2s",
              }}>
                <i className="feather-user-plus"></i> Apply for Internship
              </Link>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
          padding: isMobile ? "40px 24px" : "48px",
          background: "#f8fafc",
        }}>
          <div style={{ width: "100%", maxWidth: 420 }}>

            {/* Header */}
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: "#1e293b", marginBottom: 6 }}>
                {otpView ? "Enter Your OTP" : "Sign In"}
              </h2>
              <p style={{ color: "#64748b", fontSize: 13 }}>
                {otpView
                  ? `We've sent a 6-digit OTP to ${email}`
                  : "Enter your registered email to receive an OTP"}
              </p>
            </div>

            {/* Messages */}
            {error && (
              <div style={{ background: "#fef2f2", border: "1.5px solid #fca5a5", borderRadius: 10, padding: "12px 16px", marginBottom: 18, fontSize: 13, color: "#dc2626", fontWeight: 600, display: "flex", gap: 8, alignItems: "center", animation: "fadeIn 0.2s ease" }}>
                <i className="feather-alert-circle"></i> {error}
              </div>
            )}
            {success && (
              <div style={{ background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 10, padding: "12px 16px", marginBottom: 18, fontSize: 13, color: "#166534", fontWeight: 600, display: "flex", gap: 8, alignItems: "center", animation: "fadeIn 0.2s ease" }}>
                <i className="feather-check-circle"></i> {success}
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
                    <input className="intern-input" type="email" placeholder="your@email.com"
                      value={email} onChange={e => setEmail(e.target.value)}
                      style={{ ...inputStyle, paddingLeft: 42 }} autoFocus />
                  </div>
                </div>
              ) : (
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", display: "block", marginBottom: 7 }}>
                    6-Digit OTP
                  </label>
                  <input className="intern-input" type="text" inputMode="numeric" placeholder="Enter OTP"
                    maxLength={6} value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                    style={{ ...inputStyle, fontSize: 22, fontWeight: 800, letterSpacing: "6px", textAlign: "center" }}
                    autoFocus />
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

              <button type="submit" disabled={loading}
                style={{
                  width: "100%", background: "linear-gradient(135deg, #1b5e20, #228756)",
                  color: "#fff", border: "none", borderRadius: 12, padding: "14px",
                  fontSize: 15, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.75 : 1, display: "flex", alignItems: "center",
                  justifyContent: "center", gap: 10, transition: "opacity 0.2s",
                }}>
                {loading ? (
                  <>
                    <span style={{ width: 18, height: 18, border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }}></span>
                    {otpView ? "Verifying..." : "Sending OTP..."}
                  </>
                ) : (
                  <>
                    <i className={otpView ? "feather-unlock" : "feather-send"}></i>
                    {otpView ? "Verify & Login" : "Send OTP"}
                  </>
                )}
              </button>
            </form>

            {/* Footer links */}
            <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid #f1f5f9", textAlign: "center" }}>
              <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 10 }}>
                Not yet applied?{" "}
                <Link href="/internship-registration" style={{ color: "#228756", fontWeight: 700, textDecoration: "none" }}>
                  Apply for Internship →
                </Link>
              </p>
              <p style={{ fontSize: 12, color: "#94a3b8" }}>
                Client or Therapist?{" "}
                <Link href="/login" style={{ color: "#475569", fontWeight: 700, textDecoration: "none" }}>
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Newsletter />
      <Footer />
    </>
  );
}
