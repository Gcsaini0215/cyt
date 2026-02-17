import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import Footer from "../components/footer";
import NewsLetter from "../components/home/newsletter";
import MyNavbar from "../components/navbar";
import ImageTag from "../utils/image-tag";
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
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const stats = [
    { label: "Happy Clients", value: "5k+", color: "#e1f5e3", textColor: "#166534" },
    { label: "Verified Experts", value: "500+", color: "#e0f2fe", textColor: "#0369a1" },
    { label: "Sessions", value: "10k+", color: "#fef3c7", textColor: "#92400e" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (email.length < 7 || !isValidMail(email)) {
      setError("Please enter valid email address");
      return;
    }

    const value = {
      email,
    };

    try {
      setLoading(true);
      const response = await postData(loginUrl, value);
      if (response.status) {
        setSuccess(response.message);
        setError("");
        setOtpView(true);
      } else {
        setError(response.message);
      }
    } catch (error) {
      console.error("Login Error:", error);
      setError(error.response?.data?.message || error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }

  };

  const handleOtp = async () => {
    setError("");

    if (otp.length !== 6) {
      setError("Please enter valid OTP");
      return;
    }
    const value = {
      email,
      otp,
    };
    try {
      setLoading(true);
      const response = await postData(verifyOtpUrl, value);
      if (response.status) {
        setSuccess(response.message);
        setError("");
        setOtp("");
        setToken(response.token);
        if (response.data.role === 1) {
          navigate("/therapist-dashboard");
        } else {
          navigate("/my-dashboard");
        }
      } else {
        setError(response.message);
      }
    } catch (error) {
      setSuccess("");
      setError(error.response?.data?.message || "Something went wrong");
    } finally {

      setLoading(false);
    }

  };

  useEffect(() => {
    const data = getDecodedToken();
    if (data) {
      if (data.role === 1) {
        navigate("/therapist-dashboard");
      } else {
        navigate(`/my-dashboard`);
      }
    }
  }, [navigate]);

  return (
    <>
      <Helmet>
        <title>Login | Access Your Therapy Dashboard | Choose Your Therapist</title>
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
      </Helmet>
      <style>{`
        input:focus {
          outline: none !important;
          box-shadow: none !important;
        }
        .stat-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 15px;
          border-radius: 12px;
          text-align: center;
          flex: 1;
        }
        .form-control-custom {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px 15px;
          width: 100%;
          font-size: 14px;
          transition: all 0.3s ease;
        }
        .form-control-custom:focus {
          border-color: #22bb33;
          box-shadow: 0 0 0 3px rgba(34, 187, 51, 0.1) !important;
        }
      `}</style>

      <MyNavbar />
      <LoginHeader />

      <div
        style={{
          background: "#ffffff",
          padding: isMobile ? "40px 15px" : "80px 0",
        }}
      >
        <div className="container">
          <div className="row align-items-start g-5">
            {/* Left Section */}
            <div className="col-lg-7">
              <div className="mb-5">
                <span style={{ 
                  background: '#e1f5e3', 
                  color: '#166534', 
                  padding: '6px 16px', 
                  borderRadius: '50px', 
                  fontSize: '14px', 
                  fontWeight: '600' 
                }}>
                  Empowering Mental Well-being
                </span>
                <h2 style={{ fontWeight: 800, marginTop: '20px', fontSize: isMobile ? '28px' : '40px' }}>
                  Your Journey to <span style={{ color: '#22bb33' }}>Better Health</span> Starts Here
                </h2>
                <p className="text-muted" style={{ fontSize: '18px' }}>
                  Log in to access personalized support, manage your appointments, and stay connected with your therapist. Track your progress in a secure and confidential environment.
                </p>
              </div>

              {/* Stats Grid */}
              <div className="d-flex gap-3 mb-5">
                {stats.map((stat, idx) => (
                  <div key={idx} className="stat-card" style={{ background: stat.color, border: 'none' }}>
                    <h3 style={{ margin: 0, color: stat.textColor, fontWeight: 800 }}>{stat.value}</h3>
                    <p style={{ margin: 0, fontSize: '12px', color: stat.textColor, fontWeight: 600, opacity: 0.8 }}>{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Section - Form */}
            <div className="col-lg-5">
              <div className="rbt-contact-form p-5 rounded shadow bg-white">
                <div className="mb-4">
                  <h3 className="title mb-1">Login</h3>
                  <p className="text-muted small">Enter your email to receive OTP</p>
                </div>

                <FormMessage error={error} success={success} />

                {otpView ? (
                  <div id="contact-form">
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
                          Verify OTP
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div id="contact-form">
                    <div className="form-group mb-4">
                      <input
                        placeholder="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="form-control-custom"
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
                          className="rbt-btn btn-gradient radius-round w-100"
                          style={{ minHeight: '50px' }}
                        >
                          Send OTP
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div className="text-center mt-4 pt-3" style={{ borderTop: '1px solid #f1f5f9' }}>
                  <Link to="/register" style={{ fontSize: '14px', color: '#64748b', textDecoration: 'none', fontWeight: 600 }}>
                    Don't have an account? <span style={{ color: '#22bb33' }}>Register here</span>
                  </Link>
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
