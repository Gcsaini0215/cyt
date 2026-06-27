import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Head from "next/head";
import Footer from "../components/footer";
import NewsLetter from "../components/home/newsletter";
import MyNavbar from "../components/navbar";
import { isValidMail } from "../utils/validators";
import { loginUrl, verifyOtpUrl } from "../utils/url";
import CircularProgress from "@mui/material/CircularProgress";
import { Box } from "@mui/material";
import { getDecodedToken, setToken } from "../utils/jwt";
import { postData } from "../utils/actions";
import FormMessage from "../components/global/form-message";
import FormProgressBar from "../components/global/form-progressbar";
import LoginHeader from "../components/auth/login-header";

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

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || cooldown > 0) return;
    setError("");
    if (email.length < 7 || !isValidMail(email)) {
      setError("Please enter valid email address");
      return;
    }

    const value = { email };

    try {
      setLoading(true);
      const response = await postData(loginUrl, value);
      if (response.status) {
        setSuccess(response.message);
        setError("");
        setOtpView(true);
        setCooldown(60);
      } else {
        setError(response.message);
      }
    } catch (error) {
      if (error.response?.status === 429) {
        setError(error.response?.data?.message || "Too many requests. Please wait before trying again.");
        setCooldown(60);
      } else {
        setError(error.response?.data?.message || error.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtp = async () => {
    if (loading) return;
    setError("");

    if (otp.length !== 6) {
      setError("Please enter valid OTP");
      return;
    }
    const value = { email, otp };
    try {
      setLoading(true);
      const response = await postData(verifyOtpUrl, value);
      if (response.status) {
        setSuccess(response.message);
        setError("");
        setOtp("");
        setToken(response.token);
        if (response.data.role === 1) {
          router.push("/therapist-dashboard");
        } else {
          router.push("/my-dashboard");
        }
      } else {
        setError(response.message);
      }
    } catch (error) {
      setSuccess("");
      setError(error.response?.data?.message || error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const data = getDecodedToken();
    if (data) {
      if (data.role === 1) {
        router.push("/therapist-dashboard");
      } else {
        router.push(`/my-dashboard`);
      }
    }
  }, [router]);

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
                      Enter your email to receive a one-time login code
                    </p>
                  </div>

                  {/* Messages */}
                  <FormMessage error={error} success={success} />

                  {otpView ? (
                    <div>
                      <p style={{ fontSize: '13px', color: '#475569', marginBottom: '12px' }}>
                        A 6-digit OTP has been sent to <strong>{email}</strong>. Enter it below to sign in.
                      </p>
                      <div className="form-group mb-4">
                        <input
                          placeholder="Enter OTP"
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          className="form-control-custom text-center"
                          style={{ fontSize: 24, letterSpacing: 8, fontWeight: 700 }}
                        />
                      </div>

                      <div className="form-submit-group">
                        {loading ? (
                          <FormProgressBar />
                        ) : (
                          <button
                            onClick={handleOtp}
                            className="rbt-btn btn-gradient radius-round w-100"
                            style={{ minHeight: '50px' }}
                          >
                            Verify &amp; Sign In
                          </button>
                        )}
                      </div>

                      <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '12px', textAlign: 'center' }}>
                        Wrong email?{' '}
                        <span
                          onClick={() => { setOtpView(false); setOtp(""); setError(""); setSuccess(""); }}
                          style={{ color: '#22bb33', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          Go back
                        </span>
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="form-group mb-4">
                        <input
                          placeholder="Email Address"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="form-control-custom"
                          onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                        />
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
                        We'll send a secure one-time code to your registered email address.
                      </p>
                    </div>
                  )}

                  {/* Divider + Register link */}
                  <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '20px', paddingTop: '16px', textAlign: 'center' }}>
                    <Link href="/register" style={{ fontSize: '13px', color: '#64748b', textDecoration: 'none', fontWeight: 600 }}>
                      Don't have an account?{' '}
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
