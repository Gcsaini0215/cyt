import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import MyNavbar from "../components/navbar";
import RegistrationHeader from "../components/therapist/registration-header";
import NewsLetter from "../components/home/newsletter";
import Footer from "../components/footer";
import { therapistRegistrationUrl, verifyOtpUrl, checkTherapistEmailUrl, checkTherapistStatusUrl, resendTherapistOtpUrl } from "../utils/url";
import { postData, postFormData } from "../utils/actions";

const PROFILE_TYPES = ["Counselling Psychologist", "Psychiatrist", "Clinical Psychologist", "Special Educator"];
const MODES = [
  { label: "Virtual", value: "1", icon: "feather-video" },
  { label: "In-Person", value: "2", icon: "feather-map-pin" },
  { label: "Both", value: "3", icon: "feather-globe" },
];
const EXPERTISE = [
  "Prescribe Medication (Only for Psychiatrist)",
  "Individual Counselling",
  "Couple Counselling",
  "Teen Counselling",
  "Workshops / Events",
  "Internship / Training",
];
const ID_CARD_TYPES = ["Aadhar Card", "PAN Card", "Voter ID", "Passport", "Driving License"];

const JOURNEY_STEPS = [
  { label: "Application", icon: "feather-edit-3" },
  { label: "Review",      icon: "feather-search" },
  { label: "Approval",    icon: "feather-shield" },
  { label: "Payment",     icon: "feather-credit-card" },
  { label: "Live",        icon: "feather-zap" },
];

function JourneySteps({ current, isMobile }) {
  const circleSize = isMobile ? 22 : 28;
  return (
    <div style={{ background: "#fff", border: "1px solid #dbe3df", borderRadius: 4, borderTop: "3px solid #d4af37", padding: isMobile ? "10px 10px" : "12px 20px", marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: isMobile ? "flex-start" : "center" }}>
        {JOURNEY_STEPS.map((s, i) => {
          const done = i < current;
          const active = i === current;
          const state = done ? "done" : active ? "active" : "upcoming";
          const color = state === "upcoming" ? "#cbd5c9" : "#0f3d24";
          return (
            <React.Fragment key={s.label}>
              <div style={{
                display: "flex", flexDirection: isMobile ? "column" : "row",
                alignItems: "center", gap: isMobile ? 3 : 7, flex: 1, minWidth: 0, justifyContent: "center",
              }}>
                <div style={{
                  width: circleSize, height: circleSize, borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: state === "done" ? "#0f3d24" : state === "active" ? "#f0fdf4" : "#fff",
                  border: `2px solid ${state === "active" ? "#228756" : color}`,
                  boxShadow: state === "active" ? "0 0 0 3px rgba(34,135,86,0.12)" : "none",
                  transition: "all 0.2s",
                }}>
                  {state === "done"
                    ? <i className="feather-check" style={{ fontSize: isMobile ? 10 : 12, color: "#fff" }}></i>
                    : <i className={s.icon} style={{ fontSize: isMobile ? 10 : 12, color: state === "active" ? "#228756" : "#94a3b8" }}></i>}
                </div>
                <span style={{
                  fontSize: isMobile ? 8.5 : 12, fontWeight: state === "upcoming" ? 600 : 800,
                  color: state === "upcoming" ? "#94a3b8" : "#0f3d24",
                  whiteSpace: "nowrap",
                }}>{s.label}</span>
              </div>
              {i < JOURNEY_STEPS.length - 1 && (
                <div style={{
                  flex: isMobile ? "0 0 8px" : "0 0 20px", height: 2, minWidth: isMobile ? 8 : 20,
                  alignSelf: isMobile ? "flex-start" : "center",
                  marginTop: isMobile ? circleSize / 2 - 1 : 0,
                  background: i < current ? "#0f3d24" : "#e2e8f0", transition: "background 0.2s",
                }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

const EMPTY = {
  name: "", email: "", phone: "",
  profileType: "", mode: "",
  checkedValues: [],
  resumeFile: null, qualificationCertFile: null, idCardFile: null, idCardType: "",
  agreeTerms: false,
};

function validate(f) {
  if (!f.name.trim() || f.name.trim().length < 3)          return "Enter your full name (min 3 chars)";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email))          return "Enter a valid email address";
  if (!/^\d{10}$/.test(f.phone))                             return "Enter a valid 10-digit phone number";
  if (!f.profileType)                                        return "Select your profile type";
  if (!f.mode)                                               return "Select your preferred service mode";
  if (!f.checkedValues.length)                               return "Select at least one area of expertise";
  if (!f.resumeFile)                                         return "Upload your resume";
  if (!f.qualificationCertFile)                              return "Upload your highest qualification certificate";
  if (!f.idCardType)                                         return "Select your ID card type";
  if (!f.idCardFile)                                         return "Upload your ID card";
  if (!f.agreeTerms)                                         return "Please agree to the terms and conditions";
  return null;
}

function CustomSelect({ value, onChange, options, placeholder }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button type="button" onClick={() => setOpen(p => !p)} style={{
        width: "100%", background: "#fff", border: `1.5px solid ${open ? "#228756" : "#cbd5c9"}`,
        borderRadius: 3, padding: "10px 13px", fontSize: 14, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
        textAlign: "left", fontFamily: "inherit", outline: "none",
        boxShadow: open ? "0 0 0 3px rgba(34,135,86,0.08)" : "none",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}>
        <span style={{ color: value ? "#1e293b" : "#94a3b8", fontWeight: value ? 500 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {value || placeholder}
        </span>
        <i className="feather-chevron-down" style={{ fontSize: 14, color: "#94a3b8", flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 300,
          background: "#fff", border: "1.5px solid #cbd5c9", borderRadius: 3,
          boxShadow: "0 8px 28px rgba(0,0,0,0.10)", overflow: "hidden", maxHeight: 220, overflowY: "auto",
        }}>
          {options.map((opt) => (
            <div key={opt} onMouseDown={() => { onChange(opt); setOpen(false); }} style={{
              padding: "9px 14px", cursor: "pointer", fontSize: 13,
              fontWeight: value === opt ? 700 : 400,
              color: value === opt ? "#228756" : "#374151",
              background: value === opt ? "#f0fdf4" : "transparent",
            }}>
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const STAGE_INFO = {
  email_pending: { icon: "feather-mail",         color: "#fbbf24", label: "Email verification pending", text: "Please check your inbox for the OTP to verify your email." },
  review:        { icon: "feather-search",       color: "#38bdf8", label: "Under review",                text: "Your application is with our team for review." },
  approved:      { icon: "feather-check-circle", color: "#4ade80", label: "Approved",                    text: "You're approved! Log in to access your therapist dashboard." },
};

const STAGE_TO_STEP = { email_pending: 0, review: 1, approved: 2 };

function StatusCheckBox({ isMobile, onResult }) {
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState(null);
  const [err, setErr] = React.useState("");
  const [paymentMsg, setPaymentMsg] = React.useState(false);

  const check = async () => {
    setErr(""); setResult(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr("Enter a valid email address"); return; }
    setLoading(true);
    try {
      const res = await postData(checkTherapistStatusUrl, { email });
      setResult(res.data);
      onResult?.(res.data);
    } catch (e) {
      setErr(e.response?.data?.message || "No application found for this email");
    }
    setLoading(false);
  };

  const boxStyle = {
    background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.25)",
    borderRadius: 3, padding: "10px 12px", width: isMobile ? "100%" : 320, flexShrink: 0,
  };

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} style={{
        ...boxStyle, cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
        color: "#fff", fontSize: 12.5, fontWeight: 700, justifyContent: isMobile ? "center" : "flex-start",
      }}>
        <i className="feather-search" style={{ fontSize: 13 }}></i> Already applied? Check status
      </button>
    );
  }

  return (
    <div style={boxStyle}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 10.5, fontWeight: 800, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: 0.6 }}>Check Application Status</span>
        <button type="button" onClick={() => { setOpen(false); setResult(null); setErr(""); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <i className="feather-x" style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}></i>
        </button>
      </div>
      <input
        type="email" value={email} placeholder="you@example.com"
        onChange={e => { setEmail(e.target.value); setErr(""); setResult(null); }}
        onKeyDown={e => e.key === "Enter" && check()}
        style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.95)", border: "none", borderRadius: 3, padding: "8px 10px", fontSize: 12.5, outline: "none", fontFamily: "inherit", marginBottom: 8 }}
      />
      <button type="button" onClick={check} disabled={loading} style={{
        width: "100%", background: "#d4af37", border: "none", borderRadius: 3, padding: "8px 12px",
        color: "#0f3d24", fontWeight: 800, fontSize: 12, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
      }}>
        {loading ? "Checking…" : "Check Status"}
      </button>

      <button type="button" onClick={() => setPaymentMsg(true)} style={{
        width: "100%", marginTop: 8, background: "transparent", border: "1.5px solid rgba(255,255,255,0.35)", borderRadius: 3, padding: "8px 12px",
        color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
      }}>
        <i className="feather-credit-card" style={{ fontSize: 12 }}></i> Make Payment
      </button>
      {paymentMsg && (
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", margin: "8px 0 0", lineHeight: 1.5 }}>
          Payment is enabled once your application is approved — you'll receive a payment link on your registered email at that stage.
        </p>
      )}

      {err && (
        <p style={{ fontSize: 11, color: "#fca5a5", margin: "8px 0 0", fontWeight: 600 }}>{err}</p>
      )}

      {result && (() => {
        const info = STAGE_INFO[result.stage] || STAGE_INFO.review;
        return (
          <div style={{ marginTop: 10, background: "rgba(255,255,255,0.1)", border: `1px solid ${info.color}55`, borderRadius: 3, padding: "9px 10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
              <i className={info.icon} style={{ fontSize: 12, color: info.color }}></i>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>{info.label}</span>
            </div>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", margin: 0, lineHeight: 1.5 }}>{info.text}</p>
            {result.appliedOn && (
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", margin: "6px 0 0" }}>
                Applied on {new Date(result.appliedOn).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            )}
          </div>
        );
      })()}
    </div>
  );
}

function SuccessScreen({ name, email }) {
  return (
    <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
      <div style={{ maxWidth: 520, width: "100%", textAlign: "center" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#1b5e20,#2ecc71)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <i className="feather-check" style={{ fontSize: 36, color: "#fff" }}></i>
        </div>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: "#1e293b", marginBottom: 12 }}>
          Your Profile Has Been Sent Under Review
        </h2>
        <p style={{ color: "#64748b", fontSize: 15, lineHeight: 1.8, marginBottom: 28 }}>
          Thank you, <strong>{name}</strong>. Your application and documents have been received
          and our team is now reviewing your profile, resume, qualification certificate, and ID.
          You'll hear back within <strong>1–2 business days</strong> on your registered email{" "}
          <strong>{email}</strong>.
        </p>

        <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 14, padding: "18px 20px", marginBottom: 24, textAlign: "left" }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: "#166534", margin: "0 0 4px" }}>Need further assistance?</p>
          <p style={{ fontSize: 12.5, color: "#3f6212", margin: "0 0 12px", lineHeight: 1.6 }}>
            Message us on WhatsApp or email us — our team is happy to help with any questions about your application.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a href="https://wa.me/918077757951?text=Hi%2C%20I%20registered%20as%20a%20therapist%20and%20need%20assistance."
              target="_blank" rel="noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 7, textDecoration: "none", background: "#25D366", color: "#fff", padding: "9px 16px", borderRadius: 10, fontSize: 12.5, fontWeight: 700 }}>
              <i className="feather-message-circle"></i> WhatsApp Us
            </a>
            <a href="mailto:hello@chooseyourtherapist.in"
              style={{ display: "inline-flex", alignItems: "center", gap: 7, textDecoration: "none", background: "#fff", color: "#166534", border: "1.5px solid #86efac", padding: "9px 16px", borderRadius: 10, fontSize: 12.5, fontWeight: 700 }}>
              <i className="feather-mail"></i> hello@chooseyourtherapist.in
            </a>
          </div>
        </div>

        <Link href="/" style={{
          textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8,
          padding: "13px 28px", borderRadius: 12,
          background: "linear-gradient(135deg,#1b5e20,#228756)",
          color: "#fff", fontWeight: 700, fontSize: 14,
          boxShadow: "0 4px 14px rgba(34,135,86,0.25)",
        }}>
          <i className="feather-home"></i> Go to Home
        </Link>
      </div>
    </div>
  );
}

export default function TherapistRegistration() {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [checkedStage, setCheckedStage] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 992);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleReview = async (e) => {
    e.preventDefault();
    setError("");
    const err = validate(form);
    if (err) { setError(err); window.scrollTo({ top: 0, behavior: "smooth" }); return; }

    setLoading(true);
    try {
      await postData(checkTherapistEmailUrl, { email: form.email });
    } catch (err2) {
      setLoading(false);
      const msg = err2.response?.data?.message || "";
      if (err2.response?.status === 400 && msg) {
        setError(msg);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      // network/server error — allow to proceed
    }
    setLoading(false);
    setReviewing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    const data = new FormData();
    data.append("resume", form.resumeFile);
    data.append("qualification_certificate", form.qualificationCertFile);
    data.append("id_card", form.idCardFile);
    data.append("idCardType", form.idCardType);
    data.append("name", form.name);
    data.append("phone", form.phone);
    data.append("email", form.email);
    data.append("type", form.profileType);
    data.append("mode", form.mode);
    data.append("serve", form.checkedValues.join(", "));

    try {
      const response = await postFormData(therapistRegistrationUrl, data);
      if (response.status) {
        setRegisteredEmail(form.email);
        setReviewing(false);
        setOtpStep(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setError("Something went wrong");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
    setLoading(false);
  };

  const handleOtpChange = (value) => setOtp(value.replace(/\D/g, "").trim().slice(0, 6));

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

  const verifyOtp = async () => {
    setOtpError("");
    if (otp.length !== 6) return setOtpError("Please enter valid OTP");
    try {
      setLoading(true);
      const response = await postData(verifyOtpUrl, { email: registeredEmail, otp: otp.trim() });
      if (response.status) {
        setOtp("");
        setOtpStep(false);
        setSubmitted(true);
      } else {
        setOtpError(response.message || "Invalid OTP");
      }
    } catch (err) {
      setOtpError(err.response?.data?.message || "OTP verification failed. Please try again.");
    }
    setLoading(false);
  };

  const inputStyle = {
    width: "100%", background: "#fff", border: "1.5px solid #cbd5c9",
    borderRadius: 3, padding: "10px 13px", fontSize: 14, color: "#1e293b",
    outline: "none", transition: "border-color 0.2s",
    fontFamily: "inherit",
  };
  const labelStyle = { fontSize: 11.5, fontWeight: 700, color: "#3f4d47", marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: "0.4px" };
  const sectionHead = { fontSize: 13.5, fontWeight: 800, color: "#0f3d24", marginBottom: 20, paddingBottom: 12, borderBottom: "2px solid #0f3d24", display: "flex", alignItems: "center", gap: 12, textTransform: "uppercase", letterSpacing: "0.8px" };
  const sectionNum = { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: 4, background: "#0f3d24", color: "#fff", fontSize: 12, fontWeight: 900, flexShrink: 0, letterSpacing: 0, textTransform: "none" };
  const fieldWrap = { marginBottom: 18 };
  const gridTwo = { display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "0 18px", alignItems: "start" };

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

      <style dangerouslySetInnerHTML={{ __html: `
        input:focus, select:focus, textarea:focus { border-color: #228756 !important; box-shadow: 0 0 0 3px rgba(34,135,86,0.08) !important; }
        .req { color: #ef4444; }
        .section-card { background: #fff; border: 1px solid #dbe3df; border-radius: 4px; padding: 26px 28px; margin-bottom: 20px; }
        @media (max-width: 991px) { .section-card { padding: 18px 16px; } }
        @keyframes trspin { to { transform: rotate(360deg); } }

        .af-doc { border: 1px solid #dbe3df; border-radius: 4px; background: #fff; overflow: hidden; }
        .af-titlebar { background: #0f3d24; text-align: left; padding: 18px 24px; border-radius: 4px 4px 0 0; border-bottom: 3px solid #d4af37; }
        .af-titlebar-eyebrow { font-size: 10.5px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.65) !important; margin: 0 0 4px; }
        .af-titlebar-title { font-size: 18px; font-weight: 800; letter-spacing: 0.6px; text-transform: uppercase; margin: 0; color: #ffffff !important; }
        .af-titlebar-sub { font-size: 12px; color: rgba(255,255,255,0.7) !important; margin: 6px 0 0; }
        .af-notice { display: flex; gap: 10px; align-items: flex-start; background: #fffbeb; border: 1px solid #fde68a; border-left: 3px solid #d4af37; border-radius: 3px; padding: 12px 14px; margin: 18px; font-size: 11.5px; color: #78350f; line-height: 1.6; }
      ` }} />

      <MyNavbar />
      <RegistrationHeader />

      <div className="container" style={{ padding: isMobile ? "32px 16px" : "48px 24px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <JourneySteps current={checkedStage ? (STAGE_TO_STEP[checkedStage] ?? (submitted ? 1 : 0)) : (submitted ? 1 : 0)} isMobile={isMobile} />
        </div>
        {submitted ? (
          <SuccessScreen name={form.name} email={registeredEmail} />
        ) : otpStep ? (
          /* ── OTP VERIFICATION ── */
          <div style={{ maxWidth: 480, margin: "0 auto" }}>
            <div className="af-doc">
              <div className="af-titlebar">
                <p className="af-titlebar-eyebrow">Choose Your Therapist</p>
                <h1 className="af-titlebar-title">Verify Your Email</h1>
                <p className="af-titlebar-sub">Final step to complete your registration</p>
              </div>
              <div style={{ padding: "26px 28px" }}>
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#f0fdf4", border: "2px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                    <i className="feather-mail" style={{ fontSize: 22, color: "#166534" }}></i>
                  </div>
                  <p style={{ fontSize: 13, color: "#64748b", margin: 0, lineHeight: 1.6 }}>
                    We've sent a 6-digit code to<br />
                    <strong style={{ color: "#166534" }}>{registeredEmail}</strong>
                  </p>
                </div>

                <div style={{ background: "#f8fafc", border: "1px solid #dbe3df", borderRadius: 3, padding: "18px 14px", marginBottom: 16 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", textAlign: "center", margin: "0 0 12px" }}>Enter Verification Code</p>
                  <input
                    type="text" inputMode="numeric" placeholder="• • • • • •"
                    value={otp} onChange={(e) => handleOtpChange(e.target.value)} maxLength={6}
                    style={{
                      width: "100%", padding: 14, border: "1.5px solid #cbd5c9", borderRadius: 3,
                      fontSize: isMobile ? 24 : 28, fontWeight: 800, letterSpacing: isMobile ? 10 : 14, textAlign: "center",
                      boxSizing: "border-box", outline: "none", color: "#111827", background: "#fff", fontFamily: "inherit",
                    }}
                  />
                </div>

                {otpError && <p style={{ color: "#dc2626", fontSize: 13, marginBottom: 8, textAlign: "center", fontWeight: 600 }}>{otpError}</p>}
                {resendMsg && <p style={{ color: "#228756", fontSize: 13, marginBottom: 8, textAlign: "center", fontWeight: 600 }}>{resendMsg}</p>}

                <button onClick={verifyOtp} disabled={loading}
                  style={{ width: "100%", padding: "14px", borderRadius: 3, border: "none", background: "linear-gradient(135deg,#1b5e20,#228756)", color: "#fff", fontSize: 14, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  {loading
                    ? <><span style={{ width: 18, height: 18, border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "trspin 0.8s linear infinite" }}></span> Verifying...</>
                    : <><i className="feather-check-circle"></i> Verify &amp; Complete Registration</>}
                </button>

                <p style={{ textAlign: "center", marginTop: 14, fontSize: 13, color: "#94a3b8" }}>
                  Didn't receive the code?{" "}
                  <button onClick={resendOtp} disabled={resendLoading}
                    style={{ background: "none", border: "none", color: "#228756", fontWeight: 700, fontSize: 13, cursor: "pointer", padding: 0, opacity: resendLoading ? 0.6 : 1 }}>
                    {resendLoading ? "Sending..." : "Resend"}
                  </button>
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: 860, margin: "0 auto" }}>
            <div className="af-doc" style={{ marginBottom: 24 }}>
              <div className="af-titlebar" style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "stretch" : "flex-start", justifyContent: "space-between", gap: isMobile ? 14 : 20 }}>
                <div>
                  <p className="af-titlebar-eyebrow">Choose Your Therapist</p>
                  <h1 className="af-titlebar-title">Therapist Registration Form</h1>
                  <p className="af-titlebar-sub">Join our network of verified mental health professionals</p>
                </div>
                <StatusCheckBox isMobile={isMobile} onResult={(data) => setCheckedStage(data?.stage || null)} />
              </div>
              <div className="af-notice">
                <i className="feather-alert-circle" style={{ fontSize: 14, marginTop: 1, flexShrink: 0 }}></i>
                <span>Please read all instructions carefully before filling this form. Fields marked <strong>*</strong> are mandatory. Applications with incomplete or unclear documents may be rejected.</span>
              </div>
            </div>

            {reviewing ? (
              /* ── REVIEW SCREEN ── */
              <div>
                <h2 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 900, color: "#1e293b", margin: "0 0 4px" }}>Review Your Application</h2>
                <p style={{ color: "#64748b", fontSize: 13, marginBottom: 24 }}>Please review all details before submitting.</p>

                {error && (
                  <div style={{ background: "#fef2f2", border: "1.5px solid #fca5a5", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#dc2626", fontWeight: 600, display: "flex", gap: 8, alignItems: "center" }}>
                    <i className="feather-alert-circle"></i> {error}
                  </div>
                )}

                {[
                  { title: "Personal Details", icon: "feather-user", color: "#228756", rows: [
                    ["Full Name", form.name], ["Email", form.email], ["Phone", form.phone],
                  ]},
                  { title: "Professional Profile", icon: "feather-briefcase", color: "#0ea5e9", rows: [
                    ["Profile Type", form.profileType],
                    ["Service Mode", MODES.find(m => m.value === form.mode)?.label || "—"],
                  ]},
                  { title: "Areas of Expertise", icon: "feather-check-square", color: "#8b5cf6", rows: [
                    ["Selected Services", form.checkedValues.join(", ")],
                  ]},
                ].map((section, si) => (
                  <div key={si} className="section-card" style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, paddingBottom: 10, borderBottom: "1.5px solid #f1f5f9" }}>
                      <div style={{ width: 26, height: 26, borderRadius: 7, background: section.color + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <i className={section.icon} style={{ fontSize: 13, color: section.color }}></i>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>{section.title}</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "10px 24px" }}>
                      {section.rows.map(([label, val], ri) => (
                        <div key={ri} style={section.rows.length === 1 ? { gridColumn: "1 / -1" } : undefined}>
                          <span style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</span>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", margin: "3px 0 0", wordBreak: "break-word", lineHeight: 1.5 }}>{val || "—"}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Documents */}
                <div className="section-card" style={{ marginBottom: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, paddingBottom: 10, borderBottom: "1.5px solid #f1f5f9" }}>
                    <div style={{ width: 26, height: 26, borderRadius: 7, background: "#fffbeb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <i className="feather-upload-cloud" style={{ fontSize: 13, color: "#f59e0b" }}></i>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>Verification Documents</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      { label: "Resume / CV", file: form.resumeFile, icon: "feather-file-text" },
                      { label: "Highest Qualification Certificate", file: form.qualificationCertFile, icon: "feather-award" },
                      { label: `ID Card${form.idCardType ? ` (${form.idCardType})` : ""}`, file: form.idCardFile, icon: "feather-credit-card" },
                    ].map(({ label, file, icon }) => (
                      <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <i className={icon} style={{ fontSize: 14, color: file ? "#228756" : "#cbd5e1", flexShrink: 0 }}></i>
                        <div>
                          <span style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", display: "block" }}>{label}</span>
                          <span style={{ fontSize: 13, color: file ? "#374151" : "#94a3b8" }}>{file ? file.name : "Not uploaded"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button type="button" onClick={() => { setReviewing(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    style={{ flex: 1, minWidth: 120, padding: "14px", borderRadius: 3, border: "1.5px solid #cbd5c9", background: "#fff", color: "#374151", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <i className="feather-edit-2"></i> Edit Details
                  </button>
                  <button type="button" onClick={handleSubmit} disabled={loading}
                    style={{ flex: 2, minWidth: 180, padding: "14px", borderRadius: 3, border: "none", background: "linear-gradient(135deg,#1b5e20,#228756)", color: "#fff", fontSize: 14, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                    {loading
                      ? <><span style={{ width: 18, height: 18, border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "trspin 0.8s linear infinite" }}></span> Submitting...</>
                      : <><i className="feather-send"></i> Confirm &amp; Submit</>}
                  </button>
                </div>
              </div>
            ) : (
              /* ── MAIN FORM ── */
              <form onSubmit={handleReview} noValidate>
                <h2 style={{ fontSize: isMobile ? 17 : 19, fontWeight: 800, color: "#0f3d24", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Applicant Details</h2>
                <p style={{ color: "#64748b", fontSize: 13, marginBottom: 24 }}>
                  Fill in the details below. Fields marked <span className="req">*</span> are required.
                </p>

                {error && (
                  <div style={{ background: "#fef2f2", border: "1.5px solid #fca5a5", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#dc2626", fontWeight: 600, display: "flex", gap: 8, alignItems: "center" }}>
                    <i className="feather-alert-circle"></i> {error}
                  </div>
                )}

                {/* ── Section 1: Personal ── */}
                <div className="section-card">
                  <div style={sectionHead}>
                    <span style={sectionNum}>01</span>
                    Personal Details
                  </div>

                  <div style={gridTwo}>
                    <div style={fieldWrap}>
                      <label style={labelStyle}>Full Name <span className="req">*</span></label>
                      <input style={inputStyle} type="text" placeholder="Full name" value={form.name} onChange={e => set("name", e.target.value)} />
                    </div>
                    <div style={fieldWrap}>
                      <label style={labelStyle}>Email Address <span className="req">*</span></label>
                      <input style={inputStyle} type="email" placeholder="you@example.com" value={form.email} onChange={e => set("email", e.target.value)} />
                    </div>
                  </div>
                  <div style={fieldWrap}>
                    <label style={labelStyle}>Phone Number <span className="req">*</span></label>
                    <input style={{ ...inputStyle, maxWidth: isMobile ? "100%" : "calc(50% - 9px)" }} type="tel" placeholder="10-digit number" maxLength={10}
                      value={form.phone} onChange={e => set("phone", e.target.value.replace(/\D/g, ""))} />
                  </div>
                </div>

                {/* ── Section 2: Professional Profile ── */}
                <div className="section-card">
                  <div style={sectionHead}>
                    <span style={sectionNum}>02</span>
                    Professional Profile
                  </div>

                  <div style={fieldWrap}>
                    <label style={labelStyle}>Profile Type <span className="req">*</span></label>
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr 1fr", gap: 8 }}>
                      {PROFILE_TYPES.map(opt => {
                        const checked = form.profileType === opt;
                        return (
                          <div key={opt} onClick={() => set("profileType", opt)} style={{
                            border: `1.5px solid ${checked ? "#228756" : "#cbd5c9"}`,
                            borderRadius: 3, padding: "10px 8px", cursor: "pointer", textAlign: "center",
                            background: checked ? "#f0fdf4" : "#fff", transition: "all 0.15s",
                          }}>
                            <span style={{ fontSize: 12, fontWeight: checked ? 700 : 500, color: checked ? "#166534" : "#475569", lineHeight: 1.3 }}>{opt}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div style={fieldWrap}>
                    <label style={labelStyle}>Preferred Service Mode <span className="req">*</span></label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                      {MODES.map(m => {
                        const checked = form.mode === m.value;
                        return (
                          <div key={m.value} onClick={() => set("mode", m.value)} style={{
                            border: `1.5px solid ${checked ? "#228756" : "#cbd5c9"}`,
                            borderRadius: 3, padding: "12px 8px", cursor: "pointer", textAlign: "center",
                            background: checked ? "#f0fdf4" : "#fff", transition: "all 0.15s",
                            display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                          }}>
                            <i className={m.icon} style={{ fontSize: 18, color: checked ? "#228756" : "#94a3b8" }}></i>
                            <span style={{ fontSize: 12, fontWeight: checked ? 700 : 500, color: checked ? "#166534" : "#475569" }}>{m.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* ── Section 3: Expertise ── */}
                <div className="section-card">
                  <div style={sectionHead}>
                    <span style={sectionNum}>03</span>
                    Areas of Expertise
                  </div>
                  <p style={{ fontSize: 13, color: "#64748b", marginTop: -8, marginBottom: 14 }}>Select all the services you are interested to offer.</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {EXPERTISE.map((val) => {
                      const checked = form.checkedValues.includes(val);
                      return (
                        <label key={val} style={{
                          display: "flex", alignItems: "center", gap: 9, padding: "11px 14px",
                          borderRadius: 3, cursor: "pointer", userSelect: "none",
                          border: `1.5px solid ${checked ? "#228756" : "#cbd5c9"}`,
                          background: checked ? "#f0fdf4" : "#fff", transition: "all 0.15s",
                        }}>
                          <span style={{
                            width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                            border: `2px solid ${checked ? "#228756" : "#cbd5e1"}`,
                            background: checked ? "#228756" : "#fff",
                            display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s",
                          }}>
                            {checked && <i className="feather-check" style={{ fontSize: 10, color: "#fff" }}></i>}
                          </span>
                          <input type="checkbox" checked={checked} style={{ display: "none" }}
                            onChange={() => {
                              const next = checked ? form.checkedValues.filter(v => v !== val) : [...form.checkedValues, val];
                              set("checkedValues", next);
                            }} />
                          <span style={{ fontSize: 13, fontWeight: checked ? 700 : 500, color: checked ? "#166534" : "#374151" }}>{val}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* ── Section 4: Verification Documents ── */}
                <div className="section-card">
                  <div style={sectionHead}>
                    <span style={sectionNum}>04</span>
                    Verification Documents
                  </div>
                  <p style={{ fontSize: 13, color: "#64748b", marginTop: -8, marginBottom: 18 }}>
                    We verify every therapist before listing them publicly. Please upload clear, valid documents.
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14, marginBottom: 18 }}>
                    {[
                      { id: "resumeInput", key: "resumeFile", label: "Resume / CV", hint: "PDF, DOC — max 5MB", accept: ".pdf,.doc,.docx", icon: "feather-file-text", color: "#228756", bg: "#f0fdf4" },
                      { id: "qualCertInput", key: "qualificationCertFile", label: "Highest Qualification Certificate", hint: "Degree / diploma certificate — PDF, JPG, PNG — max 5MB", accept: ".pdf,.jpg,.jpeg,.png,.doc,.docx", icon: "feather-award", color: "#0ea5e9", bg: "#f0f9ff" },
                    ].map(({ id, key, label, hint, accept, icon, color, bg }) => (
                      <div key={id}>
                        <label style={{ ...labelStyle, marginBottom: 8 }}>{label} <span className="req">*</span></label>
                        <div
                          onClick={() => document.getElementById(id).click()}
                          onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = color; }}
                          onDragLeave={e => { e.currentTarget.style.borderColor = form[key] ? color : "#e2e8f0"; }}
                          onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) set(key, f); e.currentTarget.style.borderColor = color; }}
                          style={{
                            border: `2px dashed ${form[key] ? color : "#cbd5c9"}`,
                            borderRadius: 3, padding: "18px 12px", textAlign: "center",
                            background: form[key] ? bg : "#fafafa", cursor: "pointer",
                            transition: "all 0.2s", minHeight: 110,
                            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
                          }}>
                          <input id={id} type="file" accept={accept} style={{ display: "none" }}
                            onChange={e => set(key, e.target.files?.[0] || null)} />
                          <i className={icon} style={{ fontSize: 24, color: form[key] ? color : "#94a3b8" }}></i>
                          <span style={{ fontSize: 12, fontWeight: 700, color: form[key] ? color : "#64748b", wordBreak: "break-all", padding: "0 4px" }}>
                            {form[key] ? `✓ ${form[key].name}` : "Click or drag & drop"}
                          </span>
                          <span style={{ fontSize: 10, color: "#94a3b8" }}>{hint}</span>
                        </div>
                        {form[key] && (
                          <button type="button" onClick={() => set(key, null)}
                            style={{ marginTop: 4, background: "none", border: "none", fontSize: 11, color: "#ef4444", cursor: "pointer", fontWeight: 600 }}>
                            ✕ Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* ID card: type selector + upload */}
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "220px 1fr", gap: 14, alignItems: "start" }}>
                    <div style={fieldWrap}>
                      <label style={labelStyle}>ID Card Type <span className="req">*</span></label>
                      <CustomSelect value={form.idCardType} onChange={v => set("idCardType", v)} placeholder="e.g. Aadhar, PAN" options={ID_CARD_TYPES} />
                      <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 8, lineHeight: 1.6 }}>
                        Any government-issued photo ID such as Aadhar Card or PAN Card is accepted.
                      </p>
                    </div>
                    <div>
                      <label style={{ ...labelStyle, marginBottom: 8 }}>Upload ID Card <span className="req">*</span></label>
                      <div
                        onClick={() => document.getElementById("idCardInput").click()}
                        onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = "#8b5cf6"; }}
                        onDragLeave={e => { e.currentTarget.style.borderColor = form.idCardFile ? "#8b5cf6" : "#e2e8f0"; }}
                        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) set("idCardFile", f); e.currentTarget.style.borderColor = "#8b5cf6"; }}
                        style={{
                          border: `2px dashed ${form.idCardFile ? "#8b5cf6" : "#cbd5c9"}`,
                          borderRadius: 3, padding: "18px 12px", textAlign: "center",
                          background: form.idCardFile ? "#f5f3ff" : "#fafafa", cursor: "pointer",
                          transition: "all 0.2s", minHeight: 78,
                          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
                        }}>
                        <input id="idCardInput" type="file" accept=".jpg,.jpeg,.png,.pdf" style={{ display: "none" }}
                          onChange={e => set("idCardFile", e.target.files?.[0] || null)} />
                        <i className="feather-credit-card" style={{ fontSize: 22, color: form.idCardFile ? "#8b5cf6" : "#94a3b8" }}></i>
                        <span style={{ fontSize: 12, fontWeight: 700, color: form.idCardFile ? "#8b5cf6" : "#64748b", wordBreak: "break-all", padding: "0 4px" }}>
                          {form.idCardFile ? `✓ ${form.idCardFile.name}` : "Click or drag & drop — JPG, PNG, PDF · max 5MB"}
                        </span>
                      </div>
                      {form.idCardFile && (
                        <button type="button" onClick={() => set("idCardFile", null)}
                          style={{ marginTop: 4, background: "none", border: "none", fontSize: 11, color: "#ef4444", cursor: "pointer", fontWeight: 600 }}>
                          ✕ Remove
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Terms */}
                  <label style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer", marginTop: 20, padding: "14px 16px", borderRadius: 3, border: `1.5px solid ${form.agreeTerms ? "#86efac" : "#cbd5c9"}`, background: form.agreeTerms ? "#f0fdf4" : "#fafafa", transition: "all 0.2s" }}>
                    <input type="checkbox" checked={form.agreeTerms} onChange={e => set("agreeTerms", e.target.checked)} style={{ display: "none" }} />
                    <div style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1, border: `2px solid ${form.agreeTerms ? "#228756" : "#cbd5e1"}`, background: form.agreeTerms ? "#228756" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
                      {form.agreeTerms && <i className="feather-check" style={{ fontSize: 12, color: "#fff" }}></i>}
                    </div>
                    <span style={{ fontSize: 12, color: form.agreeTerms ? "#166534" : "#475569", lineHeight: 1.7, fontWeight: form.agreeTerms ? 600 : 400 }}>
                      I agree to the{" "}
                      <Link href="/terms-conditions" style={{ color: "#228756", fontWeight: 700 }}>Terms &amp; Conditions</Link>{" "}
                      and{" "}
                      <Link href="/privacy-policy" style={{ color: "#228756", fontWeight: 700 }}>Privacy Policy</Link>.
                      I confirm that all information and documents provided are accurate, valid, and belong to me.
                    </span>
                  </label>

                  <div style={{ marginTop: 14, background: "#f8fafc", border: "1px solid #dbe3df", borderRadius: 3, padding: "14px 16px" }}>
                    <p style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.6px", margin: "0 0 10px", display: "flex", alignItems: "center", gap: 6 }}>
                      <i className="feather-info" style={{ fontSize: 12 }}></i> Before You Submit
                    </p>
                    <ul style={{ margin: 0, padding: "0 0 0 18px", display: "flex", flexDirection: "column", gap: 8 }}>
                      {[
                        "Applications are reviewed within 1–2 business days of submission.",
                        "Keep your Resume, Qualification Certificate, and ID Card clear and valid — blurry or incomplete documents can delay approval.",
                        "Your ID Card is used only for identity verification and is never shown on your public profile.",
                        "You will be notified of approval on your registered email and phone number.",
                      ].map((t, i) => (
                        <li key={i} style={{ fontSize: 12, color: "#475569", lineHeight: 1.6 }}>{t}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  style={{
                    width: "100%", background: "linear-gradient(135deg, #1b5e20, #228756)",
                    color: "#fff", border: "none", borderRadius: 3, padding: "15px 40px",
                    fontSize: 15, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1, letterSpacing: "0.3px", display: "flex",
                    alignItems: "center", justifyContent: "center", gap: 10,
                  }}>
                  {loading ? (
                    <>
                      <span style={{ width: 18, height: 18, border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "trspin 0.8s linear infinite" }}></span>
                      Checking...
                    </>
                  ) : (
                    <>
                      <i className="feather-save"></i> Review Application
                    </>
                  )}
                </button>

                <div style={{ textAlign: "center", marginTop: 20, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
                  <Link href="/login" style={{ fontSize: 13, color: "#64748b", textDecoration: "none", fontWeight: 600 }}>
                    Already have an account? <span style={{ color: "#228756" }}>Login here</span>
                  </Link>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      <NewsLetter />
      <Footer />
    </>
  );
}
