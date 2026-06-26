
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
import { therapistRegistrationUrl, verifyOtpUrl, checkTherapistEmailUrl, resendTherapistOtpUrl } from "../utils/url";
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
    } else if (step === 3) {
      if (!formData.checkedValues.length) return setError("Please select at least one area of expertise");
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
        setError("");
        setStep(5);
      } else {
        setError("Something went wrong");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
    setLoading(false);
  };

  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  const resendOtp = async () => {
    setResendMsg("");
    setOtpError("");
    setResendLoading(true);
    try {
      await postData(resendTherapistOtpUrl, { email: registeredEmail });
      setResendMsg("OTP resent successfully. Please check your email.");
    } catch (err) {
      setOtpError(err.response?.data?.message || "Failed to resend OTP. Please try again.");
    }
    setResendLoading(false);
  };

  const handleOtpChange = (value) => setOtp(value.replace(/\D/g, "").trim().slice(0, 6));
  const onClose = () => setOpen(false);

  const verifyOtp = async () => {
    setOtpError("");
    if (otp.length !== 6) return setOtpError("Please enter valid OTP");

    try {
      setLoading(true);
      const response = await postData(verifyOtpUrl, { email: registeredEmail, otp: otp.trim() });
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
        setStep(0);
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
          box-sizing: border-box;
          display: block;
        }
        .form-control-custom:focus {
          border-color: #22bb33;
          box-shadow: 0 0 0 3px rgba(34, 187, 51, 0.1) !important;
        }
      `}</style>

      <MyNavbar />
      <RegistrationHeader />

      <div style={{ background: "#f8fafc", padding: isMobile ? "30px 15px" : "60px 0" }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6 col-md-8 col-12">
              <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', overflow: 'hidden' }}>

                {/* Header */}
                <div style={{ padding: '28px 28px 0' }}>
                  <h5 style={{ fontWeight: 800, fontSize: '20px', marginBottom: '4px' }}>Therapist Registration</h5>
                  <p className="text-muted" style={{ fontSize: '13px', marginBottom: '20px' }}>
                    {step === 0 && "Let's get you started"}
                    {step === 1 && "Step 1 of 4 — Profile & Mode"}
                    {step === 2 && "Step 2 of 4 — Personal Details"}
                    {step === 3 && "Step 3 of 4 — Areas of Expertise"}
                    {step === 4 && "Step 4 of 4 — Resume Upload"}
                    {step === 5 && "Almost done — Verify your email"}
                  </p>

                  {/* Step Indicators — only for steps 1–4 */}
                  {step > 0 && step < 5 && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '24px' }}>
                      {[
                        { num: 1, label: "Profile" },
                        { num: 2, label: "Details" },
                        { num: 3, label: "Expertise" },
                        { num: 4, label: "Resume" },
                      ].map((s, i) => (
                        <React.Fragment key={s.num}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', flex: '0 0 auto' }}>
                            <div style={{
                              width: '30px', height: '30px', borderRadius: '50%',
                              background: step >= s.num ? '#22bb33' : '#e2e8f0',
                              color: step >= s.num ? '#fff' : '#94a3b8',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 700, fontSize: '12px',
                              transition: 'all 0.3s ease',
                            }}>
                              {step > s.num ? '✓' : s.num}
                            </div>
                            <span style={{ fontSize: '10px', fontWeight: 600, color: step >= s.num ? '#22bb33' : '#94a3b8', whiteSpace: 'nowrap' }}>
                              {s.label}
                            </span>
                          </div>
                          {i < 3 && (
                            <div style={{
                              flex: 1, height: '2px', margin: '14px 4px 0',
                              background: step > s.num ? '#22bb33' : '#e2e8f0',
                              transition: 'background 0.3s ease',
                            }} />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>

                {/* Form Body */}
                <div style={{ padding: '8px 28px 28px' }}>
                  <p style={{ color: "#d50000", fontSize: '13px', minHeight: '20px', marginBottom: '8px' }}>{error}</p>

                  {/* Step 0 — Email */}
                  {step === 0 && (
                    <div>
                      <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.8', marginBottom: '24px' }}>
                        You're on your way to becoming part of a trusted community of psychologists, psychiatrists, and mental health professionals.
                        <br /><br />
                        To begin, enter the <strong>email you want attached to your therapist profile</strong>.
                      </p>
                      <input
                        type="email"
                        placeholder="Enter your email address"
                        value={formData.email}
                        onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                        className="form-control-custom"
                        style={{ fontSize: '15px', marginBottom: '8px' }}
                      />
                    </div>
                  )}

                  {/* Step 1 — Profile Type + Mode */}
                  {step === 1 && (
                    <div>
                      <p style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Profile Type</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
                        {profileOptions.map((opt) => (
                          <div
                            key={opt}
                            onClick={() => setFormData(p => ({ ...p, profileType: opt }))}
                            style={{
                              border: `2px solid ${formData.profileType === opt ? '#22bb33' : '#e2e8f0'}`,
                              borderRadius: '10px',
                              padding: '14px 10px',
                              cursor: 'pointer',
                              textAlign: 'center',
                              background: formData.profileType === opt ? 'rgba(34,187,51,0.05)' : '#fff',
                              boxShadow: formData.profileType === opt ? '0 2px 10px rgba(34,187,51,0.12)' : 'none',
                              transition: 'all 0.2s ease',
                            }}
                          >
                            <span style={{ fontSize: '13px', fontWeight: 600, color: formData.profileType === opt ? '#166534' : '#374151', lineHeight: '1.3' }}>{opt}</span>
                          </div>
                        ))}
                      </div>

                      <p style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Service Mode</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                        {modeOptions.map((opt) => (
                          <div
                            key={opt.value}
                            onClick={() => setFormData(p => ({ ...p, mode: opt.value }))}
                            style={{
                              border: `2px solid ${formData.mode == opt.value ? '#22bb33' : '#e2e8f0'}`,
                              borderRadius: '10px',
                              padding: '14px 8px',
                              cursor: 'pointer',
                              textAlign: 'center',
                              background: formData.mode == opt.value ? 'rgba(34,187,51,0.05)' : '#fff',
                              boxShadow: formData.mode == opt.value ? '0 2px 10px rgba(34,187,51,0.12)' : 'none',
                              transition: 'all 0.2s ease',
                              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                            }}
                          >
                            <span style={{ fontSize: '20px', color: formData.mode == opt.value ? '#22bb33' : '#94a3b8' }}>{opt.icon}</span>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: formData.mode == opt.value ? '#166534' : '#374151' }}>{opt.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 2 — Personal Details */}
                  {step === 2 && (
                    <div>
                      <p style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Personal Details</p>
                      <div className="form-group mb-3">
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={formData.name}
                          onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                          className="form-control-custom"
                        />
                      </div>
                      <div className="form-group">
                        <input
                          type="text"
                          placeholder="Phone Number (10 digits)"
                          value={formData.phone}
                          onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                          className="form-control-custom"
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 3 — Expertise */}
                  {step === 3 && (
                    <div>
                      <p style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Areas of Expertise</p>
                      <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>Select all the services you are interested to offer:</p>
                      <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                        {[
                          "Prescribe Medication (Only for Psychiatrist)",
                          "Individual Counselling",
                          "Couple Counselling",
                          "Teen Counselling",
                          "Workshops / Events",
                          "Internship / Training",
                        ].map((val, i) => (
                          <label key={i} htmlFor={`check-${i}`} style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            padding: '12px 14px',
                            borderBottom: i < 5 ? '1px solid #f1f5f9' : 'none',
                            cursor: 'pointer',
                            background: formData.checkedValues.includes(val) ? 'rgba(34,187,51,0.04)' : '#fff',
                            transition: 'background 0.2s',
                          }}>
                            <input
                              type="checkbox"
                              value={val}
                              onChange={handleCheckboxChange}
                              checked={formData.checkedValues.includes(val)}
                              id={`check-${i}`}
                              style={{ width: '16px', height: '16px', accentColor: '#22bb33', flexShrink: 0 }}
                            />
                            <span style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>{val}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 4 — Resume (Final) */}
                  {step === 4 && (
                    <div>
                      {/* Final step banner */}
                      <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px 18px', marginBottom: '24px' }}>
                        <p style={{ fontWeight: 800, fontSize: '15px', color: '#166534', margin: '0 0 2px' }}>You're almost there!</p>
                        <p style={{ fontSize: '12px', color: '#15803d', margin: 0, lineHeight: 1.5 }}>This is the final step. Upload your resume to complete your registration.</p>
                      </div>

                      {/* Upload area */}
                      <p style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Upload Resume</p>
                      <label htmlFor="resume-upload" style={{ display: 'block', cursor: 'pointer' }}>
                        <div style={{
                          border: `2px dashed ${formData.selectedFile ? '#22bb33' : '#cbd5e1'}`,
                          borderRadius: '12px',
                          padding: '28px 20px',
                          textAlign: 'center',
                          background: formData.selectedFile ? 'rgba(34,187,51,0.04)' : '#fafafa',
                          transition: 'all 0.2s ease',
                        }}>
                          {formData.selectedFile ? (
                            <>
                              <p style={{ fontWeight: 700, fontSize: '14px', color: '#166534', margin: '0 0 4px' }}>File Selected</p>
                              <p style={{ fontSize: '12px', color: '#22bb33', margin: 0, wordBreak: 'break-all' }}>{formData.selectedFile.name}</p>
                              <p style={{ fontSize: '11px', color: '#64748b', margin: '8px 0 0' }}>Click to change file</p>
                            </>
                          ) : (
                            <>
                              <p style={{ fontWeight: 600, fontSize: '14px', color: '#374151', margin: '0 0 4px' }}>Click to upload your resume</p>
                              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>PDF only · Max 500KB</p>
                            </>
                          )}
                        </div>
                      </label>
                      <input
                        id="resume-upload"
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                      />
                      <p style={{ color: '#22bb33', fontSize: '13px', marginTop: '10px', minHeight: '20px' }}>{success}</p>
                    </div>
                  )}

                  {/* Step 5 — OTP Verification */}
                  {step === 5 && (
                    <div>
                      <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px 18px', marginBottom: '24px' }}>
                        <p style={{ fontWeight: 800, fontSize: '15px', color: '#166534', margin: '0 0 2px' }}>Check your email</p>
                        <p style={{ fontSize: '12px', color: '#15803d', margin: 0, lineHeight: 1.5 }}>
                          We've sent a 6-digit OTP to <strong>{registeredEmail}</strong>. Enter it below to complete your registration.
                        </p>
                      </div>

                      <p style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Enter OTP</p>
                      <input
                        type="text"
                        placeholder="_ _ _ _ _ _"
                        value={otp}
                        onChange={(e) => handleOtpChange(e.target.value)}
                        maxLength={6}
                        style={{
                          width: '100%', padding: '16px', border: '2px solid #e2e8f0', borderRadius: '10px',
                          fontSize: '28px', fontWeight: 700, letterSpacing: '14px', textAlign: 'center',
                          boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s',
                          color: '#111827',
                        }}
                        onFocus={e => e.target.style.borderColor = '#22bb33'}
                        onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                      />
                      {otpError && <p style={{ color: '#d50000', fontSize: '13px', marginTop: '8px' }}>{otpError}</p>}
                      {resendMsg && <p style={{ color: '#22bb33', fontSize: '13px', marginTop: '8px' }}>{resendMsg}</p>}
                      {success && <p style={{ color: '#22bb33', fontSize: '13px', marginTop: '8px' }}>{success}</p>}

                      <button
                        onClick={verifyOtp}
                        disabled={loading}
                        className="rbt-btn btn-gradient radius-round"
                        style={{ width: '100%', minHeight: '48px', marginTop: '20px', opacity: loading ? 0.7 : 1 }}
                      >
                        {loading ? <CircularProgress size={18} style={{ color: '#fff' }} /> : 'Verify & Complete Registration'}
                      </button>

                      <div style={{ textAlign: 'center', marginTop: '16px' }}>
                        <span style={{ fontSize: '13px', color: '#64748b' }}>Didn't receive the OTP? </span>
                        <button
                          onClick={resendOtp}
                          disabled={resendLoading}
                          style={{ background: 'none', border: 'none', color: '#22bb33', fontWeight: 700, fontSize: '13px', cursor: 'pointer', padding: 0, opacity: resendLoading ? 0.6 : 1 }}
                        >
                          {resendLoading ? 'Sending...' : 'Resend OTP'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Buttons — hidden on step 5 (OTP has its own button) */}
                  {step < 5 && <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                    {step > 0 && (
                      <button
                        onClick={prevStep}
                        style={{ flex: 1, minHeight: '48px', background: 'transparent', border: '1px solid #e2e8f0', borderRadius: '50px', fontWeight: 600, fontSize: '14px', color: '#64748b', cursor: 'pointer' }}
                      >
                        ← Back
                      </button>
                    )}
                    {step < 4 ? (
                      <button
                        onClick={nextStep}
                        disabled={loading}
                        className="rbt-btn btn-gradient radius-round"
                        style={{ flex: 1, minHeight: '48px', opacity: loading ? 0.7 : 1 }}
                      >
                        {loading && step === 0
                          ? <CircularProgress size={16} style={{ color: '#fff' }} />
                          : step === 0 ? 'Continue' : 'Next →'}
                      </button>
                    ) : (
                      loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', flex: 1 }}>
                          <CircularProgress size={24} />
                        </Box>
                      ) : (
                        <button
                          onClick={handleSubmit}
                          className="rbt-btn btn-gradient radius-round"
                          style={{ flex: 1, minHeight: '48px' }}
                        >
                          Submit Registration
                        </button>
                      )
                    )}
                  </div>}

                  <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                    <Link href="/login" style={{ fontSize: '13px', color: '#64748b', textDecoration: 'none', fontWeight: 600 }}>
                      Already have an account? <span style={{ color: '#22bb33' }}>Login here</span>
                    </Link>
                  </div>
                </div>{/* end form body */}
              </div>{/* end card */}
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
