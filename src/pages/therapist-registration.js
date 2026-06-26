
import React from "react";
import Head from "next/head";
import MyNavbar from "../components/navbar";
import RegistrationHeader from "../components/therapist/registration-header";
import NewsLetter from "../components/home/newsletter";
import Footer from "../components/footer";
import { Dialog, DialogContent, DialogActions } from "@mui/material";
import { useState, useEffect } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { therapistRegistrationUrl, verifyOtpUrl, checkTherapistEmailUrl } from "../utils/url";
import Link from "next/link";
import { postData, postFormData } from "../utils/actions";
import FormMessage from "../components/global/form-message";
import FormProgressBar from "../components/global/form-progressbar";
import { FaLaptop, FaMapMarkerAlt, FaGlobe, FaTags } from "react-icons/fa";

export default function TherapistRegistration() 
{
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    profileType: "",
    mode: "",
    checkedValues: [],
    selectedFile: null,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otp, setOtp] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleFileChange = (event) =>
    setFormData((prev) => ({ ...prev, selectedFile: event.target.files[0] }));

  const validateEmail = (email) =>
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.toLowerCase());

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      checkedValues: checked
        ? [...prev.checkedValues, value]
        : prev.checkedValues.filter((v) => v !== value),
    }));
  };

  const nextStep = async () => {
    setError("");
    if (step === 0) {
      if (!validateEmail(formData.email)) return setError("Please enter a valid email address");
      try {
        setLoading(true);
        await postData(checkTherapistEmailUrl, { email: formData.email });
        setLoading(false);
      } catch (err) {
        setLoading(false);
        const msg = err.response?.data?.message || "";
        if (err.response?.status === 400 && msg) {
          return setError(msg);
        }
        // network/server error — allow to proceed
      }
    } else if (step === 1) {
      if (!formData.profileType) return setError("Please select profile type");
      if (!formData.mode) return setError("Please select service mode");
    } else if (step === 2) {
      if (formData.name.length < 5) return setError("Please enter full name");
      if (formData.phone.length !== 10) return setError("Please enter valid phone number");
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    setError("");
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    const { name, phone, email, profileType, mode, checkedValues, selectedFile } = formData;

    setError("");
    setSuccess("");

    if (!checkedValues.length)
      return setError("Please check any 'Interested to serve'");
    if (!selectedFile) return setError("Please upload your resume");

    setLoading(true);
    const data = new FormData();
    data.append("file", selectedFile);
    data.append("name", name);
    data.append("phone", phone);
    data.append("email", email);
    data.append("type", profileType);
    data.append("mode", mode);
    data.append("serve", checkedValues.join(", "));

    try {
      const response = await postFormData(therapistRegistrationUrl, data);
      if (response.status) {
        setRegisteredEmail(email);
        setOpen(true);
        setError("");
      } else {
        setError("Something went wrong");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
    setLoading(false);
  };

  const handleOtpChange = (value) => setOtp(value.replace(/\D/g, "").slice(0, 6));
  const onClose = () => setOpen(false);

  const verifyOtp = async () => {
    setOtpError("");
    if (otp.length !== 6) return setOtpError("Please enter valid OTP");

    try {
      setLoading(true);
      const response = await postData(verifyOtpUrl, { email: registeredEmail, otp });
      if (response.status) {
        setOtp("");
        setOpen(false);
        setFormData({
          name: "",
          phone: "",
          email: "",
          profileType: "",
          mode: "",
          checkedValues: [],
          selectedFile: null,
        });
        setStep(1);
        setSuccess(
          response.message || "Thank you for submitting your resume. Our admin will review your profile soon. You will receive approval via email."
        );
      } else {
        setOtpError(response.message || "Invalid OTP");
      }
    } catch (err) {
      setOtpError(err.response?.data?.message || "OTP verification failed. Please try again.");
    }
    setLoading(false);
  };

  const profileOptions = [
    "Counselling Psychologist",
    "Psychiatrist",
    "Clinical Psychologist",
    "Special Educator"
  ];

  const modeOptions = [
    { label: "Virtual", value: 1, icon: <FaLaptop /> },
    { label: "In-Person", value: 2, icon: <FaMapMarkerAlt /> },
    { label: "Both", value: 3, icon: <FaGlobe /> }
  ];

  return (
    <>
      <Head>
        <title>Therapist Registration | Join Our Network of Mental Health Experts | Choose Your Therapist</title>
        <meta name="robots" content="index, follow" />
        <meta name="description" content="Are you a qualified psychologist or psychiatrist? Register with Choose Your Therapist to connect with clients across India and grow your professional practice on our secure platform." />
        <meta name="keywords" content="Therapist Registration, Join Mental Health Network, Psychologist Jobs India, Online Therapy Practice" />
        <link rel="canonical" href="https://chooseyourtherapist.in/therapist-registration" />
        
        <meta property="og:title" content="Therapist Registration | Join Our Network of Mental Health Experts" />
        <meta property="og:description" content="Register with Choose Your Therapist to connect with clients across India and grow your professional practice." />
        <meta property="og:url" content="https://chooseyourtherapist.in/therapist-registration" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://chooseyourtherapist.in/assets/img/og-image.jpg" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Therapist Registration | Join Our Network of Mental Health Experts" />
        <meta name="twitter:description" content="Register as a verified therapist and grow your practice with Choose Your Therapist." />
        <meta name="twitter:image" content="https://chooseyourtherapist.in/assets/img/og-image.jpg" />
      </Head>

      <style>{`
        input:focus, select:focus, textarea:focus, button:focus {
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
        .selection-card {
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 15px 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
          background: #fff;
          height: 100%;
          min-height: 70px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .selection-card:hover {
          border-color: #22bb33;
          background: rgba(34, 187, 51, 0.02);
        }
        .selection-card.selected {
          border-color: #22bb33;
          background: rgba(34, 187, 51, 0.05);
          box-shadow: 0 4px 12px rgba(34, 187, 51, 0.1);
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
      <RegistrationHeader />

      <div
        style={{
          background: "#f8fafc",
          minHeight: "100vh",
          padding: isMobile ? "40px 15px" : "80px 0",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-5 col-md-8 col-12">
              <div className="rbt-contact-form p-4 p-md-5 rounded shadow bg-white">
                <div className="mb-4">
                  <h4 className="title mb-3" style={{ fontWeight: 800 }}>Therapist Registration</h4>

                  {/* Step Indicators — only show for steps 1-3 */}
                  {step > 0 && (
                    <div className="d-flex align-items-center gap-2 mb-4">
                      {[
                        { num: 1, label: "Profile" },
                        { num: 2, label: "Details" },
                        { num: 3, label: "Expertise" },
                      ].map((s, i) => (
                        <React.Fragment key={s.num}>
                          <div className="d-flex flex-column align-items-center" style={{ minWidth: '60px' }}>
                            <div style={{
                              width: '36px', height: '36px', borderRadius: '50%',
                              background: step >= s.num ? '#22bb33' : '#e2e8f0',
                              color: step >= s.num ? '#fff' : '#94a3b8',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 700, fontSize: '14px',
                              transition: 'all 0.3s ease',
                            }}>
                              {step > s.num ? '✓' : s.num}
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: 600, color: step >= s.num ? '#22bb33' : '#94a3b8', marginTop: '4px' }}>
                              {s.label}
                            </span>
                          </div>
                          {i < 2 && (
                            <div style={{
                              flex: 1, height: '2px', marginBottom: '16px',
                              background: step > s.num ? '#22bb33' : '#e2e8f0',
                              transition: 'background 0.3s ease',
                            }} />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>

                <p style={{ color: "#d50000", fontSize: '14px' }}>{error}</p>

                {step === 0 && (
                  <div className="step-0">
                    <p style={{ fontSize: '15px', color: '#475569', lineHeight: '1.7', marginBottom: '28px' }}>
                      You're on your way to becoming a part of a trusted community of psychologists, psychiatrists, and mental health professionals who share your passion for well-being.
                      <br /><br />
                      To begin, let us know the <strong>email you want attached to your therapist profile</strong> — we'll use this to set up your account and send you updates.
                    </p>
                    <div className="form-group mb-3">
                      <input
                        type="email"
                        placeholder="Enter your email address"
                        value={formData.email}
                        onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                        className="form-control-custom"
                        style={{ fontSize: '15px' }}
                      />
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="step-1">
                    <h6 className="mb-3">Select Profile Type</h6>
                    <div className="row g-2 mb-4">
                      {profileOptions.map((opt) => (
                        <div key={opt} className="col-md-6 col-12">
                          <div 
                            className={`selection-card ${formData.profileType === opt ? 'selected' : ''}`}
                            onClick={() => setFormData(p => ({ ...p, profileType: opt }))}
                          >
                            <span style={{ fontSize: '13px', fontWeight: 600, lineHeight: '1.2' }}>{opt}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <h6 className="mb-3">Select Service Mode</h6>
                    <div className="row g-2 mb-4">
                      {modeOptions.map((opt) => (
                        <div key={opt.value} className="col-md-4 col-4">
                          <div 
                            className={`selection-card ${formData.mode == opt.value ? 'selected' : ''}`}
                            onClick={() => setFormData(p => ({ ...p, mode: opt.value }))}
                          >
                            <div style={{ color: formData.mode == opt.value ? '#22bb33' : '#64748b', fontSize: '20px' }}>{opt.icon}</div>
                            <span style={{ fontSize: '12px', fontWeight: 600 }}>{opt.label}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="step-2">
                    <h6 className="mb-3">Personal Information</h6>
                    <div className="form-group mb-3">
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                        className="form-control-custom"
                      />
                    </div>

                    <div className="form-group mb-4">
                      <input
                        type="text"
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                        className="form-control-custom"
                      />
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="step-3">
                    <h6 className="mb-3">Expertise & Resume</h6>
                    <div className="form-group mb-3">
                      <span className="small mb-2 d-block">Interested to serve:</span>
                      <div style={{ maxHeight: '180px', overflowY: 'auto', padding: '10px', border: '1px solid #eee', borderRadius: '8px' }}>
                        {[
                          "Prescribe Medication(Only for Psychiatrist)",
                          "Individual counselling",
                          "Couple counselling",
                          "Teen counselling",
                          "Workshops/Events conducting",
                          "Internship/Training",
                        ].map((val, i) => (
                          <p key={i} className="rbt-checkbox-wrapper mb-2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                              type="checkbox"
                              value={val}
                              onChange={handleCheckboxChange}
                              checked={formData.checkedValues.includes(val)}
                              id={`check-${i}`}
                            />
                            <label htmlFor={`check-${i}`} style={{ fontSize: '13px', margin: 0 }}>{val}</label>
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="form-group mb-4">
                      <span className="small mb-1 d-block">Resume (PDF)</span>
                      <input
                        type="file"
                        accept=".pdf"
                        className="form-control-custom"
                        style={{ padding: '8px' }}
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>
                )}

                <div className="form-submit-group mt-4">
                  <p style={{ color: "#22bb33" }}>{success}</p>
                  
                  <div className="d-flex gap-2">
                    {step > 0 && step <= 3 && (
                      <button
                        onClick={prevStep}
                        className="rbt-btn btn-border radius-round w-100"
                        style={{ background: 'transparent', border: '1px solid #ccc', color: '#666', minHeight: '50px' }}
                      >
                        Back
                      </button>
                    )}

                    {step < 3 ? (
                      <button
                        onClick={nextStep}
                        disabled={loading}
                        className="rbt-btn btn-gradient radius-round w-100"
                        style={{ minHeight: '50px', opacity: loading ? 0.7 : 1 }}
                      >
                        {loading && step === 0 ? <CircularProgress size={18} style={{ color: '#fff' }} /> : (step === 0 ? 'Continue' : 'Next →')}
                      </button>
                    ) : (
                      <>
                        {loading ? (
                          <Box sx={{ display: "flex", justifyContent: "center", width: '100%' }}>
                            <CircularProgress size={24} />
                          </Box>
                        ) : (
                          <button
                            onClick={handleSubmit}
                            className="rbt-btn btn-gradient radius-round w-100"
                            style={{ minHeight: '50px' }}
                          >
                            Complete Registration
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="text-center mt-4 pt-3" style={{ borderTop: '1px solid #f1f5f9' }}>
                  <Link href="/login" style={{ fontSize: '14px', color: '#64748b', textDecoration: 'none', fontWeight: 600 }}>
                    Already have an account? <span style={{ color: '#22bb33' }}>Login here</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog 
        open={open} 
        onClose={onClose} 
        fullWidth 
        maxWidth="sm"
        PaperProps={{
          style: {
            borderRadius: '16px',
            margin: isMobile ? '20px' : '32px',
            marginTop: isMobile ? '100px' : '0px', // Clear navbar on mobile
          }
        }}
      >
        <DialogContent className="p-4 p-md-5 text-center">
          <h3 style={{ fontWeight: 800, color: "#22bb33", fontSize: isMobile ? '24px' : '30px' }}>Verify Your Email</h3>
          <p className="mb-4 small">We've sent a 6-digit OTP to your email address. Please enter it below to complete your registration.</p>
          
          <div className="form-group mb-4">
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => handleOtpChange(e.target.value)}
              className="form-control text-center"
              style={{ fontSize: isMobile ? 20 : 24, letterSpacing: isMobile ? 4 : 8, fontWeight: 700, height: '60px' }}
            />
            <p className="text-danger mt-2 small">{otpError}</p>
          </div>

          <button
            disabled={loading}
            onClick={verifyOtp}
            className="rbt-btn btn-gradient radius-round w-100"
            style={{ minHeight: '50px' }}
          >
            {loading ? <CircularProgress size={20} /> : "Verify & Submit"}
          </button>
        </DialogContent>
      </Dialog>

      <Dialog 
        open={planOpen} 
        onClose={() => setPlanOpen(false)} 
        fullWidth 
        maxWidth="sm"
        PaperProps={{
          style: {
            borderRadius: '16px',
            margin: isMobile ? '20px' : '32px',
            marginTop: isMobile ? '100px' : '0px', // Clear navbar on mobile
          }
        }}
      >
        <DialogContent className="p-4 p-md-5 text-center" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            background: 'rgba(34, 187, 51, 0.1)', 
            color: '#22bb33', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '24px',
            margin: '0 auto 15px'
          }}>
            <FaTags />
          </div>
          <h3 style={{ fontWeight: 800, marginBottom: '10px', fontSize: isMobile ? '22px' : '28px' }}>Subscription Plans</h3>
          <p className="text-muted mb-4 small">
            We offer flexible monthly and yearly subscription plans designed to help you grow your practice with all our premium features.
          </p>
          
          <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', textAlign: 'left', marginBottom: '20px' }}>
            <h6 style={{ fontWeight: 700, fontSize: '13px', marginBottom: '8px', color: '#166534' }}>Plan Details:</h6>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#22bb33', marginBottom: '8px' }}>Start Basic Plan for 3 Months</p>
            <ul style={{ paddingLeft: '15px', fontSize: '12px', color: '#475569', marginBottom: 0 }}>
              <li>Full Access to Therapist Dashboard</li>
              <li>Unlimited Client Booking Management</li>
              <li>Professional Invoicing & Reports</li>
              <li>SEO Profile Management</li>
            </ul>
          </div>

          <p style={{ fontWeight: 600, color: '#64748b', fontSize: '13px', lineHeight: '1.6' }}>
            For more information and detailed pricing:
            <br />
            <a href="mailto:chooseyourtherapist@gmail.com" style={{ color: '#22bb33', fontSize: '14px', textDecoration: 'none', wordBreak: 'break-all' }}>
              chooseyourtherapist@gmail.com
            </a>
          </p>

          <button
            onClick={() => setPlanOpen(false)}
            className="rbt-btn btn-border radius-round w-100 mt-4"
            style={{ minHeight: '45px' }}
          >
            Close
          </button>
        </DialogContent>
      </Dialog>

      <NewsLetter />
      <Footer />
    </>
  );
}
