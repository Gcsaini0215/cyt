import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { isValidMail } from "../utils/validators";
import { registerUrl, verifyOtpUrl } from "../utils/url";
import Footer from "../components/footer";
import NewsLetter from "../components/home/newsletter";
import MyNavbar from "../components/navbar";
import FormProgressBar from "../components/global/form-progressbar";
import FormMessage from "../components/global/form-message";
import { getDecodedToken, setToken } from "../utils/jwt";
import { postData } from "../utils/actions";
import { Box, Container, useMediaQuery } from "@mui/material";
import { TypeAnimation } from "react-type-animation";
import PersonIcon from "@mui/icons-material/Person";
import FavoriteIcon from "@mui/icons-material/Favorite";

const bannerStyles = `
.reg-client-banner {
  position: relative;
  background-image: url('https://i.postimg.cc/5yf8k8ts/bg-image-12dabd.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: scroll;
  padding: 60px 0 50px 0;
  overflow: hidden;
}
.reg-client-banner::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6);
  z-index: 1;
}
.reg-client-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.15);
  color: #fff;
  padding: 8px 20px;
  border-radius: 50px;
  font-weight: 700;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 24px;
  border: 1px solid rgba(255,255,255,0.3);
  backdrop-filter: blur(4px);
}
.reg-client-title {
  font-size: 30px;
  font-weight: 900;
  color: #fff;
  line-height: 1.3;
  margin-bottom: 12px;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
}
.reg-client-animated {
  color: #4ade80;
  display: inline-block;
  min-width: 220px;
  text-align: left;
}
.reg-client-subtitle {
  font-size: 14px;
  color: rgba(255,255,255,0.85);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}
.floating-icon {
  position: absolute;
  color: rgba(255,255,255,0.1);
  z-index: 0;
}
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
}
.float-1 { top: 20%; left: 10%; animation: float 6s ease-in-out infinite; }
.float-2 { bottom: 20%; right: 10%; animation: float 8s ease-in-out infinite; }
@media (max-width: 768px) {
  .reg-client-banner { padding: 28px 0 24px 0; }
  .reg-client-badge { display: none; }
  .reg-client-title { font-size: 22px; line-height: 1.3; margin-bottom: 8px; }
  .reg-client-animated { min-width: 100%; display: block; text-align: center; }
  .reg-client-subtitle { font-size: 13px; padding: 0 16px; }
  .floating-icon { display: none; }
}
`;

export default function Register() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpView, setOtpView] = useState(false);
  const [success, setSuccess] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    if (name.length < 3 || name.length > 30) return setError("Please enter valid name");
    if (phone.length !== 10) return setError("Please enter valid phone number");
    if (email.length < 7 || !isValidMail(email)) return setError("Please enter valid email address");

    const value = { email, name, phone };
    try {
      setLoading(true);
      const response = await postData(registerUrl, value);
      if (response.status) {
        setSuccess(response.message);
        setOtpView(true);
        setError("");
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message || "Something went wrong");
    }
    setLoading(false);
  };

  const handleOtp = async () => {
    setError("");
    if (otp.length !== 6) return setError("Please enter valid OTP");
    const value = { email, otp };
    try {
      setLoading(true);
      const response = await postData(verifyOtpUrl, value);
      if (response.status) {
        setSuccess(response.message);
        setError("");
        setOtp("");
        setToken(response.token);
        router.push("/my-dashboard");
      } else {
        setError(response.message || "Something went wrong");
      }
    } catch (error) {
      setSuccess("");
      setError(error.response?.data?.message || error.message || "Something went wrong");
    }
    setLoading(false);
  };

  useEffect(() => {
    const data = getDecodedToken();
    if (data) {
      if (data.role === 1) router.push("/therapist-dashboard");
      else router.push("/my-dashboard");
    }
  }, [router]);

  return (
    <div>
      <Head>
        <title>Client Registration | Start Your Healing Journey | Choose Your Therapist</title>
        <meta name="description" content="Join Choose Your Therapist today. Register as a client to find verified psychologists, book sessions, and manage your mental health journey." />
        <meta name="keywords" content="Client Registration, Book Therapist India, Start Counseling, Mental Health Support Signup" />
        <link rel="canonical" href="https://chooseyourtherapist.in/register" />
        <meta property="og:title" content="Client Registration | Start Your Healing Journey | Choose Your Therapist" />
        <meta property="og:description" content="Register as a client to find verified psychologists and book sessions." />
        <meta property="og:url" content="https://chooseyourtherapist.in/register" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://chooseyourtherapist.in/assets/img/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Client Registration | Start Your Healing Journey | Choose Your Therapist" />
        <meta name="twitter:description" content="Register today and take the first step towards better mental health." />
        <meta name="twitter:image" content="https://chooseyourtherapist.in/assets/img/og-image.jpg" />
      </Head>

      <style>{`
        ${bannerStyles}
        input:focus { outline: none !important; box-shadow: none !important; }
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
          box-shadow: 0 0 0 3px rgba(34,187,51,0.1) !important;
        }
      `}</style>

      <MyNavbar />

      {/* Banner */}
      <section className="reg-client-banner">
        <PersonIcon className="floating-icon float-1" sx={{ fontSize: 100 }} />
        <FavoriteIcon className="floating-icon float-2" sx={{ fontSize: 120 }} />
        <Container maxWidth="lg">
          <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <div className="reg-client-badge">
              <FavoriteIcon sx={{ fontSize: 18 }} />
              <span>Your Well-being Matters</span>
            </div>
            <h1 className="reg-client-title">
              Begin Your Journey to{" "}
              <span className="reg-client-animated">
                <TypeAnimation
                  sequence={["Better Mental Health", 2000, "Inner Peace", 2000, "Healing & Growth", 2000]}
                  wrapper="span"
                  speed={50}
                  repeat={Infinity}
                />
              </span>
            </h1>
            <p className="reg-client-subtitle">
              Connect with verified psychologists and psychiatrists across India. Book sessions, track your progress, and take control of your mental well-being.
            </p>
          </Box>
        </Container>
      </section>

      {/* Form */}
      <div style={{ background: '#f8fafc', padding: isMobile ? '24px 0' : '60px 0' }}>
        <div className={isMobile ? "" : "container"}>
          <div className="row justify-content-center" style={{ margin: 0 }}>
            <div className="col-lg-5 col-md-8 col-12" style={{ padding: isMobile ? '0 12px' : undefined }}>
              <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                {/* Green top bar */}
                <div style={{ height: '4px', background: 'linear-gradient(90deg, #22bb33, #4ade80)' }} />

                <div style={{ padding: isMobile ? '24px 16px 28px' : '32px 36px 36px' }}>
                  <div style={{ marginBottom: '20px' }}>
                    <h5 style={{ fontWeight: 800, fontSize: '22px', marginBottom: '4px' }}>
                      {otpView ? 'Verify Your Email' : 'Create Your Account'}
                    </h5>
                    <p className="text-muted" style={{ fontSize: '13px', margin: 0 }}>
                      {otpView
                        ? `Enter the 6-digit code sent to ${email}`
                        : 'Register to find and book verified therapists'}
                    </p>
                  </div>

                  <FormMessage error={error} success={success} />

                  {otpView ? (
                    <div>
                      {/* OTP input */}
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px 16px', marginBottom: '16px' }}>
                        <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center', margin: '0 0 12px' }}>Enter Verification Code</p>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="• • • • • •"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          maxLength={6}
                          className="form-control-custom text-center"
                          style={{ fontSize: isMobile ? '24px' : '30px', fontWeight: 800, letterSpacing: isMobile ? '10px' : '16px' }}
                        />
                      </div>

                      <div className="form-submit-group">
                        {loading ? <FormProgressBar /> : (
                          <button onClick={handleOtp} className="rbt-btn btn-gradient radius-round w-100" style={{ minHeight: '50px' }}>
                            Verify &amp; Continue
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
                      <div className="form-group mb-3">
                        <input
                          placeholder="Full Name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="form-control-custom"
                        />
                      </div>
                      <div className="form-group mb-3">
                        <input
                          placeholder="Email Address"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="form-control-custom"
                        />
                      </div>
                      <div className="form-group mb-4">
                        <input
                          placeholder="Phone Number (10 digits)"
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          className="form-control-custom"
                        />
                      </div>

                      <div className="form-submit-group">
                        {loading ? <FormProgressBar /> : (
                          <button onClick={handleSubmit} className="rbt-btn btn-gradient radius-round w-100" style={{ minHeight: '50px' }}>
                            Create Account
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '20px', paddingTop: '16px', textAlign: 'center' }}>
                    <Link href="/login" style={{ fontSize: '13px', color: '#64748b', textDecoration: 'none', fontWeight: 600 }}>
                      Already have an account?{' '}
                      <span style={{ color: '#22bb33' }}>Login here</span>
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
    </div>
  );
}
