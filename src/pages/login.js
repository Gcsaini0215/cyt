import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Head from "next/head";
import Footer from "../components/footer";
import NewsLetter from "../components/home/newsletter";
import MyNavbar from "../components/navbar";
import { isValidMail, sanitizeOtp } from "../utils/validators";
import { apiErrorMessage } from "../utils/api-error";
import { loginUrl, verifyOtpUrl } from "../utils/url";
import CircularProgress from "@mui/material/CircularProgress";
import { Box } from "@mui/material";
import { getDecodedToken, setToken } from "../utils/jwt";
import { postData } from "../utils/actions";
import FormMessage from "../components/global/form-message";
import FormProgressBar from "../components/global/form-progressbar";
import LoginHeader from "../components/auth/login-header";
import OtpInput from "../components/global/otp-input";
import CanvasCaptcha from "../components/global/canvas-captcha";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export default function Login() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpView, setOtpView] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const router = useRouter();
  const captchaRef = useRef(null);
  const submittingRef = useRef(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const data = getDecodedToken();
    if (data) {
      router.push(data.role === 1 ? "/therapist-dashboard" : "/my-dashboard");
    }
  }, [router]);

  // Send / resend the OTP. `isResend` skips the captcha (already solved to get
  // here) and is gated by the cooldown instead; it only changes the success copy.
  const requestOtp = async (isResend = false) => {
    if (loading) return;
    if (isResend && cooldown > 0) return;

    setError("");
    const trimmedEmail = email.trim();

    if (!isValidMail(trimmedEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!isResend && !captchaRef.current?.isValid()) {
      setError("Incorrect security code. Please try again.");
      captchaRef.current?.refresh();
      return;
    }

    try {
      setLoading(true);
      const response = await postData(loginUrl, { email: trimmedEmail });

      if (response.status) {
        setSuccess(
          isResend ? "A new OTP has been sent to your email" : response.message
        );
        setError("");
        setOtp("");
        setOtpView(true);
        setCooldown(RESEND_COOLDOWN);
        captchaRef.current?.refresh();
      } else {
        setError(response.message || "Unable to send OTP. Please try again.");
        captchaRef.current?.refresh();
      }
    } catch (err) {
      if (err.response?.status === 429) setCooldown(RESEND_COOLDOWN);
      setError(apiErrorMessage(err, "Unable to send OTP. Please try again."));
      captchaRef.current?.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    if (e?.preventDefault) e.preventDefault();
    requestOtp(false);
  };

  const handleResend = () => requestOtp(true);

  const handleOtp = async (otpValue) => {
    if (loading || submittingRef.current) return;

    const code = sanitizeOtp(otpValue ?? otp, OTP_LENGTH);
    setError("");

    if (code.length !== OTP_LENGTH) {
      setError("Please enter the 6-digit OTP");
      return;
    }

    try {
      submittingRef.current = true;
      setLoading(true);
      const response = await postData(verifyOtpUrl, {
        email: email.trim(),
        otp: code,
      });

      if (response.status) {
        setSuccess(response.message);
        setError("");
        setOtp("");
        setToken(response.token);
        const role = response.data?.role;
        router.push(role === 1 ? "/therapist-dashboard" : "/my-dashboard");
      } else {
        setSuccess("");
        setError(response.message || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      setSuccess("");
      setError(apiErrorMessage(err, "Couldn't verify the OTP. Please try again."));
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

  const goBackToEmail = () => {
    setOtpView(false);
    setOtp("");
    setError("");
    setSuccess("");
    setCooldown(0);
    captchaRef.current?.refresh();
  };

  return (
    <>
      <Head>
        <title>Login | Access Your Therapy Dashboard | Choose Your Therapist</title>
        <meta name="robots" content="index, follow" />
        <meta name="description" content="Securely log in to your Choose Your Therapist account. Manage your sessions, connect with your psychologist, and track your mental health progress." />
        <meta name="keywords" content="Therapist Login, Client Login, Mental Health Dashboard, Secure Therapy Login" />
        <link rel="canonical" href="https://chooseyourtherapist.in/login" />

        <meta property="og:title" content="Login | Access Your Therapy Dashboard | Choose Your Therapist" />
        <meta property="og:description" content="Securely log in to manage your therapy sessions and mental health journey." />
        <meta property="og:url" content="https://chooseyourtherapist.in/login" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://chooseyourtherapist.in/assets/img/og-image.jpg" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Login | Access Your Therapy Dashboard | Choose Your Therapist" />
        <meta name="twitter:description" content="Log in to your secure dashboard to manage your therapy sessions." />
        <meta name="twitter:image" content="https://chooseyourtherapist.in/assets/img/og-image.jpg" />
      </Head>
      <style>{`
        input:focus {
          outline: none !important;
          box-shadow: none !important;
        }
        .form-control-custom {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px 15px;
          width: 100%;
          font-size: 14px;
          box-sizing: border-box;
          display: block;
          transition: all 0.3s ease;
        }
        .form-control-custom:focus {
          border-color: #22bb33;
          box-shadow: 0 0 0 3px rgba(34, 187, 51, 0.1) !important;
        }
        .login-link-btn {
          background: none;
          border: none;
          padding: 0;
          font: inherit;
          cursor: pointer;
        }
        .login-link-btn:disabled {
          cursor: not-allowed;
          opacity: 0.55;
        }
        /* Security check (canvas captcha) */
        .captcha-row { display: flex; align-items: center; gap: 8px; }
        .captcha-canvas {
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          flex-shrink: 0;
          display: block;
          user-select: none;
        }
        .captcha-refresh {
          width: 42px;
          height: 46px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #16a34a;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }
        .captcha-refresh:hover { background: #f0fdf4; border-color: #bbf7d0; }
        .captcha-refresh:active svg { transform: rotate(160deg); }
        .captcha-refresh svg { transition: transform 0.35s ease; }
        .captcha-refresh:disabled { opacity: 0.55; cursor: not-allowed; }
        .captcha-input {
          flex: 1;
          min-width: 0;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px 14px;
          height: 46px;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #0f172a;
          box-sizing: border-box;
          transition: all 0.3s ease;
        }
        .captcha-input::placeholder {
          font-weight: 400;
          letter-spacing: normal;
          text-transform: none;
          font-size: 13px;
          color: #94a3b8;
        }
        .captcha-input:focus {
          border-color: #22bb33;
          box-shadow: 0 0 0 3px rgba(34, 187, 51, 0.1) !important;
        }
      `}</style>

      <MyNavbar />
      <LoginHeader />

      <div style={{ background: '#f8fafc', padding: isMobile ? '32px 15px' : '60px 0' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-sm-10 col-md-8 col-lg-5">

              {/* Card */}
              <div style={{
                background: '#fff',
                borderRadius: '16px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
              }}>
                {/* Green top bar */}
                <div style={{ height: '4px', background: 'linear-gradient(90deg, #22bb33, #4ade80)' }} />

                <div style={{ padding: isMobile ? '24px 20px 28px' : '32px 36px 36px' }}>
                  {/* Header */}
                  <div style={{ marginBottom: '24px' }}>
                    <h5 style={{ fontWeight: 800, fontSize: '20px', marginBottom: '2px' }}>Welcome Back</h5>
                    <p className="text-muted" style={{ fontSize: '13px', marginBottom: 0 }}>
                      {otpView
                        ? "Enter the code we emailed you to sign in"
                        : "Enter your email to receive a one-time login code"}
                    </p>
                  </div>

                  {/* Messages */}
                  <FormMessage error={error} success={success} />

                  {otpView ? (
                    <div>
                      <p style={{ fontSize: '13px', color: '#475569', marginBottom: '12px' }}>
                        A 6-digit OTP has been sent to <strong>{email.trim()}</strong>. Enter it below to sign in.
                      </p>

                      <div className="form-group mb-4">
                        <OtpInput
                          autoFocus
                          value={otp}
                          onChange={setOtp}
                          onComplete={(value) => handleOtp(value)}
                          disabled={loading}
                        />
                      </div>

                      <div className="form-submit-group">
                        {loading ? (
                          <FormProgressBar />
                        ) : (
                          <button
                            onClick={() => handleOtp()}
                            className="rbt-btn btn-gradient radius-round w-100"
                            style={{ minHeight: '50px' }}
                          >
                            Verify &amp; Sign In
                          </button>
                        )}
                      </div>

                      <div style={{ marginTop: '14px', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>
                        Didn&apos;t get the code?{' '}
                        <button
                          type="button"
                          className="login-link-btn"
                          onClick={handleResend}
                          disabled={loading || cooldown > 0}
                          style={{ color: cooldown > 0 ? '#94a3b8' : '#22bb33', fontWeight: 600, textDecoration: 'underline' }}
                        >
                          {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
                        </button>
                      </div>

                      <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '10px', textAlign: 'center' }}>
                        Wrong email?{' '}
                        <button
                          type="button"
                          className="login-link-btn"
                          onClick={goBackToEmail}
                          style={{ color: '#22bb33', fontWeight: 600, textDecoration: 'underline' }}
                        >
                          Go back
                        </button>
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="form-group mb-3">
                        <input
                          placeholder="Email Address"
                          type="email"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="form-control-custom"
                          onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                        />
                      </div>

                      <div className="form-group mb-4">
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '8px' }}>
                          Security Check
                        </label>
                        <CanvasCaptcha ref={captchaRef} disabled={loading} />
                      </div>

                      <div className="form-submit-group">
                        {loading ? (
                          <Box sx={{ display: "flex", justifyContent: "center" }}>
                            <CircularProgress size={24} />
                          </Box>
                        ) : (
                          <button
                            onClick={handleSubmit}
                            disabled={cooldown > 0}
                            className="rbt-btn btn-gradient radius-round w-100"
                            style={{
                              minHeight: '50px',
                              opacity: cooldown > 0 ? 0.6 : 1,
                              cursor: cooldown > 0 ? 'not-allowed' : 'pointer'
                            }}
                          >
                            {cooldown > 0 ? `Wait ${cooldown}s` : "Send OTP"}
                          </button>
                        )}
                      </div>

                      <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '14px', textAlign: 'center', lineHeight: 1.6 }}>
                        We&apos;ll send a secure one-time code to your registered email address.
                      </p>
                    </div>
                  )}

                  {/* Divider + Register link */}
                  <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '20px', paddingTop: '16px', textAlign: 'center' }}>
                    <Link href="/register" style={{ fontSize: '13px', color: '#64748b', textDecoration: 'none', fontWeight: 600 }}>
                      Don&apos;t have an account?{' '}
                      <span style={{ color: '#22bb33' }}>Register here</span>
                    </Link>
                  </div>

                  <div style={{ textAlign: 'center', marginTop: '8px' }}>
                    <Link href="/therapist-registration" style={{ fontSize: '12px', color: '#94a3b8', textDecoration: 'none' }}>
                      Are you a therapist?{' '}
                      <span style={{ color: '#22bb33', fontWeight: 600 }}>Join as a professional</span>
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <NewsLetter />
      <Footer />
    </>
  );
}
